import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import {
  DEVOPS_ACTIONS,
  DEVOPS_AUTO_DEMO_SEQUENCE,
  DEVOPS_CHARACTER_CONSTANTS,
  DEVOPS_EXPRESSION_PRESETS,
  DEVOPS_HAIR_MATERIAL_PALETTE,
  DEVOPS_OUTFIT_PALETTE,
  DEVOPS_PATROL_ANCHOR_RING,
  DEVOPS_REQUIRED_ANIMATION_CLIPS,
  findDevOpsWalkablePath,
  getDevOpsAnchorById,
  type DevOpsActionId,
  type DevOpsAgentState,
  type DevOpsAnimationClipName,
  type DevOpsAnimationPlaybackCommand,
  type DevOpsExpressionId,
  type DevOpsPropId,
  type DevOpsRuntimeIndicatorId,
  type DevOpsSimulationRuntimeStatus,
  type DevOpsSpeedMultiplier,
} from '../domain/devopsSimulationSpec';
import type { QADevOpsAnchorId } from '../domain/qaDevopsRoomSpec';

/**
 * ============================================================================
 * DEVOPS ENGINEER VOXEL CHARACTER — 3D MODEL, 27 CLIPS, & RUNTIME CONTROLLER
 * ============================================================================
 * Module 06 — QA & DevOps Integrated Studio (8 × 16 × 3.2 units)
 * Character ID: `devops_engineer_agent` ("DevOps & AI Engine Operations Specialist")
 *
 * Signature Visual Identity:
 * - Warm deep-brown voxel skin (`#8C583A` / `#73452B`) with readable facial contrast
 * - Short, dense, naturally curly black/charcoal voxel hairstyle with 360° stepped
 *   rounded-angular curl clusters across 9 semantic sub-groups (`Hair_Base_Volume`,
 *   `Hair_Crown_Core`, `Hair_Crown_Curls`, `Hair_Front_Curls`, `Hair_Left_Curls`,
 *   `Hair_Right_Curls`, `Hair_Back_Curls`, `Hair_Temple_Transition`, `Hair_Nape_Details`)
 * - White/silver neck headphones with cyan/blue earcup rings worn around the neck by default
 * - Dark charcoal/navy technical jacket over white inner shirt/hoodie collar with cyan accents
 * - Black technical backpack with 3D cyan cloud emblem (auto-hidden when seated)
 * - Dark charcoal trousers with white cuffs + white/gray sneakers with cyan accents at Y = 0.000
 */

export interface BuiltDevOpsCharacterModel {
  characterRoot: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  neck: THREE.Group;
  head: THREE.Group;
  hairRoot: THREE.Group;
  faceFeatures: THREE.Group;
  eyesGroup: THREE.Group;
  leftEye: THREE.Group;
  rightEye: THREE.Group;
  eyebrowsGroup: THREE.Group;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  mouthGroup: THREE.Group;
  mouthMesh: THREE.Mesh;
  glassesGroup: THREE.Group;
  coolSunglassesGroup: THREE.Group;
  headphonesGroup: THREE.Group;
  alertBadgeGroup: THREE.Group;
  sweatDropGroup: THREE.Group;
  sleepZzzGroup: THREE.Group;
  backpackGroup: THREE.Group;
  leftArm: THREE.Group;
  leftHand: THREE.Group;
  rightArm: THREE.Group;
  rightHand: THREE.Group;
  propsAttachment: THREE.Group;
  propNodes: Record<Exclude<DevOpsPropId, 'none'>, THREE.Group>;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  materials: Map<string, THREE.MeshStandardMaterial>;
  meshCount: number;
  triangleCount: number;
}

function createMat(
  map: Map<string, THREE.MeshStandardMaterial>,
  name: string,
  hex: string,
  roughness = 0.82,
  metalness = 0.05,
  emissiveHex?: string,
  emissiveIntensity = 0
): THREE.MeshStandardMaterial {
  const existing = map.get(name);
  if (existing) return existing;
  const mat = new THREE.MeshStandardMaterial({
    name,
    color: new THREE.Color(hex),
    roughness,
    metalness,
  });
  if (emissiveHex) {
    mat.emissive = new THREE.Color(emissiveHex);
    mat.emissiveIntensity = emissiveIntensity;
  }
  map.set(name, mat);
  return mat;
}

function addVoxelBox(
  parent: THREE.Object3D,
  name: string,
  size: [number, number, number],
  pos: [number, number, number],
  mat: THREE.MeshStandardMaterial,
  rot?: [number, number, number]
): THREE.Mesh {
  const geom = new THREE.BoxGeometry(size[0], size[1], size[2]);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  if (rot) {
    mesh.rotation.set(rot[0], rot[1], rot[2]);
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/**
 * Builds the complete DevOps Engineer (`devops_engineer_agent`) 3D voxel hierarchy
 * at local origin `[0, 0, 0]`, facing `+Z`, standing height `~1.735m` (`Y = 0.000` to `Y = 1.735`).
 */
export function buildDevOpsEngineerModel(): BuiltDevOpsCharacterModel {
  const materials = new Map<string, THREE.MeshStandardMaterial>();

  // 1. Hair multi-shade dark charcoal/black palette (5 distinct matte shades)
  const hairMats = DEVOPS_HAIR_MATERIAL_PALETTE.map((swatch) =>
    createMat(materials, swatch.id, swatch.hex, swatch.roughness, swatch.metalness)
  );
  const [
    matHairBase,
    matHairShadow,
    matHairMid,
    matHairHighlight,
    matHairTopAccent,
  ] = hairMats;

  // 2. Skin & facial materials (warm deep-brown voxel skin)
  const matSkin = createMat(
    materials,
    'devops_skin_base',
    DEVOPS_OUTFIT_PALETTE.SKIN_BASE,
    0.84,
    0.02
  );
  const matSkinShadow = createMat(
    materials,
    'devops_skin_shadow',
    DEVOPS_OUTFIT_PALETTE.SKIN_SHADOW,
    0.88,
    0.02
  );
  const matCheek = createMat(
    materials,
    'devops_skin_cheek',
    DEVOPS_OUTFIT_PALETTE.SKIN_CHEEK_WARM,
    0.86,
    0.02
  );
  const matEyeDark = createMat(materials, 'devops_eye_dark', '#101218', 0.45, 0.05);
  const matEyeCatchlight = createMat(materials, 'devops_eye_catchlight', '#FFFFFF', 0.25, 0.02);
  const matBrow = createMat(materials, 'devops_eyebrow_dark', '#14171F', 0.85, 0.03);
  const matMouth = createMat(materials, 'devops_mouth_warm', '#4A281B', 0.78, 0.02);

  // 3. Technical outfit & signature accessories materials
  const matJacket = createMat(
    materials,
    'devops_jacket_charcoal_navy',
    DEVOPS_OUTFIT_PALETTE.JACKET_CHARCOAL_NAVY,
    0.8,
    0.08
  );
  const matJacketDark = createMat(
    materials,
    'devops_jacket_panel_dark',
    DEVOPS_OUTFIT_PALETTE.JACKET_PANEL_DARK,
    0.85,
    0.06
  );
  const matJacketRib = createMat(
    materials,
    'devops_jacket_rib_trim',
    DEVOPS_OUTFIT_PALETTE.JACKET_RIB_TRIM,
    0.84,
    0.05
  );
  const matInnerShirt = createMat(
    materials,
    'devops_inner_shirt_white',
    DEVOPS_OUTFIT_PALETTE.INNER_SHIRT_WHITE,
    0.82,
    0.03
  );
  const matInnerShadow = createMat(
    materials,
    'devops_inner_shirt_shadow',
    DEVOPS_OUTFIT_PALETTE.INNER_SHIRT_SHADOW,
    0.86,
    0.03
  );
  const matCyanAccent = createMat(
    materials,
    'devops_cyan_accent',
    DEVOPS_OUTFIT_PALETTE.CYAN_ACCENT,
    0.48,
    0.14,
    DEVOPS_OUTFIT_PALETTE.CYAN_ACCENT,
    0.18
  );
  const matCyanDeep = createMat(
    materials,
    'devops_cyan_deep',
    DEVOPS_OUTFIT_PALETTE.CYAN_DEEP,
    0.58,
    0.12
  );
  const matCloudWhite = createMat(
    materials,
    'devops_cloud_white',
    '#F8FAFC',
    0.5,
    0.08,
    '#E0F2FE',
    0.12
  );

  // Neck headphones materials
  const matHeadphoneWhite = createMat(
    materials,
    'devops_headphone_white',
    DEVOPS_OUTFIT_PALETTE.HEADPHONE_WHITE,
    0.52,
    0.16
  );
  const matHeadphoneSilver = createMat(
    materials,
    'devops_headphone_silver',
    DEVOPS_OUTFIT_PALETTE.HEADPHONE_SILVER,
    0.45,
    0.28
  );
  const matHeadphoneCushion = createMat(
    materials,
    'devops_headphone_cushion',
    DEVOPS_OUTFIT_PALETTE.HEADPHONE_CUSHION_DARK,
    0.85,
    0.05
  );

  // Trousers & sneakers materials
  const matTrousers = createMat(
    materials,
    'devops_trousers_charcoal',
    DEVOPS_OUTFIT_PALETTE.TROUSERS_CHARCOAL,
    0.84,
    0.05
  );
  const matTrouserCuff = createMat(
    materials,
    'devops_trousers_cuff_white',
    DEVOPS_OUTFIT_PALETTE.TROUSERS_CUFF_WHITE,
    0.8,
    0.04
  );
  const matSneakerWhite = createMat(
    materials,
    'devops_sneaker_white',
    DEVOPS_OUTFIT_PALETTE.SNEAKER_WHITE,
    0.72,
    0.06
  );
  const matSneakerSole = createMat(
    materials,
    'devops_sneaker_sole_dark',
    DEVOPS_OUTFIT_PALETTE.SNEAKER_SOLE_DARK,
    0.88,
    0.04
  );
  const matSneakerCyan = createMat(
    materials,
    'devops_sneaker_cyan',
    DEVOPS_OUTFIT_PALETTE.SNEAKER_CYAN_ACCENT,
    0.58,
    0.12
  );

  // Backpack & prop materials
  const matBackpack = createMat(
    materials,
    'devops_backpack_black',
    DEVOPS_OUTFIT_PALETTE.BACKPACK_BLACK,
    0.82,
    0.08
  );
  const matBackpackTrim = createMat(
    materials,
    'devops_backpack_trim',
    DEVOPS_OUTFIT_PALETTE.BACKPACK_TRIM_SLATE,
    0.76,
    0.12
  );
  const matGlassesFrame = createMat(
    materials,
    'devops_glasses_frame',
    DEVOPS_OUTFIT_PALETTE.GLASSES_FRAME,
    0.42,
    0.25
  );
  const matSunglassLens = createMat(materials, 'devops_sunglass_lens', '#090D16', 0.2, 0.45);
  const matDeviceChassis = createMat(materials, 'devops_device_chassis', '#1E2430', 0.55, 0.25);
  const matDeviceSilver = createMat(materials, 'devops_device_silver', '#94A3B8', 0.48, 0.32);
  const matScreenDark = createMat(
    materials,
    'devops_screen_dark',
    '#0B1320',
    0.35,
    0.1,
    '#0EA5E9',
    0.16
  );
  const matScreenGreen = createMat(
    materials,
    'devops_screen_green',
    '#10B981',
    0.35,
    0.08,
    '#10B981',
    0.24
  );
  const matAlertRed = createMat(
    materials,
    'devops_alert_red',
    '#EF4444',
    0.4,
    0.08,
    '#EF4444',
    0.25
  );
  const matAmberWarn = createMat(
    materials,
    'devops_amber_warn',
    '#F59E0B',
    0.45,
    0.08,
    '#F59E0B',
    0.2
  );
  const matPaperWhite = createMat(materials, 'devops_paper_white', '#F8FAFC', 0.85, 0.02);
  const matRunbookBlue = createMat(materials, 'devops_runbook_blue', '#0369A1', 0.72, 0.08);
  const matCoffeeLiquid = createMat(materials, 'devops_coffee_liquid', '#3E2723', 0.45, 0.05);

  // ==========================================================================
  // ROOT & SKELETAL HIERARCHY (`CharacterRoot -> Hips -> Torso -> Neck -> Head`)
  // ==========================================================================
  const characterRoot = new THREE.Group();
  characterRoot.name = 'CharacterRoot';
  characterRoot.userData = {
    character_id: DEVOPS_CHARACTER_CONSTANTS.CHARACTER_ID,
    asset_id: DEVOPS_CHARACTER_CONSTANTS.ASSET_ID,
    role: DEVOPS_CHARACTER_CONSTANTS.FULL_ROLE_TITLE,
    department: DEVOPS_CHARACTER_CONSTANTS.DEPARTMENT,
    compatible_room_id: DEVOPS_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
  };

  const hips = new THREE.Group();
  hips.name = 'Hips';
  hips.position.set(0, DEVOPS_CHARACTER_CONSTANTS.STANDING_HIPS_Y, 0);
  characterRoot.add(hips);

  // Connected pelvis/waist block so torso and legs form a seamless silhouette
  addVoxelBox(hips, 'Pelvis_Core', [0.34, 0.11, 0.22], [0, -0.02, 0], matTrousers);
  addVoxelBox(hips, 'Pelvis_Belt_Band', [0.348, 0.035, 0.226], [0, 0.018, 0], matJacketDark);
  addVoxelBox(hips, 'Pelvis_Belt_Buckle_Cyan', [0.07, 0.032, 0.02], [0, 0.018, 0.112], matCyanAccent);

  const torso = new THREE.Group();
  torso.name = 'Torso';
  torso.position.set(0, 0.02, 0);
  hips.add(torso);

  // ==========================================================================
  // TORSO: Dark Charcoal/Navy Technical Jacket + White Inner Hoodie/Shirt + Cyan Trim
  // ==========================================================================
  addVoxelBox(torso, 'Torso_Core_Jacket', [0.36, 0.34, 0.23], [0, 0.18, 0], matJacket);
  addVoxelBox(torso, 'Torso_Lower_Rib_Hem', [0.366, 0.045, 0.236], [0, 0.028, 0], matJacketRib);

  // White/off-white inner shirt front panel & hoodie collar
  addVoxelBox(torso, 'Torso_Inner_Shirt_Front', [0.14, 0.29, 0.025], [0, 0.185, 0.112], matInnerShirt);
  addVoxelBox(
    torso,
    'Torso_Inner_Shirt_Collar_V',
    [0.16, 0.055, 0.03],
    [0, 0.325, 0.112],
    matInnerShadow
  );
  addVoxelBox(
    torso,
    'Torso_Hoodie_Collar_Left',
    [0.065, 0.055, 0.16],
    [-0.105, 0.355, 0.02],
    matInnerShirt
  );
  addVoxelBox(
    torso,
    'Torso_Hoodie_Collar_Right',
    [0.065, 0.055, 0.16],
    [0.105, 0.355, 0.02],
    matInnerShirt
  );
  addVoxelBox(
    torso,
    'Torso_Hoodie_Collar_Back',
    [0.24, 0.06, 0.075],
    [0, 0.358, -0.085],
    matInnerShirt
  );

  // Dark charcoal jacket front lapels & cyan zipper/trim
  addVoxelBox(
    torso,
    'Torso_Jacket_Lapel_Left',
    [0.105, 0.32, 0.028],
    [-0.125, 0.185, 0.114],
    matJacketDark
  );
  addVoxelBox(
    torso,
    'Torso_Jacket_Lapel_Right',
    [0.105, 0.32, 0.028],
    [0.125, 0.185, 0.114],
    matJacketDark
  );
  addVoxelBox(
    torso,
    'Torso_Jacket_Cyan_Trim_Left',
    [0.018, 0.31, 0.032],
    [-0.072, 0.185, 0.116],
    matCyanAccent
  );
  addVoxelBox(
    torso,
    'Torso_Jacket_Cyan_Trim_Right',
    [0.018, 0.31, 0.032],
    [0.072, 0.185, 0.116],
    matCyanAccent
  );
  // Subtle cyan status badge on left chest
  addVoxelBox(
    torso,
    'Torso_Chest_Ops_Badge_Plate',
    [0.058, 0.034, 0.018],
    [0.12, 0.255, 0.124],
    matCyanDeep
  );
  addVoxelBox(
    torso,
    'Torso_Chest_Ops_Badge_Pip',
    [0.038, 0.014, 0.022],
    [0.12, 0.255, 0.126],
    matCyanAccent
  );

  // ==========================================================================
  // BACKPACK (`Torso -> Backpack`) — Black Technical Backpack with 3D Cyan Cloud Emblem
  // ==========================================================================
  const backpackGroup = new THREE.Group();
  backpackGroup.name = 'Backpack';
  backpackGroup.position.set(0, 0.19, -0.155);
  torso.add(backpackGroup);

  addVoxelBox(backpackGroup, 'Backpack_Main_Body', [0.29, 0.31, 0.12], [0, 0, -0.01], matBackpack);
  addVoxelBox(
    backpackGroup,
    'Backpack_Upper_Bevel',
    [0.26, 0.04, 0.1],
    [0, 0.165, -0.01],
    matBackpackTrim
  );
  addVoxelBox(
    backpackGroup,
    'Backpack_Lower_Pocket',
    [0.24, 0.12, 0.04],
    [0, -0.065, -0.08],
    matBackpackTrim
  );
  addVoxelBox(
    backpackGroup,
    'Backpack_Side_Module_L',
    [0.03, 0.16, 0.08],
    [-0.155, -0.02, -0.01],
    matBackpackTrim
  );
  addVoxelBox(
    backpackGroup,
    'Backpack_Side_Module_R',
    [0.03, 0.16, 0.08],
    [0.155, -0.02, -0.01],
    matBackpackTrim
  );
  // Shoulder straps wrapping torso
  addVoxelBox(
    backpackGroup,
    'Backpack_Strap_Left',
    [0.045, 0.3, 0.05],
    [-0.115, 0.01, 0.06],
    matBackpackTrim
  );
  addVoxelBox(
    backpackGroup,
    'Backpack_Strap_Right',
    [0.045, 0.3, 0.05],
    [0.115, 0.01, 0.06],
    matBackpackTrim
  );
  addVoxelBox(
    backpackGroup,
    'Backpack_Top_Handle',
    [0.09, 0.026, 0.04],
    [0, 0.195, 0.01],
    matBackpackTrim
  );

  // 3D Cyan Cloud Emblem on Back Panel (matching reference sheet BACK / BACK-LEFT / BACK-RIGHT)
  const backpackCloudEmblem = new THREE.Group();
  backpackCloudEmblem.name = 'Backpack_Cloud_Emblem';
  backpackCloudEmblem.position.set(0, 0.045, -0.075);
  backpackGroup.add(backpackCloudEmblem);

  addVoxelBox(
    backpackCloudEmblem,
    'Cloud_Emblem_Base_Bar',
    [0.115, 0.036, 0.018],
    [0, -0.014, 0],
    matCyanAccent
  );
  addVoxelBox(
    backpackCloudEmblem,
    'Cloud_Emblem_Puff_Center',
    [0.058, 0.052, 0.018],
    [0.005, 0.012, 0],
    matCyanAccent
  );
  addVoxelBox(
    backpackCloudEmblem,
    'Cloud_Emblem_Puff_Left',
    [0.04, 0.038, 0.018],
    [-0.034, 0.002, 0],
    matCyanAccent
  );
  addVoxelBox(
    backpackCloudEmblem,
    'Cloud_Emblem_Puff_Right',
    [0.038, 0.034, 0.018],
    [0.038, -0.002, 0],
    matCyanAccent
  );
  addVoxelBox(
    backpackCloudEmblem,
    'Cloud_Emblem_Core_Highlight',
    [0.078, 0.022, 0.022],
    [0, -0.008, -0.002],
    matCloudWhite
  );

  // ==========================================================================
  // NECK & HEAD (`Torso -> Neck -> Head`)
  // ==========================================================================
  const neck = new THREE.Group();
  neck.name = 'Neck';
  neck.position.set(0, 0.34, 0);
  torso.add(neck);

  addVoxelBox(neck, 'Neck_Column', [0.15, 0.08, 0.14], [0, 0.025, 0], matSkinShadow);

  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.04, 0);
  neck.add(head);

  // Core Voxel Head Block (`Y = 1.30..1.66` in world space)
  addVoxelBox(head, 'Head_Core', [0.38, 0.35, 0.34], [0, 0.195, 0], matSkin);
  addVoxelBox(head, 'Head_Jaw_Shadow', [0.376, 0.04, 0.334], [0, 0.035, 0], matSkinShadow);
  // Sculpted Voxel Ears
  addVoxelBox(head, 'Ear_Left', [0.04, 0.095, 0.075], [-0.205, 0.175, -0.01], matSkin);
  addVoxelBox(head, 'Ear_Left_Inner', [0.02, 0.055, 0.045], [-0.218, 0.175, -0.01], matSkinShadow);
  addVoxelBox(head, 'Ear_Right', [0.04, 0.095, 0.075], [0.205, 0.175, -0.01], matSkin);
  addVoxelBox(head, 'Ear_Right_Inner', [0.02, 0.055, 0.045], [0.218, 0.175, -0.01], matSkinShadow);

  // ==========================================================================
  // NECK HEADPHONES (`Head -> Headphones`) — Worn Around Neck by Default
  // White/silver band + earcups with cyan/blue accent rings resting around collar
  // ==========================================================================
  const headphonesGroup = new THREE.Group();
  headphonesGroup.name = 'Headphones';
  headphonesGroup.position.set(0, -0.02, 0.015);
  headphonesGroup.visible = true; // Default ON around neck per reference sheet
  head.add(headphonesGroup);

  addVoxelBox(
    headphonesGroup,
    'Headphone_Neckband_Back',
    [0.31, 0.042, 0.06],
    [0, 0.01, -0.145],
    matHeadphoneSilver
  );
  addVoxelBox(
    headphonesGroup,
    'Headphone_Neckband_Side_L',
    [0.048, 0.045, 0.24],
    [-0.155, 0.005, -0.02],
    matHeadphoneWhite
  );
  addVoxelBox(
    headphonesGroup,
    'Headphone_Neckband_Side_R',
    [0.048, 0.045, 0.24],
    [0.155, 0.005, -0.02],
    matHeadphoneWhite
  );
  // Left & Right White Earcups resting on front collarbones with Cyan Rings
  addVoxelBox(
    headphonesGroup,
    'Headphone_Earcup_Left_Shell',
    [0.078, 0.095, 0.088],
    [-0.142, -0.008, 0.115],
    matHeadphoneWhite,
    [0.15, 0.22, 0]
  );
  addVoxelBox(
    headphonesGroup,
    'Headphone_Earcup_Left_Cushion',
    [0.058, 0.082, 0.072],
    [-0.118, -0.008, 0.112],
    matHeadphoneCushion,
    [0.15, 0.22, 0]
  );
  addVoxelBox(
    headphonesGroup,
    'Headphone_Earcup_Left_Cyan_Ring',
    [0.084, 0.068, 0.068],
    [-0.152, -0.008, 0.118],
    matCyanAccent,
    [0.15, 0.22, 0]
  );
  addVoxelBox(
    headphonesGroup,
    'Headphone_Earcup_Right_Shell',
    [0.078, 0.095, 0.088],
    [0.142, -0.008, 0.115],
    matHeadphoneWhite,
    [0.15, -0.22, 0]
  );
  addVoxelBox(
    headphonesGroup,
    'Headphone_Earcup_Right_Cushion',
    [0.058, 0.082, 0.072],
    [0.118, -0.008, 0.112],
    matHeadphoneCushion,
    [0.15, -0.22, 0]
  );
  addVoxelBox(
    headphonesGroup,
    'Headphone_Earcup_Right_Cyan_Ring',
    [0.084, 0.068, 0.068],
    [0.152, -0.008, 0.118],
    matCyanAccent,
    [0.15, -0.22, 0]
  );

  // ==========================================================================
  // FACE FEATURES (`Head -> Face_Features`)
  // ==========================================================================
  const faceFeatures = new THREE.Group();
  faceFeatures.name = 'Face_Features';
  head.add(faceFeatures);

  const eyesGroup = new THREE.Group();
  eyesGroup.name = 'Eyes';
  faceFeatures.add(eyesGroup);

  const leftEye = new THREE.Group();
  leftEye.name = 'Left_Eye';
  leftEye.position.set(-0.082, 0.175, 0.172);
  eyesGroup.add(leftEye);
  addVoxelBox(leftEye, 'Left_Eye_Iris', [0.044, 0.058, 0.012], [0, 0, 0], matEyeDark);
  addVoxelBox(
    leftEye,
    'Left_Eye_Catchlight',
    [0.016, 0.018, 0.015],
    [-0.009, 0.014, 0.002],
    matEyeCatchlight
  );

  const rightEye = new THREE.Group();
  rightEye.name = 'Right_Eye';
  rightEye.position.set(0.082, 0.175, 0.172);
  eyesGroup.add(rightEye);
  addVoxelBox(rightEye, 'Right_Eye_Iris', [0.044, 0.058, 0.012], [0, 0, 0], matEyeDark);
  addVoxelBox(
    rightEye,
    'Right_Eye_Catchlight',
    [0.016, 0.018, 0.015],
    [-0.009, 0.014, 0.002],
    matEyeCatchlight
  );

  const eyebrowsGroup = new THREE.Group();
  eyebrowsGroup.name = 'Eyebrows';
  faceFeatures.add(eyebrowsGroup);

  const leftBrow = addVoxelBox(
    eyebrowsGroup,
    'Left_Eyebrow',
    [0.064, 0.02, 0.016],
    [-0.082, 0.228, 0.174],
    matBrow
  );
  const rightBrow = addVoxelBox(
    eyebrowsGroup,
    'Right_Eyebrow',
    [0.064, 0.02, 0.016],
    [0.082, 0.228, 0.174],
    matBrow
  );

  // Subtle voxel nose & warm cheeks
  addVoxelBox(faceFeatures, 'Nose_Bridge', [0.034, 0.036, 0.024], [0, 0.146, 0.176], matSkinShadow);
  addVoxelBox(faceFeatures, 'Cheek_Left', [0.045, 0.024, 0.012], [-0.122, 0.132, 0.172], matCheek);
  addVoxelBox(faceFeatures, 'Cheek_Right', [0.045, 0.024, 0.012], [0.122, 0.132, 0.172], matCheek);

  const mouthGroup = new THREE.Group();
  mouthGroup.name = 'Mouth';
  mouthGroup.position.set(0, 0.098, 0.173);
  faceFeatures.add(mouthGroup);
  const mouthMesh = addVoxelBox(
    mouthGroup,
    'Mouth_Core',
    [0.056, 0.018, 0.012],
    [0, 0, 0],
    matMouth
  );

  // Optional Eyeglasses (`Head -> Glasses`, default OFF)
  const glassesGroup = new THREE.Group();
  glassesGroup.name = 'Glasses';
  glassesGroup.visible = false; // Default OFF per character sheet
  head.add(glassesGroup);
  addVoxelBox(
    glassesGroup,
    'Glasses_Rim_Left',
    [0.095, 0.068, 0.018],
    [-0.084, 0.176, 0.18],
    matGlassesFrame
  );
  addVoxelBox(
    glassesGroup,
    'Glasses_Rim_Right',
    [0.095, 0.068, 0.018],
    [0.084, 0.176, 0.18],
    matGlassesFrame
  );
  addVoxelBox(
    glassesGroup,
    'Glasses_Bridge',
    [0.042, 0.016, 0.018],
    [0, 0.185, 0.18],
    matGlassesFrame
  );

  // Cool Sunglasses for `confident` expression
  const coolSunglassesGroup = new THREE.Group();
  coolSunglassesGroup.name = 'Cool_Sunglasses';
  coolSunglassesGroup.visible = false;
  faceFeatures.add(coolSunglassesGroup);
  addVoxelBox(
    coolSunglassesGroup,
    'Sunglass_Lens_Left',
    [0.105, 0.064, 0.022],
    [-0.084, 0.176, 0.182],
    matSunglassLens
  );
  addVoxelBox(
    coolSunglassesGroup,
    'Sunglass_Lens_Right',
    [0.105, 0.064, 0.022],
    [0.084, 0.176, 0.182],
    matSunglassLens
  );
  addVoxelBox(
    coolSunglassesGroup,
    'Sunglass_Bridge',
    [0.048, 0.02, 0.022],
    [0, 0.188, 0.182],
    matGlassesFrame
  );

  // Expression Overlays (`!!`, SweatDrop, `Zzz`)
  const alertBadgeGroup = new THREE.Group();
  alertBadgeGroup.name = 'Expression_Alert_Badge';
  alertBadgeGroup.position.set(0.24, 0.38, 0.08);
  alertBadgeGroup.visible = false;
  faceFeatures.add(alertBadgeGroup);
  addVoxelBox(alertBadgeGroup, 'Alert_Bar_1', [0.024, 0.085, 0.024], [-0.022, 0.02, 0], matAmberWarn);
  addVoxelBox(alertBadgeGroup, 'Alert_Dot_1', [0.024, 0.024, 0.024], [-0.022, -0.045, 0], matAmberWarn);
  addVoxelBox(alertBadgeGroup, 'Alert_Bar_2', [0.024, 0.085, 0.024], [0.022, 0.02, 0], matAlertRed);
  addVoxelBox(alertBadgeGroup, 'Alert_Dot_2', [0.024, 0.024, 0.024], [0.022, -0.045, 0], matAlertRed);

  const sweatDropGroup = new THREE.Group();
  sweatDropGroup.name = 'Expression_Sweat_Drop';
  sweatDropGroup.position.set(0.185, 0.235, 0.165);
  sweatDropGroup.visible = false;
  faceFeatures.add(sweatDropGroup);
  addVoxelBox(sweatDropGroup, 'Sweat_Lower', [0.032, 0.042, 0.024], [0, 0, 0], matCyanAccent);
  addVoxelBox(sweatDropGroup, 'Sweat_Upper', [0.02, 0.028, 0.02], [0, 0.03, 0], matCloudWhite);

  const sleepZzzGroup = new THREE.Group();
  sleepZzzGroup.name = 'Expression_Sleep_Zzz';
  sleepZzzGroup.position.set(0.25, 0.36, 0.08);
  sleepZzzGroup.visible = false;
  faceFeatures.add(sleepZzzGroup);
  addVoxelBox(sleepZzzGroup, 'Zzz_1', [0.045, 0.045, 0.016], [0, 0, 0], matCloudWhite);
  addVoxelBox(sleepZzzGroup, 'Zzz_2', [0.06, 0.06, 0.016], [0.055, 0.065, 0], matCyanAccent);

  // ==========================================================================
  // 360° SHORT, DENSE, NATURALLY CURLY BLACK/CHARCOAL VOXEL HAIRSTYLE (`Head -> Hair`)
  // Built from 9 semantic sub-groups with stepped rounded-angular curl clusters
  // ==========================================================================
  const hairRoot = new THREE.Group();
  hairRoot.name = 'Hair';
  head.add(hairRoot);

  // 1. Hair_Base_Volume: Inner skull cap wrapping top, back, and sides of head
  const hairBaseVolume = new THREE.Group();
  hairBaseVolume.name = 'Hair_Base_Volume';
  hairRoot.add(hairBaseVolume);
  addVoxelBox(hairBaseVolume, 'Hair_Cap_Top_Core', [0.405, 0.09, 0.37], [0, 0.355, -0.005], matHairBase);
  addVoxelBox(
    hairBaseVolume,
    'Hair_Cap_Back_Upper',
    [0.4, 0.22, 0.095],
    [0, 0.255, -0.155],
    matHairBase
  );
  addVoxelBox(
    hairBaseVolume,
    'Hair_Cap_Left_Upper',
    [0.075, 0.16, 0.34],
    [-0.19, 0.285, -0.01],
    matHairBase
  );
  addVoxelBox(
    hairBaseVolume,
    'Hair_Cap_Right_Upper',
    [0.075, 0.16, 0.34],
    [0.19, 0.285, -0.01],
    matHairBase
  );

  // 2. Hair_Crown_Core: Dense volumetric upper crown mass
  const hairCrownCore = new THREE.Group();
  hairCrownCore.name = 'Hair_Crown_Core';
  hairRoot.add(hairCrownCore);
  addVoxelBox(
    hairCrownCore,
    'Crown_Volume_Center',
    [0.37, 0.085, 0.335],
    [0, 0.405, 0.0],
    matHairMid
  );
  addVoxelBox(
    hairCrownCore,
    'Crown_Volume_Upper_Step',
    [0.31, 0.055, 0.28],
    [0, 0.442, -0.005],
    matHairBase
  );

  // 3. Hair_Crown_Curls: Multi-level stepped top curl clusters (reaching Y ≈ 1.735m)
  const hairCrownCurls = new THREE.Group();
  hairCrownCurls.name = 'Hair_Crown_Curls';
  hairRoot.add(hairCrownCurls);
  const crownCurlClusters: Array<{
    name: string;
    size: [number, number, number];
    pos: [number, number, number];
    mat: THREE.MeshStandardMaterial;
  }> = [
    {
      name: 'Crown_Curl_Apex_Center',
      size: [0.095, 0.055, 0.095],
      pos: [0.01, 0.468, 0.01],
      mat: matHairTopAccent,
    },
    {
      name: 'Crown_Curl_Front_Left',
      size: [0.09, 0.052, 0.09],
      pos: [-0.095, 0.458, 0.085],
      mat: matHairHighlight,
    },
    {
      name: 'Crown_Curl_Front_Right',
      size: [0.092, 0.05, 0.09],
      pos: [0.095, 0.454, 0.08],
      mat: matHairMid,
    },
    {
      name: 'Crown_Curl_Mid_Left',
      size: [0.095, 0.054, 0.095],
      pos: [-0.115, 0.456, -0.025],
      mat: matHairTopAccent,
    },
    {
      name: 'Crown_Curl_Mid_Right',
      size: [0.095, 0.052, 0.095],
      pos: [0.115, 0.452, -0.02],
      mat: matHairHighlight,
    },
    {
      name: 'Crown_Curl_Back_Left',
      size: [0.092, 0.05, 0.092],
      pos: [-0.085, 0.448, -0.115],
      mat: matHairMid,
    },
    {
      name: 'Crown_Curl_Back_Right',
      size: [0.092, 0.05, 0.092],
      pos: [0.085, 0.448, -0.115],
      mat: matHairHighlight,
    },
    {
      name: 'Crown_Curl_Back_Center',
      size: [0.098, 0.052, 0.09],
      pos: [0, 0.455, -0.095],
      mat: matHairBase,
    },
    {
      name: 'Crown_Curl_Outer_Left_Ridge',
      size: [0.075, 0.046, 0.085],
      pos: [-0.175, 0.422, 0.035],
      mat: matHairMid,
    },
    {
      name: 'Crown_Curl_Outer_Right_Ridge',
      size: [0.075, 0.046, 0.085],
      pos: [0.175, 0.422, 0.035],
      mat: matHairHighlight,
    },
  ];
  for (const c of crownCurlClusters) {
    addVoxelBox(hairCrownCurls, c.name, c.size, c.pos, c.mat);
  }

  // 4. Hair_Front_Curls: Asymmetrical stepped curly fringe framing forehead & eyebrows
  const hairFrontCurls = new THREE.Group();
  hairFrontCurls.name = 'Hair_Front_Curls';
  hairRoot.add(hairFrontCurls);
  const frontCurlClusters: Array<{
    name: string;
    size: [number, number, number];
    pos: [number, number, number];
    mat: THREE.MeshStandardMaterial;
  }> = [
    {
      name: 'Front_Hairline_Band',
      size: [0.39, 0.075, 0.085],
      pos: [0, 0.345, 0.165],
      mat: matHairShadow,
    },
    {
      name: 'Front_Curl_Center_Upper',
      size: [0.095, 0.075, 0.075],
      pos: [-0.015, 0.375, 0.195],
      mat: matHairHighlight,
    },
    {
      name: 'Front_Curl_Center_Drop',
      size: [0.072, 0.068, 0.064],
      pos: [-0.02, 0.305, 0.2],
      mat: matHairBase,
    },
    {
      name: 'Front_Curl_Center_Tip',
      size: [0.052, 0.042, 0.048],
      pos: [-0.025, 0.268, 0.196],
      mat: matHairMid,
    },
    {
      name: 'Front_Curl_Left_Cluster',
      size: [0.092, 0.078, 0.075],
      pos: [-0.115, 0.352, 0.192],
      mat: matHairMid,
    },
    {
      name: 'Front_Curl_Left_Lower_Lock',
      size: [0.068, 0.058, 0.058],
      pos: [-0.135, 0.292, 0.188],
      mat: matHairShadow,
    },
    {
      name: 'Front_Curl_Right_Cluster',
      size: [0.095, 0.076, 0.075],
      pos: [0.105, 0.356, 0.192],
      mat: matHairTopAccent,
    },
    {
      name: 'Front_Curl_Right_Lower_Lock',
      size: [0.068, 0.056, 0.058],
      pos: [0.128, 0.298, 0.188],
      mat: matHairMid,
    },
    {
      name: 'Front_Corner_Curl_Left',
      size: [0.076, 0.074, 0.076],
      pos: [-0.182, 0.335, 0.158],
      mat: matHairHighlight,
    },
    {
      name: 'Front_Corner_Curl_Right',
      size: [0.076, 0.074, 0.076],
      pos: [0.182, 0.335, 0.158],
      mat: matHairMid,
    },
  ];
  for (const c of frontCurlClusters) {
    addVoxelBox(hairFrontCurls, c.name, c.size, c.pos, c.mat);
  }

  // 5. Hair_Left_Curls: Stepped volumetric curl puffs above & behind left ear
  const hairLeftCurls = new THREE.Group();
  hairLeftCurls.name = 'Hair_Left_Curls';
  hairRoot.add(hairLeftCurls);
  const leftCurlClusters: Array<{
    name: string;
    size: [number, number, number];
    pos: [number, number, number];
    mat: THREE.MeshStandardMaterial;
  }> = [
    {
      name: 'Left_Curl_Upper_Front',
      size: [0.068, 0.082, 0.092],
      pos: [-0.215, 0.345, 0.075],
      mat: matHairMid,
    },
    {
      name: 'Left_Curl_Upper_Mid',
      size: [0.074, 0.088, 0.098],
      pos: [-0.222, 0.34, -0.02],
      mat: matHairHighlight,
    },
    {
      name: 'Left_Curl_Upper_Back',
      size: [0.072, 0.088, 0.095],
      pos: [-0.216, 0.32, -0.115],
      mat: matHairBase,
    },
    {
      name: 'Left_Curl_Mid_Above_Ear',
      size: [0.062, 0.068, 0.088],
      pos: [-0.212, 0.258, 0.015],
      mat: matHairShadow,
    },
    {
      name: 'Left_Curl_Behind_Ear_Upper',
      size: [0.068, 0.082, 0.092],
      pos: [-0.208, 0.225, -0.105],
      mat: matHairMid,
    },
    {
      name: 'Left_Curl_Behind_Ear_Lower',
      size: [0.06, 0.072, 0.082],
      pos: [-0.195, 0.15, -0.115],
      mat: matHairShadow,
    },
  ];
  for (const c of leftCurlClusters) {
    addVoxelBox(hairLeftCurls, c.name, c.size, c.pos, c.mat);
  }

  // 6. Hair_Right_Curls: Stepped volumetric curl puffs above & behind right ear
  const hairRightCurls = new THREE.Group();
  hairRightCurls.name = 'Hair_Right_Curls';
  hairRoot.add(hairRightCurls);
  const rightCurlClusters: Array<{
    name: string;
    size: [number, number, number];
    pos: [number, number, number];
    mat: THREE.MeshStandardMaterial;
  }> = [
    {
      name: 'Right_Curl_Upper_Front',
      size: [0.068, 0.082, 0.092],
      pos: [0.215, 0.345, 0.075],
      mat: matHairHighlight,
    },
    {
      name: 'Right_Curl_Upper_Mid',
      size: [0.074, 0.088, 0.098],
      pos: [0.222, 0.34, -0.02],
      mat: matHairMid,
    },
    {
      name: 'Right_Curl_Upper_Back',
      size: [0.072, 0.088, 0.095],
      pos: [0.216, 0.32, -0.115],
      mat: matHairHighlight,
    },
    {
      name: 'Right_Curl_Mid_Above_Ear',
      size: [0.062, 0.068, 0.088],
      pos: [0.212, 0.258, 0.015],
      mat: matHairBase,
    },
    {
      name: 'Right_Curl_Behind_Ear_Upper',
      size: [0.068, 0.082, 0.092],
      pos: [0.208, 0.225, -0.105],
      mat: matHairMid,
    },
    {
      name: 'Right_Curl_Behind_Ear_Lower',
      size: [0.06, 0.072, 0.082],
      pos: [0.195, 0.15, -0.115],
      mat: matHairShadow,
    },
  ];
  for (const c of rightCurlClusters) {
    addVoxelBox(hairRightCurls, c.name, c.size, c.pos, c.mat);
  }

  // 7. Hair_Back_Curls: Rounded-angular stepped curl clusters across the entire rear skull
  const hairBackCurls = new THREE.Group();
  hairBackCurls.name = 'Hair_Back_Curls';
  hairRoot.add(hairBackCurls);
  const backCurlClusters: Array<{
    name: string;
    size: [number, number, number];
    pos: [number, number, number];
    mat: THREE.MeshStandardMaterial;
  }> = [
    {
      name: 'Back_Curl_Top_Left',
      size: [0.105, 0.085, 0.075],
      pos: [-0.11, 0.365, -0.188],
      mat: matHairHighlight,
    },
    {
      name: 'Back_Curl_Top_Center',
      size: [0.11, 0.088, 0.078],
      pos: [0, 0.37, -0.194],
      mat: matHairMid,
    },
    {
      name: 'Back_Curl_Top_Right',
      size: [0.105, 0.085, 0.075],
      pos: [0.11, 0.365, -0.188],
      mat: matHairHighlight,
    },
    {
      name: 'Back_Curl_Mid_Left',
      size: [0.11, 0.092, 0.082],
      pos: [-0.12, 0.268, -0.198],
      mat: matHairMid,
    },
    {
      name: 'Back_Curl_Mid_Center',
      size: [0.12, 0.095, 0.086],
      pos: [0, 0.272, -0.205],
      mat: matHairTopAccent,
    },
    {
      name: 'Back_Curl_Mid_Right',
      size: [0.11, 0.092, 0.082],
      pos: [0.12, 0.268, -0.198],
      mat: matHairBase,
    },
    {
      name: 'Back_Curl_Lower_Left',
      size: [0.1, 0.084, 0.074],
      pos: [-0.105, 0.175, -0.19],
      mat: matHairBase,
    },
    {
      name: 'Back_Curl_Lower_Center',
      size: [0.115, 0.086, 0.078],
      pos: [0, 0.178, -0.196],
      mat: matHairMid,
    },
    {
      name: 'Back_Curl_Lower_Right',
      size: [0.1, 0.084, 0.074],
      pos: [0.105, 0.175, -0.19],
      mat: matHairHighlight,
    },
  ];
  for (const c of backCurlClusters) {
    addVoxelBox(hairBackCurls, c.name, c.size, c.pos, c.mat);
  }

  // 8. Hair_Temple_Transition: Sideburn & temple curl steps framing the cheeks & ears
  const hairTempleTransition = new THREE.Group();
  hairTempleTransition.name = 'Hair_Temple_Transition';
  hairRoot.add(hairTempleTransition);
  addVoxelBox(
    hairTempleTransition,
    'Temple_Sideburn_Left_Upper',
    [0.048, 0.072, 0.068],
    [-0.192, 0.252, 0.105],
    matHairBase
  );
  addVoxelBox(
    hairTempleTransition,
    'Temple_Sideburn_Left_Tip',
    [0.038, 0.052, 0.048],
    [-0.188, 0.198, 0.092],
    matHairShadow
  );
  addVoxelBox(
    hairTempleTransition,
    'Temple_Sideburn_Right_Upper',
    [0.048, 0.072, 0.068],
    [0.192, 0.252, 0.105],
    matHairBase
  );
  addVoxelBox(
    hairTempleTransition,
    'Temple_Sideburn_Right_Tip',
    [0.038, 0.052, 0.048],
    [0.188, 0.198, 0.092],
    matHairShadow
  );

  // 9. Hair_Nape_Details: Tapered lower neckline curls above the hoodie collar
  const hairNapeDetails = new THREE.Group();
  hairNapeDetails.name = 'Hair_Nape_Details';
  hairRoot.add(hairNapeDetails);
  addVoxelBox(
    hairNapeDetails,
    'Nape_Taper_Center',
    [0.16, 0.058, 0.062],
    [0, 0.105, -0.175],
    matHairShadow
  );
  addVoxelBox(
    hairNapeDetails,
    'Nape_Taper_Left',
    [0.085, 0.052, 0.058],
    [-0.105, 0.11, -0.168],
    matHairBase
  );
  addVoxelBox(
    hairNapeDetails,
    'Nape_Taper_Right',
    [0.085, 0.052, 0.058],
    [0.105, 0.11, -0.168],
    matHairBase
  );

  // ==========================================================================
  // ARMS, CUFFS, WRISTS, 3D HANDS, & PROPS ATTACHMENT (`Torso -> LeftArm / RightArm`)
  // ==========================================================================
  const leftArm = new THREE.Group();
  leftArm.name = 'LeftArm';
  leftArm.position.set(-0.235, 0.285, 0);
  torso.add(leftArm);

  addVoxelBox(leftArm, 'Left_Shoulder_Cap', [0.115, 0.11, 0.125], [0, -0.02, 0], matJacket);
  // Cyan cloud/ops patch on left outer sleeve
  addVoxelBox(
    leftArm,
    'Left_Sleeve_Cyan_Patch',
    [0.018, 0.048, 0.062],
    [-0.056, -0.045, 0],
    matCyanAccent
  );
  addVoxelBox(leftArm, 'Left_Upper_Sleeve', [0.105, 0.17, 0.112], [0, -0.11, 0], matJacket);
  addVoxelBox(leftArm, 'Left_Sleeve_Cyan_Piping', [0.108, 0.02, 0.116], [0, -0.19, 0], matCyanAccent);
  addVoxelBox(leftArm, 'Left_Inner_White_Cuff', [0.098, 0.045, 0.104], [0, -0.215, 0], matInnerShirt);
  addVoxelBox(leftArm, 'Left_Wrist_Skin', [0.082, 0.032, 0.086], [0, -0.242, 0], matSkinShadow);

  const leftHand = new THREE.Group();
  leftHand.name = 'LeftHand';
  leftHand.position.set(0, -0.27, 0);
  leftArm.add(leftHand);
  addVoxelBox(leftHand, 'Left_Palm', [0.082, 0.062, 0.088], [0, -0.012, 0], matSkin);
  addVoxelBox(leftHand, 'Left_Fingers_Block', [0.076, 0.036, 0.082], [0, -0.052, 0.004], matSkinShadow);
  addVoxelBox(leftHand, 'Left_Thumb', [0.03, 0.04, 0.036], [0.044, -0.02, 0.028], matSkin);

  const rightArm = new THREE.Group();
  rightArm.name = 'RightArm';
  rightArm.position.set(0.235, 0.285, 0);
  torso.add(rightArm);

  addVoxelBox(rightArm, 'Right_Shoulder_Cap', [0.115, 0.11, 0.125], [0, -0.02, 0], matJacket);
  addVoxelBox(
    rightArm,
    'Right_Sleeve_Cyan_Patch',
    [0.018, 0.048, 0.062],
    [0.056, -0.045, 0],
    matCyanAccent
  );
  addVoxelBox(rightArm, 'Right_Upper_Sleeve', [0.105, 0.17, 0.112], [0, -0.11, 0], matJacket);
  addVoxelBox(rightArm, 'Right_Sleeve_Cyan_Piping', [0.108, 0.02, 0.116], [0, -0.19, 0], matCyanAccent);
  addVoxelBox(rightArm, 'Right_Inner_White_Cuff', [0.098, 0.045, 0.104], [0, -0.215, 0], matInnerShirt);
  addVoxelBox(rightArm, 'Right_Wrist_Skin', [0.082, 0.032, 0.086], [0, -0.242, 0], matSkinShadow);

  const rightHand = new THREE.Group();
  rightHand.name = 'RightHand';
  rightHand.position.set(0, -0.27, 0);
  rightArm.add(rightHand);
  addVoxelBox(rightHand, 'Right_Palm', [0.082, 0.062, 0.088], [0, -0.012, 0], matSkin);
  addVoxelBox(
    rightHand,
    'Right_Fingers_Block',
    [0.076, 0.036, 0.082],
    [0, -0.052, 0.004],
    matSkinShadow
  );
  addVoxelBox(rightHand, 'Right_Thumb', [0.03, 0.04, 0.036], [-0.044, -0.02, 0.028], matSkin);

  // ==========================================================================
  // 7 HANDHELD PROPS (`RightHand -> Props_Attachment`)
  // ==========================================================================
  const propsAttachment = new THREE.Group();
  propsAttachment.name = 'Props_Attachment';
  propsAttachment.position.set(-0.04, -0.04, 0.12);
  rightHand.add(propsAttachment);

  // 1. DevOps Laptop Prop (with Cloud Logo on Lid)
  const laptopProp = new THREE.Group();
  laptopProp.name = 'DevOps_Laptop_Prop';
  laptopProp.visible = false;
  propsAttachment.add(laptopProp);
  addVoxelBox(laptopProp, 'Laptop_Base', [0.22, 0.018, 0.16], [0, 0, 0.04], matDeviceSilver);
  addVoxelBox(
    laptopProp,
    'Laptop_Screen_Lid',
    [0.22, 0.15, 0.016],
    [0, 0.072, 0.115],
    matDeviceChassis,
    [-0.22, 0, 0]
  );
  addVoxelBox(
    laptopProp,
    'Laptop_Display_Panel',
    [0.195, 0.125, 0.006],
    [0, 0.072, 0.106],
    matScreenDark,
    [-0.22, 0, 0]
  );
  addVoxelBox(
    laptopProp,
    'Laptop_Lid_Cloud_Badge',
    [0.065, 0.038, 0.008],
    [0, 0.074, 0.124],
    matCloudWhite,
    [-0.22, 0, 0]
  );

  // 2. Monitoring Tablet Prop
  const tabletProp = new THREE.Group();
  tabletProp.name = 'Tablet_Prop';
  tabletProp.visible = false;
  propsAttachment.add(tabletProp);
  addVoxelBox(tabletProp, 'Tablet_Body', [0.16, 0.115, 0.016], [0, 0.02, 0.03], matDeviceChassis);
  addVoxelBox(tabletProp, 'Tablet_Screen', [0.14, 0.095, 0.018], [0, 0.02, 0.032], matScreenDark);
  addVoxelBox(tabletProp, 'Tablet_Metric_Bar', [0.1, 0.02, 0.02], [0, 0.03, 0.034], matCyanAccent);

  // 3. Smartphone Prop
  const smartphoneProp = new THREE.Group();
  smartphoneProp.name = 'Smartphone_Prop';
  smartphoneProp.visible = false;
  propsAttachment.add(smartphoneProp);
  addVoxelBox(smartphoneProp, 'Phone_Body', [0.055, 0.105, 0.014], [0.02, 0.03, 0.02], matDeviceChassis);
  addVoxelBox(smartphoneProp, 'Phone_Screen', [0.046, 0.088, 0.016], [0.02, 0.03, 0.022], matScreenDark);

  // 4. Technical Clipboard Prop
  const clipboardProp = new THREE.Group();
  clipboardProp.name = 'Technical_Clipboard_Prop';
  clipboardProp.visible = false;
  propsAttachment.add(clipboardProp);
  addVoxelBox(clipboardProp, 'Clipboard_Board', [0.145, 0.19, 0.014], [0, 0.02, 0.03], matDeviceChassis);
  addVoxelBox(clipboardProp, 'Clipboard_Sheet', [0.125, 0.16, 0.016], [0, 0.015, 0.032], matPaperWhite);
  addVoxelBox(clipboardProp, 'Clipboard_Clip', [0.055, 0.022, 0.022], [0, 0.1, 0.034], matCyanAccent);

  // 5. Runbook / Technical Binder Prop
  const runbookProp = new THREE.Group();
  runbookProp.name = 'Runbook_Prop';
  runbookProp.visible = false;
  propsAttachment.add(runbookProp);
  addVoxelBox(runbookProp, 'Runbook_Cover', [0.155, 0.185, 0.032], [0, 0.025, 0.035], matRunbookBlue);
  addVoxelBox(runbookProp, 'Runbook_Pages', [0.142, 0.172, 0.026], [0.005, 0.025, 0.035], matPaperWhite);
  addVoxelBox(runbookProp, 'Runbook_Cloud_Stripe', [0.09, 0.028, 0.036], [0, 0.05, 0.035], matCyanAccent);

  // 6. Coffee Cup Prop (White Mug with Cyan Cloud Sleeve)
  const coffeeProp = new THREE.Group();
  coffeeProp.name = 'Coffee_Cup_Prop';
  coffeeProp.visible = false;
  propsAttachment.add(coffeeProp);
  addVoxelBox(coffeeProp, 'Coffee_Mug_Body', [0.068, 0.088, 0.068], [0.01, 0.02, 0.02], matCloudWhite);
  addVoxelBox(coffeeProp, 'Coffee_Cyan_Sleeve', [0.072, 0.038, 0.072], [0.01, 0.018, 0.02], matCyanAccent);
  addVoxelBox(coffeeProp, 'Coffee_Liquid_Top', [0.056, 0.012, 0.056], [0.01, 0.06, 0.02], matCoffeeLiquid);

  // 7. Diagnostic Device Prop (Infra Scanner)
  const diagnosticProp = new THREE.Group();
  diagnosticProp.name = 'Diagnostic_Device_Prop';
  diagnosticProp.visible = false;
  propsAttachment.add(diagnosticProp);
  addVoxelBox(
    diagnosticProp,
    'Diag_Scanner_Chassis',
    [0.095, 0.145, 0.028],
    [0, 0.025, 0.03],
    matDeviceChassis
  );
  addVoxelBox(
    diagnosticProp,
    'Diag_Scanner_Screen',
    [0.076, 0.082, 0.032],
    [0, 0.042, 0.03],
    matScreenGreen
  );
  addVoxelBox(
    diagnosticProp,
    'Diag_Scanner_Antenna',
    [0.018, 0.045, 0.018],
    [0.03, 0.11, 0.03],
    matCyanAccent
  );

  const propNodes: Record<Exclude<DevOpsPropId, 'none'>, THREE.Group> = {
    devops_laptop: laptopProp,
    tablet: tabletProp,
    smartphone: smartphoneProp,
    technical_clipboard: clipboardProp,
    runbook: runbookProp,
    coffee_cup: coffeeProp,
    diagnostic_device: diagnosticProp,
  };

  // ==========================================================================
  // LEGS, TROUSER CUFFS, ANKLES, & WHITE/CYAN SNEAKERS AT Y = 0.000
  // (`Hips -> LeftLeg / RightLeg` at y = -0.04 => sole bottom at y = -0.86 => World Y = 0.000)
  // ==========================================================================
  const leftLeg = new THREE.Group();
  leftLeg.name = 'LeftLeg';
  leftLeg.position.set(-0.095, -0.04, 0);
  hips.add(leftLeg);

  addVoxelBox(leftLeg, 'Left_Thigh_Bridge', [0.148, 0.09, 0.168], [0, -0.01, 0], matTrousers);
  addVoxelBox(leftLeg, 'Left_Trouser_Leg', [0.144, 0.69, 0.162], [0, -0.37, 0], matTrousers);
  addVoxelBox(leftLeg, 'Left_Trouser_Cyan_Pip', [0.016, 0.56, 0.026], [-0.07, -0.36, 0.01], matCyanDeep);
  addVoxelBox(leftLeg, 'Left_Trouser_White_Cuff', [0.15, 0.042, 0.168], [0, -0.695, 0], matTrouserCuff);
  addVoxelBox(leftLeg, 'Left_Ankle_Connector', [0.118, 0.065, 0.128], [0, -0.73, 0], matJacketDark);
  // Sneaker (Y = -0.74 to -0.86 => World Y = 0.000)
  addVoxelBox(leftLeg, 'Left_Sneaker_Upper', [0.152, 0.082, 0.215], [0, -0.785, 0.022], matSneakerWhite);
  addVoxelBox(leftLeg, 'Left_Sneaker_Toe_Cap', [0.146, 0.056, 0.075], [0, -0.798, 0.105], matSneakerWhite);
  addVoxelBox(
    leftLeg,
    'Left_Sneaker_Cyan_Stripe',
    [0.158, 0.028, 0.12],
    [0, -0.785, 0.02],
    matSneakerCyan
  );
  addVoxelBox(
    leftLeg,
    'Left_Sneaker_Tongue_Cyan',
    [0.078, 0.042, 0.032],
    [0, -0.742, 0.088],
    matCyanAccent
  );
  addVoxelBox(leftLeg, 'Left_Sneaker_Sole', [0.16, 0.038, 0.228], [0, -0.841, 0.022], matSneakerSole);

  const rightLeg = new THREE.Group();
  rightLeg.name = 'RightLeg';
  rightLeg.position.set(0.095, -0.04, 0);
  hips.add(rightLeg);

  addVoxelBox(rightLeg, 'Right_Thigh_Bridge', [0.148, 0.09, 0.168], [0, -0.01, 0], matTrousers);
  addVoxelBox(rightLeg, 'Right_Trouser_Leg', [0.144, 0.69, 0.162], [0, -0.37, 0], matTrousers);
  addVoxelBox(rightLeg, 'Right_Trouser_Cyan_Pip', [0.016, 0.56, 0.026], [0.07, -0.36, 0.01], matCyanDeep);
  addVoxelBox(
    rightLeg,
    'Right_Trouser_White_Cuff',
    [0.15, 0.042, 0.168],
    [0, -0.695, 0],
    matTrouserCuff
  );
  addVoxelBox(rightLeg, 'Right_Ankle_Connector', [0.118, 0.065, 0.128], [0, -0.73, 0], matJacketDark);
  addVoxelBox(
    rightLeg,
    'Right_Sneaker_Upper',
    [0.152, 0.082, 0.215],
    [0, -0.785, 0.022],
    matSneakerWhite
  );
  addVoxelBox(
    rightLeg,
    'Right_Sneaker_Toe_Cap',
    [0.146, 0.056, 0.075],
    [0, -0.798, 0.105],
    matSneakerWhite
  );
  addVoxelBox(
    rightLeg,
    'Right_Sneaker_Cyan_Stripe',
    [0.158, 0.028, 0.12],
    [0, -0.785, 0.02],
    matSneakerCyan
  );
  addVoxelBox(
    rightLeg,
    'Right_Sneaker_Tongue_Cyan',
    [0.078, 0.042, 0.032],
    [0, -0.742, 0.088],
    matCyanAccent
  );
  addVoxelBox(rightLeg, 'Right_Sneaker_Sole', [0.16, 0.038, 0.228], [0, -0.841, 0.022], matSneakerSole);

  characterRoot.updateMatrixWorld(true);

  let meshCount = 0;
  let triangleCount = 0;
  characterRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      meshCount++;
      const geom = (obj as THREE.Mesh).geometry;
      if (geom.index) {
        triangleCount += Math.floor(geom.index.count / 3);
      } else if (geom.attributes.position) {
        triangleCount += Math.floor(geom.attributes.position.count / 3);
      }
    }
  });

  return {
    characterRoot,
    hips,
    torso,
    neck,
    head,
    hairRoot,
    faceFeatures,
    eyesGroup,
    leftEye,
    rightEye,
    eyebrowsGroup,
    leftBrow,
    rightBrow,
    mouthGroup,
    mouthMesh,
    glassesGroup,
    coolSunglassesGroup,
    headphonesGroup,
    alertBadgeGroup,
    sweatDropGroup,
    sleepZzzGroup,
    backpackGroup,
    leftArm,
    leftHand,
    rightArm,
    rightHand,
    propsAttachment,
    propNodes,
    leftLeg,
    rightLeg,
    materials,
    meshCount,
    triangleCount,
  };
}

// ============================================================================
// 27 EMBEDDED GLB ANIMATION CLIPS BUILDER
// ============================================================================

function makePosTrack(
  nodeName: string,
  times: number[],
  values: Array<[number, number, number]>
): THREE.VectorKeyframeTrack {
  const flat: number[] = [];
  for (const v of values) flat.push(v[0], v[1], v[2]);
  return new THREE.VectorKeyframeTrack(`${nodeName}.position`, times, flat);
}

function makeQuatTrack(
  nodeName: string,
  times: number[],
  eulers: Array<[number, number, number]>
): THREE.QuaternionKeyframeTrack {
  const flat: number[] = [];
  const euler = new THREE.Euler();
  const quat = new THREE.Quaternion();
  for (const e of eulers) {
    euler.set(e[0], e[1], e[2], 'XYZ');
    quat.setFromEuler(euler);
    flat.push(quat.x, quat.y, quat.z, quat.w);
  }
  return new THREE.QuaternionKeyframeTrack(`${nodeName}.quaternion`, times, flat);
}

/**
 * Generates all 27 embedded `THREE.AnimationClip` tracks for `devops_engineer_agent.glb`.
 */
export function buildDevOpsEngineerAnimationClips(): THREE.AnimationClip[] {
  const standY = DEVOPS_CHARACTER_CONSTANTS.STANDING_HIPS_Y;
  const seatY = DEVOPS_CHARACTER_CONSTANTS.SEATED_HIPS_Y;
  const clips: THREE.AnimationClip[] = [];

  const addClip = (
    name: DevOpsAnimationClipName,
    duration: number,
    tracks: THREE.KeyframeTrack[]
  ) => {
    clips.push(new THREE.AnimationClip(name, duration, tracks));
  };

  // 1. Idle_Breathing
  addClip('Idle_Breathing', 2.4, [
    makePosTrack('Hips', [0, 1.2, 2.4], [
      [0, standY, 0],
      [0, standY + 0.012, 0],
      [0, standY, 0],
    ]),
    makeQuatTrack('Head', [0, 1.2, 2.4], [
      [0, 0, 0],
      [-0.03, 0.04, 0],
      [0, 0, 0],
    ]),
    makeQuatTrack('LeftArm', [0, 1.2, 2.4], [
      [0.04, 0, 0.04],
      [0.08, 0, 0.05],
      [0.04, 0, 0.04],
    ]),
    makeQuatTrack('RightArm', [0, 1.2, 2.4], [
      [0.04, 0, -0.04],
      [0.08, 0, -0.05],
      [0.04, 0, -0.04],
    ]),
    makeQuatTrack('LeftLeg', [0, 2.4], [
      [0, 0, 0],
      [0, 0, 0],
    ]),
    makeQuatTrack('RightLeg', [0, 2.4], [
      [0, 0, 0],
      [0, 0, 0],
    ]),
  ]);

  // 2. Walk_Cycle
  addClip('Walk_Cycle', 1.0, [
    makePosTrack('Hips', [0, 0.25, 0.5, 0.75, 1.0], [
      [0, standY, 0],
      [0, standY + 0.026, 0],
      [0, standY, 0],
      [0, standY + 0.026, 0],
      [0, standY, 0],
    ]),
    makeQuatTrack('LeftLeg', [0, 0.25, 0.5, 0.75, 1.0], [
      [0.42, 0, 0],
      [0, 0, 0],
      [-0.42, 0, 0],
      [0, 0, 0],
      [0.42, 0, 0],
    ]),
    makeQuatTrack('RightLeg', [0, 0.25, 0.5, 0.75, 1.0], [
      [-0.42, 0, 0],
      [0, 0, 0],
      [0.42, 0, 0],
      [0, 0, 0],
      [-0.42, 0, 0],
    ]),
    makeQuatTrack('LeftArm', [0, 0.25, 0.5, 0.75, 1.0], [
      [-0.32, 0, 0.04],
      [0, 0, 0.04],
      [0.32, 0, 0.04],
      [0, 0, 0.04],
      [-0.32, 0, 0.04],
    ]),
    makeQuatTrack('RightArm', [0, 0.25, 0.5, 0.75, 1.0], [
      [0.32, 0, -0.04],
      [0, 0, -0.04],
      [-0.32, 0, -0.04],
      [0, 0, -0.04],
      [0.32, 0, -0.04],
    ]),
  ]);

  // 3. Sit_Down
  addClip('Sit_Down', 0.8, [
    makePosTrack('Hips', [0, 0.8], [
      [0, standY, 0],
      [0, seatY, 0],
    ]),
    makeQuatTrack('LeftLeg', [0, 0.8], [
      [0, 0, 0],
      [-1.32, 0, 0],
    ]),
    makeQuatTrack('RightLeg', [0, 0.8], [
      [0, 0, 0],
      [-1.32, 0, 0],
    ]),
  ]);

  // 4. Stand_Up
  addClip('Stand_Up', 0.8, [
    makePosTrack('Hips', [0, 0.8], [
      [0, seatY, 0],
      [0, standY, 0],
    ]),
    makeQuatTrack('LeftLeg', [0, 0.8], [
      [-1.32, 0, 0],
      [0, 0, 0],
    ]),
    makeQuatTrack('RightLeg', [0, 0.8], [
      [-1.32, 0, 0],
      [0, 0, 0],
    ]),
  ]);

  // Helper for seated console clips
  const makeSeatedConsoleClip = (
    name: DevOpsAnimationClipName,
    headYaws: [number, number, number],
    leftArmPitch: [number, number],
    rightArmPitch: [number, number]
  ) => {
    addClip(name, 1.8, [
      makePosTrack('Hips', [0, 0.9, 1.8], [
        [0, seatY, 0],
        [0, seatY + 0.008, 0],
        [0, seatY, 0],
      ]),
      makeQuatTrack('LeftLeg', [0, 1.8], [
        [-1.32, 0, 0],
        [-1.32, 0, 0],
      ]),
      makeQuatTrack('RightLeg', [0, 1.8], [
        [-1.32, 0, 0],
        [-1.32, 0, 0],
      ]),
      makeQuatTrack('Head', [0, 0.6, 1.2, 1.8], [
        [-0.08, headYaws[0], 0],
        [-0.06, headYaws[1], 0],
        [-0.08, headYaws[2], 0],
        [-0.08, headYaws[0], 0],
      ]),
      makeQuatTrack('LeftArm', [0, 0.45, 0.9, 1.35, 1.8], [
        [leftArmPitch[0], 0.12, 0.05],
        [leftArmPitch[1], 0.12, 0.05],
        [leftArmPitch[0], 0.12, 0.05],
        [leftArmPitch[1], 0.12, 0.05],
        [leftArmPitch[0], 0.12, 0.05],
      ]),
      makeQuatTrack('RightArm', [0, 0.45, 0.9, 1.35, 1.8], [
        [rightArmPitch[0], -0.12, -0.05],
        [rightArmPitch[1], -0.12, -0.05],
        [rightArmPitch[0], -0.12, -0.05],
        [rightArmPitch[1], -0.12, -0.05],
        [rightArmPitch[0], -0.12, -0.05],
      ]),
    ]);
  };

  // 5. Work_Typing
  makeSeatedConsoleClip('Work_Typing', [-0.05, 0.06, -0.03], [-0.95, -1.08], [-1.06, -0.94]);
  // 6. Review_CICD_Pipeline
  makeSeatedConsoleClip('Review_CICD_Pipeline', [-0.14, 0.12, -0.08], [-0.88, -0.96], [-0.92, -1.04]);
  // 7. Review_Logs
  makeSeatedConsoleClip('Review_Logs', [0.16, 0.24, 0.12], [-0.85, -0.92], [-0.95, -1.05]);
  // 8. Engine_Switch_Review
  makeSeatedConsoleClip('Engine_Switch_Review', [-0.12, 0.18, 0.0], [-0.9, -1.02], [-0.98, -1.12]);

  // Helper for standing active DevOps clips
  const makeStandingOpsClip = (
    name: DevOpsAnimationClipName,
    duration: number,
    headEulers: Array<[number, number, number]>,
    leftArmEulers: Array<[number, number, number]>,
    rightArmEulers: Array<[number, number, number]>
  ) => {
    const times = [0, duration / 2, duration];
    addClip(name, duration, [
      makePosTrack('Hips', times, [
        [0, standY, 0],
        [0, standY + 0.014, 0],
        [0, standY, 0],
      ]),
      makeQuatTrack('LeftLeg', [0, duration], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('RightLeg', [0, duration], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('Head', times, headEulers),
      makeQuatTrack('LeftArm', times, leftArmEulers),
      makeQuatTrack('RightArm', times, rightArmEulers),
    ]);
  };

  // 9. Technical_Talk
  makeStandingOpsClip(
    'Technical_Talk',
    2.0,
    [
      [0, -0.08, 0],
      [-0.05, 0.1, 0.03],
      [0, -0.08, 0],
    ],
    [
      [-0.55, 0.15, 0.08],
      [-0.85, 0.22, 0.14],
      [-0.55, 0.15, 0.08],
    ],
    [
      [-0.72, -0.18, -0.08],
      [-0.58, -0.1, -0.05],
      [-0.72, -0.18, -0.08],
    ]
  );

  // 10. Monitor_Infrastructure
  makeStandingOpsClip(
    'Monitor_Infrastructure',
    2.2,
    [
      [-0.06, -0.12, 0],
      [-0.08, 0.14, 0],
      [-0.06, -0.12, 0],
    ],
    [
      [-0.38, 0.1, 0.06],
      [-0.52, 0.14, 0.08],
      [-0.38, 0.1, 0.06],
    ],
    [
      [-0.88, -0.2, -0.08],
      [-0.96, -0.25, -0.1],
      [-0.88, -0.2, -0.08],
    ]
  );

  // 11. Deployment_Preparation
  makeStandingOpsClip(
    'Deployment_Preparation',
    2.0,
    [
      [0.12, -0.06, 0],
      [0.06, 0.08, 0],
      [0.12, -0.06, 0],
    ],
    [
      [-0.68, 0.2, 0.08],
      [-0.82, 0.25, 0.1],
      [-0.68, 0.2, 0.08],
    ],
    [
      [-0.92, -0.22, -0.08],
      [-0.84, -0.18, -0.06],
      [-0.92, -0.22, -0.08],
    ]
  );

  // 12. Deploy_Demo
  makeStandingOpsClip(
    'Deploy_Demo',
    2.0,
    [
      [-0.08, 0.04, 0],
      [-0.14, 0.12, 0],
      [-0.08, 0.04, 0],
    ],
    [
      [-1.12, 0.15, 0.18],
      [-1.35, 0.22, 0.24],
      [-1.12, 0.15, 0.18],
    ],
    [
      [-0.85, -0.22, -0.08],
      [-0.95, -0.26, -0.1],
      [-0.85, -0.22, -0.08],
    ]
  );

  // 13. Inspect_Server_Rack
  makeStandingOpsClip(
    'Inspect_Server_Rack',
    2.2,
    [
      [-0.12, -0.1, 0],
      [0.08, 0.12, 0],
      [-0.12, -0.1, 0],
    ],
    [
      [-0.45, 0.12, 0.06],
      [-0.78, 0.18, 0.1],
      [-0.45, 0.12, 0.06],
    ],
    [
      [-0.95, -0.16, -0.08],
      [-1.08, -0.2, -0.1],
      [-0.95, -0.16, -0.08],
    ]
  );

  // 14. Service_Health_Review
  makeStandingOpsClip(
    'Service_Health_Review',
    2.0,
    [
      [-0.04, -0.1, 0],
      [-0.06, 0.1, 0],
      [-0.04, -0.1, 0],
    ],
    [
      [-0.5, 0.15, 0.06],
      [-0.65, 0.18, 0.08],
      [-0.5, 0.15, 0.06],
    ],
    [
      [-0.86, -0.22, -0.08],
      [-0.92, -0.24, -0.08],
      [-0.86, -0.22, -0.08],
    ]
  );

  // 15. Incident_Alert_Reaction
  makeStandingOpsClip(
    'Incident_Alert_Reaction',
    1.6,
    [
      [-0.1, -0.16, 0.04],
      [-0.14, 0.16, -0.04],
      [-0.1, -0.16, 0.04],
    ],
    [
      [-1.18, 0.24, 0.22],
      [-1.36, 0.3, 0.28],
      [-1.18, 0.24, 0.22],
    ],
    [
      [-0.96, -0.24, -0.12],
      [-1.12, -0.28, -0.16],
      [-0.96, -0.24, -0.12],
    ]
  );

  // 16. Troubleshoot_Incident
  makeStandingOpsClip(
    'Troubleshoot_Incident',
    2.0,
    [
      [0.14, -0.08, 0],
      [0.08, 0.1, 0],
      [0.14, -0.08, 0],
    ],
    [
      [-0.88, 0.22, 0.08],
      [-1.02, 0.26, 0.1],
      [-0.88, 0.22, 0.08],
    ],
    [
      [-0.94, -0.22, -0.08],
      [-1.06, -0.26, -0.1],
      [-0.94, -0.22, -0.08],
    ]
  );

  // 17. Analyze_Metrics
  makeStandingOpsClip(
    'Analyze_Metrics',
    2.2,
    [
      [-0.08, -0.14, 0.03],
      [-0.04, 0.14, -0.03],
      [-0.08, -0.14, 0.03],
    ],
    [
      [-0.62, 0.18, 0.08],
      [-0.92, 0.24, 0.12],
      [-0.62, 0.18, 0.08],
    ],
    [
      [-0.88, -0.2, -0.08],
      [-0.95, -0.22, -0.08],
      [-0.88, -0.2, -0.08],
    ]
  );

  // 18. AI_Engine_Status_Review
  makeStandingOpsClip(
    'AI_Engine_Status_Review',
    2.2,
    [
      [-0.06, -0.1, 0],
      [-0.1, 0.12, 0],
      [-0.06, -0.1, 0],
    ],
    [
      [-0.72, 0.16, 0.1],
      [-0.98, 0.22, 0.14],
      [-0.72, 0.16, 0.1],
    ],
    [
      [-0.92, -0.2, -0.08],
      [-1.04, -0.24, -0.1],
      [-0.92, -0.2, -0.08],
    ]
  );

  // 19. Resource_Health_Check
  makeStandingOpsClip(
    'Resource_Health_Check',
    2.0,
    [
      [0.06, -0.1, 0],
      [-0.08, 0.1, 0],
      [0.06, -0.1, 0],
    ],
    [
      [-0.58, 0.18, 0.08],
      [-0.82, 0.22, 0.1],
      [-0.58, 0.18, 0.08],
    ],
    [
      [-0.88, -0.2, -0.08],
      [-0.96, -0.22, -0.08],
      [-0.88, -0.2, -0.08],
    ]
  );

  // 20. Read_Runbook
  makeStandingOpsClip(
    'Read_Runbook',
    2.2,
    [
      [0.18, -0.06, 0],
      [0.16, 0.08, 0],
      [0.18, -0.06, 0],
    ],
    [
      [-0.76, 0.24, 0.08],
      [-0.84, 0.26, 0.1],
      [-0.76, 0.24, 0.08],
    ],
    [
      [-0.88, -0.24, -0.08],
      [-0.94, -0.26, -0.1],
      [-0.88, -0.24, -0.08],
    ]
  );

  // 21. Release_Readiness_Discussion
  makeStandingOpsClip(
    'Release_Readiness_Discussion',
    2.2,
    [
      [-0.05, -0.12, 0],
      [-0.08, 0.12, 0],
      [-0.05, -0.12, 0],
    ],
    [
      [-0.82, 0.16, 0.12],
      [-1.08, 0.22, 0.18],
      [-0.82, 0.16, 0.12],
    ],
    [
      [-0.86, -0.2, -0.08],
      [-0.94, -0.22, -0.08],
      [-0.86, -0.2, -0.08],
    ]
  );

  // 22. Present_Operations_Status
  makeStandingOpsClip(
    'Present_Operations_Status',
    2.2,
    [
      [-0.04, -0.14, 0],
      [-0.06, 0.14, 0],
      [-0.04, -0.14, 0],
    ],
    [
      [-0.98, 0.2, 0.18],
      [-1.24, 0.28, 0.25],
      [-0.98, 0.2, 0.18],
    ],
    [
      [-0.82, -0.18, -0.08],
      [-0.9, -0.22, -0.08],
      [-0.82, -0.18, -0.08],
    ]
  );

  // 23. Phone_Call
  makeStandingOpsClip(
    'Phone_Call',
    2.0,
    [
      [0.02, 0.06, -0.05],
      [-0.02, 0.1, -0.06],
      [0.02, 0.06, -0.05],
    ],
    [
      [0.06, 0, 0.06],
      [0.12, 0, 0.08],
      [0.06, 0, 0.06],
    ],
    [
      [-1.42, -0.38, -0.18],
      [-1.48, -0.42, -0.2],
      [-1.42, -0.38, -0.18],
    ]
  );

  // 24. Think_Investigate
  makeStandingOpsClip(
    'Think_Investigate',
    2.2,
    [
      [0.08, -0.1, 0.05],
      [0.04, 0.08, -0.04],
      [0.08, -0.1, 0.05],
    ],
    [
      [-0.55, 0.32, 0.1],
      [-0.6, 0.35, 0.12],
      [-0.55, 0.32, 0.1],
    ],
    [
      [-1.28, -0.36, -0.12],
      [-1.34, -0.38, -0.14],
      [-1.28, -0.36, -0.12],
    ]
  );

  // 25. Coffee_Break
  makeStandingOpsClip(
    'Coffee_Break',
    2.4,
    [
      [0, -0.05, 0],
      [-0.12, 0.02, 0],
      [0, -0.05, 0],
    ],
    [
      [0.06, 0, 0.05],
      [0.08, 0, 0.06],
      [0.06, 0, 0.05],
    ],
    [
      [-0.85, -0.25, -0.08],
      [-1.28, -0.34, -0.12],
      [-0.85, -0.25, -0.08],
    ]
  );

  // 26. Waiting_Approval
  makeStandingOpsClip(
    'Waiting_Approval',
    2.2,
    [
      [0, -0.08, 0],
      [-0.04, 0.08, 0],
      [0, -0.08, 0],
    ],
    [
      [-0.45, 0.18, 0.06],
      [-0.52, 0.2, 0.08],
      [-0.45, 0.18, 0.06],
    ],
    [
      [-0.78, -0.2, -0.08],
      [-0.84, -0.22, -0.08],
      [-0.78, -0.2, -0.08],
    ]
  );

  // 27. Task_Completed
  makeStandingOpsClip(
    'Task_Completed',
    2.0,
    [
      [-0.08, 0, 0],
      [-0.14, 0.08, 0],
      [-0.08, 0, 0],
    ],
    [
      [-2.15, 0.12, 0.25],
      [-2.35, 0.18, 0.32],
      [-2.15, 0.12, 0.25],
    ],
    [
      [-0.85, -0.2, -0.08],
      [-0.95, -0.24, -0.1],
      [-0.85, -0.2, -0.08],
    ]
  );

  return clips;
}

export function buildDevOpsEngineerSceneAndClips(): {
  model: BuiltDevOpsCharacterModel;
  root: THREE.Group;
  clips: THREE.AnimationClip[];
} {
  const model = buildDevOpsEngineerModel();
  const clips = buildDevOpsEngineerAnimationClips();
  model.characterRoot.animations = clips;
  return { model, root: model.characterRoot, clips };
}

/**
 * Exports `devops_engineer_agent.glb` as a binary ArrayBuffer with all 27 embedded AnimationClips.
 */
export async function exportDevOpsEngineerToGLBBuffer(): Promise<ArrayBuffer> {
  const { model, clips } = buildDevOpsEngineerSceneAndClips();
  const exportScene = new THREE.Scene();
  exportScene.name = 'Scene';
  exportScene.add(model.characterRoot);
  exportScene.updateMatrixWorld(true);

  const exporter = new GLTFExporter();
  return new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      exportScene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(new Error('Expected binary ArrayBuffer from GLTFExporter for devops_engineer_agent.glb'));
        }
      },
      (err) => reject(err),
      {
        binary: true,
        animations: clips,
        onlyVisible: true,
      }
    );
  });
}

// ============================================================================
// RUNTIME NAVIGATION PATH & SIMULATION HELPERS
// ============================================================================

export interface DevOpsSimulationHelpers {
  helpersRoot: THREE.Group;
  updatePathVisual: (
    pathPoints: Array<[number, number, number]>,
    targetPos: [number, number, number],
    visible: boolean
  ) => void;
}

export function buildDevOpsSimulationHelpersGroup(): DevOpsSimulationHelpers {
  const helpersRoot = new THREE.Group();
  helpersRoot.name = 'DevOps_Simulation_Helpers';

  const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
  const lineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.03, 0),
    new THREE.Vector3(0, 0.03, 0.1),
  ]);
  const pathLine = new THREE.Line(lineGeom, lineMat);
  pathLine.name = 'DevOps_Nav_Path_Line';
  pathLine.visible = false;
  helpersRoot.add(pathLine);

  const ringGeom = new THREE.RingGeometry(0.18, 0.25, 20);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
  });
  const targetRing = new THREE.Mesh(ringGeom, ringMat);
  targetRing.name = 'DevOps_Target_Ring';
  targetRing.position.y = 0.025;
  targetRing.visible = false;
  helpersRoot.add(targetRing);

  const updatePathVisual = (
    pathPoints: Array<[number, number, number]>,
    targetPos: [number, number, number],
    visible: boolean
  ) => {
    if (!visible || pathPoints.length === 0) {
      pathLine.visible = false;
      targetRing.visible = false;
      return;
    }
    const pts = pathPoints.map((p) => new THREE.Vector3(p[0], 0.03, p[2]));
    if (pts.length >= 2) {
      pathLine.geometry.dispose();
      pathLine.geometry = new THREE.BufferGeometry().setFromPoints(pts);
      pathLine.visible = true;
    } else {
      pathLine.visible = false;
    }
    targetRing.position.set(targetPos[0], 0.025, targetPos[2]);
    targetRing.visible = true;
  };

  return { helpersRoot, updatePathVisual };
}

// ============================================================================
// RUNTIME 3D DEMO FX INDICATORS (NON-EXPORTED SCENE ATTACHMENTS)
// ============================================================================

function buildRuntimeIndicatorsGroup(): {
  indicatorsRoot: THREE.Group;
  indicatorNodes: Record<Exclude<DevOpsRuntimeIndicatorId, 'none'>, THREE.Group>;
} {
  const indicatorsRoot = new THREE.Group();
  indicatorsRoot.name = 'DevOps_Runtime_Indicators';
  indicatorsRoot.position.set(0, 1.92, 0);

  const matCyan = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.35,
    roughness: 0.35,
  });
  const matWhite = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xe0f2fe,
    emissiveIntensity: 0.25,
    roughness: 0.4,
  });
  const matEmerald = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.35,
    roughness: 0.35,
  });
  const matRed = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.4,
    roughness: 0.35,
  });

  // 1. deploy_cloud_upload (3D Cyan Cloud + White Up Arrow)
  const deployCloud = new THREE.Group();
  deployCloud.name = 'Indicator_Deploy_Cloud_Upload';
  deployCloud.visible = false;
  indicatorsRoot.add(deployCloud);
  addVoxelBox(deployCloud, 'Cloud_Base', [0.22, 0.075, 0.06], [0, 0, 0], matCyan);
  addVoxelBox(deployCloud, 'Cloud_Top', [0.13, 0.085, 0.06], [0, 0.055, 0], matCyan);
  addVoxelBox(deployCloud, 'Upload_Arrow_Stem', [0.032, 0.08, 0.07], [0, 0.015, 0], matWhite);
  addVoxelBox(deployCloud, 'Upload_Arrow_Head', [0.075, 0.032, 0.07], [0, 0.058, 0], matWhite);

  // 2. monitoring_pulse (Cyan Telemetry Chart Bars)
  const monitoringPulse = new THREE.Group();
  monitoringPulse.name = 'Indicator_Monitoring_Pulse';
  monitoringPulse.visible = false;
  indicatorsRoot.add(monitoringPulse);
  addVoxelBox(monitoringPulse, 'Pulse_Panel', [0.24, 0.14, 0.025], [0, 0.02, 0], matCyan);
  addVoxelBox(monitoringPulse, 'Pulse_Bar_1', [0.03, 0.05, 0.035], [-0.065, 0.0, 0], matWhite);
  addVoxelBox(monitoringPulse, 'Pulse_Bar_2', [0.03, 0.09, 0.035], [0, 0.02, 0], matEmerald);
  addVoxelBox(monitoringPulse, 'Pulse_Bar_3', [0.03, 0.07, 0.035], [0.065, 0.01, 0], matWhite);

  // 3. incident_alert_triangle (Red Warning Octagon/Triangle with !)
  const incidentAlert = new THREE.Group();
  incidentAlert.name = 'Indicator_Incident_Alert';
  incidentAlert.visible = false;
  indicatorsRoot.add(incidentAlert);
  addVoxelBox(incidentAlert, 'Alert_Sign_Base', [0.18, 0.16, 0.04], [0, 0.02, 0], matRed);
  addVoxelBox(incidentAlert, 'Alert_Sign_Bang', [0.03, 0.075, 0.05], [0, 0.04, 0], matWhite);
  addVoxelBox(incidentAlert, 'Alert_Sign_Dot', [0.03, 0.028, 0.05], [0, -0.025, 0], matWhite);

  // 4. cloud_status_ok (Cyan/Emerald Healthy Cloud Badge)
  const cloudStatusOk = new THREE.Group();
  cloudStatusOk.name = 'Indicator_Cloud_Status_OK';
  cloudStatusOk.visible = false;
  indicatorsRoot.add(cloudStatusOk);
  addVoxelBox(cloudStatusOk, 'Status_OK_Cloud', [0.2, 0.09, 0.045], [0, 0.02, 0], matEmerald);
  addVoxelBox(cloudStatusOk, 'Status_OK_Check', [0.08, 0.03, 0.055], [0, 0.02, 0], matWhite);

  // 5. pipeline_stage_badge (3 Connected CI/CD Nodes)
  const pipelineBadge = new THREE.Group();
  pipelineBadge.name = 'Indicator_Pipeline_Stage';
  pipelineBadge.visible = false;
  indicatorsRoot.add(pipelineBadge);
  addVoxelBox(pipelineBadge, 'Pipe_Node_1', [0.055, 0.055, 0.04], [-0.08, 0.02, 0], matEmerald);
  addVoxelBox(pipelineBadge, 'Pipe_Node_2', [0.055, 0.055, 0.04], [0, 0.02, 0], matCyan);
  addVoxelBox(pipelineBadge, 'Pipe_Node_3', [0.055, 0.055, 0.04], [0.08, 0.02, 0], matEmerald);
  addVoxelBox(pipelineBadge, 'Pipe_Link', [0.2, 0.018, 0.025], [0, 0.02, 0], matWhite);

  // 6. completed_check (Celebratory Green Check Badge)
  const completedCheck = new THREE.Group();
  completedCheck.name = 'Indicator_Completed_Check';
  completedCheck.visible = false;
  indicatorsRoot.add(completedCheck);
  addVoxelBox(completedCheck, 'Check_Plate', [0.17, 0.15, 0.04], [0, 0.02, 0], matEmerald);
  addVoxelBox(completedCheck, 'Check_Mark', [0.09, 0.035, 0.05], [0, 0.02, 0], matWhite);

  return {
    indicatorsRoot,
    indicatorNodes: {
      deploy_cloud_upload: deployCloud,
      monitoring_pulse: monitoringPulse,
      incident_alert_triangle: incidentAlert,
      cloud_status_ok: cloudStatusOk,
      pipeline_stage_badge: pipelineBadge,
      completed_check: completedCheck,
    },
  };
}

// ============================================================================
// INTERACTIVE RUNTIME CONTROLLER (`createDevOpsEngineerRuntime`)
// ============================================================================

export interface DevOpsCharacterRuntimeInstance {
  runtimeRoot: THREE.Group;
  characterRoot: THREE.Group;
  model: BuiltDevOpsCharacterModel;
  clips: THREE.AnimationClip[];
  mixer: THREE.AnimationMixer;
  update: (dt: number) => void;
  triggerAction: (actionId: DevOpsActionId) => void;
  executePlayback: (cmd: DevOpsAnimationPlaybackCommand) => void;
  setSpeedMultiplier: (speed: DevOpsSpeedMultiplier) => void;
  setPatrolActive: (active: boolean) => void;
  startAutoDemo: () => void;
  stopAutoDemo: () => void;
  setExpression: (expr: DevOpsExpressionId) => void;
  setHeadphonesVisible: (visible: boolean) => void;
  setGlassesVisible: (visible: boolean) => void;
  setBackpackVisible: (visible: boolean) => void;
  getStatus: () => DevOpsSimulationRuntimeStatus;
  getActivePathPoints: () => Array<[number, number, number]>;
}

function normalizeAngleDiff(target: number, current: number): number {
  let d = target - current;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function createDevOpsEngineerRuntime(options?: {
  onStatusChange?: (status: DevOpsSimulationRuntimeStatus) => void;
}): DevOpsCharacterRuntimeInstance {
  const { model, clips } = buildDevOpsEngineerSceneAndClips();
  const runtimeRoot = new THREE.Group();
  runtimeRoot.name = 'DevOps_Engineer_Runtime_Root';
  runtimeRoot.add(model.characterRoot);

  const { indicatorsRoot, indicatorNodes } = buildRuntimeIndicatorsGroup();
  runtimeRoot.add(indicatorsRoot);

  const mixer = new THREE.AnimationMixer(model.characterRoot);
  const clipActions = new Map<DevOpsAnimationClipName, THREE.AnimationAction>();
  for (const clip of clips) {
    clipActions.set(clip.name as DevOpsAnimationClipName, mixer.clipAction(clip));
  }

  const spawnAnchor = getDevOpsAnchorById(DEVOPS_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR);
  runtimeRoot.position.set(spawnAnchor.position[0], 0, spawnAnchor.position[2]);
  model.characterRoot.rotation.y = spawnAnchor.rotationY;

  let currentActionId: DevOpsActionId = 'IDLE';
  let currentState: DevOpsAgentState = 'IDLE';
  let activeClipName: DevOpsAnimationClipName = 'Idle_Breathing';
  let currentAnchorId: QADevOpsAnchorId = DEVOPS_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR;
  let targetAnchorId: QADevOpsAnchorId = DEVOPS_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR;
  let currentExpression: DevOpsExpressionId = 'neutral';
  let posture: 'standing' | 'seated' = 'standing';
  let handheldProp: DevOpsPropId = 'none';
  let runtimeIndicator: DevOpsRuntimeIndicatorId = 'none';

  let isWalking = false;
  let isPaused = false;
  let patrolActive = false;
  let patrolIndex = 0;
  let patrolPauseTimer = 0;
  let autoDemoActive = false;
  let autoDemoStepIndex = 0;
  let autoDemoStepTimer = 0;
  let speedMultiplier: DevOpsSpeedMultiplier = 1;

  let headphonesVisible = true; // Default ON around neck
  let glassesVisible = false; // Default OFF
  let backpackUserVisible = true;
  let elapsedClock = 0;

  let navQueue: Array<[number, number, number]> = [];
  let pendingArrivalAction: DevOpsActionId | null = null;

  const playClip = (clipName: DevOpsAnimationClipName) => {
    const nextAction = clipActions.get(clipName);
    if (!nextAction) return;
    if (activeClipName !== clipName) {
      const prevAction = clipActions.get(activeClipName);
      if (prevAction) prevAction.fadeOut(0.18);
      nextAction.reset().fadeIn(0.18).play();
      activeClipName = clipName;
    } else if (!nextAction.isRunning()) {
      nextAction.play();
    }
  };

  const applyExpression = (exprId: DevOpsExpressionId) => {
    currentExpression = exprId;
    const preset = DEVOPS_EXPRESSION_PRESETS[exprId] || DEVOPS_EXPRESSION_PRESETS.neutral;
    model.leftEye.scale.set(1, preset.eyeScaleY, 1);
    model.rightEye.scale.set(1, preset.eyeScaleY, 1);
    model.leftEye.position.set(
      -0.082 + preset.pupilOffsetX,
      0.175 + preset.pupilOffsetY,
      0.172
    );
    model.rightEye.position.set(
      0.082 + preset.pupilOffsetX,
      0.175 + preset.pupilOffsetY,
      0.172
    );
    model.leftBrow.rotation.z = preset.leftBrowTiltRad;
    model.rightBrow.rotation.z = preset.rightBrowTiltRad;
    model.leftBrow.position.y = 0.228 + preset.browOffsetY;
    model.rightBrow.position.y = 0.228 + preset.browOffsetY;
    model.mouthMesh.scale.set(preset.mouthWidthScale, preset.mouthHeightScale, 1);
    model.mouthGroup.position.y = 0.098 + preset.mouthCurveY;
    model.alertBadgeGroup.visible = preset.showAlertBadge;
    model.sweatDropGroup.visible = preset.showSweatDrop;
    model.sleepZzzGroup.visible = preset.showSleepZzz;
    model.coolSunglassesGroup.visible = preset.showCoolSunglasses;
  };

  const applyPropAndIndicator = (
    propId: DevOpsPropId,
    indId: DevOpsRuntimeIndicatorId
  ) => {
    handheldProp = propId;
    for (const [k, grp] of Object.entries(model.propNodes)) {
      grp.visible = k === propId;
    }
    runtimeIndicator = indId;
    for (const [k, grp] of Object.entries(indicatorNodes)) {
      grp.visible = k === indId;
    }
  };

  const syncAccessoryVisibility = () => {
    model.headphonesGroup.visible = headphonesVisible;
    model.glassesGroup.visible = glassesVisible;
    model.backpackGroup.visible = backpackUserVisible && posture !== 'seated';
  };

  const getStatus = (): DevOpsSimulationRuntimeStatus => {
    const act = DEVOPS_ACTIONS[currentActionId] || DEVOPS_ACTIONS.IDLE;
    return {
      characterId: DEVOPS_CHARACTER_CONSTANTS.CHARACTER_ID,
      displayName: DEVOPS_CHARACTER_CONSTANTS.DISPLAY_NAME,
      currentState,
      currentActionId,
      currentActionLabel: `${act.buttonNumber}. ${act.labelId}`,
      activeClipName,
      currentAnchorId,
      targetAnchorId,
      currentExpression,
      posture,
      handheldProp,
      runtimeIndicator,
      isWalking,
      isPaused,
      patrolActive,
      autoDemoActive,
      autoDemoStepIndex,
      autoDemoTotalSteps: DEVOPS_AUTO_DEMO_SEQUENCE.length,
      speedMultiplier,
      headphonesVisible,
      glassesVisible,
      backpackVisible: backpackUserVisible,
      backpackAutoHiddenForSeat: backpackUserVisible && posture === 'seated',
      bubbleText: act.bubbleText,
      thoughtText: act.thoughtText,
      worldPosition: [
        Number(runtimeRoot.position.x.toFixed(2)),
        Number(runtimeRoot.position.y.toFixed(2)),
        Number(runtimeRoot.position.z.toFixed(2)),
      ],
      facingRad: Number(model.characterRoot.rotation.y.toFixed(2)),
    };
  };

  const emitStatus = () => {
    options?.onStatusChange?.(getStatus());
  };

  const applyArrivedActionState = (actionId: DevOpsActionId) => {
    const act = DEVOPS_ACTIONS[actionId] || DEVOPS_ACTIONS.IDLE;
    const anchor = getDevOpsAnchorById(act.targetAnchorName);
    currentActionId = actionId;
    currentState = act.targetState;
    currentAnchorId = act.targetAnchorName;
    targetAnchorId = act.targetAnchorName;
    posture = act.posture;

    runtimeRoot.position.set(anchor.position[0], 0, anchor.position[2]);
    model.characterRoot.rotation.y = anchor.rotationY;

    applyExpression(act.defaultExpression);
    applyPropAndIndicator(act.handheldProp, act.runtimeIndicator);
    syncAccessoryVisibility();
    playClip(act.clipName);
    mixer.update(0.001);
    emitStatus();
  };

  const startNavigationToAction = (actionId: DevOpsActionId, fromAutoDemo = false) => {
    if (!fromAutoDemo) {
      autoDemoActive = false;
    }
    isPaused = false;
    const act = DEVOPS_ACTIONS[actionId] || DEVOPS_ACTIONS.IDLE;
    targetAnchorId = act.targetAnchorName;
    const destAnchor = getDevOpsAnchorById(act.targetAnchorName);

    const curPos: [number, number, number] = [
      runtimeRoot.position.x,
      0,
      runtimeRoot.position.z,
    ];
    const dist = Math.hypot(
      destAnchor.position[0] - curPos[0],
      destAnchor.position[2] - curPos[2]
    );

    if (dist <= 0.16) {
      isWalking = false;
      navQueue = [];
      pendingArrivalAction = null;
      applyArrivedActionState(actionId);
      return;
    }

    // Stand up first before walking
    posture = 'standing';
    syncAccessoryVisibility();
    currentActionId = actionId;
    currentState = 'WALKING';
    isWalking = true;
    pendingArrivalAction = actionId;
    navQueue = findDevOpsWalkablePath(curPos, destAnchor.position);
    applyExpression('focused');
    applyPropAndIndicator(
      act.handheldProp === 'devops_laptop' || act.handheldProp === 'tablet'
        ? act.handheldProp
        : 'none',
      'none'
    );
    playClip('Walk_Cycle');
    emitStatus();
  };

  const triggerAction = (actionId: DevOpsActionId) => {
    if (actionId === 'WALK_PATROL') {
      autoDemoActive = false;
      patrolActive = true;
      patrolPauseTimer = 0;
      const nextAnchor = DEVOPS_PATROL_ANCHOR_RING[patrolIndex % DEVOPS_PATROL_ANCHOR_RING.length];
      targetAnchorId = nextAnchor;
      const dest = getDevOpsAnchorById(nextAnchor);
      posture = 'standing';
      syncAccessoryVisibility();
      currentActionId = 'WALK_PATROL';
      currentState = 'WALKING';
      isWalking = true;
      pendingArrivalAction = null;
      navQueue = findDevOpsWalkablePath(
        [runtimeRoot.position.x, 0, runtimeRoot.position.z],
        dest.position
      );
      applyExpression('focused');
      applyPropAndIndicator('tablet', 'none');
      playClip('Walk_Cycle');
      emitStatus();
      return;
    }

    patrolActive = false;
    startNavigationToAction(actionId, false);
  };

  const update = (dt: number) => {
    if (isPaused) return;
    const scaledDt = dt * speedMultiplier;
    elapsedClock += scaledDt;

    // Gentle floating bob on active runtime indicator
    if (runtimeIndicator !== 'none') {
      indicatorsRoot.position.y = 1.92 + Math.sin(elapsedClock * 3.5) * 0.03;
      indicatorsRoot.rotation.y = Math.sin(elapsedClock * 1.6) * 0.25;
    }

    if (isWalking && navQueue.length > 0) {
      const targetPt = navQueue[0];
      const dx = targetPt[0] - runtimeRoot.position.x;
      const dz = targetPt[2] - runtimeRoot.position.z;
      const dist = Math.hypot(dx, dz);
      const walkSpeed = 1.85 * speedMultiplier;
      const step = walkSpeed * dt;

      if (dist > 0.01) {
        const desiredYaw = Math.atan2(dx, dz);
        const dYaw = normalizeAngleDiff(desiredYaw, model.characterRoot.rotation.y);
        model.characterRoot.rotation.y += dYaw * Math.min(1, dt * 12 * speedMultiplier);
      }

      if (dist <= step + 0.025) {
        runtimeRoot.position.set(targetPt[0], 0, targetPt[2]);
        navQueue.shift();
        if (navQueue.length === 0) {
          isWalking = false;
          currentAnchorId = targetAnchorId;
          if (patrolActive) {
            const destAnchor = getDevOpsAnchorById(targetAnchorId);
            model.characterRoot.rotation.y = destAnchor.rotationY;
            currentState = 'IDLE';
            playClip('Idle_Breathing');
            patrolPauseTimer = 1.6;
            emitStatus();
          } else if (pendingArrivalAction) {
            const arrivedAct = pendingArrivalAction;
            pendingArrivalAction = null;
            applyArrivedActionState(arrivedAct);
          }
        }
      } else {
        runtimeRoot.position.x += (dx / dist) * step;
        runtimeRoot.position.z += (dz / dist) * step;
      }
    } else if (patrolActive) {
      patrolPauseTimer -= scaledDt;
      if (patrolPauseTimer <= 0) {
        patrolIndex = (patrolIndex + 1) % DEVOPS_PATROL_ANCHOR_RING.length;
        const nextAnchorId = DEVOPS_PATROL_ANCHOR_RING[patrolIndex];
        targetAnchorId = nextAnchorId;
        const dest = getDevOpsAnchorById(nextAnchorId);
        isWalking = true;
        currentState = 'WALKING';
        navQueue = findDevOpsWalkablePath(
          [runtimeRoot.position.x, 0, runtimeRoot.position.z],
          dest.position
        );
        playClip('Walk_Cycle');
        emitStatus();
      }
    } else if (autoDemoActive) {
      autoDemoStepTimer -= scaledDt;
      if (autoDemoStepTimer <= 0) {
        autoDemoStepIndex = (autoDemoStepIndex + 1) % DEVOPS_AUTO_DEMO_SEQUENCE.length;
        const stepSpec = DEVOPS_AUTO_DEMO_SEQUENCE[autoDemoStepIndex];
        autoDemoStepTimer = stepSpec.durationSeconds;
        startNavigationToAction(stepSpec.actionId, true);
      }
    }

    mixer.update(scaledDt);
  };

  // Initialize default idle state
  playClip('Idle_Breathing');
  applyExpression('neutral');
  applyPropAndIndicator('none', 'none');
  syncAccessoryVisibility();
  mixer.update(0.01);

  return {
    runtimeRoot,
    characterRoot: model.characterRoot,
    model,
    clips,
    mixer,
    update,
    triggerAction,
    executePlayback: (cmd) => {
      if (cmd === 'pause') {
        isPaused = true;
      } else if (cmd === 'play' || cmd === 'resume') {
        isPaused = false;
      } else if (cmd === 'stop' || cmd === 'reset_idle') {
        isPaused = false;
        patrolActive = false;
        autoDemoActive = false;
        isWalking = false;
        navQueue = [];
        pendingArrivalAction = null;
        applyArrivedActionState('IDLE');
      } else if (cmd === 'reset_position') {
        isPaused = false;
        patrolActive = false;
        autoDemoActive = false;
        isWalking = false;
        navQueue = [];
        pendingArrivalAction = null;
        const defAnchor = getDevOpsAnchorById(DEVOPS_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR);
        runtimeRoot.position.set(defAnchor.position[0], 0, defAnchor.position[2]);
        model.characterRoot.rotation.y = defAnchor.rotationY;
        applyArrivedActionState('IDLE');
      }
      emitStatus();
    },
    setSpeedMultiplier: (spd) => {
      speedMultiplier = spd;
      emitStatus();
    },
    setPatrolActive: (active) => {
      if (active) {
        triggerAction('WALK_PATROL');
      } else {
        patrolActive = false;
        isWalking = false;
        navQueue = [];
        applyArrivedActionState('IDLE');
      }
    },
    startAutoDemo: () => {
      autoDemoActive = true;
      patrolActive = false;
      isPaused = false;
      autoDemoStepIndex = 0;
      const firstStep = DEVOPS_AUTO_DEMO_SEQUENCE[0];
      autoDemoStepTimer = firstStep.durationSeconds;
      startNavigationToAction(firstStep.actionId, true);
    },
    stopAutoDemo: () => {
      autoDemoActive = false;
      isWalking = false;
      navQueue = [];
      applyArrivedActionState('IDLE');
    },
    setExpression: (expr) => {
      applyExpression(expr);
      emitStatus();
    },
    setHeadphonesVisible: (visible) => {
      headphonesVisible = visible;
      syncAccessoryVisibility();
      emitStatus();
    },
    setGlassesVisible: (visible) => {
      glassesVisible = visible;
      syncAccessoryVisibility();
      emitStatus();
    },
    setBackpackVisible: (visible) => {
      backpackUserVisible = visible;
      syncAccessoryVisibility();
      emitStatus();
    },
    getStatus,
    getActivePathPoints: () => {
      if (!isWalking || navQueue.length === 0) return [];
      return [[runtimeRoot.position.x, 0, runtimeRoot.position.z], ...navQueue];
    },
  };
}
