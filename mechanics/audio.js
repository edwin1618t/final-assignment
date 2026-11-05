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
let distractionSound;
let subSound;

// Adjust starting volumes here (0 = silent, 1 = full volume).
const AUDIO_SETTINGS = {
  operaVolume: 0.5,
  operaMinVolume: 0.3,
  screechVolume: 0.7,
  stingVolume: 0.3,
  beeVolume: 0.03,
  jumpscareVolume: 0.35,
  distractionVolume: 0.7,
  subVolume: 0.5,
  subFadeInSeconds: 2.5,
  subFadeOutSeconds: 3.5,
  subOperaMultiplier: 0.75,
  subBeeVolume: 0.12,
  beePitchSemitones: 1.5,
  beePitchChangeMinMs: 70,
  beePitchChangeMaxMs: 140,
  beePitchSmoothSeconds: 0.045,
  distractedScreechMultiplier: 0.05,
  distractionFadeOutSeconds: 0.8,
  distractionRecoverSeconds: 0.5,
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
    this.beePitch = 0;
    this.beePitchTarget = 0;
    this.nextBeePitchTime = 0;
    this.subMix = 0;
    this.subTransition = { from: 0, target: 0, start: 0, duration: 1 };

    // how loud it is right now: 0 = quiet, 1 = as loud as possible
    this.level = 0;

    // A separate gain fades the scream once per transition, not once per frame.
    this.screechGain = new p5.Gain();
    this.screechGain.connect();
    this.screechGain.amp(1);
    screechSound.disconnect();
    screechSound.connect(this.screechGain);

    // Opera keeps its original tone; this gain only lowers its volume during Sub.
    this.operaGain = new p5.Gain();
    this.operaGain.connect();
    this.operaGain.amp(1);
    operaSound.disconnect();
    operaSound.connect(this.operaGain);

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
    // Distraction may already be active when the first click unlocks audio.
    if (state === "distracted") {
      this.startDistractionSound();
    }
  }


  // The wooden frame extends 18 canvas pixels beyond the scaled painting.
  isBeeInsideFrame() {
    const border = 18;
    return mouseX >= painting.left - border &&
      mouseX <= painting.left + 1050 * painting.scale + border &&
      mouseY >= painting.top - border &&
      mouseY <= painting.top + 1278 * painting.scale + border;
  }


  // Restart once per distraction, never once per draw frame.
  startDistractionSound() {
    distractionSound.stop();
    distractionSound.setVolume(0);
    distractionSound.loop();
    distractionSound.setVolume(AUDIO_SETTINGS.distractionVolume, 0.1);
    subSound.stop();
    subSound.setVolume(0);
    subSound.loop();
    subSound.setVolume(AUDIO_SETTINGS.subVolume, AUDIO_SETTINGS.subFadeInSeconds);
    this.setDistractionMix(true);
  }


  // Gently lower opera during Sub, then recover with the Sub tail.
  setDistractionMix(active) {
    this.screechGain.amp(active ? AUDIO_SETTINGS.distractedScreechMultiplier : 1,
      active ? AUDIO_SETTINGS.distractionFadeOutSeconds : AUDIO_SETTINGS.distractionRecoverSeconds);
    const duration = active ? AUDIO_SETTINGS.subFadeInSeconds : AUDIO_SETTINGS.subFadeOutSeconds;
    this.operaGain.amp(active ? AUDIO_SETTINGS.subOperaMultiplier : 1, duration);
    this.updateSubMix();
    this.subTransition = { from: this.subMix, target: active ? 1 : 0,
      start: millis(), duration: duration * 1000 };
  }


  // Keep bee changes gradual, including when distraction ends during the fade-in.
  updateSubMix() {
    const transition = this.subTransition;
    const t = constrain((millis() - transition.start) / transition.duration, 0, 1);
    const smooth = t * t * (3 - 2 * t);
    this.subMix = lerp(transition.from, transition.target, smooth);
  }


  // Trigger once on entry, even if a state ends and restarts in the same frame.
  onStateChange(previousState, newState) {
    if (!this.started || previousState === newState) {
      return;
    }
    if (previousState === "distracted") {
      // End the loop after a short fade, on timeout or a successful sting.
      distractionSound.setVolume(0, 0.1);
      distractionSound.stop(0.1);
      // Let Sub fade away while opera slowly returns to its normal level.
      subSound.setVolume(0, AUDIO_SETTINGS.subFadeOutSeconds);
      subSound.stop(AUDIO_SETTINGS.subFadeOutSeconds);
      this.setDistractionMix(false);
    }
    if (newState === "distracted") {
      this.startDistractionSound();
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
    this.updateSubMix();
    const beeVolume = lerp(AUDIO_SETTINGS.beeVolume, AUDIO_SETTINGS.subBeeVolume, this.subMix);
    // The boosted bee still becomes silent outside the frame.
    beeSound.setVolume(this.isBeeInsideFrame() ? beeVolume : 0, 0.1);

    // Small random pitch targets, smoothed into a continuous flutter during Sub.
    if (this.subMix > 0 && millis() >= this.nextBeePitchTime) {
      this.beePitchTarget = random(-AUDIO_SETTINGS.beePitchSemitones, AUDIO_SETTINGS.beePitchSemitones);
      this.nextBeePitchTime = millis() + random(AUDIO_SETTINGS.beePitchChangeMinMs,
        AUDIO_SETTINGS.beePitchChangeMaxMs);
    } else if (this.subMix === 0) {
      this.beePitchTarget = 0;
    }
    const pitchBlend = 1 - Math.exp(-deltaTime / (AUDIO_SETTINGS.beePitchSmoothSeconds * 1000));
    this.beePitch = lerp(this.beePitch, this.beePitchTarget, pitchBlend);
    beeSound.rate(Math.pow(2, this.beePitch * this.subMix / 12));

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
    // Distraction ducking uses screechGain so the longer fade is not reset each frame.
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
