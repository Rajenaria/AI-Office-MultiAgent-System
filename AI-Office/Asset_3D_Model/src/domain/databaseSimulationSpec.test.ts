import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DATABASE_ACTION_LIST,
  DATABASE_ACTIONS,
  DATABASE_AUTO_DEMO_SEQUENCE,
  DATABASE_CHARACTER_CONSTANTS,
  DATABASE_EXPRESSION_PRESETS,
  DATABASE_HAIR_MATERIAL_PALETTE,
  DATABASE_PATROL_ANCHOR_RING,
  DATABASE_REQUIRED_ANIMATION_CLIPS,
  DATABASE_WALK_WAYPOINTS,
  findDatabaseWalkablePath,
  getEngineeringAnchorForDatabaseOrThrow,
} from './databaseSimulationSpec';
import { ENGINEERING_ANCHORS } from './engineeringRoomSpec';

test('DATABASE_CHARACTER_CONSTANTS defines canonical database_developer_agent identity and 1.725u scale', () => {
  assert.equal(DATABASE_CHARACTER_CONSTANTS.CHARACTER_ID, 'database_developer_agent');
  assert.equal(
    DATABASE_CHARACTER_CONSTANTS.ASSET_ID,
    'ai_office.character.database_developer_agent.v1'
  );
  assert.equal(DATABASE_CHARACTER_CONSTANTS.DISPLAY_NAME, 'Database Developer');
  assert.equal(DATABASE_CHARACTER_CONSTANTS.DEPARTMENT, 'Engineering');
  assert.equal(DATABASE_CHARACTER_CONSTANTS.ROOM_ID, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(DATABASE_CHARACTER_CONSTANTS.ROOT_NODE_NAME, 'Database_Developer_Agent_Root');
  assert.equal(DATABASE_CHARACTER_CONSTANTS.RUNTIME_ROOT_NAME, 'DATABASE_AGENT_RUNTIME_ROOT');
  assert.equal(DATABASE_CHARACTER_CONSTANTS.TARGET_HEIGHT_M, 1.725);
  assert.equal(DATABASE_CHARACTER_CONSTANTS.GROUND_Y, 0.0);
  assert.equal(DATABASE_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR, 'DB_WORKSTATION_APPROACH');
});

test('DATABASE_HAIR_MATERIAL_PALETTE defines 5 controlled matte dark chestnut-brown shades', () => {
  assert.equal(DATABASE_HAIR_MATERIAL_PALETTE.length, 5);
  for (const mat of DATABASE_HAIR_MATERIAL_PALETTE) {
    assert.ok(mat.hex.startsWith('#'));
    assert.ok(mat.roughness >= 0.8, `Expected matte roughness >= 0.8 for ${mat.id}`);
    assert.ok(mat.metalness <= 0.1, `Expected low metalness <= 0.1 for ${mat.id}`);
  }
});

test('DATABASE_ACTION_LIST defines all 19 required Database Developer actions mapped to valid Engineering anchors and embedded clips', () => {
  assert.equal(DATABASE_ACTION_LIST.length, 19);
  assert.equal(DATABASE_REQUIRED_ANIMATION_CLIPS.length, 21);

  const validAnchorNames = new Set(ENGINEERING_ANCHORS.map((a) => a.name));
  const validClipNames = new Set(DATABASE_REQUIRED_ANIMATION_CLIPS);

  for (const action of DATABASE_ACTION_LIST) {
    assert.ok(
      validAnchorNames.has(action.targetAnchorName as never),
      `Action ${action.id} references unknown anchor ${action.targetAnchorName}`
    );
    assert.ok(
      validClipNames.has(action.clipName),
      `Action ${action.id} references unknown clip ${action.clipName}`
    );
    assert.ok(action.bubbleText.length > 10);
    assert.ok(action.thoughtText.length > 10);
  }
});

test('DATABASE_EXPRESSION_PRESETS defines all 9 lightweight voxel facial expressions', () => {
  const keys = Object.keys(DATABASE_EXPRESSION_PRESETS);
  assert.equal(keys.length, 9);
  assert.deepEqual(keys, [
    'neutral',
    'happy',
    'focused',
    'thinking',
    'concerned',
    'surprised',
    'talking',
    'confident',
    'tired',
  ]);
});

test('DATABASE_AUTO_DEMO_SEQUENCE and DATABASE_PATROL_ANCHOR_RING reference valid actions and anchors', () => {
  assert.equal(DATABASE_AUTO_DEMO_SEQUENCE.length, 12);
  for (const step of DATABASE_AUTO_DEMO_SEQUENCE) {
    assert.ok(DATABASE_ACTIONS[step.actionId], `Invalid demo actionId ${step.actionId}`);
    assert.ok(step.holdDurationSec >= 1.5);
  }

  for (const anchorName of DATABASE_PATROL_ANCHOR_RING) {
    const anchor = getEngineeringAnchorForDatabaseOrThrow(anchorName);
    assert.equal(anchor.name, anchorName);
  }
});

test('findDatabaseWalkablePath routes cleanly inside 8x16 Engineering Studio bounds between Database Desk, Schema Board, and Architecture Board', () => {
  for (const wp of Object.values(DATABASE_WALK_WAYPOINTS)) {
    assert.ok(wp.position[0] > 0.4 && wp.position[0] < 7.6);
    assert.ok(wp.position[1] > 0.4 && wp.position[1] < 15.6);
  }

  const approach = getEngineeringAnchorForDatabaseOrThrow('DB_WORKSTATION_APPROACH');
  const desk = getEngineeringAnchorForDatabaseOrThrow('DB_DESK_WORK');
  const archBoard = getEngineeringAnchorForDatabaseOrThrow('ENG_ARCHITECTURE_BOARD');

  const pathToDesk = findDatabaseWalkablePath(
    [approach.position[0], approach.position[2]],
    [desk.position[0], desk.position[2]]
  );
  assert.ok(pathToDesk.length >= 2);

  const pathToArchBoard = findDatabaseWalkablePath(
    [desk.position[0], desk.position[2]],
    [archBoard.position[0], archBoard.position[2]]
  );
  assert.ok(pathToArchBoard.length >= 3);
  for (const [x, z] of pathToArchBoard) {
    assert.ok(x >= 0.45 && x <= 7.55);
    assert.ok(z >= 0.45 && z <= 15.55);
  }
});
