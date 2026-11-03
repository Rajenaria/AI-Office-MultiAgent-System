/**
 * AI Office — All-Agent Central Hub Meeting Demo Orchestrator V1
 * (`AllAgentMeetingDemoSystem.ts`)
 *
 * Implements the live Full-Office cross-room meeting simulation (`Jalankan Demo Meeting Semua Agent`)
 * in the redesigned Open Central Hub (`CENTRAL_HUB_ROOT` at global `[8, 0, 0]`):
 * - Coordinates ONLY the 7 real instantiated characters:
 *   1. `boss_pm` -> `HUB_MEETING_SEAT_02`
 *   2. `ceo_executive_assistant` -> `HUB_MEETING_SEAT_03`
 *   3. `research_professor_agent` -> `HUB_MEETING_SEAT_04`
 *   4. `uiux_designer_agent` -> `HUB_MEETING_SEAT_05`
 *   5. `frontend_developer_agent` -> `HUB_MEETING_SEAT_06`
 *   6. `backend_developer_agent` -> `HUB_MEETING_SEAT_07`
 *   7. `database_developer_agent` -> `HUB_MEETING_SEAT_08`
 * - Explicitly leaves 3 seats visibly empty (no fake/substitute avatars):
 *   - `HUB_MEETING_SEAT_01` (`HUB_MEETING_OWNER_RESERVED` — Human Owner / Chairperson)
 *   - `HUB_MEETING_SEAT_09` (`qa_agent` — Planned V2 character)
 *   - `HUB_MEETING_SEAT_10` (`devops_agent` — Planned V2 character)
 * - Safely snapshots and pauses room simulations when starting, navigates each character through
 *   verified doorway waypoints with staggered departure delays, aligns with assigned chair,
 *   transitions into a seated meeting posture with backpack auto-hide and natural discussion gestures,
 *   and cleanly restores room positions/states on `stopMeetingDemo()` or `resetMeetingDemo()`.
 */

import * as THREE from 'three';
import {
  HUB_MEETING_SEATS_LIST,
  HubMeetingSeatId,
  HubMeetingSeatSpec,
} from '../domain/centralHubSpec';
import { BossPMRuntimeInstance } from './BossPMCharacterSystem';
import { CEORuntimeInstance } from './CEOCharacterSystem';
import { UIUXRuntimeInstance } from './UIUXCharacterSystem';
import { FrontendCharacterRuntimeInstance } from './FrontendCharacterSystem';
import { BackendCharacterRuntimeInstance } from './BackendCharacterSystem';
import { DatabaseCharacterRuntimeInstance } from './DatabaseCharacterSystem';
import { ResearchCharacterRuntimeInstance } from './ResearchCharacterSystem';
import { QACharacterRuntimeInstance } from './QACharacterSystem';

export type MeetingDemoPhase =
  | 'INACTIVE'
  | 'GATHERING'
  | 'IN_SESSION'
  | 'PAUSED';

export type SeatRuntimeState =
  | 'ROOM_WORK'
  | 'WAITING_DEPARTURE'
  | 'WALKING_TO_HUB'
  | 'APPROACHING_CHAIR'
  | 'SEATED_IN_MEETING'
  | 'EMPTY_OWNER_RESERVED'
  | 'EMPTY_PLANNED_AGENT';

export interface AllAgentMeetingSeatRuntimeStatus {
  seatId: HubMeetingSeatId;
  seatNumber: number;
  side: 'NORTH' | 'SOUTH';
  assignedRoleId: string;
  assignedDisplayName: string;
  departmentRoomKey: string;
  isRealAvailableCharacter: boolean;
  runtimeState: SeatRuntimeState;
  statusBadgeLabel: string;
  globalSeatPosition: [number, number, number];
  currentGlobalPosition: [number, number, number];
  facingRad: number;
  remainingWaypoints: number;
}

export interface AllAgentMeetingDemoStatus {
  active: boolean;
  phase: MeetingDemoPhase;
  elapsedSeconds: number;
  totalSeats: number;
  realParticipantCount: number;
  seatedCount: number;
  walkingCount: number;
  waitingDepartureCount: number;
  emptySeatCount: number;
  activeSpeakerSeatId: HubMeetingSeatId | null;
  activeSpeakerLabel: string | null;
  seats: AllAgentMeetingSeatRuntimeStatus[];
}

export interface AllAgentMeetingCharacterRefs {
  getBossPM: () => BossPMRuntimeInstance | null;
  ceoAgent: CEORuntimeInstance;
  uiuxAgent: UIUXRuntimeInstance;
  frontendAgent: FrontendCharacterRuntimeInstance;
  backendAgent: BackendCharacterRuntimeInstance;
  databaseAgent: DatabaseCharacterRuntimeInstance;
  researchAgent: ResearchCharacterRuntimeInstance;
  qaAgent?: QACharacterRuntimeInstance;
  onStopRoomAutoDemos?: () => void;
  onRestoreRoomCharacters?: () => void;
  onStatusChange?: (status: AllAgentMeetingDemoStatus) => void;
}

interface SavedTransformSnapshot {
  localPos: THREE.Vector3;
  yaw: number;
  hipsPosY: number;
  hipsRotX: number;
  torsoRotX: number;
  torsoRotY: number;
  headRotX: number;
  headRotY: number;
  leftArmRotX: number;
  leftArmRotY: number;
  leftArmRotZ: number;
  rightArmRotX: number;
  rightArmRotY: number;
  rightArmRotZ: number;
  leftLegRotX: number;
  rightLegRotX: number;
  backpackVisible: boolean;
}

interface ParticipantTrack {
  seatSpec: HubMeetingSeatSpec;
  state: SeatRuntimeState;
  staggerRemainingSec: number;
  waypoints: Array<[number, number]>;
  globalPos: [number, number, number];
  facingRad: number;
  walkCyclePhase: number;
  snapshot: SavedTransformSnapshot | null;
}

function shortestAngleDiff(current: number, target: number): number {
  let diff = ((target - current + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

export interface AllAgentMeetingDemoSystemInstance {
  helpersGroup: THREE.Group;
  startMeetingDemo: () => void;
  stopMeetingDemo: () => void;
  resetMeetingDemo: () => void;
  teleportAllToSeatsImmediate: () => void;
  update: (dt: number, elapsedTime: number, showPaths: boolean) => boolean;
  getStatus: () => AllAgentMeetingDemoStatus;
  isActive: () => boolean;
}

const WALK_SPEED_MPS = 2.65;
const ROTATION_LERP_SPEED = 11.0;

const SPEAKER_ROTATION_ORDER: HubMeetingSeatId[] = [
  'HUB_MEETING_SEAT_02',
  'HUB_MEETING_SEAT_03',
  'HUB_MEETING_SEAT_04',
  'HUB_MEETING_SEAT_05',
  'HUB_MEETING_SEAT_06',
  'HUB_MEETING_SEAT_07',
  'HUB_MEETING_SEAT_08',
  'HUB_MEETING_SEAT_09',
];

export function createAllAgentMeetingDemoSystem(
  refs: AllAgentMeetingCharacterRefs
): AllAgentMeetingDemoSystemInstance {
  let active = false;
  let phase: MeetingDemoPhase = 'INACTIVE';
  let elapsedSeconds = 0;

  const helpersGroup = new THREE.Group();
  helpersGroup.name = 'PREVIEW_ONLY_MEETING_DEMO_PATHS';
  helpersGroup.visible = false;

  const pathLinesBySeat = new Map<HubMeetingSeatId, THREE.Line>();

  const tracks = new Map<HubMeetingSeatId, ParticipantTrack>();
  for (const seat of HUB_MEETING_SEATS_LIST) {
    const initialState: SeatRuntimeState = !seat.isRealAvailableCharacter
      ? seat.assignedRoleId === 'HUB_MEETING_OWNER_RESERVED'
        ? 'EMPTY_OWNER_RESERVED'
        : 'EMPTY_PLANNED_AGENT'
      : 'ROOM_WORK';

    tracks.set(seat.seatId, {
      seatSpec: seat,
      state: initialState,
      staggerRemainingSec: seat.staggerDelaySec,
      waypoints: [],
      globalPos: [...seat.globalSeatPosition],
      facingRad: seat.facingRad,
      walkCyclePhase: 0,
      snapshot: null,
    });

    if (seat.isRealAvailableCharacter) {
      const geom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.04, 0),
        new THREE.Vector3(0, 0.04, 0),
      ]);
      const mat = new THREE.LineBasicMaterial({
        color: seat.side === 'NORTH' ? 0x38bdf8 : 0x34d399,
        transparent: true,
        opacity: 0.75,
      });
      const line = new THREE.Line(geom, mat);
      line.name = `Meeting_Path_${seat.seatId}`;
      line.visible = false;
      helpersGroup.add(line);
      pathLinesBySeat.set(seat.seatId, line);
    }
  }

  function getCharacterTransformNodes(roleId: string): {
    posNode: THREE.Object3D;
    yawNode: THREE.Object3D;
    roomOffset: [number, number, number];
    hips: THREE.Object3D | null;
    torso: THREE.Object3D | null;
    head: THREE.Object3D | null;
    leftArm: THREE.Object3D | null;
    rightArm: THREE.Object3D | null;
    leftLeg: THREE.Object3D | null;
    rightLeg: THREE.Object3D | null;
    backpack: THREE.Object3D | null;
    hideAllHandheldProps: () => void;
    standingHipsY: number;
  } | null {
    switch (roleId) {
      case 'boss_pm': {
        const pm = refs.getBossPM();
        if (!pm) return null;
        return {
          posNode: pm.navigationRoot,
          yawNode: pm.orientationRoot,
          roomOffset: [8, 0, 18],
          hips: pm.articulatedNodes.hips,
          torso: pm.articulatedNodes.torso,
          head: pm.articulatedNodes.head,
          leftArm: pm.articulatedNodes.leftArm,
          rightArm: pm.articulatedNodes.rightArm,
          leftLeg: pm.articulatedNodes.leftLeg,
          rightLeg: pm.articulatedNodes.rightLeg,
          backpack: null,
          hideAllHandheldProps: () => {
            pm.transitionToActionPose('idle', false, 'standing');
          },
          standingHipsY: 0.72,
        };
      }
      case 'ceo_executive_assistant': {
        const c = refs.ceoAgent;
        return {
          posNode: c.navigationRoot,
          yawNode: c.orientationRoot,
          roomOffset: [16, 0, 18],
          hips: c.pivots.hips,
          torso: c.pivots.torso,
          head: c.pivots.head,
          leftArm: c.pivots.leftArm,
          rightArm: c.pivots.rightArm,
          leftLeg: c.pivots.leftLeg,
          rightLeg: c.pivots.rightLeg,
          backpack: null,
          hideAllHandheldProps: () => {
            Object.values(c.pivots.props).forEach((p) => {
              p.visible = false;
            });
          },
          standingHipsY: 0.72,
        };
      }
      case 'uiux_designer_agent': {
        const u = refs.uiuxAgent;
        return {
          posNode: u.navigationRoot,
          yawNode: u.orientationRoot,
          roomOffset: [24, 0, 18],
          hips: u.pivots.hips,
          torso: u.pivots.torso,
          head: u.pivots.head,
          leftArm: u.pivots.leftArm,
          rightArm: u.pivots.rightArm,
          leftLeg: u.pivots.leftLeg,
          rightLeg: u.pivots.rightLeg,
          backpack: null,
          hideAllHandheldProps: () => {
            Object.values(u.pivots.props).forEach((p) => {
              p.visible = false;
            });
          },
          standingHipsY: 0.72,
        };
      }
      case 'frontend_developer_agent': {
        const fe = refs.frontendAgent;
        return {
          posNode: fe.navigationRoot,
          yawNode: fe.orientationRoot,
          roomOffset: [0, 0, 0],
          hips: fe.rig.hips,
          torso: fe.rig.torso,
          head: fe.rig.head,
          leftArm: fe.rig.leftArm,
          rightArm: fe.rig.rightArm,
          leftLeg: fe.rig.leftLeg,
          rightLeg: fe.rig.rightLeg,
          backpack: fe.rig.backpackGroup,
          hideAllHandheldProps: () => {
            Object.values(fe.rig.props).forEach((p) => {
              p.visible = false;
            });
          },
          standingHipsY: 0.72,
        };
      }
      case 'backend_developer_agent': {
        const be = refs.backendAgent;
        return {
          posNode: be.runtimeRoot,
          yawNode: be.runtimeRoot,
          roomOffset: [0, 0, 0],
          hips: be.rig.hips,
          torso: be.rig.torso,
          head: be.rig.head,
          leftArm: be.rig.armLeft,
          rightArm: be.rig.armRight,
          leftLeg: be.rig.legLeft,
          rightLeg: be.rig.legRight,
          backpack: be.rig.backpackGroup,
          hideAllHandheldProps: () => {
            Object.values(be.rig.propsById).forEach((p) => {
              p.visible = false;
            });
          },
          standingHipsY: 0.66,
        };
      }
      case 'database_developer_agent': {
        const db = refs.databaseAgent;
        return {
          posNode: db.runtimeRoot,
          yawNode: db.runtimeRoot,
          roomOffset: [0, 0, 0],
          hips: db.rig.hips,
          torso: db.rig.torso,
          head: db.rig.head,
          leftArm: db.rig.armLeft,
          rightArm: db.rig.armRight,
          leftLeg: db.rig.legLeft,
          rightLeg: db.rig.legRight,
          backpack: db.rig.backpackGroup,
          hideAllHandheldProps: () => {
            Object.values(db.rig.propsById).forEach((p) => {
              p.visible = false;
            });
          },
          standingHipsY: 0.66,
        };
      }
      case 'research_professor_agent': {
        const res = refs.researchAgent;
        return {
          posNode: res.runtimeRoot,
          yawNode: res.runtimeRoot,
          roomOffset: [0, 0, 18],
          hips: res.rig.hips,
          torso: res.rig.torso,
          head: res.rig.head,
          leftArm: res.rig.armLeft,
          rightArm: res.rig.armRight,
          leftLeg: res.rig.legLeft,
          rightLeg: res.rig.legRight,
          backpack: res.rig.backpackGroup,
          hideAllHandheldProps: () => {
            Object.values(res.rig.propsById).forEach((p) => {
              p.visible = false;
            });
          },
          standingHipsY: 0.66,
        };
      }
      case 'qa_engineer_agent':
      case 'qa_agent': {
        const qa = refs.qaAgent;
        if (!qa) return null;
        return {
          posNode: qa.runtimeRoot,
          yawNode: qa.runtimeRoot,
          roomOffset: [24, 0, 0],
          hips: qa.rig.hips,
          torso: qa.rig.torso,
          head: qa.rig.head,
          leftArm: qa.rig.armLeft,
          rightArm: qa.rig.armRight,
          leftLeg: qa.rig.legLeft,
          rightLeg: qa.rig.legRight,
          backpack: qa.rig.backpackGroup,
          hideAllHandheldProps: () => {
            Object.values(qa.rig.propsById).forEach((p) => {
              p.visible = false;
            });
            Object.values(qa.rig.indicatorsById).forEach((ind) => {
              ind.visible = false;
            });
          },
          standingHipsY: 0.9,
        };
      }
      default:
        return null;
    }
  }

  function captureSnapshotForRole(roleId: string): SavedTransformSnapshot | null {
    const nodes = getCharacterTransformNodes(roleId);
    if (!nodes) return null;
    return {
      localPos: nodes.posNode.position.clone(),
      yaw: nodes.yawNode.rotation.y,
      hipsPosY: nodes.hips ? nodes.hips.position.y : nodes.standingHipsY,
      hipsRotX: nodes.hips ? nodes.hips.rotation.x : 0,
      torsoRotX: nodes.torso ? nodes.torso.rotation.x : 0,
      torsoRotY: nodes.torso ? nodes.torso.rotation.y : 0,
      headRotX: nodes.head ? nodes.head.rotation.x : 0,
      headRotY: nodes.head ? nodes.head.rotation.y : 0,
      leftArmRotX: nodes.leftArm ? nodes.leftArm.rotation.x : 0,
      leftArmRotY: nodes.leftArm ? nodes.leftArm.rotation.y : 0,
      leftArmRotZ: nodes.leftArm ? nodes.leftArm.rotation.z : 0,
      rightArmRotX: nodes.rightArm ? nodes.rightArm.rotation.x : 0,
      rightArmRotY: nodes.rightArm ? nodes.rightArm.rotation.y : 0,
      rightArmRotZ: nodes.rightArm ? nodes.rightArm.rotation.z : 0,
      leftLegRotX: nodes.leftLeg ? nodes.leftLeg.rotation.x : 0,
      rightLegRotX: nodes.rightLeg ? nodes.rightLeg.rotation.x : 0,
      backpackVisible: nodes.backpack ? nodes.backpack.visible : true,
    };
  }

  function restoreSnapshotForRole(roleId: string, snap: SavedTransformSnapshot | null) {
    if (!snap) return;
    const nodes = getCharacterTransformNodes(roleId);
    if (!nodes) return;
    nodes.posNode.position.copy(snap.localPos);
    nodes.yawNode.rotation.y = snap.yaw;
    if (nodes.hips) {
      nodes.hips.position.y = snap.hipsPosY;
      nodes.hips.rotation.set(snap.hipsRotX, 0, 0);
    }
    if (nodes.torso) {
      nodes.torso.rotation.set(snap.torsoRotX, snap.torsoRotY, 0);
    }
    if (nodes.head) {
      nodes.head.rotation.set(snap.headRotX, snap.headRotY, 0);
    }
    if (nodes.leftArm) {
      nodes.leftArm.rotation.set(snap.leftArmRotX, snap.leftArmRotY, snap.leftArmRotZ);
    }
    if (nodes.rightArm) {
      nodes.rightArm.rotation.set(snap.rightArmRotX, snap.rightArmRotY, snap.rightArmRotZ);
    }
    if (nodes.leftLeg) {
      nodes.leftLeg.rotation.set(snap.leftLegRotX, 0, 0);
    }
    if (nodes.rightLeg) {
      nodes.rightLeg.rotation.set(snap.rightLegRotX, 0, 0);
    }
    if (nodes.backpack) {
      nodes.backpack.visible = snap.backpackVisible;
    }
  }

  function applyProceduralPose(
    roleId: string,
    mode: 'STANDING_WAIT' | 'WALKING' | 'SEATED_MEETING',
    walkPhase: number,
    elapsedTime: number,
    seatIndex: number,
    isCurrentSpeaker: boolean
  ) {
    const nodes = getCharacterTransformNodes(roleId);
    if (!nodes) return;

    if (roleId === 'boss_pm') {
      const pm = refs.getBossPM();
      if (pm) {
        if (mode === 'WALKING') {
          pm.transitionToActionPose('idle', true, 'standing');
          pm.updateFrame(0.016, elapsedTime, 'MOVING', true, 1.0);
        } else if (mode === 'SEATED_MEETING') {
          pm.transitionToActionPose('work_desk', false, 'seated');
          pm.updateFrame(0.016, elapsedTime, 'WORKING', false, 1.0);
        } else {
          pm.transitionToActionPose('idle', false, 'standing');
          pm.updateFrame(0.016, elapsedTime, 'IDLE', false, 1.0);
        }
      }
    }

    if (mode === 'STANDING_WAIT') {
      if (nodes.hips) {
        nodes.hips.position.y = nodes.standingHipsY + Math.sin(elapsedTime * 2.1 + seatIndex) * 0.008;
        nodes.hips.rotation.set(0, 0, 0);
      }
      if (nodes.torso) nodes.torso.rotation.set(0, 0, 0);
      if (nodes.head) {
        nodes.head.rotation.set(0, Math.sin(elapsedTime * 0.9 + seatIndex) * 0.08, 0);
      }
      if (nodes.leftArm) nodes.leftArm.rotation.set(0, 0, 0.05);
      if (nodes.rightArm) nodes.rightArm.rotation.set(0, 0, -0.05);
      if (nodes.leftLeg) nodes.leftLeg.rotation.set(0, 0, 0);
      if (nodes.rightLeg) nodes.rightLeg.rotation.set(0, 0, 0);
      if (nodes.backpack) nodes.backpack.visible = true;
      return;
    }

    if (mode === 'WALKING') {
      const swing = Math.sin(walkPhase) * 0.56;
      const bounce = Math.abs(Math.cos(walkPhase)) * 0.028;
      if (nodes.hips) {
        nodes.hips.position.y = nodes.standingHipsY + bounce;
        nodes.hips.rotation.set(0, 0, 0);
      }
      if (nodes.torso) {
        nodes.torso.rotation.set(0.04, Math.sin(walkPhase) * 0.06, 0);
      }
      if (nodes.head) {
        nodes.head.rotation.set(0, -Math.sin(walkPhase) * 0.04, 0);
      }
      if (nodes.leftArm) {
        nodes.leftArm.rotation.set(-swing * 0.78, 0, 0.05);
      }
      if (nodes.rightArm) {
        nodes.rightArm.rotation.set(swing * 0.78, 0, -0.05);
      }
      if (nodes.leftLeg) {
        nodes.leftLeg.rotation.set(swing, 0, 0);
      }
      if (nodes.rightLeg) {
        nodes.rightLeg.rotation.set(-swing, 0, 0);
      }
      if (nodes.backpack) nodes.backpack.visible = true;
      return;
    }

    // SEATED_MEETING posture
    if (nodes.backpack) {
      nodes.backpack.visible = false;
    }
    if (nodes.hips) {
      nodes.hips.position.y = nodes.standingHipsY - 0.19;
      nodes.hips.rotation.set(0, 0, 0);
    }
    const talkCycle = elapsedTime * 3.2 + seatIndex * 1.3;
    const torsoLean = isCurrentSpeaker ? -0.08 : -0.04;
    const torsoTurn = Math.sin(elapsedTime * 0.65 + seatIndex * 1.1) * 0.07;
    if (nodes.torso) {
      nodes.torso.rotation.set(torsoLean, torsoTurn, 0);
    }
    if (nodes.head) {
      const nod = isCurrentSpeaker
        ? Math.sin(talkCycle) * 0.075
        : Math.sin(elapsedTime * 1.2 + seatIndex * 1.7) * 0.035;
      const lookYaw = Math.sin(elapsedTime * 0.55 + seatIndex * 2.0) * 0.16;
      nodes.head.rotation.set(nod, lookYaw, 0);
    }
    if (nodes.leftArm) {
      const gestureL = isCurrentSpeaker
        ? -0.78 + Math.sin(talkCycle) * 0.16
        : -0.64 + Math.sin(elapsedTime * 1.1 + seatIndex) * 0.04;
      nodes.leftArm.rotation.set(gestureL, 0.14, 0.06);
    }
    if (nodes.rightArm) {
      const gestureR = isCurrentSpeaker
        ? -0.82 + Math.cos(talkCycle) * 0.18
        : -0.68 + Math.cos(elapsedTime * 1.1 + seatIndex) * 0.04;
      nodes.rightArm.rotation.set(gestureR, -0.14, -0.06);
    }
    if (nodes.leftLeg) {
      nodes.leftLeg.rotation.set(-1.42, 0, 0);
    }
    if (nodes.rightLeg) {
      nodes.rightLeg.rotation.set(-1.42, 0, 0);
    }
  }

  function updatePathLine(seatId: HubMeetingSeatId, track: ParticipantTrack, showPaths: boolean) {
    const line = pathLinesBySeat.get(seatId);
    if (!line) return;
    if (
      !showPaths ||
      !active ||
      (track.state !== 'WALKING_TO_HUB' && track.state !== 'APPROACHING_CHAIR') ||
      track.waypoints.length === 0
    ) {
      line.visible = false;
      return;
    }

    const pts: THREE.Vector3[] = [
      new THREE.Vector3(track.globalPos[0], 0.045, track.globalPos[2]),
      ...track.waypoints.map(([wx, wz]) => new THREE.Vector3(wx, 0.045, wz)),
    ];
    line.geometry.dispose();
    line.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    line.visible = true;
  }

  function emitStatus() {
    refs.onStatusChange?.(getStatus());
  }

  function startMeetingDemo() {
    refs.onStopRoomAutoDemos?.();
    active = true;
    phase = 'GATHERING';
    elapsedSeconds = 0;
    helpersGroup.visible = true;

    for (const seat of HUB_MEETING_SEATS_LIST) {
      const track = tracks.get(seat.seatId)!;
      if (!seat.isRealAvailableCharacter) {
        track.state =
          seat.assignedRoleId === 'HUB_MEETING_OWNER_RESERVED'
            ? 'EMPTY_OWNER_RESERVED'
            : 'EMPTY_PLANNED_AGENT';
        continue;
      }

      if (!track.snapshot) {
        track.snapshot = captureSnapshotForRole(seat.assignedRoleId);
      }

      const nodes = getCharacterTransformNodes(seat.assignedRoleId);
      if (nodes) {
        nodes.hideAllHandheldProps();
        const startGlobalX = nodes.roomOffset[0] + nodes.posNode.position.x;
        const startGlobalZ = nodes.roomOffset[2] + nodes.posNode.position.z;
        track.globalPos = [startGlobalX, 0, startGlobalZ];
        track.facingRad = nodes.yawNode.rotation.y;
      }

      // Copy verified doorway waypoints (skip first point if character is already near it)
      const routePts = seat.globalRouteWaypoints.map(
        (pt) => [pt[0], pt.length === 3 ? pt[2] : pt[1]] as [number, number]
      );
      if (routePts.length > 1) {
        const d0 = Math.hypot(
          routePts[0][0] - track.globalPos[0],
          routePts[0][1] - track.globalPos[2]
        );
        if (d0 < 1.2) {
          routePts.shift();
        }
      }
      track.waypoints = routePts;
      const delaySec = seat.staggerDelaySec ?? seat.departureDelaySeconds ?? 0;
      track.staggerRemainingSec = delaySec;
      track.walkCyclePhase = 0;
      track.state = delaySec > 0 ? 'WAITING_DEPARTURE' : 'WALKING_TO_HUB';
    }

    emitStatus();
  }

  function stopMeetingDemo() {
    if (!active) return;
    active = false;
    phase = 'INACTIVE';
    helpersGroup.visible = false;
    pathLinesBySeat.forEach((line) => {
      line.visible = false;
    });

    for (const seat of HUB_MEETING_SEATS_LIST) {
      const track = tracks.get(seat.seatId)!;
      if (!seat.isRealAvailableCharacter) continue;
      restoreSnapshotForRole(seat.assignedRoleId, track.snapshot);
      track.snapshot = null;
      track.waypoints = [];
      track.state = 'ROOM_WORK';
    }

    refs.onRestoreRoomCharacters?.();
    emitStatus();
  }

  function resetMeetingDemo() {
    stopMeetingDemo();
  }

  function teleportAllToSeatsImmediate() {
    if (!active) {
      startMeetingDemo();
    }
    phase = 'IN_SESSION';
    for (const seat of HUB_MEETING_SEATS_LIST) {
      const track = tracks.get(seat.seatId)!;
      if (!seat.isRealAvailableCharacter) continue;
      track.staggerRemainingSec = 0;
      track.waypoints = [];
      track.state = 'SEATED_IN_MEETING';
      track.globalPos = [
        seat.globalSeatedPoseTarget[0],
        0,
        seat.globalSeatedPoseTarget[2],
      ];
      track.facingRad = seat.facingRad;

      const nodes = getCharacterTransformNodes(seat.assignedRoleId);
      if (nodes) {
        nodes.posNode.position.set(
          track.globalPos[0] - nodes.roomOffset[0],
          0,
          track.globalPos[2] - nodes.roomOffset[2]
        );
        nodes.yawNode.rotation.y = seat.facingRad;
      }
      applyProceduralPose(
        seat.assignedRoleId,
        'SEATED_MEETING',
        0,
        elapsedSeconds,
        seat.seatNumber,
        seat.seatId === 'HUB_MEETING_SEAT_02'
      );
      updatePathLine(seat.seatId, track, false);
    }
    emitStatus();
  }

  function update(dt: number, elapsedTime: number, showPaths: boolean): boolean {
    if (!active) return false;

    const clampedDt = Math.min(dt, 0.08);
    elapsedSeconds += clampedDt;

    const speakerIdx = Math.floor(elapsedSeconds / 4.0) % SPEAKER_ROTATION_ORDER.length;
    const currentSpeakerSeatId = SPEAKER_ROTATION_ORDER[speakerIdx];

    let seatedCount = 0;
    let realCount = 0;

    for (const seat of HUB_MEETING_SEATS_LIST) {
      const track = tracks.get(seat.seatId)!;
      if (!seat.isRealAvailableCharacter) continue;
      realCount++;

      const nodes = getCharacterTransformNodes(seat.assignedRoleId);
      if (!nodes) continue;

      if (track.state === 'WAITING_DEPARTURE') {
        track.staggerRemainingSec -= clampedDt;
        applyProceduralPose(
          seat.assignedRoleId,
          'STANDING_WAIT',
          0,
          elapsedTime,
          seat.seatNumber,
          false
        );
        if (track.staggerRemainingSec <= 0) {
          track.state = 'WALKING_TO_HUB';
        }
      } else if (
        track.state === 'WALKING_TO_HUB' ||
        track.state === 'APPROACHING_CHAIR'
      ) {
        if (track.waypoints.length === 0) {
          track.state = 'SEATED_IN_MEETING';
        } else {
          const [targetX, targetZ] = track.waypoints[0];
          const dx = targetX - track.globalPos[0];
          const dz = targetZ - track.globalPos[2];
          const dist = Math.hypot(dx, dz);
          const stepDist = WALK_SPEED_MPS * clampedDt;

          if (dist > 0.008) {
            const desiredYaw = Math.atan2(dx, dz);
            const diff = shortestAngleDiff(track.facingRad, desiredYaw);
            track.facingRad += diff * Math.min(1, clampedDt * ROTATION_LERP_SPEED);
          }

          if (dist <= stepDist + 0.025) {
            track.globalPos[0] = targetX;
            track.globalPos[2] = targetZ;
            track.waypoints.shift();
            if (track.waypoints.length === 1) {
              track.state = 'APPROACHING_CHAIR';
            } else if (track.waypoints.length === 0) {
              track.state = 'SEATED_IN_MEETING';
              track.facingRad = seat.facingRad;
            }
          } else {
            track.globalPos[0] += (dx / dist) * stepDist;
            track.globalPos[2] += (dz / dist) * stepDist;
          }

          nodes.posNode.position.set(
            track.globalPos[0] - nodes.roomOffset[0],
            0,
            track.globalPos[2] - nodes.roomOffset[2]
          );
          nodes.yawNode.rotation.y = track.facingRad;

          track.walkCyclePhase += clampedDt * 11.5;
          applyProceduralPose(
            seat.assignedRoleId,
            'WALKING',
            track.walkCyclePhase,
            elapsedTime,
            seat.seatNumber,
            false
          );
        }
      }

      if (track.state === 'SEATED_IN_MEETING') {
        seatedCount++;
        track.globalPos[0] = seat.globalSeatedPoseTarget[0];
        track.globalPos[2] = seat.globalSeatedPoseTarget[2];
        const diffYaw = shortestAngleDiff(track.facingRad, seat.facingRad);
        if (Math.abs(diffYaw) > 0.005) {
          track.facingRad += diffYaw * Math.min(1, clampedDt * ROTATION_LERP_SPEED);
        } else {
          track.facingRad = seat.facingRad;
        }

        nodes.posNode.position.set(
          track.globalPos[0] - nodes.roomOffset[0],
          0,
          track.globalPos[2] - nodes.roomOffset[2]
        );
        nodes.yawNode.rotation.y = track.facingRad;

        applyProceduralPose(
          seat.assignedRoleId,
          'SEATED_MEETING',
          0,
          elapsedTime,
          seat.seatNumber,
          seat.seatId === currentSpeakerSeatId
        );
      }

      updatePathLine(seat.seatId, track, showPaths);
    }

    const prevPhase = phase;
    if (seatedCount >= realCount && realCount > 0) {
      phase = 'IN_SESSION';
    } else {
      phase = 'GATHERING';
    }

    if (prevPhase !== phase || Math.floor(elapsedSeconds * 4) !== Math.floor((elapsedSeconds - clampedDt) * 4)) {
      emitStatus();
    }

    return true;
  }

  function getStatus(): AllAgentMeetingDemoStatus {
    let seatedCount = 0;
    let walkingCount = 0;
    let waitingDepartureCount = 0;
    let emptySeatCount = 0;
    let realParticipantCount = 0;

    const speakerIdx = Math.floor(elapsedSeconds / 4.0) % SPEAKER_ROTATION_ORDER.length;
    const activeSpeakerSeatId =
      active && phase === 'IN_SESSION' ? SPEAKER_ROTATION_ORDER[speakerIdx] : null;
    let activeSpeakerLabel: string | null = null;

    const seatsStatus: AllAgentMeetingSeatRuntimeStatus[] = HUB_MEETING_SEATS_LIST.map((seat) => {
      const track = tracks.get(seat.seatId)!;
      if (seat.isRealAvailableCharacter) {
        realParticipantCount++;
      } else {
        emptySeatCount++;
      }

      if (track.state === 'SEATED_IN_MEETING') seatedCount++;
      else if (track.state === 'WALKING_TO_HUB' || track.state === 'APPROACHING_CHAIR') walkingCount++;
      else if (track.state === 'WAITING_DEPARTURE') waitingDepartureCount++;

      if (seat.seatId === activeSpeakerSeatId) {
        activeSpeakerLabel = seat.assignedDisplayName;
      }

      let statusBadgeLabel = 'In Department Room';
      switch (track.state) {
        case 'WAITING_DEPARTURE':
          statusBadgeLabel = `Departing (${Math.max(0, track.staggerRemainingSec).toFixed(1)}s)`;
          break;
        case 'WALKING_TO_HUB':
          statusBadgeLabel = 'Walking to Central Hub';
          break;
        case 'APPROACHING_CHAIR':
          statusBadgeLabel = 'Approaching Seat';
          break;
        case 'SEATED_IN_MEETING':
          statusBadgeLabel =
            seat.seatId === activeSpeakerSeatId ? 'Speaking in Meeting' : 'Seated in Meeting';
          break;
        case 'EMPTY_OWNER_RESERVED':
          statusBadgeLabel = 'Empty — Owner Reserved';
          break;
        case 'EMPTY_PLANNED_AGENT':
          statusBadgeLabel = 'Empty — Planned V2 Agent';
          break;
        default:
          statusBadgeLabel = 'Working in Room';
      }

      return {
        seatId: seat.seatId,
        seatNumber: seat.seatNumber,
        side: seat.side,
        assignedRoleId: seat.assignedRoleId,
        assignedDisplayName: seat.assignedDisplayName,
        departmentRoomKey: seat.departmentRoomKey,
        isRealAvailableCharacter: seat.isRealAvailableCharacter,
        runtimeState: track.state,
        statusBadgeLabel,
        globalSeatPosition: seat.globalSeatPosition,
        currentGlobalPosition: [
          Number(track.globalPos[0].toFixed(2)),
          Number(track.globalPos[1].toFixed(2)),
          Number(track.globalPos[2].toFixed(2)),
        ],
        facingRad: Number(track.facingRad.toFixed(2)),
        remainingWaypoints: track.waypoints.length,
      };
    });

    return {
      active,
      phase,
      elapsedSeconds: Number(elapsedSeconds.toFixed(1)),
      totalSeats: HUB_MEETING_SEATS_LIST.length,
      realParticipantCount,
      seatedCount,
      walkingCount,
      waitingDepartureCount,
      emptySeatCount,
      activeSpeakerSeatId,
      activeSpeakerLabel,
      seats: seatsStatus,
    };
  }

  return {
    helpersGroup,
    startMeetingDemo,
    stopMeetingDemo,
    resetMeetingDemo,
    teleportAllToSeatsImmediate,
    update,
    getStatus,
    isActive: () => active,
  };
}
