import { CameraPreset } from './modularRoomSpec';

export type OfficeViewMode = 'single_room' | 'full_office';

export type RoomModuleKey =
  | 'pm_strategy'
  | 'ceo_executive'
  | 'research_brain'
  | 'uiux_studio'
  | 'engineering'
  | 'qa_devops_studio'
  | 'qa_review'
  | 'devops_ai_engine';

export type RoomAssetStatus = 'READY' | 'PLANNED';

export interface RoomConnectorPlacement {
  id: string;
  side: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
  local_position: [number, number, number];
  global_position: [number, number, number];
  width: number;
  height: number;
  connects_to: string;
}

export interface OfficeRoomRegistryEntry {
  key: RoomModuleKey;
  module_id: string;
  display_name: string;
  dropdown_label: string;
  badge: 'READY' | 'NEW' | 'PLANNED';
  asset_status: RoomAssetStatus;
  room_type:
    | 'ENCLOSED_DEPARTMENT_ROOM'
    | 'ENGINEERING_MULTI_AGENT'
    | 'QA_DEVOPS_MULTI_AGENT';
  size: [number, number, number];
  local_origin: [number, number, number];
  global_offset: [number, number, number];
  global_bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  row_zone: 'TOP_NORTH_ROW' | 'WEST_WING' | 'EAST_WING';
  asset_path: string | null;
  manifest_path: string | null;
  anchor_path: string | null;
  behavior_path: string | null;
  preview_path: string | null;
  has_character_simulation: boolean;
  character_notice: string;
  description: string;
  connector_definitions: RoomConnectorPlacement[];
  single_room_camera: {
    position: [number, number, number];
    target: [number, number, number];
    zoom: number;
  };
  full_office_focus_camera: {
    position: [number, number, number];
    target: [number, number, number];
    zoom: number;
  };
}

export interface CommonAreaSpec {
  id: string;
  display_name: string;
  zone_type:
    | 'SHARED_CORRIDOR'
    | 'OPEN_COLLABORATION_HUB'
    | 'OUTDOOR_TERRACE'
    | 'MAIN_ENTRANCE';
  enclosed_room: false;
  origin: [number, number, number];
  size: [number, number, number];
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  description: string;
}

export interface OfficeLayoutA3ExportJson {
  schema_version:
    | 'AI_OFFICE_MASTER_LAYOUT_A3_V2'
    | 'AI_OFFICE_MASTER_LAYOUT_A3_1_V1'
    | 'AI_OFFICE_MASTER_LAYOUT_A3_2_V1';
  layout_id:
    | 'AI_OFFICE_LAYOUT_A3_v2'
    | 'AI_OFFICE_LAYOUT_A3_1_v1'
    | 'AI_OFFICE_LAYOUT_A3_2_v1';
  display_name: string;
  generated_at: string;
  coordinate_convention: {
    up_axis: 'Y';
    handedness: 'right-handed';
    x_axis: 'West (0) -> East (+32)';
    z_axis: 'South (0) -> North (+26)';
    floor_elevation_y: 0;
    unit_scale: '1 Three.js world unit = 1 modular grid tile (1.0m nominal)';
  };
  total_office_bounds: {
    width_x: 32;
    depth_z: 26;
    wall_height_y: 3.2;
    min: [0, -0.16, 0];
    max: [32, 3.2, 26];
  };
  hierarchy_contract: {
    root_node: 'OFFICE_A3_ROOT';
    child_groups: [
      'ROOM_MODULES',
      'SHARED_CORRIDOR_ROOT',
      'CENTRAL_HUB_ROOT',
      'TERRACE_ROOT',
      'ENTRANCE_ROOT',
      'OFFICE_HELPERS',
    ];
  };
  enclosed_rooms: OfficeRoomRegistryEntry[];
  common_areas: CommonAreaSpec[];
  corridor_connections: Array<{
    from_module_id: string;
    to_zone_id: string;
    global_doorway_center: [number, number, number];
    passage_width: number;
    unobstructed: boolean;
  }>;
  legacy_migration_aliases?: Record<string, string>;
}

export const OFFICE_A3_CONSTANTS = {
  LAYOUT_ID: 'AI_OFFICE_LAYOUT_A3_2_v1',
  LEGACY_A3_1_LAYOUT_ID: 'AI_OFFICE_LAYOUT_A3_1_v1',
  LEGACY_LAYOUT_ID: 'AI_OFFICE_LAYOUT_A3_v2',
  ROOT_NODE_NAME: 'OFFICE_A3_ROOT',
  TOTAL_WIDTH_X: 32,
  TOTAL_DEPTH_Z: 26,
  WALL_HEIGHT_Y: 3.2,
  FLOOR_THICKNESS: 0.16,
  EXPORT_FILENAME: 'office-layout-a3.json',
  EXPORT_A3_1_FILENAME: 'office-layout-a3.1.json',
  EXPORT_A3_2_FILENAME: 'office-layout-a3.2.json',
} as const;

const QA_DEVOPS_STUDIO_ENTRY: OfficeRoomRegistryEntry = {
  key: 'qa_devops_studio',
  module_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1',
  display_name: 'QA & DevOps Integrated Studio',
  dropdown_label: 'QA & DevOps Integrated Studio (8×16) — NEW (IN DEVELOPMENT)',
  badge: 'NEW',
  asset_status: 'READY',
  room_type: 'QA_DEVOPS_MULTI_AGENT',
  size: [8, 3.2, 16],
  local_origin: [0, 0, 0],
  global_offset: [24, 0, 0],
  global_bounds: { minX: 24, maxX: 32, minZ: 0, maxZ: 16 },
  row_zone: 'EAST_WING',
  asset_path: 'production/rooms/qa_devops_studio/qa_devops_room.glb',
  manifest_path: 'production/rooms/qa_devops_studio/qa_devops_room.manifest.json',
  anchor_path: 'production/rooms/qa_devops_studio/qa_devops_room.anchors.json',
  behavior_path: 'production/rooms/qa_devops_studio/qa_devops_room.behavior.json',
  preview_path: 'production/rooms/qa_devops_studio/qa_devops_room.preview.png',
  has_character_simulation: true,
  character_notice:
    'ACTIVE DUAL-AGENT SIMULATION — Combined 8×16 QA & DevOps Integrated Studio at [24, 0, 0] with active QA Engineer (qa_engineer_agent, North QA Zone) and DevOps Engineer (devops_engineer_agent, South DevOps & AI Engine Zone) coexisting with 23 room-local anchors and 8 DEMO display slots.',
  description:
    'Continuous 8×16 Double-Module QA & DevOps Integrated Studio (Elegant Cozy Edition) occupying the East Wing [24, 0, 0] (X=24..32, Z=0..16) in Master Layout A3.2 with zero internal dividing wall at Z=8. Combines the North QA Testing & 3D Device Verification Zone, the Central Cozy Collaboration Lounge (patterned rug, cream 3-seat sofa, matching armchair, coffee table, 3 soft poufs, and Shared Review Board), and the South DevOps & AI Engine Operations Zone (workstation, dual infrastructure racks, and Operations Status Wall Board).',
  connector_definitions: [
    {
      id: 'QA_DEVOPS_WEST_MAIN',
      side: 'WEST',
      local_position: [0, 0, 8],
      global_position: [24, 0, 8],
      width: 2.0,
      height: 2.3,
      connects_to: 'CENTRAL_HUB_ROOT',
    },
    {
      id: 'QA_DEVOPS_NORTH_CORRIDOR',
      side: 'NORTH',
      local_position: [4, 0, 16],
      global_position: [28, 0, 16],
      width: 2.0,
      height: 2.3,
      connects_to: 'SHARED_CORRIDOR_ROOT',
    },
  ],
  single_room_camera: {
    position: [-8.2, 12.2, -5.0],
    target: [4.0, 1.1, 8.0],
    zoom: 46,
  },
  full_office_focus_camera: {
    position: [52.0, 25.0, -10.0],
    target: [28.0, 1.1, 8.0],
    zoom: 48,
  },
};

/**
 * Historical A3.1 separate 8×8 placeholder definitions preserved for
 * `buildOfficeLayoutA3_1ExportJson()` checkpoint compatibility.
 */
export const LEGACY_A3_1_QA_DEVOPS_ENTRIES: Record<
  'qa_review' | 'devops_ai_engine',
  OfficeRoomRegistryEntry
> = {
  qa_review: {
    key: 'qa_review',
    module_id: 'AI_OFFICE_ROOM_QA_v1',
    display_name: 'QA & Review (Legacy A3.1 Slot — Merged into QA & DevOps Studio A3.2)',
    dropdown_label: 'QA & Review — MERGED INTO A3.2 STUDIO',
    badge: 'PLANNED',
    asset_status: 'PLANNED',
    room_type: 'ENCLOSED_DEPARTMENT_ROOM',
    size: [8, 3.2, 8],
    local_origin: [0, 0, 0],
    global_offset: [24, 0, 8],
    global_bounds: { minX: 24, maxX: 32, minZ: 8, maxZ: 16 },
    row_zone: 'EAST_WING',
    asset_path: null,
    manifest_path: null,
    anchor_path: null,
    behavior_path: null,
    preview_path: null,
    has_character_simulation: true,
    character_notice:
      'Legacy A3.1 slot [24, 0, 8] — superseded in Master Layout A3.2 by AI_OFFICE_ROOM_QA_DEVOPS_v1 [24, 0, 0] (8×16) with active qa_engineer_agent.',
    description:
      'Historical A3.1 East Wing North slot [24, 0, 8] now unified into the 8×16 QA & DevOps Integrated Studio in A3.2.',
    connector_definitions: [
      {
        id: 'QA_WEST_TO_HUB',
        side: 'WEST',
        local_position: [0, 0, 4],
        global_position: [24, 0, 12],
        width: 2.0,
        height: 2.3,
        connects_to: 'CENTRAL_HUB_ROOT',
      },
      {
        id: 'QA_NORTH_TO_CORRIDOR',
        side: 'NORTH',
        local_position: [4, 0, 8],
        global_position: [28, 0, 16],
        width: 2.0,
        height: 2.3,
        connects_to: 'SHARED_CORRIDOR_ROOT',
      },
    ],
    single_room_camera: QA_DEVOPS_STUDIO_ENTRY.single_room_camera,
    full_office_focus_camera: QA_DEVOPS_STUDIO_ENTRY.full_office_focus_camera,
  },
  devops_ai_engine: {
    key: 'devops_ai_engine',
    module_id: 'AI_OFFICE_ROOM_DEVOPS_v1',
    display_name: 'DevOps & AI Engine Hub (Legacy A3.1 Slot — Merged into QA & DevOps Studio A3.2)',
    dropdown_label: 'DevOps & AI Engine Hub — MERGED INTO A3.2 STUDIO',
    badge: 'PLANNED',
    asset_status: 'PLANNED',
    room_type: 'ENCLOSED_DEPARTMENT_ROOM',
    size: [8, 3.2, 8],
    local_origin: [0, 0, 0],
    global_offset: [24, 0, 0],
    global_bounds: { minX: 24, maxX: 32, minZ: 0, maxZ: 8 },
    row_zone: 'EAST_WING',
    asset_path: null,
    manifest_path: null,
    anchor_path: null,
    behavior_path: null,
    preview_path: null,
    has_character_simulation: true,
    character_notice:
      'Legacy A3.1 slot [24, 0, 0] — superseded in Master Layout A3.2 by AI_OFFICE_ROOM_QA_DEVOPS_v1 [24, 0, 0] (8×16) with active devops_engineer_agent.',
    description:
      'Historical A3.1 East Wing South slot [24, 0, 0] now unified into the 8×16 QA & DevOps Integrated Studio in A3.2.',
    connector_definitions: [
      {
        id: 'DEVOPS_WEST_TO_HUB',
        side: 'WEST',
        local_position: [0, 0, 4],
        global_position: [24, 0, 4],
        width: 2.0,
        height: 2.3,
        connects_to: 'CENTRAL_HUB_ROOT',
      },
    ],
    single_room_camera: QA_DEVOPS_STUDIO_ENTRY.single_room_camera,
    full_office_focus_camera: QA_DEVOPS_STUDIO_ENTRY.full_office_focus_camera,
  },
};

export const OFFICE_ROOM_REGISTRY: Record<RoomModuleKey, OfficeRoomRegistryEntry> = {
  pm_strategy: {
    key: 'pm_strategy',
    module_id: 'AI_OFFICE_ROOM_PM_v1',
    display_name: 'PM & Strategy Room',
    dropdown_label: 'PM & Strategy Room — READY',
    badge: 'READY',
    asset_status: 'READY',
    room_type: 'ENCLOSED_DEPARTMENT_ROOM',
    size: [8, 3.2, 8],
    local_origin: [0, 0, 0],
    global_offset: [8, 0, 18],
    global_bounds: { minX: 8, maxX: 16, minZ: 18, maxZ: 26 },
    row_zone: 'TOP_NORTH_ROW',
    asset_path: 'production/rooms/pm_strategy/pm_room.glb',
    manifest_path: 'production/rooms/pm_strategy/pm_room.manifest.json',
    anchor_path: 'production/rooms/pm_strategy/pm_room.anchors.json',
    behavior_path: 'production/characters/boss_pm_room_native/boss_pm.behavior.json',
    preview_path: 'production/rooms/pm_strategy/pm_room.preview.png',
    has_character_simulation: true,
    character_notice:
      'Original Room-Native Boss PM character active with 11 interactive demo actions and waypoint navigation.',
    description:
      'Approved PM & Strategy Room module with executive PM workstation, sprint Kanban board, tall walnut bookcase, collaboration table, cozy sofa, and living Boss PM simulation.',
    connector_definitions: [
      {
        id: 'PM_EAST_TO_CEO',
        side: 'EAST',
        local_position: [8, 0, 4],
        global_position: [16, 0, 22],
        width: 2.0,
        height: 2.3,
        connects_to: 'AI_OFFICE_ROOM_CEO_v1 (CEO_WEST_CONNECTION)',
      },
      {
        id: 'PM_SOUTH_TO_CORRIDOR',
        side: 'SOUTH',
        local_position: [4, 0, 0],
        global_position: [12, 0, 18],
        width: 2.0,
        height: 2.3,
        connects_to: 'SHARED_CORRIDOR_ROOT',
      },
    ],
    single_room_camera: {
      position: [13.6, 11.2, -5.6],
      target: [4.0, 1.15, 4.0],
      zoom: 76,
    },
    full_office_focus_camera: {
      position: [36.0, 25.15, -2.0],
      target: [12.0, 1.15, 22.0],
      zoom: 68,
    },
  },
  ceo_executive: {
    key: 'ceo_executive',
    module_id: 'AI_OFFICE_ROOM_CEO_v1',
    display_name: 'CEO Office — Executive Brain Command Center',
    dropdown_label: 'CEO Executive Brain Office — READY',
    badge: 'READY',
    asset_status: 'READY',
    room_type: 'ENCLOSED_DEPARTMENT_ROOM',
    size: [8, 3.2, 8],
    local_origin: [0, 0, 0],
    global_offset: [16, 0, 18],
    global_bounds: { minX: 16, maxX: 24, minZ: 18, maxZ: 26 },
    row_zone: 'TOP_NORTH_ROW',
    asset_path: 'production/rooms/ceo_executive/ceo_room.glb',
    manifest_path: 'production/rooms/ceo_executive/ceo_room.manifest.json',
    anchor_path: 'production/rooms/ceo_executive/ceo_room.anchors.json',
    behavior_path: 'production/rooms/ceo_executive/ceo_room.behavior.json',
    preview_path: 'production/rooms/ceo_executive/ceo_room.preview.png',
    has_character_simulation: true,
    character_notice:
      'CEO Executive Assistant (ceo_executive_assistant) active with 14 executive simulation actions, open-frame eyeglasses, salt-and-pepper hair, and green-lanyard ID card.',
    description:
      'Executive Brain Command Center located immediately East of the PM Room. Features the Walnut Executive Desk, Dual-Display Executive Computer Station, 7-Panel Executive Brain Console (DEMO DATA), Report Review Table, Strategy Cabinet, and panoramic windows.',
    connector_definitions: [
      {
        id: 'CEO_WEST_CONNECTION',
        side: 'WEST',
        local_position: [0, 0, 4],
        global_position: [16, 0, 22],
        width: 2.0,
        height: 2.3,
        connects_to: 'AI_OFFICE_ROOM_PM_v1 (CONNECTOR_A_EAST)',
      },
      {
        id: 'CEO_SOUTH_EXIT',
        side: 'SOUTH',
        local_position: [4, 0, 0],
        global_position: [20, 0, 18],
        width: 2.0,
        height: 2.3,
        connects_to: 'SHARED_CORRIDOR_ROOT',
      },
    ],
    single_room_camera: {
      position: [13.6, 11.2, -5.6],
      target: [4.0, 1.15, 4.0],
      zoom: 76,
    },
    full_office_focus_camera: {
      position: [44.0, 25.15, -2.0],
      target: [20.0, 1.15, 22.0],
      zoom: 68,
    },
  },
  research_brain: {
    key: 'research_brain',
    module_id: 'AI_OFFICE_ROOM_RESEARCH_v1',
    display_name: 'Research & Shared Brain',
    dropdown_label: 'Research & Shared Brain — READY',
    badge: 'READY',
    asset_status: 'READY',
    room_type: 'ENCLOSED_DEPARTMENT_ROOM',
    size: [8, 3.2, 8],
    local_origin: [0, 0, 0],
    global_offset: [0, 0, 18],
    global_bounds: { minX: 0, maxX: 8, minZ: 18, maxZ: 26 },
    row_zone: 'TOP_NORTH_ROW',
    asset_path: 'production/rooms/research_brain/research_room.glb',
    manifest_path: 'production/rooms/research_brain/research_room.manifest.json',
    anchor_path: 'production/rooms/research_brain/research_room.anchors.json',
    behavior_path: 'production/rooms/research_brain/research_room.behavior.json',
    preview_path: 'production/rooms/research_brain/research_room.preview.png',
    has_character_simulation: true,
    character_notice:
      'Research Professor (research_professor_agent) active with 18 scholarly & Shared Brain simulation actions, 20 embedded clips, and 360° voluminous white professor hair.',
    description:
      'The Knowledge Atelier at the North-West corner [0, 0, 18] of Master Layout A3.2. Combines a warm walnut Knowledge Archive Library & Card Catalog, Research Professor Daylight Workstation, Shared Brain Knowledge Atlas Wall (Organization, Project, and Agent memory layers — DEMO), and Evidence & Source Verification Reading Corner.',
    connector_definitions: [
      {
        id: 'RESEARCH_SOUTH_CORRIDOR',
        side: 'SOUTH',
        local_position: [4, 0, 0],
        global_position: [4, 0, 18],
        width: 2.0,
        height: 2.3,
        connects_to: 'SHARED_CORRIDOR_ROOT',
      },
    ],
    single_room_camera: {
      position: [13.6, 11.2, -5.6],
      target: [4.0, 1.05, 4.0],
      zoom: 76,
    },
    full_office_focus_camera: {
      position: [28.0, 25.15, -2.0],
      target: [4.0, 1.05, 22.0],
      zoom: 68,
    },
  },
  uiux_studio: {
    key: 'uiux_studio',
    module_id: 'AI_OFFICE_ROOM_UIUX_v1',
    display_name: 'UI/UX Design Studio',
    dropdown_label: 'UI/UX Design Studio — READY',
    badge: 'READY',
    asset_status: 'READY',
    room_type: 'ENCLOSED_DEPARTMENT_ROOM',
    size: [8, 3.2, 8],
    local_origin: [0, 0, 0],
    global_offset: [24, 0, 18],
    global_bounds: { minX: 24, maxX: 32, minZ: 18, maxZ: 26 },
    row_zone: 'TOP_NORTH_ROW',
    asset_path: 'production/rooms/uiux_studio/uiux_room.glb',
    manifest_path: 'production/rooms/uiux_studio/uiux-room.manifest.json',
    anchor_path: 'production/rooms/uiux_studio/uiux-room.anchors.json',
    behavior_path: 'production/rooms/uiux_studio/uiux-room.behavior.json',
    preview_path: 'production/rooms/uiux_studio/uiux_room.preview.png',
    has_character_simulation: true,
    character_notice:
      'UI/UX Designer (uiux_designer) active with revised feminine short voxel bob hairstyle, 14 creative studio actions, and 8×8 UI/UX Design Studio.',
    description:
      'Creative UI/UX Design Studio located at the North-East corner [24, 0, 18] of Master Layout A3.2. Features the Primary Design Workstation with 5K UI monitor & pen display, 3D Wireframe / UX Flow Wall, Visual Design & Color Swatch Board, Round Prototype Review Area, Nordic Birch & Sage Material Shelf, and cozy studio decor.',
    connector_definitions: [
      {
        id: 'UIUX_SOUTH_EXIT',
        side: 'SOUTH',
        local_position: [4, 0, 0],
        global_position: [28, 0, 18],
        width: 2.0,
        height: 2.3,
        connects_to: 'SHARED_CORRIDOR_ROOT',
      },
    ],
    single_room_camera: {
      position: [13.6, 11.2, -5.6],
      target: [4.0, 1.15, 4.0],
      zoom: 76,
    },
    full_office_focus_camera: {
      position: [52.0, 25.15, -2.0],
      target: [28.0, 1.15, 22.0],
      zoom: 68,
    },
  },
  engineering: {
    key: 'engineering',
    module_id: 'AI_OFFICE_ROOM_ENGINEERING_v1',
    display_name: 'Engineering & Development Studio',
    dropdown_label: 'Engineering & Development Studio (8×16) — READY',
    badge: 'READY',
    asset_status: 'READY',
    room_type: 'ENGINEERING_MULTI_AGENT',
    size: [8, 3.2, 16],
    local_origin: [0, 0, 0],
    global_offset: [0, 0, 0],
    global_bounds: { minX: 0, maxX: 8, minZ: 0, maxZ: 16 },
    row_zone: 'WEST_WING',
    asset_path: 'production/rooms/engineering_studio/engineering_room.glb',
    manifest_path: 'production/rooms/engineering_studio/engineering_room.manifest.json',
    anchor_path: 'production/rooms/engineering_studio/engineering_room.anchors.json',
    behavior_path: 'production/rooms/engineering_studio/engineering_room.behavior.json',
    preview_path: 'production/rooms/engineering_studio/engineering_room.preview.png',
    has_character_simulation: true,
    character_notice:
      'Frontend, Backend, and Database Developer agents active across all 4 Engineering Studio zones.',
    description:
      'Continuous 8×16 Double-Module Engineering & Development Studio occupying the West Wing [0, 0, 0] (X=0..8, Z=0..16) in Master Layout A3.2 with zero internal dividing wall at Z=8. Houses Zone A Frontend Developer Workstation (North), Zone B Backend Developer Workstation (Upper-Middle), Zone C Shared Integration & Code Review Hub (Lower-Middle), and Zone D Database Developer Workstation (South).',
    connector_definitions: [
      {
        id: 'ENGINEERING_EAST_MAIN',
        side: 'EAST',
        local_position: [8, 0, 8],
        global_position: [8, 0, 8],
        width: 2.0,
        height: 2.3,
        connects_to: 'CENTRAL_HUB_ROOT',
      },
      {
        id: 'ENGINEERING_NORTH_CORRIDOR',
        side: 'NORTH',
        local_position: [4, 0, 16],
        global_position: [4, 0, 16],
        width: 2.0,
        height: 2.3,
        connects_to: 'SHARED_CORRIDOR_ROOT',
      },
    ],
    single_room_camera: {
      position: [15.5, 11.8, -4.8],
      target: [3.8, 1.1, 8.0],
      zoom: 52,
    },
    full_office_focus_camera: {
      position: [28.0, 25.0, -10.0],
      target: [4.0, 1.1, 8.0],
      zoom: 48,
    },
  },
  qa_devops_studio: QA_DEVOPS_STUDIO_ENTRY,
  // Legacy A3.1 keys mapped to the unified A3.2 studio entry so any legacy lookup resolves cleanly
  qa_review: QA_DEVOPS_STUDIO_ENTRY,
  devops_ai_engine: QA_DEVOPS_STUDIO_ENTRY,
};

/**
 * Canonical physical room modules in Master Floor Plan A3.2:
 * - 4 North-row 8×8 rooms (Research, PM, CEO, UI/UX)
 * - 1 West-wing 8×16 studio (Engineering & Development Studio)
 * - 1 East-wing 8×16 studio (QA & DevOps Integrated Studio)
 */
export const ORDERED_ROOM_KEYS: RoomModuleKey[] = [
  'pm_strategy',
  'ceo_executive',
  'uiux_studio',
  'engineering',
  'research_brain',
  'qa_devops_studio',
];

export const OFFICE_ROOM_LIST: OfficeRoomRegistryEntry[] = ORDERED_ROOM_KEYS.map(
  (k) => OFFICE_ROOM_REGISTRY[k]
);

export function getRoomModuleByKey(key: RoomModuleKey): OfficeRoomRegistryEntry {
  if (key === 'qa_review' || key === 'devops_ai_engine') {
    return OFFICE_ROOM_REGISTRY.qa_devops_studio;
  }
  return OFFICE_ROOM_REGISTRY[key] || OFFICE_ROOM_REGISTRY.pm_strategy;
}

export const OFFICE_COMMON_AREAS: CommonAreaSpec[] = [
  {
    id: 'SHARED_CORRIDOR_ROOT',
    display_name: 'East-West Executive Corridor',
    zone_type: 'SHARED_CORRIDOR',
    enclosed_room: false,
    origin: [0, 0, 16],
    size: [32, 0.16, 2],
    bounds: { minX: 0, maxX: 32, minZ: 16, maxZ: 18 },
    description:
      '2-unit-wide East-West arterial walkway (X=0..32, Z=16..18) linking all 4 North-row modules (Research, PM, CEO, UI/UX) with the 8×16 Engineering Studio, Central Collaboration Hub, and 8×16 QA & DevOps Integrated Studio.',
  },
  {
    id: 'CENTRAL_HUB_ROOT',
    display_name: 'Central Collaboration Hub V2 (Open Shared Area & 10-Seat Conference Table)',
    zone_type: 'OPEN_COLLABORATION_HUB',
    enclosed_room: false,
    origin: [8, 0, 0],
    size: [16, 3.2, 16],
    bounds: { minX: 8, maxX: 24, minZ: 0, maxZ: 16 },
    description:
      '16×16 open shared office commons (X=8..24, Z=0..16) with 12×12 Warm Natural Oak Herringbone Parquet, 2u Warm Greige Large-Format Stone circulation perimeter, 6.8×2.3u 10-seat conference table at [16,0,8], shared review display, refreshment sideboard, visitor bench, and Main South Entrance at [16,0,0].',
  },
  {
    id: 'ENTRANCE_ROOT',
    display_name: 'Main Office South Entrance Portal',
    zone_type: 'MAIN_ENTRANCE',
    enclosed_room: false,
    origin: [14, 0, 0],
    size: [4, 3.2, 1.6],
    bounds: { minX: 14, maxX: 18, minZ: 0, maxZ: 1.6 },
    description:
      'Primary arrival portal centered at X=16, Z=0 on the South edge of the Central Collaboration Hub with 2.4u clear doorway opening, 3.2u walnut/oak portal frame, glazed double doors, welcome mat, sconces, and flanking planters.',
  },
];

export type FullOfficeCutawayMode = 'smart_cutaway' | 'show_architecture' | 'agent_visibility';
export type FullOfficeOrbitMode = 'cinematic' | 'free_inspect';

export interface FullOfficeCameraProfileV2_1 {
  schema_version: string;
  profile_id: string;
  layout_id: string;
  projection_type: 'OrthographicCamera';
  default_view: string;
  target_position: [number, number, number];
  default_position: [number, number, number];
  default_elevation: number;
  default_azimuth: number;
  minimum_elevation: number;
  maximum_elevation: number;
  azimuth_limits: [number, number];
  min_zoom_factor: number;
  max_zoom_factor: number;
  focus_max_zoom_factor: number;
  fit_padding: number;
  pan_bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  default_cutaway_mode: FullOfficeCutawayMode;
  supported_cutaway_modes: FullOfficeCutawayMode[];
}

export const FULL_OFFICE_CAMERA_PROFILE_V2_1: FullOfficeCameraProfileV2_1 = {
  schema_version: 'AI_OFFICE_CAMERA_PROFILE_V2_1',
  profile_id: 'full-office-camera-profile-v2.1',
  layout_id: 'AI_OFFICE_LAYOUT_A3_2_v1',
  projection_type: 'OrthographicCamera',
  default_view: 'full_office_cinematic',
  target_position: [16.0, 1.1, 13.0],
  default_position: [28.6, 25.3, -17.0],
  default_elevation: 36.64,
  default_azimuth: 22.78,
  minimum_elevation: 28.0,
  maximum_elevation: 46.0,
  azimuth_limits: [2.78, 42.78],
  min_zoom_factor: 0.88,
  max_zoom_factor: 1.65,
  focus_max_zoom_factor: 3.2,
  fit_padding: 0.08,
  pan_bounds: {
    minX: 5.0,
    maxX: 27.0,
    minY: 0.0,
    maxY: 2.4,
    minZ: 3.0,
    maxZ: 23.0,
  },
  default_cutaway_mode: 'smart_cutaway',
  supported_cutaway_modes: ['smart_cutaway', 'show_architecture', 'agent_visibility'],
};

export const FULL_OFFICE_CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'full_office_cinematic',
    label: 'Full Office — Cinematic Front 3/4 Overview (36.6° Elevation · 22.8° Azimuth)',
    shortLabel: 'Cinematic Overview',
    category: 'standard',
    position: [28.6, 25.3, -17.0],
    target: [16.0, 1.1, 13.0],
    zoom: 28.5,
    description:
      'Default V2.1 front three-quarter orthographic presentation view (dx=+12.6, dy=+24.2, dz=-30.0 => 36.64° elevation, 22.78° azimuth) centered on [16.0, 1.1, 13.0] with 8% visual padding.',
  },
  {
    id: 'full_office_iso',
    label: 'Full Office — True Isometric (45° Azimuth · 35.264° Elevation)',
    shortLabel: 'Full Office Iso',
    category: 'standard',
    position: [40.0, 24.9, -11.0],
    target: [16.0, 0.9, 13.0],
    zoom: 26.8,
    description:
      'True orthographic isometric view (dx=+24, dy=+24, dz=-24 => 45° azimuth, 35.264° elevation) centered on the 32×26 Master Floor Plan A3.2 with auto-fitted frustum so both wings fit cleanly.',
  },
  {
    id: 'full_office_top',
    label: 'Full Office — Exact Top View (32×26 Axis-Aligned Orthographic)',
    shortLabel: 'Top View',
    category: 'standard',
    position: [16.0, 48.0, 12.999],
    target: [16.0, 0.0, 13.0],
    zoom: 28.8,
    description:
      'Authoritative true orthographic top-down view down the -Y axis with zero roll. Renders the 32×26 footprint as an exact axis-aligned horizontal/vertical rectangle.',
  },
  {
    id: 'full_office_front',
    label: 'Full Office — Architectural 3/4 View',
    shortLabel: 'Arch 3/4 View',
    category: 'standard',
    position: [26.0, 23.5, -18.0],
    target: [16.0, 0.9, 13.0],
    zoom: 28.5,
    description:
      'Elevated orthographic 3/4 architectural presentation view framing the Main South Entrance at [16,0,0], Central Hub, and both 8×16 West/East wings.',
  },
  {
    id: 'focus_central_hub',
    label: 'Central Hub Focus (16×16 Commons & Main Entrance)',
    shortLabel: 'Central Hub Focus',
    category: 'standard',
    position: [32.0, 18.5, -8.0],
    target: [16.0, 0.8, 8.0],
    zoom: 38.0,
    description:
      'Frames the 16×16 open Central Collaboration Hub, Herringbone Parquet & Warm Greige Stone floor, 10-seat conference table, and Main South Entrance.',
  },
  {
    id: 'focus_meeting_table',
    label: 'Meeting Focus (10-Seat Conference Table [16, 0, 8])',
    shortLabel: 'Meeting Focus',
    category: 'standard',
    position: [25.5, 11.2, -1.5],
    target: [16.0, 0.75, 8.0],
    zoom: 62.0,
    description:
      'Close-up orthographic framing of the 6.8×2.3u Central Hub Conference Table, 10 meeting chairs, and seated agents during the All-Agent Meeting Demo.',
  },
  {
    id: 'focus_pm_office',
    label: 'Focus: PM & Strategy Room [8, 0, 18]',
    shortLabel: 'Focus PM Room',
    category: 'inspection',
    position: [36.0, 25.15, -2.0],
    target: [12.0, 1.15, 22.0],
    zoom: 68,
    description: 'Zoomed orthographic isometric framing of Room 01 (PM & Strategy Room) inside the A3.2 Office.',
  },
  {
    id: 'focus_ceo_office',
    label: 'Focus: CEO Executive Brain Office [16, 0, 18]',
    shortLabel: 'Focus CEO Room',
    category: 'inspection',
    position: [44.0, 25.15, -2.0],
    target: [20.0, 1.15, 22.0],
    zoom: 68,
    description: 'Zoomed orthographic isometric framing of Room 02 (CEO Executive Brain Office) inside the A3.2 Office.',
  },
  {
    id: 'focus_uiux_studio',
    label: 'Focus: UI/UX Design Studio [24, 0, 18]',
    shortLabel: 'Focus UI/UX Studio',
    category: 'inspection',
    position: [52.0, 25.15, -2.0],
    target: [28.0, 1.15, 22.0],
    zoom: 68,
    description: 'Zoomed orthographic isometric framing of Room 03 (UI/UX Design Studio) inside the A3.2 Office.',
  },
  {
    id: 'focus_engineering_studio',
    label: 'Focus: Engineering & Development Studio 8×16 [0, 0, 0]',
    shortLabel: 'Focus Engineering',
    category: 'inspection',
    position: [28.0, 25.0, -10.0],
    target: [4.0, 1.1, 8.0],
    zoom: 48,
    description: 'Zoomed orthographic isometric framing of Room 04 (8×16 Double-Module Engineering & Development Studio) at [0, 0, 0].',
  },
  {
    id: 'focus_research_brain',
    label: 'Focus: Research & Shared Brain [0, 0, 18]',
    shortLabel: 'Focus Research',
    category: 'inspection',
    position: [28.0, 25.15, -2.0],
    target: [4.0, 1.05, 22.0],
    zoom: 68,
    description: 'Zoomed orthographic isometric framing of Room 05 (Research & Shared Brain — The Knowledge Atelier) at [0, 0, 18].',
  },
  {
    id: 'focus_qa_devops_studio',
    label: 'Focus: QA & DevOps Integrated Studio 8×16 [24, 0, 0]',
    shortLabel: 'Focus QA & DevOps',
    category: 'inspection',
    position: [52.0, 25.0, -10.0],
    target: [28.0, 1.1, 8.0],
    zoom: 48,
    description: 'Zoomed orthographic isometric framing of Room 06 (8×16 QA & DevOps Integrated Studio — Elegant Cozy Edition) at [24, 0, 0].',
  },
  {
    id: 'focus_pm_ceo_suite',
    label: 'Focus: PM + CEO Executive Suite (Connected)',
    shortLabel: 'PM + CEO Suite',
    category: 'inspection',
    position: [40.0, 25.15, -2.0],
    target: [16.0, 1.15, 22.0],
    zoom: 46,
    description: 'Frames both PM Room and CEO Room together with their shared East-West connector at [16, 0, 22].',
  },
];

function buildCorridorConnectionsListA3_2() {
  return [
    {
      from_module_id: 'AI_OFFICE_ROOM_RESEARCH_v1',
      to_zone_id: 'SHARED_CORRIDOR_ROOT',
      global_doorway_center: [4, 0, 18] as [number, number, number],
      passage_width: 2.0,
      unobstructed: true,
    },
    {
      from_module_id: 'AI_OFFICE_ROOM_PM_v1',
      to_zone_id: 'SHARED_CORRIDOR_ROOT',
      global_doorway_center: [12, 0, 18] as [number, number, number],
      passage_width: 2.0,
      unobstructed: true,
    },
    {
      from_module_id: 'AI_OFFICE_ROOM_CEO_v1',
      to_zone_id: 'SHARED_CORRIDOR_ROOT',
      global_doorway_center: [20, 0, 18] as [number, number, number],
      passage_width: 2.0,
      unobstructed: true,
    },
    {
      from_module_id: 'AI_OFFICE_ROOM_PM_v1',
      to_zone_id: 'AI_OFFICE_ROOM_CEO_v1',
      global_doorway_center: [16, 0, 22] as [number, number, number],
      passage_width: 2.0,
      unobstructed: true,
    },
    {
      from_module_id: 'AI_OFFICE_ROOM_UIUX_v1',
      to_zone_id: 'SHARED_CORRIDOR_ROOT',
      global_doorway_center: [28, 0, 18] as [number, number, number],
      passage_width: 2.0,
      unobstructed: true,
    },
    {
      from_module_id: 'AI_OFFICE_ROOM_ENGINEERING_v1',
      to_zone_id: 'CENTRAL_HUB_ROOT',
      global_doorway_center: [8, 0, 8] as [number, number, number],
      passage_width: 2.0,
      unobstructed: true,
    },
    {
      from_module_id: 'AI_OFFICE_ROOM_ENGINEERING_v1',
      to_zone_id: 'SHARED_CORRIDOR_ROOT',
      global_doorway_center: [4, 0, 16] as [number, number, number],
      passage_width: 2.0,
      unobstructed: true,
    },
    {
      from_module_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1',
      to_zone_id: 'CENTRAL_HUB_ROOT',
      global_doorway_center: [24, 0, 8] as [number, number, number],
      passage_width: 2.0,
      unobstructed: true,
    },
    {
      from_module_id: 'AI_OFFICE_ROOM_QA_DEVOPS_v1',
      to_zone_id: 'SHARED_CORRIDOR_ROOT',
      global_doorway_center: [28, 0, 16] as [number, number, number],
      passage_width: 2.0,
      unobstructed: true,
    },
  ];
}

/**
 * Historical A3.1 export contract preserved as a recoverable checkpoint.
 */
export function buildOfficeLayoutA3_1ExportJson(): OfficeLayoutA3ExportJson {
  const a31Rooms: OfficeRoomRegistryEntry[] = [
    OFFICE_ROOM_REGISTRY.pm_strategy,
    OFFICE_ROOM_REGISTRY.ceo_executive,
    OFFICE_ROOM_REGISTRY.uiux_studio,
    OFFICE_ROOM_REGISTRY.engineering,
    OFFICE_ROOM_REGISTRY.research_brain,
    LEGACY_A3_1_QA_DEVOPS_ENTRIES.qa_review,
    LEGACY_A3_1_QA_DEVOPS_ENTRIES.devops_ai_engine,
  ];
  return {
    schema_version: 'AI_OFFICE_MASTER_LAYOUT_A3_1_V1',
    layout_id: 'AI_OFFICE_LAYOUT_A3_1_v1',
    display_name: 'Master Floor Plan A3.1 — Historical Checkpoint (Pre-A3.2 QA/DevOps Merge)',
    generated_at: new Date().toISOString(),
    coordinate_convention: {
      up_axis: 'Y',
      handedness: 'right-handed',
      x_axis: 'West (0) -> East (+32)',
      z_axis: 'South (0) -> North (+26)',
      floor_elevation_y: 0,
      unit_scale: '1 Three.js world unit = 1 modular grid tile (1.0m nominal)',
    },
    total_office_bounds: {
      width_x: 32,
      depth_z: 26,
      wall_height_y: 3.2,
      min: [0, -0.16, 0],
      max: [32, 3.2, 26],
    },
    hierarchy_contract: {
      root_node: 'OFFICE_A3_ROOT',
      child_groups: [
        'ROOM_MODULES',
        'SHARED_CORRIDOR_ROOT',
        'CENTRAL_HUB_ROOT',
        'TERRACE_ROOT',
        'ENTRANCE_ROOT',
        'OFFICE_HELPERS',
      ],
    },
    enclosed_rooms: a31Rooms,
    common_areas: OFFICE_COMMON_AREAS,
    corridor_connections: buildCorridorConnectionsListA3_2(),
  };
}

/**
 * Master Floor Plan A3.2 Export Contract (`office-layout-a3.2.json`):
 * Unifies the East Wing `[24, 0, 0]` (`8×16`) into `AI_OFFICE_ROOM_QA_DEVOPS_v1`.
 */
export function buildOfficeLayoutA3_2ExportJson(): OfficeLayoutA3ExportJson {
  const enclosedRooms = ORDERED_ROOM_KEYS.map((k) => OFFICE_ROOM_REGISTRY[k]);
  return {
    schema_version: 'AI_OFFICE_MASTER_LAYOUT_A3_2_V1',
    layout_id: 'AI_OFFICE_LAYOUT_A3_2_v1',
    display_name:
      'Master Floor Plan A3.2 — Combined 8×16 QA & DevOps Integrated Studio at [24, 0, 0]',
    generated_at: new Date().toISOString(),
    coordinate_convention: {
      up_axis: 'Y',
      handedness: 'right-handed',
      x_axis: 'West (0) -> East (+32)',
      z_axis: 'South (0) -> North (+26)',
      floor_elevation_y: 0,
      unit_scale: '1 Three.js world unit = 1 modular grid tile (1.0m nominal)',
    },
    total_office_bounds: {
      width_x: 32,
      depth_z: 26,
      wall_height_y: 3.2,
      min: [0, -0.16, 0],
      max: [32, 3.2, 26],
    },
    hierarchy_contract: {
      root_node: 'OFFICE_A3_ROOT',
      child_groups: [
        'ROOM_MODULES',
        'SHARED_CORRIDOR_ROOT',
        'CENTRAL_HUB_ROOT',
        'TERRACE_ROOT',
        'ENTRANCE_ROOT',
        'OFFICE_HELPERS',
      ],
    },
    enclosed_rooms: enclosedRooms,
    common_areas: OFFICE_COMMON_AREAS,
    corridor_connections: buildCorridorConnectionsListA3_2(),
    legacy_migration_aliases: {
      qa_review: 'qa_devops_studio (North QA Testing Zone Z=10.6..16.0)',
      devops_ai_engine: 'qa_devops_studio (South DevOps Operations Zone Z=0.0..5.4)',
    },
  };
}

export function buildOfficeLayoutA3ExportJson(): OfficeLayoutA3ExportJson {
  return buildOfficeLayoutA3_2ExportJson();
}

/**
 * Validates that none of the 6 physical enclosed rooms (four 8×8 North-row rooms +
 * two 8×16 West/East wing studios) overlap in X/Z footprint and that all modules fit
 * cleanly inside the 32×26 Master Floor Plan A3.2.
 */
export function validateOfficeLayoutA3(): {
  valid: boolean;
  nonOverlappingRooms: boolean;
  withinMasterFootprint: boolean;
  pmToCeoConnectorAligned: boolean;
  qaDevopsCombined8x16Valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  let nonOverlappingRooms = true;
  let withinMasterFootprint = true;

  const rooms = ORDERED_ROOM_KEYS.map((k) => OFFICE_ROOM_REGISTRY[k]);

  for (let i = 0; i < rooms.length; i++) {
    const rA = rooms[i];
    const bA = rA.global_bounds;
    if (
      bA.minX < 0 ||
      bA.maxX > OFFICE_A3_CONSTANTS.TOTAL_WIDTH_X ||
      bA.minZ < 0 ||
      bA.maxZ > OFFICE_A3_CONSTANTS.TOTAL_DEPTH_Z
    ) {
      withinMasterFootprint = false;
      violations.push(`${rA.module_id} exceeds 32×26 master bounds.`);
    }

    const expectedWidth = rA.size[0];
    const expectedDepth = rA.size[2];
    if (bA.maxX - bA.minX !== expectedWidth || bA.maxZ - bA.minZ !== expectedDepth) {
      withinMasterFootprint = false;
      violations.push(
        `${rA.module_id} bounds (${bA.maxX - bA.minX}×${bA.maxZ - bA.minZ}) do not match declared size (${expectedWidth}×${expectedDepth}).`
      );
    }

    for (let j = i + 1; j < rooms.length; j++) {
      const rB = rooms[j];
      const bB = rB.global_bounds;
      const overlapX = Math.min(bA.maxX, bB.maxX) - Math.max(bA.minX, bB.minX);
      const overlapZ = Math.min(bA.maxZ, bB.maxZ) - Math.max(bA.minZ, bB.minZ);
      if (overlapX > 0 && overlapZ > 0) {
        nonOverlappingRooms = false;
        violations.push(`${rA.module_id} overlaps ${rB.module_id}.`);
      }
    }
  }

  const pmEast = OFFICE_ROOM_REGISTRY.pm_strategy.connector_definitions.find(
    (c) => c.side === 'EAST'
  );
  const ceoWest = OFFICE_ROOM_REGISTRY.ceo_executive.connector_definitions.find(
    (c) => c.side === 'WEST'
  );
  const pmToCeoConnectorAligned = Boolean(
    pmEast &&
      ceoWest &&
      pmEast.global_position[0] === ceoWest.global_position[0] &&
      pmEast.global_position[2] === ceoWest.global_position[2]
  );

  if (!pmToCeoConnectorAligned) {
    violations.push('PM East Connector and CEO West Connector global coordinates do not align.');
  }

  const qaDevops = OFFICE_ROOM_REGISTRY.qa_devops_studio;
  const qaDevopsCombined8x16Valid =
    qaDevops.module_id === 'AI_OFFICE_ROOM_QA_DEVOPS_v1' &&
    qaDevops.size[0] === 8 &&
    qaDevops.size[2] === 16 &&
    qaDevops.global_offset[0] === 24 &&
    qaDevops.global_offset[2] === 0;

  if (!qaDevopsCombined8x16Valid) {
    violations.push('QA & DevOps Integrated Studio must be 8×16 at global offset [24, 0, 0].');
  }

  return {
    valid:
      nonOverlappingRooms &&
      withinMasterFootprint &&
      pmToCeoConnectorAligned &&
      qaDevopsCombined8x16Valid,
    nonOverlappingRooms,
    withinMasterFootprint,
    pmToCeoConnectorAligned,
    qaDevopsCombined8x16Valid,
    violations,
  };
}

/**
 * Projects the 8 corners of the Master 32 × 26 × 3.2 office bounding box
 * (`X ∈ [0, 32], Y ∈ [-0.16, 3.20], Z ∈ [0, 26]`) onto the orthographic camera plane
 * defined by `position` and `target` and computes the exact preset zoom (`camera.zoom * 68`)
 * that fits the entire building with `fitPadding` (default `0.08` = 8% visual margin).
 */
export function computeProjectedOfficeFitZoom(
  position: [number, number, number],
  target: [number, number, number],
  aspect: number,
  fitPadding: number = FULL_OFFICE_CAMERA_PROFILE_V2_1.fit_padding
): number {
  const safeAspect = Math.max(0.5, Math.min(3.5, aspect || 1.6));
  const fx = target[0] - position[0];
  const fy = target[1] - position[1];
  const fz = target[2] - position[2];
  const fLen = Math.hypot(fx, fy, fz) || 1;
  const forward: [number, number, number] = [fx / fLen, fy / fLen, fz / fLen];

  // Handle near-vertical top-down orientation cleanly
  const isTopDown = Math.hypot(fx, fz) < 0.05;
  const worldUp: [number, number, number] = isTopDown ? [0, 0, 1] : [0, 1, 0];

  // right = normalize(cross(forward, worldUp))
  let rx = forward[1] * worldUp[2] - forward[2] * worldUp[1];
  let ry = forward[2] * worldUp[0] - forward[0] * worldUp[2];
  let rz = forward[0] * worldUp[1] - forward[1] * worldUp[0];
  const rLen = Math.hypot(rx, ry, rz) || 1;
  rx /= rLen;
  ry /= rLen;
  rz /= rLen;

  // camUp = cross(right, forward)
  const ux = ry * forward[2] - rz * forward[1];
  const uy = rz * forward[0] - rx * forward[2];
  const uz = rx * forward[1] - ry * forward[0];

  const xs = [0, 32];
  const ys = [-0.16, 3.2];
  const zs = [0, 26];

  let maxAbsU = 0;
  let maxAbsV = 0;

  for (const x of xs) {
    for (const y of ys) {
      for (const z of zs) {
        const dx = x - target[0];
        const dy = y - target[1];
        const dz = z - target[2];
        const u = Math.abs(dx * rx + dy * ry + dz * rz);
        const v = Math.abs(dx * ux + dy * uy + dz * uz);
        if (u > maxAbsU) maxAbsU = u;
        if (v > maxAbsV) maxAbsV = v;
      }
    }
  }

  const marginMultiplier = 1 + Math.max(0.04, Math.min(0.2, fitPadding)) * 2;
  const reqWidth = Math.max(1, 2 * maxAbsU * marginMultiplier);
  const reqHeight = Math.max(1, 2 * maxAbsV * marginMultiplier);

  // At camera.zoom = presetZoom / 68 and frustumHalf = 6.0:
  // visibleHeight = 816 / presetZoom, visibleWidth = (816 * safeAspect) / presetZoom
  const maxZoomH = 816 / reqHeight;
  const maxZoomW = (816 * safeAspect) / reqWidth;
  return Number(Math.min(maxZoomH, maxZoomW).toFixed(2));
}

/**
 * Computes an aspect-ratio-aware orthographic zoom value (in preset zoom units where
 * `camera.zoom = presetZoom / 68` and `frustumHalf = 6.0` world units) so that the full
 * 32 × 26 × 3.2 office footprint fits inside the viewport with ~8% margin on all sides.
 * Supports both 2-argument `(presetId, aspect)` and 3-argument `(presetId, baseZoom, aspect)` callers.
 */
export function computeAutoFitZoomForFullOfficePreset(
  presetId: string,
  baseZoomOrAspect: number,
  maybeAspect?: number
): number {
  const aspect =
    typeof maybeAspect === 'number' && !Number.isNaN(maybeAspect)
      ? maybeAspect
      : baseZoomOrAspect;
  const safeAspect = Math.max(0.5, Math.min(3.5, aspect || 1.6));

  if (
    presetId === 'full_office_cinematic' ||
    presetId === 'fit_full_office' ||
    presetId === 'reset_full_office'
  ) {
    return computeProjectedOfficeFitZoom(
      FULL_OFFICE_CAMERA_PROFILE_V2_1.default_position,
      FULL_OFFICE_CAMERA_PROFILE_V2_1.target_position,
      safeAspect,
      FULL_OFFICE_CAMERA_PROFILE_V2_1.fit_padding
    );
  }
  if (presetId === 'full_office_iso') {
    return computeProjectedOfficeFitZoom(
      [40.0, 24.9, -11.0],
      [16.0, 0.9, 13.0],
      safeAspect,
      FULL_OFFICE_CAMERA_PROFILE_V2_1.fit_padding
    );
  }
  if (presetId === 'full_office_top') {
    return computeProjectedOfficeFitZoom(
      [16.0, 48.0, 12.999],
      [16.0, 0.0, 13.0],
      safeAspect,
      FULL_OFFICE_CAMERA_PROFILE_V2_1.fit_padding
    );
  }
  if (presetId === 'full_office_front') {
    return computeProjectedOfficeFitZoom(
      [26.0, 23.5, -18.0],
      [16.0, 0.9, 13.0],
      safeAspect,
      FULL_OFFICE_CAMERA_PROFILE_V2_1.fit_padding
    );
  }

  const preset = FULL_OFFICE_CAMERA_PRESETS.find((p) => p.id === presetId);
  return preset ? preset.zoom : typeof maybeAspect === 'number' ? baseZoomOrAspect : 28.5;
}

export function validateFullOfficeGeometricPrecision(): {
  valid: boolean;
  topViewZeroSkewVerified: boolean;
  trueIsometricAnglesVerified: boolean;
  unitUniformityVerified: boolean;
  details: string[];
} {
  const isoPreset = FULL_OFFICE_CAMERA_PRESETS.find((p) => p.id === 'full_office_iso')!;
  const topPreset = FULL_OFFICE_CAMERA_PRESETS.find((p) => p.id === 'full_office_top')!;

  const dxIso = isoPreset.position[0] - isoPreset.target[0];
  const dyIso = isoPreset.position[1] - isoPreset.target[1];
  const dzIso = isoPreset.position[2] - isoPreset.target[2];
  const horizDistIso = Math.hypot(dxIso, dzIso);
  const azimuthDeg = (Math.atan2(Math.abs(dxIso), Math.abs(dzIso)) * 180) / Math.PI;
  const elevationDeg = (Math.atan2(dyIso, horizDistIso) * 180) / Math.PI;

  const trueIsometricAnglesVerified =
    Math.abs(azimuthDeg - 45.0) < 0.05 && Math.abs(elevationDeg - 35.26438968) < 0.05;

  const dxTop = Math.abs(topPreset.position[0] - topPreset.target[0]);
  const dzTop = Math.abs(topPreset.position[2] - topPreset.target[2]);
  const topViewZeroSkewVerified = dxTop === 0 && dzTop < 0.01;

  const layoutCheck = validateOfficeLayoutA3();
  const unitUniformityVerified = layoutCheck.valid;

  return {
    valid: trueIsometricAnglesVerified && topViewZeroSkewVerified && unitUniformityVerified,
    topViewZeroSkewVerified,
    trueIsometricAnglesVerified,
    unitUniformityVerified,
    details: [
      `True Isometric Preset: azimuth=${azimuthDeg.toFixed(3)}°, elevation=${elevationDeg.toFixed(3)}° (expected 45.000° / 35.264°).`,
      `Exact Top View Preset: dx=${dxTop.toFixed(4)}, dz=${dzTop.toFixed(4)} (0.00° roll / axis-aligned 32:26 rectangle).`,
      `Master Floor Plan A3.2 32×26×3.2 uniform scale [1,1,1] and zero room overlap verified=${unitUniformityVerified}.`,
    ],
  };
}

export function buildFullOfficeVisualProfileV2Json() {
  return {
    schema_version: 'AI_OFFICE_FULL_VISUAL_PROFILE_V2',
    profile_id: 'full-office-visual-profile-v2',
    layout_id: 'AI_OFFICE_LAYOUT_A3_2_v1',
    generated_at: new Date().toISOString(),
    master_bounds: {
      width_x: 32,
      depth_z: 26,
      wall_height_y: 3.2,
      min: [0, -0.16, 0],
      max: [32, 3.2, 26],
    },
    camera_profile: {
      projection: 'OrthographicCamera',
      near: -40.0,
      far: 180.0,
      frustum_half_units: 6.0,
      auto_fit_margin_ratio: 0.12,
      presets: FULL_OFFICE_CAMERA_PRESETS.map((p) => ({
        id: p.id,
        label: p.label,
        position: p.position,
        target: p.target,
        base_zoom: p.zoom,
      })),
    },
    flooring_architecture: {
      anti_shimmer_filtering: {
        min_filter: 'LinearMipmapLinearFilter',
        mag_filter: 'LinearFilter',
        generate_mipmaps: true,
        anisotropy: 8,
      },
      zones: [
        {
          zone_id: 'CENTRAL_HUB_PARQUET',
          material_name: 'Mat_Central_Hub_Herringbone_Parquet',
          style: 'Warm Natural Oak Herringbone / Chevron Parquet',
          global_bounds: { minX: 10, maxX: 22, minZ: 2, maxZ: 14 },
        },
        {
          zone_id: 'CENTRAL_HUB_STONE_PERIMETER',
          material_name: 'Mat_Warm_Greige_Large_Stone',
          style: 'Warm Greige Large-Format Architectural Stone (2u circulation ring)',
          global_bounds: { minX: 8, maxX: 24, minZ: 0, maxZ: 16 },
        },
        {
          zone_id: 'SHARED_CORRIDOR_STONE',
          material_name: 'Mat_Office_Corridor_Floor',
          style: 'Warm Greige Large-Format Architectural Stone with Brass Runner Trim',
          global_bounds: { minX: 0, maxX: 32, minZ: 16, maxZ: 18 },
        },
        {
          zone_id: 'ROOM_RESEARCH_FLOOR',
          material_name: 'Mat_Floor_Research_Warm_Academic_Oak',
          style: 'Wide-Plank Warm Academic Oak',
          global_bounds: { minX: 0, maxX: 8, minZ: 18, maxZ: 26 },
        },
        {
          zone_id: 'ROOM_PM_FLOOR',
          material_name: 'Mat_Floor_PM_Balanced_Honey_Oak',
          style: 'Wide-Plank Balanced Honey Oak',
          global_bounds: { minX: 8, maxX: 16, minZ: 18, maxZ: 26 },
        },
        {
          zone_id: 'ROOM_CEO_FLOOR',
          material_name: 'Mat_Floor_CEO_Executive_Walnut_Oak',
          style: 'Wide-Plank Executive Walnut-Toned Oak',
          global_bounds: { minX: 16, maxX: 24, minZ: 18, maxZ: 26 },
        },
        {
          zone_id: 'ROOM_UIUX_FLOOR',
          material_name: 'Mat_Floor_UIUX_Light_Natural_Oak',
          style: 'Wide-Plank Light Natural Birch-Oak',
          global_bounds: { minX: 24, maxX: 32, minZ: 18, maxZ: 26 },
        },
        {
          zone_id: 'ROOM_ENGINEERING_FLOOR',
          material_name: 'Mat_Floor_Engineering_Refined_Medium_Oak',
          style: 'Wide-Plank Refined Medium Natural Oak',
          global_bounds: { minX: 0, maxX: 8, minZ: 0, maxZ: 16 },
        },
        {
          zone_id: 'ROOM_QA_DEVOPS_FLOOR',
          material_name: 'Mat_Floor_QADevOps_Warm_Elegant_Oak',
          style: 'Wide-Plank Warm Elegant Amber-Oak',
          global_bounds: { minX: 24, maxX: 32, minZ: 0, maxZ: 16 },
        },
      ],
    },
    wall_and_entrance_architecture: {
      standard_wall_height: 3.2,
      engineering_south_wall_repaired: true,
      engineering_east_hub_partition_repaired: true,
      engineering_west_exterior_wall_preserved: true,
      main_south_entrance_restored: true,
      main_entrance_global_center: [16, 0, 0],
      main_entrance_clear_width: 2.4,
      main_entrance_height: 3.2,
    },
    lighting_profile: {
      hemisphere_light: { sky: '#FFF6E8', ground: '#5C4738', intensity: 0.86 },
      key_directional_light: { color: '#FFF0D4', intensity: 1.55, position: [25.5, 24.0, 6.0] },
      fill_directional_light: { color: '#DBEAFE', intensity: 0.58, position: [-8.0, 12.0, -6.0] },
      central_hub_chandelier_light: { color: '#FFE4B5', intensity: 0.92, position: [16.0, 2.75, 8.0] },
    },
  };
}

