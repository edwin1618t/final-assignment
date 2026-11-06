// ===== PEOPLE =====
// Draws one person in a top hat and a long coat, in the same flat colours as our drawing.
// Used for the passerby who sometimes walks along the bridge (a random event).
// AI help: see the AI acknowledgement in README.md.


// ----- draws one person -----
// x and y = where their feet touch the ground
// tall    = how tall they are
// walking = true if their legs should swing
function drawPerson(x, y, tall, walking) {
  let darkBlue = "#10243C";

  // how far the legs swing (sin() goes back and forth like a wave)
  let swing = 0;
  if (walking) {
    swing = sin(frameCount * 0.15) * tall * 0.06;
  }

  // legs: two thick lines with round ends
  stroke(darkBlue);
  strokeWeight(tall * 0.05);
  strokeCap(ROUND);
  line(x, y - tall * 0.3, x + swing, y);
  line(x, y - tall * 0.3, x - swing, y);

  // coat: a smooth curvy shape, narrow at the shoulders and wide at the bottom
  noStroke();
  fill(darkBlue);
  beginShape();
  curveVertex(x - tall * 0.06, y - tall * 0.72);
  curveVertex(x - tall * 0.06, y - tall * 0.72);
  curveVertex(x + tall * 0.06, y - tall * 0.72);
  curveVertex(x + tall * 0.11, y - tall * 0.45);
  curveVertex(x + tall * 0.15, y - tall * 0.22);
  curveVertex(x - tall * 0.15, y - tall * 0.22);
  curveVertex(x - tall * 0.11, y - tall * 0.45);
  curveVertex(x - tall * 0.06, y - tall * 0.72);
  curveVertex(x - tall * 0.06, y - tall * 0.72);
  endShape(CLOSE);

  // head
  fill("#C1AC78");
  ellipse(x, y - tall * 0.8, tall * 0.11, tall * 0.13);

  // top hat: a brim and a tall top, with rounded corners
  fill(darkBlue);
  rect(x - tall * 0.09, y - tall * 0.875, tall * 0.18, tall * 0.025, 5);
  rect(x - tall * 0.055, y - tall * 0.99, tall * 0.11, tall * 0.12, 4);
}
