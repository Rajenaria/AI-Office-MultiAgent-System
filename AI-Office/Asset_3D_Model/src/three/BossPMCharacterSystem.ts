import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { MODULE_CONSTANTS } from '../domain/modularRoomSpec';
import {
  ActivityAnchor,
  AnchorId,
  AnimationCapabilityMode,
  GLBInspectionReport,
  PMActionId,
  PMAgentStateId,
} from '../domain/pmSimulationSpec';

export const FIXED_PROJECT_CHARACTER_ASSET_URL = '/assets/characters/boss_pm.glb';
export const ORIGINAL_PM_EXPORT_FILENAME = 'AI_OFFICE_ORIGINAL_BOSS_PM_v1.glb';

export interface ArticulatedNodes {
  hips: THREE.Object3D | null;
  torso: THREE.Object3D | null;
  head: THREE.Object3D | null;
  leftArm: THREE.Object3D | null;
  rightArm: THREE.Object3D | null;
  leftLeg: THREE.Object3D | null;
  rightLeg: THREE.Object3D | null;
}

interface RestTransform {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  rotation: THREE.Euler;
}

export interface BossPMRuntimeInstance {
  sourceType: 'original_pm' | 'imported_glb';
  runtimeRoot: THREE.Group; // PM_AGENT_RUNTIME_ROOT (Strictly outside ROOM_PM_ROOT)
  navigationRoot: THREE.Group; // NavigationRoot (World X, Z position)
  orientationRoot: THREE.Group; // OrientationRoot (World Y rotation)
  modelRoot: THREE.Group; // ModelRoot (Normalized scale, foot offset & forward offset)
  interactionAnchor: THREE.Object3D; // Overhead anchor for floating status badge
  selectionRing: THREE.Mesh;
  loadedScene: THREE.Group;
  animations: THREE.AnimationClip[];
  mixer: THREE.AnimationMixer | null;
  clipMap: Map<string, THREE.AnimationClip>;
  activeAction: THREE.AnimationAction | null;
  activeClipName: string;
  articulatedNodes: ArticulatedNodes;
  restTransforms: Map<THREE.Object3D, RestTransform>;
  inspectionReport: GLBInspectionReport;
  scaleMultiplier: number;
  forwardOffsetDeg: number;
  setHighlighted: (highlighted: boolean) => void;
  setScaleMultiplier: (multiplier: number) => void;
  setForwardOffsetDeg: (deg: number) => void;
  transitionToActionPose: (
    actionId: PMActionId,
    isWalking: boolean,
    posture: 'standing' | 'seated' | 'leaning'
  ) => void;
  updateFrame: (
    deltaSeconds: number,
    elapsedTime: number,
    state: PMAgentStateId,
    isWalking: boolean,
    speedMultiplier: number
  ) => void;
  resetPoseToRest: () => void;
}

/**
 * Checks whether an ArrayBuffer begins with the glTF 2.0 binary magic header ("glTF" = 0x46546C67).
 */
export function isValidGlbBinaryBuffer(buffer: ArrayBuffer): boolean {
  if (!buffer || buffer.byteLength < 20) return false;
  const view = new DataView(buffer);
  const magic = view.getUint32(0, true);
  const version = view.getUint32(4, true);
  return magic === 0x46546c67 && version === 2;
}

/**
 * Builds the Original Room-Native Cozy Handcrafted Isometric Voxel Boss PM character:
 * - Compact voxel Boss PM calibrated to 1.72 world units tall, grounded at Y = 0.00
 * - Dark geometric hairstyle (layered crown, swept fringe, back block, sideburns)
 * - Black square sunglasses (matte black frames, tinted lenses, nose bridge, temples)
 * - Black executive suit with tailored lapels, pocket square, and buttons
 * - Crisp white inner shirt & collar
 * - Iconic red necktie (knot + blade)
 * - Simple geometric voxel hands with contextual handheld props (binder, smartphone, coffee cup)
 * - Dark executive trousers + belt & brass buckle
 * - Small dark dress shoes flush with the floor
 * - 11 embedded keyframe AnimationClips + hierarchical pivot rig
 */
export function buildOriginalRoomNativeBossPMSceneAndClips(): {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
} {
  const root = new THREE.Group();
  root.name = 'Original_Boss_PM_Root';

  // Cozy Handcrafted Voxel Matte Materials matching the PM & Strategy Room palette
  const matSuitBlack = new THREE.MeshStandardMaterial({
    name: 'Voxel_Executive_Suit_Black',
    color: 0x1c1e26,
    roughness: 0.82,
    metalness: 0.06,
  });
  const matSuitLapel = new THREE.MeshStandardMaterial({
    name: 'Voxel_Executive_Suit_Lapel',
    color: 0x262934,
    roughness: 0.78,
    metalness: 0.08,
  });
  const matTrousersDark = new THREE.MeshStandardMaterial({
    name: 'Voxel_Trousers_Charcoal',
    color: 0x171920,
    roughness: 0.85,
    metalness: 0.05,
  });
  const matShirtWhite = new THREE.MeshStandardMaterial({
    name: 'Voxel_Inner_Shirt_White',
    color: 0xf5f5f0,
    roughness: 0.76,
    metalness: 0.02,
  });
  const matTieRed = new THREE.MeshStandardMaterial({
    name: 'Voxel_Necktie_Red',
    color: 0xc82828,
    roughness: 0.68,
    metalness: 0.08,
  });
  const matSkinWarm = new THREE.MeshStandardMaterial({
    name: 'Voxel_Skin_Warm',
    color: 0xf0c4a2,
    roughness: 0.78,
    metalness: 0.03,
  });
  const matHairDark = new THREE.MeshStandardMaterial({
    name: 'Voxel_Hair_Dark_Espresso',
    color: 0x1a1715,
    roughness: 0.84,
    metalness: 0.04,
  });
  const matSunglassesFrame = new THREE.MeshStandardMaterial({
    name: 'Voxel_Sunglasses_Frame_Black',
    color: 0x0f1014,
    roughness: 0.45,
    metalness: 0.2,
  });
  const matSunglassesLens = new THREE.MeshStandardMaterial({
    name: 'Voxel_Sunglasses_Lens_Dark',
    color: 0x1e293b,
    roughness: 0.22,
    metalness: 0.55,
  });
  const matShoesDark = new THREE.MeshStandardMaterial({
    name: 'Voxel_Shoes_Dark_Leather',
    color: 0x121318,
    roughness: 0.65,
    metalness: 0.12,
  });
  const matBrassAccent = new THREE.MeshStandardMaterial({
    name: 'Voxel_Belt_Brass_Buckle',
    color: 0xd99252,
    roughness: 0.42,
    metalness: 0.65,
  });
  const matPropCover = new THREE.MeshStandardMaterial({
    name: 'Voxel_Prop_Navy_Binder',
    color: 0x2b4c7e,
    roughness: 0.75,
    metalness: 0.05,
  });
  const matPropCeramic = new THREE.MeshStandardMaterial({
    name: 'Voxel_Prop_Ceramic_Mug',
    color: 0xfaf6ee,
    roughness: 0.5,
    metalness: 0.05,
  });

  const addVoxelBox = (
    parent: THREE.Object3D,
    name: string,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.name = name;
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // 1. Hips Pivot at Y = 0.72
  const hips = new THREE.Group();
  hips.name = 'Hips';
  hips.position.set(0, 0.72, 0);
  root.add(hips);

  addVoxelBox(hips, 'Pelvis_Base', 0.36, 0.14, 0.22, 0, 0, 0, matTrousersDark);
  addVoxelBox(hips, 'Executive_Belt', 0.376, 0.044, 0.236, 0, 0.052, 0, matShoesDark);
  addVoxelBox(hips, 'Belt_Buckle_Brass', 0.075, 0.05, 0.018, 0, 0.052, 0.128, matBrassAccent);

  // 2. Left & Right Legs (Feet sit flush at Y = 0.00)
  const leftLeg = new THREE.Group();
  leftLeg.name = 'LeftLeg';
  leftLeg.position.set(-0.095, -0.02, 0);
  hips.add(leftLeg);
  addVoxelBox(leftLeg, 'Trouser_Leg_L', 0.15, 0.6, 0.16, 0, -0.31, 0, matTrousersDark);
  addVoxelBox(leftLeg, 'Dress_Shoe_L', 0.155, 0.09, 0.22, 0, -0.655, 0.025, matShoesDark);

  const rightLeg = new THREE.Group();
  rightLeg.name = 'RightLeg';
  rightLeg.position.set(0.095, -0.02, 0);
  hips.add(rightLeg);
  addVoxelBox(rightLeg, 'Trouser_Leg_R', 0.15, 0.6, 0.16, 0, -0.31, 0, matTrousersDark);
  addVoxelBox(rightLeg, 'Dress_Shoe_R', 0.155, 0.09, 0.22, 0, -0.655, 0.025, matShoesDark);

  // 3. Torso Pivot (Black Executive Suit, White Inner Shirt, Red Necktie — stepped Z layers prevent Z-fighting)
  const torso = new THREE.Group();
  torso.name = 'Torso';
  torso.position.set(0, 0.06, 0);
  hips.add(torso);

  addVoxelBox(torso, 'Suit_Jacket_Body', 0.4, 0.5, 0.24, 0, 0.25, 0, matSuitBlack);
  addVoxelBox(torso, 'Inner_Shirt_Front', 0.16, 0.34, 0.012, 0, 0.31, 0.126, matShirtWhite);
  addVoxelBox(torso, 'Suit_Lapel_L', 0.065, 0.34, 0.014, -0.088, 0.32, 0.128, matSuitLapel);
  addVoxelBox(torso, 'Suit_Lapel_R', 0.065, 0.34, 0.014, 0.088, 0.32, 0.128, matSuitLapel);
  addVoxelBox(torso, 'Shirt_Collar_L', 0.072, 0.052, 0.016, -0.048, 0.482, 0.144, matShirtWhite);
  addVoxelBox(torso, 'Shirt_Collar_R', 0.072, 0.052, 0.016, 0.048, 0.482, 0.144, matShirtWhite);
  addVoxelBox(torso, 'Red_Necktie_Blade', 0.062, 0.25, 0.014, 0, 0.295, 0.14, matTieRed);
  addVoxelBox(torso, 'Red_Necktie_Knot', 0.054, 0.052, 0.016, 0, 0.448, 0.148, matTieRed);
  addVoxelBox(torso, 'Suit_Pocket_Square', 0.06, 0.025, 0.012, -0.135, 0.365, 0.126, matShirtWhite);
  addVoxelBox(torso, 'Suit_Button_Top', 0.03, 0.03, 0.014, 0, 0.12, 0.127, matBrassAccent);

  // 4. Left & Right Arms + Simple Geometric Voxel Hands + Contextual Props
  const leftArm = new THREE.Group();
  leftArm.name = 'LeftArm';
  leftArm.position.set(-0.265, 0.44, 0);
  torso.add(leftArm);
  addVoxelBox(leftArm, 'Suit_Sleeve_L', 0.13, 0.38, 0.14, 0, -0.17, 0, matSuitBlack);
  addVoxelBox(leftArm, 'Shirt_Cuff_L', 0.115, 0.036, 0.125, 0, -0.378, 0, matShirtWhite);
  addVoxelBox(leftArm, 'Voxel_Hand_L', 0.105, 0.096, 0.115, 0, -0.444, 0, matSkinWarm);

  // Contextual Left-Hand Prop: Open Strategy Binder (shown during READING)
  const binderProp = new THREE.Group();
  binderProp.name = 'Open_Strategy_Binder_Prop';
  binderProp.position.set(0.08, -0.44, 0.14);
  binderProp.visible = false;
  addVoxelBox(binderProp, 'Binder_Cover', 0.24, 0.03, 0.18, 0, 0, 0, matPropCover);
  addVoxelBox(binderProp, 'Binder_Pages', 0.22, 0.024, 0.16, 0, 0.027, 0, matShirtWhite);
  leftArm.add(binderProp);

  const rightArm = new THREE.Group();
  rightArm.name = 'RightArm';
  rightArm.position.set(0.265, 0.44, 0);
  torso.add(rightArm);
  addVoxelBox(rightArm, 'Suit_Sleeve_R', 0.13, 0.38, 0.14, 0, -0.17, 0, matSuitBlack);
  addVoxelBox(rightArm, 'Shirt_Cuff_R', 0.115, 0.036, 0.125, 0, -0.378, 0, matShirtWhite);
  addVoxelBox(rightArm, 'Voxel_Hand_R', 0.105, 0.096, 0.115, 0, -0.444, 0, matSkinWarm);

  // Contextual Right-Hand Prop 1: Executive Smartphone (shown during PHONE_CALL)
  const phoneProp = addVoxelBox(
    rightArm,
    'Executive_Smartphone_Prop',
    0.045,
    0.095,
    0.02,
    -0.03,
    -0.44,
    0.072,
    matSunglassesFrame
  );
  phoneProp.visible = false;

  // Contextual Right-Hand Prop 2: Warm Ceramic Coffee Cup (shown during COFFEE_BREAK)
  const coffeeProp = new THREE.Group();
  coffeeProp.name = 'Warm_Ceramic_Coffee_Cup_Prop';
  coffeeProp.position.set(0, -0.44, 0.095);
  coffeeProp.visible = false;
  addVoxelBox(coffeeProp, 'Coffee_Mug_Body', 0.076, 0.095, 0.076, 0, 0, 0, matPropCeramic);
  addVoxelBox(coffeeProp, 'Coffee_Mug_Sleeve', 0.086, 0.038, 0.086, 0, 0, 0, matBrassAccent);
  rightArm.add(coffeeProp);

  // 5. Head Pivot (Voxel Face, Dark Geometric Hairstyle, Black Square Sunglasses)
  // Carefully separated voxel planes so Ears, Sideburns, and Sunglasses Temples never overlap or Z-fight!
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.51, 0);
  torso.add(head);

  addVoxelBox(head, 'Voxel_Neck', 0.15, 0.04, 0.15, 0, 0.03, 0, matSkinWarm);
  addVoxelBox(head, 'Voxel_Face_Cranium', 0.32, 0.3, 0.3, 0, 0.2, 0, matSkinWarm);
  // Ears sit cleanly outside cranium (X = ±0.160..±0.194) and below sideburns & temples (Y = 0.155..0.229)
  addVoxelBox(head, 'Voxel_Ear_L', 0.034, 0.074, 0.056, -0.177, 0.192, -0.012, matSkinWarm);
  addVoxelBox(head, 'Voxel_Ear_R', 0.034, 0.074, 0.056, 0.177, 0.192, -0.012, matSkinWarm);
  addVoxelBox(head, 'Voxel_Nose_Bridge', 0.044, 0.054, 0.026, 0, 0.185, 0.163, matSkinWarm);

  // Dark Geometric Voxel Hairstyle (tops out at Y = 0.72 + 0.06 + 0.51 + 0.435 = 1.725u)
  addVoxelBox(head, 'Hair_Top_Crown', 0.348, 0.065, 0.328, 0, 0.3825, -0.004, matHairDark);
  addVoxelBox(head, 'Hair_Styled_Crest', 0.24, 0.02, 0.26, 0.035, 0.425, 0.01, matHairDark);
  addVoxelBox(head, 'Hair_Front_Swept_Fringe', 0.336, 0.052, 0.036, 0, 0.324, 0.168, matHairDark);
  addVoxelBox(head, 'Hair_Back_Wall', 0.34, 0.24, 0.038, 0, 0.23, -0.169, matHairDark);
  // Sideburns sit cleanly above the ears and sunglasses temples (Y = 0.246..0.350, X = ±0.160..±0.184)
  addVoxelBox(head, 'Hair_Sideburn_L', 0.024, 0.104, 0.196, -0.172, 0.298, -0.012, matHairDark);
  addVoxelBox(head, 'Hair_Sideburn_R', 0.024, 0.104, 0.196, 0.172, 0.298, -0.012, matHairDark);

  // Black Square Sunglasses (Lenses sit cleanly in front of frames; temples sit in Y = 0.229..0.245 band)
  addVoxelBox(
    head,
    'Sunglasses_Frame_L',
    0.124,
    0.078,
    0.02,
    -0.078,
    0.225,
    0.16,
    matSunglassesFrame
  );
  addVoxelBox(
    head,
    'Sunglasses_Lens_L',
    0.098,
    0.052,
    0.008,
    -0.078,
    0.225,
    0.174,
    matSunglassesLens
  );
  addVoxelBox(
    head,
    'Sunglasses_Frame_R',
    0.124,
    0.078,
    0.02,
    0.078,
    0.225,
    0.16,
    matSunglassesFrame
  );
  addVoxelBox(
    head,
    'Sunglasses_Lens_R',
    0.098,
    0.052,
    0.008,
    0.078,
    0.225,
    0.174,
    matSunglassesLens
  );
  addVoxelBox(head, 'Sunglasses_Bridge', 0.032, 0.022, 0.018, 0, 0.235, 0.161, matSunglassesFrame);
  addVoxelBox(
    head,
    'Sunglasses_Temple_L',
    0.018,
    0.016,
    0.172,
    -0.169,
    0.237,
    0.074,
    matSunglassesFrame
  );
  addVoxelBox(
    head,
    'Sunglasses_Temple_R',
    0.018,
    0.016,
    0.172,
    0.169,
    0.237,
    0.074,
    matSunglassesFrame
  );

  // Author 11 Embedded AnimationClips so the character also exports with full glTF animations
  const qFromEuler = (rx: number, ry: number, rz: number): number[] => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'XYZ'));
    return [q.x, q.y, q.z, q.w];
  };

  const makeQuatTrack = (nodeName: string, times: number[], eulers: Array<[number, number, number]>) =>
    new THREE.QuaternionKeyframeTrack(
      `${nodeName}.quaternion`,
      times,
      eulers.flatMap(([x, y, z]) => qFromEuler(x, y, z))
    );

  const makePosTrack = (nodeName: string, times: number[], positions: Array<[number, number, number]>) =>
    new THREE.VectorKeyframeTrack(`${nodeName}.position`, times, positions.flat());

  const animations: THREE.AnimationClip[] = [
    new THREE.AnimationClip('Idle_Breathing', 2.4, [
      makeQuatTrack('Head', [0, 1.2, 2.4], [
        [0, -0.05, 0],
        [0.025, 0.05, 0],
        [0, -0.05, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.2, 2.4], [
        [0.02, 0, 0],
        [-0.02, 0, 0],
        [0.02, 0, 0],
      ]),
      makeQuatTrack('RightArm', [0, 1.2, 2.4], [
        [-0.02, 0, 0],
        [0.02, 0, 0],
        [-0.02, 0, 0],
      ]),
    ]),
    new THREE.AnimationClip('Walk_Cycle', 0.96, [
      makePosTrack('Hips', [0, 0.24, 0.48, 0.72, 0.96], [
        [0, 0.72, 0],
        [0, 0.745, 0],
        [0, 0.72, 0],
        [0, 0.745, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('LeftLeg', [0, 0.24, 0.48, 0.72, 0.96], [
        [0, 0, 0],
        [0.44, 0, 0],
        [0, 0, 0],
        [-0.44, 0, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('RightLeg', [0, 0.24, 0.48, 0.72, 0.96], [
        [0, 0, 0],
        [-0.44, 0, 0],
        [0, 0, 0],
        [0.44, 0, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 0.24, 0.48, 0.72, 0.96], [
        [0, 0, 0],
        [-0.34, 0, 0],
        [0, 0, 0],
        [0.34, 0, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('RightArm', [0, 0.24, 0.48, 0.72, 0.96], [
        [0, 0, 0],
        [0.34, 0, 0],
        [0, 0, 0],
        [-0.34, 0, 0],
        [0, 0, 0],
      ]),
    ]),
    new THREE.AnimationClip('Work_Typing', 1.2, [
      makePosTrack('Hips', [0, 1.2], [
        [0, 0.56, 0],
        [0, 0.56, 0],
      ]),
      makeQuatTrack('LeftLeg', [0, 1.2], [
        [-1.08, 0, 0],
        [-1.08, 0, 0],
      ]),
      makeQuatTrack('RightLeg', [0, 1.2], [
        [-1.08, 0, 0],
        [-1.08, 0, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 0.3, 0.6, 0.9, 1.2], [
        [-0.95, 0.12, 0],
        [-1.02, 0.14, 0],
        [-0.92, 0.1, 0],
        [-1.0, 0.14, 0],
        [-0.95, 0.12, 0],
      ]),
      makeQuatTrack('RightArm', [0, 0.3, 0.6, 0.9, 1.2], [
        [-1.0, -0.12, 0],
        [-0.92, -0.1, 0],
        [-1.02, -0.14, 0],
        [-0.94, -0.12, 0],
        [-1.0, -0.12, 0],
      ]),
      makeQuatTrack('Head', [0, 0.6, 1.2], [
        [0.06, -0.06, 0],
        [0.06, 0.06, 0],
        [0.06, -0.06, 0],
      ]),
    ]),
    new THREE.AnimationClip('Meeting_Briefing', 2.0, [
      makeQuatTrack('RightArm', [0, 0.5, 1.0, 1.5, 2.0], [
        [-0.65, -0.15, 0],
        [-0.85, -0.22, 0],
        [-0.55, -0.1, 0],
        [-0.8, -0.2, 0],
        [-0.65, -0.15, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.0, 2.0], [
        [-0.4, 0.15, 0],
        [-0.58, 0.2, 0],
        [-0.4, 0.15, 0],
      ]),
      makeQuatTrack('Head', [0, 0.7, 1.4, 2.0], [
        [0, -0.12, 0],
        [0.04, 0.12, 0],
        [-0.03, -0.08, 0],
        [0, -0.12, 0],
      ]),
    ]),
    new THREE.AnimationClip('Present_Board', 2.0, [
      makeQuatTrack('RightArm', [0, 0.6, 1.3, 2.0], [
        [-1.38, 0.1, 0],
        [-1.55, -0.12, 0],
        [-1.3, 0.16, 0],
        [-1.38, 0.1, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.0, 2.0], [
        [-0.25, 0.1, 0],
        [-0.35, 0.15, 0],
        [-0.25, 0.1, 0],
      ]),
      makeQuatTrack('Head', [0, 1.0, 2.0], [
        [-0.08, -0.08, 0],
        [-0.12, 0.08, 0],
        [-0.08, -0.08, 0],
      ]),
    ]),
    new THREE.AnimationClip('Read_Document', 2.0, [
      makeQuatTrack('LeftArm', [0, 1.0, 2.0], [
        [-0.85, 0.25, 0],
        [-0.88, 0.25, 0],
        [-0.85, 0.25, 0],
      ]),
      makeQuatTrack('RightArm', [0, 1.0, 2.0], [
        [-0.82, -0.25, 0],
        [-0.9, -0.22, 0],
        [-0.82, -0.25, 0],
      ]),
      makeQuatTrack('Head', [0, 1.0, 2.0], [
        [0.22, -0.06, 0],
        [0.24, 0.06, 0],
        [0.22, -0.06, 0],
      ]),
    ]),
    new THREE.AnimationClip('Think_Plan', 2.2, [
      makeQuatTrack('RightArm', [0, 1.1, 2.2], [
        [-1.35, -0.3, 0],
        [-1.4, -0.32, 0],
        [-1.35, -0.3, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.1, 2.2], [
        [-0.65, 0.4, 0],
        [-0.65, 0.4, 0],
        [-0.65, 0.4, 0],
      ]),
      makeQuatTrack('Head', [0, 1.1, 2.2], [
        [-0.06, -0.06, 0.07],
        [-0.04, 0.06, 0.07],
        [-0.06, -0.06, 0.07],
      ]),
    ]),
    new THREE.AnimationClip('Phone_Call', 2.0, [
      makeQuatTrack('RightArm', [0, 1.0, 2.0], [
        [-1.75, -0.3, 0],
        [-1.78, -0.3, 0],
        [-1.75, -0.3, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.0, 2.0], [
        [-0.3, 0.1, 0],
        [-0.45, 0.14, 0],
        [-0.3, 0.1, 0],
      ]),
      makeQuatTrack('Head', [0, 1.0, 2.0], [
        [0.02, -0.04, -0.06],
        [-0.02, 0.04, -0.06],
        [0.02, -0.04, -0.06],
      ]),
    ]),
    new THREE.AnimationClip('Coffee_Break', 2.6, [
      makeQuatTrack('RightArm', [0, 0.9, 1.6, 2.6], [
        [-0.78, -0.22, 0],
        [-1.42, -0.25, 0],
        [-1.42, -0.25, 0],
        [-0.78, -0.22, 0],
      ]),
      makeQuatTrack('Head', [0, 0.9, 1.6, 2.6], [
        [0, 0, 0],
        [-0.14, 0, 0],
        [-0.14, 0, 0],
        [0, 0, 0],
      ]),
    ]),
    new THREE.AnimationClip('Waiting_Approval', 2.0, [
      makeQuatTrack('LeftArm', [0, 1.0, 2.0], [
        [-0.55, 0.35, 0],
        [-0.58, 0.35, 0],
        [-0.55, 0.35, 0],
      ]),
      makeQuatTrack('RightArm', [0, 1.0, 2.0], [
        [-0.55, -0.35, 0],
        [-0.58, -0.35, 0],
        [-0.55, -0.35, 0],
      ]),
      makeQuatTrack('Head', [0, 1.0, 2.0], [
        [0.03, -0.06, 0],
        [-0.02, 0.06, 0],
        [0.03, -0.06, 0],
      ]),
    ]),
    new THREE.AnimationClip('Task_Completed', 1.4, [
      makeQuatTrack('LeftArm', [0, 0.35, 0.7, 1.05, 1.4], [
        [-1.95, 0, 0.15],
        [-2.15, 0, 0.22],
        [-1.85, 0, 0.1],
        [-2.15, 0, 0.22],
        [-1.95, 0, 0.15],
      ]),
      makeQuatTrack('RightArm', [0, 0.35, 0.7, 1.05, 1.4], [
        [-1.95, 0, -0.15],
        [-2.15, 0, -0.22],
        [-1.85, 0, -0.1],
        [-2.15, 0, -0.22],
        [-1.95, 0, -0.15],
      ]),
      makeQuatTrack('Head', [0, 0.7, 1.4], [
        [-0.08, 0, 0],
        [0.06, 0, 0],
        [-0.08, 0, 0],
      ]),
    ]),
  ];

  return { scene: root, animations };
}

/**
 * Inspects a loaded or room-native character model to fulfill the Diagnostics & Simulation Compatibility spec:
 * - Asset source & filename
 * - Mesh count & mesh names
 * - Material count & material names
 * - Character raw & calibrated bounding box
 * - Detected animations (names, durations, tracks)
 * - Skeleton / bone availability & hierarchical limb pivots
 * - Model scale and orientation
 */
export function inspectLoadedCharacterGLB(
  gltf: { scene: THREE.Group; animations: THREE.AnimationClip[] },
  assetSource: 'original_room_native' | 'project_asset' | 'runtime_upload',
  assetPathOrName: string,
  fileSizeBytes: number
): {
  report: GLBInspectionReport;
  articulatedNodes: ArticulatedNodes;
} {
  const root = gltf.scene;
  root.updateMatrixWorld(true);

  const hierarchyTree: string[] = [];
  const meshNames: string[] = [];
  const materialNameSet = new Set<string>();
  const boneNames: string[] = [];
  let skinnedMeshCount = 0;

  const walkTree = (obj: THREE.Object3D, depth: number) => {
    const indent = '  '.repeat(Math.min(depth, 6));
    const typeTag = (obj as THREE.SkinnedMesh).isSkinnedMesh
      ? 'SkinnedMesh'
      : (obj as THREE.Mesh).isMesh
      ? 'Mesh'
      : (obj as THREE.Bone).isBone
      ? 'Bone'
      : 'Node';
    hierarchyTree.push(`${indent}${obj.name || '(unnamed)'} [${typeTag}]`);

    if ((obj as THREE.Bone).isBone) {
      boneNames.push(obj.name || 'Bone');
    }
    if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
      skinnedMeshCount++;
    }
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh;
      meshNames.push(m.name || `Mesh_${meshNames.length + 1}`);
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      mats.forEach((mat) => {
        if (mat) materialNameSet.add(mat.name || mat.type);
      });
    }
    for (const child of obj.children) {
      walkTree(child, depth + 1);
    }
  };
  walkTree(root, 0);

  // Measure raw bounding box
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const isEmptyBox = box.isEmpty();
  const rawHeight = isEmptyBox ? 1.72 : Math.max(0.001, size.y);
  const targetHeight = MODULE_CONSTANTS.CHARACTER_REFERENCE_HEIGHT; // 1.72 world units
  const appliedScaleFactor = Number((targetHeight / rawHeight).toFixed(4));
  const footOffsetY = isEmptyBox ? 0 : Number((-box.min.y * appliedScaleFactor).toFixed(4));

  // Locate articulated limb/body nodes or bones
  const findByPattern = (patterns: RegExp[]): THREE.Object3D | null => {
    let found: THREE.Object3D | null = null;
    root.traverse((obj) => {
      if (found || obj === root) return;
      const n = (obj.name || '').trim();
      if (!n) return;
      if (patterns.some((p) => p.test(n))) {
        found = obj;
      }
    });
    return found;
  };

  const articulatedNodes: ArticulatedNodes = {
    hips: findByPattern([/^hips$/i, /pelvis/i, /root_hips/i, /mixamorig.*hips/i, /waist/i]),
    torso: findByPattern([
      /^torso$/i,
      /spine/i,
      /chest/i,
      /upper_body/i,
      /body_upper/i,
      /jacket/i,
      /mixamorig.*spine/i,
    ]),
    head: findByPattern([/^head$/i, /^neck$/i, /head_group/i, /cranium/i, /mixamorig.*head/i]),
    leftArm: findByPattern([
      /^leftarm$/i,
      /arm_l/i,
      /left_arm/i,
      /l_arm/i,
      /arm\.l/i,
      /upperarm_l/i,
      /shoulder_l/i,
      /leftshoulder/i,
      /mixamorig.*leftarm/i,
    ]),
    rightArm: findByPattern([
      /^rightarm$/i,
      /arm_r/i,
      /right_arm/i,
      /r_arm/i,
      /arm\.r/i,
      /upperarm_r/i,
      /shoulder_r/i,
      /rightshoulder/i,
      /mixamorig.*rightarm/i,
    ]),
    leftLeg: findByPattern([
      /^leftleg$/i,
      /leg_l/i,
      /left_leg/i,
      /l_leg/i,
      /leg\.l/i,
      /thigh_l/i,
      /upperleg_l/i,
      /leftupleg/i,
      /mixamorig.*leftupleg/i,
    ]),
    rightLeg: findByPattern([
      /^rightleg$/i,
      /leg_r/i,
      /right_leg/i,
      /r_leg/i,
      /leg\.r/i,
      /thigh_r/i,
      /upperleg_r/i,
      /rightupleg/i,
      /mixamorig.*rightupleg/i,
    ]),
  };

  const detectedPartCount = [
    articulatedNodes.head,
    articulatedNodes.torso,
    articulatedNodes.leftArm,
    articulatedNodes.rightArm,
    articulatedNodes.leftLeg,
    articulatedNodes.rightLeg,
  ].filter(Boolean).length;

  const hasArticulatedParts = detectedPartCount >= 2;

  const animationClips = (gltf.animations || []).map((clip, idx) => ({
    name: clip.name || `Clip_${idx + 1}`,
    duration: Number(clip.duration.toFixed(2)),
    trackCount: clip.tracks.length,
  }));

  let capabilityMode: AnimationCapabilityMode;
  let capabilitySummary: string;
  const disclosures: string[] = [];

  if (assetSource === 'original_room_native') {
    capabilityMode = 'CASE_A_EMBEDDED_CLIPS';
    capabilitySummary =
      'Room-Native Voxel Boss PM — Full 11-activity articulated voxel rig + embedded keyframe AnimationClips.';
    disclosures.push(
      'Matched to PM & Strategy Room cozy handcrafted voxel art direction (dark geometric hair, black square sunglasses, black suit, white shirt, red necktie).'
    );
    disclosures.push(
      `Includes ${animationClips.length} embedded AnimationClips and articulated Hips/Torso/Head/Arm/Leg pivots.`
    );
  } else if (animationClips.length > 0) {
    capabilityMode = 'CASE_A_EMBEDDED_CLIPS';
    capabilitySummary = `Case A — Imported GLB contains ${animationClips.length} embedded AnimationClip(s) driven by THREE.AnimationMixer with crossfading.`;
    disclosures.push(
      `Detected ${animationClips.length} embedded animation clip(s): ${animationClips
        .map((c) => `${c.name} (${c.duration}s)`)
        .join(', ')}.`
    );
    if (hasArticulatedParts) {
      disclosures.push(
        'Articulated hierarchy nodes also available to supplement unmapped demo actions.'
      );
    }
  } else if (hasArticulatedParts) {
    capabilityMode = 'CASE_B_ARTICULATED_PARTS';
    capabilitySummary = `Case B — Imported GLB has ${detectedPartCount} separate articulated body/limb transform nodes; using safe procedural pivot animation while preserving original geometry and rest pose.`;
    disclosures.push(
      'No embedded AnimationClips found in GLB; driving existing limb/head pivots procedurally.'
    );
  } else {
    capabilityMode = 'CASE_C_RIGID_TRANSFORM';
    capabilitySummary =
      'Case C — Imported GLB has no embedded clips or separate limb pivots; using honest whole-character waypoint translation, orientation, and non-deforming motion.';
    disclosures.push(
      'Model geometry is preserved 100% intact. Detailed limb articulation (typing hands, pointing arm) requires a rigged or multi-part GLB; activities use whole-character navigation and orientation.'
    );
  }

  const report: GLBInspectionReport = {
    assetSource,
    assetPathOrName,
    loadedAt: new Date().toISOString(),
    fileSizeBytes,
    rootNodeName: root.name || 'Scene',
    hierarchyTree,
    meshNames,
    meshCount: meshNames.length,
    materialNames: Array.from(materialNameSet),
    materialCount: materialNameSet.size,
    rawBounds: {
      min: isEmptyBox
        ? [0, 0, 0]
        : [Number(box.min.x.toFixed(3)), Number(box.min.y.toFixed(3)), Number(box.min.z.toFixed(3))],
      max: isEmptyBox
        ? [0, 0, 0]
        : [Number(box.max.x.toFixed(3)), Number(box.max.y.toFixed(3)), Number(box.max.z.toFixed(3))],
      size: isEmptyBox
        ? [0, 0, 0]
        : [Number(size.x.toFixed(3)), Number(size.y.toFixed(3)), Number(size.z.toFixed(3))],
    },
    rawHeight: Number(rawHeight.toFixed(3)),
    normalizedHeight: targetHeight,
    appliedScaleFactor,
    footOffsetY,
    localForwardDirection: [0, 0, 1],
    hasSkeleton: boneNames.length > 0 || skinnedMeshCount > 0,
    boneCount: boneNames.length,
    boneNames,
    skinnedMeshCount,
    animationClips,
    articulatedPartsFound: {
      head: articulatedNodes.head?.name ?? null,
      torso: articulatedNodes.torso?.name ?? null,
      leftArm: articulatedNodes.leftArm?.name ?? null,
      rightArm: articulatedNodes.rightArm?.name ?? null,
      leftLeg: articulatedNodes.leftLeg?.name ?? null,
      rightLeg: articulatedNodes.rightLeg?.name ?? null,
    },
    capabilityMode,
    capabilitySummary,
    disclosures,
  };

  return { report, articulatedNodes };
}

/**
 * Wraps a character scene (either the Original Room-Native Boss PM or an Imported GLTF) into
 * the non-destructive runtime hierarchy:
 * PM_AGENT_RUNTIME_ROOT -> NavigationRoot -> OrientationRoot -> ModelRoot
 */
export function createBossPMRuntimeFromGLTF(
  gltf: { scene: THREE.Group; animations: THREE.AnimationClip[] },
  assetSource: 'original_room_native' | 'project_asset' | 'runtime_upload',
  assetPathOrName: string,
  fileSizeBytes: number
): BossPMRuntimeInstance {
  const { report, articulatedNodes } = inspectLoadedCharacterGLB(
    gltf,
    assetSource,
    assetPathOrName,
    fileSizeBytes
  );

  const runtimeRoot = new THREE.Group();
  runtimeRoot.name = 'PM_AGENT_RUNTIME_ROOT';
  runtimeRoot.userData.isPreviewOnly = true;

  const navigationRoot = new THREE.Group();
  navigationRoot.name = 'NavigationRoot';
  runtimeRoot.add(navigationRoot);

  const orientationRoot = new THREE.Group();
  orientationRoot.name = 'OrientationRoot';
  navigationRoot.add(orientationRoot);

  const modelRoot = new THREE.Group();
  modelRoot.name = 'ModelRoot';
  modelRoot.scale.setScalar(report.appliedScaleFactor);
  modelRoot.position.set(0, report.footOffsetY, 0);
  orientationRoot.add(modelRoot);

  const loadedScene = gltf.scene;
  loadedScene.traverse((obj) => {
    obj.userData.isBossPMCharacter = true;
    if ((obj as THREE.Mesh).isMesh) {
      const m = obj as THREE.Mesh;
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  modelRoot.add(loadedScene);

  // Locate optional handheld props on the Original Room-Native character
  const binderProp = loadedScene.getObjectByName('Open_Strategy_Binder_Prop') || null;
  const phoneProp = loadedScene.getObjectByName('Executive_Smartphone_Prop') || null;
  const coffeeProp = loadedScene.getObjectByName('Warm_Ceramic_Coffee_Cup_Prop') || null;

  const updateContextualProps = (actionId: PMActionId, isWalking: boolean) => {
    if (binderProp) binderProp.visible = !isWalking && actionId === 'read_document';
    if (phoneProp) phoneProp.visible = !isWalking && actionId === 'phone_call';
    if (coffeeProp) coffeeProp.visible = !isWalking && actionId === 'coffee_break';
  };

  // Subtle floor selection ring on NavigationRoot (outside ModelRoot so character hierarchy is untouched)
  const ringGeom = new THREE.RingGeometry(0.28, 0.36, 24);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xd99252,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const selectionRing = new THREE.Mesh(ringGeom, ringMat);
  selectionRing.name = 'PM_Selection_Highlight_Ring';
  selectionRing.position.set(0, 0.022, 0);
  selectionRing.visible = false;
  navigationRoot.add(selectionRing);

  // Overhead anchor for floating status badge (outside ModelRoot)
  const interactionAnchor = new THREE.Object3D();
  interactionAnchor.name = 'InteractionAnchor';
  interactionAnchor.position.set(0, MODULE_CONSTANTS.CHARACTER_REFERENCE_HEIGHT + 0.28, 0);
  navigationRoot.add(interactionAnchor);

  let badgeCanvas: HTMLCanvasElement | null = null;
  let badgeTexture: THREE.CanvasTexture | null = null;
  if (typeof document !== 'undefined') {
    badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 320;
    badgeCanvas.height = 64;
    badgeTexture = new THREE.CanvasTexture(badgeCanvas);
    badgeTexture.colorSpace = THREE.SRGBColorSpace;
    const badgeSpriteMat = new THREE.SpriteMaterial({
      map: badgeTexture,
      transparent: true,
      depthTest: false,
    });
    const badgeSprite = new THREE.Sprite(badgeSpriteMat);
    badgeSprite.name = 'PM_Overhead_Status_Sprite';
    badgeSprite.scale.set(1.25, 0.25, 1);
    interactionAnchor.add(badgeSprite);
  }

  const drawOverheadBadge = (stateLabel: string, accentHex: string) => {
    if (!badgeCanvas || !badgeTexture) return;
    const ctx = badgeCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 320, 64);
    ctx.fillStyle = 'rgba(20, 21, 27, 0.9)';
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 3;
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(6, 6, 308, 52, 10);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(6, 6, 308, 52);
      ctx.strokeRect(6, 6, 308, 52);
    }

    ctx.fillStyle = accentHex;
    ctx.beginPath();
    ctx.arc(28, 32, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F5F2EB';
    ctx.font = 'bold 17px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(`PM · ${stateLabel}`, 46, 25);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '12px monospace';
    ctx.fillText('SIMULASI / DEMO', 46, 44);
    badgeTexture.needsUpdate = true;
  };
  drawOverheadBadge('IDLE / SANTAI', '#34D399');

  // Record initial rest transforms of all nodes so procedural adjustments never permanently mutate the model
  const restTransforms = new Map<THREE.Object3D, RestTransform>();
  loadedScene.traverse((obj) => {
    restTransforms.set(obj, {
      position: obj.position.clone(),
      quaternion: obj.quaternion.clone(),
      rotation: obj.rotation.clone(),
    });
  });

  // Set up AnimationMixer if embedded clips exist (Case A)
  const clipMap = new Map<string, THREE.AnimationClip>();
  let mixer: THREE.AnimationMixer | null = null;
  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(loadedScene);
    for (const clip of gltf.animations) {
      clipMap.set(clip.name, clip);
    }
  }

  let scaleMultiplier = 1.0;
  let forwardOffsetDeg = 0;

  const applyModelRootCalibration = (seatedOffset = 0) => {
    const finalScale = report.appliedScaleFactor * scaleMultiplier;
    const finalFootY = report.footOffsetY * scaleMultiplier + seatedOffset;
    modelRoot.scale.setScalar(finalScale);
    modelRoot.position.set(0, finalFootY, 0);
    modelRoot.rotation.y = (forwardOffsetDeg * Math.PI) / 180;
    interactionAnchor.position.set(
      0,
      MODULE_CONSTANTS.CHARACTER_REFERENCE_HEIGHT * scaleMultiplier + 0.28,
      0
    );
  };

  const resetPoseToRest = () => {
    if (mixer) {
      mixer.stopAllAction();
    }
    restTransforms.forEach((rest, obj) => {
      obj.position.copy(rest.position);
      obj.quaternion.copy(rest.quaternion);
      obj.rotation.copy(rest.rotation);
    });
    updateContextualProps('idle', false);
    applyModelRootCalibration(0);
  };

  let activeAction: THREE.AnimationAction | null = null;
  let activeClipName = 'None';
  let usingProceduralSupplement = false;

  const findMatchingClip = (actionId: PMActionId, isWalking: boolean): THREE.AnimationClip | null => {
    if (clipMap.size === 0) return null;
    const entries = Array.from(clipMap.entries());

    if (isWalking) {
      const walkMatch = entries.find(([k]) => /walk|run|move|locomotion|step/i.test(k));
      if (walkMatch) return walkMatch[1];
    }

    const patternsByAction: Record<PMActionId, RegExp[]> = {
      idle: [/idle/i, /stand/i, /breath/i, /rest/i, /default/i],
      patrol: [/walk/i, /run/i, /move/i],
      work_desk: [/work/i, /type/i, /typing/i, /sit/i, /desk/i, /computer/i],
      meeting_briefing: [/meet/i, /brief/i, /talk/i, /speak/i, /gesture/i, /discuss/i],
      present_board: [/present/i, /point/i, /board/i, /explain/i, /wave/i],
      read_document: [/read/i, /book/i, /look/i, /study/i, /inspect/i],
      think_plan: [/think/i, /plan/i, /ponder/i, /idle/i],
      phone_call: [/phone/i, /call/i, /talk/i],
      coffee_break: [/coffee/i, /drink/i, /sip/i, /break/i, /relax/i],
      waiting_approval: [/wait/i, /pending/i, /pause/i, /idle/i],
      task_completed: [/complete/i, /success/i, /cheer/i, /victory/i, /celebrate/i, /wave/i],
    };

    const candidates = patternsByAction[actionId] || [];
    for (const regex of candidates) {
      const found = entries.find(([k]) => regex.test(k));
      if (found) return found[1];
    }

    if (actionId === 'idle' && entries.length > 0) {
      return entries[0][1];
    }
    return null;
  };

  const transitionToActionPose = (
    actionId: PMActionId,
    isWalking: boolean,
    posture: 'standing' | 'seated' | 'leaning'
  ) => {
    const labelByAction: Record<PMActionId, [string, string]> = {
      idle: ['IDLE / SANTAI', '#94A3B8'],
      patrol: ['JALAN KELILING', '#38BDF8'],
      work_desk: ['KERJA DI MEJA', '#34D399'],
      meeting_briefing: ['RAPAT / BRIEFING', '#A78BFA'],
      present_board: ['PRESENTASI', '#FBBF24'],
      read_document: ['BACA DOKUMEN', '#38BDF8'],
      think_plan: ['MERENCANAKAN', '#C084FC'],
      phone_call: ['TELEPON', '#38BDF8'],
      coffee_break: ['ISTIRAHAT KOPI', '#F59E0B'],
      waiting_approval: ['TUNGGU SETUJU', '#F87171'],
      task_completed: ['TUGAS SELESAI', '#10B981'],
    };
    const [badgeText, badgeHex] = isWalking
      ? ['MENUJU LOKASI', '#38BDF8']
      : labelByAction[actionId] || ['RAPAT / BRIEFING', '#A78BFA'];
    drawOverheadBadge(badgeText, badgeHex);
    updateContextualProps(actionId, isWalking);

    const matchedClip = findMatchingClip(actionId, isWalking);

    if (mixer && matchedClip) {
      usingProceduralSupplement = false;
      activeClipName =
        assetSource === 'original_room_native'
          ? `${matchedClip.name} (Original Voxel)`
          : `${matchedClip.name} (Embedded)`;
      const nextAction = mixer.clipAction(matchedClip);
      if (activeAction !== nextAction) {
        nextAction.reset();
        nextAction.setEffectiveTimeScale(1);
        nextAction.setEffectiveWeight(1);
        nextAction.play();
        if (activeAction) {
          activeAction.crossFadeTo(nextAction, 0.22, false);
        }
        activeAction = nextAction;
      }
      applyModelRootCalibration(0);
    } else {
      if (activeAction) {
        activeAction.fadeOut(0.18);
        activeAction = null;
      }
      usingProceduralSupplement = true;
      resetPoseToRest();
      updateContextualProps(actionId, isWalking);

      if (
        report.capabilityMode === 'CASE_B_ARTICULATED_PARTS' ||
        articulatedNodes.head ||
        articulatedNodes.leftArm ||
        articulatedNodes.rightArm
      ) {
        activeClipName = isWalking
          ? 'Procedural_Walk (Hierarchy)'
          : `Procedural_${actionId} (Hierarchy)`;
      } else {
        activeClipName = isWalking
          ? 'Transform_Walk (Whole-Model)'
          : `Transform_${actionId} (Whole-Model)`;
      }

      const seatedOffset = !isWalking && posture === 'seated' ? -0.16 : 0;
      applyModelRootCalibration(seatedOffset);
    }
  };

  const updateFrame = (
    deltaSeconds: number,
    elapsedTime: number,
    state: PMAgentStateId,
    isWalking: boolean,
    speedMultiplier: number
  ) => {
    const dt = deltaSeconds * speedMultiplier;
    const t = elapsedTime * speedMultiplier;

    if (mixer && !usingProceduralSupplement) {
      mixer.update(dt);
      return;
    }

    // Safe non-destructive hierarchical animation on existing nodes relative to their rest transforms
    const { hips, torso, head, leftArm, rightArm, leftLeg, rightLeg } = articulatedNodes;
    const hasLimbNodes = Boolean(head || leftArm || rightArm || leftLeg || rightLeg);

    if (hasLimbNodes) {
      const setRelRot = (node: THREE.Object3D | null, rx: number, ry: number, rz: number) => {
        if (!node) return;
        const rest = restTransforms.get(node);
        if (!rest) return;
        const deltaQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'XYZ'));
        node.quaternion.copy(rest.quaternion).multiply(deltaQ);
      };

      if (isWalking) {
        const w = t * 6.5;
        setRelRot(leftLeg, Math.sin(w) * 0.42, 0, 0);
        setRelRot(rightLeg, -Math.sin(w) * 0.42, 0, 0);
        setRelRot(leftArm, -Math.sin(w) * 0.32, 0, 0);
        setRelRot(rightArm, Math.sin(w) * 0.32, 0, 0);
        setRelRot(torso, 0.03, Math.sin(w) * 0.05, 0);
        setRelRot(head, 0, Math.cos(w * 0.5) * 0.04, 0);
        const baseY = report.footOffsetY * scaleMultiplier;
        modelRoot.position.y = baseY + Math.abs(Math.sin(w)) * 0.025;
      } else if (state === 'WORKING') {
        setRelRot(leftLeg, -1.05, 0, 0);
        setRelRot(rightLeg, -1.05, 0, 0);
        setRelRot(leftArm, -0.95 + Math.sin(t * 9) * 0.06, 0.12, 0);
        setRelRot(rightArm, -0.95 + Math.cos(t * 9) * 0.06, -0.12, 0);
        setRelRot(head, 0.06, Math.sin(t * 1.8) * 0.09, 0);
        if (hips && restTransforms.has(hips)) {
          modelRoot.position.y = report.footOffsetY * scaleMultiplier - 0.16;
        }
      } else if (state === 'MEETING') {
        setRelRot(leftLeg, 0, 0, 0);
        setRelRot(rightLeg, 0, 0, 0);
        setRelRot(rightArm, -0.65 + Math.sin(t * 3.2) * 0.18, -0.15, 0);
        setRelRot(leftArm, -0.45 + Math.cos(t * 2.6) * 0.12, 0.15, 0);
        setRelRot(head, Math.sin(t * 2) * 0.04, Math.sin(t * 1.5) * 0.12, 0);
      } else if (state === 'PRESENTING') {
        setRelRot(leftLeg, 0, 0, 0);
        setRelRot(rightLeg, 0, 0, 0);
        setRelRot(rightArm, -1.45 + Math.sin(t * 2.8) * 0.14, Math.cos(t * 2) * 0.16, 0);
        setRelRot(leftArm, -0.25, 0.1, 0);
        setRelRot(head, -0.1, Math.sin(t * 1.8) * 0.1, 0);
      } else if (state === 'READING') {
        setRelRot(leftArm, -0.85, 0.25, 0);
        setRelRot(rightArm, -0.85 + Math.sin(t * 2) * 0.05, -0.25, 0);
        setRelRot(head, 0.22 + Math.sin(t * 1.5) * 0.03, Math.sin(t * 1.1) * 0.06, 0);
      } else if (state === 'THINKING') {
        setRelRot(rightArm, -1.35, -0.3, 0);
        setRelRot(leftArm, -0.65, 0.4, 0);
        setRelRot(head, -0.06, Math.sin(t * 1.2) * 0.08, 0.08);
      } else if (state === 'PHONE_CALL') {
        setRelRot(rightArm, -1.75, -0.3, 0);
        setRelRot(leftArm, -0.35 + Math.sin(t * 2.5) * 0.1, 0.1, 0);
        setRelRot(head, Math.sin(t * 3) * 0.04, Math.cos(t * 1.5) * 0.05, -0.06);
      } else if (state === 'COFFEE_BREAK') {
        const sip = Math.max(0, Math.sin(t * 1.6));
        setRelRot(rightArm, -0.75 - sip * 0.65, -0.22, 0);
        setRelRot(head, -sip * 0.14, 0, 0);
      } else if (state === 'WAITING_APPROVAL') {
        setRelRot(leftArm, -0.55, 0.35, 0);
        setRelRot(rightArm, -0.55, -0.35, 0);
        setRelRot(head, Math.sin(t * 2) * 0.04, Math.sin(t * 1.2) * 0.06, 0);
      } else if (state === 'TASK_COMPLETED') {
        setRelRot(leftArm, -1.95 + Math.sin(t * 6) * 0.15, 0, 0.15);
        setRelRot(rightArm, -1.95 + Math.cos(t * 6) * 0.15, 0, -0.15);
        setRelRot(head, Math.sin(t * 4) * 0.08, 0, 0);
      } else {
        // IDLE
        setRelRot(leftLeg, 0, 0, 0);
        setRelRot(rightLeg, 0, 0, 0);
        setRelRot(leftArm, Math.sin(t * 1.8) * 0.03, 0, 0);
        setRelRot(rightArm, -Math.sin(t * 1.8) * 0.03, 0, 0);
        setRelRot(head, Math.sin(t * 1.3) * 0.025, Math.cos(t * 0.9) * 0.06, 0);
      }
      return;
    }

    // Case C: Honest rigid-transform motion when no separate limb nodes exist
    const baseY = report.footOffsetY * scaleMultiplier + (state === 'WORKING' && !isWalking ? -0.16 : 0);
    if (isWalking) {
      modelRoot.position.y = baseY + Math.abs(Math.sin(t * 7.0)) * 0.03;
    } else {
      modelRoot.position.y = baseY + Math.sin(t * 2.2) * 0.005;
    }
  };

  transitionToActionPose('idle', false, 'standing');

  return {
    sourceType: assetSource === 'original_room_native' ? 'original_pm' : 'imported_glb',
    runtimeRoot,
    navigationRoot,
    orientationRoot,
    modelRoot,
    interactionAnchor,
    selectionRing,
    loadedScene,
    animations: gltf.animations || [],
    mixer,
    clipMap,
    get activeAction() {
      return activeAction;
    },
    get activeClipName() {
      return activeClipName;
    },
    articulatedNodes,
    restTransforms,
    inspectionReport: report,
    get scaleMultiplier() {
      return scaleMultiplier;
    },
    get forwardOffsetDeg() {
      return forwardOffsetDeg;
    },
    setHighlighted: (highlighted: boolean) => {
      selectionRing.visible = highlighted;
    },
    setScaleMultiplier: (mult: number) => {
      scaleMultiplier = THREE.MathUtils.clamp(mult, 0.25, 3.0);
      applyModelRootCalibration(0);
    },
    setForwardOffsetDeg: (deg: number) => {
      forwardOffsetDeg = deg;
      applyModelRootCalibration(0);
    },
    transitionToActionPose,
    updateFrame,
    resetPoseToRest,
  };
}

/**
 * Creates the default Original Room-Native Cozy Voxel Boss PM runtime instance.
 * Appears automatically whenever the PM Room loads without requiring manual GLB upload.
 */
export function createOriginalRoomNativeBossPMRuntime(): BossPMRuntimeInstance {
  const { scene, animations } = buildOriginalRoomNativeBossPMSceneAndClips();
  return createBossPMRuntimeFromGLTF(
    { scene, animations },
    'original_room_native',
    'Original Room-Native Voxel Boss PM',
    48640
  );
}

/**
 * Exports a clean, standalone binary GLB of the Original Room-Native Boss PM character
 * in its default standing rest pose at [0, 0, 0] with its 11 embedded AnimationClips.
 */
export async function exportOriginalBossPMToGLBBuffer(): Promise<ArrayBuffer> {
  const { scene, animations } = buildOriginalRoomNativeBossPMSceneAndClips();
  scene.updateMatrixWorld(true);

  const exporter = new GLTFExporter();
  return new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(new Error('GLTFExporter did not return a binary ArrayBuffer for Original PM.'));
        }
      },
      (err) => reject(err),
      {
        binary: true,
        onlyVisible: true,
        animations,
      }
    );
  });
}

/**
 * Loads a user-selected `.glb` File from the browser File API, converts it to an ArrayBuffer,
 * validates the binary glTF header, parses it via GLTFLoader.parseAsync(), inspects the scene,
 * and returns the ready-to-mount BossPMRuntimeInstance.
 */
export async function loadBossPMFromBrowserFile(file: File): Promise<BossPMRuntimeInstance> {
  if (!file) {
    throw new Error('Tidak ada file yang dipilih.');
  }
  const buffer = await file.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new Error(`File "${file.name}" kosong (0 bytes).`);
  }

  const isGlb = isValidGlbBinaryBuffer(buffer);
  const isGltfJson = file.name.toLowerCase().endsWith('.gltf');
  if (!isGlb && !isGltfJson) {
    throw new Error(
      `File "${file.name}" bukan file binary .GLB glTF 2.0 yang valid. Pastikan memilih file .glb hasil ekspor.`
    );
  }

  const loader = new GLTFLoader();
  const gltf: GLTF = await loader.parseAsync(buffer, '');

  let meshCount = 0;
  gltf.scene.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) meshCount++;
  });
  if (meshCount === 0) {
    throw new Error(`File "${file.name}" berhasil dibaca tetapi tidak memiliki 3D Mesh di dalamnya.`);
  }

  return createBossPMRuntimeFromGLTF(
    gltf,
    'runtime_upload',
    file.name,
    buffer.byteLength
  );
}

/**
 * Optional probe for a fixed project asset at `/assets/characters/boss_pm.glb`.
 */
export async function tryLoadFixedProjectCharacterAsset(
  url: string = FIXED_PROJECT_CHARACTER_ASSET_URL
): Promise<BossPMRuntimeInstance | null> {
  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      return null;
    }
    const buffer = await response.arrayBuffer();
    if (!isValidGlbBinaryBuffer(buffer)) {
      return null;
    }
    const loader = new GLTFLoader();
    const gltf = await loader.parseAsync(buffer, '');
    return createBossPMRuntimeFromGLTF(gltf, 'project_asset', url, buffer.byteLength);
  } catch {
    return null;
  }
}

/**
 * Builds the preview-only SIMULATION_HELPERS group containing:
 * - ANCHORS (visual markers + facing direction arrows for all 10 room activity anchors)
 * - PATH_DEBUG (active navigation path line + waypoint dots)
 * Placed strictly outside ROOM_PM_ROOT so room-only exports stay 100% clean.
 */
export function buildSimulationHelpersGroup(
  anchors: Record<AnchorId, ActivityAnchor>,
  selectedAnchorId: AnchorId | null
): {
  helpersRoot: THREE.Group;
  anchorsGroup: THREE.Group;
  pathDebugGroup: THREE.Group;
  updateAnchorsVisuals: (
    updatedAnchors: Record<AnchorId, ActivityAnchor>,
    activeSelectedId: AnchorId | null
  ) => void;
  updatePathVisuals: (currentXZ: [number, number], pathPoints: Array<[number, number]>) => void;
} {
  const helpersRoot = new THREE.Group();
  helpersRoot.name = 'SIMULATION_HELPERS';
  helpersRoot.userData.isPreviewOnly = true;

  const anchorsGroup = new THREE.Group();
  anchorsGroup.name = 'ANCHORS';
  anchorsGroup.visible = false;
  helpersRoot.add(anchorsGroup);

  const pathDebugGroup = new THREE.Group();
  pathDebugGroup.name = 'PATH_DEBUG';
  pathDebugGroup.visible = false;
  helpersRoot.add(pathDebugGroup);

  const updateAnchorsVisuals = (
    updatedAnchors: Record<AnchorId, ActivityAnchor>,
    activeSelectedId: AnchorId | null
  ) => {
    while (anchorsGroup.children.length > 0) {
      anchorsGroup.remove(anchorsGroup.children[0]);
    }
    (Object.keys(updatedAnchors) as AnchorId[]).forEach((id) => {
      const anchor = updatedAnchors[id];
      const isSel = id === activeSelectedId;
      const markerGroup = new THREE.Group();
      markerGroup.name = `Anchor_Marker_${id}`;
      markerGroup.position.set(anchor.position[0], 0.02, anchor.position[2]);
      markerGroup.rotation.y = anchor.facingRad;

      const color = isSel ? 0xfbbf24 : id === 'SPAWN_POINT' ? 0x34d399 : 0x38bdf8;
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(isSel ? 0.22 : 0.16, isSel ? 0.22 : 0.16, 0.02, 16),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: isSel ? 0.9 : 0.7 })
      );
      markerGroup.add(disc);

      const arrowShaft = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.025, 0.26),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      arrowShaft.position.set(0, 0.02, 0.15);
      markerGroup.add(arrowShaft);

      const arrowHead = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.14, 8),
        new THREE.MeshBasicMaterial({ color })
      );
      arrowHead.rotation.x = Math.PI / 2;
      arrowHead.position.set(0, 0.02, 0.32);
      markerGroup.add(arrowHead);

      anchorsGroup.add(markerGroup);
    });
  };

  const updatePathVisuals = (currentXZ: [number, number], pathPoints: Array<[number, number]>) => {
    while (pathDebugGroup.children.length > 0) {
      pathDebugGroup.remove(pathDebugGroup.children[0]);
    }
    if (pathPoints.length === 0) return;

    const pts: THREE.Vector3[] = [new THREE.Vector3(currentXZ[0], 0.04, currentXZ[1])];
    for (const [px, pz] of pathPoints) {
      pts.push(new THREE.Vector3(px, 0.04, pz));
      const nodeDot = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      nodeDot.position.set(px, 0.04, pz);
      pathDebugGroup.add(nodeDot);
    }

    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0xfbbf24 }));
    pathDebugGroup.add(line);
  };

  updateAnchorsVisuals(anchors, selectedAnchorId);

  return {
    helpersRoot,
    anchorsGroup,
    pathDebugGroup,
    updateAnchorsVisuals,
    updatePathVisuals,
  };
}
