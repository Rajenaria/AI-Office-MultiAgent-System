# Deliverable C — Full Source Project Archive (`modular-room-lab-source.zip`)

## Overview
`modular-room-lab-source.zip` contains the **26 actual source files** of the AI Office Modular Room Lab project (React 19 + TypeScript + Three.js + Vite), including:
- `src/three/RoomArchitectureBuilder.ts` — 8×8 PM Room architectural shell, walls, windows, pilasters, trims, and EAST/SOUTH connectors.
- `src/three/FurnitureLibraryBuilder.ts` — All 12 approved PM Room furniture items, strategy board, bookcase, wardrobe, credenza, executive desk, props, and decorations.
- `src/three/PixelMaterialLibrary.ts` — Procedural pixel-art CanvasTextures and glTF-compatible `THREE.MeshStandardMaterial` definitions.
- `src/three/BossPMCharacterSystem.ts` — Original Room-Native Voxel Boss PM generator, 11 embedded keyframe `AnimationClip`s, and procedural runtime controller.
- `src/domain/modularRoomSpec.ts` & `src/domain/pmSimulationSpec.ts` — Coordinate specifications, anchors, Dijkstra waypoint pathfinding, and unit tests.
- `src/export/*` — Production asset pack exporters, manifest builders, and independent GLB round-trip validator.
- `src/components/*` & `src/App.tsx` — Interactive 3D isometric viewport, simulation controls, and Asset Export & Integration Handoff UI.

## Running Locally
```bash
npm install
npm run dev
```

## Running Unit & Round-Trip Verification Tests
```bash
npx tsx --test src/domain/modularRoomSpec.test.ts src/domain/pmSimulationSpec.test.ts src/export/exportPipeline.test.ts
```

## Native Google AI Studio Build Export
In addition to downloading `modular-room-lab-source.zip` directly from the in-app **Asset Export & Integration Handoff** panel, the Project Owner can also use Google AI Studio Build's native **Download Code / Export to ZIP / GitHub** action in the top studio toolbar at any time. No API keys or secrets are packaged in this archive.
