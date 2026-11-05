
/*
IDEA9103 - User Input
Bee Cursor - p5.js

The bee follows the mouse across the entire webpage.
It is drawn on a separate transparent p5.js canvas.

AI assistance acknowledgement:
ChatGPT assisted with implementing the full-page bee overlay and cursor hiding,
converting viewport positions to artwork coordinates, calculating face distance,
and adding the distance interface for future audio integration.
ChatGPT also assisted with pupil tracking, distance-based pupil size changes,
movement limits, highlights and eye scaling. Visual sizes were adjusted
iteratively based on Yuqian Zhang's (Dawn's) feedback.
*/

let beeOverlay = null;

// Store the mouse position in screen coordinates.
let beeMouseX = -100;
let beeMouseY = -100;
let beeMouseVisible = false;

// USER INPUT - Eye tracking, in the original artwork coordinates.
let artworkElement = null;
let beeArtworkPosition = { x: 0, y: 0 };
let beeDistance = null;
let faceCentre = { x: 477, y: 750 };
let pupilNearness = 0;

// Track the actual mouse position across the webpage.
window.addEventListener("pointermove", function(event) {
  beeMouseX = event.clientX;
  beeMouseY = event.clientY;
  beeMouseVisible = true;
});

document.addEventListener("pointerleave", function() {
  beeMouseVisible = false;
});

window.addEventListener("blur", function() {
  beeMouseVisible = false;
});

// Keep this function because sketch.js calls it.
// The separate p5 instance loads the bee itself.
function preloadInputControls() {
}

// Called from setup() in sketch.js.
function setupInputControls() {

  // Prevent creating multiple bee canvases.
  if (beeOverlay !== null) {
    return;
  }

  // Select the drawing itself, excluding the frame's border and padding.
  artworkElement = select("#artwork svg").elt;

  // Create a separate p5.js instance.
  beeOverlay = new p5(function(p) {

    let beeImage;

    // Load the existing SVG file.
    p.preload = function() {
      beeImage = p.loadImage("bee.svg");
    };

    p.setup = function() {

      // Create a full-window transparent canvas.
      let beeCanvas = p.createCanvas(
        p.windowWidth,
        p.windowHeight
      );

      // p5.js hides the cursor on this instance's canvas.
      p.noCursor();

      // The overlay lets pointer events pass through, so noCursor() alone
      // cannot hide the cursor over the page beneath it.
      // p5.js DOM methods set a cursor style inherited by page elements.
      p.select("html").style("cursor", "none");
      p.select("body").style("cursor", "none");

      // Position the canvas over the entire webpage.
      beeCanvas.elt.style.position = "fixed";
      beeCanvas.elt.style.left = "0";
      beeCanvas.elt.style.top = "0";
      beeCanvas.elt.style.zIndex = "9999";

      // Allow clicks to pass through to the artwork.
      beeCanvas.elt.style.pointerEvents = "none";

      // No margins or borders.
      beeCanvas.elt.style.margin = "0";
      beeCanvas.elt.style.padding = "0";
      beeCanvas.elt.style.border = "none";

      // Keep the image aligned using its top-left corner.
      p.imageMode(p.CORNER);

      // Use a faster drawing rate.
      p.frameRate(60);

      // Transparent background.
      p.clear();
    };

    p.draw = function() {

      // Clear the previous bee position.
      p.clear();

      if (!beeMouseVisible) {
        return;
      }

      if (!beeImage || beeImage.width <= 0) {
        return;
      }

      // Display size in screen pixels.
      let beeSize = 32;

      // Match the hotspot from the original CSS cursor:
      // cursor: url("./bee.svg") 16 8, auto;
      let hotspotX = 16;
      let hotspotY = 8;

      // Draw the bee at the actual mouse position.
      p.image(
        beeImage,
        beeMouseX - hotspotX,
        beeMouseY - hotspotY,
        beeSize,
        beeSize
      );
    };

    // Keep the overlay aligned when the window changes.
    p.windowResized = function() {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

  });
}

// Called once per artwork frame, before drawing the figure.
// Implemented with ChatGPT assistance: coordinate conversion and face distance.
function updateInputControls() {
  beeDistance = null;
  pupilNearness = 0;

  if (!beeMouseVisible || artworkElement === null) {
    return;
  }

  // DOM API: the SVG's current position and size in viewport pixels.
  // Reading each frame also accounts for resizing and page scrolling.
  let bounds = artworkElement.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) {
    return;
  }

  // clientX/clientY and bounds use the same viewport origin.
  // Keep positions outside the artwork, so the eyes can follow there too.
  beeArtworkPosition.x = (beeMouseX - bounds.left) * width / bounds.width;
  beeArtworkPosition.y = (beeMouseY - bounds.top) * height / bounds.height;

  let dx = beeArtworkPosition.x - faceCentre.x;
  let dy = beeArtworkPosition.y - faceCentre.y;
  // JavaScript Math.sqrt(): Pythagoras gives the straight-line distance.
  beeDistance = Math.sqrt(dx * dx + dy * dy);

  // Trial settings in artwork units: largest within 40, smallest beyond 350.
  pupilNearness = constrain(map(beeDistance, 40, 350, 1, 0), 0, 1);
}

// Audio can read this later. null means there is no valid mouse position.
function getBeeDistance() {
  return beeDistance;
}

// Draw one enlarged eye while keeping its centre and the face fixed.
// Implemented with ChatGPT assistance: tracking, pupil size and eye rendering.
function drawTrackingEye(eyeX, eyeY) {
  let offsetX = 0;
  let offsetY = 0;

  if (beeDistance !== null) {
    let dx = beeArtworkPosition.x - eyeX;
    let dy = beeArtworkPosition.y - eyeY;
    let eyeDistance = Math.sqrt(dx * dx + dy * dy);

    if (eyeDistance > 0) {
      // Divide by distance to get direction; limit travel inside the eye.
      // Reduce movement near the eye centre instead of jumping across it.
      let strength = constrain(eyeDistance / 80, 0, 1);
      // Larger pupils have less room to move inside the same eye outline.
      let travelX = map(pupilNearness, 0, 1, 1.5, 1);
      let travelY = map(pupilNearness, 0, 1, 5, 3);
      offsetX = dx / eyeDistance * travelX * strength;
      offsetY = dy / eyeDistance * travelY * strength;
    }
  }

  let pupilWidth = map(pupilNearness, 0, 1, 4, 10);
  let pupilHeight = map(pupilNearness, 0, 1, 10, 24);

  push();
  // Move the drawing origin to this eye's centre, then enlarge all eye parts.
  // The original 14 x 33 outline becomes 20 x 45.
  translate(eyeX, eyeY);
  scale(20 / 14, 45 / 33);
  noStroke();
  fill("#FFF0C9");
  ellipse(0, 0, 14, 33);

  fill("#0B2D4E");
  ellipse(offsetX, offsetY, pupilWidth, pupilHeight);

  // A small highlight travels with the pupil.
  fill("#FFFFFF");
  ellipse(offsetX - 0.6, offsetY - 2, 1.6, 2.5);
  pop();
}

// Keep this function for compatibility with sketch.js.
// The bee is now drawn by its own p5.js instance.
function drawBeeCursor() {
}
