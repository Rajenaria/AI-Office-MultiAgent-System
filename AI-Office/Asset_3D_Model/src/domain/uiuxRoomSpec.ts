import { CameraPreset, ConnectorSpec, FurnitureCatalogItem, RoomExportStats } from './modularRoomSpec';

export type UIUXAnchorId =
  | 'UIUX_ROOM_SPAWN'
  | 'UIUX_ROOM_IDLE'
  | 'UIUX_DESK_APPROACH'
  | 'UIUX_DESK_WORK'
  | 'UIUX_WIREFRAME_WALL'
  | 'UIUX_STYLE_BOARD'
  | 'UIUX_REVIEW_TABLE'
  | 'UIUX_PRESENTATION_POSITION'
  | 'UIUX_STORAGE_SHELF'
  | 'UIUX_SOUTH_EXIT';

export type UIUXFutureActionId =
  | 'idle'
  | 'walk_to_design_desk'
  | 'design_ui_components'
  | 'sketch_pen_tablet'
  | 'map_ux_user_flow'
  | 'curate_style_tokens'
  | 'review_interactive_prototype'
  | 'present_design_critique'
  | 'browse_material_library'
  | 'exit_to_corridor';

export interface UIUXActivityAnchor {
  id: UIUXAnchorId;
  label: string;
  position: [number, number, number];
  facingRad: number;
  posture: 'standing' | 'seated';
  approachAnchorId?: UIUXAnchorId;
  associatedFurnitureId: string | null;
  associatedFutureAction: UIUXFutureActionId;
  interactionTarget: string;
  description: string;
}

export interface UIUXFutureActionContract {
  id: UIUXFutureActionId;
  code: string;
  label: string;
  targetAnchorId: UIUXAnchorId;
  posture: 'standing' | 'seated';
  requiresWalk: boolean;
  zoneHighlight: string;
  simulatedStudioStatus: string;
  description: string;
}

export const UIUX_MODULE_CONSTANTS = {
  MODULE_ID: 'AI_OFFICE_ROOM_UIUX_v1',
  ASSET_ID: 'ai_office.room.uiux_design_studio.v1',
  VERSION: '1.0.0',
  DISPLAY_NAME: 'UI/UX Design Studio',
  SHORT_NAME: 'UI/UX Design Studio',
  DEPARTMENT_TYPE: 'Design / Product Experience',
  ROOT_NODE_NAME: 'ROOM_UIUX_ROOT',
  GLB_FILENAME: 'uiux_room.glb',
  MANIFEST_FILENAME: 'uiux-room.manifest.json',
  ANCHORS_FILENAME: 'uiux-room.anchors.json',
  BEHAVIOR_FILENAME: 'uiux-room.behavior.json',
  PREVIEW_FILENAME: 'uiux_room.preview.png',
  PACK_ZIP_FILENAME: 'uiux_room_production_pack_v1.zip',
  GRID_SIZE: 1.0,
  FOOTPRINT_WIDTH: 8.0,
  FOOTPRINT_DEPTH: 8.0,
  FLOOR_ELEVATION: 0.0,
  FLOOR_THICKNESS: 0.16,
  WALL_HEIGHT: 3.2,
  LOCAL_ORIGIN: [0, 0, 0] as [number, number, number],
  GLOBAL_A3_OFFSET: [24, 0, 18] as [number, number, number],
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

export interface UIUXConnectorSpec extends Omit<ConnectorSpec, 'side' | 'outward_direction'> {
  side: 'SOUTH';
  outward_direction: '-Z';
}

export const UIUX_CONNECTORS_SPEC: Record<'SOUTH', UIUXConnectorSpec> = {
  SOUTH: {
    id: 'UIUX_CONNECTOR_SOUTH',
    name: 'South Passage — Shared Office Corridor Exit',
    side: 'SOUTH',
    position: [4, 0, 0],
    outward_direction: '-Z',
    normal: [0, 0, -1],
    width: 2.0,
    height: 2.3,
    span_range: [3.0, 5.0],
    clearance_zone: {
      minX: 3.0,
      maxX: 5.0,
      minZ: 0.0,
      maxZ: 1.25,
    },
    removable_wall_node: 'UIUX_Connector_South_Removable_Threshold',
  },
};

export const UIUX_WEST_ADJACENCY_NOTE =
  'West boundary (local X=0, global X=24) abuts CEO Executive Brain Office (X=16..24). Maintained as a solid full-height interior studio wall supporting the Wireframe / UX Flow Wall and Style System Board; primary room access is via CONNECTOR_SOUTH at [4, 0, 0] (global [28, 0, 18]).';

export const UIUX_FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  {
    id: 'UIUX_Primary_Workstation',
    name: 'Creative L-Desk & Pen-Tablet Design Station',
    category: 'FURNITURE',
    area: 'Zone A — Primary Design Workstation (North-East)',
    position: [5.45, 0, 5.75],
    dimensions: [2.35, 1.32, 1.15],
    materialSummary:
      'Pale Birch & Off-White Studio Desk, Charcoal Ultra-Wide 5K UI Monitor, Angled Pen Display Tablet, Dot-Grid Sketchbook, Sage Task Lamp & Marker Caddy',
    description:
      'Designer-focused creative workstation with pale-wood & matte off-white desktop, ultra-wide UI design monitor (DEMO / CONCEPT canvas), angled interactive pen tablet with stylus stand, pastel keycap mechanical keyboard, Pantone fan deck, dot-grid sketchbook, and articulated sage desk lamp.',
  },
  {
    id: 'UIUX_Studio_Chair',
    name: 'Ergonomic Sage & Lavender Mesh Studio Task Chair',
    category: 'FURNITURE',
    area: 'Zone A — Primary Design Workstation (North-East)',
    position: [5.35, 0, 6.58],
    dimensions: [0.68, 1.08, 0.68],
    materialSummary: 'Muted Sage Bouclé Cushion, Dusty Lavender Lumbar Backrest, White Studio Frame',
    description:
      'Sculpted designer task chair with breathable sage seat, dusty-lavender contoured backrest, white studio armrests, and 5-star caster base positioned behind the creative workstation facing South.',
  },
  {
    id: 'UIUX_Wireframe_Flow_Wall',
    name: '3D UX User-Flow & Wireframe Pinboard Wall',
    category: 'FURNITURE',
    area: 'Zone B — Wireframe / UX Flow Wall (West Wall South-Center)',
    position: [0.34, 1.56, 2.85],
    dimensions: [0.16, 1.42, 2.75],
    materialSummary:
      'Pale Birch Frame, Warm Cork & Porcelain Backing, 3D Mobile/Desktop Wireframe Cards, Peach/Sage/Lavender Sticky Notes (DEMO / CONCEPT)',
    description:
      'Large 3D wall-mounted UX process pinboard featuring raised wireframe app screens, user journey flow connectors, component hierarchy maps, and color-coded sticky notes labeled DEMO / CONCEPT.',
  },
  {
    id: 'UIUX_Style_System_Board',
    name: 'Visual Design System, Typography & Color Swatch Board',
    category: 'FURNITURE',
    area: 'Zone C — Visual Design / Style Board (West Wall North)',
    position: [0.35, 1.58, 5.85],
    dimensions: [0.18, 1.36, 2.15],
    materialSummary:
      'Matte Charcoal & Birch Display Frame, 3D Tactile Color Swatch Tiles (Sage, Teal, Lavender, Coral, Peach), Typography Specimen Blocks & UI Token Cards',
    description:
      'Visual styling and design-system showcase displaying 3D color palette swatches, typography scale specimens, icon grid tiles, and UI button token components (DEMO / CONCEPT).',
  },
  {
    id: 'UIUX_Prototype_Review_Table',
    name: 'Collaborative Round Critique Table & Bouclé Stools',
    category: 'FURNITURE',
    area: 'Zone D — Prototype Review Area (South-East Studio)',
    position: [5.65, 0, 2.55],
    dimensions: [1.68, 0.78, 1.68],
    materialSummary:
      'Pale Birch Round Tabletop, Sage & Dusty-Lavender Studio Stools, Interactive Tablet Prototype Stand, Printed App Wireframe Sheets',
    description:
      'Creative round critique table paired with two sculptural studio stools, an angled tablet prototype dock, printed mobile screen mockups, and color swatch cards for UX design reviews.',
  },
  {
    id: 'UIUX_Mobile_Critique_Stand',
    name: 'Freestanding Mobile Prototype & Component Easel',
    category: 'PROPS',
    area: 'Zone D — Prototype Review Area (East Studio)',
    position: [6.92, 0, 2.35],
    dimensions: [0.58, 1.86, 0.92],
    materialSummary: 'Pale Birch A-Frame Rolling Stand, Porcelain Magnetic Board, 3D Mobile Screen Cards & Coral Pins',
    description:
      'Rolling studio critique easel displaying interactive mobile app flow cards, component states, and critique sticky notes beside the Prototype Review Table.',
  },
  {
    id: 'UIUX_Material_Storage_Shelf',
    name: 'Nordic Birch & Sage Design Library & Material Shelf',
    category: 'FURNITURE',
    area: 'Zone E — Storage / Material Shelf (North-West)',
    position: [2.05, 0, 7.38],
    dimensions: [2.05, 2.42, 0.56],
    materialSummary:
      'Pale Birch Casework, Muted Sage Cubbies, UI/UX Books, Pantone Swatch Binders, Material Sample Boxes & Rolled Blueprint Tubes',
    description:
      'Asymmetric multi-cubby studio storage unit stocked with typography & UX reference books, color swatch binders, tactile material sample boxes, mockup boards, and stationery drawers.',
  },
  {
    id: 'UIUX_Studio_Rug',
    name: 'Woven Geometric Pastel-Sage, Lavender & Coral Studio Rug',
    category: 'DECORATION',
    area: 'Zone F — Cozy Studio Decor (Central Floor)',
    position: [4.15, 0.015, 4.15],
    dimensions: [3.3, 0.02, 2.95],
    materialSummary: 'Woven Cream, Soft Sage, Dusty Lavender & Peach Geometric Pixel Textile',
    description:
      'Handcrafted geometric color-block woven rug grounding the creative studio floor between the Primary Design Workstation, Wireframe Wall, and Prototype Review Area.',
  },
  {
    id: 'UIUX_Lounge_Pouf',
    name: 'Sculpted Dusty-Lavender & Peach Studio Knit Pouf',
    category: 'DECORATION',
    area: 'Zone F — Cozy Studio Decor (West-Central)',
    position: [1.75, 0, 1.55],
    dimensions: [0.68, 0.42, 0.68],
    materialSummary: 'Dusty Lavender Upholstered Bouclé Pouf, Pale Birch Base, Coral Accent Stitch',
    description:
      'Cozy low-profile designer pouf near the Wireframe Wall for casual UX flow brainstorming and studio comfort.',
  },
  {
    id: 'UIUX_Studio_Plants_And_Lamp',
    name: 'Studio Tripod Floor Lamp & Ribbed Ceramic Planters',
    category: 'DECORATION',
    area: 'Zone F — Cozy Studio Decor (Corners)',
    position: [7.05, 0, 7.05],
    dimensions: [0.66, 1.82, 0.66],
    materialSummary: 'Pale Birch Tripod Lamp with Warm Linen Shade, Sage & Terracotta Ribbed Planters, Lush Voxel Foliage',
    description:
      'Nordic tripod floor lamp in the South-West lounge corner paired with sculpted indoor Monstera and Ficus planters in sage-green and peach-terracotta ceramic pots.',
  },
];

export const DEFAULT_UIUX_ANCHORS: Record<UIUXAnchorId, UIUXActivityAnchor> = {
  UIUX_ROOM_SPAWN: {
    id: 'UIUX_ROOM_SPAWN',
    label: 'UI/UX Studio Spawn (South Entry)',
    position: [4.0, 0, 0.95],
    facingRad: 0, // North (+Z)
    posture: 'standing',
    associatedFurnitureId: 'UIUX_CONNECTOR_SOUTH',
    associatedFutureAction: 'idle',
    interactionTarget: 'UIUX_Studio_Rug',
    description: 'Primary entry spawn point inside the South corridor doorway at [4.0, 0, 0.95].',
  },
  UIUX_ROOM_IDLE: {
    id: 'UIUX_ROOM_IDLE',
    label: 'Studio Central Rug Idle Position',
    position: [3.85, 0, 3.85],
    facingRad: Math.PI, // South (-Z)
    posture: 'standing',
    associatedFurnitureId: 'UIUX_Studio_Rug',
    associatedFutureAction: 'idle',
    interactionTarget: 'UIUX_Studio_Rug',
    description: 'Default calm standing position on the central geometric studio rug.',
  },
  UIUX_DESK_APPROACH: {
    id: 'UIUX_DESK_APPROACH',
    label: 'Primary Design Workstation Approach',
    position: [4.25, 0, 6.45],
    facingRad: Math.PI / 2, // East (+X)
    posture: 'standing',
    associatedFurnitureId: 'UIUX_Studio_Chair',
    associatedFutureAction: 'walk_to_design_desk',
    interactionTarget: 'UIUX_Primary_Workstation',
    description: 'Unobstructed approach waypoint on the West side of the Studio Chair before sitting at the workstation.',
  },
  UIUX_DESK_WORK: {
    id: 'UIUX_DESK_WORK',
    label: 'Primary Design Workstation Seated Position',
    position: [5.35, 0, 6.42],
    facingRad: Math.PI, // South (-Z) facing ultra-wide UI monitor and pen tablet
    posture: 'seated',
    approachAnchorId: 'UIUX_DESK_APPROACH',
    associatedFurnitureId: 'UIUX_Primary_Workstation',
    associatedFutureAction: 'design_ui_components',
    interactionTarget: 'UIUX_Primary_Workstation',
    description: 'Seated working anchor behind the Primary Design Workstation facing the 5K UI monitor and angled pen display.',
  },
  UIUX_WIREFRAME_WALL: {
    id: 'UIUX_WIREFRAME_WALL',
    label: 'Wireframe & UX Flow Wall Inspection Point',
    position: [1.35, 0, 2.85],
    facingRad: -Math.PI / 2, // West (-X) facing the West UX Flow Wall
    posture: 'standing',
    associatedFurnitureId: 'UIUX_Wireframe_Flow_Wall',
    associatedFutureAction: 'map_ux_user_flow',
    interactionTarget: 'UIUX_Wireframe_Flow_Wall',
    description: 'Standing UX planning position in front of the 3D Wireframe & User-Flow Pinboard Wall.',
  },
  UIUX_STYLE_BOARD: {
    id: 'UIUX_STYLE_BOARD',
    label: 'Visual Design & Style System Board Anchor',
    position: [1.35, 0, 5.85],
    facingRad: -Math.PI / 2, // West (-X) facing the Style System Board
    posture: 'standing',
    associatedFurnitureId: 'UIUX_Style_System_Board',
    associatedFutureAction: 'curate_style_tokens',
    interactionTarget: 'UIUX_Style_System_Board',
    description: 'Standing inspection position in front of the Color Swatch, Typography & Design Token Board.',
  },
  UIUX_REVIEW_TABLE: {
    id: 'UIUX_REVIEW_TABLE',
    label: 'Prototype Review & Critique Table Anchor',
    position: [4.35, 0, 2.55],
    facingRad: Math.PI / 2, // East (+X) facing the Round Critique Table
    posture: 'standing',
    associatedFurnitureId: 'UIUX_Prototype_Review_Table',
    associatedFutureAction: 'review_interactive_prototype',
    interactionTarget: 'UIUX_Prototype_Review_Table',
    description: 'Collaborative critique anchor beside the Round Prototype Review Table and tablet mockup dock.',
  },
  UIUX_PRESENTATION_POSITION: {
    id: 'UIUX_PRESENTATION_POSITION',
    label: 'Prototype Easel & Design Critique Presentation Point',
    position: [6.15, 0, 3.55],
    facingRad: Math.PI, // South (-Z) facing Mobile Critique Stand
    posture: 'standing',
    associatedFurnitureId: 'UIUX_Mobile_Critique_Stand',
    associatedFutureAction: 'present_design_critique',
    interactionTarget: 'UIUX_Mobile_Critique_Stand',
    description: 'Standing presentation point beside the Freestanding Mobile Prototype & Component Easel.',
  },
  UIUX_STORAGE_SHELF: {
    id: 'UIUX_STORAGE_SHELF',
    label: 'Material & Design Library Shelf Anchor',
    position: [2.05, 0, 6.45],
    facingRad: 0, // North (+Z) facing the Material Storage Shelf
    posture: 'standing',
    associatedFurnitureId: 'UIUX_Material_Storage_Shelf',
    associatedFutureAction: 'browse_material_library',
    interactionTarget: 'UIUX_Material_Storage_Shelf',
    description: 'Standing point in front of the North-West Nordic Birch & Sage Design Library Shelf.',
  },
  UIUX_SOUTH_EXIT: {
    id: 'UIUX_SOUTH_EXIT',
    label: 'South Corridor Doorway Exit [4, 0, 0]',
    position: [4.0, 0, 0.32],
    facingRad: Math.PI, // South (-Z)
    posture: 'standing',
    associatedFurnitureId: 'UIUX_CONNECTOR_SOUTH',
    associatedFutureAction: 'exit_to_corridor',
    interactionTarget: 'UIUX_CONNECTOR_SOUTH',
    description: 'Primary doorway threshold connecting the UI/UX Design Studio to the Shared Corridor at [28, 0, 18] global.',
  },
};

export const UIUX_FUTURE_ACTIONS_CONTRACT: UIUXFutureActionContract[] = [
  {
    id: 'idle',
    code: 'UIUX_ACT_01',
    label: 'Studio Standby / Idle',
    targetAnchorId: 'UIUX_ROOM_IDLE',
    posture: 'standing',
    requiresWalk: false,
    zoneHighlight: 'Zone F — Central Studio Rug',
    simulatedStudioStatus: 'Design System v2.4 Ready · 18 UI Tokens Synced (DEMO / CONCEPT)',
    description: 'Calm standing idle state on the woven pastel-sage & lavender geometric rug.',
  },
  {
    id: 'walk_to_design_desk',
    code: 'UIUX_ACT_02',
    label: 'Approach Design Workstation',
    targetAnchorId: 'UIUX_DESK_APPROACH',
    posture: 'standing',
    requiresWalk: true,
    zoneHighlight: 'Zone A — Primary Design Workstation',
    simulatedStudioStatus: 'Approaching Primary UI/UX Workstation',
    description: 'Routes along walkable studio floor to the approach point beside the ergonomic studio chair.',
  },
  {
    id: 'design_ui_components',
    code: 'UIUX_ACT_03',
    label: 'Design UI Components at Monitor',
    targetAnchorId: 'UIUX_DESK_WORK',
    posture: 'seated',
    requiresWalk: true,
    zoneHighlight: 'Zone A — Primary Design Workstation',
    simulatedStudioStatus: 'Editing Component Library & Auto-Layout Frames (DEMO / CONCEPT)',
    description: 'Seated layout & component system design on the 5K ultra-wide studio monitor.',
  },
  {
    id: 'sketch_pen_tablet',
    code: 'UIUX_ACT_04',
    label: 'Illustrate & Prototype on Pen Display',
    targetAnchorId: 'UIUX_DESK_WORK',
    posture: 'seated',
    requiresWalk: true,
    zoneHighlight: 'Zone A — Primary Design Workstation',
    simulatedStudioStatus: 'Sketching Vector Icons & Micro-Interactions on Stylus Display (DEMO)',
    description: 'Uses the angled interactive drawing tablet and stylus at the Primary Design Workstation.',
  },
  {
    id: 'map_ux_user_flow',
    code: 'UIUX_ACT_05',
    label: 'Map User Flows on Wireframe Wall',
    targetAnchorId: 'UIUX_WIREFRAME_WALL',
    posture: 'standing',
    requiresWalk: true,
    zoneHighlight: 'Zone B — Wireframe / UX Flow Wall',
    simulatedStudioStatus: 'Arranging Onboarding Wireframes & Journey Sticky Notes (DEMO / CONCEPT)',
    description: 'Inspects and organizes 3D wireframe panels and user-flow sticky notes on the West wall.',
  },
  {
    id: 'curate_style_tokens',
    code: 'UIUX_ACT_06',
    label: 'Curate Palette & Typography Tokens',
    targetAnchorId: 'UIUX_STYLE_BOARD',
    posture: 'standing',
    requiresWalk: true,
    zoneHighlight: 'Zone C — Visual Design / Style Board',
    simulatedStudioStatus: 'Auditing Sage/Lavender/Coral Swatches & Type Hierarchy (DEMO / CONCEPT)',
    description: 'Reviews 3D color swatch tiles, typography specimens, and style tiles on the Style System Board.',
  },
  {
    id: 'review_interactive_prototype',
    code: 'UIUX_ACT_07',
    label: 'Review Prototype at Critique Table',
    targetAnchorId: 'UIUX_REVIEW_TABLE',
    posture: 'standing',
    requiresWalk: true,
    zoneHighlight: 'Zone D — Prototype Review Area',
    simulatedStudioStatus: 'Testing Interactive Tablet Prototype & Printed Screens (DEMO / CONCEPT)',
    description: 'Evaluates mobile and tablet prototypes at the round collaborative critique table.',
  },
  {
    id: 'present_design_critique',
    code: 'UIUX_ACT_08',
    label: 'Present Design Critique at Mobile Easel',
    targetAnchorId: 'UIUX_PRESENTATION_POSITION',
    posture: 'standing',
    requiresWalk: true,
    zoneHighlight: 'Zone D — Mobile Prototype Critique Stand',
    simulatedStudioStatus: 'Presenting UX Flow Critique & Component Variants (DEMO / CONCEPT)',
    description: 'Presents app screen concepts on the freestanding rolling critique easel.',
  },
  {
    id: 'browse_material_library',
    code: 'UIUX_ACT_09',
    label: 'Browse Pantone Binders & Material Shelf',
    targetAnchorId: 'UIUX_STORAGE_SHELF',
    posture: 'standing',
    requiresWalk: true,
    zoneHighlight: 'Zone E — Storage / Material Shelf',
    simulatedStudioStatus: 'Inspecting Design System Volumes & Swatch Samples (DEMO / CONCEPT)',
    description: 'Selects reference books, swatch decks, and sample folders from the North-West storage shelf.',
  },
  {
    id: 'exit_to_corridor',
    code: 'UIUX_ACT_10',
    label: 'Exit via South Corridor Connector',
    targetAnchorId: 'UIUX_SOUTH_EXIT',
    posture: 'standing',
    requiresWalk: true,
    zoneHighlight: 'South Connector [4, 0, 0]',
    simulatedStudioStatus: 'Transitioning to Shared Executive Corridor [28, 0, 18]',
    description: 'Approaches the South doorway threshold connecting to the Shared Corridor.',
  },
];

export const UIUX_CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'isometric',
    label: 'UI/UX Studio Isometric Default',
    shortLabel: 'UI/UX Iso',
    category: 'standard',
    position: [13.6, 11.2, -5.6],
    target: [4.0, 1.15, 4.0],
    zoom: 76,
    description: 'Three-quarter orthographic isometric view of the UI/UX Design Studio.',
  },
  {
    id: 'front',
    label: 'Front (South-East Studio Cutaway)',
    shortLabel: 'Front',
    category: 'standard',
    position: [11.5, 4.4, -3.5],
    target: [4.0, 1.2, 4.0],
    zoom: 78,
    description: 'Low front elevation across the South corridor doorway and critique area.',
  },
  {
    id: 'top',
    label: 'Top-Down Studio Floor Plan (8×8)',
    shortLabel: 'Top-Down',
    category: 'standard',
    position: [4.0, 24.0, 3.99],
    target: [4.0, 0.0, 4.0],
    zoom: 76,
    description: 'Orthographic floor plan verifying 8×8 bounds, 6 studio zones, and 10 room-local anchors.',
  },
  {
    id: 'uiux_desk_closeup',
    label: 'Close-Up: Primary Design Workstation & Pen Display',
    shortLabel: 'Design Desk',
    category: 'inspection',
    position: [9.4, 5.2, 1.8],
    target: [5.45, 1.05, 5.75],
    zoom: 160,
    description: 'Close inspection of the pale-birch L-desk, 5K UI monitor, angled stylus tablet, sketchbook, and sage lamp.',
  },
  {
    id: 'uiux_wireframe_closeup',
    label: 'Close-Up: 3D Wireframe & User-Flow Wall',
    shortLabel: 'Wireframe Wall',
    category: 'inspection',
    position: [6.4, 4.8, 0.6],
    target: [0.34, 1.52, 2.85],
    zoom: 155,
    description: 'Close inspection of the West-wall 3D wireframe screen cards, user-flow nodes, and sticky notes.',
  },
  {
    id: 'uiux_style_board_closeup',
    label: 'Close-Up: Visual Design & Color Swatch Board',
    shortLabel: 'Style Board',
    category: 'inspection',
    position: [6.4, 5.0, 3.2],
    target: [0.35, 1.55, 5.85],
    zoom: 160,
    description: 'Close inspection of the tactile 3D color swatch tiles, typography specimens, and UI token cards.',
  },
  {
    id: 'uiux_review_area_closeup',
    label: 'Close-Up: Prototype Review Table & Critique Easel',
    shortLabel: 'Critique Area',
    category: 'inspection',
    position: [10.2, 5.4, -0.8],
    target: [5.85, 0.95, 3.15],
    zoom: 150,
    description: 'Close inspection of the round birch critique table, bouclé stools, tablet stand, and mobile easel.',
  },
  {
    id: 'uiux_storage_shelf_closeup',
    label: 'Close-Up: Nordic Birch & Sage Material Library Shelf',
    shortLabel: 'Material Shelf',
    category: 'inspection',
    position: [6.8, 5.6, 2.2],
    target: [2.05, 1.32, 7.25],
    zoom: 155,
    description: 'Close inspection of the asymmetric design shelf, Pantone binders, material boxes, and blueprint tubes.',
  },
];

export interface UIUXRoomBehaviorJsonV1 {
  schema_version: 'AI_OFFICE_UIUX_ROOM_BEHAVIOR_CONTRACT_V1';
  room_asset_id: typeof UIUX_MODULE_CONSTANTS.ASSET_ID;
  room_module_id: typeof UIUX_MODULE_CONSTANTS.MODULE_ID;
  department_type: typeof UIUX_MODULE_CONSTANTS.DEPARTMENT_TYPE;
  implementation_status: 'ROOM_ENVIRONMENT_ONLY — NO_UIUX_CHARACTER_IN_THIS_TASK';
  character_status: 'DEFERRED_NEXT_STAGE';
  character_deferral_notice: string;
  future_actions: UIUXFutureActionContract[];
}

export function buildUIUXRoomBehaviorJson(): UIUXRoomBehaviorJsonV1 {
  return {
    schema_version: 'AI_OFFICE_UIUX_ROOM_BEHAVIOR_CONTRACT_V1',
    room_asset_id: UIUX_MODULE_CONSTANTS.ASSET_ID,
    room_module_id: UIUX_MODULE_CONSTANTS.MODULE_ID,
    department_type: UIUX_MODULE_CONSTANTS.DEPARTMENT_TYPE,
    implementation_status: 'ROOM_ENVIRONMENT_ONLY — NO_UIUX_CHARACTER_IN_THIS_TASK',
    character_status: 'DEFERRED_NEXT_STAGE',
    character_deferral_notice:
      'Room-First Workflow: Module 03 (UI/UX Design Studio) delivers the permanent 8×8 interior environment, 6 functional design zones, and 10 validated anchors. The Lead UI/UX Designer character and animation state machine are intentionally deferred until after room approval.',
    future_actions: UIUX_FUTURE_ACTIONS_CONTRACT,
  };
}

export function generateUIUXRoomLegacyManifest(stats: RoomExportStats | null) {
  return {
    module_id: UIUX_MODULE_CONSTANTS.MODULE_ID,
    asset_id: UIUX_MODULE_CONSTANTS.ASSET_ID,
    version: UIUX_MODULE_CONSTANTS.VERSION,
    display_name: UIUX_MODULE_CONSTANTS.DISPLAY_NAME,
    department_type: UIUX_MODULE_CONSTANTS.DEPARTMENT_TYPE,
    root_node: UIUX_MODULE_CONSTANTS.ROOT_NODE_NAME,
    glb_filename: UIUX_MODULE_CONSTANTS.GLB_FILENAME,
    footprint: {
      width: UIUX_MODULE_CONSTANTS.FOOTPRINT_WIDTH,
      depth: UIUX_MODULE_CONSTANTS.FOOTPRINT_DEPTH,
      wall_height: UIUX_MODULE_CONSTANTS.WALL_HEIGHT,
      local_origin: UIUX_MODULE_CONSTANTS.LOCAL_ORIGIN,
      global_a3_offset: UIUX_MODULE_CONSTANTS.GLOBAL_A3_OFFSET,
    },
    connectors: UIUX_CONNECTORS_SPEC,
    west_adjacency_note: UIUX_WEST_ADJACENCY_NOTE,
    furniture_catalog_count: UIUX_FURNITURE_CATALOG.length,
    anchors_count: Object.keys(DEFAULT_UIUX_ANCHORS).length,
    character_status: 'ROOM_ONLY_NO_CHARACTER',
    stats: stats || {
      meshCount: 0,
      triangleCount: 0,
      materialCount: 0,
      boundingBox: {
        min: [0, -0.16, 0],
        max: [8, 3.2, 8],
        size: [8, 3.36, 8],
      },
    },
  };
}

export function checkUIUXFurnitureClearance(
  items: FurnitureCatalogItem[] = UIUX_FURNITURE_CATALOG,
  anchors: Record<UIUXAnchorId, UIUXActivityAnchor> = DEFAULT_UIUX_ANCHORS
): {
  valid: boolean;
  southConnectorClear: boolean;
  withinRoomBounds: boolean;
  anchorsUnobstructed: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  let southConnectorClear = true;
  let withinRoomBounds = true;
  let anchorsUnobstructed = true;

  const southZone = UIUX_CONNECTORS_SPEC.SOUTH.clearance_zone;

  for (const item of items) {
    if (item.category !== 'FURNITURE' && item.category !== 'PROPS') continue;
    const [cx, , cz] = item.position;
    const [w, , d] = item.dimensions;
    const minX = cx - w / 2;
    const maxX = cx + w / 2;
    const minZ = cz - d / 2;
    const maxZ = cz + d / 2;

    if (
      minX < 0 ||
      maxX > UIUX_MODULE_CONSTANTS.FOOTPRINT_WIDTH ||
      minZ < 0 ||
      maxZ > UIUX_MODULE_CONSTANTS.FOOTPRINT_DEPTH
    ) {
      withinRoomBounds = false;
      violations.push(`${item.name} extends outside 8×8 UI/UX Studio bounds.`);
    }

    const overlapsSouth =
      maxX > southZone.minX &&
      minX < southZone.maxX &&
      maxZ > southZone.minZ &&
      minZ < southZone.maxZ;
    if (overlapsSouth) {
      southConnectorClear = false;
      violations.push(`${item.name} obstructs South Corridor Connector clearance zone.`);
    }
  }

  for (const anchor of Object.values(anchors)) {
    const [ax, ay, az] = anchor.position;
    if (ax < 0.2 || ax > 7.8 || az < 0.2 || az > 7.8 || Math.abs(ay) > 0.01) {
      anchorsUnobstructed = false;
      violations.push(`Anchor ${anchor.id} is out of valid walkable floor bounds.`);
    }
  }

  return {
    valid: southConnectorClear && withinRoomBounds && anchorsUnobstructed,
    southConnectorClear,
    withinRoomBounds,
    anchorsUnobstructed,
    violations,
  };
}
