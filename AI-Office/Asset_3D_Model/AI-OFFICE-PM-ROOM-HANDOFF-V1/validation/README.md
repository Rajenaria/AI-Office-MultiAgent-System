# Validation Reports — Independent GLB Round-Trip & Visual Stability (V1)

- `roundtrip-report.json` — Automated independent binary export + `GLTFLoader.parseAsync()` re-import verification report for both `pm_room.glb` and `boss_pm.glb`, including the 19-point validation matrix.
- `visual-stability-report.json` — Coplanar surface, duplicate mesh, camera frustum depth precision (`near=0.5, far=48`), and shadow bias (`-0.0008 / 0.035`) verification report confirming zero Z-fighting across cabinets, walls, windows, and Boss PM ears/glasses/sideburns.
