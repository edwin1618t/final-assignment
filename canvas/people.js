// ===== PEOPLE =====
// Draws one person in a top hat and a long dark coat,
// like the two dark figures walking on the bridge in The Scream.
// It is used for the two people at the far end of the bridge
// and for the random passerby in mechanics/noise.js.


// ----- draws one person -----
// x and y    = where their feet touch the ground
// tall       = how tall they are in pixels
// walking    = true if their arms and legs should swing
function drawPerson(x, y, tall, walking) {

  // how far the arms and legs swing
  // sin() goes up and down like a wave, so the legs go back and forth
  let swing = 0;
  if (walking) {
    swing = sin(frameCount * 0.15) * tall * 0.08;
  }

  // where each body part goes, worked out from how tall they are
  let hipY = y - tall * 0.3;
  let shoulderY = y - tall * 0.72;
  let headY = y - tall * 0.8;

  // the colours: almost black, like in the painting
  let coatColour = color(20, 20, 30);
  let faceColour = color(70, 60, 60);

  // ----- legs: two lines that swing in opposite directions -----
  stroke(coatColour);
  strokeWeight(tall * 0.05);
  line(x, hipY, x + swing, y);
  line(x, hipY, x - swing, y);

  // ----- shoes: small ellipses at the end of each leg -----
  noStroke();
  fill(coatColour);
  ellipse(x + swing + tall * 0.02, y, tall * 0.08, tall * 0.03);
  ellipse(x - swing + tall * 0.02, y, tall * 0.08, tall * 0.03);

  // ----- long coat: wider at the bottom than at the shoulders -----
  quad(
    x - tall * 0.07, shoulderY,
    x + tall * 0.07, shoulderY,
    x + tall * 0.13, hipY + tall * 0.08,
    x - tall * 0.13, hipY + tall * 0.08
  );

  // ----- arm: swings the opposite way to the legs -----
  stroke(coatColour);
  strokeWeight(tall * 0.045);
  line(x, shoulderY + tall * 0.03, x - swing * 0.7, hipY);

  // ----- head -----
  noStroke();
  fill(faceColour);
  ellipse(x, headY, tall * 0.11, tall * 0.13);

  // ----- top hat: a flat brim and a tall top -----
  fill(coatColour);
  rect(x - tall * 0.09, headY - tall * 0.08, tall * 0.18, tall * 0.025);
  rect(x - tall * 0.055, headY - tall * 0.2, tall * 0.11, tall * 0.13);
}
