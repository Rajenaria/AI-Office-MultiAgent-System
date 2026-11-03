import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  RESEARCH_MODULE_CONSTANTS,
  RESEARCH_CONNECTORS_SPEC,
  RESEARCH_INTERIOR_ZONES,
  RESEARCH_FURNITURE_CATALOG,
  DEFAULT_RESEARCH_ANCHORS,
  RESEARCH_DISPLAY_SLOTS,
  RESEARCH_FUTURE_ACTION_CONTRACTS,
  buildResearchDisplaySlotsJson,
  buildResearchRoomBehaviorJson,
} from './researchRoomSpec';

describe('Research & Shared Brain Room Spec (AI_OFFICE_ROOM_RESEARCH_v1)', () => {
  it('defines canonical module identity, 8x8x3.2 footprint, local [0,0,0] origin, and global [0,0,18] A3 offset', () => {
    assert.equal(RESEARCH_MODULE_CONSTANTS.MODULE_ID, 'AI_OFFICE_ROOM_RESEARCH_v1');
    assert.equal(RESEARCH_MODULE_CONSTANTS.ASSET_ID, 'ai_office.room.research_shared_brain.v1');
    assert.equal(RESEARCH_MODULE_CONSTANTS.REGISTRY_KEY, 'research_brain');
    assert.equal(RESEARCH_MODULE_CONSTANTS.ROOT_NODE_NAME, 'ROOM_RESEARCH_ROOT');
    assert.equal(RESEARCH_MODULE_CONSTANTS.FOOTPRINT_WIDTH, 8.0);
    assert.equal(RESEARCH_MODULE_CONSTANTS.FOOTPRINT_DEPTH, 8.0);
    assert.equal(RESEARCH_MODULE_CONSTANTS.WALL_HEIGHT, 3.2);
    assert.deepEqual(RESEARCH_MODULE_CONSTANTS.LOCAL_ORIGIN, [0, 0, 0]);
    assert.deepEqual(RESEARCH_MODULE_CONSTANTS.GLOBAL_A3_OFFSET, [0, 0, 18]);
    assert.equal(RESEARCH_MODULE_CONSTANTS.REQUIRED_GROUPS.length, 8);
  });

  it('defines RESEARCH_SOUTH_CORRIDOR at local [4,0,0] with 2.0u width and 2.3u height', () => {
    assert.equal(RESEARCH_CONNECTORS_SPEC.length, 1);
    const south = RESEARCH_CONNECTORS_SPEC[0];
    assert.equal(south.id, 'RESEARCH_SOUTH_CORRIDOR');
    assert.equal(south.wall, 'SOUTH');
    assert.deepEqual(south.position, [4, 0, 0]);
    assert.equal(south.width, 2.0);
    assert.equal(south.height, 2.3);
    assert.equal(south.direction, '-Z');
  });

  it('defines 4 distinct functional interior zones and 10 curated furniture/architecture items', () => {
    assert.equal(RESEARCH_INTERIOR_ZONES.length, 4);
    assert.equal(RESEARCH_FURNITURE_CATALOG.length, 10);
    for (const item of RESEARCH_FURNITURE_CATALOG) {
      const [x, y, z] = item.position;
      assert.ok(x >= 0 && x <= 8, `${item.id} X out of bounds: ${x}`);
      assert.ok(y >= 0 && y <= 3.2, `${item.id} Y out of bounds: ${y}`);
      assert.ok(z >= 0 && z <= 8, `${item.id} Z out of bounds: ${z}`);
    }
  });

  it('defines all 13 required room-local anchors within [0..8] footprint with normalized facing vectors', () => {
    const requiredIds = [
      'RESEARCH_ROOM_SPAWN',
      'RESEARCH_ROOM_IDLE',
      'RESEARCH_DESK_APPROACH',
      'RESEARCH_DESK_WORK',
      'RESEARCH_CHAIR_POSITION',
      'RESEARCH_BOOKSHELF_ACCESS',
      'RESEARCH_ARCHIVE_DRAWER',
      'RESEARCH_KNOWLEDGE_ATLAS',
      'RESEARCH_EVIDENCE_BOARD',
      'RESEARCH_READING_TABLE',
      'RESEARCH_REFERENCE_REVIEW',
      'RESEARCH_PRESENTATION_POSITION',
      'RESEARCH_SOUTH_EXIT',
    ];
    assert.equal(DEFAULT_RESEARCH_ANCHORS.length, requiredIds.length);
    const actualIds = DEFAULT_RESEARCH_ANCHORS.map((a) => a.id);
    for (const reqId of requiredIds) {
      assert.ok(actualIds.includes(reqId as any), `Missing anchor ${reqId}`);
    }

    for (const anchor of DEFAULT_RESEARCH_ANCHORS) {
      const [x, y, z] = anchor.position;
      assert.ok(x >= 0.3 && x <= 7.7, `Anchor ${anchor.id} X out of safe bounds: ${x}`);
      assert.equal(y, 0.0, `Anchor ${anchor.id} Y must be on floor 0.0`);
      assert.ok(z >= 0.3 && z <= 7.7, `Anchor ${anchor.id} Z out of safe bounds: ${z}`);
      const [fx, fy, fz] = anchor.facing_direction;
      const len = Math.hypot(fx, fy, fz);
      assert.ok(Math.abs(len - 1.0) < 1e-4, `Anchor ${anchor.id} facing vector not unit length`);
    }
  });

  it('defines all 6 Shared Brain & Research display slots marked demo_only: true', () => {
    const slotsJson = buildResearchDisplaySlotsJson();
    assert.equal(slotsJson.demo_mode_only, true);
    assert.equal(slotsJson.total_display_slots, 6);
    const expectedSlots = [
      'RESEARCH_DISPLAY_SOURCE_INDEX',
      'RESEARCH_DISPLAY_KNOWLEDGE_ATLAS',
      'RESEARCH_DISPLAY_ORG_BRAIN',
      'RESEARCH_DISPLAY_PROJECT_BRAIN',
      'RESEARCH_DISPLAY_AGENT_CONTEXT',
      'RESEARCH_DISPLAY_EVIDENCE_STATUS',
    ];
    for (const slotId of expectedSlots) {
      const found = RESEARCH_DISPLAY_SLOTS.find((s) => s.slot_id === slotId);
      assert.ok(found, `Missing display slot ${slotId}`);
      assert.equal(found.demo_only, true);
      assert.equal(found.demo_badge_label, 'DEMO');
    }
  });

  it('defines 14 future action contracts for the future Research Professor character', () => {
    const behavior = buildResearchRoomBehaviorJson();
    assert.equal(behavior.character_included_in_room_glb, false);
    assert.equal(behavior.supported_actions.length, 14);
    const anchorIds = new Set(DEFAULT_RESEARCH_ANCHORS.map((a) => a.id));
    for (const act of RESEARCH_FUTURE_ACTION_CONTRACTS) {
      assert.ok(anchorIds.has(act.target_anchor), `Invalid target_anchor ${act.target_anchor}`);
      assert.ok(anchorIds.has(act.fallback_anchor), `Invalid fallback_anchor ${act.fallback_anchor}`);
    }
  });
});
