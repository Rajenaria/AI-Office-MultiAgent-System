import { EngineeringAnchorId } from './engineeringRoomSpec';

export type FrontendSimulationStateId =
  | 'IDLE'
  | 'MOVING'
  | 'CODING'
  | 'REVIEWING_UI'
  | 'DEBUGGING'
  | 'RESPONSIVE_TESTING_DEMO'
  | 'REVIEWING_API_CONTRACT'
  | 'DISCUSSING'
  | 'PRESENTING'
  | 'READING'
  | 'THINKING'
  | 'ON_CALL'
  | 'COFFEE_BREAK'
  | 'CODE_REVIEW'
  | 'WAITING_REVIEW'
  | 'COMPLETED'
  | 'BLOCKED_DEMO';

export type FrontendActionId =
  | 'idle'
  | 'walk'
  | 'work_typing'
  | 'review_ui'
  | 'debug_frontend'
  | 'test_responsive'
  | 'review_api_contract'
  | 'discuss_tech'
  | 'present_component'
  | 'read_docs'
  | 'think_plan'
  | 'phone_call'
  | 'coffee_break'
  | 'code_review'
  | 'waiting_review'
  | 'task_completed';

export type FrontendExpressionId =
  | 'neutral'
  | 'focused'
  | 'happy'
  | 'thinking'
  | 'talking'
  | 'concerned'
  | 'surprised'
  | 'confident'
  | 'tired';

export type FrontendAnimationPlaybackCommand =
  | 'play'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'restart'
  | 'reset_idle'
  | 'reset_spawn';

export type FrontendSpeedMultiplier = 0.5 | 1 | 1.5;

export type FrontendHandheldPropId =
  | 'none'
  | 'gray_laptop'
  | 'smartphone'
  | 'coffee_cup'
  | 'tech_document'
  | 'debug_tablet';

export const FRONTEND_CHARACTER_CONSTANTS = {
  CHARACTER_ID: 'frontend_developer_agent',
  ASSET_ID: 'ai_office.character.frontend_developer_agent.v1',
  DISPLAY_NAME: 'Frontend Developer',
  DEPARTMENT: 'Engineering',
  ROOM_ID: 'AI_OFFICE_ROOM_ENGINEERING_v1',
  ROLE_TYPE: 'FRONTEND_ENGINEER',
  ROOT_NODE_NAME: 'Frontend_Developer_Agent_Root',
  RUNTIME_ROOT_NAME: 'FRONTEND_AGENT_RUNTIME_ROOT',
  TARGET_HEIGHT_M: 1.725,
  WALK_SPEED_MPS: 1.9,
  GLB_FILENAME: 'frontend_developer_agent.glb',
  MANIFEST_FILENAME: 'frontend_developer_agent.manifest.json',
  BEHAVIOR_FILENAME: 'frontend_developer_agent.behavior.json',
  PREVIEW_FILENAME: 'frontend_developer_agent_preview.png',
  PACK_ZIP_FILENAME: 'frontend_developer_agent_pack.zip',
  CANONICAL_EXPORT_PATH: 'production/characters/frontend_developer_agent/',
} as const;

export const FRONTEND_REQUIRED_ANIMATION_CLIPS = [
  'Idle_Breathing',
  'Walk_Cycle',
  'Work_Typing',
  'Review_UI_Implementation',
  'Debug_Frontend',
  'Test_Responsive_Layout',
  'Review_API_Contract',
  'Discuss_Technical_Issue',
  'Present_Component',
  'Read_Documentation',
  'Think_Plan',
  'Phone_Call',
  'Coffee_Break',
  'Code_Review',
  'Waiting_Review',
  'Task_Completed',
] as const;

export type FrontendRequiredClipName = (typeof FRONTEND_REQUIRED_ANIMATION_CLIPS)[number];

export interface FrontendExpressionPreset {
  id: FrontendExpressionId;
  label: string;
  idLabel: string;
  eyeScaleY: number;
  pupilOffsetX: number;
  pupilOffsetY: number;
  browTiltRad: number;
  browLiftY: number;
  mouthScaleX: number;
  mouthScaleY: number;
  mouthCurveY: number;
}

export const FRONTEND_EXPRESSION_PRESETS: Record<FrontendExpressionId, FrontendExpressionPreset> = {
  neutral: {
    id: 'neutral',
    label: 'Neutral / Tenang',
    idLabel: 'Tenang & Siap Ngoding',
    eyeScaleY: 1.0,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    browTiltRad: 0,
    browLiftY: 0,
    mouthScaleX: 1.0,
    mouthScaleY: 1.0,
    mouthCurveY: 0,
  },
  focused: {
    id: 'focused',
    label: 'Focused / Coding',
    idLabel: 'Fokus Implementasi UI & TypeScript',
    eyeScaleY: 0.86,
    pupilOffsetX: 0,
    pupilOffsetY: -0.002,
    browTiltRad: -0.09,
    browLiftY: -0.004,
    mouthScaleX: 0.9,
    mouthScaleY: 0.85,
    mouthCurveY: 0,
  },
  happy: {
    id: 'happy',
    label: 'Happy / Build Green',
    idLabel: 'Senang / Build & Deploy Sukses',
    eyeScaleY: 0.82,
    pupilOffsetX: 0,
    pupilOffsetY: 0.002,
    browTiltRad: 0.06,
    browLiftY: 0.006,
    mouthScaleX: 1.24,
    mouthScaleY: 1.18,
    mouthCurveY: 0.004,
  },
  thinking: {
    id: 'thinking',
    label: 'Thinking / State Logic',
    idLabel: 'Berpikir Arsitektur Komponen',
    eyeScaleY: 0.94,
    pupilOffsetX: 0.005,
    pupilOffsetY: 0.005,
    browTiltRad: 0.12,
    browLiftY: 0.006,
    mouthScaleX: 0.78,
    mouthScaleY: 0.9,
    mouthCurveY: -0.002,
  },
  talking: {
    id: 'talking',
    label: 'Talking / Syncing',
    idLabel: 'Diskusi Teknis & Presentasi Komponen',
    eyeScaleY: 1.04,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    browTiltRad: 0.05,
    browLiftY: 0.004,
    mouthScaleX: 1.14,
    mouthScaleY: 1.65,
    mouthCurveY: 0.002,
  },
  concerned: {
    id: 'concerned',
    label: 'Concerned / Edge Case',
    idLabel: 'Waspada Regression / Layout Overflow',
    eyeScaleY: 0.92,
    pupilOffsetX: -0.003,
    pupilOffsetY: -0.002,
    browTiltRad: 0.15,
    browLiftY: -0.003,
    mouthScaleX: 0.88,
    mouthScaleY: 0.86,
    mouthCurveY: -0.003,
  },
  surprised: {
    id: 'surprised',
    label: 'Surprised / Eureka',
    idLabel: 'Terkejut / Menemukan Root Cause',
    eyeScaleY: 1.22,
    pupilOffsetX: 0,
    pupilOffsetY: 0.003,
    browTiltRad: 0.09,
    browLiftY: 0.009,
    mouthScaleX: 0.86,
    mouthScaleY: 1.52,
    mouthCurveY: 0,
  },
  confident: {
    id: 'confident',
    label: 'Confident / Ship Ready',
    idLabel: 'Percaya Diri / PR Siap Merge',
    eyeScaleY: 0.95,
    pupilOffsetX: 0,
    pupilOffsetY: 0.001,
    browTiltRad: -0.04,
    browLiftY: 0.004,
    mouthScaleX: 1.18,
    mouthScaleY: 1.08,
    mouthCurveY: 0.003,
  },
  tired: {
    id: 'tired',
    label: 'Tired / Debugging Frustration',
    idLabel: 'Lelah / Frustrasi Debugging CSS & State',
    eyeScaleY: 0.68,
    pupilOffsetX: 0,
    pupilOffsetY: -0.004,
    browTiltRad: 0.16,
    browLiftY: -0.005,
    mouthScaleX: 0.92,
    mouthScaleY: 0.78,
    mouthCurveY: -0.004,
  },
};

export interface FrontendActionSpec {
  id: FrontendActionId;
  label: string;
  idLabel: string;
  category: 'core' | 'workstation' | 'collaboration' | 'personal';
  clipName: FrontendRequiredClipName;
  targetState: FrontendSimulationStateId;
  targetAnchor: EngineeringAnchorId;
  posture: 'standing' | 'seated';
  defaultExpression: FrontendExpressionId;
  handheldProp: FrontendHandheldPropId;
  hideBackpackBecauseSeated: boolean;
  bubbleText: string;
  thoughtText: string;
  durationSec: number;
  loop: boolean;
}

export const FRONTEND_ACTIONS: Record<FrontendActionId, FrontendActionSpec> = {
  idle: {
    id: 'idle',
    label: 'Idle / Stand By',
    idLabel: 'Berdiri Tenang (Idle)',
    category: 'core',
    clipName: 'Idle_Breathing',
    targetState: 'IDLE',
    targetAnchor: 'ENGINEERING_ROOM_IDLE',
    posture: 'standing',
    defaultExpression: 'neutral',
    handheldProp: 'none',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Frontend Studio siap — menunggu tiket sprint atau PR review berikutnya.',
    thoughtText: 'Semua komponen React & TypeScript di Zone A berjalan stabil.',
    durationSec: 4.0,
    loop: true,
  },
  walk: {
    id: 'walk',
    label: 'Walk / Navigate Studio',
    idLabel: 'Berjalan ke Titik Studio',
    category: 'core',
    clipName: 'Walk_Cycle',
    targetState: 'MOVING',
    targetAnchor: 'ENGINEERING_ROOM_SPAWN',
    posture: 'standing',
    defaultExpression: 'neutral',
    handheldProp: 'none',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Berpindah melewati jalur sirkulasi Engineering Studio 8×16...',
    thoughtText: 'Navigasi bebas tabrakan dari Zone A hingga Integration Hub.',
    durationSec: 3.5,
    loop: true,
  },
  work_typing: {
    id: 'work_typing',
    label: 'Work / Coding (Typing)',
    idLabel: 'Mengetik Kode di Meja Frontend',
    category: 'workstation',
    clipName: 'Work_Typing',
    targetState: 'CODING',
    targetAnchor: 'FE_DESK_WORK',
    posture: 'seated',
    defaultExpression: 'focused',
    handheldProp: 'none',
    hideBackpackBecauseSeated: true,
    bubbleText: 'Membangun komponen UI modular dengan TypeScript & state hooks...',
    thoughtText: 'Pastikan tipe props ketat dan render tree bebas re-render berlebih.',
    durationSec: 6.0,
    loop: true,
  },
  review_ui: {
    id: 'review_ui',
    label: 'Review UI Implementation',
    idLabel: 'Review Implementasi UI Dual-Monitor',
    category: 'workstation',
    clipName: 'Review_UI_Implementation',
    targetState: 'REVIEWING_UI',
    targetAnchor: 'FE_DESK_WORK',
    posture: 'seated',
    defaultExpression: 'focused',
    handheldProp: 'none',
    hideBackpackBecauseSeated: true,
    bubbleText: 'Membandingkan hasil render komponen dengan spesifikasi UI/UX Studio...',
    thoughtText: 'Spacing 8px grid, kontras warna, dan fokus keyboard sudah presisi.',
    durationSec: 5.5,
    loop: true,
  },
  debug_frontend: {
    id: 'debug_frontend',
    label: 'Debug Frontend Issue',
    idLabel: 'Debugging Bug & DevTools',
    category: 'workstation',
    clipName: 'Debug_Frontend',
    targetState: 'DEBUGGING',
    targetAnchor: 'FE_DESK_WORK',
    posture: 'seated',
    defaultExpression: 'tired',
    handheldProp: 'none',
    hideBackpackBecauseSeated: true,
    bubbleText: 'Menelusuri stack trace & race condition state di DevTools...',
    thoughtText: 'Tunggu... efek async ini memicu stale closure saat unmount!',
    durationSec: 6.0,
    loop: true,
  },
  test_responsive: {
    id: 'test_responsive',
    label: 'Test Responsive Layout',
    idLabel: 'Uji Responsif Desktop & Mobile',
    category: 'workstation',
    clipName: 'Test_Responsive_Layout',
    targetState: 'RESPONSIVE_TESTING_DEMO',
    targetAnchor: 'FE_MONITOR_INTERACTION',
    posture: 'standing',
    defaultExpression: 'focused',
    handheldProp: 'debug_tablet',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Menguji breakpoint responsive antara layar utama dan mobile test stand...',
    thoughtText: 'Layout fleksibel dari 375px mobile hingga ultrawide desktop.',
    durationSec: 5.5,
    loop: true,
  },
  review_api_contract: {
    id: 'review_api_contract',
    label: 'Review API Contract',
    idLabel: 'Periksa Kontrak API & Payload',
    category: 'collaboration',
    clipName: 'Review_API_Contract',
    targetState: 'REVIEWING_API_CONTRACT',
    targetAnchor: 'BE_API_BOARD',
    posture: 'standing',
    defaultExpression: 'thinking',
    handheldProp: 'tech_document',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Memverifikasi skema response JSON dan status error di papan API...',
    thoughtText: 'Field pagination dan tipe enum sudah sinkron dengan DTO frontend.',
    durationSec: 5.5,
    loop: true,
  },
  discuss_tech: {
    id: 'discuss_tech',
    label: 'Discuss Technical Issue',
    idLabel: 'Diskusi Isu Teknis di Hub',
    category: 'collaboration',
    clipName: 'Discuss_Technical_Issue',
    targetState: 'DISCUSSING',
    targetAnchor: 'ENG_DISCUSSION_POSITION',
    posture: 'standing',
    defaultExpression: 'talking',
    handheldProp: 'none',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Menjelaskan strategi state caching & optimasi bundle di Integration Hub...',
    thoughtText: 'Memisahkan chunk komponen berat akan mempercepat First Contentful Paint.',
    durationSec: 5.0,
    loop: true,
  },
  present_component: {
    id: 'present_component',
    label: 'Present Component',
    idLabel: 'Presentasi Arsitektur Komponen',
    category: 'collaboration',
    clipName: 'Present_Component',
    targetState: 'PRESENTING',
    targetAnchor: 'ENG_ARCHITECTURE_BOARD',
    posture: 'standing',
    defaultExpression: 'confident',
    handheldProp: 'debug_tablet',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Mempresentasikan hierarki komponen UI & alur data di Architecture Board...',
    thoughtText: 'Semua state transisi terdokumentasi jelas untuk tim Engineering.',
    durationSec: 5.5,
    loop: true,
  },
  read_docs: {
    id: 'read_docs',
    label: 'Read Documentation',
    idLabel: 'Baca Dokumentasi Teknis',
    category: 'personal',
    clipName: 'Read_Documentation',
    targetState: 'READING',
    targetAnchor: 'FE_MONITOR_INTERACTION',
    posture: 'standing',
    defaultExpression: 'focused',
    handheldProp: 'tech_document',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Membaca referensi spesifikasi WebGL / Three.js & pola desain komponen...',
    thoughtText: 'Dokumentasi yang rapi menghemat berjam-jam waktu debugging.',
    durationSec: 5.0,
    loop: true,
  },
  think_plan: {
    id: 'think_plan',
    label: 'Think / Plan Architecture',
    idLabel: 'Berpikir & Merancang Solusi',
    category: 'personal',
    clipName: 'Think_Plan',
    targetState: 'THINKING',
    targetAnchor: 'FE_WORKSTATION_APPROACH',
    posture: 'standing',
    defaultExpression: 'thinking',
    handheldProp: 'none',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Merancang struktur state machine & pemisahan domain logic...',
    thoughtText: 'Jika pure logic dipisah dari view, unit test akan jauh lebih bersih.',
    durationSec: 4.5,
    loop: true,
  },
  phone_call: {
    id: 'phone_call',
    label: 'Phone Call / Quick Sync',
    idLabel: 'Panggilan Koordinasi Cepat',
    category: 'personal',
    clipName: 'Phone_Call',
    targetState: 'ON_CALL',
    targetAnchor: 'ENGINEERING_ROOM_IDLE',
    posture: 'standing',
    defaultExpression: 'talking',
    handheldProp: 'smartphone',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Koordinasi cepat terkait jadwal rilis komponen UI sore ini...',
    thoughtText: 'Siap, PR perubahan komponen akan dikirim sebelum jam review.',
    durationSec: 5.0,
    loop: true,
  },
  coffee_break: {
    id: 'coffee_break',
    label: 'Coffee Break',
    idLabel: 'Rehat Kopi Developer',
    category: 'personal',
    clipName: 'Coffee_Break',
    targetState: 'COFFEE_BREAK',
    targetAnchor: 'FE_WORKSTATION_APPROACH',
    posture: 'standing',
    defaultExpression: 'happy',
    handheldProp: 'coffee_cup',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Menikmati kopi hangat sejenak sambil me-refresh fokus pikiran...',
    thoughtText: 'Kopi hitam hangat selalu membantu menemukan solusi bug yang elegan.',
    durationSec: 4.8,
    loop: true,
  },
  code_review: {
    id: 'code_review',
    label: 'Code Review',
    idLabel: 'Review Pull Request di Meja Integrasi',
    category: 'collaboration',
    clipName: 'Code_Review',
    targetState: 'CODE_REVIEW',
    targetAnchor: 'ENG_CODE_REVIEW_POSITION',
    posture: 'standing',
    defaultExpression: 'focused',
    handheldProp: 'gray_laptop',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Meninjau diff Pull Request, aksesibilitas UI, dan cakupan unit test...',
    thoughtText: 'Tidak ada side-effect tersembunyi — kode bersih dan teruji.',
    durationSec: 5.5,
    loop: true,
  },
  waiting_review: {
    id: 'waiting_review',
    label: 'Waiting for Review',
    idLabel: 'Menunggu Hasil CI / Review',
    category: 'collaboration',
    clipName: 'Waiting_Review',
    targetState: 'WAITING_REVIEW',
    targetAnchor: 'ENG_INTEGRATION_TABLE',
    posture: 'standing',
    defaultExpression: 'neutral',
    handheldProp: 'debug_tablet',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Menunggu pipeline build & persetujuan review pada meja integrasi...',
    thoughtText: 'Semua check lint dan unit test sudah hijau.',
    durationSec: 4.5,
    loop: true,
  },
  task_completed: {
    id: 'task_completed',
    label: 'Task Completed',
    idLabel: 'Tugas Frontend Selesai!',
    category: 'core',
    clipName: 'Task_Completed',
    targetState: 'COMPLETED',
    targetAnchor: 'ENGINEERING_ROOM_IDLE',
    posture: 'standing',
    defaultExpression: 'happy',
    handheldProp: 'none',
    hideBackpackBecauseSeated: false,
    bubbleText: 'Fitur Frontend selesai diimplementasikan, tervalidasi, dan siap rilis!',
    thoughtText: 'Satu lagi milestone UI berhasil diselesaikan tepat waktu.',
    durationSec: 3.4,
    loop: false,
  },
};

export const FRONTEND_ACTION_LIST: FrontendActionSpec[] = Object.values(FRONTEND_ACTIONS);

export interface FrontendAutoDemoStep {
  stepIndex: number;
  actionId: FrontendActionId;
  label: string;
  holdDurationSec: number;
}

export const FRONTEND_AUTO_DEMO_SEQUENCE: FrontendAutoDemoStep[] = [
  { stepIndex: 1, actionId: 'idle', label: '1. Idle', holdDurationSec: 2.2 },
  { stepIndex: 2, actionId: 'walk', label: '2. Walk to Workstation', holdDurationSec: 1.8 },
  { stepIndex: 3, actionId: 'work_typing', label: '3. Work Typing', holdDurationSec: 4.0 },
  { stepIndex: 4, actionId: 'review_ui', label: '4. Review UI Implementation', holdDurationSec: 3.8 },
  { stepIndex: 5, actionId: 'debug_frontend', label: '5. Debug Frontend', holdDurationSec: 4.0 },
  { stepIndex: 6, actionId: 'think_plan', label: '6. Think', holdDurationSec: 3.2 },
  { stepIndex: 7, actionId: 'code_review', label: '7. Code Review', holdDurationSec: 3.8 },
  { stepIndex: 8, actionId: 'present_component', label: '8. Present Component', holdDurationSec: 3.8 },
  { stepIndex: 9, actionId: 'task_completed', label: '9. Task Completed', holdDurationSec: 3.0 },
  { stepIndex: 10, actionId: 'idle', label: '10. Return to Idle', holdDurationSec: 2.5 },
];

export const FRONTEND_PATROL_ANCHORS: EngineeringAnchorId[] = [
  'ENGINEERING_ROOM_IDLE',
  'FE_WORKSTATION_APPROACH',
  'FE_MONITOR_INTERACTION',
  'BE_API_BOARD',
  'ENG_CODE_REVIEW_POSITION',
  'ENG_ARCHITECTURE_BOARD',
  'ENG_INTEGRATION_TABLE',
  'ENGINEERING_ROOM_SPAWN',
];

export interface FrontendWalkWaypoint {
  id: string;
  position: [number, number]; // [x, z] in Engineering Studio local space [0..8, 0..16]
  neighbors: string[];
}

/**
 * Collision-free waypoint graph inside the 8x16 Engineering Studio (`[0..8, 0, 0..16]`).
 * Furniture obstacles avoided:
 * - Zone A Frontend Desk (`X = 1.30..3.40`, `Z = 13.31..14.19`)
 * - Zone A NW Bookshelf (`X = 0.39..1.51`, `Z = 15.21..15.63`)
 * - Zone B Backend Desk (`X = 1.30..3.40`, `Z = 9.51..10.39`)
 * - Zone C Integration Table (`X = 2.32..4.18`, `Z = 5.82..6.88`)
 * - Zone D Database Desk (`X = 1.30..3.40`, `Z = 2.21..3.09`)
 * - East Hardware Test Rack & Storage (`X = 6.95..7.85`, `Z = 4.6..14.2`)
 */
export const FRONTEND_WALK_WAYPOINTS: Record<string, FrontendWalkWaypoint> = {
  WP_EAST_SPAWN: {
    id: 'WP_EAST_SPAWN',
    position: [6.4, 8.0],
    neighbors: ['WP_IDLE_HUB', 'WP_MID_CORRIDOR', 'WP_EAST_DOOR'],
  },
  WP_EAST_DOOR: {
    id: 'WP_EAST_DOOR',
    position: [7.15, 8.0],
    neighbors: ['WP_EAST_SPAWN'],
  },
  WP_IDLE_HUB: {
    id: 'WP_IDLE_HUB',
    position: [5.85, 11.2],
    neighbors: ['WP_EAST_SPAWN', 'WP_FE_APPROACH', 'WP_BE_APPROACH', 'WP_MID_CORRIDOR'],
  },
  WP_FE_APPROACH: {
    id: 'WP_FE_APPROACH',
    position: [4.45, 12.95],
    neighbors: [
      'WP_IDLE_HUB',
      'WP_FE_CHAIR',
      'WP_FE_NORTH_BYPASS',
      'WP_NORTH_DOOR',
      'WP_BE_APPROACH',
    ],
  },
  WP_FE_CHAIR: {
    id: 'WP_FE_CHAIR',
    position: [2.35, 12.95],
    neighbors: ['WP_FE_APPROACH', 'WP_FE_DESK_WORK'],
  },
  WP_FE_DESK_WORK: {
    id: 'WP_FE_DESK_WORK',
    position: [2.35, 13.15],
    neighbors: ['WP_FE_CHAIR'],
  },
  WP_FE_NORTH_BYPASS: {
    id: 'WP_FE_NORTH_BYPASS',
    position: [4.0, 14.65],
    neighbors: ['WP_FE_APPROACH', 'WP_NORTH_DOOR', 'WP_FE_MONITOR'],
  },
  WP_FE_MONITOR: {
    id: 'WP_FE_MONITOR',
    position: [1.35, 14.55],
    neighbors: ['WP_FE_NORTH_BYPASS'],
  },
  WP_NORTH_DOOR: {
    id: 'WP_NORTH_DOOR',
    position: [4.0, 15.15],
    neighbors: ['WP_FE_APPROACH', 'WP_FE_NORTH_BYPASS'],
  },
  WP_BE_APPROACH: {
    id: 'WP_BE_APPROACH',
    position: [4.45, 9.15],
    neighbors: ['WP_IDLE_HUB', 'WP_FE_APPROACH', 'WP_BE_API_EAST', 'WP_MID_CORRIDOR'],
  },
  WP_BE_API_EAST: {
    id: 'WP_BE_API_EAST',
    position: [4.15, 11.15],
    neighbors: ['WP_BE_APPROACH', 'WP_IDLE_HUB', 'WP_BE_API_BOARD'],
  },
  WP_BE_API_BOARD: {
    id: 'WP_BE_API_BOARD',
    position: [1.35, 11.15],
    neighbors: ['WP_BE_API_EAST'],
  },
  WP_MID_CORRIDOR: {
    id: 'WP_MID_CORRIDOR',
    position: [5.25, 7.35],
    neighbors: [
      'WP_EAST_SPAWN',
      'WP_IDLE_HUB',
      'WP_BE_APPROACH',
      'WP_INTEGRATION_NORTH',
      'WP_CODE_REVIEW',
    ],
  },
  WP_INTEGRATION_NORTH: {
    id: 'WP_INTEGRATION_NORTH',
    position: [3.25, 7.35],
    neighbors: ['WP_MID_CORRIDOR', 'WP_CODE_REVIEW', 'WP_ARCH_NORTH'],
  },
  WP_CODE_REVIEW: {
    id: 'WP_CODE_REVIEW',
    position: [4.45, 6.35],
    neighbors: ['WP_MID_CORRIDOR', 'WP_INTEGRATION_NORTH', 'WP_DISCUSSION_SOUTH'],
  },
  WP_DISCUSSION_SOUTH: {
    id: 'WP_DISCUSSION_SOUTH',
    position: [3.25, 5.35],
    neighbors: ['WP_CODE_REVIEW', 'WP_ARCH_BOARD'],
  },
  WP_ARCH_NORTH: {
    id: 'WP_ARCH_NORTH',
    position: [1.55, 7.15],
    neighbors: ['WP_INTEGRATION_NORTH', 'WP_ARCH_BOARD'],
  },
  WP_ARCH_BOARD: {
    id: 'WP_ARCH_BOARD',
    position: [1.35, 5.75],
    neighbors: ['WP_ARCH_NORTH', 'WP_DISCUSSION_SOUTH'],
  },
};

function dist2D(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function closestWaypointId(pt: [number, number]): string {
  let bestId = 'WP_IDLE_HUB';
  let bestDist = Infinity;
  for (const wp of Object.values(FRONTEND_WALK_WAYPOINTS)) {
    const d = dist2D(pt, wp.position);
    if (d < bestDist) {
      bestDist = d;
      bestId = wp.id;
    }
  }
  return bestId;
}

/**
 * Computes a collision-free path of `[x, z]` waypoints inside the 8x16 Engineering Studio.
 */
export function findFrontendWalkablePath(
  startXZ: [number, number],
  goalXZ: [number, number]
): Array<[number, number]> {
  const clampedGoal: [number, number] = [
    Math.min(7.35, Math.max(0.75, goalXZ[0])),
    Math.min(15.35, Math.max(0.75, goalXZ[1])),
  ];

  if (dist2D(startXZ, clampedGoal) < 0.32) {
    return [clampedGoal];
  }

  const startWp = closestWaypointId(startXZ);
  const goalWp = closestWaypointId(clampedGoal);

  if (startWp === goalWp) {
    return [FRONTEND_WALK_WAYPOINTS[goalWp].position, clampedGoal];
  }

  // Dijkstra shortest path over FRONTEND_WALK_WAYPOINTS
  const distMap = new Map<string, number>();
  const prevMap = new Map<string, string | null>();
  const unvisited = new Set<string>(Object.keys(FRONTEND_WALK_WAYPOINTS));

  for (const id of unvisited) {
    distMap.set(id, Infinity);
    prevMap.set(id, null);
  }
  distMap.set(startWp, 0);

  while (unvisited.size > 0) {
    let currId: string | null = null;
    let currDist = Infinity;
    for (const id of unvisited) {
      const d = distMap.get(id) ?? Infinity;
      if (d < currDist) {
        currDist = d;
        currId = id;
      }
    }
    if (!currId || currId === goalWp) break;
    unvisited.delete(currId);

    const currNode = FRONTEND_WALK_WAYPOINTS[currId];
    for (const nbId of currNode.neighbors) {
      if (!unvisited.has(nbId)) continue;
      const nbNode = FRONTEND_WALK_WAYPOINTS[nbId];
      const alt = currDist + dist2D(currNode.position, nbNode.position);
      if (alt < (distMap.get(nbId) ?? Infinity)) {
        distMap.set(nbId, alt);
        prevMap.set(nbId, currId);
      }
    }
  }

  const wpChain: Array<[number, number]> = [];
  let trace: string | null = goalWp;
  while (trace) {
    wpChain.unshift(FRONTEND_WALK_WAYPOINTS[trace].position);
    trace = prevMap.get(trace) ?? null;
  }

  if (dist2D(wpChain[wpChain.length - 1], clampedGoal) > 0.06) {
    wpChain.push(clampedGoal);
  }

  return wpChain;
}

export interface FrontendSimulationRuntimeStatus {
  characterId: string;
  displayName: string;
  currentState: FrontendSimulationStateId;
  currentActionId: FrontendActionId;
  currentActionLabel: string;
  activeClipName: FrontendRequiredClipName;
  currentAnchorId: EngineeringAnchorId;
  targetAnchorId: EngineeringAnchorId | null;
  currentExpression: FrontendExpressionId;
  posture: 'standing' | 'seated';
  handheldProp: FrontendHandheldPropId;
  isWalking: boolean;
  isPaused: boolean;
  patrolActive: boolean;
  autoDemoActive: boolean;
  autoDemoStepIndex: number;
  autoDemoTotalSteps: number;
  speedMultiplier: FrontendSpeedMultiplier;
  glassesVisible: boolean;
  backpackVisible: boolean;
  backpackAutoHiddenForSeat: boolean;
  bubbleText: string;
  thoughtText: string;
  worldPosition: [number, number, number];
  facingRad: number;
}
