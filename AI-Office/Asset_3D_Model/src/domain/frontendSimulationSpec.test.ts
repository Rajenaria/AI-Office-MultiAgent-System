import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FRONTEND_ACTION_LIST,
  FRONTEND_ACTIONS,
  FRONTEND_AUTO_DEMO_SEQUENCE,
  FRONTEND_CHARACTER_CONSTANTS,
  FRONTEND_EXPRESSION_PRESETS,
  FRONTEND_PATROL_ANCHORS,
  FRONTEND_REQUIRED_ANIMATION_CLIPS,
  findFrontendWalkablePath,
} from './frontendSimulationSpec';
import { DEFAULT_ENGINEERING_ANCHORS } from './engineeringRoomSpec';

test('Frontend Developer character constants match Engineering Agent 01 specification', () => {
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.CHARACTER_ID, 'frontend_developer_agent');
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.ASSET_ID, 'ai_office.character.frontend_developer_agent.v1');
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.DISPLAY_NAME, 'Frontend Developer');
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.DEPARTMENT, 'Engineering');
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.ROOM_ID, 'AI_OFFICE_ROOM_ENGINEERING_v1');
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.ROLE_TYPE, 'FRONTEND_ENGINEER');
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.ROOT_NODE_NAME, 'Frontend_Developer_Agent_Root');
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.TARGET_HEIGHT_M, 1.725);
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.GLB_FILENAME, 'frontend_developer_agent.glb');
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.MANIFEST_FILENAME, 'frontend_developer_agent.manifest.json');
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.BEHAVIOR_FILENAME, 'frontend_developer_agent.behavior.json');
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.PREVIEW_FILENAME, 'frontend_developer_agent_preview.png');
  assert.equal(FRONTEND_CHARACTER_CONSTANTS.PACK_ZIP_FILENAME, 'frontend_developer_agent_pack.zip');
});

test('Frontend Developer defines all 16 required actions and 16 animation clips', () => {
  assert.equal(FRONTEND_REQUIRED_ANIMATION_CLIPS.length, 16);
  assert.equal(FRONTEND_ACTION_LIST.length, 16);

  const clipSet = new Set<string>(FRONTEND_REQUIRED_ANIMATION_CLIPS);
  assert.equal(clipSet.size, 16);

  for (const action of FRONTEND_ACTION_LIST) {
    assert.equal(
      clipSet.has(action.clipName),
      true,
      `Action ${action.id} references unknown clip ${action.clipName}`
    );
    assert.equal(
      Boolean(DEFAULT_ENGINEERING_ANCHORS[action.targetAnchor]),
      true,
      `Action ${action.id} references invalid Engineering anchor ${action.targetAnchor}`
    );
    assert.equal(
      Boolean(FRONTEND_EXPRESSION_PRESETS[action.defaultExpression]),
      true,
      `Action ${action.id} references invalid expression ${action.defaultExpression}`
    );
  }

  // Seated actions automatically hide the backpack so it never clips through the chair backrest
  assert.equal(FRONTEND_ACTIONS.work_typing.posture, 'seated');
  assert.equal(FRONTEND_ACTIONS.work_typing.hideBackpackBecauseSeated, true);
  assert.equal(FRONTEND_ACTIONS.review_ui.posture, 'seated');
  assert.equal(FRONTEND_ACTIONS.review_ui.hideBackpackBecauseSeated, true);
  assert.equal(FRONTEND_ACTIONS.debug_frontend.posture, 'seated');
  assert.equal(FRONTEND_ACTIONS.debug_frontend.hideBackpackBecauseSeated, true);
});

test('Frontend Developer defines all 9 facial expressions including tired debugging frustration', () => {
  const expressions = Object.keys(FRONTEND_EXPRESSION_PRESETS);
  assert.equal(expressions.length, 9);
  const expected = [
    'neutral',
    'focused',
    'happy',
    'thinking',
    'talking',
    'concerned',
    'surprised',
    'confident',
    'tired',
  ];
  for (const exp of expected) {
    assert.equal(expressions.includes(exp), true, `Missing expression preset: ${exp}`);
  }
});

test('Frontend Auto-Demo sequence has 10 ordered steps covering core Frontend workflow', () => {
  assert.equal(FRONTEND_AUTO_DEMO_SEQUENCE.length, 10);
  assert.equal(FRONTEND_AUTO_DEMO_SEQUENCE[0].actionId, 'idle');
  assert.equal(FRONTEND_AUTO_DEMO_SEQUENCE[2].actionId, 'work_typing');
  assert.equal(FRONTEND_AUTO_DEMO_SEQUENCE[3].actionId, 'review_ui');
  assert.equal(FRONTEND_AUTO_DEMO_SEQUENCE[4].actionId, 'debug_frontend');
  assert.equal(FRONTEND_AUTO_DEMO_SEQUENCE[6].actionId, 'code_review');
  assert.equal(FRONTEND_AUTO_DEMO_SEQUENCE[7].actionId, 'present_component');
  assert.equal(FRONTEND_AUTO_DEMO_SEQUENCE[8].actionId, 'task_completed');
  assert.equal(FRONTEND_AUTO_DEMO_SEQUENCE[9].actionId, 'idle');
});

test('findFrontendWalkablePath routes cleanly inside 8x16 Engineering Studio bounds without crossing Frontend Desk', () => {
  const spawn = DEFAULT_ENGINEERING_ANCHORS.ENGINEERING_ROOM_SPAWN.position;
  const feWork = DEFAULT_ENGINEERING_ANCHORS.FE_DESK_WORK.position;
  const feMonitor = DEFAULT_ENGINEERING_ANCHORS.FE_MONITOR_INTERACTION.position;
  const archBoard = DEFAULT_ENGINEERING_ANCHORS.ENG_ARCHITECTURE_BOARD.position;

  const pathToDesk = findFrontendWalkablePath([spawn[0], spawn[2]], [feWork[0], feWork[2]]);
  assert.equal(pathToDesk.length >= 2, true);
  for (const [x, z] of pathToDesk) {
    assert.equal(x >= 0.5 && x <= 7.5, true, `Waypoint X=${x} out of bounds`);
    assert.equal(z >= 0.5 && z <= 15.5, true, `Waypoint Z=${z} out of bounds`);
    // Ensure no waypoint lies inside Frontend Desk solid body (X=1.35..3.35, Z=13.35..14.15)
    const insideFeDesk = x > 1.35 && x < 3.35 && z > 13.35 && z < 14.15;
    assert.equal(insideFeDesk, false, `Waypoint [${x}, ${z}] collides with Frontend Desk`);
  }

  const pathToMonitor = findFrontendWalkablePath(
    [feWork[0], feWork[2]],
    [feMonitor[0], feMonitor[2]]
  );
  assert.equal(pathToMonitor.length >= 2, true);

  const pathToArch = findFrontendWalkablePath(
    [feMonitor[0], feMonitor[2]],
    [archBoard[0], archBoard[2]]
  );
  assert.equal(pathToArch.length >= 2, true);

  for (const anchorId of FRONTEND_PATROL_ANCHORS) {
    assert.equal(Boolean(DEFAULT_ENGINEERING_ANCHORS[anchorId]), true);
  }
});
