// ===== MECHANIC 4: AUDIO (without sound files) =====
// p5.js on its own can't play sound, so this file makes a "pretend" sound level.
// The closer your cursor is to the screamer, the louder his scream gets.
// The level is drawn as sound waves coming out of his mouth,
// and it makes the swirl lines in noise.js shake harder.


class AudioMixer {

  // ----- set up the sound level -----
  constructor() {
    // 0 = quiet, 1 = as loud as possible
    this.level = 0;
  }


  // ----- runs every frame: works out how loud it is -----
  update() {
    // closer cursor = louder scream
    // map() turns the distance into a number from 1 (very close) to 0 (far away)
    let target = map(controls.distance, 50, height * 0.8, 1, 0);
    // constrain() stops the number going below 0 or above 1
    target = constrain(target, 0, 1);

    // the jump scare is full volume, calm is silent
    if (state === "scare") {
      target = 1;
    }
    if (state === "calm") {
      target = 0;
    }

    // move the level slowly towards the target so it fades smoothly
    // (lerp() moves it 10% of the way each frame)
    this.level = lerp(this.level, target, 0.1);
  }


  // ----- draws the sound waves coming out of his mouth -----
  draw() {
    // where his mouth is
    let x = screamer.x;
    let y = screamer.y + screamer.r * 0.9;

    noFill();
    strokeWeight(2 + this.level * 3);

    // three rings that keep growing outwards and fade as they get bigger
    for (let i = 0; i < 3; i++) {
      // frameCount counts the frames, and % 300 makes the ring start small again after it reaches 300
      let ringSize = (frameCount * 3 + i * 100) % 300;
      let fade = map(ringSize, 0, 300, 160, 0);
      stroke(255, 240, 200, fade * this.level);
      ellipse(x, y, ringSize * 1.4, ringSize);
    }
  }
}
