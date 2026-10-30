let state = "watching";
let screamer;

let world;
let timer;
let controls;
let audio;

function setup() {
  createCanvas(windowWidth, windowHeight);
  screamer = { x: width / 2, y: height * 0.65, r: 60 };

  world = new NoiseLayer();
  timer = new DistractionTimer();
  controls = new InputControls();
  audio = new AudioMixer();
}

function draw() {
  background(20);

  world.update();
  timer.update();
  controls.update();
  audio.update();

  world.draw();
  drawScreamer();
  controls.draw();
}

function drawScreamer() {
  noStroke();
  fill(220);
  ellipse(screamer.x, screamer.y, screamer.r * 2);
}

function mousePressed() {
  controls.clicked();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
