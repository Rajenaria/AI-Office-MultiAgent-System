import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_UIUX_ANCHORS,
  UIUX_CAMERA_PRESETS,
  UIUX_CONNECTORS_SPEC,
  UIUX_FURNITURE_CATALOG,
  UIUX_FUTURE_ACTIONS_CONTRACT,
  UIUX_MODULE_CONSTANTS,
  buildUIUXRoomBehaviorJson,
  checkUIUXFurnitureClearance,
} from './uiuxRoomSpec';

test('UI/UX Design Studio specification matches 8x8x3.2 modular block standard at A3 [24, 0, 18]', () => {
  assert.equal(UIUX_MODULE_CONSTANTS.MODULE_ID, 'AI_OFFICE_ROOM_UIUX_v1');
  assert.equal(UIUX_MODULE_CONSTANTS.DISPLAY_NAME, 'UI/UX Design Studio');
  assert.equal(UIUX_MODULE_CONSTANTS.DEPARTMENT_TYPE, 'Design / Product Experience');
  assert.equal(UIUX_MODULE_CONSTANTS.FOOTPRINT_WIDTH, 8.0);
  assert.equal(UIUX_MODULE_CONSTANTS.FOOTPRINT_DEPTH, 8.0);
  assert.equal(UIUX_MODULE_CONSTANTS.WALL_HEIGHT, 3.2);
  assert.deepEqual(UIUX_MODULE_CONSTANTS.LOCAL_ORIGIN, [0, 0, 0]);
  assert.deepEqual(UIUX_MODULE_CONSTANTS.GLOBAL_A3_OFFSET, [24, 0, 18]);
  assert.equal(UIUX_MODULE_CONSTANTS.GLB_FILENAME, 'uiux_room.glb');
  assert.equal(UIUX_MODULE_CONSTANTS.MANIFEST_FILENAME, 'uiux-room.manifest.json');
  assert.equal(UIUX_MODULE_CONSTANTS.ANCHORS_FILENAME, 'uiux-room.anchors.json');
  assert.equal(UIUX_MODULE_CONSTANTS.PREVIEW_FILENAME, 'uiux_room.preview.png');
  assert.deepEqual(UIUX_CONNECTORS_SPEC.SOUTH.position, [4, 0, 0]);
});

test('UI/UX Design Studio defines 10 valid room-local anchors and 10 future behavior contracts', () => {
  const anchors = Object.values(DEFAULT_UIUX_ANCHORS);
  assert.equal(anchors.length, 10);
  assert.ok(DEFAULT_UIUX_ANCHORS.UIUX_ROOM_SPAWN);
  assert.ok(DEFAULT_UIUX_ANCHORS.UIUX_ROOM_IDLE);
  assert.ok(DEFAULT_UIUX_ANCHORS.UIUX_DESK_APPROACH);
  assert.ok(DEFAULT_UIUX_ANCHORS.UIUX_DESK_WORK);
  assert.ok(DEFAULT_UIUX_ANCHORS.UIUX_WIREFRAME_WALL);
  assert.ok(DEFAULT_UIUX_ANCHORS.UIUX_STYLE_BOARD);
  assert.ok(DEFAULT_UIUX_ANCHORS.UIUX_REVIEW_TABLE);
  assert.ok(DEFAULT_UIUX_ANCHORS.UIUX_PRESENTATION_POSITION);
  assert.ok(DEFAULT_UIUX_ANCHORS.UIUX_STORAGE_SHELF);
  assert.ok(DEFAULT_UIUX_ANCHORS.UIUX_SOUTH_EXIT);

  const behavior = buildUIUXRoomBehaviorJson();
  assert.equal(behavior.room_module_id, 'AI_OFFICE_ROOM_UIUX_v1');
  assert.equal(behavior.future_actions.length, UIUX_FUTURE_ACTIONS_CONTRACT.length);
  assert.equal(UIUX_CAMERA_PRESETS.length, 8);
});

test('UI/UX Design Studio furniture catalog has 10 items across 6 creative zones with zero connector obstructions', () => {
  assert.equal(UIUX_FURNITURE_CATALOG.length, 10);
  const clearance = checkUIUXFurnitureClearance();
  assert.equal(clearance.valid, true, `Clearance violations: ${clearance.violations.join(', ')}`);
  assert.equal(clearance.southConnectorClear, true);
  assert.equal(clearance.withinRoomBounds, true);
  assert.equal(clearance.anchorsUnobstructed, true);
});
