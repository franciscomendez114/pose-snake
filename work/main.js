var cameraEle = document.getElementById('imageContainer');
var gameContainer = document.getElementById('gameContainer');
var addDataBtn = document.querySelector('.addDataBtn');
var resetDataBtn = document.querySelector('.resetBtn');
var loadingBarInner = document.querySelector('.training-rect');
var takenImagesEle = document.getElementById("takenImages");
var instructionImg = document.querySelector('.inst-img');
var instructionsText = document.querySelector('.instructions');
var continueBtn = document.querySelector('.continueBtn');
var trainingBtn = document.querySelector('.trainBtn');
var barText = document.querySelector('.bar-text');
var startButton = document.querySelector('.startButton');
var restartGameBtn = document.querySelector('.restartBtn');
var images = {
    "down": './images/arrowDown.png',
    "left": './images/leftArrow.png',
    "up": './images/arrowUp.png',
    "right": './images/rightArrow.png',
    "finished": './images/checkMark.png'
}
var dataGatheringType = "down";
var countDownActive = null; // 

var modelTrained = false;

var data = []; 
var prediction = null;

var bar;
resetProgressBar();

function resetProgressBar(){
    document.querySelector('.progressBar').innerHTML = '';
    bar = new ProgressBar.Line(document.querySelector('.progressBar'), {
        strokeWidth: 4,
        easing: 'easeInOut',
        duration: 10000,
        color: '#FFEA82',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
        from: {color: '#FFEA82'},
        to: {color: '#ED6A5A'},
        step: (state, bar) => {
          bar.path.setAttribute('stroke', state.color);
        }
      });
}


const ImageCanvas = ( p ) => {
    var capture;
    var poseNet;
    var poses = [];
    let nn;
    p.setup = function(){
        p.createCanvas(640, 480);

        p.cameraInit();
        p.poseNetInit();
        continueBtn.addEventListener('click', () => {
            console.log(dataGatheringType);
            if (dataGatheringType==="down"){
                instructionImg.setAttribute('src', images["left"]);
                dataGatheringType = "left";
                addDataBtn.classList.remove('hide');
                resetDataBtn.classList.add('hide');
                continueBtn.classList.add('hide');
                resetProgressBar();
                takenImagesEle.innerHTML = 0
            }else if (dataGatheringType==="left"){
                /// data finished collecting
                console.log('up');
                instructionImg.setAttribute('src', images["up"]);
                dataGatheringType = "up";
                addDataBtn.classList.remove('hide');
                resetDataBtn.classList.add('hide');
                continueBtn.classList.add('hide');
                resetProgressBar();
                takenImagesEle.innerHTML = 0;

            }else if (dataGatheringType==="up"){
                instructionImg.setAttribute('src', images["right"]);
                dataGatheringType = "right";
                addDataBtn.classList.remove('hide');
                resetDataBtn.classList.add('hide');
                continueBtn.classList.add('hide');
                resetProgressBar();
                takenImagesEle.innerHTML = 0;
            }
            else if (dataGatheringType === 'right'){
                instructionImg.setAttribute('src', images["finished"]);
                addDataBtn.classList.add('hide');
                resetDataBtn.classList.add('hide');
                continueBtn.classList.add('hide');
                trainingBtn.classList.remove('hide');
                instructionsText.innerHTML = "Data Collection Completed! Press 'Train Model' to continue..."
            }
        });
        addDataBtn.addEventListener('click', () => {
            let int = null;
            countDownActive = 5;

            int = setInterval(() => {
                if (countDownActive === 0){
                    clearInterval(int);
                    bar.animate(1);
                    let interval = null
                    interval = setInterval(()=>{
                        if (Number(takenImagesEle.innerHTML) < 100){
                            takenImagesEle.innerHTML = Number(takenImagesEle.innerHTML) + 1; 
                            if (poses.length > 0){
                                const keypoints = poses[0].pose.keypoints;
                                let tempData = [];
                
                                for (let keypoint of keypoints){
                                    if (keypoint.score > 0.6){
                                        tempData.push(keypoint.position.x/640);
                                        tempData.push(keypoint.position.y/480);
                                    }
                                    else {
                                        tempData.push(0)
                                        tempData.push(0);
                                    }
                                }
                                data.push({data:tempData, label: dataGatheringType});
                            }
                        }else {
                            clearInterval(interval);
                            addDataBtn.classList.add('hide');
                            resetDataBtn.classList.remove('hide');
                            continueBtn.classList.remove('hide'); 
                        };
                    }, 100);
                }else {
                    if (!countDownActive) countDownActive = 5;
                    else countDownActive --;
                }
            }, 1000)

        });

        resetDataBtn.addEventListener('click', () => {
            data[dataGatheringType] = [];
            addDataBtn.classList.remove('hide');
            resetDataBtn.classList.add('hide');
            continueBtn.classList.add('hide');
            resetProgressBar();
            takenImagesEle.innerHTML = 0;
        })

        trainingBtn.addEventListener('click', async () => {
            instructionImg.classList.add('hide');
            instructionsText.classList.add('hide');
            document.querySelector('.progressBar').classList.add('hide');
            trainingBtn.classList.add('hide');
            barText.classList.add('hide');

            //create model
            const model = ml5.neuralNetwork({
                task: 'classification',
                debug: true
            });

            //add data
            data.forEach(x => {
                model.addData(x.data, [x.label]);
            });
            
            //train model
            const trainingOptions = {
                epochs: 50,
                batchSize: 5,
                learningRate: 0.15
            }

            function finishedTraining (){
                console.log(`Training Finished!`);
                nn = model;
                modelTrained = true;
                startButton.classList.remove('hide');
                setTimeout(() => {
                    
                    
                }, 1000)
                
            }

            model.train(trainingOptions, finishedTraining);
        });

        startButton.addEventListener('click', () => {
            startButton.classList.add('hide');
            gameContainer.classList.remove('hide');
            new p5(GameCanvas, 'gameContainer');
            instructionsText.classList.remove('hide');
            instructionsText.innerHTML = `Prediction: ${prediction.label}`;

        })

    }

    p.draw = function(){
        p.background(221);
        p.image(capture, 0, 0, p.width, p.width * capture.height / capture.width);
        // Flip the image horizontally
        p.drawKeypoints();
        p.drawSkeleton();

        if (countDownActive){
            p.push();
            p.stroke(255);
            p.strokeWeight(3);
            p.fill(50, 50, 50, 150);
            p.circle(p.width/2, p.height/2, 150);
            p.fill(255);
            p.noStroke();
            p.textSize(80);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(String(countDownActive),
                p.width/2, p.height/2);
            p.pop();
        }
        if (prediction){
            instructionsText.innerHTML = `Prediction: ${prediction.label}`
        }

        if (modelTrained){
            if (poses.length > 0){
                const keypoints = poses[0].pose.keypoints;
                let tempData = [];

                for (let keypoint of keypoints){
                    if (keypoint.score > 0.6){
                        tempData.push(keypoint.position.x/640);
                        tempData.push(keypoint.position.y/480);
                    }else {
                        tempData.push(0);
                        tempData.push(0);
                    };
                };

                nn.classify(tempData, (err, res) => {
                    prediction = res[0];
                });
            };
        };
        
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
            if (keypoint.score > 0.6) {
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

const GameCanvas = ( p ) => {
    var game;
    var gameActive;


    p.setup = function(){
        p.createCanvas(500, 500);
        game = new SnakeGame(p);
        gameActive = true;
        restartGameBtn.classList.remove('hide');
        restartGameBtn.addEventListener('click', () => game.restart());
    }

    p.draw = function(){
        if (gameActive){
            p.background(87, 219, 83);
            if (prediction.label === "up"){
                game.snake.goUp();
            }else if (prediction.label === "down"){
                game.snake.goDown();
            }else if (prediction.label === "right"){
                game.snake.goRight();
            }else if (prediction.label === "left"){
                game.snake.goLeft();
            }
        }else {
            p.background(221);
        }
        game.display();
        game.update();
        
        
    }

   

   
    
};

let canvas1 = new p5(ImageCanvas, 'imageContainer');





