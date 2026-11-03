import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CEO_AUTO_DEMO_SEQUENCE,
  CEO_CHARACTER_CONSTANTS,
  CEO_DEMO_ACTIONS,
  CEO_EXPRESSIONS,
  CEO_WALK_WAYPOINTS,
  findCEOWalkablePath,
  getCEOActionDef,
  isCEOPointClearOfObstacles,
} from './ceoSimulationSpec';

test('CEO_CHARACTER_CONSTANTS defines canonical ceo_executive_assistant identity and 1.725u scale', () => {
  assert.strictEqual(CEO_CHARACTER_CONSTANTS.CHARACTER_ID, 'ceo_executive_assistant');
  assert.strictEqual(
    CEO_CHARACTER_CONSTANTS.ASSET_ID,
    'ai_office.character.ceo_executive_assistant.v1'
  );
  assert.strictEqual(CEO_CHARACTER_CONSTANTS.DISPLAY_NAME, 'CEO Executive Assistant');
  assert.strictEqual(CEO_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID, 'AI_OFFICE_ROOM_CEO_v1');
  assert.strictEqual(CEO_CHARACTER_CONSTANTS.TARGET_HEIGHT_UNITS, 1.725);
});

test('CEO_DEMO_ACTIONS defines all 14 required executive simulation actions with embedded clip names', () => {
  assert.strictEqual(CEO_DEMO_ACTIONS.length, 14);
  const clipNames = new Set(CEO_DEMO_ACTIONS.map((a) => a.clipName));
  assert.strictEqual(clipNames.size, 14);

  const requiredClips = [
    'Idle_Breathing',
    'Walk_Cycle',
    'Work_Desk',
    'Review_PM_Report',
    'Analyze_Executive_Brain',
    'Discuss_With_PM',
    'Present_Strategy',
    'Think_Strategy',
    'Phone_Call',
    'Coffee_Break',
    'Waiting_Owner_Approval',
    'Prepare_Executive_Digest',
    'Send_Report_Demo',
    'Task_Completed',
  ];
  for (const clip of requiredClips) {
    assert.ok(clipNames.has(clip), `Missing required CEO AnimationClip ${clip}`);
  }
});

test('CEO_EXPRESSIONS defines all 7 required facial expressions', () => {
  assert.strictEqual(CEO_EXPRESSIONS.length, 7);
  const ids = CEO_EXPRESSIONS.map((e) => e.id);
  assert.deepStrictEqual(ids, [
    'neutral',
    'focused',
    'happy',
    'thinking',
    'concerned',
    'talking',
    'confident',
  ]);
});

test('findCEOWalkablePath routes behind-desk seated actions via CEO_DESK_APPROACH [3.25, 0, 6.55] without clipping', () => {
  const start: [number, number] = [4.35, 4.15];
  const deskSeat: [number, number] = [4.5, 6.38];

  const path = findCEOWalkablePath(start, deskSeat);
  assert.ok(path.length >= 2, 'Path to behind-desk chair must include approach waypoint');
  const hasApproachWaypoint = path.some(
    (pt) => Math.hypot(pt[0] - 3.25, pt[1] - 6.55) < 0.05
  );
  assert.ok(
    hasApproachWaypoint,
    `Expected path to route via CEO_DESK_APPROACH [3.25, 6.55], got ${JSON.stringify(path)}`
  );
  assert.deepStrictEqual(path[path.length - 1], deskSeat);
});

test('CEO_WALK_WAYPOINTS are all clear of room furniture obstacles and CEO_AUTO_DEMO_SEQUENCE valid', () => {
  for (const wp of CEO_WALK_WAYPOINTS) {
    assert.ok(
      isCEOPointClearOfObstacles(wp.position[0], wp.position[1]),
      `Waypoint ${wp.id} [${wp.position.join(', ')}] collides with obstacle`
    );
  }
  assert.ok(CEO_AUTO_DEMO_SEQUENCE.length >= 8);
  for (const step of CEO_AUTO_DEMO_SEQUENCE) {
    const def = getCEOActionDef(step.actionId);
    assert.strictEqual(def.id, step.actionId);
    assert.ok(step.durationSeconds > 0);
  }
});
