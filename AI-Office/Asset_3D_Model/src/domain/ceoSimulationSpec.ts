import {
  CEOActivityAnchor,
  CEOAnchorId,
  CEO_FURNITURE_CATALOG,
  CEO_MODULE_CONSTANTS,
  DEFAULT_CEO_ANCHORS,
} from './ceoRoomSpec';
import { AnimationCapabilityMode, GLBInspectionReport, WalkWaypoint } from './pmSimulationSpec';

export const CEO_CHARACTER_CONSTANTS = {
  CHARACTER_ID: 'ceo_executive_assistant',
  ASSET_ID: 'ai_office.character.ceo_executive_assistant.v1',
  DISPLAY_NAME: 'CEO Executive Assistant',
  FUNCTIONAL_ROLE: 'Executive Brain / Chief of Staff',
  DEPARTMENT: 'Executive Office',
  COMPATIBLE_ROOM_ID: CEO_MODULE_CONSTANTS.MODULE_ID,
  COMPATIBLE_ROOM_ASSET_ID: CEO_MODULE_CONSTANTS.ASSET_ID,
  ROOT_NODE_NAME: 'CEO_Executive_Assistant_Root',
  RUNTIME_ROOT_NAME: 'CEO_AGENT_RUNTIME_ROOT',
  GLB_FILENAME: 'ceo_executive_assistant.glb',
  MANIFEST_FILENAME: 'ceo_executive_assistant.manifest.json',
  BEHAVIOR_FILENAME: 'ceo_executive_assistant.behavior.json',
  PREVIEW_FILENAME: 'ceo_executive_assistant_preview.png',
  README_FILENAME: 'README.md',
  TARGET_HEIGHT_UNITS: 1.725,
  LOCAL_FORWARD: [0, 0, 1] as [number, number, number],
  AUTHORITY_NOTICE:
    'The Human Owner remains the real CEO and ultimate decision maker. This 3D character is an AI Executive Assistant / Chief of Staff for visual simulation only and cannot independently approve sensitive actions.',
} as const;

export type CEOAgentStateId =
  | 'IDLE'
  | 'MOVING'
  | 'WORKING'
  | 'REVIEWING_REPORT'
  | 'ANALYZING'
  | 'DISCUSSING'
  | 'PRESENTING'
  | 'THINKING'
  | 'PHONE_CALL'
  | 'COFFEE_BREAK'
  | 'WAITING_APPROVAL'
  | 'PREPARING_SUMMARY'
  | 'SENDING_REPORT_DEMO'
  | 'TASK_COMPLETED'
  | 'BLOCKED_DEMO';

export type CEOActionId =
  | 'idle'
  | 'walk_patrol'
  | 'work_desk'
  | 'review_pm_report'
  | 'analyze_executive_brain'
  | 'discuss_with_pm'
  | 'present_strategy'
  | 'think_strategy'
  | 'phone_call'
  | 'coffee_break'
  | 'waiting_owner_approval'
  | 'prepare_executive_digest'
  | 'send_report_demo'
  | 'task_completed';

export type CEOExpressionId =
  | 'neutral'
  | 'focused'
  | 'happy'
  | 'thinking'
  | 'concerned'
  | 'talking'
  | 'confident';

export type CEOHandheldPropId =
  | 'none'
  | 'report_binder'
  | 'executive_tablet'
  | 'smartphone'
  | 'coffee_cup';

export interface CEOExpressionDefinition {
  id: CEOExpressionId;
  labelId: string;
  labelEn: string;
  eyebrowTiltRad: number;
  eyebrowOffsetY: number;
  mouthScaleX: number;
  mouthScaleY: number;
  mouthOffsetY: number;
  description: string;
}

export const CEO_EXPRESSIONS: CEOExpressionDefinition[] = [
  {
    id: 'neutral',
    labelId: 'Netral',
    labelEn: 'Neutral',
    eyebrowTiltRad: 0,
    eyebrowOffsetY: 0,
    mouthScaleX: 1.0,
    mouthScaleY: 1.0,
    mouthOffsetY: 0,
    description: 'Calm, composed senior executive resting expression.',
  },
  {
    id: 'focused',
    labelId: 'Fokus',
    labelEn: 'Focused',
    eyebrowTiltRad: -0.08,
    eyebrowOffsetY: -0.004,
    mouthScaleX: 0.88,
    mouthScaleY: 0.9,
    mouthOffsetY: 0,
    description: 'Attentive analytical expression while reviewing reports or typing.',
  },
  {
    id: 'happy',
    labelId: 'Senang',
    labelEn: 'Happy',
    eyebrowTiltRad: 0.05,
    eyebrowOffsetY: 0.005,
    mouthScaleX: 1.22,
    mouthScaleY: 1.15,
    mouthOffsetY: 0.003,
    description: 'Warm, appreciative executive smile on milestone completion.',
  },
  {
    id: 'thinking',
    labelId: 'Berpikir',
    labelEn: 'Thinking',
    eyebrowTiltRad: 0.1,
    eyebrowOffsetY: 0.004,
    mouthScaleX: 0.78,
    mouthScaleY: 0.95,
    mouthOffsetY: -0.002,
    description: 'Contemplative strategic evaluation expression.',
  },
  {
    id: 'concerned',
    labelId: 'Waspada',
    labelEn: 'Concerned',
    eyebrowTiltRad: 0.12,
    eyebrowOffsetY: -0.003,
    mouthScaleX: 0.85,
    mouthScaleY: 0.85,
    mouthOffsetY: -0.003,
    description: 'Cautious waiting expression while awaiting Human Owner approval.',
  },
  {
    id: 'talking',
    labelId: 'Berbicara',
    labelEn: 'Talking',
    eyebrowTiltRad: 0.04,
    eyebrowOffsetY: 0.003,
    mouthScaleX: 1.08,
    mouthScaleY: 1.65,
    mouthOffsetY: -0.001,
    description: 'Active speaking expression during PM briefings and phone calls.',
  },
  {
    id: 'confident',
    labelId: 'Percaya Diri',
    labelEn: 'Confident',
    eyebrowTiltRad: -0.04,
    eyebrowOffsetY: 0.003,
    mouthScaleX: 1.16,
    mouthScaleY: 1.08,
    mouthOffsetY: 0.002,
    description: 'Assured leadership expression during strategy presentation and digest staging.',
  },
];

export const CEO_EXPRESSION_LIST = CEO_EXPRESSIONS;

export interface CEOActionDefinition {
  id: CEOActionId;
  code: string;
  labelId: string;
  labelEn: string;
  targetState: CEOAgentStateId;
  targetAnchorId: CEOAnchorId | null;
  semanticAnchorAlias: string;
  requiresWalk: boolean;
  posture: 'standing' | 'seated';
  clipName: string;
  defaultExpression: CEOExpressionId;
  handheldProp: CEOHandheldPropId;
  consolePanelHighlight: string | null;
  speechBubble?: string;
  thoughtBubble?: string;
  statusBadgeText: string;
  simulatedScreenStatus: string;
  badgeColor: 'emerald' | 'amber' | 'sky' | 'purple' | 'coral' | 'slate';
  description: string;
}

export const CEO_DEMO_ACTIONS: CEOActionDefinition[] = [
  {
    id: 'idle',
    code: 'CEO_ACT_01',
    labelId: 'Idle',
    labelEn: 'Relaxed Executive Idle',
    targetState: 'IDLE',
    targetAnchorId: 'CEO_ROOM_IDLE',
    semanticAnchorAlias: 'CEO_ROOM_IDLE',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Idle_Breathing',
    defaultExpression: 'neutral',
    handheldProp: 'none',
    consolePanelHighlight: null,
    statusBadgeText: 'SIMULASI / DEMO · IDLE',
    simulatedScreenStatus: 'Executive Brain Standby · 3 Active Projects (DEMO DATA)',
    badgeColor: 'slate',
    description: 'Postur berdiri tenang di atas karpet eksekutif hijau zamrud dengan napas halus.',
  },
  {
    id: 'walk_patrol',
    code: 'CEO_ACT_02',
    labelId: 'Jalan',
    labelEn: 'Walk Around Executive Office',
    targetState: 'MOVING',
    targetAnchorId: 'CEO_DESK_APPROACH',
    semanticAnchorAlias: 'CEO_DESK_APPROACH',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Walk_Cycle',
    defaultExpression: 'neutral',
    handheldProp: 'none',
    consolePanelHighlight: null,
    statusBadgeText: 'SIMULASI / DEMO · JALAN',
    simulatedScreenStatus: 'Navigating Executive Command Center (SIMULASI / DEMO)',
    badgeColor: 'sky',
    description: 'Berjalan menyusuri titik-titik anchor utama di dalam ruang CEO tanpa menabrak furnitur.',
  },
  {
    id: 'work_desk',
    code: 'CEO_ACT_03',
    labelId: 'Kerja di Meja',
    labelEn: 'Work at Executive Desk',
    targetState: 'WORKING',
    targetAnchorId: 'CEO_DESK_WORK',
    semanticAnchorAlias: 'CEO_DESK_SEAT',
    requiresWalk: true,
    posture: 'seated',
    clipName: 'Work_Desk',
    defaultExpression: 'focused',
    handheldProp: 'none',
    consolePanelHighlight: 'PANEL_ACTIVE_PROJECTS',
    statusBadgeText: 'SIMULASI / DEMO · KERJA DI MEJA',
    simulatedScreenStatus: 'Reviewing Dual-Monitor Executive Dashboard (DEMO DATA)',
    badgeColor: 'emerald',
    description: 'Berjalan ke belakang meja eksekutif, duduk menghadap dua monitor, dan meninjau laporan.',
  },
  {
    id: 'review_pm_report',
    code: 'CEO_ACT_04',
    labelId: 'Review Laporan PM',
    labelEn: 'Review PM Report',
    targetState: 'REVIEWING_REPORT',
    targetAnchorId: 'CEO_REPORT_RECEPTION',
    semanticAnchorAlias: 'CEO_REPORT_REVIEW',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Review_PM_Report',
    defaultExpression: 'focused',
    handheldProp: 'report_binder',
    consolePanelHighlight: 'PANEL_PM_REPORTS',
    thoughtBubble: 'Meninjau 2 laporan progres sprint dari ruang PM & Strategy (SIMULASI / DEMO).',
    statusBadgeText: 'SIMULASI / DEMO · REVIEW LAPORAN PM',
    simulatedScreenStatus: 'PM Reports: 2 Received (Sprint 14 Brief) — DEMO DATA',
    badgeColor: 'sky',
    description: 'Berjalan ke area penerimaan laporan PM dan memeriksa map dokumen laporan.',
  },
  {
    id: 'analyze_executive_brain',
    code: 'CEO_ACT_05',
    labelId: 'Analisis Executive Brain',
    labelEn: 'Analyze Executive Brain Console',
    targetState: 'ANALYZING',
    targetAnchorId: 'CEO_BRAIN_CONSOLE',
    semanticAnchorAlias: 'CEO_BRAIN_CONSOLE',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Analyze_Executive_Brain',
    defaultExpression: 'thinking',
    handheldProp: 'executive_tablet',
    consolePanelHighlight: 'PANEL_ORG_OVERVIEW',
    thoughtBubble: 'Menganalisis telemetri 7 panel Executive Brain Console (DEMO DATA).',
    statusBadgeText: 'SIMULASI / DEMO · ANALISIS BRAIN',
    simulatedScreenStatus: 'Inspecting 7-Panel Executive Brain Console — DEMO DATA',
    badgeColor: 'emerald',
    description: 'Menghadap 7-Panel Executive Brain Console dan menganalisis ringkasan organisasi.',
  },
  {
    id: 'discuss_with_pm',
    code: 'CEO_ACT_06',
    labelId: 'Diskusi dengan PM',
    labelEn: 'Discuss with PM',
    targetState: 'DISCUSSING',
    targetAnchorId: 'CEO_DISCUSSION_AREA',
    semanticAnchorAlias: 'CEO_DISCUSSION_POSITION',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Discuss_With_PM',
    defaultExpression: 'talking',
    handheldProp: 'none',
    consolePanelHighlight: 'PANEL_PM_REPORTS',
    speechBubble: 'Sinkronisasi lintas-ruang siap. Kita siapkan opsi keputusan untuk Owner CEO.',
    statusBadgeText: 'SIMULASI / DEMO · DISKUSI PM',
    simulatedScreenStatus: 'Cross-Room PM/Executive Alignment Session — DEMO DATA',
    badgeColor: 'purple',
    description: 'Pose diskusi eksekutif di dekat meja review laporan menghadap titik diskusi PM.',
  },
  {
    id: 'present_strategy',
    code: 'CEO_ACT_07',
    labelId: 'Presentasi',
    labelEn: 'Present Executive Strategy',
    targetState: 'PRESENTING',
    targetAnchorId: 'CEO_BRAIN_CONSOLE',
    semanticAnchorAlias: 'CEO_PRESENTATION_POSITION',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Present_Strategy',
    defaultExpression: 'confident',
    handheldProp: 'none',
    consolePanelHighlight: 'PANEL_STRATEGIC_DECISIONS',
    speechBubble: 'Berikut 3 pilar OKR kuartal ini dan status kesiapan tiap modul departemen.',
    statusBadgeText: 'SIMULASI / DEMO · PRESENTASI',
    simulatedScreenStatus: 'Presenting Strategic OKR & Module Readiness — DEMO DATA',
    badgeColor: 'amber',
    description: 'Berdiri di depan layar strategis Executive Brain dan melakukan gestur presentasi.',
  },
  {
    id: 'think_strategy',
    code: 'CEO_ACT_08',
    labelId: 'Berpikir',
    labelEn: 'Think Strategy',
    targetState: 'THINKING',
    targetAnchorId: null,
    semanticAnchorAlias: 'CEO_ROOM_IDLE',
    requiresWalk: false,
    posture: 'standing',
    clipName: 'Think_Strategy',
    defaultExpression: 'thinking',
    handheldProp: 'none',
    consolePanelHighlight: 'PANEL_STRATEGIC_DECISIONS',
    thoughtBubble: 'Menyusun rekomendasi prioritas strategis untuk ditinjau Owner...',
    statusBadgeText: 'SIMULASI / DEMO · BERPIKIR',
    simulatedScreenStatus: 'Evaluating Strategic Trade-offs — DEMO DATA',
    badgeColor: 'purple',
    description: 'Pose berpikir tenang dengan tangan di dagu dan gerakan kepala reflektif.',
  },
  {
    id: 'phone_call',
    code: 'CEO_ACT_09',
    labelId: 'Telepon',
    labelEn: 'Executive Phone Call',
    targetState: 'PHONE_CALL',
    targetAnchorId: null,
    semanticAnchorAlias: 'CEO_PHONE_POSITION',
    requiresWalk: false,
    posture: 'standing',
    clipName: 'Phone_Call',
    defaultExpression: 'talking',
    handheldProp: 'smartphone',
    consolePanelHighlight: null,
    speechBubble: 'Halo, ringkasan mingguan sudah siap untuk ditinjau oleh Owner.',
    statusBadgeText: 'SIMULASI / DEMO · TELEPON',
    simulatedScreenStatus: 'Executive Coordination Call (SIMULASI / DEMO)',
    badgeColor: 'sky',
    description: 'Mengangkat smartphone ke telinga kanan dengan gestur percakapan eksekutif.',
  },
  {
    id: 'coffee_break',
    code: 'CEO_ACT_10',
    labelId: 'Istirahat Kopi',
    labelEn: 'Executive Coffee Break',
    targetState: 'COFFEE_BREAK',
    targetAnchorId: 'CEO_WINDOW_VIEW',
    semanticAnchorAlias: 'CEO_COFFEE_POSITION',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Coffee_Break',
    defaultExpression: 'happy',
    handheldProp: 'coffee_cup',
    consolePanelHighlight: null,
    statusBadgeText: 'SIMULASI / DEMO · ISTIRAHAT KOPI',
    simulatedScreenStatus: 'Coffee Break by North Panorama Window (SIMULASI / DEMO)',
    badgeColor: 'amber',
    description: 'Berjalan ke dekat jendela panorama utara sambil memegang cangkir kopi hangat.',
  },
  {
    id: 'waiting_owner_approval',
    code: 'CEO_ACT_11',
    labelId: 'Menunggu Approval',
    labelEn: 'Waiting for Owner Approval',
    targetState: 'WAITING_APPROVAL',
    targetAnchorId: 'CEO_CHAIR_POSITION',
    semanticAnchorAlias: 'CEO_DESK_SEAT',
    requiresWalk: true,
    posture: 'seated',
    clipName: 'Waiting_Owner_Approval',
    defaultExpression: 'concerned',
    handheldProp: 'none',
    consolePanelHighlight: 'PANEL_PENDING_APPROVAL',
    thoughtBubble: 'Menunggu keputusan akhir dari Human Owner (Real CEO). Karakter tidak melakukan auto-approve.',
    statusBadgeText: 'SIMULASI / DEMO · MENUNGGU APPROVAL OWNER',
    simulatedScreenStatus: 'Awaiting Human Owner (Real CEO) Final Decision — DEMO DATA',
    badgeColor: 'coral',
    description: 'Menunggu keputusan akhir dari Owner tanpa menyetujui tindakan sensitif secara otomatis.',
  },
  {
    id: 'prepare_executive_digest',
    code: 'CEO_ACT_12',
    labelId: 'Siapkan Ringkasan',
    labelEn: 'Prepare Executive Digest',
    targetState: 'PREPARING_SUMMARY',
    targetAnchorId: 'CEO_DESK_WORK',
    semanticAnchorAlias: 'CEO_DESK_SEAT',
    requiresWalk: true,
    posture: 'seated',
    clipName: 'Prepare_Executive_Digest',
    defaultExpression: 'focused',
    handheldProp: 'executive_tablet',
    consolePanelHighlight: 'PANEL_MEMORY_KNOWLEDGE',
    thoughtBubble: 'Menyiapkan ringkasan eksekutif mingguan di stasiun komputer CEO (SIMULASI / DEMO).',
    statusBadgeText: 'SIMULASI / DEMO · SIAPKAN RINGKASAN',
    simulatedScreenStatus: 'Weekly Summary: Prepared (Ready for Owner Review) — DEMO DATA',
    badgeColor: 'emerald',
    description: 'Bekerja di komputer eksekutif menyusun dokumen ringkasan mingguan untuk Owner.',
  },
  {
    id: 'send_report_demo',
    code: 'CEO_ACT_13',
    labelId: 'Kirim Laporan (Demo)',
    labelEn: 'Send Report (Visual Demo Only)',
    targetState: 'SENDING_REPORT_DEMO',
    targetAnchorId: 'CEO_DESK_WORK',
    semanticAnchorAlias: 'CEO_DESK_SEAT',
    requiresWalk: true,
    posture: 'seated',
    clipName: 'Send_Report_Demo',
    defaultExpression: 'confident',
    handheldProp: 'none',
    consolePanelHighlight: 'PANEL_TELEGRAM_STATUS',
    speechBubble: 'SIMULASI — LAPORAN DISIAPKAN · DEMO REPORT SENT (Tidak ada pesan Telegram nyata yang dikirim)',
    statusBadgeText: 'SIMULASI — LAPORAN DISIAPKAN',
    simulatedScreenStatus: 'SIMULASI — LAPORAN DISIAPKAN / DEMO REPORT SENT (No External API)',
    badgeColor: 'amber',
    description: 'Animasi konfirmasi pengiriman laporan di meja kerja (100% simulasi visual tanpa panggilan API).',
  },
  {
    id: 'task_completed',
    code: 'CEO_ACT_14',
    labelId: 'Tugas Selesai',
    labelEn: 'Task Completed',
    targetState: 'TASK_COMPLETED',
    targetAnchorId: null,
    semanticAnchorAlias: 'CEO_ROOM_IDLE',
    requiresWalk: false,
    posture: 'standing',
    clipName: 'Task_Completed',
    defaultExpression: 'happy',
    handheldProp: 'none',
    consolePanelHighlight: null,
    speechBubble: 'Ringkasan eksekutif telah selesai disiapkan dan dicatat dalam log simulasi.',
    statusBadgeText: 'SIMULASI / DEMO · TUGAS SELESAI',
    simulatedScreenStatus: 'Executive Task Completed — Returning to Standby (DEMO DATA)',
    badgeColor: 'emerald',
    description: 'Gestur anggukan dan konfirmasi positif profesional sebelum kembali ke posisi Idle.',
  },
];

export const CEO_DEMO_ACTION_LIST = CEO_DEMO_ACTIONS;

/**
 * Connected walkable waypoint graph inside the 8x8 CEO Room.
 * Carefully routed around:
 * - CEO_Executive_Desk [4.5, 5.75] (X=3.4..5.6, Z=5.225..6.275)
 * - CEO_Executive_Brain_Console [0.58, 1.68] (X=0.20..0.96, Z=0.405..2.955)
 * - CEO_Report_Review_Area [5.65, 2.55] (X=4.875..6.425, Z=1.825..3.275)
 * - CEO_Strategy_Cabinet [1.75, 7.38] (X=0.89..2.61, Z=7.09..7.67)
 */
export const CEO_WALK_WAYPOINTS: WalkWaypoint[] = [
  {
    id: 'CEO_WP_SOUTH_ENTRY',
    position: [4.0, 0.95],
    neighbors: ['CEO_WP_CONSOLE_FRONT', 'CEO_WP_SOUTH_MID', 'CEO_WP_EAST_LOWER'],
  },
  {
    id: 'CEO_WP_CONSOLE_FRONT',
    position: [1.55, 1.68],
    neighbors: ['CEO_WP_SOUTH_ENTRY', 'CEO_WP_WEST_MID', 'CEO_WP_SOUTH_MID'],
  },
  {
    id: 'CEO_WP_WEST_MID',
    position: [1.45, 3.85],
    neighbors: ['CEO_WP_CONSOLE_FRONT', 'CEO_WP_WEST_NORTH', 'CEO_WP_CENTER_RUG'],
  },
  {
    id: 'CEO_WP_WEST_NORTH',
    position: [2.85, 5.65],
    neighbors: ['CEO_WP_WEST_MID', 'CEO_WP_DESK_APPROACH', 'CEO_WP_CENTER_RUG'],
  },
  {
    id: 'CEO_WP_DESK_APPROACH',
    position: [3.25, 6.55],
    neighbors: ['CEO_WP_WEST_NORTH', 'CEO_WP_NORTH_EAST'],
  },
  {
    id: 'CEO_WP_CENTER_RUG',
    position: [4.35, 4.15],
    neighbors: ['CEO_WP_WEST_MID', 'CEO_WP_WEST_NORTH', 'CEO_WP_SOUTH_MID', 'CEO_WP_EAST_UPPER'],
  },
  {
    id: 'CEO_WP_SOUTH_MID',
    position: [4.35, 2.55],
    neighbors: ['CEO_WP_SOUTH_ENTRY', 'CEO_WP_CONSOLE_FRONT', 'CEO_WP_CENTER_RUG'],
  },
  {
    id: 'CEO_WP_EAST_UPPER',
    position: [6.25, 4.65],
    neighbors: ['CEO_WP_CENTER_RUG', 'CEO_WP_NORTH_EAST', 'CEO_WP_EAST_LOWER'],
  },
  {
    id: 'CEO_WP_NORTH_EAST',
    position: [5.85, 6.85],
    neighbors: ['CEO_WP_DESK_APPROACH', 'CEO_WP_EAST_UPPER'],
  },
  {
    id: 'CEO_WP_EAST_LOWER',
    position: [6.75, 2.55],
    neighbors: ['CEO_WP_SOUTH_ENTRY', 'CEO_WP_EAST_UPPER'],
  },
];

export const CEO_PATROL_ANCHOR_SEQUENCE: CEOAnchorId[] = [
  'CEO_ROOM_IDLE',
  'CEO_DESK_APPROACH',
  'CEO_WINDOW_VIEW',
  'CEO_DISCUSSION_AREA',
  'CEO_BRAIN_CONSOLE',
  'CEO_REPORT_RECEPTION',
];

export const CEO_AUTO_DEMO_SEQUENCE: Array<{
  actionId: CEOActionId;
  durationSeconds: number;
  stepTitle: string;
}> = [
  { actionId: 'idle', durationSeconds: 2.2, stepTitle: '1/9 · Idle di Ruang Eksekutif CEO' },
  { actionId: 'walk_patrol', durationSeconds: 3.5, stepTitle: '2/9 · Berjalan Menuju Meja Kerja Eksekutif' },
  { actionId: 'work_desk', durationSeconds: 4.5, stepTitle: '3/9 · Kerja di Meja & Tinjau Dua Monitor CEO' },
  { actionId: 'review_pm_report', durationSeconds: 5.0, stepTitle: '4/9 · Review Laporan PM di Area Penerimaan' },
  { actionId: 'analyze_executive_brain', durationSeconds: 5.0, stepTitle: '5/9 · Berjalan ke Executive Brain & Analisis 7 Panel' },
  { actionId: 'prepare_executive_digest', durationSeconds: 5.0, stepTitle: '6/9 · Siapkan Ringkasan Eksekutif di Komputer' },
  { actionId: 'send_report_demo', durationSeconds: 4.0, stepTitle: '7/9 · Kirim Laporan (SIMULASI — LAPORAN DISIAPKAN)' },
  { actionId: 'task_completed', durationSeconds: 3.0, stepTitle: '8/9 · Konfirmasi Tugas Selesai' },
  { actionId: 'idle', durationSeconds: 2.5, stepTitle: '9/9 · Kembali ke Posisi Idle' },
];

export type CEOPlaybackCommand =
  | 'play'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'reset_pose'
  | 'reset_position';

export interface CEORuntimeStatus {
  loaded: boolean;
  state: CEOAgentStateId;
  currentState: CEOAgentStateId;
  activeActionId: CEOActionId;
  currentActionId: CEOActionId;
  activeActionLabel: string;
  currentActionDef: CEOActionDefinition;
  currentClipName: string;
  activeClipName: string;
  currentAnchorId: CEOAnchorId;
  targetAnchorId: CEOAnchorId;
  expressionId: CEOExpressionId;
  currentExpression: CEOExpressionId;
  glassesVisible: boolean;
  activePropId: CEOHandheldPropId;
  activeProp: CEOHandheldPropId;
  position: [number, number, number];
  worldPosition: [number, number, number];
  rotationYDeg: number;
  facingDeg: number;
  speedMultiplier: 0.5 | 1 | 1.5;
  isWalking: boolean;
  isPaused: boolean;
  isPatrolling: boolean;
  patrolActive: boolean;
  isAutoDemoRunning: boolean;
  autoDemoActive: boolean;
  autoDemoStepIndex: number;
  autoDemoTotalSteps: number;
  autoDemoStepTitle: string | null;
  bubbleText: string | null;
  bubbleBadge: string | null;
  bubbleTone: 'emerald' | 'blue' | 'amber' | 'violet' | 'slate';
  isEmbeddedClipPlaying: boolean;
  availableClips: string[];
  characterSource: 'procedural';
  characterPolyCount: number;
}

export type CEOSimulationRuntimeTelemetry = CEORuntimeStatus;

export function getCEOActionDef(actionId: CEOActionId): CEOActionDefinition {
  return CEO_DEMO_ACTIONS.find((a) => a.id === actionId) || CEO_DEMO_ACTIONS[0];
}

export function getCEOExpressionDef(exprId: CEOExpressionId): CEOExpressionDefinition {
  return CEO_EXPRESSIONS.find((e) => e.id === exprId) || CEO_EXPRESSIONS[0];
}

function dist2D(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/**
 * Checks whether a 2D point [x, z] inside the 8x8 CEO Room collides with solid furniture obstacles.
 * Excludes the rug, wall-mounted board, desk top computer prop, and executive chair (used for seated pose).
 */
export function isCEOPointClearOfObstacles(
  x: number,
  z: number,
  padding = 0.16
): { clear: boolean; blockingItemId: string | null } {
  const marginWall = 0.32;
  if (
    x < marginWall ||
    x > CEO_MODULE_CONSTANTS.FOOTPRINT_WIDTH - marginWall ||
    z < marginWall ||
    z > CEO_MODULE_CONSTANTS.FOOTPRINT_DEPTH - marginWall
  ) {
    return { clear: false, blockingItemId: 'CEO_ROOM_BOUNDARY_WALL' };
  }

  const nonBlockingIds = new Set([
    'CEO_Area_Rug',
    'CEO_Wall_Planning_Board',
    'CEO_Computer_Station',
    'CEO_Executive_Chair',
  ]);

  for (const item of CEO_FURNITURE_CATALOG) {
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
 * Computes a collision-free waypoint path inside the 8x8 CEO Room using Dijkstra's algorithm
 * on CEO_WALK_WAYPOINTS, automatically routing behind-desk seated transitions through CEO_DESK_APPROACH.
 */
export function findCEOWalkablePath(
  startXZ: [number, number],
  targetXZ: [number, number],
  waypoints: WalkWaypoint[] = CEO_WALK_WAYPOINTS,
  anchors: Record<CEOAnchorId, CEOActivityAnchor> = DEFAULT_CEO_ANCHORS
): Array<[number, number]> {
  const directDist = dist2D(startXZ, targetXZ);
  if (directDist < 0.32) {
    return [targetXZ];
  }

  const deskApproach = anchors.CEO_DESK_APPROACH.position;
  const deskApproachXZ: [number, number] = [deskApproach[0], deskApproach[2]];

  const isBehindDesk = (pt: [number, number]) => pt[0] > 3.6 && pt[1] > 6.1;

  // If starting behind the desk and heading elsewhere outside behind-desk zone, exit via CEO_DESK_APPROACH first
  if (isBehindDesk(startXZ) && !isBehindDesk(targetXZ)) {
    const subPath = findCEOWalkablePath(deskApproachXZ, targetXZ, waypoints, anchors);
    return [deskApproachXZ, ...subPath];
  }

  // If heading behind the desk from outside, route to CEO_DESK_APPROACH first then step behind the chair
  if (!isBehindDesk(startXZ) && isBehindDesk(targetXZ)) {
    const toApproach =
      dist2D(startXZ, deskApproachXZ) < 0.35
        ? [deskApproachXZ]
        : findCEOWalkablePath(startXZ, deskApproachXZ, waypoints, anchors);
    return [...toApproach, targetXZ];
  }

  // Check if straight line is obstacle-free for short hops
  let straightClear = true;
  const steps = Math.max(4, Math.ceil(directDist / 0.22));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const sx = startXZ[0] + (targetXZ[0] - startXZ[0]) * t;
    const sz = startXZ[1] + (targetXZ[1] - startXZ[1]) * t;
    if (!isCEOPointClearOfObstacles(sx, sz, 0.14).clear) {
      straightClear = false;
      break;
    }
  }
  if (straightClear && directDist <= 2.3) {
    return [targetXZ];
  }

  const wpMap = new Map<string, WalkWaypoint>();
  waypoints.forEach((wp) => wpMap.set(wp.id, wp));

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

  if (chain.length >= 2) {
    const d01 = dist2D(chain[0], chain[1]);
    const dStart1 = dist2D(startXZ, chain[1]);
    if (dStart1 <= d01 + 0.25) {
      chain.shift();
    }
  }

  chain.push(targetXZ);
  return chain;
}
