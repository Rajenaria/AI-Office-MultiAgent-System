/**
 * Pure domain specification for AI Office Engineering Agent 02: Backend Developer
 * (`backend_developer_agent` / `ai_office.character.backend_developer_agent.v1`)
 * inside `AI_OFFICE_ROOM_ENGINEERING_v1` (Engineering Studio, 8×16 m).
 *
 * Free of Three.js so it can be unit-tested with `node:test` and serialized
 * into `backend_developer_agent.manifest.json` and `backend_developer_agent.behavior.json`.
 */

import {
  ENGINEERING_ANCHORS,
  ENGINEERING_ROOM_DIMENSIONS,
  type EngineeringAnchorSpec,
} from './engineeringRoomSpec';

export const BACKEND_CHARACTER_CONSTANTS = {
  CHARACTER_ID: 'backend_developer_agent',
  ASSET_ID: 'ai_office.character.backend_developer_agent.v1',
  DISPLAY_NAME: 'Backend Developer',
  DEPARTMENT: 'Engineering',
  ROOM_ID: 'AI_OFFICE_ROOM_ENGINEERING_v1',
  ROLE_TYPE: 'BACKEND_ENGINEER',
  ROOT_NODE_NAME: 'Backend_Developer_Agent_Root',
  RUNTIME_ROOT_NAME: 'BACKEND_AGENT_RUNTIME_ROOT',
  SCHEMA_VERSION: '1.0.0',
  TARGET_HEIGHT_M: 1.725,
  GROUND_Y: 0.0,
  SEATED_HIP_DROP_Y: -0.175,
  WALK_SPEED_MPS: 1.9,
  ARRIVAL_THRESHOLD_M: 0.06,
  ROTATION_LERP_RATE: 11.0,
  DEFAULT_IDLE_ANCHOR: 'BE_WORKSTATION_APPROACH',
  DEFAULT_SPAWN_ANCHOR: 'BE_WORKSTATION_APPROACH',
} as const;

export type BackendAgentState =
  | 'IDLE'
  | 'MOVING'
  | 'WORKING'
  | 'API_DEVELOPMENT'
  | 'DEBUGGING'
  | 'REVIEWING_LOGS'
  | 'REVIEWING_API_CONTRACT'
  | 'ARCHITECTURE_REVIEW'
  | 'DISCUSSING'
  | 'REVIEWING_DATABASE_DEPENDENCY'
  | 'CODE_REVIEW'
  | 'READING_DOCUMENTATION'
  | 'THINKING'
  | 'PRESENTING'
  | 'COFFEE_BREAK'
  | 'WAITING_REVIEW'
  | 'COMPLETED';

export type BackendActionId =
  | 'IDLE'
  | 'WALK_PATROL'
  | 'WORK_TYPING'
  | 'API_DEVELOPMENT'
  | 'DEBUG_BACKEND'
  | 'REVIEW_SERVICE_LOGS'
  | 'INSPECT_API_CONTRACT'
  | 'BACKEND_ARCHITECTURE_REVIEW'
  | 'TECHNICAL_DISCUSSION'
  | 'DATABASE_DEPENDENCY_REVIEW'
  | 'CODE_REVIEW'
  | 'READ_DOCUMENTATION'
  | 'THINK_PLAN'
  | 'PRESENT_ARCHITECTURE'
  | 'COFFEE_BREAK'
  | 'WAITING_REVIEW'
  | 'TASK_COMPLETED';

export type BackendAnimationClipName =
  | 'Idle_Breathing'
  | 'Walk_Cycle'
  | 'Work_Typing'
  | 'API_Development'
  | 'Debug_Backend'
  | 'Review_Service_Logs'
  | 'Inspect_API_Contract'
  | 'Backend_Architecture_Review'
  | 'Technical_Discussion'
  | 'Database_Dependency_Review'
  | 'Code_Review'
  | 'Read_Documentation'
  | 'Think_Plan'
  | 'Present_Architecture'
  | 'Coffee_Break'
  | 'Waiting_Review'
  | 'Task_Completed';

export const BACKEND_REQUIRED_ANIMATION_CLIPS: readonly BackendAnimationClipName[] = [
  'Idle_Breathing',
  'Walk_Cycle',
  'Work_Typing',
  'API_Development',
  'Debug_Backend',
  'Review_Service_Logs',
  'Inspect_API_Contract',
  'Backend_Architecture_Review',
  'Technical_Discussion',
  'Database_Dependency_Review',
  'Code_Review',
  'Read_Documentation',
  'Think_Plan',
  'Present_Architecture',
  'Coffee_Break',
  'Waiting_Review',
  'Task_Completed',
] as const;

export type BackendExpressionId =
  | 'neutral'
  | 'focused'
  | 'happy'
  | 'thinking'
  | 'talking'
  | 'concerned'
  | 'confident'
  | 'surprised'
  | 'tired';

export const BACKEND_REQUIRED_EXPRESSIONS: readonly BackendExpressionId[] = [
  'neutral',
  'focused',
  'happy',
  'thinking',
  'talking',
  'concerned',
  'confident',
  'surprised',
  'tired',
] as const;

export type BackendPropId =
  | 'none'
  | 'laptop'
  | 'tablet'
  | 'tech_document'
  | 'smartphone'
  | 'coffee_cup'
  | 'notebook';

export type BackendPosture = 'standing' | 'seated';

export type BackendSpeedMultiplier = 0.5 | 1 | 1.5;

export type BackendAnimationPlaybackCommand =
  | 'play'
  | 'pause'
  | 'resume'
  | 'restart'
  | 'reset_idle';

export interface BackendSimulationRuntimeStatus {
  characterId: string;
  displayName: string;
  currentState: BackendAgentState;
  currentActionId: BackendActionId;
  currentActionLabel: string;
  activeClipName: BackendAnimationClipName;
  currentAnchorId: string;
  targetAnchorId: string;
  currentExpression: BackendExpressionId;
  posture: BackendPosture;
  handheldProp: BackendPropId;
  isWalking: boolean;
  isPaused: boolean;
  patrolActive: boolean;
  autoDemoActive: boolean;
  autoDemoStepIndex: number;
  autoDemoTotalSteps: number;
  speedMultiplier: BackendSpeedMultiplier;
  glassesVisible: boolean;
  backpackVisible: boolean;
  backpackAutoHiddenForSeat: boolean;
  bubbleText: string;
  thoughtText: string;
  worldPosition: [number, number, number];
  facingRad: number;
}

export interface BackendHairMaterialSpec {
  id: string;
  role: 'base' | 'shadow' | 'midtone' | 'highlight';
  label: string;
  hex: string;
  roughness: number;
  metalness: number;
}

/**
 * 4-Material Dark Chocolate-Brown Voxel Hair Palette for Backend Developer:
 * 1. Base Hair: Dark chocolate brown (`#2A1B15`)
 * 2. Shadow Hair: Very dark brown with muted reddish/burgundy undertone (`#1A100D`)
 * 3. Midtone Hair: Warm dark brown (`#38241C`)
 * 4. Highlight Hair: Slightly lighter muted brown (`#4A3126`)
 */
export const BACKEND_HAIR_MATERIAL_PALETTE: readonly BackendHairMaterialSpec[] = [
  {
    id: 'Mat_BE_Hair_Base',
    role: 'base',
    label: 'Dark Chocolate Brown Base',
    hex: '#2A1B15',
    roughness: 0.82,
    metalness: 0.04,
  },
  {
    id: 'Mat_BE_Hair_Shadow',
    role: 'shadow',
    label: 'Deep Burgundy-Undertone Brown Shadow',
    hex: '#1A100D',
    roughness: 0.86,
    metalness: 0.03,
  },
  {
    id: 'Mat_BE_Hair_Midtone',
    role: 'midtone',
    label: 'Warm Dark Brown Midtone',
    hex: '#38241C',
    roughness: 0.80,
    metalness: 0.04,
  },
  {
    id: 'Mat_BE_Hair_Highlight',
    role: 'highlight',
    label: 'Muted Chestnut Brown Highlight',
    hex: '#4A3126',
    roughness: 0.78,
    metalness: 0.05,
  },
] as const;

export interface BackendActionSpec {
  id: BackendActionId;
  label: string;
  labelId: string;
  description: string;
  agentState: BackendAgentState;
  clipName: BackendAnimationClipName;
  walkClipName: BackendAnimationClipName;
  targetAnchorName: string;
  posture: BackendPosture;
  expression: BackendExpressionId;
  prop: BackendPropId;
  loopAction: boolean;
  defaultDurationSec: number;
  bubbleText: string;
  thoughtText: string;
}

export const BACKEND_ACTIONS: Record<BackendActionId, BackendActionSpec> = {
  IDLE: {
    id: 'IDLE',
    label: 'Idle Stand',
    labelId: 'Berdiri Siaga',
    description: 'Stand relaxed near the Backend Workstation Approach with calm breathing and gentle weight shift.',
    agentState: 'IDLE',
    clipName: 'Idle_Breathing',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'BE_WORKSTATION_APPROACH',
    posture: 'standing',
    expression: 'neutral',
    prop: 'none',
    loopAction: true,
    defaultDurationSec: 3.0,
    bubbleText: 'Layanan backend stabil. Siap membangun endpoint API dan microservice.',
    thoughtText: 'Semua health-check hijau dan latensi p99 di bawah 18ms.',
  },
  WALK_PATROL: {
    id: 'WALK_PATROL',
    label: 'Walk / Patrol',
    labelId: 'Jalan / Patroli Studio',
    description: 'Walk between Backend Workstation, API Board, Integration Table, Architecture Board, and DB Schema Review.',
    agentState: 'MOVING',
    clipName: 'Walk_Cycle',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'BE_WORKSTATION_APPROACH',
    posture: 'standing',
    expression: 'neutral',
    prop: 'none',
    loopAction: true,
    defaultDurationSec: 6.0,
    bubbleText: 'Berkeliling zona Backend, Architecture Board, dan DB Schema...',
    thoughtText: 'Memastikan sinkronisasi kontrak API dengan tim Frontend dan Database.',
  },
  WORK_TYPING: {
    id: 'WORK_TYPING',
    label: 'Work / Typing',
    labelId: 'Mengetik Kode Backend',
    description: 'Sit at the Backend Desk typing server endpoints, services, and middleware on the mechanical keyboard.',
    agentState: 'WORKING',
    clipName: 'Work_Typing',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'BE_DESK_WORK',
    posture: 'seated',
    expression: 'focused',
    prop: 'none',
    loopAction: true,
    defaultDurationSec: 5.5,
    bubbleText: 'Mengimplementasikan business logic, worker queue, dan middleware auth...',
    thoughtText: 'Pastikan handler idempoten dan transaksi database atomic.',
  },
  API_DEVELOPMENT: {
    id: 'API_DEVELOPMENT',
    label: 'API Development',
    labelId: 'Pengembangan API & Endpoint',
    description: 'Build and test REST/gRPC endpoints at the Backend Desk while checking request/response payloads across monitors.',
    agentState: 'API_DEVELOPMENT',
    clipName: 'API_Development',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'BE_DESK_WORK',
    posture: 'seated',
    expression: 'focused',
    prop: 'none',
    loopAction: true,
    defaultDurationSec: 5.5,
    bubbleText: 'Menyusun endpoint REST & gRPC beserta skema validasi payload v2...',
    thoughtText: 'Rate limiter dan schema validator sudah terpasang di gateway.',
  },
  DEBUG_BACKEND: {
    id: 'DEBUG_BACKEND',
    label: 'Debug Backend',
    labelId: 'Debug Layanan Server',
    description: 'Lean forward toward the primary & vertical terminal displays analyzing stack traces, latency spikes, and breakpoints.',
    agentState: 'DEBUGGING',
    clipName: 'Debug_Backend',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'BE_DESK_WORK',
    posture: 'seated',
    expression: 'concerned',
    prop: 'none',
    loopAction: true,
    defaultDurationSec: 5.0,
    bubbleText: 'Menginspeksi stack trace dan memperbaiki race condition pada worker pool...',
    thoughtText: 'Deadlock terdeteksi di retry queue; tambahkan exponential backoff.',
  },
  REVIEW_SERVICE_LOGS: {
    id: 'REVIEW_SERVICE_LOGS',
    label: 'Review Service Logs',
    labelId: 'Tinjau Log Layanan',
    description: 'Scan vertical terminal output and telemetry streams at the Backend Workstation while cross-checking tablet diagnostics.',
    agentState: 'REVIEWING_LOGS',
    clipName: 'Review_Service_Logs',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'BE_DESK_WORK',
    posture: 'seated',
    expression: 'focused',
    prop: 'tablet',
    loopAction: true,
    defaultDurationSec: 5.0,
    bubbleText: 'Memantau stream log di monitor vertikal dan metrik throughput layanan...',
    thoughtText: 'Zero unhandled exception selama 5.000 request terakhir.',
  },
  INSPECT_API_CONTRACT: {
    id: 'INSPECT_API_CONTRACT',
    label: 'Inspect API Contract',
    labelId: 'Inspeksi Kontrak API',
    description: 'Stand before the Backend API & Services Board reviewing OpenAPI schemas, auth tokens, and payload contracts.',
    agentState: 'REVIEWING_API_CONTRACT',
    clipName: 'Inspect_API_Contract',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'BE_API_BOARD',
    posture: 'standing',
    expression: 'thinking',
    prop: 'tablet',
    loopAction: true,
    defaultDurationSec: 5.0,
    bubbleText: 'Memverifikasi kontrak OpenAPI 3.1 dan struktur response JSON di API Board...',
    thoughtText: 'Field pagination dan error code harus konsisten untuk konsumsi Frontend.',
  },
  BACKEND_ARCHITECTURE_REVIEW: {
    id: 'BACKEND_ARCHITECTURE_REVIEW',
    label: 'Backend Architecture Review',
    labelId: 'Review Arsitektur Backend',
    description: 'Stand at the Engineering Architecture Board evaluating service topology, message queues, and failover boundaries.',
    agentState: 'ARCHITECTURE_REVIEW',
    clipName: 'Backend_Architecture_Review',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'ENG_ARCHITECTURE_BOARD',
    posture: 'standing',
    expression: 'thinking',
    prop: 'notebook',
    loopAction: true,
    defaultDurationSec: 5.0,
    bubbleText: 'Mengevaluasi topologi microservice, event bus, dan circuit breaker...',
    thoughtText: 'Isolasi domain service menjaga fault tolerance saat beban puncak.',
  },
  TECHNICAL_DISCUSSION: {
    id: 'TECHNICAL_DISCUSSION',
    label: 'Technical Discussion',
    labelId: 'Diskusi Teknis Engineering',
    description: 'Stand at the Engineering Discussion Position explaining API contracts, rate limits, and service orchestration.',
    agentState: 'DISCUSSING',
    clipName: 'Technical_Discussion',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'ENG_DISCUSSION_POSITION',
    posture: 'standing',
    expression: 'talking',
    prop: 'tablet',
    loopAction: true,
    defaultDurationSec: 5.0,
    bubbleText: 'Berdiskusi teknis mengenai integrasi endpoint, SLA, dan alur autentikasi...',
    thoughtText: 'Sinkronisasi payload antara Frontend dan Backend mempercepat rilis fitur.',
  },
  DATABASE_DEPENDENCY_REVIEW: {
    id: 'DATABASE_DEPENDENCY_REVIEW',
    label: 'Database Dependency Review',
    labelId: 'Review Dependensi Database',
    description: 'Walk to the Database Schema Review position to inspect query indexes, foreign keys, and migration constraints.',
    agentState: 'REVIEWING_DATABASE_DEPENDENCY',
    clipName: 'Database_Dependency_Review',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'DB_SCHEMA_REVIEW',
    posture: 'standing',
    expression: 'focused',
    prop: 'tech_document',
    loopAction: true,
    defaultDurationSec: 5.0,
    bubbleText: 'Meninjau indeks query, relasi tabel, dan rencana migrasi skema database...',
    thoughtText: 'Composite index pada kolom tenant_id + created_at memangkas waktu query 80%.',
  },
  CODE_REVIEW: {
    id: 'CODE_REVIEW',
    label: 'Code Review',
    labelId: 'Tinjau Kode (PR Review)',
    description: 'Inspect pull requests, unit test coverage, and concurrency safety at the Engineering Code Review Position.',
    agentState: 'CODE_REVIEW',
    clipName: 'Code_Review',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'ENG_CODE_REVIEW_POSITION',
    posture: 'standing',
    expression: 'focused',
    prop: 'laptop',
    loopAction: true,
    defaultDurationSec: 5.0,
    bubbleText: 'Meninjau Pull Request backend: cakupan unit test, keamanan input, dan konkurensi...',
    thoughtText: 'Semua edge case sudah diuji; PR siap di-merge ke branch utama.',
  },
  READ_DOCUMENTATION: {
    id: 'READ_DOCUMENTATION',
    label: 'Read Documentation',
    labelId: 'Baca Dokumentasi RFC',
    description: 'Read RFC specifications and protocol documentation at the Engineering Integration Table.',
    agentState: 'READING_DOCUMENTATION',
    clipName: 'Read_Documentation',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'ENG_INTEGRATION_TABLE',
    posture: 'standing',
    expression: 'focused',
    prop: 'tech_document',
    loopAction: true,
    defaultDurationSec: 5.0,
    bubbleText: 'Membaca spesifikasi RFC arsitektur terdistribusi dan standar keamanan token...',
    thoughtText: 'Standar OAuth2 PKCE dan rotasi refresh token wajib dipatuhi.',
  },
  THINK_PLAN: {
    id: 'THINK_PLAN',
    label: 'Think / Plan',
    labelId: 'Berpikir & Merancang Sistem',
    description: 'Hand-to-chin analytical pose near the API & Services Board planning caching layers and distributed locks.',
    agentState: 'THINKING',
    clipName: 'Think_Plan',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'BE_API_BOARD',
    posture: 'standing',
    expression: 'thinking',
    prop: 'notebook',
    loopAction: true,
    defaultDurationSec: 4.5,
    bubbleText: 'Merancang strategi caching berlapis dan partisi antrean pesan...',
    thoughtText: 'Read-through cache dengan TTL adaptif akan menurunkan beban database.',
  },
  PRESENT_ARCHITECTURE: {
    id: 'PRESENT_ARCHITECTURE',
    label: 'Present Architecture',
    labelId: 'Presentasi Arsitektur Sistem',
    description: 'Present backend microservice architecture and API gateway routing at the Engineering Architecture Board.',
    agentState: 'PRESENTING',
    clipName: 'Present_Architecture',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'ENG_ARCHITECTURE_BOARD',
    posture: 'standing',
    expression: 'confident',
    prop: 'tablet',
    loopAction: true,
    defaultDurationSec: 5.0,
    bubbleText: 'Mempresentasikan arsitektur API Gateway dan orkestrasi service ke tim...',
    thoughtText: 'Alur data end-to-end dari client ke service layer sudah terukur jelas.',
  },
  COFFEE_BREAK: {
    id: 'COFFEE_BREAK',
    label: 'Coffee Break',
    labelId: 'Rehat Kopi',
    description: 'Take a short coffee break near the Backend Workstation Approach while reviewing deployment metrics.',
    agentState: 'COFFEE_BREAK',
    clipName: 'Coffee_Break',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'BE_WORKSTATION_APPROACH',
    posture: 'standing',
    expression: 'happy',
    prop: 'coffee_cup',
    loopAction: true,
    defaultDurationSec: 4.5,
    bubbleText: 'Rehat kopi sejenak sambil memantau grafik uptime server yang stabil...',
    thoughtText: 'Espresso hangat sebelum lanjut optimasi query berikutnya.',
  },
  WAITING_REVIEW: {
    id: 'WAITING_REVIEW',
    label: 'Waiting Review',
    labelId: 'Menunggu CI/CD & Review',
    description: 'Stand near the Integration Table checking smartphone CI/CD notifications while waiting for pipeline approval.',
    agentState: 'WAITING_REVIEW',
    clipName: 'Waiting_Review',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'ENG_INTEGRATION_TABLE',
    posture: 'standing',
    expression: 'tired',
    prop: 'smartphone',
    loopAction: true,
    defaultDurationSec: 4.5,
    bubbleText: 'Menunggu pipeline CI/CD selesai dan persetujuan code review...',
    thoughtText: 'Integrasi test container sedang berjalan di tahap akhir.',
  },
  TASK_COMPLETED: {
    id: 'TASK_COMPLETED',
    label: 'Task Completed',
    labelId: 'Tugas Selesai',
    description: 'Acknowledge green CI/CD build and successful API deployment with a composed nod and raised hand.',
    agentState: 'COMPLETED',
    clipName: 'Task_Completed',
    walkClipName: 'Walk_Cycle',
    targetAnchorName: 'BE_WORKSTATION_APPROACH',
    posture: 'standing',
    expression: 'confident',
    prop: 'none',
    loopAction: false,
    defaultDurationSec: 3.5,
    bubbleText: 'Deployment layanan backend sukses! Semua endpoint API lulus uji integrasi.',
    thoughtText: 'Zero downtime deployment berhasil dijalankan.',
  },
};

export const BACKEND_ACTION_LIST: readonly BackendActionSpec[] = Object.values(BACKEND_ACTIONS);

export interface BackendExpressionPreset {
  id: BackendExpressionId;
  label: string;
  labelId: string;
  eyeScaleY: number;
  pupilOffsetX: number;
  pupilOffsetY: number;
  browLiftY: number;
  browTiltRad: number;
  mouthWidthScale: number;
  mouthOpenScaleY: number;
  mouthSmileOffsetY: number;
}

export const BACKEND_EXPRESSION_PRESETS: Record<BackendExpressionId, BackendExpressionPreset> = {
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    labelId: 'Netral',
    eyeScaleY: 1.0,
    pupilOffsetX: 0.0,
    pupilOffsetY: 0.0,
    browLiftY: 0.0,
    browTiltRad: 0.0,
    mouthWidthScale: 1.0,
    mouthOpenScaleY: 1.0,
    mouthSmileOffsetY: 0.0,
  },
  focused: {
    id: 'focused',
    label: 'Focused',
    labelId: 'Fokus Koding Server',
    eyeScaleY: 0.84,
    pupilOffsetX: 0.0,
    pupilOffsetY: -0.002,
    browLiftY: -0.004,
    browTiltRad: -0.1,
    mouthWidthScale: 0.9,
    mouthOpenScaleY: 0.85,
    mouthSmileOffsetY: -0.001,
  },
  happy: {
    id: 'happy',
    label: 'Happy',
    labelId: 'Senang / Ramah',
    eyeScaleY: 0.88,
    pupilOffsetX: 0.0,
    pupilOffsetY: 0.002,
    browLiftY: 0.005,
    browTiltRad: 0.05,
    mouthWidthScale: 1.24,
    mouthOpenScaleY: 1.16,
    mouthSmileOffsetY: 0.004,
  },
  thinking: {
    id: 'thinking',
    label: 'Thinking',
    labelId: 'Berpikir Analitis',
    eyeScaleY: 0.92,
    pupilOffsetX: 0.004,
    pupilOffsetY: 0.004,
    browLiftY: 0.004,
    browTiltRad: 0.14,
    mouthWidthScale: 0.84,
    mouthOpenScaleY: 0.9,
    mouthSmileOffsetY: -0.001,
  },
  talking: {
    id: 'talking',
    label: 'Talking',
    labelId: 'Berbicara / Diskusi API',
    eyeScaleY: 1.02,
    pupilOffsetX: 0.0,
    pupilOffsetY: 0.0,
    browLiftY: 0.004,
    browTiltRad: 0.04,
    mouthWidthScale: 1.08,
    mouthOpenScaleY: 1.9,
    mouthSmileOffsetY: 0.002,
  },
  concerned: {
    id: 'concerned',
    label: 'Concerned',
    labelId: 'Serius / Debug Insiden',
    eyeScaleY: 0.82,
    pupilOffsetX: -0.002,
    pupilOffsetY: -0.002,
    browLiftY: -0.005,
    browTiltRad: -0.16,
    mouthWidthScale: 0.88,
    mouthOpenScaleY: 0.85,
    mouthSmileOffsetY: -0.003,
  },
  confident: {
    id: 'confident',
    label: 'Confident',
    labelId: 'Percaya Diri',
    eyeScaleY: 0.94,
    pupilOffsetX: 0.0,
    pupilOffsetY: 0.001,
    browLiftY: 0.004,
    browTiltRad: 0.06,
    mouthWidthScale: 1.18,
    mouthOpenScaleY: 1.08,
    mouthSmileOffsetY: 0.003,
  },
  surprised: {
    id: 'surprised',
    label: 'Surprised',
    labelId: 'Terkejut / Alert',
    eyeScaleY: 1.24,
    pupilOffsetX: 0.0,
    pupilOffsetY: 0.002,
    browLiftY: 0.008,
    browTiltRad: 0.08,
    mouthWidthScale: 0.82,
    mouthOpenScaleY: 2.05,
    mouthSmileOffsetY: 0.0,
  },
  tired: {
    id: 'tired',
    label: 'Tired',
    labelId: 'Lelah / Menunggu Deploy',
    eyeScaleY: 0.62,
    pupilOffsetX: 0.0,
    pupilOffsetY: -0.003,
    browLiftY: -0.003,
    browTiltRad: 0.06,
    mouthWidthScale: 0.92,
    mouthOpenScaleY: 0.8,
    mouthSmileOffsetY: -0.002,
  },
};

export interface BackendDemoStep {
  stepIndex: number;
  actionId: BackendActionId;
  label: string;
  holdDurationSec: number;
}

/**
 * 12-Step Auto-Demo Sequence for Backend Developer:
 * 1. Idle at Backend Approach
 * 2. Walk to Backend Desk (Work Typing)
 * 3. API Development at Backend Desk
 * 4. Debug Backend at Backend Desk
 * 5. Review Service Logs at Backend Desk
 * 6. Inspect API Contract at Backend API Board
 * 7. Backend Architecture Review at Architecture Board
 * 8. Present Architecture at Architecture Board
 * 9. Database Dependency Review at DB Schema Review
 * 10. Code Review at Engineering Code Review Position
 * 11. Task Completed at Backend Approach
 * 12. Return to Idle
 */
export const BACKEND_AUTO_DEMO_SEQUENCE: readonly BackendDemoStep[] = [
  {
    stepIndex: 1,
    actionId: 'IDLE',
    label: '1. Idle at Backend Workstation Approach',
    holdDurationSec: 2.0,
  },
  {
    stepIndex: 2,
    actionId: 'WORK_TYPING',
    label: '2. Walk to Backend Desk & Work Typing',
    holdDurationSec: 3.8,
  },
  {
    stepIndex: 3,
    actionId: 'API_DEVELOPMENT',
    label: '3. API Development (REST/gRPC Endpoints)',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 4,
    actionId: 'DEBUG_BACKEND',
    label: '4. Debug Backend Service & Trace Latency',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 5,
    actionId: 'REVIEW_SERVICE_LOGS',
    label: '5. Review Service Logs on Vertical Terminal',
    holdDurationSec: 3.4,
  },
  {
    stepIndex: 6,
    actionId: 'INSPECT_API_CONTRACT',
    label: '6. Walk to Backend API Board & Inspect Contract',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 7,
    actionId: 'BACKEND_ARCHITECTURE_REVIEW',
    label: '7. Walk to Architecture Board & Review Topology',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 8,
    actionId: 'PRESENT_ARCHITECTURE',
    label: '8. Present Service Architecture',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 9,
    actionId: 'DATABASE_DEPENDENCY_REVIEW',
    label: '9. Database Dependency Review at Schema Board',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 10,
    actionId: 'CODE_REVIEW',
    label: '10. Code Review at Engineering Review Position',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 11,
    actionId: 'TASK_COMPLETED',
    label: '11. Task Completed',
    holdDurationSec: 3.0,
  },
  {
    stepIndex: 12,
    actionId: 'IDLE',
    label: '12. Return to Idle',
    holdDurationSec: 2.2,
  },
] as const;

export const BACKEND_PATROL_ANCHOR_RING: readonly string[] = [
  'BE_WORKSTATION_APPROACH',
  'BE_API_BOARD',
  'ENG_INTEGRATION_TABLE',
  'ENG_ARCHITECTURE_BOARD',
  'ENG_DISCUSSION_POSITION',
  'ENG_CODE_REVIEW_POSITION',
  'DB_SCHEMA_REVIEW',
] as const;

/**
 * Navigation waypoint graph inside `AI_OFFICE_ROOM_ENGINEERING_v1` (8×16 m)
 * routing cleanly along the eastern circulation spine (`X ≈ 4.45..6.40`)
 * and western workstation aisles without colliding with Frontend (`Z=14.15`),
 * Backend (`Z=10.05`), Integration Table (`Z=6.35`), or Database (`Z=2.65`) desks.
 */
export interface BackendNavWaypoint {
  id: string;
  position: [number, number]; // [x, z]
  neighbors: string[];
}

export const BACKEND_WALK_WAYPOINTS: Record<string, BackendNavWaypoint> = {
  WP_SPAWN: {
    id: 'WP_SPAWN',
    position: [6.4, 8.0],
    neighbors: ['WP_CORRIDOR_MID_N', 'WP_CORRIDOR_MID_S', 'WP_BE_APPROACH'],
  },
  WP_IDLE: {
    id: 'WP_IDLE',
    position: [5.85, 11.2],
    neighbors: ['WP_CORRIDOR_NORTH', 'WP_CORRIDOR_MID_N', 'WP_BE_APPROACH'],
  },
  WP_CORRIDOR_NORTH: {
    id: 'WP_CORRIDOR_NORTH',
    position: [5.2, 13.35],
    neighbors: ['WP_IDLE', 'WP_CORRIDOR_MID_N'],
  },
  WP_CORRIDOR_MID_N: {
    id: 'WP_CORRIDOR_MID_N',
    position: [5.2, 10.6],
    neighbors: ['WP_IDLE', 'WP_CORRIDOR_NORTH', 'WP_BE_APPROACH', 'WP_BE_API_CORRIDOR', 'WP_SPAWN'],
  },
  WP_BE_API_CORRIDOR: {
    id: 'WP_BE_API_CORRIDOR',
    position: [3.65, 11.15],
    neighbors: ['WP_CORRIDOR_MID_N', 'WP_BE_API_BOARD', 'WP_BE_APPROACH'],
  },
  WP_BE_API_BOARD: {
    id: 'WP_BE_API_BOARD',
    position: [1.35, 11.15],
    neighbors: ['WP_BE_API_CORRIDOR', 'WP_BE_CHAIR'],
  },
  WP_BE_APPROACH: {
    id: 'WP_BE_APPROACH',
    position: [4.45, 9.25],
    neighbors: ['WP_CORRIDOR_MID_N', 'WP_SPAWN', 'WP_BE_CHAIR', 'WP_BE_API_CORRIDOR', 'WP_CORRIDOR_MID_S'],
  },
  WP_BE_CHAIR: {
    id: 'WP_BE_CHAIR',
    position: [2.35, 9.25],
    neighbors: ['WP_BE_APPROACH', 'WP_BE_DESK_WORK', 'WP_BE_API_BOARD', 'WP_INTEGRATION_NORTH'],
  },
  WP_BE_DESK_WORK: {
    id: 'WP_BE_DESK_WORK',
    position: [2.35, 9.45],
    neighbors: ['WP_BE_CHAIR'],
  },
  WP_CORRIDOR_MID_S: {
    id: 'WP_CORRIDOR_MID_S',
    position: [5.2, 7.35],
    neighbors: ['WP_SPAWN', 'WP_BE_APPROACH', 'WP_INTEGRATION_NORTH', 'WP_CODE_REVIEW', 'WP_CORRIDOR_SOUTH'],
  },
  WP_INTEGRATION_NORTH: {
    id: 'WP_INTEGRATION_NORTH',
    position: [3.25, 7.35],
    neighbors: ['WP_CORRIDOR_MID_S', 'WP_BE_CHAIR', 'WP_CODE_REVIEW', 'WP_ARCH_BOARD'],
  },
  WP_CODE_REVIEW: {
    id: 'WP_CODE_REVIEW',
    position: [4.45, 6.35],
    neighbors: ['WP_CORRIDOR_MID_S', 'WP_INTEGRATION_NORTH', 'WP_DISCUSSION', 'WP_CORRIDOR_SOUTH'],
  },
  WP_DISCUSSION: {
    id: 'WP_DISCUSSION',
    position: [3.25, 5.35],
    neighbors: ['WP_CODE_REVIEW', 'WP_ARCH_BOARD', 'WP_CORRIDOR_SOUTH'],
  },
  WP_ARCH_BOARD: {
    id: 'WP_ARCH_BOARD',
    position: [1.35, 5.75],
    neighbors: ['WP_INTEGRATION_NORTH', 'WP_DISCUSSION'],
  },
  WP_CORRIDOR_SOUTH: {
    id: 'WP_CORRIDOR_SOUTH',
    position: [5.2, 4.2],
    neighbors: ['WP_CORRIDOR_MID_S', 'WP_CODE_REVIEW', 'WP_DISCUSSION', 'WP_DB_SCHEMA_REVIEW'],
  },
  WP_DB_SCHEMA_REVIEW: {
    id: 'WP_DB_SCHEMA_REVIEW',
    position: [5.45, 1.85],
    neighbors: ['WP_CORRIDOR_SOUTH'],
  },
};

export function getEngineeringAnchorForBackendOrThrow(anchorName: string): EngineeringAnchorSpec {
  const found = ENGINEERING_ANCHORS.find((a) => a.name === anchorName);
  if (!found) {
    throw new Error(`Unknown Engineering Studio anchor "${anchorName}" for Backend Developer.`);
  }
  return found;
}

function dist2D(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function findNearestBackendWaypointId(xz: [number, number]): string {
  let bestId = 'WP_BE_APPROACH';
  let bestDist = Infinity;
  for (const wp of Object.values(BACKEND_WALK_WAYPOINTS)) {
    const d = dist2D(xz, wp.position);
    if (d < bestDist) {
      bestDist = d;
      bestId = wp.id;
    }
  }
  return bestId;
}

/**
 * Computes a collision-free waypoint path `[x, z][]` inside the 8×16 Engineering Studio.
 */
export function findBackendWalkablePath(
  startXZ: [number, number],
  goalXZ: [number, number],
): [number, number][] {
  if (dist2D(startXZ, goalXZ) <= 0.25) {
    return [goalXZ];
  }

  const startWp = findNearestBackendWaypointId(startXZ);
  const goalWp = findNearestBackendWaypointId(goalXZ);

  if (startWp === goalWp) {
    return [BACKEND_WALK_WAYPOINTS[goalWp].position, goalXZ];
  }

  // Dijkstra shortest path over BACKEND_WALK_WAYPOINTS
  const distMap: Record<string, number> = {};
  const prevMap: Record<string, string | null> = {};
  const unvisited = new Set<string>(Object.keys(BACKEND_WALK_WAYPOINTS));

  for (const id of unvisited) {
    distMap[id] = Infinity;
    prevMap[id] = null;
  }
  distMap[startWp] = 0;

  while (unvisited.size > 0) {
    let u: string | null = null;
    let best = Infinity;
    for (const id of unvisited) {
      if (distMap[id] < best) {
        best = distMap[id];
        u = id;
      }
    }
    if (!u || u === goalWp) break;
    unvisited.delete(u);

    const wp = BACKEND_WALK_WAYPOINTS[u];
    for (const nb of wp.neighbors) {
      if (!unvisited.has(nb)) continue;
      const alt = distMap[u] + dist2D(wp.position, BACKEND_WALK_WAYPOINTS[nb].position);
      if (alt < distMap[nb]) {
        distMap[nb] = alt;
        prevMap[nb] = u;
      }
    }
  }

  const chain: [number, number][] = [];
  let curr: string | null = goalWp;
  while (curr) {
    chain.unshift(BACKEND_WALK_WAYPOINTS[curr].position);
    curr = prevMap[curr];
  }

  // Append exact goalXZ if not identical to last waypoint
  const last = chain[chain.length - 1];
  if (!last || dist2D(last, goalXZ) > 0.04) {
    chain.push(goalXZ);
  }

  // Clamp all points inside the 8x16 room bounds with safe margin
  const margin = 0.45;
  return chain.map(([x, z]) => [
    Math.min(ENGINEERING_ROOM_DIMENSIONS.width - margin, Math.max(margin, x)),
    Math.min(ENGINEERING_ROOM_DIMENSIONS.length - margin, Math.max(margin, z)),
  ]);
}
