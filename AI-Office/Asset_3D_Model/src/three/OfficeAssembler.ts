import * as THREE from 'three';
import {
  OFFICE_A3_CONSTANTS,
  OFFICE_ROOM_REGISTRY,
  ORDERED_ROOM_KEYS,
  OfficeRoomRegistryEntry,
  RoomModuleKey,
} from '../domain/officeLayoutA3Spec';
import { BuiltCentralHubResult, buildCentralHubComplete } from './CentralHubBuilder';
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

function createRoomPlaqueTexture(
  title: string,
  subtitle: string,
  status: 'READY' | 'NEW' | 'PLANNED'
): THREE.CanvasTexture {
  const w = 256;
  const h = 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = status === 'PLANNED' ? '#1F2430' : '#1E2923';
  ctx.fillRect(0, 0, w, h);

  const borderColor =
    status === 'PLANNED' ? '#64748B' : status === 'NEW' ? '#FBBF24' : '#34D399';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // Status badge
  ctx.fillStyle = borderColor;
  ctx.fillRect(14, 14, 76, 20);
  ctx.fillStyle = '#111827';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(status, 24, 28);

  // Room Title
  ctx.fillStyle = '#F5F2EB';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(title.slice(0, 24), 14, 56);

  // Coordinates / Subtitle
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '12px monospace';
  ctx.fillText(subtitle.slice(0, 32), 14, 78);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds an honest 8×8 architectural blueprint placeholder for any PLANNED room module.
 * Uses local coordinates [0..8, 0, 0..8] so it works both at [0,0,0] in Single Room mode
 * and at its global A3 offset in Full Office mode.
 */
export function buildPlannedRoomModulePlaceholder(
  entry: OfficeRoomRegistryEntry,
  matLib: MaterialLibraryInstance
): THREE.Group {
  const { materials } = matLib;
  const root = new THREE.Group();
  root.name = `PLANNED_${entry.module_id}`;
  root.userData = {
    roomModuleKey: entry.key,
    moduleId: entry.module_id,
    assetStatus: entry.asset_status,
  };

  // Non-overlapping 8x8 floor slab (inset by 0.04u so adjacent modules never touch coplanar faces)
  const floor = createBox(
    `${entry.module_id}_Planned_Floor`,
    7.88,
    0.04,
    7.88,
    4.0,
    -0.02,
    4.0,
    materials.plannedBlueprintFloor,
    { roomModuleKey: entry.key }
  );
  const subbase = createBox(
    `${entry.module_id}_Planned_Subbase`,
    7.88,
    0.12,
    7.88,
    4.0,
    -0.1,
    4.0,
    materials.floorSubbase,
    { roomModuleKey: entry.key }
  );
  root.add(floor, subbase);

  // Low architectural perimeter curb walls (0.36u high) with doorway gaps on connector sides
  const hasSouthDoor = entry.connector_definitions.some((c) => c.side === 'SOUTH');
  const hasNorthDoor = entry.connector_definitions.some((c) => c.side === 'NORTH');
  const hasEastDoor = entry.connector_definitions.some((c) => c.side === 'EAST');
  const hasWestDoor = entry.connector_definitions.some((c) => c.side === 'WEST');

  const wallH = 0.36;
  const wallY = wallH / 2;

  // North curb (Z = 7.82)
  if (hasNorthDoor) {
    root.add(
      createBox(
        `${entry.module_id}_Curb_North_W`,
        2.8,
        wallH,
        0.16,
        1.5,
        wallY,
        7.82,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      ),
      createBox(
        `${entry.module_id}_Curb_North_E`,
        2.8,
        wallH,
        0.16,
        6.5,
        wallY,
        7.82,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      )
    );
  } else {
    root.add(
      createBox(
        `${entry.module_id}_Curb_North`,
        7.8,
        wallH,
        0.16,
        4.0,
        wallY,
        7.82,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      )
    );
  }

  // South curb (Z = 0.18)
  if (hasSouthDoor) {
    root.add(
      createBox(
        `${entry.module_id}_Curb_South_W`,
        2.8,
        wallH,
        0.16,
        1.5,
        wallY,
        0.18,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      ),
      createBox(
        `${entry.module_id}_Curb_South_E`,
        2.8,
        wallH,
        0.16,
        6.5,
        wallY,
        0.18,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      )
    );
  } else {
    root.add(
      createBox(
        `${entry.module_id}_Curb_South`,
        7.8,
        wallH,
        0.16,
        4.0,
        wallY,
        0.18,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      )
    );
  }

  // West curb (X = 0.18)
  if (hasWestDoor) {
    root.add(
      createBox(
        `${entry.module_id}_Curb_West_S`,
        0.16,
        wallH,
        2.6,
        0.18,
        wallY,
        1.6,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      ),
      createBox(
        `${entry.module_id}_Curb_West_N`,
        0.16,
        wallH,
        2.6,
        0.18,
        wallY,
        6.4,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      )
    );
  } else {
    root.add(
      createBox(
        `${entry.module_id}_Curb_West`,
        0.16,
        wallH,
        7.4,
        0.18,
        wallY,
        4.0,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      )
    );
  }

  // East curb (X = 7.82)
  if (hasEastDoor) {
    root.add(
      createBox(
        `${entry.module_id}_Curb_East_S`,
        0.16,
        wallH,
        2.6,
        7.82,
        wallY,
        1.6,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      ),
      createBox(
        `${entry.module_id}_Curb_East_N`,
        0.16,
        wallH,
        2.6,
        7.82,
        wallY,
        6.4,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      )
    );
  } else {
    root.add(
      createBox(
        `${entry.module_id}_Curb_East`,
        0.16,
        wallH,
        7.4,
        7.82,
        wallY,
        4.0,
        materials.plannedBlueprintWall,
        { roomModuleKey: entry.key }
      )
    );
  }

  // Center Architectural Plaque Pedestal showing Room Name & PLANNED Status
  const plaqueTex = createRoomPlaqueTexture(
    entry.display_name,
    `8x8 Module · Origin [${entry.global_offset.join(', ')}]`,
    entry.badge
  );
  const plaqueMat = new THREE.MeshStandardMaterial({
    name: `Mat_Plaque_${entry.key}`,
    color: 0xffffff,
    map: plaqueTex,
    roughness: 0.6,
    metalness: 0.05,
  });
  const plaqueSlab = createBox(
    `${entry.module_id}_Info_Plaque`,
    4.6,
    0.06,
    1.8,
    4.0,
    0.04,
    4.0,
    plaqueMat,
    { roomModuleKey: entry.key }
  );
  plaqueSlab.rotation.y = Math.PI;
  root.add(plaqueSlab);

  return root;
}

export interface AssembledOfficeA3Result {
  officeRoot: THREE.Group;
  roomModulesGroup: THREE.Group;
  sharedCorridorGroup: THREE.Group;
  centralHubGroup: THREE.Group;
  centralHubSlotWrapper: THREE.Group;
  centralHub: BuiltCentralHubResult;
  terraceGroup: THREE.Group;
  entranceGroup: THREE.Group;
  officeHelpersGroup: THREE.Group;
  helpersGroup: THREE.Group;
  pmSlotWrapper: THREE.Group;
  ceoSlotWrapper: THREE.Group;
  uiuxSlotWrapper: THREE.Group;
  engineeringSlotWrapper: THREE.Group;
  researchSlotWrapper: THREE.Group;
  qaDevopsSlotWrapper: THREE.Group;
  plannedSlotWrappers: Map<RoomModuleKey, THREE.Group>;
  singlePlannedPlaceholders: Map<RoomModuleKey, THREE.Group>;
  corridorEndWallNodes: THREE.Object3D[];
  setHighlightedRoomModule: (key: RoomModuleKey | null) => void;
}

/**
 * Constructs the Master Floor Plan A3.2 (`OFFICE_A3_ROOT`, 32×26 units) containing:
 * - `ROOM_MODULES` (with dedicated transform wrappers for PM, CEO, UI/UX, 8×16 Engineering, Research & Shared Brain, and 8×16 QA & DevOps Integrated Studio)
 * - `SHARED_CORRIDOR_ROOT` (X=0..32, Z=16..18, Warm Greige Large-Format Stone)
 * - `CENTRAL_HUB_ROOT` (X=8..24, Z=0..16, 16×16 Open Central Hub V2 with Herringbone Parquet, 2u Stone Perimeter, 10-Seat Conference Table, and Main South Entrance Portal at [16,0,0])
 * - `TERRACE_ROOT` (Legacy empty node preserved for hierarchy compatibility)
 * - `ENTRANCE_ROOT` (Exterior South arrival threshold at X=16, Z=0)
 * - `OFFICE_HELPERS` (Master grid & selection highlight)
 */
export function buildMasterOfficeA3Assembly(
  matLib: MaterialLibraryInstance
): AssembledOfficeA3Result {
  const { materials } = matLib;

  const officeRoot = new THREE.Group();
  officeRoot.name = OFFICE_A3_CONSTANTS.ROOT_NODE_NAME;
  officeRoot.position.set(0, 0, 0);

  const roomModulesGroup = new THREE.Group();
  roomModulesGroup.name = 'ROOM_MODULES';

  const sharedCorridorGroup = new THREE.Group();
  sharedCorridorGroup.name = 'SHARED_CORRIDOR_ROOT';

  const centralHubGroup = new THREE.Group();
  centralHubGroup.name = 'CENTRAL_HUB_CONTAINER';

  const terraceGroup = new THREE.Group();
  terraceGroup.name = 'TERRACE_ROOT';

  const entranceGroup = new THREE.Group();
  entranceGroup.name = 'ENTRANCE_ROOT';

  const officeHelpersGroup = new THREE.Group();
  officeHelpersGroup.name = 'OFFICE_HELPERS';

  officeRoot.add(
    roomModulesGroup,
    sharedCorridorGroup,
    centralHubGroup,
    terraceGroup,
    entranceGroup,
    officeHelpersGroup
  );

  // =========================================================================
  // 1. ROOM_MODULES WRAPPERS (Non-destructive global offset wrappers)
  // =========================================================================
  const pmEntry = OFFICE_ROOM_REGISTRY.pm_strategy;
  const pmSlotWrapper = new THREE.Group();
  pmSlotWrapper.name = 'MODULE_SLOT_PM_STRATEGY';
  pmSlotWrapper.position.set(...pmEntry.global_offset); // [8, 0, 18]
  pmSlotWrapper.userData = { roomModuleKey: 'pm_strategy', moduleId: pmEntry.module_id };
  roomModulesGroup.add(pmSlotWrapper);

  const ceoEntry = OFFICE_ROOM_REGISTRY.ceo_executive;
  const ceoSlotWrapper = new THREE.Group();
  ceoSlotWrapper.name = 'MODULE_SLOT_CEO_EXECUTIVE';
  ceoSlotWrapper.position.set(...ceoEntry.global_offset); // [16, 0, 18]
  ceoSlotWrapper.userData = { roomModuleKey: 'ceo_executive', moduleId: ceoEntry.module_id };
  roomModulesGroup.add(ceoSlotWrapper);

  const uiuxEntry = OFFICE_ROOM_REGISTRY.uiux_studio;
  const uiuxSlotWrapper = new THREE.Group();
  uiuxSlotWrapper.name = 'MODULE_SLOT_UIUX_STUDIO';
  uiuxSlotWrapper.position.set(...uiuxEntry.global_offset); // [24, 0, 18]
  uiuxSlotWrapper.userData = { roomModuleKey: 'uiux_studio', moduleId: uiuxEntry.module_id };
  roomModulesGroup.add(uiuxSlotWrapper);

  const engineeringEntry = OFFICE_ROOM_REGISTRY.engineering;
  const engineeringSlotWrapper = new THREE.Group();
  engineeringSlotWrapper.name = 'MODULE_SLOT_ENGINEERING';
  engineeringSlotWrapper.position.set(...engineeringEntry.global_offset); // [0, 0, 0]
  engineeringSlotWrapper.userData = {
    roomModuleKey: 'engineering',
    moduleId: engineeringEntry.module_id,
  };
  roomModulesGroup.add(engineeringSlotWrapper);

  const researchEntry = OFFICE_ROOM_REGISTRY.research_brain;
  const researchSlotWrapper = new THREE.Group();
  researchSlotWrapper.name = 'MODULE_SLOT_RESEARCH_BRAIN';
  researchSlotWrapper.position.set(...researchEntry.global_offset); // [0, 0, 18]
  researchSlotWrapper.userData = {
    roomModuleKey: 'research_brain',
    moduleId: researchEntry.module_id,
  };
  roomModulesGroup.add(researchSlotWrapper);

  const qaDevopsEntry = OFFICE_ROOM_REGISTRY.qa_devops_studio;
  const qaDevopsSlotWrapper = new THREE.Group();
  qaDevopsSlotWrapper.name = 'MODULE_SLOT_QA_DEVOPS_STUDIO';
  qaDevopsSlotWrapper.position.set(...qaDevopsEntry.global_offset); // [24, 0, 0]
  qaDevopsSlotWrapper.userData = {
    roomModuleKey: 'qa_devops_studio',
    moduleId: qaDevopsEntry.module_id,
  };
  roomModulesGroup.add(qaDevopsSlotWrapper);

  const plannedSlotWrappers = new Map<RoomModuleKey, THREE.Group>();
  const singlePlannedPlaceholders = new Map<RoomModuleKey, THREE.Group>();

  for (const key of ORDERED_ROOM_KEYS) {
    const entry = OFFICE_ROOM_REGISTRY[key];
    if (entry.asset_status === 'PLANNED') {
      const slot = new THREE.Group();
      slot.name = `MODULE_SLOT_${key.toUpperCase()}`;
      slot.position.set(...entry.global_offset);
      slot.userData = { roomModuleKey: key, moduleId: entry.module_id };
      const placeholder = buildPlannedRoomModulePlaceholder(entry, matLib);
      slot.add(placeholder);
      roomModulesGroup.add(slot);
      plannedSlotWrappers.set(key, slot);

      // Also build a standalone [0,0,0] placeholder for Single Room mode inspection
      const singlePlaceholder = buildPlannedRoomModulePlaceholder(entry, matLib);
      singlePlaceholder.visible = false;
      singlePlannedPlaceholders.set(key, singlePlaceholder);
    }
  }

  // =========================================================================
  // 2. SHARED CORRIDOR (X = 0..32, Z = 16..18, width 32u, depth 2u)
  //    Strictly occupies Z = 16.02..17.98 so it never overlaps North Row (Z=18..26)
  //    or Central Hub / Side Wings (Z=0..16)!
  // =========================================================================
  const corridorFloor = createBox(
    'Corridor_EastWest_Floor_Surface',
    31.92,
    0.04,
    1.92,
    16.0,
    -0.02,
    17.0,
    materials.corridorFloor
  );
  const corridorSubbase = createBox(
    'Corridor_EastWest_Subbase',
    31.92,
    0.12,
    1.92,
    16.0,
    -0.1,
    17.0,
    materials.floorSubbase
  );
  // West & East Corridor End Curb Caps + Full-Height 3.2u Upper Exterior End Walls
  const corridorWestEndWall = createBox(
    'Corridor_West_End_Wall_Curb',
    0.18,
    0.42,
    1.92,
    0.09,
    0.21,
    17.0,
    materials.warmWall
  );
  const corridorEastEndWall = createBox(
    'Corridor_East_End_Wall_Curb',
    0.18,
    0.42,
    1.92,
    31.91,
    0.21,
    17.0,
    materials.warmWall
  );
  const corridorWestEndUpper = new THREE.Group();
  corridorWestEndUpper.name = 'Corridor_West_End_Wall_Upper_Assembly';
  const cwUpperBody = createBox(
    'Corridor_West_End_Wall_Upper',
    0.18,
    2.74,
    1.92,
    0.09,
    1.79,
    17.0,
    materials.warmWall
  );
  const cwTopCap = createBox(
    'Corridor_West_End_Wall_Top_Cap',
    0.20,
    0.04,
    1.94,
    0.10,
    3.18,
    17.0,
    materials.wallCapDark
  );
  corridorWestEndUpper.add(cwUpperBody, cwTopCap);

  const corridorEastEndUpper = new THREE.Group();
  corridorEastEndUpper.name = 'Corridor_East_End_Wall_Upper_Assembly';
  const ceUpperBody = createBox(
    'Corridor_East_End_Wall_Upper',
    0.18,
    2.74,
    1.92,
    31.91,
    1.79,
    17.0,
    materials.warmWall
  );
  const ceTopCap = createBox(
    'Corridor_East_End_Wall_Top_Cap',
    0.20,
    0.04,
    1.94,
    31.90,
    3.18,
    17.0,
    materials.wallCapDark
  );
  corridorEastEndUpper.add(ceUpperBody, ceTopCap);
  const corridorEndWallNodes: THREE.Object3D[] = [corridorWestEndUpper, corridorEastEndUpper];
  // Threshold transition strips at Research South Doorway ([4, 0, 18]), PM South Doorway ([12, 0, 18]), CEO South Doorway ([20, 0, 18]), UI/UX South Doorway ([28, 0, 18]), Engineering North Doorway ([4, 0, 16]), and QA & DevOps North Doorway ([28, 0, 16])
  const researchCorridorBridge = createBox(
    'Corridor_Threshold_Bridge_Research',
    1.88,
    0.004,
    0.14,
    4.0,
    0.002,
    17.96,
    materials.hubBrassTrim
  );
  const pmCorridorBridge = createBox(
    'Corridor_Threshold_Bridge_PM',
    1.88,
    0.004,
    0.14,
    12.0,
    0.002,
    17.96,
    materials.hubBrassTrim
  );
  const ceoCorridorBridge = createBox(
    'Corridor_Threshold_Bridge_CEO',
    1.88,
    0.004,
    0.14,
    20.0,
    0.002,
    17.96,
    materials.hubBrassTrim
  );
  const uiuxCorridorBridge = createBox(
    'Corridor_Threshold_Bridge_UIUX',
    1.88,
    0.004,
    0.14,
    28.0,
    0.002,
    17.96,
    materials.hubBrassTrim
  );
  const engNorthCorridorBridge = createBox(
    'Corridor_Threshold_Bridge_Engineering_North',
    1.88,
    0.004,
    0.14,
    4.0,
    0.002,
    16.04,
    materials.hubBrassTrim
  );
  const qaDevopsNorthCorridorBridge = createBox(
    'Corridor_Threshold_Bridge_QADevOps_North',
    1.88,
    0.004,
    0.14,
    28.0,
    0.002,
    16.04,
    materials.hubBrassTrim
  );
  // Inter-room PM <-> CEO East-West threshold bridge at [16, 0, 22]
  const pmCeoDoorwayBridge = createBox(
    'Corridor_InterRoom_Bridge_PM_CEO',
    0.14,
    0.004,
    1.84,
    16.0,
    0.002,
    22.0,
    materials.hubBrassTrim
  );
  sharedCorridorGroup.add(
    corridorFloor,
    corridorSubbase,
    corridorWestEndWall,
    corridorEastEndWall,
    corridorWestEndUpper,
    corridorEastEndUpper,
    researchCorridorBridge,
    pmCorridorBridge,
    ceoCorridorBridge,
    uiuxCorridorBridge,
    engNorthCorridorBridge,
    qaDevopsNorthCorridorBridge,
    pmCeoDoorwayBridge
  );

  // =========================================================================
  // 3. CENTRAL COLLABORATION HUB V2 (X = 8..24, Z = 0..16 — 16×16 OPEN COMMONS)
  //    Authored at local [0, 0, 0] via CentralHubBuilder and mounted at global [8, 0, 0]
  // =========================================================================
  const centralHubSlotWrapper = new THREE.Group();
  centralHubSlotWrapper.name = 'MODULE_SLOT_CENTRAL_HUB';
  centralHubSlotWrapper.position.set(8.0, 0.0, 0.0);
  centralHubGroup.add(centralHubSlotWrapper);

  const centralHub = buildCentralHubComplete(matLib);
  centralHubSlotWrapper.add(centralHub.root);

  // =========================================================================
  // 4. TERRACE_ROOT & ENTRANCE_ROOT (Preserved for hierarchy compatibility;
  //    Main South Entrance Portal is built inside CENTRAL_HUB_ROOT.ENTRANCE_STRUCTURE
  //    at Hub-local [8, 0, 0] -> Global [16, 0, 0])
  // =========================================================================

  // =========================================================================
  // 5. OFFICE_HELPERS (Active Room Selection Outline in Full Office Mode)
  // =========================================================================
  const highlightEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
  const highlightMat = new THREE.LineBasicMaterial({ color: 0xfbbf24 });
  const highlightWire = new THREE.LineSegments(highlightEdges, highlightMat);
  highlightWire.name = 'Full_Office_Selected_Module_Outline';
  highlightWire.visible = false;
  officeHelpersGroup.add(highlightWire);

  const setHighlightedRoomModule = (key: RoomModuleKey | null) => {
    if (!key) {
      highlightWire.visible = false;
      return;
    }
    const entry = OFFICE_ROOM_REGISTRY[key];
    if (!entry) {
      highlightWire.visible = false;
      return;
    }
    const w = entry.size[0];
    const h = entry.size[1];
    const d = entry.size[2];
    highlightWire.scale.set(w + 0.06, h + 0.08, d + 0.06);
    highlightWire.position.set(
      entry.global_offset[0] + w / 2,
      h / 2 + 0.02,
      entry.global_offset[2] + d / 2
    );
    highlightWire.visible = true;
  };

  return {
    officeRoot,
    roomModulesGroup,
    sharedCorridorGroup,
    centralHubGroup,
    centralHubSlotWrapper,
    centralHub,
    terraceGroup,
    entranceGroup,
    officeHelpersGroup,
    helpersGroup: officeHelpersGroup,
    pmSlotWrapper,
    ceoSlotWrapper,
    uiuxSlotWrapper,
    engineeringSlotWrapper,
    researchSlotWrapper,
    qaDevopsSlotWrapper,
    plannedSlotWrappers,
    singlePlannedPlaceholders,
    corridorEndWallNodes,
    setHighlightedRoomModule,
  };
}
