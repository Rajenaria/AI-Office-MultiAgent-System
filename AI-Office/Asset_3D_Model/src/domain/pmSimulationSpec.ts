import { FURNITURE_CATALOG, MODULE_CONSTANTS } from './modularRoomSpec';

export type PMAgentStateId =
  | 'IDLE'
  | 'MOVING'
  | 'WORKING'
  | 'READING'
  | 'THINKING'
  | 'MEETING'
  | 'PRESENTING'
  | 'PHONE_CALL'
  | 'COFFEE_BREAK'
  | 'WAITING_APPROVAL'
  | 'TASK_COMPLETED';

export type PMActionId =
  | 'idle'
  | 'patrol'
  | 'work_desk'
  | 'meeting_briefing'
  | 'present_board'
  | 'read_document'
  | 'think_plan'
  | 'phone_call'
  | 'coffee_break'
  | 'waiting_approval'
  | 'task_completed';

export type AnchorId =
  | 'SPAWN_POINT'
  | 'PM_DESK_APPROACH'
  | 'PM_DESK_WORK_POSITION'
  | 'PM_CHAIR_POSITION'
  | 'MEETING_TABLE_APPROACH'
  | 'MEETING_SEAT_POSITION'
  | 'PRESENTATION_BOARD_POSITION'
  | 'BOOKSHELF_POSITION'
  | 'COFFEE_BREAK_POSITION'
  | 'ROOM_IDLE_POSITION';

export interface ActivityAnchor {
  id: AnchorId;
  label: string;
  position: [number, number, number];
  /**
   * World Y rotation in radians where character local forward (+Z) faces:
   * 0 = North (+Z), Math.PI/2 = East (+X), Math.PI = South (-Z), -Math.PI/2 = West (-X)
   */
  facingRad: number;
  approachAnchorId?: AnchorId;
  associatedAction: PMActionId;
  posture: 'standing' | 'seated' | 'leaning';
  description: string;
}

export interface WalkWaypoint {
  id: string;
  position: [number, number]; // [x, z]
  neighbors: string[];
}

export interface PMActionDefinition {
  id: PMActionId;
  code: string;
  labelId: string; // Indonesian primary label per prompt
  labelEn: string;
  targetState: PMAgentStateId;
  targetAnchorId: AnchorId | null;
  requiresWalk: boolean;
  clipName: string;
  speechBubble?: string;
  thoughtBubble?: string;
  statusBadgeText: string;
  badgeColor: 'emerald' | 'amber' | 'sky' | 'purple' | 'coral' | 'slate';
  description: string;
}

export type CharacterSourceType = 'original_pm' | 'imported_glb';

export type AnimationCapabilityMode =
  | 'CASE_A_EMBEDDED_CLIPS'
  | 'CASE_B_ARTICULATED_PARTS'
  | 'CASE_C_RIGID_TRANSFORM';

export interface GLBInspectionReport {
  assetSource: 'original_room_native' | 'project_asset' | 'runtime_upload';
  assetPathOrName: string;
  loadedAt: string;
  fileSizeBytes: number;
  rootNodeName: string;
  hierarchyTree: string[];
  meshNames: string[];
  meshCount: number;
  materialNames: string[];
  materialCount: number;
  rawBounds: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  rawHeight: number;
  normalizedHeight: number;
  appliedScaleFactor: number;
  footOffsetY: number;
  localForwardDirection: [number, number, number];
  hasSkeleton: boolean;
  boneCount: number;
  boneNames: string[];
  skinnedMeshCount: number;
  animationClips: Array<{
    name: string;
    duration: number;
    trackCount: number;
  }>;
  articulatedPartsFound: {
    head: string | null;
    torso: string | null;
    leftArm: string | null;
    rightArm: string | null;
    leftLeg: string | null;
    rightLeg: string | null;
  };
  capabilityMode: AnimationCapabilityMode;
  capabilitySummary: string;
  disclosures: string[];
}

export interface PMSimulationExportConfig {
  schema_version: string;
  room_module_id: string;
  simulation_mode: 'VISUAL_DEMONSTRATION_ONLY';
  character_source: CharacterSourceType;
  character_asset_reference: {
    source_type: 'original_room_native' | 'project_asset' | 'runtime_upload';
    asset_path: string;
    target_height_units: number;
    applied_scale: number;
    local_forward: [number, number, number];
    capability_mode: AnimationCapabilityMode;
  };
  spawn: {
    anchor_id: AnchorId;
    position: [number, number, number];
    facing_rad: number;
  };
  anchors: Record<AnchorId, ActivityAnchor>;
  waypoints: WalkWaypoint[];
  actions: PMActionDefinition[];
  animation_mappings: Record<PMActionId, {
    embedded_clip: string;
    procedural_fallback: string;
    props_used: string[];
  }>;
}

export const DEFAULT_ACTIVITY_ANCHORS: Record<AnchorId, ActivityAnchor> = {
  SPAWN_POINT: {
    id: 'SPAWN_POINT',
    label: 'Spawn Point (South Entrance)',
    position: [4.0, 0, 1.55],
    facingRad: 0, // Facing North (+Z) into the room
    associatedAction: 'idle',
    posture: 'standing',
    description: 'Initial Boss PM entry point inside the South modular passage threshold.',
  },
  ROOM_IDLE_POSITION: {
    id: 'ROOM_IDLE_POSITION',
    label: 'Room Idle Center (Rug)',
    position: [3.35, 0, 5.15],
    facingRad: 2.35, // Facing South-East (+X, -Z) toward the isometric camera
    associatedAction: 'idle',
    posture: 'standing',
    description: 'Central standing spot on the woven studio rug with clear sightlines.',
  },
  PM_DESK_APPROACH: {
    id: 'PM_DESK_APPROACH',
    label: 'PM Desk Approach',
    position: [2.78, 0, 5.35],
    facingRad: -Math.PI / 2, // Facing West (-X)
    associatedAction: 'work_desk',
    posture: 'standing',
    description: 'Clear approach point beside the executive leather chair before sitting/working.',
  },
  PM_DESK_WORK_POSITION: {
    id: 'PM_DESK_WORK_POSITION',
    label: 'PM Desk Work Position',
    position: [1.96, 0, 5.35],
    facingRad: -Math.PI / 2, // Facing West (-X) toward monitor & keyboard
    approachAnchorId: 'PM_DESK_APPROACH',
    associatedAction: 'work_desk',
    posture: 'seated',
    description: 'Active workstation position in front of the dual-screen PM desk.',
  },
  PM_CHAIR_POSITION: {
    id: 'PM_CHAIR_POSITION',
    label: 'PM Executive Chair Anchor',
    position: [2.05, 0, 5.35],
    facingRad: -Math.PI / 2,
    approachAnchorId: 'PM_DESK_APPROACH',
    associatedAction: 'work_desk',
    posture: 'seated',
    description: 'Seated anchor aligned with the ergonomic leather executive task chair.',
  },
  MEETING_TABLE_APPROACH: {
    id: 'MEETING_TABLE_APPROACH',
    label: 'Meeting Table Approach',
    position: [2.85, 0, 2.25],
    facingRad: -Math.PI / 2,
    associatedAction: 'meeting_briefing',
    posture: 'standing',
    description: 'Walkable approach node east of the mini collaboration table.',
  },
  MEETING_SEAT_POSITION: {
    id: 'MEETING_SEAT_POSITION',
    label: 'Meeting Briefing Position',
    position: [2.52, 0, 2.25],
    facingRad: -Math.PI / 2, // Facing West (-X) toward collaboration table
    approachAnchorId: 'MEETING_TABLE_APPROACH',
    associatedAction: 'meeting_briefing',
    posture: 'standing',
    description: 'Briefing position at the head of the sprint collaboration table.',
  },
  PRESENTATION_BOARD_POSITION: {
    id: 'PRESENTATION_BOARD_POSITION',
    label: 'Strategy Board Presentation',
    position: [5.35, 0, 6.42],
    facingRad: 0, // Facing North (+Z) toward wall-mounted Strategy Board
    associatedAction: 'present_board',
    posture: 'standing',
    description: 'Presentation stance in front of the Wall-Mounted PM Strategy & Roadmap Board.',
  },
  BOOKSHELF_POSITION: {
    id: 'BOOKSHELF_POSITION',
    label: 'Tall Bookcase Reading Spot',
    position: [1.95, 0, 6.55],
    facingRad: 0, // Facing North (+Z) toward Tall Bookcase
    associatedAction: 'read_document',
    posture: 'standing',
    description: 'Reading & reference lookup spot in front of the five-tier walnut bookcase.',
  },
  COFFEE_BREAK_POSITION: {
    id: 'COFFEE_BREAK_POSITION',
    label: 'Coffee & Refreshment Counter',
    position: [2.55, 0, 1.05],
    facingRad: -2.15, // Facing SW toward Espresso & Pour-Over station
    associatedAction: 'coffee_break',
    posture: 'standing',
    description: 'Refreshment break position beside the South-West espresso & kettle counter.',
  },
};

/**
 * Connected walkable waypoint graph inside the 8x8 PM Room.
 * Carefully routed around:
 * - PM_Executive_Desk [1.35, 5.35] & Chair [2.15, 5.35]
 * - PM_Cozy_Sofa [3.95, 3.85] & PM_Coffee_Table [5.35, 3.65]
 * - PM_Collaboration_Table [1.75, 2.25]
 * - PM_Corner_Credenza [1.35, 0.75]
 * - PM_Tall_Bookcase [1.95, 7.42] & PM_Credenza_Cabinet [5.35, 7.35]
 */
export const ROOM_WALK_WAYPOINTS: WalkWaypoint[] = [
  { id: 'WP_SOUTH_ENTRY', position: [4.0, 1.55], neighbors: ['WP_SOUTH_WEST', 'WP_SOUTH_EAST', 'WP_WEST_LOWER'] },
  { id: 'WP_SOUTH_WEST', position: [2.75, 1.25], neighbors: ['WP_SOUTH_ENTRY', 'WP_WEST_LOWER'] },
  { id: 'WP_WEST_LOWER', position: [2.85, 2.25], neighbors: ['WP_SOUTH_WEST', 'WP_SOUTH_ENTRY', 'WP_WEST_MID'] },
  { id: 'WP_WEST_MID', position: [2.85, 3.85], neighbors: ['WP_WEST_LOWER', 'WP_WEST_DESK', 'WP_CENTER_RUG'] },
  { id: 'WP_WEST_DESK', position: [2.85, 5.35], neighbors: ['WP_WEST_MID', 'WP_NORTH_WEST', 'WP_CENTER_RUG'] },
  { id: 'WP_CENTER_RUG', position: [3.45, 5.25], neighbors: ['WP_WEST_MID', 'WP_WEST_DESK', 'WP_NORTH_MID', 'WP_EAST_UPPER'] },
  { id: 'WP_NORTH_WEST', position: [2.25, 6.45], neighbors: ['WP_WEST_DESK', 'WP_NORTH_MID'] },
  { id: 'WP_NORTH_MID', position: [3.85, 6.42], neighbors: ['WP_NORTH_WEST', 'WP_CENTER_RUG', 'WP_NORTH_BOARD'] },
  { id: 'WP_NORTH_BOARD', position: [5.35, 6.42], neighbors: ['WP_NORTH_MID', 'WP_EAST_UPPER'] },
  { id: 'WP_EAST_UPPER', position: [6.15, 5.35], neighbors: ['WP_NORTH_BOARD', 'WP_CENTER_RUG', 'WP_EAST_MID'] },
  { id: 'WP_EAST_MID', position: [6.45, 3.95], neighbors: ['WP_EAST_UPPER', 'WP_SOUTH_EAST'] },
  { id: 'WP_SOUTH_EAST', position: [5.65, 2.15], neighbors: ['WP_EAST_MID', 'WP_SOUTH_ENTRY'] },
];

export const PATROL_ANCHOR_SEQUENCE: AnchorId[] = [
  'ROOM_IDLE_POSITION',
  'PM_DESK_APPROACH',
  'BOOKSHELF_POSITION',
  'PRESENTATION_BOARD_POSITION',
  'COFFEE_BREAK_POSITION',
  'MEETING_TABLE_APPROACH',
];

export const AUTO_DEMO_SEQUENCE: Array<{
  actionId: PMActionId;
  durationSeconds: number;
  stepTitle: string;
}> = [
  { actionId: 'idle', durationSeconds: 2.5, stepTitle: '1/8 · Idle / Santai di Ruang PM' },
  { actionId: 'work_desk', durationSeconds: 5.5, stepTitle: '2/8 · Berjalan ke Meja & Kerja di Komputer' },
  { actionId: 'meeting_briefing', durationSeconds: 5.5, stepTitle: '3/8 · Berjalan ke Meja Kolaborasi & Rapat Briefing' },
  { actionId: 'present_board', durationSeconds: 5.5, stepTitle: '4/8 · Berjalan ke Strategy Board & Presentasi Milestone' },
  { actionId: 'think_plan', durationSeconds: 4.0, stepTitle: '5/8 · Mengevaluasi Prioritas Sprint' },
  { actionId: 'coffee_break', durationSeconds: 5.0, stepTitle: '6/8 · Istirahat Kopi di Sudut Refreshment' },
  { actionId: 'task_completed', durationSeconds: 3.5, stepTitle: '7/8 · Konfirmasi Tugas Selesai' },
  { actionId: 'idle', durationSeconds: 3.0, stepTitle: '8/8 · Kembali ke Posisi Idle' },
];

export const PM_DEMO_ACTIONS: PMActionDefinition[] = [
  {
    id: 'idle',
    code: 'ACT_01',
    labelId: 'Idle / Santai',
    labelEn: 'Relaxed Standing Idle',
    targetState: 'IDLE',
    targetAnchorId: 'ROOM_IDLE_POSITION',
    requiresWalk: true,
    clipName: 'Idle_Breathing',
    statusBadgeText: 'SIMULASI / DEMO · IDLE',
    badgeColor: 'slate',
    description: 'Postur berdiri santai dengan animasi napas halus dan gerakan kepala ringan.',
  },
  {
    id: 'patrol',
    code: 'ACT_02',
    labelId: 'Jalan Keliling',
    labelEn: 'Walk Around Office',
    targetState: 'MOVING',
    targetAnchorId: 'PRESENTATION_BOARD_POSITION',
    requiresWalk: true,
    clipName: 'Walk_Cycle',
    statusBadgeText: 'SIMULASI / DEMO · JALAN KELILING',
    badgeColor: 'sky',
    description: 'Berjalan mengelilingi koridor bebas hambatan di dalam ruang PM 8×8.',
  },
  {
    id: 'work_desk',
    code: 'ACT_03',
    labelId: 'Kerja di Meja',
    labelEn: 'Work at PM Desk',
    targetState: 'WORKING',
    targetAnchorId: 'PM_DESK_WORK_POSITION',
    requiresWalk: true,
    clipName: 'Work_Typing',
    statusBadgeText: 'SIMULASI / DEMO · KERJA DI MEJA',
    badgeColor: 'emerald',
    description: 'Berjalan ke meja kerja PM, duduk menghadap monitor, dan mengetik dokumen roadmap.',
  },
  {
    id: 'meeting_briefing',
    code: 'ACT_04',
    labelId: 'Rapat / Briefing',
    labelEn: 'Briefing at Meeting Table',
    targetState: 'MEETING',
    targetAnchorId: 'MEETING_SEAT_POSITION',
    requiresWalk: true,
    clipName: 'Meeting_Briefing',
    speechBubble: 'Tim, hari ini kita fokus menyelesaikan milestone utama.',
    statusBadgeText: 'SIMULASI / DEMO · RAPAT / BRIEFING',
    badgeColor: 'purple',
    description: 'Simulasi latihan briefing satu karakter di meja kolaborasi dengan balon dialog.',
  },
  {
    id: 'present_board',
    code: 'ACT_05',
    labelId: 'Presentasi',
    labelEn: 'Present at Strategy Board',
    targetState: 'PRESENTING',
    targetAnchorId: 'PRESENTATION_BOARD_POSITION',
    requiresWalk: true,
    clipName: 'Present_Board',
    speechBubble: 'Kolom Sprint Q4 menunjukkan 3 milestone prioritas siap rilis.',
    statusBadgeText: 'SIMULASI / DEMO · PRESENTASI BOARD',
    badgeColor: 'amber',
    description: 'Berdiri di depan Strategy Board dan menunjuk kartu tugas Kanban.',
  },
  {
    id: 'read_document',
    code: 'ACT_06',
    labelId: 'Baca Dokumen',
    labelEn: 'Read Strategy Spec',
    targetState: 'READING',
    targetAnchorId: 'BOOKSHELF_POSITION',
    requiresWalk: true,
    clipName: 'Read_Document',
    statusBadgeText: 'SIMULASI / DEMO · BACA DOKUMEN',
    badgeColor: 'sky',
    description: 'Berjalan ke rak buku arsip dan membaca dokumen spesifikasi proyek.',
  },
  {
    id: 'think_plan',
    code: 'ACT_07',
    labelId: 'Berpikir / Merencanakan',
    labelEn: 'Thinking / Planning',
    targetState: 'THINKING',
    targetAnchorId: null, // Can perform in-place or at current spot
    requiresWalk: false,
    clipName: 'Think_Plan',
    thoughtBubble: 'Sedang mengevaluasi prioritas milestone.',
    statusBadgeText: 'SIMULASI / DEMO · MERENCANAKAN',
    badgeColor: 'purple',
    description: 'Pose tangan di dagu mengevaluasi prioritas sprint dengan indikator pikiran.',
  },
  {
    id: 'phone_call',
    code: 'ACT_08',
    labelId: 'Telepon',
    labelEn: 'Executive Phone Call',
    targetState: 'PHONE_CALL',
    targetAnchorId: null,
    requiresWalk: false,
    clipName: 'Phone_Call',
    speechBubble: 'Halo, pastikan laporan arsitektur modul siap sebelum jam 3 sore.',
    statusBadgeText: 'SIMULASI / DEMO · TELEPON',
    badgeColor: 'sky',
    description: 'Mengangkat telepon genggam ke telinga kanan sambil berdiskusi.',
  },
  {
    id: 'coffee_break',
    code: 'ACT_09',
    labelId: 'Istirahat Kopi',
    labelEn: 'Coffee Break',
    targetState: 'COFFEE_BREAK',
    targetAnchorId: 'COFFEE_BREAK_POSITION',
    requiresWalk: true,
    clipName: 'Coffee_Break',
    statusBadgeText: 'SIMULASI / DEMO · ISTIRAHAT KOPI',
    badgeColor: 'amber',
    description: 'Berjalan ke meja kopi/refreshment sudut barat daya dan menikmati secangkir kopi.',
  },
  {
    id: 'waiting_approval',
    code: 'ACT_10',
    labelId: 'Menunggu Persetujuan',
    labelEn: 'Waiting for Approval',
    targetState: 'WAITING_APPROVAL',
    targetAnchorId: null,
    requiresWalk: false,
    clipName: 'Waiting_Approval',
    thoughtBubble: 'Menunggu konfirmasi persetujuan milestone dari pengguna...',
    statusBadgeText: 'SIMULASI / DEMO · MENUNGGU PERSETUJUAN',
    badgeColor: 'coral',
    description: 'Menghentikan aktivitas dan menunggu klik tombol "Berikan Persetujuan".',
  },
  {
    id: 'task_completed',
    code: 'ACT_11',
    labelId: 'Tugas Selesai',
    labelEn: 'Task Completed',
    targetState: 'TASK_COMPLETED',
    targetAnchorId: null,
    requiresWalk: false,
    clipName: 'Task_Completed',
    speechBubble: 'Milestone telah disetujui dan selesai tepat waktu!',
    statusBadgeText: 'SIMULASI / DEMO · TUGAS SELESAI',
    badgeColor: 'emerald',
    description: 'Gestur selebrasi penyelesaian tugas sebelum kembali ke posisi Idle.',
  },
];

function dist2D(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/**
 * Checks whether a 2D point [x, z] inside the 8x8 room collides with solid furniture obstacles.
 * Excludes the rug, wall-mounted strategy board, and chairs that the character sits on.
 */
export function isPointClearOfObstacles(
  x: number,
  z: number,
  padding = 0.18
): { clear: boolean; blockingItemId: string | null } {
  const marginWall = 0.35;
  if (
    x < marginWall ||
    x > MODULE_CONSTANTS.FOOTPRINT_WIDTH - marginWall ||
    z < marginWall ||
    z > MODULE_CONSTANTS.FOOTPRINT_DEPTH - marginWall
  ) {
    return { clear: false, blockingItemId: 'ROOM_BOUNDARY_WALL' };
  }

  const nonBlockingIds = new Set([
    'PM_Area_Rug',
    'PM_Strategy_Board',
    'PM_Executive_Chair',
  ]);

  for (const item of FURNITURE_CATALOG) {
    if (nonBlockingIds.has(item.id)) continue;
    const [cx, , cz] = item.position;
    const [w, , d] = item.dimensions;
    const halfW = w / 2 + padding;
    const halfD = d / 2 + padding;
    if (x >= cx - halfW && x <= cx + halfW && z >= cz - halfD && z <= cz + halfD) {
      return { clear: false, blockingItemId: item.id };
    }
  }

  return { clear: true, blockingItemId: null };
}

/**
 * Computes an obstacle-avoiding waypoint path from start [x, z] to target [x, z]
 * using Dijkstra's shortest-path algorithm on ROOM_WALK_WAYPOINTS.
 */
export function findWalkablePath(
  startXZ: [number, number],
  targetXZ: [number, number],
  waypoints: WalkWaypoint[] = ROOM_WALK_WAYPOINTS
): Array<[number, number]> {
  const directDist = dist2D(startXZ, targetXZ);
  if (directDist < 0.35) {
    return [targetXZ];
  }

  // Check if straight line has any obstacle sample hits
  let straightClear = true;
  const steps = Math.max(4, Math.ceil(directDist / 0.25));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const sx = startXZ[0] + (targetXZ[0] - startXZ[0]) * t;
    const sz = startXZ[1] + (targetXZ[1] - startXZ[1]) * t;
    if (!isPointClearOfObstacles(sx, sz, 0.14).clear) {
      straightClear = false;
      break;
    }
  }
  if (straightClear && directDist <= 2.4) {
    return [targetXZ];
  }

  const wpMap = new Map<string, WalkWaypoint>();
  waypoints.forEach((wp) => wpMap.set(wp.id, wp));

  // Find nearest start waypoint and nearest target waypoint
  let startWp = waypoints[0];
  let bestStartDist = Infinity;
  let endWp = waypoints[0];
  let bestEndDist = Infinity;

  for (const wp of waypoints) {
    const ds = dist2D(startXZ, wp.position);
    if (ds < bestStartDist) {
      bestStartDist = ds;
      startWp = wp;
    }
    const de = dist2D(targetXZ, wp.position);
    if (de < bestEndDist) {
      bestEndDist = de;
      endWp = wp;
    }
  }

  if (startWp.id === endWp.id) {
    return [startWp.position, targetXZ];
  }

  // Dijkstra shortest path between startWp and endWp
  const dists = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const wp of waypoints) {
    dists.set(wp.id, Infinity);
    prev.set(wp.id, null);
    unvisited.add(wp.id);
  }
  dists.set(startWp.id, 0);

  while (unvisited.size > 0) {
    let u: string | null = null;
    let bestD = Infinity;
    for (const id of unvisited) {
      const d = dists.get(id) ?? Infinity;
      if (d < bestD) {
        bestD = d;
        u = id;
      }
    }
    if (!u || u === endWp.id) break;
    unvisited.delete(u);

    const node = wpMap.get(u);
    if (!node) continue;
    for (const nbrId of node.neighbors) {
      if (!unvisited.has(nbrId)) continue;
      const nbr = wpMap.get(nbrId);
      if (!nbr) continue;
      const alt = bestD + dist2D(node.position, nbr.position);
      if (alt < (dists.get(nbrId) ?? Infinity)) {
        dists.set(nbrId, alt);
        prev.set(nbrId, u);
      }
    }
  }

  const chain: Array<[number, number]> = [];
  let curr: string | null = endWp.id;
  while (curr) {
    const wp = wpMap.get(curr);
    if (wp) chain.unshift(wp.position);
    curr = prev.get(curr) ?? null;
  }

  // Prune redundant first waypoint if moving away from second waypoint
  if (chain.length >= 2) {
    const d01 = dist2D(chain[0], chain[1]);
    const dStart1 = dist2D(startXZ, chain[1]);
    if (dStart1 < d01 + 0.25) {
      chain.shift();
    }
  }

  chain.push(targetXZ);
  return chain;
}

/**
 * Shortest signed angle delta in [-PI, PI] for smooth character rotation.
 */
export function shortestAngleDelta(fromRad: number, toRad: number): number {
  let diff = ((toRad - fromRad + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export function buildSimulationExportConfig(
  anchors: Record<AnchorId, ActivityAnchor>,
  inspection: GLBInspectionReport | null,
  characterSource: CharacterSourceType = 'original_pm'
): PMSimulationExportConfig {
  const mappings = {} as PMSimulationExportConfig['animation_mappings'];
  for (const act of PM_DEMO_ACTIONS) {
    const propsUsed: string[] = [];
    if (act.id === 'work_desk') propsUsed.push('PM_Monitor_Display_Screen', 'PM_Keyboard_Body');
    if (act.id === 'read_document') propsUsed.push('Open_Strategy_Binder_Prop');
    if (act.id === 'phone_call') propsUsed.push('Executive_Smartphone_Prop');
    if (act.id === 'coffee_break') propsUsed.push('Warm_Ceramic_Coffee_Cup_Prop');
    if (act.id === 'present_board') propsUsed.push('PM_Strategy_Board_Highlight');

    mappings[act.id] = {
      embedded_clip: act.clipName,
      procedural_fallback: `Procedural_${act.clipName}`,
      props_used: propsUsed,
    };
  }

  return {
    schema_version: 'AI_OFFICE_PM_SIMULATION_V1',
    room_module_id: MODULE_CONSTANTS.MODULE_ID,
    simulation_mode: 'VISUAL_DEMONSTRATION_ONLY',
    character_source: characterSource,
    character_asset_reference: {
      source_type: inspection?.assetSource ?? 'original_room_native',
      asset_path:
        inspection?.assetPathOrName ?? 'Original_Room_Native_Voxel_Boss_PM',
      target_height_units: MODULE_CONSTANTS.CHARACTER_REFERENCE_HEIGHT,
      applied_scale: inspection?.appliedScaleFactor ?? 1.0,
      local_forward: inspection?.localForwardDirection ?? [0, 0, 1],
      capability_mode: inspection?.capabilityMode ?? 'CASE_A_EMBEDDED_CLIPS',
    },
    spawn: {
      anchor_id: 'SPAWN_POINT',
      position: [...anchors.SPAWN_POINT.position],
      facing_rad: anchors.SPAWN_POINT.facingRad,
    },
    anchors,
    waypoints: ROOM_WALK_WAYPOINTS,
    actions: PM_DEMO_ACTIONS,
    animation_mappings: mappings,
  };
}
