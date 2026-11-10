import * as THREE from 'three';
import {
  ActivityAnchor,
  AnchorId,
  DEFAULT_ACTIVITY_ANCHORS,
  PM_DEMO_ACTIONS,
} from '../domain/pmSimulationSpec';
import {
  buildOriginalRoomNativeBossPMSceneAndClips,
  exportOriginalBossPMToGLBBuffer,
} from '../three/BossPMCharacterSystem';
import {
  buildCEOExecutiveAssistantSceneAndClips,
  exportCEOExecutiveAssistantToGLBBuffer,
} from '../three/CEOCharacterSystem';
import {
  buildUIUXDesignerSceneAndClips,
  exportUIUXDesignerToGLBBuffer,
} from '../three/UIUXCharacterSystem';
import {
  buildFrontendDeveloperSceneAndClips,
  exportFrontendDeveloperToGLBBuffer,
} from '../three/FrontendCharacterSystem';
import {
  buildBackendDeveloperSceneAndClips,
  exportBackendDeveloperToGLBBuffer,
} from '../three/BackendCharacterSystem';
import {
  buildDatabaseDeveloperSceneAndClips,
  exportDatabaseDeveloperToGLBBuffer,
} from '../three/DatabaseCharacterSystem';
import {
  buildResearchProfessorSceneAndClips,
  exportResearchProfessorToGLBBuffer,
} from '../three/ResearchCharacterSystem';
import {
  buildQAEngineerSceneAndClips,
  exportQAEngineerToGLBBuffer,
} from '../three/QACharacterSystem';
import {
  buildDevOpsEngineerSceneAndClips,
  exportDevOpsEngineerToGLBBuffer,
} from '../three/DevOpsCharacterSystem';
import {
  triggerBinaryDownload,
  triggerDataUrlDownload,
  triggerJsonDownload,
} from '../three/RoomExportAndImportManager';
import {
  BossPMBehaviorJsonV1,
  BossPMManifestV1,
  CEOCharacterBehaviorJsonV1,
  CEOCharacterManifestV1,
  UIUXCharacterBehaviorJsonV1,
  UIUXCharacterManifestV1,
  FrontendCharacterBehaviorJsonV1,
  FrontendCharacterManifestV1,
  BackendCharacterBehaviorJsonV1,
  BackendCharacterManifestV1,
  DatabaseCharacterBehaviorJsonV1,
  DatabaseCharacterManifestV1,
  ResearchCharacterBehaviorJsonV1,
  ResearchCharacterManifestV1,
  QACharacterBehaviorJsonV1,
  QACharacterManifestV1,
  DevOpsCharacterBehaviorJsonV1,
  DevOpsCharacterManifestV1,
  PRODUCTION_FILENAMES,
  buildBossPMBehaviorJsonV1,
  buildBossPMManifestV1,
  buildCEOCharacterBehaviorJsonV1,
  buildCEOCharacterManifestV1,
  buildCEOCharacterReadmeMarkdown,
  buildUIUXCharacterBehaviorJsonV1,
  buildUIUXCharacterManifestV1,
  buildUIUXCharacterReadmeMarkdown,
  buildFrontendCharacterBehaviorJsonV1,
  buildFrontendCharacterManifestV1,
  buildFrontendCharacterReadmeMarkdown,
  buildBackendCharacterBehaviorJsonV1,
  buildBackendCharacterManifestV1,
  buildBackendCharacterReadmeMarkdown,
  buildDatabaseCharacterBehaviorJsonV1,
  buildDatabaseCharacterManifestV1,
  buildDatabaseCharacterReadmeMarkdown,
  buildResearchCharacterBehaviorJsonV1,
  buildResearchCharacterManifestV1,
  buildResearchCharacterReadmeMarkdown,
  buildQACharacterBehaviorJsonV1,
  buildQACharacterManifestV1,
  buildQACharacterReadmeMarkdown,
  buildDevOpsCharacterBehaviorJsonV1,
  buildDevOpsCharacterManifestV1,
  buildDevOpsCharacterReadmeMarkdown,
  buildCharacterReadmeMarkdown,
  computeSha256Hex,
  createZipArchive,
} from './AssetManifestBuilder';
import { dataUrlToUint8Array } from './RoomExporter';

export interface CharacterExportCandidatePackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
  manifest: BossPMManifestV1;
  behaviorJson: BossPMBehaviorJsonV1;
  readmeMarkdown: string;
  previewDataUrl: string | null;
}

export interface CEOCharacterExportPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
  manifest: CEOCharacterManifestV1;
  behaviorJson: CEOCharacterBehaviorJsonV1;
  readmeMarkdown: string;
  previewDataUrl: string | null;
}

export interface UIUXCharacterExportPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
  manifest: UIUXCharacterManifestV1;
  behaviorJson: UIUXCharacterBehaviorJsonV1;
  readmeMarkdown: string;
  previewDataUrl: string | null;
}

export interface FrontendCharacterExportPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
  manifest: FrontendCharacterManifestV1;
  behaviorJson: FrontendCharacterBehaviorJsonV1;
  readmeMarkdown: string;
  previewDataUrl: string | null;
}

export interface BackendCharacterExportPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
  manifest: BackendCharacterManifestV1;
  behaviorJson: BackendCharacterBehaviorJsonV1;
  readmeMarkdown: string;
  previewDataUrl: string | null;
}

export interface DatabaseCharacterExportPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
  manifest: DatabaseCharacterManifestV1;
  behaviorJson: DatabaseCharacterBehaviorJsonV1;
  readmeMarkdown: string;
  previewDataUrl: string | null;
}

export interface ResearchCharacterExportPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
  manifest: ResearchCharacterManifestV1;
  behaviorJson: ResearchCharacterBehaviorJsonV1;
  readmeMarkdown: string;
  previewDataUrl: string | null;
}

export interface QACharacterExportPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
  manifest: QACharacterManifestV1;
  behaviorJson: QACharacterBehaviorJsonV1;
  readmeMarkdown: string;
  previewDataUrl: string | null;
}

export interface DevOpsCharacterExportPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
  manifest: DevOpsCharacterManifestV1;
  behaviorJson: DevOpsCharacterBehaviorJsonV1;
  readmeMarkdown: string;
  previewDataUrl: string | null;
}

/**
 * Inspects the Original Room-Native Boss PM scene and animation clips to record
 * exact mesh counts, material names, bounding box, and embedded keyframe clip details.
 */
export function inspectOriginalBossPMForExport(): {
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
} {
  const { scene, animations } = buildOriginalRoomNativeBossPMSceneAndClips();
  scene.updateMatrixWorld(true);

  let sourceTotalMeshes = 0;
  let exportedVisibleMeshes = 0;
  const materialNameSet = new Set<string>();

  const isVisibleInHierarchy = (obj: THREE.Object3D): boolean => {
    let curr: THREE.Object3D | null = obj;
    while (curr) {
      if (!curr.visible) return false;
      curr = curr.parent;
    }
    return true;
  };

  scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      sourceTotalMeshes++;
      if (isVisibleInHierarchy(obj)) {
        exportedVisibleMeshes++;
      }
      const m = obj as THREE.Mesh;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        if (mat) materialNameSet.add(mat.name || mat.type);
      }
    }
  });

  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  box.getSize(size);

  const clips = animations.map((clip) => {
    const pivots = new Set<string>();
    for (const track of clip.tracks) {
      const dotIdx = track.name.indexOf('.');
      const nodeName = dotIdx > 0 ? track.name.slice(0, dotIdx) : track.name;
      pivots.add(nodeName);
    }
    return {
      name: clip.name,
      duration: Number(clip.duration.toFixed(2)),
      trackCount: clip.tracks.length,
      targetedPivots: Array.from(pivots),
    };
  });

  return {
    sourceTotalMeshes,
    exportedVisibleMeshes,
    materialNames: Array.from(materialNameSet),
    localBounds: {
      min: [
        Number(box.min.x.toFixed(3)),
        Number(box.min.y.toFixed(3)),
        Number(box.min.z.toFixed(3)),
      ],
      max: [
        Number(box.max.x.toFixed(3)),
        Number(box.max.y.toFixed(3)),
        Number(box.max.z.toFixed(3)),
      ],
      size: [
        Number(size.x.toFixed(3)),
        Number(size.y.toFixed(3)),
        Number(size.z.toFixed(3)),
      ],
    },
    clips,
  };
}

/**
 * Inspects the CEO Executive Assistant character hierarchy and 14 animation clips.
 */
export function inspectCEOExecutiveAssistantForExport(): {
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
} {
  const { characterRoot, clips: rawClips } = buildCEOExecutiveAssistantSceneAndClips();
  characterRoot.updateMatrixWorld(true);

  let sourceTotalMeshes = 0;
  let exportedVisibleMeshes = 0;
  let triangleCount = 0;
  const materialNameSet = new Set<string>();

  const isVisibleInHierarchy = (obj: THREE.Object3D): boolean => {
    let curr: THREE.Object3D | null = obj;
    while (curr) {
      if (!curr.visible) return false;
      curr = curr.parent;
    }
    return true;
  };

  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      sourceTotalMeshes++;
      if (isVisibleInHierarchy(obj)) {
        exportedVisibleMeshes++;
      }
      const m = obj as THREE.Mesh;
      const geom = m.geometry;
      if (geom) {
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else if (geom.attributes.position) {
          triangleCount += Math.floor(geom.attributes.position.count / 3);
        }
      }
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        if (mat) materialNameSet.add(mat.name || mat.type);
      }
    }
  });

  // Compute standing rest-pose bounds (excluding hidden props)
  const box = new THREE.Box3();
  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && isVisibleInHierarchy(obj)) {
      box.expandByObject(obj);
    }
  });
  const size = new THREE.Vector3();
  box.getSize(size);

  const clips = rawClips.map((clip) => {
    const pivots = new Set<string>();
    for (const track of clip.tracks) {
      const dotIdx = track.name.indexOf('.');
      const nodeName = dotIdx > 0 ? track.name.slice(0, dotIdx) : track.name;
      pivots.add(nodeName);
    }
    return {
      name: clip.name,
      duration: Number(clip.duration.toFixed(2)),
      trackCount: clip.tracks.length,
      targetedPivots: Array.from(pivots),
    };
  });

  return {
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames: Array.from(materialNameSet),
    localBounds: {
      min: [
        Number(box.min.x.toFixed(3)),
        Number(box.min.y.toFixed(3)),
        Number(box.min.z.toFixed(3)),
      ],
      max: [
        Number(box.max.x.toFixed(3)),
        Number(box.max.y.toFixed(3)),
        Number(box.max.z.toFixed(3)),
      ],
      size: [
        Number(size.x.toFixed(3)),
        Number(size.y.toFixed(3)),
        Number(size.z.toFixed(3)),
      ],
    },
    clips,
  };
}

/**
 * Generates Deliverable B (Room-Native Boss PM Export Candidate Pack).
 */
export async function buildCharacterExportCandidatePack(
  anchors: Record<AnchorId, ActivityAnchor> = DEFAULT_ACTIVITY_ANCHORS,
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<CharacterExportCandidatePackResult> {
  const inspected = inspectOriginalBossPMForExport();
  const glbBuffer = await exportOriginalBossPMToGLBBuffer();
  const glbSha256 = await computeSha256Hex(glbBuffer);

  const manifest = buildBossPMManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    sourceTotalMeshes: inspected.sourceTotalMeshes,
    exportedVisibleMeshes: inspected.exportedVisibleMeshes,
    materialNames: inspected.materialNames,
    localBounds: inspected.localBounds,
    clips: inspected.clips,
    validationStatus,
  });

  const behaviorJson = buildBossPMBehaviorJsonV1(inspected.clips, PM_DEMO_ACTIONS, anchors);
  const readmeMarkdown = buildCharacterReadmeMarkdown(manifest);

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    ...inspected,
    manifest,
    behaviorJson,
    readmeMarkdown,
    previewDataUrl,
  };
}

/**
 * Generates the CEO Executive Assistant Production Character Pack (`ceo_executive_assistant.glb` + manifest + behavior + readme).
 */
export async function buildCEOCharacterExportPack(
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<CEOCharacterExportPackResult> {
  const inspected = inspectCEOExecutiveAssistantForExport();
  const glbBuffer = await exportCEOExecutiveAssistantToGLBBuffer();
  const glbSha256 = await computeSha256Hex(glbBuffer);

  const manifest = buildCEOCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    sourceTotalMeshes: inspected.sourceTotalMeshes,
    exportedVisibleMeshes: inspected.exportedVisibleMeshes,
    triangleCount: inspected.triangleCount,
    materialNames: inspected.materialNames,
    localBounds: inspected.localBounds,
    clips: inspected.clips,
    validationStatus,
  });

  const behaviorJson = buildCEOCharacterBehaviorJsonV1();
  const readmeMarkdown = buildCEOCharacterReadmeMarkdown(manifest);

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    ...inspected,
    manifest,
    behaviorJson,
    readmeMarkdown,
    previewDataUrl,
  };
}

export function downloadCharacterAssetPackZip(
  pack: CharacterExportCandidatePackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/characters/boss_pm_room_native';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.CHARACTER_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.CHARACTER_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.CHARACTER_BEHAVIOR}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.CHARACTER_README}`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.CHARACTER_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = 'boss_pm_export_candidate_v1.zip';
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadCEOCharacterAssetPackZip(
  pack: CEOCharacterExportPackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/characters/ceo_executive_assistant';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.CEO_CHARACTER_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.CEO_CHARACTER_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.CEO_CHARACTER_BEHAVIOR}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.CEO_CHARACTER_README}`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.CEO_CHARACTER_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = 'ceo_executive_assistant_pack_v1.zip';
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadCharacterManifestAndBehavior(
  manifest: BossPMManifestV1,
  behaviorJson: BossPMBehaviorJsonV1
): void {
  triggerJsonDownload(manifest, PRODUCTION_FILENAMES.CHARACTER_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(behaviorJson, PRODUCTION_FILENAMES.CHARACTER_BEHAVIOR);
  }, 180);
}

export function downloadCEOCharacterManifestAndBehavior(
  manifest: CEOCharacterManifestV1,
  behaviorJson: CEOCharacterBehaviorJsonV1
): void {
  triggerJsonDownload(manifest, PRODUCTION_FILENAMES.CEO_CHARACTER_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(behaviorJson, PRODUCTION_FILENAMES.CEO_CHARACTER_BEHAVIOR);
  }, 180);
}

export function downloadCharacterPreviewPng(dataUrl: string): void {
  triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.CHARACTER_PREVIEW);
}

export function downloadCEOCharacterPreviewPng(dataUrl: string): void {
  triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.CEO_CHARACTER_PREVIEW);
}

export function downloadCEOCharacterGlbOnly(glbBuffer: ArrayBuffer): void {
  triggerBinaryDownload(
    glbBuffer,
    PRODUCTION_FILENAMES.CEO_CHARACTER_GLB,
    'model/gltf-binary'
  );
}

/**
 * Inspects the UI/UX Designer (`uiux_designer_agent`) character hierarchy and 15 animation clips.
 */
export function inspectUIUXDesignerForExport(): {
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
} {
  const { characterRoot, clips: rawClips } = buildUIUXDesignerSceneAndClips();
  characterRoot.updateMatrixWorld(true);

  let sourceTotalMeshes = 0;
  let exportedVisibleMeshes = 0;
  let triangleCount = 0;
  const materialNameSet = new Set<string>();

  const isVisibleInHierarchy = (obj: THREE.Object3D): boolean => {
    let curr: THREE.Object3D | null = obj;
    while (curr) {
      if (!curr.visible) return false;
      curr = curr.parent;
    }
    return true;
  };

  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      sourceTotalMeshes++;
      if (isVisibleInHierarchy(obj)) {
        exportedVisibleMeshes++;
      }
      const m = obj as THREE.Mesh;
      const geom = m.geometry;
      if (geom) {
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else if (geom.attributes.position) {
          triangleCount += Math.floor(geom.attributes.position.count / 3);
        }
      }
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        if (mat) materialNameSet.add(mat.name || mat.type);
      }
    }
  });

  // Compute standing rest-pose bounds (excluding hidden props)
  const box = new THREE.Box3();
  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && isVisibleInHierarchy(obj)) {
      box.expandByObject(obj);
    }
  });
  const size = new THREE.Vector3();
  box.getSize(size);

  const clips = rawClips.map((clip) => {
    const pivots = new Set<string>();
    for (const track of clip.tracks) {
      const dotIdx = track.name.indexOf('.');
      const nodeName = dotIdx > 0 ? track.name.slice(0, dotIdx) : track.name;
      pivots.add(nodeName);
    }
    return {
      name: clip.name,
      duration: Number(clip.duration.toFixed(2)),
      trackCount: clip.tracks.length,
      targetedPivots: Array.from(pivots),
    };
  });

  return {
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames: Array.from(materialNameSet),
    localBounds: {
      min: [
        Number(box.min.x.toFixed(3)),
        Number(box.min.y.toFixed(3)),
        Number(box.min.z.toFixed(3)),
      ],
      max: [
        Number(box.max.x.toFixed(3)),
        Number(box.max.y.toFixed(3)),
        Number(box.max.z.toFixed(3)),
      ],
      size: [
        Number(size.x.toFixed(3)),
        Number(size.y.toFixed(3)),
        Number(size.z.toFixed(3)),
      ],
    },
    clips,
  };
}

/**
 * Generates the UI/UX Designer Production Character Pack (`uiux_designer_agent.glb` + manifest + behavior + readme).
 */
export async function buildUIUXCharacterExportPack(
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<UIUXCharacterExportPackResult> {
  const inspected = inspectUIUXDesignerForExport();
  const glbBuffer = await exportUIUXDesignerToGLBBuffer();
  const glbSha256 = await computeSha256Hex(glbBuffer);

  const manifest = buildUIUXCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    sourceTotalMeshes: inspected.sourceTotalMeshes,
    exportedVisibleMeshes: inspected.exportedVisibleMeshes,
    triangleCount: inspected.triangleCount,
    materialNames: inspected.materialNames,
    localBounds: inspected.localBounds,
    clips: inspected.clips,
    validationStatus,
  });

  const behaviorJson = buildUIUXCharacterBehaviorJsonV1();
  const readmeMarkdown = buildUIUXCharacterReadmeMarkdown(manifest);

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    ...inspected,
    manifest,
    behaviorJson,
    readmeMarkdown,
    previewDataUrl,
  };
}

export function downloadUIUXCharacterAssetPackZip(
  pack: UIUXCharacterExportPackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/characters/uiux_designer_agent';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.UIUX_CHARACTER_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.UIUX_CHARACTER_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.UIUX_CHARACTER_BEHAVIOR}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.UIUX_CHARACTER_README}`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.UIUX_CHARACTER_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = PRODUCTION_FILENAMES.UIUX_CHARACTER_PACK_ZIP;
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadUIUXCharacterManifestAndBehavior(
  manifest: UIUXCharacterManifestV1,
  behaviorJson: UIUXCharacterBehaviorJsonV1
): void {
  triggerJsonDownload(manifest, PRODUCTION_FILENAMES.UIUX_CHARACTER_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(behaviorJson, PRODUCTION_FILENAMES.UIUX_CHARACTER_BEHAVIOR);
  }, 180);
}

export function downloadUIUXCharacterPreviewPng(dataUrl: string): void {
  triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.UIUX_CHARACTER_PREVIEW);
}

export function downloadUIUXCharacterGlbOnly(glbBuffer: ArrayBuffer): void {
  triggerBinaryDownload(
    glbBuffer,
    PRODUCTION_FILENAMES.UIUX_CHARACTER_GLB,
    'model/gltf-binary'
  );
}

/**
 * Inspects the Frontend Developer (`frontend_developer_agent`) character hierarchy and 16 animation clips.
 */
export function inspectFrontendDeveloperForExport(): {
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
} {
  const { root: characterRoot, clips: rawClips } = buildFrontendDeveloperSceneAndClips();
  characterRoot.updateMatrixWorld(true);

  let sourceTotalMeshes = 0;
  let exportedVisibleMeshes = 0;
  let triangleCount = 0;
  const materialNameSet = new Set<string>();

  const isVisibleInHierarchy = (obj: THREE.Object3D): boolean => {
    let curr: THREE.Object3D | null = obj;
    while (curr) {
      if (!curr.visible) return false;
      curr = curr.parent;
    }
    return true;
  };

  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      sourceTotalMeshes++;
      if (isVisibleInHierarchy(obj)) {
        exportedVisibleMeshes++;
      }
      const m = obj as THREE.Mesh;
      const geom = m.geometry;
      if (geom) {
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else if (geom.attributes.position) {
          triangleCount += Math.floor(geom.attributes.position.count / 3);
        }
      }
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        if (mat) materialNameSet.add(mat.name || mat.type);
      }
    }
  });

  // Compute standing rest-pose bounds (excluding hidden props)
  const box = new THREE.Box3();
  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && isVisibleInHierarchy(obj)) {
      box.expandByObject(obj);
    }
  });
  const size = new THREE.Vector3();
  box.getSize(size);

  const clips = rawClips.map((clip) => {
    const pivots = new Set<string>();
    for (const track of clip.tracks) {
      const dotIdx = track.name.indexOf('.');
      const nodeName = dotIdx > 0 ? track.name.slice(0, dotIdx) : track.name;
      pivots.add(nodeName);
    }
    return {
      name: clip.name,
      duration: Number(clip.duration.toFixed(2)),
      trackCount: clip.tracks.length,
      targetedPivots: Array.from(pivots),
    };
  });

  return {
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames: Array.from(materialNameSet),
    localBounds: {
      min: [
        Number(box.min.x.toFixed(3)),
        Number(box.min.y.toFixed(3)),
        Number(box.min.z.toFixed(3)),
      ],
      max: [
        Number(box.max.x.toFixed(3)),
        Number(box.max.y.toFixed(3)),
        Number(box.max.z.toFixed(3)),
      ],
      size: [
        Number(size.x.toFixed(3)),
        Number(size.y.toFixed(3)),
        Number(size.z.toFixed(3)),
      ],
    },
    clips,
  };
}

/**
 * Generates the Frontend Developer Production Character Pack (`frontend_developer_agent.glb` + manifest + behavior + readme).
 */
export async function buildFrontendCharacterExportPack(
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<FrontendCharacterExportPackResult> {
  const inspected = inspectFrontendDeveloperForExport();
  const glbBuffer = await exportFrontendDeveloperToGLBBuffer();
  const glbSha256 = await computeSha256Hex(glbBuffer);

  const manifest = buildFrontendCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    sourceTotalMeshes: inspected.sourceTotalMeshes,
    exportedVisibleMeshes: inspected.exportedVisibleMeshes,
    triangleCount: inspected.triangleCount,
    materialNames: inspected.materialNames,
    localBounds: inspected.localBounds,
    clips: inspected.clips,
    validationStatus,
  });

  const behaviorJson = buildFrontendCharacterBehaviorJsonV1();
  const readmeMarkdown = buildFrontendCharacterReadmeMarkdown(manifest);

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    ...inspected,
    manifest,
    behaviorJson,
    readmeMarkdown,
    previewDataUrl,
  };
}

export function downloadFrontendCharacterAssetPackZip(
  pack: FrontendCharacterExportPackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/characters/frontend_developer_agent';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.FRONTEND_CHARACTER_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.FRONTEND_CHARACTER_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.FRONTEND_CHARACTER_BEHAVIOR}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.FRONTEND_CHARACTER_README}`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.FRONTEND_CHARACTER_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = PRODUCTION_FILENAMES.FRONTEND_CHARACTER_PACK_ZIP;
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadFrontendCharacterManifestAndBehavior(
  manifest: FrontendCharacterManifestV1,
  behaviorJson: FrontendCharacterBehaviorJsonV1
): void {
  triggerJsonDownload(manifest, PRODUCTION_FILENAMES.FRONTEND_CHARACTER_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(behaviorJson, PRODUCTION_FILENAMES.FRONTEND_CHARACTER_BEHAVIOR);
  }, 180);
}

export function downloadFrontendCharacterPreviewPng(dataUrl: string): void {
  triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.FRONTEND_CHARACTER_PREVIEW);
}

export function downloadFrontendCharacterGlbOnly(glbBuffer: ArrayBuffer): void {
  triggerBinaryDownload(
    glbBuffer,
    PRODUCTION_FILENAMES.FRONTEND_CHARACTER_GLB,
    'model/gltf-binary'
  );
}

/**
 * Inspects the Backend Developer (`backend_developer_agent`) character hierarchy and 17 animation clips.
 */
export function inspectBackendDeveloperForExport(): {
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
} {
  const { root: characterRoot, clips: rawClips } = buildBackendDeveloperSceneAndClips();
  characterRoot.updateMatrixWorld(true);

  let sourceTotalMeshes = 0;
  let exportedVisibleMeshes = 0;
  let triangleCount = 0;
  const materialNameSet = new Set<string>();

  const isVisibleInHierarchy = (obj: THREE.Object3D): boolean => {
    let curr: THREE.Object3D | null = obj;
    while (curr) {
      if (!curr.visible) return false;
      curr = curr.parent;
    }
    return true;
  };

  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      sourceTotalMeshes++;
      if (isVisibleInHierarchy(obj)) {
        exportedVisibleMeshes++;
      }
      const m = obj as THREE.Mesh;
      const geom = m.geometry;
      if (geom) {
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else if (geom.attributes.position) {
          triangleCount += Math.floor(geom.attributes.position.count / 3);
        }
      }
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        if (mat) materialNameSet.add(mat.name || mat.type);
      }
    }
  });

  // Compute standing rest-pose bounds (excluding hidden props)
  const box = new THREE.Box3();
  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && isVisibleInHierarchy(obj)) {
      box.expandByObject(obj);
    }
  });
  const size = new THREE.Vector3();
  box.getSize(size);

  const clips = rawClips.map((clip) => {
    const pivots = new Set<string>();
    for (const track of clip.tracks) {
      const dotIdx = track.name.indexOf('.');
      const nodeName = dotIdx > 0 ? track.name.slice(0, dotIdx) : track.name;
      pivots.add(nodeName);
    }
    return {
      name: clip.name,
      duration: Number(clip.duration.toFixed(2)),
      trackCount: clip.tracks.length,
      targetedPivots: Array.from(pivots),
    };
  });

  return {
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames: Array.from(materialNameSet),
    localBounds: {
      min: [
        Number(box.min.x.toFixed(3)),
        Number(box.min.y.toFixed(3)),
        Number(box.min.z.toFixed(3)),
      ],
      max: [
        Number(box.max.x.toFixed(3)),
        Number(box.max.y.toFixed(3)),
        Number(box.max.z.toFixed(3)),
      ],
      size: [
        Number(size.x.toFixed(3)),
        Number(size.y.toFixed(3)),
        Number(size.z.toFixed(3)),
      ],
    },
    clips,
  };
}

/**
 * Generates the Backend Developer Production Character Pack (`backend_developer_agent.glb` + manifest + behavior + readme).
 */
export async function buildBackendCharacterExportPack(
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<BackendCharacterExportPackResult> {
  const inspected = inspectBackendDeveloperForExport();
  const glbBuffer = await exportBackendDeveloperToGLBBuffer();
  const glbSha256 = await computeSha256Hex(glbBuffer);

  const manifest = buildBackendCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    sourceTotalMeshes: inspected.sourceTotalMeshes,
    exportedVisibleMeshes: inspected.exportedVisibleMeshes,
    triangleCount: inspected.triangleCount,
    materialNames: inspected.materialNames,
    localBounds: inspected.localBounds,
    clips: inspected.clips,
    validationStatus,
  });

  const behaviorJson = buildBackendCharacterBehaviorJsonV1();
  const readmeMarkdown = buildBackendCharacterReadmeMarkdown(manifest);

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    ...inspected,
    manifest,
    behaviorJson,
    readmeMarkdown,
    previewDataUrl,
  };
}

export function downloadBackendCharacterAssetPackZip(
  pack: BackendCharacterExportPackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/characters/backend_developer_agent';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.BACKEND_CHARACTER_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.BACKEND_CHARACTER_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.BACKEND_CHARACTER_BEHAVIOR}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.BACKEND_CHARACTER_README}`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.BACKEND_CHARACTER_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = PRODUCTION_FILENAMES.BACKEND_CHARACTER_PACK_ZIP;
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadBackendCharacterManifestAndBehavior(
  manifest: BackendCharacterManifestV1,
  behaviorJson: BackendCharacterBehaviorJsonV1
): void {
  triggerJsonDownload(manifest, PRODUCTION_FILENAMES.BACKEND_CHARACTER_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(behaviorJson, PRODUCTION_FILENAMES.BACKEND_CHARACTER_BEHAVIOR);
  }, 180);
}

export function downloadBackendCharacterPreviewPng(dataUrl: string): void {
  triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.BACKEND_CHARACTER_PREVIEW);
}

export function downloadBackendCharacterGlbOnly(glbBuffer: ArrayBuffer): void {
  triggerBinaryDownload(
    glbBuffer,
    PRODUCTION_FILENAMES.BACKEND_CHARACTER_GLB,
    'model/gltf-binary'
  );
}

/**
 * Inspects the Database Developer (`database_developer_agent`) character hierarchy and 21 animation clips.
 */
export function inspectDatabaseDeveloperForExport(): {
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
} {
  const { root: characterRoot, clips: rawClips } = buildDatabaseDeveloperSceneAndClips();
  characterRoot.updateMatrixWorld(true);

  let sourceTotalMeshes = 0;
  let exportedVisibleMeshes = 0;
  let triangleCount = 0;
  const materialNameSet = new Set<string>();

  const isVisibleInHierarchy = (obj: THREE.Object3D): boolean => {
    let curr: THREE.Object3D | null = obj;
    while (curr) {
      if (!curr.visible) return false;
      curr = curr.parent;
    }
    return true;
  };

  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      sourceTotalMeshes++;
      if (isVisibleInHierarchy(obj)) {
        exportedVisibleMeshes++;
      }
      const m = obj as THREE.Mesh;
      const geom = m.geometry;
      if (geom) {
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else if (geom.attributes.position) {
          triangleCount += Math.floor(geom.attributes.position.count / 3);
        }
      }
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        if (mat) materialNameSet.add(mat.name || mat.type);
      }
    }
  });

  // Compute standing rest-pose bounds (excluding hidden props)
  const box = new THREE.Box3();
  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && isVisibleInHierarchy(obj)) {
      box.expandByObject(obj);
    }
  });
  const size = new THREE.Vector3();
  box.getSize(size);

  const clips = rawClips.map((clip) => {
    const pivots = new Set<string>();
    for (const track of clip.tracks) {
      const dotIdx = track.name.indexOf('.');
      const nodeName = dotIdx > 0 ? track.name.slice(0, dotIdx) : track.name;
      pivots.add(nodeName);
    }
    return {
      name: clip.name,
      duration: Number(clip.duration.toFixed(2)),
      trackCount: clip.tracks.length,
      targetedPivots: Array.from(pivots),
    };
  });

  return {
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames: Array.from(materialNameSet),
    localBounds: {
      min: [
        Number(box.min.x.toFixed(3)),
        Number(box.min.y.toFixed(3)),
        Number(box.min.z.toFixed(3)),
      ],
      max: [
        Number(box.max.x.toFixed(3)),
        Number(box.max.y.toFixed(3)),
        Number(box.max.z.toFixed(3)),
      ],
      size: [
        Number(size.x.toFixed(3)),
        Number(size.y.toFixed(3)),
        Number(size.z.toFixed(3)),
      ],
    },
    clips,
  };
}

/**
 * Generates the Database Developer Production Character Pack (`database_developer_agent.glb` + manifest + behavior + readme).
 */
export async function buildDatabaseCharacterExportPack(
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<DatabaseCharacterExportPackResult> {
  const inspected = inspectDatabaseDeveloperForExport();
  const glbBuffer = await exportDatabaseDeveloperToGLBBuffer();
  const glbSha256 = await computeSha256Hex(glbBuffer);

  const manifest = buildDatabaseCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    sourceTotalMeshes: inspected.sourceTotalMeshes,
    exportedVisibleMeshes: inspected.exportedVisibleMeshes,
    triangleCount: inspected.triangleCount,
    materialNames: inspected.materialNames,
    localBounds: inspected.localBounds,
    clips: inspected.clips,
    validationStatus,
  });

  const behaviorJson = buildDatabaseCharacterBehaviorJsonV1();
  const readmeMarkdown = buildDatabaseCharacterReadmeMarkdown(manifest);

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    ...inspected,
    manifest,
    behaviorJson,
    readmeMarkdown,
    previewDataUrl,
  };
}

export function downloadDatabaseCharacterAssetPackZip(
  pack: DatabaseCharacterExportPackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/characters/database_developer_agent';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.DATABASE_CHARACTER_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.DATABASE_CHARACTER_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.DATABASE_CHARACTER_BEHAVIOR}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.DATABASE_CHARACTER_README}`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.DATABASE_CHARACTER_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = PRODUCTION_FILENAMES.DATABASE_CHARACTER_PACK_ZIP;
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadDatabaseCharacterManifestAndBehavior(
  manifest: DatabaseCharacterManifestV1,
  behaviorJson: DatabaseCharacterBehaviorJsonV1
): void {
  triggerJsonDownload(manifest, PRODUCTION_FILENAMES.DATABASE_CHARACTER_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(behaviorJson, PRODUCTION_FILENAMES.DATABASE_CHARACTER_BEHAVIOR);
  }, 180);
}

export function downloadDatabaseCharacterPreviewPng(dataUrl: string): void {
  triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.DATABASE_CHARACTER_PREVIEW);
}

export function downloadDatabaseCharacterGlbOnly(glbBuffer: ArrayBuffer): void {
  triggerBinaryDownload(
    glbBuffer,
    PRODUCTION_FILENAMES.DATABASE_CHARACTER_GLB,
    'model/gltf-binary'
  );
}

/**
 * Inspects the Research Professor (`research_professor_agent`) character hierarchy and 20 animation clips.
 */
export function inspectResearchProfessorForExport(): {
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
} {
  const { root: characterRoot, clips: rawClips } = buildResearchProfessorSceneAndClips();
  characterRoot.updateMatrixWorld(true);

  let sourceTotalMeshes = 0;
  let exportedVisibleMeshes = 0;
  let triangleCount = 0;
  const materialNameSet = new Set<string>();

  const isVisibleInHierarchy = (obj: THREE.Object3D): boolean => {
    let curr: THREE.Object3D | null = obj;
    while (curr) {
      if (!curr.visible) return false;
      curr = curr.parent;
    }
    return true;
  };

  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      sourceTotalMeshes++;
      if (isVisibleInHierarchy(obj)) {
        exportedVisibleMeshes++;
      }
      const m = obj as THREE.Mesh;
      const geom = m.geometry;
      if (geom) {
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else if (geom.attributes.position) {
          triangleCount += Math.floor(geom.attributes.position.count / 3);
        }
      }
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        if (mat) materialNameSet.add(mat.name || mat.type);
      }
    }
  });

  // Compute standing rest-pose bounds (excluding hidden props)
  const box = new THREE.Box3();
  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && isVisibleInHierarchy(obj)) {
      box.expandByObject(obj);
    }
  });
  const size = new THREE.Vector3();
  box.getSize(size);

  const clips = rawClips.map((clip) => {
    const pivots = new Set<string>();
    for (const track of clip.tracks) {
      const dotIdx = track.name.indexOf('.');
      const nodeName = dotIdx > 0 ? track.name.slice(0, dotIdx) : track.name;
      pivots.add(nodeName);
    }
    return {
      name: clip.name,
      duration: Number(clip.duration.toFixed(2)),
      trackCount: clip.tracks.length,
      targetedPivots: Array.from(pivots),
    };
  });

  return {
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames: Array.from(materialNameSet),
    localBounds: {
      min: [
        Number(box.min.x.toFixed(3)),
        Number(box.min.y.toFixed(3)),
        Number(box.min.z.toFixed(3)),
      ],
      max: [
        Number(box.max.x.toFixed(3)),
        Number(box.max.y.toFixed(3)),
        Number(box.max.z.toFixed(3)),
      ],
      size: [
        Number(size.x.toFixed(3)),
        Number(size.y.toFixed(3)),
        Number(size.z.toFixed(3)),
      ],
    },
    clips,
  };
}

/**
 * Generates the Research Professor Production Character Pack (`research_professor_agent.glb` + manifest + behavior + readme).
 */
export async function buildResearchCharacterExportPack(
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<ResearchCharacterExportPackResult> {
  const inspected = inspectResearchProfessorForExport();
  const glbBuffer = await exportResearchProfessorToGLBBuffer();
  const glbSha256 = await computeSha256Hex(glbBuffer);

  const manifest = buildResearchCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    sourceTotalMeshes: inspected.sourceTotalMeshes,
    exportedVisibleMeshes: inspected.exportedVisibleMeshes,
    triangleCount: inspected.triangleCount,
    materialNames: inspected.materialNames,
    localBounds: inspected.localBounds,
    clips: inspected.clips,
    validationStatus,
  });

  const behaviorJson = buildResearchCharacterBehaviorJsonV1();
  const readmeMarkdown = buildResearchCharacterReadmeMarkdown(manifest);

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    ...inspected,
    manifest,
    behaviorJson,
    readmeMarkdown,
    previewDataUrl,
  };
}

export function downloadResearchCharacterAssetPackZip(
  pack: ResearchCharacterExportPackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/characters/research_professor_agent';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.RESEARCH_CHARACTER_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.RESEARCH_CHARACTER_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.RESEARCH_CHARACTER_BEHAVIOR}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.RESEARCH_CHARACTER_README}`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.RESEARCH_CHARACTER_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = PRODUCTION_FILENAMES.RESEARCH_CHARACTER_PACK_ZIP;
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadResearchCharacterManifestAndBehavior(
  manifest: ResearchCharacterManifestV1,
  behaviorJson: ResearchCharacterBehaviorJsonV1
): void {
  triggerJsonDownload(manifest, PRODUCTION_FILENAMES.RESEARCH_CHARACTER_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(behaviorJson, PRODUCTION_FILENAMES.RESEARCH_CHARACTER_BEHAVIOR);
  }, 180);
}

export function downloadResearchCharacterPreviewPng(dataUrl: string): void {
  triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.RESEARCH_CHARACTER_PREVIEW);
}

export function downloadResearchCharacterGlbOnly(glbBuffer: ArrayBuffer): void {
  triggerBinaryDownload(
    glbBuffer,
    PRODUCTION_FILENAMES.RESEARCH_CHARACTER_GLB,
    'model/gltf-binary'
  );
}

/**
 * Inspects the QA Engineer (`qa_engineer_agent`) character hierarchy and 23 animation clips.
 */
export function inspectQAEngineerForExport(): {
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
} {
  const { root: characterRoot, clips: rawClips } = buildQAEngineerSceneAndClips();
  characterRoot.updateMatrixWorld(true);

  let sourceTotalMeshes = 0;
  let exportedVisibleMeshes = 0;
  let triangleCount = 0;
  const materialNameSet = new Set<string>();

  const isVisibleInHierarchy = (obj: THREE.Object3D): boolean => {
    let curr: THREE.Object3D | null = obj;
    while (curr) {
      if (!curr.visible) return false;
      curr = curr.parent;
    }
    return true;
  };

  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      sourceTotalMeshes++;
      if (isVisibleInHierarchy(obj)) {
        exportedVisibleMeshes++;
      }
      const m = obj as THREE.Mesh;
      const geom = m.geometry;
      if (geom) {
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else if (geom.attributes.position) {
          triangleCount += Math.floor(geom.attributes.position.count / 3);
        }
      }
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        if (mat) materialNameSet.add(mat.name || mat.type);
      }
    }
  });

  // Compute standing rest-pose bounds (excluding hidden props & optional accessories)
  const box = new THREE.Box3();
  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && isVisibleInHierarchy(obj)) {
      box.expandByObject(obj);
    }
  });
  const size = new THREE.Vector3();
  box.getSize(size);

  const clips = rawClips.map((clip) => {
    const pivots = new Set<string>();
    for (const track of clip.tracks) {
      const dotIdx = track.name.indexOf('.');
      const nodeName = dotIdx > 0 ? track.name.slice(0, dotIdx) : track.name;
      pivots.add(nodeName);
    }
    return {
      name: clip.name,
      duration: Number(clip.duration.toFixed(2)),
      trackCount: clip.tracks.length,
      targetedPivots: Array.from(pivots),
    };
  });

  return {
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames: Array.from(materialNameSet),
    localBounds: {
      min: [
        Number(box.min.x.toFixed(3)),
        Number(box.min.y.toFixed(3)),
        Number(box.min.z.toFixed(3)),
      ],
      max: [
        Number(box.max.x.toFixed(3)),
        Number(box.max.y.toFixed(3)),
        Number(box.max.z.toFixed(3)),
      ],
      size: [
        Number(size.x.toFixed(3)),
        Number(size.y.toFixed(3)),
        Number(size.z.toFixed(3)),
      ],
    },
    clips,
  };
}

/**
 * Generates the QA Engineer Production Character Pack (`qa_engineer_agent.glb` + manifest + behavior + readme).
 */
export async function buildQACharacterExportPack(
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<QACharacterExportPackResult> {
  const inspected = inspectQAEngineerForExport();
  const glbBuffer = await exportQAEngineerToGLBBuffer();
  const glbSha256 = await computeSha256Hex(glbBuffer);

  const manifest = buildQACharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    sourceTotalMeshes: inspected.sourceTotalMeshes,
    exportedVisibleMeshes: inspected.exportedVisibleMeshes,
    triangleCount: inspected.triangleCount,
    materialNames: inspected.materialNames,
    localBounds: inspected.localBounds,
    clips: inspected.clips,
    validationStatus,
  });

  const behaviorJson = buildQACharacterBehaviorJsonV1();
  const readmeMarkdown = buildQACharacterReadmeMarkdown(manifest);

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    ...inspected,
    manifest,
    behaviorJson,
    readmeMarkdown,
    previewDataUrl,
  };
}

export function downloadQACharacterAssetPackZip(
  pack: QACharacterExportPackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/characters/qa_engineer_agent';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.QA_CHARACTER_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.QA_CHARACTER_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.QA_CHARACTER_BEHAVIOR}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.QA_CHARACTER_README}`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.QA_CHARACTER_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = PRODUCTION_FILENAMES.QA_CHARACTER_PACK_ZIP;
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadQACharacterManifestAndBehavior(
  manifest: QACharacterManifestV1,
  behaviorJson: QACharacterBehaviorJsonV1
): void {
  triggerJsonDownload(manifest, PRODUCTION_FILENAMES.QA_CHARACTER_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(behaviorJson, PRODUCTION_FILENAMES.QA_CHARACTER_BEHAVIOR);
  }, 180);
}

export function downloadQACharacterPreviewPng(dataUrl: string): void {
  triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.QA_CHARACTER_PREVIEW);
}

export function downloadQACharacterGlbOnly(glbBuffer: ArrayBuffer): void {
  triggerBinaryDownload(
    glbBuffer,
    PRODUCTION_FILENAMES.QA_CHARACTER_GLB,
    'model/gltf-binary'
  );
}

/**
 * Inspects the DevOps Engineer (`devops_engineer_agent`) character hierarchy and 27 animation clips.
 */
export function inspectDevOpsEngineerForExport(): {
  sourceTotalMeshes: number;
  exportedVisibleMeshes: number;
  triangleCount: number;
  materialNames: string[];
  localBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>;
} {
  const { root: characterRoot, clips: rawClips } = buildDevOpsEngineerSceneAndClips();
  characterRoot.updateMatrixWorld(true);

  let sourceTotalMeshes = 0;
  let exportedVisibleMeshes = 0;
  let triangleCount = 0;
  const materialNameSet = new Set<string>();

  const isVisibleInHierarchy = (obj: THREE.Object3D): boolean => {
    let curr: THREE.Object3D | null = obj;
    while (curr) {
      if (!curr.visible) return false;
      curr = curr.parent;
    }
    return true;
  };

  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      sourceTotalMeshes++;
      if (isVisibleInHierarchy(obj)) {
        exportedVisibleMeshes++;
      }
      const m = obj as THREE.Mesh;
      const geom = m.geometry;
      if (geom) {
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else if (geom.attributes.position) {
          triangleCount += Math.floor(geom.attributes.position.count / 3);
        }
      }
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        if (mat) materialNameSet.add(mat.name || mat.type);
      }
    }
  });

  // Compute standing rest-pose bounds (excluding hidden props & optional accessories)
  const box = new THREE.Box3();
  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh && isVisibleInHierarchy(obj)) {
      box.expandByObject(obj);
    }
  });
  const size = new THREE.Vector3();
  box.getSize(size);

  const clips = rawClips.map((clip) => {
    const pivots = new Set<string>();
    for (const track of clip.tracks) {
      const dotIdx = track.name.indexOf('.');
      const nodeName = dotIdx > 0 ? track.name.slice(0, dotIdx) : track.name;
      pivots.add(nodeName);
    }
    return {
      name: clip.name,
      duration: Number(clip.duration.toFixed(2)),
      trackCount: clip.tracks.length,
      targetedPivots: Array.from(pivots),
    };
  });

  return {
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames: Array.from(materialNameSet),
    localBounds: {
      min: [
        Number(box.min.x.toFixed(3)),
        Number(box.min.y.toFixed(3)),
        Number(box.min.z.toFixed(3)),
      ],
      max: [
        Number(box.max.x.toFixed(3)),
        Number(box.max.y.toFixed(3)),
        Number(box.max.z.toFixed(3)),
      ],
      size: [
        Number(size.x.toFixed(3)),
        Number(size.y.toFixed(3)),
        Number(size.z.toFixed(3)),
      ],
    },
    clips,
  };
}

/**
 * Generates the DevOps Engineer Production Character Pack (`devops_engineer_agent.glb` + manifest + behavior + readme).
 */
export async function buildDevOpsCharacterExportPack(
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<DevOpsCharacterExportPackResult> {
  const inspected = inspectDevOpsEngineerForExport();
  const glbBuffer = await exportDevOpsEngineerToGLBBuffer();
  const glbSha256 = await computeSha256Hex(glbBuffer);

  const manifest = buildDevOpsCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    sourceTotalMeshes: inspected.sourceTotalMeshes,
    exportedVisibleMeshes: inspected.exportedVisibleMeshes,
    triangleCount: inspected.triangleCount,
    materialNames: inspected.materialNames,
    localBounds: inspected.localBounds,
    clips: inspected.clips,
    validationStatus,
  });

  const behaviorJson = buildDevOpsCharacterBehaviorJsonV1();
  const readmeMarkdown = buildDevOpsCharacterReadmeMarkdown(manifest);

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    ...inspected,
    manifest,
    behaviorJson,
    readmeMarkdown,
    previewDataUrl,
  };
}

export function downloadDevOpsCharacterAssetPackZip(
  pack: DevOpsCharacterExportPackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/characters/devops_engineer_agent';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.DEVOPS_CHARACTER_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.DEVOPS_CHARACTER_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.DEVOPS_CHARACTER_BEHAVIOR}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.DEVOPS_CHARACTER_README}`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.DEVOPS_CHARACTER_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = PRODUCTION_FILENAMES.DEVOPS_CHARACTER_PACK_ZIP;
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadDevOpsCharacterManifestAndBehavior(
  manifest: DevOpsCharacterManifestV1,
  behaviorJson: DevOpsCharacterBehaviorJsonV1
): void {
  triggerJsonDownload(manifest, PRODUCTION_FILENAMES.DEVOPS_CHARACTER_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(behaviorJson, PRODUCTION_FILENAMES.DEVOPS_CHARACTER_BEHAVIOR);
  }, 180);
}

export function downloadDevOpsCharacterPreviewPng(dataUrl: string): void {
  triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.DEVOPS_CHARACTER_PREVIEW);
}

export function downloadDevOpsCharacterGlbOnly(glbBuffer: ArrayBuffer): void {
  triggerBinaryDownload(
    glbBuffer,
    PRODUCTION_FILENAMES.DEVOPS_CHARACTER_GLB,
    'model/gltf-binary'
  );
}




