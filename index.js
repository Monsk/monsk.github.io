// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];
let ready = false;
let blobStartLocation = {x: 0, y: 525};
let blobXSpeed = 0.5;
let canvasWidth = 800;
let canvasHeight = 600;
let blobsCaught = 0;
let blobsDodged = 0;
let availableBlobs = 0;

function setup() {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent("canvas-wrapper");

    drawingCanvas = createGraphics(width, height);

    background(102);

    video = createCapture(VIDEO);
    video.size(width, height);
    blobLocation = Object.assign({}, blobStartLocation);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(
    video,
    {
        // flipHorizontal: true,
        minConfidence: 0.5,
        maxPoseDetections: 1,
        scoreThreshold: 0.5,
        detectionType: "single",
    }, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
  select("#blobScore").html(blobsDodged);
  select("#maxBlobs").html(availableBlobs);
}

function modelReady() {
  ready = true;
}

function draw() {
    if (ready) {
        translate(video.width, 0);
        scale(-1,1);
        image(video, 0, 0, width, height);
    
        // We can call both functions to draw all keypoints and the skeletons
        // drawKeypoints();
        drawSkeleton();
        drawFloatingBlob()
        // isBlobCaught();
        isRightShinCollision();
        isLeftShinCollision();
    }    
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    const pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    const skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j += 1) {
      const partA = skeleton[j][0];
      const partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

function getRightWristPosition() {
    if (poses.length > 0){
        if (poses[0].pose.rightWrist.confidence > 0.5){
            return poses[0].pose.rightWrist;
        }
    }
}

function getLeftWristPosition() {
    if (poses.length > 0){
        if (poses[0].pose.leftWrist.confidence > 0.5){
            return poses[0].pose.leftWrist;
        }
    }
}

function getRightElbowPosition() {
  if (poses.length > 0){
      if (poses[0].pose.rightElbow.confidence > 0.5){
          return poses[0].pose.rightElbow;
      }
  }
}

function getRightAnklePosition() {
  if (poses.length > 0){
      if (poses[0].pose.rightAnkle.confidence > 0.5){
          return poses[0].pose.rightAnkle;
      }
  }
}

function getRightKneePosition() {
  if (poses.length > 0){
      if (poses[0].pose.rightKnee.confidence > 0.5){
          return poses[0].pose.rightKnee;
      }
  }
}

function getLeftAnklePosition() {
  if (poses.length > 0){
      if (poses[0].pose.leftAnkle.confidence > 0.5){
          return poses[0].pose.leftAnkle;
      }
  }
}

function getLeftKneePosition() {
  if (poses.length > 0){
      if (poses[0].pose.leftKnee.confidence > 0.5){
          return poses[0].pose.leftKnee;
      }
  }
}

function getBlobLocation() {
  previousBlobLocation = blobLocation;
  blobLocation.x += blobXSpeed;

  return blobLocation
}

function isRightShinCollision() {
  blobLocation = getBlobLocation();
  rightAnklePosition = getRightAnklePosition();
  rightKneePosition = getRightKneePosition();

  if (rightAnklePosition === undefined ||
      rightKneePosition === undefined){
        return false;
  }

  crossproduct = (blobLocation.y - rightAnklePosition.y) * (rightKneePosition.x - rightAnklePosition.x) - 
    (blobLocation.x - rightAnklePosition.x) * (rightKneePosition.y - rightAnklePosition.y);
  if (abs(crossproduct) > 1000){
    return false;
  }

  dotproduct = (blobLocation.x - rightAnklePosition.x) * (rightKneePosition.x - rightAnklePosition.x) + 
    (blobLocation.y - rightAnklePosition.y) * (rightKneePosition.y - rightAnklePosition.y);
  if (dotproduct < 0){
    return false;
  }

  limbLengthSquared = (rightKneePosition.x - rightAnklePosition.x) ** 2 + (rightKneePosition.y - rightAnklePosition.y)**2;
  if (dotproduct > limbLengthSquared){
    return false;
  }

  console.log('right collision');
  collisionDetected();
}

function isLeftShinCollision() {
  blobLocation = getBlobLocation();
  leftAnklePosition = getLeftAnklePosition();
  leftKneePosition = getLeftKneePosition();

  if (leftAnklePosition === undefined ||
      leftKneePosition === undefined){
        return false;
  }

  crossproduct = (blobLocation.y - leftAnklePosition.y) * (leftKneePosition.x - leftAnklePosition.x) - 
    (blobLocation.x - leftAnklePosition.x) * (leftKneePosition.y - leftAnklePosition.y);
  if (abs(crossproduct) > 1000){
    return false;
  }

  dotproduct = (blobLocation.x - leftAnklePosition.x) * (leftKneePosition.x - leftAnklePosition.x) + 
    (blobLocation.y - leftAnklePosition.y) * (leftKneePosition.y - leftAnklePosition.y);
  if (dotproduct < 0){
    return false;
  }

  limbLengthSquared = (leftKneePosition.x - leftAnklePosition.x) ** 2 + (leftKneePosition.y - leftAnklePosition.y)**2;
  if (dotproduct > limbLengthSquared){
    return false;
  }

  console.log('left collision');
  collisionDetected();
}

function drawFloatingBlob() {
    // previousBlobLocation = blobLocation;

    // blobLocation.x += blobXSpeed;
    // blobLocation.y += blobYSpeed;
    blobLocation = getBlobLocation()

    fill(255, 0, 0);
    noStroke();
    ellipse(blobLocation.x, blobLocation.y, 40, 40);

    blobOutOfBounds();
}

function collisionDetected() {
  select("#alert").html("You got smacked by a blob!");
  setTimeout(function(){ select("#alert").html(""); }, 1000);
  resetBlob();
}

function blobOutOfBounds() {
    if (blobLocation.x > canvasWidth || 
        blobLocation.y > canvasHeight || 
        blobLocation.x < 0 || 
        blobLocation.y < 0){
        blobsDodged += 1;
        select("#blobScore").html(blobsDodged);
        resetBlob();
    }
}

function resetBlob() {
    // blobLocation.x = canvasWidth * Math.random();
    // blobLocation.y = canvasHeight * Math.random();
    console.log(blobStartLocation);
    blobLocation = Object.assign({}, blobStartLocation);
    blobXSpeed += 0.2; 
    // blobXSpeed = 5 * (Math.random() - 0.5);
    // blobYSpeed = 5 * (Math.random() - 0.5);
    availableBlobs += 1;
    select("#maxBlobs").html(availableBlobs);
}

// function catchBlob() {
//     blobsCaught += 1;
//     select("#blobScore").html(blobsCaught);
//     select("#maxBlobs").html(availableBlobs);
//     select("#alert").html("You caught a blob!");
//     setTimeout(function(){ select("#alert").html(""); }, 1000);
//     resetBlob();
// }



// function isBlobCaught() {
//     rightWristPosition = getRightWristPosition();
//     leftWristPosition = getLeftWristPosition();
//     if (rightWristPosition && leftWristPosition) {
//         if ((abs(rightWristPosition.x - blobLocation.x) < 40 && abs(rightWristPosition.y - blobLocation.y) < 40) ||
//             (abs(leftWristPosition.x - blobLocation.x) < 40 && abs(leftWristPosition.y - blobLocation.y) < 40) ) {
//             catchBlob();
//         }
//     }
// }
