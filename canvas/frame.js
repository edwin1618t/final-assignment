// ===== FRAME =====
// The painting is tall and thin, but the window can be any shape.
// So the painting sits in the middle of the window inside a wooden frame,
// and the space around it is filled with dark blue.
// AI acknowledgement: this file was written with help from Claude (AI). See README.md.


// ----- covers anything that sticks out of the painting, then draws the frame -----
function drawFrame() {
  // where the painting is on the screen (worked out in sketch.js)
  let left = painting.left;
  let top = painting.top;
  let w = 1050 * painting.scale;
  let h = 1278 * painting.scale;

  // dark blue on all four sides, covering shapes that go past the edge of the painting
  noStroke();
  fill("#081A30");
  rect(0, 0, left, height);
  rect(left + w, 0, width - left - w, height);
  rect(0, 0, width, top);
  rect(0, top + h, width, height - top - h);

  // a shadow under the frame
  fill("#040D19");
  rect(left + w + 18, top + 9, 7, h + 18);
  rect(left + 7, top + h + 18, w + 18, 9);

  // the wooden frame: a thin light edge and a thick dark edge
  noFill();
  stroke("#B59865");
  strokeWeight(5);
  rect(left - 2.5, top - 2.5, w + 5, h + 5);
  stroke("#514032");
  strokeWeight(13);
  rect(left - 11.5, top - 11.5, w + 23, h + 23);
}
