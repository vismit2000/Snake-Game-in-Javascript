function showInstructions(){
	var message = "INSTRUCTIONS\n";
	message += "1. Score:  Apple: 1 point\n                 Strawberry: 2 points\n                 Mango: 3 points\n";
	message += "2. Eating Bomb results in GAME OVER\n";
	message += "3. Strawberry, Mango and Bomb disappear after some time if not consumed";
	alert(message);
}

function load_images(){
	//Create a Image Object for food
	food_img = new Image();
	food_img.src = "Assets/apple.png";

	strawberry_img = new Image();
	strawberry_img.src = "Assets/strawberry.png";

	mango_img = new Image();
	mango_img.src = "Assets/mango.png";

	bomb_img = new Image();
	bomb_img.src = "Assets/bomb.png";

	trophy = new Image();
	trophy.src = "Assets/trophy.png";
}

function init(){
	canvas = document.getElementById('mycanvas');
	W = H = canvas.width = canvas.height = 1000;

	pen = canvas.getContext('2d');
	cs = W / 15;	//deontes cell size

	game_over = false;
	score = 0;

	// food = getRandomFood([]);
	food = null;
	strawberry = null;
	mango = null;
	bomb = null;
	
	bomb_end = 0;
	mango_end = 0;
	strawberry_end = 0;

	food_pos = {x:-1, y:-1}; // current position of food apple (initialized to -1)

	snake = {
		init_len: 5,
		color: "blue",
		cells: [],
		direction: "pause",


		createSnake:function(){
			for(var i = this.init_len - 1; i >= 0; i--){
				this.cells.push({x:i,y:7});
			}
		},

		drawSnake:function(){

			var grad = 255/this.cells.length;	// shows the gradient of colour from black (head) to blue (tail)

			for(var i = 0; i < this.cells.length; i++){
				pen.fillStyle = `rgb(
					0,
					0,
					${Math.floor(grad * i)})`;
				pen.fillRect(this.cells[i].x*cs,this.cells[i].y*cs,cs-3,cs-3); // cs-3 to show snake as block
			}
		},

		//check if the snake has eaten food, increase the length of the snake and generate new food object
		updateSnake:function(){
		
			if(this.direction == "pause")
				return;

			var headX = this.cells[0].x;
			var headY = this.cells[0].y;

			if(headX == food.x && headY == food.y){
				console.log("Food eaten");
				food = getRandomFood(this.cells);
				score++;

				if(score >= strawberry_end)
					strawberry = null;

				if(score >= mango_end)
					mango = null;

				if(score >= bomb_end)
					bomb = null;
				
				if(score % 20 == 0)
				{
					bomb = getRandomFood(this.cells);
					bomb_end = score + 5;
				}
				else if(score % 10 == 0)
				{
					mango = getRandomFood(this.cells);
					mango_end = score + 5;
				}
				else if(score % 5 == 0)
				{
					strawberry = getRandomFood(this.cells);
					strawberry_end = score + 5;
				}
			}
			else{
				this.cells.pop();
			}

			if(strawberry && headX == strawberry.x && headY == strawberry.y){
				console.log("strawberry eaten");
				strawberry = null;
				score += 2;

				// Supplement Strawberry => Decrease length of snake by 1 unit
				this.cells.pop();
			}

			if(mango && headX == mango.x && headY == mango.y){
				console.log("Mango eaten");
				mango = null;
				score += 3;

				// Supplement Mango => Decrease length of snake by 2 unit
				this.cells.pop();
				this.cells.pop();
			}

			if(bomb && headX == bomb.x && headY == bomb.y){
				console.log("Bomb eaten");
				bomb = null;
				game_over = true;
			}
				
			var nextX, nextY;
			var count_cells = Math.round(W/cs);	// i.e.15
			
			// Cyclic boundary conditions
			if(this.direction == "right"){
				nextX = (headX + 1) % count_cells;
				nextY = headY;
			}
			else if(this.direction == "left"){
				nextX = (headX - 1 + count_cells) % count_cells;
				nextY = headY;
			}
			else if(this.direction == "down"){
				nextX = headX;
				nextY = (headY + 1) % count_cells;
			}
			else if(this.direction == "up"){
				nextX = headX;
				nextY = (headY - 1 + count_cells) % count_cells;
			}
			
			// Check for snake biting itself
			for(var i = 0; i < this.cells.length; i++){
				if(this.cells[i].x == nextX && this.cells[i].y == nextY)
					game_over = true;
			}

			this.cells.unshift({x: nextX,y:nextY});	// Add this cell to the beginning

			/* Logic that prevents snake from going out*/
			// var last_x = Math.round(W/cs);
			// var last_y = Math.round(H/cs);

			// if(this.cells[0].y < 0 || this.cells[0].x < 0 || this.cells[0].x >= last_x || this.cells[0].y >= last_y){
			// 		game_over = true;
			// }
		}
	};

	snake.createSnake();
	food = getRandomFood(snake.cells);
	
	//Add a Event Listener on the Document Object
	function keyPressed(e){
		
		if(e.key == "ArrowRight" && snake.direction != "left"){
			snake.direction = "right";
		}	
		else if(e.key=="ArrowLeft" && snake.direction != "right"){
			snake.direction = "left";
		}
		else if(e.key=="ArrowDown" && snake.direction != "up"){
			snake.direction = "down";
		}
		else if(e.key=="ArrowUp" && snake.direction != "down"){
			snake.direction = "up";
		}
		console.log(snake.direction);
	}

	document.addEventListener('keydown',keyPressed) ;	
}

function draw(){
	//erase the old frame
	pen.clearRect(0,0,W,H);
	snake.drawSnake();

	pen.fillStyle = food.color;
	
	if(strawberry)
		pen.drawImage(strawberry_img, strawberry.x*cs, strawberry.y*cs, cs, cs);
	if(mango)
		pen.drawImage(mango_img, mango.x*cs, mango.y*cs, cs, cs);
	if(bomb)
		pen.drawImage(bomb_img, bomb.x*cs, bomb.y*cs, cs, cs);

	pen.drawImage(food_img, food.x*cs, food.y*cs, cs, cs);

	pen.drawImage(trophy,18,20,cs,cs);
	pen.fillStyle = "blue";
	pen.font = "20px Roboto"
	pen.fillText(score,42,50);	
}

function update(){
	snake.updateSnake(); 
}

function getRandomFood(cells){

	var foodX, foodY;
	var valid = false;

	// Check that food is not generated at any current position occupied by the snake
	while(!valid){
		foodX = Math.round(Math.random()*(W-cs)/cs);
		foodY = Math.round(Math.random()*(H-cs)/cs);
		valid = true;

		if(foodX == food_pos.x && foodY == food_pos.y){
			valid = false;
		}

		for(var i = 0; i < cells.length; i++){
			if(cells[i].x == foodX && cells[i].y == foodY){
				valid = false;
				break;
			}
		}	
	}

	var food = {
		x:foodX,
		y:foodY,
		color:"red",
	}

	food_pos = {x:foodX, y:foodY};
	
	return food
}

function gameloop(){
	if(game_over == true){
		clearInterval(f);
		alert("Game Over");
		return;
	}
	draw();
	update();
}

//start of the game
load_images();
init();

//repeated call gameloop
var f = setInterval(gameloop, 200);