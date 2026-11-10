import {
  DEFAULT_QA_DEVOPS_ANCHORS,
  QA_DEVOPS_MODULE_CONSTANTS,
  type QADevOpsActivityAnchor,
  type QADevOpsAnchorId,
} from './qaDevopsRoomSpec';

/**
 * ============================================================================
 * DEVOPS ENGINEER VOXEL CHARACTER — SIMULATION, VISUAL, & BEHAVIOR SPECIFICATION
 * ============================================================================
 * Module 06 — QA & DevOps Integrated Studio (8 × 16 × 3.2 units)
 * Character ID: `devops_engineer_agent`
 * Primary Zone: South DevOps & AI Engine Operations Zone (Z ≈ 0.0..5.4) +
 *               Shared Cozy Release Lounge & Review Zone (Z ≈ 5.4..10.6)
 *
 * Strictly DEMO / VISUAL SIMULATION ONLY — never executes shell commands,
 * real cloud deployments, or live infrastructure operations.
 */

export const DEVOPS_CHARACTER_CONSTANTS = {
  CHARACTER_ID: 'devops_engineer_agent',
  ASSET_ID: 'ai_office.character.devops_engineer_agent.v1',
  DISPLAY_NAME: 'DevOps Engineer',
  FULL_ROLE_TITLE: 'DevOps & AI Engine Operations Specialist',
  DEPARTMENT: 'DevOps & AI Engine',
  COMPATIBLE_ROOM_ID: QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID,
  LOCAL_ORIGIN: [0, 0, 0] as [number, number, number],
  TARGET_HEIGHT_M: 1.735,
  HEIGHT_MIN_M: 1.65,
  HEIGHT_MAX_M: 1.78,
  STANDING_HIPS_Y: 0.9,
  SEATED_HIPS_Y: 0.725,
  FORWARD_AXIS: '+Z',
  UP_AXIS: '+Y',
  DEFAULT_SPAWN_ANCHOR: 'DEVOPS_WORKSTATION_APPROACH' as QADevOpsAnchorId,
  PRIMARY_WORK_ANCHOR: 'DEVOPS_DESK_WORK' as QADevOpsAnchorId,
  SEATED_CHAIR_ANCHOR: 'DEVOPS_CHAIR' as QADevOpsAnchorId,
  GLB_FILENAME: 'devops_engineer_agent.glb',
  MANIFEST_FILENAME: 'devops_engineer_agent.manifest.json',
  BEHAVIOR_FILENAME: 'devops_engineer_agent.behavior.json',
  PREVIEW_FILENAME: 'devops_engineer_agent_preview.png',
  PACK_ZIP_FILENAME: 'devops_engineer_agent_pack_v1.zip',
} as const;

/**
 * 9 Semantic Hair Sub-Groups under `Head -> Hair` for Agent 09 (DevOps Engineer):
 * Short, dense, naturally curly black/charcoal voxel hairstyle with 360° stepped
 * rounded-angular curl clusters.
 */
export const DEVOPS_HAIR_SUBGROUPS = [
  'Hair_Base_Volume',
  'Hair_Crown_Core',
  'Hair_Crown_Curls',
  'Hair_Front_Curls',
  'Hair_Left_Curls',
  'Hair_Right_Curls',
  'Hair_Back_Curls',
  'Hair_Temple_Transition',
  'Hair_Nape_Details',
] as const;

export type DevOpsHairSubgroupName = (typeof DEVOPS_HAIR_SUBGROUPS)[number];

export interface DevOpsHairMaterialSwatch {
  id: string;
  hex: string;
  roughness: number;
  metalness: number;
  role: string;
}

/**
 * Multi-shade dark charcoal / black matte palette so individual stepped curl
 * clusters remain readable in isometric lighting without washing into a flat blob.
 */
export const DEVOPS_HAIR_MATERIAL_PALETTE: DevOpsHairMaterialSwatch[] = [
  {
    id: 'devops_hair_charcoal_base',
    hex: '#181B22',
    roughness: 0.88,
    metalness: 0.03,
    role: 'Primary dense curly hair volume & crown base',
  },
  {
    id: 'devops_hair_deep_black_shadow',
    hex: '#0E1015',
    roughness: 0.93,
    metalness: 0.02,
    role: 'Inner curl crevices, under-fringe & lower nape shadow',
  },
  {
    id: 'devops_hair_dark_slate_mid',
    hex: '#222630',
    roughness: 0.85,
    metalness: 0.04,
    role: 'Mid-layer stepped side & back curl clusters',
  },
  {
    id: 'devops_hair_soft_graphite_highlight',
    hex: '#2E3440',
    roughness: 0.82,
    metalness: 0.05,
    role: 'Upper crown & outer stepped curl cluster bevel highlights',
  },
  {
    id: 'devops_hair_top_curl_accent',
    hex: '#3A4150',
    roughness: 0.8,
    metalness: 0.05,
    role: 'Subtle top-most curl cluster tips & front brow-framing curls',
  },
];

export const DEVOPS_OUTFIT_PALETTE = {
  SKIN_BASE: '#8C583A',
  SKIN_SHADOW: '#73452B',
  SKIN_CHEEK_WARM: '#9E6242',
  JACKET_CHARCOAL_NAVY: '#1A202C',
  JACKET_PANEL_DARK: '#12161F',
  JACKET_RIB_TRIM: '#262E3D',
  INNER_SHIRT_WHITE: '#F1EFEA',
  INNER_SHIRT_SHADOW: '#DBD7CE',
  CYAN_ACCENT: '#38BDF8',
  CYAN_DEEP: '#0284C7',
  CYAN_GLOW: '#7DD3FC',
  HEADPHONE_WHITE: '#F3F4F6',
  HEADPHONE_SILVER: '#CBD5E1',
  HEADPHONE_CUSHION_DARK: '#1E2430',
  HEADPHONE_RING_CYAN: '#38BDF8',
  TROUSERS_CHARCOAL: '#1D222B',
  TROUSERS_CUFF_WHITE: '#E5E7EB',
  SNEAKER_WHITE: '#F4F4F6',
  SNEAKER_SOLE_DARK: '#1F242D',
  SNEAKER_CYAN_ACCENT: '#0EA5E9',
  BACKPACK_BLACK: '#161A22',
  BACKPACK_TRIM_SLATE: '#28303F',
  BACKPACK_CLOUD_CYAN: '#38BDF8',
  GLASSES_FRAME: '#181B22',
} as const;

export type DevOpsAgentState =
  | 'IDLE'
  | 'WALKING'
  | 'SITTING_WORK_DESK'
  | 'TYPING_DEVOPS_CONSOLE'
  | 'TECHNICAL_TALK'
  | 'MONITOR_INFRASTRUCTURE'
  | 'REVIEW_CICD_PIPELINE'
  | 'DEPLOYMENT_PREPARATION'
  | 'DEPLOYING_SERVICE_DEMO'
  | 'INSPECTING_SERVER_RACK'
  | 'SERVICE_HEALTH_REVIEW'
  | 'INCIDENT_ALERT_REACTION'
  | 'TROUBLESHOOTING_INCIDENT'
  | 'REVIEWING_LOGS'
  | 'ANALYZING_METRICS'
  | 'AI_ENGINE_STATUS_REVIEW'
  | 'RESOURCE_HEALTH_CHECK'
  | 'ENGINE_SWITCH_REVIEW'
  | 'READING_RUNBOOK'
  | 'RELEASE_READINESS_DISCUSSION'
  | 'PRESENTING_OPERATIONS_STATUS'
  | 'PHONE_CALL'
  | 'THINKING_INVESTIGATING'
  | 'COFFEE_BREAK'
  | 'WAITING_RELEASE_APPROVAL'
  | 'TASK_COMPLETED';

export type DevOpsActionId =
  | 'IDLE'
  | 'WALK_PATROL'
  | 'WORK_DESK'
  | 'TECHNICAL_TALK'
  | 'MONITOR_INFRASTRUCTURE'
  | 'REVIEW_CICD_PIPELINE'
  | 'DEPLOYMENT_PREPARATION'
  | 'DEPLOY_SERVICE_DEMO'
  | 'INSPECT_SERVER_RACK'
  | 'SERVICE_HEALTH_REVIEW'
  | 'INCIDENT_ALERT_REACTION'
  | 'TROUBLESHOOT_INCIDENT'
  | 'REVIEW_LOGS'
  | 'ANALYZE_METRICS'
  | 'AI_ENGINE_STATUS_REVIEW'
  | 'RESOURCE_HEALTH_CHECK'
  | 'ENGINE_SWITCH_REVIEW'
  | 'READ_RUNBOOK'
  | 'RELEASE_READINESS_DISCUSSION'
  | 'PRESENT_OPERATIONS_STATUS'
  | 'PHONE_CALL'
  | 'THINK_INVESTIGATE'
  | 'COFFEE_BREAK'
  | 'WAITING_APPROVAL'
  | 'TASK_COMPLETED';

export type DevOpsAnimationClipName =
  | 'Idle_Breathing'
  | 'Walk_Cycle'
  | 'Sit_Down'
  | 'Stand_Up'
  | 'Work_Typing'
  | 'Technical_Talk'
  | 'Monitor_Infrastructure'
  | 'Review_CICD_Pipeline'
  | 'Deployment_Preparation'
  | 'Deploy_Demo'
  | 'Inspect_Server_Rack'
  | 'Service_Health_Review'
  | 'Incident_Alert_Reaction'
  | 'Troubleshoot_Incident'
  | 'Review_Logs'
  | 'Analyze_Metrics'
  | 'AI_Engine_Status_Review'
  | 'Resource_Health_Check'
  | 'Engine_Switch_Review'
  | 'Read_Runbook'
  | 'Release_Readiness_Discussion'
  | 'Present_Operations_Status'
  | 'Phone_Call'
  | 'Think_Investigate'
  | 'Coffee_Break'
  | 'Waiting_Approval'
  | 'Task_Completed';

export const DEVOPS_REQUIRED_ANIMATION_CLIPS: DevOpsAnimationClipName[] = [
  'Idle_Breathing',
  'Walk_Cycle',
  'Sit_Down',
  'Stand_Up',
  'Work_Typing',
  'Technical_Talk',
  'Monitor_Infrastructure',
  'Review_CICD_Pipeline',
  'Deployment_Preparation',
  'Deploy_Demo',
  'Inspect_Server_Rack',
  'Service_Health_Review',
  'Incident_Alert_Reaction',
  'Troubleshoot_Incident',
  'Review_Logs',
  'Analyze_Metrics',
  'AI_Engine_Status_Review',
  'Resource_Health_Check',
  'Engine_Switch_Review',
  'Read_Runbook',
  'Release_Readiness_Discussion',
  'Present_Operations_Status',
  'Phone_Call',
  'Think_Investigate',
  'Coffee_Break',
  'Waiting_Approval',
  'Task_Completed',
];

export type DevOpsExpressionId =
  | 'neutral'
  | 'focused'
  | 'happy'
  | 'curious'
  | 'thinking'
  | 'talking'
  | 'alert'
  | 'concerned'
  | 'tired'
  | 'confident';

export type DevOpsPropId =
  | 'none'
  | 'devops_laptop'
  | 'tablet'
  | 'smartphone'
  | 'technical_clipboard'
  | 'runbook'
  | 'coffee_cup'
  | 'diagnostic_device';

export type DevOpsRuntimeIndicatorId =
  | 'none'
  | 'deploy_cloud_upload'
  | 'monitoring_pulse'
  | 'incident_alert_triangle'
  | 'cloud_status_ok'
  | 'pipeline_stage_badge'
  | 'completed_check';

export type DevOpsSpeedMultiplier = 0.5 | 1 | 1.5;

export type DevOpsAnimationPlaybackCommand =
  | 'play'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'reset_position'
  | 'reset_idle';

export interface DevOpsExpressionPreset {
  id: DevOpsExpressionId;
  label: string;
  labelId: string;
  eyeScaleY: number;
  pupilOffsetX: number;
  pupilOffsetY: number;
  leftBrowTiltRad: number;
  rightBrowTiltRad: number;
  browOffsetY: number;
  mouthWidthScale: number;
  mouthHeightScale: number;
  mouthCurveY: number;
  showSweatDrop: boolean;
  showAlertBadge: boolean;
  showSleepZzz: boolean;
  showCoolSunglasses: boolean;
}

export const DEVOPS_EXPRESSION_PRESETS: Record<DevOpsExpressionId, DevOpsExpressionPreset> = {
  neutral: {
    id: 'neutral',
    label: 'Neutral / Calm',
    labelId: 'Netral / Tenang',
    eyeScaleY: 1.0,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    leftBrowTiltRad: 0,
    rightBrowTiltRad: 0,
    browOffsetY: 0,
    mouthWidthScale: 1.0,
    mouthHeightScale: 1.0,
    mouthCurveY: 0,
    showSweatDrop: false,
    showAlertBadge: false,
    showSleepZzz: false,
    showCoolSunglasses: false,
  },
  focused: {
    id: 'focused',
    label: 'Focused / Monitoring',
    labelId: 'Fokus / Monitoring',
    eyeScaleY: 0.86,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    leftBrowTiltRad: -0.1,
    rightBrowTiltRad: 0.1,
    browOffsetY: -0.004,
    mouthWidthScale: 0.92,
    mouthHeightScale: 0.85,
    mouthCurveY: 0,
    showSweatDrop: false,
    showAlertBadge: false,
    showSleepZzz: false,
    showCoolSunglasses: false,
  },
  happy: {
    id: 'happy',
    label: 'Happy / Deploy Success',
    labelId: 'Senang / Deploy Sukses',
    eyeScaleY: 0.45,
    pupilOffsetX: 0,
    pupilOffsetY: 0.002,
    leftBrowTiltRad: 0.08,
    rightBrowTiltRad: -0.08,
    browOffsetY: 0.006,
    mouthWidthScale: 1.25,
    mouthHeightScale: 1.3,
    mouthCurveY: 0.004,
    showSweatDrop: false,
    showAlertBadge: false,
    showSleepZzz: false,
    showCoolSunglasses: false,
  },
  curious: {
    id: 'curious',
    label: 'Curious / Questioning (?)',
    labelId: 'Penasaran / Cek Metrik (?)',
    eyeScaleY: 1.08,
    pupilOffsetX: 0.004,
    pupilOffsetY: 0.003,
    leftBrowTiltRad: 0.16,
    rightBrowTiltRad: -0.04,
    browOffsetY: 0.005,
    mouthWidthScale: 0.78,
    mouthHeightScale: 1.15,
    mouthCurveY: 0,
    showSweatDrop: false,
    showAlertBadge: false,
    showSleepZzz: false,
    showCoolSunglasses: false,
  },
  thinking: {
    id: 'thinking',
    label: 'Thinking / Root Cause (...)',
    labelId: 'Berpikir / Investigasi (...)',
    eyeScaleY: 0.82,
    pupilOffsetX: -0.004,
    pupilOffsetY: 0.004,
    leftBrowTiltRad: -0.06,
    rightBrowTiltRad: 0.14,
    browOffsetY: 0.002,
    mouthWidthScale: 0.85,
    mouthHeightScale: 0.85,
    mouthCurveY: -0.001,
    showSweatDrop: false,
    showAlertBadge: false,
    showSleepZzz: false,
    showCoolSunglasses: false,
  },
  talking: {
    id: 'talking',
    label: 'Talking / Ops Briefing',
    labelId: 'Berbicara / Briefing Ops',
    eyeScaleY: 1.0,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    leftBrowTiltRad: 0.06,
    rightBrowTiltRad: -0.06,
    browOffsetY: 0.004,
    mouthWidthScale: 1.18,
    mouthHeightScale: 1.65,
    mouthCurveY: 0.002,
    showSweatDrop: false,
    showAlertBadge: false,
    showSleepZzz: false,
    showCoolSunglasses: false,
  },
  alert: {
    id: 'alert',
    label: 'Alert / Incident Warning (!!)',
    labelId: 'Siaga / Incident Alert (!!)',
    eyeScaleY: 1.24,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    leftBrowTiltRad: -0.18,
    rightBrowTiltRad: 0.18,
    browOffsetY: 0.007,
    mouthWidthScale: 1.05,
    mouthHeightScale: 1.45,
    mouthCurveY: -0.003,
    showSweatDrop: false,
    showAlertBadge: true,
    showSleepZzz: false,
    showCoolSunglasses: false,
  },
  concerned: {
    id: 'concerned',
    label: 'Concerned / High Load',
    labelId: 'Waspada / Beban Tinggi',
    eyeScaleY: 0.94,
    pupilOffsetX: 0.002,
    pupilOffsetY: -0.002,
    leftBrowTiltRad: 0.16,
    rightBrowTiltRad: -0.16,
    browOffsetY: -0.002,
    mouthWidthScale: 0.9,
    mouthHeightScale: 0.9,
    mouthCurveY: -0.003,
    showSweatDrop: true,
    showAlertBadge: false,
    showSleepZzz: false,
    showCoolSunglasses: false,
  },
  tired: {
    id: 'tired',
    label: 'Tired / Night On-Call (Zzz)',
    labelId: 'Lelah / On-Call Malam (Zzz)',
    eyeScaleY: 0.42,
    pupilOffsetX: 0,
    pupilOffsetY: -0.003,
    leftBrowTiltRad: 0.06,
    rightBrowTiltRad: -0.06,
    browOffsetY: -0.005,
    mouthWidthScale: 0.82,
    mouthHeightScale: 0.8,
    mouthCurveY: -0.002,
    showSweatDrop: false,
    showAlertBadge: false,
    showSleepZzz: true,
    showCoolSunglasses: false,
  },
  confident: {
    id: 'confident',
    label: 'Confident / Cool Ops',
    labelId: 'Percaya Diri / Cool Ops',
    eyeScaleY: 0.92,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    leftBrowTiltRad: 0.08,
    rightBrowTiltRad: -0.08,
    browOffsetY: 0.004,
    mouthWidthScale: 1.22,
    mouthHeightScale: 1.15,
    mouthCurveY: 0.004,
    showSweatDrop: false,
    showAlertBadge: false,
    showSleepZzz: false,
    showCoolSunglasses: true,
  },
};

export interface DevOpsActionContract {
  id: DevOpsActionId;
  buttonNumber: number;
  labelId: string;
  labelEn: string;
  targetState: DevOpsAgentState;
  clipName: DevOpsAnimationClipName;
  targetAnchorName: QADevOpsAnchorId;
  posture: 'standing' | 'seated';
  defaultExpression: DevOpsExpressionId;
  handheldProp: DevOpsPropId;
  runtimeIndicator: DevOpsRuntimeIndicatorId;
  bubbleText: string;
  thoughtText: string;
  durationSeconds: number;
}

export const DEVOPS_ACTIONS: Record<DevOpsActionId, DevOpsActionContract> = {
  IDLE: {
    id: 'IDLE',
    buttonNumber: 1,
    labelId: 'Diam / Siaga',
    labelEn: 'Idle / Ready',
    targetState: 'IDLE',
    clipName: 'Idle_Breathing',
    targetAnchorName: 'DEVOPS_WORKSTATION_APPROACH',
    posture: 'standing',
    defaultExpression: 'neutral',
    handheldProp: 'none',
    runtimeIndicator: 'none',
    bubbleText: 'DevOps & AI Engine Operations siap memantau pipeline dan infrastruktur (SIMULASI / DEMO).',
    thoughtText: 'Semua cluster hijau; siap menjalankan pemeriksaan health dan pipeline.',
    durationSeconds: 4.0,
  },
  WALK_PATROL: {
    id: 'WALK_PATROL',
    buttonNumber: 2,
    labelId: 'Jalan / Patroli DevOps Zone',
    labelEn: 'Walk / Patrol DevOps Zone',
    targetState: 'WALKING',
    clipName: 'Walk_Cycle',
    targetAnchorName: 'DEVOPS_RACK_INSPECTION',
    posture: 'standing',
    defaultExpression: 'focused',
    handheldProp: 'tablet',
    runtimeIndicator: 'none',
    bubbleText: 'Berjalan keliling zona DevOps memeriksa meja operasi, rak server, dan papan status (DEMO).',
    thoughtText: 'Memastikan jalur koridor, rak infrastruktur, dan workstation tetap optimal.',
    durationSeconds: 6.0,
  },
  WORK_DESK: {
    id: 'WORK_DESK',
    buttonNumber: 3,
    labelId: 'Duduk & Kerja di Meja DevOps',
    labelEn: 'Sit & Work at DevOps Desk',
    targetState: 'TYPING_DEVOPS_CONSOLE',
    clipName: 'Work_Typing',
    targetAnchorName: 'DEVOPS_DESK_WORK',
    posture: 'seated',
    defaultExpression: 'focused',
    handheldProp: 'none',
    runtimeIndicator: 'none',
    bubbleText: 'Menulis konfigurasi infrastruktur dan mengaudit skrip deployment di konsol DevOps (DEMO).',
    thoughtText: 'Menyelaraskan manifest container dan parameter auto-scaling di meja operasi.',
    durationSeconds: 5.5,
  },
  TECHNICAL_TALK: {
    id: 'TECHNICAL_TALK',
    buttonNumber: 4,
    labelId: 'Diskusi Teknis',
    labelEn: 'Technical Talk',
    targetState: 'TECHNICAL_TALK',
    clipName: 'Technical_Talk',
    targetAnchorName: 'QA_DEVOPS_DISCUSSION_POSITION',
    posture: 'standing',
    defaultExpression: 'talking',
    handheldProp: 'tablet',
    runtimeIndicator: 'none',
    bubbleText: 'Menjelaskan топоlogi layanan, latensi p95, dan kesiapan rilis bersama tim (SIMULASI).',
    thoughtText: 'Sinkronisasi lintas fungsi antara QA Engineer dan DevOps Operations.',
    durationSeconds: 4.5,
  },
  MONITOR_INFRASTRUCTURE: {
    id: 'MONITOR_INFRASTRUCTURE',
    buttonNumber: 5,
    labelId: 'Monitor Infrastruktur',
    labelEn: 'Monitor Infrastructure',
    targetState: 'MONITOR_INFRASTRUCTURE',
    clipName: 'Monitor_Infrastructure',
    targetAnchorName: 'DEVOPS_MONITORING_DISPLAY',
    posture: 'standing',
    defaultExpression: 'focused',
    handheldProp: 'tablet',
    runtimeIndicator: 'monitoring_pulse',
    bubbleText: 'Memantau kesehatan klaster cloud, throughput jaringan, dan telemetri node (DEMO).',
    thoughtText: 'Memeriksa grafik uptime 99.98% pada Operations Status Wall Board.',
    durationSeconds: 5.0,
  },
  REVIEW_CICD_PIPELINE: {
    id: 'REVIEW_CICD_PIPELINE',
    buttonNumber: 6,
    labelId: 'Review Pipeline CI/CD',
    labelEn: 'Review CI/CD Pipeline',
    targetState: 'REVIEW_CICD_PIPELINE',
    clipName: 'Review_CICD_Pipeline',
    targetAnchorName: 'DEVOPS_DESK_WORK',
    posture: 'seated',
    defaultExpression: 'focused',
    handheldProp: 'none',
    runtimeIndicator: 'pipeline_stage_badge',
    bubbleText: 'Meninjau tahapan build, test gate, dan artifact signing pada pipeline CI/CD (DEMO).',
    thoughtText: 'Semua stage build -> test -> canary terverifikasi hijau di layar utama.',
    durationSeconds: 5.0,
  },
  DEPLOYMENT_PREPARATION: {
    id: 'DEPLOYMENT_PREPARATION',
    buttonNumber: 7,
    labelId: 'Persiapan Deployment',
    labelEn: 'Deployment Preparation',
    targetState: 'DEPLOYMENT_PREPARATION',
    clipName: 'Deployment_Preparation',
    targetAnchorName: 'DEVOPS_INFRASTRUCTURE_REVIEW',
    posture: 'standing',
    defaultExpression: 'focused',
    handheldProp: 'technical_clipboard',
    runtimeIndicator: 'pipeline_stage_badge',
    bubbleText: 'Memeriksa daftar periksa pra-rilis, snapshot cadangan, dan rencana rollback (DEMO).',
    thoughtText: 'Verifikasi pre-flight checklist sebelum memulai simulasi deployment.',
    durationSeconds: 4.5,
  },
  DEPLOY_SERVICE_DEMO: {
    id: 'DEPLOY_SERVICE_DEMO',
    buttonNumber: 8,
    labelId: 'Deploy Layanan (Demo)',
    labelEn: 'Deploy Service (Demo)',
    targetState: 'DEPLOYING_SERVICE_DEMO',
    clipName: 'Deploy_Demo',
    targetAnchorName: 'DEVOPS_WORKSTATION_APPROACH',
    posture: 'standing',
    defaultExpression: 'confident',
    handheldProp: 'tablet',
    runtimeIndicator: 'deploy_cloud_upload',
    bubbleText: 'Menjalankan rollout layanan ke klaster cloud dengan indikator upload aktif (SIMULASI / DEMO).',
    thoughtText: 'Simulasi canary rollout berjalan mulus menuju 100% traffic.',
    durationSeconds: 5.0,
  },
  INSPECT_SERVER_RACK: {
    id: 'INSPECT_SERVER_RACK',
    buttonNumber: 9,
    labelId: 'Inspeksi Rak Server',
    labelEn: 'Inspect Server Rack',
    targetState: 'INSPECTING_SERVER_RACK',
    clipName: 'Inspect_Server_Rack',
    targetAnchorName: 'DEVOPS_RACK_INSPECTION',
    posture: 'standing',
    defaultExpression: 'focused',
    handheldProp: 'diagnostic_device',
    runtimeIndicator: 'monitoring_pulse',
    bubbleText: 'Menginspeksi kedua kabinet rak infrastruktur, suhu blade, dan indikator LED (DEMO).',
    thoughtText: 'Memastikan aliran udara dan status power supply pada Rack A & Rack B stabil.',
    durationSeconds: 5.0,
  },
  SERVICE_HEALTH_REVIEW: {
    id: 'SERVICE_HEALTH_REVIEW',
    buttonNumber: 10,
    labelId: 'Review Kesehatan Layanan',
    labelEn: 'Service Health Review',
    targetState: 'SERVICE_HEALTH_REVIEW',
    clipName: 'Service_Health_Review',
    targetAnchorName: 'DEVOPS_MONITORING_DISPLAY',
    posture: 'standing',
    defaultExpression: 'neutral',
    handheldProp: 'technical_clipboard',
    runtimeIndicator: 'cloud_status_ok',
    bubbleText: 'Mengevaluasi SLA layanan mikro, detak jantung endpoint, dan status kuota API (DEMO).',
    thoughtText: 'Seluruh endpoint utama merespons di bawah ambang batas 85ms.',
    durationSeconds: 4.5,
  },
  INCIDENT_ALERT_REACTION: {
    id: 'INCIDENT_ALERT_REACTION',
    buttonNumber: 11,
    labelId: 'Reaksi Incident Alert',
    labelEn: 'Incident Alert Reaction',
    targetState: 'INCIDENT_ALERT_REACTION',
    clipName: 'Incident_Alert_Reaction',
    targetAnchorName: 'DEVOPS_RACK_INSPECTION',
    posture: 'standing',
    defaultExpression: 'alert',
    handheldProp: 'tablet',
    runtimeIndicator: 'incident_alert_triangle',
    bubbleText: 'Mendeteksi lonjakan latensi pada node worker! Mengaktifkan prosedur triase cepat (SIMULASI).',
    thoughtText: 'Peringatan lonjakan antrean terdeteksi; segera isolasi worker yang melambat.',
    durationSeconds: 4.5,
  },
  TROUBLESHOOT_INCIDENT: {
    id: 'TROUBLESHOOT_INCIDENT',
    buttonNumber: 12,
    labelId: 'Troubleshooting Incident',
    labelEn: 'Troubleshoot Incident',
    targetState: 'TROUBLESHOOTING_INCIDENT',
    clipName: 'Troubleshoot_Incident',
    targetAnchorName: 'DEVOPS_RACK_INSPECTION',
    posture: 'standing',
    defaultExpression: 'concerned',
    handheldProp: 'devops_laptop',
    runtimeIndicator: 'incident_alert_triangle',
    bubbleText: 'Mendiagnosis bottleneck koneksi dan menyeimbangkan ulang beban replica di dekat rak (DEMO).',
    thoughtText: 'Menjalankan pengalihan rute otomatis dan memulihkan koneksi worker pool.',
    durationSeconds: 5.5,
  },
  REVIEW_LOGS: {
    id: 'REVIEW_LOGS',
    buttonNumber: 13,
    labelId: 'Review Log Sistem',
    labelEn: 'Review System Logs',
    targetState: 'REVIEWING_LOGS',
    clipName: 'Review_Logs',
    targetAnchorName: 'DEVOPS_DESK_WORK',
    posture: 'seated',
    defaultExpression: 'focused',
    handheldProp: 'none',
    runtimeIndicator: 'none',
    bubbleText: 'Menelusuri jejak log terdistribusi dan trace ID pada monitor sekunder DevOps (DEMO).',
    thoughtText: 'Memverifikasi tidak ada error berulang setelah penyesuaian konfigurasi.',
    durationSeconds: 4.5,
  },
  ANALYZE_METRICS: {
    id: 'ANALYZE_METRICS',
    buttonNumber: 14,
    labelId: 'Analisis Metrik & Performa',
    labelEn: 'Analyze Metrics & Performance',
    targetState: 'ANALYZING_METRICS',
    clipName: 'Analyze_Metrics',
    targetAnchorName: 'DEVOPS_MONITORING_DISPLAY',
    posture: 'standing',
    defaultExpression: 'curious',
    handheldProp: 'tablet',
    runtimeIndicator: 'monitoring_pulse',
    bubbleText: 'Menganalisis grafik utilisasi CPU/VRAM, laju request, dan efisiensi cache (DEMO).',
    thoughtText: 'Kurva latensi p99 turun 18% setelah optimasi konkurensi.',
    durationSeconds: 4.5,
  },
  AI_ENGINE_STATUS_REVIEW: {
    id: 'AI_ENGINE_STATUS_REVIEW',
    buttonNumber: 15,
    labelId: 'Review Status AI Engine',
    labelEn: 'Review AI Engine Status',
    targetState: 'AI_ENGINE_STATUS_REVIEW',
    clipName: 'AI_Engine_Status_Review',
    targetAnchorName: 'DEVOPS_MONITORING_DISPLAY',
    posture: 'standing',
    defaultExpression: 'focused',
    handheldProp: 'diagnostic_device',
    runtimeIndicator: 'cloud_status_ok',
    bubbleText: 'Memeriksa kesiapan model AI Engine, throughput token, dan kesehatan antrean inferensi (DEMO).',
    thoughtText: 'Semua gateway inferensi AI beroperasi pada kapasitas optimal.',
    durationSeconds: 5.0,
  },
  RESOURCE_HEALTH_CHECK: {
    id: 'RESOURCE_HEALTH_CHECK',
    buttonNumber: 16,
    labelId: 'Cek Kesehatan Resource',
    labelEn: 'Resource Health Check',
    targetState: 'RESOURCE_HEALTH_CHECK',
    clipName: 'Resource_Health_Check',
    targetAnchorName: 'DEVOPS_RACK_INSPECTION',
    posture: 'standing',
    defaultExpression: 'focused',
    handheldProp: 'technical_clipboard',
    runtimeIndicator: 'cloud_status_ok',
    bubbleText: 'Memvalidasi alokasi memori, ruang penyimpanan IOPS, dan kuota kontainer (DEMO).',
    thoughtText: 'Headroom kapasitas server masih 42% di atas batas aman.',
    durationSeconds: 4.5,
  },
  ENGINE_SWITCH_REVIEW: {
    id: 'ENGINE_SWITCH_REVIEW',
    buttonNumber: 17,
    labelId: 'Review Engine Switch / Fallback',
    labelEn: 'Review Engine Switch / Fallback',
    targetState: 'ENGINE_SWITCH_REVIEW',
    clipName: 'Engine_Switch_Review',
    targetAnchorName: 'DEVOPS_DESK_WORK',
    posture: 'seated',
    defaultExpression: 'thinking',
    handheldProp: 'none',
    runtimeIndicator: 'pipeline_stage_badge',
    bubbleText: 'Meninjau kebijakan routing multi-engine dan simulasi failover tanpa downtime (DEMO).',
    thoughtText: 'Aturan circuit-breaker siap mengalihkan trafik ke engine cadangan secara otomatis.',
    durationSeconds: 5.0,
  },
  READ_RUNBOOK: {
    id: 'READ_RUNBOOK',
    buttonNumber: 18,
    labelId: 'Baca Runbook / Dokumentasi Teknis',
    labelEn: 'Read Runbook / Tech Docs',
    targetState: 'READING_RUNBOOK',
    clipName: 'Read_Runbook',
    targetAnchorName: 'DEVOPS_INFRASTRUCTURE_REVIEW',
    posture: 'standing',
    defaultExpression: 'focused',
    handheldProp: 'runbook',
    runtimeIndicator: 'none',
    bubbleText: 'Membaca runbook pemulihan bencana dan standar operasional SRE (SIMULASI / DEMO).',
    thoughtText: 'Memastikan prosedur eskalasi dan langkah verifikasi terdokumentasi rapi.',
    durationSeconds: 4.5,
  },
  RELEASE_READINESS_DISCUSSION: {
    id: 'RELEASE_READINESS_DISCUSSION',
    buttonNumber: 19,
    labelId: 'Diskusi Kesiapan Rilis (QA & DevOps)',
    labelEn: 'Release Readiness Discussion',
    targetState: 'RELEASE_READINESS_DISCUSSION',
    clipName: 'Release_Readiness_Discussion',
    targetAnchorName: 'QA_DEVOPS_REVIEW_BOARD',
    posture: 'standing',
    defaultExpression: 'talking',
    handheldProp: 'technical_clipboard',
    runtimeIndicator: 'pipeline_stage_badge',
    bubbleText: 'Berdiskusi di depan Shared Release Readiness Board untuk menyelaraskan sign-off QA & DevOps (DEMO).',
    thoughtText: 'Quality gate QA lulus dan pipeline produksi DevOps siap dijalankan.',
    durationSeconds: 5.0,
  },
  PRESENT_OPERATIONS_STATUS: {
    id: 'PRESENT_OPERATIONS_STATUS',
    buttonNumber: 20,
    labelId: 'Presentasi Status Operasi',
    labelEn: 'Present Operations Status',
    targetState: 'PRESENTING_OPERATIONS_STATUS',
    clipName: 'Present_Operations_Status',
    targetAnchorName: 'QA_DEVOPS_PRESENTATION_POSITION',
    posture: 'standing',
    defaultExpression: 'confident',
    handheldProp: 'tablet',
    runtimeIndicator: 'cloud_status_ok',
    bubbleText: 'Mempresentasikan ringkasan reliabilitas layanan, metrik SLA, dan jadwal rilis (SIMULASI).',
    thoughtText: 'Menyajikan laporan kesiapan infrastruktur secara jelas kepada tim.',
    durationSeconds: 5.0,
  },
  PHONE_CALL: {
    id: 'PHONE_CALL',
    buttonNumber: 21,
    labelId: 'Panggilan Koordinasi',
    labelEn: 'Coordination Phone Call',
    targetState: 'PHONE_CALL',
    clipName: 'Phone_Call',
    targetAnchorName: 'DEVOPS_WORKSTATION_APPROACH',
    posture: 'standing',
    defaultExpression: 'talking',
    handheldProp: 'smartphone',
    runtimeIndicator: 'none',
    bubbleText: 'Melakukan panggilan koordinasi rilis dengan Backend Developer dan Boss PM (DEMO).',
    thoughtText: 'Mengonfirmasi jendela maintenance dan sinkronisasi skema database.',
    durationSeconds: 4.5,
  },
  THINK_INVESTIGATE: {
    id: 'THINK_INVESTIGATE',
    buttonNumber: 22,
    labelId: 'Berpikir / Investigasi',
    labelEn: 'Think / Investigate',
    targetState: 'THINKING_INVESTIGATING',
    clipName: 'Think_Investigate',
    targetAnchorName: 'DEVOPS_INFRASTRUCTURE_REVIEW',
    posture: 'standing',
    defaultExpression: 'thinking',
    handheldProp: 'none',
    runtimeIndicator: 'none',
    bubbleText: 'Menganalisis arsitektur caching dan merancang strategi peningkatan reliabilitas (DEMO).',
    thoughtText: 'Menimbang distribusi beban multi-zona agar latensi makin merata.',
    durationSeconds: 4.5,
  },
  COFFEE_BREAK: {
    id: 'COFFEE_BREAK',
    buttonNumber: 23,
    labelId: 'Istirahat Kopi',
    labelEn: 'Coffee Break',
    targetState: 'COFFEE_BREAK',
    clipName: 'Coffee_Break',
    targetAnchorName: 'QA_DEVOPS_COFFEE_TABLE',
    posture: 'standing',
    defaultExpression: 'happy',
    handheldProp: 'coffee_cup',
    runtimeIndicator: 'none',
    bubbleText: 'Menikmati kopi hangat di lounge kolaborasi sambil memantau notifikasi ringan (DEMO).',
    thoughtText: 'Rehat sejenak menjaga fokus selama jaga operasional.',
    durationSeconds: 4.5,
  },
  WAITING_APPROVAL: {
    id: 'WAITING_APPROVAL',
    buttonNumber: 24,
    labelId: 'Menunggu Approval Rilis',
    labelEn: 'Waiting Release Approval',
    targetState: 'WAITING_RELEASE_APPROVAL',
    clipName: 'Waiting_Approval',
    targetAnchorName: 'QA_DEVOPS_REVIEW_BOARD',
    posture: 'standing',
    defaultExpression: 'neutral',
    handheldProp: 'technical_clipboard',
    runtimeIndicator: 'pipeline_stage_badge',
    bubbleText: 'Menunggu persetujuan akhir rilis produksi pada papan kesiapan rilis (SIMULASI / DEMO).',
    thoughtText: 'Seluruh artefak build dan health check sudah siap untuk sign-off.',
    durationSeconds: 5.0,
  },
  TASK_COMPLETED: {
    id: 'TASK_COMPLETED',
    buttonNumber: 25,
    labelId: 'Tugas Selesai / Sistem Stabil',
    labelEn: 'Task Completed / System Stable',
    targetState: 'TASK_COMPLETED',
    clipName: 'Task_Completed',
    targetAnchorName: 'DEVOPS_WORKSTATION_APPROACH',
    posture: 'standing',
    defaultExpression: 'happy',
    handheldProp: 'tablet',
    runtimeIndicator: 'completed_check',
    bubbleText: 'Deployment selesai dan seluruh layanan maupun AI Engine berstatus STABIL HIJAU! (DEMO)',
    thoughtText: 'Zero-downtime rollout berhasil diverifikasi pada semua metrik utama.',
    durationSeconds: 4.5,
  },
};

export const DEVOPS_ACTION_LIST: DevOpsActionContract[] = Object.values(DEVOPS_ACTIONS).sort(
  (a, b) => a.buttonNumber - b.buttonNumber
);

export interface DevOpsAutoDemoStep {
  stepNumber: number;
  actionId: DevOpsActionId;
  durationSeconds: number;
  description: string;
}

/**
 * 18-Step Automatic DevOps & AI Engine Operations Workflow Demo
 * (`Jalankan Demo DevOps Otomatis`)
 */
export const DEVOPS_AUTO_DEMO_SEQUENCE: DevOpsAutoDemoStep[] = [
  {
    stepNumber: 1,
    actionId: 'IDLE',
    durationSeconds: 2.6,
    description: 'Idle siaga di area pendekatan workstation DevOps',
  },
  {
    stepNumber: 2,
    actionId: 'WORK_DESK',
    durationSeconds: 4.2,
    description: 'Duduk di meja DevOps & mengetik konfigurasi konsol',
  },
  {
    stepNumber: 3,
    actionId: 'REVIEW_CICD_PIPELINE',
    durationSeconds: 4.0,
    description: 'Meninjau status tahapan pipeline CI/CD pada layar utama',
  },
  {
    stepNumber: 4,
    actionId: 'REVIEW_LOGS',
    durationSeconds: 3.8,
    description: 'Memeriksa log sistem dan trace layanan pada monitor sekunder',
  },
  {
    stepNumber: 5,
    actionId: 'MONITOR_INFRASTRUCTURE',
    durationSeconds: 4.2,
    description: 'Berjalan ke Operations Status Wall Board & memonitor infrastruktur',
  },
  {
    stepNumber: 6,
    actionId: 'ANALYZE_METRICS',
    durationSeconds: 3.8,
    description: 'Menganalisis metrik performa, latensi, dan utilisasi node',
  },
  {
    stepNumber: 7,
    actionId: 'AI_ENGINE_STATUS_REVIEW',
    durationSeconds: 4.0,
    description: 'Memeriksa kesiapan AI Engine & throughput inferensi',
  },
  {
    stepNumber: 8,
    actionId: 'INSPECT_SERVER_RACK',
    durationSeconds: 4.2,
    description: 'Berjalan ke rak server & menginspeksi kedua kabinet infrastruktur',
  },
  {
    stepNumber: 9,
    actionId: 'RESOURCE_HEALTH_CHECK',
    durationSeconds: 3.8,
    description: 'Mengecek kesehatan resource CPU, memori, dan storage',
  },
  {
    stepNumber: 10,
    actionId: 'INCIDENT_ALERT_REACTION',
    durationSeconds: 3.6,
    description: 'Merespons simulasi Incident Alert pada klaster worker',
  },
  {
    stepNumber: 11,
    actionId: 'TROUBLESHOOT_INCIDENT',
    durationSeconds: 4.4,
    description: 'Melakukan troubleshooting & penyeimbangan ulang beban di dekat rak',
  },
  {
    stepNumber: 12,
    actionId: 'READ_RUNBOOK',
    durationSeconds: 3.8,
    description: 'Membaca runbook operasional di area penyimpanan teknis',
  },
  {
    stepNumber: 13,
    actionId: 'DEPLOYMENT_PREPARATION',
    durationSeconds: 3.8,
    description: 'Menyiapkan checklist pra-deployment dan rencana rollback',
  },
  {
    stepNumber: 14,
    actionId: 'DEPLOY_SERVICE_DEMO',
    durationSeconds: 4.4,
    description: 'Menjalankan simulasi Deploy Layanan dengan indikator Cloud Upload',
  },
  {
    stepNumber: 15,
    actionId: 'RELEASE_READINESS_DISCUSSION',
    durationSeconds: 4.2,
    description: 'Berdiskusi kesiapan rilis di depan Shared Release Readiness Board',
  },
  {
    stepNumber: 16,
    actionId: 'PRESENT_OPERATIONS_STATUS',
    durationSeconds: 4.2,
    description: 'Mempresentasikan status operasi & reliabilitas sistem',
  },
  {
    stepNumber: 17,
    actionId: 'WAITING_APPROVAL',
    durationSeconds: 3.8,
    description: 'Menunggu approval sign-off rilis produksi',
  },
  {
    stepNumber: 18,
    actionId: 'TASK_COMPLETED',
    durationSeconds: 4.2,
    description: 'Tugas selesai & seluruh layanan berstatus stabil hijau',
  },
];

/**
 * South DevOps Zone + Shared Release Lounge patrol ring.
 * Never enters `QA_DESK_WORK` or `QA_CHAIR` in the North QA Zone.
 */
export const DEVOPS_PATROL_ANCHOR_RING: QADevOpsAnchorId[] = [
  'DEVOPS_WORKSTATION_APPROACH',
  'DEVOPS_MONITORING_DISPLAY',
  'DEVOPS_RACK_INSPECTION',
  'DEVOPS_INFRASTRUCTURE_REVIEW',
  'QA_DEVOPS_REVIEW_BOARD',
  'QA_DEVOPS_DISCUSSION_POSITION',
];

export interface DevOpsWalkWaypoint {
  id: string;
  position: [number, number, number];
  connectedTo: string[];
}

/**
 * Walkable waypoint graph inside Module 06 (South DevOps Zone Z=0..5.4 & Shared Lounge Z=5.4..10.6)
 * avoiding the DevOps desk (`[2.45, 0, 2.75]`), dual racks (`[7.15, 0, 3.10]`),
 * technical storage (`[0.54, 0, 2.65]`), and lounge furniture (`[5.20, 0, 7.85]`).
 */
export const DEVOPS_WALK_WAYPOINTS: Record<string, DevOpsWalkWaypoint> = {
  WP_DEVOPS_APPROACH: {
    id: 'WP_DEVOPS_APPROACH',
    position: [4.25, 0, 1.85],
    connectedTo: ['WP_DEVOPS_CHAIR', 'WP_DEVOPS_BOARD', 'WP_DEVOPS_RACK', 'WP_SOUTH_SPINE'],
  },
  WP_DEVOPS_CHAIR: {
    id: 'WP_DEVOPS_CHAIR',
    position: [2.45, 0, 1.95],
    connectedTo: ['WP_DEVOPS_APPROACH', 'WP_DEVOPS_STORAGE'],
  },
  WP_DEVOPS_BOARD: {
    id: 'WP_DEVOPS_BOARD',
    position: [5.65, 0, 1.45],
    connectedTo: ['WP_DEVOPS_APPROACH', 'WP_DEVOPS_RACK'],
  },
  WP_DEVOPS_RACK: {
    id: 'WP_DEVOPS_RACK',
    position: [5.85, 0, 3.1],
    connectedTo: ['WP_DEVOPS_BOARD', 'WP_DEVOPS_APPROACH', 'WP_SOUTH_SPINE'],
  },
  WP_DEVOPS_STORAGE: {
    id: 'WP_DEVOPS_STORAGE',
    position: [1.55, 0, 3.85],
    connectedTo: ['WP_DEVOPS_CHAIR', 'WP_SOUTH_SPINE', 'WP_SHARED_BOARD'],
  },
  WP_SOUTH_SPINE: {
    id: 'WP_SOUTH_SPINE',
    position: [3.85, 0, 4.35],
    connectedTo: [
      'WP_DEVOPS_APPROACH',
      'WP_DEVOPS_RACK',
      'WP_DEVOPS_STORAGE',
      'WP_SHARED_BOARD',
      'WP_LOUNGE_CORRIDOR',
    ],
  },
  WP_SHARED_BOARD: {
    id: 'WP_SHARED_BOARD',
    position: [2.15, 0, 5.95],
    connectedTo: ['WP_DEVOPS_STORAGE', 'WP_SOUTH_SPINE', 'WP_LOUNGE_CORRIDOR', 'WP_WEST_DOOR'],
  },
  WP_LOUNGE_CORRIDOR: {
    id: 'WP_LOUNGE_CORRIDOR',
    position: [3.15, 0, 7.85],
    connectedTo: ['WP_SOUTH_SPINE', 'WP_SHARED_BOARD', 'WP_LOUNGE_DISCUSS', 'WP_WEST_DOOR'],
  },
  WP_LOUNGE_DISCUSS: {
    id: 'WP_LOUNGE_DISCUSS',
    position: [2.85, 0, 8.65],
    connectedTo: ['WP_LOUNGE_CORRIDOR', 'WP_WEST_DOOR'],
  },
  WP_WEST_DOOR: {
    id: 'WP_WEST_DOOR',
    position: [1.15, 0, 8.0],
    connectedTo: ['WP_SHARED_BOARD', 'WP_LOUNGE_CORRIDOR', 'WP_LOUNGE_DISCUSS'],
  },
};

function dist2D(a: [number, number, number], b: [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[2] - b[2]);
}

function nearestWaypointId(pos: [number, number, number]): string {
  let bestId = 'WP_DEVOPS_APPROACH';
  let bestDist = Infinity;
  for (const wp of Object.values(DEVOPS_WALK_WAYPOINTS)) {
    const d = dist2D(pos, wp.position);
    if (d < bestDist) {
      bestDist = d;
      bestId = wp.id;
    }
  }
  return bestId;
}

/**
 * Computes a collision-free waypoint path inside the South DevOps Zone & Shared Lounge.
 */
export function findDevOpsWalkablePath(
  startPos: [number, number, number],
  endPos: [number, number, number]
): Array<[number, number, number]> {
  if (dist2D(startPos, endPos) <= 0.45) {
    return [[endPos[0], 0, endPos[2]]];
  }

  const startWp = nearestWaypointId(startPos);
  const endWp = nearestWaypointId(endPos);

  if (startWp === endWp) {
    return [[endPos[0], 0, endPos[2]]];
  }

  const queue: string[][] = [[startWp]];
  const visited = new Set<string>([startWp]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    if (last === endWp) {
      const pts = path.map((id) => DEVOPS_WALK_WAYPOINTS[id].position);
      pts.push([endPos[0], 0, endPos[2]]);
      return pts;
    }
    const node = DEVOPS_WALK_WAYPOINTS[last];
    if (!node) continue;
    for (const nextId of node.connectedTo) {
      if (!visited.has(nextId)) {
        visited.add(nextId);
        queue.push([...path, nextId]);
      }
    }
  }

  return [[endPos[0], 0, endPos[2]]];
}

export function getDevOpsAnchorById(anchorId: QADevOpsAnchorId): QADevOpsActivityAnchor {
  return (
    DEFAULT_QA_DEVOPS_ANCHORS[anchorId] ||
    DEFAULT_QA_DEVOPS_ANCHORS.DEVOPS_WORKSTATION_APPROACH
  );
}

export interface DevOpsSimulationRuntimeStatus {
  characterId: string;
  displayName: string;
  currentState: DevOpsAgentState;
  currentActionId: DevOpsActionId;
  currentActionLabel: string;
  activeClipName: DevOpsAnimationClipName;
  currentAnchorId: QADevOpsAnchorId;
  targetAnchorId: QADevOpsAnchorId;
  currentExpression: DevOpsExpressionId;
  posture: 'standing' | 'seated';
  handheldProp: DevOpsPropId;
  runtimeIndicator: DevOpsRuntimeIndicatorId;
  isWalking: boolean;
  isPaused: boolean;
  patrolActive: boolean;
  autoDemoActive: boolean;
  autoDemoStepIndex: number;
  autoDemoTotalSteps: number;
  speedMultiplier: DevOpsSpeedMultiplier;
  headphonesVisible: boolean;
  glassesVisible: boolean;
  backpackVisible: boolean;
  backpackAutoHiddenForSeat: boolean;
  bubbleText: string;
  thoughtText: string;
  worldPosition: [number, number, number];
  facingRad: number;
}

export interface DevOpsCharacterManifestV1 {
  schema_version: '1.0';
  asset_name: string;
  asset_id: string;
  character_id: string;
  display_name: string;
  role_title: string;
  department: string;
  compatible_room_id: string;
  glb_filename: string;
  format: 'glTF 2.0 binary (.glb)';
  coordinate_system: {
    up_axis: '+Y';
    forward_axis: '+Z';
    units: 'meters';
    local_origin: [number, number, number];
  };
  dimensions: {
    standing_height_m: number;
    width_m: number;
    depth_m: number;
  };
  visual_identity: {
    skin_tone: string;
    hair_style: string;
    hair_subgroups: readonly string[];
    hair_palette_hex: string[];
    outfit_summary: string;
    default_neck_headphones: boolean;
    default_eyeglasses: boolean;
    backpack_cloud_emblem: boolean;
  };
  hierarchy: {
    root_node: string;
    required_bones: string[];
    required_accessories: string[];
    required_props: string[];
  };
  embedded_animations: {
    count: number;
    clip_names: DevOpsAnimationClipName[];
  };
  stats: {
    mesh_count: number;
    material_count: number;
    triangle_count: number;
    file_size_bytes: number;
  };
  export_timestamp: string;
  validation_status: 'PASS' | 'FAIL';
}

export interface DevOpsCharacterBehaviorJsonV1 {
  schema_version: '1.0';
  character_id: string;
  display_name: string;
  compatible_room_id: string;
  default_spawn_anchor: QADevOpsAnchorId;
  primary_work_anchor: QADevOpsAnchorId;
  seated_chair_anchor: QADevOpsAnchorId;
  simulation_notice: string;
  states: DevOpsAgentState[];
  actions: Array<{
    action_id: DevOpsActionId;
    button_number: number;
    label_id: string;
    label_en: string;
    target_state: DevOpsAgentState;
    clip_name: DevOpsAnimationClipName;
    target_anchor: QADevOpsAnchorId;
    posture: 'standing' | 'seated';
    expression: DevOpsExpressionId;
    handheld_prop: DevOpsPropId;
    runtime_indicator: DevOpsRuntimeIndicatorId;
  }>;
  expressions: DevOpsExpressionId[];
  auto_demo_sequence: DevOpsAutoDemoStep[];
  patrol_anchor_ring: QADevOpsAnchorId[];
}

export function buildDevOpsCharacterBehaviorJson(): DevOpsCharacterBehaviorJsonV1 {
  return {
    schema_version: '1.0',
    character_id: DEVOPS_CHARACTER_CONSTANTS.CHARACTER_ID,
    display_name: DEVOPS_CHARACTER_CONSTANTS.DISPLAY_NAME,
    compatible_room_id: DEVOPS_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    default_spawn_anchor: DEVOPS_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR,
    primary_work_anchor: DEVOPS_CHARACTER_CONSTANTS.PRIMARY_WORK_ANCHOR,
    seated_chair_anchor: DEVOPS_CHARACTER_CONSTANTS.SEATED_CHAIR_ANCHOR,
    simulation_notice:
      'SIMULASI / DEMO — Seluruh aksi deployment, pipeline CI/CD, monitoring, incident response, dan AI engine switch bersifat simulasi visual.',
    states: [
      'IDLE',
      'WALKING',
      'SITTING_WORK_DESK',
      'TYPING_DEVOPS_CONSOLE',
      'TECHNICAL_TALK',
      'MONITOR_INFRASTRUCTURE',
      'REVIEW_CICD_PIPELINE',
      'DEPLOYMENT_PREPARATION',
      'DEPLOYING_SERVICE_DEMO',
      'INSPECTING_SERVER_RACK',
      'SERVICE_HEALTH_REVIEW',
      'INCIDENT_ALERT_REACTION',
      'TROUBLESHOOTING_INCIDENT',
      'REVIEWING_LOGS',
      'ANALYZING_METRICS',
      'AI_ENGINE_STATUS_REVIEW',
      'RESOURCE_HEALTH_CHECK',
      'ENGINE_SWITCH_REVIEW',
      'READING_RUNBOOK',
      'RELEASE_READINESS_DISCUSSION',
      'PRESENTING_OPERATIONS_STATUS',
      'PHONE_CALL',
      'THINKING_INVESTIGATING',
      'COFFEE_BREAK',
      'WAITING_RELEASE_APPROVAL',
      'TASK_COMPLETED',
    ],
    actions: DEVOPS_ACTION_LIST.map((a) => ({
      action_id: a.id,
      button_number: a.buttonNumber,
      label_id: a.labelId,
      label_en: a.labelEn,
      target_state: a.targetState,
      clip_name: a.clipName,
      target_anchor: a.targetAnchorName,
      posture: a.posture,
      expression: a.defaultExpression,
      handheld_prop: a.handheldProp,
      runtime_indicator: a.runtimeIndicator,
    })),
    expressions: Object.keys(DEVOPS_EXPRESSION_PRESETS) as DevOpsExpressionId[],
    auto_demo_sequence: DEVOPS_AUTO_DEMO_SEQUENCE,
    patrol_anchor_ring: DEVOPS_PATROL_ANCHOR_RING,
  };
}
