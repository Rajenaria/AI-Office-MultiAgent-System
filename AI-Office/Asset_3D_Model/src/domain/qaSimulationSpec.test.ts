import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QA_ACTION_LIST,
  QA_ACTIONS,
  QA_AUTO_DEMO_SEQUENCE,
  QA_CHARACTER_CONSTANTS,
  QA_EXPRESSION_PRESETS,
  QA_HAIR_MATERIAL_PALETTE,
  QA_HAIR_SUBGROUPS,
  QA_PATROL_ANCHOR_RING,
  QA_REQUIRED_ANIMATION_CLIPS,
  QA_WALK_WAYPOINTS,
  findQAWalkablePath,
  getQADefaultAnchorPositionAndFacing,
} from './qaSimulationSpec';
import { DEFAULT_QA_DEVOPS_ANCHORS } from './qaDevopsRoomSpec';

test('QA_CHARACTER_CONSTANTS defines canonical qa_engineer_agent identity and ~1.735u scale', () => {
  assert.equal(QA_CHARACTER_CONSTANTS.CHARACTER_ID, 'qa_engineer_agent');
  assert.equal(
    QA_CHARACTER_CONSTANTS.ASSET_ID,
    'ai_office.character.qa_engineer_agent.v1'
  );
  assert.equal(QA_CHARACTER_CONSTANTS.DISPLAY_NAME, 'QA Engineer');
  assert.equal(QA_CHARACTER_CONSTANTS.DEPARTMENT, 'QA & Review');
  assert.equal(
    QA_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID,
    'AI_OFFICE_ROOM_QA_DEVOPS_v1'
  );
  assert.equal(QA_CHARACTER_CONSTANTS.ROOT_NODE_NAME, 'QA_Engineer_Agent_Root');
  assert.equal(
    QA_CHARACTER_CONSTANTS.RUNTIME_ROOT_NAME,
    'QA_ENGINEER_AGENT_RUNTIME_ROOT'
  );
  assert.equal(QA_CHARACTER_CONSTANTS.TARGET_HEIGHT_M, 1.735);
  assert.equal(QA_CHARACTER_CONSTANTS.STANDING_HIPS_Y, 0.9);
  assert.equal(QA_CHARACTER_CONSTANTS.SEATED_HIPS_Y, 0.725);
  assert.equal(
    QA_CHARACTER_CONSTANTS.DEFAULT_SPAWN_ANCHOR,
    'QA_WORKSTATION_APPROACH'
  );
});

test('QA_HAIR_MATERIAL_PALETTE defines 5 matte chestnut-brown hair shades plus gold hair clip material and 8 hair subgroups', () => {
  assert.equal(QA_HAIR_SUBGROUPS.length, 8);
  assert.ok(QA_HAIR_SUBGROUPS.includes('Hair_High_Bun'));
  assert.ok(QA_HAIR_SUBGROUPS.includes('Hair_Clip_Gold'));

  assert.equal(QA_HAIR_MATERIAL_PALETTE.length, 6);
  const hairTones = QA_HAIR_MATERIAL_PALETTE.filter(
    (m) => m.id !== 'qa_hair_clip_gold'
  );
  assert.equal(hairTones.length, 5);
  for (const mat of hairTones) {
    assert.ok(mat.hex.startsWith('#'));
    assert.ok(
      mat.roughness >= 0.8,
      `Expected matte roughness >= 0.8 for ${mat.id}`
    );
    assert.ok(
      mat.metalness <= 0.1,
      `Expected low metalness <= 0.1 for ${mat.id}`
    );
  }
});

test('QA_ACTION_LIST defines all 21 QA Engineer actions mapped to valid QA & DevOps anchors and 23 embedded clips', () => {
  assert.equal(QA_ACTION_LIST.length, 21);
  assert.equal(QA_REQUIRED_ANIMATION_CLIPS.length, 23);

  const validClipNames = new Set(QA_REQUIRED_ANIMATION_CLIPS);
  for (const action of QA_ACTION_LIST) {
    assert.ok(
      DEFAULT_QA_DEVOPS_ANCHORS[action.targetAnchorName],
      `Action ${action.id} references unknown anchor ${action.targetAnchorName}`
    );
    assert.ok(
      validClipNames.has(action.clipName),
      `Action ${action.id} references unknown clip ${action.clipName}`
    );
    assert.ok(action.bubbleText.length > 10);
    assert.ok(action.thoughtText.length > 10);
  }
});

test('QA_EXPRESSION_PRESETS defines all 10 lightweight voxel facial expressions', () => {
  const ids = Object.keys(QA_EXPRESSION_PRESETS);
  assert.equal(ids.length, 10);
  assert.deepEqual(ids, [
    'neutral',
    'focused',
    'happy',
    'thinking',
    'talking',
    'surprised',
    'concerned',
    'frustrated_by_bug',
    'confident',
    'tired_waiting',
  ]);
});

test('QA_AUTO_DEMO_SEQUENCE and QA_PATROL_ANCHOR_RING reference valid actions and anchors', () => {
  assert.equal(QA_AUTO_DEMO_SEQUENCE.length, 18);
  for (const step of QA_AUTO_DEMO_SEQUENCE) {
    assert.ok(
      QA_ACTIONS[step.actionId],
      `Invalid demo actionId ${step.actionId}`
    );
    assert.ok(step.durationSec >= 2.0);
  }

  for (const anchorId of QA_PATROL_ANCHOR_RING) {
    const resolved = getQADefaultAnchorPositionAndFacing(anchorId);
    assert.equal(resolved.position.length, 3);
  }
});

test('findQAWalkablePath routes cleanly inside 8x16 QA & DevOps Studio bounds and avoids South DevOps rack zone', () => {
  for (const wp of QA_WALK_WAYPOINTS) {
    assert.ok(wp.position[0] > 0.5 && wp.position[0] < 7.5);
    assert.ok(wp.position[2] >= 5.5 && wp.position[2] < 15.6);
  }

  const approach = getQADefaultAnchorPositionAndFacing('QA_WORKSTATION_APPROACH');
  const desk = getQADefaultAnchorPositionAndFacing('QA_DESK_WORK');
  const reviewBoard = getQADefaultAnchorPositionAndFacing('QA_DEVOPS_REVIEW_BOARD');

  const pathToDesk = findQAWalkablePath(
    [approach.position[0], approach.position[2]],
    [desk.position[0], desk.position[2]]
  );
  assert.ok(pathToDesk.length >= 1);

  const pathToReviewBoard = findQAWalkablePath(
    [desk.position[0], desk.position[2]],
    [reviewBoard.position[0], reviewBoard.position[2]]
  );
  assert.ok(pathToReviewBoard.length >= 3);
  for (const [x, , z] of pathToReviewBoard) {
    assert.ok(x >= 0.5 && x <= 7.5);
    assert.ok(z >= 5.2 && z <= 15.6);
  }
});

test('builds QA Engineer character pack V1, exports qa_engineer_agent.glb with 23 clips, and passes independent GLTFLoader round-trip validation', async () => {
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

  const { createPixelMaterialLibrary } = await import('../three/PixelMaterialLibrary');
  const { buildQACharacterExportPack } = await import('../export/CharacterExporter');
  const { parseAndValidateQACharacterGLBBuffer } = await import('../export/AssetValidation');

  const matLib = createPixelMaterialLibrary();
  matLib.setVisualMode('clean', false);
  const pack = await buildQACharacterExportPack(matLib);
  assert.ok(pack.glbSizeBytes > 5000);
  assert.equal(pack.manifest.character_id, 'qa_engineer_agent');
  assert.equal(pack.manifest.supported_animation_clips.length, 23);

  const { report } = await parseAndValidateQACharacterGLBBuffer(pack.glbBuffer);
  assert.equal(report.validGlbHeader, true);
  assert.equal(report.feetGroundedAtZero, true);
  assert.equal(report.heightMatchesSpec, true);
  assert.equal(report.roomGeometryExcluded, true);
  assert.equal(report.articulatedPivotsVerified.allPresent, true);
  assert.equal(report.identityMeshesVerified.allPresent, true);
  assert.equal(report.embeddedClipsVerified.allPresent, true);
  assert.equal(report.embeddedClipsVerified.count, 23);
  assert.equal(report.loadSuccess, true);
});

