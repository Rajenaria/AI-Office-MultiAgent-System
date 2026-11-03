import * as THREE from 'three';
import { MaterialLibraryInstance } from './PixelMaterialLibrary';
import { MODULE_CONSTANTS } from '../domain/modularRoomSpec';

function createBoxMesh(
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

export function buildRoomArchitecture(
  groups: Record<(typeof MODULE_CONSTANTS.REQUIRED_GROUPS)[number], THREE.Group>,
  matLib: MaterialLibraryInstance
): {
  northWallNodes: THREE.Object3D[];
  westWallNodes: THREE.Object3D[];
} {
  const { materials } = matLib;
  const northWallNodes: THREE.Object3D[] = [];
  const westWallNodes: THREE.Object3D[] = [];

  // =========================================================================
  // 1. FLOOR GROUP (X = 0..8, Z = 0..8, Y = -0.16..0.00)
  //    Subbase and oak floor abut the East (X=7.92..8.00) and South (Z=0.00..0.08)
  //    cutaway plinth trims cleanly so zero outer faces are coplanar!
  // =========================================================================
  const floorMain = createBoxMesh(
    'Floor_Oak_Plank_Surface',
    7.92,
    0.04,
    7.92,
    3.96,
    -0.02,
    4.04,
    materials.oakFloor,
    { category: 'FLOOR', catalogId: 'Floor_Oak_Plank_Surface' }
  );
  groups.FLOOR.add(floorMain);

  // Structural sub-floor plinth (-0.16 to -0.04, X = 0..7.92, Z = 0.08..8.00)
  const floorSubbase = createBoxMesh(
    'Floor_Structural_Subbase',
    7.92,
    0.12,
    7.92,
    3.96,
    -0.1,
    4.04,
    materials.floorSubbase,
    { category: 'STRUCTURE', catalogId: 'Floor_Structural_Subbase' }
  );
  groups.STRUCTURE.add(floorSubbase);

  // Stepped cutaway outer floor trim along East (X = 7.92..8.00, Z = 0.08..8.00) and South (Z = 0.00..0.08, X = 0.00..8.00)
  const eastCutawayLedge = createBoxMesh(
    'Structure_East_Cutaway_Plinth_Trim',
    0.08,
    0.16,
    7.92,
    7.96,
    -0.08,
    4.04,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  const southCutawayLedge = createBoxMesh(
    'Structure_South_Cutaway_Plinth_Trim',
    8.0,
    0.16,
    0.08,
    4.0,
    -0.08,
    0.04,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  groups.STRUCTURE.add(eastCutawayLedge, southCutawayLedge);

  // =========================================================================
  // 2. NORTH FULL-HEIGHT WALL (Z = 7.78..8.00, X = 0.34..8.00, Y = 0..3.16)
  //    Abuts West wall corner pier at X = 0.34 and sits cleanly beneath
  //    Wall_North_Top_Cap (Y = 3.16..3.20) with zero coplanar overlap!
  // =========================================================================
  const northWallGroup = new THREE.Group();
  northWallGroup.name = 'Wall_North_Assembly';

  const northWallMain = createBoxMesh(
    'Wall_North_Main',
    7.66,
    3.16,
    0.22,
    4.17,
    1.58,
    7.89,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'NORTH' }
  );
  // Dark cutaway top cap on North wall (Y = 3.16..3.20, X = 0.00..8.00, Z = 7.76..8.00)
  const northWallTopCap = createBoxMesh(
    'Wall_North_Top_Cap',
    8.0,
    0.04,
    0.24,
    4.0,
    3.18,
    7.88,
    materials.wallCapDark,
    { category: 'STRUCTURE', wallSide: 'NORTH' }
  );
  // Architectural pilaster bump-out protruding cleanly in front of North wall (Z = 7.66..7.78, Y = 0.00..3.16)
  const northPilaster = createBoxMesh(
    'Wall_North_Architectural_Pilaster',
    0.28,
    3.16,
    0.12,
    6.35,
    1.58,
    7.72,
    materials.warmWall,
    { category: 'STRUCTURE', wallSide: 'NORTH' }
  );
  const northPilasterCap = createBoxMesh(
    'Wall_North_Pilaster_Cap',
    0.3,
    0.04,
    0.11,
    6.35,
    3.18,
    7.705,
    materials.wallCapDark,
    { category: 'STRUCTURE', wallSide: 'NORTH' }
  );
  // Warm wood baseboard along North wall (Z = 7.74..7.78, split cleanly around pilaster X = 6.21..6.49)
  const northBaseboardWest = createBoxMesh(
    'Trim_North_Baseboard',
    5.87,
    0.14,
    0.04,
    3.275,
    0.07,
    7.76,
    materials.woodTrim,
    { category: 'STRUCTURE', wallSide: 'NORTH' }
  );
  const northBaseboardEast = createBoxMesh(
    'Trim_North_Baseboard_East',
    1.31,
    0.14,
    0.04,
    7.145,
    0.07,
    7.76,
    materials.woodTrim,
    { category: 'STRUCTURE', wallSide: 'NORTH' }
  );
  const northBaseboardPilaster = createBoxMesh(
    'Trim_North_Baseboard_Pilaster',
    0.32,
    0.14,
    0.03,
    6.35,
    0.07,
    7.645,
    materials.woodTrim,
    { category: 'STRUCTURE', wallSide: 'NORTH' }
  );

  northWallGroup.add(
    northWallMain,
    northWallTopCap,
    northPilaster,
    northPilasterCap,
    northBaseboardWest,
    northBaseboardEast,
    northBaseboardPilaster
  );
  groups.WALLS.add(northWallGroup);
  northWallNodes.push(northWallGroup);

  // =========================================================================
  // 3. WEST FULL-HEIGHT WALL WITH RECESSED WINDOW BAYS (X = 0..0.34, Z = 0..8)
  //    Exterior shell occupies X = 0.00..0.10; inner piers & spandrels occupy
  //    X = 0.10..0.34 (or 0.26) so zero faces are coplanar at X = 0.00!
  // =========================================================================
  const westWallGroup = new THREE.Group();
  westWallGroup.name = 'Wall_West_Assembly';

  // Exterior backing slab along X = 0.00..0.10, Y = 0.00..3.16, Z = 0.00..8.00
  const westBackingWall = createBoxMesh(
    'Wall_West_Exterior_Shell',
    0.1,
    3.16,
    8.0,
    0.05,
    1.58,
    4.0,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // Pier 1: North-West corner pier (X = 0.10..0.34, Z = 7.10..8.00, Y = 0.00..3.16)
  const westPierNorth = createBoxMesh(
    'Wall_West_Pier_North',
    0.24,
    3.16,
    0.9,
    0.22,
    1.58,
    7.55,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // Pier 2: Central pilaster column between Large Window and Second Window (X = 0.10..0.38, Z = 3.15..4.25, Y = 0.00..3.16)
  const westPierCenter = createBoxMesh(
    'Wall_West_Pier_Center_Pilaster',
    0.28,
    3.16,
    1.1,
    0.24,
    1.58,
    3.7,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // Pier 3: South-West corner pier (X = 0.10..0.34, Z = 0.00..1.25, Y = 0.00..3.16)
  const westPierSouth = createBoxMesh(
    'Wall_West_Pier_South',
    0.24,
    3.16,
    1.25,
    0.22,
    1.58,
    0.625,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // Lower spandrel wall under Large Window 1 (X = 0.10..0.26, Z = 4.25..7.10, Y = 0..0.82)
  const westSpandrel1Low = createBoxMesh(
    'Wall_West_Window1_Lower_Spandrel',
    0.16,
    0.82,
    2.85,
    0.18,
    0.41,
    5.675,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // Upper lintel wall above Large Window 1 (X = 0.10..0.34, Z = 4.25..7.10, Y = 2.68..3.16)
  const westLintel1High = createBoxMesh(
    'Wall_West_Window1_Upper_Lintel',
    0.24,
    0.48,
    2.85,
    0.22,
    2.92,
    5.675,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // Lower spandrel wall under Window 2 (X = 0.10..0.26, Z = 1.25..3.15, Y = 0..0.88)
  const westSpandrel2Low = createBoxMesh(
    'Wall_West_Window2_Lower_Spandrel',
    0.16,
    0.88,
    1.9,
    0.18,
    0.44,
    2.2,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // Upper lintel wall above Window 2 (X = 0.10..0.34, Z = 1.25..3.15, Y = 2.58..3.16)
  const westLintel2High = createBoxMesh(
    'Wall_West_Window2_Upper_Lintel',
    0.24,
    0.58,
    1.9,
    0.22,
    2.87,
    2.2,
    materials.warmWall,
    { category: 'WALLS', wallSide: 'WEST' }
  );
  // Cutaway dark top cap along West wall (Y = 3.16..3.20, X = 0.00..0.38, Z = 0.00..7.76 abutting North Top Cap)
  const westTopCap = createBoxMesh(
    'Wall_West_Top_Cap',
    0.38,
    0.04,
    7.76,
    0.19,
    3.18,
    3.88,
    materials.wallCapDark,
    { category: 'STRUCTURE', wallSide: 'WEST' }
  );
  // Baseboard along West wall (X = 0.38..0.415, Z = 0.20..7.74 clear of South/North walls)
  const westBaseboard = createBoxMesh(
    'Trim_West_Baseboard',
    0.035,
    0.14,
    7.54,
    0.3975,
    0.07,
    3.97,
    materials.woodTrim,
    { category: 'STRUCTURE', wallSide: 'WEST' }
  );

  westWallGroup.add(
    westBackingWall,
    westPierNorth,
    westPierCenter,
    westPierSouth,
    westSpandrel1Low,
    westLintel1High,
    westSpandrel2Low,
    westLintel2High,
    westTopCap,
    westBaseboard
  );
  groups.WALLS.add(westWallGroup);
  westWallNodes.push(westWallGroup);

  // =========================================================================
  // 4. WINDOWS GROUP (Crafted Multi-Pane Casement Windows on West Wall)
  //    Non-overlapping frame bars & stepped X planes eliminate Z-fighting!
  // =========================================================================
  const windowsAssy = new THREE.Group();
  windowsAssy.name = 'Windows_West_Daylight_Assembly';

  const buildCasementWindow = (
    namePrefix: string,
    zCenter: number,
    zSpan: number,
    yBottom: number,
    yTop: number,
    numPanes: 2 | 3
  ) => {
    const winGroup = new THREE.Group();
    winGroup.name = namePrefix;

    // 1. Wooden windowsill slab with overhang (Y = yBottom .. yBottom + 0.05, X = 0.10..0.36)
    const sillTopY = yBottom + 0.05;
    const sill = createBoxMesh(
      `${namePrefix}_Wooden_Sill`,
      0.26,
      0.05,
      zSpan + 0.06,
      0.23,
      yBottom + 0.025,
      zCenter,
      materials.honeyOakLight,
      { category: 'WINDOWS' }
    );
    winGroup.add(sill);

    // 2. Outer cream casement frame (top & bottom full width; left & right fit strictly between top & bottom)
    const frameH = yTop - sillTopY;
    const frameMidY = (sillTopY + yTop) / 2;
    const barThick = 0.07;

    const frameTop = createBoxMesh(
      `${namePrefix}_Frame_Top`,
      0.09,
      barThick,
      zSpan,
      0.155,
      yTop - barThick / 2,
      zCenter,
      materials.windowFrameCream,
      { category: 'WINDOWS' }
    );
    const frameBot = createBoxMesh(
      `${namePrefix}_Frame_Bottom`,
      0.09,
      barThick,
      zSpan,
      0.155,
      sillTopY + barThick / 2,
      zCenter,
      materials.windowFrameCream,
      { category: 'WINDOWS' }
    );
    const innerH = frameH - barThick * 2;
    const frameLeft = createBoxMesh(
      `${namePrefix}_Frame_Left`,
      0.09,
      innerH,
      barThick,
      0.155,
      frameMidY,
      zCenter + zSpan / 2 - barThick / 2,
      materials.windowFrameCream,
      { category: 'WINDOWS' }
    );
    const frameRight = createBoxMesh(
      `${namePrefix}_Frame_Right`,
      0.09,
      innerH,
      barThick,
      0.155,
      frameMidY,
      zCenter - zSpan / 2 + barThick / 2,
      materials.windowFrameCream,
      { category: 'WINDOWS' }
    );
    winGroup.add(frameTop, frameBot, frameLeft, frameRight);

    // 3. Horizontal transom bar (spans strictly between Frame_Left and Frame_Right)
    const innerZSpan = zSpan - barThick * 2;
    const transomY = yTop - frameH * 0.32;
    const transomBar = createBoxMesh(
      `${namePrefix}_Horizontal_Transom`,
      0.076,
      0.055,
      innerZSpan,
      0.162,
      transomY,
      zCenter,
      materials.windowFrameCream,
      { category: 'WINDOWS' }
    );
    winGroup.add(transomBar);

    // 4. Vertical mullions dividing panes (split into upper and lower segments around transomBar so they never intersect!)
    const paneSpan = innerZSpan / numPanes;
    const upperPaneBottom = transomY + 0.0275;
    const upperPaneTop = yTop - barThick;
    const upperPaneH = upperPaneTop - upperPaneBottom;
    const upperPaneMidY = (upperPaneBottom + upperPaneTop) / 2;

    const lowerPaneBottom = sillTopY + barThick;
    const lowerPaneTop = transomY - 0.0275;
    const lowerPaneH = lowerPaneTop - lowerPaneBottom;
    const lowerPaneMidY = (lowerPaneBottom + lowerPaneTop) / 2;

    for (let i = 1; i < numPanes; i++) {
      const mz = zCenter - innerZSpan / 2 + i * paneSpan;
      const mullionLower = createBoxMesh(
        `${namePrefix}_Vertical_Mullion_${i}`,
        0.072,
        lowerPaneH,
        0.055,
        0.16,
        lowerPaneMidY,
        mz,
        materials.windowFrameCream,
        { category: 'WINDOWS' }
      );
      const mullionUpper = createBoxMesh(
        `${namePrefix}_Vertical_Mullion_Upper_${i}`,
        0.072,
        upperPaneH,
        0.055,
        0.16,
        upperPaneMidY,
        mz,
        materials.windowFrameCream,
        { category: 'WINDOWS' }
      );
      winGroup.add(mullionLower, mullionUpper);
    }

    // 5. Pixel-art daylight vista backdrop plane (X = 0.105..0.120) + subtle glass pane (X = 0.205..0.215)
    const vistaBacking = createBoxMesh(
      `${namePrefix}_Daylight_Vista_Backdrop`,
      0.015,
      innerH,
      innerZSpan,
      0.1125,
      frameMidY,
      zCenter,
      materials.windowVista,
      { category: 'WINDOWS' }
    );
    const glassPane = createBoxMesh(
      `${namePrefix}_Glass_Pane`,
      0.01,
      innerH,
      innerZSpan,
      0.21,
      frameMidY,
      zCenter,
      materials.windowGlass,
      { category: 'WINDOWS' }
    );
    winGroup.add(vistaBacking, glassPane);

    return winGroup;
  };

  const mainBayWindow = buildCasementWindow(
    'Window_West_Bay_Primary_3Pane',
    5.675,
    2.8,
    0.82,
    2.68,
    3
  );
  const secondaryWindow = buildCasementWindow(
    'Window_West_Secondary_2Pane',
    2.2,
    1.86,
    0.88,
    2.58,
    2
  );
  windowsAssy.add(mainBayWindow, secondaryWindow);
  groups.WINDOWS.add(windowsAssy);
  westWallNodes.push(windowsAssy);

  // =========================================================================
  // 5. HYBRID LOW CUTAWAY WALLS ON EAST (X = 8) & SOUTH (Z = 0)
  //    Wall segments span Y = 0.00..0.34 and caps span Y = 0.34..0.38,
  //    stopping cleanly at the connector jambs (Z = 3.06..4.94, X = 3.06..4.94)
  // =========================================================================
  const wallSegH = 0.34;
  const capH = 0.04;
  const capY = wallSegH + capH / 2; // 0.36

  // East Low Cutaway Wall North segment (Z = 5.06..7.78 -> length 2.72, center 6.42)
  const eastLowNorthSeg = createBoxMesh(
    'Wall_East_Cutaway_North_Segment',
    0.2,
    wallSegH,
    2.72,
    7.9,
    wallSegH / 2,
    6.42,
    materials.warmWall,
    { category: 'WALLS' }
  );
  const eastLowNorthCap = createBoxMesh(
    'Wall_East_Cutaway_North_Cap',
    0.22,
    capH,
    2.72,
    7.89,
    capY,
    6.42,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  // East Low Cutaway Wall South segment (Z = 0.20..2.94 -> length 2.74, center 1.57)
  const eastLowSouthSeg = createBoxMesh(
    'Wall_East_Cutaway_South_Segment',
    0.2,
    wallSegH,
    2.74,
    7.9,
    wallSegH / 2,
    1.57,
    materials.warmWall,
    { category: 'WALLS' }
  );
  const eastLowSouthCap = createBoxMesh(
    'Wall_East_Cutaway_South_Cap',
    0.22,
    capH,
    2.74,
    7.89,
    capY,
    1.57,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  groups.WALLS.add(eastLowNorthSeg, eastLowSouthSeg);
  groups.STRUCTURE.add(eastLowNorthCap, eastLowSouthCap);

  // South Low Cutaway Wall West segment (X = 0.34..2.94 -> length 2.60, center 1.64)
  const southLowWestSeg = createBoxMesh(
    'Wall_South_Cutaway_West_Segment',
    2.6,
    wallSegH,
    0.2,
    1.64,
    wallSegH / 2,
    0.1,
    materials.warmWall,
    { category: 'WALLS' }
  );
  const southLowWestCap = createBoxMesh(
    'Wall_South_Cutaway_West_Cap',
    2.6,
    capH,
    0.22,
    1.64,
    capY,
    0.11,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  // South Low Cutaway Wall East segment (X = 5.06..8.00 -> length 2.94, center 6.53)
  const southLowEastSeg = createBoxMesh(
    'Wall_South_Cutaway_East_Segment',
    2.94,
    wallSegH,
    0.2,
    6.53,
    wallSegH / 2,
    0.1,
    materials.warmWall,
    { category: 'WALLS' }
  );
  const southLowEastCap = createBoxMesh(
    'Wall_South_Cutaway_East_Cap',
    2.94,
    capH,
    0.22,
    6.53,
    capY,
    0.11,
    materials.wallCapDark,
    { category: 'STRUCTURE' }
  );
  groups.WALLS.add(southLowEastSeg, southLowWestSeg);
  groups.STRUCTURE.add(southLowWestCap, southLowEastCap);

  // =========================================================================
  // 6. MODULAR CONNECTORS GROUP (CONNECTOR A — EAST [8,0,4] & CONNECTOR B — SOUTH [4,0,0])
  //    Threshold plates, jamb posts, and removable doorway inserts with clean
  //    non-overlapping Y/X/Z intervals!
  // =========================================================================
  // Connector A — EAST at X = 8, Z = 3.0..5.0 (width 2.0)
  const connEastGroup = new THREE.Group();
  connEastGroup.name = 'CONNECTOR_A_EAST';
  connEastGroup.userData = {
    connectorId: 'CONNECTOR_EAST',
    position: [8, 0, 4],
    outwardDirection: '+X',
    width: 2.0,
    category: 'CONNECTORS',
  };

  const eastThresholdPlate = createBoxMesh(
    'Connector_East_Threshold_Sill',
    0.24,
    0.03,
    1.88,
    7.88,
    0.015,
    4.0,
    materials.connectorFrame,
    { category: 'CONNECTORS' }
  );
  const eastJambNorth = createBoxMesh(
    'Connector_East_Jamb_North',
    0.24,
    0.46,
    0.12,
    7.88,
    0.23,
    5.0,
    materials.darkWalnutWood,
    { category: 'CONNECTORS' }
  );
  const eastJambSouth = createBoxMesh(
    'Connector_East_Jamb_South',
    0.24,
    0.46,
    0.12,
    7.88,
    0.23,
    3.0,
    materials.darkWalnutWood,
    { category: 'CONNECTORS' }
  );
  // Removable low wall / threshold gate section sitting on top of threshold plate (Y = 0.03..0.21)
  const eastRemovableSection = createBoxMesh(
    'Connector_East_Removable_Doorway',
    0.14,
    0.18,
    1.88,
    7.9,
    0.12,
    4.0,
    materials.woodTrim,
    { category: 'CONNECTORS', removableConnectorSection: true }
  );
  connEastGroup.add(eastThresholdPlate, eastJambNorth, eastJambSouth, eastRemovableSection);
  groups.CONNECTORS.add(connEastGroup);

  // Connector B — SOUTH at Z = 0, X = 3.0..5.0 (width 2.0)
  const connSouthGroup = new THREE.Group();
  connSouthGroup.name = 'CONNECTOR_B_SOUTH';
  connSouthGroup.userData = {
    connectorId: 'CONNECTOR_SOUTH',
    position: [4, 0, 0],
    outwardDirection: '-Z',
    width: 2.0,
    category: 'CONNECTORS',
  };

  const southThresholdPlate = createBoxMesh(
    'Connector_South_Threshold_Sill',
    1.88,
    0.03,
    0.22,
    4.0,
    0.015,
    0.11,
    materials.connectorFrame,
    { category: 'CONNECTORS' }
  );
  // Welcoming dark entry mat inside the South connector threshold (Z = 0.24..0.94, Y = 0.00..0.020)
  const southEntryMat = createBoxMesh(
    'Connector_South_Welcome_Mat',
    1.45,
    0.02,
    0.7,
    4.0,
    0.01,
    0.59,
    materials.wallCapDark,
    { category: 'CONNECTORS' }
  );
  // Inset mat layer sitting cleanly on top of southEntryMat (Y = 0.020..0.030)
  const southEntryMatInner = createBoxMesh(
    'Connector_South_Welcome_Mat_Inset',
    1.3,
    0.01,
    0.56,
    4.0,
    0.025,
    0.59,
    materials.sofaCocoaFabric,
    { category: 'CONNECTORS' }
  );
  const southJambWest = createBoxMesh(
    'Connector_South_Jamb_West',
    0.12,
    0.46,
    0.24,
    3.0,
    0.23,
    0.12,
    materials.darkWalnutWood,
    { category: 'CONNECTORS' }
  );
  const southJambEast = createBoxMesh(
    'Connector_South_Jamb_East',
    0.12,
    0.46,
    0.24,
    5.0,
    0.23,
    0.12,
    materials.darkWalnutWood,
    { category: 'CONNECTORS' }
  );
  const southRemovableSection = createBoxMesh(
    'Connector_South_Removable_Threshold',
    1.88,
    0.18,
    0.14,
    4.0,
    0.12,
    0.11,
    materials.woodTrim,
    { category: 'CONNECTORS', removableConnectorSection: true }
  );
  connSouthGroup.add(
    southThresholdPlate,
    southEntryMat,
    southEntryMatInner,
    southJambWest,
    southJambEast,
    southRemovableSection
  );
  groups.CONNECTORS.add(connSouthGroup);

  return { northWallNodes, westWallNodes };
}
