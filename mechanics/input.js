// ===== MECHANIC 3: USER INPUT =====
// Your cursor becomes a fly. The screamer's eyes follow it.
// If the fly gets too close to his head while he is watching you, you get a jump scare.
// Clicking on him calms him down (inside the secret window) or gives you a jump scare (outside it).


class InputControls {

  // ----- set up the cursor -----
  constructor() {
    // hide the normal mouse arrow, we draw a fly instead
    noCursor();

    // how far the cursor is from the screamer
    this.distance = 0;
  }


  // ----- runs every frame -----
  update() {
    // dist() measures how far apart two points are
    this.distance = dist(mouseX, mouseY, screamer.x, screamer.y);

    // too close while he is staring at you: jump scare!
    // (change 2 to a bigger number to make it happen from further away)
    let tooClose = this.distance < screamer.r * 2;
    if (tooClose && state === "watching") {
      changeState("scare");
    }
  }


  // ----- draws the fly where the mouse is -----
  draw() {
    let x = mouseX;
    let y = mouseY;

    // wings flap up and down using sin(), which goes back and forth like a wave
    let flap = sin(frameCount * 0.8) * 3;
    noStroke();
    fill(220, 230, 255, 180);
    ellipse(x - 6, y - 4 + flap, 10, 6);
    ellipse(x + 6, y - 4 + flap, 10, 6);

    // body and head
    fill(20);
    ellipse(x, y, 8, 12);
    ellipse(x, y - 7, 6, 6);
  }


  // ----- runs when the mouse is clicked -----
  clicked() {
    // only clicks on the screamer count
    this.distance = dist(mouseX, mouseY, screamer.x, screamer.y);
    let clickedOnHim = this.distance < screamer.r * 1.5;
    if (!clickedOnHim) {
      return;
    }

    // inside the secret window: he calms down
    if (state === "distracted" && timer.isOpen()) {
      changeState("calm");
    }
    // at the wrong time: jump scare!
    else if (state === "watching") {
      changeState("scare");
    }
  }
}
