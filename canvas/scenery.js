// ===== SCENERY =====
// Draws the background of the painting: the sky, the fjord (water) and the land.


// (script.js draws these one at a time, so the swirl lines can go in between:
//  sky, then sky lines, then water, then water lines, then the land on top)


// ----- draws all the land (the far shore and the two hills) -----
function drawLand() {
  drawFarShore();
  drawLeftHill();
  drawRightHill();
}


// ----- the red and orange sky, made of wavy bands -----
function drawSky() {
  // to change the sky, change these numbers (red, green, blue)
  // colours of the sky from top to bottom
  let skyColours = [
    color(190, 55, 35),
    color(215, 85, 40),
    color(235, 130, 55),
    color(245, 175, 75),
    color(225, 120, 60),
    color(200, 150, 100),
    color(120, 140, 130)
  ];

  noStroke();

  // draw the bottom band first, so each band sits on top of the one below it
  // this repeats once for each colour in the list above
  for (let i = skyColours.length - 1; i >= 0; i--) {
    let bandBottom = height * 0.065 * (i + 1);

    fill(skyColours[i]);
    beginShape();
    vertex(0, 0);
    // this goes across the screen in steps of 20 pixels, adding a point each time
    for (let x = 0; x <= width; x += 20) {
      // sin() makes the bottom edge of the band go up and down like a wave
      // change 18 to make the waves bigger or smaller
      let y = bandBottom + sin(x * 0.008 + i) * 18;
      vertex(x, y);
    }
    vertex(width, 0);
    endShape(CLOSE);
  }
}


// ----- the dark blue fjord -----
function drawWater() {
  noStroke();
  fill(25, 45, 85);
  rect(0, height * 0.42, width, height * 0.58);

  // a lighter blue band where the light hits the water
  fill(45, 75, 120);
  beginShape();
  vertex(width * 0.35, height * 0.5);
  vertex(width * 0.6, height * 0.48);
  vertex(width * 0.85, height * 0.5);
  vertex(width * 0.8, height * 0.54);
  vertex(width * 0.45, height * 0.55);
  endShape(CLOSE);

  // two small boats far away on the fjord, like in the painting
  drawSmallBoat(width * 0.56, height * 0.465);
  drawSmallBoat(width * 0.62, height * 0.475);
}


// ----- one small boat far away -----
function drawSmallBoat(x, y) {
  noStroke();
  fill(40, 30, 30);
  // arc() draws half an ellipse for the bottom of the boat
  arc(x, y, 18, 7, 0, PI);
  fill(200, 190, 170);
  triangle(x, y, x, y - 12, x + 6, y);
}


// ----- the far shore with a small town -----
function drawFarShore() {
  noStroke();

  // dark blue hills on the far side
  fill(40, 55, 90);
  beginShape();
  vertex(width * 0.45, height * 0.46);
  vertex(width * 0.6, height * 0.4);
  vertex(width * 0.8, height * 0.41);
  vertex(width, height * 0.39);
  vertex(width, height * 0.47);
  vertex(width * 0.6, height * 0.47);
  endShape(CLOSE);

  // small houses and a church
  fill(170, 120, 80);
  rect(width * 0.66, height * 0.44, 10, 8);
  rect(width * 0.69, height * 0.445, 8, 6);
  rect(width * 0.73, height * 0.44, 6, 12);
  triangle(width * 0.73, height * 0.44, width * 0.73 + 6, height * 0.44, width * 0.73 + 3, height * 0.425);
}


// ----- the green hill on the left -----
function drawLeftHill() {
  noStroke();
  fill(45, 75, 50);
  beginShape();
  vertex(0, height * 0.36);
  vertex(width * 0.15, height * 0.37);
  vertex(width * 0.3, height * 0.42);
  vertex(width * 0.4, height * 0.5);
  vertex(width * 0.35, height * 0.58);
  vertex(width * 0.2, height * 0.62);
  vertex(0, height * 0.66);
  endShape(CLOSE);

  // a lighter green strip along the shore
  fill(80, 110, 60);
  beginShape();
  vertex(width * 0.28, height * 0.43);
  vertex(width * 0.38, height * 0.5);
  vertex(width * 0.34, height * 0.56);
  vertex(width * 0.3, height * 0.5);
  endShape(CLOSE);
}


// ----- the dark hill in the bottom right corner -----
function drawRightHill() {
  noStroke();
  fill(40, 65, 70);
  beginShape();
  vertex(width * 0.9, height * 0.5);
  vertex(width, height * 0.47);
  vertex(width, height);
  vertex(width * 0.8, height);
  vertex(width * 0.82, height * 0.8);
  vertex(width * 0.86, height * 0.62);
  endShape(CLOSE);

  // an orange line along the top, like the sunset lighting the hill
  noFill();
  stroke(210, 120, 60);
  strokeWeight(4);
  line(width * 0.9, height * 0.5, width, height * 0.47);
}
