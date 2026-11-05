// ===== MECHANIC 2: TIME-BASED =====
// Gentle sine waves move the background; the lake stays still until hovered over.
// Holding the bee in one area for about 3 seconds makes a local distortion grow.
// The figure looks at it for 1 second, then shakes and leaves if the bee stays.
// Moving away before he leaves cancels the reaction and lets the distortion fade.
// frameCount controls the hover timing, and lerp() smooths the changes.
// The team's existing millis() timers handle distractions and leaving/returning.
// AI acknowledgement: the original shared event timers were written with help
// from Claude (AI). ChatGPT assisted with Qiaoyi's background waves, hover timing,
// smooth transitions and figure reactions, connected to the team's eye tracking
// and leave-and-return animation. See README.md.
// Timing and movement were refined based on Qiaoyi's feedback.
// Course basis: Week 7 classes, Week 8 sin(), Week 11 frameCount/lerp/transforms.
// https://p5js.org/reference/p5/frameCount/
// https://p5js.org/reference/p5/lerp/

class DistractionTimer {
  constructor(backgroundMask) {
    // Keep the existing interfaces used by input.js and screamer.js.
    this.windowStart = 0;
    this.windowLength = 0;
    this.stateStartTime = 0;
    this.stungLength = 6300;
    this.floatAwayTime = 2000;
    this.hideTime = 2000;
    this.floatBackTime = 1600;
    this.scareLength = 1200;

    // Qiaoyi's original gentle sine wave, using the same settings.
    this.waveTime = 0;
    this.waveHeight = 8;
    this.waveLength = 700;
    this.wavePeriod = 8;

    // 90 frames is about 3 seconds at the sketch's target of 30 FPS.
    this.hoverFrames = 90;
    this.lookFrames = 30;
    this.shakeFrames = 24;
    this.shakeStrength = 0;
    this.releaseFrames = 120;
    this.hoverStartFrame = -1;
    this.releaseStartFrame = 0;
    this.hoverX = 0;
    this.hoverY = 0;
    this.hoverTolerance = 12;
    this.dentX = 0;
    this.dentY = 0;
    this.dentStrength = 0;
    this.releaseStrength = 0;
    this.dentRadius = 300;
    this.dentDepth = 165;
    this.noticed = false;
    this.attention = 0;
    this.figureStrength = 0;
    this.backgroundMask = backgroundMask;
  }

  start() {
    this.windowStart = millis();
    this.windowLength = noiseLayer.randomWindowLength();
  }

  isOpen() {
    return millis() - this.windowStart < this.windowLength;
  }

  timeInState() {
    return millis() - this.stateStartTime;
  }

  update() {
    this.waveTime = frameCount / 30;
    if (state === "distracted" && !this.isOpen()) {
      changeState("watching");
    }
    if (state === "stung" && this.timeInState() > this.stungLength) {
      changeState("watching");
    }
    if (state === "scare" && this.timeInState() > this.scareLength) {
      changeState("watching");
    }
    this.updateHover();
  }

  updateHover() {
    let x = mouseInPainting.x;
    let y = mouseInPainting.y;
    let onBackground = false;
    let targetShake = 0;

    if (focused && state === "watching" && this.backgroundMask &&
        x >= 0 && x < 1050 && y >= 0 && y < 1278) {
      // p5.js image lookup: white is background, black is a fixed part.
      // This follows the course's loadImage/get image exercises.
      // https://p5js.org/reference/p5.Image/get/
      let pixel = this.backgroundMask.get(floor(x), floor(y));
      onBackground = pixel[0] > 127;
    }

    if (onBackground) {
      let tolerance = this.hoverTolerance / max(0.01, painting.scale);
      let movement = dist(x, y, this.hoverX, this.hoverY);
      if (this.hoverStartFrame < 0 || movement > tolerance) {
        this.hoverStartFrame = frameCount;
        this.hoverX = x;
        this.hoverY = y;
      }

      // Start at the mouse position while the dent is still invisible.
      if (this.dentStrength <= 0) {
        this.dentX = x;
        this.dentY = y;
      } else {
        this.dentX = lerp(this.dentX, x, 0.2);
        this.dentY = lerp(this.dentY, y, 0.2);
      }

      let elapsedFrames = frameCount - this.hoverStartFrame;
      let progress = constrain(elapsedFrames / this.hoverFrames, 0, 1);
      let target = lerp(0.22, 1, progress);
      // Losing a hold should not snap the shape back.
      let easing = target < this.dentStrength ? 0.04 : 0.12;
      this.dentStrength = lerp(this.dentStrength, target, easing);
      this.noticed = elapsedFrames >= this.hoverFrames;
      if (this.noticed) {
        // Look for one second, then shake if the bee keeps staying here.
        let reactionFrames = elapsedFrames - this.hoverFrames;
        targetShake = constrain(
          (reactionFrames - this.lookFrames) / this.shakeFrames, 0, 1);
        if (reactionFrames >= this.lookFrames + this.shakeFrames) {
          this.fleeFromHover();
          targetShake = 0;
        }
      }
    } else {
      this.resetHover();
    }

    // Ease both into and out of the reaction.
    this.shakeStrength = lerp(this.shakeStrength, targetShake, 0.15);
    this.attention = lerp(this.attention, this.noticed ? 1 : 0, 0.08);

    // A nearby dent can pull him in after he notices it.
    let nearby = constrain(1 - dist(this.dentX, this.dentY, 474, 800) / 700, 0, 1);
    let pull = this.dentStrength * this.attention * nearby;
    this.figureStrength = lerp(this.figureStrength, pull, 0.08);
  }

  fleeFromHover() {
    let edge = noiseLayer.pickRandomEdge();
    screamer.awayX = edge[0];
    screamer.awayY = edge[1];
    this.resetHover();
    // "stung" already runs the team's leave-and-return animation.
    // Reuse that state without adding a sting, a sound or a pimple.
    changeState("stung");
    // Skip the 700 ms pimple-growth wait in the existing animation.
    this.stateStartTime -= 700;
  }

  resetHover() {
    if (this.hoverStartFrame >= 0) {
      this.hoverStartFrame = -1;
      this.releaseStartFrame = frameCount;
      this.releaseStrength = this.dentStrength;
    }
    this.noticed = false;
    let progress = constrain(
      (frameCount - this.releaseStartFrame) / this.releaseFrames, 0, 1);
    // Smooth recovery, with no bounce past the original shape.
    let recovery = progress * progress * (3 - 2 * progress);
    this.dentStrength = this.releaseStrength * (1 - recovery);
  }

  isHovering() {
    return this.hoverStartFrame >= 0;
  }

  distortPoint(x, y) {
    let dx = x - this.dentX;
    let dy = y - this.dentY;
    let weight = constrain(1 - (dx * dx + dy * dy) /
      (this.dentRadius * this.dentRadius), 0, 1);
    let edge = constrain(min(y, 1278 - y) / 100, 0, 1);
    let amount = weight * weight * this.dentStrength * edge;
    return [
      x - (dx * 0.25 + dy * 0.2) * amount,
      y + (this.dentDepth - dy * 0.25 + dx * 0.2) * amount
    ];
  }

  // Only background parts call this; fixed parts keep their original points.
  // Same sine rule as Qiaoyi's original waveY().
  // https://p5js.org/reference/p5/sin/
  waveY(x, y, idleWave = true) {
    if (!idleWave) return y;
    let edgeStrength = constrain(min(y, 1278 - y) / 100, 0, 1);
    let phase = TWO_PI * (x / this.waveLength - this.waveTime / this.wavePeriod);
    return y + sin(phase) * this.waveHeight * edgeStrength;
  }

  drawBackgroundVertex(x, y) {
    let point = this.distortPoint(x, y);
    vertex(point[0], point[1]);
  }

  drawBackgroundLine(x1, y1, x2, y2) {
    let steps = max(1, ceil(dist(x1, y1, x2, y2) / 30));
    for (let step = 1; step <= steps; step++) {
      let progress = step / steps;
      this.drawBackgroundVertex(lerp(x1, x2, progress), lerp(y1, y2, progress));
    }
  }

  drawBackgroundPath(points, closed, idleWave = true) {
    let hasDent = this.dentStrength > 0.001;
    let firstX = points[0][0];
    let firstY = this.waveY(firstX, points[0][1], idleWave);
    let lastX = firstX;
    let lastY = firstY;
    beginShape();
    if (hasDent) this.drawBackgroundVertex(firstX, firstY);
    else vertex(firstX, firstY);

    for (let i = 1; i < points.length; i++) {
      let point = points[i];
      if (point.length === 2) {
        let y = this.waveY(point[0], point[1], idleWave);
        if (hasDent) this.drawBackgroundLine(lastX, lastY, point[0], y);
        else vertex(point[0], y);
        lastX = point[0];
        lastY = y;
      } else {
        let controlY1 = this.waveY(point[0], point[1], idleWave);
        let controlY2 = this.waveY(point[2], point[3], idleWave);
        let endY = this.waveY(point[4], point[5], idleWave);
        if (hasDent) {
          // Sample the same curve only when a local dent is active.
          // https://p5js.org/reference/p5/bezierPoint/
          for (let step = 1; step <= 32; step++) {
            let t = step / 32;
            let x = bezierPoint(lastX, point[0], point[2], point[4], t);
            let y = bezierPoint(lastY, controlY1, controlY2, endY, t);
            this.drawBackgroundVertex(x, y);
          }
        } else {
          // The default uses the original smooth cubic outline.
          bezierVertex(point[0], controlY1, point[2], controlY2, point[4], endY);
        }
        lastX = point[4];
        lastY = endY;
      }
    }

    if (closed) {
      if (hasDent) this.drawBackgroundLine(lastX, lastY, firstX, firstY);
      endShape(CLOSE);
    } else {
      endShape();
    }
  }

  figureTransform() {
    // Keep the current pose as he starts leaving, then let it relax.
    let strength = state === "scare" ? 0 : this.figureStrength;
    let direction = constrain((this.dentX - 474) / 240, -1, 1);
    let shake = state === "scare" ? 0 : this.shakeStrength;
    return {
      x: constrain(this.dentX - 474, -400, 400) * strength * 0.1
        + sin(frameCount * 1.7) * shake * 10,
      y: constrain(this.dentY - 800, -400, 400) * strength * 0.07
        + sin(frameCount * 1.9) * shake * 4,
      turn: direction * strength * 0.16
        + sin(frameCount * 1.7) * shake * 0.025,
      width: 1 + strength * 0.07,
      height: 1 - strength * 0.12
    };
  }

  applyFigureReaction() {
    let pull = this.figureTransform();
    translate(474 + pull.x, 1000 + pull.y);
    rotate(pull.turn);
    scale(pull.width, pull.height);
    translate(-474, -1000);
  }

  // Undo the drawing transform so the face hitbox follows him.
  figurePoint(x, y) {
    let pull = this.figureTransform();
    let dx = x - 474 - pull.x;
    let dy = y - 1000 - pull.y;
    return [
      474 + (dx * cos(pull.turn) + dy * sin(pull.turn)) / pull.width,
      1000 + (-dx * sin(pull.turn) + dy * cos(pull.turn)) / pull.height
    ];
  }
}
