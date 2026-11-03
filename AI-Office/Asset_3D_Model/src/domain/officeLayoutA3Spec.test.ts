import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FULL_OFFICE_CAMERA_PRESETS,
  FULL_OFFICE_CAMERA_PROFILE_V2_1,
  OFFICE_A3_CONSTANTS,
  OFFICE_COMMON_AREAS,
  OFFICE_ROOM_LIST,
  buildOfficeLayoutA3_1ExportJson,
  buildOfficeLayoutA3_2ExportJson,
  buildOfficeLayoutA3ExportJson,
  computeAutoFitZoomForFullOfficePreset,
  computeProjectedOfficeFitZoom,
  getRoomModuleByKey,
  validateOfficeLayoutA3,
} from './officeLayoutA3Spec';

test('Master Floor Plan A3.2 registry has 6 physical department rooms including 8x16 QA & DevOps Integrated Studio at [24,0,0]', () => {
  assert.equal(OFFICE_ROOM_LIST.length, 6);
  assert.equal(OFFICE_ROOM_LIST[0].key, 'pm_strategy');
  assert.equal(OFFICE_ROOM_LIST[0].asset_status, 'READY');
  assert.deepEqual(OFFICE_ROOM_LIST[0].global_offset, [8, 0, 18]);

  const ceo = getRoomModuleByKey('ceo_executive');
  assert.equal(ceo.module_id, 'AI_OFFICE_ROOM_CEO_v1');
  assert.equal(ceo.asset_status, 'READY');
  assert.deepEqual(ceo.global_offset, [16, 0, 18]);

  const uiux = getRoomModuleByKey('uiux_studio');
  assert.equal(uiux.module_id, 'AI_OFFICE_ROOM_UIUX_v1');
  assert.equal(uiux.asset_status, 'READY');
  assert.deepEqual(uiux.global_offset, [24, 0, 18]);

  const eng = getRoomModuleByKey('engineering');
  assert.equal(eng.module_id, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(eng.asset_status, 'READY');
  assert.deepEqual(eng.global_offset, [0, 0, 0]);
  assert.deepEqual(eng.size, [8, 3.2, 16]);

  const research = getRoomModuleByKey('research_brain');
  assert.equal(research.module_id, 'AI_OFFICE_ROOM_RESEARCH_v1');
  assert.equal(research.asset_status, 'READY');
  assert.deepEqual(research.global_offset, [0, 0, 18]);
  assert.deepEqual(research.size, [8, 3.2, 8]);

  const qaDevops = getRoomModuleByKey('qa_devops_studio');
  assert.equal(qaDevops.module_id, 'AI_OFFICE_ROOM_QA_DEVOPS_v1');
  assert.equal(qaDevops.asset_status, 'READY');
  assert.equal(qaDevops.badge, 'NEW');
  assert.deepEqual(qaDevops.global_offset, [24, 0, 0]);
  assert.deepEqual(qaDevops.size, [8, 3.2, 16]);

  // Legacy A3.1 keys resolve cleanly to the combined A3.2 studio
  assert.equal(getRoomModuleByKey('qa_review').module_id, 'AI_OFFICE_ROOM_QA_DEVOPS_v1');
  assert.equal(getRoomModuleByKey('devops_ai_engine').module_id, 'AI_OFFICE_ROOM_QA_DEVOPS_v1');

  const plannedCount = OFFICE_ROOM_LIST.filter((r) => r.asset_status === 'PLANNED').length;
  assert.equal(plannedCount, 0);
});

test('validateOfficeLayoutA3 confirms zero overlaps, PM-CEO doorway alignment at [16,0,22], and 32x26 master bounds', () => {
  const report = validateOfficeLayoutA3();
  assert.equal(report.valid, true, `Violations: ${report.violations.join(', ')}`);
  assert.equal(report.nonOverlappingRooms, true);
  assert.equal(report.withinMasterFootprint, true);
  assert.equal(report.pmToCeoConnectorAligned, true);
  assert.equal(report.qaDevopsCombined8x16Valid, true);
  assert.equal(report.violations.length, 0);
});

test('buildOfficeLayoutA3_2ExportJson and buildOfficeLayoutA3_1ExportJson produce complete layout contracts', () => {
  const jsonA32 = buildOfficeLayoutA3ExportJson();
  assert.equal(jsonA32.layout_id, OFFICE_A3_CONSTANTS.LAYOUT_ID);
  assert.equal(jsonA32.schema_version, 'AI_OFFICE_MASTER_LAYOUT_A3_2_V1');
  assert.equal(jsonA32.total_office_bounds.width_x, 32);
  assert.equal(jsonA32.total_office_bounds.depth_z, 26);
  assert.equal(jsonA32.total_office_bounds.wall_height_y, 3.2);
  assert.equal(jsonA32.enclosed_rooms.length, 6);
  assert.equal(jsonA32.common_areas.length, OFFICE_COMMON_AREAS.length);
  assert.deepEqual(buildOfficeLayoutA3_2ExportJson().layout_id, 'AI_OFFICE_LAYOUT_A3_2_v1');

  const jsonA31 = buildOfficeLayoutA3_1ExportJson();
  assert.equal(jsonA31.layout_id, 'AI_OFFICE_LAYOUT_A3_1_v1');
  assert.equal(jsonA31.enclosed_rooms.length, 7);
});

test('FULL_OFFICE_CAMERA_PRESETS include Cinematic V2.1 default, 45-deg Isometric, Front Symmetrical, Top-Down Blueprint, and Focus QA & DevOps', () => {
  assert.equal(FULL_OFFICE_CAMERA_PRESETS[0].id, 'full_office_cinematic');
  const cinematic = FULL_OFFICE_CAMERA_PRESETS[0];
  assert.deepEqual(cinematic.target, [16.0, 1.1, 13.0]);
  const cdx = cinematic.position[0] - cinematic.target[0];
  const cdy = cinematic.position[1] - cinematic.target[1];
  const cdz = cinematic.position[2] - cinematic.target[2];
  const cHoriz = Math.hypot(cdx, cdz);
  const cElevDeg = (Math.atan2(cdy, cHoriz) * 180) / Math.PI;
  assert.ok(cElevDeg >= 35 && cElevDeg <= 38, `Expected elevation 35-38 deg, got ${cElevDeg}`);

  const iso = FULL_OFFICE_CAMERA_PRESETS.find((p) => p.id === 'full_office_iso');
  assert.ok(iso);
  const dx = iso.position[0] - iso.target[0];
  const dy = iso.position[1] - iso.target[1];
  const dz = iso.position[2] - iso.target[2];
  assert.equal(dx, 24);
  assert.equal(dz, -24);
  const horiz = Math.hypot(dx, dz);
  const elevDeg = (Math.atan2(dy, horiz) * 180) / Math.PI;
  assert.ok(Math.abs(elevDeg - 35.264) < 0.05, `Expected ~35.264 deg elevation, got ${elevDeg}`);

  const focusQaDevops = FULL_OFFICE_CAMERA_PRESETS.find(
    (p) => p.id === 'focus_qa_devops_studio'
  );
  assert.ok(focusQaDevops);
  assert.deepEqual(focusQaDevops.target, [28.0, 1.1, 8.0]);
});

test('FULL_OFFICE_CAMERA_PROFILE_V2_1 and computeAutoFitZoomForFullOfficePreset support 8% padding and 2-arg/3-arg calls', () => {
  assert.equal(FULL_OFFICE_CAMERA_PROFILE_V2_1.default_view, 'full_office_cinematic');
  assert.equal(FULL_OFFICE_CAMERA_PROFILE_V2_1.fit_padding, 0.08);
  assert.equal(FULL_OFFICE_CAMERA_PROFILE_V2_1.min_zoom_factor, 0.88);
  assert.equal(FULL_OFFICE_CAMERA_PROFILE_V2_1.max_zoom_factor, 1.65);
  assert.equal(FULL_OFFICE_CAMERA_PROFILE_V2_1.minimum_elevation, 28.0);
  assert.equal(FULL_OFFICE_CAMERA_PROFILE_V2_1.maximum_elevation, 46.0);
  assert.equal(FULL_OFFICE_CAMERA_PROFILE_V2_1.default_cutaway_mode, 'smart_cutaway');

  const fitZoom2Arg = computeAutoFitZoomForFullOfficePreset('full_office_cinematic', 1.6);
  const fitZoom3Arg = computeAutoFitZoomForFullOfficePreset('full_office_cinematic', 28.2, 1.6);
  assert.equal(fitZoom2Arg, fitZoom3Arg);
  assert.ok(fitZoom2Arg > 25 && fitZoom2Arg < 32, `Expected fit zoom ~28.2, got ${fitZoom2Arg}`);

  const directFit = computeProjectedOfficeFitZoom([28.6, 25.3, -17.0], [16.0, 1.1, 13.0], 1.6, 0.08);
  assert.equal(fitZoom2Arg, directFit);
});
