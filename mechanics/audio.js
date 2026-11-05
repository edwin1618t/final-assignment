// ===== MECHANIC 4: AUDIO =====
// Two sound tracks play at the same time: an opera voice and a horrible screech.
// When the bee is far from the screamer you hear the opera.
// As it gets closer to his face, the opera gets quieter and the screech gets louder.
// The master p5.Amplitude still drives the sky and water. Separate source taps
// drive the rail score and the scream contours without changing playback.
// Delayed loudness and frequency bands (p5.FFT) carry broad bends out through the layers.
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

// Contour controls only; these never change the sound mix.
const AUDIO_VISUAL_SETTINGS = {
  motionAmplitude: 170, // Coordinate displacement gain, with a 140-unit ceiling.
  contourSpacing: 28,   // Base distance between neighbouring contours.
  sensitivity: 38,      // Visual gain before compression; not playback volume.
  noiseGate: 0.0008,
  compressionPower: 0.85,
  attackMs: 45,
  releaseMs: 230,
  layerDelayMs: 90,
  fftBins: 1024,
  samplePoints: 96,
  colour: "#FCEEAA",    // Existing lake highlight colour in scenery.js.
  staticPreview: false, // false for real audio; or "weak", "medium", "strong".
  debug: false,        // Raw RMS, mapped/envelope level, and measured displacement.
  previewInputs: {
    weak: { raw: 0.005, low: 0.25, mid: 0.18, high: 0.08 },
    medium: { raw: 0.025, low: 0.65, mid: 0.55, high: 0.25 },
    strong: { raw: 0.15, low: 0.9, mid: 0.8, high: 0.5 }
  },
  // One periodic cubic B-spline for all five lines, in face-relative units.
  // Tight left flank, a long upper-right shoulder, then a broad inward waist.
  outline: [[155, 0], [128, 112], [65, 202], [-40, 200],
    [-118, 120], [-142, 0], [-138, -120], [-55, -205],
    [85, -245], [235, -270], [235, -145], [130, -65]]
};


// Distraction guidance only; ordinary contour settings stay unchanged.
const AUDIO_DISTRACTION_SETTINGS = {
  innerScale: 0.82,       // Smaller pulls the three contours closer to the head.
  innerSpacing: 18,
  contractMs: 550,
  releaseMs: 780,
  recoverMs: 500,
  breathAmplitude: 12,   // Painting units, driven by smoothed real bass energy.
  breathSmoothMs: 260,
  guideIntervalMs: 1200,
  guideLifeMs: 1000,
  highSensitivity: 1.2, // Total-mix treble, not an isolated cue detector.
  highThreshold: 0.09,
  highMinLevel: 0.16,
  highCooldownMs: 850,
  highlightStrength: 0.65,
  hoverTighten: 4,
  hoverPulseMs: 420,
  hoverRearmMs: 300,
  hoverCooldownMs: 950,
  eyeTransitionMs: 400
};


// Painting units and milliseconds; these controls never change playback.
// CW_Distrace.wav: main attacks near 60 and 340 ms, tail RMS below 0.010
// at its existing 0.7 volume. 0.016/0.0064 hysteresis rejects the tail.
const BRIDGE_AUDIO_VISUAL_SETTINGS = {
  enabled: true,
  operaSensitivity: 55, // Post-Gain RMS: normal opera is roughly 0.012–0.04.
  textureContrast: 0.9,
  mainGrainWidth: 0.35, // Strong-sound width, as a fraction of local timber width.
  bendAmplitude: 0.18,  // Maximum lateral centre movement in local timber widths.
  surfaceDelayMs: 35,   // Small stagger between horizontal rails.
  propagationMs: 320,
  cueThreshold: 0.016,
  cueHysteresis: 0.4,
  cueCooldownMs: 160,
  cueTravelDurationMs: 580,
  cueAccentMs: 210,
  exitFadeMs: 200,
  maxAccents: 3,
  debug: false
};

// Edge print only: painting units, opacity 0..1, response in milliseconds.
const PAN_PRINT_SETTINGS = {
  enabled: true,
  deadZone: 0.08,
  maxBandWidth: 350, // Up to 35% of the painting; the central figure is drawn later.
  maxOffset: 64,    // Outward plate separation, capped at 75 painting units.
  opacity: 0.9,
  responseMs: 100,  // Visual volume envelope; pan already has audio smoothing.
  debug: false,
  testPan: null     // Debug only: null = real beePan; -1 / 0 / 1 = visual override.
};

class AudioMixer {

  // ----- set up the sound -----
  constructor() {
    // browsers only allow sound after the first click, so it starts switched off
    this.started = false;
    this.beePan = 0;
    this.beeVisualVolumeTarget = 0;
    this.beeVisualVolume = 0;
    this.panPrintBuffers = null;
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

    // At 44.1/48 kHz, 1024 bins resolve about 22/23 Hz per bin.
    // Set the isolated FFT first: p5.sound setInput disconnects the shared
    // FFT meter. Construct the original mix FFT afterwards for distraction.
    this.screamFFT = new p5.FFT(0, AUDIO_VISUAL_SETTINGS.fftBins);
    this.screamFFT.setInput(this.screechGain.output);
    this.fft = new p5.FFT(0, AUDIO_VISUAL_SETTINGS.fftBins);
    // Native, unconnected-output analysers are silent measurement branches.
    // Tap AFTER the existing SoundFile volume and the two existing Gains.
    this.operaProbe = this.makeVisualProbe(this.operaGain.output);
    this.cueProbe = this.makeVisualProbe(distractionSound.output);
    this.screamProbe = this.makeVisualProbe(this.screechGain.output);
    this.bridgeAccents = [];
    this.bridgeHistory = [];
    this.bridgeGeometry = null;
    this.bridgeEnvelope = { opera: 0, cue: 0, lowMid: 0 };
    this.bridgeSpectrum = new Float32Array(this.operaProbe.node.frequencyBinCount);
    this.bridgeSync = true;
    this.bridgeCueArmed = true;
    this.bridgeLastCue = -Infinity;
    this.bridgeCueCount = 0;
    this.bridgeNow = 0;
    this.visualSpectrum = [];
    this.visualHistory = [];
    this.visualEnvelope = { level: 0, low: 0, mid: 0, high: 0 };
    this.visualBands = { low: 0, mid: 0, high: 0 };
    this.visualContours = [];
    this.visualRawLevel = 0;
    this.visualIntensity = 0;
    this.visualNow = 0;
    this.visualNeedsReset = true;
    this.visualMappedLevel = 0;
    this.visualMaxDisplacement = 0;
    this.visualPreviewMode = false;
    this.visualLastSample = null;
    this.visualNextSampleTime = 0;
    this.distractionVisual = null;
    this.guidanceContours = null;
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
    this.beeVisualVolumeTarget = this.isBeeInsideFrame() ? AUDIO_SETTINGS.beeVolume : 0;
    beeSound.setVolume(this.beeVisualVolumeTarget);
    this.beePan = constrain(map(mouseX, 0, max(width, 1), -1, 1), -1, 1);
    beeSound.pan(this.beePan);
    // loop() plays a track over and over
    operaSound.loop();
    screechSound.loop();
    beeSound.loop();
    this.started = true;
    if (state === "distracted") this.beginDistractionVisual();
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
    if (previousState !== newState) {
      this.onGuidanceStateChange(newState);
      this.onBridgeStateChange(newState);
    }
    // Clear immediately, even when transitions happen between draw frames.
    if (previousState !== newState &&
        [previousState, newState].some(value => value === "stung" || value === "scare")) {
      this.resetFaceVisuals();
    }
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
    this.beeVisualVolumeTarget = this.isBeeInsideFrame() ? beeVolume : 0;
    beeSound.setVolume(this.beeVisualVolumeTarget, 0.1);
    // Follow the existing volume target for visuals only; no audio automation added.
    const volumeBlend = 1-Math.exp(-Math.max(0,deltaTime) /
      Math.max(1,PAN_PRINT_SETTINGS.responseMs));
    this.beeVisualVolume = lerp(this.beeVisualVolume,
      this.beeVisualVolumeTarget,volumeBlend);

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
    const rawLoudness = this.meter.getLevel();
    let loudness = map(rawLoudness, 0, 0.3, 0, 1);
    loudness = constrain(loudness, 0, 1);

    // move the level slowly towards the loudness so the visuals don't flicker
    // (lerp() moves it 20% of the way each frame)
    this.level = lerp(this.level, loudness, 0.2);
    this.updateBridgeVisuals();
    const screamLevel = this.readVisualProbe(this.screamProbe);
    this.updateFaceVisuals(state === "distracted" ? rawLoudness : screamLevel);
  }




  panPrintParameters() {
    const v = PAN_PRINT_SETTINGS;
    const pan = constrain(v.debug && Number.isFinite(v.testPan) ? v.testPan : this.beePan,-1,1);
    const t = constrain((Math.abs(pan)-constrain(v.deadZone,0,0.95)) /
      (1-constrain(v.deadZone,0,0.95)),0,1);
    const strength = t*t*(3-2*t);
    // Normal 0.03 volume means full visibility, not 3% opacity.
    const volume = constrain(this.beeVisualVolume/Math.max(0.001,AUDIO_SETTINGS.beeVolume),0,1.15);
    const visibility = constrain(t/0.35,0,1);
    const maxBand = constrain(v.maxBandWidth,0,1050*0.35);
    return { pan, strength, side: pan < 0 ? -1 : 1,
      band: maxBand*(0.78+0.22*strength),
      offset: constrain(v.maxOffset,0,75)*strength,
      alpha: constrain(v.opacity*volume,0,1)*visibility*visibility*(3-2*visibility) };
  }

  drawPanPrint() {
    const v = PAN_PRINT_SETTINGS;
    if (!v.enabled || !this.started || state === "stung" || state === "scare") return;
    const p = this.panPrintParameters();
    if (p.strength === 0 || p.alpha < 0.002 || p.band <= 0 || painting.scale <= 0) return;
    // One bounded side sample at half painting resolution, with shift allowance.
    // Only this local strip is read back (143k pixels), never the full screen.
    // Canvases and the two output ImageData arrays are reused across frames/resizes.
    if (!this.panPrintBuffers) {
      const make = read => {
        const canvas = document.createElement("canvas");
        canvas.width = 224; canvas.height = 639;
        const ctx = canvas.getContext("2d", { willReadFrequently: read });
        return { canvas, ctx };
      };
      const source = make(true), orange = make(false), blue = make(false);
      orange.pixels = orange.ctx.createImageData(224,639);
      blue.pixels = blue.ctx.createImageData(224,639);
      orange.coverage = new Uint8Array(224*639);
      blue.coverage = new Uint8Array(224*639);
      for (let i=0;i<orange.pixels.data.length;i+=4) {
        orange.pixels.data[i]=176; orange.pixels.data[i+1]=106; orange.pixels.data[i+2]=85;
        blue.pixels.data[i]=18; blue.pixels.data[i+1]=49; blue.pixels.data[i+2]=87;
      }
      this.panPrintBuffers = { source, orange, blue };
    }
    const { source, orange, blue } = this.panPrintBuffers;
    const ctx = drawingContext, sampleWidth = 448;
    const sampleX = p.side < 0 ? 0 : 1050-sampleWidth;
    const dx = ctx.canvas.width/width, dy = ctx.canvas.height/height;
    const sx = (painting.left+sampleX*painting.scale)*dx, sy = painting.top*dy;
    const sw = sampleWidth*painting.scale*dx, sh = 1278*painting.scale*dy;
    if (sx < 0 || sy < 0 || sx+sw > ctx.canvas.width+0.01 ||
        sy+sh > ctx.canvas.height+0.01) return;
    // Capture first, before either plate. Background is freshly drawn this frame.
    source.ctx.clearRect(0,0,224,639);
    source.ctx.drawImage(ctx.canvas,sx,sy,sw,sh,0,0,224,639);
    const pixels = source.ctx.getImageData(0,0,224,639).data;
    // Explicit warm/light and cool/shadow separation, not a multiply tint.
    // This is a stylised two-ink mapping, not a print-proof CMYK conversion.
    // Warp the two small coverage plates in their reusable pixel buffers.
    // A single image draw per plate avoids antialias seams between narrow strips.
    const plates = [orange,blue];
    // Separate once; both warps reuse the cached scalar ink coverage.
    for (let pixel=0,i=0;i<pixels.length;pixel++,i+=4) {
      const r=pixels[i]/255,g=pixels[i+1]/255,b=pixels[i+2]/255;
      const light=0.2126*r+0.7152*g+0.0722*b;
      orange.coverage[pixel]=pixels[i+3]*constrain((r-b)*1.7+(light-0.3)*0.55,0,1);
      blue.coverage[pixel]=pixels[i+3]*constrain((0.78-light)*1.65+(b-r)*0.65,0,1);
    }
    for (let layer=0;layer<2;layer++) {
      const out = plates[layer].pixels.data;
      const amount = layer === 0 ? 1 : 0.42;
      for (let x=0;x<224;x++) {
        const distance = p.side < 0 ? (x+0.5)*2 : sampleWidth-(x+0.5)*2;
        const u = constrain(1-distance/p.band,0,1);
        const falloff = u*u*(3-2*u);
        const sampleDistance = distance+p.offset*amount*falloff;
        const sample = constrain((p.side < 0 ? sampleDistance :
          sampleWidth-sampleDistance)/2-0.5,0,223);
        const x0 = Math.floor(sample), x1 = Math.min(223,x0+1), mix = sample-x0;
        for (let y=0;y<639;y++) {
          const i = (y*224+x)*4;
          if (falloff === 0) { out[i+3]=0; continue; }
          const row = y*224, coverage = plates[layer].coverage;
          out[i+3] = lerp(coverage[row+x0],coverage[row+x1],mix)*falloff;
        }
      }
      plates[layer].ctx.putImageData(plates[layer].pixels,0,0);
    }
    push(); ctx.save();
    try {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.rect(p.side < 0 ? 0 : 1050-p.band,0,p.band,1278);
      ctx.clip();
      ctx.drawImage(orange.canvas,sampleX,0,sampleWidth,1278);
      ctx.drawImage(blue.canvas,sampleX,0,sampleWidth,1278);
    } finally { ctx.restore(); pop(); }
  }

  makeVisualProbe(output) {
    const node = getAudioContext().createAnalyser();
    node.fftSize = 1024;
    node.smoothingTimeConstant = 0;
    output.connect(node); // Never connect this analyser to the destination.
    return { node, samples: new Float32Array(node.fftSize) };
  }

  readVisualProbe(probe) {
    probe.node.getFloatTimeDomainData(probe.samples);
    let sum = 0;
    for (const value of probe.samples) sum += value * value;
    return Math.sqrt(sum / probe.samples.length);
  }

  prepareBridgeGeometry() {
    if (this.bridgeGeometry) return;
    // Exact polygons from canvas/bridge.js; walkway deliberately excluded.
    // Same painter order: posts, upper rail, highlight, middle rail, lower rail.
    const posts = [
      [[37,589],[51,595],[51,746],[37,724]],
      [[116,629],[135,636],[135,816],[116,801]],
      [[238,693],[278,700],[278,939],[238,923]],
      [[768,944],[842,965],[842,1364],[773,1364]]
    ];
    const rails = [
      [[-186,476],[1193,1096],[1186,1177],[-187,485]],
      [[-189,465],[1195,1075],[1189,1156],[-190,474]],
      [[-191,502],[1104,1284],[1087,1364],[-193,511]],
      [[-237,476],[906,1482],[875,1563],[-241,485]]
    ];
    this.bridgeGeometry = posts.concat(rails).map((polygon,index) => {
      const post = index < posts.length;
      const path = new Path2D();
      polygon.forEach((p,i) => i ? path.lineTo(...p) : path.moveTo(...p));
      path.closePath();
      // Reorder a post into the same across-surface parametrisation as a rail.
      const q = post ? [polygon[0],polygon[3],polygon[2],polygon[1]] : polygon;
      // Reusable boundaries and only nine delayed audio anchors per timber.
      const points = () => Array.from({ length: 33 }, () => ({ x: 0, y: 0 }));
      const signals = Array.from({ length: 9 }, () => ({ opera: 0, lowMid: 0, cue: 0 }));
      return { path, q, post, index, upper: points(), lower: points(), signals };
    });
    // Visibility masks remove later rails from earlier posts/rails, preserving depth.
    this.bridgeGeometry.forEach((surface,i) => {
      const visible = new Path2D(surface.path);
      for (let j=i+1;j<this.bridgeGeometry.length;j++) {
        const outside = new Path2D();
        outside.rect(-1000,-1000,4000,4000);
        outside.addPath(this.bridgeGeometry[j].path);
        if (!surface.exclusions) surface.exclusions = [];
        surface.exclusions.push(outside);
      }
      surface.visible = visible;
    });
  }

  onBridgeStateChange(next) {
    this.bridgeSync = true;
    this.bridgeCueArmed = true;
    if (next === "stung" || next === "scare") {
      this.bridgeAccents = [];
      this.bridgeHistory = [];
    } else {
      for (const accent of this.bridgeAccents) {
        if (accent.fadeAt === undefined) accent.fadeAt = millis();
      }
    }
  }

  updateBridgeVisuals() {
    const v = BRIDGE_AUDIO_VISUAL_SETTINGS, now = millis();
    this.bridgeNow = now;
    const raw = this.readVisualProbe(this.operaProbe);
    const cueRaw = this.readVisualProbe(this.cueProbe);
    // Reuse the existing opera analyser for its mid/low spectrum, once per frame.
    // No new sound connection or p5 FFT setInput affecting the face analysis.
    this.operaProbe.node.getFloatFrequencyData(this.bridgeSpectrum);
    const binHz = getAudioContext().sampleRate/this.operaProbe.node.fftSize;
    let energy = 0, count = 0;
    for (let i=Math.max(1,Math.ceil(90/binHz));i<this.bridgeSpectrum.length && i*binHz<=1200;i++) {
      energy += Math.pow(10,this.bridgeSpectrum[i]/10); count++;
    }
    const lowMid = 1-Math.exp(-Math.sqrt(energy/Math.max(1,count))*90);
    const opera = 1-Math.exp(-Math.max(0,raw-0.0008)*v.operaSensitivity);
    const e = this.bridgeEnvelope, dt = constrain(deltaTime,0,100);
    const blocked = !v.enabled || state === "stung" || state === "scare";
    const sync = this.bridgeSync || deltaTime>250 || blocked;
    if (sync) {
      e.opera = opera; e.lowMid = lowMid; e.cue = cueRaw;
      this.bridgeCueArmed = cueRaw < v.cueThreshold;
      this.bridgeSync = blocked;
      this.bridgeHistory = [];
      if (deltaTime>250 || blocked) this.bridgeAccents = [];
    } else {
      e.opera = lerp(e.opera,opera,1-Math.exp(-dt/(opera>e.opera ? 55 : 210)));
      e.lowMid = lerp(e.lowMid,lowMid,1-Math.exp(-dt/160));
      e.cue = lerp(e.cue,cueRaw,1-Math.exp(-dt/(cueRaw>e.cue ? 12 : 32)));
    }
    this.bridgeHistory.push({ time: now, opera: e.opera, lowMid: e.lowMid });
    // Ring-sized history, enough for at most 400 ms propagation at 144 fps.
    while (this.bridgeHistory.length>96 ||
        (this.bridgeHistory.length>2 && this.bridgeHistory[1].time<now-600)) this.bridgeHistory.shift();
    this.bridgeAccents = this.bridgeAccents.filter(a =>
      now-a.born < v.cueTravelDurationMs+v.cueAccentMs &&
      (a.fadeAt === undefined || now-a.fadeAt<v.exitFadeMs));
    if (blocked || sync || state !== "distracted") return;
    if (e.cue < v.cueThreshold*v.cueHysteresis) this.bridgeCueArmed = true;
    if (this.bridgeCueArmed && e.cue>=v.cueThreshold &&
        now-this.bridgeLastCue>=v.cueCooldownMs) {
      this.bridgeAccents.push({ born: now, strength: constrain(e.cue/0.04,0.8,1) });
      while (this.bridgeAccents.length>constrain(v.maxAccents,1,4)) this.bridgeAccents.shift();
      this.bridgeLastCue = now;
      this.bridgeCueArmed = false;
      this.bridgeCueCount++;
    }
  }

  bridgeTextureSignal(x, delayMs = 0) {
    const v = BRIDGE_AUDIO_VISUAL_SETTINGS, history = this.bridgeHistory;
    const time = this.bridgeNow-constrain(x/1050,0,1)*constrain(v.propagationMs,0,400)-delayMs;
    let a = history[0] || this.bridgeEnvelope, b = a;
    for (const sample of history) {
      b = sample;
      if (sample.time>=time) break;
      a = sample;
    }
    const t = constrain((time-a.time)/Math.max(1,b.time-a.time),0,1) || 0;
    // Fade the ordinary score during distraction; the two accents remain distinct.
    const opera = lerp(a.opera,b.opera,t)*(state === "distracted" ? 0.35 : 1);
    const lowMid = lerp(a.lowMid,b.lowMid,t);
    const target = Math.max(100,screamer.x-screamer.faceWidth*0.7);
    let cue = 0;
    if (x>=0 && x<=target) for (const accent of this.bridgeAccents) {
      const age = this.bridgeNow-accent.born-(x/target)*v.cueTravelDurationMs;
      if (age<0 || age>v.cueAccentMs) continue;
      const fade = accent.fadeAt === undefined ? 1 :
        1-constrain((this.bridgeNow-accent.fadeAt)/Math.max(1,v.exitFadeMs),0,1);
      cue = Math.max(cue,Math.sin(Math.PI*age/v.cueAccentMs)*accent.strength*fade);
    }
    return { opera, lowMid, cue };
  }

  // Smooth filled ribbons, in each timber's longitudinal/transverse coordinates.
  drawBridgeGrain(surface,ctx) {
    const v = BRIDGE_AUDIO_VISUAL_SETTINGS, q = surface.q;
    const delay = surface.post ? 0 : Math.max(0,surface.index-5)*
      constrain(v.surfaceDelayMs,0,60);
    for (let i=0;i<surface.signals.length;i++) {
      const t = i/(surface.signals.length-1);
      const x = lerp((q[0][0]+q[3][0])/2,(q[1][0]+q[2][0])/2,t);
      Object.assign(surface.signals[i],this.bridgeTextureSignal(x,delay));
    }
    const phase = surface.post ? surface.index*0.55 : (surface.index-4)*0.45;
    const cycles = surface.post ? 0.8 : 1.15+(surface.index%2)*0.15;
    const layers = surface.post ? 1 : 2;
    for (let layer=0;layer<layers;layer++) {
      let average = 0;
      for (let i=0;i<surface.upper.length;i++) {
        const t = i/(surface.upper.length-1);
        const position = t*(surface.signals.length-1);
        const k = Math.min(surface.signals.length-2,Math.floor(position));
        const fraction = position-k, blend = fraction*fraction*(3-2*fraction);
        const a = surface.signals[k], b = surface.signals[k+1];
        const level = constrain(lerp(a.opera,b.opera,blend)+lerp(a.cue,b.cue,blend)*0.9,0,1);
        const bass = lerp(a.lowMid,b.lowMid,blend);
        average += level;
        // Fixed endpoints and phase: deformation breathes inside the timber,
        // rather than translating a pattern along it.
        const endIn = constrain(t/0.12,0,1), endOut = constrain((1-t)/0.12,0,1);
        const anchor = endIn*endIn*(3-2*endIn)*endOut*endOut*(3-2*endOut);
        const bend = (0.02+constrain(v.bendAmplitude,0,0.2)*
          (0.85*level+0.15*bass))*anchor;
        const centre = 0.42+bend*Math.sin(2*Math.PI*cycles*t+phase);
        const perspective = surface.post ? 1 : 0.72+0.28*t;
        const strongWidth = constrain(v.mainGrainWidth,0.15,0.35);
        const mainWidth = (0.15+(strongWidth-0.15)*level*anchor)*
          (0.9+0.1*Math.sin(Math.PI*t+0.15))*perspective;
        const width = layer === 0 ? mainWidth : (0.035+0.03*level*anchor)*perspective;
        const h = layer === 0 ? centre : centre+0.285+
          0.018*anchor*Math.sin(2*Math.PI*t+phase);
        const top = h-width/2, bottom = h+width/2;
        const ax = lerp(q[0][0],q[1][0],t), ay = lerp(q[0][1],q[1][1],t);
        const bx = lerp(q[3][0],q[2][0],t), by = lerp(q[3][1],q[2][1],t);
        surface.upper[i].x = lerp(ax,bx,top);
        surface.upper[i].y = lerp(ay,by,top);
        surface.lower[i].x = lerp(ax,bx,bottom);
        surface.lower[i].y = lerp(ay,by,bottom);
      }
      ctx.fillStyle = layer === 0 ? "#8C4E3B" : "#F5C55C";
      ctx.globalAlpha = constrain(v.textureContrast,0,1)*
        (0.18+0.72*average/surface.upper.length);
      ctx.beginPath();
      this.traceBridgeGrainEdge(ctx,surface.upper,false,true);
      this.traceBridgeGrainEdge(ctx,surface.lower,true,false);
      ctx.closePath();ctx.fill();
    }
  }

  traceBridgeGrainEdge(ctx,points,reverse,first) {
    const n = points.length;
    const at = i => points[reverse ? n-1-constrain(i,0,n-1) : constrain(i,0,n-1)];
    const start = at(0);
    if (first) ctx.moveTo(start.x,start.y); else ctx.lineTo(start.x,start.y);
    // Catmull-Rom to cubic Bezier: continuous tangent, no strip seams.
    for (let i=0;i<n-1;i++) {
      const a=at(i-1),b=at(i),c=at(i+1),d=at(i+2);
      ctx.bezierCurveTo(b.x+(c.x-a.x)/6,b.y+(c.y-a.y)/6,
        c.x-(d.x-b.x)/6,c.y-(d.y-b.y)/6,c.x,c.y);
    }
  }

  drawBridgeAudio() {
    const v = BRIDGE_AUDIO_VISUAL_SETTINGS;
    if (!v.enabled || !this.started || state === "stung" || state === "scare") return;
    this.prepareBridgeGeometry();
    const ctx = drawingContext;
    push(); ctx.save();
    try {
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath(); ctx.rect(0,0,1050,1278); ctx.clip();
      for (const surface of this.bridgeGeometry) {
        ctx.save();
        try {
          ctx.clip(surface.visible);
          for (const outside of surface.exclusions || []) ctx.clip(outside,"evenodd");
          this.drawBridgeGrain(surface,ctx);
        } finally { ctx.restore(); }
      }
      if (v.debug) {
        ctx.globalAlpha=1;ctx.fillStyle="#123157";ctx.fillRect(15,490,530,30);
        ctx.fillStyle="#FCEEAA";ctx.font="16px monospace";
        ctx.fillText("opera "+this.bridgeEnvelope.opera.toFixed(3)+" low/mid "+
          this.bridgeEnvelope.lowMid.toFixed(3)+" cue attacks "+this.bridgeCueCount,24,511);
      }
    } finally { ctx.restore(); pop(); }
  }

  resetFaceVisuals() {
    this.visualHistory = [];
    this.visualContours = [];
    this.visualEnvelope = { level: 0, low: 0, mid: 0, high: 0 };
    this.visualLastSample = null;
    this.visualIntensity = 0;
    this.visualMaxDisplacement = 0;
    this.visualNeedsReset = true;
  }


  mapVisualLoudness(raw) {
    const v = AUDIO_VISUAL_SETTINGS;
    // Preserve the old total-mix mapping during distraction. Isolated scream
    // RMS at low proximity needs a lower gate and modestly higher visual gain.
    const gate = state === "distracted" ? 0.0015 : v.noiseGate;
    const sensitivity = state === "distracted" ? 26 : v.sensitivity;
    const input = Math.max(0, raw - gate) * Math.max(0, sensitivity);
    return Math.pow(input / (1 + input), Math.max(0.1, v.compressionPower));
  }


  updateFaceVisuals(rawLoudness) {
    const v = AUDIO_VISUAL_SETTINGS;
    const now = millis();
    const elapsed = Math.max(0, deltaTime);
    const dt = Math.min(elapsed, 100);
    this.visualNow = now;
    this.visualRawLevel = rawLoudness;
    // One FFT, without FFT smoothing. The single envelope below does the smoothing.
    const fft = state === "distracted" ? this.fft : this.screamFFT;
    this.visualSpectrum = fft.analyze();
    this.visualBands = {
      low: fft.getEnergy(45, 250) / 255,
      mid: fft.getEnergy(250, 2000) / 255,
      high: fft.getEnergy(2000, 7000) / 255
    };
    this.visualMappedLevel = this.mapVisualLoudness(rawLoudness);
    if (state === "stung" || state === "scare") {
      this.resetFaceVisuals();
      this.clearDistractionVisual();
      return;
    }
    if (this.visualPreviewMode !== v.staticPreview) {
      this.resetFaceVisuals();
      this.visualPreviewMode = v.staticPreview;
    }
    const preview = v.previewInputs[v.staticPreview];
    if (preview) {
      // Fixed raw inputs use the same compression and geometry, with no live history.
      this.visualRawLevel = preview.raw;
      this.visualMappedLevel = this.mapVisualLoudness(preview.raw);
      this.visualEnvelope = { level: this.visualMappedLevel,
        low: preview.low, mid: preview.mid, high: preview.high };
      this.visualIntensity = this.visualEnvelope.level;
      this.buildFaceContours(Array.from({ length: 5 }, () => ({ ...this.visualEnvelope })));
      this.updateDistractionVisual();
      return;
    }
    if (this.visualNeedsReset || elapsed > 250) {
      this.resetFaceVisuals();
      this.visualHistory = [
        { time: now - 1000, ...this.visualEnvelope },
        { time: now, ...this.visualEnvelope }
      ];
      this.visualLastSample = { time: now, ...this.visualEnvelope };
      this.visualNextSampleTime = now + 1000 / 60;
      this.visualNeedsReset = false;
    }
    const targets = { level: this.visualMappedLevel, ...this.visualBands };
    for (const key of ["level", "low", "mid", "high"]) {
      const ms = targets[key] > this.visualEnvelope[key] ? v.attackMs : v.releaseMs;
      const blend = 1 - Math.exp(-dt / Math.max(1, ms));
      this.visualEnvelope[key] = lerp(this.visualEnvelope[key], targets[key], blend);
    }
    this.visualIntensity = this.visualEnvelope.level;
    const current = { time: now, ...this.visualEnvelope };
    const previous = this.visualLastSample;
    // Fixed-time history preserves the propagation speed at different frame rates.
    while (this.visualNextSampleTime <= now) {
      const t = constrain((this.visualNextSampleTime - previous.time) /
        Math.max(1, now - previous.time), 0, 1);
      const sample = { time: this.visualNextSampleTime };
      for (const key of ["level", "low", "mid", "high"]) {
        sample[key] = lerp(previous[key], current[key], t);
      }
      this.visualHistory.push(sample);
      this.visualNextSampleTime += 1000 / 60;
    }
    this.visualLastSample = current;
    while (this.visualHistory.length > 2 && this.visualHistory[1].time < now - 800) {
      this.visualHistory.shift();
    }
    if (this.visualHistory.length > 64) this.visualHistory.splice(0, this.visualHistory.length - 64);
    const delay = constrain(v.layerDelayMs, 70, 110);
    const sounds = Array.from({ length: 5 }, (_, i) => i === 0 ? current :
      this.sampleContourHistory(now - i * delay));
    this.buildFaceContours(sounds);
    this.updateDistractionVisual();
  }


  sampleContourHistory(time) {
    const history = this.visualHistory;
    let lo = 0;
    let hi = history.length - 1;
    if (time <= history[lo].time) return history[lo];
    if (time >= history[hi].time) return history[hi];
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (history[mid].time <= time) lo = mid;
      else hi = mid;
    }
    const a = history[lo];
    const b = history[hi];
    const t = (time - a.time) / (b.time - a.time);
    const smooth = t * t * (3 - 2 * t);
    const sound = {};
    for (const key of ["level", "low", "mid", "high"]) sound[key] = lerp(a[key], b[key], smooth);
    return sound;
  }


  // A periodic uniform cubic B-spline: position, tangent and curvature join smoothly.
  contourSplinePoint(points, position) {
    const index = Math.floor(position);
    const t = position - index;
    const n = points.length;
    const a = points[(index+n-1)%n];
    const b = points[index%n];
    const c = points[(index+1)%n];
    const d = points[(index+2)%n];
    const weights = [Math.pow(1-t,3), 3*t*t*t-6*t*t+4,
      -3*t*t*t+3*t*t+3*t+1, t*t*t];
    return { x: (a.x*weights[0]+b.x*weights[1]+c.x*weights[2]+d.x*weights[3])/6,
      y: (a.y*weights[0]+b.y*weights[1]+c.y*weights[2]+d.y*weights[3])/6 };
  }


  buildFaceContours(sounds) {
    const v = AUDIO_VISUAL_SETTINGS;
    const count = Math.round(constrain(v.samplePoints, 64, 128));
    const spacing = constrain(v.contourSpacing, 22, 40);
    const amplitude = constrain(v.motionAmplitude, 0, 240);
    const controls = v.outline.map(p => ({
      x: p[0]*screamer.faceWidth/146, y: p[1]*screamer.faceHeight/260
    }));
    const base = Array.from({ length: count }, (_, i) =>
      this.contourSplinePoint(controls, i/count*controls.length));
    const previousOffsets = new Array(count).fill(0);
    this.visualMaxDisplacement = 0;
    this.visualContours = sounds.map((sound, layer) => {
      const points = [];
      const rest = [];
      for (let i = 0; i < count; i++) {
        const p = base[i];
        const radius = Math.hypot(p.x, p.y);
        const nx = p.x/radius;
        const ny = p.y/radius;
        const angle = Math.atan2(p.y, p.x);
        // Two large shoulders shift with timbre, not a free-running sine animation.
        const upperCentre = -0.9 + 0.65*(sound.mid-sound.low);
        const leftCentre = -2.9 + 0.5*(sound.low-sound.mid);
        const lobe = centre => Math.pow((1+Math.cos(angle-centre))/2, 3);
        const upper = lobe(upperCentre);
        const left = lobe(leftCentre);
        const broad = 0.15 + (0.55+0.45*sound.low)*upper +
          (0.4+0.5*sound.mid)*left;
        const detail = sound.high * 3 * Math.cos(4*angle+sound.mid) * sound.level;
        // One level power, not several small gains multiplied together.
        const requested = amplitude*Math.pow(sound.level,1.4)*broad + detail;
        let offset = constrain(requested, 0, 140);
        if (layer > 0) {
          // Smooth lower bound preserves radial ordering without capping the main motion.
          const floor = previousOffsets[i] - spacing*0.48;
          offset = (offset+floor+Math.sqrt((offset-floor)*(offset-floor)+0.16))/2;
        }
        previousOffsets[i] = offset;
        const x = p.x + nx*spacing*layer;
        const y = p.y + ny*spacing*layer;
        rest.push({ x, y });
        points.push({ x: x+nx*offset, y: y+ny*offset });
      }
      // Measure the rendered spline, including the spacing correction, against its rest shape.
      let maxDisplacement = 0;
      for (let i = 0; i < count; i++) {
        const actual = this.contourSplinePoint(points, i);
        const origin = this.contourSplinePoint(rest, i);
        maxDisplacement = Math.max(maxDisplacement, Math.hypot(actual.x-origin.x, actual.y-origin.y));
      }
      this.visualMaxDisplacement = Math.max(this.visualMaxDisplacement, maxDisplacement);
      const gate = constrain(sound.level/0.12, 0, 1);
      return { points, rest, maxDisplacement, level: sound.level,
        alpha: gate*gate*(3-2*gate)*(0.96-layer*0.09), width: 3.8-layer*0.3 };
    });
  }


  copyGuidanceContour(contour) {
    return { ...contour, points: contour.points.map(p => ({ ...p })) };
  }


  clearDistractionVisual() {
    this.distractionVisual = null;
    this.guidanceContours = null;
  }


  beginDistractionVisual() {
    const v = AUDIO_DISTRACTION_SETTINGS;
    const now = millis();
    if (!this.visualContours.length) {
      this.buildFaceContours(Array.from({ length: 5 }, () => ({ level: 0, low: 0, mid: 0, high: 0 })));
    }
    const visible = this.guidanceContours || this.visualContours;
    const source = [0, 1, 2].map(i => this.copyGuidanceContour(visible[i] || this.visualContours[i]));
    const high = constrain(this.visualBands.high*v.highSensitivity, 0, 1);
    this.distractionVisual = {
      mode: "active", start: now, source, inner: source,
      outward: [3, 4].map(i => ({ born: now, life: v.releaseMs,
        contour: this.copyGuidanceContour(visible[i] || this.visualContours[i]), entry: true })),
      inward: [], nextGuide: now+v.contractMs,
      bass: this.visualBands.low, high, baseline: high, armed: false,
      nextHigh: now+Math.max(700, v.highCooldownMs),
      hover: 0, highlight: 0, eligible: false, outsideSince: now,
      pulseAt: -Infinity, pulseArmed: true
    };
    this.guidanceContours = [...source, ...this.distractionVisual.outward.map(e => e.contour)];
  }


  onGuidanceStateChange(newState) {
    if (newState === "stung" || newState === "scare") {
      this.clearDistractionVisual();
    } else if (newState === "distracted" && this.started) {
      this.beginDistractionVisual();
    } else if (newState === "watching" && this.distractionVisual) {
      const d = this.distractionVisual;
      d.mode = "recover";
      d.start = millis();
      d.source = d.inner.map(c => this.copyGuidanceContour(c));
      d.outward = [];
      d.inward = [];
      d.hover = d.highlight = 0;
      // Guidance ends with the state, independently of the Sub audio tail.
      this.guidanceContours = d.source;
    }
  }


  blendGuidanceContour(from, to, amount) {
    return { ...to, alpha: lerp(from.alpha, to.alpha, amount),
      width: lerp(from.width, to.width, amount),
      points: to.points.map((p, i) => {
        const a = from.points[Math.floor(i*from.points.length/to.points.length)];
        return { x: lerp(a.x,p.x,amount), y: lerp(a.y,p.y,amount) };
      }) };
  }


  offsetGuidanceContour(contour, distance, alpha, treble = 0) {
    return { ...contour, alpha, points: contour.points.map(p => {
      const radius = Math.max(1, Math.hypot(p.x,p.y));
      const detail = treble*3*Math.cos(3*Math.atan2(p.y,p.x));
      const scale = (radius+distance+detail)/radius;
      return { x: p.x*scale, y: p.y*scale };
    }) };
  }


  updateDistractionVisual() {
    const d = this.distractionVisual;
    if (!d) return;
    const v = AUDIO_DISTRACTION_SETTINGS;
    const now = millis();
    const dt = Math.min(Math.max(deltaTime,0),100);
    const ease = t => { t = constrain(t,0,1); return t*t*(3-2*t); };
    if (d.mode === "recover") {
      const t = ease((now-d.start)/v.recoverMs);
      this.guidanceContours = this.visualContours.map((c,i) => i < 3 ?
        this.blendGuidanceContour(d.source[i],c,t) : { ...c, alpha: c.alpha*t });
      if (t === 1) this.clearDistractionVisual();
      return;
    }
    if (state !== "distracted") { this.clearDistractionVisual(); return; }
    d.bass = lerp(d.bass,this.visualBands.low,1-Math.exp(-dt/v.breathSmoothMs));
    const high = constrain(this.visualBands.high*v.highSensitivity,0,1);
    if (deltaTime > 250) {
      d.high = d.baseline = high;
      d.nextHigh = now+Math.max(700,v.highCooldownMs);
      d.armed = false;
      d.inward = [];
      d.outward = [];
      d.nextGuide = now+v.guideIntervalMs;
    }
    d.high = lerp(d.high,high,1-Math.exp(-dt/70));
    d.baseline = lerp(d.baseline,high,1-Math.exp(-dt/420));
    const rise = d.high-d.baseline;
    if (rise < v.highThreshold*0.35) d.armed = true;

    // Use the exact successful-click query; no extra visual hitbox.
    const eligible = controls.canSting();
    if (eligible) {
      if (d.pulseArmed && now-d.pulseAt >= v.hoverCooldownMs) {
        d.pulseAt = now;
        d.pulseArmed = false;
      }
      d.outsideSince = null;
    } else {
      if (d.outsideSince === null) d.outsideSince = now;
      if (now-d.outsideSince >= v.hoverRearmMs) d.pulseArmed = true;
    }
    d.eligible = eligible;
    d.hover = lerp(d.hover,eligible ? 1 : 0,1-Math.exp(-dt/(eligible ? 80 : 170)));
    const pulseAge = (now-d.pulseAt)/v.hoverPulseMs;
    const pulse = eligible && pulseAge >= 0 && pulseAge < 1 ? Math.sin(Math.PI*pulseAge) : 0;
    d.highlight = d.hover*constrain(v.highlightStrength,0,1)*(0.42+0.58*pulse);

    const rest = this.visualContours[0].rest;
    const targets = [0,1,2].map(layer => ({
      alpha: 0.88-layer*0.12, width: 3.6-layer*0.3,
      points: rest.map(p => {
        const r = Math.max(1,Math.hypot(p.x,p.y));
        const nx = p.x/r, ny = p.y/r;
        // Keep the contracted left flank outside the character silhouette.
        const clearance = 1/Math.sqrt(Math.pow(nx/(screamer.faceWidth*0.95),2)+
          Math.pow(ny/(screamer.faceHeight*0.7),2));
        const scaled = r*constrain(v.innerScale,0.65,1);
        const radius = (scaled+clearance+Math.sqrt(Math.pow(scaled-clearance,2)+64))/2;
        const breath = d.bass*constrain(v.breathAmplitude,0,25)*(0.8+0.2*nx);
        const distance = radius+layer*constrain(v.innerSpacing,14,28)+breath-
          d.hover*constrain(v.hoverTighten,0,6);
        return { x: nx*distance, y: ny*distance };
      })
    }));
    const contraction = ease((now-d.start)/v.contractMs);
    d.inner = targets.map((c,i) => this.blendGuidanceContour(d.source[i],c,contraction));
    d.inward = d.inward.filter(e => now-e.born < v.guideLifeMs);
    d.outward = d.outward.filter(e => now-e.born < e.life);
    if (now >= d.nextGuide) {
      d.inward.push({ born: now });
      if (d.inward.length > 2) d.inward.shift();
      d.nextGuide = now+Math.max(800,v.guideIntervalMs);
    }
    if (d.armed && now >= d.nextHigh && d.high >= v.highMinLevel && rise >= v.highThreshold) {
      d.outward.push({ born: now, life: v.releaseMs,
        contour: this.copyGuidanceContour(d.inner[2]), entry: false });
      while (d.outward.length > 2) d.outward.shift();
      d.nextHigh = now+Math.max(700,v.highCooldownMs);
      d.armed = false;
    }
    const incoming = d.inward.map(e => {
      const age = constrain((now-e.born)/v.guideLifeMs,0,1);
      return this.offsetGuidanceContour(d.inner[2],45*(1-ease(age)),
        0.28*Math.sin(Math.PI*age));
    });
    const outgoing = d.outward.map(e => {
      const age = constrain((now-e.born)/e.life,0,1);
      const alpha = e.entry ? e.contour.alpha*(1-ease(age)) : 0.28*Math.sin(Math.PI*age);
      return this.offsetGuidanceContour(e.contour,65*ease(age),alpha,d.high);
    });
    this.guidanceContours = [...d.inner,...incoming,...outgoing];
  }


  drawDistractionHighlight() {
    const d = this.distractionVisual;
    if (!this.started || state !== "distracted" || !timer.isOpen() || !d || d.highlight < 0.002) return;
    const ctx = drawingContext;
    push();
    ctx.save();
    try {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = d.highlight;
      ctx.strokeStyle = AUDIO_VISUAL_SETTINGS.colour;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.beginPath(); ctx.rect(0,0,1050,1278); ctx.clip();
      ctx.translate(screamer.x-476,screamer.y-750);
      // Exact figureFace boundary from canvas/screamer.js, never the hit-test ellipse.
      ctx.beginPath();
      ctx.moveTo(479,620);
      ctx.bezierCurveTo(433,617,405,655,403,699);
      ctx.bezierCurveTo(397,744,417,771,434,802);
      ctx.bezierCurveTo(449,828,453,879,478,880);
      ctx.bezierCurveTo(505,887,511,827,524,799);
      ctx.bezierCurveTo(541,760,554,718,548,684);
      ctx.bezierCurveTo(544,645,514,620,479,620);
      ctx.closePath(); ctx.stroke();
    } finally { ctx.restore(); pop(); }
  }


  drawFaceDistortion() {
    if (!this.started || state === "stung" || state === "scare") return;
    const ctx = drawingContext;
    push();
    ctx.save();
    try {
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.rect(0, 0, 1050, 1278);
      ctx.clip();
      ctx.translate(screamer.x, screamer.y);
      ctx.strokeStyle = AUDIO_VISUAL_SETTINGS.colour;
      ctx.lineJoin = "round";
      const displayed = this.guidanceContours || this.visualContours;
      for (let layer = displayed.length-1; layer >= 0; layer--) {
        const contour = displayed[layer];
        if (contour.alpha < 0.002) continue;
        const points = contour.points;
        const n = points.length;
        ctx.globalAlpha = contour.alpha;
        ctx.lineWidth = contour.width;
        ctx.beginPath();
        const start = this.contourSplinePoint(points, 0);
        ctx.moveTo(start.x, start.y);
        for (let i = 0; i < n; i++) {
          const b = points[i];
          const c = points[(i+1)%n];
          const d = points[(i+2)%n];
          ctx.bezierCurveTo((4*b.x+2*c.x)/6, (4*b.y+2*c.y)/6,
            (2*b.x+4*c.x)/6, (2*b.y+4*c.y)/6,
            (b.x+4*c.x+d.x)/6, (b.y+4*c.y+d.y)/6);
        }
        ctx.closePath();
        ctx.stroke();
      }
      if (AUDIO_VISUAL_SETTINGS.debug) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#123157";
        ctx.fillRect(-230, -555, 470, 72);
        ctx.fillStyle = "#FCEEAA";
        ctx.font = "17px monospace";
        ctx.textAlign = "left";
        ctx.fillText("RMS " + this.visualRawLevel.toFixed(4) + "  mapped " +
          this.visualMappedLevel.toFixed(3), -218, -529);
        ctx.fillText("envelope " + this.visualIntensity.toFixed(3) + "  max shift " +
          this.visualMaxDisplacement.toFixed(1), -218, -503);
      }
    } finally {
      ctx.restore();
      pop();
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
