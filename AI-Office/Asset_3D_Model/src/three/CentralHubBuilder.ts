import * as THREE from 'three';
import {
  CENTRAL_HUB_ANCHORS_LIST,
  CENTRAL_HUB_MODULE_CONSTANTS,
  CENTRAL_HUB_REQUIRED_GROUPS,
  CentralHubAnchorSpec,
  HUB_MEETING_SEATS_LIST,
  HubMeetingSeatSpec,
} from '../domain/centralHubSpec';
import { MaterialLibraryInstance } from './PixelMaterialLibrary';

export interface BuiltCentralHubResult {
  root: THREE.Group;
  hubRoot: THREE.Group;
  centralHubRoot: THREE.Group;
  groups: Record<string, THREE.Group>;
  anchors: Record<string, THREE.Object3D>;
  chairNodes: Record<string, THREE.Group>;
  catalogNodeMap: Map<string, THREE.Object3D>;
  seatSpecs: HubMeetingSeatSpec[];
  anchorSpecs: CentralHubAnchorSpec[];
  bounds: THREE.Box3;
}

function setShadowFlags(obj: THREE.Object3D, cast = true, receive = true): void {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
}

function buildArchitecturalPlanter(
  name: string,
  matLib: MaterialLibraryInstance,
  scale = 1.0
): THREE.Group {
  const group = new THREE.Group();
  group.name = name;

  const standMat = matLib.materials.darkMetal;
  const brassMat = matLib.materials.brushedBrass;
  const potMat = matLib.materials.ceramicCream;
  const soilMat = matLib.materials.espressoWood;
  const leafDark = matLib.materials.plantFoliageDark;
  const leafMid = matLib.materials.plantFoliageMid;
  const leafBright = matLib.materials.plantFoliageBright;

  // 4-leg architectural wood/brass planter stand
  const legPositions: [number, number][] = [
    [-0.18 * scale, -0.18 * scale],
    [0.18 * scale, -0.18 * scale],
    [-0.18 * scale, 0.18 * scale],
    [0.18 * scale, 0.18 * scale],
  ];
  legPositions.forEach(([lx, lz], idx) => {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.045 * scale, 0.28 * scale, 0.045 * scale),
      standMat
    );
    leg.name = `${name}_StandLeg_${idx + 1}`;
    leg.position.set(lx, 0.14 * scale, lz);
    group.add(leg);

    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.052 * scale, 0.04 * scale, 0.052 * scale),
      brassMat
    );
    foot.name = `${name}_BrassFoot_${idx + 1}`;
    foot.position.set(lx, 0.02 * scale, lz);
    group.add(foot);
  });

  // Brass collar ring
  const collar = new THREE.Mesh(
    new THREE.BoxGeometry(0.44 * scale, 0.035 * scale, 0.44 * scale),
    brassMat
  );
  collar.name = `${name}_BrassCollar`;
  collar.position.set(0, 0.22 * scale, 0);
  group.add(collar);

  // Ceramic vessel body
  const vessel = new THREE.Mesh(
    new THREE.BoxGeometry(0.42 * scale, 0.42 * scale, 0.42 * scale),
    potMat
  );
  vessel.name = `${name}_CeramicVessel`;
  vessel.position.set(0, 0.36 * scale, 0);
  group.add(vessel);

  // Soil bed
  const soil = new THREE.Mesh(
    new THREE.BoxGeometry(0.36 * scale, 0.04 * scale, 0.36 * scale),
    soilMat
  );
  soil.name = `${name}_SoilBed`;
  soil.position.set(0, 0.56 * scale, 0);
  group.add(soil);

  // Trunk & sculpted voxel foliage clusters
  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(0.07 * scale, 0.42 * scale, 0.07 * scale),
    soilMat
  );
  trunk.name = `${name}_Trunk`;
  trunk.position.set(0, 0.76 * scale, 0);
  group.add(trunk);

  const clusters: { pos: [number, number, number]; size: [number, number, number]; mat: THREE.Material }[] = [
    { pos: [0, 0.92 * scale, 0], size: [0.46 * scale, 0.24 * scale, 0.46 * scale], mat: leafDark },
    { pos: [-0.12 * scale, 1.08 * scale, 0.08 * scale], size: [0.34 * scale, 0.24 * scale, 0.34 * scale], mat: leafMid },
    { pos: [0.12 * scale, 1.12 * scale, -0.08 * scale], size: [0.32 * scale, 0.22 * scale, 0.32 * scale], mat: leafMid },
    { pos: [0, 1.24 * scale, 0], size: [0.28 * scale, 0.2 * scale, 0.28 * scale], mat: leafBright },
  ];

  clusters.forEach((c, idx) => {
    const foliage = new THREE.Mesh(new THREE.BoxGeometry(...c.size), c.mat);
    foliage.name = `${name}_Foliage_${idx + 1}`;
    foliage.position.set(...c.pos);
    group.add(foliage);
  });

  setShadowFlags(group, true, true);
  return group;
}

function buildMeetingChair(
  seatSpec: HubMeetingSeatSpec,
  matLib: MaterialLibraryInstance
): THREE.Group {
  const chair = new THREE.Group();
  chair.name = seatSpec.chairMeshName;
  chair.position.set(...seatSpec.localPosition);
  chair.rotation.set(0, seatSpec.rotationY ?? seatSpec.facingRad ?? 0, 0);

  const isOwnerReserved =
    seatSpec.assignedRoleId === 'HUB_MEETING_OWNER_RESERVED' ||
    seatSpec.assignedRole === 'HUB_MEETING_OWNER_RESERVED';
  const fabricMat = matLib.materials.hubNavyChairFabric;
  const woodShellMat = isOwnerReserved
    ? matLib.materials.darkWalnutWood
    : matLib.materials.warmOakWood;
  const metalMat = matLib.materials.darkMetal;
  const brassMat = matLib.materials.brushedBrass;

  // 4-star swivel base legs (resting safely at Y = 0.014 above rug Y = 0.012)
  const baseHub = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.04, 0.11), metalMat);
  baseHub.name = `${seatSpec.chairMeshName}_BaseHub`;
  baseHub.position.set(0, 0.055, 0);
  chair.add(baseHub);

  const legOffsets: [number, number, number, number][] = [
    [0, 0.032, 0.22, 0],
    [0.22, 0.032, 0, Math.PI / 2],
  ];
  legOffsets.forEach(([ w, h, d, rotY ], idx) => {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(idx === 0 ? 0.045 : w * 2, h, idx === 0 ? d * 2 : 0.045),
      metalMat
    );
    bar.name = `${seatSpec.chairMeshName}_StarBar_${idx + 1}`;
    bar.position.set(0, 0.032, 0);
    bar.rotation.y = rotY;
    chair.add(bar);
  });

  // Pneumatic cylinder stem
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.30, 0.065), metalMat);
  stem.name = `${seatSpec.chairMeshName}_Stem`;
  stem.position.set(0, 0.22, 0);
  chair.add(stem);

  // Brass collar accent on stem
  const stemCollar = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.035, 0.075), brassMat);
  stemCollar.name = `${seatSpec.chairMeshName}_StemCollar`;
  stemCollar.position.set(0, 0.12, 0);
  chair.add(stemCollar);

  // Sculpted wooden under-seat tray
  const seatTray = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.045, 0.52), woodShellMat);
  seatTray.name = `${seatSpec.chairMeshName}_WoodSeatTray`;
  seatTray.position.set(0, 0.385, 0);
  chair.add(seatTray);

  // Upholstered navy/slate seat cushion (top at Y = 0.455)
  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.065, 0.50), fabricMat);
  cushion.name = `${seatSpec.chairMeshName}_SeatCushion`;
  cushion.position.set(0, 0.435, 0.01);
  chair.add(cushion);

  // Note: chair local +Z is forward (facing table), local -Z is backrest side
  const backSupportSpine = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.045), metalMat);
  backSupportSpine.name = `${seatSpec.chairMeshName}_BackSpine`;
  backSupportSpine.position.set(0, 0.52, -0.255);
  chair.add(backSupportSpine);

  // Outer bentwood shell on backrest (-Z side)
  const backWoodShell = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.40, 0.04), woodShellMat);
  backWoodShell.name = `${seatSpec.chairMeshName}_BackWoodShell`;
  backWoodShell.position.set(0, 0.68, -0.24);
  chair.add(backWoodShell);

  // Inner upholstered backrest pad (+Z side of backrest)
  const backPad = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.36, 0.055), fabricMat);
  backPad.name = `${seatSpec.chairMeshName}_BackCushion`;
  backPad.position.set(0, 0.68, -0.195);
  chair.add(backPad);

  // Left & Right architectural armrests
  [-0.27, 0.27].forEach((ax, idx) => {
    const armRiser = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.20, 0.045), metalMat);
    armRiser.name = `${seatSpec.chairMeshName}_ArmRiser_${idx + 1}`;
    armRiser.position.set(ax, 0.50, -0.04);
    chair.add(armRiser);

    const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.032, 0.32), woodShellMat);
    armPad.name = `${seatSpec.chairMeshName}_ArmPad_${idx + 1}`;
    armPad.position.set(ax, 0.61, 0.02);
    chair.add(armPad);
  });

  // Subtle brass crest bar on top of backrest for HUB_MEETING_OWNER_RESERVED
  if (isOwnerReserved) {
    const ownerCrest = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.028, 0.05), brassMat);
    ownerCrest.name = `${seatSpec.chairMeshName}_OwnerReservedCrest`;
    ownerCrest.position.set(0, 0.89, -0.22);
    chair.add(ownerCrest);
  }

  chair.userData = {
    seatId: seatSpec.seatId,
    seatNumber: seatSpec.seatNumber,
    side: seatSpec.side,
    assignedAgentId: seatSpec.assignedAgentId,
    assignedRole: seatSpec.assignedRole,
    occupancyPolicy: seatSpec.occupancyPolicy,
  };

  setShadowFlags(chair, true, true);
  return chair;
}

export function buildCentralHubComplete(
  matLib: MaterialLibraryInstance
): BuiltCentralHubResult {
  const root = new THREE.Group();
  root.name = CENTRAL_HUB_MODULE_CONSTANTS.rootNodeName;
  // Local origin [0, 0, 0]; OfficeAssembler mounts this at global [8, 0, 0]
  root.position.set(0, 0, 0);

  const groups: Record<string, THREE.Group> = {};
  for (const groupName of CENTRAL_HUB_REQUIRED_GROUPS) {
    const g = new THREE.Group();
    g.name = groupName;
    root.add(g);
    groups[groupName] = g;
  }

  const W = CENTRAL_HUB_MODULE_CONSTANTS.width; // 16.0
  const D = CENTRAL_HUB_MODULE_CONSTANTS.depth; // 16.0
  const H = CENTRAL_HUB_MODULE_CONSTANTS.wallHeight; // 3.2

  // ============================================================================
  // 1. FLOOR, PARQUET (12x12), STONE_PERIMETER (2u ring), FLOOR_TRIMS
  // ============================================================================
  const subbase = new THREE.Mesh(
    new THREE.BoxGeometry(W, 0.12, D),
    matLib.materials.floorSubbase
  );
  subbase.name = 'Hub_Floor_Subbase';
  subbase.position.set(W / 2, -0.10, D / 2); // Y = -0.16 .. -0.04
  subbase.receiveShadow = true;
  groups.FLOOR.add(subbase);

  // Central 12x12 Warm Natural Oak Herringbone Parquet (local X = 2..14, Z = 2..14, Y = -0.04..0.00)
  const parquetSlab = new THREE.Mesh(
    new THREE.BoxGeometry(12.0, 0.04, 12.0),
    matLib.materials.centralHubParquet
  );
  parquetSlab.name = 'Hub_Parquet_Herringbone_Center';
  parquetSlab.position.set(8.0, -0.02, 8.0);
  parquetSlab.receiveShadow = true;
  groups.PARQUET.add(parquetSlab);

  // 2u Warm Greige Large-Format Stone circulation perimeter (zero overlap with 12x12 parquet)
  const stoneSouth = new THREE.Mesh(
    new THREE.BoxGeometry(16.0, 0.04, 2.0),
    matLib.materials.warmGreigeStone
  );
  stoneSouth.name = 'Hub_Stone_Perimeter_South';
  stoneSouth.position.set(8.0, -0.02, 1.0); // X=0..16, Z=0..2
  stoneSouth.receiveShadow = true;
  groups.STONE_PERIMETER.add(stoneSouth);

  const stoneNorth = new THREE.Mesh(
    new THREE.BoxGeometry(16.0, 0.04, 2.0),
    matLib.materials.warmGreigeStone
  );
  stoneNorth.name = 'Hub_Stone_Perimeter_North';
  stoneNorth.position.set(8.0, -0.02, 15.0); // X=0..16, Z=14..16
  stoneNorth.receiveShadow = true;
  groups.STONE_PERIMETER.add(stoneNorth);

  const stoneWest = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.04, 12.0),
    matLib.materials.warmGreigeStone
  );
  stoneWest.name = 'Hub_Stone_Perimeter_West';
  stoneWest.position.set(1.0, -0.02, 8.0); // X=0..2, Z=2..14
  stoneWest.receiveShadow = true;
  groups.STONE_PERIMETER.add(stoneWest);

  const stoneEast = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.04, 12.0),
    matLib.materials.warmGreigeStone
  );
  stoneEast.name = 'Hub_Stone_Perimeter_East';
  stoneEast.position.set(15.0, -0.02, 8.0); // X=14..16, Z=2..14
  stoneEast.receiveShadow = true;
  groups.STONE_PERIMETER.add(stoneEast);

  // FLOOR_TRIMS: Restrained 2mm (0.002u) brushed brass transition border at X=2..14, Z=2..14
  const brassBorderGroup = new THREE.Group();
  brassBorderGroup.name = 'Hub_Floor_Brass_Border_Group';
  const trimThickness = 0.045;
  const trimHeight = 0.002;
  const trimY = 0.001; // Y = 0.000 .. 0.002

  const trimSegments: { name: string; size: [number, number, number]; pos: [number, number, number] }[] = [
    { name: 'Hub_Brass_Trim_South', size: [12.0 + trimThickness, trimHeight, trimThickness], pos: [8.0, trimY, 2.0] },
    { name: 'Hub_Brass_Trim_North', size: [12.0 + trimThickness, trimHeight, trimThickness], pos: [8.0, trimY, 14.0] },
    { name: 'Hub_Brass_Trim_West', size: [trimThickness, trimHeight, 12.0], pos: [2.0, trimY, 8.0] },
    { name: 'Hub_Brass_Trim_East', size: [trimThickness, trimHeight, 12.0], pos: [14.0, trimY, 8.0] },
    // Subtle doorway thresholds at West (Engineering X=0, Z=8), East (QA/DevOps X=16, Z=8), and North Corridor
    { name: 'Hub_Threshold_West_Engineering', size: [0.16, 0.003, 2.2], pos: [0.08, 0.0015, 8.0] },
    { name: 'Hub_Threshold_East_QADevOps', size: [0.16, 0.003, 2.2], pos: [15.92, 0.0015, 8.0] },
  ];

  trimSegments.forEach((seg) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...seg.size), matLib.materials.hubBrassTrim);
    mesh.name = seg.name;
    mesh.position.set(...seg.pos);
    mesh.receiveShadow = true;
    brassBorderGroup.add(mesh);
  });
  groups.FLOOR_TRIMS.add(brassBorderGroup);

  // ============================================================================
  // 2. ENTRANCE_STRUCTURE: Main Office South Entrance at local [8, 0, 0] (global [16, 0, 0])
  // ============================================================================
  const entranceGroup = new THREE.Group();
  entranceGroup.name = 'Hub_Main_Entrance_Portal_Group';

  // Flanking South perimeter architectural low wall curbs (X=0..6.55 and X=9.45..16.0, height 0.52u)
  // Defines the South building edge while keeping the Central Hub open and visible in Isometric view
  [
    { name: 'Hub_South_Facade_Wall_West', xCenter: 3.275, width: 6.55 },
    { name: 'Hub_South_Facade_Wall_East', xCenter: 12.725, width: 6.55 },
  ].forEach((seg) => {
    const curbWall = new THREE.Mesh(
      new THREE.BoxGeometry(seg.width, 0.48, 0.18),
      matLib.materials.warmWall
    );
    curbWall.name = seg.name;
    curbWall.position.set(seg.xCenter, 0.24, 0.09);
    entranceGroup.add(curbWall);

    const curbCap = new THREE.Mesh(
      new THREE.BoxGeometry(seg.width, 0.04, 0.20),
      matLib.materials.darkWalnutWood
    );
    curbCap.name = `${seg.name}_TopCap`;
    curbCap.position.set(seg.xCenter, 0.50, 0.09);
    entranceGroup.add(curbCap);
  });

  // Full-height 3.2u Architectural Portal Frame at X = 6.55..9.45 (Clear opening X = 6.80..9.20 = 2.40u)
  const portalColumnPositions = [
    { suffix: 'West', x: 6.675 },
    { suffix: 'East', x: 9.325 },
  ];
  portalColumnPositions.forEach((col) => {
    // Brass plinth base
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(0.27, 0.12, 0.36),
      matLib.materials.brushedBrass
    );
    plinth.name = `Hub_Entrance_Portal_Plinth_${col.suffix}`;
    plinth.position.set(col.x, 0.06, 0.16);
    entranceGroup.add(plinth);

    // Sculpted walnut column
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, H, 0.32),
      matLib.materials.darkWalnutWood
    );
    pillar.name = `Hub_Entrance_Portal_Column_${col.suffix}`;
    pillar.position.set(col.x, H / 2, 0.16);
    entranceGroup.add(pillar);

    // Dark metal architectural casing trim
    const metalReveal = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, H - 0.10, 0.34),
      matLib.materials.darkMetal
    );
    metalReveal.name = `Hub_Entrance_Portal_Reveal_${col.suffix}`;
    metalReveal.position.set(col.suffix === 'West' ? 6.81 : 9.19, (H - 0.10) / 2, 0.16);
    entranceGroup.add(metalReveal);
  });

  // Overhead Transom Beam (Y = 2.62..3.20)
  const headerBeam = new THREE.Mesh(
    new THREE.BoxGeometry(2.94, 0.22, 0.36),
    matLib.materials.darkWalnutWood
  );
  headerBeam.name = 'Hub_Entrance_Portal_Header_Lower';
  headerBeam.position.set(8.0, 2.71, 0.16);
  entranceGroup.add(headerBeam);

  const topCrownBeam = new THREE.Mesh(
    new THREE.BoxGeometry(3.04, 0.16, 0.40),
    matLib.materials.darkWalnutWood
  );
  topCrownBeam.name = 'Hub_Entrance_Portal_Crown';
  topCrownBeam.position.set(8.0, 3.12, 0.16);
  entranceGroup.add(topCrownBeam);

  // Glazed transom window between Y = 2.82 and 3.04
  const transomGlass = new THREE.Mesh(
    new THREE.BoxGeometry(2.34, 0.22, 0.04),
    matLib.materials.windowGlass
  );
  transomGlass.name = 'Hub_Entrance_Transom_Glass';
  transomGlass.position.set(8.0, 2.93, 0.16);
  entranceGroup.add(transomGlass);

  // Brushed brass architectural header bar
  const brassFascia = new THREE.Mesh(
    new THREE.BoxGeometry(1.60, 0.08, 0.03),
    matLib.materials.brushedBrass
  );
  brassFascia.name = 'Hub_Entrance_Brass_Signage_Plaque';
  brassFascia.position.set(8.0, 2.71, 0.35);
  entranceGroup.add(brassFascia);

  // Recessed stone & brass threshold at Y = 0.000..0.005
  const thresholdGroup = new THREE.Group();
  thresholdGroup.name = 'Hub_Main_Entrance_Threshold_Group';
  const thresholdPlate = new THREE.Mesh(
    new THREE.BoxGeometry(2.60, 0.004, 0.38),
    matLib.materials.hubBrassTrim
  );
  thresholdPlate.name = 'Hub_Entrance_Brass_Threshold';
  thresholdPlate.position.set(8.0, 0.002, 0.18);
  thresholdGroup.add(thresholdPlate);

  // Welcome Mat inside the entrance at Z = 0.45..1.55 (Y = 0.002..0.009)
  const welcomeMat = new THREE.Mesh(
    new THREE.BoxGeometry(2.24, 0.007, 1.10),
    matLib.materials.hubWelcomeMat
  );
  welcomeMat.name = 'Hub_Entrance_Welcome_Mat';
  welcomeMat.position.set(8.0, 0.0055, 1.00);
  thresholdGroup.add(welcomeMat);

  const welcomeMatBrassInlay = new THREE.Mesh(
    new THREE.BoxGeometry(1.96, 0.008, 0.04),
    matLib.materials.hubBrassTrim
  );
  welcomeMatBrassInlay.name = 'Hub_Entrance_Welcome_Mat_Brass_Strip';
  welcomeMatBrassInlay.position.set(8.0, 0.006, 1.44);
  thresholdGroup.add(welcomeMatBrassInlay);

  // Double Glazed Architectural Door Leaves (swung open inward at 68 degrees)
  const buildGlazedDoorLeaf = (side: 'West' | 'East'): THREE.Group => {
    const pivot = new THREE.Group();
    pivot.name = `Hub_Main_Entrance_Door_Leaf_${side}`;
    const leafW = 1.16;
    const leafH = 2.56;
    const dir = side === 'West' ? 1 : -1;

    // Position hinge at portal inner edge
    pivot.position.set(side === 'West' ? 6.84 : 9.16, 0.02, 0.22);
    // Open inward (+Z) at 68 degrees
    pivot.rotation.y = side === 'West' ? -Math.PI * 0.38 : Math.PI * 0.38;

    // Stile & rail frame
    const outerStile = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, leafH, 0.06),
      matLib.materials.darkMetal
    );
    outerStile.position.set(dir * 0.04, leafH / 2, 0);
    pivot.add(outerStile);

    const innerStile = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, leafH, 0.06),
      matLib.materials.darkMetal
    );
    innerStile.position.set(dir * (leafW - 0.04), leafH / 2, 0);
    pivot.add(innerStile);

    const bottomRail = new THREE.Mesh(
      new THREE.BoxGeometry(leafW, 0.22, 0.06),
      matLib.materials.darkWalnutWood
    );
    bottomRail.position.set(dir * (leafW / 2), 0.11, 0);
    pivot.add(bottomRail);

    const topRail = new THREE.Mesh(
      new THREE.BoxGeometry(leafW, 0.12, 0.06),
      matLib.materials.darkMetal
    );
    topRail.position.set(dir * (leafW / 2), leafH - 0.06, 0);
    pivot.add(topRail);

    // Clear architectural glass pane
    const glassPane = new THREE.Mesh(
      new THREE.BoxGeometry(leafW - 0.16, leafH - 0.34, 0.025),
      matLib.materials.windowGlass
    );
    glassPane.position.set(dir * (leafW / 2), 0.22 + (leafH - 0.34) / 2, 0);
    pivot.add(glassPane);

    // Brushed brass vertical pull handles (both sides of door)
    [-0.045, 0.045].forEach((hz, idx) => {
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.032, 0.56, 0.032),
        matLib.materials.brushedBrass
      );
      handle.name = `Hub_Door_${side}_BrassHandle_${idx + 1}`;
      handle.position.set(dir * (leafW - 0.12), 1.12, hz);
      pivot.add(handle);
    });

    return pivot;
  };

  const doorWest = buildGlazedDoorLeaf('West');
  const doorEast = buildGlazedDoorLeaf('East');
  entranceGroup.add(doorWest);
  entranceGroup.add(doorEast);

  setShadowFlags(entranceGroup, true, true);
  setShadowFlags(thresholdGroup, false, true);
  groups.ENTRANCE_STRUCTURE.add(entranceGroup);
  groups.ENTRANCE_STRUCTURE.add(thresholdGroup);

  // ============================================================================
  // 3. MEETING_RUG: Large 8.8u x 4.8u 3D Woven Rug at local [8, 0, 8]
  // ============================================================================
  const rugGroup = new THREE.Group();
  rugGroup.name = 'Hub_Meeting_Rug_Group';

  const rugMesh = new THREE.Mesh(
    new THREE.BoxGeometry(
      CENTRAL_HUB_MODULE_CONSTANTS.rugWidth,
      CENTRAL_HUB_MODULE_CONSTANTS.rugThickness,
      CENTRAL_HUB_MODULE_CONSTANTS.rugDepth
    ),
    matLib.materials.hubMeetingRug
  );
  rugMesh.name = 'Hub_Meeting_Area_Rug';
  // Y = 0.002 .. 0.012 (safely above floor trim Y=0.002, below furniture feet Y=0.014)
  rugMesh.position.set(8.0, 0.007, 8.0);
  rugMesh.receiveShadow = true;
  rugGroup.add(rugMesh);
  groups.MEETING_RUG.add(rugGroup);

  // ============================================================================
  // 4. MEETING_TABLE: Enlarged 6.8u x 2.3u x 0.75u Conference Table at local [8, 0, 8]
  // ============================================================================
  const tableGroup = new THREE.Group();
  tableGroup.name = 'Hub_Conference_Table_Group';
  tableGroup.position.set(8.0, 0.0, 8.0);

  const tW = CENTRAL_HUB_MODULE_CONSTANTS.tableWidth; // 6.80
  const tD = CENTRAL_HUB_MODULE_CONSTANTS.tableDepth; // 2.30
  const tH = CENTRAL_HUB_MODULE_CONSTANTS.tableHeight; // 0.75

  // 3 sculpted architectural pedestal bases at X = -2.25, 0.0, +2.25
  [-2.25, 0.0, 2.25].forEach((px, idx) => {
    const footPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.036, 1.18),
      matLib.materials.darkMetal
    );
    footPlate.name = `Hub_Table_Pedestal_Foot_${idx + 1}`;
    footPlate.position.set(px, 0.032, 0); // bottom at Y = 0.014 above rug
    tableGroup.add(footPlate);

    const brassCuff = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.05, 0.76),
      matLib.materials.brushedBrass
    );
    brassCuff.name = `Hub_Table_Pedestal_BrassCuff_${idx + 1}`;
    brassCuff.position.set(px, 0.075, 0);
    tableGroup.add(brassCuff);

    const column = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.58, 0.72),
      matLib.materials.darkWalnutWood
    );
    column.name = `Hub_Table_Pedestal_Column_${idx + 1}`;
    column.position.set(px, 0.39, 0);
    tableGroup.add(column);
  });

  // Structural under-frame beam connecting the 3 pedestals
  const underBeam = new THREE.Mesh(
    new THREE.BoxGeometry(5.60, 0.07, 0.56),
    matLib.materials.darkMetal
  );
  underBeam.name = 'Hub_Table_Structural_Underbeam';
  underBeam.position.set(0, 0.655, 0);
  tableGroup.add(underBeam);

  // Dark metal & brass beveled sub-apron under tabletop
  const apronTrim = new THREE.Mesh(
    new THREE.BoxGeometry(tW - 0.08, 0.028, tD - 0.08),
    matLib.materials.brushedBrass
  );
  apronTrim.name = 'Hub_Table_Brass_Bevel_Apron';
  apronTrim.position.set(0, 0.695, 0);
  tableGroup.add(apronTrim);

  // Primary Walnut/Medium-Oak Conference Tabletop (Y = 0.705 .. 0.750)
  const tabletop = new THREE.Mesh(
    new THREE.BoxGeometry(tW, 0.045, tD),
    matLib.materials.hubWalnutTabletop
  );
  tabletop.name = 'Hub_Conference_Tabletop_Main';
  tabletop.position.set(0, 0.7275, 0);
  tableGroup.add(tabletop);

  // Recessed central cable-management & power trough (Y = 0.751 .. 0.756)
  const cableInsert = new THREE.Mesh(
    new THREE.BoxGeometry(4.30, 0.008, 0.28),
    matLib.materials.darkMetal
  );
  cableInsert.name = 'Hub_Table_Cable_Management_Insert';
  cableInsert.position.set(0, 0.754, 0);
  tableGroup.add(cableInsert);

  const cableBrassTrim = new THREE.Mesh(
    new THREE.BoxGeometry(4.34, 0.005, 0.32),
    matLib.materials.brushedBrass
  );
  cableBrassTrim.name = 'Hub_Table_Cable_Brass_Bezel';
  cableBrassTrim.position.set(0, 0.7525, 0);
  tableGroup.add(cableBrassTrim);

  // Low-profile architectural centerpiece planter tray in center of table
  const centerpieceTray = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.045, 0.22),
    matLib.materials.ceramicCream
  );
  centerpieceTray.name = 'Hub_Table_Centerpiece_Tray';
  centerpieceTray.position.set(0, 0.778, 0);
  tableGroup.add(centerpieceTray);

  [-0.36, 0, 0.36].forEach((bx, idx) => {
    const succulent = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.075, 0.14),
      idx === 1 ? matLib.materials.plantFoliageBright : matLib.materials.plantFoliageMid
    );
    succulent.name = `Hub_Table_Centerpiece_Greenery_${idx + 1}`;
    succulent.position.set(bx, 0.825, 0);
    tableGroup.add(succulent);
  });

  // Executive notebooks & tablets at each of the 10 place settings
  const placeXOffsets = [-2.6, -1.3, 0.0, 1.3, 2.6];
  placeXOffsets.forEach((px, idx) => {
    // North side place setting (Z = +0.76)
    const padNorth = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.012, 0.23),
      idx === 0 ? matLib.materials.darkMetal : matLib.materials.paperCream
    );
    padNorth.name = `Hub_Table_PlaceSetting_North_${idx + 1}`;
    padNorth.position.set(px, 0.756, 0.76);
    tableGroup.add(padNorth);

    // South side place setting (Z = -0.76)
    const padSouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.012, 0.23),
      idx % 2 === 0 ? matLib.materials.paperCream : matLib.materials.darkMetal
    );
    padSouth.name = `Hub_Table_PlaceSetting_South_${idx + 1}`;
    padSouth.position.set(px, 0.756, -0.76);
    tableGroup.add(padSouth);
  });

  setShadowFlags(tableGroup, true, true);
  groups.MEETING_TABLE.add(tableGroup);

  // ============================================================================
  // 5. MEETING_CHAIRS: 10 Distinct Chairs matching HUB_MEETING_SEATS_LIST
  // ============================================================================
  const chairNodes: Record<string, THREE.Group> = {};
  for (const seatSpec of HUB_MEETING_SEATS_LIST) {
    const chairMesh = buildMeetingChair(seatSpec, matLib);
    groups.MEETING_CHAIRS.add(chairMesh);
    chairNodes[seatSpec.seatId] = chairMesh;
  }

  // ============================================================================
  // 6. PLANTS: 6 Substantial Architectural Planters on Wood/Brass Stands
  // ============================================================================
  const planterSpecs: { name: string; pos: [number, number, number]; scale: number }[] = [
    { name: 'Hub_Entrance_Planter_West_Group', pos: [5.95, 0.0, 0.72], scale: 1.05 },
    { name: 'Hub_Entrance_Planter_East_Group', pos: [10.05, 0.0, 0.72], scale: 1.05 },
    { name: 'Hub_Corner_Planter_SW_Group', pos: [1.15, 0.0, 1.35], scale: 1.12 },
    { name: 'Hub_Corner_Planter_NW_Group', pos: [1.15, 0.0, 14.65], scale: 1.12 },
    { name: 'Hub_Corner_Planter_NE_Group', pos: [14.85, 0.0, 14.65], scale: 1.12 },
    { name: 'Hub_Corner_Planter_SE_Group', pos: [14.85, 0.0, 1.35], scale: 1.12 },
  ];

  for (const pSpec of planterSpecs) {
    const planter = buildArchitecturalPlanter(pSpec.name, matLib, pSpec.scale);
    planter.position.set(...pSpec.pos);
    groups.PLANTS.add(planter);
  }

  // ============================================================================
  // 7. DECORATION:
  //    - North-East Refreshment & Coffee Sideboard Console ([13.2, 0, 14.95])
  //    - South-East Visitor Waiting Bench ([13.1, 0, 2.25])
  //    - West Freestanding Collaborative Review Display ([2.35, 0, 8.0], Single Front Screen!)
  // ============================================================================
  // 7A. Refreshment & Hospitality Sideboard Console
  const sideboardGroup = new THREE.Group();
  sideboardGroup.name = 'Hub_Refreshment_Sideboard_Group';
  sideboardGroup.position.set(13.2, 0.0, 14.95);

  const sbBody = new THREE.Mesh(
    new THREE.BoxGeometry(2.60, 0.78, 0.68),
    matLib.materials.darkWalnutWood
  );
  sbBody.name = 'Hub_Sideboard_Cabinet_Body';
  sbBody.position.set(0, 0.44, 0);
  sideboardGroup.add(sbBody);

  const sbCounter = new THREE.Mesh(
    new THREE.BoxGeometry(2.68, 0.05, 0.72),
    matLib.materials.ceramicCream
  );
  sbCounter.name = 'Hub_Sideboard_Stone_Countertop';
  sbCounter.position.set(0, 0.855, 0);
  sideboardGroup.add(sbCounter);

  // Espresso machine & hospitality cups on counter
  const espressoMaker = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.36, 0.34),
    matLib.materials.darkMetal
  );
  espressoMaker.name = 'Hub_Sideboard_Espresso_Machine';
  espressoMaker.position.set(-0.65, 1.06, -0.04);
  sideboardGroup.add(espressoMaker);

  const espressoBrassAccent = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.05, 0.36),
    matLib.materials.brushedBrass
  );
  espressoBrassAccent.name = 'Hub_Sideboard_Espresso_BrassTrim';
  espressoBrassAccent.position.set(-0.65, 1.21, -0.04);
  sideboardGroup.add(espressoBrassAccent);

  const trayMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.03, 0.36),
    matLib.materials.warmOakWood
  );
  trayMesh.name = 'Hub_Sideboard_Service_Tray';
  trayMesh.position.set(0.42, 0.895, 0);
  sideboardGroup.add(trayMesh);

  [-0.16, 0.04, 0.24].forEach((cx, idx) => {
    const cup = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.11, 0.09),
      matLib.materials.ceramicCream
    );
    cup.name = `Hub_Sideboard_Cup_${idx + 1}`;
    cup.position.set(0.42 + cx, 0.965, 0);
    sideboardGroup.add(cup);
  });

  setShadowFlags(sideboardGroup, true, true);
  groups.DECORATION.add(sideboardGroup);

  // 7B. South-East Visitor Waiting Bench
  const benchGroup = new THREE.Group();
  benchGroup.name = 'Hub_Visitor_Waiting_Bench_Group';
  benchGroup.position.set(13.1, 0.0, 2.25);

  const benchFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 0.08, 0.68),
    matLib.materials.warmOakWood
  );
  benchFrame.name = 'Hub_Waiting_Bench_WoodDeck';
  benchFrame.position.set(0, 0.34, 0);
  benchGroup.add(benchFrame);

  const benchCushion = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 0.09, 0.62),
    matLib.materials.hubNavyChairFabric
  );
  benchCushion.name = 'Hub_Waiting_Bench_UpholsteredCushion';
  benchCushion.position.set(-0.24, 0.425, 0);
  benchGroup.add(benchCushion);

  [-1.02, 1.02].forEach((lx, idx) => {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.30, 0.62),
      matLib.materials.darkMetal
    );
    leg.name = `Hub_Waiting_Bench_Leg_${idx + 1}`;
    leg.position.set(lx, 0.15, 0);
    benchGroup.add(leg);
  });

  setShadowFlags(benchGroup, true, true);
  groups.DECORATION.add(benchGroup);

  // 7C. West Freestanding Shared Review Display (local [2.35, 0, 8.0], facing +X toward table)
  // Strictly SINGLE FRONT SCREEN (+X face) and clean opaque rear casing (-X face)
  const reviewDisplayGroup = new THREE.Group();
  reviewDisplayGroup.name = 'Hub_Shared_Review_Display_Group';
  reviewDisplayGroup.position.set(2.35, 0.0, 8.0);
  // Local +Z of group will point toward +X (East, toward conference table)
  reviewDisplayGroup.rotation.y = Math.PI / 2;

  const displayBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.05, 0.56),
    matLib.materials.darkMetal
  );
  displayBase.name = 'Hub_Review_Display_FloorBase';
  displayBase.position.set(0, 0.025, 0);
  reviewDisplayGroup.add(displayBase);

  [-0.62, 0.62].forEach((px, idx) => {
    const upright = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.95, 0.08),
      matLib.materials.darkMetal
    );
    upright.name = `Hub_Review_Display_Pillar_${idx + 1}`;
    upright.position.set(px, 1.00, 0);
    reviewDisplayGroup.add(upright);
  });

  // Opaque walnut & dark metal rear enclosure (thickness 0.11u)
  const displayHousing = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 1.24, 0.10),
    matLib.materials.darkWalnutWood
  );
  displayHousing.name = 'Hub_Review_Display_Opaque_Rear_Casing';
  displayHousing.position.set(0, 1.48, -0.01);
  reviewDisplayGroup.add(displayHousing);

  const displayBezel = new THREE.Mesh(
    new THREE.BoxGeometry(2.40, 1.28, 0.08),
    matLib.materials.darkMetal
  );
  displayBezel.name = 'Hub_Review_Display_Metal_Bezel';
  displayBezel.position.set(0, 1.48, 0.01);
  reviewDisplayGroup.add(displayBezel);

  // SINGLE FRONT SCREEN (+Z in display group = +X in Hub space facing the conference table)
  const frontScreen = new THREE.Mesh(
    new THREE.BoxGeometry(2.24, 1.12, 0.015),
    matLib.materials.hubReviewBoardScreen
  );
  frontScreen.name = 'Hub_Review_Display_Front_Screen';
  frontScreen.position.set(0, 1.48, 0.052);
  reviewDisplayGroup.add(frontScreen);

  setShadowFlags(reviewDisplayGroup, true, true);
  groups.DECORATION.add(reviewDisplayGroup);

  // ============================================================================
  // 8. LIGHT_FIXTURES:
  //    - 4 Warm Architectural Pedestal Floor Lamps
  //    - 2 Warm Main Entrance Sconces
  //    - 1 Overhead Suspended Linear Chandelier Ring above Conference Table
  // ============================================================================
  const pedestalLampsGroup = new THREE.Group();
  pedestalLampsGroup.name = 'Hub_Pedestal_Lamps_Group';
  const lampCoords: [number, number][] = [
    [2.55, 2.55],
    [13.45, 2.55],
    [2.55, 13.45],
    [13.45, 13.45],
  ];
  lampCoords.forEach(([lx, lz], idx) => {
    const lamp = new THREE.Group();
    lamp.name = `Hub_Pedestal_Lamp_${idx + 1}`;
    lamp.position.set(lx, 0, lz);

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.04, 0.28),
      matLib.materials.brushedBrass
    );
    base.position.set(0, 0.02, 0);
    lamp.add(base);

    const stem = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 1.45, 0.05),
      matLib.materials.darkMetal
    );
    stem.position.set(0, 0.745, 0);
    lamp.add(stem);

    const shade = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.36, 0.32),
      matLib.materials.lampShadeWarm
    );
    shade.position.set(0, 1.62, 0);
    lamp.add(shade);

    pedestalLampsGroup.add(lamp);
  });
  setShadowFlags(pedestalLampsGroup, true, true);
  groups.LIGHT_FIXTURES.add(pedestalLampsGroup);

  // Entrance Sconces
  const sconcesGroup = new THREE.Group();
  sconcesGroup.name = 'Hub_Entrance_Sconces_Group';
  [6.675, 9.325].forEach((sx, idx) => {
    const sconce = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.28, 0.10),
      matLib.materials.lampShadeWarm
    );
    sconce.name = `Hub_Entrance_Sconce_${idx + 1}`;
    sconce.position.set(sx, 2.05, 0.34);
    sconcesGroup.add(sconce);
  });
  groups.LIGHT_FIXTURES.add(sconcesGroup);

  // Suspended Architectural Linear Chandelier above the Conference Table (Y = 2.85)
  const chandelierGroup = new THREE.Group();
  chandelierGroup.name = 'Hub_Chandelier_Fixture_Group';
  chandelierGroup.position.set(8.0, 2.85, 8.0);

  const chandelierBar = new THREE.Mesh(
    new THREE.BoxGeometry(4.80, 0.06, 0.85),
    matLib.materials.brushedBrass
  );
  chandelierBar.name = 'Hub_Chandelier_Brass_Frame';
  chandelierGroup.add(chandelierBar);

  const chandelierDiffuser = new THREE.Mesh(
    new THREE.BoxGeometry(4.68, 0.03, 0.72),
    matLib.materials.lampShadeWarm
  );
  chandelierDiffuser.name = 'Hub_Chandelier_Warm_Diffuser';
  chandelierDiffuser.position.set(0, -0.025, 0);
  chandelierGroup.add(chandelierDiffuser);
  groups.LIGHT_FIXTURES.add(chandelierGroup);

  // ============================================================================
  // 9. CONNECTORS & SEMANTIC ANCHORS (18 anchors including 10 seat anchors)
  // ============================================================================
  const anchors: Record<string, THREE.Object3D> = {};
  for (const spec of CENTRAL_HUB_ANCHORS_LIST) {
    const anchorNode = new THREE.Object3D();
    anchorNode.name = spec.name;
    anchorNode.position.set(...spec.position);
    anchorNode.rotation.set(
      THREE.MathUtils.degToRad(spec.rotation[0]),
      THREE.MathUtils.degToRad(spec.rotation[1]),
      THREE.MathUtils.degToRad(spec.rotation[2])
    );
    anchorNode.userData = {
      anchorType: spec.type,
      description: spec.description,
      globalPosition: spec.globalPosition,
    };
    groups.CONNECTORS.add(anchorNode);
    anchors[spec.name] = anchorNode;
  }

  const catalogNodeMap = new Map<string, THREE.Object3D>();
  root.traverse((obj) => {
    if (obj.name) {
      catalogNodeMap.set(obj.name, obj);
    }
  });
  // Map alias catalog IDs if needed
  const mainPortalAlias =
    catalogNodeMap.get('Hub_Main_Entrance_Portal_Group') || groups.ENTRANCE_STRUCTURE;
  catalogNodeMap.set('Hub_Main_South_Entrance_Portal', mainPortalAlias);
  const rugAlias = catalogNodeMap.get('Hub_Meeting_Rug_Group') || groups.MEETING_RUG;
  catalogNodeMap.set('Hub_Meeting_Area_Rug_Group', rugAlias);

  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);

  return {
    root,
    hubRoot: root,
    centralHubRoot: root,
    groups,
    anchors,
    chairNodes,
    catalogNodeMap,
    seatSpecs: HUB_MEETING_SEATS_LIST,
    anchorSpecs: CENTRAL_HUB_ANCHORS_LIST,
    bounds,
  };
}
