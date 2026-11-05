// ===== MAIN SKETCH =====
// This file sets everything up and runs the main loop.
// The drawing is in the canvas folder, the interaction is in the mechanics folder.


// ----- shared variables -----

// what the screamer is doing: "watching", "distracted", "calm" or "scare"
let state = "watching";

// position and size of the screamer
let screamer;

// one object for each mechanic
let noiseLayer;
let timer;
let controls;
let audio;


// ----- load images before the sketch starts -----
function preload() {
  headImage = loadImage("assets/head.png");
}


// ----- runs once at the start -----
function setup() {
  createCanvas(windowWidth, windowHeight);
  placeScreamer();

  noiseLayer = new NoiseLayer();
  timer = new DistractionTimer();
  controls = new InputControls();
  audio = new AudioMixer();
}


// ----- runs every frame -----
function draw() {
  // 1. update all the mechanics
  noiseLayer.update();
  timer.update();
  controls.update();
  audio.update();

  // 2. a random event distracts him, which opens the secret window
  if (noiseLayer.eventStarted() && state === "watching") {
    changeState("distracted");
    timer.start();
  }

  // 3. draw everything from back to front
  drawSky();
  noiseLayer.drawSkyLines();
  noiseLayer.drawBird();
  drawWater();
  noiseLayer.drawWaterLines();
  noiseLayer.drawBoat();
  drawLand();
  drawBridge();
  noiseLayer.drawPasserby();
  drawScreamer();
  audio.draw();
  controls.draw();

  // 4. the jump scare goes on top of everything
  if (state === "scare") {
    drawJumpScare();
  }
}


// ----- changes the screamer's state and remembers when it changed -----
function changeState(newState) {
  state = newState;
  // millis() is how many milliseconds have passed since the sketch started
  timer.stateStartTime = millis();
}


// ----- puts the screamer in the right place for the window size -----
function placeScreamer() {
  screamer = {
    // x and y are his position on the screen
    x: width * 0.42,
    y: height * 0.6,
    // r is his size: change 0.09 to make him bigger or smaller
    r: height * 0.09
  };
}


// ----- mouse click -----
function mousePressed() {
  controls.clicked();
}


// ----- keep the canvas full screen when the window changes size -----
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  placeScreamer();
}
