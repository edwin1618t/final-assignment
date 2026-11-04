# The Scream — Shared Drawing Base

## Overview

This project recreates our approved Figma artwork,
“The Scream · Editable Vector”, using p5.js.

The current version is a static drawing base. It preserves the main
composition and separate colour shapes, while replacing gradients
with solid colours to simplify the drawing code.

The SVG drawing coordinates are 1050 × 1278. The webpage displays
the artwork at a maximum width of 360 pixels and scales it proportionally.

## SVG rendering

The artwork now uses p5.js-svg 1.6.0 with p5.js 1.11.3. Both libraries
are included in libraries/ so the page does not need a CDN connection.
The page loads p5.js, then the SVG extension, then script.js.

createCanvas(1050, 1278, SVG) produces SVG vector elements using the
existing p5.js drawing functions. CSS displays the picture at a maximum
width of 360 pixels, centred on a dark navy page with a wooden frame.
The original drawing coordinates and named parts are retained.

Press S to download the artwork as the-scream.svg. The webpage frame
is CSS decoration and is not included in the exported artwork.

This base is static: noLoop() stops continuous drawing. For later
animation, remove noLoop() and add your mechanic updates. clear() at
the start of draw() removes the previous SVG elements each frame.

SVG rendering is an additional library technique beyond the reviewed
course material. ChatGPT assisted with this renderer and layout change.
Each drawing command creates vector elements rather than bitmap pixels.

Library reference and compatibility:
https://github.com/zenozeng/p5.js-svg
