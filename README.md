
# PixelFlow Image Editor

PixelFlow is a responsive browser-based image editor built with HTML, CSS, JavaScript, Bootstrap, Bootstrap Icons, and Cropper.js. It offers a clean SaaS-style interface for uploading, editing, cropping, adjusting, previewing, and exporting images directly in the browser.

## Features

- Responsive SaaS-style editor layout
- Sidebar controls aligned with the canvas workspace
- Scrollable image workspace
- Auto-fit uploaded image to the canvas
- Image remains scrollable when zoomed in
- Click-to-upload image support
- Drag-and-drop image upload
- File name preview after upload
- Undo and redo editing history
- Reset all changes
- Export edited image as PNG

## Transform Tools

- Crop mode powered by Cropper.js
- Apply crop
- Cancel crop
- Crop opens at the current visible image size
- Rotate left
- Rotate right
- Flip horizontally
- Flip vertically

## Zoom Tools

- Zoom in
- Zoom out
- Live zoom percentage display
- Initial image fit based on available canvas size
- Scrollable workspace when image exceeds canvas size

## Presets

PixelFlow includes multiple working image presets:

- Black and White
- Invert
- Dramatic
- Retro
- Cinematic
- Cool
- Warm
- Fade

Preset buttons include custom color styles for a more polished editor interface.

## Adjustments

PixelFlow includes live adjustment sliders for:

- Brightness
- Contrast
- Saturation
- Grayscale
- Sepia
- Invert
- Hue
- Blur

Slider values update in real time while editing.

## Collapsible Panels

The Presets and Adjustments sections are collapsible, allowing users to keep the sidebar clean and only open the tools they need.

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons
- Cropper.js
- Canvas API

## Project Structure

```text
project-folder/
  index.html
  style.css
  script.js
```
## How To Run

1. Clone or download this repository.
2. Open `index.html` in your browser.
3. Upload an image.
4. Start editing.

No backend or installation is required.

## CDN Dependencies

This project uses CDN links for:

- Bootstrap
- Bootstrap Icons
- Cropper.js

Make sure you are connected to the internet when opening the project, unless you download these libraries locally.

## Usage

1. Click **Choose File** to upload an image.
2. Use the zoom controls to adjust the preview size.
3. Use **Enter Crop Mode** to crop the image.
4. Apply presets or manually adjust brightness, contrast, and saturation.
5. Use undo and redo to move through edit history.
6. Click **Export Image** to download the final edited PNG.

## Export

The edited image is rendered using the browser Canvas API and downloaded as:

```text
edited-image.png
```
