// ===== BRIDGE =====
// Draws the bridge: the walkway, its shadow, the orange posts and the long rails.
// The bridge shapes are from our Figma drawing of The Scream.
// AI help: see the AI acknowledgement in README.md.


// ----- draws the whole bridge -----
function drawBridge() {
  drawStillPart("bridgeWalkway", "#B06A55", [
    [-324, 501], [-227, 522],
    [819, 1403], [-88, 1598]
  ]);

  drawStillPart("bridgeWalkwayShadow", "#8C4E3B", [
    [-235, 546], [-122, 564],
    [708, 1278], [473, 1395]
  ]);

  // Parts: bridge.post1 to bridge.post4
  // each post is a list of 4 corners
  let posts = [
    [[37, 589], [51, 595], [51, 746], [37, 724]],
    [[116, 629], [135, 636], [135, 816], [116, 801]],
    [[238, 693], [278, 700], [278, 939], [238, 923]],
    [[768, 944], [842, 965], [842, 1364], [773, 1364]]
  ];

  for (let post of posts) {
    drawStillPart("bridgePost", "#F47730", post);
  }

  drawStillPart("bridgeUpperRail", "#FF812D", [
    [-186, 476], [1193, 1096],
    [1186, 1177], [-187, 485]
  ]);

  drawStillPart("bridgeUpperRailHighlight", "#F5C55C", [
    [-189, 465], [1195, 1075],
    [1189, 1156], [-190, 474]
  ]);

  drawStillPart("bridgeMiddleRail", "#FF812D", [
    [-191, 502], [1104, 1284],
    [1087, 1364], [-193, 511]
  ]);

  drawStillPart("bridgeLowerRail", "#FF812D", [
    [-237, 476], [906, 1482],
    [875, 1563], [-241, 485]
  ]);
}


// ===== where people stand on the bridge =====
// The bridge goes away from us towards the top left, so people further away look smaller.
// These two functions use the lines of the bridge to work out where and how big a person is.


// ----- how far down the screen the edge of the walkway is, at a point across the screen -----
// map() follows the straight edge of the walkway from (-227, 522) to (819, 1403)
function walkwayEdgeY(x) {
  return map(x, -227, 819, 522, 1403);
}


// ----- where a person's feet go: a little way onto the walkway, in front of the railing -----
function feetY(x) {
  return walkwayEdgeY(x) + personHeightAt(x) * 0.3;
}


// ----- how tall a person is at a point across the screen -----
// the top rail is at about chest height, so a person is a bit taller than the gap
// between the top rail and the walkway
function personHeightAt(x) {
  let topRailY = map(x, -186, 1193, 476, 1096);
  return (walkwayEdgeY(x) - topRailY) * 1.1;
}
