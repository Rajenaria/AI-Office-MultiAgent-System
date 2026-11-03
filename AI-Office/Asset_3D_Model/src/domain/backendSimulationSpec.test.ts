import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BACKEND_ACTION_LIST,
  BACKEND_ACTIONS,
  BACKEND_AUTO_DEMO_SEQUENCE,
  BACKEND_CHARACTER_CONSTANTS,
  BACKEND_EXPRESSION_PRESETS,
  BACKEND_HAIR_MATERIAL_PALETTE,
  BACKEND_PATROL_ANCHOR_RING,
  BACKEND_REQUIRED_ANIMATION_CLIPS,
  BACKEND_REQUIRED_EXPRESSIONS,
  findBackendWalkablePath,
  getEngineeringAnchorForBackendOrThrow,
} from './backendSimulationSpec';
import { ENGINEERING_ANCHORS, ENGINEERING_ROOM_DIMENSIONS } from './engineeringRoomSpec';

describe('backendSimulationSpec — AI Office Engineering Agent 02: Backend Developer V1', () => {
  it('defines canonical Backend Developer metadata and 1.725m target height', () => {
    assert.equal(BACKEND_CHARACTER_CONSTANTS.CHARACTER_ID, 'backend_developer_agent');
    assert.equal(
      BACKEND_CHARACTER_CONSTANTS.ASSET_ID,
      'ai_office.character.backend_developer_agent.v1',
    );
    assert.equal(BACKEND_CHARACTER_CONSTANTS.DISPLAY_NAME, 'Backend Developer');
    assert.equal(BACKEND_CHARACTER_CONSTANTS.DEPARTMENT, 'Engineering');
    assert.equal(BACKEND_CHARACTER_CONSTANTS.ROOM_ID, 'AI_OFFICE_ROOM_ENGINEERING_v1');
    assert.equal(BACKEND_CHARACTER_CONSTANTS.ROLE_TYPE, 'BACKEND_ENGINEER');
    assert.equal(BACKEND_CHARACTER_CONSTANTS.ROOT_NODE_NAME, 'Backend_Developer_Agent_Root');
    assert.equal(BACKEND_CHARACTER_CONSTANTS.RUNTIME_ROOT_NAME, 'BACKEND_AGENT_RUNTIME_ROOT');
    assert.equal(BACKEND_CHARACTER_CONSTANTS.TARGET_HEIGHT_M, 1.725);
    assert.equal(BACKEND_CHARACTER_CONSTANTS.DEFAULT_IDLE_ANCHOR, 'BE_WORKSTATION_APPROACH');
  });

  it('defines the 4 controlled dark chocolate-brown voxel hair materials with matte roughness', () => {
    assert.equal(BACKEND_HAIR_MATERIAL_PALETTE.length, 4);
    const roles = BACKEND_HAIR_MATERIAL_PALETTE.map((m) => m.role);
    assert.deepEqual(roles, ['base', 'shadow', 'midtone', 'highlight']);
    for (const mat of BACKEND_HAIR_MATERIAL_PALETTE) {
      assert.match(mat.hex, /^#[0-9A-F]{6}$/i);
      assert.ok(mat.roughness >= 0.72 && mat.roughness <= 0.92, `Matte roughness for ${mat.id}`);
      assert.ok(mat.metalness <= 0.08, `Low metalness for ${mat.id}`);
    }
  });

  it('defines all 17 required animation clips and 17 Backend actions mapped to valid Engineering Studio anchors', () => {
    assert.equal(BACKEND_REQUIRED_ANIMATION_CLIPS.length, 17);
    assert.equal(BACKEND_ACTION_LIST.length, 17);

    const anchorNames = new Set(ENGINEERING_ANCHORS.map((a) => a.name));
    for (const action of BACKEND_ACTION_LIST) {
      assert.ok(
        BACKEND_REQUIRED_ANIMATION_CLIPS.includes(action.clipName),
        `Action ${action.id} clip ${action.clipName} must be in BACKEND_REQUIRED_ANIMATION_CLIPS`,
      );
      assert.ok(
        anchorNames.has(action.targetAnchorName),
        `Action ${action.id} targetAnchorName ${action.targetAnchorName} must exist in ENGINEERING_ANCHORS`,
      );
      const anchor = getEngineeringAnchorForBackendOrThrow(action.targetAnchorName);
      assert.ok(anchor.position[0] > 0 && anchor.position[0] < ENGINEERING_ROOM_DIMENSIONS.width);
      assert.ok(anchor.position[2] > 0 && anchor.position[2] < ENGINEERING_ROOM_DIMENSIONS.length);
    }

    // Seated actions must target BE_DESK_WORK
    assert.equal(BACKEND_ACTIONS.WORK_TYPING.posture, 'seated');
    assert.equal(BACKEND_ACTIONS.WORK_TYPING.targetAnchorName, 'BE_DESK_WORK');
    assert.equal(BACKEND_ACTIONS.API_DEVELOPMENT.posture, 'seated');
    assert.equal(BACKEND_ACTIONS.DEBUG_BACKEND.posture, 'seated');
    assert.equal(BACKEND_ACTIONS.REVIEW_SERVICE_LOGS.posture, 'seated');
  });

  it('defines all 9 facial expression presets and 12 auto-demo steps', () => {
    assert.equal(BACKEND_REQUIRED_EXPRESSIONS.length, 9);
    for (const exprId of BACKEND_REQUIRED_EXPRESSIONS) {
      assert.ok(BACKEND_EXPRESSION_PRESETS[exprId], `Missing preset for ${exprId}`);
    }
    assert.equal(BACKEND_AUTO_DEMO_SEQUENCE.length, 12);
    for (const step of BACKEND_AUTO_DEMO_SEQUENCE) {
      assert.ok(BACKEND_ACTIONS[step.actionId], `Invalid demo step action ${step.actionId}`);
      assert.ok(step.holdDurationSec > 0);
    }
    for (const anchorName of BACKEND_PATROL_ANCHOR_RING) {
      assert.ok(getEngineeringAnchorForBackendOrThrow(anchorName));
    }
  });

  it('computes collision-free paths between Backend Workstation, API Board, Architecture Board, and DB Schema Review', () => {
    const approach = getEngineeringAnchorForBackendOrThrow('BE_WORKSTATION_APPROACH');
    const beDesk = getEngineeringAnchorForBackendOrThrow('BE_DESK_WORK');
    const apiBoard = getEngineeringAnchorForBackendOrThrow('BE_API_BOARD');
    const archBoard = getEngineeringAnchorForBackendOrThrow('ENG_ARCHITECTURE_BOARD');
    const dbReview = getEngineeringAnchorForBackendOrThrow('DB_SCHEMA_REVIEW');

    const pairs: Array<[string, [number, number], [number, number]]> = [
      [
        'Approach -> BE Desk',
        [approach.position[0], approach.position[2]],
        [beDesk.position[0], beDesk.position[2]],
      ],
      [
        'BE Desk -> API Board',
        [beDesk.position[0], beDesk.position[2]],
        [apiBoard.position[0], apiBoard.position[2]],
      ],
      [
        'API Board -> Architecture Board',
        [apiBoard.position[0], apiBoard.position[2]],
        [archBoard.position[0], archBoard.position[2]],
      ],
      [
        'Architecture Board -> DB Schema Review',
        [archBoard.position[0], archBoard.position[2]],
        [dbReview.position[0], dbReview.position[2]],
      ],
    ];

    for (const [label, start, goal] of pairs) {
      const path = findBackendWalkablePath(start, goal);
      assert.ok(path.length >= 1, `Path for ${label} should not be empty`);
      const last = path[path.length - 1];
      assert.ok(Math.hypot(last[0] - goal[0], last[1] - goal[1]) < 0.05, `End of ${label}`);
      for (const [x, z] of path) {
        assert.ok(x >= 0.4 && x <= 7.6, `X within room bounds for ${label}`);
        assert.ok(z >= 0.4 && z <= 15.6, `Z within room bounds for ${label}`);
      }
    }
  });
});
