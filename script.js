// ===== MAIN SKETCH =====
// This file sets everything up and runs the main loop.
// The drawing is in the canvas folder, the interaction is in the mechanics folder.
// AI acknowledgement: this file was written with help from Claude (AI). See README.md.


// ----- shared variables -----

// what the screamer is doing: "watching", "distracted", "stung" or "scare"
let state = "watching";

// the screamer (in painting units)
// x, y = the middle of his face; faceWidth, faceHeight = the size of his face (the hitbox)
// awayX, awayY = the edge he floats off to after a sting; pimples = where the bee stung him
let screamer = { x: 476, y: 750, faceWidth: 146, faceHeight: 260, awayX: 0, awayY: 0, pimples: [] };

// where the painting sits on the screen and how much it is shrunk or grown
let painting = { left: 0, top: 0, scale: 1 };

// the mouse position in painting units (so it matches the drawing)
let mouseInPainting = { x: 0, y: 0 };

// one object for each mechanic
let noiseLayer;
let timer;
let controls;
let audio;


// ----- load the sounds before the sketch starts -----
function preload() {
  // Load all tracks before starting the sketch.
  operaSound = loadSound("assets/sounds/CW_Opera.wav");
  screechSound = loadSound("assets/sounds/CW_Screaming.wav");
  stingSound = loadSound("assets/sounds/CW_bit.wav");
  beeSound = loadSound("assets/sounds/CW_Bee.wav");
  jumpscareSound = loadSound("assets/sounds/CW_Jumpscare(2).wav");
  distractionSound = loadSound("assets/sounds/CW_Distrace.wav");
  subSound = loadSound("assets/sounds/CW_Sub.wav");
}


// ----- runs once at the start -----
function setup() {
  createCanvas(windowWidth, windowHeight);

  noiseLayer = new NoiseLayer();
  timer = new DistractionTimer();
  controls = new InputControls();
  audio = new AudioMixer();
}


// ----- runs every frame -----
function draw() {
  // 1. work out where the painting goes in the window, and where the mouse is on it
  fitPainting();

  // 2. update all the mechanics
  noiseLayer.update();
  timer.update();
  controls.update();
  audio.update();

  // 3. a random event distracts him, which opens the secret window
  if (noiseLayer.eventStarted() && state === "watching") {
    changeState("distracted");
    timer.start();
  }

  // 4. draw the painting from back to front
  // push() and pop() keep the moving and shrinking just for the painting
  push();
  translate(painting.left, painting.top);
  scale(painting.scale);

  drawSky();
  noiseLayer.drawBird();
  drawMountains();
  drawLake();
  noiseLayer.drawBoats();
  drawRightLake();
  drawBridge();
  audio.drawPanPrint();
  audio.drawBridgeAudio();
  noiseLayer.drawPasserby();
  audio.drawFaceDistortion();
  drawScreamer();
  // Face-edge feedback uses the same painting coordinates, above the character.
  audio.drawDistractionHighlight();

  pop();

  // 5. the frame around the painting, then the bee cursor
  drawFrame();
  controls.draw();

  // 6. the jump scare and the start message go on top of everything
  if (state === "scare") {
    drawJumpScare();
  }
  audio.drawStartMessage();
}


// ----- fits the painting (1050 x 1278) into the middle of the window -----
function fitPainting() {
  // leave 40 pixels of space around it
  // min() picks the smaller number, so the whole painting always fits
  painting.scale = min((width - 80) / 1050, (height - 80) / 1278);
  painting.left = (width - 1050 * painting.scale) / 2;
  painting.top = (height - 1278 * painting.scale) / 2;

  // turn the mouse position on the screen into a position on the painting
  mouseInPainting.x = (mouseX - painting.left) / painting.scale;
  mouseInPainting.y = (mouseY - painting.top) / painting.scale;
}


// ----- changes the screamer's state and remembers when it changed -----
function changeState(newState) {
  const previousState = state;
  state = newState;
  // millis() is how many milliseconds have passed since the sketch started
  timer.stateStartTime = millis();
  // Notify audio immediately, including transitions between draw frames.
  if (audio) {
    audio.onStateChange(previousState, newState);
  }
}


// ----- mouse click -----
function mousePressed() {
  // the first click only switches the sound on
  if (!audio.started) {
    audio.start();
    return;
  }
  // work out where the mouse is on the painting right now, then check the click
  fitPainting();
  controls.clicked();
}


// ----- keep the canvas full screen when the window changes size -----
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
