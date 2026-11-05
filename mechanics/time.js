// ===== MECHANIC 2: TIME =====
// Uses millis() to time things the player can't see:
//  - the secret window (5 to 10 seconds) after something distracts him
//  - how long the sting lasts, and how long the jump scare lasts, before he goes back to watching
// AI acknowledgement: this file was written with help from Claude (AI). See README.md.


class DistractionTimer {

  // ----- set up the timer -----
  constructor() {
    // when the secret window opened, and how long it lasts
    this.windowStart = 0;
    this.windowLength = 0;

    // when the screamer's state last changed
    this.stateStartTime = 0;

    // how long the stung state (pimple, float away, come back) and the jump scare last (in milliseconds)
    this.stungLength = 6300;

    // after a sting: how long he floats away, how long he stays gone, and how long to float back
    // (change hideTime to make him stay away longer or shorter)
    this.floatAwayTime = 2000;
    this.hideTime = 2000;
    this.floatBackTime = 1600;
    this.scareLength = 1200;
  }


  // ----- opens the secret window with a random length -----
  start() {
    this.windowStart = millis();
    // a random length between 5 and 10 seconds (randomWindowLength() is in noise.js)
    this.windowLength = noiseLayer.randomWindowLength();
  }


  // ----- is the secret window still open? -----
  isOpen() {
    // time since the window opened, compared with how long it should stay open
    return millis() - this.windowStart < this.windowLength;
  }


  // ----- how long the screamer has been in his current state -----
  timeInState() {
    return millis() - this.stateStartTime;
  }


  // ----- runs every frame: sends him back to watching when time is up -----
  update() {
    // window closed and you didn't click: he snaps back
    if (state === "distracted" && !this.isOpen()) {
      changeState("watching");
    }

    // after a sting he floats away and comes back, then watches again
    if (state === "stung" && this.timeInState() > this.stungLength) {
      changeState("watching");
    }

    // the jump scare is short and sudden, then everything goes back to normal
    if (state === "scare" && this.timeInState() > this.scareLength) {
      changeState("watching");
    }
  }
}
