import * as THREE from 'three';
import {
  DEFAULT_RESEARCH_ANCHORS,
  RESEARCH_CONNECTORS_SPEC,
  RESEARCH_DISPLAY_SLOTS,
  RESEARCH_MODULE_CONSTANTS,
} from '../domain/researchRoomSpec';
import { MaterialLibraryInstance } from './PixelMaterialLibrary';

export interface BuiltResearchRoomResult {
  roomRoot: THREE.Group;
  groups: Record<string, THREE.Group>;
  northWallNodes: THREE.Object3D[];
  westWallNodes: THREE.Object3D[];
  eastWallNodes: THREE.Object3D[];
  southWallNodes: THREE.Object3D[];
  furnitureNodes: Map<string, THREE.Object3D>;
  catalogNodeMap: Map<string, THREE.Object3D>;
  displaySlotNodes: Map<string, THREE.Mesh>;
  helpersGroup: THREE.Group;
  stats: {
    meshCount: number;
    triangleCount: number;
    materialCount: number;
  };
}

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

/**
 * Builds AI OFFICE — MODULE 05: RESEARCH & SHARED BRAIN ROOM PRODUCTION V1
 * ("The Knowledge Atelier")
 *
 * Strictly anchored at local [0, 0, 0] (South-West floor corner) with an 8×8×3.2 footprint.
 * East plinth and wall are inset to X <= 7.95 so that when placed at [0, 0, 18] in Master
 * Layout A3.1 (immediately West of PM Room at [8, 0, 18]), there is zero coplanar Z-fighting.
 */
export function buildResearchRoomComplete(matLib: MaterialLibraryInstance): BuiltResearchRoomResult {
  const { materials } = matLib;

  const roomRoot = new THREE.Group();
  roomRoot.name = RESEARCH_MODULE_CONSTANTS.ROOT_NODE_NAME; // 'ROOM_RESEARCH_ROOT'
  roomRoot.position.set(0, 0, 0);

  const groups: Record<string, THREE.Group> = {};
  for (const grpName of RESEARCH_MODULE_CONSTANTS.REQUIRED_GROUPS) {
    const grp = new THREE.Group();
    grp.name = grpName;
    roomRoot.add(grp);
    groups[grpName] = grp;
  }

  const northWallNodes: THREE.Object3D[] = [];
  const westWallNodes: THREE.Object3D[] = [];
  const eastWallNodes: THREE.Object3D[] = [];
  const southWallNodes: THREE.Object3D[] = [];
  const furnitureNodes = new Map<string, THREE.Object3D>();
  const displaySlotNodes = new Map<string, THREE.Mesh>();

  // =========================================================================
  // 1. FLOOR & STRUCTURE (8.0 × 8.0 footprint, Y = -0.16..0.00)
  // =========================================================================
  const floorPlanks = createBox(
    'Research_Oak_Parquet_Floor_Surface',
    7.6,
    0.04,
    7.6,
    4.0,
    -0.02,
    4.0,
    materials.oakFloor,
    { isFloor: true }
  );
  groups.FLOOR.add(floorPlanks);

  const floorSubbase = createBox(
    'Research_Structural_Floor_Subbase',
    7.92,
    0.118,
    7.94,
    3.97,
    -0.101,
    4.0,
    materials.floorSubbase
  );
  const plinthNorth = createBox(
    'Research_Plinth_Strip_North',
    7.92,
    0.04,
    0.08,
    3.97,
    -0.02,
    7.94,
    materials.floorSubbase
  );
  const plinthSouthW = createBox(
    'Research_Plinth_Strip_South_W',
    2.94,
    0.04,
    0.08,
    1.5,
    -0.02,
    0.06,
    materials.floorSubbase
  );
  const plinthSouthE = createBox(
    'Research_Plinth_Strip_South_E',
    2.91,
    0.04,
    0.08,
    6.475,
    -0.02,
    0.06,
    materials.floorSubbase
  );
  const plinthWest = createBox(
    'Research_Plinth_Strip_West',
    0.08,
    0.04,
    7.76,
    0.06,
    -0.02,
    4.0,
    materials.floorSubbase
  );
  // Inset East plinth to X = 7.915 (max X = 7.95) so it never touches PM West plinth at X = 8.02
  const plinthEast = createBox(
    'Research_Plinth_Strip_East',
    0.07,
    0.04,
    7.76,
    7.915,
    -0.02,
    4.0,
    materials.floorSubbase
  );
  groups.STRUCTURE.add(
    floorSubbase,
    plinthNorth,
    plinthSouthW,
    plinthSouthE,
    plinthWest,
    plinthEast
  );

  // =========================================================================
  // 2. WALLS & WINDOWS (3.2u height, warm parchment & walnut library trim)
  // =========================================================================
  // --- NORTH WALL (Z = 7.83, thickness 0.14): Solid West/Center bay for Shared Brain Atlas + North-East Tall Study Window (X = 4.90..7.20, Y = 0.88..2.46) ---
  const northWallWestBay = createBox(
    'Wall_North_Atlas_Backing_Segment',
    4.9,
    3.12,
    0.14,
    2.45,
    1.56,
    7.83,
    materials.researchWallParchment
  );
  const northWallLowerE = createBox(
    'Wall_North_Window_Lower_Sill_Segment',
    2.3,
    0.88,
    0.14,
    6.05,
    0.44,
    7.83,
    materials.researchWallParchment
  );
  const northWallUpperE = createBox(
    'Wall_North_Window_Header_Segment',
    2.3,
    0.66,
    0.14,
    6.05,
    2.79,
    7.83,
    materials.researchWallParchment
  );
  const northWallEastPillar = createBox(
    'Wall_North_East_Corner_Pillar',
    0.72,
    3.12,
    0.14,
    7.56,
    1.56,
    7.83,
    materials.researchWallParchment
  );
  const northCap = createBox(
    'Wall_North_TopCap',
    7.92,
    0.08,
    0.18,
    3.97,
    3.16,
    7.83,
    materials.wallCapDark
  );
  const northBaseboard = createBox(
    'Wall_North_Walnut_Baseboard',
    7.64,
    0.1,
    0.03,
    3.98,
    0.05,
    7.745,
    materials.darkWalnutWood
  );
  const northWainscotRail = createBox(
    'Wall_North_Wainscot_Chair_Rail',
    4.65,
    0.045,
    0.035,
    2.5,
    0.92,
    7.742,
    materials.darkWalnutWood
  );
  groups.WALLS.add(
    northWallWestBay,
    northWallLowerE,
    northWallUpperE,
    northWallEastPillar,
    northCap,
    northBaseboard,
    northWainscotRail
  );
  northWallNodes.push(
    northWallWestBay,
    northWallLowerE,
    northWallUpperE,
    northWallEastPillar,
    northCap,
    northBaseboard,
    northWainscotRail
  );

  // North-East Tall Study Window Assembly (X = 4.90..7.20, Y = 0.88..2.46, Z = 7.83)
  const northWindowGroup = new THREE.Group();
  northWindowGroup.name = 'Research_Daylight_Windows';
  const nwVista = createBox(
    'North_Study_Window_Daylight_Backdrop',
    2.22,
    1.5,
    0.02,
    6.05,
    1.67,
    7.88,
    materials.windowVista
  );
  const nwGlass = createBox(
    'North_Study_Window_Glass_Pane',
    2.2,
    1.48,
    0.02,
    6.05,
    1.67,
    7.82,
    materials.windowGlass
  );
  const nwSill = createBox(
    'North_Study_Window_Walnut_Sill',
    2.42,
    0.06,
    0.24,
    6.05,
    0.89,
    7.81,
    materials.darkWalnutWood
  );
  const nwHeader = createBox(
    'North_Study_Window_Walnut_Header',
    2.42,
    0.06,
    0.22,
    6.05,
    2.45,
    7.82,
    materials.darkWalnutWood
  );
  const nwFrameL = createBox(
    'North_Study_Window_Jamb_West',
    0.07,
    1.5,
    0.2,
    4.935,
    1.67,
    7.82,
    materials.windowFrameCream
  );
  const nwFrameR = createBox(
    'North_Study_Window_Jamb_East',
    0.07,
    1.5,
    0.2,
    7.165,
    1.67,
    7.82,
    materials.windowFrameCream
  );
  const nwMullion1 = createBox(
    'North_Study_Window_Mullion_W',
    0.045,
    1.48,
    0.08,
    5.68,
    1.67,
    7.81,
    materials.windowFrameCream
  );
  const nwMullion2 = createBox(
    'North_Study_Window_Mullion_E',
    0.045,
    1.48,
    0.08,
    6.42,
    1.67,
    7.81,
    materials.windowFrameCream
  );
  const nwTransom = createBox(
    'North_Study_Window_Horizontal_Transom',
    2.18,
    0.045,
    0.08,
    6.05,
    1.95,
    7.81,
    materials.windowFrameCream
  );
  northWindowGroup.add(
    nwVista,
    nwGlass,
    nwSill,
    nwHeader,
    nwFrameL,
    nwFrameR,
    nwMullion1,
    nwMullion2,
    nwTransom
  );
  northWallNodes.push(
    nwVista,
    nwGlass,
    nwSill,
    nwHeader,
    nwFrameL,
    nwFrameR,
    nwMullion1,
    nwMullion2,
    nwTransom
  );

  // --- WEST WALL (X = 0.17, thickness 0.14): Solid South bay (Evidence Board) + Cozy Reading Window (Z = 3.25..4.15) + Solid North bay (Archive Library) ---
  const westWallSouthSeg = createBox(
    'Wall_West_South_Evidence_Segment',
    0.14,
    3.12,
    3.01,
    0.17,
    1.56,
    1.745,
    materials.researchWallParchment
  );
  const westWallWinLower = createBox(
    'Wall_West_Window_Lower_Segment',
    0.14,
    1.02,
    0.9,
    0.17,
    0.51,
    3.7,
    materials.researchWallParchment
  );
  const westWallWinUpper = createBox(
    'Wall_West_Window_Upper_Segment',
    0.14,
    0.72,
    0.9,
    0.17,
    2.76,
    3.7,
    materials.researchWallParchment
  );
  const westWallNorthSeg = createBox(
    'Wall_West_North_Archive_Segment',
    0.14,
    3.12,
    3.61,
    0.17,
    1.56,
    5.955,
    materials.researchWallParchment
  );
  const westCap = createBox(
    'Wall_West_TopCap',
    0.18,
    0.08,
    7.52,
    0.17,
    3.16,
    4.0,
    materials.wallCapDark
  );
  const westBaseboard = createBox(
    'Wall_West_Walnut_Baseboard',
    0.03,
    0.1,
    7.48,
    0.255,
    0.05,
    4.0,
    materials.darkWalnutWood
  );
  groups.WALLS.add(
    westWallSouthSeg,
    westWallWinLower,
    westWallWinUpper,
    westWallNorthSeg,
    westCap,
    westBaseboard
  );
  westWallNodes.push(
    westWallSouthSeg,
    westWallWinLower,
    westWallWinUpper,
    westWallNorthSeg,
    westCap,
    westBaseboard
  );

  // West Reading Window (X = 0.17, Y = 1.02..2.40, Z = 3.25..4.15)
  const wwVista = createBox(
    'West_Reading_Window_Daylight_Backdrop',
    0.02,
    1.34,
    0.84,
    0.12,
    1.71,
    3.7,
    materials.windowVista
  );
  const wwGlass = createBox(
    'West_Reading_Window_Glass_Pane',
    0.02,
    1.32,
    0.82,
    0.18,
    1.71,
    3.7,
    materials.windowGlass
  );
  const wwSill = createBox(
    'West_Reading_Window_Walnut_Sill',
    0.22,
    0.05,
    0.96,
    0.19,
    1.03,
    3.7,
    materials.darkWalnutWood
  );
  const wwHeader = createBox(
    'West_Reading_Window_Walnut_Header',
    0.22,
    0.05,
    0.96,
    0.19,
    2.39,
    3.7,
    materials.darkWalnutWood
  );
  const wwMullion = createBox(
    'West_Reading_Window_Horizontal_Mullion',
    0.07,
    0.04,
    0.84,
    0.19,
    1.75,
    3.7,
    materials.windowFrameCream
  );
  northWindowGroup.add(wwVista, wwGlass, wwSill, wwHeader, wwMullion);
  westWallNodes.push(wwVista, wwGlass, wwSill, wwHeader, wwMullion);
  groups.WINDOWS.add(northWindowGroup);
  furnitureNodes.set('Research_Daylight_Windows', northWindowGroup);

  // --- EAST & SOUTH OPEN-FRONT CUTAWAY CURBS (0.18u high for unobstructed South-East isometric view, inset to X <= 7.95) ---
  const eastCutawayCurb = createBox(
    'Wall_East_Cutaway_Curb',
    0.08,
    0.18,
    7.68,
    7.9,
    0.09,
    4.0,
    materials.darkWalnutWood,
    { category: 'WALLS', wallSide: 'EAST' }
  );
  const southCutawayW = createBox(
    'Wall_South_Cutaway_West',
    2.88,
    0.18,
    0.08,
    1.54,
    0.09,
    0.06,
    materials.darkWalnutWood,
    { category: 'WALLS', wallSide: 'SOUTH' }
  );
  const southCutawayE = createBox(
    'Wall_South_Cutaway_East',
    2.86,
    0.18,
    0.08,
    6.47,
    0.09,
    0.06,
    materials.darkWalnutWood,
    { category: 'WALLS', wallSide: 'SOUTH' }
  );
  groups.WALLS.add(eastCutawayCurb, southCutawayW, southCutawayE);
  eastWallNodes.push(eastCutawayCurb);
  southWallNodes.push(southCutawayW, southCutawayE);

  // =========================================================================
  // 3. CONNECTORS (RESEARCH_SOUTH_CORRIDOR at [4, 0, 0])
  // =========================================================================
  const southConnector = new THREE.Group();
  southConnector.name = 'CONNECTOR_RESEARCH_SOUTH';
  southConnector.position.set(4.0, 0.0, 0.0);
  southConnector.userData = {
    connectorSpec: RESEARCH_CONNECTORS_SPEC[0],
  };

  const southThreshold = createBox(
    'Research_Connector_South_Removable_Threshold',
    2.0,
    0.024,
    0.14,
    0.0,
    0.012,
    0.07,
    materials.brushedBrass,
    { category: 'CONNECTORS', connectorId: 'CONNECTOR_RESEARCH_SOUTH', removable: true }
  );
  const southJambW = createBox(
    'Connector_South_Walnut_Pillar_W',
    0.12,
    0.34,
    0.12,
    -1.02,
    0.17,
    0.07,
    materials.darkWalnutWood
  );
  const southJambE = createBox(
    'Connector_South_Walnut_Pillar_E',
    0.12,
    0.34,
    0.12,
    1.02,
    0.17,
    0.07,
    materials.darkWalnutWood
  );
  const southMatBase = createBox(
    'Connector_South_Welcome_Mat_Base',
    1.56,
    0.014,
    0.58,
    0.0,
    0.007,
    0.52,
    materials.wallCapDark
  );
  const southMatInlay = createBox(
    'Connector_South_Welcome_Mat_Inlay',
    1.4,
    0.01,
    0.44,
    0.0,
    0.019,
    0.52,
    materials.researchForestBook
  );
  southConnector.add(
    southThreshold,
    southJambW,
    southJambE,
    southMatBase,
    southMatInlay
  );
  groups.CONNECTORS.add(southConnector);
  southWallNodes.push(southJambW, southJambE);
  furnitureNodes.set('CONNECTOR_RESEARCH_SOUTH', southConnector);

  // =========================================================================
  // 4. ZONE A — KNOWLEDGE ARCHIVE LIBRARY & CARD CATALOG (North-West / West Bay)
  // =========================================================================
  // 4A. Tall Multi-Bay Knowledge Archive Library Bookcase (X = 0.54, Z = 6.05, W=0.52, H=2.48, D=2.55)
  const archiveLibraryGroup = new THREE.Group();
  archiveLibraryGroup.name = 'Research_Knowledge_Archive_Library';
  archiveLibraryGroup.position.set(0.54, 0.0, 6.05);

  const libShadow = createBox(
    'Archive_Library_Contact_Shadow',
    0.58,
    0.004,
    2.62,
    0.02,
    0.002,
    0.0,
    materials.contactShadow
  );
  // Back panel & outer walnut carcase
  const libBack = createBox(
    'Archive_Library_Back_Panel',
    0.05,
    2.44,
    2.52,
    -0.23,
    1.22,
    0.0,
    materials.espressoWood
  );
  const libSideS = createBox(
    'Archive_Library_Gable_South',
    0.48,
    2.44,
    0.06,
    0.0,
    1.22,
    -1.24,
    materials.darkWalnutWood
  );
  const libSideN = createBox(
    'Archive_Library_Gable_North',
    0.48,
    2.44,
    0.06,
    0.0,
    1.22,
    1.24,
    materials.darkWalnutWood
  );
  const libDivider1 = createBox(
    'Archive_Library_Vertical_Divider_1',
    0.44,
    2.36,
    0.05,
    -0.01,
    1.2,
    -0.42,
    materials.darkWalnutWood
  );
  const libDivider2 = createBox(
    'Archive_Library_Vertical_Divider_2',
    0.44,
    2.36,
    0.05,
    -0.01,
    1.2,
    0.42,
    materials.darkWalnutWood
  );
  const libCrown = createBox(
    'Archive_Library_Crown_Cornice',
    0.54,
    0.08,
    2.6,
    0.02,
    2.44,
    0.0,
    materials.darkWalnutWood
  );
  const libBrassRail = createBox(
    'Archive_Library_Brass_Ladder_Rail',
    0.025,
    0.025,
    2.48,
    0.26,
    2.06,
    0.0,
    materials.brushedBrass
  );
  archiveLibraryGroup.add(
    libShadow,
    libBack,
    libSideS,
    libSideN,
    libDivider1,
    libDivider2,
    libCrown,
    libBrassRail
  );

  // Lower base cabinet doors (recessed non-coplanar fronts in muted sage)
  const bayCentersZ = [-0.83, 0.0, 0.83];
  bayCentersZ.forEach((bz, bIdx) => {
    const baseBox = createBox(
      `Archive_Library_Base_Cabinet_Bay_${bIdx + 1}`,
      0.44,
      0.48,
      0.76,
      -0.01,
      0.24,
      bz,
      materials.darkWalnutWood
    );
    const doorFront = createBox(
      `Archive_Library_Sage_Door_Bay_${bIdx + 1}`,
      0.025,
      0.38,
      0.68,
      0.225,
      0.25,
      bz,
      materials.uiuxMutedSage
    );
    const brassPull = createBox(
      `Archive_Library_Door_Brass_Pull_${bIdx + 1}`,
      0.02,
      0.03,
      0.12,
      0.248,
      0.36,
      bz,
      materials.brushedBrass
    );
    archiveLibraryGroup.add(baseBox, doorFront, brassPull);
  });

  // 4 Staggered horizontal shelves above base cabinet (Y = 0.50, 0.96, 1.44, 1.92)
  const shelfHeights = [0.5, 0.96, 1.44, 1.92];
  shelfHeights.forEach((sy, sIdx) => {
    const shelf = createBox(
      `Archive_Library_Shelf_${sIdx + 1}`,
      0.46,
      0.04,
      2.42,
      0.0,
      sy,
      0.0,
      materials.warmOakWood
    );
    archiveLibraryGroup.add(shelf);
  });

  // Curated scholarly book clusters, archival boxes, and terrestrial globe across the 3 bays
  const bookMaterials = [
    materials.researchBurgundyBook,
    materials.researchForestBook,
    materials.researchNavyBook,
    materials.warmOakWood,
    materials.paperCream,
    materials.uiuxSoftTeal,
    materials.brushedBrass,
  ];

  // Populate shelves with varied vertical books, horizontal stacks, and labeled archival boxes
  shelfHeights.forEach((sy, sIdx) => {
    bayCentersZ.forEach((bz, bIdx) => {
      if (sIdx === 2 && bIdx === 1) {
        // Center bay middle shelf: Miniature Brass & Teal Terrestrial Globe + Reference Binder
        const globeBase = createBox(
          'Archive_Terrestrial_Globe_Brass_Base',
          0.14,
          0.03,
          0.14,
          0.04,
          sy + 0.035,
          bz - 0.12,
          materials.brushedBrass
        );
        const globeArc = createBox(
          'Archive_Terrestrial_Globe_Meridian_Arc',
          0.03,
          0.24,
          0.2,
          0.04,
          sy + 0.17,
          bz - 0.12,
          materials.brushedBrass
        );
        const globeSphere = createBox(
          'Archive_Terrestrial_Globe_Orb',
          0.16,
          0.16,
          0.16,
          0.04,
          sy + 0.17,
          bz - 0.12,
          materials.uiuxSoftTeal
        );
        const archiveBox = createBox(
          'Archive_Indexed_Folio_Box_Center',
          0.26,
          0.22,
          0.26,
          0.02,
          sy + 0.13,
          bz + 0.18,
          materials.researchBurgundyBook
        );
        const archiveLabel = createBox(
          'Archive_Indexed_Folio_Label_Center',
          0.015,
          0.08,
          0.14,
          0.158,
          sy + 0.15,
          bz + 0.18,
          materials.paperCream
        );
        archiveLibraryGroup.add(globeBase, globeArc, globeSphere, archiveBox, archiveLabel);
      } else if ((sIdx + bIdx) % 3 === 0) {
        // Labeled Archival Boxes + Vertical Book Row
        const box1 = createBox(
          `Archive_Storage_Box_${sIdx}_${bIdx}_A`,
          0.28,
          0.24,
          0.28,
          0.01,
          sy + 0.14,
          bz - 0.18,
          materials.uiuxOffWhiteSurface
        );
        const label1 = createBox(
          `Archive_Storage_Label_${sIdx}_${bIdx}_A`,
          0.015,
          0.07,
          0.14,
          0.158,
          sy + 0.16,
          bz - 0.18,
          materials.brushedBrass
        );
        archiveLibraryGroup.add(box1, label1);
        for (let k = 0; k < 4; k++) {
          const bh = 0.24 + ((k + sIdx) % 3) * 0.04;
          const bMat = bookMaterials[(sIdx * 3 + bIdx + k) % bookMaterials.length];
          const book = createBox(
            `Archive_Volume_${sIdx}_${bIdx}_${k}`,
            0.24,
            bh,
            0.055,
            0.02,
            sy + 0.02 + bh / 2,
            bz + 0.04 + k * 0.07,
            bMat
          );
          archiveLibraryGroup.add(book);
        }
      } else {
        // Varied vertical scholarly volumes + horizontal stack
        for (let k = 0; k < 6; k++) {
          const bh = 0.23 + ((k * 2 + bIdx) % 4) * 0.035;
          const bMat = bookMaterials[(sIdx * 5 + bIdx * 2 + k) % bookMaterials.length];
          const book = createBox(
            `Archive_Book_${sIdx}_${bIdx}_${k}`,
            0.24,
            bh,
            0.058,
            0.02 + (k % 2) * 0.01,
            sy + 0.02 + bh / 2,
            bz - 0.28 + k * 0.072,
            bMat
          );
          archiveLibraryGroup.add(book);
        }
        // Horizontal stacked tomes on North side of bay
        const hBook1 = createBox(
          `Archive_HStack_${sIdx}_${bIdx}_1`,
          0.24,
          0.05,
          0.2,
          0.02,
          sy + 0.045,
          bz + 0.22,
          materials.researchNavyBook
        );
        const hBook2 = createBox(
          `Archive_HStack_${sIdx}_${bIdx}_2`,
          0.22,
          0.045,
          0.18,
          0.02,
          sy + 0.095,
          bz + 0.22,
          materials.paperCream
        );
        archiveLibraryGroup.add(hBook1, hBook2);
      }
    });
  });

  groups.FURNITURE.add(archiveLibraryGroup);
  furnitureNodes.set('Research_Knowledge_Archive_Library', archiveLibraryGroup);

  // 4B. Card Catalog & Index Drawer Console (X = 0.54, Z = 4.35, W=0.52, H=1.18, D=0.86)
  const catalogCabinetGroup = new THREE.Group();
  catalogCabinetGroup.name = 'Research_Archive_Catalog_Cabinet';
  catalogCabinetGroup.position.set(0.54, 0.0, 4.35);

  const catShadow = createBox(
    'Catalog_Cabinet_Contact_Shadow',
    0.56,
    0.004,
    0.92,
    0.02,
    0.002,
    0.0,
    materials.contactShadow
  );
  const catCarcase = createBox(
    'Catalog_Cabinet_Walnut_Body',
    0.48,
    1.04,
    0.84,
    0.0,
    0.56,
    0.0,
    materials.darkWalnutWood
  );
  const catTop = createBox(
    'Catalog_Cabinet_Oak_Countertop',
    0.52,
    0.05,
    0.88,
    0.01,
    1.105,
    0.0,
    materials.warmOakWood
  );
  catalogCabinetGroup.add(catShadow, catCarcase, catTop);

  // 9 Non-coplanar recessed card-catalog drawers (3 rows × 3 columns) with brass label holders
  const rowY = [0.26, 0.56, 0.86];
  const colZ = [-0.25, 0.0, 0.25];
  rowY.forEach((ry, rIdx) => {
    colZ.forEach((cz, cIdx) => {
      const drawerFront = createBox(
        `Catalog_Index_Drawer_${rIdx + 1}_${cIdx + 1}`,
        0.025,
        0.22,
        0.21,
        0.252,
        ry,
        cz,
        materials.warmOakWood
      );
      const labelHolder = createBox(
        `Catalog_Drawer_Brass_Frame_${rIdx + 1}_${cIdx + 1}`,
        0.016,
        0.06,
        0.09,
        0.272,
        ry + 0.02,
        cz,
        materials.brushedBrass
      );
      const labelCard = createBox(
        `Catalog_Drawer_Index_Card_${rIdx + 1}_${cIdx + 1}`,
        0.01,
        0.04,
        0.07,
        0.282,
        ry + 0.02,
        cz,
        materials.paperCream
      );
      catalogCabinetGroup.add(drawerFront, labelHolder, labelCard);
    });
  });

  // Top sorting tray & vintage brass reading lamp on the Card Catalog Console
  const sortingTray = createBox(
    'Catalog_Top_Index_Sorting_Box',
    0.26,
    0.08,
    0.34,
    0.02,
    1.17,
    -0.16,
    materials.espressoWood
  );
  const sortingCards = createBox(
    'Catalog_Top_Index_Cards_Fan',
    0.2,
    0.09,
    0.26,
    0.02,
    1.2,
    -0.16,
    materials.paperCream
  );
  const catLampBase = createBox(
    'Catalog_Archival_Lamp_Base',
    0.14,
    0.03,
    0.14,
    0.0,
    1.145,
    0.24,
    materials.brushedBrass
  );
  const catLampStem = createBox(
    'Catalog_Archival_Lamp_Stem',
    0.03,
    0.24,
    0.03,
    0.0,
    1.28,
    0.24,
    materials.brushedBrass
  );
  const catLampShade = createBox(
    'Catalog_Archival_Lamp_Green_Shade',
    0.18,
    0.09,
    0.22,
    0.04,
    1.41,
    0.24,
    materials.researchForestBook
  );
  catalogCabinetGroup.add(sortingTray, sortingCards, catLampBase, catLampStem, catLampShade);
  groups.FURNITURE.add(catalogCabinetGroup);
  furnitureNodes.set('Research_Archive_Catalog_Cabinet', catalogCabinetGroup);

  // =========================================================================
  // 5. ZONE B — RESEARCH PROFESSOR WORKSTATION & SCHOLAR CHAIR (North-East Daylight Corner)
  // =========================================================================
  // 5A. Research Professor Study Desk at [5.65, 0, 5.75] (W=1.90, H=0.76, D=0.88)
  const workstationGroup = new THREE.Group();
  workstationGroup.name = 'Research_Professor_Workstation';
  workstationGroup.position.set(5.65, 0.0, 5.75);

  const deskShadow = createBox(
    'Professor_Desk_Contact_Shadow',
    1.96,
    0.004,
    0.94,
    0.0,
    0.002,
    0.0,
    materials.contactShadow
  );
  const deskTop = createBox(
    'Professor_Desk_Oak_Tabletop',
    1.9,
    0.06,
    0.88,
    0.0,
    0.73,
    0.0,
    materials.warmOakWood
  );
  const deskInlayMat = createBox(
    'Professor_Desk_Leather_Blotter_Pad',
    0.86,
    0.01,
    0.46,
    0.0,
    0.765,
    -0.14,
    materials.researchCognacLeather
  );
  // Left & Right Walnut Drawer Pedestals
  const deskPedestalW = createBox(
    'Professor_Desk_Pedestal_West',
    0.44,
    0.68,
    0.8,
    -0.68,
    0.34,
    0.0,
    materials.darkWalnutWood
  );
  const deskPedestalE = createBox(
    'Professor_Desk_Pedestal_East',
    0.44,
    0.68,
    0.8,
    0.68,
    0.34,
    0.0,
    materials.darkWalnutWood
  );
  const deskModestyPanel = createBox(
    'Professor_Desk_Modesty_Panel',
    0.96,
    0.46,
    0.04,
    0.0,
    0.44,
    0.34,
    materials.darkWalnutWood
  );
  workstationGroup.add(
    deskShadow,
    deskTop,
    deskInlayMat,
    deskPedestalW,
    deskPedestalE,
    deskModestyPanel
  );

  // Recessed non-coplanar drawer fronts facing South (-Z, toward chair)
  [-0.68, 0.68].forEach((px, pIdx) => {
    [0.22, 0.48].forEach((dy, dIdx) => {
      const dFront = createBox(
        `Professor_Desk_Drawer_Front_${pIdx + 1}_${dIdx + 1}`,
        0.36,
        0.2,
        0.02,
        px,
        dy,
        -0.41,
        materials.warmOakWood
      );
      const dPull = createBox(
        `Professor_Desk_Drawer_Brass_Pull_${pIdx + 1}_${dIdx + 1}`,
        0.12,
        0.025,
        0.02,
        px,
        dy + 0.02,
        -0.428,
        materials.brushedBrass
      );
      workstationGroup.add(dFront, dPull);
    });
  });

  // Primary Widescreen Research Monitor (centered at X=0, Z=+0.26 -> room [5.65, 1.07, 6.01])
  // Faces South (-Z, rotation.y = Math.PI) toward the Professor Chair at [5.65, 0, 4.78]!
  const monitorStandBase = createBox(
    'Research_Primary_Monitor_Stand_Base',
    0.28,
    0.02,
    0.2,
    0.0,
    0.77,
    0.28,
    materials.darkMetal
  );
  const monitorStandNeck = createBox(
    'Research_Primary_Monitor_Stand_Neck',
    0.06,
    0.24,
    0.05,
    0.0,
    0.89,
    0.31,
    materials.darkMetal
  );
  const monitorRearCasing = createBox(
    'Research_Primary_Monitor_Rear_Casing',
    0.8,
    0.44,
    0.04,
    0.0,
    1.07,
    0.28,
    materials.ceoCharcoalCase
  );
  const monitorBrassTrim = createBox(
    'Research_Primary_Monitor_Bottom_Chin',
    0.8,
    0.025,
    0.044,
    0.0,
    0.855,
    0.28,
    materials.brushedBrass
  );

  // Single front-facing non-mirrored screen plane facing South (-Z, rotation.y = Math.PI)
  const monitorScreenGeo = new THREE.PlaneGeometry(0.76, 0.4);
  const monitorScreenMesh = new THREE.Mesh(monitorScreenGeo, materials.researchMonitorScreen);
  monitorScreenMesh.name = 'Research_Primary_Monitor_Screen';
  // Rear casing South face is at Z = 0.28 - 0.02 = 0.26. Place screen at Z = 0.256 (room Z = 6.006)
  monitorScreenMesh.position.set(0.0, 1.075, 0.256);
  monitorScreenMesh.rotation.y = Math.PI;
  monitorScreenMesh.userData = {
    displaySlotId: 'RESEARCH_DISPLAY_SOURCE_INDEX',
    demoOnly: true,
    normalDirection: [0, 0, -1],
  };
  workstationGroup.add(
    monitorStandBase,
    monitorStandNeck,
    monitorRearCasing,
    monitorBrassTrim,
    monitorScreenMesh
  );
  displaySlotNodes.set('RESEARCH_DISPLAY_SOURCE_INDEX', monitorScreenMesh);

  // Compact Keyboard & Precision Mouse in front of monitor
  const keyboard = createBox(
    'Professor_Desk_Mechanical_Keyboard',
    0.34,
    0.018,
    0.13,
    -0.04,
    0.778,
    -0.08,
    materials.ceoCharcoalCase
  );
  const mouse = createBox(
    'Professor_Desk_Wireless_Mouse',
    0.06,
    0.018,
    0.09,
    0.22,
    0.778,
    -0.08,
    materials.ceoCharcoalCase
  );
  workstationGroup.add(keyboard, mouse);

  // Secondary Reference Tablet on angled stand (West side of desk, X = -0.56, Z = 0.04)
  const tabletStandGroup = new THREE.Group();
  tabletStandGroup.name = 'Research_Reference_Tablet_Assembly';
  tabletStandGroup.position.set(-0.56, 0.77, 0.04);
  tabletStandGroup.rotation.y = 0.28; // Angled slightly toward center chair

  const tabletCasing = createBox(
    'Research_Reference_Tablet_Casing',
    0.3,
    0.022,
    0.22,
    0.0,
    0.02,
    0.0,
    materials.darkMetal
  );
  const tabletScreenGeo = new THREE.PlaneGeometry(0.27, 0.19);
  const tabletScreenMesh = new THREE.Mesh(tabletScreenGeo, materials.researchReferenceTablet);
  tabletScreenMesh.name = 'Research_Reference_Tablet_Screen';
  tabletScreenMesh.position.set(0.0, 0.033, 0.0);
  tabletScreenMesh.rotation.x = -Math.PI / 2;
  tabletScreenMesh.rotation.z = Math.PI; // Readable from South chair looking North
  tabletScreenMesh.userData = {
    demoOnly: true,
  };
  tabletStandGroup.add(tabletCasing, tabletScreenMesh);
  workstationGroup.add(tabletStandGroup);

  // Angled Wooden Reading Stand with Open Manuscript + Stacked Reference Books + Brass Desk Lamp (East side of desk)
  const readingStandBase = createBox(
    'Professor_Desk_Manuscript_Stand_Base',
    0.32,
    0.06,
    0.24,
    0.58,
    0.79,
    0.06,
    materials.darkWalnutWood
  );
  const openManuscriptL = createBox(
    'Professor_Desk_Open_Manuscript_Page_L',
    0.14,
    0.015,
    0.2,
    0.5,
    0.828,
    0.06,
    materials.paperCream
  );
  const openManuscriptR = createBox(
    'Professor_Desk_Open_Manuscript_Page_R',
    0.14,
    0.015,
    0.2,
    0.66,
    0.828,
    0.06,
    materials.paperCream
  );
  const openNotebook = createBox(
    'Professor_Desk_Research_Notebook',
    0.24,
    0.016,
    0.18,
    -0.46,
    0.776,
    -0.24,
    materials.paperCream
  );
  const deskBookStack1 = createBox(
    'Professor_Desk_Reference_Stack_Bottom',
    0.24,
    0.045,
    0.18,
    -0.72,
    0.782,
    0.24,
    materials.researchBurgundyBook
  );
  const deskBookStack2 = createBox(
    'Professor_Desk_Reference_Stack_Top',
    0.22,
    0.04,
    0.16,
    -0.72,
    0.825,
    0.24,
    materials.researchForestBook
  );
  // Brass Banker Desk Lamp & Pen Caddy on North-East desk corner
  const deskLampBase = createBox(
    'Professor_Desk_Brass_Lamp_Base',
    0.14,
    0.03,
    0.14,
    0.74,
    0.775,
    0.28,
    materials.brushedBrass
  );
  const deskLampArm = createBox(
    'Professor_Desk_Brass_Lamp_Arm',
    0.03,
    0.28,
    0.03,
    0.74,
    0.92,
    0.28,
    materials.brushedBrass
  );
  const deskLampShade = createBox(
    'Professor_Desk_Brass_Lamp_Shade',
    0.2,
    0.08,
    0.14,
    0.68,
    1.06,
    0.24,
    materials.lampShadeWarm
  );
  const penCaddy = createBox(
    'Professor_Desk_Walnut_Pen_Caddy',
    0.07,
    0.09,
    0.07,
    0.42,
    0.805,
    0.26,
    materials.darkWalnutWood
  );
  workstationGroup.add(
    readingStandBase,
    openManuscriptL,
    openManuscriptR,
    openNotebook,
    deskBookStack1,
    deskBookStack2,
    deskLampBase,
    deskLampArm,
    deskLampShade,
    penCaddy
  );

  groups.FURNITURE.add(workstationGroup);
  furnitureNodes.set('Research_Professor_Workstation', workstationGroup);

  // 5B. Professor Upholstered Scholar Chair at [5.65, 0, 4.78] (facing North +Z toward desk & monitor)
  const scholarChairGroup = new THREE.Group();
  scholarChairGroup.name = 'Research_Scholar_Chair';
  scholarChairGroup.position.set(5.65, 0.0, 4.78);

  const chairShadow = createBox(
    'Scholar_Chair_Contact_Shadow',
    0.64,
    0.004,
    0.64,
    0.0,
    0.002,
    0.0,
    materials.contactShadow
  );
  const chairBaseCross1 = createBox(
    'Scholar_Chair_Walnut_Base_NS',
    0.1,
    0.05,
    0.54,
    0.0,
    0.04,
    0.0,
    materials.darkWalnutWood
  );
  const chairBaseCross2 = createBox(
    'Scholar_Chair_Walnut_Base_EW',
    0.54,
    0.05,
    0.1,
    0.0,
    0.04,
    0.0,
    materials.darkWalnutWood
  );
  const chairCylinder = createBox(
    'Scholar_Chair_Brass_Column',
    0.08,
    0.36,
    0.08,
    0.0,
    0.24,
    0.0,
    materials.brushedBrass
  );
  const chairSeat = createBox(
    'Scholar_Chair_Cognac_Leather_Seat',
    0.56,
    0.09,
    0.52,
    0.0,
    0.46,
    0.0,
    materials.researchCognacLeather
  );
  // Backrest on South side (-Z) so the chair faces North (+Z) toward the workstation
  const chairBackrest = createBox(
    'Scholar_Chair_Tufted_Leather_Backrest',
    0.54,
    0.54,
    0.09,
    0.0,
    0.76,
    -0.23,
    materials.researchCognacLeather
  );
  const chairWalnutFrameBack = createBox(
    'Scholar_Chair_Walnut_Back_Spine',
    0.58,
    0.58,
    0.03,
    0.0,
    0.76,
    -0.285,
    materials.darkWalnutWood
  );
  const chairArmW = createBox(
    'Scholar_Chair_Walnut_Armrest_W',
    0.06,
    0.2,
    0.42,
    -0.28,
    0.58,
    -0.02,
    materials.darkWalnutWood
  );
  const chairArmE = createBox(
    'Scholar_Chair_Walnut_Armrest_E',
    0.06,
    0.2,
    0.42,
    0.28,
    0.58,
    -0.02,
    materials.darkWalnutWood
  );
  scholarChairGroup.add(
    chairShadow,
    chairBaseCross1,
    chairBaseCross2,
    chairCylinder,
    chairSeat,
    chairBackrest,
    chairWalnutFrameBack,
    chairArmW,
    chairArmE
  );
  groups.FURNITURE.add(scholarChairGroup);
  furnitureNodes.set('Research_Scholar_Chair', scholarChairGroup);

  // =========================================================================
  // 6. ZONE C — SHARED BRAIN KNOWLEDGE ATLAS WALL (North Feature Wall, X=2.95, Y=1.68, Z=7.68)
  //    Signature element of Module 05 — 100% visible in default isometric view!
  // =========================================================================
  const sharedBrainAtlasGroup = new THREE.Group();
  sharedBrainAtlasGroup.name = 'Research_Shared_Brain_Atlas';
  sharedBrainAtlasGroup.position.set(2.95, 1.68, 7.68);

  // Outer Walnut & Brushed Brass Architectural Frame (W=2.68, H=1.56, D=0.07)
  const atlasBackingFrame = createBox(
    'Shared_Brain_Atlas_Walnut_Frame',
    2.68,
    1.56,
    0.06,
    0.0,
    0.0,
    0.0,
    materials.darkWalnutWood
  );
  const atlasBrassInnerTrimTop = createBox(
    'Shared_Brain_Atlas_Brass_Trim_Top',
    2.58,
    0.035,
    0.075,
    0.0,
    0.73,
    -0.005,
    materials.brushedBrass
  );
  const atlasBrassInnerTrimBot = createBox(
    'Shared_Brain_Atlas_Brass_Trim_Bottom',
    2.58,
    0.035,
    0.075,
    0.0,
    -0.73,
    -0.005,
    materials.brushedBrass
  );
  const atlasCreatorTray = createBox(
    'Shared_Brain_Atlas_Lower_Marker_Ledge',
    2.4,
    0.04,
    0.12,
    0.0,
    -0.76,
    -0.05,
    materials.warmOakWood
  );
  sharedBrainAtlasGroup.add(
    atlasBackingFrame,
    atlasBrassInnerTrimTop,
    atlasBrassInnerTrimBot,
    atlasCreatorTray
  );

  // Master Canvas Plane (slot_id: RESEARCH_DISPLAY_KNOWLEDGE_ATLAS) facing South (-Z, rotation.y = Math.PI)
  const atlasCanvasGeo = new THREE.PlaneGeometry(2.52, 1.4);
  const atlasCanvasMesh = new THREE.Mesh(atlasCanvasGeo, materials.researchKnowledgeAtlas);
  atlasCanvasMesh.name = 'Research_Knowledge_Atlas_Canvas';
  atlasCanvasMesh.position.set(0.0, 0.0, -0.035); // Room Z = 7.645
  atlasCanvasMesh.rotation.y = Math.PI;
  atlasCanvasMesh.userData = {
    displaySlotId: 'RESEARCH_DISPLAY_KNOWLEDGE_ATLAS',
    demoOnly: true,
    normalDirection: [0, 0, -1],
  };
  sharedBrainAtlasGroup.add(atlasCanvasMesh);
  displaySlotNodes.set('RESEARCH_DISPLAY_KNOWLEDGE_ATLAS', atlasCanvasMesh);

  // Central 3D Knowledge Core Hub Medallion at the heart of the Atlas
  const coreMedallionRing = createBox(
    'Shared_Brain_Central_Core_Brass_Node',
    0.26,
    0.26,
    0.03,
    0.0,
    -0.22,
    -0.052,
    materials.brushedBrass
  );
  const coreMedallionInner = createBox(
    'Shared_Brain_Central_Core_Teal_Gem',
    0.18,
    0.18,
    0.036,
    0.0,
    -0.22,
    -0.056,
    materials.uiuxSoftTeal
  );
  sharedBrainAtlasGroup.add(coreMedallionRing, coreMedallionInner);

  // 3 Raised 3D Shared Brain Layer Panels (ORG BRAIN, PROJECT BRAIN, AGENT WORKING CONTEXT)
  const layerConfigs: Array<{
    slotId: 'RESEARCH_DISPLAY_ORG_BRAIN' | 'RESEARCH_DISPLAY_PROJECT_BRAIN' | 'RESEARCH_DISPLAY_AGENT_CONTEXT';
    meshName: string;
    backingName: string;
    localX: number;
    localY: number;
    mat: THREE.Material;
    frameMat: THREE.Material;
  }> = [
    {
      slotId: 'RESEARCH_DISPLAY_ORG_BRAIN',
      meshName: 'Research_Atlas_Panel_Org_Brain',
      backingName: 'Shared_Brain_Layer_Backing_Org_Brain',
      localX: -0.87,
      localY: 0.14,
      mat: materials.researchAtlasOrgPanel,
      frameMat: materials.engBackendNavy,
    },
    {
      slotId: 'RESEARCH_DISPLAY_PROJECT_BRAIN',
      meshName: 'Research_Atlas_Panel_Project_Brain',
      backingName: 'Shared_Brain_Layer_Backing_Project_Brain',
      localX: 0.0,
      localY: 0.14,
      mat: materials.researchAtlasProjectPanel,
      frameMat: materials.engDatabaseTeal,
    },
    {
      slotId: 'RESEARCH_DISPLAY_AGENT_CONTEXT',
      meshName: 'Research_Atlas_Panel_Agent_Context',
      backingName: 'Shared_Brain_Layer_Backing_Agent_Context',
      localX: 0.87,
      localY: 0.14,
      mat: materials.researchAtlasAgentPanel,
      frameMat: materials.brushedBrass,
    },
  ];

  layerConfigs.forEach((lc) => {
    const panelBacking = createBox(
      lc.backingName,
      0.72,
      0.52,
      0.024,
      lc.localX,
      lc.localY,
      -0.048,
      lc.frameMat
    );
    const panelGeo = new THREE.PlaneGeometry(0.68, 0.48);
    const panelMesh = new THREE.Mesh(panelGeo, lc.mat);
    panelMesh.name = lc.meshName;
    panelMesh.position.set(lc.localX, lc.localY, -0.064); // Distinct non-coplanar offset in front of backing
    panelMesh.rotation.y = Math.PI;
    panelMesh.userData = {
      displaySlotId: lc.slotId,
      demoOnly: true,
      normalDirection: [0, 0, -1],
    };
    sharedBrainAtlasGroup.add(panelBacking, panelMesh);
    displaySlotNodes.set(lc.slotId, panelMesh);
  });

  // Overhead Brass Picture Lights illuminating the Shared Brain Knowledge Atlas
  [-0.75, 0.75].forEach((lx, idx) => {
    const picArm = createBox(
      `Shared_Brain_Atlas_Light_Arm_${idx + 1}`,
      0.04,
      0.04,
      0.18,
      lx,
      0.84,
      -0.08,
      materials.brushedBrass
    );
    const picHood = createBox(
      `Shared_Brain_Atlas_Light_Hood_${idx + 1}`,
      0.42,
      0.045,
      0.08,
      lx,
      0.83,
      -0.16,
      materials.lampShadeWarm
    );
    sharedBrainAtlasGroup.add(picArm, picHood);
  });

  groups.DECORATION.add(sharedBrainAtlasGroup);
  furnitureNodes.set('Research_Shared_Brain_Atlas', sharedBrainAtlasGroup);

  // =========================================================================
  // 7. ZONE D — EVIDENCE & READING CORNER (South-West Study Table + West Evidence Board)
  // =========================================================================
  // 7A. Octagonal Evidence & Reading Table Set at [1.75, 0, 2.15]
  const readingTableGroup = new THREE.Group();
  readingTableGroup.name = 'Research_Evidence_Reading_Table';
  readingTableGroup.position.set(1.75, 0.0, 2.15);

  const rtShadow = createBox(
    'Reading_Table_Contact_Shadow',
    1.16,
    0.004,
    1.16,
    0.0,
    0.002,
    0.0,
    materials.contactShadow
  );
  // Octagonal tabletop crafted from two intersecting bevel-proportioned slabs at non-coplanar Y + central brass inlay
  const rtTopMain = createBox(
    'Reading_Table_Walnut_Top_Primary',
    0.98,
    0.05,
    0.98,
    0.0,
    0.715,
    0.0,
    materials.darkWalnutWood
  );
  const rtTopCross = createBox(
    'Reading_Table_Oak_Inlay_Center',
    0.68,
    0.012,
    0.68,
    0.0,
    0.746,
    0.0,
    materials.warmOakWood
  );
  const rtPedestal = createBox(
    'Reading_Table_Fluted_Walnut_Pedestal',
    0.26,
    0.64,
    0.26,
    0.0,
    0.35,
    0.0,
    materials.darkWalnutWood
  );
  const rtBaseFoot = createBox(
    'Reading_Table_Brass_Plinth_Foot',
    0.58,
    0.05,
    0.58,
    0.0,
    0.025,
    0.0,
    materials.brushedBrass
  );
  // Open Source-Comparison Folio, Magnifying Glass & Document Tray on the Reading Table
  const rtFolioW = createBox(
    'Reading_Table_Open_Evidence_Folio_W',
    0.22,
    0.018,
    0.28,
    -0.14,
    0.761,
    -0.06,
    materials.paperCream
  );
  const rtFolioE = createBox(
    'Reading_Table_Open_Evidence_Folio_E',
    0.22,
    0.018,
    0.28,
    0.1,
    0.761,
    -0.06,
    materials.paperCream
  );
  const rtMagnifierRing = createBox(
    'Reading_Table_Brass_Magnifying_Glass_Lens',
    0.09,
    0.014,
    0.09,
    0.18,
    0.762,
    0.18,
    materials.brushedBrass
  );
  const rtMagnifierHandle = createBox(
    'Reading_Table_Brass_Magnifying_Glass_Handle',
    0.025,
    0.012,
    0.1,
    0.24,
    0.762,
    0.24,
    materials.espressoWood
  );
  const rtDocTray = createBox(
    'Reading_Table_Indexed_Citation_Tray',
    0.24,
    0.045,
    0.18,
    -0.2,
    0.774,
    0.22,
    materials.researchForestBook
  );
  readingTableGroup.add(
    rtShadow,
    rtTopMain,
    rtTopCross,
    rtPedestal,
    rtBaseFoot,
    rtFolioW,
    rtFolioE,
    rtMagnifierRing,
    rtMagnifierHandle,
    rtDocTray
  );

  // Two Upholstered Study Chairs (East Chair at +0.72 X for RESEARCH_READING_TABLE anchor, North Chair at +0.72 Z)
  const studyChairPositions: Array<{ name: string; x: number; z: number; rotY: number }> = [
    { name: 'East', x: 0.72, z: 0.0, rotY: -Math.PI / 2 },
    { name: 'North', x: 0.0, z: 0.72, rotY: Math.PI },
  ];
  studyChairPositions.forEach((sc) => {
    const chairSub = new THREE.Group();
    chairSub.name = `Reading_Table_Study_Chair_${sc.name}`;
    chairSub.position.set(sc.x, 0.0, sc.z);
    chairSub.rotation.y = sc.rotY;

    const cSeat = createBox(
      `Study_Chair_${sc.name}_Sage_Seat`,
      0.44,
      0.07,
      0.44,
      0.0,
      0.44,
      0.0,
      materials.uiuxMutedSage
    );
    const cBack = createBox(
      `Study_Chair_${sc.name}_Walnut_Back`,
      0.42,
      0.34,
      0.05,
      0.0,
      0.64,
      -0.19,
      materials.darkWalnutWood
    );
    const cLegFL = createBox(
      `Study_Chair_${sc.name}_Leg_FL`,
      0.05,
      0.41,
      0.05,
      -0.17,
      0.205,
      0.17,
      materials.darkWalnutWood
    );
    const cLegFR = createBox(
      `Study_Chair_${sc.name}_Leg_FR`,
      0.05,
      0.41,
      0.05,
      0.17,
      0.205,
      0.17,
      materials.darkWalnutWood
    );
    const cLegBL = createBox(
      `Study_Chair_${sc.name}_Leg_BL`,
      0.05,
      0.41,
      0.05,
      -0.17,
      0.205,
      -0.17,
      materials.darkWalnutWood
    );
    const cLegBR = createBox(
      `Study_Chair_${sc.name}_Leg_BR`,
      0.05,
      0.41,
      0.05,
      0.17,
      0.205,
      -0.17,
      materials.darkWalnutWood
    );
    chairSub.add(cSeat, cBack, cLegFL, cLegFR, cLegBL, cLegBR);
    readingTableGroup.add(chairSub);
  });

  groups.FURNITURE.add(readingTableGroup);
  furnitureNodes.set('Research_Evidence_Reading_Table', readingTableGroup);

  // 7B. West-Wall Evidence & Source Verification Pinboard at [0.30, 1.58, 2.15]
  const evidenceBoardGroup = new THREE.Group();
  evidenceBoardGroup.name = 'Research_Evidence_Board';
  evidenceBoardGroup.position.set(0.3, 1.58, 2.15);

  const ebFrame = createBox(
    'Evidence_Board_Walnut_Frame',
    0.06,
    1.18,
    1.72,
    0.0,
    0.0,
    0.0,
    materials.darkWalnutWood
  );
  const ebLedge = createBox(
    'Evidence_Board_Lower_Tray',
    0.1,
    0.04,
    1.56,
    0.04,
    -0.59,
    0.0,
    materials.warmOakWood
  );
  // Single East-facing non-mirrored canvas plane (slot_id: RESEARCH_DISPLAY_EVIDENCE_STATUS)
  const ebCanvasGeo = new THREE.PlaneGeometry(1.58, 1.04);
  const ebCanvasMesh = new THREE.Mesh(ebCanvasGeo, materials.researchEvidenceBoard);
  ebCanvasMesh.name = 'Research_Evidence_Board_Canvas';
  ebCanvasMesh.position.set(0.036, 0.0, 0.0); // Room X = 0.336, clear of frame at X=0.33
  ebCanvasMesh.rotation.y = Math.PI / 2; // Facing East (+X) into the room
  ebCanvasMesh.userData = {
    displaySlotId: 'RESEARCH_DISPLAY_EVIDENCE_STATUS',
    demoOnly: true,
    normalDirection: [1, 0, 0],
  };

  // 3D Pinned Evidence Index Cards for tactile pixel-art depth
  const ebCard1 = createBox(
    'Evidence_Board_3D_Source_Card_North',
    0.012,
    0.22,
    0.34,
    0.046,
    0.22,
    0.46,
    materials.paperCream
  );
  const ebCard2 = createBox(
    'Evidence_Board_3D_Source_Card_Center',
    0.012,
    0.24,
    0.36,
    0.046,
    -0.14,
    0.0,
    materials.noteAmber
  );
  const ebCard3 = createBox(
    'Evidence_Board_3D_Source_Card_South',
    0.012,
    0.22,
    0.34,
    0.046,
    0.2,
    -0.46,
    materials.noteSage
  );
  evidenceBoardGroup.add(ebFrame, ebLedge, ebCanvasMesh, ebCard1, ebCard2, ebCard3);
  groups.DECORATION.add(evidenceBoardGroup);
  furnitureNodes.set('Research_Evidence_Board', evidenceBoardGroup);
  displaySlotNodes.set('RESEARCH_DISPLAY_EVIDENCE_STATUS', ebCanvasMesh);

  // =========================================================================
  // 8. EAST REFERENCE CREDENZA, ATELIER RUG & SCHOLARLY DECOR
  // =========================================================================
  // 8A. East Reference Folio & Specimen Credenza at [7.28, 0, 2.65] (W=0.54, H=0.88, D=1.76)
  const credenzaGroup = new THREE.Group();
  credenzaGroup.name = 'Research_Reference_Credenza';
  credenzaGroup.position.set(7.28, 0.0, 2.65);

  const credShadow = createBox(
    'Reference_Credenza_Contact_Shadow',
    0.58,
    0.004,
    1.82,
    -0.01,
    0.002,
    0.0,
    materials.contactShadow
  );
  const credBody = createBox(
    'Reference_Credenza_Walnut_Body',
    0.5,
    0.82,
    1.72,
    0.0,
    0.43,
    0.0,
    materials.darkWalnutWood
  );
  const credTop = createBox(
    'Reference_Credenza_Oak_Top',
    0.54,
    0.05,
    1.76,
    -0.01,
    0.865,
    0.0,
    materials.warmOakWood
  );
  // Non-coplanar sliding doors facing West (-X)
  [-0.42, 0.42].forEach((cz, idx) => {
    const cDoor = createBox(
      `Reference_Credenza_Sage_Door_${idx + 1}`,
      0.022,
      0.66,
      0.76,
      -0.262,
      0.43,
      cz,
      materials.uiuxMutedSage
    );
    const cHandle = createBox(
      `Reference_Credenza_Brass_Pull_${idx + 1}`,
      0.018,
      0.14,
      0.025,
      -0.282,
      0.45,
      cz + (idx === 0 ? 0.26 : -0.26),
      materials.brushedBrass
    );
    credenzaGroup.add(cDoor, cHandle);
  });
  // Bound Encyclopedias & Archival Display Case on top of Credenza
  const encycRow = createBox(
    'Reference_Credenza_Encyclopedia_Set',
    0.26,
    0.26,
    0.52,
    0.02,
    1.02,
    -0.44,
    materials.researchNavyBook
  );
  const specimenCaseBase = createBox(
    'Reference_Credenza_Specimen_Folio_Base',
    0.32,
    0.06,
    0.46,
    0.0,
    0.92,
    0.34,
    materials.espressoWood
  );
  const specimenCaseGlass = createBox(
    'Reference_Credenza_Specimen_Glass_Cover',
    0.28,
    0.12,
    0.42,
    0.0,
    1.01,
    0.34,
    materials.windowGlass
  );
  credenzaGroup.add(
    credShadow,
    credBody,
    credTop,
    encycRow,
    specimenCaseBase,
    specimenCaseGlass
  );
  groups.FURNITURE.add(credenzaGroup);
  furnitureNodes.set('Research_Reference_Credenza', credenzaGroup);

  // 8B. Woven Knowledge Atelier Library Rug at [3.65, 0.004, 3.85]
  const atelierRug = createBox(
    'Research_Atelier_Rug',
    5.2,
    0.008,
    4.9,
    3.65,
    0.004,
    3.85,
    materials.researchAtelierRug
  );
  groups.DECORATION.add(atelierRug);
  furnitureNodes.set('Research_Atelier_Rug', atelierRug);

  // 8C. Curated Scholarly Props & Greenery (2 Indoor Plants, Framed Botanical/Architectural Print, Analog Library Clock)
  const northCornerPlanter = new THREE.Group();
  northCornerPlanter.name = 'Research_Corner_Plant_NE';
  northCornerPlanter.position.set(7.25, 0.0, 7.15);
  northCornerPlanter.add(
    createBox('NE_Planter_Terracotta_Pot', 0.42, 0.38, 0.42, 0, 0.19, 0, materials.terracottaPot),
    createBox('NE_Planter_Foliage_Lower', 0.36, 0.42, 0.36, 0, 0.59, 0, materials.plantFoliageDark),
    createBox('NE_Planter_Foliage_Upper', 0.26, 0.34, 0.26, 0, 0.97, 0, materials.plantFoliageBright)
  );

  const southWestPlanter = new THREE.Group();
  southWestPlanter.name = 'Research_Entry_Plant_SW';
  southWestPlanter.position.set(0.65, 0.0, 0.68);
  southWestPlanter.add(
    createBox('SW_Planter_Ceramic_Pot', 0.36, 0.34, 0.36, 0, 0.17, 0, materials.ceramicCream),
    createBox('SW_Planter_Foliage_Mid', 0.32, 0.38, 0.32, 0, 0.53, 0, materials.plantFoliageMid),
    createBox('SW_Planter_Foliage_Top', 0.22, 0.26, 0.22, 0, 0.85, 0, materials.plantFoliageBright)
  );

  // Analog Brass Library Wall Clock on North Wall between Atlas and Study Window (X = 4.58, Y = 2.42, Z = 7.74)
  const libraryClockGroup = new THREE.Group();
  libraryClockGroup.name = 'Research_Library_Wall_Clock';
  libraryClockGroup.position.set(4.58, 2.42, 7.74);
  libraryClockGroup.add(
    createBox('Library_Clock_Brass_Bezel', 0.34, 0.34, 0.04, 0, 0, 0, materials.brushedBrass),
    createBox('Library_Clock_Dial_Face', 0.26, 0.26, 0.02, 0, 0, -0.025, materials.paperCream),
    createBox('Library_Clock_Hour_Hand', 0.02, 0.09, 0.01, 0, 0.03, -0.04, materials.darkMetal),
    createBox('Library_Clock_Minute_Hand', 0.08, 0.02, 0.01, 0.03, 0, -0.04, materials.darkMetal)
  );

  groups.PROPS.add(northCornerPlanter, southWestPlanter, libraryClockGroup);

  // =========================================================================
  // 9. PREVIEW HELPERS GROUP (Strictly separated from ROOM_RESEARCH_ROOT for clean GLB export)
  // =========================================================================
  const helpersGroup = new THREE.Group();
  helpersGroup.name = 'RESEARCH_PREVIEW_HELPERS';

  const anchorMarkerMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const anchorArrowMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });

  for (const anchor of DEFAULT_RESEARCH_ANCHORS) {
    const markerGroup = new THREE.Group();
    markerGroup.name = `Helper_Anchor_${anchor.id}`;
    markerGroup.position.set(...anchor.position);
    markerGroup.rotation.y = anchor.rotationY;

    const ring = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.22, 16), anchorMarkerMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.015;

    const arrow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.24), anchorArrowMat);
    arrow.position.set(0, 0.02, 0.14);

    markerGroup.add(ring, arrow);
    helpersGroup.add(markerGroup);
  }

  // Tag all catalog furniture/prop groups with userData.catalogId for interactive raycasting
  furnitureNodes.forEach((node, catalogId) => {
    node.userData.catalogId = catalogId;
    node.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.userData.catalogId = catalogId;
      }
    });
  });

  // Compute geometry & material statistics
  let meshCount = 0;
  let triangleCount = 0;
  const matSet = new Set<THREE.Material>();

  roomRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh;
      meshCount++;
      const geo = m.geometry;
      if (geo.index) {
        triangleCount += geo.index.count / 3;
      } else if (geo.attributes.position) {
        triangleCount += geo.attributes.position.count / 3;
      }
      if (Array.isArray(m.material)) {
        m.material.forEach((mt) => matSet.add(mt));
      } else if (m.material) {
        matSet.add(m.material);
      }
    }
  });

  // Tag display slot metadata on roomRoot userData for validation & runtime inspection
  roomRoot.userData = {
    moduleId: RESEARCH_MODULE_CONSTANTS.MODULE_ID,
    assetId: RESEARCH_MODULE_CONSTANTS.ASSET_ID,
    displaySlots: RESEARCH_DISPLAY_SLOTS.map((s) => s.slot_id),
    anchorsCount: DEFAULT_RESEARCH_ANCHORS.length,
  };

  return {
    roomRoot,
    groups,
    northWallNodes,
    westWallNodes,
    eastWallNodes,
    southWallNodes,
    furnitureNodes,
    catalogNodeMap: furnitureNodes,
    displaySlotNodes,
    helpersGroup,
    stats: {
      meshCount,
      triangleCount: Math.round(triangleCount),
      materialCount: matSet.size,
    },
  };
}
