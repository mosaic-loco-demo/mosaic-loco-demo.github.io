# MOSAIC · Project Page

An offline research project page for the MOSAIC quadruped loco-manipulation work.

## Local preview

The webpage and its video files are self-contained in this folder:

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173>.

## Website video source

The page uses only the video files stored in `网站专用` alongside the webpage.

The website library is arranged around five task groups:

- Indoor Grasping covers indoor steps, tables, and other raised surfaces. The target is about 6 clips.
- Outdoor Grasping covers steps, slopes, wooded ground, grass, ravines, and targets of different heights, positions, and shapes. The target is about 9 clips.
- Navigation-Based Pick-and-Place shows complete navigation, grasping, and placement workflows. The target is 3 clips.
- Follow up groups follow-up demonstrations immediately after Navigation-Based Pick-and-Place. It currently contains 2 clips.
- Long-Horizon Tasks has a target of 3 clips.
- Extended Interaction Tasks has a target of 3 clips, one each for plug insertion or removal, knob turning, and button pressing.

The atlas displays every populated group on the same page. Indoor Grasping and Outdoor Grasping support horizontal scrolling.

Video cards default to a 16:9 frame. Add an `aspect` value such as `4:3` to a manifest entry when its source video uses another shape. The card preserves the full frame.

When adding a clip under `videos/网站专用`, use the category ID from `app.js` and an English title in the manifest.

## Editing the page

- `index.html` contains the page structure and hero video.
- `app.js` contains the category definitions, gallery layout logic, and search behavior.
- `data/videos.json` is the editable video manifest.
- `data/videos.js` is the browser-ready copy of the manifest.
- `styles.css` contains the layout and video atlas styling.

Run this check after editing the manifest:

```bash
python3 -m json.tool data/videos.json >/dev/null
```
