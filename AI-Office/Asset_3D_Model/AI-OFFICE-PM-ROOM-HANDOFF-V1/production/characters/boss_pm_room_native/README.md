# Deliverable B — Room-Native Boss PM Export Candidate (V1)

## Asset Overview
- **Asset ID**: `ai_office.character.boss_pm_room_native.v1` (`AI_OFFICE_ORIGINAL_BOSS_PM_v1`)
- **Role**: `ROOM_NATIVE_EXPORT_CANDIDATE`
- **Version**: `1.0.0`
- **Export Date**: `2026-10-28T15:37:52.891Z`
- **Validation Status**: `PASS`

> **Canonical Pipeline Notice**: Preserves the approved room-native cozy voxel Boss PM as an integration candidate. Does not silently replace Character Lab as the canonical character-production pipeline.

## Package Contents
1. `boss_pm.glb` — Standalone binary glTF 2.0 character model (98,420 bytes · SHA-256: `7cecd5ec72aaf92eb4a08dfd373dd6f05f35e1a5175eef3e0864e4d97ba5eb8a`) containing 41 standing rest-pose voxel meshes and 11 embedded keyframe `AnimationClip`s.
2. `boss_pm.manifest.json` — Machine-readable scale, bounds, material, and animation clip inventory.
3. `boss_pm.behavior.json` — Mapping of all 11 PM activity states to embedded glTF clips, procedural waypoint navigation, anchors, postures, and contextual props.
4. `boss_pm.preview.png` — Close-up preview render of the Room-Native Boss PM character.
5. `README.md` — Integration and animation notes.

## Coordinate, Origin & Animation Contract
- **Origin**: `[0, 0, 0]` at feet floor contact (`minY = 0.000`)
- **Forward Axis**: `+Z` (`[0, 0, 1]`)
- **Height**: `1.725u` raw (`1.72u` calibrated target height, scale factor `×0.9971`)
- **Embedded Animation Clips (11)**:
  - `Idle_Breathing` (2.4s · 3 keyframe tracks)
  - `Walk_Cycle` (0.96s · 5 keyframe tracks)
  - `Work_Typing` (1.2s · 6 keyframe tracks)
  - `Meeting_Briefing` (2s · 3 keyframe tracks)
  - `Present_Board` (2s · 3 keyframe tracks)
  - `Read_Document` (2s · 3 keyframe tracks)
  - `Think_Plan` (2.2s · 3 keyframe tracks)
  - `Phone_Call` (2s · 3 keyframe tracks)
  - `Coffee_Break` (2.6s · 2 keyframe tracks)
  - `Waiting_Approval` (2s · 3 keyframe tracks)
  - `Task_Completed` (1.4s · 3 keyframe tracks)
