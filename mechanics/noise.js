// ===== MECHANIC 1: PERLIN NOISE + RANDOMNESS =====
// Noise makes the sky and water lines swirl and wobble all the time.
// Randomness picks a random event (a passerby, a boat or a bird) every few seconds.


class NoiseLayer {

  // ----- set up the swirl lines and the first event -----
  constructor() {
    // time value that slowly grows, so the noise keeps changing
    this.time = 0;

    // the event happening right now (or none)
    this.event = { type: "none", x: 0, y: 0, progress: 0 };

    // true only on the frame an event starts
    this.justStarted = false;

    // when the next event will happen (in milliseconds)
    // random(4000, 8000) means between 4 and 8 seconds from now
    this.nextEventTime = millis() + random(4000, 8000);
  }


  // ----- runs every frame -----
  update() {
    // the time grows a tiny bit every frame, which makes the noise lines move
    this.time = this.time + 0.008;
    this.justStarted = false;

    // time for a new random event?
    if (this.event.type === "none" && millis() > this.nextEventTime) {
      this.startEvent();
    }

    // move the event that is happening
    if (this.event.type !== "none") {
      this.moveEvent();
    }
  }


  // ----- tells script.js if an event started this frame -----
  eventStarted() {
    return this.justStarted;
  }




  // ===== swirl lines =====

  // how much the lines wobble (more when it's loud, less when he is calm)
  wobbleAmount() {
    let amount = 15 + audio.level * 35;
    if (state === "calm") {
      amount = 6;
    }
    return amount;
  }


  // ----- thick flowing lines across the sky that slowly change colour -----
  drawSkyLines() {
    let amount = this.wobbleAmount();
    noFill();
    strokeWeight(10);

    // the two colours each line slowly fades between
    let warm = color(255, 220, 90, 110);
    let hot = color(200, 30, 60, 110);

    // this repeats 9 times, drawing one line each time
    for (let i = 0; i < 9; i++) {
      // sin() goes back and forth between -1 and 1, so the colour fades back and forth
      // map() turns that into a number from 0 to 1 for lerpColor()
      let colourMix = map(sin(this.time * 2 + i), -1, 1, 0, 1);
      // lerpColor() mixes the two colours
      stroke(lerpColor(warm, hot, colourMix));

      let baseY = height * 0.045 * (i + 1);

      // curveVertex() joins the points with smooth curves instead of sharp corners
      beginShape();
      curveVertex(-60, baseY);
      for (let x = -60; x <= width + 60; x += 60) {
        // the same wave shape as the sky bands, so the lines follow the painting
        let wave = sin(x * 0.008 + i + this.time) * 18;
        // noise() gives a smooth random number between 0 and 1
        // map() turns it into a slow wobble between -amount and +amount
        let wobble = map(noise(x * 0.002, i * 0.4, this.time), 0, 1, -amount, amount);
        // constrain() stops the line going below the bottom of the sky
        let y = constrain(baseY + wave + wobble, 0, height * 0.4);
        curveVertex(x, y);
      }
      curveVertex(width + 60, baseY);
      endShape();
    }
  }


  // ----- thick flowing lines across the water -----
  drawWaterLines() {
    let amount = this.wobbleAmount();
    noFill();
    strokeWeight(8);

    // the two blues each line slowly fades between
    let lightBlue = color(110, 160, 220, 110);
    let darkBlue = color(40, 60, 140, 110);

    // this repeats 6 times, drawing one line each time
    for (let i = 0; i < 6; i++) {
      // same colour fading idea as the sky lines
      let colourMix = map(sin(this.time * 2 + i * 1.5), -1, 1, 0, 1);
      stroke(lerpColor(lightBlue, darkBlue, colourMix));

      let baseY = height * 0.48 + i * height * 0.04;

      beginShape();
      curveVertex(width * 0.3, baseY);
      for (let x = width * 0.3; x <= width + 60; x += 60) {
        // a gentle wave plus a slow noise wobble, like the sky lines
        let wave = sin(x * 0.01 - this.time + i) * 10;
        let wobble = map(noise(x * 0.003, i * 0.5 + 50, this.time), 0, 1, -amount, amount);
        // constrain() keeps the line inside the water
        let y = constrain(baseY + wave + wobble, height * 0.46, height * 0.75);
        curveVertex(x, y);
      }
      curveVertex(width + 60, baseY);
      endShape();
    }
  }


  // ===== random events =====

  // ----- picks a random event and puts it at its start position -----
  startEvent() {
    // random() picks one of these three at random
    let type = random(["passerby", "boat", "bird"]);
    this.event = { type: type, x: 0, y: 0, progress: 0 };
    this.justStarted = true;
    this.moveEvent();
  }


  // ----- moves the event along its path -----
  moveEvent() {
    // progress goes from 0 (start of its path) to 1 (end of its path)
    this.event.progress = this.event.progress + 0.003;
    let progress = this.event.progress;

    if (this.event.type === "passerby") {
      // walks along the bridge from the far end, towards you, and off the bottom of the screen
      // bridgeEdgeY() is in canvas/bridge.js: it keeps their feet on the bridge, next to the railing
      this.event.x = lerp(width * 0.1, width * 0.8, progress);
      this.event.y = bridgeEdgeY(this.event.x) + height * 0.02;
    } else if (this.event.type === "boat") {
      // sails across the open water of the fjord, from right to left
      this.event.x = lerp(width * 0.84, width * 0.45, progress);
      this.event.y = height * 0.5;
    } else if (this.event.type === "bird") {
      // flies across the sky from left to right
      this.event.x = lerp(-50, width + 50, progress);
      this.event.y = height * 0.15 + sin(progress * 20) * 20;
    }

    // event finished: wait a random time for the next one
    if (this.event.progress >= 1) {
      this.event.type = "none";
      this.nextEventTime = millis() + random(4000, 9000);
    }
  }


  // ===== drawing the events =====
  // each event has its own function, so script.js can draw it in the right layer:
  // the boat on the water, the bird in the sky, and the passerby on the bridge


  // ----- the boat (drawn after the water, before the land and the bridge) -----
  drawBoat() {
    if (this.event.type !== "boat") {
      return;
    }
    let x = this.event.x;
    let y = this.event.y;

    noStroke();
    fill(60, 40, 30);
    // arc() draws half an ellipse for the bottom of the boat
    arc(x, y, 70, 26, 0, PI);
    // the sail
    fill(220, 210, 190);
    triangle(x, y, x, y - 45, x + 24, y);
  }


  // ----- the bird (drawn in the sky) -----
  drawBird() {
    if (this.event.type !== "bird") {
      return;
    }
    let x = this.event.x;
    let y = this.event.y;

    // a black bird flapping its wings, using sin() to move the wings up and down
    let flap = sin(frameCount * 0.4) * 8;
    stroke(20);
    strokeWeight(3);
    line(x - 15, y - flap, x, y);
    line(x, y, x + 15, y - flap);
  }


  // ----- the passerby (drawn after the bridge, so they walk on it) -----
  drawPasserby() {
    if (this.event.type !== "passerby") {
      return;
    }
    // a person in a hat and coat (drawPerson() is in canvas/people.js)
    // personHeightAt() is in canvas/bridge.js: it makes them the right size for where they are,
    // so they get bigger as they walk towards you
    let tall = personHeightAt(this.event.x);
    drawPerson(this.event.x, this.event.y, tall, true);
  }
}
