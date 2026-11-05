
/*
The Scream
IDEA9103 Creative Coding

Scene drawing and User Input integration.
*/

// Load User Input assets.
function preload() {
  preloadInputControls();
}

function setup() {
  let picture = createCanvas(1050, 1278, SVG);
  picture.parent("artwork");
  frameRate(30);

  setupInputControls();
}

function draw() {
  // Remove the previous SVG frame before drawing the next one.
  clear();
  background("#102C51");
  updateTimeBased();
  // ChatGPT assisted with updating the input data before drawing the eyes.
  updateInputControls();

  // Apply the time-based wave to the background outlines.
  waveEnabled = true;
  drawSky();
  drawMountains();

  // Keep the blue contours, lake, reflections and boats still.
  waveEnabled = false;
  drawBlueLines();
  drawLake();

  waveEnabled = true;
  drawRightLake();

  // Keep the bridge and figure stable.
  waveEnabled = false;
  drawBridge();
  drawFigure();

  // USER INPUT: Draw the bee on top of the artwork.
  drawBeeCursor();
}

// SECTION: sky

function drawSky() {
  // Part: sky.orangeBase
  drawShape("#FF7028", [
    [-115, 0], [1115, 0],
    [1115, 550], [-115, 550]
  ]);

  // Part: sky.upperRedBand
  drawShape("#EB3D1D", [
    [-115, 0], [1115, 0], [1115, 25],
    [915, 6, 825, 83, 579, 96],
    [422, 109, 273, -51, 30, 0],
    [-115, 36]
  ]);

  // Part: sky.upperOrangeRibbon
  drawShape("#FF752A", [
    [-115, 36],
    [125, -42, 225, 7, 426, 75],
    [563, 131, 808, 65, 950, 0],
    [1115, 0], [1115, 24],
    [949, 34, 813, 148, 648, 175],
    [433, 197, 278, 62, 100, 80],
    [6, 82, -63, 104, -115, 120]
  ]);

  // Part: sky.middleRedRibbon
  drawShape("#F34A22", [
    [-115, 120],
    [41, 67, 137, 67, 236, 94],
    [387, 132, 508, 189, 648, 175],
    [813, 148, 949, 34, 1115, 24],
    [1115, 258],
    [897, 195, 781, 284, 598, 312],
    [404, 351, 309, 244, 141, 258],
    [-115, 319]
  ]);

  // Part: sky.blueRibbon
  drawShape("#426194", [
    [-115, 120],
    [41, 67, 137, 67, 236, 94],
    [387, 132, 508, 189, 648, 175],
    [507, 224, 434, 183, 311, 153],
    [189, 119, 111, 155, 3, 162],
    [-47, 165, -91, 175, -115, 184]
  ]);

  // Part: sky.amberRibbon
  drawShape("#FFA632", [
    [-115, 299],
    [40, 238, 125, 213, 246, 233],
    [389, 251, 448, 322, 599, 277],
    [780, 225, 918, 132, 1115, 212],
    [1115, 239],
    [922, 191, 805, 293, 626, 330],
    [439, 372, 383, 291, 217, 284],
    [94, 277, -16, 311, -115, 328]
  ]);

  // Part: sky.lowerOrangeRibbon
  drawShape("#FF6B29", [
    [-115, 328],
    [62, 294, 154, 265, 280, 295],
    [429, 325, 481, 368, 647, 325],
    [829, 275, 921, 201, 1115, 239],
    [1115, 352],
    [972, 306, 853, 335, 738, 375],
    [573, 430, 427, 434, 288, 393],
    [-115, 414]
  ]);

  // Part: sky.goldenHorizon
  drawShape("#FFD375", [
    [-115, 450], [325, 400],
    [434, 421, 627, 405, 730, 371],
    [897, 312, 995, 322, 1115, 352],
    [1115, 418],
    [942, 353, 878, 379, 751, 423],
    [627, 468, 470, 447, 329, 420],
    [-115, 480]
  ]);
}

// SECTION: mountains

function drawMountains() {
  // Part: mountains.distantHills
  drawShape("#2C548D", [
    [0, 430],
    [105, 428, 165, 390, 255, 390],
    [371, 390, 432, 430, 565, 430],
    [720, 430, 834, 348, 1010, 336],
    [1136, 328, 1230, 365, 1230, 454],
    [1230, 1278], [0, 1278]
  ]);

  // Part: mountains.deepSea
  drawShape("#123157", [
    [0, 480],
    [120, 478, 193, 440, 280, 440],
    [393, 440, 470, 480, 599, 480],
    [756, 480, 882, 400, 1036, 387],
    [1150, 375, 1230, 413, 1230, 505],
    [1230, 1278], [0, 1278]
  ]);
}

// SECTION: blueLines

function drawBlueLines() {
  push();
  noFill();
  strokeCap(ROUND);

  // Parts: blueLines.contour1 to blueLines.contour5
  // i = 0 draws contour1; i = 4 draws contour5.
  for (let i = 0; i < 5; i++) {
    stroke(65, 116, 164, 199 - i * 26);
    strokeWeight(3.6 - i * 0.35);

    drawPath([
      [-30, 505 - i * 15],
      [
        260, 505 - i * 15,
        730, 502 - i * 15,
        990, 500 - i * 15
      ],
      [
        1070 + i * 10.5, 499 - i * 15,
        1100 + i * 10.5, 535 - i * 3.75,
        1020 + i * 12, 554 + i * 3.75
      ],
      [
        950 + i * 9.75, 568 + i * 4.5,
        835 + i * 9.75, 568 + i * 6,
        790 + i * 6.75, 585 + i * 7.5
      ],
      [
        726 + i * 7.5, 607 + i * 7.5,
        820 + i * 7.5, 625 + i * 10.5,
        858 + i * 7.5, 644 + i * 10.5
      ],
      [
        997 + i * 7.5, 706 + i * 15,
        739, 747 + i * 15,
        522, 724 + i * 15
      ],
      [
        330, 704 + i * 15,
        170, 663 + i * 15,
        -30, 623 + i * 15
      ]
    ], false);
  }

  pop();
}

// SECTION: lake

function drawLake() {
  // Part: lake.blueBand
  drawShape("#2D609E", [
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

  // Part: lake.goldReflection
  drawShape("#FFD677", [
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

  // Part: lake.lightReflection
  drawShape("#FCEEAA", [
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

  noStroke();
  fill("#3B2A2A");

  // Part: lake.boat1Hull
  rect(339, 567, 20, 3);

  // Part: lake.boat1Mast
  rect(348, 554, 2, 13);

  // Part: lake.boat2Hull
  rect(290, 563, 26, 3);

  // Part: lake.boat2Mast
  rect(301, 548, 2, 15);
}

// SECTION: rightLake

function drawRightLake() {
  // Part: rightLake.tealShoreline
  drawShape("#173F50", [
    [1105, 538],
    [1098, 630, 920, 662, 809, 759],
    [678, 872, 627, 983, 694, 1094],
    [764, 1209, 940, 1288, 1105, 1340]
  ]);

  // Part: rightLake.surface
  drawShape("#788875", [
    [1123, 529],
    [1074, 633, 857, 684, 717, 791],
    [545, 922, 487, 1038, 572, 1160],
    [669, 1300, 920, 1393, 1123, 1456]
  ]);

  // Part: rightLake.blueEdge
  drawShape("#2D6580", [
    [1119, 565],
    [1092, 648, 901, 691, 802, 777],
    [674, 888, 627, 992, 693, 1094],
    [753, 1188, 869, 1249, 968, 1288],
    [861, 1227, 778, 1169, 719, 1084],
    [651, 984, 698, 897, 823, 788],
    [924, 699, 1086, 658, 1119, 578]
  ]);

  // Part: rightLake.greenCurrent
  drawShape("#5A7D75", [
    [1105, 588],
    [1036, 685, 922, 721, 847, 813],
    [747, 934, 758, 1012, 823, 1109],
    [889, 1204, 1001, 1262, 1105, 1290],
    [1105, 1250],
    [1012, 1215, 919, 1151, 862, 1066],
    [801, 975, 805, 915, 884, 819],
    [952, 737, 1056, 690, 1105, 615]
  ]);

  // Part: rightLake.goldReflection
  drawShape("#C1AC78", [
    [1105, 631],
    [1042, 722, 968, 751, 919, 832],
    [857, 936, 874, 1029, 945, 1125],
    [991, 1187, 1052, 1230, 1105, 1250],
    [1105, 1204],
    [1062, 1174, 1017, 1138, 983, 1083],
    [928, 996, 922, 935, 966, 852],
    [1005, 781, 1066, 739, 1105, 683]
  ]);

  // Part: rightLake.bankHighlight
  drawShape("#D3C29B", [
    [1074, 723],
    [1022, 811, 1000, 896, 1013, 988],
    [1024, 1063, 1045, 1113, 1074, 1163]
  ]);
}

// SECTION: bridge

function drawBridge() {
  // Part: bridge.walkway
  drawShape("#B06A55", [
    [-324, 501], [-227, 522],
    [819, 1403], [-88, 1598]
  ]);

  // Part: bridge.walkwayShadow
  drawShape("#8C4E3B", [
    [-235, 546], [-122, 564],
    [708, 1278], [473, 1395]
  ]);

  // Parts: bridge.post1 to bridge.post4
  let posts = [
    [[37, 589], [51, 595], [51, 746], [37, 724]],
    [[116, 629], [135, 636], [135, 816], [116, 801]],
    [[238, 693], [278, 700], [278, 939], [238, 923]],
    [[768, 944], [842, 965], [842, 1364], [773, 1364]]
  ];

  for (let post of posts) {
    drawShape("#F47730", post);
  }

  // Part: bridge.upperRail
  drawShape("#FF812D", [
    [-186, 476], [1193, 1096],
    [1186, 1177], [-187, 485]
  ]);

  // Part: bridge.upperRailHighlight
  drawShape("#F5C55C", [
    [-189, 465], [1195, 1075],
    [1189, 1156], [-190, 474]
  ]);

  // Part: bridge.middleRail
  drawShape("#FF812D", [
    [-191, 502], [1104, 1284],
    [1087, 1364], [-193, 511]
  ]);

  // Part: bridge.lowerRail
  drawShape("#FF812D", [
    [-237, 476], [906, 1482],
    [875, 1563], [-241, 485]
  ]);
}

// SECTION: figure

function drawFigure() {
  // Part: figure.silhouette
  drawShape("#10243C", [
    [381, 821],
    [346, 783, 342, 727, 359, 674],
    [374, 617, 423, 589, 474, 592],
    [536, 586, 574, 632, 582, 691],
    [598, 742, 578, 791, 568, 824],
    [590, 862, 595, 899, 593, 960],
    [595, 1039, 573, 1093, 543, 1140],
    [525, 1182, 518, 1245, 521, 1278],
    [293, 1278],
    [300, 1221, 316, 1165, 321, 1136],
    [328, 1112, 304, 1096, 304, 1043],
    [299, 990, 313, 920, 331, 866],
    [345, 833, 364, 826, 381, 821]
  ]);

  // Part: figure.leftFold
  drawShape("#405E98", [
    [388, 914],
    [372, 979, 331, 1040, 331, 1080],
    [329, 1111, 339, 1134, 333, 1170],
    [325, 1215, 318, 1244, 311, 1270],
    [322, 1211, 348, 1163, 348, 1118],
    [346, 1070, 365, 1000, 388, 914]
  ]);

  // Part: figure.rightFold
  drawShape("#405D94", [
    [531, 940],
    [539, 1017, 512, 1093, 490, 1155],
    [469, 1215, 463, 1244, 458, 1268],
    [460, 1186, 499, 1101, 515, 1041],
    [524, 1008, 529, 972, 531, 940]
  ]);

  // Part: figure.face
  drawShape("#FFD580", [
    [479, 620],
    [433, 617, 405, 655, 403, 699],
    [397, 744, 417, 771, 434, 802],
    [449, 828, 453, 879, 478, 880],
    [505, 887, 511, 827, 524, 799],
    [541, 760, 554, 718, 548, 684],
    [544, 645, 514, 620, 479, 620]
  ]);

  noStroke();
  fill("#0B2D4E");

  // Part: figure.leftEye
  // ChatGPT assisted with connecting both eyes to drawTrackingEye().
  drawTrackingEye(441, 721);

  // Part: figure.rightEye
  drawTrackingEye(508, 715);

  // Part: figure.mouth
  ellipse(481, 808, 34, 81);

  // Part: figure.leftHand
  drawShape("#FFD580", [
    [389, 696],
    [378, 680, 365, 722, 369, 754],
    [371, 789, 399, 815, 403, 845],
    [406, 872, 389, 900, 396, 911],
    [412, 932, 427, 895, 431, 869],
    [439, 827, 420, 804, 406, 781],
    [390, 751, 396, 711, 389, 696]
  ]);

  // Part: figure.rightHand
  drawShape("#FFD580", [
    [562, 695],
    [573, 685, 580, 727, 576, 755],
    [572, 786, 558, 812, 554, 839],
    [551, 874, 562, 900, 565, 917],
    [569, 941, 547, 945, 538, 922],
    [528, 897, 521, 862, 523, 838],
    [524, 805, 544, 777, 551, 746],
    [557, 725, 554, 704, 562, 695]
  ]);
}

// SHARED DRAWING FUNCTIONS

function drawShape(colour, points) {
  fill(colour);
  noStroke();
  drawPath(points, true);
}

// ChatGPT assisted with connecting the time-based wave to these outlines.
function drawPath(points, closed) {
  beginShape();

  for (let point of points) {
    if (point.length === 2) {
      vertex(point[0], waveY(point[0], point[1]));
    } else {
      // Apply the same wave to both control points and the end point.
      bezierVertex(
        point[0], waveY(point[0], point[1]),
        point[2], waveY(point[2], point[3]),
        point[4], waveY(point[4], point[5])
      );
    }
  }

  if (closed) {
    endShape(CLOSE);
  } else {
    endShape();
  }
}

function windowResized() {
  // CSS scales the SVG while its drawing coordinates stay unchanged.
  redraw();
}

function keyPressed() {
  if (key === "s" || key === "S") {
    save("the-scream.svg");
  }
}
