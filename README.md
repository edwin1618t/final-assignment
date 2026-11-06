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
3. Move over the sky, hills, lake or right shoreline for an immediate small dent. Keep the bee within about 12 screen pixels for 90 frames (about 3 seconds at 30 FPS): the dent reaches its maximum and he notices it, looking toward it. Nearby distortion also pulls, tilts and stretches him. He looks for 30 frames (about 1 second). If the bee stays there, he shakes for 24 frames (about 0.8 seconds), then uses the existing leave-and-return animation. Moving away before he leaves cancels this sequence. Moving resets the wait; leaving the background lets the dent recover smoothly over 120 frames (about 4 seconds), without overshooting. The lake surface stays still by itself and only deforms under the bee. Random distractions and the existing face interactions still apply.
4. Wait for something to distract him (a boat crash on the lake, a bird or a passer-by). His eyes turn to look at it. You then have a secret 5–10 seconds: click his face and the bee stings him. A pimple grows where you clicked, and he turns around and floats off to a random edge, then comes back.
5. Click his face at the wrong time and he jumps at you.

## How the code is organised

| Folder / file | What it does |
| --- | --- |
| `index.html` | loads p5.js, p5.sound and all the files below |
| `script.js` | the main sketch: `setup()`, `draw()`, fitting the painting to the window |
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
- **Perlin noise + randomness:** `noise()` makes the background colours shimmer lighter and darker, and `randomSeed()` / `noiseSeed()` give every visit its own pattern. `random()` picks which event happens and when; in the boat crash, `dist()` detects when two boats hit, and they rock with `rotate()`.
- **Time-based:** The default background uses Qiaoyi's original `sin()` rule: height 8, wavelength 700 and a 240-frame cycle (about 8 seconds at 30 FPS). It shifts the original vertices and cubic control points together, without noise displacement. The lake skips this idle sine wave but shares the stronger local hover dent (maximum depth 165 painting units, radius 300). The hover uses `frameCount`: 90 frames to notice the background disturbance and 120 frames to recover. Moving the mouse lowers the strength gradually instead of snapping it back. `lerp()` smooths the dent position, strength, attention and figure pull. The face hitbox follows the figure transform, including the shake. After noticing, a 30-frame look and a 24-frame shake lead into the existing leave-and-return state. Random distractions wait while he is noticing the hover. The existing `millis()` timers for distraction, floating away, returning and jump scares are retained so the team's input and character code keep working. At lower actual FPS, the frame-based intervals take longer in real time. A black-and-white image loaded with p5.js `loadImage()` and read with `get()` limits hover to the background. `bezierPoint()` samples the curves so the dent can bend their middles.
- **User input:** `mouseX`/`mouseY`, his face is the hitbox (an oval check), bounded dark pupils follow the bee and enlarge with proximity; during distraction they look at the event, `mousePressed()` for the click, `noCursor()` with our bee drawn in p5 (wings flutter with `sin()` and `rotate()`).
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

| Mechanic | Owner | What it does |
| --- | --- | --- |
| Perlin noise + randomness | [name] | `mechanics/noise.js`: the shimmering colours, boat drift speed, the random seed, the random distractions (boat crash, bird, passer-by) and when they happen, the random length of the secret window, the random edge he floats to after a sting, and the jump-scare shake |
| Time-based | Qiaoyi Xin | `mechanics/time.js`: gentle frame-based sine waves, three-second hover, gradual deformation, attention, one-second look, shaking, leaving/recovery, and integration with the existing team event timers |
| User input | [name] | `mechanics/input.js`: the bee cursor, eye tracking and pupil size, the face hitbox, the sting and pimples, the jump-scare trigger |
| Audio | [name] | `mechanics/audio.js`: opera/screech crossfade, sting sound, loudness meter (`p5.Amplitude`) and the frequency rings around his face (`p5.FFT`) |

Drawing: our team's Figma redraw of the painting.

## AI acknowledgement

- ChatGPT assisted Qiaoyi with adapting the three-second hover into `DistractionTimer`, preserving the team timer interfaces and connecting the background and eye drawing. The hover uses frame differences, a pixel mask, distance-based deformation and `lerp()`; the mask only selects interaction areas, while the painting is still drawn with p5.js shapes.

- Yuqian Zhang (Dawn)'s eye design uses pale 20 × 45 eye shapes, dark tracking pupils and white highlights. ChatGPT assisted with its implementation and integration into `mechanics/input.js`, called by `canvas/screamer.js`, reusing the shared painting coordinates, distance and distraction state. Visual sizes were refined based on Dawn's feedback.

- Our Figma drawing was converted into p5.js shape code with help from AI.
- Claude (Anthropic) helped write, organise and comment the code in this repository: the mechanic classes, the screamer and jump scare, the window fitting, and the audio mixing. Each file says this in a comment at the top. We tested the code and can explain how each part works (see the comments).
- ChatGPT / Codex assisted with subsequent audio development
- The bee design (bee.svg) was made with help from ChatGPT; we redrew it in p5.js.
- ElevenLabs was used to generate the opera background (`CW_Opera`). The other six audio assets were created through original sound synthesis and recording using virtual instruments.
## External references

- p5.js reference: https://p5js.org/reference/
- p5.sound (official p5.js sound add-on), used for `loadSound()`, `setVolume()` and `p5.Amplitude`: https://p5js.org/reference/p5.sound/
- `assets/sounds/opera-placeholder.mp3`, `screech-placeholder.mp3` and `sting-placeholder.mp3` are simple stand-in sounds made for this project. [Replace with your final tracks and credit their source here.]

## Time mechanic course references

- Week 7 objects/classes: https://canvas.sydney.edu.au/courses/74653/modules/items/3241890
- Week 7 image exercises: https://canvas.sydney.edu.au/courses/74653/modules/items/3241891
- Week 11 frameCount, lerp and transforms: https://canvas.sydney.edu.au/courses/74653/modules/items/3241902
- frameCount: https://p5js.org/reference/p5/frameCount/
- Image pixel lookup: https://p5js.org/reference/p5.Image/get/
- Additional p5.js drawing method: https://p5js.org/reference/p5/bezierPoint/ — interpolates along a cubic curve; the time mechanic samples both axes before applying the local dent. This method is not claimed to be explicitly covered in the reviewed lessons.

The team currently uses `script.js` as its main entry file. The brief calls the main entry `sketch.js`; confirm the final naming as a team before submission. This integration preserves the shared entry rather than renaming it independently.

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
