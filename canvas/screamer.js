// ===== SCREAMER =====
// Draws the screaming man exactly as in our Figma drawing:
// his dark body, the folds in his robe, his face, eyes, mouth and hands.
// The dark pupils follow the bee and enlarge as it approaches. After a bee sting, a pimple grows and he floats away.
// drawJumpScare() shows his face huge when you get too close.
// AI acknowledgement: our Figma drawing was turned into p5.js code with help from AI,
// and this file was organised with help from Claude (AI). See README.md.
// ChatGPT assisted with connecting Dawn's eye design to InputControls.
// Eye tracking, size changes and rendering are in mechanics/input.js.
// ChatGPT also helped connect Qiaoyi's frame-based attention and figure reaction.


function drawScreamer() {
  // after a sting he floats away and comes back (see getRunAway() below)
  let runAway = getRunAway();

  // push() and pop() keep the moving and flipping just for him
  push();
  translate(runAway.x, runAway.y);
  // The time mechanic adds a small reaction after the hover wait.
  timer.applyFigureReaction();

  // flip him so he looks the other way: scale(-1, 1) mirrors left and right
  // around the middle of his face (x = 476, so 2 * 476 = 952)
  if (runAway.mirrored) {
    translate(952, 0);
    scale(-1, 1);
  }

  // a ghost-like tail under him, only while he floats away and back
  if (runAway.floating) {
    drawGhostTail();
  }

  drawStillPart("figureSilhouette", "#10243C", [
    [381, 821],
    [346, 783, 342, 727, 359, 674],
    [374, 617, 423, 589, 474, 592],
    [536, 586, 574, 632, 582, 691],
    [598, 742, 578, 791, 568, 824],
    [590, 862, 595, 899, 593, 960],
    [595, 1039, 573, 1093, 543, 1140],
    [525, 1182, 518, 1245, 521, 1278],
    [293, 1278],
    [300, 1221, 316, 1165, 321, 1136],
    [328, 1112, 304, 1096, 304, 1043],
    [299, 990, 313, 920, 331, 866],
    [345, 833, 364, 826, 381, 821]
  ]);

  drawStillPart("figureLeftFold", "#405E98", [
    [388, 914],
    [372, 979, 331, 1040, 331, 1080],
    [329, 1111, 339, 1134, 333, 1170],
    [325, 1215, 318, 1244, 311, 1270],
    [322, 1211, 348, 1163, 348, 1118],
    [346, 1070, 365, 1000, 388, 914]
  ]);

  drawStillPart("figureRightFold", "#405D94", [
    [531, 940],
    [539, 1017, 512, 1093, 490, 1155],
    [469, 1215, 463, 1244, 458, 1268],
    [460, 1186, 499, 1101, 515, 1041],
    [524, 1008, 529, 972, 531, 940]
  ]);

  drawStillPart("figureFace", "#FFD580", [
    [479, 620],
    [433, 617, 405, 655, 403, 699],
    [397, 744, 417, 771, 434, 802],
    [449, 828, 453, 879, 478, 880],
    [505, 887, 511, 827, 524, 799],
    [541, 760, 554, 718, 548, 684],
    [544, 645, 514, 620, 479, 620]
  ]);

  noStroke();
  fill("#0B2D4E");

  // Dawn's eyes use the shared mouse, distance and distraction state.
  controls.drawTrackingEye(441, 721);
  controls.drawTrackingEye(508, 715);

  // figureMouth
  ellipse(481, 808, 34, 81);

  drawStillPart("figureLeftHand", "#FFD580", [
    [389, 696],
    [378, 680, 365, 722, 369, 754],
    [371, 789, 399, 815, 403, 845],
    [406, 872, 389, 900, 396, 911],
    [412, 932, 427, 895, 431, 869],
    [439, 827, 420, 804, 406, 781],
    [390, 751, 396, 711, 389, 696]
  ]);

  drawStillPart("figureRightHand", "#FFD580", [
    [562, 695],
    [573, 685, 580, 727, 576, 755],
    [572, 786, 558, 812, 554, 839],
    [551, 874, 562, 900, 565, 917],
    [569, 941, 547, 945, 538, 922],
    [528, 897, 521, 862, 523, 838],
    [524, 805, 544, 777, 551, 746],
    [557, 725, 554, 704, 562, 695]
  ]);

  // the pimples where the bee stung him
  drawPimples();

  pop();
}


// ----- round pimples that grow where the bee stung him -----
// ChatGPT assisted with the warm coral colour and smaller highlight.
function drawPimples() {
  push();
  noStroke();
  for (let pimple of screamer.pimples) {
    // Keep the original growth: reach 14 artwork units over 0.7 seconds.
    let size = map(millis() - pimple.startTime, 0, 700, 0, 14);
    size = constrain(size, 0, 14);

    fill("#E87965");
    ellipse(pimple.x, pimple.y, size, size);

    // A smaller, warm highlight keeps the original rounded appearance.
    fill("#F6BD98");
    ellipse(pimple.x - size * 0.2, pimple.y - size * 0.2, size * 0.2, size * 0.2);
  }
  pop();
}


// ----- a wavy ghost tail that grows smoothly out of the bottom of his robe -----
function drawGhostTail() {
  // sin() makes the tail sway from side to side, more towards the tip
  let sway = sin(frameCount * 0.15) * 30;

  noStroke();
  fill("#10243C");
  // curveVertex() joins the points with a smooth curve
  // the first and last points are further up his robe, so the tail
  // carries on the same curve as the robe and looks like one body
  beginShape();
  curveVertex(300, 1221);
  curveVertex(293, 1278);
  curveVertex(300 + sway * 0.2, 1370);
  curveVertex(345 + sway * 0.5, 1470);
  curveVertex(420 + sway, 1600);
  curveVertex(475 + sway * 0.5, 1470);
  curveVertex(512 + sway * 0.2, 1370);
  curveVertex(521, 1278);
  curveVertex(518, 1245);
  endShape(CLOSE);

  // fill the gap between the robe and the tail
  rect(293, 1250, 228, 30);
}


// ----- where he is while floating away after a sting -----
// gives back how far he has moved (x, y) and if he is flipped (mirrored)
function getRunAway() {
  let runAway = { x: 0, y: 0, mirrored: false, floating: false };
  if (state !== "stung") {
    return runAway;
  }

  let time = timer.timeInState();

  // the times for each part, from mechanics/time.js
  let leaveTime = 700;
  let goneTime = leaveTime + timer.floatAwayTime;
  let backTime = goneTime + timer.hideTime;

  if (time > leaveTime && time <= goneTime) {
    // he turns around and floats off to the edge
    let amount = map(time, leaveTime, goneTime, 0, 1);
    runAway.x = lerp(0, screamer.awayX, amount);
    runAway.y = lerp(0, screamer.awayY, amount);
    runAway.mirrored = true;
    runAway.floating = true;
  } else if (time > goneTime && time <= backTime) {
    // he stays away, out of the painting, for a while
    runAway.x = screamer.awayX;
    runAway.y = screamer.awayY;
    runAway.floating = true;
  } else if (time > backTime) {
    // he floats back to his place on the bridge
    let amount = constrain(map(time, backTime, backTime + timer.floatBackTime, 1, 0), 0, 1);
    runAway.x = lerp(0, screamer.awayX, amount);
    runAway.y = lerp(0, screamer.awayY, amount);
    runAway.floating = amount > 0;
  }
  return runAway;
}


// ----- the jump scare: his face slams into the screen, shakes, then disappears -----
// (called at the very end of draw() in script.js, so it covers everything)
function drawJumpScare() {
  // how long the jump scare has been going (in milliseconds)
  let time = timer.timeInState();

  // darken everything behind him
  noStroke();
  fill(0, 220);
  rect(0, 0, width, height);

  // the face starts too big and quickly slams down to "fill the screen" size
  let zoom = constrain(map(time, 0, 150, 1.6, 1), 1, 1.6);
  let faceScale = (height * 1.1 / 300) * zoom;

  // draw the same screamer, moved to the middle of the screen, made huge and shaking
  push();
  translate(width / 2 + noiseLayer.randomShake(), height / 2 + noiseLayer.randomShake());
  scale(faceScale);
  // the middle of his face (478, 750) goes to the middle of the screen
  translate(-478, -750);
  drawScreamer();
  pop();

  // a white flash at the start that fades away very fast
  let flash = constrain(map(time, 0, 150, 255, 0), 0, 255);
  noStroke();
  fill(255, flash);
  rect(0, 0, width, height);
}
