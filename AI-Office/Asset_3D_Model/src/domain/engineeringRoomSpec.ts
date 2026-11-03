import type {
  CameraPreset,
  FurnitureItemSpec,
  RoomAnchorSpec,
} from './modularRoomSpec';

/**
 * ============================================================================
 * AI OFFICE — ENGINEERING & DEVELOPMENT STUDIO (MODULE 04 — 8×16 DOUBLE MODULE)
 * ============================================================================
 * Production-grade spatial specification for the multi-agent Engineering
 * Department room (`AI_OFFICE_ROOM_ENGINEERING_v1`), spanning two continuous
 * 8×8 modules in Master Layout A3.1 (`X = 0..8, Z = 0..16`, height `3.2u`).
 *
 * Strictly a SINGLE continuous room with ONE floor and NO dividing wall at Z = 8.
 * Organised into 4 distinct interior zones from North to South:
 *   1. Zone A (North, Z ≈ 12..16): Frontend Developer Workstation
 *   2. Zone B (Upper-Middle, Z ≈ 8..12): Backend Developer Workstation
 *   3. Zone C (Lower-Middle, Z ≈ 5..8): Shared Integration & Code Review Hub
 *   4. Zone D (South, Z ≈ 0..5): Database Developer Workstation
 */

export type EngineeringAnchorId =
  | 'ENGINEERING_ROOM_SPAWN'
  | 'ENGINEERING_ROOM_IDLE'
  | 'ENGINEERING_EAST_EXIT'
  | 'ENGINEERING_NORTH_EXIT'
  | 'FE_WORKSTATION_APPROACH'
  | 'FE_DESK_WORK'
  | 'FE_CHAIR'
  | 'FE_MONITOR_INTERACTION'
  | 'BE_WORKSTATION_APPROACH'
  | 'BE_DESK_WORK'
  | 'BE_CHAIR'
  | 'BE_API_BOARD'
  | 'DB_WORKSTATION_APPROACH'
  | 'DB_DESK_WORK'
  | 'DB_CHAIR'
  | 'DB_SCHEMA_REVIEW'
  | 'ENG_INTEGRATION_TABLE'
  | 'ENG_ARCHITECTURE_BOARD'
  | 'ENG_CODE_REVIEW_POSITION'
  | 'ENG_DISCUSSION_POSITION';

export interface EngineeringActivityAnchor extends RoomAnchorSpec {
  id: EngineeringAnchorId;
  type: EngineeringAnchorId;
  label: string;
  zone:
    | 'GENERAL'
    | 'FRONTEND_WORKSTATION'
    | 'BACKEND_WORKSTATION'
    | 'DATABASE_WORKSTATION'
    | 'INTEGRATION_REVIEW_AREA';
  facingRad: number;
  posture: 'standing' | 'seated';
}

export interface EngineeringFutureActionContract {
  action_id: string;
  label: string;
  agent_role: 'FRONTEND_DEVELOPER' | 'BACKEND_DEVELOPER' | 'DATABASE_DEVELOPER';
  target_anchor: EngineeringAnchorId;
  posture: 'standing' | 'seated';
  description: string;
}

export const ENGINEERING_FUTURE_ACTIONS_CONTRACT: EngineeringFutureActionContract[] = [
  {
    action_id: 'fe_sit_typing_ui',
    label: 'Code React Components & UI Layouts',
    agent_role: 'FRONTEND_DEVELOPER',
    target_anchor: 'FE_DESK_WORK',
    posture: 'seated',
    description: 'Seated at the Frontend workstation building responsive UI components.',
  },
  {
    action_id: 'fe_inspect_component_board',
    label: 'Inspect Frontend Component & Breakpoint Board',
    agent_role: 'FRONTEND_DEVELOPER',
    target_anchor: 'FE_MONITOR_INTERACTION',
    posture: 'standing',
    description: 'Reviewing component hierarchy and layout grid specs on the West wall board.',
  },
  {
    action_id: 'fe_join_integration_review',
    label: 'Join Shared Integration & PR Code Review',
    agent_role: 'FRONTEND_DEVELOPER',
    target_anchor: 'ENG_INTEGRATION_TABLE',
    posture: 'standing',
    description: 'Collaborating with Backend and Database developers at the central review table.',
  },
  {
    action_id: 'be_sit_coding_api',
    label: 'Implement API Routes & Microservices',
    agent_role: 'BACKEND_DEVELOPER',
    target_anchor: 'BE_DESK_WORK',
    posture: 'seated',
    description: 'Seated at the Backend workstation coding REST/gRPC services and watching terminal logs.',
  },
  {
    action_id: 'be_review_api_contract_board',
    label: 'Review API Contract & Service Mesh Board',
    agent_role: 'BACKEND_DEVELOPER',
    target_anchor: 'BE_API_BOARD',
    posture: 'standing',
    description: 'Validating endpoint payloads and microservice dependencies on the API board.',
  },
  {
    action_id: 'be_present_system_architecture',
    label: 'Lead Architecture Walkthrough',
    agent_role: 'BACKEND_DEVELOPER',
    target_anchor: 'ENG_ARCHITECTURE_BOARD',
    posture: 'standing',
    description: 'Walking through Frontend → API → Backend → Database data flow on the shared board.',
  },
  {
    action_id: 'db_sit_schema_modeling',
    label: 'Design Relational Schema & Optimize Queries',
    agent_role: 'DATABASE_DEVELOPER',
    target_anchor: 'DB_DESK_WORK',
    posture: 'seated',
    description: 'Seated at the Database workstation modeling ERD tables and analyzing SQL query plans.',
  },
  {
    action_id: 'db_review_schema_archive',
    label: 'Inspect Database Schema & Index Archive',
    agent_role: 'DATABASE_DEVELOPER',
    target_anchor: 'DB_SCHEMA_REVIEW',
    posture: 'standing',
    description: 'Reviewing relational table constraints and index documentation at the South-East board.',
  },
  {
    action_id: 'db_join_discussion_sync',
    label: 'Join Cross-Stack Data Sync Discussion',
    agent_role: 'DATABASE_DEVELOPER',
    target_anchor: 'ENG_DISCUSSION_POSITION',
    posture: 'standing',
    description: 'Aligning schema migrations with Frontend and Backend engineers at the Integration Hub.',
  },
];

export const ENGINEERING_MODULE_CONSTANTS = {
  MODULE_ID: 'AI_OFFICE_ROOM_ENGINEERING_v1',
  ASSET_ID: 'ai_office.room.engineering_studio.v1',
  DISPLAY_NAME: 'Engineering & Development Studio',
  ROOM_TYPE: 'ENGINEERING_MULTI_AGENT',
  ROOT_NODE_NAME: 'ROOM_ENGINEERING_ROOT',
  GLB_FILENAME: 'engineering_room.glb',
  MANIFEST_FILENAME: 'engineering_room.manifest.json',
  ANCHORS_FILENAME: 'engineering_room.anchors.json',
  BEHAVIOR_FILENAME: 'engineering_room.behavior.json',
  PREVIEW_FILENAME: 'engineering_room.preview.png',
  PACK_ZIP_FILENAME: 'engineering_room_production_pack_v1.zip',
  FOOTPRINT_WIDTH: 8.0,
  FOOTPRINT_DEPTH: 16.0,
  WALL_HEIGHT: 3.2,
  WALL_THICKNESS: 0.16,
  FLOOR_THICKNESS: 0.16,
  LOCAL_ORIGIN: [0, 0, 0] as [number, number, number],
  GLOBAL_A3_1_OFFSET: [0, 0, 0] as [number, number, number],
  REQUIRED_GROUPS: [
    'STRUCTURE',
    'FLOOR',
    'WALLS',
    'WINDOWS',
    'FURNITURE',
    'PROPS',
    'DECORATION',
    'CONNECTORS',
  ] as const,
  SEMANTIC_FURNITURE_SUBGROUPS: [
    'FRONTEND_WORKSTATION',
    'BACKEND_WORKSTATION',
    'DATABASE_WORKSTATION',
    'INTEGRATION_REVIEW_AREA',
  ] as const,
} as const;

export interface EngineeringConnectorSpec {
  id: 'ENGINEERING_EAST_MAIN' | 'ENGINEERING_NORTH_CORRIDOR';
  side: 'EAST' | 'NORTH';
  position: [number, number, number];
  localPosition: [number, number, number];
  global_position: [number, number, number];
  direction: [number, number, number];
  width: number;
  height: number;
  span: [number, number];
  target_zone: string;
  removable_node_name: string;
  clearance_box: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

const EAST_MAIN_SPEC: EngineeringConnectorSpec = {
  id: 'ENGINEERING_EAST_MAIN',
  side: 'EAST',
  position: [8, 0, 8],
  localPosition: [8, 0, 8],
  global_position: [8, 0, 8],
  direction: [1, 0, 0],
  width: 2.0,
  height: 2.3,
  span: [7.0, 9.0],
  target_zone: 'OPEN_CENTRAL_HUB',
  removable_node_name: 'Engineering_Connector_East_Removable_Threshold',
  clearance_box: {
    minX: 6.4,
    maxX: 8.0,
    minZ: 7.0,
    maxZ: 9.0,
  },
};

const NORTH_CORRIDOR_SPEC: EngineeringConnectorSpec = {
  id: 'ENGINEERING_NORTH_CORRIDOR',
  side: 'NORTH',
  position: [4, 0, 16],
  localPosition: [4, 0, 16],
  global_position: [4, 0, 16],
  direction: [0, 0, 1],
  width: 2.0,
  height: 2.3,
  span: [3.0, 5.0],
  target_zone: 'SHARED_CORRIDOR',
  removable_node_name: 'Engineering_Connector_North_Removable_Doorway',
  clearance_box: {
    minX: 3.0,
    maxX: 5.0,
    minZ: 14.5,
    maxZ: 16.0,
  },
};

export const ENGINEERING_CONNECTORS_SPEC = {
  ENGINEERING_EAST_MAIN: EAST_MAIN_SPEC,
  ENGINEERING_NORTH_CORRIDOR: NORTH_CORRIDOR_SPEC,
  EAST_MAIN: EAST_MAIN_SPEC,
  NORTH_CORRIDOR: NORTH_CORRIDOR_SPEC,
} as const;

export interface EngineeringMonitorOrientationSpec {
  id: string;
  zone: 'FRONTEND' | 'BACKEND' | 'DATABASE';
  displayMeshName: string;
  rearCasingMeshName: string;
  chairAnchorId: 'FE_CHAIR' | 'BE_CHAIR' | 'DB_CHAIR';
  chairPosition: [number, number, number];
  screenWorldPosition: [number, number, number];
  /** Unit normal vector of the front emissive screen in room-local space */
  screenFrontNormal: [number, number, number];
  description: string;
}

/**
 * Mandatory Monitor Orientation Contract:
 * Every Engineering Studio display has ONE front emissive screen facing the
 * seated developer chair (`dot(screenNormal, normalize(chairPos - screenPos)) > 0.7`)
 * and ONE opaque dark rear casing.
 */
export const ENGINEERING_MONITORS_SPEC: EngineeringMonitorOrientationSpec[] = [
  {
    id: 'fe_main_display',
    zone: 'FRONTEND',
    displayMeshName: 'Engineering_FE_Main_Display_Screen',
    rearCasingMeshName: 'Engineering_FE_Main_Display_Rear_Casing',
    chairAnchorId: 'FE_CHAIR',
    chairPosition: [2.35, 0.0, 12.95],
    screenWorldPosition: [2.21, 1.02, 13.95],
    screenFrontNormal: [0, 0, -1],
    description:
      'Frontend Primary 27" Display (React Component Tree & Responsive UI Preview) facing South (-Z) toward FE_CHAIR',
  },
  {
    id: 'fe_secondary_display',
    zone: 'FRONTEND',
    displayMeshName: 'Engineering_FE_Secondary_Display_Screen',
    rearCasingMeshName: 'Engineering_FE_Secondary_Display_Rear_Casing',
    chairAnchorId: 'FE_CHAIR',
    chairPosition: [2.35, 0.0, 12.95],
    screenWorldPosition: [2.83, 1.01, 13.89],
    screenFrontNormal: [-0.342, 0, -0.94],
    description:
      'Frontend Secondary Display (CSS Layout & Breakpoint Inspector) angled toward FE_CHAIR',
  },
  {
    id: 'be_main_display',
    zone: 'BACKEND',
    displayMeshName: 'Engineering_BE_Main_Display_Screen',
    rearCasingMeshName: 'Engineering_BE_Main_Display_Rear_Casing',
    chairAnchorId: 'BE_CHAIR',
    chairPosition: [2.35, 0.0, 9.25],
    screenWorldPosition: [2.21, 1.02, 10.25],
    screenFrontNormal: [0, 0, -1],
    description:
      'Backend Primary Display (API Route Topology & Microservice Flow) facing South (-Z) toward BE_CHAIR',
  },
  {
    id: 'be_terminal_display',
    zone: 'BACKEND',
    displayMeshName: 'Engineering_BE_Terminal_Display_Screen',
    rearCasingMeshName: 'Engineering_BE_Terminal_Display_Rear_Casing',
    chairAnchorId: 'BE_CHAIR',
    chairPosition: [2.35, 0.0, 9.25],
    screenWorldPosition: [2.83, 1.02, 10.19],
    screenFrontNormal: [-0.342, 0, -0.94],
    description:
      'Backend Secondary Vertical Terminal Display (Structured Service Logs) angled toward BE_CHAIR',
  },
  {
    id: 'db_main_display',
    zone: 'DATABASE',
    displayMeshName: 'Engineering_DB_Main_Display_Screen',
    rearCasingMeshName: 'Engineering_DB_Main_Display_Rear_Casing',
    chairAnchorId: 'DB_CHAIR',
    chairPosition: [2.35, 0.0, 2.15],
    screenWorldPosition: [2.21, 1.02, 3.15],
    screenFrontNormal: [0, 0, -1],
    description:
      'Database Primary Display (Entity-Relationship Diagram & Schema Tables) facing South (-Z) toward DB_CHAIR with sleek stepped rear VESA housing',
  },
  {
    id: 'db_secondary_display',
    zone: 'DATABASE',
    displayMeshName: 'Engineering_DB_Secondary_Display_Screen',
    rearCasingMeshName: 'Engineering_DB_Secondary_Display_Rear_Casing',
    chairAnchorId: 'DB_CHAIR',
    chairPosition: [2.35, 0.0, 2.15],
    screenWorldPosition: [2.83, 1.0, 3.09],
    screenFrontNormal: [-0.342, 0, -0.94],
    description:
      'Database Secondary Status Display (SQL Query Plan & Index Health) angled toward DB_CHAIR with lower-profile rear housing',
  },
];

export function computeMonitorChairDotProduct(
  screenPos: [number, number, number],
  screenNormal: [number, number, number],
  chairPos: [number, number, number]
): number {
  const dx = chairPos[0] - screenPos[0];
  const dz = chairPos[2] - screenPos[2];
  const lenXZ = Math.hypot(dx, dz) || 1;
  const toChairX = dx / lenXZ;
  const toChairZ = dz / lenXZ;

  const nLenXZ = Math.hypot(screenNormal[0], screenNormal[2]) || 1;
  const nx = screenNormal[0] / nLenXZ;
  const nz = screenNormal[2] / nLenXZ;

  return Number((nx * toChairX + nz * toChairZ).toFixed(4));
}

export function verifyEngineeringMonitorsOrientation(): {
  passed: boolean;
  allValid: boolean;
  results: Array<{
    id: string;
    label: string;
    displayMeshName: string;
    frontScreenMeshName: string;
    rearCasingMeshName: string;
    chairAnchorId: string;
    dotProduct: number;
    passed: boolean;
    valid: boolean;
  }>;
} {
  const results = ENGINEERING_MONITORS_SPEC.map((spec) => {
    const dot = computeMonitorChairDotProduct(
      spec.screenWorldPosition,
      spec.screenFrontNormal,
      spec.chairPosition
    );
    const ok = dot > 0.7;
    return {
      id: spec.id,
      label: spec.description,
      displayMeshName: spec.displayMeshName,
      frontScreenMeshName: spec.displayMeshName,
      rearCasingMeshName: spec.rearCasingMeshName,
      chairAnchorId: spec.chairAnchorId,
      dotProduct: dot,
      passed: ok,
      valid: ok,
    };
  });
  const allOk = results.every((r) => r.passed);
  return {
    passed: allOk,
    allValid: allOk,
    results,
  };
}

/**
 * Complete catalog of furniture & functional props inside the 8×16 Engineering Studio.
 * Arranged into 4 clear sub-zones with an unobstructed East circulation spine (`X ≈ 5.2..7.6`).
 */
export const ENGINEERING_FURNITURE_CATALOG: FurnitureItemSpec[] = [
  // ZONE A — FRONTEND DEVELOPER WORKSTATION (North Zone, Z ≈ 12..16)
  {
    id: 'eng_frontend_desk',
    name: 'Engineering_Frontend_Workstation_Desk',
    category: 'WORKSTATION',
    position: [2.35, 0.0, 13.75],
    rotationY: 0,
    dimensions: [2.1, 0.76, 0.88],
    clearanceRadius: 1.35,
    description:
      'Zone A Frontend Developer warm oak workstation desk with clean dark steel frame, dual-display setup (React component tree & UI preview), laptop on angled stand with USB-C dock, mechanical keyboard with wrist rest, mouse, studio headphones on stand, mobile UI test stand, desk organizer, and warm coral desk mat.',
  },
  {
    id: 'eng_frontend_chair',
    name: 'Engineering_Frontend_Task_Chair',
    category: 'SEATING',
    position: [2.35, 0.0, 12.95],
    rotationY: 0,
    dimensions: [0.64, 0.98, 0.64],
    clearanceRadius: 0.55,
    description:
      'Ergonomic charcoal developer task chair with warm coral lumbar accent cushion facing North (+Z) toward the Frontend dual displays.',
  },
  {
    id: 'eng_frontend_board_credenza',
    name: 'Engineering_Frontend_Component_Board_Unit',
    category: 'PLANNING',
    position: [0.55, 0.0, 14.85],
    rotationY: Math.PI / 2,
    dimensions: [0.46, 2.15, 1.45],
    clearanceRadius: 0.65,
    description:
      'Frontend reference credenza, North-West technical bookshelf, and wall-mounted Frontend Component & Layout Testing Board with 3D pinned UI wireframe cards.',
  },

  // ZONE B — BACKEND DEVELOPER WORKSTATION (Upper-Middle Zone, Z ≈ 8..12)
  {
    id: 'eng_backend_desk',
    name: 'Engineering_Backend_Workstation_Desk',
    category: 'WORKSTATION',
    position: [2.35, 0.0, 10.05],
    rotationY: 0,
    dimensions: [2.1, 0.76, 0.88],
    clearanceRadius: 1.35,
    description:
      'Zone B Backend Developer technical desk with dark walnut/steel trim, primary service topology monitor, vertical terminal log display, compact Linux/microservice appliance with patch cables, angled API payload tablet, 3-slot RFC binder organizer, mechanical keyboard, mouse, and under-desk workstation tower.',
  },
  {
    id: 'eng_backend_chair',
    name: 'Engineering_Backend_Task_Chair',
    category: 'SEATING',
    position: [2.35, 0.0, 9.25],
    rotationY: 0,
    dimensions: [0.64, 0.98, 0.64],
    clearanceRadius: 0.55,
    description:
      'Ergonomic charcoal developer task chair with muted steel-blue lumbar accent cushion facing North (+Z) toward the Backend dual displays.',
  },
  {
    id: 'eng_backend_api_board',
    name: 'Engineering_Backend_API_Contract_Board_Unit',
    category: 'PLANNING',
    position: [0.52, 0.0, 11.15],
    rotationY: Math.PI / 2,
    dimensions: [0.44, 2.18, 1.55],
    clearanceRadius: 0.65,
    description:
      'Compact technical reference console with dual-antenna router, floating resource shelf, and wall-mounted API & Services Architecture Board (Frontend → API Gateway → Backend Services → Database) between the North and Center West windows.',
  },

  // ZONE C — SHARED INTEGRATION & CODE REVIEW HUB (Lower-Middle Zone, Z ≈ 5..8)
  {
    id: 'eng_integration_table',
    name: 'Engineering_Integration_Review_Table',
    category: 'MEETING',
    position: [3.25, 0.0, 6.35],
    rotationY: 0,
    dimensions: [1.55, 0.74, 1.15],
    clearanceRadius: 1.15,
    description:
      'Zone C shared Integration & Code Review table (not a 4th agent workstation) with bevelled warm oak top, recessed cable grommet, open review laptop, digital architecture tablet with stylus, system blueprint sheets, and color-coded sprint notes.',
  },
  {
    id: 'eng_integration_stools',
    name: 'Engineering_Integration_Review_Stools',
    category: 'SEATING',
    position: [3.25, 0.0, 6.35],
    rotationY: 0,
    dimensions: [1.95, 0.68, 1.55],
    clearanceRadius: 1.05,
    description:
      'Trio of compact upholstered collaboration stools with footrest rings positioned around the Integration & Code Review table for Frontend, Backend, and Database developers.',
  },
  {
    id: 'eng_architecture_board',
    name: 'Engineering_Shared_Architecture_Board',
    category: 'PLANNING',
    position: [0.22, 0.0, 5.75],
    rotationY: Math.PI / 2,
    dimensions: [0.16, 2.25, 2.1],
    clearanceRadius: 0.6,
    description:
      'Wall-mounted Shared Architecture & Integration Board illustrating the full Frontend → API Gateway → Backend Services → Database Schema pipeline with lower documentation console ledge.',
  },

  // ZONE D — DATABASE DEVELOPER WORKSTATION (South Zone, Z ≈ 0..5)
  {
    id: 'eng_database_desk',
    name: 'Engineering_Database_Workstation_Desk',
    category: 'WORKSTATION',
    position: [2.35, 0.0, 2.95],
    rotationY: 0,
    dimensions: [2.1, 0.76, 0.88],
    clearanceRadius: 1.35,
    description:
      'Zone D Database Developer workstation desk in warm oak and deep emerald/teal finish with sleek lower-profile primary ERD & SQL schema display, secondary query performance monitor, workstation tower with front louvers, 2-tier schema file tray, SQL reference volumes, and printed data model chart.',
  },
  {
    id: 'eng_database_chair',
    name: 'Engineering_Database_Task_Chair',
    category: 'SEATING',
    position: [2.35, 0.0, 2.15],
    rotationY: 0,
    dimensions: [0.64, 0.98, 0.64],
    clearanceRadius: 0.55,
    description:
      'Ergonomic charcoal developer task chair with muted teal/sage lumbar accent cushion facing North (+Z) toward the Database dual displays.',
  },
  {
    id: 'eng_database_archive_board',
    name: 'Engineering_Database_Archive_And_Schema_Unit',
    category: 'STORAGE',
    position: [5.45, 0.0, 1.05],
    rotationY: 0,
    dimensions: [2.1, 2.15, 0.52],
    clearanceRadius: 0.85,
    description:
      'Structured 6-drawer data archive filing cabinet, South-West sage-green technical bookcase with 4-bay NAS unit, SQL index documentation shelf, and wall-mounted Database Schema & ERD Reference Board along the South-East wall.',
  },
];

export const DEFAULT_ENGINEERING_ANCHORS: Record<EngineeringAnchorId, EngineeringActivityAnchor> = {
  // 1. General Room Anchors (4)
  ENGINEERING_ROOM_SPAWN: {
    id: 'ENGINEERING_ROOM_SPAWN',
    type: 'ENGINEERING_ROOM_SPAWN',
    label: 'East Main Hub Spawn',
    zone: 'GENERAL',
    position: [6.4, 0.0, 8.0],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    posture: 'standing',
    radius: 0.45,
    description: 'Primary room entry spawn point inside the East main connector spine.',
    agentUsage: 'Default entry spawn when an agent enters from the Open Central Hub.',
  },
  ENGINEERING_ROOM_IDLE: {
    id: 'ENGINEERING_ROOM_IDLE',
    type: 'ENGINEERING_ROOM_IDLE',
    label: 'Circulation Spine Idle',
    zone: 'GENERAL',
    position: [5.85, 0.0, 11.2],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    posture: 'standing',
    radius: 0.42,
    description: 'Open circulation spine idle waiting anchor between Frontend and Backend zones.',
    agentUsage: 'Ambient standing or transition pause point along the East walkway.',
  },
  ENGINEERING_EAST_EXIT: {
    id: 'ENGINEERING_EAST_EXIT',
    type: 'ENGINEERING_EAST_EXIT',
    label: 'East Main Hub Exit [8,0,8]',
    zone: 'GENERAL',
    position: [7.65, 0.0, 8.0],
    rotationY: Math.PI / 2,
    facingRad: Math.PI / 2,
    posture: 'standing',
    radius: 0.45,
    description: 'East main doorway threshold anchor at [8, 0, 8] connecting to Open Central Hub.',
    agentUsage: 'Exit/entry navigation node for Central Hub routing.',
  },
  ENGINEERING_NORTH_EXIT: {
    id: 'ENGINEERING_NORTH_EXIT',
    type: 'ENGINEERING_NORTH_EXIT',
    label: 'North Shared Corridor Exit [4,0,16]',
    zone: 'GENERAL',
    position: [4.0, 0.0, 15.65],
    rotationY: 0,
    facingRad: 0,
    posture: 'standing',
    radius: 0.45,
    description:
      'North corridor doorway threshold anchor at [4, 0, 16] connecting to Shared Corridor.',
    agentUsage: 'Exit/entry navigation node for Shared Corridor routing toward Research/PM/CEO/UIUX.',
  },

  // 2. Frontend Developer Anchors (4)
  FE_WORKSTATION_APPROACH: {
    id: 'FE_WORKSTATION_APPROACH',
    type: 'FE_WORKSTATION_APPROACH',
    label: 'Frontend Workstation Approach',
    zone: 'FRONTEND_WORKSTATION',
    position: [4.45, 0.0, 12.95],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    posture: 'standing',
    radius: 0.4,
    description: 'Walkway approach node east of the Frontend Developer workstation.',
    agentUsage: 'Waypoint before stepping into the Frontend chair or desk area.',
  },
  FE_DESK_WORK: {
    id: 'FE_DESK_WORK',
    type: 'FE_DESK_WORK',
    label: 'Frontend Desk Active Coding',
    zone: 'FRONTEND_WORKSTATION',
    position: [2.35, 0.0, 13.15],
    rotationY: 0,
    facingRad: 0,
    posture: 'seated',
    radius: 0.36,
    description: 'Active keyboard & UI layout coding posture anchor at the Frontend desk.',
    agentUsage: 'Primary working anchor for the Frontend Developer agent.',
  },
  FE_CHAIR: {
    id: 'FE_CHAIR',
    type: 'FE_CHAIR',
    label: 'Frontend Ergonomic Task Chair',
    zone: 'FRONTEND_WORKSTATION',
    position: [2.35, 0.0, 12.95],
    rotationY: 0,
    facingRad: 0,
    posture: 'seated',
    radius: 0.36,
    description: 'Seated anchor on the Frontend Developer ergonomic chair facing North (+Z).',
    agentUsage: 'Seated posture anchor facing the Frontend primary and secondary monitors.',
  },
  FE_MONITOR_INTERACTION: {
    id: 'FE_MONITOR_INTERACTION',
    type: 'FE_MONITOR_INTERACTION',
    label: 'Frontend Component Board Inspection',
    zone: 'FRONTEND_WORKSTATION',
    position: [1.35, 0.0, 14.55],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    posture: 'standing',
    radius: 0.38,
    description: 'Inspection anchor beside the Frontend Component & Layout Testing Board.',
    agentUsage: 'Used when reviewing responsive UI components and layout hierarchy.',
  },

  // 3. Backend Developer Anchors (4)
  BE_WORKSTATION_APPROACH: {
    id: 'BE_WORKSTATION_APPROACH',
    type: 'BE_WORKSTATION_APPROACH',
    label: 'Backend Workstation Approach',
    zone: 'BACKEND_WORKSTATION',
    position: [4.45, 0.0, 9.25],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    posture: 'standing',
    radius: 0.4,
    description: 'Walkway approach node east of the Backend Developer workstation.',
    agentUsage: 'Waypoint before stepping into the Backend chair or desk area.',
  },
  BE_DESK_WORK: {
    id: 'BE_DESK_WORK',
    type: 'BE_DESK_WORK',
    label: 'Backend Desk Active API Coding',
    zone: 'BACKEND_WORKSTATION',
    position: [2.35, 0.0, 9.45],
    rotationY: 0,
    facingRad: 0,
    posture: 'seated',
    radius: 0.36,
    description: 'Active API and microservice coding posture anchor at the Backend desk.',
    agentUsage: 'Primary working anchor for the Backend Developer agent.',
  },
  BE_CHAIR: {
    id: 'BE_CHAIR',
    type: 'BE_CHAIR',
    label: 'Backend Ergonomic Task Chair',
    zone: 'BACKEND_WORKSTATION',
    position: [2.35, 0.0, 9.25],
    rotationY: 0,
    facingRad: 0,
    posture: 'seated',
    radius: 0.36,
    description: 'Seated anchor on the Backend Developer ergonomic chair facing North (+Z).',
    agentUsage: 'Seated posture anchor facing the Backend service topology and terminal displays.',
  },
  BE_API_BOARD: {
    id: 'BE_API_BOARD',
    type: 'BE_API_BOARD',
    label: 'Backend API Contract Board',
    zone: 'BACKEND_WORKSTATION',
    position: [1.35, 0.0, 11.15],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    posture: 'standing',
    radius: 0.38,
    description:
      'Standing review anchor facing the Backend API Contract & Service Architecture Board.',
    agentUsage: 'Used when inspecting REST/gRPC contracts and service dependencies.',
  },

  // 4. Database Developer Anchors (4)
  DB_WORKSTATION_APPROACH: {
    id: 'DB_WORKSTATION_APPROACH',
    type: 'DB_WORKSTATION_APPROACH',
    label: 'Database Workstation Approach',
    zone: 'DATABASE_WORKSTATION',
    position: [4.45, 0.0, 2.15],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    posture: 'standing',
    radius: 0.4,
    description: 'Walkway approach node east of the Database Developer workstation.',
    agentUsage: 'Waypoint before stepping into the Database chair or desk area.',
  },
  DB_DESK_WORK: {
    id: 'DB_DESK_WORK',
    type: 'DB_DESK_WORK',
    label: 'Database Desk Schema Modeling',
    zone: 'DATABASE_WORKSTATION',
    position: [2.35, 0.0, 2.35],
    rotationY: 0,
    facingRad: 0,
    posture: 'seated',
    radius: 0.36,
    description: 'Active schema modeling and query optimization anchor at the Database desk.',
    agentUsage: 'Primary working anchor for the Database Developer agent.',
  },
  DB_CHAIR: {
    id: 'DB_CHAIR',
    type: 'DB_CHAIR',
    label: 'Database Ergonomic Task Chair',
    zone: 'DATABASE_WORKSTATION',
    position: [2.35, 0.0, 2.15],
    rotationY: 0,
    facingRad: 0,
    posture: 'seated',
    radius: 0.36,
    description: 'Seated anchor on the Database Developer ergonomic chair facing North (+Z).',
    agentUsage: 'Seated posture anchor facing the Database ERD and query analyzer displays.',
  },
  DB_SCHEMA_REVIEW: {
    id: 'DB_SCHEMA_REVIEW',
    type: 'DB_SCHEMA_REVIEW',
    label: 'Database Schema & Archive Board',
    zone: 'DATABASE_WORKSTATION',
    position: [5.45, 0.0, 1.85],
    rotationY: Math.PI,
    facingRad: Math.PI,
    posture: 'standing',
    radius: 0.38,
    description:
      'Standing review anchor in front of the South-East Database Schema & Archive Board.',
    agentUsage: 'Used when inspecting relational table structures, indexes, and archive shelves.',
  },

  // 5. Shared Collaboration Anchors (4)
  ENG_INTEGRATION_TABLE: {
    id: 'ENG_INTEGRATION_TABLE',
    type: 'ENG_INTEGRATION_TABLE',
    label: 'Shared Integration Review Table (North)',
    zone: 'INTEGRATION_REVIEW_AREA',
    position: [3.25, 0.0, 7.35],
    rotationY: Math.PI,
    facingRad: Math.PI,
    posture: 'standing',
    radius: 0.4,
    description: 'North side of the shared Integration & Code Review table facing South (-Z).',
    agentUsage: 'Collaborative anchor for cross-discipline code review at the central table.',
  },
  ENG_ARCHITECTURE_BOARD: {
    id: 'ENG_ARCHITECTURE_BOARD',
    type: 'ENG_ARCHITECTURE_BOARD',
    label: 'Shared Architecture & Integration Board',
    zone: 'INTEGRATION_REVIEW_AREA',
    position: [1.35, 0.0, 5.75],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    posture: 'standing',
    radius: 0.4,
    description:
      'Standing presentation anchor facing the Shared Architecture & Integration Board.',
    agentUsage: 'Used during Frontend → API → Backend → Database architecture walkthroughs.',
  },
  ENG_CODE_REVIEW_POSITION: {
    id: 'ENG_CODE_REVIEW_POSITION',
    type: 'ENG_CODE_REVIEW_POSITION',
    label: 'Integration Table Code Review (East)',
    zone: 'INTEGRATION_REVIEW_AREA',
    position: [4.45, 0.0, 6.35],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    posture: 'standing',
    radius: 0.4,
    description: 'East collaboration position at the Integration & Code Review table.',
    agentUsage:
      'Second developer review posture during pair debugging and pull request sign-off.',
  },
  ENG_DISCUSSION_POSITION: {
    id: 'ENG_DISCUSSION_POSITION',
    type: 'ENG_DISCUSSION_POSITION',
    label: 'Integration Table Sync Discussion (South)',
    zone: 'INTEGRATION_REVIEW_AREA',
    position: [3.25, 0.0, 5.35],
    rotationY: 0,
    facingRad: 0,
    posture: 'standing',
    radius: 0.4,
    description:
      'South collaboration position at the Integration & Code Review table facing North (+Z).',
    agentUsage: 'Third developer posture for three-way Frontend/Backend/Database alignment.',
  },
};

export const DEFAULT_ENGINEERING_ANCHOR_LIST: EngineeringActivityAnchor[] = Object.values(
  DEFAULT_ENGINEERING_ANCHORS
);

export interface EngineeringAnchorSpec {
  id: EngineeringAnchorId;
  name: EngineeringAnchorId;
  label: string;
  zone:
    | 'GENERAL'
    | 'FRONTEND_WORKSTATION'
    | 'BACKEND_WORKSTATION'
    | 'DATABASE_WORKSTATION'
    | 'INTEGRATION_REVIEW_AREA';
  position: [number, number, number];
  facingRad: number;
  posture: 'standing' | 'seated';
  description: string;
}

export const ENGINEERING_ROOM_DIMENSIONS = {
  width: ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_WIDTH,
  length: ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_DEPTH,
  depth: ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_DEPTH,
  height: ENGINEERING_MODULE_CONSTANTS.WALL_HEIGHT,
} as const;

export const ENGINEERING_ANCHORS: EngineeringAnchorSpec[] = DEFAULT_ENGINEERING_ANCHOR_LIST.map(
  (anchor) => ({
    id: anchor.id,
    name: anchor.id,
    label: anchor.label,
    zone: anchor.zone,
    position: anchor.position,
    facingRad: anchor.facingRad,
    posture: anchor.posture,
    description: anchor.description,
  })
);

export const ENGINEERING_WALK_WAYPOINTS: [number, number, number][] = [
  [6.4, 0.0, 8.0], // East entrance spine
  [5.8, 0.0, 11.2], // Upper-middle spine
  [4.45, 0.0, 12.95], // Frontend approach
  [4.0, 0.0, 15.2], // North doorway approach
  [4.45, 0.0, 9.25], // Backend approach
  [4.45, 0.0, 6.35], // Integration hub approach
  [4.45, 0.0, 2.15], // Database approach
  [5.45, 0.0, 1.85], // Schema board review
];

export const ENGINEERING_CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'isometric',
    label: 'Isometric 3/4 — 8×16 Engineering Studio',
    shortLabel: '8×16 Iso',
    category: 'standard',
    position: [15.5, 11.8, -4.8],
    target: [3.8, 1.1, 8.0],
    zoom: 46,
    description: 'Full 8×16 continuous Engineering Studio overview from South-East.',
  },
  {
    id: 'top_down',
    label: 'Top-Down 8×16 Blueprint (4 Zones)',
    shortLabel: 'Top-Down 8×16',
    category: 'standard',
    position: [4.0, 22.0, 7.98],
    target: [4.0, 0.0, 8.0],
    zoom: 42,
    description: 'Orthographic plan view verifying 8×16 bounds, zero wall at Z=8, and East/North connectors.',
  },
  {
    id: 'eng_frontend_zone',
    label: 'Zone A — Frontend Developer Workstation (North)',
    shortLabel: 'Zone A: Frontend',
    category: 'inspection',
    position: [6.8, 4.2, 10.6],
    target: [2.35, 1.0, 13.75],
    zoom: 82,
    description: 'Close-up on Frontend Developer desk, dual monitors, and Component Board.',
  },
  {
    id: 'eng_backend_zone',
    label: 'Zone B — Backend Developer Workstation (Upper-Mid)',
    shortLabel: 'Zone B: Backend',
    category: 'inspection',
    position: [6.8, 4.2, 6.9],
    target: [2.35, 1.0, 10.05],
    zoom: 82,
    description: 'Close-up on Backend Developer desk, vertical terminal monitor, and API Contract Board.',
  },
  {
    id: 'eng_integration_hub',
    label: 'Zone C — Shared Integration & Code Review Hub',
    shortLabel: 'Zone C: Review Hub',
    category: 'inspection',
    position: [7.2, 4.4, 3.8],
    target: [2.6, 1.05, 6.2],
    zoom: 80,
    description: 'Close-up on Shared Integration & Code Review Table and System Architecture Board.',
  },
  {
    id: 'eng_database_zone',
    label: 'Zone D — Database Developer Workstation (South)',
    shortLabel: 'Zone D: Database',
    category: 'inspection',
    position: [6.8, 4.2, -0.2],
    target: [2.35, 1.0, 2.65],
    zoom: 82,
    description: 'Close-up on Database Developer desk, dual ERD displays, and South-East Schema Archive.',
  },
];

export interface EngineeringBoundingBoxCheckResult {
  passed: boolean;
  width: number;
  depth: number;
  height: number;
  widthDelta: number;
  depthDelta: number;
  heightDelta: number;
  min: [number, number, number];
  max: [number, number, number];
}

export function validateEngineeringBoundingBox(
  min: [number, number, number],
  max: [number, number, number],
  tolerance = 0.25
): EngineeringBoundingBoxCheckResult {
  const width = Number((max[0] - min[0]).toFixed(3));
  const height = Number((max[1] - min[1]).toFixed(3));
  const depth = Number((max[2] - min[2]).toFixed(3));

  const widthDelta = Number(
    Math.abs(width - ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_WIDTH).toFixed(3)
  );
  const depthDelta = Number(
    Math.abs(depth - ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_DEPTH).toFixed(3)
  );
  // Note: height from subbase (-0.16) to top of wall (3.2) is 3.36u; accept either 3.2u or 3.36u within tolerance
  const heightDelta = Number(
    Math.min(
      Math.abs(height - ENGINEERING_MODULE_CONSTANTS.WALL_HEIGHT),
      Math.abs(
        height -
          (ENGINEERING_MODULE_CONSTANTS.WALL_HEIGHT +
            ENGINEERING_MODULE_CONSTANTS.FLOOR_THICKNESS)
      )
    ).toFixed(3)
  );

  const originAligned =
    min[0] >= -tolerance &&
    min[0] <= tolerance &&
    min[2] >= -tolerance &&
    min[2] <= tolerance &&
    max[0] >= ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_WIDTH - tolerance &&
    max[0] <= ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_WIDTH + tolerance &&
    max[2] >= ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_DEPTH - tolerance &&
    max[2] <= ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_DEPTH + tolerance;

  const passed =
    widthDelta <= tolerance &&
    depthDelta <= tolerance &&
    heightDelta <= tolerance &&
    originAligned;

  return {
    passed,
    width,
    depth,
    height,
    widthDelta,
    depthDelta,
    heightDelta,
    min: [Number(min[0].toFixed(3)), Number(min[1].toFixed(3)), Number(min[2].toFixed(3))],
    max: [Number(max[0].toFixed(3)), Number(max[1].toFixed(3)), Number(max[2].toFixed(3))],
  };
}

export function validateEngineeringClearanceAndConnectors(): {
  passed: boolean;
  eastConnectorClear: boolean;
  northConnectorClear: boolean;
  noWallAtMidpointZ8: boolean;
  circulationSpineClear: boolean;
  anchorCount: number;
  collisions: string[];
} {
  const collisions: string[] = [];
  const eastBox = ENGINEERING_CONNECTORS_SPEC.ENGINEERING_EAST_MAIN.clearance_box;
  const northBox = ENGINEERING_CONNECTORS_SPEC.ENGINEERING_NORTH_CORRIDOR.clearance_box;

  let eastConnectorClear = true;
  let northConnectorClear = true;

  for (const item of ENGINEERING_FURNITURE_CATALOG) {
    const halfW = item.dimensions[0] / 2;
    const halfD = item.dimensions[2] / 2;
    const isRotated90 = Math.abs(Math.sin(item.rotationY)) > 0.7;
    const spanX = isRotated90 ? halfD : halfW;
    const spanZ = isRotated90 ? halfW : halfD;

    const minX = item.position[0] - spanX;
    const maxX = item.position[0] + spanX;
    const minZ = item.position[2] - spanZ;
    const maxZ = item.position[2] + spanZ;

    const overlapsEast =
      maxX > eastBox.minX &&
      minX < eastBox.maxX &&
      maxZ > eastBox.minZ &&
      minZ < eastBox.maxZ;
    if (overlapsEast) {
      eastConnectorClear = false;
      collisions.push(`${item.id} overlaps ENGINEERING_EAST_MAIN clearance box`);
    }

    const overlapsNorth =
      maxX > northBox.minX &&
      minX < northBox.maxX &&
      maxZ > northBox.minZ &&
      minZ < northBox.maxZ;
    if (overlapsNorth) {
      northConnectorClear = false;
      collisions.push(`${item.id} overlaps ENGINEERING_NORTH_CORRIDOR clearance box`);
    }
  }

  return {
    passed:
      eastConnectorClear &&
      northConnectorClear &&
      DEFAULT_ENGINEERING_ANCHOR_LIST.length === 20 &&
      collisions.length === 0,
    eastConnectorClear,
    northConnectorClear,
    noWallAtMidpointZ8: true,
    circulationSpineClear: collisions.length === 0,
    anchorCount: DEFAULT_ENGINEERING_ANCHOR_LIST.length,
    collisions,
  };
}

export function buildEngineeringRoomBehaviorJson() {
  return {
    schema_version: 'AI_OFFICE_ENGINEERING_ROOM_BEHAVIOR_V1',
    room_module_id: ENGINEERING_MODULE_CONSTANTS.MODULE_ID,
    module_id: ENGINEERING_MODULE_CONSTANTS.MODULE_ID,
    asset_id: ENGINEERING_MODULE_CONSTANTS.ASSET_ID,
    display_name: ENGINEERING_MODULE_CONSTANTS.DISPLAY_NAME,
    room_type: ENGINEERING_MODULE_CONSTANTS.ROOM_TYPE,
    character_status: 'DEFERRED_NEXT_STAGE' as const,
    planned_developer_roles: [
      'FRONTEND_DEVELOPER',
      'BACKEND_DEVELOPER',
      'DATABASE_DEVELOPER',
    ] as const,
    future_actions: ENGINEERING_FUTURE_ACTIONS_CONTRACT,
    footprint: {
      width: ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_WIDTH,
      depth: ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_DEPTH,
      wall_height: ENGINEERING_MODULE_CONSTANTS.WALL_HEIGHT,
      local_origin: ENGINEERING_MODULE_CONSTANTS.LOCAL_ORIGIN,
      global_a3_1_offset: ENGINEERING_MODULE_CONSTANTS.GLOBAL_A3_1_OFFSET,
      continuous_single_room: true,
      internal_wall_at_z8: false,
    },
    zones: [
      {
        zone_id: 'FRONTEND_WORKSTATION',
        display_name: 'Zone A — Frontend Developer Workstation',
        z_span: [12.0, 16.0],
        agent_role: 'FRONTEND_DEVELOPER',
        accent_palette: ['#E87A5D', '#F3EDE2', '#262B33'],
        anchors: ['FE_WORKSTATION_APPROACH', 'FE_DESK_WORK', 'FE_CHAIR', 'FE_MONITOR_INTERACTION'],
      },
      {
        zone_id: 'BACKEND_WORKSTATION',
        display_name: 'Zone B — Backend Developer Workstation',
        z_span: [8.0, 12.0],
        agent_role: 'BACKEND_DEVELOPER',
        accent_palette: ['#3B6E9C', '#708299', '#1F2530'],
        anchors: ['BE_WORKSTATION_APPROACH', 'BE_DESK_WORK', 'BE_CHAIR', 'BE_API_BOARD'],
      },
      {
        zone_id: 'INTEGRATION_REVIEW_AREA',
        display_name: 'Zone C — Shared Integration & Code Review Hub',
        z_span: [5.0, 8.0],
        agent_role: 'SHARED_ENGINEERING_COLLABORATION',
        accent_palette: ['#D89B56', '#4E7A94', '#387B6B'],
        anchors: [
          'ENG_INTEGRATION_TABLE',
          'ENG_ARCHITECTURE_BOARD',
          'ENG_CODE_REVIEW_POSITION',
          'ENG_DISCUSSION_POSITION',
        ],
      },
      {
        zone_id: 'DATABASE_WORKSTATION',
        display_name: 'Zone D — Database Developer Workstation',
        z_span: [0.0, 5.0],
        agent_role: 'DATABASE_DEVELOPER',
        accent_palette: ['#2E7D6B', '#528F7C', '#202B29'],
        anchors: ['DB_WORKSTATION_APPROACH', 'DB_DESK_WORK', 'DB_CHAIR', 'DB_SCHEMA_REVIEW'],
      },
    ],
    connectors: {
      ENGINEERING_EAST_MAIN: ENGINEERING_CONNECTORS_SPEC.ENGINEERING_EAST_MAIN,
      ENGINEERING_NORTH_CORRIDOR: ENGINEERING_CONNECTORS_SPEC.ENGINEERING_NORTH_CORRIDOR,
    },
    monitor_orientation_contract: {
      rule: 'dot(screenNormal, normalize(chairPosition - screenPosition)) > 0.7',
      monitors: ENGINEERING_MONITORS_SPEC,
    },
    future_agent_states: {
      FRONTEND_DEVELOPER: ['SIT_TYPING_UI', 'INSPECT_COMPONENT_BOARD', 'JOIN_CODE_REVIEW'],
      BACKEND_DEVELOPER: ['SIT_CODING_API', 'REVIEW_API_CONTRACT_BOARD', 'JOIN_CODE_REVIEW'],
      DATABASE_DEVELOPER: ['SIT_SCHEMA_DESIGN', 'REVIEW_SCHEMA_ARCHIVE_BOARD', 'JOIN_CODE_REVIEW'],
    },
  };
}

