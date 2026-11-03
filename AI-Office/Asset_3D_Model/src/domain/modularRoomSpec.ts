export interface ConnectorSpec {
  id: string;
  name: string;
  side: 'EAST' | 'SOUTH';
  position: [number, number, number];
  outward_direction: '+X' | '-Z';
  normal: [number, number, number];
  width: number;
  height: number;
  span_range: [number, number];
  clearance_zone: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  removable_wall_node: string;
}

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  category: 'FURNITURE' | 'PROPS' | 'DECORATION' | 'STRUCTURE' | 'WINDOWS' | 'FLOOR' | 'WALLS' | 'CONNECTORS';
  area: string;
  position: [number, number, number];
  dimensions: [number, number, number];
  materialSummary: string;
  description: string;
}

export interface CameraPreset {
  id: string;
  label: string;
  shortLabel: string;
  category: 'standard' | 'diagonal' | 'inspection';
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
  description: string;
}

export interface RoomExportStats {
  meshCount: number;
  materialCount: number;
  triangleCount: number;
  textureCount: number;
  boundingBox: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  fileSizeBytes?: number;
  groupCounts: Record<string, number>;
}

export interface RoomManifest {
  module_id: string;
  version: string;
  display_name: string;
  asset_filename: string;
  grid_size: number;
  world_unit_scale: string;
  coordinate_system: {
    axes: string;
    up_axis: string;
    handedness: string;
  };
  module_origin: [number, number, number];
  footprint_width: number;
  footprint_depth: number;
  floor_elevation: number;
  wall_height: number;
  floor_thickness: number;
  bounding_box: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
  connectors: Record<'EAST' | 'SOUTH', ConnectorSpec>;
  recommended_camera: {
    projection: 'orthographic';
    default_position: [number, number, number];
    default_target: [number, number, number];
    default_zoom: number;
    near: number;
    far: number;
  };
  recommended_lighting: {
    style: string;
    key_light: {
      type: 'DirectionalLight';
      color: string;
      intensity: number;
      position: [number, number, number];
      cast_shadow: boolean;
    };
    hemisphere_fill: {
      sky_color: string;
      ground_color: string;
      intensity: number;
    };
    warm_accent_lights: Array<{
      name: string;
      color: string;
      intensity: number;
      position: [number, number, number];
    }>;
  };
  renderer_color_space_assumptions: {
    output_color_space: 'SRGBColorSpace';
    albedo_texture_color_space: 'SRGBColorSpace';
    data_texture_color_space: 'NoColorSpace';
    texture_filtering: 'NearestFilter (crisp pixel-art)';
    tone_mapping: 'ACESFilmicToneMapping';
    tone_mapping_exposure: number;
  };
  material_notes: string[];
  number_of_meshes: number;
  number_of_materials: number;
  triangle_count: number;
  content_groups: string[];
  asset_creation_info: {
    generator: string;
    pipeline_standard: string;
    created_at: string;
    character_scale_reference_height: number;
    excludes_preview_objects: boolean;
  };
}

export const MODULE_CONSTANTS = {
  MODULE_ID: 'AI_OFFICE_ROOM_PM_v1',
  VERSION: '1.0.0',
  DISPLAY_NAME: 'PM & Strategy Room',
  ASSET_FILENAME: 'AI_OFFICE_ROOM_PM_v1.glb',
  MANIFEST_FILENAME: 'AI_OFFICE_ROOM_PM_v1.manifest.json',
  PREVIEW_FILENAME: 'AI_OFFICE_ROOM_PM_v1_preview.png',
  ROOT_NODE_NAME: 'ROOM_PM_ROOT',
  GRID_SIZE: 1.0,
  FOOTPRINT_WIDTH: 8.0,
  FOOTPRINT_DEPTH: 8.0,
  FLOOR_ELEVATION: 0.0,
  FLOOR_THICKNESS: 0.16,
  WALL_HEIGHT: 3.2,
  WALL_THICKNESS: 0.22,
  LOW_CUTAWAY_HEIGHT: 0.36,
  ORIGIN: [0, 0, 0] as [number, number, number],
  CENTER: [4, 1.15, 4] as [number, number, number],
  CHARACTER_REFERENCE_HEIGHT: 1.72,
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

export const CONNECTORS_SPEC: Record<'EAST' | 'SOUTH', ConnectorSpec> = {
  EAST: {
    id: 'CONNECTOR_EAST',
    name: 'Connector A — East Passage',
    side: 'EAST',
    position: [8, 0, 4],
    outward_direction: '+X',
    normal: [1, 0, 0],
    width: 2.0,
    height: 2.3,
    span_range: [3.0, 5.0],
    clearance_zone: {
      minX: 6.7,
      maxX: 8.0,
      minZ: 3.0,
      maxZ: 5.0,
    },
    removable_wall_node: 'Connector_East_Removable_Doorway',
  },
  SOUTH: {
    id: 'CONNECTOR_SOUTH',
    name: 'Connector B — South Passage',
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
      maxZ: 1.35,
    },
    removable_wall_node: 'Connector_South_Removable_Threshold',
  },
};

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'isometric',
    label: 'Isometric Default',
    shortLabel: 'Iso Default',
    category: 'standard',
    position: [13.6, 11.2, -5.6],
    target: [4.0, 1.15, 4.0],
    zoom: 76,
    description: 'Authoritative three-quarter elevated isometric diorama view matching reference.',
  },
  {
    id: 'front',
    label: 'Front (South-East Elevation)',
    shortLabel: 'Front',
    category: 'standard',
    position: [11.5, 4.2, -3.5],
    target: [4.0, 1.2, 4.0],
    zoom: 78,
    description: 'Low three-quarter front elevation across cutaway threshold.',
  },
  {
    id: 'left',
    label: 'Left (East Connector View)',
    shortLabel: 'Left (East)',
    category: 'standard',
    position: [15.5, 6.8, 4.0],
    target: [4.0, 1.2, 4.0],
    zoom: 78,
    description: 'View looking West through the East modular connector.',
  },
  {
    id: 'right',
    label: 'Right (South Connector View)',
    shortLabel: 'Right (South)',
    category: 'standard',
    position: [4.0, 6.8, -7.5],
    target: [4.0, 1.2, 4.0],
    zoom: 78,
    description: 'View looking North through the South modular connector.',
  },
  {
    id: 'back',
    label: 'Back (North-West Cutaway)',
    shortLabel: 'Back',
    category: 'standard',
    position: [-5.6, 10.8, 13.6],
    target: [4.0, 1.15, 4.0],
    zoom: 74,
    description: 'Reverse isometric angle from behind North and West walls (auto-cutaway active).',
  },
  {
    id: 'top',
    label: 'Top-Down Architectural Plan',
    shortLabel: 'Top-Down',
    category: 'standard',
    position: [4.0, 24.0, 3.99],
    target: [4.0, 0.0, 4.0],
    zoom: 76,
    description: 'Orthographic plan view for verifying 8×8 grid bounds, walkable paths, and connectors.',
  },
  {
    id: 'diag_ne',
    label: 'Diagonal NE',
    shortLabel: 'Diag NE',
    category: 'diagonal',
    position: [13.5, 10.5, 13.5],
    target: [4.0, 1.15, 4.0],
    zoom: 74,
    description: 'North-East isometric quadrant view.',
  },
  {
    id: 'diag_nw',
    label: 'Diagonal NW',
    shortLabel: 'Diag NW',
    category: 'diagonal',
    position: [-5.5, 10.5, 13.5],
    target: [4.0, 1.15, 4.0],
    zoom: 74,
    description: 'North-West isometric quadrant view.',
  },
  {
    id: 'diag_sw',
    label: 'Diagonal SW',
    shortLabel: 'Diag SW',
    category: 'diagonal',
    position: [-5.5, 10.5, -5.5],
    target: [4.0, 1.15, 4.0],
    zoom: 74,
    description: 'South-West isometric quadrant view.',
  },
  {
    id: 'desk_closeup',
    label: 'Close-Up: Executive PM Desk',
    shortLabel: 'PM Desk',
    category: 'inspection',
    position: [7.8, 5.8, 1.2],
    target: [1.35, 0.95, 5.35],
    zoom: 165,
    description: 'Close inspection of the PM workstation, monitor, laptop, lamp, and planning notes.',
  },
  {
    id: 'bookshelf_closeup',
    label: 'Close-Up: Tall Bookcase',
    shortLabel: 'Bookcase',
    category: 'inspection',
    position: [7.8, 6.2, 2.2],
    target: [2.1, 1.35, 7.45],
    zoom: 160,
    description: 'Close inspection of the tall walnut bookcase, pixel book spines, binders, and trophy.',
  },
  {
    id: 'board_closeup',
    label: 'Close-Up: Strategy Planning Board',
    shortLabel: 'Strategy Board',
    category: 'inspection',
    position: [9.6, 5.8, 2.2],
    target: [5.35, 1.55, 7.55],
    zoom: 155,
    description: 'Close inspection of the wall-mounted PM Strategy & Sprint Kanban Board.',
  },
  {
    id: 'floor_closeup',
    label: 'Close-Up: Pixel Oak Floor & Rug',
    shortLabel: 'Floor Detail',
    category: 'inspection',
    position: [8.5, 6.5, -0.5],
    target: [4.2, 0.15, 4.2],
    zoom: 170,
    description: 'Close inspection of procedural pixel-art oak planks, grain clusters, and woven rug.',
  },
];

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  {
    id: 'PM_Executive_Desk',
    name: 'Executive PM Workstation Desk',
    category: 'FURNITURE',
    area: 'Area A — PM Workstation',
    position: [1.35, 0, 5.35],
    dimensions: [1.15, 0.78, 1.95],
    materialSummary: 'Warm Oak Top, Dark Walnut Pedestals, Brushed Brass Handles',
    description: 'Executive PM desk positioned beside the large casement window bay with dual drawer pedestals, computer monitor, secondary laptop, keyboard, mouse, architect lamp, coffee mug, notebook, and desk plant.',
  },
  {
    id: 'PM_Executive_Chair',
    name: 'Ergonomic Leather Executive Chair',
    category: 'FURNITURE',
    area: 'Area A — PM Workstation',
    position: [2.15, 0, 5.35],
    dimensions: [0.66, 1.12, 0.66],
    materialSummary: 'Espresso Tufted Leather, Dark Metal 5-Star Caster Base, Oak Armrests',
    description: 'High-back ergonomic PM task chair with lumbar cushion, headrest, sculpted armrests, hydraulic column, and 5-caster wheelbase.',
  },
  {
    id: 'PM_Strategy_Board',
    name: 'Wall-Mounted PM Strategy & Roadmap Board',
    category: 'FURNITURE',
    area: 'Area B — Project Planning Board',
    position: [5.35, 1.15, 7.68],
    dimensions: [2.35, 1.38, 0.12],
    materialSummary: 'Walnut Frame, Porcelain Whiteboard, Muted Pixel Kanban Cards',
    description: 'Large strategy board mounted on the North wall featuring 4 sprint columns (Backlog, In Progress, Review, Milestone Q4), color-coded task notes, timeline dependency bars, and aluminum marker ledge.',
  },
  {
    id: 'PM_Credenza_Cabinet',
    name: 'Strategy Credenza & Blueprint Cabinet',
    category: 'FURNITURE',
    area: 'Area B — Project Planning Board',
    position: [5.35, 0, 7.35],
    dimensions: [2.15, 0.68, 0.56],
    materialSummary: 'Warm Oak Cabinet, Walnut Doors, Stacked Spec Binders & Console',
    description: 'Low storage credenza directly beneath the strategy board holding reference architecture binders, sprint velocity charts, and project hardware.',
  },
  {
    id: 'PM_Tall_Bookcase',
    name: 'Tall Archival Bookcase & Document Shelving',
    category: 'FURNITURE',
    area: 'Area D — Bookshelf & Storage',
    position: [1.95, 0, 7.42],
    dimensions: [1.45, 2.52, 0.56],
    materialSummary: 'Rich Walnut Casework, Multi-Color Pixel Book Spines, Archival Box',
    description: 'Five-tier handcrafted bookcase near the North-West corner with lower closed cabinet doors, varied book spine clusters, labeled archival box on top, and step stool beside it.',
  },
  {
    id: 'PM_Archival_Wardrobe',
    name: 'Tall PM Coat & Blueprint Locker Cabinet',
    category: 'FURNITURE',
    area: 'Area D — Bookshelf & Storage',
    position: [7.15, 0, 7.15],
    dimensions: [1.1, 2.28, 0.72],
    materialSummary: 'Honey Oak Casework, Upper/Lower Doors, Hanging Blazers & Archive Boxes',
    description: 'Tall honey-oak office cabinet in the North-East corner with upper storage boxes, open garment bay, and lower filing drawers matching the reference silhouette.',
  },
  {
    id: 'PM_Collaboration_Table',
    name: 'Mini Strategy Collaboration Table & Seats',
    category: 'FURNITURE',
    area: 'Area C — Mini Collaboration Table',
    position: [1.75, 0, 2.25],
    dimensions: [1.25, 0.76, 1.25],
    materialSummary: 'Warm Oak Tabletop, Dark Timber Legs, 3 Cushioned Collaboration Stools',
    description: 'Compact square sprint collaboration table positioned by the South-West casement window with three cushioned seats, project tablet, architecture notes, and coffee mugs.',
  },
  {
    id: 'PM_Cozy_Sofa',
    name: 'Two-Seat Cozy Studio Lounge Sofa',
    category: 'FURNITURE',
    area: 'Area E — Cozy Seating Corner',
    position: [3.95, 0, 3.85],
    dimensions: [1.95, 0.86, 0.95],
    materialSummary: 'Warm Cocoa Textured Fabric, Tufted Cushions, Knit Throw & Pillows',
    description: 'Inviting three-cushion cocoa sofa anchored at the edge of the indigo area rug, facing the strategy wall with cozy throw blanket and pillows.',
  },
  {
    id: 'PM_Coffee_Table',
    name: 'Oak Side & Lounge Table',
    category: 'FURNITURE',
    area: 'Area E — Cozy Seating Corner',
    position: [5.35, 0, 3.65],
    dimensions: [0.85, 0.48, 0.62],
    materialSummary: 'Warm Oak Slab, Drawer Front, PM Leather Satchel & Strategy Journal',
    description: 'Side table beside the sofa holding a leather bound strategy journal, executive fountain pen, and a structured backpack resting beside it.',
  },
  {
    id: 'PM_Area_Rug',
    name: 'Woven Pixel-Pattern Indigo Studio Rug',
    category: 'DECORATION',
    area: 'Area E — Cozy Seating Corner',
    position: [4.35, 0.015, 4.85],
    dimensions: [2.4, 0.02, 2.3],
    materialSummary: 'Deep Indigo-Slate Woven Textile with Cream Geometric Border',
    description: 'Soft woven floor rug in the heart of the room tying together the PM workstation, strategy wall, and cocoa sofa.',
  },
  {
    id: 'PM_Corner_Credenza',
    name: 'South-West Refreshment & Document Counter',
    category: 'FURNITURE',
    area: 'Area F — Decorative Props',
    position: [1.35, 0, 0.75],
    dimensions: [1.8, 0.85, 0.65],
    materialSummary: 'Warm Oak Base Cabinets, Cream Countertop, Espresso Maker & Kettle',
    description: 'Office refreshment & document credenza in the South-West corner featuring a pour-over kettle, espresso station, mug organizer, and tall office supply tower.',
  },
  {
    id: 'PM_Floor_Lamp',
    name: 'Warm Brass & Linen Floor Lamp',
    category: 'PROPS',
    area: 'Area E — Cozy Seating Corner',
    position: [6.35, 0, 6.85],
    dimensions: [0.46, 1.72, 0.46],
    materialSummary: 'Aged Brass Stand, Warm Cream Illuminated Linen Shade',
    description: 'Warm floor lamp near the strategy board casting cozy ambient illumination.',
  },
];

export function validateBoundingBox(
  min: [number, number, number],
  max: [number, number, number]
): {
  valid: boolean;
  originPreserved: boolean;
  withinHorizontalFootprint: boolean;
  withinHeightLimits: boolean;
  messages: string[];
} {
  const messages: string[] = [];
  const eps = 0.25;

  const originPreserved =
    Math.abs(min[0] - 0) <= eps &&
    Math.abs(min[2] - 0) <= eps &&
    Math.abs(max[0] - MODULE_CONSTANTS.FOOTPRINT_WIDTH) <= eps &&
    Math.abs(max[2] - MODULE_CONSTANTS.FOOTPRINT_DEPTH) <= eps;

  if (!originPreserved) {
    messages.push(
      `Module bounds [${min[0].toFixed(2)}..${max[0].toFixed(2)}, ${min[2].toFixed(2)}..${max[2].toFixed(2)}] deviate from standard [0..8, 0..8] origin convention.`
    );
  } else {
    messages.push('SW Corner Origin (0,0,0) and 8×8 world-unit footprint preserved.');
  }

  const withinHorizontalFootprint =
    min[0] >= -eps &&
    min[2] >= -eps &&
    max[0] <= MODULE_CONSTANTS.FOOTPRINT_WIDTH + eps &&
    max[2] <= MODULE_CONSTANTS.FOOTPRINT_DEPTH + eps;

  const withinHeightLimits =
    min[1] >= -MODULE_CONSTANTS.FLOOR_THICKNESS - 0.1 &&
    max[1] <= MODULE_CONSTANTS.WALL_HEIGHT + 0.25;

  if (!withinHeightLimits) {
    messages.push(
      `Vertical extent [${min[1].toFixed(2)}..${max[1].toFixed(2)}] exceeds expected [-0.16..3.20] range.`
    );
  } else {
    messages.push('Vertical floor (-0.16..0.00) and wall height (3.20) within spec.');
  }

  return {
    valid: originPreserved && withinHorizontalFootprint && withinHeightLimits,
    originPreserved,
    withinHorizontalFootprint,
    withinHeightLimits,
    messages,
  };
}

export function checkFurnitureClearance(items: FurnitureCatalogItem[] = FURNITURE_CATALOG): {
  valid: boolean;
  eastConnectorClear: boolean;
  southConnectorClear: boolean;
  withinRoomBounds: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  let eastConnectorClear = true;
  let southConnectorClear = true;
  let withinRoomBounds = true;

  const eastZone = CONNECTORS_SPEC.EAST.clearance_zone;
  const southZone = CONNECTORS_SPEC.SOUTH.clearance_zone;

  for (const item of items) {
    if (item.category !== 'FURNITURE' && item.category !== 'PROPS') continue;
    const [cx, , cz] = item.position;
    const [w, , d] = item.dimensions;
    const minX = cx - w / 2;
    const maxX = cx + w / 2;
    const minZ = cz - d / 2;
    const maxZ = cz + d / 2;

    if (minX < 0 || maxX > MODULE_CONSTANTS.FOOTPRINT_WIDTH || minZ < 0 || maxZ > MODULE_CONSTANTS.FOOTPRINT_DEPTH) {
      withinRoomBounds = false;
      violations.push(`${item.name} extends outside 8×8 module bounds.`);
    }

    const overlapsEast =
      maxX > eastZone.minX &&
      minX < eastZone.maxX &&
      maxZ > eastZone.minZ &&
      minZ < eastZone.maxZ;

    if (overlapsEast) {
      eastConnectorClear = false;
      violations.push(`${item.name} obstructs East Connector clearance zone.`);
    }

    const overlapsSouth =
      maxX > southZone.minX &&
      minX < southZone.maxX &&
      maxZ > southZone.minZ &&
      minZ < southZone.maxZ;

    if (overlapsSouth) {
      southConnectorClear = false;
      violations.push(`${item.name} obstructs South Connector clearance zone.`);
    }
  }

  return {
    valid: eastConnectorClear && southConnectorClear && withinRoomBounds,
    eastConnectorClear,
    southConnectorClear,
    withinRoomBounds,
    violations,
  };
}

export function generateRoomManifest(stats: RoomExportStats): RoomManifest {
  return {
    module_id: MODULE_CONSTANTS.MODULE_ID,
    version: MODULE_CONSTANTS.VERSION,
    display_name: MODULE_CONSTANTS.DISPLAY_NAME,
    asset_filename: MODULE_CONSTANTS.ASSET_FILENAME,
    grid_size: MODULE_CONSTANTS.GRID_SIZE,
    world_unit_scale: '1 Three.js unit = 1 modular world unit (1 meter nominal)',
    coordinate_system: {
      axes: 'X = East(+)/West(-), Y = Vertical(+Up), Z = North(+)/South(-)',
      up_axis: 'Y',
      handedness: 'right-handed',
    },
    module_origin: [...MODULE_CONSTANTS.ORIGIN],
    footprint_width: MODULE_CONSTANTS.FOOTPRINT_WIDTH,
    footprint_depth: MODULE_CONSTANTS.FOOTPRINT_DEPTH,
    floor_elevation: MODULE_CONSTANTS.FLOOR_ELEVATION,
    wall_height: MODULE_CONSTANTS.WALL_HEIGHT,
    floor_thickness: MODULE_CONSTANTS.FLOOR_THICKNESS,
    bounding_box: {
      min: stats.boundingBox.min.map((v) => Number(v.toFixed(3))) as [number, number, number],
      max: stats.boundingBox.max.map((v) => Number(v.toFixed(3))) as [number, number, number],
      size: stats.boundingBox.size.map((v) => Number(v.toFixed(3))) as [number, number, number],
    },
    connectors: CONNECTORS_SPEC,
    recommended_camera: {
      projection: 'orthographic',
      default_position: [13.6, 11.2, -5.6],
      default_target: [4.0, 1.15, 4.0],
      default_zoom: 76,
      near: 0.1,
      far: 120,
    },
    recommended_lighting: {
      style: 'Premium Cozy Isometric Pixel-Art Daylight',
      key_light: {
        type: 'DirectionalLight',
        color: '#FFF4E0',
        intensity: 2.1,
        position: [9.5, 14.0, 2.5],
        cast_shadow: true,
      },
      hemisphere_fill: {
        sky_color: '#FFF8EE',
        ground_color: '#6E5A4F',
        intensity: 0.95,
      },
      warm_accent_lights: [
        {
          name: 'Desk_Architect_Lamp_Glow',
          color: '#FFB75E',
          intensity: 0.85,
          position: [1.35, 1.35, 6.05],
        },
        {
          name: 'Corner_Floor_Lamp_Glow',
          color: '#FFBE6B',
          intensity: 0.75,
          position: [6.35, 1.55, 6.85],
        },
      ],
    },
    renderer_color_space_assumptions: {
      output_color_space: 'SRGBColorSpace',
      albedo_texture_color_space: 'SRGBColorSpace',
      data_texture_color_space: 'NoColorSpace',
      texture_filtering: 'NearestFilter (crisp pixel-art)',
      tone_mapping: 'ACESFilmicToneMapping',
      tone_mapping_exposure: 1.08,
    },
    material_notes: [
      'All permanent materials use export-compatible THREE.MeshStandardMaterial with embedded procedural pixel-art PNG textures.',
      'Procedural CanvasTextures (Oak Plank Floor, Woven Rug, Strategy Kanban Board, Monitor UI, Wall Plaster, Framed Posters, Exterior Window Vista) are serialized directly into the GLB binary buffer.',
      'Textures use THREE.NearestFilter for crisp pixel-art fidelity without fullscreen blur.',
      'Removable doorway/connector wall sections are named Connector_East_Removable_Doorway and Connector_South_Removable_Threshold inside CONNECTORS for automatic hiding when snapping adjacent room modules.',
    ],
    number_of_meshes: stats.meshCount,
    number_of_materials: stats.materialCount,
    triangle_count: stats.triangleCount,
    content_groups: [...MODULE_CONSTANTS.REQUIRED_GROUPS],
    asset_creation_info: {
      generator: 'AI Office Modular Room Lab v1.0 (Three.js GLTFExporter)',
      pipeline_standard: 'AI_OFFICE_MODULAR_BLOCK_V1',
      created_at: '2026-10-28T00:00:00.000Z',
      character_scale_reference_height: MODULE_CONSTANTS.CHARACTER_REFERENCE_HEIGHT,
      excludes_preview_objects: true,
    },
  };
}
