/**
 * Pure domain specification for AI Office Engineering Agent 03:
 * Database Developer / Database Administrator
 * (`database_developer_agent` / `ai_office.character.database_developer_agent.v1`)
 * inside `AI_OFFICE_ROOM_ENGINEERING_v1` (Engineering Studio, 8×16 m).
 *
 * Free of Three.js so it can be unit-tested with `node:test` and serialized
 * into `database_developer_agent.manifest.json` and `database_developer_agent.behavior.json`.
 */

import {
  ENGINEERING_ANCHORS,
  ENGINEERING_ROOM_DIMENSIONS,
  type EngineeringAnchorSpec,
} from './engineeringRoomSpec';

export const DATABASE_CHARACTER_CONSTANTS = {
  CHARACTER_ID: 'database_developer_agent',
  ASSET_ID: 'ai_office.character.database_developer_agent.v1',
  DISPLAY_NAME: 'Database Developer',
  ALTERNATIVE_ROLE_LABEL: 'Database Engineer / Database Administrator',
  DEPARTMENT: 'Engineering',
  ROOM_ID: 'AI_OFFICE_ROOM_ENGINEERING_v1',
  ROLE_TYPE: 'DATABASE_ENGINEER',
  ROOT_NODE_NAME: 'Database_Developer_Agent_Root',
  RUNTIME_ROOT_NAME: 'DATABASE_AGENT_RUNTIME_ROOT',
  SCHEMA_VERSION: '1.0.0',
  TARGET_HEIGHT_M: 1.725,
  GROUND_Y: 0.0,
  SEATED_HIP_DROP_Y: -0.175,
  WALK_SPEED_MPS: 1.9,
  ARRIVAL_THRESHOLD_M: 0.06,
  ROTATION_LERP_RATE: 11.0,
  DEFAULT_IDLE_ANCHOR: 'DB_WORKSTATION_APPROACH',
  DEFAULT_SPAWN_ANCHOR: 'DB_WORKSTATION_APPROACH',
} as const;

export type DatabaseAgentState =
  | 'IDLE'
  | 'MOVING'
  | 'WORKING'
  | 'SCHEMA_DESIGN'
  | 'ERD_ANALYSIS'
  | 'SQL_DEVELOPMENT'
  | 'QUERY_OPTIMIZATION'
  | 'DATA_VALIDATION_DEMO'
  | 'MIGRATION_REVIEW'
  | 'DATABASE_MAINTENANCE_DEMO'
  | 'TROUBLESHOOTING'
  | 'BACKEND_DEPENDENCY_REVIEW'
  | 'PRESENTING'
  | 'READING'
  | 'THINKING'
  | 'DISCUSSING'
  | 'COFFEE_BREAK'
  | 'WAITING_REVIEW'
  | 'COMPLETED'
  | 'BLOCKED_DEMO';

export type DatabaseActionId =
  | 'IDLE'
  | 'WALK_PATROL'
  | 'WORK_TYPING'
  | 'SCHEMA_DESIGN'
  | 'ERD_ANALYSIS'
  | 'SQL_QUERY_DEVELOPMENT'
  | 'QUERY_OPTIMIZATION'
  | 'DATA_INTEGRITY_CHECK'
  | 'MIGRATION_REVIEW'
  | 'DATABASE_MAINTENANCE_DEMO'
  | 'TROUBLESHOOT_DATABASE'
  | 'REVIEW_BACKEND_DEPENDENCY'
  | 'PRESENT_DATA_MODEL'
  | 'READ_DOCUMENTATION'
  | 'THINK_PLAN'
  | 'TECHNICAL_DISCUSSION'
  | 'COFFEE_BREAK'
  | 'WAITING_REVIEW'
  | 'TASK_COMPLETED';

export type DatabaseAnimationClipName =
  | 'Idle_Breathing'
  | 'Walk_Cycle'
  | 'Sit_Down'
  | 'Stand_Up'
  | 'Work_Typing'
  | 'Schema_Design'
  | 'ERD_Analysis'
  | 'SQL_Query_Development'
  | 'Query_Optimization'
  | 'Data_Integrity_Check'
  | 'Migration_Review'
  | 'Database_Maintenance_Demo'
  | 'Troubleshoot_Database'
  | 'Review_Backend_Dependency'
  | 'Present_Data_Model'
  | 'Read_Documentation'
  | 'Think_Plan'
  | 'Technical_Discussion'
  | 'Coffee_Break'
  | 'Waiting_Review'
  | 'Task_Completed';

export const DATABASE_REQUIRED_ANIMATION_CLIPS: readonly DatabaseAnimationClipName[] = [
  'Idle_Breathing',
  'Walk_Cycle',
  'Sit_Down',
  'Stand_Up',
  'Work_Typing',
  'Schema_Design',
  'ERD_Analysis',
  'SQL_Query_Development',
  'Query_Optimization',
  'Data_Integrity_Check',
  'Migration_Review',
  'Database_Maintenance_Demo',
  'Troubleshoot_Database',
  'Review_Backend_Dependency',
  'Present_Data_Model',
  'Read_Documentation',
  'Think_Plan',
  'Technical_Discussion',
  'Coffee_Break',
  'Waiting_Review',
  'Task_Completed',
] as const;

export type DatabaseExpressionId =
  | 'neutral'
  | 'happy'
  | 'focused'
  | 'thinking'
  | 'concerned'
  | 'surprised'
  | 'talking'
  | 'confident'
  | 'tired';

export type DatabasePropId =
  | 'none'
  | 'db_laptop'
  | 'schema_tablet'
  | 'sql_reference_book'
  | 'schema_document'
  | 'schema_clipboard'
  | 'coffee_cup'
  | 'db_model_card';

export type DatabaseAnimationPlaybackCommand =
  | 'play'
  | 'pause'
  | 'resume'
  | 'restart'
  | 'reset_idle';

export type DatabaseSpeedMultiplier = 0.5 | 1 | 1.5;

/**
 * 5-Material Layered Dark Chestnut-Brown Voxel Hair Palette for Database Developer:
 * - Deep chocolate brown base
 * - Dark espresso shadow underlayers
 * - Warm chestnut midtone layers
 * - Soft warm brown crown/fringe highlights
 * - Restrained burgundy-brown dimensional accent
 */
export interface DatabaseHairMaterialSpec {
  id: string;
  label: string;
  hex: string;
  roughness: number;
  metalness: number;
  role: string;
}

export const DATABASE_HAIR_MATERIAL_PALETTE: readonly DatabaseHairMaterialSpec[] = [
  {
    id: 'db_hair_base_dark_chestnut',
    label: 'Deep Chocolate Brown (Base)',
    hex: '#2D1C14',
    roughness: 0.88,
    metalness: 0.04,
    role: 'Primary upper crown volume, side layers, and rear mass',
  },
  {
    id: 'db_hair_shadow_espresso',
    label: 'Near-Black Brown (Shadow)',
    hex: '#1C110C',
    roughness: 0.92,
    metalness: 0.03,
    role: 'Lower nape taper, temple under-layers, and deep recess shadows',
  },
  {
    id: 'db_hair_mid_warm_brown',
    label: 'Dark Chestnut (Midtone)',
    hex: '#3D271D',
    roughness: 0.85,
    metalness: 0.05,
    role: 'Stepped crown tiers, side feathering, and mid-back layers',
  },
  {
    id: 'db_hair_highlight_soft_brown',
    label: 'Muted Warm Brown (Highlight)',
    hex: '#503528',
    roughness: 0.82,
    metalness: 0.06,
    role: 'Top elevated crown clusters and asymmetric front fringe tips',
  },
  {
    id: 'db_hair_accent_burgundy_brown',
    label: 'Restrained Burgundy-Brown (Accent)',
    hex: '#38201E',
    roughness: 0.86,
    metalness: 0.04,
    role: 'Subtle warm-toned lateral and rear stepped cluster variation',
  },
] as const;

export const DATABASE_OUTFIT_PALETTE = {
  skinWarmBeige: '#F2C9A7',
  skinShadeWarm: '#DFA985',
  cheekAccent: '#E4A088',
  eyeDark: '#15181E',
  pupilBlack: '#0A0C10',
  eyeHighlight: '#F8FAFC',
  jacketCharcoalPrimary: '#1B2026',
  jacketCharcoalPanel: '#242B33',
  jacketEmeraldAccent: '#10B981',
  jacketEmeraldDeep: '#059669',
  jacketOliveAccent: '#4D7C0F',
  innerShirtLight: '#E8ECEF',
  trousersDarkNavyCharcoal: '#181E29',
  sneakerWhiteUpper: '#F1F5F9',
  sneakerLightGrayTrim: '#94A3B8',
  sneakerEmeraldTab: '#10B981',
  backpackDarkBody: '#161A20',
  backpackEmeraldPanel: '#10B981',
  backpackOliveTrim: '#4D7C0F',
} as const;

export interface DatabaseActionSpec {
  id: DatabaseActionId;
  number: number;
  label: string;
  labelId: string;
  agentState: DatabaseAgentState;
  clipName: DatabaseAnimationClipName;
  targetAnchorName: string;
  posture: 'standing' | 'seated';
  expression: DatabaseExpressionId;
  prop: DatabasePropId;
  loopAction: boolean;
  bubbleText: string;
  thoughtText: string;
  description: string;
}

export const DATABASE_ACTIONS: Record<DatabaseActionId, DatabaseActionSpec> = {
  IDLE: {
    id: 'IDLE',
    number: 1,
    label: 'Idle Stand',
    labelId: 'Idle (Berdiri Tenang)',
    agentState: 'IDLE',
    clipName: 'Idle_Breathing',
    targetAnchorName: 'DB_WORKSTATION_APPROACH',
    posture: 'standing',
    expression: 'neutral',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Skema database stabil. Siap merancang relasi tabel dan optimasi query.',
    thoughtText: 'Status Demo: Pool koneksi sehat, indeks utama tervalidasi.',
    description: 'Relaxed standing breathing posture near the Database workstation approach.',
  },
  WALK_PATROL: {
    id: 'WALK_PATROL',
    number: 2,
    label: 'Walk / Patrol',
    labelId: 'Jalan (Patroli Studio)',
    agentState: 'MOVING',
    clipName: 'Walk_Cycle',
    targetAnchorName: 'DB_WORKSTATION_APPROACH',
    posture: 'standing',
    expression: 'neutral',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Berjalan memeriksa papan skema, hub integrasi, dan meja kerja database...',
    thoughtText: 'Status Demo: Menavigasi jalur aman di Engineering Studio 8×16.',
    description: 'Walks along a collision-free patrol loop between Database and Integration anchors.',
  },
  WORK_TYPING: {
    id: 'WORK_TYPING',
    number: 3,
    label: 'Work / Typing',
    labelId: 'Kerja di Meja',
    agentState: 'WORKING',
    clipName: 'Work_Typing',
    targetAnchorName: 'DB_DESK_WORK',
    posture: 'seated',
    expression: 'focused',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Mengetik definisi tabel DDL dan skrip repositori data di workstation...',
    thoughtText: 'Status Demo: Menulis struktur tabel dan tipe kolom secara terstruktur.',
    description: 'Seated at the Database workstation desk typing facing the primary ERD monitor.',
  },
  SCHEMA_DESIGN: {
    id: 'SCHEMA_DESIGN',
    number: 4,
    label: 'Schema Design',
    labelId: 'Desain Schema',
    agentState: 'SCHEMA_DESIGN',
    clipName: 'Schema_Design',
    targetAnchorName: 'DB_DESK_WORK',
    posture: 'seated',
    expression: 'focused',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Merancang skema relasional, primary key, dan normalisasi entitas 3NF...',
    thoughtText: 'Status Demo: Membandingkan struktur tabel di layar utama dan sekunder.',
    description: 'Seated at the Database desk alternating between typing and inspecting dual schema displays.',
  },
  ERD_ANALYSIS: {
    id: 'ERD_ANALYSIS',
    number: 5,
    label: 'ERD Analysis',
    labelId: 'Analisis ERD',
    agentState: 'ERD_ANALYSIS',
    clipName: 'ERD_Analysis',
    targetAnchorName: 'DB_SCHEMA_REVIEW',
    posture: 'standing',
    expression: 'thinking',
    prop: 'schema_tablet',
    loopAction: true,
    bubbleText: 'Menganalisis kardinalitas Entity-Relationship Diagram (1:N dan N:M) pada papan arsip...',
    thoughtText: 'Status Demo: Memeriksa relasi antar entitas di DB_SCHEMA_REVIEW.',
    description: 'Stands at the Database Schema & Archive Board analyzing ERD relationships with a tablet.',
  },
  SQL_QUERY_DEVELOPMENT: {
    id: 'SQL_QUERY_DEVELOPMENT',
    number: 6,
    label: 'SQL Query Dev',
    labelId: 'SQL Query',
    agentState: 'SQL_DEVELOPMENT',
    clipName: 'SQL_Query_Development',
    targetAnchorName: 'DB_DESK_WORK',
    posture: 'seated',
    expression: 'focused',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Menyusun query SQL JOIN, CTE, dan agregasi analitik pada editor database...',
    thoughtText: 'Status Demo: Simulasi penulisan query terparameterisasi tanpa eksekusi live.',
    description: 'Seated at the Database desk writing SQL queries and inspecting simulated result sets.',
  },
  QUERY_OPTIMIZATION: {
    id: 'QUERY_OPTIMIZATION',
    number: 7,
    label: 'Query Optimization',
    labelId: 'Optimasi Query',
    agentState: 'QUERY_OPTIMIZATION',
    clipName: 'Query_Optimization',
    targetAnchorName: 'DB_DESK_WORK',
    posture: 'seated',
    expression: 'thinking',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Meninjau execution plan (EXPLAIN ANALYZE) dan menambahkan composite B-Tree index...',
    thoughtText: 'Status Demo: Mengurangi estimasi cost sequential scan pada layar monitor kedua.',
    description: 'Leans toward the SQL Query Plan monitor, pauses to analyze, and points at the index optimization.',
  },
  DATA_INTEGRITY_CHECK: {
    id: 'DATA_INTEGRITY_CHECK',
    number: 8,
    label: 'Data Integrity Check',
    labelId: 'Validasi Integritas Data',
    agentState: 'DATA_VALIDATION_DEMO',
    clipName: 'Data_Integrity_Check',
    targetAnchorName: 'DB_DESK_WORK',
    posture: 'seated',
    expression: 'focused',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Memvalidasi foreign key constraint, aturan NOT NULL, dan konsistensi transaksi ACID...',
    thoughtText: 'Status Demo: Pengecekan visual aturan integritas referensial.',
    description: 'Focused seated verification of database constraints and referential integrity rules.',
  },
  MIGRATION_REVIEW: {
    id: 'MIGRATION_REVIEW',
    number: 9,
    label: 'Migration Review',
    labelId: 'Review Migrasi',
    agentState: 'MIGRATION_REVIEW',
    clipName: 'Migration_Review',
    targetAnchorName: 'DB_SCHEMA_REVIEW',
    posture: 'standing',
    expression: 'focused',
    prop: 'schema_clipboard',
    loopAction: true,
    bubbleText: 'Meninjau rencana migrasi skema up/down yang aman dan backward-compatible...',
    thoughtText: 'Status Demo: Review dokumen migrasi tanpa menjalankan perubahan produksi.',
    description: 'Reviews a schema migration checklist on a clipboard at the Database Schema Archive.',
  },
  DATABASE_MAINTENANCE_DEMO: {
    id: 'DATABASE_MAINTENANCE_DEMO',
    number: 10,
    label: 'DB Maintenance (Demo)',
    labelId: 'Maintenance Database (Demo)',
    agentState: 'DATABASE_MAINTENANCE_DEMO',
    clipName: 'Database_Maintenance_Demo',
    targetAnchorName: 'DB_SCHEMA_REVIEW',
    posture: 'standing',
    expression: 'confident',
    prop: 'schema_tablet',
    loopAction: true,
    bubbleText: 'Meninjau kesehatan indeks, statistik tabel, dan organisasi penyimpanan logis (Simulasi)...',
    thoughtText: 'Status Demo: Evaluasi kesehatan skema & indeks (bukan operasi infrastruktur DevOps).',
    description: 'Demonstrates database-specific schema health and index review at the Schema Archive.',
  },
  TROUBLESHOOT_DATABASE: {
    id: 'TROUBLESHOOT_DATABASE',
    number: 11,
    label: 'Troubleshoot DB',
    labelId: 'Troubleshooting',
    agentState: 'TROUBLESHOOTING',
    clipName: 'Troubleshoot_Database',
    targetAnchorName: 'DB_DESK_WORK',
    posture: 'seated',
    expression: 'concerned',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Menginvestigasi simulasi lock contention dan bottleneck query pada tampilan diagnostik...',
    thoughtText: 'Status Demo: Menganalisis urutan transaksi untuk mencegah deadlock.',
    description: 'Seated investigation of a simulated database lock/query issue with concerned expression.',
  },
  REVIEW_BACKEND_DEPENDENCY: {
    id: 'REVIEW_BACKEND_DEPENDENCY',
    number: 12,
    label: 'Backend Dependency',
    labelId: 'Review Dependency Backend',
    agentState: 'BACKEND_DEPENDENCY_REVIEW',
    clipName: 'Review_Backend_Dependency',
    targetAnchorName: 'ENG_ARCHITECTURE_BOARD',
    posture: 'standing',
    expression: 'focused',
    prop: 'schema_document',
    loopAction: true,
    bubbleText: 'Menyelaraskan kontrak payload Backend dengan tipe kolom dan indeks tabel database...',
    thoughtText: 'Status Demo: Memastikan kesesuaian DTO layanan Backend dengan skema tabel.',
    description: 'Reviews Backend-to-Database data contracts at the Shared Architecture Board.',
  },
  PRESENT_DATA_MODEL: {
    id: 'PRESENT_DATA_MODEL',
    number: 13,
    label: 'Present Data Model',
    labelId: 'Presentasi Data Model',
    agentState: 'PRESENTING',
    clipName: 'Present_Data_Model',
    targetAnchorName: 'ENG_ARCHITECTURE_BOARD',
    posture: 'standing',
    expression: 'talking',
    prop: 'db_model_card',
    loopAction: true,
    bubbleText: 'Mempresentasikan arsitektur model data dan strategi partisi tabel di papan arsitektur...',
    thoughtText: 'Status Demo: Menjelaskan alur penyimpanan dari API menuju tabel relasional.',
    description: 'Presents the relational data model at the Shared Architecture Board with pointing gestures.',
  },
  READ_DOCUMENTATION: {
    id: 'READ_DOCUMENTATION',
    number: 14,
    label: 'Read Documentation',
    labelId: 'Baca Dokumentasi',
    agentState: 'READING',
    clipName: 'Read_Documentation',
    targetAnchorName: 'ENG_INTEGRATION_TABLE',
    posture: 'standing',
    expression: 'focused',
    prop: 'sql_reference_book',
    loopAction: true,
    bubbleText: 'Membaca referensi spesifikasi SQL, katalog indeks, dan dokumentasi kamus data...',
    thoughtText: 'Status Demo: Mempelajari spesifikasi tipe data dan isolasi transaksi.',
    description: 'Reads the SQL Reference Book at the Shared Integration Table.',
  },
  THINK_PLAN: {
    id: 'THINK_PLAN',
    number: 15,
    label: 'Think / Plan',
    labelId: 'Berpikir',
    agentState: 'THINKING',
    clipName: 'Think_Plan',
    targetAnchorName: 'DB_SCHEMA_REVIEW',
    posture: 'standing',
    expression: 'thinking',
    prop: 'none',
    loopAction: true,
    bubbleText: 'Memikirkan strategi normalisasi vs denormalisasi untuk performa pembacaan optimal...',
    thoughtText: 'Status Demo: Pose analitis hand-to-chin mengevaluasi trade-off desain data.',
    description: 'Analytical hand-to-chin thinking posture at the Database Schema Board.',
  },
  TECHNICAL_DISCUSSION: {
    id: 'TECHNICAL_DISCUSSION',
    number: 16,
    label: 'Technical Discussion',
    labelId: 'Diskusi Teknis',
    agentState: 'DISCUSSING',
    clipName: 'Technical_Discussion',
    targetAnchorName: 'ENG_DISCUSSION_POSITION',
    posture: 'standing',
    expression: 'talking',
    prop: 'schema_clipboard',
    loopAction: true,
    bubbleText: 'Berdiskusi mengenai sinkronisasi skema dan kontrak query di area kolaborasi...',
    thoughtText: 'Status Demo: Gestur diskusi teknis di titik kolaborasi selatan meja integrasi.',
    description: 'Standing technical discussion gesture at the South side of the Integration Hub table.',
  },
  COFFEE_BREAK: {
    id: 'COFFEE_BREAK',
    number: 17,
    label: 'Coffee Break',
    labelId: 'Istirahat Kopi',
    agentState: 'COFFEE_BREAK',
    clipName: 'Coffee_Break',
    targetAnchorName: 'DB_WORKSTATION_APPROACH',
    posture: 'standing',
    expression: 'happy',
    prop: 'coffee_cup',
    loopAction: true,
    bubbleText: 'Istirahat sejenak menikmati kopi hangat sambil merapikan catatan skema...',
    thoughtText: 'Status Demo: Rehat singkat sebelum melanjutkan optimasi indeks.',
    description: 'Holds a warm coffee mug and takes a calm sip near the Database workstation.',
  },
  WAITING_REVIEW: {
    id: 'WAITING_REVIEW',
    number: 18,
    label: 'Waiting Review',
    labelId: 'Menunggu Review',
    agentState: 'WAITING_REVIEW',
    clipName: 'Waiting_Review',
    targetAnchorName: 'ENG_CODE_REVIEW_POSITION',
    posture: 'standing',
    expression: 'tired',
    prop: 'db_laptop',
    loopAction: true,
    bubbleText: 'Menunggu review PR perubahan skema dan dokumentasi ERD di meja kolaborasi...',
    thoughtText: 'Status Demo: Menunggu ulasan rekan tim (belum dianggap disetujui otomatis).',
    description: 'Calm waiting posture holding a laptop at the East Code Review position.',
  },
  TASK_COMPLETED: {
    id: 'TASK_COMPLETED',
    number: 19,
    label: 'Task Completed',
    labelId: 'Tugas Selesai',
    agentState: 'COMPLETED',
    clipName: 'Task_Completed',
    targetAnchorName: 'DB_WORKSTATION_APPROACH',
    posture: 'standing',
    expression: 'confident',
    prop: 'none',
    loopAction: false,
    bubbleText: 'Desain skema, optimasi indeks, dan dokumentasi data model telah selesai!',
    thoughtText: 'Status Demo: Tugas pemodelan database selesai dan siap ditinjau.',
    description: 'Professional satisfied nod and positive completion gesture before returning to idle.',
  },
};

export const DATABASE_ACTION_LIST: readonly DatabaseActionSpec[] = Object.values(DATABASE_ACTIONS);

export interface DatabaseExpressionPreset {
  id: DatabaseExpressionId;
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

export const DATABASE_EXPRESSION_PRESETS: Record<DatabaseExpressionId, DatabaseExpressionPreset> = {
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
    mouthOpenScaleY: 1.15,
    mouthSmileOffsetY: 0.004,
  },
  focused: {
    id: 'focused',
    label: 'Focused',
    labelId: 'Fokus Query / Schema',
    eyeScaleY: 0.86,
    pupilOffsetX: 0.0,
    pupilOffsetY: 0.0,
    browLiftY: -0.004,
    browTiltRad: -0.1,
    mouthWidthScale: 0.9,
    mouthOpenScaleY: 0.85,
    mouthSmileOffsetY: 0.0,
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
  concerned: {
    id: 'concerned',
    label: 'Concerned',
    labelId: 'Serius / Troubleshoot',
    eyeScaleY: 0.82,
    pupilOffsetX: -0.002,
    pupilOffsetY: -0.002,
    browLiftY: -0.005,
    browTiltRad: -0.16,
    mouthWidthScale: 0.88,
    mouthOpenScaleY: 0.85,
    mouthSmileOffsetY: -0.003,
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
  talking: {
    id: 'talking',
    label: 'Talking',
    labelId: 'Berbicara / Presentasi',
    eyeScaleY: 1.02,
    pupilOffsetX: 0.0,
    pupilOffsetY: 0.0,
    browLiftY: 0.004,
    browTiltRad: 0.04,
    mouthWidthScale: 1.08,
    mouthOpenScaleY: 1.9,
    mouthSmileOffsetY: 0.002,
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
  tired: {
    id: 'tired',
    label: 'Tired / Waiting',
    labelId: 'Menunggu / Lelah',
    eyeScaleY: 0.64,
    pupilOffsetX: 0.0,
    pupilOffsetY: -0.003,
    browLiftY: -0.003,
    browTiltRad: 0.06,
    mouthWidthScale: 0.92,
    mouthOpenScaleY: 0.8,
    mouthSmileOffsetY: -0.002,
  },
};

export interface DatabaseDemoStep {
  stepIndex: number;
  actionId: DatabaseActionId;
  label: string;
  holdDurationSec: number;
}

/**
 * 12-Step Auto-Demo Sequence for Database Developer (`Jalankan Demo Database`):
 * 1. Idle at Database Workstation Approach
 * 2. Walk to Database Desk & Work Typing
 * 3. Schema Design at Database Desk
 * 4. ERD Analysis at Database Schema Board
 * 5. SQL Query Development at Database Desk
 * 6. Query Optimization at Database Desk
 * 7. Troubleshoot Database at Database Desk
 * 8. Read Documentation at Integration Table
 * 9. Present Data Model at Shared Architecture Board
 * 10. Review Backend Dependency at Shared Architecture Board
 * 11. Task Completed at Database Approach
 * 12. Return to Idle
 */
export const DATABASE_AUTO_DEMO_SEQUENCE: readonly DatabaseDemoStep[] = [
  {
    stepIndex: 1,
    actionId: 'IDLE',
    label: '1. Idle at Database Workstation Approach',
    holdDurationSec: 2.0,
  },
  {
    stepIndex: 2,
    actionId: 'WORK_TYPING',
    label: '2. Walk to Database Desk & Work Typing',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 3,
    actionId: 'SCHEMA_DESIGN',
    label: '3. Schema Design (Relational Tables & Keys)',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 4,
    actionId: 'ERD_ANALYSIS',
    label: '4. Walk to Schema Archive & Analyze ERD',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 5,
    actionId: 'SQL_QUERY_DEVELOPMENT',
    label: '5. SQL Query Development at Database Desk',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 6,
    actionId: 'QUERY_OPTIMIZATION',
    label: '6. Query Optimization & Execution Plan Review',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 7,
    actionId: 'TROUBLESHOOT_DATABASE',
    label: '7. Troubleshoot Database Issue (Demo)',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 8,
    actionId: 'READ_DOCUMENTATION',
    label: '8. Walk to Integration Hub & Read SQL Docs',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 9,
    actionId: 'PRESENT_DATA_MODEL',
    label: '9. Present Data Model at Architecture Board',
    holdDurationSec: 3.6,
  },
  {
    stepIndex: 10,
    actionId: 'REVIEW_BACKEND_DEPENDENCY',
    label: '10. Review Backend Data Contract Dependency',
    holdDurationSec: 3.4,
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
    label: '12. Return to Idle at Database Approach',
    holdDurationSec: 2.2,
  },
] as const;

export const DATABASE_PATROL_ANCHOR_RING: readonly string[] = [
  'DB_WORKSTATION_APPROACH',
  'DB_SCHEMA_REVIEW',
  'ENG_DISCUSSION_POSITION',
  'ENG_ARCHITECTURE_BOARD',
  'ENG_INTEGRATION_TABLE',
  'ENG_CODE_REVIEW_POSITION',
] as const;

export interface DatabaseNavWaypoint {
  id: string;
  position: [number, number]; // [x, z]
  neighbors: string[];
}

/**
 * Collision-free navigation waypoint graph for Database Developer inside `AI_OFFICE_ROOM_ENGINEERING_v1` (8×16 m).
 * Safely routes between Zone D (Database Workstation, Z = 0..5), South-East Schema Review (`[5.45, 1.85]`),
 * Zone C (Shared Integration & Architecture Hub, Z = 5..8), and the Eastern circulation spine (`X = 4.45..6.40`)
 * without colliding with Database desk (`[2.35, 2.95]`), SW bookcase, SE schema archive, Integration table (`[3.25, 6.35]`),
 * or overlapping Frontend (`[5.85, 11.2]`) / Backend (`[4.45, 9.25]`) default spawn points.
 */
export const DATABASE_WALK_WAYPOINTS: Record<string, DatabaseNavWaypoint> = {
  WP_DB_APPROACH: {
    id: 'WP_DB_APPROACH',
    position: [4.45, 2.15],
    neighbors: ['WP_DB_CHAIR', 'WP_DB_SCHEMA_REVIEW', 'WP_CORRIDOR_SOUTH'],
  },
  WP_DB_CHAIR: {
    id: 'WP_DB_CHAIR',
    position: [2.35, 2.15],
    neighbors: ['WP_DB_APPROACH', 'WP_DB_DESK_WORK'],
  },
  WP_DB_DESK_WORK: {
    id: 'WP_DB_DESK_WORK',
    position: [2.35, 2.35],
    neighbors: ['WP_DB_CHAIR'],
  },
  WP_DB_SCHEMA_REVIEW: {
    id: 'WP_DB_SCHEMA_REVIEW',
    position: [5.45, 1.85],
    neighbors: ['WP_DB_APPROACH', 'WP_CORRIDOR_SOUTH'],
  },
  WP_CORRIDOR_SOUTH: {
    id: 'WP_CORRIDOR_SOUTH',
    position: [5.2, 4.2],
    neighbors: [
      'WP_DB_APPROACH',
      'WP_DB_SCHEMA_REVIEW',
      'WP_DISCUSSION',
      'WP_CODE_REVIEW',
      'WP_CORRIDOR_MID_S',
    ],
  },
  WP_DISCUSSION: {
    id: 'WP_DISCUSSION',
    position: [3.25, 5.35],
    neighbors: ['WP_CORRIDOR_SOUTH', 'WP_CODE_REVIEW', 'WP_ARCH_BOARD'],
  },
  WP_ARCH_BOARD: {
    id: 'WP_ARCH_BOARD',
    position: [1.35, 5.75],
    neighbors: ['WP_DISCUSSION', 'WP_INTEGRATION_NORTH'],
  },
  WP_CODE_REVIEW: {
    id: 'WP_CODE_REVIEW',
    position: [4.45, 6.35],
    neighbors: ['WP_CORRIDOR_SOUTH', 'WP_DISCUSSION', 'WP_INTEGRATION_NORTH', 'WP_CORRIDOR_MID_S'],
  },
  WP_INTEGRATION_NORTH: {
    id: 'WP_INTEGRATION_NORTH',
    position: [3.25, 7.35],
    neighbors: ['WP_CODE_REVIEW', 'WP_ARCH_BOARD', 'WP_CORRIDOR_MID_S'],
  },
  WP_CORRIDOR_MID_S: {
    id: 'WP_CORRIDOR_MID_S',
    position: [5.2, 7.35],
    neighbors: ['WP_CORRIDOR_SOUTH', 'WP_CODE_REVIEW', 'WP_INTEGRATION_NORTH', 'WP_EAST_EXIT'],
  },
  WP_EAST_EXIT: {
    id: 'WP_EAST_EXIT',
    position: [6.4, 8.0],
    neighbors: ['WP_CORRIDOR_MID_S'],
  },
};

export function getEngineeringAnchorForDatabaseOrThrow(anchorName: string): EngineeringAnchorSpec {
  const found = ENGINEERING_ANCHORS.find((a) => a.name === anchorName);
  if (!found) {
    throw new Error(`Unknown Engineering Studio anchor "${anchorName}" for Database Developer.`);
  }
  return found;
}

function dist2D(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function findNearestDatabaseWaypointId(xz: [number, number]): string {
  let bestId = 'WP_DB_APPROACH';
  let bestDist = Infinity;
  for (const wp of Object.values(DATABASE_WALK_WAYPOINTS)) {
    const d = dist2D(xz, wp.position);
    if (d < bestDist) {
      bestDist = d;
      bestId = wp.id;
    }
  }
  return bestId;
}

/**
 * Computes a collision-free waypoint path `[x, z][]` inside the 8×16 Engineering Studio
 * for the Database Developer agent.
 */
export function findDatabaseWalkablePath(
  startXZ: [number, number],
  goalXZ: [number, number],
): [number, number][] {
  if (dist2D(startXZ, goalXZ) <= 0.22) {
    return [goalXZ];
  }

  const startWp = findNearestDatabaseWaypointId(startXZ);
  const goalWp = findNearestDatabaseWaypointId(goalXZ);

  if (startWp === goalWp) {
    return [DATABASE_WALK_WAYPOINTS[goalWp].position, goalXZ];
  }

  const distMap: Record<string, number> = {};
  const prevMap: Record<string, string | null> = {};
  const unvisited = new Set<string>(Object.keys(DATABASE_WALK_WAYPOINTS));

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

    const wp = DATABASE_WALK_WAYPOINTS[u];
    for (const nb of wp.neighbors) {
      if (!unvisited.has(nb)) continue;
      const alt = distMap[u] + dist2D(wp.position, DATABASE_WALK_WAYPOINTS[nb].position);
      if (alt < distMap[nb]) {
        distMap[nb] = alt;
        prevMap[nb] = u;
      }
    }
  }

  const chain: [number, number][] = [];
  let curr: string | null = goalWp;
  while (curr) {
    chain.unshift(DATABASE_WALK_WAYPOINTS[curr].position);
    curr = prevMap[curr];
  }

  const last = chain[chain.length - 1];
  if (!last || dist2D(last, goalXZ) > 0.04) {
    chain.push(goalXZ);
  }

  const margin = 0.45;
  return chain.map(([x, z]) => [
    Math.min(ENGINEERING_ROOM_DIMENSIONS.width - margin, Math.max(margin, x)),
    Math.min(ENGINEERING_ROOM_DIMENSIONS.length - margin, Math.max(margin, z)),
  ]);
}

export interface DatabaseSimulationRuntimeStatus {
  characterId: string;
  displayName: string;
  currentState: DatabaseAgentState;
  currentActionId: DatabaseActionId;
  currentActionLabel: string;
  activeClipName: DatabaseAnimationClipName;
  currentAnchorId: string;
  targetAnchorId: string;
  currentExpression: DatabaseExpressionId;
  posture: 'standing' | 'seated';
  handheldProp: DatabasePropId;
  isWalking: boolean;
  isPaused: boolean;
  patrolActive: boolean;
  autoDemoActive: boolean;
  autoDemoStepIndex: number;
  autoDemoTotalSteps: number;
  speedMultiplier: DatabaseSpeedMultiplier;
  backpackVisible: boolean;
  backpackAutoHiddenForSeat: boolean;
  bubbleText: string;
  thoughtText: string;
  worldPosition: [number, number, number];
  facingRad: number;
}
