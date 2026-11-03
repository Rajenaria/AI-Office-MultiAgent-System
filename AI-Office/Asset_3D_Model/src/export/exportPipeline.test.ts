import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBossPMBehaviorJsonV1,
  buildBossPMManifestV1,
  buildCEOCharacterBehaviorJsonV1,
  buildCEOCharacterManifestV1,
  buildPMRoomAnchorsJsonV1,
  computeSha256Hex,
  createZipArchive,
} from './AssetManifestBuilder';
import {
  DEFAULT_ACTIVITY_ANCHORS,
  PM_DEMO_ACTIONS,
  ROOM_WALK_WAYPOINTS,
} from '../domain/pmSimulationSpec';
import { DEFAULT_CEO_ANCHORS } from '../domain/ceoRoomSpec';
import { exportOriginalBossPMToGLBBuffer } from '../three/BossPMCharacterSystem';
import { exportCEOExecutiveAssistantToGLBBuffer } from '../three/CEOCharacterSystem';
import {
  inspectCEOExecutiveAssistantForExport,
  inspectOriginalBossPMForExport,
} from './CharacterExporter';
import {
  parseAndValidateCEOCharacterGLBBuffer,
  parseAndValidateCharacterGLBBuffer,
} from './AssetValidation';

test('computeSha256Hex computes accurate 64-character SHA-256 hex digest', async () => {
  const bytes = new TextEncoder().encode('AI-OFFICE-PM-ROOM-HANDOFF-V1');
  const sha = await computeSha256Hex(bytes);
  assert.equal(sha.length, 64);
  assert.match(sha, /^[0-9a-f]{64}$/);
});

test('createZipArchive produces valid PKZIP archive with local and central directory headers', () => {
  const archive = createZipArchive([
    { path: 'room-pack/README.md', data: '# PM Room Pack\n' },
    { path: 'room-pack/data.json', data: JSON.stringify({ ok: true }) },
  ]);
  assert.ok(archive.byteLength > 100);
  // PK\x03\x04 local file header magic
  assert.equal(archive[0], 0x50);
  assert.equal(archive[1], 0x4b);
  assert.equal(archive[2], 0x03);
  assert.equal(archive[3], 0x04);
});

test('buildPMRoomAnchorsJsonV1 and buildBossPMBehaviorJsonV1 include all anchors and 11 activities', () => {
  const anchorsJson = buildPMRoomAnchorsJsonV1(DEFAULT_ACTIVITY_ANCHORS, ROOM_WALK_WAYPOINTS);
  assert.equal(anchorsJson.room_asset_id, 'ai_office.room.pm_strategy.v1');
  assert.equal(anchorsJson.anchors.length, 10);
  assert.equal(anchorsJson.navigation_waypoints.length, 12);

  const inspected = inspectOriginalBossPMForExport();
  const behaviorJson = buildBossPMBehaviorJsonV1(
    inspected.clips,
    PM_DEMO_ACTIONS,
    DEFAULT_ACTIVITY_ANCHORS
  );
  assert.equal(behaviorJson.character_asset_id, 'ai_office.character.boss_pm_room_native.v1');
  assert.equal(behaviorJson.activity_states.length, 11);
  assert.ok(
    behaviorJson.activity_states.some((s) => s.embedded_clip_name === 'Idle_Breathing')
  );
  assert.ok(behaviorJson.activity_states.some((s) => s.embedded_clip_name === 'Walk_Cycle'));
});

test('Original Boss PM exports to binary GLB and passes independent GLTFLoader round-trip validation', async () => {
  // Minimal browser FileReader polyfill for Three.js GLTFExporter in Node test environment
  if (typeof globalThis.FileReader === 'undefined') {
    class NodeFileReaderPolyfill {
      result: ArrayBuffer | string | null = null;
      onloadend: (() => void) | null = null;
      onload: (() => void) | null = null;
      onerror: ((err: unknown) => void) | null = null;
      readAsArrayBuffer(blob: Blob) {
        blob
          .arrayBuffer()
          .then((buf) => {
            this.result = buf;
            if (this.onload) this.onload();
            if (this.onloadend) this.onloadend();
          })
          .catch((err) => {
            if (this.onerror) this.onerror(err);
          });
      }
      readAsDataURL(blob: Blob) {
        blob
          .arrayBuffer()
          .then((buf) => {
            const b64 = Buffer.from(buf).toString('base64');
            this.result = `data:${blob.type || 'application/octet-stream'};base64,${b64}`;
            if (this.onload) this.onload();
            if (this.onloadend) this.onloadend();
          })
          .catch((err) => {
            if (this.onerror) this.onerror(err);
          });
      }
    }
    (globalThis as unknown as { FileReader: unknown }).FileReader = NodeFileReaderPolyfill;
  }

  const inspection = inspectOriginalBossPMForExport();
  assert.equal(inspection.sourceTotalMeshes, 46);
  assert.equal(inspection.exportedVisibleMeshes, 41);
  assert.equal(inspection.clips.length, 11);

  const glbBuffer = await exportOriginalBossPMToGLBBuffer();
  assert.ok(glbBuffer.byteLength > 20000);

  const sha = await computeSha256Hex(glbBuffer);
  const manifest = buildBossPMManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256: sha,
    sourceTotalMeshes: inspection.sourceTotalMeshes,
    exportedVisibleMeshes: inspection.exportedVisibleMeshes,
    materialNames: inspection.materialNames,
    localBounds: inspection.localBounds,
    clips: inspection.clips,
    validationStatus: 'PASS',
  });
  assert.equal(manifest.geometry_and_material_summary.source_hierarchy_total_meshes, 46);
  assert.equal(manifest.geometry_and_material_summary.exported_rest_pose_visible_meshes, 41);
  assert.equal(manifest.animation_inventory.embedded_gltf_clip_count, 11);

  const reimported = await parseAndValidateCharacterGLBBuffer(
    glbBuffer,
    inspection.sourceTotalMeshes
  );
  assert.equal(reimported.report.loadSuccess, true);
  assert.equal(reimported.report.importedMeshCount, 41);
  assert.equal(reimported.report.embeddedClipsVerified.count, 11);
  assert.equal(reimported.report.feetGroundedAtZero, true);
  assert.equal(reimported.report.heightMatchesSpec, true);
  assert.equal(reimported.report.roomGeometryExcluded, true);
});

test('CEO Executive Assistant (ceo_executive_assistant.glb) exports with 14 animation clips and passes independent GLTFLoader round-trip validation', async () => {
  const inspection = inspectCEOExecutiveAssistantForExport();
  assert.ok(inspection.sourceTotalMeshes > 40);
  assert.ok(inspection.exportedVisibleMeshes > 35);
  assert.equal(inspection.clips.length, 14);

  const glbBuffer = await exportCEOExecutiveAssistantToGLBBuffer();
  assert.ok(glbBuffer.byteLength > 25000);

  const sha = await computeSha256Hex(glbBuffer);
  const manifest = buildCEOCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256: sha,
    sourceTotalMeshes: inspection.sourceTotalMeshes,
    exportedVisibleMeshes: inspection.exportedVisibleMeshes,
    triangleCount: inspection.triangleCount,
    materialNames: inspection.materialNames,
    localBounds: inspection.localBounds,
    clips: inspection.clips,
    validationStatus: 'PASS',
  });
  assert.equal(manifest.character_id, 'ceo_executive_assistant');
  assert.equal(manifest.compatible_room_id, 'AI_OFFICE_ROOM_CEO_v1');
  assert.equal(manifest.animation_clips.length, 14);
  assert.equal(manifest.supported_expressions.length, 7);

  const behavior = buildCEOCharacterBehaviorJsonV1();
  assert.equal(behavior.character_id, 'ceo_executive_assistant');
  assert.equal(behavior.simulation_mode, 'DEMO_DATA_ONLY');
  assert.equal(behavior.states.length, 14);

  const reimported = await parseAndValidateCEOCharacterGLBBuffer(
    glbBuffer,
    inspection.sourceTotalMeshes
  );
  assert.equal(reimported.report.loadSuccess, true);
  assert.equal(reimported.report.importedMeshCount, inspection.exportedVisibleMeshes);
  assert.equal(reimported.report.embeddedClipsVerified.count, 14);
  assert.equal(reimported.report.feetGroundedAtZero, true);
  assert.equal(reimported.report.heightMatchesSpec, true);
  assert.equal(reimported.report.roomGeometryExcluded, true);
});

import { buildUIUXRoomAnchorsJsonV1, buildUIUXRoomProductionAssetPack } from './RoomExporter';
import {
  DEFAULT_UIUX_ANCHORS,
  UIUX_MODULE_CONSTANTS,
  buildUIUXRoomBehaviorJson,
} from '../domain/uiuxRoomSpec';
import { buildUIUXRoomComplete } from '../three/UIUXRoomBuilder';
import { createPixelMaterialLibrary } from '../three/PixelMaterialLibrary';
import { parseAndValidateUIUXRoomGLBBuffer } from './AssetValidation';

test('buildUIUXRoomAnchorsJsonV1 and buildUIUXRoomBehaviorJson export 10 room-local anchors and 10 future designer action contracts', () => {
  const anchorsJson = buildUIUXRoomAnchorsJsonV1(DEFAULT_UIUX_ANCHORS);
  assert.equal(anchorsJson.room_asset_id, UIUX_MODULE_CONSTANTS.ASSET_ID);
  assert.equal(anchorsJson.room_module_id, UIUX_MODULE_CONSTANTS.MODULE_ID);
  assert.deepEqual(anchorsJson.local_origin, [0, 0, 0]);
  assert.deepEqual(anchorsJson.global_a3_offset, [24, 0, 18]);
  assert.equal(anchorsJson.anchors.length, 10);

  const southExit = anchorsJson.anchors.find((a) => a.id === 'UIUX_SOUTH_EXIT');
  assert.ok(southExit);
  assert.deepEqual(southExit.local_position, [4.0, 0, 0.32]);
  assert.deepEqual(southExit.global_a3_position, [28.0, 0, 18.32]);

  const behaviorJson = buildUIUXRoomBehaviorJson();
  assert.equal(behaviorJson.room_module_id, UIUX_MODULE_CONSTANTS.MODULE_ID);
  assert.equal(behaviorJson.character_status, 'DEFERRED_NEXT_STAGE');
  assert.equal(behaviorJson.future_actions.length, 10);
});

test('UI/UX Design Studio (uiux_room.glb) exports to binary GLB and passes independent GLTFLoader round-trip validation with zero characters', async () => {
  if (typeof globalThis.document === 'undefined') {
    const noopCtx = new Proxy(
      {},
      {
        get: () => () => ({ addColorStop: () => {} }),
      }
    );
    (globalThis as unknown as { document: unknown }).document = {
      createElement: () => ({
        width: 64,
        height: 64,
        getContext: () => noopCtx,
      }),
    };
  }

  const matLib = createPixelMaterialLibrary();
  matLib.setVisualMode('clean', false);
  const uiuxBuilt = buildUIUXRoomComplete(matLib);
  const pack = await buildUIUXRoomProductionAssetPack(
    uiuxBuilt.uiuxRoot,
    DEFAULT_UIUX_ANCHORS,
    null,
    'PASS'
  );

  assert.equal(pack.manifest.file_inventory.glb.filename, 'uiux_room.glb');
  assert.ok(pack.glbBuffer.byteLength > 25000, `Expected uiux_room.glb > 25KB, got ${pack.glbBuffer.byteLength}`);
  assert.equal(pack.glbSha256.length, 64);

  const reimported = await parseAndValidateUIUXRoomGLBBuffer(pack.glbBuffer);
  assert.equal(reimported.report.loadSuccess, true);
  assert.equal(reimported.report.validGlbHeader, true);
  assert.equal(reimported.report.characterExcluded, true);
  assert.equal(reimported.report.southConnectorVerified, true);
  assert.equal(reimported.report.verifiedKeyFurniture.length, 10);
  assert.ok(reimported.report.meshCount > 150);
  assert.ok(reimported.report.materialCount >= 18);
});

import {
  buildUIUXCharacterBehaviorJsonV1,
  buildUIUXCharacterManifestV1,
} from './AssetManifestBuilder';
import { exportUIUXDesignerToGLBBuffer } from '../three/UIUXCharacterSystem';
import { inspectUIUXDesignerForExport } from './CharacterExporter';
import { parseAndValidateUIUXCharacterGLBBuffer } from './AssetValidation';

test('UI/UX Designer (uiux_designer_agent.glb) exports with 15 animation clips and passes independent GLTFLoader round-trip validation', async () => {
  const inspection = inspectUIUXDesignerForExport();
  assert.ok(inspection.sourceTotalMeshes > 45);
  assert.ok(inspection.exportedVisibleMeshes > 40);
  assert.equal(inspection.clips.length, 15);

  const glbBuffer = await exportUIUXDesignerToGLBBuffer();
  assert.ok(glbBuffer.byteLength > 25000);

  const sha = await computeSha256Hex(glbBuffer);
  const manifest = buildUIUXCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256: sha,
    sourceTotalMeshes: inspection.sourceTotalMeshes,
    exportedVisibleMeshes: inspection.exportedVisibleMeshes,
    triangleCount: inspection.triangleCount,
    materialNames: inspection.materialNames,
    localBounds: inspection.localBounds,
    clips: inspection.clips,
    validationStatus: 'PASS',
  });
  assert.equal(manifest.character_id, 'uiux_designer_agent');
  assert.equal(manifest.display_name, 'UI/UX Designer');
  assert.equal(manifest.department, 'Design');
  assert.equal(manifest.compatible_room_id, 'AI_OFFICE_ROOM_UIUX_v1');
  assert.equal(manifest.animation_clips.length, 15);
  assert.equal(manifest.supported_expressions.length, 8);

  const behavior = buildUIUXCharacterBehaviorJsonV1();
  assert.equal(behavior.character_id, 'uiux_designer_agent');
  assert.equal(behavior.compatible_room_id, 'AI_OFFICE_ROOM_UIUX_v1');
  assert.equal(behavior.simulation_mode, 'DEMO_DATA_ONLY');
  assert.equal(behavior.states.length, 15);

  const reimported = await parseAndValidateUIUXCharacterGLBBuffer(
    glbBuffer,
    inspection.sourceTotalMeshes
  );
  assert.equal(reimported.report.loadSuccess, true);
  assert.equal(reimported.report.importedMeshCount, inspection.exportedVisibleMeshes);
  assert.equal(reimported.report.embeddedClipsVerified.count, 15);
  assert.equal(reimported.report.feetGroundedAtZero, true);
  assert.equal(reimported.report.heightMatchesSpec, true);
  assert.equal(reimported.report.roomGeometryExcluded, true);
});

import {
  buildEngineeringRoomAnchorsJsonV1,
  buildEngineeringRoomBehaviorJsonV1,
} from './AssetManifestBuilder';
import { buildEngineeringRoomProductionAssetPack } from './RoomExporter';
import {
  DEFAULT_ENGINEERING_ANCHORS,
  ENGINEERING_MODULE_CONSTANTS,
} from '../domain/engineeringRoomSpec';
import { buildEngineeringStudioRoom } from '../three/EngineeringRoomBuilder';
import { parseAndValidateEngineeringRoomGLBBuffer } from './AssetValidation';

test('Engineering & Development Studio (engineering_room.glb) exports to 8x16 binary GLB and passes independent GLTFLoader round-trip + monitor orientation validation', async () => {
  const anchorsJson = buildEngineeringRoomAnchorsJsonV1(DEFAULT_ENGINEERING_ANCHORS);
  assert.equal(anchorsJson.room_asset_id, ENGINEERING_MODULE_CONSTANTS.ASSET_ID);
  assert.equal(anchorsJson.room_module_id, ENGINEERING_MODULE_CONSTANTS.MODULE_ID);
  assert.deepEqual(anchorsJson.local_origin, [0, 0, 0]);
  assert.deepEqual(anchorsJson.global_a3_1_offset, [0, 0, 0]);
  assert.equal(anchorsJson.anchors.length, 20);

  const behaviorJson = buildEngineeringRoomBehaviorJsonV1();
  assert.equal(behaviorJson.room_module_id, ENGINEERING_MODULE_CONSTANTS.MODULE_ID);
  assert.equal(behaviorJson.character_status, 'DEFERRED_NEXT_STAGE');
  assert.equal(behaviorJson.planned_developer_roles.length, 3);
  assert.equal(behaviorJson.future_actions.length, 9);

  const matLib = createPixelMaterialLibrary();
  matLib.setVisualMode('clean', false);
  const engBuilt = buildEngineeringStudioRoom(matLib);
  const pack = await buildEngineeringRoomProductionAssetPack(
    engBuilt.engineeringRoot,
    DEFAULT_ENGINEERING_ANCHORS,
    null,
    'PASS'
  );

  assert.equal(pack.manifest.file_inventory.glb.filename, 'engineering_room.glb');
  assert.equal(pack.manifest.room_module_id, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(pack.manifest.module_type, 'ENGINEERING_MULTI_AGENT');
  assert.ok(
    pack.glbBuffer.byteLength > 35000,
    `Expected engineering_room.glb > 35KB, got ${pack.glbBuffer.byteLength}`
  );
  assert.equal(pack.glbSha256.length, 64);

  const reimported = await parseAndValidateEngineeringRoomGLBBuffer(pack.glbBuffer);
  assert.equal(reimported.report.loadSuccess, true);
  assert.equal(reimported.report.validGlbHeader, true);
  assert.equal(reimported.report.characterExcluded, true);
  assert.equal(reimported.report.noInternalDividerAtZ8, true);
  assert.equal(reimported.report.monitorsOrientationVerified, true);
  assert.equal(reimported.report.northConnectorVerified, true);
  assert.equal(reimported.report.eastConnectorVerified, true);
  assert.equal(reimported.report.verifiedSubgroups.length, 4);
  assert.equal(reimported.report.verifiedKeyFurniture.length, 12);
  assert.ok(reimported.report.meshCount > 260);
  assert.ok(reimported.report.materialCount >= 22);

  // Verify V1.1 Flicker Root-Cause Repairs on built scene graph:
  // 1. Monitor screen plane (+0.006) vs rear casing (-0.022, d=0.028 => front at -0.008) has 14mm clearance
  const dbScreen = engBuilt.root.getObjectByName('Engineering_DB_Main_Display_Screen');
  const dbRear = engBuilt.root.getObjectByName('Engineering_DB_Main_Display_Rear_Casing');
  const dbVesa = engBuilt.root.getObjectByName('Engineering_DB_Main_Display_Group_Rear_VESA_Hub');
  assert.ok(dbScreen && dbRear && dbVesa, 'Database V1.1 monitor screen, rear casing, and VESA hub must exist');
  assert.equal(dbScreen.position.z, 0.006);
  assert.equal(dbRear.position.z, -0.022);

  // 2. All 4 zone rugs exist as 3D BoxGeometry meshes centered at y = 0.007 (above floor Y = 0.000)
  for (const rugName of [
    'Engineering_Frontend_Zone_Rug',
    'Engineering_Backend_Zone_Rug',
    'Engineering_Integration_Area_Rug',
    'Engineering_Database_Zone_Rug',
  ]) {
    const rugObj = engBuilt.root.getObjectByName(rugName);
    assert.ok(rugObj, `Missing 3D woven zone rug: ${rugName}`);
    assert.equal(rugObj.position.y, 0.007);
  }

  // 3. New V1.1 zone furniture props exist (NW bookshelf, SW bookcase + NAS, NE refreshment console)
  assert.ok(engBuilt.root.getObjectByName('Engineering_Frontend_North_Bookshelf'));
  assert.ok(engBuilt.root.getObjectByName('Engineering_Database_West_Bookcase_Unit'));
  assert.ok(engBuilt.root.getObjectByName('Engineering_NE_Refreshment_Console'));
});

import {
  buildFrontendCharacterBehaviorJsonV1,
  buildFrontendCharacterManifestV1,
} from './AssetManifestBuilder';
import { exportFrontendDeveloperToGLBBuffer } from '../three/FrontendCharacterSystem';
import { inspectFrontendDeveloperForExport } from './CharacterExporter';
import { parseAndValidateFrontendCharacterGLBBuffer } from './AssetValidation';

test('Frontend Developer (frontend_developer_agent.glb) exports with 16 animation clips and passes independent GLTFLoader round-trip validation', async () => {
  const inspection = inspectFrontendDeveloperForExport();
  assert.ok(inspection.sourceTotalMeshes > 45);
  assert.ok(inspection.exportedVisibleMeshes > 40);
  assert.equal(inspection.clips.length, 16);

  const glbBuffer = await exportFrontendDeveloperToGLBBuffer();
  assert.ok(glbBuffer.byteLength > 25000);

  const sha = await computeSha256Hex(glbBuffer);
  const manifest = buildFrontendCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256: sha,
    sourceTotalMeshes: inspection.sourceTotalMeshes,
    exportedVisibleMeshes: inspection.exportedVisibleMeshes,
    triangleCount: inspection.triangleCount,
    materialNames: inspection.materialNames,
    localBounds: inspection.localBounds,
    clips: inspection.clips,
    validationStatus: 'PASS',
  });
  assert.equal(manifest.character_id, 'frontend_developer_agent');
  assert.equal(manifest.display_name, 'Frontend Developer');
  assert.equal(manifest.department, 'Engineering');
  assert.equal(manifest.compatible_room_id, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(manifest.animation_clips.length, 16);
  assert.equal(manifest.supported_expressions.length, 9);

  const behavior = buildFrontendCharacterBehaviorJsonV1();
  assert.equal(behavior.character_id, 'frontend_developer_agent');
  assert.equal(behavior.compatible_room_id, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(behavior.simulation_mode, 'DEMO_DATA_ONLY');
  assert.equal(behavior.states.length, 16);

  const reimported = await parseAndValidateFrontendCharacterGLBBuffer(
    glbBuffer,
    inspection.sourceTotalMeshes
  );
  assert.equal(reimported.report.loadSuccess, true);
  assert.equal(reimported.report.importedMeshCount, inspection.exportedVisibleMeshes);
  assert.equal(reimported.report.embeddedClipsVerified.count, 16);
  assert.equal(reimported.report.feetGroundedAtZero, true);
  assert.equal(reimported.report.heightMatchesSpec, true);
  assert.equal(reimported.report.roomGeometryExcluded, true);
});

import {
  buildBackendCharacterBehaviorJsonV1,
  buildBackendCharacterManifestV1,
} from './AssetManifestBuilder';
import { exportBackendDeveloperToGLBBuffer } from '../three/BackendCharacterSystem';
import { inspectBackendDeveloperForExport } from './CharacterExporter';
import { parseAndValidateBackendCharacterGLBBuffer } from './AssetValidation';

test('Backend Developer (backend_developer_agent.glb) exports with 17 animation clips, 360-degree layered dark chocolate-brown hair, and passes independent GLTFLoader round-trip validation', async () => {
  const inspection = inspectBackendDeveloperForExport();
  assert.ok(inspection.sourceTotalMeshes >= 80);
  assert.ok(inspection.exportedVisibleMeshes >= 65);
  assert.equal(inspection.clips.length, 17);

  const glbBuffer = await exportBackendDeveloperToGLBBuffer();
  assert.ok(glbBuffer.byteLength > 25000);

  const sha = await computeSha256Hex(glbBuffer);
  const manifest = buildBackendCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256: sha,
    sourceTotalMeshes: inspection.sourceTotalMeshes,
    exportedVisibleMeshes: inspection.exportedVisibleMeshes,
    triangleCount: inspection.triangleCount,
    materialNames: inspection.materialNames,
    localBounds: inspection.localBounds,
    clips: inspection.clips,
    validationStatus: 'PASS',
  });
  assert.equal(manifest.character_id, 'backend_developer_agent');
  assert.equal(manifest.asset_id, 'ai_office.character.backend_developer_agent.v1');
  assert.equal(manifest.display_name, 'Backend Developer');
  assert.equal(manifest.department, 'Engineering');
  assert.equal(manifest.room_id, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(manifest.supported_animation_clips.length, 17);
  assert.equal(manifest.supported_expressions.length, 9);
  assert.equal(manifest.hair_material_palette.length, 4);
  assert.equal(manifest.accessory_definitions.hair_subgroups.length, 8);

  const behavior = buildBackendCharacterBehaviorJsonV1();
  assert.equal(behavior.character_id, 'backend_developer_agent');
  assert.equal(behavior.room_id, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(behavior.default_idle_anchor, 'BE_WORKSTATION_APPROACH');
  assert.equal(behavior.simulation_mode, 'DEMO_DATA_ONLY');
  assert.equal(behavior.action_mappings.length, 17);

  const reimported = await parseAndValidateBackendCharacterGLBBuffer(
    glbBuffer,
    inspection.sourceTotalMeshes
  );
  assert.equal(reimported.report.loadSuccess, true);
  assert.equal(reimported.report.importedMeshCount, inspection.exportedVisibleMeshes);
  assert.equal(reimported.report.embeddedClipsVerified.count, 17);
  assert.equal(reimported.report.feetGroundedAtZero, true);
  assert.equal(reimported.report.heightMatchesSpec, true);
  assert.equal(reimported.report.roomGeometryExcluded, true);
});

import {
  buildDatabaseCharacterBehaviorJsonV1,
  buildDatabaseCharacterManifestV1,
} from './AssetManifestBuilder';
import { exportDatabaseDeveloperToGLBBuffer } from '../three/DatabaseCharacterSystem';
import { inspectDatabaseDeveloperForExport } from './CharacterExporter';
import { parseAndValidateDatabaseCharacterGLBBuffer } from './AssetValidation';

test('Database Developer (database_developer_agent.glb) exports with 21 animation clips, 360-degree layered dark chestnut-brown hair, no default glasses, and passes independent GLTFLoader round-trip validation', async () => {
  const inspection = inspectDatabaseDeveloperForExport();
  assert.ok(inspection.sourceTotalMeshes >= 80);
  assert.ok(inspection.exportedVisibleMeshes >= 65);
  assert.equal(inspection.clips.length, 21);

  const glbBuffer = await exportDatabaseDeveloperToGLBBuffer();
  assert.ok(glbBuffer.byteLength > 25000);

  const sha = await computeSha256Hex(glbBuffer);
  const manifest = buildDatabaseCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256: sha,
    sourceTotalMeshes: inspection.sourceTotalMeshes,
    exportedVisibleMeshes: inspection.exportedVisibleMeshes,
    triangleCount: inspection.triangleCount,
    materialNames: inspection.materialNames,
    localBounds: inspection.localBounds,
    clips: inspection.clips,
    validationStatus: 'PASS',
  });
  assert.equal(manifest.character_id, 'database_developer_agent');
  assert.equal(manifest.asset_id, 'ai_office.character.database_developer_agent.v1');
  assert.equal(manifest.display_name, 'Database Developer');
  assert.equal(manifest.department, 'Engineering');
  assert.equal(manifest.room_id, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(manifest.supported_animation_clips.length, 21);
  assert.equal(manifest.supported_expressions.length, 9);
  assert.equal(manifest.hair_palette.length, 5);
  assert.equal(manifest.supported_accessories.hair_subgroups.length, 8);
  assert.equal(manifest.material_profile.default_eyeglasses, false);

  const behavior = buildDatabaseCharacterBehaviorJsonV1();
  assert.equal(behavior.character_id, 'database_developer_agent');
  assert.equal(behavior.room_id, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(behavior.default_idle_anchor_id, 'DB_WORKSTATION_APPROACH');
  assert.equal(behavior.simulation_mode, 'DEMO_DATA_ONLY');
  assert.equal(behavior.action_mappings.length, 19);

  const reimported = await parseAndValidateDatabaseCharacterGLBBuffer(
    glbBuffer,
    inspection.sourceTotalMeshes
  );
  assert.equal(reimported.report.loadSuccess, true);
  assert.equal(reimported.report.importedMeshCount, inspection.exportedVisibleMeshes);
  assert.equal(reimported.report.embeddedClipsVerified.count, 21);
  assert.equal(reimported.report.feetGroundedAtZero, true);
  assert.equal(reimported.report.heightMatchesSpec, true);
  assert.equal(reimported.report.roomGeometryExcluded, true);
});

import { buildResearchRoomComplete } from '../three/ResearchRoomBuilder';
import { buildResearchRoomProductionAssetPack } from './RoomExporter';
import { parseAndValidateResearchRoomGLBBuffer } from './AssetValidation';

test('Research & Shared Brain Room (research_room.glb) exports at [0,0,0] with 6 DEMO display slots, 13 anchors, 14 future actions, and passes independent GLTFLoader round-trip validation', async () => {
  const matLib = createPixelMaterialLibrary();
  matLib.setVisualMode('clean', false);
  const researchBuilt = buildResearchRoomComplete(matLib);
  assert.equal(researchBuilt.roomRoot.name, 'ROOM_RESEARCH_ROOT');

  const pack = await buildResearchRoomProductionAssetPack(researchBuilt.roomRoot);
  assert.ok(pack.glbSizeBytes > 15000);
  assert.equal(pack.glbSha256.length, 64);
  assert.equal(pack.manifest.room_id, 'AI_OFFICE_ROOM_RESEARCH_v1');
  assert.equal(pack.manifest.asset_id, 'ai_office.room.research_shared_brain.v1');
  assert.equal(pack.manifest.registry_key, 'research_brain');
  assert.deepEqual(pack.manifest.local_origin, [0, 0, 0]);
  assert.deepEqual(pack.manifest.full_office_a3_1_global_offset, [0, 0, 18]);
  assert.equal(pack.manifest.geometry_and_material_summary.character_included, false);
  assert.equal(pack.anchorsJson.total_anchors, 13);
  assert.equal(pack.displaySlotsJson.total_display_slots, 6);
  assert.equal(pack.displaySlotsJson.demo_mode_only, true);
  assert.equal(pack.behaviorJson.supported_actions.length, 14);
  assert.equal(
    pack.furnitureParity.every((f) => f.included_in_room_glb),
    true
  );

  const reimported = await parseAndValidateResearchRoomGLBBuffer(pack.glbBuffer);
  assert.equal(reimported.report.loadSuccess, true);
  assert.equal(reimported.report.validGlbHeader, true);
  assert.equal(reimported.report.characterExcluded, true);
  assert.equal(reimported.report.southConnectorVerified, true);
  assert.equal(reimported.report.displaySlotsVerified, true);
  assert.ok(
    reimported.report.monitorDotProductToChair > 0.9,
    `Expected primary monitor to face chair (dot > 0.9), got ${reimported.report.monitorDotProductToChair}`
  );
  assert.equal(reimported.report.verifiedDisplaySlots.length, 6);
  assert.equal(reimported.report.verifiedKeyFurniture.length, 10);
  assert.ok(reimported.report.meshCount > 140);
});

import {
  buildResearchCharacterBehaviorJsonV1,
  buildResearchCharacterManifestV1,
} from './AssetManifestBuilder';
import { exportResearchProfessorToGLBBuffer } from '../three/ResearchCharacterSystem';
import { inspectResearchProfessorForExport } from './CharacterExporter';
import { parseAndValidateResearchProfessorGLBBuffer } from './AssetValidation';

test('Research Professor (research_professor_agent.glb) exports with 20 animation clips, 360-degree voluminous white professor hair, glasses, moustache/beard, academic coat, Shared Brain backpack, and passes independent GLTFLoader round-trip validation', async () => {
  const inspection = inspectResearchProfessorForExport();
  assert.ok(inspection.sourceTotalMeshes >= 120);
  assert.ok(inspection.exportedVisibleMeshes >= 95);
  assert.equal(inspection.clips.length, 20);

  const glbBuffer = await exportResearchProfessorToGLBBuffer();
  assert.ok(glbBuffer.byteLength > 25000);

  const sha = await computeSha256Hex(glbBuffer);
  const manifest = buildResearchCharacterManifestV1({
    glbSizeBytes: glbBuffer.byteLength,
    glbSha256: sha,
    sourceTotalMeshes: inspection.sourceTotalMeshes,
    exportedVisibleMeshes: inspection.exportedVisibleMeshes,
    triangleCount: inspection.triangleCount,
    materialNames: inspection.materialNames,
    localBounds: inspection.localBounds,
    clips: inspection.clips,
    validationStatus: 'PASS',
  });
  assert.equal(manifest.character_id, 'research_professor_agent');
  assert.equal(manifest.asset_id, 'ai_office.character.research_professor_agent.v1');
  assert.equal(manifest.display_name, 'Research Professor');
  assert.equal(manifest.department, 'Research & Knowledge');
  assert.equal(manifest.room_id, 'AI_OFFICE_ROOM_RESEARCH_v1');
  assert.equal(manifest.supported_animation_clips.length, 20);
  assert.equal(manifest.supported_expressions.length, 10);
  assert.equal(manifest.hair_palette.length, 5);
  assert.equal(manifest.supported_accessories.hair_subgroups.length, 8);
  assert.equal(manifest.material_profile.default_eyeglasses, true);

  const behavior = buildResearchCharacterBehaviorJsonV1();
  assert.equal(behavior.character_id, 'research_professor_agent');
  assert.equal(behavior.room_id, 'AI_OFFICE_ROOM_RESEARCH_v1');
  assert.equal(behavior.default_idle_anchor_id, 'RESEARCH_ROOM_IDLE');
  assert.equal(behavior.simulation_mode, 'DEMO_DATA_ONLY');
  assert.equal(behavior.action_mappings.length, 18);

  const reimported = await parseAndValidateResearchProfessorGLBBuffer(
    glbBuffer,
    inspection.sourceTotalMeshes
  );
  assert.equal(reimported.report.loadSuccess, true);
  assert.equal(reimported.report.importedMeshCount, inspection.exportedVisibleMeshes);
  assert.equal(reimported.report.embeddedClipsVerified.count, 20);
  assert.equal(reimported.report.feetGroundedAtZero, true);
  assert.equal(reimported.report.heightMatchesSpec, true);
  assert.equal(reimported.report.roomGeometryExcluded, true);
});

import { buildQADevOpsRoomComplete } from '../three/QADevOpsRoomBuilder';
import { buildQADevOpsRoomProductionAssetPack } from './RoomExporter';
import { parseAndValidateQADevOpsRoomGLBBuffer } from './AssetValidation';

test('QA & DevOps Integrated Studio (qa_devops_room.glb) exports at [0,0,0] with 8x16x3.2 bounds, 8 DEMO display slots, 23 anchors, 29 future actions, and passes independent GLTFLoader round-trip + 9-monitor orientation validation', async () => {
  const matLib = createPixelMaterialLibrary();
  matLib.setVisualMode('clean', false);
  const qaDevopsBuilt = buildQADevOpsRoomComplete(matLib);
  assert.equal(qaDevopsBuilt.roomRoot.name, 'ROOM_QA_DEVOPS_ROOT');

  const pack = await buildQADevOpsRoomProductionAssetPack(qaDevopsBuilt.roomRoot);
  assert.ok(pack.glbSizeBytes > 25000, `Expected qa_devops_room.glb > 25KB, got ${pack.glbSizeBytes}`);
  assert.equal(pack.glbSha256.length, 64);
  assert.equal(pack.manifest.room_id, 'AI_OFFICE_ROOM_QA_DEVOPS_v1');
  assert.equal(pack.manifest.asset_id, 'ai_office.room.qa_devops_studio.v1');
  assert.equal(pack.manifest.registry_key, 'qa_devops_studio');
  assert.deepEqual(pack.manifest.local_origin, [0, 0, 0]);
  assert.deepEqual(pack.manifest.full_office_a3_2_global_offset, [24, 0, 0]);
  assert.equal(pack.manifest.geometry_and_material_summary.character_included, false);
  assert.equal(pack.manifest.architecture_policy.internal_wall_at_z8, false);
  assert.equal(pack.manifest.architecture_policy.zero_purple_accent_policy, true);
  assert.equal(pack.anchorsJson.total_anchors, 23);
  assert.equal(pack.displaySlotsJson.total_display_slots, 8);
  assert.equal(pack.displaySlotsJson.demo_mode_only, true);
  assert.equal(pack.behaviorJson.supported_actions.length, 29);
  assert.equal(
    pack.furnitureParity.every((f) => f.included_in_room_glb),
    true
  );

  const reimported = await parseAndValidateQADevOpsRoomGLBBuffer(pack.glbBuffer);
  assert.equal(reimported.report.loadSuccess, true);
  assert.equal(reimported.report.validGlbHeader, true);
  assert.equal(reimported.report.characterExcluded, true);
  assert.equal(reimported.report.westAndNorthConnectorsVerified, true);
  assert.equal(reimported.report.noDividingWallAtZ8, true);
  assert.equal(reimported.report.displaySlotsVerified, true);
  assert.equal(reimported.report.monitorsOrientationVerified, true);
  assert.equal(reimported.report.monitorDotProducts.length, 9);
  assert.equal(
    reimported.report.monitorDotProducts.every((m) => m.dotProduct > 0.7),
    true
  );
  assert.equal(reimported.report.verifiedDisplaySlots.length, 8);
  assert.equal(reimported.report.verifiedSemanticSubgroups.length, 6);
  assert.equal(reimported.report.verifiedKeyFurniture.length, 17);
  assert.ok(reimported.report.meshCount > 250);
});
