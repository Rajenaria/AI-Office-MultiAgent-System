import * as THREE from 'three';
import {
  DEFAULT_ENGINEERING_ANCHORS,
  DEFAULT_ENGINEERING_ANCHOR_LIST,
  ENGINEERING_CONNECTORS_SPEC,
  ENGINEERING_MODULE_CONSTANTS,
  type EngineeringActivityAnchor,
  type EngineeringAnchorId,
} from '../domain/engineeringRoomSpec';
import type { MaterialLibraryInstance } from './PixelMaterialLibrary';

export interface BuiltEngineeringRoom {
  root: THREE.Group;
  engineeringRoot: THREE.Group;
  groups: Record<(typeof ENGINEERING_MODULE_CONSTANTS.REQUIRED_GROUPS)[number], THREE.Group>;
  furnitureSubgroups: Record<
    (typeof ENGINEERING_MODULE_CONSTANTS.SEMANTIC_FURNITURE_SUBGROUPS)[number],
    THREE.Group
  >;
  anchorVisuals: THREE.Group;
  southWallNodes: THREE.Object3D[];
  eastWallNodes: THREE.Object3D[];
  northWallNodes: THREE.Object3D[];
  westWallNodes: THREE.Object3D[];
  selectableFurniture: Map<string, THREE.Object3D>;
  catalogNodeMap: Map<string, THREE.Object3D>;
}

export type BuiltEngineeringRoomResult = BuiltEngineeringRoom;

function addBox(
  parent: THREE.Object3D,
  name: string,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  mat: THREE.Material,
  castShadow = true,
  receiveShadow = true
): THREE.Mesh {
  const geom = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);
  return mesh;
}

/**
 * Adds a non-flickering contact shadow quad slightly above the oak floor surface.
 * Uses y = 0.005 (5mm above oak floor Y = 0.000) and polygonOffset so it never
 * z-fights with the floor or 3D woven rugs (which span Y = 0.001..0.013).
 */
function addContactShadow(
  parent: THREE.Object3D,
  name: string,
  w: number,
  d: number,
  x: number,
  z: number,
  mat: THREE.Material,
  yOffset = 0.005
): THREE.Mesh {
  const geom = new THREE.PlaneGeometry(w, d);
  geom.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.position.set(x, yOffset, z);
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  mesh.renderOrder = 1;
  parent.add(mesh);
  return mesh;
}

/**
 * Builds a low-profile 3D woven area rug with stepped border trim so it never
 * z-fights with the floor (Y = 0.000) even after GLB export where polygonOffset
 * is stripped by the glTF specification.
 */
function addWovenZoneRug3D(
  parent: THREE.Object3D,
  namePrefix: string,
  w: number,
  d: number,
  x: number,
  z: number,
  rugMat: THREE.Material,
  trimMat: THREE.Material
): THREE.Group {
  const rugGroup = new THREE.Group();
  rugGroup.name = `${namePrefix}_Group`;
  rugGroup.position.set(x, 0, z);
  parent.add(rugGroup);

  // Main woven rug body: spans Y = 0.002..0.012 (strictly above oak floor Y = 0.000)
  const mainBody = addBox(
    rugGroup,
    namePrefix,
    w,
    0.01,
    d,
    0,
    0.007,
    0,
    rugMat,
    false,
    true
  );
  mainBody.renderOrder = 2;

  // Stepped outer binding rails (non-overlapping with mainBody)
  const railT = 0.035;
  const railH = 0.012;
  const railY = 0.008;
  addBox(
    rugGroup,
    `${namePrefix}_Border_North`,
    w + railT * 2,
    railH,
    railT,
    0,
    railY,
    d / 2 + railT / 2,
    trimMat,
    false,
    true
  );
  addBox(
    rugGroup,
    `${namePrefix}_Border_South`,
    w + railT * 2,
    railH,
    railT,
    0,
    railY,
    -(d / 2 + railT / 2),
    trimMat,
    false,
    true
  );
  addBox(
    rugGroup,
    `${namePrefix}_Border_West`,
    railT,
    railH,
    d,
    -(w / 2 + railT / 2),
    railY,
    0,
    trimMat,
    false,
    true
  );
  addBox(
    rugGroup,
    `${namePrefix}_Border_East`,
    railT,
    railH,
    d,
    w / 2 + railT / 2,
    railY,
    0,
    trimMat,
    false,
    true
  );

  return rugGroup;
}

/**
 * Builds a potted studio plant with stepped non-overlapping voxel foliage layers.
 */
function buildStudioPlant(
  parent: THREE.Object3D,
  namePrefix: string,
  x: number,
  y: number,
  z: number,
  scale: number,
  mats: Record<string, THREE.MeshStandardMaterial>
): THREE.Group {
  const group = new THREE.Group();
  group.name = `${namePrefix}_Group`;
  group.position.set(x, y, z);
  parent.add(group);

  const potW = 0.34 * scale;
  const potH = 0.34 * scale;
  addBox(group, `${namePrefix}_Pot`, potW, potH, potW, 0, potH / 2, 0, mats.terracottaPot);
  addBox(
    group,
    `${namePrefix}_Pot_Rim`,
    potW * 1.12,
    0.055 * scale,
    potW * 1.12,
    0,
    potH + 0.028 * scale,
    0,
    mats.terracottaPot
  );
  addBox(
    group,
    `${namePrefix}_Soil`,
    potW * 0.88,
    0.03 * scale,
    potW * 0.88,
    0,
    potH + 0.06 * scale,
    0,
    mats.floorSubbase
  );

  // Stepped voxel foliage clusters (strictly non-overlapping Y spans)
  addBox(
    group,
    `${namePrefix}_Foliage_Lower`,
    0.42 * scale,
    0.22 * scale,
    0.42 * scale,
    0,
    potH + 0.19 * scale,
    0,
    mats.plantFoliageDark
  );
  addBox(
    group,
    `${namePrefix}_Foliage_Mid`,
    0.34 * scale,
    0.22 * scale,
    0.34 * scale,
    0.03 * scale,
    potH + 0.42 * scale,
    -0.02 * scale,
    mats.plantFoliageMid
  );
  addBox(
    group,
    `${namePrefix}_Foliage_Top`,
    0.24 * scale,
    0.18 * scale,
    0.24 * scale,
    -0.03 * scale,
    potH + 0.63 * scale,
    0.03 * scale,
    mats.plantFoliageBright
  );

  return group;
}

/**
 * Builds a single-sided developer monitor assembly where:
 * 1. The assembly's local +Z axis points directly toward the seated developer chair.
 * 2. The front emissive screen (`PlaneGeometry` at `z = +0.006`) is separated by a full
 *    `14mm` (`0.014u`) from the opaque rear casing front face (`z = -0.008`),
 *    completely eliminating screen/casing z-fighting at all camera distances.
 * 3. Outer bezel rails wrap around the perimeter (`±screenWidth/2`, `±screenHeight/2`)
 *    without intersecting the active screen plane or sharing coplanar faces with the rear casing.
 * 4. The rear casing features stepped 3D hardware detailing (ventilated center backplate,
 *    recessed VESA mount bracket, cooling louver fins, and stand cable clip) so monitors
 *    viewed from the rear (such as the foreground Database workstation in South-East isometric
 *    view) look sleek, lower-profile, and intentionally crafted rather than a flat black slab.
 */
function buildOrientedMonitorAssembly(
  parent: THREE.Object3D,
  options: {
    groupName: string;
    screenMeshName: string;
    rearCasingMeshName: string;
    x: number;
    y: number;
    z: number;
    rotationY: number;
    screenWidth: number;
    screenHeight: number;
    standHeight?: number;
    screenMat: THREE.Material;
    casingMat: THREE.Material;
    metalMat: THREE.Material;
    accentMat: THREE.Material;
  }
): THREE.Group {
  const {
    groupName,
    screenMeshName,
    rearCasingMeshName,
    x,
    y,
    z,
    rotationY,
    screenWidth,
    screenHeight,
    standHeight = 0.085,
    screenMat,
    casingMat,
    metalMat,
    accentMat,
  } = options;

  const group = new THREE.Group();
  group.name = groupName;
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  parent.add(group);

  // Low-profile weighted metallic base & neck behind the screen (negative local Z)
  addBox(group, `${groupName}_Stand_Base`, 0.22, 0.014, 0.16, 0, 0.007, -0.048, metalMat);
  addBox(
    group,
    `${groupName}_Stand_Neck`,
    0.042,
    standHeight + 0.08,
    0.034,
    0,
    0.014 + (standHeight + 0.08) / 2,
    -0.058,
    metalMat
  );
  // Subtle accent cable-routing clip on the stand neck
  addBox(
    group,
    `${groupName}_Stand_Cable_Clip`,
    0.05,
    0.022,
    0.042,
    0,
    0.048,
    -0.058,
    accentMat
  );

  // Lower-profile display center height so foreground monitor backs never block desk props
  const centerH = standHeight + screenHeight / 2 + 0.008;
  const bezelT = 0.018;

  // Opaque rear casing shell: spans z = -0.036..-0.008 (front face at z = -0.008)
  const rearCasing = addBox(
    group,
    rearCasingMeshName,
    screenWidth + bezelT * 2,
    screenHeight + bezelT * 2,
    0.028,
    0,
    centerH,
    -0.022,
    casingMat
  );

  // Stepped rear center hardware housing (z = -0.048..-0.036)
  addBox(
    group,
    `${groupName}_Rear_Step_Plate`,
    screenWidth * 0.64,
    screenHeight * 0.56,
    0.012,
    0,
    centerH + 0.008,
    -0.042,
    metalMat
  );

  // Rear VESA mount hub & articulated arm joint (z = -0.060..-0.048)
  addBox(
    group,
    `${groupName}_Rear_VESA_Hub`,
    0.095,
    0.085,
    0.012,
    0,
    centerH,
    -0.054,
    casingMat
  );

  // Subtle zone-colored rear status trim bar along upper backplate
  addBox(
    group,
    `${groupName}_Rear_Accent_Trim`,
    screenWidth * 0.46,
    0.014,
    0.006,
    0,
    centerH + screenHeight * 0.18,
    -0.051,
    accentMat
  );

  // Non-overlapping outer bezel frame rails: span z = -0.008..+0.010
  // Placed strictly outside the active screen opening (screenWidth x screenHeight)
  addBox(
    group,
    `${groupName}_Bezel_Top`,
    screenWidth + bezelT * 2,
    bezelT,
    0.018,
    0,
    centerH + screenHeight / 2 + bezelT / 2,
    0.001,
    casingMat
  );
  addBox(
    group,
    `${groupName}_Bezel_Bottom`,
    screenWidth + bezelT * 2,
    bezelT + 0.006,
    0.018,
    0,
    centerH - screenHeight / 2 - (bezelT + 0.006) / 2,
    0.001,
    metalMat
  );
  addBox(
    group,
    `${groupName}_Bezel_Left`,
    bezelT,
    screenHeight,
    0.018,
    -(screenWidth / 2 + bezelT / 2),
    centerH,
    0.001,
    casingMat
  );
  addBox(
    group,
    `${groupName}_Bezel_Right`,
    bezelT,
    screenHeight,
    0.018,
    screenWidth / 2 + bezelT / 2,
    centerH,
    0.001,
    casingMat
  );

  // Single-sided emissive display plane facing +Z (toward the seated developer chair)
  // Positioned at z = +0.006 (14mm clear of rearCasing front face at z = -0.008)
  const screenGeom = new THREE.PlaneGeometry(screenWidth, screenHeight);
  const screenMesh = new THREE.Mesh(screenGeom, screenMat);
  screenMesh.name = screenMeshName;
  screenMesh.position.set(0, centerH, 0.006);
  screenMesh.castShadow = false;
  screenMesh.receiveShadow = false;
  screenMesh.userData.isMonitorScreen = true;
  rearCasing.userData.isMonitorRearCasing = true;
  group.add(screenMesh);

  return group;
}

/**
 * Builds an ergonomic developer task chair with a role-specific accent cushion.
 * Uses split Z-base legs so the 5-star caster base has zero self-intersecting boxes.
 */
function buildDeveloperChair(
  parent: THREE.Object3D,
  namePrefix: string,
  x: number,
  z: number,
  rotationY: number,
  accentMat: THREE.Material,
  mats: Record<string, THREE.MeshStandardMaterial>,
  selectableMap: Map<string, THREE.Object3D>,
  catalogId: string
): THREE.Group {
  const chairGroup = new THREE.Group();
  chairGroup.name = namePrefix;
  chairGroup.position.set(x, 0, z);
  chairGroup.rotation.y = rotationY;
  parent.add(chairGroup);
  selectableMap.set(catalogId, chairGroup);

  // Non-overlapping caster base cross + central hub
  addBox(chairGroup, `${namePrefix}_Base_X`, 0.52, 0.04, 0.07, 0, 0.05, 0, mats.darkMetal);
  addBox(
    chairGroup,
    `${namePrefix}_Base_Z_North`,
    0.07,
    0.04,
    0.225,
    0,
    0.05,
    0.1475,
    mats.darkMetal
  );
  addBox(
    chairGroup,
    `${namePrefix}_Base_Z_South`,
    0.07,
    0.04,
    0.225,
    0,
    0.05,
    -0.1475,
    mats.darkMetal
  );
  // Caster wheels at 4 corners (non-overlapping below base arms)
  for (const [cx, cz, tag] of [
    [-0.23, 0, 'W'],
    [0.23, 0, 'E'],
    [0, 0.23, 'N'],
    [0, -0.23, 'S'],
  ] as const) {
    addBox(
      chairGroup,
      `${namePrefix}_Caster_${tag}`,
      0.045,
      0.03,
      0.045,
      cx,
      0.015,
      cz,
      mats.ceoCharcoalCase
    );
  }

  addBox(chairGroup, `${namePrefix}_Cylinder`, 0.08, 0.35, 0.08, 0, 0.245, 0, mats.chromeSilver);

  // Seat cushion & under-frame (non-overlapping Y spans)
  addBox(
    chairGroup,
    `${namePrefix}_Seat_Frame`,
    0.5,
    0.04,
    0.48,
    0,
    0.44,
    0,
    mats.ceoCharcoalCase
  );
  addBox(
    chairGroup,
    `${namePrefix}_Seat_Cushion`,
    0.52,
    0.07,
    0.5,
    0,
    0.495,
    0,
    mats.chairSlateFabric
  );

  // Backrest Spine, Mesh Back, Lumbar Cushion, and Headrest (facing +Z when rotationY = 0)
  addBox(
    chairGroup,
    `${namePrefix}_Back_Spine`,
    0.07,
    0.46,
    0.05,
    0,
    0.72,
    -0.255,
    mats.darkMetal
  );
  addBox(
    chairGroup,
    `${namePrefix}_Backrest`,
    0.48,
    0.44,
    0.06,
    0,
    0.76,
    -0.2,
    mats.chairSlateFabric
  );
  addBox(
    chairGroup,
    `${namePrefix}_Lumbar_Accent`,
    0.38,
    0.13,
    0.035,
    0,
    0.65,
    -0.15,
    accentMat
  );
  addBox(
    chairGroup,
    `${namePrefix}_Headrest`,
    0.28,
    0.11,
    0.055,
    0,
    1.045,
    -0.2,
    mats.ceoCharcoalCase
  );

  // Armrests (positioned outside seat cushion width X = ±0.285)
  addBox(chairGroup, `${namePrefix}_Arm_L_Post`, 0.04, 0.19, 0.05, -0.285, 0.555, 0.02, mats.darkMetal);
  addBox(chairGroup, `${namePrefix}_Arm_R_Post`, 0.04, 0.19, 0.05, 0.285, 0.555, 0.02, mats.darkMetal);
  addBox(
    chairGroup,
    `${namePrefix}_Arm_L_Pad`,
    0.075,
    0.03,
    0.25,
    -0.285,
    0.665,
    0.02,
    mats.ceoCharcoalCase
  );
  addBox(
    chairGroup,
    `${namePrefix}_Arm_R_Pad`,
    0.075,
    0.03,
    0.25,
    0.285,
    0.665,
    0.02,
    mats.ceoCharcoalCase
  );

  return chairGroup;
}

/**
 * Helper to build a framed technical wall board where the outer metal frame bars wrap
 * around the backing plate and the printed board canvas sits +14mm in front of the
 * backing plate, preventing any coplanar z-fighting.
 */
function buildTechnicalWallBoard(
  parent: THREE.Object3D,
  namePrefix: string,
  boardWidth: number,
  boardHeight: number,
  centerY: number,
  boardMat: THREE.Material,
  frameMat: THREE.Material,
  trayAccentMat: THREE.Material
): THREE.Group {
  const boardGroup = new THREE.Group();
  boardGroup.name = `${namePrefix}_Assembly`;
  parent.add(boardGroup);

  const frameT = 0.035;
  // Solid backing plate: z = -0.020..+0.004
  addBox(
    boardGroup,
    `${namePrefix}_Backing`,
    boardWidth,
    boardHeight,
    0.024,
    0,
    centerY,
    -0.008,
    frameMat
  );

  // Outer perimeter frame rails: z = -0.020..+0.022 (strictly outside boardWidth x boardHeight)
  addBox(
    boardGroup,
    `${namePrefix}_Frame_Top`,
    boardWidth + frameT * 2,
    frameT,
    0.042,
    0,
    centerY + boardHeight / 2 + frameT / 2,
    0.001,
    frameMat
  );
  addBox(
    boardGroup,
    `${namePrefix}_Frame_Bottom`,
    boardWidth + frameT * 2,
    frameT,
    0.042,
    0,
    centerY - boardHeight / 2 - frameT / 2,
    0.001,
    frameMat
  );
  addBox(
    boardGroup,
    `${namePrefix}_Frame_Left`,
    frameT,
    boardHeight,
    0.042,
    -(boardWidth / 2 + frameT / 2),
    centerY,
    0.001,
    frameMat
  );
  addBox(
    boardGroup,
    `${namePrefix}_Frame_Right`,
    frameT,
    boardHeight,
    0.042,
    boardWidth / 2 + frameT / 2,
    centerY,
    0.001,
    frameMat
  );

  // Printed board surface plane at z = +0.018 (+14mm clear of backing front face z = +0.004)
  const surfGeom = new THREE.PlaneGeometry(boardWidth - 0.02, boardHeight - 0.02);
  const surfMesh = new THREE.Mesh(surfGeom, boardMat);
  surfMesh.name = `${namePrefix}_Surface`;
  surfMesh.position.set(0, centerY, 0.018);
  boardGroup.add(surfMesh);

  // Marker ledge & color-coded dry-erase markers below bottom frame
  const trayY = centerY - boardHeight / 2 - frameT - 0.016;
  addBox(
    boardGroup,
    `${namePrefix}_Marker_Tray`,
    boardWidth * 0.58,
    0.024,
    0.065,
    0,
    trayY,
    0.035,
    frameMat
  );
  addBox(
    boardGroup,
    `${namePrefix}_Marker_Accent`,
    0.11,
    0.016,
    0.02,
    -0.14,
    trayY + 0.02,
    0.042,
    trayAccentMat
  );
  addBox(
    boardGroup,
    `${namePrefix}_Eraser_Block`,
    0.09,
    0.022,
    0.032,
    0.14,
    trayY + 0.023,
    0.042,
     frameMat
  );

  return boardGroup;
}

/**
 * Builds the complete `8 × 16 × 3.2` Engineering & Development Studio (`AI_OFFICE_ROOM_ENGINEERING_v1`)
 * with Visual Polish V1.1 and zero-flicker non-coplanar geometry across all 4 zones:
 *   - Zone A (North, `Z ≈ 12..16`): Frontend Developer Workstation
 *   - Zone B (Upper-Middle, `Z ≈ 8..12`): Backend Developer Workstation
 *   - Zone C (Lower-Middle, `Z ≈ 5..8`): Shared Integration & Code Review Hub
 *   - Zone D (South, `Z ≈ 0..5`): Database Developer Workstation
 */
export function buildEngineeringRoom(lib: MaterialLibraryInstance): BuiltEngineeringRoom {
  const mats = lib.materials;
  const W = ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_WIDTH; // 8.0
  const D = ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_DEPTH; // 16.0
  const wallH = ENGINEERING_MODULE_CONSTANTS.WALL_HEIGHT; // 3.2
  const wallT = ENGINEERING_MODULE_CONSTANTS.WALL_THICKNESS; // 0.16
  const floorT = ENGINEERING_MODULE_CONSTANTS.FLOOR_THICKNESS; // 0.16

  const root = new THREE.Group();
  root.name = ENGINEERING_MODULE_CONSTANTS.ROOT_NODE_NAME;
  root.position.set(0, 0, 0);

  const groups = {} as Record<
    (typeof ENGINEERING_MODULE_CONSTANTS.REQUIRED_GROUPS)[number],
    THREE.Group
  >;
  for (const gName of ENGINEERING_MODULE_CONSTANTS.REQUIRED_GROUPS) {
    const grp = new THREE.Group();
    grp.name = gName;
    root.add(grp);
    groups[gName] = grp;
  }

  const furnitureSubgroups = {} as Record<
    (typeof ENGINEERING_MODULE_CONSTANTS.SEMANTIC_FURNITURE_SUBGROUPS)[number],
    THREE.Group
  >;
  for (const subName of ENGINEERING_MODULE_CONSTANTS.SEMANTIC_FURNITURE_SUBGROUPS) {
    const subGrp = new THREE.Group();
    subGrp.name = subName;
    groups.FURNITURE.add(subGrp);
    furnitureSubgroups[subName] = subGrp;
  }

  const southWallNodes: THREE.Object3D[] = [];
  const eastWallNodes: THREE.Object3D[] = [];
  const northWallNodes: THREE.Object3D[] = [];
  const westWallNodes: THREE.Object3D[] = [];
  const selectableFurniture = new Map<string, THREE.Object3D>();

  // ==========================================================================
  // 1. CONTINUOUS 8×16 FLOOR SLAB, WALKWAY INLAY, & 3D WOVEN ZONE RUGS
  // ==========================================================================
  // Subbase spans Y = -0.16..-0.04; Oak floor spans Y = -0.04..0.000 (zero overlap)
  addBox(
    groups.FLOOR,
    'Engineering_Floor_Subbase_8x16',
    W,
    floorT - 0.04,
    D,
    W / 2,
    -(floorT + 0.04) / 2,
    D / 2,
    mats.floorSubbase,
    false,
    true
  );

  addBox(
    groups.FLOOR,
    'Engineering_Floor_Warm_Oak_Surface',
    W - 0.04,
    0.04,
    D - 0.04,
    W / 2,
    -0.02,
    D / 2,
    mats.oakFloor,
    false,
    true
  );

  // Subtle East circulation walkway border inlay: spans Y = 0.002..0.008 (strictly above Y = 0.000)
  addBox(
    groups.FLOOR,
    'Engineering_Floor_Walkway_Inlay',
    0.06,
    0.006,
    14.4,
    5.22,
    0.005,
    8.0,
    mats.woodTrim,
    false,
    true
  );

  // 3D Low-Profile Woven Rugs for all 4 zones (zero coplanar PlaneGeometry flicker)
  // Zone A Frontend Under-Desk Woven Mat
  addWovenZoneRug3D(
    groups.DECORATION,
    'Engineering_Frontend_Zone_Rug',
    2.45,
    1.75,
    2.35,
    13.45,
    mats.engFrontendRug,
    mats.woodTrim
  );

  // Zone B Backend Under-Desk Woven Mat
  addWovenZoneRug3D(
    groups.DECORATION,
    'Engineering_Backend_Zone_Rug',
    2.45,
    1.75,
    2.35,
    9.75,
    mats.engBackendRug,
    mats.engBackendSteel
  );

  // Zone C Shared Integration & Code Review Hub Runner Rug
  addWovenZoneRug3D(
    groups.DECORATION,
    'Engineering_Integration_Area_Rug',
    2.85,
    2.45,
    3.15,
    6.35,
    mats.engStudioRug,
    mats.darkMetal
  );

  // Zone D Database Under-Desk Woven Mat
  addWovenZoneRug3D(
    groups.DECORATION,
    'Engineering_Database_Zone_Rug',
    2.45,
    1.75,
    2.35,
    2.65,
    mats.engDatabaseRug,
    mats.engDatabaseEmerald
  );

  // ==========================================================================
  // 2. ARCHITECTURAL WALL SHELL & WINDOWS (8×16 CONTINUOUS, ZERO WALL AT Z=8)
  // ==========================================================================
  // TopCap spans Y = 3.14..3.20; main wall sections span Y = 0.00..3.14 (zero overlap)
  const wallBodyH = wallH - 0.06; // 3.14u

  // --- WEST EXTERIOR WALL (X = 0..0.16, Z = 0..16) with 3 Tall Daylight Windows ---
  const win1Z0 = 1.6;
  const win1Z1 = 3.6;
  const win2Z0 = 7.0;
  const win2Z1 = 9.2;
  const win3Z0 = 12.2;
  const win3Z1 = 14.2;
  const sillY = 0.88;
  const headY = 2.36;

  const westPiers: Array<[string, number, number]> = [
    ['South_Corner', 0.0, win1Z0],
    ['Lower_Mid_Pier', win1Z1, win2Z0],
    ['Upper_Mid_Pier', win2Z1, win3Z0],
    ['North_Corner', win3Z1, D],
  ];
  for (const [label, z0, z1] of westPiers) {
    const segLen = z1 - z0;
    const zMid = (z0 + z1) / 2;
    const pier = addBox(
      groups.WALLS,
      `Engineering_Wall_West_${label}`,
      wallT,
      wallBodyH,
      segLen,
      wallT / 2,
      wallBodyH / 2,
      zMid,
      mats.warmWall
    );
    westWallNodes.push(pier);
  }

  for (const [idx, z0, z1] of [
    [1, win1Z0, win1Z1],
    [2, win2Z0, win2Z1],
    [3, win3Z0, win3Z1],
  ] as const) {
    const winW = z1 - z0;
    const zMid = (z0 + z1) / 2;

    const spandrel = addBox(
      groups.WALLS,
      `Engineering_Wall_West_Spandrel_${idx}`,
      wallT,
      sillY,
      winW,
      wallT / 2,
      sillY / 2,
      zMid,
      mats.warmWall
    );
    const header = addBox(
      groups.WALLS,
      `Engineering_Wall_West_Header_${idx}`,
      wallT,
      wallBodyH - headY,
      winW,
      wallT / 2,
      headY + (wallBodyH - headY) / 2,
      zMid,
      mats.warmWall
    );
    westWallNodes.push(spandrel, header);

    // Non-overlapping Window Frame, Mullions, Vista, & Glass
    const winH = headY - sillY;
    const winY = sillY + winH / 2;
    const sillT = 0.06;
    const headFrameT = 0.05;
    const innerH = winH - sillT - headFrameT;
    const innerY = sillY + sillT + innerH / 2;

    const frameTop = addBox(
      groups.WINDOWS,
      `Engineering_West_Win_${idx}_Frame_Top`,
      wallT + 0.04,
      headFrameT,
      winW,
      wallT / 2,
      headY - headFrameT / 2,
      zMid,
      mats.windowFrameCream
    );
    const frameSill = addBox(
      groups.WINDOWS,
      `Engineering_West_Win_${idx}_Sill`,
      wallT + 0.08,
      sillT,
      winW + 0.08,
      wallT / 2 + 0.02,
      sillY + sillT / 2,
      zMid,
      mats.warmOakWood
    );
    const frameSouth = addBox(
      groups.WINDOWS,
      `Engineering_West_Win_${idx}_Jamb_S`,
      wallT + 0.03,
      innerH,
      0.05,
      wallT / 2,
      innerY,
      z0 + 0.025,
      mats.windowFrameCream
    );
    const frameNorth = addBox(
      groups.WINDOWS,
      `Engineering_West_Win_${idx}_Jamb_N`,
      wallT + 0.03,
      innerH,
      0.05,
      wallT / 2,
      innerY,
      z1 - 0.025,
      mats.windowFrameCream
    );
    // Mullion_V is deeper in X (0.11u) while Mullion_H is narrower in X (0.07u) so they never share coplanar faces
    const mullionV = addBox(
      groups.WINDOWS,
      `Engineering_West_Win_${idx}_Mullion_V`,
      0.11,
      innerH,
      0.04,
      0.085,
      innerY,
      zMid,
      mats.windowFrameCream
    );
    const mullionH = addBox(
      groups.WINDOWS,
      `Engineering_West_Win_${idx}_Mullion_H`,
      0.07,
      0.04,
      winW - 0.1,
      0.085,
      innerY,
      zMid,
      mats.windowFrameCream
    );
    // Vista sits on exterior side (x = 0.022), Glass sits on interior side (x = 0.148)
    const vista = addBox(
      groups.WINDOWS,
      `Engineering_West_Win_${idx}_Vista`,
      0.016,
      innerH - 0.02,
      winW - 0.1,
      0.022,
      innerY,
      zMid,
      mats.windowVista,
      false,
      false
    );
    const glass = addBox(
      groups.WINDOWS,
      `Engineering_West_Win_${idx}_Glass`,
      0.012,
      innerH - 0.02,
      winW - 0.1,
      0.148,
      innerY,
      zMid,
      mats.windowGlass,
      false,
      false
    );

    // Subtle upper window blind valence box (adds cozy architectural craftsmanship)
    const valence = addBox(
      groups.WINDOWS,
      `Engineering_West_Win_${idx}_Valence`,
      0.06,
      0.09,
      winW - 0.04,
      wallT + 0.03,
      headY - 0.05,
      zMid,
      mats.warmOakWood
    );

    westWallNodes.push(
      frameTop,
      frameSill,
      frameSouth,
      frameNorth,
      mullionV,
      mullionH,
      vista,
      glass,
      valence
    );
  }

  // West Wall Top Cap & Baseboard (strictly non-overlapping with West wall piers)
  const westTopCap = addBox(
    groups.WALLS,
    'Engineering_Wall_West_TopCap',
    wallT + 0.02,
    0.06,
    D,
    wallT / 2,
    wallH - 0.03,
    D / 2,
    mats.wallCapDark
  );
  const westBaseboard = addBox(
    groups.WALLS,
    'Engineering_Wall_West_Baseboard',
    0.03,
    0.1,
    D - 0.32,
    wallT + 0.015,
    0.05,
    D / 2,
    mats.woodTrim
  );
  westWallNodes.push(westTopCap, westBaseboard);

  // --- NORTH WALL (Z = 15.84..16.0, X = 0.16..7.84) with Corridor Doorway at X = 3.0..5.0 ---
  const northDoorX0 = ENGINEERING_CONNECTORS_SPEC.ENGINEERING_NORTH_CORRIDOR.span[0]; // 3.0
  const northDoorX1 = ENGINEERING_CONNECTORS_SPEC.ENGINEERING_NORTH_CORRIDOR.span[1]; // 5.0
  const northDoorH = ENGINEERING_CONNECTORS_SPEC.ENGINEERING_NORTH_CORRIDOR.height; // 2.3

  const northWestSeg = addBox(
    groups.WALLS,
    'Engineering_Wall_North_West_Section',
    northDoorX0 - wallT,
    wallBodyH,
    wallT,
    wallT + (northDoorX0 - wallT) / 2,
    wallBodyH / 2,
    D - wallT / 2,
    mats.warmWall
  );
  const northEastSeg = addBox(
    groups.WALLS,
    'Engineering_Wall_North_East_Section',
    W - wallT - northDoorX1,
    wallBodyH,
    wallT,
    northDoorX1 + (W - wallT - northDoorX1) / 2,
    wallBodyH / 2,
    D - wallT / 2,
    mats.warmWall
  );
  const northHeader = addBox(
    groups.WALLS,
    'Engineering_Wall_North_Doorway_Header',
    northDoorX1 - northDoorX0,
    wallBodyH - northDoorH,
    wallT,
    (northDoorX0 + northDoorX1) / 2,
    northDoorH + (wallBodyH - northDoorH) / 2,
    D - wallT / 2,
    mats.warmWall
  );
  const northTopCap = addBox(
    groups.WALLS,
    'Engineering_Wall_North_TopCap',
    W - wallT * 2,
    0.06,
    wallT + 0.02,
    W / 2,
    wallH - 0.03,
    D - wallT / 2,
    mats.wallCapDark
  );
  const northJambW = addBox(
    groups.CONNECTORS,
    'Engineering_North_Corridor_Jamb_West',
    0.06,
    northDoorH,
    wallT + 0.04,
    northDoorX0 + 0.03,
    northDoorH / 2,
    D - wallT / 2,
    mats.connectorFrame
  );
  const northJambE = addBox(
    groups.CONNECTORS,
    'Engineering_North_Corridor_Jamb_East',
    0.06,
    northDoorH,
    wallT + 0.04,
    northDoorX1 - 0.03,
    northDoorH / 2,
    D - wallT / 2,
    mats.connectorFrame
  );
  const northLintel = addBox(
    groups.CONNECTORS,
    'Engineering_North_Corridor_Lintel_Trim',
    northDoorX1 - northDoorX0 + 0.12,
    0.07,
    wallT + 0.05,
    (northDoorX0 + northDoorX1) / 2,
    northDoorH + 0.035,
    D - wallT / 2,
    mats.connectorFrame
  );
  const northThreshold = addBox(
    groups.CONNECTORS,
    ENGINEERING_CONNECTORS_SPEC.ENGINEERING_NORTH_CORRIDOR.removable_node_name,
    northDoorX1 - northDoorX0 - 0.12,
    0.016,
    wallT + 0.04,
    (northDoorX0 + northDoorX1) / 2,
    0.008,
    D - wallT / 2,
    mats.connectorFrame
  );
  northWallNodes.push(
    northWestSeg,
    northEastSeg,
    northHeader,
    northTopCap,
    northJambW,
    northJambE,
    northLintel
  );

  // --- SOUTH EXTERIOR WALL (Z = 0..0.16, X = 0.16..7.84, H = 3.20) ---
  // Low 0.44u cutaway curb remains visible when single-room cutaway is active;
  // Upper architectural wall & daylight window (Y = 0.44..3.20) complete the 3.2u exterior shell in Full Office mode.
  const southLowH = 0.44;
  const southWall = addBox(
    groups.WALLS,
    'Engineering_Wall_South_Cutaway_Low',
    W - wallT * 2,
    southLowH - 0.05,
    wallT,
    W / 2,
    (southLowH - 0.05) / 2,
    wallT / 2,
    mats.warmWall
  );
  const southCap = addBox(
    groups.WALLS,
    'Engineering_Wall_South_Cutaway_Cap',
    W - wallT * 2,
    0.05,
    wallT + 0.02,
    W / 2,
    southLowH - 0.025,
    wallT / 2,
    mats.wallCapDark
  );

  // Full-height South Exterior Wall Upper Sections (Y = 0.44..3.14, Window Bay at X = 2.0..6.0)
  const southUpperH = wallBodyH - southLowH; // 3.14 - 0.44 = 2.70
  const southUpperCenterY = southLowH + southUpperH / 2; // 1.79
  const southWinX0 = 2.0;
  const southWinX1 = 6.0;
  const southWinY0 = 0.92;
  const southWinY1 = 2.48;

  const southUpperWestPillar = addBox(
    groups.WALLS,
    'Engineering_Wall_South_Upper_West_Pillar',
    southWinX0 - wallT,
    southUpperH,
    wallT,
    wallT + (southWinX0 - wallT) / 2,
    southUpperCenterY,
    wallT / 2,
    mats.warmWall
  );
  const southUpperEastPillar = addBox(
    groups.WALLS,
    'Engineering_Wall_South_Upper_East_Pillar',
    W - wallT - southWinX1,
    southUpperH,
    wallT,
    southWinX1 + (W - wallT - southWinX1) / 2,
    southUpperCenterY,
    wallT / 2,
    mats.warmWall
  );
  const southUpperWinSill = addBox(
    groups.WALLS,
    'Engineering_Wall_South_Upper_Window_Sill',
    southWinX1 - southWinX0,
    southWinY0 - southLowH,
    wallT,
    (southWinX0 + southWinX1) / 2,
    southLowH + (southWinY0 - southLowH) / 2,
    wallT / 2,
    mats.warmWall
  );
  const southUpperWinHeader = addBox(
    groups.WALLS,
    'Engineering_Wall_South_Upper_Window_Header',
    southWinX1 - southWinX0,
    wallBodyH - southWinY1,
    wallT,
    (southWinX0 + southWinX1) / 2,
    southWinY1 + (wallBodyH - southWinY1) / 2,
    wallT / 2,
    mats.warmWall
  );
  const southTopCapFull = addBox(
    groups.WALLS,
    'Engineering_Wall_South_TopCap_Full',
    W - wallT * 2,
    0.06,
    wallT + 0.02,
    W / 2,
    wallH - 0.03,
    wallT / 2,
    mats.wallCapDark
  );

  // South Exterior Daylight Window Assembly (X = 2.0..6.0, Y = 0.92..2.48)
  const southWinGroup = new THREE.Group();
  southWinGroup.name = 'Engineering_Window_South_Daylight';
  southWinGroup.position.set(4.0, (southWinY0 + southWinY1) / 2, wallT / 2);
  groups.WINDOWS.add(southWinGroup);
  const sWinW = southWinX1 - southWinX0;
  const sWinH = southWinY1 - southWinY0;
  addBox(southWinGroup, 'Eng_South_Win_Frame_Top', sWinW, 0.07, wallT + 0.04, 0, sWinH / 2 - 0.035, 0, mats.engDarkTechWood);
  addBox(southWinGroup, 'Eng_South_Win_Frame_Bot', sWinW, 0.07, wallT + 0.06, 0, -sWinH / 2 + 0.035, 0.01, mats.warmOakWood);
  addBox(southWinGroup, 'Eng_South_Win_Frame_L', 0.07, sWinH - 0.14, wallT + 0.04, -sWinW / 2 + 0.035, 0, 0, mats.engDarkTechWood);
  addBox(southWinGroup, 'Eng_South_Win_Frame_R', 0.07, sWinH - 0.14, wallT + 0.04, sWinW / 2 - 0.035, 0, 0, mats.engDarkTechWood);
  addBox(southWinGroup, 'Eng_South_Win_Mullion_V1', 0.05, sWinH - 0.14, wallT + 0.02, -sWinW / 6, 0, 0, mats.engDarkTechWood);
  addBox(southWinGroup, 'Eng_South_Win_Mullion_V2', 0.05, sWinH - 0.14, wallT + 0.02, sWinW / 6, 0, 0, mats.engDarkTechWood);
  const southWinGlass = addBox(
    southWinGroup,
    'Eng_South_Win_Glass_Pane',
    sWinW - 0.14,
    sWinH - 0.14,
    0.03,
    0,
    0,
    0,
    mats.windowGlass
  );
  southWinGlass.castShadow = false;
  southWinGlass.receiveShadow = false;

  void southWall;
  void southCap;
  southWallNodes.push(
    southUpperWestPillar,
    southUpperEastPillar,
    southUpperWinSill,
    southUpperWinHeader,
    southTopCapFull,
    southWinGroup
  );

  // --- EAST CENTRAL-HUB PARTITION WALL & MAIN CONNECTOR AT [8, 0, 8] (Z = 7.0..9.0, H = 3.20) ---
  const eastLowH = 0.44;
  const eastDoorZ0 = ENGINEERING_CONNECTORS_SPEC.ENGINEERING_EAST_MAIN.span[0]; // 7.0
  const eastDoorZ1 = ENGINEERING_CONNECTORS_SPEC.ENGINEERING_EAST_MAIN.span[1]; // 9.0
  const eastDoorH = ENGINEERING_CONNECTORS_SPEC.ENGINEERING_EAST_MAIN.height; // 2.3

  const eastSouthLow = addBox(
    groups.WALLS,
    'Engineering_Wall_East_South_Cutaway',
    wallT,
    eastLowH - 0.05,
    eastDoorZ0 - 0.3,
    W - wallT / 2,
    (eastLowH - 0.05) / 2,
    (eastDoorZ0 - 0.3) / 2,
    mats.warmWall
  );
  const eastSouthCap = addBox(
    groups.WALLS,
    'Engineering_Wall_East_South_Cutaway_Cap',
    wallT + 0.02,
    0.05,
    eastDoorZ0 - 0.3,
    W - wallT / 2,
    eastLowH - 0.025,
    (eastDoorZ0 - 0.3) / 2,
    mats.wallCapDark
  );
  const eastNorthLow = addBox(
    groups.WALLS,
    'Engineering_Wall_East_North_Cutaway',
    wallT,
    eastLowH - 0.05,
    D - (eastDoorZ1 + 0.3),
    W - wallT / 2,
    (eastLowH - 0.05) / 2,
    eastDoorZ1 + 0.3 + (D - (eastDoorZ1 + 0.3)) / 2,
    mats.warmWall
  );
  const eastNorthCap = addBox(
    groups.WALLS,
    'Engineering_Wall_East_North_Cutaway_Cap',
    wallT + 0.02,
    0.05,
    D - (eastDoorZ1 + 0.3),
    W - wallT / 2,
    eastLowH - 0.025,
    eastDoorZ1 + 0.3 + (D - (eastDoorZ1 + 0.3)) / 2,
    mats.wallCapDark
  );

  // Architectural portal piers framing the [8, 0, 8] main connector
  // Piers span Y = 0.00..2.30; Portal Header spans Y = 2.30..2.55 (zero overlap!)
  const eastPortalPierS = addBox(
    groups.WALLS,
    'Engineering_Wall_East_Portal_Pier_South',
    wallT,
    eastDoorH,
    0.3,
    W - wallT / 2,
    eastDoorH / 2,
    eastDoorZ0 - 0.15,
    mats.warmWall
  );
  const eastPortalPierN = addBox(
    groups.WALLS,
    'Engineering_Wall_East_Portal_Pier_North',
    wallT,
    eastDoorH,
    0.3,
    W - wallT / 2,
    eastDoorH / 2,
    eastDoorZ1 + 0.15,
    mats.warmWall
  );
  const eastPortalHeader = addBox(
    groups.WALLS,
    'Engineering_Wall_East_Portal_Header',
    wallT + 0.02,
    0.25,
    eastDoorZ1 - eastDoorZ0 + 0.6,
    W - wallT / 2,
    eastDoorH + 0.125,
    (eastDoorZ0 + eastDoorZ1) / 2,
    mats.engDarkTechWood
  );
  const eastThreshold = addBox(
    groups.CONNECTORS,
    ENGINEERING_CONNECTORS_SPEC.ENGINEERING_EAST_MAIN.removable_node_name,
    wallT + 0.04,
    0.016,
    eastDoorZ1 - eastDoorZ0 - 0.08,
    W - wallT / 2,
    0.008,
    (eastDoorZ0 + eastDoorZ1) / 2,
    mats.connectorFrame
  );

  // Full-height East Partition Wall Upper Sections (Y = 0.44..3.14, Doorway Header Y = 2.55..3.14, TopCap Y = 3.14..3.20)
  const eastUpperH = wallBodyH - eastLowH; // 3.14 - 0.44 = 2.70
  const eastUpperCenterY = eastLowH + eastUpperH / 2; // 1.79
  const eastSouthUpperSpan = eastDoorZ0 - 0.3 - wallT; // Z = 0.16..6.70 (6.54u)
  const eastNorthUpperSpan = D - wallT - (eastDoorZ1 + 0.3); // Z = 9.30..15.84 (6.54u)

  const eastSouthUpperWall = addBox(
    groups.WALLS,
    'Engineering_Wall_East_South_Upper_Section',
    wallT,
    eastUpperH,
    eastSouthUpperSpan,
    W - wallT / 2,
    eastUpperCenterY,
    wallT + eastSouthUpperSpan / 2,
    mats.warmWall
  );
  const eastNorthUpperWall = addBox(
    groups.WALLS,
    'Engineering_Wall_East_North_Upper_Section',
    wallT,
    eastUpperH,
    eastNorthUpperSpan,
    W - wallT / 2,
    eastUpperCenterY,
    eastDoorZ1 + 0.3 + eastNorthUpperSpan / 2,
    mats.warmWall
  );
  const eastDoorwayUpperHeader = addBox(
    groups.WALLS,
    'Engineering_Wall_East_Doorway_Upper_Header',
    wallT,
    wallBodyH - (eastDoorH + 0.25), // 3.14 - 2.55 = 0.59
    eastDoorZ1 - eastDoorZ0 + 0.6, // Z = 6.70..9.30
    W - wallT / 2,
    eastDoorH + 0.25 + (wallBodyH - (eastDoorH + 0.25)) / 2,
    (eastDoorZ0 + eastDoorZ1) / 2,
    mats.warmWall
  );
  const eastTopCapFull = addBox(
    groups.WALLS,
    'Engineering_Wall_East_TopCap_Full',
    wallT + 0.02,
    0.06,
    D - wallT * 2,
    W - wallT / 2,
    wallH - 0.03,
    D / 2,
    mats.wallCapDark
  );

  void eastSouthLow;
  void eastSouthCap;
  void eastNorthLow;
  void eastNorthCap;
  void eastPortalPierS;
  void eastPortalPierN;
  void eastPortalHeader;
  eastWallNodes.push(
    eastSouthUpperWall,
    eastNorthUpperWall,
    eastDoorwayUpperHeader,
    eastTopCapFull
  );
  void northThreshold;
  void eastThreshold;

  // ==========================================================================
  // 3. ZONE A — FRONTEND DEVELOPER WORKSTATION (North Zone, Z ≈ 12..16)
  // ==========================================================================
  const feZone = furnitureSubgroups.FRONTEND_WORKSTATION;
  const feDeskGroup = new THREE.Group();
  feDeskGroup.name = 'Engineering_Frontend_Workstation_Desk';
  feDeskGroup.position.set(2.35, 0, 13.75);
  feZone.add(feDeskGroup);
  selectableFurniture.set('eng_frontend_desk', feDeskGroup);

  // Desk tabletop & steel legs (Desk sits on Frontend woven rug, so no overlapping floor shadow)
  // Legs span Y = 0.012..0.72; Tabletop spans Y = 0.72..0.768 (zero overlap)
  addBox(feDeskGroup, 'FE_Desk_Top', 2.1, 0.048, 0.88, 0, 0.744, 0, mats.warmOakWood);
  // Subtle warm coral front edge inlay strip (placed outside tabletop Z span)
  addBox(
    feDeskGroup,
    'FE_Desk_Front_Accent',
    2.1,
    0.024,
    0.012,
    0,
    0.744,
    -0.446,
    mats.engFrontendOrange
  );
  addBox(feDeskGroup, 'FE_Desk_Leg_FL', 0.06, 0.708, 0.06, -0.96, 0.366, -0.36, mats.darkMetal);
  addBox(feDeskGroup, 'FE_Desk_Leg_RL', 0.06, 0.708, 0.06, -0.96, 0.366, 0.36, mats.darkMetal);
  addBox(feDeskGroup, 'FE_Desk_Leg_FR', 0.06, 0.708, 0.06, 0.96, 0.366, -0.36, mats.darkMetal);
  addBox(feDeskGroup, 'FE_Desk_Leg_RR', 0.06, 0.708, 0.06, 0.96, 0.366, 0.36, mats.darkMetal);
  addBox(
    feDeskGroup,
    'FE_Desk_Modesty_Panel',
    1.86,
    0.26,
    0.025,
    0,
    0.56,
    0.34,
    mats.ceoCharcoalCase
  );
  addBox(
    feDeskGroup,
    'FE_Desk_Cable_Tray',
    1.2,
    0.045,
    0.11,
    0,
    0.66,
    0.25,
    mats.darkMetal
  );

  // Desk drawer pedestal on right side (spans Y = 0.12..0.72; drawers sit at z = -0.398 in front of body z = -0.38..+0.38)
  addBox(
    feDeskGroup,
    'FE_Desk_Drawer_Pedestal',
    0.42,
    0.6,
    0.74,
    0.72,
    0.42,
    0,
    mats.ceoCharcoalCase
  );
  addBox(
    feDeskGroup,
    'FE_Desk_Drawer_Top_Front',
    0.38,
    0.16,
    0.016,
    0.72,
    0.61,
    -0.38,
    mats.engFrontendOrange
  );
  addBox(
    feDeskGroup,
    'FE_Desk_Drawer_Bot_Front',
    0.38,
    0.28,
    0.016,
    0.72,
    0.36,
    -0.38,
    mats.darkMetal
  );

  const feSurfaceY = 0.768;

  // Primary 27" UI Display facing South (-Z, rotationY = Math.PI) toward FE_CHAIR [2.35, 0, 12.95]
  // Lower-profile dimensions (0.60 x 0.34, standHeight = 0.075 => center Y = 1.021)
  buildOrientedMonitorAssembly(feDeskGroup, {
    groupName: 'Engineering_FE_Main_Display_Group',
    screenMeshName: 'Engineering_FE_Main_Display_Screen',
    rearCasingMeshName: 'Engineering_FE_Main_Display_Rear_Casing',
    x: -0.14,
    y: feSurfaceY,
    z: 0.21,
    rotationY: Math.PI,
    screenWidth: 0.6,
    screenHeight: 0.34,
    standHeight: 0.075,
    screenMat: mats.engFrontendMonitor,
    casingMat: mats.ceoCharcoalCase,
    metalMat: mats.chromeSilver,
    accentMat: mats.engFrontendOrange,
  });

  // Secondary Responsive Breakpoint Display angled toward FE_CHAIR
  buildOrientedMonitorAssembly(feDeskGroup, {
    groupName: 'Engineering_FE_Secondary_Display_Group',
    screenMeshName: 'Engineering_FE_Secondary_Display_Screen',
    rearCasingMeshName: 'Engineering_FE_Secondary_Display_Rear_Casing',
    x: 0.48,
    y: feSurfaceY,
    z: 0.14,
    rotationY: Math.PI + 0.35,
    screenWidth: 0.44,
    screenHeight: 0.29,
    standHeight: 0.07,
    screenMat: mats.engFrontendSecondary,
    casingMat: mats.ceoCharcoalCase,
    metalMat: mats.chromeSilver,
    accentMat: mats.engFrontendOrange,
  });

  // Frontend Desk Mat, Mechanical Keyboard + Keycap rows + Wrist rest, Mouse
  // Mat spans Y = 0.768..0.774; Keyboard spans Y = 0.774..0.790; Keycaps span Y = 0.790..0.796
  addBox(feDeskGroup, 'FE_Desk_Mat', 0.86, 0.006, 0.36, -0.08, feSurfaceY + 0.003, -0.17, mats.ceoCharcoalCase);
  addBox(
    feDeskGroup,
    'FE_Keyboard_Base',
    0.34,
    0.016,
    0.125,
    -0.14,
    feSurfaceY + 0.014,
    -0.15,
    mats.paperCream
  );
  addBox(
    feDeskGroup,
    'FE_Keyboard_Keycaps_Main',
    0.26,
    0.006,
    0.085,
    -0.16,
    feSurfaceY + 0.025,
    -0.15,
    mats.darkMetal
  );
  addBox(
    feDeskGroup,
    'FE_Keyboard_Keycaps_Accent',
    0.05,
    0.006,
    0.085,
    0.0,
    feSurfaceY + 0.025,
    -0.15,
    mats.engFrontendOrange
  );
  addBox(
    feDeskGroup,
    'FE_Keyboard_Wrist_Rest',
    0.34,
    0.012,
    0.055,
    -0.14,
    feSurfaceY + 0.012,
    -0.25,
    mats.warmOakWood
  );
  addBox(
    feDeskGroup,
    'FE_Mouse',
    0.065,
    0.02,
    0.1,
    0.16,
    feSurfaceY + 0.016,
    -0.16,
    mats.paperCream
  );

  // Laptop on angled stand + USB-C Dock Hub (left side of Frontend desk)
  addBox(
    feDeskGroup,
    'FE_Laptop_Stand_Riser',
    0.26,
    0.045,
    0.2,
    -0.68,
    feSurfaceY + 0.0225,
    0.08,
    mats.chromeSilver
  );
  addBox(
    feDeskGroup,
    'FE_Laptop_Base',
    0.3,
    0.016,
    0.21,
    -0.68,
    feSurfaceY + 0.053,
    0.08,
    mats.ceoCharcoalCase
  );
  addBox(
    feDeskGroup,
    'FE_USB_C_Dock',
    0.14,
    0.022,
    0.065,
    -0.68,
    feSurfaceY + 0.011,
    0.26,
    mats.darkMetal
  );

  // Smartphone / Mobile Responsive UI Test Stand (center-right)
  addBox(
    feDeskGroup,
    'FE_Mobile_Stand_Base',
    0.075,
    0.014,
    0.085,
    0.24,
    feSurfaceY + 0.007,
    0.02,
    mats.chromeSilver
  );
  addBox(
    feDeskGroup,
    'FE_Mobile_Test_Device',
    0.068,
    0.11,
    0.016,
    0.24,
    feSurfaceY + 0.069,
    0.02,
    mats.engFrontendOrange
  );

  // Studio Headphones on Stand (left-front corner)
  addBox(
    feDeskGroup,
    'FE_Headphone_Stand_Base',
    0.1,
    0.014,
    0.1,
    -0.88,
    feSurfaceY + 0.007,
    -0.16,
    mats.darkMetal
  );
  addBox(
    feDeskGroup,
    'FE_Headphone_Stand_Post',
    0.022,
    0.2,
    0.022,
    -0.88,
    feSurfaceY + 0.114,
    -0.16,
    mats.brushedBrass
  );
  addBox(
    feDeskGroup,
    'FE_Headphones_Band',
    0.13,
    0.03,
    0.065,
    -0.88,
    feSurfaceY + 0.229,
    -0.16,
    mats.engFrontendOrange
  );
  addBox(
    feDeskGroup,
    'FE_Headphones_Cup_L',
    0.032,
    0.075,
    0.065,
    -0.935,
    feSurfaceY + 0.175,
    -0.16,
    mats.ceoCharcoalCase
  );
  addBox(
    feDeskGroup,
    'FE_Headphones_Cup_R',
    0.032,
    0.075,
    0.065,
    -0.825,
    feSurfaceY + 0.175,
    -0.16,
    mats.ceoCharcoalCase
  );

  // Multi-slot Desk Organizer + UI Sticky Note Pad + Coffee Mug + Task Lamp + Mini Succulent
  addBox(
    feDeskGroup,
    'FE_Desk_Organizer_Caddy',
    0.14,
    0.085,
    0.095,
    0.58,
    feSurfaceY + 0.0425,
    -0.2,
    mats.warmOakWood
  );
  addBox(
    feDeskGroup,
    'FE_Organizer_Marker_Coral',
    0.022,
    0.055,
    0.022,
    0.55,
    feSurfaceY + 0.1125,
    -0.2,
    mats.noteCoral
  );
  addBox(
    feDeskGroup,
    'FE_Organizer_Marker_Sky',
    0.022,
    0.05,
    0.022,
    0.61,
    feSurfaceY + 0.11,
    -0.2,
    mats.noteSky
  );
  addBox(
    feDeskGroup,
    'FE_UI_Sketchpad',
    0.17,
    0.016,
    0.21,
    -0.52,
    feSurfaceY + 0.008,
    -0.21,
    mats.paperCream
  );
  addBox(
    feDeskGroup,
    'FE_Sticky_Note_Coral',
    0.065,
    0.008,
    0.065,
    -0.52,
    feSurfaceY + 0.02,
    -0.19,
    mats.noteCoral
  );
  addBox(
    feDeskGroup,
    'FE_Desk_Lamp_Base',
    0.12,
    0.02,
    0.12,
    0.86,
    feSurfaceY + 0.01,
    0.24,
    mats.brushedBrass
  );
  addBox(
    feDeskGroup,
    'FE_Desk_Lamp_Stem',
    0.025,
    0.32,
    0.025,
    0.86,
    feSurfaceY + 0.18,
    0.24,
    mats.brushedBrass
  );
  addBox(
    feDeskGroup,
    'FE_Desk_Lamp_Shade',
    0.16,
    0.08,
    0.16,
    0.81,
    feSurfaceY + 0.36,
    0.18,
    mats.lampShadeWarm
  );
  addBox(
    feDeskGroup,
    'FE_Desk_Mini_Planter',
    0.085,
    0.075,
    0.085,
    0.84,
    feSurfaceY + 0.0375,
    -0.18,
    mats.terracottaPot
  );
  addBox(
    feDeskGroup,
    'FE_Desk_Mini_Succulent',
    0.095,
    0.065,
    0.095,
    0.84,
    feSurfaceY + 0.1075,
    -0.18,
    mats.plantFoliageBright
  );

  // Frontend Ergonomic Task Chair facing North (+Z, rotationY = 0)
  buildDeveloperChair(
    feZone,
    'Engineering_Frontend_Task_Chair',
    2.35,
    12.95,
    0,
    mats.engFrontendOrange,
    mats,
    selectableFurniture,
    'eng_frontend_chair'
  );

  // Frontend Component & Layout Testing Board + Reference Credenza on West Wall (`Z = 14.85`)
  const feBoardGroup = new THREE.Group();
  feBoardGroup.name = 'Engineering_Frontend_Component_Board_Unit';
  feBoardGroup.position.set(0.55, 0, 14.85);
  feZone.add(feBoardGroup);
  selectableFurniture.set('eng_frontend_board_credenza', feBoardGroup);

  // Low console credenza (doors offset cleanly at x = +0.222 outside body x = ±0.21)
  addBox(
    feBoardGroup,
    'FE_Credenza_Body',
    0.42,
    0.66,
    1.32,
    0,
    0.33,
    0,
    mats.warmOakWood
  );
  addBox(
    feBoardGroup,
    'FE_Credenza_Top',
    0.46,
    0.04,
    1.36,
    0,
    0.68,
    0,
    mats.honeyOakLight
  );
  addBox(
    feBoardGroup,
    'FE_Credenza_Accent_Door_N',
    0.016,
    0.5,
    0.56,
    0.22,
    0.34,
    0.31,
    mats.engFrontendOrange
  );
  addBox(
    feBoardGroup,
    'FE_Credenza_Accent_Door_S',
    0.016,
    0.5,
    0.56,
    0.22,
    0.34,
    -0.31,
    mats.uiuxOffWhiteSurface
  );
  // Design token & UI pattern binders on credenza top (Y = 0.70+)
  addBox(
    feBoardGroup,
    'FE_UI_Pattern_Book_1',
    0.22,
    0.24,
    0.06,
    -0.02,
    0.82,
    0.42,
    mats.engFrontendOrange
  );
  addBox(
    feBoardGroup,
    'FE_UI_Pattern_Book_2',
    0.22,
    0.22,
    0.06,
    -0.02,
    0.81,
    0.34,
    mats.noteAmber
  );
  addBox(
    feBoardGroup,
    'FE_UI_Pattern_Book_3',
    0.22,
    0.25,
    0.06,
    -0.02,
    0.825,
    0.26,
    mats.engBackendNavy
  );
  addBox(
    feBoardGroup,
    'FE_Viewport_Test_Tablet',
    0.18,
    0.14,
    0.22,
    0.04,
    0.77,
    -0.25,
    mats.ceoCharcoalCase
  );

  // Wall-mounted Frontend Component & Breakpoint Board (faces +X into the room)
  const feWallBoardMount = new THREE.Group();
  feWallBoardMount.name = 'FE_Component_Wall_Board_Mount';
  feWallBoardMount.position.set(-0.34, 0, 0);
  feWallBoardMount.rotation.y = Math.PI / 2;
  feBoardGroup.add(feWallBoardMount);

  const feBoardAsm = buildTechnicalWallBoard(
    feWallBoardMount,
    'FE_Component_Board',
    1.28,
    0.82,
    1.62,
    mats.engComponentBoard,
    mats.darkMetal,
    mats.engFrontendOrange
  );
  // 3D Pinned UI Wireframe Cards on the Component Board (z = +0.026, strictly in front of surface z = +0.018)
  addBox(
    feBoardAsm,
    'FE_Board_Pin_Card_Coral',
    0.16,
    0.12,
    0.008,
    -0.44,
    1.82,
    0.026,
    mats.noteCoral
  );
  addBox(
    feBoardAsm,
    'FE_Board_Pin_Card_Amber',
    0.16,
    0.12,
    0.008,
    -0.44,
    1.44,
    0.026,
    mats.noteAmber
  );

  // North-West Frontend Reference Bookshelf along North Wall (`[1.45, 0, 15.52]`)
  // Safely west of North Corridor doorway clearance box (`minX: 3.0..5.0, minZ: 14.5..16.0`)
  const feNorthShelf = new THREE.Group();
  feNorthShelf.name = 'Engineering_Frontend_North_Bookshelf';
  feNorthShelf.position.set(1.55, 0, 15.5);
  feZone.add(feNorthShelf);
  addContactShadow(
    groups.FLOOR,
    'FE_North_Shelf_ContactShadow',
    1.28,
    0.46,
    1.55,
    15.5,
    mats.contactShadow
  );
  addBox(feNorthShelf, 'FE_Bookcase_Left_Side', 0.04, 1.68, 0.36, -0.56, 0.84, 0, mats.warmOakWood);
  addBox(feNorthShelf, 'FE_Bookcase_Right_Side', 0.04, 1.68, 0.36, 0.56, 0.84, 0, mats.warmOakWood);
  addBox(feNorthShelf, 'FE_Bookcase_Back', 1.08, 1.68, 0.03, 0, 0.84, 0.165, mats.honeyOakLight);
  for (const [sIdx, sy] of [
    [1, 0.06],
    [2, 0.54],
    [3, 1.04],
    [4, 1.64],
  ] as const) {
    addBox(
      feNorthShelf,
      `FE_Bookcase_Shelf_${sIdx}`,
      1.08,
      0.04,
      0.34,
      0,
      sy,
      -0.01,
      mats.warmOakWood
    );
  }
  // Books, UI swatch archive boxes, and trailing plant on shelf levels
  addBox(
    feNorthShelf,
    'FE_Shelf_Archive_Box_1',
    0.28,
    0.26,
    0.26,
    -0.32,
    0.21,
    -0.02,
    mats.engFrontendOrange
  );
  addBox(
    feNorthShelf,
    'FE_Shelf_Archive_Box_2',
    0.28,
    0.26,
    0.26,
    0.04,
    0.21,
    -0.02,
    mats.uiuxOffWhiteSurface
  );
  for (let b = 0; b < 5; b++) {
    const bMat =
      b % 3 === 0
        ? mats.engFrontendOrange
        : b % 3 === 1
          ? mats.engBackendNavy
          : mats.noteAmber;
    addBox(
      feNorthShelf,
      `FE_Shelf_Book_${b}`,
      0.055,
      0.28 - (b % 2) * 0.03,
      0.24,
      -0.38 + b * 0.075,
      0.7,
      -0.02,
      bMat
    );
  }
  addBox(
    feNorthShelf,
    'FE_Shelf_Trophy_Cube',
    0.16,
    0.18,
    0.16,
    0.28,
    0.65,
    -0.02,
    mats.brushedBrass
  );
  addBox(
    feNorthShelf,
    'FE_Shelf_Design_Binders',
    0.34,
    0.28,
    0.24,
    -0.24,
    1.2,
    -0.02,
    mats.noteSky
  );

  // ==========================================================================
  // 4. ZONE B — BACKEND DEVELOPER WORKSTATION (Upper-Middle Zone, Z ≈ 8..12)
  // ==========================================================================
  const beZone = furnitureSubgroups.BACKEND_WORKSTATION;
  const beDeskGroup = new THREE.Group();
  beDeskGroup.name = 'Engineering_Backend_Workstation_Desk';
  beDeskGroup.position.set(2.35, 0, 10.05);
  beZone.add(beDeskGroup);
  selectableFurniture.set('eng_backend_desk', beDeskGroup);

  addBox(beDeskGroup, 'BE_Desk_Top', 2.1, 0.048, 0.88, 0, 0.744, 0, mats.engDarkTechWood);
  addBox(
    beDeskGroup,
    'BE_Desk_Front_Accent',
    2.1,
    0.024,
    0.012,
    0,
    0.744,
    -0.446,
    mats.engBackendNavy
  );
  addBox(beDeskGroup, 'BE_Desk_Leg_FL', 0.06, 0.708, 0.06, -0.96, 0.366, -0.36, mats.darkMetal);
  addBox(beDeskGroup, 'BE_Desk_Leg_RL', 0.06, 0.708, 0.06, -0.96, 0.366, 0.36, mats.darkMetal);
  addBox(beDeskGroup, 'BE_Desk_Leg_FR', 0.06, 0.708, 0.06, 0.96, 0.366, -0.36, mats.darkMetal);
  addBox(beDeskGroup, 'BE_Desk_Leg_RR', 0.06, 0.708, 0.06, 0.96, 0.366, 0.36, mats.darkMetal);
  addBox(
    beDeskGroup,
    'BE_Desk_Modesty_Panel',
    1.86,
    0.26,
    0.025,
    0,
    0.56,
    0.34,
    mats.ceoCharcoalCase
  );
  addBox(
    beDeskGroup,
    'BE_Desk_Cable_Raceway',
    1.35,
    0.05,
    0.12,
    0,
    0.66,
    0.25,
    mats.engBackendSteel
  );

  // Compact Backend Server / Dev Node under right side of desk (LED strip offset at z = -0.232)
  addBox(
    beDeskGroup,
    'BE_Workstation_Server_Node',
    0.24,
    0.46,
    0.44,
    0.76,
    0.242,
    0.0,
    mats.ceoCharcoalCase
  );
  addBox(
    beDeskGroup,
    'BE_Server_Front_Vent',
    0.18,
    0.26,
    0.012,
    0.76,
    0.22,
    -0.226,
    mats.darkMetal
  );
  addBox(
    beDeskGroup,
    'BE_Server_Front_LED',
    0.16,
    0.035,
    0.014,
    0.76,
    0.39,
    -0.227,
    mats.engBackendNavy
  );

  const beSurfaceY = 0.768;

  // Primary Service Topology Display facing South (-Z, rotationY = Math.PI) toward BE_CHAIR [2.35, 0, 9.25]
  buildOrientedMonitorAssembly(beDeskGroup, {
    groupName: 'Engineering_BE_Main_Display_Group',
    screenMeshName: 'Engineering_BE_Main_Display_Screen',
    rearCasingMeshName: 'Engineering_BE_Main_Display_Rear_Casing',
    x: -0.14,
    y: beSurfaceY,
    z: 0.21,
    rotationY: Math.PI,
    screenWidth: 0.6,
    screenHeight: 0.34,
    standHeight: 0.075,
    screenMat: mats.engBackendMonitor,
    casingMat: mats.ceoCharcoalCase,
    metalMat: mats.chromeSilver,
    accentMat: mats.engBackendNavy,
  });

  // Secondary Vertical Terminal Log Display angled toward BE_CHAIR
  buildOrientedMonitorAssembly(beDeskGroup, {
    groupName: 'Engineering_BE_Terminal_Display_Group',
    screenMeshName: 'Engineering_BE_Terminal_Display_Screen',
    rearCasingMeshName: 'Engineering_BE_Terminal_Display_Rear_Casing',
    x: 0.48,
    y: beSurfaceY,
    z: 0.14,
    rotationY: Math.PI + 0.35,
    screenWidth: 0.34,
    screenHeight: 0.38,
    standHeight: 0.055,
    screenMat: mats.engBackendTerminal,
    casingMat: mats.ceoCharcoalCase,
    metalMat: mats.chromeSilver,
    accentMat: mats.engBackendNavy,
  });

  // Mechanical Keyboard + Wrist Rest + Mouse + Desk Mat
  addBox(
    beDeskGroup,
    'BE_Desk_Mat',
    0.86,
    0.006,
    0.36,
    -0.08,
    beSurfaceY + 0.003,
    -0.17,
    mats.ceoCharcoalCase
  );
  addBox(
    beDeskGroup,
    'BE_Mechanical_Keyboard',
    0.35,
    0.018,
    0.13,
    -0.14,
    beSurfaceY + 0.015,
    -0.15,
    mats.darkMetal
  );
  addBox(
    beDeskGroup,
    'BE_Keyboard_Keycaps',
    0.31,
    0.006,
    0.09,
    -0.14,
    beSurfaceY + 0.027,
    -0.15,
    mats.engBackendSteel
  );
  addBox(
    beDeskGroup,
    'BE_Keyboard_Esc_Key',
    0.032,
    0.008,
    0.028,
    -0.28,
    beSurfaceY + 0.028,
    -0.11,
    mats.engBackendNavy
  );
  addBox(
    beDeskGroup,
    'BE_Mouse',
    0.065,
    0.02,
    0.1,
    0.16,
    beSurfaceY + 0.016,
    -0.16,
    mats.darkMetal
  );

  // Compact Tabletop Linux / Microservice Test Appliance + Patch Cables (left side of desk)
  addBox(
    beDeskGroup,
    'BE_Microservice_Test_Box',
    0.26,
    0.065,
    0.22,
    -0.74,
    beSurfaceY + 0.0325,
    0.14,
    mats.ceoCharcoalCase
  );
  addBox(
    beDeskGroup,
    'BE_Microservice_Top_Heatsink',
    0.22,
    0.012,
    0.16,
    -0.74,
    beSurfaceY + 0.071,
    0.14,
    mats.engBackendSteel
  );
  addBox(
    beDeskGroup,
    'BE_Microservice_Status_LED',
    0.18,
    0.014,
    0.012,
    -0.74,
    beSurfaceY + 0.04,
    0.024,
    mats.engBackendNavy
  );
  // Rear patch cables leading into cable raceway
  addBox(
    beDeskGroup,
    'BE_Patch_Cable_1',
    0.018,
    0.018,
    0.12,
    -0.78,
    beSurfaceY + 0.015,
    0.3,
    mats.engBackendNavy
  );
  addBox(
    beDeskGroup,
    'BE_Patch_Cable_2',
    0.018,
    0.018,
    0.12,
    -0.7,
    beSurfaceY + 0.015,
    0.3,
    mats.noteSage
  );

  // Angled API Payload Tablet + Open API Spec Notebook + 3-Slot RFC Binder Organizer + Mug + Lamp
  addBox(
    beDeskGroup,
    'BE_API_Payload_Tablet',
    0.22,
    0.022,
    0.16,
    -0.58,
    beSurfaceY + 0.011,
    -0.18,
    mats.engBackendSteel
  );
  addBox(
    beDeskGroup,
    'BE_API_Notebook_Open',
    0.22,
    0.016,
    0.16,
    0.42,
    beSurfaceY + 0.008,
    -0.21,
    mats.paperCream
  );
  addBox(
    beDeskGroup,
    'BE_RFC_Binder_Slot_1',
    0.055,
    0.21,
    0.18,
    0.76,
    beSurfaceY + 0.105,
    0.22,
    mats.engBackendNavy
  );
  addBox(
    beDeskGroup,
    'BE_RFC_Binder_Slot_2',
    0.055,
    0.19,
    0.18,
    0.825,
    beSurfaceY + 0.095,
    0.22,
    mats.engBackendSteel
  );
  addBox(
    beDeskGroup,
    'BE_RFC_Binder_Slot_3',
    0.055,
    0.22,
    0.18,
    0.89,
    beSurfaceY + 0.11,
    0.22,
    mats.ceoCharcoalCase
  );
  addBox(
    beDeskGroup,
    'BE_Coffee_Mug',
    0.075,
    0.09,
    0.075,
    0.72,
    beSurfaceY + 0.045,
    -0.18,
    mats.ceramicCream
  );
  addBox(
    beDeskGroup,
    'BE_Task_Lamp_Base',
    0.12,
    0.02,
    0.12,
    -0.88,
    beSurfaceY + 0.01,
    -0.22,
    mats.darkMetal
  );
  addBox(
    beDeskGroup,
    'BE_Task_Lamp_Arm',
    0.024,
    0.3,
    0.024,
    -0.88,
    beSurfaceY + 0.17,
    -0.22,
    mats.engBackendSteel
  );
  addBox(
    beDeskGroup,
    'BE_Task_Lamp_Head',
    0.15,
    0.06,
    0.12,
    -0.83,
    beSurfaceY + 0.33,
    -0.18,
    mats.engBackendNavy
  );

  // Backend Ergonomic Task Chair facing North (+Z, rotationY = 0)
  buildDeveloperChair(
    beZone,
    'Engineering_Backend_Task_Chair',
    2.35,
    9.25,
    0,
    mats.engBackendNavy,
    mats,
    selectableFurniture,
    'eng_backend_chair'
  );

  // Backend API Contract & Service Architecture Board on West Wall (`Z = 11.15`, between Windows 2 and 3)
  const beBoardGroup = new THREE.Group();
  beBoardGroup.name = 'Engineering_Backend_API_Contract_Board_Unit';
  beBoardGroup.position.set(0.52, 0, 11.15);
  beZone.add(beBoardGroup);
  selectableFurniture.set('eng_backend_api_board', beBoardGroup);

  addContactShadow(
    groups.FLOOR,
    'BE_Side_Console_ContactShadow',
    0.52,
    1.55,
    0.52,
    11.15,
    mats.contactShadow
  );
  addBox(
    beBoardGroup,
    'BE_Ref_Shelf_Body',
    0.4,
    0.68,
    1.42,
    0,
    0.34,
    0,
    mats.ceoCharcoalCase
  );
  addBox(
    beBoardGroup,
    'BE_Ref_Shelf_Top',
    0.44,
    0.04,
    1.46,
    0,
    0.7,
    0,
    mats.engDarkTechWood
  );
  // Dual-antenna router appliance + network switch on console top (Y = 0.72+)
  addBox(
    beBoardGroup,
    'BE_Router_Appliance',
    0.24,
    0.065,
    0.34,
    0,
    0.7525,
    -0.36,
    mats.darkMetal
  );
  addBox(
    beBoardGroup,
    'BE_Router_LED',
    0.014,
    0.022,
    0.26,
    0.127,
    0.755,
    -0.36,
    mats.engBackendNavy
  );
  addBox(
    beBoardGroup,
    'BE_Router_Antenna_1',
    0.016,
    0.16,
    0.016,
    -0.08,
    0.865,
    -0.46,
    mats.darkMetal
  );
  addBox(
    beBoardGroup,
    'BE_Router_Antenna_2',
    0.016,
    0.16,
    0.016,
    -0.08,
    0.865,
    -0.26,
    mats.darkMetal
  );
  // Telemetry cluster mini-rack & technical binders
  addBox(
    beBoardGroup,
    'BE_Cluster_Switch_Unit',
    0.24,
    0.09,
    0.36,
    0,
    0.765,
    0.32,
    mats.engBackendSteel
  );
  addBox(
    beBoardGroup,
    'BE_Switch_Port_Strip',
    0.014,
    0.03,
    0.28,
    0.127,
    0.765,
    0.32,
    mats.noteSage
  );

  // Wall-mounted API & Services Architecture Board (faces +X into the room)
  const beWallBoardMount = new THREE.Group();
  beWallBoardMount.name = 'BE_API_Wall_Board_Mount';
  beWallBoardMount.position.set(-0.31, 0, 0);
  beWallBoardMount.rotation.y = Math.PI / 2;
  beBoardGroup.add(beWallBoardMount);

  const beBoardAsm = buildTechnicalWallBoard(
    beWallBoardMount,
    'BE_API_Contract_Board',
    1.44,
    0.84,
    1.62,
    mats.engApiContractBoard,
    mats.darkMetal,
    mats.engBackendNavy
  );
  // 3D Raised Pipeline Stage Node Blocks on the API Board (Frontend -> API Gateway -> Services -> DB)
  for (const [nIdx, nx, nMat] of [
    [1, -0.46, mats.engFrontendOrange],
    [2, -0.15, mats.noteAmber],
    [3, 0.16, mats.engBackendNavy],
    [4, 0.47, mats.engDatabaseTeal],
  ] as const) {
    addBox(
      beBoardAsm,
      `BE_Board_Stage_Badge_${nIdx}`,
      0.18,
      0.045,
      0.008,
      nx,
      1.92,
      0.026,
      nMat
    );
  }

  // Upper West Wall Studio Clock above the API Contract Board (`Y = 2.48`)
  addBox(
    beWallBoardMount,
    'BE_Wall_Clock_Frame',
    0.28,
    0.28,
    0.035,
    0,
    2.48,
    0.005,
    mats.darkMetal
  );
  addBox(
    beWallBoardMount,
    'BE_Wall_Clock_Face',
    0.22,
    0.22,
    0.012,
    0,
    2.48,
    0.029,
    mats.paperCream
  );
  addBox(
    beWallBoardMount,
    'BE_Wall_Clock_Hands',
    0.08,
    0.02,
    0.008,
    0.03,
    2.49,
    0.039,
    mats.engBackendNavy
  );

  // ==========================================================================
  // 5. ZONE C — SHARED INTEGRATION & CODE REVIEW HUB (Lower-Middle Zone, Z ≈ 5..8)
  // ==========================================================================
  const intZone = furnitureSubgroups.INTEGRATION_REVIEW_AREA;
  const intTableGroup = new THREE.Group();
  intTableGroup.name = 'Engineering_Integration_Review_Table';
  intTableGroup.position.set(3.25, 0, 6.35);
  intZone.add(intTableGroup);
  selectableFurniture.set('eng_integration_table', intTableGroup);

  // Note: Integration Table sits directly on the 3D woven runner rug (Y = 0.002..0.012),
  // so we do NOT place a competing floor contact shadow plane underneath it!
  // Table legs span Y = 0.012..0.695; Apron spans Y = 0.655..0.695; Tabletop spans Y = 0.695..0.745
  addBox(
    intTableGroup,
    'Int_Table_Top',
    1.55,
    0.05,
    1.15,
    0,
    0.72,
    0,
    mats.warmOakWood
  );
  // Stepped recessed cable/power grommet tray ON TOP of the table (Y = 0.745..0.755, zero intersection)
  addBox(
    intTableGroup,
    'Int_Table_Core_Inlay',
    0.52,
    0.01,
    0.22,
    0,
    0.75,
    0,
    mats.darkMetal
  );
  addBox(
    intTableGroup,
    'Int_Table_Apron',
    1.32,
    0.05,
    0.92,
    0,
    0.67,
    0,
    mats.ceoCharcoalCase
  );
  for (const [lx, lz, tag] of [
    [-0.66, -0.46, 'FL'],
    [0.66, -0.46, 'FR'],
    [-0.66, 0.46, 'RL'],
    [0.66, 0.46, 'RR'],
  ] as const) {
    addBox(
      intTableGroup,
      `Int_Table_Leg_${tag}`,
      0.065,
      0.683,
      0.065,
      lx,
      0.3535,
      lz,
      mats.darkMetal
    );
  }

  const intTopY = 0.745;

  // Collaborative Code Review Props on Table (strictly non-overlapping X/Z positions on Y = 0.745+)
  // 1. Open Code Review Laptop facing North seat (z = 0.28)
  addBox(
    intTableGroup,
    'Int_Review_Laptop_Base',
    0.32,
    0.016,
    0.22,
    -0.34,
    intTopY + 0.008,
    0.28,
    mats.chromeSilver
  );
  const revLapScreen = addBox(
    intTableGroup,
    'Int_Review_Laptop_Screen',
    0.32,
    0.2,
    0.014,
    -0.34,
    intTopY + 0.11,
    0.17,
    mats.ceoCharcoalCase
  );
  revLapScreen.rotation.x = -0.22;

  // 2. Digital Architecture Tablet + Stylus Pen facing East reviewer (x = 0.42, z = 0.04)
  addBox(
    intTableGroup,
    'Int_Review_Tablet',
    0.22,
    0.014,
    0.28,
    0.42,
    intTopY + 0.007,
    0.04,
    mats.ceoCharcoalCase
  );
  addBox(
    intTableGroup,
    'Int_Review_Tablet_Screen',
    0.18,
    0.006,
    0.24,
    0.42,
    intTopY + 0.017,
    0.04,
    mats.engBackendNavy
  );
  addBox(
    intTableGroup,
    'Int_Review_Stylus',
    0.016,
    0.012,
    0.14,
    0.56,
    intTopY + 0.006,
    0.04,
    mats.brushedBrass
  );

  // 3. System Blueprint Sheet + 3 Color-Coded Sprint Sticky Notes (south-west quadrant)
  addBox(
    intTableGroup,
    'Int_Review_Sheet_1',
    0.38,
    0.008,
    0.26,
    -0.26,
    intTopY + 0.004,
    -0.28,
    mats.paperCream
  );
  // Notes placed ON TOP of sheet (Y = intTopY + 0.008..0.016)
  addBox(
    intTableGroup,
    'Int_Review_Note_FE',
    0.075,
    0.008,
    0.075,
    -0.36,
    intTopY + 0.012,
    -0.26,
    mats.engFrontendOrange
  );
  addBox(
    intTableGroup,
    'Int_Review_Note_BE',
    0.075,
    0.008,
    0.075,
    -0.26,
    intTopY + 0.012,
    -0.26,
    mats.engBackendNavy
  );
  addBox(
    intTableGroup,
    'Int_Review_Note_DB',
    0.075,
    0.008,
    0.075,
    -0.16,
    intTopY + 0.012,
    -0.26,
    mats.engDatabaseTeal
  );

  // 4. Centerpiece Terracotta Planter + Coffee Carafe & 2 Mugs
  addBox(
    intTableGroup,
    'Int_Centerpiece_Pot',
    0.11,
    0.09,
    0.11,
    0.0,
    intTopY + 0.055,
    0.0,
    mats.terracottaPot
  );
  addBox(
    intTableGroup,
    'Int_Centerpiece_Plant',
    0.13,
    0.08,
    0.13,
    0.0,
    intTopY + 0.14,
    0.0,
    mats.plantFoliageMid
  );
  addBox(
    intTableGroup,
    'Int_Review_Mug_1',
    0.068,
    0.08,
    0.068,
    0.22,
    intTopY + 0.04,
    -0.32,
    mats.ceramicCream
  );
  addBox(
    intTableGroup,
    'Int_Review_Mug_2',
    0.068,
    0.08,
    0.068,
    0.22,
    intTopY + 0.04,
    0.34,
    mats.engFrontendOrange
  );

  // Trio of Collaboration Stools around the Integration Table (each color-coded to FE, BE, DB)
  const stoolsGroup = new THREE.Group();
  stoolsGroup.name = 'Engineering_Integration_Review_Stools';
  stoolsGroup.position.set(3.25, 0, 6.35);
  intZone.add(stoolsGroup);
  selectableFurniture.set('eng_integration_stools', stoolsGroup);

  const stoolSpecs: Array<[string, number, number, THREE.Material]> = [
    ['North_FE_Stool', 0, 0.78, mats.engFrontendOrange],
    ['East_BE_Stool', 0.96, 0, mats.engBackendNavy],
    ['South_DB_Stool', 0, -0.78, mats.engDatabaseTeal],
  ];
  for (const [sName, sx, sz, sMat] of stoolSpecs) {
    // Base rests on top of runner rug (Y = 0.012+)
    addBox(stoolsGroup, `${sName}_Base`, 0.34, 0.03, 0.34, sx, 0.027, sz, mats.darkMetal);
    addBox(stoolsGroup, `${sName}_Post`, 0.06, 0.38, 0.06, sx, 0.232, sz, mats.chromeSilver);
    addBox(stoolsGroup, `${sName}_Footrest_Ring`, 0.24, 0.022, 0.24, sx, 0.18, sz, mats.darkMetal);
    addBox(stoolsGroup, `${sName}_Seat_Pan`, 0.34, 0.03, 0.34, sx, 0.437, sz, mats.ceoCharcoalCase);
    addBox(stoolsGroup, `${sName}_Cushion`, 0.36, 0.065, 0.36, sx, 0.485, sz, sMat);
  }

  // Wall-Mounted Shared Architecture & Integration Board (`[0.22, 0, 5.75]` on West Wall between Win 1 & 2)
  const archBoardGroup = new THREE.Group();
  archBoardGroup.name = 'Engineering_Shared_Architecture_Board';
  archBoardGroup.position.set(0.22, 0, 5.75);
  intZone.add(archBoardGroup);
  selectableFurniture.set('eng_architecture_board', archBoardGroup);

  // Lower console ledge beneath Shared Architecture Board for sprint packets & markers
  addBox(
    archBoardGroup,
    'Shared_Arch_Lower_Console',
    0.26,
    0.05,
    1.88,
    0.08,
    0.86,
    0,
    mats.warmOakWood
  );
  addBox(
    archBoardGroup,
    'Shared_Arch_Console_Bracket_N',
    0.22,
    0.12,
    0.04,
    0.06,
    0.775,
    0.76,
    mats.darkMetal
  );
  addBox(
    archBoardGroup,
    'Shared_Arch_Console_Bracket_S',
    0.22,
    0.12,
    0.04,
    0.06,
    0.775,
    -0.76,
    mats.darkMetal
  );
  addBox(
    archBoardGroup,
    'Shared_Arch_Sprint_Packet',
    0.18,
    0.03,
    0.28,
    0.08,
    0.9,
    -0.42,
    mats.paperCream
  );

  const archWallMount = new THREE.Group();
  archWallMount.name = 'Shared_Arch_Wall_Board_Mount';
  archWallMount.position.set(0, 0, 0);
  archWallMount.rotation.y = Math.PI / 2;
  archBoardGroup.add(archWallMount);

  const sharedArchAsm = buildTechnicalWallBoard(
    archWallMount,
    'Shared_Arch_Board',
    1.92,
    1.04,
    1.62,
    mats.engIntegrationBoard,
    mats.darkMetal,
    mats.engFrontendOrange
  );
  // Overhead architectural picture sconces illuminating the Shared Architecture Board
  for (const [scIdx, scX] of [
    [1, -0.52],
    [2, 0.52],
  ] as const) {
    addBox(
      sharedArchAsm,
      `Shared_Arch_Sconce_Arm_${scIdx}`,
      0.04,
      0.04,
      0.16,
      scX,
      2.24,
      0.07,
      mats.brushedBrass
    );
    addBox(
      sharedArchAsm,
      `Shared_Arch_Sconce_Head_${scIdx}`,
      0.24,
      0.035,
      0.06,
      scX,
      2.21,
      0.14,
      mats.lampShadeWarm
    );
  }

  // ==========================================================================
  // 6. ZONE D — DATABASE DEVELOPER WORKSTATION (South Zone, Z ≈ 0..5)
  // ==========================================================================
  const dbZone = furnitureSubgroups.DATABASE_WORKSTATION;
  const dbDeskGroup = new THREE.Group();
  dbDeskGroup.name = 'Engineering_Database_Workstation_Desk';
  dbDeskGroup.position.set(2.35, 0, 2.95);
  dbZone.add(dbDeskGroup);
  selectableFurniture.set('eng_database_desk', dbDeskGroup);

  addBox(dbDeskGroup, 'DB_Desk_Top', 2.1, 0.048, 0.88, 0, 0.744, 0, mats.warmOakWood);
  addBox(
    dbDeskGroup,
    'DB_Desk_Front_Accent',
    2.1,
    0.024,
    0.012,
    0,
    0.744,
    -0.446,
    mats.engDatabaseTeal
  );
  addBox(dbDeskGroup, 'DB_Desk_Leg_FL', 0.06, 0.708, 0.06, -0.96, 0.366, -0.36, mats.darkMetal);
  addBox(dbDeskGroup, 'DB_Desk_Leg_RL', 0.06, 0.708, 0.06, -0.96, 0.366, 0.36, mats.darkMetal);
  addBox(dbDeskGroup, 'DB_Desk_Leg_FR', 0.06, 0.708, 0.06, 0.96, 0.366, -0.36, mats.darkMetal);
  addBox(dbDeskGroup, 'DB_Desk_Leg_RR', 0.06, 0.708, 0.06, 0.96, 0.366, 0.36, mats.darkMetal);
  addBox(
    dbDeskGroup,
    'DB_Desk_Modesty_Panel',
    1.86,
    0.26,
    0.025,
    0,
    0.56,
    0.34,
    mats.engDatabaseEmerald
  );
  addBox(
    dbDeskGroup,
    'DB_Desk_Cable_Tray',
    1.25,
    0.045,
    0.11,
    0,
    0.66,
    0.25,
    mats.darkMetal
  );

  // Database Workstation Tower under left side of desk (front stripe cleanly offset at z = -0.228)
  addBox(
    dbDeskGroup,
    'DB_Workstation_Tower',
    0.24,
    0.48,
    0.44,
    -0.74,
    0.252,
    0.0,
    mats.ceoCharcoalCase
  );
  addBox(
    dbDeskGroup,
    'DB_Tower_Stripe',
    0.16,
    0.36,
    0.014,
    -0.74,
    0.252,
    -0.228,
    mats.engDatabaseTeal
  );

  const dbSurfaceY = 0.768;

  // Primary ERD & Relational Schema Display facing South (-Z, rotationY = Math.PI) toward DB_CHAIR [2.35, 0, 2.15]
  // Lower-profile, sleek stepped rear VESA housing so the foreground isometric view is open and readable
  buildOrientedMonitorAssembly(dbDeskGroup, {
    groupName: 'Engineering_DB_Main_Display_Group',
    screenMeshName: 'Engineering_DB_Main_Display_Screen',
    rearCasingMeshName: 'Engineering_DB_Main_Display_Rear_Casing',
    x: -0.14,
    y: dbSurfaceY,
    z: 0.21,
    rotationY: Math.PI,
    screenWidth: 0.6,
    screenHeight: 0.34,
    standHeight: 0.075,
    screenMat: mats.engDatabaseMonitor,
    casingMat: mats.ceoCharcoalCase,
    metalMat: mats.chromeSilver,
    accentMat: mats.engDatabaseTeal,
  });

  // Secondary Query Plan & Index Status Display angled toward DB_CHAIR
  buildOrientedMonitorAssembly(dbDeskGroup, {
    groupName: 'Engineering_DB_Secondary_Display_Group',
    screenMeshName: 'Engineering_DB_Secondary_Display_Screen',
    rearCasingMeshName: 'Engineering_DB_Secondary_Display_Rear_Casing',
    x: 0.48,
    y: dbSurfaceY,
    z: 0.14,
    rotationY: Math.PI + 0.35,
    screenWidth: 0.44,
    screenHeight: 0.29,
    standHeight: 0.07,
    screenMat: mats.engDatabaseSecondary,
    casingMat: mats.ceoCharcoalCase,
    metalMat: mats.chromeSilver,
    accentMat: mats.engDatabaseTeal,
  });

  // Keyboard, Wrist Rest, Mouse, Desk Mat, SQL Reference Volumes, 2-Tier Schema File Tray, Lamp & Plant
  addBox(
    dbDeskGroup,
    'DB_Desk_Mat',
    0.86,
    0.006,
    0.36,
    -0.08,
    dbSurfaceY + 0.003,
    -0.17,
    mats.engDatabaseEmerald
  );
  addBox(
    dbDeskGroup,
    'DB_Keyboard',
    0.35,
    0.016,
    0.13,
    -0.14,
    dbSurfaceY + 0.014,
    -0.15,
    mats.darkMetal
  );
  addBox(
    dbDeskGroup,
    'DB_Keyboard_Keycaps',
    0.31,
    0.006,
    0.09,
    -0.14,
    dbSurfaceY + 0.025,
    -0.15,
    mats.paperCream
  );
  addBox(
    dbDeskGroup,
    'DB_Keyboard_Accent_Keys',
    0.045,
    0.007,
    0.09,
    0.01,
    dbSurfaceY + 0.026,
    -0.15,
    mats.engDatabaseTeal
  );
  addBox(
    dbDeskGroup,
    'DB_Mouse',
    0.065,
    0.02,
    0.1,
    0.16,
    dbSurfaceY + 0.016,
    -0.16,
    mats.darkMetal
  );
  // SQL Reference Books + Brass Bookend (left-rear of desk)
  addBox(
    dbDeskGroup,
    'DB_SQL_Book_1',
    0.16,
    0.036,
    0.22,
    -0.74,
    dbSurfaceY + 0.018,
    0.14,
    mats.engDatabaseTeal
  );
  addBox(
    dbDeskGroup,
    'DB_SQL_Book_2',
    0.15,
    0.032,
    0.2,
    -0.74,
    dbSurfaceY + 0.052,
    0.14,
    mats.paperCream
  );
  addBox(
    dbDeskGroup,
    'DB_SQL_Book_3',
    0.14,
    0.028,
    0.19,
    -0.74,
    dbSurfaceY + 0.082,
    0.14,
    mats.engDatabaseEmerald
  );
  // Printed Schema Sheet + Pen on left-front
  addBox(
    dbDeskGroup,
    'DB_Printed_Schema_Chart',
    0.24,
    0.008,
    0.18,
    -0.66,
    dbSurfaceY + 0.004,
    -0.18,
    mats.paperCream
  );
  // 2-Tier Schema Migration File Tray on right side of desk
  addBox(
    dbDeskGroup,
    'DB_Schema_Tray_Lower',
    0.22,
    0.024,
    0.26,
    0.78,
    dbSurfaceY + 0.012,
    0.18,
    mats.darkMetal
  );
  addBox(
    dbDeskGroup,
    'DB_Schema_Tray_Posts',
    0.02,
    0.06,
    0.22,
    0.87,
    dbSurfaceY + 0.054,
    0.18,
    mats.brushedBrass
  );
  addBox(
    dbDeskGroup,
    'DB_Schema_Tray_Upper',
    0.22,
    0.024,
    0.26,
    0.78,
    dbSurfaceY + 0.096,
    0.18,
    mats.darkMetal
  );
  addBox(
    dbDeskGroup,
    'DB_Schema_Tray_Docs',
    0.18,
    0.012,
    0.22,
    0.77,
    dbSurfaceY + 0.114,
    0.18,
    mats.paperCream
  );
  // Database Desk Task Lamp & Ceramic Mug
  addBox(
    dbDeskGroup,
    'DB_Desk_Lamp_Base',
    0.11,
    0.02,
    0.11,
    0.84,
    dbSurfaceY + 0.01,
    -0.2,
    mats.brushedBrass
  );
  addBox(
    dbDeskGroup,
    'DB_Desk_Lamp_Stem',
    0.022,
    0.28,
    0.022,
    0.84,
    dbSurfaceY + 0.16,
    -0.2,
    mats.brushedBrass
  );
  addBox(
    dbDeskGroup,
    'DB_Desk_Lamp_Shade',
    0.15,
    0.07,
    0.14,
    0.79,
    dbSurfaceY + 0.315,
    -0.16,
    mats.lampShadeWarm
  );
  addBox(
    dbDeskGroup,
    'DB_Desk_Mug',
    0.07,
    0.085,
    0.07,
    0.52,
    dbSurfaceY + 0.0425,
    -0.22,
    mats.engDatabaseTeal
  );

  // Database Ergonomic Task Chair facing North (+Z, rotationY = 0)
  buildDeveloperChair(
    dbZone,
    'Engineering_Database_Task_Chair',
    2.35,
    2.15,
    0,
    mats.engDatabaseTeal,
    mats,
    selectableFurniture,
    'eng_database_chair'
  );

  // South-West Sage-Green Technical Credenza (`[0.46, 0, 0.88]`) along West Wall south of Window 1
  const dbWestBookcase = new THREE.Group();
  dbWestBookcase.name = 'Engineering_Database_West_Bookcase_Unit';
  dbWestBookcase.position.set(0.46, 0, 0.88);
  dbZone.add(dbWestBookcase);
  addContactShadow(
    groups.FLOOR,
    'DB_West_Bookcase_ContactShadow',
    0.48,
    1.18,
    0.46,
    0.88,
    mats.contactShadow
  );
  addBox(
    dbWestBookcase,
    'DB_West_Bookcase_Body',
    0.38,
    0.68,
    1.16,
    0,
    0.34,
    0,
    mats.engDatabaseEmerald
  );
  addBox(
    dbWestBookcase,
    'DB_West_Bookcase_Top',
    0.42,
    0.04,
    1.2,
    0,
    0.7,
    0,
    mats.warmOakWood
  );
  // Open shelf trim on +X face (offset at x = +0.198 so zero coplanarity)
  addBox(
    dbWestBookcase,
    'DB_West_Bookcase_Shelf_Trim_1',
    0.016,
    0.03,
    1.04,
    0.198,
    0.36,
    0,
    mats.warmOakWood
  );
  // 4-Bay NAS Storage Array on top of the South-West Credenza (Y = 0.72+)
  addBox(
    dbWestBookcase,
    'DB_NAS_Array_Chassis',
    0.26,
    0.2,
    0.36,
    0,
    0.82,
    -0.26,
    mats.ceoCharcoalCase
  );
  for (let bay = 0; bay < 4; bay++) {
    addBox(
      dbWestBookcase,
      `DB_NAS_Drive_Bay_${bay + 1}`,
      0.014,
      0.14,
      0.06,
      0.137,
      0.82,
      -0.37 + bay * 0.074,
      mats.engDatabaseTeal
    );
  }
  addBox(
    dbWestBookcase,
    'DB_Bookcase_Top_Binders',
    0.22,
    0.22,
    0.3,
    0,
    0.83,
    0.26,
    mats.noteSage
  );

  // Database Archive Cabinet & Schema Board Unit (`[5.45, 0, 0.88]`)
  // Low-profile 6-drawer archive credenza in the South-East foreground (H = 0.68u) with ZERO tall
  // dark backplate blocking the camera sightline; the Database Schema & ERD Reference Board is
  // mounted on the Zone D West Wall facing East (+X) directly toward the room & camera!
  const dbArchiveGroup = new THREE.Group();
  dbArchiveGroup.name = 'Engineering_Database_Archive_And_Schema_Unit';
  dbArchiveGroup.position.set(5.45, 0, 0.88);
  dbZone.add(dbArchiveGroup);
  selectableFurniture.set('eng_database_archive_board', dbArchiveGroup);

  addContactShadow(
    groups.FLOOR,
    'DB_Archive_ContactShadow',
    1.82,
    0.52,
    5.45,
    0.88,
    mats.contactShadow
  );

  // Sleek Low-Profile 6-Drawer Data Archive Credenza (height 0.66u so foreground stays open & airy)
  addBox(
    dbArchiveGroup,
    'DB_Archive_Cabinet_Body',
    1.72,
    0.62,
    0.44,
    0,
    0.31,
    0,
    mats.ceoCharcoalCase
  );
  addBox(
    dbArchiveGroup,
    'DB_Archive_Cabinet_Top',
    1.78,
    0.04,
    0.48,
    0,
    0.64,
    0,
    mats.warmOakWood
  );
  for (let col = -1; col <= 1; col++) {
    for (const [rTag, ry, rMat] of [
      ['Upper', 0.45, mats.engDatabaseEmerald],
      ['Lower', 0.18, mats.engDatabaseTeal],
    ] as const) {
      addBox(
        dbArchiveGroup,
        `DB_Archive_Drawer_${col + 2}_${rTag}`,
        0.5,
        0.21,
        0.016,
        col * 0.55,
        ry,
        0.23,
        rMat
      );
      addBox(
        dbArchiveGroup,
        `DB_Archive_Handle_${col + 2}_${rTag}`,
        0.14,
        0.024,
        0.012,
        col * 0.55,
        ry + 0.03,
        0.244,
        mats.brushedBrass
      );
    }
  }

  // Low-profile Index Binders, Backup Cartridge Caddy, & Angled Schema Tablet on Archive Credenza Top (Y = 0.66+)
  addBox(
    dbArchiveGroup,
    'DB_Index_Binder_Stack_1',
    0.28,
    0.18,
    0.22,
    -0.56,
    0.75,
    0,
    mats.engDatabaseTeal
  );
  addBox(
    dbArchiveGroup,
    'DB_Index_Binder_Stack_2',
    0.24,
    0.16,
    0.22,
    -0.22,
    0.74,
    0,
    mats.paperCream
  );
  addBox(
    dbArchiveGroup,
    'DB_Backup_Cartridge_Caddy',
    0.34,
    0.11,
    0.24,
    0.2,
    0.715,
    0,
    mats.darkMetal
  );
  addBox(
    dbArchiveGroup,
    'DB_Archive_Mini_Planter',
    0.14,
    0.12,
    0.14,
    0.64,
    0.72,
    0,
    mats.terracottaPot
  );
  addBox(
    dbArchiveGroup,
    'DB_Archive_Mini_Plant',
    0.16,
    0.12,
    0.16,
    0.64,
    0.84,
    0,
    mats.plantFoliageBright
  );

  // Wall-Mounted Database Schema & ERD Reference Board on the Zone D West Wall
  // (World X = 0.22, Z = 0.88, Y = 1.62, facing East +X into the room so its front diagram
  // is 100% readable from the isometric camera and never blocks the South-East foreground!)
  const dbSchemaBoardMount = new THREE.Group();
  dbSchemaBoardMount.name = 'DB_Schema_Board_Mount';
  dbSchemaBoardMount.position.set(0.22 - 5.45, 0, 0.88 - 0.88);
  dbSchemaBoardMount.rotation.y = Math.PI / 2;
  dbArchiveGroup.add(dbSchemaBoardMount);

  buildTechnicalWallBoard(
    dbSchemaBoardMount,
    'DB_Schema_Board',
    1.22,
    0.8,
    1.62,
    mats.engSchemaBoard,
    mats.darkMetal,
    mats.engDatabaseTeal
  );

  // ==========================================================================
  // 7. STUDIO PLANTS, NORTH-EAST REFRESHMENT CONSOLE, & WALL DECORATION
  // ==========================================================================
  // 1. North-West Corner Plant (`[0.58, 0, 15.48]`)
  buildStudioPlant(groups.PROPS, 'Engineering_Plant_NW', 0.58, 0, 15.48, 0.92, mats);

  // 2. North-East Corner Plant (`[7.28, 0, 15.25]`)
  buildStudioPlant(groups.PROPS, 'Engineering_Plant_NE', 7.28, 0, 15.25, 1.0, mats);

  // 3. South-East Corner Plant (`[7.25, 0, 1.05]`)
  buildStudioPlant(groups.PROPS, 'Engineering_Plant_SE', 7.25, 0, 1.05, 0.95, mats);

  // 4. North-East Engineering Refreshment & Sprint Side Console (`[6.35, 0, 15.38]`)
  // Placed along North-East wall east of North doorway (`X = 3..5`), keeping circulation spine clear
  const neConsoleGroup = new THREE.Group();
  neConsoleGroup.name = 'Engineering_NE_Refreshment_Console';
  neConsoleGroup.position.set(6.25, 0, 15.42);
  groups.PROPS.add(neConsoleGroup);
  addContactShadow(
    groups.FLOOR,
    'NE_Console_ContactShadow',
    1.15,
    0.46,
    6.25,
    15.42,
    mats.contactShadow
  );
  addBox(
    neConsoleGroup,
    'NE_Console_Body',
    1.04,
    0.72,
    0.38,
    0,
    0.36,
    0,
    mats.warmOakWood
  );
  addBox(
    neConsoleGroup,
    'NE_Console_Top',
    1.08,
    0.04,
    0.42,
    0,
    0.74,
    0,
    mats.honeyOakLight
  );
  // Espresso / Coffee Brewer + Mug Tray on North-East Console (Y = 0.76+)
  addBox(
    neConsoleGroup,
    'NE_Espresso_Brewer',
    0.26,
    0.28,
    0.24,
    -0.26,
    0.9,
    0,
    mats.ceoCharcoalCase
  );
  addBox(
    neConsoleGroup,
    'NE_Brewer_Accent',
    0.22,
    0.04,
    0.014,
    -0.26,
    0.98,
    -0.127,
    mats.brushedBrass
  );
  addBox(
    neConsoleGroup,
    'NE_Mug_Tray',
    0.34,
    0.02,
    0.22,
    0.22,
    0.77,
    0,
    mats.darkMetal
  );
  addBox(
    neConsoleGroup,
    'NE_Mug_Coral',
    0.065,
    0.08,
    0.065,
    0.14,
    0.82,
    0,
    mats.engFrontendOrange
  );
  addBox(
    neConsoleGroup,
    'NE_Mug_Navy',
    0.065,
    0.08,
    0.065,
    0.24,
    0.82,
    0,
    mats.engBackendNavy
  );
  addBox(
    neConsoleGroup,
    'NE_Mug_Teal',
    0.065,
    0.08,
    0.065,
    0.34,
    0.82,
    0,
    mats.engDatabaseTeal
  );

  // 5. North-East Wall Framed Technical Art & Department Header Plaque (registered in northWallNodes)
  const neArtFrame1 = addBox(
    groups.DECORATION,
    'Engineering_North_Wall_Art_Frame',
    0.78,
    0.66,
    0.03,
    5.85,
    1.72,
    D - wallT - 0.02,
    mats.darkMetal
  );
  const neArtCanvas1 = addBox(
    groups.DECORATION,
    'Engineering_North_Wall_Art_Canvas',
    0.68,
    0.56,
    0.014,
    5.85,
    1.72,
    D - wallT - 0.042,
    mats.posterArt2
  );
  const neArtFrame2 = addBox(
    groups.DECORATION,
    'Engineering_North_Wall_Art_Frame_2',
    0.64,
    0.66,
    0.03,
    6.78,
    1.72,
    D - wallT - 0.02,
    mats.darkMetal
  );
  const neArtCanvas2 = addBox(
    groups.DECORATION,
    'Engineering_North_Wall_Art_Canvas_2',
    0.54,
    0.56,
    0.014,
    6.78,
    1.72,
    D - wallT - 0.042,
    mats.posterArt1
  );
  // Department Signage Plaque above North Corridor Doorway (`04 · ENGINEERING STUDIO`)
  const deptPlaqueBack = addBox(
    groups.DECORATION,
    'Engineering_North_Dept_Plaque_Back',
    1.48,
    0.24,
    0.03,
    4.0,
    2.68,
    D - wallT - 0.02,
    mats.ceoCharcoalCase
  );
  const deptPlaqueAccent = addBox(
    groups.DECORATION,
    'Engineering_North_Dept_Plaque_Stripe',
    1.36,
    0.045,
    0.014,
    4.0,
    2.61,
    D - wallT - 0.042,
    mats.engFrontendOrange
  );
  const deptPlaqueBar = addBox(
    groups.DECORATION,
    'Engineering_North_Dept_Plaque_TitleBar',
    1.12,
    0.065,
    0.014,
    4.0,
    2.71,
    D - wallT - 0.042,
    mats.paperCream
  );
  northWallNodes.push(
    neArtFrame1,
    neArtCanvas1,
    neArtFrame2,
    neArtCanvas2,
    deptPlaqueBack,
    deptPlaqueAccent,
    deptPlaqueBar
  );

  // ==========================================================================
  // 8. INTERACTION & NAVIGATION ANCHOR GIZMOS (20 Semantic Anchors)
  // ==========================================================================
  const anchorVisuals = new THREE.Group();
  anchorVisuals.name = 'Engineering_Anchor_Gizmos';
  anchorVisuals.visible = false;
  root.add(anchorVisuals);

  const zoneColors: Record<string, number> = {
    GENERAL: 0xf6ad55,
    FRONTEND_WORKSTATION: 0xe87a5d,
    BACKEND_WORKSTATION: 0x3b6e9c,
    DATABASE_WORKSTATION: 0x2e7d6b,
    INTEGRATION_REVIEW_AREA: 0x9f7aea,
  };

  for (const anchor of DEFAULT_ENGINEERING_ANCHOR_LIST) {
    const aGrp = new THREE.Group();
    aGrp.name = `ANCHOR_${anchor.id}`;
    aGrp.position.set(anchor.position[0], anchor.position[1], anchor.position[2]);
    aGrp.rotation.y = anchor.rotationY;
    aGrp.userData.isAnchorGizmo = true;
    aGrp.userData.anchorSpec = anchor;

    const ringGeom = new THREE.RingGeometry(anchor.radius * 0.72, anchor.radius, 24);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: zoneColors[anchor.zone] ?? 0x38b2ac,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.position.y = 0.022;
    aGrp.add(ringMesh);

    // Direction arrow pointing along local +Z (facing direction)
    const arrowGeom = new THREE.ConeGeometry(0.08, 0.22, 12);
    arrowGeom.rotateX(Math.PI / 2);
    const arrowMesh = new THREE.Mesh(arrowGeom, ringMat);
    arrowMesh.position.set(0, 0.06, anchor.radius * 0.85);
    aGrp.add(arrowMesh);

    anchorVisuals.add(aGrp);
  }

  // Tag all selectable catalog items with userData.catalogId for 3D viewport raycasting
  selectableFurniture.forEach((groupObj, catId) => {
    groupObj.traverse((child) => {
      child.userData.catalogId = catId;
    });
  });

  return {
    root,
    engineeringRoot: root,
    groups,
    furnitureSubgroups,
    anchorVisuals,
    southWallNodes,
    eastWallNodes,
    northWallNodes,
    westWallNodes,
    selectableFurniture,
    catalogNodeMap: selectableFurniture,
  };
}

export const buildEngineeringStudioRoom = buildEngineeringRoom;

export function buildEngineeringRoomAnchorHelpers(
  anchors: Record<EngineeringAnchorId, EngineeringActivityAnchor> = DEFAULT_ENGINEERING_ANCHORS,
  selectedAnchorId: EngineeringAnchorId | null = 'FE_DESK_WORK'
): {
  helpersRoot: THREE.Group;
  updateAnchors: (
    nextAnchors: Record<EngineeringAnchorId, EngineeringActivityAnchor>,
    nextSelected: EngineeringAnchorId | null
  ) => void;
  updateAnchorsVisuals: (
    nextAnchors: Record<EngineeringAnchorId, EngineeringActivityAnchor>,
    nextSelected: EngineeringAnchorId | null
  ) => void;
} {
  const helpersRoot = new THREE.Group();
  helpersRoot.name = 'ENGINEERING_ROOM_INSPECTOR_HELPERS';

  const anchorMarkersGroup = new THREE.Group();
  anchorMarkersGroup.name = 'Engineering_Anchor_Markers_Preview';
  helpersRoot.add(anchorMarkersGroup);

  const connectorGroup = new THREE.Group();
  connectorGroup.name = 'Engineering_Connector_Markers_Preview';
  helpersRoot.add(connectorGroup);

  // North Corridor Connector Marker at [4, 0, 16]
  const northArchGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.0, 2.3, 0.18));
  const northArchMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
  const northArchWire = new THREE.LineSegments(northArchGeo, northArchMat);
  northArchWire.position.set(4.0, 1.15, 15.91);
  connectorGroup.add(northArchWire);

  // East Main Connector Marker at [8, 0, 8]
  const eastArchGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.18, 2.3, 2.0));
  const eastArchMat = new THREE.LineBasicMaterial({ color: 0xfbbf24 });
  const eastArchWire = new THREE.LineSegments(eastArchGeo, eastArchMat);
  eastArchWire.position.set(7.91, 1.15, 8.0);
  connectorGroup.add(eastArchWire);

  const zoneColors: Record<string, number> = {
    GENERAL: 0xf6ad55,
    FRONTEND_WORKSTATION: 0xe87a5d,
    BACKEND_WORKSTATION: 0x3b6e9c,
    DATABASE_WORKSTATION: 0x2e7d6b,
    INTEGRATION_REVIEW_AREA: 0x9f7aea,
  };

  const update = (
    nextAnchors: Record<EngineeringAnchorId, EngineeringActivityAnchor>,
    nextSelected: EngineeringAnchorId | null
  ) => {
    while (anchorMarkersGroup.children.length > 0) {
      anchorMarkersGroup.remove(anchorMarkersGroup.children[0]);
    }

    const ringGeo = new THREE.RingGeometry(0.16, 0.24, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const arrowGeo = new THREE.ConeGeometry(0.065, 0.2, 10);
    arrowGeo.rotateX(Math.PI / 2);

    Object.values(nextAnchors).forEach((a) => {
      const markerGrp = new THREE.Group();
      markerGrp.name = `Anchor_Marker_${a.id}`;
      markerGrp.position.set(a.position[0], 0.024, a.position[2]);
      markerGrp.rotation.y = a.facingRad;

      const colorHex = zoneColors[a.zone] ?? 0x38bdf8;
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
      });

      const ring = new THREE.Mesh(ringGeo, mat);
      const arrow = new THREE.Mesh(arrowGeo, mat);
      arrow.position.set(0, 0.02, 0.24);
      markerGrp.add(ring, arrow);

      if (nextSelected && a.id === nextSelected) {
        markerGrp.scale.setScalar(1.3);
      }

      anchorMarkersGroup.add(markerGrp);
    });
  };

  update(anchors, selectedAnchorId);

  return {
    helpersRoot,
    updateAnchors: update,
    updateAnchorsVisuals: update,
  };
}


