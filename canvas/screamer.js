// ===== SCREAMER =====
// Draws the screaming man: his body, his arms, his hands, his eyes and his head (a picture).
// How he looks depends on the state: watching, distracted, calm or scare.
// "scare" is the jump scare: his face suddenly fills the whole screen.


// ----- variables -----

// the picture of his head (loaded in preload() in script.js)
let headImage;


// ----- draws the whole screamer -----
function drawScreamer() {
  let x = screamer.x;
  let y = screamer.y;
  let size = screamer.r;

  drawBody(x, y, size);
  drawArms(x, y, size);
  drawEyes(x, y, size);
  drawHead(x, y, size);
  drawHands(x, y, size);
}


// ----- the jump scare: his face slams into the screen, shakes, then disappears -----
// (this is called at the very end of draw() in script.js, so it covers everything)
function drawJumpScare() {
  // how long the jump scare has been going (in milliseconds)
  let time = timer.timeInState();

  // darken everything behind his face
  noStroke();
  fill(0, 220);
  rect(0, 0, width, height);

  // the face starts too big and slams down to "fill the screen" size very quickly
  // map() turns the time (0 to 150 milliseconds) into a zoom (1.6 down to 1)
  let zoom = map(time, 0, 150, 1.6, 1);
  zoom = constrain(zoom, 1, 1.6);

  // the face is a bit taller than the screen
  let faceSize = (height * 1.25 / 3.8) * zoom;

  // shake the face around the middle of the screen
  let faceX = width / 2 + random(-15, 15);
  let faceY = height / 2 + random(-15, 15);

  // the same eyes and head as normal, just huge
  drawEyes(faceX, faceY, faceSize);
  drawHead(faceX, faceY, faceSize);

  // a white flash right at the start that fades away very fast
  let flash = map(time, 0, 150, 255, 0);
  flash = constrain(flash, 0, 255);
  fill(255, flash);
  rect(0, 0, width, height);
}


// ----- the dark wavy coat -----
function drawBody(x, y, size) {
  noStroke();
  fill(35, 35, 55);
  beginShape();
  vertex(x - size * 0.5, y + size * 1.2);
  vertex(x + size * 0.5, y + size * 1.2);
  vertex(x + size * 1.1, y + size * 2.5);
  vertex(x + size * 0.9, y + size * 4);
  vertex(x + size * 1.6, y + size * 7);
  vertex(x - size * 1.4, y + size * 7);
  vertex(x - size * 0.8, y + size * 4);
  vertex(x - size * 1.1, y + size * 2.5);
  endShape(CLOSE);
}


// ----- the arms: from the hands out to the elbows, then back to the body -----
function drawArms(x, y, size) {
  stroke(35, 35, 55);
  strokeWeight(size * 0.3);

  // left arm
  line(x - size * 0.8, y + size * 0.9, x - size * 1.1, y + size * 1.8);
  line(x - size * 1.1, y + size * 1.8, x - size * 0.6, y + size * 2.6);

  // right arm
  line(x + size * 0.8, y + size * 0.9, x + size * 1.1, y + size * 1.8);
  line(x + size * 1.1, y + size * 1.8, x + size * 0.6, y + size * 2.6);
}


// ----- the eyes, drawn behind the head picture so they show through the holes -----
function drawEyes(x, y, size) {
  // the head picture's size and top left corner
  let headWidth = size * 2.6;
  // this keeps the picture's shape, using its real width and height
  let headHeight = headWidth * headImage.height / headImage.width;
  let left = x - headWidth / 2;
  let top = y - headHeight / 2;

  // where the eye holes are in the picture
  let leftEyeX = left + headWidth * 0.265;
  let leftEyeY = top + headHeight * 0.27;
  let rightEyeX = left + headWidth * 0.71;
  let rightEyeY = top + headHeight * 0.255;
  let eyeSize = headWidth * 0.17;

  // what he is looking at: your cursor, or the random event that distracted him
  let targetX = mouseX;
  let targetY = mouseY;
  if (state === "distracted") {
    targetX = noiseLayer.event.x;
    targetY = noiseLayer.event.y;
  }

  // move the pupils towards the target
  // map() turns the target position on the screen into a small movement inside the eye
  let lookX = map(targetX, 0, width, -eyeSize * 0.3, eyeSize * 0.3);
  let lookY = map(targetY, 0, height, -eyeSize * 0.2, eyeSize * 0.2);

  // white of the eyes
  noStroke();
  fill(230, 225, 205);
  ellipse(leftEyeX, leftEyeY, eyeSize * 1.2, eyeSize);
  ellipse(rightEyeX, rightEyeY, eyeSize * 1.2, eyeSize);

  // pupils (smaller when he is calm)
  let pupilSize = eyeSize * 0.45;
  if (state === "calm") {
    pupilSize = eyeSize * 0.3;
  }
  fill(20);
  ellipse(leftEyeX + lookX, leftEyeY + lookY, pupilSize);
  ellipse(rightEyeX + lookX, rightEyeY + lookY, pupilSize);
}


// ----- the head picture, coloured differently for each state -----
function drawHead(x, y, size) {
  let headWidth = size * 2.6;
  let headHeight = headWidth * headImage.height / headImage.width;

  // the picture itself, a bit yellow like the face in the painting
  // tint() colours the picture, noTint() turns it off again
  tint(245, 240, 200);
  image(headImage, x - headWidth / 2, y - headHeight / 2, headWidth, headHeight);
  noTint();

  // a see-through colour over the face changes his mood
  noStroke();
  if (state === "distracted") {
    fill(240, 220, 180, 50);
  } else if (state === "calm") {
    fill(240, 180, 140, 70);
  } else {
    fill(0, 0);
  }
  ellipse(x, y + headHeight * 0.05, headWidth * 0.6, headHeight * 0.8);
}


// ----- the hands, pressed against his cheeks -----
function drawHands(x, y, size) {
  // left hand leans one way, right hand leans the other way
  drawOneHand(x - size * 0.75, y + size * 0.5, size, -1);
  drawOneHand(x + size * 0.75, y + size * 0.5, size, 1);
}


// ----- one long thin hand with four fingers and a thumb -----
// side is -1 for the left hand and 1 for the right hand
function drawOneHand(x, y, size, side) {
  // the pale greenish skin colour from the painting
  let skin = color(190, 185, 145);

  // push() and pop() keep the turning (rotate) just for this hand
  push();
  translate(x, y);
  rotate(side * 0.2);

  // the palm: a long thin oval
  noStroke();
  fill(skin);
  ellipse(0, size * 0.15, size * 0.32, size * 0.6);

  // the four fingers: this repeats 4 times, drawing one finger each time
  stroke(skin);
  strokeWeight(size * 0.07);
  for (let i = 0; i < 4; i++) {
    // spread the fingers out across the top of the palm
    let fingerX = map(i, 0, 3, -size * 0.1, size * 0.1);

    // the middle fingers are a little longer than the outside ones
    let fingerLength = size * 0.42;
    if (i === 0 || i === 3) {
      fingerLength = size * 0.34;
    }

    line(fingerX, 0, fingerX * 1.2, -fingerLength);
  }

  // the thumb points in towards his face
  line(-side * size * 0.12, size * 0.2, -side * size * 0.24, size * 0.0);

  pop();
}
