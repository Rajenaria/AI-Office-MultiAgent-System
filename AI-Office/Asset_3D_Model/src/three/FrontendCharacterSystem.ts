import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import {
  DEFAULT_ENGINEERING_ANCHORS,
  EngineeringAnchorId,
  EngineeringAnchorSpec,
} from '../domain/engineeringRoomSpec';
import {
  FRONTEND_ACTIONS,
  FRONTEND_AUTO_DEMO_SEQUENCE,
  FRONTEND_CHARACTER_CONSTANTS,
  FRONTEND_EXPRESSION_PRESETS,
  FRONTEND_PATROL_ANCHORS,
  FRONTEND_REQUIRED_ANIMATION_CLIPS,
  FrontendActionId,
  FrontendAnimationPlaybackCommand,
  FrontendExpressionId,
  FrontendHandheldPropId,
  FrontendRequiredClipName,
  FrontendSimulationRuntimeStatus,
  FrontendSimulationStateId,
  FrontendSpeedMultiplier,
  findFrontendWalkablePath,
} from '../domain/frontendSimulationSpec';

function makeVoxelMat(
  name: string,
  hex: number,
  roughness = 0.78,
  metalness = 0.05
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    name,
    color: hex,
    roughness,
    metalness,
  });
}

function addVoxelBox(
  parent: THREE.Object3D,
  name: string,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  mat: THREE.Material
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export interface FrontendCharacterVisualRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  hairGroup: THREE.Group;
  faceGroup: THREE.Group;
  glassesGroup: THREE.Group;
  headphonesGroup: THREE.Group;
  backpackGroup: THREE.Group;
  leftEyeWhite: THREE.Mesh;
  rightEyeWhite: THREE.Mesh;
  leftPupil: THREE.Mesh;
  rightPupil: THREE.Mesh;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  mouth: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftHandPropAnchor: THREE.Group;
  rightHandPropAnchor: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  props: {
    grayLaptop: THREE.Group;
    smartphone: THREE.Group;
    coffeeCup: THREE.Group;
    techDocument: THREE.Group;
    debugTablet: THREE.Group;
  };
  clips: THREE.AnimationClip[];
}

function quatKeyframesFromEuler(
  angles: Array<[number, number, number]>
): number[] {
  const out: number[] = [];
  const e = new THREE.Euler(0, 0, 0, 'XYZ');
  const q = new THREE.Quaternion();
  for (const [rx, ry, rz] of angles) {
    e.set(rx, ry, rz, 'XYZ');
    q.setFromEuler(e);
    out.push(q.x, q.y, q.z, q.w);
  }
  return out;
}

function vecKeyframes(vecs: Array<[number, number, number]>): number[] {
  const out: number[] = [];
  for (const [x, y, z] of vecs) {
    out.push(x, y, z);
  }
  return out;
}

/**
 * Builds the 16 required embedded `THREE.AnimationClip`s for `frontend_developer_agent.glb`.
 */
function buildFrontendCharacterAnimationClips(): THREE.AnimationClip[] {
  const clips: THREE.AnimationClip[] = [];

  const restPoseTracks = (
    duration: number,
    overrides: Partial<
      Record<
        'HipsPos' | 'HipsRot' | 'TorsoRot' | 'HeadRot' | 'ArmLRot' | 'ArmRRot' | 'LegLRot' | 'LegRRot',
        THREE.KeyframeTrack
      >
    >
  ): THREE.KeyframeTrack[] => {
    const t2 = [0, duration];
    const defaults: Record<string, THREE.KeyframeTrack> = {
      HipsPos: new THREE.VectorKeyframeTrack(
        'Hips.position',
        t2,
        vecKeyframes([
          [0, 0.72, 0],
          [0, 0.72, 0],
        ])
      ),
      HipsRot: new THREE.QuaternionKeyframeTrack(
        'Hips.quaternion',
        t2,
        quatKeyframesFromEuler([
          [0, 0, 0],
          [0, 0, 0],
        ])
      ),
      TorsoRot: new THREE.QuaternionKeyframeTrack(
        'Torso.quaternion',
        t2,
        quatKeyframesFromEuler([
          [0, 0, 0],
          [0, 0, 0],
        ])
      ),
      HeadRot: new THREE.QuaternionKeyframeTrack(
        'Head.quaternion',
        t2,
        quatKeyframesFromEuler([
          [0, 0, 0],
          [0, 0, 0],
        ])
      ),
      ArmLRot: new THREE.QuaternionKeyframeTrack(
        'Arm_Left.quaternion',
        t2,
        quatKeyframesFromEuler([
          [0, 0, 0.04],
          [0, 0, 0.04],
        ])
      ),
      ArmRRot: new THREE.QuaternionKeyframeTrack(
        'Arm_Right.quaternion',
        t2,
        quatKeyframesFromEuler([
          [0, 0, -0.04],
          [0, 0, -0.04],
        ])
      ),
      LegLRot: new THREE.QuaternionKeyframeTrack(
        'Leg_Left.quaternion',
        t2,
        quatKeyframesFromEuler([
          [0, 0, 0],
          [0, 0, 0],
        ])
      ),
      LegRRot: new THREE.QuaternionKeyframeTrack(
        'Leg_Right.quaternion',
        t2,
        quatKeyframesFromEuler([
          [0, 0, 0],
          [0, 0, 0],
        ])
      ),
    };
    return Object.keys(defaults).map(
      (k) => overrides[k as keyof typeof overrides] ?? defaults[k]
    );
  };

  // 1. Idle_Breathing (2.8s calm developer standing idle)
  {
    const d = 2.8;
    const t = [0, 0.7, 1.4, 2.1, d];
    clips.push(
      new THREE.AnimationClip(
        'Idle_Breathing',
        d,
        restPoseTracks(d, {
          HipsPos: new THREE.VectorKeyframeTrack(
            'Hips.position',
            t,
            vecKeyframes([
              [0, 0.72, 0],
              [0, 0.725, 0],
              [0, 0.72, 0],
              [0, 0.724, 0],
              [0, 0.72, 0],
            ])
          ),
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0, 0, 0],
              [-0.015, 0.02, 0],
              [0, 0, 0],
              [-0.012, -0.02, 0],
              [0, 0, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0, 0, 0],
              [0.02, 0.04, 0],
              [0, 0, 0],
              [0.015, -0.04, 0],
              [0, 0, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.02, 0, 0.04],
              [-0.02, 0, 0.05],
              [0.02, 0, 0.04],
              [-0.015, 0, 0.05],
              [0.02, 0, 0.04],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.02, 0, -0.04],
              [0.02, 0, -0.05],
              [-0.02, 0, -0.04],
              [0.015, 0, -0.05],
              [-0.02, 0, -0.04],
            ])
          ),
        })
      )
    );
  }

  // 2. Walk_Cycle (1.0s balanced voxel walk cycle)
  {
    const d = 1.0;
    const t = [0, 0.25, 0.5, 0.75, d];
    clips.push(
      new THREE.AnimationClip(
        'Walk_Cycle',
        d,
        restPoseTracks(d, {
          HipsPos: new THREE.VectorKeyframeTrack(
            'Hips.position',
            t,
            vecKeyframes([
              [0, 0.72, 0],
              [0, 0.742, 0],
              [0, 0.72, 0],
              [0, 0.742, 0],
              [0, 0.72, 0],
            ])
          ),
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.04, -0.06, 0],
              [0.05, 0, 0.02],
              [0.04, 0.06, 0],
              [0.05, 0, -0.02],
              [0.04, -0.06, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0, 0.04, 0],
              [-0.02, 0, 0],
              [0, -0.04, 0],
              [-0.02, 0, 0],
              [0, 0.04, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.44, 0, 0.05],
              [0, 0, 0.05],
              [-0.44, 0, 0.05],
              [0, 0, 0.05],
              [0.44, 0, 0.05],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.44, 0, -0.05],
              [0, 0, -0.05],
              [0.44, 0, -0.05],
              [0, 0, -0.05],
              [-0.44, 0, -0.05],
            ])
          ),
          LegLRot: new THREE.QuaternionKeyframeTrack(
            'Leg_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.48, 0, 0],
              [0, 0, 0],
              [0.48, 0, 0],
              [0, 0, 0],
              [-0.48, 0, 0],
            ])
          ),
          LegRRot: new THREE.QuaternionKeyframeTrack(
            'Leg_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.48, 0, 0],
              [0, 0, 0],
              [-0.48, 0, 0],
              [0, 0, 0],
              [0.48, 0, 0],
            ])
          ),
        })
      )
    );
  }

  // 3. Work_Typing (1.6s seated keyboard coding at FE_DESK_WORK)
  {
    const d = 1.6;
    const t = [0, 0.25, 0.5, 0.8, 1.1, 1.35, d];
    const seatedPos: Array<[number, number, number]> = t.map(() => [0, 0.57, -0.14]);
    const seatedLegs: Array<[number, number, number]> = t.map(() => [-1.18, 0, 0]);
    clips.push(
      new THREE.AnimationClip(
        'Work_Typing',
        d,
        restPoseTracks(d, {
          HipsPos: new THREE.VectorKeyframeTrack('Hips.position', t, vecKeyframes(seatedPos)),
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.12, 0, 0],
              [0.13, -0.02, 0],
              [0.12, 0.02, 0],
              [0.13, -0.01, 0],
              [0.12, 0.02, 0],
              [0.13, -0.02, 0],
              [0.12, 0, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.06, -0.05, 0],
              [0.08, 0.02, 0],
              [0.05, 0.06, 0],
              [0.07, -0.03, 0],
              [0.06, 0.05, 0],
              [0.08, -0.02, 0],
              [0.06, -0.05, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-1.12, 0.16, 0.06],
              [-1.22, 0.18, 0.06],
              [-1.1, 0.14, 0.06],
              [-1.24, 0.19, 0.06],
              [-1.13, 0.15, 0.06],
              [-1.21, 0.17, 0.06],
              [-1.12, 0.16, 0.06],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-1.22, -0.16, -0.06],
              [-1.11, -0.14, -0.06],
              [-1.24, -0.18, -0.06],
              [-1.12, -0.15, -0.06],
              [-1.23, -0.19, -0.06],
              [-1.12, -0.15, -0.06],
              [-1.22, -0.16, -0.06],
            ])
          ),
          LegLRot: new THREE.QuaternionKeyframeTrack(
            'Leg_Left.quaternion',
            t,
            quatKeyframesFromEuler(seatedLegs)
          ),
          LegRRot: new THREE.QuaternionKeyframeTrack(
            'Leg_Right.quaternion',
            t,
            quatKeyframesFromEuler(seatedLegs)
          ),
        })
      )
    );
  }

  // 4. Review_UI_Implementation (2.6s seated inspecting primary & secondary Frontend displays)
  {
    const d = 2.6;
    const t = [0, 0.65, 1.3, 1.95, d];
    const seatedPos: Array<[number, number, number]> = t.map(() => [0, 0.57, -0.14]);
    const seatedLegs: Array<[number, number, number]> = t.map(() => [-1.18, 0, 0]);
    clips.push(
      new THREE.AnimationClip(
        'Review_UI_Implementation',
        d,
        restPoseTracks(d, {
          HipsPos: new THREE.VectorKeyframeTrack('Hips.position', t, vecKeyframes(seatedPos)),
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.08, -0.06, 0],
              [0.12, 0.08, 0],
              [0.1, 0.12, 0],
              [0.08, -0.04, 0],
              [0.08, -0.06, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.04, -0.14, 0],
              [-0.06, 0.18, 0.02],
              [0.04, 0.22, 0],
              [-0.03, -0.08, -0.02],
              [-0.04, -0.14, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-1.08, 0.14, 0.06],
              [-1.06, 0.14, 0.06],
              [-1.1, 0.16, 0.06],
              [-1.08, 0.14, 0.06],
              [-1.08, 0.14, 0.06],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-1.14, -0.14, -0.06],
              [-1.42, -0.06, -0.08],
              [-1.48, 0.05, -0.08],
              [-1.18, -0.12, -0.06],
              [-1.14, -0.14, -0.06],
            ])
          ),
          LegLRot: new THREE.QuaternionKeyframeTrack(
            'Leg_Left.quaternion',
            t,
            quatKeyframesFromEuler(seatedLegs)
          ),
          LegRRot: new THREE.QuaternionKeyframeTrack(
            'Leg_Right.quaternion',
            t,
            quatKeyframesFromEuler(seatedLegs)
          ),
        })
      )
    );
  }

  // 5. Debug_Frontend (3.0s distinct lean-in, pause, hand-to-chin think, return to keyboard)
  {
    const d = 3.0;
    const t = [0, 0.6, 1.25, 1.9, 2.45, d];
    const seatedPos: Array<[number, number, number]> = t.map(() => [0, 0.57, -0.14]);
    const seatedLegs: Array<[number, number, number]> = t.map(() => [-1.18, 0, 0]);
    clips.push(
      new THREE.AnimationClip(
        'Debug_Frontend',
        d,
        restPoseTracks(d, {
          HipsPos: new THREE.VectorKeyframeTrack('Hips.position', t, vecKeyframes(seatedPos)),
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.14, 0, 0],
              [0.24, -0.04, 0],
              [0.22, 0.04, 0.03],
              [0.18, -0.03, -0.02],
              [0.14, 0.02, 0],
              [0.14, 0, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.04, 0, 0],
              [-0.08, -0.1, 0.05],
              [-0.05, 0.12, -0.06],
              [0.08, -0.05, 0.04],
              [0.06, 0.04, 0],
              [0.04, 0, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-1.14, 0.16, 0.06],
              [-1.08, 0.18, 0.06],
              [-1.06, 0.18, 0.06],
              [-1.18, 0.16, 0.06],
              [-1.24, 0.18, 0.06],
              [-1.14, 0.16, 0.06],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-1.16, -0.16, -0.06],
              [-1.68, -0.28, -0.12],
              [-1.72, -0.32, -0.14],
              [-1.22, -0.16, -0.06],
              [-1.12, -0.14, -0.06],
              [-1.16, -0.16, -0.06],
            ])
          ),
          LegLRot: new THREE.QuaternionKeyframeTrack(
            'Leg_Left.quaternion',
            t,
            quatKeyframesFromEuler(seatedLegs)
          ),
          LegRRot: new THREE.QuaternionKeyframeTrack(
            'Leg_Right.quaternion',
            t,
            quatKeyframesFromEuler(seatedLegs)
          ),
        })
      )
    );
  }

  // 6. Test_Responsive_Layout (2.6s comparing mobile tablet viewport & desktop display)
  {
    const d = 2.6;
    const t = [0, 0.65, 1.3, 1.95, d];
    clips.push(
      new THREE.AnimationClip(
        'Test_Responsive_Layout',
        d,
        restPoseTracks(d, {
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.04, -0.08, 0],
              [0.06, 0.1, 0],
              [0.04, 0.12, 0],
              [0.05, -0.06, 0],
              [0.04, -0.08, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.16, -0.12, 0],
              [-0.05, 0.16, 0],
              [-0.04, 0.2, 0.02],
              [0.14, -0.08, 0],
              [0.16, -0.12, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.98, 0.24, 0.08],
              [-0.92, 0.22, 0.08],
              [-0.95, 0.24, 0.08],
              [-1.0, 0.25, 0.08],
              [-0.98, 0.24, 0.08],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.92, -0.22, -0.08],
              [-1.38, 0.06, -0.12],
              [-1.42, 0.1, -0.12],
              [-0.96, -0.2, -0.08],
              [-0.92, -0.22, -0.08],
            ])
          ),
        })
      )
    );
  }

  // 7. Review_API_Contract (2.6s inspecting API schema board while holding tech document)
  {
    const d = 2.6;
    const t = [0, 0.65, 1.3, 1.95, d];
    clips.push(
      new THREE.AnimationClip(
        'Review_API_Contract',
        d,
        restPoseTracks(d, {
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.03, 0, 0],
              [0.05, -0.06, 0],
              [0.04, 0.06, 0],
              [0.05, -0.03, 0],
              [0.03, 0, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.06, -0.08, 0],
              [0.14, 0.06, 0],
              [-0.08, 0.1, 0],
              [0.12, -0.04, 0],
              [-0.06, -0.08, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.92, 0.22, 0.08],
              [-0.96, 0.24, 0.08],
              [-0.9, 0.2, 0.08],
              [-0.95, 0.23, 0.08],
              [-0.92, 0.22, 0.08],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-1.24, -0.08, -0.08],
              [-0.94, -0.18, -0.08],
              [-1.32, -0.04, -0.1],
              [-0.96, -0.16, -0.08],
              [-1.24, -0.08, -0.08],
            ])
          ),
        })
      )
    );
  }

  // 8. Discuss_Technical_Issue (2.4s standing developer explanation gestures)
  {
    const d = 2.4;
    const t = [0, 0.6, 1.2, 1.8, d];
    clips.push(
      new THREE.AnimationClip(
        'Discuss_Technical_Issue',
        d,
        restPoseTracks(d, {
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.03, -0.05, 0],
              [0.04, 0.07, 0],
              [0.02, -0.04, 0],
              [0.04, 0.05, 0],
              [0.03, -0.05, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.02, -0.08, 0],
              [-0.03, 0.1, 0.02],
              [0.04, -0.06, -0.02],
              [-0.02, 0.08, 0],
              [0.02, -0.08, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.68, 0.16, 0.12],
              [-0.94, 0.08, 0.18],
              [-0.58, 0.2, 0.1],
              [-0.88, 0.12, 0.16],
              [-0.68, 0.16, 0.12],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.86, -0.12, -0.16],
              [-0.56, -0.2, -0.1],
              [-0.98, -0.08, -0.18],
              [-0.64, -0.16, -0.12],
              [-0.86, -0.12, -0.16],
            ])
          ),
        })
      )
    );
  }

  // 9. Present_Component (2.6s pointing toward Architecture / UI display while holding tablet)
  {
    const d = 2.6;
    const t = [0, 0.65, 1.3, 1.95, d];
    clips.push(
      new THREE.AnimationClip(
        'Present_Component',
        d,
        restPoseTracks(d, {
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.02, -0.08, 0],
              [0.03, 0.12, 0],
              [0.02, 0.15, 0],
              [0.03, -0.04, 0],
              [0.02, -0.08, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.04, -0.1, 0],
              [-0.08, 0.16, 0],
              [-0.06, 0.2, 0.02],
              [0.02, -0.06, 0],
              [-0.04, -0.1, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.88, 0.22, 0.08],
              [-0.9, 0.22, 0.08],
              [-0.86, 0.2, 0.08],
              [-0.9, 0.22, 0.08],
              [-0.88, 0.22, 0.08],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-1.12, -0.1, -0.14],
              [-1.58, 0.08, -0.24],
              [-1.66, 0.12, -0.28],
              [-1.22, -0.08, -0.16],
              [-1.12, -0.1, -0.14],
            ])
          ),
        })
      )
    );
  }

  // 10. Read_Documentation (2.5s reading technical specification pad)
  {
    const d = 2.5;
    const t = [0, 0.65, 1.25, 1.9, d];
    clips.push(
      new THREE.AnimationClip(
        'Read_Documentation',
        d,
        restPoseTracks(d, {
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.06, 0, 0],
              [0.07, -0.03, 0],
              [0.06, 0.03, 0],
              [0.07, -0.02, 0],
              [0.06, 0, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.2, -0.06, 0],
              [0.22, 0.06, 0],
              [0.19, -0.05, 0],
              [0.22, 0.05, 0],
              [0.2, -0.06, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.98, 0.24, 0.08],
              [-1.0, 0.25, 0.08],
              [-0.97, 0.23, 0.08],
              [-1.0, 0.25, 0.08],
              [-0.98, 0.24, 0.08],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.92, -0.22, -0.08],
              [-1.06, -0.18, -0.08],
              [-0.9, -0.22, -0.08],
              [-1.04, -0.19, -0.08],
              [-0.92, -0.22, -0.08],
            ])
          ),
        })
      )
    );
  }

  // 11. Think_Plan (2.6s hand-to-chin developer architectural thinking)
  {
    const d = 2.6;
    const t = [0, 0.65, 1.3, 1.95, d];
    clips.push(
      new THREE.AnimationClip(
        'Think_Plan',
        d,
        restPoseTracks(d, {
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.02, -0.04, 0],
              [0.03, 0.04, 0.02],
              [0.02, 0.05, 0.02],
              [0.03, -0.03, 0],
              [0.02, -0.04, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.05, 0.06, 0.05],
              [-0.08, -0.05, 0.07],
              [-0.04, 0.08, 0.04],
              [-0.07, -0.04, 0.06],
              [-0.05, 0.06, 0.05],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.58, 0.36, 0.12],
              [-0.6, 0.38, 0.12],
              [-0.58, 0.36, 0.12],
              [-0.6, 0.38, 0.12],
              [-0.58, 0.36, 0.12],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-1.62, -0.28, -0.12],
              [-1.68, -0.3, -0.14],
              [-1.6, -0.26, -0.12],
              [-1.66, -0.29, -0.13],
              [-1.62, -0.28, -0.12],
            ])
          ),
        })
      )
    );
  }

  // 12. Phone_Call (2.4s holding smartphone to right ear)
  {
    const d = 2.4;
    const t = [0, 0.6, 1.2, 1.8, d];
    clips.push(
      new THREE.AnimationClip(
        'Phone_Call',
        d,
        restPoseTracks(d, {
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0, -0.05, 0],
              [0.02, 0.05, 0],
              [0, -0.04, 0],
              [0.02, 0.04, 0],
              [0, -0.05, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.02, -0.04, -0.04],
              [-0.02, 0.04, -0.03],
              [0.03, -0.03, -0.04],
              [-0.01, 0.03, -0.03],
              [0.02, -0.04, -0.04],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.32, 0.12, 0.08],
              [-0.48, 0.16, 0.12],
              [-0.28, 0.1, 0.08],
              [-0.44, 0.15, 0.1],
              [-0.32, 0.12, 0.08],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-1.78, -0.26, -0.18],
              [-1.81, -0.28, -0.18],
              [-1.77, -0.25, -0.18],
              [-1.8, -0.27, -0.18],
              [-1.78, -0.26, -0.18],
            ])
          ),
        })
      )
    );
  }

  // 13. Coffee_Break (2.8s holding and sipping coffee mug without intersecting glasses)
  {
    const d = 2.8;
    const t = [0, 0.7, 1.4, 2.1, d];
    clips.push(
      new THREE.AnimationClip(
        'Coffee_Break',
        d,
        restPoseTracks(d, {
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.02, 0, 0],
              [-0.02, 0.02, 0],
              [-0.03, 0.02, 0],
              [0.02, -0.02, 0],
              [0.02, 0, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.03, 0, 0],
              [-0.08, 0.02, 0],
              [-0.1, 0.02, 0],
              [0.02, -0.03, 0],
              [0.03, 0, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.04, 0, 0.05],
              [0.02, 0, 0.06],
              [0.02, 0, 0.06],
              [0.04, 0, 0.05],
              [0.04, 0, 0.05],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.96, -0.2, -0.08],
              [-1.36, -0.26, -0.1],
              [-1.4, -0.28, -0.1],
              [-1.02, -0.22, -0.08],
              [-0.96, -0.2, -0.08],
            ])
          ),
        })
      )
    );
  }

  // 14. Code_Review (2.6s inspecting PR diffs on handheld laptop at Integration Table)
  {
    const d = 2.6;
    const t = [0, 0.65, 1.3, 1.95, d];
    clips.push(
      new THREE.AnimationClip(
        'Code_Review',
        d,
        restPoseTracks(d, {
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.06, -0.04, 0],
              [0.08, 0.05, 0],
              [0.07, -0.03, 0],
              [0.08, 0.04, 0],
              [0.06, -0.04, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.14, -0.06, 0],
              [-0.04, 0.08, 0],
              [0.16, 0.05, 0],
              [-0.02, -0.05, 0],
              [0.14, -0.06, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.96, 0.22, 0.08],
              [-0.98, 0.24, 0.08],
              [-0.95, 0.21, 0.08],
              [-0.98, 0.24, 0.08],
              [-0.96, 0.22, 0.08],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-1.04, -0.18, -0.08],
              [-1.26, -0.1, -0.1],
              [-1.08, -0.16, -0.08],
              [-1.24, -0.12, -0.1],
              [-1.04, -0.18, -0.08],
            ])
          ),
        })
      )
    );
  }

  // 15. Waiting_Review (2.6s calm waiting pose holding tablet)
  {
    const d = 2.6;
    const t = [0, 0.65, 1.3, 1.95, d];
    clips.push(
      new THREE.AnimationClip(
        'Waiting_Review',
        d,
        restPoseTracks(d, {
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.02, -0.03, 0],
              [0.02, 0.04, 0],
              [0.01, -0.02, 0],
              [0.02, 0.03, 0],
              [0.02, -0.03, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0.03, -0.08, 0],
              [0.01, 0.09, 0],
              [0.04, -0.05, 0],
              [0.02, 0.07, 0],
              [0.03, -0.08, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.86, 0.22, 0.08],
              [-0.88, 0.24, 0.08],
              [-0.85, 0.22, 0.08],
              [-0.88, 0.24, 0.08],
              [-0.86, 0.22, 0.08],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [-0.56, -0.22, -0.08],
              [-0.6, -0.24, -0.08],
              [-0.55, -0.22, -0.08],
              [-0.6, -0.24, -0.08],
              [-0.56, -0.22, -0.08],
            ])
          ),
        })
      )
    );
  }

  // 16. Task_Completed (2.0s positive professional developer celebration)
  {
    const d = 2.0;
    const t = [0, 0.45, 0.95, 1.45, d];
    clips.push(
      new THREE.AnimationClip(
        'Task_Completed',
        d,
        restPoseTracks(d, {
          HipsPos: new THREE.VectorKeyframeTrack(
            'Hips.position',
            t,
            vecKeyframes([
              [0, 0.72, 0],
              [0, 0.76, 0],
              [0, 0.73, 0],
              [0, 0.755, 0],
              [0, 0.72, 0],
            ])
          ),
          TorsoRot: new THREE.QuaternionKeyframeTrack(
            'Torso.quaternion',
            t,
            quatKeyframesFromEuler([
              [0, 0, 0],
              [-0.08, 0.06, 0],
              [-0.04, -0.06, 0],
              [-0.07, 0.04, 0],
              [0, 0, 0],
            ])
          ),
          HeadRot: new THREE.QuaternionKeyframeTrack(
            'Head.quaternion',
            t,
            quatKeyframesFromEuler([
              [0, 0, 0],
              [-0.1, 0.06, 0],
              [0.06, -0.05, 0],
              [-0.08, 0.04, 0],
              [0, 0, 0],
            ])
          ),
          ArmLRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Left.quaternion',
            t,
            quatKeyframesFromEuler([
              [0, 0, 0.04],
              [-2.25, 0.14, 0.22],
              [-1.95, 0.1, 0.16],
              [-2.2, 0.14, 0.2],
              [0, 0, 0.04],
            ])
          ),
          ArmRRot: new THREE.QuaternionKeyframeTrack(
            'Arm_Right.quaternion',
            t,
            quatKeyframesFromEuler([
              [0, 0, -0.04],
              [-2.35, -0.14, -0.22],
              [-2.0, -0.1, -0.16],
              [-2.3, -0.14, -0.2],
              [0, 0, -0.04],
            ])
          ),
        })
      )
    );
  }

  return clips;
}

/**
 * Builds the standalone `Frontend_Developer_Agent_Root` voxel character hierarchy
 * and its 16 embedded `THREE.AnimationClip`s.
 *
 * Character Visual Identity (Reference A + Reference B Same-World Voxel Style):
 * - Height: `1.725u` grounded at `Y = 0.000` (matching Boss PM, CEO Executive Assistant, and UI/UX Designer).
 * - Layered dark charcoal/black geometric voxel hair (`Hair` group) with front fringe, side volume, and rear depth.
 * - Thick black rectangular developer glasses (`Glasses` group) with clear lenses (`depthWrite: false`) and visible dark eyes, pupils, eyebrows, nose, warm cheeks, and mouth.
 * - Vivid controlled orange developer hoodie (`#F97316` / `#EA580C`), rear/neck hood folds, two white hoodie drawstrings (`#F8FAFC`) stepped forward on chest, ribbed sleeve cuffs (`#C2410C`), and front kangaroo pocket.
 * - White/silver neck headphones (`Headphones` group) resting around the collar/upper chest.
 * - Dark charcoal technical backpack (`Backpack` group) with shoulder straps, front pocket, and subtle orange status accent.
 * - Dark navy/charcoal trousers (`#1E2430`) and white/light-gray sneakers (`#F4F6F9`) with dark & orange accents.
 */
export function buildFrontendDeveloperSceneAndClips(): FrontendCharacterVisualRig {
  const mSkin = makeVoxelMat('Mat_FE_Skin', 0xf3c6a5, 0.72, 0.02);
  const mCheek = makeVoxelMat('Mat_FE_Cheek', 0xe6a287, 0.76, 0.02);
  const mHairBase = makeVoxelMat('Mat_FE_Hair_DarkCharcoal', 0x181a20, 0.82, 0.05);
  const mHairHighlight = makeVoxelMat('Mat_FE_Hair_Highlight', 0x242832, 0.78, 0.06);
  const mHairShadow = makeVoxelMat('Mat_FE_Hair_Shadow', 0x101216, 0.86, 0.04);

  const mEyeWhite = makeVoxelMat('Mat_FE_EyeWhite', 0xffffff, 0.4, 0.02);
  const mEyeDark = makeVoxelMat('Mat_FE_EyeIris', 0x151922, 0.35, 0.05);
  const mPupil = makeVoxelMat('Mat_FE_Pupil', 0x0b0e14, 0.25, 0.05);
  const mMouth = makeVoxelMat('Mat_FE_Mouth', 0x8c4a3e, 0.65, 0.02);

  const mGlassesFrame = makeVoxelMat('Mat_FE_Glasses_BlackFrame', 0x12151c, 0.32, 0.28);
  const mGlassesLens = new THREE.MeshStandardMaterial({
    name: 'Mat_FE_Glasses_Lens',
    color: 0xd8eef8,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  });

  // Orange developer hoodie & inner crew tee materials
  const mHoodieOrange = makeVoxelMat('Mat_FE_Hoodie_Orange', 0xf97316, 0.8, 0.03);
  const mHoodieDarkOrange = makeVoxelMat('Mat_FE_Hoodie_SecondaryOrange', 0xea580c, 0.82, 0.03);
  const mHoodieTrim = makeVoxelMat('Mat_FE_Hoodie_RibTrim', 0xc2410c, 0.84, 0.03);
  const mInnerTee = makeVoxelMat('Mat_FE_InnerTee_DarkSlate', 0x1f2937, 0.82, 0.04);
  const mDrawstringWhite = makeVoxelMat('Mat_FE_Drawstring_White', 0xf8fafc, 0.65, 0.04);
  const mDrawstringAglet = makeVoxelMat('Mat_FE_Drawstring_Aglet', 0xcbd5e1, 0.35, 0.45);

  // White/silver neck headphones materials
  const mHeadphoneWhite = makeVoxelMat('Mat_FE_Headphone_White', 0xf8fafc, 0.42, 0.15);
  const mHeadphoneSilver = makeVoxelMat('Mat_FE_Headphone_Silver', 0x94a3b8, 0.32, 0.55);
  const mHeadphonePad = makeVoxelMat('Mat_FE_Headphone_Pad', 0x1e293b, 0.82, 0.05);

  // Dark charcoal technical backpack materials
  const mBackpackBody = makeVoxelMat('Mat_FE_Backpack_Charcoal', 0x1b1f27, 0.8, 0.08);
  const mBackpackPocket = makeVoxelMat('Mat_FE_Backpack_Pocket', 0x262b36, 0.78, 0.1);
  const mBackpackStrap = makeVoxelMat('Mat_FE_Backpack_Strap', 0x141820, 0.84, 0.06);
  const mBackpackZipper = makeVoxelMat('Mat_FE_Backpack_Zipper', 0x64748b, 0.4, 0.45);

  // Dark navy/charcoal trousers & white/gray sneakers materials
  const mTrousers = makeVoxelMat('Mat_FE_Trousers_DarkNavy', 0x1e2430, 0.82, 0.04);
  const mTrousersCuff = makeVoxelMat('Mat_FE_Trousers_Cuff', 0x151a24, 0.85, 0.04);
  const mSneakerWhite = makeVoxelMat('Mat_FE_Sneaker_White', 0xf4f6f9, 0.62, 0.05);
  const mSneakerAccent = makeVoxelMat('Mat_FE_Sneaker_SlateAccent', 0x334155, 0.7, 0.08);
  const mSneakerSole = makeVoxelMat('Mat_FE_Sneaker_SoleDark', 0x111827, 0.88, 0.04);

  // Handheld prop materials
  const mLaptopSilver = makeVoxelMat('Mat_FE_Prop_LaptopSilver', 0xd1d5db, 0.35, 0.55);
  const mLaptopDark = makeVoxelMat('Mat_FE_Prop_LaptopDark', 0x111827, 0.45, 0.25);
  const mScreenGlow = new THREE.MeshStandardMaterial({
    name: 'Mat_FE_Prop_ScreenGlow',
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.42,
    roughness: 0.25,
  });
  const mMugWhite = makeVoxelMat('Mat_FE_Prop_MugWhite', 0xf8fafc, 0.35, 0.08);
  const mCoffeeDark = makeVoxelMat('Mat_FE_Prop_CoffeeLiquid', 0x3b2314, 0.3, 0.05);
  const mDocBoard = makeVoxelMat('Mat_FE_Prop_Clipboard', 0x334155, 0.68, 0.12);
  const mPaperWhite = makeVoxelMat('Mat_FE_Prop_Paper', 0xffffff, 0.85, 0.02);

  const root = new THREE.Group();
  root.name = FRONTEND_CHARACTER_CONSTANTS.ROOT_NODE_NAME;
  root.position.set(0, 0, 0);

  // =========================================================================
  // 1. HIPS (Y = 0.72) & TORSO (Y = +0.06 -> 0.78)
  // =========================================================================
  const hips = new THREE.Group();
  hips.name = 'Hips';
  hips.position.set(0, 0.72, 0);
  root.add(hips);

  addVoxelBox(hips, 'Pelvis_Base', 0.37, 0.13, 0.23, 0, 0.0, 0, mTrousers);
  // Lower orange ribbed waistband of the hoodie overlapping pelvis cleanly
  addVoxelBox(hips, 'Hoodie_Ribbed_Waistband', 0.39, 0.065, 0.246, 0, 0.055, 0, mHoodieTrim);

  const torso = new THREE.Group();
  torso.name = 'Torso';
  torso.position.set(0, 0.06, 0);
  hips.add(torso);

  // Main vivid orange hoodie torso block (Z = -0.125..+0.125)
  addVoxelBox(torso, 'Hoodie_Torso_Core', 0.39, 0.44, 0.25, 0, 0.24, 0, mHoodieOrange);
  // Subtle darker orange side seam panels (X = ±0.198, non-overlapping)
  addVoxelBox(torso, 'Hoodie_SidePanel_L', 0.016, 0.39, 0.22, -0.201, 0.23, 0, mHoodieDarkOrange);
  addVoxelBox(torso, 'Hoodie_SidePanel_R', 0.016, 0.39, 0.22, 0.201, 0.23, 0, mHoodieDarkOrange);

  // Front kangaroo pocket stepped forward at Z = +0.135..+0.148 (never coplanar with Z = +0.125)
  addVoxelBox(
    torso,
    'Hoodie_Kangaroo_Pocket_Center',
    0.24,
    0.13,
    0.022,
    0,
    0.115,
    0.136,
    mHoodieDarkOrange
  );
  addVoxelBox(
    torso,
    'Hoodie_Kangaroo_Pocket_RibTop',
    0.2,
    0.024,
    0.024,
    0,
    0.172,
    0.138,
    mHoodieTrim
  );
  addVoxelBox(
    torso,
    'Hoodie_Kangaroo_Pocket_Slant_L',
    0.028,
    0.11,
    0.024,
    -0.112,
    0.115,
    0.138,
    mHoodieTrim
  );
  addVoxelBox(
    torso,
    'Hoodie_Kangaroo_Pocket_Slant_R',
    0.028,
    0.11,
    0.024,
    0.112,
    0.115,
    0.138,
    mHoodieTrim
  );

  // Dark inner crew shirt visible at V-neck collar opening (Z = +0.128)
  addVoxelBox(torso, 'Inner_CrewTee_Collar', 0.14, 0.06, 0.018, 0, 0.435, 0.128, mInnerTee);
  addVoxelBox(torso, 'Neck_Column', 0.14, 0.09, 0.14, 0, 0.485, 0.0, mSkin);

  // Sculpted orange hood resting around the back and sides of the neck
  addVoxelBox(torso, 'Hoodie_Hood_BackBase', 0.32, 0.12, 0.09, 0, 0.465, -0.105, mHoodieOrange);
  addVoxelBox(torso, 'Hoodie_Hood_BackFold', 0.26, 0.075, 0.06, 0, 0.415, -0.142, mHoodieDarkOrange);
  addVoxelBox(torso, 'Hoodie_Hood_SideCollar_L', 0.065, 0.085, 0.19, -0.135, 0.465, -0.01, mHoodieOrange);
  addVoxelBox(torso, 'Hoodie_Hood_SideCollar_R', 0.065, 0.085, 0.19, 0.135, 0.465, -0.01, mHoodieOrange);

  // Two crisp white hoodie drawstrings hanging on the front upper chest (Z = +0.142, +17mm proud of chest)
  addVoxelBox(
    torso,
    'Hoodie_Drawstring_L',
    0.022,
    0.165,
    0.018,
    -0.056,
    0.34,
    0.142,
    mDrawstringWhite
  );
  addVoxelBox(
    torso,
    'Hoodie_Drawstring_Tip_L',
    0.024,
    0.026,
    0.02,
    -0.056,
    0.248,
    0.143,
    mDrawstringAglet
  );
  addVoxelBox(
    torso,
    'Hoodie_Drawstring_R',
    0.022,
    0.165,
    0.018,
    0.056,
    0.34,
    0.142,
    mDrawstringWhite
  );
  addVoxelBox(
    torso,
    'Hoodie_Drawstring_Tip_R',
    0.024,
    0.026,
    0.02,
    0.056,
    0.248,
    0.143,
    mDrawstringAglet
  );

  // =========================================================================
  // 2. WHITE / SILVER NECK HEADPHONES (`Headphones` group on Torso)
  // =========================================================================
  const headphonesGroup = new THREE.Group();
  headphonesGroup.name = 'Headphones';
  torso.add(headphonesGroup);

  // Neckband wrapping around the back and sides of the collar
  addVoxelBox(
    headphonesGroup,
    'Headphones_Neckband_Back',
    0.27,
    0.032,
    0.032,
    0,
    0.455,
    -0.162,
    mHeadphoneWhite
  );
  addVoxelBox(
    headphonesGroup,
    'Headphones_Neckband_Side_L',
    0.032,
    0.032,
    0.24,
    -0.132,
    0.445,
    -0.035,
    mHeadphoneWhite
  );
  addVoxelBox(
    headphonesGroup,
    'Headphones_Neckband_Side_R',
    0.032,
    0.032,
    0.24,
    0.132,
    0.445,
    -0.035,
    mHeadphoneWhite
  );
  // Silver hinge yokes
  addVoxelBox(
    headphonesGroup,
    'Headphones_Yoke_L',
    0.028,
    0.042,
    0.035,
    -0.125,
    0.42,
    0.1,
    mHeadphoneSilver
  );
  addVoxelBox(
    headphonesGroup,
    'Headphones_Yoke_R',
    0.028,
    0.042,
    0.035,
    0.125,
    0.42,
    0.1,
    mHeadphoneSilver
  );
  // Left & Right Ear Cups resting on the upper chest/collarbone (X = ±0.122, Y = 0.39, Z = +0.148)
  const earCupL = new THREE.Group();
  earCupL.name = 'Headphones_EarCup_L';
  earCupL.position.set(-0.122, 0.395, 0.146);
  earCupL.rotation.set(0.18, 0.12, -0.15);
  headphonesGroup.add(earCupL);
  addVoxelBox(earCupL, 'EarCup_L_Pad', 0.072, 0.082, 0.022, 0, 0, -0.012, mHeadphonePad);
  addVoxelBox(earCupL, 'EarCup_L_Shell', 0.078, 0.088, 0.028, 0, 0, 0.012, mHeadphoneWhite);
  addVoxelBox(earCupL, 'EarCup_L_SilverRing', 0.052, 0.062, 0.012, 0, 0, 0.028, mHeadphoneSilver);

  const earCupR = new THREE.Group();
  earCupR.name = 'Headphones_EarCup_R';
  earCupR.position.set(0.122, 0.395, 0.146);
  earCupR.rotation.set(0.18, -0.12, 0.15);
  headphonesGroup.add(earCupR);
  addVoxelBox(earCupR, 'EarCup_R_Pad', 0.072, 0.082, 0.022, 0, 0, -0.012, mHeadphonePad);
  addVoxelBox(earCupR, 'EarCup_R_Shell', 0.078, 0.088, 0.028, 0, 0, 0.012, mHeadphoneWhite);
  addVoxelBox(earCupR, 'EarCup_R_SilverRing', 0.052, 0.062, 0.012, 0, 0, 0.028, mHeadphoneSilver);

  // =========================================================================
  // 3. DARK CHARCOAL TECHNICAL BACKPACK (`Backpack` group on Torso)
  // =========================================================================
  const backpackGroup = new THREE.Group();
  backpackGroup.name = 'Backpack';
  torso.add(backpackGroup);

  // Main backpack compartment on back of torso (Z = -0.132..-0.282, clearing torso Z=-0.125 by 7mm)
  addVoxelBox(
    backpackGroup,
    'Backpack_Main_Body',
    0.31,
    0.36,
    0.14,
    0,
    0.24,
    -0.202,
    mBackpackBody
  );
  addVoxelBox(
    backpackGroup,
    'Backpack_Top_BevelCap',
    0.29,
    0.04,
    0.12,
    0,
    0.435,
    -0.195,
    mBackpackPocket
  );
  addVoxelBox(
    backpackGroup,
    'Backpack_Top_CarryLoop',
    0.09,
    0.026,
    0.024,
    0,
    0.465,
    -0.165,
    mBackpackStrap
  );
  // Lower tech pocket stepped out on the back (Z = -0.286)
  addVoxelBox(
    backpackGroup,
    'Backpack_Outer_Pocket',
    0.25,
    0.18,
    0.036,
    0,
    0.175,
    -0.288,
    mBackpackPocket
  );
  // Metallic zipper line & subtle orange engineering status badge
  addVoxelBox(
    backpackGroup,
    'Backpack_Zipper_Trim',
    0.254,
    0.014,
    0.012,
    0,
    0.272,
    -0.308,
    mBackpackZipper
  );
  addVoxelBox(
    backpackGroup,
    'Backpack_Orange_TechTag',
    0.055,
    0.018,
    0.012,
    0.075,
    0.23,
    -0.308,
    mHoodieOrange
  );
  // Shoulder straps over shoulders and down outer front chest (X = ±0.168, away from drawstrings & headphones)
  addVoxelBox(
    backpackGroup,
    'Backpack_Strap_Top_L',
    0.042,
    0.026,
    0.27,
    -0.168,
    0.468,
    -0.01,
    mBackpackStrap
  );
  addVoxelBox(
    backpackGroup,
    'Backpack_Strap_Top_R',
    0.042,
    0.026,
    0.27,
    0.168,
    0.468,
    -0.01,
    mBackpackStrap
  );
  addVoxelBox(
    backpackGroup,
    'Backpack_Strap_Front_L',
    0.042,
    0.34,
    0.022,
    -0.168,
    0.29,
    0.136,
    mBackpackStrap
  );
  addVoxelBox(
    backpackGroup,
    'Backpack_Strap_Front_R',
    0.042,
    0.34,
    0.022,
    0.168,
    0.29,
    0.136,
    mBackpackStrap
  );

  // =========================================================================
  // 4. HEAD, LAYERED DARK VOXEL HAIR, FACE & RECTANGULAR GLASSES (Y = +0.51 -> 1.29)
  //    Total Height = 1.29 + 0.435 = 1.725u
  // =========================================================================
  const head = new THREE.Group();
  head.name = 'Head';
  head.position.set(0, 0.51, 0);
  torso.add(head);

  // Core voxel head block (Y = 0.02..0.38, Z = -0.18..+0.18)
  addVoxelBox(head, 'Head_Core', 0.38, 0.36, 0.36, 0, 0.2, 0, mSkin);
  // Left & Right Ears at X = ±0.204, Y = 0.175
  addVoxelBox(head, 'Ear_L', 0.032, 0.078, 0.062, -0.204, 0.175, -0.01, mSkin);
  addVoxelBox(head, 'Ear_R', 0.032, 0.078, 0.062, 0.204, 0.175, -0.01, mSkin);

  // LAYERED GEOMETRIC VOXEL HAIR (`Hair` group)
  // Short, voluminous, dark charcoal/black developer hairstyle with layered front fringe,
  // clean sideburns/temples above ears, and full back cap.
  const hairGroup = new THREE.Group();
  hairGroup.name = 'Hair';
  head.add(hairGroup);

  // Main upper crown cap (Y = 0.345..0.415 -> world 1.635..1.705)
  addVoxelBox(hairGroup, 'Hair_Crown_Base', 0.416, 0.07, 0.396, 0, 0.38, -0.004, mHairBase);
  // Topmost textured voxel hair layers reaching exactly Y = +0.435 (world 1.725u)
  addVoxelBox(hairGroup, 'Hair_Crown_TopLayer', 0.36, 0.02, 0.33, -0.01, 0.425, 0.01, mHairHighlight);
  addVoxelBox(hairGroup, 'Hair_Crown_SideLock_L', 0.12, 0.024, 0.26, -0.13, 0.418, 0.02, mHairBase);
  addVoxelBox(hairGroup, 'Hair_Crown_SideLock_R', 0.12, 0.024, 0.26, 0.12, 0.416, -0.01, mHairBase);

  // Layered Front Fringe above forehead & eyebrows (Y = 0.285..0.375, Z = +0.186..+0.208)
  // Strictly above the glasses top bar (Y = 0.228) so zero intersection occurs!
  addVoxelBox(hairGroup, 'Hair_Fringe_UpperBand', 0.396, 0.056, 0.042, 0, 0.352, 0.184, mHairBase);
  addVoxelBox(hairGroup, 'Hair_Fringe_CenterLock', 0.13, 0.052, 0.036, -0.02, 0.312, 0.194, mHairHighlight);
  addVoxelBox(hairGroup, 'Hair_Fringe_LeftSweep', 0.12, 0.048, 0.034, -0.135, 0.316, 0.19, mHairBase);
  addVoxelBox(hairGroup, 'Hair_Fringe_RightSweep', 0.11, 0.044, 0.034, 0.125, 0.32, 0.19, mHairShadow);

  // Side hair volume above and behind the ears (never intersecting Ear_L/Ear_R at Y=0.136..0.214, Z=-0.041..+0.021)
  addVoxelBox(hairGroup, 'Hair_SideUpper_L', 0.034, 0.13, 0.37, -0.202, 0.295, -0.005, mHairBase);
  addVoxelBox(hairGroup, 'Hair_SideUpper_R', 0.034, 0.13, 0.37, 0.202, 0.295, -0.005, mHairBase);
  addVoxelBox(hairGroup, 'Hair_SideTemple_L', 0.028, 0.055, 0.065, -0.198, 0.245, 0.11, mHairShadow);
  addVoxelBox(hairGroup, 'Hair_SideTemple_R', 0.028, 0.055, 0.065, 0.198, 0.245, 0.11, mHairShadow);
  addVoxelBox(hairGroup, 'Hair_SideBack_L', 0.032, 0.18, 0.15, -0.2, 0.18, -0.115, mHairShadow);
  addVoxelBox(hairGroup, 'Hair_SideBack_R', 0.032, 0.18, 0.15, 0.2, 0.18, -0.115, mHairShadow);

  // Full Rear Hair Cap covering back of head (Z = -0.185..-0.218)
  addVoxelBox(hairGroup, 'Hair_Back_UpperCap', 0.404, 0.18, 0.044, 0, 0.275, -0.194, mHairBase);
  addVoxelBox(hairGroup, 'Hair_Back_MidLayer', 0.38, 0.13, 0.048, 0, 0.165, -0.196, mHairHighlight);
  addVoxelBox(hairGroup, 'Hair_Back_NapeTaper', 0.32, 0.075, 0.036, 0, 0.085, -0.188, mHairShadow);

  // FACIAL FEATURES (`Face` group, stepped forward at Z = +0.183..+0.196)
  const faceGroup = new THREE.Group();
  faceGroup.name = 'Face';
  head.add(faceGroup);

  const leftEyeWhite = addVoxelBox(
    faceGroup,
    'Eye_White_L',
    0.066,
    0.05,
    0.012,
    -0.084,
    0.178,
    0.184,
    mEyeWhite
  );
  const rightEyeWhite = addVoxelBox(
    faceGroup,
    'Eye_White_R',
    0.066,
    0.05,
    0.012,
    0.084,
    0.178,
    0.184,
    mEyeWhite
  );
  addVoxelBox(faceGroup, 'Eye_Iris_L', 0.042, 0.042, 0.012, -0.082, 0.178, 0.189, mEyeDark);
  addVoxelBox(faceGroup, 'Eye_Iris_R', 0.042, 0.042, 0.012, 0.082, 0.178, 0.189, mEyeDark);
  const leftPupil = addVoxelBox(
    faceGroup,
    'Eye_Pupil_L',
    0.024,
    0.026,
    0.012,
    -0.082,
    0.178,
    0.194,
    mPupil
  );
  const rightPupil = addVoxelBox(
    faceGroup,
    'Eye_Pupil_R',
    0.024,
    0.026,
    0.012,
    0.082,
    0.178,
    0.194,
    mPupil
  );

  const leftBrow = addVoxelBox(
    faceGroup,
    'Eyebrow_L',
    0.076,
    0.02,
    0.016,
    -0.084,
    0.242,
    0.19,
    mHairBase
  );
  const rightBrow = addVoxelBox(
    faceGroup,
    'Eyebrow_R',
    0.076,
    0.02,
    0.016,
    0.084,
    0.242,
    0.19,
    mHairBase
  );

  // Subtle voxel nose, warm cheek blush, and mouth
  addVoxelBox(faceGroup, 'Nose_Bridge', 0.032, 0.042, 0.024, 0, 0.145, 0.192, mSkin);
  addVoxelBox(faceGroup, 'Cheek_Warm_L', 0.052, 0.028, 0.01, -0.122, 0.125, 0.184, mCheek);
  addVoxelBox(faceGroup, 'Cheek_Warm_R', 0.052, 0.028, 0.01, 0.122, 0.125, 0.184, mCheek);
  const mouth = addVoxelBox(
    faceGroup,
    'Mouth',
    0.068,
    0.02,
    0.014,
    0,
    0.084,
    0.188,
    mMouth
  );

  // THICK BLACK RECTANGULAR DEVELOPER GLASSES (`Glasses` group at Z = +0.206)
  const glassesGroup = new THREE.Group();
  glassesGroup.name = 'Glasses';
  head.add(glassesGroup);

  // Left rectangular frame
  addVoxelBox(glassesGroup, 'Glasses_TopBar_L', 0.124, 0.018, 0.018, -0.086, 0.216, 0.206, mGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_BotBar_L', 0.124, 0.016, 0.018, -0.086, 0.14, 0.206, mGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_OuterRim_L', 0.018, 0.092, 0.018, -0.146, 0.178, 0.206, mGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_InnerRim_L', 0.016, 0.092, 0.018, -0.026, 0.178, 0.206, mGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_Lens_L', 0.102, 0.06, 0.006, -0.086, 0.178, 0.205, mGlassesLens);

  // Right rectangular frame
  addVoxelBox(glassesGroup, 'Glasses_TopBar_R', 0.124, 0.018, 0.018, 0.086, 0.216, 0.206, mGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_BotBar_R', 0.124, 0.016, 0.018, 0.086, 0.14, 0.206, mGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_OuterRim_R', 0.018, 0.092, 0.018, 0.146, 0.178, 0.206, mGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_InnerRim_R', 0.016, 0.092, 0.018, 0.026, 0.178, 0.206, mGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_Lens_R', 0.102, 0.06, 0.006, 0.086, 0.178, 0.205, mGlassesLens);

  // Center bridge & side temple arms
  addVoxelBox(glassesGroup, 'Glasses_Bridge', 0.044, 0.018, 0.018, 0, 0.198, 0.207, mGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_Temple_L', 0.016, 0.018, 0.21, -0.194, 0.198, 0.095, mGlassesFrame);
  addVoxelBox(glassesGroup, 'Glasses_Temple_R', 0.016, 0.018, 0.21, 0.194, 0.198, 0.095, mGlassesFrame);

  // =========================================================================
  // 5. ARMS, HOODIE SLEEVES, CUFFS, HANDS & CONTEXTUAL PROP ANCHORS
  // =========================================================================
  const leftArm = new THREE.Group();
  leftArm.name = 'Arm_Left';
  leftArm.position.set(-0.255, 0.38, 0);
  torso.add(leftArm);

  addVoxelBox(leftArm, 'Sleeve_Upper_L', 0.12, 0.22, 0.128, 0, -0.09, 0, mHoodieOrange);
  addVoxelBox(leftArm, 'Sleeve_Lower_L', 0.112, 0.15, 0.12, 0, -0.265, 0, mHoodieDarkOrange);
  addVoxelBox(leftArm, 'Sleeve_RibCuff_L', 0.116, 0.042, 0.124, 0, -0.355, 0, mHoodieTrim);
  addVoxelBox(leftArm, 'Hand_L', 0.092, 0.095, 0.096, 0, -0.42, 0, mSkin);
  addVoxelBox(leftArm, 'Thumb_L', 0.032, 0.045, 0.036, 0.048, -0.41, 0.032, mSkin);

  const leftHandPropAnchor = new THREE.Group();
  leftHandPropAnchor.name = 'PropAttachment_Left';
  leftHandPropAnchor.position.set(0, -0.45, 0.06);
  leftArm.add(leftHandPropAnchor);

  const rightArm = new THREE.Group();
  rightArm.name = 'Arm_Right';
  rightArm.position.set(0.255, 0.38, 0);
  torso.add(rightArm);

  addVoxelBox(rightArm, 'Sleeve_Upper_R', 0.12, 0.22, 0.128, 0, -0.09, 0, mHoodieOrange);
  addVoxelBox(rightArm, 'Sleeve_Lower_R', 0.112, 0.15, 0.12, 0, -0.265, 0, mHoodieDarkOrange);
  addVoxelBox(rightArm, 'Sleeve_RibCuff_R', 0.116, 0.042, 0.124, 0, -0.355, 0, mHoodieTrim);
  addVoxelBox(rightArm, 'Hand_R', 0.092, 0.095, 0.096, 0, -0.42, 0, mSkin);
  addVoxelBox(rightArm, 'Thumb_R', 0.032, 0.045, 0.036, -0.048, -0.41, 0.032, mSkin);

  const rightHandPropAnchor = new THREE.Group();
  rightHandPropAnchor.name = 'PropAttachment_Right';
  rightHandPropAnchor.position.set(0, -0.45, 0.06);
  rightArm.add(rightHandPropAnchor);

  // =========================================================================
  // 6. LEGS, DARK NAVY TROUSERS & WHITE/GRAY SNEAKERS (Grounded at Y = 0.000)
  // =========================================================================
  const leftLeg = new THREE.Group();
  leftLeg.name = 'Leg_Left';
  leftLeg.position.set(-0.105, 0, 0);
  hips.add(leftLeg);

  addVoxelBox(leftLeg, 'Trouser_Thigh_L', 0.148, 0.3, 0.156, 0, -0.17, 0, mTrousers);
  addVoxelBox(leftLeg, 'Trouser_Shin_L', 0.138, 0.25, 0.146, 0, -0.435, 0, mTrousers);
  addVoxelBox(leftLeg, 'Trouser_Cuff_L', 0.144, 0.045, 0.152, 0, -0.57, 0, mTrousersCuff);
  // White/light-gray sneaker with dark & orange accents, sole bottom at Y = -0.72 -> world Y = 0.000
  addVoxelBox(leftLeg, 'Sneaker_Upper_L', 0.148, 0.075, 0.22, 0, -0.635, 0.032, mSneakerWhite);
  addVoxelBox(leftLeg, 'Sneaker_HeelPatch_L', 0.152, 0.055, 0.07, 0, -0.635, -0.048, mSneakerAccent);
  addVoxelBox(leftLeg, 'Sneaker_OrangeTab_L', 0.08, 0.024, 0.04, 0, -0.595, 0.085, mHoodieOrange);
  addVoxelBox(leftLeg, 'Sneaker_Outsole_L', 0.156, 0.048, 0.236, 0, -0.696, 0.032, mSneakerSole);

  const rightLeg = new THREE.Group();
  rightLeg.name = 'Leg_Right';
  rightLeg.position.set(0.105, 0, 0);
  hips.add(rightLeg);

  addVoxelBox(rightLeg, 'Trouser_Thigh_R', 0.148, 0.3, 0.156, 0, -0.17, 0, mTrousers);
  addVoxelBox(rightLeg, 'Trouser_Shin_R', 0.138, 0.25, 0.146, 0, -0.435, 0, mTrousers);
  addVoxelBox(rightLeg, 'Trouser_Cuff_R', 0.144, 0.045, 0.152, 0, -0.57, 0, mTrousersCuff);
  addVoxelBox(rightLeg, 'Sneaker_Upper_R', 0.148, 0.075, 0.22, 0, -0.635, 0.032, mSneakerWhite);
  addVoxelBox(rightLeg, 'Sneaker_HeelPatch_R', 0.152, 0.055, 0.07, 0, -0.635, -0.048, mSneakerAccent);
  addVoxelBox(rightLeg, 'Sneaker_OrangeTab_R', 0.08, 0.024, 0.04, 0, -0.595, 0.085, mHoodieOrange);
  addVoxelBox(rightLeg, 'Sneaker_Outsole_R', 0.156, 0.048, 0.236, 0, -0.696, 0.032, mSneakerSole);

  // =========================================================================
  // 7. CONTEXTUAL HANDHELD PROPS (Hidden in rest pose for clean GLB export)
  // =========================================================================
  const grayLaptop = new THREE.Group();
  grayLaptop.name = 'Prop_Gray_Laptop';
  grayLaptop.visible = false;
  addVoxelBox(grayLaptop, 'Laptop_Base', 0.24, 0.016, 0.17, 0.06, 0.01, 0.07, mLaptopSilver);
  addVoxelBox(grayLaptop, 'Laptop_Keyboard', 0.2, 0.006, 0.11, 0.06, 0.02, 0.065, mLaptopDark);
  const laptopLid = new THREE.Group();
  laptopLid.name = 'Laptop_Lid_Group';
  laptopLid.position.set(0.06, 0.018, 0.15);
  laptopLid.rotation.x = -0.42;
  grayLaptop.add(laptopLid);
  addVoxelBox(laptopLid, 'Laptop_Display_Shell', 0.24, 0.15, 0.012, 0, 0.075, 0, mLaptopSilver);
  addVoxelBox(laptopLid, 'Laptop_Display_Screen', 0.21, 0.125, 0.006, 0, 0.075, -0.008, mScreenGlow);
  leftHandPropAnchor.add(grayLaptop);

  const debugTablet = new THREE.Group();
  debugTablet.name = 'Prop_Debug_Tablet';
  debugTablet.visible = false;
  addVoxelBox(debugTablet, 'Tablet_Chassis', 0.18, 0.016, 0.24, 0.04, 0.01, 0.06, mLaptopDark);
  addVoxelBox(debugTablet, 'Tablet_Screen', 0.156, 0.006, 0.21, 0.04, 0.02, 0.06, mScreenGlow);
  addVoxelBox(debugTablet, 'Tablet_OrangeCaseRim', 0.186, 0.012, 0.016, 0.04, 0.012, 0.182, mHoodieOrange);
  leftHandPropAnchor.add(debugTablet);

  const techDocument = new THREE.Group();
  techDocument.name = 'Prop_Tech_Document';
  techDocument.visible = false;
  addVoxelBox(techDocument, 'Document_Board', 0.19, 0.014, 0.25, 0.04, 0.01, 0.06, mDocBoard);
  addVoxelBox(techDocument, 'Document_Paper', 0.168, 0.008, 0.22, 0.04, 0.02, 0.06, mPaperWhite);
  addVoxelBox(techDocument, 'Document_HeaderBar', 0.14, 0.006, 0.026, 0.04, 0.026, 0.14, mHoodieOrange);
  leftHandPropAnchor.add(techDocument);

  const smartphone = new THREE.Group();
  smartphone.name = 'Prop_Smartphone';
  smartphone.visible = false;
  addVoxelBox(smartphone, 'Smartphone_Body', 0.056, 0.11, 0.014, -0.02, -0.01, 0.03, mLaptopDark);
  addVoxelBox(smartphone, 'Smartphone_Screen', 0.048, 0.096, 0.006, -0.02, -0.01, 0.038, mScreenGlow);
  rightHandPropAnchor.add(smartphone);

  const coffeeCup = new THREE.Group();
  coffeeCup.name = 'Prop_Coffee_Cup';
  coffeeCup.visible = false;
  addVoxelBox(coffeeCup, 'Mug_Body', 0.072, 0.092, 0.072, -0.02, 0.02, 0.04, mMugWhite);
  addVoxelBox(coffeeCup, 'Mug_OrangeSleeve', 0.076, 0.042, 0.076, -0.02, 0.02, 0.04, mHoodieOrange);
  addVoxelBox(coffeeCup, 'Mug_CoffeeTop', 0.06, 0.008, 0.06, -0.02, 0.065, 0.04, mCoffeeDark);
  rightHandPropAnchor.add(coffeeCup);

  const clips = buildFrontendCharacterAnimationClips();

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
    leftEyeWhite,
    rightEyeWhite,
    leftPupil,
    rightPupil,
    leftBrow,
    rightBrow,
    mouth,
    leftArm,
    rightArm,
    leftHandPropAnchor,
    rightHandPropAnchor,
    leftLeg,
    rightLeg,
    props: {
      grayLaptop,
      smartphone,
      coffeeCup,
      techDocument,
      debugTablet,
    },
    clips,
  };
}

/**
 * Exports a clean, standalone binary `frontend_developer_agent.glb` buffer with all 16 embedded clips
 * and zero room geometry or floating props.
 */
export async function exportFrontendDeveloperToGLBBuffer(): Promise<ArrayBuffer> {
  const built = buildFrontendDeveloperSceneAndClips();
  // Ensure rest pose has all handheld props hidden and backpack/glasses visible
  built.props.grayLaptop.visible = false;
  built.props.smartphone.visible = false;
  built.props.coffeeCup.visible = false;
  built.props.techDocument.visible = false;
  built.props.debugTablet.visible = false;
  built.glassesGroup.visible = true;
  built.backpackGroup.visible = true;
  built.headphonesGroup.visible = true;

  const exportScene = new THREE.Scene();
  exportScene.name = 'Frontend_Developer_Character_Scene';
  exportScene.add(built.root);
  exportScene.updateMatrixWorld(true);

  const exporter = new GLTFExporter();
  return new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      exportScene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(new Error('Expected binary ArrayBuffer from GLTFExporter for Frontend Developer'));
        }
      },
      (err) => reject(err),
      {
        binary: true,
        animations: built.clips,
        includeCustomExtensions: false,
      }
    );
  });
}

export interface FrontendSimulationHelpersInstance {
  helpersRoot: THREE.Group;
  updatePathVisuals: (currentPosXZ: [number, number], remainingPath: Array<[number, number]>) => void;
}

export function buildFrontendSimulationHelpersGroup(): FrontendSimulationHelpersInstance {
  const helpersRoot = new THREE.Group();
  helpersRoot.name = 'FRONTEND_SIMULATION_PATH_HELPERS';

  const lineMat = new THREE.LineBasicMaterial({ color: 0xf97316 });
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.04, 0),
    new THREE.Vector3(0, 0.04, 0),
  ]);
  const pathLine = new THREE.Line(lineGeo, lineMat);
  pathLine.name = 'Frontend_Nav_Path_Line';
  pathLine.visible = false;
  helpersRoot.add(pathLine);

  const targetRingGeo = new THREE.RingGeometry(0.18, 0.25, 24);
  targetRingGeo.rotateX(-Math.PI / 2);
  const targetRingMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    side: THREE.DoubleSide,
  });
  const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
  targetRing.name = 'Frontend_Nav_Target_Ring';
  targetRing.position.y = 0.025;
  targetRing.visible = false;
  helpersRoot.add(targetRing);

  return {
    helpersRoot,
    updatePathVisuals: (currentPosXZ, remainingPath) => {
      if (!remainingPath || remainingPath.length === 0) {
        pathLine.visible = false;
        targetRing.visible = false;
        return;
      }
      const pts: THREE.Vector3[] = [
        new THREE.Vector3(currentPosXZ[0], 0.04, currentPosXZ[1]),
        ...remainingPath.map(([x, z]) => new THREE.Vector3(x, 0.04, z)),
      ];
      pathLine.geometry.dispose();
      pathLine.geometry = new THREE.BufferGeometry().setFromPoints(pts);
      pathLine.visible = true;

      const last = remainingPath[remainingPath.length - 1];
      targetRing.position.set(last[0], 0.025, last[1]);
      targetRing.visible = true;
    },
  };
}

export interface FrontendCharacterRuntimeInstance {
  rootGroup: THREE.Group;
  navigationRoot: THREE.Group;
  orientationRoot: THREE.Group;
  modelRoot: THREE.Group;
  rig: FrontendCharacterVisualRig;
  mixer: THREE.AnimationMixer;
  triggerAction: (actionId: FrontendActionId, fromAutoDemo?: boolean) => void;
  walkToPoint: (x: number, z: number) => void;
  executePlayback: (cmd: FrontendAnimationPlaybackCommand) => void;
  setSpeed: (speed: FrontendSpeedMultiplier) => void;
  setPatrol: (active: boolean) => void;
  startAutoDemo: () => void;
  stopAutoDemo: () => void;
  setExpression: (expr: FrontendExpressionId) => void;
  setGlassesVisible: (visible: boolean) => void;
  setBackpackVisible: (visible: boolean) => void;
  update: (dt: number, elapsedTime: number) => void;
  getStatus: () => FrontendSimulationRuntimeStatus;
}

function shortestYawDelta(fromRad: number, toRad: number): number {
  let diff = ((toRad - fromRad + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

/**
 * Instantiates the live interactive `Frontend Developer` runtime controller inside
 * the 8x16 Engineering Studio (`AI_OFFICE_ROOM_ENGINEERING_v1`).
 */
export function createFrontendDeveloperRuntime(options: {
  getAnchors: () => Record<EngineeringAnchorId, EngineeringActivityAnchor>;
  onStatusChange?: (status: FrontendSimulationRuntimeStatus) => void;
  pathHelpers?: FrontendSimulationHelpersInstance;
}): FrontendCharacterRuntimeInstance {
  const rig = buildFrontendDeveloperSceneAndClips();

  const rootGroup = new THREE.Group();
  rootGroup.name = FRONTEND_CHARACTER_CONSTANTS.RUNTIME_ROOT_NAME;

  const navigationRoot = new THREE.Group();
  navigationRoot.name = 'Frontend_Navigation_Root';
  rootGroup.add(navigationRoot);

  const orientationRoot = new THREE.Group();
  orientationRoot.name = 'Frontend_Orientation_Root';
  navigationRoot.add(orientationRoot);

  orientationRoot.add(rig.root);

  // Subtle floor shadow disc under the character's sneakers
  const shadowGeo = new THREE.CircleGeometry(0.28, 24);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x090d16,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
  });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.name = 'Frontend_Character_FloorShadow';
  shadowDisc.position.set(0, 0.006, 0);
  navigationRoot.add(shadowDisc);

  const mixer = new THREE.AnimationMixer(rig.root);
  const clipActions = new Map<FrontendRequiredClipName, THREE.AnimationAction>();
  for (const clip of rig.clips) {
    const action = mixer.clipAction(clip);
    clipActions.set(clip.name as FrontendRequiredClipName, action);
  }

  // Initial placement at ENGINEERING_ROOM_IDLE
  const initialAnchors = options.getAnchors() ?? DEFAULT_ENGINEERING_ANCHORS;
  const idleAnchor = initialAnchors.ENGINEERING_ROOM_IDLE ?? DEFAULT_ENGINEERING_ANCHORS.ENGINEERING_ROOM_IDLE;
  navigationRoot.position.set(idleAnchor.position[0], 0, idleAnchor.position[2]);
  orientationRoot.rotation.y = idleAnchor.facingRad;

  let currentState: FrontendSimulationStateId = 'IDLE';
  let currentActionId: FrontendActionId = 'idle';
  let activeClipName: FrontendRequiredClipName = 'Idle_Breathing';
  let currentAnchorId: EngineeringAnchorId = 'ENGINEERING_ROOM_IDLE';
  let targetAnchorId: EngineeringAnchorId | null = 'ENGINEERING_ROOM_IDLE';
  let currentExpression: FrontendExpressionId = 'neutral';
  let posture: 'standing' | 'seated' = 'standing';
  let handheldProp: FrontendHandheldPropId = 'none';
  let isWalking = false;
  let isPaused = false;
  let patrolActive = false;
  let patrolWaitTimer = 0;
  let patrolIndex = 0;
  let autoDemoActive = false;
  let autoDemoStepIndex = 0;
  let autoDemoTimer = 0;
  let taskCompleteReturnTimer = 0;
  let speedMultiplier: FrontendSpeedMultiplier = 1;
  let glassesVisible = true;
  let userBackpackVisible = true;
  let navPath: Array<[number, number]> = [];
  let customBubbleText: string | null = null;

  function applyHandheldPropVisibility(prop: FrontendHandheldPropId) {
    handheldProp = prop;
    rig.props.grayLaptop.visible = prop === 'gray_laptop';
    rig.props.smartphone.visible = prop === 'smartphone';
    rig.props.coffeeCup.visible = prop === 'coffee_cup';
    rig.props.techDocument.visible = prop === 'tech_document';
    rig.props.debugTablet.visible = prop === 'debug_tablet';
  }

  function applyBackpackVisibilityPolicy() {
    const autoHideForSeat = posture === 'seated';
    rig.backpackGroup.visible = userBackpackVisible && !autoHideForSeat;
  }

  function applyExpressionToFace(exprId: FrontendExpressionId, elapsed = 0) {
    const preset = FRONTEND_EXPRESSION_PRESETS[exprId] ?? FRONTEND_EXPRESSION_PRESETS.neutral;
    const blinkCycle = elapsed % 4.1;
    const isBlinking = blinkCycle > 3.96 && blinkCycle < 4.08;
    const blinkFactor = isBlinking ? 0.14 : 1.0;

    rig.leftEyeWhite.scale.y = preset.eyeScaleY * blinkFactor;
    rig.rightEyeWhite.scale.y = preset.eyeScaleY * blinkFactor;
    rig.leftPupil.scale.y = blinkFactor;
    rig.rightPupil.scale.y = blinkFactor;

    rig.leftPupil.position.x = -0.082 + preset.pupilOffsetX;
    rig.rightPupil.position.x = 0.082 + preset.pupilOffsetX;
    rig.leftPupil.position.y = 0.178 + preset.pupilOffsetY;
    rig.rightPupil.position.y = 0.178 + preset.pupilOffsetY;

    rig.leftBrow.rotation.z = preset.browTiltRad;
    rig.rightBrow.rotation.z = -preset.browTiltRad;
    rig.leftBrow.position.y = 0.242 + preset.browLiftY;
    rig.rightBrow.position.y = 0.242 + preset.browLiftY;

    const talkPulse =
      exprId === 'talking' ? 0.85 + Math.abs(Math.sin(elapsed * 11.5)) * 0.65 : 1.0;
    rig.mouth.scale.set(preset.mouthScaleX, preset.mouthScaleY * talkPulse, 1);
    rig.mouth.position.y = 0.084 + preset.mouthCurveY;
  }

  function playClip(clipName: FrontendRequiredClipName, loop = true) {
    activeClipName = clipName;
    clipActions.forEach((act, name) => {
      if (name === clipName) {
        act.reset();
        act.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
        act.clampWhenFinished = !loop;
        act.fadeIn(0.16);
        act.play();
      } else {
        act.fadeOut(0.16);
      }
    });
  }

  function enterArrivalActionState(actionId: FrontendActionId) {
    const spec = FRONTEND_ACTIONS[actionId] ?? FRONTEND_ACTIONS.idle;
    currentActionId = actionId;
    currentState = spec.targetState;
    posture = spec.posture;
    currentExpression = spec.defaultExpression;
    customBubbleText = null;
    applyHandheldPropVisibility(spec.handheldProp);
    applyBackpackVisibilityPolicy();
    applyExpressionToFace(currentExpression, 0);
    playClip(spec.clipName, spec.loop);

    if (actionId === 'task_completed') {
      taskCompleteReturnTimer = spec.durationSec;
    } else {
      taskCompleteReturnTimer = 0;
    }
    notifyStatus();
  }

  function triggerAction(actionId: FrontendActionId, fromAutoDemo = false) {
    if (!fromAutoDemo) {
      autoDemoActive = false;
      patrolActive = false;
    }
    isPaused = false;
    const spec = FRONTEND_ACTIONS[actionId] ?? FRONTEND_ACTIONS.idle;
    currentActionId = actionId;
    targetAnchorId = spec.targetAnchor;

    const anchors = options.getAnchors() ?? DEFAULT_ENGINEERING_ANCHORS;
    const dest = anchors[spec.targetAnchor] ?? DEFAULT_ENGINEERING_ANCHORS[spec.targetAnchor];
    const curXZ: [number, number] = [navigationRoot.position.x, navigationRoot.position.z];
    const goalXZ: [number, number] = [dest.position[0], dest.position[2]];
    const dist = Math.hypot(goalXZ[0] - curXZ[0], goalXZ[1] - curXZ[1]);

    if (dist <= 0.14 && actionId !== 'walk') {
      navigationRoot.position.set(goalXZ[0], 0, goalXZ[1]);
      orientationRoot.rotation.y = dest.facingRad;
      isWalking = false;
      navPath = [];
      options.pathHelpers?.updatePathVisuals(goalXZ, []);
      currentAnchorId = spec.targetAnchor;
      enterArrivalActionState(actionId);
      return;
    }

    // Need to walk to target anchor first
    navPath = findFrontendWalkablePath(curXZ, goalXZ);
    isWalking = true;
    currentState = 'MOVING';
    posture = 'standing';
    currentExpression = 'neutral';
    applyHandheldPropVisibility('none');
    applyBackpackVisibilityPolicy();
    playClip('Walk_Cycle', true);
    options.pathHelpers?.updatePathVisuals(curXZ, navPath);
    notifyStatus();
  }

  function walkToPoint(x: number, z: number) {
    autoDemoActive = false;
    patrolActive = false;
    isPaused = false;
    currentActionId = 'walk';
    targetAnchorId = null;

    const curXZ: [number, number] = [navigationRoot.position.x, navigationRoot.position.z];
    navPath = findFrontendWalkablePath(curXZ, [x, z]);
    isWalking = true;
    currentState = 'MOVING';
    posture = 'standing';
    currentExpression = 'neutral';
    customBubbleText = `Berjalan menuju koordinat studio [${x.toFixed(1)}, ${z.toFixed(1)}]...`;
    applyHandheldPropVisibility('none');
    applyBackpackVisibilityPolicy();
    playClip('Walk_Cycle', true);
    options.pathHelpers?.updatePathVisuals(curXZ, navPath);
    notifyStatus();
  }

  function getStatus(): FrontendSimulationRuntimeStatus {
    const spec = FRONTEND_ACTIONS[currentActionId] ?? FRONTEND_ACTIONS.idle;
    return {
      characterId: FRONTEND_CHARACTER_CONSTANTS.CHARACTER_ID,
      displayName: FRONTEND_CHARACTER_CONSTANTS.DISPLAY_NAME,
      currentState,
      currentActionId,
      currentActionLabel: spec.idLabel,
      activeClipName,
      currentAnchorId,
      targetAnchorId,
      currentExpression,
      posture,
      handheldProp,
      isWalking,
      isPaused,
      patrolActive,
      autoDemoActive,
      autoDemoStepIndex: autoDemoActive ? autoDemoStepIndex + 1 : 0,
      autoDemoTotalSteps: FRONTEND_AUTO_DEMO_SEQUENCE.length,
      speedMultiplier,
      glassesVisible,
      backpackVisible: userBackpackVisible,
      backpackAutoHiddenForSeat: posture === 'seated' && userBackpackVisible,
      bubbleText: customBubbleText ?? spec.bubbleText,
      thoughtText: spec.thoughtText,
      worldPosition: [
        Number(navigationRoot.position.x.toFixed(2)),
        Number(navigationRoot.position.y.toFixed(2)),
        Number(navigationRoot.position.z.toFixed(2)),
      ],
      facingRad: Number(orientationRoot.rotation.y.toFixed(2)),
    };
  }

  function notifyStatus() {
    options.onStatusChange?.(getStatus());
  }

  // Initialize default idle state
  playClip('Idle_Breathing', true);
  applyExpressionToFace('neutral', 0);
  notifyStatus();

  return {
    rootGroup,
    navigationRoot,
    orientationRoot,
    modelRoot: rig.root,
    rig,
    mixer,
    triggerAction,
    walkToPoint,
    executePlayback: (cmd) => {
      if (cmd === 'pause') {
        isPaused = true;
      } else if (cmd === 'play' || cmd === 'resume') {
        isPaused = false;
      } else if (cmd === 'restart') {
        isPaused = false;
        playClip(activeClipName, true);
      } else if (cmd === 'stop' || cmd === 'reset_idle') {
        isPaused = false;
        autoDemoActive = false;
        patrolActive = false;
        isWalking = false;
        navPath = [];
        options.pathHelpers?.updatePathVisuals(
          [navigationRoot.position.x, navigationRoot.position.z],
          []
        );
        enterArrivalActionState('idle');
      } else if (cmd === 'reset_spawn') {
        isPaused = false;
        autoDemoActive = false;
        patrolActive = false;
        isWalking = false;
        navPath = [];
        const anchors = options.getAnchors() ?? DEFAULT_ENGINEERING_ANCHORS;
        const spawn = anchors.ENGINEERING_ROOM_SPAWN ?? DEFAULT_ENGINEERING_ANCHORS.ENGINEERING_ROOM_SPAWN;
        navigationRoot.position.set(spawn.position[0], 0, spawn.position[2]);
        orientationRoot.rotation.y = spawn.facingRad;
        currentAnchorId = 'ENGINEERING_ROOM_SPAWN';
        targetAnchorId = 'ENGINEERING_ROOM_SPAWN';
        options.pathHelpers?.updatePathVisuals([spawn.position[0], spawn.position[2]], []);
        enterArrivalActionState('idle');
      }
      notifyStatus();
    },
    setSpeed: (spd) => {
      speedMultiplier = spd;
      notifyStatus();
    },
    setPatrol: (active) => {
      patrolActive = active;
      autoDemoActive = false;
      isPaused = false;
      if (active) {
        patrolIndex = 0;
        patrolWaitTimer = 0.2;
      } else {
        isWalking = false;
        navPath = [];
        options.pathHelpers?.updatePathVisuals(
          [navigationRoot.position.x, navigationRoot.position.z],
          []
        );
        enterArrivalActionState('idle');
      }
      notifyStatus();
    },
    startAutoDemo: () => {
      autoDemoActive = true;
      patrolActive = false;
      isPaused = false;
      autoDemoStepIndex = 0;
      const first = FRONTEND_AUTO_DEMO_SEQUENCE[0];
      autoDemoTimer = first.holdDurationSec;
      triggerAction(first.actionId, true);
      notifyStatus();
    },
    stopAutoDemo: () => {
      autoDemoActive = false;
      autoDemoStepIndex = 0;
      triggerAction('idle', true);
      notifyStatus();
    },
    setExpression: (expr) => {
      currentExpression = expr;
      applyExpressionToFace(expr, 0);
      notifyStatus();
    },
    setGlassesVisible: (visible) => {
      glassesVisible = visible;
      rig.glassesGroup.visible = visible;
      notifyStatus();
    },
    setBackpackVisible: (visible) => {
      userBackpackVisible = visible;
      applyBackpackVisibilityPolicy();
      notifyStatus();
    },
    update: (dt, elapsedTime) => {
      if (isPaused) return;
      const effectiveDt = dt * speedMultiplier;

      if (isWalking && navPath.length > 0) {
        const curX = navigationRoot.position.x;
        const curZ = navigationRoot.position.z;
        const [nextX, nextZ] = navPath[0];
        const dx = nextX - curX;
        const dz = nextZ - curZ;
        const dist = Math.hypot(dx, dz);
        const stepDist = FRONTEND_CHARACTER_CONSTANTS.WALK_SPEED_MPS * effectiveDt;

        if (dist > 0.008) {
          const desiredYaw = Math.atan2(dx, dz);
          const dYaw = shortestYawDelta(orientationRoot.rotation.y, desiredYaw);
          orientationRoot.rotation.y += dYaw * Math.min(1, effectiveDt * 12);
        }

        if (dist <= stepDist + 0.02) {
          navigationRoot.position.x = nextX;
          navigationRoot.position.z = nextZ;
          navPath.shift();
          options.pathHelpers?.updatePathVisuals([nextX, nextZ], navPath);

          if (navPath.length === 0) {
            isWalking = false;
            const anchors = options.getAnchors() ?? DEFAULT_ENGINEERING_ANCHORS;
            if (targetAnchorId && anchors[targetAnchorId]) {
              currentAnchorId = targetAnchorId;
              orientationRoot.rotation.y = anchors[targetAnchorId].facingRad;
            }
            if (patrolActive) {
              patrolWaitTimer = 1.4;
              enterArrivalActionState('idle');
            } else if (currentActionId === 'walk') {
              enterArrivalActionState('idle');
            } else {
              enterArrivalActionState(currentActionId);
            }
          }
        } else {
          const nx = curX + (dx / dist) * stepDist;
          const nz = curZ + (dz / dist) * stepDist;
          navigationRoot.position.x = nx;
          navigationRoot.position.z = nz;
          options.pathHelpers?.updatePathVisuals([nx, nz], navPath);
        }
      } else if (patrolActive) {
        patrolWaitTimer -= effectiveDt;
        if (patrolWaitTimer <= 0) {
          patrolIndex = (patrolIndex + 1) % FRONTEND_PATROL_ANCHORS.length;
          const nextAnchorId = FRONTEND_PATROL_ANCHORS[patrolIndex];
          targetAnchorId = nextAnchorId;
          const anchors = options.getAnchors() ?? DEFAULT_ENGINEERING_ANCHORS;
          const dest = anchors[nextAnchorId] ?? DEFAULT_ENGINEERING_ANCHORS[nextAnchorId];
          const curXZ: [number, number] = [navigationRoot.position.x, navigationRoot.position.z];
          navPath = findFrontendWalkablePath(curXZ, [dest.position[0], dest.position[2]]);
          isWalking = true;
          currentState = 'MOVING';
          posture = 'standing';
          applyHandheldPropVisibility('none');
          applyBackpackVisibilityPolicy();
          playClip('Walk_Cycle', true);
          options.pathHelpers?.updatePathVisuals(curXZ, navPath);
          notifyStatus();
        }
      } else if (autoDemoActive) {
        autoDemoTimer -= effectiveDt;
        if (autoDemoTimer <= 0) {
          autoDemoStepIndex++;
          if (autoDemoStepIndex >= FRONTEND_AUTO_DEMO_SEQUENCE.length) {
            autoDemoActive = false;
            autoDemoStepIndex = 0;
            triggerAction('idle', true);
          } else {
            const nextStep = FRONTEND_AUTO_DEMO_SEQUENCE[autoDemoStepIndex];
            autoDemoTimer = nextStep.holdDurationSec;
            triggerAction(nextStep.actionId, true);
          }
        }
      } else if (currentState === 'COMPLETED' && taskCompleteReturnTimer > 0) {
        taskCompleteReturnTimer -= effectiveDt;
        if (taskCompleteReturnTimer <= 0) {
          enterArrivalActionState('idle');
        }
      }

      mixer.update(effectiveDt);
      applyExpressionToFace(currentExpression, elapsedTime);
    },
    getStatus,
  };
}
