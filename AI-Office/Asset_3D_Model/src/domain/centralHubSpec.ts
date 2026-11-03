import type { RoomModuleKey } from './officeLayoutA3Spec';

export const CENTRAL_HUB_REQUIRED_GROUPS = [
  'FLOOR',
  'PARQUET',
  'STONE_PERIMETER',
  'FLOOR_TRIMS',
  'MEETING_TABLE',
  'MEETING_CHAIRS',
  'MEETING_RUG',
  'DECORATION',
  'PLANTS',
  'LIGHT_FIXTURES',
  'ENTRANCE_STRUCTURE',
  'CONNECTORS',
] as const;

export type CentralHubGroupName = (typeof CENTRAL_HUB_REQUIRED_GROUPS)[number];

export const CENTRAL_HUB_MODULE_CONSTANTS = {
  MODULE_ID: 'AI_OFFICE_CENTRAL_HUB_v2',
  moduleId: 'AI_OFFICE_CENTRAL_HUB_v2',
  ASSET_ID: 'ai_office.room.central_hub.v2',
  assetId: 'ai_office.room.central_hub.v2',
  LEGACY_MODULE_ID: 'CENTRAL_HUB_COMMONS_16X16_v1',
  VERSION: '2.0.0',
  version: '2.0.0',
  ROOT_NODE_NAME: 'CENTRAL_HUB_ROOT',
  rootNodeName: 'CENTRAL_HUB_ROOT',
  GLB_FILENAME: 'central_hub_v2.glb',
  MANIFEST_FILENAME: 'central_hub_v2.manifest.json',
  ANCHORS_FILENAME: 'central_hub_v2.anchors.json',
  MEETING_SEATS_FILENAME: 'central_hub.meeting_seats.json',
  LOCAL_ORIGIN: [0, 0, 0] as [number, number, number],
  localOrigin: [0, 0, 0] as [number, number, number],
  GLOBAL_OFFSET: [8, 0, 0] as [number, number, number],
  globalOffsetA3: [8, 0, 0] as [number, number, number],
  DIMENSIONS: [16.0, 16.0, 3.2] as [number, number, number],
  dimensions: [16.0, 16.0, 3.2] as [number, number, number],
  FOOTPRINT_WIDTH: 16.0,
  width: 16.0,
  FOOTPRINT_DEPTH: 16.0,
  depth: 16.0,
  WALL_HEIGHT: 3.2,
  wallHeight: 3.2,
  FLOOR_THICKNESS: 0.16,
  floorThickness: 0.16,
  parquetMinX: 2.0,
  parquetMaxX: 14.0,
  parquetMinZ: 2.0,
  parquetMaxZ: 14.0,
  stoneBorderWidth: 2.0,
  brassTrimWidth: 0.035,
  brassTrimHeight: 0.002,
  tableCenterLocal: [8.0, 0.0, 8.0] as [number, number, number],
  tableCenterGlobal: [16.0, 0.0, 8.0] as [number, number, number],
  tableWidthX: 6.8,
  tableWidth: 6.8,
  tableDepthZ: 2.3,
  tableDepth: 2.3,
  tableHeightY: 0.75,
  tableHeight: 0.75,
  rugWidthX: 8.8,
  rugWidth: 8.8,
  rugDepthZ: 4.8,
  rugDepth: 4.8,
  rugThickness: 0.01,
  entranceCenterLocal: [8.0, 0.0, 0.0] as [number, number, number],
  entranceCenterGlobal: [16.0, 0.0, 0.0] as [number, number, number],
  entranceWidthX: 2.4,
  entranceFrameHeightY: 3.2,
  PARQUET_BOUNDS: {
    minX: 2.0,
    maxX: 14.0,
    minZ: 2.0,
    maxZ: 14.0,
    width: 12.0,
    depth: 12.0,
  },
  STONE_PERIMETER_BAND_WIDTH: 2.0,
  MEETING_TABLE_SPEC: {
    localCenter: [8.0, 0.0, 8.0] as [number, number, number],
    globalCenter: [16.0, 0.0, 8.0] as [number, number, number],
    lengthX: 6.8,
    widthZ: 2.3,
    heightY: 0.75,
  },
  MEETING_RUG_SPEC: {
    localCenter: [8.0, 0.0, 8.0] as [number, number, number],
    globalCenter: [16.0, 0.0, 8.0] as [number, number, number],
    lengthX: 8.8,
    widthZ: 4.8,
    minY: 0.002,
    maxY: 0.012,
  },
  MAIN_ENTRANCE_SPEC: {
    localCenter: [8.0, 0.0, 0.0] as [number, number, number],
    globalCenter: [16.0, 0.0, 0.0] as [number, number, number],
    clearOpeningWidth: 2.4,
    clearOpeningHeight: 2.45,
    totalPortalHeight: 3.2,
  },
  REQUIRED_GROUPS: CENTRAL_HUB_REQUIRED_GROUPS,
} as const;

export type HubMeetingSeatId =
  | 'HUB_MEETING_SEAT_01'
  | 'HUB_MEETING_SEAT_02'
  | 'HUB_MEETING_SEAT_03'
  | 'HUB_MEETING_SEAT_04'
  | 'HUB_MEETING_SEAT_05'
  | 'HUB_MEETING_SEAT_06'
  | 'HUB_MEETING_SEAT_07'
  | 'HUB_MEETING_SEAT_08'
  | 'HUB_MEETING_SEAT_09'
  | 'HUB_MEETING_SEAT_10';

export type PlannedAgentRoleId =
  | 'HUB_MEETING_OWNER_RESERVED'
  | 'boss_pm'
  | 'ceo_executive_assistant'
  | 'uiux_designer_agent'
  | 'frontend_developer_agent'
  | 'backend_developer_agent'
  | 'database_developer_agent'
  | 'research_professor_agent'
  | 'qa_engineer_agent'
  | 'qa_agent'
  | 'devops_agent';

export type SeatOccupancyPolicy =
  | 'OWNER_RESERVED'
  | 'ASSIGNED_AGENT_ACTIVE'
  | 'ASSIGNED_AGENT_PLANNED';

export interface HubMeetingSeatSpec {
  // Primary camelCase properties
  seatId: HubMeetingSeatId;
  seatNumber: number;
  seatDesignation: string;
  side: 'NORTH' | 'SOUTH';
  columnIndex: 1 | 2 | 3 | 4 | 5;
  seatNodeName: string;
  chairNodeName: string;
  chairMeshName: string;
  localPosition: [number, number, number];
  globalPosition: [number, number, number];
  globalSeatPosition: [number, number, number];
  facingRad: number;
  rotationY: number;
  facingLabel: string;
  approachAnchorId: string;
  localApproachPosition: [number, number, number];
  globalApproachPosition: [number, number, number];
  localSeatedPoseTarget: [number, number, number];
  globalSeatedPoseTarget: [number, number, number];
  seatedPoseTarget: {
    pelvisElevationY: number;
    feetGroundedY: number;
    torsoForwardLeanRad: number;
    upperLegPitchRad: number;
    lowerLegPitchRad: number;
    forearmTableReachRad: number;
  };
  occupancyPolicy: SeatOccupancyPolicy;
  assignedRoleId: PlannedAgentRoleId;
  assignedAgentId: PlannedAgentRoleId;
  assignedRole: string;
  assignedDisplayName: string;
  assignedRoleDisplayName: string;
  departmentRoomKey: RoomModuleKey | 'human_owner';
  sourceRoomKey: RoomModuleKey | 'human_owner';
  isRealAvailableCharacter: boolean;
  characterCurrentlyInstantiated: boolean;
  reservedStatus: 'RESERVED_OWNER' | 'AVAILABLE_FOR_AGENT' | 'AWAITING_CHARACTER_BUILD';
  departureDelaySeconds: number;
  staggerDelaySec: number;
  globalRouteWaypoints: Array<[number, number, number]>;
  // Snake_case contract aliases
  seat_id: HubMeetingSeatId;
  seat_number: number;
  chair_node_name: string;
  local_position: [number, number, number];
  global_position: [number, number, number];
  approach_local_position: [number, number, number];
  approach_global_position: [number, number, number];
  seat_facing_radians: number;
  assigned_agent_id: PlannedAgentRoleId;
  assigned_display_name: string;
  department_room_key: RoomModuleKey | 'human_owner';
  is_real_available_character: boolean;
  status_badge: string;
  departure_delay_sec: number;
  route_waypoints_global: Array<[number, number, number]>;
  seated_pose_offset_y: number;
}

const DEFAULT_SEATED_POSE_TARGET = {
  pelvisElevationY: -0.15,
  feetGroundedY: 0.012,
  torsoForwardLeanRad: 0.06,
  upperLegPitchRad: -1.42,
  lowerLegPitchRad: 1.42,
  forearmTableReachRad: -0.58,
};

interface RawSeatSeed {
  seatId: HubMeetingSeatId;
  seatNumber: number;
  seatDesignation: string;
  side: 'NORTH' | 'SOUTH';
  columnIndex: 1 | 2 | 3 | 4 | 5;
  chairNodeName: string;
  localPosition: [number, number, number];
  globalPosition: [number, number, number];
  facingRad: number;
  facingLabel: string;
  approachAnchorId: string;
  localApproachPosition: [number, number, number];
  globalApproachPosition: [number, number, number];
  occupancyPolicy: SeatOccupancyPolicy;
  assignedRoleId: PlannedAgentRoleId;
  assignedDisplayName: string;
  sourceRoomKey: RoomModuleKey | 'human_owner';
  isRealAvailableCharacter: boolean;
  reservedStatus: 'RESERVED_OWNER' | 'AVAILABLE_FOR_AGENT' | 'AWAITING_CHARACTER_BUILD';
  statusBadge: string;
  departureDelaySeconds: number;
  globalRouteWaypoints: Array<[number, number, number]>;
}

function expandSeatSeed(seed: RawSeatSeed): HubMeetingSeatSpec {
  return {
    seatId: seed.seatId,
    seatNumber: seed.seatNumber,
    seatDesignation: seed.seatDesignation,
    side: seed.side,
    columnIndex: seed.columnIndex,
    seatNodeName: seed.chairNodeName,
    chairNodeName: seed.chairNodeName,
    chairMeshName: seed.chairNodeName,
    localPosition: seed.localPosition,
    globalPosition: seed.globalPosition,
    globalSeatPosition: seed.globalPosition,
    facingRad: seed.facingRad,
    rotationY: seed.facingRad,
    facingLabel: seed.facingLabel,
    approachAnchorId: seed.approachAnchorId,
    localApproachPosition: seed.localApproachPosition,
    globalApproachPosition: seed.globalApproachPosition,
    localSeatedPoseTarget: [seed.localPosition[0], 0.45, seed.localPosition[2]],
    globalSeatedPoseTarget: [seed.globalPosition[0], 0.45, seed.globalPosition[2]],
    seatedPoseTarget: { ...DEFAULT_SEATED_POSE_TARGET },
    occupancyPolicy: seed.occupancyPolicy,
    assignedRoleId: seed.assignedRoleId,
    assignedAgentId: seed.assignedRoleId,
    assignedRole: seed.assignedDisplayName,
    assignedDisplayName: seed.assignedDisplayName,
    assignedRoleDisplayName: seed.assignedDisplayName,
    departmentRoomKey: seed.sourceRoomKey,
    sourceRoomKey: seed.sourceRoomKey,
    isRealAvailableCharacter: seed.isRealAvailableCharacter,
    characterCurrentlyInstantiated: seed.isRealAvailableCharacter,
    reservedStatus: seed.reservedStatus,
    departureDelaySeconds: seed.departureDelaySeconds,
    staggerDelaySec: seed.departureDelaySeconds,
    globalRouteWaypoints: seed.globalRouteWaypoints,
    // snake_case aliases
    seat_id: seed.seatId,
    seat_number: seed.seatNumber,
    chair_node_name: seed.chairNodeName,
    local_position: seed.localPosition,
    global_position: seed.globalPosition,
    approach_local_position: seed.localApproachPosition,
    approach_global_position: seed.globalApproachPosition,
    seat_facing_radians: seed.facingRad,
    assigned_agent_id: seed.assignedRoleId,
    assigned_display_name: seed.assignedDisplayName,
    department_room_key: seed.sourceRoomKey,
    is_real_available_character: seed.isRealAvailableCharacter,
    status_badge: seed.statusBadge,
    departure_delay_sec: seed.departureDelaySeconds,
    route_waypoints_global: seed.globalRouteWaypoints,
    seated_pose_offset_y: -0.15,
  };
}

const RAW_SEAT_SEEDS: RawSeatSeed[] = [
  {
    seatId: 'HUB_MEETING_SEAT_01',
    seatNumber: 1,
    seatDesignation: 'HUB_MEETING_OWNER_RESERVED',
    side: 'NORTH',
    columnIndex: 3,
    chairNodeName: 'Hub_Meeting_Chair_01',
    localPosition: [8.0, 0.0, 9.62],
    globalPosition: [16.0, 0.0, 9.62],
    facingRad: Math.PI,
    facingLabel: 'South (-Z) toward Conference Table Center',
    approachAnchorId: 'HUB_APPROACH_SEAT_01',
    localApproachPosition: [8.0, 0.0, 10.55],
    globalApproachPosition: [16.0, 0.0, 10.55],
    occupancyPolicy: 'OWNER_RESERVED',
    assignedRoleId: 'HUB_MEETING_OWNER_RESERVED',
    assignedDisplayName: 'Human Owner / Chairperson (Reserved Empty)',
    sourceRoomKey: 'human_owner',
    isRealAvailableCharacter: false,
    reservedStatus: 'RESERVED_OWNER',
    statusBadge: 'RESERVED FOR OWNER (EMPTY)',
    departureDelaySeconds: 0,
    globalRouteWaypoints: [[16.0, 0.0, 10.55]],
  },
  {
    seatId: 'HUB_MEETING_SEAT_02',
    seatNumber: 2,
    seatDesignation: 'HUB_MEETING_PM_AGENT',
    side: 'NORTH',
    columnIndex: 2,
    chairNodeName: 'Hub_Meeting_Chair_02',
    localPosition: [6.7, 0.0, 9.62],
    globalPosition: [14.7, 0.0, 9.62],
    facingRad: Math.PI,
    facingLabel: 'South (-Z) toward Conference Table Center',
    approachAnchorId: 'HUB_APPROACH_SEAT_02',
    localApproachPosition: [6.7, 0.0, 10.55],
    globalApproachPosition: [14.7, 0.0, 10.55],
    occupancyPolicy: 'ASSIGNED_AGENT_ACTIVE',
    assignedRoleId: 'boss_pm',
    assignedDisplayName: 'Boss PM — Project Manager',
    sourceRoomKey: 'pm_strategy',
    isRealAvailableCharacter: true,
    reservedStatus: 'AVAILABLE_FOR_AGENT',
    statusBadge: 'ACTIVE AGENT (Boss PM)',
    departureDelaySeconds: 0.0,
    globalRouteWaypoints: [
      [12.0, 0.0, 19.2],
      [12.0, 0.0, 17.0],
      [14.7, 0.0, 17.0],
      [14.7, 0.0, 13.8],
      [14.7, 0.0, 10.55],
    ],
  },
  {
    seatId: 'HUB_MEETING_SEAT_03',
    seatNumber: 3,
    seatDesignation: 'HUB_MEETING_CEO_AGENT',
    side: 'NORTH',
    columnIndex: 4,
    chairNodeName: 'Hub_Meeting_Chair_03',
    localPosition: [9.3, 0.0, 9.62],
    globalPosition: [17.3, 0.0, 9.62],
    facingRad: Math.PI,
    facingLabel: 'South (-Z) toward Conference Table Center',
    approachAnchorId: 'HUB_APPROACH_SEAT_03',
    localApproachPosition: [9.3, 0.0, 10.55],
    globalApproachPosition: [17.3, 0.0, 10.55],
    occupancyPolicy: 'ASSIGNED_AGENT_ACTIVE',
    assignedRoleId: 'ceo_executive_assistant',
    assignedDisplayName: 'CEO Executive Assistant',
    sourceRoomKey: 'ceo_executive',
    isRealAvailableCharacter: true,
    reservedStatus: 'AVAILABLE_FOR_AGENT',
    statusBadge: 'ACTIVE AGENT (CEO Exec)',
    departureDelaySeconds: 0.25,
    globalRouteWaypoints: [
      [20.0, 0.0, 19.2],
      [20.0, 0.0, 17.0],
      [17.3, 0.0, 17.0],
      [17.3, 0.0, 13.8],
      [17.3, 0.0, 10.55],
    ],
  },
  {
    seatId: 'HUB_MEETING_SEAT_04',
    seatNumber: 4,
    seatDesignation: 'HUB_MEETING_RESEARCH_AGENT',
    side: 'NORTH',
    columnIndex: 1,
    chairNodeName: 'Hub_Meeting_Chair_04',
    localPosition: [5.4, 0.0, 9.62],
    globalPosition: [13.4, 0.0, 9.62],
    facingRad: Math.PI,
    facingLabel: 'South (-Z) toward Conference Table Center',
    approachAnchorId: 'HUB_APPROACH_SEAT_04',
    localApproachPosition: [5.4, 0.0, 10.55],
    globalApproachPosition: [13.4, 0.0, 10.55],
    occupancyPolicy: 'ASSIGNED_AGENT_ACTIVE',
    assignedRoleId: 'research_professor_agent',
    assignedDisplayName: 'Research & Shared Brain Professor',
    sourceRoomKey: 'research_brain',
    isRealAvailableCharacter: true,
    reservedStatus: 'AVAILABLE_FOR_AGENT',
    statusBadge: 'ACTIVE AGENT (Research Prof)',
    departureDelaySeconds: 0.5,
    globalRouteWaypoints: [
      [4.0, 0.0, 19.2],
      [4.0, 0.0, 17.0],
      [13.4, 0.0, 17.0],
      [13.4, 0.0, 13.8],
      [13.4, 0.0, 10.55],
    ],
  },
  {
    seatId: 'HUB_MEETING_SEAT_05',
    seatNumber: 5,
    seatDesignation: 'HUB_MEETING_UIUX_AGENT',
    side: 'NORTH',
    columnIndex: 5,
    chairNodeName: 'Hub_Meeting_Chair_05',
    localPosition: [10.6, 0.0, 9.62],
    globalPosition: [18.6, 0.0, 9.62],
    facingRad: Math.PI,
    facingLabel: 'South (-Z) toward Conference Table Center',
    approachAnchorId: 'HUB_APPROACH_SEAT_05',
    localApproachPosition: [10.6, 0.0, 10.55],
    globalApproachPosition: [18.6, 0.0, 10.55],
    occupancyPolicy: 'ASSIGNED_AGENT_ACTIVE',
    assignedRoleId: 'uiux_designer_agent',
    assignedDisplayName: 'UI/UX Designer Agent',
    sourceRoomKey: 'uiux_studio',
    isRealAvailableCharacter: true,
    reservedStatus: 'AVAILABLE_FOR_AGENT',
    statusBadge: 'ACTIVE AGENT (UI/UX Designer)',
    departureDelaySeconds: 0.75,
    globalRouteWaypoints: [
      [28.0, 0.0, 19.2],
      [28.0, 0.0, 17.0],
      [18.6, 0.0, 17.0],
      [18.6, 0.0, 13.8],
      [18.6, 0.0, 10.55],
    ],
  },
  {
    seatId: 'HUB_MEETING_SEAT_06',
    seatNumber: 6,
    seatDesignation: 'HUB_MEETING_FRONTEND_AGENT',
    side: 'SOUTH',
    columnIndex: 1,
    chairNodeName: 'Hub_Meeting_Chair_06',
    localPosition: [5.4, 0.0, 6.38],
    globalPosition: [13.4, 0.0, 6.38],
    facingRad: 0,
    facingLabel: 'North (+Z) toward Conference Table Center',
    approachAnchorId: 'HUB_APPROACH_SEAT_06',
    localApproachPosition: [5.4, 0.0, 5.45],
    globalApproachPosition: [13.4, 0.0, 5.45],
    occupancyPolicy: 'ASSIGNED_AGENT_ACTIVE',
    assignedRoleId: 'frontend_developer_agent',
    assignedDisplayName: 'Frontend Developer Agent',
    sourceRoomKey: 'engineering',
    isRealAvailableCharacter: true,
    reservedStatus: 'AVAILABLE_FOR_AGENT',
    statusBadge: 'ACTIVE AGENT (Frontend Dev)',
    departureDelaySeconds: 0.15,
    globalRouteWaypoints: [
      [6.8, 0.0, 8.0],
      [9.4, 0.0, 8.0],
      [11.2, 0.0, 5.45],
      [13.4, 0.0, 5.45],
    ],
  },
  {
    seatId: 'HUB_MEETING_SEAT_07',
    seatNumber: 7,
    seatDesignation: 'HUB_MEETING_BACKEND_AGENT',
    side: 'SOUTH',
    columnIndex: 2,
    chairNodeName: 'Hub_Meeting_Chair_07',
    localPosition: [6.7, 0.0, 6.38],
    globalPosition: [14.7, 0.0, 6.38],
    facingRad: 0,
    facingLabel: 'North (+Z) toward Conference Table Center',
    approachAnchorId: 'HUB_APPROACH_SEAT_07',
    localApproachPosition: [6.7, 0.0, 5.45],
    globalApproachPosition: [14.7, 0.0, 5.45],
    occupancyPolicy: 'ASSIGNED_AGENT_ACTIVE',
    assignedRoleId: 'backend_developer_agent',
    assignedDisplayName: 'Backend Developer Agent',
    sourceRoomKey: 'engineering',
    isRealAvailableCharacter: true,
    reservedStatus: 'AVAILABLE_FOR_AGENT',
    statusBadge: 'ACTIVE AGENT (Backend Dev)',
    departureDelaySeconds: 0.55,
    globalRouteWaypoints: [
      [6.8, 0.0, 8.0],
      [9.4, 0.0, 8.0],
      [11.2, 0.0, 5.45],
      [14.7, 0.0, 5.45],
    ],
  },
  {
    seatId: 'HUB_MEETING_SEAT_08',
    seatNumber: 8,
    seatDesignation: 'HUB_MEETING_DATABASE_AGENT',
    side: 'SOUTH',
    columnIndex: 3,
    chairNodeName: 'Hub_Meeting_Chair_08',
    localPosition: [8.0, 0.0, 6.38],
    globalPosition: [16.0, 0.0, 6.38],
    facingRad: 0,
    facingLabel: 'North (+Z) toward Conference Table Center',
    approachAnchorId: 'HUB_APPROACH_SEAT_08',
    localApproachPosition: [8.0, 0.0, 5.45],
    globalApproachPosition: [16.0, 0.0, 5.45],
    occupancyPolicy: 'ASSIGNED_AGENT_ACTIVE',
    assignedRoleId: 'database_developer_agent',
    assignedDisplayName: 'Database Developer Agent',
    sourceRoomKey: 'engineering',
    isRealAvailableCharacter: true,
    reservedStatus: 'AVAILABLE_FOR_AGENT',
    statusBadge: 'ACTIVE AGENT (Database Dev)',
    departureDelaySeconds: 0.95,
    globalRouteWaypoints: [
      [6.8, 0.0, 8.0],
      [9.4, 0.0, 8.0],
      [11.2, 0.0, 5.45],
      [16.0, 0.0, 5.45],
    ],
  },
  {
    seatId: 'HUB_MEETING_SEAT_09',
    seatNumber: 9,
    seatDesignation: 'HUB_MEETING_QA_AGENT_ACTIVE',
    side: 'SOUTH',
    columnIndex: 4,
    chairNodeName: 'Hub_Meeting_Chair_09',
    localPosition: [9.3, 0.0, 6.38],
    globalPosition: [17.3, 0.0, 6.38],
    facingRad: 0,
    facingLabel: 'North (+Z) toward Conference Table Center',
    approachAnchorId: 'HUB_APPROACH_SEAT_09',
    localApproachPosition: [9.3, 0.0, 5.45],
    globalApproachPosition: [17.3, 0.0, 5.45],
    occupancyPolicy: 'ASSIGNED_AGENT_ACTIVE',
    assignedRoleId: 'qa_engineer_agent',
    assignedDisplayName: 'QA Engineer Agent',
    sourceRoomKey: 'qa_devops_studio',
    isRealAvailableCharacter: true,
    reservedStatus: 'AVAILABLE_FOR_AGENT',
    statusBadge: 'ACTIVE AGENT (QA Engineer)',
    departureDelaySeconds: 1.05,
    globalRouteWaypoints: [
      [25.45, 0.0, 8.0],
      [22.6, 0.0, 8.0],
      [20.8, 0.0, 5.45],
      [17.3, 0.0, 5.45],
    ],
  },
  {
    seatId: 'HUB_MEETING_SEAT_10',
    seatNumber: 10,
    seatDesignation: 'HUB_MEETING_DEVOPS_AGENT_RESERVED',
    side: 'SOUTH',
    columnIndex: 5,
    chairNodeName: 'Hub_Meeting_Chair_10',
    localPosition: [10.6, 0.0, 6.38],
    globalPosition: [18.6, 0.0, 6.38],
    facingRad: 0,
    facingLabel: 'North (+Z) toward Conference Table Center',
    approachAnchorId: 'HUB_APPROACH_SEAT_10',
    localApproachPosition: [10.6, 0.0, 5.45],
    globalApproachPosition: [18.6, 0.0, 5.45],
    occupancyPolicy: 'ASSIGNED_AGENT_PLANNED',
    assignedRoleId: 'devops_agent',
    assignedDisplayName: 'DevOps Agent (Planned V2 — Seat Empty)',
    sourceRoomKey: 'qa_devops_studio',
    isRealAvailableCharacter: false,
    reservedStatus: 'AWAITING_CHARACTER_BUILD',
    statusBadge: 'PLANNED AGENT (DevOps — EMPTY)',
    departureDelaySeconds: 0,
    globalRouteWaypoints: [[18.6, 0.0, 5.45]],
  },
];

export const HUB_MEETING_SEATS_LIST: HubMeetingSeatSpec[] = RAW_SEAT_SEEDS.map(expandSeatSeed);

export interface CentralHubConnectorSpec {
  id: string;
  wall: 'SOUTH' | 'NORTH' | 'WEST' | 'EAST';
  localPosition: [number, number, number];
  globalPosition: [number, number, number];
  clearOpeningWidth: number;
  clearOpeningHeight: number;
  connectsTo: string;
  description: string;
}

export const CENTRAL_HUB_CONNECTORS_SPEC: CentralHubConnectorSpec[] = [
  {
    id: 'HUB_MAIN_ENTRANCE_PORTAL',
    wall: 'SOUTH',
    localPosition: [8.0, 0.0, 0.0],
    globalPosition: [16.0, 0.0, 0.0],
    clearOpeningWidth: 2.4,
    clearOpeningHeight: 2.45,
    connectsTo: 'MAIN_OFFICE_SOUTH_ENTRANCE',
    description: 'Main Office South Architectural Entrance Portal with 2.4u clear doorway opening.',
  },
  {
    id: 'HUB_NORTH_CORRIDOR_OPENING',
    wall: 'NORTH',
    localPosition: [8.0, 0.0, 16.0],
    globalPosition: [16.0, 0.0, 16.0],
    clearOpeningWidth: 16.0,
    clearOpeningHeight: 3.2,
    connectsTo: 'CORRIDOR_ROOT',
    description: 'Open 16u North interface joining the 32x2 Connecting Corridor.',
  },
  {
    id: 'HUB_WEST_DOOR_PORTAL',
    wall: 'WEST',
    localPosition: [0.0, 0.0, 8.0],
    globalPosition: [8.0, 0.0, 8.0],
    clearOpeningWidth: 2.0,
    clearOpeningHeight: 2.45,
    connectsTo: 'ENGINEERING_ROOM_ROOT',
    description: 'West doorway connecting Engineering Studio [8,0,8] to Central Hub.',
  },
  {
    id: 'HUB_EAST_DOOR_PORTAL',
    wall: 'EAST',
    localPosition: [16.0, 0.0, 8.0],
    globalPosition: [24.0, 0.0, 8.0],
    clearOpeningWidth: 2.0,
    clearOpeningHeight: 2.45,
    connectsTo: 'QA_DEVOPS_ROOM_ROOT',
    description: 'East doorway connecting QA & DevOps Studio [24,0,8] to Central Hub.',
  },
];

export interface CentralHubAnchorSpec {
  id: string;
  anchor_id: string;
  name: string;
  label: string;
  display_label: string;
  category:
    | 'MEETING_SEAT'
    | 'APPROACH'
    | 'ENTRANCE'
    | 'CONNECTOR'
    | 'COLLABORATION'
    | 'REFRESHMENT'
    | 'LOUNGE';
  type: string;
  localPosition: [number, number, number];
  local_position: [number, number, number];
  position: [number, number, number];
  globalPosition: [number, number, number];
  global_position: [number, number, number];
  facingRad: number;
  facing_radians: number;
  rotation: [number, number, number];
  radius: number;
  posture: 'sitting' | 'standing';
  associatedNodeName: string;
  associated_node_name: string;
  description: string;
}

function makeAnchor(params: {
  id: string;
  label: string;
  category: CentralHubAnchorSpec['category'];
  localPosition: [number, number, number];
  globalPosition: [number, number, number];
  facingRad: number;
  radius: number;
  posture: 'sitting' | 'standing';
  associatedNodeName: string;
  description: string;
}): CentralHubAnchorSpec {
  const degY = Number(((params.facingRad * 180) / Math.PI).toFixed(2));
  return {
    id: params.id,
    anchor_id: params.id,
    name: params.id,
    label: params.label,
    display_label: params.label,
    category: params.category,
    type: params.category,
    localPosition: params.localPosition,
    local_position: params.localPosition,
    position: params.localPosition,
    globalPosition: params.globalPosition,
    global_position: params.globalPosition,
    facingRad: params.facingRad,
    facing_radians: params.facingRad,
    rotation: [0, degY, 0],
    radius: params.radius,
    posture: params.posture,
    associatedNodeName: params.associatedNodeName,
    associated_node_name: params.associatedNodeName,
    description: params.description,
  };
}

/**
 * 18 Semantic Central Hub Anchors:
 * - 10 Meeting Seat Anchors (`HUB_MEETING_SEAT_01`..`10`)
 * - 4 Connector/Threshold Anchors (`HUB_MAIN_ENTRANCE_PORTAL`, `HUB_NORTH_CORRIDOR_JUNCTION`, `HUB_WEST_DOOR_PORTAL`, `HUB_EAST_DOOR_PORTAL`)
 * - 4 Activity/Hospitality Anchors (`HUB_TABLE_CENTER`, `HUB_REVIEW_DISPLAY_STAND`, `HUB_REFRESHMENT_BAR_STAND`, `HUB_VISITOR_BENCH_SEAT`)
 */
export const CENTRAL_HUB_ANCHORS_LIST: CentralHubAnchorSpec[] = [
  ...HUB_MEETING_SEATS_LIST.map((seat) =>
    makeAnchor({
      id: seat.seatId,
      label: `${seat.seatId} (${seat.assignedDisplayName})`,
      category: 'MEETING_SEAT',
      localPosition: seat.localPosition,
      globalPosition: seat.globalPosition,
      facingRad: seat.facingRad,
      radius: 0.28,
      posture: 'sitting',
      associatedNodeName: seat.chairNodeName,
      description: `Conference seat ${seat.seatNumber} (${seat.side} side) for ${seat.assignedDisplayName}.`,
    })
  ),
  makeAnchor({
    id: 'HUB_MAIN_ENTRANCE_PORTAL',
    label: 'Main Office South Entrance Threshold [16, 0, 0]',
    category: 'ENTRANCE',
    localPosition: [8.0, 0.0, 0.0],
    globalPosition: [16.0, 0.0, 0.0],
    facingRad: 0,
    radius: 0.45,
    posture: 'standing',
    associatedNodeName: 'Hub_Main_South_Entrance_Portal',
    description: 'Main Office South Entrance doorway threshold at local [8,0,0] / global [16,0,0].',
  }),
  makeAnchor({
    id: 'HUB_NORTH_CORRIDOR_JUNCTION',
    label: 'North Corridor Spine Junction [16, 0, 16]',
    category: 'CONNECTOR',
    localPosition: [8.0, 0.0, 15.2],
    globalPosition: [16.0, 0.0, 15.2],
    facingRad: Math.PI,
    radius: 0.45,
    posture: 'standing',
    associatedNodeName: 'CENTRAL_HUB_ROOT',
    description: 'Central Hub North junction meeting the 32x2 Connecting Corridor.',
  }),
  makeAnchor({
    id: 'HUB_WEST_DOOR_PORTAL',
    label: 'West Engineering Studio Connector [8, 0, 8]',
    category: 'CONNECTOR',
    localPosition: [0.0, 0.0, 8.0],
    globalPosition: [8.0, 0.0, 8.0],
    facingRad: Math.PI / 2,
    radius: 0.4,
    posture: 'standing',
    associatedNodeName: 'CENTRAL_HUB_ROOT',
    description: 'West doorway threshold connecting Engineering Studio [8,0,8] to Central Hub.',
  }),
  makeAnchor({
    id: 'HUB_EAST_DOOR_PORTAL',
    label: 'East QA & DevOps Studio Connector [24, 0, 8]',
    category: 'CONNECTOR',
    localPosition: [16.0, 0.0, 8.0],
    globalPosition: [24.0, 0.0, 8.0],
    facingRad: -Math.PI / 2,
    radius: 0.4,
    posture: 'standing',
    associatedNodeName: 'CENTRAL_HUB_ROOT',
    description: 'East doorway threshold connecting QA & DevOps Studio [24,0,8] to Central Hub.',
  }),
  makeAnchor({
    id: 'HUB_TABLE_CENTER',
    label: 'Central Hub Conference Table Center [16, 0.75, 8]',
    category: 'COLLABORATION',
    localPosition: [8.0, 0.75, 8.0],
    globalPosition: [16.0, 0.75, 8.0],
    facingRad: 0,
    radius: 0.5,
    posture: 'standing',
    associatedNodeName: 'Hub_Conference_Table_Group',
    description: 'Center focal point of the 6.8x2.3u executive conference table.',
  }),
  makeAnchor({
    id: 'HUB_REVIEW_DISPLAY_STAND',
    label: 'Central Hub Shared Executive Review Board',
    category: 'COLLABORATION',
    localPosition: [3.2, 0.0, 8.0],
    globalPosition: [11.2, 0.0, 8.0],
    facingRad: -Math.PI / 2,
    radius: 0.36,
    posture: 'standing',
    associatedNodeName: 'Hub_Shared_Review_Display_Group',
    description: 'Presenter standing anchor beside the freestanding single-front-screen review board.',
  }),
  makeAnchor({
    id: 'HUB_REFRESHMENT_BAR_STAND',
    label: 'Central Hub Refreshment & Hospitality Console',
    category: 'REFRESHMENT',
    localPosition: [13.2, 0.0, 13.85],
    globalPosition: [21.2, 0.0, 13.85],
    facingRad: 0,
    radius: 0.36,
    posture: 'standing',
    associatedNodeName: 'Hub_Refreshment_Sideboard_Group',
    description: 'North-East hospitality coffee & water sideboard standing point.',
  }),
  makeAnchor({
    id: 'HUB_VISITOR_BENCH_SEAT',
    label: 'South-East Visitor Hospitality Waiting Bench',
    category: 'LOUNGE',
    localPosition: [13.1, 0.0, 2.25],
    globalPosition: [21.1, 0.0, 2.25],
    facingRad: -Math.PI / 2,
    radius: 0.36,
    posture: 'sitting',
    associatedNodeName: 'Hub_Visitor_Waiting_Bench_Group',
    description: 'South-East visitor hospitality bench seating anchor.',
  }),
];

export interface CentralHubCatalogItem {
  id: string;
  name: string;
  category: CentralHubGroupName;
  localPosition: [number, number, number];
  dimensions: [number, number, number];
  description: string;
}

export const CENTRAL_HUB_FURNITURE_CATALOG: CentralHubCatalogItem[] = [
  {
    id: 'Hub_Conference_Table_Group',
    name: 'Executive Collaborative Conference Table (10-Seat)',
    category: 'MEETING_TABLE',
    localPosition: [8.0, 0.375, 8.0],
    dimensions: [6.8, 0.75, 2.3],
    description:
      '6.8×2.3u walnut & warm medium-oak conference table with beveled brass/charcoal edge trim, 3 sculpted pedestals, recessed cable management trough, botanical centerpiece, notebooks, and review tablets.',
  },
  {
    id: 'Hub_Meeting_Chair_01',
    name: 'Owner Reserved Head Conference Chair (#01)',
    category: 'MEETING_CHAIRS',
    localPosition: [8.0, 0.46, 9.62],
    dimensions: [0.58, 0.92, 0.58],
    description:
      'North-center conference chair reserved for Human Owner (HUB_MEETING_OWNER_RESERVED) with brass crest bar.',
  },
  {
    id: 'Hub_Meeting_Area_Rug_Group',
    name: 'Central Hub Woven Area Rug (8.8×4.8u)',
    category: 'MEETING_RUG',
    localPosition: [8.0, 0.007, 8.0],
    dimensions: [8.8, 0.012, 4.8],
    description:
      'Low-profile 3D woven rug (Y=0.002..0.012) in muted navy, warm cream, and greige with brushed-brass border inlay.',
  },
  {
    id: 'Hub_Main_South_Entrance_Portal',
    name: 'Main Office South Architectural Entrance Portal ([16,0,0])',
    category: 'ENTRANCE_STRUCTURE',
    localPosition: [8.0, 1.6, 0.14],
    dimensions: [16.0, 3.2, 0.95],
    description:
      'Restored & upgraded South main office entrance with 2.4u clear doorway opening, 3.2u walnut/oak portal frame, glazed double-door leaves with brass pulls, welcome mat, warm entry sconces, and flanking planters.',
  },
  {
    id: 'Hub_Entrance_Welcome_Mat_Group',
    name: 'Recessed Coir & Brass Welcome Mat',
    category: 'ENTRANCE_STRUCTURE',
    localPosition: [8.0, 0.005, 0.95],
    dimensions: [2.2, 0.008, 1.15],
    description: 'Recessed architectural welcome mat inside the Main South Entrance threshold.',
  },
  {
    id: 'Hub_Refreshment_Sideboard_Group',
    name: 'Executive Hospitality & Coffee Refreshment Sideboard',
    category: 'DECORATION',
    localPosition: [13.2, 0.42, 14.95],
    dimensions: [2.2, 0.86, 0.52],
    description:
      'North-East commons sideboard with espresso/water station, ceramic carafe, cup tray, and archival briefing folios.',
  },
  {
    id: 'Hub_Visitor_Waiting_Bench_Group',
    name: 'South-East Visitor Hospitality Bench & Side Table',
    category: 'DECORATION',
    localPosition: [13.1, 0.32, 2.25],
    dimensions: [2.1, 0.65, 0.68],
    description:
      'Restrained upholstered commons bench and warm oak side table near the South-East entrance bay.',
  },
  {
    id: 'Hub_Shared_Review_Display_Group',
    name: 'Freestanding Collaborative Sprint & Architecture Review Board',
    category: 'DECORATION',
    localPosition: [2.35, 1.05, 8.0],
    dimensions: [0.42, 1.95, 1.68],
    description:
      'Single-sided freestanding digital review display facing East (+X) toward the conference table with an opaque charcoal rear casing and walnut/brass easel frame.',
  },
  {
    id: 'Hub_Planter_NW_Corner',
    name: 'North-West Architectural Planter',
    category: 'PLANTS',
    localPosition: [1.15, 0.55, 14.85],
    dimensions: [0.68, 1.25, 0.68],
    description: 'Architectural wood & brass planter in the North-West commons corner.',
  },
  {
    id: 'Hub_Planter_NE_Corner',
    name: 'North-East Architectural Planter',
    category: 'PLANTS',
    localPosition: [14.85, 0.55, 14.85],
    dimensions: [0.68, 1.25, 0.68],
    description: 'Architectural wood & brass planter in the North-East commons corner.',
  },
  {
    id: 'Hub_Chandelier_Fixture_Group',
    name: 'Suspended Brass Linear Conference Chandelier',
    category: 'LIGHT_FIXTURES',
    localPosition: [8.0, 2.85, 8.0],
    dimensions: [4.8, 0.09, 0.85],
    description: 'Warm architectural linear chandelier suspended over the conference table.',
  },
  {
    id: 'Hub_Pedestal_Lamps_Group',
    name: '4 Warm Perimeter Pedestal Lamps',
    category: 'LIGHT_FIXTURES',
    localPosition: [8.0, 0.9, 8.0],
    dimensions: [11.6, 1.8, 11.2],
    description: '4 warm architectural floor lamps framing the Central Hub commons.',
  },
];

export interface CentralHubMeetingSeatsJsonV2 {
  schema_version: 'AI_OFFICE_CENTRAL_HUB_MEETING_SEATS_V2';
  hub_module_id: typeof CENTRAL_HUB_MODULE_CONSTANTS.MODULE_ID;
  hub_asset_id: typeof CENTRAL_HUB_MODULE_CONSTANTS.ASSET_ID;
  generated_at: string;
  table_center_local: [number, number, number];
  table_center_global: [number, number, number];
  table_dimensions: [number, number, number];
  total_seats: 10;
  planned_agent_roles_count: 9;
  real_available_agent_seats: 8;
  currently_instantiated_agents_count: 8;
  empty_reserved_seats: 2;
  owner_reserved_seat_id: 'HUB_MEETING_SEAT_01';
  owner_reserved_designation: 'HUB_MEETING_OWNER_RESERVED';
  seats: HubMeetingSeatSpec[];
}

export type CentralHubMeetingSeatsJsonV1 = CentralHubMeetingSeatsJsonV2;

export function buildCentralHubMeetingSeatsJson(): CentralHubMeetingSeatsJsonV2 {
  return {
    schema_version: 'AI_OFFICE_CENTRAL_HUB_MEETING_SEATS_V2',
    hub_module_id: CENTRAL_HUB_MODULE_CONSTANTS.MODULE_ID,
    hub_asset_id: CENTRAL_HUB_MODULE_CONSTANTS.ASSET_ID,
    generated_at: new Date().toISOString(),
    table_center_local: [...CENTRAL_HUB_MODULE_CONSTANTS.MEETING_TABLE_SPEC.localCenter],
    table_center_global: [...CENTRAL_HUB_MODULE_CONSTANTS.MEETING_TABLE_SPEC.globalCenter],
    table_dimensions: [
      CENTRAL_HUB_MODULE_CONSTANTS.MEETING_TABLE_SPEC.lengthX,
      CENTRAL_HUB_MODULE_CONSTANTS.MEETING_TABLE_SPEC.heightY,
      CENTRAL_HUB_MODULE_CONSTANTS.MEETING_TABLE_SPEC.widthZ,
    ],
    total_seats: 10,
    planned_agent_roles_count: 9,
    real_available_agent_seats: 8,
    currently_instantiated_agents_count: 8,
    empty_reserved_seats: 2,
    owner_reserved_seat_id: 'HUB_MEETING_SEAT_01',
    owner_reserved_designation: 'HUB_MEETING_OWNER_RESERVED',
    seats: HUB_MEETING_SEATS_LIST.map((s) => ({ ...s })),
  };
}

export interface CentralHubAnchorsJsonV2 {
  schema_version: 'AI_OFFICE_CENTRAL_HUB_ANCHORS_V2';
  module_id: typeof CENTRAL_HUB_MODULE_CONSTANTS.MODULE_ID;
  root_node: typeof CENTRAL_HUB_MODULE_CONSTANTS.ROOT_NODE_NAME;
  local_origin: [number, number, number];
  global_offset_a3_2: [number, number, number];
  anchor_count: number;
  anchors: CentralHubAnchorSpec[];
}

export function buildCentralHubAnchorsJson(): CentralHubAnchorsJsonV2 {
  return {
    schema_version: 'AI_OFFICE_CENTRAL_HUB_ANCHORS_V2',
    module_id: CENTRAL_HUB_MODULE_CONSTANTS.MODULE_ID,
    root_node: CENTRAL_HUB_MODULE_CONSTANTS.ROOT_NODE_NAME,
    local_origin: [...CENTRAL_HUB_MODULE_CONSTANTS.LOCAL_ORIGIN],
    global_offset_a3_2: [...CENTRAL_HUB_MODULE_CONSTANTS.GLOBAL_OFFSET],
    anchor_count: CENTRAL_HUB_ANCHORS_LIST.length,
    anchors: CENTRAL_HUB_ANCHORS_LIST.map((a) => ({ ...a })),
  };
}

export interface CentralHubManifestV2 {
  schema_version: 'AI_OFFICE_CENTRAL_HUB_MANIFEST_V2';
  module_id: typeof CENTRAL_HUB_MODULE_CONSTANTS.MODULE_ID;
  asset_id: typeof CENTRAL_HUB_MODULE_CONSTANTS.ASSET_ID;
  version: string;
  generated_at: string;
  root_node_name: typeof CENTRAL_HUB_MODULE_CONSTANTS.ROOT_NODE_NAME;
  glb_filename: string;
  glb_size_bytes: number;
  glb_sha256: string;
  dimensions: [number, number, number];
  local_origin: [number, number, number];
  global_offset_a3_2: [number, number, number];
  required_groups: readonly string[];
  geometry_stats: {
    mesh_count: number;
    triangle_count: number;
    material_count: number;
    texture_count: number;
    group_mesh_counts?: Record<string, number>;
  };
  measured_bounds: {
    local_min: [number, number, number];
    local_max: [number, number, number];
    size: [number, number, number];
  };
  flooring_architecture: {
    central_parquet_zone: string;
    perimeter_circulation_zone: string;
    transition_trim: string;
  };
  main_south_entrance: {
    global_position: [number, number, number];
    local_position: [number, number, number];
    clear_opening_width_x: number;
    portal_height_y: number;
  };
  meeting_capacity: {
    total_seats: 10;
    planned_agent_roles: 9;
    real_available_characters: 8;
    empty_reserved_seats: 2;
    owner_reserved_seat_id: 'HUB_MEETING_SEAT_01';
  };
  connectors: CentralHubConnectorSpec[];
  catalog_items: CentralHubCatalogItem[];
  validation_status: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}

export function buildCentralHubManifestV2(options: {
  glbSizeBytes?: number;
  glbSha256?: string;
  meshCount: number;
  triangleCount: number;
  materialCount: number;
  textureCount?: number;
  groupMeshCounts?: Record<string, number>;
  measuredBounds?: {
    local_min: [number, number, number];
    local_max: [number, number, number];
    size: [number, number, number];
  };
  validationStatus?: 'PASS' | 'FAIL' | 'NOT_VERIFIED';
}): CentralHubManifestV2 {
  return {
    schema_version: 'AI_OFFICE_CENTRAL_HUB_MANIFEST_V2',
    module_id: CENTRAL_HUB_MODULE_CONSTANTS.MODULE_ID,
    asset_id: CENTRAL_HUB_MODULE_CONSTANTS.ASSET_ID,
    version: CENTRAL_HUB_MODULE_CONSTANTS.VERSION,
    generated_at: new Date().toISOString(),
    root_node_name: CENTRAL_HUB_MODULE_CONSTANTS.ROOT_NODE_NAME,
    glb_filename: CENTRAL_HUB_MODULE_CONSTANTS.GLB_FILENAME,
    glb_size_bytes: options.glbSizeBytes ?? 0,
    glb_sha256: options.glbSha256 ?? '',
    dimensions: [16.0, 16.0, 3.2],
    local_origin: [0, 0, 0],
    global_offset_a3_2: [8, 0, 0],
    required_groups: CENTRAL_HUB_REQUIRED_GROUPS,
    geometry_stats: {
      mesh_count: options.meshCount,
      triangle_count: options.triangleCount,
      material_count: options.materialCount,
      texture_count: options.textureCount ?? 6,
      group_mesh_counts: options.groupMeshCounts,
    },
    measured_bounds: options.measuredBounds ?? {
      local_min: [0, -0.16, 0],
      local_max: [16, 3.2, 16],
      size: [16, 3.36, 16],
    },
    flooring_architecture: {
      central_parquet_zone:
        '12×12u Warm Natural Oak Herringbone / Chevron Parquet (local X=2..14, Z=2..14)',
      perimeter_circulation_zone:
        '2u Warm Greige Large-Format Stone border continuous with 32×2 Connecting Corridor',
      transition_trim: '2mm Brushed Brass inlay frame at X=2, X=14, Z=2, Z=14',
    },
    main_south_entrance: {
      global_position: [16, 0, 0],
      local_position: [8, 0, 0],
      clear_opening_width_x: 2.4,
      portal_height_y: 3.2,
    },
    meeting_capacity: {
      total_seats: 10,
      planned_agent_roles: 9,
      real_available_characters: 8,
      empty_reserved_seats: 2,
      owner_reserved_seat_id: 'HUB_MEETING_SEAT_01',
    },
    connectors: CENTRAL_HUB_CONNECTORS_SPEC,
    catalog_items: CENTRAL_HUB_FURNITURE_CATALOG,
    validation_status: options.validationStatus ?? 'PASS',
  };
}

export function validateCentralHubBoundingBox(
  min: [number, number, number],
  max: [number, number, number],
  sizeOrTolerance: [number, number, number] | number = 0.25
): {
  valid: boolean;
  widthError: number;
  depthError: number;
  heightError: number;
  measuredSize: [number, number, number];
} {
  const tolerance = typeof sizeOrTolerance === 'number' ? sizeOrTolerance : 0.25;
  const measuredW = Number((max[0] - min[0]).toFixed(3));
  const measuredH = Number((max[1] - min[1]).toFixed(3));
  const measuredD = Number((max[2] - min[2]).toFixed(3));
  const widthError = Number(Math.abs(measuredW - 16.0).toFixed(3));
  const depthError = Number(Math.abs(measuredD - 16.0).toFixed(3));
  // Height can be 3.20 (from Y=0..3.20) or 3.36 (from Y=-0.16..3.20 with slab)
  const topError = Number(Math.abs(max[1] - 3.2).toFixed(3));
  const valid = widthError <= tolerance && depthError <= tolerance && topError <= tolerance;
  return {
    valid,
    widthError,
    depthError,
    heightError: topError,
    measuredSize: [measuredW, measuredH, measuredD],
  };
}

export const CENTRAL_HUB_CAMERA_PRESETS = [
  {
    id: 'focus_central_hub',
    label: 'Open Central Hub (16×16 Commons)',
    shortLabel: 'Central Hub Focus',
    category: 'standard' as const,
    position: [31.0, 18.8, -7.0] as [number, number, number],
    target: [16.0, 0.85, 8.0] as [number, number, number],
    zoom: 38.0,
    description: 'Frames the 16×16 Open Central Hub commons at [8, 0, 0].',
  },
  {
    id: 'focus_meeting_table',
    label: 'Meeting Focus (10-Seat Conference Table)',
    shortLabel: 'Meeting Focus',
    category: 'inspection' as const,
    position: [26.5, 13.8, -2.5] as [number, number, number],
    target: [16.0, 0.78, 8.0] as [number, number, number],
    zoom: 58.0,
    description: 'Close-up framing of the 10-seat conference table at [16, 0, 8].',
  },
  {
    id: 'focus_main_entrance',
    label: 'Main South Entrance Portal [16, 0, 0]',
    shortLabel: 'Main Entrance',
    category: 'inspection' as const,
    position: [24.0, 11.2, -7.2] as [number, number, number],
    target: [16.0, 1.35, 0.6] as [number, number, number],
    zoom: 70.0,
    description: 'Frames the 3.2u Main South Entrance Portal at [16, 0, 0].',
  },
];

