class Food {
    constructor(x, y, cellSize, p5Object){
        this.p = p5Object;
        this.cellSize = cellSize;
        this.pos = this.p.createVector(x, y);

    }

    show(images){
        // p5 loads images asynchronously, so fall back to a plain circle until it arrives
        if (images["food_img"] && images["food_img"].width > 0){
            this.p.image(images["food_img"], this.pos.x, this.pos.y, this.cellSize, this.cellSize);
        }else {
            this.p.fill(255, 0, 0);
            this.p.noStroke();
            this.p.ellipse(this.pos.x + this.cellSize/2, this.pos.y + this.cellSize/2, this.cellSize-5);
        }
    }

    // pick a random free cell, never one the snake is currently sitting on
    changeLocation(cols, rows, snakeBody){
        let randX, randY, onSnake;
        do {
            randX = Math.floor(this.p.random(cols))*this.cellSize;
            randY = Math.floor(this.p.random(rows))*this.cellSize;
            onSnake = snakeBody.some(block => block.x === randX && block.y === randY);
        } while (onSnake);
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

        // turns are queued here and applied on the next step, so two quick
        // turns in one step cannot fold the snake back into itself
        this.nextVel = this.vel;

        // set when the apple is eaten; tells moveSnake to keep its tail this step
        this.grow = false;
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

    // the snake only steps once every 20 frames, which is what sets the game speed.
    // returns true on the frames where it actually moved, so the game knows when
    // it is worth re-checking collisions.
    update(){
        if (this.p.frameCount % 20 == 0){
            this.moveSnake();
            return true;
        }
        return false;
    }

    moveSnake(){
        // apply whichever turn was queued since the last step
        this.vel = this.nextVel;

        //copy body array
        const body_copy = [...this.body];

        // normally the tail is dropped so the snake stays the same length;
        // after eating we keep it, which is what makes the snake grow by one
        if (this.grow) this.grow = false;
        else body_copy.pop();

        // add block to beginning going in dir of vel
        const pos = p5.Vector.add(this.vel, body_copy[0]);
        body_copy.unshift(pos);

        // mutate the actual body of snake
        this.body = body_copy;

    }

    // a turn is only legal if it is perpendicular to the way we are already going.
    // vel.y === 0 means we are moving horizontally, so up/down are allowed.
    goUp(){
        if (this.vel.y === 0) this.nextVel = this.directions["up"];
    }

    goDown(){
        if (this.vel.y === 0) this.nextVel = this.directions["down"];
    }

    goRight(){
        if (this.vel.x === 0) this.nextVel = this.directions["right"];
    }

    goLeft(){
        if (this.vel.x === 0) this.nextVel = this.directions["left"];
    }

    // true when the head has landed on the apple this step
    ateFruit(fruit){
        if (fruit.pos.x == this.body[0].x && fruit.pos.y == this.body[0].y){
            this.grow = true;
            return true;
        }
        return false;
    }

    // first way to lose: the head leaves the board
    hitWall(cols, rows){
        const head = this.body[0];
        return head.x < 0 || head.y < 0 ||
               head.x >= cols*this.cellSize || head.y >= rows*this.cellSize;
    }

    // second way to lose: the head lands on one of its own segments
    hitSelf(){
        const head = this.body[0];
        return this.body.slice(1).some(block => block.x === head.x && block.y === head.y);
    }


}

class SnakeGame {
    constructor(p5Object){
        this.images = {};
        this.p5Object = p5Object;
        this.cellSize = 25;

        // the canvas is 500x500 and cells are 25px, so the board is 20x20
        this.cols = 20;
        this.rows = 20;

        this.#loadImages();
        this.restart();
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

    // the snake starts as 3 blocks laid out to the right of the head, so the head
    // has to spawn far enough left that the whole body still fits on the board
    #spawnSnake(){
        const col = Math.floor(this.p5Object.random(this.cols - 2));
        const row = Math.floor(this.p5Object.random(this.rows));
        return new Snake(col*this.cellSize, row*this.cellSize, this.cellSize, this.p5Object);
    }

    update(){
        if (this.gameOver) return;

        // nothing can have changed on frames where the snake did not step
        if (!this.snake.update()) return;

        if (this.snake.hitWall(this.cols, this.rows) || this.snake.hitSelf()){
            this.gameOver = true;
            return;
        }

        if (this.snake.ateFruit(this.food)){
            this.score++;
            this.food.changeLocation(this.cols, this.rows, this.snake.body);
        }
    }

    display(){
        this.snake.show(this.images);
        this.food.show(this.images);
        this.#drawScore();
        if (this.gameOver) this.#drawGameOver();
    }

    #drawScore(){
        this.p5Object.push();
        this.p5Object.fill(0);
        this.p5Object.noStroke();
        this.p5Object.textSize(20);
        this.p5Object.textAlign(this.p5Object.LEFT, this.p5Object.TOP);
        this.p5Object.text(`Score: ${this.score}`, 8, 8);
        this.p5Object.pop();
    }

    #drawGameOver(){
        const w = this.cols*this.cellSize;
        const h = this.rows*this.cellSize;
        this.p5Object.push();
        this.p5Object.fill(0, 0, 0, 170);
        this.p5Object.noStroke();
        this.p5Object.rect(0, 0, w, h);
        this.p5Object.fill(255);
        this.p5Object.textAlign(this.p5Object.CENTER, this.p5Object.CENTER);
        this.p5Object.textSize(44);
        this.p5Object.text('Game Over', w/2, h/2 - 25);
        this.p5Object.textSize(20);
        this.p5Object.text(`Score: ${this.score} — press Restart`, w/2, h/2 + 25);
        this.p5Object.pop();
    }

    restart() {
        this.snake = this.#spawnSnake();
        this.food = new Food(0, 0, this.cellSize, this.p5Object);
        this.food.changeLocation(this.cols, this.rows, this.snake.body);
        this.score = 0;
        this.gameOver = false;
    }

}

