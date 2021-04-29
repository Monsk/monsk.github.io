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
let blobLocation = {x: 0, y: 0};
let blobXSpeed = 1;
let blobYSpeed = 1;
let canvasWidth = 800;
let canvasHeight = 600;
let blobsCaught = 0;
let availableBlobs = 0;

function setup() {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent("canvas-wrapper");

    drawingCanvas = createGraphics(width, height);

    background(102);

    video = createCapture(VIDEO);
    video.size(width, height);

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
  select("#blobScore").html(blobsCaught);
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
        // drawSkeleton();
        drawFloatingBlob()
        isBlobCaught();
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

function drawFloatingBlob() {
    previousBlobLocation = blobLocation;

    blobLocation.x += blobXSpeed;
    blobLocation.y += blobYSpeed;

    fill(255, 0, 0);
    noStroke();
    ellipse(blobLocation.x, blobLocation.y, 40, 40);

    blobOutOfBounds();
}

function blobOutOfBounds() {
    if (blobLocation.x > canvasWidth || 
        blobLocation.y > canvasHeight || 
        blobLocation.x < 0 || 
        blobLocation.y < 0){
        resetBlob();
    }
}

function resetBlob() {
    blobLocation.x = canvasWidth * Math.random();
    blobLocation.y = canvasHeight * Math.random();
    blobXSpeed = 5 * (Math.random() - 0.5);
    blobYSpeed = 5 * (Math.random() - 0.5);
    availableBlobs += 1;
    select("#maxBlobs").html(availableBlobs);
}

function catchBlob() {
    blobsCaught += 1;
    select("#blobScore").html(blobsCaught);
    select("#maxBlobs").html(availableBlobs);
    select("#alert").html("You caught a blob!");
    setTimeout(function(){ select("#alert").html(""); }, 1000);
    resetBlob();
}

function isBlobCaught() {
    rightWristPosition = getRightWristPosition();
    leftWristPosition = getLeftWristPosition();
    if (rightWristPosition && leftWristPosition) {
        if ((abs(rightWristPosition.x - blobLocation.x) < 40 && abs(rightWristPosition.y - blobLocation.y) < 40) ||
            (abs(leftWristPosition.x - blobLocation.x) < 40 && abs(leftWristPosition.y - blobLocation.y) < 40) ) {
            catchBlob();
        }
    }
}
