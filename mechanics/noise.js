// ===== MECHANIC 1: PERLIN NOISE + RANDOMNESS =====
// Perlin noise makes the whole background (sky, hills and water) slowly wave up and down.
// The bridge and the screamer stay still.
// Randomness picks a random event every few seconds: a boat crash, a bird or a passerby.
// The event distracts the screamer.
// All positions are in "painting units" (the painting is 1050 wide and 1278 tall).
// AI help (Claude): working out the coordinates and numbers for these effects, and
// writing and commenting the code. I designed how it behaves and tuned it. See README.md.


class NoiseLayer {

  // ----- set up the noise, the boats and the first event -----
  constructor() {
    // a random seed: one random number that sets up all the noise and randomness,
    // so every visit gets its own pattern (print() shows it in the console,
    // and using the same number again replays the same pattern)
    this.seed = floor(random(1000000));
    noiseSeed(this.seed);
    randomSeed(this.seed);
    print("seed: " + this.seed);

    // grows a tiny bit every frame, so the noise keeps changing
    this.time = 0;

    // how much the time grows each frame (how fast the waves flow)
    this.speed = 0.025;

    // the event happening right now: "none", "boatCrash", "bird" or "passerby"
    this.event = { type: "none", x: 0, y: 0, progress: 0 };

    // true only on the frame an event starts
    this.justStarted = false;

    // when the next event happens (between 4 and 8 seconds from now)
    this.nextEventTime = millis() + random(4000, 8000);

    // the two little boats from our drawing on the lake
    // homeX = where they float, push = how far the crash knocked them, tilt = how much they rock
    this.boats = [
      { homeX: 380, y: 567, push: 0, tilt: 0, hullWidth: 20, mastHeight: 13 },
      { homeX: 260, y: 563, push: 0, tilt: 0, hullWidth: 26, mastHeight: 15 }
    ];

    // the boat that sails in and crashes (only used during a boat crash)
    this.crashBoat = { x: 0, y: 566, tilt: 0, crashed: false, crashTime: 0 };
  }


  // ----- runs every frame -----
  update() {
    // how fast the waves flow: fast at the start, crazy fast when the bee is near his face,
    // and slowly calming down after he has been stung
    let targetSpeed = map(controls.distance, 800, 100, 0.025, 0.07);
    targetSpeed = constrain(targetSpeed, 0.025, 0.07);
    if (state === "stung") {
      targetSpeed = 0.003;
    }
    // lerp() changes the speed a little each frame, so it speeds up and calms down smoothly
    this.speed = lerp(this.speed, targetSpeed, 0.02);
    this.time = this.time + this.speed;
    this.justStarted = false;

    // time for a new random event?
    if (this.event.type === "none" && millis() > this.nextEventTime) {
      this.startEvent();
    }

    // move the event that is happening
    if (this.event.type === "boatCrash") {
      this.moveBoatCrash();
    } else if (this.event.type !== "none") {
      this.moveEvent();
    }

    // after a crash, the boats slowly float back home and stop rocking
    for (let boat of this.boats) {
      if (this.event.type !== "boatCrash") {
        boat.push = lerp(boat.push, 0, 0.01);
        boat.tilt = lerp(boat.tilt, 0, 0.05);
      }
    }
  }


  // ----- tells sketch.js if an event started this frame -----
  eventStarted() {
    return this.justStarted;
  }


  // ===== the waving background =====

  // ----- how far a point of the background moves up or down right now -----
  // (drawPath() in canvas/scenery.js uses this for every point of the sky, hills and water)
  wobbleAt(x, y) {
    // points at the very top and bottom stay still, so no gaps open up
    if (y <= 1 || y >= 1270) {
      return 0;
    }

    // the closer the bee is to his face, the bigger the waves; after a sting = small waves
    let closeness = constrain(map(controls.distance, 800, 100, 0, 1), 0, 1);
    let amount = 18 + closeness * 30;
    if (state === "stung") {
      amount = 6;
    }

    // noise() gives a smooth random number between 0 and 1 that changes slowly with time
    // the same point always gets the same number, so parts that share an edge stay joined
    return map(noise(x * 0.004, y * 0.004, this.time), 0, 1, -amount, amount);
  }


  // ----- the colour of a waving part, made a little lighter or darker by noise -----
  // (drawWavyPart() in canvas/scenery.js uses this, so the sky and water shimmer)
  // x, y = the first point of the part, so each part shimmers differently
  shimmer(colour, x, y) {
    let baseColour = color(colour);

    // noise() gives a smooth number between 0 and 1; map() turns it into -0.3 to 0.3
    let amount = map(noise(x * 0.01, y * 0.01, this.time * 0.5), 0, 1, -0.3, 0.3);

    // above 0: mix in some white (lighter); below 0: mix in some black (darker)
    if (amount > 0) {
      return lerpColor(baseColour, color(255, 240, 200), amount);
    } else {
      return lerpColor(baseColour, color(10, 15, 40), -amount);
    }
  }


  // ----- picks a random edge of the painting for him to float off to after a sting -----
  pickRandomEdge() {
    let edges = [[-900, -100], [900, -100], [0, -1700], [-900, 300], [900, 300]];
    return random(edges);
  }


  // ----- a random length for the secret window, between 5 and 10 seconds (time.js uses this) -----
  randomWindowLength() {
    return random(5000, 10000);
  }


  // ----- a random shake for the jump scare (screamer.js uses this) -----
  randomShake() {
    return random(-15, 15);
  }


  // ===== random events =====

  // ----- picks a random event -----
  startEvent() {
    let type = random(["boatCrash", "bird", "passerby"]);
    this.event = { type: type, x: 0, y: 0, progress: 0 };
    this.justStarted = true;

    // the crash boat starts on the right side of the lake
    if (type === "boatCrash") {
      this.crashBoat.x = 900;
      this.crashBoat.crashed = false;
    }
  }


  // ----- ends the event and waits a random time for the next one -----
  endEvent() {
    this.event.type = "none";
    this.nextEventTime = millis() + random(4000, 9000);
  }


  // ----- moves the bird or the passerby along its path -----
  moveEvent() {
    // progress goes from 0 (start of its path) to 1 (end of its path)
    this.event.progress = this.event.progress + 0.003;
    let progress = this.event.progress;

    if (this.event.type === "bird") {
      // flies across the sky from left to right, going up and down a little
      this.event.x = lerp(-50, 1100, progress);
      this.event.y = 200 + sin(progress * 20) * 25;
    } else if (this.event.type === "passerby") {
      // walks along the bridge towards you (feetY() is in canvas/bridge.js)
      this.event.x = lerp(-80, 720, progress);
      this.event.y = feetY(this.event.x);
    }

    if (progress >= 1) {
      this.endEvent();
    }
  }


  // ----- the boat crash: a boat sails in from the right and hits the first little boat -----
  moveBoatCrash() {
    let boat = this.crashBoat;
    let target = this.boats[0];
    let targetX = target.homeX + target.push;

    if (!boat.crashed) {
      // sail left towards the other boat
      boat.x = boat.x - 2;

      // dist() checks how close the two boats are: close enough = crash!
      if (dist(boat.x, boat.y, targetX, target.y) < 50) {
        boat.crashed = true;
        boat.crashTime = millis();
      }
    } else {
      // after the crash: the boats bounce apart and rock
      let timeSinceCrash = millis() - boat.crashTime;

      // the rocking gets smaller over 3 seconds
      let rocking = map(timeSinceCrash, 0, 3000, 0.4, 0);
      rocking = constrain(rocking, 0, 0.4);

      boat.x = boat.x + 0.8;
      boat.tilt = sin(frameCount * 0.3) * rocking;
      target.push = lerp(target.push, -70, 0.05);
      target.tilt = sin(frameCount * 0.3 + 1) * rocking;

      if (timeSinceCrash > 3500) {
        this.endEvent();
      }
    }

    // the screamer looks at where the crash is
    this.event.x = boat.x;
    this.event.y = boat.y;
  }


  // ===== drawing =====

  // ----- the little boats: they drift gently, and the crash boat during a crash -----
  drawBoats() {
    for (let i = 0; i < this.boats.length; i++) {
      let boat = this.boats[i];
      // sin() makes each boat drift slowly left and right
      let drift = sin(this.time + i * 2) * 15;
      drawSmallBoat(boat.homeX + drift + boat.push, boat.y, boat.tilt, boat.hullWidth, boat.mastHeight);
    }

    if (this.event.type === "boatCrash") {
      drawSmallBoat(this.crashBoat.x, this.crashBoat.y, this.crashBoat.tilt, 22, 14);
    }
  }


  // ----- the bird (drawn in the sky) -----
  drawBird() {
    if (this.event.type !== "bird") {
      return;
    }
    let x = this.event.x;
    let y = this.event.y;

    // the wings flap up and down with sin()
    let flap = sin(frameCount * 0.4) * 25;
    noFill();
    stroke("#10243C");
    strokeWeight(9);
    strokeCap(ROUND);
    // each wing is a small curve
    bezier(x - 55, y - flap, x - 32, y - 22, x - 14, y - 8, x, y);
    bezier(x, y, x + 14, y - 8, x + 32, y - 22, x + 55, y - flap);
  }


  // ----- the passerby (drawn after the bridge, so they walk on it) -----
  drawPasserby() {
    if (this.event.type !== "passerby") {
      return;
    }
    // drawPerson() is in canvas/people.js, personHeightAt() is in canvas/bridge.js
    drawPerson(this.event.x, this.event.y, personHeightAt(this.event.x) * 1.4, true);
  }
}


// ----- one little boat in our drawing's style: a dark hull and a mast -----
// the same sizes as in our drawing; tilt = how much it leans (for rocking after the crash)
function drawSmallBoat(x, y, tilt, hullWidth, mastHeight) {
  push();
  translate(x, y);
  rotate(tilt);
  // scale() makes the boats bigger so they are easy to notice
  scale(2.2);
  noStroke();
  fill("#3B2A2A");
  rect(-hullWidth / 2, 0, hullWidth, 3);
  rect(-1, -mastHeight, 2, mastHeight);
  // a small pale sail so the boat stands out on the water
  fill(240, 225, 190);
  triangle(1, -mastHeight, 1, -2, hullWidth / 2, -2);
  pop();
}
