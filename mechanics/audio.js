// ===== MECHANIC 4: AUDIO =====
// Two sound tracks play at the same time: an opera voice and a horrible screech.
// When the bee is far from the screamer you hear the opera.
// As it gets closer to his face, the opera gets quieter and the screech gets louder.
// p5.Amplitude measures how loud the sound really is, and that loudness drives the visuals:
// the sky and water wave harder, and wavy sound lines around his face
// change shape with the frequencies of the sound (p5.FFT).
// This uses p5.sound, the official sound add-on for p5.js (https://p5js.org/reference/p5.sound/).
// AI acknowledgement: this file was written with help from Claude (AI). See README.md.


// ----- sound tracks (loaded in preload() in script.js) -----
let operaSound;
let screechSound;
let stingSound;
let beeSound;
let jumpscareSound;

// Adjust starting volumes here (0 = silent, 1 = full volume).
const AUDIO_SETTINGS = {
  operaVolume: 0.5,
  operaMinVolume: 0.3,
  screechVolume: 0.5,
  stingVolume: 0.3,
  beeVolume: 0.10,
  jumpscareVolume: 0.35,
  scareScreechMultiplier: 0.15,
  jumpscareFadeSeconds: 0.06,
  beePanSeconds: 0.1
};


class AudioMixer {

  // ----- set up the sound -----
  constructor() {
    // browsers only allow sound after the first click, so it starts switched off
    this.started = false;
    this.beePan = 0;

    // how loud it is right now: 0 = quiet, 1 = as loud as possible
    this.level = 0;

    // p5.Amplitude listens to everything that is playing and measures how loud it is
    this.meter = new p5.Amplitude();

    // p5.FFT splits the sound into 32 frequencies (low to high) so we can see each one
    this.fft = new p5.FFT(0.8, 32);
  }


  // ----- starts the loops once, on the first click -----
  start() {
    if (this.started) {
      return;
    }
    // userStartAudio() asks the browser to switch the sound on
    userStartAudio();
    // Set levels before playback to avoid an initial burst at full volume.
    operaSound.setVolume(AUDIO_SETTINGS.operaVolume);
    screechSound.setVolume(0);
    stingSound.setVolume(AUDIO_SETTINGS.stingVolume);
    beeSound.setVolume(this.isBeeInsideFrame() ? AUDIO_SETTINGS.beeVolume : 0);
    this.beePan = constrain(map(mouseX, 0, max(width, 1), -1, 1), -1, 1);
    beeSound.pan(this.beePan);
    // loop() plays a track over and over
    operaSound.loop();
    screechSound.loop();
    beeSound.loop();
    this.started = true;
  }


  // The wooden frame extends 18 canvas pixels beyond the scaled painting.
  isBeeInsideFrame() {
    const border = 18;
    return mouseX >= painting.left - border &&
      mouseX <= painting.left + 1050 * painting.scale + border &&
      mouseY >= painting.top - border &&
      mouseY <= painting.top + 1278 * painting.scale + border;
  }


  // Trigger once on entry, even if scare ends and restarts in the same frame.
  onStateChange(previousState, newState) {
    if (!this.started || previousState === newState) {
      return;
    }
    if (newState === "scare") {
      jumpscareSound.stop();
      jumpscareSound.setVolume(AUDIO_SETTINGS.jumpscareVolume);
      const duration = Math.min(jumpscareSound.duration(), timer.scareLength / 1000);
      const fade = Math.min(AUDIO_SETTINGS.jumpscareFadeSeconds, duration);
      // Schedule the fade and playback end on the audio clock, independent of frame rate.
      // Always start the short clip at zero; never resume the previous scare.
      jumpscareSound.play(0, 1, AUDIO_SETTINGS.jumpscareVolume, 0, duration);
      jumpscareSound.setVolume(0, fade, duration - fade);
    } else if (previousState === "scare" && jumpscareSound.isPlaying()) {
      // Also fade out if the state exits earlier than expected.
      jumpscareSound.setVolume(0, AUDIO_SETTINGS.jumpscareFadeSeconds);
      jumpscareSound.stop(AUDIO_SETTINGS.jumpscareFadeSeconds);
    }
  }


  // ----- runs every frame: mixes the two tracks and measures the loudness -----
  update() {
    if (!this.started) {
      return;
    }

    // Use canvas coordinates: the bee cursor is outside the painting's scale/translate.
    const targetPan = constrain(map(mouseX, 0, max(width, 1), -1, 1), -1, 1);
    const panBlend = 1 - Math.exp(-deltaTime / (AUDIO_SETTINGS.beePanSeconds * 1000));
    this.beePan = constrain(lerp(this.beePan, targetPan, panBlend), -1, 1);
    beeSound.pan(this.beePan);
    // Fade out beyond the visible frame and restore on re-entry without restarting.
    beeSound.setVolume(this.isBeeInsideFrame() ? AUDIO_SETTINGS.beeVolume : 0, 0.1);

    // how close the bee is: 1 = right next to him, 0 = far away
    // map() turns the distance into a number from 1 to 0
    // constrain() stops the number going below 0 or above 1
    let closeness = map(controls.distance, 150, 800, 1, 0);
    closeness = constrain(closeness, 0, 1);

    // During scare, leave room for the separate jumpscare effect.
    if (state === "scare") {
      closeness = 1;
    }

    let operaVolume = 1 - closeness;
    let screechVolume = closeness;
    if (state === "scare") {
      screechVolume *= AUDIO_SETTINGS.scareScreechMultiplier;
    }
    if (state === "stung") {
      operaVolume = 0.35;
      screechVolume = 0;
    }

    // setVolume(volume, seconds) fades to the new volume over a short time, so it sounds smooth
    // Keep an audible opera floor, including during scare.
    operaSound.setVolume(Math.max(AUDIO_SETTINGS.operaMinVolume,
      operaVolume * AUDIO_SETTINGS.operaVolume), 0.1);
    // Reduce the maximum screech volume.
    screechSound.setVolume(screechVolume * AUDIO_SETTINGS.screechVolume, 0.1);

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
