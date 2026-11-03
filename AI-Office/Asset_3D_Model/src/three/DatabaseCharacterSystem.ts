/**
 * AI Office — Engineering Agent 03: Database Developer / Database Administrator Character System V1
 * (`database_developer_agent` / `ai_office.character.database_developer_agent.v1`)
 *
 * Implements:
 * 1. Canonical 1.725m stylized voxel/blocky Database Developer character rig (`Database_Developer_Agent_Root`)
 *    grounded at Y = 0.000 inside `AI_OFFICE_ROOM_ENGINEERING_v1`.
 * 2. 360-degree layered dark chestnut-brown voxel hairstyle (`Hair` group with 8 semantic sub-groups:
 *    `Hair_Crown_Base`, `Hair_Crown_Layers`, `Hair_Front_Fringe`, `Hair_Left_Temple`, `Hair_Right_Temple`,
 *    `Hair_Side_Layers`, `Hair_Back_Volume`, `Hair_Back_Taper`) using 5 matte dark-brown materials.
 * 3. Expressive cubic voxel face (`Face` group) with warm beige skin, dark rectangular eyes, pupils,
 *    eye highlights, minimal eyebrows, small nose, cheek accents, mouth, and NO default eyeglasses.
 * 4. Dark charcoal technical jacket with distinct front panel layers, light inner shirt, emerald-green
 *    (`#10B981`) & olive-green (`#4D7C0F`) accents, 3-tier voxel Database sleeve patch, compact green-accent
 *    technical backpack (`Backpack`), dark trousers, and white/light-gray sneakers with emerald tabs.
 * 5. Contextual handheld props (`Prop_DB_Laptop`, `Prop_Schema_Tablet`, `Prop_SQL_Reference_Book`,
 *    `Prop_Schema_Document`, `Prop_Schema_Clipboard`, `Prop_Coffee_Cup`, `Prop_DB_Model_Card`) — hidden in rest pose.
 * 6. 21 embedded `THREE.AnimationClip`s + 9 facial expressions + full runtime state machine.
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import {
  DATABASE_ACTION_LIST,
  DATABASE_ACTIONS,
  DATABASE_AUTO_DEMO_SEQUENCE,
  DATABASE_CHARACTER_CONSTANTS,
  DATABASE_EXPRESSION_PRESETS,
  DATABASE_HAIR_MATERIAL_PALETTE,
  DATABASE_OUTFIT_PALETTE,
  DATABASE_PATROL_ANCHOR_RING,
  DATABASE_REQUIRED_ANIMATION_CLIPS,
  type DatabaseActionId,
  type DatabaseActionSpec,
  type DatabaseAgentState,
  type DatabaseAnimationClipName,
  type DatabaseAnimationPlaybackCommand,
  type DatabaseExpressionId,
  type DatabasePropId,
  type DatabaseSimulationRuntimeStatus,
  type DatabaseSpeedMultiplier,
  findDatabaseWalkablePath,
  getEngineeringAnchorForDatabaseOrThrow,
} from '../domain/databaseSimulationSpec';
import { ENGINEERING_ANCHORS } from '../domain/engineeringRoomSpec';

export interface BuiltDatabaseCharacterRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  hairGroup: THREE.Group;
  faceGroup: THREE.Group;
  backpackGroup: THREE.Group;
  armLeft: THREE.Group;
  armRight: THREE.Group;
  legLeft: THREE.Group;
  legRight: THREE.Group;
  propsById: Record<Exclude<DatabasePropId, 'none'>, THREE.Group>;
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

function makeVoxelBox(
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
  return mesh;
}

/**
 * Builds the 360-degree layered dark chestnut-brown voxel hairstyle for the Database Developer.
 * Designed to be volumetric from all 8 turnaround angles (Front, Front-Right, Right, Back-Right,
 * Back, Back-Left, Left, Front-Left) with zero bald patches, zero ear clipping, and zero coplanar Z-fighting.
 */
function buildDatabaseLayeredHairGroup(
  hairMats: Record<string, THREE.MeshStandardMaterial>,
): THREE.Group {
  const hairRoot = new THREE.Group();
  hairRoot.name = 'Hair';

  const mBase = hairMats.db_hair_base_dark_chestnut;
  const mShadow = hairMats.db_hair_shadow_espresso;
  const mMid = hairMats.db_hair_mid_warm_brown;
  const mHigh = hairMats.db_hair_highlight_soft_brown;
  const mBurgundy = hairMats.db_hair_accent_burgundy_brown;

  // 1. Hair_Crown_Base — Solid volumetric foundation over the upper cranium
  const crownBase = new THREE.Group();
  crownBase.name = 'Hair_Crown_Base';
  crownBase.add(
    makeVoxelBox('Hair_Crown_Core_Block', [0.368, 0.11, 0.348], [0, 0.365, -0.006], mBase),
    makeVoxelBox('Hair_Crown_Inner_Cap', [0.352, 0.06, 0.334], [0, 0.325, -0.008], mShadow),
  );
  hairRoot.add(crownBase);

  // 2. Hair_Crown_Layers — Multi-stepped tousled upper crown layers peaking at Y = 0.455
  //    (so total character height = 0.90 Hips + 0.37 Torso + 0.455 Hair = 1.725m exact)
  const crownLayers = new THREE.Group();
  crownLayers.name = 'Hair_Crown_Layers';
  crownLayers.add(
    makeVoxelBox('Hair_Crown_Mid_Plate', [0.336, 0.044, 0.312], [0.004, 0.418, -0.004], mMid),
    makeVoxelBox('Hair_Crown_Left_Tousle', [0.135, 0.036, 0.245], [-0.078, 0.434, 0.008], mHigh),
    makeVoxelBox('Hair_Crown_Center_Peak', [0.148, 0.03, 0.228], [0.014, 0.440, 0.012], mHigh),
    makeVoxelBox('Hair_Crown_Right_Step', [0.118, 0.032, 0.232], [0.095, 0.430, -0.012], mBurgundy),
    makeVoxelBox('Hair_Crown_Rear_Crest', [0.275, 0.034, 0.125], [-0.008, 0.428, -0.096], mMid),
  );
  hairRoot.add(crownLayers);

  // 3. Hair_Front_Fringe — Asymmetric stepped front fringe framing forehead above eyebrows (Z > +0.16)
  const frontFringe = new THREE.Group();
  frontFringe.name = 'Hair_Front_Fringe';
  frontFringe.add(
    makeVoxelBox('Hair_Fringe_Upper_Bridge', [0.356, 0.056, 0.058], [0, 0.348, 0.162], mBase),
    makeVoxelBox('Hair_Fringe_Left_Sweep_Main', [0.128, 0.068, 0.052], [-0.096, 0.316, 0.172], mMid),
    makeVoxelBox('Hair_Fringe_Left_Tip', [0.078, 0.046, 0.046], [-0.118, 0.288, 0.176], mHigh),
    makeVoxelBox('Hair_Fringe_Center_Left_Lock', [0.088, 0.064, 0.056], [-0.018, 0.314, 0.178], mHigh),
    makeVoxelBox('Hair_Fringe_Center_Right_Part', [0.072, 0.048, 0.048], [0.054, 0.326, 0.171], mShadow),
    makeVoxelBox('Hair_Fringe_Right_Swept_Lock', [0.104, 0.062, 0.052], [0.114, 0.315, 0.169], mBurgundy),
    makeVoxelBox('Hair_Fringe_Right_Corner_Drop', [0.058, 0.052, 0.044], [0.148, 0.292, 0.163], mBase),
  );
  hairRoot.add(frontFringe);

  // 4. Hair_Left_Temple — Compact stepped volume framing left forehead & above left ear
  const leftTemple = new THREE.Group();
  leftTemple.name = 'Hair_Left_Temple';
  leftTemple.add(
    makeVoxelBox('Hair_Left_Temple_Upper', [0.048, 0.088, 0.142], [-0.178, 0.308, 0.088], mBase),
    makeVoxelBox('Hair_Left_Sideburn_Lock', [0.042, 0.078, 0.056], [-0.176, 0.244, 0.098], mShadow),
    makeVoxelBox('Hair_Left_Temple_Accent', [0.044, 0.056, 0.088], [-0.182, 0.324, 0.062], mMid),
  );
  hairRoot.add(leftTemple);

  // 5. Hair_Right_Temple — Compact stepped volume framing right forehead & above right ear
  const rightTemple = new THREE.Group();
  rightTemple.name = 'Hair_Right_Temple';
  rightTemple.add(
    makeVoxelBox('Hair_Right_Temple_Upper', [0.048, 0.088, 0.142], [0.178, 0.308, 0.088], mBase),
    makeVoxelBox('Hair_Right_Sideburn_Lock', [0.042, 0.078, 0.056], [0.176, 0.244, 0.098], mShadow),
    makeVoxelBox('Hair_Right_Temple_Accent', [0.044, 0.056, 0.088], [0.182, 0.324, 0.062], mBurgundy),
  );
  hairRoot.add(rightTemple);

  // 6. Hair_Side_Layers — Left and right lateral stepped hair layers arching cleanly over & behind the ears
  const sideLayers = new THREE.Group();
  sideLayers.name = 'Hair_Side_Layers';
  sideLayers.add(
    // Left side arch over ear (ear is at Y = 0.16..0.24, Z = -0.02..0.04)
    makeVoxelBox('Hair_Side_Left_Over_Ear', [0.052, 0.076, 0.165], [-0.180, 0.296, -0.022], mBase),
    makeVoxelBox('Hair_Side_Left_Mid_Step', [0.048, 0.064, 0.135], [-0.184, 0.312, -0.036], mMid),
    makeVoxelBox('Hair_Side_Left_Post_Ear', [0.050, 0.145, 0.105], [-0.176, 0.218, -0.108], mBase),
    makeVoxelBox('Hair_Side_Left_Lower_Taper', [0.044, 0.085, 0.084], [-0.168, 0.136, -0.116], mShadow),
    // Right side arch over ear
    makeVoxelBox('Hair_Side_Right_Over_Ear', [0.052, 0.076, 0.165], [0.180, 0.296, -0.022], mBase),
    makeVoxelBox('Hair_Side_Right_Mid_Step', [0.048, 0.064, 0.135], [0.184, 0.312, -0.036], mBurgundy),
    makeVoxelBox('Hair_Side_Right_Post_Ear', [0.050, 0.145, 0.105], [0.176, 0.218, -0.108], mBase),
    makeVoxelBox('Hair_Side_Right_Lower_Taper', [0.044, 0.085, 0.084], [0.168, 0.136, -0.116], mShadow),
  );
  hairRoot.add(sideLayers);

  // 7. Hair_Back_Volume — Deliberately modeled thick upper & mid rear layered volume
  const backVolume = new THREE.Group();
  backVolume.name = 'Hair_Back_Volume';
  backVolume.add(
    makeVoxelBox('Hair_Back_Upper_Mass', [0.354, 0.135, 0.064], [0, 0.285, -0.172], mBase),
    makeVoxelBox('Hair_Back_Upper_Tier_Left', [0.156, 0.095, 0.048], [-0.076, 0.298, -0.192], mMid),
    makeVoxelBox('Hair_Back_Upper_Tier_Right', [0.156, 0.095, 0.048], [0.076, 0.292, -0.190], mBurgundy),
    makeVoxelBox('Hair_Back_Center_Ridge', [0.132, 0.108, 0.052], [0.004, 0.268, -0.196], mHigh),
    makeVoxelBox('Hair_Back_Mid_Layer', [0.336, 0.115, 0.058], [0, 0.192, -0.168], mBase),
    makeVoxelBox('Hair_Back_Mid_Step_Center', [0.248, 0.082, 0.046], [0, 0.188, -0.186], mMid),
  );
  hairRoot.add(backVolume);

  // 8. Hair_Back_Taper — Stepped lower contour tapering naturally toward the nape
  const backTaper = new THREE.Group();
  backTaper.name = 'Hair_Back_Taper';
  backTaper.add(
    makeVoxelBox('Hair_Back_Lower_Taper_Main', [0.296, 0.078, 0.048], [0, 0.112, -0.162], mShadow),
    makeVoxelBox('Hair_Back_Lower_Taper_Center', [0.212, 0.058, 0.042], [0, 0.082, -0.166], mShadow),
    makeVoxelBox('Hair_Back_Nape_Edge_Left', [0.082, 0.048, 0.038], [-0.074, 0.076, -0.168], mBase),
    makeVoxelBox('Hair_Back_Nape_Edge_Right', [0.082, 0.048, 0.038], [0.074, 0.076, -0.168], mBase),
  );
  hairRoot.add(backTaper);

  return hairRoot;
}

/**
 * Builds the 7 contextual handheld props for the Database Developer, attached under
 * `Hand_Right -> Props_Attachment` and hidden by default in rest pose.
 */
function buildDatabasePropsAttachment(): {
  attachmentRoot: THREE.Group;
  propsById: Record<Exclude<DatabasePropId, 'none'>, THREE.Group>;
} {
  const attachmentRoot = new THREE.Group();
  attachmentRoot.name = 'Props_Attachment';
  attachmentRoot.position.set(0, -0.28, 0.08);

  const matDarkBody = new THREE.MeshStandardMaterial({
    color: '#1E242C',
    roughness: 0.55,
    metalness: 0.25,
  });
  const matSilver = new THREE.MeshStandardMaterial({
    color: '#CBD5E1',
    roughness: 0.4,
    metalness: 0.45,
  });
  const matEmeraldGlow = new THREE.MeshStandardMaterial({
    color: '#10B981',
    emissive: '#059669',
    emissiveIntensity: 0.35,
    roughness: 0.35,
    metalness: 0.1,
  });
  const matOlive = new THREE.MeshStandardMaterial({
    color: '#4D7C0F',
    roughness: 0.65,
    metalness: 0.1,
  });
  const matPaper = new THREE.MeshStandardMaterial({
    color: '#F8FAFC',
    roughness: 0.85,
    metalness: 0.02,
  });
  const matMug = new THREE.MeshStandardMaterial({
    color: '#ECFDF5',
    roughness: 0.45,
    metalness: 0.08,
  });
  const matCoffee = new THREE.MeshStandardMaterial({
    color: '#3E2723',
    roughness: 0.35,
    metalness: 0.05,
  });

  // 1. Prop_DB_Laptop
  const dbLaptop = new THREE.Group();
  dbLaptop.name = 'Prop_DB_Laptop';
  dbLaptop.add(
    makeVoxelBox('DB_Laptop_Base', [0.22, 0.016, 0.16], [0, 0, 0.04], matDarkBody),
    makeVoxelBox(
      'DB_Laptop_Screen_Back',
      [0.22, 0.15, 0.014],
      [0, 0.072, 0.115],
      matDarkBody,
      [-0.25, 0, 0],
    ),
    makeVoxelBox(
      'DB_Laptop_Screen_ERD',
      [0.195, 0.125, 0.006],
      [0, 0.072, 0.108],
      matEmeraldGlow,
      [-0.25, 0, 0],
    ),
  );
  dbLaptop.visible = false;
  attachmentRoot.add(dbLaptop);

  // 2. Prop_Schema_Tablet
  const schemaTablet = new THREE.Group();
  schemaTablet.name = 'Prop_Schema_Tablet';
  schemaTablet.add(
    makeVoxelBox('Schema_Tablet_Frame', [0.18, 0.016, 0.23], [0, 0.01, 0.05], matDarkBody),
    makeVoxelBox('Schema_Tablet_Display', [0.155, 0.006, 0.20], [0, 0.018, 0.05], matEmeraldGlow),
    makeVoxelBox('Schema_Tablet_Edge_Bar', [0.04, 0.008, 0.16], [-0.045, 0.02, 0.05], matSilver),
  );
  schemaTablet.visible = false;
  attachmentRoot.add(schemaTablet);

  // 3. Prop_SQL_Reference_Book
  const sqlBook = new THREE.Group();
  sqlBook.name = 'Prop_SQL_Reference_Book';
  sqlBook.add(
    makeVoxelBox('SQL_Book_Cover_Lower', [0.19, 0.012, 0.22], [0, -0.008, 0.05], matOlive),
    makeVoxelBox('SQL_Book_Pages', [0.178, 0.026, 0.208], [0.004, 0.008, 0.05], matPaper),
    makeVoxelBox('SQL_Book_Cover_Spine', [0.022, 0.038, 0.22], [-0.086, 0.008, 0.05], matEmeraldGlow),
  );
  sqlBook.visible = false;
  attachmentRoot.add(sqlBook);

  // 4. Prop_Schema_Document
  const schemaDoc = new THREE.Group();
  schemaDoc.name = 'Prop_Schema_Document';
  schemaDoc.add(
    makeVoxelBox('Schema_Doc_Folder', [0.18, 0.01, 0.23], [0, 0.005, 0.05], matDarkBody),
    makeVoxelBox('Schema_Doc_Sheet', [0.165, 0.008, 0.21], [0, 0.012, 0.05], matPaper),
    makeVoxelBox('Schema_Doc_Header_Strip', [0.14, 0.006, 0.032], [0, 0.016, 0.12], matEmeraldGlow),
  );
  schemaDoc.visible = false;
  attachmentRoot.add(schemaDoc);

  // 5. Prop_Schema_Clipboard
  const schemaClipboard = new THREE.Group();
  schemaClipboard.name = 'Prop_Schema_Clipboard';
  schemaClipboard.add(
    makeVoxelBox('Schema_Clipboard_Board', [0.175, 0.012, 0.235], [0, 0.006, 0.05], matDarkBody),
    makeVoxelBox('Schema_Clipboard_Paper', [0.155, 0.008, 0.205], [0, 0.014, 0.045], matPaper),
    makeVoxelBox('Schema_Clipboard_Clip', [0.065, 0.014, 0.024], [0, 0.018, 0.145], matSilver),
    makeVoxelBox('Schema_Clipboard_Accent', [0.12, 0.006, 0.024], [0, 0.018, 0.08], matEmeraldGlow),
  );
  schemaClipboard.visible = false;
  attachmentRoot.add(schemaClipboard);

  // 6. Prop_Coffee_Cup
  const coffeeCup = new THREE.Group();
  coffeeCup.name = 'Prop_Coffee_Cup';
  coffeeCup.add(
    makeVoxelBox('DB_Coffee_Mug_Body', [0.072, 0.088, 0.072], [0, 0.02, 0.04], matMug),
    makeVoxelBox('DB_Coffee_Mug_Band', [0.076, 0.024, 0.076], [0, 0.022, 0.04], matEmeraldGlow),
    makeVoxelBox('DB_Coffee_Liquid', [0.058, 0.01, 0.058], [0, 0.062, 0.04], matCoffee),
    makeVoxelBox('DB_Coffee_Handle', [0.018, 0.052, 0.026], [0.044, 0.02, 0.04], matMug),
  );
  coffeeCup.visible = false;
  attachmentRoot.add(coffeeCup);

  // 7. Prop_DB_Model_Card
  const dbModelCard = new THREE.Group();
  dbModelCard.name = 'Prop_DB_Model_Card';
  dbModelCard.add(
    makeVoxelBox('DB_Model_Card_Base', [0.16, 0.014, 0.19], [0, 0.01, 0.05], matDarkBody),
    makeVoxelBox('DB_Model_Tier_1', [0.09, 0.018, 0.09], [0, 0.024, 0.05], matEmeraldGlow),
    makeVoxelBox('DB_Model_Tier_2', [0.09, 0.018, 0.09], [0, 0.046, 0.05], matSilver),
    makeVoxelBox('DB_Model_Tier_3', [0.09, 0.018, 0.09], [0, 0.068, 0.05], matEmeraldGlow),
  );
  dbModelCard.visible = false;
  attachmentRoot.add(dbModelCard);

  return {
    attachmentRoot,
    propsById: {
      db_laptop: dbLaptop,
      schema_tablet: schemaTablet,
      sql_reference_book: sqlBook,
      schema_document: schemaDoc,
      schema_clipboard: schemaClipboard,
      coffee_cup: coffeeCup,
      db_model_card: dbModelCard,
    },
  };
}

/**
 * Builds the complete Database Developer character rig (`Database_Developer_Agent_Root`)
 * and all 21 genuine keyframe `THREE.AnimationClip`s.
 */
export function buildDatabaseDeveloperSceneAndClips(): BuiltDatabaseCharacterRig {
  const root = new THREE.Group();
  root.name = DATABASE_CHARACTER_CONSTANTS.ROOT_NODE_NAME;

  // Materials
  const hairMats: Record<string, THREE.MeshStandardMaterial> = {};
  for (const spec of DATABASE_HAIR_MATERIAL_PALETTE) {
    hairMats[spec.id] = new THREE.MeshStandardMaterial({
      name: spec.id,
      color: spec.hex,
      roughness: spec.roughness,
      metalness: spec.metalness,
    });
  }

  const matSkin = new THREE.MeshStandardMaterial({
    name: 'db_skin_warm_beige',
    color: DATABASE_OUTFIT_PALETTE.skinWarmBeige,
    roughness: 0.78,
    metalness: 0.03,
  });
  const matSkinShade = new THREE.MeshStandardMaterial({
    name: 'db_skin_shade_warm',
    color: DATABASE_OUTFIT_PALETTE.skinShadeWarm,
    roughness: 0.82,
    metalness: 0.03,
  });
  const matCheek = new THREE.MeshStandardMaterial({
    name: 'db_cheek_accent',
    color: DATABASE_OUTFIT_PALETTE.cheekAccent,
    roughness: 0.8,
    metalness: 0.02,
  });
  const matEyeDark = new THREE.MeshStandardMaterial({
    name: 'db_eye_dark',
    color: DATABASE_OUTFIT_PALETTE.eyeDark,
    roughness: 0.45,
    metalness: 0.08,
  });
  const matPupil = new THREE.MeshStandardMaterial({
    name: 'db_pupil_black',
    color: DATABASE_OUTFIT_PALETTE.pupilBlack,
    roughness: 0.35,
    metalness: 0.1,
  });
  const matEyeHighlight = new THREE.MeshStandardMaterial({
    name: 'db_eye_highlight',
    color: DATABASE_OUTFIT_PALETTE.eyeHighlight,
    roughness: 0.25,
    metalness: 0.05,
  });

  const matJacketPrimary = new THREE.MeshStandardMaterial({
    name: 'db_jacket_charcoal_primary',
    color: DATABASE_OUTFIT_PALETTE.jacketCharcoalPrimary,
    roughness: 0.76,
    metalness: 0.08,
  });
  const matJacketPanel = new THREE.MeshStandardMaterial({
    name: 'db_jacket_charcoal_panel',
    color: DATABASE_OUTFIT_PALETTE.jacketCharcoalPanel,
    roughness: 0.72,
    metalness: 0.1,
  });
  const matEmerald = new THREE.MeshStandardMaterial({
    name: 'db_jacket_emerald_accent',
    color: DATABASE_OUTFIT_PALETTE.jacketEmeraldAccent,
    roughness: 0.52,
    metalness: 0.14,
  });
  const matEmeraldDeep = new THREE.MeshStandardMaterial({
    name: 'db_jacket_emerald_deep',
    color: DATABASE_OUTFIT_PALETTE.jacketEmeraldDeep,
    roughness: 0.58,
    metalness: 0.12,
  });
  const matOlive = new THREE.MeshStandardMaterial({
    name: 'db_jacket_olive_accent',
    color: DATABASE_OUTFIT_PALETTE.jacketOliveAccent,
    roughness: 0.68,
    metalness: 0.08,
  });
  const matInnerShirt = new THREE.MeshStandardMaterial({
    name: 'db_inner_shirt_light',
    color: DATABASE_OUTFIT_PALETTE.innerShirtLight,
    roughness: 0.8,
    metalness: 0.03,
  });
  const matTrousers = new THREE.MeshStandardMaterial({
    name: 'db_trousers_dark_navy',
    color: DATABASE_OUTFIT_PALETTE.trousersDarkNavyCharcoal,
    roughness: 0.82,
    metalness: 0.05,
  });
  const matSneakerUpper = new THREE.MeshStandardMaterial({
    name: 'db_sneaker_white_upper',
    color: DATABASE_OUTFIT_PALETTE.sneakerWhiteUpper,
    roughness: 0.68,
    metalness: 0.05,
  });
  const matSneakerTrim = new THREE.MeshStandardMaterial({
    name: 'db_sneaker_gray_trim',
    color: DATABASE_OUTFIT_PALETTE.sneakerLightGrayTrim,
    roughness: 0.75,
    metalness: 0.06,
  });
  const matBackpackBody = new THREE.MeshStandardMaterial({
    name: 'db_backpack_dark_body',
    color: DATABASE_OUTFIT_PALETTE.backpackDarkBody,
    roughness: 0.74,
    metalness: 0.1,
  });

  // Hips (Root Pelvis Pivot at Y = 0.90m)
  const hips = new THREE.Group();
  hips.name = 'Hips';
  hips.position.set(0, 0.9, 0);
  hips.add(
    makeVoxelBox('Pelvis_Block', [0.35, 0.11, 0.21], [0, -0.04, 0], matTrousers),
    makeVoxelBox('Belt_Strap', [0.358, 0.032, 0.218], [0, 0.01, 0], matBackpackBody),
    makeVoxelBox('Belt_Buckle_Emerald', [0.068, 0.034, 0.018], [0, 0.01, 0.106], matEmerald),
  );
  root.add(hips);

  // Torso (Attached to Hips at [0, 0, 0], extends up to Y = +0.37m)
  const torso = new THREE.Group();
  torso.name = 'Torso';
  torso.position.set(0, 0, 0);
  torso.add(
    // Main dark charcoal technical jacket core
    makeVoxelBox('Jacket_Torso_Core', [0.37, 0.37, 0.21], [0, 0.185, 0], matJacketPrimary),
    // Light inner crew shirt visible at center chest V-panel
    makeVoxelBox('Inner_Shirt_Chest_Panel', [0.11, 0.26, 0.018], [0, 0.225, 0.101], matInnerShirt),
    makeVoxelBox('Inner_Shirt_Collar_Rim', [0.135, 0.032, 0.024], [0, 0.352, 0.098], matInnerShirt),
    // Distinct layered technical jacket left & right front panels (differentiating from Backend)
    makeVoxelBox('Jacket_Front_Panel_Left', [0.122, 0.355, 0.022], [-0.118, 0.185, 0.103], matJacketPanel),
    makeVoxelBox('Jacket_Front_Panel_Right', [0.122, 0.355, 0.022], [0.118, 0.185, 0.103], matJacketPanel),
    // Emerald-green technical zip trim & chest data badge
    makeVoxelBox('Jacket_Zip_Trim_Left', [0.016, 0.34, 0.026], [-0.056, 0.185, 0.106], matEmerald),
    makeVoxelBox('Jacket_Zip_Trim_Right', [0.016, 0.34, 0.026], [0.056, 0.185, 0.106], matEmeraldDeep),
    makeVoxelBox('Jacket_DB_Chest_Badge', [0.068, 0.024, 0.012], [-0.115, 0.295, 0.116], matEmerald),
    makeVoxelBox('Jacket_DB_Chest_SubBadge', [0.048, 0.012, 0.012], [-0.125, 0.272, 0.116], matOlive),
    // Olive-green structured utility pockets & collar stand
    makeVoxelBox('Jacket_Pocket_Left_Olive', [0.092, 0.068, 0.016], [-0.118, 0.105, 0.115], matOlive),
    makeVoxelBox('Jacket_Pocket_Right_Olive', [0.092, 0.068, 0.016], [0.118, 0.105, 0.115], matOlive),
    makeVoxelBox('Jacket_Collar_Left', [0.072, 0.042, 0.185], [-0.118, 0.372, -0.005], matJacketPanel),
    makeVoxelBox('Jacket_Collar_Right', [0.072, 0.042, 0.185], [0.118, 0.372, -0.005], matJacketPanel),
    makeVoxelBox('Jacket_Collar_Back', [0.26, 0.044, 0.042], [0, 0.372, -0.088], matJacketPanel),
    makeVoxelBox('Jacket_Collar_Emerald_Piping', [0.24, 0.014, 0.014], [0, 0.388, -0.106], matEmerald),
    makeVoxelBox('Jacket_Hem_Trim', [0.376, 0.028, 0.216], [0, 0.016, 0], matJacketPanel),
  );
  hips.add(torso);

  // Compact Dark Technical Backpack with Emerald & Olive Accents
  const backpackGroup = new THREE.Group();
  backpackGroup.name = 'Backpack';
  backpackGroup.add(
    // Main compact body (width 0.29m < torso 0.37m)
    makeVoxelBox('Backpack_Main_Shell', [0.29, 0.30, 0.115], [0, 0.205, -0.162], matBackpackBody),
    makeVoxelBox('Backpack_Upper_Bevel', [0.265, 0.034, 0.095], [0, 0.362, -0.155], matJacketPanel),
    // Emerald & Olive green panels + 3-tier voxel DB emblem on rear
    makeVoxelBox('Backpack_Emerald_Top_Strip', [0.235, 0.026, 0.016], [0, 0.312, -0.222], matEmerald),
    makeVoxelBox('Backpack_Olive_Lower_Pocket', [0.235, 0.11, 0.028], [0, 0.135, -0.225], matOlive),
    makeVoxelBox('Backpack_DB_Emblem_Tier1', [0.068, 0.018, 0.016], [0, 0.262, -0.224], matEmerald),
    makeVoxelBox('Backpack_DB_Emblem_Tier2', [0.068, 0.018, 0.016], [0, 0.238, -0.224], matEmeraldDeep),
    makeVoxelBox('Backpack_DB_Emblem_Tier3', [0.068, 0.018, 0.016], [0, 0.214, -0.224], matEmerald),
    // Shoulder straps wrapping cleanly over shoulders and down chest sides
    makeVoxelBox('Backpack_Strap_Top_Left', [0.044, 0.028, 0.225], [-0.132, 0.374, -0.01], matBackpackBody),
    makeVoxelBox('Backpack_Strap_Top_Right', [0.044, 0.028, 0.225], [0.132, 0.374, -0.01], matBackpackBody),
    makeVoxelBox('Backpack_Strap_Front_Left', [0.038, 0.23, 0.018], [-0.132, 0.255, 0.112], matBackpackBody),
    makeVoxelBox('Backpack_Strap_Front_Right', [0.038, 0.23, 0.018], [0.132, 0.255, 0.112], matBackpackBody),
    makeVoxelBox('Backpack_Strap_Tab_Left', [0.042, 0.026, 0.022], [-0.132, 0.275, 0.115], matEmerald),
    makeVoxelBox('Backpack_Strap_Tab_Right', [0.042, 0.026, 0.022], [0.132, 0.275, 0.115], matEmerald),
  );
  torso.add(backpackGroup);

  // Head (Attached to Torso at Y = 0.37m)
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.37, 0);
  head.add(
    makeVoxelBox('Neck_Column', [0.14, 0.065, 0.13], [0, 0.025, -0.005], matSkinShade),
    makeVoxelBox('Head_Cube_Core', [0.34, 0.33, 0.31], [0, 0.205, 0], matSkin),
    makeVoxelBox('Ear_Left', [0.036, 0.078, 0.058], [-0.182, 0.198, -0.006], matSkin),
    makeVoxelBox('Ear_Left_Inner', [0.014, 0.044, 0.032], [-0.194, 0.198, -0.006], matSkinShade),
    makeVoxelBox('Ear_Right', [0.036, 0.078, 0.058], [0.182, 0.198, -0.006], matSkin),
    makeVoxelBox('Ear_Right_Inner', [0.014, 0.044, 0.032], [0.194, 0.198, -0.006], matSkinShade),
  );
  torso.add(head);

  // 360-Degree Layered Dark Chestnut-Brown Voxel Hair
  const hairGroup = buildDatabaseLayeredHairGroup(hairMats);
  head.add(hairGroup);

  // Expressive Voxel Face (NO default eyeglasses)
  const faceGroup = new THREE.Group();
  faceGroup.name = 'Face';

  const eyeLeft = makeVoxelBox('Eye_Left', [0.054, 0.056, 0.014], [-0.074, 0.214, 0.154], matEyeDark);
  const eyeRight = makeVoxelBox('Eye_Right', [0.054, 0.056, 0.014], [0.074, 0.214, 0.154], matEyeDark);
  const pupilLeft = makeVoxelBox('Pupil_Left', [0.028, 0.032, 0.012], [-0.074, 0.214, 0.160], matPupil);
  const pupilRight = makeVoxelBox('Pupil_Right', [0.028, 0.032, 0.012], [0.074, 0.214, 0.160], matPupil);
  const highlightLeft = makeVoxelBox(
    'Eye_Highlight_Left',
    [0.014, 0.014, 0.01],
    [-0.064, 0.228, 0.164],
    matEyeHighlight,
  );
  const highlightRight = makeVoxelBox(
    'Eye_Highlight_Right',
    [0.014, 0.014, 0.01],
    [0.084, 0.228, 0.164],
    matEyeHighlight,
  );
  const browLeft = makeVoxelBox(
    'Eyebrow_Left',
    [0.068, 0.018, 0.016],
    [-0.074, 0.266, 0.158],
    hairMats.db_hair_shadow_espresso,
  );
  const browRight = makeVoxelBox(
    'Eyebrow_Right',
    [0.068, 0.018, 0.016],
    [0.074, 0.266, 0.158],
    hairMats.db_hair_shadow_espresso,
  );
  const nose = makeVoxelBox('Nose', [0.032, 0.036, 0.024], [0, 0.176, 0.162], matSkinShade);
  const cheekLeft = makeVoxelBox('Cheek_Left', [0.042, 0.022, 0.01], [-0.112, 0.166, 0.154], matCheek);
  const cheekRight = makeVoxelBox('Cheek_Right', [0.042, 0.022, 0.01], [0.112, 0.166, 0.154], matCheek);
  const mouth = makeVoxelBox('Mouth', [0.068, 0.018, 0.014], [0, 0.118, 0.156], hairMats.db_hair_shadow_espresso);

  faceGroup.add(
    eyeLeft,
    eyeRight,
    pupilLeft,
    pupilRight,
    highlightLeft,
    highlightRight,
    browLeft,
    browRight,
    nose,
    cheekLeft,
    cheekRight,
    mouth,
  );
  head.add(faceGroup);

  // Left Arm (with Database 3-tier sleeve patch)
  const armLeft = new THREE.Group();
  armLeft.name = 'Arm_Left';
  armLeft.position.set(-0.24, 0.33, 0);
  armLeft.add(
    makeVoxelBox('Sleeve_Upper_Left', [0.11, 0.23, 0.115], [0, -0.10, 0], matJacketPrimary),
    makeVoxelBox('Jacket_DB_Sleeve_Patch_T1', [0.014, 0.016, 0.048], [-0.056, -0.07, 0], matEmerald),
    makeVoxelBox('Jacket_DB_Sleeve_Patch_T2', [0.014, 0.016, 0.048], [-0.056, -0.092, 0], matOlive),
    makeVoxelBox('Jacket_DB_Sleeve_Patch_T3', [0.014, 0.016, 0.048], [-0.056, -0.114, 0], matEmerald),
    makeVoxelBox('Sleeve_Cuff_Left', [0.114, 0.036, 0.118], [0, -0.22, 0], matJacketPanel),
    makeVoxelBox('Sleeve_Cuff_Left_Ring', [0.116, 0.012, 0.12], [0, -0.202, 0], matEmerald),
  );
  const handLeft = new THREE.Group();
  handLeft.name = 'Hand_Left';
  handLeft.position.set(0, -0.27, 0);
  handLeft.add(makeVoxelBox('Hand_Left_Mesh', [0.092, 0.088, 0.095], [0, 0, 0], matSkin));
  armLeft.add(handLeft);
  torso.add(armLeft);

  // Right Arm (with Props_Attachment)
  const armRight = new THREE.Group();
  armRight.name = 'Arm_Right';
  armRight.position.set(0.24, 0.33, 0);
  armRight.add(
    makeVoxelBox('Sleeve_Upper_Right', [0.11, 0.23, 0.115], [0, -0.10, 0], matJacketPrimary),
    makeVoxelBox('Sleeve_Cuff_Right', [0.114, 0.036, 0.118], [0, -0.22, 0], matJacketPanel),
    makeVoxelBox('Sleeve_Cuff_Right_Ring', [0.116, 0.012, 0.12], [0, -0.202, 0], matEmerald),
  );
  const handRight = new THREE.Group();
  handRight.name = 'Hand_Right';
  handRight.position.set(0, -0.27, 0);
  handRight.add(makeVoxelBox('Hand_Right_Mesh', [0.092, 0.088, 0.095], [0, 0, 0], matSkin));

  const { attachmentRoot, propsById } = buildDatabasePropsAttachment();
  handRight.add(attachmentRoot);
  armRight.add(handRight);
  torso.add(armRight);

  // Left Leg & White/Gray Sneaker with Emerald Tab (Grounded at Y = 0.000)
  const legLeft = new THREE.Group();
  legLeft.name = 'Leg_Left';
  legLeft.position.set(-0.095, 0, 0);
  legLeft.add(
    makeVoxelBox('Trouser_Leg_Left', [0.145, 0.76, 0.155], [0, -0.41, 0], matTrousers),
    makeVoxelBox('Trouser_Cuff_Left', [0.15, 0.04, 0.16], [0, -0.78, 0], matJacketPanel),
  );
  const footLeft = new THREE.Group();
  footLeft.name = 'Foot_Left';
  footLeft.position.set(0, -0.84, 0.02);
  footLeft.add(
    makeVoxelBox('Sneaker_Upper_Left', [0.148, 0.08, 0.21], [0, 0.0, 0.01], matSneakerUpper),
    makeVoxelBox('Sneaker_Sole_Left', [0.154, 0.036, 0.22], [0, -0.042, 0.01], matSneakerTrim),
    makeVoxelBox('Sneaker_Emerald_Tab_Left', [0.068, 0.022, 0.024], [0, 0.036, 0.098], matEmerald),
  );
  legLeft.add(footLeft);
  hips.add(legLeft);

  // Right Leg & White/Gray Sneaker with Emerald Tab (Grounded at Y = 0.000)
  const legRight = new THREE.Group();
  legRight.name = 'Leg_Right';
  legRight.position.set(0.095, 0, 0);
  legRight.add(
    makeVoxelBox('Trouser_Leg_Right', [0.145, 0.76, 0.155], [0, -0.41, 0], matTrousers),
    makeVoxelBox('Trouser_Cuff_Right', [0.15, 0.04, 0.16], [0, -0.78, 0], matJacketPanel),
  );
  const footRight = new THREE.Group();
  footRight.name = 'Foot_Right';
  footRight.position.set(0, -0.84, 0.02);
  footRight.add(
    makeVoxelBox('Sneaker_Upper_Right', [0.148, 0.08, 0.21], [0, 0.0, 0.01], matSneakerUpper),
    makeVoxelBox('Sneaker_Sole_Right', [0.154, 0.036, 0.22], [0, -0.042, 0.01], matSneakerTrim),
    makeVoxelBox('Sneaker_Emerald_Tab_Right', [0.068, 0.022, 0.024], [0, 0.036, 0.098], matEmerald),
  );
  legRight.add(footRight);
  hips.add(legRight);

  const clips = buildDatabaseAnimationClips();

  return {
    root,
    hips,
    torso,
    head,
    hairGroup,
    faceGroup,
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

function posTrack(
  nodeName: string,
  times: number[],
  coords: [number, number, number][],
): THREE.VectorKeyframeTrack {
  const flat: number[] = [];
  for (const c of coords) {
    flat.push(c[0], c[1], c[2]);
  }
  return new THREE.VectorKeyframeTrack(`${nodeName}.position`, times, flat);
}

function quatTrack(
  nodeName: string,
  times: number[],
  eulerXYZList: [number, number, number][],
): THREE.QuaternionKeyframeTrack {
  const flat: number[] = [];
  const e = new THREE.Euler();
  const q = new THREE.Quaternion();
  for (const [rx, ry, rz] of eulerXYZList) {
    e.set(rx, ry, rz, 'XYZ');
    q.setFromEuler(e);
    flat.push(q.x, q.y, q.z, q.w);
  }
  return new THREE.QuaternionKeyframeTrack(`${nodeName}.quaternion`, times, flat);
}

/**
 * Generates all 21 genuine keyframe `THREE.AnimationClip`s for `database_developer_agent.glb`.
 */
export function buildDatabaseAnimationClips(): THREE.AnimationClip[] {
  const clips: THREE.AnimationClip[] = [];
  const hipStandY = 0.9;
  const hipSeatY = 0.9 + DATABASE_CHARACTER_CONSTANTS.SEATED_HIP_DROP_Y; // 0.725

  // 1. Idle_Breathing (2.8s)
  clips.push(
    new THREE.AnimationClip('Idle_Breathing', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.012, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.4, 2.8], [
        [0, 0, 0],
        [0.018, 0.015, 0],
        [0, 0, 0],
      ]),
      quatTrack('Head', [0, 0.9, 1.9, 2.8], [
        [0, 0, 0],
        [-0.025, 0.05, 0.01],
        [0.018, -0.04, -0.01],
        [0, 0, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.4, 2.8], [
        [0.03, 0, 0.04],
        [-0.02, 0, 0.06],
        [0.03, 0, 0.04],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-0.03, 0, -0.04],
        [0.02, 0, -0.06],
        [-0.03, 0, -0.04],
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

  // 2. Walk_Cycle (1.0s)
  clips.push(
    new THREE.AnimationClip('Walk_Cycle', 1.0, [
      posTrack('Hips', [0, 0.25, 0.5, 0.75, 1.0], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.026, 0],
        [0, hipStandY, 0],
        [0, hipStandY + 0.026, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 0.25, 0.5, 0.75, 1.0], [
        [0.04, -0.06, 0],
        [0.05, 0, 0.015],
        [0.04, 0.06, 0],
        [0.05, 0, -0.015],
        [0.04, -0.06, 0],
      ]),
      quatTrack('Head', [0, 0.5, 1.0], [
        [0, 0.03, 0],
        [0, -0.03, 0],
        [0, 0.03, 0],
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
        [-0.46, 0, 0],
        [0, 0, 0],
        [0.46, 0, 0],
        [0, 0, 0],
        [-0.46, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 0.25, 0.5, 0.75, 1.0], [
        [0.46, 0, 0],
        [0, 0, 0],
        [-0.46, 0, 0],
        [0, 0, 0],
        [0.46, 0, 0],
      ]),
    ]),
  );

  // 3. Sit_Down (1.1s)
  clips.push(
    new THREE.AnimationClip('Sit_Down', 1.1, [
      posTrack('Hips', [0, 0.55, 1.1], [
        [0, hipStandY, 0],
        [0, hipStandY - 0.1, -0.02],
        [0, hipSeatY, 0],
      ]),
      quatTrack('Torso', [0, 0.55, 1.1], [
        [0, 0, 0],
        [0.14, 0, 0],
        [0.05, 0, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.1], [
        [0.04, 0, 0.04],
        [-0.95, 0.12, 0.06],
      ]),
      quatTrack('Arm_Right', [0, 1.1], [
        [-0.04, 0, -0.04],
        [-0.95, -0.12, -0.06],
      ]),
      quatTrack('Leg_Left', [0, 1.1], [
        [0, 0, 0],
        [-0.55, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 1.1], [
        [0, 0, 0],
        [-0.55, 0, 0],
      ]),
    ]),
  );

  // 4. Stand_Up (1.1s)
  clips.push(
    new THREE.AnimationClip('Stand_Up', 1.1, [
      posTrack('Hips', [0, 0.55, 1.1], [
        [0, hipSeatY, 0],
        [0, hipStandY - 0.08, 0.02],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 0.55, 1.1], [
        [0.05, 0, 0],
        [0.14, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.1], [
        [-0.95, 0.12, 0.06],
        [0.04, 0, 0.04],
      ]),
      quatTrack('Arm_Right', [0, 1.1], [
        [-0.95, -0.12, -0.06],
        [-0.04, 0, -0.04],
      ]),
      quatTrack('Leg_Left', [0, 1.1], [
        [-0.55, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 1.1], [
        [-0.55, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 5. Work_Typing (1.6s, seated)
  clips.push(
    new THREE.AnimationClip('Work_Typing', 1.6, [
      posTrack('Hips', [0, 0.8, 1.6], [
        [0, hipSeatY, 0],
        [0, hipSeatY + 0.006, 0],
        [0, hipSeatY, 0],
      ]),
      quatTrack('Torso', [0, 0.8, 1.6], [
        [0.06, 0, 0],
        [0.08, 0.015, 0],
        [0.06, 0, 0],
      ]),
      quatTrack('Head', [0, 0.5, 1.1, 1.6], [
        [0.04, -0.04, 0],
        [0.05, 0.04, 0],
        [0.03, -0.02, 0],
        [0.04, -0.04, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6], [
        [-1.08, 0.16, 0.05],
        [-1.18, 0.18, 0.05],
        [-1.06, 0.14, 0.05],
        [-1.16, 0.16, 0.05],
        [-1.08, 0.16, 0.05],
        [-1.18, 0.18, 0.05],
        [-1.06, 0.14, 0.05],
        [-1.16, 0.16, 0.05],
        [-1.08, 0.16, 0.05],
      ]),
      quatTrack('Arm_Right', [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6], [
        [-1.16, -0.16, -0.05],
        [-1.06, -0.14, -0.05],
        [-1.18, -0.18, -0.05],
        [-1.08, -0.16, -0.05],
        [-1.16, -0.16, -0.05],
        [-1.06, -0.14, -0.05],
        [-1.18, -0.18, -0.05],
        [-1.08, -0.16, -0.05],
        [-1.16, -0.16, -0.05],
      ]),
      quatTrack('Leg_Left', [0, 1.6], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 1.6], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
    ]),
  );

  // 6. Schema_Design (2.6s, seated — alternates typing & pausing to compare dual ERD displays)
  clips.push(
    new THREE.AnimationClip('Schema_Design', 2.6, [
      posTrack('Hips', [0, 1.3, 2.6], [
        [0, hipSeatY, 0],
        [0, hipSeatY + 0.008, 0],
        [0, hipSeatY, 0],
      ]),
      quatTrack('Torso', [0, 0.9, 1.8, 2.6], [
        [0.06, -0.03, 0],
        [0.04, 0.08, 0],
        [0.08, -0.06, 0],
        [0.06, -0.03, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.5, 2.1, 2.6], [
        [0.02, -0.08, 0],
        [-0.04, 0.22, 0.02],
        [-0.02, -0.14, -0.02],
        [0.05, 0.06, 0],
        [0.02, -0.08, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.4, 0.9, 1.5, 2.1, 2.6], [
        [-1.10, 0.16, 0.05],
        [-1.20, 0.18, 0.05],
        [-0.95, 0.10, 0.06],
        [-1.14, 0.16, 0.05],
        [-1.22, 0.18, 0.05],
        [-1.10, 0.16, 0.05],
      ]),
      quatTrack('Arm_Right', [0, 0.4, 0.9, 1.5, 2.1, 2.6], [
        [-1.15, -0.16, -0.05],
        [-1.05, -0.14, -0.05],
        [-1.38, -0.26, -0.08],
        [-1.25, -0.20, -0.06],
        [-1.08, -0.15, -0.05],
        [-1.15, -0.16, -0.05],
      ]),
      quatTrack('Leg_Left', [0, 2.6], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.6], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
    ]),
  );

  // 7. ERD_Analysis (3.0s, standing with schema_tablet at DB_SCHEMA_REVIEW)
  clips.push(
    new THREE.AnimationClip('ERD_Analysis', 3.0, [
      posTrack('Hips', [0, 1.5, 3.0], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.012, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.0, 2.0, 3.0], [
        [0.03, -0.04, 0],
        [0.01, 0.06, 0],
        [0.04, -0.05, 0],
        [0.03, -0.04, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.6, 2.4, 3.0], [
        [0.14, 0.05, 0],
        [-0.12, -0.10, 0.02],
        [-0.10, 0.12, -0.02],
        [0.16, 0.02, 0],
        [0.14, 0.05, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.9, 1.8, 3.0], [
        [-0.45, 0.14, 0.08],
        [-1.38, 0.18, 0.12],
        [-1.22, -0.08, 0.10],
        [-0.45, 0.14, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.5, 3.0], [
        [-1.12, -0.22, -0.08],
        [-1.18, -0.25, -0.08],
        [-1.12, -0.22, -0.08],
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

  // 8. SQL_Query_Development (2.2s, seated)
  clips.push(
    new THREE.AnimationClip('SQL_Query_Development', 2.2, [
      posTrack('Hips', [0, 1.1, 2.2], [
        [0, hipSeatY, 0],
        [0, hipSeatY + 0.007, 0],
        [0, hipSeatY, 0],
      ]),
      quatTrack('Torso', [0, 1.1, 2.2], [
        [0.07, 0, 0],
        [0.09, -0.03, 0],
        [0.07, 0, 0],
      ]),
      quatTrack('Head', [0, 0.7, 1.5, 2.2], [
        [0.05, -0.06, 0],
        [-0.02, -0.10, 0],
        [0.04, 0.14, 0.01],
        [0.05, -0.06, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.3, 0.6, 0.9, 1.3, 1.7, 2.2], [
        [-1.12, 0.16, 0.05],
        [-1.24, 0.18, 0.05],
        [-1.10, 0.15, 0.05],
        [-1.22, 0.18, 0.05],
        [-1.02, 0.12, 0.05],
        [-1.20, 0.17, 0.05],
        [-1.12, 0.16, 0.05],
      ]),
      quatTrack('Arm_Right', [0, 0.3, 0.6, 0.9, 1.3, 1.7, 2.2], [
        [-1.22, -0.18, -0.05],
        [-1.10, -0.15, -0.05],
        [-1.24, -0.18, -0.05],
        [-1.12, -0.16, -0.05],
        [-1.04, -0.14, -0.05],
        [-1.20, -0.17, -0.05],
        [-1.22, -0.18, -0.05],
      ]),
      quatTrack('Leg_Left', [0, 2.2], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.2], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
    ]),
  );

  // 9. Query_Optimization (2.8s, seated — leans toward secondary query plan monitor, thinks, points)
  clips.push(
    new THREE.AnimationClip('Query_Optimization', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, hipSeatY, 0],
        [0, hipSeatY + 0.008, 0.015],
        [0, hipSeatY, 0],
      ]),
      quatTrack('Torso', [0, 0.8, 1.7, 2.8], [
        [0.06, 0, 0],
        [0.14, 0.16, 0.02],
        [0.12, 0.14, 0.01],
        [0.06, 0, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.7, 2.8], [
        [0.02, 0.08, 0],
        [-0.04, 0.24, 0.04],
        [-0.06, 0.20, -0.03],
        [0.02, 0.08, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.8, 1.7, 2.8], [
        [-1.05, 0.14, 0.05],
        [-0.95, 0.12, 0.05],
        [-1.15, 0.16, 0.05],
        [-1.05, 0.14, 0.05],
      ]),
      quatTrack('Arm_Right', [0, 0.8, 1.6, 2.2, 2.8], [
        [-1.10, -0.16, -0.05],
        [-1.62, -0.28, -0.12],
        [-1.44, 0.12, -0.10],
        [-1.18, -0.18, -0.05],
        [-1.10, -0.16, -0.05],
      ]),
      quatTrack('Leg_Left', [0, 2.8], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.8], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
    ]),
  );

  // 10. Data_Integrity_Check (2.6s, seated)
  clips.push(
    new THREE.AnimationClip('Data_Integrity_Check', 2.6, [
      posTrack('Hips', [0, 1.3, 2.6], [
        [0, hipSeatY, 0],
        [0, hipSeatY + 0.006, 0],
        [0, hipSeatY, 0],
      ]),
      quatTrack('Torso', [0, 1.3, 2.6], [
        [0.07, -0.02, 0],
        [0.09, 0.04, 0],
        [0.07, -0.02, 0],
      ]),
      quatTrack('Head', [0, 0.7, 1.4, 2.0, 2.6], [
        [0.03, -0.10, 0],
        [0.08, -0.08, 0],
        [0.02, 0.12, 0],
        [0.07, 0.10, 0],
        [0.03, -0.10, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.9, 1.8, 2.6], [
        [-1.10, 0.15, 0.05],
        [-1.32, 0.08, 0.06],
        [-1.16, 0.16, 0.05],
        [-1.10, 0.15, 0.05],
      ]),
      quatTrack('Arm_Right', [0, 0.9, 1.8, 2.6], [
        [-1.12, -0.15, -0.05],
        [-1.18, -0.18, -0.05],
        [-1.36, -0.06, -0.06],
        [-1.12, -0.15, -0.05],
      ]),
      quatTrack('Leg_Left', [0, 2.6], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.6], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
    ]),
  );

  // 11. Migration_Review (2.8s, standing with schema_clipboard)
  clips.push(
    new THREE.AnimationClip('Migration_Review', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.01, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.4, 2.8], [
        [0.04, -0.03, 0],
        [0.02, 0.04, 0],
        [0.04, -0.03, 0],
      ]),
      quatTrack('Head', [0, 0.9, 1.8, 2.8], [
        [0.18, 0.06, 0],
        [0.22, -0.04, 0.02],
        [-0.04, 0.02, 0],
        [0.18, 0.06, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.0, 2.0, 2.8], [
        [-0.72, 0.22, 0.08],
        [-1.08, 0.32, 0.12],
        [-0.86, 0.26, 0.10],
        [-0.72, 0.22, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-1.14, -0.24, -0.08],
        [-1.18, -0.26, -0.08],
        [-1.14, -0.24, -0.08],
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

  // 12. Database_Maintenance_Demo (3.0s, standing with schema_tablet)
  clips.push(
    new THREE.AnimationClip('Database_Maintenance_Demo', 3.0, [
      posTrack('Hips', [0, 1.5, 3.0], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.012, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.0, 2.0, 3.0], [
        [0.02, 0.05, 0],
        [0.04, -0.06, 0],
        [0.01, 0.03, 0],
        [0.02, 0.05, 0],
      ]),
      quatTrack('Head', [0, 1.0, 2.0, 3.0], [
        [0.12, 0.08, 0],
        [-0.08, -0.10, 0],
        [0.06, 0.04, 0],
        [0.12, 0.08, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.0, 2.0, 3.0], [
        [-0.88, 0.24, 0.08],
        [-1.34, 0.12, 0.10],
        [-1.02, 0.28, 0.08],
        [-0.88, 0.24, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.5, 3.0], [
        [-1.12, -0.22, -0.08],
        [-1.16, -0.24, -0.08],
        [-1.12, -0.22, -0.08],
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

  // 13. Troubleshoot_Database (2.8s, seated — notices issue, leans in, analyzes, resumes)
  clips.push(
    new THREE.AnimationClip('Troubleshoot_Database', 2.8, [
      posTrack('Hips', [0, 0.7, 1.8, 2.8], [
        [0, hipSeatY, 0],
        [0, hipSeatY + 0.012, 0.02],
        [0, hipSeatY + 0.008, 0.01],
        [0, hipSeatY, 0],
      ]),
      quatTrack('Torso', [0, 0.6, 1.6, 2.8], [
        [0.06, 0, 0],
        [0.16, -0.06, 0],
        [0.14, 0.08, 0],
        [0.06, 0, 0],
      ]),
      quatTrack('Head', [0, 0.5, 1.2, 2.0, 2.8], [
        [0.02, -0.04, 0],
        [-0.06, -0.14, -0.04],
        [-0.04, 0.16, 0.04],
        [0.05, -0.06, 0],
        [0.02, -0.04, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.6, 1.5, 2.2, 2.8], [
        [-1.08, 0.16, 0.05],
        [-1.48, 0.28, 0.08],
        [-1.42, 0.24, 0.08],
        [-1.18, 0.18, 0.05],
        [-1.08, 0.16, 0.05],
      ]),
      quatTrack('Arm_Right', [0, 0.6, 1.5, 2.2, 2.8], [
        [-1.12, -0.16, -0.05],
        [-1.02, -0.12, -0.05],
        [-1.24, -0.18, -0.05],
        [-1.16, -0.16, -0.05],
        [-1.12, -0.16, -0.05],
      ]),
      quatTrack('Leg_Left', [0, 2.8], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.8], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
    ]),
  );

  // 14. Review_Backend_Dependency (2.8s, standing with schema_document)
  clips.push(
    new THREE.AnimationClip('Review_Backend_Dependency', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.01, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.4, 2.8], [
        [0.03, -0.04, 0],
        [0.01, 0.05, 0],
        [0.03, -0.04, 0],
      ]),
      quatTrack('Head', [0, 0.9, 1.9, 2.8], [
        [0.14, 0.06, 0],
        [-0.10, -0.08, 0],
        [0.12, 0.04, 0],
        [0.14, 0.06, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.9, 1.9, 2.8], [
        [-0.65, 0.18, 0.08],
        [-1.36, 0.14, 0.10],
        [-0.95, 0.24, 0.08],
        [-0.65, 0.18, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-1.12, -0.22, -0.08],
        [-1.18, -0.24, -0.08],
        [-1.12, -0.22, -0.08],
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

  // 15. Present_Data_Model (3.0s, standing at ENG_ARCHITECTURE_BOARD with db_model_card)
  clips.push(
    new THREE.AnimationClip('Present_Data_Model', 3.0, [
      posTrack('Hips', [0, 1.5, 3.0], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.012, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.0, 2.0, 3.0], [
        [0, -0.10, 0],
        [0.02, 0.12, 0],
        [-0.01, -0.06, 0],
        [0, -0.10, 0],
      ]),
      quatTrack('Head', [0, 1.0, 2.0, 3.0], [
        [-0.06, -0.12, 0],
        [-0.08, 0.14, 0.02],
        [0.02, -0.05, 0],
        [-0.06, -0.12, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.9, 1.9, 3.0], [
        [-0.85, 0.18, 0.12],
        [-1.58, 0.24, 0.18],
        [-1.24, -0.12, 0.14],
        [-0.85, 0.18, 0.12],
      ]),
      quatTrack('Arm_Right', [0, 1.5, 3.0], [
        [-1.08, -0.20, -0.08],
        [-1.16, -0.24, -0.08],
        [-1.08, -0.20, -0.08],
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

  // 16. Read_Documentation (3.0s, standing with sql_reference_book)
  clips.push(
    new THREE.AnimationClip('Read_Documentation', 3.0, [
      posTrack('Hips', [0, 1.5, 3.0], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.01, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.5, 3.0], [
        [0.06, 0, 0],
        [0.08, 0.02, 0],
        [0.06, 0, 0],
      ]),
      quatTrack('Head', [0, 1.0, 2.0, 3.0], [
        [0.20, -0.06, 0],
        [0.22, 0.06, 0],
        [0.18, -0.02, 0],
        [0.20, -0.06, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.2, 2.2, 3.0], [
        [-1.04, 0.26, 0.08],
        [-1.14, 0.34, 0.10],
        [-1.02, 0.24, 0.08],
        [-1.04, 0.26, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.5, 3.0], [
        [-1.12, -0.24, -0.08],
        [-1.15, -0.26, -0.08],
        [-1.12, -0.24, -0.08],
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

  // 17. Think_Plan (2.8s, standing hand-to-chin analytical pose)
  clips.push(
    new THREE.AnimationClip('Think_Plan', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.01, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.4, 2.8], [
        [0.02, -0.04, 0],
        [0.04, 0.04, 0],
        [0.02, -0.04, 0],
      ]),
      quatTrack('Head', [0, 0.9, 1.9, 2.8], [
        [-0.05, 0.08, 0.05],
        [-0.08, -0.06, -0.04],
        [-0.04, 0.06, 0.04],
        [-0.05, 0.08, 0.05],
      ]),
      quatTrack('Arm_Left', [0, 1.4, 2.8], [
        [-0.55, 0.38, 0.12],
        [-0.58, 0.40, 0.12],
        [-0.55, 0.38, 0.12],
      ]),
      quatTrack('Arm_Right', [0, 0.8, 2.0, 2.8], [
        [-1.48, 0.28, -0.10],
        [-1.56, 0.32, -0.12],
        [-1.52, 0.30, -0.10],
        [-1.48, 0.28, -0.10],
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

  // 18. Technical_Discussion (2.8s, standing with schema_clipboard)
  clips.push(
    new THREE.AnimationClip('Technical_Discussion', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.012, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 0.9, 1.9, 2.8], [
        [0.02, -0.06, 0],
        [0.04, 0.07, 0],
        [0.01, -0.04, 0],
        [0.02, -0.06, 0],
      ]),
      quatTrack('Head', [0, 0.7, 1.4, 2.1, 2.8], [
        [0, -0.08, 0],
        [0.05, 0.08, 0.02],
        [-0.04, -0.05, -0.02],
        [0.04, 0.06, 0],
        [0, -0.08, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.7, 1.4, 2.1, 2.8], [
        [-0.78, 0.12, 0.08],
        [-1.12, -0.10, 0.14],
        [-0.88, 0.16, 0.10],
        [-1.06, -0.06, 0.12],
        [-0.78, 0.12, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-1.10, -0.22, -0.08],
        [-1.16, -0.24, -0.08],
        [-1.10, -0.22, -0.08],
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

  // 19. Coffee_Break (3.2s, standing with coffee_cup)
  clips.push(
    new THREE.AnimationClip('Coffee_Break', 3.2, [
      posTrack('Hips', [0, 1.6, 3.2], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.01, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.4, 2.2, 3.2], [
        [0, 0, 0],
        [-0.03, 0.02, 0],
        [-0.02, 0.01, 0],
        [0, 0, 0],
      ]),
      quatTrack('Head', [0, 1.1, 1.9, 3.2], [
        [0, 0, 0],
        [-0.14, 0.02, 0],
        [-0.12, 0.02, 0],
        [0, 0, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.6, 3.2], [
        [0.04, 0, 0.05],
        [-0.04, 0, 0.06],
        [0.04, 0, 0.05],
      ]),
      quatTrack('Arm_Right', [0, 1.0, 1.9, 3.2], [
        [-0.88, -0.18, -0.06],
        [-1.56, 0.22, -0.10],
        [-1.52, 0.20, -0.10],
        [-0.88, -0.18, -0.06],
      ]),
      quatTrack('Leg_Left', [0, 3.2], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 3.2], [
        [0, 0, 0],
        [0, 0, 0],
      ]),
    ]),
  );

  // 20. Waiting_Review (2.8s, standing with db_laptop)
  clips.push(
    new THREE.AnimationClip('Waiting_Review', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.008, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.4, 2.8], [
        [0.02, 0.03, 0],
        [0.03, -0.03, 0],
        [0.02, 0.03, 0],
      ]),
      quatTrack('Head', [0, 1.0, 2.0, 2.8], [
        [0.12, -0.05, 0],
        [0.02, 0.08, 0],
        [0.14, 0.02, 0],
        [0.12, -0.05, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.4, 2.8], [
        [-0.96, 0.22, 0.08],
        [-1.04, 0.26, 0.08],
        [-0.96, 0.22, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-1.12, -0.22, -0.08],
        [-1.16, -0.24, -0.08],
        [-1.12, -0.22, -0.08],
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

  // 21. Task_Completed (2.4s, standing positive nod & satisfied gesture)
  clips.push(
    new THREE.AnimationClip('Task_Completed', 2.4, [
      posTrack('Hips', [0, 0.6, 1.2, 2.4], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.024, 0],
        [0, hipStandY + 0.012, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 0.7, 1.5, 2.4], [
        [0, 0, 0],
        [-0.04, 0.05, 0],
        [0.02, -0.02, 0],
        [0, 0, 0],
      ]),
      quatTrack('Head', [0, 0.5, 1.0, 1.6, 2.4], [
        [0, 0, 0],
        [0.14, 0.03, 0],
        [-0.04, 0.03, 0],
        [0.12, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.8, 1.6, 2.4], [
        [0.04, 0, 0.04],
        [-0.52, 0.14, 0.10],
        [-0.36, 0.10, 0.08],
        [0.04, 0, 0.04],
      ]),
      quatTrack('Arm_Right', [0, 0.7, 1.5, 2.4], [
        [-0.04, 0, -0.04],
        [-1.95, -0.14, -0.20],
        [-1.80, -0.10, -0.16],
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
 * Exports a clean standalone `database_developer_agent.glb` binary ArrayBuffer
 * with `Database_Developer_Agent_Root` at `[0, 0, 0]`, rest pose, hidden handheld props,
 * visible backpack, NO eyeglasses, and all 21 embedded `THREE.AnimationClip`s.
 */
export async function exportDatabaseDeveloperToGLBBuffer(): Promise<ArrayBuffer> {
  const built = buildDatabaseDeveloperSceneAndClips();
  built.root.position.set(0, 0, 0);
  built.root.rotation.set(0, 0, 0);
  built.root.scale.set(1, 1, 1);

  for (const propGroup of Object.values(built.propsById)) {
    propGroup.visible = false;
  }
  built.backpackGroup.visible = true;
  built.root.updateMatrixWorld(true);

  const exportScene = new THREE.Scene();
  exportScene.name = 'Database_Developer_Agent_Export_Scene';
  exportScene.add(built.root);

  const exporter = new GLTFExporter();
  const glbBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      exportScene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(
            new Error('Expected binary GLB ArrayBuffer from GLTFExporter for Database Developer.'),
          );
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

export interface DatabaseSimulationHelpersGroup {
  helpersRoot: THREE.Group;
  pathLine: THREE.Line;
  targetRing: THREE.Mesh;
  updatePathVisual: (
    points: [number, number][],
    targetPos: [number, number, number],
    visible: boolean,
  ) => void;
}

export function buildDatabaseSimulationHelpersGroup(): DatabaseSimulationHelpersGroup {
  const helpersRoot = new THREE.Group();
  helpersRoot.name = 'PREVIEW_ONLY_DATABASE_SIM_HELPERS';

  const lineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(4.45, 0.03, 2.15),
    new THREE.Vector3(2.35, 0.03, 2.35),
  ]);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.85,
  });
  const pathLine = new THREE.Line(lineGeom, lineMat);
  pathLine.name = 'Database_Nav_Path_Line';
  pathLine.visible = false;
  helpersRoot.add(pathLine);

  const ringGeom = new THREE.RingGeometry(0.18, 0.25, 24);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75,
  });
  const targetRing = new THREE.Mesh(ringGeom, ringMat);
  targetRing.name = 'Database_Target_Ring';
  targetRing.position.set(4.45, 0.022, 2.15);
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

export interface DatabaseCharacterRuntimeInstance {
  runtimeRoot: THREE.Group;
  characterRoot: THREE.Group;
  rig: BuiltDatabaseCharacterRig;
  mixer: THREE.AnimationMixer;
  triggerAction: (actionId: DatabaseActionId) => void;
  executePlayback: (cmd: DatabaseAnimationPlaybackCommand) => void;
  setSpeedMultiplier: (speed: DatabaseSpeedMultiplier) => void;
  setPatrolActive: (enabled: boolean) => void;
  startAutoDemo: () => void;
  stopAutoDemo: () => void;
  setExpression: (exprId: DatabaseExpressionId) => void;
  setBackpackVisible: (visible: boolean) => void;
  update: (dt: number) => void;
  getStatus: () => DatabaseSimulationRuntimeStatus;
  getActivePathPoints: () => [number, number][];
}

function normalizeAngleDiff(target: number, current: number): number {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

/**
 * Creates the interactive Database Developer runtime controller inside `AI_OFFICE_ROOM_ENGINEERING_v1`.
 * Spawns by default at `DB_WORKSTATION_APPROACH` (`[4.45, 0, 2.15]`) so Frontend Developer (`[5.85, 0, 11.2]`),
 * Backend Developer (`[4.45, 0, 9.25]`), and Database Developer (`[4.45, 0, 2.15]`) coexist simultaneously
 * inside the 8×16 Engineering Studio without overlap.
 */
export function createDatabaseDeveloperRuntime(
  onStatusChange?: (status: DatabaseSimulationRuntimeStatus) => void,
): DatabaseCharacterRuntimeInstance {
  const rig = buildDatabaseDeveloperSceneAndClips();

  const runtimeRoot = new THREE.Group();
  runtimeRoot.name = DATABASE_CHARACTER_CONSTANTS.RUNTIME_ROOT_NAME;
  runtimeRoot.add(rig.root);

  const defaultAnchor = getEngineeringAnchorForDatabaseOrThrow(
    DATABASE_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR,
  );
  runtimeRoot.position.set(
    defaultAnchor.position[0],
    defaultAnchor.position[1],
    defaultAnchor.position[2],
  );
  runtimeRoot.rotation.set(0, defaultAnchor.facingRad, 0);

  const mixer = new THREE.AnimationMixer(rig.root);
  const actionsByName = new Map<DatabaseAnimationClipName, THREE.AnimationAction>();
  for (const clip of rig.clips) {
    const act = mixer.clipAction(clip);
    actionsByName.set(clip.name as DatabaseAnimationClipName, act);
  }

  let currentActionSpec: DatabaseActionSpec = DATABASE_ACTIONS.IDLE;
  let currentState: DatabaseAgentState = 'IDLE';
  let activeClipName: DatabaseAnimationClipName = 'Idle_Breathing';
  let currentAnchorId: string = DATABASE_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR;
  let targetAnchorId: string = DATABASE_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR;
  let currentExpression: DatabaseExpressionId = 'neutral';
  let handheldProp: DatabasePropId = 'none';
  let isWalking = false;
  let isPaused = false;
  let patrolActive = false;
  let patrolRingIdx = 0;
  let patrolHoldTimer = 0;
  let autoDemoActive = false;
  let autoDemoStepIdx = 0;
  let autoDemoHoldTimer = 0;
  let speedMultiplier: DatabaseSpeedMultiplier = 1;
  let userBackpackVisible = true;
  let backpackAutoHiddenForSeat = false;
  let activePath: [number, number][] = [];
  let targetFacingRad = defaultAnchor.facingRad;

  const baseEyeScaleY = 1.0;
  const basePupilLeftPos: [number, number] = [-0.074, 0.214];
  const basePupilRightPos: [number, number] = [0.074, 0.214];
  const baseBrowY = 0.266;
  const baseMouthY = 0.118;

  const applyExpression = (exprId: DatabaseExpressionId) => {
    currentExpression = exprId;
    const preset = DATABASE_EXPRESSION_PRESETS[exprId] ?? DATABASE_EXPRESSION_PRESETS.neutral;
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

  const applyPropVisibility = (prop: DatabasePropId) => {
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

  const playClip = (clipName: DatabaseAnimationClipName, loop = true) => {
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

  const beginActionExecution = (spec: DatabaseActionSpec, fromDemoOrPatrol = false) => {
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

    if (dist > DATABASE_CHARACTER_CONSTANTS.ARRIVAL_THRESHOLD_M) {
      isWalking = true;
      currentState = 'MOVING';
      activePath = findDatabaseWalkablePath(startXZ, goalXZ);
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

  const triggerAction = (actionId: DatabaseActionId) => {
    if (actionId === 'WALK_PATROL') {
      patrolActive = true;
      autoDemoActive = false;
      patrolRingIdx = 0;
      patrolHoldTimer = 0;
      const firstAnchorName = DATABASE_PATROL_ANCHOR_RING[0];
      beginActionExecution(
        {
          ...DATABASE_ACTIONS.WALK_PATROL,
          targetAnchorName: firstAnchorName,
        },
        true,
      );
      return;
    }

    const spec = DATABASE_ACTIONS[actionId] ?? DATABASE_ACTIONS.IDLE;
    beginActionExecution(spec, false);
  };

  const executePlayback = (cmd: DatabaseAnimationPlaybackCommand) => {
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
      const idleAnchor = getEngineeringAnchorForDatabaseOrThrow(
        DATABASE_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR,
      );
      runtimeRoot.position.set(idleAnchor.position[0], 0, idleAnchor.position[2]);
      runtimeRoot.rotation.set(0, idleAnchor.facingRad, 0);
      currentActionSpec = DATABASE_ACTIONS.IDLE;
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

  const setSpeedMultiplier = (speed: DatabaseSpeedMultiplier) => {
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
      beginActionExecution(DATABASE_ACTIONS.IDLE, false);
    }
  };

  const startAutoDemo = () => {
    autoDemoActive = true;
    patrolActive = false;
    isPaused = false;
    mixer.timeScale = speedMultiplier;
    autoDemoStepIdx = 0;
    autoDemoHoldTimer = 0;
    const step = DATABASE_AUTO_DEMO_SEQUENCE[0];
    beginActionExecution(DATABASE_ACTIONS[step.actionId], true);
  };

  const stopAutoDemo = () => {
    autoDemoActive = false;
    autoDemoHoldTimer = 0;
    beginActionExecution(DATABASE_ACTIONS.IDLE, false);
  };

  const setExpression = (exprId: DatabaseExpressionId) => {
    applyExpression(exprId);
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
      const stepDist = DATABASE_CHARACTER_CONSTANTS.WALK_SPEED_MPS * scaledDt;

      if (dist > 0.005) {
        const moveHeading = Math.atan2(dx, dz);
        const angleDiff = normalizeAngleDiff(moveHeading, runtimeRoot.rotation.y);
        runtimeRoot.rotation.y +=
          angleDiff * Math.min(1, DATABASE_CHARACTER_CONSTANTS.ROTATION_LERP_RATE * scaledDt);
      }

      if (dist <= Math.max(DATABASE_CHARACTER_CONSTANTS.ARRIVAL_THRESHOLD_M, stepDist)) {
        runtimeRoot.position.x = nextPt[0];
        runtimeRoot.position.z = nextPt[1];
        activePath.shift();

        if (activePath.length === 0) {
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
      const angleDiff = normalizeAngleDiff(targetFacingRad, runtimeRoot.rotation.y);
      if (Math.abs(angleDiff) > 0.005) {
        runtimeRoot.rotation.y +=
          angleDiff * Math.min(1, DATABASE_CHARACTER_CONSTANTS.ROTATION_LERP_RATE * scaledDt);
      }

      if (patrolActive) {
        patrolHoldTimer += scaledDt;
        if (patrolHoldTimer >= 1.6) {
          patrolHoldTimer = 0;
          patrolRingIdx = (patrolRingIdx + 1) % DATABASE_PATROL_ANCHOR_RING.length;
          const nextAnchor = DATABASE_PATROL_ANCHOR_RING[patrolRingIdx];
          beginActionExecution(
            {
              ...DATABASE_ACTIONS.WALK_PATROL,
              targetAnchorName: nextAnchor,
            },
            true,
          );
        }
      } else if (autoDemoActive) {
        const currentStep = DATABASE_AUTO_DEMO_SEQUENCE[autoDemoStepIdx];
        autoDemoHoldTimer += scaledDt;
        if (currentStep && autoDemoHoldTimer >= currentStep.holdDurationSec) {
          autoDemoHoldTimer = 0;
          autoDemoStepIdx = (autoDemoStepIdx + 1) % DATABASE_AUTO_DEMO_SEQUENCE.length;
          const nextStep = DATABASE_AUTO_DEMO_SEQUENCE[autoDemoStepIdx];
          beginActionExecution(DATABASE_ACTIONS[nextStep.actionId], true);
        }
      }
    }
  };

  const getStatus = (): DatabaseSimulationRuntimeStatus => ({
    characterId: DATABASE_CHARACTER_CONSTANTS.CHARACTER_ID,
    displayName: DATABASE_CHARACTER_CONSTANTS.DISPLAY_NAME,
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
    autoDemoTotalSteps: DATABASE_AUTO_DEMO_SEQUENCE.length,
    speedMultiplier,
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
    setBackpackVisible,
    update,
    getStatus,
    getActivePathPoints,
  };
}
