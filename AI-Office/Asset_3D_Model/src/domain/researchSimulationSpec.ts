/**
 * Pure domain specification for AI Office Module 05 Character:
 * Research Professor — Senior Research & Shared Brain Agent
 * (`research_professor_agent` / `ai_office.character.research_professor_agent.v1`)
 * inside `AI_OFFICE_ROOM_RESEARCH_v1` (Research & Shared Brain Room — "The Knowledge Atelier", 8×8 m).
 *
 * Free of Three.js so it can be unit-tested with `node:test` and serialized
 * into `research_professor_agent.manifest.json` and `research_professor_agent.behavior.json`.
 */

import {
  DEFAULT_RESEARCH_ANCHORS,
  RESEARCH_MODULE_CONSTANTS,
  type ResearchActivityAnchor,
  type ResearchAnchorType,
} from './researchRoomSpec';

export const RESEARCH_CHARACTER_CONSTANTS = {
  CHARACTER_ID: 'research_professor_agent',
  ASSET_ID: 'ai_office.character.research_professor_agent.v1',
  DISPLAY_NAME: 'Research Professor',
  FULL_ROLE_TITLE: 'Senior Research & Shared Brain Specialist',
  DEPARTMENT: 'Research & Knowledge',
  COMPATIBLE_ROOM_ID: 'AI_OFFICE_ROOM_RESEARCH_v1',
  ROLE_TYPE: 'RESEARCH_PROFESSOR_SHARED_BRAIN',
  ROOT_NODE_NAME: 'Research_Professor_Agent_Root',
  RUNTIME_ROOT_NAME: 'RESEARCH_PROFESSOR_AGENT_RUNTIME_ROOT',
  SCHEMA_VERSION: '1.0.0',
  TARGET_HEIGHT_M: 1.755,
  GROUND_Y: 0.0,
  SEATED_HIP_DROP_Y: -0.175,
  WALK_SPEED_MPS: 1.68,
  ARRIVAL_THRESHOLD_M: 0.06,
  ROTATION_LERP_RATE: 10.5,
  DEFAULT_IDLE_ANCHOR: 'RESEARCH_ROOM_IDLE' as ResearchAnchorType,
  DEFAULT_SPAWN_ANCHOR: 'RESEARCH_ROOM_IDLE' as ResearchAnchorType,
  GLB_FILENAME: 'research_professor_agent.glb',
  MANIFEST_FILENAME: 'research_professor_agent.manifest.json',
  BEHAVIOR_FILENAME: 'research_professor_agent.behavior.json',
  PREVIEW_FILENAME: 'research_professor_agent_preview.png',
  README_FILENAME: 'README.md',
  PACK_ZIP_FILENAME: 'research_professor_agent_pack_v1.zip',
} as const;

export type ResearchAgentState =
  | 'IDLE'
  | 'MOVING'
  | 'READING'
  | 'RESEARCHING'
  | 'SEARCHING_REFERENCES_DEMO'
  | 'ANALYZING_EVIDENCE'
  | 'COMPARING_SOURCES'
  | 'ORGANIZING_ARCHIVE'
  | 'WRITING_NOTES'
  | 'INSPECTING_KNOWLEDGE'
  | 'CONSULTING_SHARED_BRAIN_DEMO'
  | 'THINKING'
  | 'DISCUSSING'
  | 'PRESENTING'
  | 'PREPARING_SUMMARY'
  | 'COFFEE_BREAK'
  | 'WAITING_REVIEW'
  | 'COMPLETED'
  | 'BLOCKED_DEMO';

export type ResearchActionId =
  | 'IDLE'
  | 'WALK_PATROL'
  | 'READ_RESEARCH_BOOK'
  | 'RESEARCH_DESK_WORK'
  | 'SEARCH_REFERENCES_DEMO'
  | 'INSPECT_KNOWLEDGE_ATLAS'
  | 'ANALYZE_EVIDENCE'
  | 'COMPARE_SOURCES'
  | 'ORGANIZE_ARCHIVE'
  | 'WRITE_RESEARCH_NOTES'
  | 'THINK_RESEARCH'
  | 'DISCUSS_RESEARCH'
  | 'PRESENT_FINDINGS'
  | 'CONSULT_SHARED_BRAIN_DEMO'
  | 'PREPARE_RESEARCH_SUMMARY'
  | 'COFFEE_BREAK'
  | 'WAITING_FOR_REVIEW'
  | 'RESEARCH_COMPLETED';

export type ResearchAnimationClipName =
  | 'Idle_Breathing'
  | 'Walk_Cycle'
  | 'Sit_Down'
  | 'Stand_Up'
  | 'Read_Research_Book'
  | 'Research_Desk_Work'
  | 'Search_References_Demo'
  | 'Inspect_Knowledge_Atlas'
  | 'Analyze_Evidence'
  | 'Compare_Sources'
  | 'Organize_Archive'
  | 'Write_Research_Notes'
  | 'Think_Research'
  | 'Discuss_Research'
  | 'Present_Findings'
  | 'Consult_Shared_Brain_Demo'
  | 'Prepare_Research_Summary'
  | 'Coffee_Break'
  | 'Waiting_For_Review'
  | 'Research_Completed';

export const RESEARCH_REQUIRED_ANIMATION_CLIPS: readonly ResearchAnimationClipName[] = [
  'Idle_Breathing',
  'Walk_Cycle',
  'Sit_Down',
  'Stand_Up',
  'Read_Research_Book',
  'Research_Desk_Work',
  'Search_References_Demo',
  'Inspect_Knowledge_Atlas',
  'Analyze_Evidence',
  'Compare_Sources',
  'Organize_Archive',
  'Write_Research_Notes',
  'Think_Research',
  'Discuss_Research',
  'Present_Findings',
  'Consult_Shared_Brain_Demo',
  'Prepare_Research_Summary',
  'Coffee_Break',
  'Waiting_For_Review',
  'Research_Completed',
] as const;

export type ResearchExpressionId =
  | 'neutral'
  | 'idea'
  | 'surprised'
  | 'curious'
  | 'talking'
  | 'focused'
  | 'sleepy'
  | 'pleased'
  | 'concerned'
  | 'thinking';

export type ResearchPropId =
  | 'none'
  | 'research_book'
  | 'notebook'
  | 'tablet'
  | 'research_paper'
  | 'clipboard'
  | 'coffee_cup'
  | 'reference_folder';

export type ResearchAnimationPlaybackCommand =
  | 'play'
  | 'pause'
  | 'resume'
  | 'restart'
  | 'reset_idle';

export type ResearchSpeedMultiplier = 0.5 | 1 | 1.5;

/**
 * 8 Semantic Hair Sub-Groups required by Section 5.2 for the Professor's
 * voluminous, layered white voxel hairstyle.
 */
export const RESEARCH_HAIR_SUBGROUPS = [
  'Hair_Base',
  'Hair_Crown',
  'Hair_Front_Layers',
  'Hair_Left_Side',
  'Hair_Right_Side',
  'Hair_Back_Upper',
  'Hair_Back_Lower',
  'Hair_Temple_Details',
] as const;

export interface ResearchHairMaterialSpec {
  id: string;
  label: string;
  hex: string;
  roughness: number;
  metalness: number;
  role: string;
}

/**
 * 5-Material Layered White / Pearl / Silver / Lavender-Gray Voxel Hair Palette
 * for the Research Professor (Section 5.6 & 5.7).
 */
export const RESEARCH_HAIR_MATERIAL_PALETTE: readonly ResearchHairMaterialSpec[] = [
  {
    id: 'prof_hair_warm_ivory',
    label: 'Warm Ivory White (Crown & Front)',
    hex: '#F6F3EC',
    roughness: 0.86,
    metalness: 0.03,
    role: 'Primary upper crown clusters, prominent front locks, and moustache/beard highlights',
  },
  {
    id: 'prof_hair_soft_pearl',
    label: 'Soft Pearl White (Mid Layers)',
    hex: '#EAE6DF',
    roughness: 0.88,
    metalness: 0.03,
    role: 'Stepped upper-side volumes, temple puffs, and upper-back billowing layers',
  },
  {
    id: 'prof_hair_silver_gray',
    label: 'Pale Silver-Gray (Lateral & Rear)',
    hex: '#D8D4DF',
    roughness: 0.89,
    metalness: 0.04,
    role: 'Lateral stepped tiers, mid-back layers, and beard contour blocks',
  },
  {
    id: 'prof_hair_lavender_shadow',
    label: 'Subtle Lavender-Gray (Shadow)',
    hex: '#C2BDD0',
    roughness: 0.91,
    metalness: 0.03,
    role: 'Under-layer steps, sideburn recesses, and dimensional hair cluster shadows',
  },
  {
    id: 'prof_hair_recess_slate',
    label: 'Deep Recess Gray (Nape & Inner)',
    hex: '#ACA6BC',
    roughness: 0.93,
    metalness: 0.02,
    role: 'Lower nape taper, inner cranium base, and deep recessed hair crevices',
  },
] as const;

export const RESEARCH_OUTFIT_PALETTE = {
  skinWarmBeige: '#F2C5A0',
  skinShadeWarm: '#DDA782',
  cheekWarm: '#E49F86',
  eyeDark: '#15181F',
  pupilBlack: '#090B0E',
  eyeHighlight: '#F8FAFC',
  glassesFrameBlack: '#14171D',
  facialHairWhite: '#F4F1EC',
  facialHairShadow: '#D8D4DF',
  coatCreamPrimary: '#F2EDE2',
  coatCreamLapel: '#E4DDD0',
  coatPocketTrim: '#D5CBB9',
  innerVestCharcoal: '#2C3038',
  innerVestButtonBrass: '#D4A359',
  shirtCrispWhite: '#F8FAFC',
  tieBurgundyRed: '#A6242B',
  tieBurgundyDeep: '#7F1A20',
  trousersDarkCharcoal: '#282C34',
  trousersCuffDark: '#1F232A',
  shoesFormalBrown: '#4A3222',
  shoesSoleDarkBrown: '#261911',
  backpackDarkBody: '#1F242B',
  backpackPanelSlate: '#2B323C',
  sharedBrainGreenBright: '#4ADE80',
  sharedBrainGreenCore: '#22C55E',
  sharedBrainGreenDeep: '#15803D',
} as const;

export interface ResearchExpressionPreset {
  id: ResearchExpressionId;
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
  headTiltZRad: number;
  indicatorBadge: string;
}

export const RESEARCH_EXPRESSION_PRESETS: Record<ResearchExpressionId, ResearchExpressionPreset> = {
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    labelId: 'Netral / Tenang',
    eyeScaleY: 1.0,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    browLiftY: 0,
    browTiltRad: 0,
    mouthWidthScale: 1.0,
    mouthOpenScaleY: 1.0,
    mouthSmileOffsetY: 0,
    headTiltZRad: 0,
    indicatorBadge: 'NEUTRAL',
  },
  idea: {
    id: 'idea',
    label: 'Idea / Inspired',
    labelId: 'Ide / Inspirasi (!)',
    eyeScaleY: 1.18,
    pupilOffsetX: 0,
    pupilOffsetY: 0.004,
    browLiftY: 0.012,
    browTiltRad: 0.06,
    mouthWidthScale: 1.16,
    mouthOpenScaleY: 1.25,
    mouthSmileOffsetY: 0.004,
    headTiltZRad: 0.03,
    indicatorBadge: '💡 IDEA',
  },
  surprised: {
    id: 'surprised',
    label: 'Surprised',
    labelId: 'Terkejut (!!)',
    eyeScaleY: 1.26,
    pupilOffsetX: 0,
    pupilOffsetY: 0.003,
    browLiftY: 0.015,
    browTiltRad: 0.08,
    mouthWidthScale: 0.82,
    mouthOpenScaleY: 1.75,
    mouthSmileOffsetY: -0.002,
    headTiltZRad: 0,
    indicatorBadge: '‼️ SURPRISED',
  },
  curious: {
    id: 'curious',
    label: 'Curious',
    labelId: 'Penasaran (?)',
    eyeScaleY: 1.08,
    pupilOffsetX: 0.005,
    pupilOffsetY: 0.003,
    browLiftY: 0.009,
    browTiltRad: -0.1,
    mouthWidthScale: 0.92,
    mouthOpenScaleY: 1.1,
    mouthSmileOffsetY: 0.001,
    headTiltZRad: 0.055,
    indicatorBadge: '❓ CURIOUS',
  },
  talking: {
    id: 'talking',
    label: 'Talking',
    labelId: 'Berbicara (...)',
    eyeScaleY: 1.02,
    pupilOffsetX: 0,
    pupilOffsetY: 0,
    browLiftY: 0.005,
    browTiltRad: 0.03,
    mouthWidthScale: 1.12,
    mouthOpenScaleY: 1.65,
    mouthSmileOffsetY: 0.002,
    headTiltZRad: 0.02,
    indicatorBadge: '💬 TALKING',
  },
  focused: {
    id: 'focused',
    label: 'Focused',
    labelId: 'Fokus Riset',
    eyeScaleY: 0.86,
    pupilOffsetX: 0,
    pupilOffsetY: -0.002,
    browLiftY: -0.005,
    browTiltRad: -0.09,
    mouthWidthScale: 0.94,
    mouthOpenScaleY: 0.85,
    mouthSmileOffsetY: 0,
    headTiltZRad: 0,
    indicatorBadge: '🎯 FOCUSED',
  },
  sleepy: {
    id: 'sleepy',
    label: 'Sleepy / Tired',
    labelId: 'Mengantuk (zZZ)',
    eyeScaleY: 0.36,
    pupilOffsetX: 0,
    pupilOffsetY: -0.004,
    browLiftY: -0.004,
    browTiltRad: 0.05,
    mouthWidthScale: 0.88,
    mouthOpenScaleY: 0.9,
    mouthSmileOffsetY: -0.003,
    headTiltZRad: -0.04,
    indicatorBadge: '💤 SLEEPY',
  },
  pleased: {
    id: 'pleased',
    label: 'Pleased / Confident',
    labelId: 'Puas / Percaya Diri (✨)',
    eyeScaleY: 0.88,
    pupilOffsetX: 0,
    pupilOffsetY: 0.002,
    browLiftY: 0.007,
    browTiltRad: 0.04,
    mouthWidthScale: 1.24,
    mouthOpenScaleY: 1.15,
    mouthSmileOffsetY: 0.005,
    headTiltZRad: 0.025,
    indicatorBadge: '✨ PLEASED',
  },
  concerned: {
    id: 'concerned',
    label: 'Concerned',
    labelId: 'Kritis / Waspada',
    eyeScaleY: 0.95,
    pupilOffsetX: -0.004,
    pupilOffsetY: -0.002,
    browLiftY: -0.003,
    browTiltRad: 0.11,
    mouthWidthScale: 0.9,
    mouthOpenScaleY: 0.85,
    mouthSmileOffsetY: -0.004,
    headTiltZRad: -0.02,
    indicatorBadge: '⚠️ CONCERNED',
  },
  thinking: {
    id: 'thinking',
    label: 'Thinking',
    labelId: 'Berpikir Mendalam',
    eyeScaleY: 0.92,
    pupilOffsetX: 0.006,
    pupilOffsetY: 0.004,
    browLiftY: 0.006,
    browTiltRad: -0.08,
    mouthWidthScale: 0.86,
    mouthOpenScaleY: 0.9,
    mouthSmileOffsetY: 0,
    headTiltZRad: 0.045,
    indicatorBadge: '🧠 THINKING',
  },
};

export interface ResearchActionSpec {
  id: ResearchActionId;
  number: number;
  label: string;
  labelId: string;
  agentState: ResearchAgentState;
  clipName: ResearchAnimationClipName;
  targetAnchorName: ResearchAnchorType;
  approachAnchorName?: ResearchAnchorType;
  posture: 'standing' | 'seated';
  expression: ResearchExpressionId;
  prop: ResearchPropId;
  loopAction: boolean;
  bubbleText: string;
  thoughtText: string;
  description: string;
}

/**
 * 18 Required Research Professor Actions mapped to verified room-local anchors,
 * embedded animation clips, facial expressions, and contextual handheld props
 * (Sections 14, 19, and 20).
 */
export const RESEARCH_ACTIONS: Record<ResearchActionId, ResearchActionSpec> = {
  IDLE: {
    id: 'IDLE',
    number: 1,
    label: 'Idle',
    labelId: '1. Idle',
    agentState: 'IDLE',
    clipName: 'Idle_Breathing',
    targetAnchorName: 'RESEARCH_ROOM_IDLE',
    posture: 'standing',
    expression: 'neutral',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Siap menelaah literatur & konteks Shared Brain [DEMO].',
    thoughtText: 'Status: IDLE — Menunggu tugas riset atau telaah referensi.',
    description: 'Calm academic standing pose on the central Knowledge Atelier rug with subtle breathing.',
  },
  WALK_PATROL: {
    id: 'WALK_PATROL',
    number: 2,
    label: 'Walk Patrol',
    labelId: '2. Jalan',
    agentState: 'MOVING',
    clipName: 'Walk_Cycle',
    targetAnchorName: 'RESEARCH_KNOWLEDGE_ATLAS',
    posture: 'standing',
    expression: 'neutral',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Meninjau koridor literatur & zona Knowledge Atelier...',
    thoughtText: 'Status: MOVING — Berjalan mengelilingi empat zona riset.',
    description: 'Gentle, measured senior-professor walk cycle across validated room-local anchors.',
  },
  READ_RESEARCH_BOOK: {
    id: 'READ_RESEARCH_BOOK',
    number: 3,
    label: 'Read Research Book',
    labelId: '3. Baca Buku',
    agentState: 'READING',
    clipName: 'Read_Research_Book',
    targetAnchorName: 'RESEARCH_ROOM_IDLE',
    posture: 'standing',
    expression: 'focused',
    prop: 'research_book',
    loopAction: true,
    bubbleText: 'Membaca monograf riset & menandai kutipan utama [DEMO].',
    thoughtText: 'Status: READING — Menelaah halaman buku referensi Shared Brain.',
    description: 'Signature animation holding an open research book with green Shared Brain emblem and scanning pages.',
  },
  RESEARCH_DESK_WORK: {
    id: 'RESEARCH_DESK_WORK',
    number: 4,
    label: 'Research Desk Work',
    labelId: '4. Kerja di Meja',
    agentState: 'RESEARCHING',
    clipName: 'Research_Desk_Work',
    targetAnchorName: 'RESEARCH_DESK_WORK',
    approachAnchorName: 'RESEARCH_DESK_APPROACH',
    posture: 'seated',
    expression: 'focused',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Menyusun sintesis literatur di meja Profesor [DEMO].',
    thoughtText: 'Status: RESEARCHING — Kerja riset terfokus di stasiun Profesor.',
    description: 'Navigates via approach anchor, sits in the Scholar Chair facing North (+Z), and works on research monitor & manuscript notes.',
  },
  SEARCH_REFERENCES_DEMO: {
    id: 'SEARCH_REFERENCES_DEMO',
    number: 5,
    label: 'Search References (Demo)',
    labelId: '5. Cari Referensi (Demo)',
    agentState: 'SEARCHING_REFERENCES_DEMO',
    clipName: 'Search_References_Demo',
    targetAnchorName: 'RESEARCH_DESK_WORK',
    approachAnchorName: 'RESEARCH_DESK_APPROACH',
    posture: 'seated',
    expression: 'curious',
    prop: 'research_paper',
    loopAction: true,
    bubbleText: 'Menelusuri indeks kutipan & katalog sumber [SIMULASI / DEMO].',
    thoughtText: 'Status: SEARCHING_REFERENCES_DEMO — Simulasi visual pencarian referensi.',
    description: 'Reviews fictional reference index on the workstation monitor and cross-checks a research manuscript (visual demo only).',
  },
  INSPECT_KNOWLEDGE_ATLAS: {
    id: 'INSPECT_KNOWLEDGE_ATLAS',
    number: 6,
    label: 'Inspect Knowledge Atlas',
    labelId: '6. Inspeksi Knowledge Atlas',
    agentState: 'INSPECTING_KNOWLEDGE',
    clipName: 'Inspect_Knowledge_Atlas',
    targetAnchorName: 'RESEARCH_KNOWLEDGE_ATLAS',
    posture: 'standing',
    expression: 'curious',
    prop: 'tablet',
    loopAction: true,
    bubbleText: 'Memetakan relasi simpul di Shared Brain Knowledge Atlas [DEMO].',
    thoughtText: 'Status: INSPECTING_KNOWLEDGE — Menelaah peta relasi topik.',
    description: 'Walks to the North feature wall, faces the Shared Brain Knowledge Atlas, and inspects connected knowledge nodes.',
  },
  ANALYZE_EVIDENCE: {
    id: 'ANALYZE_EVIDENCE',
    number: 7,
    label: 'Analyze Evidence',
    labelId: '7. Analisis Evidence',
    agentState: 'ANALYZING_EVIDENCE',
    clipName: 'Analyze_Evidence',
    targetAnchorName: 'RESEARCH_EVIDENCE_BOARD',
    posture: 'standing',
    expression: 'focused',
    prop: 'clipboard',
    loopAction: true,
    bubbleText: 'Memeriksa kartu bukti & kronologi sumber di Evidence Board [DEMO].',
    thoughtText: 'Status: ANALYZING_EVIDENCE — Analisis struktur bukti & provenance.',
    description: 'Inspects the West-wall Evidence & Source Verification Pinboard with focused pointing and verification gestures.',
  },
  COMPARE_SOURCES: {
    id: 'COMPARE_SOURCES',
    number: 8,
    label: 'Compare Sources',
    labelId: '8. Bandingkan Sumber',
    agentState: 'COMPARING_SOURCES',
    clipName: 'Compare_Sources',
    targetAnchorName: 'RESEARCH_READING_TABLE',
    posture: 'seated',
    expression: 'thinking',
    prop: 'tablet',
    loopAction: true,
    bubbleText: 'Membandingkan dua dokumen sumber secara berdampingan [DEMO].',
    thoughtText: 'Status: COMPARING_SOURCES — Evaluasi silang folio & tablet referensi.',
    description: 'Sits at the Octagonal Evidence & Reading Table comparing open folio pages with a reference tablet.',
  },
  ORGANIZE_ARCHIVE: {
    id: 'ORGANIZE_ARCHIVE',
    number: 9,
    label: 'Organize Archive',
    labelId: '9. Kelola Arsip',
    agentState: 'ORGANIZING_ARCHIVE',
    clipName: 'Organize_Archive',
    targetAnchorName: 'RESEARCH_BOOKSHELF_ACCESS',
    posture: 'standing',
    expression: 'focused',
    prop: 'reference_folder',
    loopAction: true,
    bubbleText: 'Menata arsip literatur & indeks pustaka di rak utama [DEMO].',
    thoughtText: 'Status: ORGANIZING_ARCHIVE — Kurasi koleksi arsip Knowledge Atelier.',
    description: 'Approaches the West Knowledge Archive Library bookcase and performs an archival sorting & retrieval gesture.',
  },
  WRITE_RESEARCH_NOTES: {
    id: 'WRITE_RESEARCH_NOTES',
    number: 10,
    label: 'Write Research Notes',
    labelId: '10. Tulis Catatan',
    agentState: 'WRITING_NOTES',
    clipName: 'Write_Research_Notes',
    targetAnchorName: 'RESEARCH_ARCHIVE_DRAWER',
    posture: 'standing',
    expression: 'focused',
    prop: 'notebook',
    loopAction: true,
    bubbleText: 'Mencatat anotasi metodologi di buku catatan riset [DEMO].',
    thoughtText: 'Status: WRITING_NOTES — Menulis ringkasan anotasi pada buku catatan.',
    description: 'Stands by the Card Catalog Console writing scholarly annotations into a handheld notebook.',
  },
  THINK_RESEARCH: {
    id: 'THINK_RESEARCH',
    number: 11,
    label: 'Think Research',
    labelId: '11. Berpikir',
    agentState: 'THINKING',
    clipName: 'Think_Research',
    targetAnchorName: 'RESEARCH_ROOM_IDLE',
    posture: 'standing',
    expression: 'thinking',
    prop: 'research_book',
    loopAction: true,
    bubbleText: 'Merumuskan hipotesis & sintesis konseptual...',
    thoughtText: 'Status: THINKING — Kontemplasi akademik & perumusan kerangka riset.',
    description: 'Thoughtful academic pose with subtle head tilt and hand-to-chin contemplation gesture.',
  },
  DISCUSS_RESEARCH: {
    id: 'DISCUSS_RESEARCH',
    number: 12,
    label: 'Discuss Research',
    labelId: '12. Diskusi Riset',
    agentState: 'DISCUSSING',
    clipName: 'Discuss_Research',
    targetAnchorName: 'RESEARCH_ROOM_IDLE',
    posture: 'standing',
    expression: 'talking',
    prop: 'research_book',
    loopAction: true,
    bubbleText: 'Menjelaskan konteks literatur untuk kolaborasi lintas tim [DEMO].',
    thoughtText: 'Status: DISCUSSING — Diskusi ilmiah & penjelasan referensi.',
    description: 'Natural scholarly conversation gesture with expressive hand articulation and talking expression.',
  },
  PRESENT_FINDINGS: {
    id: 'PRESENT_FINDINGS',
    number: 13,
    label: 'Present Findings',
    labelId: '13. Presentasi Temuan',
    agentState: 'PRESENTING',
    clipName: 'Present_Findings',
    targetAnchorName: 'RESEARCH_PRESENTATION_POSITION',
    posture: 'standing',
    expression: 'pleased',
    prop: 'clipboard',
    loopAction: true,
    bubbleText: 'Mempresentasikan temuan riset & peta konteks Shared Brain [DEMO].',
    thoughtText: 'Status: PRESENTING — Paparan hasil sintesis di depan Knowledge Atlas.',
    description: 'Walks to the Presentation Position beside the Shared Brain Knowledge Atlas and points to key display regions.',
  },
  CONSULT_SHARED_BRAIN_DEMO: {
    id: 'CONSULT_SHARED_BRAIN_DEMO',
    number: 14,
    label: 'Consult Shared Brain (Demo)',
    labelId: '14. Konsultasi Shared Brain (Demo)',
    agentState: 'CONSULTING_SHARED_BRAIN_DEMO',
    clipName: 'Consult_Shared_Brain_Demo',
    targetAnchorName: 'RESEARCH_KNOWLEDGE_ATLAS',
    posture: 'standing',
    expression: 'idea',
    prop: 'tablet',
    loopAction: true,
    bubbleText: 'Meninjau 3 lapis Shared Brain (Org / Project / Agent) [SIMULASI / DEMO].',
    thoughtText: 'Status: CONSULTING_SHARED_BRAIN_DEMO — Simulasi visual konsultasi memori.',
    description: 'Interacts visually with the 3-layer Shared Brain Knowledge Atlas (Organization, Project, and Agent Context — DEMO only).',
  },
  PREPARE_RESEARCH_SUMMARY: {
    id: 'PREPARE_RESEARCH_SUMMARY',
    number: 15,
    label: 'Prepare Research Summary',
    labelId: '15. Siapkan Ringkasan',
    agentState: 'PREPARING_SUMMARY',
    clipName: 'Prepare_Research_Summary',
    targetAnchorName: 'RESEARCH_READING_TABLE',
    posture: 'seated',
    expression: 'focused',
    prop: 'research_paper',
    loopAction: true,
    bubbleText: 'Menyusun ringkasan eksekutif & daftar rujukan terverifikasi [DEMO].',
    thoughtText: 'Status: PREPARING_SUMMARY — Penulisan ikhtisar temuan riset.',
    description: 'Sits at the reading table reviewing a manuscript document and drafting a structured research summary.',
  },
  COFFEE_BREAK: {
    id: 'COFFEE_BREAK',
    number: 16,
    label: 'Coffee Break',
    labelId: '16. Coffee Break',
    agentState: 'COFFEE_BREAK',
    clipName: 'Coffee_Break',
    targetAnchorName: 'RESEARCH_REFERENCE_REVIEW',
    posture: 'standing',
    expression: 'pleased',
    prop: 'coffee_cup',
    loopAction: true,
    bubbleText: 'Menikmati kopi hangat sejenak di dekat credenza referensi.',
    thoughtText: 'Status: COFFEE_BREAK — Rehat singkat Profesor Riset.',
    description: 'Stands near the East Reference Credenza holding a scholarly coffee mug with modest sipping motion.',
  },
  WAITING_FOR_REVIEW: {
    id: 'WAITING_FOR_REVIEW',
    number: 17,
    label: 'Waiting For Review',
    labelId: '17. Menunggu Review',
    agentState: 'WAITING_REVIEW',
    clipName: 'Waiting_For_Review',
    targetAnchorName: 'RESEARCH_ROOM_SPAWN',
    posture: 'standing',
    expression: 'neutral',
    prop: 'reference_folder',
    loopAction: true,
    bubbleText: 'Berkas ringkasan siap ditinjau oleh PM / CEO [SIMULASI / DEMO].',
    thoughtText: 'Status: WAITING_REVIEW — Menunggu tinjauan tanpa mengklaim persetujuan otomatis.',
    description: 'Calm waiting posture near the South corridor threshold holding an archival reference dossier.',
  },
  RESEARCH_COMPLETED: {
    id: 'RESEARCH_COMPLETED',
    number: 18,
    label: 'Research Completed',
    labelId: '18. Riset Selesai',
    agentState: 'COMPLETED',
    clipName: 'Research_Completed',
    targetAnchorName: 'RESEARCH_ROOM_IDLE',
    posture: 'standing',
    expression: 'pleased',
    prop: 'research_book',
    loopAction: false,
    bubbleText: 'Sintesis riset & paket referensi selesai disiapkan [DEMO]!',
    thoughtText: 'Status: COMPLETED — Acknowledgment selesai & kembali ke posisi tenang.',
    description: 'Professional positive acknowledgment with a warm academic nod and pleased expression.',
  },
};

export const RESEARCH_ACTION_LIST: readonly ResearchActionSpec[] = Object.values(
  RESEARCH_ACTIONS,
).sort((a, b) => a.number - b.number);

export interface ResearchDemoStep {
  stepIndex: number;
  actionId: ResearchActionId;
  label: string;
  holdDurationSec: number;
}

/**
 * 14-Step Automatic Research Demo Sequence (`Jalankan Demo Research`)
 * following Section 21 of the specification.
 */
export const RESEARCH_AUTO_DEMO_SEQUENCE: readonly ResearchDemoStep[] = [
  {
    stepIndex: 1,
    actionId: 'IDLE',
    label: '1. Idle at Knowledge Atelier Center',
    holdDurationSec: 2.0,
  },
  {
    stepIndex: 2,
    actionId: 'ORGANIZE_ARCHIVE',
    label: '2. Walk to Library & Organize Archive',
    holdDurationSec: 3.4,
  },
  {
    stepIndex: 3,
    actionId: 'READ_RESEARCH_BOOK',
    label: '3. Read Research Book',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 4,
    actionId: 'WRITE_RESEARCH_NOTES',
    label: '4. Write Research Notes at Card Catalog',
    holdDurationSec: 3.4,
  },
  {
    stepIndex: 5,
    actionId: 'RESEARCH_DESK_WORK',
    label: '5. Walk to Workstation & Desk Work',
    holdDurationSec: 3.8,
  },
  {
    stepIndex: 6,
    actionId: 'SEARCH_REFERENCES_DEMO',
    label: '6. Search References Demo at Workstation',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 7,
    actionId: 'COMPARE_SOURCES',
    label: '7. Compare Sources at Reading Table',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 8,
    actionId: 'ANALYZE_EVIDENCE',
    label: '8. Analyze Evidence at Verification Board',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 9,
    actionId: 'INSPECT_KNOWLEDGE_ATLAS',
    label: '9. Walk to Knowledge Atlas & Inspect Nodes',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 10,
    actionId: 'CONSULT_SHARED_BRAIN_DEMO',
    label: '10. Consult Shared Brain Demo (3 Layers)',
    holdDurationSec: 3.8,
  },
  {
    stepIndex: 11,
    actionId: 'PREPARE_RESEARCH_SUMMARY',
    label: '11. Prepare Research Summary at Reading Table',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 12,
    actionId: 'PRESENT_FINDINGS',
    label: '12. Present Findings at Knowledge Atlas',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 13,
    actionId: 'RESEARCH_COMPLETED',
    label: '13. Research Completed Acknowledgment',
    holdDurationSec: 2.8,
  },
  {
    stepIndex: 14,
    actionId: 'IDLE',
    label: '14. Return to Idle at Atelier Center',
    holdDurationSec: 2.2,
  },
] as const;

export const RESEARCH_PATROL_ANCHOR_RING: readonly ResearchAnchorType[] = [
  'RESEARCH_ROOM_IDLE',
  'RESEARCH_BOOKSHELF_ACCESS',
  'RESEARCH_ARCHIVE_DRAWER',
  'RESEARCH_KNOWLEDGE_ATLAS',
  'RESEARCH_PRESENTATION_POSITION',
  'RESEARCH_DESK_APPROACH',
  'RESEARCH_REFERENCE_REVIEW',
  'RESEARCH_READING_TABLE',
  'RESEARCH_EVIDENCE_BOARD',
] as const;

export interface ResearchNavWaypoint {
  id: string;
  position: [number, number]; // [x, z]
  neighbors: string[];
}

/**
 * Collision-free navigation waypoint graph for Research Professor inside `AI_OFFICE_ROOM_RESEARCH_v1` (8×8 m).
 * Ensures the Professor never walks through:
 * - Zone A West Bookcase (`X = 0.28..0.88`, `Z = 4.90..7.40`) or Card Catalog (`X = 0.28..0.80`, `Z = 3.92..4.78`)
 * - Zone B Professor Desk (`X = 4.70..6.60`, `Z = 5.31..6.19`) or Scholar Chair (`X = 5.33..5.97`, `Z = 4.47..5.09`)
 * - Zone B East Reference Credenza (`X = 7.01..7.55`, `Z = 1.77..3.53`)
 * - Zone D Octagonal Reading Table (`X = 1.19..2.31`, `Z = 1.59..2.71`)
 */
export const RESEARCH_WALK_WAYPOINTS: Record<string, ResearchNavWaypoint> = {
  WP_SOUTH_SPAWN: {
    id: 'WP_SOUTH_SPAWN',
    position: [4.0, 0.95],
    neighbors: ['WP_SOUTH_EXIT', 'WP_IDLE_CENTER', 'WP_READING_EAST', 'WP_CREDENZA_WEST'],
  },
  WP_SOUTH_EXIT: {
    id: 'WP_SOUTH_EXIT',
    position: [4.0, 0.45],
    neighbors: ['WP_SOUTH_SPAWN'],
  },
  WP_IDLE_CENTER: {
    id: 'WP_IDLE_CENTER',
    position: [3.85, 3.65],
    neighbors: [
      'WP_SOUTH_SPAWN',
      'WP_ARCHIVE_DRAWER',
      'WP_BOOKSHELF',
      'WP_ATLAS_SOUTH',
      'WP_DESK_APPROACH',
      'WP_READING_EAST',
      'WP_CREDENZA_WEST',
    ],
  },
  WP_ARCHIVE_DRAWER: {
    id: 'WP_ARCHIVE_DRAWER',
    position: [1.32, 4.35],
    neighbors: ['WP_IDLE_CENTER', 'WP_BOOKSHELF', 'WP_EVIDENCE_NORTH'],
  },
  WP_BOOKSHELF: {
    id: 'WP_BOOKSHELF',
    position: [1.32, 6.05],
    neighbors: ['WP_ARCHIVE_DRAWER', 'WP_IDLE_CENTER', 'WP_ATLAS_VIEW'],
  },
  WP_ATLAS_VIEW: {
    id: 'WP_ATLAS_VIEW',
    position: [2.95, 6.65],
    neighbors: ['WP_BOOKSHELF', 'WP_ATLAS_SOUTH', 'WP_PRESENTATION'],
  },
  WP_PRESENTATION: {
    id: 'WP_PRESENTATION',
    position: [3.45, 6.25],
    neighbors: ['WP_ATLAS_VIEW', 'WP_ATLAS_SOUTH', 'WP_DESK_APPROACH'],
  },
  WP_ATLAS_SOUTH: {
    id: 'WP_ATLAS_SOUTH',
    position: [3.45, 5.05],
    neighbors: ['WP_IDLE_CENTER', 'WP_ATLAS_VIEW', 'WP_PRESENTATION', 'WP_DESK_APPROACH'],
  },
  WP_DESK_APPROACH: {
    id: 'WP_DESK_APPROACH',
    position: [4.55, 4.78],
    neighbors: ['WP_IDLE_CENTER', 'WP_ATLAS_SOUTH', 'WP_PRESENTATION', 'WP_DESK_CHAIR', 'WP_CREDENZA_WEST'],
  },
  WP_DESK_CHAIR: {
    id: 'WP_DESK_CHAIR',
    position: [5.65, 4.88],
    neighbors: ['WP_DESK_APPROACH'],
  },
  WP_CREDENZA_WEST: {
    id: 'WP_CREDENZA_WEST',
    position: [6.48, 2.65],
    neighbors: ['WP_IDLE_CENTER', 'WP_DESK_APPROACH', 'WP_SOUTH_SPAWN'],
  },
  WP_READING_EAST: {
    id: 'WP_READING_EAST',
    position: [2.52, 2.15],
    neighbors: ['WP_IDLE_CENTER', 'WP_SOUTH_SPAWN', 'WP_EVIDENCE_NORTH', 'WP_EVIDENCE_SOUTH'],
  },
  WP_EVIDENCE_NORTH: {
    id: 'WP_EVIDENCE_NORTH',
    position: [1.35, 3.25],
    neighbors: ['WP_ARCHIVE_DRAWER', 'WP_READING_EAST', 'WP_EVIDENCE_BOARD'],
  },
  WP_EVIDENCE_SOUTH: {
    id: 'WP_EVIDENCE_SOUTH',
    position: [1.65, 1.15],
    neighbors: ['WP_READING_EAST', 'WP_EVIDENCE_BOARD'],
  },
  WP_EVIDENCE_BOARD: {
    id: 'WP_EVIDENCE_BOARD',
    position: [1.05, 2.15],
    neighbors: ['WP_EVIDENCE_NORTH', 'WP_EVIDENCE_SOUTH'],
  },
};

export function getResearchAnchorOrThrow(anchorName: ResearchAnchorType | string): ResearchActivityAnchor {
  const found = DEFAULT_RESEARCH_ANCHORS.find(
    (a) => a.id === anchorName || a.anchor_name === anchorName,
  );
  if (!found) {
    throw new Error(`Unknown Research Room anchor "${anchorName}" for Research Professor.`);
  }
  return found;
}

function dist2D(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function findNearestResearchWaypointId(xz: [number, number]): string {
  let bestId = 'WP_IDLE_CENTER';
  let bestDist = Infinity;
  for (const wp of Object.values(RESEARCH_WALK_WAYPOINTS)) {
    const d = dist2D(xz, wp.position);
    if (d < bestDist) {
      bestDist = d;
      bestId = wp.id;
    }
  }
  return bestId;
}

/**
 * Computes a collision-free waypoint path `[x, z][]` inside the 8×8 Research & Shared Brain Room
 * for the Research Professor agent. Automatically routes via `WP_DESK_APPROACH` when entering or
 * leaving `RESEARCH_DESK_WORK`.
 */
export function findResearchWalkablePath(
  startXZ: [number, number],
  goalXZ: [number, number],
): [number, number][] {
  if (dist2D(startXZ, goalXZ) <= 0.18) {
    return [goalXZ];
  }

  const startWp = findNearestResearchWaypointId(startXZ);
  const goalWp = findNearestResearchWaypointId(goalXZ);

  if (startWp === goalWp) {
    return [RESEARCH_WALK_WAYPOINTS[goalWp].position, goalXZ];
  }

  const distMap: Record<string, number> = {};
  const prevMap: Record<string, string | null> = {};
  const unvisited = new Set<string>(Object.keys(RESEARCH_WALK_WAYPOINTS));

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

    const wp = RESEARCH_WALK_WAYPOINTS[u];
    for (const nb of wp.neighbors) {
      if (!unvisited.has(nb)) continue;
      const alt = distMap[u] + dist2D(wp.position, RESEARCH_WALK_WAYPOINTS[nb].position);
      if (alt < distMap[nb]) {
        distMap[nb] = alt;
        prevMap[nb] = u;
      }
    }
  }

  const chain: [number, number][] = [];
  let curr: string | null = goalWp;
  while (curr) {
    chain.unshift(RESEARCH_WALK_WAYPOINTS[curr].position);
    curr = prevMap[curr];
  }

  const last = chain[chain.length - 1];
  if (!last || dist2D(last, goalXZ) > 0.04) {
    chain.push(goalXZ);
  }

  const margin = 0.42;
  return chain.map(([x, z]) => [
    Math.min(RESEARCH_MODULE_CONSTANTS.FOOTPRINT_WIDTH - margin, Math.max(margin, x)),
    Math.min(RESEARCH_MODULE_CONSTANTS.FOOTPRINT_DEPTH - margin, Math.max(margin, z)),
  ]);
}

export interface ResearchSimulationRuntimeStatus {
  characterId: string;
  displayName: string;
  currentState: ResearchAgentState;
  currentActionId: ResearchActionId;
  currentActionLabel: string;
  activeClipName: ResearchAnimationClipName;
  currentAnchorId: ResearchAnchorType;
  targetAnchorId: ResearchAnchorType;
  currentExpression: ResearchExpressionId;
  posture: 'standing' | 'seated';
  handheldProp: ResearchPropId;
  isWalking: boolean;
  isPaused: boolean;
  patrolActive: boolean;
  autoDemoActive: boolean;
  autoDemoStepIndex: number;
  autoDemoTotalSteps: number;
  speedMultiplier: ResearchSpeedMultiplier;
  glassesVisible: boolean;
  backpackVisible: boolean;
  backpackAutoHiddenForSeat: boolean;
  bubbleText: string;
  thoughtText: string;
  worldPosition: [number, number, number];
  facingRad: number;
}
