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
3. While he is watching, hold the bee over one background area. After about 3 seconds he looks towards it for 1 second, then briefly shakes and leaves if the bee stays. Moving away before departure cancels the remaining reaction; the local distortion recovers over about 4 seconds.
4. Wait for something to distract him (a boat crash on the lake, a bird or a passer-by). His eyes turn to look at it. You then have a secret 5–10 seconds: click his face and the bee stings him. A pimple grows where you clicked, and he turns around and floats off to a random edge, then comes back.
5. Click his face at the wrong time and he jumps at you.
6. Press **Space** to restart. This reloads the page and returns to the start panel; click again to start the sound.

## How the code is organised

| Folder / file | What it does |
| --- | --- |
| `index.html` | loads p5.js, p5.sound and all the files below |
| `sketch.js` | the main sketch: `setup()`, `draw()`, fitting the painting to the window |
| `canvas/scenery.js` | sky, hills, lake, shoreline, and the shared `drawStillPart()` / `drawWavyPart()` / `drawHoverPart()` / `drawPath()` helpers |
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
- **Perlin noise + randomness:** `noise(x, y, time)` moves every point of the sky, hills and water up and down (added on top of the time mechanic's sine wave), so the whole background waves while the bridge and the screamer stay still. `noise()` also makes the sky and water colours shimmer lighter and darker, and `randomSeed()` / `noiseSeed()` give every visit its own pattern. `random()` picks which event happens and when; in the boat crash, `dist()` detects when two boats hit, and they rock with `rotate()`.
- **Time-based (Qiaoyi Xin):** `sin()` and `frameCount` create repeating background waves alongside the noise module's Perlin movement. Holding the bee in one area grows a local distortion and starts the figure's look, shake and leave sequence. `lerp()` softens the transitions. See the Time-based section below.
- **User input:** `InputControls` in `mechanics/input.js` handles the bee cursor, movement-based tilt, pupil tracking and dilation, face hit detection and sting input. It uses the shared painting coordinates and distraction timer. A p5.js `keyPressed()` event handles Space to restart. See the User input section below.
- **Audio:** The audio mechanic combines interactive mixing with visuals driven by measured sound.

    - **Distance-based mixing:** Opera and screech loops play together. Distance controls their relative volumes through `setVolume()`, with short fades to smooth changes and a minimum opera level to retain the musical background.
    - **Bee spatial sound:** `pan()` moves the buzzing between left and right channels. During distraction, the bee becomes louder and receives small, smoothed playback-rate changes that vary its pitch.
    - **State-based sound:** Distraction adds a looping cue and a low-frequency layer. Gain controls reduce competing sounds, then restore the mix as distraction ends. Sting and jump-scare sounds provide distinct action feedback.
    - **Loudness analysis:** `p5.Amplitude` measures the overall mix. Separate Web Audio analyser branches measure individual sources without adding another audible playback path.
    - **Scream contours:** A 1024-bin `p5.FFT` analyses the scream. Measured loudness and low, mid and high frequency energy shape five curved contours around the face. Smoothed responses and delayed samples carry changes through successive contours.
    - **Bridge texture:** Measured opera loudness and frequency energy change the width and curvature of grain-like ribbons within the wooden rails and posts. Peaks in the distraction cue trigger travelling accents along the bridge.
    - **Distraction guidance:** The face contours contract during distraction. Bass energy influences their breathing movement, while eligible hovering adds a visual highlight to guide the sting interaction.
    - **Stereo print effect:** The same smoothed pan value used for the bee sound controls coloured edge impressions. This visual uses the audio control parameter, rather than measured waveform or frequency data.

    The face contours and bridge texture demonstrate the central audio mechanic: actual sound amplitude and frequency influence the image.

## Mechanic ownership

| Mechanic | Owner | File |
| --- | --- | --- |
| Perlin noise + randomness | Edwin Thomas | `mechanics/noise.js`: the shimmering colours, boat drift speed, the random seed, the random distractions (boat crash, bird, passer-by) and when they happen, the random length of the secret window, the random edge he floats to after a sting, and the jump-scare shake |
| Time-based | Qiaoyi Xin | `mechanics/time.js`: gentle frame-based sine waves, three-second hover, gradual deformation, attention, one-second look, shaking, leaving/recovery, and integration with the existing team event timers |
| User input | Yuqian Zhang | `mechanics/input.js`: the bee cursor, eye tracking and pupil size, the face hitbox, the sting and pimples, the jump-scare trigger |
| Audio | Chenxu (Cwan0294) | `mechanics/audio.js`: real sound tracks (opera, screaming, sting, bee, jumpscare, distraction cue, sub bass), distance-based mixing, bee panning and pitch, loudness (`p5.Amplitude`) and frequency (`p5.FFT`) analysis that drive the face contours, bridge grain and print effect |

Drawing: Qiaoyi Xin (Chloe) created the Figma redraw of the painting and recreated it in p5.js using VS Code.

## Time-based — Qiaoyi Xin

My time-based part is in `mechanics/time.js`, updated each frame by
`sketch.js`. It controls the background waves, hover distortion and
when the figure reacts.

### Background movement

`sin()` and `frameCount` create gentle, repeating waves in the sky, hills
and right shoreline. In the current main version, these waves are combined
with Perlin movement from the noise module. The lake surface skips this
idle movement but can bend when hovered over.

### Hover and figure reaction

While the figure is `watching`, holding the bee in one background area
makes a local distortion grow. A black-and-white image identifies the
interactive areas. Small mouse movements are allowed; moving more than
about 12 screen pixels restarts the hold timer.

The hold lasts 90 frames, about 3 seconds at the target of 30 FPS.
The figure then looks towards the distortion for 30 frames, about 1 second.
If the bee stays, he shakes for 24 frames before leaving. Nearby distortion
also pulls and tilts his body.

Random events can interrupt the initial hold, but new distractions do not
interrupt this sequence once the figure has noticed it.

### Recovery and team integration

Moving away before departure cancels the remaining reaction. The local
distortion recovers over 120 frames, about 4 seconds at 30 FPS. `lerp()`
smooths the distortion, attention and body movement, including the shake.

The input module draws the eyes, and `figurePoint()` keeps face detection
aligned as the body moves. The noise module supplies a random departure
direction. The figure uses the existing `stung` leave-and-return animation
in `canvas/screamer.js`, without adding a new sting or pimple.

`start()` and `isOpen()` retain the shared distraction window. Existing
`millis()` timers manage state durations, while `frameCount` controls the
hover sequence. Frame-based timing takes longer if the actual FPS drops.

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


`sketch.js` converts screen coordinates into the painting's 1050 × 1278 coordinate
system through `fitPainting()`. Input uses this shared `mouseInPainting` position
for distance and hit detection. `controls.distance` stores the distance to the face
centre for both the audio and noise mechanics; no separate SVG coordinate
conversion is used in this version.

### Clicks, state and restart

`isOnFace()` checks an elliptical face region. Background clicks do not count as
stings. After the first click starts audio, `sketch.js` forwards clicks to
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

- Yuqian Zhang (Dawn)'s eye design uses pale 20 × 45 eye shapes, dark tracking pupils and white highlights. ChatGPT assisted with its implementation and integration into `mechanics/input.js`, called by `canvas/screamer.js`, reusing the shared painting coordinates, distance and distraction state. Visual sizes were refined based on Dawn's feedback

- **Qiaoyi Xin — Drawing and time-based:** Codex helped develop my original drawing into the final p5.js version. ChatGPT helped with the background waves, hover timing and figure reactions, refined through my feedback. These build on course methods such as `frameCount`, `sin()` and `lerp()`. I will further study curve sampling, image-based interaction areas and coordinate conversion using the p5.js reference and small test sketches.

- **Edwin Thomas, Perlin noise + randomness:** I designed how the noise and randomness behave: background waves that speed up as the bee gets closer and calm down after a sting, the colour shimmer, and the random boat crash, bird and passer-by distractions. Claude (Anthropic) helped work out the coordinates and numbers, and write and comment the code in `mechanics/noise.js`, and helped with version control (merging the team's branches and resolving merge conflicts). I tuned and tested it and can explain how it works.

- Our Figma drawing was converted into p5.js shape code with help from AI.
- Claude (Anthropic) helped write, organise and comment the code in this repository: the mechanic classes, the screamer and jump scare, the window fitting, and the audio mixing. Each file says this in a comment at the top. We tested the code and can explain how each part works (see the comments).
- ChatGPT / Codex assisted with subsequent audio development
- The bee design (bee.svg) was made with help from ChatGPT; we redrew it in p5.js.
- ElevenLabs was used to generate the opera background (`CW_Opera`). The other six audio assets were created through original sound synthesis and recording using virtual instruments.
- Claude (Anthropic) and ChatGPT (OpenAI) assisted with translating the team's Figma drawing into p5.js, developing and integrating code, explaining implementation choices, refining interactions, and writing comments and documentation. The team directed the design decisions and selected and adjusted the implementations. Specific AI-assisted contributions are acknowledged in the relevant code comments.

## External references

- p5.js reference: https://p5js.org/reference/
- p5.sound (official p5.js sound add-on), used for `loadSound()`, `setVolume()` and `p5.Amplitude`: https://p5js.org/reference/p5.sound/

## Time mechanic course references

- Week 7 objects/classes: https://canvas.sydney.edu.au/courses/74653/modules/items/3241890
- Week 7 image exercises: https://canvas.sydney.edu.au/courses/74653/modules/items/3241891
- Week 11 frameCount, lerp and transforms: https://canvas.sydney.edu.au/courses/74653/modules/items/3241902
- frameCount: https://p5js.org/reference/p5/frameCount/
- Image pixel lookup: https://p5js.org/reference/p5.Image/get/
- Additional p5.js drawing method: https://p5js.org/reference/p5/bezierPoint/ — interpolates along a cubic curve; the time mechanic samples both axes before applying the local dent. This method is not claimed to be explicitly covered in the reviewed lessons.


-  Audio assets and credits

    The final audio assets replace the original placeholder tracks.

    The opera background was generated using ElevenLabs. All other sounds were originally designed, synthesised and recorded by the audio contributor (GitHub: Cwan0294), using Serum, Sub Zero Bass, Augmented VOICES and other VST instruments.

    | Asset name | Role | Source / production |
    | --- | --- | --- |
    | `CW_Bee` | Bee buzzing | Original synthesised sound |
    | `CW_bit` | Sting sound effect | Original synthesised sound |
    | `CW_Distrace` | Distraction cue | Original synthesised sound |
    | `CW_Jumpscare(2)` | Jump-scare sound effect | Original synthesised sound |
    | `CW_Opera` | Opera background | AI-generated audio created using ElevenLabs |
    | `CW_Screaming` | Screaming sound | Original synthesised sound |
    | `CW_Sub` | Low-frequency distraction layer | Original synthesised sound |

    Asset names are listed without file extensions.
