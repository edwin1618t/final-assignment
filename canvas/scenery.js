// ===== SCENERY =====
// Draws the background of the painting: the sky, the hills, the water and the shore.
// The shapes are from our Figma drawing of The Scream, turned into p5.js code with help from AI.
// Every shape is a list of points. Two numbers = a straight corner, six numbers = a curve.
// All numbers are in "painting units": the painting is 1050 wide and 1278 tall
// (script.js shrinks or grows it to fit the window).
// Parts drawn with drawWavyPart() slowly wave, using the noise in mechanics/noise.js.
// AI acknowledgement: this file was organised and commented with help from Claude (AI). See README.md.


// ===== SKY =====
// eight wavy bands of red, orange, blue and gold

function drawSky() {
  // the orange base stays still, so no gaps show at the top
  drawStillPart("skyOrangeBase", "#FF7028", [
    [-115, 0], [1115, 0],
    [1115, 550], [-115, 550]
  ]);

  drawWavyPart("skyUpperRedBand", "#EB3D1D", [
    [-115, 0], [1115, 0], [1115, 25],
    [915, 6, 825, 83, 579, 96],
    [422, 109, 273, -51, 30, 0],
    [-115, 36]
  ]);

  drawWavyPart("skyUpperOrangeRibbon", "#FF752A", [
    [-115, 36],
    [125, -42, 225, 7, 426, 75],
    [563, 131, 808, 65, 950, 0],
    [1115, 0], [1115, 24],
    [949, 34, 813, 148, 648, 175],
    [433, 197, 278, 62, 100, 80],
    [6, 82, -63, 104, -115, 120]
  ]);

  drawWavyPart("skyMiddleRedRibbon", "#F34A22", [
    [-115, 120],
    [41, 67, 137, 67, 236, 94],
    [387, 132, 508, 189, 648, 175],
    [813, 148, 949, 34, 1115, 24],
    [1115, 258],
    [897, 195, 781, 284, 598, 312],
    [404, 351, 309, 244, 141, 258],
    [-115, 319]
  ]);

  drawWavyPart("skyBlueRibbon", "#426194", [
    [-115, 120],
    [41, 67, 137, 67, 236, 94],
    [387, 132, 508, 189, 648, 175],
    [507, 224, 434, 183, 311, 153],
    [189, 119, 111, 155, 3, 162],
    [-47, 165, -91, 175, -115, 184]
  ]);

  drawWavyPart("skyAmberRibbon", "#FFA632", [
    [-115, 299],
    [40, 238, 125, 213, 246, 233],
    [389, 251, 448, 322, 599, 277],
    [780, 225, 918, 132, 1115, 212],
    [1115, 239],
    [922, 191, 805, 293, 626, 330],
    [439, 372, 383, 291, 217, 284],
    [94, 277, -16, 311, -115, 328]
  ]);

  drawWavyPart("skyLowerOrangeRibbon", "#FF6B29", [
    [-115, 328],
    [62, 294, 154, 265, 280, 295],
    [429, 325, 481, 368, 647, 325],
    [829, 275, 921, 201, 1115, 239],
    [1115, 352],
    [972, 306, 853, 335, 738, 375],
    [573, 430, 427, 434, 288, 393],
    [-115, 414]
  ]);

  drawWavyPart("skyGoldenHorizon", "#FFD375", [
    [-115, 450], [325, 400],
    [434, 421, 627, 405, 730, 371],
    [897, 312, 995, 322, 1115, 352],
    [1115, 418],
    [942, 353, 878, 379, 751, 423],
    [627, 468, 470, 447, 329, 420],
    [-115, 480]
  ]);
}

// ===== HILLS AND DEEP SEA =====

function drawMountains() {
  drawWavyPart("mountainsDistantHills", "#2C548D", [
    [0, 430],
    [105, 428, 165, 390, 255, 390],
    [371, 390, 432, 430, 565, 430],
    [720, 430, 834, 348, 1010, 336],
    [1136, 328, 1230, 365, 1230, 454],
    [1230, 1278], [0, 1278]
  ]);

  drawWavyPart("mountainsDeepSea", "#123157", [
    [0, 480],
    [120, 478, 193, 440, 280, 440],
    [393, 440, 470, 480, 599, 480],
    [756, 480, 882, 400, 1036, 387],
    [1150, 375, 1230, 413, 1230, 505],
    [1230, 1278], [0, 1278]
  ]);
}

// ===== LAKE, REFLECTIONS AND TWO SMALL BOATS =====

function drawLake() {
  drawStillPart("lakeBlueBand", "#2D609E", [
    [-314, 517],
    [105, 517, 523, 514, 874, 514],
    [898, 514, 916, 518, 916, 524],
    [916, 530, 898, 534, 874, 534],
    [777, 536, 694, 547, 606, 557],
    [475, 570, 504, 590, 601, 608],
    [804, 653, 618, 695, 420, 686],
    [249, 682, 141, 631, 11, 618],
    [-314, 557]
  ]);

  drawStillPart("lakeGoldReflection", "#FFD677", [
    [-289, 522],
    [88, 522, 465, 519, 782, 519],
    [803, 519, 820, 523, 820, 528],
    [820, 533, 803, 537, 782, 537],
    [694, 539, 620, 549, 540, 558],
    [422, 570, 448, 588, 536, 604],
    [719, 644, 551, 682, 373, 674],
    [219, 671, 121, 625, 4, 613],
    [-289, 558]
  ]);

  drawStillPart("lakeLightReflection", "#FCEEAA", [
    [-464, 520],
    [-136, 520, 192, 519, 467, 519],
    [485, 519, 500, 521, 500, 523],
    [500, 525, 485, 526, 467, 526],
    [391, 527, 326, 531, 257, 535],
    [154, 539, 177, 546, 253, 553],
    [412, 569, 266, 584, 111, 581],
    [-23, 579, -107, 561, -209, 556],
    [-464, 535]
  ]);

  // (the two little boats are drawn in mechanics/noise.js, so they can move)
}

// ===== RIGHT SHORELINE =====

function drawRightLake() {
  drawWavyPart("rightLakeTealShoreline", "#173F50", [
    [1105, 538],
    [1098, 630, 920, 662, 809, 759],
    [678, 872, 627, 983, 694, 1094],
    [764, 1209, 940, 1288, 1105, 1340]
  ]);

  drawWavyPart("rightLakeSurface", "#788875", [
    [1123, 529],
    [1074, 633, 857, 684, 717, 791],
    [545, 922, 487, 1038, 572, 1160],
    [669, 1300, 920, 1393, 1123, 1456]
  ]);

  drawWavyPart("rightLakeBlueEdge", "#2D6580", [
    [1119, 565],
    [1092, 648, 901, 691, 802, 777],
    [674, 888, 627, 992, 693, 1094],
    [753, 1188, 869, 1249, 968, 1288],
    [861, 1227, 778, 1169, 719, 1084],
    [651, 984, 698, 897, 823, 788],
    [924, 699, 1086, 658, 1119, 578]
  ]);

  drawWavyPart("rightLakeGreenCurrent", "#5A7D75", [
    [1105, 588],
    [1036, 685, 922, 721, 847, 813],
    [747, 934, 758, 1012, 823, 1109],
    [889, 1204, 1001, 1262, 1105, 1290],
    [1105, 1250],
    [1012, 1215, 919, 1151, 862, 1066],
    [801, 975, 805, 915, 884, 819],
    [952, 737, 1056, 690, 1105, 615]
  ]);

  drawWavyPart("rightLakeGoldReflection", "#C1AC78", [
    [1105, 631],
    [1042, 722, 968, 751, 919, 832],
    [857, 936, 874, 1029, 945, 1125],
    [991, 1187, 1052, 1230, 1105, 1250],
    [1105, 1204],
    [1062, 1174, 1017, 1138, 983, 1083],
    [928, 996, 922, 935, 966, 852],
    [1005, 781, 1066, 739, 1105, 683]
  ]);

  drawWavyPart("rightLakeBankHighlight", "#D3C29B", [
    [1074, 723],
    [1022, 811, 1000, 896, 1013, 988],
    [1024, 1063, 1045, 1113, 1074, 1163]
  ]);
}


// ===== SHARED DRAWING FUNCTIONS =====
// (used by scenery.js, bridge.js and screamer.js)
// Every part of the painting has a name (id), like "skyUpperRedBand",
// so it is easy to find each part in the code.


// ----- draws a part that stays still (the bridge and the screamer) -----
function drawStillPart(id, colour, points) {
  fill(colour);
  noStroke();
  drawPath(points, true, false);
}


// ----- draws a part whose edges wave up and down (the sky, hills and water) -----
function drawWavyPart(id, colour, points) {
  // shimmer() (in mechanics/noise.js) makes the colour slowly lighter and darker
  fill(noiseLayer.shimmer(colour, points[0][0], points[0][1]));
  noStroke();
  drawPath(points, true, true);
}


// ----- joins a list of points into one shape -----
// two numbers = a corner, six numbers = a curve
// wavy = true moves every point up and down a little with noise
function drawPath(points, closed, wavy) {
  // The time mechanic bends the sampled background; noise stays in noise.js.
  if (wavy) {
    timer.drawBackgroundPath(points, closed);
    return;
  }

  beginShape();

  for (let point of points) {
    // copy the numbers, moving them if the part is wavy (they come in pairs: x then y)
    let moved = [];
    for (let i = 0; i < point.length; i += 2) {
      let x = point[i];
      let y = point[i + 1];
      if (wavy) {
        y = y + noiseLayer.wobbleAt(x, y);
      }
      moved.push(x, y);
    }

    if (moved.length === 2) {
      vertex(moved[0], moved[1]);
    } else {
      bezierVertex(moved[0], moved[1], moved[2], moved[3], moved[4], moved[5]);
    }
  }

  if (closed) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}
