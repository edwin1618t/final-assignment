// Time mechanic: hover growth, attention, recovery and the team's event timers.
// The original event timers were developed with Claude assistance.
// ChatGPT helped adapt Qiaoyi's hover interaction to this shared structure.
// Course basis: Week 7 objects/classes and Week 11 frameCount/lerp/transforms.
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

    // 90 frames is about 3 seconds at the sketch's target of 30 FPS.
    this.hoverFrames = 90;
    this.releaseFrames = 45;
    this.hoverStartFrame = -1;
    this.releaseStartFrame = 0;
    this.hoverX = 0;
    this.hoverY = 0;
    this.hoverTolerance = 12;
    this.dentX = 0;
    this.dentY = 0;
    this.dentStrength = 0;
    this.releaseStrength = 0;
    this.dentRadius = 240;
    this.dentDepth = 90;
    this.noticed = false;
    this.attention = 0;
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

      // A small dent starts immediately and follows the moving bee.
      if (this.dentStrength <= 0) {
        this.dentX = x;
        this.dentY = y;
        this.dentStrength = 0.22;
      } else {
        this.dentX = lerp(this.dentX, x, 0.7);
        this.dentY = lerp(this.dentY, y, 0.7);
      }

      let elapsedFrames = frameCount - this.hoverStartFrame;
      let progress = constrain(elapsedFrames / this.hoverFrames, 0, 1);
      let growth = progress * progress * (3 - 2 * progress);
      let target = lerp(0.22, 1, growth);
      this.dentStrength = lerp(this.dentStrength, target, 0.5);
      this.noticed = elapsedFrames >= this.hoverFrames;
      if (this.noticed) this.dentStrength = 1;
    } else {
      this.resetHover();
    }

    this.attention = lerp(this.attention, this.noticed ? 1 : 0,
      this.noticed ? 0.25 : 0.12);
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
    this.dentStrength = this.releaseStrength * (1 - progress);
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
      x - (dx * 0.2 + dy * 0.08) * amount,
      y + (this.dentDepth - dy * 0.2 + dx * 0.08) * amount
    ];
  }

  drawBackgroundVertex(x, y) {
    let point = this.distortPoint(x, y);
    // Keep Edwin's noise movement and add the timed dent to it.
    vertex(point[0], point[1] + noiseLayer.wobbleAt(x, y));
  }

  drawBackgroundLine(x1, y1, x2, y2) {
    let steps = max(1, ceil(dist(x1, y1, x2, y2) / 30));
    for (let step = 1; step <= steps; step++) {
      let progress = step / steps;
      this.drawBackgroundVertex(lerp(x1, x2, progress), lerp(y1, y2, progress));
    }
  }

  drawBackgroundPath(points, closed) {
    beginShape();
    let firstX = points[0][0];
    let firstY = points[0][1];
    let lastX = firstX;
    let lastY = firstY;
    this.drawBackgroundVertex(firstX, firstY);

    for (let i = 1; i < points.length; i++) {
      let point = points[i];
      if (point.length === 2) {
        this.drawBackgroundLine(lastX, lastY, point[0], point[1]);
        lastX = point[0];
        lastY = point[1];
      } else {
        // p5.js method beyond the reviewed examples: sample a cubic curve
        // so its middle can bend too. t runs from 0 to 1 along the curve.
        // https://p5js.org/reference/p5/bezierPoint/
        for (let step = 1; step <= 32; step++) {
          let t = step / 32;
          let x = bezierPoint(lastX, point[0], point[2], point[4], t);
          let y = bezierPoint(lastY, point[1], point[3], point[5], t);
          this.drawBackgroundVertex(x, y);
        }
        lastX = point[4];
        lastY = point[5];
      }
    }

    if (closed) {
      this.drawBackgroundLine(lastX, lastY, firstX, firstY);
      endShape(CLOSE);
    } else {
      endShape();
    }
  }

  applyFigureReaction() {
    if (state !== "watching") return;
    translate(474, 1278);
    let direction = constrain((this.dentX - 474) / 200, -1, 1);
    rotate(direction * this.attention * 0.018);
    scale(1 + this.attention * 0.025, 1 - this.attention * 0.02);
    translate(-474, -1278);
  }
}
