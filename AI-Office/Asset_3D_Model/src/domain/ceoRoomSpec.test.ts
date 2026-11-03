import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CEO_CONNECTORS_SPEC,
  CEO_DEMO_TELEMETRY,
  CEO_FURNITURE_CATALOG,
  CEO_FUTURE_ACTIONS_CONTRACT,
  CEO_MODULE_CONSTANTS,
  DEFAULT_CEO_ANCHORS,
  buildCEORoomBehaviorJson,
  checkCEOFurnitureClearance,
} from './ceoRoomSpec';

test('CEO Executive Brain Office specification matches 8x8x3.2 modular block standard', () => {
  assert.equal(CEO_MODULE_CONSTANTS.MODULE_ID, 'AI_OFFICE_ROOM_CEO_v1');
  assert.equal(CEO_MODULE_CONSTANTS.ROOT_NODE_NAME, 'ROOM_CEO_ROOT');
  assert.equal(CEO_MODULE_CONSTANTS.FOOTPRINT_WIDTH, 8.0);
  assert.equal(CEO_MODULE_CONSTANTS.FOOTPRINT_DEPTH, 8.0);
  assert.equal(CEO_MODULE_CONSTANTS.WALL_HEIGHT, 3.2);
  assert.deepEqual(CEO_MODULE_CONSTANTS.GLOBAL_A3_OFFSET, [16, 0, 18]);

  assert.deepEqual(CEO_CONNECTORS_SPEC.WEST.position, [0, 0, 4]);
  assert.deepEqual(CEO_CONNECTORS_SPEC.SOUTH.position, [4, 0, 0]);
});

test('CEO Room defines 11 valid local navigation anchors and 11 future behavior contracts', () => {
  const anchors = Object.values(DEFAULT_CEO_ANCHORS);
  assert.equal(anchors.length, 11);

  for (const anc of anchors) {
    assert.ok(anc.position[0] >= 0 && anc.position[0] <= 8, `Anchor ${anc.id} X in bounds`);
    assert.equal(anc.position[1], 0);
    assert.ok(anc.position[2] >= 0 && anc.position[2] <= 8, `Anchor ${anc.id} Z in bounds`);
  }

  assert.equal(CEO_FUTURE_ACTIONS_CONTRACT.length, 11);
  for (const act of CEO_FUTURE_ACTIONS_CONTRACT) {
    assert.ok(
      DEFAULT_CEO_ANCHORS[act.targetAnchorId],
      `Future action ${act.id} maps to valid anchor ${act.targetAnchorId}`
    );
  }

  const behaviorJson = buildCEORoomBehaviorJson();
  assert.equal(behaviorJson.room_module_id, 'AI_OFFICE_ROOM_CEO_v1');
  assert.equal(
    behaviorJson.implementation_status,
    'METADATA_CONTRACT_ONLY — NO_CEO_CHARACTER_IN_THIS_TASK'
  );
  assert.equal(behaviorJson.future_actions.length, 11);
});

test('CEO Room furniture catalog has 10 items with zero connector obstructions and DEMO DATA telemetry', () => {
  assert.equal(CEO_FURNITURE_CATALOG.length, 10);
  const clearance = checkCEOFurnitureClearance();
  assert.equal(clearance.valid, true, `Violations: ${clearance.violations.join(', ')}`);
  assert.equal(CEO_DEMO_TELEMETRY.consolePanels.length, 7);
  assert.equal(CEO_DEMO_TELEMETRY.dataClassification, 'DEMO_DATA_ONLY');
});

