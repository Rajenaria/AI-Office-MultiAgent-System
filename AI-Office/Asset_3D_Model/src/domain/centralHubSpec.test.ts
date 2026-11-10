import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CENTRAL_HUB_ANCHORS_LIST,
  CENTRAL_HUB_FURNITURE_CATALOG,
  CENTRAL_HUB_MODULE_CONSTANTS,
  CENTRAL_HUB_REQUIRED_GROUPS,
  HUB_MEETING_SEATS_LIST,
  buildCentralHubAnchorsJson,
  buildCentralHubManifestV2,
  buildCentralHubMeetingSeatsJson,
  validateCentralHubBoundingBox,
} from './centralHubSpec';
import {
  FULL_OFFICE_CAMERA_PRESETS,
  buildFullOfficeVisualProfileV2Json,
  computeAutoFitZoomForFullOfficePreset,
  validateFullOfficeGeometricPrecision,
} from './officeLayoutA3Spec';
import { createPixelMaterialLibrary } from '../three/PixelMaterialLibrary';
import { buildCentralHubComplete } from '../three/CentralHubBuilder';
import { buildCentralHubV2ProductionAssetPack } from '../export/RoomExporter';
import { parseAndValidateCentralHubV2GLBBuffer } from '../export/AssetValidation';

describe('Open Central Hub V2 & Full Office Visual Overhaul V2 Specification', () => {
  it('defines CENTRAL_HUB_MODULE_CONSTANTS at local [0,0,0] (16x16x3.2) and global [8,0,0]', () => {
    assert.equal(CENTRAL_HUB_MODULE_CONSTANTS.moduleId, 'AI_OFFICE_CENTRAL_HUB_v2');
    assert.equal(CENTRAL_HUB_MODULE_CONSTANTS.rootNodeName, 'CENTRAL_HUB_ROOT');
    assert.deepEqual(CENTRAL_HUB_MODULE_CONSTANTS.dimensions, [16, 16, 3.2]);
    assert.deepEqual(CENTRAL_HUB_MODULE_CONSTANTS.localOrigin, [0, 0, 0]);
    assert.deepEqual(CENTRAL_HUB_MODULE_CONSTANTS.globalOffsetA3, [8, 0, 0]);
    assert.equal(CENTRAL_HUB_MODULE_CONSTANTS.tableWidthX, 6.8);
    assert.equal(CENTRAL_HUB_MODULE_CONSTANTS.tableDepthZ, 2.3);
    assert.equal(CENTRAL_HUB_MODULE_CONSTANTS.tableHeightY, 0.75);
    assert.equal(CENTRAL_HUB_MODULE_CONSTANTS.entranceWidthX, 2.4);
  });

  it('defines all 12 required Central Hub V2 semantic scene groups', () => {
    assert.equal(CENTRAL_HUB_REQUIRED_GROUPS.length, 12);
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('FLOOR'));
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('PARQUET'));
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('STONE_PERIMETER'));
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('FLOOR_TRIMS'));
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('ENTRANCE_STRUCTURE'));
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('MEETING_RUG'));
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('MEETING_TABLE'));
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('MEETING_CHAIRS'));
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('PLANTS'));
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('DECORATION'));
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('LIGHT_FIXTURES'));
    assert.ok(CENTRAL_HUB_REQUIRED_GROUPS.includes('CONNECTORS'));
  });

  it('defines 10 meeting seats (5 North + 5 South) with 9 real characters and 1 empty seat', () => {
    assert.equal(HUB_MEETING_SEATS_LIST.length, 10);
    const northSeats = HUB_MEETING_SEATS_LIST.filter((s) => s.side === 'NORTH');
    const southSeats = HUB_MEETING_SEATS_LIST.filter((s) => s.side === 'SOUTH');
    assert.equal(northSeats.length, 5);
    assert.equal(southSeats.length, 5);

    const realAvailable = HUB_MEETING_SEATS_LIST.filter((s) => s.is_real_available_character);
    const emptySeats = HUB_MEETING_SEATS_LIST.filter((s) => !s.is_real_available_character);
    assert.equal(realAvailable.length, 9);
    assert.equal(emptySeats.length, 1);

    // Seat 01 is Owner Reserved
    const seat01 = HUB_MEETING_SEATS_LIST.find((s) => s.seat_id === 'HUB_MEETING_SEAT_01')!;
    assert.equal(seat01.assigned_agent_id, 'HUB_MEETING_OWNER_RESERVED');
    assert.equal(seat01.is_real_available_character, false);

    // Seat 09 is active QA Engineer & Seat 10 is active DevOps Engineer
    const seat09 = HUB_MEETING_SEATS_LIST.find((s) => s.seat_id === 'HUB_MEETING_SEAT_09')!;
    const seat10 = HUB_MEETING_SEATS_LIST.find((s) => s.seat_id === 'HUB_MEETING_SEAT_10')!;
    assert.equal(seat09.assigned_agent_id, 'qa_engineer_agent');
    assert.equal(seat09.is_real_available_character, true);
    assert.equal(seat10.assigned_agent_id, 'devops_engineer_agent');
    assert.equal(seat10.is_real_available_character, true);

    // Verify local->global offset [8,0,0] for every seat
    for (const seat of HUB_MEETING_SEATS_LIST) {
      assert.ok(Math.abs(seat.global_position[0] - (seat.local_position[0] + 8)) < 1e-6);
      assert.ok(Math.abs(seat.global_position[2] - seat.local_position[2]) < 1e-6);
    }
  });

  it('defines 18 semantic Central Hub anchors and 12 catalog items', () => {
    assert.equal(CENTRAL_HUB_ANCHORS_LIST.length, 18);
    assert.equal(CENTRAL_HUB_FURNITURE_CATALOG.length, 12);

    const seatsContract = buildCentralHubMeetingSeatsJson();
    assert.equal(seatsContract.total_seats, 10);
    assert.equal(seatsContract.real_available_agent_seats, 9);
    assert.equal(seatsContract.empty_reserved_seats, 1);

    const anchorsContract = buildCentralHubAnchorsJson();
    assert.equal(anchorsContract.anchor_count, 18);

    const manifest = buildCentralHubManifestV2({
      meshCount: 240,
      triangleCount: 3200,
      materialCount: 24,
    });
    assert.equal(manifest.module_id, 'AI_OFFICE_CENTRAL_HUB_v2');
    assert.equal(manifest.meeting_capacity.total_seats, 10);
  });

  it('validates Central Hub bounding box precision and Full Office geometric precision', () => {
    const bboxCheck = validateCentralHubBoundingBox([0, 0, 0], [16, 3.2, 16], 0.05);
    assert.equal(bboxCheck.valid, true);
    assert.deepEqual(bboxCheck.measuredSize, [16, 3.2, 16]);

    const geoPrecision = validateFullOfficeGeometricPrecision();
    assert.equal(geoPrecision.valid, true);
    assert.equal(geoPrecision.trueIsometricAnglesVerified, true);
    assert.equal(geoPrecision.topViewZeroSkewVerified, true);
    assert.equal(geoPrecision.unitUniformityVerified, true);
  });

  it('computes responsive auto-fit zoom for Full Office camera presets and builds Visual Profile V2 JSON', () => {
    const isoPreset = FULL_OFFICE_CAMERA_PRESETS.find((p) => p.id === 'full_office_iso')!;
    const topPreset = FULL_OFFICE_CAMERA_PRESETS.find((p) => p.id === 'full_office_top')!;
    assert.ok(isoPreset);
    assert.ok(topPreset);
    assert.deepEqual(topPreset.position, [16, 48, 12.999]);
    assert.deepEqual(topPreset.target, [16, 0, 13]);

    const zoomWide = computeAutoFitZoomForFullOfficePreset(isoPreset.id, isoPreset.zoom, 16 / 9);
    const zoomNarrow = computeAutoFitZoomForFullOfficePreset(isoPreset.id, isoPreset.zoom, 4 / 3);
    assert.ok(zoomWide > 10);
    assert.ok(zoomNarrow > 10);
    assert.ok(zoomNarrow <= zoomWide);

    const profile = buildFullOfficeVisualProfileV2Json();
    assert.equal(profile.schema_version, 'AI_OFFICE_FULL_VISUAL_PROFILE_V2');
    assert.equal(profile.wall_and_entrance_architecture.engineering_south_wall_repaired, true);
    assert.equal(profile.wall_and_entrance_architecture.main_entrance_clear_width, 2.4);
  });

  it('builds Open Central Hub V2 16x16 scene, exports central_hub_v2.glb, and passes independent GLTFLoader round-trip validation', async () => {
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
              this.onload?.();
              this.onloadend?.();
            })
            .catch((err) => this.onerror?.(err));
        }
        readAsDataURL(blob: Blob) {
          blob
            .arrayBuffer()
            .then((buf) => {
              const b64 = Buffer.from(buf).toString('base64');
              this.result = `data:${blob.type || 'application/octet-stream'};base64,${b64}`;
              this.onload?.();
              this.onloadend?.();
            })
            .catch((err) => this.onerror?.(err));
        }
      }
      (globalThis as unknown as { FileReader: unknown }).FileReader = NodeFileReaderPolyfill;
    }

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
    const builtHub = buildCentralHubComplete(matLib);
    const pack = await buildCentralHubV2ProductionAssetPack(builtHub.root);
    assert.ok(pack.glbSizeBytes > 10000);

    const { report } = await parseAndValidateCentralHubV2GLBBuffer(pack.glbBuffer);
    assert.equal(report.validGlbHeader, true);
    assert.equal(report.all12GroupsVerified, true);
    assert.equal(report.all10ChairsVerified, true);
    assert.equal(report.all18AnchorsVerified, true);
    assert.equal(report.mainSouthEntranceVerified, true);
    assert.equal(report.conferenceTableVerified, true);
    assert.equal(report.reviewDisplayFrontFacingVerified, true);
    assert.equal(report.characterExcluded, true);
    assert.equal(report.loadSuccess, true);
  });
});
