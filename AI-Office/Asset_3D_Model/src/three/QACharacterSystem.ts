import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import {
  DEFAULT_QA_DEVOPS_ANCHORS,
  QADevOpsAnchorId,
} from '../domain/qaDevopsRoomSpec';
import {
  QA_ACTIONS,
  QA_AUTO_DEMO_SEQUENCE,
  QA_CHARACTER_CONSTANTS,
  QA_EXPRESSION_PRESETS,
  QA_HAIR_MATERIAL_PALETTE,
  QA_OUTFIT_PALETTE,
  QA_PATROL_ANCHOR_RING,
  QAActionId,
  QAAgentState,
  QAAnimationClipName,
  QAAnimationPlaybackCommand,
  QAExpressionId,
  QAPropId,
  QARuntimeIndicatorId,
  QASimulationRuntimeStatus,
  QASpeedMultiplier,
  findQAWalkablePath,
  getQADefaultAnchorPositionAndFacing,
} from '../domain/qaSimulationSpec';

export interface QAMaterialPalette {
  // 5-Tone Matte Dark Chestnut / Chocolate / Warm Reddish-Brown Hair Palette + Gold Clip
  hairDarkChestnut: THREE.MeshStandardMaterial;
  hairDeepChocolate: THREE.MeshStandardMaterial;
  hairWarmReddishMid: THREE.MeshStandardMaterial;
  hairCaramelHighlight: THREE.MeshStandardMaterial;
  hairAuburnAccent: THREE.MeshStandardMaterial;
  hairClipGold: THREE.MeshStandardMaterial;
  hairTieBandDark: THREE.MeshStandardMaterial;

  // Skin & Face
  skinBase: THREE.MeshStandardMaterial;
  skinShadow: THREE.MeshStandardMaterial;
  cheekBlush: THREE.MeshStandardMaterial;
  eyeDark: THREE.MeshStandardMaterial;
  eyeHighlight: THREE.MeshStandardMaterial;
  eyebrowBrown: THREE.MeshStandardMaterial;
  mouthWarm: THREE.MeshStandardMaterial;

  // QA Outfit (Black / White / Gold-Yellow Technical Uniform)
  jacketCharcoal: THREE.MeshStandardMaterial;
  jacketDeepBlack: THREE.MeshStandardMaterial;
  innerHoodieWhite: THREE.MeshStandardMaterial;
  innerCollarShadow: THREE.MeshStandardMaterial;
  qaGoldYellow: THREE.MeshStandardMaterial;
  qaAmberAccent: THREE.MeshStandardMaterial;
  trousersCharcoal: THREE.MeshStandardMaterial;
  trousersCuffDark: THREE.MeshStandardMaterial;
  sneakerWhite: THREE.MeshStandardMaterial;
  sneakerSoleDark: THREE.MeshStandardMaterial;

  // QA Backpack & Optional Headset / Glasses
  backpackBlack: THREE.MeshStandardMaterial;
  backpackPocketSlate: THREE.MeshStandardMaterial;
  headsetBandBlack: THREE.MeshStandardMaterial;
  headsetPadYellow: THREE.MeshStandardMaterial;
  headsetSilverAccent: THREE.MeshStandardMaterial;
  glassesFrameBlack: THREE.MeshStandardMaterial;
  glassesLensClear: THREE.MeshStandardMaterial;

  // Props & Runtime Indicators
  laptopSilver: THREE.MeshStandardMaterial;
  laptopScreenDark: THREE.MeshStandardMaterial;
  bugAlertRed: THREE.MeshStandardMaterial;
  passEmeraldGreen: THREE.MeshStandardMaterial;
  paperWhite: THREE.MeshStandardMaterial;
  clipboardBoard: THREE.MeshStandardMaterial;
  mugCeramicWhite: THREE.MeshStandardMaterial;
  coffeeLiquid: THREE.MeshStandardMaterial;
  glassLensCyan: THREE.MeshStandardMaterial;
}

export function createQAMaterialPalette(): QAMaterialPalette {
  const mat = (
    name: string,
    hex: string,
    roughness = 0.84,
    metalness = 0.04,
    extra: Partial<THREE.MeshStandardMaterialParameters> = {}
  ) =>
    new THREE.MeshStandardMaterial({
      name,
      color: new THREE.Color(hex),
      roughness,
      metalness,
      ...extra,
    });

  return {
    hairDarkChestnut: mat(
      QA_HAIR_MATERIAL_PALETTE[0].id,
      QA_HAIR_MATERIAL_PALETTE[0].hex,
      QA_HAIR_MATERIAL_PALETTE[0].roughness,
      QA_HAIR_MATERIAL_PALETTE[0].metalness
    ),
    hairDeepChocolate: mat(
      QA_HAIR_MATERIAL_PALETTE[1].id,
      QA_HAIR_MATERIAL_PALETTE[1].hex,
      QA_HAIR_MATERIAL_PALETTE[1].roughness,
      QA_HAIR_MATERIAL_PALETTE[1].metalness
    ),
    hairWarmReddishMid: mat(
      QA_HAIR_MATERIAL_PALETTE[2].id,
      QA_HAIR_MATERIAL_PALETTE[2].hex,
      QA_HAIR_MATERIAL_PALETTE[2].roughness,
      QA_HAIR_MATERIAL_PALETTE[2].metalness
    ),
    hairCaramelHighlight: mat(
      QA_HAIR_MATERIAL_PALETTE[3].id,
      QA_HAIR_MATERIAL_PALETTE[3].hex,
      QA_HAIR_MATERIAL_PALETTE[3].roughness,
      QA_HAIR_MATERIAL_PALETTE[3].metalness
    ),
    hairAuburnAccent: mat(
      QA_HAIR_MATERIAL_PALETTE[4].id,
      QA_HAIR_MATERIAL_PALETTE[4].hex,
      QA_HAIR_MATERIAL_PALETTE[4].roughness,
      QA_HAIR_MATERIAL_PALETTE[4].metalness
    ),
    hairClipGold: mat(
      QA_HAIR_MATERIAL_PALETTE[5].id,
      QA_HAIR_MATERIAL_PALETTE[5].hex,
      QA_HAIR_MATERIAL_PALETTE[5].roughness,
      QA_HAIR_MATERIAL_PALETTE[5].metalness
    ),
    hairTieBandDark: mat('qa_hair_tie_band_dark', '#181312', 0.85, 0.05),

    skinBase: mat('qa_skin_warm_beige', QA_OUTFIT_PALETTE.skinBase, 0.82, 0.02),
    skinShadow: mat('qa_skin_shadow', QA_OUTFIT_PALETTE.skinShadow, 0.84, 0.02),
    cheekBlush: mat('qa_cheek_blush', QA_OUTFIT_PALETTE.cheekBlush, 0.85, 0.02, {
      transparent: true,
      opacity: 0.85,
    }),
    eyeDark: mat('qa_eye_dark', QA_OUTFIT_PALETTE.eyeDark, 0.35, 0.08),
    eyeHighlight: mat('qa_eye_highlight', QA_OUTFIT_PALETTE.eyeHighlight, 0.25, 0.05, {
      emissive: new THREE.Color('#FFFFFF'),
      emissiveIntensity: 0.14,
    }),
    eyebrowBrown: mat('qa_eyebrow_brown', QA_OUTFIT_PALETTE.eyebrowBrown, 0.88, 0.02),
    mouthWarm: mat('qa_mouth_warm', QA_OUTFIT_PALETTE.mouthWarm, 0.78, 0.02),

    jacketCharcoal: mat('qa_jacket_charcoal', QA_OUTFIT_PALETTE.jacketCharcoal, 0.83, 0.06),
    jacketDeepBlack: mat('qa_jacket_deep_black', QA_OUTFIT_PALETTE.jacketDeepBlack, 0.86, 0.05),
    innerHoodieWhite: mat('qa_inner_hoodie_white', QA_OUTFIT_PALETTE.innerHoodieWhite, 0.8, 0.03),
    innerCollarShadow: mat('qa_inner_collar_shadow', QA_OUTFIT_PALETTE.innerCollarShadow, 0.84, 0.03),
    qaGoldYellow: mat('qa_gold_yellow_trim', QA_OUTFIT_PALETTE.qaGoldYellow, 0.42, 0.18),
    qaAmberAccent: mat('qa_amber_accent', QA_OUTFIT_PALETTE.qaAmberAccent, 0.48, 0.16),
    trousersCharcoal: mat('qa_trousers_charcoal', QA_OUTFIT_PALETTE.trousersCharcoal, 0.85, 0.04),
    trousersCuffDark: mat('qa_trousers_cuff_dark', QA_OUTFIT_PALETTE.trousersCuffDark, 0.88, 0.04),
    sneakerWhite: mat('qa_sneaker_white', QA_OUTFIT_PALETTE.sneakerWhite, 0.76, 0.04),
    sneakerSoleDark: mat('qa_sneaker_sole_dark', QA_OUTFIT_PALETTE.sneakerSoleDark, 0.9, 0.03),

    backpackBlack: mat('qa_backpack_black', QA_OUTFIT_PALETTE.backpackBlack, 0.84, 0.06),
    backpackPocketSlate: mat(
      'qa_backpack_pocket_slate',
      QA_OUTFIT_PALETTE.backpackPocketSlate,
      0.82,
      0.06
    ),
    headsetBandBlack: mat('qa_headset_band_black', QA_OUTFIT_PALETTE.headsetBandBlack, 0.65, 0.15),
    headsetPadYellow: mat('qa_headset_pad_yellow', QA_OUTFIT_PALETTE.headsetPadYellow, 0.45, 0.16),
    headsetSilverAccent: mat('qa_headset_silver_accent', '#E5E7EB', 0.4, 0.25),
    glassesFrameBlack: mat(
      'qa_glasses_frame_black',
      QA_OUTFIT_PALETTE.glassesFrameBlack,
      0.42,
      0.16
    ),
    glassesLensClear: mat('qa_glasses_lens_clear', '#E0F2FE', 0.18, 0.1, {
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),

    laptopSilver: mat('qa_prop_laptop_silver', '#CBD5E1', 0.45, 0.32),
    laptopScreenDark: mat('qa_prop_laptop_screen', '#0F172A', 0.35, 0.12, {
      emissive: new THREE.Color('#1E293B'),
      emissiveIntensity: 0.25,
    }),
    bugAlertRed: mat('qa_prop_bug_alert_red', QA_OUTFIT_PALETTE.bugAlertRed, 0.4, 0.1, {
      emissive: new THREE.Color('#EF4444'),
      emissiveIntensity: 0.28,
    }),
    passEmeraldGreen: mat(
      'qa_prop_pass_emerald_green',
      QA_OUTFIT_PALETTE.passEmeraldGreen,
      0.42,
      0.1,
      {
        emissive: new THREE.Color('#10B981'),
        emissiveIntensity: 0.22,
      }
    ),
    paperWhite: mat('qa_prop_paper_white', '#F8FAFC', 0.85, 0.02),
    clipboardBoard: mat('qa_prop_clipboard_board', '#334155', 0.76, 0.08),
    mugCeramicWhite: mat('qa_prop_mug_white', '#F8FAFC', 0.5, 0.06),
    coffeeLiquid: mat('qa_prop_coffee_liquid', '#3E2723', 0.35, 0.05),
    glassLensCyan: mat('qa_prop_magnifying_lens', '#BAE6FD', 0.2, 0.12, {
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    }),
  };
}

function makeBox(
  name: string,
  size: [number, number, number],
  pos: [number, number, number],
  material: THREE.Material,
  rot: [number, number, number] = [0, 0, 0]
): THREE.Mesh {
  const geom = new THREE.BoxGeometry(size[0], size[1], size[2]);
  const mesh = new THREE.Mesh(geom, material);
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  if (rot[0] !== 0 || rot[1] !== 0 || rot[2] !== 0) {
    mesh.rotation.set(rot[0], rot[1], rot[2]);
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export interface BuiltQAFaceNodes {
  faceGroup: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftPupil: THREE.Mesh;
  rightPupil: THREE.Mesh;
  leftHighlight: THREE.Mesh;
  rightHighlight: THREE.Mesh;
  leftEyebrow: THREE.Mesh;
  rightEyebrow: THREE.Mesh;
  mouth: THREE.Mesh;
  leftCheek: THREE.Mesh;
  rightCheek: THREE.Mesh;
}

/**
 * Builds the 360-degree Layered Dark Chestnut-Brown Voxel Hairstyle (`Hair` group)
 * with 8 required semantic sub-groups:
 * - `Hair_Base`
 * - `Hair_Crown`
 * - `Hair_Fringe`
 * - `Hair_High_Bun` (`PonytailPivot`)
 * - `Hair_Left_Side`
 * - `Hair_Right_Side`
 * - `Hair_Back_Layers`
 * - `Hair_Clip_Gold`
 */
function buildQALayeredHairGroup(palette: QAMaterialPalette): {
  hairGroup: THREE.Group;
  highBunGroup: THREE.Group;
  hairClipGroup: THREE.Group;
} {
  const hairGroup = new THREE.Group();
  hairGroup.name = 'Hair';

  // 1. Hair_Base — Core volumetric cranium cap above and behind the skull
  const hairBase = new THREE.Group();
  hairBase.name = 'Hair_Base';
  hairGroup.add(hairBase);

  hairBase.add(
    makeBox('Hair_Base_Core_Upper', [0.372, 0.124, 0.352], [0, 0.326, -0.008], palette.hairDarkChestnut),
    makeBox('Hair_Base_Rear_Upper', [0.364, 0.176, 0.136], [0, 0.252, -0.142], palette.hairDeepChocolate),
    makeBox('Hair_Base_Top_Foundation', [0.348, 0.052, 0.326], [0, 0.382, -0.012], palette.hairWarmReddishMid)
  );

  // 2. Hair_Crown — Sculpted multi-layered upper crown volume (non-flat 360° silhouette)
  const hairCrown = new THREE.Group();
  hairCrown.name = 'Hair_Crown';
  hairGroup.add(hairCrown);

  hairCrown.add(
    makeBox('Hair_Crown_Layer_1', [0.316, 0.04, 0.292], [0, 0.402, -0.012], palette.hairDarkChestnut),
    makeBox('Hair_Crown_Layer_2_Left', [0.148, 0.032, 0.236], [-0.068, 0.418, -0.008], palette.hairWarmReddishMid),
    makeBox('Hair_Crown_Layer_2_Right', [0.148, 0.032, 0.236], [0.066, 0.416, -0.01], palette.hairCaramelHighlight),
    makeBox('Hair_Crown_Part_Ridge', [0.096, 0.026, 0.204], [0.024, 0.426, 0.012], palette.hairCaramelHighlight),
    makeBox('Hair_Crown_Rear_Bridge', [0.264, 0.036, 0.136], [0, 0.408, -0.112], palette.hairAuburnAccent)
  );

  // 3. Hair_Fringe — Asymmetric side-swept front bangs framing forehead without covering eyes
  // Forehead bangs sit cleanly above eyebrows (Y = 0.236) and eyes (Y = 0.184)
  const hairFringe = new THREE.Group();
  hairFringe.name = 'Hair_Fringe';
  hairGroup.add(hairFringe);

  hairFringe.add(
    makeBox('Hair_Fringe_Upper_Band', [0.364, 0.062, 0.068], [0, 0.342, 0.156], palette.hairDarkChestnut),
    makeBox('Hair_Fringe_Sweep_Center_Right', [0.146, 0.058, 0.062], [0.046, 0.304, 0.168], palette.hairWarmReddishMid),
    makeBox('Hair_Fringe_Sweep_Right_Tip', [0.104, 0.056, 0.058], [0.118, 0.284, 0.166], palette.hairCaramelHighlight),
    makeBox('Hair_Fringe_Left_Part_Block', [0.128, 0.056, 0.062], [-0.092, 0.308, 0.166], palette.hairDarkChestnut),
    makeBox('Hair_Fringe_Left_Brow_Frame', [0.088, 0.054, 0.056], [-0.136, 0.278, 0.164], palette.hairAuburnAccent),
    makeBox('Hair_Fringe_Center_Accent', [0.072, 0.044, 0.054], [-0.014, 0.292, 0.172], palette.hairCaramelHighlight)
  );

  // 4. Hair_High_Bun (PonytailPivot) — Signature tied-up high bun / ponytail cluster at rear-top crown
  // Max Y reaches 0.475 above Head (1.260 + 0.475 = 1.735u total character height!)
  const highBunGroup = new THREE.Group();
  highBunGroup.name = 'Hair_High_Bun';
  hairGroup.add(highBunGroup);

  highBunGroup.add(
    // Dark hair-tie band at the base of the high bun
    makeBox('Hair_Bun_Tie_Band', [0.148, 0.036, 0.148], [0, 0.392, -0.122], palette.hairTieBandDark),
    makeBox('Hair_Bun_Tie_Gold_Clasp', [0.052, 0.024, 0.026], [0, 0.392, -0.196], palette.hairClipGold),
    // Multi-layered voluminous voxel bun / ponytail cluster
    makeBox('Hair_Bun_Core_Center', [0.192, 0.076, 0.182], [0, 0.432, -0.134], palette.hairDarkChestnut),
    makeBox('Hair_Bun_Upper_Crest', [0.152, 0.034, 0.144], [0, 0.458, -0.132], palette.hairCaramelHighlight),
    makeBox('Hair_Bun_Left_Lobe', [0.048, 0.064, 0.142], [-0.106, 0.43, -0.134], palette.hairWarmReddishMid),
    makeBox('Hair_Bun_Right_Lobe', [0.048, 0.064, 0.142], [0.106, 0.43, -0.134], palette.hairAuburnAccent),
    makeBox('Hair_Bun_Rear_Tail_Upper', [0.156, 0.068, 0.058], [0, 0.422, -0.228], palette.hairWarmReddishMid),
    makeBox('Hair_Bun_Rear_Tail_Lower', [0.128, 0.074, 0.054], [0, 0.368, -0.236], palette.hairDeepChocolate),
    makeBox('Hair_Bun_Rear_Tip_Left', [0.054, 0.052, 0.046], [-0.044, 0.338, -0.242], palette.hairAuburnAccent),
    makeBox('Hair_Bun_Rear_Tip_Right', [0.054, 0.052, 0.046], [0.044, 0.342, -0.242], palette.hairCaramelHighlight)
  );

  // 5. Hair_Left_Side — Fuller stepped left temple and cheek-framing side locks (leaving Ear_Left visible)
  const hairLeftSide = new THREE.Group();
  hairLeftSide.name = 'Hair_Left_Side';
  hairGroup.add(hairLeftSide);

  hairLeftSide.add(
    makeBox('Hair_Left_Temple_Upper', [0.064, 0.112, 0.176], [-0.178, 0.286, 0.072], palette.hairDarkChestnut),
    makeBox('Hair_Left_Cheek_Lock_Mid', [0.058, 0.108, 0.082], [-0.174, 0.196, 0.118], palette.hairWarmReddishMid),
    makeBox('Hair_Left_Cheek_Lock_Tip', [0.05, 0.088, 0.068], [-0.166, 0.114, 0.124], palette.hairCaramelHighlight),
    makeBox('Hair_Left_Jaw_Soft_Tuft', [0.044, 0.058, 0.056], [-0.156, 0.064, 0.118], palette.hairAuburnAccent),
    makeBox('Hair_Left_Behind_Ear', [0.064, 0.192, 0.128], [-0.178, 0.192, -0.104], palette.hairDeepChocolate),
    makeBox('Hair_Left_Lower_Taper', [0.056, 0.092, 0.106], [-0.168, 0.078, -0.108], palette.hairAuburnAccent)
  );

  // 6. Hair_Right_Side — Fuller stepped right temple and cheek-framing side locks (leaving Ear_Right visible)
  const hairRightSide = new THREE.Group();
  hairRightSide.name = 'Hair_Right_Side';
  hairGroup.add(hairRightSide);

  hairRightSide.add(
    makeBox('Hair_Right_Temple_Upper', [0.064, 0.112, 0.176], [0.178, 0.286, 0.072], palette.hairDarkChestnut),
    makeBox('Hair_Right_Cheek_Lock_Mid', [0.058, 0.108, 0.082], [0.174, 0.196, 0.118], palette.hairWarmReddishMid),
    makeBox('Hair_Right_Cheek_Lock_Tip', [0.05, 0.088, 0.068], [0.166, 0.114, 0.124], palette.hairAuburnAccent),
    makeBox('Hair_Right_Jaw_Soft_Tuft', [0.044, 0.058, 0.056], [0.156, 0.064, 0.118], palette.hairCaramelHighlight),
    makeBox('Hair_Right_Behind_Ear', [0.064, 0.192, 0.128], [0.178, 0.192, -0.104], palette.hairDeepChocolate),
    makeBox('Hair_Right_Lower_Taper', [0.056, 0.092, 0.106], [0.168, 0.078, -0.108], palette.hairWarmReddishMid)
  );

  // 7. Hair_Back_Layers — Sculpted rear hair layers tapering cleanly above collar
  const hairBackLayers = new THREE.Group();
  hairBackLayers.name = 'Hair_Back_Layers';
  hairGroup.add(hairBackLayers);

  hairBackLayers.add(
    makeBox('Hair_Back_Upper_Shell', [0.352, 0.132, 0.064], [0, 0.276, -0.184], palette.hairDarkChestnut),
    makeBox('Hair_Back_Mid_Layer', [0.336, 0.124, 0.066], [0, 0.172, -0.188], palette.hairWarmReddishMid),
    makeBox('Hair_Back_Left_Cluster', [0.116, 0.112, 0.054], [-0.102, 0.155, -0.198], palette.hairAuburnAccent),
    makeBox('Hair_Back_Right_Cluster', [0.116, 0.112, 0.054], [0.102, 0.155, -0.198], palette.hairCaramelHighlight),
    makeBox('Hair_Back_Nape_Taper', [0.284, 0.078, 0.056], [0, 0.086, -0.178], palette.hairDeepChocolate),
    makeBox('Hair_Back_Nape_Center_Tip', [0.156, 0.048, 0.048], [0, 0.042, -0.172], palette.hairDarkChestnut)
  );

  // 8. Hair_Clip_Gold — Signature 3D square hollow gold/yellow hair clip on left-front hair lock
  // Positioned cleanly in front of Hair_Fringe_Left_Part_Block / Hair_Left_Temple_Upper with zero Z-fighting
  const hairClipGroup = new THREE.Group();
  hairClipGroup.name = 'Hair_Clip_Gold';
  hairGroup.add(hairClipGroup);

  hairClipGroup.add(
    makeBox('Hair_Clip_Gold_Top_Bar', [0.056, 0.014, 0.024], [-0.152, 0.326, 0.186], palette.hairClipGold),
    makeBox('Hair_Clip_Gold_Bottom_Bar', [0.056, 0.014, 0.024], [-0.152, 0.284, 0.186], palette.hairClipGold),
    makeBox('Hair_Clip_Gold_Left_Bar', [0.014, 0.056, 0.024], [-0.173, 0.305, 0.186], palette.hairClipGold),
    makeBox('Hair_Clip_Gold_Right_Bar', [0.014, 0.056, 0.024], [-0.131, 0.305, 0.186], palette.hairClipGold),
    makeBox('Hair_Clip_Recess_Center', [0.028, 0.028, 0.018], [-0.152, 0.305, 0.183], palette.hairDeepChocolate)
  );

  return {
    hairGroup,
    highBunGroup,
    hairClipGroup,
  };
}

/**
 * Builds the Expressive Voxel Face (`Face` group) with NO default eyeglasses,
 * plus optional `Glasses` and `Headset` groups.
 */
function buildQAFaceAndHeadAccessories(palette: QAMaterialPalette): {
  faceNodes: BuiltQAFaceNodes;
  earsGroup: THREE.Group;
  glassesGroup: THREE.Group;
  headsetGroup: THREE.Group;
} {
  const faceGroup = new THREE.Group();
  faceGroup.name = 'Face';

  // Eyes (front of head is at Z = +0.156; step facial planes to Z = +0.160..+0.168 to prevent Z-fighting)
  const leftEye = makeBox('Eye_Left', [0.05, 0.062, 0.014], [-0.072, 0.184, 0.16], palette.eyeDark);
  const rightEye = makeBox('Eye_Right', [0.05, 0.062, 0.014], [0.072, 0.184, 0.16], palette.eyeDark);

  const leftPupil = makeBox('Pupil_Left', [0.028, 0.038, 0.014], [-0.07, 0.182, 0.164], palette.eyeDark);
  const rightPupil = makeBox('Pupil_Right', [0.028, 0.038, 0.014], [0.07, 0.182, 0.164], palette.eyeDark);

  const leftHighlight = makeBox(
    'Eye_Highlight_Left',
    [0.015, 0.016, 0.014],
    [-0.08, 0.2, 0.168],
    palette.eyeHighlight
  );
  const rightHighlight = makeBox(
    'Eye_Highlight_Right',
    [0.015, 0.016, 0.014],
    [0.062, 0.2, 0.168],
    palette.eyeHighlight
  );

  const leftEyebrow = makeBox(
    'Eyebrow_Left',
    [0.062, 0.016, 0.016],
    [-0.072, 0.236, 0.163],
    palette.eyebrowBrown
  );
  const rightEyebrow = makeBox(
    'Eyebrow_Right',
    [0.062, 0.016, 0.016],
    [0.072, 0.236, 0.163],
    palette.eyebrowBrown
  );

  const nose = makeBox('Nose_Center', [0.026, 0.024, 0.022], [0, 0.152, 0.166], palette.skinShadow);
  const mouth = makeBox('Mouth_Center', [0.048, 0.015, 0.014], [0, 0.112, 0.161], palette.mouthWarm);

  const leftCheek = makeBox(
    'Cheek_Blush_Left',
    [0.042, 0.022, 0.012],
    [-0.108, 0.144, 0.16],
    palette.cheekBlush
  );
  const rightCheek = makeBox(
    'Cheek_Blush_Right',
    [0.042, 0.022, 0.012],
    [0.108, 0.144, 0.16],
    palette.cheekBlush
  );

  faceGroup.add(
    leftEye,
    rightEye,
    leftPupil,
    rightPupil,
    leftHighlight,
    rightHighlight,
    leftEyebrow,
    rightEyebrow,
    nose,
    mouth,
    leftCheek,
    rightCheek
  );

  // Ears (`Ear_Left` & `Ear_Right`) clearly visible between front side locks and behind-ear hair
  const earsGroup = new THREE.Group();
  earsGroup.name = 'Ears';
  earsGroup.add(
    makeBox('Ear_Left', [0.036, 0.068, 0.052], [-0.18, 0.18, -0.012], palette.skinBase),
    makeBox('Ear_Inner_Left', [0.016, 0.036, 0.028], [-0.192, 0.18, -0.012], palette.skinShadow),
    makeBox('Ear_Right', [0.036, 0.068, 0.052], [0.18, 0.18, -0.012], palette.skinBase),
    makeBox('Ear_Inner_Right', [0.016, 0.036, 0.028], [0.192, 0.18, -0.012], palette.skinShadow)
  );

  // Optional Glasses Group (hidden by default per Section 6: "No default eyeglasses")
  const glassesGroup = new THREE.Group();
  glassesGroup.name = 'Glasses';
  glassesGroup.visible = false;

  glassesGroup.add(
    makeBox('Glasses_Rim_Top_Left', [0.092, 0.012, 0.018], [-0.074, 0.22, 0.178], palette.glassesFrameBlack),
    makeBox('Glasses_Rim_Bottom_Left', [0.092, 0.011, 0.018], [-0.074, 0.15, 0.178], palette.glassesFrameBlack),
    makeBox('Glasses_Rim_Outer_Left', [0.012, 0.08, 0.018], [-0.114, 0.185, 0.178], palette.glassesFrameBlack),
    makeBox('Glasses_Rim_Inner_Left', [0.011, 0.08, 0.018], [-0.034, 0.185, 0.178], palette.glassesFrameBlack),
    makeBox('Glasses_Lens_Left', [0.07, 0.058, 0.006], [-0.074, 0.185, 0.177], palette.glassesLensClear),

    makeBox('Glasses_Rim_Top_Right', [0.092, 0.012, 0.018], [0.074, 0.22, 0.178], palette.glassesFrameBlack),
    makeBox('Glasses_Rim_Bottom_Right', [0.092, 0.011, 0.018], [0.074, 0.15, 0.178], palette.glassesFrameBlack),
    makeBox('Glasses_Rim_Outer_Right', [0.012, 0.08, 0.018], [0.114, 0.185, 0.178], palette.glassesFrameBlack),
    makeBox('Glasses_Rim_Inner_Right', [0.011, 0.08, 0.018], [0.034, 0.185, 0.178], palette.glassesFrameBlack),
    makeBox('Glasses_Lens_Right', [0.07, 0.058, 0.006], [0.074, 0.185, 0.177], palette.glassesLensClear),

    makeBox('Glasses_Bridge_Center', [0.056, 0.012, 0.018], [0, 0.202, 0.178], palette.glassesFrameBlack),
    makeBox('Glasses_Temple_Left', [0.012, 0.012, 0.185], [-0.168, 0.202, 0.082], palette.glassesFrameBlack),
    makeBox('Glasses_Temple_Right', [0.012, 0.012, 0.185], [0.168, 0.202, 0.082], palette.glassesFrameBlack)
  );

  // Optional Black-and-Yellow QA Headset (`Headset` group — matches reference sheet front-right/front-left headphone views)
  // Designed to arch cleanly over the mid-crown (Z = -0.012) without intersecting Hair_Clip_Gold or Hair_High_Bun
  const headsetGroup = new THREE.Group();
  headsetGroup.name = 'Headset';
  headsetGroup.visible = false;

  headsetGroup.add(
    makeBox('Headset_Top_Arch_Center', [0.336, 0.022, 0.036], [0, 0.438, -0.012], palette.headsetBandBlack),
    makeBox('Headset_Top_Pad_Yellow', [0.19, 0.012, 0.032], [0, 0.426, -0.012], palette.headsetPadYellow),
    makeBox('Headset_Side_Band_Left', [0.022, 0.21, 0.034], [-0.196, 0.322, -0.012], palette.headsetBandBlack),
    makeBox('Headset_Side_Band_Right', [0.022, 0.21, 0.034], [0.196, 0.322, -0.012], palette.headsetBandBlack),
    makeBox('Headset_EarCup_Left_Base', [0.038, 0.096, 0.088], [-0.202, 0.184, -0.012], palette.headsetSilverAccent),
    makeBox('Headset_EarCup_Left_Yellow_Ring', [0.016, 0.068, 0.062], [-0.224, 0.184, -0.012], palette.headsetPadYellow),
    makeBox('Headset_EarCup_Right_Base', [0.038, 0.096, 0.088], [0.202, 0.184, -0.012], palette.headsetSilverAccent),
    makeBox('Headset_EarCup_Right_Yellow_Ring', [0.016, 0.068, 0.062], [0.224, 0.184, -0.012], palette.headsetPadYellow),
    makeBox('Headset_Mic_Boom_Arm', [0.014, 0.014, 0.115], [-0.194, 0.13, 0.052], palette.headsetBandBlack),
    makeBox('Headset_Mic_Tip_Yellow', [0.022, 0.022, 0.026], [-0.178, 0.124, 0.116], palette.headsetPadYellow)
  );

  return {
    faceNodes: {
      faceGroup,
      leftEye,
      rightEye,
      leftPupil,
      rightPupil,
      leftHighlight,
      rightHighlight,
      leftEyebrow,
      rightEyebrow,
      mouth,
      leftCheek,
      rightCheek,
    },
    earsGroup,
    glassesGroup,
    headsetGroup,
  };
}

/**
 * Builds the QA Engineer Outfit (`QAUniform`, `InnerHoodieShirt`) and `Backpack`
 * matching the Voxel QA Engineer Character Sheet:
 * - Crisp white inner hoodie/collared shirt with white lower sleeves/cuffs
 * - Dark charcoal/black technical QA jacket/vest with bright yellow/gold trim & zipper details
 * - 3D yellow/gold `QA` emblem on left sleeve/shoulder
 * - Compact black QA backpack with yellow straps, side pockets, and 3D yellow `QA` rear badge
 */
function buildQATorsoAndBackpack(palette: QAMaterialPalette): {
  torsoGroup: THREE.Group;
  qaUniformGroup: THREE.Group;
  innerShirtGroup: THREE.Group;
  backpackGroup: THREE.Group;
} {
  const torsoGroup = new THREE.Group();
  torsoGroup.name = 'Torso';
  // Attached at [0, 0, 0] on Hips (consistent with Database & Research characters) so there is zero waist gap
  torsoGroup.position.set(0, 0, 0);

  const innerShirtGroup = new THREE.Group();
  innerShirtGroup.name = 'InnerHoodieShirt';
  torsoGroup.add(innerShirtGroup);

  innerShirtGroup.add(
    // Solid Neck Column bridging Torso (Y = 0.356) into Head (Y = 0.360..0.420)
    makeBox('Neck_Column', [0.136, 0.088, 0.128], [0, 0.365, -0.002], palette.skinBase),
    // Crisp white hoodie collar & hood rim framing the neckline (matches Character Sheet!)
    makeBox('Hoodie_Collar_Left', [0.086, 0.062, 0.188], [-0.104, 0.348, 0.008], palette.innerHoodieWhite),
    makeBox('Hoodie_Collar_Right', [0.086, 0.062, 0.188], [0.104, 0.348, 0.008], palette.innerHoodieWhite),
    makeBox('Hoodie_Collar_Back', [0.264, 0.068, 0.082], [0, 0.354, -0.078], palette.innerHoodieWhite),
    makeBox('Hoodie_Collar_Front_Left_Lapel', [0.054, 0.048, 0.028], [-0.056, 0.336, 0.098], palette.innerHoodieWhite),
    makeBox('Hoodie_Collar_Front_Right_Lapel', [0.054, 0.048, 0.028], [0.056, 0.336, 0.098], palette.innerHoodieWhite),
    // White inner front shirt panel & subtle yellow chest graphic
    makeBox('Inner_Shirt_Chest_Center', [0.128, 0.315, 0.186], [0, 0.182, 0.012], palette.innerHoodieWhite),
    makeBox('Inner_Shirt_Neck_V_Shadow', [0.068, 0.046, 0.016], [0, 0.312, 0.102], palette.innerCollarShadow),
    makeBox('Inner_Shirt_Graphic_Gold_Top', [0.064, 0.024, 0.014], [0, 0.228, 0.104], palette.qaGoldYellow),
    makeBox('Inner_Shirt_Graphic_Gold_Bottom', [0.046, 0.018, 0.014], [0, 0.194, 0.104], palette.qaAmberAccent)
  );

  const qaUniformGroup = new THREE.Group();
  qaUniformGroup.name = 'QAUniform';
  torsoGroup.add(qaUniformGroup);

  qaUniformGroup.add(
    // Dark charcoal/black technical QA jacket/vest body bridging all the way from belt (Y = -0.01) to shoulders (Y = 0.356)
    makeBox('QA_Jacket_Core_Back', [0.332, 0.362, 0.188], [0, 0.176, -0.006], palette.jacketCharcoal),
    makeBox('QA_Jacket_Front_Left_Panel', [0.108, 0.356, 0.202], [-0.112, 0.176, 0.008], palette.jacketDeepBlack),
    makeBox('QA_Jacket_Front_Right_Panel', [0.108, 0.356, 0.202], [0.112, 0.176, 0.008], palette.jacketDeepBlack),
    // Bright gold/yellow vertical front trim rails & hoodie drawstrings
    makeBox('QA_Jacket_Trim_Gold_Left', [0.02, 0.332, 0.018], [-0.058, 0.178, 0.106], palette.qaGoldYellow),
    makeBox('QA_Jacket_Trim_Gold_Right', [0.02, 0.332, 0.018], [0.058, 0.178, 0.106], palette.qaGoldYellow),
    makeBox('QA_Hoodie_Drawstring_Left', [0.016, 0.11, 0.018], [-0.038, 0.265, 0.112], palette.innerHoodieWhite),
    makeBox('QA_Hoodie_Drawstring_Tip_Left', [0.018, 0.022, 0.02], [-0.038, 0.204, 0.113], palette.qaGoldYellow),
    makeBox('QA_Hoodie_Drawstring_Right', [0.016, 0.11, 0.018], [0.038, 0.265, 0.112], palette.innerHoodieWhite),
    makeBox('QA_Hoodie_Drawstring_Tip_Right', [0.018, 0.022, 0.02], [0.038, 0.204, 0.113], palette.qaGoldYellow),
    // Bottom hem band overlapping belt/pelvis with gold side tabs
    makeBox('QA_Jacket_Bottom_Hem', [0.34, 0.044, 0.208], [0, 0.012, 0.004], palette.jacketDeepBlack),
    makeBox('QA_Jacket_Side_Gold_Tab_Left', [0.018, 0.05, 0.082], [-0.168, 0.048, 0.024], palette.qaGoldYellow),
    makeBox('QA_Jacket_Side_Gold_Tab_Right', [0.018, 0.05, 0.082], [0.168, 0.048, 0.024], palette.qaGoldYellow),
    // Front chest QA badge on left lapel
    makeBox('QA_Chest_Badge_Plate', [0.052, 0.032, 0.016], [0.112, 0.268, 0.108], palette.qaGoldYellow),
    makeBox('QA_Chest_Badge_Dot', [0.02, 0.014, 0.018], [0.112, 0.268, 0.11], palette.jacketDeepBlack)
  );

  // Compact Black Technical QA Backpack (`Backpack` group — auto-hidden when seated)
  const backpackGroup = new THREE.Group();
  backpackGroup.name = 'Backpack';
  torsoGroup.add(backpackGroup);

  backpackGroup.add(
    // Shoulder straps wrapping cleanly over shoulders
    makeBox('Backpack_Strap_Front_Left', [0.036, 0.285, 0.02], [-0.128, 0.195, 0.106], palette.backpackBlack),
    makeBox('Backpack_Strap_Front_Right', [0.036, 0.285, 0.02], [0.128, 0.195, 0.106], palette.backpackBlack),
    makeBox('Backpack_Strap_Top_Left', [0.038, 0.024, 0.215], [-0.128, 0.352, -0.004], palette.backpackBlack),
    makeBox('Backpack_Strap_Top_Right', [0.038, 0.024, 0.215], [0.128, 0.352, -0.004], palette.backpackBlack),
    makeBox('Backpack_Strap_Gold_Clip_Left', [0.04, 0.024, 0.022], [-0.128, 0.222, 0.11], palette.qaGoldYellow),
    makeBox('Backpack_Strap_Gold_Clip_Right', [0.04, 0.024, 0.022], [0.128, 0.222, 0.11], palette.qaGoldYellow),

    // Main backpack body & yellow accent trim
    makeBox('Backpack_Main_Body', [0.276, 0.295, 0.122], [0, 0.188, -0.156], palette.backpackBlack),
    makeBox('Backpack_Upper_Bevel', [0.248, 0.034, 0.102], [0, 0.342, -0.15], palette.backpackPocketSlate),
    makeBox('Backpack_Rear_Pocket', [0.228, 0.178, 0.034], [0, 0.156, -0.224], palette.backpackPocketSlate),
    makeBox('Backpack_Gold_Top_Stripe', [0.232, 0.02, 0.036], [0, 0.256, -0.224], palette.qaGoldYellow),
    makeBox('Backpack_Side_Pocket_Left', [0.026, 0.12, 0.084], [-0.148, 0.142, -0.156], palette.backpackPocketSlate),
    makeBox('Backpack_Side_Pocket_Right', [0.026, 0.12, 0.084], [0.148, 0.142, -0.156], palette.backpackPocketSlate),
    makeBox('Backpack_Side_Gold_Tab_Left', [0.028, 0.024, 0.052], [-0.149, 0.208, -0.156], palette.qaGoldYellow),
    makeBox('Backpack_Side_Gold_Tab_Right', [0.028, 0.024, 0.052], [0.149, 0.208, -0.156], palette.qaGoldYellow),

    // 3D Voxel "QA" Emblem on Rear Panel of Backpack (clearly readable from Back view!)
    // Letter 'Q' (left side of rear pocket: X = -0.046)
    makeBox('Backpack_QA_Logo_Q_Top', [0.048, 0.013, 0.012], [-0.046, 0.192, -0.244], palette.qaGoldYellow),
    makeBox('Backpack_QA_Logo_Q_Bottom', [0.048, 0.013, 0.012], [-0.046, 0.136, -0.244], palette.qaGoldYellow),
    makeBox('Backpack_QA_Logo_Q_Left', [0.013, 0.068, 0.012], [-0.064, 0.164, -0.244], palette.qaGoldYellow),
    makeBox('Backpack_QA_Logo_Q_Right', [0.013, 0.068, 0.012], [-0.028, 0.164, -0.244], palette.qaGoldYellow),
    makeBox('Backpack_QA_Logo_Q_Tail', [0.016, 0.016, 0.014], [-0.022, 0.13, -0.245], palette.qaAmberAccent),

    // Letter 'A' (right side of rear pocket: X = +0.046)
    makeBox('Backpack_QA_Logo_A_Top', [0.048, 0.013, 0.012], [0.046, 0.192, -0.244], palette.qaGoldYellow),
    makeBox('Backpack_QA_Logo_A_Mid', [0.048, 0.013, 0.012], [0.046, 0.163, -0.244], palette.qaGoldYellow),
    makeBox('Backpack_QA_Logo_A_Left', [0.013, 0.068, 0.012], [0.028, 0.164, -0.244], palette.qaGoldYellow),
    makeBox('Backpack_QA_Logo_A_Right', [0.013, 0.068, 0.012], [0.064, 0.164, -0.244], palette.qaGoldYellow)
  );

  return {
    torsoGroup,
    qaUniformGroup,
    innerShirtGroup,
    backpackGroup,
  };
}

/**
 * Builds the 7 Contextual Handheld QA Props attached to `Hand_Right -> Props_Attachment`
 * (All hidden in rest pose so `qa_engineer_agent.glb` exports a clean standing rest pose).
 */
function buildQAHandheldProps(palette: QAMaterialPalette): {
  propsAttachment: THREE.Group;
  propMap: Record<Exclude<QAPropId, 'none'>, THREE.Group>;
} {
  const propsAttachment = new THREE.Group();
  propsAttachment.name = 'Props_Attachment';
  // Positioned directly in Hand_Right palm/fingers (not -0.25 below Hand_Right!)
  propsAttachment.position.set(0, -0.035, 0.072);

  // 1. Prop_QA_Laptop — Silver testing laptop with yellow cat/QA sticker on lid (matches reference sheet!)
  const laptop = new THREE.Group();
  laptop.name = 'Prop_QA_Laptop';
  laptop.visible = false;
  laptop.add(
    makeBox('Laptop_Base_Deck', [0.22, 0.016, 0.16], [-0.06, 0.02, 0.06], palette.laptopSilver),
    makeBox('Laptop_Keyboard_Well', [0.18, 0.006, 0.11], [-0.06, 0.03, 0.055], palette.jacketDeepBlack),
    makeBox(
      'Laptop_Lid_Back',
      [0.22, 0.15, 0.014],
      [-0.06, 0.095, 0.135],
      palette.laptopSilver,
      [-0.22, 0, 0]
    ),
    makeBox(
      'Laptop_Lid_Sticker_Gold',
      [0.044, 0.038, 0.008],
      [-0.06, 0.095, 0.144],
      palette.qaGoldYellow,
      [-0.22, 0, 0]
    ),
    makeBox(
      'Laptop_Screen_Display',
      [0.196, 0.126, 0.006],
      [-0.06, 0.095, 0.128],
      palette.laptopScreenDark,
      [-0.22, 0, 0]
    )
  );

  // 2. Prop_Magnifying_Glass — QA Inspection Magnifier
  const magnifier = new THREE.Group();
  magnifier.name = 'Prop_Magnifying_Glass';
  magnifier.visible = false;
  magnifier.add(
    makeBox('Magnifier_Handle', [0.024, 0.11, 0.024], [0, 0.02, 0.04], palette.jacketDeepBlack),
    makeBox('Magnifier_Gold_Collar', [0.03, 0.02, 0.03], [0, 0.078, 0.04], palette.qaGoldYellow),
    makeBox('Magnifier_Rim_Top', [0.11, 0.018, 0.022], [0, 0.185, 0.04], palette.jacketDeepBlack),
    makeBox('Magnifier_Rim_Bottom', [0.11, 0.018, 0.022], [0, 0.092, 0.04], palette.jacketDeepBlack),
    makeBox('Magnifier_Rim_Left', [0.018, 0.11, 0.022], [-0.048, 0.138, 0.04], palette.jacketDeepBlack),
    makeBox('Magnifier_Rim_Right', [0.018, 0.11, 0.022], [0.048, 0.138, 0.04], palette.jacketDeepBlack),
    makeBox('Magnifier_Lens_Glass', [0.078, 0.078, 0.008], [0, 0.138, 0.04], palette.glassLensCyan)
  );

  // 3. Prop_Checklist_Clipboard — White QA checklist board with green checkmarks & yellow/red status rows
  const clipboard = new THREE.Group();
  clipboard.name = 'Prop_Checklist_Clipboard';
  clipboard.visible = false;
  clipboard.add(
    makeBox('Clipboard_Backing', [0.16, 0.21, 0.016], [-0.02, 0.04, 0.06], palette.clipboardBoard),
    makeBox('Clipboard_Paper', [0.138, 0.182, 0.008], [-0.02, 0.036, 0.07], palette.paperWhite),
    makeBox('Clipboard_Clip_Gold', [0.056, 0.022, 0.018], [-0.02, 0.132, 0.072], palette.qaGoldYellow),
    makeBox('Clipboard_Check_Row_1', [0.022, 0.022, 0.006], [-0.062, 0.088, 0.076], palette.passEmeraldGreen),
    makeBox('Clipboard_Text_Row_1', [0.068, 0.012, 0.006], [-0.004, 0.088, 0.076], palette.jacketCharcoal),
    makeBox('Clipboard_Check_Row_2', [0.022, 0.022, 0.006], [-0.062, 0.044, 0.076], palette.passEmeraldGreen),
    makeBox('Clipboard_Text_Row_2', [0.068, 0.012, 0.006], [-0.004, 0.044, 0.076], palette.jacketCharcoal),
    makeBox('Clipboard_Bug_Row_3', [0.022, 0.022, 0.006], [-0.062, 0.0, 0.076], palette.bugAlertRed),
    makeBox('Clipboard_Text_Row_3', [0.068, 0.012, 0.006], [-0.004, 0.0, 0.076], palette.jacketCharcoal)
  );

  // 4. Prop_Bug_Report_Tablet — Dark inspection tablet with glowing red BUG alert icon (matches BUG FOUND pose!)
  const bugTablet = new THREE.Group();
  bugTablet.name = 'Prop_Bug_Report_Tablet';
  bugTablet.visible = false;
  bugTablet.add(
    makeBox('Bug_Tablet_Chassis', [0.18, 0.135, 0.018], [-0.04, 0.04, 0.065], palette.jacketDeepBlack),
    makeBox('Bug_Tablet_Screen_Alert', [0.156, 0.112, 0.008], [-0.04, 0.04, 0.076], palette.bugAlertRed),
    makeBox('Bug_Tablet_Icon_Core', [0.046, 0.052, 0.008], [-0.04, 0.04, 0.082], palette.jacketDeepBlack),
    makeBox('Bug_Tablet_Corner_Gold', [0.032, 0.014, 0.008], [0.018, 0.082, 0.082], palette.qaGoldYellow)
  );

  // 5. Prop_Smartphone — Mobile device testing / coordination phone
  const smartphone = new THREE.Group();
  smartphone.name = 'Prop_Smartphone';
  smartphone.visible = false;
  smartphone.add(
    makeBox('Smartphone_Body', [0.068, 0.128, 0.016], [0, 0.04, 0.045], palette.jacketDeepBlack),
    makeBox('Smartphone_Screen', [0.056, 0.108, 0.006], [0, 0.04, 0.054], palette.laptopScreenDark),
    makeBox('Smartphone_Gold_Accent', [0.024, 0.008, 0.006], [0, 0.084, 0.056], palette.qaGoldYellow)
  );

  // 6. Prop_Test_Spec_Doc — Bound QA Test Specification Manual with yellow spine & cover badge
  const specDoc = new THREE.Group();
  specDoc.name = 'Prop_Test_Spec_Doc';
  specDoc.visible = false;
  specDoc.add(
    makeBox('Spec_Doc_Cover_Back', [0.165, 0.21, 0.028], [-0.03, 0.04, 0.06], palette.jacketCharcoal),
    makeBox('Spec_Doc_Spine_Gold', [0.024, 0.212, 0.032], [-0.105, 0.04, 0.06], palette.qaGoldYellow),
    makeBox('Spec_Doc_Pages', [0.148, 0.196, 0.022], [-0.024, 0.04, 0.06], palette.paperWhite),
    makeBox('Spec_Doc_Title_Badge', [0.085, 0.036, 0.008], [-0.025, 0.075, 0.076], palette.qaGoldYellow)
  );

  // 7. Prop_Coffee_Cup — White ceramic QA mug with yellow/gold band
  const coffeeCup = new THREE.Group();
  coffeeCup.name = 'Prop_Coffee_Cup';
  coffeeCup.visible = false;
  coffeeCup.add(
    makeBox('Coffee_Mug_Body', [0.074, 0.092, 0.074], [0, 0.02, 0.055], palette.mugCeramicWhite),
    makeBox('Coffee_Mug_Gold_Band', [0.078, 0.024, 0.078], [0, 0.022, 0.055], palette.qaGoldYellow),
    makeBox('Coffee_Mug_Liquid', [0.06, 0.01, 0.06], [0, 0.064, 0.055], palette.coffeeLiquid),
    makeBox('Coffee_Mug_Handle', [0.016, 0.054, 0.028], [0.044, 0.02, 0.055], palette.mugCeramicWhite)
  );

  propsAttachment.add(
    laptop,
    magnifier,
    clipboard,
    bugTablet,
    smartphone,
    specDoc,
    coffeeCup
  );

  return {
    propsAttachment,
    propMap: {
      qa_laptop: laptop,
      magnifying_glass: magnifier,
      checklist_clipboard: clipboard,
      bug_report_tablet: bugTablet,
      smartphone,
      test_spec_doc: specDoc,
      coffee_cup: coffeeCup,
    },
  };
}

/**
 * Builds Runtime-Only Overhead Demo Indicators (attached to `runtimeRoot` OUTSIDE `QA_Engineer_Agent_Root`
 * so they never contaminate `qa_engineer_agent.glb`).
 */
function buildQARuntimeIndicatorsGroup(palette: QAMaterialPalette): {
  indicatorsRoot: THREE.Group;
  indicatorMap: Record<Exclude<QARuntimeIndicatorId, 'none'>, THREE.Group>;
} {
  const indicatorsRoot = new THREE.Group();
  indicatorsRoot.name = 'QA_Runtime_Demo_Indicators';
  indicatorsRoot.position.set(0, 1.88, 0);

  // 1. bug_alert_red — Double red exclamation "!!" (matches BUG FOUND in reference sheet)
  const bugAlert = new THREE.Group();
  bugAlert.name = 'Indicator_Bug_Alert_Red';
  bugAlert.visible = false;
  bugAlert.add(
    makeBox('Bug_Excl_Left_Bar', [0.028, 0.11, 0.028], [-0.036, 0.06, 0], palette.bugAlertRed),
    makeBox('Bug_Excl_Left_Dot', [0.028, 0.028, 0.028], [-0.036, -0.024, 0], palette.bugAlertRed),
    makeBox('Bug_Excl_Right_Bar', [0.028, 0.11, 0.028], [0.036, 0.06, 0], palette.bugAlertRed),
    makeBox('Bug_Excl_Right_Dot', [0.028, 0.028, 0.028], [0.036, -0.024, 0], palette.bugAlertRed)
  );

  // 2. test_running_badge — Gold/emerald test runner badge
  const testRunning = new THREE.Group();
  testRunning.name = 'Indicator_Test_Running_Badge';
  testRunning.visible = false;
  testRunning.add(
    makeBox('Test_Run_Frame', [0.16, 0.08, 0.024], [0, 0.03, 0], palette.jacketDeepBlack),
    makeBox('Test_Run_Bar_1', [0.032, 0.044, 0.028], [-0.046, 0.03, 0], palette.passEmeraldGreen),
    makeBox('Test_Run_Bar_2', [0.032, 0.044, 0.028], [0, 0.03, 0], palette.passEmeraldGreen),
    makeBox('Test_Run_Bar_3', [0.032, 0.044, 0.028], [0.046, 0.03, 0], palette.qaGoldYellow)
  );

  // 3. check_verified_badge — Emerald verified checkmark badge
  const checkVerified = new THREE.Group();
  checkVerified.name = 'Indicator_Check_Verified_Badge';
  checkVerified.visible = false;
  checkVerified.add(
    makeBox('Check_Badge_Plate', [0.11, 0.11, 0.022], [0, 0.035, 0], palette.passEmeraldGreen),
    makeBox('Check_Mark_Short', [0.022, 0.042, 0.028], [-0.018, 0.025, 0], palette.paperWhite, [0, 0, 0.65]),
    makeBox('Check_Mark_Long', [0.022, 0.068, 0.028], [0.016, 0.038, 0], palette.paperWhite, [0, 0, -0.55])
  );

  // 4. quality_gate_badge — Gold/emerald shield badge
  const qualityGate = new THREE.Group();
  qualityGate.name = 'Indicator_Quality_Gate_Badge';
  qualityGate.visible = false;
  qualityGate.add(
    makeBox('Gate_Shield_Outer', [0.13, 0.12, 0.022], [0, 0.038, 0], palette.qaGoldYellow),
    makeBox('Gate_Shield_Inner', [0.092, 0.084, 0.026], [0, 0.038, 0], palette.passEmeraldGreen)
  );

  // 5. thinking_question — Yellow voxel "?" indicator (matches expressions row in reference sheet)
  const thinkingQuestion = new THREE.Group();
  thinkingQuestion.name = 'Indicator_Thinking_Question';
  thinkingQuestion.visible = false;
  thinkingQuestion.add(
    makeBox('Question_Top_Bar', [0.072, 0.024, 0.024], [0, 0.1, 0], palette.qaGoldYellow),
    makeBox('Question_Right_Bar', [0.024, 0.048, 0.024], [0.024, 0.076, 0], palette.qaGoldYellow),
    makeBox('Question_Mid_Bar', [0.048, 0.024, 0.024], [0.012, 0.052, 0], palette.qaGoldYellow),
    makeBox('Question_Stem', [0.024, 0.032, 0.024], [0, 0.028, 0], palette.qaGoldYellow),
    makeBox('Question_Dot', [0.024, 0.024, 0.024], [0, -0.016, 0], palette.qaGoldYellow)
  );

  // 6. completed_sparkle — Gold star sparkle
  const completedSparkle = new THREE.Group();
  completedSparkle.name = 'Indicator_Completed_Sparkle';
  completedSparkle.visible = false;
  completedSparkle.add(
    makeBox('Sparkle_Vert', [0.026, 0.12, 0.026], [0, 0.04, 0], palette.qaGoldYellow),
    makeBox('Sparkle_Horiz', [0.12, 0.026, 0.026], [0, 0.04, 0], palette.qaGoldYellow),
    makeBox('Sparkle_Core', [0.046, 0.046, 0.032], [0, 0.04, 0], palette.paperWhite)
  );

  indicatorsRoot.add(
    bugAlert,
    testRunning,
    checkVerified,
    qualityGate,
    thinkingQuestion,
    completedSparkle
  );

  return {
    indicatorsRoot,
    indicatorMap: {
      bug_alert_red: bugAlert,
      test_running_badge: testRunning,
      check_verified_badge: checkVerified,
      quality_gate_badge: qualityGate,
      thinking_question: thinkingQuestion,
      completed_sparkle: completedSparkle,
    },
  };
}

export interface BuiltQAEngineerRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  hairGroup: THREE.Group;
  highBunGroup: THREE.Group;
  hairClipGroup: THREE.Group;
  faceNodes: BuiltQAFaceNodes;
  glassesGroup: THREE.Group;
  headsetGroup: THREE.Group;
  qaUniformGroup: THREE.Group;
  innerShirtGroup: THREE.Group;
  backpackGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftHand: THREE.Group;
  rightHand: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  propsAttachment: THREE.Group;
  propMap: Record<Exclude<QAPropId, 'none'>, THREE.Group>;
  palette: QAMaterialPalette;
}

/**
 * Builds the complete Room-Native Voxel QA Engineer Character (`QA_Engineer_Agent_Root`).
 * Grounded at `Y = 0.000`, height `1.735u`, forward `+Z`, up `+Y`.
 */
export function buildQAEngineerCharacterRig(): BuiltQAEngineerRig {
  const palette = createQAMaterialPalette();

  const root = new THREE.Group();
  root.name = QA_CHARACTER_CONSTANTS.ROOT_NODE_NAME;
  root.position.set(0, 0, 0);

  // Hips Pivot at Y = 0.900
  const hips = new THREE.Group();
  hips.name = 'Hips';
  hips.position.set(0, QA_CHARACTER_CONSTANTS.STANDING_HIPS_Y, 0);
  root.add(hips);

  hips.add(
    // Solid Pelvis & Hip Bridge overlapping both Torso bottom and Upper Thighs so there is zero air gap
    makeBox('Pelvis_Base_Block', [0.324, 0.118, 0.194], [0, -0.042, 0], palette.trousersCharcoal),
    makeBox('Pelvis_Hip_Bridge_Center', [0.116, 0.088, 0.186], [0, -0.076, 0], palette.trousersCharcoal),
    makeBox('Belt_Strap_Dark', [0.332, 0.036, 0.202], [0, 0.012, 0.002], palette.jacketDeepBlack),
    makeBox('Belt_Buckle_Gold', [0.058, 0.038, 0.018], [0, 0.012, 0.102], palette.qaGoldYellow),
    makeBox('Belt_Loop_Gold_Left', [0.018, 0.038, 0.018], [-0.096, 0.012, 0.101], palette.qaAmberAccent),
    makeBox('Belt_Loop_Gold_Right', [0.018, 0.038, 0.018], [0.096, 0.012, 0.101], palette.qaAmberAccent)
  );

  // Torso, Uniform & Backpack (attached at [0, 0, 0] on Hips)
  const { torsoGroup, qaUniformGroup, innerShirtGroup, backpackGroup } =
    buildQATorsoAndBackpack(palette);
  hips.add(torsoGroup);

  // Head Pivot attached to Torso at [0, 0.36, 0] (World Y = 1.260; +0.475 Hair_High_Bun = 1.735u exact height!)
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.36, 0);
  torsoGroup.add(head);

  head.add(
    makeBox('Head_Skull_Core', [0.336, 0.31, 0.312], [0, 0.196, 0], palette.skinBase),
    makeBox('Head_Jaw_Soft_Bevel', [0.312, 0.052, 0.292], [0, 0.062, 0.006], palette.skinBase)
  );

  // Layered Chestnut-Brown Hair with High Bun & Gold Hair Clip
  const { hairGroup, highBunGroup, hairClipGroup } = buildQALayeredHairGroup(palette);
  head.add(hairGroup);

  // Expressive Face, Ears, Optional Glasses & Optional QA Headset
  const { faceNodes, earsGroup, glassesGroup, headsetGroup } =
    buildQAFaceAndHeadAccessories(palette);
  head.add(faceNodes.faceGroup, earsGroup, glassesGroup, headsetGroup);

  // Left Arm & Hand (`Arm_Left` -> `Hand_Left`)
  // Positioned cleanly outside torso shoulder (X = -0.222, Y = 0.315) with full-length sleeve, white cuff, wrist, palm, fingers & thumb!
  const leftArm = new THREE.Group();
  leftArm.name = 'Arm_Left';
  leftArm.position.set(-0.222, 0.315, 0);
  torsoGroup.add(leftArm);

  leftArm.add(
    makeBox('Sleeve_Shoulder_Cap_Left', [0.11, 0.064, 0.114], [0, 0.006, 0], palette.jacketDeepBlack),
    makeBox('Sleeve_Upper_Left', [0.108, 0.165, 0.112], [0, -0.088, 0], palette.jacketDeepBlack),
    makeBox('Sleeve_QA_Shoulder_Patch_Left', [0.016, 0.058, 0.064], [-0.054, -0.068, 0], palette.qaGoldYellow),
    makeBox('Sleeve_QA_Patch_Inner_Left', [0.018, 0.026, 0.03], [-0.055, -0.068, 0], palette.jacketDeepBlack),
    makeBox('Sleeve_Gold_Band_Left', [0.11, 0.022, 0.114], [0, -0.168, 0], palette.qaGoldYellow),
    makeBox('Sleeve_Lower_White_Cuff_Left', [0.102, 0.096, 0.106], [0, -0.218, 0], palette.innerHoodieWhite),
    makeBox('Sleeve_Wrist_Rib_Left', [0.094, 0.024, 0.098], [0, -0.268, 0], palette.innerCollarShadow)
  );

  const leftHand = new THREE.Group();
  leftHand.name = 'Hand_Left';
  leftHand.position.set(0, -0.312, 0);
  leftArm.add(leftHand);
  leftHand.add(
    makeBox('Hand_Left_Wrist', [0.072, 0.034, 0.074], [0, 0.032, 0], palette.skinShadow),
    makeBox('Hand_Left_Palm', [0.088, 0.078, 0.09], [0, -0.006, 0], palette.skinBase),
    makeBox('Hand_Left_Fingers', [0.084, 0.036, 0.086], [0, -0.052, 0.004], palette.skinBase),
    makeBox('Hand_Left_Thumb', [0.032, 0.044, 0.038], [0.048, -0.01, 0.032], palette.skinBase)
  );

  // Right Arm & Hand (`Arm_Right` -> `Hand_Right` -> `Props_Attachment`)
  const rightArm = new THREE.Group();
  rightArm.name = 'Arm_Right';
  rightArm.position.set(0.222, 0.315, 0);
  torsoGroup.add(rightArm);

  rightArm.add(
    makeBox('Sleeve_Shoulder_Cap_Right', [0.11, 0.064, 0.114], [0, 0.006, 0], palette.jacketDeepBlack),
    makeBox('Sleeve_Upper_Right', [0.108, 0.165, 0.112], [0, -0.088, 0], palette.jacketDeepBlack),
    makeBox('Sleeve_Shoulder_Stripe_Right', [0.016, 0.054, 0.06], [0.054, -0.068, 0], palette.qaGoldYellow),
    makeBox('Sleeve_Gold_Band_Right', [0.11, 0.022, 0.114], [0, -0.168, 0], palette.qaGoldYellow),
    makeBox('Sleeve_Lower_White_Cuff_Right', [0.102, 0.096, 0.106], [0, -0.218, 0], palette.innerHoodieWhite),
    makeBox('Sleeve_Wrist_Rib_Right', [0.094, 0.024, 0.098], [0, -0.268, 0], palette.innerCollarShadow)
  );

  const rightHand = new THREE.Group();
  rightHand.name = 'Hand_Right';
  rightHand.position.set(0, -0.312, 0);
  rightArm.add(rightHand);
  rightHand.add(
    makeBox('Hand_Right_Wrist', [0.072, 0.034, 0.074], [0, 0.032, 0], palette.skinShadow),
    makeBox('Hand_Right_Palm', [0.088, 0.078, 0.09], [0, -0.006, 0], palette.skinBase),
    makeBox('Hand_Right_Fingers', [0.084, 0.036, 0.086], [0, -0.052, 0.004], palette.skinBase),
    makeBox('Hand_Right_Thumb', [0.032, 0.044, 0.038], [-0.048, -0.01, 0.032], palette.skinBase)
  );

  const { propsAttachment, propMap } = buildQAHandheldProps(palette);
  rightHand.add(propsAttachment);

  // Left & Right Legs + Ankles + Sneakers (`Leg_Left`, `Leg_Right`)
  // Attached to Hips at Y = 0.000 (World Y = 0.900) so thighs tuck seamlessly into Pelvis_Base_Block.
  // Soles reach Y = -0.900 (World Y = 0.000) with Ankle_Sock bridging trouser cuffs and sneakers!
  const leftLeg = new THREE.Group();
  leftLeg.name = 'Leg_Left';
  leftLeg.position.set(-0.088, 0, 0);
  hips.add(leftLeg);

  leftLeg.add(
    makeBox('Trouser_Thigh_Left', [0.138, 0.42, 0.15], [0, -0.23, 0], palette.trousersCharcoal),
    makeBox('Trouser_Knee_Lower_Left', [0.132, 0.36, 0.144], [0, -0.59, 0], palette.trousersCharcoal),
    makeBox('Trouser_Side_Trim_Gold_Left', [0.014, 0.7, 0.026], [-0.068, -0.41, 0], palette.qaGoldYellow),
    makeBox('Trouser_Cuff_White_Left', [0.138, 0.044, 0.15], [0, -0.784, 0], palette.innerHoodieWhite),
    makeBox('Ankle_Sock_Left', [0.112, 0.048, 0.12], [0, -0.816, 0.004], palette.innerHoodieWhite),
    makeBox('Shoe_Upper_Left', [0.144, 0.084, 0.206], [0, -0.838, 0.024], palette.sneakerWhite),
    makeBox('Shoe_Tongue_Gold_Left', [0.078, 0.044, 0.026], [0, -0.802, 0.108], palette.qaGoldYellow),
    makeBox('Shoe_Side_Accent_Gold_Left', [0.016, 0.028, 0.064], [-0.072, -0.842, 0.015], palette.qaGoldYellow),
    makeBox('Shoe_Heel_Collar_Dark_Left', [0.146, 0.046, 0.064], [0, -0.812, -0.048], palette.jacketDeepBlack),
    makeBox('Shoe_Sole_Left', [0.15, 0.036, 0.216], [0, -0.882, 0.024], palette.sneakerSoleDark)
  );

  const rightLeg = new THREE.Group();
  rightLeg.name = 'Leg_Right';
  rightLeg.position.set(0.088, 0, 0);
  hips.add(rightLeg);

  rightLeg.add(
    makeBox('Trouser_Thigh_Right', [0.138, 0.42, 0.15], [0, -0.23, 0], palette.trousersCharcoal),
    makeBox('Trouser_Knee_Lower_Right', [0.132, 0.36, 0.144], [0, -0.59, 0], palette.trousersCharcoal),
    makeBox('Trouser_Side_Trim_Gold_Right', [0.014, 0.7, 0.026], [0.068, -0.41, 0], palette.qaGoldYellow),
    makeBox('Trouser_Cuff_White_Right', [0.138, 0.044, 0.15], [0, -0.784, 0], palette.innerHoodieWhite),
    makeBox('Ankle_Sock_Right', [0.112, 0.048, 0.12], [0, -0.816, 0.004], palette.innerHoodieWhite),
    makeBox('Shoe_Upper_Right', [0.144, 0.084, 0.206], [0, -0.838, 0.024], palette.sneakerWhite),
    makeBox('Shoe_Tongue_Gold_Right', [0.078, 0.044, 0.026], [0, -0.802, 0.108], palette.qaGoldYellow),
    makeBox('Shoe_Side_Accent_Gold_Right', [0.016, 0.028, 0.064], [0.072, -0.842, 0.015], palette.qaGoldYellow),
    makeBox('Shoe_Heel_Collar_Dark_Right', [0.146, 0.046, 0.064], [0, -0.812, -0.048], palette.jacketDeepBlack),
    makeBox('Shoe_Sole_Right', [0.15, 0.036, 0.216], [0, -0.882, 0.024], palette.sneakerSoleDark)
  );

  return {
    root,
    hips,
    torso: torsoGroup,
    head,
    hairGroup,
    highBunGroup,
    hairClipGroup,
    faceNodes,
    glassesGroup,
    headsetGroup,
    qaUniformGroup,
    innerShirtGroup,
    backpackGroup,
    leftArm,
    rightArm,
    leftHand,
    rightHand,
    leftLeg,
    rightLeg,
    propsAttachment,
    propMap,
    palette,
  };
}

export function applyQAExpressionToFace(
  faceNodes: BuiltQAFaceNodes,
  expressionId: QAExpressionId
): void {
  const preset = QA_EXPRESSION_PRESETS[expressionId] ?? QA_EXPRESSION_PRESETS.neutral;

  faceNodes.leftEye.scale.set(1, preset.eyeScaleY, 1);
  faceNodes.rightEye.scale.set(1, preset.eyeScaleY, 1);

  faceNodes.leftPupil.position.set(
    -0.07 + preset.pupilOffsetX,
    0.182 + preset.pupilOffsetY,
    0.164
  );
  faceNodes.rightPupil.position.set(
    0.07 + preset.pupilOffsetX,
    0.182 + preset.pupilOffsetY,
    0.164
  );

  faceNodes.leftEyebrow.position.set(-0.072, 0.236 + preset.browLiftY, 0.163);
  faceNodes.rightEyebrow.position.set(0.072, 0.236 + preset.browLiftY, 0.163);
  faceNodes.leftEyebrow.rotation.set(0, 0, preset.leftBrowTiltRad);
  faceNodes.rightEyebrow.rotation.set(0, 0, preset.rightBrowTiltRad);

  faceNodes.mouth.scale.set(preset.mouthWidthScale, preset.mouthHeightScale, 1);
  faceNodes.mouth.position.set(0, 0.112 + preset.mouthOffsetY, 0.161);

  const cheekMat = faceNodes.leftCheek.material as THREE.MeshStandardMaterial;
  if (cheekMat) {
    cheekMat.opacity = preset.cheekOpacity;
  }
}

function quatTrack(
  nodeName: string,
  times: number[],
  eulerTriples: Array<[number, number, number]>
): THREE.QuaternionKeyframeTrack {
  const values: number[] = [];
  const euler = new THREE.Euler();
  const quat = new THREE.Quaternion();
  for (const [rx, ry, rz] of eulerTriples) {
    euler.set(rx, ry, rz, 'XYZ');
    quat.setFromEuler(euler);
    values.push(quat.x, quat.y, quat.z, quat.w);
  }
  return new THREE.QuaternionKeyframeTrack(`${nodeName}.quaternion`, times, values);
}

function posTrack(
  nodeName: string,
  times: number[],
  positions: Array<[number, number, number]>
): THREE.VectorKeyframeTrack {
  const values: number[] = [];
  for (const [x, y, z] of positions) {
    values.push(x, y, z);
  }
  return new THREE.VectorKeyframeTrack(`${nodeName}.position`, times, values);
}

/**
 * Builds all 23 genuine `THREE.AnimationClip`s (21 required QA action clips + `Sit_Down` + `Stand_Up`).
 */
export function buildQAEngineerAnimationClips(): THREE.AnimationClip[] {
  const standHipsY = QA_CHARACTER_CONSTANTS.STANDING_HIPS_Y;
  const seatHipsY = QA_CHARACTER_CONSTANTS.SEATED_HIPS_Y;

  const makeClip = (
    name: QAAnimationClipName,
    duration: number,
    tracks: THREE.KeyframeTrack[]
  ) => new THREE.AnimationClip(name, duration, tracks);

  return [
    // 1. Idle_Breathing
    makeClip('Idle_Breathing', 2.8, [
      posTrack(
        'Hips',
        [0, 1.4, 2.8],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.012, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.4, 2.8],
        [
          [0, 0, 0],
          [-0.025, 0.02, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 1.4, 2.8],
        [
          [0, 0, 0],
          [0.03, -0.04, 0.015],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 1.4, 2.8],
        [
          [0.04, 0, 0.05],
          [-0.03, 0, 0.06],
          [0.04, 0, 0.05],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.4, 2.8],
        [
          [-0.04, 0, -0.05],
          [0.03, 0, -0.06],
          [-0.04, 0, -0.05],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.8],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.8],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 2. Walk_Cycle
    makeClip('Walk_Cycle', 1.0, [
      posTrack(
        'Hips',
        [0, 0.25, 0.5, 0.75, 1.0],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.026, 0],
          [0, standHipsY, 0],
          [0, standHipsY + 0.026, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 0.25, 0.5, 0.75, 1.0],
        [
          [0.04, -0.06, 0],
          [0.05, 0, 0.02],
          [0.04, 0.06, 0],
          [0.05, 0, -0.02],
          [0.04, -0.06, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.5, 1.0],
        [
          [0, 0.04, 0],
          [0, -0.04, 0],
          [0, 0.04, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.25, 0.5, 0.75, 1.0],
        [
          [-0.48, 0, 0.04],
          [0, 0, 0.04],
          [0.48, 0, 0.04],
          [0, 0, 0.04],
          [-0.48, 0, 0.04],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 0.25, 0.5, 0.75, 1.0],
        [
          [0.48, 0, -0.04],
          [0, 0, -0.04],
          [-0.48, 0, -0.04],
          [0, 0, -0.04],
          [0.48, 0, -0.04],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 0.25, 0.5, 0.75, 1.0],
        [
          [0.52, 0, 0],
          [0, 0, 0],
          [-0.52, 0, 0],
          [0, 0, 0],
          [0.52, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 0.25, 0.5, 0.75, 1.0],
        [
          [-0.52, 0, 0],
          [0, 0, 0],
          [0.52, 0, 0],
          [0, 0, 0],
          [-0.52, 0, 0],
        ]
      ),
    ]),

    // 3. Work_Typing (Seated at QA_DESK_WORK)
    makeClip('Work_Typing', 1.6, [
      posTrack(
        'Hips',
        [0, 0.8, 1.6],
        [
          [0, seatHipsY, 0],
          [0, seatHipsY + 0.006, 0],
          [0, seatHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 0.8, 1.6],
        [
          [0.09, 0, 0],
          [0.11, 0.02, 0],
          [0.09, 0, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.5, 1.1, 1.6],
        [
          [0.08, -0.08, 0],
          [0.06, 0.08, 0],
          [0.1, -0.04, 0],
          [0.08, -0.08, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.4, 0.8, 1.2, 1.6],
        [
          [-0.95, 0.14, 0.05],
          [-1.06, 0.16, 0.05],
          [-0.92, 0.12, 0.05],
          [-1.04, 0.15, 0.05],
          [-0.95, 0.14, 0.05],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 0.4, 0.8, 1.2, 1.6],
        [
          [-1.04, -0.14, -0.05],
          [-0.92, -0.12, -0.05],
          [-1.06, -0.16, -0.05],
          [-0.94, -0.14, -0.05],
          [-1.04, -0.14, -0.05],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 1.6],
        [
          [-0.58, 0, 0],
          [-0.58, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 1.6],
        [
          [-0.58, 0, 0],
          [-0.58, 0, 0],
        ]
      ),
    ]),

    // 4. Run_Test_Suite_Demo (Seated at QA_DESK_WORK, triggering test suite & watching dual monitors)
    makeClip('Run_Test_Suite_Demo', 2.2, [
      posTrack(
        'Hips',
        [0, 1.1, 2.2],
        [
          [0, seatHipsY, 0],
          [0, seatHipsY + 0.008, 0],
          [0, seatHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 0.7, 1.5, 2.2],
        [
          [0.08, -0.04, 0],
          [0.04, 0.06, 0],
          [0.06, -0.06, 0],
          [0.08, -0.04, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.7, 1.5, 2.2],
        [
          [-0.04, -0.14, 0],
          [-0.06, 0.18, 0.02],
          [-0.02, -0.08, -0.02],
          [-0.04, -0.14, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 1.1, 2.2],
        [
          [-0.88, 0.12, 0.04],
          [-0.96, 0.14, 0.04],
          [-0.88, 0.12, 0.04],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 0.6, 1.3, 2.2],
        [
          [-1.15, -0.08, -0.05],
          [-1.32, -0.04, -0.05],
          [-0.98, -0.12, -0.05],
          [-1.15, -0.08, -0.05],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.2],
        [
          [-0.58, 0, 0],
          [-0.58, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.2],
        [
          [-0.58, 0, 0],
          [-0.58, 0, 0],
        ]
      ),
    ]),

    // 5. Inspect_Test_Results (Seated at QA_DESK_WORK with magnifying glass inspecting logs)
    makeClip('Inspect_Test_Results', 2.4, [
      posTrack(
        'Hips',
        [0, 1.2, 2.4],
        [
          [0, seatHipsY, 0],
          [0, seatHipsY + 0.008, 0],
          [0, seatHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.2, 2.4],
        [
          [0.12, 0.06, 0],
          [0.16, -0.06, 0],
          [0.12, 0.06, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.8, 1.6, 2.4],
        [
          [0.04, 0.16, 0.03],
          [0.08, -0.14, -0.03],
          [0.02, 0.08, 0],
          [0.04, 0.16, 0.03],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 1.2, 2.4],
        [
          [-0.82, 0.14, 0.05],
          [-0.9, 0.16, 0.05],
          [-0.82, 0.14, 0.05],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.2, 2.4],
        [
          [-1.24, -0.18, -0.06],
          [-1.36, 0.04, -0.04],
          [-1.24, -0.18, -0.06],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.4],
        [
          [-0.58, 0, 0],
          [-0.58, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.4],
        [
          [-0.58, 0, 0],
          [-0.58, 0, 0],
        ]
      ),
    ]),

    // 6. Device_Inspect (Standing at QA_DEVICE_TESTING counter inspecting devices)
    makeClip('Device_Inspect', 2.4, [
      posTrack(
        'Hips',
        [0, 1.2, 2.4],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.01, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.2, 2.4],
        [
          [0.14, -0.08, 0],
          [0.16, 0.08, 0],
          [0.14, -0.08, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.8, 1.6, 2.4],
        [
          [0.18, -0.14, 0.04],
          [0.2, 0.14, -0.04],
          [0.15, 0.02, 0],
          [0.18, -0.14, 0.04],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 1.2, 2.4],
        [
          [-0.68, 0.18, 0.06],
          [-0.82, 0.22, 0.06],
          [-0.68, 0.18, 0.06],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.2, 2.4],
        [
          [-1.18, -0.22, -0.08],
          [-1.32, 0.05, -0.04],
          [-1.18, -0.22, -0.08],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 7. Reproduce_Bug (Standing with QA laptop reproducing steps carefully)
    makeClip('Reproduce_Bug', 2.2, [
      posTrack(
        'Hips',
        [0, 1.1, 2.2],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.01, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.1, 2.2],
        [
          [0.1, 0, 0],
          [0.14, -0.04, 0],
          [0.1, 0, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.7, 1.4, 2.2],
        [
          [0.22, -0.06, 0.04],
          [0.25, 0.06, -0.04],
          [0.18, 0, 0],
          [0.22, -0.06, 0.04],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.55, 1.1, 1.65, 2.2],
        [
          [-1.02, 0.24, 0.06],
          [-1.14, 0.28, 0.06],
          [-0.98, 0.22, 0.06],
          [-1.12, 0.26, 0.06],
          [-1.02, 0.24, 0.06],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.1, 2.2],
        [
          [-1.05, -0.22, -0.06],
          [-1.08, -0.24, -0.06],
          [-1.05, -0.22, -0.06],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.2],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.2],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 8. Bug_Found_Reaction (Expressive alert reaction holding red bug tablet — matches BUG FOUND pose!)
    makeClip('Bug_Found_Reaction', 1.8, [
      posTrack(
        'Hips',
        [0, 0.35, 0.9, 1.8],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.038, 0],
          [0, standHipsY + 0.012, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 0.35, 0.9, 1.8],
        [
          [0, 0, 0],
          [-0.08, -0.06, 0.03],
          [0.06, 0.05, -0.02],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.35, 0.9, 1.4, 1.8],
        [
          [0, 0, 0],
          [-0.12, -0.1, 0.06],
          [0.14, 0.08, -0.04],
          [0.08, -0.04, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.35, 0.9, 1.8],
        [
          [-0.6, 0.1, 0.1],
          [-1.42, 0.18, 0.22],
          [-1.18, 0.14, 0.14],
          [-0.6, 0.1, 0.1],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 0.35, 0.9, 1.8],
        [
          [-1.12, -0.18, -0.08],
          [-1.38, -0.22, -0.12],
          [-1.24, -0.2, -0.08],
          [-1.12, -0.18, -0.08],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 0.35, 1.8],
        [
          [0, 0, 0],
          [-0.08, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 0.35, 1.8],
        [
          [0, 0, 0],
          [0.08, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 9. Checklist_Review (Standing at QA_CHECKLIST_BOARD reviewing items)
    makeClip('Checklist_Review', 2.4, [
      posTrack(
        'Hips',
        [0, 1.2, 2.4],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.01, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.2, 2.4],
        [
          [0.04, -0.05, 0],
          [0.06, 0.05, 0],
          [0.04, -0.05, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.8, 1.6, 2.4],
        [
          [-0.08, -0.08, 0],
          [0.14, 0.06, 0.03],
          [-0.04, 0.04, 0],
          [-0.08, -0.08, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.8, 1.6, 2.4],
        [
          [-0.95, 0.2, 0.08],
          [-1.12, 0.26, 0.08],
          [-0.85, 0.16, 0.08],
          [-0.95, 0.2, 0.08],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.2, 2.4],
        [
          [-1.08, -0.22, -0.06],
          [-1.14, -0.24, -0.06],
          [-1.08, -0.22, -0.06],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 10. Write_Bug_Report (Standing at QA_BUG_REVIEW documenting bug steps on tablet)
    makeClip('Write_Bug_Report', 2.0, [
      posTrack(
        'Hips',
        [0, 1.0, 2.0],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.01, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.0, 2.0],
        [
          [0.1, 0.02, 0],
          [0.12, -0.02, 0],
          [0.1, 0.02, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 1.0, 2.0],
        [
          [0.2, 0.04, 0.03],
          [0.22, -0.04, -0.02],
          [0.2, 0.04, 0.03],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.5, 1.0, 1.5, 2.0],
        [
          [-1.08, 0.3, 0.06],
          [-1.18, 0.22, 0.06],
          [-1.05, 0.32, 0.06],
          [-1.16, 0.24, 0.06],
          [-1.08, 0.3, 0.06],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.0, 2.0],
        [
          [-1.04, -0.24, -0.06],
          [-1.06, -0.26, -0.06],
          [-1.04, -0.24, -0.06],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.0],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.0],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 11. Verify_Fix_Demo (Seated at QA_DESK_WORK confirming fix & nodding with approval)
    makeClip('Verify_Fix_Demo', 2.2, [
      posTrack(
        'Hips',
        [0, 1.1, 2.2],
        [
          [0, seatHipsY, 0],
          [0, seatHipsY + 0.01, 0],
          [0, seatHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.1, 2.2],
        [
          [0.06, 0, 0],
          [0.02, 0.04, 0],
          [0.06, 0, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.55, 1.1, 1.65, 2.2],
        [
          [0.02, 0, 0],
          [0.14, 0.04, 0],
          [-0.04, 0.04, 0],
          [0.12, -0.04, 0],
          [0.02, 0, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 1.1, 2.2],
        [
          [-0.92, 0.14, 0.05],
          [-1.18, 0.18, 0.12],
          [-0.92, 0.14, 0.05],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.1, 2.2],
        [
          [-0.96, -0.14, -0.05],
          [-1.28, -0.12, -0.12],
          [-0.96, -0.14, -0.05],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.2],
        [
          [-0.58, 0, 0],
          [-0.58, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.2],
        [
          [-0.58, 0, 0],
          [-0.58, 0, 0],
        ]
      ),
    ]),

    // 12. Regression_Review (Standing at QA_TEST_REPORT_REVIEW comparing test reports)
    makeClip('Regression_Review', 2.4, [
      posTrack(
        'Hips',
        [0, 1.2, 2.4],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.01, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.2, 2.4],
        [
          [0.06, -0.06, 0],
          [0.08, 0.06, 0],
          [0.06, -0.06, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.8, 1.6, 2.4],
        [
          [-0.06, -0.12, 0],
          [0.14, 0.08, 0.02],
          [-0.04, 0.1, 0],
          [-0.06, -0.12, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 1.2, 2.4],
        [
          [-0.78, 0.16, 0.06],
          [-1.08, 0.2, 0.08],
          [-0.78, 0.16, 0.06],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.2, 2.4],
        [
          [-1.06, -0.22, -0.06],
          [-1.12, -0.2, -0.06],
          [-1.06, -0.22, -0.06],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 13. Quality_Gate_Review (Standing at QA_DEVOPS_REVIEW_BOARD evaluating release readiness)
    makeClip('Quality_Gate_Review', 2.4, [
      posTrack(
        'Hips',
        [0, 1.2, 2.4],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.012, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.2, 2.4],
        [
          [-0.02, -0.06, 0],
          [0.04, 0.06, 0],
          [-0.02, -0.06, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.8, 1.6, 2.4],
        [
          [-0.08, -0.1, 0],
          [-0.04, 0.1, 0],
          [0.08, 0, 0],
          [-0.08, -0.1, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.8, 1.6, 2.4],
        [
          [-1.18, 0.12, 0.1],
          [-1.34, 0.06, 0.14],
          [-0.88, 0.16, 0.08],
          [-1.18, 0.12, 0.1],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.2, 2.4],
        [
          [-1.02, -0.2, -0.06],
          [-1.08, -0.22, -0.06],
          [-1.02, -0.2, -0.06],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 14. Present_QA_Findings (Standing at QA_DEVOPS_PRESENTATION_POSITION presenting QA metrics)
    makeClip('Present_QA_Findings', 2.2, [
      posTrack(
        'Hips',
        [0, 1.1, 2.2],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.014, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 0.7, 1.5, 2.2],
        [
          [0, -0.1, 0],
          [0.03, 0.12, 0],
          [0, -0.04, 0],
          [0, -0.1, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.7, 1.5, 2.2],
        [
          [-0.04, -0.12, 0],
          [0.04, 0.14, 0.02],
          [-0.02, 0.04, 0],
          [-0.04, -0.12, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.7, 1.5, 2.2],
        [
          [-1.25, 0.18, 0.18],
          [-1.45, -0.05, 0.28],
          [-0.95, 0.12, 0.1],
          [-1.25, 0.18, 0.18],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.1, 2.2],
        [
          [-1.04, -0.2, -0.06],
          [-1.12, -0.22, -0.06],
          [-1.04, -0.2, -0.06],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.2],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.2],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 15. Technical_Discussion (Conversational gestures in shared lounge)
    makeClip('Technical_Discussion', 2.2, [
      posTrack(
        'Hips',
        [0, 1.1, 2.2],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.012, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.1, 2.2],
        [
          [0.03, -0.06, 0],
          [0.05, 0.06, 0],
          [0.03, -0.06, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.7, 1.4, 2.2],
        [
          [0.04, -0.08, 0.03],
          [-0.03, 0.08, -0.02],
          [0.06, 0.02, 0],
          [0.04, -0.08, 0.03],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.7, 1.4, 2.2],
        [
          [-0.78, 0.14, 0.08],
          [-1.06, 0.22, 0.14],
          [-0.68, 0.1, 0.06],
          [-0.78, 0.14, 0.08],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.1, 2.2],
        [
          [-1.02, -0.2, -0.06],
          [-1.08, -0.22, -0.06],
          [-1.02, -0.2, -0.06],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.2],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.2],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 16. Read_Test_Specification (Standing holding test spec doc)
    makeClip('Read_Test_Specification', 2.4, [
      posTrack(
        'Hips',
        [0, 1.2, 2.4],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.01, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.2, 2.4],
        [
          [0.08, 0, 0],
          [0.1, 0.02, 0],
          [0.08, 0, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.8, 1.6, 2.4],
        [
          [0.2, -0.08, 0],
          [0.22, 0.08, 0],
          [0.18, -0.02, 0],
          [0.2, -0.08, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 1.2, 2.4],
        [
          [-0.96, 0.24, 0.06],
          [-1.02, 0.26, 0.06],
          [-0.96, 0.24, 0.06],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.2, 2.4],
        [
          [-1.08, -0.24, -0.06],
          [-1.12, -0.26, -0.06],
          [-1.08, -0.24, -0.06],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 17. Think_Investigate (Chin-touch / magnifier root-cause investigation pose)
    makeClip('Think_Investigate', 2.4, [
      posTrack(
        'Hips',
        [0, 1.2, 2.4],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.01, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.2, 2.4],
        [
          [0.04, 0.04, 0],
          [0.06, -0.04, 0],
          [0.04, 0.04, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 1.2, 2.4],
        [
          [0.08, 0.08, 0.08],
          [0.12, -0.06, 0.05],
          [0.08, 0.08, 0.08],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 1.2, 2.4],
        [
          [-1.32, 0.34, 0.08],
          [-1.38, 0.36, 0.08],
          [-1.32, 0.34, 0.08],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.2, 2.4],
        [
          [-1.16, -0.22, -0.06],
          [-1.24, -0.18, -0.06],
          [-1.16, -0.22, -0.06],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.4],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 18. Phone_Call (Holding smartphone near ear / conversing)
    makeClip('Phone_Call', 2.2, [
      posTrack(
        'Hips',
        [0, 1.1, 2.2],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.012, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.1, 2.2],
        [
          [0, -0.05, 0],
          [0.03, 0.05, 0],
          [0, -0.05, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.7, 1.5, 2.2],
        [
          [0.04, -0.06, -0.05],
          [-0.02, 0.04, -0.03],
          [0.06, 0, -0.04],
          [0.04, -0.06, -0.05],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 1.1, 2.2],
        [
          [-0.45, 0.16, 0.08],
          [-0.65, 0.2, 0.12],
          [-0.45, 0.16, 0.08],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.1, 2.2],
        [
          [-1.48, -0.32, -0.08],
          [-1.52, -0.34, -0.08],
          [-1.48, -0.32, -0.08],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.2],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.2],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 19. Coffee_Break (Standing at QA_DEVOPS_COFFEE_TABLE sipping coffee)
    makeClip('Coffee_Break', 2.6, [
      posTrack(
        'Hips',
        [0, 1.3, 2.6],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.012, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.3, 2.6],
        [
          [0, 0, 0],
          [-0.04, 0.02, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 1.0, 1.6, 2.6],
        [
          [0, 0, 0],
          [-0.12, 0, 0],
          [-0.08, 0.04, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 1.3, 2.6],
        [
          [-0.22, 0.08, 0.05],
          [-0.28, 0.1, 0.06],
          [-0.22, 0.08, 0.05],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.0, 1.6, 2.6],
        [
          [-0.95, -0.22, -0.05],
          [-1.42, -0.32, -0.05],
          [-1.36, -0.3, -0.05],
          [-0.95, -0.22, -0.05],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.6],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.6],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 20. Task_Completed (Celebratory QA verification passed pose)
    makeClip('Task_Completed', 1.8, [
      posTrack(
        'Hips',
        [0, 0.45, 0.9, 1.35, 1.8],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.042, 0],
          [0, standHipsY + 0.01, 0],
          [0, standHipsY + 0.036, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 0.45, 0.9, 1.35, 1.8],
        [
          [0, 0, 0],
          [-0.08, 0.08, 0],
          [0, -0.06, 0],
          [-0.06, 0.06, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.45, 0.9, 1.35, 1.8],
        [
          [0, 0, 0],
          [-0.1, 0.06, 0.04],
          [0.06, -0.06, -0.04],
          [-0.08, 0.04, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.45, 0.9, 1.35, 1.8],
        [
          [-0.6, 0, 0.1],
          [-2.35, 0.15, 0.24],
          [-1.95, 0.1, 0.18],
          [-2.3, 0.15, 0.24],
          [-0.6, 0, 0.1],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 0.45, 0.9, 1.35, 1.8],
        [
          [-0.85, -0.15, -0.08],
          [-1.55, -0.2, -0.18],
          [-1.25, -0.18, -0.12],
          [-1.5, -0.2, -0.18],
          [-0.85, -0.15, -0.08],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 1.8],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 1.8],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 21. Waiting_Review (Patient standing posture checking clipboard)
    makeClip('Waiting_Review', 2.6, [
      posTrack(
        'Hips',
        [0, 1.3, 2.6],
        [
          [0, standHipsY, 0],
          [0, standHipsY + 0.008, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 1.3, 2.6],
        [
          [0.02, -0.03, 0.02],
          [0.03, 0.03, -0.02],
          [0.02, -0.03, 0.02],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.9, 1.8, 2.6],
        [
          [0.06, -0.12, 0.03],
          [0.08, 0.12, -0.03],
          [0.04, 0, 0],
          [0.06, -0.12, 0.03],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 1.3, 2.6],
        [
          [-0.35, 0.18, 0.06],
          [-0.42, 0.2, 0.06],
          [-0.35, 0.18, 0.06],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 1.3, 2.6],
        [
          [-0.88, -0.2, -0.06],
          [-0.94, -0.22, -0.06],
          [-0.88, -0.2, -0.06],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 2.6],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 2.6],
        [
          [0, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),

    // 22. Sit_Down (Standing -> Seated transition)
    makeClip('Sit_Down', 0.65, [
      posTrack(
        'Hips',
        [0, 0.65],
        [
          [0, standHipsY, 0],
          [0, seatHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 0.32, 0.65],
        [
          [0, 0, 0],
          [0.16, 0, 0],
          [0.08, 0, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.65],
        [
          [0, 0, 0],
          [0.06, 0, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.65],
        [
          [0, 0, 0.05],
          [-0.9, 0.14, 0.05],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 0.65],
        [
          [0, 0, -0.05],
          [-0.9, -0.14, -0.05],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 0.65],
        [
          [0, 0, 0],
          [-0.58, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 0.65],
        [
          [0, 0, 0],
          [-0.58, 0, 0],
        ]
      ),
    ]),

    // 23. Stand_Up (Seated -> Standing transition)
    makeClip('Stand_Up', 0.65, [
      posTrack(
        'Hips',
        [0, 0.65],
        [
          [0, seatHipsY, 0],
          [0, standHipsY, 0],
        ]
      ),
      quatTrack(
        'Torso',
        [0, 0.32, 0.65],
        [
          [0.08, 0, 0],
          [0.16, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Head',
        [0, 0.65],
        [
          [0.06, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Arm_Left',
        [0, 0.65],
        [
          [-0.9, 0.14, 0.05],
          [0, 0, 0.05],
        ]
      ),
      quatTrack(
        'Arm_Right',
        [0, 0.65],
        [
          [-0.9, -0.14, -0.05],
          [0, 0, -0.05],
        ]
      ),
      quatTrack(
        'Leg_Left',
        [0, 0.65],
        [
          [-0.58, 0, 0],
          [0, 0, 0],
        ]
      ),
      quatTrack(
        'Leg_Right',
        [0, 0.65],
        [
          [-0.58, 0, 0],
          [0, 0, 0],
        ]
      ),
    ]),
  ];
}

export function buildQAEngineerSceneAndClips(): {
  rig: BuiltQAEngineerRig;
  root: THREE.Group;
  clips: THREE.AnimationClip[];
} {
  const rig = buildQAEngineerCharacterRig();
  const clips = buildQAEngineerAnimationClips();
  rig.root.animations = clips;
  return {
    rig,
    root: rig.root,
    clips,
  };
}

/**
 * Exports the standalone `qa_engineer_agent.glb` binary ArrayBuffer with all 23 embedded
 * `THREE.AnimationClip`s and zero room/helper/runtime indicator geometry.
 */
export async function exportQAEngineerToGLBBuffer(): Promise<ArrayBuffer> {
  const { rig, root, clips } = buildQAEngineerSceneAndClips();

  // Guarantee clean rest pose for standalone character GLB export
  rig.hips.position.set(0, QA_CHARACTER_CONSTANTS.STANDING_HIPS_Y, 0);
  rig.hips.rotation.set(0, 0, 0);
  rig.torso.rotation.set(0, 0, 0);
  rig.head.rotation.set(0, 0, 0);
  rig.leftArm.rotation.set(0, 0, 0);
  rig.rightArm.rotation.set(0, 0, 0);
  rig.leftLeg.rotation.set(0, 0, 0);
  rig.rightLeg.rotation.set(0, 0, 0);

  // Default appearance: NO default glasses, NO default headset, backpack visible, all handheld props hidden
  rig.glassesGroup.visible = false;
  rig.headsetGroup.visible = false;
  rig.backpackGroup.visible = true;
  Object.values(rig.propMap).forEach((p) => {
    p.visible = false;
  });
  applyQAExpressionToFace(rig.faceNodes, 'neutral');
  root.updateMatrixWorld(true);

  const exporter = new GLTFExporter();
  return new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      root,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(new Error('Expected binary GLB ArrayBuffer from GLTFExporter for QA Engineer.'));
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

export interface QASimulationHelpersInstance {
  helpersRoot: THREE.Group;
  updatePathVisual: (
    pathPoints: Array<[number, number, number]>,
    targetPos: [number, number, number],
    visible: boolean
  ) => void;
}

export function buildQASimulationHelpersGroup(): QASimulationHelpersInstance {
  const helpersRoot = new THREE.Group();
  helpersRoot.name = 'QA_SIMULATION_PATH_HELPERS';

  const lineMat = new THREE.LineBasicMaterial({
    color: 0xf5b82e,
    transparent: true,
    opacity: 0.85,
  });
  const lineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.04, 0),
    new THREE.Vector3(0, 0.04, 0),
  ]);
  const pathLine = new THREE.Line(lineGeom, lineMat);
  pathLine.name = 'QA_Nav_Path_Line';
  pathLine.visible = false;
  helpersRoot.add(pathLine);

  const markerRing = new THREE.Mesh(
    new THREE.RingGeometry(0.16, 0.24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xf5b82e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    })
  );
  markerRing.rotation.x = -Math.PI / 2;
  markerRing.position.y = 0.025;
  markerRing.visible = false;
  helpersRoot.add(markerRing);

  return {
    helpersRoot,
    updatePathVisual(pathPoints, targetPos, visible) {
      if (!visible || pathPoints.length < 2) {
        pathLine.visible = false;
        markerRing.visible = false;
        return;
      }
      const vecs = pathPoints.map(([x, , z]) => new THREE.Vector3(x, 0.038, z));
      pathLine.geometry.dispose();
      pathLine.geometry = new THREE.BufferGeometry().setFromPoints(vecs);
      pathLine.visible = true;

      markerRing.position.set(targetPos[0], 0.025, targetPos[2]);
      markerRing.visible = true;
    },
  };
}

export interface QACharacterRuntimeInstance {
  runtimeRoot: THREE.Group;
  characterRoot: THREE.Group;
  rig: BuiltQAEngineerRig;
  mixer: THREE.AnimationMixer;
  clips: THREE.AnimationClip[];
  update: (dt: number) => void;
  triggerAction: (actionId: QAActionId) => void;
  walkToAnchor: (anchorId: QADevOpsAnchorId) => void;
  executePlayback: (cmd: QAAnimationPlaybackCommand) => void;
  setSpeedMultiplier: (speed: QASpeedMultiplier) => void;
  setPatrolActive: (enabled: boolean) => void;
  startAutoDemo: () => void;
  stopAutoDemo: () => void;
  setExpression: (expr: QAExpressionId) => void;
  setHeadsetVisible: (visible: boolean) => void;
  setGlassesVisible: (visible: boolean) => void;
  setBackpackVisible: (visible: boolean) => void;
  getStatus: () => QASimulationRuntimeStatus;
  getActivePathPoints: () => Array<[number, number, number]>;
}

function shortestAngleDiff(fromRad: number, toRad: number): number {
  let diff = ((toRad - fromRad + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export function createQAEngineerRuntime(
  onStatusChange?: (status: QASimulationRuntimeStatus) => void
): QACharacterRuntimeInstance {
  const { rig, root: characterRoot, clips } = buildQAEngineerSceneAndClips();

  const runtimeRoot = new THREE.Group();
  runtimeRoot.name = QA_CHARACTER_CONSTANTS.RUNTIME_ROOT_NAME;
  runtimeRoot.add(characterRoot);

  // Attach runtime-only overhead indicator badges to runtimeRoot (outside characterRoot!)
  const { indicatorsRoot, indicatorMap } = buildQARuntimeIndicatorsGroup(rig.palette);
  runtimeRoot.add(indicatorsRoot);

  const mixer = new THREE.AnimationMixer(characterRoot);
  const clipActions = new Map<QAAnimationClipName, THREE.AnimationAction>();
  for (const clip of clips) {
    clipActions.set(clip.name as QAAnimationClipName, mixer.clipAction(clip));
  }

  const initialAnchorId: QADevOpsAnchorId = QA_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR;
  const initialAnchor = getQADefaultAnchorPositionAndFacing(initialAnchorId);

  runtimeRoot.position.set(
    initialAnchor.position[0],
    0,
    initialAnchor.position[2]
  );
  characterRoot.rotation.y = initialAnchor.rotationY;

  let currentActionId: QAActionId = 'IDLE';
  let currentState: QAAgentState = 'IDLE';
  let activeClipName: QAAnimationClipName = 'Idle_Breathing';
  let currentAnchorId: QADevOpsAnchorId = initialAnchorId;
  let targetAnchorId: QADevOpsAnchorId = initialAnchorId;
  let currentExpression: QAExpressionId = 'neutral';
  let posture: 'standing' | 'seated' = 'standing';
  let handheldProp: QAPropId = 'none';
  let runtimeIndicator: QARuntimeIndicatorId = 'none';

  let isWalking = false;
  let isPaused = false;
  let patrolActive = false;
  let patrolRingIndex = 0;
  let patrolPauseTimer = 0;

  let autoDemoActive = false;
  let autoDemoStepIdx = 0;
  let autoDemoTimer = 0;

  let speedMultiplier: QASpeedMultiplier = 1;
  let userHeadsetVisible = false;
  let userGlassesVisible = false;
  let userBackpackVisible = true;
  let indicatorFloatTime = 0;

  let waypoints: Array<[number, number, number]> = [];
  let pendingArrivalAction: QAActionContractSnapshot | null = null;

  interface QAActionContractSnapshot {
    actionId: QAActionId;
    targetAnchor: QADevOpsAnchorId;
  }

  let currentActiveAction: THREE.AnimationAction | null = null;

  function playClip(clipName: QAAnimationClipName) {
    const nextAction = clipActions.get(clipName);
    if (!nextAction) return;
    if (currentActiveAction === nextAction && nextAction.isRunning()) {
      activeClipName = clipName;
      return;
    }
    nextAction.reset();
    nextAction.setEffectiveTimeScale(isPaused ? 0 : speedMultiplier);
    nextAction.play();
    if (currentActiveAction && currentActiveAction !== nextAction) {
      currentActiveAction.crossFadeTo(nextAction, 0.18, false);
    }
    currentActiveAction = nextAction;
    activeClipName = clipName;
  }

  function syncPropAndIndicators(prop: QAPropId, indicator: QARuntimeIndicatorId) {
    handheldProp = prop;
    runtimeIndicator = indicator;
    (Object.keys(rig.propMap) as Array<Exclude<QAPropId, 'none'>>).forEach((key) => {
      rig.propMap[key].visible = key === prop;
    });
    (Object.keys(indicatorMap) as Array<Exclude<QARuntimeIndicatorId, 'none'>>).forEach((key) => {
      indicatorMap[key].visible = key === indicator;
    });
  }

  function syncAccessoriesForPosture() {
    rig.glassesGroup.visible = userGlassesVisible;
    rig.headsetGroup.visible =
      userHeadsetVisible ||
      currentActionId === 'PHONE_CALL' ||
      currentActionId === 'RUN_TEST_SUITE_DEMO';
    const hideBackpackForSeat = posture === 'seated';
    rig.backpackGroup.visible = userBackpackVisible && !hideBackpackForSeat;
  }

  function applyActionAtDestination(actionId: QAActionId) {
    const contract = QA_ACTIONS[actionId] ?? QA_ACTIONS.IDLE;
    currentActionId = contract.id;
    currentState = contract.agentState;
    posture = contract.posture;
    currentExpression = contract.expression;

    applyQAExpressionToFace(rig.faceNodes, currentExpression);
    syncPropAndIndicators(contract.prop, contract.runtimeIndicator);
    syncAccessoriesForPosture();
    playClip(contract.clipName);
    emitStatus();
  }

  function beginNavigationToAnchor(destAnchorId: QADevOpsAnchorId, arrivalActionId: QAActionId) {
    const destInfo = getQADefaultAnchorPositionAndFacing(destAnchorId);
    const startXZ: [number, number] = [runtimeRoot.position.x, runtimeRoot.position.z];
    const contract = QA_ACTIONS[arrivalActionId] ?? QA_ACTIONS.IDLE;

    // If destination is seated (`QA_DESK_WORK`), route through approach anchor first
    const approachAnchorId = contract.approachAnchorName;
    let computedPath: Array<[number, number, number]>;
    if (approachAnchorId && DEFAULT_QA_DEVOPS_ANCHORS[approachAnchorId]) {
      const appPos = DEFAULT_QA_DEVOPS_ANCHORS[approachAnchorId].position;
      const dToApp = Math.hypot(appPos[0] - startXZ[0], appPos[2] - startXZ[1]);
      if (dToApp > 0.22) {
        computedPath = findQAWalkablePath(startXZ, [appPos[0], appPos[2]]);
        computedPath.push([...destInfo.position]);
      } else {
        computedPath = [[...destInfo.position]];
      }
    } else {
      computedPath = findQAWalkablePath(startXZ, [destInfo.position[0], destInfo.position[2]]);
    }

    const totalDist = Math.hypot(
      destInfo.position[0] - startXZ[0],
      destInfo.position[2] - startXZ[1]
    );
    targetAnchorId = destAnchorId;

    if (totalDist <= QA_CHARACTER_CONSTANTS.ARRIVAL_THRESHOLD_M) {
      runtimeRoot.position.set(destInfo.position[0], 0, destInfo.position[2]);
      characterRoot.rotation.y = destInfo.rotationY;
      currentAnchorId = destAnchorId;
      isWalking = false;
      waypoints = [];
      pendingArrivalAction = null;
      applyActionAtDestination(arrivalActionId);
      return;
    }

    // Stand up and restore standing backpack before walking
    posture = 'standing';
    syncAccessoriesForPosture();
    syncPropAndIndicators(
      arrivalActionId === 'WALK_TO_ANCHOR' ? 'checklist_clipboard' : 'none',
      'none'
    );
    applyQAExpressionToFace(rig.faceNodes, 'neutral');

    isWalking = true;
    currentState = 'MOVING';
    waypoints = computedPath;
    pendingArrivalAction = {
      actionId: arrivalActionId,
      targetAnchor: destAnchorId,
    };
    playClip('Walk_Cycle');
    emitStatus();
  }

  function getStatus(): QASimulationRuntimeStatus {
    const contract = QA_ACTIONS[currentActionId] ?? QA_ACTIONS.IDLE;
    return {
      characterId: QA_CHARACTER_CONSTANTS.CHARACTER_ID,
      displayName: QA_CHARACTER_CONSTANTS.DISPLAY_NAME,
      currentState,
      currentActionId,
      currentActionLabel: contract.idLabel,
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
      autoDemoStepIndex: autoDemoStepIdx,
      autoDemoTotalSteps: QA_AUTO_DEMO_SEQUENCE.length,
      speedMultiplier,
      headsetVisible: rig.headsetGroup.visible,
      glassesVisible: userGlassesVisible,
      backpackVisible: userBackpackVisible,
      backpackAutoHiddenForSeat: posture === 'seated',
      bubbleText: contract.bubbleText,
      thoughtText: contract.thoughtText,
      worldPosition: [
        Number(runtimeRoot.position.x.toFixed(2)),
        Number(runtimeRoot.position.y.toFixed(2)),
        Number(runtimeRoot.position.z.toFixed(2)),
      ],
      facingRad: Number(characterRoot.rotation.y.toFixed(3)),
    };
  }

  function emitStatus() {
    onStatusChange?.(getStatus());
  }

  // Initialize Idle clip
  applyQAExpressionToFace(rig.faceNodes, 'neutral');
  playClip('Idle_Breathing');

  return {
    runtimeRoot,
    characterRoot,
    rig,
    mixer,
    clips,

    update(dt: number) {
      if (isPaused) return;
      const scaledDt = Math.min(dt, 0.08) * speedMultiplier;
      mixer.update(scaledDt);

      // Subtle floating motion for runtime overhead indicator
      indicatorFloatTime += scaledDt;
      indicatorsRoot.position.y =
        (posture === 'seated' ? 1.72 : 1.88) + Math.sin(indicatorFloatTime * 3.5) * 0.025;

      if (isWalking && waypoints.length > 0) {
        const nextWp = waypoints[0];
        const dx = nextWp[0] - runtimeRoot.position.x;
        const dz = nextWp[2] - runtimeRoot.position.z;
        const dist = Math.hypot(dx, dz);
        const stepDist = QA_CHARACTER_CONSTANTS.WALK_SPEED_MPS * scaledDt;

        if (dist > 0.008) {
          const desiredYaw = Math.atan2(dx, dz);
          const dYaw = shortestAngleDiff(characterRoot.rotation.y, desiredYaw);
          characterRoot.rotation.y +=
            dYaw * Math.min(1, scaledDt * QA_CHARACTER_CONSTANTS.ROTATION_LERP_SPEED);
        }

        if (dist <= stepDist + 0.02) {
          runtimeRoot.position.x = nextWp[0];
          runtimeRoot.position.z = nextWp[2];
          waypoints.shift();

          if (waypoints.length === 0) {
            isWalking = false;
            const arrivedAnchor = pendingArrivalAction?.targetAnchor ?? targetAnchorId;
            const arrivedAction = pendingArrivalAction?.actionId ?? currentActionId;
            currentAnchorId = arrivedAnchor;
            const destInfo = getQADefaultAnchorPositionAndFacing(arrivedAnchor);
            characterRoot.rotation.y = destInfo.rotationY;
            pendingArrivalAction = null;

            if (patrolActive && !autoDemoActive) {
              patrolPauseTimer = 1.6;
              applyActionAtDestination('IDLE');
            } else if (arrivedAction === 'WALK_TO_ANCHOR') {
              applyActionAtDestination('IDLE');
            } else {
              applyActionAtDestination(arrivedAction);
            }
          }
        } else {
          runtimeRoot.position.x += (dx / dist) * stepDist;
          runtimeRoot.position.z += (dz / dist) * stepDist;
        }
        emitStatus();
      } else {
        // Smoothly align facing direction to current anchor
        const anchorInfo = getQADefaultAnchorPositionAndFacing(currentAnchorId);
        const dYaw = shortestAngleDiff(characterRoot.rotation.y, anchorInfo.rotationY);
        if (Math.abs(dYaw) > 0.005) {
          characterRoot.rotation.y +=
            dYaw * Math.min(1, scaledDt * QA_CHARACTER_CONSTANTS.ROTATION_LERP_SPEED);
        }

        if (autoDemoActive) {
          autoDemoTimer -= scaledDt;
          if (autoDemoTimer <= 0) {
            autoDemoStepIdx++;
            if (autoDemoStepIdx >= QA_AUTO_DEMO_SEQUENCE.length) {
              autoDemoActive = false;
              autoDemoStepIdx = 0;
              beginNavigationToAnchor(QA_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR, 'IDLE');
            } else {
              const step = QA_AUTO_DEMO_SEQUENCE[autoDemoStepIdx];
              autoDemoTimer = step.durationSec;
              const actContract = QA_ACTIONS[step.actionId] ?? QA_ACTIONS.IDLE;
              currentActionId = step.actionId;
              beginNavigationToAnchor(actContract.targetAnchorName, step.actionId);
            }
          }
        } else if (patrolActive) {
          patrolPauseTimer -= scaledDt;
          if (patrolPauseTimer <= 0) {
            patrolRingIndex = (patrolRingIndex + 1) % QA_PATROL_ANCHOR_RING.length;
            const nextAnchor = QA_PATROL_ANCHOR_RING[patrolRingIndex];
            beginNavigationToAnchor(nextAnchor, 'WALK_TO_ANCHOR');
          }
        }
      }
    },

    triggerAction(actionId: QAActionId) {
      autoDemoActive = false;
      patrolActive = false;
      isPaused = false;
      const contract = QA_ACTIONS[actionId] ?? QA_ACTIONS.IDLE;
      currentActionId = contract.id;

      // For WALK_TO_ANCHOR, cycle to the next anchor in QA_PATROL_ANCHOR_RING so clicking button 2 always walks
      if (actionId === 'WALK_TO_ANCHOR') {
        patrolRingIndex = (patrolRingIndex + 1) % QA_PATROL_ANCHOR_RING.length;
        const nextAnchor = QA_PATROL_ANCHOR_RING[patrolRingIndex];
        beginNavigationToAnchor(nextAnchor, 'WALK_TO_ANCHOR');
        return;
      }

      beginNavigationToAnchor(contract.targetAnchorName, contract.id);
    },

    walkToAnchor(anchorId: QADevOpsAnchorId) {
      autoDemoActive = false;
      patrolActive = false;
      isPaused = false;
      currentActionId = 'WALK_TO_ANCHOR';
      beginNavigationToAnchor(anchorId, 'WALK_TO_ANCHOR');
    },

    executePlayback(cmd: QAAnimationPlaybackCommand) {
      if (cmd === 'pause') {
        isPaused = true;
        if (currentActiveAction) currentActiveAction.setEffectiveTimeScale(0);
      } else if (cmd === 'play' || cmd === 'resume') {
        isPaused = false;
        if (currentActiveAction) currentActiveAction.setEffectiveTimeScale(speedMultiplier);
      } else if (cmd === 'stop' || cmd === 'reset_idle') {
        isPaused = false;
        autoDemoActive = false;
        patrolActive = false;
        isWalking = false;
        waypoints = [];
        pendingArrivalAction = null;
        applyActionAtDestination('IDLE');
      } else if (cmd === 'reset_position') {
        isPaused = false;
        autoDemoActive = false;
        patrolActive = false;
        isWalking = false;
        waypoints = [];
        pendingArrivalAction = null;
        const spawnInfo = getQADefaultAnchorPositionAndFacing(
          QA_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR
        );
        runtimeRoot.position.set(spawnInfo.position[0], 0, spawnInfo.position[2]);
        characterRoot.rotation.y = spawnInfo.rotationY;
        currentAnchorId = QA_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR;
        targetAnchorId = QA_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR;
        applyActionAtDestination('IDLE');
      }
      emitStatus();
    },

    setSpeedMultiplier(speed: QASpeedMultiplier) {
      speedMultiplier = speed;
      if (currentActiveAction && !isPaused) {
        currentActiveAction.setEffectiveTimeScale(speedMultiplier);
      }
      emitStatus();
    },

    setPatrolActive(enabled: boolean) {
      patrolActive = enabled;
      if (enabled) {
        autoDemoActive = false;
        isPaused = false;
        patrolRingIndex = (patrolRingIndex + 1) % QA_PATROL_ANCHOR_RING.length;
        beginNavigationToAnchor(QA_PATROL_ANCHOR_RING[patrolRingIndex], 'WALK_TO_ANCHOR');
      } else {
        isWalking = false;
        waypoints = [];
        applyActionAtDestination('IDLE');
      }
      emitStatus();
    },

    startAutoDemo() {
      patrolActive = false;
      isPaused = false;
      autoDemoActive = true;
      autoDemoStepIdx = 0;
      const firstStep = QA_AUTO_DEMO_SEQUENCE[0];
      autoDemoTimer = firstStep.durationSec;
      const contract = QA_ACTIONS[firstStep.actionId] ?? QA_ACTIONS.IDLE;
      currentActionId = firstStep.actionId;
      beginNavigationToAnchor(contract.targetAnchorName, firstStep.actionId);
      emitStatus();
    },

    stopAutoDemo() {
      if (!autoDemoActive) return;
      autoDemoActive = false;
      isWalking = false;
      waypoints = [];
      pendingArrivalAction = null;
      applyActionAtDestination('IDLE');
      emitStatus();
    },

    setExpression(expr: QAExpressionId) {
      currentExpression = expr;
      applyQAExpressionToFace(rig.faceNodes, expr);
      emitStatus();
    },

    setHeadsetVisible(visible: boolean) {
      userHeadsetVisible = visible;
      syncAccessoriesForPosture();
      emitStatus();
    },

    setGlassesVisible(visible: boolean) {
      userGlassesVisible = visible;
      syncAccessoriesForPosture();
      emitStatus();
    },

    setBackpackVisible(visible: boolean) {
      userBackpackVisible = visible;
      syncAccessoriesForPosture();
      emitStatus();
    },

    getStatus,

    getActivePathPoints() {
      if (!isWalking || waypoints.length === 0) return [];
      return [[runtimeRoot.position.x, 0, runtimeRoot.position.z], ...waypoints];
    },
  };
}
