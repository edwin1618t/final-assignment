# The Scream — Shared Drawing Base

## Overview

We started from our Figma redraw of Munch's *The Scream* and rebuilt it in p5.js.

This is the static base that all four mechanics draw on top of.
We kept the same layout and colour shapes as the Figma version, but swapped
the gradients for flat colours so the drawing code stays short and easy to edit.

## How the drawing is organised
Everything is drawn on one canvas, split into seven functions:

| Function | What it draws |
| --- | --- |
| `drawSky()` | the eight bands of the sky |
| `drawMountains()` | the distant hills and the deep sea |
| `drawBlueLines()` | five blue contour lines in the water |
| `drawLake()` | the lake, its reflections and the boats |
| `drawRightLake()` | the six shapes along the right shoreline |
| `drawBridge()` | the walkway, its shadow, the posts and the rails |
| `drawFigure()` | the body, the folds in the robe, the face and the hands |

`draw()` calls them from back to front, so changing the order changes
what sits in front of what.


## Time-based mechanic (Qiaoyi Xin)
