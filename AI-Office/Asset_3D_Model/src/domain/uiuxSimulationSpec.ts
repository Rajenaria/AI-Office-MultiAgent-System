import {
  DEFAULT_UIUX_ANCHORS,
  UIUXActivityAnchor,
  UIUXAnchorId,
  UIUX_FURNITURE_CATALOG,
  UIUX_MODULE_CONSTANTS,
} from './uiuxRoomSpec';
import { WalkWaypoint } from './pmSimulationSpec';

export const UIUX_CHARACTER_CONSTANTS = {
  CHARACTER_ID: 'uiux_designer_agent',
  ASSET_ID: 'ai_office.character.uiux_designer_agent.v1',
  DISPLAY_NAME: 'UI/UX Designer',
  FUNCTIONAL_ROLE: 'UI/UX Design, Wireframing, Review, Prototype, Design Thinking',
  DEPARTMENT: 'Design',
  ROOM_AFFILIATION: UIUX_MODULE_CONSTANTS.MODULE_ID,
  COMPATIBLE_ROOM_ID: UIUX_MODULE_CONSTANTS.MODULE_ID,
  COMPATIBLE_ROOM_ASSET_ID: UIUX_MODULE_CONSTANTS.ASSET_ID,
  ROOT_NODE_NAME: 'UIUX_Designer_Agent_Root',
  RUNTIME_ROOT_NAME: 'UIUX_AGENT_RUNTIME_ROOT',
  GLB_FILENAME: 'uiux_designer_agent.glb',
  MANIFEST_FILENAME: 'uiux_designer_agent.manifest.json',
  BEHAVIOR_FILENAME: 'uiux_designer_agent.behavior.json',
  PREVIEW_FILENAME: 'uiux_designer_agent_preview.png',
  README_FILENAME: 'README.md',
  TARGET_HEIGHT_UNITS: 1.725,
  LOCAL_FORWARD: [0, 0, 1] as [number, number, number],
  SIMULATION_NOTICE:
    'SIMULASI / DEMO: This UI/UX Designer character operates as an interactive visual simulation agent inside the UI/UX Design Studio and prepares a clean state contract for future AI Office orchestration.',
} as const;

export type UIUXAgentStateId =
  | 'IDLE'
  | 'MOVING'
  | 'TALKING'
  | 'PRESENTING'
  | 'THINKING'
  | 'READING'
  | 'REVIEWING'
  | 'SKETCHING'
  | 'WORKING_ON_LAPTOP'
  | 'PROTOTYPING'
  | 'DESIGN_SYSTEM_WORK'
  | 'USER_FLOW_ANALYSIS'
  | 'COFFEE_BREAK'
  | 'COMPLETED'
  | 'BLOCKED_DEMO';

export type UIUXActionId =
  | 'idle'
  | 'walk'
  | 'talk'
  | 'present'
  | 'think'
  | 'read'
  | 'review'
  | 'sketch'
  | 'laptop_work'
  | 'prototype_review'
  | 'design_system_work'
  | 'user_flow_analysis'
  | 'coffee_break'
  | 'approve'
  | 'task_completed';

export type UIUXExpressionId =
  | 'neutral'
  | 'focused'
  | 'talking'
  | 'thinking'
  | 'happy'
  | 'concerned'
  | 'inspired'
  | 'confident';

export type UIUXHandheldPropId =
  | 'none'
  | 'stylus_tablet'
  | 'wireframe_clipboard'
  | 'sticky_note_palette'
  | 'coffee_mug';

export type UIUXPlaybackCommand =
  | 'play'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'reset_pose'
  | 'reset_position';

export interface UIUXExpressionDefinition {
  id: UIUXExpressionId;
  labelId: string;
  labelEn: string;
  eyebrowTiltRad: number;
  eyebrowOffsetY: number;
  mouthScaleX: number;
  mouthScaleY: number;
  mouthOffsetY: number;
  description: string;
}

export const UIUX_EXPRESSIONS: UIUXExpressionDefinition[] = [
  {
    id: 'neutral',
    labelId: 'Netral',
    labelEn: 'Neutral',
    eyebrowTiltRad: 0,
    eyebrowOffsetY: 0,
    mouthScaleX: 1.0,
    mouthScaleY: 1.0,
    mouthOffsetY: 0,
    description: 'Calm, approachable creative resting expression behind black rectangular glasses.',
  },
  {
    id: 'focused',
    labelId: 'Fokus',
    labelEn: 'Focused',
    eyebrowTiltRad: -0.07,
    eyebrowOffsetY: -0.003,
    mouthScaleX: 0.9,
    mouthScaleY: 0.92,
    mouthOffsetY: 0,
    description: 'Attentive design concentration while sketching, wireframing, or working on UI layouts.',
  },
  {
    id: 'talking',
    labelId: 'Bicara',
    labelEn: 'Talking',
    eyebrowTiltRad: 0.04,
    eyebrowOffsetY: 0.004,
    mouthScaleX: 1.1,
    mouthScaleY: 1.62,
    mouthOffsetY: -0.001,
    description: 'Friendly speaking expression during UX critiques and design presentations.',
  },
  {
    id: 'thinking',
    labelId: 'Berpikir',
    labelEn: 'Thinking',
    eyebrowTiltRad: 0.09,
    eyebrowOffsetY: 0.004,
    mouthScaleX: 0.8,
    mouthScaleY: 0.95,
    mouthOffsetY: -0.002,
    description: 'Thoughtful reflection while evaluating user journeys and information architecture.',
  },
  {
    id: 'happy',
    labelId: 'Senang',
    labelEn: 'Happy',
    eyebrowTiltRad: 0.05,
    eyebrowOffsetY: 0.005,
    mouthScaleX: 1.24,
    mouthScaleY: 1.16,
    mouthOffsetY: 0.003,
    description: 'Warm, cheerful studio smile during coffee breaks and task completion.',
  },
  {
    id: 'concerned',
    labelId: 'Waspada',
    labelEn: 'Concerned',
    eyebrowTiltRad: 0.11,
    eyebrowOffsetY: -0.003,
    mouthScaleX: 0.86,
    mouthScaleY: 0.86,
    mouthOffsetY: -0.003,
    description: 'Careful, questioning expression when spotting a usability edge case.',
  },
  {
    id: 'inspired',
    labelId: 'Terinspirasi',
    labelEn: 'Inspired / Idea',
    eyebrowTiltRad: 0.08,
    eyebrowOffsetY: 0.007,
    mouthScaleX: 1.18,
    mouthScaleY: 1.25,
    mouthOffsetY: 0.002,
    description: 'Bright creative spark when discovering a clean UI pattern or color token harmony.',
  },
  {
    id: 'confident',
    labelId: 'Approve / Yakin',
    labelEn: 'Approval / Confident',
    eyebrowTiltRad: -0.04,
    eyebrowOffsetY: 0.003,
    mouthScaleX: 1.18,
    mouthScaleY: 1.1,
    mouthOffsetY: 0.002,
    description: 'Assured, positive designer approval expression.',
  },
];

export const UIUX_EXPRESSION_LIST = UIUX_EXPRESSIONS;

export interface UIUXActionDefinition {
  id: UIUXActionId;
  code: string;
  labelId: string;
  labelEn: string;
  targetState: UIUXAgentStateId;
  targetAnchorId: UIUXAnchorId | null;
  semanticAnchorAlias: string;
  requiresWalk: boolean;
  posture: 'standing' | 'seated';
  clipName: string;
  defaultExpression: UIUXExpressionId;
  handheldProp: UIUXHandheldPropId;
  zoneHighlight: string | null;
  speechBubble?: string;
  thoughtBubble?: string;
  statusBadgeText: string;
  simulatedScreenStatus: string;
  badgeColor: 'emerald' | 'amber' | 'sky' | 'purple' | 'coral' | 'slate';
  description: string;
}

export const UIUX_DEMO_ACTIONS: UIUXActionDefinition[] = [
  {
    id: 'idle',
    code: 'UIUX_ACT_01',
    labelId: 'Idle',
    labelEn: 'Idle Breathing',
    targetState: 'IDLE',
    targetAnchorId: 'UIUX_ROOM_IDLE',
    semanticAnchorAlias: 'UIUX_ROOM_IDLE',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Idle_Breathing',
    defaultExpression: 'neutral',
    handheldProp: 'none',
    zoneHighlight: 'Zone F — Central Studio Rug',
    statusBadgeText: 'SIMULASI / DEMO · IDLE',
    simulatedScreenStatus: 'UI/UX Studio Ready · Design System v2.4 Synced (SIMULASI / DEMO)',
    badgeColor: 'emerald',
    description: 'Postur berdiri santai dan ramah di atas karpet geometris studio dengan napas halus.',
  },
  {
    id: 'walk',
    code: 'UIUX_ACT_02',
    labelId: 'Jalan',
    labelEn: 'Walk Around Studio',
    targetState: 'MOVING',
    targetAnchorId: 'UIUX_DESK_APPROACH',
    semanticAnchorAlias: 'UIUX_DESK_APPROACH',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Walk_Cycle',
    defaultExpression: 'neutral',
    handheldProp: 'none',
    zoneHighlight: null,
    statusBadgeText: 'SIMULASI / DEMO · JALAN',
    simulatedScreenStatus: 'Navigating UI/UX Design Studio Waypoints (SIMULASI / DEMO)',
    badgeColor: 'sky',
    description: 'Berjalan natural mengelilingi zona kerja di dalam UI/UX Design Studio.',
  },
  {
    id: 'talk',
    code: 'UIUX_ACT_03',
    labelId: 'Bicara',
    labelEn: 'Talk & Explain Design',
    targetState: 'TALKING',
    targetAnchorId: 'UIUX_ROOM_IDLE',
    semanticAnchorAlias: 'UIUX_ROOM_IDLE',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Talk',
    defaultExpression: 'talking',
    handheldProp: 'none',
    zoneHighlight: 'Zone F — Central Studio Rug',
    speechBubble: 'SIMULASI / DEMO: Menjelaskan alur onboarding baru yang lebih intuitif untuk pengguna.',
    statusBadgeText: 'SIMULASI / DEMO · BICARA',
    simulatedScreenStatus: 'Explaining UX Rationale & Micro-Interactions (SIMULASI / DEMO)',
    badgeColor: 'emerald',
    description: 'Gestur tangan ramah saat berdiskusi dan menjelaskan konsep pengalaman pengguna.',
  },
  {
    id: 'present',
    code: 'UIUX_ACT_04',
    labelId: 'Presentasi',
    labelEn: 'Present at Critique Easel',
    targetState: 'PRESENTING',
    targetAnchorId: 'UIUX_PRESENTATION_POSITION',
    semanticAnchorAlias: 'UIUX_PRESENTATION_POSITION',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Present',
    defaultExpression: 'talking',
    handheldProp: 'sticky_note_palette',
    zoneHighlight: 'Zone D — Mobile Prototype Critique Stand',
    speechBubble: 'SIMULASI / DEMO: Mempresentasikan variasi layar mobile dan hierarki komponen utama.',
    statusBadgeText: 'SIMULASI / DEMO · PRESENTASI',
    simulatedScreenStatus: 'Presenting Mobile Flow Critique at Studio Easel (SIMULASI / DEMO)',
    badgeColor: 'purple',
    description: 'Mempresentasikan kartu alur mobile dan sistem komponen di depan easel kritik desain.',
  },
  {
    id: 'think',
    code: 'UIUX_ACT_05',
    labelId: 'Berpikir',
    labelEn: 'Design Thinking',
    targetState: 'THINKING',
    targetAnchorId: 'UIUX_WIREFRAME_WALL',
    semanticAnchorAlias: 'UIUX_WIREFRAME_WALL',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Think',
    defaultExpression: 'thinking',
    handheldProp: 'sticky_note_palette',
    zoneHighlight: 'Zone B — Wireframe / UX Flow Wall',
    thoughtBubble: 'SIMULASI / DEMO: Mengevaluasi bagaimana menyederhanakan 4 langkah checkout menjadi 2 langkah...',
    statusBadgeText: 'SIMULASI / DEMO · BERPIKIR',
    simulatedScreenStatus: 'Design Thinking & Information Architecture Ideation (SIMULASI / DEMO)',
    badgeColor: 'amber',
    description: 'Pose reflektif tangan ke dagu saat merancang solusi UX di depan papan wireframe.',
  },
  {
    id: 'read',
    code: 'UIUX_ACT_06',
    labelId: 'Baca Brief',
    labelEn: 'Read Design Brief',
    targetState: 'READING',
    targetAnchorId: 'UIUX_STORAGE_SHELF',
    semanticAnchorAlias: 'UIUX_STORAGE_SHELF',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Read',
    defaultExpression: 'focused',
    handheldProp: 'stylus_tablet',
    zoneHighlight: 'Zone E — Storage / Material Shelf',
    thoughtBubble: 'SIMULASI / DEMO: Membaca spesifikasi produk dan pedoman aksesibilitas kontras warna.',
    statusBadgeText: 'SIMULASI / DEMO · BACA BRIEF',
    simulatedScreenStatus: 'Reading Product Brief & Accessibility Spec on Tablet (SIMULASI / DEMO)',
    badgeColor: 'sky',
    description: 'Membaca brief produk dan catatan riset pengguna pada tablet desain di dekat rak referensi.',
  },
  {
    id: 'review',
    code: 'UIUX_ACT_07',
    labelId: 'Review Desain',
    labelEn: 'Review Layout Sheet',
    targetState: 'REVIEWING',
    targetAnchorId: 'UIUX_REVIEW_TABLE',
    semanticAnchorAlias: 'UIUX_REVIEW_TABLE',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Review',
    defaultExpression: 'focused',
    handheldProp: 'wireframe_clipboard',
    zoneHighlight: 'Zone D — Prototype Review Area',
    speechBubble: 'SIMULASI / DEMO: Memeriksa konsistensi grid 8px, tipografi, dan spasi antar kartu UI.',
    statusBadgeText: 'SIMULASI / DEMO · REVIEW DESAIN',
    simulatedScreenStatus: 'Auditing UI Layout Grid & Visual Hierarchy (SIMULASI / DEMO)',
    badgeColor: 'emerald',
    description: 'Meninjau lembar layout dan ketepatan visual di area meja review prototipe.',
  },
  {
    id: 'sketch',
    code: 'UIUX_ACT_08',
    labelId: 'Sketch',
    labelEn: 'Sketch on Pen Tablet',
    targetState: 'SKETCHING',
    targetAnchorId: 'UIUX_DESK_WORK',
    semanticAnchorAlias: 'UIUX_DESK_WORK',
    requiresWalk: true,
    posture: 'seated',
    clipName: 'Sketch',
    defaultExpression: 'inspired',
    handheldProp: 'stylus_tablet',
    zoneHighlight: 'Zone A — Primary Design Workstation',
    thoughtBubble: 'SIMULASI / DEMO: Menggambar sketsa ikon vektor dan ilustrasi mikro dengan stylus.',
    statusBadgeText: 'SIMULASI / DEMO · SKETCH',
    simulatedScreenStatus: 'Sketching Wireframes & Vector Icons with Stylus (SIMULASI / DEMO)',
    badgeColor: 'coral',
    description: 'Menggambar sketsa wireframe dan ikon menggunakan stylus serta tablet gambar interaktif.',
  },
  {
    id: 'laptop_work',
    code: 'UIUX_ACT_09',
    labelId: 'Kerja Laptop',
    labelEn: 'Work at Design Workstation',
    targetState: 'WORKING_ON_LAPTOP',
    targetAnchorId: 'UIUX_DESK_WORK',
    semanticAnchorAlias: 'UIUX_DESK_WORK',
    requiresWalk: true,
    posture: 'seated',
    clipName: 'Laptop_Work',
    defaultExpression: 'focused',
    handheldProp: 'none',
    zoneHighlight: 'Zone A — Primary Design Workstation',
    speechBubble: 'SIMULASI / DEMO: Menyusun auto-layout dan varian komponen interaktif di monitor 5K.',
    statusBadgeText: 'SIMULASI / DEMO · KERJA LAPTOP',
    simulatedScreenStatus: 'Building High-Fidelity Mockups & Auto-Layout Frames (SIMULASI / DEMO)',
    badgeColor: 'emerald',
    description: 'Duduk bekerja di meja desain utama menggunakan keyboard mekanikal dan layar kanvas 5K.',
  },
  {
    id: 'prototype_review',
    code: 'UIUX_ACT_10',
    labelId: 'Prototype Review',
    labelEn: 'Interactive Prototype Review',
    targetState: 'PROTOTYPING',
    targetAnchorId: 'UIUX_REVIEW_TABLE',
    semanticAnchorAlias: 'UIUX_REVIEW_TABLE',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Prototype_Review',
    defaultExpression: 'focused',
    handheldProp: 'wireframe_clipboard',
    zoneHighlight: 'Zone D — Prototype Review Area',
    speechBubble: 'SIMULASI / DEMO: Menguji transisi layar dan respons interaksi pada prototipe tablet.',
    statusBadgeText: 'SIMULASI / DEMO · PROTOTYPE REVIEW',
    simulatedScreenStatus: 'Testing Interactive Prototype Transitions & States (SIMULASI / DEMO)',
    badgeColor: 'purple',
    description: 'Menguji alur prototipe interaktif dan lembar wireframe di meja kolaborasi bundar.',
  },
  {
    id: 'design_system_work',
    code: 'UIUX_ACT_11',
    labelId: 'Design System',
    labelEn: 'Curate Design System & Tokens',
    targetState: 'DESIGN_SYSTEM_WORK',
    targetAnchorId: 'UIUX_STYLE_BOARD',
    semanticAnchorAlias: 'UIUX_STYLE_BOARD',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Design_System_Work',
    defaultExpression: 'inspired',
    handheldProp: 'sticky_note_palette',
    zoneHighlight: 'Zone C — Visual Design / Style Board',
    speechBubble: 'SIMULASI / DEMO: Menyelaraskan token warna Mint Sage, Lavender, dan skala tipografi.',
    statusBadgeText: 'SIMULASI / DEMO · DESIGN SYSTEM',
    simulatedScreenStatus: 'Curating Color Swatches, Type Scale & UI Tokens (SIMULASI / DEMO)',
    badgeColor: 'emerald',
    description: 'Mengkurasi palet warna 3D, skala tipografi, dan komponen token di depan Style System Board.',
  },
  {
    id: 'user_flow_analysis',
    code: 'UIUX_ACT_12',
    labelId: 'Analisis User Flow',
    labelEn: 'User Flow Analysis at Wall',
    targetState: 'USER_FLOW_ANALYSIS',
    targetAnchorId: 'UIUX_WIREFRAME_WALL',
    semanticAnchorAlias: 'UIUX_WIREFRAME_WALL',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'User_Flow_Analysis',
    defaultExpression: 'thinking',
    handheldProp: 'wireframe_clipboard',
    zoneHighlight: 'Zone B — Wireframe / UX Flow Wall',
    speechBubble: 'SIMULASI / DEMO: Memetakan jalur navigasi pengguna dan sticky notes hasil riset UX.',
    statusBadgeText: 'SIMULASI / DEMO · USER FLOW',
    simulatedScreenStatus: 'Mapping User Journey Nodes & Wireframe Cards (SIMULASI / DEMO)',
    badgeColor: 'sky',
    description: 'Berdiri menganalisis alur layar mobile dan kartu wireframe di dinding pinboard UX.',
  },
  {
    id: 'coffee_break',
    code: 'UIUX_ACT_13',
    labelId: 'Istirahat Kopi',
    labelEn: 'Creative Coffee Break',
    targetState: 'COFFEE_BREAK',
    targetAnchorId: 'UIUX_ROOM_IDLE',
    semanticAnchorAlias: 'UIUX_ROOM_IDLE',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Coffee_Break',
    defaultExpression: 'happy',
    handheldProp: 'coffee_mug',
    zoneHighlight: 'Zone F — Cozy Studio Decor',
    thoughtBubble: 'SIMULASI / DEMO: Rehat sejenak menikmati kopi hangat sambil mengamati harmoni visual studio.',
    statusBadgeText: 'SIMULASI / DEMO · ISTIRAHAT KOPI',
    simulatedScreenStatus: 'Creative Recharge Break · Matcha / Latte Mug Active (SIMULASI / DEMO)',
    badgeColor: 'amber',
    description: 'Rehat santai menikmati cangkir kopi studio sambil menyegarkan inspirasi desain.',
  },
  {
    id: 'approve',
    code: 'UIUX_ACT_14',
    labelId: 'Approve',
    labelEn: 'Design Approval Gesture',
    targetState: 'COMPLETED',
    targetAnchorId: 'UIUX_REVIEW_TABLE',
    semanticAnchorAlias: 'UIUX_REVIEW_TABLE',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Approve',
    defaultExpression: 'confident',
    handheldProp: 'none',
    zoneHighlight: 'Zone D — Prototype Review Area',
    speechBubble: 'SIMULASI / DEMO: Desain komponen dan kontras visual sudah memenuhi standar kualitas!',
    statusBadgeText: 'SIMULASI / DEMO · APPROVE',
    simulatedScreenStatus: 'UI Quality Check Passed · Design Approved (SIMULASI / DEMO)',
    badgeColor: 'emerald',
    description: 'Gestur konfirmasi positif dan anggukan profesional saat menyetujui kualitas desain.',
  },
  {
    id: 'task_completed',
    code: 'UIUX_ACT_15',
    labelId: 'Tugas Selesai',
    labelEn: 'Task Completed Celebration',
    targetState: 'COMPLETED',
    targetAnchorId: 'UIUX_ROOM_IDLE',
    semanticAnchorAlias: 'UIUX_ROOM_IDLE',
    requiresWalk: true,
    posture: 'standing',
    clipName: 'Task_Completed',
    defaultExpression: 'happy',
    handheldProp: 'none',
    zoneHighlight: 'Zone F — Central Studio Rug',
    speechBubble: 'SIMULASI / DEMO: Paket desain UI/UX dan prototipe siap diserahkan ke tim produk!',
    statusBadgeText: 'SIMULASI / DEMO · TUGAS SELESAI',
    simulatedScreenStatus: 'UI/UX Deliverable Handoff Ready (SIMULASI / DEMO)',
    badgeColor: 'emerald',
    description: 'Ekspresi puas dan gestur selebrasi profesional setelah menyelesaikan sprint desain.',
  },
];

export const UIUX_DEMO_ACTION_LIST = UIUX_DEMO_ACTIONS;

export function getUIUXActionDef(actionId: UIUXActionId): UIUXActionDefinition {
  return UIUX_DEMO_ACTIONS.find((a) => a.id === actionId) || UIUX_DEMO_ACTIONS[0];
}

export function getUIUXExpressionDef(expressionId: UIUXExpressionId): UIUXExpressionDefinition {
  return UIUX_EXPRESSIONS.find((e) => e.id === expressionId) || UIUX_EXPRESSIONS[0];
}

export interface UIUXAutoDemoStep {
  stepIndex: number;
  actionId: UIUXActionId;
  stepTitle: string;
  stepLabel: string;
  durationSeconds: number;
}

/**
 * 9-step automated UI/UX Designer demo sequence matching Section 12:
 * Idle -> Walk -> Sketch -> Review -> Present -> Laptop Work -> Design System -> Task Completed -> Idle
 */
export const UIUX_AUTO_DEMO_SEQUENCE: UIUXAutoDemoStep[] = [
  {
    stepIndex: 0,
    actionId: 'idle',
    stepTitle: '1. Studio Idle & Observation',
    stepLabel: 'Idle',
    durationSeconds: 3.5,
  },
  {
    stepIndex: 1,
    actionId: 'walk',
    stepTitle: '2. Walk to Design Workstation',
    stepLabel: 'Walk',
    durationSeconds: 3.5,
  },
  {
    stepIndex: 2,
    actionId: 'sketch',
    stepTitle: '3. Sketch Wireframes on Pen Tablet',
    stepLabel: 'Sketch',
    durationSeconds: 5.5,
  },
  {
    stepIndex: 3,
    actionId: 'review',
    stepTitle: '4. Review Layout at Critique Table',
    stepLabel: 'Review',
    durationSeconds: 5.5,
  },
  {
    stepIndex: 4,
    actionId: 'present',
    stepTitle: '5. Present Mobile Flow at Easel',
    stepLabel: 'Present',
    durationSeconds: 5.5,
  },
  {
    stepIndex: 5,
    actionId: 'laptop_work',
    stepTitle: '6. Laptop / 5K UI Component Work',
    stepLabel: 'Laptop Work',
    durationSeconds: 6.0,
  },
  {
    stepIndex: 6,
    actionId: 'design_system_work',
    stepTitle: '7. Curate Style & Color Swatches',
    stepLabel: 'Design System',
    durationSeconds: 5.5,
  },
  {
    stepIndex: 7,
    actionId: 'task_completed',
    stepTitle: '8. Design Milestone Completed',
    stepLabel: 'Task Completed',
    durationSeconds: 4.5,
  },
  {
    stepIndex: 8,
    actionId: 'idle',
    stepTitle: '9. Return to Calm Studio Idle',
    stepLabel: 'Idle',
    durationSeconds: 4.0,
  },
];

export const UIUX_PATROL_ANCHOR_SEQUENCE: UIUXAnchorId[] = [
  'UIUX_ROOM_IDLE',
  'UIUX_WIREFRAME_WALL',
  'UIUX_STYLE_BOARD',
  'UIUX_STORAGE_SHELF',
  'UIUX_DESK_APPROACH',
  'UIUX_PRESENTATION_POSITION',
  'UIUX_REVIEW_TABLE',
];

/**
 * Collision-free walkable waypoint network inside the 8x8 UI/UX Design Studio.
 * Routes cleanly around the Primary Design Workstation ([5.45, 0, 5.75]),
 * Prototype Review Table ([5.65, 0, 2.55]), Mobile Critique Stand ([6.92, 0, 2.35]),
 * Lounge Pouf ([1.75, 0, 1.55]), and Material Storage Shelf ([2.05, 0, 7.38]).
 */
export const UIUX_WALK_WAYPOINTS: WalkWaypoint[] = [
  {
    id: 'WP_UIUX_SOUTH_ENTRY',
    position: [4.0, 0.95],
    neighbors: ['WP_UIUX_SOUTH_HALL', 'WP_UIUX_SW_WIREFRAME'],
  },
  {
    id: 'WP_UIUX_SOUTH_HALL',
    position: [3.85, 2.35],
    neighbors: [
      'WP_UIUX_SOUTH_ENTRY',
      'WP_UIUX_CENTER_RUG',
      'WP_UIUX_SW_WIREFRAME',
      'WP_UIUX_REVIEW_WEST',
    ],
  },
  {
    id: 'WP_UIUX_CENTER_RUG',
    position: [3.85, 3.85],
    neighbors: [
      'WP_UIUX_SOUTH_HALL',
      'WP_UIUX_SW_WIREFRAME',
      'WP_UIUX_NW_STYLE',
      'WP_UIUX_NORTH_HUB',
      'WP_UIUX_REVIEW_WEST',
      'WP_UIUX_EAST_EASEL',
    ],
  },
  {
    id: 'WP_UIUX_SW_WIREFRAME',
    position: [1.35, 2.85],
    neighbors: ['WP_UIUX_SOUTH_ENTRY', 'WP_UIUX_SOUTH_HALL', 'WP_UIUX_CENTER_RUG', 'WP_UIUX_NW_STYLE'],
  },
  {
    id: 'WP_UIUX_NW_STYLE',
    position: [1.35, 5.85],
    neighbors: ['WP_UIUX_SW_WIREFRAME', 'WP_UIUX_CENTER_RUG', 'WP_UIUX_SHELF_FRONT', 'WP_UIUX_NORTH_HUB'],
  },
  {
    id: 'WP_UIUX_SHELF_FRONT',
    position: [2.05, 6.45],
    neighbors: ['WP_UIUX_NW_STYLE', 'WP_UIUX_NORTH_HUB', 'WP_UIUX_DESK_APPROACH'],
  },
  {
    id: 'WP_UIUX_NORTH_HUB',
    position: [3.65, 5.35],
    neighbors: [
      'WP_UIUX_CENTER_RUG',
      'WP_UIUX_NW_STYLE',
      'WP_UIUX_SHELF_FRONT',
      'WP_UIUX_DESK_APPROACH',
      'WP_UIUX_EAST_EASEL',
    ],
  },
  {
    id: 'WP_UIUX_DESK_APPROACH',
    position: [4.25, 6.45],
    neighbors: ['WP_UIUX_SHELF_FRONT', 'WP_UIUX_NORTH_HUB', 'WP_UIUX_DESK_SEAT'],
  },
  {
    id: 'WP_UIUX_DESK_SEAT',
    position: [5.35, 6.42],
    neighbors: ['WP_UIUX_DESK_APPROACH'],
  },
  {
    id: 'WP_UIUX_REVIEW_WEST',
    position: [4.35, 2.55],
    neighbors: ['WP_UIUX_SOUTH_HALL', 'WP_UIUX_CENTER_RUG', 'WP_UIUX_EAST_EASEL'],
  },
  {
    id: 'WP_UIUX_EAST_EASEL',
    position: [6.15, 3.55],
    neighbors: ['WP_UIUX_CENTER_RUG', 'WP_UIUX_NORTH_HUB', 'WP_UIUX_REVIEW_WEST'],
  },
];

function findNearestUIUXWaypoint(pt: [number, number]): WalkWaypoint {
  let best = UIUX_WALK_WAYPOINTS[0];
  let bestDist = Infinity;
  for (const wp of UIUX_WALK_WAYPOINTS) {
    const d = Math.hypot(wp.position[0] - pt[0], wp.position[1] - pt[1]);
    if (d < bestDist) {
      bestDist = d;
      best = wp;
    }
  }
  return best;
}

/**
 * Shortest-path A* / Dijkstra router over `UIUX_WALK_WAYPOINTS`.
 * Ensures behind-desk seated actions (`UIUX_DESK_WORK` at [5.35, 0, 6.42]) always route
 * through `WP_UIUX_DESK_APPROACH` ([4.25, 6.45]) without clipping through the L-desk.
 */
export function findUIUXWalkablePath(
  startXZ: [number, number],
  goalXZ: [number, number]
): Array<[number, number]> {
  const clampedGoal: [number, number] = [
    Math.max(0.65, Math.min(7.35, goalXZ[0])),
    Math.max(0.45, Math.min(7.25, goalXZ[1])),
  ];

  const startWp = findNearestUIUXWaypoint(startXZ);
  const goalWp = findNearestUIUXWaypoint(clampedGoal);

  if (startWp.id === goalWp.id) {
    return [clampedGoal];
  }

  const wpMap = new Map(UIUX_WALK_WAYPOINTS.map((w) => [w.id, w]));
  const distMap = new Map<string, number>();
  const prevMap = new Map<string, string | null>();
  const unvisited = new Set<string>(UIUX_WALK_WAYPOINTS.map((w) => w.id));

  for (const w of UIUX_WALK_WAYPOINTS) {
    distMap.set(w.id, Infinity);
    prevMap.set(w.id, null);
  }
  distMap.set(startWp.id, 0);

  while (unvisited.size > 0) {
    let uId: string | null = null;
    let bestD = Infinity;
    for (const id of unvisited) {
      const d = distMap.get(id) ?? Infinity;
      if (d < bestD) {
        bestD = d;
        uId = id;
      }
    }
    if (!uId || uId === goalWp.id) break;
    unvisited.delete(uId);

    const u = wpMap.get(uId)!;
    for (const vId of u.neighbors) {
      if (!unvisited.has(vId)) continue;
      const v = wpMap.get(vId)!;
      const alt = bestD + Math.hypot(v.position[0] - u.position[0], v.position[1] - u.position[1]);
      if (alt < (distMap.get(vId) ?? Infinity)) {
        distMap.set(vId, alt);
        prevMap.set(vId, uId);
      }
    }
  }

  const chain: Array<[number, number]> = [];
  let curr: string | null = goalWp.id;
  while (curr) {
    const wp = wpMap.get(curr)!;
    chain.unshift([wp.position[0], wp.position[1]]);
    curr = prevMap.get(curr) ?? null;
  }

  // Append exact destination if distinct from final waypoint
  const last = chain[chain.length - 1];
  if (!last || Math.hypot(last[0] - clampedGoal[0], last[1] - clampedGoal[1]) > 0.04) {
    chain.push(clampedGoal);
  }

  // Skip first waypoint if we are already very close to it
  if (chain.length > 1 && Math.hypot(chain[0][0] - startXZ[0], chain[0][1] - startXZ[1]) < 0.18) {
    chain.shift();
  }

  return chain;
}

export interface UIUXRuntimeStatus {
  loaded: boolean;
  state: UIUXAgentStateId;
  currentState: UIUXAgentStateId;
  activeActionId: UIUXActionId;
  currentActionId: UIUXActionId;
  activeActionLabel: string;
  currentActionDef: UIUXActionDefinition;
  currentClipName: string;
  activeClipName: string;
  currentAnchorId: UIUXAnchorId;
  targetAnchorId: UIUXAnchorId;
  expressionId: UIUXExpressionId;
  currentExpression: UIUXExpressionId;
  glassesVisible: boolean;
  activePropId: UIUXHandheldPropId;
  activeProp: UIUXHandheldPropId;
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
  bubbleBadge: string;
  bubbleTone: 'emerald' | 'blue' | 'amber' | 'violet' | 'slate';
  isEmbeddedClipPlaying: boolean;
  availableClips: string[];
  characterSource: 'procedural';
  characterPolyCount: number;
}

export const INITIAL_UIUX_RUNTIME_STATUS: UIUXRuntimeStatus = {
  loaded: true,
  state: 'IDLE',
  currentState: 'IDLE',
  activeActionId: 'idle',
  currentActionId: 'idle',
  activeActionLabel: 'Idle',
  currentActionDef: UIUX_DEMO_ACTIONS[0],
  currentClipName: 'Idle_Breathing',
  activeClipName: 'Idle_Breathing',
  currentAnchorId: 'UIUX_ROOM_IDLE',
  targetAnchorId: 'UIUX_ROOM_IDLE',
  expressionId: 'neutral',
  currentExpression: 'neutral',
  glassesVisible: true,
  activePropId: 'none',
  activeProp: 'none',
  position: [3.85, 0, 3.85],
  worldPosition: [3.85, 0, 3.85],
  rotationYDeg: 180,
  facingDeg: 180,
  speedMultiplier: 1,
  isWalking: false,
  isPaused: false,
  isPatrolling: false,
  patrolActive: false,
  isAutoDemoRunning: false,
  autoDemoActive: false,
  autoDemoStepIndex: 0,
  autoDemoTotalSteps: UIUX_AUTO_DEMO_SEQUENCE.length,
  autoDemoStepTitle: null,
  bubbleText: null,
  bubbleBadge: 'SIMULASI / DEMO · IDLE',
  bubbleTone: 'emerald',
  isEmbeddedClipPlaying: true,
  availableClips: UIUX_DEMO_ACTIONS.map((a) => a.clipName),
  characterSource: 'procedural',
  characterPolyCount: 0,
};

export function checkUIUXWaypointsClearance(): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  for (const wp of UIUX_WALK_WAYPOINTS) {
    const [wx, wz] = wp.position;
    if (wx < 0.4 || wx > 7.6 || wz < 0.3 || wz > 7.6) {
      violations.push(`Waypoint ${wp.id} [${wx}, ${wz}] is outside safe room interior bounds.`);
    }
    // Ensure non-seat waypoints do not collide with the solid core of floor furniture
    if (wp.id === 'WP_UIUX_DESK_SEAT') continue;
    for (const item of UIUX_FURNITURE_CATALOG) {
      if (item.category !== 'FURNITURE' && item.category !== 'PROPS') continue;
      if (item.id === 'UIUX_Wireframe_Flow_Wall' || item.id === 'UIUX_Style_System_Board') continue;
      if (item.id === 'UIUX_Studio_Chair') continue;
      const halfW = item.dimensions[0] * 0.32;
      const halfD = item.dimensions[2] * 0.32;
      if (
        Math.abs(wx - item.position[0]) < halfW &&
        Math.abs(wz - item.position[2]) < halfD
      ) {
        violations.push(`Waypoint ${wp.id} [${wx}, ${wz}] collides with ${item.id}.`);
      }
    }
  }
  return {
    valid: violations.length === 0,
    violations,
  };
}
