# The Scream, Disturbed

An interactive p5.js reinterpretation of Edvard Munch's *The Scream* (1893).

## Inspiration

Our project is based on Edvard Munch’s *The Scream*. The painting is associated with anxiety and the feeling of being overwhelmed. Munch described sensing a scream passing through nature, connecting the figure’s distress with the surrounding landscape.

This made us think about how a small but persistent disturbance can affect someone. We chose a bee because its buzzing and movement can keep drawing attention and become difficult to ignore.

In our version, the user controls this disturbance. The bee can approach the figure and distort the background. Changes in sound and movement build tension, gradually leading to the figure’s reaction.

## Interaction instructions

1. Click anywhere to start the sound (turn your volume up).
2. Move the bee (your mouse). Far away you hear opera; the closer it gets to his face, the louder the screech.
3. Move over the sky, hills, lake or right shoreline for an immediate small dent. Keep the bee within about 12 screen pixels for 90 frames (about 3 seconds at 30 FPS): the dent reaches its maximum and he notices it, looking toward it. Nearby distortion also pulls, tilts and stretches him. He looks for 30 frames (about 1 second). If the bee stays there, he shakes for 24 frames (about 0.8 seconds), then uses the existing leave-and-return animation. Moving away before he leaves cancels this sequence. Moving resets the wait; leaving the background lets the dent recover smoothly over 120 frames (about 4 seconds), without overshooting. The lake surface stays still by itself and only deforms under the bee. Random distractions and the existing face interactions still apply.
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
  https://www.figma.com/design/XZwEMs5rf4gHMpmKdajboV/coding?node-id=0-1&t=lf1MEMHmfwzAupfF-1
- **Perlin noise + randomness (Edwin):** `noise(x, y, time)` moves every point of the sky, hills and water up and down (added on top of the time mechanic's sine wave), so the whole background waves while the bridge and the screamer stay still. `noise()` also makes the sky and water colours shimmer lighter and darker, and `randomSeed()` / `noiseSeed()` give every visit its own pattern. `random()` picks which event happens and when; in the boat crash, `dist()` detects when two boats hit, and they rock with `rotate()`.
- **Time-based (Qiaoyi Xin):** The background moves gently using `sin()` and `frameCount`, while the lake stays still until hovered over. Holding the mouse in one area for about 3 seconds makes the distortion grow and catches the figure’s attention. He looks for 1 second, then shakes and leaves if the mouse stays there. Moving away before departure cancels the remaining reaction and lets the background recover smoothly. `lerp()` softens the changes, and the team’s existing leave-and-return animation is reused.
- **User input (Yuqian Zhang):** `InputControls` in `mechanics/input.js` handles the bee cursor, movement-based tilt, pupil tracking and dilation, face hit detection and sting input. It uses the shared painting coordinates and distraction timer. A p5.js `keyPressed()` event handles Space to restart. See the User input section below.
- **Audio** :(Chenxu Wang)Developed a bidirectional audiovisual interactive system combining spatialized dynamic mixing with real-time, audio-driven generative visuals—utilizing distance and behavioral states for sound design while mapping measured amplitude and FFT spectral energy directly to procedural face contours and bridge deformations.
## Team contributions

### Mechanic ownership

| Mechanic | Owner | File |
| --- | --- | --- |
| Perlin noise + randomness | Edwin Thomas | `mechanics/noise.js`: the shimmering colours, boat drift speed, the random seed, the random distractions (boat crash, bird, passer-by) and when they happen, the random length of the secret window, the random edge he floats to after a sting, and the jump-scare shake |
| Time-based | Qiaoyi Xin | `mechanics/time.js`: gentle frame-based sine waves, three-second hover, gradual deformation, attention, one-second look, shaking, leaving/recovery, and integration with the existing team event timers |
| User input | Yuqian Zhang | `mechanics/input.js`: the bee cursor and movement-based tilt, eye tracking and pupil size, the face hitbox, sting input and pimple records, the jump-scare trigger and Space restart |
| Audio | Chenxu Wang (Cwan0294) | `mechanics/audio.js`: real sound tracks (opera, screaming, sting, bee, jumpscare, distraction cue, sub bass), distance-based mixing, bee panning and pitch, loudness (`p5.Amplitude`) and frequency (`p5.FFT`) analysis that drive the face contours, bridge grain and print effect |

### Drawing

Drawing: Qiaoyi Xin created the Figma redraw of the painting, organising the sky, hills, lake, bridge and figure into separate parts. She recreated these shapes and curves in p5.js using VS Code, preserving the composition and colour palette. The drawing provides the visual base for the team’s animation and interaction mechanics.

### Time-based — Qiaoyi Xin

My part adds background movement and a timed reaction when the bee stays in one place. The code is in `mechanics/time.js`, and `sketch.js` updates it each frame.

#### Background movement

I used `sin()` and `frameCount` to make the background move continuously. This is combined with the noise module’s Perlin movement. The lake stays still by itself but can bend when hovered over.

#### Hover and figure reaction

While the figure is watching, keeping the bee in one background area makes the distortion grow. A black-and-white image marks the areas that can respond. Moving more than about 12 screen pixels restarts the timer.

After 90 frames, about 3 seconds at 30 FPS, the figure starts looking towards the distortion. He looks for 30 frames, then shakes for 24 frames before leaving. Nearby distortion also pulls and tilts his body.

Random events can interrupt the first part of the hold. Once he notices the distortion, the reaction continues unless the mouse moves away.

#### Recovery and team integration

Moving away before departure cancels the remaining reaction. The distortion returns to normal over 120 frames, about 4 seconds. I used `lerp()` to soften the distortion and the figure’s movement.

The input module draws the eyes. `figurePoint()` keeps face detection aligned when the figure moves. Departure uses a random direction from the noise module and the existing leave-and-return animation, without adding a sting or pimple.

The shared distraction and state timers still use `millis()`. My hover sequence uses `frameCount`, so it takes longer if the frame rate drops.

### User input — Yuqian Zhang

The input mechanic lets the user act as a bee and interact with the screamer.
The implementation is in `mechanics/input.js`.

#### Bee cursor and movement

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
The maximum tilt is reached at 4 screen pixels of horizontal movement per frame.

#### Eyes and distance

`drawTrackingEye()` draws pale 20 × 45 eye shapes with dark blue pupils and small
white highlights, keeping the original eye centres and head position. The pupils
follow the bee and grow as its distance from the face decreases. Their movement
range decreases as they grow, keeping them inside the eyes. During distraction,
they become small and look towards the random event instead.

While the figure is watching, the time mechanic can redirect his gaze towards
the background dent as his attention grows. Entering or leaving the `distracted`
state blends pupil position and size smoothly using per-eye memory and the
transition duration in `AUDIO_DISTRACTION_SETTINGS.eyeTransitionMs`.

`sketch.js` converts screen coordinates into the painting's 1050 × 1278 coordinate
system through `fitPainting()`. Input uses this shared `mouseInPainting` position
for distance and hit detection. `controls.distance` stores the distance to the face
centre for both the audio and noise mechanics; no separate SVG coordinate
conversion is used in this version.
`timer.figurePoint()` also compensates for the time mechanic's figure reaction
transform before distance, hit detection and normal gaze calculations.

#### Clicks, state and restart

`isOnFace()` checks an elliptical face region. Background clicks do not count as
stings. After the first click starts audio, `sketch.js` forwards clicks to
`controls.clicked()`. `canSting()` requires audio to have started, the state to be
`distracted`, `timer.isOpen()` to be true and the mouse to be inside the face.
The audio module also uses this shared check for the face highlight.
A face click while `watching` triggers `scare`;
touching the face while watching also triggers it once audio has started.

`sting()` records the sting position and timestamp, requests a random departure
edge from the noise module, plays the sting sound and changes the state to
`stung`. The figure's pimple drawing and departure animation remain in
`canvas/screamer.js`, while `mechanics/time.js` manages the distraction window
and state durations. Input does not create another distraction timer.
Only the eight most recent pimple records are retained.

Pressing **Space** invokes the p5.js `keyPressed()` callback and uses the browser's
`window.location.reload()` API to restart the entire experience. `return false`
prevents the default Space-key scrolling behaviour. Audio must be started again
with a click after the reload.

### Audio — Chenxu Wang

The audio mechanic combines interactive mixing with visuals driven by measured sound.

- **Distance-based mixing:** Opera and screech loops play together. Distance controls their relative volumes through `setVolume()`, with short fades to smooth changes and a minimum opera level to retain the musical background.
- **Bee spatial sound:** `pan()` moves the buzzing between left and right channels. During distraction, the bee becomes louder and receives small, smoothed playback-rate changes that vary its pitch.
- **State-based sound:** Distraction adds a looping cue and a low-frequency layer. Gain controls reduce competing sounds, then restore the mix as distraction ends. Sting and jump-scare sounds provide distinct action feedback.
- **Loudness analysis:** `p5.Amplitude` measures the overall mix. Separate Web Audio analyser branches measure individual sources without adding another audible playback path.
- **Scream contours:** A 1024-bin `p5.FFT` analyses the scream. Measured loudness and low, mid and high frequency energy shape five curved contours around the face. Smoothed responses and delayed samples carry changes through successive contours.
- **Bridge texture:** Measured opera loudness and frequency energy change the width and curvature of grain-like ribbons within the wooden rails and posts. Peaks in the distraction cue trigger travelling accents along the bridge.
- **Distraction guidance:** The face contours contract during distraction. Bass energy influences their breathing movement, while eligible hovering adds a visual highlight to guide the sting interaction.
- **Stereo print effect:** The same smoothed pan value used for the bee sound controls coloured edge impressions. This visual uses the audio control parameter, rather than measured waveform or frequency data.

The face contours and bridge texture demonstrate the central audio mechanic: actual sound amplitude and frequency influence the image.

## AI acknowledgement

- **Yuqian Zhang — User input:** ChatGPT / Codex assisted with developing, refining and integrating the user input mechanic, including the bee cursor and movement, eye tracking, face interactions and restart controls. AI also supported code explanations, comments and documentation. I directed the interaction design, reviewed and tested the implementation, and refined it through my feedback.

- - **Qiaoyi Xin — Drawing and time-based:** Codex (OpenAI) helped turn my Figma redraw into p5.js shapes. ChatGPT (OpenAI) helped write and revise the background waves, hover timing and figure reactions based on my design and feedback.The code uses `frameCount` to measure hover duration, `sin()` for waves and shaking, and `lerp()` for smooth transitions. An image mask selects interactive background areas. `bezierPoint()` samples curves for local bending, while `figurePoint()` keeps face detection aligned with the moving figure. These reactions connect to the team’s existing eye tracking and departure animation.

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


## Audio assets and credits

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
