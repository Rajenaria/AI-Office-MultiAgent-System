import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MODULE_CONSTANTS,
  CONNECTORS_SPEC,
  FURNITURE_CATALOG,
  CAMERA_PRESETS,
  validateBoundingBox,
  checkFurnitureClearance,
  generateRoomManifest,
} from './modularRoomSpec';

test('Modular room footprint and origin match 8x8 specification', () => {
  assert.equal(MODULE_CONSTANTS.FOOTPRINT_WIDTH, 8.0);
  assert.equal(MODULE_CONSTANTS.FOOTPRINT_DEPTH, 8.0);
  assert.equal(MODULE_CONSTANTS.FLOOR_ELEVATION, 0.0);
  assert.equal(MODULE_CONSTANTS.FLOOR_THICKNESS, 0.16);
  assert.equal(MODULE_CONSTANTS.WALL_HEIGHT, 3.2);
  assert.deepEqual(MODULE_CONSTANTS.ORIGIN, [0, 0, 0]);
  assert.equal(MODULE_CONSTANTS.ASSET_FILENAME, 'AI_OFFICE_ROOM_PM_v1.glb');
  assert.equal(MODULE_CONSTANTS.MANIFEST_FILENAME, 'AI_OFFICE_ROOM_PM_v1.manifest.json');
  assert.equal(MODULE_CONSTANTS.PREVIEW_FILENAME, 'AI_OFFICE_ROOM_PM_v1_preview.png');
});

test('East and South connectors match exact coordinates and widths', () => {
  assert.deepEqual(CONNECTORS_SPEC.EAST.position, [8, 0, 4]);
  assert.equal(CONNECTORS_SPEC.EAST.outward_direction, '+X');
  assert.equal(CONNECTORS_SPEC.EAST.width, 2.0);

  assert.deepEqual(CONNECTORS_SPEC.SOUTH.position, [4, 0, 0]);
  assert.equal(CONNECTORS_SPEC.SOUTH.outward_direction, '-Z');
  assert.equal(CONNECTORS_SPEC.SOUTH.width, 2.0);
});

test('Furniture layout respects room bounds and leaves East/South connectors unobstructed', () => {
  const result = checkFurnitureClearance(FURNITURE_CATALOG);
  assert.equal(result.withinRoomBounds, true, `Violations: ${result.violations.join(', ')}`);
  assert.equal(result.eastConnectorClear, true, `Violations: ${result.violations.join(', ')}`);
  assert.equal(result.southConnectorClear, true, `Violations: ${result.violations.join(', ')}`);
  assert.equal(result.valid, true);
});

test('Bounding box validator accepts standard [0..8, -0.16..3.2, 0..8] and rejects recentered exports', () => {
  const validCheck = validateBoundingBox([0, -0.16, 0], [8, 3.2, 8]);
  assert.equal(validCheck.valid, true);
  assert.equal(validCheck.originPreserved, true);

  const recenteredCheck = validateBoundingBox([-4, -0.16, -4], [4, 3.2, 4]);
  assert.equal(recenteredCheck.valid, false);
  assert.equal(recenteredCheck.originPreserved, false);
});

test('Room manifest generator includes all required modular pipeline metadata', () => {
  const manifest = generateRoomManifest({
    meshCount: 185,
    materialCount: 24,
    triangleCount: 4200,
    textureCount: 9,
    boundingBox: {
      min: [0, -0.16, 0],
      max: [8, 3.2, 8],
      size: [8, 3.36, 8],
    },
    groupCounts: {
      STRUCTURE: 12,
      FLOOR: 4,
      WALLS: 14,
      WINDOWS: 18,
      FURNITURE: 65,
      PROPS: 48,
      DECORATION: 18,
      CONNECTORS: 6,
    },
  });

  assert.equal(manifest.module_id, 'AI_OFFICE_ROOM_PM_v1');
  assert.equal(manifest.asset_filename, 'AI_OFFICE_ROOM_PM_v1.glb');
  assert.equal(manifest.footprint_width, 8);
  assert.equal(manifest.footprint_depth, 8);
  assert.deepEqual(manifest.module_origin, [0, 0, 0]);
  assert.equal(manifest.connectors.EAST.position[0], 8);
  assert.equal(manifest.connectors.SOUTH.position[2], 0);
  assert.equal(manifest.number_of_meshes, 185);
  assert.equal(manifest.triangle_count, 4200);
  assert.equal(manifest.content_groups.length, 8);
});

test('Camera presets cover all required inspection views', () => {
  const ids = new Set(CAMERA_PRESETS.map((p) => p.id));
  for (const requiredId of [
    'isometric',
    'front',
    'left',
    'right',
    'back',
    'top',
    'desk_closeup',
    'bookshelf_closeup',
    'board_closeup',
    'floor_closeup',
  ]) {
    assert.equal(ids.has(requiredId), true, `Missing preset: ${requiredId}`);
  }
});
