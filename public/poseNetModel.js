class PoseNetModel {
    constructor(p5Object, video){
        this.p = p5Object;
        this.model = ml5.poseNet(video,{
            detectionType:'single',
            outputStride: 32,
            maxPoseDetections: 1,
            
        }, 
        this.loadedDone.bind(this));
        this.finishedLoading = false;
        this.data = null;
        
    }

    loadedDone(){
        this.finishedLoading = true;
        console.log('Model Loaded!');
        this.startListening();
    }

    startListening(){
        this.model.on('pose', (results) => {
            this.data = results;
            console.log(results)

            
        })
    };

    getKeypoints(){
        
        if (this.data != null && this.data.length > 0){
            
            return this.data[0].pose.keypoints;
        }
    }

    drawKeypoints(){
        if (this.data != null && this.data.length > 0){
            const keypoints = this.data[0].pose.keypoints;
            for (let i = 0; i < keypoints.length; i++){
                this.p.noStroke();
                this.p.fill(255, 0, 0);
                this.p.ellipse(keypoints[i].position.x, keypoints[i].position.y, 15);
                
            }
        }
    }

    drawSkeleton(){
        if (this.data != null && this.data.length > 0){
            const skeleton = this.data[0].skeleton;
            for (let i = 0; i < skeleton.length; i++){
                let pt1 = skeleton[i][0].position;
                let pt2 = skeleton[i][1].position;

                this.p.stroke(255, 0, 0);
                this.p.strokeWeight(2);
                this.p.line(pt1.x, pt1.y, pt2.x, pt2.y);
            }
        }
    }



}