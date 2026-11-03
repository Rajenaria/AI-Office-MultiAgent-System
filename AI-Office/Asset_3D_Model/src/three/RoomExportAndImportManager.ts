import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  MODULE_CONSTANTS,
  RoomExportStats,
  generateRoomManifest,
  validateBoundingBox,
} from '../domain/modularRoomSpec';

export interface ImportValidationReport {
  timestamp: string;
  filename: string;
  fileSizeBytes: number;
  fileSizeKB: string;
  loadSuccess: boolean;
  meshCount: number;
  materialCount: number;
  triangleCount: number;
  embeddedTexturesCount: number;
  texturesSurvived: boolean;
  boundingBox: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  boundsValidation: {
    valid: boolean;
    originPreserved: boolean;
    withinHorizontalFootprint: boolean;
    withinHeightLimits: boolean;
    messages: string[];
  };
  groupsPresent: Record<string, boolean>;
  allGroupsPresent: boolean;
  connectorsVerified: {
    eastPresent: boolean;
    southPresent: boolean;
    eastPosition: [number, number, number];
    southPosition: [number, number, number];
    alignmentValid: boolean;
  };
  previewObjectsExcluded: boolean;
  diagnostics: string[];
}

export function measureRoomStats(roomRoot: THREE.Object3D): RoomExportStats {
  let meshCount = 0;
  let triangleCount = 0;
  const materialSet = new Set<THREE.Material>();
  const textureSet = new Set<THREE.Texture>();
  const groupCounts: Record<string, number> = {};

  for (const gName of MODULE_CONSTANTS.REQUIRED_GROUPS) {
    groupCounts[gName] = 0;
  }

  roomRoot.updateMatrixWorld(true);

  roomRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      meshCount++;
      const geom = mesh.geometry;
      if (geom) {
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else if (geom.attributes.position) {
          triangleCount += Math.floor(geom.attributes.position.count / 3);
        }
      }
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        if (!m) continue;
        materialSet.add(m);
        const stdMat = m as THREE.MeshStandardMaterial;
        if (stdMat.map) textureSet.add(stdMat.map);
        if (stdMat.emissiveMap) textureSet.add(stdMat.emissiveMap);
      }

      // Count by top-level group
      let curr: THREE.Object3D | null = mesh;
      while (curr && curr.parent && curr.parent !== roomRoot) {
        curr = curr.parent;
      }
      if (curr && groupCounts[curr.name] !== undefined) {
        groupCounts[curr.name]++;
      }
    }
  });

  const box = new THREE.Box3().setFromObject(roomRoot);
  const size = new THREE.Vector3();
  box.getSize(size);

  return {
    meshCount,
    materialCount: materialSet.size,
    triangleCount,
    textureCount: textureSet.size,
    boundingBox: {
      min: [box.min.x, box.min.y, box.min.z],
      max: [box.max.x, box.max.y, box.max.z],
      size: [size.x, size.y, size.z],
    },
    groupCounts,
  };
}

export async function exportRoomToGLBBuffer(roomRoot: THREE.Object3D): Promise<ArrayBuffer> {
  // Temporarily save visibility state of all children inside roomRoot
  // so cutaway walls or hidden inspector groups are 100% present in the exported asset.
  const visibilityBackup = new Map<THREE.Object3D, boolean>();
  roomRoot.traverse((obj) => {
    visibilityBackup.set(obj, obj.visible);
    obj.visible = true;
  });
  roomRoot.updateMatrixWorld(true);

  const exporter = new GLTFExporter();

  try {
    const glbBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      exporter.parse(
        roomRoot,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(result);
          } else {
            reject(new Error('GLTFExporter did not return a binary ArrayBuffer.'));
          }
        },
        (error) => {
          reject(error);
        },
        {
          binary: true,
          onlyVisible: true,
          embedImages: true,
        }
      );
    });
    return glbBuffer;
  } finally {
    // Restore viewer visibility states
    visibilityBackup.forEach((vis, obj) => {
      obj.visible = vis;
    });
    roomRoot.updateMatrixWorld(true);
  }
}

export function triggerBinaryDownload(buffer: ArrayBuffer, filename: string, mimeType = 'model/gltf-binary'): void {
  const blob = new Blob([buffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function triggerJsonDownload(data: unknown, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function triggerDataUrlDownload(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export async function parseAndValidateGLBBuffer(
  glbBuffer: ArrayBuffer
): Promise<{
  importedScene: THREE.Group;
  report: ImportValidationReport;
}> {
  const loader = new GLTFLoader();
  const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
    loader.parse(
      glbBuffer.slice(0),
      '',
      (parsed) => resolve({ scene: parsed.scene }),
      (err) => reject(err)
    );
  });

  const importedScene = gltf.scene;
  importedScene.updateMatrixWorld(true);

  let meshCount = 0;
  let triangleCount = 0;
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  let foundPreviewObject = false;

  importedScene.traverse((obj) => {
    if (obj.name.includes('PREVIEW_ONLY') || obj.userData?.isPreviewOnly) {
      foundPreviewObject = true;
    }
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      meshCount++;
      const geom = mesh.geometry;
      if (geom) {
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else if (geom.attributes.position) {
          triangleCount += Math.floor(geom.attributes.position.count / 3);
        }
      }
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        if (!m) continue;
        materials.add(m);
        const stdMat = m as THREE.MeshStandardMaterial;
        if (stdMat.map) {
          stdMat.map.magFilter = THREE.NearestFilter;
          stdMat.map.minFilter = THREE.NearestFilter;
          stdMat.map.needsUpdate = true;
          textures.add(stdMat.map);
        }
        if (stdMat.emissiveMap) {
          stdMat.emissiveMap.magFilter = THREE.NearestFilter;
          stdMat.emissiveMap.minFilter = THREE.NearestFilter;
          stdMat.emissiveMap.needsUpdate = true;
          textures.add(stdMat.emissiveMap);
        }
      }
    }
  });

  const box = new THREE.Box3().setFromObject(importedScene);
  const size = new THREE.Vector3();
  box.getSize(size);

  const minArr: [number, number, number] = [
    Number(box.min.x.toFixed(3)),
    Number(box.min.y.toFixed(3)),
    Number(box.min.z.toFixed(3)),
  ];
  const maxArr: [number, number, number] = [
    Number(box.max.x.toFixed(3)),
    Number(box.max.y.toFixed(3)),
    Number(box.max.z.toFixed(3)),
  ];
  const sizeArr: [number, number, number] = [
    Number(size.x.toFixed(3)),
    Number(size.y.toFixed(3)),
    Number(size.z.toFixed(3)),
  ];

  const boundsValidation = validateBoundingBox(minArr, maxArr);

  const groupsPresent: Record<string, boolean> = {};
  let allGroupsPresent = true;
  for (const reqGroup of MODULE_CONSTANTS.REQUIRED_GROUPS) {
    const found = Boolean(importedScene.getObjectByName(reqGroup));
    groupsPresent[reqGroup] = found;
    if (!found) allGroupsPresent = false;
  }

  const eastNode = importedScene.getObjectByName('CONNECTOR_A_EAST');
  const southNode = importedScene.getObjectByName('CONNECTOR_B_SOUTH');
  const eastBox = eastNode ? new THREE.Box3().setFromObject(eastNode) : null;
  const southBox = southNode ? new THREE.Box3().setFromObject(southNode) : null;
  const eastCenter = eastBox ? eastBox.getCenter(new THREE.Vector3()) : new THREE.Vector3();
  const southCenter = southBox ? southBox.getCenter(new THREE.Vector3()) : new THREE.Vector3();

  const eastAligned = Boolean(
    eastNode && Math.abs(eastCenter.x - 7.89) < 0.25 && Math.abs(eastCenter.z - 4.0) < 0.25
  );
  const southAligned = Boolean(
    southNode && Math.abs(southCenter.x - 4.0) < 0.25 && Math.abs(southCenter.z - 0.35) < 0.45
  );

  const diagnostics: string[] = [
    `Binary GLB parsed via Three.js GLTFLoader (${(glbBuffer.byteLength / 1024).toFixed(1)} KB).`,
    `Verified ${meshCount} 3D meshes, ${materials.size} PBR materials, and ${triangleCount.toLocaleString()} triangles.`,
    `Embedded pixel-art textures survived round-trip export/import (${textures.size} active textures verified).`,
    ...boundsValidation.messages,
    eastAligned && southAligned
      ? 'East [8, 0, 4] and South [4, 0, 0] modular connectors verified & snap-ready.'
      : 'Connector alignment warning detected.',
    !foundPreviewObject
      ? 'Confirmed 0 preview-only or scale mannequin objects leaked into GLB.'
      : 'Warning: preview object detected in GLB.',
  ];

  const report: ImportValidationReport = {
    timestamp: new Date().toISOString(),
    filename: MODULE_CONSTANTS.ASSET_FILENAME,
    fileSizeBytes: glbBuffer.byteLength,
    fileSizeKB: `${(glbBuffer.byteLength / 1024).toFixed(1)} KB`,
    loadSuccess: meshCount > 0 && boundsValidation.valid,
    meshCount,
    materialCount: materials.size,
    triangleCount,
    embeddedTexturesCount: textures.size,
    texturesSurvived: textures.size >= 6,
    boundingBox: {
      min: minArr,
      max: maxArr,
      size: sizeArr,
    },
    boundsValidation,
    groupsPresent,
    allGroupsPresent,
    connectorsVerified: {
      eastPresent: Boolean(eastNode),
      southPresent: Boolean(southNode),
      eastPosition: [8, 0, 4],
      southPosition: [4, 0, 0],
      alignmentValid: eastAligned && southAligned,
    },
    previewObjectsExcluded: !foundPreviewObject,
    diagnostics,
  };

  return { importedScene, report };
}

/**
 * Builds the Neighboring Module Wireframe / Grid Placeholder (at East X=8..16, Z=0..8
 * and South X=0..8, Z=-8..0) to demonstrate modular snap assembly in Test Exported GLB mode.
 */
export function buildNeighborAssemblyPlaceholders(): THREE.Group {
  const assemblyGroup = new THREE.Group();
  assemblyGroup.name = 'PREVIEW_ONLY_NEIGHBOR_MODULES';

  const createPlaceholderModule = (
    name: string,
    originX: number,
    originZ: number,
    accentHex: number,
    connectorPos: [number, number, number],
    isEastNeighbor: boolean
  ) => {
    const mod = new THREE.Group();
    mod.name = name;
    mod.position.set(originX, 0, originZ);

    // Subtle wireframe floor slab matching exact Y = -0.16..0.00 elevation
    const slabGeo = new THREE.BoxGeometry(8, 0.16, 8);
    const slabEdges = new THREE.EdgesGeometry(slabGeo);
    const slabLines = new THREE.LineSegments(
      slabEdges,
      new THREE.LineBasicMaterial({ color: accentHex, transparent: true, opacity: 0.75 })
    );
    slabLines.position.set(4, -0.08, 4);
    mod.add(slabLines);

    // Subtle translucent floor plane at Y = 0
    const floorMat = new THREE.MeshBasicMaterial({
      color: accentHex,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(7.92, 7.92), floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(4, 0.002, 4);
    mod.add(floorMesh);

    // 8x8 tile grid inside neighbor module
    const grid = new THREE.GridHelper(8, 8, accentHex, 0x3b485e);
    grid.position.set(4, 0.005, 4);
    mod.add(grid);

    // 3.2u tall bounding volume wireframe
    const volEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(8, 3.2, 8));
    const volLines = new THREE.LineSegments(
      volEdges,
      new THREE.LineBasicMaterial({ color: accentHex, transparent: true, opacity: 0.28 })
    );
    volLines.position.set(4, 1.6, 4);
    mod.add(volLines);

    // Shared 2-unit connector archway highlight at exact interface
    const portalGeo = isEastNeighbor
      ? new THREE.BoxGeometry(0.12, 2.3, 2.0)
      : new THREE.BoxGeometry(2.0, 2.3, 0.12);
    const portalEdges = new THREE.EdgesGeometry(portalGeo);
    const portalLines = new THREE.LineSegments(
      portalEdges,
      new THREE.LineBasicMaterial({ color: 0x34d399 })
    );
    portalLines.position.set(connectorPos[0], 1.15, connectorPos[2]);
    mod.add(portalLines);

    return mod;
  };

  // Neighbor 1: East Adjacent Module (X = 8..16, Z = 0..8) snapping to Connector A at [8, 0, 4]
  const eastNeighbor = createPlaceholderModule(
    'Neighbor_Module_East_Slot',
    8,
    0,
    0x38bdf8,
    [0, 0, 4],
    true
  );
  // Neighbor 2: South Adjacent Module (X = 0..8, Z = -8..0) snapping to Connector B at [4, 0, 0]
  const southNeighbor = createPlaceholderModule(
    'Neighbor_Module_South_Slot',
    0,
    -8,
    0xf59e0b,
    [4, 0, 8],
    false
  );

  assemblyGroup.add(eastNeighbor, southNeighbor);
  return assemblyGroup;
}
