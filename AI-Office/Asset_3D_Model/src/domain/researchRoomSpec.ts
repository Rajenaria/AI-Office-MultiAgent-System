import { ConnectorSpec } from './modularRoomSpec';

/**
 * AI OFFICE — MODULE 05: RESEARCH & SHARED BRAIN ROOM PRODUCTION V1
 * ("The Knowledge Atelier")
 *
 * Canonical specification for the Research & Shared Brain modular 8×8×3.2 room.
 * - Room ID: AI_OFFICE_ROOM_RESEARCH_v1
 * - Asset ID: ai_office.room.research_shared_brain.v1
 * - Registry Key: research_brain
 * - Local Origin: [0, 0, 0] (South-West corner at floor level)
 * - Full Office A3.1 Global Offset: [0, 0, 18] (North-West slot, West of PM Room [8, 0, 18])
 */

export const RESEARCH_MODULE_CONSTANTS = {
  MODULE_ID: 'AI_OFFICE_ROOM_RESEARCH_v1',
  ASSET_ID: 'ai_office.room.research_shared_brain.v1',
  REGISTRY_KEY: 'research_brain' as const,
  DISPLAY_NAME: 'Research & Shared Brain',
  ALTERNATIVE_TITLE: 'The Knowledge Atelier',
  DEPARTMENT: 'Research / Intelligence / Knowledge',
  CATEGORY: 'modular_office_room',
  STYLE: 'stylized_3d_pixel_knowledge_atelier',
  VERSION: '1.0.0',
  STATUS: 'READY FOR OWNER REVIEW',
  ROOT_NODE_NAME: 'ROOM_RESEARCH_ROOT',
  FOOTPRINT_WIDTH: 8.0,
  FOOTPRINT_DEPTH: 8.0,
  WALL_HEIGHT: 3.2,
  FLOOR_THICKNESS: 0.16,
  WALL_THICKNESS: 0.16,
  GRID_UNIT: 1.0,
  LOCAL_ORIGIN: [0, 0, 0] as [number, number, number],
  GLOBAL_A3_OFFSET: [0, 0, 18] as [number, number, number],
  REQUIRED_GROUPS: [
    'STRUCTURE',
    'FLOOR',
    'WALLS',
    'WINDOWS',
    'FURNITURE',
    'PROPS',
    'DECORATION',
    'CONNECTORS',
  ] as const,
};

export const RESEARCH_EAST_BOUNDARY_NOTE =
  'East boundary at local X=8 (global X=8) interfaces with PM & Strategy Room West wall [8,0,18]. Because PM Room has an approved solid West wall with windows (no West doorway), Research & Shared Brain keeps its East wall as a compatible solid interior wall (inset to X <= 7.95 to prevent coplanar Z-fighting) and routes inter-room circulation via RESEARCH_SOUTH_CORRIDOR [4,0,0] -> global [4,0,18].';

export const RESEARCH_CONNECTORS_SPEC: ConnectorSpec[] = [
  {
    id: 'RESEARCH_SOUTH_CORRIDOR',
    wall: 'SOUTH',
    position: [4, 0, 0],
    width: 2.0,
    height: 2.3,
    direction: '-Z',
    compatibleWith: [
      'SHARED_CORRIDOR',
      'ANY_NORTH_DOOR_2U',
      'AI_OFFICE_ROOM_PM_v1',
      'AI_OFFICE_ROOM_UIUX_v1',
      'AI_OFFICE_ROOM_ENGINEERING_v1',
      'AI_OFFICE_ROOM_CEO_v1',
    ],
  },
];

export type ResearchInteriorZoneId =
  | 'ZONE_A_KNOWLEDGE_ARCHIVE_LIBRARY'
  | 'ZONE_B_PROFESSOR_WORKSTATION'
  | 'ZONE_C_SHARED_BRAIN_ATLAS'
  | 'ZONE_D_EVIDENCE_READING_CORNER';

export interface ResearchInteriorZoneSpec {
  id: ResearchInteriorZoneId;
  title: string;
  subtitle: string;
  placementSummary: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  highlights: string[];
}

export const RESEARCH_INTERIOR_ZONES: ResearchInteriorZoneSpec[] = [
  {
    id: 'ZONE_A_KNOWLEDGE_ARCHIVE_LIBRARY',
    title: 'Zone A — Knowledge Archive Library',
    subtitle: 'North-West / West Archive Wall',
    placementSummary: 'West Wall North bay (X = 0.25..1.45, Z = 4.05..7.55)',
    bounds: { minX: 0.2, maxX: 1.8, minZ: 4.0, maxZ: 7.6 },
    highlights: [
      'Tall multi-bay walnut & muted-sage archival bookcase with staggered shelves',
      'Color-coded scholarly volumes (burgundy, forest green, navy, parchment, tan, dusty teal)',
      'Labeled archival boxes, binders, and recessed brass-handled card-catalog drawers',
      'Miniature brass-mounted terrestrial globe and warm archival reading lamp',
    ],
  },
  {
    id: 'ZONE_B_PROFESSOR_WORKSTATION',
    title: 'Zone B — Research Professor Workstation',
    subtitle: 'North-East Daylight Study Corner',
    placementSummary: 'North-East daylight bay near North tall window (X = 4.55..7.25, Z = 4.45..6.85)',
    bounds: { minX: 4.5, maxX: 7.3, minZ: 4.4, maxZ: 7.1 },
    highlights: [
      'Scholarly medium-oak & walnut research desk (1.90 × 0.88 × 0.76m) with side drawers',
      'Comfortable upholstered leather & walnut scholar chair at [5.65, 0, 4.78]',
      'Single primary widescreen Research Monitor facing the chair with DEMO Source Index UI',
      'Reference tablet, open manuscript on reading stand, research notebook, brass lamp & pen caddy',
    ],
  },
  {
    id: 'ZONE_C_SHARED_BRAIN_ATLAS',
    title: 'Zone C — Shared Brain Knowledge Atlas',
    subtitle: 'North Feature Wall (Center-West Bay)',
    placementSummary: 'North interior feature wall (X = 1.55..4.35, Z = 7.50..7.78), facing South (-Z)',
    bounds: { minX: 1.5, maxX: 4.4, minZ: 6.2, maxZ: 7.8 },
    highlights: [
      'Signature hybrid physical + digital Knowledge Atlas with walnut & brushed-brass frame',
      'Central Knowledge Core hub with 3 distinct memory layers: Organization Brain, Project Brain, and Agent Working Context',
      'Connected 3D topic/evidence cards and provenance/recency/validation indicators (all DEMO)',
      'Directly visible in default isometric view without wall cutaway occlusion',
    ],
  },
  {
    id: 'ZONE_D_EVIDENCE_READING_CORNER',
    title: 'Zone D — Evidence & Reading Corner',
    subtitle: 'South-West Deep Study & Source Verification Corner',
    placementSummary: 'South-West bay (X = 0.25..2.95, Z = 0.85..3.45)',
    bounds: { minX: 0.25, maxX: 3.0, minZ: 0.85, maxZ: 3.5 },
    highlights: [
      'Octagonal walnut & brass scholarly reading table with two upholstered study stools',
      'Open source-comparison folio, magnifying glass, and indexed document tray',
      'West-wall Evidence & Source Pinboard with citation cards, timeline snippets & verification tags (DEMO)',
      'Grounded by a warm woven academic library rug (Research_Atelier_Rug)',
    ],
  },
];

export interface ResearchFurnitureSpecItem {
  id: string;
  name: string;
  zone: ResearchInteriorZoneId | 'ARCHITECTURE_LIGHTING';
  category: 'FURNITURE' | 'PROPS' | 'DECORATION' | 'WINDOWS';
  position: [number, number, number];
  dimensions: [number, number, number]; // [W, H, D]
  description: string;
}

export const RESEARCH_FURNITURE_CATALOG: ResearchFurnitureSpecItem[] = [
  {
    id: 'Research_Knowledge_Archive_Library',
    name: 'Knowledge Archive Library Bookcase',
    zone: 'ZONE_A_KNOWLEDGE_ARCHIVE_LIBRARY',
    category: 'FURNITURE',
    position: [0.54, 0, 6.05],
    dimensions: [0.52, 2.48, 2.55],
    description:
      'Tall multi-bay walnut & muted-sage archival bookcase with staggered shelves, color-coded scholarly books, archival boxes, miniature globe, and brass gallery rail.',
  },
  {
    id: 'Research_Archive_Catalog_Cabinet',
    name: 'Card Catalog & Index Drawer Console',
    zone: 'ZONE_A_KNOWLEDGE_ARCHIVE_LIBRARY',
    category: 'FURNITURE',
    position: [0.54, 0, 4.35],
    dimensions: [0.52, 1.18, 0.86],
    description:
      'Classic library card-catalog console with 9 recessed non-coplanar index drawers, brass label pulls, and top archival sorting tray.',
  },
  {
    id: 'Research_Professor_Workstation',
    name: 'Research Professor Study Desk',
    zone: 'ZONE_B_PROFESSOR_WORKSTATION',
    category: 'FURNITURE',
    position: [5.65, 0, 5.75],
    dimensions: [1.90, 0.76, 0.88],
    description:
      'Scholarly medium-oak and deep-walnut research desk with recessed drawers, primary widescreen Research Monitor (DEMO), reference tablet, open notebook, manuscript stand, and brass desk lamp.',
  },
  {
    id: 'Research_Scholar_Chair',
    name: 'Professor Upholstered Scholar Chair',
    zone: 'ZONE_B_PROFESSOR_WORKSTATION',
    category: 'FURNITURE',
    position: [5.65, 0, 4.78],
    dimensions: [0.64, 1.04, 0.62],
    description:
      'Comfortable walnut-framed upholstered cognac-leather scholar chair positioned behind the Professor desk, facing North (+Z) toward the primary research monitor.',
  },
  {
    id: 'Research_Shared_Brain_Atlas',
    name: 'Shared Brain Knowledge Atlas Wall',
    zone: 'ZONE_C_SHARED_BRAIN_ATLAS',
    category: 'DECORATION',
    position: [2.95, 1.68, 7.68],
    dimensions: [2.68, 1.56, 0.12],
    description:
      'Signature hybrid physical + digital Knowledge Atlas mounted on the North feature wall, displaying Organization Brain, Project Brain, and Agent Working Context layers with 3D node cards (DEMO).',
  },
  {
    id: 'Research_Evidence_Reading_Table',
    name: 'Octagonal Evidence & Reading Table Set',
    zone: 'ZONE_D_EVIDENCE_READING_CORNER',
    category: 'FURNITURE',
    position: [1.75, 0, 2.15],
    dimensions: [1.12, 0.74, 1.12],
    description:
      'Compact octagonal walnut reading table paired with two upholstered study chairs, open source-comparison folio, brass magnifying glass, and citation tray.',
  },
  {
    id: 'Research_Evidence_Board',
    name: 'Evidence & Source Verification Pinboard',
    zone: 'ZONE_D_EVIDENCE_READING_CORNER',
    category: 'DECORATION',
    position: [0.30, 1.58, 2.15],
    dimensions: [0.08, 1.18, 1.72],
    description:
      'West-wall walnut-framed cork & slate verification board featuring pinned source cards, timeline snippets, topic headers, and provenance verification tags (DEMO).',
  },
  {
    id: 'Research_Reference_Credenza',
    name: 'East Reference Folio & Specimen Credenza',
    zone: 'ZONE_B_PROFESSOR_WORKSTATION',
    category: 'FURNITURE',
    position: [7.28, 0, 2.65],
    dimensions: [0.54, 0.88, 1.76],
    description:
      'Low walnut & sage reference credenza along the East study bay holding bound encyclopedias, archival specimen cases, and a brass banker lamp.',
  },
  {
    id: 'Research_Atelier_Rug',
    name: 'Woven Knowledge Atelier Library Rug',
    zone: 'ZONE_D_EVIDENCE_READING_CORNER',
    category: 'DECORATION',
    position: [3.65, 0.004, 3.85],
    dimensions: [5.20, 0.008, 4.90],
    description:
      'Warm woven academic library rug in parchment cream, muted sage, dusty teal, and antique brass geometric border grounding the room zones.',
  },
  {
    id: 'Research_Daylight_Windows',
    name: 'North Study Window & West Reading Window',
    zone: 'ARCHITECTURE_LIGHTING',
    category: 'WINDOWS',
    position: [6.05, 1.72, 7.83],
    dimensions: [2.30, 1.58, 0.18],
    description:
      'Tall mullioned North study window illuminating the Professor Workstation plus a secondary West reading window with warm natural daylight.',
  },
];

export type ResearchAnchorType =
  | 'RESEARCH_ROOM_SPAWN'
  | 'RESEARCH_ROOM_IDLE'
  | 'RESEARCH_DESK_APPROACH'
  | 'RESEARCH_DESK_WORK'
  | 'RESEARCH_CHAIR_POSITION'
  | 'RESEARCH_BOOKSHELF_ACCESS'
  | 'RESEARCH_ARCHIVE_DRAWER'
  | 'RESEARCH_KNOWLEDGE_ATLAS'
  | 'RESEARCH_EVIDENCE_BOARD'
  | 'RESEARCH_READING_TABLE'
  | 'RESEARCH_REFERENCE_REVIEW'
  | 'RESEARCH_PRESENTATION_POSITION'
  | 'RESEARCH_SOUTH_EXIT';

export interface ResearchActivityAnchor {
  id: ResearchAnchorType;
  anchor_name: ResearchAnchorType;
  anchor_type:
    | 'spawn'
    | 'idle'
    | 'navigation'
    | 'workstation'
    | 'seating'
    | 'archive'
    | 'knowledge_atlas'
    | 'evidence_board'
    | 'reading_table'
    | 'reference'
    | 'presentation'
    | 'connector';
  zone: ResearchInteriorZoneId | 'CIRCULATION';
  position: [number, number, number];
  rotationY: number; // radians
  facing_direction: [number, number, number]; // unit vector [x, y, z]
  occupied_state: 'standing' | 'seated' | 'transitional';
  ClearanceRadius: number;
  associated_furniture_node: string;
  compatible_future_character_role: string;
  description: string;
}

/**
 * 13 Required Room-Local Anchors derived from actual furniture placement in ROOM_RESEARCH_ROOT.
 * All coordinates are strictly inside [0..8, 0..3.2, 0..8] local room space.
 */
export const DEFAULT_RESEARCH_ANCHORS: ResearchActivityAnchor[] = [
  {
    id: 'RESEARCH_ROOM_SPAWN',
    anchor_name: 'RESEARCH_ROOM_SPAWN',
    anchor_type: 'spawn',
    zone: 'CIRCULATION',
    position: [4.0, 0.0, 0.95],
    rotationY: 0,
    facing_direction: [0, 0, 1],
    occupied_state: 'standing',
    ClearanceRadius: 0.45,
    associated_furniture_node: 'CONNECTOR_RESEARCH_SOUTH',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Primary room entry spawn point inside the South corridor doorway, facing North into the Knowledge Atelier.',
  },
  {
    id: 'RESEARCH_ROOM_IDLE',
    anchor_name: 'RESEARCH_ROOM_IDLE',
    anchor_type: 'idle',
    zone: 'CIRCULATION',
    position: [3.85, 0.0, 3.65],
    rotationY: Math.PI,
    facing_direction: [0, 0, -1],
    occupied_state: 'standing',
    ClearanceRadius: 0.5,
    associated_furniture_node: 'Research_Atelier_Rug',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Central open-floor standing point on the library rug with clear sightlines to all 4 knowledge zones.',
  },
  {
    id: 'RESEARCH_DESK_APPROACH',
    anchor_name: 'RESEARCH_DESK_APPROACH',
    anchor_type: 'navigation',
    zone: 'ZONE_B_PROFESSOR_WORKSTATION',
    position: [4.55, 0.0, 4.78],
    rotationY: Math.PI / 2,
    facing_direction: [1, 0, 0],
    occupied_state: 'transitional',
    ClearanceRadius: 0.4,
    associated_furniture_node: 'Research_Professor_Workstation',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Pre-seating approach point on the West side of the Professor Chair for collision-free chair entry/exit.',
  },
  {
    id: 'RESEARCH_DESK_WORK',
    anchor_name: 'RESEARCH_DESK_WORK',
    anchor_type: 'workstation',
    zone: 'ZONE_B_PROFESSOR_WORKSTATION',
    position: [5.65, 0.0, 4.88],
    rotationY: 0,
    facing_direction: [0, 0, 1],
    occupied_state: 'seated',
    ClearanceRadius: 0.38,
    associated_furniture_node: 'Research_Professor_Workstation',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Active seated workstation anchor facing North (+Z) toward the primary widescreen Research Monitor and manuscript stand.',
  },
  {
    id: 'RESEARCH_CHAIR_POSITION',
    anchor_name: 'RESEARCH_CHAIR_POSITION',
    anchor_type: 'seating',
    zone: 'ZONE_B_PROFESSOR_WORKSTATION',
    position: [5.65, 0.0, 4.78],
    rotationY: 0,
    facing_direction: [0, 0, 1],
    occupied_state: 'seated',
    ClearanceRadius: 0.38,
    associated_furniture_node: 'Research_Scholar_Chair',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Exact floor pivot of the Professor Upholstered Scholar Chair behind the research workstation.',
  },
  {
    id: 'RESEARCH_BOOKSHELF_ACCESS',
    anchor_name: 'RESEARCH_BOOKSHELF_ACCESS',
    anchor_type: 'archive',
    zone: 'ZONE_A_KNOWLEDGE_ARCHIVE_LIBRARY',
    position: [1.32, 0.0, 6.05],
    rotationY: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    occupied_state: 'standing',
    ClearanceRadius: 0.42,
    associated_furniture_node: 'Research_Knowledge_Archive_Library',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Standing point in front of the Knowledge Archive Library bookcase for retrieving scholarly volumes.',
  },
  {
    id: 'RESEARCH_ARCHIVE_DRAWER',
    anchor_name: 'RESEARCH_ARCHIVE_DRAWER',
    anchor_type: 'archive',
    zone: 'ZONE_A_KNOWLEDGE_ARCHIVE_LIBRARY',
    position: [1.32, 0.0, 4.35],
    rotationY: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    occupied_state: 'standing',
    ClearanceRadius: 0.42,
    associated_furniture_node: 'Research_Archive_Catalog_Cabinet',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Standing point in front of the Card Catalog & Index Drawer Console for inspecting archival index cards.',
  },
  {
    id: 'RESEARCH_KNOWLEDGE_ATLAS',
    anchor_name: 'RESEARCH_KNOWLEDGE_ATLAS',
    anchor_type: 'knowledge_atlas',
    zone: 'ZONE_C_SHARED_BRAIN_ATLAS',
    position: [2.95, 0.0, 6.65],
    rotationY: 0,
    facing_direction: [0, 0, 1],
    occupied_state: 'standing',
    ClearanceRadius: 0.45,
    associated_furniture_node: 'Research_Shared_Brain_Atlas',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Standing inspection anchor facing North (+Z) toward the Shared Brain Knowledge Atlas wall.',
  },
  {
    id: 'RESEARCH_EVIDENCE_BOARD',
    anchor_name: 'RESEARCH_EVIDENCE_BOARD',
    anchor_type: 'evidence_board',
    zone: 'ZONE_D_EVIDENCE_READING_CORNER',
    position: [1.05, 0.0, 2.15],
    rotationY: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    occupied_state: 'standing',
    ClearanceRadius: 0.38,
    associated_furniture_node: 'Research_Evidence_Board',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Standing inspection anchor facing West (-X) toward the Evidence & Source Verification Pinboard.',
  },
  {
    id: 'RESEARCH_READING_TABLE',
    anchor_name: 'RESEARCH_READING_TABLE',
    anchor_type: 'reading_table',
    zone: 'ZONE_D_EVIDENCE_READING_CORNER',
    position: [2.52, 0.0, 2.15],
    rotationY: -Math.PI / 2,
    facing_direction: [-1, 0, 0],
    occupied_state: 'seated',
    ClearanceRadius: 0.38,
    associated_furniture_node: 'Research_Evidence_Reading_Table',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Seated study position at the East chair of the Octagonal Evidence & Reading Table.',
  },
  {
    id: 'RESEARCH_REFERENCE_REVIEW',
    anchor_name: 'RESEARCH_REFERENCE_REVIEW',
    anchor_type: 'reference',
    zone: 'ZONE_B_PROFESSOR_WORKSTATION',
    position: [6.48, 0.0, 2.65],
    rotationY: Math.PI / 2,
    facing_direction: [1, 0, 0],
    occupied_state: 'standing',
    ClearanceRadius: 0.42,
    associated_furniture_node: 'Research_Reference_Credenza',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Standing review position facing East (+X) at the Reference Folio & Specimen Credenza.',
  },
  {
    id: 'RESEARCH_PRESENTATION_POSITION',
    anchor_name: 'RESEARCH_PRESENTATION_POSITION',
    anchor_type: 'presentation',
    zone: 'ZONE_C_SHARED_BRAIN_ATLAS',
    position: [3.45, 0.0, 6.25],
    rotationY: Math.PI,
    facing_direction: [0, 0, -1],
    occupied_state: 'standing',
    ClearanceRadius: 0.45,
    associated_furniture_node: 'Research_Shared_Brain_Atlas',
    compatible_future_character_role: 'research_professor_agent',
    description: 'Briefing position beside the Shared Brain Knowledge Atlas facing South (-Z) to present findings.',
  },
  {
    id: 'RESEARCH_SOUTH_EXIT',
    anchor_name: 'RESEARCH_SOUTH_EXIT',
    anchor_type: 'connector',
    zone: 'CIRCULATION',
    position: [4.0, 0.0, 0.45],
    rotationY: Math.PI,
    facing_direction: [0, 0, -1],
    occupied_state: 'transitional',
    ClearanceRadius: 0.45,
    associated_furniture_node: 'CONNECTOR_RESEARCH_SOUTH',
    compatible_future_character_role: 'research_professor_agent',
    description: 'South corridor exit portal at [4, 0, 0.45] leading out to the Shared Corridor at global [4, 0, 18].',
  },
];

export type ResearchDisplaySlotId =
  | 'RESEARCH_DISPLAY_SOURCE_INDEX'
  | 'RESEARCH_DISPLAY_KNOWLEDGE_ATLAS'
  | 'RESEARCH_DISPLAY_ORG_BRAIN'
  | 'RESEARCH_DISPLAY_PROJECT_BRAIN'
  | 'RESEARCH_DISPLAY_AGENT_CONTEXT'
  | 'RESEARCH_DISPLAY_EVIDENCE_STATUS';

export interface ResearchDisplaySlotSpec {
  slot_id: ResearchDisplaySlotId;
  mesh_node_name: string;
  zone: ResearchInteriorZoneId;
  display_type:
    | 'workstation_widescreen_monitor'
    | 'knowledge_atlas_canvas'
    | 'shared_brain_layer_panel'
    | 'evidence_pinboard_surface';
  position: [number, number, number];
  dimensions: [number, number]; // [width, height] in meters
  normal_direction: [number, number, number];
  aspect_ratio: string;
  demo_only: true;
  demo_badge_label: 'DEMO';
  demo_headline: string;
  demo_summary: string;
  supported_future_payload_types: string[];
}

export const RESEARCH_DISPLAY_SLOTS: ResearchDisplaySlotSpec[] = [
  {
    slot_id: 'RESEARCH_DISPLAY_SOURCE_INDEX',
    mesh_node_name: 'Research_Primary_Monitor_Screen',
    zone: 'ZONE_B_PROFESSOR_WORKSTATION',
    display_type: 'workstation_widescreen_monitor',
    position: [5.65, 1.07, 6.01],
    dimensions: [0.76, 0.40],
    normal_direction: [0, 0, -1],
    aspect_ratio: '19:10',
    demo_only: true,
    demo_badge_label: 'DEMO',
    demo_headline: 'SOURCE INDEX & CITATION SYNTHESIS [DEMO]',
    demo_summary:
      'Static DEMO canvas showing indexed corpus documents, cross-document comparison split view, and citation confidence bars.',
    supported_future_payload_types: [
      'source_index_summary',
      'document_comparison_diff',
      'citation_provenance_table',
    ],
  },
  {
    slot_id: 'RESEARCH_DISPLAY_KNOWLEDGE_ATLAS',
    mesh_node_name: 'Research_Knowledge_Atlas_Canvas',
    zone: 'ZONE_C_SHARED_BRAIN_ATLAS',
    display_type: 'knowledge_atlas_canvas',
    position: [2.95, 1.68, 7.62],
    dimensions: [2.52, 1.40],
    normal_direction: [0, 0, -1],
    aspect_ratio: '9:5',
    demo_only: true,
    demo_badge_label: 'DEMO',
    demo_headline: 'SHARED BRAIN KNOWLEDGE ATLAS — V1 [DEMO]',
    demo_summary:
      'Master wall-mounted visual knowledge graph connecting the Central Knowledge Core with Organization, Project, and Agent context clusters.',
    supported_future_payload_types: [
      'knowledge_graph_topology',
      'memory_cluster_status',
      'provenance_health_metrics',
    ],
  },
  {
    slot_id: 'RESEARCH_DISPLAY_ORG_BRAIN',
    mesh_node_name: 'Research_Atlas_Panel_Org_Brain',
    zone: 'ZONE_C_SHARED_BRAIN_ATLAS',
    display_type: 'shared_brain_layer_panel',
    position: [2.08, 1.82, 7.60],
    dimensions: [0.68, 0.48],
    normal_direction: [0, 0, -1],
    aspect_ratio: '17:12',
    demo_only: true,
    demo_badge_label: 'DEMO',
    demo_headline: 'LAYER 01: ORGANIZATION BRAIN [DEMO]',
    demo_summary:
      'Long-term organizational policies, design & engineering standards, domain taxonomy, and verified institutional memory.',
    supported_future_payload_types: [
      'org_policy_digest',
      'taxonomy_snapshot',
      'institutional_standards_status',
    ],
  },
  {
    slot_id: 'RESEARCH_DISPLAY_PROJECT_BRAIN',
    mesh_node_name: 'Research_Atlas_Panel_Project_Brain',
    zone: 'ZONE_C_SHARED_BRAIN_ATLAS',
    display_type: 'shared_brain_layer_panel',
    position: [2.95, 1.82, 7.60],
    dimensions: [0.68, 0.48],
    normal_direction: [0, 0, -1],
    aspect_ratio: '17:12',
    demo_only: true,
    demo_badge_label: 'DEMO',
    demo_headline: 'LAYER 02: PROJECT BRAIN [DEMO]',
    demo_summary:
      'Active project architecture specs, ADR decision records, room module contracts, and cross-department handoff artifacts.',
    supported_future_payload_types: [
      'project_architecture_index',
      'adr_decision_log',
      'module_spec_registry',
    ],
  },
  {
    slot_id: 'RESEARCH_DISPLAY_AGENT_CONTEXT',
    mesh_node_name: 'Research_Atlas_Panel_Agent_Context',
    zone: 'ZONE_C_SHARED_BRAIN_ATLAS',
    display_type: 'shared_brain_layer_panel',
    position: [3.82, 1.82, 7.60],
    dimensions: [0.68, 0.48],
    normal_direction: [0, 0, -1],
    aspect_ratio: '17:12',
    demo_only: true,
    demo_badge_label: 'DEMO',
    demo_headline: 'LAYER 03: AGENT WORKING CONTEXT [DEMO]',
    demo_summary:
      'Active task context window, retrieved citations, provenance trace, and validation state for current agent workflows.',
    supported_future_payload_types: [
      'active_agent_context_window',
      'retrieved_evidence_bundle',
      'provenance_validation_state',
    ],
  },
  {
    slot_id: 'RESEARCH_DISPLAY_EVIDENCE_STATUS',
    mesh_node_name: 'Research_Evidence_Board_Canvas',
    zone: 'ZONE_D_EVIDENCE_READING_CORNER',
    display_type: 'evidence_pinboard_surface',
    position: [0.345, 1.58, 2.15],
    dimensions: [1.58, 1.04],
    normal_direction: [1, 0, 0],
    aspect_ratio: '79:52',
    demo_only: true,
    demo_badge_label: 'DEMO',
    demo_headline: 'EVIDENCE & SOURCE VERIFICATION BOARD [DEMO]',
    demo_summary:
      'Pinned primary sources, timeline cross-checks, contradiction flags, and citation verification stamps.',
    supported_future_payload_types: [
      'evidence_card_cluster',
      'source_verification_matrix',
      'timeline_cross_check',
    ],
  },
];

export type ResearchFutureActionId =
  | 'ENTER_ROOM'
  | 'EXIT_ROOM'
  | 'IDLE_STAND'
  | 'WALK_TO_DESK'
  | 'SIT_AT_DESK'
  | 'READ_DOCUMENT'
  | 'TYPE_RESEARCH_NOTES'
  | 'BROWSE_BOOKSHELF'
  | 'OPEN_ARCHIVE_DRAWER'
  | 'INSPECT_KNOWLEDGE_ATLAS'
  | 'REVIEW_EVIDENCE_BOARD'
  | 'STUDY_AT_READING_TABLE'
  | 'REVIEW_REFERENCE_CREDENZA'
  | 'PRESENT_RESEARCH_FINDINGS';

export interface ResearchFutureActionContract {
  action_id: ResearchFutureActionId;
  target_anchor: ResearchAnchorType;
  fallback_anchor: ResearchAnchorType;
  approach_path_anchors: ResearchAnchorType[];
  occupied_posture: 'standing' | 'seated' | 'walking';
  expected_facing: [number, number, number];
  default_duration_sec: number;
  associated_display_slot?: ResearchDisplaySlotId;
  description: string;
}

export const RESEARCH_FUTURE_ACTION_CONTRACTS: ResearchFutureActionContract[] = [
  {
    action_id: 'ENTER_ROOM',
    target_anchor: 'RESEARCH_ROOM_SPAWN',
    fallback_anchor: 'RESEARCH_ROOM_IDLE',
    approach_path_anchors: ['RESEARCH_SOUTH_EXIT', 'RESEARCH_ROOM_SPAWN'],
    occupied_posture: 'walking',
    expected_facing: [0, 0, 1],
    default_duration_sec: 2.5,
    description: 'Enter Research & Shared Brain from the South Corridor and step onto the central library rug.',
  },
  {
    action_id: 'EXIT_ROOM',
    target_anchor: 'RESEARCH_SOUTH_EXIT',
    fallback_anchor: 'RESEARCH_ROOM_SPAWN',
    approach_path_anchors: ['RESEARCH_ROOM_IDLE', 'RESEARCH_ROOM_SPAWN', 'RESEARCH_SOUTH_EXIT'],
    occupied_posture: 'walking',
    expected_facing: [0, 0, -1],
    default_duration_sec: 2.5,
    description: 'Walk from the interior of the Knowledge Atelier out through RESEARCH_SOUTH_CORRIDOR.',
  },
  {
    action_id: 'IDLE_STAND',
    target_anchor: 'RESEARCH_ROOM_IDLE',
    fallback_anchor: 'RESEARCH_ROOM_SPAWN',
    approach_path_anchors: ['RESEARCH_ROOM_IDLE'],
    occupied_posture: 'standing',
    expected_facing: [0, 0, -1],
    default_duration_sec: 6.0,
    description: 'Stand calmly in the central Knowledge Atelier clearing, surveying the archive and knowledge atlas.',
  },
  {
    action_id: 'WALK_TO_DESK',
    target_anchor: 'RESEARCH_DESK_APPROACH',
    fallback_anchor: 'RESEARCH_ROOM_IDLE',
    approach_path_anchors: ['RESEARCH_ROOM_IDLE', 'RESEARCH_DESK_APPROACH'],
    occupied_posture: 'walking',
    expected_facing: [1, 0, 0],
    default_duration_sec: 3.0,
    description: 'Navigate to the West approach point of the Professor Workstation chair.',
  },
  {
    action_id: 'SIT_AT_DESK',
    target_anchor: 'RESEARCH_CHAIR_POSITION',
    fallback_anchor: 'RESEARCH_DESK_APPROACH',
    approach_path_anchors: ['RESEARCH_DESK_APPROACH', 'RESEARCH_CHAIR_POSITION'],
    occupied_posture: 'seated',
    expected_facing: [0, 0, 1],
    default_duration_sec: 8.0,
    associated_display_slot: 'RESEARCH_DISPLAY_SOURCE_INDEX',
    description: 'Transition from RESEARCH_DESK_APPROACH into the Upholstered Scholar Chair facing the primary monitor.',
  },
  {
    action_id: 'READ_DOCUMENT',
    target_anchor: 'RESEARCH_DESK_WORK',
    fallback_anchor: 'RESEARCH_CHAIR_POSITION',
    approach_path_anchors: ['RESEARCH_DESK_APPROACH', 'RESEARCH_DESK_WORK'],
    occupied_posture: 'seated',
    expected_facing: [0, 0, 1],
    default_duration_sec: 10.0,
    associated_display_slot: 'RESEARCH_DISPLAY_SOURCE_INDEX',
    description: 'Read open primary manuscripts and cross-reference citations at the Professor Workstation.',
  },
  {
    action_id: 'TYPE_RESEARCH_NOTES',
    target_anchor: 'RESEARCH_DESK_WORK',
    fallback_anchor: 'RESEARCH_CHAIR_POSITION',
    approach_path_anchors: ['RESEARCH_DESK_APPROACH', 'RESEARCH_DESK_WORK'],
    occupied_posture: 'seated',
    expected_facing: [0, 0, 1],
    default_duration_sec: 12.0,
    associated_display_slot: 'RESEARCH_DISPLAY_SOURCE_INDEX',
    description: 'Synthesize research notes and update the Source Index on the widescreen workstation monitor.',
  },
  {
    action_id: 'BROWSE_BOOKSHELF',
    target_anchor: 'RESEARCH_BOOKSHELF_ACCESS',
    fallback_anchor: 'RESEARCH_ROOM_IDLE',
    approach_path_anchors: ['RESEARCH_ROOM_IDLE', 'RESEARCH_BOOKSHELF_ACCESS'],
    occupied_posture: 'standing',
    expected_facing: [-1, 0, 0],
    default_duration_sec: 8.0,
    description: 'Scan the multi-bay Knowledge Archive Library shelves and select a scholarly reference volume.',
  },
  {
    action_id: 'OPEN_ARCHIVE_DRAWER',
    target_anchor: 'RESEARCH_ARCHIVE_DRAWER',
    fallback_anchor: 'RESEARCH_BOOKSHELF_ACCESS',
    approach_path_anchors: ['RESEARCH_ROOM_IDLE', 'RESEARCH_ARCHIVE_DRAWER'],
    occupied_posture: 'standing',
    expected_facing: [-1, 0, 0],
    default_duration_sec: 7.0,
    description: 'Consult indexed taxonomy cards at the Card Catalog & Index Drawer Console.',
  },
  {
    action_id: 'INSPECT_KNOWLEDGE_ATLAS',
    target_anchor: 'RESEARCH_KNOWLEDGE_ATLAS',
    fallback_anchor: 'RESEARCH_ROOM_IDLE',
    approach_path_anchors: ['RESEARCH_ROOM_IDLE', 'RESEARCH_KNOWLEDGE_ATLAS'],
    occupied_posture: 'standing',
    expected_facing: [0, 0, 1],
    default_duration_sec: 10.0,
    associated_display_slot: 'RESEARCH_DISPLAY_KNOWLEDGE_ATLAS',
    description: 'Inspect the Shared Brain Knowledge Atlas wall and trace connections across Org, Project, and Agent memory layers.',
  },
  {
    action_id: 'REVIEW_EVIDENCE_BOARD',
    target_anchor: 'RESEARCH_EVIDENCE_BOARD',
    fallback_anchor: 'RESEARCH_ROOM_IDLE',
    approach_path_anchors: ['RESEARCH_ROOM_IDLE', 'RESEARCH_EVIDENCE_BOARD'],
    occupied_posture: 'standing',
    expected_facing: [-1, 0, 0],
    default_duration_sec: 9.0,
    associated_display_slot: 'RESEARCH_DISPLAY_EVIDENCE_STATUS',
    description: 'Verify pinned primary source cards, timeline snippets, and provenance tags on the West Evidence Board.',
  },
  {
    action_id: 'STUDY_AT_READING_TABLE',
    target_anchor: 'RESEARCH_READING_TABLE',
    fallback_anchor: 'RESEARCH_EVIDENCE_BOARD',
    approach_path_anchors: ['RESEARCH_ROOM_IDLE', 'RESEARCH_READING_TABLE'],
    occupied_posture: 'seated',
    expected_facing: [-1, 0, 0],
    default_duration_sec: 11.0,
    description: 'Sit at the Octagonal Evidence & Reading Table to compare open folios with the brass magnifying glass.',
  },
  {
    action_id: 'REVIEW_REFERENCE_CREDENZA',
    target_anchor: 'RESEARCH_REFERENCE_REVIEW',
    fallback_anchor: 'RESEARCH_ROOM_IDLE',
    approach_path_anchors: ['RESEARCH_ROOM_IDLE', 'RESEARCH_REFERENCE_REVIEW'],
    occupied_posture: 'standing',
    expected_facing: [1, 0, 0],
    default_duration_sec: 7.5,
    description: 'Review bound encyclopedias and specimen folios at the East Reference Credenza.',
  },
  {
    action_id: 'PRESENT_RESEARCH_FINDINGS',
    target_anchor: 'RESEARCH_PRESENTATION_POSITION',
    fallback_anchor: 'RESEARCH_KNOWLEDGE_ATLAS',
    approach_path_anchors: ['RESEARCH_ROOM_IDLE', 'RESEARCH_PRESENTATION_POSITION'],
    occupied_posture: 'standing',
    expected_facing: [0, 0, -1],
    default_duration_sec: 9.0,
    associated_display_slot: 'RESEARCH_DISPLAY_KNOWLEDGE_ATLAS',
    description: 'Stand beside the Shared Brain Knowledge Atlas facing South to present synthesized findings.',
  },
];

export interface ResearchCameraPreset {
  id: 'ISOMETRIC' | 'TOP_DOWN' | 'ZONE_A_ARCHIVE' | 'ZONE_B_WORKSTATION' | 'ZONE_C_ATLAS' | 'ZONE_D_EVIDENCE';
  label: string;
  shortLabel: string;
  name: string;
  description: string;
  category: 'standard' | 'inspection';
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
  fov: number;
}

export const RESEARCH_CAMERA_PRESETS: ResearchCameraPreset[] = [
  {
    id: 'ISOMETRIC',
    label: '3/4 Knowledge Atelier',
    shortLabel: '3/4 Isometric',
    name: '3/4 Knowledge Atelier',
    description: 'Default 3/4 isometric overview of all 4 zones',
    category: 'standard',
    position: [13.6, 11.2, -5.6],
    target: [4.0, 1.15, 4.0],
    zoom: 76,
    fov: 32,
  },
  {
    id: 'TOP_DOWN',
    label: 'Top Plan (8×8)',
    shortLabel: 'Top Plan',
    name: 'Top Plan (8×8)',
    description: 'Orthographic-style top-down floor plan & circulation',
    category: 'standard',
    position: [4.0, 24.0, 3.99],
    target: [4.0, 0.0, 4.0],
    zoom: 76,
    fov: 32,
  },
  {
    id: 'ZONE_A_ARCHIVE',
    label: 'Zone A: Archive Library',
    shortLabel: 'Archive Wall',
    name: 'Zone A: Archive Library',
    description: 'Tall walnut & sage bookcase + card catalog console',
    category: 'inspection',
    position: [8.6, 5.2, 1.8],
    target: [0.55, 1.35, 5.45],
    zoom: 148,
    fov: 34,
  },
  {
    id: 'ZONE_B_WORKSTATION',
    label: 'Zone B: Professor Desk',
    shortLabel: 'Professor Desk',
    name: 'Zone B: Professor Desk',
    description: 'Scholarly workstation, DEMO Source Index & credenza',
    category: 'inspection',
    position: [10.4, 5.4, 0.8],
    target: [5.65, 1.05, 5.25],
    zoom: 152,
    fov: 32,
  },
  {
    id: 'ZONE_C_ATLAS',
    label: 'Zone C: Shared Brain Atlas',
    shortLabel: 'Shared Brain Atlas',
    name: 'Zone C: Shared Brain Atlas',
    description: '3-layer Shared Brain Knowledge Atlas (Org/Project/Agent)',
    category: 'inspection',
    position: [7.8, 5.1, 1.6],
    target: [2.95, 1.65, 7.65],
    zoom: 155,
    fov: 32,
  },
  {
    id: 'ZONE_D_EVIDENCE',
    label: 'Zone D: Evidence & Reading',
    shortLabel: 'Evidence Corner',
    name: 'Zone D: Evidence & Reading',
    description: 'Octagonal reading table & West Evidence Board',
    category: 'inspection',
    position: [8.4, 4.9, -1.6],
    target: [1.35, 1.15, 2.15],
    zoom: 150,
    fov: 34,
  },
];

export function buildResearchDisplaySlotsJson() {
  return {
    schema_version: '1.0.0',
    room_id: RESEARCH_MODULE_CONSTANTS.MODULE_ID,
    asset_id: RESEARCH_MODULE_CONSTANTS.ASSET_ID,
    display_name: RESEARCH_MODULE_CONSTANTS.DISPLAY_NAME,
    demo_mode_only: true,
    note: 'All display slots are static visual contracts marked DEMO. No live RAG, vector DB, or real-time backend queries are executed in Module 05.',
    total_display_slots: RESEARCH_DISPLAY_SLOTS.length,
    display_slots: RESEARCH_DISPLAY_SLOTS,
  };
}

export function buildResearchRoomBehaviorJson() {
  return {
    schema_version: '1.0.0',
    room_id: RESEARCH_MODULE_CONSTANTS.MODULE_ID,
    asset_id: RESEARCH_MODULE_CONSTANTS.ASSET_ID,
    target_future_character_id: 'research_professor_agent',
    target_future_character_title: 'Research Professor / Head of Shared Brain',
    character_included_in_room_glb: false,
    default_spawn_anchor: 'RESEARCH_ROOM_SPAWN',
    default_idle_anchor: 'RESEARCH_ROOM_IDLE',
    default_workstation_anchor: 'RESEARCH_DESK_WORK',
    default_chair_anchor: 'RESEARCH_CHAIR_POSITION',
    south_corridor_connector: 'RESEARCH_SOUTH_CORRIDOR',
    east_boundary_policy: RESEARCH_EAST_BOUNDARY_NOTE,
    supported_actions: RESEARCH_FUTURE_ACTION_CONTRACTS,
  };
}
