import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import {
  DEFAULT_UIUX_ANCHORS,
  UIUXAnchorId,
} from '../domain/uiuxRoomSpec';
import {
  UIUX_CHARACTER_CONSTANTS,
  UIUXAgentStateId,
  UIUXActionId,
  UIUXExpressionId,
  UIUXExpressionDefinition,
  UIUXHandheldPropId,
  UIUXPlaybackCommand,
  UIUXRuntimeStatus,
  UIUX_WALK_WAYPOINTS,
  UIUX_PATROL_ANCHOR_SEQUENCE,
  UIUX_AUTO_DEMO_SEQUENCE,
  findUIUXWalkablePath,
  getUIUXActionDef,
  getUIUXExpressionDef,
} from '../domain/uiuxSimulationSpec';

export type { UIUXRuntimeStatus };

export interface UIUXRuntimeInstance {
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
      stylus_tablet: THREE.Group;
      stylus_pen_right: THREE.Group;
      wireframe_clipboard: THREE.Group;
      sticky_note_palette: THREE.Group;
      coffee_mug: THREE.Group;
    };
  };
  update: (deltaSeconds: number, elapsedSeconds: number) => void;
  triggerAction: (actionId: UIUXActionId, immediateTeleport?: boolean) => void;
  walkToAnchor: (anchorId: UIUXAnchorId, followUpActionId?: UIUXActionId) => void;
  walkToWorldPoint: (x: number, z: number) => boolean;
  executePlayback: (cmd: UIUXPlaybackCommand) => void;
  setSpeed: (speed: 0.5 | 1 | 1.5) => void;
  setSpeedMultiplier: (speed: number) => void;
  setPatrol: (enabled: boolean) => void;
  setPatrolEnabled: (enabled: boolean) => void;
  startAutoDemo: () => void;
  startAutoDemoSequence: () => void;
  stopAutoDemo: () => void;
  stopAutoDemoSequence: () => void;
  setExpression: (expressionId: UIUXExpressionId) => void;
  setGlassesVisible: (visible: boolean) => void;
  setStatusLabelVisible: (visible: boolean) => void;
  getStatus: () => UIUXRuntimeStatus;
  dispose: () => void;
}

function makeCharMat(
  name: string,
  hex: number,
  roughness = 0.72,
  metalness = 0.05
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    name,
    color: hex,
    roughness,
    metalness,
  });
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

function createUIUXStatusSprite(): {
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
  sprite.name = 'UIUX_Runtime_Status_Sprite';
  sprite.scale.set(1.42, 0.355, 1);
  sprite.position.set(0, 2.08, 0);
  sprite.renderOrder = 25;

  let lastKey = '';
  const updateText = (stateLabel: string, badgeLabel: string) => {
    const key = `${stateLabel}|${badgeLabel}`;
    if (key === lastKey || !ctx) return;
    lastKey = key;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(17, 24, 35, 0.90)';
    ctx.strokeStyle = 'rgba(104, 163, 139, 0.90)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(12, 16, 488, 96, 18);
    ctx.fill();
    ctx.stroke();

    // Active mint-sage indicator dot
    ctx.fillStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.arc(44, 48, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px Inter, system-ui, sans-serif';
    ctx.fillText(`UI/UX · ${stateLabel}`, 66, 56);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '600 18px JetBrains Mono, monospace';
    ctx.fillText(`${badgeLabel}`, 66, 90);

    texture.needsUpdate = true;
  };

  updateText('IDLE', 'SIMULASI / DEMO · IDLE');
  return { sprite, updateText };
}

/**
 * Builds the canonical procedural voxel UI/UX Designer character hierarchy (`uiux_designer_agent`)
 * + 15 embedded AnimationClips.
 *
 * Strictly follows Reference A (Approved UI/UX Character Sheet) & Reference B (Same-World PM/CEO Voxel Baseline):
 * - Height: 1.725u grounded at Y=0.000
 * - Short layered warm brown voxel hair (#4E301F / #6E4730 / #382114) with creative stepped silhouette
 * - Black square / rectangular designer glasses (`Glasses` group) with visible expressive eyes behind frames
 * - Mint / sage green outerwear cardigan/jacket (#68A38B / #4F846F) over crisp white inner top (#F8FAFC)
 * - Visible ID lanyard (`ID_Card_Badge` group) with stepped non-coplanar Z offsets
 * - Dark slate pants (#222733) and clean white studio sneakers (#F4F6F9) with mint-sage heel accents
 * - Contextual activity accessories (`stylus_tablet`, `wireframe_clipboard`, `sticky_note_palette`, `coffee_mug`)
 */
export function buildUIUXDesignerSceneAndClips(): {
  characterRoot: THREE.Group;
  pivots: UIUXRuntimeInstance['pivots'];
  clips: THREE.AnimationClip[];
} {
  const characterRoot = new THREE.Group();
  characterRoot.name = UIUX_CHARACTER_CONSTANTS.ROOT_NODE_NAME;

  // Canonical UI/UX Designer Palette (Reference A + Same-World Voxel Shading)
  const skinMat = makeCharMat('UIUX_Skin_FairWarm', 0xf2c7a8, 0.66, 0.02);
  const cheekMat = makeCharMat('UIUX_Skin_CheekWarm', 0xe6ad94, 0.68, 0.02);

  const hairWarmBrownMat = makeCharMat('UIUX_Hair_WarmChestnutBrown', 0x4e301f, 0.76, 0.04);
  const hairCaramelLayerMat = makeCharMat('UIUX_Hair_CaramelLayerHighlight', 0x6e4730, 0.72, 0.05);
  const hairDeepBrownMat = makeCharMat('UIUX_Hair_DeepEspressoTaper', 0x382114, 0.80, 0.03);

  const cardiganMintSageMat = makeCharMat('UIUX_Cardigan_MintSage', 0x68a38b, 0.74, 0.04);
  const cardiganTrimSageMat = makeCharMat('UIUX_Cardigan_RibbedSageTrim', 0x4f846f, 0.78, 0.04);
  const innerWhiteTopMat = makeCharMat('UIUX_InnerTop_CrispWhite', 0xf8fafc, 0.68, 0.02);

  const darkPantsMat = makeCharMat('UIUX_Pants_DarkSlate', 0x222733, 0.80, 0.05);
  const beltSlateMat = makeCharMat('UIUX_Belt_Charcoal', 0x181c24, 0.62, 0.08);
  const silverAccentMat = makeCharMat('UIUX_Metal_BrushedSilver', 0xd1d5db, 0.34, 0.65);

  const sneakerWhiteMat = makeCharMat('UIUX_Sneaker_CleanWhite', 0xf4f6f9, 0.58, 0.04);
  const sneakerSoleMat = makeCharMat('UIUX_Sneaker_OutsoleSlate', 0xcbd5e1, 0.78, 0.03);

  const glassesFrameMat = makeCharMat('UIUX_Glasses_BlackSquareFrame', 0x161920, 0.32, 0.22);
  const glassesLensMat = new THREE.MeshStandardMaterial({
    name: 'UIUX_Glasses_ClearLens',
    color: 0xe0f2fe,
    roughness: 0.14,
    metalness: 0.08,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  });

  const eyeWhiteMat = makeCharMat('UIUX_Eye_ScleraWhite', 0xffffff, 0.42, 0.02);
  const eyePupilMat = makeCharMat('UIUX_Eye_PupilDark', 0x111827, 0.32, 0.05);
  const eyebrowMat = makeCharMat('UIUX_Eyebrow_WarmBrown', 0x3e2517, 0.72, 0.04);
  const mouthMat = makeCharMat('UIUX_Mouth_Warm', 0x743f34, 0.66, 0.02);

  const lanyardTealMat = makeCharMat('UIUX_ID_LanyardMintTeal', 0x3b8673, 0.64, 0.06);
  const badgeCaseSageMat = makeCharMat('UIUX_ID_BadgeCaseSage', 0x528d77, 0.54, 0.08);
  const badgeCardCreamMat = makeCharMat('UIUX_ID_CardCream', 0xfefce8, 0.60, 0.02);
  const coralAccentMat = makeCharMat('UIUX_Accent_PeachCoral', 0xe27d60, 0.56, 0.06);
  const lavenderAccentMat = makeCharMat('UIUX_Accent_DustyLavender', 0x9582a8, 0.58, 0.06);
  const butterAccentMat = makeCharMat('UIUX_Accent_SoftButter', 0xf3d078, 0.60, 0.04);

  // Accessory / Prop materials
  const tabletChassisMat = makeCharMat('UIUX_Prop_TabletChassis', 0x1e2430, 0.36, 0.38);
  const tabletScreenMat = new THREE.MeshStandardMaterial({
    name: 'UIUX_Prop_TabletCanvasScreen',
    color: 0x6ee7b7,
    emissive: new THREE.Color(0x34d399),
    emissiveIntensity: 0.38,
    roughness: 0.25,
    metalness: 0.08,
  });
  const birchBoardMat = makeCharMat('UIUX_Prop_BirchClipboard', 0xdfc19b, 0.68, 0.03);
  const mugCeramicMat = makeCharMat('UIUX_Prop_MugCeramic', 0xfafaf9, 0.35, 0.04);
  const coffeeLiquidMat = makeCharMat('UIUX_Prop_LatteArt', 0x6f4e37, 0.30, 0.04);

  // =========================================================================
  // 1. HIPS PIVOT (Center of gravity at Y = 0.72)
  // =========================================================================
  const hips = new THREE.Group();
  hips.name = 'Hips';
  hips.position.set(0, 0.72, 0);
  characterRoot.add(hips);

  const pelvisMesh = createRoundedVoxelBox(0.365, 0.14, 0.225, darkPantsMat, 'Pelvis_Block');
  pelvisMesh.position.set(0, 0, 0);
  hips.add(pelvisMesh);

  const beltStrap = createRoundedVoxelBox(0.374, 0.038, 0.232, beltSlateMat, 'Designer_Belt_Strap');
  beltStrap.position.set(0, 0.045, 0);
  hips.add(beltStrap);

  const beltBuckle = createRoundedVoxelBox(0.068, 0.042, 0.016, silverAccentMat, 'Designer_Belt_Buckle');
  beltBuckle.position.set(0, 0.045, 0.122);
  hips.add(beltBuckle);

  // =========================================================================
  // 2. LEGS & WHITE STUDIO SNEAKERS (Grounded at Y = 0.000)
  // =========================================================================
  const leftLeg = new THREE.Group();
  leftLeg.name = 'LeftLeg';
  leftLeg.position.set(-0.095, -0.04, 0);
  hips.add(leftLeg);

  const leftLegUpper = createRoundedVoxelBox(0.142, 0.555, 0.16, darkPantsMat, 'Left_Trouser_Leg');
  leftLegUpper.position.set(0, -0.278, 0);
  leftLeg.add(leftLegUpper);

  const leftSneakerUpper = createRoundedVoxelBox(
    0.15,
    0.095,
    0.228,
    sneakerWhiteMat,
    'Left_White_Sneaker'
  );
  leftSneakerUpper.position.set(0, -0.605, 0.028);
  leftLeg.add(leftSneakerUpper);

  const leftSneakerAccent = createRoundedVoxelBox(
    0.154,
    0.034,
    0.065,
    cardiganMintSageMat,
    'Left_Sneaker_SageAccent'
  );
  leftSneakerAccent.position.set(0, -0.59, -0.056);
  leftLeg.add(leftSneakerAccent);

  const leftSneakerSole = createRoundedVoxelBox(
    0.154,
    0.028,
    0.232,
    sneakerSoleMat,
    'Left_Sneaker_Sole'
  );
  leftSneakerSole.position.set(0, -0.666, 0.028);
  leftLeg.add(leftSneakerSole);

  const rightLeg = new THREE.Group();
  rightLeg.name = 'RightLeg';
  rightLeg.position.set(0.095, -0.04, 0);
  hips.add(rightLeg);

  const rightLegUpper = createRoundedVoxelBox(
    0.142,
    0.555,
    0.16,
    darkPantsMat,
    'Right_Trouser_Leg'
  );
  rightLegUpper.position.set(0, -0.278, 0);
  rightLeg.add(rightLegUpper);

  const rightSneakerUpper = createRoundedVoxelBox(
    0.15,
    0.095,
    0.228,
    sneakerWhiteMat,
    'Right_White_Sneaker'
  );
  rightSneakerUpper.position.set(0, -0.605, 0.028);
  rightLeg.add(rightSneakerUpper);

  const rightSneakerAccent = createRoundedVoxelBox(
    0.154,
    0.034,
    0.065,
    cardiganMintSageMat,
    'Right_Sneaker_SageAccent'
  );
  rightSneakerAccent.position.set(0, -0.59, -0.056);
  rightLeg.add(rightSneakerAccent);

  const rightSneakerSole = createRoundedVoxelBox(
    0.154,
    0.028,
    0.232,
    sneakerSoleMat,
    'Right_Sneaker_Sole'
  );
  rightSneakerSole.position.set(0, -0.666, 0.028);
  rightLeg.add(rightSneakerSole);

  // =========================================================================
  // 3. TORSO PIVOT — MINT / SAGE GREEN CARDIGAN JACKET & WHITE INNER TOP
  // =========================================================================
  const torso = new THREE.Group();
  torso.name = 'Torso';
  torso.position.set(0, 0.06, 0);
  hips.add(torso);

  // Mint / Sage Green Outerwear Cardigan Jacket Core
  const cardiganBody = createRoundedVoxelBox(
    0.405,
    0.48,
    0.236,
    cardiganMintSageMat,
    'UIUX_Cardigan_Jacket_MintSage'
  );
  cardiganBody.position.set(0, 0.24, 0);
  torso.add(cardiganBody);

  // Crisp White Inner Crew-Neck Top (stepped Z = 0.121 so zero coplanarity with cardigan Z = 0.118)
  const innerWhiteTop = createRoundedVoxelBox(
    0.156,
    0.44,
    0.012,
    innerWhiteTopMat,
    'Inner_Shirt_White'
  );
  innerWhiteTop.position.set(0, 0.25, 0.121);
  torso.add(innerWhiteTop);

  // Neat White Crew-Neck Ribbed Collar
  const innerCrewCollar = createRoundedVoxelBox(
    0.15,
    0.042,
    0.018,
    innerWhiteTopMat,
    'Inner_Crew_Collar'
  );
  innerCrewCollar.position.set(0, 0.466, 0.124);
  torso.add(innerCrewCollar);

  // Darker Sage Ribbed Cardigan Plackets / Lapels (stepped Z = 0.126)
  const placketLeft = createRoundedVoxelBox(
    0.052,
    0.45,
    0.016,
    cardiganTrimSageMat,
    'Cardigan_Placket_L'
  );
  placketLeft.position.set(-0.092, 0.248, 0.125);
  torso.add(placketLeft);

  const placketRight = createRoundedVoxelBox(
    0.052,
    0.45,
    0.016,
    cardiganTrimSageMat,
    'Cardigan_Placket_R'
  );
  placketRight.position.set(0.092, 0.248, 0.125);
  torso.add(placketRight);

  // Front Patch Pockets on Mint/Sage Cardigan (Z = 0.125)
  const pocketLeft = createRoundedVoxelBox(
    0.074,
    0.082,
    0.014,
    cardiganTrimSageMat,
    'Cardigan_Pocket_L'
  );
  pocketLeft.position.set(-0.145, 0.11, 0.124);
  torso.add(pocketLeft);

  const pocketRight = createRoundedVoxelBox(
    0.074,
    0.082,
    0.014,
    cardiganTrimSageMat,
    'Cardigan_Pocket_R'
  );
  pocketRight.position.set(0.145, 0.11, 0.124);
  torso.add(pocketRight);

  // Subtle Creative Enamel Pins on Left Placket (Peach Coral & Dusty Lavender)
  const pinCoral = createRoundedVoxelBox(
    0.022,
    0.022,
    0.014,
    coralAccentMat,
    'Design_Pin_Coral'
  );
  pinCoral.position.set(-0.092, 0.39, 0.136);
  torso.add(pinCoral);

  const pinLavender = createRoundedVoxelBox(
    0.02,
    0.02,
    0.014,
    lavenderAccentMat,
    'Design_Pin_Lavender'
  );
  pinLavender.position.set(-0.092, 0.358, 0.136);
  torso.add(pinLavender);

  // =========================================================================
  // 4. VISIBLE ID LANYARD & DESIGN STUDIO BADGE (`ID_Card_Badge` group)
  // =========================================================================
  const idBadgeGroup = new THREE.Group();
  idBadgeGroup.name = 'ID_Card_Badge';
  torso.add(idBadgeGroup);

  const lanyardStrapL = createRoundedVoxelBox(
    0.018,
    0.24,
    0.012,
    lanyardTealMat,
    'ID_Lanyard_Strap_L'
  );
  lanyardStrapL.position.set(-0.044, 0.355, 0.132);
  lanyardStrapL.rotation.z = -0.19;
  idBadgeGroup.add(lanyardStrapL);

  const lanyardStrapR = createRoundedVoxelBox(
    0.018,
    0.24,
    0.012,
    lanyardTealMat,
    'ID_Lanyard_Strap_R'
  );
  lanyardStrapR.position.set(0.044, 0.355, 0.132);
  lanyardStrapR.rotation.z = 0.19;
  idBadgeGroup.add(lanyardStrapR);

  const badgeSilverClip = createRoundedVoxelBox(
    0.026,
    0.022,
    0.014,
    silverAccentMat,
    'ID_Badge_Silver_Clip'
  );
  badgeSilverClip.position.set(0, 0.242, 0.135);
  idBadgeGroup.add(badgeSilverClip);

  const badgeHolderCase = createRoundedVoxelBox(
    0.076,
    0.102,
    0.014,
    badgeCaseSageMat,
    'ID_Badge_Holder_Sage'
  );
  badgeHolderCase.position.set(0, 0.18, 0.136);
  idBadgeGroup.add(badgeHolderCase);

  const badgeInnerCard = createRoundedVoxelBox(
    0.06,
    0.076,
    0.008,
    badgeCardCreamMat,
    'ID_Badge_Card_Cream'
  );
  badgeInnerCard.position.set(0, 0.178, 0.142);
  idBadgeGroup.add(badgeInnerCard);

  const badgeHeaderCoral = createRoundedVoxelBox(
    0.052,
    0.014,
    0.008,
    coralAccentMat,
    'ID_Badge_Header_Coral'
  );
  badgeHeaderCoral.position.set(0, 0.204, 0.145);
  idBadgeGroup.add(badgeHeaderCoral);

  // =========================================================================
  // 5. ARMS & CONTEXTUAL DESIGN ACCESSORIES
  // =========================================================================
  const leftArm = new THREE.Group();
  leftArm.name = 'LeftArm';
  leftArm.position.set(-0.265, 0.43, 0);
  torso.add(leftArm);

  const leftSleeve = createRoundedVoxelBox(
    0.124,
    0.355,
    0.134,
    cardiganMintSageMat,
    'Left_Cardigan_Sleeve'
  );
  leftSleeve.position.set(0, -0.158, 0);
  leftArm.add(leftSleeve);

  const leftCuff = createRoundedVoxelBox(
    0.126,
    0.038,
    0.136,
    cardiganTrimSageMat,
    'Left_Cardigan_Cuff'
  );
  leftCuff.position.set(0, -0.35, 0);
  leftArm.add(leftCuff);

  const leftHand = createRoundedVoxelBox(0.104, 0.104, 0.114, skinMat, 'Left_Hand_Voxel');
  leftHand.position.set(0, -0.415, 0);
  leftArm.add(leftHand);

  // Left-Hand Prop 1: Interactive Drawing Tablet (`stylus_tablet`)
  const stylusTabletProp = new THREE.Group();
  stylusTabletProp.name = 'UIUX_Stylus_Tablet_Prop';
  stylusTabletProp.position.set(0.06, -0.42, 0.12);
  stylusTabletProp.visible = false;
  const tabletBody = createRoundedVoxelBox(0.24, 0.175, 0.022, tabletChassisMat, 'UIUX_Tablet_Body');
  const tabletScreen = createRoundedVoxelBox(
    0.21,
    0.145,
    0.008,
    tabletScreenMat,
    'UIUX_Tablet_Active_Canvas'
  );
  tabletScreen.position.set(0, 0, 0.011);
  stylusTabletProp.add(tabletBody, tabletScreen);
  leftArm.add(stylusTabletProp);

  // Left-Hand Prop 2: Wireframe Layout Clipboard (`wireframe_clipboard`)
  const wireframeClipboardProp = new THREE.Group();
  wireframeClipboardProp.name = 'UIUX_Wireframe_Clipboard_Prop';
  wireframeClipboardProp.position.set(0.055, -0.43, 0.115);
  wireframeClipboardProp.visible = false;
  const clipBoardBase = createRoundedVoxelBox(
    0.22,
    0.28,
    0.022,
    birchBoardMat,
    'UIUX_Clipboard_Birch_Back'
  );
  const clipBoardSheet = createRoundedVoxelBox(
    0.195,
    0.25,
    0.01,
    innerWhiteTopMat,
    'UIUX_Clipboard_Wireframe_Sheet'
  );
  clipBoardSheet.position.set(0, -0.005, 0.012);
  const clipBoardWireBlock1 = createRoundedVoxelBox(
    0.15,
    0.045,
    0.008,
    cardiganMintSageMat,
    'UIUX_Clipboard_UI_Header'
  );
  clipBoardWireBlock1.position.set(0, 0.075, 0.018);
  const clipBoardWireBlock2 = createRoundedVoxelBox(
    0.15,
    0.08,
    0.008,
    lavenderAccentMat,
    'UIUX_Clipboard_UI_Card'
  );
  clipBoardWireBlock2.position.set(0, -0.01, 0.018);
  wireframeClipboardProp.add(
    clipBoardBase,
    clipBoardSheet,
    clipBoardWireBlock1,
    clipBoardWireBlock2
  );
  leftArm.add(wireframeClipboardProp);

  // Left-Hand Prop 3: Sticky Notes & Color Swatch Palette Fan (`sticky_note_palette`)
  const stickyPaletteProp = new THREE.Group();
  stickyPaletteProp.name = 'UIUX_Sticky_Color_Palette_Prop';
  stickyPaletteProp.position.set(0.05, -0.42, 0.11);
  stickyPaletteProp.visible = false;
  const swatchFan1 = createRoundedVoxelBox(
    0.18,
    0.06,
    0.014,
    cardiganMintSageMat,
    'UIUX_Swatch_Blade_Sage'
  );
  const swatchFan2 = createRoundedVoxelBox(
    0.18,
    0.06,
    0.014,
    coralAccentMat,
    'UIUX_Swatch_Blade_Coral'
  );
  swatchFan2.rotation.z = 0.28;
  swatchFan2.position.set(0.01, 0.02, 0.008);
  const swatchFan3 = createRoundedVoxelBox(
    0.18,
    0.06,
    0.014,
    lavenderAccentMat,
    'UIUX_Swatch_Blade_Lavender'
  );
  swatchFan3.rotation.z = 0.56;
  swatchFan3.position.set(0.02, 0.04, 0.016);
  const stickyCard = createRoundedVoxelBox(
    0.09,
    0.09,
    0.012,
    butterAccentMat,
    'UIUX_Sticky_Note_Card'
  );
  stickyCard.position.set(-0.04, -0.04, 0.02);
  stickyPaletteProp.add(swatchFan1, swatchFan2, swatchFan3, stickyCard);
  leftArm.add(stickyPaletteProp);

  const rightArm = new THREE.Group();
  rightArm.name = 'RightArm';
  rightArm.position.set(0.265, 0.43, 0);
  torso.add(rightArm);

  const rightSleeve = createRoundedVoxelBox(
    0.124,
    0.355,
    0.134,
    cardiganMintSageMat,
    'Right_Cardigan_Sleeve'
  );
  rightSleeve.position.set(0, -0.158, 0);
  rightArm.add(rightSleeve);

  const rightCuff = createRoundedVoxelBox(
    0.126,
    0.038,
    0.136,
    cardiganTrimSageMat,
    'Right_Cardigan_Cuff'
  );
  rightCuff.position.set(0, -0.35, 0);
  rightArm.add(rightCuff);

  const rightHand = createRoundedVoxelBox(0.104, 0.104, 0.114, skinMat, 'Right_Hand_Voxel');
  rightHand.position.set(0, -0.415, 0);
  rightArm.add(rightHand);

  // Right-Hand Prop 1: Digital Stylus Pen (`stylus_pen_right`)
  const stylusPenRightProp = new THREE.Group();
  stylusPenRightProp.name = 'UIUX_Stylus_Pen_Right_Prop';
  stylusPenRightProp.position.set(-0.02, -0.43, 0.095);
  stylusPenRightProp.visible = false;
  const stylusBarrel = createRoundedVoxelBox(
    0.018,
    0.15,
    0.018,
    tabletChassisMat,
    'UIUX_Stylus_Barrel'
  );
  stylusBarrel.rotation.x = Math.PI / 3;
  const stylusCoralGrip = createRoundedVoxelBox(
    0.022,
    0.045,
    0.022,
    coralAccentMat,
    'UIUX_Stylus_Coral_Grip'
  );
  stylusCoralGrip.rotation.x = Math.PI / 3;
  stylusPenRightProp.add(stylusBarrel, stylusCoralGrip);
  rightArm.add(stylusPenRightProp);

  // Right-Hand Prop 2: Studio Coffee Mug (`coffee_mug`)
  const coffeeMugProp = new THREE.Group();
  coffeeMugProp.name = 'UIUX_Coffee_Mug_Prop';
  coffeeMugProp.position.set(-0.03, -0.43, 0.10);
  coffeeMugProp.visible = false;
  const mugBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.042, 0.105, 12),
    mugCeramicMat
  );
  mugBody.name = 'UIUX_Mug_Body';
  mugBody.castShadow = true;
  const mugSageBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.049, 0.046, 0.036, 12),
    cardiganMintSageMat
  );
  mugSageBand.name = 'UIUX_Mug_Sage_Sleeve';
  const mugLatteTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.042, 0.01, 12),
    coffeeLiquidMat
  );
  mugLatteTop.name = 'UIUX_Mug_Latte_Top';
  mugLatteTop.position.set(0, 0.048, 0);
  coffeeMugProp.add(mugBody, mugSageBand, mugLatteTop);
  rightArm.add(coffeeMugProp);

  // =========================================================================
  // 6. HEAD, FRIENDLY DESIGNER FACE, BLACK RECTANGULAR GLASSES & SHORT LAYERED BROWN HAIR
  // =========================================================================
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.51, 0);
  torso.add(head);

  const neckMesh = createRoundedVoxelBox(0.142, 0.08, 0.142, skinMat, 'Neck_Block');
  neckMesh.position.set(0, 0.01, 0);
  head.add(neckMesh);

  const headCube = createRoundedVoxelBox(0.32, 0.34, 0.30, skinMat, 'Head_Voxel_Core');
  headCube.position.set(0, 0.20, 0);
  head.add(headCube);

  // Non-coplanar voxel ears at X = ±0.177 (clear of Head_Voxel_Core at X = ±0.160)
  const leftEar = createRoundedVoxelBox(0.032, 0.078, 0.058, skinMat, 'Ear_L');
  leftEar.position.set(-0.177, 0.195, -0.005);
  head.add(leftEar);

  const rightEar = createRoundedVoxelBox(0.032, 0.078, 0.058, skinMat, 'Ear_R');
  rightEar.position.set(0.177, 0.195, -0.005);
  head.add(rightEar);

  // Readable warm cheeks & simple voxel nose (Head front face is Z = +0.150)
  const leftCheek = createRoundedVoxelBox(0.064, 0.038, 0.012, cheekMat, 'Cheek_Warm_L');
  leftCheek.position.set(-0.094, 0.156, 0.154);
  head.add(leftCheek);

  const rightCheek = createRoundedVoxelBox(0.064, 0.038, 0.012, cheekMat, 'Cheek_Warm_R');
  rightCheek.position.set(0.094, 0.156, 0.154);
  head.add(rightCheek);

  const noseBridge = createRoundedVoxelBox(0.036, 0.058, 0.026, skinMat, 'Voxel_Nose_Bridge');
  noseBridge.position.set(0, 0.184, 0.162);
  head.add(noseBridge);

  // Expressive Eyes (clearly visible behind black square/rectangular designer glasses)
  const leftEyeSclera = createRoundedVoxelBox(0.058, 0.04, 0.012, eyeWhiteMat, 'Eye_Sclera_L');
  leftEyeSclera.position.set(-0.072, 0.215, 0.154);
  head.add(leftEyeSclera);

  const rightEyeSclera = createRoundedVoxelBox(0.058, 0.04, 0.012, eyeWhiteMat, 'Eye_Sclera_R');
  rightEyeSclera.position.set(0.072, 0.215, 0.154);
  head.add(rightEyeSclera);

  const leftPupil = createRoundedVoxelBox(0.028, 0.028, 0.014, eyePupilMat, 'Eye_Pupil_L');
  leftPupil.position.set(-0.07, 0.215, 0.158);
  head.add(leftPupil);

  const rightPupil = createRoundedVoxelBox(0.028, 0.028, 0.014, eyePupilMat, 'Eye_Pupil_R');
  rightPupil.position.set(0.07, 0.215, 0.158);
  head.add(rightPupil);

  // Expressive Eyebrows
  const leftEyebrow = createRoundedVoxelBox(0.07, 0.019, 0.018, eyebrowMat, 'Eyebrow_L');
  leftEyebrow.position.set(-0.072, 0.258, 0.158);
  head.add(leftEyebrow);

  const rightEyebrow = createRoundedVoxelBox(0.07, 0.019, 0.018, eyebrowMat, 'Eyebrow_R');
  rightEyebrow.position.set(0.072, 0.258, 0.158);
  head.add(rightEyebrow);

  // Friendly Minimal Voxel Mouth
  const mouthMesh = createRoundedVoxelBox(0.068, 0.018, 0.014, mouthMat, 'Voxel_Mouth');
  mouthMesh.position.set(0, 0.125, 0.155);
  head.add(mouthMesh);

  // =========================================================================
  // 7. BLACK SQUARE / RECTANGULAR DESIGNER GLASSES (`Glasses` group)
  // =========================================================================
  const glassesGroup = new THREE.Group();
  glassesGroup.name = 'Glasses';
  head.add(glassesGroup);

  const rimTopL = createRoundedVoxelBox(
    0.098,
    0.014,
    0.016,
    glassesFrameMat,
    'Glasses_Rim_Top_L'
  );
  rimTopL.position.set(-0.074, 0.242, 0.172);
  const rimBottomL = createRoundedVoxelBox(
    0.098,
    0.012,
    0.015,
    glassesFrameMat,
    'Glasses_Rim_Bottom_L'
  );
  rimBottomL.position.set(-0.074, 0.186, 0.172);
  const rimOuterL = createRoundedVoxelBox(
    0.014,
    0.066,
    0.016,
    glassesFrameMat,
    'Glasses_Rim_Outer_L'
  );
  rimOuterL.position.set(-0.119, 0.214, 0.172);
  const rimInnerL = createRoundedVoxelBox(
    0.012,
    0.062,
    0.015,
    glassesFrameMat,
    'Glasses_Rim_Inner_L'
  );
  rimInnerL.position.set(-0.029, 0.214, 0.172);
  const clearLensL = createRoundedVoxelBox(
    0.078,
    0.044,
    0.006,
    glassesLensMat,
    'Glasses_Clear_Lens_L',
    false
  );
  clearLensL.position.set(-0.074, 0.214, 0.170);

  const rimTopR = createRoundedVoxelBox(
    0.098,
    0.014,
    0.016,
    glassesFrameMat,
    'Glasses_Rim_Top_R'
  );
  rimTopR.position.set(0.074, 0.242, 0.172);
  const rimBottomR = createRoundedVoxelBox(
    0.098,
    0.012,
    0.015,
    glassesFrameMat,
    'Glasses_Rim_Bottom_R'
  );
  rimBottomR.position.set(0.074, 0.186, 0.172);
  const rimOuterR = createRoundedVoxelBox(
    0.014,
    0.066,
    0.016,
    glassesFrameMat,
    'Glasses_Rim_Outer_R'
  );
  rimOuterR.position.set(0.119, 0.214, 0.172);
  const rimInnerR = createRoundedVoxelBox(
    0.012,
    0.062,
    0.015,
    glassesFrameMat,
    'Glasses_Rim_Inner_R'
  );
  rimInnerR.position.set(0.029, 0.214, 0.172);
  const clearLensR = createRoundedVoxelBox(
    0.078,
    0.044,
    0.006,
    glassesLensMat,
    'Glasses_Clear_Lens_R',
    false
  );
  clearLensR.position.set(0.074, 0.214, 0.170);

  const glassesBridge = createRoundedVoxelBox(
    0.046,
    0.013,
    0.016,
    glassesFrameMat,
    'Glasses_Center_Bridge'
  );
  glassesBridge.position.set(0, 0.228, 0.172);

  const templeArmL = createRoundedVoxelBox(
    0.014,
    0.014,
    0.19,
    glassesFrameMat,
    'Glasses_Temple_Arm_L'
  );
  templeArmL.position.set(-0.168, 0.228, 0.075);
  const templeArmR = createRoundedVoxelBox(
    0.014,
    0.014,
    0.19,
    glassesFrameMat,
    'Glasses_Temple_Arm_R'
  );
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

  // =========================================================================
  // 8. FEMININE SHORT LAYERED VOXEL BOB HAIR (`Hair` group)
  //    - Softly rounded 4-step domed crown (eliminates boxy/flat top corners)
  //    - Asymmetric diagonal side-swept curtain fringe with a clear side part
  //    - Fuller chin-length / jaw-framing side-bob silhouette with inward-curved tips
  //    - Rounded multi-layer back bob that tapers neatly above the collar
  //    - Total height reaches exactly 1.725u (0.72 + 0.06 + 0.51 + 0.420 + 0.015 = 1.725)
  // =========================================================================
  const hairGroup = new THREE.Group();
  hairGroup.name = 'Hair';
  head.add(hairGroup);

  // 8A. Softly Rounded Stepped Crown & Side-Parted Dome (tapers inward toward top for roundness)
  const hairCrownBase = createRoundedVoxelBox(
    0.344,
    0.056,
    0.324,
    hairWarmBrownMat,
    'Hair_Crown_WarmBrown'
  );
  hairCrownBase.position.set(0, 0.362, -0.006);
  hairGroup.add(hairCrownBase);

  const hairCrownMidDome = createRoundedVoxelBox(
    0.304,
    0.036,
    0.288,
    hairWarmBrownMat,
    'Hair_Crown_RoundedDome'
  );
  hairCrownMidDome.position.set(0.008, 0.396, -0.002);
  hairGroup.add(hairCrownMidDome);

  // Soft caramel-brown top crest (reaches Y = 0.420 + 0.015 = 0.435 relative to Head -> 1.725u world Y)
  const hairUpperCrest = createRoundedVoxelBox(
    0.224,
    0.030,
    0.228,
    hairCaramelLayerMat,
    'Hair_Crest_LayeredBrown'
  );
  hairUpperCrest.position.set(0.028, 0.420, 0.004);
  hairGroup.add(hairUpperCrest);

  // Left side-parted crown lift (leaves a visible side part valley at X ≈ -0.052)
  const hairCrownPartLiftL = createRoundedVoxelBox(
    0.084,
    0.024,
    0.206,
    hairWarmBrownMat,
    'Hair_Crown_PartLift_L'
  );
  hairCrownPartLiftL.position.set(-0.102, 0.412, 0.002);
  hairGroup.add(hairCrownPartLiftL);

  // 8B. Diagonal Side-Swept Feminine Curtain Fringe (Frames Forehead & Temples, Clear of Glasses)
  // Step 1 (Upper-center right sweep starting from side part X = -0.025)
  const hairFrontSweepMain = createRoundedVoxelBox(
    0.168,
    0.048,
    0.066,
    hairWarmBrownMat,
    'Hair_FrontSweep_LayeredBrown'
  );
  hairFrontSweepMain.position.set(0.062, 0.352, 0.138);
  hairGroup.add(hairFrontSweepMain);

  // Step 2 (Mid diagonal caramel curtain sweep stepping down toward right brow/temple)
  const hairFrontBangsSoftTipR = createRoundedVoxelBox(
    0.128,
    0.042,
    0.064,
    hairCaramelLayerMat,
    'Hair_FrontBangs_SoftTip_R'
  );
  hairFrontBangsSoftTipR.position.set(0.104, 0.324, 0.144);
  hairGroup.add(hairFrontBangsSoftTipR);

  // Step 3 (Outer right temple feathering lock framing the right side of forehead above glasses)
  const hairTempleFrameR = createRoundedVoxelBox(
    0.068,
    0.078,
    0.068,
    hairWarmBrownMat,
    'Hair_TempleFrame_Upper_R'
  );
  hairTempleFrameR.position.set(0.152, 0.292, 0.136);
  hairGroup.add(hairTempleFrameR);

  // Left side-parted curtain bang (leaves forehead open at X = -0.065..-0.020 for feminine asymmetry)
  const hairFrontAccentLayer = createRoundedVoxelBox(
    0.092,
    0.046,
    0.066,
    hairCaramelLayerMat,
    'Hair_FrontAccent_CaramelBrown'
  );
  hairFrontAccentLayer.position.set(-0.114, 0.348, 0.138);
  hairGroup.add(hairFrontAccentLayer);

  // Outer left temple feathering lock stepping softly into the left cheek bob
  const hairTempleFrameL = createRoundedVoxelBox(
    0.068,
    0.082,
    0.068,
    hairWarmBrownMat,
    'Hair_TempleFrame_Upper_L'
  );
  hairTempleFrameL.position.set(-0.152, 0.290, 0.136);
  hairGroup.add(hairTempleFrameL);

  // 8C. Fuller Rounded Side-Bob Silhouette & Chin/Jaw-Framing Locks
  // Upper-mid side crown roundness (steps outward from dome)
  const hairSideUpperL = createRoundedVoxelBox(
    0.056,
    0.124,
    0.298,
    hairWarmBrownMat,
    'Hair_SideUpper_L'
  );
  hairSideUpperL.position.set(-0.168, 0.298, -0.012);
  hairGroup.add(hairSideUpperL);

  const hairSideUpperR = createRoundedVoxelBox(
    0.056,
    0.124,
    0.298,
    hairWarmBrownMat,
    'Hair_SideUpper_R'
  );
  hairSideUpperR.position.set(0.168, 0.298, -0.012);
  hairGroup.add(hairSideUpperR);

  // Mid-level caramel layered side bob volume (fullest part of the rounded bob curve)
  const hairSideLayerCaramelL = createRoundedVoxelBox(
    0.062,
    0.132,
    0.228,
    hairCaramelLayerMat,
    'Hair_SideLayer_Caramel_L'
  );
  hairSideLayerCaramelL.position.set(-0.176, 0.208, -0.036);
  hairGroup.add(hairSideLayerCaramelL);

  const hairSideLayerCaramelR = createRoundedVoxelBox(
    0.062,
    0.132,
    0.228,
    hairCaramelLayerMat,
    'Hair_SideLayer_Caramel_R'
  );
  hairSideLayerCaramelR.position.set(0.176, 0.208, -0.036);
  hairGroup.add(hairSideLayerCaramelR);

  // Feminine face-framing side-bob locks along outer cheeks (frames face from temple to jawline)
  const hairCheekFrameL = createRoundedVoxelBox(
    0.054,
    0.156,
    0.082,
    hairWarmBrownMat,
    'Hair_SideBob_CheekFrame_L'
  );
  hairCheekFrameL.position.set(-0.170, 0.184, 0.098);
  hairGroup.add(hairCheekFrameL);

  const hairCheekFrameR = createRoundedVoxelBox(
    0.054,
    0.156,
    0.082,
    hairWarmBrownMat,
    'Hair_SideBob_CheekFrame_R'
  );
  hairCheekFrameR.position.set(0.170, 0.184, 0.098);
  hairGroup.add(hairCheekFrameR);

  // Softly tapered inward-curving chin/jawline bob tips (gives unmistakable feminine bob silhouette)
  const hairCheekTipL = createRoundedVoxelBox(
    0.052,
    0.086,
    0.088,
    hairCaramelLayerMat,
    'Hair_SideBob_Tip_L'
  );
  hairCheekTipL.position.set(-0.162, 0.082, 0.082);
  hairGroup.add(hairCheekTipL);

  const hairCheekTipR = createRoundedVoxelBox(
    0.052,
    0.086,
    0.088,
    hairCaramelLayerMat,
    'Hair_SideBob_Tip_R'
  );
  hairCheekTipR.position.set(0.162, 0.082, 0.082);
  hairGroup.add(hairCheekTipR);

  // Delicate inward-tucked chin-level bob ends (Y = 0.015..0.065, curving toward jawline)
  const hairChinTuckL = createRoundedVoxelBox(
    0.048,
    0.052,
    0.076,
    hairDeepBrownMat,
    'Hair_SideBob_ChinTuck_L'
  );
  hairChinTuckL.position.set(-0.150, 0.038, 0.068);
  hairGroup.add(hairChinTuckL);

  const hairChinTuckR = createRoundedVoxelBox(
    0.048,
    0.052,
    0.076,
    hairDeepBrownMat,
    'Hair_SideBob_ChinTuck_R'
  );
  hairChinTuckR.position.set(0.150, 0.038, 0.068);
  hairGroup.add(hairChinTuckR);

  // Rounded lower side-bob fullness behind and below the ears (Y = 0.03..0.19)
  const hairSideLowerBobL = createRoundedVoxelBox(
    0.058,
    0.162,
    0.188,
    hairWarmBrownMat,
    'Hair_SideBob_LowerVolume_L'
  );
  hairSideLowerBobL.position.set(-0.172, 0.112, -0.058);
  hairGroup.add(hairSideLowerBobL);

  const hairSideLowerBobR = createRoundedVoxelBox(
    0.058,
    0.162,
    0.188,
    hairWarmBrownMat,
    'Hair_SideBob_LowerVolume_R'
  );
  hairSideLowerBobR.position.set(0.172, 0.112, -0.058);
  hairGroup.add(hairSideLowerBobR);

  // 8D. Sculpted Layered Back Bob Silhouette (Rounded Mid-Bob + Neat Tapered Nape)
  const hairBackUpper = createRoundedVoxelBox(
    0.358,
    0.188,
    0.082,
    hairWarmBrownMat,
    'Hair_Back_WarmBrown'
  );
  hairBackUpper.position.set(0, 0.264, -0.148);
  hairGroup.add(hairBackUpper);

  const hairBackMidCurve = createRoundedVoxelBox(
    0.376,
    0.124,
    0.092,
    hairCaramelLayerMat,
    'Hair_Back_MidCurve_Caramel'
  );
  hairBackMidCurve.position.set(0, 0.172, -0.158);
  hairGroup.add(hairBackMidCurve);

  const hairBackBobRoll = createRoundedVoxelBox(
    0.352,
    0.096,
    0.084,
    hairWarmBrownMat,
    'Hair_Back_BobRoll_WarmBrown'
  );
  hairBackBobRoll.position.set(0, 0.092, -0.150);
  hairGroup.add(hairBackBobRoll);

  const hairBackLowerTaper = createRoundedVoxelBox(
    0.304,
    0.056,
    0.068,
    hairDeepBrownMat,
    'Hair_Back_EspressoTaper'
  );
  hairBackLowerTaper.position.set(0, 0.042, -0.136);
  hairGroup.add(hairBackLowerTaper);

  const clips = buildUIUXDesignerAnimationClips();

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
        stylus_tablet: stylusTabletProp,
        stylus_pen_right: stylusPenRightProp,
        wireframe_clipboard: wireframeClipboardProp,
        sticky_note_palette: stickyPaletteProp,
        coffee_mug: coffeeMugProp,
      },
    },
    clips,
  };
}

function qFromEuler(rx: number, ry: number, rz: number): number[] {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'XYZ'));
  return [q.x, q.y, q.z, q.w];
}

function makeQuatTrack(
  nodeName: string,
  times: number[],
  eulers: Array<[number, number, number]>
): THREE.QuaternionKeyframeTrack {
  const values: number[] = [];
  for (const [rx, ry, rz] of eulers) {
    values.push(...qFromEuler(rx, ry, rz));
  }
  return new THREE.QuaternionKeyframeTrack(`${nodeName}.quaternion`, times, values);
}

function makePosTrack(
  nodeName: string,
  times: number[],
  positions: Array<[number, number, number]>
): THREE.VectorKeyframeTrack {
  const values: number[] = [];
  for (const [px, py, pz] of positions) {
    values.push(px, py, pz);
  }
  return new THREE.VectorKeyframeTrack(`${nodeName}.position`, times, values);
}

/**
 * Generates all 15 required THREE.AnimationClips for `uiux_designer_agent.glb` and live simulation.
 */
export function buildUIUXDesignerAnimationClips(): THREE.AnimationClip[] {
  const clips: THREE.AnimationClip[] = [];

  // 01 — Idle_Breathing (Relaxed creative standing pose, subtle breathing & friendly observation)
  clips.push(
    new THREE.AnimationClip('Idle_Breathing', 3.0, [
      makePosTrack('Hips', [0, 1.5, 3.0], [
        [0, 0.72, 0],
        [0, 0.726, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.5, 3.0], [
        [0.01, 0, 0],
        [-0.015, 0.035, 0],
        [0.01, 0, 0],
      ]),
      makeQuatTrack('Head', [0, 1.0, 2.0, 3.0], [
        [0, 0, 0],
        [0.025, 0.09, 0.01],
        [-0.015, -0.07, -0.01],
        [0, 0, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.5, 3.0], [
        [0.02, 0, 0.045],
        [-0.02, 0, 0.06],
        [0.02, 0, 0.045],
      ]),
      makeQuatTrack('RightArm', [0, 1.5, 3.0], [
        [-0.02, 0, -0.045],
        [0.02, 0, -0.06],
        [-0.02, 0, -0.045],
      ]),
      makeQuatTrack('LeftLeg', [0, 3.0], [[0, 0, 0], [0, 0, 0]]),
      makeQuatTrack('RightLeg', [0, 3.0], [[0, 0, 0], [0, 0, 0]]),
    ])
  );

  // 02 — Walk_Cycle (Natural, upbeat voxel walk between studio anchors)
  clips.push(
    new THREE.AnimationClip('Walk_Cycle', 0.92, [
      makePosTrack('Hips', [0, 0.23, 0.46, 0.69, 0.92], [
        [0, 0.72, 0],
        [0, 0.744, 0],
        [0, 0.72, 0],
        [0, 0.744, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 0.23, 0.46, 0.69, 0.92], [
        [0.04, -0.06, 0],
        [0.05, 0, 0.018],
        [0.04, 0.06, 0],
        [0.05, 0, -0.018],
        [0.04, -0.06, 0],
      ]),
      makeQuatTrack('Head', [0, 0.46, 0.92], [
        [0, 0.035, 0],
        [0, -0.035, 0],
        [0, 0.035, 0],
      ]),
      makeQuatTrack('LeftLeg', [0, 0.23, 0.46, 0.69, 0.92], [
        [0.46, 0, 0],
        [0, 0, 0],
        [-0.46, 0, 0],
        [0, 0, 0],
        [0.46, 0, 0],
      ]),
      makeQuatTrack('RightLeg', [0, 0.23, 0.46, 0.69, 0.92], [
        [-0.46, 0, 0],
        [0, 0, 0],
        [0.46, 0, 0],
        [0, 0, 0],
        [-0.46, 0, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 0.23, 0.46, 0.69, 0.92], [
        [-0.36, 0, 0.04],
        [0, 0, 0.04],
        [0.36, 0, 0.04],
        [0, 0, 0.04],
        [-0.36, 0, 0.04],
      ]),
      makeQuatTrack('RightArm', [0, 0.23, 0.46, 0.69, 0.92], [
        [0.36, 0, -0.04],
        [0, 0, -0.04],
        [-0.36, 0, -0.04],
        [0, 0, -0.04],
        [0.36, 0, -0.04],
      ]),
    ])
  );

  // 03 — Talk (Friendly conversational hand gestures explaining UX rationale)
  clips.push(
    new THREE.AnimationClip('Talk', 2.4, [
      makePosTrack('Hips', [0, 1.2, 2.4], [
        [0, 0.72, 0],
        [0, 0.726, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 0.8, 1.6, 2.4], [
        [0.02, -0.05, 0],
        [0.03, 0.05, 0],
        [0.01, -0.03, 0],
        [0.02, -0.05, 0],
      ]),
      makeQuatTrack('Head', [0, 0.6, 1.2, 1.8, 2.4], [
        [0.03, -0.08, 0],
        [-0.04, 0.08, 0.02],
        [0.05, -0.04, 0],
        [-0.02, 0.06, -0.02],
        [0.03, -0.08, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 0.6, 1.2, 1.8, 2.4], [
        [-0.52, 0.18, 0.08],
        [-0.78, 0.26, 0.14],
        [-0.48, 0.12, 0.08],
        [-0.72, 0.22, 0.12],
        [-0.52, 0.18, 0.08],
      ]),
      makeQuatTrack('RightArm', [0, 0.6, 1.2, 1.8, 2.4], [
        [-0.68, -0.22, -0.10],
        [-0.44, -0.14, -0.08],
        [-0.82, -0.26, -0.14],
        [-0.54, -0.16, -0.08],
        [-0.68, -0.22, -0.10],
      ]),
    ])
  );

  // 04 — Present (Presenting at critique easel or style board, holding swatch palette & gesturing)
  clips.push(
    new THREE.AnimationClip('Present', 2.8, [
      makePosTrack('Hips', [0, 1.4, 2.8], [
        [0, 0.72, 0],
        [0, 0.728, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 0.9, 1.9, 2.8], [
        [0, -0.12, 0],
        [-0.02, 0.14, 0],
        [0.02, 0.04, 0],
        [0, -0.12, 0],
      ]),
      makeQuatTrack('Head', [0, 0.9, 1.9, 2.8], [
        [-0.04, -0.14, 0],
        [-0.08, 0.18, 0],
        [0.03, 0.06, 0],
        [-0.04, -0.14, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.4, 2.8], [
        [-0.76, 0.24, 0.10],
        [-0.82, 0.28, 0.12],
        [-0.76, 0.24, 0.10],
      ]),
      makeQuatTrack('RightArm', [0, 0.7, 1.4, 2.1, 2.8], [
        [-0.65, -0.15, -0.12],
        [-1.38, -0.24, -0.28],
        [-1.12, 0.08, -0.18],
        [-1.42, -0.18, -0.24],
        [-0.65, -0.15, -0.12],
      ]),
    ])
  );

  // 05 — Think (Thoughtful design-thinking pose: hand-to-chin & reflective head tilt)
  clips.push(
    new THREE.AnimationClip('Think', 3.2, [
      makePosTrack('Hips', [0, 1.6, 3.2], [
        [0, 0.72, 0],
        [0, 0.724, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.6, 3.2], [
        [0.02, -0.04, 0],
        [-0.02, 0.04, 0],
        [0.02, -0.04, 0],
      ]),
      makeQuatTrack('Head', [0, 1.0, 2.2, 3.2], [
        [-0.08, 0.08, 0.05],
        [-0.12, -0.06, -0.04],
        [-0.04, 0.05, 0.03],
        [-0.08, 0.08, 0.05],
      ]),
      makeQuatTrack('LeftArm', [0, 1.6, 3.2], [
        [-0.68, 0.28, 0.12],
        [-0.72, 0.26, 0.12],
        [-0.68, 0.28, 0.12],
      ]),
      makeQuatTrack('RightArm', [0, 1.6, 3.2], [
        [-1.28, -0.38, -0.08],
        [-1.34, -0.42, -0.10],
        [-1.28, -0.38, -0.08],
      ]),
    ])
  );

  // 06 — Read (Reading a design brief or accessibility spec on tablet)
  clips.push(
    new THREE.AnimationClip('Read', 2.8, [
      makePosTrack('Hips', [0, 1.4, 2.8], [
        [0, 0.72, 0],
        [0, 0.725, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.4, 2.8], [
        [0.06, -0.02, 0],
        [0.08, 0.02, 0],
        [0.06, -0.02, 0],
      ]),
      makeQuatTrack('Head', [0, 0.9, 1.9, 2.8], [
        [0.24, -0.08, 0],
        [0.26, 0.08, 0],
        [0.22, -0.04, 0],
        [0.24, -0.08, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.4, 2.8], [
        [-0.94, 0.28, 0.10],
        [-0.90, 0.26, 0.10],
        [-0.94, 0.28, 0.10],
      ]),
      makeQuatTrack('RightArm', [0, 0.9, 1.9, 2.8], [
        [-0.76, -0.24, -0.08],
        [-0.92, -0.30, -0.10],
        [-0.72, -0.20, -0.08],
        [-0.76, -0.24, -0.08],
      ]),
    ])
  );

  // 07 — Review (Reviewing layout sheet or screen with focused gestures)
  clips.push(
    new THREE.AnimationClip('Review', 2.8, [
      makePosTrack('Hips', [0, 1.4, 2.8], [
        [0, 0.72, 0],
        [0, 0.726, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.4, 2.8], [
        [0.07, -0.04, 0],
        [0.05, 0.04, 0],
        [0.07, -0.04, 0],
      ]),
      makeQuatTrack('Head', [0, 0.8, 1.6, 2.8], [
        [0.20, -0.10, 0],
        [0.14, 0.08, 0],
        [0.24, 0.02, 0],
        [0.20, -0.10, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.4, 2.8], [
        [-0.88, 0.26, 0.10],
        [-0.84, 0.24, 0.10],
        [-0.88, 0.26, 0.10],
      ]),
      makeQuatTrack('RightArm', [0, 0.7, 1.5, 2.2, 2.8], [
        [-0.78, -0.20, -0.08],
        [-1.08, -0.28, -0.14],
        [-0.88, -0.14, -0.10],
        [-1.02, -0.24, -0.12],
        [-0.78, -0.20, -0.08],
      ]),
    ])
  );

  // 08 — Sketch (Seated or standing sketching on interactive pen tablet with stylus)
  clips.push(
    new THREE.AnimationClip('Sketch', 2.2, [
      makePosTrack('Hips', [0, 1.1, 2.2], [
        [0, 0.56, -0.04],
        [0, 0.565, -0.04],
        [0, 0.56, -0.04],
      ]),
      makeQuatTrack('LeftLeg', [0, 2.2], [[-1.18, 0, 0], [-1.18, 0, 0]]),
      makeQuatTrack('RightLeg', [0, 2.2], [[-1.18, 0, 0], [-1.18, 0, 0]]),
      makeQuatTrack('Torso', [0, 1.1, 2.2], [
        [0.14, -0.04, 0],
        [0.16, 0.04, 0],
        [0.14, -0.04, 0],
      ]),
      makeQuatTrack('Head', [0, 0.7, 1.5, 2.2], [
        [0.22, -0.08, 0.02],
        [0.26, 0.08, -0.02],
        [0.20, 0.02, 0],
        [0.22, -0.08, 0.02],
      ]),
      makeQuatTrack('LeftArm', [0, 1.1, 2.2], [
        [-0.96, 0.24, 0.08],
        [-0.92, 0.22, 0.08],
        [-0.96, 0.24, 0.08],
      ]),
      makeQuatTrack('RightArm', [0, 0.35, 0.7, 1.1, 1.5, 1.85, 2.2], [
        [-0.98, -0.22, -0.08],
        [-1.12, -0.34, -0.14],
        [-0.94, -0.16, -0.06],
        [-1.10, -0.30, -0.12],
        [-0.96, -0.20, -0.08],
        [-1.14, -0.32, -0.14],
        [-0.98, -0.22, -0.08],
      ]),
    ])
  );

  // 09 — Laptop_Work (Seated at Primary Design Workstation working on UI mockups & keyboard)
  clips.push(
    new THREE.AnimationClip('Laptop_Work', 2.0, [
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
        [0.06, -0.12, 0],
        [0.04, 0.12, 0],
        [0.08, -0.04, 0],
        [0.06, -0.12, 0],
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

  // 10 — Approve (Positive confirm gesture & warm nod)
  clips.push(
    new THREE.AnimationClip('Approve', 2.2, [
      makePosTrack('Hips', [0, 0.6, 1.2, 2.2], [
        [0, 0.72, 0],
        [0, 0.736, 0],
        [0, 0.724, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 0.8, 1.6, 2.2], [
        [0, 0, 0],
        [-0.04, 0.06, 0],
        [0.02, -0.03, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('Head', [0, 0.5, 1.0, 1.5, 2.2], [
        [0, 0, 0],
        [0.16, 0.04, 0],
        [-0.06, 0, 0],
        [0.14, 0.02, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.1, 2.2], [
        [-0.18, 0.10, 0.08],
        [-0.32, 0.14, 0.12],
        [-0.18, 0.10, 0.08],
      ]),
      makeQuatTrack('RightArm', [0, 0.6, 1.4, 2.2], [
        [-0.25, -0.10, -0.10],
        [-1.32, -0.18, -0.16],
        [-1.24, -0.14, -0.14],
        [-0.25, -0.10, -0.10],
      ]),
    ])
  );

  // 11 — Prototype_Review (Reviewing wireframes & interactive tablet prototype at round critique table)
  clips.push(
    new THREE.AnimationClip('Prototype_Review', 3.0, [
      makePosTrack('Hips', [0, 1.5, 3.0], [
        [0, 0.72, 0],
        [0, 0.726, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.0, 2.0, 3.0], [
        [0.08, -0.06, 0],
        [0.12, 0.06, 0],
        [0.06, 0.02, 0],
        [0.08, -0.06, 0],
      ]),
      makeQuatTrack('Head', [0, 0.8, 1.6, 2.4, 3.0], [
        [0.18, -0.12, 0],
        [0.24, 0.10, 0],
        [0.14, -0.04, 0],
        [0.22, 0.06, 0],
        [0.18, -0.12, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.5, 3.0], [
        [-0.90, 0.26, 0.10],
        [-0.85, 0.24, 0.10],
        [-0.90, 0.26, 0.10],
      ]),
      makeQuatTrack('RightArm', [0, 0.75, 1.5, 2.25, 3.0], [
        [-0.82, -0.18, -0.08],
        [-1.18, -0.26, -0.14],
        [-0.95, -0.08, -0.10],
        [-1.12, -0.22, -0.12],
        [-0.82, -0.18, -0.08],
      ]),
    ])
  );

  // 12 — Design_System_Work (Curating color swatches, typography & tokens at Style System Board)
  clips.push(
    new THREE.AnimationClip('Design_System_Work', 3.0, [
      makePosTrack('Hips', [0, 1.5, 3.0], [
        [0, 0.72, 0],
        [0, 0.728, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.0, 2.0, 3.0], [
        [-0.02, -0.08, 0],
        [-0.04, 0.08, 0],
        [0.02, -0.02, 0],
        [-0.02, -0.08, 0],
      ]),
      makeQuatTrack('Head', [0, 0.8, 1.6, 2.4, 3.0], [
        [-0.10, -0.14, 0],
        [-0.14, 0.14, 0],
        [0.06, 0.04, 0],
        [-0.08, -0.06, 0],
        [-0.10, -0.14, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.5, 3.0], [
        [-0.86, 0.26, 0.10],
        [-0.92, 0.28, 0.12],
        [-0.86, 0.26, 0.10],
      ]),
      makeQuatTrack('RightArm', [0, 0.75, 1.5, 2.25, 3.0], [
        [-0.95, -0.14, -0.12],
        [-1.46, -0.20, -0.22],
        [-1.22, 0.06, -0.16],
        [-1.38, -0.16, -0.20],
        [-0.95, -0.14, -0.12],
      ]),
    ])
  );

  // 13 — User_Flow_Analysis (Standing at Wireframe Wall analyzing UX flows and sticky notes)
  clips.push(
    new THREE.AnimationClip('User_Flow_Analysis', 3.2, [
      makePosTrack('Hips', [0, 1.6, 3.2], [
        [0, 0.72, 0],
        [0, 0.726, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.1, 2.2, 3.2], [
        [0, -0.10, 0],
        [-0.03, 0.10, 0],
        [0.02, 0.02, 0],
        [0, -0.10, 0],
      ]),
      makeQuatTrack('Head', [0, 0.8, 1.6, 2.4, 3.2], [
        [-0.06, -0.18, 0],
        [-0.10, 0.02, 0],
        [-0.04, 0.18, 0],
        [0.08, -0.04, 0],
        [-0.06, -0.18, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.6, 3.2], [
        [-0.84, 0.26, 0.10],
        [-0.88, 0.24, 0.10],
        [-0.84, 0.26, 0.10],
      ]),
      makeQuatTrack('RightArm', [0, 0.8, 1.6, 2.4, 3.2], [
        [-0.78, -0.12, -0.10],
        [-1.36, -0.24, -0.20],
        [-1.28, 0.08, -0.16],
        [-1.12, -0.14, -0.14],
        [-0.78, -0.12, -0.10],
      ]),
    ])
  );

  // 14 — Coffee_Break (Relaxed studio coffee break with ceramic latte mug)
  clips.push(
    new THREE.AnimationClip('Coffee_Break', 3.2, [
      makePosTrack('Hips', [0, 1.6, 3.2], [
        [0, 0.72, 0],
        [0, 0.726, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 1.6, 3.2], [
        [0, 0.03, 0],
        [-0.03, -0.03, 0],
        [0, 0.03, 0],
      ]),
      makeQuatTrack('Head', [0, 1.0, 1.8, 2.4, 3.2], [
        [0, 0.05, 0],
        [-0.14, 0, 0],
        [-0.16, 0, 0],
        [0.02, -0.05, 0],
        [0, 0.05, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 1.6, 3.2], [
        [0.04, 0, 0.06],
        [-0.04, 0, 0.08],
        [0.04, 0, 0.06],
      ]),
      makeQuatTrack('RightArm', [0, 1.0, 1.8, 2.4, 3.2], [
        [-0.72, -0.22, -0.08],
        [-1.32, -0.34, -0.12],
        [-1.36, -0.34, -0.12],
        [-0.78, -0.24, -0.08],
        [-0.72, -0.22, -0.08],
      ]),
    ])
  );

  // 15 — Task_Completed (Satisfied, joyful designer milestone completion gesture)
  clips.push(
    new THREE.AnimationClip('Task_Completed', 2.4, [
      makePosTrack('Hips', [0, 0.6, 1.2, 1.8, 2.4], [
        [0, 0.72, 0],
        [0, 0.748, 0],
        [0, 0.72, 0],
        [0, 0.738, 0],
        [0, 0.72, 0],
      ]),
      makeQuatTrack('Torso', [0, 0.8, 1.6, 2.4], [
        [0, 0, 0],
        [-0.06, 0.07, 0],
        [-0.04, -0.06, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('Head', [0, 0.6, 1.2, 1.8, 2.4], [
        [0, 0, 0],
        [0.15, 0.05, 0],
        [-0.08, 0, 0],
        [0.12, -0.05, 0],
        [0, 0, 0],
      ]),
      makeQuatTrack('LeftArm', [0, 0.7, 1.5, 2.4], [
        [-0.24, 0.12, 0.12],
        [-1.42, 0.16, 0.22],
        [-1.28, 0.14, 0.18],
        [-0.24, 0.12, 0.12],
      ]),
      makeQuatTrack('RightArm', [0, 0.7, 1.5, 2.4], [
        [-0.28, -0.12, -0.12],
        [-1.56, -0.16, -0.24],
        [-1.42, -0.14, -0.20],
        [-0.28, -0.12, -0.12],
      ]),
    ])
  );

  return clips;
}

function applyFacialExpressionToMeshes(
  pivots: UIUXRuntimeInstance['pivots'],
  expr: UIUXExpressionDefinition,
  elapsedSeconds = 0,
  isTalkingState = false
): void {
  const { leftEyebrow, rightEyebrow, mouthMesh } = pivots;
  leftEyebrow.position.y = 0.258 + expr.eyebrowOffsetY;
  rightEyebrow.position.y = 0.258 + expr.eyebrowOffsetY;
  leftEyebrow.rotation.z = expr.eyebrowTiltRad;
  rightEyebrow.rotation.z = -expr.eyebrowTiltRad;

  const talkPulse = isTalkingState ? Math.abs(Math.sin(elapsedSeconds * 9.5)) * 0.65 : 0;
  mouthMesh.scale.set(expr.mouthScaleX, expr.mouthScaleY + talkPulse, 1);
  mouthMesh.position.y = 0.125 + expr.mouthOffsetY;
}

/**
 * Exports a clean, standalone binary GLB buffer of the UI/UX Designer character (`uiux_designer_agent.glb`)
 * with all 15 AnimationClips embedded, in canonical rest pose at origin (0,0,0),
 * with glasses visible, neutral expression, and contextual handheld props hidden.
 */
export async function exportUIUXDesignerToGLBBuffer(): Promise<ArrayBuffer> {
  const { characterRoot, clips, pivots } = buildUIUXDesignerSceneAndClips();
  characterRoot.position.set(0, 0, 0);
  characterRoot.rotation.set(0, 0, 0);
  characterRoot.scale.set(1, 1, 1);

  pivots.glassesGroup.visible = true;
  applyFacialExpressionToMeshes(pivots, getUIUXExpressionDef('neutral'), 0, false);
  pivots.props.stylus_tablet.visible = false;
  pivots.props.stylus_pen_right.visible = false;
  pivots.props.wireframe_clipboard.visible = false;
  pivots.props.sticky_note_palette.visible = false;
  pivots.props.coffee_mug.visible = false;
  characterRoot.updateMatrixWorld(true);

  const exportScene = new THREE.Scene();
  exportScene.name = 'AI_Office_UIUX_Designer_Export_Scene';
  exportScene.add(characterRoot);

  const exporter = new GLTFExporter();
  return new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      exportScene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(new Error('Expected binary ArrayBuffer from GLTFExporter for UI/UX Designer'));
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

const WALK_SPEED_MPS = 1.95;
const TURN_SPEED_RAD_PER_SEC = 10.5;

/**
 * Creates the live runtime UI/UX Designer agent instance with AnimationMixer,
 * 15 creative studio actions, waypoint navigation, 9-step auto-demo sequence, 8 facial expressions,
 * glasses toggle, and contextual props.
 */
export function createUIUXDesignerRuntime(): UIUXRuntimeInstance {
  const rootGroup = new THREE.Group();
  rootGroup.name = UIUX_CHARACTER_CONSTANTS.RUNTIME_ROOT_NAME;

  const navigationRoot = new THREE.Group();
  navigationRoot.name = 'UIUX_NavigationRoot';
  rootGroup.add(navigationRoot);

  const orientationRoot = new THREE.Group();
  orientationRoot.name = 'UIUX_OrientationRoot';
  navigationRoot.add(orientationRoot);

  const modelRoot = new THREE.Group();
  modelRoot.name = 'UIUX_ModelRoot';
  orientationRoot.add(modelRoot);

  // Subtle mint-sage selection ring at floor level
  const ringGeom = new THREE.RingGeometry(0.28, 0.36, 32);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    name: 'UIUX_SelectionRing_Mat',
    color: 0x6ee7b7,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  const selectionRing = new THREE.Mesh(ringGeom, ringMat);
  selectionRing.name = 'UIUX_Selection_Ring';
  selectionRing.position.set(0, 0.009, 0);
  navigationRoot.add(selectionRing);

  // Overhead runtime status sprite
  const { sprite: statusLabelSprite, updateText: updateSpriteText } = createUIUXStatusSprite();
  navigationRoot.add(statusLabelSprite);

  // Build procedural voxel character + 15 clips
  const { characterRoot: characterVisualRoot, pivots, clips } = buildUIUXDesignerSceneAndClips();
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

  // Spawn at default anchor `UIUX_ROOM_IDLE`
  const defaultAnchor = DEFAULT_UIUX_ANCHORS.UIUX_ROOM_IDLE;
  navigationRoot.position.set(defaultAnchor.position[0], 0, defaultAnchor.position[2]);
  orientationRoot.rotation.y = defaultAnchor.facingRad;

  let currentState: UIUXAgentStateId = 'IDLE';
  let activeActionId: UIUXActionId = 'idle';
  let currentClipName = 'Idle_Breathing';
  let currentAnchorId: UIUXAnchorId = 'UIUX_ROOM_IDLE';
  let targetAnchorId: UIUXAnchorId = 'UIUX_ROOM_IDLE';
  let currentExpressionId: UIUXExpressionId = 'neutral';
  let glassesVisible = true;
  let activePropId: UIUXHandheldPropId = 'none';

  let speedMultiplier: 0.5 | 1 | 1.5 = 1;
  let isPaused = false;
  let isPatrolling = false;
  let patrolIndex = 0;
  let patrolDwellTimer = 0;

  let isAutoDemoRunning = false;
  let autoDemoStepIndex = 0;
  let autoDemoStepTimer = 0;

  let pathQueue: Array<[number, number]> = [];
  let pendingArrivalActionId: UIUXActionId | null = null;
  let targetFacingYaw = defaultAnchor.facingRad;

  let activeMixerAction: THREE.AnimationAction | null = null;

  function setActiveProp(propId: UIUXHandheldPropId) {
    activePropId = propId;
    pivots.props.stylus_tablet.visible = propId === 'stylus_tablet';
    pivots.props.stylus_pen_right.visible =
      propId === 'stylus_tablet' || propId === 'wireframe_clipboard';
    pivots.props.wireframe_clipboard.visible = propId === 'wireframe_clipboard';
    pivots.props.sticky_note_palette.visible = propId === 'sticky_note_palette';
    pivots.props.coffee_mug.visible = propId === 'coffee_mug';
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

  function applyActionStateImmediately(actionId: UIUXActionId) {
    const spec = getUIUXActionDef(actionId);
    activeActionId = spec.id;
    currentState = spec.targetState;
    const resolvedAnchorId: UIUXAnchorId =
      spec.targetAnchorId || currentAnchorId || 'UIUX_ROOM_IDLE';
    currentAnchorId = resolvedAnchorId;
    targetAnchorId = resolvedAnchorId;
    const anchor = DEFAULT_UIUX_ANCHORS[resolvedAnchorId];
    targetFacingYaw = anchor.facingRad;

    currentExpressionId = spec.defaultExpression;
    applyFacialExpressionToMeshes(pivots, getUIUXExpressionDef(currentExpressionId), 0, false);
    setActiveProp(spec.handheldProp);
    playClip(spec.clipName);
    updateSpriteText(spec.labelId.toUpperCase(), spec.statusBadgeText);
  }

  // Initialize default idle state
  applyActionStateImmediately('idle');

  function triggerAction(actionId: UIUXActionId, immediateTeleport = false) {
    const spec = getUIUXActionDef(actionId);
    activeActionId = spec.id;

    if (spec.id === 'walk') {
      const nextAnchorId =
        UIUX_PATROL_ANCHOR_SEQUENCE[(patrolIndex + 1) % UIUX_PATROL_ANCHOR_SEQUENCE.length];
      patrolIndex = (patrolIndex + 1) % UIUX_PATROL_ANCHOR_SEQUENCE.length;
      walkToAnchor(nextAnchorId, 'idle');
      activeActionId = 'walk';
      currentState = 'MOVING';
      currentExpressionId = 'focused';
      setActiveProp('none');
      updateSpriteText('BERJALAN', 'SIMULASI / DEMO · JALAN');
      return;
    }

    const resolvedAnchorId: UIUXAnchorId =
      spec.targetAnchorId || currentAnchorId || 'UIUX_ROOM_IDLE';
    targetAnchorId = resolvedAnchorId;
    const destAnchor = DEFAULT_UIUX_ANCHORS[resolvedAnchorId];

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

    // Route smoothly along collision-free waypoints
    const waypoints = findUIUXWalkablePath(
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

  function walkToAnchor(anchorId: UIUXAnchorId, followUpActionId: UIUXActionId = 'idle') {
    const dest = DEFAULT_UIUX_ANCHORS[anchorId];
    if (!dest) return;
    targetAnchorId = anchorId;
    const waypoints = findUIUXWalkablePath(
      [navigationRoot.position.x, navigationRoot.position.z],
      [dest.position[0], dest.position[2]]
    );
    pathQueue = waypoints;
    pendingArrivalActionId = followUpActionId;
    currentState = 'MOVING';
    playClip('Walk_Cycle', 0.18);
    updateSpriteText(`JALAN KE ${dest.label.toUpperCase()}`, 'SIMULASI / DEMO');
  }

  function walkToWorldPoint(x: number, z: number): boolean {
    const waypoints = findUIUXWalkablePath(
      [navigationRoot.position.x, navigationRoot.position.z],
      [x, z]
    );
    if (waypoints.length === 0) return false;
    isPatrolling = false;
    isAutoDemoRunning = false;
    pathQueue = waypoints;
    pendingArrivalActionId = 'idle';
    activeActionId = 'walk';
    currentState = 'MOVING';
    setActiveProp('none');
    playClip('Walk_Cycle', 0.18);
    updateSpriteText('JALAN MANUAL', 'SIMULASI / DEMO');
    return true;
  }

  function executePlayback(cmd: UIUXPlaybackCommand) {
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
      const idleAnchor = DEFAULT_UIUX_ANCHORS.UIUX_ROOM_IDLE;
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
    const firstStep = UIUX_AUTO_DEMO_SEQUENCE[0];
    autoDemoStepTimer = firstStep.durationSeconds;
    triggerAction(firstStep.actionId, false);
  }

  function stopAutoDemoSequence() {
    isAutoDemoRunning = false;
  }

  function setExpression(expressionId: UIUXExpressionId) {
    currentExpressionId = expressionId;
    applyFacialExpressionToMeshes(pivots, getUIUXExpressionDef(expressionId), 0, false);
  }

  function setGlassesVisible(visible: boolean) {
    glassesVisible = visible;
    pivots.glassesGroup.visible = visible;
  }

  function setStatusLabelVisible(visible: boolean) {
    statusLabelSprite.visible = visible;
  }

  function update(deltaSeconds: number, elapsedSeconds: number) {
    const ringScale = 1 + Math.sin(elapsedSeconds * 3.0) * 0.04;
    selectionRing.scale.set(ringScale, 1, ringScale);

    if (isPaused) return;

    const scaledDelta = deltaSeconds * speedMultiplier;
    mixer.update(scaledDelta);

    const isTalkingState =
      currentState === 'TALKING' ||
      currentState === 'PRESENTING' ||
      currentExpressionId === 'talking';
    applyFacialExpressionToMeshes(
      pivots,
      getUIUXExpressionDef(currentExpressionId),
      elapsedSeconds,
      isTalkingState
    );

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
      const yawDiff = normalizeAngleDiff(targetFacingYaw, orientationRoot.rotation.y);
      if (Math.abs(yawDiff) > 0.004) {
        orientationRoot.rotation.y +=
          yawDiff * Math.min(1, TURN_SPEED_RAD_PER_SEC * scaledDelta);
      }

      if (isAutoDemoRunning) {
        autoDemoStepTimer -= scaledDelta;
        if (autoDemoStepTimer <= 0) {
          autoDemoStepIndex = (autoDemoStepIndex + 1) % UIUX_AUTO_DEMO_SEQUENCE.length;
          const nextStep = UIUX_AUTO_DEMO_SEQUENCE[autoDemoStepIndex];
          autoDemoStepTimer = nextStep.durationSeconds;
          triggerAction(nextStep.actionId, false);
        }
      } else if (isPatrolling) {
        patrolDwellTimer -= scaledDelta;
        if (patrolDwellTimer <= 0) {
          patrolIndex = (patrolIndex + 1) % UIUX_PATROL_ANCHOR_SEQUENCE.length;
          const nextAnchorId = UIUX_PATROL_ANCHOR_SEQUENCE[patrolIndex];
          patrolDwellTimer = 3.5;
          walkToAnchor(nextAnchorId, 'idle');
        }
      }
    }
  }

  function getStatus(): UIUXRuntimeStatus {
    const spec = getUIUXActionDef(activeActionId);
    const pos: [number, number, number] = [
      Number(navigationRoot.position.x.toFixed(3)),
      Number(navigationRoot.position.y.toFixed(3)),
      Number(navigationRoot.position.z.toFixed(3)),
    ];
    const yawDeg = Math.round(((orientationRoot.rotation.y * 180) / Math.PI + 360) % 360);
    const walking = pathQueue.length > 0 || currentState === 'MOVING';
    const bText = walking
      ? `Menuju ${DEFAULT_UIUX_ANCHORS[targetAnchorId].label}...`
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
      autoDemoTotalSteps: UIUX_AUTO_DEMO_SEQUENCE.length,
      autoDemoStepTitle: isAutoDemoRunning
        ? UIUX_AUTO_DEMO_SEQUENCE[autoDemoStepIndex]?.stepTitle ?? null
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
 * Builds visual debug helpers for the UI/UX Design Studio walkable waypoint network.
 */
export function buildUIUXSimulationHelpersGroup(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'UIUX_Simulation_Path_Helpers';

  const nodeGeom = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16);
  const nodeMat = new THREE.MeshBasicMaterial({
    color: 0x6ee7b7,
    transparent: true,
    opacity: 0.85,
  });
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xa7f3d0,
    transparent: true,
    opacity: 0.65,
  });

  const nodeMap = new Map(UIUX_WALK_WAYPOINTS.map((w) => [w.id, w]));

  for (const wp of UIUX_WALK_WAYPOINTS) {
    const marker = new THREE.Mesh(nodeGeom, nodeMat);
    marker.position.set(wp.position[0], 0.025, wp.position[1]);
    marker.name = `UIUX_Waypoint_${wp.id}`;
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
