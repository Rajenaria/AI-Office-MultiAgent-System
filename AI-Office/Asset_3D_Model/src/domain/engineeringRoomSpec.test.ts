import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ENGINEERING_MODULE_CONSTANTS,
  ENGINEERING_CONNECTORS_SPEC,
  ENGINEERING_FURNITURE_CATALOG,
  DEFAULT_ENGINEERING_ANCHORS,
  ENGINEERING_MONITORS_SPEC,
  verifyEngineeringMonitorsOrientation,
  validateEngineeringBoundingBox,
  validateEngineeringClearanceAndConnectors,
  buildEngineeringRoomBehaviorJson,
} from './engineeringRoomSpec';
import {
  OFFICE_ROOM_REGISTRY,
  validateOfficeLayoutA3,
  buildOfficeLayoutA3_1ExportJson,
} from './officeLayoutA3Spec';

test('Engineering Studio module constants match 8x16 Double-Module specification', () => {
  assert.equal(ENGINEERING_MODULE_CONSTANTS.MODULE_ID, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(ENGINEERING_MODULE_CONSTANTS.DISPLAY_NAME, 'Engineering & Development Studio');
  assert.equal(ENGINEERING_MODULE_CONSTANTS.ROOM_TYPE, 'ENGINEERING_MULTI_AGENT');
  assert.equal(ENGINEERING_MODULE_CONSTANTS.ROOT_NODE_NAME, 'ROOM_ENGINEERING_ROOT');
  assert.equal(ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_WIDTH, 8.0);
  assert.equal(ENGINEERING_MODULE_CONSTANTS.FOOTPRINT_DEPTH, 16.0);
  assert.equal(ENGINEERING_MODULE_CONSTANTS.WALL_HEIGHT, 3.2);
  assert.deepEqual(ENGINEERING_MODULE_CONSTANTS.LOCAL_ORIGIN, [0, 0, 0]);
  assert.deepEqual(ENGINEERING_MODULE_CONSTANTS.GLOBAL_A3_1_OFFSET, [0, 0, 0]);
  assert.equal(ENGINEERING_MODULE_CONSTANTS.GLB_FILENAME, 'engineering_room.glb');
});

test('Engineering Studio connectors match East [8,0,8] and North [4,0,16] specifications', () => {
  const east = ENGINEERING_CONNECTORS_SPEC.ENGINEERING_EAST_MAIN;
  assert.equal(east.side, 'EAST');
  assert.deepEqual(east.position, [8, 0, 8]);
  assert.equal(east.width, 2.0);
  assert.equal(east.height, 2.3);
  assert.deepEqual(east.span, [7.0, 9.0]);

  const north = ENGINEERING_CONNECTORS_SPEC.ENGINEERING_NORTH_CORRIDOR;
  assert.equal(north.side, 'NORTH');
  assert.deepEqual(north.position, [4, 0, 16]);
  assert.equal(north.width, 2.0);
  assert.equal(north.height, 2.3);
  assert.deepEqual(north.span, [3.0, 5.0]);
});

test('Engineering Studio defines all 20 required room-local semantic anchors inside [0..8, 0, 0..16]', () => {
  const anchorList = Object.values(DEFAULT_ENGINEERING_ANCHORS);
  assert.equal(anchorList.length, 20);
  const requiredIds = [
    'ENGINEERING_ROOM_SPAWN',
    'ENGINEERING_ROOM_IDLE',
    'ENGINEERING_EAST_EXIT',
    'ENGINEERING_NORTH_EXIT',
    'FE_WORKSTATION_APPROACH',
    'FE_DESK_WORK',
    'FE_CHAIR',
    'FE_MONITOR_INTERACTION',
    'BE_WORKSTATION_APPROACH',
    'BE_DESK_WORK',
    'BE_CHAIR',
    'BE_API_BOARD',
    'DB_WORKSTATION_APPROACH',
    'DB_DESK_WORK',
    'DB_CHAIR',
    'DB_SCHEMA_REVIEW',
    'ENG_INTEGRATION_TABLE',
    'ENG_ARCHITECTURE_BOARD',
    'ENG_CODE_REVIEW_POSITION',
    'ENG_DISCUSSION_POSITION',
  ];

  const foundIds = new Set(anchorList.map((a) => a.id));
  for (const id of requiredIds) {
    assert.equal(foundIds.has(id), true, `Missing required anchor: ${id}`);
  }

  for (const anchor of anchorList) {
    const [x, y, z] = anchor.position;
    assert.equal(x >= 0.2 && x <= 7.8, true, `Anchor ${anchor.id} X=${x} out of room bounds`);
    assert.equal(y, 0.0, `Anchor ${anchor.id} Y=${y} must sit on floor Y=0`);
    assert.equal(z >= 0.2 && z <= 15.8, true, `Anchor ${anchor.id} Z=${z} out of room bounds`);
  }
});

test('All 6 Engineering Studio monitors face their respective workstation chair (dot > 0.7)', () => {
  assert.equal(ENGINEERING_MONITORS_SPEC.length, 6);
  const check = verifyEngineeringMonitorsOrientation();
  assert.equal(check.passed, true);
  for (const r of check.results) {
    assert.equal(
      r.dotProduct > 0.7,
      true,
      `Monitor ${r.id} (${r.displayMeshName}) dotProduct=${r.dotProduct} <= 0.7 toward ${r.chairAnchorId}`
    );
  }
});

test('Engineering Studio furniture leaves East and North connectors unobstructed and has 4 zones', () => {
  assert.equal(ENGINEERING_FURNITURE_CATALOG.length, 12);
  const clearance = validateEngineeringClearanceAndConnectors();
  assert.equal(clearance.passed, true, `Collisions: ${clearance.collisions.join(', ')}`);
  assert.equal(clearance.eastConnectorClear, true);
  assert.equal(clearance.northConnectorClear, true);
  assert.equal(clearance.noWallAtMidpointZ8, true);

  const bbox = validateEngineeringBoundingBox([0, -0.16, 0], [8, 3.2, 16]);
  assert.equal(bbox.passed, true);
  assert.equal(bbox.width, 8);
  assert.equal(bbox.depth, 16);

  const behavior = buildEngineeringRoomBehaviorJson();
  assert.equal(behavior.zones.length, 4);
  assert.equal(behavior.footprint.internal_wall_at_z8, false);
});

test('Master Layout A3.1 places 8x16 Engineering at [0,0,0] and 8x8 DevOps at [24,0,0] with zero overlaps', () => {
  const eng = OFFICE_ROOM_REGISTRY.engineering;
  assert.equal(eng.module_id, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(eng.asset_status, 'READY');
  assert.deepEqual(eng.size, [8, 3.2, 16]);
  assert.deepEqual(eng.global_offset, [0, 0, 0]);
  assert.deepEqual(eng.global_bounds, { minX: 0, maxX: 8, minZ: 0, maxZ: 16 });

  const devops = OFFICE_ROOM_REGISTRY.devops_ai_engine;
  assert.equal(devops.asset_status, 'PLANNED');
  assert.deepEqual(devops.size, [8, 3.2, 8]);
  assert.deepEqual(devops.global_offset, [24, 0, 0]);
  assert.deepEqual(devops.global_bounds, { minX: 24, maxX: 32, minZ: 0, maxZ: 8 });

  const validation = validateOfficeLayoutA3();
  assert.equal(validation.valid, true, `Layout A3.1 violations: ${validation.violations.join('; ')}`);
  assert.equal(validation.nonOverlappingRooms, true);
  assert.equal(validation.withinMasterFootprint, true);

  const json = buildOfficeLayoutA3_1ExportJson();
  assert.equal(json.schema_version, 'AI_OFFICE_MASTER_LAYOUT_A3_1_V1');
  assert.equal(json.enclosed_rooms.length, 7);
});
