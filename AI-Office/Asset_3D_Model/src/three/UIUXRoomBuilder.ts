import * as THREE from 'three';
import {
  DEFAULT_UIUX_ANCHORS,
  UIUXActivityAnchor,
  UIUXAnchorId,
  UIUX_FURNITURE_CATALOG,
  UIUX_MODULE_CONSTANTS,
} from '../domain/uiuxRoomSpec';
import { MaterialLibraryInstance } from './PixelMaterialLibrary';

function createBox(
  name: string,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  extraUserData: Record<string, unknown> = {}
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { ...extraUserData };
  return mesh;
}

function createCyl(
  name: string,
  rTop: number,
  rBot: number,
  h: number,
  segs: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  extraUserData: Record<string, unknown> = {}
): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(rTop, rBot, h, segs);
  const mesh = new THREE.Mesh(geo, material);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { ...extraUserData };
  return mesh;
}

function tagCatalogGroup(group: THREE.Group, catalogId: string, category: string) {
  group.userData.catalogId = catalogId;
  group.userData.category = category;
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.userData.catalogId = catalogId;
      child.userData.category = category;
    }
  });
}

export interface BuiltUIUXRoomResult {
  uiuxRoot: THREE.Group;
  rootGroup: THREE.Group;
  groups: Record<(typeof UIUX_MODULE_CONSTANTS.REQUIRED_GROUPS)[number], THREE.Group>;
  northWallNodes: THREE.Object3D[];
  westWallNodes: THREE.Object3D[];
  eastWallNodes: THREE.Object3D[];
  southWallNodes: THREE.Object3D[];
  catalogNodeMap: Map<string, THREE.Object3D>;
}

export type UIUXRoomBuildResult = BuiltUIUXRoomResult;

/**
 * Builds the complete `ROOM_UIUX_ROOT` (8×8 world units, local origin [0,0,0] at SW corner)
 * for Module 03 — UI/UX Design Studio (`AI_OFFICE_ROOM_UIUX_v1`).
 * Strictly room & permanent interior props only — no character is spawned or embedded.
 */
export function buildUIUXRoomComplete(matLib: MaterialLibraryInstance): BuiltUIUXRoomResult {
  const { materials } = matLib;

  const uiuxRoot = new THREE.Group();
  uiuxRoot.name = UIUX_MODULE_CONSTANTS.ROOT_NODE_NAME;
  uiuxRoot.position.set(0, 0, 0);

  const groups = {} as Record<(typeof UIUX_MODULE_CONSTANTS.REQUIRED_GROUPS)[number], THREE.Group>;
  for (const gName of UIUX_MODULE_CONSTANTS.REQUIRED_GROUPS) {
    const g = new THREE.Group();
    g.name = gName;
    uiuxRoot.add(g);
    groups[gName] = g;
  }

  const northWallNodes: THREE.Object3D[] = [];
  const westWallNodes: THREE.Object3D[] = [];
  const eastWallNodes: THREE.Object3D[] = [];
  const southWallNodes: THREE.Object3D[] = [];
  const catalogNodeMap = new Map<string, THREE.Object3D>();

  // =========================================================================
  // 1. FLOOR & STRUCTURAL SUBBASE (X = 0..8, Z = 0..8, Y = -0.16..0.00)
  //    West plinth starts at X = 0.01 so when placed at [24, 0, 18] beside
  //    CEO Room ([16, 0, 18]), zero faces are coplanar at global X = 24.00!
  // =========================================================================
  const floorOak = createBox(
    'UIUX_Floor_Warm_Wood_Surface',
    7.84,
    0.04,
    7.84,
    4.0,
    -0.02,
    4.0,
    materials.oakFloor,
    { category: 'FLOOR' }
  );
  groups.FLOOR.add(floorOak);

  const floorSubbase = createBox(
    'UIUX_Floor_Structural_Subbase',
    7.84,
    0.12,
    7.84,
    4.0,
    -0.1,
    4.0,
    materials.floorSubbase,
    { category: 'STRUCTURE' }
  );
  const westPlinthTrim = createBox(
    'UIUX_Structure_West_Plinth_Trim',
    0.07,
    0.16,
    7.84,
    0.045,
    -0.08,
    4.0,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  const eastPlinthTrim = createBox(
    'UIUX_Structure_East_Plinth_Trim',
    0.08,
    0.16,
    7.84,
    7.96,
    -0.08,
    4.0,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  const southPlinthTrim = createBox(
    'UIUX_Structure_South_Plinth_Trim',
    7.98,
    0.16,
    0.08,
    4.0,
    -0.08,
    0.04,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  const northPlinthTrim = createBox(
    'UIUX_Structure_North_Plinth_Trim',
    7.98,
    0.16,
    0.08,
    4.0,
    -0.08,
    7.96,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  groups.STRUCTURE.add(
    floorSubbase,
    westPlinthTrim,
    eastPlinthTrim,
    southPlinthTrim,
    northPlinthTrim
  );

  // =========================================================================
  // 2. NORTH FULL-HEIGHT STUDIO WALL WITH WIDE ATELIER WINDOW (Z = 7.74..8.00)
  //    Asymmetric composition: West solid bay (X=0.28..3.55) behind Material
  //    Shelf + Wide Studio Atelier Window (X=3.55..7.35) lighting the Desk!
  // =========================================================================
  const northWallAssy = new THREE.Group();
  northWallAssy.name = 'UIUX_Wall_North_Assembly';

  const northBacking = createBox(
    'UIUX_Wall_North_Exterior_Shell',
    7.72,
    3.16,
    0.1,
    4.14,
    1.58,
    7.95,
    materials.uiuxStudioWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  const northPierWest = createBox(
    'UIUX_Wall_North_Pier_West',
    3.27,
    3.16,
    0.14,
    1.915,
    1.58,
    7.83,
    materials.uiuxStudioWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  const northPierEast = createBox(
    'UIUX_Wall_North_Pier_East',
    0.65,
    3.16,
    0.14,
    7.675,
    1.58,
    7.83,
    materials.uiuxStudioWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  // Atelier Window (X = 3.55..7.35, width 3.80u) spandrel & lintel
  const northWinSpandrel = createBox(
    'UIUX_Wall_North_Atelier_Spandrel',
    3.8,
    0.86,
    0.12,
    5.45,
    0.43,
    7.84,
    materials.uiuxStudioWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  const northWinLintel = createBox(
    'UIUX_Wall_North_Atelier_Lintel',
    3.8,
    0.46,
    0.14,
    5.45,
    2.93,
    7.83,
    materials.uiuxStudioWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  const northTopCap = createBox(
    'UIUX_Wall_North_Top_Cap',
    7.74,
    0.04,
    0.26,
    4.13,
    3.18,
    7.87,
    materials.wallCapDark,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  const northBaseboard = createBox(
    'UIUX_Wall_North_Birch_Baseboard',
    7.44,
    0.12,
    0.03,
    4.14,
    0.06,
    7.74,
    materials.uiuxPaleBirch,
    { category: 'WALLS', wallSide: 'NORTH' }
  );

  northWallAssy.add(
    northBacking,
    northPierWest,
    northPierEast,
    northWinSpandrel,
    northWinLintel,
    northTopCap,
    northBaseboard
  );
  groups.WALLS.add(northWallAssy);
  northWallNodes.push(northWallAssy);

  // North Studio Atelier Multi-Bay Window (X = 3.55..7.35, Y = 0.86..2.70)
  const buildStudioAtelierWindow = (): THREE.Group => {
    const winGroup = new THREE.Group();
    winGroup.name = 'Window_North_Studio_Atelier';
    const w = 3.8;
    const h = 1.84;
    const cx = 5.45;
    const cy = 1.78;

    const sill = createBox(
      'UIUX_Win_Sill_Ledge',
      w + 0.08,
      0.06,
      0.22,
      cx,
      cy - h / 2 + 0.03,
      7.75,
      materials.uiuxPaleBirch
    );
    const header = createBox(
      'UIUX_Win_Top_Frame',
      w,
      0.06,
      0.16,
      cx,
      cy + h / 2 - 0.03,
      7.79,
      materials.windowFrameCream
    );
    const jambL = createBox(
      'UIUX_Win_Left_Jamb',
      0.07,
      h - 0.12,
      0.16,
      cx - w / 2 + 0.035,
      cy,
      7.79,
      materials.windowFrameCream
    );
    const jambR = createBox(
      'UIUX_Win_Right_Jamb',
      0.07,
      h - 0.12,
      0.16,
      cx + w / 2 - 0.035,
      cy,
      7.79,
      materials.windowFrameCream
    );
    // Asymmetric 3-bay studio mullions + upper clerestory transom
    const transom = createBox(
      'UIUX_Win_Clerestory_Transom',
      w - 0.14,
      0.045,
      0.1,
      cx,
      cy + 0.42,
      7.8,
      materials.windowFrameCream
    );
    const mullion1 = createBox(
      'UIUX_Win_Mullion_West',
      0.05,
      h - 0.12,
      0.08,
      cx - 0.65,
      cy,
      7.81,
      materials.windowFrameCream
    );
    const mullion2 = createBox(
      'UIUX_Win_Mullion_East',
      0.05,
      h - 0.12,
      0.08,
      cx + 0.65,
      cy,
      7.81,
      materials.windowFrameCream
    );
    const vista = createBox(
      'UIUX_Win_Vista_Backdrop',
      w - 0.14,
      h - 0.12,
      0.02,
      cx,
      cy,
      7.86,
      materials.windowVista
    );
    const glass = createBox(
      'UIUX_Win_Glass_Pane',
      w - 0.14,
      h - 0.12,
      0.02,
      cx,
      cy,
      7.76,
      materials.windowGlass
    );
    // Small window-ledge succulent & color prism on the wide studio sill
    const sillPot = createCyl(
      'UIUX_Win_Sill_Succulent_Pot',
      0.07,
      0.055,
      0.09,
      10,
      4.15,
      cy - h / 2 + 0.105,
      7.72,
      materials.uiuxPeachCoral
    );
    const sillPlant = createBox(
      'UIUX_Win_Sill_Succulent_Leaves',
      0.11,
      0.08,
      0.11,
      4.15,
      cy - h / 2 + 0.18,
      7.72,
      materials.plantFoliageBright
    );

    winGroup.add(
      sill,
      header,
      jambL,
      jambR,
      transom,
      mullion1,
      mullion2,
      vista,
      glass,
      sillPot,
      sillPlant
    );
    return winGroup;
  };

  const northAtelierWindow = buildStudioAtelierWindow();
  groups.WINDOWS.add(northAtelierWindow);
  northWallNodes.push(northAtelierWindow);

  // =========================================================================
  // 3. WEST FULL-HEIGHT CREATIVE GALLERY WALL (X = 0.01..0.26, Z = 0.00..8.00)
  //    Solid studio wall (no fake doorway into CEO Brain Console), hosting
  //    Zone B (Wireframe / UX Flow Wall) & Zone C (Style System Board).
  // =========================================================================
  const westWallAssy = new THREE.Group();
  westWallAssy.name = 'UIUX_Wall_West_Assembly';

  const westWallMain = createBox(
    'UIUX_Wall_West_Full_Studio_Panel',
    0.24,
    3.16,
    7.96,
    0.13,
    1.58,
    4.0,
    materials.uiuxStudioWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  const westTopCap = createBox(
    'UIUX_Wall_West_Top_Cap',
    0.25,
    0.04,
    7.96,
    0.135,
    3.18,
    4.0,
    materials.wallCapDark,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  const westBaseboard = createBox(
    'UIUX_Wall_West_Birch_Baseboard',
    0.03,
    0.12,
    7.48,
    0.265,
    0.06,
    3.96,
    materials.uiuxPaleBirch,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // Subtle vertical birch studio gallery divider pilaster between Zone B (Z=1.45..4.25) and Zone C (Z=4.75..6.95)
  const westGalleryPilaster = createBox(
    'UIUX_Wall_West_Gallery_Divider_Pilaster',
    0.04,
    2.96,
    0.12,
    0.27,
    1.48,
    4.52,
    materials.uiuxPaleBirch,
    { category: 'WALLS', wallSide: 'WEST' }
  );

  westWallAssy.add(westWallMain, westTopCap, westBaseboard, westGalleryPilaster);
  groups.WALLS.add(westWallAssy);
  westWallNodes.push(westWallAssy);

  // =========================================================================
  // 4. EAST EXTERIOR WALL ASSEMBLY (Local X = 7.82..8.00, Global X = 31.82..32.00, Y = 0..3.20)
  //    + SOUTH OPEN-FRONT CUTAWAY TRIMS + SOUTH CONNECTOR ([4, 0, 0])
  //    Repairs the missing UI/UX exterior wall along X = 32.0 (screen-space LEFT
  //    boundary in South-facing Full Office views) while preserving the 0.18u curb
  //    when cutaway is active in Single-Room view.
  // =========================================================================
  const eastCutawayCurb = createBox(
    'UIUX_Wall_East_Cutaway_Curb',
    0.08,
    0.18,
    7.84,
    7.95,
    0.09,
    4.0,
    materials.uiuxPaleBirch,
    { category: 'WALLS', wallSide: 'EAST' }
  );

  // Full-height 3.2u East Exterior Studio Wall Assembly (Y = 0.18..3.20 above eastCutawayCurb)
  const eastWallAssy = new THREE.Group();
  eastWallAssy.name = 'UIUX_Wall_East_Assembly';

  // South & North solid wall piers flanking the East Studio Daylight Window (Z = 1.90..6.10, Y = 0.88..2.68)
  const eastPierSouth = createBox(
    'UIUX_Wall_East_Pier_South',
    0.16,
    2.98,
    1.86,
    7.90,
    1.67,
    0.95,
    materials.uiuxGalleryPlaster,
    { category: 'WALLS', wallSide: 'EAST' }
  );
  const eastPierNorth = createBox(
    'UIUX_Wall_East_Pier_North',
    0.16,
    2.98,
    1.70,
    7.90,
    1.67,
    6.95,
    materials.uiuxGalleryPlaster,
    { category: 'WALLS', wallSide: 'EAST' }
  );
  const eastWinSpandrel = createBox(
    'UIUX_Wall_East_Window_Spandrel',
    0.16,
    0.70,
    4.20,
    7.90,
    0.53,
    4.00,
    materials.uiuxGalleryPlaster,
    { category: 'WALLS', wallSide: 'EAST' }
  );
  const eastWinLintel = createBox(
    'UIUX_Wall_East_Window_Lintel',
    0.16,
    0.48,
    4.20,
    7.90,
    2.92,
    4.00,
    materials.uiuxGalleryPlaster,
    { category: 'WALLS', wallSide: 'EAST' }
  );
  const eastTopCap = createBox(
    'UIUX_Wall_East_Top_Cap',
    0.20,
    0.04,
    7.78,
    7.90,
    3.18,
    3.91,
    materials.wallCapDark,
    { category: 'WALLS', wallSide: 'EAST' }
  );
  const eastWainscotRail = createBox(
    'UIUX_Wall_East_Birch_Dado_Rail',
    0.025,
    0.05,
    7.68,
    7.805,
    0.85,
    3.92,
    materials.uiuxPaleBirch,
    { category: 'WALLS', wallSide: 'EAST' }
  );

  eastWallAssy.add(
    eastPierSouth,
    eastPierNorth,
    eastWinSpandrel,
    eastWinLintel,
    eastTopCap,
    eastWainscotRail
  );
  groups.WALLS.add(eastWallAssy);
  eastWallNodes.push(eastWallAssy);

  // East Studio Daylight Window (Z = 1.90..6.10, Y = 0.88..2.68 at local X = 7.86)
  const eastStudioWindow = new THREE.Group();
  eastStudioWindow.name = 'Window_East_Studio_Daylight';
  const ewSill = createBox(
    'UIUX_East_Win_Sill',
    0.22,
    0.06,
    4.26,
    7.86,
    0.91,
    4.00,
    materials.uiuxPaleBirch
  );
  const ewHeader = createBox(
    'UIUX_East_Win_Header',
    0.18,
    0.06,
    4.20,
    7.88,
    2.65,
    4.00,
    materials.windowFrameCream
  );
  const ewJambS = createBox(
    'UIUX_East_Win_Jamb_S',
    0.18,
    1.68,
    0.07,
    7.88,
    1.78,
    1.935,
    materials.windowFrameCream
  );
  const ewJambN = createBox(
    'UIUX_East_Win_Jamb_N',
    0.18,
    1.68,
    0.07,
    7.88,
    1.78,
    6.065,
    materials.windowFrameCream
  );
  const ewMullion1 = createBox(
    'UIUX_East_Win_Mullion_1',
    0.14,
    1.68,
    0.05,
    7.88,
    1.78,
    3.30,
    materials.windowFrameCream
  );
  const ewMullion2 = createBox(
    'UIUX_East_Win_Mullion_2',
    0.14,
    1.68,
    0.05,
    7.88,
    1.78,
    4.70,
    materials.windowFrameCream
  );
  const ewGlass = createBox(
    'UIUX_East_Win_Glass_Pane',
    0.03,
    1.66,
    4.06,
    7.91,
    1.78,
    4.00,
    materials.windowSkyGlass
  );
  eastStudioWindow.add(ewSill, ewHeader, ewJambS, ewJambN, ewMullion1, ewMullion2, ewGlass);
  groups.WINDOWS.add(eastStudioWindow);
  eastWallNodes.push(eastStudioWindow);

  const southCutawayWest = createBox(
    'UIUX_Wall_South_Cutaway_West',
    2.94,
    0.18,
    0.08,
    1.51,
    0.09,
    0.05,
    materials.uiuxPaleBirch,
    { category: 'WALLS', wallSide: 'SOUTH' }
  );
  const southCutawayEast = createBox(
    'UIUX_Wall_South_Cutaway_East',
    2.94,
    0.18,
    0.08,
    6.49,
    0.09,
    0.05,
    materials.uiuxPaleBirch,
    { category: 'WALLS', wallSide: 'SOUTH' }
  );
  groups.WALLS.add(eastCutawayCurb, southCutawayWest, southCutawayEast);

  // South Corridor Connector ([4, 0, 0], X = 3.0..5.0)
  const connectorSouthGroup = new THREE.Group();
  connectorSouthGroup.name = 'UIUX_CONNECTOR_SOUTH';
  connectorSouthGroup.position.set(4.0, 0.0, 0.0);

  const southThresholdPlate = createBox(
    'UIUX_Connector_South_Removable_Threshold',
    2.0,
    0.025,
    0.14,
    0.0,
    0.0125,
    0.07,
    materials.uiuxPaleBirch,
    { category: 'CONNECTORS', connectorId: 'UIUX_CONNECTOR_SOUTH', removable: true }
  );
  const southDoorPillarW = createBox(
    'UIUX_Connector_South_Pillar_W',
    0.12,
    0.34,
    0.12,
    -1.02,
    0.17,
    0.07,
    materials.uiuxMutedSage,
    { category: 'CONNECTORS' }
  );
  const southDoorPillarE = createBox(
    'UIUX_Connector_South_Pillar_E',
    0.12,
    0.34,
    0.12,
    1.02,
    0.17,
    0.07,
    materials.uiuxMutedSage,
    { category: 'CONNECTORS' }
  );
  const southMatBase = createBox(
    'UIUX_Door_Welcome_Mat_Base',
    1.56,
    0.014,
    0.58,
    0.0,
    0.007,
    0.52,
    materials.wallCapDark,
    { category: 'CONNECTORS' }
  );
  const southMatInlay = createBox(
    'UIUX_Door_Welcome_Mat_Inlay',
    1.4,
    0.01,
    0.44,
    0.0,
    0.019,
    0.52,
    materials.uiuxMutedSage,
    { category: 'CONNECTORS' }
  );
  connectorSouthGroup.add(
    southThresholdPlate,
    southDoorPillarW,
    southDoorPillarE,
    southMatBase,
    southMatInlay
  );
  groups.CONNECTORS.add(connectorSouthGroup);

  // =========================================================================
  // 5. ZONE A — PRIMARY DESIGN WORKSTATION (North-East Studio Bay)
  //    `UIUX_Primary_Workstation` at [5.45, 0, 5.75] + `UIUX_Studio_Chair` at [5.35, 0, 6.58]
  // =========================================================================
  const workstationGroup = new THREE.Group();
  workstationGroup.name = 'UIUX_Primary_Workstation';
  workstationGroup.position.set(5.45, 0, 5.75);

  // Main pale-birch desktop frame + matte off-white laminated work surface
  const deskBirchEdge = createBox(
    'UIUX_Desk_Birch_Edge_Frame',
    2.16,
    0.045,
    0.96,
    -0.08,
    0.725,
    0.0,
    materials.uiuxPaleBirch
  );
  const deskTopWhite = createBox(
    'UIUX_Desk_OffWhite_Work_Surface',
    2.08,
    0.02,
    0.88,
    -0.08,
    0.758,
    0.0,
    materials.uiuxOffWhiteSurface
  );
  // L-shaped side creative return wing on East side (for Pantone fan deck & sketch pad)
  const deskReturnFrame = createBox(
    'UIUX_Desk_Side_Return_Birch',
    0.66,
    0.045,
    0.64,
    0.67,
    0.725,
    -0.68,
    materials.uiuxPaleBirch
  );
  const deskReturnSurface = createBox(
    'UIUX_Desk_Side_Return_Surface',
    0.58,
    0.02,
    0.56,
    0.67,
    0.758,
    -0.68,
    materials.uiuxOffWhiteSurface
  );
  // Sculpted Nordic birch A-frame legs (West) + Sage storage drawer pedestal (East)
  const deskLegNW = createBox(
    'UIUX_Desk_Birch_Leg_NW',
    0.07,
    0.7,
    0.07,
    -1.06,
    0.35,
    0.38,
    materials.uiuxPaleBirch
  );
  const deskLegSW = createBox(
    'UIUX_Desk_Birch_Leg_SW',
    0.07,
    0.7,
    0.07,
    -1.06,
    0.35,
    -0.38,
    materials.uiuxPaleBirch
  );
  const deskLegStretcherW = createBox(
    'UIUX_Desk_Birch_Stretcher_W',
    0.05,
    0.05,
    0.68,
    -1.06,
    0.16,
    0.0,
    materials.uiuxPaleBirch
  );
  const deskPedestalEast = createBox(
    'UIUX_Desk_Storage_Pedestal_East',
    0.52,
    0.7,
    0.56,
    0.67,
    0.35,
    -0.68,
    materials.uiuxPaleBirch
  );
  const deskDrawer1 = createBox(
    'UIUX_Desk_Drawer_Front_Top',
    0.02,
    0.18,
    0.46,
    0.4,
    0.56,
    -0.68,
    materials.uiuxMutedSage
  );
  const deskDrawer2 = createBox(
    'UIUX_Desk_Drawer_Front_Mid',
    0.02,
    0.18,
    0.46,
    0.4,
    0.35,
    -0.68,
    materials.uiuxOffWhiteSurface
  );
  const deskDrawer3 = createBox(
    'UIUX_Desk_Drawer_Front_Bot',
    0.02,
    0.18,
    0.46,
    0.4,
    0.14,
    -0.68,
    materials.uiuxDustyLavender
  );
  const deskLegNE = createBox(
    'UIUX_Desk_Birch_Leg_NE',
    0.07,
    0.7,
    0.07,
    0.88,
    0.35,
    0.38,
    materials.uiuxPaleBirch
  );
  // Modesty cable tray in muted sage
  const deskCableTray = createBox(
    'UIUX_Desk_Cable_Management_Channel',
    1.6,
    0.14,
    0.06,
    -0.12,
    0.6,
    -0.34,
    materials.uiuxMutedSage
  );

  // Muted Sage Felt Desk Mat
  const deskMat = createBox(
    'UIUX_Desk_Sage_Felt_Mat',
    1.18,
    0.008,
    0.46,
    -0.15,
    0.772,
    0.12,
    materials.uiuxMutedSage
  );

  // Ultra-Wide 5K UI Design Monitor (Facing +Z toward seated designer at Z = 6.58!)
  const monArmBase = createCyl(
    'UIUX_Monitor_Arm_Clamp',
    0.055,
    0.065,
    0.06,
    12,
    -0.28,
    0.795,
    -0.32,
    materials.chromeSilver
  );
  const monArmPost = createCyl(
    'UIUX_Monitor_Arm_Post',
    0.024,
    0.024,
    0.34,
    10,
    -0.28,
    0.96,
    -0.32,
    materials.chromeSilver
  );
  const monArmBoom = createBox(
    'UIUX_Monitor_Arm_Boom',
    0.16,
    0.03,
    0.12,
    -0.22,
    1.08,
    -0.25,
    materials.chromeSilver
  );
  const monBezel = createBox(
    'UIUX_5K_Ultrawide_Monitor_Bezel',
    0.96,
    0.44,
    0.036,
    -0.18,
    1.11,
    -0.16,
    materials.ceoCharcoalCase
  );
  // Screen face on +Z side (Z = -0.139) so the seated designer at Z = +0.83 views the screen!
  const monScreen = createBox(
    'UIUX_5K_Ultrawide_Monitor_Screen',
    0.91,
    0.39,
    0.006,
    -0.18,
    1.11,
    -0.139,
    materials.uiuxDesignMonitor
  );
  const monTopHood = createBox(
    'UIUX_Monitor_Color_Calibration_Hood',
    0.97,
    0.016,
    0.09,
    -0.18,
    1.335,
    -0.135,
    materials.ceoCharcoalCase
  );
  // Sleek Studio Aluminum Backplate & Lavender LED Status Strip on -Z back of 5K Monitor
  const monBackplate = createBox(
    'UIUX_5K_Monitor_Silver_Studio_Backplate',
    0.88,
    0.36,
    0.008,
    -0.18,
    1.11,
    -0.182,
    materials.uiuxOffWhiteSurface
  );
  const monBackAccent = createBox(
    'UIUX_5K_Monitor_Studio_Status_Bar',
    0.52,
    0.035,
    0.006,
    -0.18,
    1.21,
    -0.189,
    materials.uiuxDustyLavender
  );
  // Vertical Mobile UI Preview Monitor on East Return facing South-East toward isometric camera
  const mobilePreviewStand = createCyl(
    'UIUX_Mobile_Preview_Stand_Post',
    0.016,
    0.022,
    0.26,
    10,
    0.76,
    0.89,
    -0.36,
    materials.chromeSilver
  );
  const mobilePreviewFrame = createBox(
    'UIUX_Vertical_Mobile_Preview_Bezel',
    0.24,
    0.42,
    0.024,
    0.76,
    1.04,
    -0.34,
    materials.ceoCharcoalCase
  );
  mobilePreviewFrame.rotation.y = 0.55;
  const mobilePreviewScreen = createBox(
    'UIUX_Vertical_Mobile_Preview_Screen',
    0.21,
    0.38,
    0.006,
    0.752,
    1.04,
    -0.352,
    materials.uiuxDesignMonitor
  );
  mobilePreviewScreen.rotation.y = 0.55;
  workstationGroup.add(
    monBackplate,
    monBackAccent,
    mobilePreviewStand,
    mobilePreviewFrame,
    mobilePreviewScreen
  );

  // Interactive Pen Display / Drawing Tablet (tilted toward designer on East side of main desk)
  const penDisplayGroup = new THREE.Group();
  penDisplayGroup.name = 'UIUX_Interactive_Pen_Display';
  penDisplayGroup.position.set(0.48, 0.85, 0.04);
  penDisplayGroup.rotation.y = 0.24; // Angled toward the designer
  penDisplayGroup.rotation.x = -0.48; // Ergonomic drawing tilt facing +Z/+Y

  const tabletChassis = createBox(
    'UIUX_Pen_Tablet_Chassis',
    0.42,
    0.28,
    0.024,
    0,
    0,
    0,
    materials.ceoCharcoalCase
  );
  const tabletScreen = createBox(
    'UIUX_Pen_Tablet_Active_Screen',
    0.36,
    0.23,
    0.006,
    0,
    0,
    0.014,
    materials.uiuxPenTablet
  );
  penDisplayGroup.add(tabletChassis, tabletScreen);

  const tabletStandBack = createBox(
    'UIUX_Pen_Tablet_Kickstand',
    0.18,
    0.12,
    0.12,
    0.48,
    0.82,
    -0.04,
    materials.darkMetal
  );
  // Digital Stylus Holder & Stylus Pen
  const stylusHolder = createCyl(
    'UIUX_Stylus_Dock_Base',
    0.032,
    0.038,
    0.045,
    10,
    0.76,
    0.79,
    0.16,
    materials.ceoCharcoalCase
  );
  const stylusPen = createCyl(
    'UIUX_Digital_Stylus_Pen',
    0.007,
    0.005,
    0.15,
    8,
    0.76,
    0.86,
    0.16,
    materials.uiuxPeachCoral
  );
  stylusPen.rotation.z = 0.18;

  // Compact Mechanical Designer Keyboard with Pastel Accent Keycaps + Ergonomic Mouse
  const kbBase = createBox(
    'UIUX_Mechanical_Keyboard_Base',
    0.36,
    0.02,
    0.13,
    -0.22,
    0.785,
    0.14,
    materials.uiuxOffWhiteSurface
  );
  const kbKeysMain = createBox(
    'UIUX_Keyboard_Main_Keys',
    0.28,
    0.01,
    0.095,
    -0.24,
    0.798,
    0.14,
    materials.ceramicCream
  );
  const kbKeyAccentEsc = createBox(
    'UIUX_Keyboard_Key_Coral_Esc',
    0.025,
    0.012,
    0.025,
    -0.37,
    0.799,
    0.1,
    materials.uiuxPeachCoral
  );
  const kbKeyAccentEnter = createBox(
    'UIUX_Keyboard_Key_Sage_Enter',
    0.035,
    0.012,
    0.045,
    -0.07,
    0.799,
    0.14,
    materials.uiuxMutedSage
  );
  const ergoMouse = createBox(
    'UIUX_Ergonomic_Wireless_Mouse',
    0.065,
    0.032,
    0.1,
    0.06,
    0.788,
    0.15,
    materials.uiuxDustyLavender
  );

  // Open Dot-Grid Sketchbook & Pantone Color Fan Deck on Side Return
  const sketchbookCover = createBox(
    'UIUX_Sketchbook_Cover',
    0.28,
    0.014,
    0.21,
    -0.72,
    0.775,
    0.12,
    materials.uiuxDustyLavender
  );
  const sketchbookPages = createBox(
    'UIUX_Sketchbook_Open_Pages',
    0.26,
    0.012,
    0.19,
    -0.72,
    0.786,
    0.12,
    materials.paperCream
  );
  // Pantone Swatch Fan Deck (3 fanned color blades)
  const fanBlade1 = createBox(
    'UIUX_Pantone_Fan_Blade_Sage',
    0.18,
    0.01,
    0.055,
    0.66,
    0.774,
    -0.64,
    materials.uiuxMutedSage
  );
  const fanBlade2 = createBox(
    'UIUX_Pantone_Fan_Blade_Coral',
    0.18,
    0.01,
    0.055,
    0.68,
    0.784,
    -0.66,
    materials.uiuxPeachCoral
  );
  fanBlade2.rotation.y = 0.35;
  const fanBlade3 = createBox(
    'UIUX_Pantone_Fan_Blade_Lavender',
    0.18,
    0.01,
    0.055,
    0.7,
    0.794,
    -0.68,
    materials.uiuxDustyLavender
  );
  fanBlade3.rotation.y = 0.7;

  // Articulated Muted-Sage Studio Task Lamp on West end of Desk
  const lampBase = createCyl(
    'UIUX_Task_Lamp_Base',
    0.08,
    0.09,
    0.025,
    12,
    -0.88,
    0.78,
    -0.22,
    materials.uiuxMutedSage
  );
  const lampStem = createCyl(
    'UIUX_Task_Lamp_Stem',
    0.014,
    0.014,
    0.38,
    8,
    -0.88,
    0.97,
    -0.22,
    materials.brushedBrass
  );
  const lampArm = createBox(
    'UIUX_Task_Lamp_Boom_Arm',
    0.22,
    0.018,
    0.018,
    -0.79,
    1.15,
    -0.18,
    materials.brushedBrass
  );
  const lampCone = createCyl(
    'UIUX_Task_Lamp_Sage_Shade',
    0.04,
    0.09,
    0.11,
    12,
    -0.69,
    1.11,
    -0.16,
    materials.uiuxMutedSage
  );
  const lampBulb = createBox(
    'UIUX_Task_Lamp_Warm_Glow',
    0.06,
    0.02,
    0.06,
    -0.69,
    1.055,
    -0.16,
    materials.lampShadeWarm
  );

  // Birch Marker & Brush Organizer Caddy
  const markerCaddy = createBox(
    'UIUX_Marker_Organizer_Caddy',
    0.12,
    0.09,
    0.08,
    -0.58,
    0.812,
    -0.26,
    materials.uiuxPaleBirch
  );
  const marker1 = createCyl(
    'UIUX_Marker_Coral',
    0.008,
    0.008,
    0.06,
    6,
    -0.61,
    0.88,
    -0.26,
    materials.uiuxPeachCoral
  );
  const marker2 = createCyl(
    'UIUX_Marker_Teal',
    0.008,
    0.008,
    0.065,
    6,
    -0.58,
    0.882,
    -0.26,
    materials.uiuxSoftTeal
  );
  const marker3 = createCyl(
    'UIUX_Marker_Butter',
    0.008,
    0.008,
    0.058,
    6,
    -0.55,
    0.878,
    -0.26,
    materials.uiuxSoftButter
  );

  workstationGroup.add(
    deskBirchEdge,
    deskTopWhite,
    deskReturnFrame,
    deskReturnSurface,
    deskLegNW,
    deskLegSW,
    deskLegStretcherW,
    deskPedestalEast,
    deskDrawer1,
    deskDrawer2,
    deskDrawer3,
    deskLegNE,
    deskCableTray,
    deskMat,
    monArmBase,
    monArmPost,
    monArmBoom,
    monBezel,
    monScreen,
    monTopHood,
    penDisplayGroup,
    tabletStandBack,
    stylusHolder,
    stylusPen,
    kbBase,
    kbKeysMain,
    kbKeyAccentEsc,
    kbKeyAccentEnter,
    ergoMouse,
    sketchbookCover,
    sketchbookPages,
    fanBlade1,
    fanBlade2,
    fanBlade3,
    lampBase,
    lampStem,
    lampArm,
    lampCone,
    lampBulb,
    markerCaddy,
    marker1,
    marker2,
    marker3
  );
  tagCatalogGroup(workstationGroup, 'UIUX_Primary_Workstation', 'FURNITURE');
  groups.FURNITURE.add(workstationGroup);
  catalogNodeMap.set('UIUX_Primary_Workstation', workstationGroup);

  // Ergonomic Sage & Dusty-Lavender Studio Task Chair (`UIUX_Studio_Chair` at [5.35, 0, 6.58])
  const studioChairGroup = new THREE.Group();
  studioChairGroup.name = 'UIUX_Studio_Chair';
  studioChairGroup.position.set(5.35, 0, 6.58);

  const chairStarHub = createCyl(
    'UIUX_Chair_Base_Cylinder',
    0.04,
    0.045,
    0.38,
    10,
    0,
    0.22,
    0,
    materials.uiuxOffWhiteSurface
  );
  const chairStarLegX = createBox(
    'UIUX_Chair_Star_Base_X',
    0.54,
    0.035,
    0.06,
    0,
    0.045,
    0,
    materials.uiuxOffWhiteSurface
  );
  const chairStarLegZ = createBox(
    'UIUX_Chair_Star_Base_Z',
    0.06,
    0.035,
    0.54,
    0,
    0.045,
    0,
    materials.uiuxOffWhiteSurface
  );
  const chairSeat = createBox(
    'UIUX_Chair_Sage_Seat_Cushion',
    0.5,
    0.075,
    0.48,
    0,
    0.44,
    0,
    materials.uiuxMutedSage
  );
  // Backrest on North (+Z) side of chair so chair faces South (-Z) toward the workstation!
  const chairSpine = createBox(
    'UIUX_Chair_White_Spine_Frame',
    0.12,
    0.48,
    0.04,
    0,
    0.68,
    0.23,
    materials.uiuxOffWhiteSurface
  );
  const chairBackrest = createBox(
    'UIUX_Chair_Lavender_Mesh_Backrest',
    0.46,
    0.46,
    0.06,
    0,
    0.74,
    0.19,
    materials.uiuxDustyLavender
  );
  const chairHeadrest = createBox(
    'UIUX_Chair_Sage_Headrest',
    0.26,
    0.11,
    0.055,
    0,
    1.02,
    0.19,
    materials.uiuxMutedSage
  );
  const chairArmL = createBox(
    'UIUX_Chair_Armrest_W',
    0.055,
    0.18,
    0.28,
    -0.26,
    0.56,
    0.02,
    materials.uiuxOffWhiteSurface
  );
  const chairArmR = createBox(
    'UIUX_Chair_Armrest_E',
    0.055,
    0.18,
    0.28,
    0.26,
    0.56,
    0.02,
    materials.uiuxOffWhiteSurface
  );
  studioChairGroup.add(
    chairStarHub,
    chairStarLegX,
    chairStarLegZ,
    chairSeat,
    chairSpine,
    chairBackrest,
    chairHeadrest,
    chairArmL,
    chairArmR
  );
  tagCatalogGroup(studioChairGroup, 'UIUX_Studio_Chair', 'FURNITURE');
  groups.FURNITURE.add(studioChairGroup);
  catalogNodeMap.set('UIUX_Studio_Chair', studioChairGroup);

  // =========================================================================
  // 6. ZONE B — 3D WIREFRAME / UX FLOW WALL (West Wall South-Center)
  //    `UIUX_Wireframe_Flow_Wall` at [0.34, 1.56, 2.85]
  // =========================================================================
  const wireframeWallGroup = new THREE.Group();
  wireframeWallGroup.name = 'UIUX_Wireframe_Flow_Wall';
  wireframeWallGroup.position.set(0.34, 1.56, 2.85);

  const wfFrameBacking = createBox(
    'UIUX_WF_Birch_Frame_Backing',
    0.05,
    1.38,
    2.68,
    -0.04,
    0,
    0,
    materials.uiuxPaleBirch
  );
  const wfCanvasFace = createBox(
    'UIUX_WF_DotGrid_Board_Surface',
    0.02,
    1.28,
    2.56,
    -0.005,
    0,
    0,
    materials.uiuxWireframeBoard
  );
  const wfMarkerLedge = createBox(
    'UIUX_WF_Bottom_Pin_Ledge',
    0.1,
    0.04,
    2.68,
    0.02,
    -0.67,
    0,
    materials.uiuxPaleBirch
  );

  // 3D Raised Mobile & Web Wireframe Screen Cards on the Board (X = +0.018..+0.032)
  const wfMobileCard1 = createBox(
    'UIUX_WF_3D_Mobile_Screen_Onboarding',
    0.018,
    0.44,
    0.26,
    0.016,
    0.14,
    -0.92,
    materials.paperCream
  );
  const wfMobileHeader1 = createBox(
    'UIUX_WF_3D_Mobile_Header_1',
    0.012,
    0.08,
    0.22,
    0.031,
    0.29,
    -0.92,
    materials.uiuxMutedSage
  );
  const wfMobileCard2 = createBox(
    'UIUX_WF_3D_Mobile_Screen_Home',
    0.018,
    0.44,
    0.26,
    0.016,
    0.14,
    -0.46,
    materials.paperCream
  );
  const wfMobileHeader2 = createBox(
    'UIUX_WF_3D_Mobile_Header_2',
    0.012,
    0.08,
    0.22,
    0.031,
    0.29,
    -0.46,
    materials.uiuxDustyLavender
  );
  const wfDesktopCard = createBox(
    'UIUX_WF_3D_Desktop_Wireframe_Frame',
    0.018,
    0.52,
    0.68,
    0.016,
    0.12,
    0.18,
    materials.paperCream
  );
  const wfDesktopHero = createBox(
    'UIUX_WF_3D_Desktop_Hero_Block',
    0.012,
    0.16,
    0.6,
    0.031,
    0.24,
    0.18,
    materials.uiuxSoftTeal
  );
  const wfDesktopGrid1 = createBox(
    'UIUX_WF_3D_Desktop_Card_A',
    0.012,
    0.16,
    0.27,
    0.031,
    0.02,
    0.02,
    materials.uiuxMutedSage
  );
  const wfDesktopGrid2 = createBox(
    'UIUX_WF_3D_Desktop_Card_B',
    0.012,
    0.16,
    0.27,
    0.031,
    0.02,
    0.34,
    materials.uiuxPeachCoral
  );
  const wfMobileCard3 = createBox(
    'UIUX_WF_3D_Mobile_Screen_Checkout',
    0.018,
    0.44,
    0.26,
    0.016,
    0.14,
    0.84,
    materials.paperCream
  );
  const wfMobileHeader3 = createBox(
    'UIUX_WF_3D_Mobile_Header_3',
    0.012,
    0.08,
    0.22,
    0.031,
    0.29,
    0.84,
    materials.uiuxPeachCoral
  );

  // 3D Sticky Note Clusters (User Journey & UX Research Notes)
  const stickySpecs: Array<[string, number, number, THREE.Material]> = [
    ['UIUX_WF_Sticky_Coral_1', -0.32, -1.02, materials.uiuxPeachCoral],
    ['UIUX_WF_Sticky_Butter_1', -0.32, -0.82, materials.uiuxSoftButter],
    ['UIUX_WF_Sticky_Sage_1', -0.32, -0.62, materials.uiuxMutedSage],
    ['UIUX_WF_Sticky_Lavender_1', -0.32, -0.42, materials.uiuxDustyLavender],
    ['UIUX_WF_Sticky_Teal_1', -0.32, -0.12, materials.uiuxSoftTeal],
    ['UIUX_WF_Sticky_Coral_2', -0.32, 0.08, materials.uiuxPeachCoral],
    ['UIUX_WF_Sticky_Sage_2', -0.32, 0.28, materials.uiuxMutedSage],
    ['UIUX_WF_Sticky_Butter_2', -0.32, 0.56, materials.uiuxSoftButter],
    ['UIUX_WF_Sticky_Lavender_2', -0.32, 0.76, materials.uiuxDustyLavender],
    ['UIUX_WF_Sticky_Coral_3', -0.32, 0.96, materials.uiuxPeachCoral],
  ];
  stickySpecs.forEach(([sName, sy, sz, sMat]) => {
    wireframeWallGroup.add(createBox(sName, 0.016, 0.14, 0.14, 0.016, sy, sz, sMat));
  });

  wireframeWallGroup.add(
    wfFrameBacking,
    wfCanvasFace,
    wfMarkerLedge,
    wfMobileCard1,
    wfMobileHeader1,
    wfMobileCard2,
    wfMobileHeader2,
    wfDesktopCard,
    wfDesktopHero,
    wfDesktopGrid1,
    wfDesktopGrid2,
    wfMobileCard3,
    wfMobileHeader3
  );
  tagCatalogGroup(wireframeWallGroup, 'UIUX_Wireframe_Flow_Wall', 'FURNITURE');
  groups.FURNITURE.add(wireframeWallGroup);
  catalogNodeMap.set('UIUX_Wireframe_Flow_Wall', wireframeWallGroup);
  westWallNodes.push(wireframeWallGroup);

  // =========================================================================
  // 7. ZONE C — VISUAL DESIGN / STYLE & TOKEN BOARD (West Wall North)
  //    `UIUX_Style_System_Board` at [0.35, 1.58, 5.85]
  // =========================================================================
  const styleBoardGroup = new THREE.Group();
  styleBoardGroup.name = 'UIUX_Style_System_Board';
  styleBoardGroup.position.set(0.35, 1.58, 5.85);

  const sbFrame = createBox(
    'UIUX_Style_Charcoal_Gallery_Frame',
    0.05,
    1.34,
    2.08,
    -0.05,
    0,
    0,
    materials.ceoCharcoalCase
  );
  const sbSurface = createBox(
    'UIUX_Style_Alabaster_Backdrop',
    0.02,
    1.24,
    1.96,
    -0.015,
    0,
    0,
    materials.uiuxStyleBoard
  );
  const sbLedge = createBox(
    'UIUX_Style_Birch_Swatch_Ledge',
    0.11,
    0.04,
    2.08,
    0.015,
    -0.65,
    0,
    materials.uiuxPaleBirch
  );

  // 12 Tactile 3D Color Swatch Tiles (3 rows × 4 columns on the North half of the board)
  const swatchGridMats = [
    materials.uiuxMutedSage,
    materials.uiuxSoftTeal,
    materials.uiuxDustyLavender,
    materials.uiuxPeachCoral,
    materials.uiuxSoftButter,
    materials.uiuxPaleBirch,
    materials.uiuxOffWhiteSurface,
    materials.ceoCharcoalCase,
    materials.noteSky,
    materials.noteCoral,
    materials.noteSage,
    materials.brushedBrass,
  ];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 4 + c;
      const sy = 0.32 - r * 0.24;
      const sz = 0.14 + c * 0.21;
      const tile = createBox(
        `UIUX_Style_3D_Color_Swatch_${idx + 1}`,
        0.022,
        0.16,
        0.16,
        0.012,
        sy,
        sz,
        swatchGridMats[idx]
      );
      const tileLabel = createBox(
        `UIUX_Style_Swatch_Hex_Tag_${idx + 1}`,
        0.01,
        0.035,
        0.16,
        0.028,
        sy - 0.06,
        sz,
        materials.paperCream
      );
      styleBoardGroup.add(tile, tileLabel);
    }
  }

  // 3D UI Component Token Pill Samples on the South-Bottom quadrant of the Style Board
  const tokenBtnPrimary = createBox(
    'UIUX_Style_3D_Button_Token_Primary',
    0.02,
    0.09,
    0.34,
    0.012,
    -0.36,
    -0.62,
    materials.uiuxSoftTeal
  );
  const tokenBtnSecondary = createBox(
    'UIUX_Style_3D_Button_Token_Secondary',
    0.02,
    0.09,
    0.34,
    0.012,
    -0.36,
    -0.22,
    materials.uiuxDustyLavender
  );
  const tokenBtnAccent = createBox(
    'UIUX_Style_3D_Button_Token_Accent',
    0.02,
    0.09,
    0.34,
    0.012,
    -0.49,
    -0.62,
    materials.uiuxPeachCoral
  );
  styleBoardGroup.add(
    sbFrame,
    sbSurface,
    sbLedge,
    tokenBtnPrimary,
    tokenBtnSecondary,
    tokenBtnAccent
  );
  tagCatalogGroup(styleBoardGroup, 'UIUX_Style_System_Board', 'FURNITURE');
  groups.FURNITURE.add(styleBoardGroup);
  catalogNodeMap.set('UIUX_Style_System_Board', styleBoardGroup);
  westWallNodes.push(styleBoardGroup);

  // =========================================================================
  // 8. ZONE D — PROTOTYPE REVIEW AREA (South-East Collaborative Critique Zone)
  //    `UIUX_Prototype_Review_Table` at [5.65, 0, 2.55] +
  //    `UIUX_Mobile_Critique_Stand` at [6.88, 0, 4.15]
  // =========================================================================
  const reviewTableGroup = new THREE.Group();
  reviewTableGroup.name = 'UIUX_Prototype_Review_Table';
  reviewTableGroup.position.set(5.65, 0, 2.55);

  // Round Nordic Birch Collaborative Tabletop + White Bevel Inlay
  const roundTableTop = createCyl(
    'UIUX_Review_Round_Birch_Tabletop',
    0.64,
    0.62,
    0.045,
    24,
    0,
    0.72,
    0,
    materials.uiuxPaleBirch
  );
  const roundTableInlay = createCyl(
    'UIUX_Review_Table_OffWhite_Center',
    0.52,
    0.52,
    0.012,
    24,
    0,
    0.748,
    0,
    materials.uiuxOffWhiteSurface
  );
  // Sculpted 4-Fin Birch Pedestal Base
  const pedFinX = createBox(
    'UIUX_Review_Table_Pedestal_Fin_X',
    0.68,
    0.69,
    0.055,
    0,
    0.345,
    0,
    materials.uiuxPaleBirch
  );
  const pedFinZ = createBox(
    'UIUX_Review_Table_Pedestal_Fin_Z',
    0.055,
    0.69,
    0.68,
    0,
    0.345,
    0,
    materials.uiuxPaleBirch
  );

  // Interactive Tablet Prototype Stand + Printed App Screens + Swatch Cards on Table
  const protoDockBase = createBox(
    'UIUX_Review_Tablet_Dock_Base',
    0.16,
    0.03,
    0.14,
    0.08,
    0.768,
    -0.06,
    materials.uiuxMutedSage
  );
  const protoTablet = createBox(
    'UIUX_Review_Interactive_Tablet_Prototype',
    0.26,
    0.18,
    0.018,
    0.08,
    0.84,
    -0.04,
    materials.ceoCharcoalCase
  );
  protoTablet.rotation.x = -0.45;
  protoTablet.rotation.y = -0.5;
  const protoTabletScreen = createBox(
    'UIUX_Review_Tablet_Screen_Face',
    0.23,
    0.15,
    0.006,
    0.075,
    0.845,
    -0.032,
    materials.uiuxPenTablet
  );
  protoTabletScreen.rotation.x = -0.45;
  protoTabletScreen.rotation.y = -0.5;

  const printedWireframe1 = createBox(
    'UIUX_Review_Printed_Screen_Sheet_1',
    0.16,
    0.008,
    0.24,
    -0.22,
    0.758,
    0.12,
    materials.paperCream
  );
  printedWireframe1.rotation.y = 0.25;
  const printedWireframe2 = createBox(
    'UIUX_Review_Printed_Screen_Sheet_2',
    0.16,
    0.008,
    0.24,
    -0.04,
    0.758,
    0.24,
    materials.uiuxPeachCoral
  );
  printedWireframe2.rotation.y = -0.18;
  const reviewCoffeeMug = createCyl(
    'UIUX_Review_Ceramic_Mug',
    0.038,
    0.034,
    0.085,
    10,
    0.26,
    0.795,
    0.18,
    materials.ceramicCream
  );

  // Two Sculptural Designer Bouclé Stools around the Critique Table
  const buildStudioStool = (
    prefix: string,
    sx: number,
    sz: number,
    cushionMat: THREE.Material
  ): THREE.Group => {
    const stool = new THREE.Group();
    stool.name = prefix;
    stool.position.set(sx, 0, sz);

    const cushion = createCyl(
      `${prefix}_Boucle_Cushion`,
      0.21,
      0.22,
      0.09,
      16,
      0,
      0.44,
      0,
      cushionMat
    );
    const baseDisc = createCyl(
      `${prefix}_Birch_Underplate`,
      0.19,
      0.18,
      0.03,
      14,
      0,
      0.38,
      0,
      materials.uiuxPaleBirch
    );
    const legOffsets: Array<[number, number]> = [
      [-0.11, -0.11],
      [0.11, -0.11],
      [-0.11, 0.11],
      [0.11, 0.11],
    ];
    legOffsets.forEach(([lx, lz], i) => {
      stool.add(
        createCyl(
          `${prefix}_Leg_${i + 1}`,
          0.022,
          0.016,
          0.37,
          8,
          lx,
          0.185,
          lz,
          materials.uiuxPaleBirch
        )
      );
    });
    const footRing = createCyl(
      `${prefix}_Brass_Footrest_Ring`,
      0.15,
      0.15,
      0.02,
      14,
      0,
      0.14,
      0,
      materials.brushedBrass
    );
    stool.add(cushion, baseDisc, footRing);
    return stool;
  };

  const stoolNorthEast = buildStudioStool(
    'UIUX_Review_Stool_Sage_NE',
    0.58,
    0.46,
    materials.uiuxMutedSage
  );
  const stoolSouthEast = buildStudioStool(
    'UIUX_Review_Stool_Lavender_SE',
    0.58,
    -0.46,
    materials.uiuxDustyLavender
  );

  reviewTableGroup.add(
    roundTableTop,
    roundTableInlay,
    pedFinX,
    pedFinZ,
    protoDockBase,
    protoTablet,
    protoTabletScreen,
    printedWireframe1,
    printedWireframe2,
    reviewCoffeeMug,
    stoolNorthEast,
    stoolSouthEast
  );
  tagCatalogGroup(reviewTableGroup, 'UIUX_Prototype_Review_Table', 'FURNITURE');
  groups.FURNITURE.add(reviewTableGroup);
  catalogNodeMap.set('UIUX_Prototype_Review_Table', reviewTableGroup);

  // Freestanding Mobile Prototype & Component Easel (`UIUX_Mobile_Critique_Stand` at [6.92, 0, 2.35])
  const critiqueStandGroup = new THREE.Group();
  critiqueStandGroup.name = 'UIUX_Mobile_Critique_Stand';
  critiqueStandGroup.position.set(6.92, 0, 2.35);
  critiqueStandGroup.rotation.y = -0.38;

  const standBaseFootN = createBox(
    'UIUX_Easel_Rolling_Foot_N',
    0.52,
    0.04,
    0.06,
    0,
    0.04,
    0.38,
    materials.uiuxPaleBirch
  );
  const standBaseFootS = createBox(
    'UIUX_Easel_Rolling_Foot_S',
    0.52,
    0.04,
    0.06,
    0,
    0.04,
    -0.38,
    materials.uiuxPaleBirch
  );
  const standCrossbar = createBox(
    'UIUX_Easel_Lower_Tray_Shelf',
    0.36,
    0.03,
    0.72,
    0,
    0.28,
    0,
    materials.uiuxMutedSage
  );
  const standUprightN = createBox(
    'UIUX_Easel_Birch_Upright_N',
    0.05,
    1.76,
    0.05,
    0,
    0.92,
    0.38,
    materials.uiuxPaleBirch
  );
  const standUprightS = createBox(
    'UIUX_Easel_Birch_Upright_S',
    0.05,
    1.76,
    0.05,
    0,
    0.92,
    -0.38,
    materials.uiuxPaleBirch
  );
  const standBoardFrame = createBox(
    'UIUX_Easel_Magnetic_Board_Frame',
    0.045,
    1.04,
    0.72,
    0,
    1.28,
    0,
    materials.uiuxOffWhiteSurface
  );
  // 3D Mobile Prototype Screen Cards pinned to BOTH West (-X) and East (+X) faces of Easel
  const easelScreen1 = createBox(
    'UIUX_Easel_Mobile_Flow_Card_1',
    0.016,
    0.38,
    0.2,
    -0.03,
    1.42,
    -0.2,
    materials.uiuxSoftTeal
  );
  const easelScreen2 = createBox(
    'UIUX_Easel_Mobile_Flow_Card_2',
    0.016,
    0.38,
    0.2,
    -0.03,
    1.42,
    0.04,
    materials.uiuxDustyLavender
  );
  const easelScreen3 = createBox(
    'UIUX_Easel_Mobile_Flow_Card_3',
    0.016,
    0.38,
    0.2,
    -0.03,
    1.42,
    0.26,
    materials.uiuxPeachCoral
  );
  const easelSticky1 = createBox(
    'UIUX_Easel_Critique_Note_1',
    0.016,
    0.14,
    0.16,
    -0.03,
    1.02,
    -0.18,
    materials.uiuxSoftButter
  );
  const easelSticky2 = createBox(
    'UIUX_Easel_Critique_Note_2',
    0.016,
    0.14,
    0.16,
    -0.03,
    1.02,
    0.06,
    materials.uiuxMutedSage
  );
  const easelFrontCard1 = createBox(
    'UIUX_Easel_Front_Flow_Card_1',
    0.016,
    0.38,
    0.2,
    0.03,
    1.42,
    -0.2,
    materials.uiuxSoftTeal
  );
  const easelFrontCard2 = createBox(
    'UIUX_Easel_Front_Flow_Card_2',
    0.016,
    0.38,
    0.2,
    0.03,
    1.42,
    0.04,
    materials.uiuxDustyLavender
  );
  const easelFrontCard3 = createBox(
    'UIUX_Easel_Front_Flow_Card_3',
    0.016,
    0.38,
    0.2,
    0.03,
    1.42,
    0.26,
    materials.uiuxPeachCoral
  );
  const easelFrontSticky1 = createBox(
    'UIUX_Easel_Front_Note_1',
    0.016,
    0.14,
    0.16,
    0.03,
    1.02,
    -0.18,
    materials.uiuxSoftButter
  );
  const easelFrontSticky2 = createBox(
    'UIUX_Easel_Front_Note_2',
    0.016,
    0.14,
    0.16,
    0.03,
    1.02,
    0.06,
    materials.uiuxMutedSage
  );

  critiqueStandGroup.add(
    standBaseFootN,
    standBaseFootS,
    standCrossbar,
    standUprightN,
    standUprightS,
    standBoardFrame,
    easelScreen1,
    easelScreen2,
    easelScreen3,
    easelSticky1,
    easelSticky2,
    easelFrontCard1,
    easelFrontCard2,
    easelFrontCard3,
    easelFrontSticky1,
    easelFrontSticky2
  );
  tagCatalogGroup(critiqueStandGroup, 'UIUX_Mobile_Critique_Stand', 'PROPS');
  groups.PROPS.add(critiqueStandGroup);
  catalogNodeMap.set('UIUX_Mobile_Critique_Stand', critiqueStandGroup);

  // =========================================================================
  // 9. ZONE E — STORAGE / MATERIAL SHELF (North-West Nordic Birch & Sage Shelf)
  //    `UIUX_Material_Storage_Shelf` at [2.05, 0, 7.38]
  // =========================================================================
  const storageShelfGroup = new THREE.Group();
  storageShelfGroup.name = 'UIUX_Material_Storage_Shelf';
  storageShelfGroup.position.set(2.05, 0, 7.38);

  // Main Birch Casework (W = 1.84, H = 2.38, D = 0.48) + Side Blueprint Roll Bin (W = 0.24)
  const shelfBackPanel = createBox(
    'UIUX_Shelf_Back_Panel',
    1.84,
    2.36,
    0.04,
    -0.08,
    1.18,
    0.22,
    materials.uiuxPaleBirch
  );
  const shelfSideWest = createBox(
    'UIUX_Shelf_Side_Upright_W',
    0.05,
    2.38,
    0.48,
    -0.975,
    1.19,
    0,
    materials.uiuxPaleBirch
  );
  const shelfSideEast = createBox(
    'UIUX_Shelf_Side_Upright_E',
    0.05,
    2.38,
    0.48,
    0.815,
    1.19,
    0,
    materials.uiuxPaleBirch
  );
  const shelfDividerVert = createBox(
    'UIUX_Shelf_Center_Divider',
    0.04,
    2.28,
    0.44,
    -0.08,
    1.16,
    -0.01,
    materials.uiuxPaleBirch
  );

  // 5 Horizontal Shelves (Y = 0.06, 0.64, 1.16, 1.68, 2.35)
  const shelfHeights = [0.06, 0.64, 1.16, 1.68, 2.35];
  shelfHeights.forEach((sy, idx) => {
    storageShelfGroup.add(
      createBox(
        `UIUX_Shelf_Horizontal_Tier_${idx + 1}`,
        1.74,
        0.04,
        0.46,
        -0.08,
        sy,
        -0.01,
        materials.uiuxPaleBirch
      )
    );
  });

  // Lower Enclosed Cubby Drawers (Sage & Off-White, Y = 0.08..0.62)
  const cubbyDoorW = createBox(
    'UIUX_Shelf_Lower_Door_Sage_W',
    0.81,
    0.52,
    0.03,
    -0.51,
    0.35,
    -0.225,
    materials.uiuxMutedSage
  );
  const cubbyDoorE = createBox(
    'UIUX_Shelf_Lower_Door_White_E',
    0.81,
    0.52,
    0.03,
    0.35,
    0.35,
    -0.225,
    materials.uiuxOffWhiteSurface
  );

  // Tier 2 (Y = 0.66..1.14): Tactile Material Sample Boxes & Swatch Binders
  const matBox1 = createBox(
    'UIUX_Shelf_Material_Sample_Box_Coral',
    0.26,
    0.28,
    0.34,
    -0.74,
    0.8,
    -0.02,
    materials.uiuxPeachCoral
  );
  const matBox2 = createBox(
    'UIUX_Shelf_Material_Sample_Box_Lavender',
    0.26,
    0.28,
    0.34,
    -0.44,
    0.8,
    -0.02,
    materials.uiuxDustyLavender
  );
  const matBox3 = createBox(
    'UIUX_Shelf_Material_Sample_Box_Teal',
    0.22,
    0.24,
    0.34,
    -0.18,
    0.78,
    -0.02,
    materials.uiuxSoftTeal
  );
  // Pantone & UI System Binders on East Bay of Tier 2
  const binderColors = [
    materials.uiuxMutedSage,
    materials.uiuxPeachCoral,
    materials.uiuxSoftButter,
    materials.uiuxDustyLavender,
    materials.uiuxSoftTeal,
    materials.paperCream,
  ];
  binderColors.forEach((bMat, bi) => {
    storageShelfGroup.add(
      createBox(
        `UIUX_Shelf_Pantone_Binder_${bi + 1}`,
        0.065,
        0.36,
        0.32,
        0.04 + bi * 0.08,
        0.84,
        -0.02,
        bMat
      )
    );
  });

  // Tier 3 (Y = 1.18..1.66): UI/UX & Typography Reference Books + Mockup Frame
  const bookClusters: Array<[number, number, number, THREE.Material]> = [
    [-0.84, 0.055, 0.34, materials.uiuxSoftTeal],
    [-0.77, 0.06, 0.38, materials.uiuxPeachCoral],
    [-0.7, 0.05, 0.32, materials.uiuxSoftButter],
    [-0.63, 0.065, 0.36, materials.uiuxDustyLavender],
    [-0.55, 0.055, 0.35, materials.uiuxMutedSage],
    [-0.48, 0.05, 0.3, materials.paperCream],
  ];
  bookClusters.forEach(([bx, bw, bh, bMat], idx) => {
    storageShelfGroup.add(
      createBox(`UIUX_Shelf_Design_Book_${idx + 1}`, bw, bh, 0.28, bx, 1.18 + bh / 2, -0.02, bMat)
    );
  });

  // Leaning UI Style Tile Mockup Board on Tier 3 East
  const leaningMockup = createBox(
    'UIUX_Shelf_Leaning_Mockup_Board',
    0.44,
    0.36,
    0.03,
    0.36,
    1.36,
    -0.04,
    materials.uiuxStyleBoard
  );
  leaningMockup.rotation.x = 0.14;

  // Tier 4 (Y = 1.70..2.33): Geometric Voxel Sculpture, Archive Boxes & Color Cube
  const topArchive1 = createBox(
    'UIUX_Shelf_Top_Archive_Sage',
    0.34,
    0.24,
    0.32,
    -0.68,
    1.82,
    -0.02,
    materials.uiuxMutedSage
  );
  const topArchive2 = createBox(
    'UIUX_Shelf_Top_Archive_Cream',
    0.34,
    0.24,
    0.32,
    -0.3,
    1.82,
    -0.02,
    materials.uiuxOffWhiteSurface
  );
  const colorCubeSculpture = createBox(
    'UIUX_Shelf_CMYK_Voxel_Sculpture',
    0.2,
    0.2,
    0.2,
    0.28,
    1.8,
    -0.04,
    materials.uiuxPeachCoral
  );
  colorCubeSculpture.rotation.y = Math.PI / 4;

  // Side Rolled Blueprint & Wireframe Tube Caddy (East flank of shelf X = +0.94)
  const rollCaddyBox = createBox(
    'UIUX_Shelf_Blueprint_Tube_Caddy',
    0.2,
    0.58,
    0.36,
    0.94,
    0.29,
    -0.02,
    materials.uiuxPaleBirch
  );
  const rollTube1 = createCyl(
    'UIUX_Blueprint_Roll_Tube_1',
    0.032,
    0.032,
    0.78,
    10,
    0.92,
    0.45,
    -0.08,
    materials.paperCream
  );
  const rollTube2 = createCyl(
    'UIUX_Blueprint_Roll_Tube_2',
    0.03,
    0.03,
    0.84,
    10,
    0.96,
    0.48,
    0.04,
    materials.uiuxMutedSage
  );
  const rollTube3 = createCyl(
    'UIUX_Blueprint_Roll_Tube_3',
    0.028,
    0.028,
    0.74,
    10,
    0.91,
    0.42,
    0.09,
    materials.uiuxPeachCoral
  );

  storageShelfGroup.add(
    shelfBackPanel,
    shelfSideWest,
    shelfSideEast,
    shelfDividerVert,
    cubbyDoorW,
    cubbyDoorE,
    matBox1,
    matBox2,
    matBox3,
    leaningMockup,
    topArchive1,
    topArchive2,
    colorCubeSculpture,
    rollCaddyBox,
    rollTube1,
    rollTube2,
    rollTube3
  );
  tagCatalogGroup(storageShelfGroup, 'UIUX_Material_Storage_Shelf', 'FURNITURE');
  groups.FURNITURE.add(storageShelfGroup);
  catalogNodeMap.set('UIUX_Material_Storage_Shelf', storageShelfGroup);

  // =========================================================================
  // 10. ZONE F — COZY STUDIO DECOR
  //     - `UIUX_Studio_Rug` at [4.15, 0.015, 4.15]
  //     - `UIUX_Lounge_Pouf` at [1.75, 0, 1.55]
  //     - `UIUX_Studio_Plants_And_Lamp` at [7.05, 0, 7.05] & SE corner [7.05, 0, 1.15]
  // =========================================================================
  const studioRugGroup = new THREE.Group();
  studioRugGroup.name = 'UIUX_Studio_Rug';
  studioRugGroup.position.set(4.15, 0.015, 4.15);

  const rugMain = createBox(
    'UIUX_Studio_Geometric_Rug_Surface',
    3.3,
    0.018,
    2.95,
    0,
    0,
    0,
    materials.uiuxStudioRug
  );
  studioRugGroup.add(rugMain);
  tagCatalogGroup(studioRugGroup, 'UIUX_Studio_Rug', 'DECORATION');
  groups.DECORATION.add(studioRugGroup);
  catalogNodeMap.set('UIUX_Studio_Rug', studioRugGroup);

  // Sculpted Dusty-Lavender & Peach Studio Knit Pouf (`UIUX_Lounge_Pouf` at [1.75, 0, 1.55])
  const poufGroup = new THREE.Group();
  poufGroup.name = 'UIUX_Lounge_Pouf';
  poufGroup.position.set(1.75, 0, 1.55);

  const poufPlinth = createCyl(
    'UIUX_Pouf_Birch_Plinth',
    0.29,
    0.3,
    0.05,
    16,
    0,
    0.025,
    0,
    materials.uiuxPaleBirch
  );
  const poufBodyLower = createCyl(
    'UIUX_Pouf_Lavender_Lower_Tier',
    0.33,
    0.31,
    0.18,
    18,
    0,
    0.14,
    0,
    materials.uiuxDustyLavender
  );
  const poufCordPiping = createCyl(
    'UIUX_Pouf_Peach_Piping_Ring',
    0.335,
    0.335,
    0.025,
    18,
    0,
    0.235,
    0,
    materials.uiuxPeachCoral
  );
  const poufBodyUpper = createCyl(
    'UIUX_Pouf_Lavender_Upper_Cushion',
    0.29,
    0.33,
    0.16,
    18,
    0,
    0.32,
    0,
    materials.uiuxDustyLavender
  );
  const poufCenterButton = createCyl(
    'UIUX_Pouf_Top_Button_Tuft',
    0.04,
    0.04,
    0.015,
    10,
    0,
    0.405,
    0,
    materials.uiuxPeachCoral
  );
  poufGroup.add(poufPlinth, poufBodyLower, poufCordPiping, poufBodyUpper, poufCenterButton);
  tagCatalogGroup(poufGroup, 'UIUX_Lounge_Pouf', 'DECORATION');
  groups.DECORATION.add(poufGroup);
  catalogNodeMap.set('UIUX_Lounge_Pouf', poufGroup);

  // Studio Tripod Floor Lamp & Ribbed Ceramic Planters (`UIUX_Studio_Plants_And_Lamp`)
  const plantsAndLampGroup = new THREE.Group();
  plantsAndLampGroup.name = 'UIUX_Studio_Plants_And_Lamp';
  plantsAndLampGroup.position.set(7.05, 0, 7.05);

  // Nordic Birch Tripod Floor Lamp in South-West Lounge Corner beside Pouf (room [1.05, 0, 1.05] -> local [-6.0, 0, -6.0])
  const tripodLampSubgroup = new THREE.Group();
  tripodLampSubgroup.name = 'UIUX_Tripod_Floor_Lamp_Assembly';
  tripodLampSubgroup.position.set(-6.0, 0, -6.0);

  const tripodLeg1 = createCyl(
    'UIUX_Tripod_Lamp_Leg_1',
    0.018,
    0.014,
    1.36,
    8,
    -0.14,
    0.66,
    -0.12,
    materials.uiuxPaleBirch
  );
  tripodLeg1.rotation.z = -0.14;
  tripodLeg1.rotation.x = 0.12;
  const tripodLeg2 = createCyl(
    'UIUX_Tripod_Lamp_Leg_2',
    0.018,
    0.014,
    1.36,
    8,
    0.14,
    0.66,
    -0.12,
    materials.uiuxPaleBirch
  );
  tripodLeg2.rotation.z = 0.14;
  tripodLeg2.rotation.x = 0.12;
  const tripodLeg3 = createCyl(
    'UIUX_Tripod_Lamp_Leg_3',
    0.018,
    0.014,
    1.36,
    8,
    0.0,
    0.66,
    0.16,
    materials.uiuxPaleBirch
  );
  tripodLeg3.rotation.x = -0.16;
  const tripodHub = createCyl(
    'UIUX_Tripod_Brass_Collar',
    0.045,
    0.045,
    0.08,
    12,
    0,
    1.28,
    0,
    materials.brushedBrass
  );
  const tripodShade = createCyl(
    'UIUX_Tripod_Warm_Drum_Shade',
    0.22,
    0.25,
    0.34,
    16,
    0,
    1.52,
    0,
    materials.lampShadeWarm
  );
  tripodLampSubgroup.add(tripodLeg1, tripodLeg2, tripodLeg3, tripodHub, tripodShade);
  plantsAndLampGroup.add(tripodLampSubgroup);

  // Helper to build a lush sculpted studio planter
  const buildStudioPlanter = (
    prefix: string,
    rx: number,
    rz: number,
    potMat: THREE.Material
  ): THREE.Group => {
    const p = new THREE.Group();
    p.name = prefix;
    p.position.set(rx, 0, rz);

    const potStand = createBox(
      `${prefix}_Birch_Cross_Stand_X`,
      0.34,
      0.14,
      0.04,
      0,
      0.07,
      0,
      materials.uiuxPaleBirch
    );
    const potStandZ = createBox(
      `${prefix}_Birch_Cross_Stand_Z`,
      0.04,
      0.14,
      0.34,
      0,
      0.07,
      0,
      materials.uiuxPaleBirch
    );
    const potBody = createCyl(
      `${prefix}_Ribbed_Ceramic_Pot`,
      0.21,
      0.16,
      0.34,
      14,
      0,
      0.26,
      0,
      potMat
    );
    const soil = createCyl(
      `${prefix}_Pot_Soil`,
      0.19,
      0.19,
      0.03,
      12,
      0,
      0.425,
      0,
      materials.espressoWood
    );
    const stemMain = createBox(
      `${prefix}_Stem_Main`,
      0.04,
      0.36,
      0.04,
      0,
      0.58,
      0,
      materials.woodTrim
    );
    const leafCluster1 = createBox(
      `${prefix}_Foliage_Cluster_Center`,
      0.34,
      0.28,
      0.34,
      0,
      0.78,
      0,
      materials.plantFoliageMid
    );
    const leafCluster2 = createBox(
      `${prefix}_Foliage_Cluster_West`,
      0.24,
      0.22,
      0.24,
      -0.14,
      0.68,
      0.08,
      materials.plantFoliageDark
    );
    const leafCluster3 = createBox(
      `${prefix}_Foliage_Cluster_East`,
      0.22,
      0.24,
      0.22,
      0.13,
      0.86,
      -0.08,
      materials.plantFoliageBright
    );
    p.add(potStand, potStandZ, potBody, soil, stemMain, leafCluster1, leafCluster2, leafCluster3);
    return p;
  };

  // Planter 1: North-East Studio Corner beside Window (room [7.05, 0, 7.05] -> local [0, 0, 0])
  const planterSE = buildStudioPlanter(
    'UIUX_Planter_NE_Sage_Monstera',
    0,
    0,
    materials.uiuxMutedSage
  );
  // Planter 2: North-West beside Material Shelf & Window (room [3.45, 0, 7.25] -> local [-3.60, 0, 0.20])
  const planterNW = buildStudioPlanter(
    'UIUX_Planter_NW_Coral_Ficus',
    -3.6,
    0.2,
    materials.uiuxPeachCoral
  );

  plantsAndLampGroup.add(planterSE, planterNW);
  tagCatalogGroup(plantsAndLampGroup, 'UIUX_Studio_Plants_And_Lamp', 'DECORATION');
  groups.DECORATION.add(plantsAndLampGroup);
  catalogNodeMap.set('UIUX_Studio_Plants_And_Lamp', plantsAndLampGroup);

  return {
    uiuxRoot,
    rootGroup: uiuxRoot,
    groups,
    northWallNodes,
    westWallNodes,
    eastWallNodes,
    southWallNodes,
    catalogNodeMap,
  };
}

/**
 * Builds non-exported editor/inspector visual helpers for the UI/UX Design Studio
 * (such as the 10 room-local anchor markers and South connector indicator).
 */
export function buildUIUXRoomHelpersGroup(
  anchors: Record<UIUXAnchorId, UIUXActivityAnchor> = DEFAULT_UIUX_ANCHORS
): {
  helpersRoot: THREE.Group;
  anchorMarkersGroup: THREE.Group;
  connectorGroup: THREE.Group;
  rebuildAnchors: (nextAnchors: Record<UIUXAnchorId, UIUXActivityAnchor>) => void;
} {
  const helpersRoot = new THREE.Group();
  helpersRoot.name = 'UIUX_ROOM_INSPECTOR_HELPERS';

  const anchorMarkersGroup = new THREE.Group();
  anchorMarkersGroup.name = 'UIUX_Anchor_Markers_Preview';
  helpersRoot.add(anchorMarkersGroup);

  const connectorGroup = new THREE.Group();
  connectorGroup.name = 'UIUX_Connector_Markers_Preview';
  helpersRoot.add(connectorGroup);

  // South Connector Marker at [4, 0, 0]
  const southArchGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.0, 2.3, 0.18));
  const southArchMat = new THREE.LineBasicMaterial({ color: 0x6b9e88 });
  const southArchWire = new THREE.LineSegments(southArchGeo, southArchMat);
  southArchWire.position.set(4.0, 1.15, 0.09);
  connectorGroup.add(southArchWire);

  const rebuildAnchors = (currentAnchors: Record<UIUXAnchorId, UIUXActivityAnchor>) => {
    while (anchorMarkersGroup.children.length > 0) {
      anchorMarkersGroup.remove(anchorMarkersGroup.children[0]);
    }

    const ringGeo = new THREE.RingGeometry(0.14, 0.2, 20);
    ringGeo.rotateX(-Math.PI / 2);
    const arrowGeo = new THREE.ConeGeometry(0.06, 0.18, 8);
    arrowGeo.rotateX(Math.PI / 2);

    Object.values(currentAnchors).forEach((a) => {
      const markerGrp = new THREE.Group();
      markerGrp.name = `Anchor_Marker_${a.id}`;
      markerGrp.position.set(a.position[0], 0.024, a.position[2]);
      markerGrp.rotation.y = a.facingRad;

      const colorHex = a.posture === 'seated' ? 0x9582a8 : 0x6b9e88;
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
      });

      const ring = new THREE.Mesh(ringGeo, mat);
      const arrow = new THREE.Mesh(arrowGeo, mat);
      arrow.position.set(0, 0.02, 0.22);
      markerGrp.add(ring, arrow);
      anchorMarkersGroup.add(markerGrp);
    });
  };

  rebuildAnchors(anchors);

  return {
    helpersRoot,
    anchorMarkersGroup,
    connectorGroup,
    rebuildAnchors,
  };
}

export function buildUIUXRoomAnchorHelpers(
  anchors: Record<UIUXAnchorId, UIUXActivityAnchor> = DEFAULT_UIUX_ANCHORS,
  selectedAnchorId: UIUXAnchorId | null = 'UIUX_DESK_WORK'
): {
  helpersRoot: THREE.Group;
  updateAnchors: (
    nextAnchors: Record<UIUXAnchorId, UIUXActivityAnchor>,
    nextSelected: UIUXAnchorId | null
  ) => void;
  updateAnchorsVisuals: (
    nextAnchors: Record<UIUXAnchorId, UIUXActivityAnchor>,
    nextSelected: UIUXAnchorId | null
  ) => void;
} {
  const { helpersRoot, anchorMarkersGroup, rebuildAnchors } = buildUIUXRoomHelpersGroup(anchors);

  const update = (
    nextAnchors: Record<UIUXAnchorId, UIUXActivityAnchor>,
    nextSelected: UIUXAnchorId | null
  ) => {
    rebuildAnchors(nextAnchors);
    if (nextSelected) {
      anchorMarkersGroup.traverse((child) => {
        if (child.name === `Anchor_Marker_${nextSelected}`) {
          child.scale.setScalar(1.3);
        }
      });
    }
  };

  update(anchors, selectedAnchorId);

  return {
    helpersRoot,
    updateAnchors: update,
    updateAnchorsVisuals: update,
  };
}
