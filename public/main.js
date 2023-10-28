const cameraEle = document.getElementById('imageContainer');
const gameContainer = document.getElementById('gameContainer');

const ImageCanvas = ( p ) => {
    var capture;
    var poseNet;
    var poses = [];

    p.setup = function(){
        p.createCanvas(640, 480);

        p.cameraInit();
        p.poseNetInit();

    }

    p.draw = function(){
        p.background(221);
        p.image(capture, 0, 0, p.width, p.width * capture.height / capture.width);
        p.drawKeypoints();
        p.drawSkeleton();
        
    }

    p.poseNetInit = function(){
        poseNet = ml5.poseNet(capture, {
            detectionType: 'single'
        }, () => console.log('modelReady'));
        poseNet.on('pose', function(results) {
            poses = results;
        });
    }

    p.cameraInit = function(){
        capture = p.createCapture(p.VIDEO);
        capture.hide();
    }
    p.drawKeypoints = function() {
        // Loop through all the poses detected
        for (let i = 0; i < poses.length; i++) {
          // For each pose detected, loop through all the keypoints
          let pose = poses[i].pose;
          for (let j = 0; j < pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            let keypoint = pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.2) {
              p.fill(255, 0, 0);
              p.noStroke();
              p.ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
            }
          }
        }
      }
      // A function to draw the skeletons
    p.drawSkeleton = function() {
        // Loop through all the skeletons detected
        for (let i = 0; i < poses.length; i++) {
          let skeleton = poses[i].skeleton;
          // For every skeleton, loop through all body connections
          for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0];
            let partB = skeleton[j][1];
            p.stroke(255, 0, 0);
            p.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
          }
        }
      }
};
3
const GameCanvas = ( p ) => {
    var game;
    var gameActive;

    p.setup = function(){
        p.createCanvas(500, 500);
        game = new SnakeGame(p);
        gameActive = true;
    }

    p.draw = function(){
        if (gameActive){
            p.background(87, 219, 83);
        }else {
            p.background(221);
        }
        game.display();
        game.update();
        
    }

    p.keyPressed = function(){
        if (gameActive){
            if (p.key == "ArrowUp"){
                game.snake.goUp();
            }else if (p.key == "ArrowDown"){
                game.snake.goDown();
            }else if (p.key == "ArrowRight"){
                game.snake.goRight();
            }else if (p.key == "ArrowLeft"){
                game.snake.goLeft();
            }
        }
    }

   
    
};




let canvas1 = new p5(ImageCanvas, 'imageContainer');
let canvas2 = new p5(GameCanvas, 'gameContainer');



