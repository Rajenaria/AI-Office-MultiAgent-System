/**
 * AI Office — Engineering Agent 02: Backend Developer Character System V1
 * (`backend_developer_agent` / `ai_office.character.backend_developer_agent.v1`)
 *
 * Implements:
 * 1. Canonical 1.725m stylized voxel/blocky Backend Developer character rig (`Backend_Developer_Agent_Root`)
 *    grounded at Y = 0.000 inside `AI_OFFICE_ROOM_ENGINEERING_v1`.
 * 2. 360-degree layered dark chocolate-brown voxel hair (`Hair` group with semantic sub-clusters:
 *    `Hair_Crown_Base`, `Hair_Crown_Layers`, `Hair_Front_Fringe`, `Hair_Left_Temple`, `Hair_Right_Temple`,
 *    `Hair_Side_Layers`, `Hair_Back_Volume`, `Hair_Back_Taper`) using 4 controlled matte dark-brown materials.
 * 3. Thick black rectangular 3D glasses (`Glasses` group) with clear lenses (`depthWrite: false`) and visible eyes.
 * 4. Dark charcoal technical jacket/hoodie over light inner crew tee, white/silver neck headphones (`Headphones`),
 *    dark technical backpack (`Backpack`), dark charcoal trousers, and clean off-white/gray sneakers.
 * 5. Contextual handheld props (`Prop_Backend_Laptop`, `Prop_API_Tablet`, `Prop_Tech_Document`,
 *    `Prop_Smartphone`, `Prop_Coffee_Cup`, `Prop_Arch_Clipboard`) — hidden in rest pose.
 * 6. 17 embedded `THREE.AnimationClip`s + 9 facial expressions + full runtime state machine.
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import {
  BACKEND_ACTION_LIST,
  BACKEND_ACTIONS,
  BACKEND_AUTO_DEMO_SEQUENCE,
  BACKEND_CHARACTER_CONSTANTS,
  BACKEND_EXPRESSION_PRESETS,
  BACKEND_HAIR_MATERIAL_PALETTE,
  BACKEND_PATROL_ANCHOR_RING,
  BACKEND_REQUIRED_ANIMATION_CLIPS,
  type BackendActionId,
  type BackendActionSpec,
  type BackendAgentState,
  type BackendAnimationClipName,
  type BackendAnimationPlaybackCommand,
  type BackendExpressionId,
  type BackendPropId,
  type BackendSimulationRuntimeStatus,
  type BackendSpeedMultiplier,
  findBackendWalkablePath,
  getEngineeringAnchorForBackendOrThrow,
} from '../domain/backendSimulationSpec';
import { ENGINEERING_ANCHORS } from '../domain/engineeringRoomSpec';

export interface BuiltBackendCharacterRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  hairGroup: THREE.Group;
  faceGroup: THREE.Group;
  glassesGroup: THREE.Group;
  headphonesGroup: THREE.Group;
  backpackGroup: THREE.Group;
  armLeft: THREE.Group;
  armRight: THREE.Group;
  legLeft: THREE.Group;
  legRight: THREE.Group;
  propsById: Record<Exclude<BackendPropId, 'none'>, THREE.Group>;
  faceNodes: {
    eyeLeft: THREE.Mesh;
    eyeRight: THREE.Mesh;
    pupilLeft: THREE.Mesh;
    pupilRight: THREE.Mesh;
    browLeft: THREE.Mesh;
    browRight: THREE.Mesh;
    mouth: THREE.Mesh;
  };
  clips: THREE.AnimationClip[];
}

function makeMat(name: string, hex: string, roughness = 0.8, metalness = 0.05): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    roughness,
    metalness,
  });
  mat.name = name;
  return mat;
}

function addVoxelBox(
  parent: THREE.Object3D,
  name: string,
  size: [number, number, number],
  pos: [number, number, number],
  material: THREE.Material,
  rot?: [number, number, number],
): THREE.Mesh {
  const geom = new THREE.BoxGeometry(size[0], size[1], size[2]);
  const mesh = new THREE.Mesh(geom, material);
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
 * Builds the standalone exportable Backend Developer character hierarchy and 17 animation clips.
 * Total height is strictly 1.725m (`Y = 0.000` to `Y = 1.725`):
 * - Hips at Y = 0.720
 * - Torso at Y = 0.000 (relative to Hips)
 * - Head at Y = 0.500 (relative to Torso -> world Y = 1.220)
 * - Top of Hair_Crown_Layers at Y = +0.505 (relative to Head -> world Y = 1.725)
 */
export function buildBackendDeveloperSceneAndClips(): BuiltBackendCharacterRig {
  const root = new THREE.Group();
  root.name = BACKEND_CHARACTER_CONSTANTS.ROOT_NODE_NAME;
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.set(1, 1, 1);

  // Controlled PBR Material Palette
  // 4-Material Dark Chocolate-Brown Voxel Hair Palette
  const matHairBase = makeMat(
    BACKEND_HAIR_MATERIAL_PALETTE[0].id,
    BACKEND_HAIR_MATERIAL_PALETTE[0].hex,
    BACKEND_HAIR_MATERIAL_PALETTE[0].roughness,
    BACKEND_HAIR_MATERIAL_PALETTE[0].metalness,
  );
  const matHairShadow = makeMat(
    BACKEND_HAIR_MATERIAL_PALETTE[1].id,
    BACKEND_HAIR_MATERIAL_PALETTE[1].hex,
    BACKEND_HAIR_MATERIAL_PALETTE[1].roughness,
    BACKEND_HAIR_MATERIAL_PALETTE[1].metalness,
  );
  const matHairMidtone = makeMat(
    BACKEND_HAIR_MATERIAL_PALETTE[2].id,
    BACKEND_HAIR_MATERIAL_PALETTE[2].hex,
    BACKEND_HAIR_MATERIAL_PALETTE[2].roughness,
    BACKEND_HAIR_MATERIAL_PALETTE[2].metalness,
  );
  const matHairHighlight = makeMat(
    BACKEND_HAIR_MATERIAL_PALETTE[3].id,
    BACKEND_HAIR_MATERIAL_PALETTE[3].hex,
    BACKEND_HAIR_MATERIAL_PALETTE[3].roughness,
    BACKEND_HAIR_MATERIAL_PALETTE[3].metalness,
  );

  // Skin & Face Materials
  const matSkin = makeMat('Mat_BE_Skin_Base', '#F1C6A7', 0.76, 0.02);
  const matSkinShadow = makeMat('Mat_BE_Skin_Shadow', '#DFA985', 0.78, 0.02);
  const matSkinCheek = makeMat('Mat_BE_Skin_Cheek', '#E7A38E', 0.76, 0.02);
  const matEyeWhite = makeMat('Mat_BE_Eye_Sclera', '#F8FAFC', 0.35, 0.02);
  const matEyeIris = makeMat('Mat_BE_Eye_DarkBrown', '#231712', 0.25, 0.05);
  const matPupil = makeMat('Mat_BE_Eye_Pupil', '#0B0F17', 0.2, 0.05);
  const matBrow = makeMat('Mat_BE_Eyebrow_DarkBrown', '#241610', 0.8, 0.03);
  const matMouth = makeMat('Mat_BE_Mouth_Warm', '#9F584C', 0.72, 0.02);

  // Thick Black Rectangular Glasses
  const matGlassesFrame = makeMat('Mat_BE_Glasses_BlackFrame', '#12151C', 0.32, 0.18);
  const matGlassesHinge = makeMat('Mat_BE_Glasses_SilverHinge', '#94A3B8', 0.3, 0.65);
  const matGlassesLens = new THREE.MeshStandardMaterial({
    name: 'Mat_BE_Glasses_Lens',
    color: new THREE.Color('#E0F2FE'),
    roughness: 0.15,
    metalness: 0.08,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });

  // Dark Charcoal Technical Jacket/Hoodie + Light Inner Shirt
  const matJacketPrimary = makeMat('Mat_BE_Jacket_Charcoal', '#232730', 0.82, 0.05);
  const matJacketPanel = makeMat('Mat_BE_Jacket_SlatePanel', '#2D333F', 0.80, 0.06);
  const matJacketRib = makeMat('Mat_BE_Jacket_RibDark', '#181B22', 0.86, 0.04);
  const matJacketZipper = makeMat('Mat_BE_Jacket_ZipperMetal', '#64748B', 0.38, 0.55);
  const matInnerShirt = makeMat('Mat_BE_InnerShirt_Light', '#E2E8F0', 0.78, 0.02);
  const matInnerShirtCollar = makeMat('Mat_BE_InnerShirt_Collar', '#F8FAFC', 0.76, 0.02);

  // White/Silver Neck Headphones
  const matHeadphoneShell = makeMat('Mat_BE_Headphone_WhiteShell', '#F1F5F9', 0.42, 0.12);
  const matHeadphoneSilver = makeMat('Mat_BE_Headphone_SilverYoke', '#CBD5E1', 0.34, 0.48);
  const matHeadphonePad = makeMat('Mat_BE_Headphone_DarkPad', '#1E293B', 0.82, 0.05);

  // Dark Technical Backpack
  const matBackpackBody = makeMat('Mat_BE_Backpack_DarkNavy', '#1C222D', 0.82, 0.06);
  const matBackpackPocket = makeMat('Mat_BE_Backpack_Panel', '#262E3D', 0.80, 0.06);
  const matBackpackStrap = makeMat('Mat_BE_Backpack_Strap', '#141821', 0.86, 0.04);
  const matBackpackZip = makeMat('Mat_BE_Backpack_ZipTrim', '#475569', 0.45, 0.38);
  const matBackpackAccent = makeMat('Mat_BE_Backpack_TechTag', '#EA580C', 0.55, 0.12);

  // Dark Charcoal Trousers & Clean Off-White Sneakers
  const matTrousers = makeMat('Mat_BE_Trousers_Charcoal', '#1A1E26', 0.84, 0.04);
  const matTrousersCuff = makeMat('Mat_BE_Trousers_Cuff', '#12151B', 0.86, 0.04);
  const matShoeUpper = makeMat('Mat_BE_Shoe_OffWhite', '#F4F6F9', 0.68, 0.04);
  const matShoeTrim = makeMat('Mat_BE_Shoe_GrayTrim', '#CBD5E1', 0.72, 0.05);
  const matShoeSole = makeMat('Mat_BE_Shoe_DarkOutsole', '#1E293B', 0.88, 0.03);

  // Props Materials
  const matPropMetal = makeMat('Mat_BE_Prop_SpaceGray', '#334155', 0.35, 0.55);
  const matPropDark = makeMat('Mat_BE_Prop_DarkBezel', '#0F172A', 0.4, 0.25);
  const matPropScreenAPI = makeMat('Mat_BE_Prop_TerminalScreen', '#10B981', 0.28, 0.1);
  const matPropScreenCode = makeMat('Mat_BE_Prop_CodeScreen', '#38BDF8', 0.28, 0.1);
  const matPropPaper = makeMat('Mat_BE_Prop_PaperWhite', '#F8FAFC', 0.82, 0.02);
  const matPropClipboard = makeMat('Mat_BE_Prop_BoardSlate', '#475569', 0.68, 0.15);
  const matPropMug = makeMat('Mat_BE_Prop_CeramicMug', '#E2E8F0', 0.38, 0.08);
  const matPropCoffee = makeMat('Mat_BE_Prop_Espresso', '#3B2314', 0.35, 0.05);

  // ============================================================================
  // 1. HIPS & LOWER BODY (`Hips` at Y = 0.720)
  // ============================================================================
  const hips = new THREE.Group();
  hips.name = 'Hips';
  hips.position.set(0, 0.72, 0);
  root.add(hips);

  addVoxelBox(hips, 'Pelvis_Base', [0.38, 0.11, 0.23], [0, -0.02, 0], matTrousers);

  // Left Leg (`Leg_Left` at [-0.10, 0, 0])
  const legLeft = new THREE.Group();
  legLeft.name = 'Leg_Left';
  legLeft.position.set(-0.1, 0, 0);
  hips.add(legLeft);

  addVoxelBox(legLeft, 'Thigh_L', [0.155, 0.30, 0.185], [0, -0.17, 0], matTrousers);
  addVoxelBox(legLeft, 'Shin_L', [0.145, 0.26, 0.175], [0, -0.44, 0], matTrousers);
  addVoxelBox(legLeft, 'TrouserCuff_L', [0.152, 0.05, 0.182], [0, -0.565, 0], matTrousersCuff);

  const shoeLeft = new THREE.Group();
  shoeLeft.name = 'Shoe_Left';
  shoeLeft.position.set(0, -0.60, 0);
  legLeft.add(shoeLeft);
  // Outsole bottom at -0.12 -> world Y = 0.72 - 0.60 - 0.12 = 0.000
  addVoxelBox(shoeLeft, 'Shoe_Outsole_L', [0.162, 0.032, 0.255], [0, -0.104, 0.025], matShoeSole);
  addVoxelBox(shoeLeft, 'Shoe_Midsole_L', [0.158, 0.048, 0.245], [0, -0.064, 0.022], matShoeUpper);
  addVoxelBox(shoeLeft, 'Shoe_ToeCap_L', [0.152, 0.042, 0.095], [0, -0.024, 0.088], matShoeUpper);
  addVoxelBox(shoeLeft, 'Shoe_Collar_L', [0.150, 0.046, 0.150], [0, -0.020, -0.022], matShoeTrim);

  // Right Leg (`Leg_Right` at [0.10, 0, 0])
  const legRight = new THREE.Group();
  legRight.name = 'Leg_Right';
  legRight.position.set(0.1, 0, 0);
  hips.add(legRight);

  addVoxelBox(legRight, 'Thigh_R', [0.155, 0.30, 0.185], [0, -0.17, 0], matTrousers);
  addVoxelBox(legRight, 'Shin_R', [0.145, 0.26, 0.175], [0, -0.44, 0], matTrousers);
  addVoxelBox(legRight, 'TrouserCuff_R', [0.152, 0.05, 0.182], [0, -0.565, 0], matTrousersCuff);

  const shoeRight = new THREE.Group();
  shoeRight.name = 'Shoe_Right';
  shoeRight.position.set(0, -0.60, 0);
  legRight.add(shoeRight);
  addVoxelBox(shoeRight, 'Shoe_Outsole_R', [0.162, 0.032, 0.255], [0, -0.104, 0.025], matShoeSole);
  addVoxelBox(shoeRight, 'Shoe_Midsole_R', [0.158, 0.048, 0.245], [0, -0.064, 0.022], matShoeUpper);
  addVoxelBox(shoeRight, 'Shoe_ToeCap_R', [0.152, 0.042, 0.095], [0, -0.024, 0.088], matShoeUpper);
  addVoxelBox(shoeRight, 'Shoe_Collar_R', [0.150, 0.046, 0.150], [0, -0.020, -0.022], matShoeTrim);

  // ============================================================================
  // 2. TORSO & DARK CHARCOAL TECHNICAL JACKET (`Torso` at [0, 0, 0] on Hips)
  // ============================================================================
  const torso = new THREE.Group();
  torso.name = 'Torso';
  torso.position.set(0, 0, 0);
  hips.add(torso);

  // Core jacket body & ribbed waistband
  addVoxelBox(torso, 'Jacket_WaistRib', [0.395, 0.065, 0.245], [0, 0.045, 0], matJacketRib);
  addVoxelBox(torso, 'Jacket_CoreTorso', [0.40, 0.39, 0.245], [0, 0.27, 0], matJacketPrimary);

  // Side & shoulder slate-charcoal technical panels (layered outside core torso to prevent coplanarity)
  addVoxelBox(torso, 'Jacket_FrontPanel_L', [0.155, 0.37, 0.018], [-0.115, 0.27, 0.131], matJacketPanel);
  addVoxelBox(torso, 'Jacket_FrontPanel_R', [0.155, 0.37, 0.018], [0.115, 0.27, 0.131], matJacketPanel);
  addVoxelBox(torso, 'Jacket_TechPocket_L', [0.115, 0.125, 0.016], [-0.118, 0.145, 0.148], matJacketRib);
  addVoxelBox(torso, 'Jacket_TechPocket_R', [0.115, 0.125, 0.016], [0.118, 0.145, 0.148], matJacketRib);

  // Center zipper track & light inner crew tee visible at upper chest/neckline
  addVoxelBox(torso, 'Jacket_CenterZipper', [0.020, 0.29, 0.016], [0, 0.195, 0.131], matJacketZipper);
  addVoxelBox(torso, 'Inner_CrewTee_Light', [0.125, 0.135, 0.018], [0, 0.40, 0.128], matInnerShirt);
  addVoxelBox(torso, 'Inner_CrewTee_CollarRim', [0.135, 0.028, 0.022], [0, 0.462, 0.131], matInnerShirtCollar);

  // Structured jacket collar / hood fold around neck
  addVoxelBox(torso, 'Jacket_Collar_Left', [0.065, 0.075, 0.18], [-0.115, 0.47, 0.02], matJacketPanel);
  addVoxelBox(torso, 'Jacket_Collar_Right', [0.065, 0.075, 0.18], [0.115, 0.47, 0.02], matJacketPanel);
  addVoxelBox(torso, 'Jacket_HoodFold_Back', [0.28, 0.085, 0.11], [0, 0.465, -0.105], matJacketPanel);
  addVoxelBox(torso, 'Neck_Column', [0.145, 0.085, 0.145], [0, 0.495, 0.0], matSkinShadow);

  // ============================================================================
  // 3. WHITE / SILVER NECK HEADPHONES (`Headphones` group on Torso)
  // ============================================================================
  const headphonesGroup = new THREE.Group();
  headphonesGroup.name = 'Headphones';
  torso.add(headphonesGroup);

  addVoxelBox(headphonesGroup, 'Headphone_NeckBand_Back', [0.25, 0.032, 0.036], [0, 0.482, -0.142], matHeadphoneShell);
  addVoxelBox(headphonesGroup, 'Headphone_NeckBand_L', [0.032, 0.032, 0.22], [-0.132, 0.478, -0.03], matHeadphoneShell);
  addVoxelBox(headphonesGroup, 'Headphone_NeckBand_R', [0.032, 0.032, 0.22], [0.132, 0.478, -0.03], matHeadphoneShell);
  addVoxelBox(headphonesGroup, 'Headphone_Yoke_L', [0.024, 0.028, 0.045], [-0.122, 0.456, 0.095], matHeadphoneSilver);
  addVoxelBox(headphonesGroup, 'Headphone_Yoke_R', [0.024, 0.028, 0.045], [0.122, 0.456, 0.095], matHeadphoneSilver);
  addVoxelBox(
    headphonesGroup,
    'Headphone_Cup_L',
    [0.086, 0.092, 0.044],
    [-0.102, 0.422, 0.148],
    matHeadphoneShell,
    [0.18, 0.15, -0.18],
  );
  addVoxelBox(
    headphonesGroup,
    'Headphone_Pad_L',
    [0.074, 0.080, 0.018],
    [-0.100, 0.418, 0.125],
    matHeadphonePad,
    [0.18, 0.15, -0.18],
  );
  addVoxelBox(
    headphonesGroup,
    'Headphone_Cup_R',
    [0.086, 0.092, 0.044],
    [0.102, 0.422, 0.148],
    matHeadphoneShell,
    [0.18, -0.15, 0.18],
  );
  addVoxelBox(
    headphonesGroup,
    'Headphone_Pad_R',
    [0.074, 0.080, 0.018],
    [0.100, 0.418, 0.125],
    matHeadphonePad,
    [0.18, -0.15, 0.18],
  );

  // ============================================================================
  // 4. DARK TECHNICAL BACKPACK (`Backpack` group on Torso)
  // ============================================================================
  const backpackGroup = new THREE.Group();
  backpackGroup.name = 'Backpack';
  torso.add(backpackGroup);

  addVoxelBox(backpackGroup, 'Backpack_MainBody', [0.31, 0.36, 0.135], [0, 0.255, -0.192], matBackpackBody);
  addVoxelBox(backpackGroup, 'Backpack_UpperFlap', [0.29, 0.11, 0.125], [0, 0.395, -0.196], matBackpackPocket);
  addVoxelBox(backpackGroup, 'Backpack_LowerPocket', [0.26, 0.16, 0.045], [0, 0.185, -0.278], matBackpackPocket);
  addVoxelBox(backpackGroup, 'Backpack_ZipperTrim', [0.265, 0.016, 0.048], [0, 0.272, -0.279], matBackpackZip);
  addVoxelBox(backpackGroup, 'Backpack_TopHandle', [0.09, 0.028, 0.04], [0, 0.455, -0.165], matBackpackStrap);
  addVoxelBox(backpackGroup, 'Backpack_TechBadge', [0.055, 0.022, 0.012], [0.082, 0.225, -0.304], matBackpackAccent);

  // Shoulder straps over jacket shoulders and front chest
  addVoxelBox(backpackGroup, 'Backpack_StrapTop_L', [0.048, 0.028, 0.27], [-0.148, 0.478, -0.01], matBackpackStrap);
  addVoxelBox(backpackGroup, 'Backpack_StrapTop_R', [0.048, 0.028, 0.27], [0.148, 0.478, -0.01], matBackpackStrap);
  addVoxelBox(backpackGroup, 'Backpack_StrapFront_L', [0.044, 0.31, 0.024], [-0.152, 0.31, 0.146], matBackpackStrap);
  addVoxelBox(backpackGroup, 'Backpack_StrapFront_R', [0.044, 0.31, 0.024], [0.152, 0.31, 0.146], matBackpackStrap);
  addVoxelBox(backpackGroup, 'Backpack_StrapBuckle_L', [0.048, 0.026, 0.028], [-0.152, 0.22, 0.149], matBackpackZip);
  addVoxelBox(backpackGroup, 'Backpack_StrapBuckle_R', [0.048, 0.026, 0.028], [0.152, 0.22, 0.149], matBackpackZip);

  // ============================================================================
  // 5. HEAD, FACE, GLASSES & 360-DEGREE LAYERED VOXEL HAIR (`Head` at [0, 0.50, 0])
  // ============================================================================
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.5, 0);
  torso.add(head);

  // Head core voxel block: center at Y = 0.22, height = 0.36 (bottom 0.04, top 0.40)
  // Width = 0.37 (X: -0.185..+0.185), Depth = 0.37 (Z: -0.185..+0.185)
  addVoxelBox(head, 'Head_CoreBlock', [0.37, 0.36, 0.37], [0, 0.22, 0], matSkin);
  addVoxelBox(head, 'Head_JawShadow', [0.35, 0.035, 0.35], [0, 0.032, 0], matSkinShadow);

  // Face Group (`Face`)
  const faceGroup = new THREE.Group();
  faceGroup.name = 'Face';
  head.add(faceGroup);

  // Cubic voxel ears (`Ear_L`, `Ear_R`) with clean separation from side hair
  addVoxelBox(faceGroup, 'Ear_L', [0.038, 0.082, 0.068], [-0.202, 0.205, 0.005], matSkin);
  addVoxelBox(faceGroup, 'Ear_Inner_L', [0.012, 0.046, 0.038], [-0.218, 0.205, 0.005], matSkinShadow);
  addVoxelBox(faceGroup, 'Ear_R', [0.038, 0.082, 0.068], [0.202, 0.205, 0.005], matSkin);
  addVoxelBox(faceGroup, 'Ear_Inner_R', [0.012, 0.046, 0.038], [0.218, 0.205, 0.005], matSkinShadow);

  // Eyes (`Eyes_Group`) — clearly visible behind clear glasses lenses
  const eyesGroup = new THREE.Group();
  eyesGroup.name = 'Eyes_Group';
  faceGroup.add(eyesGroup);

  addVoxelBox(eyesGroup, 'Eye_Sclera_L', [0.064, 0.056, 0.012], [-0.078, 0.222, 0.188], matEyeWhite);
  addVoxelBox(eyesGroup, 'Eye_Sclera_R', [0.064, 0.056, 0.012], [0.078, 0.222, 0.188], matEyeWhite);

  const eyeLeft = addVoxelBox(eyesGroup, 'Eye_Iris_L', [0.042, 0.052, 0.014], [-0.074, 0.222, 0.191], matEyeIris);
  const eyeRight = addVoxelBox(eyesGroup, 'Eye_Iris_R', [0.042, 0.052, 0.014], [0.074, 0.222, 0.191], matEyeIris);

  const pupilLeft = addVoxelBox(eyesGroup, 'Eye_Pupil_L', [0.022, 0.028, 0.016], [-0.073, 0.224, 0.194], matPupil);
  const pupilRight = addVoxelBox(eyesGroup, 'Eye_Pupil_R', [0.022, 0.028, 0.016], [0.073, 0.224, 0.194], matPupil);

  addVoxelBox(eyesGroup, 'Eye_Catchlight_L', [0.010, 0.010, 0.018], [-0.082, 0.236, 0.196], matEyeWhite);
  addVoxelBox(eyesGroup, 'Eye_Catchlight_R', [0.010, 0.010, 0.018], [0.066, 0.236, 0.196], matEyeWhite);

  // Eyebrows (`Brows_Group`)
  const browsGroup = new THREE.Group();
  browsGroup.name = 'Brows_Group';
  faceGroup.add(browsGroup);

  const browLeft = addVoxelBox(browsGroup, 'Brow_L', [0.076, 0.022, 0.018], [-0.078, 0.282, 0.194], matBrow);
  const browRight = addVoxelBox(browsGroup, 'Brow_R', [0.076, 0.022, 0.018], [0.078, 0.282, 0.194], matBrow);

  // Nose, Cheeks & Mouth
  addVoxelBox(faceGroup, 'Nose_Bridge', [0.032, 0.050, 0.026], [0, 0.186, 0.196], matSkinShadow);
  addVoxelBox(faceGroup, 'Cheek_L', [0.044, 0.024, 0.012], [-0.118, 0.166, 0.189], matSkinCheek);
  addVoxelBox(faceGroup, 'Cheek_R', [0.044, 0.024, 0.012], [0.118, 0.166, 0.189], matSkinCheek);

  const mouthGroup = new THREE.Group();
  mouthGroup.name = 'Mouth_Group';
  faceGroup.add(mouthGroup);
  const mouth = addVoxelBox(mouthGroup, 'Mouth_Main', [0.068, 0.020, 0.016], [0, 0.118, 0.191], matMouth);

  // ============================================================================
  // 5B. THICK BLACK RECTANGULAR 3D GLASSES (`Glasses` group on Head)
  // ============================================================================
  const glassesGroup = new THREE.Group();
  glassesGroup.name = 'Glasses';
  head.add(glassesGroup);

  // Left & Right Thick Rectangular Rims (centered around [-0.078, 0.222] and [+0.078, 0.222])
  addVoxelBox(glassesGroup, 'Glasses_TopBar_L', [0.116, 0.020, 0.024], [-0.078, 0.262, 0.208], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_BottomBar_L', [0.116, 0.018, 0.022], [-0.078, 0.182, 0.208], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_OuterRim_L', [0.020, 0.098, 0.024], [-0.130, 0.222, 0.208], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_InnerRim_L', [0.018, 0.098, 0.022], [-0.026, 0.222, 0.208], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_Lens_L', [0.088, 0.064, 0.006], [-0.078, 0.222, 0.206], matGlassesLens);

  addVoxelBox(glassesGroup, 'Glasses_TopBar_R', [0.116, 0.020, 0.024], [0.078, 0.262, 0.208], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_BottomBar_R', [0.116, 0.018, 0.022], [0.078, 0.182, 0.208], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_OuterRim_R', [0.020, 0.098, 0.024], [0.130, 0.222, 0.208], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_InnerRim_R', [0.018, 0.098, 0.022], [0.026, 0.222, 0.208], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_Lens_R', [0.088, 0.064, 0.006], [0.078, 0.222, 0.206], matGlassesLens);

  addVoxelBox(glassesGroup, 'Glasses_Bridge', [0.038, 0.020, 0.022], [0, 0.236, 0.208], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_Endpiece_L', [0.052, 0.022, 0.022], [-0.162, 0.246, 0.206], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_Endpiece_R', [0.052, 0.022, 0.022], [0.162, 0.246, 0.206], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_Hinge_L', [0.010, 0.016, 0.018], [-0.188, 0.246, 0.198], matGlassesHinge);
  addVoxelBox(glassesGroup, 'Glasses_Hinge_R', [0.010, 0.016, 0.018], [0.188, 0.246, 0.198], matGlassesHinge);

  // Temple arms extending back above the ear at Y = 0.246 (ear top is at Y = 0.246)
  addVoxelBox(glassesGroup, 'Glasses_TempleArm_L', [0.016, 0.018, 0.215], [-0.193, 0.246, 0.092], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_TempleTip_L', [0.016, 0.028, 0.036], [-0.193, 0.234, -0.022], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_TempleArm_R', [0.016, 0.018, 0.215], [0.193, 0.246, 0.092], matGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_TempleTip_R', [0.016, 0.028, 0.036], [0.193, 0.234, -0.022], matGlassesFrame);

  // ============================================================================
  // 5C. 360-DEGREE LAYERED DARK CHOCOLATE-BROWN VOXEL HAIR (`Hair` group on Head)
  // ============================================================================
  // Uses 4 controlled matte dark-brown materials (`matHairBase`, `matHairShadow`,
  // `matHairMidtone`, `matHairHighlight`) across 8 semantic sub-groups.
  // Top height reaches Head-local Y = +0.505 -> World Y = 0.720 + 0.500 + 0.505 = 1.725m.
  const hairGroup = new THREE.Group();
  hairGroup.name = 'Hair';
  head.add(hairGroup);

  // 1) Hair_Crown_Base: Structured base cap sitting cleanly atop head block (Y = 0.400..0.448)
  const hairCrownBase = new THREE.Group();
  hairCrownBase.name = 'Hair_Crown_Base';
  hairGroup.add(hairCrownBase);

  addVoxelBox(hairCrownBase, 'CrownBase_LowerPlate', [0.398, 0.044, 0.398], [0, 0.418, -0.004], matHairShadow);
  addVoxelBox(hairCrownBase, 'CrownBase_MainCap', [0.384, 0.038, 0.386], [0, 0.452, -0.002], matHairBase);

  // 2) Hair_Crown_Layers: Stepped multi-lock top hair volume up to Y = +0.505
  const hairCrownLayers = new THREE.Group();
  hairCrownLayers.name = 'Hair_Crown_Layers';
  hairGroup.add(hairCrownLayers);

  addVoxelBox(hairCrownLayers, 'CrownLayer_MidPlate', [0.344, 0.028, 0.342], [0.006, 0.478, 0.005], matHairMidtone);
  addVoxelBox(hairCrownLayers, 'CrownLayer_LeftTuft', [0.118, 0.024, 0.265], [-0.095, 0.493, 0.015], matHairBase);
  addVoxelBox(hairCrownLayers, 'CrownLayer_CenterRidge', [0.128, 0.026, 0.285], [0.012, 0.492, 0.012], matHairHighlight);
  addVoxelBox(hairCrownLayers, 'CrownLayer_RightTuft', [0.108, 0.022, 0.255], [0.112, 0.491, -0.008], matHairMidtone);
  // Highest lock: center Y = 0.497, height = 0.016 -> top Y = 0.505 (World Y = 1.725m)
  addVoxelBox(hairCrownLayers, 'CrownLayer_TopCrest', [0.165, 0.016, 0.195], [-0.018, 0.497, 0.028], matHairHighlight);
  addVoxelBox(hairCrownLayers, 'CrownLayer_RearCrest', [0.220, 0.020, 0.135], [0.008, 0.488, -0.105], matHairMidtone);

  // 3) Hair_Front_Fringe: Layered stepped front fringe framing upper forehead above eyebrows & glasses
  // Front face is at Z = +0.185; eyebrows at Y = 0.282; glasses top bar at Y = 0.262.
  // Fringe descends in stepped voxel locks down to Y = 0.312..0.345 at Z = 0.194..0.214.
  const hairFrontFringe = new THREE.Group();
  hairFrontFringe.name = 'Hair_Front_Fringe';
  hairGroup.add(hairFrontFringe);

  addVoxelBox(hairFrontFringe, 'Fringe_UpperUnderlay', [0.382, 0.052, 0.024], [0, 0.396, 0.196], matHairShadow);
  addVoxelBox(hairFrontFringe, 'Fringe_MainBand', [0.366, 0.048, 0.028], [0.005, 0.368, 0.204], matHairBase);
  // Asymmetric parted front locks (natural side-swept developer fringe)
  addVoxelBox(hairFrontFringe, 'Fringe_Lock_FarLeft', [0.076, 0.068, 0.026], [-0.146, 0.348, 0.202], matHairBase);
  addVoxelBox(hairFrontFringe, 'Fringe_Lock_MidLeft', [0.088, 0.074, 0.030], [-0.068, 0.344, 0.210], matHairMidtone);
  addVoxelBox(hairFrontFringe, 'Fringe_Lock_CenterTip', [0.072, 0.066, 0.028], [0.008, 0.352, 0.212], matHairHighlight);
  addVoxelBox(hairFrontFringe, 'Fringe_Lock_PartGapShadow', [0.038, 0.048, 0.022], [0.058, 0.368, 0.201], matHairShadow);
  addVoxelBox(hairFrontFringe, 'Fringe_Lock_MidRight', [0.078, 0.064, 0.028], [0.104, 0.352, 0.208], matHairMidtone);
  addVoxelBox(hairFrontFringe, 'Fringe_Lock_FarRight', [0.066, 0.070, 0.026], [0.154, 0.346, 0.202], matHairBase);

  // 4) Hair_Left_Temple & 5) Hair_Right_Temple: Sideburn / temple locks framing the glasses hinge
  const hairLeftTemple = new THREE.Group();
  hairLeftTemple.name = 'Hair_Left_Temple';
  hairGroup.add(hairLeftTemple);

  addVoxelBox(hairLeftTemple, 'Temple_Upper_L', [0.028, 0.086, 0.096], [-0.198, 0.362, 0.138], matHairBase);
  addVoxelBox(hairLeftTemple, 'Temple_MidLock_L', [0.024, 0.068, 0.064], [-0.197, 0.302, 0.146], matHairMidtone);
  addVoxelBox(hairLeftTemple, 'Temple_Sideburn_L', [0.020, 0.052, 0.038], [-0.195, 0.222, 0.078], matHairShadow);

  const hairRightTemple = new THREE.Group();
  hairRightTemple.name = 'Hair_Right_Temple';
  hairGroup.add(hairRightTemple);

  addVoxelBox(hairRightTemple, 'Temple_Upper_R', [0.028, 0.086, 0.096], [0.198, 0.362, 0.138], matHairBase);
  addVoxelBox(hairRightTemple, 'Temple_MidLock_R', [0.024, 0.068, 0.064], [0.197, 0.302, 0.146], matHairMidtone);
  addVoxelBox(hairRightTemple, 'Temple_Sideburn_R', [0.020, 0.052, 0.038], [0.195, 0.222, 0.078], matHairShadow);

  // 6) Hair_Side_Layers: Layered side volume above and behind the ears (clean ear & glasses clearance)
  const hairSideLayers = new THREE.Group();
  hairSideLayers.name = 'Hair_Side_Layers';
  hairGroup.add(hairSideLayers);

  // Left side layers (above ear Y > 0.268, and behind ear Z < -0.042)
  addVoxelBox(hairSideLayers, 'Side_UpperBand_L', [0.030, 0.092, 0.320], [-0.200, 0.368, -0.015], matHairBase);
  addVoxelBox(hairSideLayers, 'Side_MidRidge_L', [0.024, 0.068, 0.245], [-0.210, 0.352, -0.020], matHairMidtone);
  addVoxelBox(hairSideLayers, 'Side_HighlightTuft_L', [0.018, 0.045, 0.140], [-0.216, 0.366, 0.015], matHairHighlight);
  addVoxelBox(hairSideLayers, 'Side_AboveEarArch_L', [0.024, 0.048, 0.115], [-0.198, 0.298, 0.008], matHairShadow);
  addVoxelBox(hairSideLayers, 'Side_PostEarMass_L', [0.028, 0.145, 0.135], [-0.198, 0.252, -0.115], matHairBase);
  addVoxelBox(hairSideLayers, 'Side_PostEarLower_L', [0.022, 0.095, 0.105], [-0.194, 0.165, -0.125], matHairShadow);

  // Right side layers
  addVoxelBox(hairSideLayers, 'Side_UpperBand_R', [0.030, 0.092, 0.320], [0.200, 0.368, -0.015], matHairBase);
  addVoxelBox(hairSideLayers, 'Side_MidRidge_R', [0.024, 0.068, 0.245], [0.210, 0.352, -0.020], matHairMidtone);
  addVoxelBox(hairSideLayers, 'Side_HighlightTuft_R', [0.018, 0.045, 0.140], [0.216, 0.366, 0.015], matHairHighlight);
  addVoxelBox(hairSideLayers, 'Side_AboveEarArch_R', [0.024, 0.048, 0.115], [0.198, 0.298, 0.008], matHairShadow);
  addVoxelBox(hairSideLayers, 'Side_PostEarMass_R', [0.028, 0.145, 0.135], [0.198, 0.252, -0.115], matHairBase);
  addVoxelBox(hairSideLayers, 'Side_PostEarLower_R', [0.022, 0.095, 0.105], [0.194, 0.165, -0.125], matHairShadow);

  // 7) Hair_Back_Volume: Multi-tiered rear occipital volume (Z = -0.190..-0.232)
  const hairBackVolume = new THREE.Group();
  hairBackVolume.name = 'Hair_Back_Volume';
  hairGroup.add(hairBackVolume);

  addVoxelBox(hairBackVolume, 'BackVol_UpperBase', [0.386, 0.155, 0.032], [0, 0.345, -0.198], matHairBase);
  addVoxelBox(hairBackVolume, 'BackVol_OccipitalMid', [0.356, 0.135, 0.028], [0, 0.325, -0.214], matHairMidtone);
  addVoxelBox(hairBackVolume, 'BackVol_LeftCluster', [0.115, 0.118, 0.024], [-0.102, 0.312, -0.224], matHairBase);
  addVoxelBox(hairBackVolume, 'BackVol_CenterRidge', [0.125, 0.125, 0.026], [0.004, 0.322, -0.228], matHairHighlight);
  addVoxelBox(hairBackVolume, 'BackVol_RightCluster', [0.115, 0.118, 0.024], [0.106, 0.312, -0.224], matHairMidtone);
  addVoxelBox(hairBackVolume, 'BackVol_LowerShelf', [0.364, 0.095, 0.030], [0, 0.228, -0.202], matHairBase);
  addVoxelBox(hairBackVolume, 'BackVol_LowerTufts', [0.310, 0.075, 0.024], [0, 0.224, -0.216], matHairShadow);

  // 8) Hair_Back_Taper: Stepped nape taper descending cleanly toward the neck (Y = 0.085..0.195)
  const hairBackTaper = new THREE.Group();
  hairBackTaper.name = 'Hair_Back_Taper';
  hairGroup.add(hairBackTaper);

  addVoxelBox(hairBackTaper, 'BackTaper_Step1', [0.328, 0.058, 0.026], [0, 0.162, -0.196], matHairBase);
  addVoxelBox(hairBackTaper, 'BackTaper_Step2', [0.276, 0.048, 0.022], [0, 0.118, -0.192], matHairShadow);
  addVoxelBox(hairBackTaper, 'BackTaper_NapeCenter', [0.195, 0.036, 0.018], [0, 0.082, -0.189], matHairShadow);

  // ============================================================================
  // 6. ARMS, HANDS & CONTEXTUAL ENGINEERING PROPS
  // ============================================================================
  // Left Arm (`Arm_Left` at [-0.245, 0.44, 0])
  const armLeft = new THREE.Group();
  armLeft.name = 'Arm_Left';
  armLeft.position.set(-0.245, 0.44, 0);
  torso.add(armLeft);

  addVoxelBox(armLeft, 'UpperArm_Sleeve_L', [0.115, 0.24, 0.125], [-0.01, -0.10, 0], matJacketPanel);
  addVoxelBox(armLeft, 'Forearm_Sleeve_L', [0.105, 0.20, 0.115], [-0.01, -0.31, 0], matJacketPrimary);
  addVoxelBox(armLeft, 'WristCuff_L', [0.108, 0.042, 0.118], [-0.01, -0.415, 0], matJacketRib);

  const handLeft = new THREE.Group();
  handLeft.name = 'Hand_Left';
  handLeft.position.set(-0.01, -0.47, 0);
  armLeft.add(handLeft);
  addVoxelBox(handLeft, 'Palm_L', [0.086, 0.088, 0.092], [0, 0, 0], matSkin);

  // Right Arm (`Arm_Right` at [0.245, 0.44, 0])
  const armRight = new THREE.Group();
  armRight.name = 'Arm_Right';
  armRight.position.set(0.245, 0.44, 0);
  torso.add(armRight);

  addVoxelBox(armRight, 'UpperArm_Sleeve_R', [0.115, 0.24, 0.125], [0.01, -0.10, 0], matJacketPanel);
  addVoxelBox(armRight, 'Forearm_Sleeve_R', [0.105, 0.20, 0.115], [0.01, -0.31, 0], matJacketPrimary);
  addVoxelBox(armRight, 'WristCuff_R', [0.108, 0.042, 0.118], [0.01, -0.415, 0], matJacketRib);

  const handRight = new THREE.Group();
  handRight.name = 'Hand_Right';
  handRight.position.set(0.01, -0.47, 0);
  armRight.add(handRight);
  addVoxelBox(handRight, 'Palm_R', [0.086, 0.088, 0.092], [0, 0, 0], matSkin);

  // Contextual Handheld Props (All hidden in rest pose so standalone GLB previews show clean hands)
  // 1) Laptop (`Prop_Backend_Laptop` on Hand_Right)
  const propLaptop = new THREE.Group();
  propLaptop.name = 'Prop_Backend_Laptop';
  propLaptop.position.set(-0.08, -0.02, 0.14);
  propLaptop.visible = false;
  handRight.add(propLaptop);
  addVoxelBox(propLaptop, 'Laptop_Base', [0.26, 0.016, 0.18], [0, 0, 0], matPropMetal);
  addVoxelBox(propLaptop, 'Laptop_ScreenLid', [0.26, 0.17, 0.012], [0, 0.085, -0.085], matPropDark, [-0.22, 0, 0]);
  addVoxelBox(propLaptop, 'Laptop_TerminalGlow', [0.23, 0.14, 0.006], [0, 0.085, -0.076], matPropScreenAPI, [-0.22, 0, 0]);

  // 2) API Tablet (`Prop_API_Tablet` on Hand_Right)
  const propTablet = new THREE.Group();
  propTablet.name = 'Prop_API_Tablet';
  propTablet.position.set(-0.04, -0.01, 0.11);
  propTablet.visible = false;
  handRight.add(propTablet);
  addVoxelBox(propTablet, 'Tablet_Body', [0.18, 0.014, 0.24], [0, 0, 0], matPropDark);
  addVoxelBox(propTablet, 'Tablet_Screen', [0.155, 0.006, 0.21], [0, 0.009, 0], matPropScreenCode);

  // 3) Technical Document / RFC (`Prop_Tech_Document` on Hand_Right)
  const propTechDoc = new THREE.Group();
  propTechDoc.name = 'Prop_Tech_Document';
  propTechDoc.position.set(-0.04, 0.0, 0.11);
  propTechDoc.visible = false;
  handRight.add(propTechDoc);
  addVoxelBox(propTechDoc, 'TechDoc_Folder', [0.19, 0.012, 0.25], [0, 0, 0], matPropClipboard);
  addVoxelBox(propTechDoc, 'TechDoc_Pages', [0.175, 0.008, 0.235], [0, 0.008, 0], matPropPaper);
  addVoxelBox(propTechDoc, 'TechDoc_SchemaHeader', [0.13, 0.004, 0.035], [0, 0.013, -0.07], matPropScreenAPI);

  // 4) Architecture Notebook / Clipboard (`Prop_Arch_Clipboard` on Hand_Right)
  const propNotebook = new THREE.Group();
  propNotebook.name = 'Prop_Arch_Clipboard';
  propNotebook.position.set(-0.04, 0.0, 0.10);
  propNotebook.visible = false;
  handRight.add(propNotebook);
  addVoxelBox(propNotebook, 'Notebook_Cover', [0.16, 0.018, 0.22], [0, 0, 0], matJacketPanel);
  addVoxelBox(propNotebook, 'Notebook_Page', [0.145, 0.008, 0.205], [0, 0.011, 0], matPropPaper);

  // 5) Smartphone (`Prop_Smartphone` on Hand_Left)
  const propSmartphone = new THREE.Group();
  propSmartphone.name = 'Prop_Smartphone';
  propSmartphone.position.set(0.02, -0.01, 0.08);
  propSmartphone.visible = false;
  handLeft.add(propSmartphone);
  addVoxelBox(propSmartphone, 'Phone_Chassis', [0.072, 0.012, 0.138], [0, 0, 0], matPropDark);
  addVoxelBox(propSmartphone, 'Phone_Screen', [0.062, 0.005, 0.122], [0, 0.007, 0], matPropScreenAPI);

  // 6) Coffee Cup (`Prop_Coffee_Cup` on Hand_Left)
  const propCoffeeCup = new THREE.Group();
  propCoffeeCup.name = 'Prop_Coffee_Cup';
  propCoffeeCup.position.set(0.03, -0.02, 0.09);
  propCoffeeCup.visible = false;
  handLeft.add(propCoffeeCup);
  addVoxelBox(propCoffeeCup, 'Mug_Cylinder', [0.076, 0.096, 0.076], [0, 0.02, 0], matPropMug);
  addVoxelBox(propCoffeeCup, 'Mug_CoffeeTop', [0.064, 0.010, 0.064], [0, 0.066, 0], matPropCoffee);
  addVoxelBox(propCoffeeCup, 'Mug_Handle', [0.018, 0.056, 0.032], [-0.046, 0.02, 0], matPropMug);

  const propsById: Record<Exclude<BackendPropId, 'none'>, THREE.Group> = {
    laptop: propLaptop,
    tablet: propTablet,
    tech_document: propTechDoc,
    smartphone: propSmartphone,
    coffee_cup: propCoffeeCup,
    notebook: propNotebook,
  };

  const clips = buildBackendAnimationClips();

  return {
    root,
    hips,
    torso,
    head,
    hairGroup,
    faceGroup,
    glassesGroup,
    headphonesGroup,
    backpackGroup,
    armLeft,
    armRight,
    legLeft,
    legRight,
    propsById,
    faceNodes: {
      eyeLeft,
      eyeRight,
      pupilLeft,
      pupilRight,
      browLeft,
      browRight,
      mouth,
    },
    clips,
  };
}

function quatTrack(nodeName: string, times: number[], eulerTriples: Array<[number, number, number]>): THREE.QuaternionKeyframeTrack {
  const values: number[] = [];
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  for (const [rx, ry, rz] of eulerTriples) {
    e.set(rx, ry, rz, 'XYZ');
    q.setFromEuler(e);
    values.push(q.x, q.y, q.z, q.w);
  }
  return new THREE.QuaternionKeyframeTrack(`${nodeName}.quaternion`, times, values);
}

function posTrack(nodeName: string, times: number[], positions: Array<[number, number, number]>): THREE.VectorKeyframeTrack {
  const values: number[] = [];
  for (const [x, y, z] of positions) {
    values.push(x, y, z);
  }
  return new THREE.VectorKeyframeTrack(`${nodeName}.position`, times, values);
}

/**
 * Generates all 17 required `THREE.AnimationClip`s for Backend Developer (`backend_developer_agent.glb`).
 */
export function buildBackendAnimationClips(): THREE.AnimationClip[] {
  const clips: THREE.AnimationClip[] = [];
  const standHipsY = 0.72;
  const seatHipsY = standHipsY + BACKEND_CHARACTER_CONSTANTS.SEATED_HIP_DROP_Y; // 0.545

  // 1. Idle_Breathing
  clips.push(
    new THREE.AnimationClip('Idle_Breathing', 3.2, [
      posTrack('Hips', [0, 1.6, 3.2], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.012, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 1.6, 3.2], [
        [0, 0, 0],
        [-0.025, 0.02, 0],
        [0, 0, 0],
      ]),
      quatTrack('Head', [0, 1.6, 3.2], [
        [0, 0, 0],
        [0.03, -0.04, 0],
        [0, 0, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.6, 3.2], [
        [0.04, 0, 0.04],
        [-0.02, 0, 0.06],
        [0.04, 0, 0.04],
      ]),
      quatTrack('Arm_Right', [0, 1.6, 3.2], [
        [-0.03, 0, -0.04],
        [0.03, 0, -0.06],
        [-0.03, 0, -0.04],
      ]),
      quatTrack('Leg_Left', [0, 1.6, 3.2], [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 1.6, 3.2], [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 2. Walk_Cycle
  clips.push(
    new THREE.AnimationClip('Walk_Cycle', 1.0, [
      posTrack('Hips', [0, 0.25, 0.5, 0.75, 1.0], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.028, 0],
        [0, standHipsY, 0],
        [0, standHipsY + 0.028, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 0.25, 0.5, 0.75, 1.0], [
        [0.04, -0.06, 0],
        [0.05, 0, 0.02],
        [0.04, 0.06, 0],
        [0.05, 0, -0.02],
        [0.04, -0.06, 0],
      ]),
      quatTrack('Head', [0, 0.5, 1.0], [
        [0, 0.04, 0],
        [0, -0.04, 0],
        [0, 0.04, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.25, 0.5, 0.75, 1.0], [
        [0.42, 0, 0.04],
        [0, 0, 0.04],
        [-0.42, 0, 0.04],
        [0, 0, 0.04],
        [0.42, 0, 0.04],
      ]),
      quatTrack('Arm_Right', [0, 0.25, 0.5, 0.75, 1.0], [
        [-0.42, 0, -0.04],
        [0, 0, -0.04],
        [0.42, 0, -0.04],
        [0, 0, -0.04],
        [-0.42, 0, -0.04],
      ]),
      quatTrack('Leg_Left', [0, 0.25, 0.5, 0.75, 1.0], [
        [-0.48, 0, 0],
        [0, 0, 0],
        [0.48, 0, 0],
        [0, 0, 0],
        [-0.48, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 0.25, 0.5, 0.75, 1.0], [
        [0.48, 0, 0],
        [0, 0, 0],
        [-0.48, 0, 0],
        [0, 0, 0],
        [0.48, 0, 0],
      ]),
    ]),
  );

  // 3. Work_Typing (Seated at BE_DESK_WORK)
  clips.push(
    new THREE.AnimationClip('Work_Typing', 1.6, [
      posTrack('Hips', [0, 0.8, 1.6], [
        [0, seatHipsY, 0],
        [0, seatHipsY + 0.005, 0],
        [0, seatHipsY, 0],
      ]),
      quatTrack('Torso', [0, 0.8, 1.6], [
        [0.10, 0, 0],
        [0.12, 0.02, 0],
        [0.10, 0, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.6], [
        [-0.04, -0.05, 0],
        [-0.02, 0.05, 0],
        [-0.04, -0.05, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.4, 0.8, 1.2, 1.6], [
        [-1.08, 0.14, 0.05],
        [-1.16, 0.16, 0.05],
        [-1.06, 0.12, 0.05],
        [-1.18, 0.15, 0.05],
        [-1.08, 0.14, 0.05],
      ]),
      quatTrack('Arm_Right', [0, 0.4, 0.8, 1.2, 1.6], [
        [-1.14, -0.14, -0.05],
        [-1.05, -0.12, -0.05],
        [-1.18, -0.16, -0.05],
        [-1.08, -0.13, -0.05],
        [-1.14, -0.14, -0.05],
      ]),
      quatTrack('Leg_Left', [0, 1.6], [
        [-1.28, 0, 0],
        [-1.28, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 1.6], [
        [-1.28, 0, 0],
        [-1.28, 0, 0],
      ]),
    ]),
  );

  // 4. API_Development (Seated at BE_DESK_WORK checking dual displays + rapid endpoint coding)
  clips.push(
    new THREE.AnimationClip('API_Development', 2.4, [
      posTrack('Hips', [0, 1.2, 2.4], [
        [0, seatHipsY, 0],
        [0, seatHipsY + 0.006, 0],
        [0, seatHipsY, 0],
      ]),
      quatTrack('Torso', [0, 0.8, 1.6, 2.4], [
        [0.11, -0.04, 0],
        [0.13, 0.08, 0],
        [0.10, -0.02, 0],
        [0.11, -0.04, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.6, 2.4], [
        [-0.05, -0.12, 0],
        [-0.02, 0.24, 0.02],
        [-0.06, 0.04, 0],
        [-0.05, -0.12, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.6, 1.2, 1.8, 2.4], [
        [-1.12, 0.16, 0.04],
        [-1.20, 0.14, 0.04],
        [-1.10, 0.18, 0.04],
        [-1.22, 0.15, 0.04],
        [-1.12, 0.16, 0.04],
      ]),
      quatTrack('Arm_Right', [0, 0.6, 1.2, 1.8, 2.4], [
        [-1.18, -0.15, -0.04],
        [-1.08, -0.12, -0.04],
        [-1.28, -0.22, -0.08],
        [-1.12, -0.14, -0.04],
        [-1.18, -0.15, -0.04],
      ]),
      quatTrack('Leg_Left', [0, 2.4], [
        [-1.28, 0, 0],
        [-1.28, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.4], [
        [-1.28, 0, 0],
        [-1.28, 0, 0],
      ]),
    ]),
  );

  // 5. Debug_Backend (Seated analytical forward lean, inspecting stack trace & vertical terminal)
  clips.push(
    new THREE.AnimationClip('Debug_Backend', 2.6, [
      posTrack('Hips', [0, 1.3, 2.6], [
        [0, seatHipsY, 0],
        [0, seatHipsY, 0.02],
        [0, seatHipsY, 0],
      ]),
      quatTrack('Torso', [0, 1.0, 1.8, 2.6], [
        [0.18, 0, 0],
        [0.22, 0.08, 0],
        [0.20, -0.06, 0],
        [0.18, 0, 0],
      ]),
      quatTrack('Head', [0, 1.0, 1.8, 2.6], [
        [-0.12, 0.05, 0],
        [-0.15, 0.22, 0.03],
        [-0.10, -0.12, -0.02],
        [-0.12, 0.05, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.3, 2.6], [
        [-1.10, 0.15, 0.05],
        [-1.16, 0.18, 0.05],
        [-1.10, 0.15, 0.05],
      ]),
      quatTrack('Arm_Right', [0, 1.0, 1.8, 2.6], [
        [-1.42, -0.28, -0.12],
        [-1.48, -0.32, -0.14],
        [-1.16, -0.15, -0.05],
        [-1.42, -0.28, -0.12],
      ]),
      quatTrack('Leg_Left', [0, 2.6], [
        [-1.28, 0, 0],
        [-1.28, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.6], [
        [-1.28, 0, 0],
        [-1.28, 0, 0],
      ]),
    ]),
  );

  // 6. Review_Service_Logs (Seated scanning vertical log monitor on right side + tablet check)
  clips.push(
    new THREE.AnimationClip('Review_Service_Logs', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, seatHipsY, 0],
        [0, seatHipsY + 0.005, 0],
        [0, seatHipsY, 0],
      ]),
      quatTrack('Torso', [0, 1.0, 2.0, 2.8], [
        [0.08, 0.10, 0],
        [0.10, 0.18, 0],
        [0.08, 0.04, 0],
        [0.08, 0.10, 0],
      ]),
      quatTrack('Head', [0, 0.9, 1.9, 2.8], [
        [-0.08, 0.22, 0],
        [0.06, 0.26, 0.02],
        [-0.10, 0.14, 0],
        [-0.08, 0.22, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.4, 2.8], [
        [-1.04, 0.12, 0.04],
        [-1.12, 0.16, 0.04],
        [-1.04, 0.12, 0.04],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-0.96, -0.18, -0.08],
        [-1.08, -0.22, -0.10],
        [-0.96, -0.18, -0.08],
      ]),
      quatTrack('Leg_Left', [0, 2.8], [
        [-1.28, 0, 0],
        [-1.28, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.8], [
        [-1.28, 0, 0],
        [-1.28, 0, 0],
      ]),
    ]),
  );

  // 7. Inspect_API_Contract (Standing at BE_API_BOARD with tablet & pointing gesture)
  clips.push(
    new THREE.AnimationClip('Inspect_API_Contract', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.01, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 1.4, 2.8], [
        [-0.03, -0.06, 0],
        [-0.04, 0.06, 0],
        [-0.03, -0.06, 0],
      ]),
      quatTrack('Head', [0, 1.0, 2.0, 2.8], [
        [-0.10, -0.08, 0],
        [-0.14, 0.10, 0.02],
        [0.08, 0.02, 0],
        [-0.10, -0.08, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.2, 2.0, 2.8], [
        [-0.45, 0.12, 0.06],
        [-1.22, 0.08, 0.10],
        [-0.95, -0.06, 0.08],
        [-0.45, 0.12, 0.06],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-0.88, -0.22, -0.08],
        [-0.96, -0.26, -0.10],
        [-0.88, -0.22, -0.08],
      ]),
      quatTrack('Leg_Left', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 8. Backend_Architecture_Review (Standing at ENG_ARCHITECTURE_BOARD evaluating system topology)
  clips.push(
    new THREE.AnimationClip('Backend_Architecture_Review', 3.0, [
      posTrack('Hips', [0, 1.5, 3.0], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.012, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 1.0, 2.0, 3.0], [
        [-0.04, 0.08, 0],
        [-0.05, -0.10, 0],
        [-0.02, 0.04, 0],
        [-0.04, 0.08, 0],
      ]),
      quatTrack('Head', [0, 1.0, 2.0, 3.0], [
        [-0.12, 0.14, 0],
        [-0.14, -0.16, 0],
        [0.06, 0.02, 0],
        [-0.12, 0.14, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.0, 2.0, 3.0], [
        [-1.15, 0.15, 0.08],
        [-1.32, -0.10, 0.14],
        [-0.65, 0.10, 0.06],
        [-1.15, 0.15, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.5, 3.0], [
        [-0.82, -0.24, -0.08],
        [-0.90, -0.28, -0.10],
        [-0.82, -0.24, -0.08],
      ]),
      quatTrack('Leg_Left', [0, 3.0], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 3.0], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 9. Technical_Discussion (Standing at ENG_DISCUSSION_POSITION with natural hand gestures)
  clips.push(
    new THREE.AnimationClip('Technical_Discussion', 2.6, [
      posTrack('Hips', [0, 1.3, 2.6], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.012, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 0.9, 1.8, 2.6], [
        [0.02, -0.08, 0],
        [0.04, 0.10, 0],
        [0.01, -0.04, 0],
        [0.02, -0.08, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.7, 2.6], [
        [0.04, -0.10, 0],
        [-0.04, 0.12, 0.03],
        [0.05, 0.02, -0.02],
        [0.04, -0.10, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.8, 1.7, 2.6], [
        [-0.68, 0.18, 0.12],
        [-0.98, -0.12, 0.22],
        [-0.54, 0.10, 0.08],
        [-0.68, 0.18, 0.12],
      ]),
      quatTrack('Arm_Right', [0, 1.3, 2.6], [
        [-0.86, -0.20, -0.08],
        [-0.98, -0.14, -0.12],
        [-0.86, -0.20, -0.08],
      ]),
      quatTrack('Leg_Left', [0, 2.6], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.6], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 10. Database_Dependency_Review (Standing at DB_SCHEMA_REVIEW comparing RFC doc & schema board)
  clips.push(
    new THREE.AnimationClip('Database_Dependency_Review', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.01, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 1.4, 2.8], [
        [0.04, -0.05, 0],
        [-0.03, 0.07, 0],
        [0.04, -0.05, 0],
      ]),
      quatTrack('Head', [0, 1.0, 2.0, 2.8], [
        [0.14, -0.06, 0],
        [-0.12, 0.10, 0],
        [0.10, 0.04, 0],
        [0.14, -0.06, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.4, 2.8], [
        [-0.78, 0.22, 0.08],
        [-1.12, 0.08, 0.14],
        [-0.78, 0.22, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-0.92, -0.24, -0.08],
        [-0.98, -0.28, -0.10],
        [-0.92, -0.24, -0.08],
      ]),
      quatTrack('Leg_Left', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 11. Code_Review (Standing at ENG_CODE_REVIEW_POSITION holding laptop & inspecting PR diffs)
  clips.push(
    new THREE.AnimationClip('Code_Review', 2.6, [
      posTrack('Hips', [0, 1.3, 2.6], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.01, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 1.3, 2.6], [
        [0.06, 0, 0],
        [0.08, 0.05, 0],
        [0.06, 0, 0],
      ]),
      quatTrack('Head', [0, 0.9, 1.8, 2.6], [
        [0.16, -0.08, 0],
        [0.12, 0.10, 0.02],
        [0.18, 0.0, 0],
        [0.16, -0.08, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.3, 2.6], [
        [-0.96, 0.24, 0.08],
        [-1.08, 0.18, 0.10],
        [-0.96, 0.24, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.3, 2.6], [
        [-0.98, -0.22, -0.08],
        [-1.02, -0.25, -0.08],
        [-0.98, -0.22, -0.08],
      ]),
      quatTrack('Leg_Left', [0, 2.6], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.6], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 12. Read_Documentation (Standing at ENG_INTEGRATION_TABLE reading technical RFC spec)
  clips.push(
    new THREE.AnimationClip('Read_Documentation', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.008, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 1.4, 2.8], [
        [0.07, -0.03, 0],
        [0.09, 0.03, 0],
        [0.07, -0.03, 0],
      ]),
      quatTrack('Head', [0, 0.9, 1.9, 2.8], [
        [0.18, -0.10, 0],
        [0.20, 0.10, 0],
        [0.15, 0.02, 0],
        [0.18, -0.10, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.4, 2.8], [
        [-0.84, 0.26, 0.08],
        [-0.92, 0.22, 0.08],
        [-0.84, 0.26, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-0.94, -0.24, -0.08],
        [-0.98, -0.26, -0.08],
        [-0.94, -0.24, -0.08],
      ]),
      quatTrack('Leg_Left', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 13. Think_Plan (Analytical hand-to-chin pose with notebook)
  clips.push(
    new THREE.AnimationClip('Think_Plan', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.01, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 1.4, 2.8], [
        [-0.02, -0.05, 0],
        [0.02, 0.05, 0],
        [-0.02, -0.05, 0],
      ]),
      quatTrack('Head', [0, 1.4, 2.8], [
        [-0.08, 0.08, 0.04],
        [-0.04, -0.06, -0.03],
        [-0.08, 0.08, 0.04],
      ]),
      quatTrack('Arm_Left', [0, 1.4, 2.8], [
        [-1.42, 0.34, 0.16],
        [-1.48, 0.38, 0.18],
        [-1.42, 0.34, 0.16],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-0.85, -0.22, -0.08],
        [-0.90, -0.25, -0.08],
        [-0.85, -0.22, -0.08],
      ]),
      quatTrack('Leg_Left', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 14. Present_Architecture (Confident presentation gesture at ENG_ARCHITECTURE_BOARD)
  clips.push(
    new THREE.AnimationClip('Present_Architecture', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.012, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 0.9, 1.9, 2.8], [
        [-0.03, -0.10, 0],
        [-0.04, 0.12, 0],
        [-0.02, -0.02, 0],
        [-0.03, -0.10, 0],
      ]),
      quatTrack('Head', [0, 0.9, 1.9, 2.8], [
        [-0.06, -0.14, 0],
        [-0.08, 0.16, 0.02],
        [0.04, 0.0, 0],
        [-0.06, -0.14, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.9, 1.9, 2.8], [
        [-1.25, -0.20, 0.25],
        [-1.42, 0.10, 0.32],
        [-0.85, -0.10, 0.16],
        [-1.25, -0.20, 0.25],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-0.88, -0.22, -0.08],
        [-0.95, -0.18, -0.10],
        [-0.88, -0.22, -0.08],
      ]),
      quatTrack('Leg_Left', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 15. Coffee_Break (Relaxed standing coffee sip with Left Hand mug)
  clips.push(
    new THREE.AnimationClip('Coffee_Break', 3.0, [
      posTrack('Hips', [0, 1.5, 3.0], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.01, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 1.2, 2.0, 3.0], [
        [0, 0, 0],
        [-0.04, 0.03, 0],
        [-0.04, 0.03, 0],
        [0, 0, 0],
      ]),
      quatTrack('Head', [0, 1.2, 2.0, 3.0], [
        [0, 0, 0],
        [-0.12, 0.04, 0],
        [-0.12, 0.04, 0],
        [0, 0, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.1, 1.9, 3.0], [
        [-0.82, 0.22, 0.08],
        [-1.38, 0.32, 0.14],
        [-1.38, 0.32, 0.14],
        [-0.82, 0.22, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.5, 3.0], [
        [0.06, 0, -0.06],
        [-0.04, 0, -0.08],
        [0.06, 0, -0.06],
      ]),
      quatTrack('Leg_Left', [0, 3.0], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 3.0], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 16. Waiting_Review (Standing checking CI/CD status on smartphone in Left Hand)
  clips.push(
    new THREE.AnimationClip('Waiting_Review', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.008, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 1.4, 2.8], [
        [0.04, 0.03, 0.02],
        [0.05, -0.03, -0.02],
        [0.04, 0.03, 0.02],
      ]),
      quatTrack('Head', [0, 1.4, 2.8], [
        [0.18, 0.08, 0],
        [0.14, -0.04, 0],
        [0.18, 0.08, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.4, 2.8], [
        [-0.98, 0.26, 0.10],
        [-1.04, 0.28, 0.12],
        [-0.98, 0.26, 0.10],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-0.22, 0.10, -0.06],
        [-0.28, 0.14, -0.08],
        [-0.22, 0.10, -0.06],
      ]),
      quatTrack('Leg_Left', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.8], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 17. Task_Completed (Composed celebratory nod and raised right fist/hand)
  clips.push(
    new THREE.AnimationClip('Task_Completed', 2.4, [
      posTrack('Hips', [0, 0.6, 1.2, 2.4], [
        [0, standHipsY, 0],
        [0, standHipsY + 0.024, 0],
        [0, standHipsY + 0.012, 0],
        [0, standHipsY, 0],
      ]),
      quatTrack('Torso', [0, 0.7, 1.5, 2.4], [
        [0, 0, 0],
        [-0.06, -0.06, 0],
        [-0.04, 0.04, 0],
        [0, 0, 0],
      ]),
      quatTrack('Head', [0, 0.6, 1.2, 1.8, 2.4], [
        [0, 0, 0],
        [-0.10, 0, 0],
        [0.08, 0, 0],
        [-0.05, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.8, 1.6, 2.4], [
        [0.04, 0, 0.04],
        [-0.45, 0.12, 0.10],
        [-0.30, 0.08, 0.08],
        [0.04, 0, 0.04],
      ]),
      quatTrack('Arm_Right', [0, 0.7, 1.5, 2.4], [
        [-0.04, 0, -0.04],
        [-2.05, -0.15, -0.22],
        [-1.88, -0.12, -0.18],
        [-0.04, 0, -0.04],
      ]),
      quatTrack('Leg_Left', [0, 2.4], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.4], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  return clips;
}

/**
 * Exports a clean standalone `backend_developer_agent.glb` binary ArrayBuffer
 * with `Backend_Developer_Agent_Root` at `[0, 0, 0]`, rest pose, hidden handheld props,
 * visible glasses/headphones/backpack, and all 17 embedded `THREE.AnimationClip`s.
 */
export async function exportBackendDeveloperToGLBBuffer(): Promise<ArrayBuffer> {
  const built = buildBackendDeveloperSceneAndClips();
  built.root.position.set(0, 0, 0);
  built.root.rotation.set(0, 0, 0);
  built.root.scale.set(1, 1, 1);

  for (const propGroup of Object.values(built.propsById)) {
    propGroup.visible = false;
  }
  built.glassesGroup.visible = true;
  built.headphonesGroup.visible = true;
  built.backpackGroup.visible = true;
  built.root.updateMatrixWorld(true);

  const exportScene = new THREE.Scene();
  exportScene.name = 'Backend_Developer_Agent_Export_Scene';
  exportScene.add(built.root);

  const exporter = new GLTFExporter();
  const glbBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      exportScene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(new Error('Expected binary GLB ArrayBuffer from GLTFExporter for Backend Developer.'));
        }
      },
      (err) => reject(err),
      {
        binary: true,
        animations: built.clips,
        includeCustomExtensions: false,
      },
    );
  });

  return glbBuffer;
}

export interface BackendSimulationHelpersGroup {
  helpersRoot: THREE.Group;
  pathLine: THREE.Line;
  targetRing: THREE.Mesh;
  updatePathVisual: (points: [number, number][], targetPos: [number, number, number], visible: boolean) => void;
}

export function buildBackendSimulationHelpersGroup(): BackendSimulationHelpersGroup {
  const helpersRoot = new THREE.Group();
  helpersRoot.name = 'PREVIEW_ONLY_BACKEND_SIM_HELPERS';

  const lineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(4.45, 0.03, 9.25),
    new THREE.Vector3(2.35, 0.03, 9.45),
  ]);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.85,
  });
  const pathLine = new THREE.Line(lineGeom, lineMat);
  pathLine.name = 'Backend_Nav_Path_Line';
  pathLine.visible = false;
  helpersRoot.add(pathLine);

  const ringGeom = new THREE.RingGeometry(0.18, 0.25, 24);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
  });
  const targetRing = new THREE.Mesh(ringGeom, ringMat);
  targetRing.name = 'Backend_Target_Ring';
  targetRing.position.set(4.45, 0.022, 9.25);
  targetRing.visible = false;
  helpersRoot.add(targetRing);

  const updatePathVisual = (
    points: [number, number][],
    targetPos: [number, number, number],
    visible: boolean,
  ) => {
    if (!visible || points.length === 0) {
      pathLine.visible = false;
      targetRing.visible = false;
      return;
    }
    const vecs = points.map(([x, z]) => new THREE.Vector3(x, 0.032, z));
    if (vecs.length === 1) {
      vecs.unshift(new THREE.Vector3(targetPos[0], 0.032, targetPos[2]));
    }
    pathLine.geometry.dispose();
    pathLine.geometry = new THREE.BufferGeometry().setFromPoints(vecs);
    pathLine.visible = true;
    targetRing.position.set(targetPos[0], 0.022, targetPos[2]);
    targetRing.visible = true;
  };

  return {
    helpersRoot,
    pathLine,
    targetRing,
    updatePathVisual,
  };
}

export interface BackendCharacterRuntimeInstance {
  runtimeRoot: THREE.Group;
  characterRoot: THREE.Group;
  rig: BuiltBackendCharacterRig;
  mixer: THREE.AnimationMixer;
  triggerAction: (actionId: BackendActionId) => void;
  executePlayback: (cmd: BackendAnimationPlaybackCommand) => void;
  setSpeedMultiplier: (speed: BackendSpeedMultiplier) => void;
  setPatrolActive: (enabled: boolean) => void;
  startAutoDemo: () => void;
  stopAutoDemo: () => void;
  setExpression: (exprId: BackendExpressionId) => void;
  setGlassesVisible: (visible: boolean) => void;
  setBackpackVisible: (visible: boolean) => void;
  update: (dt: number) => void;
  getStatus: () => BackendSimulationRuntimeStatus;
  getActivePathPoints: () => [number, number][];
}

function normalizeAngleDiff(target: number, current: number): number {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

/**
 * Creates the interactive Backend Developer runtime controller inside `AI_OFFICE_ROOM_ENGINEERING_v1`.
 * Spawns by default at `BE_WORKSTATION_APPROACH` (`[4.45, 0, 9.25]`) so both Frontend Developer
 * and Backend Developer coexist simultaneously in the 8×16 Engineering Studio without overlap.
 */
export function createBackendDeveloperRuntime(
  onStatusChange?: (status: BackendSimulationRuntimeStatus) => void,
): BackendCharacterRuntimeInstance {
  const rig = buildBackendDeveloperSceneAndClips();

  const runtimeRoot = new THREE.Group();
  runtimeRoot.name = BACKEND_CHARACTER_CONSTANTS.RUNTIME_ROOT_NAME;
  runtimeRoot.add(rig.root);

  const defaultAnchor = getEngineeringAnchorForBackendOrThrow(
    BACKEND_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR,
  );
  runtimeRoot.position.set(
    defaultAnchor.position[0],
    defaultAnchor.position[1],
    defaultAnchor.position[2],
  );
  runtimeRoot.rotation.set(0, defaultAnchor.facingRad, 0);

  const mixer = new THREE.AnimationMixer(rig.root);
  const actionsByName = new Map<BackendAnimationClipName, THREE.AnimationAction>();
  for (const clip of rig.clips) {
    const act = mixer.clipAction(clip);
    actionsByName.set(clip.name as BackendAnimationClipName, act);
  }

  let currentActionSpec: BackendActionSpec = BACKEND_ACTIONS.IDLE;
  let currentState: BackendAgentState = 'IDLE';
  let activeClipName: BackendAnimationClipName = 'Idle_Breathing';
  let currentAnchorId: string = BACKEND_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR;
  let targetAnchorId: string = BACKEND_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR;
  let currentExpression: BackendExpressionId = 'neutral';
  let handheldProp: BackendPropId = 'none';
  let isWalking = false;
  let isPaused = false;
  let patrolActive = false;
  let patrolRingIdx = 0;
  let patrolHoldTimer = 0;
  let autoDemoActive = false;
  let autoDemoStepIdx = 0;
  let autoDemoHoldTimer = 0;
  let speedMultiplier: BackendSpeedMultiplier = 1;
  let glassesVisible = true;
  let userBackpackVisible = true;
  let backpackAutoHiddenForSeat = false;
  let activePath: [number, number][] = [];
  let targetFacingRad = defaultAnchor.facingRad;

  const baseEyeScaleY = 1.0;
  const basePupilLeftPos: [number, number] = [-0.073, 0.224];
  const basePupilRightPos: [number, number] = [0.073, 0.224];
  const baseBrowY = 0.282;
  const baseMouthY = 0.118;

  const applyExpression = (exprId: BackendExpressionId) => {
    currentExpression = exprId;
    const preset = BACKEND_EXPRESSION_PRESETS[exprId] ?? BACKEND_EXPRESSION_PRESETS.neutral;
    rig.faceNodes.eyeLeft.scale.y = baseEyeScaleY * preset.eyeScaleY;
    rig.faceNodes.eyeRight.scale.y = baseEyeScaleY * preset.eyeScaleY;
    rig.faceNodes.pupilLeft.position.x = basePupilLeftPos[0] + preset.pupilOffsetX;
    rig.faceNodes.pupilLeft.position.y = basePupilLeftPos[1] + preset.pupilOffsetY;
    rig.faceNodes.pupilRight.position.x = basePupilRightPos[0] + preset.pupilOffsetX;
    rig.faceNodes.pupilRight.position.y = basePupilRightPos[1] + preset.pupilOffsetY;
    rig.faceNodes.browLeft.position.y = baseBrowY + preset.browLiftY;
    rig.faceNodes.browRight.position.y = baseBrowY + preset.browLiftY;
    rig.faceNodes.browLeft.rotation.z = preset.browTiltRad;
    rig.faceNodes.browRight.rotation.z = -preset.browTiltRad;
    rig.faceNodes.mouth.scale.x = preset.mouthWidthScale;
    rig.faceNodes.mouth.scale.y = preset.mouthOpenScaleY;
    rig.faceNodes.mouth.position.y = baseMouthY + preset.mouthSmileOffsetY;
  };

  const applyPropVisibility = (prop: BackendPropId) => {
    handheldProp = prop;
    for (const [id, group] of Object.entries(rig.propsById)) {
      group.visible = id === prop;
    }
  };

  const syncBackpackSeatVisibility = () => {
    const isSeatedNow = !isWalking && currentActionSpec.posture === 'seated';
    backpackAutoHiddenForSeat = isSeatedNow;
    rig.backpackGroup.visible = userBackpackVisible && !backpackAutoHiddenForSeat;
  };

  const playClip = (clipName: BackendAnimationClipName, loop = true) => {
    const nextAction = actionsByName.get(clipName);
    if (!nextAction) return;

    const prevAction = actionsByName.get(activeClipName);
    if (prevAction && prevAction !== nextAction) {
      prevAction.fadeOut(0.18);
    }

    activeClipName = clipName;
    nextAction.reset();
    nextAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    nextAction.clampWhenFinished = !loop;
    nextAction.fadeIn(0.18);
    nextAction.play();
  };

  const emitStatus = () => {
    if (!onStatusChange) return;
    onStatusChange(getStatus());
  };

  const beginActionExecution = (spec: BackendActionSpec, fromDemoOrPatrol = false) => {
    if (!fromDemoOrPatrol) {
      autoDemoActive = false;
      if (spec.id !== 'WALK_PATROL') {
        patrolActive = false;
      }
    }

    currentActionSpec = spec;
    targetAnchorId = spec.targetAnchorName;

    const anchor =
      ENGINEERING_ANCHORS.find((a) => a.name === spec.targetAnchorName) ?? defaultAnchor;
    const startXZ: [number, number] = [runtimeRoot.position.x, runtimeRoot.position.z];
    const goalXZ: [number, number] = [anchor.position[0], anchor.position[2]];
    const dist = Math.hypot(goalXZ[0] - startXZ[0], goalXZ[1] - startXZ[1]);

    targetFacingRad = anchor.facingRad;

    if (dist > BACKEND_CHARACTER_CONSTANTS.ARRIVAL_THRESHOLD_M) {
      isWalking = true;
      currentState = 'MOVING';
      activePath = findBackendWalkablePath(startXZ, goalXZ);
      applyPropVisibility('none');
      applyExpression('neutral');
      syncBackpackSeatVisibility();
      playClip('Walk_Cycle', true);
    } else {
      isWalking = false;
      activePath = [];
      runtimeRoot.position.set(anchor.position[0], 0, anchor.position[2]);
      runtimeRoot.rotation.y = anchor.facingRad;
      currentAnchorId = anchor.name;
      currentState = spec.agentState;
      applyPropVisibility(spec.prop);
      applyExpression(spec.expression);
      syncBackpackSeatVisibility();
      playClip(spec.clipName, spec.loopAction);
    }

    emitStatus();
  };

  const triggerAction = (actionId: BackendActionId) => {
    if (actionId === 'WALK_PATROL') {
      patrolActive = true;
      autoDemoActive = false;
      patrolRingIdx = 0;
      patrolHoldTimer = 0;
      const firstAnchorName = BACKEND_PATROL_ANCHOR_RING[0];
      beginActionExecution(
        {
          ...BACKEND_ACTIONS.WALK_PATROL,
          targetAnchorName: firstAnchorName,
        },
        true,
      );
      return;
    }

    const spec = BACKEND_ACTIONS[actionId] ?? BACKEND_ACTIONS.IDLE;
    beginActionExecution(spec, false);
  };

  const executePlayback = (cmd: BackendAnimationPlaybackCommand) => {
    if (cmd === 'pause') {
      isPaused = true;
      mixer.timeScale = 0;
    } else if (cmd === 'play' || cmd === 'resume') {
      isPaused = false;
      mixer.timeScale = speedMultiplier;
    } else if (cmd === 'restart') {
      isPaused = false;
      mixer.timeScale = speedMultiplier;
      beginActionExecution(currentActionSpec, autoDemoActive || patrolActive);
    } else if (cmd === 'reset_idle') {
      isPaused = false;
      autoDemoActive = false;
      patrolActive = false;
      activePath = [];
      isWalking = false;
      mixer.timeScale = speedMultiplier;
      const idleAnchor = getEngineeringAnchorForBackendOrThrow(
        BACKEND_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR,
      );
      runtimeRoot.position.set(idleAnchor.position[0], 0, idleAnchor.position[2]);
      runtimeRoot.rotation.set(0, idleAnchor.facingRad, 0);
      currentActionSpec = BACKEND_ACTIONS.IDLE;
      currentState = 'IDLE';
      currentAnchorId = idleAnchor.name;
      targetAnchorId = idleAnchor.name;
      applyPropVisibility('none');
      applyExpression('neutral');
      syncBackpackSeatVisibility();
      playClip('Idle_Breathing', true);
    }
    emitStatus();
  };

  const setSpeedMultiplier = (speed: BackendSpeedMultiplier) => {
    speedMultiplier = speed;
    if (!isPaused) {
      mixer.timeScale = speedMultiplier;
    }
    emitStatus();
  };

  const setPatrolActive = (enabled: boolean) => {
    if (enabled) {
      triggerAction('WALK_PATROL');
    } else {
      patrolActive = false;
      beginActionExecution(BACKEND_ACTIONS.IDLE, false);
    }
  };

  const startAutoDemo = () => {
    autoDemoActive = true;
    patrolActive = false;
    isPaused = false;
    mixer.timeScale = speedMultiplier;
    autoDemoStepIdx = 0;
    autoDemoHoldTimer = 0;
    const step = BACKEND_AUTO_DEMO_SEQUENCE[0];
    beginActionExecution(BACKEND_ACTIONS[step.actionId], true);
  };

  const stopAutoDemo = () => {
    autoDemoActive = false;
    autoDemoHoldTimer = 0;
    beginActionExecution(BACKEND_ACTIONS.IDLE, false);
  };

  const setExpression = (exprId: BackendExpressionId) => {
    applyExpression(exprId);
    emitStatus();
  };

  const setGlassesVisible = (visible: boolean) => {
    glassesVisible = visible;
    rig.glassesGroup.visible = visible;
    emitStatus();
  };

  const setBackpackVisible = (visible: boolean) => {
    userBackpackVisible = visible;
    syncBackpackSeatVisibility();
    emitStatus();
  };

  const update = (dt: number) => {
    const clampedDt = Math.min(dt, 0.1);
    if (!isPaused) {
      mixer.update(clampedDt);
    }
    if (isPaused) return;

    const scaledDt = clampedDt * speedMultiplier;

    if (isWalking && activePath.length > 0) {
      const nextPt = activePath[0];
      const dx = nextPt[0] - runtimeRoot.position.x;
      const dz = nextPt[1] - runtimeRoot.position.z;
      const dist = Math.hypot(dx, dz);
      const stepDist = BACKEND_CHARACTER_CONSTANTS.WALK_SPEED_MPS * scaledDt;

      if (dist > 0.005) {
        const moveHeading = Math.atan2(dx, dz);
        const angleDiff = normalizeAngleDiff(moveHeading, runtimeRoot.rotation.y);
        runtimeRoot.rotation.y +=
          angleDiff * Math.min(1, BACKEND_CHARACTER_CONSTANTS.ROTATION_LERP_RATE * scaledDt);
      }

      if (dist <= Math.max(BACKEND_CHARACTER_CONSTANTS.ARRIVAL_THRESHOLD_M, stepDist)) {
        runtimeRoot.position.x = nextPt[0];
        runtimeRoot.position.z = nextPt[1];
        activePath.shift();

        if (activePath.length === 0) {
          // Arrived at target anchor
          isWalking = false;
          runtimeRoot.rotation.y = targetFacingRad;
          currentAnchorId = targetAnchorId;

          if (patrolActive && currentActionSpec.id === 'WALK_PATROL') {
            currentState = 'IDLE';
            applyPropVisibility('none');
            applyExpression('neutral');
            syncBackpackSeatVisibility();
            playClip('Idle_Breathing', true);
            patrolHoldTimer = 0;
          } else {
            currentState = currentActionSpec.agentState;
            applyPropVisibility(currentActionSpec.prop);
            applyExpression(currentActionSpec.expression);
            syncBackpackSeatVisibility();
            playClip(currentActionSpec.clipName, currentActionSpec.loopAction);
            autoDemoHoldTimer = 0;
          }
          emitStatus();
        }
      } else {
        runtimeRoot.position.x += (dx / dist) * stepDist;
        runtimeRoot.position.z += (dz / dist) * stepDist;
      }
    } else {
      // Smoothly align facing angle at anchor
      const angleDiff = normalizeAngleDiff(targetFacingRad, runtimeRoot.rotation.y);
      if (Math.abs(angleDiff) > 0.005) {
        runtimeRoot.rotation.y +=
          angleDiff * Math.min(1, BACKEND_CHARACTER_CONSTANTS.ROTATION_LERP_RATE * scaledDt);
      }

      if (patrolActive) {
        patrolHoldTimer += scaledDt;
        if (patrolHoldTimer >= 1.6) {
          patrolHoldTimer = 0;
          patrolRingIdx = (patrolRingIdx + 1) % BACKEND_PATROL_ANCHOR_RING.length;
          const nextAnchor = BACKEND_PATROL_ANCHOR_RING[patrolRingIdx];
          beginActionExecution(
            {
              ...BACKEND_ACTIONS.WALK_PATROL,
              targetAnchorName: nextAnchor,
            },
            true,
          );
        }
      } else if (autoDemoActive) {
        const currentStep = BACKEND_AUTO_DEMO_SEQUENCE[autoDemoStepIdx];
        autoDemoHoldTimer += scaledDt;
        if (currentStep && autoDemoHoldTimer >= currentStep.holdDurationSec) {
          autoDemoHoldTimer = 0;
          autoDemoStepIdx = (autoDemoStepIdx + 1) % BACKEND_AUTO_DEMO_SEQUENCE.length;
          const nextStep = BACKEND_AUTO_DEMO_SEQUENCE[autoDemoStepIdx];
          beginActionExecution(BACKEND_ACTIONS[nextStep.actionId], true);
        }
      }
    }
  };

  const getStatus = (): BackendSimulationRuntimeStatus => ({
    characterId: BACKEND_CHARACTER_CONSTANTS.CHARACTER_ID,
    displayName: BACKEND_CHARACTER_CONSTANTS.DISPLAY_NAME,
    currentState,
    currentActionId: currentActionSpec.id,
    currentActionLabel: currentActionSpec.labelId,
    activeClipName,
    currentAnchorId,
    targetAnchorId,
    currentExpression,
    posture: isWalking ? 'standing' : currentActionSpec.posture,
    handheldProp,
    isWalking,
    isPaused,
    patrolActive,
    autoDemoActive,
    autoDemoStepIndex: autoDemoStepIdx,
    autoDemoTotalSteps: BACKEND_AUTO_DEMO_SEQUENCE.length,
    speedMultiplier,
    glassesVisible,
    backpackVisible: userBackpackVisible,
    backpackAutoHiddenForSeat,
    bubbleText: isWalking
      ? `Berjalan menuju ${targetAnchorId}...`
      : currentActionSpec.bubbleText,
    thoughtText: currentActionSpec.thoughtText,
    worldPosition: [
      Number(runtimeRoot.position.x.toFixed(3)),
      Number(runtimeRoot.position.y.toFixed(3)),
      Number(runtimeRoot.position.z.toFixed(3)),
    ],
    facingRad: Number(runtimeRoot.rotation.y.toFixed(3)),
  });

  const getActivePathPoints = (): [number, number][] => {
    if (!isWalking || activePath.length === 0) return [];
    return [[runtimeRoot.position.x, runtimeRoot.position.z], ...activePath];
  };

  // Start in Idle_Breathing at BE_WORKSTATION_APPROACH
  applyExpression('neutral');
  applyPropVisibility('none');
  syncBackpackSeatVisibility();
  playClip('Idle_Breathing', true);

  return {
    runtimeRoot,
    characterRoot: rig.root,
    rig,
    mixer,
    triggerAction,
    executePlayback,
    setSpeedMultiplier,
    setPatrolActive,
    startAutoDemo,
    stopAutoDemo,
    setExpression,
    setGlassesVisible,
    setBackpackVisible,
    update,
    getStatus,
    getActivePathPoints,
  };
}
