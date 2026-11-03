import * as THREE from 'three';
import {
  DEFAULT_QA_DEVOPS_ANCHOR_LIST,
  QA_DEVOPS_CONNECTORS_SPEC,
  QA_DEVOPS_MODULE_CONSTANTS,
  type QADevOpsDisplaySlotId,
} from '../domain/qaDevopsRoomSpec';
import type { MaterialLibraryInstance } from './PixelMaterialLibrary';

export interface BuiltQADevOpsRoomResult {
  root: THREE.Group;
  roomRoot: THREE.Group;
  groups: Record<(typeof QA_DEVOPS_MODULE_CONSTANTS.REQUIRED_GROUPS)[number], THREE.Group>;
  furnitureSubgroups: Record<
    (typeof QA_DEVOPS_MODULE_CONSTANTS.SEMANTIC_FURNITURE_SUBGROUPS)[number],
    THREE.Group
  >;
  propsSubgroups: Record<
    (typeof QA_DEVOPS_MODULE_CONSTANTS.SEMANTIC_PROPS_SUBGROUPS)[number],
    THREE.Group
  >;
  decorationSubgroups: Record<
    (typeof QA_DEVOPS_MODULE_CONSTANTS.SEMANTIC_DECORATION_SUBGROUPS)[number],
    THREE.Group
  >;
  northWallNodes: THREE.Object3D[];
  southWallNodes: THREE.Object3D[];
  eastWallNodes: THREE.Object3D[];
  westWallNodes: THREE.Object3D[];
  furnitureNodes: Map<string, THREE.Object3D>;
  catalogNodeMap: Map<string, THREE.Object3D>;
  displaySlotNodes: Map<QADevOpsDisplaySlotId, THREE.Mesh>;
  helpersGroup: THREE.Group;
  stats: {
    meshCount: number;
    triangleCount: number;
    materialCount: number;
  };
}

function addBox(
  parent: THREE.Object3D,
  name: string,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  mat: THREE.Material,
  castShadow = true,
  receiveShadow = true,
  extraUserData: Record<string, unknown> = {}
): THREE.Mesh {
  const geom = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  mesh.userData = { ...extraUserData };
  parent.add(mesh);
  return mesh;
}

/**
 * Creates a single front-facing display plane (`FrontSide` only — never `DoubleSide`)
 * so that monitor and board screens never duplicate or mirror on their rear sides.
 */
function addSingleFrontScreenPlane(
  parent: THREE.Object3D,
  name: string,
  w: number,
  h: number,
  x: number,
  y: number,
  z: number,
  rotY: number,
  mat: THREE.Material,
  slotId?: QADevOpsDisplaySlotId
): THREE.Mesh {
  const geom = new THREE.PlaneGeometry(w, h);
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  if (slotId) {
    mesh.userData = { displaySlotId: slotId, demoOnly: true };
  }
  parent.add(mesh);
  return mesh;
}

function makeCanvasTexture(
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture | null {
  if (typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined') {
    const canvas = document.createElement('canvas');
    if (canvas instanceof HTMLCanvasElement) {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawFn(ctx, width, height);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.needsUpdate = true;
      return tex;
    }
  }
  return null;
}

/**
 * Builds the custom GLB-compatible material palette for the QA & DevOps Integrated Studio
 * (Elegant Cozy Edition — strictly zero purple/magenta/lavender; uses warm oak, walnut,
 * cream upholstery, navy/charcoal, dusty teal, muted olive, and brushed brass).
 */
function createQADevOpsPalette() {
  const mat = (
    name: string,
    colorHex: number,
    roughness = 0.82,
    metalness = 0.04,
    emissiveHex = 0x000000,
    emissiveIntensity = 0.0
  ) =>
    new THREE.MeshStandardMaterial({
      name,
      color: colorHex,
      roughness,
      metalness,
      emissive: emissiveHex,
      emissiveIntensity,
      side: THREE.FrontSide,
    });

  // 1. Patterned Lounge Rug Texture (Cream, Navy, Olive, Dusty Teal, Brushed Brass)
  const rugTex = makeCanvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#F2ECE1';
    ctx.fillRect(0, 0, w, h);

    // Outer navy woven border
    ctx.strokeStyle = '#233042';
    ctx.lineWidth = 24;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    // Inner brushed-brass accent line
    ctx.strokeStyle = '#C89D54';
    ctx.lineWidth = 6;
    ctx.strokeRect(38, 38, w - 76, h - 76);

    // Second olive-green geometric frame
    ctx.strokeStyle = '#5E6F52';
    ctx.lineWidth = 10;
    ctx.strokeRect(54, 54, w - 108, h - 108);

    // Subtle woven geometric diamond & trellis motifs in dusty teal & olive
    ctx.strokeStyle = '#D9D0C1';
    ctx.lineWidth = 3;
    for (let y = 84; y < h - 84; y += 44) {
      ctx.beginPath();
      ctx.moveTo(68, y);
      ctx.lineTo(w - 68, y);
      ctx.stroke();
    }
    for (let x = 84; x < w - 84; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x, 68);
      ctx.lineTo(x, h - 68);
      ctx.stroke();
    }

    // Corner & center geometric medallions
    const drawMedallion = (cx: number, cy: number, r: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.fill();
    };
    drawMedallion(w / 2, h / 2, 72, '#233042');
    drawMedallion(w / 2, h / 2, 50, '#3E6B73');
    drawMedallion(w / 2, h / 2, 26, '#C89D54');

    const corners: Array<[number, number]> = [
      [116, 116],
      [w - 116, 116],
      [116, h - 116],
      [w - 116, h - 116],
    ];
    for (const [cx, cy] of corners) {
      drawMedallion(cx, cy, 32, '#5E6F52');
      drawMedallion(cx, cy, 16, '#F2ECE1');
    }
  });

  // 2. Display Slot 1: QA_TEST_DASHBOARD
  const qaDashboardTex = makeCanvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#16202B';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#233345';
    ctx.fillRect(0, 0, w, 44);
    ctx.fillStyle = '#E8F0F2';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('QA TEST EXECUTION & REGRESSION SUITE', 16, 28);
    ctx.fillStyle = '#C89D54';
    ctx.fillRect(w - 86, 10, 70, 24);
    ctx.fillStyle = '#141B24';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('DEMO', w - 68, 27);

    // Pass / Fail / Coverage cards
    const cards = [
      { label: 'PASSED', val: '418', color: '#3E8E6C', x: 18 },
      { label: 'REVIEW', val: '12', color: '#D49B4B', x: 180 },
      { label: 'COVERAGE', val: '96.4%', color: '#3E6B73', x: 342 },
    ];
    for (const c of cards) {
      ctx.fillStyle = '#1E2C3A';
      ctx.fillRect(c.x, 58, 150, 74);
      ctx.fillStyle = c.color;
      ctx.fillRect(c.x, 58, 6, 74);
      ctx.fillStyle = '#9FB1BD';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(c.label, c.x + 16, 80);
      ctx.fillStyle = '#F5F2EB';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(c.val, c.x + 16, 116);
    }

    // Regression progress bars
    const rows = [
      { name: 'UI Layout & Breakpoint Suite', pct: 0.96, col: '#3E8E6C', y: 156 },
      { name: 'API Contract & Schema Validation', pct: 0.92, col: '#3E6B73', y: 202 },
      { name: 'Device Compatibility Matrix', pct: 0.88, col: '#5E6F52', y: 248 },
    ];
    for (const r of rows) {
      ctx.fillStyle = '#D5E0E6';
      ctx.font = '13px sans-serif';
      ctx.fillText(r.name, 20, r.y);
      ctx.fillStyle = '#243444';
      ctx.fillRect(20, r.y + 8, w - 40, 18);
      ctx.fillStyle = r.col;
      ctx.fillRect(20, r.y + 8, (w - 40) * r.pct, 18);
    }
  });

  // 3. Display Slot 2: QA_BUG_TRACKER
  const qaBugTrackerTex = makeCanvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#18222C';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#263646';
    ctx.fillRect(0, 0, w, 42);
    ctx.fillStyle = '#F2ECE1';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('QA BUG TRACKER & VERIFICATION QUEUE', 16, 27);
    ctx.fillStyle = '#3E6B73';
    ctx.fillRect(w - 86, 9, 70, 24);
    ctx.fillStyle = '#F2ECE1';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('DEMO', w - 68, 26);

    const items = [
      { id: 'QA-204', status: 'VERIFIED', col: '#3E8E6C', title: 'Monitor front-only normal check' },
      { id: 'QA-208', status: 'VERIFIED', col: '#3E8E6C', title: 'Rug depth offset Y=0.002..0.012' },
      { id: 'QA-211', status: 'REVIEW', col: '#D49B4B', title: 'Responsive tablet touch target' },
      { id: 'QA-215', status: 'TRIAGE', col: '#C45B4B', title: 'Edge-case timeout retry banner' },
    ];
    items.forEach((it, idx) => {
      const y = 60 + idx * 60;
      ctx.fillStyle = '#21303F';
      ctx.fillRect(16, y, w - 32, 48);
      ctx.fillStyle = it.col;
      ctx.fillRect(24, y + 12, 86, 24);
      ctx.fillStyle = '#111820';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(it.status, 32, y + 29);
      ctx.fillStyle = '#C89D54';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(it.id, 124, y + 29);
      ctx.fillStyle = '#E6EEF2';
      ctx.font = '14px sans-serif';
      ctx.fillText(it.title, 192, y + 29);
    });
  });

  // 4. Display Slot 3: QA_CHECKLIST (Wall Board)
  const qaChecklistBoardTex = makeCanvasTexture(768, 512, (ctx, w, h) => {
    ctx.fillStyle = '#F3EFE6';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#233042';
    ctx.fillRect(0, 0, w, 64);
    ctx.fillStyle = '#F5F2EB';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('QA CHECKLIST & BUG REVIEW BOARD', 24, 42);
    ctx.fillStyle = '#C89D54';
    ctx.fillRect(w - 130, 14, 106, 36);
    ctx.fillStyle = '#1A2430';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('DEMO', w - 102, 38);

    const cols = [
      { title: '1. TEST CASES', status: 'PASS', col: '#3E8E6C', x: 24, y: 86 },
      { title: '2. REGRESSION', status: 'PASS', col: '#3E8E6C', x: 272, y: 86 },
      { title: '3. EDGE CASES', status: 'REVIEW', col: '#D49B4B', x: 520, y: 86 },
      { title: '4. BUG REVIEW', status: 'TRIAGED', col: '#C45B4B', x: 24, y: 292 },
      { title: '5. VERIFICATION', status: 'PASS', col: '#3E6B73', x: 272, y: 292 },
      { title: '6. RELEASE SIGN-OFF', status: 'READY', col: '#5E6F52', x: 520, y: 292 },
    ];
    for (const c of cols) {
      ctx.fillStyle = '#E6DFD1';
      ctx.fillRect(c.x, c.y, 224, 184);
      ctx.fillStyle = '#233042';
      ctx.fillRect(c.x, c.y, 224, 36);
      ctx.fillStyle = '#F5F2EB';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(c.title, c.x + 12, c.y + 24);

      ctx.fillStyle = c.col;
      ctx.fillRect(c.x + 14, c.y + 52, 92, 26);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(c.status, c.x + 24, c.y + 70);

      ctx.fillStyle = '#4A5568';
      ctx.fillRect(c.x + 14, c.y + 96, 188, 12);
      ctx.fillRect(c.x + 14, c.y + 120, 164, 12);
      ctx.fillRect(c.x + 14, c.y + 144, 140, 12);
    }
  });

  // 5. Display Slot 4: QA_DEVICE_TESTING
  const qaDeviceTestingTex = makeCanvasTexture(384, 256, (ctx, w, h) => {
    ctx.fillStyle = '#1B2834';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2C4254';
    ctx.fillRect(0, 0, w, 38);
    ctx.fillStyle = '#F2ECE1';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('DEVICE MATRIX VERIFICATION [DEMO]', 14, 24);
    ctx.fillStyle = '#3E8E6C';
    ctx.fillRect(20, 56, 160, 82);
    ctx.fillStyle = '#3E6B73';
    ctx.fillRect(200, 56, 160, 82);
    ctx.fillStyle = '#5E6F52';
    ctx.fillRect(20, 154, 340, 76);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('MOBILE VIEWPORT OK', 32, 102);
    ctx.fillText('TABLET BREAKPOINT OK', 210, 102);
    ctx.fillText('TOUCH & GESTURE CHECKLIST: 100% PASS', 36, 198);
  });

  // 6. Display Slot 5: QA_DEVOPS_REVIEW_BOARD
  const sharedReviewBoardTex = makeCanvasTexture(768, 512, (ctx, w, h) => {
    ctx.fillStyle = '#F2ECE1';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1F2B3A';
    ctx.fillRect(0, 0, w, 68);
    ctx.fillStyle = '#F5F2EB';
    ctx.font = 'bold 25px sans-serif';
    ctx.fillText('SHARED QA & DEVOPS — RELEASE READINESS REVIEW', 24, 43);
    ctx.fillStyle = '#C89D54';
    ctx.fillRect(w - 134, 16, 110, 36);
    ctx.fillStyle = '#18222E';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('DEMO', w - 104, 40);

    const stages = [
      { title: 'STAGE 1: QA SUITE', sub: '418/418 Checks', col: '#3E6B73', x: 26 },
      { title: 'STAGE 2: DEVICE LAB', sub: 'Phone + Tablet OK', col: '#5E6F52', x: 208 },
      { title: 'STAGE 3: CI/CD BUILD', sub: 'Artifact Verified', col: '#2B4C66', x: 390 },
      { title: 'STAGE 4: RELEASE GATE', sub: 'READY FOR REVIEW', col: '#3E8E6C', x: 572 },
    ];
    for (const s of stages) {
      ctx.fillStyle = '#E5DEC9';
      ctx.fillRect(s.x, 96, 168, 376);
      ctx.fillStyle = s.col;
      ctx.fillRect(s.x, 96, 168, 44);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(s.title, s.x + 12, 123);

      ctx.fillStyle = '#233042';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(s.sub, s.x + 14, 174);

      ctx.fillStyle = '#FAF7F0';
      ctx.fillRect(s.x + 14, 198, 140, 68);
      ctx.fillRect(s.x + 14, 282, 140, 68);
      ctx.fillRect(s.x + 14, 366, 140, 68);

      ctx.fillStyle = s.col;
      ctx.fillRect(s.x + 22, 212, 24, 24);
      ctx.fillRect(s.x + 22, 296, 24, 24);
      ctx.fillRect(s.x + 22, 380, 24, 24);
    }
  });

  // 7. Display Slot 6: DEVOPS_SYSTEM_STATUS (South-East Wall Board)
  const devopsOperationsBoardTex = makeCanvasTexture(768, 512, (ctx, w, h) => {
    ctx.fillStyle = '#18222E';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#243447';
    ctx.fillRect(0, 0, w, 68);
    ctx.fillStyle = '#F5F2EB';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('DEVOPS — INFRASTRUCTURE & OPERATIONS', 24, 43);
    ctx.fillStyle = '#C89D54';
    ctx.fillRect(w - 134, 16, 110, 36);
    ctx.fillStyle = '#16202B';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('DEMO', w - 104, 40);

    const panels = [
      { title: 'BUILD PIPELINE', status: 'HEALTHY', col: '#3E8E6C', x: 24, y: 92, w: 224 },
      { title: 'SERVICES MESH', status: '99.98% UP', col: '#3E6B73', x: 272, y: 92, w: 224 },
      { title: 'INFRASTRUCTURE', status: 'RACK A+B OK', col: '#5E6F52', x: 520, y: 92, w: 224 },
      { title: 'MONITORING TELEMETRY', status: 'LATENCY 14ms', col: '#3B6E8C', x: 24, y: 296, w: 348 },
      { title: 'DEPLOYMENT REVIEW', status: 'STAGING GATE', col: '#D49B4B', x: 396, y: 296, w: 348 },
    ];
    for (const p of panels) {
      ctx.fillStyle = '#212F40';
      ctx.fillRect(p.x, p.y, p.w, 180);
      ctx.strokeStyle = '#C89D54';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x, p.y, p.w, 180);
      ctx.fillStyle = '#9FB3C8';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(p.title, p.x + 16, p.y + 30);

      ctx.fillStyle = p.col;
      ctx.fillRect(p.x + 16, p.y + 46, 148, 30);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(p.status, p.x + 26, p.y + 66);

      // Telemetry bars
      ctx.fillStyle = '#2D4056';
      ctx.fillRect(p.x + 16, p.y + 98, p.w - 32, 18);
      ctx.fillStyle = p.col;
      ctx.fillRect(p.x + 16, p.y + 98, (p.w - 32) * 0.84, 18);

      ctx.fillStyle = '#2D4056';
      ctx.fillRect(p.x + 16, p.y + 130, p.w - 32, 18);
      ctx.fillStyle = '#3E8E6C';
      ctx.fillRect(p.x + 16, p.y + 130, (p.w - 32) * 0.92, 18);
    }
  });

  // 8. Display Slot 7: DEVOPS_PIPELINE_DISPLAY
  const devopsPipelineTex = makeCanvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#151E28';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#223142';
    ctx.fillRect(0, 0, w, 42);
    ctx.fillStyle = '#E8F0F5';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('DEVOPS CI/CD PIPELINE & TOPOLOGY [DEMO]', 16, 27);
    const nodes = [
      { label: 'SOURCE', x: 26, col: '#3E6B73' },
      { label: 'BUILD', x: 146, col: '#3E8E6C' },
      { label: 'QA GATE', x: 266, col: '#5E6F52' },
      { label: 'STAGING', x: 386, col: '#C89D54' },
    ];
    for (const n of nodes) {
      ctx.fillStyle = n.col;
      ctx.fillRect(n.x, 76, 100, 64);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(n.label, n.x + 16, 114);
    }
    ctx.fillStyle = '#223142';
    ctx.fillRect(26, 168, w - 52, 124);
    ctx.fillStyle = '#7CC69E';
    ctx.font = '13px monospace';
    ctx.fillText('[DEMO] pipeline_run #842: build_ok -> qa_verified -> ready', 40, 200);
    ctx.fillStyle = '#9BC2D8';
    ctx.fillText('[DEMO] cluster_nodes: 6/6 healthy | artifact sha256: verified', 40, 232);
    ctx.fillStyle = '#E2C07D';
    ctx.fillText('[DEMO] awaiting release sign-off from QA & DevOps Review Board', 40, 264);
  });

  // 9. Display Slot 8: DEVOPS_MONITORING_SCREEN
  const devopsMonitoringTex = makeCanvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = '#16202A';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#243445';
    ctx.fillRect(0, 0, w, 42);
    ctx.fillStyle = '#E8F0F5';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('SERVICE HEALTH & RESOURCE TELEMETRY [DEMO]', 16, 27);

    const gauges = [
      { label: 'CPU LOAD', val: '38%', col: '#3E8E6C', x: 22 },
      { label: 'MEMORY', val: '54%', col: '#3E6B73', x: 182 },
      { label: 'I/O BUS', val: '21%', col: '#5E6F52', x: 342 },
    ];
    for (const g of gauges) {
      ctx.fillStyle = '#202E3D';
      ctx.fillRect(g.x, 60, 146, 86);
      ctx.fillStyle = '#9FB3C8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(g.label, g.x + 16, 84);
      ctx.fillStyle = g.col;
      ctx.font = 'bold 28px monospace';
      ctx.fillText(g.val, g.x + 16, 124);
    }

    // Telemetry waveform bars
    for (let i = 0; i < 20; i++) {
      const bh = 28 + ((i * 19) % 72);
      ctx.fillStyle = i === 14 ? '#D49B4B' : '#3E6B73';
      ctx.fillRect(24 + i * 23, 288 - bh, 16, bh);
    }
  });

  // 10. Department Signage Textures (Charcoal/Navy + Brushed Brass)
  const qaSignTex = makeCanvasTexture(512, 128, (ctx, w, h) => {
    ctx.fillStyle = '#1D2733';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#C89D54';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = '#F5F2EB';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('QUALITY ASSURANCE', 68, 66);
    ctx.fillStyle = '#C89D54';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('TEST EXECUTION · DEVICE LAB · VERIFICATION', 56, 100);
  });

  const devopsSignTex = makeCanvasTexture(512, 128, (ctx, w, h) => {
    ctx.fillStyle = '#1B2430';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#C89D54';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = '#F5F2EB';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('DEVOPS & AI ENGINE', 74, 66);
    ctx.fillStyle = '#8FB8C8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('INFRASTRUCTURE · CI/CD · TELEMETRY [DEMO]', 54, 100);
  });

  const screenMat = (name: string, tex: THREE.CanvasTexture | null, fallbackHex = 0x1b2836) =>
    new THREE.MeshStandardMaterial({
      name,
      color: tex ? 0xffffff : fallbackHex,
      map: tex,
      roughness: 0.35,
      metalness: 0.05,
      emissive: tex ? 0xffffff : fallbackHex,
      emissiveMap: tex,
      emissiveIntensity: 0.22,
      side: THREE.FrontSide,
    });

  return {
    creamWall: mat('Mat_QADevOps_Cream_Wall', 0xf1ece1, 0.88, 0.02),
    wainscotCream: mat('Mat_QADevOps_Wainscot_Panel', 0xe6dfd1, 0.85, 0.03),
    warmOak: mat('Mat_QADevOps_Warm_Oak', 0xc89662, 0.72, 0.05),
    richWalnut: mat('Mat_QADevOps_Rich_Walnut', 0x5c3e28, 0.74, 0.06),
    darkWalnut: mat('Mat_QADevOps_Dark_Walnut', 0x3f2a1b, 0.76, 0.06),
    charcoalMetal: mat('Mat_QADevOps_Charcoal_Metal', 0x222933, 0.52, 0.35),
    navyPanel: mat('Mat_QADevOps_Navy_Panel', 0x1f2d3d, 0.64, 0.15),
    brushedBrass: mat('Mat_QADevOps_Brushed_Brass', 0xc89d54, 0.38, 0.68),
    creamUpholstery: mat('Mat_QADevOps_Cream_Upholstery', 0xf3eee4, 0.88, 0.02),
    creamCushionSoft: mat('Mat_QADevOps_Cream_Cushion_Soft', 0xebe4d6, 0.9, 0.02),
    knittedThrowOat: mat('Mat_QADevOps_Knitted_Throw_Oat', 0xded4c1, 0.92, 0.01),
    dustyTeal: mat('Mat_QADevOps_Dusty_Teal', 0x3e6b73, 0.78, 0.05),
    mutedOlive: mat('Mat_QADevOps_Muted_Olive', 0x5e6f52, 0.8, 0.04),
    slateBlueFabric: mat('Mat_QADevOps_Slate_Blue_Fabric', 0x2c3e50, 0.82, 0.04),
    parchmentPaper: mat('Mat_QADevOps_Parchment_Paper', 0xf7f4ec, 0.9, 0.01),
    terracottaPot: mat('Mat_QADevOps_Terracotta_Pot', 0xb86b4b, 0.8, 0.04),
    ceramicCreamPot: mat('Mat_QADevOps_Ceramic_Cream_Pot', 0xede7dc, 0.65, 0.06),
    foliageDeep: mat('Mat_QADevOps_Foliage_Deep', 0x35583c, 0.84, 0.02),
    foliageSage: mat('Mat_QADevOps_Foliage_Sage', 0x587d56, 0.84, 0.02),
    foliageBright: mat('Mat_QADevOps_Foliage_Bright', 0x729968, 0.84, 0.02),
    statusGreenLed: mat('Mat_QADevOps_Status_Green_LED', 0x34d399, 0.3, 0.1, 0x10b981, 0.55),
    statusCyanLed: mat('Mat_QADevOps_Status_Cyan_LED', 0x38bdf8, 0.3, 0.1, 0x0ea5e9, 0.5),
    statusAmberLed: mat('Mat_QADevOps_Status_Amber_LED', 0xfbbf24, 0.3, 0.1, 0xd97706, 0.5),
    statusRedPin: mat('Mat_QADevOps_Status_Red_Pin', 0xd9534f, 0.5, 0.08),
    warmLampShade: mat('Mat_QADevOps_Warm_Lamp_Shade', 0xfdf3d7, 0.45, 0.05, 0xf6c97a, 0.38),
    daylightGlass: mat('Mat_QADevOps_Daylight_Glass', 0xdbeafe, 0.25, 0.08, 0xbfd9f2, 0.18),
    loungeRugMat: new THREE.MeshStandardMaterial({
      name: 'Mat_QADevOps_Patterned_Lounge_Rug',
      color: rugTex ? 0xffffff : 0xf2ece1,
      map: rugTex,
      roughness: 0.9,
      metalness: 0.01,
      side: THREE.FrontSide,
    }),
    qaDashboardScreenMat: screenMat('Mat_Slot_QA_TEST_DASHBOARD', qaDashboardTex),
    qaBugTrackerScreenMat: screenMat('Mat_Slot_QA_BUG_TRACKER', qaBugTrackerTex),
    qaChecklistBoardMat: screenMat('Mat_Slot_QA_CHECKLIST', qaChecklistBoardTex),
    qaDeviceTestingScreenMat: screenMat('Mat_Slot_QA_DEVICE_TESTING', qaDeviceTestingTex),
    sharedReviewBoardMat: screenMat('Mat_Slot_QA_DEVOPS_REVIEW_BOARD', sharedReviewBoardTex),
    devopsOperationsBoardMat: screenMat('Mat_Slot_DEVOPS_SYSTEM_STATUS', devopsOperationsBoardTex),
    devopsPipelineScreenMat: screenMat('Mat_Slot_DEVOPS_PIPELINE_DISPLAY', devopsPipelineTex),
    devopsMonitoringScreenMat: screenMat('Mat_Slot_DEVOPS_MONITORING_SCREEN', devopsMonitoringTex),
    qaSignMat: screenMat('Mat_QADevOps_QA_Sign', qaSignTex),
    devopsSignMat: screenMat('Mat_QADevOps_DevOps_Sign', devopsSignTex),
  };
}

/**
 * Helper to build a potted voxel plant with non-overlapping stepped foliage layers.
 */
function buildCozyPlant(
  parent: THREE.Object3D,
  namePrefix: string,
  x: number,
  y: number,
  z: number,
  scale: number,
  pal: ReturnType<typeof createQADevOpsPalette>,
  useCeramic = false
): THREE.Group {
  const grp = new THREE.Group();
  grp.name = `${namePrefix}_Group`;
  grp.position.set(x, y, z);
  parent.add(grp);

  const potMat = useCeramic ? pal.ceramicCreamPot : pal.terracottaPot;
  const potW = 0.32 * scale;
  const potH = 0.32 * scale;
  addBox(grp, `${namePrefix}_Pot`, potW, potH, potW, 0, potH / 2, 0, potMat);
  addBox(
    grp,
    `${namePrefix}_Pot_Rim`,
    potW * 1.1,
    0.045 * scale,
    potW * 1.1,
    0,
    potH + 0.0225 * scale,
    0,
    potMat
  );
  addBox(
    grp,
    `${namePrefix}_Foliage_Base`,
    0.4 * scale,
    0.2 * scale,
    0.4 * scale,
    0,
    potH + 0.145 * scale,
    0,
    pal.foliageDeep
  );
  addBox(
    grp,
    `${namePrefix}_Foliage_Mid`,
    0.32 * scale,
    0.2 * scale,
    0.32 * scale,
    0.02 * scale,
    potH + 0.345 * scale,
    -0.02 * scale,
    pal.foliageSage
  );
  addBox(
    grp,
    `${namePrefix}_Foliage_Crown`,
    0.22 * scale,
    0.16 * scale,
    0.22 * scale,
    -0.02 * scale,
    potH + 0.525 * scale,
    0.02 * scale,
    pal.foliageBright
  );
  return grp;
}

/**
 * Helper to build a hanging planter with cascading voxel foliage.
 */
function buildHangingPlanter(
  parent: THREE.Object3D,
  namePrefix: string,
  x: number,
  y: number,
  z: number,
  pal: ReturnType<typeof createQADevOpsPalette>
): THREE.Group {
  const grp = new THREE.Group();
  grp.name = `${namePrefix}_Group`;
  grp.position.set(x, y, z);
  parent.add(grp);

  addBox(grp, `${namePrefix}_Ceiling_Bracket`, 0.08, 0.04, 0.08, 0, 0.36, 0, pal.brushedBrass);
  addBox(grp, `${namePrefix}_Hanger_Rod`, 0.025, 0.32, 0.025, 0, 0.18, 0, pal.brushedBrass);
  addBox(grp, `${namePrefix}_Bowl`, 0.28, 0.16, 0.28, 0, 0, 0, pal.ceramicCreamPot);
  addBox(grp, `${namePrefix}_Canopy`, 0.34, 0.12, 0.34, 0, 0.14, 0, pal.foliageDeep);
  addBox(grp, `${namePrefix}_Vine_A`, 0.08, 0.28, 0.08, -0.1, -0.14, 0.08, pal.foliageSage);
  addBox(grp, `${namePrefix}_Vine_B`, 0.08, 0.36, 0.08, 0.09, -0.18, -0.08, pal.foliageBright);
  return grp;
}

/**
 * Helper to build an ergonomic charcoal & walnut office chair facing North (+Z) by default.
 */
function buildErgonomicTaskChair(
  parent: THREE.Object3D,
  namePrefix: string,
  x: number,
  z: number,
  rotY: number,
  cushionMat: THREE.Material,
  pal: ReturnType<typeof createQADevOpsPalette>
): THREE.Group {
  const grp = new THREE.Group();
  grp.name = namePrefix;
  grp.position.set(x, 0, z);
  grp.rotation.y = rotY;
  parent.add(grp);

  addBox(grp, `${namePrefix}_Base_Cross_X`, 0.52, 0.04, 0.08, 0, 0.05, 0, pal.charcoalMetal);
  addBox(grp, `${namePrefix}_Base_Cross_Z`, 0.08, 0.04, 0.52, 0, 0.05, 0, pal.charcoalMetal);
  addBox(grp, `${namePrefix}_Pneumatic_Cylinder`, 0.08, 0.34, 0.08, 0, 0.24, 0, pal.charcoalMetal);
  addBox(grp, `${namePrefix}_Seat_Pan`, 0.52, 0.07, 0.5, 0, 0.445, 0, pal.charcoalMetal);
  addBox(grp, `${namePrefix}_Seat_Cushion`, 0.48, 0.05, 0.46, 0, 0.505, 0.01, cushionMat);
  // Backrest at South (-Z) side of seat so chair faces North (+Z)
  addBox(grp, `${namePrefix}_Backrest_Spine`, 0.1, 0.46, 0.05, 0, 0.72, -0.24, pal.charcoalMetal);
  addBox(grp, `${namePrefix}_Backrest_Shell`, 0.46, 0.44, 0.06, 0, 0.78, -0.2, pal.charcoalMetal);
  addBox(grp, `${namePrefix}_Lumbar_Pillow`, 0.38, 0.16, 0.04, 0, 0.68, -0.15, cushionMat);
  addBox(grp, `${namePrefix}_Armrest_Left`, 0.06, 0.2, 0.32, -0.26, 0.58, -0.02, pal.richWalnut);
  addBox(grp, `${namePrefix}_Armrest_Right`, 0.06, 0.2, 0.32, 0.26, 0.58, -0.02, pal.richWalnut);

  return grp;
}

/**
 * Builds the complete 8×16 QA & DevOps Integrated Studio (`ROOM_QA_DEVOPS_ROOT`)
 * at local `[0, 0, 0]` (`X = 0..8, Z = 0..16, Y = 0..3.2`).
 */
export function buildQADevOpsRoomComplete(
  matLib: MaterialLibraryInstance
): BuiltQADevOpsRoomResult {
  const { materials } = matLib;
  const pal = createQADevOpsPalette();

  const roomRoot = new THREE.Group();
  roomRoot.name = QA_DEVOPS_MODULE_CONSTANTS.ROOT_NODE_NAME; // 'ROOM_QA_DEVOPS_ROOT'
  roomRoot.position.set(0, 0, 0);

  const groups = {} as Record<
    (typeof QA_DEVOPS_MODULE_CONSTANTS.REQUIRED_GROUPS)[number],
    THREE.Group
  >;
  for (const grpName of QA_DEVOPS_MODULE_CONSTANTS.REQUIRED_GROUPS) {
    const grp = new THREE.Group();
    grp.name = grpName;
    roomRoot.add(grp);
    groups[grpName] = grp;
  }

  const furnitureSubgroups = {} as Record<
    (typeof QA_DEVOPS_MODULE_CONSTANTS.SEMANTIC_FURNITURE_SUBGROUPS)[number],
    THREE.Group
  >;
  for (const subName of QA_DEVOPS_MODULE_CONSTANTS.SEMANTIC_FURNITURE_SUBGROUPS) {
    const sub = new THREE.Group();
    sub.name = subName;
    groups.FURNITURE.add(sub);
    furnitureSubgroups[subName] = sub;
  }

  const propsSubgroups = {} as Record<
    (typeof QA_DEVOPS_MODULE_CONSTANTS.SEMANTIC_PROPS_SUBGROUPS)[number],
    THREE.Group
  >;
  for (const subName of QA_DEVOPS_MODULE_CONSTANTS.SEMANTIC_PROPS_SUBGROUPS) {
    const sub = new THREE.Group();
    sub.name = subName;
    groups.PROPS.add(sub);
    propsSubgroups[subName] = sub;
  }

  const decorationSubgroups = {} as Record<
    (typeof QA_DEVOPS_MODULE_CONSTANTS.SEMANTIC_DECORATION_SUBGROUPS)[number],
    THREE.Group
  >;
  for (const subName of QA_DEVOPS_MODULE_CONSTANTS.SEMANTIC_DECORATION_SUBGROUPS) {
    const sub = new THREE.Group();
    sub.name = subName;
    groups.DECORATION.add(sub);
    decorationSubgroups[subName] = sub;
  }

  const northWallNodes: THREE.Object3D[] = [];
  const southWallNodes: THREE.Object3D[] = [];
  const eastWallNodes: THREE.Object3D[] = [];
  const westWallNodes: THREE.Object3D[] = [];
  const furnitureNodes = new Map<string, THREE.Object3D>();
  const catalogNodeMap = new Map<string, THREE.Object3D>();
  const displaySlotNodes = new Map<QADevOpsDisplaySlotId, THREE.Mesh>();

  const registerCatalogItem = (id: string, node: THREE.Object3D) => {
    node.userData = { ...node.userData, catalogId: id };
    furnitureNodes.set(id, node);
    catalogNodeMap.set(id, node);
  };

  // =========================================================================
  // 1. CONTINUOUS 8×16 FLOOR & STRUCTURE (Zero Seam / Zero Wall at Z=8)
  // =========================================================================
  const continuousOakFloor = addBox(
    groups.FLOOR,
    'QADevOps_Continuous_Oak_Floor_Surface',
    7.68,
    0.04,
    15.68,
    4.0,
    -0.02,
    8.0,
    materials.oakFloor,
    false,
    true,
    { isFloor: true }
  );
  void continuousOakFloor;

  const structuralSubbase = addBox(
    groups.STRUCTURE,
    'QADevOps_Continuous_Structural_Subbase',
    7.92,
    0.118,
    15.92,
    4.0,
    -0.101,
    8.0,
    materials.floorSubbase,
    false,
    true
  );
  // Perimeter plinth strips (non-overlapping with floor or doorways)
  const plinthEast = addBox(
    groups.STRUCTURE,
    'QADevOps_Plinth_Strip_East',
    0.08,
    0.04,
    15.84,
    7.92,
    -0.02,
    8.0,
    materials.floorSubbase
  );
  const plinthSouth = addBox(
    groups.STRUCTURE,
    'QADevOps_Plinth_Strip_South',
    7.76,
    0.04,
    0.08,
    4.0,
    -0.02,
    0.06,
    materials.floorSubbase
  );
  const plinthWestS = addBox(
    groups.STRUCTURE,
    'QADevOps_Plinth_Strip_West_South',
    0.08,
    0.04,
    6.84,
    0.08,
    -0.02,
    3.5,
    materials.floorSubbase
  );
  const plinthWestN = addBox(
    groups.STRUCTURE,
    'QADevOps_Plinth_Strip_West_North',
    0.08,
    0.04,
    6.84,
    0.08,
    -0.02,
    12.5,
    materials.floorSubbase
  );
  const plinthNorthW = addBox(
    groups.STRUCTURE,
    'QADevOps_Plinth_Strip_North_West',
    2.84,
    0.04,
    0.08,
    1.5,
    -0.02,
    15.94,
    materials.floorSubbase
  );
  const plinthNorthE = addBox(
    groups.STRUCTURE,
    'QADevOps_Plinth_Strip_North_East',
    2.84,
    0.04,
    0.08,
    6.5,
    -0.02,
    15.94,
    materials.floorSubbase
  );
  void structuralSubbase;
  void plinthEast;
  void plinthSouth;
  void plinthWestS;
  void plinthWestN;
  void plinthNorthW;
  void plinthNorthE;

  // =========================================================================
  // 2. UNIFIED 8×16 PERIMETER WALLS, WINDOWS & CONNECTORS
  // =========================================================================
  // --- NORTH WALL (Z = 15.84, faces Shared Corridor; doorway at X = 3.0..5.0; NO exterior windows) ---
  const northWallWest = addBox(
    groups.WALLS,
    'QADevOps_Wall_North_West_Segment',
    2.92,
    3.12,
    0.14,
    1.54,
    1.56,
    15.84,
    pal.creamWall
  );
  const northWallHeader = addBox(
    groups.WALLS,
    'QADevOps_Wall_North_Door_Header',
    2.0,
    0.82,
    0.14,
    4.0,
    2.71,
    15.84,
    pal.creamWall
  );
  const northWallEast = addBox(
    groups.WALLS,
    'QADevOps_Wall_North_East_Segment',
    2.92,
    3.12,
    0.14,
    6.46,
    1.56,
    15.84,
    pal.creamWall
  );
  const northWallCap = addBox(
    groups.WALLS,
    'QADevOps_Wall_North_TopCap',
    7.88,
    0.08,
    0.18,
    4.0,
    3.16,
    15.84,
    materials.wallCapDark
  );
  const northBaseboardW = addBox(
    groups.WALLS,
    'QADevOps_Wall_North_Baseboard_W',
    2.76,
    0.1,
    0.03,
    1.58,
    0.05,
    15.75,
    pal.darkWalnut
  );
  const northBaseboardE = addBox(
    groups.WALLS,
    'QADevOps_Wall_North_Baseboard_E',
    2.76,
    0.1,
    0.03,
    6.42,
    0.05,
    15.75,
    pal.darkWalnut
  );
  northWallNodes.push(
    northWallWest,
    northWallHeader,
    northWallEast,
    northWallCap,
    northBaseboardW,
    northBaseboardE
  );

  // --- SOUTH EXTERIOR WALL (Z = 0.16; Window at X = 1.2..3.6, Solid DevOps bay at X = 3.6..7.9) ---
  const southWallWestPillar = addBox(
    groups.WALLS,
    'QADevOps_Wall_South_West_Pillar',
    1.12,
    3.12,
    0.14,
    0.64,
    1.56,
    0.16,
    pal.creamWall
  );
  const southWallWindowSill = addBox(
    groups.WALLS,
    'QADevOps_Wall_South_Window_Lower_Sill',
    2.4,
    0.88,
    0.14,
    2.4,
    0.44,
    0.16,
    pal.creamWall
  );
  const southWallWindowHeader = addBox(
    groups.WALLS,
    'QADevOps_Wall_South_Window_Header',
    2.4,
    0.66,
    0.14,
    2.4,
    2.79,
    0.16,
    pal.creamWall
  );
  const southWallEastBay = addBox(
    groups.WALLS,
    'QADevOps_Wall_South_East_DevOps_Segment',
    4.32,
    3.12,
    0.14,
    5.76,
    1.56,
    0.16,
    pal.creamWall
  );
  const southWallCap = addBox(
    groups.WALLS,
    'QADevOps_Wall_South_TopCap',
    7.88,
    0.08,
    0.18,
    4.0,
    3.16,
    0.16,
    materials.wallCapDark
  );
  const southBaseboard = addBox(
    groups.WALLS,
    'QADevOps_Wall_South_Baseboard',
    7.64,
    0.1,
    0.03,
    4.0,
    0.05,
    0.25,
    pal.darkWalnut
  );
  southWallNodes.push(
    southWallWestPillar,
    southWallWindowSill,
    southWallWindowHeader,
    southWallEastBay,
    southWallCap,
    southBaseboard
  );

  // South Exterior Daylight Window (X = 1.2..3.6, Y = 0.88..2.46)
  const southWinGrp = new THREE.Group();
  southWinGrp.name = 'QADevOps_Window_South_Daylight';
  southWinGrp.position.set(2.4, 1.67, 0.16);
  groups.WINDOWS.add(southWinGrp);
  addBox(southWinGrp, 'South_Win_Frame_Top', 2.44, 0.08, 0.18, 0, 0.77, 0, pal.darkWalnut);
  addBox(southWinGrp, 'South_Win_Frame_Bot', 2.44, 0.08, 0.22, 0, -0.77, 0.02, pal.warmOak);
  addBox(southWinGrp, 'South_Win_Frame_L', 0.08, 1.58, 0.18, -1.18, 0, 0, pal.darkWalnut);
  addBox(southWinGrp, 'South_Win_Frame_R', 0.08, 1.58, 0.18, 1.18, 0, 0, pal.darkWalnut);
  addBox(southWinGrp, 'South_Win_Mullion_V', 0.05, 1.46, 0.16, 0, 0, 0, pal.darkWalnut);
  addBox(southWinGrp, 'South_Win_Mullion_H', 2.3, 0.05, 0.16, 0, 0.12, 0, pal.darkWalnut);
  addBox(
    southWinGrp,
    'South_Win_Glass_Pane',
    2.26,
    1.44,
    0.04,
    0,
    0,
    0,
    pal.daylightGlass,
    false,
    false
  );
  southWallNodes.push(southWinGrp);

  // --- WEST WALL (X = 0.16, faces Central Hub; Primary Doorway at Z = 7.0..9.0; NO exterior windows) ---
  const westWallSouth = addBox(
    groups.WALLS,
    'QADevOps_Wall_West_South_Segment',
    0.14,
    3.12,
    6.84,
    0.16,
    1.56,
    3.58,
    pal.creamWall
  );
  const westWallDoorHeader = addBox(
    groups.WALLS,
    'QADevOps_Wall_West_Door_Header',
    0.14,
    0.82,
    2.0,
    0.16,
    2.71,
    8.0,
    pal.creamWall
  );
  const westWallNorth = addBox(
    groups.WALLS,
    'QADevOps_Wall_West_North_Segment',
    0.14,
    3.12,
    6.84,
    0.16,
    1.56,
    12.42,
    pal.creamWall
  );
  const westWallCap = addBox(
    groups.WALLS,
    'QADevOps_Wall_West_TopCap',
    0.18,
    0.08,
    15.84,
    0.16,
    3.16,
    8.0,
    materials.wallCapDark
  );
  const westBaseboardS = addBox(
    groups.WALLS,
    'QADevOps_Wall_West_Baseboard_S',
    0.03,
    0.1,
    6.6,
    0.25,
    0.05,
    3.55,
    pal.darkWalnut
  );
  const westBaseboardN = addBox(
    groups.WALLS,
    'QADevOps_Wall_West_Baseboard_N',
    0.03,
    0.1,
    6.6,
    0.25,
    0.05,
    12.45,
    pal.darkWalnut
  );
  const westChairRailS = addBox(
    groups.WALLS,
    'QADevOps_Wall_West_Chair_Rail_S',
    0.035,
    0.045,
    6.5,
    0.252,
    0.88,
    3.55,
    pal.richWalnut
  );
  const westChairRailN = addBox(
    groups.WALLS,
    'QADevOps_Wall_West_Chair_Rail_N',
    0.035,
    0.045,
    6.5,
    0.252,
    0.88,
    12.45,
    pal.richWalnut
  );
  westWallNodes.push(
    westWallSouth,
    westWallDoorHeader,
    westWallNorth,
    westWallCap,
    westBaseboardS,
    westBaseboardN,
    westChairRailS,
    westChairRailN
  );

  // --- EAST EXTERIOR WALL (X = 7.84; DevOps solid bay Z=0.16..6.20, Lounge Window Z=6.20..9.80, Mid Pillar Z=9.80..12.40, QA Window Z=12.40..14.90, North Pillar Z=14.90..15.84) ---
  const eastWallSouthDevOps = addBox(
    groups.WALLS,
    'QADevOps_Wall_East_South_DevOps_Segment',
    0.14,
    3.12,
    6.04,
    7.84,
    1.56,
    3.18,
    pal.creamWall
  );
  const eastWallLoungeSill = addBox(
    groups.WALLS,
    'QADevOps_Wall_East_Lounge_Window_Sill',
    0.14,
    0.86,
    3.6,
    7.84,
    0.43,
    8.0,
    pal.creamWall
  );
  const eastWallLoungeHeader = addBox(
    groups.WALLS,
    'QADevOps_Wall_East_Lounge_Window_Header',
    0.14,
    0.66,
    3.6,
    7.84,
    2.79,
    8.0,
    pal.creamWall
  );
  const eastWallMidPillar = addBox(
    groups.WALLS,
    'QADevOps_Wall_East_Mid_Pillar',
    0.14,
    3.12,
    2.6,
    7.84,
    1.56,
    11.1,
    pal.creamWall
  );
  const eastWallQASill = addBox(
    groups.WALLS,
    'QADevOps_Wall_East_QA_Window_Sill',
    0.14,
    0.88,
    2.5,
    7.84,
    0.44,
    13.65,
    pal.creamWall
  );
  const eastWallQAHeader = addBox(
    groups.WALLS,
    'QADevOps_Wall_East_QA_Window_Header',
    0.14,
    0.66,
    2.5,
    7.84,
    2.79,
    13.65,
    pal.creamWall
  );
  const eastWallNorthPillar = addBox(
    groups.WALLS,
    'QADevOps_Wall_East_North_Pillar',
    0.14,
    3.12,
    0.94,
    7.84,
    1.56,
    15.37,
    pal.creamWall
  );
  const eastWallCap = addBox(
    groups.WALLS,
    'QADevOps_Wall_East_TopCap',
    0.18,
    0.08,
    15.84,
    7.84,
    3.16,
    8.0,
    materials.wallCapDark
  );
  const eastBaseboard = addBox(
    groups.WALLS,
    'QADevOps_Wall_East_Baseboard',
    0.03,
    0.1,
    15.48,
    7.75,
    0.05,
    8.0,
    pal.darkWalnut
  );
  eastWallNodes.push(
    eastWallSouthDevOps,
    eastWallLoungeSill,
    eastWallLoungeHeader,
    eastWallMidPillar,
    eastWallQASill,
    eastWallQAHeader,
    eastWallNorthPillar,
    eastWallCap,
    eastBaseboard
  );

  // East Panoramic Lounge Window (Z = 6.20..9.80, Y = 0.86..2.46)
  const eastLoungeWin = new THREE.Group();
  eastLoungeWin.name = 'QADevOps_Window_East_Panoramic_Lounge';
  eastLoungeWin.position.set(7.84, 1.66, 8.0);
  groups.WINDOWS.add(eastLoungeWin);
  addBox(eastLoungeWin, 'East_Lounge_Win_Top', 0.18, 0.08, 3.64, 0, 0.78, 0, pal.darkWalnut);
  addBox(eastLoungeWin, 'East_Lounge_Win_Bot', 0.22, 0.08, 3.64, -0.02, -0.78, 0, pal.warmOak);
  addBox(eastLoungeWin, 'East_Lounge_Win_S', 0.18, 1.6, 0.08, 0, 0, -1.78, pal.darkWalnut);
  addBox(eastLoungeWin, 'East_Lounge_Win_N', 0.18, 1.6, 0.08, 0, 0, 1.78, pal.darkWalnut);
  addBox(eastLoungeWin, 'East_Lounge_Mullion_1', 0.16, 1.48, 0.05, 0, 0, -0.6, pal.darkWalnut);
  addBox(eastLoungeWin, 'East_Lounge_Mullion_2', 0.16, 1.48, 0.05, 0, 0, 0.6, pal.darkWalnut);
  addBox(eastLoungeWin, 'East_Lounge_Mullion_H', 0.16, 0.05, 3.48, 0, 0.14, 0, pal.darkWalnut);
  addBox(
    eastLoungeWin,
    'East_Lounge_Glass_Pane',
    0.04,
    1.46,
    3.44,
    0,
    0,
    0,
    pal.daylightGlass,
    false,
    false
  );
  eastWallNodes.push(eastLoungeWin);

  // East QA Study Window (Z = 12.40..14.90, Y = 0.88..2.46)
  const eastQAWin = new THREE.Group();
  eastQAWin.name = 'QADevOps_Window_East_QA_Daylight';
  eastQAWin.position.set(7.84, 1.67, 13.65);
  groups.WINDOWS.add(eastQAWin);
  addBox(eastQAWin, 'East_QA_Win_Top', 0.18, 0.08, 2.54, 0, 0.77, 0, pal.darkWalnut);
  addBox(eastQAWin, 'East_QA_Win_Bot', 0.22, 0.08, 2.54, -0.02, -0.77, 0, pal.warmOak);
  addBox(eastQAWin, 'East_QA_Win_S', 0.18, 1.58, 0.08, 0, 0, -1.23, pal.darkWalnut);
  addBox(eastQAWin, 'East_QA_Win_N', 0.18, 1.58, 0.08, 0, 0, 1.23, pal.darkWalnut);
  addBox(eastQAWin, 'East_QA_Mullion_V', 0.16, 1.46, 0.05, 0, 0, 0, pal.darkWalnut);
  addBox(eastQAWin, 'East_QA_Mullion_H', 0.16, 0.05, 2.38, 0, 0.14, 0, pal.darkWalnut);
  addBox(
    eastQAWin,
    'East_QA_Glass_Pane',
    0.04,
    1.44,
    2.36,
    0,
    0,
    0,
    pal.daylightGlass,
    false,
    false
  );
  eastWallNodes.push(eastQAWin);

  // --- CONNECTORS (West Hub Doorway at [0, 0, 8] & North Corridor Doorway at [4, 0, 16]) ---
  const westConnGrp = new THREE.Group();
  westConnGrp.name = QA_DEVOPS_CONNECTORS_SPEC.QA_DEVOPS_WEST_MAIN.removable_node_name;
  westConnGrp.position.set(0.16, 0, 8.0);
  groups.CONNECTORS.add(westConnGrp);
  addBox(westConnGrp, 'West_Door_Jamb_South', 0.18, 2.3, 0.08, 0, 1.15, -0.98, pal.darkWalnut);
  addBox(westConnGrp, 'West_Door_Jamb_North', 0.18, 2.3, 0.08, 0, 1.15, 0.98, pal.darkWalnut);
  addBox(westConnGrp, 'West_Door_Lintels', 0.2, 0.08, 2.08, 0, 2.28, 0, pal.brushedBrass);
  addBox(
    westConnGrp,
    'West_Door_Threshold_Brass',
    0.16,
    0.016,
    1.9,
    0,
    0.008,
    0,
    pal.brushedBrass
  );
  westWallNodes.push(westConnGrp);

  const northConnGrp = new THREE.Group();
  northConnGrp.name = QA_DEVOPS_CONNECTORS_SPEC.QA_DEVOPS_NORTH_CORRIDOR.removable_node_name;
  northConnGrp.position.set(4.0, 0, 15.84);
  groups.CONNECTORS.add(northConnGrp);
  addBox(northConnGrp, 'North_Door_Jamb_West', 0.08, 2.3, 0.18, -0.98, 1.15, 0, pal.darkWalnut);
  addBox(northConnGrp, 'North_Door_Jamb_East', 0.08, 2.3, 0.18, 0.98, 1.15, 0, pal.darkWalnut);
  addBox(northConnGrp, 'North_Door_Lintel', 2.08, 0.08, 0.2, 0, 2.28, 0, pal.brushedBrass);
  addBox(
    northConnGrp,
    'North_Door_Threshold_Brass',
    1.9,
    0.016,
    0.16,
    0,
    0.008,
    0,
    pal.brushedBrass
  );
  northWallNodes.push(northConnGrp);

  // =========================================================================
  // 3. ZONE A — NORTH QA FUNCTIONAL AREA (Z ≈ 10.6..16.0)
  // =========================================================================
  // 3.1 QA Primary Workstation Desk (`qa_workstation_desk` at [5.65, 0, 13.85])
  const qaDeskGrp = new THREE.Group();
  qaDeskGrp.name = 'QA_Workstation_Desk';
  qaDeskGrp.position.set(5.65, 0, 13.85);
  furnitureSubgroups.QA_WORKSTATION.add(qaDeskGrp);
  registerCatalogItem('qa_workstation_desk', qaDeskGrp);

  // Oak desktop + dark supporting frame + walnut drawer pedestal
  addBox(qaDeskGrp, 'QA_Desk_Oak_Top', 2.05, 0.055, 0.88, 0, 0.732, 0, pal.warmOak);
  addBox(qaDeskGrp, 'QA_Desk_Brass_Front_Trim', 2.05, 0.018, 0.016, 0, 0.72, -0.442, pal.brushedBrass);
  addBox(qaDeskGrp, 'QA_Desk_Leg_West_Front', 0.06, 0.7, 0.06, -0.94, 0.35, -0.36, pal.charcoalMetal);
  addBox(qaDeskGrp, 'QA_Desk_Leg_West_Back', 0.06, 0.7, 0.06, -0.94, 0.35, 0.36, pal.charcoalMetal);
  addBox(qaDeskGrp, 'QA_Desk_West_Stretcher', 0.05, 0.05, 0.66, -0.94, 0.14, 0, pal.charcoalMetal);
  addBox(qaDeskGrp, 'QA_Desk_Modesty_Panel', 1.82, 0.34, 0.03, 0, 0.52, 0.34, pal.richWalnut);

  // Right-side Walnut Drawer Pedestal (non-coplanar stepped drawer faces)
  addBox(qaDeskGrp, 'QA_Desk_Drawer_Pedestal', 0.52, 0.68, 0.76, 0.7, 0.34, 0, pal.richWalnut);
  for (let dIdx = 0; dIdx < 3; dIdx++) {
    const dy = 0.16 + dIdx * 0.2;
    addBox(
      qaDeskGrp,
      `QA_Desk_Drawer_Face_${dIdx + 1}`,
      0.46,
      0.16,
      0.02,
      0.7,
      dy,
      -0.39,
      pal.warmOak
    );
    addBox(
      qaDeskGrp,
      `QA_Desk_Drawer_Pull_${dIdx + 1}`,
      0.14,
      0.022,
      0.024,
      0.7,
      dy,
      -0.412,
      pal.brushedBrass
    );
  }
  // Under-desk QA Test Runner Tower (Left side)
  addBox(qaDeskGrp, 'QA_Test_Runner_Tower_Case', 0.24, 0.48, 0.46, -0.68, 0.24, 0.06, pal.charcoalMetal);
  addBox(qaDeskGrp, 'QA_Test_Runner_LED', 0.12, 0.02, 0.015, -0.68, 0.42, -0.175, pal.statusGreenLed);

  // Desk Mat, Keyboard, Mouse, Documentation Tray, Test Notes, Coffee Mug, Brass Task Lamp
  addBox(qaDeskGrp, 'QA_Desk_Mat', 0.92, 0.008, 0.42, -0.12, 0.764, -0.14, pal.navyPanel);
  addBox(qaDeskGrp, 'QA_Keyboard_Body', 0.38, 0.022, 0.14, -0.16, 0.779, -0.16, pal.charcoalMetal);
  addBox(qaDeskGrp, 'QA_Keyboard_Keys', 0.35, 0.01, 0.11, -0.16, 0.794, -0.16, pal.creamWall);
  addBox(qaDeskGrp, 'QA_Mouse', 0.07, 0.024, 0.11, 0.14, 0.779, -0.16, pal.charcoalMetal);
  addBox(qaDeskGrp, 'QA_Doc_Tray_Base', 0.32, 0.04, 0.24, 0.68, 0.78, 0.14, pal.darkWalnut);
  addBox(qaDeskGrp, 'QA_Doc_Tray_Sheets', 0.26, 0.025, 0.2, 0.68, 0.812, 0.14, pal.parchmentPaper);
  addBox(qaDeskGrp, 'QA_Test_Note_Pad', 0.18, 0.014, 0.22, -0.56, 0.768, -0.14, pal.parchmentPaper);
  addBox(qaDeskGrp, 'QA_Coffee_Mug', 0.075, 0.095, 0.075, 0.42, 0.808, -0.22, pal.dustyTeal);

  // QA Desk Brass Task Lamp
  addBox(qaDeskGrp, 'QA_Desk_Lamp_Base', 0.16, 0.03, 0.16, -0.78, 0.775, 0.22, pal.brushedBrass);
  addBox(qaDeskGrp, 'QA_Desk_Lamp_Stem', 0.03, 0.36, 0.03, -0.78, 0.96, 0.22, pal.brushedBrass);
  addBox(qaDeskGrp, 'QA_Desk_Lamp_Shade', 0.2, 0.1, 0.14, -0.72, 1.14, 0.16, pal.warmLampShade);

  // PRIMARY QA DISPLAY (`QA_Main_Display_Screen` at world [5.45, 1.02, 14.08], facing South [0,0,-1] toward QA_CHAIR)
  // Local offset relative to qaDeskGrp [5.65, 0, 13.85] -> [-0.20, 1.02, 0.23]
  addBox(qaDeskGrp, 'QA_Main_Display_Stand_Base', 0.24, 0.02, 0.18, -0.2, 0.77, 0.26, pal.charcoalMetal);
  addBox(qaDeskGrp, 'QA_Main_Display_Stand_Neck', 0.06, 0.22, 0.05, -0.2, 0.88, 0.27, pal.charcoalMetal);
  addBox(
    qaDeskGrp,
    'QA_Main_Display_Rear_Casing',
    0.72,
    0.44,
    0.04,
    -0.2,
    1.02,
    0.252,
    pal.charcoalMetal
  );
  const qaMainScreen = addSingleFrontScreenPlane(
    qaDeskGrp,
    'QA_Main_Display_Screen',
    0.68,
    0.4,
    -0.2,
    1.02,
    0.23,
    Math.PI, // Normal points South [0, 0, -1] toward QA_CHAIR
    pal.qaDashboardScreenMat,
    'QA_TEST_DASHBOARD'
  );
  displaySlotNodes.set('QA_TEST_DASHBOARD', qaMainScreen);

  // SECONDARY QA DISPLAY (`QA_Secondary_Display_Screen` at world [6.12, 1.01, 14.01], angled toward QA_CHAIR)
  // Local offset relative to qaDeskGrp [5.65, 0, 13.85] -> [+0.47, 1.01, 0.16]
  const qaSecGrp = new THREE.Group();
  qaSecGrp.name = 'QA_Secondary_Display_Rig';
  qaSecGrp.position.set(0.47, 0, 0.16);
  qaSecGrp.rotation.y = 0.35; // Angled slightly West-South-West toward QA_CHAIR
  qaDeskGrp.add(qaSecGrp);
  addBox(qaSecGrp, 'QA_Secondary_Display_Stand_Base', 0.2, 0.02, 0.16, 0, 0.77, 0.03, pal.charcoalMetal);
  addBox(qaSecGrp, 'QA_Secondary_Display_Stand_Neck', 0.05, 0.21, 0.04, 0, 0.88, 0.04, pal.charcoalMetal);
  addBox(
    qaSecGrp,
    'QA_Secondary_Display_Rear_Casing',
    0.58,
    0.38,
    0.04,
    0,
    1.01,
    0.022,
    pal.charcoalMetal
  );
  const qaSecScreen = addSingleFrontScreenPlane(
    qaSecGrp,
    'QA_Secondary_Display_Screen',
    0.54,
    0.34,
    0,
    1.01,
    0,
    Math.PI,
    pal.qaBugTrackerScreenMat,
    'QA_BUG_TRACKER'
  );
  displaySlotNodes.set('QA_BUG_TRACKER', qaSecScreen);

  // 3.2 QA Ergonomic Chair (`qa_ergonomic_chair` at [5.65, 0, 12.95], facing North +Z)
  const qaChair = buildErgonomicTaskChair(
    furnitureSubgroups.QA_WORKSTATION,
    'QA_Ergonomic_Chair',
    5.65,
    12.95,
    0,
    pal.dustyTeal,
    pal
  );
  registerCatalogItem('qa_ergonomic_chair', qaChair);

  // 3.3 Dedicated Physical 3D Device Testing Counter (`qa_device_testing_counter` at [1.65, 0, 13.55])
  const devCounterGrp = new THREE.Group();
  devCounterGrp.name = 'QA_Device_Testing_Counter';
  devCounterGrp.position.set(1.65, 0, 13.55);
  furnitureSubgroups.QA_DEVICE_TESTING.add(devCounterGrp);
  registerCatalogItem('qa_device_testing_counter', devCounterGrp);

  addBox(devCounterGrp, 'QA_Device_Counter_Cabinet', 0.64, 0.78, 1.44, 0, 0.39, 0, pal.richWalnut);
  addBox(devCounterGrp, 'QA_Device_Counter_Oak_Top', 0.68, 0.05, 1.48, 0, 0.805, 0, pal.warmOak);
  addBox(devCounterGrp, 'QA_Device_Counter_Shelf_Divider', 0.58, 0.03, 1.36, 0, 0.38, 0, pal.darkWalnut);
  addBox(devCounterGrp, 'QA_Device_Counter_Test_Crate_A', 0.42, 0.24, 0.48, 0.04, 0.18, -0.34, pal.navyPanel);
  addBox(devCounterGrp, 'QA_Device_Counter_Test_Crate_B', 0.42, 0.24, 0.48, 0.04, 0.18, 0.34, pal.mutedOlive);
  addBox(devCounterGrp, 'QA_Device_Counter_Status_Bar', 0.04, 0.03, 1.24, 0.31, 0.76, 0, pal.statusGreenLed);

  // 3D Open Testing Laptop on Stand (`QA_Device_Laptop_Screen` at world [1.68, 0.96, 13.85] facing East +X)
  addBox(devCounterGrp, 'QA_Device_Laptop_Base', 0.28, 0.02, 0.36, 0.04, 0.84, 0.3, pal.charcoalMetal);
  addBox(
    devCounterGrp,
    'QA_Device_Laptop_Lid_Back',
    0.025,
    0.24,
    0.36,
    0.015,
    0.96,
    0.3,
    pal.charcoalMetal
  );
  const qaDeviceLaptopScreen = addSingleFrontScreenPlane(
    devCounterGrp,
    'QA_Device_Laptop_Screen',
    0.33,
    0.21,
    0.03,
    0.96,
    0.3,
    Math.PI / 2, // Faces East (+X) toward QA_DEVICE_TESTING [2.65, 0, 13.55]
    pal.qaDeviceTestingScreenMat,
    'QA_DEVICE_TESTING'
  );
  displaySlotNodes.set('QA_DEVICE_TESTING', qaDeviceLaptopScreen);

  // 3D Tablet Pro on Dock (`QA_Device_Tablet_Pro_Screen` at world [1.72, 0.91, 13.25] facing East +X)
  addBox(devCounterGrp, 'QA_Device_Tablet_Pro_Dock', 0.12, 0.03, 0.24, 0.06, 0.845, -0.3, pal.darkWalnut);
  addBox(
    devCounterGrp,
    'QA_Device_Tablet_Pro_Body',
    0.022,
    0.18,
    0.24,
    0.055,
    0.91,
    -0.3,
    pal.charcoalMetal
  );
  addSingleFrontScreenPlane(
    devCounterGrp,
    'QA_Device_Tablet_Pro_Screen',
    0.21,
    0.15,
    0.07,
    0.91,
    -0.3,
    Math.PI / 2, // Faces East (+X)
    pal.qaDeviceTestingScreenMat
  );

  // 3D Smartphone 1 (Portrait) + 3D Smartphone 2 (Landscape) + 3D Mini Tablet
  addBox(devCounterGrp, 'QA_Test_Phone_Portrait_Stand', 0.08, 0.025, 0.09, 0.16, 0.842, -0.02, pal.brushedBrass);
  addBox(devCounterGrp, 'QA_Test_Phone_Portrait_Body', 0.018, 0.13, 0.07, 0.16, 0.9, -0.02, pal.charcoalMetal);
  addSingleFrontScreenPlane(
    devCounterGrp,
    'QA_Test_Phone_Portrait_Screen',
    0.056,
    0.11,
    0.171,
    0.9,
    -0.02,
    Math.PI / 2,
    pal.qaDeviceTestingScreenMat
  );

  addBox(devCounterGrp, 'QA_Test_Phone_Landscape_Stand', 0.08, 0.025, 0.12, 0.16, 0.842, -0.54, pal.brushedBrass);
  addBox(devCounterGrp, 'QA_Test_Phone_Landscape_Body', 0.018, 0.075, 0.14, 0.16, 0.88, -0.54, pal.charcoalMetal);
  addSingleFrontScreenPlane(
    devCounterGrp,
    'QA_Test_Phone_Landscape_Screen',
    0.12,
    0.058,
    0.171,
    0.88,
    -0.54,
    Math.PI / 2,
    pal.qaDeviceTestingScreenMat
  );

  // Organized solid test bus bar & Unique Voxel Golden Bug Hunter Trophy
  addBox(devCounterGrp, 'QA_Test_USB_Hub_Bus', 0.06, 0.024, 0.88, -0.14, 0.842, -0.1, pal.charcoalMetal);
  addBox(devCounterGrp, 'QA_Bug_Trophy_Pedestal', 0.12, 0.05, 0.12, -0.16, 0.855, 0.56, pal.darkWalnut);
  addBox(devCounterGrp, 'QA_Bug_Trophy_Shell_Gold', 0.1, 0.09, 0.12, -0.16, 0.925, 0.56, pal.brushedBrass);

  // 3.4 QA Test Documentation Shelves & Bug Triage Card Rack (`qa_documentation_shelves` at [1.55, 0, 15.38])
  const qaShelfGrp = new THREE.Group();
  qaShelfGrp.name = 'QA_Documentation_Bookcase';
  qaShelfGrp.position.set(1.55, 0, 15.38);
  furnitureSubgroups.QA_STORAGE.add(qaShelfGrp);
  registerCatalogItem('qa_documentation_shelves', qaShelfGrp);

  addBox(qaShelfGrp, 'QA_Bookcase_Back', 1.62, 2.24, 0.04, 0, 1.12, 0.2, pal.darkWalnut);
  addBox(qaShelfGrp, 'QA_Bookcase_Side_W', 0.05, 2.24, 0.44, -0.785, 1.12, 0, pal.richWalnut);
  addBox(qaShelfGrp, 'QA_Bookcase_Side_E', 0.05, 2.24, 0.44, 0.785, 1.12, 0, pal.richWalnut);
  for (let sIdx = 0; sIdx < 5; sIdx++) {
    const sy = 0.08 + sIdx * 0.52;
    addBox(qaShelfGrp, `QA_Bookcase_Shelf_${sIdx}`, 1.52, 0.04, 0.42, 0, sy, 0, pal.warmOak);
  }
  // Binders, reference folders & archive boxes on shelves
  const binderColors = [pal.navyPanel, pal.dustyTeal, pal.mutedOlive, pal.brushedBrass, pal.creamWall];
  for (let b = 0; b < 8; b++) {
    addBox(
      qaShelfGrp,
      `QA_Regression_Binder_${b + 1}`,
      0.11,
      0.34,
      0.28,
      -0.6 + b * 0.17,
      0.79,
      -0.02,
      binderColors[b % binderColors.length]
    );
    addBox(
      qaShelfGrp,
      `QA_Test_Report_Folder_${b + 1}`,
      0.11,
      0.32,
      0.28,
      -0.6 + b * 0.17,
      1.31,
      -0.02,
      binderColors[(b + 2) % binderColors.length]
    );
  }
  addBox(qaShelfGrp, 'QA_Archive_Storage_Box_A', 0.42, 0.32, 0.34, -0.42, 0.26, -0.02, pal.dustyTeal);
  addBox(qaShelfGrp, 'QA_Archive_Storage_Box_B', 0.42, 0.32, 0.34, 0.12, 0.26, -0.02, pal.mutedOlive);
  addBox(qaShelfGrp, 'QA_Bug_Triage_Card_Rack', 0.36, 0.34, 0.24, 0.52, 1.83, -0.02, pal.brushedBrass);

  // 3.5 Wall-Mounted QA Checklist & Bug Review Board (`qa_checklist_board` at [0.22, 0, 11.45])
  const qaBoardGrp = new THREE.Group();
  qaBoardGrp.name = 'QA_Checklist_Wall_Board';
  qaBoardGrp.position.set(0.22, 0, 11.45);
  propsSubgroups.QA_REVIEW_PROPS.add(qaBoardGrp);
  registerCatalogItem('qa_checklist_board', qaBoardGrp);

  addBox(
    qaBoardGrp,
    'QA_Checklist_Board_Backing',
    0.04,
    1.28,
    1.76,
    0,
    1.62,
    0,
    pal.darkWalnut
  );
  addBox(qaBoardGrp, 'QA_Checklist_Brass_Trim_Top', 0.055, 0.04, 1.8, 0.005, 2.27, 0, pal.brushedBrass);
  addBox(qaBoardGrp, 'QA_Checklist_Brass_Trim_Bot', 0.07, 0.05, 1.8, 0.01, 0.97, 0, pal.richWalnut);
  const qaChecklistSurface = addSingleFrontScreenPlane(
    qaBoardGrp,
    'QA_Checklist_Board_Surface',
    1.68,
    1.18,
    0.03, // World X = 0.25, facing East (+X) toward QA_CHECKLIST_BOARD [1.45, 0, 11.45]
    1.62,
    0,
    Math.PI / 2,
    pal.qaChecklistBoardMat,
    'QA_CHECKLIST'
  );
  displaySlotNodes.set('QA_CHECKLIST', qaChecklistSurface);
  westWallNodes.push(qaBoardGrp);

  // =========================================================================
  // 4. ZONE B — CENTRAL COZY COLLABORATION LOUNGE & SHARED REVIEW (Z ≈ 5.4..10.6)
  // =========================================================================
  // 4.1 Large Patterned Area Rug (`qa_devops_lounge_rug` at [4.75, 0, 8.0], 4.30 × 4.60m)
  const rugGrp = new THREE.Group();
  rugGrp.name = 'QA_DevOps_Patterned_Lounge_Rug';
  rugGrp.position.set(4.75, 0, 8.0);
  furnitureSubgroups.SHARED_LOUNGE.add(rugGrp);
  registerCatalogItem('qa_devops_lounge_rug', rugGrp);

  // Rug body spans Y = 0.002..0.012 (strictly above continuous oak floor Y = 0.000)
  const rugMain = addBox(
    rugGrp,
    'QA_DevOps_Lounge_Rug_Field',
    4.22,
    0.01,
    4.52,
    0,
    0.007,
    0,
    pal.loungeRugMat,
    false,
    true
  );
  rugMain.renderOrder = 2;
  // Stepped outer woven binding rails (non-overlapping with rugMain)
  addBox(rugGrp, 'Lounge_Rug_Border_N', 4.3, 0.012, 0.04, 0, 0.008, 2.28, pal.navyPanel, false, true);
  addBox(rugGrp, 'Lounge_Rug_Border_S', 4.3, 0.012, 0.04, 0, 0.008, -2.28, pal.navyPanel, false, true);
  addBox(rugGrp, 'Lounge_Rug_Border_W', 0.04, 0.012, 4.52, -2.13, 0.008, 0, pal.navyPanel, false, true);
  addBox(rugGrp, 'Lounge_Rug_Border_E', 0.04, 0.012, 4.52, 2.13, 0.008, 0, pal.navyPanel, false, true);

  // 4.2 Cream Three-Seat Sofa (`qa_devops_lounge_sofa` at [5.95, 0, 8.05], facing West -X)
  const sofaGrp = new THREE.Group();
  sofaGrp.name = 'QA_DevOps_Cream_Three_Seat_Sofa';
  sofaGrp.position.set(5.95, 0, 8.05);
  furnitureSubgroups.SHARED_LOUNGE.add(sofaGrp);
  registerCatalogItem('qa_devops_lounge_sofa', sofaGrp);

  // Walnut plinth base & 6 tapered legs (resting at Y = 0.013 cleanly above the rug)
  addBox(sofaGrp, 'Sofa_Walnut_Plinth_Frame', 0.88, 0.08, 2.24, 0, 0.14, 0, pal.richWalnut);
  for (const lz of [-1.02, 0, 1.02]) {
    addBox(sofaGrp, `Sofa_Leg_W_${lz}`, 0.06, 0.085, 0.06, -0.36, 0.056, lz, pal.darkWalnut);
    addBox(sofaGrp, `Sofa_Leg_E_${lz}`, 0.06, 0.085, 0.06, 0.36, 0.056, lz, pal.darkWalnut);
  }
  // Upholstered backrest on East (+X) side & 3 segmented seat cushions
  addBox(sofaGrp, 'Sofa_Upholstered_Backrest', 0.22, 0.66, 2.24, 0.33, 0.52, 0, pal.creamUpholstery);
  addBox(sofaGrp, 'Sofa_Armrest_South', 0.88, 0.44, 0.18, 0, 0.4, -1.04, pal.creamUpholstery);
  addBox(sofaGrp, 'Sofa_Armrest_North', 0.88, 0.44, 0.18, 0, 0.4, 1.04, pal.creamUpholstery);

  const cushionZ = [-0.62, 0, 0.62];
  cushionZ.forEach((cz, idx) => {
    addBox(
      sofaGrp,
      `Sofa_Seat_Cushion_${idx + 1}`,
      0.64,
      0.16,
      0.6,
      -0.08,
      0.26,
      cz,
      pal.creamCushionSoft
    );
    addBox(
      sofaGrp,
      `Sofa_Back_Cushion_${idx + 1}`,
      0.14,
      0.38,
      0.58,
      0.16,
      0.54,
      cz,
      pal.creamCushionSoft
    );
  });

  // Navy, Dusty Teal & Olive Throw Pillows + Folded Knitted Throw Blanket
  addBox(sofaGrp, 'Sofa_Pillow_Navy_North', 0.14, 0.28, 0.28, 0.04, 0.48, 0.74, pal.navyPanel);
  addBox(sofaGrp, 'Sofa_Pillow_Teal_Center', 0.12, 0.24, 0.26, 0.05, 0.46, 0.16, pal.dustyTeal);
  addBox(sofaGrp, 'Sofa_Pillow_Olive_South', 0.14, 0.28, 0.28, 0.04, 0.48, -0.72, pal.mutedOlive);
  // Folded voxel knitted throw blanket draped over South armrest & cushion
  addBox(sofaGrp, 'Sofa_Knitted_Throw_Top', 0.56, 0.04, 0.34, -0.06, 0.63, -1.02, pal.knittedThrowOat);
  addBox(sofaGrp, 'Sofa_Knitted_Throw_Drape', 0.54, 0.26, 0.04, -0.06, 0.49, -1.15, pal.knittedThrowOat);

  // 4.3 Matching Cream Lounge Armchair (`qa_devops_lounge_armchair` at [4.65, 0, 9.65], facing South -Z)
  const armchairGrp = new THREE.Group();
  armchairGrp.name = 'QA_DevOps_Cream_Lounge_Armchair';
  armchairGrp.position.set(4.65, 0, 9.65);
  furnitureSubgroups.SHARED_LOUNGE.add(armchairGrp);
  registerCatalogItem('qa_devops_lounge_armchair', armchairGrp);

  addBox(armchairGrp, 'Armchair_Walnut_Plinth', 0.86, 0.08, 0.84, 0, 0.14, 0, pal.richWalnut);
  addBox(armchairGrp, 'Armchair_Backrest_North', 0.86, 0.64, 0.2, 0, 0.5, 0.32, pal.creamUpholstery);
  addBox(armchairGrp, 'Armchair_Armrest_W', 0.16, 0.42, 0.82, -0.35, 0.39, 0, pal.creamUpholstery);
  addBox(armchairGrp, 'Armchair_Armrest_E', 0.16, 0.42, 0.82, 0.35, 0.39, 0, pal.creamUpholstery);
  addBox(armchairGrp, 'Armchair_Seat_Cushion', 0.52, 0.16, 0.58, 0, 0.26, -0.06, pal.creamCushionSoft);
  addBox(armchairGrp, 'Armchair_Olive_Accent_Pillow', 0.34, 0.24, 0.12, 0, 0.46, 0.14, pal.mutedOlive);

  // 4.4 Wooden Coffee Table (`qa_devops_coffee_table` at [4.55, 0, 8.05])
  const coffeeTableGrp = new THREE.Group();
  coffeeTableGrp.name = 'QA_DevOps_Wooden_Coffee_Table';
  coffeeTableGrp.position.set(4.55, 0, 8.05);
  furnitureSubgroups.SHARED_LOUNGE.add(coffeeTableGrp);
  registerCatalogItem('qa_devops_coffee_table', coffeeTableGrp);

  addBox(coffeeTableGrp, 'Coffee_Table_Oak_Top', 1.12, 0.05, 1.42, 0, 0.415, 0, pal.warmOak);
  addBox(coffeeTableGrp, 'Coffee_Table_Lower_Shelf', 0.96, 0.03, 1.26, 0, 0.16, 0, pal.richWalnut);
  for (const [lx, lz] of [
    [-0.46, -0.58],
    [0.46, -0.58],
    [-0.46, 0.58],
    [0.46, 0.58],
  ] as Array<[number, number]>) {
    addBox(coffeeTableGrp, `Coffee_Table_Leg_${lx}_${lz}`, 0.06, 0.38, 0.06, lx, 0.205, lz, pal.darkWalnut);
  }
  // Stacked books, release review notes, centerpiece plant & warm brass table lamp
  addBox(coffeeTableGrp, 'Coffee_Table_Book_Stack_A', 0.26, 0.04, 0.34, -0.22, 0.46, 0.36, pal.navyPanel);
  addBox(coffeeTableGrp, 'Coffee_Table_Book_Stack_B', 0.24, 0.035, 0.3, -0.22, 0.498, 0.36, pal.dustyTeal);
  addBox(coffeeTableGrp, 'Coffee_Table_Review_Notes', 0.28, 0.02, 0.36, -0.2, 0.45, -0.34, pal.parchmentPaper);
  buildCozyPlant(coffeeTableGrp, 'Coffee_Table_Centerpiece_Plant', 0.18, 0.44, 0.0, 0.55, pal, true);
  addBox(coffeeTableGrp, 'Coffee_Table_Lamp_Base', 0.14, 0.12, 0.14, 0.24, 0.5, -0.4, pal.brushedBrass);
  addBox(coffeeTableGrp, 'Coffee_Table_Lamp_Shade', 0.22, 0.16, 0.22, 0.24, 0.65, -0.4, pal.warmLampShade);

  // 4.5 Three Compact Soft Poufs (`qa_devops_lounge_poufs`)
  const poufsGrp = new THREE.Group();
  poufsGrp.name = 'QA_DevOps_Compact_Lounge_Poufs';
  poufsGrp.position.set(3.35, 0, 7.85);
  furnitureSubgroups.SHARED_LOUNGE.add(poufsGrp);
  registerCatalogItem('qa_devops_lounge_poufs', poufsGrp);

  const poufSpecs = [
    { name: 'Pouf_Slate_Blue', x: 0, z: -0.6, mat: pal.slateBlueFabric },
    { name: 'Pouf_Muted_Teal', x: 0, z: 0.6, mat: pal.dustyTeal },
    { name: 'Pouf_Olive_Green', x: 1.2, z: -1.4, mat: pal.mutedOlive },
  ];
  for (const p of poufSpecs) {
    // Base starts at Y = 0.014 cleanly above rug Y = 0.012
    addBox(poufsGrp, `${p.name}_Plinth`, 0.42, 0.04, 0.42, p.x, 0.034, p.z, pal.darkWalnut);
    addBox(poufsGrp, `${p.name}_Body`, 0.48, 0.26, 0.48, p.x, 0.185, p.z, p.mat);
    addBox(poufsGrp, `${p.name}_Top_Cushion`, 0.44, 0.06, 0.44, p.x, 0.346, p.z, p.mat);
  }

  // 4.6 Low Console under East Lounge Window (`qa_devops_window_console` at [7.32, 0, 8.05])
  const winConsoleGrp = new THREE.Group();
  winConsoleGrp.name = 'QA_DevOps_East_Window_Console';
  winConsoleGrp.position.set(7.32, 0, 8.05);
  furnitureSubgroups.SHARED_LOUNGE.add(winConsoleGrp);
  registerCatalogItem('qa_devops_window_console', winConsoleGrp);

  addBox(winConsoleGrp, 'Window_Console_Body', 0.44, 0.68, 2.1, 0, 0.34, 0, pal.richWalnut);
  addBox(winConsoleGrp, 'Window_Console_Oak_Top', 0.48, 0.045, 2.16, 0, 0.702, 0, pal.warmOak);
  addBox(winConsoleGrp, 'Window_Console_Binder_Set', 0.26, 0.28, 0.44, 0, 0.865, -0.52, pal.navyPanel);
  addBox(winConsoleGrp, 'Window_Console_Storage_Box', 0.28, 0.22, 0.42, 0, 0.835, 0.48, pal.creamWall);

  // 4.7 Shared QA & DevOps Release Review Board (`qa_devops_shared_review_board` at [0.22, 0, 5.65])
  const sharedBoardGrp = new THREE.Group();
  sharedBoardGrp.name = 'QA_DevOps_Shared_Review_Board';
  sharedBoardGrp.position.set(0.22, 0, 5.65);
  propsSubgroups.SHARED_REVIEW_PROPS.add(sharedBoardGrp);
  registerCatalogItem('qa_devops_shared_review_board', sharedBoardGrp);

  addBox(
    sharedBoardGrp,
    'QA_DevOps_Shared_Review_Backing',
    0.04,
    1.28,
    1.86,
    0,
    1.58,
    0,
    pal.darkWalnut
  );
  addBox(sharedBoardGrp, 'Shared_Board_Brass_Top', 0.055, 0.04, 1.9, 0.005, 2.23, 0, pal.brushedBrass);
  addBox(sharedBoardGrp, 'Shared_Board_Ledge', 0.14, 0.05, 1.9, 0.04, 0.92, 0, pal.richWalnut);
  const sharedReviewSurface = addSingleFrontScreenPlane(
    sharedBoardGrp,
    'QA_DevOps_Shared_Review_Surface',
    1.78,
    1.18,
    0.03, // World X = 0.25, facing East (+X) toward QA_DEVOPS_REVIEW_BOARD [1.55, 0, 5.65]
    1.58,
    0,
    Math.PI / 2,
    pal.sharedReviewBoardMat,
    'QA_DEVOPS_REVIEW_BOARD'
  );
  displaySlotNodes.set('QA_DEVOPS_REVIEW_BOARD', sharedReviewSurface);
  westWallNodes.push(sharedBoardGrp);

  // =========================================================================
  // 5. ZONE C — SOUTH DEVOPS OPERATIONS AREA (Z ≈ 0.0..5.4)
  // =========================================================================
  // 5.1 DevOps Operations Workstation Desk (`devops_workstation_desk` at [2.45, 0, 2.75])
  const devopsDeskGrp = new THREE.Group();
  devopsDeskGrp.name = 'DevOps_Workstation_Desk';
  devopsDeskGrp.position.set(2.45, 0, 2.75);
  furnitureSubgroups.DEVOPS_WORKSTATION.add(devopsDeskGrp);
  registerCatalogItem('devops_workstation_desk', devopsDeskGrp);

  // Distinct DevOps desk design: Rich walnut desktop + left 3-drawer telemetry pedestal + right elevated equipment riser dock
  addBox(devopsDeskGrp, 'DevOps_Desk_Walnut_Top', 2.15, 0.055, 0.9, 0, 0.732, 0, pal.richWalnut);
  addBox(devopsDeskGrp, 'DevOps_Desk_Brass_Edge', 2.15, 0.018, 0.016, 0, 0.72, -0.452, pal.brushedBrass);
  addBox(devopsDeskGrp, 'DevOps_Desk_Left_Pedestal', 0.56, 0.68, 0.78, -0.72, 0.34, 0, pal.charcoalMetal);
  for (let dIdx = 0; dIdx < 3; dIdx++) {
    const dy = 0.16 + dIdx * 0.2;
    addBox(
      devopsDeskGrp,
      `DevOps_Desk_Drawer_${dIdx + 1}`,
      0.48,
      0.16,
      0.02,
      -0.72,
      dy,
      -0.4,
      pal.navyPanel
    );
    addBox(
      devopsDeskGrp,
      `DevOps_Desk_Drawer_Pull_${dIdx + 1}`,
      0.14,
      0.022,
      0.024,
      -0.72,
      dy,
      -0.422,
      pal.brushedBrass
    );
  }
  addBox(devopsDeskGrp, 'DevOps_Desk_Leg_East_F', 0.07, 0.7, 0.07, 0.96, 0.35, -0.36, pal.charcoalMetal);
  addBox(devopsDeskGrp, 'DevOps_Desk_Leg_East_B', 0.07, 0.7, 0.07, 0.96, 0.35, 0.36, pal.charcoalMetal);
  // Right-side Elevated Equipment Riser Dock & Cloud/Node Topology Appliance
  addBox(devopsDeskGrp, 'DevOps_Equipment_Riser_Shelf', 0.56, 0.12, 0.34, 0.72, 0.82, 0.2, pal.darkWalnut);
  addBox(devopsDeskGrp, 'DevOps_Telemetry_Appliance_Box', 0.42, 0.08, 0.26, 0.72, 0.92, 0.2, pal.charcoalMetal);
  addBox(devopsDeskGrp, 'DevOps_Telemetry_Status_LED', 0.18, 0.018, 0.015, 0.72, 0.92, 0.062, pal.statusCyanLed);

  // Desk Mat, Keyboard, Mouse, Runbook Binder, Coffee Mug & Task Lamp
  addBox(devopsDeskGrp, 'DevOps_Desk_Mat', 0.94, 0.008, 0.42, 0.04, 0.764, -0.14, pal.charcoalMetal);
  addBox(devopsDeskGrp, 'DevOps_Keyboard', 0.38, 0.022, 0.14, -0.04, 0.779, -0.16, pal.charcoalMetal);
  addBox(devopsDeskGrp, 'DevOps_Mouse', 0.07, 0.024, 0.11, 0.26, 0.779, -0.16, pal.charcoalMetal);
  addBox(devopsDeskGrp, 'DevOps_Runbook_Binder', 0.24, 0.04, 0.3, -0.68, 0.78, -0.1, pal.mutedOlive);
  addBox(devopsDeskGrp, 'DevOps_Coffee_Mug', 0.075, 0.095, 0.075, 0.52, 0.808, -0.22, pal.brushedBrass);
  addBox(devopsDeskGrp, 'DevOps_Task_Lamp_Base', 0.16, 0.03, 0.16, -0.82, 0.775, 0.24, pal.brushedBrass);
  addBox(devopsDeskGrp, 'DevOps_Task_Lamp_Stem', 0.03, 0.36, 0.03, -0.82, 0.96, 0.24, pal.brushedBrass);
  addBox(devopsDeskGrp, 'DevOps_Task_Lamp_Shade', 0.2, 0.1, 0.14, -0.76, 1.14, 0.18, pal.warmLampShade);

  // PRIMARY DEVOPS DISPLAY (`DevOps_Main_Display_Screen` at world [2.22, 1.02, 2.98], facing South [0,0,-1] toward DEVOPS_CHAIR)
  // Local offset relative to devopsDeskGrp [2.45, 0, 2.75] -> [-0.23, 1.02, 0.23]
  addBox(devopsDeskGrp, 'DevOps_Main_Display_Stand_Base', 0.24, 0.02, 0.18, -0.23, 0.77, 0.26, pal.charcoalMetal);
  addBox(devopsDeskGrp, 'DevOps_Main_Display_Stand_Neck', 0.06, 0.22, 0.05, -0.23, 0.88, 0.27, pal.charcoalMetal);
  addBox(
    devopsDeskGrp,
    'DevOps_Main_Display_Rear_Casing',
    0.72,
    0.44,
    0.04,
    -0.23,
    1.02,
    0.252,
    pal.charcoalMetal
  );
  const devopsMainScreen = addSingleFrontScreenPlane(
    devopsDeskGrp,
    'DevOps_Main_Display_Screen',
    0.68,
    0.4,
    -0.23,
    1.02,
    0.23,
    Math.PI, // Normal points South [0, 0, -1] toward DEVOPS_CHAIR
    pal.devopsPipelineScreenMat,
    'DEVOPS_PIPELINE_DISPLAY'
  );
  displaySlotNodes.set('DEVOPS_PIPELINE_DISPLAY', devopsMainScreen);

  // SECONDARY DEVOPS DISPLAY (`DevOps_Secondary_Display_Screen` at world [2.92, 1.01, 2.91], angled toward DEVOPS_CHAIR)
  // Local offset relative to devopsDeskGrp [2.45, 0, 2.75] -> [+0.47, 1.01, 0.16]
  const devopsSecGrp = new THREE.Group();
  devopsSecGrp.name = 'DevOps_Secondary_Display_Rig';
  devopsSecGrp.position.set(0.47, 0, 0.16);
  devopsSecGrp.rotation.y = 0.35;
  devopsDeskGrp.add(devopsSecGrp);
  addBox(devopsSecGrp, 'DevOps_Secondary_Stand_Base', 0.2, 0.02, 0.16, 0, 0.77, 0.03, pal.charcoalMetal);
  addBox(devopsSecGrp, 'DevOps_Secondary_Stand_Neck', 0.05, 0.21, 0.04, 0, 0.88, 0.04, pal.charcoalMetal);
  addBox(
    devopsSecGrp,
    'DevOps_Secondary_Display_Rear_Casing',
    0.58,
    0.38,
    0.04,
    0,
    1.01,
    0.022,
    pal.charcoalMetal
  );
  const devopsSecScreen = addSingleFrontScreenPlane(
    devopsSecGrp,
    'DevOps_Secondary_Display_Screen',
    0.54,
    0.34,
    0,
    1.01,
    0,
    Math.PI,
    pal.devopsMonitoringScreenMat,
    'DEVOPS_MONITORING_SCREEN'
  );
  displaySlotNodes.set('DEVOPS_MONITORING_SCREEN', devopsSecScreen);

  // 5.2 DevOps Ergonomic Chair (`devops_ergonomic_chair` at [2.45, 0, 1.85], facing North +Z)
  const devopsChair = buildErgonomicTaskChair(
    furnitureSubgroups.DEVOPS_WORKSTATION,
    'DevOps_Ergonomic_Chair',
    2.45,
    1.85,
    0,
    pal.mutedOlive,
    pal
  );
  registerCatalogItem('devops_ergonomic_chair', devopsChair);

  // 5.3 Two Separate Compact Infrastructure Rack Cabinets (`devops_infrastructure_racks` at [7.15, 0, 3.10])
  const racksGrp = new THREE.Group();
  racksGrp.name = 'DevOps_Dual_Infrastructure_Racks';
  racksGrp.position.set(7.15, 0, 3.10);
  furnitureSubgroups.DEVOPS_RACKS.add(racksGrp);
  registerCatalogItem('devops_infrastructure_racks', racksGrp);

  const buildSingleRackCabinet = (rackName: string, offsetZ: number) => {
    const rGrp = new THREE.Group();
    rGrp.name = rackName;
    rGrp.position.set(0, 0, offsetZ);
    racksGrp.add(rGrp);

    // Base feet + dark charcoal cabinet body + walnut top cap + brass bezel
    addBox(rGrp, `${rackName}_Plinth_Base`, 0.72, 0.08, 1.02, 0, 0.04, 0, pal.darkWalnut);
    addBox(rGrp, `${rackName}_Cabinet_Body`, 0.68, 1.78, 0.98, 0.02, 0.97, 0, pal.charcoalMetal);
    addBox(rGrp, `${rackName}_Top_Walnut_Cap`, 0.74, 0.05, 1.04, 0, 1.885, 0, pal.richWalnut);
    addBox(rGrp, `${rackName}_Front_Brass_Rail_S`, 0.03, 1.76, 0.04, -0.33, 0.97, -0.46, pal.brushedBrass);
    addBox(rGrp, `${rackName}_Front_Brass_Rail_N`, 0.03, 1.76, 0.04, -0.33, 0.97, 0.46, pal.brushedBrass);

    // 5 Stepped individual rack server modules (strictly offset at X = -0.335 to prevent coplanar Z-fighting)
    for (let m = 0; m < 5; m++) {
      const my = 0.28 + m * 0.32;
      addBox(
        rGrp,
        `${rackName}_Module_Blade_${m + 1}`,
        0.03,
        0.24,
        0.84,
        -0.335,
        my,
        0,
        pal.navyPanel
      );
      addBox(
        rGrp,
        `${rackName}_Module_Vent_${m + 1}`,
        0.015,
        0.12,
        0.54,
        -0.356,
        my,
        -0.1,
        pal.charcoalMetal
      );
      const ledMat =
        m === 4 ? pal.statusAmberLed : m % 2 === 0 ? pal.statusGreenLed : pal.statusCyanLed;
      addBox(
        rGrp,
        `${rackName}_Module_Status_LED_${m + 1}`,
        0.016,
        0.035,
        0.14,
        -0.358,
        my,
        0.28,
        ledMat
      );
    }
  };

  buildSingleRackCabinet('DevOps_Infrastructure_Rack_A', 0.75); // World Z = 3.85
  buildSingleRackCabinet('DevOps_Infrastructure_Rack_B', -0.75); // World Z = 2.35

  // Top Monitoring Indicator Tower & Network Patch Bridge on Rack A
  addBox(racksGrp, 'DevOps_Monitoring_Tower_Base', 0.22, 0.06, 0.22, 0, 1.94, 0.75, pal.charcoalMetal);
  addBox(racksGrp, 'DevOps_Monitoring_Tower_Beacon', 0.1, 0.16, 0.1, 0, 2.05, 0.75, pal.statusGreenLed);

  // 5.4 South-East DevOps Operations Wall Board (`devops_operations_wall_board` at [5.65, 0, 0.22])
  const devopsBoardGrp = new THREE.Group();
  devopsBoardGrp.name = 'DevOps_Operations_Status_Wall_Board';
  devopsBoardGrp.position.set(5.65, 0, 0.22);
  propsSubgroups.DEVOPS_OPERATIONS_PROPS.add(devopsBoardGrp);
  registerCatalogItem('devops_operations_wall_board', devopsBoardGrp);

  addBox(
    devopsBoardGrp,
    'DevOps_Operations_Board_Backing',
    2.14,
    1.32,
    0.04,
    0,
    1.68,
    0,
    pal.darkWalnut
  );
  addBox(devopsBoardGrp, 'DevOps_Board_Brass_Top', 2.18, 0.04, 0.055, 0, 2.35, 0.005, pal.brushedBrass);
  addBox(devopsBoardGrp, 'DevOps_Board_Brass_Bot', 2.18, 0.05, 0.07, 0, 1.0, 0.01, pal.richWalnut);
  const devopsOpsSurface = addSingleFrontScreenPlane(
    devopsBoardGrp,
    'DevOps_Operations_Board_Surface',
    2.04,
    1.22,
    0,
    1.68,
    0.03, // World Z = 0.25, facing North (+Z) toward DEVOPS_MONITORING_DISPLAY [5.65, 0, 1.45]
    0,
    pal.devopsOperationsBoardMat,
    'DEVOPS_SYSTEM_STATUS'
  );
  displaySlotNodes.set('DEVOPS_SYSTEM_STATUS', devopsOpsSurface);
  southWallNodes.push(devopsBoardGrp);

  // 5.5 South-West Technical Storage & Equipment Transport Cases (`devops_technical_storage` at [0.54, 0, 2.65])
  // Designed as a low-profile 0.82m technical credenza so it never blocks the DevOps Workstation from South-West isometric views
  const devStorageGrp = new THREE.Group();
  devStorageGrp.name = 'DevOps_Technical_Storage_And_Cases';
  devStorageGrp.position.set(0.54, 0, 2.65);
  furnitureSubgroups.DEVOPS_WORKSTATION.add(devStorageGrp);
  registerCatalogItem('devops_technical_storage', devStorageGrp);

  addBox(devStorageGrp, 'DevOps_Storage_Frame_Back', 0.04, 0.78, 1.88, -0.21, 0.39, 0, pal.darkWalnut);
  addBox(devStorageGrp, 'DevOps_Storage_Side_S', 0.46, 0.78, 0.05, 0, 0.39, -0.92, pal.richWalnut);
  addBox(devStorageGrp, 'DevOps_Storage_Side_N', 0.46, 0.78, 0.05, 0, 0.39, 0.92, pal.richWalnut);
  addBox(devStorageGrp, 'DevOps_Storage_Shelf_Bottom', 0.44, 0.04, 1.8, 0, 0.06, 0, pal.darkWalnut);
  addBox(devStorageGrp, 'DevOps_Storage_Shelf_Mid', 0.42, 0.035, 1.8, 0, 0.42, 0, pal.warmOak);
  addBox(devStorageGrp, 'DevOps_Storage_Counter_Top', 0.48, 0.045, 1.92, 0.01, 0.802, 0, pal.warmOak);

  // Ruggedized Equipment Transport Cases & Hardware Toolbox on lower bays
  addBox(devStorageGrp, 'DevOps_Transport_Case_Charcoal', 0.36, 0.28, 0.54, 0.02, 0.22, -0.52, pal.charcoalMetal);
  addBox(devStorageGrp, 'DevOps_Transport_Case_Latch_A', 0.02, 0.07, 0.14, 0.205, 0.25, -0.52, pal.brushedBrass);
  addBox(devStorageGrp, 'DevOps_Transport_Case_Olive', 0.36, 0.28, 0.54, 0.02, 0.22, 0.2, pal.mutedOlive);
  addBox(devStorageGrp, 'DevOps_Hardware_Toolbox', 0.32, 0.22, 0.44, 0.02, 0.55, -0.5, pal.navyPanel);

  // 3D Cloud & Node Topology Model on top counter
  addBox(devStorageGrp, 'DevOps_Cloud_Topology_Base', 0.28, 0.035, 0.44, 0.02, 0.842, -0.42, pal.darkWalnut);
  addBox(devStorageGrp, 'DevOps_Cloud_Topology_Node_A', 0.11, 0.11, 0.11, 0.02, 0.915, -0.52, pal.statusCyanLed);
  addBox(devStorageGrp, 'DevOps_Cloud_Topology_Node_B', 0.13, 0.15, 0.13, 0.02, 0.935, -0.32, pal.brushedBrass);

  // Incident Runbook Binders neatly organized on top counter (North end)
  for (let rb = 0; rb < 6; rb++) {
    addBox(
      devStorageGrp,
      `DevOps_Runbook_Binder_${rb + 1}`,
      0.24,
      0.24,
      0.08,
      0.01,
      0.945,
      0.08 + rb * 0.13,
      rb % 2 === 0 ? pal.navyPanel : pal.dustyTeal
    );
  }

  // =========================================================================
  // 6. DECORATION — PLANTS, HANGING GREENERY, LAMPS, SIGNAGE & TROPHIES
  // =========================================================================
  // 6.1 Potted Studio Plants (`PLANTS`)
  buildCozyPlant(decorationSubgroups.PLANTS, 'QA_Corner_Plant_NE', 7.25, 0, 15.25, 1.05, pal, false);
  buildCozyPlant(decorationSubgroups.PLANTS, 'QA_Counter_Plant_NW', 0.65, 0, 12.65, 0.85, pal, true);
  buildCozyPlant(decorationSubgroups.PLANTS, 'Lounge_Plant_SW', 0.68, 0, 6.68, 0.95, pal, true);
  buildCozyPlant(decorationSubgroups.PLANTS, 'Lounge_Window_Plant_NE', 7.28, 0, 10.45, 0.95, pal, false);
  buildCozyPlant(decorationSubgroups.PLANTS, 'DevOps_Corner_Plant_SE', 7.22, 0, 0.85, 1.0, pal, false);

  // 3 Hanging Planters along the East Daylight Windows
  const hang1 = buildHangingPlanter(decorationSubgroups.PLANTS, 'Hanging_Planter_QA_East', 7.42, 2.52, 13.65, pal);
  const hang2 = buildHangingPlanter(decorationSubgroups.PLANTS, 'Hanging_Planter_Lounge_N', 7.42, 2.52, 9.15, pal);
  const hang3 = buildHangingPlanter(decorationSubgroups.PLANTS, 'Hanging_Planter_Lounge_S', 7.42, 2.52, 6.85, pal);
  eastWallNodes.push(hang1, hang2, hang3);

  // 6.2 Warm Brass Floor Lamp & Wall Sconces (`LAMPS`)
  const floorLampGrp = new THREE.Group();
  floorLampGrp.name = 'Lounge_Brass_Floor_Lamp';
  floorLampGrp.position.set(6.55, 0, 10.15);
  decorationSubgroups.LAMPS.add(floorLampGrp);
  addBox(floorLampGrp, 'Floor_Lamp_Base', 0.32, 0.04, 0.32, 0, 0.02, 0, pal.brushedBrass);
  addBox(floorLampGrp, 'Floor_Lamp_Pole', 0.04, 1.62, 0.04, 0, 0.84, 0, pal.brushedBrass);
  addBox(floorLampGrp, 'Floor_Lamp_Arm', 0.28, 0.035, 0.035, -0.12, 1.64, 0, pal.brushedBrass);
  addBox(floorLampGrp, 'Floor_Lamp_Shade', 0.34, 0.24, 0.34, -0.22, 1.54, 0, pal.warmLampShade);

  // 6.3 Department Identity Signage & Wall Art (`WALL_DECOR`)
  // QA Identity Sign on North-East Wall (`[6.35, 2.52, 15.73]`, facing South -Z)
  const qaSignGrp = new THREE.Group();
  qaSignGrp.name = 'QA_Department_Wall_Sign';
  qaSignGrp.position.set(6.35, 2.52, 15.73);
  decorationSubgroups.WALL_DECOR.add(qaSignGrp);
  addBox(qaSignGrp, 'QA_Sign_Backing_Plate', 1.68, 0.44, 0.04, 0, 0, 0, pal.charcoalMetal);
  addSingleFrontScreenPlane(qaSignGrp, 'QA_Sign_Front_Face', 1.62, 0.38, 0, 0, -0.024, Math.PI, pal.qaSignMat);
  northWallNodes.push(qaSignGrp);

  // DevOps Identity Sign on East Wall above Racks (`[7.73, 2.48, 3.10]`, facing West -X)
  const devopsSignGrp = new THREE.Group();
  devopsSignGrp.name = 'DevOps_Department_Wall_Sign';
  devopsSignGrp.position.set(7.73, 2.48, 3.1);
  decorationSubgroups.WALL_DECOR.add(devopsSignGrp);
  addBox(devopsSignGrp, 'DevOps_Sign_Backing_Plate', 0.04, 0.44, 1.72, 0, 0, 0, pal.charcoalMetal);
  addSingleFrontScreenPlane(
    devopsSignGrp,
    'DevOps_Sign_Front_Face',
    1.66,
    0.38,
    -0.024,
    0,
    0,
    -Math.PI / 2,
    pal.devopsSignMat
  );
  eastWallNodes.push(devopsSignGrp);

  // Framed Architectural Diagrams & Uptime Trophy on East Mid Pillar (`Z = 11.1`)
  const framedArtGrp = new THREE.Group();
  framedArtGrp.name = 'QA_DevOps_Framed_Architecture_Prints';
  framedArtGrp.position.set(7.73, 1.72, 11.1);
  decorationSubgroups.WALL_DECOR.add(framedArtGrp);
  addBox(framedArtGrp, 'Framed_Print_Outer_A', 0.04, 0.68, 0.84, 0, 0, -0.52, pal.darkWalnut);
  addBox(framedArtGrp, 'Framed_Print_Mat_A', 0.02, 0.56, 0.72, -0.022, 0, -0.52, pal.parchmentPaper);
  addBox(framedArtGrp, 'Framed_Print_Outer_B', 0.04, 0.68, 0.84, 0, 0, 0.52, pal.darkWalnut);
  addBox(framedArtGrp, 'Framed_Print_Mat_B', 0.02, 0.56, 0.72, -0.022, 0, 0.52, pal.parchmentPaper);
  eastWallNodes.push(framedArtGrp);

  // 6.4 Lounge Decorative Crates & Magazine Basket (`LOUNGE_DETAILS`)
  addBox(
    decorationSubgroups.LOUNGE_DETAILS,
    'Lounge_Storage_Crate_Walnut',
    0.42,
    0.32,
    0.48,
    7.28,
    0.16,
    6.45,
    pal.richWalnut
  );
  addBox(
    decorationSubgroups.LOUNGE_DETAILS,
    'Lounge_Magazine_Basket_Brass',
    0.34,
    0.26,
    0.4,
    5.95,
    0.145,
    6.55,
    pal.brushedBrass
  );

  // =========================================================================
  // 7. RUNTIME-ONLY ANCHOR VISUAL HELPERS (Never exported to GLB)
  // =========================================================================
  const helpersGroup = new THREE.Group();
  helpersGroup.name = 'QA_DEVOPS_ROOM_RUNTIME_HELPERS';
  helpersGroup.visible = false;

  for (const anchor of DEFAULT_QA_DEVOPS_ANCHOR_LIST) {
    const marker = new THREE.Group();
    marker.name = `Anchor_Helper_${anchor.id}`;
    marker.position.set(...anchor.position);
    marker.rotation.y = anchor.facingRad;

    const ringMat =
      anchor.zone === 'QA_TESTING_ZONE'
        ? pal.dustyTeal
        : anchor.zone === 'DEVOPS_OPERATIONS_ZONE'
        ? pal.mutedOlive
        : anchor.zone === 'SHARED_COZY_LOUNGE'
        ? pal.brushedBrass
        : pal.statusGreenLed;

    addBox(marker, `${anchor.id}_Pad`, 0.34, 0.02, 0.34, 0, 0.01, 0, ringMat, false, false);
    addBox(marker, `${anchor.id}_Arrow`, 0.08, 0.03, 0.22, 0, 0.025, 0.14, pal.brushedBrass, false, false);
    helpersGroup.add(marker);
  }

  // Compute actual geometry statistics
  let meshCount = 0;
  let triangleCount = 0;
  const matSet = new Set<THREE.Material>();

  roomRoot.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      meshCount += 1;
      const geom = obj.geometry;
      if (geom.index) {
        triangleCount += Math.round(geom.index.count / 3);
      } else if (geom.attributes.position) {
        triangleCount += Math.round(geom.attributes.position.count / 3);
      }
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => matSet.add(m));
      } else if (obj.material) {
        matSet.add(obj.material);
      }
    }
  });

  return {
    root: roomRoot,
    roomRoot,
    groups,
    furnitureSubgroups,
    propsSubgroups,
    decorationSubgroups,
    northWallNodes,
    southWallNodes,
    eastWallNodes,
    westWallNodes,
    furnitureNodes,
    catalogNodeMap,
    displaySlotNodes,
    helpersGroup,
    stats: {
      meshCount,
      triangleCount,
      materialCount: matSet.size,
    },
  };
}
