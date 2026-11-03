import * as THREE from 'three';

export type VisualStyleMode = 'reference' | 'clean' | 'pixel';

export interface MaterialLibraryInstance {
  materials: Record<string, THREE.MeshStandardMaterial>;
  textures: Record<string, THREE.CanvasTexture>;
  setVisualMode: (mode: VisualStyleMode, texturesEnabled: boolean) => void;
  dispose: () => void;
}

// Deterministic PRNG so procedural pixel textures are 100% reproducible
function createSeededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function configurePixelTexture(canvas: HTMLCanvasElement, name: string): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.name = name;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function configureArchitecturalFloorTexture(
  canvas: HTMLCanvasElement,
  name: string,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.name = name;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.wrapS = repeatX > 1 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  tex.wrapT = repeatY > 1 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  if (repeatX > 1 || repeatY > 1) {
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

interface WidePlankOakConfig {
  seed: number;
  name: string;
  baseFill: string;
  plankPalette: string[];
  grainDark: string;
  grainLight: string;
  seamColor: string;
}

function createWidePlankOakTexture(config: WidePlankOakConfig): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = createSeededRandom(config.seed);

  ctx.fillStyle = config.baseFill;
  ctx.fillRect(0, 0, size, size);

  // 16 wide architectural planks across 512px (32px height per plank = 0.5u wide planks, calm and legible)
  const plankHeight = 32;
  const numRows = size / plankHeight;

  for (let row = 0; row < numRows; row++) {
    const y = row * plankHeight;
    let x = -Math.floor(rand() * 64);

    while (x < size) {
      const plankLen = 128 + Math.floor(rand() * 3) * 64; // 128, 192, or 256 px long wide planks
      const baseColor = config.plankPalette[Math.floor(rand() * config.plankPalette.length)];

      const drawX = Math.max(0, x);
      const drawW = Math.min(size - drawX, x + plankLen - drawX);

      if (drawW > 0) {
        ctx.fillStyle = baseColor;
        ctx.fillRect(drawX, y, drawW, plankHeight);

        // Soft warm bevel highlight along plank top edge
        ctx.fillStyle = config.grainLight;
        ctx.globalAlpha = 0.16;
        ctx.fillRect(drawX, y + 1, drawW, 2);

        // Calm horizontal wood grain fibers
        ctx.globalAlpha = 0.18;
        const grainCount = 3 + Math.floor(rand() * 3);
        for (let g = 0; g < grainCount; g++) {
          const gx = drawX + 6 + Math.floor(rand() * Math.max(1, drawW - 18));
          const gy = y + 5 + Math.floor(rand() * (plankHeight - 10));
          const gw = 18 + Math.floor(rand() * 36);
          ctx.fillStyle = rand() > 0.4 ? config.grainDark : config.grainLight;
          ctx.fillRect(gx, gy, Math.min(gw, drawX + drawW - gx), 2);
        }
        ctx.globalAlpha = 1.0;

        // Subtle low-contrast vertical end-joint seam
        if (x + plankLen < size) {
          ctx.fillStyle = config.seamColor;
          ctx.globalAlpha = 0.42;
          ctx.fillRect(x + plankLen - 1, y, 1, plankHeight);
          ctx.globalAlpha = 1.0;
        }
      }
      x += plankLen;
    }

    // Subtle low-contrast horizontal seam between wide planks
    ctx.fillStyle = config.seamColor;
    ctx.globalAlpha = 0.45;
    ctx.fillRect(0, y + plankHeight - 1, size, 1);
    ctx.globalAlpha = 1.0;
  }

  return configureArchitecturalFloorTexture(canvas, config.name);
}

function createOakFloorTexture(): THREE.CanvasTexture {
  return createWidePlankOakTexture({
    seed: 4201,
    name: 'Tex_Arch_Wide_Oak_Floor',
    baseFill: '#C08249',
    plankPalette: ['#C5874E', '#BC7E45', '#CB8E55', '#B67840', '#C2844B', '#CA8B52'],
    grainDark: '#9E6432',
    grainLight: '#DAB47A',
    seamColor: '#8E582B',
  });
}

function createWarmWallTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const rand = createSeededRandom(1337);

  // Stepped cozy warm toasted-beige plaster bands (matching reference walls)
  const bands = [
    { stop: 0, color: '#D6B89C' },
    { stop: 16, color: '#CFB093' },
    { stop: 64, color: '#C8A88A' },
    { stop: 104, color: '#BFA082' },
  ];

  for (let i = 0; i < bands.length; i++) {
    const nextStop = i + 1 < bands.length ? bands[i + 1].stop : h;
    ctx.fillStyle = bands[i].color;
    ctx.fillRect(0, bands[i].stop, w, nextStop - bands[i].stop);
  }

  // Subtle pixel plaster dither clusters
  ctx.fillStyle = '#B59476';
  for (let i = 0; i < 90; i++) {
    const px = Math.floor(rand() * w);
    const py = Math.floor(rand() * h);
    ctx.fillRect(px, py, 2, 1);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_Warm_Wall');
}

function createWindowVistaTexture(): THREE.CanvasTexture {
  const w = 96;
  const h = 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Crisp pixel daylight sky
  ctx.fillStyle = '#8CC8F6';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#A8D8FA';
  ctx.fillRect(0, 28, w, h - 28);
  ctx.fillStyle = '#C4E6FC';
  ctx.fillRect(0, 56, w, h - 56);

  // Pixel clouds
  ctx.fillStyle = '#F7FBFF';
  ctx.fillRect(14, 14, 28, 8);
  ctx.fillRect(20, 10, 16, 4);
  ctx.fillRect(56, 22, 24, 6);
  ctx.fillRect(60, 18, 14, 4);

  // Distant balcony railing (like reference window)
  ctx.fillStyle = '#BCCCE0';
  ctx.fillRect(0, 62, w, 4);
  ctx.fillRect(0, 84, w, 6);
  for (let bx = 4; bx < w; bx += 8) {
    ctx.fillRect(bx, 66, 3, 18);
  }

  // Sunlit green pixel foliage clusters on sides of window
  const greens = ['#4A8F30', '#63B042', '#7EC850', '#387322'];
  const leaves = [
    [0, 36, 18, 28, 0],
    [4, 24, 14, 16, 1],
    [6, 42, 16, 18, 2],
    [76, 30, 20, 34, 0],
    [72, 44, 18, 22, 1],
    [78, 20, 18, 16, 2],
    [16, 68, 24, 20, 3],
  ];
  for (const [lx, ly, lw, lh, ci] of leaves) {
    ctx.fillStyle = greens[ci];
    ctx.fillRect(lx, ly, lw, lh);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_Window_Vista');
}

function createStrategyBoardTexture(): THREE.CanvasTexture {
  const w = 160;
  const h = 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Porcelain off-white board surface
  ctx.fillStyle = '#F7F4EE';
  ctx.fillRect(0, 0, w, h);

  // Subtle pixel grid
  ctx.fillStyle = '#E6E0D5';
  for (let gx = 8; gx < w; gx += 8) {
    ctx.fillRect(gx, 0, 1, h);
  }
  for (let gy = 8; gy < h; gy += 8) {
    ctx.fillRect(0, gy, w, 1);
  }

  // Top header bar (AI Office Roadmap & Sprint Columns)
  ctx.fillStyle = '#35435A';
  ctx.fillRect(6, 6, w - 12, 12);

  // Header status blocks
  const colColors = ['#D97757', '#E5A93C', '#4D9B82', '#5B7BA6'];
  const colWidth = 34;
  for (let c = 0; c < 4; c++) {
    const cx = 8 + c * (colWidth + 3);
    ctx.fillStyle = colColors[c];
    ctx.fillRect(cx, 8, 24, 8);

    // Column divider line
    if (c > 0) {
      ctx.fillStyle = '#CFC7B8';
      ctx.fillRect(cx - 2, 20, 1, 48);
    }
  }

  // Bottom Gantt / Milestone timeline section
  ctx.fillStyle = '#EAE3D7';
  ctx.fillRect(6, 70, w - 12, 20);
  ctx.fillStyle = '#5B7BA6';
  ctx.fillRect(12, 74, 42, 4);
  ctx.fillStyle = '#4D9B82';
  ctx.fillRect(48, 80, 56, 4);
  ctx.fillStyle = '#D97757';
  ctx.fillRect(96, 74, 48, 4);

  return configurePixelTexture(canvas, 'Tex_Pixel_Strategy_Board');
}

function createMonitorScreenTexture(): THREE.CanvasTexture {
  const w = 96;
  const h = 64;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Crisp pixel desktop / PM workspace UI matching reference blue monitor
  ctx.fillStyle = '#2B5B84';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#3B78A8';
  ctx.fillRect(2, 2, w - 4, h - 8);

  // Left sidebar
  ctx.fillStyle = '#1E3F5C';
  ctx.fillRect(4, 4, 20, h - 12);
  ctx.fillStyle = '#6CC2F7';
  ctx.fillRect(7, 8, 14, 3);
  ctx.fillRect(7, 14, 11, 3);
  ctx.fillRect(7, 20, 13, 3);

  // Main PM Roadmap window
  ctx.fillStyle = '#F4F6F8';
  ctx.fillRect(27, 6, 63, 44);
  ctx.fillStyle = '#E26D5C';
  ctx.fillRect(31, 12, 24, 5);
  ctx.fillStyle = '#F2B84B';
  ctx.fillRect(42, 21, 30, 5);
  ctx.fillStyle = '#52B788';
  ctx.fillRect(55, 30, 28, 5);
  ctx.fillStyle = '#4EA8DE';
  ctx.fillRect(31, 39, 38, 5);

  // Bottom taskbar
  ctx.fillStyle = '#19324A';
  ctx.fillRect(0, h - 6, w, 6);

  return configurePixelTexture(canvas, 'Tex_Pixel_Monitor_UI');
}

function createWovenRugTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const rand = createSeededRandom(9001);

  // Deep slate-indigo rug matching the reference room's central rug!
  ctx.fillStyle = '#3B4F73';
  ctx.fillRect(0, 0, w, h);

  // Outer dark navy border
  ctx.fillStyle = '#2A3956';
  ctx.fillRect(0, 0, w, 6);
  ctx.fillRect(0, h - 6, w, 6);
  ctx.fillRect(0, 0, 6, h);
  ctx.fillRect(w - 6, 0, 6, h);

  // Inner warm cream/amber pixel trim line
  ctx.fillStyle = '#C9B38C';
  ctx.fillRect(8, 8, w - 16, 2);
  ctx.fillRect(8, h - 10, w - 16, 2);
  ctx.fillRect(8, 8, 2, h - 16);
  ctx.fillRect(w - 10, 8, 2, h - 16);

  // Subtle woven pixel texture inside
  for (let y = 12; y < h - 12; y += 2) {
    for (let x = 12; x < w - 12; x += 2) {
      if (rand() > 0.65) {
        ctx.fillStyle = rand() > 0.5 ? '#435980' : '#334566';
        ctx.fillRect(x, y, 2, 1);
      }
    }
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_Woven_Rug');
}

function createPosterArtTexture(variant: 1 | 2): THREE.CanvasTexture {
  const w = 48;
  const h = 64;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // White mat board
  ctx.fillStyle = '#F5EFE6';
  ctx.fillRect(0, 0, w, h);

  if (variant === 1) {
    // Warm sunset strategy poster (like the left poster in reference)
    ctx.fillStyle = '#2B3A55';
    ctx.fillRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = '#E05A47';
    ctx.fillRect(10, 12, 28, 22);
    ctx.fillStyle = '#F4B942';
    ctx.fillRect(16, 18, 16, 16);
    ctx.fillStyle = '#E8D7C3';
    ctx.fillRect(8, 40, 32, 14);
  } else {
    // Cool sky & golden geometric poster (like the right poster in reference)
    ctx.fillStyle = '#4A90C2';
    ctx.fillRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = '#F7F3E9';
    ctx.fillRect(12, 10, 24, 18);
    ctx.fillStyle = '#F2A93B';
    ctx.fillRect(8, 32, 32, 20);
    ctx.fillStyle = '#D96B43';
    ctx.fillRect(14, 38, 20, 10);
  }

  return configurePixelTexture(canvas, `Tex_Pixel_Poster_${variant}`);
}

function createCEOBrainConsoleTexture(): THREE.CanvasTexture {
  const w = 192;
  const h = 112;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep charcoal-slate executive command backing
  ctx.fillStyle = '#18222B';
  ctx.fillRect(0, 0, w, h);

  // Brushed brass inner border
  ctx.fillStyle = '#C99E48';
  ctx.fillRect(2, 2, w - 4, 2);
  ctx.fillRect(2, h - 4, w - 4, 2);
  ctx.fillRect(2, 2, 2, h - 4);
  ctx.fillRect(w - 4, 2, 2, h - 4);

  // Top Header Bar: EXECUTIVE BRAIN CONSOLE [DEMO DATA]
  ctx.fillStyle = '#22313F';
  ctx.fillRect(6, 6, w - 12, 12);
  ctx.fillStyle = '#48B5A3'; // Muted Teal indicator
  ctx.fillRect(9, 9, 28, 6);
  ctx.fillStyle = '#E5A93C'; // Warm Amber DEMO DATA badge
  ctx.fillRect(w - 44, 9, 34, 6);

  // Row 1: 4 Strategic Panels (Org Overview, Active Projects: 3, PM Reports: 2, Strategic Decisions)
  const r1Y = 22;
  const r1H = 40;
  const panelW = 42;
  const r1Accents = ['#48B5A3', '#38BDF8', '#52B788', '#D4A84F'];
  for (let i = 0; i < 4; i++) {
    const px = 6 + i * (panelW + 4);
    ctx.fillStyle = '#212E3B';
    ctx.fillRect(px, r1Y, panelW, r1H);
    // Top accent bar
    ctx.fillStyle = r1Accents[i];
    ctx.fillRect(px + 2, r1Y + 2, panelW - 4, 4);
    // Metric block
    ctx.fillStyle = '#EAE3D5';
    ctx.fillRect(px + 4, r1Y + 10, 22, 6);
    // Pixel progress / status bars
    ctx.fillStyle = r1Accents[i];
    ctx.fillRect(px + 4, r1Y + 20, 30 - i * 3, 4);
    ctx.fillStyle = '#334658';
    ctx.fillRect(px + 4, r1Y + 27, 34, 3);
    ctx.fillRect(px + 4, r1Y + 32, 26, 3);
  }

  // Row 2: 3 Wide Executive Panels (Pending Approval: 1, Telegram Status: Demo, Memory/Knowledge)
  const r2Y = 66;
  const r2H = 38;
  const wPanelW = 56;
  const r2Accents = ['#E5A93C', '#D97757', '#48B5A3'];
  for (let j = 0; j < 3; j++) {
    const px = 6 + j * (wPanelW + 6);
    ctx.fillStyle = '#202C39';
    ctx.fillRect(px, r2Y, wPanelW, r2H);
    ctx.fillStyle = r2Accents[j];
    ctx.fillRect(px + 2, r2Y + 2, wPanelW - 4, 4);
    // Content indicators
    ctx.fillStyle = '#F3EFE6';
    ctx.fillRect(px + 4, r2Y + 10, 34, 5);
    ctx.fillStyle = r2Accents[j];
    ctx.fillRect(px + 4, r2Y + 19, 42, 5);
    ctx.fillStyle = '#394E62';
    ctx.fillRect(px + 4, r2Y + 28, 46, 4);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_CEO_Brain_Console');
}

function createCEOMonitorTexture(variant: 'primary' | 'secondary'): THREE.CanvasTexture {
  const w = 256;
  const h = 160;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep executive slate background
  ctx.fillStyle = '#141F2A';
  ctx.fillRect(0, 0, w, h);

  // Subtle inner frame border
  ctx.strokeStyle = '#2B4257';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, w - 4, h - 4);

  // Top status bar
  ctx.fillStyle = '#1E2F3F';
  ctx.fillRect(4, 4, w - 8, 22);
  ctx.fillStyle = '#D4A84F';
  ctx.fillRect(8, 8, 6, 14);

  ctx.fillStyle = '#F4F1EA';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(
    variant === 'primary' ? 'EXEC BRAIN OS · PRIMARY' : 'EXEC DIGEST · SECONDARY',
    18,
    19
  );

  // DEMO badge on top right
  ctx.fillStyle = '#26463B';
  ctx.fillRect(w - 54, 7, 46, 16);
  ctx.fillStyle = '#6EE7B7';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('DEMO', w - 44, 18);

  if (variant === 'primary') {
    // Left Column: Active Projects (3) & PM Reports (2)
    ctx.fillStyle = '#1D2C3B';
    ctx.fillRect(6, 30, 152, 54);
    ctx.fillStyle = '#48B5A3';
    ctx.fillRect(6, 30, 4, 54);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('ACTIVE PROJECTS', 16, 44);
    ctx.fillStyle = '#F5F2EB';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('3 ACTIVE · 94%', 16, 63);
    ctx.fillStyle = '#48B5A3';
    ctx.fillRect(16, 70, 128, 7);

    ctx.fillStyle = '#1D2C3B';
    ctx.fillRect(6, 88, 152, 52);
    ctx.fillStyle = '#52B788';
    ctx.fillRect(6, 88, 4, 52);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('PM REPORTS INBOX', 16, 102);
    ctx.fillStyle = '#F5F2EB';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('2 RECEIVED', 16, 121);
    ctx.fillStyle = '#52B788';
    ctx.fillRect(16, 128, 104, 6);

    // Right Column: Pending Approvals (1)
    ctx.fillStyle = '#242B35';
    ctx.fillRect(162, 30, 88, 110);
    ctx.fillStyle = '#E5A93C';
    ctx.fillRect(162, 30, 88, 4);
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('APPROVALS', 170, 48);
    ctx.fillStyle = '#F5F2EB';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('1', 198, 78);
    ctx.fillStyle = '#E5A93C';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('AWAITING', 176, 98);
    ctx.fillText('OWNER CEO', 174, 111);
    ctx.fillStyle = '#D4A84F';
    ctx.fillRect(172, 122, 68, 10);
  } else {
    // Secondary Monitor: Weekly Summary & Telegram Demo Status
    ctx.fillStyle = '#1D2C3B';
    ctx.fillRect(6, 30, w - 12, 52);
    ctx.fillStyle = '#D4A84F';
    ctx.fillRect(6, 30, 4, 52);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('WEEKLY EXECUTIVE SUMMARY', 16, 44);
    ctx.fillStyle = '#F5F2EB';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('STATUS: PREPARED', 16, 63);
    ctx.fillStyle = '#D4A84F';
    ctx.fillRect(16, 70, 170, 6);

    ctx.fillStyle = '#1D2C3B';
    ctx.fillRect(6, 88, w - 12, 52);
    ctx.fillStyle = '#48B5A3';
    ctx.fillRect(6, 88, 4, 52);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('TELEGRAM REPORT DIGEST', 16, 102);
    ctx.fillStyle = '#6EE7B7';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('DEMO / NOT SENT', 16, 121);
    ctx.fillStyle = '#394E62';
    ctx.fillRect(16, 128, 148, 6);
  }

  // Bottom dock bar
  ctx.fillStyle = '#0F1720';
  ctx.fillRect(4, h - 16, w - 8, 12);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '9px monospace';
  ctx.fillText('SIMULATED TELEMETRY · DEMO DATA ONLY', 12, h - 7);

  return configurePixelTexture(canvas, `Tex_Pixel_CEO_Monitor_${variant}`);
}

function createCEOOkrBoardTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 88;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F5F0E6';
  ctx.fillRect(0, 0, w, h);

  // Subtle executive grid
  ctx.fillStyle = '#E4DDD0';
  for (let x = 8; x < w; x += 8) ctx.fillRect(x, 0, 1, h);
  for (let y = 8; y < h; y += 8) ctx.fillRect(0, y, w, 1);

  // Dark green & brass header
  ctx.fillStyle = '#254238';
  ctx.fillRect(6, 6, w - 12, 12);
  ctx.fillStyle = '#D4A84F';
  ctx.fillRect(10, 9, 36, 6);

  // 3 OKR Strategic Pillars
  const cols = ['#2D5A4C', '#3B6E8C', '#B87D32'];
  for (let c = 0; c < 3; c++) {
    const cx = 8 + c * 38;
    ctx.fillStyle = cols[c];
    ctx.fillRect(cx, 22, 34, 8);
    ctx.fillStyle = '#E9E2D4';
    ctx.fillRect(cx, 32, 34, 46);
    ctx.fillStyle = cols[c];
    ctx.fillRect(cx + 3, 36, 26, 5);
    ctx.fillRect(cx + 3, 45, 22, 5);
    ctx.fillStyle = '#D4A84F';
    ctx.fillRect(cx + 3, 56, 28, 4);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_CEO_OKR_Board');
}

function createCEOEmeraldRugTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const rand = createSeededRandom(7741);

  // Deep muted executive forest green
  ctx.fillStyle = '#27463B';
  ctx.fillRect(0, 0, w, h);

  // Outer dark border
  ctx.fillStyle = '#1B332A';
  ctx.fillRect(0, 0, w, 6);
  ctx.fillRect(0, h - 6, w, 6);
  ctx.fillRect(0, 0, 6, h);
  ctx.fillRect(w - 6, 0, 6, h);

  // Brushed gold / warm cream double border
  ctx.fillStyle = '#D4AF5A';
  ctx.fillRect(8, 8, w - 16, 2);
  ctx.fillRect(8, h - 10, w - 16, 2);
  ctx.fillRect(8, 8, 2, h - 16);
  ctx.fillRect(w - 10, 8, 2, h - 16);

  ctx.fillStyle = '#B89342';
  ctx.fillRect(14, 14, w - 28, 1);
  ctx.fillRect(14, h - 15, w - 28, 1);
  ctx.fillRect(14, 14, 1, h - 28);
  ctx.fillRect(w - 15, 14, 1, h - 28);

  // Subtle woven pixel motif
  for (let y = 18; y < h - 18; y += 2) {
    for (let x = 18; x < w - 18; x += 2) {
      if (rand() > 0.68) {
        ctx.fillStyle = rand() > 0.5 ? '#2F5447' : '#203B31';
        ctx.fillRect(x, y, 2, 1);
      }
    }
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_CEO_Emerald_Rug');
}

function createCorridorFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = createSeededRandom(5512);

  // Base warm greige architectural limestone
  ctx.fillStyle = '#D5CEC2';
  ctx.fillRect(0, 0, size, size);

  const tilePalette = ['#D8D1C5', '#CFC8BC', '#DDD6CA', '#CBC3B7', '#D3CCC0'];
  const cols = 4;
  const rows = 2;
  const tileW = size / cols;
  const tileH = size / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tx = c * tileW;
      const ty = r * tileH;
      ctx.fillStyle = tilePalette[(r * cols + c) % tilePalette.length];
      ctx.fillRect(tx, ty, tileW, tileH);

      // Subtle warm travertine mineral veins
      ctx.globalAlpha = 0.14;
      for (let v = 0; v < 4; v++) {
        const vx = tx + 10 + Math.floor(rand() * (tileW - 36));
        const vy = ty + 14 + Math.floor(rand() * (tileH - 28));
        const vw = 20 + Math.floor(rand() * 28);
        ctx.fillStyle = rand() > 0.5 ? '#E6E0D5' : '#BEB6A9';
        ctx.fillRect(vx, vy, vw, 2);
      }
      ctx.globalAlpha = 1.0;

      // Soft stone grout joint
      ctx.fillStyle = '#B7AFA2';
      ctx.globalAlpha = 0.45;
      ctx.fillRect(tx + tileW - 2, ty, 2, tileH);
      ctx.fillRect(tx, ty + tileH - 2, tileW, 2);
      ctx.globalAlpha = 1.0;
    }
  }

  // Subtle architectural stone border and brushed brass inlay along North & South corridor edges
  ctx.fillStyle = '#C2B9AB';
  ctx.fillRect(0, 0, size, 22);
  ctx.fillRect(0, size - 22, size, 22);
  ctx.fillStyle = '#C8A45D';
  ctx.globalAlpha = 0.65;
  ctx.fillRect(0, 22, size, 3);
  ctx.fillRect(0, size - 25, size, 3);
  ctx.globalAlpha = 1.0;

  return configureArchitecturalFloorTexture(canvas, 'Tex_Arch_Corridor_Greige_Stone');
}

function createTerraceDeckTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#9C6B3B';
  ctx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 8) {
    ctx.fillStyle = y % 16 === 0 ? '#A87544' : '#8E5F32';
    ctx.fillRect(0, y, size, 7);
    ctx.fillStyle = '#593A1D';
    ctx.fillRect(0, y + 7, size, 1);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_Terrace_Deck');
}

function createUIUXStudioWallTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const rand = createSeededRandom(3031);

  // Soft cream / light warm-gray plaster bands (lighter & fresher than PM/CEO)
  const bands = [
    { stop: 0, color: '#EFEAE1' },
    { stop: 24, color: '#E8E2D7' },
    { stop: 76, color: '#E1DAD0' },
    { stop: 108, color: '#D2DDD6' }, // Subtle muted-sage lower studio wainscot band
  ];

  for (let i = 0; i < bands.length; i++) {
    const nextStop = i + 1 < bands.length ? bands[i + 1].stop : h;
    ctx.fillStyle = bands[i].color;
    ctx.fillRect(0, bands[i].stop, w, nextStop - bands[i].stop);
  }

  // Crisp 1px sage chair-rail divider at y=107
  ctx.fillStyle = '#8FAEA0';
  ctx.fillRect(0, 107, w, 1);

  // Subtle plaster dither pixels
  ctx.fillStyle = '#D7CFC3';
  for (let i = 0; i < 70; i++) {
    const px = Math.floor(rand() * w);
    const py = Math.floor(rand() * 104);
    ctx.fillRect(px, py, 2, 1);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_UIUX_Studio_Wall');
}

function createUIUXDesignMonitorTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 64;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Dark slate Figma-style design workspace background
  ctx.fillStyle = '#1E222B';
  ctx.fillRect(0, 0, w, h);

  // Top toolbar header with DEMO badge
  ctx.fillStyle = '#282D3A';
  ctx.fillRect(0, 0, w, 9);
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(4, 2, 18, 5);
  ctx.fillStyle = '#9582A8';
  ctx.fillRect(25, 2, 14, 5);
  ctx.fillStyle = '#E27D60';
  ctx.fillRect(w - 28, 2, 24, 5);

  // Left Layers / Component Tree sidebar
  ctx.fillStyle = '#252934';
  ctx.fillRect(0, 9, 24, h - 9);
  const layerColors = ['#7CA992', '#9E8FB2', '#E2856E', '#8CC8F6', '#EBB349'];
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = layerColors[i];
    ctx.fillRect(3, 13 + i * 9, 4, 4);
    ctx.fillStyle = '#9CA3AF';
    ctx.fillRect(9, 14 + i * 9, 12, 2);
  }

  // Right Inspector / Style Tokens sidebar
  ctx.fillStyle = '#252934';
  ctx.fillRect(w - 26, 9, 26, h - 9);
  const swatchColors = ['#6B9E88', '#4B8782', '#9582A8', '#E27D60', '#F0C975', '#F5F2EB'];
  for (let i = 0; i < 6; i++) {
    const sx = w - 23 + (i % 3) * 7;
    const sy = 14 + Math.floor(i / 3) * 8;
    ctx.fillStyle = swatchColors[i];
    ctx.fillRect(sx, sy, 5, 5);
  }
  ctx.fillStyle = '#D6D1C7';
  ctx.fillRect(w - 23, 34, 18, 3);
  ctx.fillRect(w - 23, 40, 14, 3);
  ctx.fillRect(w - 23, 46, 20, 6);

  // Center Artboard 1: Desktop UI Frame
  ctx.fillStyle = '#F7F4EE';
  ctx.fillRect(29, 13, 44, 34);
  ctx.fillStyle = '#4B8782';
  ctx.fillRect(29, 13, 44, 6);
  ctx.fillStyle = '#9582A8';
  ctx.fillRect(32, 22, 18, 10);
  ctx.fillStyle = '#E27D60';
  ctx.fillRect(52, 22, 18, 10);
  ctx.fillStyle = '#DCE5DF';
  ctx.fillRect(32, 35, 38, 9);

  // Center Artboard 2: Mobile App Prototype Frame + Flow Line
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(73, 28, 6, 2);
  ctx.fillStyle = '#F7F4EE';
  ctx.fillRect(79, 14, 18, 36);
  ctx.fillStyle = '#9582A8';
  ctx.fillRect(79, 14, 18, 5);
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(81, 22, 14, 8);
  ctx.fillStyle = '#E27D60';
  ctx.fillRect(81, 33, 14, 6);
  ctx.fillStyle = '#D1D5DB';
  ctx.fillRect(81, 42, 14, 4);

  return configurePixelTexture(canvas, 'Tex_Pixel_UIUX_Design_Monitor');
}

function createUIUXPenTabletTexture(): THREE.CanvasTexture {
  const w = 96;
  const h = 64;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F5F2EB';
  ctx.fillRect(0, 0, w, h);

  // Left radial tool dock
  ctx.fillStyle = '#2B303C';
  ctx.fillRect(0, 0, 14, h);
  const tools = ['#6B9E88', '#9582A8', '#E27D60', '#F0C975'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = tools[i];
    ctx.fillRect(3, 6 + i * 12, 8, 8);
  }

  // Vector bezier icon illustration grid on canvas
  ctx.fillStyle = '#E2DDD2';
  for (let gx = 20; gx < w; gx += 8) ctx.fillRect(gx, 0, 1, h);
  for (let gy = 8; gy < h; gy += 8) ctx.fillRect(14, gy, w - 14, 1);

  // Stylized vector emblem in center
  ctx.fillStyle = '#9582A8';
  ctx.fillRect(32, 14, 24, 24);
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(46, 22, 24, 24);
  ctx.fillStyle = '#E27D60';
  ctx.fillRect(30, 12, 4, 4);
  ctx.fillRect(54, 12, 4, 4);
  ctx.fillRect(30, 36, 4, 4);
  ctx.fillRect(68, 44, 4, 4);

  return configurePixelTexture(canvas, 'Tex_Pixel_UIUX_Pen_Tablet');
}

function createUIUXWireframeWallTexture(): THREE.CanvasTexture {
  const w = 160;
  const h = 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Warm studio cork & porcelain split board
  ctx.fillStyle = '#F6F3EC';
  ctx.fillRect(0, 0, w, h);

  // Dot-grid pattern
  ctx.fillStyle = '#DED8CC';
  for (let x = 6; x < w; x += 6) {
    for (let y = 14; y < h; y += 6) {
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Top Header: UX FLOW & WIREFRAMES (DEMO / CONCEPT)
  ctx.fillStyle = '#2E3543';
  ctx.fillRect(4, 4, w - 8, 10);
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(8, 6, 36, 6);
  ctx.fillStyle = '#9582A8';
  ctx.fillRect(48, 6, 28, 6);
  ctx.fillStyle = '#E27D60';
  ctx.fillRect(w - 42, 6, 34, 6);

  // Flow connector lines across the board
  ctx.fillStyle = '#4B8782';
  ctx.fillRect(22, 36, 116, 2);
  ctx.fillRect(48, 36, 2, 34);
  ctx.fillRect(102, 36, 2, 34);
  ctx.fillStyle = '#9582A8';
  ctx.fillRect(48, 68, 56, 2);

  return configurePixelTexture(canvas, 'Tex_Pixel_UIUX_Wireframe_Wall');
}

function createUIUXStyleBoardTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Crisp alabaster style tile backdrop
  ctx.fillStyle = '#F7F5F0';
  ctx.fillRect(0, 0, w, h);

  // Header strip
  ctx.fillStyle = '#292E3B';
  ctx.fillRect(4, 4, w - 8, 10);
  ctx.fillStyle = '#9582A8';
  ctx.fillRect(8, 6, 32, 6);
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(w - 34, 6, 26, 6);

  // Typography specimen block (left half)
  ctx.fillStyle = '#ECE7DD';
  ctx.fillRect(6, 18, 54, 44);
  ctx.fillStyle = '#292E3B';
  ctx.fillRect(10, 22, 22, 8); // Large "Aa" block
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(36, 24, 18, 4);
  ctx.fillStyle = '#4B5563';
  ctx.fillRect(10, 34, 44, 4);
  ctx.fillRect(10, 41, 38, 3);
  ctx.fillRect(10, 47, 42, 3);
  ctx.fillRect(10, 53, 30, 3);

  // Component & Icon Grid (right half + bottom)
  ctx.fillStyle = '#E8EFEA';
  ctx.fillRect(64, 18, 58, 72);
  ctx.fillStyle = '#EFE9F4';
  ctx.fillRect(6, 66, 54, 24);

  return configurePixelTexture(canvas, 'Tex_Pixel_UIUX_Style_Board');
}

function createUIUXStudioRugTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Warm cream woven base
  ctx.fillStyle = '#EFEAE0';
  ctx.fillRect(0, 0, w, h);

  // Outer sage border
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(0, 0, w, 8);
  ctx.fillRect(0, h - 8, w, 8);
  ctx.fillRect(0, 0, 8, h);
  ctx.fillRect(w - 8, 0, 8, h);

  // Inner geometric color-block Bauhaus/Nordic studio pattern
  ctx.fillStyle = '#D8E5DE';
  ctx.fillRect(12, 12, 50, 50);

  ctx.fillStyle = '#9582A8'; // Dusty lavender quadrant
  ctx.fillRect(66, 12, 50, 32);

  ctx.fillStyle = '#E27D60'; // Peach/coral accent block
  ctx.fillRect(66, 48, 24, 28);

  ctx.fillStyle = '#4B8782'; // Soft teal block
  ctx.fillRect(94, 48, 22, 68);

  ctx.fillStyle = '#F0C975'; // Warm pastel amber block
  ctx.fillRect(12, 66, 50, 50);

  ctx.fillStyle = '#6B9E88'; // Center sage motif
  ctx.fillRect(26, 26, 24, 24);
  ctx.fillStyle = '#EFEAE0';
  ctx.fillRect(66, 80, 24, 36);

  // Subtle woven pixel texture lines
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (let y = 4; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_UIUX_Studio_Rug');
}

function createEngFrontendMonitorTexture(variant: 'primary' | 'secondary'): THREE.CanvasTexture {
  const w = 128;
  const h = 80;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Dark slate IDE backdrop
  ctx.fillStyle = '#1E222B';
  ctx.fillRect(0, 0, w, h);

  // Top header bar with window controls
  ctx.fillStyle = '#2A303D';
  ctx.fillRect(0, 0, w, 10);
  ctx.fillStyle = '#E87A5D';
  ctx.fillRect(4, 3, 4, 4);
  ctx.fillStyle = '#F6AD55';
  ctx.fillRect(10, 3, 4, 4);
  ctx.fillStyle = '#68D391';
  ctx.fillRect(16, 3, 4, 4);
  ctx.fillStyle = '#E87A5D'; // Frontend warm coral tab
  ctx.fillRect(24, 2, 28, 6);
  ctx.fillStyle = '#63B3ED';
  ctx.fillRect(56, 2, 24, 6);

  if (variant === 'primary') {
    // Left React Component Tree sidebar
    ctx.fillStyle = '#252A35';
    ctx.fillRect(2, 12, 30, h - 14);
    const treeColors = ['#E87A5D', '#F6AD55', '#68D391', '#63B3ED', '#E87A5D', '#B794F4'];
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = treeColors[i];
      ctx.fillRect(5 + (i % 2) * 4, 15 + i * 9, 18, 4);
      ctx.fillStyle = '#A0AEC0';
      ctx.fillRect(5 + (i % 2) * 4, 20 + i * 9, 12, 2);
    }

    // Center Live UI Component Preview Canvas (Light cream card layout)
    ctx.fillStyle = '#F4EFE6';
    ctx.fillRect(35, 12, 58, h - 14);
    // Hero banner
    ctx.fillStyle = '#E87A5D';
    ctx.fillRect(39, 16, 50, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(42, 19, 26, 4);
    // 2-column responsive component cards
    ctx.fillStyle = '#2D3748';
    ctx.fillRect(39, 31, 24, 19);
    ctx.fillStyle = '#63B3ED';
    ctx.fillRect(42, 34, 18, 6);
    ctx.fillStyle = '#4A90E2';
    ctx.fillRect(65, 31, 24, 19);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(68, 34, 18, 6);
    // Bottom interactive state bar
    ctx.fillStyle = '#68D391';
    ctx.fillRect(39, 53, 50, 17);
    ctx.fillStyle = '#1E222B';
    ctx.fillRect(43, 58, 28, 6);

    // Right CSS Flexbox/Grid Inspector
    ctx.fillStyle = '#252A35';
    ctx.fillRect(96, 12, 30, h - 14);
    ctx.fillStyle = '#F6AD55';
    ctx.fillRect(100, 16, 22, 14);
    ctx.fillStyle = '#63B3ED';
    ctx.fillRect(100, 34, 22, 14);
    ctx.fillStyle = '#E87A5D';
    ctx.fillRect(100, 52, 22, 18);
  } else {
    // Responsive Breakpoint & Design Token Inspector
    ctx.fillStyle = '#252A35';
    ctx.fillRect(4, 14, 56, h - 18);
    ctx.fillStyle = '#E87A5D';
    ctx.fillRect(8, 18, 48, 8);
    ctx.fillStyle = '#F4EFE6';
    ctx.fillRect(8, 30, 22, 38);
    ctx.fillStyle = '#63B3ED';
    ctx.fillRect(34, 30, 22, 38);

    ctx.fillStyle = '#252A35';
    ctx.fillRect(64, 14, 60, h - 18);
    for (let r = 0; r < 6; r++) {
      ctx.fillStyle = r % 2 === 0 ? '#F6AD55' : '#68D391';
      ctx.fillRect(68, 18 + r * 9, 36 + (r % 3) * 6, 4);
    }
  }

  return configurePixelTexture(canvas, `Tex_Pixel_Eng_FE_${variant}`);
}

function createEngBackendMonitorTexture(variant: 'primary' | 'terminal'): THREE.CanvasTexture {
  const w = 128;
  const h = 80;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep technical navy/slate background
  ctx.fillStyle = '#161C26';
  ctx.fillRect(0, 0, w, h);

  // Header bar
  ctx.fillStyle = '#202938';
  ctx.fillRect(0, 0, w, 10);
  ctx.fillStyle = '#4A90E2';
  ctx.fillRect(4, 3, 28, 4);
  ctx.fillStyle = '#48BB78';
  ctx.fillRect(w - 28, 3, 22, 4);

  if (variant === 'primary') {
    // Service Mesh & API Route Topology nodes
    const nodes = [
      { x: 8, y: 16, c: '#E87A5D' },
      { x: 48, y: 14, c: '#3B6E9C' },
      { x: 48, y: 40, c: '#805AD5' },
      { x: 92, y: 26, c: '#2E7D6B' },
    ];
    // Connector pipelines
    ctx.fillStyle = '#63B3ED';
    ctx.fillRect(32, 24, 18, 2);
    ctx.fillRect(38, 24, 2, 26);
    ctx.fillRect(38, 48, 12, 2);
    ctx.fillRect(74, 22, 20, 2);
    ctx.fillRect(74, 48, 20, 2);
    ctx.fillRect(92, 22, 2, 28);

    for (const n of nodes) {
      ctx.fillStyle = n.c;
      ctx.fillRect(n.x, n.y, 28, 18);
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(n.x + 4, n.y + 4, 20, 4);
      ctx.fillStyle = '#CBD5E0';
      ctx.fillRect(n.x + 4, n.y + 10, 14, 3);
    }

    // Bottom latency & RPS telemetry strip
    ctx.fillStyle = '#202938';
    ctx.fillRect(6, 64, w - 12, 12);
    for (let b = 0; b < 18; b++) {
      ctx.fillStyle = b % 5 === 0 ? '#F6AD55' : '#48BB78';
      ctx.fillRect(10 + b * 6, 66, 4, 8);
    }
  } else {
    // Structured Backend Terminal Log Output
    const logColors = ['#48BB78', '#63B3ED', '#A0AEC0', '#48BB78', '#F6AD55', '#63B3ED', '#48BB78', '#B794F4'];
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = logColors[i];
      ctx.fillRect(6, 14 + i * 8, 16, 4);
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(26, 14 + i * 8, 56 + ((i * 13) % 34), 4);
    }
  }

  return configurePixelTexture(canvas, `Tex_Pixel_Eng_BE_${variant}`);
}

function createEngDatabaseMonitorTexture(variant: 'primary' | 'secondary'): THREE.CanvasTexture {
  const w = 128;
  const h = 80;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep emerald-slate database backdrop
  ctx.fillStyle = '#152220';
  ctx.fillRect(0, 0, w, h);

  // Header bar
  ctx.fillStyle = '#1E332F';
  ctx.fillRect(0, 0, w, 10);
  ctx.fillStyle = '#38B2AC';
  ctx.fillRect(4, 3, 30, 4);
  ctx.fillStyle = '#68D391';
  ctx.fillRect(38, 3, 20, 4);

  if (variant === 'primary') {
    // Entity-Relationship Diagram (ERD) relational schema boxes
    const tables = [
      { x: 8, y: 15, hdr: '#2E7D6B' },
      { x: 50, y: 13, hdr: '#319795' },
      { x: 92, y: 17, hdr: '#2F855A' },
      { x: 28, y: 47, hdr: '#2E7D6B' },
      { x: 76, y: 47, hdr: '#319795' },
    ];
    // Foreign key relation lines
    ctx.fillStyle = '#4FD1C5';
    ctx.fillRect(34, 25, 18, 2);
    ctx.fillRect(76, 25, 18, 2);
    ctx.fillRect(62, 35, 2, 16);
    ctx.fillRect(42, 55, 36, 2);

    for (const t of tables) {
      ctx.fillStyle = '#233834';
      ctx.fillRect(t.x, t.y, 28, 25);
      ctx.fillStyle = t.hdr;
      ctx.fillRect(t.x, t.y, 28, 6);
      ctx.fillStyle = '#F6E05E'; // PK key icon
      ctx.fillRect(t.x + 2, t.y + 9, 4, 3);
      ctx.fillStyle = '#E6FFFA';
      ctx.fillRect(t.x + 8, t.y + 9, 17, 3);
      ctx.fillStyle = '#81E6D9';
      ctx.fillRect(t.x + 3, t.y + 14, 18, 3);
      ctx.fillRect(t.x + 3, t.y + 19, 22, 3);
    }
  } else {
    // SQL Query Plan & B-Tree Index Status
    ctx.fillStyle = '#1E332F';
    ctx.fillRect(6, 14, w - 12, 26);
    ctx.fillStyle = '#4FD1C5';
    ctx.fillRect(10, 18, 42, 4);
    ctx.fillStyle = '#F6E05E';
    ctx.fillRect(56, 18, 28, 4);
    ctx.fillStyle = '#CBD5E0';
    ctx.fillRect(10, 26, 88, 4);
    ctx.fillRect(10, 33, 68, 4);

    // Index health bars
    for (let b = 0; b < 4; b++) {
      ctx.fillStyle = '#233834';
      ctx.fillRect(6, 45 + b * 8, w - 12, 5);
      ctx.fillStyle = b === 2 ? '#F6AD55' : '#48BB78';
      ctx.fillRect(6, 45 + b * 8, 76 + b * 10, 5);
    }
  }

  return configurePixelTexture(canvas, `Tex_Pixel_Eng_DB_${variant}`);
}

function createEngBoardTexture(
  kind: 'integration' | 'api_contract' | 'schema' | 'frontend_component'
): THREE.CanvasTexture {
  const w = 160;
  const h = 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Clean technical porcelain whiteboard surface
  ctx.fillStyle = '#F6F4EE';
  ctx.fillRect(0, 0, w, h);

  // Subtle architectural grid dots
  ctx.fillStyle = '#DFDBD0';
  for (let x = 8; x < w; x += 8) {
    for (let y = 16; y < h; y += 8) {
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Top Header Strip
  ctx.fillStyle = '#232936';
  ctx.fillRect(4, 4, w - 8, 10);

  if (kind === 'integration') {
    // 4-Stage Pipeline: FRONTEND -> API -> BACKEND -> DATABASE
    const stages = [
      { x: 8, c: '#E87A5D', bg: '#FCEEE9' },
      { x: 45, c: '#D69E2E', bg: '#FEFCBF' },
      { x: 82, c: '#3B6E9C', bg: '#EBF8FF' },
      { x: 119, c: '#2E7D6B', bg: '#E6FFFA' },
    ];
    ctx.fillStyle = '#E87A5D';
    ctx.fillRect(8, 6, 30, 6);
    ctx.fillStyle = '#D69E2E';
    ctx.fillRect(44, 6, 30, 6);
    ctx.fillStyle = '#3B6E9C';
    ctx.fillRect(80, 6, 34, 6);
    ctx.fillStyle = '#2E7D6B';
    ctx.fillRect(120, 6, 32, 6);

    // Horizontal pipeline bus
    ctx.fillStyle = '#2D3748';
    ctx.fillRect(20, 44, 120, 4);

    for (const s of stages) {
      ctx.fillStyle = s.bg;
      ctx.fillRect(s.x, 22, 32, 46);
      ctx.fillStyle = s.c;
      ctx.fillRect(s.x, 22, 32, 8);
      ctx.fillStyle = '#2D3748';
      ctx.fillRect(s.x + 4, 34, 24, 4);
      ctx.fillRect(s.x + 4, 42, 20, 4);
      ctx.fillRect(s.x + 4, 50, 24, 4);
      ctx.fillRect(s.x + 4, 58, 16, 4);
    }

    // Bottom review checklist strip
    ctx.fillStyle = '#EDE9DF';
    ctx.fillRect(8, 74, w - 16, 16);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#38A169';
      ctx.fillRect(14 + i * 36, 79, 6, 6);
      ctx.fillStyle = '#2D3748';
      ctx.fillRect(23 + i * 36, 80, 20, 4);
    }
  } else if (kind === 'api_contract') {
    // End-to-End Service Flow + REST/gRPC Endpoint Contracts
    ctx.fillStyle = '#3B6E9C';
    ctx.fillRect(8, 6, 44, 6);
    ctx.fillStyle = '#E87A5D';
    ctx.fillRect(56, 6, 26, 6);
    ctx.fillStyle = '#2E7D6B';
    ctx.fillRect(86, 6, 32, 6);

    // Top mini flow: FE -> API GW -> SERVICES -> DB
    const flowNodes = [
      { x: 10, c: '#E87A5D' },
      { x: 46, c: '#D69E2E' },
      { x: 82, c: '#3B6E9C' },
      { x: 118, c: '#2E7D6B' },
    ];
    ctx.fillStyle = '#4A5568';
    ctx.fillRect(22, 25, 114, 2);
    for (const fn of flowNodes) {
      ctx.fillStyle = fn.c;
      ctx.fillRect(fn.x, 19, 30, 14);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(fn.x + 4, 23, 22, 5);
    }

    for (let r = 0; r < 3; r++) {
      const y = 39 + r * 17;
      ctx.fillStyle = r === 0 ? '#3182CE' : r === 1 ? '#38A169' : '#D69E2E';
      ctx.fillRect(10, y, 24, 11);
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(38, y, 66, 11);
      ctx.fillStyle = '#2D3748';
      ctx.fillRect(42, y + 3, 54, 4);
      ctx.fillStyle = '#EDF2F7';
      ctx.fillRect(108, y, 42, 11);
      ctx.fillStyle = '#3B6E9C';
      ctx.fillRect(112, y + 3, 30, 4);
    }
  } else if (kind === 'schema') {
    ctx.fillStyle = '#2E7D6B';
    ctx.fillRect(8, 6, 48, 6);
    ctx.fillStyle = '#38B2AC';
    ctx.fillRect(62, 6, 32, 6);

    // Relational join connector lines
    ctx.fillStyle = '#319795';
    ctx.fillRect(46, 42, 22, 2);
    ctx.fillRect(94, 52, 22, 2);

    // Schema blocks
    for (let col = 0; col < 3; col++) {
      const x = 10 + col * 48;
      ctx.fillStyle = '#E6FFFA';
      ctx.fillRect(x, 22, 42, 64);
      ctx.fillStyle = '#2E7D6B';
      ctx.fillRect(x, 22, 42, 8);
      for (let ln = 0; ln < 5; ln++) {
        ctx.fillStyle = ln === 0 ? '#D69E2E' : '#2C7A7B';
        ctx.fillRect(x + 4, 35 + ln * 9, 8, 4);
        ctx.fillStyle = '#2D3748';
        ctx.fillRect(x + 15, 35 + ln * 9, 22, 4);
      }
    }
  } else {
    // Frontend Component Hierarchy & Responsive Breakpoint Board
    ctx.fillStyle = '#E87A5D';
    ctx.fillRect(8, 6, 46, 6);
    ctx.fillStyle = '#F6AD55';
    ctx.fillRect(60, 6, 30, 6);

    ctx.fillStyle = '#FCEEE9';
    ctx.fillRect(10, 20, 66, 68);
    ctx.fillStyle = '#E87A5D';
    ctx.fillRect(16, 26, 54, 14);
    ctx.fillStyle = '#2D3748';
    ctx.fillRect(16, 46, 25, 34);
    ctx.fillStyle = '#4A90E2';
    ctx.fillRect(45, 46, 25, 34);

    ctx.fillStyle = '#EDF2F7';
    ctx.fillRect(82, 20, 68, 68);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#E87A5D' : '#3B6E9C';
      ctx.fillRect(88, 26 + i * 14, 56, 9);
    }
  }

  return configurePixelTexture(canvas, `Tex_Pixel_Eng_Board_${kind}`);
}

function createEngStudioRugTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 192;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Warm charcoal-oatmeal woven runner base
  ctx.fillStyle = '#E2DDD3';
  ctx.fillRect(0, 0, w, h);

  // Outer architectural slate border
  ctx.fillStyle = '#2F3744';
  ctx.fillRect(0, 0, w, 6);
  ctx.fillRect(0, h - 6, w, 6);
  ctx.fillRect(0, 0, 6, h);
  ctx.fillRect(w - 6, 0, 6, h);

  // Subtle woven geometric blocks (North Coral, Mid Navy, South Teal)
  ctx.fillStyle = '#E87A5D';
  ctx.fillRect(14, 16, w - 28, 12);
  ctx.fillStyle = '#3B6E9C';
  ctx.fillRect(14, 90, w - 28, 12);
  ctx.fillStyle = '#2E7D6B';
  ctx.fillRect(14, h - 28, w - 28, 12);

  // Subtle horizontal weave lines
  ctx.fillStyle = 'rgba(47, 55, 68, 0.10)';
  for (let y = 10; y < h - 10; y += 6) {
    ctx.fillRect(8, y, w - 16, 1);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_Eng_Studio_Rug');
}

function createEngZoneRugTexture(zone: 'frontend' | 'backend' | 'database'): THREE.CanvasTexture {
  const w = 128;
  const h = 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const palette =
    zone === 'frontend'
      ? { base: '#E9E2D7', border: '#5A3E36', accent: '#E87A5D', secondary: '#D99B52' }
      : zone === 'backend'
        ? { base: '#DEE3E8', border: '#2D3A4B', accent: '#3B6E9C', secondary: '#5C7089' }
        : { base: '#DCE6E2', border: '#233D36', accent: '#2E7D6B', secondary: '#4B8782' };

  ctx.fillStyle = palette.base;
  ctx.fillRect(0, 0, w, h);

  // Border frame
  ctx.fillStyle = palette.border;
  ctx.fillRect(0, 0, w, 5);
  ctx.fillRect(0, h - 5, w, 5);
  ctx.fillRect(0, 0, 5, h);
  ctx.fillRect(w - 5, 0, 5, h);

  // Inner accent stripe
  ctx.fillStyle = palette.accent;
  ctx.fillRect(10, 10, w - 20, 6);
  ctx.fillRect(10, h - 16, w - 20, 6);

  ctx.fillStyle = palette.secondary;
  ctx.fillRect(18, 22, w - 36, h - 44);

  ctx.fillStyle = palette.base;
  ctx.fillRect(24, 28, w - 48, h - 56);

  return configurePixelTexture(canvas, `Tex_Pixel_Eng_Zone_Rug_${zone}`);
}

function createResearchWallParchmentTexture(): THREE.CanvasTexture {
  const w = 128;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Warm parchment cream plaster upper wall
  ctx.fillStyle = '#EFE9DD';
  ctx.fillRect(0, 0, w, h);

  // Subtle vertical academic linen texture lines
  ctx.fillStyle = 'rgba(130, 114, 92, 0.06)';
  for (let x = 0; x < w; x += 4) {
    ctx.fillRect(x, 0, 1, h);
  }

  // Lower wainscoting sage-walnut dado band
  ctx.fillStyle = '#D7CFC0';
  ctx.fillRect(0, h - 28, w, 28);
  ctx.fillStyle = '#75897B';
  ctx.fillRect(0, h - 30, w, 2);

  return configurePixelTexture(canvas, 'Tex_Pixel_Research_Wall_Parchment');
}

function createResearchMonitorTexture(): THREE.CanvasTexture {
  const w = 160;
  const h = 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep scholarly slate-teal background
  ctx.fillStyle = '#182428';
  ctx.fillRect(0, 0, w, h);

  // Top header bar with DEMO badge
  ctx.fillStyle = '#22353B';
  ctx.fillRect(0, 0, w, 12);
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(4, 3, 48, 6);
  ctx.fillStyle = '#D4A84F'; // Amber DEMO pill
  ctx.fillRect(w - 38, 2, 34, 8);
  ctx.fillStyle = '#182428';
  ctx.fillRect(w - 34, 4, 26, 4);

  // Left Pane: Source Corpus Index Tree
  ctx.fillStyle = '#1F3036';
  ctx.fillRect(4, 15, 44, h - 19);
  const indexColors = ['#D4A84F', '#6B9E88', '#5C9BD6', '#E06D53', '#6B9E88', '#D4A84F'];
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = indexColors[i];
    ctx.fillRect(8, 19 + i * 12, 8, 6);
    ctx.fillStyle = '#E6E1D6';
    ctx.fillRect(19, 19 + i * 12, 24, 3);
    ctx.fillStyle = '#8FA6AC';
    ctx.fillRect(19, 23 + i * 12, 18, 2);
  }

  // Center Pane: Cross-Document Comparison Split View (Warm parchment manuscript pages)
  ctx.fillStyle = '#F3EFE6';
  ctx.fillRect(52, 15, 64, 54);
  ctx.fillStyle = '#D9D2C5';
  ctx.fillRect(83, 15, 2, 54);
  // Highlighted citation blocks
  ctx.fillStyle = '#2B4C59';
  ctx.fillRect(56, 19, 22, 5);
  ctx.fillRect(88, 19, 22, 5);
  ctx.fillStyle = '#F0C975';
  ctx.fillRect(56, 28, 24, 6);
  ctx.fillRect(88, 34, 24, 6);
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(56, 46, 22, 6);
  ctx.fillRect(88, 46, 22, 6);
  for (let ln = 0; ln < 5; ln++) {
    ctx.fillStyle = '#526066';
    ctx.fillRect(56, 37 + ln * 6, 20, 2);
    ctx.fillRect(88, 27 + ln * 6, 20, 2);
  }

  // Bottom Provenance Confidence Strip
  ctx.fillStyle = '#22353B';
  ctx.fillRect(52, 72, 64, 20);
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(56, 76, 46, 5);
  ctx.fillStyle = '#D4A84F';
  ctx.fillRect(56, 84, 38, 4);

  // Right Pane: Citation Graph Mini-Map
  ctx.fillStyle = '#1F3036';
  ctx.fillRect(120, 15, 36, h - 19);
  ctx.fillStyle = '#D4A84F';
  ctx.fillRect(134, 26, 8, 8);
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(124, 46, 8, 8);
  ctx.fillRect(144, 46, 8, 8);
  ctx.fillStyle = '#5C9BD6';
  ctx.fillRect(134, 68, 8, 8);
  ctx.fillStyle = '#8FA6AC';
  ctx.fillRect(137, 34, 2, 34);
  ctx.fillRect(128, 49, 20, 2);

  return configurePixelTexture(canvas, 'Tex_Pixel_Research_Monitor_Screen');
}

function createResearchReferenceTabletTexture(): THREE.CanvasTexture {
  const w = 96;
  const h = 64;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F5F0E4';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#26383E';
  ctx.fillRect(0, 0, w, 10);
  ctx.fillStyle = '#D4A84F';
  ctx.fillRect(w - 26, 2, 22, 6);

  // Annotated taxonomy cards
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(6, 14, 38, 18);
  ctx.fillStyle = '#3B6E9C';
  ctx.fillRect(50, 14, 40, 18);
  ctx.fillStyle = '#D4A84F';
  ctx.fillRect(6, 36, 84, 22);
  ctx.fillStyle = '#26383E';
  ctx.fillRect(10, 41, 64, 4);
  ctx.fillRect(10, 48, 48, 4);

  return configurePixelTexture(canvas, 'Tex_Pixel_Research_Reference_Tablet');
}

function createResearchKnowledgeAtlasTexture(): THREE.CanvasTexture {
  const w = 256;
  const h = 144;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep architectural slate-emerald & warm parchment hybrid knowledge board
  ctx.fillStyle = '#1B282C';
  ctx.fillRect(0, 0, w, h);

  // Subtle coordinate dot grid
  ctx.fillStyle = '#2A3D42';
  for (let x = 8; x < w; x += 8) {
    for (let y = 18; y < h; y += 8) {
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Top Header Banner: SHARED BRAIN KNOWLEDGE ATLAS — DEMO
  ctx.fillStyle = '#25373D';
  ctx.fillRect(4, 4, w - 8, 14);
  ctx.fillStyle = '#D4A84F';
  ctx.fillRect(8, 7, 68, 8);
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(82, 7, 54, 8);
  // Explicit Amber DEMO badge on right
  ctx.fillStyle = '#E09F3E';
  ctx.fillRect(w - 48, 6, 40, 10);
  ctx.fillStyle = '#1B282C';
  ctx.fillRect(w - 44, 8, 32, 6);

  // Connecting golden & teal knowledge pathways linking the 3 Brain Layer Columns to the Central Core
  ctx.fillStyle = '#D4A84F';
  ctx.fillRect(44, 56, 168, 3);
  ctx.fillRect(44, 56, 3, 52);
  ctx.fillRect(126, 56, 4, 56);
  ctx.fillRect(210, 56, 3, 52);
  ctx.fillStyle = '#4FD1C5';
  ctx.fillRect(44, 106, 168, 2);

  // 3 Layer Zone Backdrops (Left: ORG BRAIN, Center: PROJECT BRAIN, Right: AGENT WORKING CONTEXT)
  const layers = [
    { x: 10, hdr: '#3B6E9C', bg: '#223442', accent: '#63B3ED' }, // Layer 01: Organization Brain
    { x: 92, hdr: '#2E7D6B', bg: '#203835', accent: '#68D391' }, // Layer 02: Project Brain
    { x: 174, hdr: '#B7791F', bg: '#382F20', accent: '#F6AD55' }, // Layer 03: Agent Working Context
  ];

  for (const l of layers) {
    ctx.fillStyle = l.bg;
    ctx.fillRect(l.x, 22, 72, 68);
    ctx.fillStyle = l.hdr;
    ctx.fillRect(l.x, 22, 72, 11);
    ctx.fillStyle = '#F5F0E4';
    ctx.fillRect(l.x + 4, 25, 46, 5);
    ctx.fillStyle = '#E09F3E';
    ctx.fillRect(l.x + 54, 25, 14, 5);

    // Sub-nodes inside each layer
    ctx.fillStyle = l.accent;
    ctx.fillRect(l.x + 6, 38, 26, 18);
    ctx.fillRect(l.x + 38, 38, 28, 18);
    ctx.fillStyle = '#F3EFE6';
    ctx.fillRect(l.x + 6, 62, 60, 22);
    ctx.fillStyle = '#2D3748';
    ctx.fillRect(l.x + 10, 66, 48, 4);
    ctx.fillRect(l.x + 10, 74, 36, 4);
  }

  // Bottom Strip: Provenance, Recency & Validation Indicators (DEMO)
  ctx.fillStyle = '#24363C';
  ctx.fillRect(10, 96, w - 20, 40);
  const pills = [
    { x: 16, c: '#48BB78', w: 68 },
    { x: 92, c: '#4FD1C5', w: 72 },
    { x: 172, c: '#F6AD55', w: 68 },
  ];
  for (const p of pills) {
    ctx.fillStyle = '#1B282C';
    ctx.fillRect(p.x, 102, p.w, 28);
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x + 4, 106, 12, 8);
    ctx.fillStyle = '#E6E1D6';
    ctx.fillRect(p.x + 20, 106, p.w - 26, 5);
    ctx.fillStyle = '#9FB3B8';
    ctx.fillRect(p.x + 20, 115, p.w - 32, 4);
    ctx.fillStyle = p.c;
    ctx.fillRect(p.x + 4, 123, p.w - 10, 3);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_Research_Knowledge_Atlas');
}

function createResearchLayerPanelTexture(
  layer: 'org_brain' | 'project_brain' | 'agent_context'
): THREE.CanvasTexture {
  const w = 96;
  const h = 64;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const cfg =
    layer === 'org_brain'
      ? { bg: '#203240', hdr: '#3B6E9C', node: '#63B3ED', badge: '#D4A84F' }
      : layer === 'project_brain'
        ? { bg: '#1E3632', hdr: '#2E7D6B', node: '#68D391', badge: '#D4A84F' }
        : { bg: '#362D1E', hdr: '#B7791F', node: '#F6AD55', badge: '#4FD1C5' };

  ctx.fillStyle = cfg.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = cfg.hdr;
  ctx.fillRect(0, 0, w, 12);
  ctx.fillStyle = '#F5F0E4';
  ctx.fillRect(4, 3, 52, 6);
  ctx.fillStyle = cfg.badge;
  ctx.fillRect(w - 26, 3, 22, 6);

  // Knowledge card clusters
  ctx.fillStyle = '#F3EFE6';
  ctx.fillRect(6, 16, 40, 20);
  ctx.fillRect(50, 16, 40, 20);
  ctx.fillStyle = cfg.node;
  ctx.fillRect(8, 18, 36, 5);
  ctx.fillRect(52, 18, 36, 5);
  ctx.fillStyle = '#2D3748';
  ctx.fillRect(8, 26, 28, 3);
  ctx.fillRect(52, 26, 30, 3);

  // Bottom provenance bar
  ctx.fillStyle = '#152024';
  ctx.fillRect(6, 40, w - 12, 18);
  ctx.fillStyle = cfg.node;
  ctx.fillRect(10, 44, 54, 4);
  ctx.fillStyle = '#CBD5E0';
  ctx.fillRect(10, 51, 68, 3);

  return configurePixelTexture(canvas, `Tex_Pixel_Research_Layer_${layer}`);
}

function createResearchEvidenceBoardTexture(): THREE.CanvasTexture {
  const w = 160;
  const h = 112;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Warm bulletin cork & dark slate split verification pinboard
  ctx.fillStyle = '#C59B6D';
  ctx.fillRect(0, 0, w, h);

  // Subtle cork grain speckles
  ctx.fillStyle = '#B3885B';
  for (let x = 4; x < w; x += 6) {
    for (let y = 16; y < h; y += 6) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // Top Header Strip: EVIDENCE & SOURCE VERIFICATION [DEMO]
  ctx.fillStyle = '#253238';
  ctx.fillRect(4, 4, w - 8, 12);
  ctx.fillStyle = '#6B9E88';
  ctx.fillRect(8, 7, 64, 6);
  ctx.fillStyle = '#D4A84F';
  ctx.fillRect(w - 38, 6, 30, 8);

  // Red/brass provenance string lines connecting evidence cards
  ctx.fillStyle = '#C84B31';
  ctx.fillRect(28, 36, 104, 2);
  ctx.fillRect(46, 36, 2, 46);
  ctx.fillRect(112, 36, 2, 46);
  ctx.fillStyle = '#2E7D6B';
  ctx.fillRect(46, 80, 68, 2);

  // Pinned Evidence & Citation Cards
  const cards = [
    { x: 10, y: 22, w: 42, h: 28, bg: '#F7F3E8', pin: '#C84B31' },
    { x: 60, y: 20, w: 42, h: 30, bg: '#EFECE4', pin: '#2E7D6B' },
    { x: 110, y: 22, w: 40, h: 28, bg: '#F7F3E8', pin: '#D4A84F' },
    { x: 14, y: 58, w: 46, h: 32, bg: '#FEFCBF', pin: '#3B6E9C' },
    { x: 68, y: 56, w: 44, h: 34, bg: '#E6FFFA', pin: '#2E7D6B' },
    { x: 118, y: 58, w: 34, h: 32, bg: '#FCEEE9', pin: '#C84B31' },
  ];

  for (const c of cards) {
    ctx.fillStyle = c.bg;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = c.pin;
    ctx.fillRect(c.x + Math.floor(c.w / 2) - 2, c.y + 2, 4, 4);
    ctx.fillStyle = '#2D3748';
    ctx.fillRect(c.x + 4, c.y + 9, c.w - 8, 4);
    ctx.fillStyle = '#718096';
    ctx.fillRect(c.x + 4, c.y + 16, c.w - 12, 3);
    ctx.fillRect(c.x + 4, c.y + 21, c.w - 16, 3);
  }

  // Bottom Timeline Strip
  ctx.fillStyle = '#253238';
  ctx.fillRect(8, 96, w - 16, 12);
  for (let t = 0; t < 6; t++) {
    ctx.fillStyle = t % 2 === 0 ? '#68D391' : '#F6AD55';
    ctx.fillRect(14 + t * 22, 100, 14, 4);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_Research_Evidence_Board');
}

function createResearchAtelierRugTexture(): THREE.CanvasTexture {
  const w = 160;
  const h = 160;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Warm parchment woven base
  ctx.fillStyle = '#EAE2D3';
  ctx.fillRect(0, 0, w, h);

  // Outer deep library walnut & dusty-teal border
  ctx.fillStyle = '#36524E';
  ctx.fillRect(0, 0, w, 10);
  ctx.fillRect(0, h - 10, w, 10);
  ctx.fillRect(0, 0, 10, h);
  ctx.fillRect(w - 10, 0, 10, h);

  // Antique brass inner key border
  ctx.fillStyle = '#C99A49';
  ctx.fillRect(12, 12, w - 24, 4);
  ctx.fillRect(12, h - 16, w - 24, 4);
  ctx.fillRect(12, 12, 4, h - 24);
  ctx.fillRect(w - 16, 12, 4, h - 24);

  // Muted sage library field
  ctx.fillStyle = '#D6DFD8';
  ctx.fillRect(20, 20, w - 40, h - 40);

  // Scholarly geometric medallion motif in center
  ctx.fillStyle = '#6B8E7B';
  ctx.fillRect(44, 44, w - 88, h - 88);
  ctx.fillStyle = '#EFE9DD';
  ctx.fillRect(54, 54, w - 108, h - 108);
  ctx.fillStyle = '#8C4A3B'; // Burgundy scholarly emblem
  ctx.fillRect(68, 68, w - 136, h - 136);

  // Subtle horizontal weave lines
  ctx.fillStyle = 'rgba(54, 82, 78, 0.08)';
  for (let y = 14; y < h - 14; y += 4) {
    ctx.fillRect(14, y, w - 28, 1);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_Research_Atelier_Rug');
}

function createCentralHubParquetTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = createSeededRandom(8801);

  // Warm natural oak herringbone / chevron-inspired parquet for the 12x12 Central Hub commons
  ctx.fillStyle = '#C78E54';
  ctx.fillRect(0, 0, size, size);

  const leftTonePalette = ['#CC945A', '#C48A50', '#D19960', '#BF854B'];
  const rightTonePalette = ['#B97E45', '#B2773E', '#C0854B', '#AC7139'];
  const cols = 8; // 8 chevron columns across 12u = 1.5u wide chevron bays
  const colW = size / cols;
  const chevronH = 32; // Large, calm architectural chevron blocks
  const numRows = Math.ceil(size / chevronH) + 2;

  for (let c = 0; c < cols; c++) {
    const isLeftSlant = c % 2 === 0;
    const x0 = c * colW;
    const x1 = x0 + colW;

    for (let r = -1; r < numRows; r++) {
      const yBase = r * chevronH;
      const tonePool = isLeftSlant ? leftTonePalette : rightTonePalette;
      const fill = tonePool[Math.floor(rand() * tonePool.length)];

      ctx.beginPath();
      if (isLeftSlant) {
        ctx.moveTo(x0, yBase + chevronH * 0.5);
        ctx.lineTo(x1, yBase);
        ctx.lineTo(x1, yBase + chevronH);
        ctx.lineTo(x0, yBase + chevronH * 1.5);
      } else {
        ctx.moveTo(x0, yBase);
        ctx.lineTo(x1, yBase + chevronH * 0.5);
        ctx.lineTo(x1, yBase + chevronH * 1.5);
        ctx.lineTo(x0, yBase + chevronH);
      }
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();

      // Subtle low-contrast chevron joint line
      ctx.strokeStyle = 'rgba(122, 76, 38, 0.28)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Subtle vertical spine seam between chevron columns
    ctx.fillStyle = 'rgba(115, 70, 34, 0.32)';
    ctx.fillRect(x1 - 1, 0, 1, size);
  }

  return configureArchitecturalFloorTexture(canvas, 'Tex_Arch_Central_Hub_Herringbone_Parquet');
}

function createWarmGreigeStoneTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = createSeededRandom(8802);

  ctx.fillStyle = '#D5CEC2';
  ctx.fillRect(0, 0, size, size);

  const stonePalette = ['#D8D1C5', '#CFC8BC', '#DDD6CA', '#CBC3B7', '#D3CCC0'];
  const grid = 4; // Large-format architectural stone slabs
  const tileSize = size / grid;

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const tx = c * tileSize;
      const ty = r * tileSize;
      ctx.fillStyle = stonePalette[(r * grid + c + Math.floor(rand() * 2)) % stonePalette.length];
      ctx.fillRect(tx, ty, tileSize, tileSize);

      // Subtle travertine mineral texture
      ctx.globalAlpha = 0.14;
      for (let v = 0; v < 5; v++) {
        const vx = tx + 10 + Math.floor(rand() * (tileSize - 36));
        const vy = ty + 10 + Math.floor(rand() * (tileSize - 24));
        const vw = 18 + Math.floor(rand() * 28);
        ctx.fillStyle = rand() > 0.5 ? '#E6E0D5' : '#BEB6A9';
        ctx.fillRect(vx, vy, vw, 2);
      }
      ctx.globalAlpha = 1.0;

      // Soft stone joint line
      ctx.fillStyle = '#B7AFA2';
      ctx.globalAlpha = 0.42;
      ctx.fillRect(tx + tileSize - 2, ty, 2, tileSize);
      ctx.fillRect(tx, ty + tileSize - 2, tileSize, 2);
      ctx.globalAlpha = 1.0;
    }
  }

  return configureArchitecturalFloorTexture(canvas, 'Tex_Arch_Warm_Greige_Large_Stone');
}

function createHubMeetingRugTexture(): THREE.CanvasTexture {
  const w = 256;
  const h = 160;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep muted slate-navy outer border
  ctx.fillStyle = '#2B3B4E';
  ctx.fillRect(0, 0, w, h);

  // Brushed warm gold woven accent frame
  ctx.fillStyle = '#C9A45C';
  ctx.fillRect(10, 10, w - 20, h - 20);

  // Soft warm oatmeal-greige inner field
  ctx.fillStyle = '#E6E0D4';
  ctx.fillRect(14, 14, w - 28, h - 28);

  // Subtle architectural geometric inner border in muted slate
  ctx.strokeStyle = 'rgba(47, 67, 90, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 22, w - 48, h - 44);

  // Subtle horizontal textile weave lines
  ctx.fillStyle = 'rgba(168, 156, 138, 0.16)';
  for (let y = 16; y < h - 16; y += 4) {
    ctx.fillRect(16, y, w - 32, 1);
  }

  return configureArchitecturalFloorTexture(canvas, 'Tex_Arch_Central_Hub_Meeting_Rug');
}

function createHubReviewDisplayTexture(): THREE.CanvasTexture {
  const w = 160;
  const h = 96;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Deep slate executive dashboard background
  ctx.fillStyle = '#18222F';
  ctx.fillRect(0, 0, w, h);

  // Top header bar
  ctx.fillStyle = '#223142';
  ctx.fillRect(0, 0, w, 16);
  ctx.fillStyle = '#D4A84F';
  ctx.fillRect(6, 5, 28, 6);
  ctx.fillStyle = '#5CA87C';
  ctx.fillRect(w - 34, 5, 28, 6);

  // 3 architectural sync columns (Strategy & Brain | UI/UX & Engineering | QA & Release)
  const colColors = ['#3B78A8', '#5CA87C', '#D4A84F'];
  for (let c = 0; c < 3; c++) {
    const cx = 8 + c * 49;
    ctx.fillStyle = '#202D3D';
    ctx.fillRect(cx, 22, 44, 66);
    ctx.fillStyle = colColors[c];
    ctx.fillRect(cx, 22, 44, 5);

    // Status cards inside column
    ctx.fillStyle = '#2C3E52';
    ctx.fillRect(cx + 4, 32, 36, 14);
    ctx.fillRect(cx + 4, 50, 36, 14);
    ctx.fillRect(cx + 4, 68, 36, 14);

    ctx.fillStyle = '#DCE5EE';
    ctx.fillRect(cx + 7, 36, 22, 3);
    ctx.fillRect(cx + 7, 54, 26, 3);
    ctx.fillRect(cx + 7, 72, 18, 3);
  }

  return configurePixelTexture(canvas, 'Tex_Pixel_Central_Hub_Review_Display');
}

export function createPixelMaterialLibrary(): MaterialLibraryInstance {
  const textures: Record<string, THREE.CanvasTexture> = {
    oakFloor: createOakFloorTexture(),
    floorResearchOak: createWidePlankOakTexture({
      seed: 4301,
      name: 'Tex_Arch_Research_Academic_Oak_Floor',
      baseFill: '#B97B45',
      plankPalette: ['#BE804A', '#B57640', '#C48650', '#AE703B', '#BA7C46'],
      grainDark: '#925B2C',
      grainLight: '#D5AC74',
      seamColor: '#865227',
    }),
    floorPMHoneyOak: createWidePlankOakTexture({
      seed: 4302,
      name: 'Tex_Arch_PM_Honey_Oak_Floor',
      baseFill: '#C4854C',
      plankPalette: ['#C98A51', '#BF8047', '#CE9057', '#B97A42', '#C5864D'],
      grainDark: '#9E6432',
      grainLight: '#DFB87E',
      seamColor: '#8E582B',
    }),
    floorCEOWalnutOak: createWidePlankOakTexture({
      seed: 4303,
      name: 'Tex_Arch_CEO_Walnut_Oak_Floor',
      baseFill: '#9E6336',
      plankPalette: ['#A4683B', '#995E31', '#AA6E40', '#93582C', '#9F6437'],
      grainDark: '#784620',
      grainLight: '#BC8858',
      seamColor: '#6E3F1C',
    }),
    floorUIUXLightOak: createWidePlankOakTexture({
      seed: 4304,
      name: 'Tex_Arch_UIUX_Light_Natural_Oak_Floor',
      baseFill: '#CFA26E',
      plankPalette: ['#D4A773', '#CAA06A', '#D9AC78', '#C49863', '#D1A470'],
      grainDark: '#AA7D4B',
      grainLight: '#E8C699',
      seamColor: '#9E7242',
    }),
    floorEngineeringMediumOak: createWidePlankOakTexture({
      seed: 4305,
      name: 'Tex_Arch_Engineering_Medium_Oak_Floor',
      baseFill: '#B67843',
      plankPalette: ['#BB7D48', '#B1733E', '#C1834E', '#AB6D39', '#B77944'],
      grainDark: '#8F582B',
      grainLight: '#D2A66E',
      seamColor: '#824F25',
    }),
    floorQADevOpsWarmOak: createWidePlankOakTexture({
      seed: 4306,
      name: 'Tex_Arch_QADevOps_Warm_Oak_Floor',
      baseFill: '#BD7E47',
      plankPalette: ['#C2834C', '#B87942', '#C88952', '#B2733D', '#BE7F48'],
      grainDark: '#965E2E',
      grainLight: '#D8AF76',
      seamColor: '#885428',
    }),
    centralHubParquet: createCentralHubParquetTexture(),
    warmGreigeStone: createWarmGreigeStoneTexture(),
    hubMeetingRug: createHubMeetingRugTexture(),
    hubReviewDisplay: createHubReviewDisplayTexture(),
    warmWall: createWarmWallTexture(),
    windowVista: createWindowVistaTexture(),
    strategyBoard: createStrategyBoardTexture(),
    monitorUI: createMonitorScreenTexture(),
    wovenRug: createWovenRugTexture(),
    poster1: createPosterArtTexture(1),
    poster2: createPosterArtTexture(2),
    ceoBrainConsole: createCEOBrainConsoleTexture(),
    ceoMonitorPrimary: createCEOMonitorTexture('primary'),
    ceoMonitorSecondary: createCEOMonitorTexture('secondary'),
    ceoOkrBoard: createCEOOkrBoardTexture(),
    ceoEmeraldRug: createCEOEmeraldRugTexture(),
    corridorFloor: createCorridorFloorTexture(),
    terraceDeck: createTerraceDeckTexture(),
    uiuxStudioWall: createUIUXStudioWallTexture(),
    uiuxDesignMonitor: createUIUXDesignMonitorTexture(),
    uiuxPenTablet: createUIUXPenTabletTexture(),
    uiuxWireframeWall: createUIUXWireframeWallTexture(),
    uiuxStyleBoard: createUIUXStyleBoardTexture(),
    uiuxStudioRug: createUIUXStudioRugTexture(),
    engFrontendMonitor: createEngFrontendMonitorTexture('primary'),
    engFrontendSecondary: createEngFrontendMonitorTexture('secondary'),
    engBackendMonitor: createEngBackendMonitorTexture('primary'),
    engBackendTerminal: createEngBackendMonitorTexture('terminal'),
    engDatabaseMonitor: createEngDatabaseMonitorTexture('primary'),
    engDatabaseSecondary: createEngDatabaseMonitorTexture('secondary'),
    engIntegrationBoard: createEngBoardTexture('integration'),
    engApiContractBoard: createEngBoardTexture('api_contract'),
    engSchemaBoard: createEngBoardTexture('schema'),
    engComponentBoard: createEngBoardTexture('frontend_component'),
    engStudioRug: createEngStudioRugTexture(),
    engFrontendRug: createEngZoneRugTexture('frontend'),
    engBackendRug: createEngZoneRugTexture('backend'),
    engDatabaseRug: createEngZoneRugTexture('database'),
    researchWallParchment: createResearchWallParchmentTexture(),
    researchMonitorScreen: createResearchMonitorTexture(),
    researchReferenceTablet: createResearchReferenceTabletTexture(),
    researchKnowledgeAtlas: createResearchKnowledgeAtlasTexture(),
    researchAtlasOrgPanel: createResearchLayerPanelTexture('org_brain'),
    researchAtlasProjectPanel: createResearchLayerPanelTexture('project_brain'),
    researchAtlasAgentPanel: createResearchLayerPanelTexture('agent_context'),
    researchEvidenceBoard: createResearchEvidenceBoardTexture(),
    researchAtelierRug: createResearchAtelierRugTexture(),
  };

  const materials: Record<string, THREE.MeshStandardMaterial> = {
    oakFloor: new THREE.MeshStandardMaterial({
      name: 'Mat_Oak_Plank_Floor',
      color: 0xffffff,
      map: textures.oakFloor,
      roughness: 0.72,
      metalness: 0.04,
    }),
    floorResearchOak: new THREE.MeshStandardMaterial({
      name: 'Mat_Floor_Research_Warm_Academic_Oak',
      color: 0xffffff,
      map: textures.floorResearchOak,
      roughness: 0.72,
      metalness: 0.04,
    }),
    floorPMHoneyOak: new THREE.MeshStandardMaterial({
      name: 'Mat_Floor_PM_Balanced_Honey_Oak',
      color: 0xffffff,
      map: textures.floorPMHoneyOak,
      roughness: 0.7,
      metalness: 0.04,
    }),
    floorCEOWalnutOak: new THREE.MeshStandardMaterial({
      name: 'Mat_Floor_CEO_Executive_Walnut_Oak',
      color: 0xffffff,
      map: textures.floorCEOWalnutOak,
      roughness: 0.66,
      metalness: 0.05,
    }),
    floorUIUXLightOak: new THREE.MeshStandardMaterial({
      name: 'Mat_Floor_UIUX_Light_Natural_Oak',
      color: 0xffffff,
      map: textures.floorUIUXLightOak,
      roughness: 0.7,
      metalness: 0.04,
    }),
    floorEngineeringMediumOak: new THREE.MeshStandardMaterial({
      name: 'Mat_Floor_Engineering_Refined_Medium_Oak',
      color: 0xffffff,
      map: textures.floorEngineeringMediumOak,
      roughness: 0.72,
      metalness: 0.04,
    }),
    floorQADevOpsWarmOak: new THREE.MeshStandardMaterial({
      name: 'Mat_Floor_QADevOps_Warm_Elegant_Oak',
      color: 0xffffff,
      map: textures.floorQADevOpsWarmOak,
      roughness: 0.7,
      metalness: 0.04,
    }),
    centralHubParquet: new THREE.MeshStandardMaterial({
      name: 'Mat_Central_Hub_Herringbone_Parquet',
      color: 0xffffff,
      map: textures.centralHubParquet,
      roughness: 0.66,
      metalness: 0.05,
    }),
    warmGreigeStone: new THREE.MeshStandardMaterial({
      name: 'Mat_Warm_Greige_Large_Stone',
      color: 0xffffff,
      map: textures.warmGreigeStone,
      roughness: 0.76,
      metalness: 0.03,
    }),
    hubBrassTrim: new THREE.MeshStandardMaterial({
      name: 'Mat_Central_Hub_Brass_Transition_Trim',
      color: 0xc9a356,
      roughness: 0.34,
      metalness: 0.32,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    hubMeetingRug: new THREE.MeshStandardMaterial({
      name: 'Mat_Central_Hub_Meeting_Rug',
      color: 0xffffff,
      map: textures.hubMeetingRug,
      roughness: 0.9,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    hubNavyChairFabric: new THREE.MeshStandardMaterial({
      name: 'Mat_Central_Hub_Navy_Slate_Fabric',
      color: 0x31455c,
      roughness: 0.82,
      metalness: 0.03,
    }),
    hubWalnutTabletop: new THREE.MeshStandardMaterial({
      name: 'Mat_Central_Hub_Walnut_Oak_Tabletop',
      color: 0x854e2b,
      roughness: 0.48,
      metalness: 0.07,
    }),
    hubReviewBoardScreen: new THREE.MeshStandardMaterial({
      name: 'Mat_Central_Hub_Shared_Review_Display',
      color: 0xffffff,
      map: textures.hubReviewDisplay,
      emissive: new THREE.Color(0x284763),
      emissiveMap: textures.hubReviewDisplay,
      emissiveIntensity: 0.22,
      roughness: 0.26,
      metalness: 0.08,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    hubWelcomeMat: new THREE.MeshStandardMaterial({
      name: 'Mat_Central_Hub_Welcome_Mat',
      color: 0x423932,
      roughness: 0.92,
      metalness: 0.01,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    floorSubbase: new THREE.MeshStandardMaterial({
      name: 'Mat_Floor_Subbase_Dark',
      color: 0x3b2d26,
      roughness: 0.88,
      metalness: 0.02,
    }),
    warmWall: new THREE.MeshStandardMaterial({
      name: 'Mat_Painted_Beige_Wall',
      color: 0xffffff,
      map: textures.warmWall,
      roughness: 0.85,
      metalness: 0.02,
    }),
    wallExterior: new THREE.MeshStandardMaterial({
      name: 'Mat_Wall_Exterior_Casing',
      color: 0x56443a,
      roughness: 0.85,
      metalness: 0.02,
    }),
    wallCapDark: new THREE.MeshStandardMaterial({
      name: 'Mat_Wall_Cutaway_TopCap',
      color: 0x3d2e27,
      roughness: 0.8,
      metalness: 0.05,
    }),
    woodTrim: new THREE.MeshStandardMaterial({
      name: 'Mat_Muted_Brown_Trim',
      color: 0x69452c,
      roughness: 0.68,
      metalness: 0.05,
    }),
    warmOakWood: new THREE.MeshStandardMaterial({
      name: 'Mat_Warm_Oak_Furniture',
      color: 0xc87d40,
      roughness: 0.58,
      metalness: 0.06,
    }),
    honeyOakLight: new THREE.MeshStandardMaterial({
      name: 'Mat_Honey_Oak_Light',
      color: 0xd99252,
      roughness: 0.55,
      metalness: 0.05,
    }),
    darkWalnutWood: new THREE.MeshStandardMaterial({
      name: 'Mat_Dark_Walnut_Wood',
      color: 0x7a4424,
      roughness: 0.52,
      metalness: 0.08,
    }),
    espressoWood: new THREE.MeshStandardMaterial({
      name: 'Mat_Espresso_Cabinet_Wood',
      color: 0x4f2c18,
      roughness: 0.6,
      metalness: 0.06,
    }),
    windowFrameCream: new THREE.MeshStandardMaterial({
      name: 'Mat_Window_Frame_Cream',
      color: 0xd0c0ae,
      roughness: 0.68,
      metalness: 0.04,
    }),
    windowVista: new THREE.MeshStandardMaterial({
      name: 'Mat_Window_Daylight_Vista',
      color: 0xffffff,
      map: textures.windowVista,
      emissive: new THREE.Color(0x90caf9),
      emissiveMap: textures.windowVista,
      emissiveIntensity: 0.1,
      roughness: 0.55,
      metalness: 0.0,
    }),
    windowGlass: new THREE.MeshStandardMaterial({
      name: 'Mat_Window_Glass_Pane',
      color: 0xcceeff,
      transparent: true,
      opacity: 0.18,
      roughness: 0.2,
      metalness: 0.08,
      depthWrite: false,
    }),
    sofaCocoaFabric: new THREE.MeshStandardMaterial({
      name: 'Mat_Sofa_Cocoa_Fabric',
      color: 0x5c4338,
      roughness: 0.88,
      metalness: 0.02,
    }),
    sofaCushionLight: new THREE.MeshStandardMaterial({
      name: 'Mat_Sofa_Cushion_Warm',
      color: 0x6e5246,
      roughness: 0.86,
      metalness: 0.02,
    }),
    chairSlateFabric: new THREE.MeshStandardMaterial({
      name: 'Mat_Chair_Slate_Fabric',
      color: 0x4a5d75,
      roughness: 0.84,
      metalness: 0.03,
    }),
    executiveLeather: new THREE.MeshStandardMaterial({
      name: 'Mat_Executive_Chair_Leather',
      color: 0x47362e,
      roughness: 0.45,
      metalness: 0.1,
    }),
    wovenRug: new THREE.MeshStandardMaterial({
      name: 'Mat_Woven_Area_Rug',
      color: 0xffffff,
      map: textures.wovenRug,
      roughness: 0.92,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    darkMetal: new THREE.MeshStandardMaterial({
      name: 'Mat_Dark_Architectural_Metal',
      color: 0x2c3038,
      roughness: 0.38,
      metalness: 0.24,
    }),
    brushedBrass: new THREE.MeshStandardMaterial({
      name: 'Mat_Brushed_Brass_Accent',
      color: 0xd4a84f,
      roughness: 0.32,
      metalness: 0.25,
    }),
    chromeSilver: new THREE.MeshStandardMaterial({
      name: 'Mat_Brushed_Silver_Metal',
      color: 0xb8c0c8,
      roughness: 0.3,
      metalness: 0.25,
    }),
    strategyBoardSurface: new THREE.MeshStandardMaterial({
      name: 'Mat_Strategy_Board_Canvas',
      color: 0xffffff,
      map: textures.strategyBoard,
      roughness: 0.42,
      metalness: 0.04,
    }),
    monitorScreen: new THREE.MeshStandardMaterial({
      name: 'Mat_Monitor_Screen_UI',
      color: 0xffffff,
      map: textures.monitorUI,
      emissive: new THREE.Color(0x4ea8de),
      emissiveMap: textures.monitorUI,
      emissiveIntensity: 0.28,
      roughness: 0.25,
      metalness: 0.08,
    }),
    paperCream: new THREE.MeshStandardMaterial({
      name: 'Mat_Cream_Paper_Stack',
      color: 0xf4efe6,
      roughness: 0.85,
      metalness: 0.0,
    }),
    noteCoral: new THREE.MeshStandardMaterial({
      name: 'Mat_Sticky_Note_Coral',
      color: 0xe06d53,
      roughness: 0.78,
      metalness: 0.0,
    }),
    noteAmber: new THREE.MeshStandardMaterial({
      name: 'Mat_Sticky_Note_Amber',
      color: 0xebb349,
      roughness: 0.78,
      metalness: 0.0,
    }),
    noteSage: new THREE.MeshStandardMaterial({
      name: 'Mat_Sticky_Note_Sage',
      color: 0x5ca87c,
      roughness: 0.78,
      metalness: 0.0,
    }),
    noteSky: new THREE.MeshStandardMaterial({
      name: 'Mat_Sticky_Note_Sky',
      color: 0x5c9bd6,
      roughness: 0.78,
      metalness: 0.0,
    }),
    plantFoliageDark: new THREE.MeshStandardMaterial({
      name: 'Mat_Plant_Foliage_Deep',
      color: 0x3b7a34,
      roughness: 0.75,
      metalness: 0.02,
    }),
    plantFoliageMid: new THREE.MeshStandardMaterial({
      name: 'Mat_Plant_Foliage_Mid',
      color: 0x569e46,
      roughness: 0.72,
      metalness: 0.02,
    }),
    plantFoliageBright: new THREE.MeshStandardMaterial({
      name: 'Mat_Plant_Foliage_Highlight',
      color: 0x76c258,
      roughness: 0.7,
      metalness: 0.02,
    }),
    terracottaPot: new THREE.MeshStandardMaterial({
      name: 'Mat_Terracotta_Planter',
      color: 0xc2653c,
      roughness: 0.76,
      metalness: 0.02,
    }),
    ceramicCream: new THREE.MeshStandardMaterial({
      name: 'Mat_Ceramic_Cream_Mug',
      color: 0xf2ece1,
      roughness: 0.35,
      metalness: 0.05,
    }),
    lampShadeWarm: new THREE.MeshStandardMaterial({
      name: 'Mat_Warm_Lamp_Shade',
      color: 0xf5deb3,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.18,
      roughness: 0.68,
      metalness: 0.0,
    }),
    contactShadow: new THREE.MeshStandardMaterial({
      name: 'Mat_Baked_Contact_Shadow',
      color: 0x241308,
      transparent: true,
      opacity: 0.32,
      roughness: 0.95,
      metalness: 0.0,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -2,
    }),
    posterArt1: new THREE.MeshStandardMaterial({
      name: 'Mat_Framed_Poster_Sunset',
      color: 0xffffff,
      map: textures.poster1,
      roughness: 0.55,
      metalness: 0.02,
    }),
    posterArt2: new THREE.MeshStandardMaterial({
      name: 'Mat_Framed_Poster_Isometric',
      color: 0xffffff,
      map: textures.poster2,
      roughness: 0.55,
      metalness: 0.02,
    }),
    connectorFrame: new THREE.MeshStandardMaterial({
      name: 'Mat_Modular_Connector_Threshold',
      color: 0x8c5832,
      roughness: 0.62,
      metalness: 0.08,
    }),
    // CEO Executive Brain Office & A3 Office Common-Area Materials
    ceoForestLeather: new THREE.MeshStandardMaterial({
      name: 'Mat_CEO_Forest_Green_Leather',
      color: 0x26463b,
      roughness: 0.48,
      metalness: 0.08,
    }),
    ceoEmeraldFabric: new THREE.MeshStandardMaterial({
      name: 'Mat_CEO_Emerald_Guest_Fabric',
      color: 0x31594b,
      roughness: 0.82,
      metalness: 0.02,
    }),
    ceoCharcoalCase: new THREE.MeshStandardMaterial({
      name: 'Mat_CEO_Charcoal_Console_Frame',
      color: 0x232830,
      roughness: 0.42,
      metalness: 0.22,
    }),
    ceoBrainScreen: new THREE.MeshStandardMaterial({
      name: 'Mat_CEO_Brain_Console_Display',
      color: 0xffffff,
      map: textures.ceoBrainConsole,
      emissive: new THREE.Color(0x2d6a62),
      emissiveMap: textures.ceoBrainConsole,
      emissiveIntensity: 0.26,
      roughness: 0.26,
      metalness: 0.08,
    }),
    ceoMonitorPrimary: new THREE.MeshStandardMaterial({
      name: 'Mat_CEO_Monitor_Primary_Display',
      color: 0xffffff,
      map: textures.ceoMonitorPrimary,
      emissive: new THREE.Color(0x38827a),
      emissiveMap: textures.ceoMonitorPrimary,
      emissiveIntensity: 0.24,
      roughness: 0.25,
      metalness: 0.08,
    }),
    ceoMonitorSecondary: new THREE.MeshStandardMaterial({
      name: 'Mat_CEO_Monitor_Secondary_Display',
      color: 0xffffff,
      map: textures.ceoMonitorSecondary,
      emissive: new THREE.Color(0x6e592d),
      emissiveMap: textures.ceoMonitorSecondary,
      emissiveIntensity: 0.22,
      roughness: 0.25,
      metalness: 0.08,
    }),
    ceoOkrBoardSurface: new THREE.MeshStandardMaterial({
      name: 'Mat_CEO_OKR_Board_Surface',
      color: 0xffffff,
      map: textures.ceoOkrBoard,
      roughness: 0.45,
      metalness: 0.04,
    }),
    ceoEmeraldRug: new THREE.MeshStandardMaterial({
      name: 'Mat_CEO_Woven_Emerald_Rug',
      color: 0xffffff,
      map: textures.ceoEmeraldRug,
      roughness: 0.92,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    corridorFloor: new THREE.MeshStandardMaterial({
      name: 'Mat_Office_Corridor_Floor',
      color: 0xffffff,
      map: textures.corridorFloor,
      roughness: 0.74,
      metalness: 0.04,
    }),
    terraceDeck: new THREE.MeshStandardMaterial({
      name: 'Mat_Outdoor_Terrace_Deck',
      color: 0xffffff,
      map: textures.terraceDeck,
      roughness: 0.8,
      metalness: 0.02,
    }),
    plannedBlueprintFloor: new THREE.MeshStandardMaterial({
      name: 'Mat_Planned_Module_Floor_Slab',
      color: 0x343844,
      roughness: 0.88,
      metalness: 0.04,
    }),
    plannedBlueprintWall: new THREE.MeshStandardMaterial({
      name: 'Mat_Planned_Module_Low_Wall',
      color: 0x464c5c,
      roughness: 0.82,
      metalness: 0.06,
    }),
    // Module 03 — UI/UX Design Studio Materials
    uiuxStudioWall: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Studio_Cream_Sage_Wall',
      color: 0xffffff,
      map: textures.uiuxStudioWall,
      roughness: 0.84,
      metalness: 0.02,
    }),
    uiuxPaleBirch: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Pale_Birch_Wood',
      color: 0xdcb689,
      roughness: 0.56,
      metalness: 0.05,
    }),
    uiuxOffWhiteSurface: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Off_White_Desk_Surface',
      color: 0xf5f2ea,
      roughness: 0.62,
      metalness: 0.04,
    }),
    uiuxMutedSage: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Muted_Sage_Accent',
      color: 0x6b9e88,
      roughness: 0.72,
      metalness: 0.04,
    }),
    uiuxSoftTeal: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Soft_Teal_Accent',
      color: 0x4b8782,
      roughness: 0.68,
      metalness: 0.05,
    }),
    uiuxDustyLavender: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Dusty_Lavender_Boucle',
      color: 0x9582a8,
      roughness: 0.84,
      metalness: 0.02,
    }),
    uiuxPeachCoral: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Peach_Coral_Detail',
      color: 0xe27d60,
      roughness: 0.74,
      metalness: 0.03,
    }),
    uiuxSoftButter: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Soft_Butter_Yellow',
      color: 0xf0c975,
      roughness: 0.76,
      metalness: 0.02,
    }),
    uiuxCorkSurface: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Cork_Pinboard_Surface',
      color: 0xc69868,
      roughness: 0.88,
      metalness: 0.01,
    }),
    uiuxDesignMonitor: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_5K_Design_Monitor_Screen',
      color: 0xffffff,
      map: textures.uiuxDesignMonitor,
      emissive: new THREE.Color(0x4b8782),
      emissiveMap: textures.uiuxDesignMonitor,
      emissiveIntensity: 0.24,
      roughness: 0.24,
      metalness: 0.08,
    }),
    uiuxPenTablet: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Pen_Display_Screen',
      color: 0xffffff,
      map: textures.uiuxPenTablet,
      emissive: new THREE.Color(0x9582a8),
      emissiveMap: textures.uiuxPenTablet,
      emissiveIntensity: 0.18,
      roughness: 0.28,
      metalness: 0.06,
    }),
    uiuxWireframeBoard: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Wireframe_Flow_Board',
      color: 0xffffff,
      map: textures.uiuxWireframeWall,
      roughness: 0.48,
      metalness: 0.03,
    }),
    uiuxStyleBoard: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Style_System_Board',
      color: 0xffffff,
      map: textures.uiuxStyleBoard,
      roughness: 0.46,
      metalness: 0.03,
    }),
    uiuxStudioRug: new THREE.MeshStandardMaterial({
      name: 'Mat_UIUX_Geometric_Studio_Rug',
      color: 0xffffff,
      map: textures.uiuxStudioRug,
      roughness: 0.92,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    // Module 04 — Engineering & Development Studio (8×16 Double-Module) Materials
    engFrontendOrange: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Frontend_Coral_Orange',
      color: 0xe87a5d,
      roughness: 0.68,
      metalness: 0.04,
    }),
    engBackendNavy: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Backend_Technical_Navy',
      color: 0x3b6e9c,
      roughness: 0.66,
      metalness: 0.06,
    }),
    engBackendSteel: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Backend_Steel_Slate',
      color: 0x5c7089,
      roughness: 0.54,
      metalness: 0.14,
    }),
    engDatabaseTeal: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Database_Teal_Accent',
      color: 0x2e7d6b,
      roughness: 0.66,
      metalness: 0.05,
    }),
    engDatabaseEmerald: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Database_Deep_Emerald',
      color: 0x214e43,
      roughness: 0.62,
      metalness: 0.06,
    }),
    engDarkTechWood: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Dark_Technical_Walnut',
      color: 0x5d3a22,
      roughness: 0.56,
      metalness: 0.06,
    }),
    engFrontendMonitor: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Frontend_Primary_Display',
      color: 0xffffff,
      map: textures.engFrontendMonitor,
      emissive: new THREE.Color(0x526580),
      emissiveMap: textures.engFrontendMonitor,
      emissiveIntensity: 0.25,
      roughness: 0.24,
      metalness: 0.08,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engFrontendSecondary: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Frontend_Secondary_Display',
      color: 0xffffff,
      map: textures.engFrontendSecondary,
      emissive: new THREE.Color(0x5c4d42),
      emissiveMap: textures.engFrontendSecondary,
      emissiveIntensity: 0.22,
      roughness: 0.24,
      metalness: 0.08,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engBackendMonitor: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Backend_Primary_Display',
      color: 0xffffff,
      map: textures.engBackendMonitor,
      emissive: new THREE.Color(0x2f5980),
      emissiveMap: textures.engBackendMonitor,
      emissiveIntensity: 0.25,
      roughness: 0.24,
      metalness: 0.08,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engBackendTerminal: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Backend_Terminal_Display',
      color: 0xffffff,
      map: textures.engBackendTerminal,
      emissive: new THREE.Color(0x285448),
      emissiveMap: textures.engBackendTerminal,
      emissiveIntensity: 0.24,
      roughness: 0.24,
      metalness: 0.08,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engDatabaseMonitor: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Database_Primary_Display',
      color: 0xffffff,
      map: textures.engDatabaseMonitor,
      emissive: new THREE.Color(0x28665b),
      emissiveMap: textures.engDatabaseMonitor,
      emissiveIntensity: 0.25,
      roughness: 0.24,
      metalness: 0.08,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engDatabaseSecondary: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Database_Secondary_Display',
      color: 0xffffff,
      map: textures.engDatabaseSecondary,
      emissive: new THREE.Color(0x2d6b5f),
      emissiveMap: textures.engDatabaseSecondary,
      emissiveIntensity: 0.22,
      roughness: 0.24,
      metalness: 0.08,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engIntegrationBoard: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Integration_Architecture_Board',
      color: 0xffffff,
      map: textures.engIntegrationBoard,
      roughness: 0.45,
      metalness: 0.04,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engApiContractBoard: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_API_Contract_Board',
      color: 0xffffff,
      map: textures.engApiContractBoard,
      roughness: 0.45,
      metalness: 0.04,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engSchemaBoard: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Database_Schema_Board',
      color: 0xffffff,
      map: textures.engSchemaBoard,
      roughness: 0.45,
      metalness: 0.04,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engComponentBoard: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Frontend_Component_Board',
      color: 0xffffff,
      map: textures.engComponentBoard,
      roughness: 0.45,
      metalness: 0.04,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engStudioRug: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Studio_Runner_Rug',
      color: 0xffffff,
      map: textures.engStudioRug,
      roughness: 0.92,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engFrontendRug: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Frontend_Zone_Rug',
      color: 0xffffff,
      map: textures.engFrontendRug,
      roughness: 0.92,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engBackendRug: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Backend_Zone_Rug',
      color: 0xffffff,
      map: textures.engBackendRug,
      roughness: 0.92,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    engDatabaseRug: new THREE.MeshStandardMaterial({
      name: 'Mat_Eng_Database_Zone_Rug',
      color: 0xffffff,
      map: textures.engDatabaseRug,
      roughness: 0.92,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    // Module 05 — Research & Shared Brain ("The Knowledge Atelier") Materials
    researchWallParchment: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Warm_Parchment_Wall',
      color: 0xffffff,
      map: textures.researchWallParchment,
      roughness: 0.84,
      metalness: 0.02,
    }),
    researchBurgundyBook: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Burgundy_Cloth_Book',
      color: 0x7c2d36,
      roughness: 0.76,
      metalness: 0.02,
    }),
    researchForestBook: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Forest_Green_Book',
      color: 0x2d5a46,
      roughness: 0.76,
      metalness: 0.02,
    }),
    researchNavyBook: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Scholar_Navy_Book',
      color: 0x2c4a6f,
      roughness: 0.76,
      metalness: 0.02,
    }),
    researchCognacLeather: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Cognac_Scholar_Leather',
      color: 0x6e3f28,
      roughness: 0.52,
      metalness: 0.06,
    }),
    researchMonitorScreen: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Primary_Monitor_Screen',
      color: 0xffffff,
      map: textures.researchMonitorScreen,
      emissive: new THREE.Color(0x2c5c63),
      emissiveMap: textures.researchMonitorScreen,
      emissiveIntensity: 0.24,
      roughness: 0.24,
      metalness: 0.08,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    researchReferenceTablet: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Reference_Tablet_Screen',
      color: 0xffffff,
      map: textures.researchReferenceTablet,
      emissive: new THREE.Color(0x526b61),
      emissiveMap: textures.researchReferenceTablet,
      emissiveIntensity: 0.18,
      roughness: 0.28,
      metalness: 0.06,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    researchKnowledgeAtlas: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Shared_Brain_Atlas_Canvas',
      color: 0xffffff,
      map: textures.researchKnowledgeAtlas,
      emissive: new THREE.Color(0x25494f),
      emissiveMap: textures.researchKnowledgeAtlas,
      emissiveIntensity: 0.2,
      roughness: 0.36,
      metalness: 0.05,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    researchAtlasOrgPanel: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Atlas_Org_Brain_Panel',
      color: 0xffffff,
      map: textures.researchAtlasOrgPanel,
      emissive: new THREE.Color(0x284e6e),
      emissiveMap: textures.researchAtlasOrgPanel,
      emissiveIntensity: 0.22,
      roughness: 0.32,
      metalness: 0.06,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    researchAtlasProjectPanel: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Atlas_Project_Brain_Panel',
      color: 0xffffff,
      map: textures.researchAtlasProjectPanel,
      emissive: new THREE.Color(0x23594c),
      emissiveMap: textures.researchAtlasProjectPanel,
      emissiveIntensity: 0.22,
      roughness: 0.32,
      metalness: 0.06,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    researchAtlasAgentPanel: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Atlas_Agent_Context_Panel',
      color: 0xffffff,
      map: textures.researchAtlasAgentPanel,
      emissive: new THREE.Color(0x6e4b1f),
      emissiveMap: textures.researchAtlasAgentPanel,
      emissiveIntensity: 0.22,
      roughness: 0.32,
      metalness: 0.06,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    researchEvidenceBoard: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Evidence_Pinboard_Surface',
      color: 0xffffff,
      map: textures.researchEvidenceBoard,
      roughness: 0.52,
      metalness: 0.03,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    researchAtelierRug: new THREE.MeshStandardMaterial({
      name: 'Mat_Research_Woven_Atelier_Rug',
      color: 0xffffff,
      map: textures.researchAtelierRug,
      roughness: 0.92,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  };

  // Store original maps and colors for mode switching
  const originalMaps = new Map<THREE.MeshStandardMaterial, THREE.Texture | null>();
  const originalEmissiveMaps = new Map<THREE.MeshStandardMaterial, THREE.Texture | null>();
  const originalColors = new Map<THREE.MeshStandardMaterial, number>();
  const cleanClayColors: Record<string, number> = {
    oakFloor: 0xc2834b,
    floorResearchOak: 0xb97b45,
    floorPMHoneyOak: 0xc4854c,
    floorCEOWalnutOak: 0x9e6336,
    floorUIUXLightOak: 0xcfa26e,
    floorEngineeringMediumOak: 0xb67843,
    floorQADevOpsWarmOak: 0xbd7e47,
    centralHubParquet: 0xc78e54,
    warmGreigeStone: 0xd5cec2,
    hubMeetingRug: 0xe6e0d4,
    hubReviewBoardScreen: 0x18222f,
    warmWall: 0xe4d2be,
    windowVista: 0xbee3f8,
    strategyBoardSurface: 0xf5f2eb,
    monitorScreen: 0x3b78a8,
    wovenRug: 0x3b4f73,
    posterArt1: 0xd96b43,
    posterArt2: 0x4a90c2,
    ceoBrainScreen: 0x263849,
    ceoMonitorPrimary: 0x263849,
    ceoMonitorSecondary: 0x2a3b4c,
    ceoOkrBoardSurface: 0xf4efe6,
    ceoEmeraldRug: 0x27463b,
    corridorFloor: 0xd5cec2,
    terraceDeck: 0x9c6b3b,
    uiuxStudioWall: 0xe8e2d7,
    uiuxDesignMonitor: 0x282d3a,
    uiuxPenTablet: 0xf5f2eb,
    uiuxWireframeBoard: 0xf6f3ec,
    uiuxStyleBoard: 0xf7f5f0,
    uiuxStudioRug: 0x6b9e88,
    engFrontendMonitor: 0x252a35,
    engFrontendSecondary: 0x2a303d,
    engBackendMonitor: 0x1c2536,
    engBackendTerminal: 0x19232d,
    engDatabaseMonitor: 0x1a2e2b,
    engDatabaseSecondary: 0x1e332f,
    engIntegrationBoard: 0xf6f4ee,
    engApiContractBoard: 0xf6f4ee,
    engSchemaBoard: 0xf6f4ee,
    engComponentBoard: 0xf6f4ee,
    engStudioRug: 0xded8ce,
    engFrontendRug: 0xe9e2d7,
    engBackendRug: 0xdee3e8,
    engDatabaseRug: 0xdce6e2,
    researchWallParchment: 0xefe9dd,
    researchMonitorScreen: 0x1f3036,
    researchReferenceTablet: 0xf5f0e4,
    researchKnowledgeAtlas: 0x1b282c,
    researchAtlasOrgPanel: 0x203240,
    researchAtlasProjectPanel: 0x1e3632,
    researchAtlasAgentPanel: 0x362d1e,
    researchEvidenceBoard: 0xc59b6d,
    researchAtelierRug: 0xd6dfd8,
  };

  Object.entries(materials).forEach(([key, mat]) => {
    originalMaps.set(mat, mat.map);
    originalEmissiveMaps.set(mat, mat.emissiveMap);
    originalColors.set(mat, mat.color.getHex());
    if (cleanClayColors[key]) {
      mat.userData.cleanColor = cleanClayColors[key];
    }
  });

  const setVisualMode = (mode: VisualStyleMode, texturesEnabled: boolean) => {
    const showMaps = mode !== 'clean' && texturesEnabled;
    Object.entries(materials).forEach(([key, mat]) => {
      const origMap = originalMaps.get(mat) ?? null;
      const origEmissiveMap = originalEmissiveMaps.get(mat) ?? null;
      if (origMap) {
        mat.map = showMaps ? origMap : null;
        if (!showMaps && cleanClayColors[key]) {
          mat.color.setHex(cleanClayColors[key]);
        } else {
          mat.color.setHex(originalColors.get(mat) ?? 0xffffff);
        }
      }
      if (origEmissiveMap) {
        mat.emissiveMap = showMaps ? origEmissiveMap : null;
      }
      if (mode === 'pixel') {
        mat.roughness = Math.min(0.95, (mat.roughness || 0.6) + 0.08);
      }
      mat.needsUpdate = true;
    });
  };

  const dispose = () => {
    Object.values(materials).forEach((m) => m.dispose());
    Object.values(textures).forEach((t) => t.dispose());
  };

  return {
    materials,
    textures,
    setVisualMode,
    dispose,
  };
}

