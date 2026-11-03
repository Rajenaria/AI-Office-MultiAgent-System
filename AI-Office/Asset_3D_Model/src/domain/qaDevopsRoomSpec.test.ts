import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_QA_DEVOPS_ANCHOR_LIST,
  DEFAULT_QA_DEVOPS_ANCHORS,
  QA_DEVOPS_CONNECTORS_SPEC,
  QA_DEVOPS_DISPLAY_SLOTS,
  QA_DEVOPS_FURNITURE_CATALOG,
  QA_DEVOPS_FUTURE_ACTIONS_CONTRACT,
  QA_DEVOPS_MODULE_CONSTANTS,
  buildQADevOpsDisplaySlotsJson,
  buildQADevOpsRoomBehaviorJson,
  validateQADevOpsBoundingBox,
  validateQADevOpsClearanceAndConnectors,
  verifyQADevOpsMonitorsOrientation,
} from './qaDevopsRoomSpec';

describe('QA & DevOps Integrated Studio Spec (AI_OFFICE_ROOM_QA_DEVOPS_v1)', () => {
  it('defines canonical 8x16x3.2 room constants at local [0,0,0] and global A3.2 [24,0,0]', () => {
    assert.equal(QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID, 'AI_OFFICE_ROOM_QA_DEVOPS_v1');
    assert.equal(QA_DEVOPS_MODULE_CONSTANTS.ASSET_ID, 'ai_office.room.qa_devops_studio.v1');
    assert.equal(QA_DEVOPS_MODULE_CONSTANTS.ROOT_NODE_NAME, 'ROOM_QA_DEVOPS_ROOT');
    assert.equal(QA_DEVOPS_MODULE_CONSTANTS.FOOTPRINT_WIDTH, 8.0);
    assert.equal(QA_DEVOPS_MODULE_CONSTANTS.FOOTPRINT_DEPTH, 16.0);
    assert.equal(QA_DEVOPS_MODULE_CONSTANTS.WALL_HEIGHT, 3.2);
    assert.deepEqual(QA_DEVOPS_MODULE_CONSTANTS.LOCAL_ORIGIN, [0, 0, 0]);
    assert.deepEqual(QA_DEVOPS_MODULE_CONSTANTS.GLOBAL_A3_2_OFFSET, [24, 0, 0]);
    assert.equal(QA_DEVOPS_MODULE_CONSTANTS.REQUIRED_GROUPS.length, 8);
  });

  it('defines West Central Hub connector [0,0,8] and North Corridor connector [4,0,16] with zero furniture obstruction', () => {
    const west = QA_DEVOPS_CONNECTORS_SPEC.QA_DEVOPS_WEST_MAIN;
    assert.deepEqual(west.localPosition, [0, 0, 8]);
    assert.deepEqual(west.global_position, [24, 0, 8]);
    assert.equal(west.width, 2.0);
    assert.equal(west.height, 2.3);

    const north = QA_DEVOPS_CONNECTORS_SPEC.QA_DEVOPS_NORTH_CORRIDOR;
    assert.deepEqual(north.localPosition, [4, 0, 16]);
    assert.deepEqual(north.global_position, [28, 0, 16]);
    assert.equal(north.width, 2.0);
    assert.equal(north.height, 2.3);

    const clearance = validateQADevOpsClearanceAndConnectors();
    assert.equal(
      clearance.passed,
      true,
      `Clearance collisions: ${clearance.collisions.join(', ')}`
    );
    assert.equal(clearance.westConnectorClear, true);
    assert.equal(clearance.northConnectorClear, true);
    assert.equal(clearance.noWallAtMidpointZ8, true);
  });

  it('defines all 23 required room-local anchors across General, QA, DevOps, and Shared Cozy Lounge zones', () => {
    const requiredIds = [
      'QA_DEVOPS_ROOM_SPAWN',
      'QA_DEVOPS_ROOM_IDLE',
      'QA_DEVOPS_WEST_EXIT',
      'QA_DEVOPS_NORTH_EXIT',
      'QA_WORKSTATION_APPROACH',
      'QA_DESK_WORK',
      'QA_CHAIR',
      'QA_DEVICE_TESTING',
      'QA_CHECKLIST_BOARD',
      'QA_BUG_REVIEW',
      'QA_TEST_REPORT_REVIEW',
      'DEVOPS_WORKSTATION_APPROACH',
      'DEVOPS_DESK_WORK',
      'DEVOPS_CHAIR',
      'DEVOPS_RACK_INSPECTION',
      'DEVOPS_MONITORING_DISPLAY',
      'DEVOPS_INFRASTRUCTURE_REVIEW',
      'QA_DEVOPS_REVIEW_BOARD',
      'QA_DEVOPS_LOUNGE_SOFA',
      'QA_DEVOPS_LOUNGE_ARMCHAIR',
      'QA_DEVOPS_COFFEE_TABLE',
      'QA_DEVOPS_DISCUSSION_POSITION',
      'QA_DEVOPS_PRESENTATION_POSITION',
    ];
    assert.equal(DEFAULT_QA_DEVOPS_ANCHOR_LIST.length, requiredIds.length);
    for (const id of requiredIds) {
      const anchor = DEFAULT_QA_DEVOPS_ANCHORS[id as keyof typeof DEFAULT_QA_DEVOPS_ANCHORS];
      assert.ok(anchor, `Missing anchor ${id}`);
      const [x, y, z] = anchor.position;
      assert.ok(x >= 0.3 && x <= 7.7, `Anchor ${id} X out of safe bounds: ${x}`);
      assert.equal(y, 0.0, `Anchor ${id} Y must be 0.0`);
      assert.ok(z >= 0.3 && z <= 15.7, `Anchor ${id} Z out of safe bounds: ${z}`);
    }
  });

  it('verifies all 9 QA, DevOps, Device Testing, and Wall Board displays face their intended viewer (dot > 0.7)', () => {
    const check = verifyQADevOpsMonitorsOrientation();
    assert.equal(check.passed, true);
    assert.equal(check.results.length, 9);
    for (const r of check.results) {
      assert.ok(r.dotProduct > 0.7, `${r.id} dotProduct ${r.dotProduct} <= 0.7`);
    }
  });

  it('defines all 8 DEMO display slots and 29 future QA & DevOps agent action contracts', () => {
    const slotsJson = buildQADevOpsDisplaySlotsJson();
    assert.equal(slotsJson.demo_mode_only, true);
    assert.equal(slotsJson.total_display_slots, 8);
    for (const slot of QA_DEVOPS_DISPLAY_SLOTS) {
      assert.equal(slot.demo_only, true);
      assert.equal(slot.demo_badge_label, 'DEMO');
    }

    const behaviorJson = buildQADevOpsRoomBehaviorJson();
    assert.equal(behaviorJson.character_included_in_room_glb, false);
    assert.equal(behaviorJson.supported_actions.length, 29);
    const qaActions = QA_DEVOPS_FUTURE_ACTIONS_CONTRACT.filter(
      (a) => a.agent_role === 'QA_REVIEW_AGENT'
    );
    const devopsActions = QA_DEVOPS_FUTURE_ACTIONS_CONTRACT.filter(
      (a) => a.agent_role === 'DEVOPS_AI_ENGINE_AGENT'
    );
    assert.equal(qaActions.length, 15);
    assert.equal(devopsActions.length, 14);

    assert.equal(QA_DEVOPS_FURNITURE_CATALOG.length, 17);
    const bboxCheck = validateQADevOpsBoundingBox([0, -0.16, 0], [8, 3.2, 16]);
    assert.equal(bboxCheck.passed, true);
  });
});
