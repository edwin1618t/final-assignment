# The Scream — Shared Drawing Base

## Overview

This project recreates our approved Figma artwork,
“The Scream · Editable Vector”, using p5.js.

The current version is a static drawing base. It preserves the main
composition and separate colour shapes, while replacing gradients
with solid colours to simplify the drawing code.

The maximum canvas size is 525 × 639 pixels.

## Drawing sections

| Section | Function | Contents |
| --- | --- | --- |
| sky | drawSky() | Eight sky colour shapes |
| mountains | drawMountains() | Distant hills and deep sea |
| blueLines | drawBlueLines() | Five blue contour lines |
| lake | drawLake() | Water, reflections and boats |
| rightLake | drawRightLake() | Six shoreline colour shapes |
| bridge | drawBridge() | Walkway, shadow, posts and rails |
| figure | drawFigure() | Body, folds, face and hands |

These sections share one canvas. They are logical drawing groups,
rather than separate Figma layers or separate HTML canvases.

The order of calls in draw() controls which sections appear
in front of others.


## Time-based Part
