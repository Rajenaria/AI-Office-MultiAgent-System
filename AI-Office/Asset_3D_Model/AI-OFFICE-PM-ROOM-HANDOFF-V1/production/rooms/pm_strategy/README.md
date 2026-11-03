# Deliverable A — PM & Strategy Room Production Asset Pack (V1)

## Asset Overview
- **Asset ID**: `ai_office.room.pm_strategy.v1` (`AI_OFFICE_ROOM_PM_v1`)
- **Version**: `1.0.0`
- **Export Date**: `2026-10-28T15:37:53.193Z`
- **Validation Status**: `PASS`

## Package Contents
1. `pm_room.glb` — Standalone binary glTF 2.0 room module (785,584 bytes · SHA-256: `ddf24b59b5c71e977c1c6f4ba31a22b76da53f3cb1e01750fdf15749a0d25446`). Strictly excludes the Boss PM character, cameras, lights, and debug helpers.
2. `pm_room.manifest.json` — Machine-readable coordinate, scale, connector, material parity, and rendering profile contract.
3. `pm_room.anchors.json` — Validated world/local transforms for all 10 activity anchors, 12 walkable navigation waypoints, EAST/SOUTH modular connectors, and obstacle bounds.
4. `pm_room.preview.png` — Isometric preview render of the approved PM & Strategy Room.
5. `README.md` — Integration and rendering notes.

## Coordinate & Modular Snap Contract
- **Up Axis**: `+Y` (right-handed Three.js world space)
- **Floor Elevation**: `Y = 0.000` (structural subbase `Y = -0.160 .. 0.000`)
- **SW Corner Origin**: `[0, 0, 0]` (never recentered; footprint spans `X = [0..8]`, `Z = [0..8]`, height `Y = [-0.16..3.20]`)
- **East Connector (`CONNECTOR_EAST`)**: `[8, 0, 4]`, normal `[+1, 0, 0]`, width `2.0u`, removable node `Connector_East_Removable_Doorway`
- **South Connector (`CONNECTOR_SOUTH`)**: `[4, 0, 0]`, normal `[0, 0, -1]`, width `2.0u`, removable node `Connector_South_Removable_Threshold`

## Recommended Host Rendering Profile
- **Camera**: Orthographic isometric (`position: [13.6, 11.2, -5.6]`, `target: [4.0, 1.15, 4.0]`, `near: 0.5`, `far: 48.0`)
- **Shadows**: Directional key light at `[9.5, 14.0, 2.0]` with `shadow.bias = -0.0008`, `shadow.normalBias = 0.035`
- **Textures**: Set `magFilter = THREE.NearestFilter` and `minFilter = THREE.NearestFilter` on imported textures for crisp pixel-art fidelity.
