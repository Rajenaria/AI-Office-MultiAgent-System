import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RESEARCH_ACTION_LIST,
  RESEARCH_ACTIONS,
  RESEARCH_AUTO_DEMO_SEQUENCE,
  RESEARCH_CHARACTER_CONSTANTS,
  RESEARCH_EXPRESSION_PRESETS,
  RESEARCH_HAIR_MATERIAL_PALETTE,
  RESEARCH_HAIR_SUBGROUPS,
  RESEARCH_PATROL_ANCHOR_RING,
  RESEARCH_REQUIRED_ANIMATION_CLIPS,
  RESEARCH_WALK_WAYPOINTS,
  findResearchWalkablePath,
  getResearchAnchorOrThrow,
} from './researchSimulationSpec';
import { DEFAULT_RESEARCH_ANCHORS } from './researchRoomSpec';

test('Research Professor character constants match official identity and Room-Native scale', () => {
  assert.equal(RESEARCH_CHARACTER_CONSTANTS.CHARACTER_ID, 'research_professor_agent');
  assert.equal(
    RESEARCH_CHARACTER_CONSTANTS.ASSET_ID,
    'ai_office.character.research_professor_agent.v1',
  );
  assert.equal(RESEARCH_CHARACTER_CONSTANTS.DISPLAY_NAME, 'Research Professor');
  assert.equal(
    RESEARCH_CHARACTER_CONSTANTS.FULL_ROLE_TITLE,
    'Senior Research & Shared Brain Specialist',
  );
  assert.equal(RESEARCH_CHARACTER_CONSTANTS.DEPARTMENT, 'Research & Knowledge');
  assert.equal(RESEARCH_CHARACTER_CONSTANTS.COMPATIBLE_ROOM_ID, 'AI_OFFICE_ROOM_RESEARCH_v1');
  assert.equal(RESEARCH_CHARACTER_CONSTANTS.GROUND_Y, 0.0);
  assert.ok(
    RESEARCH_CHARACTER_CONSTANTS.TARGET_HEIGHT_M >= 1.72 &&
      RESEARCH_CHARACTER_CONSTANTS.TARGET_HEIGHT_M <= 1.78,
  );
  assert.equal(RESEARCH_CHARACTER_CONSTANTS.GLB_FILENAME, 'research_professor_agent.glb');
  assert.equal(
    RESEARCH_CHARACTER_CONSTANTS.MANIFEST_FILENAME,
    'research_professor_agent.manifest.json',
  );
  assert.equal(
    RESEARCH_CHARACTER_CONSTANTS.BEHAVIOR_FILENAME,
    'research_professor_agent.behavior.json',
  );
  assert.equal(
    RESEARCH_CHARACTER_CONSTANTS.PREVIEW_FILENAME,
    'research_professor_agent_preview.png',
  );
});

test('Professor hairstyle specifies 8 semantic sub-groups and 5 matte white/pearl/silver/lavender-gray materials', () => {
  assert.equal(RESEARCH_HAIR_SUBGROUPS.length, 8);
  assert.deepEqual(RESEARCH_HAIR_SUBGROUPS, [
    'Hair_Base',
    'Hair_Crown',
    'Hair_Front_Layers',
    'Hair_Left_Side',
    'Hair_Right_Side',
    'Hair_Back_Upper',
    'Hair_Back_Lower',
    'Hair_Temple_Details',
  ]);

  assert.equal(RESEARCH_HAIR_MATERIAL_PALETTE.length, 5);
  for (const mat of RESEARCH_HAIR_MATERIAL_PALETTE) {
    assert.ok(mat.roughness >= 0.85, `${mat.id} should be matte (roughness >= 0.85)`);
    assert.ok(mat.metalness <= 0.05, `${mat.id} should have low metalness (<= 0.05)`);
  }
});

test('All 18 Research Professor actions map to verified Research Room anchors and embedded clips', () => {
  assert.equal(RESEARCH_ACTION_LIST.length, 18);
  assert.equal(RESEARCH_REQUIRED_ANIMATION_CLIPS.length, 20);

  const validAnchorIds = new Set(DEFAULT_RESEARCH_ANCHORS.map((a) => a.id));
  const validClipNames = new Set(RESEARCH_REQUIRED_ANIMATION_CLIPS);

  for (const action of RESEARCH_ACTION_LIST) {
    assert.ok(
      validAnchorIds.has(action.targetAnchorName),
      `Action ${action.id} targetAnchorName "${action.targetAnchorName}" must exist in DEFAULT_RESEARCH_ANCHORS`,
    );
    if (action.approachAnchorName) {
      assert.ok(
        validAnchorIds.has(action.approachAnchorName),
        `Action ${action.id} approachAnchorName "${action.approachAnchorName}" must exist in DEFAULT_RESEARCH_ANCHORS`,
      );
    }
    assert.ok(
      validClipNames.has(action.clipName),
      `Action ${action.id} clipName "${action.clipName}" must be in RESEARCH_REQUIRED_ANIMATION_CLIPS`,
    );
    const anchor = getResearchAnchorOrThrow(action.targetAnchorName);
    assert.equal(anchor.id, action.targetAnchorName);
  }
});

test('All 10 facial expressions and 14-step Auto-Demo sequence are valid', () => {
  const exprKeys = Object.keys(RESEARCH_EXPRESSION_PRESETS);
  assert.equal(exprKeys.length, 10);
  assert.ok(exprKeys.includes('neutral'));
  assert.ok(exprKeys.includes('idea'));
  assert.ok(exprKeys.includes('surprised'));
  assert.ok(exprKeys.includes('curious'));
  assert.ok(exprKeys.includes('talking'));
  assert.ok(exprKeys.includes('focused'));
  assert.ok(exprKeys.includes('sleepy'));
  assert.ok(exprKeys.includes('pleased'));
  assert.ok(exprKeys.includes('concerned'));
  assert.ok(exprKeys.includes('thinking'));

  assert.equal(RESEARCH_AUTO_DEMO_SEQUENCE.length, 14);
  for (const step of RESEARCH_AUTO_DEMO_SEQUENCE) {
    assert.ok(
      RESEARCH_ACTIONS[step.actionId],
      `Auto-demo step ${step.stepIndex} references valid action ${step.actionId}`,
    );
    assert.ok(step.holdDurationSec >= 1.5);
  }

  for (const patrolAnchor of RESEARCH_PATROL_ANCHOR_RING) {
    const resolved = getResearchAnchorOrThrow(patrolAnchor);
    assert.equal(resolved.id, patrolAnchor);
  }
});

test('Collision-free waypoint pathfinding stays strictly within 8x8 Research Room bounds and routes via desk approach', () => {
  for (const wp of Object.values(RESEARCH_WALK_WAYPOINTS)) {
    const [x, z] = wp.position;
    assert.ok(x >= 0.4 && x <= 7.6, `Waypoint ${wp.id} X=${x} out of safe bounds`);
    assert.ok(z >= 0.4 && z <= 7.6, `Waypoint ${wp.id} Z=${z} out of safe bounds`);
    assert.ok(wp.neighbors.length >= 1, `Waypoint ${wp.id} must have neighbors`);
  }

  const idleAnchor = getResearchAnchorOrThrow('RESEARCH_ROOM_IDLE');
  const deskAnchor = getResearchAnchorOrThrow('RESEARCH_DESK_WORK');
  const atlasAnchor = getResearchAnchorOrThrow('RESEARCH_KNOWLEDGE_ATLAS');
  const evidenceAnchor = getResearchAnchorOrThrow('RESEARCH_EVIDENCE_BOARD');

  const pathToDesk = findResearchWalkablePath(
    [idleAnchor.position[0], idleAnchor.position[2]],
    [deskAnchor.position[0], deskAnchor.position[2]],
  );
  assert.ok(pathToDesk.length >= 2);
  // Verify path approaches desk via WP_DESK_APPROACH [4.55, 4.78] before reaching [5.65, 4.88]
  assert.ok(
    pathToDesk.some(([x, z]) => Math.abs(x - 4.55) < 0.05 && Math.abs(z - 4.78) < 0.05),
    'Path to RESEARCH_DESK_WORK must pass through WP_DESK_APPROACH [4.55, 4.78]',
  );

  const pathDeskToEvidence = findResearchWalkablePath(
    [deskAnchor.position[0], deskAnchor.position[2]],
    [evidenceAnchor.position[0], evidenceAnchor.position[2]],
  );
  assert.ok(pathDeskToEvidence.length >= 3);
  for (const [px, pz] of pathDeskToEvidence) {
    assert.ok(px >= 0.42 && px <= 7.58);
    assert.ok(pz >= 0.42 && pz <= 7.58);
  }

  const pathEvidenceToAtlas = findResearchWalkablePath(
    [evidenceAnchor.position[0], evidenceAnchor.position[2]],
    [atlasAnchor.position[0], atlasAnchor.position[2]],
  );
  assert.ok(pathEvidenceToAtlas.length >= 3);
});
