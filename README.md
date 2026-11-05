# The Scream, Disturbed

An interactive p5.js reinterpretation of Edvard Munch's *The Scream* (1893).

## Inspiration

In the painting, a man on a bridge screams at a burning sky. We asked what would make him
scream, and made you the cause: your cursor is a bee buzzing around his face. The swirling
sky and water come from the painting's brush strokes. The two figures on the bridge became
random passers-by who distract him.

## Interaction instructions

1. Click anywhere to start the sound (turn your volume up).
2. Move the bee (your mouse). Far away you hear opera; the closer it gets to his face, the louder the screech.
3. His eyes follow the bee. Don't touch his face while he is watching you, or he jumps at you.
4. Wait for something to distract him (a boat crash on the lake, a bird or a passer-by). His eyes turn to look at it. You then have a secret 5–10 seconds: click his face and the bee stings him. A pimple grows where you clicked, and he turns around and floats off to a random edge, then comes back.
5. Click his face at the wrong time and he jumps at you.
6. Press **Space** to restart. This reloads the page and returns to the start panel; click again to start the sound.

## How the code is organised

| Folder / file | What it does |
| --- | --- |
| `index.html` | loads p5.js, p5.sound and all the files below |
| `script.js` | the main sketch: `setup()`, `draw()`, fitting the painting to the window |
| `canvas/scenery.js` | sky, hills, lake, shoreline, and the shared `drawStillPart()` / `drawWavyPart()` / `drawPath()` helpers |
| `canvas/bridge.js` | the bridge, and where people stand on it |
| `canvas/people.js` | `drawPerson()`: the passer-by in a top hat and coat |
| `canvas/screamer.js` | the screamer and the jump scare |
| `canvas/frame.js` | the wooden frame around the painting |
| `mechanics/noise.js` | Perlin noise + randomness mechanic |
| `mechanics/time.js` | time-based mechanic |
| `mechanics/input.js` | user input mechanic |
| `mechanics/audio.js` | audio mechanic |

## Techniques

- **Drawing:** We drew the painting in Figma; it was rebuilt exactly as named parts (e.g. `skyUpperRedBand`), each a list of points drawn with `beginShape()`, `vertex()` and `bezierVertex()`. The painting is 1050 × 1278 units; `translate()` and `scale()` fit it to any window size.
- **Perlin noise + randomness:** `noise(x, y, time)` moves every point of the sky, hills and water up and down, so the whole background waves while the bridge and the screamer stay still. `noise()` also makes the sky and water colours shimmer lighter and darker, and `randomSeed()` / `noiseSeed()` give every visit its own pattern. `random()` picks which event happens and when; in the boat crash, `dist()` detects when two boats hit, and they rock with `rotate()`.
- **Time-based:** `millis()` times a hidden 5–10 second window after each event, plus how long the sting (pimple, floating away, coming back) and the jump scare last. A simple state machine: watching → distracted → stung or scare → watching.
- **User input:** `InputControls` in `mechanics/input.js` handles the bee cursor, movement-based tilt, pupil tracking and dilation, face hit detection and sting input. It uses the shared painting coordinates and distraction timer. A p5.js `keyPressed()` event handles Space to restart. See the User input section below.
- **Audio:** two looping tracks with p5.sound. `setVolume()` crossfades opera → screech as you get closer, and `p5.Amplitude().getLevel()` measures the real loudness, which makes the background wave harder. `p5.FFT` splits the sound into 32 frequencies that bend three wavy sound rings around his face.

## Mechanic ownership

| Mechanic | Owner | File |
| --- | --- | --- |
| Perlin noise + randomness | [name] | `mechanics/noise.js` |
| Time-based | [name] | `mechanics/time.js` |
| User input | Yuqian Zhang | `mechanics/input.js` |
| Audio | [name] | `mechanics/audio.js` |

Drawing: our team's Figma redraw of the painting.

## User input — Yuqian Zhang

The input mechanic lets the user act as a bee and interact with the screamer.
The active implementation is `mechanics/input.js`; the current page does not load
the earlier `input-controls.js` implementation.

### Bee cursor and movement

`noCursor()` hides the system cursor on the full-window canvas. The bee is drawn
with p5.js shapes at `mouseX` and `mouseY`, including animated wings driven by
`sin()` and `rotate()`. Its position follows the mouse directly, including outside
the painting within the canvas.

Horizontal movement is calculated by subtracting the previous frame's mouse X
position from the current one. `map()` and `constrain()` convert this movement
into a tilt of up to 30 degrees left or right. `lerp()` makes the bee lean quickly
while moving and return upright more slowly when horizontal movement stops.
Only the angle is smoothed; the cursor position has no added easing. Rotation
uses the existing mouse hotspot so it stays aligned with the interaction point.

### Eyes and distance

`drawTrackingEye()` draws pale 20 × 45 eye shapes with dark blue pupils and small
white highlights, keeping the original eye centres and head position. The pupils
follow the bee and grow as its distance from the face decreases. Their movement
range decreases as they grow, keeping them inside the eyes. During distraction,
they become small and look towards the random event instead.

`script.js` converts screen coordinates into the painting's 1050 × 1278 coordinate
system through `fitPainting()`. Input uses this shared `mouseInPainting` position
for distance and hit detection. `controls.distance` stores the distance to the face
centre for both the audio and noise mechanics; no separate SVG coordinate
conversion is used in this version.

### Clicks, state and restart

`isOnFace()` checks an elliptical face region. Background clicks do not count as
stings. After the first click starts audio, `script.js` forwards clicks to
`controls.clicked()`. A face click succeeds only when the state is `distracted`
and `timer.isOpen()` is true. A face click while `watching` triggers `scare`;
touching the face while watching also triggers it once audio has started.

`sting()` records the sting position and timestamp, requests a random departure
edge from the noise module, plays the sting sound and changes the state to
`stung`. The figure's pimple drawing and departure animation remain in
`canvas/screamer.js`, while `mechanics/time.js` manages the distraction window
and state durations. Input does not create another distraction timer.

Pressing **Space** invokes the p5.js `keyPressed()` callback and uses the browser's
`window.location.reload()` API to restart the entire experience. `return false`
prevents the default Space-key scrolling behaviour. Audio must be started again
with a click after the reload.

## AI acknowledgement

Claude (Anthropic) and ChatGPT (OpenAI) assisted with translating the team's Figma drawing into p5.js, developing and integrating code, explaining implementation choices, refining interactions, and writing comments and documentation. The team directed the design decisions and selected and adjusted the implementations. Specific AI-assisted contributions are acknowledged in the relevant code comments.

## External references

- p5.js reference: https://p5js.org/reference/
- p5.sound (official p5.js sound add-on), used for `loadSound()`, `setVolume()` and `p5.Amplitude`: https://p5js.org/reference/p5.sound/
- `assets/sounds/opera-placeholder.mp3`, `screech-placeholder.mp3` and `sting-placeholder.mp3` are simple stand-in sounds made for this project. [Replace with your final tracks and credit their source here.]
