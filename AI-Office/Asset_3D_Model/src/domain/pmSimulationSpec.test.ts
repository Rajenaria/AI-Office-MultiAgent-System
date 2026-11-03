import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTO_DEMO_SEQUENCE,
  DEFAULT_ACTIVITY_ANCHORS,
  PM_DEMO_ACTIONS,
  ROOM_WALK_WAYPOINTS,
  buildSimulationExportConfig,
  findWalkablePath,
  isPointClearOfObstacles,
  shortestAngleDelta,
} from './pmSimulationSpec';

test('All 10 default activity anchors lie inside the 8x8 room bounds', () => {
  for (const [id, anchor] of Object.entries(DEFAULT_ACTIVITY_ANCHORS)) {
    const [x, y, z] = anchor.position;
    assert.ok(x >= 0.4 && x <= 7.6, `Anchor ${id} X (${x}) must be inside room bounds`);
    assert.strictEqual(y, 0, `Anchor ${id} Y (${y}) must rest on floor elevation 0`);
    assert.ok(z >= 0.4 && z <= 7.6, `Anchor ${id} Z (${z}) must be inside room bounds`);
  }
});

test('All walkable waypoints are clear of solid furniture obstacles', () => {
  for (const wp of ROOM_WALK_WAYPOINTS) {
    const check = isPointClearOfObstacles(wp.position[0], wp.position[1], 0.08);
    assert.equal(
      check.clear,
      true,
      `Waypoint ${wp.id} at [${wp.position.join(', ')}] collides with ${check.blockingItemId}`
    );
  }
});

test('findWalkablePath routes around the central sofa from South Spawn to Strategy Board', () => {
  const start = DEFAULT_ACTIVITY_ANCHORS.SPAWN_POINT.position;
  const target = DEFAULT_ACTIVITY_ANCHORS.PRESENTATION_BOARD_POSITION.position;
  const path = findWalkablePath([start[0], start[2]], [target[0], target[2]]);

  assert.ok(path.length >= 2, 'Path from South entrance to North Strategy Board should use waypoints');
  const last = path[path.length - 1];
  assert.deepEqual(last, [target[0], target[2]]);
});

test('All 11 required interactive PM demo actions are defined and labeled SIMULASI / DEMO', () => {
  assert.strictEqual(PM_DEMO_ACTIONS.length, 11);
  for (const act of PM_DEMO_ACTIONS) {
    assert.ok(
      act.statusBadgeText.includes('SIMULASI / DEMO'),
      `Action ${act.id} badge must explicitly disclose SIMULASI / DEMO`
    );
  }
});

test('Auto-demo sequence references valid PM demo actions', () => {
  const actionIds = new Set(PM_DEMO_ACTIONS.map((a) => a.id));
  assert.ok(AUTO_DEMO_SEQUENCE.length >= 7);
  for (const step of AUTO_DEMO_SEQUENCE) {
    assert.ok(actionIds.has(step.actionId), `Invalid actionId in auto-demo: ${step.actionId}`);
    assert.ok(step.durationSeconds > 0);
  }
});

test('shortestAngleDelta computes minimal signed angle in [-PI, PI]', () => {
  const delta = shortestAngleDelta(Math.PI - 0.1, -Math.PI + 0.1);
  assert.ok(Math.abs(delta - 0.2) < 1e-6);
});

import {
  createOriginalRoomNativeBossPMRuntime,
  isValidGlbBinaryBuffer,
} from '../three/BossPMCharacterSystem';

test('buildSimulationExportConfig produces complete reusable JSON configuration', () => {
  const cfg = buildSimulationExportConfig(DEFAULT_ACTIVITY_ANCHORS, null, 'original_pm');
  assert.strictEqual(cfg.room_module_id, 'AI_OFFICE_ROOM_PM_v1');
  assert.strictEqual(cfg.simulation_mode, 'VISUAL_DEMONSTRATION_ONLY');
  assert.strictEqual(cfg.character_source, 'original_pm');
  assert.strictEqual(Object.keys(cfg.anchors).length, 10);
  assert.strictEqual(cfg.actions.length, 11);
});

test('Original Room-Native Boss PM builds with voxel suit, red tie, sunglasses, and 11 animation clips', () => {
  const instance = createOriginalRoomNativeBossPMRuntime();
  assert.strictEqual(instance.sourceType, 'original_pm');
  assert.strictEqual(instance.inspectionReport.assetSource, 'original_room_native');
  assert.ok(instance.inspectionReport.meshCount >= 25, 'Original voxel Boss PM must contain detailed voxel sub-meshes');
  assert.strictEqual(instance.inspectionReport.animationClips.length, 11);
  assert.ok(instance.loadedScene.getObjectByName('Red_Necktie_Blade'));
  assert.ok(instance.loadedScene.getObjectByName('Sunglasses_Frame_L'));
  assert.ok(instance.loadedScene.getObjectByName('Suit_Jacket_Body'));
});

test('isValidGlbBinaryBuffer validates glTF 2.0 binary magic header', () => {
  const validBuf = new ArrayBuffer(24);
  const view = new DataView(validBuf);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  assert.strictEqual(isValidGlbBinaryBuffer(validBuf), true);

  const invalidBuf = new ArrayBuffer(24);
  assert.strictEqual(isValidGlbBinaryBuffer(invalidBuf), false);
});

