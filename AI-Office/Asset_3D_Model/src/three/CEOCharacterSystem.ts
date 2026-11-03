import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import {
  DEFAULT_CEO_ANCHORS,
  CEOAnchorId,
} from '../domain/ceoRoomSpec';
import {
  CEO_CHARACTER_CONSTANTS,
  CEOAgentStateId,
  CEOActionId,
  CEOExpressionId,
  CEOExpressionDefinition,
  CEOHandheldPropId,
  CEOPlaybackCommand,
  CEORuntimeStatus,
  CEO_WALK_WAYPOINTS,
  CEO_PATROL_ANCHOR_SEQUENCE,
  CEO_AUTO_DEMO_SEQUENCE,
  findCEOWalkablePath,
  getCEOActionDef,
  getCEOExpressionDef,
} from '../domain/ceoSimulationSpec';

export type { CEORuntimeStatus };

export interface CEORuntimeInstance {
  rootGroup: THREE.Group;
  navigationRoot: THREE.Group;
  orientationRoot: THREE.Group;
  modelRoot: THREE.Group;
  characterVisualRoot: THREE.Group;
  selectionRing: THREE.Mesh;
  statusLabelSprite: THREE.Sprite;
  mixer: THREE.AnimationMixer;
  actionsMap: Map<string, THREE.AnimationAction>;
  clips: THREE.AnimationClip[];
  pivots: {
    hips: THREE.Group;
    torso: THREE.Group;
    head: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    glassesGroup: THREE.Group;
    idBadgeGroup: THREE.Group;
    leftEyebrow: THREE.Mesh;
    rightEyebrow: THREE.Mesh;
    leftPupil: THREE.Mesh;
    rightPupil: THREE.Mesh;
    mouthMesh: THREE.Mesh;
    props: {
      report_binder: THREE.Group;
      executive_tablet: THREE.Group;
      smartphone: THREE.Group;
      coffee_cup: THREE.Group;
    };
  };
  update: (deltaSeconds: number, elapsedSeconds: number) => void;
  triggerAction: (actionId: CEOActionId, immediateTeleport?: boolean) => void;
  walkToAnchor: (anchorId: CEOAnchorId, followUpActionId?: CEOActionId) => void;
  walkToWorldPoint: (x: number, z: number) => boolean;
  executePlayback: (cmd: CEOPlaybackCommand) => void;
  setSpeed: (speed: 0.5 | 1 | 1.5) => void;
  setSpeedMultiplier: (speed: number) => void;
  setPatrol: (enabled: boolean) => void;
  setPatrolEnabled: (enabled: boolean) => void;
  startAutoDemo: () => void;
  startAutoDemoSequence: () => void;
  stopAutoDemo: () => void;
  stopAutoDemoSequence: () => void;
  setExpression: (expressionId: CEOExpressionId) => void;
  setGlassesVisible: (visible: boolean) => void;
  setStatusLabelVisible: (visible: boolean) => void;
  getStatus: () => CEORuntimeStatus;
  dispose: () => void;
}

function makeCharMat(name: string, hex: number, roughness = 0.72, metalness = 0.06): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    name,
    color: hex,
    roughness,
    metalness,
  });
  return mat;
}

function createRoundedVoxelBox(
  w: number,
  h: number,
  d: number,
  mat: THREE.Material,
  name: string,
  castShadow = true
): THREE.Mesh {
  const geom = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  return mesh;
}

function createCEOStatusSprite(): {
  sprite: THREE.Sprite;
  updateText: (stateLabel: string, badgeLabel: string) => void;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.name = 'CEO_Runtime_Status_Sprite';
  sprite.scale.set(1.42, 0.355, 1);
  sprite.position.set(0, 2.08, 0);
  sprite.renderOrder = 25;

  let lastKey = '';
  const updateText = (stateLabel: string, badgeLabel: string) => {
    const key = `${stateLabel}|${badgeLabel}`;
    if (key === lastKey || !ctx) return;
    lastKey = key;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(13, 21, 32, 0.90)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(12, 16, 488, 96, 18);
    ctx.fill();
    ctx.stroke();

    // Active green indicator dot
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(44, 48, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
    ctx.fillText(`CEO ASST · ${stateLabel}`, 66, 56);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = '600 18px JetBrains Mono, monospace';
    ctx.fillText(`${badgeLabel} · SIMULASI / DEMO`, 66, 90);

    texture.needsUpdate = true;
  };

  updateText('IDLE', 'SIAGA');
  return { sprite, updateText };
}

/**
 * Builds the canonical procedural voxel CEO Executive Assistant character hierarchy + 14 embedded AnimationClips.
 * Matches Boss PM's 1.725u voxel art direction while possessing a completely distinct Senior Executive identity:
 * - Dark charcoal tailored suit jacket (#232730) with lapels (#2E333F) & subtle gold lapel pin (#D4AF5A)
 * - Crisp white dress shirt (#F5F5F0) & deep emerald-green executive necktie (#0F6B4E / #10B981)
 * - Attached green-lanyard Executive ID Card badge on chest (stepped Z offsets so zero Z-fighting)
 * - Mature short layered dark-brown hair (#261C16) with authored medium-gray (#7D8590) and silver (#B8C0CC) temple & crown clusters
 * - Black rectangular open-frame eyeglasses (`CEO_Eyeglasses_Group`) with visible eyes, eyebrows, nose bridge, and expressive mouth
 * - 4 contextual handheld props (`report_binder`, `executive_tablet`, `smartphone`, `coffee_cup`)
 */
export function buildCEOExecutiveAssistantSceneAndClips(): {
  characterRoot: THREE.Group;
  pivots: CEORuntimeInstance['pivots'];
  clips: THREE.AnimationClip[];
} {
  const characterRoot = new THREE.Group();
  characterRoot.name = 'CEO_Executive_Assistant_Root';

  // Canonical Senior Executive Palette
  const skinMat = makeCharMat('CEO_Skin_WarmBeige', 0xedc09e, 0.66, 0.02);
  const cheekMat = makeCharMat('CEO_Skin_CheekWarm', 0xe2af8d, 0.68, 0.02);
  const hairDarkBrownMat = makeCharMat('CEO_Hair_DarkBrown', 0x261c16, 0.78, 0.04);
  const hairMedGrayMat = makeCharMat('CEO_Hair_MediumGray', 0x7d8590, 0.68, 0.08);
  const hairSilverMat = makeCharMat('CEO_Hair_SilverHighlight', 0xb8c0cc, 0.62, 0.12);

  const suitJacketMat = makeCharMat('CEO_Suit_Charcoal', 0x232730, 0.76, 0.06);
  const suitLapelMat = makeCharMat('CEO_Suit_Lapel', 0x2e333f, 0.72, 0.07);
  const trousersMat = makeCharMat('CEO_Trousers_DarkCharcoal', 0x1b1e26, 0.80, 0.05);
  const shirtWhiteMat = makeCharMat('CEO_Shirt_CrispWhite', 0xf5f5f0, 0.68, 0.02);
  const tieEmeraldMat = makeCharMat('CEO_Tie_Emerald', 0x0f6b4e, 0.58, 0.08);
  const tieEmeraldBrightMat = makeCharMat('CEO_Tie_EmeraldHighlight', 0x10b981, 0.52, 0.10);

  const shoeLeatherMat = makeCharMat('CEO_Shoe_DarkBrownLeather', 0x2c1d14, 0.52, 0.12);
  const shoeSoleMat = makeCharMat('CEO_Shoe_SoleDark', 0x14110f, 0.85, 0.04);
  const goldAccentMat = makeCharMat('CEO_Gold_Brushed', 0xd4af5a, 0.32, 0.72);
  const beltLeatherMat = makeCharMat('CEO_Belt_DarkLeather', 0x1c1613, 0.58, 0.10);

  const glassesFrameMat = makeCharMat('CEO_Eyeglasses_BlackFrame', 0x15181e, 0.34, 0.24);
  const glassesLensMat = new THREE.MeshStandardMaterial({
    name: 'CEO_Eyeglasses_ClearLens',
    color: 0xdbeafe,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });

  const eyeWhiteMat = makeCharMat('CEO_Eye_ScleraWhite', 0xf8fafc, 0.45, 0.02);
  const eyePupilMat = makeCharMat('CEO_Eye_PupilDark', 0x111827, 0.35, 0.05);
  const eyebrowMat = makeCharMat('CEO_Eyebrow_Charcoal', 0x363a42, 0.72, 0.04);
  const mouthMat = makeCharMat('CEO_Mouth_Warm', 0x68382c, 0.68, 0.02);

  const lanyardGreenMat = makeCharMat('CEO_ID_LanyardGreen', 0x047857, 0.64, 0.06);
  const badgeCaseGreenMat = makeCharMat('CEO_ID_CaseEmerald', 0x065f46, 0.50, 0.10);
  const badgeCardCreamMat = makeCharMat('CEO_ID_CardCream', 0xfef3c7, 0.60, 0.02);

  // Prop materials
  const binderCoverMat = makeCharMat('CEO_Prop_BinderEmerald', 0x064e3b, 0.56, 0.08);
  const tabletBodyMat = makeCharMat('CEO_Prop_TabletBody', 0x1e293b, 0.38, 0.42);
  const tabletScreenMat = new THREE.MeshStandardMaterial({
    name: 'CEO_Prop_TabletScreen',
    color: 0x10b981,
    emissive: new THREE.Color(0x059669),
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.1,
  });
  const phoneDarkMat = makeCharMat('CEO_Prop_SmartphoneDark', 0x0f172a, 0.32, 0.35);
  const phoneScreenMat = new THREE.MeshStandardMaterial({
    name: 'CEO_Prop_SmartphoneScreen',
    color: 0x38bdf8,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 0.42,
    roughness: 0.25,
    metalness: 0.1,
  });
  const mugCeramicMat = makeCharMat('CEO_Prop_MugCeramic', 0xf8fafc, 0.35, 0.05);
  const mugBandMat = makeCharMat('CEO_Prop_MugEmeraldBand', 0x059669, 0.48, 0.08);
  const coffeeLiquidMat = makeCharMat('CEO_Prop_CoffeeEspresso', 0x3b2314, 0.28, 0.05);

  // 1. HIPS PIVOT (Center of gravity at Y = 0.72)
  const hips = new THREE.Group();
  hips.name = 'Hips';
  hips.position.set(0, 0.72, 0);
  characterRoot.add(hips);

  const pelvisMesh = createRoundedVoxelBox(0.37, 0.14, 0.23, trousersMat, 'Pelvis_Block');
  pelvisMesh.position.set(0, 0, 0);
  hips.add(pelvisMesh);

  // Formal Leather Belt & Brushed Gold Buckle
  const beltStrap = createRoundedVoxelBox(0.38, 0.042, 0.238, beltLeatherMat, 'Executive_Belt_Strap');
  beltStrap.position.set(0, 0.045, 0);
  hips.add(beltStrap);

  const beltBuckle = createRoundedVoxelBox(0.075, 0.048, 0.018, goldAccentMat, 'Executive_Belt_Buckle_Gold');
  beltBuckle.position.set(0, 0.045, 0.124);
  hips.add(beltBuckle);

  // 2. LEGS (Hip joints at Y = -0.04 relative to Hips -> 0.68 world Y; Shoes reach 0.000 world Y)
  const leftLeg = new THREE.Group();
  leftLeg.name = 'LeftLeg';
  leftLeg.position.set(-0.095, -0.04, 0);
  hips.add(leftLeg);

  const leftLegUpper = createRoundedVoxelBox(0.145, 0.56, 0.165, trousersMat, 'Left_Trouser_Leg');
  leftLegUpper.position.set(0, -0.28, 0);
  leftLeg.add(leftLegUpper);

  const leftShoeUpper = createRoundedVoxelBox(0.15, 0.095, 0.225, shoeLeatherMat, 'Left_Formal_Shoe');
  leftShoeUpper.position.set(0, -0.605, 0.028);
  leftLeg.add(leftShoeUpper);

  const leftShoeSole = createRoundedVoxelBox(0.154, 0.028, 0.23, shoeSoleMat, 'Left_Shoe_Sole');
  leftShoeSole.position.set(0, -0.666, 0.028);
  leftLeg.add(leftShoeSole);

  const rightLeg = new THREE.Group();
  rightLeg.name = 'RightLeg';
  rightLeg.position.set(0.095, -0.04, 0);
  hips.add(rightLeg);

  const rightLegUpper = createRoundedVoxelBox(0.145, 0.56, 0.165, trousersMat, 'Right_Trouser_Leg');
  rightLegUpper.position.set(0, -0.28, 0);
  rightLeg.add(rightLegUpper);

  const rightShoeUpper = createRoundedVoxelBox(0.15, 0.095, 0.225, shoeLeatherMat, 'Right_Formal_Shoe');
  rightShoeUpper.position.set(0, -0.605, 0.028);
  rightLeg.add(rightShoeUpper);

  const rightShoeSole = createRoundedVoxelBox(0.154, 0.028, 0.23, shoeSoleMat, 'Right_Shoe_Sole');
  rightShoeSole.position.set(0, -0.666, 0.028);
  rightLeg.add(rightShoeSole);

  // 3. TORSO PIVOT (Attached to Hips at Y = 0.06 -> 0.78 world Y)
  const torso = new THREE.Group();
  torso.name = 'Torso';
  torso.position.set(0, 0.06, 0);
  hips.add(torso);

  // Dark Charcoal Executive Suit Jacket Core
  const jacketBody = createRoundedVoxelBox(0.41, 0.48, 0.24, suitJacketMat, 'Executive_Suit_Jacket');
  jacketBody.position.set(0, 0.24, 0);
  torso.add(jacketBody);

  // Crisp White Dress Shirt V-Front (stepped Z = 0.123 to avoid coplanarity with jacket Z = 0.120)
  const shirtFront = createRoundedVoxelBox(0.16, 0.42, 0.012, shirtWhiteMat, 'Dress_Shirt_Front');
  shirtFront.position.set(0, 0.255, 0.121);
  torso.add(shirtFront);

  // White Shirt Collar Left & Right
  const collarLeft = createRoundedVoxelBox(0.085, 0.055, 0.022, shirtWhiteMat, 'Dress_Shirt_Collar_L');
  collarLeft.position.set(-0.052, 0.468, 0.124);
  collarLeft.rotation.z = 0.22;
  torso.add(collarLeft);

  const collarRight = createRoundedVoxelBox(0.085, 0.055, 0.022, shirtWhiteMat, 'Dress_Shirt_Collar_R');
  collarRight.position.set(0.052, 0.468, 0.124);
  collarRight.rotation.z = -0.22;
  torso.add(collarRight);

  // Tailored Suit Lapels (stepped Z = 0.128)
  const lapelLeft = createRoundedVoxelBox(0.068, 0.36, 0.016, suitLapelMat, 'Suit_Lapel_L');
  lapelLeft.position.set(-0.095, 0.28, 0.126);
  lapelLeft.rotation.z = -0.10;
  torso.add(lapelLeft);

  const lapelRight = createRoundedVoxelBox(0.068, 0.36, 0.016, suitLapelMat, 'Suit_Lapel_R');
  lapelRight.position.set(0.095, 0.28, 0.126);
  lapelRight.rotation.z = 0.10;
  torso.add(lapelRight);

  // Subtle Brushed Gold Executive Lapel Pin & Pocket Trim
  const goldLapelPin = createRoundedVoxelBox(0.024, 0.024, 0.014, goldAccentMat, 'Executive_Gold_Lapel_Pin');
  goldLapelPin.position.set(-0.102, 0.38, 0.138);
  torso.add(goldLapelPin);

  const pocketTrim = createRoundedVoxelBox(0.072, 0.016, 0.012, shirtWhiteMat, 'Suit_Pocket_Square');
  pocketTrim.position.set(-0.135, 0.31, 0.125);
  torso.add(pocketTrim);

  // Deep Emerald-Green Necktie (Knot + Blade at stepped Z = 0.132..0.136)
  const tieKnot = createRoundedVoxelBox(0.048, 0.046, 0.020, tieEmeraldBrightMat, 'Emerald_Tie_Knot');
  tieKnot.position.set(0, 0.442, 0.132);
  torso.add(tieKnot);

  const tieBlade = createRoundedVoxelBox(0.052, 0.30, 0.016, tieEmeraldMat, 'Emerald_Tie_Blade');
  tieBlade.position.set(0, 0.275, 0.131);
  torso.add(tieBlade);

  const tieTip = createRoundedVoxelBox(0.038, 0.036, 0.016, tieEmeraldBrightMat, 'Emerald_Tie_Tip');
  tieTip.position.set(0, 0.115, 0.131);
  torso.add(tieTip);

  const tieClipGold = createRoundedVoxelBox(0.056, 0.014, 0.018, goldAccentMat, 'Emerald_Tie_Gold_Clip');
  tieClipGold.position.set(0, 0.29, 0.136);
  torso.add(tieClipGold);

  // 4. EXECUTIVE ID CARD & GREEN LANYARD GROUP (Attached to Torso, distinct Z offsets so zero flicker)
  const idBadgeGroup = new THREE.Group();
  idBadgeGroup.name = 'ID_Card_Badge';
  torso.add(idBadgeGroup);

  const lanyardStrapL = createRoundedVoxelBox(0.018, 0.25, 0.012, lanyardGreenMat, 'ID_Lanyard_Strap_L');
  lanyardStrapL.position.set(-0.046, 0.355, 0.139);
  lanyardStrapL.rotation.z = -0.18;
  idBadgeGroup.add(lanyardStrapL);

  const lanyardStrapR = createRoundedVoxelBox(0.018, 0.25, 0.012, lanyardGreenMat, 'ID_Lanyard_Strap_R');
  lanyardStrapR.position.set(0.046, 0.355, 0.139);
  lanyardStrapR.rotation.z = 0.18;
  idBadgeGroup.add(lanyardStrapR);

  const badgeGoldClip = createRoundedVoxelBox(0.026, 0.022, 0.014, goldAccentMat, 'ID_Badge_Gold_Clip');
  badgeGoldClip.position.set(0.082, 0.242, 0.141);
  idBadgeGroup.add(badgeGoldClip);

  const badgeHolderCase = createRoundedVoxelBox(0.076, 0.102, 0.014, badgeCaseGreenMat, 'ID_Badge_Holder_Green');
  badgeHolderCase.position.set(0.082, 0.182, 0.142);
  idBadgeGroup.add(badgeHolderCase);

  const badgeInnerCard = createRoundedVoxelBox(0.060, 0.076, 0.008, badgeCardCreamMat, 'ID_Badge_Card_Cream');
  badgeInnerCard.position.set(0.082, 0.180, 0.148);
  idBadgeGroup.add(badgeInnerCard);

  const badgeStripeGold = createRoundedVoxelBox(0.052, 0.014, 0.008, goldAccentMat, 'ID_Badge_Header_Gold');
  badgeStripeGold.position.set(0.082, 0.206, 0.151);
  idBadgeGroup.add(badgeStripeGold);

  // 5. ARMS & CONTEXTUAL HANDHELD PROPS
  const leftArm = new THREE.Group();
  leftArm.name = 'LeftArm';
  leftArm.position.set(-0.265, 0.43, 0);
  torso.add(leftArm);

  const leftSleeve = createRoundedVoxelBox(0.125, 0.36, 0.135, suitJacketMat, 'Left_Suit_Sleeve');
  leftSleeve.position.set(0, -0.16, 0);
  leftArm.add(leftSleeve);

  const leftCuff = createRoundedVoxelBox(0.118, 0.036, 0.128, shirtWhiteMat, 'Left_Shirt_Cuff');
  leftCuff.position.set(0, -0.352, 0);
  leftArm.add(leftCuff);

  const leftHand = createRoundedVoxelBox(0.105, 0.105, 0.115, skinMat, 'Left_Hand_Voxel');
  leftHand.position.set(0, -0.415, 0);
  leftArm.add(leftHand);

  // Left-hand contextual props: Report Binder & Executive Tablet
  const reportBinderProp = new THREE.Group();
  reportBinderProp.name = 'CEO_Report_Binder_Prop';
  reportBinderProp.position.set(0.05, -0.43, 0.11);
  reportBinderProp.visible = false;
  const binderFolder = createRoundedVoxelBox(0.22, 0.27, 0.032, binderCoverMat, 'CEO_Binder_Cover');
  const binderPages = createRoundedVoxelBox(0.20, 0.25, 0.022, shirtWhiteMat, 'CEO_Binder_Pages');
  binderPages.position.set(0.008, 0, 0.008);
  const binderGoldTab = createRoundedVoxelBox(0.06, 0.024, 0.036, goldAccentMat, 'CEO_Binder_GoldClip');
  binderGoldTab.position.set(0, 0.12, 0);
  reportBinderProp.add(binderFolder, binderPages, binderGoldTab);
  leftArm.add(reportBinderProp);

  const executiveTabletProp = new THREE.Group();
  executiveTabletProp.name = 'CEO_Executive_Tablet_Prop';
  executiveTabletProp.position.set(0.06, -0.42, 0.12);
  executiveTabletProp.visible = false;
  const tabletFrame = createRoundedVoxelBox(0.23, 0.17, 0.022, tabletBodyMat, 'CEO_Tablet_Body');
  const tabletDisplay = createRoundedVoxelBox(0.20, 0.14, 0.008, tabletScreenMat, 'CEO_Tablet_Display');
  tabletDisplay.position.set(0, 0, 0.011);
  executiveTabletProp.add(tabletFrame, tabletDisplay);
  leftArm.add(executiveTabletProp);

  const rightArm = new THREE.Group();
  rightArm.name = 'RightArm';
  rightArm.position.set(0.265, 0.43, 0);
  torso.add(rightArm);

  const rightSleeve = createRoundedVoxelBox(0.125, 0.36, 0.135, suitJacketMat, 'Right_Suit_Sleeve');
  rightSleeve.position.set(0, -0.16, 0);
  rightArm.add(rightSleeve);

  const rightCuff = createRoundedVoxelBox(0.118, 0.036, 0.128, shirtWhiteMat, 'Right_Shirt_Cuff');
  rightCuff.position.set(0, -0.352, 0);
  rightArm.add(rightCuff);

  const rightHand = createRoundedVoxelBox(0.105, 0.105, 0.115, skinMat, 'Right_Hand_Voxel');
  rightHand.position.set(0, -0.415, 0);
  rightArm.add(rightHand);

  // Right-hand contextual props: Smartphone & Executive Coffee Mug
  const smartphoneProp = new THREE.Group();
  smartphoneProp.name = 'CEO_Smartphone_Prop';
  smartphoneProp.position.set(-0.02, -0.43, 0.09);
  smartphoneProp.visible = false;
  const phoneChassis = createRoundedVoxelBox(0.068, 0.132, 0.018, phoneDarkMat, 'CEO_Smartphone_Body');
  const phoneDisplay = createRoundedVoxelBox(0.058, 0.116, 0.006, phoneScreenMat, 'CEO_Smartphone_Screen');
  phoneDisplay.position.set(0, 0, 0.009);
  smartphoneProp.add(phoneChassis, phoneDisplay);
  rightArm.add(smartphoneProp);

  const coffeeCupProp = new THREE.Group();
  coffeeCupProp.name = 'CEO_Coffee_Cup_Prop';
  coffeeCupProp.position.set(-0.03, -0.43, 0.10);
  coffeeCupProp.visible = false;
  const mugCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.105, 12), mugCeramicMat);
  mugCylinder.name = 'CEO_Mug_Body';
  mugCylinder.castShadow = true;
  const mugEmeraldRing = new THREE.Mesh(new THREE.CylinderGeometry(0.049, 0.046, 0.034, 12), mugBandMat);
  mugEmeraldRing.name = 'CEO_Mug_Emerald_Sleeve';
  const mugCoffeeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.01, 12), coffeeLiquidMat);
  mugCoffeeTop.name = 'CEO_Mug_Coffee_Top';
  mugCoffeeTop.position.set(0, 0.048, 0);
  coffeeCupProp.add(mugCylinder, mugEmeraldRing, mugCoffeeTop);
  rightArm.add(coffeeCupProp);

  // 6. HEAD, EXPRESSIVE FACE, OPEN-FRAME EYEGLASSES & MATURE LAYERED HAIR WITH GRAY HIGHLIGHTS
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.51, 0);
  torso.add(head);

  const neckMesh = createRoundedVoxelBox(0.145, 0.08, 0.145, skinMat, 'Neck_Block');
  neckMesh.position.set(0, 0.01, 0);
  head.add(neckMesh);

  const headCube = createRoundedVoxelBox(0.32, 0.34, 0.30, skinMat, 'Head_Voxel_Core');
  headCube.position.set(0, 0.20, 0);
  head.add(headCube);

  // Compact voxel ears at X = ±0.177 (strictly non-coplanar with Head side faces at X = ±0.160)
  const leftEar = createRoundedVoxelBox(0.032, 0.078, 0.058, skinMat, 'Ear_L');
  leftEar.position.set(-0.177, 0.195, -0.005);
  head.add(leftEar);

  const rightEar = createRoundedVoxelBox(0.032, 0.078, 0.058, skinMat, 'Ear_R');
  rightEar.position.set(0.177, 0.195, -0.005);
  head.add(rightEar);

  // Subtle voxel cheek blocks & clean nose bridge (Head front is Z = +0.150)
  const leftCheek = createRoundedVoxelBox(0.062, 0.038, 0.012, cheekMat, 'Cheek_Subtle_L');
  leftCheek.position.set(-0.092, 0.156, 0.154);
  head.add(leftCheek);

  const rightCheek = createRoundedVoxelBox(0.062, 0.038, 0.012, cheekMat, 'Cheek_Subtle_R');
  rightCheek.position.set(0.092, 0.156, 0.154);
  head.add(rightCheek);

  const noseBridge = createRoundedVoxelBox(0.038, 0.062, 0.028, skinMat, 'Voxel_Nose_Bridge');
  noseBridge.position.set(0, 0.185, 0.162);
  head.add(noseBridge);

  // Visible Expressive Eyes (Sclera + Pupils clearly readable behind open-frame eyeglasses)
  const leftEyeSclera = createRoundedVoxelBox(0.058, 0.038, 0.012, eyeWhiteMat, 'Eye_Sclera_L');
  leftEyeSclera.position.set(-0.072, 0.215, 0.154);
  head.add(leftEyeSclera);

  const rightEyeSclera = createRoundedVoxelBox(0.058, 0.038, 0.012, eyeWhiteMat, 'Eye_Sclera_R');
  rightEyeSclera.position.set(0.072, 0.215, 0.154);
  head.add(rightEyeSclera);

  const leftPupil = createRoundedVoxelBox(0.028, 0.028, 0.014, eyePupilMat, 'Eye_Pupil_L');
  leftPupil.position.set(-0.070, 0.215, 0.158);
  head.add(leftPupil);

  const rightPupil = createRoundedVoxelBox(0.028, 0.028, 0.014, eyePupilMat, 'Eye_Pupil_R');
  rightPupil.position.set(0.070, 0.215, 0.158);
  head.add(rightPupil);

  // Expressive Eyebrows (driven by setExpression)
  const leftEyebrow = createRoundedVoxelBox(0.072, 0.020, 0.018, eyebrowMat, 'Eyebrow_L');
  leftEyebrow.position.set(-0.072, 0.256, 0.158);
  head.add(leftEyebrow);

  const rightEyebrow = createRoundedVoxelBox(0.072, 0.020, 0.018, eyebrowMat, 'Eyebrow_R');
  rightEyebrow.position.set(0.072, 0.256, 0.158);
  head.add(rightEyebrow);

  // Expressive Voxel Mouth (driven by setExpression & talking animations)
  const mouthMesh = createRoundedVoxelBox(0.068, 0.018, 0.014, mouthMat, 'Voxel_Mouth');
  mouthMesh.position.set(0, 0.125, 0.155);
  head.add(mouthMesh);

  // 7. BLACK RECTANGULAR OPEN-FRAME EYEGLASSES (`Glasses` group - clearly shows eyes underneath)
  const glassesGroup = new THREE.Group();
  glassesGroup.name = 'Glasses';
  head.add(glassesGroup);

  // Left & Right Top/Bottom/Side Open Rectangular Rims (Z = 0.172)
  const rimTopL = createRoundedVoxelBox(0.096, 0.013, 0.016, glassesFrameMat, 'Glasses_Rim_Top_L');
  rimTopL.position.set(-0.074, 0.240, 0.172);
  const rimBottomL = createRoundedVoxelBox(0.096, 0.011, 0.015, glassesFrameMat, 'Glasses_Rim_Bottom_L');
  rimBottomL.position.set(-0.074, 0.188, 0.172);
  const rimOuterL = createRoundedVoxelBox(0.013, 0.062, 0.016, glassesFrameMat, 'Glasses_Rim_Outer_L');
  rimOuterL.position.set(-0.118, 0.214, 0.172);
  const rimInnerL = createRoundedVoxelBox(0.012, 0.058, 0.015, glassesFrameMat, 'Glasses_Rim_Inner_L');
  rimInnerL.position.set(-0.030, 0.214, 0.172);
  const clearLensL = createRoundedVoxelBox(0.078, 0.044, 0.006, glassesLensMat, 'Glasses_Clear_Lens_L', false);
  clearLensL.position.set(-0.074, 0.214, 0.170);

  const rimTopR = createRoundedVoxelBox(0.096, 0.013, 0.016, glassesFrameMat, 'Glasses_Rim_Top_R');
  rimTopR.position.set(0.074, 0.240, 0.172);
  const rimBottomR = createRoundedVoxelBox(0.096, 0.011, 0.015, glassesFrameMat, 'Glasses_Rim_Bottom_R');
  rimBottomR.position.set(0.074, 0.188, 0.172);
  const rimOuterR = createRoundedVoxelBox(0.013, 0.062, 0.016, glassesFrameMat, 'Glasses_Rim_Outer_R');
  rimOuterR.position.set(0.118, 0.214, 0.172);
  const rimInnerR = createRoundedVoxelBox(0.012, 0.058, 0.015, glassesFrameMat, 'Glasses_Rim_Inner_R');
  rimInnerR.position.set(0.030, 0.214, 0.172);
  const clearLensR = createRoundedVoxelBox(0.078, 0.044, 0.006, glassesLensMat, 'Glasses_Clear_Lens_R', false);
  clearLensR.position.set(0.074, 0.214, 0.170);

  const glassesBridge = createRoundedVoxelBox(0.048, 0.013, 0.016, glassesFrameMat, 'Glasses_Center_Bridge');
  glassesBridge.position.set(0, 0.228, 0.172);

  const templeArmL = createRoundedVoxelBox(0.014, 0.014, 0.19, glassesFrameMat, 'Glasses_Temple_Arm_L');
  templeArmL.position.set(-0.168, 0.228, 0.075);
  const templeArmR = createRoundedVoxelBox(0.014, 0.014, 0.19, glassesFrameMat, 'Glasses_Temple_Arm_R');
  templeArmR.position.set(0.168, 0.228, 0.075);

  glassesGroup.add(
    rimTopL,
    rimBottomL,
    rimOuterL,
    rimInnerL,
    clearLensL,
    rimTopR,
    rimBottomR,
    rimOuterR,
    rimInnerR,
    clearLensR,
    glassesBridge,
    templeArmL,
    templeArmR
  );

  // 8. MATURE LAYERED SHORT DARK-BROWN VOXEL HAIR WITH DISTINCT GRAY & SILVER HIGHLIGHTS (`Hair` group)
  const hairGroup = new THREE.Group();
  hairGroup.name = 'Hair';
  head.add(hairGroup);

  // Primary Dark-Brown Crown & Back Layers (Total height reaches exactly 1.725u: 0.72 + 0.06 + 0.51 + 0.395 + 0.04 = 1.725)
  const hairTopMain = createRoundedVoxelBox(0.344, 0.075, 0.324, hairDarkBrownMat, 'Hair_Crown_DarkBrown');
  hairTopMain.position.set(0, 0.378, -0.004);
  hairGroup.add(hairTopMain);

  const hairUpperCrest = createRoundedVoxelBox(0.28, 0.04, 0.26, hairDarkBrownMat, 'Hair_Crest_DarkBrown');
  hairUpperCrest.position.set(-0.015, 0.415, 0.01);
  hairGroup.add(hairUpperCrest);

  // Parted Executive Forehead Sweep (Dark Brown + Silver-Gray streak)
  const hairFrontSweep = createRoundedVoxelBox(0.24, 0.048, 0.075, hairDarkBrownMat, 'Hair_FrontSweep_DarkBrown');
  hairFrontSweep.position.set(-0.035, 0.352, 0.135);
  hairGroup.add(hairFrontSweep);

  const hairFrontSilverStreak = createRoundedVoxelBox(0.088, 0.046, 0.078, hairSilverMat, 'Hair_FrontStreak_SilverGray');
  hairFrontSilverStreak.position.set(0.105, 0.354, 0.136);
  hairGroup.add(hairFrontSilverStreak);

  // Back Hair Taper (Dark Brown + Medium Gray lower nape)
  const hairBackUpper = createRoundedVoxelBox(0.338, 0.21, 0.065, hairDarkBrownMat, 'Hair_Back_DarkBrown');
  hairBackUpper.position.set(0, 0.26, -0.145);
  hairGroup.add(hairBackUpper);

  const hairBackGrayNape = createRoundedVoxelBox(0.32, 0.075, 0.058, hairMedGrayMat, 'Hair_Back_GrayTaper');
  hairBackGrayNape.position.set(0, 0.135, -0.142);
  hairGroup.add(hairBackGrayNape);

  // Upper Side Hair Dark Brown
  const hairSideUpperL = createRoundedVoxelBox(0.036, 0.095, 0.27, hairDarkBrownMat, 'Hair_SideUpper_L');
  hairSideUpperL.position.set(-0.168, 0.315, -0.015);
  hairGroup.add(hairSideUpperL);

  const hairSideUpperR = createRoundedVoxelBox(0.036, 0.095, 0.27, hairDarkBrownMat, 'Hair_SideUpper_R');
  hairSideUpperR.position.set(0.168, 0.315, -0.015);
  hairGroup.add(hairSideUpperR);

  // Distinct Mature Gray & Silver Highlights at Left & Right Temples and Sideburns (visible from Front, 3/4, and Side views)
  const hairTempleGrayL = createRoundedVoxelBox(0.040, 0.078, 0.145, hairMedGrayMat, 'Hair_Temple_MediumGray_L');
  hairTempleGrayL.position.set(-0.170, 0.258, 0.042);
  hairGroup.add(hairTempleGrayL);

  const hairTempleSilverL = createRoundedVoxelBox(0.042, 0.055, 0.088, hairSilverMat, 'Hair_Sideburn_Silver_L');
  hairTempleSilverL.position.set(-0.171, 0.212, 0.078);
  hairGroup.add(hairTempleSilverL);

  const hairTempleGrayR = createRoundedVoxelBox(0.040, 0.078, 0.145, hairMedGrayMat, 'Hair_Temple_MediumGray_R');
  hairTempleGrayR.position.set(0.170, 0.258, 0.042);
  hairGroup.add(hairTempleGrayR);

  const hairTempleSilverR = createRoundedVoxelBox(0.042, 0.055, 0.088, hairSilverMat, 'Hair_Sideburn_Silver_R');
  hairTempleSilverR.position.set(0.171, 0.212, 0.078);
  hairGroup.add(hairTempleSilverR);

  // Subtle Upper Crown Gray Highlight Voxel Clusters
  const hairCrownGrayClusterL = createRoundedVoxelBox(0.068, 0.032, 0.14, hairMedGrayMat, 'Hair_CrownCluster_Gray_L');
  hairCrownGrayClusterL.position.set(-0.125, 0.405, 0.02);
  hairGroup.add(hairCrownGrayClusterL);

  const hairCrownGrayClusterR = createRoundedVoxelBox(0.068, 0.032, 0.14, hairSilverMat, 'Hair_CrownCluster_Silver_R');
  hairCrownGrayClusterR.position.set(0.118, 0.405, 0.03);
  hairGroup.add(hairCrownGrayClusterR);

  const clips = buildCEOExecutiveAnimationClips();

  return {
    characterRoot,
    pivots: {
      hips,
      torso,
      head,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      glassesGroup,
      idBadgeGroup,
      leftEyebrow,
      rightEyebrow,
      leftPupil,
      rightPupil,
      mouthMesh,
      props: {
        report_binder: reportBinderProp,
        executive_tablet: executiveTabletProp,
        smartphone: smartphoneProp,
        coffee_cup: coffeeCupProp,
      },
    },
    clips,
  };
}

function qFromEuler(rx: number, ry: number, rz: number): number[] {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'XYZ'));
  return [q.x, q.y, q.z, q.w];
}

function makeQuatTrack(nodeName: string, times: number[], eulers: Array<[number, number, number]>): THREE.QuaternionKeyframeTrack {
  const values: number[] = [];
  for (const [rx, ry, rz] of eulers) {
    values.push(...qFromEuler(rx, ry, rz));
  }
  return new THREE.QuaternionKeyframeTrack(`${nodeName}.quaternion`, times, values);
}

function makePosTrack(nodeName: string, times: number[], positions: Array<[number, number, number]>): THREE.VectorKeyframeTrack {
  const values: number[] = [];
  for (const [px, py, pz] of positions) {
    values.push(px, py, pz);
  }
  return new THREE.VectorKeyframeTrack(`${nodeName}.position`, times, values);
}

/**
 * Generates the 14 embedded THREE.AnimationClips for `ceo_executive_assistant.glb` and live runtime playback.
 */
export function buildCEOExecutiveAnimationClips(): THREE.AnimationClip[] {
  const clips: THREE.AnimationClip[] = [];

  // 1. Idle_Breathing (Calm executive breathing, subtle posture poise)
  clips.push(
    new THREE.AnimationClip('Idle_Breathing', 3.2, [
      makePosTrack('Hips', [0, 1.6, 3.2], [
        [0, 0.72, 0],
        [0, 0.726, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.6, 3.2], [
        [0.015, 0, 0],
        [-0.015, 0.03, 0],
        [0.015, 0, 0],
      ]),
      makeQuatTrack('Head', [0, 1.0, 2.2, 3.2], [
        [0, 0, 0],
        [0.025, 0.08, 0],
        [-0.015, -0.06, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.6, 3.2], [
        [0.03, 0, 0.04],
        [-0.02, 0, 0.055],
        [0.03, 0, 0.04],
      ]),
      makeQuatTrack('RightArm', [0, 1.6, 3.2], [
        [-0.02, 0, -0.04],
        [0.03, 0, -0.055],
        [-0.02, 0, -0.04],
      ]),
      makeQuatTrack('LeftLeg', [0, 3.2], [[0, 0, 0], [0, 0, 0]]),
      makeQuatTrack('RightLeg', [0, 3.2], [[0, 0, 0], [0, 0, 0]]),
    ])
  );

  // 2. Walk_Cycle (Confident, composed executive stride)
  clips.push(
    new THREE.AnimationClip('Walk_Cycle', 0.96, [
      makePosTrack('Hips', [0, 0.24, 0.48, 0.72, 0.96], [
        [0, 0.72, 0],
        [0, 0.742, 0],
        [0, 0.72, 0],
        [0, 0.742, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 0.24, 0.48, 0.72, 0.96], [
        [0.04, -0.05, 0],
        [0.05, 0, 0.015],
        [0.04, 0.05, 0],
        [0.05, 0, -0.015],
        [0.04, -0.05, 0],
      ]),
      makeQuatTrack('Head', [0, 0.48, 0.96], [
        [0, 0.03, 0],
        [0, -0.03, 0],
        [0, 0.03, 0],
      ]),
      makeQuatTrack('LeftLeg', [0, 0.24, 0.48, 0.72, 0.96], [
        [0.44, 0, 0],
        [0, 0, 0],
        [-0.44, 0, 0],
        [0, 0, 0],
        [0.44, 0, 0],
      ]),
      makeQuatTrack('RightLeg', [0, 0.24, 0.48, 0.72, 0.96], [
        [-0.44, 0, 0],
        [0, 0, 0],
        [0.44, 0, 0],
        [0, 0, 0],
        [-0.44, 0, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 0.24, 0.48, 0.72, 0.96], [
        [-0.34, 0, 0.04],
        [0, 0, 0.04],
        [0.34, 0, 0.04],
        [0, 0, 0.04],
        [-0.34, 0, 0.04],
      ]),
      makeQuatTrack('RightArm', [0, 0.24, 0.48, 0.72, 0.96], [
        [0.34, 0, -0.04],
        [0, 0, -0.04],
        [-0.34, 0, -0.04],
        [0, 0, -0.04],
        [0.34, 0, -0.04],
      ]),
    ])
  );

  // 3. Work_Desk (Seated at executive desk facing dual monitors, keyboard typing + dual-screen gaze)
  clips.push(
    new THREE.AnimationClip('Work_Desk', 2.0, [
      makePosTrack('Hips', [0, 1.0, 2.0], [
        [0, 0.56, -0.04],
        [0, 0.565, -0.04],
        [0, 0.56, -0.04],
      ]),
      makeQuatTrack('LeftLeg', [0, 2.0], [[-1.18, 0, 0], [-1.18, 0, 0]]),
      makeQuatTrack('RightLeg', [0, 2.0], [[-1.18, 0, 0], [-1.18, 0, 0]]),
      makeQuatTrack('Torso', [0, 1.0, 2.0], [
        [0.10, -0.03, 0],
        [0.12, 0.03, 0],
        [0.10, -0.03, 0],
      ]),
      makeQuatTrack('Head', [0, 0.65, 1.35, 2.0], [
        [0.06, -0.14, 0],
        [0.04, 0.14, 0],
        [0.08, -0.06, 0],
        [0.06, -0.14, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0], [
        [-1.02, 0.15, 0.05],
        [-0.92, 0.15, 0.05],
        [-1.04, 0.12, 0.05],
        [-0.94, 0.16, 0.05],
        [-1.02, 0.15, 0.05],
        [-0.93, 0.14, 0.05],
        [-1.05, 0.15, 0.05],
        [-0.95, 0.13, 0.05],
        [-1.02, 0.15, 0.05],
      ]),
      makeQuatTrack('RightArm', [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0], [
        [-0.94, -0.15, -0.05],
        [-1.04, -0.15, -0.05],
        [-0.92, -0.12, -0.05],
        [-1.02, -0.18, -0.05],
        [-0.94, -0.15, -0.05],
        [-1.05, -0.14, -0.05],
        [-0.93, -0.15, -0.05],
        [-1.03, -0.13, -0.05],
        [-0.94, -0.15, -0.05],
      ]),
    ])
  );

  // 4. Review_PM_Report (Holding report binder in left hand, turning/inspecting pages with right hand, nodding)
  clips.push(
    new THREE.AnimationClip('Review_PM_Report', 3.0, [
      makePosTrack('Hips', [0, 1.5, 3.0], [
        [0, 0.72, 0],
        [0, 0.725, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.5, 3.0], [
        [0.06, -0.04, 0],
        [0.08, 0.04, 0],
        [0.06, -0.04, 0],
      ]),
      makeQuatTrack('Head', [0, 0.8, 1.6, 2.3, 3.0], [
        [0.24, -0.08, 0],
        [0.30, -0.04, 0],
        [0.20, 0.06, 0],
        [0.28, -0.05, 0],
        [0.24, -0.08, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.5, 3.0], [
        [-0.92, 0.28, 0.10],
        [-0.88, 0.24, 0.10],
        [-0.92, 0.28, 0.10],
      ]),
      makeQuatTrack('RightArm', [0, 0.9, 1.8, 3.0], [
        [-0.65, -0.22, -0.08],
        [-0.95, -0.32, -0.12],
        [-0.72, -0.18, -0.08],
        [-0.65, -0.22, -0.08],
      ]),
    ])
  );

  // 5. Analyze_Executive_Brain (Standing before the Executive Brain Wall, scanning KPIs, holding tablet & pointing)
  clips.push(
    new THREE.AnimationClip('Analyze_Executive_Brain', 3.2, [
      makePosTrack('Hips', [0, 1.6, 3.2], [
        [0, 0.72, 0],
        [0, 0.726, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.1, 2.2, 3.2], [
        [-0.03, -0.12, 0],
        [-0.04, 0.12, 0],
        [-0.02, -0.04, 0],
        [-0.03, -0.12, 0],
      ]),
      makeQuatTrack('Head', [0, 1.0, 2.0, 3.2], [
        [-0.14, -0.20, 0],
        [-0.16, 0.20, 0],
        [0.12, -0.08, 0],
        [-0.14, -0.20, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.6, 3.2], [
        [-0.78, 0.22, 0.08],
        [-0.84, 0.26, 0.08],
        [-0.78, 0.22, 0.08],
      ]),
      makeQuatTrack('RightArm', [0, 1.0, 2.0, 3.2], [
        [-1.18, -0.10, -0.12],
        [-1.34, 0.16, -0.18],
        [-0.82, -0.20, -0.08],
        [-1.18, -0.10, -0.12],
      ]),
    ])
  );

  // 6. Discuss_With_PM (Executive hand gestures, attentive nods, open collaborative stance)
  clips.push(
    new THREE.AnimationClip('Discuss_With_PM', 2.8, [
      makePosTrack('Hips', [0, 1.4, 2.8], [
        [0, 0.72, 0],
        [0, 0.728, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 0.9, 1.9, 2.8], [
        [0.03, -0.10, 0],
        [0.05, 0.10, 0],
        [0.02, -0.04, 0],
        [0.03, -0.10, 0],
      ]),
      makeQuatTrack('Head', [0, 0.7, 1.4, 2.1, 2.8], [
        [0.05, -0.12, 0],
        [-0.06, 0.08, 0.03],
        [0.09, 0.12, 0],
        [-0.04, -0.06, -0.03],
        [0.05, -0.12, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 0.9, 1.9, 2.8], [
        [-0.64, 0.18, 0.14],
        [-0.92, -0.08, 0.24],
        [-0.52, 0.12, 0.10],
        [-0.64, 0.18, 0.14],
      ]),
      makeQuatTrack('RightArm', [0, 0.9, 1.9, 2.8], [
        [-0.78, -0.14, -0.14],
        [-0.48, -0.08, -0.10],
        [-0.96, 0.12, -0.24],
        [-0.78, -0.14, -0.14],
      ]),
    ])
  );

  // 7. Present_Strategy (Authoritative presentation gesture toward Executive Brain & audience)
  clips.push(
    new THREE.AnimationClip('Present_Strategy', 3.0, [
      makePosTrack('Hips', [0, 1.5, 3.0], [
        [0, 0.72, 0],
        [0, 0.73, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.0, 2.0, 3.0], [
        [-0.02, -0.16, 0],
        [-0.04, 0.14, 0],
        [-0.02, 0.04, 0],
        [-0.02, -0.16, 0],
      ]),
      makeQuatTrack('Head', [0, 1.0, 2.0, 3.0], [
        [-0.05, -0.18, 0],
        [-0.08, 0.16, 0],
        [0.04, 0.04, 0],
        [-0.05, -0.18, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.5, 3.0], [
        [-0.76, 0.24, 0.08],
        [-0.82, 0.20, 0.08],
        [-0.76, 0.24, 0.08],
      ]),
      makeQuatTrack('RightArm', [0, 1.0, 2.0, 3.0], [
        [-1.32, -0.22, -0.26],
        [-1.48, 0.12, -0.36],
        [-0.92, -0.14, -0.16],
        [-1.32, -0.22, -0.26],
      ]),
    ])
  );

  // 8. Think_Strategy (Hand to chin contemplation, left arm folded across waist, slow thoughtful head tilt)
  clips.push(
    new THREE.AnimationClip('Think_Strategy', 3.4, [
      makePosTrack('Hips', [0, 1.7, 3.4], [
        [0, 0.72, 0],
        [0, 0.724, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.7, 3.4], [
        [0.04, -0.06, 0],
        [0.02, 0.06, 0],
        [0.04, -0.06, 0],
      ]),
      makeQuatTrack('Head', [0, 1.1, 2.3, 3.4], [
        [0.12, -0.10, 0.05],
        [0.06, 0.08, -0.04],
        [0.15, -0.04, 0.06],
        [0.12, -0.10, 0.05],
      ]),
      makeQuatTrack('LeftArm', [0, 1.7, 3.4], [
        [-0.58, 0.52, 0.18],
        [-0.62, 0.54, 0.18],
        [-0.58, 0.52, 0.18],
      ]),
      makeQuatTrack('RightArm', [0, 1.7, 3.4], [
        [-1.38, -0.36, -0.14],
        [-1.44, -0.32, -0.12],
        [-1.38, -0.36, -0.14],
      ]),
    ])
  );

  // 9. Phone_Call (Right hand holding smartphone to ear, left hand expressive executive emphasis)
  clips.push(
    new THREE.AnimationClip('Phone_Call', 2.8, [
      makePosTrack('Hips', [0, 1.4, 2.8], [
        [0, 0.72, 0],
        [0, 0.726, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.4, 2.8], [
        [0.02, -0.08, 0],
        [-0.02, 0.08, 0],
        [0.02, -0.08, 0],
      ]),
      makeQuatTrack('Head', [0, 0.9, 1.9, 2.8], [
        [0.04, -0.06, 0.05],
        [-0.03, 0.06, 0.06],
        [0.06, -0.02, 0.04],
        [0.04, -0.06, 0.05],
      ]),
      makeQuatTrack('RightArm', [0, 1.4, 2.8], [
        [-1.56, -0.38, -0.22],
        [-1.60, -0.35, -0.20],
        [-1.56, -0.38, -0.22],
      ]),
      makeQuatTrack('LeftArm', [0, 0.9, 1.9, 2.8], [
        [-0.36, 0.12, 0.10],
        [-0.68, 0.20, 0.18],
        [-0.28, 0.08, 0.08],
        [-0.36, 0.12, 0.10],
      ]),
    ])
  );

  // 10. Coffee_Break (Relaxed executive posture by panoramic window, lifting coffee mug to sip)
  clips.push(
    new THREE.AnimationClip('Coffee_Break', 3.6, [
      makePosTrack('Hips', [0, 1.8, 3.6], [
        [0, 0.72, 0],
        [0, 0.725, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.2, 2.4, 3.6], [
        [0, 0.03, 0],
        [-0.04, 0, 0],
        [0.02, -0.03, 0],
        [0, 0.03, 0],
      ]),
      makeQuatTrack('Head', [0, 1.1, 2.0, 2.8, 3.6], [
        [0, 0.08, 0],
        [-0.16, 0, 0],
        [-0.14, 0, 0],
        [0.04, -0.06, 0],
        [0, 0.08, 0],
      ]),
      makeQuatTrack('RightArm', [0, 1.1, 2.0, 2.8, 3.6], [
        [-0.68, -0.22, -0.08],
        [-1.38, -0.34, -0.14],
        [-1.36, -0.34, -0.14],
        [-0.72, -0.22, -0.08],
        [-0.68, -0.22, -0.08],
      ]),
      makeQuatTrack('LeftArm', [0, 1.8, 3.6], [
        [0.05, 0, 0.06],
        [-0.04, 0, 0.08],
        [0.05, 0, 0.06],
      ]),
    ])
  );

  // 11. Waiting_Owner_Approval (Attentive executive standby posture, holding tablet, glancing for owner sign-off)
  clips.push(
    new THREE.AnimationClip('Waiting_Owner_Approval', 3.2, [
      makePosTrack('Hips', [0, 1.6, 3.2], [
        [0, 0.72, 0],
        [0, 0.725, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.6, 3.2], [
        [0.03, -0.05, 0],
        [0.02, 0.05, 0],
        [0.03, -0.05, 0],
      ]),
      makeQuatTrack('Head', [0, 1.0, 2.1, 3.2], [
        [0.08, -0.12, 0],
        [0.16, 0.04, 0],
        [0.04, 0.12, 0],
        [0.08, -0.12, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.6, 3.2], [
        [-0.82, 0.28, 0.10],
        [-0.86, 0.25, 0.10],
        [-0.82, 0.28, 0.10],
      ]),
      makeQuatTrack('RightArm', [0, 1.6, 3.2], [
        [-0.58, -0.36, -0.10],
        [-0.64, -0.32, -0.10],
        [-0.58, -0.36, -0.10],
      ]),
    ])
  );

  // 12. Prepare_Executive_Digest (Compiling daily summary on executive tablet, rapid stylus/touch interaction)
  clips.push(
    new THREE.AnimationClip('Prepare_Executive_Digest', 2.4, [
      makePosTrack('Hips', [0, 1.2, 2.4], [
        [0, 0.72, 0],
        [0, 0.726, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.2, 2.4], [
        [0.08, -0.03, 0],
        [0.10, 0.03, 0],
        [0.08, -0.03, 0],
      ]),
      makeQuatTrack('Head', [0, 0.8, 1.6, 2.4], [
        [0.24, -0.06, 0],
        [0.28, 0.06, 0],
        [0.22, 0, 0],
        [0.24, -0.06, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.2, 2.4], [
        [-0.96, 0.30, 0.12],
        [-0.92, 0.28, 0.12],
        [-0.96, 0.30, 0.12],
      ]),
      makeQuatTrack('RightArm', [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4], [
        [-0.92, -0.26, -0.08],
        [-1.06, -0.34, -0.12],
        [-0.88, -0.22, -0.08],
        [-1.08, -0.30, -0.10],
        [-0.90, -0.24, -0.08],
        [-1.04, -0.32, -0.12],
        [-0.92, -0.26, -0.08],
      ]),
    ])
  );

  // 13. Send_Report_Demo (Visual-only simulated report dispatch: inspect tablet -> upward dispatch swipe -> affirmative nod)
  clips.push(
    new THREE.AnimationClip('Send_Report_Demo', 2.6, [
      makePosTrack('Hips', [0, 1.0, 1.8, 2.6], [
        [0, 0.72, 0],
        [0, 0.734, 0],
        [0, 0.724, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.0, 1.8, 2.6], [
        [0.06, 0, 0],
        [-0.04, 0.04, 0],
        [0.02, 0, 0],
        [0.06, 0, 0],
      ]),
      makeQuatTrack('Head', [0, 0.8, 1.5, 2.1, 2.6], [
        [0.20, 0, 0],
        [-0.10, 0.04, 0],
        [0.12, 0, 0],
        [-0.02, 0, 0],
        [0.20, 0, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.3, 2.6], [
        [-0.92, 0.26, 0.10],
        [-0.84, 0.22, 0.10],
        [-0.92, 0.26, 0.10],
      ]),
      makeQuatTrack('RightArm', [0, 0.7, 1.3, 2.0, 2.6], [
        [-0.92, -0.28, -0.10],
        [-1.52, -0.08, -0.20],
        [-1.36, -0.12, -0.16],
        [-0.78, -0.22, -0.10],
        [-0.92, -0.28, -0.10],
      ]),
    ])
  );

  // 14. Task_Completed (Subtle composed executive celebration: confident nod + crisp right-arm salute/affirmation)
  clips.push(
    new THREE.AnimationClip('Task_Completed', 2.4, [
      makePosTrack('Hips', [0, 0.6, 1.2, 1.8, 2.4], [
        [0, 0.72, 0],
        [0, 0.745, 0],
        [0, 0.72, 0],
        [0, 0.735, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 0.8, 1.6, 2.4], [
        [0, 0, 0],
        [-0.05, 0.06, 0],
        [-0.03, -0.05, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('Head', [0, 0.6, 1.2, 1.8, 2.4], [
        [0, 0, 0],
        [0.14, 0.04, 0],
        [-0.06, 0, 0],
        [0.10, -0.04, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.2, 2.4], [
        [-0.22, 0.12, 0.12],
        [-0.45, 0.16, 0.18],
        [-0.22, 0.12, 0.12],
      ]),
      makeQuatTrack('RightArm', [0, 0.7, 1.5, 2.4], [
        [-0.30, -0.10, -0.12],
        [-1.58, -0.14, -0.24],
        [-1.44, -0.12, -0.20],
        [-0.30, -0.10, -0.12],
      ]),
    ])
  );

  return clips;
}

function applyFacialExpressionToMeshes(
  pivots: CEORuntimeInstance['pivots'],
  expr: CEOExpressionDefinition,
  elapsedSeconds = 0,
  isTalkingState = false
): void {
  const { leftEyebrow, rightEyebrow, mouthMesh } = pivots;
  leftEyebrow.position.y = 0.256 + expr.eyebrowOffsetY;
  rightEyebrow.position.y = 0.256 + expr.eyebrowOffsetY;
  leftEyebrow.rotation.z = expr.eyebrowTiltRad;
  rightEyebrow.rotation.z = -expr.eyebrowTiltRad;

  const talkPulse = isTalkingState ? Math.abs(Math.sin(elapsedSeconds * 9.5)) * 0.65 : 0;
  mouthMesh.scale.set(expr.mouthScaleX, expr.mouthScaleY + talkPulse, 1);
  mouthMesh.position.y = 0.125 + expr.mouthOffsetY;
}

/**
 * Exports a clean, standalone binary GLB buffer of the CEO Executive Assistant character
 * with all 14 AnimationClips embedded, in canonical rest pose at origin (0,0,0),
 * with eyeglasses visible, neutral expression, and handheld props hidden.
 */
export async function exportCEOExecutiveAssistantToGLBBuffer(): Promise<ArrayBuffer> {
  const { characterRoot, clips, pivots } = buildCEOExecutiveAssistantSceneAndClips();
  characterRoot.position.set(0, 0, 0);
  characterRoot.rotation.set(0, 0, 0);
  characterRoot.scale.set(1, 1, 1);

  // Canonical rest pose for export: glasses visible, neutral expression, handheld props hidden
  pivots.glassesGroup.visible = true;
  applyFacialExpressionToMeshes(pivots, getCEOExpressionDef('neutral'), 0, false);
  pivots.props.report_binder.visible = false;
  pivots.props.executive_tablet.visible = false;
  pivots.props.smartphone.visible = false;
  pivots.props.coffee_cup.visible = false;
  characterRoot.updateMatrixWorld(true);

  const exportScene = new THREE.Scene();
  exportScene.name = 'AI_Office_CEO_Executive_Assistant_Export_Scene';
  exportScene.add(characterRoot);

  const exporter = new GLTFExporter();
  return new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      exportScene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(new Error('Expected binary ArrayBuffer from GLTFExporter for CEO character'));
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

function normalizeAngleDiff(targetRad: number, currentRad: number): number {
  let diff = targetRad - currentRad;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

const WALK_SPEED_MPS = 1.92;
const TURN_SPEED_RAD_PER_SEC = 10.5;

/**
 * Creates the live runtime CEO Executive Assistant agent instance with AnimationMixer,
 * 14 executive actions, waypoint navigation, 9-step auto-demo sequence, 7 facial expressions,
 * eyeglasses toggle, and contextual props.
 */
export function createCEOExecutiveAssistantRuntime(): CEORuntimeInstance {
  const rootGroup = new THREE.Group();
  rootGroup.name = CEO_CHARACTER_CONSTANTS.RUNTIME_ROOT_NAME;

  const navigationRoot = new THREE.Group();
  navigationRoot.name = 'CEO_NavigationRoot';
  rootGroup.add(navigationRoot);

  const orientationRoot = new THREE.Group();
  orientationRoot.name = 'CEO_OrientationRoot';
  navigationRoot.add(orientationRoot);

  const modelRoot = new THREE.Group();
  modelRoot.name = 'CEO_ModelRoot';
  orientationRoot.add(modelRoot);

  // Subtle emerald selection ring at floor level
  const ringGeom = new THREE.RingGeometry(0.28, 0.36, 32);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    name: 'CEO_SelectionRing_Mat',
    color: 0x10b981,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const selectionRing = new THREE.Mesh(ringGeom, ringMat);
  selectionRing.name = 'CEO_Selection_Ring';
  selectionRing.position.set(0, 0.009, 0);
  navigationRoot.add(selectionRing);

  // Overhead runtime status sprite
  const { sprite: statusLabelSprite, updateText: updateSpriteText } = createCEOStatusSprite();
  navigationRoot.add(statusLabelSprite);

  // Build procedural voxel character + 14 clips
  const { characterRoot: characterVisualRoot, pivots, clips } = buildCEOExecutiveAssistantSceneAndClips();
  modelRoot.add(characterVisualRoot);

  let characterPolyCount = 0;
  characterVisualRoot.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const geom = (obj as THREE.Mesh).geometry;
      if (geom) {
        characterPolyCount += geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3;
      }
    }
  });

  // Setup AnimationMixer
  const mixer = new THREE.AnimationMixer(characterVisualRoot);
  const actionsMap = new Map<string, THREE.AnimationAction>();
  for (const clip of clips) {
    const action = mixer.clipAction(clip);
    actionsMap.set(clip.name, action);
  }

  // Spawn at default anchor `CEO_ROOM_IDLE`
  const defaultAnchor = DEFAULT_CEO_ANCHORS.CEO_ROOM_IDLE;
  navigationRoot.position.set(defaultAnchor.position[0], 0, defaultAnchor.position[2]);
  orientationRoot.rotation.y = defaultAnchor.facingRad;

  let currentState: CEOAgentStateId = 'IDLE';
  let activeActionId: CEOActionId = 'idle';
  let currentClipName = 'Idle_Breathing';
  let currentAnchorId: CEOAnchorId = 'CEO_ROOM_IDLE';
  let targetAnchorId: CEOAnchorId = 'CEO_ROOM_IDLE';
  let currentExpressionId: CEOExpressionId = 'neutral';
  let glassesVisible = true;
  let activePropId: CEOHandheldPropId = 'none';

  let speedMultiplier: 0.5 | 1 | 1.5 = 1;
  let isPaused = false;
  let isPatrolling = false;
  let patrolIndex = 0;
  let patrolDwellTimer = 0;

  let isAutoDemoRunning = false;
  let autoDemoStepIndex = 0;
  let autoDemoStepTimer = 0;

  let pathQueue: Array<[number, number]> = [];
  let pendingArrivalActionId: CEOActionId | null = null;
  let targetFacingYaw = defaultAnchor.facingRad;

  let activeMixerAction: THREE.AnimationAction | null = null;

  function setActiveProp(propId: CEOHandheldPropId) {
    activePropId = propId;
    pivots.props.report_binder.visible = propId === 'report_binder';
    pivots.props.executive_tablet.visible = propId === 'executive_tablet';
    pivots.props.smartphone.visible = propId === 'smartphone';
    pivots.props.coffee_cup.visible = propId === 'coffee_cup';
  }

  function playClip(clipName: string, fadeSeconds = 0.22) {
    currentClipName = clipName;
    const nextAction = actionsMap.get(clipName);
    if (!nextAction) return;

    if (activeMixerAction !== nextAction) {
      nextAction.reset();
      nextAction.setEffectiveTimeScale(1);
      nextAction.setEffectiveWeight(1);
      nextAction.play();
      if (activeMixerAction) {
        activeMixerAction.crossFadeTo(nextAction, fadeSeconds, false);
      }
      activeMixerAction = nextAction;
    }
  }

  function applyActionStateImmediately(actionId: CEOActionId) {
    const spec = getCEOActionDef(actionId);
    activeActionId = spec.id;
    currentState = spec.targetState;
    const resolvedAnchorId: CEOAnchorId = spec.targetAnchorId || currentAnchorId || 'CEO_ROOM_IDLE';
    currentAnchorId = resolvedAnchorId;
    targetAnchorId = resolvedAnchorId;
    const anchor = DEFAULT_CEO_ANCHORS[resolvedAnchorId];
    targetFacingYaw = anchor.facingRad;

    currentExpressionId = spec.defaultExpression;
    applyFacialExpressionToMeshes(pivots, getCEOExpressionDef(currentExpressionId), 0, false);
    setActiveProp(spec.handheldProp);
    playClip(spec.clipName);
    updateSpriteText(spec.labelId.toUpperCase(), spec.statusBadgeText);
  }

  // Initialize default idle state
  applyActionStateImmediately('idle');

  function triggerAction(actionId: CEOActionId, immediateTeleport = false) {
    const spec = getCEOActionDef(actionId);
    activeActionId = spec.id;

    if (spec.id === 'walk_patrol') {
      const nextAnchorId =
        CEO_PATROL_ANCHOR_SEQUENCE[(patrolIndex + 1) % CEO_PATROL_ANCHOR_SEQUENCE.length];
      patrolIndex = (patrolIndex + 1) % CEO_PATROL_ANCHOR_SEQUENCE.length;
      walkToAnchor(nextAnchorId, 'idle');
      activeActionId = 'walk_patrol';
      currentState = 'MOVING';
      currentExpressionId = 'confident';
      setActiveProp('none');
      updateSpriteText('BERJALAN', 'NAVIGASI');
      return;
    }

    const resolvedAnchorId: CEOAnchorId = spec.targetAnchorId || currentAnchorId || 'CEO_ROOM_IDLE';
    targetAnchorId = resolvedAnchorId;
    const destAnchor = DEFAULT_CEO_ANCHORS[resolvedAnchorId];

    const curX = navigationRoot.position.x;
    const curZ = navigationRoot.position.z;
    const dist = Math.hypot(destAnchor.position[0] - curX, destAnchor.position[2] - curZ);

    if (immediateTeleport || !spec.requiresWalk || dist <= 0.14) {
      pathQueue = [];
      pendingArrivalActionId = null;
      if (spec.targetAnchorId) {
        navigationRoot.position.set(destAnchor.position[0], 0, destAnchor.position[2]);
        orientationRoot.rotation.y = destAnchor.facingRad;
        targetFacingYaw = destAnchor.facingRad;
      }
      applyActionStateImmediately(spec.id);
      return;
    }

    // Route smoothly along collision-free waypoints (including behind-desk approach)
    const waypoints = findCEOWalkablePath(
      [curX, curZ],
      [destAnchor.position[0], destAnchor.position[2]]
    );
    pathQueue = waypoints;
    pendingArrivalActionId = spec.id;
    currentState = 'MOVING';
    currentExpressionId = 'focused';
    setActiveProp('none');
    playClip('Walk_Cycle', 0.18);
    updateSpriteText(`MENUJU ${spec.labelId.toUpperCase()}`, spec.statusBadgeText);
  }

  function walkToAnchor(anchorId: CEOAnchorId, followUpActionId: CEOActionId = 'idle') {
    const dest = DEFAULT_CEO_ANCHORS[anchorId];
    if (!dest) return;
    targetAnchorId = anchorId;
    const waypoints = findCEOWalkablePath(
      [navigationRoot.position.x, navigationRoot.position.z],
      [dest.position[0], dest.position[2]]
    );
    pathQueue = waypoints;
    pendingArrivalActionId = followUpActionId;
    currentState = 'MOVING';
    playClip('Walk_Cycle', 0.18);
    updateSpriteText(`JALAN KE ${dest.label.toUpperCase()}`, 'NAVIGASI');
  }

  function walkToWorldPoint(x: number, z: number): boolean {
    const waypoints = findCEOWalkablePath(
      [navigationRoot.position.x, navigationRoot.position.z],
      [x, z]
    );
    if (waypoints.length === 0) return false;
    isPatrolling = false;
    isAutoDemoRunning = false;
    pathQueue = waypoints;
    pendingArrivalActionId = 'idle';
    activeActionId = 'walk_patrol';
    currentState = 'MOVING';
    setActiveProp('none');
    playClip('Walk_Cycle', 0.18);
    updateSpriteText('JALAN MANUAL', 'NAVIGASI');
    return true;
  }

  function executePlayback(cmd: CEOPlaybackCommand) {
    if (cmd === 'pause') {
      isPaused = true;
    } else if (cmd === 'play' || cmd === 'resume') {
      isPaused = false;
    } else if (cmd === 'stop') {
      isPaused = false;
      isPatrolling = false;
      isAutoDemoRunning = false;
      pathQueue = [];
      pendingArrivalActionId = null;
      applyActionStateImmediately('idle');
    } else if (cmd === 'reset_pose') {
      isPaused = false;
      pathQueue = [];
      pendingArrivalActionId = null;
      applyActionStateImmediately('idle');
    } else if (cmd === 'reset_position') {
      isPaused = false;
      isPatrolling = false;
      isAutoDemoRunning = false;
      pathQueue = [];
      pendingArrivalActionId = null;
      const idleAnchor = DEFAULT_CEO_ANCHORS.CEO_ROOM_IDLE;
      navigationRoot.position.set(idleAnchor.position[0], 0, idleAnchor.position[2]);
      orientationRoot.rotation.y = idleAnchor.facingRad;
      targetFacingYaw = idleAnchor.facingRad;
      applyActionStateImmediately('idle');
    }
  }

  function setSpeedMultiplier(speed: number) {
    if (speed <= 0.6) speedMultiplier = 0.5;
    else if (speed >= 1.3) speedMultiplier = 1.5;
    else speedMultiplier = 1;
  }

  function setPatrolEnabled(enabled: boolean) {
    isPatrolling = enabled;
    if (enabled) {
      isAutoDemoRunning = false;
      patrolDwellTimer = 0.2;
    }
  }

  function startAutoDemoSequence() {
    isPatrolling = false;
    isPaused = false;
    isAutoDemoRunning = true;
    autoDemoStepIndex = 0;
    const firstStep = CEO_AUTO_DEMO_SEQUENCE[0];
    autoDemoStepTimer = firstStep.durationSeconds;
    triggerAction(firstStep.actionId, false);
  }

  function stopAutoDemoSequence() {
    isAutoDemoRunning = false;
  }

  function setExpression(expressionId: CEOExpressionId) {
    currentExpressionId = expressionId;
    applyFacialExpressionToMeshes(pivots, getCEOExpressionDef(expressionId), 0, false);
  }

  function setGlassesVisible(visible: boolean) {
    glassesVisible = visible;
    pivots.glassesGroup.visible = visible;
  }

  function setStatusLabelVisible(visible: boolean) {
    statusLabelSprite.visible = visible;
  }

  function update(deltaSeconds: number, elapsedSeconds: number) {
    // Subtle pulse on selection ring
    const ringScale = 1 + Math.sin(elapsedSeconds * 3.0) * 0.04;
    selectionRing.scale.set(ringScale, 1, ringScale);

    if (isPaused) return;

    const scaledDelta = deltaSeconds * speedMultiplier;
    mixer.update(scaledDelta);

    // Expressive face & subtle pupil life
    const isTalkingState =
      currentState === 'DISCUSSING' ||
      currentState === 'PRESENTING' ||
      currentState === 'PHONE_CALL' ||
      currentState === 'SENDING_REPORT_DEMO';
    applyFacialExpressionToMeshes(
      pivots,
      getCEOExpressionDef(currentExpressionId),
      elapsedSeconds,
      isTalkingState
    );

    // Handle active path walking
    if (pathQueue.length > 0) {
      const targetPt = pathQueue[0];
      const dx = targetPt[0] - navigationRoot.position.x;
      const dz = targetPt[1] - navigationRoot.position.z;
      const dist = Math.hypot(dx, dz);

      const moveStep = WALK_SPEED_MPS * scaledDelta;
      if (dist > 0.005) {
        const desiredYaw = Math.atan2(dx, dz);
        const yawDiff = normalizeAngleDiff(desiredYaw, orientationRoot.rotation.y);
        orientationRoot.rotation.y +=
          yawDiff * Math.min(1, TURN_SPEED_RAD_PER_SEC * scaledDelta);
      }

      if (dist <= moveStep) {
        navigationRoot.position.set(targetPt[0], 0, targetPt[1]);
        pathQueue.shift();

        if (pathQueue.length === 0) {
          // Arrived at destination anchor
          if (pendingArrivalActionId) {
            const arrivedAction = pendingArrivalActionId;
            pendingArrivalActionId = null;
            applyActionStateImmediately(arrivedAction);
          } else {
            applyActionStateImmediately('idle');
          }
        }
      } else {
        navigationRoot.position.x += (dx / dist) * moveStep;
        navigationRoot.position.z += (dz / dist) * moveStep;
      }
    } else {
      // Smoothly align orientation to target anchor yaw when stationary
      const yawDiff = normalizeAngleDiff(targetFacingYaw, orientationRoot.rotation.y);
      if (Math.abs(yawDiff) > 0.004) {
        orientationRoot.rotation.y +=
          yawDiff * Math.min(1, TURN_SPEED_RAD_PER_SEC * scaledDelta);
      }

      // Advance Auto-Demo sequence timer once arrived at current step's station
      if (isAutoDemoRunning) {
        autoDemoStepTimer -= scaledDelta;
        if (autoDemoStepTimer <= 0) {
          autoDemoStepIndex = (autoDemoStepIndex + 1) % CEO_AUTO_DEMO_SEQUENCE.length;
          const nextStep = CEO_AUTO_DEMO_SEQUENCE[autoDemoStepIndex];
          autoDemoStepTimer = nextStep.durationSeconds;
          triggerAction(nextStep.actionId, false);
        }
      } else if (isPatrolling) {
        patrolDwellTimer -= scaledDelta;
        if (patrolDwellTimer <= 0) {
          patrolIndex = (patrolIndex + 1) % CEO_PATROL_ANCHOR_SEQUENCE.length;
          const nextAnchorId = CEO_PATROL_ANCHOR_SEQUENCE[patrolIndex];
          patrolDwellTimer = 3.5;
          walkToAnchor(nextAnchorId, 'idle');
        }
      }
    }
  }

  function getStatus(): CEORuntimeStatus {
    const spec = getCEOActionDef(activeActionId);
    const pos: [number, number, number] = [
      Number(navigationRoot.position.x.toFixed(3)),
      Number(navigationRoot.position.y.toFixed(3)),
      Number(navigationRoot.position.z.toFixed(3)),
    ];
    const yawDeg = Math.round(((orientationRoot.rotation.y * 180) / Math.PI + 360) % 360);
    const walking = pathQueue.length > 0 || currentState === 'MOVING';
    const bText = walking
      ? `Menuju ${DEFAULT_CEO_ANCHORS[targetAnchorId].label}...`
      : spec.speechBubble || spec.thoughtBubble || null;

    return {
      loaded: true,
      state: currentState,
      currentState,
      activeActionId,
      currentActionId: activeActionId,
      activeActionLabel: spec.labelId,
      currentActionDef: spec,
      currentClipName,
      activeClipName: currentClipName,
      currentAnchorId,
      targetAnchorId,
      expressionId: currentExpressionId,
      currentExpression: currentExpressionId,
      glassesVisible,
      activePropId,
      activeProp: activePropId,
      position: pos,
      worldPosition: pos,
      rotationYDeg: yawDeg,
      facingDeg: yawDeg,
      speedMultiplier,
      isWalking: walking,
      isPaused,
      isPatrolling,
      patrolActive: isPatrolling,
      isAutoDemoRunning,
      autoDemoActive: isAutoDemoRunning,
      autoDemoStepIndex,
      autoDemoTotalSteps: CEO_AUTO_DEMO_SEQUENCE.length,
      autoDemoStepTitle: isAutoDemoRunning
        ? CEO_AUTO_DEMO_SEQUENCE[autoDemoStepIndex]?.stepTitle ?? null
        : null,
      bubbleText: bText,
      bubbleBadge: spec.statusBadgeText,
      bubbleTone:
        spec.badgeColor === 'emerald'
          ? 'emerald'
          : spec.badgeColor === 'sky'
          ? 'blue'
          : spec.badgeColor === 'amber' || spec.badgeColor === 'coral'
          ? 'amber'
          : spec.badgeColor === 'purple'
          ? 'violet'
          : 'slate',
      isEmbeddedClipPlaying: activeMixerAction !== null && activeMixerAction.isRunning(),
      availableClips: clips.map((c) => c.name),
      characterSource: 'procedural',
      characterPolyCount: Math.round(characterPolyCount),
    };
  }

  function dispose() {
    mixer.stopAllAction();
  }

  return {
    rootGroup,
    navigationRoot,
    orientationRoot,
    modelRoot,
    characterVisualRoot,
    selectionRing,
    statusLabelSprite,
    mixer,
    actionsMap,
    clips,
    pivots,
    update,
    triggerAction,
    walkToAnchor,
    walkToWorldPoint,
    executePlayback,
    setSpeed: setSpeedMultiplier,
    setSpeedMultiplier,
    setPatrol: setPatrolEnabled,
    setPatrolEnabled,
    startAutoDemo: startAutoDemoSequence,
    startAutoDemoSequence,
    stopAutoDemo: stopAutoDemoSequence,
    stopAutoDemoSequence,
    setExpression,
    setGlassesVisible,
    setStatusLabelVisible,
    getStatus,
    dispose,
  };
}

/**
 * Builds visual debug helpers for the CEO Room walkable waypoint network and anchors.
 */
export function buildCEOSimulationHelpersGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'CEO_Simulation_Path_Helpers';

  const nodeGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 });
  const lineMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.65 });

  const nodeMap = new Map(CEO_WALK_WAYPOINTS.map((w) => [w.id, w]));

  for (const wp of CEO_WALK_WAYPOINTS) {
    const marker = new THREE.Mesh(nodeGeom, nodeMat);
    marker.position.set(wp.position[0], 0.025, wp.position[1]);
    marker.name = `CEO_Waypoint_${wp.id}`;
    group.add(marker);

    for (const neighborId of wp.neighbors) {
      const nb = nodeMap.get(neighborId);
      if (nb && wp.id < nb.id) {
        const pts = [
          new THREE.Vector3(wp.position[0], 0.025, wp.position[1]),
          new THREE.Vector3(nb.position[0], 0.025, nb.position[1]),
        ];
        const lineGeom = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(lineGeom, lineMat);
        group.add(line);
      }
    }
  }

  return group;
}
