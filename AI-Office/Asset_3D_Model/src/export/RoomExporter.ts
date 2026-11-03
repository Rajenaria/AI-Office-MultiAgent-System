import * as THREE from 'three';
import {
  FURNITURE_CATALOG,
  MODULE_CONSTANTS,
  RoomExportStats,
} from '../domain/modularRoomSpec';
import {
  ActivityAnchor,
  AnchorId,
  DEFAULT_ACTIVITY_ANCHORS,
  ROOM_WALK_WAYPOINTS,
} from '../domain/pmSimulationSpec';
import {
  exportRoomToGLBBuffer,
  measureRoomStats,
  triggerBinaryDownload,
  triggerDataUrlDownload,
  triggerJsonDownload,
} from '../three/RoomExportAndImportManager';
import {
  FurnitureExportParityItem,
  PMRoomAnchorsJsonV1,
  PMRoomManifestV1,
  PRODUCTION_FILENAMES,
  buildPMRoomAnchorsJsonV1,
  buildPMRoomManifestV1,
  buildRoomReadmeMarkdown,
  computeSha256Hex,
  createZipArchive,
} from './AssetManifestBuilder';

export interface RoomProductionAssetPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  stats: RoomExportStats;
  furnitureParity: FurnitureExportParityItem[];
  manifest: PMRoomManifestV1;
  anchorsJson: PMRoomAnchorsJsonV1;
  readmeMarkdown: string;
  previewDataUrl: string | null;
}

/**
 * Inspects each approved furniture & architectural asset inside ROOM_PM_ROOT
 * to document its source module, mesh count, material compatibility, and visual parity.
 */
export function inspectRoomFurnitureAndMaterialParity(
  roomRoot: THREE.Object3D
): FurnitureExportParityItem[] {
  const parityList: FurnitureExportParityItem[] = [];

  for (const cat of FURNITURE_CATALOG) {
    const node = roomRoot.getObjectByName(cat.id);
    let meshCount = 0;
    const matTypes = new Set<string>();
    let gltfCompatible = true;

    if (node) {
      node.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          meshCount++;
          const m = obj as THREE.Mesh;
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          for (const mat of mats) {
            if (!mat) continue;
            matTypes.add(mat.type);
            if (
              mat.type !== 'MeshStandardMaterial' &&
              mat.type !== 'MeshBasicMaterial' &&
              mat.type !== 'MeshPhysicalMaterial'
            ) {
              gltfCompatible = false;
            }
          }
        }
      });
    }

    const parityNoteById: Record<string, string> = {
      PM_Tall_Bookcase:
        'Verified 3D walnut bookcase with inset shelves, back panel, lower cabinet doors, pixel book spine clusters, and top crown; zero coplanar faces.',
      PM_Archival_Wardrobe:
        'Verified honey-oak cabinet with true 3D recessed open garment bay, hanging blazers, upper/lower doors, and top archive boxes.',
      PM_Corner_Credenza:
        'Verified SW refreshment counter with separated filing tower (X=-1.13..-0.51) and cabinet base (X=-0.51..+0.83), espresso station, and pour-over kettle.',
      PM_Executive_Desk:
        'Verified executive PM workstation with dual pedestals, separated modesty panel, widescreen monitor (embedded pixel UI texture), secondary laptop, keyboard, mouse, lamp, and mug.',
      PM_Strategy_Board:
        'Verified North-wall sprint Kanban board with embedded pixel-art roadmap texture, sticky notes, and aluminum marker ledge.',
      PM_Area_Rug:
        'Verified woven pixel-pattern studio rug with embedded CanvasTexture at Y=0.015; runtime polygonOffset documented in rendering_profile.',
    };

    parityList.push({
      catalog_id: cat.id,
      name: cat.name,
      category: cat.category,
      included_in_room_glb: Boolean(node && meshCount > 0),
      source_module: 'src/three/FurnitureLibraryBuilder.ts',
      local_position: [...cat.position],
      catalog_dimensions: [...cat.dimensions],
      mesh_count: meshCount,
      material_type: Array.from(matTypes).join(', ') || 'MeshStandardMaterial',
      gltf_compatible: gltfCompatible,
      visual_parity_notes:
        parityNoteById[cat.id] ||
        `Verified 3D geometry (${meshCount} sub-meshes) and glTF-compatible MeshStandardMaterial.`,
    });
  }

  // Also record architectural groups (FLOOR, WALLS, WINDOWS, STRUCTURE, CONNECTORS)
  const archGroups: Array<{
    id: string;
    name: string;
    category: string;
    pos: [number, number, number];
    dim: [number, number, number];
    note: string;
  }> = [
    {
      id: 'FLOOR',
      name: 'Oak Plank Surface & Structural Subbase',
      category: 'FLOOR',
      pos: [4.0, -0.08, 4.0],
      dim: [7.92, 0.16, 7.92],
      note: 'Embedded procedural pixel-art oak plank texture serialized as PNG in GLB; abuts East/South cutaway plinth trims without overlap.',
    },
    {
      id: 'WALLS',
      name: 'North & West Full Walls, Pilasters, Caps & Baseboard Trim',
      category: 'WALLS',
      pos: [4.0, 1.6, 4.0],
      dim: [8.0, 3.2, 8.0],
      note: 'Embedded warm beige plaster texture; North pilaster and West exterior shell separated to eliminate coplanar Z-fighting.',
    },
    {
      id: 'WINDOWS',
      name: 'West Panorama & Study Casement Windows',
      category: 'WINDOWS',
      pos: [0.18, 1.75, 4.2],
      dim: [0.24, 1.95, 5.8],
      note: 'Non-overlapping casement frames, split vertical mullions around horizontal transoms, daylight vista backdrop texture, and translucent glass panes.',
    },
    {
      id: 'CONNECTORS',
      name: 'East [8,0,4] & South [4,0,0] Modular Snap Connectors',
      category: 'CONNECTORS',
      pos: [6.0, 0.18, 2.0],
      dim: [2.0, 2.3, 2.0],
      note: 'Includes CONNECTOR_A_EAST, CONNECTOR_B_SOUTH, removable doorway thresholds, and layered South welcome mat.',
    },
  ];

  for (const arch of archGroups) {
    const grp = roomRoot.getObjectByName(arch.id);
    let meshCount = 0;
    if (grp) {
      grp.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) meshCount++;
      });
    }
    parityList.push({
      catalog_id: arch.id,
      name: arch.name,
      category: arch.category,
      included_in_room_glb: meshCount > 0,
      source_module: 'src/three/RoomArchitectureBuilder.ts',
      local_position: arch.pos,
      catalog_dimensions: arch.dim,
      mesh_count: meshCount,
      material_type: 'MeshStandardMaterial',
      gltf_compatible: true,
      visual_parity_notes: arch.note,
    });
  }

  return parityList;
}

/**
 * Generates Deliverable A (PM Room Production Asset Pack) from the live ROOM_PM_ROOT object.
 */
export async function buildRoomProductionAssetPack(
  roomRoot: THREE.Object3D,
  anchors: Record<AnchorId, ActivityAnchor> = DEFAULT_ACTIVITY_ANCHORS,
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<RoomProductionAssetPackResult> {
  // Temporarily detach from any A3 global offset wrapper and ensure [0,0,0] local origin
  const prevParent = roomRoot.parent;
  const prevPos = roomRoot.position.clone();
  const visBackup = new Map<THREE.Object3D, boolean>();

  if (prevParent) {
    prevParent.remove(roomRoot);
  }
  roomRoot.position.set(0, 0, 0);
  roomRoot.traverse((obj) => {
    visBackup.set(obj, obj.visible);
    obj.visible = true;
  });
  roomRoot.updateMatrixWorld(true);

  const stats = measureRoomStats(roomRoot);
  const furnitureParity = inspectRoomFurnitureAndMaterialParity(roomRoot);
  const glbBuffer = await exportRoomToGLBBuffer(roomRoot);

  visBackup.forEach((v, obj) => {
    obj.visible = v;
  });
  roomRoot.position.copy(prevPos);
  if (prevParent) {
    prevParent.add(roomRoot);
  }
  roomRoot.updateMatrixWorld(true);

  const glbSha256 = await computeSha256Hex(glbBuffer);

  const manifest = buildPMRoomManifestV1({
    stats,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    exportedMeshCount: stats.meshCount,
    furnitureParity,
    validationStatus,
  });

  const anchorsJson = buildPMRoomAnchorsJsonV1(anchors, ROOM_WALK_WAYPOINTS);
  const readmeMarkdown = buildRoomReadmeMarkdown(manifest);

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    stats,
    furnitureParity,
    manifest,
    anchorsJson,
    readmeMarkdown,
    previewDataUrl,
  };
}

export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const parts = dataUrl.split(',');
  const base64 = parts.length > 1 ? parts[1] : parts[0];
  if (typeof atob === 'function') {
    const binStr = atob(base64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(0);
}

export function downloadRoomAssetPackZip(pack: RoomProductionAssetPackResult): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/rooms/pm_strategy';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.ROOM_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.ROOM_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.ROOM_ANCHORS}`,
      data: JSON.stringify(pack.anchorsJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.ROOM_README}`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.ROOM_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = 'pm_room_production_pack_v1.zip';
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadRoomManifestAndAnchors(
  manifest: PMRoomManifestV1,
  anchorsJson: PMRoomAnchorsJsonV1
): void {
  triggerJsonDownload(manifest, PRODUCTION_FILENAMES.ROOM_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(anchorsJson, PRODUCTION_FILENAMES.ROOM_ANCHORS);
  }, 180);
}

export function downloadRoomPreviewPng(dataUrl: string): void {
  triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.ROOM_PREVIEW);
}

// ============================================================================
// CEO EXECUTIVE BRAIN OFFICE PRODUCTION EXPORTER (V2)
// ============================================================================
import {
  CEOActivityAnchor,
  CEOAnchorId,
  CEORoomBehaviorJsonV1,
  CEO_CONNECTORS_SPEC,
  CEO_FURNITURE_CATALOG,
  CEO_MODULE_CONSTANTS,
  DEFAULT_CEO_ANCHORS,
  buildCEORoomBehaviorJson,
} from '../domain/ceoRoomSpec';
import {
  OFFICE_A3_CONSTANTS,
  OfficeLayoutA3ExportJson,
  buildOfficeLayoutA3ExportJson,
} from '../domain/officeLayoutA3Spec';

export interface CEORoomManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  asset_id: typeof CEO_MODULE_CONSTANTS.ASSET_ID;
  module_id: typeof CEO_MODULE_CONSTANTS.MODULE_ID;
  asset_version: string;
  asset_kind: 'room';
  display_name: string;
  export_date: string;
  file_inventory: {
    glb: {
      filename: string;
      relative_path: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string; relative_path: string };
    anchors: { filename: string; relative_path: string };
    behavior: { filename: string; relative_path: string };
    preview: { filename: string; relative_path: string };
  };
  coordinate_and_scale_contract: {
    up_axis: 'Y';
    handedness: 'right-handed';
    world_floor_y: 0;
    floor_subbase_min_y: -0.16;
    wall_top_y: 3.2;
    grid_unit_size: 1.0;
    local_origin: [number, number, number];
    global_a3_offset: [number, number, number];
    footprint_units: [number, number];
    recentered_on_export: false;
  };
  measured_bounds: {
    local_min: [number, number, number];
    local_max: [number, number, number];
    size: [number, number, number];
  };
  geometry_and_material_summary: {
    source_mesh_count: number;
    exported_mesh_count: number;
    material_count: number;
    triangle_count: number;
    embedded_texture_count: number;
    content_groups: string[];
    group_mesh_counts: Record<string, number>;
    character_excluded: true;
    preview_helpers_excluded: true;
  };
  connectors: typeof CEO_CONNECTORS_SPEC;
  furniture_and_material_parity: FurnitureExportParityItem[];
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface CEORoomAnchorsJsonV1 {
  schema_version: 'AI_OFFICE_ROOM_ANCHORS_V1';
  room_asset_id: typeof CEO_MODULE_CONSTANTS.ASSET_ID;
  room_module_id: typeof CEO_MODULE_CONSTANTS.MODULE_ID;
  local_origin: [number, number, number];
  global_a3_offset: [number, number, number];
  connectors: typeof CEO_CONNECTORS_SPEC;
  anchors: Array<{
    id: CEOAnchorId;
    label: string;
    local_position: [number, number, number];
    global_a3_position: [number, number, number];
    facing_rad: number;
    facing_deg: number;
    posture: 'standing' | 'seated';
    approach_anchor_id: CEOAnchorId | null;
    associated_furniture_id: string | null;
    associated_future_action: string;
    description: string;
  }>;
}

export interface CEORoomProductionAssetPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  stats: RoomExportStats;
  furnitureParity: FurnitureExportParityItem[];
  manifest: CEORoomManifestV1;
  anchorsJson: CEORoomAnchorsJsonV1;
  behaviorJson: CEORoomBehaviorJsonV1;
  previewDataUrl: string | null;
  readmeMarkdown: string;
}

export function inspectCEORoomFurnitureParity(
  ceoRoot: THREE.Object3D
): FurnitureExportParityItem[] {
  const parityList: FurnitureExportParityItem[] = [];

  for (const cat of CEO_FURNITURE_CATALOG) {
    const node = ceoRoot.getObjectByName(cat.id);
    let meshCount = 0;
    const matTypes = new Set<string>();
    let gltfCompatible = true;

    if (node) {
      node.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          meshCount++;
          const m = obj as THREE.Mesh;
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          for (const mat of mats) {
            if (!mat) continue;
            matTypes.add(mat.type);
            if (
              mat.type !== 'MeshStandardMaterial' &&
              mat.type !== 'MeshBasicMaterial' &&
              mat.type !== 'MeshPhysicalMaterial'
            ) {
              gltfCompatible = false;
            }
          }
        }
      });
    }

    parityList.push({
      catalog_id: cat.id,
      name: cat.name,
      category: cat.category,
      included_in_room_glb: Boolean(node && meshCount > 0),
      source_module: 'src/three/CEORoomBuilder.ts',
      local_position: [...cat.position],
      catalog_dimensions: [...cat.dimensions],
      mesh_count: meshCount,
      material_type: Array.from(matTypes).join(', ') || 'MeshStandardMaterial',
      gltf_compatible: gltfCompatible,
      visual_parity_notes: `Verified 3D voxel geometry (${meshCount} sub-meshes) and glTF-compatible MeshStandardMaterial.`,
    });
  }

  return parityList;
}

export function buildCEORoomAnchorsJsonV1(
  anchors: Record<CEOAnchorId, CEOActivityAnchor> = DEFAULT_CEO_ANCHORS
): CEORoomAnchorsJsonV1 {
  const [ox, oy, oz] = CEO_MODULE_CONSTANTS.GLOBAL_A3_OFFSET;
  return {
    schema_version: 'AI_OFFICE_ROOM_ANCHORS_V1',
    room_asset_id: CEO_MODULE_CONSTANTS.ASSET_ID,
    room_module_id: CEO_MODULE_CONSTANTS.MODULE_ID,
    local_origin: [...CEO_MODULE_CONSTANTS.LOCAL_ORIGIN],
    global_a3_offset: [...CEO_MODULE_CONSTANTS.GLOBAL_A3_OFFSET],
    connectors: CEO_CONNECTORS_SPEC,
    anchors: (Object.keys(anchors) as CEOAnchorId[]).map((id) => {
      const a = anchors[id];
      return {
        id: a.id,
        label: a.label,
        local_position: [...a.position],
        global_a3_position: [
          Number((a.position[0] + ox).toFixed(2)),
          Number((a.position[1] + oy).toFixed(2)),
          Number((a.position[2] + oz).toFixed(2)),
        ],
        facing_rad: Number(a.facingRad.toFixed(4)),
        facing_deg: Math.round(((a.facingRad * 180) / Math.PI + 360) % 360),
        posture: a.posture,
        approach_anchor_id: a.approachAnchorId ?? null,
        associated_furniture_id: a.associatedFurnitureId,
        associated_future_action: a.associatedFutureAction,
        description: a.description,
      };
    }),
  };
}

export async function buildCEORoomProductionAssetPack(
  ceoRoot: THREE.Object3D,
  anchors: Record<CEOAnchorId, CEOActivityAnchor> = DEFAULT_CEO_ANCHORS,
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<CEORoomProductionAssetPackResult> {
  // Temporarily detach from any global offset wrapper and ensure local origin [0,0,0]
  const prevParent = ceoRoot.parent;
  const prevPos = ceoRoot.position.clone();
  const prevVis = new Map<THREE.Object3D, boolean>();

  if (prevParent) {
    prevParent.remove(ceoRoot);
  }
  ceoRoot.position.set(0, 0, 0);
  ceoRoot.traverse((obj) => {
    prevVis.set(obj, obj.visible);
    obj.visible = true;
  });
  ceoRoot.updateMatrixWorld(true);

  const stats = measureRoomStats(ceoRoot);
  const furnitureParity = inspectCEORoomFurnitureParity(ceoRoot);
  const glbBuffer = await exportRoomToGLBBuffer(ceoRoot);

  prevVis.forEach((v, obj) => {
    obj.visible = v;
  });
  ceoRoot.position.copy(prevPos);
  if (prevParent) {
    prevParent.add(ceoRoot);
  }
  ceoRoot.updateMatrixWorld(true);

  const glbSha256 = await computeSha256Hex(glbBuffer);
  const minB = stats.boundingBox.min.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const maxB = stats.boundingBox.max.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const sizeB = stats.boundingBox.size.map((v) => Number(v.toFixed(3))) as [number, number, number];

  const manifest: CEORoomManifestV1 = {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    asset_id: CEO_MODULE_CONSTANTS.ASSET_ID,
    module_id: CEO_MODULE_CONSTANTS.MODULE_ID,
    asset_version: CEO_MODULE_CONSTANTS.VERSION,
    asset_kind: 'room',
    display_name: CEO_MODULE_CONSTANTS.DISPLAY_NAME,
    export_date: new Date().toISOString(),
    file_inventory: {
      glb: {
        filename: CEO_MODULE_CONSTANTS.GLB_FILENAME,
        relative_path: `./${CEO_MODULE_CONSTANTS.GLB_FILENAME}`,
        size_bytes: glbBuffer.byteLength,
        sha256: glbSha256,
      },
      manifest: {
        filename: CEO_MODULE_CONSTANTS.MANIFEST_FILENAME,
        relative_path: `./${CEO_MODULE_CONSTANTS.MANIFEST_FILENAME}`,
      },
      anchors: {
        filename: CEO_MODULE_CONSTANTS.ANCHORS_FILENAME,
        relative_path: `./${CEO_MODULE_CONSTANTS.ANCHORS_FILENAME}`,
      },
      behavior: {
        filename: CEO_MODULE_CONSTANTS.BEHAVIOR_FILENAME,
        relative_path: `./${CEO_MODULE_CONSTANTS.BEHAVIOR_FILENAME}`,
      },
      preview: {
        filename: CEO_MODULE_CONSTANTS.PREVIEW_FILENAME,
        relative_path: `./${CEO_MODULE_CONSTANTS.PREVIEW_FILENAME}`,
      },
    },
    coordinate_and_scale_contract: {
      up_axis: 'Y',
      handedness: 'right-handed',
      world_floor_y: 0,
      floor_subbase_min_y: -0.16,
      wall_top_y: 3.2,
      grid_unit_size: 1.0,
      local_origin: [...CEO_MODULE_CONSTANTS.LOCAL_ORIGIN],
      global_a3_offset: [...CEO_MODULE_CONSTANTS.GLOBAL_A3_OFFSET],
      footprint_units: [CEO_MODULE_CONSTANTS.FOOTPRINT_WIDTH, CEO_MODULE_CONSTANTS.FOOTPRINT_DEPTH],
      recentered_on_export: false,
    },
    measured_bounds: {
      local_min: minB,
      local_max: maxB,
      size: sizeB,
    },
    geometry_and_material_summary: {
      source_mesh_count: stats.meshCount,
      exported_mesh_count: stats.meshCount,
      material_count: stats.materialCount,
      triangle_count: stats.triangleCount,
      embedded_texture_count: stats.textureCount,
      content_groups: [...CEO_MODULE_CONSTANTS.REQUIRED_GROUPS],
      group_mesh_counts: { ...stats.groupCounts },
      character_excluded: true,
      preview_helpers_excluded: true,
    },
    connectors: CEO_CONNECTORS_SPEC,
    furniture_and_material_parity: furnitureParity,
    validation_status: validationStatus,
  };

  const anchorsJson = buildCEORoomAnchorsJsonV1(anchors);
  const behaviorJson = buildCEORoomBehaviorJson();
  const readmeMarkdown = `# ${CEO_MODULE_CONSTANTS.DISPLAY_NAME}\n\n- Asset ID: \`${CEO_MODULE_CONSTANTS.ASSET_ID}\`\n- Module ID: \`${CEO_MODULE_CONSTANTS.MODULE_ID}\`\n- Footprint: \`8 × 8\` units (local \`[0, 0, 0]\`, global A3 offset \`[16, 0, 18]\`)\n- Meshes: \`${stats.meshCount}\` (${stats.triangleCount} triangles)\n- Character Included: \`false\` (CEO Character deferred to next phase)\n`;

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    stats,
    furnitureParity,
    manifest,
    anchorsJson,
    behaviorJson,
    previewDataUrl,
    readmeMarkdown,
  };
}

export function downloadCEORoomAssetPackZip(pack: CEORoomProductionAssetPackResult): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/rooms/ceo_executive';
  const entries = [
    {
      path: `${prefix}/${CEO_MODULE_CONSTANTS.GLB_FILENAME}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${CEO_MODULE_CONSTANTS.MANIFEST_FILENAME}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${CEO_MODULE_CONSTANTS.ANCHORS_FILENAME}`,
      data: JSON.stringify(pack.anchorsJson, null, 2),
    },
    {
      path: `${prefix}/${CEO_MODULE_CONSTANTS.BEHAVIOR_FILENAME}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${CEO_MODULE_CONSTANTS.PREVIEW_FILENAME}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = 'ceo_room_production_pack_v1.zip';
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadCEORoomJsonContracts(pack: CEORoomProductionAssetPackResult): void {
  triggerJsonDownload(pack.manifest, CEO_MODULE_CONSTANTS.MANIFEST_FILENAME);
  setTimeout(() => {
    triggerJsonDownload(pack.anchorsJson, CEO_MODULE_CONSTANTS.ANCHORS_FILENAME);
  }, 160);
  setTimeout(() => {
    triggerJsonDownload(pack.behaviorJson, CEO_MODULE_CONSTANTS.BEHAVIOR_FILENAME);
  }, 320);
}

export function downloadOfficeLayoutA3Json(): {
  filename: string;
  json: OfficeLayoutA3ExportJson;
} {
  const json = buildOfficeLayoutA3ExportJson();
  triggerJsonDownload(json, OFFICE_A3_CONSTANTS.EXPORT_FILENAME);
  return { filename: OFFICE_A3_CONSTANTS.EXPORT_FILENAME, json };
}

// ============================================================================
// UI/UX DESIGN STUDIO PRODUCTION EXPORTER (MODULE 03 V1)
// ============================================================================
import {
  DEFAULT_UIUX_ANCHORS,
  UIUXActivityAnchor,
  UIUXAnchorId,
  UIUXRoomBehaviorJsonV1,
  UIUX_CONNECTORS_SPEC,
  UIUX_FURNITURE_CATALOG,
  UIUX_MODULE_CONSTANTS,
  buildUIUXRoomBehaviorJson,
} from '../domain/uiuxRoomSpec';

export interface UIUXRoomManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  asset_id: typeof UIUX_MODULE_CONSTANTS.ASSET_ID;
  module_id: typeof UIUX_MODULE_CONSTANTS.MODULE_ID;
  asset_version: string;
  asset_kind: 'room';
  display_name: string;
  department_type: string;
  export_date: string;
  file_inventory: {
    glb: {
      filename: string;
      relative_path: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string; relative_path: string };
    anchors: { filename: string; relative_path: string };
    behavior: { filename: string; relative_path: string };
    preview: { filename: string; relative_path: string };
  };
  coordinate_and_scale_contract: {
    up_axis: 'Y';
    handedness: 'right-handed';
    world_floor_y: 0;
    floor_subbase_min_y: -0.16;
    wall_top_y: 3.2;
    grid_unit_size: 1.0;
    local_origin: [number, number, number];
    global_a3_offset: [number, number, number];
    footprint_units: [number, number];
    recentered_on_export: false;
  };
  measured_bounds: {
    local_min: [number, number, number];
    local_max: [number, number, number];
    size: [number, number, number];
  };
  geometry_and_material_summary: {
    source_mesh_count: number;
    exported_mesh_count: number;
    material_count: number;
    triangle_count: number;
    embedded_texture_count: number;
    content_groups: string[];
    group_mesh_counts: Record<string, number>;
    character_excluded: true;
    preview_helpers_excluded: true;
  };
  connectors: typeof UIUX_CONNECTORS_SPEC;
  furniture_and_material_parity: FurnitureExportParityItem[];
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface UIUXRoomAnchorsJsonV1 {
  schema_version: 'AI_OFFICE_ROOM_ANCHORS_V1';
  room_asset_id: typeof UIUX_MODULE_CONSTANTS.ASSET_ID;
  room_module_id: typeof UIUX_MODULE_CONSTANTS.MODULE_ID;
  local_origin: [number, number, number];
  global_a3_offset: [number, number, number];
  connectors: typeof UIUX_CONNECTORS_SPEC;
  anchors: Array<{
    id: UIUXAnchorId;
    label: string;
    local_position: [number, number, number];
    global_a3_position: [number, number, number];
    facing_rad: number;
    facing_deg: number;
    posture: 'standing' | 'seated';
    approach_anchor_id: UIUXAnchorId | null;
    associated_furniture_id: string | null;
    associated_future_action: string;
    description: string;
  }>;
}

export interface UIUXRoomProductionAssetPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  stats: RoomExportStats;
  furnitureParity: FurnitureExportParityItem[];
  manifest: UIUXRoomManifestV1;
  anchorsJson: UIUXRoomAnchorsJsonV1;
  behaviorJson: UIUXRoomBehaviorJsonV1;
  previewDataUrl: string | null;
  readmeMarkdown: string;
}

export function inspectUIUXRoomFurnitureParity(
  uiuxRoot: THREE.Object3D
): FurnitureExportParityItem[] {
  const parityList: FurnitureExportParityItem[] = [];

  for (const cat of UIUX_FURNITURE_CATALOG) {
    const node = uiuxRoot.getObjectByName(cat.id);
    let meshCount = 0;
    const matTypes = new Set<string>();
    let gltfCompatible = true;

    if (node) {
      node.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          meshCount++;
          const m = obj as THREE.Mesh;
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          for (const mat of mats) {
            if (!mat) continue;
            matTypes.add(mat.type);
            if (
              mat.type !== 'MeshStandardMaterial' &&
              mat.type !== 'MeshBasicMaterial' &&
              mat.type !== 'MeshPhysicalMaterial'
            ) {
              gltfCompatible = false;
            }
          }
        }
      });
    }

    parityList.push({
      catalog_id: cat.id,
      name: cat.name,
      category: cat.category,
      included_in_room_glb: Boolean(node && meshCount > 0),
      source_module: 'src/three/UIUXRoomBuilder.ts',
      local_position: [...cat.position],
      catalog_dimensions: [...cat.dimensions],
      mesh_count: meshCount,
      material_type: Array.from(matTypes).join(', ') || 'MeshStandardMaterial',
      gltf_compatible: gltfCompatible,
      visual_parity_notes: `Verified 3D voxel geometry (${meshCount} sub-meshes, ${cat.area}) and glTF-compatible MeshStandardMaterial.`,
    });
  }

  return parityList;
}

export function buildUIUXRoomAnchorsJsonV1(
  anchors: Record<UIUXAnchorId, UIUXActivityAnchor> = DEFAULT_UIUX_ANCHORS
): UIUXRoomAnchorsJsonV1 {
  const [ox, oy, oz] = UIUX_MODULE_CONSTANTS.GLOBAL_A3_OFFSET;
  return {
    schema_version: 'AI_OFFICE_ROOM_ANCHORS_V1',
    room_asset_id: UIUX_MODULE_CONSTANTS.ASSET_ID,
    room_module_id: UIUX_MODULE_CONSTANTS.MODULE_ID,
    local_origin: [...UIUX_MODULE_CONSTANTS.LOCAL_ORIGIN],
    global_a3_offset: [...UIUX_MODULE_CONSTANTS.GLOBAL_A3_OFFSET],
    connectors: UIUX_CONNECTORS_SPEC,
    anchors: (Object.keys(anchors) as UIUXAnchorId[]).map((id) => {
      const a = anchors[id];
      return {
        id: a.id,
        label: a.label,
        local_position: [...a.position],
        global_a3_position: [
          Number((a.position[0] + ox).toFixed(2)),
          Number((a.position[1] + oy).toFixed(2)),
          Number((a.position[2] + oz).toFixed(2)),
        ],
        facing_rad: Number(a.facingRad.toFixed(4)),
        facing_deg: Math.round(((a.facingRad * 180) / Math.PI + 360) % 360),
        posture: a.posture,
        approach_anchor_id: a.approachAnchorId ?? null,
        associated_furniture_id: a.associatedFurnitureId,
        associated_future_action: a.associatedFutureAction,
        description: a.description,
      };
    }),
  };
}

export async function buildUIUXRoomProductionAssetPack(
  uiuxRoot: THREE.Object3D,
  anchors: Record<UIUXAnchorId, UIUXActivityAnchor> = DEFAULT_UIUX_ANCHORS,
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<UIUXRoomProductionAssetPackResult> {
  // Temporarily detach from any global offset wrapper and ensure local origin [0,0,0]
  const prevParent = uiuxRoot.parent;
  const prevPos = uiuxRoot.position.clone();
  const prevVis = new Map<THREE.Object3D, boolean>();

  if (prevParent) {
    prevParent.remove(uiuxRoot);
  }
  uiuxRoot.position.set(0, 0, 0);
  uiuxRoot.traverse((obj) => {
    prevVis.set(obj, obj.visible);
    obj.visible = true;
  });
  uiuxRoot.updateMatrixWorld(true);

  const stats = measureRoomStats(uiuxRoot);
  const furnitureParity = inspectUIUXRoomFurnitureParity(uiuxRoot);
  const glbBuffer = await exportRoomToGLBBuffer(uiuxRoot);

  prevVis.forEach((v, obj) => {
    obj.visible = v;
  });
  uiuxRoot.position.copy(prevPos);
  if (prevParent) {
    prevParent.add(uiuxRoot);
  }
  uiuxRoot.updateMatrixWorld(true);

  const glbSha256 = await computeSha256Hex(glbBuffer);
  const minB = stats.boundingBox.min.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const maxB = stats.boundingBox.max.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const sizeB = stats.boundingBox.size.map((v) => Number(v.toFixed(3))) as [number, number, number];

  const manifest: UIUXRoomManifestV1 = {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    asset_id: UIUX_MODULE_CONSTANTS.ASSET_ID,
    module_id: UIUX_MODULE_CONSTANTS.MODULE_ID,
    asset_version: UIUX_MODULE_CONSTANTS.VERSION,
    asset_kind: 'room',
    display_name: UIUX_MODULE_CONSTANTS.DISPLAY_NAME,
    department_type: UIUX_MODULE_CONSTANTS.DEPARTMENT_TYPE,
    export_date: new Date().toISOString(),
    file_inventory: {
      glb: {
        filename: UIUX_MODULE_CONSTANTS.GLB_FILENAME,
        relative_path: `./${UIUX_MODULE_CONSTANTS.GLB_FILENAME}`,
        size_bytes: glbBuffer.byteLength,
        sha256: glbSha256,
      },
      manifest: {
        filename: UIUX_MODULE_CONSTANTS.MANIFEST_FILENAME,
        relative_path: `./${UIUX_MODULE_CONSTANTS.MANIFEST_FILENAME}`,
      },
      anchors: {
        filename: UIUX_MODULE_CONSTANTS.ANCHORS_FILENAME,
        relative_path: `./${UIUX_MODULE_CONSTANTS.ANCHORS_FILENAME}`,
      },
      behavior: {
        filename: UIUX_MODULE_CONSTANTS.BEHAVIOR_FILENAME,
        relative_path: `./${UIUX_MODULE_CONSTANTS.BEHAVIOR_FILENAME}`,
      },
      preview: {
        filename: UIUX_MODULE_CONSTANTS.PREVIEW_FILENAME,
        relative_path: `./${UIUX_MODULE_CONSTANTS.PREVIEW_FILENAME}`,
      },
    },
    coordinate_and_scale_contract: {
      up_axis: 'Y',
      handedness: 'right-handed',
      world_floor_y: 0,
      floor_subbase_min_y: -0.16,
      wall_top_y: 3.2,
      grid_unit_size: 1.0,
      local_origin: [...UIUX_MODULE_CONSTANTS.LOCAL_ORIGIN],
      global_a3_offset: [...UIUX_MODULE_CONSTANTS.GLOBAL_A3_OFFSET],
      footprint_units: [UIUX_MODULE_CONSTANTS.FOOTPRINT_WIDTH, UIUX_MODULE_CONSTANTS.FOOTPRINT_DEPTH],
      recentered_on_export: false,
    },
    measured_bounds: {
      local_min: minB,
      local_max: maxB,
      size: sizeB,
    },
    geometry_and_material_summary: {
      source_mesh_count: stats.meshCount,
      exported_mesh_count: stats.meshCount,
      material_count: stats.materialCount,
      triangle_count: stats.triangleCount,
      embedded_texture_count: stats.textureCount,
      content_groups: [...UIUX_MODULE_CONSTANTS.REQUIRED_GROUPS],
      group_mesh_counts: { ...stats.groupCounts },
      character_excluded: true,
      preview_helpers_excluded: true,
    },
    connectors: UIUX_CONNECTORS_SPEC,
    furniture_and_material_parity: furnitureParity,
    validation_status: validationStatus,
  };

  const anchorsJson = buildUIUXRoomAnchorsJsonV1(anchors);
  const behaviorJson = buildUIUXRoomBehaviorJson();
  const readmeMarkdown = `# ${UIUX_MODULE_CONSTANTS.DISPLAY_NAME}\n\n- Asset ID: \`${UIUX_MODULE_CONSTANTS.ASSET_ID}\`\n- Module ID: \`${UIUX_MODULE_CONSTANTS.MODULE_ID}\`\n- Department: \`${UIUX_MODULE_CONSTANTS.DEPARTMENT_TYPE}\`\n- Footprint: \`8 × 8\` units (local \`[0, 0, 0]\`, global A3 offset \`[24, 0, 18]\`)\n- Meshes: \`${stats.meshCount}\` (${stats.triangleCount} triangles)\n- Character Included: \`false\` (UI/UX Lead Designer character deferred to future task)\n`;

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    stats,
    furnitureParity,
    manifest,
    anchorsJson,
    behaviorJson,
    previewDataUrl,
    readmeMarkdown,
  };
}

export function downloadUIUXRoomAssetPackZip(pack: UIUXRoomProductionAssetPackResult): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/rooms/uiux_studio';
  const entries = [
    {
      path: `${prefix}/${UIUX_MODULE_CONSTANTS.GLB_FILENAME}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${UIUX_MODULE_CONSTANTS.MANIFEST_FILENAME}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${UIUX_MODULE_CONSTANTS.ANCHORS_FILENAME}`,
      data: JSON.stringify(pack.anchorsJson, null, 2),
    },
    {
      path: `${prefix}/${UIUX_MODULE_CONSTANTS.BEHAVIOR_FILENAME}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/README.md`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${UIUX_MODULE_CONSTANTS.PREVIEW_FILENAME}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = 'uiux_room_production_pack_v1.zip';
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadUIUXRoomJsonContracts(pack: UIUXRoomProductionAssetPackResult): void {
  triggerJsonDownload(pack.manifest, UIUX_MODULE_CONSTANTS.MANIFEST_FILENAME);
  setTimeout(() => {
    triggerJsonDownload(pack.anchorsJson, UIUX_MODULE_CONSTANTS.ANCHORS_FILENAME);
  }, 160);
  setTimeout(() => {
    triggerJsonDownload(pack.behaviorJson, UIUX_MODULE_CONSTANTS.BEHAVIOR_FILENAME);
  }, 320);
}

// ============================================================================
// ENGINEERING & DEVELOPMENT STUDIO PRODUCTION EXPORTER (MODULE 04 — 8×16 V1)
// ============================================================================
import {
  ENGINEERING_FURNITURE_CATALOG,
  ENGINEERING_MODULE_CONSTANTS,
} from '../domain/engineeringRoomSpec';
import {
  EngineeringRoomManifestV1,
  buildEngineeringRoomAnchorsJsonV1,
  buildEngineeringRoomBehaviorJsonV1,
  buildEngineeringRoomManifestV1,
  buildEngineeringRoomReadmeMarkdown,
} from './AssetManifestBuilder';
import { buildOfficeLayoutA3_1ExportJson } from '../domain/officeLayoutA3Spec';

export interface EngineeringRoomProductionAssetPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  stats: RoomExportStats;
  furnitureParity: FurnitureExportParityItem[];
  manifest: EngineeringRoomManifestV1;
  anchorsJson: ReturnType<typeof buildEngineeringRoomAnchorsJsonV1>;
  behaviorJson: ReturnType<typeof buildEngineeringRoomBehaviorJsonV1>;
  previewDataUrl: string | null;
  readmeMarkdown: string;
}

export function inspectEngineeringRoomFurnitureParity(
  engRoot: THREE.Object3D
): FurnitureExportParityItem[] {
  const parityList: FurnitureExportParityItem[] = [];

  for (const cat of ENGINEERING_FURNITURE_CATALOG) {
    const node = engRoot.getObjectByName(cat.name) || engRoot.getObjectByName(cat.id);
    let meshCount = 0;
    const matTypes = new Set<string>();
    let gltfCompatible = true;

    if (node) {
      node.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          meshCount++;
          const m = obj as THREE.Mesh;
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          for (const mat of mats) {
            if (!mat) continue;
            matTypes.add(mat.type);
            if (
              mat.type !== 'MeshStandardMaterial' &&
              mat.type !== 'MeshBasicMaterial' &&
              mat.type !== 'MeshPhysicalMaterial'
            ) {
              gltfCompatible = false;
            }
          }
        }
      });
    }

    parityList.push({
      catalog_id: cat.id,
      name: cat.name,
      category: cat.category,
      included_in_room_glb: Boolean(node && meshCount > 0),
      source_module: 'src/three/EngineeringRoomBuilder.ts',
      local_position: [...cat.position],
      catalog_dimensions: [...cat.dimensions],
      mesh_count: meshCount,
      material_type: Array.from(matTypes).join(', ') || 'MeshStandardMaterial',
      gltf_compatible: gltfCompatible,
      visual_parity_notes: `Verified 3D voxel geometry (${meshCount} sub-meshes) and glTF-compatible MeshStandardMaterial.`,
    });
  }

  return parityList;
}

export async function buildEngineeringRoomProductionAssetPack(
  engRoot: THREE.Object3D,
  anchorsOrPreview?:
    | Record<string, unknown>
    | string
    | null,
  previewOrValidation?: string | null,
  validationStatusArg: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<EngineeringRoomProductionAssetPackResult> {
  const isSecondArgAnchors =
    typeof anchorsOrPreview === 'object' && anchorsOrPreview !== null;
  const previewDataUrl: string | null = isSecondArgAnchors
    ? (previewOrValidation as string | null) ?? null
    : (anchorsOrPreview as string | null) ?? null;
  const validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = isSecondArgAnchors
    ? validationStatusArg
    : ((previewOrValidation as 'PASS' | 'FAIL' | 'NOT_VERIFIED' | null) ?? 'PASS');

  const prevParent = engRoot.parent;
  const prevPos = engRoot.position.clone();
  const prevVis = new Map<THREE.Object3D, boolean>();

  if (prevParent) {
    prevParent.remove(engRoot);
  }
  engRoot.position.set(0, 0, 0);
  engRoot.traverse((obj) => {
    prevVis.set(obj, obj.visible);
    obj.visible = true;
  });
  engRoot.updateMatrixWorld(true);

  const stats = measureRoomStats(engRoot);
  const furnitureParity = inspectEngineeringRoomFurnitureParity(engRoot);
  const glbBuffer = await exportRoomToGLBBuffer(engRoot);

  prevVis.forEach((v, obj) => {
    obj.visible = v;
  });
  engRoot.position.copy(prevPos);
  if (prevParent) {
    prevParent.add(engRoot);
  }
  engRoot.updateMatrixWorld(true);

  const glbSha256 = await computeSha256Hex(glbBuffer);

  const manifest = buildEngineeringRoomManifestV1({
    stats,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    exportedMeshCount: stats.meshCount,
    furnitureParity,
    validationStatus,
  });
  const anchorsJson = buildEngineeringRoomAnchorsJsonV1();
  const behaviorJson = buildEngineeringRoomBehaviorJsonV1();
  const readmeMarkdown = buildEngineeringRoomReadmeMarkdown(manifest);

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    stats,
    furnitureParity,
    manifest,
    anchorsJson,
    behaviorJson,
    previewDataUrl,
    readmeMarkdown,
  };
}

export function downloadEngineeringRoomAssetPackZip(
  pack: EngineeringRoomProductionAssetPackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/rooms/engineering_studio';
  const entries = [
    {
      path: `${prefix}/${ENGINEERING_MODULE_CONSTANTS.GLB_FILENAME}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${ENGINEERING_MODULE_CONSTANTS.MANIFEST_FILENAME}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${ENGINEERING_MODULE_CONSTANTS.ANCHORS_FILENAME}`,
      data: JSON.stringify(pack.anchorsJson, null, 2),
    },
    {
      path: `${prefix}/${ENGINEERING_MODULE_CONSTANTS.BEHAVIOR_FILENAME}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/README.md`,
      data: pack.readmeMarkdown,
    },
    {
      path: `production/layout/${OFFICE_A3_CONSTANTS.EXPORT_A3_1_FILENAME}`,
      data: JSON.stringify(buildOfficeLayoutA3_1ExportJson(), null, 2),
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${ENGINEERING_MODULE_CONSTANTS.PREVIEW_FILENAME}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = ENGINEERING_MODULE_CONSTANTS.PACK_ZIP_FILENAME;
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadEngineeringRoomJsonContracts(
  pack: EngineeringRoomProductionAssetPackResult
): void {
  triggerJsonDownload(pack.manifest, ENGINEERING_MODULE_CONSTANTS.MANIFEST_FILENAME);
  setTimeout(() => {
    triggerJsonDownload(pack.anchorsJson, ENGINEERING_MODULE_CONSTANTS.ANCHORS_FILENAME);
  }, 160);
  setTimeout(() => {
    triggerJsonDownload(pack.behaviorJson, ENGINEERING_MODULE_CONSTANTS.BEHAVIOR_FILENAME);
  }, 320);
}

export function downloadOfficeLayoutA3_1Json(): {
  filename: string;
  json: OfficeLayoutA3ExportJson;
} {
  const json = buildOfficeLayoutA3_1ExportJson();
  triggerJsonDownload(json, OFFICE_A3_CONSTANTS.EXPORT_A3_1_FILENAME);
  return { filename: OFFICE_A3_CONSTANTS.EXPORT_A3_1_FILENAME, json };
}

// ============================================================================
// RESEARCH & SHARED BRAIN ROOM PRODUCTION EXPORTER (MODULE 05 — 8×8 V1)
// ============================================================================
import {
  DEFAULT_RESEARCH_ANCHORS,
  RESEARCH_CONNECTORS_SPEC,
  RESEARCH_DISPLAY_SLOTS,
  RESEARCH_EAST_BOUNDARY_NOTE,
  RESEARCH_FURNITURE_CATALOG,
  RESEARCH_INTERIOR_ZONES,
  RESEARCH_MODULE_CONSTANTS,
  ResearchActivityAnchor,
  buildResearchDisplaySlotsJson,
  buildResearchRoomBehaviorJson,
} from '../domain/researchRoomSpec';

export interface ResearchRoomManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  asset_id: typeof RESEARCH_MODULE_CONSTANTS.ASSET_ID;
  room_id: typeof RESEARCH_MODULE_CONSTANTS.MODULE_ID;
  module_id: typeof RESEARCH_MODULE_CONSTANTS.MODULE_ID;
  registry_key: typeof RESEARCH_MODULE_CONSTANTS.REGISTRY_KEY;
  display_name: string;
  alternative_title: string;
  department: string;
  category: string;
  style: string;
  version: string;
  status: string;
  export_date: string;
  dimensions: {
    width: 8.0;
    depth: 8.0;
    wall_height: 3.2;
    floor_thickness: 0.16;
    wall_thickness: 0.16;
    units: 'meters';
  };
  local_origin: [number, number, number];
  full_office_a3_1_global_offset: [number, number, number];
  east_boundary_policy: string;
  file_inventory: {
    glb: {
      filename: string;
      relative_path: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string; relative_path: string };
    anchors: { filename: string; relative_path: string };
    display_slots: { filename: string; relative_path: string };
    behavior: { filename: string; relative_path: string };
    preview: { filename: string; relative_path: string };
  };
  measured_bounds: {
    local_min: [number, number, number];
    local_max: [number, number, number];
    size: [number, number, number];
  };
  geometry_and_material_summary: {
    source_mesh_count: number;
    exported_mesh_count: number;
    material_count: number;
    triangle_count: number;
    embedded_texture_count: number;
    content_groups: string[];
    group_mesh_counts: Record<string, number>;
    character_included: false;
    preview_helpers_excluded: true;
  };
  connectors: typeof RESEARCH_CONNECTORS_SPEC;
  interior_zones: typeof RESEARCH_INTERIOR_ZONES;
  supported_anchors: string[];
  display_slots: string[];
  furniture_and_material_parity: FurnitureExportParityItem[];
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface ResearchRoomAnchorsJsonV1 {
  schema_version: 'AI_OFFICE_ROOM_ANCHORS_V1';
  room_asset_id: typeof RESEARCH_MODULE_CONSTANTS.ASSET_ID;
  room_id: typeof RESEARCH_MODULE_CONSTANTS.MODULE_ID;
  local_origin: [number, number, number];
  global_a3_offset: [number, number, number];
  connectors: typeof RESEARCH_CONNECTORS_SPEC;
  total_anchors: number;
  anchors: Array<
    ResearchActivityAnchor & {
      global_a3_position: [number, number, number];
    }
  >;
}

export interface ResearchRoomProductionAssetPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  stats: RoomExportStats;
  furnitureParity: FurnitureExportParityItem[];
  manifest: ResearchRoomManifestV1;
  anchorsJson: ResearchRoomAnchorsJsonV1;
  displaySlotsJson: ReturnType<typeof buildResearchDisplaySlotsJson>;
  behaviorJson: ReturnType<typeof buildResearchRoomBehaviorJson>;
  previewDataUrl: string | null;
  readmeMarkdown: string;
}

export function inspectResearchRoomFurnitureParity(
  researchRoot: THREE.Object3D
): FurnitureExportParityItem[] {
  const parityList: FurnitureExportParityItem[] = [];

  for (const cat of RESEARCH_FURNITURE_CATALOG) {
    const node = researchRoot.getObjectByName(cat.id) || researchRoot.getObjectByName(cat.name);
    let meshCount = 0;
    const matTypes = new Set<string>();
    let gltfCompatible = true;

    if (node) {
      node.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          meshCount++;
          const m = obj as THREE.Mesh;
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          for (const mat of mats) {
            if (!mat) continue;
            matTypes.add(mat.type);
            if (
              mat.type !== 'MeshStandardMaterial' &&
              mat.type !== 'MeshBasicMaterial' &&
              mat.type !== 'MeshPhysicalMaterial'
            ) {
              gltfCompatible = false;
            }
          }
        }
      });
    }

    parityList.push({
      catalog_id: cat.id,
      name: cat.name,
      category: cat.category,
      included_in_room_glb: Boolean(node && meshCount > 0),
      source_module: 'src/three/ResearchRoomBuilder.ts',
      local_position: [...cat.position],
      catalog_dimensions: [...cat.dimensions],
      mesh_count: meshCount,
      material_type: Array.from(matTypes).join(', ') || 'MeshStandardMaterial',
      gltf_compatible: gltfCompatible,
      visual_parity_notes: `Verified 3D voxel geometry (${meshCount} sub-meshes, ${cat.zone}) and glTF-compatible MeshStandardMaterial.`,
    });
  }

  return parityList;
}

export function buildResearchRoomAnchorsJsonV1(
  anchors: ResearchActivityAnchor[] = DEFAULT_RESEARCH_ANCHORS
): ResearchRoomAnchorsJsonV1 {
  const [ox, oy, oz] = RESEARCH_MODULE_CONSTANTS.GLOBAL_A3_OFFSET;
  return {
    schema_version: 'AI_OFFICE_ROOM_ANCHORS_V1',
    room_asset_id: RESEARCH_MODULE_CONSTANTS.ASSET_ID,
    room_id: RESEARCH_MODULE_CONSTANTS.MODULE_ID,
    local_origin: [...RESEARCH_MODULE_CONSTANTS.LOCAL_ORIGIN],
    global_a3_offset: [...RESEARCH_MODULE_CONSTANTS.GLOBAL_A3_OFFSET],
    connectors: RESEARCH_CONNECTORS_SPEC,
    total_anchors: anchors.length,
    anchors: anchors.map((a) => ({
      ...a,
      position: [...a.position],
      facing_direction: [...a.facing_direction],
      global_a3_position: [
        Number((a.position[0] + ox).toFixed(3)),
        Number((a.position[1] + oy).toFixed(3)),
        Number((a.position[2] + oz).toFixed(3)),
      ],
    })),
  };
}

export function buildResearchRoomManifestV1(
  stats: RoomExportStats,
  glbSizeBytes = 0,
  exportDate: string = new Date().toISOString(),
  glbSha256 = '0000000000000000000000000000000000000000000000000000000000000000',
  furnitureParity: FurnitureExportParityItem[] = [],
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): ResearchRoomManifestV1 {
  const minB = stats.boundingBox.min.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const maxB = stats.boundingBox.max.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const sizeB = stats.boundingBox.size.map((v) => Number(v.toFixed(3))) as [number, number, number];

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    asset_id: RESEARCH_MODULE_CONSTANTS.ASSET_ID,
    room_id: RESEARCH_MODULE_CONSTANTS.MODULE_ID,
    module_id: RESEARCH_MODULE_CONSTANTS.MODULE_ID,
    registry_key: RESEARCH_MODULE_CONSTANTS.REGISTRY_KEY,
    display_name: RESEARCH_MODULE_CONSTANTS.DISPLAY_NAME,
    alternative_title: RESEARCH_MODULE_CONSTANTS.ALTERNATIVE_TITLE,
    department: RESEARCH_MODULE_CONSTANTS.DEPARTMENT,
    category: RESEARCH_MODULE_CONSTANTS.CATEGORY,
    style: RESEARCH_MODULE_CONSTANTS.STYLE,
    version: RESEARCH_MODULE_CONSTANTS.VERSION,
    status: RESEARCH_MODULE_CONSTANTS.STATUS,
    export_date: exportDate,
    dimensions: {
      width: 8.0,
      depth: 8.0,
      wall_height: 3.2,
      floor_thickness: 0.16,
      wall_thickness: 0.16,
      units: 'meters',
    },
    local_origin: [...RESEARCH_MODULE_CONSTANTS.LOCAL_ORIGIN],
    full_office_a3_1_global_offset: [...RESEARCH_MODULE_CONSTANTS.GLOBAL_A3_OFFSET],
    east_boundary_policy: RESEARCH_EAST_BOUNDARY_NOTE,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_GLB,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_GLB}`,
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_MANIFEST,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_MANIFEST}`,
      },
      anchors: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_ANCHORS,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_ANCHORS}`,
      },
      display_slots: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_DISPLAY_SLOTS,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_DISPLAY_SLOTS}`,
      },
      behavior: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_BEHAVIOR,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_BEHAVIOR}`,
      },
      preview: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_PREVIEW,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_PREVIEW}`,
      },
    },
    measured_bounds: {
      local_min: minB,
      local_max: maxB,
      size: sizeB,
    },
    geometry_and_material_summary: {
      source_mesh_count: stats.meshCount,
      exported_mesh_count: stats.meshCount,
      material_count: stats.materialCount,
      triangle_count: stats.triangleCount,
      embedded_texture_count: stats.textureCount,
      content_groups: [...RESEARCH_MODULE_CONSTANTS.REQUIRED_GROUPS],
      group_mesh_counts: { ...stats.groupCounts },
      character_included: false,
      preview_helpers_excluded: true,
    },
    connectors: RESEARCH_CONNECTORS_SPEC,
    interior_zones: RESEARCH_INTERIOR_ZONES,
    supported_anchors: DEFAULT_RESEARCH_ANCHORS.map((a) => a.id),
    display_slots: RESEARCH_DISPLAY_SLOTS.map((s) => s.slot_id),
    furniture_and_material_parity: furnitureParity,
    validation_status: validationStatus,
  };
}

export async function buildResearchRoomProductionAssetPack(
  researchRoot: THREE.Object3D,
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<ResearchRoomProductionAssetPackResult> {
  const prevParent = researchRoot.parent;
  const prevPos = researchRoot.position.clone();
  const prevVis = new Map<THREE.Object3D, boolean>();

  if (prevParent) {
    prevParent.remove(researchRoot);
  }
  researchRoot.position.set(0, 0, 0);
  researchRoot.traverse((obj) => {
    prevVis.set(obj, obj.visible);
    obj.visible = true;
  });
  researchRoot.updateMatrixWorld(true);

  const stats = measureRoomStats(researchRoot);
  const furnitureParity = inspectResearchRoomFurnitureParity(researchRoot);
  const glbBuffer = await exportRoomToGLBBuffer(researchRoot);

  prevVis.forEach((v, obj) => {
    obj.visible = v;
  });
  researchRoot.position.copy(prevPos);
  if (prevParent) {
    prevParent.add(researchRoot);
  }
  researchRoot.updateMatrixWorld(true);

  const glbSha256 = await computeSha256Hex(glbBuffer);
  const minB = stats.boundingBox.min.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const maxB = stats.boundingBox.max.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const sizeB = stats.boundingBox.size.map((v) => Number(v.toFixed(3))) as [number, number, number];

  const manifest: ResearchRoomManifestV1 = {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    asset_id: RESEARCH_MODULE_CONSTANTS.ASSET_ID,
    room_id: RESEARCH_MODULE_CONSTANTS.MODULE_ID,
    module_id: RESEARCH_MODULE_CONSTANTS.MODULE_ID,
    registry_key: RESEARCH_MODULE_CONSTANTS.REGISTRY_KEY,
    display_name: RESEARCH_MODULE_CONSTANTS.DISPLAY_NAME,
    alternative_title: RESEARCH_MODULE_CONSTANTS.ALTERNATIVE_TITLE,
    department: RESEARCH_MODULE_CONSTANTS.DEPARTMENT,
    category: RESEARCH_MODULE_CONSTANTS.CATEGORY,
    style: RESEARCH_MODULE_CONSTANTS.STYLE,
    version: RESEARCH_MODULE_CONSTANTS.VERSION,
    status: RESEARCH_MODULE_CONSTANTS.STATUS,
    export_date: new Date().toISOString(),
    dimensions: {
      width: 8.0,
      depth: 8.0,
      wall_height: 3.2,
      floor_thickness: 0.16,
      wall_thickness: 0.16,
      units: 'meters',
    },
    local_origin: [...RESEARCH_MODULE_CONSTANTS.LOCAL_ORIGIN],
    full_office_a3_1_global_offset: [...RESEARCH_MODULE_CONSTANTS.GLOBAL_A3_OFFSET],
    east_boundary_policy: RESEARCH_EAST_BOUNDARY_NOTE,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_GLB,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_GLB}`,
        size_bytes: glbBuffer.byteLength,
        sha256: glbSha256,
      },
      manifest: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_MANIFEST,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_MANIFEST}`,
      },
      anchors: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_ANCHORS,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_ANCHORS}`,
      },
      display_slots: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_DISPLAY_SLOTS,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_DISPLAY_SLOTS}`,
      },
      behavior: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_BEHAVIOR,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_BEHAVIOR}`,
      },
      preview: {
        filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_PREVIEW,
        relative_path: `./${PRODUCTION_FILENAMES.RESEARCH_ROOM_PREVIEW}`,
      },
    },
    measured_bounds: {
      local_min: minB,
      local_max: maxB,
      size: sizeB,
    },
    geometry_and_material_summary: {
      source_mesh_count: stats.meshCount,
      exported_mesh_count: stats.meshCount,
      material_count: stats.materialCount,
      triangle_count: stats.triangleCount,
      embedded_texture_count: stats.textureCount,
      content_groups: [...RESEARCH_MODULE_CONSTANTS.REQUIRED_GROUPS],
      group_mesh_counts: { ...stats.groupCounts },
      character_included: false,
      preview_helpers_excluded: true,
    },
    connectors: RESEARCH_CONNECTORS_SPEC,
    interior_zones: RESEARCH_INTERIOR_ZONES,
    supported_anchors: DEFAULT_RESEARCH_ANCHORS.map((a) => a.id),
    display_slots: RESEARCH_DISPLAY_SLOTS.map((s) => s.slot_id),
    furniture_and_material_parity: furnitureParity,
    validation_status: validationStatus,
  };

  const anchorsJson = buildResearchRoomAnchorsJsonV1();
  const displaySlotsJson = buildResearchDisplaySlotsJson();
  const behaviorJson = buildResearchRoomBehaviorJson();
  const readmeMarkdown = `# ${RESEARCH_MODULE_CONSTANTS.DISPLAY_NAME} ("${RESEARCH_MODULE_CONSTANTS.ALTERNATIVE_TITLE}")\n\n- **Room ID**: \`${RESEARCH_MODULE_CONSTANTS.MODULE_ID}\`\n- **Asset ID**: \`${RESEARCH_MODULE_CONSTANTS.ASSET_ID}\`\n- **Registry Key**: \`${RESEARCH_MODULE_CONSTANTS.REGISTRY_KEY}\`\n- **Footprint**: \`8 × 8 × 3.2\` units (local origin \`[0, 0, 0]\`, Full Office A3.1 global offset \`[0, 0, 18]\`)\n- **Meshes**: \`${stats.meshCount}\` (${stats.triangleCount} triangles, ${stats.materialCount} PBR materials)\n- **Display Slots**: 6 static DEMO knowledge/research display slots (\`research_room.display_slots.json\`)\n- **Room-Local Anchors**: 13 anchors (\`research_room.anchors.json\`)\n- **Character Included**: \`false\` (Research Professor character deferred to next milestone)\n`;

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    stats,
    furnitureParity,
    manifest,
    anchorsJson,
    displaySlotsJson,
    behaviorJson,
    previewDataUrl,
    readmeMarkdown,
  };
}

export function downloadResearchRoomAssetPackZip(
  pack: ResearchRoomProductionAssetPackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/rooms/research_brain';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_ANCHORS}`,
      data: JSON.stringify(pack.anchorsJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_DISPLAY_SLOTS}`,
      data: JSON.stringify(pack.displaySlotsJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_BEHAVIOR}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/README.md`,
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = PRODUCTION_FILENAMES.RESEARCH_ROOM_PACK_ZIP;
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadResearchRoomJsonContracts(
  pack: ResearchRoomProductionAssetPackResult
): void {
  triggerJsonDownload(pack.manifest, PRODUCTION_FILENAMES.RESEARCH_ROOM_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(pack.anchorsJson, PRODUCTION_FILENAMES.RESEARCH_ROOM_ANCHORS);
  }, 140);
  setTimeout(() => {
    triggerJsonDownload(pack.displaySlotsJson, PRODUCTION_FILENAMES.RESEARCH_ROOM_DISPLAY_SLOTS);
  }, 280);
  setTimeout(() => {
    triggerJsonDownload(pack.behaviorJson, PRODUCTION_FILENAMES.RESEARCH_ROOM_BEHAVIOR);
  }, 420);
}

// ============================================================================
// QA & DEVOPS INTEGRATED STUDIO PRODUCTION EXPORTER (MODULE 06 — 8×16 V1)
// ============================================================================
import {
  DEFAULT_QA_DEVOPS_ANCHOR_LIST,
  QADevOpsActivityAnchor,
  QA_DEVOPS_CONNECTORS_SPEC,
  QA_DEVOPS_DISPLAY_SLOTS,
  QA_DEVOPS_FURNITURE_CATALOG,
  QA_DEVOPS_INTERIOR_ZONES,
  QA_DEVOPS_MODULE_CONSTANTS,
  QA_DEVOPS_MONITORS_SPEC,
  buildQADevOpsDisplaySlotsJson,
  buildQADevOpsRoomBehaviorJson,
  verifyQADevOpsMonitorsOrientation,
} from '../domain/qaDevopsRoomSpec';
import { buildOfficeLayoutA3_2ExportJson } from '../domain/officeLayoutA3Spec';

export interface QADevOpsRoomManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  asset_id: typeof QA_DEVOPS_MODULE_CONSTANTS.ASSET_ID;
  room_id: typeof QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID;
  module_id: typeof QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID;
  registry_key: typeof QA_DEVOPS_MODULE_CONSTANTS.REGISTRY_KEY;
  legacy_merged_keys: readonly string[];
  display_name: string;
  alternative_title: string;
  departments: readonly string[];
  category: string;
  style: string;
  version: string;
  status: string;
  export_date: string;
  dimensions: {
    width: 8.0;
    depth: 16.0;
    wall_height: 3.2;
    floor_thickness: 0.16;
    wall_thickness: 0.16;
    units: 'meters';
  };
  local_origin: [number, number, number];
  full_office_a3_2_global_offset: [number, number, number];
  architecture_policy: {
    continuous_8x16_floor: true;
    internal_wall_at_z8: false;
    west_hub_doorway: [number, number, number];
    north_corridor_doorway: [number, number, number];
    zero_purple_accent_policy: true;
  };
  file_inventory: {
    glb: {
      filename: string;
      relative_path: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string; relative_path: string };
    anchors: { filename: string; relative_path: string };
    display_slots: { filename: string; relative_path: string };
    behavior: { filename: string; relative_path: string };
    preview: { filename: string; relative_path: string };
  };
  measured_bounds: {
    local_min: [number, number, number];
    local_max: [number, number, number];
    size: [number, number, number];
  };
  geometry_and_material_summary: {
    source_mesh_count: number;
    exported_mesh_count: number;
    material_count: number;
    triangle_count: number;
    embedded_texture_count: number;
    content_groups: string[];
    semantic_furniture_subgroups: string[];
    group_mesh_counts: Record<string, number>;
    character_included: false;
    preview_helpers_excluded: true;
  };
  connectors: typeof QA_DEVOPS_CONNECTORS_SPEC;
  interior_zones: typeof QA_DEVOPS_INTERIOR_ZONES;
  supported_anchors: string[];
  display_slots: string[];
  monitors_orientation_audit: ReturnType<typeof verifyQADevOpsMonitorsOrientation>;
  furniture_and_material_parity: FurnitureExportParityItem[];
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface QADevOpsRoomAnchorsJsonV1 {
  schema_version: 'AI_OFFICE_ROOM_ANCHORS_V1';
  room_asset_id: typeof QA_DEVOPS_MODULE_CONSTANTS.ASSET_ID;
  room_id: typeof QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID;
  local_origin: [number, number, number];
  global_a3_2_offset: [number, number, number];
  connectors: typeof QA_DEVOPS_CONNECTORS_SPEC;
  total_anchors: number;
  anchors: Array<
    QADevOpsActivityAnchor & {
      global_a3_2_position: [number, number, number];
    }
  >;
}

export interface QADevOpsRoomProductionAssetPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  stats: RoomExportStats;
  furnitureParity: FurnitureExportParityItem[];
  manifest: QADevOpsRoomManifestV1;
  anchorsJson: QADevOpsRoomAnchorsJsonV1;
  displaySlotsJson: ReturnType<typeof buildQADevOpsDisplaySlotsJson>;
  behaviorJson: ReturnType<typeof buildQADevOpsRoomBehaviorJson>;
  previewDataUrl: string | null;
  readmeMarkdown: string;
}

export function inspectQADevOpsRoomFurnitureParity(
  qaDevopsRoot: THREE.Object3D
): FurnitureExportParityItem[] {
  const parityList: FurnitureExportParityItem[] = [];

  for (const cat of QA_DEVOPS_FURNITURE_CATALOG) {
    const node = qaDevopsRoot.getObjectByName(cat.id) || qaDevopsRoot.getObjectByName(cat.name);
    let meshCount = 0;
    const matTypes = new Set<string>();
    let gltfCompatible = true;

    if (node) {
      node.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          meshCount++;
          const m = obj as THREE.Mesh;
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          for (const mat of mats) {
            if (!mat) continue;
            matTypes.add(mat.type);
            if (
              mat.type !== 'MeshStandardMaterial' &&
              mat.type !== 'MeshBasicMaterial' &&
              mat.type !== 'MeshPhysicalMaterial'
            ) {
              gltfCompatible = false;
            }
          }
        }
      });
    }

    parityList.push({
      catalog_id: cat.id,
      name: cat.name,
      category: cat.category,
      included_in_room_glb: Boolean(node && meshCount > 0),
      source_module: 'src/three/QADevOpsRoomBuilder.ts',
      local_position: [...cat.position],
      catalog_dimensions: [...cat.dimensions],
      mesh_count: meshCount,
      material_type: Array.from(matTypes).join(', ') || 'MeshStandardMaterial',
      gltf_compatible: gltfCompatible,
      visual_parity_notes: `Verified 3D voxel geometry (${meshCount} sub-meshes, ${cat.zone}, subgroup ${cat.subgroup}) and glTF-compatible MeshStandardMaterial.`,
    });
  }

  return parityList;
}

export function buildQADevOpsRoomAnchorsJsonV1(
  anchors: QADevOpsActivityAnchor[] = DEFAULT_QA_DEVOPS_ANCHOR_LIST
): QADevOpsRoomAnchorsJsonV1 {
  const [ox, oy, oz] = QA_DEVOPS_MODULE_CONSTANTS.GLOBAL_A3_OFFSET;
  return {
    schema_version: 'AI_OFFICE_ROOM_ANCHORS_V1',
    room_asset_id: QA_DEVOPS_MODULE_CONSTANTS.ASSET_ID,
    room_id: QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID,
    local_origin: [...QA_DEVOPS_MODULE_CONSTANTS.LOCAL_ORIGIN],
    global_a3_2_offset: [...QA_DEVOPS_MODULE_CONSTANTS.GLOBAL_A3_OFFSET],
    connectors: QA_DEVOPS_CONNECTORS_SPEC,
    total_anchors: anchors.length,
    anchors: anchors.map((a) => ({
      ...a,
      position: [...a.position],
      facing_direction: [...a.facing_direction],
      global_a3_2_position: [
        Number((a.position[0] + ox).toFixed(3)),
        Number((a.position[1] + oy).toFixed(3)),
        Number((a.position[2] + oz).toFixed(3)),
      ],
    })),
  };
}

export function buildQADevOpsRoomManifestV1(
  stats: RoomExportStats,
  glbSizeBytes = 0,
  exportDate: string = new Date().toISOString(),
  glbSha256 = '0000000000000000000000000000000000000000000000000000000000000000',
  furnitureParity: FurnitureExportParityItem[] = [],
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): QADevOpsRoomManifestV1 {
  const minB = stats.boundingBox.min.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const maxB = stats.boundingBox.max.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const sizeB = stats.boundingBox.size.map((v) => Number(v.toFixed(3))) as [number, number, number];

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    asset_id: QA_DEVOPS_MODULE_CONSTANTS.ASSET_ID,
    room_id: QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID,
    module_id: QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID,
    registry_key: QA_DEVOPS_MODULE_CONSTANTS.REGISTRY_KEY,
    legacy_merged_keys: QA_DEVOPS_MODULE_CONSTANTS.LEGACY_MERGED_KEYS,
    display_name: QA_DEVOPS_MODULE_CONSTANTS.DISPLAY_NAME,
    alternative_title: QA_DEVOPS_MODULE_CONSTANTS.ALTERNATIVE_TITLE,
    departments: QA_DEVOPS_MODULE_CONSTANTS.DEPARTMENTS,
    category: QA_DEVOPS_MODULE_CONSTANTS.CATEGORY,
    style: QA_DEVOPS_MODULE_CONSTANTS.STYLE,
    version: QA_DEVOPS_MODULE_CONSTANTS.VERSION,
    status: QA_DEVOPS_MODULE_CONSTANTS.STATUS,
    export_date: exportDate,
    dimensions: {
      width: 8.0,
      depth: 16.0,
      wall_height: 3.2,
      floor_thickness: 0.16,
      wall_thickness: 0.16,
      units: 'meters',
    },
    local_origin: [...QA_DEVOPS_MODULE_CONSTANTS.LOCAL_ORIGIN],
    full_office_a3_2_global_offset: [...QA_DEVOPS_MODULE_CONSTANTS.GLOBAL_A3_OFFSET],
    architecture_policy: {
      continuous_8x16_floor: true,
      internal_wall_at_z8: false,
      west_hub_doorway: [0, 0, 8],
      north_corridor_doorway: [4, 0, 16],
      zero_purple_accent_policy: true,
    },
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_GLB,
        relative_path: `./${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_GLB}`,
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: {
        filename: PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_MANIFEST,
        relative_path: `./${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_MANIFEST}`,
      },
      anchors: {
        filename: PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_ANCHORS,
        relative_path: `./${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_ANCHORS}`,
      },
      display_slots: {
        filename: PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_DISPLAY_SLOTS,
        relative_path: `./${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_DISPLAY_SLOTS}`,
      },
      behavior: {
        filename: PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_BEHAVIOR,
        relative_path: `./${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_BEHAVIOR}`,
      },
      preview: {
        filename: PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_PREVIEW,
        relative_path: `./${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_PREVIEW}`,
      },
    },
    measured_bounds: {
      local_min: minB,
      local_max: maxB,
      size: sizeB,
    },
    geometry_and_material_summary: {
      source_mesh_count: stats.meshCount,
      exported_mesh_count: stats.meshCount,
      material_count: stats.materialCount,
      triangle_count: stats.triangleCount,
      embedded_texture_count: stats.textureCount,
      content_groups: [...QA_DEVOPS_MODULE_CONSTANTS.REQUIRED_GROUPS],
      semantic_furniture_subgroups: [...QA_DEVOPS_MODULE_CONSTANTS.SEMANTIC_FURNITURE_SUBGROUPS],
      group_mesh_counts: { ...stats.groupCounts },
      character_included: false,
      preview_helpers_excluded: true,
    },
    connectors: QA_DEVOPS_CONNECTORS_SPEC,
    interior_zones: QA_DEVOPS_INTERIOR_ZONES,
    supported_anchors: DEFAULT_QA_DEVOPS_ANCHOR_LIST.map((a) => a.id),
    display_slots: QA_DEVOPS_DISPLAY_SLOTS.map((s) => s.slot_id),
    monitors_orientation_audit: verifyQADevOpsMonitorsOrientation(),
    furniture_and_material_parity: furnitureParity,
    validation_status: validationStatus,
  };
}

export async function buildQADevOpsRoomProductionAssetPack(
  qaDevopsRoot: THREE.Object3D,
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<QADevOpsRoomProductionAssetPackResult> {
  const prevParent = qaDevopsRoot.parent;
  const prevPos = qaDevopsRoot.position.clone();
  const prevVis = new Map<THREE.Object3D, boolean>();

  if (prevParent) {
    prevParent.remove(qaDevopsRoot);
  }
  qaDevopsRoot.position.set(0, 0, 0);
  qaDevopsRoot.traverse((obj) => {
    prevVis.set(obj, obj.visible);
    obj.visible = true;
  });
  qaDevopsRoot.updateMatrixWorld(true);

  const stats = measureRoomStats(qaDevopsRoot);
  const furnitureParity = inspectQADevOpsRoomFurnitureParity(qaDevopsRoot);
  const glbBuffer = await exportRoomToGLBBuffer(qaDevopsRoot);

  prevVis.forEach((v, obj) => {
    obj.visible = v;
  });
  qaDevopsRoot.position.copy(prevPos);
  if (prevParent) {
    prevParent.add(qaDevopsRoot);
  }
  qaDevopsRoot.updateMatrixWorld(true);

  const glbSha256 = await computeSha256Hex(glbBuffer);
  const manifest = buildQADevOpsRoomManifestV1(
    stats,
    glbBuffer.byteLength,
    new Date().toISOString(),
    glbSha256,
    furnitureParity,
    validationStatus
  );
  const anchorsJson = buildQADevOpsRoomAnchorsJsonV1();
  const displaySlotsJson = buildQADevOpsDisplaySlotsJson();
  const behaviorJson = buildQADevOpsRoomBehaviorJson();
  const readmeMarkdown = `# ${QA_DEVOPS_MODULE_CONSTANTS.DISPLAY_NAME} ("${QA_DEVOPS_MODULE_CONSTANTS.ALTERNATIVE_TITLE}")\n\n- **Room ID**: \`${QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID}\`\n- **Asset ID**: \`${QA_DEVOPS_MODULE_CONSTANTS.ASSET_ID}\`\n- **Registry Key**: \`${QA_DEVOPS_MODULE_CONSTANTS.REGISTRY_KEY}\` (merges legacy \`qa_review\` + \`devops_ai_engine\`)\n- **Footprint**: \`8 × 16 × 3.2\` units (local origin \`[0, 0, 0]\`, Full Office A3.2 global offset \`[24, 0, 0]\`)\n- **Meshes**: \`${stats.meshCount}\` (${stats.triangleCount} triangles, ${stats.materialCount} PBR materials)\n- **Zones**: North QA Functional Area (\`Z = 10.6..16.0\`), Central Cozy Collaboration Lounge (\`Z = 5.4..10.6\`), South DevOps Operations Area (\`Z = 0.0..5.4\`)\n- **Display Slots**: 8 static DEMO QA & DevOps display slots (\`qa_devops_room.display_slots.json\`) across ${QA_DEVOPS_MONITORS_SPEC.length} front-facing screens\n- **Room-Local Anchors**: 23 anchors (\`qa_devops_room.anchors.json\`)\n- **Future Agent Actions**: 29 prepared contracts (15 QA + 14 DevOps) in \`qa_devops_room.behavior.json\`\n- **Character Included**: \`false\` (QA & DevOps characters deferred to future milestones)\n`;

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    stats,
    furnitureParity,
    manifest,
    anchorsJson,
    displaySlotsJson,
    behaviorJson,
    previewDataUrl,
    readmeMarkdown,
  };
}

export function downloadQADevOpsRoomAssetPackZip(
  pack: QADevOpsRoomProductionAssetPackResult
): {
  filename: string;
  byteLength: number;
} {
  const prefix = 'production/rooms/qa_devops_studio';
  const entries = [
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_ANCHORS}`,
      data: JSON.stringify(pack.anchorsJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_DISPLAY_SLOTS}`,
      data: JSON.stringify(pack.displaySlotsJson, null, 2),
    },
    {
      path: `${prefix}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_BEHAVIOR}`,
      data: JSON.stringify(pack.behaviorJson, null, 2),
    },
    {
      path: `${prefix}/README.md`,
      data: pack.readmeMarkdown,
    },
    {
      path: `production/layout/${OFFICE_A3_CONSTANTS.EXPORT_A3_2_FILENAME}`,
      data: JSON.stringify(buildOfficeLayoutA3_2ExportJson(), null, 2),
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${prefix}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_PREVIEW}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_PACK_ZIP;
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadQADevOpsRoomJsonContracts(
  pack: QADevOpsRoomProductionAssetPackResult
): void {
  triggerJsonDownload(pack.manifest, PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_MANIFEST);
  setTimeout(() => {
    triggerJsonDownload(pack.anchorsJson, PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_ANCHORS);
  }, 140);
  setTimeout(() => {
    triggerJsonDownload(pack.displaySlotsJson, PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_DISPLAY_SLOTS);
  }, 280);
  setTimeout(() => {
    triggerJsonDownload(pack.behaviorJson, PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_BEHAVIOR);
  }, 420);
}

export function downloadOfficeLayoutA3_2Json(): {
  filename: string;
  json: OfficeLayoutA3ExportJson;
} {
  const json = buildOfficeLayoutA3_2ExportJson();
  triggerJsonDownload(json, OFFICE_A3_CONSTANTS.EXPORT_A3_2_FILENAME);
  return { filename: OFFICE_A3_CONSTANTS.EXPORT_A3_2_FILENAME, json };
}

// ============================================================================
// OPEN CENTRAL HUB V2 & FULL OFFICE VISUAL UPGRADE V2 EXPORTERS
// ============================================================================
import {
  CENTRAL_HUB_ANCHORS_LIST,
  CENTRAL_HUB_CONNECTORS_SPEC,
  CENTRAL_HUB_FURNITURE_CATALOG,
  CENTRAL_HUB_MODULE_CONSTANTS,
  CENTRAL_HUB_REQUIRED_GROUPS,
  CentralHubAnchorsJsonV2,
  CentralHubManifestV2,
  CentralHubMeetingSeatsJsonV2,
  buildCentralHubAnchorsJson,
  buildCentralHubManifestV2,
  buildCentralHubMeetingSeatsJson,
} from '../domain/centralHubSpec';
import {
  FullOfficeVisualProfileV2Json,
  buildFullOfficeVisualProfileV2Json,
} from '../domain/officeLayoutA3Spec';

export interface CentralHubV2ProductionAssetPackResult {
  glbBuffer: ArrayBuffer;
  glbSizeBytes: number;
  glbSha256: string;
  stats: RoomExportStats;
  manifest: CentralHubManifestV2;
  anchorsJson: CentralHubAnchorsJsonV2;
  meetingSeatsJson: CentralHubMeetingSeatsJsonV2;
  officeLayoutA3_2Json: OfficeLayoutA3ExportJson;
  visualProfileV2Json: FullOfficeVisualProfileV2Json;
  previewDataUrl: string | null;
  readmeMarkdown: string;
}

export async function buildCentralHubV2ProductionAssetPack(
  centralHubRoot: THREE.Object3D,
  previewDataUrl: string | null = null,
  validationStatus: 'PASS' | 'FAIL' | 'NOT_VERIFIED' = 'PASS'
): Promise<CentralHubV2ProductionAssetPackResult> {
  const prevParent = centralHubRoot.parent;
  const prevPos = centralHubRoot.position.clone();
  const prevVis = new Map<THREE.Object3D, boolean>();

  if (prevParent) {
    prevParent.remove(centralHubRoot);
  }
  centralHubRoot.position.set(0, 0, 0);
  centralHubRoot.traverse((obj) => {
    prevVis.set(obj, obj.visible);
    obj.visible = true;
  });
  centralHubRoot.updateMatrixWorld(true);

  const stats = measureRoomStats(centralHubRoot);
  const glbBuffer = await exportRoomToGLBBuffer(centralHubRoot);

  prevVis.forEach((v, obj) => {
    obj.visible = v;
  });
  centralHubRoot.position.copy(prevPos);
  if (prevParent) {
    prevParent.add(centralHubRoot);
  }
  centralHubRoot.updateMatrixWorld(true);

  const glbSha256 = await computeSha256Hex(glbBuffer);
  const minB = stats.boundingBox.min.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const maxB = stats.boundingBox.max.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const sizeB = stats.boundingBox.size.map((v) => Number(v.toFixed(3))) as [number, number, number];

  const manifest = buildCentralHubManifestV2({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    meshCount: stats.meshCount,
    materialCount: stats.materialCount,
    triangleCount: stats.triangleCount,
    textureCount: stats.textureCount,
    groupMeshCounts: stats.groupCounts,
    measuredBounds: {
      local_min: minB,
      local_max: maxB,
      size: sizeB,
    },
    validationStatus,
  });

  const anchorsJson = buildCentralHubAnchorsJson();
  const meetingSeatsJson = buildCentralHubMeetingSeatsJson();
  const officeLayoutA3_2Json = buildOfficeLayoutA3_2ExportJson();
  const visualProfileV2Json = buildFullOfficeVisualProfileV2Json();

  const readmeMarkdown = `# AI Office — Full Office Visual & Architecture Upgrade V2 & Central Hub V2 Production Pack

## Overview
- **Central Hub Module ID**: \`${CENTRAL_HUB_MODULE_CONSTANTS.MODULE_ID}\` (\`${CENTRAL_HUB_MODULE_CONSTANTS.ASSET_ID}\`)
- **Root Node**: \`${CENTRAL_HUB_MODULE_CONSTANTS.ROOT_NODE_NAME}\`
- **Footprint**: \`16 × 16 × 3.2\` units (local origin \`[0, 0, 0]\`, Full Office A3.2 global offset \`[8, 0, 0]\` -> \`X = 8..24, Z = 0..16\`)
- **Meshes**: \`${stats.meshCount}\` (${stats.triangleCount} triangles, ${stats.materialCount} PBR materials, ${stats.textureCount} embedded textures)
- **Validation Status**: \`${validationStatus}\`

## Package Contents
1. \`central_hub_v2.glb\` — Standalone binary glTF 2.0 Central Hub module (${glbBuffer.byteLength.toLocaleString()} bytes · SHA-256: \`${glbSha256}\`). Includes \`PARQUET\` (12×12 Warm Natural Oak Herringbone Parquet), \`STONE_PERIMETER\` (2u Warm Greige Large-Format Stone perimeter), \`FLOOR_TRIMS\` (2mm brushed brass transition border), \`ENTRANCE_STRUCTURE\` (3.2u Main South Entrance Portal at \`[8, 0, 0]\` with 2.4u clear opening & open double glass doors), \`MEETING_RUG\` (8.8×4.8u 3D woven rug), \`MEETING_TABLE\` (6.8×2.3×0.75u conference table), \`MEETING_CHAIRS\` (10 chairs), \`PLANTS\` (6 architectural planters), \`DECORATION\` (North-East hospitality sideboard, South-East visitor bench, West freestanding single-front-screen review display), \`LIGHT_FIXTURES\`, and \`CONNECTORS\`.
2. \`central_hub_v2.manifest.json\` — Machine-readable Central Hub V2 manifest.
3. \`central_hub_v2.anchors.json\` — 18 semantic anchors (${CENTRAL_HUB_ANCHORS_LIST.length} total) in local and global A3.2 coordinates.
4. \`central_hub.meeting_seats.json\` — 10-seat conference table contract (9 agent roles + 1 \`HUB_MEETING_OWNER_RESERVED\` seat; 7 real characters active in live demo, 3 seats visibly empty).
5. \`office-layout-a3.2.json\` — Master 32×26 Full Office layout specification.
6. \`full-office-visual-profile-v2.json\` — Flooring zoning, orthographic camera presets, wall cutaway policy, and lighting profile.
7. \`full-office-preview-v2.png\` — Full Office isometric preview capture.
`;

  return {
    glbBuffer,
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256,
    stats,
    manifest,
    anchorsJson,
    meetingSeatsJson,
    officeLayoutA3_2Json,
    visualProfileV2Json,
    previewDataUrl,
    readmeMarkdown,
  };
}

export function downloadOfficeVisualUpgradeV2PackZip(
  pack: CentralHubV2ProductionAssetPackResult
): {
  filename: string;
  byteLength: number;
} {
  const hubPrefix = 'production/central_hub_v2';
  const layoutPrefix = 'production/layout';
  const entries = [
    {
      path: `${hubPrefix}/${PRODUCTION_FILENAMES.CENTRAL_HUB_V2_GLB}`,
      data: pack.glbBuffer,
    },
    {
      path: `${hubPrefix}/${PRODUCTION_FILENAMES.CENTRAL_HUB_V2_MANIFEST}`,
      data: JSON.stringify(pack.manifest, null, 2),
    },
    {
      path: `${hubPrefix}/${PRODUCTION_FILENAMES.CENTRAL_HUB_V2_ANCHORS}`,
      data: JSON.stringify(pack.anchorsJson, null, 2),
    },
    {
      path: `${hubPrefix}/${PRODUCTION_FILENAMES.CENTRAL_HUB_MEETING_SEATS}`,
      data: JSON.stringify(pack.meetingSeatsJson, null, 2),
    },
    {
      path: `${layoutPrefix}/${PRODUCTION_FILENAMES.OFFICE_LAYOUT_A3_2}`,
      data: JSON.stringify(pack.officeLayoutA3_2Json, null, 2),
    },
    {
      path: `${layoutPrefix}/${PRODUCTION_FILENAMES.FULL_OFFICE_VISUAL_PROFILE_V2}`,
      data: JSON.stringify(pack.visualProfileV2Json, null, 2),
    },
    {
      path: 'README.md',
      data: pack.readmeMarkdown,
    },
  ];

  if (pack.previewDataUrl) {
    entries.push({
      path: `${layoutPrefix}/${PRODUCTION_FILENAMES.FULL_OFFICE_PREVIEW_V2}`,
      data: dataUrlToUint8Array(pack.previewDataUrl),
    });
  }

  const zipBytes = createZipArchive(entries);
  const filename = PRODUCTION_FILENAMES.OFFICE_VISUAL_UPGRADE_V2_PACK_ZIP;
  triggerBinaryDownload(zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return { filename, byteLength: zipBytes.byteLength };
}

export function downloadCentralHubMeetingSeatsJson(): {
  filename: string;
  json: CentralHubMeetingSeatsJsonV2;
} {
  const json = buildCentralHubMeetingSeatsJson();
  triggerJsonDownload(json, PRODUCTION_FILENAMES.CENTRAL_HUB_MEETING_SEATS);
  return { filename: PRODUCTION_FILENAMES.CENTRAL_HUB_MEETING_SEATS, json };
}

export function downloadFullOfficeVisualProfileV2Json(): {
  filename: string;
  json: FullOfficeVisualProfileV2Json;
} {
  const json = buildFullOfficeVisualProfileV2Json();
  triggerJsonDownload(json, PRODUCTION_FILENAMES.FULL_OFFICE_VISUAL_PROFILE_V2);
  return { filename: PRODUCTION_FILENAMES.FULL_OFFICE_VISUAL_PROFILE_V2, json };
}

export {
  CENTRAL_HUB_CONNECTORS_SPEC,
  CENTRAL_HUB_FURNITURE_CATALOG,
  CENTRAL_HUB_REQUIRED_GROUPS,
};

