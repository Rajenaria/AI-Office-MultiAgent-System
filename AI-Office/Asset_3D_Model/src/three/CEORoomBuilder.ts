import * as THREE from 'three';
import {
  CEOActivityAnchor,
  CEOAnchorId,
  CEO_FURNITURE_CATALOG,
  CEO_MODULE_CONSTANTS,
  DEFAULT_CEO_ANCHORS,
} from '../domain/ceoRoomSpec';
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

export interface BuiltCEORoomResult {
  ceoRoot: THREE.Group;
  groups: Record<(typeof CEO_MODULE_CONSTANTS.REQUIRED_GROUPS)[number], THREE.Group>;
  northWallNodes: THREE.Object3D[];
  westWallNodes: THREE.Object3D[];
  catalogNodeMap: Map<string, THREE.Object3D>;
}

/**
 * Builds the complete `ROOM_CEO_ROOT` (8×8 world units, local origin [0,0,0] at SW corner)
 * with zero coplanar Z-fighting surfaces and genuine multi-part 3D voxel geometry.
 */
export function buildCEORoomComplete(matLib: MaterialLibraryInstance): BuiltCEORoomResult {
  const { materials } = matLib;

  const ceoRoot = new THREE.Group();
  ceoRoot.name = CEO_MODULE_CONSTANTS.ROOT_NODE_NAME;
  ceoRoot.position.set(0, 0, 0);

  const groups = {} as Record<(typeof CEO_MODULE_CONSTANTS.REQUIRED_GROUPS)[number], THREE.Group>;
  for (const gName of CEO_MODULE_CONSTANTS.REQUIRED_GROUPS) {
    const g = new THREE.Group();
    g.name = gName;
    ceoRoot.add(g);
    groups[gName] = g;
  }

  const northWallNodes: THREE.Object3D[] = [];
  const westWallNodes: THREE.Object3D[] = [];
  const catalogNodeMap = new Map<string, THREE.Object3D>();

  // =========================================================================
  // 1. FLOOR & STRUCTURAL SUBBASE (X = 0..8, Z = 0..8, Y = -0.16..0.00)
  //    West plinth starts at X = 0.01 so when placed at [16, 0, 18] beside
  //    PM Room ([8, 0, 18]), zero faces are coplanar at global X = 16.00!
  // =========================================================================
  const floorOak = createBox(
    'CEO_Floor_Oak_Plank_Surface',
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
    'CEO_Floor_Structural_Subbase',
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
    'CEO_Structure_West_Plinth_Trim',
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
    'CEO_Structure_East_Plinth_Trim',
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
    'CEO_Structure_South_Plinth_Trim',
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
    'CEO_Structure_North_Plinth_Trim',
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
  // 2. NORTH FULL-HEIGHT WALL WITH RECESSED PANORAMIC WINDOWS (Z = 7.74..8.00)
  // =========================================================================
  const northWallAssy = new THREE.Group();
  northWallAssy.name = 'CEO_Wall_North_Assembly';

  // Exterior backing slab (Z = 7.90..8.00, X = 0.28..8.00, Y = 0.00..3.16)
  const northBacking = createBox(
    'CEO_Wall_North_Exterior_Shell',
    7.72,
    3.16,
    0.1,
    4.14,
    1.58,
    7.95,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  // Pier West (X = 0.28..3.15, Z = 7.76..7.90, Y = 0.00..3.16) behind Strategy Cabinet
  const northPierWest = createBox(
    'CEO_Wall_North_Pier_West',
    2.87,
    3.16,
    0.14,
    1.715,
    1.58,
    7.83,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  // Pier Center between Window 1 (X=3.15..5.85) and Window 2 (X=6.25..7.55)
  const northPierCenter = createBox(
    'CEO_Wall_North_Pier_Center',
    0.4,
    3.16,
    0.16,
    6.05,
    1.58,
    7.82,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  // Pier East Corner (X = 7.55..8.00, Z = 7.76..7.90, Y = 0.00..3.16)
  const northPierEast = createBox(
    'CEO_Wall_North_Pier_East',
    0.45,
    3.16,
    0.14,
    7.775,
    1.58,
    7.83,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  // Window 1 (Executive Panorama X = 3.15..5.85) spandrel & lintel
  const northWin1Spandrel = createBox(
    'CEO_Wall_North_Win1_Spandrel',
    2.7,
    0.84,
    0.12,
    4.5,
    0.42,
    7.84,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  const northWin1Lintel = createBox(
    'CEO_Wall_North_Win1_Lintel',
    2.7,
    0.48,
    0.14,
    4.5,
    2.92,
    7.83,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  // Window 2 (Study Window X = 6.25..7.55) spandrel & lintel
  const northWin2Spandrel = createBox(
    'CEO_Wall_North_Win2_Spandrel',
    1.3,
    0.84,
    0.12,
    6.9,
    0.42,
    7.84,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  const northWin2Lintel = createBox(
    'CEO_Wall_North_Win2_Lintel',
    1.3,
    0.48,
    0.14,
    6.9,
    2.92,
    7.83,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  // Top Cap (Y = 3.16..3.20, X = 0.04..8.00, Z = 7.74..8.00)
  const northTopCap = createBox(
    'CEO_Wall_North_Top_Cap',
    7.96,
    0.04,
    0.26,
    4.02,
    3.18,
    7.87,
    materials.wallCapDark,
    { category: 'STRUCTURE', wallSide: 'NORTH' }
  );
  // Baseboard along North wall (Z = 7.72..7.76, X = 0.30..7.76)
  const northBaseboard = createBox(
    'CEO_Trim_North_Baseboard',
    7.46,
    0.14,
    0.04,
    4.03,
    0.07,
    7.74,
    materials.woodTrim,
    { category: 'STRUCTURE', wallSide: 'NORTH' }
  );

  northWallAssy.add(
    northBacking,
    northPierWest,
    northPierCenter,
    northPierEast,
    northWin1Spandrel,
    northWin1Lintel,
    northWin2Spandrel,
    northWin2Lintel,
    northTopCap,
    northBaseboard
  );
  groups.WALLS.add(northWallAssy);
  northWallNodes.push(northWallAssy);

  // =========================================================================
  // 3. NORTH CASEMENT WINDOWS (Non-Overlapping Frame Bars & Split Mullions)
  // =========================================================================
  const northWindowsAssy = new THREE.Group();
  northWindowsAssy.name = 'CEO_Windows_North_Daylight_Assembly';

  const buildNorthCasementWindow = (
    namePrefix: string,
    xCenter: number,
    xSpan: number,
    yBottom: number,
    yTop: number,
    numPanes: 2 | 3
  ) => {
    const winGroup = new THREE.Group();
    winGroup.name = namePrefix;

    const sillTopY = yBottom + 0.05;
    const sill = createBox(
      `${namePrefix}_Wooden_Sill`,
      xSpan + 0.06,
      0.05,
      0.24,
      xCenter,
      yBottom + 0.025,
      7.78,
      materials.honeyOakLight,
      { category: 'WINDOWS' }
    );
    winGroup.add(sill);

    const frameH = yTop - sillTopY;
    const frameMidY = (sillTopY + yTop) / 2;
    const barThick = 0.07;

    const frameTop = createBox(
      `${namePrefix}_Frame_Top`,
      xSpan,
      barThick,
      0.09,
      xCenter,
      yTop - barThick / 2,
      7.84,
      materials.windowFrameCream,
      { category: 'WINDOWS' }
    );
    const frameBot = createBox(
      `${namePrefix}_Frame_Bottom`,
      xSpan,
      barThick,
      0.09,
      xCenter,
      sillTopY + barThick / 2,
      7.84,
      materials.windowFrameCream,
      { category: 'WINDOWS' }
    );
    const innerH = frameH - barThick * 2;
    const frameWest = createBox(
      `${namePrefix}_Frame_West`,
      barThick,
      innerH,
      0.09,
      xCenter - xSpan / 2 + barThick / 2,
      frameMidY,
      7.84,
      materials.windowFrameCream,
      { category: 'WINDOWS' }
    );
    const frameEast = createBox(
      `${namePrefix}_Frame_East`,
      barThick,
      innerH,
      0.09,
      xCenter + xSpan / 2 - barThick / 2,
      frameMidY,
      7.84,
      materials.windowFrameCream,
      { category: 'WINDOWS' }
    );
    winGroup.add(frameTop, frameBot, frameWest, frameEast);

    const innerXSpan = xSpan - barThick * 2;
    const transomY = yTop - frameH * 0.32;
    const transomBar = createBox(
      `${namePrefix}_Horizontal_Transom`,
      innerXSpan,
      0.055,
      0.076,
      xCenter,
      transomY,
      7.835,
      materials.windowFrameCream,
      { category: 'WINDOWS' }
    );
    winGroup.add(transomBar);

    const paneSpan = innerXSpan / numPanes;
    const upperBottom = transomY + 0.0275;
    const upperTop = yTop - barThick;
    const upperH = upperTop - upperBottom;
    const upperMidY = (upperBottom + upperTop) / 2;

    const lowerBottom = sillTopY + barThick;
    const lowerTop = transomY - 0.0275;
    const lowerH = lowerTop - lowerBottom;
    const lowerMidY = (lowerBottom + lowerTop) / 2;

    for (let i = 1; i < numPanes; i++) {
      const mx = xCenter - innerXSpan / 2 + i * paneSpan;
      const mulLower = createBox(
        `${namePrefix}_Vertical_Mullion_Lower_${i}`,
        0.055,
        lowerH,
        0.072,
        mx,
        lowerMidY,
        7.838,
        materials.windowFrameCream,
        { category: 'WINDOWS' }
      );
      const mulUpper = createBox(
        `${namePrefix}_Vertical_Mullion_Upper_${i}`,
        0.055,
        upperH,
        0.072,
        mx,
        upperMidY,
        7.838,
        materials.windowFrameCream,
        { category: 'WINDOWS' }
      );
      winGroup.add(mulLower, mulUpper);
    }

    const vistaBacking = createBox(
      `${namePrefix}_Vista_Backdrop`,
      innerXSpan,
      innerH,
      0.015,
      xCenter,
      frameMidY,
      7.885,
      materials.windowVista,
      { category: 'WINDOWS' }
    );
    const glassPane = createBox(
      `${namePrefix}_Glass_Pane`,
      innerXSpan,
      innerH,
      0.01,
      xCenter,
      frameMidY,
      7.79,
      materials.windowGlass,
      { category: 'WINDOWS' }
    );
    winGroup.add(vistaBacking, glassPane);

    return winGroup;
  };

  const winPanorama = buildNorthCasementWindow(
    'Window_North_Executive_Panorama',
    4.5,
    2.66,
    0.84,
    2.68,
    3
  );
  const winStudy = buildNorthCasementWindow(
    'Window_North_East_Study',
    6.9,
    1.26,
    0.84,
    2.68,
    2
  );
  northWindowsAssy.add(winPanorama, winStudy);
  groups.WINDOWS.add(northWindowsAssy);
  northWallNodes.push(northWindowsAssy);

  // =========================================================================
  // 4. WEST FULL-HEIGHT WALL WITH PM-ROOM CONNECTOR DOORWAY (X = 0.04..0.28)
  //    Doorway opening spans Z = 3.00..5.00, Y = 0.00..2.30 to match PM East!
  // =========================================================================
  const westWallAssy = new THREE.Group();
  westWallAssy.name = 'CEO_Wall_West_Assembly';

  // North segment of West wall (Z = 5.06..8.00, X = 0.04..0.28, Y = 0.00..3.16)
  const westWallNorthSeg = createBox(
    'CEO_Wall_West_North_Segment',
    0.24,
    3.16,
    2.94,
    0.16,
    1.58,
    6.53,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // South segment of West wall (Z = 0.20..2.94, X = 0.04..0.28, Y = 0.00..3.16)
  const westWallSouthSeg = createBox(
    'CEO_Wall_West_South_Segment',
    0.24,
    3.16,
    2.74,
    0.16,
    1.58,
    1.57,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // Upper doorway lintel header (Z = 2.94..5.06, X = 0.04..0.28, Y = 2.34..3.16)
  const westDoorLintel = createBox(
    'CEO_Wall_West_Connector_Lintel',
    0.24,
    0.82,
    2.12,
    0.16,
    2.75,
    4.0,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // West Top Cap (X = 0.04..0.30, Z = 0.00..7.74, Y = 3.16..3.20)
  const westTopCap = createBox(
    'CEO_Wall_West_Top_Cap',
    0.26,
    0.04,
    7.74,
    0.17,
    3.18,
    3.87,
    materials.wallCapDark,
    { category: 'STRUCTURE', wallSide: 'WEST' }
  );
  // West Baseboard North & South of doorway (X = 0.28..0.315)
  const westBaseNorth = createBox(
    'CEO_Trim_West_Baseboard_North',
    0.035,
    0.14,
    2.64,
    0.2975,
    0.07,
    6.4,
    materials.woodTrim,
    { category: 'STRUCTURE', wallSide: 'WEST' }
  );
  const westBaseSouth = createBox(
    'CEO_Trim_West_Baseboard_South',
    0.035,
    0.14,
    2.68,
    0.2975,
    0.07,
    1.58,
    materials.woodTrim,
    { category: 'STRUCTURE', wallSide: 'WEST' }
  );

  westWallAssy.add(
    westWallNorthSeg,
    westWallSouthSeg,
    westDoorLintel,
    westTopCap,
    westBaseNorth,
    westBaseSouth
  );
  groups.WALLS.add(westWallAssy);
  westWallNodes.push(westWallAssy);

  // =========================================================================
  // 5. EAST & SOUTH HYBRID LOW CUTAWAY WALLS (Y = 0.00..0.38)
  // =========================================================================
  const wallSegH = 0.34;
  const capH = 0.04;
  const capY = wallSegH + capH / 2;

  const eastCutawayWall = createBox(
    'CEO_Wall_East_Cutaway_Segment',
    0.2,
    wallSegH,
    7.54,
    7.9,
    wallSegH / 2,
    3.97,
    materials.warmWall,
    { category: 'WALLS' }
  );
  const eastCutawayCap = createBox(
    'CEO_Wall_East_Cutaway_Cap',
    0.22,
    capH,
    7.54,
    7.89,
    capY,
    3.97,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  groups.WALLS.add(eastCutawayWall);
  groups.STRUCTURE.add(eastCutawayCap);

  // South Cutaway West (X = 0.28..2.94) & East (X = 5.06..8.00) around South Connector [4, 0, 0]
  const southLowWest = createBox(
    'CEO_Wall_South_Cutaway_West_Segment',
    2.66,
    wallSegH,
    0.2,
    1.61,
    wallSegH / 2,
    0.1,
    materials.warmWall,
    { category: 'WALLS' }
  );
  const southLowWestCap = createBox(
    'CEO_Wall_South_Cutaway_West_Cap',
    2.66,
    capH,
    0.22,
    1.61,
    capY,
    0.11,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  const southLowEast = createBox(
    'CEO_Wall_South_Cutaway_East_Segment',
    2.94,
    wallSegH,
    0.2,
    6.53,
    wallSegH / 2,
    0.1,
    materials.warmWall,
    { category: 'WALLS' }
  );
  const southLowEastCap = createBox(
    'CEO_Wall_South_Cutaway_East_Cap',
    2.94,
    capH,
    0.22,
    6.53,
    capY,
    0.11,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  groups.WALLS.add(southLowWest, southLowEast);
  groups.STRUCTURE.add(southLowWestCap, southLowEastCap);

  // =========================================================================
  // 6. MODULAR CONNECTORS (CEO_CONNECTOR_WEST [0,0,4] & CEO_CONNECTOR_SOUTH [4,0,0])
  // =========================================================================
  const connWestGroup = new THREE.Group();
  connWestGroup.name = 'CEO_CONNECTOR_WEST';
  connWestGroup.userData = {
    connectorId: 'CEO_CONNECTOR_WEST',
    position: [0, 0, 4],
    outwardDirection: '-X',
    width: 2.0,
    category: 'CONNECTORS',
  };

  const westThreshold = createBox(
    'CEO_Connector_West_Threshold_Sill',
    0.24,
    0.03,
    1.88,
    0.16,
    0.015,
    4.0,
    materials.connectorFrame,
    { category: 'CONNECTORS' }
  );
  const westJambNorth = createBox(
    'CEO_Connector_West_Jamb_North',
    0.26,
    2.32,
    0.12,
    0.16,
    1.16,
    5.0,
    materials.darkWalnutWood,
    { category: 'CONNECTORS' }
  );
  const westJambSouth = createBox(
    'CEO_Connector_West_Jamb_South',
    0.26,
    2.32,
    0.12,
    0.16,
    1.16,
    3.0,
    materials.darkWalnutWood,
    { category: 'CONNECTORS' }
  );
  const westHeaderArch = createBox(
    'CEO_Connector_West_Header_Trim',
    0.28,
    0.08,
    2.12,
    0.16,
    2.3,
    4.0,
    materials.darkWalnutWood,
    { category: 'CONNECTORS' }
  );
  const westRemovableDoorway = createBox(
    'CEO_Connector_West_Removable_Doorway',
    0.12,
    0.16,
    1.88,
    0.16,
    0.11,
    4.0,
    materials.woodTrim,
    { category: 'CONNECTORS', removableConnectorSection: true }
  );
  connWestGroup.add(
    westThreshold,
    westJambNorth,
    westJambSouth,
    westHeaderArch,
    westRemovableDoorway
  );
  groups.CONNECTORS.add(connWestGroup);

  const connSouthGroup = new THREE.Group();
  connSouthGroup.name = 'CEO_CONNECTOR_SOUTH';
  connSouthGroup.userData = {
    connectorId: 'CEO_CONNECTOR_SOUTH',
    position: [4, 0, 0],
    outwardDirection: '-Z',
    width: 2.0,
    category: 'CONNECTORS',
  };

  const southThreshold = createBox(
    'CEO_Connector_South_Threshold_Sill',
    1.88,
    0.03,
    0.22,
    4.0,
    0.015,
    0.11,
    materials.connectorFrame,
    { category: 'CONNECTORS' }
  );
  const southMatOuter = createBox(
    'CEO_Connector_South_Welcome_Mat',
    1.48,
    0.02,
    0.68,
    4.0,
    0.01,
    0.58,
    materials.wallCapDark,
    { category: 'CONNECTORS' }
  );
  const southMatInner = createBox(
    'CEO_Connector_South_Welcome_Mat_Inset',
    1.32,
    0.01,
    0.54,
    4.0,
    0.025,
    0.58,
    materials.ceoForestLeather,
    { category: 'CONNECTORS' }
  );
  const southJambWest = createBox(
    'CEO_Connector_South_Jamb_West',
    0.12,
    0.46,
    0.24,
    3.0,
    0.23,
    0.12,
    materials.darkWalnutWood,
    { category: 'CONNECTORS' }
  );
  const southJambEast = createBox(
    'CEO_Connector_South_Jamb_East',
    0.12,
    0.46,
    0.24,
    5.0,
    0.23,
    0.12,
    materials.darkWalnutWood,
    { category: 'CONNECTORS' }
  );
  const southRemovableThreshold = createBox(
    'CEO_Connector_South_Removable_Threshold',
    1.88,
    0.16,
    0.12,
    4.0,
    0.11,
    0.11,
    materials.woodTrim,
    { category: 'CONNECTORS', removableConnectorSection: true }
  );
  connSouthGroup.add(
    southThreshold,
    southMatOuter,
    southMatInner,
    southJambWest,
    southJambEast,
    southRemovableThreshold
  );
  groups.CONNECTORS.add(connSouthGroup);

  // =========================================================================
  // 7. ZONE A — EXECUTIVE DESK & HIGH-BACK EXECUTIVE CHAIR
  //    Desk at [4.5, 0, 5.75], Chair at [4.5, 0, 6.68] facing South
  // =========================================================================
  const deskGroup = new THREE.Group();
  deskGroup.name = 'CEO_Executive_Desk';
  deskGroup.position.set(4.5, 0, 5.75);

  const deskContactShadow = createBox(
    'Contact_Shadow_CEO_Desk',
    2.24,
    0.004,
    1.08,
    0,
    0.002,
    0,
    materials.contactShadow
  );
  // Layered walnut desktop slab (Y = 0.72..0.78)
  const deskTopLower = createBox(
    'CEO_Desk_Top_Walnut_Subslab',
    2.18,
    0.03,
    1.02,
    0,
    0.735,
    0,
    materials.espressoWood
  );
  const deskTopMain = createBox(
    'CEO_Desk_Top_Walnut_Surface',
    2.22,
    0.03,
    1.05,
    0,
    0.765,
    0,
    materials.darkWalnutWood
  );
  // Forest-green leather desk blotter pad (Y = 0.78..0.792)
  const deskBlotter = createBox(
    'CEO_Desk_Leather_Blotter_Pad',
    1.08,
    0.012,
    0.58,
    0,
    0.786,
    0.12,
    materials.ceoForestLeather
  );
  const deskBlotterBrassTrimL = createBox(
    'CEO_Desk_Blotter_Brass_Rail_L',
    0.03,
    0.015,
    0.58,
    -0.555,
    0.7875,
    0.12,
    materials.brushedBrass
  );
  const deskBlotterBrassTrimR = createBox(
    'CEO_Desk_Blotter_Brass_Rail_R',
    0.03,
    0.015,
    0.58,
    0.555,
    0.7875,
    0.12,
    materials.brushedBrass
  );

  // Left & Right Drawer Pedestals (X = -0.82 and +0.82, Y = 0.04..0.72, Z = -0.46..+0.46)
  const pedL = createBox(
    'CEO_Desk_Pedestal_Left',
    0.52,
    0.68,
    0.92,
    -0.82,
    0.38,
    0,
    materials.darkWalnutWood
  );
  const pedR = createBox(
    'CEO_Desk_Pedestal_Right',
    0.52,
    0.68,
    0.92,
    0.82,
    0.38,
    0,
    materials.darkWalnutWood
  );
  const pedPlinthL = createBox(
    'CEO_Desk_Plinth_Left',
    0.5,
    0.04,
    0.88,
    -0.82,
    0.02,
    0,
    materials.brushedBrass
  );
  const pedPlinthR = createBox(
    'CEO_Desk_Plinth_Right',
    0.5,
    0.04,
    0.88,
    0.82,
    0.02,
    0,
    materials.brushedBrass
  );
  deskGroup.add(
    deskContactShadow,
    deskTopLower,
    deskTopMain,
    deskBlotter,
    deskBlotterBrassTrimL,
    deskBlotterBrassTrimR,
    pedL,
    pedR,
    pedPlinthL,
    pedPlinthR
  );

  // 3 drawers per pedestal on the North (chair-facing, +Z) side with brass handles
  const drawerYPositions = [0.18, 0.39, 0.58];
  for (const sideX of [-0.82, 0.82]) {
    const tag = sideX < 0 ? 'L' : 'R';
    drawerYPositions.forEach((dy, idx) => {
      const dFront = createBox(
        `CEO_Desk_Drawer_${tag}_${idx + 1}`,
        0.46,
        0.16,
        0.02,
        sideX,
        dy,
        0.47,
        materials.warmOakWood
      );
      const dHandle = createBox(
        `CEO_Desk_Drawer_Handle_${tag}_${idx + 1}`,
        0.14,
        0.025,
        0.02,
        sideX,
        dy,
        0.49,
        materials.brushedBrass
      );
      deskGroup.add(dFront, dHandle);
    });
  }

  // Front architectural modesty panel (facing South, Z = -0.44, X = -0.56..+0.56, Y = 0.08..0.72)
  const modestyPanel = createBox(
    'CEO_Desk_Front_Modesty_Panel',
    1.12,
    0.64,
    0.04,
    0,
    0.4,
    -0.42,
    materials.espressoWood
  );
  const modestyBrassBar = createBox(
    'CEO_Desk_Front_Brass_Accent_Bar',
    0.96,
    0.04,
    0.015,
    0,
    0.42,
    -0.448,
    materials.brushedBrass
  );
  deskGroup.add(modestyPanel, modestyBrassBar);

  // Desk Accessories: Brass Banker's Lamp (East side of desk X = +0.82, Z = -0.18)
  const lampBase = createBox(
    'CEO_Banker_Lamp_Base',
    0.2,
    0.03,
    0.16,
    0.84,
    0.795,
    -0.2,
    materials.brushedBrass
  );
  const lampStem = createBox(
    'CEO_Banker_Lamp_Stem',
    0.035,
    0.34,
    0.035,
    0.84,
    0.98,
    -0.24,
    materials.brushedBrass
  );
  const lampShadeEmerald = createBox(
    'CEO_Banker_Lamp_Emerald_Hood',
    0.26,
    0.09,
    0.16,
    0.84,
    1.15,
    -0.16,
    materials.ceoForestLeather
  );
  const lampGlowCore = createBox(
    'CEO_Banker_Lamp_Warm_Bulb',
    0.2,
    0.03,
    0.11,
    0.84,
    1.1,
    -0.16,
    materials.lampShadeWarm
  );
  // Executive Dossier & Fountain Pen Stand + Porcelain Espresso Cup (West side of desk X = -0.82)
  const dossierCover = createBox(
    'CEO_Desk_Executive_Dossier_Cover',
    0.28,
    0.02,
    0.36,
    -0.78,
    0.79,
    0.16,
    materials.espressoWood
  );
  const dossierPages = createBox(
    'CEO_Desk_Executive_Dossier_Pages',
    0.25,
    0.018,
    0.33,
    -0.78,
    0.809,
    0.16,
    materials.paperCream
  );
  const penHolderBase = createBox(
    'CEO_Desk_Brass_Pen_Stand',
    0.12,
    0.025,
    0.08,
    -0.52,
    0.792,
    -0.22,
    materials.brushedBrass
  );
  const fountainPen = createCyl(
    'CEO_Desk_Fountain_Pen',
    0.008,
    0.008,
    0.14,
    8,
    -0.52,
    0.86,
    -0.22,
    materials.darkMetal
  );
  fountainPen.rotation.z = -0.32;
  const espressoSaucer = createCyl(
    'CEO_Desk_Espresso_Saucer',
    0.065,
    0.05,
    0.015,
    12,
    0.58,
    0.788,
    0.24,
    materials.ceramicCream
  );
  const espressoCup = createCyl(
    'CEO_Desk_Espresso_Cup',
    0.042,
    0.034,
    0.065,
    12,
    0.58,
    0.828,
    0.24,
    materials.ceramicCream
  );

  deskGroup.add(
    lampBase,
    lampStem,
    lampShadeEmerald,
    lampGlowCore,
    dossierCover,
    dossierPages,
    penHolderBase,
    fountainPen,
    espressoSaucer,
    espressoCup
  );
  tagCatalogGroup(deskGroup, 'CEO_Executive_Desk', 'FURNITURE');
  groups.FURNITURE.add(deskGroup);
  catalogNodeMap.set('CEO_Executive_Desk', deskGroup);

  // Executive Chair ([4.5, 0, 6.68], facing South)
  const chairGroup = new THREE.Group();
  chairGroup.name = 'CEO_Executive_Chair';
  chairGroup.position.set(4.5, 0, 6.68);

  const chairShadow = createCyl(
    'Contact_Shadow_CEO_Chair',
    0.36,
    0.36,
    0.004,
    16,
    0,
    0.002,
    0,
    materials.contactShadow
  );
  const chairColumn = createCyl(
    'CEO_Chair_Pneumatic_Column',
    0.045,
    0.055,
    0.42,
    10,
    0,
    0.24,
    0,
    materials.darkMetal
  );
  chairGroup.add(chairShadow, chairColumn);

  for (let i = 0; i < 5; i++) {
    const ang = (i * Math.PI * 2) / 5;
    const leg = createBox(
      `CEO_Chair_Star_Leg_${i + 1}`,
      0.05,
      0.035,
      0.32,
      Math.sin(ang) * 0.15,
      0.06,
      Math.cos(ang) * 0.15,
      materials.brushedBrass
    );
    leg.rotation.y = ang;
    const caster = createCyl(
      `CEO_Chair_Caster_${i + 1}`,
      0.025,
      0.025,
      0.04,
      8,
      Math.sin(ang) * 0.28,
      0.02,
      Math.cos(ang) * 0.28,
      materials.darkMetal
    );
    chairGroup.add(leg, caster);
  }

  const chairSeat = createBox(
    'CEO_Chair_Tufted_Seat',
    0.58,
    0.1,
    0.56,
    0,
    0.48,
    0,
    materials.ceoForestLeather
  );
  const chairBackrest = createBox(
    'CEO_Chair_High_Backrest',
    0.54,
    0.66,
    0.1,
    0,
    0.84,
    0.24,
    materials.ceoForestLeather
  );
  const chairHeadrest = createBox(
    'CEO_Chair_Headrest_Cushion',
    0.42,
    0.16,
    0.12,
    0,
    1.12,
    0.22,
    materials.executiveLeather
  );
  const chairArmL = createBox(
    'CEO_Chair_Walnut_Armrest_L',
    0.07,
    0.04,
    0.42,
    -0.31,
    0.66,
    0.02,
    materials.darkWalnutWood
  );
  const chairArmR = createBox(
    'CEO_Chair_Walnut_Armrest_R',
    0.07,
    0.04,
    0.42,
    0.31,
    0.66,
    0.02,
    materials.darkWalnutWood
  );
  const chairArmPostL = createBox(
    'CEO_Chair_Arm_Support_L',
    0.04,
    0.16,
    0.05,
    -0.31,
    0.56,
    0.06,
    materials.brushedBrass
  );
  const chairArmPostR = createBox(
    'CEO_Chair_Arm_Support_R',
    0.04,
    0.16,
    0.05,
    0.31,
    0.56,
    0.06,
    materials.brushedBrass
  );
  chairGroup.add(
    chairSeat,
    chairBackrest,
    chairHeadrest,
    chairArmL,
    chairArmR,
    chairArmPostL,
    chairArmPostR
  );
  tagCatalogGroup(chairGroup, 'CEO_Executive_Chair', 'FURNITURE');
  groups.FURNITURE.add(chairGroup);
  catalogNodeMap.set('CEO_Executive_Chair', chairGroup);

  // =========================================================================
  // 8. ZONE B — DUAL-DISPLAY EXECUTIVE COMPUTER STATION ([4.5, 0.78, 5.65])
  //    Seated CEO Chair is at [4.5, 0, 6.68] (local +Z = +1.03 from station).
  //    Both monitors sit side-by-side at equal height (Y = 0.31), resting on a
  //    dual-arm desk stand, with BOTH display surfaces on their +Z front faces
  //    angled slightly inward toward the seated CEO chair and opaque VESA backs on -Z.
  // =========================================================================
  const compGroup = new THREE.Group();
  compGroup.name = 'CEO_Computer_Station';
  compGroup.position.set(4.5, 0.78, 5.65);

  const standBase = createBox(
    'CEO_Comp_Dual_Stand_Base',
    0.52,
    0.022,
    0.22,
    0,
    0.011,
    -0.18,
    materials.brushedBrass
  );
  const standPillarL = createBox(
    'CEO_Comp_Stand_Pillar_Left',
    0.048,
    0.28,
    0.045,
    -0.31,
    0.16,
    -0.2,
    materials.darkMetal
  );
  const standPillarR = createBox(
    'CEO_Comp_Stand_Pillar_Right',
    0.048,
    0.28,
    0.045,
    0.31,
    0.16,
    -0.2,
    materials.darkMetal
  );
  const standCrossbar = createBox(
    'CEO_Comp_Stand_Crossbar',
    0.68,
    0.032,
    0.032,
    0,
    0.29,
    -0.2,
    materials.darkMetal
  );
  const cableGrommet = createCyl(
    'CEO_Comp_Cable_Grommet',
    0.04,
    0.04,
    0.016,
    12,
    0,
    0.008,
    -0.31,
    materials.ceoCharcoalCase
  );

  // Primary Widescreen Monitor (Right-hand side from seated CEO / West side X = -0.31)
  // Local +Z faces the seated CEO chair at [4.5, 0, 6.68]; rotation.y = +0.12 tilts inward toward chair.
  const mainMonitorGroup = new THREE.Group();
  mainMonitorGroup.name = 'CEO_Monitor_Primary_Group';
  mainMonitorGroup.position.set(-0.31, 0.31, -0.14);
  mainMonitorGroup.rotation.y = 0.12;

  const mainBezel = createBox(
    'CEO_Monitor_Primary_Bezel',
    0.58,
    0.36,
    0.036,
    0,
    0,
    0,
    materials.ceoCharcoalCase
  );
  const mainRearVesa = createBox(
    'CEO_Monitor_Primary_Rear_Vesa',
    0.16,
    0.12,
    0.022,
    0,
    -0.01,
    -0.029,
    materials.darkMetal
  );
  const mainScreen = createBox(
    'CEO_Monitor_Primary_Screen_DemoData',
    0.53,
    0.31,
    0.006,
    0,
    0,
    0.02,
    materials.ceoMonitorPrimary
  );
  mainMonitorGroup.add(mainBezel, mainRearVesa, mainScreen);

  // Secondary Executive Dashboard Monitor (Left-hand side from seated CEO / East side X = +0.31)
  // Matching height Y = 0.31; local +Z faces the seated CEO chair; rotation.y = -0.12 tilts inward toward chair.
  const secMonitorGroup = new THREE.Group();
  secMonitorGroup.name = 'CEO_Monitor_Secondary_Group';
  secMonitorGroup.position.set(0.31, 0.31, -0.14);
  secMonitorGroup.rotation.y = -0.12;

  const secBezel = createBox(
    'CEO_Monitor_Secondary_Bezel',
    0.58,
    0.36,
    0.036,
    0,
    0,
    0,
    materials.ceoCharcoalCase
  );
  const secRearVesa = createBox(
    'CEO_Monitor_Secondary_Rear_Vesa',
    0.16,
    0.12,
    0.022,
    0,
    -0.01,
    -0.029,
    materials.darkMetal
  );
  const secScreen = createBox(
    'CEO_Monitor_Secondary_Screen_DemoData',
    0.53,
    0.31,
    0.006,
    0,
    0,
    0.02,
    materials.ceoMonitorSecondary
  );
  secMonitorGroup.add(secBezel, secRearVesa, secScreen);

  // Mechanical Keyboard & Mouse on Blotter (on +Z side closest to seated CEO)
  const keyboardChassis = createBox(
    'CEO_Comp_Mechanical_Keyboard',
    0.38,
    0.022,
    0.14,
    -0.08,
    0.023,
    0.16,
    materials.ceoCharcoalCase
  );
  const keyboardKeycaps = createBox(
    'CEO_Comp_Keyboard_Keycaps',
    0.34,
    0.01,
    0.1,
    -0.08,
    0.038,
    0.16,
    materials.paperCream
  );
  const mouseBody = createBox(
    'CEO_Comp_Wireless_Mouse',
    0.065,
    0.024,
    0.1,
    0.22,
    0.024,
    0.16,
    materials.ceoCharcoalCase
  );

  compGroup.add(
    standBase,
    standPillarL,
    standPillarR,
    standCrossbar,
    cableGrommet,
    mainMonitorGroup,
    secMonitorGroup,
    keyboardChassis,
    keyboardKeycaps,
    mouseBody
  );
  tagCatalogGroup(compGroup, 'CEO_Computer_Station', 'PROPS');
  groups.PROPS.add(compGroup);
  catalogNodeMap.set('CEO_Computer_Station', compGroup);

  // =========================================================================
  // 9. ZONE C — EXECUTIVE BRAIN CONSOLE ([0.58, 0, 1.68] along South-West Wall)
  //    7-Panel Voxel Strategic Command Console facing East (+X toward camera)
  // =========================================================================
  const brainGroup = new THREE.Group();
  brainGroup.name = 'CEO_Executive_Brain_Console';
  brainGroup.position.set(0.58, 0, 1.68);
  brainGroup.rotation.y = Math.PI;

  const brainShadow = createBox(
    'Contact_Shadow_CEO_Brain_Console',
    0.78,
    0.004,
    2.58,
    0,
    0.002,
    0,
    materials.contactShadow
  );
  // Lower Walnut Credenza Base (Y = 0.00..0.78, X = -0.34..+0.34, Z = -1.24..+1.24)
  const brainPlinth = createBox(
    'CEO_Brain_Console_Brass_Plinth',
    0.64,
    0.05,
    2.44,
    0.02,
    0.025,
    0,
    materials.brushedBrass
  );
  const brainCredenzaBody = createBox(
    'CEO_Brain_Console_Credenza_Body',
    0.66,
    0.68,
    2.48,
    0.02,
    0.39,
    0,
    materials.darkWalnutWood
  );
  const brainCredenzaTop = createBox(
    'CEO_Brain_Console_Countertop',
    0.72,
    0.05,
    2.54,
    0,
    0.755,
    0,
    materials.espressoWood
  );
  brainGroup.add(brainShadow, brainPlinth, brainCredenzaBody, brainCredenzaTop);

  // 4 Credenza Cabinet Doors facing West (-X, X = -0.32) with brass pulls
  const doorZOffsets = [-0.9, -0.3, 0.3, 0.9];
  doorZOffsets.forEach((dz, idx) => {
    const door = createBox(
      `CEO_Brain_Console_Cabinet_Door_${idx + 1}`,
      0.02,
      0.56,
      0.54,
      -0.32,
      0.39,
      dz,
      materials.warmOakWood
    );
    const pull = createBox(
      `CEO_Brain_Console_Door_Pull_${idx + 1}`,
      0.02,
      0.14,
      0.025,
      -0.34,
      0.44,
      dz + (idx % 2 === 0 ? 0.18 : -0.18),
      materials.brushedBrass
    );
    brainGroup.add(door, pull);
  });

  // Console Instrument Deck on Countertop (Y = 0.78..0.86)
  const controlDeck = createBox(
    'CEO_Brain_Console_Control_Deck',
    0.36,
    0.06,
    1.85,
    -0.12,
    0.81,
    0,
    materials.ceoCharcoalCase
  );
  const statusStripTeal = createBox(
    'CEO_Brain_Console_Deck_LED_Teal',
    0.08,
    0.015,
    0.55,
    -0.2,
    0.848,
    -0.52,
    materials.noteSky
  );
  const statusStripAmber = createBox(
    'CEO_Brain_Console_Deck_LED_Amber',
    0.08,
    0.015,
    0.55,
    -0.2,
    0.848,
    0.12,
    materials.noteAmber
  );
  const statusStripSage = createBox(
    'CEO_Brain_Console_Deck_LED_Sage',
    0.08,
    0.015,
    0.42,
    -0.2,
    0.848,
    0.68,
    materials.noteSage
  );
  brainGroup.add(controlDeck, statusStripTeal, statusStripAmber, statusStripSage);

  // Upper Strategic Display Superstructure (Y = 0.78..2.36)
  const consoleBackFrame = createBox(
    'CEO_Brain_Console_Upper_Walnut_Frame',
    0.22,
    1.52,
    2.48,
    0.22,
    1.54,
    0,
    materials.darkWalnutWood
  );
  const consoleCharcoalHousing = createBox(
    'CEO_Brain_Console_Display_Housing',
    0.12,
    1.36,
    2.32,
    0.05,
    1.54,
    0,
    materials.ceoCharcoalCase
  );
  // Crisp Pixel-Art 7-Panel Strategic Display Screen facing West (-X at X = -0.02)
  const consoleScreenMesh = createBox(
    'CEO_Brain_Console_7Panel_Screen_DemoData',
    0.02,
    1.24,
    2.18,
    -0.02,
    1.54,
    0,
    materials.ceoBrainScreen
  );
  // Top Brushed Brass Header Cornice
  const consoleTopCornice = createBox(
    'CEO_Brain_Console_Brass_Header_Cornice',
    0.32,
    0.08,
    2.54,
    0.16,
    2.34,
    0,
    materials.brushedBrass
  );
  brainGroup.add(consoleBackFrame, consoleCharcoalHousing, consoleScreenMesh, consoleTopCornice);

  tagCatalogGroup(brainGroup, 'CEO_Executive_Brain_Console', 'FURNITURE');
  groups.FURNITURE.add(brainGroup);
  catalogNodeMap.set('CEO_Executive_Brain_Console', brainGroup);

  // =========================================================================
  // 10. ZONE D — REPORT REVIEW AREA ([5.65, 0, 2.55])
  //     Discussion table, 2 guest chairs, document trays, report folders
  // =========================================================================
  const reviewGroup = new THREE.Group();
  reviewGroup.name = 'CEO_Report_Review_Area';
  reviewGroup.position.set(5.65, 0, 2.55);

  const revShadow = createBox(
    'Contact_Shadow_CEO_Review_Table',
    1.36,
    0.004,
    1.16,
    0,
    0.002,
    0,
    materials.contactShadow
  );
  const revTableTop = createBox(
    'CEO_Review_Table_Walnut_Top',
    1.28,
    0.05,
    1.08,
    0,
    0.725,
    0,
    materials.darkWalnutWood
  );
  const revTableApron = createBox(
    'CEO_Review_Table_Apron',
    1.14,
    0.06,
    0.94,
    0,
    0.67,
    0,
    materials.espressoWood
  );
  reviewGroup.add(revShadow, revTableTop, revTableApron);

  const legOffsets: Array<[number, number]> = [
    [-0.54, -0.44],
    [0.54, -0.44],
    [-0.54, 0.44],
    [0.54, 0.44],
  ];
  legOffsets.forEach(([lx, lz], i) => {
    const leg = createBox(
      `CEO_Review_Table_Leg_${i + 1}`,
      0.06,
      0.64,
      0.06,
      lx,
      0.38,
      lz,
      materials.darkWalnutWood
    );
    const foot = createBox(
      `CEO_Review_Table_Brass_Foot_${i + 1}`,
      0.068,
      0.06,
      0.068,
      lx,
      0.03,
      lz,
      materials.brushedBrass
    );
    reviewGroup.add(leg, foot);
  });

  // Layered Document Tray & PM Report Folders on Review Table (Y = 0.75..0.85)
  const docTrayLow = createBox(
    'CEO_Review_Document_Tray_Inbox',
    0.34,
    0.03,
    0.26,
    -0.28,
    0.765,
    -0.18,
    materials.warmOakWood
  );
  const docStackLow = createBox(
    'CEO_Review_Inbox_Paper_Stack',
    0.28,
    0.025,
    0.22,
    -0.28,
    0.792,
    -0.18,
    materials.paperCream
  );
  const reportFolderPM1 = createBox(
    'CEO_Review_PM_Report_Folder_1',
    0.26,
    0.016,
    0.32,
    0.18,
    0.758,
    0.12,
    materials.noteCoral
  );
  const reportFolderPM2 = createBox(
    'CEO_Review_PM_Report_Folder_2',
    0.26,
    0.016,
    0.32,
    0.22,
    0.776,
    0.16,
    materials.noteAmber
  );
  const tabletStand = createBox(
    'CEO_Review_Briefing_Tablet',
    0.22,
    0.018,
    0.28,
    0.18,
    0.759,
    -0.24,
    materials.ceoCharcoalCase
  );
  reviewGroup.add(docTrayLow, docStackLow, reportFolderPM1, reportFolderPM2, tabletStand);

  // 2 Upholstered Emerald Guest Chairs (North & South of the Review Table)
  const buildGuestChair = (namePrefix: string, cx: number, cz: number, rotY: number) => {
    const ch = new THREE.Group();
    ch.name = namePrefix;
    ch.position.set(cx, 0, cz);
    ch.rotation.y = rotY;

    const seat = createBox(
      `${namePrefix}_Seat`,
      0.48,
      0.07,
      0.46,
      0,
      0.44,
      0,
      materials.ceoEmeraldFabric
    );
    const back = createBox(
      `${namePrefix}_Backrest`,
      0.46,
      0.42,
      0.07,
      0,
      0.68,
      -0.2,
      materials.ceoEmeraldFabric
    );
    ch.add(seat, back);
    const cLegs: Array<[number, number]> = [
      [-0.2, -0.19],
      [0.2, -0.19],
      [-0.2, 0.19],
      [0.2, 0.19],
    ];
    cLegs.forEach(([gx, gz], idx) => {
      ch.add(
        createBox(
          `${namePrefix}_Leg_${idx + 1}`,
          0.045,
          0.4,
          0.045,
          gx,
          0.2,
          gz,
          materials.darkWalnutWood
        )
      );
    });
    return ch;
  };

  const guestChairNorth = buildGuestChair('CEO_Review_Guest_Chair_North', -0.08, 0.82, Math.PI);
  const guestChairSouth = buildGuestChair('CEO_Review_Guest_Chair_South', -0.08, -0.82, 0);

  // Companion Folder Credenza Shelf along North wall section beside bookcase (relative to reviewGroup at [-2.35, 0, 4.82])
  const folderShelf = createBox(
    'CEO_Review_Folder_Credenza_Shelf',
    0.96,
    0.82,
    0.44,
    -2.35,
    0.41,
    4.82,
    materials.warmOakWood
  );
  const folderShelfTop = createBox(
    'CEO_Review_Folder_Credenza_Top',
    1.0,
    0.04,
    0.48,
    -2.35,
    0.84,
    4.82,
    materials.darkWalnutWood
  );
  reviewGroup.add(guestChairNorth, guestChairSouth, folderShelf, folderShelfTop);

  tagCatalogGroup(reviewGroup, 'CEO_Report_Review_Area', 'FURNITURE');
  groups.FURNITURE.add(reviewGroup);
  catalogNodeMap.set('CEO_Report_Review_Area', reviewGroup);

  // =========================================================================
  // 11. ZONE E — STRATEGY BOOKCASE & ARCHIVE CABINET ([1.75, 0, 7.38])
  //     Non-overlapping side panels, inset shelves, books, binders & trophy
  // =========================================================================
  const cabGroup = new THREE.Group();
  cabGroup.name = 'CEO_Strategy_Cabinet';
  cabGroup.position.set(1.75, 0, 7.38);

  const cabShadow = createBox(
    'Contact_Shadow_CEO_Strategy_Cabinet',
    1.78,
    0.004,
    0.62,
    0,
    0.002,
    0,
    materials.contactShadow
  );
  // Left & Right Full-Height Side Panels (X = -0.82 and +0.82, width 0.08 -> inner span X = -0.78..+0.78 = 1.56)
  const cabSideL = createBox(
    'CEO_Cabinet_Side_Left',
    0.08,
    2.48,
    0.54,
    -0.82,
    1.24,
    0,
    materials.darkWalnutWood
  );
  const cabSideR = createBox(
    'CEO_Cabinet_Side_Right',
    0.08,
    2.48,
    0.54,
    0.82,
    1.24,
    0,
    materials.darkWalnutWood
  );
  // Back panel strictly inset between Side_Left & Side_Right (X = -0.78..+0.78, Z = 0.24..0.27)
  const cabBack = createBox(
    'CEO_Cabinet_Back_Panel',
    1.56,
    2.44,
    0.03,
    0,
    1.24,
    0.255,
    materials.espressoWood
  );
  // Top Crown (Y = 2.48..2.54) & Bottom Plinth (Y = 0.00..0.08)
  const cabCrown = createBox(
    'CEO_Cabinet_Top_Crown',
    1.76,
    0.06,
    0.58,
    0,
    2.51,
    0,
    materials.darkWalnutWood
  );
  const cabPlinth = createBox(
    'CEO_Cabinet_Base_Plinth',
    1.56,
    0.08,
    0.52,
    0,
    0.04,
    -0.01,
    materials.espressoWood
  );
  cabGroup.add(cabShadow, cabSideL, cabSideR, cabBack, cabCrown, cabPlinth);

  // Horizontal shelves at Y = 0.72, 1.18, 1.64, 2.08 (width 1.56, Z = -0.25..+0.24)
  const shelfHeights = [0.72, 1.18, 1.64, 2.08];
  shelfHeights.forEach((sy, idx) => {
    cabGroup.add(
      createBox(
        `CEO_Cabinet_Shelf_${idx + 1}`,
        1.56,
        0.04,
        0.49,
        0,
        sy,
        -0.005,
        materials.warmOakWood
      )
    );
  });

  // Lower closed archive doors (Y = 0.10..0.68, Z = -0.26)
  const cabDoorL = createBox(
    'CEO_Cabinet_Archive_Door_Left',
    0.76,
    0.58,
    0.025,
    -0.39,
    0.39,
    -0.255,
    materials.warmOakWood
  );
  const cabDoorR = createBox(
    'CEO_Cabinet_Archive_Door_Right',
    0.76,
    0.58,
    0.025,
    0.39,
    0.39,
    -0.255,
    materials.warmOakWood
  );
  const cabHandleL = createBox(
    'CEO_Cabinet_Door_Handle_L',
    0.025,
    0.14,
    0.02,
    -0.06,
    0.42,
    -0.28,
    materials.brushedBrass
  );
  const cabHandleR = createBox(
    'CEO_Cabinet_Door_Handle_R',
    0.025,
    0.14,
    0.02,
    0.06,
    0.42,
    -0.28,
    materials.brushedBrass
  );
  cabGroup.add(cabDoorL, cabDoorR, cabHandleL, cabHandleR);

  // Strategy Books, Q1-Q4 Report Binders & Executive Trophy on Shelves
  const bookMats = [
    materials.ceoForestLeather,
    materials.brushedBrass,
    materials.noteCoral,
    materials.noteSky,
    materials.noteSage,
    materials.noteAmber,
    materials.chairSlateFabric,
  ];
  const shelfBaseYs = [0.74, 1.2, 1.66];
  shelfBaseYs.forEach((baseY, sIdx) => {
    let bx = -0.7;
    for (let b = 0; b < 8; b++) {
      const bw = 0.055 + (b % 3) * 0.015;
      const bh = 0.28 + ((b + sIdx) % 3) * 0.04;
      const bMat = bookMats[(b + sIdx * 2) % bookMats.length];
      cabGroup.add(
        createBox(
          `CEO_Cabinet_Book_S${sIdx + 1}_${b + 1}`,
          bw,
          bh,
          0.26,
          bx + bw / 2,
          baseY + bh / 2,
          -0.02,
          bMat
        )
      );
      bx += bw + 0.015;
    }
  });

  // Executive Brass Trophy & Archive Box on top shelf (Y = 2.10)
  const trophyBase = createBox(
    'CEO_Cabinet_Trophy_Base',
    0.16,
    0.05,
    0.16,
    0.42,
    2.125,
    -0.02,
    materials.espressoWood
  );
  const trophyCup = createCyl(
    'CEO_Cabinet_Trophy_Golden_Cup',
    0.075,
    0.035,
    0.22,
    12,
    0.42,
    2.26,
    -0.02,
    materials.brushedBrass
  );
  const archiveBoxTop1 = createBox(
    'CEO_Cabinet_Top_Archive_Box_1',
    0.42,
    0.24,
    0.34,
    -0.38,
    2.22,
    -0.02,
    materials.ceoForestLeather
  );
  const archiveBoxLabel1 = createBox(
    'CEO_Cabinet_Top_Archive_Label_1',
    0.18,
    0.08,
    0.01,
    -0.38,
    2.22,
    -0.195,
    materials.paperCream
  );
  cabGroup.add(trophyBase, trophyCup, archiveBoxTop1, archiveBoxLabel1);

  tagCatalogGroup(cabGroup, 'CEO_Strategy_Cabinet', 'FURNITURE');
  groups.FURNITURE.add(cabGroup);
  catalogNodeMap.set('CEO_Strategy_Cabinet', cabGroup);

  // =========================================================================
  // 12. ZONE F — WALL-MOUNTED EXECUTIVE OKR & DECISION BOARD ([0.32, 1.62, 6.25])
  //     Plus Framed Executive Graphics & Wall Clock
  // =========================================================================
  const okrBoardGroup = new THREE.Group();
  okrBoardGroup.name = 'CEO_Wall_Planning_Board';
  okrBoardGroup.position.set(0.32, 1.62, 6.25);

  const okrFrameBack = createBox(
    'CEO_OKR_Board_Walnut_Frame',
    0.05,
    1.22,
    1.84,
    0,
    0,
    0,
    materials.darkWalnutWood
  );
  const okrCanvasSurface = createBox(
    'CEO_OKR_Board_Canvas_Surface',
    0.015,
    1.1,
    1.72,
    0.0325,
    0,
    0,
    materials.ceoOkrBoardSurface
  );
  const okrLedge = createBox(
    'CEO_OKR_Board_Brass_Marker_Ledge',
    0.08,
    0.04,
    1.6,
    0.05,
    -0.58,
    0,
    materials.brushedBrass
  );
  okrBoardGroup.add(okrFrameBack, okrCanvasSurface, okrLedge);

  // Framed Executive Wall Art South of West Doorway (X = 0.30, Z = 1.65, Y = 1.72)
  const framedArt1Frame = createBox(
    'CEO_West_Wall_Framed_Print_Frame',
    0.04,
    0.68,
    0.52,
    0,
    0.1,
    -4.6,
    materials.darkWalnutWood
  );
  const framedArt1Art = createBox(
    'CEO_West_Wall_Framed_Print_Canvas',
    0.012,
    0.58,
    0.42,
    0.026,
    0.1,
    -4.6,
    materials.posterArt1
  );
  // Executive Brass Wall Clock on North Wall Pier Center (X = 6.05, Y = 2.25, Z = 7.72 -> relative [5.73, 0.63, 1.47])
  const clockRim = createCyl(
    'CEO_North_Wall_Brass_Clock_Rim',
    0.18,
    0.18,
    0.04,
    16,
    5.73,
    0.65,
    1.47,
    materials.brushedBrass
  );
  clockRim.rotation.x = Math.PI / 2;
  const clockFace = createCyl(
    'CEO_North_Wall_Clock_Face',
    0.15,
    0.15,
    0.015,
    16,
    5.73,
    0.65,
    1.445,
    materials.paperCream
  );
  clockFace.rotation.x = Math.PI / 2;
  okrBoardGroup.add(framedArt1Frame, framedArt1Art, clockRim, clockFace);

  tagCatalogGroup(okrBoardGroup, 'CEO_Wall_Planning_Board', 'FURNITURE');
  groups.FURNITURE.add(okrBoardGroup);
  catalogNodeMap.set('CEO_Wall_Planning_Board', okrBoardGroup);
  westWallNodes.push(okrBoardGroup);

  // =========================================================================
  // 13. ZONE G — COZY EXECUTIVE DECORATION (Rug, Floor Lamp, Indoor Planters)
  // =========================================================================
  const rugGroup = new THREE.Group();
  rugGroup.name = 'CEO_Area_Rug';
  rugGroup.position.set(4.35, 0.015, 4.15);

  const rugMesh = createBox(
    'Floor_Center_Woven_Rug_CEO',
    3.1,
    0.02,
    2.8,
    0,
    0,
    0,
    materials.ceoEmeraldRug
  );
  rugGroup.add(rugMesh);
  tagCatalogGroup(rugGroup, 'CEO_Area_Rug', 'DECORATION');
  groups.DECORATION.add(rugGroup);
  catalogNodeMap.set('CEO_Area_Rug', rugGroup);

  // Warm Brass Floor Lamp in North-East Corner ([6.85, 0, 7.15])
  const lampGroup = new THREE.Group();
  lampGroup.name = 'CEO_Floor_Lamp';
  lampGroup.position.set(6.85, 0, 7.15);

  const fLampBase = createCyl(
    'CEO_Floor_Lamp_Base',
    0.2,
    0.22,
    0.04,
    16,
    0,
    0.02,
    0,
    materials.brushedBrass
  );
  const fLampPole = createCyl(
    'CEO_Floor_Lamp_Pole',
    0.024,
    0.028,
    1.42,
    10,
    0,
    0.75,
    0,
    materials.brushedBrass
  );
  const fLampShade = createCyl(
    'CEO_Floor_Lamp_Warm_Shade',
    0.16,
    0.24,
    0.34,
    16,
    0,
    1.58,
    0,
    materials.lampShadeWarm
  );
  lampGroup.add(fLampBase, fLampPole, fLampShade);
  tagCatalogGroup(lampGroup, 'CEO_Floor_Lamp', 'PROPS');
  groups.PROPS.add(lampGroup);
  catalogNodeMap.set('CEO_Floor_Lamp', lampGroup);

  // Sculpted Indoor Planters ([6.95, 0, 1.25] South-East & companion planter near NW)
  const plantsGroup = new THREE.Group();
  plantsGroup.name = 'CEO_Corner_Plants';
  plantsGroup.position.set(6.95, 0, 1.25);

  const buildVoxelPlanter = (prefix: string, ox: number, oz: number, scale = 1.0) => {
    const p = new THREE.Group();
    p.name = prefix;
    p.position.set(ox, 0, oz);

    const pot = createCyl(
      `${prefix}_Pot`,
      0.22 * scale,
      0.16 * scale,
      0.36 * scale,
      12,
      0,
      0.18 * scale,
      0,
      materials.ceramicCream
    );
    const rim = createCyl(
      `${prefix}_Brass_Rim`,
      0.235 * scale,
      0.235 * scale,
      0.04 * scale,
      12,
      0,
      0.35 * scale,
      0,
      materials.brushedBrass
    );
    const stem = createBox(
      `${prefix}_Stem`,
      0.06 * scale,
      0.42 * scale,
      0.06 * scale,
      0,
      0.52 * scale,
      0,
      materials.darkWalnutWood
    );
    const leaf1 = createBox(
      `${prefix}_Foliage_Cluster_1`,
      0.38 * scale,
      0.24 * scale,
      0.36 * scale,
      0,
      0.72 * scale,
      0,
      materials.plantFoliageDark
    );
    const leaf2 = createBox(
      `${prefix}_Foliage_Cluster_2`,
      0.3 * scale,
      0.22 * scale,
      0.28 * scale,
      0.08 * scale,
      0.92 * scale,
      -0.05 * scale,
      materials.plantFoliageMid
    );
    const leaf3 = createBox(
      `${prefix}_Foliage_Cluster_3`,
      0.22 * scale,
      0.18 * scale,
      0.22 * scale,
      -0.06 * scale,
      1.06 * scale,
      0.06 * scale,
      materials.plantFoliageBright
    );
    p.add(pot, rim, stem, leaf1, leaf2, leaf3);
    return p;
  };

  const sePlanter = buildVoxelPlanter('CEO_Plant_SE_Monstera', 0, 0, 1.0);
  const nwPlanter = buildVoxelPlanter('CEO_Plant_NW_Ficus', -6.32, 4.1, 0.85);
  plantsGroup.add(sePlanter, nwPlanter);

  tagCatalogGroup(plantsGroup, 'CEO_Corner_Plants', 'DECORATION');
  groups.DECORATION.add(plantsGroup);
  catalogNodeMap.set('CEO_Corner_Plants', plantsGroup);

  return {
    ceoRoot,
    groups,
    northWallNodes,
    westWallNodes,
    catalogNodeMap,
  };
}

/**
 * Builds visual 3D anchor markers for the 11 CEO Room navigation anchors
 * (strictly outside `ROOM_CEO_ROOT` so they are never exported into `ceo_room.glb`).
 */
export function buildCEORoomAnchorHelpers(
  anchors: Record<CEOAnchorId, CEOActivityAnchor> = DEFAULT_CEO_ANCHORS,
  selectedAnchorId: CEOAnchorId | null = 'CEO_DESK_WORK'
): {
  helpersRoot: THREE.Group;
  updateAnchors: (
    nextAnchors: Record<CEOAnchorId, CEOActivityAnchor>,
    nextSelected: CEOAnchorId | null
  ) => void;
  updateAnchorsVisuals: (
    nextAnchors: Record<CEOAnchorId, CEOActivityAnchor>,
    nextSelected: CEOAnchorId | null
  ) => void;
} {
  const helpersRoot = new THREE.Group();
  helpersRoot.name = 'CEO_SIMULATION_ANCHORS_HELPERS';

  const ringGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.02, 16);
  const arrowGeo = new THREE.BoxGeometry(0.06, 0.025, 0.28);

  const rebuild = (
    curAnchors: Record<CEOAnchorId, CEOActivityAnchor>,
    selId: CEOAnchorId | null
  ) => {
    while (helpersRoot.children.length > 0) {
      helpersRoot.remove(helpersRoot.children[0]);
    }

    (Object.keys(curAnchors) as CEOAnchorId[]).forEach((id) => {
      const a = curAnchors[id];
      const isSel = id === selId;
      const g = new THREE.Group();
      g.name = `CEO_Anchor_Helper_${id}`;
      g.position.set(a.position[0], 0.03, a.position[2]);
      g.rotation.y = a.facingRad;

      const mat = new THREE.MeshBasicMaterial({
        color: isSel ? 0xfbbf24 : 0x34d399,
        transparent: true,
        opacity: isSel ? 0.9 : 0.65,
      });
      const ring = new THREE.Mesh(ringGeo, mat);
      const arrow = new THREE.Mesh(arrowGeo, mat);
      arrow.position.set(0, 0.015, 0.18);
      g.add(ring, arrow);
      helpersRoot.add(g);
    });
  };

  rebuild(anchors, selectedAnchorId);

  return {
    helpersRoot,
    updateAnchors: rebuild,
    updateAnchorsVisuals: rebuild,
  };
}
