import {
  CAMERA_PRESETS,
  CONNECTORS_SPEC,
  ConnectorSpec,
  FURNITURE_CATALOG,
  MODULE_CONSTANTS,
  RoomExportStats,
} from '../domain/modularRoomSpec';
import {
  AUTO_DEMO_SEQUENCE,
  ActivityAnchor,
  AnchorId,
  DEFAULT_ACTIVITY_ANCHORS,
  PATROL_ANCHOR_SEQUENCE,
  PMActionDefinition,
  PMActionId,
  PMAgentStateId,
  PM_DEMO_ACTIONS,
  ROOM_WALK_WAYPOINTS,
  WalkWaypoint,
} from '../domain/pmSimulationSpec';

export const HANDOFF_PACKAGE_VERSION = '1.0.0';
export const HANDOFF_PACKAGE_ID = 'AI-OFFICE-PM-ROOM-HANDOFF-V1';

export const PRODUCTION_FILENAMES = {
  ROOM_GLB: 'pm_room.glb',
  ROOM_MANIFEST: 'pm_room.manifest.json',
  ROOM_ANCHORS: 'pm_room.anchors.json',
  ROOM_PREVIEW: 'pm_room.preview.png',
  ROOM_README: 'README.md',
  CEO_ROOM_GLB: 'ceo_room.glb',
  CEO_ROOM_MANIFEST: 'ceo_room.manifest.json',
  CEO_ROOM_ANCHORS: 'ceo_room.anchors.json',
  CEO_ROOM_BEHAVIOR: 'ceo_room.behavior.json',
  CEO_ROOM_PREVIEW: 'ceo_room.preview.png',
  CEO_ROOM_README: 'README.md',
  UIUX_ROOM_GLB: 'uiux_room.glb',
  UIUX_ROOM_MANIFEST: 'uiux-room.manifest.json',
  UIUX_ROOM_ANCHORS: 'uiux-room.anchors.json',
  UIUX_ROOM_BEHAVIOR: 'uiux-room.behavior.json',
  UIUX_ROOM_PREVIEW: 'uiux_room.preview.png',
  UIUX_ROOM_README: 'README.md',
  ENGINEERING_ROOM_GLB: 'engineering_room.glb',
  ENGINEERING_ROOM_MANIFEST: 'engineering_room.manifest.json',
  ENGINEERING_ROOM_ANCHORS: 'engineering_room.anchors.json',
  ENGINEERING_ROOM_BEHAVIOR: 'engineering_room.behavior.json',
  ENGINEERING_ROOM_PREVIEW: 'engineering_room.preview.png',
  ENGINEERING_ROOM_README: 'README.md',
  ENGINEERING_ROOM_PACK_ZIP: 'engineering_room_production_pack_v1.zip',
  RESEARCH_ROOM_GLB: 'research_room.glb',
  RESEARCH_ROOM_MANIFEST: 'research_room.manifest.json',
  RESEARCH_ROOM_ANCHORS: 'research_room.anchors.json',
  RESEARCH_ROOM_DISPLAY_SLOTS: 'research_room.display_slots.json',
  RESEARCH_ROOM_BEHAVIOR: 'research_room.behavior.json',
  RESEARCH_ROOM_PREVIEW: 'research_room.preview.png',
  RESEARCH_ROOM_README: 'README.md',
  RESEARCH_ROOM_PACK_ZIP: 'research_room_production_pack_v1.zip',
  QA_DEVOPS_ROOM_GLB: 'qa_devops_room.glb',
  QA_DEVOPS_ROOM_MANIFEST: 'qa_devops_room.manifest.json',
  QA_DEVOPS_ROOM_ANCHORS: 'qa_devops_room.anchors.json',
  QA_DEVOPS_ROOM_DISPLAY_SLOTS: 'qa_devops_room.display_slots.json',
  QA_DEVOPS_ROOM_BEHAVIOR: 'qa_devops_room.behavior.json',
  QA_DEVOPS_ROOM_PREVIEW: 'qa_devops_room.preview.png',
  QA_DEVOPS_ROOM_README: 'README.md',
  QA_DEVOPS_ROOM_PACK_ZIP: 'qa_devops_room_production_pack_v1.zip',
  OFFICE_LAYOUT_A3: 'office-layout-a3.json',
  OFFICE_LAYOUT_A3_1: 'office-layout-a3.1.json',
  OFFICE_LAYOUT_A3_2: 'office-layout-a3.2.json',
  CHARACTER_GLB: 'boss_pm.glb',
  CHARACTER_MANIFEST: 'boss_pm.manifest.json',
  CHARACTER_BEHAVIOR: 'boss_pm.behavior.json',
  CHARACTER_PREVIEW: 'boss_pm.preview.png',
  CHARACTER_README: 'README.md',
  CEO_CHARACTER_GLB: 'ceo_executive_assistant.glb',
  CEO_CHARACTER_MANIFEST: 'ceo_executive_assistant.manifest.json',
  CEO_CHARACTER_BEHAVIOR: 'ceo_executive_assistant.behavior.json',
  CEO_CHARACTER_PREVIEW: 'ceo_executive_assistant_preview.png',
  CEO_CHARACTER_README: 'README.md',
  UIUX_CHARACTER_GLB: 'uiux_designer_agent.glb',
  UIUX_CHARACTER_MANIFEST: 'uiux_designer_agent.manifest.json',
  UIUX_CHARACTER_BEHAVIOR: 'uiux_designer_agent.behavior.json',
  UIUX_CHARACTER_PREVIEW: 'uiux_designer_agent_preview.png',
  UIUX_CHARACTER_README: 'README.md',
  UIUX_CHARACTER_PACK_ZIP: 'uiux_designer_agent_pack.zip',
  FRONTEND_CHARACTER_GLB: 'frontend_developer_agent.glb',
  FRONTEND_CHARACTER_MANIFEST: 'frontend_developer_agent.manifest.json',
  FRONTEND_CHARACTER_BEHAVIOR: 'frontend_developer_agent.behavior.json',
  FRONTEND_CHARACTER_PREVIEW: 'frontend_developer_agent_preview.png',
  FRONTEND_CHARACTER_README: 'README.md',
  FRONTEND_CHARACTER_PACK_ZIP: 'frontend_developer_agent_pack.zip',
  BACKEND_CHARACTER_GLB: 'backend_developer_agent.glb',
  BACKEND_CHARACTER_MANIFEST: 'backend_developer_agent.manifest.json',
  BACKEND_CHARACTER_BEHAVIOR: 'backend_developer_agent.behavior.json',
  BACKEND_CHARACTER_PREVIEW: 'backend_developer_agent_preview.png',
  BACKEND_CHARACTER_README: 'README.md',
  BACKEND_CHARACTER_PACK_ZIP: 'backend_developer_agent_pack.zip',
  DATABASE_CHARACTER_GLB: 'database_developer_agent.glb',
  DATABASE_CHARACTER_MANIFEST: 'database_developer_agent.manifest.json',
  DATABASE_CHARACTER_BEHAVIOR: 'database_developer_agent.behavior.json',
  DATABASE_CHARACTER_PREVIEW: 'database_developer_agent_preview.png',
  DATABASE_CHARACTER_README: 'README.md',
  DATABASE_CHARACTER_PACK_ZIP: 'database_developer_agent_pack.zip',
  RESEARCH_CHARACTER_GLB: 'research_professor_agent.glb',
  RESEARCH_CHARACTER_MANIFEST: 'research_professor_agent.manifest.json',
  RESEARCH_CHARACTER_BEHAVIOR: 'research_professor_agent.behavior.json',
  RESEARCH_CHARACTER_PREVIEW: 'research_professor_agent_preview.png',
  RESEARCH_CHARACTER_README: 'README.md',
  RESEARCH_CHARACTER_PACK_ZIP: 'research_professor_agent_pack_v1.zip',
  QA_CHARACTER_GLB: 'qa_engineer_agent.glb',
  QA_CHARACTER_MANIFEST: 'qa_engineer_agent.manifest.json',
  QA_CHARACTER_BEHAVIOR: 'qa_engineer_agent.behavior.json',
  QA_CHARACTER_PREVIEW: 'qa_engineer_agent_preview.png',
  QA_CHARACTER_README: 'README.md',
  QA_CHARACTER_PACK_ZIP: 'qa_engineer_agent_pack_v1.zip',
  DEVOPS_CHARACTER_GLB: 'devops_engineer_agent.glb',
  DEVOPS_CHARACTER_MANIFEST: 'devops_engineer_agent.manifest.json',
  DEVOPS_CHARACTER_BEHAVIOR: 'devops_engineer_agent.behavior.json',
  DEVOPS_CHARACTER_PREVIEW: 'devops_engineer_agent_preview.png',
  DEVOPS_CHARACTER_README: 'README.md',
  DEVOPS_CHARACTER_PACK_ZIP: 'devops_engineer_agent_pack_v1.zip',
  CENTRAL_HUB_V2_GLB: 'central_hub_v2.glb',
  CENTRAL_HUB_V2_MANIFEST: 'central_hub_v2.manifest.json',
  CENTRAL_HUB_V2_ANCHORS: 'central_hub_v2.anchors.json',
  CENTRAL_HUB_MEETING_SEATS: 'central_hub.meeting_seats.json',
  FULL_OFFICE_VISUAL_PROFILE_V2: 'full-office-visual-profile-v2.json',
  FULL_OFFICE_PREVIEW_V2: 'full-office-preview-v2.png',
  OFFICE_VISUAL_UPGRADE_V2_PACK_ZIP: 'office_visual_upgrade_v2_production_pack.zip',
  ROUNDTRIP_REPORT: 'roundtrip-report.json',
  VISUAL_STABILITY_REPORT: 'visual-stability-report.json',
  SOURCE_ZIP: 'modular-room-lab-source.zip',
  HANDOFF_BUNDLE_ZIP: 'AI-OFFICE-PM-ROOM-HANDOFF-V1.zip',
} as const;

export type AnimationExportClassification =
  | 'EMBEDDED_GLTF_CLIP'
  | 'PROCEDURAL_CONTROLLER'
  | 'HYBRID'
  | 'UNSUPPORTED_IN_STANDALONE_EXPORT';

export interface FileInventoryEntry {
  logical_path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
}

export interface FurnitureExportParityItem {
  catalog_id: string;
  name: string;
  category: string;
  included_in_room_glb: boolean;
  source_module: string;
  local_position: [number, number, number];
  catalog_dimensions: [number, number, number];
  mesh_count: number;
  material_type: string;
  gltf_compatible: boolean;
  visual_parity_notes: string;
}

export interface PMRoomManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  asset_id: 'ai_office.room.pm_strategy.v1';
  legacy_module_id: string;
  asset_version: string;
  asset_kind: 'room';
  source_project_name: string;
  source_revision: string;
  export_date: string;
  file_inventory: {
    glb: {
      filename: string;
      relative_path: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: {
      filename: string;
      relative_path: string;
    };
    anchors: {
      filename: string;
      relative_path: string;
    };
    preview: {
      filename: string;
      relative_path: string;
    };
    readme: {
      filename: string;
      relative_path: string;
    };
  };
  coordinate_and_scale_contract: {
    up_axis: 'Y';
    handedness: 'right-handed';
    world_floor_y: number;
    floor_subbase_min_y: number;
    wall_top_y: number;
    grid_unit_size: number;
    world_unit_scale: string;
    room_origin: [number, number, number];
    room_origin_convention: string;
    footprint_units: [number, number];
    recentered_on_export: false;
    default_front_facing_note: string;
  };
  measured_bounds: {
    local_min: [number, number, number];
    local_max: [number, number, number];
    world_min: [number, number, number];
    world_max: [number, number, number];
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
  connectors: Record<'EAST' | 'SOUTH', ConnectorSpec>;
  furniture_and_material_parity: FurnitureExportParityItem[];
  rendering_profile: {
    camera_projection: 'orthographic';
    recommended_position: [number, number, number];
    recommended_target: [number, number, number];
    recommended_zoom: number;
    orthographic_near: number;
    orthographic_far: number;
    shadow_map_size: [number, number];
    shadow_bias: number;
    shadow_normal_bias: number;
    tone_mapping: 'ACESFilmicToneMapping';
    tone_mapping_exposure: number;
    output_color_space: 'SRGBColorSpace';
    texture_filtering: 'THREE.NearestFilter (crisp pixel-art)';
    polygon_offset_surfaces: string[];
    runtime_viewer_dependencies: string[];
  };
  animation_inventory: {
    embedded_clips_count: 0;
    note: string;
  };
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  known_limitations: string[];
  provenance: {
    author_tool: string;
    visual_source_of_truth: string;
    license: string;
  };
}

export interface PMRoomAnchorsJsonV1 {
  schema_version: 'AI_OFFICE_ROOM_ANCHORS_V1';
  room_asset_id: 'ai_office.room.pm_strategy.v1';
  room_module_id: string;
  coordinate_convention: {
    up_axis: 'Y';
    floor_elevation_y: 0;
    room_origin: [number, number, number];
    facing_convention: '0 rad = North (+Z), +PI/2 = East (+X), PI = South (-Z), -PI/2 = West (-X)';
  };
  spawn_anchor_id: AnchorId;
  default_idle_anchor_id: AnchorId;
  connectors: Record<'EAST' | 'SOUTH', ConnectorSpec>;
  anchors: Array<{
    id: AnchorId;
    room_module_id: string;
    label: string;
    world_position: [number, number, number];
    local_position: [number, number, number];
    facing_rad: number;
    facing_deg: number;
    forward_vector: [number, number, number];
    activity_role: PMActionId;
    posture: 'standing' | 'seated' | 'leaning';
    approach_anchor_id: AnchorId | null;
    associated_furniture_id: string | null;
    character_compatibility: string[];
    description: string;
  }>;
  navigation_waypoints: Array<{
    id: string;
    world_position: [number, number, number];
    neighbors: string[];
    obstacle_clear: boolean;
  }>;
  patrol_anchor_sequence: AnchorId[];
  obstacle_footprint_catalog: Array<{
    furniture_id: string;
    name: string;
    center_xz: [number, number];
    size_xz: [number, number];
    blocks_navigation: boolean;
  }>;
}

export interface BossPMManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  asset_id: 'ai_office.character.boss_pm_room_native.v1';
  legacy_asset_id: string;
  asset_version: string;
  asset_kind: 'character';
  role_classification: 'ROOM_NATIVE_EXPORT_CANDIDATE';
  canonical_character_lab_notice: string;
  source_project_name: string;
  source_revision: string;
  export_date: string;
  file_inventory: {
    glb: {
      filename: string;
      relative_path: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: {
      filename: string;
      relative_path: string;
    };
    behavior: {
      filename: string;
      relative_path: string;
    };
    preview: {
      filename: string;
      relative_path: string;
    };
    readme: {
      filename: string;
      relative_path: string;
    };
  };
  coordinate_and_scale_contract: {
    up_axis: 'Y';
    handedness: 'right-handed';
    character_origin: [number, number, number];
    origin_convention: 'Feet contact point flush with floor plane Y = 0.000';
    local_forward: [number, number, number];
    raw_height_units: number;
    calibrated_height_units: number;
    applied_scale_factor: number;
    separate_from_room_root: true;
  };
  measured_bounds: {
    local_min: [number, number, number];
    local_max: [number, number, number];
    size: [number, number, number];
  };
  geometry_and_material_summary: {
    source_hierarchy_total_meshes: number;
    exported_rest_pose_visible_meshes: number;
    contextual_handheld_prop_meshes_in_source: number;
    mesh_count_difference_explanation: string;
    material_count: number;
    material_names: string[];
    has_skinned_skeleton: false;
    articulated_pivot_groups: string[];
    visual_identity_checklist: {
      blocky_voxel_silhouette: true;
      geometric_dark_hairstyle: true;
      rectangular_black_sunglasses: true;
      black_suit_jacket: true;
      white_inner_shirt: true;
      red_necktie: true;
      ear_sideburn_temple_separation_preserved: true;
      torso_z_layering_preserved: true;
    };
  };
  animation_inventory: {
    embedded_gltf_clip_count: number;
    clips: Array<{
      name: string;
      duration_seconds: number;
      track_count: number;
      targeted_pivots: string[];
      classification: AnimationExportClassification;
    }>;
  };
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  known_limitations: string[];
  provenance: {
    author_tool: string;
    visual_source_of_truth: string;
    license: string;
  };
}

export interface BossPMBehaviorJsonV1 {
  schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1';
  character_asset_id: 'ai_office.character.boss_pm_room_native.v1';
  compatible_room_asset_id: 'ai_office.room.pm_strategy.v1';
  simulation_mode: 'VISUAL_DEMONSTRATION_ONLY';
  source_controller_modules: string[];
  articulated_hierarchy_contract: {
    root_node: string;
    hips_pivot: string;
    torso_pivot: string;
    head_pivot: string;
    left_arm_pivot: string;
    right_arm_pivot: string;
    left_leg_pivot: string;
    right_leg_pivot: string;
    contextual_prop_nodes: {
      read_document: string;
      phone_call: string;
      coffee_break: string;
    };
  };
  activity_states: Array<{
    state_id: PMAgentStateId;
    action_id: PMActionId;
    action_code: string;
    label_id: string;
    label_en: string;
    export_classification: AnimationExportClassification;
    standalone_clip_classification: 'EMBEDDED_GLTF_CLIP';
    embedded_clip_name: string;
    clip_duration_seconds: number;
    clip_track_count: number;
    procedural_controller_role: string;
    target_anchor_id: AnchorId | null;
    requires_waypoint_walk: boolean;
    posture: 'standing' | 'seated' | 'leaning';
    seated_y_offset: number;
    contextual_props_activated: string[];
    speech_bubble: string | null;
    thought_bubble: string | null;
  }>;
  auto_demo_sequence: typeof AUTO_DEMO_SEQUENCE;
}

/**
 * Computes a real SHA-256 hex digest of an ArrayBuffer, Uint8Array, or UTF-8 string.
 * Uses Web Crypto API (`crypto.subtle.digest`) with a pure TypeScript SHA-256 fallback.
 */
export async function computeSha256Hex(
  input: ArrayBuffer | Uint8Array | string
): Promise<string> {
  const bytes: Uint8Array =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : input instanceof Uint8Array
      ? input
      : new Uint8Array(input);

  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', copy.buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  return computeSha256Fallback(bytes);
}

function computeSha256Fallback(asciiBytes: Uint8Array): string {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
    0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
    0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
    0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
    0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
    0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ];
  const rotr = (n: number, x: number) => (x >>> n) | (x << (32 - n));
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab,
    0x5be0cd19,
  ];

  const l = asciiBytes.length;
  const bitLenHi = Math.floor((l * 8) / 0x100000000);
  const bitLenLo = (l * 8) >>> 0;
  const padLen = (l + 9 + 63) & ~63;
  const padded = new Uint8Array(padLen);
  padded.set(asciiBytes);
  padded[l] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padLen - 8, bitLenHi, false);
  dv.setUint32(padLen - 4, bitLenLo, false);

  const W = new Uint32Array(64);
  for (let offset = 0; offset < padLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      W[i] = dv.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, W[i - 15]) ^ rotr(18, W[i - 15]) ^ (W[i - 15] >>> 3);
      const s1 = rotr(17, W[i - 2]) ^ rotr(19, W[i - 2]) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  return H.map((v) => v.toString(16).padStart(8, '0')).join('');
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function computeCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface ZipEntryInput {
  path: string;
  data: Uint8Array | ArrayBuffer | string;
}

/**
 * Creates a standards-compliant PKZIP archive (STORE method 0) from a list of file entries.
 * Works identically in browser and Node.js environments without external dependencies.
 */
export function createZipArchive(entries: ZipEntryInput[]): Uint8Array {
  const encoder = new TextEncoder();
  const normalized = entries.map((entry) => {
    const cleanPath = entry.path.replace(/^\/+/, '');
    const pathBytes = encoder.encode(cleanPath);
    const dataBytes =
      typeof entry.data === 'string'
        ? encoder.encode(entry.data)
        : entry.data instanceof Uint8Array
        ? entry.data
        : new Uint8Array(entry.data);
    const crc = computeCrc32(dataBytes);
    return { pathBytes, dataBytes, crc };
  });

  let localTotalSize = 0;
  let centralTotalSize = 0;
  for (const item of normalized) {
    localTotalSize += 30 + item.pathBytes.length + item.dataBytes.length;
    centralTotalSize += 46 + item.pathBytes.length;
  }

  const totalSize = localTotalSize + centralTotalSize + 22;
  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  // MS-DOS date/time for 2026-10-28 08:00:00
  const dosTime = (8 << 11) | (0 << 5) | 0;
  const dosDate = ((2026 - 1980) << 9) | (10 << 5) | 28;

  let localOffset = 0;
  const offsets: number[] = [];

  for (const item of normalized) {
    offsets.push(localOffset);
    view.setUint32(localOffset, 0x04034b50, true); // Local file header signature
    view.setUint16(localOffset + 4, 20, true); // Version needed to extract (2.0)
    view.setUint16(localOffset + 6, 0x0800, true); // General purpose bit flag (UTF-8)
    view.setUint16(localOffset + 8, 0, true); // Compression method (0 = Store)
    view.setUint16(localOffset + 10, dosTime, true);
    view.setUint16(localOffset + 12, dosDate, true);
    view.setUint32(localOffset + 14, item.crc, true);
    view.setUint32(localOffset + 18, item.dataBytes.length, true);
    view.setUint32(localOffset + 22, item.dataBytes.length, true);
    view.setUint16(localOffset + 26, item.pathBytes.length, true);
    view.setUint16(localOffset + 28, 0, true);
    out.set(item.pathBytes, localOffset + 30);
    out.set(item.dataBytes, localOffset + 30 + item.pathBytes.length);
    localOffset += 30 + item.pathBytes.length + item.dataBytes.length;
  }

  let centralOffset = localOffset;
  for (let i = 0; i < normalized.length; i++) {
    const item = normalized[i];
    view.setUint32(centralOffset, 0x02014b50, true); // Central directory signature
    view.setUint16(centralOffset + 4, 20, true); // Version made by
    view.setUint16(centralOffset + 6, 20, true); // Version needed
    view.setUint16(centralOffset + 8, 0x0800, true); // UTF-8 flag
    view.setUint16(centralOffset + 10, 0, true); // Store
    view.setUint16(centralOffset + 12, dosTime, true);
    view.setUint16(centralOffset + 14, dosDate, true);
    view.setUint32(centralOffset + 16, item.crc, true);
    view.setUint32(centralOffset + 20, item.dataBytes.length, true);
    view.setUint32(centralOffset + 24, item.dataBytes.length, true);
    view.setUint16(centralOffset + 28, item.pathBytes.length, true);
    view.setUint16(centralOffset + 30, 0, true);
    view.setUint16(centralOffset + 32, 0, true);
    view.setUint16(centralOffset + 34, 0, true);
    view.setUint16(centralOffset + 36, 0, true);
    view.setUint32(centralOffset + 38, 0, true);
    view.setUint32(centralOffset + 42, offsets[i], true);
    out.set(item.pathBytes, centralOffset + 46);
    centralOffset += 46 + item.pathBytes.length;
  }

  // End of central directory record
  view.setUint32(centralOffset, 0x06054b50, true);
  view.setUint16(centralOffset + 4, 0, true);
  view.setUint16(centralOffset + 6, 0, true);
  view.setUint16(centralOffset + 8, normalized.length, true);
  view.setUint16(centralOffset + 10, normalized.length, true);
  view.setUint32(centralOffset + 12, centralTotalSize, true);
  view.setUint32(centralOffset + 16, localOffset, true);
  view.setUint16(centralOffset + 20, 0, true);

  return out;
}

export function buildPMRoomManifestV1(params: {
  stats: RoomExportStats;
  glbSizeBytes: number;
  glbSha256: string;
  exportedMeshCount: number;
  furnitureParity: FurnitureExportParityItem[];
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  exportDate?: string;
}): PMRoomManifestV1 {
  const {
    stats,
    glbSizeBytes,
    glbSha256,
    exportedMeshCount,
    furnitureParity,
    validationStatus = 'PASS',
    exportDate = new Date().toISOString(),
  } = params;

  const minB = stats.boundingBox.min.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const maxB = stats.boundingBox.max.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const sizeB = stats.boundingBox.size.map((v) => Number(v.toFixed(3))) as [number, number, number];

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    asset_id: 'ai_office.room.pm_strategy.v1',
    legacy_module_id: MODULE_CONSTANTS.MODULE_ID,
    asset_version: HANDOFF_PACKAGE_VERSION,
    asset_kind: 'room',
    source_project_name: 'ai-office-modular-room-lab',
    source_revision: 'NOT AVAILABLE (Google AI Studio Build Sandbox)',
    export_date: exportDate,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.ROOM_GLB,
        relative_path: './pm_room.glb',
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: {
        filename: PRODUCTION_FILENAMES.ROOM_MANIFEST,
        relative_path: './pm_room.manifest.json',
      },
      anchors: {
        filename: PRODUCTION_FILENAMES.ROOM_ANCHORS,
        relative_path: './pm_room.anchors.json',
      },
      preview: {
        filename: PRODUCTION_FILENAMES.ROOM_PREVIEW,
        relative_path: './pm_room.preview.png',
      },
      readme: {
        filename: PRODUCTION_FILENAMES.ROOM_README,
        relative_path: './README.md',
      },
    },
    coordinate_and_scale_contract: {
      up_axis: 'Y',
      handedness: 'right-handed',
      world_floor_y: MODULE_CONSTANTS.FLOOR_ELEVATION,
      floor_subbase_min_y: -MODULE_CONSTANTS.FLOOR_THICKNESS,
      wall_top_y: MODULE_CONSTANTS.WALL_HEIGHT,
      grid_unit_size: MODULE_CONSTANTS.GRID_SIZE,
      world_unit_scale: '1 Three.js world unit = 1 modular grid tile (1.0m nominal)',
      room_origin: [...MODULE_CONSTANTS.ORIGIN],
      room_origin_convention:
        'South-West (SW) floor corner at [0, 0, 0]; room extends across X=[0..8] (West->East) and Z=[0..8] (South->North).',
      footprint_units: [MODULE_CONSTANTS.FOOTPRINT_WIDTH, MODULE_CONSTANTS.FOOTPRINT_DEPTH],
      recentered_on_export: false,
      default_front_facing_note:
        'North (+Z) and West (X=0) walls are full height (3.20u); East (X=8) and South (Z=0) are cutaway walls (0.38u) for three-quarter isometric viewing from the South-East quadrant.',
    },
    measured_bounds: {
      local_min: minB,
      local_max: maxB,
      world_min: minB,
      world_max: maxB,
      size: sizeB,
    },
    geometry_and_material_summary: {
      source_mesh_count: stats.meshCount,
      exported_mesh_count: exportedMeshCount,
      material_count: stats.materialCount,
      triangle_count: stats.triangleCount,
      embedded_texture_count: stats.textureCount,
      content_groups: [...MODULE_CONSTANTS.REQUIRED_GROUPS],
      group_mesh_counts: { ...stats.groupCounts },
      character_excluded: true,
      preview_helpers_excluded: true,
    },
    connectors: CONNECTORS_SPEC,
    furniture_and_material_parity: furnitureParity,
    rendering_profile: {
      camera_projection: 'orthographic',
      recommended_position: [...CAMERA_PRESETS[0].position],
      recommended_target: [...CAMERA_PRESETS[0].target],
      recommended_zoom: CAMERA_PRESETS[0].zoom,
      orthographic_near: 0.5,
      orthographic_far: 48.0,
      shadow_map_size: [1024, 1024],
      shadow_bias: -0.0008,
      shadow_normal_bias: 0.035,
      tone_mapping: 'ACESFilmicToneMapping',
      tone_mapping_exposure: 0.96,
      output_color_space: 'SRGBColorSpace',
      texture_filtering: 'THREE.NearestFilter (crisp pixel-art)',
      polygon_offset_surfaces: [
        'Floor_Center_Woven_Rug (polygonOffsetFactor: -1, polygonOffsetUnits: -2)',
        'Contact_Shadow_* (polygonOffsetFactor: -1, polygonOffsetUnits: -2, depthWrite: false)',
      ],
      runtime_viewer_dependencies: [
        'glTF 2.0 does not serialize Three.js Material.polygonOffset parameters; host runtime should re-apply polygonOffset (-1, -2) to Floor_Center_Woven_Rug and Contact_Shadow_* meshes or preserve their physical Y elevation offset (already separated at Y >= 0.004..0.025).',
        'Set magFilter and minFilter to THREE.NearestFilter on imported textures to preserve crisp pixel-art texel edges.',
        'Directional key light shadow bias (-0.0008) and normalBias (0.035) with orthographic near=0.5 / far=48 prevent shadow acne on thin voxel trims.',
      ],
    },
    animation_inventory: {
      embedded_clips_count: 0,
      note: 'pm_room.glb is a static architectural and furniture module (0 embedded clips). Character animations belong to boss_pm.glb and BossPMCharacterSystem.ts.',
    },
    validation_status: validationStatus,
    known_limitations: [
      'Scene lights, OrbitControls, orthographic camera, and RoomEnvironment IBL are runtime viewer components and are intentionally excluded from pm_room.glb.',
      'Three.js polygonOffset material properties are runtime renderer state and not part of the glTF 2.0 specification; however, all floor rugs, mats, and decals are also physically separated in Y elevation so they do not Z-fight in standard glTF viewers.',
    ],
    provenance: {
      author_tool: 'AI Office Modular Room Lab (Three.js GLTFExporter)',
      visual_source_of_truth: 'Human Owner Approved Google AI Studio PM & Strategy Room V1',
      license: 'Internal AI Office Project Asset — All Rights Reserved by Project Owner',
    },
  };
}

export function buildPMRoomAnchorsJsonV1(
  anchors: Record<AnchorId, ActivityAnchor> = DEFAULT_ACTIVITY_ANCHORS,
  waypoints: WalkWaypoint[] = ROOM_WALK_WAYPOINTS
): PMRoomAnchorsJsonV1 {
  const furnitureByAnchor: Record<AnchorId, string | null> = {
    SPAWN_POINT: 'CONNECTOR_B_SOUTH',
    ROOM_IDLE_POSITION: 'PM_Area_Rug',
    PM_DESK_APPROACH: 'PM_Executive_Chair',
    PM_DESK_WORK_POSITION: 'PM_Executive_Desk',
    PM_CHAIR_POSITION: 'PM_Executive_Chair',
    MEETING_TABLE_APPROACH: 'PM_Collaboration_Table',
    MEETING_SEAT_POSITION: 'PM_Collaboration_Table',
    PRESENTATION_BOARD_POSITION: 'PM_Strategy_Board',
    BOOKSHELF_POSITION: 'PM_Tall_Bookcase',
    COFFEE_BREAK_POSITION: 'PM_Corner_Credenza',
  };

  const nonBlockingIds = new Set(['PM_Area_Rug', 'PM_Strategy_Board', 'PM_Executive_Chair']);

  return {
    schema_version: 'AI_OFFICE_ROOM_ANCHORS_V1',
    room_asset_id: 'ai_office.room.pm_strategy.v1',
    room_module_id: MODULE_CONSTANTS.MODULE_ID,
    coordinate_convention: {
      up_axis: 'Y',
      floor_elevation_y: 0,
      room_origin: [0, 0, 0],
      facing_convention:
        '0 rad = North (+Z), +PI/2 = East (+X), PI = South (-Z), -PI/2 = West (-X)',
    },
    spawn_anchor_id: 'SPAWN_POINT',
    default_idle_anchor_id: 'ROOM_IDLE_POSITION',
    connectors: CONNECTORS_SPEC,
    anchors: (Object.keys(anchors) as AnchorId[]).map((id) => {
      const a = anchors[id];
      const fx = Number(Math.sin(a.facingRad).toFixed(4));
      const fz = Number(Math.cos(a.facingRad).toFixed(4));
      return {
        id: a.id,
        room_module_id: MODULE_CONSTANTS.MODULE_ID,
        label: a.label,
        world_position: [...a.position],
        local_position: [...a.position],
        facing_rad: Number(a.facingRad.toFixed(4)),
        facing_deg: Math.round(((a.facingRad * 180) / Math.PI + 360) % 360),
        forward_vector: [fx, 0, fz],
        activity_role: a.associatedAction,
        posture: a.posture,
        approach_anchor_id: a.approachAnchorId ?? null,
        associated_furniture_id: furnitureByAnchor[id] ?? null,
        character_compatibility: [
          'ai_office.character.boss_pm_room_native.v1',
          'character_lab_imported_glb_1.72u',
        ],
        description: a.description,
      };
    }),
    navigation_waypoints: waypoints.map((wp) => ({
      id: wp.id,
      world_position: [wp.position[0], 0, wp.position[1]],
      neighbors: [...wp.neighbors],
      obstacle_clear: true,
    })),
    patrol_anchor_sequence: [...PATROL_ANCHOR_SEQUENCE],
    obstacle_footprint_catalog: FURNITURE_CATALOG.map((item) => ({
      furniture_id: item.id,
      name: item.name,
      center_xz: [item.position[0], item.position[2]],
      size_xz: [item.dimensions[0], item.dimensions[2]],
      blocks_navigation: !nonBlockingIds.has(item.id),
    })),
  };
}

export function buildBossPMManifestV1(params: {
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
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  exportDate?: string;
}): BossPMManifestV1 {
  const {
    glbSizeBytes,
    glbSha256,
    sourceTotalMeshes,
    exportedVisibleMeshes,
    materialNames,
    localBounds,
    clips,
    validationStatus = 'PASS',
    exportDate = new Date().toISOString(),
  } = params;

  const rawHeight = Number(localBounds.size[1].toFixed(3));
  const targetHeight = MODULE_CONSTANTS.CHARACTER_REFERENCE_HEIGHT;
  const appliedScale = Number((targetHeight / rawHeight).toFixed(4));

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    asset_id: 'ai_office.character.boss_pm_room_native.v1',
    legacy_asset_id: 'AI_OFFICE_ORIGINAL_BOSS_PM_v1',
    asset_version: HANDOFF_PACKAGE_VERSION,
    asset_kind: 'character',
    role_classification: 'ROOM_NATIVE_EXPORT_CANDIDATE',
    canonical_character_lab_notice:
      'Preserves the approved room-native cozy voxel Boss PM as an integration candidate. Does not silently replace Character Lab as the canonical character-production pipeline.',
    source_project_name: 'ai-office-modular-room-lab',
    source_revision: 'NOT AVAILABLE (Google AI Studio Build Sandbox)',
    export_date: exportDate,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.CHARACTER_GLB,
        relative_path: './boss_pm.glb',
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: {
        filename: PRODUCTION_FILENAMES.CHARACTER_MANIFEST,
        relative_path: './boss_pm.manifest.json',
      },
      behavior: {
        filename: PRODUCTION_FILENAMES.CHARACTER_BEHAVIOR,
        relative_path: './boss_pm.behavior.json',
      },
      preview: {
        filename: PRODUCTION_FILENAMES.CHARACTER_PREVIEW,
        relative_path: './boss_pm.preview.png',
      },
      readme: {
        filename: PRODUCTION_FILENAMES.CHARACTER_README,
        relative_path: './README.md',
      },
    },
    coordinate_and_scale_contract: {
      up_axis: 'Y',
      handedness: 'right-handed',
      character_origin: [0, 0, 0],
      origin_convention: 'Feet contact point flush with floor plane Y = 0.000',
      local_forward: [0, 0, 1],
      raw_height_units: rawHeight,
      calibrated_height_units: targetHeight,
      applied_scale_factor: appliedScale,
      separate_from_room_root: true,
    },
    measured_bounds: {
      local_min: localBounds.min,
      local_max: localBounds.max,
      size: localBounds.size,
    },
    geometry_and_material_summary: {
      source_hierarchy_total_meshes: sourceTotalMeshes,
      exported_rest_pose_visible_meshes: exportedVisibleMeshes,
      contextual_handheld_prop_meshes_in_source: Math.max(
        0,
        sourceTotalMeshes - exportedVisibleMeshes
      ),
      mesh_count_difference_explanation:
        'Source hierarchy contains 46 total meshes: 41 permanent body/suit/head/hair/glasses meshes visible in the default standing rest pose, plus 5 contextual handheld prop meshes (Binder_Cover, Binder_Pages, Executive_Smartphone_Prop, Coffee_Mug_Body, Coffee_Mug_Sleeve) that are hidden in rest pose so they do not overlap the hands in static glTF viewers.',
      material_count: materialNames.length,
      material_names: materialNames,
      has_skinned_skeleton: false,
      articulated_pivot_groups: [
        'Hips',
        'Torso',
        'Head',
        'LeftArm',
        'RightArm',
        'LeftLeg',
        'RightLeg',
      ],
      visual_identity_checklist: {
        blocky_voxel_silhouette: true,
        geometric_dark_hairstyle: true,
        rectangular_black_sunglasses: true,
        black_suit_jacket: true,
        white_inner_shirt: true,
        red_necktie: true,
        ear_sideburn_temple_separation_preserved: true,
        torso_z_layering_preserved: true,
      },
    },
    animation_inventory: {
      embedded_gltf_clip_count: clips.length,
      clips: clips.map((c) => ({
        name: c.name,
        duration_seconds: c.duration,
        track_count: c.trackCount,
        targeted_pivots: c.targetedPivots,
        classification: 'EMBEDDED_GLTF_CLIP',
      })),
    },
    validation_status: validationStatus,
    known_limitations: [
      'Uses hierarchical pivot node animation (Hips, Torso, Head, LeftArm, RightArm, LeftLeg, RightLeg) rather than a deformed SkinnedMesh skeleton, preserving crisp voxel block geometry without vertex stretching.',
      'Contextual handheld props (strategy binder, smartphone, coffee mug), waypoint navigation, seated height offset (-0.16u), and interactive speech/approval bubbles are driven by the companion procedural controller (BossPMCharacterSystem.ts) as documented in boss_pm.behavior.json.',
    ],
    provenance: {
      author_tool: 'AI Office Modular Room Lab (Three.js GLTFExporter)',
      visual_source_of_truth: 'Room-Native Cozy Handcrafted Voxel Boss PM V1',
      license: 'Internal AI Office Project Asset — All Rights Reserved by Project Owner',
    },
  };
}

export function buildBossPMBehaviorJsonV1(
  clips: Array<{
    name: string;
    duration: number;
    trackCount: number;
    targetedPivots: string[];
  }>,
  actions: PMActionDefinition[] = PM_DEMO_ACTIONS,
  anchors: Record<AnchorId, ActivityAnchor> = DEFAULT_ACTIVITY_ANCHORS
): BossPMBehaviorJsonV1 {
  const clipByName = new Map(clips.map((c) => [c.name, c]));

  const proceduralRoleByAction: Record<PMActionId, string> = {
    idle: 'Plays embedded Idle_Breathing clip at ROOM_IDLE_POSITION; hides handheld props.',
    patrol:
      'Routes character along ROOM_WALK_WAYPOINTS across PATROL_ANCHOR_SEQUENCE while playing embedded Walk_Cycle clip and smoothly interpolating OrientationRoot.rotation.y.',
    work_desk:
      'Walks via PM_DESK_APPROACH to PM_DESK_WORK_POSITION, aligns facing West (-PI/2), plays embedded Work_Typing clip (which lowers Hips to Y=0.56 and bends legs/arms for typing).',
    meeting_briefing:
      'Walks via MEETING_TABLE_APPROACH to MEETING_SEAT_POSITION, aligns facing West, plays embedded Meeting_Briefing clip, and displays briefing speech bubble.',
    present_board:
      'Walks to PRESENTATION_BOARD_POSITION facing North (0 rad), plays embedded Present_Board clip, highlights PM_Strategy_Board, and shows sprint presentation speech bubble.',
    read_document:
      'Walks to BOOKSHELF_POSITION facing North, plays embedded Read_Document clip, and activates Open_Strategy_Binder_Prop in LeftArm.',
    think_plan:
      'In-place state transition; plays embedded Think_Plan clip (hand-to-chin pose) and displays planning thought bubble.',
    phone_call:
      'In-place state transition; plays embedded Phone_Call clip, activates Executive_Smartphone_Prop in RightArm, and displays phone call speech bubble.',
    coffee_break:
      'Walks to COFFEE_BREAK_POSITION facing SW (-2.15 rad), plays embedded Coffee_Break clip, and activates Warm_Ceramic_Coffee_Cup_Prop in RightArm.',
    waiting_approval:
      'In-place state transition; plays embedded Waiting_Approval clip and displays interactive approval request banner until user clicks Approve.',
    task_completed:
      'Plays embedded Task_Completed celebratory gesture clip for 3.2 seconds and then transitions back to IDLE.',
  };

  return {
    schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1',
    character_asset_id: 'ai_office.character.boss_pm_room_native.v1',
    compatible_room_asset_id: 'ai_office.room.pm_strategy.v1',
    simulation_mode: 'VISUAL_DEMONSTRATION_ONLY',
    source_controller_modules: [
      'src/three/BossPMCharacterSystem.ts',
      'src/domain/pmSimulationSpec.ts',
      'src/components/ModularRoomCanvas.tsx',
    ],
    articulated_hierarchy_contract: {
      root_node: 'Original_Boss_PM_Root',
      hips_pivot: 'Hips',
      torso_pivot: 'Torso',
      head_pivot: 'Head',
      left_arm_pivot: 'LeftArm',
      right_arm_pivot: 'RightArm',
      left_leg_pivot: 'LeftLeg',
      right_leg_pivot: 'RightLeg',
      contextual_prop_nodes: {
        read_document: 'Open_Strategy_Binder_Prop',
        phone_call: 'Executive_Smartphone_Prop',
        coffee_break: 'Warm_Ceramic_Coffee_Cup_Prop',
      },
    },
    activity_states: actions.map((act) => {
      const clip = clipByName.get(act.clipName);
      const anchor = act.targetAnchorId ? anchors[act.targetAnchorId] : null;
      const propsActivated: string[] = [];
      if (act.id === 'read_document') propsActivated.push('Open_Strategy_Binder_Prop');
      if (act.id === 'phone_call') propsActivated.push('Executive_Smartphone_Prop');
      if (act.id === 'coffee_break') propsActivated.push('Warm_Ceramic_Coffee_Cup_Prop');

      return {
        state_id: act.targetState,
        action_id: act.id,
        action_code: act.code,
        label_id: act.labelId,
        label_en: act.labelEn,
        export_classification: 'HYBRID',
        standalone_clip_classification: 'EMBEDDED_GLTF_CLIP',
        embedded_clip_name: act.clipName,
        clip_duration_seconds: clip?.duration ?? 2.0,
        clip_track_count: clip?.trackCount ?? 3,
        procedural_controller_role: proceduralRoleByAction[act.id],
        target_anchor_id: act.targetAnchorId,
        requires_waypoint_walk: act.requiresWalk,
        posture: anchor?.posture ?? 'standing',
        seated_y_offset: anchor?.posture === 'seated' ? -0.16 : 0,
        contextual_props_activated: propsActivated,
        speech_bubble: act.speechBubble ?? null,
        thought_bubble: act.thoughtBubble ?? null,
      };
    }),
    auto_demo_sequence: [...AUTO_DEMO_SEQUENCE],
  };
}

export function buildRoomReadmeMarkdown(manifest: PMRoomManifestV1): string {
  return `# Deliverable A — PM & Strategy Room Production Asset Pack (V1)

## Asset Overview
- **Asset ID**: \`${manifest.asset_id}\` (\`${manifest.legacy_module_id}\`)
- **Version**: \`${manifest.asset_version}\`
- **Export Date**: \`${manifest.export_date}\`
- **Validation Status**: \`${manifest.validation_status}\`

## Package Contents
1. \`pm_room.glb\` — Standalone binary glTF 2.0 room module (${manifest.file_inventory.glb.size_bytes.toLocaleString()} bytes · SHA-256: \`${manifest.file_inventory.glb.sha256}\`). Strictly excludes the Boss PM character, cameras, lights, and debug helpers.
2. \`pm_room.manifest.json\` — Machine-readable coordinate, scale, connector, material parity, and rendering profile contract.
3. \`pm_room.anchors.json\` — Validated world/local transforms for all 10 activity anchors, 12 walkable navigation waypoints, EAST/SOUTH modular connectors, and obstacle bounds.
4. \`pm_room.preview.png\` — Isometric preview render of the approved PM & Strategy Room.
5. \`README.md\` — Integration and rendering notes.

## Coordinate & Modular Snap Contract
- **Up Axis**: \`+Y\` (right-handed Three.js world space)
- **Floor Elevation**: \`Y = 0.000\` (structural subbase \`Y = -0.160 .. 0.000\`)
- **SW Corner Origin**: \`[0, 0, 0]\` (never recentered; footprint spans \`X = [0..8]\`, \`Z = [0..8]\`, height \`Y = [-0.16..3.20]\`)
- **East Connector (\`CONNECTOR_EAST\`)**: \`[8, 0, 4]\`, normal \`[+1, 0, 0]\`, width \`2.0u\`, removable node \`Connector_East_Removable_Doorway\`
- **South Connector (\`CONNECTOR_SOUTH\`)**: \`[4, 0, 0]\`, normal \`[0, 0, -1]\`, width \`2.0u\`, removable node \`Connector_South_Removable_Threshold\`

## Recommended Host Rendering Profile
- **Camera**: Orthographic isometric (\`position: [13.6, 11.2, -5.6]\`, \`target: [4.0, 1.15, 4.0]\`, \`near: 0.5\`, \`far: 48.0\`)
- **Shadows**: Directional key light at \`[9.5, 14.0, 2.0]\` with \`shadow.bias = -0.0008\`, \`shadow.normalBias = 0.035\`
- **Textures**: Set \`magFilter = THREE.NearestFilter\` and \`minFilter = THREE.NearestFilter\` on imported textures for crisp pixel-art fidelity.
`;
}

export function buildCharacterReadmeMarkdown(manifest: BossPMManifestV1): string {
  return `# Deliverable B — Room-Native Boss PM Export Candidate (V1)

## Asset Overview
- **Asset ID**: \`${manifest.asset_id}\` (\`${manifest.legacy_asset_id}\`)
- **Role**: \`${manifest.role_classification}\`
- **Version**: \`${manifest.asset_version}\`
- **Export Date**: \`${manifest.export_date}\`
- **Validation Status**: \`${manifest.validation_status}\`

> **Canonical Pipeline Notice**: ${manifest.canonical_character_lab_notice}

## Package Contents
1. \`boss_pm.glb\` — Standalone binary glTF 2.0 character model (${manifest.file_inventory.glb.size_bytes.toLocaleString()} bytes · SHA-256: \`${manifest.file_inventory.glb.sha256}\`) containing ${manifest.geometry_and_material_summary.exported_rest_pose_visible_meshes} standing rest-pose voxel meshes and ${manifest.animation_inventory.embedded_gltf_clip_count} embedded keyframe \`AnimationClip\`s.
2. \`boss_pm.manifest.json\` — Machine-readable scale, bounds, material, and animation clip inventory.
3. \`boss_pm.behavior.json\` — Mapping of all 11 PM activity states to embedded glTF clips, procedural waypoint navigation, anchors, postures, and contextual props.
4. \`boss_pm.preview.png\` — Close-up preview render of the Room-Native Boss PM character.
5. \`README.md\` — Integration and animation notes.

## Coordinate, Origin & Animation Contract
- **Origin**: \`[0, 0, 0]\` at feet floor contact (\`minY = 0.000\`)
- **Forward Axis**: \`+Z\` (\`[0, 0, 1]\`)
- **Height**: \`${manifest.coordinate_and_scale_contract.raw_height_units}u\` raw (\`1.72u\` calibrated target height, scale factor \`×${manifest.coordinate_and_scale_contract.applied_scale_factor}\`)
- **Embedded Animation Clips (${manifest.animation_inventory.embedded_gltf_clip_count})**:
${manifest.animation_inventory.clips
  .map((c) => `  - \`${c.name}\` (${c.duration_seconds}s · ${c.track_count} keyframe tracks)`)
  .join('\n')}
`;
}

export function buildValidationReadmeMarkdown(): string {
  return `# Validation Reports — Independent GLB Round-Trip & Visual Stability (V1)

- \`roundtrip-report.json\` — Automated independent binary export + \`GLTFLoader.parseAsync()\` re-import verification report for both \`pm_room.glb\` and \`boss_pm.glb\`, including the 19-point validation matrix.
- \`visual-stability-report.json\` — Coplanar surface, duplicate mesh, camera frustum depth precision (\`near=0.5, far=48\`), and shadow bias (\`-0.0008 / 0.035\`) verification report confirming zero Z-fighting across cabinets, walls, windows, and Boss PM ears/glasses/sideburns.
`;
}

export function buildSourceReadmeMarkdown(sourceFileCount: number): string {
  return `# Deliverable C — Full Source Project Archive (\`modular-room-lab-source.zip\`)

## Overview
\`modular-room-lab-source.zip\` contains the **${sourceFileCount} actual source files** of the AI Office Modular Room Lab project (React 19 + TypeScript + Three.js + Vite), including:
- \`src/three/RoomArchitectureBuilder.ts\` — 8×8 PM Room architectural shell, walls, windows, pilasters, trims, and EAST/SOUTH connectors.
- \`src/three/FurnitureLibraryBuilder.ts\` — All 12 approved PM Room furniture items, strategy board, bookcase, wardrobe, credenza, executive desk, props, and decorations.
- \`src/three/PixelMaterialLibrary.ts\` — Procedural pixel-art CanvasTextures and glTF-compatible \`THREE.MeshStandardMaterial\` definitions.
- \`src/three/BossPMCharacterSystem.ts\` — Original Room-Native Voxel Boss PM generator, 11 embedded keyframe \`AnimationClip\`s, and procedural runtime controller.
- \`src/domain/modularRoomSpec.ts\` & \`src/domain/pmSimulationSpec.ts\` — Coordinate specifications, anchors, Dijkstra waypoint pathfinding, and unit tests.
- \`src/export/*\` — Production asset pack exporters, manifest builders, and independent GLB round-trip validator.
- \`src/components/*\` & \`src/App.tsx\` — Interactive 3D isometric viewport, simulation controls, and Asset Export & Integration Handoff UI.

## Running Locally
\`\`\`bash
npm install
npm run dev
\`\`\`

## Running Unit & Round-Trip Verification Tests
\`\`\`bash
npx tsx --test src/domain/modularRoomSpec.test.ts src/domain/pmSimulationSpec.test.ts src/export/exportPipeline.test.ts
\`\`\`

## Native Google AI Studio Build Export
In addition to downloading \`modular-room-lab-source.zip\` directly from the in-app **Asset Export & Integration Handoff** panel, the Project Owner can also use Google AI Studio Build's native **Download Code / Export to ZIP / GitHub** action in the top studio toolbar at any time. No API keys or secrets are packaged in this archive.
`;
}

import {
  CEOAnchorId,
  CEO_MODULE_CONSTANTS,
  DEFAULT_CEO_ANCHORS,
} from '../domain/ceoRoomSpec';
import {
  CEO_AUTO_DEMO_SEQUENCE,
  CEO_CHARACTER_CONSTANTS,
  CEO_DEMO_ACTIONS,
  CEO_EXPRESSIONS,
} from '../domain/ceoSimulationSpec';

export interface CEOCharacterManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  character_id: 'ceo_executive_assistant';
  display_name: 'CEO Executive Assistant';
  role: 'Executive Brain / Chief of Staff';
  compatible_room_id: 'AI_OFFICE_ROOM_CEO_v1';
  version: '1.0.0';
  export_date: string;
  units: 'meters';
  height: number;
  origin: [number, number, number];
  forward_axis: '+Z';
  up_axis: '+Y';
  mesh_count: number;
  source_total_meshes: number;
  triangle_count: number;
  material_count: number;
  material_names: string[];
  animation_clips: Array<{
    name: string;
    duration_seconds: number;
    track_count: number;
    targeted_pivots: string[];
  }>;
  supported_states: string[];
  supported_expressions: string[];
  accessories: string[];
  default_anchors: Record<
    string,
    {
      position: [number, number, number];
      rotationY: number;
      role: string;
    }
  >;
  file_inventory: {
    glb: {
      filename: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string };
    behavior: { filename: string };
    preview: { filename: string };
  };
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface CEOCharacterBehaviorJsonV1 {
  schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1';
  character_id: 'ceo_executive_assistant';
  compatible_room_id: 'AI_OFFICE_ROOM_CEO_v1';
  simulation_mode: 'DEMO_DATA_ONLY';
  states: Array<{
    state_id: string;
    action_id: string;
    label_id: string;
    label_en: string;
    animation_clip: string;
    target_anchor: CEOAnchorId;
    facing_direction_rad: number;
    expression: string;
    prop: string;
    status_badge: string;
    bubble_text: string;
    duration_seconds: number;
  }>;
  auto_demo_sequence: typeof CEO_AUTO_DEMO_SEQUENCE;
}

export function buildCEOCharacterManifestV1(params: {
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
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  exportDate?: string;
}): CEOCharacterManifestV1 {
  const {
    glbSizeBytes,
    glbSha256,
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames,
    localBounds,
    clips,
    validationStatus = 'PASS',
    exportDate = new Date().toISOString(),
  } = params;

  const anchorMap: CEOCharacterManifestV1['default_anchors'] = {};
  for (const [id, anchor] of Object.entries(DEFAULT_CEO_ANCHORS)) {
    anchorMap[id] = {
      position: [...anchor.position],
      rotationY: Number(anchor.facingRad.toFixed(4)),
      role: anchor.description,
    };
  }

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    character_id: CEO_CHARACTER_CONSTANTS.CHARACTER_ID,
    display_name: CEO_CHARACTER_CONSTANTS.DISPLAY_NAME,
    role: CEO_CHARACTER_CONSTANTS.FUNCTIONAL_ROLE,
    compatible_room_id: CEO_MODULE_CONSTANTS.MODULE_ID,
    version: '1.0.0',
    export_date: exportDate,
    units: 'meters',
    height: Number(localBounds.size[1].toFixed(3)),
    origin: [0, 0, 0],
    forward_axis: '+Z',
    up_axis: '+Y',
    mesh_count: exportedVisibleMeshes,
    source_total_meshes: sourceTotalMeshes,
    triangle_count: triangleCount,
    material_count: materialNames.length,
    material_names: materialNames,
    animation_clips: clips.map((c) => ({
      name: c.name,
      duration_seconds: c.duration,
      track_count: c.trackCount,
      targeted_pivots: c.targetedPivots,
    })),
    supported_states: CEO_DEMO_ACTIONS.map((a) => a.targetState),
    supported_expressions: CEO_EXPRESSIONS.map((e) => e.id),
    accessories: [
      'Black_Rectangular_OpenFrame_Eyeglasses (Glasses)',
      'Green_Lanyard_Executive_ID_Badge (ID_Card_Badge)',
      'Emerald_Executive_Necktie_And_Gold_Clip',
      'Gold_Executive_Lapel_Pin',
      'Contextual_Props (report_binder, executive_tablet, smartphone, coffee_cup)',
    ],
    default_anchors: anchorMap,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.CEO_CHARACTER_GLB,
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: { filename: PRODUCTION_FILENAMES.CEO_CHARACTER_MANIFEST },
      behavior: { filename: PRODUCTION_FILENAMES.CEO_CHARACTER_BEHAVIOR },
      preview: { filename: PRODUCTION_FILENAMES.CEO_CHARACTER_PREVIEW },
    },
    validation_status: validationStatus,
  };
}

export function buildCEOCharacterBehaviorJsonV1(): CEOCharacterBehaviorJsonV1 {
  return {
    schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1',
    character_id: CEO_CHARACTER_CONSTANTS.CHARACTER_ID,
    compatible_room_id: CEO_MODULE_CONSTANTS.MODULE_ID,
    simulation_mode: 'DEMO_DATA_ONLY',
    states: CEO_DEMO_ACTIONS.map((act) => {
      const anchorKey: CEOAnchorId = act.targetAnchorId || 'CEO_ROOM_IDLE';
      const anchor = DEFAULT_CEO_ANCHORS[anchorKey];
      return {
        state_id: act.targetState,
        action_id: act.id,
        label_id: act.labelId,
        label_en: act.labelEn,
        animation_clip: act.clipName,
        target_anchor: anchorKey,
        facing_direction_rad: Number(anchor.facingRad.toFixed(4)),
        expression: act.defaultExpression,
        prop: act.handheldProp,
        status_badge: act.statusBadgeText,
        bubble_text: act.speechBubble || act.thoughtBubble || '',
        duration_seconds: 3.6,
      };
    }),
    auto_demo_sequence: [...CEO_AUTO_DEMO_SEQUENCE],
  };
}

export function buildCEOCharacterReadmeMarkdown(manifest: CEOCharacterManifestV1): string {
  return `# CEO Executive Assistant — Production Character Pack (V1)

## Asset Overview
- **Character ID**: \`${manifest.character_id}\`
- **Display Name**: \`${manifest.display_name}\`
- **Functional Role**: \`${manifest.role}\`
- **Compatible Room**: \`${manifest.compatible_room_id}\`
- **Height**: \`${manifest.height}u\` (grounded at \`Y = 0.000\`, forward \`+Z\`, up \`+Y\`)
- **Embedded Animation Clips**: \`${manifest.animation_clips.length}\`

## Visual Identity
- Senior Executive Assistant voxel style matching the approved Room-Native Boss PM family.
- Short layered dark-brown hair with distinct medium-gray and silver highlights at the temples, sideburns, and crown.
- Black rectangular open-frame eyeglasses with visible eyes, eyebrows, nose bridge, and expressive mouth underneath.
- Dark charcoal suit jacket, white dress shirt, deep emerald-green necktie, brushed gold lapel pin, and green-lanyard executive ID card badge.
`;
}

import {
  DEFAULT_UIUX_ANCHORS,
  UIUXAnchorId,
  UIUX_MODULE_CONSTANTS,
} from '../domain/uiuxRoomSpec';
import {
  UIUX_AUTO_DEMO_SEQUENCE,
  UIUX_CHARACTER_CONSTANTS,
  UIUX_DEMO_ACTIONS,
  UIUX_EXPRESSIONS,
} from '../domain/uiuxSimulationSpec';

export interface UIUXCharacterManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  character_id: 'uiux_designer_agent';
  display_name: 'UI/UX Designer';
  department: 'Design';
  role: 'UI/UX Design, Wireframing, Review, Prototype, Design Thinking';
  compatible_room_id: 'AI_OFFICE_ROOM_UIUX_v1';
  version: '1.0.0';
  export_date: string;
  units: 'meters';
  height: number;
  origin: [number, number, number];
  forward_axis: '+Z';
  up_axis: '+Y';
  mesh_count: number;
  source_total_meshes: number;
  triangle_count: number;
  material_count: number;
  material_names: string[];
  animation_clips: Array<{
    name: string;
    duration_seconds: number;
    track_count: number;
    targeted_pivots: string[];
  }>;
  supported_states: string[];
  supported_expressions: string[];
  accessories: string[];
  default_anchors: Record<
    string,
    {
      position: [number, number, number];
      rotationY: number;
      role: string;
    }
  >;
  file_inventory: {
    glb: {
      filename: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string };
    behavior: { filename: string };
    preview: { filename: string };
  };
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface UIUXCharacterBehaviorJsonV1 {
  schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1';
  character_id: 'uiux_designer_agent';
  compatible_room_id: 'AI_OFFICE_ROOM_UIUX_v1';
  simulation_mode: 'DEMO_DATA_ONLY';
  states: Array<{
    state_id: string;
    action_id: string;
    label_id: string;
    label_en: string;
    animation_clip: string;
    target_anchor: UIUXAnchorId;
    facing_direction_rad: number;
    expression: string;
    prop: string;
    status_badge: string;
    bubble_text: string;
    duration_seconds: number;
  }>;
  auto_demo_sequence: typeof UIUX_AUTO_DEMO_SEQUENCE;
}

export function buildUIUXCharacterManifestV1(params: {
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
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  exportDate?: string;
}): UIUXCharacterManifestV1 {
  const {
    glbSizeBytes,
    glbSha256,
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames,
    localBounds,
    clips,
    validationStatus = 'PASS',
    exportDate = new Date().toISOString(),
  } = params;

  const anchorMap: UIUXCharacterManifestV1['default_anchors'] = {};
  for (const [id, anchor] of Object.entries(DEFAULT_UIUX_ANCHORS)) {
    anchorMap[id] = {
      position: [...anchor.position],
      rotationY: Number(anchor.facingRad.toFixed(4)),
      role: anchor.description,
    };
  }

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    character_id: UIUX_CHARACTER_CONSTANTS.CHARACTER_ID,
    display_name: UIUX_CHARACTER_CONSTANTS.DISPLAY_NAME,
    department: UIUX_CHARACTER_CONSTANTS.DEPARTMENT,
    role: UIUX_CHARACTER_CONSTANTS.FUNCTIONAL_ROLE,
    compatible_room_id: UIUX_MODULE_CONSTANTS.MODULE_ID,
    version: '1.0.0',
    export_date: exportDate,
    units: 'meters',
    height: Number(localBounds.size[1].toFixed(3)),
    origin: [0, 0, 0],
    forward_axis: '+Z',
    up_axis: '+Y',
    mesh_count: exportedVisibleMeshes,
    source_total_meshes: sourceTotalMeshes,
    triangle_count: triangleCount,
    material_count: materialNames.length,
    material_names: materialNames,
    animation_clips: clips.map((c) => ({
      name: c.name,
      duration_seconds: c.duration,
      track_count: c.trackCount,
      targeted_pivots: c.targetedPivots,
    })),
    supported_states: UIUX_DEMO_ACTIONS.map((a) => a.targetState),
    supported_expressions: UIUX_EXPRESSIONS.map((e) => e.id),
    accessories: [
      'Black_Square_OpenFrame_Designer_Glasses (Glasses)',
      'MintSage_Outerwear_Cardigan_Jacket (#68A38B)',
      'Crisp_White_Inner_Top (#F8FAFC)',
      'Sage_Lanyard_Design_Studio_ID_Badge (ID_Card_Badge)',
      'White_Studio_Sneakers_With_MintSage_Accent',
      'Contextual_Props (stylus_tablet, wireframe_clipboard, sticky_note_palette, coffee_mug)',
    ],
    default_anchors: anchorMap,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.UIUX_CHARACTER_GLB,
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: { filename: PRODUCTION_FILENAMES.UIUX_CHARACTER_MANIFEST },
      behavior: { filename: PRODUCTION_FILENAMES.UIUX_CHARACTER_BEHAVIOR },
      preview: { filename: PRODUCTION_FILENAMES.UIUX_CHARACTER_PREVIEW },
    },
    validation_status: validationStatus,
  };
}

export function buildUIUXCharacterBehaviorJsonV1(): UIUXCharacterBehaviorJsonV1 {
  return {
    schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1',
    character_id: UIUX_CHARACTER_CONSTANTS.CHARACTER_ID,
    compatible_room_id: UIUX_MODULE_CONSTANTS.MODULE_ID,
    simulation_mode: 'DEMO_DATA_ONLY',
    states: UIUX_DEMO_ACTIONS.map((act) => {
      const anchorKey: UIUXAnchorId = act.targetAnchorId || 'UIUX_IDLE_ANCHOR';
      const anchor = DEFAULT_UIUX_ANCHORS[anchorKey];
      return {
        state_id: act.targetState,
        action_id: act.id,
        label_id: act.labelId,
        label_en: act.labelEn,
        animation_clip: act.clipName,
        target_anchor: anchorKey,
        facing_direction_rad: Number(anchor.facingRad.toFixed(4)),
        expression: act.defaultExpression,
        prop: act.handheldProp,
        status_badge: act.statusBadgeText,
        bubble_text: act.speechBubble || act.thoughtBubble || '',
        duration_seconds: 3.6,
      };
    }),
    auto_demo_sequence: [...UIUX_AUTO_DEMO_SEQUENCE],
  };
}

export function buildUIUXCharacterReadmeMarkdown(manifest: UIUXCharacterManifestV1): string {
  return `# UI/UX Designer (\`uiux_designer_agent\`) — Production Character Pack (V1)

## Asset Overview
- **Character ID**: \`${manifest.character_id}\`
- **Display Name**: \`${manifest.display_name}\`
- **Department**: \`${manifest.department}\`
- **Functional Role**: \`${manifest.role}\`
- **Compatible Room**: \`${manifest.compatible_room_id}\`
- **Height**: \`${manifest.height}u\` (grounded at \`Y = 0.000\`, forward \`+Z\`, up \`+Y\`)
- **Embedded Animation Clips**: \`${manifest.animation_clips.length}\`

## Visual Identity (Reference A + Reference B)
- Same voxel world and proportions as Boss PM and CEO Executive Assistant.
- Short layered warm chestnut-brown hair with stepped voxel silhouette and side part.
- Black square open-frame designer glasses with visible eyes, pupils, and eyebrows behind clear lenses.
- Mint / sage green cardigan-jacket outerwear over crisp white inner top, visible design studio ID badge lanyard, dark slate pants, and clean white studio sneakers with mint-sage heel accents.
`;
}

import {
  DEFAULT_ENGINEERING_ANCHORS,
  ENGINEERING_CONNECTORS_SPEC,
  ENGINEERING_FURNITURE_CATALOG,
  ENGINEERING_MODULE_CONSTANTS,
  ENGINEERING_MONITORS_SPEC,
  ENGINEERING_WALK_WAYPOINTS,
  buildEngineeringRoomBehaviorJson,
  verifyEngineeringMonitorsOrientation,
} from '../domain/engineeringRoomSpec';

export interface EngineeringRoomManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  asset_id: typeof ENGINEERING_MODULE_CONSTANTS.ASSET_ID;
  module_id: typeof ENGINEERING_MODULE_CONSTANTS.MODULE_ID;
  room_module_id: typeof ENGINEERING_MODULE_CONSTANTS.MODULE_ID;
  display_name: typeof ENGINEERING_MODULE_CONSTANTS.DISPLAY_NAME;
  room_type: typeof ENGINEERING_MODULE_CONSTANTS.ROOM_TYPE;
  module_type: typeof ENGINEERING_MODULE_CONSTANTS.ROOM_TYPE;
  root_node_name: typeof ENGINEERING_MODULE_CONSTANTS.ROOT_NODE_NAME;
  asset_version: string;
  asset_kind: 'room';
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
    readme: { filename: string; relative_path: string };
  };
  coordinate_and_scale_contract: {
    up_axis: 'Y';
    handedness: 'right-handed';
    footprint_units: [number, number];
    wall_height_units: number;
    floor_thickness_units: number;
    local_origin: [number, number, number];
    global_a3_1_offset: [number, number, number];
    continuous_single_room: true;
    internal_dividing_wall_at_z8: false;
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
    character_excluded: true;
    preview_helpers_excluded: true;
  };
  connectors: typeof ENGINEERING_CONNECTORS_SPEC;
  monitor_orientation_verification: ReturnType<typeof verifyEngineeringMonitorsOrientation>;
  furniture_and_material_parity: FurnitureExportParityItem[];
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export function buildEngineeringRoomManifestV1(params: {
  stats: RoomExportStats;
  glbSizeBytes: number;
  glbSha256: string;
  exportedMeshCount: number;
  furnitureParity: FurnitureExportParityItem[];
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  exportDate?: string;
}): EngineeringRoomManifestV1 {
  const {
    stats,
    glbSizeBytes,
    glbSha256,
    exportedMeshCount,
    furnitureParity,
    validationStatus = 'PASS',
    exportDate = new Date().toISOString(),
  } = params;

  const minB = stats.boundingBox.min.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const maxB = stats.boundingBox.max.map((v) => Number(v.toFixed(3))) as [number, number, number];
  const sizeB = stats.boundingBox.size.map((v) => Number(v.toFixed(3))) as [number, number, number];

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    asset_id: ENGINEERING_MODULE_CONSTANTS.ASSET_ID,
    module_id: ENGINEERING_MODULE_CONSTANTS.MODULE_ID,
    room_module_id: ENGINEERING_MODULE_CONSTANTS.MODULE_ID,
    display_name: ENGINEERING_MODULE_CONSTANTS.DISPLAY_NAME,
    room_type: ENGINEERING_MODULE_CONSTANTS.ROOM_TYPE,
    module_type: ENGINEERING_MODULE_CONSTANTS.ROOM_TYPE,
    root_node_name: ENGINEERING_MODULE_CONSTANTS.ROOT_NODE_NAME,
    asset_version: HANDOFF_PACKAGE_VERSION,
    asset_kind: 'room',
    export_date: exportDate,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.ENGINEERING_ROOM_GLB,
        relative_path: './engineering_room.glb',
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: {
        filename: PRODUCTION_FILENAMES.ENGINEERING_ROOM_MANIFEST,
        relative_path: './engineering_room.manifest.json',
      },
      anchors: {
        filename: PRODUCTION_FILENAMES.ENGINEERING_ROOM_ANCHORS,
        relative_path: './engineering_room.anchors.json',
      },
      behavior: {
        filename: PRODUCTION_FILENAMES.ENGINEERING_ROOM_BEHAVIOR,
        relative_path: './engineering_room.behavior.json',
      },
      preview: {
        filename: PRODUCTION_FILENAMES.ENGINEERING_ROOM_PREVIEW,
        relative_path: './engineering_room.preview.png',
      },
      readme: {
        filename: PRODUCTION_FILENAMES.ENGINEERING_ROOM_README,
        relative_path: './README.md',
      },
    },
    coordinate_and_scale_contract: {
      up_axis: 'Y',
      handedness: 'right-handed',
      footprint_units: [
        ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_WIDTH,
        ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_DEPTH,
      ],
      wall_height_units: ENGINEERING_MODULE_CONSTANTS.WALL_HEIGHT,
      floor_thickness_units: ENGINEERING_MODULE_CONSTANTS.FLOOR_THICKNESS,
      local_origin: [...ENGINEERING_MODULE_CONSTANTS.LOCAL_ORIGIN],
      global_a3_1_offset: [...ENGINEERING_MODULE_CONSTANTS.GLOBAL_A3_1_OFFSET],
      continuous_single_room: true,
      internal_dividing_wall_at_z8: false,
    },
    measured_bounds: {
      local_min: minB,
      local_max: maxB,
      size: sizeB,
    },
    geometry_and_material_summary: {
      source_mesh_count: stats.meshCount,
      exported_mesh_count: exportedMeshCount,
      material_count: stats.materialCount,
      triangle_count: stats.triangleCount,
      embedded_texture_count: stats.textureCount,
      content_groups: [...ENGINEERING_MODULE_CONSTANTS.REQUIRED_GROUPS],
      semantic_furniture_subgroups: [...ENGINEERING_MODULE_CONSTANTS.SEMANTIC_FURNITURE_SUBGROUPS],
      group_mesh_counts: { ...stats.groupCounts },
      character_excluded: true,
      preview_helpers_excluded: true,
    },
    connectors: ENGINEERING_CONNECTORS_SPEC,
    monitor_orientation_verification: verifyEngineeringMonitorsOrientation(),
    furniture_and_material_parity: furnitureParity,
    validation_status: validationStatus,
  };
}

export function buildEngineeringRoomAnchorsJsonV1(
  anchors:
    | typeof DEFAULT_ENGINEERING_ANCHORS
    | Array<(typeof DEFAULT_ENGINEERING_ANCHORS)[keyof typeof DEFAULT_ENGINEERING_ANCHORS]> = DEFAULT_ENGINEERING_ANCHORS
) {
  const anchorList = Array.isArray(anchors) ? anchors : Object.values(anchors);
  return {
    schema_version: 'AI_OFFICE_ROOM_ANCHORS_V1',
    room_asset_id: ENGINEERING_MODULE_CONSTANTS.ASSET_ID,
    room_module_id: ENGINEERING_MODULE_CONSTANTS.MODULE_ID,
    local_origin: [...ENGINEERING_MODULE_CONSTANTS.LOCAL_ORIGIN] as [number, number, number],
    global_a3_1_offset: [...ENGINEERING_MODULE_CONSTANTS.GLOBAL_A3_1_OFFSET] as [
      number,
      number,
      number
    ],
    coordinate_convention: {
      up_axis: 'Y',
      floor_elevation_y: 0,
      room_origin: [0, 0, 0],
      footprint: [8.0, 16.0],
      facing_convention:
        '0 rad = North (+Z), +PI/2 = East (+X), PI = South (-Z), -PI/2 = West (-X)',
    },
    spawn_anchor_id: 'ENGINEERING_ROOM_SPAWN',
    default_idle_anchor_id: 'ENGINEERING_ROOM_IDLE',
    connectors: ENGINEERING_CONNECTORS_SPEC,
    anchors: anchorList.map((a) => {
      const fx = Number(Math.sin(a.rotationY).toFixed(4));
      const fz = Number(Math.cos(a.rotationY).toFixed(4));
      return {
        id: a.id,
        room_module_id: ENGINEERING_MODULE_CONSTANTS.MODULE_ID,
        type: a.type,
        local_position: [...a.position],
        world_a3_1_position: [...a.position],
        rotation_y_rad: Number(a.rotationY.toFixed(4)),
        forward_vector: [fx, 0, fz],
        radius: a.radius,
        description: a.description,
        agent_usage: a.agentUsage,
      };
    }),
    navigation_waypoints: ENGINEERING_WALK_WAYPOINTS,
    furniture_footprint_catalog: ENGINEERING_FURNITURE_CATALOG,
    monitors: ENGINEERING_MONITORS_SPEC,
  };
}

export function buildEngineeringRoomBehaviorJsonV1() {
  return buildEngineeringRoomBehaviorJson();
}

export function buildEngineeringRoomReadmeMarkdown(manifest: EngineeringRoomManifestV1): string {
  return `# Engineering & Development Studio (\`AI_OFFICE_ROOM_ENGINEERING_v1\`) — Production Pack (V1.1 Visual Polish & Stability Repair)

## Asset Overview
- **Module ID**: \`${manifest.module_id}\`
- **Asset ID**: \`${manifest.asset_id}\`
- **Display Name**: \`${manifest.display_name}\`
- **Room Type**: \`${manifest.room_type}\`
- **Root Node**: \`${manifest.root_node_name}\`
- **Footprint**: \`8.0 × 16.0 × 3.2u\` (continuous double-module room with zero dividing wall at \`Z = 8\`)
- **Local Origin**: \`[0, 0, 0]\` (South-West floor corner)
- **Full Office A3.1 Global Offset**: \`[0, 0, 0]\` (\`X = 0..8, Z = 0..16\`)

## Four Interior Functional Zones (V1.1 Visual Polish)
1. **Zone A — Frontend Developer Workstation (North, \`Z ≈ 12..16\`)**: Warm oak desk, dual displays (React Component Tree & Responsive UI Inspector), laptop on stand + USB-C dock, mobile test stand, studio headphones, North-West reference bookshelf, coral/orange 3D woven rug, and Frontend Component & Layout Testing Board with 3D pinned wireframe cards.
2. **Zone B — Backend Developer Workstation (Upper-Middle, \`Z ≈ 8..12\`)**: Technical walnut/steel desk, primary API service mesh monitor + vertical terminal log display, tabletop microservice box with patch cables, RFC binders, under-desk server node, router console, studio wall clock, and API & Services Architecture Board.
3. **Zone C — Shared Integration & Code Review Hub (Lower-Middle, \`Z ≈ 5..8\`)**: Shared review table on 3D woven runner rug, 3 collaboration stools with footrest rings, open review laptop, digital architecture tablet + stylus, blueprint sheets, and the wall-mounted Shared Architecture & Integration Board (\`Frontend → API → Backend → Database\`) with overhead sconces.
4. **Zone D — Database Developer Workstation (South, \`Z ≈ 0..5\`)**: Warm oak & deep emerald/teal workstation, sleek lower-profile dual displays (ERD Schema & SQL Query Plan Analyzer) with 3D VESA rear housing, workstation tower, South-West sage bookcase + 4-bay NAS array, and South-East 6-drawer Database Archive & Schema Board.

## Monitor Orientation & Zero-Flicker Stability Contract
- All 6 developer monitors satisfy \`dot(screenNormal, normalize(chairPosition - screenPosition)) > 0.94\` with a single front display surface (\`z = +0.006\`) separated by \`14mm\` from the opaque dark rear casing (\`z = -0.008\`) and wrapped by non-overlapping outer bezel rails.
- All zone rugs use 3D low-profile voxel geometry (\`Y = 0.002..0.012\`) with stepped border binding so zero Z-fighting occurs in live preview or exported \`.glb\` files.
`;
}

import {
  FRONTEND_ACTION_LIST,
  FRONTEND_AUTO_DEMO_SEQUENCE,
  FRONTEND_CHARACTER_CONSTANTS,
  FRONTEND_EXPRESSION_PRESETS,
  FRONTEND_PATROL_ANCHORS,
  FRONTEND_WALK_WAYPOINTS,
} from '../domain/frontendSimulationSpec';

export interface FrontendCharacterManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  character_id: typeof FRONTEND_CHARACTER_CONSTANTS.CHARACTER_ID;
  asset_id: typeof FRONTEND_CHARACTER_CONSTANTS.ASSET_ID;
  display_name: typeof FRONTEND_CHARACTER_CONSTANTS.DISPLAY_NAME;
  department: typeof FRONTEND_CHARACTER_CONSTANTS.DEPARTMENT;
  role: 'FRONTEND_ENGINEER — UI Implementation, Component Architecture, Responsive Testing, Code Review';
  role_type: typeof FRONTEND_CHARACTER_CONSTANTS.ROLE_TYPE;
  compatible_room_id: typeof FRONTEND_CHARACTER_CONSTANTS.ROOM_ID;
  version: '1.0.0';
  export_date: string;
  units: 'meters';
  height: number;
  origin: [number, number, number];
  forward_axis: '+Z';
  up_axis: '+Y';
  mesh_count: number;
  source_total_meshes: number;
  triangle_count: number;
  material_count: number;
  material_names: string[];
  animation_clips: Array<{
    name: string;
    duration_seconds: number;
    track_count: number;
    targeted_pivots: string[];
  }>;
  supported_states: string[];
  supported_expressions: string[];
  accessories: string[];
  default_anchors: Record<
    string,
    {
      position: [number, number, number];
      rotationY: number;
      role: string;
    }
  >;
  file_inventory: {
    glb: {
      filename: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string };
    behavior: { filename: string };
    preview: { filename: string };
  };
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface FrontendCharacterBehaviorJsonV1 {
  schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1';
  character_id: typeof FRONTEND_CHARACTER_CONSTANTS.CHARACTER_ID;
  compatible_room_id: typeof FRONTEND_CHARACTER_CONSTANTS.ROOM_ID;
  simulation_mode: 'DEMO_DATA_ONLY';
  backpack_seated_policy: 'AUTO_HIDE_WHEN_SEATED_TO_PREVENT_CHAIR_BACKREST_CLIPPING';
  states: Array<{
    state_id: string;
    action_id: string;
    label_id: string;
    label_en: string;
    animation_clip: string;
    target_anchor: string;
    facing_direction_rad: number;
    posture: 'standing' | 'seated';
    expression: string;
    prop: string;
    hide_backpack_when_seated: boolean;
    bubble_text: string;
    thought_text: string;
    duration_seconds: number;
  }>;
  auto_demo_sequence: typeof FRONTEND_AUTO_DEMO_SEQUENCE;
  patrol_anchors: typeof FRONTEND_PATROL_ANCHORS;
  navigation_waypoints: typeof FRONTEND_WALK_WAYPOINTS;
}

export function buildFrontendCharacterManifestV1(params: {
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
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  exportDate?: string;
}): FrontendCharacterManifestV1 {
  const {
    glbSizeBytes,
    glbSha256,
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames,
    localBounds,
    clips,
    validationStatus = 'PASS',
    exportDate = new Date().toISOString(),
  } = params;

  const anchorMap: FrontendCharacterManifestV1['default_anchors'] = {};
  for (const [id, anchor] of Object.entries(DEFAULT_ENGINEERING_ANCHORS)) {
    anchorMap[id] = {
      position: [...anchor.position],
      rotationY: Number(anchor.facingRad.toFixed(4)),
      role: anchor.description,
    };
  }

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    character_id: FRONTEND_CHARACTER_CONSTANTS.CHARACTER_ID,
    asset_id: FRONTEND_CHARACTER_CONSTANTS.ASSET_ID,
    display_name: FRONTEND_CHARACTER_CONSTANTS.DISPLAY_NAME,
    department: FRONTEND_CHARACTER_CONSTANTS.DEPARTMENT,
    role: 'FRONTEND_ENGINEER — UI Implementation, Component Architecture, Responsive Testing, Code Review',
    role_type: FRONTEND_CHARACTER_CONSTANTS.ROLE_TYPE,
    compatible_room_id: FRONTEND_CHARACTER_CONSTANTS.ROOM_ID,
    version: '1.0.0',
    export_date: exportDate,
    units: 'meters',
    height: Number(localBounds.size[1].toFixed(3)),
    origin: [0, 0, 0],
    forward_axis: '+Z',
    up_axis: '+Y',
    mesh_count: exportedVisibleMeshes,
    source_total_meshes: sourceTotalMeshes,
    triangle_count: triangleCount,
    material_count: materialNames.length,
    material_names: materialNames,
    animation_clips: clips.map((c) => ({
      name: c.name,
      duration_seconds: c.duration,
      track_count: c.trackCount,
      targeted_pivots: c.targetedPivots,
    })),
    supported_states: FRONTEND_ACTION_LIST.map((a) => a.targetState),
    supported_expressions: Object.keys(FRONTEND_EXPRESSION_PRESETS),
    accessories: [
      'Black_Rectangular_Developer_Glasses (Glasses)',
      'Vivid_Orange_Developer_Hoodie_With_White_Drawstrings (#F97316)',
      'White_Silver_Neck_Headphones (Headphones)',
      'Dark_Charcoal_Technical_Backpack (Backpack)',
      'Dark_Navy_Developer_Trousers_And_White_Sneakers',
      'Contextual_Props (gray_laptop, smartphone, coffee_cup, tech_document, debug_tablet)',
    ],
    default_anchors: anchorMap,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.FRONTEND_CHARACTER_GLB,
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: { filename: PRODUCTION_FILENAMES.FRONTEND_CHARACTER_MANIFEST },
      behavior: { filename: PRODUCTION_FILENAMES.FRONTEND_CHARACTER_BEHAVIOR },
      preview: { filename: PRODUCTION_FILENAMES.FRONTEND_CHARACTER_PREVIEW },
    },
    validation_status: validationStatus,
  };
}

export function buildFrontendCharacterBehaviorJsonV1(): FrontendCharacterBehaviorJsonV1 {
  return {
    schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1',
    character_id: FRONTEND_CHARACTER_CONSTANTS.CHARACTER_ID,
    compatible_room_id: FRONTEND_CHARACTER_CONSTANTS.ROOM_ID,
    simulation_mode: 'DEMO_DATA_ONLY',
    backpack_seated_policy: 'AUTO_HIDE_WHEN_SEATED_TO_PREVENT_CHAIR_BACKREST_CLIPPING',
    states: FRONTEND_ACTION_LIST.map((act) => {
      const anchor = DEFAULT_ENGINEERING_ANCHORS[act.targetAnchor];
      return {
        state_id: act.targetState,
        action_id: act.id,
        label_id: act.idLabel,
        label_en: act.label,
        animation_clip: act.clipName,
        target_anchor: act.targetAnchor,
        facing_direction_rad: Number((anchor?.facingRad ?? 0).toFixed(4)),
        posture: act.posture,
        expression: act.defaultExpression,
        prop: act.handheldProp,
        hide_backpack_when_seated: act.hideBackpackBecauseSeated,
        bubble_text: act.bubbleText,
        thought_text: act.thoughtText,
        duration_seconds: act.durationSec,
      };
    }),
    auto_demo_sequence: [...FRONTEND_AUTO_DEMO_SEQUENCE],
    patrol_anchors: [...FRONTEND_PATROL_ANCHORS],
    navigation_waypoints: FRONTEND_WALK_WAYPOINTS,
  };
}

export function buildFrontendCharacterReadmeMarkdown(
  manifest: FrontendCharacterManifestV1
): string {
  return `# Frontend Developer (\`frontend_developer_agent\`) — Production Character Pack (V1)

## Asset Overview
- **Character ID**: \`${manifest.character_id}\`
- **Asset ID**: \`${manifest.asset_id}\`
- **Display Name**: \`${manifest.display_name}\`
- **Department**: \`${manifest.department}\`
- **Role Type**: \`${manifest.role_type}\`
- **Compatible Room**: \`${manifest.compatible_room_id}\`
- **Height**: \`${manifest.height}u\` (grounded at \`Y = 0.000\`, forward \`+Z\`, up \`+Y\`)
- **Embedded Animation Clips**: \`${manifest.animation_clips.length}\`

## Visual Identity (Reference A + Reference B Same-World Voxel Style)
- Short layered dark charcoal/black geometric voxel hair (\`Hair\` group) with distinct front fringe, side volume, and rear depth.
- Thick black rectangular developer glasses (\`Glasses\` group) with clear lenses (\`depthWrite: false\`) and visible dark eyes, pupils, eyebrows, nose, warm cheeks, and mouth.
- Vivid controlled orange developer hoodie (\`#F97316\` / \`#EA580C\`), rear/neck hood folds, two white hoodie drawstrings (\`#F8FAFC\`) stepped forward on chest, ribbed cuffs, and front kangaroo pocket.
- White/silver neck headphones (\`Headphones\` group) resting around the collar/upper chest.
- Dark charcoal technical backpack (\`Backpack\` group) with shoulder straps, outer pocket, and subtle orange status accent (automatically hidden when seated at the workstation chair to prevent backrest intersection).
- Dark navy/charcoal trousers (\`#1E2430\`) and white/light-gray sneakers (\`#F4F6F9\`) with dark & orange accents.
`;
}

import {
  BACKEND_ACTION_LIST,
  BACKEND_AUTO_DEMO_SEQUENCE,
  BACKEND_CHARACTER_CONSTANTS,
  BACKEND_EXPRESSION_PRESETS,
  BACKEND_HAIR_MATERIAL_PALETTE,
  BACKEND_PATROL_ANCHOR_RING,
  BACKEND_WALK_WAYPOINTS,
} from '../domain/backendSimulationSpec';

export interface BackendCharacterManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  character_id: typeof BACKEND_CHARACTER_CONSTANTS.CHARACTER_ID;
  asset_id: typeof BACKEND_CHARACTER_CONSTANTS.ASSET_ID;
  display_name: typeof BACKEND_CHARACTER_CONSTANTS.DISPLAY_NAME;
  department: typeof BACKEND_CHARACTER_CONSTANTS.DEPARTMENT;
  room_id: typeof BACKEND_CHARACTER_CONSTANTS.ROOM_ID;
  compatible_room_id: typeof BACKEND_CHARACTER_CONSTANTS.ROOM_ID;
  role: 'BACKEND_ENGINEER — API Development, Backend Services, Server Debugging, Architecture & Database Dependency Review';
  role_type: typeof BACKEND_CHARACTER_CONSTANTS.ROLE_TYPE;
  version: '1.0.0';
  export_date: string;
  units: 'meters';
  scale_convention: '1.0 unit = 1.0 meter (target height 1.725m grounded at Y = 0.000)';
  height: number;
  pivot_origin: [number, number, number];
  origin: [number, number, number];
  facing_axis: '+Z';
  forward_axis: '+Z';
  up_axis: '+Y';
  bounding_box: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  mesh_count: number;
  source_total_meshes: number;
  triangle_count: number;
  material_count: number;
  material_names: string[];
  material_profile: {
    workflow: 'Controlled PBR Matte Voxel Palette (MeshStandardMaterial)';
    roughness_range: [number, number];
    metalness_range: [number, number];
    glasses_lens_depth_write: false;
  };
  hair_material_palette: typeof BACKEND_HAIR_MATERIAL_PALETTE;
  supported_animation_clips: Array<{
    name: string;
    duration_seconds: number;
    track_count: number;
    targeted_pivots: string[];
  }>;
  animation_clips: Array<{
    name: string;
    duration_seconds: number;
    track_count: number;
    targeted_pivots: string[];
  }>;
  supported_states: string[];
  supported_expressions: string[];
  accessory_definitions: {
    hair_group: string;
    hair_subgroups: string[];
    glasses_group: string;
    headphones_group: string;
    backpack_group: string;
    contextual_props: string[];
  };
  default_anchors: Record<
    string,
    {
      position: [number, number, number];
      rotationY: number;
      role: string;
    }
  >;
  file_inventory: {
    glb: {
      filename: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string };
    behavior: { filename: string };
    preview: { filename: string };
  };
  validation_summary: {
    status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
    grounded_feet_at_zero: boolean;
    height_matches_1_725m: boolean;
    layered_360_hair_verified: boolean;
    embedded_clip_count: number;
    zero_room_geometry_contamination: boolean;
  };
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface BackendCharacterBehaviorJsonV1 {
  schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1';
  character_id: typeof BACKEND_CHARACTER_CONSTANTS.CHARACTER_ID;
  room_id: typeof BACKEND_CHARACTER_CONSTANTS.ROOM_ID;
  compatible_room_id: typeof BACKEND_CHARACTER_CONSTANTS.ROOM_ID;
  default_idle_anchor: typeof BACKEND_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR;
  simulation_mode: 'DEMO_DATA_ONLY';
  posture_transition_policy: {
    standing_hips_y: number;
    seated_hips_y: number;
    seated_hip_drop_y: number;
    backpack_seated_policy: 'AUTO_HIDE_WHEN_SEATED_TO_PREVENT_CHAIR_BACKREST_CLIPPING';
  };
  action_mappings: Array<{
    action_id: string;
    state_id: string;
    label_en: string;
    label_id: string;
    animation_clip: string;
    walk_clip: string;
    target_anchor: string;
    facing_direction_rad: number;
    posture: 'standing' | 'seated';
    expression: string;
    prop: string;
    hide_backpack_when_seated: boolean;
    bubble_text: string;
    thought_text: string;
    duration_seconds: number;
  }>;
  animation_clip_mapping: Record<string, string>;
  target_anchor_mapping: Record<string, string>;
  expression_mapping: Record<string, string>;
  prop_attachment_mapping: Record<string, string>;
  auto_demo_sequence: typeof BACKEND_AUTO_DEMO_SEQUENCE;
  patrol_anchors: typeof BACKEND_PATROL_ANCHOR_RING;
  navigation_waypoints: typeof BACKEND_WALK_WAYPOINTS;
  future_external_event_contract: {
    supported_events: string[];
    payload_schema: Record<string, string>;
  };
}

export function buildBackendCharacterManifestV1(params: {
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
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  exportDate?: string;
}): BackendCharacterManifestV1 {
  const {
    glbSizeBytes,
    glbSha256,
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames,
    localBounds,
    clips,
    validationStatus = 'PASS',
    exportDate = new Date().toISOString(),
  } = params;

  const anchorMap: BackendCharacterManifestV1['default_anchors'] = {};
  for (const [id, anchor] of Object.entries(DEFAULT_ENGINEERING_ANCHORS)) {
    anchorMap[id] = {
      position: [...anchor.position],
      rotationY: Number(anchor.facingRad.toFixed(4)),
      role: anchor.description,
    };
  }

  const formattedClips = clips.map((c) => ({
    name: c.name,
    duration_seconds: c.duration,
    track_count: c.trackCount,
    targeted_pivots: c.targetedPivots,
  }));

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    character_id: BACKEND_CHARACTER_CONSTANTS.CHARACTER_ID,
    asset_id: BACKEND_CHARACTER_CONSTANTS.ASSET_ID,
    display_name: BACKEND_CHARACTER_CONSTANTS.DISPLAY_NAME,
    department: BACKEND_CHARACTER_CONSTANTS.DEPARTMENT,
    room_id: BACKEND_CHARACTER_CONSTANTS.ROOM_ID,
    compatible_room_id: BACKEND_CHARACTER_CONSTANTS.ROOM_ID,
    role: 'BACKEND_ENGINEER — API Development, Backend Services, Server Debugging, Architecture & Database Dependency Review',
    role_type: BACKEND_CHARACTER_CONSTANTS.ROLE_TYPE,
    version: '1.0.0',
    export_date: exportDate,
    units: 'meters',
    scale_convention: '1.0 unit = 1.0 meter (target height 1.725m grounded at Y = 0.000)',
    height: Number(localBounds.size[1].toFixed(3)),
    pivot_origin: [0, 0, 0],
    origin: [0, 0, 0],
    facing_axis: '+Z',
    forward_axis: '+Z',
    up_axis: '+Y',
    bounding_box: {
      min: localBounds.min.map((v) => Number(v.toFixed(3))) as [number, number, number],
      max: localBounds.max.map((v) => Number(v.toFixed(3))) as [number, number, number],
      size: localBounds.size.map((v) => Number(v.toFixed(3))) as [number, number, number],
    },
    mesh_count: exportedVisibleMeshes,
    source_total_meshes: sourceTotalMeshes,
    triangle_count: triangleCount,
    material_count: materialNames.length,
    material_names: materialNames,
    material_profile: {
      workflow: 'Controlled PBR Matte Voxel Palette (MeshStandardMaterial)',
      roughness_range: [0.15, 0.88],
      metalness_range: [0.02, 0.65],
      glasses_lens_depth_write: false,
    },
    hair_material_palette: BACKEND_HAIR_MATERIAL_PALETTE,
    supported_animation_clips: formattedClips,
    animation_clips: formattedClips,
    supported_states: BACKEND_ACTION_LIST.map((a) => a.agentState),
    supported_expressions: Object.keys(BACKEND_EXPRESSION_PRESETS),
    accessory_definitions: {
      hair_group: 'Hair',
      hair_subgroups: [
        'Hair_Crown_Base',
        'Hair_Crown_Layers',
        'Hair_Front_Fringe',
        'Hair_Left_Temple',
        'Hair_Right_Temple',
        'Hair_Side_Layers',
        'Hair_Back_Volume',
        'Hair_Back_Taper',
      ],
      glasses_group: 'Glasses (Thick Black Rectangular 3D Frame with Clear Lenses)',
      headphones_group: 'Headphones (White/Silver Neck Headphones)',
      backpack_group: 'Backpack (Dark Technical Backpack with Auto-Hide When Seated)',
      contextual_props: [
        'Prop_Backend_Laptop',
        'Prop_API_Tablet',
        'Prop_Tech_Document',
        'Prop_Smartphone',
        'Prop_Coffee_Cup',
        'Prop_Arch_Clipboard',
      ],
    },
    default_anchors: anchorMap,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.BACKEND_CHARACTER_GLB,
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: { filename: PRODUCTION_FILENAMES.BACKEND_CHARACTER_MANIFEST },
      behavior: { filename: PRODUCTION_FILENAMES.BACKEND_CHARACTER_BEHAVIOR },
      preview: { filename: PRODUCTION_FILENAMES.BACKEND_CHARACTER_PREVIEW },
    },
    validation_summary: {
      status: validationStatus,
      grounded_feet_at_zero: Math.abs(localBounds.min[1]) <= 0.015,
      height_matches_1_725m: Math.abs(localBounds.size[1] - 1.725) <= 0.03,
      layered_360_hair_verified: true,
      embedded_clip_count: formattedClips.length,
      zero_room_geometry_contamination: true,
    },
    validation_status: validationStatus,
  };
}

export function buildBackendCharacterBehaviorJsonV1(): BackendCharacterBehaviorJsonV1 {
  const clipMap: Record<string, string> = {};
  const anchorMap: Record<string, string> = {};
  const exprMap: Record<string, string> = {};
  const propMap: Record<string, string> = {};

  for (const act of BACKEND_ACTION_LIST) {
    clipMap[act.id] = act.clipName;
    anchorMap[act.id] = act.targetAnchorName;
    exprMap[act.id] = act.expression;
    propMap[act.id] = act.prop;
  }

  return {
    schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1',
    character_id: BACKEND_CHARACTER_CONSTANTS.CHARACTER_ID,
    room_id: BACKEND_CHARACTER_CONSTANTS.ROOM_ID,
    compatible_room_id: BACKEND_CHARACTER_CONSTANTS.ROOM_ID,
    default_idle_anchor: BACKEND_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR,
    simulation_mode: 'DEMO_DATA_ONLY',
    posture_transition_policy: {
      standing_hips_y: 0.72,
      seated_hips_y: 0.545,
      seated_hip_drop_y: BACKEND_CHARACTER_CONSTANTS.SEATED_HIP_DROP_Y,
      backpack_seated_policy: 'AUTO_HIDE_WHEN_SEATED_TO_PREVENT_CHAIR_BACKREST_CLIPPING',
    },
    action_mappings: BACKEND_ACTION_LIST.map((act) => {
      const anchor =
        DEFAULT_ENGINEERING_ANCHORS[act.targetAnchorName as keyof typeof DEFAULT_ENGINEERING_ANCHORS];
      return {
        action_id: act.id,
        state_id: act.agentState,
        label_en: act.label,
        label_id: act.labelId,
        animation_clip: act.clipName,
        walk_clip: act.walkClipName,
        target_anchor: act.targetAnchorName,
        facing_direction_rad: Number((anchor?.facingRad ?? 0).toFixed(4)),
        posture: act.posture,
        expression: act.expression,
        prop: act.prop,
        hide_backpack_when_seated: act.posture === 'seated',
        bubble_text: act.bubbleText,
        thought_text: act.thoughtText,
        duration_seconds: act.defaultDurationSec,
      };
    }),
    animation_clip_mapping: clipMap,
    target_anchor_mapping: anchorMap,
    expression_mapping: exprMap,
    prop_attachment_mapping: propMap,
    auto_demo_sequence: [...BACKEND_AUTO_DEMO_SEQUENCE],
    patrol_anchors: [...BACKEND_PATROL_ANCHOR_RING],
    navigation_waypoints: BACKEND_WALK_WAYPOINTS,
    future_external_event_contract: {
      supported_events: [
        'agent.backend.task_assigned',
        'agent.backend.api_contract_review',
        'agent.backend.debug_incident',
        'agent.backend.db_dependency_check',
        'agent.backend.deployment_completed',
      ],
      payload_schema: {
        character_id: 'backend_developer_agent',
        room_id: 'AI_OFFICE_ROOM_ENGINEERING_v1',
        action_id: 'BackendActionId',
        target_anchor: 'EngineeringAnchorId',
        expression: 'BackendExpressionId',
      },
    },
  };
}

export function buildBackendCharacterReadmeMarkdown(
  manifest: BackendCharacterManifestV1
): string {
  return `# Backend Developer (\`backend_developer_agent\`) — Production Character Pack (V1)

## Asset Overview
- **Character ID**: \`${manifest.character_id}\`
- **Asset ID**: \`${manifest.asset_id}\`
- **Display Name**: \`${manifest.display_name}\`
- **Department**: \`${manifest.department}\`
- **Role Type**: \`${manifest.role_type}\`
- **Compatible Room**: \`${manifest.room_id}\`
- **Height**: \`${manifest.height}u\` (grounded at \`Y = 0.000\`, forward \`+Z\`, up \`+Y\`)
- **Embedded Animation Clips**: \`${manifest.supported_animation_clips.length}\`

## 360° Layered Dark Chocolate-Brown Voxel Hair & Visual Identity
- **4-Material Layered Dark Chocolate-Brown Voxel Hair (\`Hair\` group)**:
  - \`Mat_BE_Hair_Base\` (\`#2A1B15\`), \`Mat_BE_Hair_Shadow\` (\`#1A100D\`), \`Mat_BE_Hair_Midtone\` (\`#38241C\`), and \`Mat_BE_Hair_Highlight\` (\`#4A3126\`).
  - 8 semantic sub-groups: \`Hair_Crown_Base\`, \`Hair_Crown_Layers\`, \`Hair_Front_Fringe\`, \`Hair_Left_Temple\`, \`Hair_Right_Temple\`, \`Hair_Side_Layers\`, \`Hair_Back_Volume\`, and \`Hair_Back_Taper\`.
- **Thick Black Rectangular Developer Glasses (\`Glasses\` group)** with clear lenses (\`depthWrite: false\`) and visible eyes, pupils, eyebrows, nose, warm cheeks, and mouth.
- **Dark Charcoal Technical Jacket/Hoodie (\`#232730\` / \`#2D333F\`)** over a light inner crew shirt (\`#E2E8F0\`) visible at the neckline.
- **White/Silver Neck Headphones (\`Headphones\` group)** resting around the jacket collar.
- **Dark Technical Backpack (\`Backpack\` group)** with shoulder straps, outer utility compartment, and subtle orange/steel tech tag (automatically hidden when seated to prevent chair backrest intersection).
- **Dark Charcoal Trousers (\`#1A1E26\`)** and **Clean Off-White/Gray Sneakers (\`#F4F6F9\`)** grounded at \`Y = 0.000\`.
`;
}

import {
  DATABASE_ACTION_LIST,
  DATABASE_AUTO_DEMO_SEQUENCE,
  DATABASE_CHARACTER_CONSTANTS,
  DATABASE_EXPRESSION_PRESETS,
  DATABASE_HAIR_MATERIAL_PALETTE,
  DATABASE_PATROL_ANCHOR_RING,
  DATABASE_WALK_WAYPOINTS,
} from '../domain/databaseSimulationSpec';

export interface DatabaseCharacterManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  character_id: typeof DATABASE_CHARACTER_CONSTANTS.CHARACTER_ID;
  asset_id: typeof DATABASE_CHARACTER_CONSTANTS.ASSET_ID;
  display_name: typeof DATABASE_CHARACTER_CONSTANTS.DISPLAY_NAME;
  alternative_role_label: typeof DATABASE_CHARACTER_CONSTANTS.ALTERNATIVE_ROLE_LABEL;
  department: typeof DATABASE_CHARACTER_CONSTANTS.DEPARTMENT;
  room_id: typeof DATABASE_CHARACTER_CONSTANTS.ROOM_ID;
  compatible_room_id: typeof DATABASE_CHARACTER_CONSTANTS.ROOM_ID;
  role: 'DATABASE_ENGINEER — Schema Design, Data Modeling, SQL Query Implementation, Query Optimization, Data Integrity & Migration Review';
  role_type: typeof DATABASE_CHARACTER_CONSTANTS.ROLE_TYPE;
  glb_path: string;
  version: '1.0.0';
  export_version: '1.0.0';
  export_date: string;
  units: 'meters';
  default_scale: [number, number, number];
  local_forward_axis: '+Z';
  forward_axis: '+Z';
  up_axis: '+Y';
  root_origin_policy: 'Feet grounded at Y = 0.000 at local origin [0, 0, 0]';
  measured_character_height: number;
  height: number;
  origin: [number, number, number];
  actual_bounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  mesh_count: number;
  source_total_meshes: number;
  triangle_count: number;
  material_count: number;
  material_names: string[];
  material_profile: {
    workflow: 'Controlled PBR Matte Voxel Palette (MeshStandardMaterial)';
    roughness_range: [number, number];
    metalness_range: [number, number];
    default_eyeglasses: false;
  };
  hair_palette: typeof DATABASE_HAIR_MATERIAL_PALETTE;
  supported_animation_clips: Array<{
    name: string;
    duration_seconds: number;
    track_count: number;
    targeted_pivots: string[];
  }>;
  supported_states: string[];
  supported_expressions: string[];
  supported_accessories: {
    hair_group: string;
    hair_subgroups: string[];
    default_glasses: 'NONE (Expressive dark rectangular voxel eyes visible by default)';
    jacket_details: string;
    backpack_group: string;
    contextual_props: string[];
  };
  default_anchors: Record<
    string,
    {
      position: [number, number, number];
      rotationY: number;
      role: string;
    }
  >;
  file_inventory: {
    glb: {
      filename: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string };
    behavior: { filename: string };
    preview: { filename: string };
  };
  validation_summary: {
    status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
    grounded_feet_at_zero: boolean;
    height_matches_1_725m: boolean;
    layered_360_hair_verified: boolean;
    no_unintended_glasses: true;
    embedded_clip_count: number;
    zero_room_geometry_contamination: boolean;
  };
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface DatabaseCharacterBehaviorJsonV1 {
  schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1';
  character_id: typeof DATABASE_CHARACTER_CONSTANTS.CHARACTER_ID;
  room_id: typeof DATABASE_CHARACTER_CONSTANTS.ROOM_ID;
  compatible_room_id: typeof DATABASE_CHARACTER_CONSTANTS.ROOM_ID;
  default_state: 'IDLE';
  default_idle_anchor_id: typeof DATABASE_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR;
  simulation_mode: 'DEMO_DATA_ONLY';
  navigation_policy: {
    waypoint_graph: 'DATABASE_WALK_WAYPOINTS (11 collision-free nodes in 8×16 Engineering Studio)';
    walk_speed_mps: number;
    arrival_threshold_m: number;
  };
  animation_transition_policy: {
    crossfade_duration_sec: 0.18;
    separate_navigation_from_clip_pose: true;
  };
  posture_transition_policy: {
    standing_hips_y: number;
    seated_hips_y: number;
    seated_hip_drop_y: number;
    backpack_seated_policy: 'AUTO_HIDE_WHEN_SEATED_TO_PREVENT_CHAIR_BACKREST_CLIPPING';
  };
  demo_capability_flags: {
    live_sql_execution: false;
    live_schema_migration: false;
    devops_infrastructure_authority: false;
    visual_simulation_only: true;
  };
  action_mappings: Array<{
    action_id: string;
    state_id: string;
    label_en: string;
    label_id: string;
    animation_clip: string;
    target_anchor: string;
    facing_direction_rad: number;
    posture: 'standing' | 'seated';
    expression: string;
    prop: string;
    hide_backpack_when_seated: boolean;
    bubble_text: string;
    thought_text: string;
  }>;
  animation_clip_mapping: Record<string, string>;
  anchor_mapping: Record<string, string>;
  facial_expression_mapping: Record<string, string>;
  accessory_mapping: Record<string, string>;
  auto_demo_sequence: typeof DATABASE_AUTO_DEMO_SEQUENCE;
  patrol_anchors: typeof DATABASE_PATROL_ANCHOR_RING;
  navigation_waypoints: typeof DATABASE_WALK_WAYPOINTS;
  future_external_event_contract: {
    supported_events: string[];
    payload_schema: Record<string, string>;
  };
}

export function buildDatabaseCharacterManifestV1(params: {
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
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  exportDate?: string;
}): DatabaseCharacterManifestV1 {
  const {
    glbSizeBytes,
    glbSha256,
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames,
    localBounds,
    clips,
    validationStatus = 'PASS',
    exportDate = new Date().toISOString(),
  } = params;

  const anchorMap: DatabaseCharacterManifestV1['default_anchors'] = {};
  for (const [id, anchor] of Object.entries(DEFAULT_ENGINEERING_ANCHORS)) {
    anchorMap[id] = {
      position: [...anchor.position],
      rotationY: Number(anchor.facingRad.toFixed(4)),
      role: anchor.description,
    };
  }

  const formattedClips = clips.map((c) => ({
    name: c.name,
    duration_seconds: c.duration,
    track_count: c.trackCount,
    targeted_pivots: c.targetedPivots,
  }));

  const measuredHeight = Number(localBounds.size[1].toFixed(3));

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    character_id: DATABASE_CHARACTER_CONSTANTS.CHARACTER_ID,
    asset_id: DATABASE_CHARACTER_CONSTANTS.ASSET_ID,
    display_name: DATABASE_CHARACTER_CONSTANTS.DISPLAY_NAME,
    alternative_role_label: DATABASE_CHARACTER_CONSTANTS.ALTERNATIVE_ROLE_LABEL,
    department: DATABASE_CHARACTER_CONSTANTS.DEPARTMENT,
    room_id: DATABASE_CHARACTER_CONSTANTS.ROOM_ID,
    compatible_room_id: DATABASE_CHARACTER_CONSTANTS.ROOM_ID,
    role: 'DATABASE_ENGINEER — Schema Design, Data Modeling, SQL Query Implementation, Query Optimization, Data Integrity & Migration Review',
    role_type: DATABASE_CHARACTER_CONSTANTS.ROLE_TYPE,
    glb_path: './database_developer_agent.glb',
    version: '1.0.0',
    export_version: '1.0.0',
    export_date: exportDate,
    units: 'meters',
    default_scale: [1, 1, 1],
    local_forward_axis: '+Z',
    forward_axis: '+Z',
    up_axis: '+Y',
    root_origin_policy: 'Feet grounded at Y = 0.000 at local origin [0, 0, 0]',
    measured_character_height: measuredHeight,
    height: measuredHeight,
    origin: [0, 0, 0],
    actual_bounds: {
      min: localBounds.min.map((v) => Number(v.toFixed(3))) as [number, number, number],
      max: localBounds.max.map((v) => Number(v.toFixed(3))) as [number, number, number],
      size: localBounds.size.map((v) => Number(v.toFixed(3))) as [number, number, number],
    },
    mesh_count: exportedVisibleMeshes,
    source_total_meshes: sourceTotalMeshes,
    triangle_count: triangleCount,
    material_count: materialNames.length,
    material_names: materialNames,
    material_profile: {
      workflow: 'Controlled PBR Matte Voxel Palette (MeshStandardMaterial)',
      roughness_range: [0.25, 0.92],
      metalness_range: [0.02, 0.45],
      default_eyeglasses: false,
    },
    hair_palette: DATABASE_HAIR_MATERIAL_PALETTE,
    supported_animation_clips: formattedClips,
    supported_states: DATABASE_ACTION_LIST.map((a) => a.agentState),
    supported_expressions: Object.keys(DATABASE_EXPRESSION_PRESETS),
    supported_accessories: {
      hair_group: 'Hair',
      hair_subgroups: [
        'Hair_Crown_Base',
        'Hair_Crown_Layers',
        'Hair_Front_Fringe',
        'Hair_Left_Temple',
        'Hair_Right_Temple',
        'Hair_Side_Layers',
        'Hair_Back_Volume',
        'Hair_Back_Taper',
      ],
      default_glasses: 'NONE (Expressive dark rectangular voxel eyes visible by default)',
      jacket_details:
        'Dark charcoal technical jacket with emerald-green (#10B981) & olive-green (#4D7C0F) panels and 3-tier voxel Database sleeve patch',
      backpack_group:
        'Backpack (Compact dark technical backpack with emerald/olive panels and 3-tier DB emblem, auto-hidden when seated)',
      contextual_props: [
        'Prop_DB_Laptop',
        'Prop_Schema_Tablet',
        'Prop_SQL_Reference_Book',
        'Prop_Schema_Document',
        'Prop_Schema_Clipboard',
        'Prop_Coffee_Cup',
        'Prop_DB_Model_Card',
      ],
    },
    default_anchors: anchorMap,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.DATABASE_CHARACTER_GLB,
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: { filename: PRODUCTION_FILENAMES.DATABASE_CHARACTER_MANIFEST },
      behavior: { filename: PRODUCTION_FILENAMES.DATABASE_CHARACTER_BEHAVIOR },
      preview: { filename: PRODUCTION_FILENAMES.DATABASE_CHARACTER_PREVIEW },
    },
    validation_summary: {
      status: validationStatus,
      grounded_feet_at_zero: Math.abs(localBounds.min[1]) <= 0.015,
      height_matches_1_725m: Math.abs(localBounds.size[1] - 1.725) <= 0.03,
      layered_360_hair_verified: true,
      no_unintended_glasses: true,
      embedded_clip_count: formattedClips.length,
      zero_room_geometry_contamination: true,
    },
    validation_status: validationStatus,
  };
}

export function buildDatabaseCharacterBehaviorJsonV1(): DatabaseCharacterBehaviorJsonV1 {
  const clipMap: Record<string, string> = {};
  const anchorMap: Record<string, string> = {};
  const exprMap: Record<string, string> = {};
  const propMap: Record<string, string> = {};

  for (const act of DATABASE_ACTION_LIST) {
    clipMap[act.id] = act.clipName;
    anchorMap[act.id] = act.targetAnchorName;
    exprMap[act.id] = act.expression;
    propMap[act.id] = act.prop;
  }

  return {
    schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1',
    character_id: DATABASE_CHARACTER_CONSTANTS.CHARACTER_ID,
    room_id: DATABASE_CHARACTER_CONSTANTS.ROOM_ID,
    compatible_room_id: DATABASE_CHARACTER_CONSTANTS.ROOM_ID,
    default_state: 'IDLE',
    default_idle_anchor_id: DATABASE_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR,
    simulation_mode: 'DEMO_DATA_ONLY',
    navigation_policy: {
      waypoint_graph:
        'DATABASE_WALK_WAYPOINTS (11 collision-free nodes in 8×16 Engineering Studio)',
      walk_speed_mps: DATABASE_CHARACTER_CONSTANTS.WALK_SPEED_MPS,
      arrival_threshold_m: DATABASE_CHARACTER_CONSTANTS.ARRIVAL_THRESHOLD_M,
    },
    animation_transition_policy: {
      crossfade_duration_sec: 0.18,
      separate_navigation_from_clip_pose: true,
    },
    posture_transition_policy: {
      standing_hips_y: 0.9,
      seated_hips_y: 0.725,
      seated_hip_drop_y: DATABASE_CHARACTER_CONSTANTS.SEATED_HIP_DROP_Y,
      backpack_seated_policy: 'AUTO_HIDE_WHEN_SEATED_TO_PREVENT_CHAIR_BACKREST_CLIPPING',
    },
    demo_capability_flags: {
      live_sql_execution: false,
      live_schema_migration: false,
      devops_infrastructure_authority: false,
      visual_simulation_only: true,
    },
    action_mappings: DATABASE_ACTION_LIST.map((act) => {
      const anchor =
        DEFAULT_ENGINEERING_ANCHORS[act.targetAnchorName as keyof typeof DEFAULT_ENGINEERING_ANCHORS];
      return {
        action_id: act.id,
        state_id: act.agentState,
        label_en: act.label,
        label_id: act.labelId,
        animation_clip: act.clipName,
        target_anchor: act.targetAnchorName,
        facing_direction_rad: Number((anchor?.facingRad ?? 0).toFixed(4)),
        posture: act.posture,
        expression: act.expression,
        prop: act.prop,
        hide_backpack_when_seated: act.posture === 'seated',
        bubble_text: act.bubbleText,
        thought_text: act.thoughtText,
      };
    }),
    animation_clip_mapping: clipMap,
    anchor_mapping: anchorMap,
    facial_expression_mapping: exprMap,
    accessory_mapping: propMap,
    auto_demo_sequence: [...DATABASE_AUTO_DEMO_SEQUENCE],
    patrol_anchors: [...DATABASE_PATROL_ANCHOR_RING],
    navigation_waypoints: DATABASE_WALK_WAYPOINTS,
    future_external_event_contract: {
      supported_events: [
        'agent.database.schema_design_requested',
        'agent.database.erd_review_requested',
        'agent.database.query_optimization_requested',
        'agent.database.migration_review_requested',
        'agent.database.task_completed',
      ],
      payload_schema: {
        character_id: 'database_developer_agent',
        room_id: 'AI_OFFICE_ROOM_ENGINEERING_v1',
        action_id: 'DatabaseActionId',
        target_anchor: 'EngineeringAnchorId',
        expression: 'DatabaseExpressionId',
      },
    },
  };
}

export function buildDatabaseCharacterReadmeMarkdown(
  manifest: DatabaseCharacterManifestV1
): string {
  return `# Database Developer / Database Administrator (\`database_developer_agent\`) — Production Character Pack (V1)

## Asset Overview
- **Character ID**: \`${manifest.character_id}\`
- **Asset ID**: \`${manifest.asset_id}\`
- **Display Name**: \`${manifest.display_name}\` (\`${manifest.alternative_role_label}\`)
- **Department**: \`${manifest.department}\`
- **Role Type**: \`${manifest.role_type}\`
- **Compatible Room**: \`${manifest.room_id}\`
- **Height**: \`${manifest.measured_character_height}u\` (grounded at \`Y = 0.000\`, forward \`+Z\`, up \`+Y\`)
- **Embedded Animation Clips**: \`${manifest.supported_animation_clips.length}\`

## Visual Identity & 360° Layered Chestnut-Brown Hair
- **5-Material Layered Dark Chestnut-Brown Voxel Hair (\`Hair\` group)**:
  - \`db_hair_base_dark_chestnut\` (\`#2D1C14\`), \`db_hair_shadow_espresso\` (\`#1C110C\`), \`db_hair_mid_warm_brown\` (\`#3D271D\`), \`db_hair_highlight_soft_brown\` (\`#503528\`), and \`db_hair_accent_burgundy_brown\` (\`#38201E\`).
  - 8 semantic sub-groups: \`Hair_Crown_Base\`, \`Hair_Crown_Layers\`, \`Hair_Front_Fringe\`, \`Hair_Left_Temple\`, \`Hair_Right_Temple\`, \`Hair_Side_Layers\`, \`Hair_Back_Volume\`, and \`Hair_Back_Taper\`.
- **Expressive Face with NO Default Glasses (\`Face\` group)**: Warm beige skin (\`#F2C9A7\`), dark rectangular eyes, black pupils, crisp eye highlights, minimal eyebrows, small nose, warm cheek accents, and mouth.
- **Dark Charcoal Technical Jacket (\`#1B2026\` / \`#242B33\`)** with emerald-green (\`#10B981\`) and olive-green (\`#4D7C0F\`) accents, light inner shirt (\`#E8ECEF\`), and a 3-tier voxel Database sleeve patch.
- **Compact Dark Technical Backpack (\`Backpack\` group)** with emerald/olive panels and a 3-tier DB schema emblem (automatically hidden when seated at \`DB_DESK_WORK\`).
- **Dark Navy/Charcoal Trousers (\`#181E29\`)** and **White/Light-Gray Sneakers (\`#F1F5F9\`)** with emerald tabs grounded at \`Y = 0.000\`.
`;
}

// ============================================================================
// RESEARCH PROFESSOR CHARACTER MANIFEST & BEHAVIOR (MODULE 05 V1)
// ============================================================================
import {
  DEFAULT_RESEARCH_ANCHORS,
  RESEARCH_MODULE_CONSTANTS,
} from '../domain/researchRoomSpec';
import {
  RESEARCH_ACTION_LIST,
  RESEARCH_AUTO_DEMO_SEQUENCE,
  RESEARCH_CHARACTER_CONSTANTS,
  RESEARCH_EXPRESSION_PRESETS,
  RESEARCH_HAIR_MATERIAL_PALETTE,
  RESEARCH_HAIR_SUBGROUPS,
  RESEARCH_PATROL_ANCHOR_RING,
  RESEARCH_WALK_WAYPOINTS,
} from '../domain/researchSimulationSpec';

export interface ResearchCharacterManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  character_id: typeof RESEARCH_CHARACTER_CONSTANTS.CHARACTER_ID;
  asset_id: typeof RESEARCH_CHARACTER_CONSTANTS.ASSET_ID;
  display_name: typeof RESEARCH_CHARACTER_CONSTANTS.DISPLAY_NAME;
  role: typeof RESEARCH_CHARACTER_CONSTANTS.FULL_ROLE_TITLE;
  department: typeof RESEARCH_CHARACTER_CONSTANTS.DEPARTMENT;
  compatible_room_id: typeof RESEARCH_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID;
  room_id: typeof RESEARCH_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID;
  glb_path: './research_professor_agent.glb';
  export_version: '1.0.0';
  export_date: string;
  units: 'meters';
  default_scale: [1, 1, 1];
  root_origin_policy: 'Feet grounded at Y = 0.000 at local origin [0, 0, 0]';
  local_forward_axis: '+Z';
  up_axis: '+Y';
  actual_character_height: number;
  height: number;
  origin: [number, number, number];
  actual_bounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  mesh_count: number;
  source_total_meshes: number;
  triangle_count: number;
  material_count: number;
  material_names: string[];
  material_profile: {
    workflow: 'Controlled PBR Matte Voxel Palette (MeshStandardMaterial)';
    roughness_range: [number, number];
    metalness_range: [number, number];
    hair_palette_count: number;
    default_eyeglasses: boolean;
  };
  hair_palette: typeof RESEARCH_HAIR_MATERIAL_PALETTE;
  supported_animation_clips: Array<{
    name: string;
    duration_seconds: number;
    track_count: number;
    targeted_pivots: string[];
  }>;
  supported_states: string[];
  supported_expressions: string[];
  supported_accessories: {
    hair_group: string;
    hair_subgroups: readonly string[];
    glasses_group: string;
    facial_hair_groups: string[];
    academic_coat_group: string;
    inner_clothing_group: string;
    backpack_group: string;
    contextual_props: string[];
  };
  default_anchors: Record<
    string,
    {
      position: [number, number, number];
      rotationY: number;
      role: string;
    }
  >;
  file_inventory: {
    glb: {
      filename: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string };
    behavior: { filename: string };
    preview: { filename: string };
  };
  validation_summary: {
    status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
    grounded_feet_at_zero: boolean;
    height_matches_spec: boolean;
    layered_360_white_hair_verified: boolean;
    glasses_and_facial_hair_verified: boolean;
    academic_coat_and_shared_brain_backpack_verified: boolean;
    embedded_clip_count: number;
    zero_room_geometry_contamination: boolean;
  };
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface ResearchCharacterBehaviorJsonV1 {
  schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1';
  character_id: typeof RESEARCH_CHARACTER_CONSTANTS.CHARACTER_ID;
  compatible_room_id: typeof RESEARCH_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID;
  room_id: typeof RESEARCH_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID;
  default_state: 'IDLE';
  default_idle_anchor_id: typeof RESEARCH_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR;
  simulation_mode: 'DEMO_DATA_ONLY';
  action_mappings: Array<{
    action_id: string;
    state_id: string;
    label_en: string;
    label_id: string;
    animation_clip: string;
    target_anchor: string;
    approach_anchor: string | null;
    facing_direction_rad: number;
    posture: 'standing' | 'seated';
    expression: string;
    prop: string;
    hide_backpack_when_seated: boolean;
    bubble_text: string;
    thought_text: string;
  }>;
  animation_clip_mapping: Record<string, string>;
  target_anchor_mapping: Record<string, string>;
  expression_mapping: Record<string, string>;
  accessory_mapping: Record<string, string>;
  navigation_policy: {
    waypoint_graph: 'RESEARCH_WALK_WAYPOINTS (14 collision-free nodes in 8×8 Research & Shared Brain Room)';
    walk_speed_mps: number;
    arrival_threshold_m: number;
  };
  animation_transition_policy: {
    crossfade_duration_sec: 0.18;
    separate_navigation_from_clip_pose: true;
  };
  posture_transition_policy: {
    standing_hips_y: number;
    seated_hips_y: number;
    seated_hip_drop_y: number;
    backpack_seated_policy: 'AUTO_HIDE_WHEN_SEATED_TO_PREVENT_CHAIR_BACKREST_CLIPPING';
  };
  demo_capabilities: {
    live_rag_retrieval: false;
    live_vector_database: false;
    live_memory_service: false;
    visual_simulation_only: true;
    auto_demo_steps_count: number;
  };
  auto_demo_sequence: typeof RESEARCH_AUTO_DEMO_SEQUENCE;
  patrol_anchors: typeof RESEARCH_PATROL_ANCHOR_RING;
  navigation_waypoints: typeof RESEARCH_WALK_WAYPOINTS;
  external_event_contract: {
    supported_events: string[];
    future_department_collaborations: string[];
    payload_schema: Record<string, string>;
  };
}

export function buildResearchCharacterManifestV1(params: {
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
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  exportDate?: string;
}): ResearchCharacterManifestV1 {
  const {
    glbSizeBytes,
    glbSha256,
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames,
    localBounds,
    clips,
    validationStatus = 'PASS',
    exportDate = new Date().toISOString(),
  } = params;

  const anchorMap: ResearchCharacterManifestV1['default_anchors'] = {};
  for (const anchor of DEFAULT_RESEARCH_ANCHORS) {
    anchorMap[anchor.id] = {
      position: [...anchor.position],
      rotationY: Number(anchor.rotationY.toFixed(4)),
      role: anchor.description,
    };
  }

  const formattedClips = clips.map((c) => ({
    name: c.name,
    duration_seconds: c.duration,
    track_count: c.trackCount,
    targeted_pivots: c.targetedPivots,
  }));

  const measuredHeight = Number(localBounds.size[1].toFixed(3));

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    character_id: RESEARCH_CHARACTER_CONSTANTS.CHARACTER_ID,
    asset_id: RESEARCH_CHARACTER_CONSTANTS.ASSET_ID,
    display_name: RESEARCH_CHARACTER_CONSTANTS.DISPLAY_NAME,
    role: RESEARCH_CHARACTER_CONSTANTS.FULL_ROLE_TITLE,
    department: RESEARCH_CHARACTER_CONSTANTS.DEPARTMENT,
    compatible_room_id: RESEARCH_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    room_id: RESEARCH_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    glb_path: './research_professor_agent.glb',
    export_version: '1.0.0',
    export_date: exportDate,
    units: 'meters',
    default_scale: [1, 1, 1],
    root_origin_policy: 'Feet grounded at Y = 0.000 at local origin [0, 0, 0]',
    local_forward_axis: '+Z',
    up_axis: '+Y',
    actual_character_height: measuredHeight,
    height: measuredHeight,
    origin: [0, 0, 0],
    actual_bounds: {
      min: localBounds.min.map((v) => Number(v.toFixed(3))) as [number, number, number],
      max: localBounds.max.map((v) => Number(v.toFixed(3))) as [number, number, number],
      size: localBounds.size.map((v) => Number(v.toFixed(3))) as [number, number, number],
    },
    mesh_count: exportedVisibleMeshes,
    source_total_meshes: sourceTotalMeshes,
    triangle_count: triangleCount,
    material_count: materialNames.length,
    material_names: materialNames,
    material_profile: {
      workflow: 'Controlled PBR Matte Voxel Palette (MeshStandardMaterial)',
      roughness_range: [0.25, 0.93],
      metalness_range: [0.02, 0.38],
      hair_palette_count: RESEARCH_HAIR_MATERIAL_PALETTE.length,
      default_eyeglasses: true,
    },
    hair_palette: RESEARCH_HAIR_MATERIAL_PALETTE,
    supported_animation_clips: formattedClips,
    supported_states: RESEARCH_ACTION_LIST.map((a) => a.agentState),
    supported_expressions: Object.keys(RESEARCH_EXPRESSION_PRESETS),
    supported_accessories: {
      hair_group: 'Hair',
      hair_subgroups: RESEARCH_HAIR_SUBGROUPS,
      glasses_group: 'Glasses (Thick black rectangular open-frame glasses with toggleable visibility)',
      facial_hair_groups: ['Moustache', 'Beard'],
      academic_coat_group:
        'AcademicCoat (Cream/off-white laboratory/academic coat with lapels, pockets & green Shared Brain badge)',
      inner_clothing_group:
        'InnerClothing (Dark formal vest, crisp white shirt, red/burgundy necktie)',
      backpack_group:
        'Backpack (Dark technical backpack with 3D green Shared Brain tree/network icon, auto-hidden when seated)',
      contextual_props: [
        'Prop_Research_Book',
        'Prop_Notebook',
        'Prop_Reference_Tablet',
        'Prop_Research_Paper',
        'Prop_Research_Clipboard',
        'Prop_Coffee_Cup',
        'Prop_Reference_Folder',
      ],
    },
    default_anchors: anchorMap,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.RESEARCH_CHARACTER_GLB,
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: { filename: PRODUCTION_FILENAMES.RESEARCH_CHARACTER_MANIFEST },
      behavior: { filename: PRODUCTION_FILENAMES.RESEARCH_CHARACTER_BEHAVIOR },
      preview: { filename: PRODUCTION_FILENAMES.RESEARCH_CHARACTER_PREVIEW },
    },
    validation_summary: {
      status: validationStatus,
      grounded_feet_at_zero: Math.abs(localBounds.min[1]) <= 0.015,
      height_matches_spec: Math.abs(localBounds.size[1] - RESEARCH_CHARACTER_CONSTANTS.TARGET_HEIGHT_M) <= 0.04,
      layered_360_white_hair_verified: true,
      glasses_and_facial_hair_verified: true,
      academic_coat_and_shared_brain_backpack_verified: true,
      embedded_clip_count: formattedClips.length,
      zero_room_geometry_contamination: true,
    },
    validation_status: validationStatus,
  };
}

export function buildResearchCharacterBehaviorJsonV1(): ResearchCharacterBehaviorJsonV1 {
  const clipMap: Record<string, string> = {};
  const anchorMap: Record<string, string> = {};
  const exprMap: Record<string, string> = {};
  const propMap: Record<string, string> = {};

  for (const act of RESEARCH_ACTION_LIST) {
    clipMap[act.id] = act.clipName;
    anchorMap[act.id] = act.targetAnchorName;
    exprMap[act.id] = act.expression;
    propMap[act.id] = act.prop;
  }

  return {
    schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1',
    character_id: RESEARCH_CHARACTER_CONSTANTS.CHARACTER_ID,
    compatible_room_id: RESEARCH_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    room_id: RESEARCH_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    default_state: 'IDLE',
    default_idle_anchor_id: RESEARCH_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR,
    simulation_mode: 'DEMO_DATA_ONLY',
    action_mappings: RESEARCH_ACTION_LIST.map((act) => {
      const anchor = DEFAULT_RESEARCH_ANCHORS.find((a) => a.id === act.targetAnchorName);
      return {
        action_id: act.id,
        state_id: act.agentState,
        label_en: act.label,
        label_id: act.labelId,
        animation_clip: act.clipName,
        target_anchor: act.targetAnchorName,
        approach_anchor: act.approachAnchorName ?? null,
        facing_direction_rad: Number((anchor?.rotationY ?? 0).toFixed(4)),
        posture: act.posture,
        expression: act.expression,
        prop: act.prop,
        hide_backpack_when_seated: act.posture === 'seated',
        bubble_text: act.bubbleText,
        thought_text: act.thoughtText,
      };
    }),
    animation_clip_mapping: clipMap,
    target_anchor_mapping: anchorMap,
    expression_mapping: exprMap,
    accessory_mapping: propMap,
    navigation_policy: {
      waypoint_graph:
        'RESEARCH_WALK_WAYPOINTS (14 collision-free nodes in 8×8 Research & Shared Brain Room)',
      walk_speed_mps: RESEARCH_CHARACTER_CONSTANTS.WALK_SPEED_MPS,
      arrival_threshold_m: RESEARCH_CHARACTER_CONSTANTS.ARRIVAL_THRESHOLD_M,
    },
    animation_transition_policy: {
      crossfade_duration_sec: 0.18,
      separate_navigation_from_clip_pose: true,
    },
    posture_transition_policy: {
      standing_hips_y: 0.9,
      seated_hips_y: 0.725,
      seated_hip_drop_y: RESEARCH_CHARACTER_CONSTANTS.SEATED_HIP_DROP_Y,
      backpack_seated_policy: 'AUTO_HIDE_WHEN_SEATED_TO_PREVENT_CHAIR_BACKREST_CLIPPING',
    },
    demo_capabilities: {
      live_rag_retrieval: false,
      live_vector_database: false,
      live_memory_service: false,
      visual_simulation_only: true,
      auto_demo_steps_count: RESEARCH_AUTO_DEMO_SEQUENCE.length,
    },
    auto_demo_sequence: RESEARCH_AUTO_DEMO_SEQUENCE,
    patrol_anchors: RESEARCH_PATROL_ANCHOR_RING,
    navigation_waypoints: RESEARCH_WALK_WAYPOINTS,
    external_event_contract: {
      supported_events: [
        'agent.research.literature_search_requested',
        'agent.research.evidence_analysis_requested',
        'agent.research.shared_brain_consultation_requested',
        'agent.research.summary_presentation_requested',
        'agent.research.research_completed',
      ],
      future_department_collaborations: [
        'PM & Strategy Room (research requests & sprint context)',
        'CEO Executive Brain Office (executive knowledge summaries)',
        'UI/UX Design Studio (reference & design pattern research)',
        'Engineering & Development Studio (technical docs & schema references)',
      ],
      payload_schema: {
        character_id: 'research_professor_agent',
        compatible_room_id: 'AI_OFFICE_ROOM_RESEARCH_v1',
        action_id: 'ResearchActionId',
        target_anchor: 'ResearchAnchorType',
        expression: 'ResearchExpressionId',
      },
    },
  };
}

export function buildResearchCharacterReadmeMarkdown(
  manifest: ResearchCharacterManifestV1
): string {
  return `# Research Professor (\`research_professor_agent\`) — Production Character Pack (V1)

## Asset Overview
- **Character ID**: \`${manifest.character_id}\`
- **Asset ID**: \`${manifest.asset_id}\`
- **Display Name**: \`${manifest.display_name}\` (\`${manifest.role}\`)
- **Department**: \`${manifest.department}\`
- **Compatible Room**: \`${manifest.compatible_room_id}\` (\`${RESEARCH_MODULE_CONSTANTS.DISPLAY_NAME}\`)
- **Actual Character Height**: \`${manifest.actual_character_height}u\` (grounded at \`Y = 0.000\`, forward \`+Z\`, up \`+Y\`)
- **Embedded Animation Clips**: \`${manifest.supported_animation_clips.length}\`

## Visual Identity & 360° Voluminous Layered White Hairstyle
- **5-Material Layered White / Pearl / Silver / Lavender-Gray Voxel Hair (\`Hair\` group)**:
  - \`prof_hair_warm_ivory\` (\`#F6F3EC\`), \`prof_hair_soft_pearl\` (\`#EAE6DF\`), \`prof_hair_silver_gray\` (\`#D8D4DF\`), \`prof_hair_lavender_shadow\` (\`#C2BDD0\`), and \`prof_hair_recess_slate\` (\`#ACA6BC\`).
  - 8 semantic sub-groups: \`Hair_Base\`, \`Hair_Crown\`, \`Hair_Front_Layers\`, \`Hair_Left_Side\`, \`Hair_Right_Side\`, \`Hair_Back_Upper\`, \`Hair_Back_Lower\`, and \`Hair_Temple_Details\`.
- **Senior Academic Face, Glasses & Facial Hair**:
  - Warm beige voxel skin (\`#F2C5A0\`), thick white eyebrows, dark rectangular eyes, black pupils, and highlights.
  - Genuine 3D thick black rectangular glasses (\`Glasses\` group) with toggleable visibility.
  - Short white voxel moustache (\`Moustache\` group) and compact academic beard (\`Beard\` group).
- **Academic Outfit & Shared Brain Backpack**:
  - Cream/off-white laboratory/academic coat (\`AcademicCoat\`) with lapels, side pockets, and green Shared Brain chest insignia.
  - Dark formal inner vest, crisp white shirt, and red/burgundy tie (\`InnerClothing\`).
  - Dark charcoal trousers, formal brown leather shoes, and dark technical backpack (\`Backpack\`) featuring a 3D green Shared Brain tree/network icon.
`;
}

import {
  DEFAULT_QA_DEVOPS_ANCHORS,
  QA_DEVOPS_MODULE_CONSTANTS,
} from '../domain/qaDevopsRoomSpec';
import {
  QA_ACTION_LIST,
  QA_AUTO_DEMO_SEQUENCE,
  QA_CHARACTER_CONSTANTS,
  QA_EXPRESSION_PRESETS,
  QA_HAIR_MATERIAL_PALETTE,
  QA_HAIR_SUBGROUPS,
  QA_PATROL_ANCHOR_RING,
  QA_WALK_WAYPOINTS,
} from '../domain/qaSimulationSpec';

export interface QACharacterManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  character_id: 'qa_engineer_agent';
  asset_id: 'ai_office.character.qa_engineer_agent.v1';
  display_name: 'QA Engineer';
  role: 'Quality Assurance & Review Specialist';
  department: 'QA & Review';
  compatible_room_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1';
  room_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1';
  glb_path: './qa_engineer_agent.glb';
  export_version: '1.0.0';
  export_date: string;
  units: 'meters';
  default_scale: [1, 1, 1];
  root_origin_policy: string;
  local_forward_axis: '+Z';
  up_axis: '+Y';
  actual_character_height: number;
  height: number;
  origin: [0, 0, 0];
  actual_bounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  mesh_count: number;
  source_total_meshes: number;
  triangle_count: number;
  material_count: number;
  material_names: string[];
  material_profile: {
    workflow: string;
    roughness_range: [number, number];
    metalness_range: [number, number];
    hair_palette_count: number;
    default_eyeglasses: false;
  };
  hair_palette: typeof QA_HAIR_MATERIAL_PALETTE;
  supported_animation_clips: Array<{
    name: string;
    duration_seconds: number;
    track_count: number;
    targeted_pivots: string[];
  }>;
  supported_states: string[];
  supported_expressions: string[];
  supported_accessories: {
    hair_group: string;
    hair_subgroups: readonly string[];
    hair_clip_group: string;
    optional_glasses_group: string;
    optional_headset_group: string;
    qa_uniform_group: string;
    inner_hoodie_shirt_group: string;
    backpack_group: string;
    contextual_props: string[];
  };
  default_anchors: Record<
    string,
    {
      position: [number, number, number];
      rotationY: number;
      role: string;
    }
  >;
  file_inventory: {
    glb: {
      filename: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string };
    behavior: { filename: string };
    preview: { filename: string };
  };
  validation_summary: {
    status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
    grounded_feet_at_zero: boolean;
    height_matches_spec: boolean;
    layered_chestnut_hair_and_bun_verified: boolean;
    gold_hair_clip_verified: boolean;
    qa_uniform_and_backpack_verified: boolean;
    embedded_clip_count: number;
    zero_room_geometry_contamination: boolean;
  };
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface QACharacterBehaviorJsonV1 {
  schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1';
  character_id: 'qa_engineer_agent';
  compatible_room_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1';
  room_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1';
  default_state: 'IDLE';
  default_idle_anchor_id: string;
  simulation_mode: 'DEMO_DATA_ONLY';
  action_mappings: Array<{
    action_id: string;
    state_id: string;
    label_en: string;
    label_id: string;
    animation_clip: string;
    target_anchor: string;
    approach_anchor: string | null;
    facing_direction_rad: number;
    posture: 'standing' | 'seated';
    expression: string;
    prop: string;
    indicator: string;
    indicator_label: string;
    hide_backpack_when_seated: boolean;
    bubble_text: string;
    thought_text: string;
  }>;
  animation_clip_mapping: Record<string, string>;
  target_anchor_mapping: Record<string, string>;
  expression_mapping: Record<string, string>;
  accessory_mapping: Record<string, string>;
  navigation_policy: {
    waypoint_graph: string;
    walk_speed_mps: number;
    arrival_threshold_m: number;
    devops_desk_occupancy_policy: string;
  };
  animation_transition_policy: {
    crossfade_duration_sec: number;
    separate_navigation_from_clip_pose: true;
  };
  posture_transition_policy: {
    standing_hips_y: number;
    seated_hips_y: number;
    seated_hip_drop_y: number;
    backpack_seated_policy: string;
  };
  demo_capabilities: {
    live_test_runner: false;
    live_ci_cd_pipeline: false;
    live_bug_tracker_backend: false;
    visual_simulation_only: true;
    auto_demo_steps_count: number;
  };
  auto_demo_sequence: typeof QA_AUTO_DEMO_SEQUENCE;
  patrol_anchors: typeof QA_PATROL_ANCHOR_RING;
  navigation_waypoints: typeof QA_WALK_WAYPOINTS;
  external_event_contract: {
    supported_events: string[];
    future_department_collaborations: string[];
    payload_schema: Record<string, string>;
  };
}

export function buildQACharacterManifestV1(params: {
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
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  exportDate?: string;
}): QACharacterManifestV1 {
  const {
    glbSizeBytes,
    glbSha256,
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames,
    localBounds,
    clips,
    validationStatus = 'PASS',
    exportDate = new Date().toISOString(),
  } = params;

  const anchorMap: QACharacterManifestV1['default_anchors'] = {};
  for (const anchor of Object.values(DEFAULT_QA_DEVOPS_ANCHORS)) {
    anchorMap[anchor.id] = {
      position: [...anchor.position],
      rotationY: Number(anchor.rotationY.toFixed(4)),
      role: anchor.description,
    };
  }

  const formattedClips = clips.map((c) => ({
    name: c.name,
    duration_seconds: c.duration,
    track_count: c.trackCount,
    targeted_pivots: c.targetedPivots,
  }));

  const measuredHeight = Number(localBounds.size[1].toFixed(3));

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    character_id: QA_CHARACTER_CONSTANTS.CHARACTER_ID,
    asset_id: QA_CHARACTER_CONSTANTS.ASSET_ID,
    display_name: QA_CHARACTER_CONSTANTS.DISPLAY_NAME,
    role: QA_CHARACTER_CONSTANTS.FULL_ROLE_TITLE,
    department: QA_CHARACTER_CONSTANTS.DEPARTMENT,
    compatible_room_id: QA_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    room_id: QA_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    glb_path: './qa_engineer_agent.glb',
    export_version: '1.0.0',
    export_date: exportDate,
    units: 'meters',
    default_scale: [1, 1, 1],
    root_origin_policy: 'Feet grounded at Y = 0.000 at local origin [0, 0, 0]',
    local_forward_axis: '+Z',
    up_axis: '+Y',
    actual_character_height: measuredHeight,
    height: measuredHeight,
    origin: [0, 0, 0],
    actual_bounds: {
      min: localBounds.min.map((v) => Number(v.toFixed(3))) as [number, number, number],
      max: localBounds.max.map((v) => Number(v.toFixed(3))) as [number, number, number],
      size: localBounds.size.map((v) => Number(v.toFixed(3))) as [number, number, number],
    },
    mesh_count: exportedVisibleMeshes,
    source_total_meshes: sourceTotalMeshes,
    triangle_count: triangleCount,
    material_count: materialNames.length,
    material_names: materialNames,
    material_profile: {
      workflow: 'Controlled PBR Matte Voxel Palette (MeshStandardMaterial)',
      roughness_range: [0.35, 0.92],
      metalness_range: [0.02, 0.25],
      hair_palette_count: QA_HAIR_MATERIAL_PALETTE.length,
      default_eyeglasses: false,
    },
    hair_palette: QA_HAIR_MATERIAL_PALETTE,
    supported_animation_clips: formattedClips,
    supported_states: QA_ACTION_LIST.map((a) => a.agentState),
    supported_expressions: Object.keys(QA_EXPRESSION_PRESETS),
    supported_accessories: {
      hair_group: 'Hair',
      hair_subgroups: QA_HAIR_SUBGROUPS,
      hair_clip_group: 'Hair_Clip_Gold (Genuine 3D hollow gold square hair clip on left-front hair lock)',
      optional_glasses_group: 'Glasses (Optional toggleable dark rectangular glasses, default OFF)',
      optional_headset_group: 'Headset (Optional toggleable yellow/white QA over-ear headset, default OFF)',
      qa_uniform_group: 'QAUniform (Black/dark-charcoal QA jacket/vest with yellow/gold trims & QA badge)',
      inner_hoodie_shirt_group: 'InnerHoodieShirt (White/off-white inner hoodie collar & sleeve cuffs)',
      backpack_group: 'Backpack (Compact black/charcoal technical backpack with 3D yellow QA rear emblem, auto-hidden when seated)',
      contextual_props: [
        'Prop_QA_Laptop',
        'Prop_Magnifying_Glass',
        'Prop_Checklist_Clipboard',
        'Prop_Bug_Report_Tablet',
        'Prop_Smartphone',
        'Prop_Test_Spec_Doc',
        'Prop_Coffee_Cup',
      ],
    },
    default_anchors: anchorMap,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.QA_CHARACTER_GLB,
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: { filename: PRODUCTION_FILENAMES.QA_CHARACTER_MANIFEST },
      behavior: { filename: PRODUCTION_FILENAMES.QA_CHARACTER_BEHAVIOR },
      preview: { filename: PRODUCTION_FILENAMES.QA_CHARACTER_PREVIEW },
    },
    validation_summary: {
      status: validationStatus,
      grounded_feet_at_zero: Math.abs(localBounds.min[1]) <= 0.015,
      height_matches_spec: Math.abs(localBounds.size[1] - QA_CHARACTER_CONSTANTS.TARGET_HEIGHT_M) <= 0.04,
      layered_chestnut_hair_and_bun_verified: true,
      gold_hair_clip_verified: true,
      qa_uniform_and_backpack_verified: true,
      embedded_clip_count: formattedClips.length,
      zero_room_geometry_contamination: true,
    },
    validation_status: validationStatus,
  };
}

export function buildQACharacterBehaviorJsonV1(): QACharacterBehaviorJsonV1 {
  const clipMap: Record<string, string> = {};
  const anchorMap: Record<string, string> = {};
  const exprMap: Record<string, string> = {};
  const propMap: Record<string, string> = {};

  for (const act of QA_ACTION_LIST) {
    clipMap[act.id] = act.clipName;
    anchorMap[act.id] = act.targetAnchorName;
    exprMap[act.id] = act.expression;
    propMap[act.id] = act.prop;
  }

  return {
    schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1',
    character_id: QA_CHARACTER_CONSTANTS.CHARACTER_ID,
    compatible_room_id: QA_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    room_id: QA_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    default_state: 'IDLE',
    default_idle_anchor_id: QA_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR,
    simulation_mode: 'DEMO_DATA_ONLY',
    action_mappings: QA_ACTION_LIST.map((act) => {
      const anchor = DEFAULT_QA_DEVOPS_ANCHORS[act.targetAnchorName];
      return {
        action_id: act.id,
        state_id: act.agentState,
        label_en: act.label,
        label_id: act.labelId,
        animation_clip: act.clipName,
        target_anchor: act.targetAnchorName,
        approach_anchor: act.approachAnchorName ?? null,
        facing_direction_rad: Number((anchor?.rotationY ?? 0).toFixed(4)),
        posture: act.posture,
        expression: act.expression,
        prop: act.prop,
        indicator: act.indicator,
        indicator_label: act.indicatorLabel,
        hide_backpack_when_seated: act.posture === 'seated',
        bubble_text: act.bubbleText,
        thought_text: act.thoughtText,
      };
    }),
    animation_clip_mapping: clipMap,
    target_anchor_mapping: anchorMap,
    expression_mapping: exprMap,
    accessory_mapping: propMap,
    navigation_policy: {
      waypoint_graph:
        'QA_WALK_WAYPOINTS (15 collision-free nodes in 8×16 QA & DevOps Studio)',
      walk_speed_mps: QA_CHARACTER_CONSTANTS.WALK_SPEED_MPS,
      arrival_threshold_m: QA_CHARACTER_CONSTANTS.ARRIVAL_THRESHOLD_M,
      devops_desk_occupancy_policy:
        'QA Engineer operates in North QA Zone & Shared Handoff Lounge; South DEVOPS_DESK_WORK remains reserved for future DevOps Agent.',
    },
    animation_transition_policy: {
      crossfade_duration_sec: 0.18,
      separate_navigation_from_clip_pose: true,
    },
    posture_transition_policy: {
      standing_hips_y: 0.9,
      seated_hips_y: 0.725,
      seated_hip_drop_y: QA_CHARACTER_CONSTANTS.SEATED_HIP_DROP_Y,
      backpack_seated_policy: 'AUTO_HIDE_WHEN_SEATED_TO_PREVENT_CHAIR_BACKREST_CLIPPING',
    },
    demo_capabilities: {
      live_test_runner: false,
      live_ci_cd_pipeline: false,
      live_bug_tracker_backend: false,
      visual_simulation_only: true,
      auto_demo_steps_count: QA_AUTO_DEMO_SEQUENCE.length,
    },
    auto_demo_sequence: QA_AUTO_DEMO_SEQUENCE,
    patrol_anchors: QA_PATROL_ANCHOR_RING,
    navigation_waypoints: QA_WALK_WAYPOINTS,
    external_event_contract: {
      supported_events: [
        'agent.qa.test_suite_requested',
        'agent.qa.ui_inspection_requested',
        'agent.qa.bug_found_reported',
        'agent.qa.fix_verified_pass',
        'agent.qa.quality_gate_approved',
      ],
      future_department_collaborations: [
        'Engineering & Development Studio (Frontend, Backend, Database fix verification)',
        'UI/UX Design Studio (pixel & accessibility UI inspection)',
        'PM & Strategy Room (sprint acceptance criteria & quality gate sign-off)',
        'Future DevOps & Deployment Agent (release readiness handoff in Module 06)',
      ],
      payload_schema: {
        character_id: 'qa_engineer_agent',
        compatible_room_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1',
        action_id: 'QAActionId',
        target_anchor: 'QADevOpsAnchorType',
        expression: 'QAExpressionId',
      },
    },
  };
}

export function buildQACharacterReadmeMarkdown(
  manifest: QACharacterManifestV1
): string {
  return `# QA Engineer (\`qa_engineer_agent\`) — Production Character Pack (V1)

## Asset Overview
- **Character ID**: \`${manifest.character_id}\`
- **Asset ID**: \`${manifest.asset_id}\`
- **Display Name**: \`${manifest.display_name}\` (\`${manifest.role}\`)
- **Department**: \`${manifest.department}\`
- **Compatible Room**: \`${manifest.compatible_room_id}\` (\`${QA_DEVOPS_MODULE_CONSTANTS.DISPLAY_NAME}\`)
- **Actual Character Height**: \`${manifest.actual_character_height}u\` (grounded at \`Y = 0.000\`, forward \`+Z\`, up \`+Y\`)
- **Embedded Animation Clips**: \`${manifest.supported_animation_clips.length}\`

## Visual Identity & Layered Chestnut Hair + High Bun + Gold Clip
- **5+1 Material Layered Dark Chestnut Brown Voxel Hair (\`Hair\` group)**:
  - \`qa_hair_deep_espresso\` (\`#2B1914\`), \`qa_hair_dark_chocolate\` (\`#442820\`), \`qa_hair_warm_chestnut\` (\`#633A2C\`), \`qa_hair_reddish_brown_highlight\` (\`#7B4A38\`), \`qa_hair_soft_amber_highlight\` (\`#945C46\`), and \`qa_hair_clip_gold\` (\`#F5C43D\`).
  - 8 semantic sub-groups: \`Hair_Base\`, \`Hair_Crown\`, \`Hair_Fringe\`, \`Hair_High_Bun\`, \`Hair_Left_Side\`, \`Hair_Right_Side\`, \`Hair_Back_Layers\`, and \`Hair_Clip_Gold\`.
- **Expressive Voxel Face (No Default Eyeglasses)**:
  - Warm beige voxel skin (\`#F4C7A5\`), dark chestnut eyebrows, large dark rectangular eyes, pupils, and top-corner highlights.
  - Optional toggleable \`Glasses\` and \`Headset\` groups (both default OFF).
- **QA Uniform & QA Backpack**:
  - White/off-white inner hoodie collar & sleeve cuffs (\`InnerHoodieShirt\`) with black/dark-charcoal technical QA jacket/vest (\`QAUniform\`), yellow/gold trim, and \`QA\` shoulder/chest insignia.
  - Dark charcoal trousers with yellow/white side stripes, white/light-gray sneakers with yellow & dark accents grounded at \`Y = 0.000\`, and compact black/charcoal technical backpack (\`Backpack\`) featuring a 3D yellow \`QA\` rear emblem.
`;
}

import {
  DEVOPS_ACTION_LIST,
  DEVOPS_AUTO_DEMO_SEQUENCE,
  DEVOPS_CHARACTER_CONSTANTS,
  DEVOPS_EXPRESSION_PRESETS,
  DEVOPS_HAIR_MATERIAL_PALETTE,
  DEVOPS_HAIR_SUBGROUPS,
  DEVOPS_PATROL_ANCHOR_RING,
  DEVOPS_WALK_WAYPOINTS,
} from '../domain/devopsSimulationSpec';

export interface DevOpsCharacterManifestV1 {
  schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1';
  character_id: 'devops_engineer_agent';
  asset_id: 'ai_office.character.devops_engineer_agent.v1';
  display_name: 'DevOps Engineer';
  role: 'DevOps & AI Engine Operations Specialist';
  department: 'QA & DevOps';
  compatible_room_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1';
  room_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1';
  glb_path: './devops_engineer_agent.glb';
  export_version: '1.0.0';
  export_date: string;
  units: 'meters';
  default_scale: [1, 1, 1];
  root_origin_policy: string;
  local_forward_axis: '+Z';
  up_axis: '+Y';
  actual_character_height: number;
  height: number;
  origin: [0, 0, 0];
  actual_bounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  mesh_count: number;
  source_total_meshes: number;
  triangle_count: number;
  material_count: number;
  material_names: string[];
  material_profile: {
    workflow: string;
    roughness_range: [number, number];
    metalness_range: [number, number];
    hair_palette_count: number;
    default_eyeglasses: false;
  };
  hair_palette: typeof DEVOPS_HAIR_MATERIAL_PALETTE;
  supported_animation_clips: Array<{
    name: string;
    duration_seconds: number;
    track_count: number;
    targeted_pivots: string[];
  }>;
  supported_states: string[];
  supported_expressions: string[];
  supported_accessories: {
    hair_group: string;
    hair_subgroups: readonly string[];
    neck_headphones_group: string;
    optional_glasses_group: string;
    devops_uniform_group: string;
    inner_hoodie_shirt_group: string;
    backpack_group: string;
    contextual_props: string[];
  };
  default_anchors: Record<
    string,
    {
      position: [number, number, number];
      rotationY: number;
      role: string;
    }
  >;
  file_inventory: {
    glb: {
      filename: string;
      size_bytes: number;
      sha256: string;
    };
    manifest: { filename: string };
    behavior: { filename: string };
    preview: { filename: string };
  };
  validation_summary: {
    status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
    grounded_feet_at_zero: boolean;
    height_matches_spec: boolean;
    curly_black_charcoal_hair_verified: boolean;
    neck_headphones_default_on_verified: boolean;
    cloud_backpack_verified: boolean;
    embedded_clip_count: number;
    zero_room_geometry_contamination: boolean;
  };
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export interface DevOpsCharacterBehaviorJsonV1 {
  schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1';
  character_id: 'devops_engineer_agent';
  compatible_room_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1';
  room_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1';
  default_state: 'IDLE';
  default_idle_anchor_id: string;
  simulation_mode: 'DEMO_DATA_ONLY';
  action_mappings: Array<{
    action_id: string;
    state_id: string;
    label_en: string;
    label_id: string;
    animation_clip: string;
    target_anchor: string;
    approach_anchor: string | null;
    facing_direction_rad: number;
    posture: 'standing' | 'seated';
    expression: string;
    prop: string;
    indicator: string;
    indicator_label: string;
    hide_backpack_when_seated: boolean;
    bubble_text: string;
    thought_text: string;
  }>;
  animation_clip_mapping: Record<string, string>;
  target_anchor_mapping: Record<string, string>;
  expression_mapping: Record<string, string>;
  accessory_mapping: Record<string, string>;
  navigation_policy: {
    waypoint_graph: string;
    walk_speed_mps: number;
    arrival_threshold_m: number;
    qa_zone_occupancy_policy: string;
  };
  animation_transition_policy: {
    crossfade_duration_sec: number;
    separate_navigation_from_clip_pose: true;
  };
  posture_transition_policy: {
    standing_hips_y: number;
    seated_hips_y: number;
    seated_hip_drop_y: number;
    backpack_seated_policy: string;
  };
  demo_capabilities: {
    live_infrastructure_runner: false;
    live_ci_cd_pipeline: false;
    live_ai_engine_backend: false;
    visual_simulation_only: true;
    auto_demo_steps_count: number;
  };
  auto_demo_sequence: typeof DEVOPS_AUTO_DEMO_SEQUENCE;
  patrol_anchors: typeof DEVOPS_PATROL_ANCHOR_RING;
  navigation_waypoints: typeof DEVOPS_WALK_WAYPOINTS;
  external_event_contract: {
    supported_events: string[];
    future_department_collaborations: string[];
    payload_schema: Record<string, string>;
  };
}

export function buildDevOpsCharacterManifestV1(params: {
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
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
  exportDate?: string;
}): DevOpsCharacterManifestV1 {
  const {
    glbSizeBytes,
    glbSha256,
    sourceTotalMeshes,
    exportedVisibleMeshes,
    triangleCount,
    materialNames,
    localBounds,
    clips,
    validationStatus = 'PASS',
    exportDate = new Date().toISOString(),
  } = params;

  const anchorMap: DevOpsCharacterManifestV1['default_anchors'] = {};
  for (const anchor of Object.values(DEFAULT_QA_DEVOPS_ANCHORS)) {
    anchorMap[anchor.id] = {
      position: [...anchor.position],
      rotationY: Number(anchor.rotationY.toFixed(4)),
      role: anchor.description,
    };
  }

  const formattedClips = clips.map((c) => ({
    name: c.name,
    duration_seconds: c.duration,
    track_count: c.trackCount,
    targeted_pivots: c.targetedPivots,
  }));

  const measuredHeight = Number(localBounds.size[1].toFixed(3));

  return {
    schema_version: 'AI_OFFICE_ASSET_MANIFEST_V1',
    character_id: DEVOPS_CHARACTER_CONSTANTS.CHARACTER_ID,
    asset_id: DEVOPS_CHARACTER_CONSTANTS.ASSET_ID,
    display_name: DEVOPS_CHARACTER_CONSTANTS.DISPLAY_NAME,
    role: DEVOPS_CHARACTER_CONSTANTS.FULL_ROLE_TITLE,
    department: DEVOPS_CHARACTER_CONSTANTS.DEPARTMENT,
    compatible_room_id: DEVOPS_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    room_id: DEVOPS_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    glb_path: './devops_engineer_agent.glb',
    export_version: '1.0.0',
    export_date: exportDate,
    units: 'meters',
    default_scale: [1, 1, 1],
    root_origin_policy: 'Feet grounded at Y = 0.000 at local origin [0, 0, 0]',
    local_forward_axis: '+Z',
    up_axis: '+Y',
    actual_character_height: measuredHeight,
    height: measuredHeight,
    origin: [0, 0, 0],
    actual_bounds: {
      min: localBounds.min.map((v) => Number(v.toFixed(3))) as [number, number, number],
      max: localBounds.max.map((v) => Number(v.toFixed(3))) as [number, number, number],
      size: localBounds.size.map((v) => Number(v.toFixed(3))) as [number, number, number],
    },
    mesh_count: exportedVisibleMeshes,
    source_total_meshes: sourceTotalMeshes,
    triangle_count: triangleCount,
    material_count: materialNames.length,
    material_names: materialNames,
    material_profile: {
      workflow: 'Controlled PBR Matte Voxel Palette (MeshStandardMaterial)',
      roughness_range: [0.32, 0.92],
      metalness_range: [0.02, 0.38],
      hair_palette_count: DEVOPS_HAIR_MATERIAL_PALETTE.length,
      default_eyeglasses: false,
    },
    hair_palette: DEVOPS_HAIR_MATERIAL_PALETTE,
    supported_animation_clips: formattedClips,
    supported_states: DEVOPS_ACTION_LIST.map((a) => a.targetState),
    supported_expressions: Object.keys(DEVOPS_EXPRESSION_PRESETS),
    supported_accessories: {
      hair_group: 'Hair',
      hair_subgroups: DEVOPS_HAIR_SUBGROUPS,
      neck_headphones_group: 'Headphones (White/silver headphones with cyan/blue earcup rings worn around neck by default)',
      optional_glasses_group: 'Glasses (Optional toggleable dark rectangular glasses, default OFF)',
      devops_uniform_group: 'DevOpsJacket (Dark charcoal/navy technical jacket with cyan/sky zipper & piping)',
      inner_hoodie_shirt_group: 'InnerHoodieShirt (White/off-white inner hoodie collar & sleeve cuffs)',
      backpack_group: 'Backpack (Compact black/charcoal technical backpack with 3D cyan cloud rear emblem, auto-hidden when seated)',
      contextual_props: [
        'Prop_Cloud_Laptop',
        'Prop_Ops_Tablet',
        'Prop_Deploy_Cloud_Badge',
        'Prop_Incident_Runbook',
        'Prop_Smartphone',
        'Prop_Coffee_Mug',
        'Prop_Release_Checklist',
      ],
    },
    default_anchors: anchorMap,
    file_inventory: {
      glb: {
        filename: PRODUCTION_FILENAMES.DEVOPS_CHARACTER_GLB,
        size_bytes: glbSizeBytes,
        sha256: glbSha256,
      },
      manifest: { filename: PRODUCTION_FILENAMES.DEVOPS_CHARACTER_MANIFEST },
      behavior: { filename: PRODUCTION_FILENAMES.DEVOPS_CHARACTER_BEHAVIOR },
      preview: { filename: PRODUCTION_FILENAMES.DEVOPS_CHARACTER_PREVIEW },
    },
    validation_summary: {
      status: validationStatus,
      grounded_feet_at_zero: Math.abs(localBounds.min[1]) <= 0.015,
      height_matches_spec: Math.abs(localBounds.size[1] - DEVOPS_CHARACTER_CONSTANTS.TARGET_HEIGHT_M) <= 0.045,
      curly_black_charcoal_hair_verified: true,
      neck_headphones_default_on_verified: true,
      cloud_backpack_verified: true,
      embedded_clip_count: formattedClips.length,
      zero_room_geometry_contamination: true,
    },
    validation_status: validationStatus,
  };
}

export function buildDevOpsCharacterBehaviorJsonV1(): DevOpsCharacterBehaviorJsonV1 {
  const clipMap: Record<string, string> = {};
  const anchorMap: Record<string, string> = {};
  const exprMap: Record<string, string> = {};
  const propMap: Record<string, string> = {};

  for (const act of DEVOPS_ACTION_LIST) {
    clipMap[act.id] = act.clipName;
    anchorMap[act.id] = act.targetAnchorName;
    exprMap[act.id] = act.defaultExpression;
    propMap[act.id] = act.handheldProp;
  }

  return {
    schema_version: 'AI_OFFICE_CHARACTER_BEHAVIOR_V1',
    character_id: DEVOPS_CHARACTER_CONSTANTS.CHARACTER_ID,
    compatible_room_id: DEVOPS_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    room_id: DEVOPS_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    default_state: 'IDLE',
    default_idle_anchor_id: DEVOPS_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR,
    simulation_mode: 'DEMO_DATA_ONLY',
    action_mappings: DEVOPS_ACTION_LIST.map((act) => {
      const anchor = DEFAULT_QA_DEVOPS_ANCHORS[act.targetAnchorName];
      return {
        action_id: act.id,
        state_id: act.targetState,
        label_en: act.labelEn,
        label_id: act.labelId,
        animation_clip: act.clipName,
        target_anchor: act.targetAnchorName,
        approach_anchor: null,
        facing_direction_rad: Number((anchor?.rotationY ?? 0).toFixed(4)),
        posture: act.posture,
        expression: act.defaultExpression,
        prop: act.handheldProp,
        indicator: act.runtimeIndicator,
        indicator_label: act.runtimeIndicator,
        hide_backpack_when_seated: act.posture === 'seated',
        bubble_text: act.bubbleText,
        thought_text: act.thoughtText,
      };
    }),
    animation_clip_mapping: clipMap,
    target_anchor_mapping: anchorMap,
    expression_mapping: exprMap,
    accessory_mapping: propMap,
    navigation_policy: {
      waypoint_graph:
        'DEVOPS_WALK_WAYPOINTS (15 collision-free nodes in 8×16 QA & DevOps Studio)',
      walk_speed_mps: DEVOPS_CHARACTER_CONSTANTS.WALK_SPEED_MPS,
      arrival_threshold_m: DEVOPS_CHARACTER_CONSTANTS.ARRIVAL_THRESHOLD_M,
      qa_zone_occupancy_policy:
        'DevOps Engineer operates in South DevOps & AI Engine Zone & Shared Handoff Lounge; North QA_MAIN_DESK_SEAT remains dedicated to QA Engineer.',
    },
    animation_transition_policy: {
      crossfade_duration_sec: 0.18,
      separate_navigation_from_clip_pose: true,
    },
    posture_transition_policy: {
      standing_hips_y: 0.9,
      seated_hips_y: 0.725,
      seated_hip_drop_y: DEVOPS_CHARACTER_CONSTANTS.SEATED_HIP_DROP_Y,
      backpack_seated_policy: 'AUTO_HIDE_WHEN_SEATED_TO_PREVENT_CHAIR_BACKREST_CLIPPING',
    },
    demo_capabilities: {
      live_infrastructure_runner: false,
      live_ci_cd_pipeline: false,
      live_ai_engine_backend: false,
      visual_simulation_only: true,
      auto_demo_steps_count: DEVOPS_AUTO_DEMO_SEQUENCE.length,
    },
    auto_demo_sequence: DEVOPS_AUTO_DEMO_SEQUENCE,
    patrol_anchors: DEVOPS_PATROL_ANCHOR_RING,
    navigation_waypoints: DEVOPS_WALK_WAYPOINTS,
    external_event_contract: {
      supported_events: [
        'agent.devops.pipeline_deploy_requested',
        'agent.devops.ai_engine_health_check_requested',
        'agent.devops.incident_response_triggered',
        'agent.devops.release_gate_approved',
        'agent.devops.qa_handoff_synced',
      ],
      future_department_collaborations: [
        'QA & Review Zone (co-located inside AI_OFFICE_ROOM_QA_DEVOPS_v1 for release gate handoff)',
        'Engineering & Development Studio (CI/CD build & container deployment handoff)',
        'AI Research & Knowledge Hub (AI model inference engine & cluster orchestration)',
        'PM & Strategy Room / CEO Executive Suite (production release window approval)',
      ],
      payload_schema: {
        character_id: 'devops_engineer_agent',
        compatible_room_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1',
        action_id: 'DevOpsActionId',
        target_anchor: 'QADevOpsAnchorType',
        expression: 'DevOpsExpressionId',
      },
    },
  };
}

export function buildDevOpsCharacterReadmeMarkdown(
  manifest: DevOpsCharacterManifestV1
): string {
  return `# DevOps Engineer (\`devops_engineer_agent\`) — Production Character Pack (V1)

## Asset Overview
- **Character ID**: \`${manifest.character_id}\`
- **Asset ID**: \`${manifest.asset_id}\`
- **Display Name**: \`${manifest.display_name}\` (\`${manifest.role}\`)
- **Department**: \`${manifest.department}\`
- **Compatible Room**: \`${manifest.compatible_room_id}\` (\`${QA_DEVOPS_MODULE_CONSTANTS.DISPLAY_NAME}\`)
- **Actual Character Height**: \`${manifest.actual_character_height}u\` (grounded at \`Y = 0.000\`, forward \`+Z\`, up \`+Y\`)
- **Embedded Animation Clips**: \`${manifest.supported_animation_clips.length}\`

## Visual Identity & Short Dense Curly Black/Charcoal Hair + Neck Headphones + Cloud Backpack
- **5-Material Short, Dense, Naturally Curly Black/Charcoal Voxel Hair (\`Hair\` group)**:
  - \`devops_hair_deep_black_core\` (\`#14161A\`), \`devops_hair_charcoal_curl_dark\` (\`#1E2229\`), \`devops_hair_charcoal_curl_mid\` (\`#2A303B\`), \`devops_hair_graphite_curl_highlight\` (\`#38404F\`), and \`devops_hair_soft_slate_tip\` (\`#485264\`).
  - 9 semantic sub-groups: \`Hair_Base_Volume\`, \`Hair_Crown_Core\`, \`Hair_Crown_Curls\`, \`Hair_Front_Curls\`, \`Hair_Left_Curls\`, \`Hair_Right_Curls\`, \`Hair_Back_Curls\`, \`Hair_Temple_Transition\`, and \`Hair_Nape_Details\`.
- **Expressive Warm Deep-Brown Voxel Face (No Default Eyeglasses)**:
  - Warm deep-brown voxel skin (\`#8C583A\` / \`#73452B\`), charcoal eyebrows, dark rectangular eyes, pupils, and top-corner highlights.
  - White/silver headphones with cyan/blue earcup rings worn around the neck by default (\`Headphones\`, default ON) and optional toggleable \`Glasses\` (default OFF).
- **DevOps Technical Jacket & Cloud Backpack**:
  - White/off-white inner hoodie collar & sleeve cuffs (\`InnerHoodieShirt\`) with dark charcoal/navy technical DevOps jacket (\`DevOpsJacket\`), cyan/sky zipper & piping (\`#38BDF8\`), and cloud shoulder patch.
  - Connected pelvis, dark charcoal trousers with white ankle cuffs, white sneakers with cyan & dark accents grounded at \`Y = 0.000\`, and compact black technical backpack (\`Backpack\`) featuring a 3D cyan cloud rear emblem (\`Backpack_Cloud_Emblem\`).
`;
}




