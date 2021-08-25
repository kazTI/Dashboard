class widget_snake extends base_widget
{
	init()
	{
		this.d = "right"; //default direction
		this.create_snake();
		this.create_food(); //Now we can see the food particle
		//finally lets display the score
		this.score = 0;
		this.level = 1;
		
		//Lets move the snake now using a timer which will trigger the paint function
		//every 60ms
		if(typeof this.game_loop != "undefined") clearInterval(this.game_loop);
		this.game_loop = setInterval(()=>{this.paint}, 100);
	}
	
	constructor(name, id, width, height, startingXpos, startingYpos, allowChanges=false)
	{	
		if (name == null) {
            super();
            return;
        }
		super(name, id, width, height, startingXpos, startingYpos, allowChanges);
		this.canvas = document.createElement("canvas");
		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";
		this.ctx = this.canvas.getContext("2d");
		this.ctx.fillStyle = "blue";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.widget_body.appendChild(this.canvas)
		
		//Canvas stuff
		
		//Lets save the cell width in a variable for easy control
		this.cw = 10;
		this.init();
	}
	
	create_snake()
	{
		this.length = 5; //Length of the snake
		this.snake_array = []; //Empty array to start with
		for(var i = length-1; i>=0; i--)
		{
			//This will create a horizontal snake starting from the top left
			this.snake_array.push({x: i, y:0});
		}
	}
	
	//Lets create the food now
	create_food()
	{
		this.food = {
			x: Math.round(Math.random()*(this.canvas.width-this.cw)/this.cw), 
			y: Math.round(Math.random()*(this.canvas.height-this.cw)/this.cw), 
		};
		//This will create a cell with x/y between 0-44
		//Because there are 45(450/10) positions accross the rows and columns
	}
	
	//Lets paint the snake now
	paint()
	{
		//To avoid the snake trail we need to paint the BG on every frame
		//Lets paint the canvas now
		this.ctx.fillStyle = "white";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.strokeStyle = "black";
		this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
		
		//The movement code for the snake to come here.
		//The logic is simple
		//Pop out the tail cell and place it infront of the head cell
		var nx = this.snake_array[0].x;
		var ny = this.snake_array[0].y;
		//These were the position of the head cell.
		//We will increment it to get the new head position
		//Lets add proper direction based movement now
		if(this.d == "right") nx++;
		else if(this.d == "left") nx--;
		else if(this.d == "up") ny--;
		else if(this.d == "down") ny++;
		
		//Lets add the game over clauses now
		//This will restart the game if the snake hits the wall
		//Lets add the code for body collision
		//Now if the head of the snake bumps into its body, the game will restart
		if(nx == -1 || nx == this.canvas.width/this.cw || ny == -1 || ny == this.canvas.height/this.cw || this.check_collision(nx, ny, this.snake_array))
		{
			//restart game
			this.init();
			//Lets organize the code a bit now.
			return;
		}
		
		//Lets write the code to make the snake eat the food
		//The logic is simple
		//If the new head position matches with that of the food,
		//Create a new head instead of moving the tail
		if(nx == this.food.x && ny == this.food.y)
		{
			var tail = {x: nx, y: ny};
			this.score++;
       
			//Create new food
			this.create_food();
		}
		else
		{
			var tail = this.snake_array.pop(); //pops out the last cell
			tail.x = nx; tail.y = ny;
		}
		//The snake can now eat the food.
		
		this.snake_array.unshift(tail); //puts back the tail as the first cell
		
		for(var i = 0; i < this.snake_array.length; i++)
		{
			var c = this.snake_array[i];
			//Lets paint 10px wide cells
			this.paint_cell(c.x, c.y, "blue");
		}
		
		//Lets paint the food
		this.paint_cell(this.food.x, this.food.y, "red");
		//Lets paint the score
		var score_text = "Score: " + this.score;
     var level_text = "Level: " + this.level;
		this.ctx.fillText(score_text, 5, h-5);
     this.ctx.fillText(level_text, 60, h-5);
	}
	
	//Lets first create a generic function to paint cells
	paint_cell(x, y, color)
	{
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x*this.cw, y*this.cw, this.cw, this.cw);
		this.ctx.strokeStyle = "white";
		this.ctx.strokeRect(x*this.cw, y*this.cw, this.cw, this.cw);
	}
	
	check_collision(x, y, array)
	{
		//This function will check if the provided x/y coordinates exist
		//in an array of cells or not
		for(var i = 0; i < array.length; i++)
		{
			if(array[i].x == x && array[i].y == y)
			 return true;
		}
		return false;
	}
}