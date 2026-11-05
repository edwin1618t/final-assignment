// Time-based background wave.
// References:
// https://p5js.org/reference/p5/frameCount/
// https://p5js.org/reference/p5/sin/

let waveTime = 0;
let waveEnabled = false;

// Settings use the original drawing coordinates.
// Gentle default amplitude; the input mechanic can change waveHeight later.
let waveHeight = 8;
let waveLength = 700;
let wavePeriod = 8;

function updateTimeBased() {
  // Target frame rate: 30 frames per second.
  waveTime = frameCount / 30;
}

function waveY(x, y) {
  if (!waveEnabled) {
    return y;
  }

  // Keep the top and bottom edges stable.
  let edgeStrength = constrain(
    min(y, 1278 - y) / 100,
    0,
    1
  );

  // Changing time moves the wave from left to right.
  // sin() uses the default radians angle mode.
  let phase = TWO_PI * (
    x / waveLength - waveTime / wavePeriod
  );

  let offset = sin(phase) * waveHeight * edgeStrength;

  return y + offset;
}
