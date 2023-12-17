class Food {
    constructor(x, y, cellSize, p5Object){
        this.p = p5Object;
        this.cellSize = cellSize;
        this.pos = this.p.createVector(x, y);

    }

    show(){
        this.p.fill(255, 0, 0);
        this.p.noStroke();
        this.p.ellipse(this.pos.x + this.cellSize/2, this.pos.y + this.cellSize/2, this.cellSize-5);
    }

    changeLocation(){
        let randX = Math.floor(this.p.random(19))*this.cellSize;
        let randY = Math.floor(this.p.random(19))*this.cellSize;
        this.pos = this.p.createVector(randX, randY);
    }

}

class Snake {
    constructor(x, y, cellSize, p5Object){
        this.body = [];
        this.cellSize = cellSize;
        this.p = p5Object;
        //add initial block amout
        const head = this.p.createVector(x, y);
        const body = this.p.createVector(x + this.cellSize, y);
        const tail = this.p.createVector(x + 2*this.cellSize, y);
        this.body.push(head);
        this.body.push(body);
        this.body.push(tail);
        


        this.directions = {
            "up": this.p.createVector(0, -this.cellSize),
            "down": this.p.createVector(0, this.cellSize),
            "right": this.p.createVector(this.cellSize, 0),
            "left": this.p.createVector(-this.cellSize, 0),
        };

        this.vel = this.directions["left"];
    }

    show(images){
        this.p.fill(0, 255, 0);
        this.p.stroke(0);

        this.activateSpriteMechanics(images);

    }

    activateSpriteMechanics(images){
        for (let i = 0; i < this.body.length; i++){
            const block = this.body[i];
            if (i == 0){
                let img = images["snake_head"];
                // NOTE: head is pointing down automatically
                if (this.vel.x == this.cellSize){ // if going right
                    this.p.push();
                    this.p.translate(block.x + this.cellSize/2, block.y + this.cellSize/2);
                    this.p.rotate(-this.p.PI/2);
                    this.p.image(img, -this.cellSize/2, -this.cellSize/2, this.cellSize, this.cellSize);
                    this.p.pop();
                }else if (this.vel.x == -this.cellSize){ // if going left
                    this.p.push();
                    this.p.translate(block.x + this.cellSize/2, block.y + this.cellSize/2);
                    this.p.rotate(this.p.PI/2);
                    this.p.image(img, -this.cellSize/2, -this.cellSize/2, this.cellSize, this.cellSize);
                    this.p.pop();
                }else if (this.vel.y == this.cellSize){ // if going down
                    this.p.image(img, block.x, block.y, this.cellSize, this.cellSize);
                }else if (this.vel.y == -this.cellSize){ // if going up
                    this.p.push();
                    this.p.translate(block.x + this.cellSize/2, block.y + this.cellSize/2);
                    this.p.rotate(this.p.PI);
                    this.p.image(img, -this.cellSize/2, -this.cellSize/2, this.cellSize, this.cellSize);
                    this.p.pop();
                }
            
            }else if (i == this.body.length - 1) { // tail mechanics
                // NOTE: Tail Faces Up automatically
                let img = images["snake_tail"];
                let prevBlock = this.body[this.body.length - 2];
                let curblock = this.body[this.body.length-1];
                if (prevBlock.x < curblock.x){
                    //turn image to left
                    this.p.push();
                    this.p.translate(curblock.x + this.cellSize/2, curblock.y + this.cellSize/2);
                    this.p.rotate(-this.p.PI/2);
                    this.p.image(img, -this.cellSize/2, -this.cellSize/2, this.cellSize, this.cellSize);
                    this.p.pop();
                }else if (prevBlock.x > curblock.x){
                    //turn image to right
                    this.p.push();
                    this.p.translate(curblock.x + this.cellSize/2, curblock.y + this.cellSize/2);
                    this.p.rotate(this.p.PI/2);
                    this.p.image(img, -this.cellSize/2, -this.cellSize/2, this.cellSize, this.cellSize);
                    this.p.pop();
                }else if (prevBlock.y < curblock.y){
                    //keep durrent image
                    this.p.image(img, curblock.x, curblock.y, this.cellSize, this.cellSize);
                }else if (prevBlock.y > curblock.y){
                    // turn image to face down
                    this.p.push();
                    this.p.translate(curblock.x + this.cellSize/2, curblock.y + this.cellSize/2);
                    this.p.rotate(this.p.PI);
                    this.p.image(img, -this.cellSize/2, -this.cellSize/2, this.cellSize, this.cellSize);
                    this.p.pop();
                }
            }else {
                const curBlock = this.body[i];
                const prevBlock = this.body[i - 1];
                const nextBlock = this.body[i + 1];
                const scale = this.cellSize-7;
                if (prevBlock.x < curBlock.x){
                    //left
                    if (nextBlock.y < curBlock.y){
                        this.p.image(images["snake_right-up"], curBlock.x-1, curBlock.y-1, scale, scale);
                    }else if (nextBlock.y > curBlock.y){
                        this.p.image(images["snake_up-left"], curBlock.x, curBlock.y+7, scale, scale);
                    }else {
                        this.p.push();
                        this.p.translate(curBlock.x + this.cellSize/2, curBlock.y + this.cellSize/2);
                        this.p.rotate(-this.p.PI/2);
                        this.p.image(images["snake_body"], -this.cellSize/2, -this.cellSize/2, this.cellSize, this.cellSize);
                        this.p.pop();
                    }
                }else if (prevBlock.x > curBlock.x){
                    //right
                    if (nextBlock.y > curBlock.y){
                        this.p.image(images["snake_up-right"], curBlock.x + 7, curBlock.y+7, scale, scale);
                    }else if (nextBlock.y < curBlock.y){
                        this.p.image(images["snake_down-right"], curBlock.x+7, curBlock.y, scale, scale);
                    }
                    else {
                        this.p.push();
                        this.p.translate(curBlock.x + this.cellSize/2, curBlock.y + this.cellSize/2);
                        this.p.rotate(this.p.PI/2);
                        this.p.image(images["snake_body"], -this.cellSize/2, -this.cellSize/2, this.cellSize, this.cellSize);
                        this.p.pop();
                    }
                    
                }else if (prevBlock.y < curBlock.y){
                    // up
                    if (nextBlock.x < curBlock.x){
                        this.p.image(images["snake_right-up"], curBlock.x-1, curBlock.y-1, scale, scale);
                    }else if (nextBlock.x == curBlock.x){
                        this.p.image(images["snake_body"], curBlock.x, curBlock.y, this.cellSize, this.cellSize)
                    }else {
                        this.p.image(images["snake_down-right"], curBlock.x+7, curBlock.y, scale, scale);
                    }
                }
                else if (prevBlock.y > curBlock.y){
                    //down
                    if (nextBlock.x < curBlock.x){
                        this.p.image(images["snake_up-left"], curBlock.x, curBlock.y+7, scale, scale);
                    }else if (nextBlock.x == curBlock.x){
                        this.p.image(images["snake_body"], curBlock.x, curBlock.y, this.cellSize, this.cellSize)
                    }else {
                        this.p.image(images["snake_up-right"], curBlock.x+7, curBlock.y+7, scale, scale);
                    }
                }
                
            }
          
        }
    }

    update(){
        if (this.p.frameCount % 20 == 0){
            this.moveSnake();
        }
    }

    moveSnake(){
        //copy body array
        const body_copy = [...this.body];

        //remove last element
        body_copy.pop();

        // add block to beginning going in dir of vel
        const pos = p5.Vector.add(this.vel, body_copy[0]);
        body_copy.unshift(pos);

        // mutate the actual body of snake
        this.body = body_copy;

    }

    goUp(){
        if (this.vel != this.directions["down"]){
            this.vel = this.directions["up"];
        }
        
    }

    goDown(){
        if (this.vel != this.directions["up"]){
            this.vel = this.directions["down"];
        }
    }

    goRight(){
        if (this.vel != this.directions["left"]){
            this.vel = this.directions["right"];
        }
        
    }

    goLeft(){
        if (this.vel != this.directions["right"]){
            this.vel = this.directions["left"];
        }
    }

    ateFruit(fruit){
        if (fruit.pos.x == this.body[0].x && fruit.pos.y == this.body[0].y){
            fruit.changeLocation();
            this.body.push(p5.Vector.sub(this.body[this.body.length-1], this.vel));

        }
    }


}

class SnakeGame {
    constructor(p5Object){
        this.images = {};
        this.p5Object = p5Object;
        this.cellSize = 25;
        this.snake = new Snake(Math.floor(this.p5Object.random(19))*this.cellSize,
                                Math.floor(this.p5Object.random(19))*this.cellSize,
                                this.cellSize, this.p5Object);
        this.food = new Food(5*this.cellSize, 6*this.cellSize,
                             this.cellSize, this.p5Object);
        this.#loadImages();
    }

    #loadImages(){
        this.images[`food_img`] = this.p5Object.loadImage('./images/apple.png');
        this.images[`snake_head`] = this.p5Object.loadImage(`./images/head.png`);
        this.images[`snake_body`] = this.p5Object.loadImage(`./images/body.png`);
        this.images[`snake_tail`] = this.p5Object.loadImage(`./images/tail.png`);
        this.images[`snake_down-right`] = this.p5Object.loadImage(`./images/down-right.png`);
        this.images[`snake_right-up`] = this.p5Object.loadImage(`./images/right-up.png`);
        this.images[`snake_up-left`] = this.p5Object.loadImage(`./images/up-left.png`);
        this.images[`snake_up-right`] = this.p5Object.loadImage(`./images/up-right.png`);
    }

    update(){
        this.snake.update();
        this.snake.ateFruit(this.food);
    }

    display(){
        this.snake.show(this.images);
        this.food.show();
    }

}

