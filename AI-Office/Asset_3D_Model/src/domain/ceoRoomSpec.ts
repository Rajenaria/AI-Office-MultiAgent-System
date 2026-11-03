import { CameraPreset, ConnectorSpec, FurnitureCatalogItem, RoomExportStats } from './modularRoomSpec';

export type CEOAnchorId =
  | 'CEO_ROOM_SPAWN'
  | 'CEO_DESK_APPROACH'
  | 'CEO_DESK_WORK'
  | 'CEO_CHAIR_POSITION'
  | 'CEO_BRAIN_CONSOLE'
  | 'CEO_REPORT_RECEPTION'
  | 'CEO_DISCUSSION_AREA'
  | 'CEO_WINDOW_VIEW'
  | 'CEO_ROOM_IDLE'
  | 'CEO_SOUTH_EXIT'
  | 'CEO_WEST_CONNECTION';

export type CEOFutureActionId =
  | 'idle'
  | 'walk_to_desk'
  | 'review_pm_report'
  | 'inspect_executive_brain'
  | 'review_project_status'
  | 'prepare_executive_summary'
  | 'discuss_with_pm'
  | 'review_pending_approval'
  | 'prepare_telegram_report'
  | 'report_sent'
  | 'waiting_for_owner_decision';

export interface CEOActivityAnchor {
  id: CEOAnchorId;
  label: string;
  position: [number, number, number];
  facingRad: number;
  posture: 'standing' | 'seated';
  approachAnchorId?: CEOAnchorId;
  associatedFurnitureId: string | null;
  associatedFutureAction: CEOFutureActionId;
  description: string;
}

export interface CEOFutureActionContract {
  id: CEOFutureActionId;
  code: string;
  label: string;
  targetAnchorId: CEOAnchorId;
  posture: 'standing' | 'seated';
  requiresWalk: boolean;
  consolePanelHighlight: string | null;
  simulatedScreenStatus: string;
  description: string;
}

export interface CEODemoTelemetryData {
  dataClassification: 'DEMO_DATA_ONLY';
  activeProjects: number;
  pmReports: number;
  pendingApprovals: number;
  weeklySummaryStatus: 'Prepared';
  telegramReportStatus: 'Demo / Not Sent';
  knowledgeNodesIndexed: number;
  strategicHealthScore: string;
  consolePanels: Array<{
    id: string;
    title: string;
    value: string;
    accent: 'teal' | 'amber' | 'emerald' | 'slate';
    summary: string;
  }>;
}

export const CEO_MODULE_CONSTANTS = {
  MODULE_ID: 'AI_OFFICE_ROOM_CEO_v1',
  ASSET_ID: 'ai_office.room.ceo_executive_brain.v1',
  VERSION: '1.0.0',
  DISPLAY_NAME: 'CEO Office — Executive Brain Command Center',
  SHORT_NAME: 'CEO Executive Brain Office',
  ROOT_NODE_NAME: 'ROOM_CEO_ROOT',
  GLB_FILENAME: 'ceo_room.glb',
  MANIFEST_FILENAME: 'ceo_room.manifest.json',
  ANCHORS_FILENAME: 'ceo_room.anchors.json',
  BEHAVIOR_FILENAME: 'ceo_room.behavior.json',
  PREVIEW_FILENAME: 'ceo_room.preview.png',
  GRID_SIZE: 1.0,
  FOOTPRINT_WIDTH: 8.0,
  FOOTPRINT_DEPTH: 8.0,
  FLOOR_ELEVATION: 0.0,
  FLOOR_THICKNESS: 0.16,
  WALL_HEIGHT: 3.2,
  LOCAL_ORIGIN: [0, 0, 0] as [number, number, number],
  GLOBAL_A3_OFFSET: [16, 0, 18] as [number, number, number],
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

export interface CEOConnectorSpec extends Omit<ConnectorSpec, 'side' | 'outward_direction'> {
  side: 'WEST' | 'SOUTH';
  outward_direction: '-X' | '-Z';
}

export const CEO_CONNECTORS_SPEC: Record<'WEST' | 'SOUTH', CEOConnectorSpec> = {
  WEST: {
    id: 'CEO_CONNECTOR_WEST',
    name: 'West Passage — Direct PM & Strategy Room Link',
    side: 'WEST',
    position: [0, 0, 4],
    outward_direction: '-X',
    normal: [-1, 0, 0],
    width: 2.0,
    height: 2.3,
    span_range: [3.0, 5.0],
    clearance_zone: {
      minX: 0.0,
      maxX: 1.25,
      minZ: 3.0,
      maxZ: 5.0,
    },
    removable_wall_node: 'CEO_Connector_West_Removable_Doorway',
  },
  SOUTH: {
    id: 'CEO_CONNECTOR_SOUTH',
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
    removable_wall_node: 'CEO_Connector_South_Removable_Threshold',
  },
};

export const CEO_DEMO_TELEMETRY: CEODemoTelemetryData = {
  dataClassification: 'DEMO_DATA_ONLY',
  activeProjects: 3,
  pmReports: 2,
  pendingApprovals: 1,
  weeklySummaryStatus: 'Prepared',
  telegramReportStatus: 'Demo / Not Sent',
  knowledgeNodesIndexed: 48,
  strategicHealthScore: '94% On-Track',
  consolePanels: [
    {
      id: 'PANEL_ORG_OVERVIEW',
      title: 'Organization Overview',
      value: '7 Modules · 2 Ready',
      accent: 'teal',
      summary: 'A3 Master Office: PM & Strategy + CEO Brain Online (DEMO DATA)',
    },
    {
      id: 'PANEL_ACTIVE_PROJECTS',
      title: 'Active Projects',
      value: '3 Active',
      accent: 'teal',
      summary: 'Q4 Roadmap, Modular Lab V2, Agent Handoff Spec (DEMO DATA)',
    },
    {
      id: 'PANEL_PM_REPORTS',
      title: 'PM Reports',
      value: '2 Received',
      accent: 'emerald',
      summary: 'Sprint 14 Velocity & Resource Allocation Briefs (DEMO DATA)',
    },
    {
      id: 'PANEL_STRATEGIC_DECISIONS',
      title: 'Strategic Decisions',
      value: '4 Logged',
      accent: 'slate',
      summary: 'Owner-Approved Architecture & Voxel Standard (DEMO DATA)',
    },
    {
      id: 'PANEL_PENDING_APPROVAL',
      title: 'Pending Approval',
      value: '1 Awaiting Owner',
      accent: 'amber',
      summary: 'Q4 Milestone Sign-Off queued for Human Owner (DEMO DATA)',
    },
    {
      id: 'PANEL_TELEGRAM_STATUS',
      title: 'Telegram Reporting Status',
      value: 'Demo / Not Sent',
      accent: 'amber',
      summary: 'Executive Digest staged locally — no external API call',
    },
    {
      id: 'PANEL_MEMORY_KNOWLEDGE',
      title: 'Memory / Knowledge Overview',
      value: '48 Decision Nodes',
      accent: 'teal',
      summary: 'Shared Brain Index: Architecture, Specs, Audit Logs (DEMO DATA)',
    },
  ],
};

export const CEO_FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  {
    id: 'CEO_Executive_Desk',
    name: 'Executive Command Desk (Walnut & Brass)',
    category: 'FURNITURE',
    area: 'Zone A — Executive Desk & Command Station',
    position: [4.5, 0, 5.75],
    dimensions: [2.2, 0.78, 1.05],
    materialSummary: 'Dark Walnut Casework, Warm Oak Inlay, Dark Green Leather Blotter, Brushed Brass Handles',
    description:
      'Flagship walnut executive desk with stepped architectural front, dual drawer pedestals, brass hardware, dark-green leather writing pad, brass banker lamp, fountain pen stand, and executive dossiers.',
  },
  {
    id: 'CEO_Executive_Chair',
    name: 'High-Back Tufted Executive Chair',
    category: 'FURNITURE',
    area: 'Zone A — Executive Desk & Command Station',
    position: [4.5, 0, 6.68],
    dimensions: [0.72, 1.18, 0.72],
    materialSummary: 'Deep Forest-Green & Espresso Leather, Walnut Armrests, Brass 5-Star Base',
    description:
      'High-back executive command chair positioned behind the Executive Desk facing South toward the Report Review Area and corridor doorway.',
  },
  {
    id: 'CEO_Computer_Station',
    name: 'Dual-Display Executive Computer Station',
    category: 'PROPS',
    area: 'Zone B — Executive Computer Station',
    position: [4.5, 0.78, 5.65],
    dimensions: [1.45, 0.56, 0.48],
    materialSummary: 'Muted Charcoal Bezels, Brushed Brass Stand, Crisp Pixel DEMO DATA Screens',
    description:
      'Primary widescreen monitor + angled secondary Executive Dashboard display showing simulated DEMO DATA (Active Projects: 3, PM Reports: 2, Pending Approvals: 1, Weekly Summary: Prepared, Telegram Report: Demo / Not Sent), mechanical keyboard, mouse, and cable management tray.',
  },
  {
    id: 'CEO_Executive_Brain_Console',
    name: 'Executive Brain Strategic Command Console',
    category: 'FURNITURE',
    area: 'Zone C — Executive Brain Console (West Command Wall)',
    position: [0.58, 0, 1.68],
    dimensions: [0.76, 2.38, 2.55],
    materialSummary: 'Walnut Credenza Base, Charcoal Instrument Frame, Brushed Brass Trim, 7 Pixel DEMO DATA Panels',
    description:
      'Signature voxel command console & wall-mounted strategic display along the South-West command wall visualizing Organization Overview, Active Projects, PM Reports, Strategic Decisions, Pending Approval, Telegram Status, and Memory/Knowledge Overview.',
  },
  {
    id: 'CEO_Report_Review_Area',
    name: 'PM Report Review & Discussion Table Set',
    category: 'FURNITURE',
    area: 'Zone D — Report Review Area (East-Central)',
    position: [5.65, 0, 2.55],
    dimensions: [1.55, 0.76, 1.45],
    materialSummary: 'Warm Walnut Tabletop, Brass Foot Caps, 2 Muted Dark-Green Upholstered Guest Chairs, Document Trays',
    description:
      'Compact executive review table with two guest chairs, layered inbox/outbox document trays, PM report binders, and a companion folder credenza.',
  },
  {
    id: 'CEO_Strategy_Cabinet',
    name: 'Executive Strategy & Archive Bookcase Cabinet',
    category: 'FURNITURE',
    area: 'Zone E — Bookshelf / Strategy Cabinet (North-West)',
    position: [1.75, 0, 7.38],
    dimensions: [1.72, 2.54, 0.58],
    materialSummary: 'Rich Walnut Casework, Brushed Brass Trim, Pixel Strategy Books, Report Binders & Trophy',
    description:
      'Five-tier executive bookcase and lower archive cabinet storing strategic planning volumes, Q1–Q4 PM report binders, archival boxes, and a brushed-brass executive excellence trophy.',
  },
  {
    id: 'CEO_Wall_Planning_Board',
    name: 'Wall-Mounted Executive OKR & Decision Board',
    category: 'FURNITURE',
    area: 'Zone F — Wall Design & Windows',
    position: [0.32, 1.62, 6.25],
    dimensions: [0.12, 1.24, 1.85],
    materialSummary: 'Walnut Frame, Cream Porcelain Board, Teal & Amber Pixel Decision Cards',
    description:
      'Framed strategic OKR and quarterly decision board mounted on the North-West wall section north of the PM-Room connector doorway.',
  },
  {
    id: 'CEO_Area_Rug',
    name: 'Woven Emerald-Green & Brass Executive Rug',
    category: 'DECORATION',
    area: 'Zone G — Cozy Executive Decoration',
    position: [4.35, 0.015, 4.15],
    dimensions: [3.1, 0.02, 2.8],
    materialSummary: 'Muted Forest-Green Woven Textile with Warm Gold/Cream Pixel Border',
    description:
      'Handcrafted pixel-woven executive rug anchoring the central command floor between the Executive Desk, Brain Console, and Report Review Area.',
  },
  {
    id: 'CEO_Floor_Lamp',
    name: 'Warm Brass & Cream Executive Floor Lamp',
    category: 'PROPS',
    area: 'Zone G — Cozy Executive Decoration',
    position: [6.85, 0, 7.15],
    dimensions: [0.48, 1.78, 0.48],
    materialSummary: 'Brushed Brass Column, Warm Cream Illuminated Linen Shade',
    description:
      'Tall brass floor lamp in the North-East corner casting warm ambient light across the Executive Desk and Brain Console.',
  },
  {
    id: 'CEO_Corner_Plants',
    name: 'Executive Indoor Planters (Monstera & Ficus)',
    category: 'DECORATION',
    area: 'Zone G — Cozy Executive Decoration',
    position: [6.95, 0, 1.25],
    dimensions: [0.65, 1.15, 0.65],
    materialSummary: 'Cream Ceramic & Terracotta Planters, Multi-Tone Voxel Foliage',
    description:
      'Sculpted voxel indoor plants adding natural warmth beside the Executive Brain Console and South-East entrance corner.',
  },
];

export const DEFAULT_CEO_ANCHORS: Record<CEOAnchorId, CEOActivityAnchor> = {
  CEO_ROOM_SPAWN: {
    id: 'CEO_ROOM_SPAWN',
    label: 'CEO Room Spawn (South Entry)',
    position: [4.0, 0, 0.95],
    facingRad: 0, // North (+Z)
    posture: 'standing',
    associatedFurnitureId: 'CEO_CONNECTOR_SOUTH',
    associatedFutureAction: 'idle',
    description: 'Primary entry spawn inside the South doorway from the Shared Corridor.',
  },
  CEO_DESK_APPROACH: {
    id: 'CEO_DESK_APPROACH',
    label: 'Executive Desk Approach',
    position: [3.25, 0, 6.55],
    facingRad: Math.PI / 2, // East (+X)
    posture: 'standing',
    associatedFurnitureId: 'CEO_Executive_Chair',
    associatedFutureAction: 'walk_to_desk',
    description: 'Clear approach waypoint beside the Executive Desk before stepping behind the chair.',
  },
  CEO_DESK_WORK: {
    id: 'CEO_DESK_WORK',
    label: 'Executive Desk Active Work Position',
    position: [4.5, 0, 6.38],
    facingRad: Math.PI, // South (-Z) facing dual monitors and room
    posture: 'seated',
    approachAnchorId: 'CEO_DESK_APPROACH',
    associatedFurnitureId: 'CEO_Executive_Desk',
    associatedFutureAction: 'prepare_executive_summary',
    description: 'Seated working position at the Dual-Display Executive Computer Station.',
  },
  CEO_CHAIR_POSITION: {
    id: 'CEO_CHAIR_POSITION',
    label: 'Executive Chair Position',
    position: [4.5, 0, 6.68],
    facingRad: Math.PI, // South (-Z)
    posture: 'seated',
    approachAnchorId: 'CEO_DESK_APPROACH',
    associatedFurnitureId: 'CEO_Executive_Chair',
    associatedFutureAction: 'waiting_for_owner_decision',
    description: 'Primary seated anchor on the High-Back Tufted Executive Chair.',
  },
  CEO_BRAIN_CONSOLE: {
    id: 'CEO_BRAIN_CONSOLE',
    label: 'Executive Brain Console Inspection Point',
    position: [1.55, 0, 1.68],
    facingRad: -Math.PI / 2, // West (-X) facing the West-wall console
    posture: 'standing',
    associatedFurnitureId: 'CEO_Executive_Brain_Console',
    associatedFutureAction: 'inspect_executive_brain',
    description: 'Standing inspection point directly in front of the 7-panel Executive Brain Console.',
  },
  CEO_REPORT_RECEPTION: {
    id: 'CEO_REPORT_RECEPTION',
    label: 'PM Report Reception Point',
    position: [1.45, 0, 3.85],
    facingRad: -Math.PI / 2, // West (-X) facing PM Room connector
    posture: 'standing',
    associatedFurnitureId: 'CEO_Report_Review_Area',
    associatedFutureAction: 'review_pm_report',
    description: 'Standing reception point near the West connector where PM briefings and reports arrive.',
  },
  CEO_DISCUSSION_AREA: {
    id: 'CEO_DISCUSSION_AREA',
    label: 'Report Review & Discussion Table Anchor',
    position: [4.55, 0, 2.55],
    facingRad: Math.PI / 2, // East (+X) facing review table
    posture: 'standing',
    associatedFurnitureId: 'CEO_Report_Review_Area',
    associatedFutureAction: 'discuss_with_pm',
    description: 'Discussion anchor beside the Report Review Table for cross-department alignment.',
  },
  CEO_WINDOW_VIEW: {
    id: 'CEO_WINDOW_VIEW',
    label: 'North Panoramic Window Viewpoint',
    position: [5.85, 0, 7.05],
    facingRad: 0, // North (+Z)
    posture: 'standing',
    associatedFurnitureId: 'Window_North_Executive_Panorama',
    associatedFutureAction: 'review_project_status',
    description: 'Contemplative standing point looking out the North casement windows.',
  },
  CEO_ROOM_IDLE: {
    id: 'CEO_ROOM_IDLE',
    label: 'CEO Room Central Rug Idle',
    position: [4.35, 0, 4.15],
    facingRad: Math.PI, // South (-Z)
    posture: 'standing',
    associatedFurnitureId: 'CEO_Area_Rug',
    associatedFutureAction: 'idle',
    description: 'Central standing idle position on the woven emerald-and-brass executive rug.',
  },
  CEO_SOUTH_EXIT: {
    id: 'CEO_SOUTH_EXIT',
    label: 'South Corridor Doorway Exit [4, 0, 0]',
    position: [4.0, 0, 0.32],
    facingRad: Math.PI, // South (-Z)
    posture: 'standing',
    associatedFurnitureId: 'CEO_CONNECTOR_SOUTH',
    associatedFutureAction: 'report_sent',
    description: 'Doorway threshold connecting the CEO Office to the Shared Corridor at [20, 0, 18] global.',
  },
  CEO_WEST_CONNECTION: {
    id: 'CEO_WEST_CONNECTION',
    label: 'West PM-Room Connector [0, 0, 4]',
    position: [0.38, 0, 4.0],
    facingRad: -Math.PI / 2, // West (-X)
    posture: 'standing',
    associatedFurnitureId: 'CEO_CONNECTOR_WEST',
    associatedFutureAction: 'discuss_with_pm',
    description: 'Direct inter-room doorway connecting the CEO Office to the PM & Strategy Room at [16, 0, 22] global.',
  },
};

export const CEO_FUTURE_ACTIONS_CONTRACT: CEOFutureActionContract[] = [
  {
    id: 'idle',
    code: 'CEO_ACT_01',
    label: 'Idle',
    targetAnchorId: 'CEO_ROOM_IDLE',
    posture: 'standing',
    requiresWalk: false,
    consolePanelHighlight: null,
    simulatedScreenStatus: 'Executive Brain Standby · 3 Active Projects (DEMO DATA)',
    description: 'Default calm standing state on the central executive rug.',
  },
  {
    id: 'walk_to_desk',
    code: 'CEO_ACT_02',
    label: 'Walk to Desk',
    targetAnchorId: 'CEO_DESK_APPROACH',
    posture: 'standing',
    requiresWalk: true,
    consolePanelHighlight: null,
    simulatedScreenStatus: 'Approaching Executive Workstation',
    description: 'Routes along walkable floor path to the Executive Desk approach point.',
  },
  {
    id: 'review_pm_report',
    code: 'CEO_ACT_03',
    label: 'Review PM Report',
    targetAnchorId: 'CEO_REPORT_RECEPTION',
    posture: 'standing',
    requiresWalk: true,
    consolePanelHighlight: 'PANEL_PM_REPORTS',
    simulatedScreenStatus: 'PM Reports: 2 Received (Sprint 14 Brief) — DEMO DATA',
    description: 'Inspects incoming PM report folders at the Report Reception & Review Area.',
  },
  {
    id: 'inspect_executive_brain',
    code: 'CEO_ACT_04',
    label: 'Inspect Executive Brain',
    targetAnchorId: 'CEO_BRAIN_CONSOLE',
    posture: 'standing',
    requiresWalk: true,
    consolePanelHighlight: 'PANEL_ORG_OVERVIEW',
    simulatedScreenStatus: 'Inspecting 7-Panel Executive Brain Console — DEMO DATA',
    description: 'Walks to the East wall Executive Brain Console to inspect organizational telemetry.',
  },
  {
    id: 'review_project_status',
    code: 'CEO_ACT_05',
    label: 'Review Project Status',
    targetAnchorId: 'CEO_BRAIN_CONSOLE',
    posture: 'standing',
    requiresWalk: true,
    consolePanelHighlight: 'PANEL_ACTIVE_PROJECTS',
    simulatedScreenStatus: 'Active Projects: 3 · Strategic Health 94% — DEMO DATA',
    description: 'Evaluates cross-department project milestones on the Executive Brain Console.',
  },
  {
    id: 'prepare_executive_summary',
    code: 'CEO_ACT_06',
    label: 'Prepare Executive Summary',
    targetAnchorId: 'CEO_DESK_WORK',
    posture: 'seated',
    requiresWalk: true,
    consolePanelHighlight: 'PANEL_MEMORY_KNOWLEDGE',
    simulatedScreenStatus: 'Weekly Summary: Prepared (Ready for Owner Review) — DEMO DATA',
    description: 'Synthesizes PM reports into a concise weekly summary at the Dual-Display Computer Station.',
  },
  {
    id: 'discuss_with_pm',
    code: 'CEO_ACT_07',
    label: 'Discuss with PM',
    targetAnchorId: 'CEO_DISCUSSION_AREA',
    posture: 'standing',
    requiresWalk: true,
    consolePanelHighlight: 'PANEL_PM_REPORTS',
    simulatedScreenStatus: 'Cross-Room PM/Executive Alignment Session — DEMO DATA',
    description: 'Meets with the PM near the Report Review Area and West PM-Room Connector.',
  },
  {
    id: 'review_pending_approval',
    code: 'CEO_ACT_08',
    label: 'Review Pending Approval',
    targetAnchorId: 'CEO_DESK_WORK',
    posture: 'seated',
    requiresWalk: true,
    consolePanelHighlight: 'PANEL_PENDING_APPROVAL',
    simulatedScreenStatus: 'Pending Approvals: 1 (Queued for Human Owner) — DEMO DATA',
    description: 'Prepares decision dossier for the 1 pending approval awaiting the Human Owner.',
  },
  {
    id: 'prepare_telegram_report',
    code: 'CEO_ACT_09',
    label: 'Prepare Telegram Report',
    targetAnchorId: 'CEO_BRAIN_CONSOLE',
    posture: 'standing',
    requiresWalk: true,
    consolePanelHighlight: 'PANEL_TELEGRAM_STATUS',
    simulatedScreenStatus: 'Telegram Report: Demo / Not Sent (Staged Locally)',
    description: 'Formats executive briefing digest for Telegram notification preview (visual demo only).',
  },
  {
    id: 'report_sent',
    code: 'CEO_ACT_10',
    label: 'Report Sent',
    targetAnchorId: 'CEO_DESK_WORK',
    posture: 'seated',
    requiresWalk: false,
    consolePanelHighlight: 'PANEL_TELEGRAM_STATUS',
    simulatedScreenStatus: 'Executive Digest Logged (Simulation Demo State)',
    description: 'Confirmation state after staging the executive briefing report.',
  },
  {
    id: 'waiting_for_owner_decision',
    code: 'CEO_ACT_11',
    label: 'Waiting for Owner Decision',
    targetAnchorId: 'CEO_CHAIR_POSITION',
    posture: 'seated',
    requiresWalk: true,
    consolePanelHighlight: 'PANEL_PENDING_APPROVAL',
    simulatedScreenStatus: 'Awaiting Human Owner (Real CEO) Final Decision — DEMO DATA',
    description: 'Standby state while awaiting strategic sign-off from the Human Owner.',
  },
];

export const CEO_CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'isometric',
    label: 'CEO Isometric Default',
    shortLabel: 'CEO Iso',
    category: 'standard',
    position: [13.6, 11.2, -5.6],
    target: [4.0, 1.15, 4.0],
    zoom: 76,
    description: 'Three-quarter isometric view of the CEO Executive Brain Office.',
  },
  {
    id: 'front',
    label: 'Front (South-East Cutaway)',
    shortLabel: 'Front',
    category: 'standard',
    position: [11.5, 4.4, -3.5],
    target: [4.0, 1.2, 4.0],
    zoom: 78,
    description: 'Low front elevation across the South corridor threshold.',
  },
  {
    id: 'top',
    label: 'Top-Down Executive Plan',
    shortLabel: 'Top-Down',
    category: 'standard',
    position: [4.0, 24.0, 3.99],
    target: [4.0, 0.0, 4.0],
    zoom: 76,
    description: 'Orthographic floor plan verifying 8×8 bounds, furniture clearances, and 11 CEO anchors.',
  },
  {
    id: 'ceo_monitors_front',
    label: 'Close-Up: CEO Dual Monitors (Chair Viewpoint)',
    shortLabel: 'Dual Monitors',
    category: 'inspection',
    position: [6.8, 4.2, 10.2],
    target: [4.5, 1.08, 5.52],
    zoom: 195,
    description: 'View from behind the CEO Executive Chair showing both monitor display surfaces facing the seated user.',
  },
  {
    id: 'ceo_desk_closeup',
    label: 'Close-Up: Executive Command Desk & Rear Monitor Stands',
    shortLabel: 'CEO Desk',
    category: 'inspection',
    position: [8.8, 5.2, 1.4],
    target: [4.5, 1.05, 5.75],
    zoom: 160,
    description: 'Close inspection of the Walnut Executive Desk, Dual-Display Computer Station, and rear VESA stands.',
  },
  {
    id: 'brain_console_closeup',
    label: 'Close-Up: 7-Panel Executive Brain Console',
    shortLabel: 'Brain Console',
    category: 'inspection',
    position: [6.2, 4.8, 0.2],
    target: [0.58, 1.35, 1.68],
    zoom: 155,
    description: 'Close inspection of the 7-panel Executive Brain Console and its strategic DEMO DATA panels.',
  },
  {
    id: 'report_review_closeup',
    label: 'Close-Up: Report Review Table & PM Connector',
    shortLabel: 'Report Review',
    category: 'inspection',
    position: [9.8, 5.5, -1.2],
    target: [5.65, 0.85, 2.55],
    zoom: 155,
    description: 'Close inspection of the PM Report Review Area and document trays.',
  },
  {
    id: 'strategy_cabinet_closeup',
    label: 'Close-Up: Strategy Cabinet & OKR Board',
    shortLabel: 'Strategy Cabinet',
    category: 'inspection',
    position: [6.8, 5.8, 2.2],
    target: [1.75, 1.35, 7.25],
    zoom: 155,
    description: 'Close inspection of the North-West Strategy Bookcase Cabinet and OKR Decision Board.',
  },
];

export interface CEORoomBehaviorJsonV1 {
  schema_version: 'AI_OFFICE_CEO_ROOM_BEHAVIOR_CONTRACT_V1';
  room_asset_id: typeof CEO_MODULE_CONSTANTS.ASSET_ID;
  room_module_id: typeof CEO_MODULE_CONSTANTS.MODULE_ID;
  implementation_status: 'METADATA_CONTRACT_ONLY — NO_CEO_CHARACTER_IN_THIS_TASK';
  authority_hierarchy_contract: {
    human_owner_role: 'REAL_FINAL_DECISION_MAKER_AND_APPROVER';
    ceo_room_purpose: 'Executive Brain Command Center — aggregates PM reports, tracks organization state, prepares executive summaries, and stages Telegram digests for the Human Owner.';
    future_character_role: 'Executive Assistant / AI Chief of Staff / Executive Brain Operator (deferred to future character milestone)';
  };
  demo_telemetry_snapshot: CEODemoTelemetryData;
  future_actions: CEOFutureActionContract[];
}

export function buildCEORoomBehaviorJson(): CEORoomBehaviorJsonV1 {
  return {
    schema_version: 'AI_OFFICE_CEO_ROOM_BEHAVIOR_CONTRACT_V1',
    room_asset_id: CEO_MODULE_CONSTANTS.ASSET_ID,
    room_module_id: CEO_MODULE_CONSTANTS.MODULE_ID,
    implementation_status: 'METADATA_CONTRACT_ONLY — NO_CEO_CHARACTER_IN_THIS_TASK',
    authority_hierarchy_contract: {
      human_owner_role: 'REAL_FINAL_DECISION_MAKER_AND_APPROVER',
      ceo_room_purpose:
        'Executive Brain Command Center — aggregates PM reports, tracks organization state, prepares executive summaries, and stages Telegram digests for the Human Owner.',
      future_character_role:
        'Executive Assistant / AI Chief of Staff / Executive Brain Operator (deferred to future character milestone)',
    },
    demo_telemetry_snapshot: CEO_DEMO_TELEMETRY,
    future_actions: CEO_FUTURE_ACTIONS_CONTRACT,
  };
}

export function checkCEOFurnitureClearance(
  items: FurnitureCatalogItem[] = CEO_FURNITURE_CATALOG,
  anchors: Record<CEOAnchorId, CEOActivityAnchor> = DEFAULT_CEO_ANCHORS
): {
  valid: boolean;
  westConnectorClear: boolean;
  southConnectorClear: boolean;
  withinRoomBounds: boolean;
  anchorsUnobstructed: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  let westConnectorClear = true;
  let southConnectorClear = true;
  let withinRoomBounds = true;
  let anchorsUnobstructed = true;

  const westZone = CEO_CONNECTORS_SPEC.WEST.clearance_zone;
  const southZone = CEO_CONNECTORS_SPEC.SOUTH.clearance_zone;

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
      maxX > CEO_MODULE_CONSTANTS.FOOTPRINT_WIDTH ||
      minZ < 0 ||
      maxZ > CEO_MODULE_CONSTANTS.FOOTPRINT_DEPTH
    ) {
      withinRoomBounds = false;
      violations.push(`${item.name} extends outside 8×8 CEO module bounds.`);
    }

    const overlapsWest =
      maxX > westZone.minX &&
      minX < westZone.maxX &&
      maxZ > westZone.minZ &&
      minZ < westZone.maxZ;
    if (overlapsWest) {
      westConnectorClear = false;
      violations.push(`${item.name} obstructs West PM-Room Connector clearance zone.`);
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
    valid: westConnectorClear && southConnectorClear && withinRoomBounds && anchorsUnobstructed,
    westConnectorClear,
    southConnectorClear,
    withinRoomBounds,
    anchorsUnobstructed,
    violations,
  };
}

export function generateCEORoomLegacyManifest(stats: RoomExportStats) {
  return {
    module_id: CEO_MODULE_CONSTANTS.MODULE_ID,
    asset_id: CEO_MODULE_CONSTANTS.ASSET_ID,
    version: CEO_MODULE_CONSTANTS.VERSION,
    display_name: CEO_MODULE_CONSTANTS.DISPLAY_NAME,
    asset_filename: CEO_MODULE_CONSTANTS.GLB_FILENAME,
    grid_size: CEO_MODULE_CONSTANTS.GRID_SIZE,
    module_origin: [...CEO_MODULE_CONSTANTS.LOCAL_ORIGIN],
    global_a3_offset: [...CEO_MODULE_CONSTANTS.GLOBAL_A3_OFFSET],
    footprint_width: CEO_MODULE_CONSTANTS.FOOTPRINT_WIDTH,
    footprint_depth: CEO_MODULE_CONSTANTS.FOOTPRINT_DEPTH,
    bounding_box: stats.boundingBox,
    connectors: CEO_CONNECTORS_SPEC,
    number_of_meshes: stats.meshCount,
    number_of_materials: stats.materialCount,
    triangle_count: stats.triangleCount,
    content_groups: [...CEO_MODULE_CONSTANTS.REQUIRED_GROUPS],
  };
}
