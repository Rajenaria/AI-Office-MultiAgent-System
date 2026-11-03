/**
 * AI Office — Module 05 Character: Research Professor (`research_professor_agent`)
 * Senior Research & Shared Brain Specialist inside `AI_OFFICE_ROOM_RESEARCH_v1` ("The Knowledge Atelier").
 *
 * Implements:
 * 1. Canonical 1.755m Room-Native voxel character rig (`Research_Professor_Agent_Root`) grounded at Y = 0.000.
 * 2. Signature 360-degree voluminous layered white voxel hairstyle (`Hair` group with 8 semantic sub-groups:
 *    `Hair_Base`, `Hair_Crown`, `Hair_Front_Layers`, `Hair_Left_Side`, `Hair_Right_Side`,
 *    `Hair_Back_Upper`, `Hair_Back_Lower`, `Hair_Temple_Details`) using 5 matte white/pearl/silver/lavender-gray materials.
 * 3. Expressive senior-professor voxel face (`Face`), thick black rectangular glasses (`Glasses` with visibility toggle),
 *    thick white eyebrows, short white moustache (`Moustache`), and compact voxel beard (`Beard`).
 * 4. Cream/off-white academic/laboratory coat (`AcademicCoat`) with lapels, pockets, and green Shared Brain badge;
 *    dark formal inner vest, white shirt, red/burgundy tie (`InnerClothing`); dark charcoal trousers;
 *    brown formal shoes; and dark technical backpack (`Backpack`) with 3D green Shared Brain tree/network icon.
 * 5. 7 contextual handheld props (`Prop_Research_Book`, `Prop_Notebook`, `Prop_Reference_Tablet`,
 *    `Prop_Research_Paper`, `Prop_Research_Clipboard`, `Prop_Coffee_Cup`, `Prop_Reference_Folder`).
 * 6. 20 genuine embedded keyframe `THREE.AnimationClip`s + 10 facial expressions + collision-free navigation.
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import {
  RESEARCH_ACTION_LIST,
  RESEARCH_ACTIONS,
  RESEARCH_AUTO_DEMO_SEQUENCE,
  RESEARCH_CHARACTER_CONSTANTS,
  RESEARCH_EXPRESSION_PRESETS,
  RESEARCH_HAIR_MATERIAL_PALETTE,
  RESEARCH_OUTFIT_PALETTE,
  RESEARCH_PATROL_ANCHOR_RING,
  type ResearchActionId,
  type ResearchActionSpec,
  type ResearchAgentState,
  type ResearchAnimationClipName,
  type ResearchAnimationPlaybackCommand,
  type ResearchExpressionId,
  type ResearchPropId,
  type ResearchSimulationRuntimeStatus,
  type ResearchSpeedMultiplier,
  findResearchWalkablePath,
  getResearchAnchorOrThrow,
} from '../domain/researchSimulationSpec';
import { DEFAULT_RESEARCH_ANCHORS, type ResearchAnchorType } from '../domain/researchRoomSpec';

export interface BuiltResearchProfessorRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  hairGroup: THREE.Group;
  faceGroup: THREE.Group;
  glassesGroup: THREE.Group;
  moustacheGroup: THREE.Group;
  beardGroup: THREE.Group;
  academicCoatGroup: THREE.Group;
  innerClothingGroup: THREE.Group;
  backpackGroup: THREE.Group;
  armLeft: THREE.Group;
  armRight: THREE.Group;
  legLeft: THREE.Group;
  legRight: THREE.Group;
  propsById: Record<Exclude<ResearchPropId, 'none'>, THREE.Group>;
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
 * Builds the Professor's signature 360-degree voluminous layered white voxel hairstyle
 * with all 8 required sub-groups (`Hair_Base`, `Hair_Crown`, `Hair_Front_Layers`,
 * `Hair_Left_Side`, `Hair_Right_Side`, `Hair_Back_Upper`, `Hair_Back_Lower`, `Hair_Temple_Details`)
 * and 5 matte white/pearl/silver/lavender-gray materials.
 *
 * Non-coplanar block offsets ensure zero Z-fighting across all 8 turnaround angles
 * and zero intersection with ears, eyebrows, or black rectangular glasses.
 */
function buildProfessorLayeredHairGroup(
  hairMats: Record<string, THREE.MeshStandardMaterial>,
): THREE.Group {
  const hairRoot = new THREE.Group();
  hairRoot.name = 'Hair';

  const mIvory = hairMats.prof_hair_warm_ivory;
  const mPearl = hairMats.prof_hair_soft_pearl;
  const mSilver = hairMats.prof_hair_silver_gray;
  const mLavender = hairMats.prof_hair_lavender_shadow;
  const mSlate = hairMats.prof_hair_recess_slate;

  // 1. Hair_Base — Solid volumetric cranium foundation
  const hairBase = new THREE.Group();
  hairBase.name = 'Hair_Base';
  hairBase.add(
    makeVoxelBox('Hair_Base_Cranium_Core', [0.376, 0.118, 0.354], [0, 0.366, -0.008], mPearl),
    makeVoxelBox('Hair_Base_Inner_Cap', [0.356, 0.056, 0.336], [0, 0.324, -0.010], mSlate),
  );
  hairRoot.add(hairBase);

  // 2. Hair_Crown — Multi-tiered stepped upper hair volume peaking at Y = 0.485
  //    (0.90 Hips + 0.37 Torso + 0.485 Hair = 1.755m exact character height)
  const hairCrown = new THREE.Group();
  hairCrown.name = 'Hair_Crown';
  hairCrown.add(
    makeVoxelBox('Hair_Crown_Lower_Deck', [0.422, 0.054, 0.378], [0, 0.408, -0.006], mIvory),
    makeVoxelBox('Hair_Crown_Mid_Deck', [0.382, 0.046, 0.340], [0.004, 0.442, -0.004], mPearl),
    makeVoxelBox('Hair_Crown_Left_Wave_Cluster', [0.162, 0.038, 0.256], [-0.094, 0.462, 0.008], mIvory),
    makeVoxelBox('Hair_Crown_Center_Peak_Cluster', [0.164, 0.036, 0.242], [0.010, 0.467, 0.012], mIvory),
    makeVoxelBox('Hair_Crown_Right_Wave_Cluster', [0.150, 0.036, 0.248], [0.102, 0.458, -0.008], mPearl),
    makeVoxelBox('Hair_Crown_Rear_Crest_Cluster', [0.312, 0.040, 0.146], [-0.006, 0.454, -0.110], mSilver),
    makeVoxelBox('Hair_Crown_Side_Flair_Left', [0.058, 0.044, 0.228], [-0.204, 0.422, -0.012], mSilver),
    makeVoxelBox('Hair_Crown_Side_Flair_Right', [0.058, 0.044, 0.228], [0.204, 0.422, -0.012], mSilver),
  );
  hairRoot.add(hairCrown);

  // 3. Hair_Front_Layers — Stepped asymmetric front hair clusters framing forehead above eyebrows (Y >= 0.292)
  const hairFront = new THREE.Group();
  hairFront.name = 'Hair_Front_Layers';
  hairFront.add(
    makeVoxelBox('Hair_Front_Upper_Mantle', [0.392, 0.062, 0.062], [0, 0.362, 0.166], mIvory),
    makeVoxelBox('Hair_Front_Left_Swept_Cluster', [0.138, 0.068, 0.058], [-0.108, 0.330, 0.178], mIvory),
    makeVoxelBox('Hair_Front_Left_Lower_Lock', [0.088, 0.046, 0.050], [-0.136, 0.306, 0.182], mPearl),
    makeVoxelBox('Hair_Front_Center_Left_Wave', [0.096, 0.058, 0.060], [-0.022, 0.334, 0.184], mIvory),
    makeVoxelBox('Hair_Front_Center_Part_Recess', [0.068, 0.048, 0.048], [0.048, 0.342, 0.172], mLavender),
    makeVoxelBox('Hair_Front_Right_Swept_Cluster', [0.124, 0.064, 0.058], [0.114, 0.328, 0.176], mPearl),
    makeVoxelBox('Hair_Front_Right_Lower_Lock', [0.084, 0.046, 0.050], [0.142, 0.304, 0.180], mSilver),
  );
  hairRoot.add(hairFront);

  // 4. Hair_Temple_Details — Voluminous senior-professor temple puffs flanking both sides of the forehead
  const hairTemples = new THREE.Group();
  hairTemples.name = 'Hair_Temple_Details';
  hairTemples.add(
    // Left temple stepped clusters
    makeVoxelBox('Hair_Temple_Left_Upper_Puff', [0.068, 0.096, 0.156], [-0.202, 0.338, 0.082], mIvory),
    makeVoxelBox('Hair_Temple_Left_Outer_Flair', [0.054, 0.078, 0.126], [-0.228, 0.324, 0.066], mPearl),
    makeVoxelBox('Hair_Temple_Left_Sideburn_Step', [0.048, 0.072, 0.062], [-0.186, 0.256, 0.098], mSilver),
    makeVoxelBox('Hair_Temple_Left_Under_Shadow', [0.044, 0.052, 0.056], [-0.194, 0.278, 0.112], mLavender),
    // Right temple stepped clusters
    makeVoxelBox('Hair_Temple_Right_Upper_Puff', [0.068, 0.096, 0.156], [0.202, 0.338, 0.082], mIvory),
    makeVoxelBox('Hair_Temple_Right_Outer_Flair', [0.054, 0.078, 0.126], [0.228, 0.324, 0.066], mPearl),
    makeVoxelBox('Hair_Temple_Right_Sideburn_Step', [0.048, 0.072, 0.062], [0.186, 0.256, 0.098], mSilver),
    makeVoxelBox('Hair_Temple_Right_Under_Shadow', [0.044, 0.052, 0.056], [0.194, 0.278, 0.112], mLavender),
  );
  hairRoot.add(hairTemples);

  // 5. Hair_Left_Side — Multi-layered billowing left lateral volume arching cleanly over & behind left ear
  const hairLeftSide = new THREE.Group();
  hairLeftSide.name = 'Hair_Left_Side';
  hairLeftSide.add(
    makeVoxelBox('Hair_Left_Over_Ear_Arch', [0.066, 0.088, 0.182], [-0.200, 0.312, -0.024], mPearl),
    makeVoxelBox('Hair_Left_Outer_Billow_Upper', [0.058, 0.084, 0.156], [-0.232, 0.304, -0.036], mIvory),
    makeVoxelBox('Hair_Left_Outer_Billow_Mid', [0.062, 0.096, 0.148], [-0.226, 0.228, -0.078], mSilver),
    makeVoxelBox('Hair_Left_Post_Ear_Mass', [0.064, 0.152, 0.122], [-0.192, 0.214, -0.106], mPearl),
    makeVoxelBox('Hair_Left_Lower_Wing_Step', [0.054, 0.088, 0.104], [-0.204, 0.152, -0.112], mLavender),
  );
  hairRoot.add(hairLeftSide);

  // 6. Hair_Right_Side — Multi-layered billowing right lateral volume arching cleanly over & behind right ear
  const hairRightSide = new THREE.Group();
  hairRightSide.name = 'Hair_Right_Side';
  hairRightSide.add(
    makeVoxelBox('Hair_Right_Over_Ear_Arch', [0.066, 0.088, 0.182], [0.200, 0.312, -0.024], mPearl),
    makeVoxelBox('Hair_Right_Outer_Billow_Upper', [0.058, 0.084, 0.156], [0.232, 0.304, -0.036], mIvory),
    makeVoxelBox('Hair_Right_Outer_Billow_Mid', [0.062, 0.096, 0.148], [0.226, 0.228, -0.078], mSilver),
    makeVoxelBox('Hair_Right_Post_Ear_Mass', [0.064, 0.152, 0.122], [0.192, 0.214, -0.106], mPearl),
    makeVoxelBox('Hair_Right_Lower_Wing_Step', [0.054, 0.088, 0.104], [0.204, 0.152, -0.112], mLavender),
  );
  hairRoot.add(hairRightSide);

  // 7. Hair_Back_Upper — Sculpted multi-cluster rear upper volume with tonal variation
  const hairBackUpper = new THREE.Group();
  hairBackUpper.name = 'Hair_Back_Upper';
  hairBackUpper.add(
    makeVoxelBox('Hair_Back_Upper_Core_Plate', [0.388, 0.148, 0.068], [0, 0.298, -0.176], mPearl),
    makeVoxelBox('Hair_Back_Upper_Left_Cluster', [0.168, 0.106, 0.056], [-0.092, 0.316, -0.204], mIvory),
    makeVoxelBox('Hair_Back_Upper_Right_Cluster', [0.168, 0.106, 0.056], [0.092, 0.312, -0.202], mPearl),
    makeVoxelBox('Hair_Back_Upper_Center_Crest', [0.148, 0.118, 0.062], [0.004, 0.288, -0.212], mIvory),
    makeVoxelBox('Hair_Back_Mid_Wide_Band', [0.396, 0.112, 0.064], [0, 0.208, -0.182], mSilver),
    makeVoxelBox('Hair_Back_Mid_Left_Step', [0.152, 0.088, 0.052], [-0.096, 0.204, -0.208], mPearl),
    makeVoxelBox('Hair_Back_Mid_Right_Step', [0.152, 0.088, 0.052], [0.096, 0.200, -0.206], mSilver),
    makeVoxelBox('Hair_Back_Mid_Center_Lock', [0.136, 0.092, 0.056], [0, 0.194, -0.214], mIvory),
  );
  hairRoot.add(hairBackUpper);

  // 8. Hair_Back_Lower — Stepped lower rear cascade tapering cleanly above the coat collar
  const hairBackLower = new THREE.Group();
  hairBackLower.name = 'Hair_Back_Lower';
  hairBackLower.add(
    makeVoxelBox('Hair_Back_Lower_Main_Tier', [0.344, 0.084, 0.058], [0, 0.132, -0.172], mLavender),
    makeVoxelBox('Hair_Back_Lower_Center_Taper', [0.252, 0.066, 0.052], [0, 0.104, -0.184], mSilver),
    makeVoxelBox('Hair_Back_Nape_Left_Tuft', [0.096, 0.054, 0.046], [-0.088, 0.092, -0.178], mSlate),
    makeVoxelBox('Hair_Back_Nape_Right_Tuft', [0.096, 0.054, 0.046], [0.088, 0.092, -0.178], mSlate),
    makeVoxelBox('Hair_Back_Nape_Center_Tip', [0.112, 0.048, 0.044], [0, 0.078, -0.176], mSlate),
  );
  hairRoot.add(hairBackLower);

  return hairRoot;
}

/**
 * Builds the Professor's thick black rectangular glasses (`Glasses` group).
 * Designed as genuine 3D open-frame voxel geometry so the dark rectangular eyes,
 * pupils, and highlights remain 100% visible through the frames, and when toggled off,
 * the eyes still render naturally.
 */
function buildProfessorGlassesGroup(matGlasses: THREE.Material): THREE.Group {
  const glasses = new THREE.Group();
  glasses.name = 'Glasses';

  // Left rectangular frame around Eye_Left (X = -0.072, Y = 0.210)
  glasses.add(
    makeVoxelBox('Glasses_Rim_Top_Left', [0.096, 0.016, 0.018], [-0.074, 0.244, 0.170], matGlasses),
    makeVoxelBox('Glasses_Rim_Bottom_Left', [0.096, 0.015, 0.018], [-0.074, 0.176, 0.170], matGlasses),
    makeVoxelBox('Glasses_Rim_Outer_Left', [0.016, 0.082, 0.018], [-0.114, 0.210, 0.170], matGlasses),
    makeVoxelBox('Glasses_Rim_Inner_Left', [0.015, 0.082, 0.018], [-0.034, 0.210, 0.170], matGlasses),
    // Right rectangular frame around Eye_Right (X = +0.072, Y = 0.210)
    makeVoxelBox('Glasses_Rim_Top_Right', [0.096, 0.016, 0.018], [0.074, 0.244, 0.170], matGlasses),
    makeVoxelBox('Glasses_Rim_Bottom_Right', [0.096, 0.015, 0.018], [0.074, 0.176, 0.170], matGlasses),
    makeVoxelBox('Glasses_Rim_Outer_Right', [0.016, 0.082, 0.018], [0.114, 0.210, 0.170], matGlasses),
    makeVoxelBox('Glasses_Rim_Inner_Right', [0.015, 0.082, 0.018], [0.034, 0.210, 0.170], matGlasses),
    // Center nose bridge
    makeVoxelBox('Glasses_Bridge_Center', [0.054, 0.016, 0.018], [0, 0.222, 0.172], matGlasses),
    // Side temple arms extending back toward ears
    makeVoxelBox('Glasses_Temple_Hinge_Left', [0.022, 0.018, 0.022], [-0.128, 0.226, 0.166], matGlasses),
    makeVoxelBox('Glasses_Temple_Hinge_Right', [0.022, 0.018, 0.022], [0.128, 0.226, 0.166], matGlasses),
    makeVoxelBox('Glasses_Temple_Arm_Left', [0.014, 0.016, 0.168], [-0.174, 0.222, 0.082], matGlasses),
    makeVoxelBox('Glasses_Temple_Arm_Right', [0.014, 0.016, 0.168], [0.174, 0.222, 0.082], matGlasses),
  );

  return glasses;
}

/**
 * Builds the Professor's short white voxel moustache (`Moustache` group) and
 * compact academic beard (`Beard` group) with zero mouth or cheek coplanar overlap.
 */
function buildProfessorFacialHairGroups(
  matWhite: THREE.Material,
  matShadow: THREE.Material,
): {
  moustacheGroup: THREE.Group;
  beardGroup: THREE.Group;
} {
  const moustacheGroup = new THREE.Group();
  moustacheGroup.name = 'Moustache';
  // Positioned cleanly below Nose (Y = 0.174) and above Mouth (Y = 0.112)
  moustacheGroup.add(
    makeVoxelBox('Moustache_Center_Core', [0.084, 0.024, 0.022], [0, 0.144, 0.166], matWhite),
    makeVoxelBox('Moustache_Left_Wing', [0.056, 0.026, 0.022], [-0.058, 0.140, 0.165], matWhite),
    makeVoxelBox('Moustache_Right_Wing', [0.056, 0.026, 0.022], [0.058, 0.140, 0.165], matWhite),
    makeVoxelBox('Moustache_Left_Drop_Tip', [0.032, 0.026, 0.020], [-0.082, 0.126, 0.163], matShadow),
    makeVoxelBox('Moustache_Right_Drop_Tip', [0.032, 0.026, 0.020], [0.082, 0.126, 0.163], matShadow),
  );

  const beardGroup = new THREE.Group();
  beardGroup.name = 'Beard';
  // Compact senior-academic beard framing the chin & lower jaw below the mouth (Y <= 0.098)
  beardGroup.add(
    makeVoxelBox('Beard_Chin_Upper_Block', [0.176, 0.038, 0.026], [0, 0.080, 0.164], matWhite),
    makeVoxelBox('Beard_Chin_Lower_Step', [0.136, 0.034, 0.034], [0, 0.050, 0.158], matWhite),
    makeVoxelBox('Beard_Chin_Under_Plate', [0.210, 0.026, 0.140], [0, 0.036, 0.088], matShadow),
    makeVoxelBox('Beard_Jaw_Left_Block', [0.052, 0.056, 0.032], [-0.106, 0.086, 0.154], matShadow),
    makeVoxelBox('Beard_Jaw_Right_Block', [0.052, 0.056, 0.032], [0.106, 0.086, 0.154], matShadow),
    makeVoxelBox('Beard_Side_Link_Left', [0.028, 0.076, 0.112], [-0.166, 0.112, 0.084], matShadow),
    makeVoxelBox('Beard_Side_Link_Right', [0.028, 0.076, 0.112], [0.166, 0.112, 0.084], matShadow),
  );

  return { moustacheGroup, beardGroup };
}

/**
 * Builds the 7 contextual handheld research props attached under `Hand_Right -> Props_Attachment`
 * and hidden by default in the exported rest pose.
 */
function buildProfessorPropsAttachment(): {
  attachmentRoot: THREE.Group;
  propsById: Record<Exclude<ResearchPropId, 'none'>, THREE.Group>;
} {
  const attachmentRoot = new THREE.Group();
  attachmentRoot.name = 'Props_Attachment';
  attachmentRoot.position.set(0, -0.28, 0.08);

  const matBookCover = new THREE.MeshStandardMaterial({
    name: 'prof_prop_book_cover',
    color: '#232832',
    roughness: 0.72,
    metalness: 0.08,
  });
  const matCreamPages = new THREE.MeshStandardMaterial({
    name: 'prof_prop_cream_pages',
    color: '#F5EFE2',
    roughness: 0.85,
    metalness: 0.02,
  });
  const matSharedBrainGreen = new THREE.MeshStandardMaterial({
    name: 'prof_prop_shared_brain_green',
    color: '#4ADE80',
    emissive: '#16A34A',
    emissiveIntensity: 0.28,
    roughness: 0.42,
    metalness: 0.08,
  });
  const matWalnutWood = new THREE.MeshStandardMaterial({
    name: 'prof_prop_walnut_wood',
    color: '#5C3D28',
    roughness: 0.76,
    metalness: 0.05,
  });
  const matBrass = new THREE.MeshStandardMaterial({
    name: 'prof_prop_brass',
    color: '#D4A359',
    roughness: 0.42,
    metalness: 0.35,
  });
  const matMugCream = new THREE.MeshStandardMaterial({
    name: 'prof_prop_mug_cream',
    color: '#F4EFE6',
    roughness: 0.48,
    metalness: 0.05,
  });
  const matCoffeeDark = new THREE.MeshStandardMaterial({
    name: 'prof_prop_coffee_dark',
    color: '#3B2316',
    roughness: 0.35,
    metalness: 0.04,
  });
  const matFolderSage = new THREE.MeshStandardMaterial({
    name: 'prof_prop_folder_sage',
    color: '#5E7E6C',
    roughness: 0.78,
    metalness: 0.04,
  });

  // 1. Prop_Research_Book (Open scholarly tome with green Shared Brain emblem — matches reference sheet!)
  const researchBook = new THREE.Group();
  researchBook.name = 'Prop_Research_Book';
  researchBook.add(
    makeVoxelBox('Book_Spine_Center', [0.028, 0.175, 0.026], [0, 0.04, 0.06], matBookCover),
    makeVoxelBox(
      'Book_Cover_Left',
      [0.125, 0.172, 0.014],
      [-0.068, 0.04, 0.075],
      matBookCover,
      [0, 0.28, 0],
    ),
    makeVoxelBox(
      'Book_Cover_Right',
      [0.125, 0.172, 0.014],
      [0.068, 0.04, 0.075],
      matBookCover,
      [0, -0.28, 0],
    ),
    makeVoxelBox(
      'Book_Pages_Left',
      [0.114, 0.158, 0.018],
      [-0.062, 0.04, 0.064],
      matCreamPages,
      [0, 0.28, 0],
    ),
    makeVoxelBox(
      'Book_Pages_Right',
      [0.114, 0.158, 0.018],
      [0.062, 0.04, 0.064],
      matCreamPages,
      [0, -0.28, 0],
    ),
    // Green Shared Brain tree icon on outer front cover
    makeVoxelBox(
      'Book_Cover_Brain_Crown',
      [0.056, 0.046, 0.008],
      [-0.072, 0.056, 0.084],
      matSharedBrainGreen,
      [0, 0.28, 0],
    ),
    makeVoxelBox(
      'Book_Cover_Brain_Stem',
      [0.018, 0.032, 0.008],
      [-0.072, 0.022, 0.084],
      matSharedBrainGreen,
      [0, 0.28, 0],
    ),
  );
  researchBook.visible = false;
  attachmentRoot.add(researchBook);

  // 2. Prop_Notebook (Compact scholarly field notebook + brass stylus/pen)
  const notebook = new THREE.Group();
  notebook.name = 'Prop_Notebook';
  notebook.add(
    makeVoxelBox('Notebook_Cover_Back', [0.155, 0.014, 0.205], [0, 0.005, 0.05], matWalnutWood),
    makeVoxelBox('Notebook_Pages_Block', [0.142, 0.016, 0.192], [0, 0.016, 0.05], matCreamPages),
    makeVoxelBox('Notebook_Bookmark_Ribbon', [0.018, 0.008, 0.045], [0.03, 0.022, 0.15], matSharedBrainGreen),
    makeVoxelBox('Notebook_Brass_Pen', [0.014, 0.014, 0.135], [0.055, 0.028, 0.05], matBrass, [0, 0.22, 0]),
  );
  notebook.visible = false;
  attachmentRoot.add(notebook);

  // 3. Prop_Reference_Tablet (Slate research tablet with green Shared Brain graph nodes)
  const tablet = new THREE.Group();
  tablet.name = 'Prop_Reference_Tablet';
  tablet.add(
    makeVoxelBox('Tablet_Chassis', [0.18, 0.016, 0.23], [0, 0.01, 0.05], matBookCover),
    makeVoxelBox('Tablet_Screen_Surface', [0.156, 0.006, 0.202], [0, 0.018, 0.05], matWalnutWood),
    makeVoxelBox('Tablet_Brain_Node_Top', [0.068, 0.006, 0.042], [0, 0.022, 0.095], matSharedBrainGreen),
    makeVoxelBox('Tablet_Brain_Node_Left', [0.048, 0.006, 0.036], [-0.038, 0.022, 0.035], matSharedBrainGreen),
    makeVoxelBox('Tablet_Brain_Node_Right', [0.048, 0.006, 0.036], [0.038, 0.022, 0.035], matSharedBrainGreen),
    makeVoxelBox('Tablet_Brass_Trim', [0.05, 0.006, 0.012], [0, 0.021, -0.042], matBrass),
  );
  tablet.visible = false;
  attachmentRoot.add(tablet);

  // 4. Prop_Research_Paper (Manuscript folio sheets with citation bars)
  const researchPaper = new THREE.Group();
  researchPaper.name = 'Prop_Research_Paper';
  researchPaper.add(
    makeVoxelBox('Paper_Sheet_Bottom', [0.175, 0.008, 0.225], [-0.006, 0.006, 0.05], matCreamPages, [0, 0.06, 0]),
    makeVoxelBox('Paper_Sheet_Top', [0.172, 0.008, 0.222], [0.004, 0.014, 0.05], matCreamPages, [0, -0.04, 0]),
    makeVoxelBox('Paper_Header_Green', [0.125, 0.005, 0.024], [0.004, 0.020, 0.115], matSharedBrainGreen),
    makeVoxelBox('Paper_Citation_Bar', [0.110, 0.005, 0.016], [0.004, 0.020, 0.065], matBrass),
  );
  researchPaper.visible = false;
  attachmentRoot.add(researchPaper);

  // 5. Prop_Research_Clipboard (Walnut archival clipboard with brass clip & checklist)
  const clipboard = new THREE.Group();
  clipboard.name = 'Prop_Research_Clipboard';
  clipboard.add(
    makeVoxelBox('Clipboard_Walnut_Board', [0.18, 0.012, 0.24], [0, 0.006, 0.05], matWalnutWood),
    makeVoxelBox('Clipboard_Sheet', [0.158, 0.008, 0.208], [0, 0.014, 0.045], matCreamPages),
    makeVoxelBox('Clipboard_Brass_Clip', [0.068, 0.016, 0.026], [0, 0.019, 0.146], matBrass),
    makeVoxelBox('Clipboard_Green_Tag', [0.118, 0.006, 0.024], [0, 0.019, 0.088], matSharedBrainGreen),
  );
  clipboard.visible = false;
  attachmentRoot.add(clipboard);

  // 6. Prop_Coffee_Cup (Cream scholarly mug with green Shared Brain tree icon)
  const coffeeCup = new THREE.Group();
  coffeeCup.name = 'Prop_Coffee_Cup';
  coffeeCup.add(
    makeVoxelBox('Prof_Mug_Body', [0.074, 0.088, 0.074], [0, 0.022, 0.04], matMugCream),
    makeVoxelBox('Prof_Mug_Brain_Badge', [0.036, 0.036, 0.008], [0, 0.026, 0.078], matSharedBrainGreen),
    makeVoxelBox('Prof_Mug_Coffee_Liquid', [0.058, 0.01, 0.058], [0, 0.064, 0.04], matCoffeeDark),
    makeVoxelBox('Prof_Mug_Handle', [0.018, 0.052, 0.026], [0.045, 0.022, 0.04], matMugCream),
  );
  coffeeCup.visible = false;
  attachmentRoot.add(coffeeCup);

  // 7. Prop_Reference_Folder (Archival dossier folder with brass index tab)
  const referenceFolder = new THREE.Group();
  referenceFolder.name = 'Prop_Reference_Folder';
  referenceFolder.add(
    makeVoxelBox('Folder_Jacket_Lower', [0.185, 0.012, 0.235], [0, 0.006, 0.05], matFolderSage),
    makeVoxelBox('Folder_Inner_Folio', [0.170, 0.012, 0.218], [0, 0.016, 0.05], matCreamPages),
    makeVoxelBox('Folder_Brass_Index_Tab', [0.058, 0.010, 0.028], [0.048, 0.016, 0.156], matBrass),
    makeVoxelBox('Folder_Brain_Label', [0.078, 0.006, 0.038], [0, 0.023, 0.06], matSharedBrainGreen),
  );
  referenceFolder.visible = false;
  attachmentRoot.add(referenceFolder);

  return {
    attachmentRoot,
    propsById: {
      research_book: researchBook,
      notebook,
      tablet,
      research_paper: researchPaper,
      clipboard,
      coffee_cup: coffeeCup,
      reference_folder: referenceFolder,
    },
  };
}

/**
 * Builds the complete Research Professor character rig (`Research_Professor_Agent_Root`)
 * and all 20 genuine keyframe `THREE.AnimationClip`s.
 */
export function buildResearchProfessorSceneAndClips(): BuiltResearchProfessorRig {
  const root = new THREE.Group();
  root.name = RESEARCH_CHARACTER_CONSTANTS.ROOT_NODE_NAME;

  // 5-Material Layered White / Pearl / Silver / Lavender-Gray Hair Palette
  const hairMats: Record<string, THREE.MeshStandardMaterial> = {};
  for (const spec of RESEARCH_HAIR_MATERIAL_PALETTE) {
    hairMats[spec.id] = new THREE.MeshStandardMaterial({
      name: spec.id,
      color: spec.hex,
      roughness: spec.roughness,
      metalness: spec.metalness,
    });
  }

  const matSkin = new THREE.MeshStandardMaterial({
    name: 'prof_skin_warm_beige',
    color: RESEARCH_OUTFIT_PALETTE.skinWarmBeige,
    roughness: 0.78,
    metalness: 0.03,
  });
  const matSkinShade = new THREE.MeshStandardMaterial({
    name: 'prof_skin_shade_warm',
    color: RESEARCH_OUTFIT_PALETTE.skinShadeWarm,
    roughness: 0.82,
    metalness: 0.03,
  });
  const matCheek = new THREE.MeshStandardMaterial({
    name: 'prof_cheek_warm',
    color: RESEARCH_OUTFIT_PALETTE.cheekWarm,
    roughness: 0.80,
    metalness: 0.02,
  });
  const matEyeDark = new THREE.MeshStandardMaterial({
    name: 'prof_eye_dark',
    color: RESEARCH_OUTFIT_PALETTE.eyeDark,
    roughness: 0.45,
    metalness: 0.08,
  });
  const matPupil = new THREE.MeshStandardMaterial({
    name: 'prof_pupil_black',
    color: RESEARCH_OUTFIT_PALETTE.pupilBlack,
    roughness: 0.35,
    metalness: 0.1,
  });
  const matEyeHighlight = new THREE.MeshStandardMaterial({
    name: 'prof_eye_highlight',
    color: RESEARCH_OUTFIT_PALETTE.eyeHighlight,
    roughness: 0.25,
    metalness: 0.05,
  });
  const matGlasses = new THREE.MeshStandardMaterial({
    name: 'prof_glasses_frame_black',
    color: RESEARCH_OUTFIT_PALETTE.glassesFrameBlack,
    roughness: 0.42,
    metalness: 0.18,
  });
  const matCoatPrimary = new THREE.MeshStandardMaterial({
    name: 'prof_coat_cream_primary',
    color: RESEARCH_OUTFIT_PALETTE.coatCreamPrimary,
    roughness: 0.80,
    metalness: 0.04,
  });
  const matCoatLapel = new THREE.MeshStandardMaterial({
    name: 'prof_coat_cream_lapel',
    color: RESEARCH_OUTFIT_PALETTE.coatCreamLapel,
    roughness: 0.82,
    metalness: 0.04,
  });
  const matCoatPocket = new THREE.MeshStandardMaterial({
    name: 'prof_coat_pocket_trim',
    color: RESEARCH_OUTFIT_PALETTE.coatPocketTrim,
    roughness: 0.84,
    metalness: 0.04,
  });
  const matInnerVest = new THREE.MeshStandardMaterial({
    name: 'prof_inner_vest_charcoal',
    color: RESEARCH_OUTFIT_PALETTE.innerVestCharcoal,
    roughness: 0.78,
    metalness: 0.06,
  });
  const matBrassButton = new THREE.MeshStandardMaterial({
    name: 'prof_vest_button_brass',
    color: RESEARCH_OUTFIT_PALETTE.innerVestButtonBrass,
    roughness: 0.40,
    metalness: 0.38,
  });
  const matShirtWhite = new THREE.MeshStandardMaterial({
    name: 'prof_shirt_crisp_white',
    color: RESEARCH_OUTFIT_PALETTE.shirtCrispWhite,
    roughness: 0.78,
    metalness: 0.03,
  });
  const matTieBurgundy = new THREE.MeshStandardMaterial({
    name: 'prof_tie_burgundy_red',
    color: RESEARCH_OUTFIT_PALETTE.tieBurgundyRed,
    roughness: 0.68,
    metalness: 0.06,
  });
  const matTieDeep = new THREE.MeshStandardMaterial({
    name: 'prof_tie_burgundy_deep',
    color: RESEARCH_OUTFIT_PALETTE.tieBurgundyDeep,
    roughness: 0.72,
    metalness: 0.05,
  });
  const matTrousers = new THREE.MeshStandardMaterial({
    name: 'prof_trousers_dark_charcoal',
    color: RESEARCH_OUTFIT_PALETTE.trousersDarkCharcoal,
    roughness: 0.82,
    metalness: 0.05,
  });
  const matTrouserCuff = new THREE.MeshStandardMaterial({
    name: 'prof_trousers_cuff_dark',
    color: RESEARCH_OUTFIT_PALETTE.trousersCuffDark,
    roughness: 0.84,
    metalness: 0.05,
  });
  const matShoeBrown = new THREE.MeshStandardMaterial({
    name: 'prof_shoes_formal_brown',
    color: RESEARCH_OUTFIT_PALETTE.shoesFormalBrown,
    roughness: 0.58,
    metalness: 0.12,
  });
  const matShoeSole = new THREE.MeshStandardMaterial({
    name: 'prof_shoes_sole_dark_brown',
    color: RESEARCH_OUTFIT_PALETTE.shoesSoleDarkBrown,
    roughness: 0.76,
    metalness: 0.06,
  });
  const matBackpackBody = new THREE.MeshStandardMaterial({
    name: 'prof_backpack_dark_body',
    color: RESEARCH_OUTFIT_PALETTE.backpackDarkBody,
    roughness: 0.72,
    metalness: 0.10,
  });
  const matBackpackPanel = new THREE.MeshStandardMaterial({
    name: 'prof_backpack_panel_slate',
    color: RESEARCH_OUTFIT_PALETTE.backpackPanelSlate,
    roughness: 0.68,
    metalness: 0.12,
  });
  const matSharedBrainGreen = new THREE.MeshStandardMaterial({
    name: 'prof_shared_brain_green_bright',
    color: RESEARCH_OUTFIT_PALETTE.sharedBrainGreenBright,
    emissive: RESEARCH_OUTFIT_PALETTE.sharedBrainGreenDeep,
    emissiveIntensity: 0.28,
    roughness: 0.42,
    metalness: 0.08,
  });
  const matSharedBrainDeep = new THREE.MeshStandardMaterial({
    name: 'prof_shared_brain_green_core',
    color: RESEARCH_OUTFIT_PALETTE.sharedBrainGreenCore,
    roughness: 0.52,
    metalness: 0.08,
  });

  // Hips (Root Pelvis Pivot at Y = 0.90m)
  const hips = new THREE.Group();
  hips.name = 'Hips';
  hips.position.set(0, 0.9, 0);
  hips.add(
    makeVoxelBox('Pelvis_Block', [0.35, 0.11, 0.21], [0, -0.04, 0], matTrousers),
    makeVoxelBox('Belt_Leather_Strap', [0.356, 0.030, 0.216], [0, 0.01, 0], matShoeBrown),
    makeVoxelBox('Belt_Buckle_Brass', [0.062, 0.032, 0.016], [0, 0.01, 0.106], matBrassButton),
  );
  root.add(hips);

  // Torso (Attached to Hips at [0, 0, 0], extends up to Y = +0.37m)
  const torso = new THREE.Group();
  torso.name = 'Torso';
  torso.position.set(0, 0, 0);
  hips.add(torso);

  // Inner Formal Clothing (`InnerClothing`: Dark Vest + White Shirt + Burgundy Tie)
  const innerClothingGroup = new THREE.Group();
  innerClothingGroup.name = 'InnerClothing';
  innerClothingGroup.add(
    // Core torso block (dark formal vest)
    makeVoxelBox('Vest_Torso_Core', [0.364, 0.368, 0.206], [0, 0.184, 0], matInnerVest),
    // Crisp white dress shirt upper V-panel and collar points
    makeVoxelBox('Shirt_Chest_V_Panel', [0.132, 0.165, 0.016], [0, 0.282, 0.100], matShirtWhite),
    makeVoxelBox('Shirt_Collar_Left_Point', [0.058, 0.042, 0.024], [-0.044, 0.350, 0.104], matShirtWhite, [0, 0, 0.22]),
    makeVoxelBox('Shirt_Collar_Right_Point', [0.058, 0.042, 0.024], [0.044, 0.350, 0.104], matShirtWhite, [0, 0, -0.22]),
    // Red / burgundy necktie
    makeVoxelBox('Tie_Knot_Top', [0.038, 0.034, 0.022], [0, 0.336, 0.108], matTieDeep),
    makeVoxelBox('Tie_Blade_Upper', [0.042, 0.155, 0.020], [0, 0.246, 0.107], matTieBurgundy),
    makeVoxelBox('Tie_Blade_Lower_Tip', [0.032, 0.044, 0.018], [0, 0.150, 0.106], matTieDeep),
    // Brass vest buttons below the tie tip
    makeVoxelBox('Vest_Button_Upper', [0.018, 0.018, 0.014], [0, 0.105, 0.105], matBrassButton),
    makeVoxelBox('Vest_Button_Lower', [0.018, 0.018, 0.014], [0, 0.062, 0.105], matBrassButton),
  );
  torso.add(innerClothingGroup);

  // Cream / Off-White Laboratory & Academic Coat (`AcademicCoat` group)
  const academicCoatGroup = new THREE.Group();
  academicCoatGroup.name = 'AcademicCoat';
  academicCoatGroup.add(
    // Back and side coat shell
    makeVoxelBox('Coat_Back_Panel', [0.382, 0.372, 0.026], [0, 0.186, -0.104], matCoatPrimary),
    makeVoxelBox('Coat_Side_Panel_Left', [0.024, 0.372, 0.218], [-0.186, 0.186, 0], matCoatPrimary),
    makeVoxelBox('Coat_Side_Panel_Right', [0.024, 0.372, 0.218], [0.186, 0.186, 0], matCoatPrimary),
    // Two distinct open front coat panels framing the dark vest and red tie
    makeVoxelBox('Coat_Front_Panel_Left', [0.122, 0.366, 0.024], [-0.128, 0.184, 0.106], matCoatPrimary),
    makeVoxelBox('Coat_Front_Panel_Right', [0.122, 0.366, 0.024], [0.128, 0.184, 0.106], matCoatPrimary),
    // Notched academic coat lapels
    makeVoxelBox('Coat_Lapel_Upper_Left', [0.056, 0.155, 0.018], [-0.078, 0.278, 0.116], matCoatLapel, [0, 0, -0.14]),
    makeVoxelBox('Coat_Lapel_Upper_Right', [0.056, 0.155, 0.018], [0.078, 0.278, 0.116], matCoatLapel, [0, 0, 0.14]),
    makeVoxelBox('Coat_Lapel_Notch_Left', [0.048, 0.042, 0.018], [-0.092, 0.342, 0.118], matCoatLapel),
    makeVoxelBox('Coat_Lapel_Notch_Right', [0.048, 0.042, 0.018], [0.092, 0.342, 0.118], matCoatLapel),
    // Structured coat collar
    makeVoxelBox('Coat_Collar_Left', [0.074, 0.044, 0.192], [-0.126, 0.374, -0.006], matCoatLapel),
    makeVoxelBox('Coat_Collar_Right', [0.074, 0.044, 0.192], [0.126, 0.374, -0.006], matCoatLapel),
    makeVoxelBox('Coat_Collar_Back', [0.276, 0.046, 0.044], [0, 0.374, -0.096], matCoatLapel),
    // Lower academic coat tails / skirt panels extending slightly below waist (non-interfering with legs)
    makeVoxelBox('Coat_Lower_Skirt_Left', [0.124, 0.105, 0.224], [-0.130, -0.044, 0.002], matCoatPrimary),
    makeVoxelBox('Coat_Lower_Skirt_Right', [0.124, 0.105, 0.224], [0.130, -0.044, 0.002], matCoatPrimary),
    makeVoxelBox('Coat_Lower_Skirt_Back', [0.380, 0.105, 0.026], [0, -0.044, -0.106], matCoatPrimary),
    // Side pockets with flaps
    makeVoxelBox('Coat_Pocket_Patch_Left', [0.092, 0.078, 0.016], [-0.132, 0.076, 0.118], matCoatLapel),
    makeVoxelBox('Coat_Pocket_Flap_Left', [0.096, 0.022, 0.018], [-0.132, 0.112, 0.120], matCoatPocket),
    makeVoxelBox('Coat_Pocket_Patch_Right', [0.092, 0.078, 0.016], [0.132, 0.076, 0.118], matCoatLapel),
    makeVoxelBox('Coat_Pocket_Flap_Right', [0.096, 0.022, 0.018], [0.132, 0.112, 0.120], matCoatPocket),
    // Green Shared Brain Research Insignia on left chest panel (matches reference sheet!)
    makeVoxelBox('Coat_Shared_Brain_Badge_Backing', [0.048, 0.052, 0.012], [0.128, 0.238, 0.120], matShirtWhite),
    makeVoxelBox('Coat_Shared_Brain_Badge_Crown', [0.032, 0.024, 0.010], [0.128, 0.246, 0.126], matSharedBrainGreen),
    makeVoxelBox('Coat_Shared_Brain_Badge_Stem', [0.012, 0.016, 0.010], [0.128, 0.228, 0.126], matSharedBrainDeep),
  );
  torso.add(academicCoatGroup);

  // Shared Brain Technical Backpack (`Backpack` group)
  const backpackGroup = new THREE.Group();
  backpackGroup.name = 'Backpack';
  backpackGroup.add(
    // Main structured dark technical shell
    makeVoxelBox('Backpack_Main_Body', [0.296, 0.308, 0.118], [0, 0.204, -0.172], matBackpackBody),
    makeVoxelBox('Backpack_Top_Cap', [0.272, 0.034, 0.098], [0, 0.364, -0.166], matBackpackPanel),
    makeVoxelBox('Backpack_Rear_Display_Panel', [0.236, 0.218, 0.016], [0, 0.222, -0.234], matBackpackPanel),
    makeVoxelBox('Backpack_Lower_Pocket', [0.238, 0.068, 0.024], [0, 0.088, -0.238], matBackpackPanel),
    // Green Shared Brain Tree / Network Symbol on rear backpack panel
    makeVoxelBox('Backpack_Brain_Canopy_Top', [0.076, 0.032, 0.014], [0, 0.278, -0.244], matSharedBrainGreen),
    makeVoxelBox('Backpack_Brain_Canopy_Left', [0.046, 0.054, 0.014], [-0.042, 0.252, -0.244], matSharedBrainGreen),
    makeVoxelBox('Backpack_Brain_Canopy_Right', [0.046, 0.054, 0.014], [0.042, 0.252, -0.244], matSharedBrainGreen),
    makeVoxelBox('Backpack_Brain_Trunk_Center', [0.022, 0.058, 0.014], [0, 0.208, -0.244], matSharedBrainGreen),
    makeVoxelBox('Backpack_Brain_Root_Bar', [0.068, 0.016, 0.014], [0, 0.176, -0.244], matSharedBrainDeep),
    // Side green Shared Brain accents visible from Left/Right turnaround views
    makeVoxelBox('Backpack_Side_Badge_Left', [0.014, 0.062, 0.056], [-0.152, 0.214, -0.172], matSharedBrainGreen),
    makeVoxelBox('Backpack_Side_Badge_Right', [0.014, 0.062, 0.056], [0.152, 0.214, -0.172], matSharedBrainGreen),
    // Shoulder straps wrapping cleanly over coat shoulders
    makeVoxelBox('Backpack_Strap_Top_Left', [0.042, 0.026, 0.236], [-0.144, 0.378, -0.012], matBackpackBody),
    makeVoxelBox('Backpack_Strap_Top_Right', [0.042, 0.026, 0.236], [0.144, 0.378, -0.012], matBackpackBody),
    makeVoxelBox('Backpack_Strap_Front_Left', [0.036, 0.228, 0.018], [-0.152, 0.256, 0.118], matBackpackBody),
    makeVoxelBox('Backpack_Strap_Front_Right', [0.036, 0.228, 0.018], [0.152, 0.256, 0.118], matBackpackBody),
    makeVoxelBox('Backpack_Strap_Green_Clip_L', [0.040, 0.022, 0.022], [-0.152, 0.282, 0.120], matSharedBrainDeep),
    makeVoxelBox('Backpack_Strap_Green_Clip_R', [0.040, 0.022, 0.022], [0.152, 0.282, 0.120], matSharedBrainDeep),
  );
  torso.add(backpackGroup);

  // Head (Attached to Torso at Y = 0.37m)
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.37, 0);
  head.add(
    makeVoxelBox('Neck_Column', [0.14, 0.065, 0.13], [0, 0.025, -0.005], matSkinShade),
    makeVoxelBox('Head_Cube_Core', [0.34, 0.33, 0.31], [0, 0.205, 0], matSkin),
    makeVoxelBox('Ear_Left', [0.036, 0.072, 0.056], [-0.182, 0.194, -0.004], matSkin),
    makeVoxelBox('Ear_Left_Inner', [0.014, 0.042, 0.030], [-0.194, 0.194, -0.004], matSkinShade),
    makeVoxelBox('Ear_Right', [0.036, 0.072, 0.056], [0.182, 0.194, -0.004], matSkin),
    makeVoxelBox('Ear_Right_Inner', [0.014, 0.042, 0.030], [0.194, 0.194, -0.004], matSkinShade),
  );
  torso.add(head);

  // 360-Degree Voluminous Layered White Voxel Hairstyle
  const hairGroup = buildProfessorLayeredHairGroup(hairMats);
  head.add(hairGroup);

  // Expressive Senior-Academic Voxel Face (`Face` group)
  const faceGroup = new THREE.Group();
  faceGroup.name = 'Face';

  const eyeLeft = makeVoxelBox('Eye_Left', [0.052, 0.054, 0.014], [-0.074, 0.210, 0.155], matEyeDark);
  const eyeRight = makeVoxelBox('Eye_Right', [0.052, 0.054, 0.014], [0.074, 0.210, 0.155], matEyeDark);
  const pupilLeft = makeVoxelBox('Pupil_Left', [0.026, 0.030, 0.012], [-0.074, 0.210, 0.161], matPupil);
  const pupilRight = makeVoxelBox('Pupil_Right', [0.026, 0.030, 0.012], [0.074, 0.210, 0.161], matPupil);
  const highlightLeft = makeVoxelBox(
    'Eye_Highlight_Left',
    [0.013, 0.013, 0.010],
    [-0.064, 0.222, 0.165],
    matEyeHighlight,
  );
  const highlightRight = makeVoxelBox(
    'Eye_Highlight_Right',
    [0.013, 0.013, 0.010],
    [0.084, 0.222, 0.165],
    matEyeHighlight,
  );
  // Thick white professor eyebrows
  const browLeft = makeVoxelBox(
    'Eyebrow_Left',
    [0.086, 0.026, 0.022],
    [-0.074, 0.268, 0.162],
    hairMats.prof_hair_warm_ivory,
  );
  const browRight = makeVoxelBox(
    'Eyebrow_Right',
    [0.086, 0.026, 0.022],
    [0.074, 0.268, 0.162],
    hairMats.prof_hair_warm_ivory,
  );
  const nose = makeVoxelBox('Nose', [0.036, 0.038, 0.028], [0, 0.174, 0.164], matSkinShade);
  const cheekLeft = makeVoxelBox('Cheek_Left', [0.040, 0.022, 0.010], [-0.118, 0.164, 0.155], matCheek);
  const cheekRight = makeVoxelBox('Cheek_Right', [0.040, 0.022, 0.010], [0.118, 0.164, 0.155], matCheek);
  const mouth = makeVoxelBox('Mouth', [0.062, 0.018, 0.014], [0, 0.112, 0.158], matEyeDark);

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

  // Thick Black Rectangular Glasses (`Glasses` group)
  const glassesGroup = buildProfessorGlassesGroup(matGlasses);
  head.add(glassesGroup);

  // Short White Moustache & Compact Academic Beard (`Moustache` & `Beard` groups)
  const { moustacheGroup, beardGroup } = buildProfessorFacialHairGroups(
    hairMats.prof_hair_warm_ivory,
    hairMats.prof_hair_silver_gray,
  );
  head.add(moustacheGroup);
  head.add(beardGroup);

  // Left Arm (Cream Academic Coat Sleeve + Cuff + Hand)
  const armLeft = new THREE.Group();
  armLeft.name = 'Arm_Left';
  armLeft.position.set(-0.246, 0.33, 0);
  armLeft.add(
    makeVoxelBox('Coat_Sleeve_Upper_Left', [0.114, 0.228, 0.118], [0, -0.10, 0], matCoatPrimary),
    makeVoxelBox('Coat_Sleeve_Cuff_Left', [0.120, 0.040, 0.124], [0, -0.218, 0], matCoatLapel),
    makeVoxelBox('Coat_Sleeve_Button_Left', [0.014, 0.014, 0.014], [-0.056, -0.214, 0.028], matBrassButton),
  );
  const handLeft = new THREE.Group();
  handLeft.name = 'Hand_Left';
  handLeft.position.set(0, -0.27, 0);
  handLeft.add(makeVoxelBox('Hand_Left_Mesh', [0.092, 0.088, 0.095], [0, 0, 0], matSkin));
  armLeft.add(handLeft);
  torso.add(armLeft);

  // Right Arm (Cream Academic Coat Sleeve + Cuff + Hand + Props_Attachment)
  const armRight = new THREE.Group();
  armRight.name = 'Arm_Right';
  armRight.position.set(0.246, 0.33, 0);
  armRight.add(
    makeVoxelBox('Coat_Sleeve_Upper_Right', [0.114, 0.228, 0.118], [0, -0.10, 0], matCoatPrimary),
    makeVoxelBox('Coat_Sleeve_Cuff_Right', [0.120, 0.040, 0.124], [0, -0.218, 0], matCoatLapel),
    makeVoxelBox('Coat_Sleeve_Button_Right', [0.014, 0.014, 0.014], [0.056, -0.214, 0.028], matBrassButton),
  );
  const handRight = new THREE.Group();
  handRight.name = 'Hand_Right';
  handRight.position.set(0, -0.27, 0);
  handRight.add(makeVoxelBox('Hand_Right_Mesh', [0.092, 0.088, 0.095], [0, 0, 0], matSkin));

  const { attachmentRoot, propsById } = buildProfessorPropsAttachment();
  handRight.add(attachmentRoot);
  armRight.add(handRight);
  torso.add(armRight);

  // Left Leg & Formal Brown Leather Shoe (Grounded at Y = 0.000)
  const legLeft = new THREE.Group();
  legLeft.name = 'Leg_Left';
  legLeft.position.set(-0.095, 0, 0);
  legLeft.add(
    makeVoxelBox('Trouser_Leg_Left', [0.145, 0.76, 0.155], [0, -0.41, 0], matTrousers),
    makeVoxelBox('Trouser_Cuff_Left', [0.150, 0.04, 0.160], [0, -0.78, 0], matTrouserCuff),
  );
  const footLeft = new THREE.Group();
  footLeft.name = 'Foot_Left';
  footLeft.position.set(0, -0.84, 0.02);
  footLeft.add(
    makeVoxelBox('Shoe_Upper_Left', [0.148, 0.08, 0.21], [0, 0.0, 0.01], matShoeBrown),
    makeVoxelBox('Shoe_Sole_Left', [0.154, 0.036, 0.22], [0, -0.042, 0.01], matShoeSole),
  );
  legLeft.add(footLeft);
  hips.add(legLeft);

  // Right Leg & Formal Brown Leather Shoe (Grounded at Y = 0.000)
  const legRight = new THREE.Group();
  legRight.name = 'Leg_Right';
  legRight.position.set(0.095, 0, 0);
  legRight.add(
    makeVoxelBox('Trouser_Leg_Right', [0.145, 0.76, 0.155], [0, -0.41, 0], matTrousers),
    makeVoxelBox('Trouser_Cuff_Right', [0.150, 0.04, 0.160], [0, -0.78, 0], matTrouserCuff),
  );
  const footRight = new THREE.Group();
  footRight.name = 'Foot_Right';
  footRight.position.set(0, -0.84, 0.02);
  footRight.add(
    makeVoxelBox('Shoe_Upper_Right', [0.148, 0.08, 0.21], [0, 0.0, 0.01], matShoeBrown),
    makeVoxelBox('Shoe_Sole_Right', [0.154, 0.036, 0.22], [0, -0.042, 0.01], matShoeSole),
  );
  legRight.add(footRight);
  hips.add(legRight);

  const clips = buildResearchProfessorAnimationClips();

  return {
    root,
    hips,
    torso,
    head,
    hairGroup,
    faceGroup,
    glassesGroup,
    moustacheGroup,
    beardGroup,
    academicCoatGroup,
    innerClothingGroup,
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
 * Generates all 20 genuine keyframe `THREE.AnimationClip`s for `research_professor_agent.glb`
 * (the 18 required clips from Section 14 + `Sit_Down` + `Stand_Up`).
 */
export function buildResearchProfessorAnimationClips(): THREE.AnimationClip[] {
  const clips: THREE.AnimationClip[] = [];
  const hipStandY = 0.9;
  const hipSeatY = 0.9 + RESEARCH_CHARACTER_CONSTANTS.SEATED_HIP_DROP_Y; // 0.725

  // 01 — Idle_Breathing (3.0s — calm academic standing pose with subtle breathing & head movement)
  clips.push(
    new THREE.AnimationClip('Idle_Breathing', 3.0, [
      posTrack('Hips', [0, 1.5, 3.0], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.011, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.5, 3.0], [
        [0, 0, 0],
        [0.016, 0.012, 0],
        [0, 0, 0],
      ]),
      quatTrack('Head', [0, 1.0, 2.1, 3.0], [
        [0, 0, 0],
        [-0.022, 0.045, 0.01],
        [0.018, -0.038, -0.01],
        [0, 0, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.5, 3.0], [
        [0.03, 0, 0.04],
        [-0.02, 0, 0.055],
        [0.03, 0, 0.04],
      ]),
      quatTrack('Arm_Right', [0, 1.5, 3.0], [
        [-0.03, 0, -0.04],
        [0.02, 0, -0.055],
        [-0.03, 0, -0.04],
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

  // 02 — Walk_Cycle (1.12s — measured, dignified senior-professor stride)
  clips.push(
    new THREE.AnimationClip('Walk_Cycle', 1.12, [
      posTrack('Hips', [0, 0.28, 0.56, 0.84, 1.12], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.022, 0],
        [0, hipStandY, 0],
        [0, hipStandY + 0.022, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 0.28, 0.56, 0.84, 1.12], [
        [0.035, -0.048, 0],
        [0.042, 0, 0.012],
        [0.035, 0.048, 0],
        [0.042, 0, -0.012],
        [0.035, -0.048, 0],
      ]),
      quatTrack('Head', [0, 0.56, 1.12], [
        [0, 0.025, 0],
        [0, -0.025, 0],
        [0, 0.025, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.28, 0.56, 0.84, 1.12], [
        [0.36, 0, 0.04],
        [0, 0, 0.04],
        [-0.36, 0, 0.04],
        [0, 0, 0.04],
        [0.36, 0, 0.04],
      ]),
      quatTrack('Arm_Right', [0, 0.28, 0.56, 0.84, 1.12], [
        [-0.36, 0, -0.04],
        [0, 0, -0.04],
        [0.36, 0, -0.04],
        [0, 0, -0.04],
        [-0.36, 0, -0.04],
      ]),
      quatTrack('Leg_Left', [0, 0.28, 0.56, 0.84, 1.12], [
        [-0.40, 0, 0],
        [0, 0, 0],
        [0.40, 0, 0],
        [0, 0, 0],
        [-0.40, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 0.28, 0.56, 0.84, 1.12], [
        [0.40, 0, 0],
        [0, 0, 0],
        [-0.40, 0, 0],
        [0, 0, 0],
        [0.40, 0, 0],
      ]),
    ]),
  );

  // Posture helper clip — Sit_Down (1.1s)
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

  // Posture helper clip — Stand_Up (1.1s)
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

  // 03 — Read_Research_Book (3.2s — signature standing book-reading pose scanning pages)
  clips.push(
    new THREE.AnimationClip('Read_Research_Book', 3.2, [
      posTrack('Hips', [0, 1.6, 3.2], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.01, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.6, 3.2], [
        [0.05, 0, 0],
        [0.07, 0.02, 0],
        [0.05, 0, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.6, 2.4, 3.2], [
        [0.22, -0.08, 0],
        [0.24, 0.08, 0.015],
        [0.20, -0.06, -0.015],
        [0.25, 0.06, 0],
        [0.22, -0.08, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.2, 2.2, 3.2], [
        [-0.92, 0.26, 0.08],
        [-1.08, 0.34, 0.10],
        [-0.88, 0.22, 0.08],
        [-0.92, 0.26, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.6, 3.2], [
        [-1.18, -0.28, -0.08],
        [-1.24, -0.30, -0.08],
        [-1.18, -0.28, -0.08],
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

  // 04 — Research_Desk_Work (2.0s — seated workstation study, typing & consulting notes)
  clips.push(
    new THREE.AnimationClip('Research_Desk_Work', 2.0, [
      posTrack('Hips', [0, 1.0, 2.0], [
        [0, hipSeatY, 0],
        [0, hipSeatY + 0.007, 0],
        [0, hipSeatY, 0],
      ]),
      quatTrack('Torso', [0, 1.0, 2.0], [
        [0.06, 0, 0],
        [0.08, 0.02, 0],
        [0.06, 0, 0],
      ]),
      quatTrack('Head', [0, 0.6, 1.3, 2.0], [
        [0.04, -0.05, 0],
        [0.06, 0.06, 0.01],
        [0.02, -0.02, 0],
        [0.04, -0.05, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0], [
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
      quatTrack('Arm_Right', [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0], [
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
      quatTrack('Leg_Left', [0, 2.0], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
      quatTrack('Leg_Right', [0, 2.0], [
        [-0.55, 0, 0],
        [-0.55, 0, 0],
      ]),
    ]),
  );

  // 05 — Search_References_Demo (2.8s — seated, alternating between monitor & reference paper)
  clips.push(
    new THREE.AnimationClip('Search_References_Demo', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, hipSeatY, 0],
        [0, hipSeatY + 0.008, 0],
        [0, hipSeatY, 0],
      ]),
      quatTrack('Torso', [0, 0.9, 1.9, 2.8], [
        [0.05, -0.04, 0],
        [0.03, 0.07, 0],
        [0.08, -0.05, 0],
        [0.05, -0.04, 0],
      ]),
      quatTrack('Head', [0, 0.7, 1.4, 2.1, 2.8], [
        [-0.04, -0.08, 0],
        [-0.06, 0.14, 0.02],
        [0.18, 0.10, -0.02],
        [0.02, -0.04, 0],
        [-0.04, -0.08, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.7, 1.4, 2.1, 2.8], [
        [-1.06, 0.15, 0.05],
        [-1.24, 0.18, 0.06],
        [-0.96, 0.12, 0.05],
        [-1.14, 0.16, 0.05],
        [-1.06, 0.15, 0.05],
      ]),
      quatTrack('Arm_Right', [0, 0.9, 1.8, 2.8], [
        [-1.12, -0.22, -0.06],
        [-1.32, -0.26, -0.08],
        [-1.08, -0.18, -0.06],
        [-1.12, -0.22, -0.06],
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

  // 06 — Inspect_Knowledge_Atlas (3.2s — standing facing the Atlas wall, scanning connected nodes)
  clips.push(
    new THREE.AnimationClip('Inspect_Knowledge_Atlas', 3.2, [
      posTrack('Hips', [0, 1.6, 3.2], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.012, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.1, 2.2, 3.2], [
        [-0.02, -0.06, 0],
        [-0.03, 0.08, 0],
        [-0.01, -0.04, 0],
        [-0.02, -0.06, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.6, 2.4, 3.2], [
        [-0.14, -0.12, 0.01],
        [-0.18, 0.14, -0.02],
        [-0.10, 0.04, 0.02],
        [0.14, -0.06, 0],
        [-0.14, -0.12, 0.01],
      ]),
      quatTrack('Arm_Left', [0, 1.0, 2.1, 3.2], [
        [-0.48, 0.14, 0.08],
        [-1.42, 0.18, 0.12],
        [-1.25, -0.10, 0.10],
        [-0.48, 0.14, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.6, 3.2], [
        [-1.12, -0.22, -0.08],
        [-1.18, -0.25, -0.08],
        [-1.12, -0.22, -0.08],
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

  // 07 — Analyze_Evidence (3.0s — focused pointing & verification gestures at Evidence Board)
  clips.push(
    new THREE.AnimationClip('Analyze_Evidence', 3.0, [
      posTrack('Hips', [0, 1.5, 3.0], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.012, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.0, 2.0, 3.0], [
        [0.04, 0.05, 0],
        [0.02, -0.06, 0],
        [0.05, 0.03, 0],
        [0.04, 0.05, 0],
      ]),
      quatTrack('Head', [0, 0.75, 1.5, 2.25, 3.0], [
        [-0.08, 0.08, 0],
        [-0.12, -0.10, 0.03],
        [0.14, -0.04, -0.02],
        [-0.06, 0.10, 0],
        [-0.08, 0.08, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.8, 1.6, 2.3, 3.0], [
        [-1.36, 0.12, 0.10],
        [-1.58, -0.08, 0.14],
        [-1.22, 0.22, 0.08],
        [-1.48, 0.04, 0.12],
        [-1.36, 0.12, 0.10],
      ]),
      quatTrack('Arm_Right', [0, 1.5, 3.0], [
        [-1.10, -0.24, -0.08],
        [-1.16, -0.26, -0.08],
        [-1.10, -0.24, -0.08],
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

  // 08 — Compare_Sources (2.8s — seated at reading table comparing two sources with alternating head/hand motion)
  clips.push(
    new THREE.AnimationClip('Compare_Sources', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, hipSeatY, 0],
        [0, hipSeatY + 0.008, 0],
        [0, hipSeatY, 0],
      ]),
      quatTrack('Torso', [0, 0.9, 1.9, 2.8], [
        [0.08, -0.06, 0],
        [0.08, 0.07, 0],
        [0.06, -0.04, 0],
        [0.08, -0.06, 0],
      ]),
      quatTrack('Head', [0, 0.7, 1.4, 2.1, 2.8], [
        [0.18, -0.15, 0.02],
        [0.16, 0.16, -0.02],
        [0.20, -0.12, 0.02],
        [0.15, 0.12, -0.02],
        [0.18, -0.15, 0.02],
      ]),
      quatTrack('Arm_Left', [0, 0.7, 1.4, 2.1, 2.8], [
        [-1.18, 0.24, 0.08],
        [-0.98, 0.14, 0.06],
        [-1.22, 0.26, 0.08],
        [-1.02, 0.16, 0.06],
        [-1.18, 0.24, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 0.7, 1.4, 2.1, 2.8], [
        [-1.02, -0.16, -0.06],
        [-1.24, -0.26, -0.08],
        [-1.04, -0.18, -0.06],
        [-1.22, -0.24, -0.08],
        [-1.02, -0.16, -0.06],
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

  // 09 — Organize_Archive (2.8s — standing at bookcase reaching & organizing reference volumes)
  clips.push(
    new THREE.AnimationClip('Organize_Archive', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.015, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.0, 2.0, 2.8], [
        [0.02, 0, 0],
        [-0.04, 0.05, 0],
        [0.04, -0.03, 0],
        [0.02, 0, 0],
      ]),
      quatTrack('Head', [0, 0.9, 1.9, 2.8], [
        [-0.10, 0.06, 0],
        [-0.18, -0.05, 0.02],
        [0.12, -0.04, 0],
        [-0.10, 0.06, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.9, 1.8, 2.8], [
        [-0.85, 0.14, 0.08],
        [-1.62, 0.08, 0.12],
        [-1.12, 0.20, 0.08],
        [-0.85, 0.14, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-1.08, -0.22, -0.08],
        [-1.18, -0.26, -0.08],
        [-1.08, -0.22, -0.08],
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

  // 10 — Write_Research_Notes (2.6s — standing note-writing motion into notebook, distinct from typing)
  clips.push(
    new THREE.AnimationClip('Write_Research_Notes', 2.6, [
      posTrack('Hips', [0, 1.3, 2.6], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.01, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.3, 2.6], [
        [0.06, -0.03, 0],
        [0.08, 0.02, 0],
        [0.06, -0.03, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.7, 2.6], [
        [0.22, 0.04, 0.02],
        [0.24, -0.04, -0.01],
        [0.20, 0.06, 0.02],
        [0.22, 0.04, 0.02],
      ]),
      // Left hand scribes across the notebook held in right hand
      quatTrack('Arm_Left', [0, 0.35, 0.7, 1.05, 1.4, 1.8, 2.2, 2.6], [
        [-1.18, 0.36, 0.10],
        [-1.24, 0.44, 0.12],
        [-1.16, 0.34, 0.10],
        [-1.25, 0.42, 0.12],
        [-1.18, 0.36, 0.10],
        [-1.24, 0.44, 0.12],
        [-1.16, 0.34, 0.10],
        [-1.18, 0.36, 0.10],
      ]),
      quatTrack('Arm_Right', [0, 1.3, 2.6], [
        [-1.14, -0.26, -0.08],
        [-1.16, -0.28, -0.08],
        [-1.14, -0.26, -0.08],
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

  // 11 — Think_Research (3.0s — thoughtful academic pose with head tilt & hand-to-chin gesture)
  clips.push(
    new THREE.AnimationClip('Think_Research', 3.0, [
      posTrack('Hips', [0, 1.5, 3.0], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.01, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.5, 3.0], [
        [0.02, 0.03, 0],
        [-0.01, -0.02, 0.015],
        [0.02, 0.03, 0],
      ]),
      quatTrack('Head', [0, 1.0, 2.1, 3.0], [
        [-0.06, 0.06, 0.05],
        [-0.10, -0.05, 0.06],
        [-0.04, 0.04, 0.04],
        [-0.06, 0.06, 0.05],
      ]),
      // Left hand raised to beard/chin in scholarly contemplation
      quatTrack('Arm_Left', [0, 1.0, 2.0, 3.0], [
        [-1.48, 0.38, 0.14],
        [-1.54, 0.42, 0.16],
        [-1.46, 0.36, 0.14],
        [-1.48, 0.38, 0.14],
      ]),
      quatTrack('Arm_Right', [0, 1.5, 3.0], [
        [-1.08, -0.24, -0.08],
        [-1.12, -0.26, -0.08],
        [-1.08, -0.24, -0.08],
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

  // 12 — Discuss_Research (2.8s — natural scholarly conversation gesture)
  clips.push(
    new THREE.AnimationClip('Discuss_Research', 2.8, [
      posTrack('Hips', [0, 1.4, 2.8], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.012, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 0.9, 1.9, 2.8], [
        [0.02, -0.04, 0],
        [0.04, 0.05, 0],
        [0.01, -0.02, 0],
        [0.02, -0.04, 0],
      ]),
      quatTrack('Head', [0, 0.7, 1.4, 2.1, 2.8], [
        [0.03, -0.06, 0.02],
        [-0.04, 0.07, -0.02],
        [0.05, -0.04, 0.01],
        [-0.02, 0.05, 0],
        [0.03, -0.06, 0.02],
      ]),
      quatTrack('Arm_Left', [0, 0.7, 1.4, 2.1, 2.8], [
        [-0.78, 0.14, 0.10],
        [-1.16, -0.08, 0.16],
        [-0.86, 0.18, 0.12],
        [-1.08, -0.04, 0.14],
        [-0.78, 0.14, 0.10],
      ]),
      quatTrack('Arm_Right', [0, 1.4, 2.8], [
        [-1.10, -0.22, -0.08],
        [-1.18, -0.26, -0.08],
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

  // 13 — Present_Findings (3.0s — clear presentation gesture pointing to Knowledge Atlas regions)
  clips.push(
    new THREE.AnimationClip('Present_Findings', 3.0, [
      posTrack('Hips', [0, 1.5, 3.0], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.014, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.0, 2.0, 3.0], [
        [0.02, 0.06, 0],
        [-0.02, -0.10, 0],
        [0.03, 0.04, 0],
        [0.02, 0.06, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.6, 2.4, 3.0], [
        [0.02, 0.08, 0],
        [-0.08, -0.18, 0.02],
        [-0.04, 0.10, -0.02],
        [0.04, 0.02, 0],
        [0.02, 0.08, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.8, 1.6, 2.3, 3.0], [
        [-0.95, 0.18, 0.12],
        [-1.68, 0.28, 0.24],
        [-1.45, 0.12, 0.18],
        [-1.62, 0.24, 0.22],
        [-0.95, 0.18, 0.12],
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

  // 14 — Consult_Shared_Brain_Demo (3.2s — distinct 3-layer Shared Brain inspection & tablet cross-check)
  clips.push(
    new THREE.AnimationClip('Consult_Shared_Brain_Demo', 3.2, [
      posTrack('Hips', [0, 1.6, 3.2], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.014, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 1.0, 2.1, 3.2], [
        [-0.03, -0.08, 0],
        [-0.04, 0.08, 0],
        [0.04, 0.02, 0],
        [-0.03, -0.08, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.6, 2.4, 3.2], [
        [-0.16, -0.14, 0.02],
        [-0.18, 0.14, -0.02],
        [0.18, 0.04, 0],
        [-0.12, 0.02, 0.02],
        [-0.16, -0.14, 0.02],
      ]),
      quatTrack('Arm_Left', [0, 0.9, 1.8, 2.5, 3.2], [
        [-1.32, 0.16, 0.10],
        [-1.56, -0.12, 0.14],
        [-1.12, 0.28, 0.08],
        [-1.44, 0.06, 0.12],
        [-1.32, 0.16, 0.10],
      ]),
      quatTrack('Arm_Right', [0, 1.6, 3.2], [
        [-1.14, -0.24, -0.08],
        [-1.22, -0.28, -0.08],
        [-1.14, -0.24, -0.08],
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

  // 15 — Prepare_Research_Summary (2.6s — seated at reading table reading document & drafting summary)
  clips.push(
    new THREE.AnimationClip('Prepare_Research_Summary', 2.6, [
      posTrack('Hips', [0, 1.3, 2.6], [
        [0, hipSeatY, 0],
        [0, hipSeatY + 0.007, 0],
        [0, hipSeatY, 0],
      ]),
      quatTrack('Torso', [0, 1.3, 2.6], [
        [0.09, 0, 0],
        [0.11, -0.03, 0],
        [0.09, 0, 0],
      ]),
      quatTrack('Head', [0, 0.8, 1.7, 2.6], [
        [0.20, -0.06, 0],
        [0.22, 0.06, 0.01],
        [0.18, -0.04, 0],
        [0.20, -0.06, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.4, 0.8, 1.3, 1.8, 2.2, 2.6], [
        [-1.14, 0.22, 0.06],
        [-1.22, 0.28, 0.08],
        [-1.12, 0.20, 0.06],
        [-1.24, 0.26, 0.08],
        [-1.14, 0.22, 0.06],
        [-1.20, 0.26, 0.08],
        [-1.14, 0.22, 0.06],
      ]),
      quatTrack('Arm_Right', [0, 1.3, 2.6], [
        [-1.12, -0.20, -0.06],
        [-1.16, -0.22, -0.06],
        [-1.12, -0.20, -0.06],
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

  // 16 — Coffee_Break (3.2s — standing modest coffee sipping gesture)
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

  // 17 — Waiting_For_Review (2.8s — calm waiting pose holding dossier / checking notes)
  clips.push(
    new THREE.AnimationClip('Waiting_For_Review', 2.8, [
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
        [0.10, -0.05, 0],
        [0.02, 0.06, 0],
        [0.12, 0.02, 0],
        [0.10, -0.05, 0],
      ]),
      quatTrack('Arm_Left', [0, 1.4, 2.8], [
        [-0.92, 0.22, 0.08],
        [-1.02, 0.26, 0.08],
        [-0.92, 0.22, 0.08],
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

  // 18 — Research_Completed (2.4s — professional positive acknowledgment & warm academic nod)
  clips.push(
    new THREE.AnimationClip('Research_Completed', 2.4, [
      posTrack('Hips', [0, 0.6, 1.2, 2.4], [
        [0, hipStandY, 0],
        [0, hipStandY + 0.022, 0],
        [0, hipStandY + 0.010, 0],
        [0, hipStandY, 0],
      ]),
      quatTrack('Torso', [0, 0.7, 1.5, 2.4], [
        [0, 0, 0],
        [-0.04, 0.04, 0],
        [0.02, -0.02, 0],
        [0, 0, 0],
      ]),
      quatTrack('Head', [0, 0.5, 1.0, 1.6, 2.4], [
        [0, 0, 0],
        [0.15, 0.03, 0],
        [-0.04, 0.03, 0],
        [0.12, 0, 0],
        [0, 0, 0],
      ]),
      quatTrack('Arm_Left', [0, 0.8, 1.6, 2.4], [
        [-0.45, 0.14, 0.08],
        [-1.28, 0.18, 0.14],
        [-1.12, 0.14, 0.10],
        [-0.45, 0.14, 0.08],
      ]),
      quatTrack('Arm_Right', [0, 1.2, 2.4], [
        [-1.12, -0.22, -0.08],
        [-1.20, -0.26, -0.08],
        [-1.12, -0.22, -0.08],
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
 * Exports a clean standalone `research_professor_agent.glb` binary ArrayBuffer
 * with `Research_Professor_Agent_Root` at `[0, 0, 0]`, rest pose, hidden handheld props,
 * visible black rectangular glasses, visible Shared Brain backpack, and all 20 embedded
 * `THREE.AnimationClip`s.
 */
export async function exportResearchProfessorToGLBBuffer(): Promise<ArrayBuffer> {
  const built = buildResearchProfessorSceneAndClips();
  built.root.position.set(0, 0, 0);
  built.root.rotation.set(0, 0, 0);
  built.root.scale.set(1, 1, 1);

  for (const propGroup of Object.values(built.propsById)) {
    propGroup.visible = false;
  }
  built.glassesGroup.visible = true;
  built.backpackGroup.visible = true;
  built.root.updateMatrixWorld(true);

  const exportScene = new THREE.Scene();
  exportScene.name = 'Research_Professor_Agent_Export_Scene';
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
            new Error('Expected binary GLB ArrayBuffer from GLTFExporter for Research Professor.'),
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

export interface ResearchSimulationHelpersGroup {
  helpersRoot: THREE.Group;
  pathLine: THREE.Line;
  targetRing: THREE.Mesh;
  updatePathVisual: (
    points: [number, number][],
    targetPos: [number, number, number],
    visible: boolean,
  ) => void;
}

export function buildResearchSimulationHelpersGroup(): ResearchSimulationHelpersGroup {
  const helpersRoot = new THREE.Group();
  helpersRoot.name = 'PREVIEW_ONLY_RESEARCH_SIM_HELPERS';

  const lineGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(3.85, 0.03, 3.65),
    new THREE.Vector3(5.65, 0.03, 4.88),
  ]);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x4ade80,
    transparent: true,
    opacity: 0.85,
  });
  const pathLine = new THREE.Line(lineGeom, lineMat);
  pathLine.name = 'Research_Nav_Path_Line';
  pathLine.visible = false;
  helpersRoot.add(pathLine);

  const ringGeom = new THREE.RingGeometry(0.18, 0.25, 24);
  ringGeom.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x4ade80,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.78,
  });
  const targetRing = new THREE.Mesh(ringGeom, ringMat);
  targetRing.name = 'Research_Target_Ring';
  targetRing.position.set(3.85, 0.022, 3.65);
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

export interface ResearchCharacterRuntimeInstance {
  runtimeRoot: THREE.Group;
  characterRoot: THREE.Group;
  rig: BuiltResearchProfessorRig;
  mixer: THREE.AnimationMixer;
  triggerAction: (actionId: ResearchActionId) => void;
  executePlayback: (cmd: ResearchAnimationPlaybackCommand) => void;
  setSpeedMultiplier: (speed: ResearchSpeedMultiplier) => void;
  setPatrolActive: (enabled: boolean) => void;
  startAutoDemo: () => void;
  stopAutoDemo: () => void;
  setExpression: (exprId: ResearchExpressionId) => void;
  setGlassesVisible: (visible: boolean) => void;
  setBackpackVisible: (visible: boolean) => void;
  update: (dt: number) => void;
  getStatus: () => ResearchSimulationRuntimeStatus;
  getActivePathPoints: () => [number, number][];
}

function normalizeAngleDiff(target: number, current: number): number {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

/**
 * Creates the interactive Research Professor runtime controller inside `AI_OFFICE_ROOM_RESEARCH_v1`.
 * Spawns by default at `RESEARCH_ROOM_IDLE` (`[3.85, 0, 3.65]`) facing South (`Math.PI`).
 */
export function createResearchProfessorRuntime(
  onStatusChange?: (status: ResearchSimulationRuntimeStatus) => void,
): ResearchCharacterRuntimeInstance {
  const rig = buildResearchProfessorSceneAndClips();

  const runtimeRoot = new THREE.Group();
  runtimeRoot.name = RESEARCH_CHARACTER_CONSTANTS.RUNTIME_ROOT_NAME;
  runtimeRoot.add(rig.root);

  const defaultAnchor = getResearchAnchorOrThrow(RESEARCH_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR);
  runtimeRoot.position.set(
    defaultAnchor.position[0],
    defaultAnchor.position[1],
    defaultAnchor.position[2],
  );
  runtimeRoot.rotation.set(0, defaultAnchor.rotationY, 0);

  const mixer = new THREE.AnimationMixer(rig.root);
  const actionsByName = new Map<ResearchAnimationClipName, THREE.AnimationAction>();
  for (const clip of rig.clips) {
    const act = mixer.clipAction(clip);
    actionsByName.set(clip.name as ResearchAnimationClipName, act);
  }

  let currentActionSpec: ResearchActionSpec = RESEARCH_ACTIONS.IDLE;
  let currentState: ResearchAgentState = 'IDLE';
  let activeClipName: ResearchAnimationClipName = 'Idle_Breathing';
  let currentAnchorId: ResearchAnchorType = RESEARCH_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR;
  let targetAnchorId: ResearchAnchorType = RESEARCH_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR;
  let currentExpression: ResearchExpressionId = 'neutral';
  let handheldProp: ResearchPropId = 'none';
  let isWalking = false;
  let isPaused = false;
  let patrolActive = false;
  let patrolRingIdx = 0;
  let patrolHoldTimer = 0;
  let autoDemoActive = false;
  let autoDemoStepIdx = 0;
  let autoDemoHoldTimer = 0;
  let speedMultiplier: ResearchSpeedMultiplier = 1;
  let userGlassesVisible = true;
  let userBackpackVisible = true;
  let backpackAutoHiddenForSeat = false;
  let activePath: [number, number][] = [];
  let targetFacingRad = defaultAnchor.rotationY;
  let completedReturnTimer = 0;

  const baseEyeScaleY = 1.0;
  const basePupilLeftPos: [number, number] = [-0.074, 0.210];
  const basePupilRightPos: [number, number] = [0.074, 0.210];
  const baseBrowY = 0.268;
  const baseMouthY = 0.112;

  const applyExpression = (exprId: ResearchExpressionId) => {
    currentExpression = exprId;
    const preset = RESEARCH_EXPRESSION_PRESETS[exprId] ?? RESEARCH_EXPRESSION_PRESETS.neutral;
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

  const applyPropVisibility = (prop: ResearchPropId) => {
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

  const playClip = (clipName: ResearchAnimationClipName, loop = true) => {
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

  const beginActionExecution = (spec: ResearchActionSpec, fromDemoOrPatrol = false) => {
    if (!fromDemoOrPatrol) {
      autoDemoActive = false;
      if (spec.id !== 'WALK_PATROL') {
        patrolActive = false;
      }
    }

    currentActionSpec = spec;
    targetAnchorId = spec.targetAnchorName;
    completedReturnTimer = 0;

    const anchor =
      DEFAULT_RESEARCH_ANCHORS.find((a) => a.id === spec.targetAnchorName) ?? defaultAnchor;
    const startXZ: [number, number] = [runtimeRoot.position.x, runtimeRoot.position.z];
    const goalXZ: [number, number] = [anchor.position[0], anchor.position[2]];
    const dist = Math.hypot(goalXZ[0] - startXZ[0], goalXZ[1] - startXZ[1]);

    targetFacingRad = anchor.rotationY;

    if (dist > RESEARCH_CHARACTER_CONSTANTS.ARRIVAL_THRESHOLD_M) {
      isWalking = true;
      currentState = 'MOVING';
      activePath = findResearchWalkablePath(startXZ, goalXZ);
      applyPropVisibility('none');
      applyExpression('neutral');
      syncBackpackSeatVisibility();
      playClip('Walk_Cycle', true);
    } else {
      isWalking = false;
      activePath = [];
      runtimeRoot.position.set(anchor.position[0], 0, anchor.position[2]);
      runtimeRoot.rotation.y = anchor.rotationY;
      currentAnchorId = anchor.id;
      currentState = spec.agentState;
      applyPropVisibility(spec.prop);
      applyExpression(spec.expression);
      syncBackpackSeatVisibility();
      playClip(spec.clipName, spec.loopAction);
      if (spec.id === 'RESEARCH_COMPLETED' && !autoDemoActive) {
        completedReturnTimer = 2.6;
      }
    }

    emitStatus();
  };

  const triggerAction = (actionId: ResearchActionId) => {
    if (actionId === 'WALK_PATROL') {
      patrolActive = true;
      autoDemoActive = false;
      patrolRingIdx = 0;
      patrolHoldTimer = 0;
      const firstAnchorName = RESEARCH_PATROL_ANCHOR_RING[0];
      beginActionExecution(
        {
          ...RESEARCH_ACTIONS.WALK_PATROL,
          targetAnchorName: firstAnchorName,
        },
        true,
      );
      return;
    }

    const spec = RESEARCH_ACTIONS[actionId] ?? RESEARCH_ACTIONS.IDLE;
    beginActionExecution(spec, false);
  };

  const executePlayback = (cmd: ResearchAnimationPlaybackCommand) => {
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
      completedReturnTimer = 0;
      mixer.timeScale = speedMultiplier;
      const idleAnchor = getResearchAnchorOrThrow(RESEARCH_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR);
      runtimeRoot.position.set(idleAnchor.position[0], 0, idleAnchor.position[2]);
      runtimeRoot.rotation.set(0, idleAnchor.rotationY, 0);
      currentActionSpec = RESEARCH_ACTIONS.IDLE;
      currentState = 'IDLE';
      currentAnchorId = idleAnchor.id;
      targetAnchorId = idleAnchor.id;
      applyPropVisibility('none');
      applyExpression('neutral');
      syncBackpackSeatVisibility();
      playClip('Idle_Breathing', true);
    }
    emitStatus();
  };

  const setSpeedMultiplier = (speed: ResearchSpeedMultiplier) => {
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
      beginActionExecution(RESEARCH_ACTIONS.IDLE, false);
    }
  };

  const startAutoDemo = () => {
    autoDemoActive = true;
    patrolActive = false;
    isPaused = false;
    completedReturnTimer = 0;
    mixer.timeScale = speedMultiplier;
    autoDemoStepIdx = 0;
    autoDemoHoldTimer = 0;
    const step = RESEARCH_AUTO_DEMO_SEQUENCE[0];
    beginActionExecution(RESEARCH_ACTIONS[step.actionId], true);
  };

  const stopAutoDemo = () => {
    autoDemoActive = false;
    autoDemoHoldTimer = 0;
    beginActionExecution(RESEARCH_ACTIONS.IDLE, false);
  };

  const setExpression = (exprId: ResearchExpressionId) => {
    applyExpression(exprId);
    emitStatus();
  };

  const setGlassesVisible = (visible: boolean) => {
    userGlassesVisible = visible;
    rig.glassesGroup.visible = userGlassesVisible;
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
      const stepDist = RESEARCH_CHARACTER_CONSTANTS.WALK_SPEED_MPS * scaledDt;

      if (dist > 0.005) {
        const moveHeading = Math.atan2(dx, dz);
        const angleDiff = normalizeAngleDiff(moveHeading, runtimeRoot.rotation.y);
        runtimeRoot.rotation.y +=
          angleDiff * Math.min(1, RESEARCH_CHARACTER_CONSTANTS.ROTATION_LERP_RATE * scaledDt);
      }

      if (dist <= Math.max(RESEARCH_CHARACTER_CONSTANTS.ARRIVAL_THRESHOLD_M, stepDist)) {
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
            if (currentActionSpec.id === 'RESEARCH_COMPLETED' && !autoDemoActive) {
              completedReturnTimer = 2.6;
            }
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
          angleDiff * Math.min(1, RESEARCH_CHARACTER_CONSTANTS.ROTATION_LERP_RATE * scaledDt);
      }

      if (completedReturnTimer > 0 && !autoDemoActive && !patrolActive) {
        completedReturnTimer -= scaledDt;
        if (completedReturnTimer <= 0) {
          completedReturnTimer = 0;
          currentActionSpec = RESEARCH_ACTIONS.IDLE;
          currentState = 'IDLE';
          applyPropVisibility('none');
          applyExpression('neutral');
          syncBackpackSeatVisibility();
          playClip('Idle_Breathing', true);
          emitStatus();
        }
      }

      if (patrolActive) {
        patrolHoldTimer += scaledDt;
        if (patrolHoldTimer >= 1.6) {
          patrolHoldTimer = 0;
          patrolRingIdx = (patrolRingIdx + 1) % RESEARCH_PATROL_ANCHOR_RING.length;
          const nextAnchor = RESEARCH_PATROL_ANCHOR_RING[patrolRingIdx];
          beginActionExecution(
            {
              ...RESEARCH_ACTIONS.WALK_PATROL,
              targetAnchorName: nextAnchor,
            },
            true,
          );
        }
      } else if (autoDemoActive) {
        const currentStep = RESEARCH_AUTO_DEMO_SEQUENCE[autoDemoStepIdx];
        autoDemoHoldTimer += scaledDt;
        if (currentStep && autoDemoHoldTimer >= currentStep.holdDurationSec) {
          autoDemoHoldTimer = 0;
          autoDemoStepIdx = (autoDemoStepIdx + 1) % RESEARCH_AUTO_DEMO_SEQUENCE.length;
          const nextStep = RESEARCH_AUTO_DEMO_SEQUENCE[autoDemoStepIdx];
          beginActionExecution(RESEARCH_ACTIONS[nextStep.actionId], true);
        }
      }
    }
  };

  const getStatus = (): ResearchSimulationRuntimeStatus => ({
    characterId: RESEARCH_CHARACTER_CONSTANTS.CHARACTER_ID,
    displayName: RESEARCH_CHARACTER_CONSTANTS.DISPLAY_NAME,
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
    autoDemoTotalSteps: RESEARCH_AUTO_DEMO_SEQUENCE.length,
    speedMultiplier,
    glassesVisible: userGlassesVisible,
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
  rig.glassesGroup.visible = true;
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
