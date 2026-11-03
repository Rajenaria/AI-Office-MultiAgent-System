import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UIUX_AUTO_DEMO_SEQUENCE,
  UIUX_CHARACTER_CONSTANTS,
  UIUX_DEMO_ACTIONS,
  UIUX_EXPRESSIONS,
  UIUX_WALK_WAYPOINTS,
  checkUIUXWaypointsClearance,
  findUIUXWalkablePath,
} from './uiuxSimulationSpec';

test('UIUX_CHARACTER_CONSTANTS defines canonical uiux_designer_agent identity and 1.725u scale', () => {
  assert.equal(UIUX_CHARACTER_CONSTANTS.CHARACTER_ID, 'uiux_designer_agent');
  assert.equal(UIUX_CHARACTER_CONSTANTS.DISPLAY_NAME, 'UI/UX Designer');
  assert.equal(UIUX_CHARACTER_CONSTANTS.DEPARTMENT, 'Design');
  assert.equal(UIUX_CHARACTER_CONSTANTS.ROOM_AFFILIATION, 'AI_OFFICE_ROOM_UIUX_v1');
  assert.equal(UIUX_CHARACTER_CONSTANTS.GLB_FILENAME, 'uiux_designer_agent.glb');
  assert.equal(UIUX_CHARACTER_CONSTANTS.MANIFEST_FILENAME, 'uiux_designer_agent.manifest.json');
  assert.equal(UIUX_CHARACTER_CONSTANTS.BEHAVIOR_FILENAME, 'uiux_designer_agent.behavior.json');
  assert.equal(UIUX_CHARACTER_CONSTANTS.PREVIEW_FILENAME, 'uiux_designer_agent_preview.png');
  assert.equal(UIUX_CHARACTER_CONSTANTS.TARGET_HEIGHT_UNITS, 1.725);
});

test('UIUX_DEMO_ACTIONS defines all 15 required UI/UX Designer simulation actions with embedded clip names and SIMULASI / DEMO badges', () => {
  assert.equal(UIUX_DEMO_ACTIONS.length, 15);
  const expectedClips = [
    'Idle_Breathing',
    'Walk_Cycle',
    'Talk',
    'Present',
    'Think',
    'Read',
    'Review',
    'Sketch',
    'Laptop_Work',
    'Prototype_Review',
    'Design_System_Work',
    'User_Flow_Analysis',
    'Coffee_Break',
    'Approve',
    'Task_Completed',
  ];
  for (const clipName of expectedClips) {
    assert.ok(
      UIUX_DEMO_ACTIONS.some((a) => a.clipName === clipName),
      `Missing clip ${clipName} in UIUX_DEMO_ACTIONS`
    );
  }
  for (const act of UIUX_DEMO_ACTIONS) {
    assert.ok(act.statusBadgeText.includes('SIMULASI / DEMO'));
  }
});

test('UIUX_EXPRESSIONS defines all 8 required voxel facial expressions', () => {
  assert.equal(UIUX_EXPRESSIONS.length, 8);
  const ids = UIUX_EXPRESSIONS.map((e) => e.id);
  assert.deepEqual(ids, [
    'neutral',
    'focused',
    'talking',
    'thinking',
    'happy',
    'concerned',
    'inspired',
    'confident',
  ]);
});

test('findUIUXWalkablePath routes behind-desk seated actions via WP_UIUX_DESK_APPROACH [4.25, 6.45] without clipping', () => {
  const path = findUIUXWalkablePath([3.85, 3.85], [5.35, 6.42]);
  assert.ok(path.length >= 2);
  assert.ok(
    path.some((pt) => Math.abs(pt[0] - 4.25) < 0.05 && Math.abs(pt[1] - 6.45) < 0.05),
    'Expected path to route via WP_UIUX_DESK_APPROACH [4.25, 6.45]'
  );
  const last = path[path.length - 1];
  assert.ok(Math.abs(last[0] - 5.35) < 0.05 && Math.abs(last[1] - 6.42) < 0.05);
});

test('UIUX_WALK_WAYPOINTS are clear of room furniture obstacles and UIUX_AUTO_DEMO_SEQUENCE valid', () => {
  assert.ok(UIUX_WALK_WAYPOINTS.length >= 10);
  const clearance = checkUIUXWaypointsClearance();
  assert.equal(clearance.valid, true, `Violations: ${clearance.violations.join(', ')}`);
  assert.equal(UIUX_AUTO_DEMO_SEQUENCE.length, 9);
});
