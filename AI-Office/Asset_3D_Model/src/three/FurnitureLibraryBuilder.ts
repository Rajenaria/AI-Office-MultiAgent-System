import * as THREE from 'three';
import { MaterialLibraryInstance } from './PixelMaterialLibrary';
import { MODULE_CONSTANTS } from '../domain/modularRoomSpec';

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
  catalogId?: string
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (catalogId) {
    mesh.userData.catalogId = catalogId;
  }
  parent.add(mesh);
  return mesh;
}

function addCylinder(
  parent: THREE.Object3D,
  name: string,
  rTop: number,
  rBot: number,
  h: number,
  segs: number,
  x: number,
  y: number,
  z: number,
  mat: THREE.Material,
  catalogId?: string
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (catalogId) {
    mesh.userData.catalogId = catalogId;
  }
  parent.add(mesh);
  return mesh;
}

function createLayeredPottedPlant(
  name: string,
  x: number,
  y: number,
  z: number,
  scale: number,
  matLib: MaterialLibraryInstance,
  catalogId: string
): THREE.Group {
  const { materials } = matLib;
  const g = new THREE.Group();
  g.name = name;
  g.position.set(x, y, z);
  g.scale.setScalar(scale);
  g.userData.catalogId = catalogId;

  // Terracotta pot with rim (non-overlapping Y intervals: Base 0..0.19, Rim 0.19..0.23, Soil 0.23..0.244)
  addCylinder(g, `${name}_Pot_Base`, 0.14, 0.11, 0.19, 8, 0, 0.095, 0, materials.terracottaPot, catalogId);
  addCylinder(g, `${name}_Pot_Rim`, 0.155, 0.15, 0.04, 8, 0, 0.21, 0, materials.terracottaPot, catalogId);
  addCylinder(g, `${name}_Soil`, 0.125, 0.125, 0.014, 8, 0, 0.237, 0, materials.espressoWood, catalogId);

  // Stepped pixel-art foliage clusters
  addBox(g, `${name}_Leaf_Core`, 0.22, 0.22, 0.22, 0, 0.34, 0, materials.plantFoliageDark, catalogId);
  addBox(g, `${name}_Leaf_Mid1`, 0.26, 0.14, 0.18, 0.04, 0.42, 0.03, materials.plantFoliageMid, catalogId);
  addBox(g, `${name}_Leaf_Mid2`, 0.18, 0.16, 0.26, -0.04, 0.4, -0.03, materials.plantFoliageMid, catalogId);
  addBox(g, `${name}_Leaf_Top1`, 0.16, 0.12, 0.16, 0.02, 0.52, -0.02, materials.plantFoliageBright, catalogId);
  addBox(g, `${name}_Leaf_SideL`, 0.12, 0.1, 0.12, -0.13, 0.32, 0.08, materials.plantFoliageBright, catalogId);
  addBox(g, `${name}_Leaf_SideR`, 0.12, 0.1, 0.12, 0.13, 0.35, -0.07, materials.plantFoliageBright, catalogId);

  return g;
}

export function buildPMRoomFurnitureAndProps(
  groups: Record<(typeof MODULE_CONSTANTS.REQUIRED_GROUPS)[number], THREE.Group>,
  matLib: MaterialLibraryInstance
): Map<string, THREE.Object3D> {
  const { materials } = matLib;
  const catalogNodeMap = new Map<string, THREE.Object3D>();

  const registerCatalogNode = (id: string, obj: THREE.Object3D) => {
    obj.userData.catalogId = id;
    obj.traverse((child) => {
      child.userData.catalogId = id;
    });
    catalogNodeMap.set(id, obj);
  };

  // =========================================================================
  // AREA A — PROJECT MANAGER WORKSTATION (Beside Large West Casement Window)
  // Centered around X = 1.35, Z = 5.35 (facing West window at X = 0.25)
  // =========================================================================
  const deskId = 'PM_Executive_Desk';
  const deskGroup = new THREE.Group();
  deskGroup.name = deskId;
  deskGroup.position.set(1.35, 0, 5.35);

  // Tabletop (Y = 0.725..0.770) resting cleanly on chamfered apron trim (Y = 0.700..0.725)
  addBox(deskGroup, 'PM_Desk_Top_Slab', 0.95, 0.045, 1.88, 0, 0.7475, 0, materials.warmOakWood);
  addBox(deskGroup, 'PM_Desk_Top_Trim', 0.97, 0.025, 1.9, 0, 0.7125, 0, materials.darkWalnutWood);

  // Left & Right Drawer Pedestals (Y = 0.00..0.70, X = -0.43..+0.43)
  addBox(deskGroup, 'PM_Desk_Pedestal_North', 0.86, 0.7, 0.46, 0, 0.35, 0.66, materials.honeyOakLight);
  addBox(deskGroup, 'PM_Desk_Pedestal_South', 0.86, 0.7, 0.52, 0, 0.35, -0.63, materials.honeyOakLight);
  // Modesty back panel spanning strictly between North (Z = 0.43) and South (Z = -0.37) pedestals
  addBox(deskGroup, 'PM_Desk_Modesty_Panel', 0.04, 0.52, 0.8, -0.36, 0.42, 0.03, materials.darkWalnutWood);

  // Drawer fronts (X = 0.430..0.455) + pixel handles (X = 0.455..0.475) flush on South pedestal
  for (let d = 0; d < 3; d++) {
    const dy = 0.16 + d * 0.2;
    addBox(deskGroup, `PM_Desk_Drawer_Front_${d}`, 0.025, 0.16, 0.44, 0.4425, dy, -0.63, materials.warmOakWood);
    addBox(deskGroup, `PM_Desk_Drawer_Handle_${d}`, 0.02, 0.03, 0.14, 0.465, dy, -0.63, materials.darkMetal);
  }
  // Under-desk workstation PC tower (X = -0.19..+0.29) + front power LED (X = 0.290..0.302)
  addBox(deskGroup, 'PM_Workstation_PC_Tower', 0.48, 0.52, 0.24, 0.05, 0.26, -1.06, materials.darkMetal);
  addBox(deskGroup, 'PM_Workstation_PC_PowerLED', 0.012, 0.03, 0.08, 0.296, 0.44, -1.06, materials.noteSky);

  // Computer Monitor on Stand (Bezel X = -0.19..-0.13; Screen X = -0.130..-0.118)
  addBox(deskGroup, 'PM_Monitor_Base', 0.22, 0.025, 0.32, -0.18, 0.7825, -0.05, materials.darkMetal);
  addBox(deskGroup, 'PM_Monitor_Neck', 0.06, 0.22, 0.08, -0.22, 0.905, -0.05, materials.chromeSilver);
  addBox(deskGroup, 'PM_Monitor_Bezel', 0.06, 0.48, 0.76, -0.16, 1.14, -0.05, materials.darkMetal);
  addBox(deskGroup, 'PM_Monitor_Display_Screen', 0.012, 0.42, 0.7, -0.124, 1.14, -0.05, materials.monitorScreen);

  // Secondary Open Laptop on Angled Stand (North end of desk — non-overlapping base & keyboard well)
  const laptopGroup = new THREE.Group();
  laptopGroup.name = 'PM_Secondary_Laptop';
  laptopGroup.position.set(-0.08, 0.77, 0.56);
  laptopGroup.rotation.y = -0.32;
  addBox(laptopGroup, 'Laptop_Base', 0.26, 0.016, 0.36, 0, 0.008, 0, materials.chromeSilver);
  addBox(laptopGroup, 'Laptop_Keyboard_Well', 0.18, 0.008, 0.28, 0.02, 0.02, 0, materials.darkMetal);
  const lid = addBox(laptopGroup, 'Laptop_Screen_Lid', 0.016, 0.24, 0.36, -0.12, 0.13, 0, materials.chromeSilver);
  lid.rotation.z = 0.22;
  const lapScreen = addBox(laptopGroup, 'Laptop_Display', 0.008, 0.2, 0.32, -0.106, 0.132, 0, materials.monitorScreen);
  lapScreen.rotation.z = 0.22;
  deskGroup.add(laptopGroup);

  // Mechanical Keyboard + Keys + Mouse Pad + Wireless Mouse (cleanly stacked along Y above 0.770)
  addBox(deskGroup, 'PM_Keyboard_Body', 0.18, 0.018, 0.44, 0.16, 0.779, -0.05, materials.windowFrameCream);
  addBox(deskGroup, 'PM_Keyboard_Keys', 0.14, 0.012, 0.4, 0.16, 0.794, -0.05, materials.darkMetal);
  addBox(deskGroup, 'PM_Mouse_Pad', 0.24, 0.008, 0.22, 0.18, 0.774, -0.42, materials.chairSlateFabric);
  addBox(deskGroup, 'PM_Wireless_Mouse', 0.1, 0.026, 0.065, 0.18, 0.791, -0.42, materials.windowFrameCream);

  // Architect Desk Lamp (South corner of desk)
  addCylinder(deskGroup, 'PM_Desk_Lamp_Base', 0.1, 0.11, 0.03, 8, -0.22, 0.785, -0.72, materials.brushedBrass);
  addBox(deskGroup, 'PM_Desk_Lamp_Stem', 0.03, 0.35, 0.03, -0.24, 0.975, -0.72, materials.brushedBrass);
  addCylinder(deskGroup, 'PM_Desk_Lamp_Shade', 0.06, 0.13, 0.14, 8, -0.14, 1.12, -0.66, materials.lampShadeWarm);

  // Coffee Mug, Red Hardcover Reference Book (non-overlapping cover & pages), Stack of Planning Docs & Pen Holder
  addBox(deskGroup, 'PM_Desk_Red_Reference_Book', 0.26, 0.016, 0.32, -0.18, 0.778, 0.58, materials.noteCoral);
  addBox(deskGroup, 'PM_Desk_Book_Pages', 0.24, 0.032, 0.3, -0.17, 0.802, 0.58, materials.paperCream);
  addBox(deskGroup, 'PM_Desk_Red_Reference_Book_Top', 0.26, 0.014, 0.32, -0.18, 0.825, 0.58, materials.noteCoral);
  addCylinder(deskGroup, 'PM_Desk_Coffee_Mug', 0.045, 0.04, 0.09, 8, 0.14, 0.815, 0.34, materials.ceramicCream);
  addBox(deskGroup, 'PM_Desk_Planning_Notebook', 0.22, 0.03, 0.28, 0.22, 0.785, -0.68, materials.paperCream);
  addBox(deskGroup, 'PM_Desk_Organizer_Tray', 0.12, 0.09, 0.16, -0.26, 0.815, 0.28, materials.darkWalnutWood);
  addCylinder(deskGroup, 'PM_Pen_Holder_Cup', 0.038, 0.035, 0.09, 8, -0.24, 0.815, -0.46, materials.darkMetal);
  addBox(deskGroup, 'PM_Pens_Cluster', 0.028, 0.06, 0.036, -0.24, 0.89, -0.46, materials.noteAmber);

  // Windowsill potted plants right beside the PM Desk
  const sillPlant1 = createLayeredPottedPlant('WindowSill_Plant_North', -0.95, 0.87, -0.65, 0.85, matLib, deskId);
  const sillPlant2 = createLayeredPottedPlant('WindowSill_Plant_South', -0.95, 0.87, -0.98, 0.72, matLib, deskId);
  deskGroup.add(sillPlant1, sillPlant2);

  registerCatalogNode(deskId, deskGroup);
  groups.FURNITURE.add(deskGroup);

  // =========================================================================
  // EXECUTIVE PM CHAIR (In front of PM Desk at X = 2.15, Z = 5.35, facing -X)
  // =========================================================================
  const chairId = 'PM_Executive_Chair';
  const chairGroup = new THREE.Group();
  chairGroup.name = chairId;
  chairGroup.position.set(2.15, 0, 5.35);
  chairGroup.rotation.y = -0.18;

  // 5-star caster base + central gas lift cylinder
  addCylinder(chairGroup, 'Exec_Chair_Column', 0.035, 0.04, 0.36, 8, 0, 0.22, 0, materials.darkMetal);
  for (let arm = 0; arm < 5; arm++) {
    const ang = (arm * Math.PI * 2) / 5;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.028, 0.042), materials.darkMetal);
    leg.name = `Exec_Chair_Star_Leg_${arm}`;
    leg.position.set(Math.cos(ang) * 0.14, 0.052, Math.sin(ang) * 0.14);
    leg.rotation.y = -ang;
    leg.castShadow = true;
    chairGroup.add(leg);
    addCylinder(
      chairGroup,
      `Exec_Chair_Caster_${arm}`,
      0.028,
      0.028,
      0.036,
      6,
      Math.cos(ang) * 0.25,
      0.018,
      Math.sin(ang) * 0.25,
      materials.wallCapDark
    );
  }
  // Seat cushion (Y = 0.40..0.49)
  addBox(chairGroup, 'Exec_Chair_Seat_Cushion', 0.52, 0.09, 0.54, 0, 0.445, 0, materials.executiveLeather);
  // Sculpted high backrest (Y = 0.49..1.03) + headrest (Y = 1.03..1.19)
  addBox(chairGroup, 'Exec_Chair_Backrest', 0.1, 0.54, 0.48, 0.21, 0.76, 0, materials.executiveLeather);
  addBox(chairGroup, 'Exec_Chair_Headrest', 0.11, 0.16, 0.32, 0.21, 1.11, 0, materials.sofaCocoaFabric);
  // Left & Right Armrests (Supports Y = 0.45..0.63; Pads Y = 0.63..0.67)
  addBox(chairGroup, 'Exec_Chair_Arm_Support_L', 0.04, 0.18, 0.04, 0.04, 0.54, 0.29, materials.darkMetal);
  addBox(chairGroup, 'Exec_Chair_Arm_Pad_L', 0.32, 0.04, 0.07, 0.04, 0.65, 0.29, materials.warmOakWood);
  addBox(chairGroup, 'Exec_Chair_Arm_Support_R', 0.04, 0.18, 0.04, 0.04, 0.54, -0.29, materials.darkMetal);
  addBox(chairGroup, 'Exec_Chair_Arm_Pad_R', 0.32, 0.04, 0.07, 0.04, 0.65, -0.29, materials.warmOakWood);

  registerCatalogNode(chairId, chairGroup);
  groups.FURNITURE.add(chairGroup);

  // =========================================================================
  // AREA B — PROJECT PLANNING BOARD & STRATEGY CREDENZA (North Wall, X = 5.35, Z = 7.68)
  //    Stepped Z layers: Backing (Z = -0.01..+0.03), Canvas (Z = -0.03..-0.01),
  //    Sticky Notes & Milestone Bars (Z = -0.046..-0.031) — zero Z-fighting!
  // =========================================================================
  const boardId = 'PM_Strategy_Board';
  const boardGroup = new THREE.Group();
  boardGroup.name = boardId;
  boardGroup.position.set(5.35, 1.15, 7.68);

  // Walnut outer frame (Z = -0.01..+0.03) & porcelain board canvas (Z = -0.03..-0.01)
  addBox(boardGroup, 'Strategy_Board_Backing', 2.32, 1.34, 0.04, 0, 0.67, 0.01, materials.darkWalnutWood);
  addBox(boardGroup, 'Strategy_Board_Canvas', 2.18, 1.2, 0.02, 0, 0.67, -0.02, materials.strategyBoardSurface);
  // Marker tray at bottom (Z = -0.10..-0.01, Y = 0.01..0.045)
  addBox(boardGroup, 'Strategy_Board_Marker_Tray', 1.8, 0.035, 0.09, 0, 0.0275, -0.055, materials.chromeSilver);
  addBox(boardGroup, 'Strategy_Marker_Red', 0.14, 0.022, 0.025, -0.35, 0.056, -0.06, materials.noteCoral);
  addBox(boardGroup, 'Strategy_Marker_Blue', 0.14, 0.022, 0.025, -0.15, 0.056, -0.06, materials.noteSky);
  addBox(boardGroup, 'Strategy_Board_Eraser', 0.12, 0.034, 0.045, 0.25, 0.062, -0.06, materials.darkMetal);

  // 3D Raised Pixel Sticky Notes & Milestone Blocks across the 4 Kanban Columns (Z = -0.045..-0.031)
  const noteConfigs: Array<[number, number, THREE.Material]> = [
    [-0.82, 0.92, materials.noteCoral],
    [-0.64, 0.92, materials.noteAmber],
    [-0.82, 0.72, materials.noteAmber],
    [-0.64, 0.72, materials.paperCream],
    [-0.32, 0.92, materials.noteSky],
    [-0.14, 0.92, materials.noteSage],
    [-0.32, 0.72, materials.noteCoral],
    [-0.32, 0.52, materials.noteAmber],
    [0.2, 0.92, materials.noteSage],
    [0.38, 0.92, materials.noteSky],
    [0.2, 0.72, materials.paperCream],
    [0.72, 0.92, materials.noteSage],
    [0.9, 0.92, materials.noteSage],
    [0.72, 0.72, materials.noteAmber],
  ];
  noteConfigs.forEach(([nx, ny, nMat], idx) => {
    addBox(boardGroup, `Kanban_Task_Note_${idx + 1}`, 0.14, 0.14, 0.014, nx, ny, -0.038, nMat);
  });

  // 3D Raised Timeline Milestone Bars at bottom of board (Z = -0.047..-0.031)
  addBox(boardGroup, 'Milestone_Bar_Q1', 0.55, 0.06, 0.016, -0.62, 0.32, -0.039, materials.noteSky);
  addBox(boardGroup, 'Milestone_Bar_Q2', 0.65, 0.06, 0.016, 0.02, 0.23, -0.039, materials.noteSage);
  addBox(boardGroup, 'Milestone_Bar_Q3', 0.52, 0.06, 0.016, 0.65, 0.32, -0.039, materials.noteCoral);

  registerCatalogNode(boardId, boardGroup);
  groups.FURNITURE.add(boardGroup);

  // Low Strategy Credenza under the Planning Board (X = 5.35, Z = 7.35)
  const credenzaId = 'PM_Credenza_Cabinet';
  const credenzaGroup = new THREE.Group();
  credenzaGroup.name = credenzaId;
  credenzaGroup.position.set(5.35, 0, 7.35);

  // Legs span Y = 0.00..0.53; Top Slab spans Y = 0.53..0.59; Lower Shelf spans X = -0.85..+0.85 between legs!
  addBox(credenzaGroup, 'Credenza_Top_Slab', 2.05, 0.06, 0.54, 0, 0.56, 0, materials.honeyOakLight);
  addBox(credenzaGroup, 'Credenza_Left_Leg', 0.14, 0.53, 0.5, -0.92, 0.265, 0, materials.honeyOakLight);
  addBox(credenzaGroup, 'Credenza_Right_Leg', 0.14, 0.53, 0.5, 0.92, 0.265, 0, materials.honeyOakLight);
  addBox(credenzaGroup, 'Credenza_Lower_Shelf', 1.7, 0.045, 0.46, 0, 0.1775, 0, materials.warmOakWood);
  // Spec Binders, Console Dock & Project Boxes on Credenza (resting cleanly above Y = 0.59 or Y = 0.20)
  addBox(credenzaGroup, 'Credenza_Doc_Stack_1', 0.32, 0.08, 0.26, -0.62, 0.63, 0, materials.noteCoral);
  addBox(credenzaGroup, 'Credenza_Doc_Stack_2', 0.3, 0.07, 0.24, -0.62, 0.705, 0, materials.paperCream);
  addBox(credenzaGroup, 'Credenza_Archive_Box', 0.44, 0.12, 0.32, 0.0, 0.26, 0, materials.paperCream);
  addBox(credenzaGroup, 'Credenza_Hardware_Dock', 0.28, 0.18, 0.22, 0.52, 0.68, 0, materials.darkMetal);
  addBox(credenzaGroup, 'Credenza_Accent_Badge', 0.14, 0.14, 0.08, 0.24, 0.66, -0.05, materials.noteCoral);
  addBox(credenzaGroup, 'Credenza_Blue_Module', 0.22, 0.08, 0.24, 0.82, 0.63, 0, materials.noteSky);

  registerCatalogNode(credenzaId, credenzaGroup);
  groups.FURNITURE.add(credenzaGroup);

  // =========================================================================
  // AREA D — TALL BOOKCASE / DOCUMENT STORAGE (North Wall at X = 1.95, Z = 7.42)
  //    Back panel, plinth, and shelves fit strictly between Side_Left and Side_Right
  //    (X = -0.65..+0.65), and Top_Crown sits cleanly at Y = 2.38..2.45 so cabinet
  //    edges and corners NEVER flicker or Z-fight!
  // =========================================================================
  const bookcaseId = 'PM_Tall_Bookcase';
  const bookcaseGroup = new THREE.Group();
  bookcaseGroup.name = bookcaseId;
  bookcaseGroup.position.set(1.95, 0, 7.42);

  // Outer walnut side panels (X = -0.71..-0.65 and +0.65..+0.71, Y = 0.00..2.38, Z = -0.26..+0.26)
  addBox(bookcaseGroup, 'Bookcase_Side_Left', 0.06, 2.38, 0.52, -0.68, 1.19, 0, materials.darkWalnutWood);
  addBox(bookcaseGroup, 'Bookcase_Side_Right', 0.06, 2.38, 0.52, 0.68, 1.19, 0, materials.darkWalnutWood);
  // Inset back panel (X = -0.65..+0.65, Y = 0.10..2.38, Z = 0.22..0.26)
  addBox(bookcaseGroup, 'Bookcase_Back_Panel', 1.3, 2.28, 0.04, 0, 1.24, 0.24, materials.espressoWood);
  // Inset bottom plinth (X = -0.65..+0.65, Y = 0.00..0.10, Z = -0.25..+0.25)
  addBox(bookcaseGroup, 'Bookcase_Bottom_Plinth', 1.3, 0.1, 0.5, 0, 0.05, 0, materials.espressoWood);
  // Top crown resting cleanly above Y = 2.38 (Y = 2.38..2.45)
  addBox(bookcaseGroup, 'Bookcase_Top_Crown', 1.46, 0.07, 0.55, 0, 2.415, -0.01, materials.darkWalnutWood);

  // Lower enclosed cabinet doors (X = -0.64..-0.01 and +0.01..+0.64, Y = 0.11..0.75, Z = -0.26..-0.23)
  addBox(bookcaseGroup, 'Bookcase_Lower_Door_L', 0.63, 0.64, 0.03, -0.325, 0.43, -0.245, materials.warmOakWood);
  addBox(bookcaseGroup, 'Bookcase_Lower_Door_R', 0.63, 0.64, 0.03, 0.325, 0.43, -0.245, materials.warmOakWood);
  addBox(bookcaseGroup, 'Bookcase_Door_Knob_L', 0.03, 0.08, 0.024, -0.06, 0.45, -0.274, materials.darkMetal);
  addBox(bookcaseGroup, 'Bookcase_Door_Knob_R', 0.03, 0.08, 0.024, 0.06, 0.45, -0.274, materials.darkMetal);

  // 4 Open Shelves above lower cabinet (Y = 0.78, 1.18, 1.58, 1.98; X = -0.65..+0.65; Z = -0.23..+0.21)
  const shelfHeights = [0.78, 1.18, 1.58, 1.98];
  const bookMats = [
    materials.noteCoral,
    materials.noteAmber,
    materials.noteSky,
    materials.noteSage,
    materials.paperCream,
    materials.chairSlateFabric,
    materials.warmOakWood,
  ];

  shelfHeights.forEach((sy, sIdx) => {
    addBox(bookcaseGroup, `Bookcase_Shelf_${sIdx + 1}`, 1.3, 0.044, 0.44, 0, sy, -0.01, materials.darkWalnutWood);
    let bx = -0.56;
    let bookIdx = 0;
    while (bx < 0.52) {
      const bw = 0.055 + ((sIdx * 3 + bookIdx) % 3) * 0.02;
      const bh = 0.22 + ((sIdx + bookIdx) % 4) * 0.035;
      const bMat = bookMats[(sIdx * 5 + bookIdx) % bookMats.length];
      addBox(
        bookcaseGroup,
        `Bookcase_S${sIdx + 1}_Book_${bookIdx + 1}`,
        bw,
        bh,
        0.28,
        bx + bw / 2,
        sy + 0.022 + bh / 2,
        0.02,
        bMat
      );
      bx += bw + 0.012;
      bookIdx++;
      if (sIdx === 1 && bookIdx === 6) {
        addCylinder(bookcaseGroup, 'Bookcase_Award_Base', 0.06, 0.07, 0.05, 8, bx + 0.14, sy + 0.047, 0, materials.espressoWood);
        addCylinder(bookcaseGroup, 'Bookcase_Award_Cup', 0.07, 0.03, 0.16, 8, bx + 0.14, sy + 0.152, 0, materials.brushedBrass);
        bx += 0.28;
      }
    }
  });

  // Blue archival storage box on top of bookcase crown (Y = 2.45..2.63, Lid Y = 2.63..2.675)
  addBox(bookcaseGroup, 'Bookcase_Top_Archival_Box', 0.62, 0.18, 0.42, 0.08, 2.54, 0, materials.noteSky);
  addBox(bookcaseGroup, 'Bookcase_Top_Box_Lid', 0.65, 0.045, 0.44, 0.08, 2.6525, 0, materials.chairSlateFabric);

  // Wooden Step Stool right beside the bookcase (non-overlapping top, rung, and legs)
  const stoolGroup = new THREE.Group();
  stoolGroup.name = 'Bookcase_Wooden_Step_Stool';
  stoolGroup.position.set(-0.88, 0, -0.36);
  stoolGroup.rotation.y = 0.28;
  addBox(stoolGroup, 'Step_Stool_Top', 0.46, 0.045, 0.34, 0, 0.48, 0, materials.sofaCocoaFabric);
  addBox(stoolGroup, 'Step_Stool_Mid_Rung', 0.31, 0.03, 0.19, 0, 0.22, 0, materials.sofaCocoaFabric);
  addBox(stoolGroup, 'Step_Stool_Leg_FL', 0.045, 0.4575, 0.045, -0.18, 0.22875, -0.12, materials.sofaCocoaFabric);
  addBox(stoolGroup, 'Step_Stool_Leg_FR', 0.045, 0.4575, 0.045, 0.18, 0.22875, -0.12, materials.sofaCocoaFabric);
  addBox(stoolGroup, 'Step_Stool_Leg_BL', 0.045, 0.4575, 0.045, -0.18, 0.22875, 0.12, materials.sofaCocoaFabric);
  addBox(stoolGroup, 'Step_Stool_Leg_BR', 0.045, 0.4575, 0.045, 0.18, 0.22875, 0.12, materials.sofaCocoaFabric);
  bookcaseGroup.add(stoolGroup);

  registerCatalogNode(bookcaseId, bookcaseGroup);
  groups.FURNITURE.add(bookcaseGroup);

  // =========================================================================
  // TALL HONEY-OAK PM LOCKER & BLUEPRINT WARDROBE (North-East corner at X = 7.15, Z = 7.15)
  //    Constructed with a true 3D recessed open garment bay on the right side
  //    so Wardrobe_Open_Bay_Back and hanging blazers never interpenetrate the corpus!
  // =========================================================================
  const wardrobeId = 'PM_Archival_Wardrobe';
  const wardrobeGroup = new THREE.Group();
  wardrobeGroup.name = wardrobeId;
  wardrobeGroup.position.set(7.15, 0, 7.15);

  // Left full column (X = -0.56..0.00, Y = 0.00..2.15, Z = -0.34..+0.34)
  addBox(wardrobeGroup, 'Wardrobe_Main_Corpus', 0.56, 2.15, 0.68, -0.28, 1.075, 0, materials.honeyOakLight);
  // Right lower drawer housing (X = 0.00..+0.56, Y = 0.00..0.72, Z = -0.34..+0.34)
  addBox(wardrobeGroup, 'Wardrobe_Right_Lower_Corpus', 0.56, 0.72, 0.68, 0.28, 0.36, 0, materials.honeyOakLight);
  // Right upper cabinet housing (X = 0.00..+0.56, Y = 1.60..2.15, Z = -0.34..+0.34)
  addBox(wardrobeGroup, 'Wardrobe_Right_Upper_Corpus', 0.56, 0.55, 0.68, 0.28, 1.875, 0, materials.honeyOakLight);
  // Right outer side wall framing the open garment bay (X = +0.50..+0.56, Y = 0.72..1.60, Z = -0.34..+0.34)
  addBox(wardrobeGroup, 'Wardrobe_Right_Side_Wall', 0.06, 0.88, 0.68, 0.53, 1.16, 0, materials.honeyOakLight);
  // Recessed dark espresso back wall of the open garment bay (X = 0.00..+0.50, Y = 0.72..1.60, Z = +0.26..+0.34)
  addBox(wardrobeGroup, 'Wardrobe_Open_Bay_Back', 0.5, 0.88, 0.08, 0.25, 1.16, 0.3, materials.espressoWood);

  // Left full door + handle sitting cleanly in front of Z = -0.34 (Z = -0.37..-0.34)
  addBox(wardrobeGroup, 'Wardrobe_Door_Left', 0.52, 2.04, 0.03, -0.28, 1.075, -0.356, materials.warmOakWood);
  addBox(wardrobeGroup, 'Wardrobe_Handle_Left', 0.03, 0.14, 0.024, -0.08, 1.05, -0.384, materials.darkMetal);
  // Right upper door (Z = -0.37..-0.34)
  addBox(wardrobeGroup, 'Wardrobe_Door_Right_Upper', 0.52, 0.48, 0.03, 0.27, 1.875, -0.356, materials.warmOakWood);
  // Hanging blazers / shirts inside the open bay cavity (Z = -0.26..+0.10, Y = 0.90..1.53)
  addBox(wardrobeGroup, 'Wardrobe_Garment_Rod', 0.5, 0.025, 0.025, 0.25, 1.52, -0.06, materials.chromeSilver);
  addBox(wardrobeGroup, 'Wardrobe_Blazer_Blue', 0.14, 0.56, 0.36, 0.16, 1.18, -0.06, materials.chairSlateFabric);
  addBox(wardrobeGroup, 'Wardrobe_Blazer_Navy', 0.14, 0.54, 0.36, 0.34, 1.18, -0.06, materials.noteSky);
  // Lower drawers on right side (Z = -0.37..-0.34)
  addBox(wardrobeGroup, 'Wardrobe_Drawer_1', 0.52, 0.31, 0.03, 0.27, 0.53, -0.356, materials.warmOakWood);
  addBox(wardrobeGroup, 'Wardrobe_Drawer_2', 0.52, 0.31, 0.03, 0.27, 0.19, -0.356, materials.warmOakWood);
  // Storage boxes stacked on top of wardrobe (resting cleanly on Y = 2.15)
  addBox(wardrobeGroup, 'Wardrobe_Top_Box_1', 0.44, 0.28, 0.42, -0.24, 2.29, 0, materials.sofaCocoaFabric);
  addBox(wardrobeGroup, 'Wardrobe_Top_Box_2', 0.38, 0.22, 0.36, 0.24, 2.26, 0, materials.darkMetal);

  registerCatalogNode(wardrobeId, wardrobeGroup);
  groups.FURNITURE.add(wardrobeGroup);

  // =========================================================================
  // AREA C — MINI COLLABORATION TABLE (By Secondary Window at X = 1.75, Z = 2.25)
  // =========================================================================
  const collabId = 'PM_Collaboration_Table';
  const collabGroup = new THREE.Group();
  collabGroup.name = collabId;
  collabGroup.position.set(1.75, 0, 2.25);

  // Warm oak square table top (Y = 0.70..0.76) + inset apron (Y = 0.64..0.70, w = 0.88 between legs) + 4 legs (Y = 0.00..0.70)
  addBox(collabGroup, 'Collab_Table_Top', 1.15, 0.06, 1.15, 0, 0.73, 0, materials.honeyOakLight);
  addBox(collabGroup, 'Collab_Table_Apron', 0.88, 0.06, 0.88, 0, 0.67, 0, materials.darkWalnutWood);
  const legOffsets = [
    [-0.48, -0.48],
    [0.48, -0.48],
    [-0.48, 0.48],
    [0.48, 0.48],
  ];
  legOffsets.forEach(([lx, lz], i) => {
    addBox(collabGroup, `Collab_Table_Leg_${i + 1}`, 0.07, 0.7, 0.07, lx, 0.35, lz, materials.espressoWood);
  });

  // 3 Collaboration Stools with woven cushions around the table (non-overlapping cushion, frame & legs)
  const stoolPositions: Array<[number, number]> = [
    [0.62, -0.26],
    [0.62, 0.28],
    [-0.05, -0.64],
  ];
  stoolPositions.forEach(([sx, sz], i) => {
    const sg = new THREE.Group();
    sg.name = `Collab_Stool_${i + 1}`;
    sg.position.set(sx, 0, sz);
    addBox(sg, `Stool_${i + 1}_Seat_Cushion`, 0.38, 0.05, 0.38, 0, 0.455, 0, materials.paperCream);
    addBox(sg, `Stool_${i + 1}_Frame`, 0.36, 0.04, 0.36, 0, 0.41, 0, materials.warmOakWood);
    addBox(sg, `Stool_${i + 1}_Leg_1`, 0.045, 0.39, 0.045, -0.14, 0.195, -0.14, materials.espressoWood);
    addBox(sg, `Stool_${i + 1}_Leg_2`, 0.045, 0.39, 0.045, 0.14, 0.195, -0.14, materials.espressoWood);
    addBox(sg, `Stool_${i + 1}_Leg_3`, 0.045, 0.39, 0.045, -0.14, 0.195, 0.14, materials.espressoWood);
    addBox(sg, `Stool_${i + 1}_Leg_4`, 0.045, 0.39, 0.045, 0.14, 0.195, 0.14, materials.espressoWood);
    collabGroup.add(sg);
  });

  // Tabletop Collaboration Props (cleanly stacked above Y = 0.76)
  addBox(collabGroup, 'Collab_Tablet_Device', 0.24, 0.016, 0.32, -0.18, 0.768, 0.18, materials.darkMetal);
  addBox(collabGroup, 'Collab_Tablet_Screen', 0.2, 0.008, 0.28, -0.18, 0.78, 0.18, materials.monitorScreen);
  addBox(collabGroup, 'Collab_Project_Notes', 0.26, 0.02, 0.22, 0.2, 0.77, -0.18, materials.paperCream);
  addCylinder(collabGroup, 'Collab_Coffee_Mug_Blue', 0.045, 0.04, 0.09, 8, 0.24, 0.805, 0.16, materials.chairSlateFabric);
  addCylinder(collabGroup, 'Collab_Coffee_Mug_Cream', 0.045, 0.04, 0.09, 8, -0.12, 0.805, -0.22, materials.ceramicCream);
  addCylinder(collabGroup, 'Collab_Center_Planter', 0.08, 0.06, 0.1, 8, 0.0, 0.81, 0.0, materials.terracottaPot);
  addBox(collabGroup, 'Collab_Center_Succulent', 0.11, 0.09, 0.11, 0.0, 0.905, 0.0, materials.plantFoliageBright);

  registerCatalogNode(collabId, collabGroup);
  groups.FURNITURE.add(collabGroup);

  // =========================================================================
  // AREA E — COZY SEATING CORNER (Indigo Rug + Cocoa Sofa + Oak Side Table)
  // =========================================================================
  // 1. Woven Indigo Area Rug (X = 4.35, Z = 4.85, Y = 0.010..0.026)
  const rugId = 'PM_Area_Rug';
  const rugGroup = new THREE.Group();
  rugGroup.name = rugId;
  rugGroup.position.set(4.35, 0.018, 4.85);
  addBox(rugGroup, 'Woven_Area_Rug_Base', 2.42, 0.016, 2.28, 0, 0, 0, materials.wovenRug);
  registerCatalogNode(rugId, rugGroup);
  groups.DECORATION.add(rugGroup);

  // 2. Two-Seat Cozy Cocoa Sofa (X = 3.95, Z = 3.85 — non-overlapping trim, plinth, armrests & cushions)
  const sofaId = 'PM_Cozy_Sofa';
  const sofaGroup = new THREE.Group();
  sofaGroup.name = sofaId;
  sofaGroup.position.set(3.95, 0, 3.85);

  // Under-trim (Y = 0.00..0.04), Base Plinth between armrests (X = -0.77..+0.77, Y = 0.04..0.22), Armrests (X = ±0.77..±0.95, Y = 0.04..0.60)
  addBox(sofaGroup, 'Sofa_Under_Trim', 1.92, 0.04, 0.92, 0, 0.02, 0, materials.paperCream);
  addBox(sofaGroup, 'Sofa_Base_Plinth', 1.54, 0.18, 0.88, 0, 0.13, 0, materials.sofaCocoaFabric);
  addBox(sofaGroup, 'Sofa_Armrest_Left', 0.18, 0.56, 0.88, -0.86, 0.32, 0, materials.sofaCocoaFabric);
  addBox(sofaGroup, 'Sofa_Armrest_Right', 0.18, 0.56, 0.88, 0.86, 0.32, 0, materials.sofaCocoaFabric);

  // 3 Backrest sections (Y = 0.22..0.82, Z = -0.44..-0.20) & 3 Seat cushions (Y = 0.22..0.38, Z = -0.20..+0.38)
  for (let c = -1; c <= 1; c++) {
    const cx = c * 0.51;
    addBox(sofaGroup, `Sofa_Back_Cushion_${c + 2}`, 0.49, 0.6, 0.24, cx, 0.52, -0.32, materials.sofaCocoaFabric);
    addBox(sofaGroup, `Sofa_Seat_Cushion_${c + 2}`, 0.49, 0.16, 0.58, cx, 0.3, 0.09, materials.sofaCushionLight);
  }
  // Cozy cream knit throw blanket & sky blue accent pillow resting cleanly on top of seat cushions (Y >= 0.38)
  addBox(sofaGroup, 'Sofa_Cream_Throw_Blanket', 0.54, 0.09, 0.46, 0.45, 0.425, 0.12, materials.paperCream);
  addBox(sofaGroup, 'Sofa_Blue_Accent_Pillow', 0.38, 0.14, 0.28, -0.35, 0.45, 0.08, materials.noteSky);

  registerCatalogNode(sofaId, sofaGroup);
  groups.FURNITURE.add(sofaGroup);

  // 3. Oak Side / Coffee Table + Leather Backpack beside Sofa (X = 5.35, Z = 3.65)
  const coffeeTableId = 'PM_Coffee_Table';
  const coffeeTableGroup = new THREE.Group();
  coffeeTableGroup.name = coffeeTableId;
  coffeeTableGroup.position.set(5.35, 0, 3.65);

  // Legs (Y = 0.00..0.24), Drawer Box (Y = 0.24..0.41), Table Top (Y = 0.41..0.47)
  addBox(coffeeTableGroup, 'Side_Table_Top', 0.78, 0.06, 0.54, 0, 0.44, 0, materials.warmOakWood);
  addBox(coffeeTableGroup, 'Side_Table_Drawer_Box', 0.72, 0.17, 0.48, 0, 0.325, 0, materials.honeyOakLight);
  addBox(coffeeTableGroup, 'Side_Table_Leg_1', 0.06, 0.24, 0.06, -0.32, 0.12, -0.2, materials.darkWalnutWood);
  addBox(coffeeTableGroup, 'Side_Table_Leg_2', 0.06, 0.24, 0.06, 0.32, 0.12, -0.2, materials.darkWalnutWood);
  addBox(coffeeTableGroup, 'Side_Table_Leg_3', 0.06, 0.24, 0.06, -0.32, 0.12, 0.2, materials.darkWalnutWood);
  addBox(coffeeTableGroup, 'Side_Table_Leg_4', 0.06, 0.24, 0.06, 0.32, 0.12, 0.2, materials.darkWalnutWood);
  // Leather strategy journal + white memo sheet on side table (above Y = 0.47)
  addBox(coffeeTableGroup, 'Side_Table_Journal', 0.22, 0.05, 0.26, 0.14, 0.495, 0.04, materials.darkWalnutWood);
  addBox(coffeeTableGroup, 'Side_Table_Memo_Sheet', 0.24, 0.015, 0.22, -0.14, 0.4775, -0.04, materials.paperCream);

  // Structured PM Backpack resting on the floor beside the side table
  const backpackGroup = new THREE.Group();
  backpackGroup.name = 'PM_Structured_Backpack';
  backpackGroup.position.set(-0.48, 0, -0.38);
  backpackGroup.rotation.y = 0.35;
  addBox(backpackGroup, 'Backpack_Main_Body', 0.32, 0.42, 0.22, 0, 0.21, 0, materials.wallCapDark);
  addBox(backpackGroup, 'Backpack_Front_Pocket', 0.26, 0.22, 0.07, 0, 0.14, -0.145, materials.darkMetal);
  addBox(backpackGroup, 'Backpack_Top_Handle', 0.12, 0.05, 0.04, 0, 0.445, 0.02, materials.sofaCocoaFabric);
  coffeeTableGroup.add(backpackGroup);

  registerCatalogNode(coffeeTableId, coffeeTableGroup);
  groups.FURNITURE.add(coffeeTableGroup);

  // =========================================================================
  // AREA F — DECORATIVE PROPS, REFRESHMENT COUNTER, WALL SHELF, POSTERS, CLOCK
  //    Counter_Cabinet_Base (X = -0.51..+0.83) and Counter_Filing_Tower
  //    (X = -1.13..-0.51) abut cleanly at X = -0.51 with zero overlap!
  // =========================================================================
  // 1. South-West Office Refreshment & Document Counter (X = 1.35, Z = 0.75)
  const counterId = 'PM_Corner_Credenza';
  const counterGroup = new THREE.Group();
  counterGroup.name = counterId;
  counterGroup.position.set(1.35, 0, 0.75);

  // Right-side refreshment cabinet base (X = -0.51..+0.83, Y = 0.00..0.78, Z = -0.29..+0.29)
  addBox(counterGroup, 'Counter_Cabinet_Base', 1.34, 0.78, 0.58, 0.16, 0.39, 0, materials.darkWalnutWood);
  // Doors sitting cleanly in front of Z = 0.29 (Z = 0.291..0.317)
  addBox(counterGroup, 'Counter_Door_1', 0.4, 0.64, 0.026, -0.27, 0.39, 0.304, materials.warmOakWood);
  addBox(counterGroup, 'Counter_Door_2', 0.4, 0.64, 0.026, 0.16, 0.39, 0.304, materials.warmOakWood);
  addBox(counterGroup, 'Counter_Door_3', 0.4, 0.64, 0.026, 0.59, 0.39, 0.304, materials.warmOakWood);
  // Slate counter top spanning X = -0.51..+0.85, Y = 0.78..0.84
  addBox(counterGroup, 'Counter_Slate_Top', 1.36, 0.06, 0.62, 0.17, 0.81, 0, materials.windowFrameCream);
  // Tall office document / blueprint filing cabinet on West end (X = -1.13..-0.51, Y = 0.00..1.56, Z = -0.28..+0.32)
  addBox(counterGroup, 'Counter_Filing_Tower', 0.62, 1.56, 0.6, -0.82, 0.78, 0.02, materials.honeyOakLight);
  addBox(counterGroup, 'Counter_Filing_Drawer_1', 0.54, 0.42, 0.026, -0.82, 1.28, 0.334, materials.warmOakWood);
  addBox(counterGroup, 'Counter_Filing_Drawer_2', 0.54, 0.42, 0.026, -0.82, 0.8, 0.334, materials.warmOakWood);
  addBox(counterGroup, 'Counter_Filing_Drawer_3', 0.54, 0.42, 0.026, -0.82, 0.32, 0.334, materials.warmOakWood);
  addBox(counterGroup, 'Counter_Tower_Top_Box', 0.44, 0.28, 0.42, -0.82, 1.7, 0.02, materials.sofaCocoaFabric);
  // Espresso Machine, Kettle, Wooden Serving Tray & Tea Tin on Counter (resting cleanly on Y = 0.84)
  addBox(counterGroup, 'Counter_Espresso_Machine', 0.28, 0.32, 0.26, 0.06, 1.0, -0.05, materials.darkMetal);
  addBox(counterGroup, 'Counter_Espresso_Head', 0.14, 0.08, 0.08, 0.06, 0.98, 0.12, materials.chromeSilver);
  addCylinder(counterGroup, 'Counter_Electric_Kettle', 0.08, 0.1, 0.2, 8, -0.24, 0.94, 0, materials.chromeSilver);
  addBox(counterGroup, 'Counter_Wooden_Tray', 0.44, 0.03, 0.36, 0.52, 0.855, 0, materials.honeyOakLight);
  addCylinder(counterGroup, 'Counter_Espresso_Cup_1', 0.04, 0.035, 0.07, 8, 0.42, 0.905, 0.05, materials.ceramicCream);
  addCylinder(counterGroup, 'Counter_Espresso_Cup_2', 0.04, 0.035, 0.07, 8, 0.58, 0.905, -0.05, materials.noteCoral);
  addBox(counterGroup, 'Counter_Green_Tea_Tin', 0.12, 0.16, 0.12, -0.38, 0.92, -0.14, materials.plantFoliageBright);

  registerCatalogNode(counterId, counterGroup);
  groups.FURNITURE.add(counterGroup);

  // Baked Pixel-Art Contact Shadows under Major Furniture (uses polygonOffset to avoid floor Z-fighting)
  const contactShadowsGroup = new THREE.Group();
  contactShadowsGroup.name = 'Furniture_Contact_Shadows';
  const shadowRects: Array<[string, number, number, number, number]> = [
    ['Shadow_PM_Desk', 1.06, 1.98, 1.35, 5.35],
    ['Shadow_Exec_Chair', 0.62, 0.62, 2.15, 5.35],
    ['Shadow_Bookcase', 1.52, 0.62, 1.95, 7.42],
    ['Shadow_Step_Stool', 0.54, 0.42, 1.07, 7.06],
    ['Shadow_Credenza', 2.15, 0.62, 5.35, 7.35],
    ['Shadow_Wardrobe', 1.22, 0.78, 7.15, 7.15],
    ['Shadow_Sofa', 2.02, 1.0, 3.95, 3.85],
    ['Shadow_Side_Table', 0.88, 0.64, 5.35, 3.65],
    ['Shadow_Collab_Table', 1.45, 1.45, 1.75, 2.25],
    ['Shadow_Corner_Counter', 2.4, 0.72, 1.15, 0.75],
    ['Shadow_Parcel_Box', 0.56, 0.52, 6.95, 5.85],
    ['Shadow_SE_Plant', 0.44, 0.44, 7.25, 1.15],
  ];
  shadowRects.forEach(([sName, sw, sd, sx, sz]) => {
    const sm = new THREE.Mesh(new THREE.BoxGeometry(sw, 0.004, sd), materials.contactShadow);
    sm.name = sName;
    sm.position.set(sx, 0.003, sz);
    sm.receiveShadow = true;
    contactShadowsGroup.add(sm);
  });
  groups.DECORATION.add(contactShadowsGroup);

  // 2. Warm Brass Floor Lamp near Strategy Wall (X = 6.35, Z = 6.85)
  const lampId = 'PM_Floor_Lamp';
  const floorLampGroup = new THREE.Group();
  floorLampGroup.name = lampId;
  floorLampGroup.position.set(6.35, 0, 6.85);
  addCylinder(floorLampGroup, 'Floor_Lamp_Base', 0.18, 0.2, 0.04, 12, 0, 0.02, 0, materials.brushedBrass);
  addCylinder(floorLampGroup, 'Floor_Lamp_Pole', 0.025, 0.025, 1.42, 8, 0, 0.75, 0, materials.brushedBrass);
  addCylinder(floorLampGroup, 'Floor_Lamp_Shade', 0.16, 0.24, 0.34, 12, 0, 1.55, 0, materials.lampShadeWarm);
  registerCatalogNode(lampId, floorLampGroup);
  groups.PROPS.add(floorLampGroup);

  // 3. North Wall Floating Book Shelf + Trailing Plant + Two Framed Pixel Posters (stepped Z planes prevent Z-fighting!)
  const wallDecorGroup = new THREE.Group();
  wallDecorGroup.name = 'Wall_Decor_Posters_And_Shelf';
  addBox(wallDecorGroup, 'Floating_Wall_Shelf', 1.05, 0.05, 0.24, 3.65, 2.05, 7.66, materials.honeyOakLight);
  // Books on floating shelf (resting cleanly on Y = 2.075, spaced by 0.015u along X)
  addBox(wallDecorGroup, 'Shelf_Book_Blue1', 0.06, 0.24, 0.18, 3.99, 2.195, 7.66, materials.noteSky);
  addBox(wallDecorGroup, 'Shelf_Book_Blue2', 0.06, 0.22, 0.18, 3.91, 2.185, 7.66, materials.chairSlateFabric);
  addBox(wallDecorGroup, 'Shelf_Book_Red', 0.06, 0.2, 0.18, 3.83, 2.175, 7.66, materials.noteCoral);
  // Trailing vine plant on floating shelf
  const shelfPlant = createLayeredPottedPlant('Floating_Shelf_Plant', 3.42, 2.075, 7.66, 0.72, matLib, 'PM_Tall_Bookcase');
  addBox(wallDecorGroup, 'Trailing_Vine_1', 0.08, 0.26, 0.08, 3.35, 1.98, 7.51, materials.plantFoliageMid);
  addBox(wallDecorGroup, 'Trailing_Vine_2', 0.07, 0.22, 0.07, 3.46, 1.94, 7.5, materials.plantFoliageBright);
  wallDecorGroup.add(shelfPlant);

  // Framed Pixel Posters on North wall (Frame Z = 7.744..7.768; Canvas Z = 7.731..7.743 cleanly in front!)
  addBox(wallDecorGroup, 'Poster_1_Frame', 0.46, 0.58, 0.024, 3.85, 1.52, 7.756, materials.paperCream);
  addBox(wallDecorGroup, 'Poster_1_Canvas', 0.4, 0.52, 0.012, 3.85, 1.52, 7.737, materials.posterArt1);
  addBox(wallDecorGroup, 'Poster_2_Frame', 0.46, 0.58, 0.024, 3.32, 1.72, 7.756, materials.paperCream);
  addBox(wallDecorGroup, 'Poster_2_Canvas', 0.4, 0.52, 0.012, 3.32, 1.72, 7.737, materials.posterArt2);

  // Wall Clock above Strategy Board (Rim Z = 7.742..7.772; Face Z = 7.728..7.742 cleanly in front!)
  const clockRim = addCylinder(wallDecorGroup, 'Office_Wall_Clock_Rim', 0.18, 0.18, 0.03, 12, 5.35, 2.78, 7.757, materials.darkWalnutWood);
  clockRim.rotation.x = Math.PI / 2;
  const clockFace = addCylinder(wallDecorGroup, 'Office_Wall_Clock_Face', 0.15, 0.15, 0.014, 12, 5.35, 2.78, 7.735, materials.paperCream);
  clockFace.rotation.x = Math.PI / 2;

  groups.DECORATION.add(wallDecorGroup);

  // 4. Additional Cozy Props in South-East / East Perimeter
  const extraPropsGroup = new THREE.Group();
  extraPropsGroup.name = 'Office_Perimeter_Props';

  // Open shipping/archive box near East wall (X = 6.95, Z = 5.85 — non-overlapping bottom & interior liner)
  const boxGroup = new THREE.Group();
  boxGroup.name = 'Cardboard_Archive_Parcel';
  boxGroup.position.set(6.95, 0, 5.85);
  boxGroup.rotation.y = -0.25;
  addBox(boxGroup, 'Parcel_Box_Body', 0.46, 0.34, 0.42, 0, 0.17, 0, materials.warmOakWood);
  addBox(boxGroup, 'Parcel_Box_Interior', 0.4, 0.016, 0.36, 0, 0.348, 0, materials.espressoWood);
  addBox(boxGroup, 'Parcel_Flap_Left', 0.02, 0.18, 0.4, -0.25, 0.41, 0, materials.honeyOakLight);
  addBox(boxGroup, 'Parcel_Flap_Right', 0.02, 0.18, 0.4, 0.25, 0.41, 0, materials.honeyOakLight);
  extraPropsGroup.add(boxGroup);

  // Cylindrical Office Trash Bin beside PM Desk (X = 0.85, Z = 4.18)
  addCylinder(extraPropsGroup, 'Office_Mesh_Trash_Bin', 0.13, 0.1, 0.28, 10, 0.85, 0.14, 4.18, materials.darkMetal);
  addBox(extraPropsGroup, 'Crumpled_Paper_1', 0.07, 0.07, 0.07, 0.84, 0.315, 4.17, materials.paperCream);

  // Potted Monstera Plant in South-East corner (X = 7.25, Z = 1.15)
  const sePlant = createLayeredPottedPlant('SE_Corner_Botanical_Plant', 7.25, 0, 1.15, 1.25, matLib, 'PM_Floor_Lamp');
  extraPropsGroup.add(sePlant);

  groups.PROPS.add(extraPropsGroup);

  return catalogNodeMap;
}

/**
 * Builds the temporary Scale Mannequin (1.72m tall AI Office character scale reference).
 * Placed OUTSIDE ROOM_PM_ROOT so it is NEVER exported into the GLB!
 */
export function buildScaleMannequin(): THREE.Group {
  const mannequin = new THREE.Group();
  mannequin.name = 'PREVIEW_ONLY_SCALE_MANNEQUIN';
  mannequin.position.set(3.25, 0, 5.35); // Standing comfortably near the PM Desk & Rug
  mannequin.rotation.y = -0.65;

  const matBody = new THREE.MeshStandardMaterial({
    color: 0x569cd6,
    roughness: 0.5,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const matHead = new THREE.MeshStandardMaterial({
    color: 0xf2d2b6,
    roughness: 0.6,
    metalness: 0.05,
    transparent: true,
    opacity: 0.9,
  });
  const matDark = new THREE.MeshStandardMaterial({
    color: 0x2d3748,
    roughness: 0.7,
    metalness: 0.05,
    transparent: true,
    opacity: 0.85,
  });

  // Legs (0..0.78m)
  addBox(mannequin, 'Mannequin_Leg_L', 0.15, 0.76, 0.16, -0.1, 0.38, 0, matDark);
  addBox(mannequin, 'Mannequin_Leg_R', 0.15, 0.76, 0.16, 0.1, 0.38, 0, matDark);
  // Torso (0.76..1.36m)
  addBox(mannequin, 'Mannequin_Torso', 0.4, 0.6, 0.24, 0, 1.06, 0, matBody);
  // Arms
  addBox(mannequin, 'Mannequin_Arm_L', 0.13, 0.54, 0.14, -0.28, 1.04, 0, matBody);
  addBox(mannequin, 'Mannequin_Arm_R', 0.13, 0.54, 0.14, 0.28, 1.04, 0, matBody);
  // Head (1.38..1.72m -> total height 1.72 world units)
  addBox(mannequin, 'Mannequin_Head', 0.32, 0.32, 0.32, 0, 1.56, 0, matHead);

  mannequin.traverse((c) => {
    c.userData.isPreviewOnly = true;
  });

  return mannequin;
}
