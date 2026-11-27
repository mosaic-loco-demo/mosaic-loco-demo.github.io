# MOSAIC: Quadruped Loco-Manipulation

**Grasp-capability-guided navigation and posture adjustment for quadruped loco-manipulation.**

## Overview

MOSAIC is an integrated framework that coordinates quadruped locomotion and manipulation by considering grasping feasibility during navigation.

The framework constructs an empirical grasp-capability field through simulation-based manipulation evaluation. The field guides navigation toward feasible handoff configurations and supports local posture adjustment. The robot then grasps the target using a wrist-mounted camera and inverse kinematics.

## Robotic Platform

- **Quadruped** — Unitree A2
- **Manipulator** — PIPER 6-DoF robotic arm
- **Perception** — Intel RealSense D436 wrist-mounted RGB-D camera
- **Deployment** — Onboard perception, navigation, posture adjustment, and manipulation

## Demonstrations

The video gallery presents real-world experiments across six task categories.

- **Indoor Grasping** — Objects on steps, tables, and other elevated surfaces.
- **Outdoor Grasping** — Grasping on grass, wooded terrain, slopes, stairs, and uneven ground.
- **Navigation-Based Pick-and-Place** — Integrated navigation, grasping, and placement.
- **Target Following** — Following a target on outdoor grass and steps.
- **Long-Horizon Tasks** — Multi-stage navigation and manipulation sequences.
- **Extended Physical Interactions** — Plug insertion and removal, knob turning, and button pressing.

## Local Preview

The webpage and demonstration videos are self-contained in this repository. Run the preview server from the repository root.

```bash
python3 server.py 4173
```

Open <http://localhost:4173> in your browser.

## Repository Structure

- `index.html` — Main webpage and featured video configuration.
- `app.js` — Gallery categories and interaction logic.
- `styles.css` — Page layout and styling.
- `data/videos.json` — Editable video manifest.
- `data/videos.js` — Browser-ready video manifest.
- `assets/` — Project figures and video posters.
- `videos/` — Demonstration video assets.
- `server.py` — Local preview server with byte-range support for video playback.

## Updating Demonstrations

Place new videos in `videos/` and add their entries to `data/videos.json`. Use a category ID defined in `app.js` and a concise English title. Video cards default to 16:9. Set `aspect` to a value such as `4:3` when the source video uses a different aspect ratio.

Validate the JSON manifest and update `data/videos.js` so the gallery uses the new entries.

```bash
python3 -m json.tool data/videos.json >/dev/null
```
