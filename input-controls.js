
/*
IDEA9103 - User Input
Bee Cursor - p5.js

The bee follows the mouse across the entire webpage.
It is drawn on a separate transparent p5.js canvas.
*/

let beeOverlay = null;

// Store the mouse position in screen coordinates.
let beeMouseX = -100;
let beeMouseY = -100;
let beeMouseVisible = false;

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

// Keep this function for compatibility with sketch.js.
// The bee is now drawn by its own p5.js instance.
function drawBeeCursor() {
}
