// The Scream, Disturbed
// Base skeleton. Step numbers match "The mechanics, one concept at a time" in the guide.

// The screamer's current state: "watching", "distracted", "calm" or "lunge"
let state = "watching";

function setup() {
  createCanvas(windowWidth, windowHeight);

  // TODO (step 2): create the swirling lines for the sky, fjord and bridge
  // TODO (step 3): pick when the first random event happens
}

function draw() {
  background(20);

  // TODO (step 2): update and draw the swirling world
  // TODO (step 3): check for and draw random events (passerby, boat, bird)
  // TODO (step 4): check the hidden timer and update `state`
  // TODO (step 1): draw the screamer, eyes following the cursor
  // TODO (step 1): draw your own cursor (the insect)
}

function mousePressed() {
  // TODO (step 5): was he clicked? Window open -> calm, otherwise -> lunge
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
