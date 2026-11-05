// ===== MECHANIC 4: AUDIO =====
// Two sound tracks play at the same time: an opera voice and a horrible screech.
// When the bee is far from the screamer you hear the opera.
// As it gets closer to his face, the opera fades out and the screech gets louder.
// p5.Amplitude measures how loud the sound really is, and that loudness drives the visuals:
// the sky and water wave harder, and wavy sound lines around his face
// change shape with the frequencies of the sound (p5.FFT).
// This uses p5.sound, the official sound add-on for p5.js (https://p5js.org/reference/p5.sound/).
// AI acknowledgement: this file was written with help from Claude (AI). See README.md.


// ----- the two sound tracks (loaded in preload() in script.js) -----
let operaSound;
let screechSound;
let stingSound;


class AudioMixer {

  // ----- set up the sound -----
  constructor() {
    // browsers only allow sound after the first click, so it starts switched off
    this.started = false;

    // how loud it is right now: 0 = quiet, 1 = as loud as possible
    this.level = 0;

    // p5.Amplitude listens to everything that is playing and measures how loud it is
    this.meter = new p5.Amplitude();

    // p5.FFT splits the sound into 32 frequencies (low to high) so we can see each one
    this.fft = new p5.FFT(0.8, 32);
  }


  // ----- starts both tracks (called on the first click, in script.js) -----
  start() {
    // userStartAudio() asks the browser to switch the sound on
    userStartAudio();
    // loop() plays a track over and over
    operaSound.loop();
    screechSound.loop();
    // start with the screech silent
    screechSound.setVolume(0);
    this.started = true;
  }


  // ----- runs every frame: mixes the two tracks and measures the loudness -----
  update() {
    if (!this.started) {
      return;
    }

    // how close the bee is: 1 = right next to him, 0 = far away
    // map() turns the distance into a number from 1 to 0
    // constrain() stops the number going below 0 or above 1
    let closeness = map(controls.distance, 150, 800, 1, 0);
    closeness = constrain(closeness, 0, 1);

    // the jump scare is all screech; after a sting only soft, calm opera plays
    if (state === "scare") {
      closeness = 1;
    }

    let operaVolume = 1 - closeness;
    let screechVolume = closeness;
    if (state === "stung") {
      operaVolume = 0.35;
      screechVolume = 0;
    }

    // setVolume(volume, seconds) fades to the new volume over a short time, so it sounds smooth
    operaSound.setVolume(operaVolume * 0.3, 0.1);
    screechSound.setVolume(screechVolume, 0.1);

    // getLevel() is how loud the sound is right now (about 0 to 0.4)
    // map() turns it into a number from 0 to 1 for the visuals
    let loudness = map(this.meter.getLevel(), 0, 0.3, 0, 1);
    loudness = constrain(loudness, 0, 1);

    // move the level slowly towards the loudness so the visuals don't flicker
    // (lerp() moves it 20% of the way each frame)
    this.level = lerp(this.level, loudness, 0.2);
  }


  // ----- wavy sound lines around his face, shaped by the frequencies of the sound -----
  // (drawn just before the screamer in script.js, so they sit around his head)
  drawFaceDistortion() {
    // only while he is on the bridge and the sound is on
    if (!this.started || state === "stung") {
      return;
    }

    // analyze() gives 32 numbers, one for each frequency, from 0 (silent) to 255 (loud)
    let spectrum = this.fft.analyze();

    noFill();
    strokeWeight(4);

    // how strong the rings look: stronger when the sound is louder (0 to 1)
    let strength = constrain(this.level * 2, 0, 1);

    // three rings around his face, each one bigger than the last
    for (let ring = 0; ring < 3; ring++) {
      // the rings fade in as the sound gets louder
      stroke(255, 240, 200, (230 - ring * 60) * strength);

      beginShape();
      for (let i = 0; i < 32; i++) {
        // go around the circle in 32 steps
        let angle = map(i, 0, 32, 0, TWO_PI);
        // each frequency pushes its part of the ring outwards
        let push = map(spectrum[i], 0, 255, 0, 60);
        let radius = 175 + ring * 40 + push * strength;
        // the ring is an oval, taller than it is wide, like his face
        let x = screamer.x + cos(angle) * radius * 0.8;
        let y = screamer.y + sin(angle) * radius * 1.1;
        curveVertex(x, y);
      }
      endShape(CLOSE);
    }
  }


  // ----- the message you see before the sound starts -----
  drawStartMessage() {
    if (this.started) {
      return;
    }
    noStroke();
    fill(0, 150);
    rect(0, height / 2 - 40, width, 80);
    fill(255, 240, 200);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Click anywhere to start (turn your sound on)", width / 2, height / 2);
  }
}
