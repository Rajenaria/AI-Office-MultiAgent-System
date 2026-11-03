import {
  DEFAULT_QA_DEVOPS_ANCHORS,
  QA_DEVOPS_MODULE_CONSTANTS,
  QADevOpsAnchorId,
} from './qaDevopsRoomSpec';

/**
 * ============================================================================
 * AI OFFICE — QA ENGINEER CHARACTER PRODUCTION V1 (AGENT 08)
 * Official Character ID: `qa_engineer_agent`
 * Official Asset ID: `ai_office.character.qa_engineer_agent.v1`
 * Compatible Room: `AI_OFFICE_ROOM_QA_DEVOPS_v1` (8×16 Integrated QA & DevOps Studio)
 * ============================================================================
 */

export const QA_CHARACTER_CONSTANTS = {
  CHARACTER_ID: 'qa_engineer_agent',
  ASSET_ID: 'ai_office.character.qa_engineer_agent.v1',
  DISPLAY_NAME: 'QA Engineer',
  FULL_ROLE_TITLE: 'Quality Assurance & Review Specialist',
  ROLE_TYPE: 'QUALITY_ASSURANCE_ENGINEER',
  DEPARTMENT: 'QA & Review',
  COMPATIBLE_ROOM_ID: QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID,
  ROOT_NODE_NAME: 'QA_Engineer_Agent_Root',
  RUNTIME_ROOT_NAME: 'QA_ENGINEER_AGENT_RUNTIME_ROOT',
  GLB_FILENAME: 'qa_engineer_agent.glb',
  MANIFEST_FILENAME: 'qa_engineer_agent.manifest.json',
  BEHAVIOR_FILENAME: 'qa_engineer_agent.behavior.json',
  PREVIEW_FILENAME: 'qa_engineer_agent_preview.png',
  README_FILENAME: 'README.md',
  PACK_ZIP_FILENAME: 'qa_engineer_agent_pack_v1.zip',
  TARGET_HEIGHT_M: 1.735,
  STANDING_HIPS_Y: 0.9,
  SEATED_HIPS_Y: 0.725,
  SEATED_HIP_DROP_Y: 0.175,
  WALK_SPEED_MPS: 1.88,
  ARRIVAL_THRESHOLD_M: 0.08,
  ROTATION_LERP_SPEED: 10.5,
  DEFAULT_SPAWN_ANCHOR: 'QA_WORKSTATION_APPROACH' as QADevOpsAnchorId,
  DEFAULT_IDLE_ANCHOR: 'QA_WORKSTATION_APPROACH' as QADevOpsAnchorId,
  DEFAULT_WORK_ANCHOR: 'QA_DESK_WORK' as QADevOpsAnchorId,
} as const;

export const QA_HAIR_SUBGROUPS = [
  'Hair_Base',
  'Hair_Crown',
  'Hair_Fringe',
  'Hair_High_Bun',
  'Hair_Left_Side',
  'Hair_Right_Side',
  'Hair_Back_Layers',
  'Hair_Clip_Gold',
] as const;

export type QAHairSubgroupName = (typeof QA_HAIR_SUBGROUPS)[number];

export interface QAHairMaterialPaletteItem {
  id: string;
  role: string;
  hex: string;
  roughness: number;
  metalness: number;
}

/**
 * 5-Tone Matte Chestnut / Chocolate / Warm Reddish-Brown Hair Palette + Gold Hair Clip Palette
 * Matches Voxel QA Engineer Character Sheet (`/public/assets/aistudio/Voxel_QA_Engineer_Character_Sheet_b4934958.png`)
 */
export const QA_HAIR_MATERIAL_PALETTE: readonly QAHairMaterialPaletteItem[] = [
  {
    id: 'qa_hair_dark_chestnut',
    role: 'Primary dark chestnut brown crown & side locks',
    hex: '#4A2B22',
    roughness: 0.88,
    metalness: 0.03,
  },
  {
    id: 'qa_hair_deep_chocolate_shadow',
    role: 'Deep chocolate brown recessed hair shadows & hair-tie base',
    hex: '#2E1913',
    roughness: 0.92,
    metalness: 0.02,
  },
  {
    id: 'qa_hair_warm_reddish_mid',
    role: 'Warm medium reddish-brown layered fringe & bun clusters',
    hex: '#5E362B',
    roughness: 0.86,
    metalness: 0.03,
  },
  {
    id: 'qa_hair_soft_caramel_highlight',
    role: 'Soft warm chestnut-caramel upper crown & bun highlights',
    hex: '#734436',
    roughness: 0.84,
    metalness: 0.04,
  },
  {
    id: 'qa_hair_auburn_accent',
    role: 'Subtle warm auburn-brown side & back layer depth',
    hex: '#532E25',
    roughness: 0.87,
    metalness: 0.03,
  },
  {
    id: 'qa_hair_clip_gold',
    role: 'Signature 3D square yellow/gold hair clip on left-front hair layer',
    hex: '#F5B82E',
    roughness: 0.36,
    metalness: 0.24,
  },
] as const;

export const QA_OUTFIT_PALETTE = {
  skinBase: '#F3C6A2',
  skinShadow: '#DFA882',
  cheekBlush: '#E9967A',
  eyeDark: '#161920',
  eyeHighlight: '#FFFFFF',
  eyebrowBrown: '#3A2018',
  mouthWarm: '#C67360',
  jacketCharcoal: '#1E222A',
  jacketDeepBlack: '#15181F',
  innerHoodieWhite: '#F4F1EA',
  innerCollarShadow: '#DFDBD2',
  qaGoldYellow: '#F5B82E',
  qaAmberAccent: '#D99B1E',
  trousersCharcoal: '#232730',
  trousersCuffDark: '#191C23',
  sneakerWhite: '#F3F4F6',
  sneakerSoleDark: '#1E232B',
  backpackBlack: '#1B1F27',
  backpackPocketSlate: '#282E3A',
  headsetBandBlack: '#1A1E26',
  headsetPadYellow: '#F5B82E',
  glassesFrameBlack: '#181B22',
  bugAlertRed: '#EF4444',
  passEmeraldGreen: '#10B981',
} as const;

export type QAAgentState =
  | 'IDLE'
  | 'MOVING'
  | 'WORKING'
  | 'RUNNING_TESTS_DEMO'
  | 'INSPECTING_RESULTS'
  | 'DEVICE_TESTING'
  | 'REPRODUCING_BUG_DEMO'
  | 'BUG_FOUND_DEMO'
  | 'REVIEWING_CHECKLIST'
  | 'WRITING_BUG_REPORT'
  | 'VERIFYING_FIX_DEMO'
  | 'REGRESSION_REVIEW'
  | 'QUALITY_GATE_REVIEW'
  | 'PRESENTING_FINDINGS'
  | 'DISCUSSING'
  | 'READING_SPECIFICATION'
  | 'INVESTIGATING'
  | 'ON_CALL'
  | 'COFFEE_BREAK'
  | 'WAITING_REVIEW'
  | 'TASK_COMPLETED_DEMO'
  | 'BLOCKED_DEMO';

export type QAActionId =
  | 'IDLE'
  | 'WALK_TO_ANCHOR'
  | 'WORK_TYPING'
  | 'RUN_TEST_SUITE_DEMO'
  | 'INSPECT_TEST_RESULTS'
  | 'DEVICE_INSPECT'
  | 'REPRODUCE_BUG'
  | 'BUG_FOUND_REACTION'
  | 'CHECKLIST_REVIEW'
  | 'WRITE_BUG_REPORT'
  | 'VERIFY_FIX_DEMO'
  | 'REGRESSION_REVIEW'
  | 'QUALITY_GATE_REVIEW'
  | 'PRESENT_QA_FINDINGS'
  | 'TECHNICAL_DISCUSSION'
  | 'READ_TEST_SPECIFICATION'
  | 'THINK_INVESTIGATE'
  | 'PHONE_CALL'
  | 'COFFEE_BREAK'
  | 'TASK_COMPLETED'
  | 'WAITING_REVIEW';

export type QAAnimationClipName =
  | 'Idle_Breathing'
  | 'Walk_Cycle'
  | 'Work_Typing'
  | 'Run_Test_Suite_Demo'
  | 'Inspect_Test_Results'
  | 'Device_Inspect'
  | 'Reproduce_Bug'
  | 'Bug_Found_Reaction'
  | 'Checklist_Review'
  | 'Write_Bug_Report'
  | 'Verify_Fix_Demo'
  | 'Regression_Review'
  | 'Quality_Gate_Review'
  | 'Present_QA_Findings'
  | 'Technical_Discussion'
  | 'Read_Test_Specification'
  | 'Think_Investigate'
  | 'Phone_Call'
  | 'Coffee_Break'
  | 'Task_Completed'
  | 'Waiting_Review'
  | 'Sit_Down'
  | 'Stand_Up';

export const QA_REQUIRED_ANIMATION_CLIPS: readonly QAAnimationClipName[] = [
  'Idle_Breathing',
  'Walk_Cycle',
  'Work_Typing',
  'Run_Test_Suite_Demo',
  'Inspect_Test_Results',
  'Device_Inspect',
  'Reproduce_Bug',
  'Bug_Found_Reaction',
  'Checklist_Review',
  'Write_Bug_Report',
  'Verify_Fix_Demo',
  'Regression_Review',
  'Quality_Gate_Review',
  'Present_QA_Findings',
  'Technical_Discussion',
  'Read_Test_Specification',
  'Think_Investigate',
  'Phone_Call',
  'Coffee_Break',
  'Task_Completed',
  'Waiting_Review',
  'Sit_Down',
  'Stand_Up',
] as const;

export type QAExpressionId =
  | 'neutral'
  | 'focused'
  | 'happy'
  | 'thinking'
  | 'talking'
  | 'surprised'
  | 'concerned'
  | 'frustrated_by_bug'
  | 'confident'
  | 'tired_waiting';

export interface QAExpressionPreset {
  id: QAExpressionId;
  label: string;
  labelId: string;
  eyeScaleY: number;
  pupilOffsetX: number;
  pupilOffsetY: number;
  leftBrowTiltRad: number;
  rightBrowTiltRad: number;
  browLiftY: number;
  mouthWidthScale: number;
  mouthHeightScale: number;
  mouthOffsetY: number;
  cheekOpacity: number;
}

export const QA_EXPRESSION_PRESETS: Record<QAExpressionId, QAExpressionPreset> = {
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    labelId: 'Netral / Tenang',
    eyeScaleY: 1.0,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    leftBrowTiltRad: 0.02,
    rightBrowTiltRad: -0.02,
    browLiftY: 0,
    mouthWidthScale: 1.0,
    mouthHeightScale: 1.0,
    mouthOffsetY: 0,
    cheekOpacity: 0.85,
  },
  focused: {
    id: 'focused',
    label: 'Focused Testing',
    labelId: 'Fokus Menguji',
    eyeScaleY: 0.88,
    pupilOffsetX: 0,
    pupilOffsetY: 0.002,
    leftBrowTiltRad: -0.1,
    rightBrowTiltRad: 0.1,
    browLiftY: -0.004,
    mouthWidthScale: 0.88,
    mouthHeightScale: 0.9,
    mouthOffsetY: 0,
    cheekOpacity: 0.75,
  },
  happy: {
    id: 'happy',
    label: 'Happy / Verified',
    labelId: 'Senang / Lulus Uji',
    eyeScaleY: 0.62,
    pupilOffsetX: 0,
    pupilOffsetY: 0.003,
    leftBrowTiltRad: 0.08,
    rightBrowTiltRad: -0.08,
    browLiftY: 0.006,
    mouthWidthScale: 1.32,
    mouthHeightScale: 1.35,
    mouthOffsetY: 0.003,
    cheekOpacity: 1.0,
  },
  thinking: {
    id: 'thinking',
    label: 'Thinking / Investigating',
    labelId: 'Berpikir / Investigasi',
    eyeScaleY: 0.94,
    pupilOffsetX: 0.006,
    pupilOffsetY: 0.005,
    leftBrowTiltRad: 0.16,
    rightBrowTiltRad: -0.05,
    browLiftY: 0.005,
    mouthWidthScale: 0.78,
    mouthHeightScale: 1.0,
    mouthOffsetY: -0.001,
    cheekOpacity: 0.8,
  },
  talking: {
    id: 'talking',
    label: 'Talking / Explaining',
    labelId: 'Berbicara / Menjelaskan',
    eyeScaleY: 1.02,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    leftBrowTiltRad: 0.06,
    rightBrowTiltRad: -0.06,
    browLiftY: 0.004,
    mouthWidthScale: 1.25,
    mouthHeightScale: 1.85,
    mouthOffsetY: -0.002,
    cheekOpacity: 0.9,
  },
  surprised: {
    id: 'surprised',
    label: 'Surprised / Bug Alert!',
    labelId: 'Terkejut / Bug Ditemukan!',
    eyeScaleY: 1.24,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    leftBrowTiltRad: 0.14,
    rightBrowTiltRad: -0.14,
    browLiftY: 0.011,
    mouthWidthScale: 0.92,
    mouthHeightScale: 2.0,
    mouthOffsetY: -0.003,
    cheekOpacity: 0.95,
  },
  concerned: {
    id: 'concerned',
    label: 'Concerned / Edge Case',
    labelId: 'Khawatir / Edge Case',
    eyeScaleY: 0.92,
    pupilOffsetX: -0.004,
    pupilOffsetY: -0.002,
    leftBrowTiltRad: 0.15,
    rightBrowTiltRad: -0.15,
    browLiftY: 0.003,
    mouthWidthScale: 0.86,
    mouthHeightScale: 0.85,
    mouthOffsetY: -0.003,
    cheekOpacity: 0.7,
  },
  frustrated_by_bug: {
    id: 'frustrated_by_bug',
    label: 'Frustrated by Bug',
    labelId: 'Kesal karena Bug',
    eyeScaleY: 0.82,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    leftBrowTiltRad: -0.22,
    rightBrowTiltRad: 0.22,
    browLiftY: -0.006,
    mouthWidthScale: 1.08,
    mouthHeightScale: 1.15,
    mouthOffsetY: -0.004,
    cheekOpacity: 0.95,
  },
  confident: {
    id: 'confident',
    label: 'Confident / Approved',
    labelId: 'Percaya Diri / Siap Rilis',
    eyeScaleY: 0.9,
    pupilOffsetX: 0,
    pupilOffsetY: 0.002,
    leftBrowTiltRad: 0.07,
    rightBrowTiltRad: -0.1,
    browLiftY: 0.004,
    mouthWidthScale: 1.22,
    mouthHeightScale: 1.15,
    mouthOffsetY: 0.002,
    cheekOpacity: 0.9,
  },
  tired_waiting: {
    id: 'tired_waiting',
    label: 'Tired / Waiting Review',
    labelId: 'Lelah / Menunggu Review',
    eyeScaleY: 0.52,
    pupilOffsetX: 0,
    pupilOffsetY: -0.003,
    leftBrowTiltRad: 0.05,
    rightBrowTiltRad: -0.05,
    browLiftY: -0.003,
    mouthWidthScale: 0.76,
    mouthHeightScale: 0.82,
    mouthOffsetY: -0.002,
    cheekOpacity: 0.65,
  },
};

export type QAPropId =
  | 'none'
  | 'qa_laptop'
  | 'magnifying_glass'
  | 'checklist_clipboard'
  | 'bug_report_tablet'
  | 'smartphone'
  | 'test_spec_doc'
  | 'coffee_cup';

export type QARuntimeIndicatorId =
  | 'none'
  | 'bug_alert_red'
  | 'test_running_badge'
  | 'check_verified_badge'
  | 'quality_gate_badge'
  | 'thinking_question'
  | 'completed_sparkle';

export type QASpeedMultiplier = 0.5 | 1 | 1.5;

export type QAAnimationPlaybackCommand =
  | 'play'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'reset_idle'
  | 'reset_position';

export interface QAActionContract {
  id: QAActionId;
  buttonNumber: number;
  label: string;
  labelId: string;
  idLabel: string;
  agentState: QAAgentState;
  clipName: QAAnimationClipName;
  targetAnchorName: QADevOpsAnchorId;
  approachAnchorName?: QADevOpsAnchorId;
  posture: 'standing' | 'seated';
  expression: QAExpressionId;
  prop: QAPropId;
  runtimeIndicator: QARuntimeIndicatorId;
  bubbleText: string;
  thoughtText: string;
}

/**
 * All 21 Required QA Engineer Actions (Sections 13–21)
 * Strictly mapped to QA Zone & Shared Lounge anchors in `AI_OFFICE_ROOM_QA_DEVOPS_v1`
 * (never occupying `DEVOPS_DESK_WORK`).
 */
export const QA_ACTIONS: Record<QAActionId, QAActionContract> = {
  IDLE: {
    id: 'IDLE',
    buttonNumber: 1,
    label: 'Idle / Relaxed',
    labelId: '1. Idle / Santai',
    idLabel: '1. Idle / Santai',
    agentState: 'IDLE',
    clipName: 'Idle_Breathing',
    targetAnchorName: 'QA_WORKSTATION_APPROACH',
    posture: 'standing',
    expression: 'neutral',
    prop: 'none',
    runtimeIndicator: 'none',
    bubbleText: 'QA Engineer siap menjalankan verifikasi kualitas modul [DEMO].',
    thoughtText: 'Meninjau antrean test suite dan matriks perangkat hari ini.',
  },
  WALK_TO_ANCHOR: {
    id: 'WALK_TO_ANCHOR',
    buttonNumber: 2,
    label: 'Walk to Anchor',
    labelId: '2. Jalan ke Anchor',
    idLabel: '2. Jalan ke Anchor',
    agentState: 'MOVING',
    clipName: 'Walk_Cycle',
    targetAnchorName: 'QA_DEVOPS_ROOM_IDLE',
    posture: 'standing',
    expression: 'neutral',
    prop: 'checklist_clipboard',
    runtimeIndicator: 'none',
    bubbleText: 'Berpindah ke titik inspeksi QA berikutnya [DEMO].',
    thoughtText: 'Navigasi bebas hambatan di koridor QA & Shared Lounge.',
  },
  WORK_TYPING: {
    id: 'WORK_TYPING',
    buttonNumber: 3,
    label: 'Work at QA Desk',
    labelId: '3. Kerja di Meja QA',
    idLabel: '3. Kerja di Meja QA',
    agentState: 'WORKING',
    clipName: 'Work_Typing',
    targetAnchorName: 'QA_DESK_WORK',
    approachAnchorName: 'QA_WORKSTATION_APPROACH',
    posture: 'seated',
    expression: 'focused',
    prop: 'none',
    runtimeIndicator: 'none',
    bubbleText: 'Menulis skrip pengujian otomatis & skenario test case di meja QA [DEMO].',
    thoughtText: 'Memastikan cakupan assertion pada setiap alur kritis.',
  },
  RUN_TEST_SUITE_DEMO: {
    id: 'RUN_TEST_SUITE_DEMO',
    buttonNumber: 4,
    label: 'Run Test Suite (Demo)',
    labelId: '4. Jalankan Test Suite (Demo)',
    idLabel: '4. Jalankan Test Suite (Demo)',
    agentState: 'RUNNING_TESTS_DEMO',
    clipName: 'Run_Test_Suite_Demo',
    targetAnchorName: 'QA_DESK_WORK',
    approachAnchorName: 'QA_WORKSTATION_APPROACH',
    posture: 'seated',
    expression: 'focused',
    prop: 'none',
    runtimeIndicator: 'test_running_badge',
    bubbleText: 'Menjalankan rangkaian E2E & unit test suite pada monitor utama QA [DEMO].',
    thoughtText: 'Memantau progres runner: 142 test case sedang dieksekusi [SIMULASI].',
  },
  INSPECT_TEST_RESULTS: {
    id: 'INSPECT_TEST_RESULTS',
    buttonNumber: 5,
    label: 'Inspect Test Results',
    labelId: '5. Periksa Hasil Test',
    idLabel: '5. Periksa Hasil Test',
    agentState: 'INSPECTING_RESULTS',
    clipName: 'Inspect_Test_Results',
    targetAnchorName: 'QA_DESK_WORK',
    approachAnchorName: 'QA_WORKSTATION_APPROACH',
    posture: 'seated',
    expression: 'thinking',
    prop: 'magnifying_glass',
    runtimeIndicator: 'none',
    bubbleText: 'Memeriksa log hasil eksekusi test & metrik cakupan kode di layar kedua [DEMO].',
    thoughtText: 'Menganalisis 2 skenario edge-case yang menunjukkan latensi tinggi.',
  },
  DEVICE_INSPECT: {
    id: 'DEVICE_INSPECT',
    buttonNumber: 6,
    label: 'Inspect Physical Devices',
    labelId: '6. Uji Perangkat / Device',
    idLabel: '6. Uji Perangkat / Device',
    agentState: 'DEVICE_TESTING',
    clipName: 'Device_Inspect',
    targetAnchorName: 'QA_DEVICE_TESTING',
    posture: 'standing',
    expression: 'focused',
    prop: 'magnifying_glass',
    runtimeIndicator: 'none',
    bubbleText: 'Menguji responsivitas UI di laptop, smartphone, dan tablet uji [DEMO].',
    thoughtText: 'Memeriksa keselarasan piksel dan orientasi layar lintas perangkat.',
  },
  REPRODUCE_BUG: {
    id: 'REPRODUCE_BUG',
    buttonNumber: 7,
    label: 'Reproduce Bug (Demo)',
    labelId: '7. Reproduksi Bug (Demo)',
    idLabel: '7. Reproduksi Bug (Demo)',
    agentState: 'REPRODUCING_BUG_DEMO',
    clipName: 'Reproduce_Bug',
    targetAnchorName: 'QA_DEVICE_TESTING',
    posture: 'standing',
    expression: 'concerned',
    prop: 'qa_laptop',
    runtimeIndicator: 'thinking_question',
    bubbleText: 'Mengulangi langkah reproduksi bug pada perangkat uji langkah demi langkah [DEMO].',
    thoughtText: 'Langkah 3 memicu state race condition ketika koneksi lambat.',
  },
  BUG_FOUND_REACTION: {
    id: 'BUG_FOUND_REACTION',
    buttonNumber: 8,
    label: 'Bug Found Reaction (Demo)',
    labelId: '8. Bug Ditemukan! (Demo)',
    idLabel: '8. Bug Ditemukan! (Demo)',
    agentState: 'BUG_FOUND_DEMO',
    clipName: 'Bug_Found_Reaction',
    targetAnchorName: 'QA_DEVICE_TESTING',
    posture: 'standing',
    expression: 'surprised',
    prop: 'bug_report_tablet',
    runtimeIndicator: 'bug_alert_red',
    bubbleText: 'BUG DITEMUKAN! Anomali terkonfirmasi pada tablet inspeksi QA [SIMULASI / DEMO].',
    thoughtText: 'Menangkap bukti tangkapan layar dan jejak error untuk laporan bug.',
  },
  CHECKLIST_REVIEW: {
    id: 'CHECKLIST_REVIEW',
    buttonNumber: 9,
    label: 'Review QA Checklist',
    labelId: '9. Review Checklist QA',
    idLabel: '9. Review Checklist QA',
    agentState: 'REVIEWING_CHECKLIST',
    clipName: 'Checklist_Review',
    targetAnchorName: 'QA_CHECKLIST_BOARD',
    posture: 'standing',
    expression: 'focused',
    prop: 'checklist_clipboard',
    runtimeIndicator: 'check_verified_badge',
    bubbleText: 'Meninjau papan QA Checklist dan mencentang kriteria penerimaan fitur [DEMO].',
    thoughtText: '18 dari 20 item kriteria penerimaan telah terverifikasi.',
  },
  WRITE_BUG_REPORT: {
    id: 'WRITE_BUG_REPORT',
    buttonNumber: 10,
    label: 'Write Bug Report',
    labelId: '10. Tulis Laporan Bug',
    idLabel: '10. Tulis Laporan Bug',
    agentState: 'WRITING_BUG_REPORT',
    clipName: 'Write_Bug_Report',
    targetAnchorName: 'QA_BUG_REVIEW',
    posture: 'standing',
    expression: 'frustrated_by_bug',
    prop: 'bug_report_tablet',
    runtimeIndicator: 'bug_alert_red',
    bubbleText: 'Mendokumentasikan langkah reproduksi, tingkat keparahan, dan ekspektasi perilaku [DEMO].',
    thoughtText: 'Laporan bug yang jelas mempercepat perbaikan oleh tim Engineering.',
  },
  VERIFY_FIX_DEMO: {
    id: 'VERIFY_FIX_DEMO',
    buttonNumber: 11,
    label: 'Verify Fix (Demo)',
    labelId: '11. Verifikasi Perbaikan (Demo)',
    idLabel: '11. Verifikasi Perbaikan (Demo)',
    agentState: 'VERIFYING_FIX_DEMO',
    clipName: 'Verify_Fix_Demo',
    targetAnchorName: 'QA_DESK_WORK',
    approachAnchorName: 'QA_WORKSTATION_APPROACH',
    posture: 'seated',
    expression: 'happy',
    prop: 'none',
    runtimeIndicator: 'check_verified_badge',
    bubbleText: 'Menguji ulang patch perbaikan: bug telah teratasi tanpa efek samping [DEMO].',
    thoughtText: 'Status tiket diperbarui menjadi VERIFIED [SIMULASI].',
  },
  REGRESSION_REVIEW: {
    id: 'REGRESSION_REVIEW',
    buttonNumber: 12,
    label: 'Regression Review',
    labelId: '12. Review Regresi',
    idLabel: '12. Review Regresi',
    agentState: 'REGRESSION_REVIEW',
    clipName: 'Regression_Review',
    targetAnchorName: 'QA_TEST_REPORT_REVIEW',
    posture: 'standing',
    expression: 'focused',
    prop: 'checklist_clipboard',
    runtimeIndicator: 'none',
    bubbleText: 'Membandingkan laporan regresi lintas versi di rak dokumentasi QA [DEMO].',
    thoughtText: 'Tidak ada regresi pada modul inti setelah integrasi terbaru.',
  },
  QUALITY_GATE_REVIEW: {
    id: 'QUALITY_GATE_REVIEW',
    buttonNumber: 13,
    label: 'Quality Gate Review',
    labelId: '13. Review Quality Gate',
    idLabel: '13. Review Quality Gate',
    agentState: 'QUALITY_GATE_REVIEW',
    clipName: 'Quality_Gate_Review',
    targetAnchorName: 'QA_DEVOPS_REVIEW_BOARD',
    posture: 'standing',
    expression: 'confident',
    prop: 'checklist_clipboard',
    runtimeIndicator: 'quality_gate_badge',
    bubbleText: 'Mengevaluasi papan Release Readiness & Quality Gate bersama zona DevOps [DEMO].',
    thoughtText: 'Semua indikator Quality Gate hijau untuk kandidat rilis [SIMULASI].',
  },
  PRESENT_QA_FINDINGS: {
    id: 'PRESENT_QA_FINDINGS',
    buttonNumber: 14,
    label: 'Present QA Findings',
    labelId: '14. Presentasi Temuan QA',
    idLabel: '14. Presentasi Temuan QA',
    agentState: 'PRESENTING_FINDINGS',
    clipName: 'Present_QA_Findings',
    targetAnchorName: 'QA_DEVOPS_PRESENTATION_POSITION',
    posture: 'standing',
    expression: 'talking',
    prop: 'checklist_clipboard',
    runtimeIndicator: 'none',
    bubbleText: 'Memaparkan ringkasan kualitas sprint, temuan bug, dan kesiapan rilis [DEMO].',
    thoughtText: 'Menyampaikan metrik stabilitas secara transparan kepada tim.',
  },
  TECHNICAL_DISCUSSION: {
    id: 'TECHNICAL_DISCUSSION',
    buttonNumber: 15,
    label: 'Technical Discussion',
    labelId: '15. Diskusi Teknis',
    idLabel: '15. Diskusi Teknis',
    agentState: 'DISCUSSING',
    clipName: 'Technical_Discussion',
    targetAnchorName: 'QA_DEVOPS_DISCUSSION_POSITION',
    posture: 'standing',
    expression: 'talking',
    prop: 'qa_laptop',
    runtimeIndicator: 'none',
    bubbleText: 'Berdiskusi mengenai skenario pengujian integrasi di area kolaborasi tengah [DEMO].',
    thoughtText: 'Menyelaraskan lingkungan staging dan data uji.',
  },
  READ_TEST_SPECIFICATION: {
    id: 'READ_TEST_SPECIFICATION',
    buttonNumber: 16,
    label: 'Read Test Specification',
    labelId: '16. Baca Spesifikasi Test',
    idLabel: '16. Baca Spesifikasi Test',
    agentState: 'READING_SPECIFICATION',
    clipName: 'Read_Test_Specification',
    targetAnchorName: 'QA_TEST_REPORT_REVIEW',
    posture: 'standing',
    expression: 'focused',
    prop: 'test_spec_doc',
    runtimeIndicator: 'none',
    bubbleText: 'Membaca dokumen spesifikasi pengujian & standar kualitas produk [DEMO].',
    thoughtText: 'Memvalidasi setiap syarat penerimaan terhadap spesifikasi terbaru.',
  },
  THINK_INVESTIGATE: {
    id: 'THINK_INVESTIGATE',
    buttonNumber: 17,
    label: 'Think / Investigate Issue',
    labelId: '17. Investigasi Masalah',
    idLabel: '17. Investigasi Masalah',
    agentState: 'INVESTIGATING',
    clipName: 'Think_Investigate',
    targetAnchorName: 'QA_BUG_REVIEW',
    posture: 'standing',
    expression: 'thinking',
    prop: 'magnifying_glass',
    runtimeIndicator: 'thinking_question',
    bubbleText: 'Menginvestigasi akar penyebab bug intermiten pada alur transaksi [DEMO].',
    thoughtText: 'Menghubungkan pola log waktu eksekusi dengan perubahan state UI.',
  },
  PHONE_CALL: {
    id: 'PHONE_CALL',
    buttonNumber: 18,
    label: 'Coordination Call',
    labelId: '18. Telepon Koordinasi',
    idLabel: '18. Telepon Koordinasi',
    agentState: 'ON_CALL',
    clipName: 'Phone_Call',
    targetAnchorName: 'QA_DEVOPS_DISCUSSION_POSITION',
    posture: 'standing',
    expression: 'talking',
    prop: 'smartphone',
    runtimeIndicator: 'none',
    bubbleText: 'Koordinasi cepat via telepon terkait status verifikasi bug prioritas [DEMO].',
    thoughtText: 'Mengonfirmasi jadwal pengujian ulang setelah patch siap.',
  },
  COFFEE_BREAK: {
    id: 'COFFEE_BREAK',
    buttonNumber: 19,
    label: 'Coffee Break',
    labelId: '19. Istirahat Kopi',
    idLabel: '19. Istirahat Kopi',
    agentState: 'COFFEE_BREAK',
    clipName: 'Coffee_Break',
    targetAnchorName: 'QA_DEVOPS_COFFEE_TABLE',
    posture: 'standing',
    expression: 'happy',
    prop: 'coffee_cup',
    runtimeIndicator: 'none',
    bubbleText: 'Istirahat sejenak menikmati kopi hangat di lounge kolaborasi QA & DevOps [DEMO].',
    thoughtText: 'Menyegarkan fokus sebelum sesi regresi berikutnya.',
  },
  TASK_COMPLETED: {
    id: 'TASK_COMPLETED',
    buttonNumber: 20,
    label: 'QA Task Completed (Demo)',
    labelId: '20. Tugas QA Selesai (Demo)',
    idLabel: '20. Tugas QA Selesai (Demo)',
    agentState: 'TASK_COMPLETED_DEMO',
    clipName: 'Task_Completed',
    targetAnchorName: 'QA_DEVOPS_REVIEW_BOARD',
    posture: 'standing',
    expression: 'confident',
    prop: 'checklist_clipboard',
    runtimeIndicator: 'completed_sparkle',
    bubbleText: 'Siklus verifikasi QA selesai! Seluruh checklist lulus tinjauan simulasi [DEMO].',
    thoughtText: 'Laporan akhir QA siap diserahkan untuk tinjauan rilis.',
  },
  WAITING_REVIEW: {
    id: 'WAITING_REVIEW',
    buttonNumber: 21,
    label: 'Waiting for Review',
    labelId: '21. Menunggu Review',
    idLabel: '21. Menunggu Review',
    agentState: 'WAITING_REVIEW',
    clipName: 'Waiting_Review',
    targetAnchorName: 'QA_WORKSTATION_APPROACH',
    posture: 'standing',
    expression: 'tired_waiting',
    prop: 'checklist_clipboard',
    runtimeIndicator: 'none',
    bubbleText: 'Menunggu konfirmasi tinjauan rilis dari tim terkait [SIMULASI / DEMO].',
    thoughtText: 'Siap menjalankan verifikasi tambahan bila diperlukan.',
  },
};

export const QA_ACTION_LIST: readonly QAActionContract[] = [
  QA_ACTIONS.IDLE,
  QA_ACTIONS.WALK_TO_ANCHOR,
  QA_ACTIONS.WORK_TYPING,
  QA_ACTIONS.RUN_TEST_SUITE_DEMO,
  QA_ACTIONS.INSPECT_TEST_RESULTS,
  QA_ACTIONS.DEVICE_INSPECT,
  QA_ACTIONS.REPRODUCE_BUG,
  QA_ACTIONS.BUG_FOUND_REACTION,
  QA_ACTIONS.CHECKLIST_REVIEW,
  QA_ACTIONS.WRITE_BUG_REPORT,
  QA_ACTIONS.VERIFY_FIX_DEMO,
  QA_ACTIONS.REGRESSION_REVIEW,
  QA_ACTIONS.QUALITY_GATE_REVIEW,
  QA_ACTIONS.PRESENT_QA_FINDINGS,
  QA_ACTIONS.TECHNICAL_DISCUSSION,
  QA_ACTIONS.READ_TEST_SPECIFICATION,
  QA_ACTIONS.THINK_INVESTIGATE,
  QA_ACTIONS.PHONE_CALL,
  QA_ACTIONS.COFFEE_BREAK,
  QA_ACTIONS.TASK_COMPLETED,
  QA_ACTIONS.WAITING_REVIEW,
] as const;

export interface QAAutoDemoStep {
  stepIndex: number;
  actionId: QAActionId;
  durationSec: number;
  description: string;
}

/**
 * 18-Step Automatic QA Workflow Demo Sequence (Section 22)
 */
export const QA_AUTO_DEMO_SEQUENCE: readonly QAAutoDemoStep[] = [
  {
    stepIndex: 1,
    actionId: 'IDLE',
    durationSec: 2.6,
    description: 'Start at QA idle position in North QA Testing Zone',
  },
  {
    stepIndex: 2,
    actionId: 'WORK_TYPING',
    durationSec: 4.0,
    description: 'Walk to QA workstation and sit down to write test cases (Work_Typing)',
  },
  {
    stepIndex: 3,
    actionId: 'RUN_TEST_SUITE_DEMO',
    durationSec: 3.8,
    description: 'Run automated test suite demo on main QA display (Run_Test_Suite_Demo)',
  },
  {
    stepIndex: 4,
    actionId: 'INSPECT_TEST_RESULTS',
    durationSec: 3.6,
    description: 'Inspect test execution logs and coverage metrics (Inspect_Test_Results)',
  },
  {
    stepIndex: 5,
    actionId: 'DEVICE_INSPECT',
    durationSec: 4.2,
    description: 'Stand up and walk to QA_DEVICE_TESTING counter to inspect devices (Device_Inspect)',
  },
  {
    stepIndex: 6,
    actionId: 'REPRODUCE_BUG',
    durationSec: 3.8,
    description: 'Reproduce reported edge-case bug step-by-step on test laptop (Reproduce_Bug)',
  },
  {
    stepIndex: 7,
    actionId: 'BUG_FOUND_REACTION',
    durationSec: 3.4,
    description: 'Trigger Bug_Found_Reaction with red bug alert tablet (DEMO)',
  },
  {
    stepIndex: 8,
    actionId: 'CHECKLIST_REVIEW',
    durationSec: 4.0,
    description: 'Walk to QA_CHECKLIST_BOARD and review acceptance checklist (Checklist_Review)',
  },
  {
    stepIndex: 9,
    actionId: 'WRITE_BUG_REPORT',
    durationSec: 3.8,
    description: 'Write structured bug report at QA_BUG_REVIEW (Write_Bug_Report)',
  },
  {
    stepIndex: 10,
    actionId: 'READ_TEST_SPECIFICATION',
    durationSec: 4.0,
    description: 'Walk to QA_TEST_REPORT_REVIEW and read test specification (Read_Test_Specification)',
  },
  {
    stepIndex: 11,
    actionId: 'THINK_INVESTIGATE',
    durationSec: 3.5,
    description: 'Investigate root cause and edge cases (Think_Investigate)',
  },
  {
    stepIndex: 12,
    actionId: 'VERIFY_FIX_DEMO',
    durationSec: 4.2,
    description: 'Return to QA workstation and verify fix patch (Verify_Fix_Demo)',
  },
  {
    stepIndex: 13,
    actionId: 'REGRESSION_REVIEW',
    durationSec: 3.8,
    description: 'Perform regression review across test reports (Regression_Review)',
  },
  {
    stepIndex: 14,
    actionId: 'QUALITY_GATE_REVIEW',
    durationSec: 4.2,
    description: 'Walk to QA_DEVOPS_REVIEW_BOARD for Quality Gate review (Quality_Gate_Review)',
  },
  {
    stepIndex: 15,
    actionId: 'PRESENT_QA_FINDINGS',
    durationSec: 3.8,
    description: 'Present QA findings at QA_DEVOPS_PRESENTATION_POSITION (Present_QA_Findings)',
  },
  {
    stepIndex: 16,
    actionId: 'COFFEE_BREAK',
    durationSec: 3.6,
    description: 'Walk to shared lounge coffee table for a short coffee break (Coffee_Break)',
  },
  {
    stepIndex: 17,
    actionId: 'TASK_COMPLETED',
    durationSec: 3.4,
    description: 'Trigger QA Task_Completed celebration',
  },
  {
    stepIndex: 18,
    actionId: 'IDLE',
    durationSec: 2.8,
    description: 'Return cleanly to QA_WORKSTATION_APPROACH idle state',
  },
] as const;

export const QA_PATROL_ANCHOR_RING: readonly QADevOpsAnchorId[] = [
  'QA_WORKSTATION_APPROACH',
  'QA_DEVICE_TESTING',
  'QA_CHECKLIST_BOARD',
  'QA_TEST_REPORT_REVIEW',
  'QA_DEVOPS_DISCUSSION_POSITION',
  'QA_DEVOPS_REVIEW_BOARD',
  'QA_DEVOPS_COFFEE_TABLE',
] as const;

export interface QAWalkWaypoint {
  id: string;
  position: [number, number, number];
  neighbors: string[];
}

/**
 * Collision-free Waypoint Graph inside the 8×16 `AI_OFFICE_ROOM_QA_DEVOPS_v1` module.
 * Routes cleanly around:
 * - QA Workstation Desk (`X = 4.62..6.68, Z = 13.41..14.29`) & Chair (`[5.65, 0, 12.95]`)
 * - Device Testing Counter (`X = 1.31..1.99, Z = 12.81..14.29`)
 * - Shared Lounge Coffee Table (`[4.55, 0, 8.05]`), Sofa (`[5.95, 0, 8.05]`), Armchair (`[4.65, 0, 9.65]`), Poufs (`[3.35, 0, 7.85]`)
 * - Keeps out of South DevOps desk/rack work envelope (`Z < 5.2`).
 */
export const QA_WALK_WAYPOINTS: readonly QAWalkWaypoint[] = [
  {
    id: 'WP_QA_NORTH_DOOR',
    position: [4.0, 0, 15.35],
    neighbors: ['WP_QA_NORTH_SPINE', 'WP_QA_BOOKCASE'],
  },
  {
    id: 'WP_QA_BOOKCASE',
    position: [2.05, 0, 14.55],
    neighbors: ['WP_QA_NORTH_DOOR', 'WP_QA_NORTH_SPINE', 'WP_QA_DEVICE_BENCH'],
  },
  {
    id: 'WP_QA_NORTH_SPINE',
    position: [3.65, 0, 14.25],
    neighbors: ['WP_QA_NORTH_DOOR', 'WP_QA_BOOKCASE', 'WP_QA_DESK_APPROACH', 'WP_QA_DEVICE_BENCH'],
  },
  {
    id: 'WP_QA_DEVICE_BENCH',
    position: [2.65, 0, 13.55],
    neighbors: ['WP_QA_BOOKCASE', 'WP_QA_NORTH_SPINE', 'WP_QA_DESK_APPROACH', 'WP_QA_WEST_UPPER'],
  },
  {
    id: 'WP_QA_DESK_APPROACH',
    position: [3.75, 0, 12.95],
    neighbors: ['WP_QA_NORTH_SPINE', 'WP_QA_DEVICE_BENCH', 'WP_QA_DESK_SEAT', 'WP_QA_CENTER_NORTH'],
  },
  {
    id: 'WP_QA_DESK_SEAT',
    position: [5.65, 0, 13.15],
    neighbors: ['WP_QA_DESK_APPROACH'],
  },
  {
    id: 'WP_QA_WEST_UPPER',
    position: [1.65, 0, 12.15],
    neighbors: ['WP_QA_DEVICE_BENCH', 'WP_QA_CHECKLIST', 'WP_QA_CENTER_NORTH'],
  },
  {
    id: 'WP_QA_CHECKLIST',
    position: [1.55, 0, 11.45],
    neighbors: ['WP_QA_WEST_UPPER', 'WP_QA_CENTER_NORTH', 'WP_LOUNGE_WEST_CORRIDOR'],
  },
  {
    id: 'WP_QA_CENTER_NORTH',
    position: [3.15, 0, 11.35],
    neighbors: ['WP_QA_DESK_APPROACH', 'WP_QA_WEST_UPPER', 'WP_QA_CHECKLIST', 'WP_LOUNGE_DISCUSSION'],
  },
  {
    id: 'WP_LOUNGE_WEST_CORRIDOR',
    position: [2.15, 0, 9.25],
    neighbors: ['WP_QA_CHECKLIST', 'WP_LOUNGE_DISCUSSION', 'WP_WEST_EXIT', 'WP_REVIEW_PRESENT'],
  },
  {
    id: 'WP_LOUNGE_DISCUSSION',
    position: [2.85, 0, 8.65],
    neighbors: ['WP_QA_CENTER_NORTH', 'WP_LOUNGE_WEST_CORRIDOR', 'WP_LOUNGE_COFFEE', 'WP_WEST_EXIT'],
  },
  {
    id: 'WP_LOUNGE_COFFEE',
    position: [3.45, 0, 7.85],
    neighbors: ['WP_LOUNGE_DISCUSSION', 'WP_REVIEW_PRESENT'],
  },
  {
    id: 'WP_WEST_EXIT',
    position: [0.85, 0, 8.0],
    neighbors: ['WP_LOUNGE_WEST_CORRIDOR', 'WP_LOUNGE_DISCUSSION', 'WP_REVIEW_PRESENT'],
  },
  {
    id: 'WP_REVIEW_PRESENT',
    position: [2.15, 0, 6.25],
    neighbors: ['WP_LOUNGE_WEST_CORRIDOR', 'WP_LOUNGE_COFFEE', 'WP_WEST_EXIT', 'WP_REVIEW_BOARD'],
  },
  {
    id: 'WP_REVIEW_BOARD',
    position: [1.55, 0, 5.65],
    neighbors: ['WP_REVIEW_PRESENT'],
  },
] as const;

export function findQAWalkablePath(
  startXZ: [number, number],
  targetXZ: [number, number]
): Array<[number, number, number]> {
  const directDist = Math.hypot(targetXZ[0] - startXZ[0], targetXZ[1] - startXZ[1]);
  if (directDist <= 0.25) {
    return [[targetXZ[0], 0, targetXZ[1]]];
  }

  let nearestStart = QA_WALK_WAYPOINTS[0];
  let nearestStartDist = Infinity;
  let nearestEnd = QA_WALK_WAYPOINTS[0];
  let nearestEndDist = Infinity;

  for (const wp of QA_WALK_WAYPOINTS) {
    const ds = Math.hypot(wp.position[0] - startXZ[0], wp.position[2] - startXZ[1]);
    if (ds < nearestStartDist) {
      nearestStartDist = ds;
      nearestStart = wp;
    }
    const de = Math.hypot(wp.position[0] - targetXZ[0], wp.position[2] - targetXZ[1]);
    if (de < nearestEndDist) {
      nearestEndDist = de;
      nearestEnd = wp;
    }
  }

  const wpMap = new Map<string, QAWalkWaypoint>();
  for (const wp of QA_WALK_WAYPOINTS) {
    wpMap.set(wp.id, wp);
  }

  // Dijkstra shortest path across QA_WALK_WAYPOINTS
  const distMap = new Map<string, number>();
  const prevMap = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const wp of QA_WALK_WAYPOINTS) {
    distMap.set(wp.id, Infinity);
    prevMap.set(wp.id, null);
    unvisited.add(wp.id);
  }
  distMap.set(nearestStart.id, 0);

  while (unvisited.size > 0) {
    let currId: string | null = null;
    let bestD = Infinity;
    for (const id of unvisited) {
      const d = distMap.get(id) ?? Infinity;
      if (d < bestD) {
        bestD = d;
        currId = id;
      }
    }
    if (!currId || currId === nearestEnd.id) break;
    unvisited.delete(currId);

    const currWp = wpMap.get(currId)!;
    for (const nbId of currWp.neighbors) {
      if (!unvisited.has(nbId)) continue;
      const nbWp = wpMap.get(nbId);
      if (!nbWp) continue;
      const edgeCost = Math.hypot(
        nbWp.position[0] - currWp.position[0],
        nbWp.position[2] - currWp.position[2]
      );
      const alt = bestD + edgeCost;
      if (alt < (distMap.get(nbId) ?? Infinity)) {
        distMap.set(nbId, alt);
        prevMap.set(nbId, currId);
      }
    }
  }

  const waypointChain: Array<[number, number, number]> = [];
  let trace: string | null = nearestEnd.id;
  while (trace) {
    const wp = wpMap.get(trace);
    if (wp) {
      waypointChain.unshift([...wp.position]);
    }
    if (trace === nearestStart.id) break;
    trace = prevMap.get(trace) ?? null;
  }

  // Prune redundant first waypoint if moving directly to second is shorter
  if (waypointChain.length >= 2) {
    const first = waypointChain[0];
    const dFirst = Math.hypot(first[0] - startXZ[0], first[2] - startXZ[1]);
    if (dFirst < 0.14) {
      waypointChain.shift();
    }
  }

  const lastWp = waypointChain[waypointChain.length - 1];
  if (
    !lastWp ||
    Math.hypot(lastWp[0] - targetXZ[0], lastWp[2] - targetXZ[1]) > 0.05
  ) {
    waypointChain.push([targetXZ[0], 0, targetXZ[1]]);
  }

  return waypointChain;
}

export interface QASimulationRuntimeStatus {
  characterId: typeof QA_CHARACTER_CONSTANTS.CHARACTER_ID;
  displayName: typeof QA_CHARACTER_CONSTANTS.DISPLAY_NAME;
  currentState: QAAgentState;
  currentActionId: QAActionId;
  currentActionLabel: string;
  activeClipName: QAAnimationClipName;
  currentAnchorId: QADevOpsAnchorId;
  targetAnchorId: QADevOpsAnchorId;
  currentExpression: QAExpressionId;
  posture: 'standing' | 'seated';
  handheldProp: QAPropId;
  runtimeIndicator: QARuntimeIndicatorId;
  isWalking: boolean;
  isPaused: boolean;
  patrolActive: boolean;
  autoDemoActive: boolean;
  autoDemoStepIndex: number;
  autoDemoTotalSteps: number;
  speedMultiplier: QASpeedMultiplier;
  headsetVisible: boolean;
  glassesVisible: boolean;
  backpackVisible: boolean;
  backpackAutoHiddenForSeat: boolean;
  bubbleText: string;
  thoughtText: string;
  worldPosition: [number, number, number];
  facingRad: number;
}

export function getQADefaultAnchorPositionAndFacing(anchorId: QADevOpsAnchorId): {
  position: [number, number, number];
  rotationY: number;
  posture: 'standing' | 'seated';
} {
  const found = DEFAULT_QA_DEVOPS_ANCHORS[anchorId];
  if (found) {
    return {
      position: [...found.position],
      rotationY: found.rotationY,
      posture: found.posture,
    };
  }
  return {
    position: [3.75, 0, 12.95],
    rotationY: 0,
    posture: 'standing',
  };
}
