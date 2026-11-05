// ===== BRIDGE =====
// Draws the wooden bridge, its railing and the two people at the far end.
// The bridge is drawn in perspective (3D): it comes from far away at the top left,
// runs steeply down behind the screamer, and leaves the screen at the bottom right.


// ----- draws the whole bridge -----
function drawBridge() {
  drawDeck();
  drawRailing();

  // the people are drawn after the railing, so they stand on the bridge in front of it
  drawFarFigures();
}


// ----- where the bottom of the railing is, at any x across the screen -----
// the railing starts near the top of the left edge
// and reaches the bottom of the screen about three quarters of the way across
// map() works out where the railing is in between those two points
function bridgeEdgeY(x) {
  return map(x, 0, width * 0.74, height * 0.07, height);
}


// ----- how tall the railing is, at any x across the screen -----
// far away (left) it is small, close to us (right) it is big: this is what makes it look 3D
function railHeightAt(x) {
  return map(x, 0, width * 0.74, height * 0.03, height * 0.12);
}


// ----- how tall a person standing at x should be -----
// a person is a bit more than twice as tall as the railing next to them
function personHeightAt(x) {
  return railHeightAt(x) * 2.3;
}


// ----- the floor of the bridge -----
function drawDeck() {
  noStroke();
  // fill() sets the colour as (red, green, blue), each from 0 to 255
  fill(150, 90, 50);
  beginShape();
  vertex(0, bridgeEdgeY(0));
  vertex(width * 0.74, height);
  vertex(0, height);
  endShape(CLOSE);

  // the planks: lines that all start from the far end of the bridge and spread out towards us
  // (lines coming from one point is what makes things look 3D)
  stroke(120, 70, 40);
  strokeWeight(2);
  let farEndX = 0;
  let farEndY = bridgeEdgeY(0);
  // this repeats 10 times, drawing one plank line each time
  for (let i = 1; i <= 10; i++) {
    let bottomX = map(i, 0, 10, width * 0.74, -width * 0.8);
    line(farEndX, farEndY, bottomX, height);
  }
}


// ----- the two dark people standing at the far end of the bridge -----
// (drawPerson() is in canvas/people.js)
function drawFarFigures() {
  // first person, standing on the bridge just behind the screamer
  // their feet are just in front of the railing, and their size matches the railing there
  let x1 = width * 0.29;
  drawPerson(x1, bridgeEdgeY(x1) + height * 0.02, personHeightAt(x1), false);

  // second person, a little closer to us, so a little bigger
  let x2 = width * 0.35;
  drawPerson(x2, bridgeEdgeY(x2) + height * 0.02, personHeightAt(x2), false);
}


// ----- the railing along the edge of the bridge -----
function drawRailing() {
  stroke(90, 50, 30);

  // the bottom rail runs along the edge of the bridge
  strokeWeight(6);
  line(0, bridgeEdgeY(0), width * 0.74, bridgeEdgeY(width * 0.74));

  // the top rail is higher by the railing's height, which grows towards us
  strokeWeight(10);
  let endX = width * 0.74;
  line(0, bridgeEdgeY(0) - railHeightAt(0), endX, bridgeEdgeY(endX) - railHeightAt(endX));

  // the posts: this repeats 19 times, once for each post
  // the posts get further apart as they come towards us, because closer things look bigger
  let posts = 18;
  for (let i = 0; i <= posts; i++) {
    // amount goes from 0 to 1, and multiplying it by itself spaces the posts out more at the near end
    let amount = i / posts;
    amount = amount * amount;

    let x = lerp(0, width * 0.74, amount);
    let bottom = bridgeEdgeY(x);
    let top = bottom - railHeightAt(x);

    // posts close to us are thicker
    strokeWeight(map(x, 0, width * 0.74, 3, 10));
    line(x, top, x, bottom);
  }
}
