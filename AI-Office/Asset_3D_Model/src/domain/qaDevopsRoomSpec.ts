import type { CameraPreset, FurnitureItemSpec, RoomAnchorSpec } from './modularRoomSpec';

/**
 * ============================================================================
 * AI OFFICE — MODULE 06: QA & DEVOPS INTEGRATED STUDIO (8×16 DOUBLE MODULE)
 * ============================================================================
 * Production V1 specification for the combined Quality Assurance & DevOps
 * department studio (`AI_OFFICE_ROOM_QA_DEVOPS_v1`), occupying the East Wing
 * `[24, 0, 0]` (`X = 24..32, Z = 0..16`, height `3.2u`) in Master Layout A3.2.
 *
 * Strictly a SINGLE continuous 8×16 room (`X = 0..8, Z = 0..16`) at local
 * origin `[0, 0, 0]` with ONE continuous warm oak floor and NO internal
 * dividing wall at `Z = 8`.
 *
 * Longitudinal Organization:
 *   1. North Zone (`Z ≈ 10.6..16.0`): QA Testing & Physical Device Verification Zone
 *   2. Central Zone (`Z ≈ 5.4..10.6`): Cozy Collaboration Lounge & Shared Review Board
 *   3. South Zone (`Z ≈ 0.0..5.4`): DevOps & AI Engine Operations Zone
 */

export type QADevOpsAnchorId =
  // General (4)
  | 'QA_DEVOPS_ROOM_SPAWN'
  | 'QA_DEVOPS_ROOM_IDLE'
  | 'QA_DEVOPS_WEST_EXIT'
  | 'QA_DEVOPS_NORTH_EXIT'
  // QA (7)
  | 'QA_WORKSTATION_APPROACH'
  | 'QA_DESK_WORK'
  | 'QA_CHAIR'
  | 'QA_DEVICE_TESTING'
  | 'QA_CHECKLIST_BOARD'
  | 'QA_BUG_REVIEW'
  | 'QA_TEST_REPORT_REVIEW'
  // DevOps (6)
  | 'DEVOPS_WORKSTATION_APPROACH'
  | 'DEVOPS_DESK_WORK'
  | 'DEVOPS_CHAIR'
  | 'DEVOPS_RACK_INSPECTION'
  | 'DEVOPS_MONITORING_DISPLAY'
  | 'DEVOPS_INFRASTRUCTURE_REVIEW'
  // Shared (6)
  | 'QA_DEVOPS_REVIEW_BOARD'
  | 'QA_DEVOPS_LOUNGE_SOFA'
  | 'QA_DEVOPS_LOUNGE_ARMCHAIR'
  | 'QA_DEVOPS_COFFEE_TABLE'
  | 'QA_DEVOPS_DISCUSSION_POSITION'
  | 'QA_DEVOPS_PRESENTATION_POSITION';

export type QADevOpsZoneId =
  | 'GENERAL'
  | 'QA_TESTING_ZONE'
  | 'SHARED_COZY_LOUNGE'
  | 'DEVOPS_OPERATIONS_ZONE';

export interface QADevOpsActivityAnchor extends RoomAnchorSpec {
  id: QADevOpsAnchorId;
  type: QADevOpsAnchorId;
  label: string;
  zone: QADevOpsZoneId;
  facingRad: number;
  facing_direction: [number, number, number];
  approach_position: [number, number, number];
  target_object: string;
  posture: 'standing' | 'seated';
}

export interface QADevOpsFutureActionContract {
  action_id: string;
  label: string;
  agent_role: 'QA_REVIEW_AGENT' | 'DEVOPS_AI_ENGINE_AGENT';
  target_anchor: QADevOpsAnchorId;
  fallback_anchor: QADevOpsAnchorId;
  posture: 'standing' | 'seated';
  description: string;
}

export const QA_DEVOPS_MODULE_CONSTANTS = {
  MODULE_ID: 'AI_OFFICE_ROOM_QA_DEVOPS_v1',
  ASSET_ID: 'ai_office.room.qa_devops_studio.v1',
  REGISTRY_KEY: 'qa_devops_studio' as const,
  LEGACY_MERGED_KEYS: ['qa_review', 'devops_ai_engine'] as const,
  DISPLAY_NAME: 'QA & DevOps Integrated Studio',
  ALTERNATIVE_TITLE: 'Verification & Operations Studio',
  EDITION_SUBTITLE: 'Elegant Cozy Edition — 8×16 Combined Department',
  DEPARTMENTS: ['Quality Assurance', 'DevOps & AI Engine Operations'] as const,
  CATEGORY: 'modular_office_room_double_module',
  STYLE: 'Cozy Precision Verification & Operations Studio (Warm Oak, Slate Teal, Olive Green, Brushed Brass)',
  LAYOUT_VERSION: 'AI_OFFICE_LAYOUT_A3_2_v1',
  ROOM_TYPE: 'QA_DEVOPS_MULTI_AGENT' as const,
  STATUS: 'IN DEVELOPMENT (READY FOR OWNER REVIEW)',
  VERSION: '1.0.0',
  ROOT_NODE_NAME: 'ROOM_QA_DEVOPS_ROOT',
  GLB_FILENAME: 'qa_devops_room.glb',
  MANIFEST_FILENAME: 'qa_devops_room.manifest.json',
  ANCHORS_FILENAME: 'qa_devops_room.anchors.json',
  DISPLAY_SLOTS_FILENAME: 'qa_devops_room.display_slots.json',
  BEHAVIOR_FILENAME: 'qa_devops_room.behavior.json',
  PREVIEW_FILENAME: 'qa_devops_room.preview.png',
  PACK_ZIP_FILENAME: 'qa_devops_room_production_pack_v1.zip',
  LAYOUT_A3_2_FILENAME: 'office-layout-a3.2.json',
  FOOTPRINT_WIDTH: 8.0,
  FOOTPRINT_DEPTH: 16.0,
  WALL_HEIGHT: 3.2,
  WALL_THICKNESS: 0.16,
  FLOOR_THICKNESS: 0.16,
  LOCAL_ORIGIN: [0, 0, 0] as [number, number, number],
  GLOBAL_A3_2_OFFSET: [24, 0, 0] as [number, number, number],
  GLOBAL_A3_OFFSET: [24, 0, 0] as [number, number, number],
  REQUIRED_GROUPS: [
    'STRUCTURE',
    'FLOOR',
    'WALLS',
    'WINDOWS',
    'CONNECTORS',
    'FURNITURE',
    'PROPS',
    'DECORATION',
  ] as const,
  SEMANTIC_FURNITURE_SUBGROUPS: [
    'QA_WORKSTATION',
    'QA_DEVICE_TESTING',
    'QA_STORAGE',
    'DEVOPS_WORKSTATION',
    'DEVOPS_RACKS',
    'SHARED_LOUNGE',
  ] as const,
  SEMANTIC_PROPS_SUBGROUPS: [
    'QA_REVIEW_PROPS',
    'DEVOPS_OPERATIONS_PROPS',
    'SHARED_REVIEW_PROPS',
  ] as const,
  SEMANTIC_DECORATION_SUBGROUPS: [
    'PLANTS',
    'LAMPS',
    'WALL_DECOR',
    'LOUNGE_DETAILS',
  ] as const,
} as const;

export const QA_DEVOPS_INTERIOR_ZONES = [
  {
    zone_id: 'QA_TESTING_ZONE',
    display_name: 'North Zone — Quality Assurance & Device Testing Area',
    z_span: [10.6, 16.0] as [number, number],
    department: 'Quality Assurance',
    primary_accent: '#3E6B73',
    secondary_accent: '#233042',
  },
  {
    zone_id: 'SHARED_COZY_LOUNGE',
    display_name: 'Central Zone — Cozy Collaboration Lounge & Release Review Area',
    z_span: [5.4, 10.6] as [number, number],
    department: 'Shared QA & DevOps Collaboration',
    primary_accent: '#F2ECE1',
    secondary_accent: '#C89D54',
  },
  {
    zone_id: 'DEVOPS_OPERATIONS_ZONE',
    display_name: 'South Zone — DevOps & AI Engine Operations Area',
    z_span: [0.0, 5.4] as [number, number],
    department: 'DevOps & AI Engine Operations',
    primary_accent: '#5E6F52',
    secondary_accent: '#1E2631',
  },
] as const;

export interface QADevOpsConnectorSpec {
  id: 'QA_DEVOPS_WEST_MAIN' | 'QA_DEVOPS_NORTH_CORRIDOR';
  side: 'WEST' | 'NORTH';
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

const WEST_MAIN_CONNECTOR: QADevOpsConnectorSpec = {
  id: 'QA_DEVOPS_WEST_MAIN',
  side: 'WEST',
  position: [0, 0, 8],
  localPosition: [0, 0, 8],
  global_position: [24, 0, 8],
  direction: [-1, 0, 0],
  width: 2.0,
  height: 2.3,
  span: [7.0, 9.0],
  target_zone: 'CENTRAL_HUB_ROOT',
  removable_node_name: 'QADevOps_Connector_West_Threshold_Frame',
  clearance_box: {
    minX: 0.0,
    maxX: 1.6,
    minZ: 7.0,
    maxZ: 9.0,
  },
};

const NORTH_CORRIDOR_CONNECTOR: QADevOpsConnectorSpec = {
  id: 'QA_DEVOPS_NORTH_CORRIDOR',
  side: 'NORTH',
  position: [4, 0, 16],
  localPosition: [4, 0, 16],
  global_position: [28, 0, 16],
  direction: [0, 0, 1],
  width: 2.0,
  height: 2.3,
  span: [3.0, 5.0],
  target_zone: 'SHARED_CORRIDOR_ROOT',
  removable_node_name: 'QADevOps_Connector_North_Corridor_Frame',
  clearance_box: {
    minX: 3.0,
    maxX: 5.0,
    minZ: 14.5,
    maxZ: 16.0,
  },
};

export const QA_DEVOPS_CONNECTORS_SPEC = {
  QA_DEVOPS_WEST_MAIN: WEST_MAIN_CONNECTOR,
  QA_DEVOPS_NORTH_CORRIDOR: NORTH_CORRIDOR_CONNECTOR,
} as const;

export interface QADevOpsMonitorOrientationSpec {
  id: string;
  zone: 'QA' | 'DEVOPS' | 'SHARED';
  displayMeshName: string;
  rearCasingMeshName: string;
  viewerAnchorId: QADevOpsAnchorId;
  viewerPosition: [number, number, number];
  screenWorldPosition: [number, number, number];
  screenFrontNormal: [number, number, number];
  description: string;
}

/**
 * Mandatory Monitor & Wall Display Orientation Contract (Section 19):
 * Every monitor, testing device, and wall display has ONLY ONE front display
 * surface facing its intended viewer (`dot(screenNormal, normalize(viewerPos - screenPos)) > 0.7`)
 * and an opaque rear casing/backing.
 */
export const QA_DEVOPS_MONITORS_SPEC: QADevOpsMonitorOrientationSpec[] = [
  {
    id: 'qa_main_display',
    zone: 'QA',
    displayMeshName: 'QA_Main_Display_Screen',
    rearCasingMeshName: 'QA_Main_Display_Rear_Casing',
    viewerAnchorId: 'QA_CHAIR',
    viewerPosition: [5.65, 0.0, 12.95],
    screenWorldPosition: [5.45, 1.02, 14.08],
    screenFrontNormal: [0, 0, -1],
    description:
      'QA Primary 27" Test Execution & Regression Dashboard facing South (-Z) toward QA_CHAIR',
  },
  {
    id: 'qa_secondary_display',
    zone: 'QA',
    displayMeshName: 'QA_Secondary_Display_Screen',
    rearCasingMeshName: 'QA_Secondary_Display_Rear_Casing',
    viewerAnchorId: 'QA_CHAIR',
    viewerPosition: [5.65, 0.0, 12.95],
    screenWorldPosition: [6.12, 1.01, 14.01],
    screenFrontNormal: [-0.342, 0, -0.94],
    description:
      'QA Secondary Bug Tracker & Verification Monitor angled toward QA_CHAIR',
  },
  {
    id: 'qa_device_laptop_display',
    zone: 'QA',
    displayMeshName: 'QA_Device_Laptop_Screen',
    rearCasingMeshName: 'QA_Device_Laptop_Lid_Back',
    viewerAnchorId: 'QA_DEVICE_TESTING',
    viewerPosition: [2.65, 0.0, 13.55],
    screenWorldPosition: [1.68, 0.96, 13.85],
    screenFrontNormal: [1, 0, 0],
    description:
      'Dedicated Device Testing Station Laptop Screen facing East (+X) toward QA_DEVICE_TESTING',
  },
  {
    id: 'qa_device_tablet_display',
    zone: 'QA',
    displayMeshName: 'QA_Device_Tablet_Pro_Screen',
    rearCasingMeshName: 'QA_Device_Tablet_Pro_Body',
    viewerAnchorId: 'QA_DEVICE_TESTING',
    viewerPosition: [2.65, 0.0, 13.55],
    screenWorldPosition: [1.72, 0.91, 13.25],
    screenFrontNormal: [1, 0, 0],
    description:
      'Dedicated Device Testing Station Tablet Screen facing East (+X) toward QA_DEVICE_TESTING',
  },
  {
    id: 'devops_main_display',
    zone: 'DEVOPS',
    displayMeshName: 'DevOps_Main_Display_Screen',
    rearCasingMeshName: 'DevOps_Main_Display_Rear_Casing',
    viewerAnchorId: 'DEVOPS_CHAIR',
    viewerPosition: [2.45, 0.0, 1.85],
    screenWorldPosition: [2.22, 1.02, 2.98],
    screenFrontNormal: [0, 0, -1],
    description:
      'DevOps Primary CI/CD Pipeline & Infrastructure Topology Monitor facing South (-Z) toward DEVOPS_CHAIR',
  },
  {
    id: 'devops_secondary_display',
    zone: 'DEVOPS',
    displayMeshName: 'DevOps_Secondary_Display_Screen',
    rearCasingMeshName: 'DevOps_Secondary_Display_Rear_Casing',
    viewerAnchorId: 'DEVOPS_CHAIR',
    viewerPosition: [2.45, 0.0, 1.85],
    screenWorldPosition: [2.92, 1.01, 2.91],
    screenFrontNormal: [-0.342, 0, -0.94],
    description:
      'DevOps Secondary Service Health & Resource Telemetry Monitor angled toward DEVOPS_CHAIR',
  },
  {
    id: 'qa_checklist_wall_display',
    zone: 'QA',
    displayMeshName: 'QA_Checklist_Board_Surface',
    rearCasingMeshName: 'QA_Checklist_Board_Backing',
    viewerAnchorId: 'QA_CHECKLIST_BOARD',
    viewerPosition: [1.45, 0.0, 11.45],
    screenWorldPosition: [0.25, 1.62, 11.45],
    screenFrontNormal: [1, 0, 0],
    description:
      'Wall-Mounted QA Checklist & Bug Review Board facing East (+X) toward QA_CHECKLIST_BOARD',
  },
  {
    id: 'shared_review_wall_display',
    zone: 'SHARED',
    displayMeshName: 'QA_DevOps_Shared_Review_Surface',
    rearCasingMeshName: 'QA_DevOps_Shared_Review_Backing',
    viewerAnchorId: 'QA_DEVOPS_REVIEW_BOARD',
    viewerPosition: [1.55, 0.0, 5.65],
    screenWorldPosition: [0.25, 1.58, 5.65],
    screenFrontNormal: [1, 0, 0],
    description:
      'Shared QA & DevOps Release Readiness Review Board facing East (+X) toward QA_DEVOPS_REVIEW_BOARD',
  },
  {
    id: 'devops_operations_wall_display',
    zone: 'DEVOPS',
    displayMeshName: 'DevOps_Operations_Board_Surface',
    rearCasingMeshName: 'DevOps_Operations_Board_Backing',
    viewerAnchorId: 'DEVOPS_MONITORING_DISPLAY',
    viewerPosition: [5.65, 0.0, 1.45],
    screenWorldPosition: [5.65, 1.68, 0.25],
    screenFrontNormal: [0, 0, 1],
    description:
      'South-East Wall DevOps Infrastructure & Operations Status Display facing North (+Z) toward DEVOPS_MONITORING_DISPLAY',
  },
];

export function computeQADevOpsMonitorViewerDot(
  screenPos: [number, number, number],
  screenNormal: [number, number, number],
  viewerPos: [number, number, number]
): number {
  const dx = viewerPos[0] - screenPos[0];
  const dz = viewerPos[2] - screenPos[2];
  const lenXZ = Math.hypot(dx, dz) || 1;
  const toViewerX = dx / lenXZ;
  const toViewerZ = dz / lenXZ;

  const nLenXZ = Math.hypot(screenNormal[0], screenNormal[2]) || 1;
  const nx = screenNormal[0] / nLenXZ;
  const nz = screenNormal[2] / nLenXZ;

  return Number((nx * toViewerX + nz * toViewerZ).toFixed(4));
}

export function verifyQADevOpsMonitorsOrientation(): {
  passed: boolean;
  allValid: boolean;
  results: Array<{
    id: string;
    label: string;
    displayMeshName: string;
    rearCasingMeshName: string;
    viewerAnchorId: QADevOpsAnchorId;
    dotProduct: number;
    passed: boolean;
  }>;
} {
  const results = QA_DEVOPS_MONITORS_SPEC.map((spec) => {
    const dot = computeQADevOpsMonitorViewerDot(
      spec.screenWorldPosition,
      spec.screenFrontNormal,
      spec.viewerPosition
    );
    const passed = dot > 0.7;
    return {
      id: spec.id,
      label: spec.description,
      displayMeshName: spec.displayMeshName,
      rearCasingMeshName: spec.rearCasingMeshName,
      viewerAnchorId: spec.viewerAnchorId,
      dotProduct: dot,
      passed,
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
 * Complete Catalog of Furniture, Workstations, Lounge Pieces & Technical Equipment
 * inside the 8×16 QA & DevOps Integrated Studio.
 */
export const QA_DEVOPS_FURNITURE_CATALOG: FurnitureItemSpec[] = [
  // --- ZONE A: QA TESTING AREA (North, Z ≈ 10.6..16.0) ---
  {
    id: 'qa_workstation_desk',
    name: 'QA_Workstation_Desk',
    category: 'WORKSTATION',
    position: [5.65, 0.0, 13.85],
    rotationY: 0,
    dimensions: [2.05, 0.76, 0.88],
    clearanceRadius: 1.3,
    description:
      'Primary QA Testing Workstation with warm oak desktop, dark charcoal steel frame, walnut drawers, dual QA test execution & bug tracker displays (DEMO), mechanical keyboard, mouse, documentation tray, coffee mug, and brass task lamp.',
  },
  {
    id: 'qa_ergonomic_chair',
    name: 'QA_Ergonomic_Chair',
    category: 'SEATING',
    position: [5.65, 0.0, 12.95],
    rotationY: 0,
    dimensions: [0.64, 0.98, 0.64],
    clearanceRadius: 0.55,
    description:
      'Ergonomic charcoal QA task chair with dusty-teal lumbar cushion positioned behind the QA desk facing North (+Z) toward the dual QA monitors.',
  },
  {
    id: 'qa_device_testing_counter',
    name: 'QA_Device_Testing_Counter',
    category: 'WORKSTATION',
    position: [1.65, 0.0, 13.55],
    rotationY: Math.PI / 2,
    dimensions: [0.68, 0.84, 1.48],
    clearanceRadius: 0.95,
    description:
      'Dedicated physical 3D Device Testing Station with warm oak top, walnut storage base, 1 open testing laptop, 2 smartphones on micro-stands, 2 tablets on verification docks, organized test buses, status indicator bar, and Voxel Golden Bug Trophy.',
  },
  {
    id: 'qa_checklist_board',
    name: 'QA_Checklist_Wall_Board',
    category: 'PLANNING',
    position: [0.22, 0.0, 11.45],
    rotationY: Math.PI / 2,
    dimensions: [0.16, 2.25, 1.75],
    clearanceRadius: 0.6,
    description:
      'Substantial wall-mounted QA Checklist & Bug Review Board featuring 6 structured sections (Test Cases, Regression, Edge Cases, Bug Review, Verification, Release Sign-Off) with 3D green check badges and amber review markers.',
  },
  {
    id: 'qa_documentation_shelves',
    name: 'QA_Documentation_Bookcase',
    category: 'STORAGE',
    position: [1.55, 0.0, 15.38],
    rotationY: 0,
    dimensions: [1.65, 2.28, 0.48],
    clearanceRadius: 0.75,
    description:
      'Multi-tier walnut & dusty-teal QA Test Documentation Bookshelf along the North-West wall holding regression binders, test-result reference folders, archive boxes, and a 3D Bug Triage Card Rack.',
  },

  // --- ZONE B: CENTRAL COZY COLLABORATION LOUNGE & REVIEW SPACE (Z ≈ 5.4..10.6) ---
  {
    id: 'qa_devops_lounge_rug',
    name: 'QA_DevOps_Patterned_Lounge_Rug',
    category: 'DECOR',
    position: [4.75, 0.0, 8.0],
    rotationY: 0,
    dimensions: [4.3, 0.012, 4.6],
    clearanceRadius: 0.1,
    description:
      'Large 4.30×4.60m premium woven geometric area rug in warm cream, deep navy/charcoal, muted olive-green, dusty teal, and brushed-brass border accents anchoring the central lounge.',
  },
  {
    id: 'qa_devops_lounge_sofa',
    name: 'QA_DevOps_Cream_Three_Seat_Sofa',
    category: 'SEATING',
    position: [5.95, 0.0, 8.05],
    rotationY: -Math.PI / 2,
    dimensions: [0.92, 0.88, 2.28],
    clearanceRadius: 1.15,
    description:
      'Plush cream upholstered three-seat lounge sofa with 3 segmented seat cushions, tailored armrests, walnut plinth & legs, navy/teal/olive accent pillows, and a 3D voxel folded knitted throw blanket.',
  },
  {
    id: 'qa_devops_lounge_armchair',
    name: 'QA_DevOps_Cream_Lounge_Armchair',
    category: 'SEATING',
    position: [4.65, 0.0, 9.65],
    rotationY: Math.PI,
    dimensions: [0.88, 0.86, 0.86],
    clearanceRadius: 0.72,
    description:
      'Matching cream upholstered lounge armchair with sculpted backrest, thick seat cushion, armrests, walnut legs, and olive/brass accent pillow.',
  },
  {
    id: 'qa_devops_coffee_table',
    name: 'QA_DevOps_Wooden_Coffee_Table',
    category: 'MEETING',
    position: [4.55, 0.0, 8.05],
    rotationY: 0,
    dimensions: [1.12, 0.44, 1.42],
    clearanceRadius: 0.88,
    description:
      'Medium warm oak & dark walnut coffee table with lower magazine shelf, stacked release review notes, technical books, ceramic tea tray, centerpiece succulent planter, and warm table lamp.',
  },
  {
    id: 'qa_devops_lounge_poufs',
    name: 'QA_DevOps_Compact_Lounge_Poufs',
    category: 'SEATING',
    position: [3.35, 0.0, 7.85],
    rotationY: 0,
    dimensions: [0.52, 0.38, 1.85],
    clearanceRadius: 0.65,
    description:
      'Trio of compact upholstered soft poufs in dark slate-blue, muted teal, and olive-green arranged around the West and South sides of the coffee table.',
  },
  {
    id: 'qa_devops_shared_review_board',
    name: 'QA_DevOps_Shared_Review_Board',
    category: 'PLANNING',
    position: [0.22, 0.0, 5.65],
    rotationY: Math.PI / 2,
    dimensions: [0.16, 2.22, 1.88],
    clearanceRadius: 0.6,
    description:
      'Shared QA & DevOps Release Readiness Review Board bridging test verification and deployment sign-off (DEMO), mounted on the West wall with lower review binder ledge.',
  },
  {
    id: 'qa_devops_window_console',
    name: 'QA_DevOps_East_Window_Console',
    category: 'STORAGE',
    position: [7.32, 0.0, 8.05],
    rotationY: -Math.PI / 2,
    dimensions: [0.46, 0.74, 2.15],
    clearanceRadius: 0.55,
    description:
      'Low walnut & brass console under the East panoramic lounge window holding archival binders, storage boxes, potted greenery, and warm brass floor lamp.',
  },

  // --- ZONE C: DEVOPS OPERATIONS AREA (South, Z ≈ 0.0..5.4) ---
  {
    id: 'devops_workstation_desk',
    name: 'DevOps_Workstation_Desk',
    category: 'WORKSTATION',
    position: [2.45, 0.0, 2.75],
    rotationY: 0,
    dimensions: [2.15, 0.76, 0.90],
    clearanceRadius: 1.35,
    description:
      'DevOps & AI Engine Operations Workstation with walnut top, gunmetal frame, telemetry drawer pedestal, elevated equipment dock, dual CI/CD pipeline & service health monitors (DEMO), keyboard, mouse, runbook binder, and brass task lamp.',
  },
  {
    id: 'devops_ergonomic_chair',
    name: 'DevOps_Ergonomic_Chair',
    category: 'SEATING',
    position: [2.45, 0.0, 1.85],
    rotationY: 0,
    dimensions: [0.64, 0.98, 0.64],
    clearanceRadius: 0.55,
    description:
      'Ergonomic charcoal DevOps task chair with muted olive-green lumbar cushion positioned behind the DevOps desk facing North (+Z) toward the dual monitoring displays.',
  },
  {
    id: 'devops_infrastructure_racks',
    name: 'DevOps_Dual_Infrastructure_Racks',
    category: 'STORAGE',
    position: [7.15, 0.0, 3.10],
    rotationY: -Math.PI / 2,
    dimensions: [0.74, 1.96, 2.45],
    clearanceRadius: 0.95,
    description:
      'Two separate compact dark-charcoal Infrastructure Rack Cabinets (Rack A & Rack B) with stepped server blades, ventilation grilles, controlled cyan/emerald/amber status lights, and top Monitoring Indicator Tower.',
  },
  {
    id: 'devops_operations_wall_board',
    name: 'DevOps_Operations_Status_Wall_Board',
    category: 'PLANNING',
    position: [5.65, 0.0, 0.22],
    rotationY: 0,
    dimensions: [2.15, 2.28, 0.16],
    clearanceRadius: 0.6,
    description:
      'Wall-mounted DEVOPS — INFRASTRUCTURE & OPERATIONS status display board on the South-East wall with Build, Services, Infrastructure, Monitoring, and Deployment Review sections (DEMO).',
  },
  {
    id: 'devops_technical_storage',
    name: 'DevOps_Technical_Storage_And_Cases',
    category: 'STORAGE',
    position: [0.54, 0.0, 2.65],
    rotationY: Math.PI / 2,
    dimensions: [0.48, 1.06, 1.92],
    clearanceRadius: 0.68,
    description:
      'Low-profile South-West technical credenza holding ruggedized charcoal/olive equipment transport cases, hardware toolboxes, 3D network topology model, and incident runbook binders.',
  },
];

/**
 * 23 Canonical Room-Local Anchors for Future QA & DevOps Agents (Section 18).
 */
export const DEFAULT_QA_DEVOPS_ANCHORS: Record<QADevOpsAnchorId, QADevOpsActivityAnchor> = {
  // 1. General Anchors (4)
  QA_DEVOPS_ROOM_SPAWN: {
    id: 'QA_DEVOPS_ROOM_SPAWN',
    type: 'QA_DEVOPS_ROOM_SPAWN',
    label: 'West Main Hub Spawn [1.45, 0, 8.0]',
    zone: 'GENERAL',
    position: [1.45, 0.0, 8.0],
    rotationY: Math.PI / 2,
    facingRad: Math.PI / 2,
    facing_direction: [1, 0, 0],
    approach_position: [0.85, 0.0, 8.0],
    target_object: 'ROOM_QA_DEVOPS_ROOT',
    posture: 'standing',
    radius: 0.45,
    description: 'Primary room entry spawn point inside the West main doorway from the Central Hub.',
    agentUsage: 'Default arrival node for QA and DevOps agents entering from the Central Hub.',
  },
  QA_DEVOPS_ROOM_IDLE: {
    id: 'QA_DEVOPS_ROOM_IDLE',
    type: 'QA_DEVOPS_ROOM_IDLE',
    label: 'Central Spine Idle [2.35, 0, 8.0]',
    zone: 'GENERAL',
    position: [2.35, 0.0, 8.0],
    rotationY: Math.PI / 2,
    facingRad: Math.PI / 2,
    facing_direction: [1, 0, 0],
    approach_position: [1.85, 0.0, 8.0],
    target_object: 'QA_DevOps_Wooden_Coffee_Table',
    posture: 'standing',
    radius: 0.42,
    description: 'Central circulation spine idle waiting anchor overlooking the cozy lounge.',
    agentUsage: 'Default standing idle position between the West entrance and central lounge.',
  },
  QA_DEVOPS_WEST_EXIT: {
    id: 'QA_DEVOPS_WEST_EXIT',
    type: 'QA_DEVOPS_WEST_EXIT',
    label: 'West Central Hub Exit [0.45, 0, 8.0]',
    zone: 'GENERAL',
    position: [0.45, 0.0, 8.0],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    approach_position: [1.35, 0.0, 8.0],
    target_object: 'QADevOps_Connector_West_Threshold_Frame',
    posture: 'standing',
    radius: 0.45,
    description: 'West main doorway exit anchor at [0, 0, 8] connecting to the Open Central Hub.',
    agentUsage: 'Exit/entry threshold for Central Collaboration Hub navigation.',
  },
  QA_DEVOPS_NORTH_EXIT: {
    id: 'QA_DEVOPS_NORTH_EXIT',
    type: 'QA_DEVOPS_NORTH_EXIT',
    label: 'North Shared Corridor Exit [4.0, 0, 15.55]',
    zone: 'GENERAL',
    position: [4.0, 0.0, 15.55],
    rotationY: 0,
    facingRad: 0,
    facing_direction: [0, 0, 1],
    approach_position: [4.0, 0.0, 14.65],
    target_object: 'QADevOps_Connector_North_Corridor_Frame',
    posture: 'standing',
    radius: 0.45,
    description: 'North corridor doorway threshold anchor at [4, 0, 16] connecting to Shared Corridor.',
    agentUsage: 'Exit/entry threshold for East-West Shared Corridor navigation.',
  },

  // 2. QA Functional Zone Anchors (7)
  QA_WORKSTATION_APPROACH: {
    id: 'QA_WORKSTATION_APPROACH',
    type: 'QA_WORKSTATION_APPROACH',
    label: 'QA Workstation Approach [3.75, 0, 12.95]',
    zone: 'QA_TESTING_ZONE',
    position: [3.75, 0.0, 12.95],
    rotationY: Math.PI / 2,
    facingRad: Math.PI / 2,
    facing_direction: [1, 0, 0],
    approach_position: [3.15, 0.0, 12.95],
    target_object: 'QA_Workstation_Desk',
    posture: 'standing',
    radius: 0.4,
    description: 'Safe approach node west of the QA Workstation before sitting in QA_CHAIR.',
    agentUsage: 'Waypoint for QA Agent entering or leaving the primary QA workstation.',
  },
  QA_DESK_WORK: {
    id: 'QA_DESK_WORK',
    type: 'QA_DESK_WORK',
    label: 'QA Desk Active Testing [5.65, 0, 13.15]',
    zone: 'QA_TESTING_ZONE',
    position: [5.65, 0.0, 13.15],
    rotationY: 0,
    facingRad: 0,
    facing_direction: [0, 0, 1],
    approach_position: [3.75, 0.0, 12.95],
    target_object: 'QA_Main_Display_Screen',
    posture: 'seated',
    radius: 0.36,
    description: 'Active test execution and bug triage posture at the QA Workstation desk.',
    agentUsage: 'Primary seated work anchor for the future QA & Review Agent.',
  },
  QA_CHAIR: {
    id: 'QA_CHAIR',
    type: 'QA_CHAIR',
    label: 'QA Ergonomic Chair [5.65, 0, 12.95]',
    zone: 'QA_TESTING_ZONE',
    position: [5.65, 0.0, 12.95],
    rotationY: 0,
    facingRad: 0,
    facing_direction: [0, 0, 1],
    approach_position: [3.75, 0.0, 12.95],
    target_object: 'QA_Main_Display_Screen',
    posture: 'seated',
    radius: 0.36,
    description: 'Seated anchor on the QA ergonomic chair facing North (+Z) toward dual QA displays.',
    agentUsage: 'Seated reference anchor for monitor orientation and QA desk work.',
  },
  QA_DEVICE_TESTING: {
    id: 'QA_DEVICE_TESTING',
    type: 'QA_DEVICE_TESTING',
    label: 'Physical Device Testing Counter [2.65, 0, 13.55]',
    zone: 'QA_TESTING_ZONE',
    position: [2.65, 0.0, 13.55],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    approach_position: [2.95, 0.0, 13.55],
    target_object: 'QA_Device_Testing_Counter',
    posture: 'standing',
    radius: 0.4,
    description: 'Standing inspection anchor facing the 3D laptop, phones, and tablets on the Device Testing Counter.',
    agentUsage: 'Used by QA Agent during device compatibility and responsive UI verification.',
  },
  QA_CHECKLIST_BOARD: {
    id: 'QA_CHECKLIST_BOARD',
    type: 'QA_CHECKLIST_BOARD',
    label: 'QA Checklist Wall Board [1.45, 0, 11.45]',
    zone: 'QA_TESTING_ZONE',
    position: [1.45, 0.0, 11.45],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    approach_position: [2.35, 0.0, 11.45],
    target_object: 'QA_Checklist_Wall_Board',
    posture: 'standing',
    radius: 0.38,
    description: 'Standing review anchor facing the West-wall QA Checklist & Regression Board.',
    agentUsage: 'Used when checking off regression suites and quality-gate criteria.',
  },
  QA_BUG_REVIEW: {
    id: 'QA_BUG_REVIEW',
    type: 'QA_BUG_REVIEW',
    label: 'QA Bug Triage Review [1.45, 0, 12.15]',
    zone: 'QA_TESTING_ZONE',
    position: [1.45, 0.0, 12.15],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    approach_position: [2.35, 0.0, 12.15],
    target_object: 'QA_Checklist_Wall_Board',
    posture: 'standing',
    radius: 0.38,
    description: 'Standing bug triage anchor beside the Bug Review section of the QA board.',
    agentUsage: 'Used when analyzing defect severity and reproduction steps.',
  },
  QA_TEST_REPORT_REVIEW: {
    id: 'QA_TEST_REPORT_REVIEW',
    type: 'QA_TEST_REPORT_REVIEW',
    label: 'QA Test Documentation Shelf [2.05, 0, 14.55]',
    zone: 'QA_TESTING_ZONE',
    position: [2.05, 0.0, 14.55],
    rotationY: 0,
    facingRad: 0,
    facing_direction: [0, 0, 1],
    approach_position: [2.65, 0.0, 14.25],
    target_object: 'QA_Documentation_Bookcase',
    posture: 'standing',
    radius: 0.38,
    description: 'Standing anchor in front of the North-West QA Test Documentation Bookshelf.',
    agentUsage: 'Used when retrieving test specification binders and historical QA reports.',
  },

  // 3. DevOps Functional Zone Anchors (6)
  DEVOPS_WORKSTATION_APPROACH: {
    id: 'DEVOPS_WORKSTATION_APPROACH',
    type: 'DEVOPS_WORKSTATION_APPROACH',
    label: 'DevOps Workstation Approach [4.25, 0, 1.85]',
    zone: 'DEVOPS_OPERATIONS_ZONE',
    position: [4.25, 0.0, 1.85],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    approach_position: [4.25, 0.0, 2.85],
    target_object: 'DevOps_Workstation_Desk',
    posture: 'standing',
    radius: 0.4,
    description: 'Safe approach node east of the DevOps Workstation before sitting in DEVOPS_CHAIR.',
    agentUsage: 'Waypoint for DevOps Agent entering or leaving the operations desk.',
  },
  DEVOPS_DESK_WORK: {
    id: 'DEVOPS_DESK_WORK',
    type: 'DEVOPS_DESK_WORK',
    label: 'DevOps Desk Active Monitoring [2.45, 0, 2.05]',
    zone: 'DEVOPS_OPERATIONS_ZONE',
    position: [2.45, 0.0, 2.05],
    rotationY: 0,
    facingRad: 0,
    facing_direction: [0, 0, 1],
    approach_position: [4.25, 0.0, 1.85],
    target_object: 'DevOps_Main_Display_Screen',
    posture: 'seated',
    radius: 0.36,
    description: 'Active pipeline monitoring and incident diagnostics posture at the DevOps desk.',
    agentUsage: 'Primary seated work anchor for the future DevOps & AI Engine Agent.',
  },
  DEVOPS_CHAIR: {
    id: 'DEVOPS_CHAIR',
    type: 'DEVOPS_CHAIR',
    label: 'DevOps Ergonomic Chair [2.45, 0, 1.85]',
    zone: 'DEVOPS_OPERATIONS_ZONE',
    position: [2.45, 0.0, 1.85],
    rotationY: 0,
    facingRad: 0,
    facing_direction: [0, 0, 1],
    approach_position: [4.25, 0.0, 1.85],
    target_object: 'DevOps_Main_Display_Screen',
    posture: 'seated',
    radius: 0.36,
    description: 'Seated anchor on the DevOps ergonomic chair facing North (+Z) toward dual monitoring displays.',
    agentUsage: 'Seated reference anchor for DevOps monitor orientation.',
  },
  DEVOPS_RACK_INSPECTION: {
    id: 'DEVOPS_RACK_INSPECTION',
    type: 'DEVOPS_RACK_INSPECTION',
    label: 'Infrastructure Rack Inspection [5.85, 0, 3.10]',
    zone: 'DEVOPS_OPERATIONS_ZONE',
    position: [5.85, 0.0, 3.10],
    rotationY: Math.PI / 2,
    facingRad: Math.PI / 2,
    facing_direction: [1, 0, 0],
    approach_position: [4.85, 0.0, 3.10],
    target_object: 'DevOps_Dual_Infrastructure_Racks',
    posture: 'standing',
    radius: 0.42,
    description: 'Standing hardware & telemetry inspection anchor facing the two compact Infrastructure Racks.',
    agentUsage: 'Used by DevOps Agent when inspecting server rack modules and status LEDs.',
  },
  DEVOPS_MONITORING_DISPLAY: {
    id: 'DEVOPS_MONITORING_DISPLAY',
    type: 'DEVOPS_MONITORING_DISPLAY',
    label: 'DevOps Operations Wall Board [5.65, 0, 1.45]',
    zone: 'DEVOPS_OPERATIONS_ZONE',
    position: [5.65, 0.0, 1.45],
    rotationY: Math.PI,
    facingRad: Math.PI,
    facing_direction: [0, 0, -1],
    approach_position: [4.85, 0.0, 2.05],
    target_object: 'DevOps_Operations_Status_Wall_Board',
    posture: 'standing',
    radius: 0.4,
    description: 'Standing review anchor facing the South-East DevOps Operations Status Wall Board.',
    agentUsage: 'Used when reviewing build health, service uptime, and deployment status.',
  },
  DEVOPS_INFRASTRUCTURE_REVIEW: {
    id: 'DEVOPS_INFRASTRUCTURE_REVIEW',
    type: 'DEVOPS_INFRASTRUCTURE_REVIEW',
    label: 'DevOps Runbook & Storage Console [1.55, 0, 3.85]',
    zone: 'DEVOPS_OPERATIONS_ZONE',
    position: [1.55, 0.0, 3.85],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    approach_position: [2.25, 0.0, 4.25],
    target_object: 'DevOps_Technical_Storage_And_Cases',
    posture: 'standing',
    radius: 0.38,
    description: 'Standing review anchor facing the South-West technical storage shelves and topology model.',
    agentUsage: 'Used when consulting incident runbooks, equipment cases, and cloud topology.',
  },

  // 4. Shared Cozy Lounge & Review Anchors (6)
  QA_DEVOPS_REVIEW_BOARD: {
    id: 'QA_DEVOPS_REVIEW_BOARD',
    type: 'QA_DEVOPS_REVIEW_BOARD',
    label: 'Shared QA & DevOps Review Board [1.55, 0, 5.65]',
    zone: 'SHARED_COZY_LOUNGE',
    position: [1.55, 0.0, 5.65],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    approach_position: [2.25, 0.0, 5.65],
    target_object: 'QA_DevOps_Shared_Review_Board',
    posture: 'standing',
    radius: 0.4,
    description: 'Standing joint review anchor facing the Shared QA & DevOps Release Readiness Board.',
    agentUsage: 'Used by both QA and DevOps agents for release gating and go/no-go alignment.',
  },
  QA_DEVOPS_LOUNGE_SOFA: {
    id: 'QA_DEVOPS_LOUNGE_SOFA',
    type: 'QA_DEVOPS_LOUNGE_SOFA',
    label: 'Cream Three-Seat Lounge Sofa [5.55, 0, 8.05]',
    zone: 'SHARED_COZY_LOUNGE',
    position: [5.55, 0.0, 8.05],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    approach_position: [4.55, 0.0, 6.95],
    target_object: 'QA_DevOps_Cream_Three_Seat_Sofa',
    posture: 'seated',
    radius: 0.4,
    description: 'Seated collaboration anchor on the cream three-seat sofa facing West (-X) toward the coffee table.',
    agentUsage: 'Cozy seated discussion and reading posture in the central lounge.',
  },
  QA_DEVOPS_LOUNGE_ARMCHAIR: {
    id: 'QA_DEVOPS_LOUNGE_ARMCHAIR',
    type: 'QA_DEVOPS_LOUNGE_ARMCHAIR',
    label: 'Cream Lounge Armchair [4.65, 0, 9.35]',
    zone: 'SHARED_COZY_LOUNGE',
    position: [4.65, 0.0, 9.35],
    rotationY: Math.PI,
    facingRad: Math.PI,
    facing_direction: [0, 0, -1],
    approach_position: [3.65, 0.0, 9.55],
    target_object: 'QA_DevOps_Cream_Lounge_Armchair',
    posture: 'seated',
    radius: 0.38,
    description: 'Seated anchor on the matching cream armchair facing South (-Z) toward the coffee table.',
    agentUsage: 'Second seated lounge position for cross-department QA/DevOps syncs.',
  },
  QA_DEVOPS_COFFEE_TABLE: {
    id: 'QA_DEVOPS_COFFEE_TABLE',
    type: 'QA_DEVOPS_COFFEE_TABLE',
    label: 'Central Lounge Coffee Table [3.45, 0, 7.85]',
    zone: 'SHARED_COZY_LOUNGE',
    position: [3.45, 0.0, 7.85],
    rotationY: Math.PI / 2,
    facingRad: Math.PI / 2,
    facing_direction: [1, 0, 0],
    approach_position: [2.55, 0.0, 7.85],
    target_object: 'QA_DevOps_Wooden_Coffee_Table',
    posture: 'standing',
    radius: 0.38,
    description: 'Interaction anchor beside the central wooden coffee table and soft poufs.',
    agentUsage: 'Used when reviewing release notes or taking a coffee break in the lounge.',
  },
  QA_DEVOPS_DISCUSSION_POSITION: {
    id: 'QA_DEVOPS_DISCUSSION_POSITION',
    type: 'QA_DEVOPS_DISCUSSION_POSITION',
    label: 'Lounge Sync Discussion [2.85, 0, 8.65]',
    zone: 'SHARED_COZY_LOUNGE',
    position: [2.85, 0.0, 8.65],
    rotationY: Math.PI / 2,
    facingRad: Math.PI / 2,
    facing_direction: [1, 0, 0],
    approach_position: [2.35, 0.0, 8.65],
    target_object: 'QA_DevOps_Wooden_Coffee_Table',
    posture: 'standing',
    radius: 0.4,
    description: 'Standing collaborative discussion anchor on the West edge of the central lounge.',
    agentUsage: 'Used when QA and DevOps agents meet to discuss test results and release readiness.',
  },
  QA_DEVOPS_PRESENTATION_POSITION: {
    id: 'QA_DEVOPS_PRESENTATION_POSITION',
    type: 'QA_DEVOPS_PRESENTATION_POSITION',
    label: 'Release Readiness Presentation [2.15, 0, 6.25]',
    zone: 'SHARED_COZY_LOUNGE',
    position: [2.15, 0.0, 6.25],
    rotationY: -Math.PI / 2,
    facingRad: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    approach_position: [2.45, 0.0, 6.65],
    target_object: 'QA_DevOps_Shared_Review_Board',
    posture: 'standing',
    radius: 0.4,
    description: 'Standing presentation anchor beside the Shared QA & DevOps Review Board.',
    agentUsage: 'Used when presenting quality-gate results or deployment plans.',
  },
};

export const DEFAULT_QA_DEVOPS_ANCHOR_LIST: QADevOpsActivityAnchor[] = Object.values(
  DEFAULT_QA_DEVOPS_ANCHORS
);

export type QADevOpsDisplaySlotId =
  | 'QA_TEST_DASHBOARD'
  | 'QA_BUG_TRACKER'
  | 'QA_CHECKLIST'
  | 'QA_DEVICE_TESTING'
  | 'QA_DEVOPS_REVIEW_BOARD'
  | 'DEVOPS_SYSTEM_STATUS'
  | 'DEVOPS_PIPELINE_DISPLAY'
  | 'DEVOPS_MONITORING_SCREEN';

export interface QADevOpsDisplaySlotSpec {
  slot_id: QADevOpsDisplaySlotId;
  display_name: string;
  department: 'QUALITY_ASSURANCE' | 'DEVOPS_OPERATIONS' | 'SHARED_QA_DEVOPS';
  associated_mesh: string;
  display_mode: 'STATIC_DEMO_TEXTURE' | 'DYNAMIC_CANVAS_READY';
  expected_data_category: string;
  update_capability: 'STATIC_EMBEDDED_AND_RUNTIME_SWAPPABLE';
  export_behavior: 'BAKED_SRGB_PNG_IN_GLB';
  demo_only: true;
  demo_badge_label: 'DEMO';
  description: string;
}

/**
 * 8 Canonical Display Slots (Section 31) — All strictly DEMO DATA.
 */
export const QA_DEVOPS_DISPLAY_SLOTS: QADevOpsDisplaySlotSpec[] = [
  {
    slot_id: 'QA_TEST_DASHBOARD',
    display_name: 'QA Test Execution & Regression Dashboard',
    department: 'QUALITY_ASSURANCE',
    associated_mesh: 'QA_Main_Display_Screen',
    display_mode: 'STATIC_DEMO_TEXTURE',
    expected_data_category: 'test_execution_summary_demo',
    update_capability: 'STATIC_EMBEDDED_AND_RUNTIME_SWAPPABLE',
    export_behavior: 'BAKED_SRGB_PNG_IN_GLB',
    demo_only: true,
    demo_badge_label: 'DEMO',
    description:
      'Primary QA desk monitor displaying fictional test suite pass/fail counts, regression coverage bars, and execution progress (DEMO DATA).',
  },
  {
    slot_id: 'QA_BUG_TRACKER',
    display_name: 'QA Bug Tracker & Verification Queue',
    department: 'QUALITY_ASSURANCE',
    associated_mesh: 'QA_Secondary_Display_Screen',
    display_mode: 'STATIC_DEMO_TEXTURE',
    expected_data_category: 'bug_triage_queue_demo',
    update_capability: 'STATIC_EMBEDDED_AND_RUNTIME_SWAPPABLE',
    export_behavior: 'BAKED_SRGB_PNG_IN_GLB',
    demo_only: true,
    demo_badge_label: 'DEMO',
    description:
      'Secondary QA desk monitor displaying fictional bug severity tickets, reproduction steps, and fix verification statuses (DEMO DATA).',
  },
  {
    slot_id: 'QA_CHECKLIST',
    display_name: 'Wall-Mounted QA Checklist & Bug Review Board',
    department: 'QUALITY_ASSURANCE',
    associated_mesh: 'QA_Checklist_Board_Surface',
    display_mode: 'STATIC_DEMO_TEXTURE',
    expected_data_category: 'qa_release_checklist_demo',
    update_capability: 'STATIC_EMBEDDED_AND_RUNTIME_SWAPPABLE',
    export_behavior: 'BAKED_SRGB_PNG_IN_GLB',
    demo_only: true,
    demo_badge_label: 'DEMO',
    description:
      'West-wall QA checklist board displaying Test Cases, Regression, Edge Cases, Bug Review, Verification, and Release Sign-Off (DEMO DATA).',
  },
  {
    slot_id: 'QA_DEVICE_TESTING',
    display_name: 'Physical Device Testing Matrix Screen',
    department: 'QUALITY_ASSURANCE',
    associated_mesh: 'QA_Device_Laptop_Screen',
    display_mode: 'STATIC_DEMO_TEXTURE',
    expected_data_category: 'device_compatibility_matrix_demo',
    update_capability: 'STATIC_EMBEDDED_AND_RUNTIME_SWAPPABLE',
    export_behavior: 'BAKED_SRGB_PNG_IN_GLB',
    demo_only: true,
    demo_badge_label: 'DEMO',
    description:
      'Device testing counter laptop and mobile device screens displaying responsive viewport verification and UI checkmarks (DEMO DATA).',
  },
  {
    slot_id: 'QA_DEVOPS_REVIEW_BOARD',
    display_name: 'Shared QA & DevOps Release Readiness Board',
    department: 'SHARED_QA_DEVOPS',
    associated_mesh: 'QA_DevOps_Shared_Review_Surface',
    display_mode: 'STATIC_DEMO_TEXTURE',
    expected_data_category: 'release_readiness_gate_demo',
    update_capability: 'STATIC_EMBEDDED_AND_RUNTIME_SWAPPABLE',
    export_behavior: 'BAKED_SRGB_PNG_IN_GLB',
    demo_only: true,
    demo_badge_label: 'DEMO',
    description:
      'Shared collaborative board linking QA test sign-off with DevOps deployment readiness checklist (DEMO DATA).',
  },
  {
    slot_id: 'DEVOPS_SYSTEM_STATUS',
    display_name: 'DevOps Infrastructure & Operations Status Wall',
    department: 'DEVOPS_OPERATIONS',
    associated_mesh: 'DevOps_Operations_Board_Surface',
    display_mode: 'STATIC_DEMO_TEXTURE',
    expected_data_category: 'infrastructure_operations_status_demo',
    update_capability: 'STATIC_EMBEDDED_AND_RUNTIME_SWAPPABLE',
    export_behavior: 'BAKED_SRGB_PNG_IN_GLB',
    demo_only: true,
    demo_badge_label: 'DEMO',
    description:
      'South-East wall operations board displaying fictional Build, Services, Infrastructure, Monitoring, and Deployment Review statuses (DEMO DATA).',
  },
  {
    slot_id: 'DEVOPS_PIPELINE_DISPLAY',
    display_name: 'DevOps Build & CI/CD Pipeline Monitor',
    department: 'DEVOPS_OPERATIONS',
    associated_mesh: 'DevOps_Main_Display_Screen',
    display_mode: 'STATIC_DEMO_TEXTURE',
    expected_data_category: 'cicd_pipeline_topology_demo',
    update_capability: 'STATIC_EMBEDDED_AND_RUNTIME_SWAPPABLE',
    export_behavior: 'BAKED_SRGB_PNG_IN_GLB',
    demo_only: true,
    demo_badge_label: 'DEMO',
    description:
      'Primary DevOps desk monitor displaying fictional build pipeline stages, container health, and deployment topology (DEMO DATA).',
  },
  {
    slot_id: 'DEVOPS_MONITORING_SCREEN',
    display_name: 'DevOps Service Health & Resource Telemetry Monitor',
    department: 'DEVOPS_OPERATIONS',
    associated_mesh: 'DevOps_Secondary_Display_Screen',
    display_mode: 'STATIC_DEMO_TEXTURE',
    expected_data_category: 'service_telemetry_metrics_demo',
    update_capability: 'STATIC_EMBEDDED_AND_RUNTIME_SWAPPABLE',
    export_behavior: 'BAKED_SRGB_PNG_IN_GLB',
    demo_only: true,
    demo_badge_label: 'DEMO',
    description:
      'Secondary DevOps desk monitor displaying fictional latency curves, node utilization, and runbook alerts (DEMO DATA).',
  },
];

/**
 * 29 Future Action Contracts (Section 28):
 * - 15 QA & Review Agent future actions
 * - 14 DevOps & AI Engine Agent future actions
 */
export const QA_DEVOPS_FUTURE_ACTIONS_CONTRACT: QADevOpsFutureActionContract[] = [
  // QA Agent Future Actions (15)
  {
    action_id: 'qa_idle',
    label: 'Idle (QA Zone)',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_WORKSTATION_APPROACH',
    fallback_anchor: 'QA_DEVOPS_ROOM_IDLE',
    posture: 'standing',
    description: 'Standing ready in the QA testing zone.',
  },
  {
    action_id: 'qa_walk',
    label: 'Walk Patrol (QA & Lounge)',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_DEVOPS_ROOM_IDLE',
    fallback_anchor: 'QA_DEVOPS_ROOM_SPAWN',
    posture: 'standing',
    description: 'Walking along the circulation spine between QA and the central lounge.',
  },
  {
    action_id: 'qa_work_at_desk',
    label: 'Work at QA Desk',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_DESK_WORK',
    fallback_anchor: 'QA_CHAIR',
    posture: 'seated',
    description: 'Seated at the QA workstation authoring test suites.',
  },
  {
    action_id: 'qa_run_tests_demo',
    label: 'Run Tests Demo',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_DESK_WORK',
    fallback_anchor: 'QA_CHAIR',
    posture: 'seated',
    description: 'Executing simulated regression test suites on the primary QA dashboard.',
  },
  {
    action_id: 'qa_inspect_test_results',
    label: 'Inspect Test Results',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_TEST_REPORT_REVIEW',
    fallback_anchor: 'QA_DESK_WORK',
    posture: 'standing',
    description: 'Reviewing test report binders at the QA documentation shelves.',
  },
  {
    action_id: 'qa_reproduce_bug',
    label: 'Reproduce Bug',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_DEVICE_TESTING',
    fallback_anchor: 'QA_DESK_WORK',
    posture: 'standing',
    description: 'Reproducing UI edge-case steps on the physical device testing counter.',
  },
  {
    action_id: 'qa_review_bug_report',
    label: 'Review Bug Report',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_BUG_REVIEW',
    fallback_anchor: 'QA_CHECKLIST_BOARD',
    posture: 'standing',
    description: 'Reviewing bug severity and triage cards on the QA wall board.',
  },
  {
    action_id: 'qa_inspect_device',
    label: 'Inspect Device',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_DEVICE_TESTING',
    fallback_anchor: 'QA_WORKSTATION_APPROACH',
    posture: 'standing',
    description: 'Inspecting mobile phone and tablet viewports on the testing counter.',
  },
  {
    action_id: 'qa_verify_fix',
    label: 'Verify Fix',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_DESK_WORK',
    fallback_anchor: 'QA_CHECKLIST_BOARD',
    posture: 'seated',
    description: 'Verifying patched builds against the bug tracker queue.',
  },
  {
    action_id: 'qa_review_regression',
    label: 'Review Regression',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_CHECKLIST_BOARD',
    fallback_anchor: 'QA_BUG_REVIEW',
    posture: 'standing',
    description: 'Checking regression coverage items on the QA Checklist Wall Board.',
  },
  {
    action_id: 'qa_discuss_with_devops',
    label: 'Discuss with DevOps',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_DEVOPS_LOUNGE_ARMCHAIR',
    fallback_anchor: 'QA_DEVOPS_DISCUSSION_POSITION',
    posture: 'seated',
    description: 'Collaborating with the DevOps Agent in the central cozy lounge.',
  },
  {
    action_id: 'qa_present_results',
    label: 'Present QA Results',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_DEVOPS_PRESENTATION_POSITION',
    fallback_anchor: 'QA_DEVOPS_REVIEW_BOARD',
    posture: 'standing',
    description: 'Presenting quality-gate verification findings at the Shared Review Board.',
  },
  {
    action_id: 'qa_waiting_review',
    label: 'Waiting Review',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_DEVOPS_COFFEE_TABLE',
    fallback_anchor: 'QA_DEVOPS_ROOM_IDLE',
    posture: 'standing',
    description: 'Waiting for owner sign-off beside the central lounge coffee table.',
  },
  {
    action_id: 'qa_quality_gate_review',
    label: 'Quality Gate Review',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_DEVOPS_REVIEW_BOARD',
    fallback_anchor: 'QA_CHECKLIST_BOARD',
    posture: 'standing',
    description: 'Evaluating release readiness checklist items on the Shared Review Board.',
  },
  {
    action_id: 'qa_task_completed',
    label: 'Task Completed (QA)',
    agent_role: 'QA_REVIEW_AGENT',
    target_anchor: 'QA_WORKSTATION_APPROACH',
    fallback_anchor: 'QA_DEVOPS_ROOM_IDLE',
    posture: 'standing',
    description: 'Completing QA sign-off and marking test suite green.',
  },

  // DevOps Agent Future Actions (14)
  {
    action_id: 'devops_idle',
    label: 'Idle (DevOps Zone)',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'DEVOPS_WORKSTATION_APPROACH',
    fallback_anchor: 'QA_DEVOPS_ROOM_IDLE',
    posture: 'standing',
    description: 'Standing ready in the DevOps operations zone.',
  },
  {
    action_id: 'devops_walk',
    label: 'Walk Patrol (DevOps & Lounge)',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'QA_DEVOPS_ROOM_IDLE',
    fallback_anchor: 'QA_DEVOPS_ROOM_SPAWN',
    posture: 'standing',
    description: 'Walking between the DevOps operations zone and the central lounge.',
  },
  {
    action_id: 'devops_monitor_infrastructure',
    label: 'Monitor Infrastructure',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'DEVOPS_DESK_WORK',
    fallback_anchor: 'DEVOPS_CHAIR',
    posture: 'seated',
    description: 'Seated at the DevOps workstation watching service health and telemetry.',
  },
  {
    action_id: 'devops_review_pipeline',
    label: 'Review Pipeline',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'DEVOPS_DESK_WORK',
    fallback_anchor: 'DEVOPS_MONITORING_DISPLAY',
    posture: 'seated',
    description: 'Inspecting CI/CD build stages on the primary DevOps display.',
  },
  {
    action_id: 'devops_inspect_rack',
    label: 'Inspect Rack',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'DEVOPS_RACK_INSPECTION',
    fallback_anchor: 'DEVOPS_WORKSTATION_APPROACH',
    posture: 'standing',
    description: 'Inspecting the dual compact Infrastructure Rack Cabinets and status LEDs.',
  },
  {
    action_id: 'devops_analyze_service_health',
    label: 'Analyze Service Health',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'DEVOPS_MONITORING_DISPLAY',
    fallback_anchor: 'DEVOPS_DESK_WORK',
    posture: 'standing',
    description: 'Analyzing service uptime and health indicators on the Operations Wall Board.',
  },
  {
    action_id: 'devops_review_deployment_plan',
    label: 'Review Deployment Plan',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'QA_DEVOPS_REVIEW_BOARD',
    fallback_anchor: 'DEVOPS_MONITORING_DISPLAY',
    posture: 'standing',
    description: 'Reviewing rollout stages on the Shared QA & DevOps Review Board.',
  },
  {
    action_id: 'devops_diagnose_incident',
    label: 'Diagnose Incident',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'DEVOPS_DESK_WORK',
    fallback_anchor: 'DEVOPS_RACK_INSPECTION',
    posture: 'seated',
    description: 'Diagnosing simulated latency alerts at the DevOps workstation.',
  },
  {
    action_id: 'devops_examine_monitoring_data',
    label: 'Examine Monitoring Data',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'DEVOPS_MONITORING_DISPLAY',
    fallback_anchor: 'DEVOPS_RACK_INSPECTION',
    posture: 'standing',
    description: 'Examining telemetry metrics on the South-East Operations Wall Board.',
  },
  {
    action_id: 'devops_discuss_release_readiness',
    label: 'Discuss Release Readiness',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'QA_DEVOPS_LOUNGE_SOFA',
    fallback_anchor: 'QA_DEVOPS_DISCUSSION_POSITION',
    posture: 'seated',
    description: 'Seated on the cream three-seat sofa aligning release readiness with QA.',
  },
  {
    action_id: 'devops_read_runbook',
    label: 'Read Runbook',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'DEVOPS_INFRASTRUCTURE_REVIEW',
    fallback_anchor: 'DEVOPS_WORKSTATION_APPROACH',
    posture: 'standing',
    description: 'Consulting operational runbooks at the South-West technical storage unit.',
  },
  {
    action_id: 'devops_present_operations_status',
    label: 'Present Operations Status',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'QA_DEVOPS_PRESENTATION_POSITION',
    fallback_anchor: 'DEVOPS_MONITORING_DISPLAY',
    posture: 'standing',
    description: 'Presenting infrastructure readiness at the Shared Review Board.',
  },
  {
    action_id: 'devops_waiting_approval',
    label: 'Waiting Approval',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'QA_DEVOPS_DISCUSSION_POSITION',
    fallback_anchor: 'QA_DEVOPS_ROOM_IDLE',
    posture: 'standing',
    description: 'Waiting for release deployment approval in the central lounge.',
  },
  {
    action_id: 'devops_task_completed',
    label: 'Task Completed (DevOps)',
    agent_role: 'DEVOPS_AI_ENGINE_AGENT',
    target_anchor: 'DEVOPS_WORKSTATION_APPROACH',
    fallback_anchor: 'QA_DEVOPS_ROOM_IDLE',
    posture: 'standing',
    description: 'Completing simulated release rollout verification.',
  },
];

export const QA_DEVOPS_CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'isometric',
    label: 'Isometric 3/4 — 8×16 QA & DevOps Studio (South-West)',
    shortLabel: '8×16 Iso',
    category: 'standard',
    position: [-8.2, 12.2, -5.0],
    target: [4.0, 1.1, 8.0],
    zoom: 46,
    description:
      'Full 8×16 continuous QA & DevOps Integrated Studio overview framing QA (North), Cozy Central Lounge, and DevOps (South).',
  },
  {
    id: 'qa_devops_iso_se',
    label: 'Opposite Isometric — South-East Overview',
    shortLabel: 'SE Iso',
    category: 'standard',
    position: [16.2, 12.2, -5.0],
    target: [4.0, 1.1, 8.0],
    zoom: 46,
    description:
      'Opposite 3/4 isometric view from South-East inspecting the West wall boards (QA Checklist & Shared Review) and West Hub doorway.',
  },
  {
    id: 'top_down',
    label: 'Top-Down 8×16 Blueprint (Zero Wall at Z=8)',
    shortLabel: 'Top Plan',
    category: 'standard',
    position: [4.0, 22.0, 7.98],
    target: [4.0, 0.0, 8.0],
    zoom: 42,
    description:
      'Orthographic top-down plan verifying 8×16 bounds, continuous oak floor, zero wall at Z=8, and clear circulation spine.',
  },
  {
    id: 'qa_zone_closeup',
    label: 'Close-Up: North QA Workstation & Device Testing Counter',
    shortLabel: 'QA Zone',
    category: 'inspection',
    position: [-2.8, 5.2, 9.6],
    target: [3.8, 1.05, 13.5],
    zoom: 78,
    description:
      'Close-up inspection of the QA Workstation, dual QA test displays, 3D Device Testing Counter, and QA Checklist Wall Board.',
  },
  {
    id: 'cozy_lounge_closeup',
    label: 'Close-Up: Central Cozy Lounge & Shared Review Board',
    shortLabel: 'Cozy Lounge',
    category: 'inspection',
    position: [-2.6, 5.0, 4.2],
    target: [4.4, 0.95, 8.0],
    zoom: 82,
    description:
      'Close-up inspection of the large patterned rug, cream 3-seat sofa, matching armchair, wooden coffee table, 3 soft poufs, and Shared Review Board.',
  },
  {
    id: 'devops_zone_closeup',
    label: 'Close-Up: South DevOps Workstation & Dual Infrastructure Racks',
    shortLabel: 'DevOps Zone',
    category: 'inspection',
    position: [-2.8, 5.2, -1.6],
    target: [4.4, 1.05, 2.5],
    zoom: 78,
    description:
      'Close-up inspection of the DevOps Workstation, dual monitoring screens, two compact Infrastructure Rack Cabinets, and Operations Status Wall Board.',
  },
];

export interface QADevOpsBoundingBoxCheckResult {
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

export function validateQADevOpsBoundingBox(
  min: [number, number, number],
  max: [number, number, number],
  tolerance = 0.25
): QADevOpsBoundingBoxCheckResult {
  const width = Number((max[0] - min[0]).toFixed(3));
  const height = Number((max[1] - min[1]).toFixed(3));
  const depth = Number((max[2] - min[2]).toFixed(3));

  const widthDelta = Number(
    Math.abs(width - QA_DEVOPS_MODULE_CONSTANTS.FOOTPRINT_WIDTH).toFixed(3)
  );
  const depthDelta = Number(
    Math.abs(depth - QA_DEVOPS_MODULE_CONSTANTS.FOOTPRINT_DEPTH).toFixed(3)
  );
  const heightDelta = Number(
    Math.min(
      Math.abs(height - QA_DEVOPS_MODULE_CONSTANTS.WALL_HEIGHT),
      Math.abs(
        height -
          (QA_DEVOPS_MODULE_CONSTANTS.WALL_HEIGHT +
            QA_DEVOPS_MODULE_CONSTANTS.FLOOR_THICKNESS)
      )
    ).toFixed(3)
  );

  const originAligned =
    min[0] >= -tolerance &&
    min[0] <= tolerance &&
    min[2] >= -tolerance &&
    min[2] <= tolerance &&
    max[0] >= QA_DEVOPS_MODULE_CONSTANTS.FOOTPRINT_WIDTH - tolerance &&
    max[0] <= QA_DEVOPS_MODULE_CONSTANTS.FOOTPRINT_WIDTH + tolerance &&
    max[2] >= QA_DEVOPS_MODULE_CONSTANTS.FOOTPRINT_DEPTH - tolerance &&
    max[2] <= QA_DEVOPS_MODULE_CONSTANTS.FOOTPRINT_DEPTH + tolerance;

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

export function validateQADevOpsClearanceAndConnectors(): {
  passed: boolean;
  westConnectorClear: boolean;
  northConnectorClear: boolean;
  noWallAtMidpointZ8: boolean;
  circulationSpineClear: boolean;
  anchorCount: number;
  collisions: string[];
} {
  const collisions: string[] = [];
  const westBox = QA_DEVOPS_CONNECTORS_SPEC.QA_DEVOPS_WEST_MAIN.clearance_box;
  const northBox = QA_DEVOPS_CONNECTORS_SPEC.QA_DEVOPS_NORTH_CORRIDOR.clearance_box;

  let westConnectorClear = true;
  let northConnectorClear = true;

  for (const item of QA_DEVOPS_FURNITURE_CATALOG) {
    if (item.category === 'DECOR') continue; // Rug is flat on floor
    const halfW = item.dimensions[0] / 2;
    const halfD = item.dimensions[2] / 2;
    const isRotated90 = Math.abs(Math.sin(item.rotationY)) > 0.7;
    const spanX = isRotated90 ? halfD : halfW;
    const spanZ = isRotated90 ? halfW : halfD;

    const minX = item.position[0] - spanX;
    const maxX = item.position[0] + spanX;
    const minZ = item.position[2] - spanZ;
    const maxZ = item.position[2] + spanZ;

    const overlapsWest =
      maxX > westBox.minX &&
      minX < westBox.maxX &&
      maxZ > westBox.minZ &&
      minZ < westBox.maxZ;
    if (overlapsWest) {
      westConnectorClear = false;
      collisions.push(`${item.id} overlaps QA_DEVOPS_WEST_MAIN clearance box`);
    }

    const overlapsNorth =
      maxX > northBox.minX &&
      minX < northBox.maxX &&
      maxZ > northBox.minZ &&
      minZ < northBox.maxZ;
    if (overlapsNorth) {
      northConnectorClear = false;
      collisions.push(`${item.id} overlaps QA_DEVOPS_NORTH_CORRIDOR clearance box`);
    }
  }

  return {
    passed:
      westConnectorClear &&
      northConnectorClear &&
      DEFAULT_QA_DEVOPS_ANCHOR_LIST.length === 23 &&
      collisions.length === 0,
    westConnectorClear,
    northConnectorClear,
    noWallAtMidpointZ8: true,
    circulationSpineClear: collisions.length === 0,
    anchorCount: DEFAULT_QA_DEVOPS_ANCHOR_LIST.length,
    collisions,
  };
}

export function buildQADevOpsDisplaySlotsJson() {
  return {
    schema_version: 'AI_OFFICE_DISPLAY_SLOTS_V1' as const,
    module_id: QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID,
    asset_id: QA_DEVOPS_MODULE_CONSTANTS.ASSET_ID,
    display_name: QA_DEVOPS_MODULE_CONSTANTS.DISPLAY_NAME,
    generated_at: new Date().toISOString(),
    demo_mode_only: true as const,
    live_infrastructure_connected: false as const,
    total_display_slots: QA_DEVOPS_DISPLAY_SLOTS.length,
    display_slots: QA_DEVOPS_DISPLAY_SLOTS,
  };
}

export function buildQADevOpsRoomBehaviorJson() {
  return {
    schema_version: 'AI_OFFICE_QA_DEVOPS_ROOM_BEHAVIOR_V1' as const,
    room_module_id: QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID,
    module_id: QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID,
    asset_id: QA_DEVOPS_MODULE_CONSTANTS.ASSET_ID,
    display_name: QA_DEVOPS_MODULE_CONSTANTS.DISPLAY_NAME,
    room_type: QA_DEVOPS_MODULE_CONSTANTS.ROOM_TYPE,
    character_included_in_room_glb: false as const,
    character_status: 'DEFERRED_NEXT_STAGE' as const,
    planned_agent_roles: ['QA_REVIEW_AGENT', 'DEVOPS_AI_ENGINE_AGENT'] as const,
    supported_actions: QA_DEVOPS_FUTURE_ACTIONS_CONTRACT,
    footprint: {
      width: QA_DEVOPS_MODULE_CONSTANTS.FOOTPRINT_WIDTH,
      depth: QA_DEVOPS_MODULE_CONSTANTS.FOOTPRINT_DEPTH,
      wall_height: QA_DEVOPS_MODULE_CONSTANTS.WALL_HEIGHT,
      local_origin: QA_DEVOPS_MODULE_CONSTANTS.LOCAL_ORIGIN,
      global_a3_2_offset: QA_DEVOPS_MODULE_CONSTANTS.GLOBAL_A3_2_OFFSET,
      continuous_single_room: true,
      internal_wall_at_z8: false,
    },
    zones: [
      {
        zone_id: 'QA_TESTING_ZONE',
        display_name: 'North Zone — Quality Assurance & Device Testing',
        z_span: [10.6, 16.0],
        agent_role: 'QA_REVIEW_AGENT',
        accent_palette: ['#3E6B73', '#233042', '#C89D54', '#F2ECE1'],
        anchors: [
          'QA_WORKSTATION_APPROACH',
          'QA_DESK_WORK',
          'QA_CHAIR',
          'QA_DEVICE_TESTING',
          'QA_CHECKLIST_BOARD',
          'QA_BUG_REVIEW',
          'QA_TEST_REPORT_REVIEW',
        ],
      },
      {
        zone_id: 'SHARED_COZY_LOUNGE',
        display_name: 'Central Zone — Cozy Collaboration Lounge & Release Review',
        z_span: [5.4, 10.6],
        agent_role: 'SHARED_QA_DEVOPS_COLLABORATION',
        accent_palette: ['#F2ECE1', '#233042', '#5E6F52', '#3E6B73', '#C89D54'],
        anchors: [
          'QA_DEVOPS_REVIEW_BOARD',
          'QA_DEVOPS_LOUNGE_SOFA',
          'QA_DEVOPS_LOUNGE_ARMCHAIR',
          'QA_DEVOPS_COFFEE_TABLE',
          'QA_DEVOPS_DISCUSSION_POSITION',
          'QA_DEVOPS_PRESENTATION_POSITION',
        ],
      },
      {
        zone_id: 'DEVOPS_OPERATIONS_ZONE',
        display_name: 'South Zone — DevOps & AI Engine Operations',
        z_span: [0.0, 5.4],
        agent_role: 'DEVOPS_AI_ENGINE_AGENT',
        accent_palette: ['#5E6F52', '#1E2631', '#38BDF8', '#C89D54'],
        anchors: [
          'DEVOPS_WORKSTATION_APPROACH',
          'DEVOPS_DESK_WORK',
          'DEVOPS_CHAIR',
          'DEVOPS_RACK_INSPECTION',
          'DEVOPS_MONITORING_DISPLAY',
          'DEVOPS_INFRASTRUCTURE_REVIEW',
        ],
      },
    ],
    connectors: QA_DEVOPS_CONNECTORS_SPEC,
    monitor_orientation_contract: {
      rule: 'dot(screenNormal, normalize(viewerPosition - screenPosition)) > 0.7',
      monitors: QA_DEVOPS_MONITORS_SPEC,
    },
  };
}
