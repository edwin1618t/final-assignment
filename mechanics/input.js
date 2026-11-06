// ===== MECHANIC 3: USER INPUT =====
// Your cursor becomes our bee, with fluttering wings.
// If the bee gets too close to his face while he is watching you, you get a jump scare.
// His face is the hitbox. Click his face while he is distracted and the bee stings him:
// a pimple grows and he floats away. Click at the wrong time and you get a jump scare.
// AI acknowledgement: the original shared input class was written with help
// from Claude (AI). ChatGPT assisted with integrating Dawn's eye tracking,
// distance-based pupil size, highlights and 20 x 45 eye scaling. See README.md.
// ChatGPT also helped combine this eye method with Qiaoyi's timed attention,
// and keep the face hitbox aligned while the time mechanic pulls the figure.
// ChatGPT also assisted with movement-based bee tilt and its gradual return.


class InputControls {

  // ----- set up the cursor -----
  constructor() {
    // hide the normal mouse arrow, we draw a bee instead
    noCursor();

    // how far the cursor is from the screamer's face (in painting units)
    this.distance = 1000;
    this.eyeMemory = {};

    // Screen pixels: compare consecutive frames to measure horizontal movement.
    this.previousMouseX = mouseX;
    this.beeTilt = 0;
  }


  // ----- runs every frame -----
  update() {
    let movementX = mouseX - this.previousMouseX;
    this.previousMouseX = mouseX;

    // Default angle units are radians: PI / 6 equals 30 degrees.
    // Reach maximum tilt at 4 screen pixels of horizontal movement per frame.
    let targetTilt = constrain(map(movementX, -4, 4, -PI / 6, PI / 6), -PI / 6, PI / 6);
    // Lean quickly while moving, but return upright more slowly when stopped.
    // Only the angle is smoothed; the bee's position still follows directly.
    let tiltResponse = 0.6;
    if (movementX === 0) {
      tiltResponse = 0.06;
    }
    this.beeTilt = lerp(this.beeTilt, targetTilt, tiltResponse);

    // dist() measures how far the bee is from the middle of his face (audio.js uses this)
    let point = timer.figurePoint(mouseInPainting.x, mouseInPainting.y);
    this.distance = dist(point[0], point[1], screamer.x, screamer.y);

    // the bee touches his face while he is watching you: jump scare!
    // (only after the sound has started, so the first click doesn't scare you)
    if (this.isOnFace() && state === "watching" && audio.started) {
      changeState("scare");
    }
  }


  // ----- is the bee on his face? (his face is the hitbox) -----
  isOnFace() {
    // his face is roughly an oval, so we check if the bee is inside that oval
    // (each part is 1 at the edge of the oval, so adding them up gives less than 1 inside it)
    let point = timer.figurePoint(mouseInPainting.x, mouseInPainting.y);
    let across = (point[0] - screamer.x) / (screamer.faceWidth / 2);
    let down = (point[1] - screamer.y) / (screamer.faceHeight / 2);
    return across * across + down * down < 1;
  }


  // Shared, read-only eligibility for both clicking and the face highlight.
  canSting() {
    return audio.started && state === "distracted" && timer.isOpen() && this.isOnFace();
  }


  // ----- draws our bee where the mouse is (in normal screen pixels) -----
  draw() {
    push();
    // Rotate around the existing mouse hotspot, keeping it aligned while tilting.
    // Position follows the mouse directly; only the angle uses lerp().
    translate(mouseX, mouseY);
    rotate(this.beeTilt);
    translate(-16, -8);

    // antennae
    stroke("#172132");
    strokeWeight(1.5);
    strokeCap(ROUND);
    line(14, 8, 11, 3);
    line(18, 8, 21, 3);

    // head and stinger
    noStroke();
    fill("#172132");
    ellipse(16, 10, 8, 8);
    triangle(14, 26, 16, 31, 18, 26);

    // yellow body with two dark stripes
    fill("#FFD34E");
    stroke("#172132");
    strokeWeight(1);
    ellipse(16, 20, 12, 16);
    noStroke();
    fill("#172132");
    rect(10.5, 15, 11, 3, 1.5);
    rect(10.5, 21, 11, 3, 1.5);

    // wings: they flutter by turning back and forth quickly with sin()
    let flutter = sin(frameCount * 0.9) * 0.5;
    fill(229, 246, 255, 110);
    stroke("#92C9DF");
    strokeWeight(1);
    this.drawWing(15, 14, -1, flutter);
    this.drawWing(17, 14, 1, -flutter);

    pop();
  }


  // ----- one bee wing: a curved, teardrop shape -----
  // side is -1 for the left wing and 1 for the right wing
  drawWing(x, y, side, turn) {
    push();
    translate(x, y);
    rotate(turn);
    beginShape();
    vertex(0, 0);
    bezierVertex(side * 5, -2, side * 13, 5, side * 11, 12);
    bezierVertex(side * 10, 17, side * 3, 13, 0, 4);
    endShape(CLOSE);
    pop();
  }


  // Draw one enlarged eye while keeping its centre and the face fixed.
  // Implemented with ChatGPT assistance: tracking, pupil size and eye rendering.
  drawTrackingEye(eyeX, eyeY) {
    // Use the shared painting coordinates; no SVG or separate input module needed.
    let point = timer.figurePoint(mouseInPainting.x, mouseInPainting.y);
    let targetX = point[0];
    let targetY = point[1];
    let pupilNearness = constrain(map(this.distance, 40, 350, 1, 0), 0, 1);

    // Qiaoyi's time mechanic controls when a hovered background is noticed.
    // Keep Dawn's pupil design and proximity sizing in this input class.
    if (state === "watching" && (timer.isHovering() || timer.attention > 0)) {
      let dent = timer.figurePoint(timer.dentX, timer.dentY);
      targetX = lerp(eyeX, dent[0], timer.attention);
      targetY = lerp(eyeY, dent[1], timer.attention);
    }

    // Random distractions keep their existing priority.
    if (state === "distracted") {
      targetX = noiseLayer.event.x;
      targetY = noiseLayer.event.y;
      pupilNearness = 0;
    }

    let offsetX = 0;
    let offsetY = 0;

    let dx = targetX - eyeX;
    let dy = targetY - eyeY;
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

    let pupilWidth = map(pupilNearness, 0, 1, 4, 10);
    let pupilHeight = map(pupilNearness, 0, 1, 10, 24);

    // Smooth only entry/exit of the existing event gaze; normal tracking stays intact.
    const key = eyeX + "," + eyeY;
    const memory = this.eyeMemory[key];
    if (memory && memory.state !== state &&
        (memory.state === "distracted" || state === "distracted")) {
      memory.from = { x: memory.x, y: memory.y, w: memory.w, h: memory.h };
      memory.start = millis();
    }
    if (memory && memory.from) {
      const t = constrain((millis()-memory.start) / AUDIO_DISTRACTION_SETTINGS.eyeTransitionMs, 0, 1);
      const blend = t*t*(3-2*t);
      offsetX = lerp(memory.from.x, offsetX, blend);
      offsetY = lerp(memory.from.y, offsetY, blend);
      pupilWidth = lerp(memory.from.w, pupilWidth, blend);
      pupilHeight = lerp(memory.from.h, pupilHeight, blend);
      if (t === 1) memory.from = null;
    }
    this.eyeMemory[key] = { state, x: offsetX, y: offsetY, w: pupilWidth, h: pupilHeight,
      from: memory ? memory.from : null, start: memory ? memory.start : 0 };

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


  // ----- runs when the mouse is clicked -----
  clicked() {
    // only clicks on his face count
    if (!this.isOnFace()) {
      return;
    }

    // inside the secret window: the bee stings him
    if (this.canSting()) {
      this.sting();
    }
    // at the wrong time: jump scare!
    else if (state === "watching") {
      changeState("scare");
    }
  }


  // ----- the sting: a pimple grows where you clicked, then he floats away -----
  sting() {
    // remember where the pimple goes, and when it started growing
    screamer.pimples.push({ x: mouseInPainting.x, y: mouseInPainting.y, startTime: millis() });

    // keep only the last 8 pimples
    if (screamer.pimples.length > 8) {
      screamer.pimples.shift();
    }

    // pick a random edge for him to float off to (pickRandomEdge() is in noise.js)
    let edge = noiseLayer.pickRandomEdge();
    screamer.awayX = edge[0];
    screamer.awayY = edge[1];

    // a short sound effect for the sting (stingSound is loaded in script.js)
    stingSound.play();

    changeState("stung");
  }
}


// ----- press Space to restart the whole experience -----
// ChatGPT assisted with connecting the p5.js keyboard event to a page restart.
function keyPressed() {
  if (key === " ") {
    // Browser API: reload to reset all mechanics and stop the current audio.
    // The start message returns; click again to begin with sound.
    window.location.reload();

    // In a p5.js event, returning false prevents Space from scrolling the page.
    return false;
  }
}
