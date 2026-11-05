// ===== MECHANIC 2: TIME =====
// Uses millis() to time things the player can't see:
//  - the secret window (5 to 10 seconds) after something distracts him
//  - how long he stays calm or keeps lunging before he goes back to watching


class DistractionTimer {

  // ----- set up the timer -----
  constructor() {
    // when the secret window opened, and how long it lasts
    this.windowStart = 0;
    this.windowLength = 0;

    // when the screamer's state last changed
    this.stateStartTime = 0;

    // how long the calm state and the jump scare last (in milliseconds)
    this.calmLength = 4000;
    this.scareLength = 1200;
  }


  // ----- opens the secret window with a random length -----
  start() {
    this.windowStart = millis();
    // a random length between 5 and 10 seconds
    this.windowLength = random(5000, 10000);
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

    // calm lasts a few seconds
    if (state === "calm" && this.timeInState() > this.calmLength) {
      changeState("watching");
    }

    // the jump scare is short and sudden, then everything goes back to normal
    if (state === "scare" && this.timeInState() > this.scareLength) {
      changeState("watching");
    }
  }
}
