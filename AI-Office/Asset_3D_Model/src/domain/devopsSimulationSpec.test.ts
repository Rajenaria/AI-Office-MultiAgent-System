import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  DEVOPS_ACTION_LIST,
  DEVOPS_AUTO_DEMO_SEQUENCE,
  DEVOPS_CHARACTER_CONSTANTS,
  DEVOPS_EXPRESSION_PRESETS,
  DEVOPS_HAIR_MATERIAL_PALETTE,
  DEVOPS_HAIR_SUBGROUPS,
  DEVOPS_REQUIRED_ANIMATION_CLIPS,
  findDevOpsWalkablePath,
} from './devopsSimulationSpec';
import {
  buildDevOpsEngineerModel,
  createDevOpsEngineerRuntime,
  exportDevOpsEngineerToGLBBuffer,
} from '../three/DevOpsCharacterSystem';
import { createQAEngineerRuntime } from '../three/QACharacterSystem';
import { parseAndValidateDevOpsCharacterGLBBuffer } from '../export/AssetValidation';
import { buildDevOpsCharacterExportPack } from '../export/CharacterExporter';

describe('Agent 09 — DevOps Engineer Voxel Character & Simulation Specification', () => {
  it('defines DEVOPS_CHARACTER_CONSTANTS with height 1.735m, standing hips Y=0.90, seated hips Y=0.725', () => {
    assert.equal(DEVOPS_CHARACTER_CONSTANTS.CHARACTER_ID, 'devops_engineer_agent');
    assert.equal(DEVOPS_CHARACTER_CONSTANTS.ASSET_ID, 'ai_office.character.devops_engineer_agent.v1');
    assert.equal(DEVOPS_CHARACTER_CONSTANTS.DISPLAY_NAME, 'DevOps Engineer');
    assert.equal(DEVOPS_CHARACTER_CONSTANTS.TARGET_HEIGHT_M, 1.735);
    assert.equal(DEVOPS_CHARACTER_CONSTANTS.STANDING_HIPS_Y, 0.9);
    assert.equal(DEVOPS_CHARACTER_CONSTANTS.SEATED_HIPS_Y, 0.725);
    assert.equal(DEVOPS_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR, 'DEVOPS_WORKSTATION_APPROACH');
  });

  it('defines 9 semantic curly hair sub-groups and 5 matte charcoal/black material swatches', () => {
    assert.equal(DEVOPS_HAIR_SUBGROUPS.length, 9);
    assert.ok(DEVOPS_HAIR_SUBGROUPS.includes('Hair_Base_Volume'));
    assert.ok(DEVOPS_HAIR_SUBGROUPS.includes('Hair_Crown_Core'));
    assert.ok(DEVOPS_HAIR_SUBGROUPS.includes('Hair_Crown_Curls'));
    assert.ok(DEVOPS_HAIR_SUBGROUPS.includes('Hair_Front_Curls'));
    assert.ok(DEVOPS_HAIR_SUBGROUPS.includes('Hair_Left_Curls'));
    assert.ok(DEVOPS_HAIR_SUBGROUPS.includes('Hair_Right_Curls'));
    assert.ok(DEVOPS_HAIR_SUBGROUPS.includes('Hair_Back_Curls'));
    assert.ok(DEVOPS_HAIR_SUBGROUPS.includes('Hair_Temple_Transition'));
    assert.ok(DEVOPS_HAIR_SUBGROUPS.includes('Hair_Nape_Details'));

    assert.equal(DEVOPS_HAIR_MATERIAL_PALETTE.length, 5);
    assert.equal(DEVOPS_HAIR_MATERIAL_PALETTE[0].id, 'devops_hair_charcoal_base');
    assert.equal(DEVOPS_HAIR_MATERIAL_PALETTE[0].hex, '#181B22');
  });

  it('defines 25 DevOps action contracts, 27 animation clips, 10 expressions, and 18-step auto demo', () => {
    assert.equal(DEVOPS_ACTION_LIST.length, 25);
    assert.equal(DEVOPS_REQUIRED_ANIMATION_CLIPS.length, 27);
    assert.equal(Object.keys(DEVOPS_EXPRESSION_PRESETS).length, 10);
    assert.equal(DEVOPS_AUTO_DEMO_SEQUENCE.length, 18);

    // Every action references a valid required animation clip
    for (const action of DEVOPS_ACTION_LIST) {
      assert.ok(
        DEVOPS_REQUIRED_ANIMATION_CLIPS.includes(
          action.clipName as (typeof DEVOPS_REQUIRED_ANIMATION_CLIPS)[number]
        ),
        `Action ${action.id} references unknown clip ${action.clipName}`
      );
    }
  });

  it('builds 3D DevOps Engineer voxel model with 360-degree curly hair, neck headphones ON, glasses OFF, and cloud backpack', () => {
    const built = buildDevOpsEngineerModel();
    built.characterRoot.updateMatrixWorld(true);

    // Verify all 9 curly hair sub-groups are populated with meshes
    for (const sg of DEVOPS_HAIR_SUBGROUPS) {
      const grp = built.hairRoot.getObjectByName(sg);
      assert.ok(grp, `Missing hair subgroup ${sg}`);
      assert.ok(grp.children.length > 0, `Empty hair subgroup ${sg}`);
    }

    // Verify default accessory states
    assert.equal(built.headphonesGroup.visible, true);
    assert.equal(built.glassesGroup.visible, false);
    assert.equal(built.backpackGroup.visible, true);
    assert.ok(built.backpackGroup.getObjectByName('Backpack_Cloud_Emblem'));

    // Verify bounding box height ~1.735m and feet grounded at Y=0
    const bbox = new THREE.Box3().setFromObject(built.characterRoot);
    const height = bbox.max.y - bbox.min.y;
    assert.ok(Math.abs(bbox.min.y) < 0.03, `Feet should be grounded at Y=0, got ${bbox.min.y}`);
    assert.ok(
      height >= 1.65 && height <= 1.82,
      `Expected standing height near 1.735m, got ${height.toFixed(3)}m`
    );
  });

  it('coexists with QA Engineer in QA & DevOps Studio and auto-hides backpack when seated', () => {
    const qaRuntime = createQAEngineerRuntime();
    const devopsRuntime = createDevOpsEngineerRuntime();

    // Verify initial zones: QA in North Zone (Z >= 7.0), DevOps in South Zone (Z <= 6.2)
    assert.ok(qaRuntime.getStatus().worldPosition[2] >= 7.0);
    assert.ok(devopsRuntime.getStatus().worldPosition[2] <= 6.2);
    assert.equal(devopsRuntime.getStatus().headphonesVisible, true);
    assert.equal(devopsRuntime.getStatus().glassesVisible, false);

    // Trigger seated action on DevOps Engineer (WORK_DESK)
    devopsRuntime.triggerAction('WORK_DESK');
    for (let i = 0; i < 120; i++) {
      devopsRuntime.update(0.05);
      qaRuntime.update(0.05);
    }

    const devopsSeated = devopsRuntime.getStatus();
    assert.equal(devopsSeated.posture, 'seated');
    assert.equal(devopsSeated.backpackAutoHiddenForSeat, true);
    assert.equal(devopsRuntime.model.backpackGroup.visible, false);

    // Stand back up at Server Rack 1 (INSPECT_SERVER_RACK)
    devopsRuntime.triggerAction('INSPECT_SERVER_RACK');
    for (let i = 0; i < 120; i++) {
      devopsRuntime.update(0.05);
    }
    const devopsStanding = devopsRuntime.getStatus();
    assert.equal(devopsStanding.posture, 'standing');
    assert.equal(devopsStanding.backpackAutoHiddenForSeat, false);
    assert.equal(devopsRuntime.model.backpackGroup.visible, true);

    // Verify collision-safe navigation path
    const path = findDevOpsWalkablePath([4.45, 0, 3.05], [6.65, 0, 1.3]);
    assert.ok(path.length >= 1);
  });

  it('exports devops_engineer_agent.glb and passes all independent GLTFLoader round-trip checks', async () => {
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

    const pack = await buildDevOpsCharacterExportPack();
    assert.ok(pack.glbSizeBytes > 10000);
    assert.equal(pack.manifest.character_id, 'devops_engineer_agent');
    assert.equal(pack.behaviorJson.action_mappings.length, 25);

    const { report } = await parseAndValidateDevOpsCharacterGLBBuffer(
      pack.glbBuffer,
      pack.sourceTotalMeshes
    );
    assert.equal(report.validGlbHeader, true);
    assert.equal(report.feetGroundedAtZero, true);
    assert.equal(report.heightMatchesSpec, true);
    assert.equal(report.roomGeometryExcluded, true);
    assert.equal(report.articulatedPivotsVerified.allPresent, true);
    assert.equal(report.identityMeshesVerified.allPresent, true);
    assert.equal(report.embeddedClipsVerified.allPresent, true);
    assert.equal(report.embeddedClipsVerified.count, 27);
    assert.equal(report.loadSuccess, true);
  });
});
