class widget_drawnote extends base_widget
{
	constructor(name, id, width, height, startingXpos, startingYpos, allowChanges=false)
	{	
		if (name == null) {
            super();
            return;
        }
		super(name, id, width, height, startingXpos, startingYpos, allowChanges);

		this.textHeight = 15;
		
		this.id = id
		this.tool = 'pencil';
		this.color = '#000000';
		this.mousedown = false;
		this.radius = 2;
		this.last_x = 0;
		this.last_y = 0;
		this.start_x = 0;
		this.start_y = 0;
		
		// canvas aanmaken
		this.canvas = document.createElement("canvas");
		this.canvas.style.display = 'block';
		this.canvas.setAttribute('width', '230');
		this.canvas.setAttribute('height', '300');
		this.ctx = this.canvas.getContext('2d');
		this.ctx.strokeStyle = this.color;
		this.ctx.fillStyle = '#ffffff';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		// deze check is er om in de browser zonder touchscreen te kunnen testen
		if (this.touchscreen)
		{
			console.log("touchscreen = " + this.touchscreen)
			// wanneer de vinger op het scherm komt
			this.canvas.addEventListener("touchstart", (e)=>{
				console.log("fired");
				let finger1_x = e.touches[0].clientX - this.canvas.getBoundingClientRect().left;
				let finger1_y = e.touches[0].clientY - this.canvas.getBoundingClientRect().top;
				if (this.tool == 'pencil')
				{
					// begint het tekenen met de pencil
					this.last_x = finger1_x;
					this.last_y = finger1_y;
					this.ctx.fillStyle = this.color;
					this.ctx.beginPath();
					this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.fill();
				}
				if (this.tool == 'eraser')
				{
					// dit is pencil maar dan met de kleur wit
					this.last_x = finger1_x;
					this.last_y = finger1_y;
					this.ctx.beginPath();
					this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.fillStyle = '#ffffff';
					this.ctx.fill();
				}
				if (this.tool == 'line' || this.tool == 'rectangle' || this.tool == 'circle')
				{
					this.start_x = finger1_x;
					this.start_y = finger1_y;
					// dit slaat de huidige canvas op zodat het canvas weer naar de oude staat kan
					this.canvas_draw_buffer = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
					this.ctx.beginPath();
					this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.fillStyle = '#000000';
					this.ctx.fill();
				}
			});
			
			// wanneer de vinger beweegt
			this.canvas.addEventListener("touchmove", (e)=>{
				/* dit pakt de coördinaten van de vinger op het scherm. Aangezien er meerdere vingers kunnen zijn wordt
				   touches[0] gebruikt. */
				let finger1_x = e.touches[0].clientX - this.canvas.getBoundingClientRect().left;
				let finger1_y = e.touches[0].clientY - this.canvas.getBoundingClientRect().top;
				if (this.tool == 'pencil')
				{
					/* dit tekent bij elke beweging een line. Als er alleen een stip wordt getekend zou het er niet
					   mooi uit zien. */
					this.ctx.lineCap = "round";
					this.ctx.strokeStyle = this.color;
					this.ctx.beginPath();
					this.ctx.moveTo(this.last_x, this.last_y);
					this.ctx.lineTo(finger1_x, finger1_y);
					//this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.lineWidth = this.radius*2;
					this.ctx.stroke();
					this.last_x = finger1_x;
					this.last_y = finger1_y;
				}
				if (this.tool == 'eraser')
				{
					this.ctx.lineCap = "round";
					this.ctx.beginPath();
					this.ctx.moveTo(this.last_x, this.last_y);
					this.ctx.lineTo(finger1_x, finger1_y);
					//this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.strokeStyle = '#ffffff';
					this.ctx.lineWidth = this.radius*2;
					this.ctx.stroke();
					this.last_x = finger1_x;
					this.last_y = finger1_y;
				}
				if (this.tool == 'line')
				{
					this.ctx.lineCap = "round";
					// de canvas wordt terug gezet naar de oude staat en dan wordt er een nieuwe lijn op getekend
					this.ctx.putImageData(this.canvas_draw_buffer,0,0);
					this.ctx.strokeStyle = this.color;
					this.ctx.beginPath();
					this.ctx.moveTo(this.start_x, this.start_y);
					this.ctx.lineTo(finger1_x, finger1_y);
					//this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.lineWidth = this.radius*2;
					this.ctx.stroke();
				}
				if (this.tool == 'rectangle')
				{
					this.ctx.lineCap = "round";
					this.ctx.putImageData(this.canvas_draw_buffer,0,0);
					this.ctx.beginPath();
					this.ctx.moveTo(this.start_x, this.start_y);
					this.ctx.rect(this.start_x, this.start_y, finger1_x - this.start_x, finger1_y - this.start_y);
					//this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.strokeStyle = this.color;
					this.ctx.lineWidth = this.radius*2;
					this.ctx.stroke();
				}
				if (this.tool == 'circle')
				{
					this.ctx.lineCap = "round";
					this.ctx.putImageData(this.canvas_draw_buffer,0,0);
					this.ctx.beginPath();
					this.ctx.moveTo(this.start_x, this.start_y);
					this.drawEllipse((finger1_x + this.start_x) / 2, (finger1_y + this.start_y) / 2, finger1_x - this.start_x, finger1_y - this.start_y);
					//this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.strokeStyle = this.color;
					this.ctx.lineWidth = this.radius*2;
					this.ctx.stroke();
				}
			});
			
			this.canvas.ontouchend = (e)=>{
				
			};
		}
		else
		{
			// hetzelfde als de touch events maar dan voor een muis in plaats van touch screen
			this.canvas.onmousedown = (e)=>{
				let finger1_x = e.clientX - this.canvas.getBoundingClientRect().left;
				let finger1_y = e.clientY - this.canvas.getBoundingClientRect().top;
				this.mousedown = true;
				if (this.tool == 'pencil')
				{
					this.last_x = finger1_x;
					this.last_y = finger1_y;
					this.ctx.fillStyle = this.color;
					//console.log("draw at: " + finger1_x + ", " + finger1_y);
					this.ctx.beginPath();
					this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.fill();
				}
				if (this.tool == 'eraser')
				{
					this.last_x = finger1_x;
					this.last_y = finger1_y;
					//console.log("draw at: " + finger1_x + ", " + finger1_y);
					this.ctx.beginPath();
					this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.fillStyle = '#ffffff';
					this.ctx.fill();
				}
				if (this.tool == 'line' || this.tool == 'rectangle' || this.tool == 'circle')
				{
					this.start_x = finger1_x;
					this.start_y = finger1_y;
					this.canvas_draw_buffer = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
					this.ctx.beginPath();
					this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.fillStyle = '#000000';
					this.ctx.fill();
				}
			};
			
			this.canvas.onmousemove = (e)=>{
				let finger1_x = e.clientX - this.canvas.getBoundingClientRect().left;
				let finger1_y = e.clientY - this.canvas.getBoundingClientRect().top;
				if (!this.mousedown) {return;}
				if (this.tool == 'pencil')
				{
					this.ctx.lineCap = "round";
					this.ctx.strokeStyle = this.color;
					this.ctx.beginPath();
					this.ctx.moveTo(this.last_x, this.last_y);
					this.ctx.lineTo(finger1_x, finger1_y);
					//this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.lineWidth = this.radius*2;
					this.ctx.stroke();
					this.last_x = finger1_x;
					this.last_y = finger1_y;
				}
				if (this.tool == 'eraser')
				{
					this.ctx.lineCap = "round";
					this.ctx.beginPath();
					this.ctx.moveTo(this.last_x, this.last_y);
					this.ctx.lineTo(finger1_x, finger1_y);
					//this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.strokeStyle = '#ffffff';
					this.ctx.lineWidth = this.radius*2;
					this.ctx.stroke();
					this.last_x = finger1_x;
					this.last_y = finger1_y;
				}
				if (this.tool == 'line')
				{
					this.ctx.lineCap = "round";
					this.ctx.putImageData(this.canvas_draw_buffer,0,0);
					this.ctx.beginPath();
					this.ctx.moveTo(this.start_x, this.start_y);
					this.ctx.lineTo(finger1_x, finger1_y);
					//this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.strokeStyle = this.color;
					this.ctx.lineWidth = this.radius*2;
					this.ctx.stroke();
				}
				if (this.tool == 'rectangle')
				{
					this.ctx.lineCap = "round";
					this.ctx.putImageData(this.canvas_draw_buffer,0,0);
					this.ctx.beginPath();
					this.ctx.moveTo(this.start_x, this.start_y);
					this.ctx.rect(this.start_x, this.start_y, finger1_x - this.start_x, finger1_y - this.start_y);
					//this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.strokeStyle = this.color;
					this.ctx.lineWidth = this.radius*2;
					this.ctx.stroke();
				}
				if (this.tool == 'circle')
				{
					this.ctx.lineCap = "round";
					this.ctx.putImageData(this.canvas_draw_buffer,0,0);
					this.ctx.beginPath();
					this.ctx.moveTo(this.start_x, this.start_y);
					this.drawEllipse((finger1_x + this.start_x) / 2, (finger1_y + this.start_y) / 2, finger1_x - this.start_x, finger1_y - this.start_y);
					//this.ctx.arc(finger1_x, finger1_y, this.radius, 0, 2 * Math.PI, false);
					this.ctx.strokeStyle = this.color;
					this.ctx.lineWidth = this.radius*2;
					this.ctx.stroke();
				}
			};
			
			this.canvas.onmouseup = (e)=>{
				this.mousedown = false;
			};
		}

		
		this.button_container = document.createElement('div');
		this.button_container.style.width = '100%';
		this.button_container.style.marginTop = '3px';
		
		this.clear_button = document.createElement("button");
        this.clear_button.className = "menuButton";
        this.clear_button.id = id + "clearButton";
        this.clear_button.innerHTML = "Wis canvas";
        this.clear_button.addEventListener('click', () => { this.dropdown.style.display = "none"; });
        this.clear_button.onclick = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.fillStyle = '#ffffff';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };
        this.dropdown.appendChild(this.clear_button);
		
		this.color_button = document.createElement("input");
		this.color_button.type = 'image';
		this.color_button.src = '..\\assets\\drawnote\\color.png';
		this.color_button.style.verticalAlign = 'middle';
		this.color_button.style.marginRight = '3px';
		//this.color_button.style.display = 'inline-block';
        this.color_button.id = id + "colorButton";
		this.color_button.style.backgroundColor = this.color;
		
        this.picker = new CP(this.color_button);
		this.picker.set([0, 0, 0]);
		this.picker.self.style.marginLeft = '26px';

		this.picker.on("change", (color)=> {
			//this.source.value = 'kleur: #' + color;
			this.color = '#' + color;
			this.color_button.style.backgroundColor = this.color;
		}, 'main-change');
		
		this.pencil_button = document.createElement("input");
		this.pencil_button.type = 'image';
		this.pencil_button.src = '..\\assets\\drawnote\\pencil_selected.png';
		this.pencil_button.style.verticalAlign = 'middle';
		this.pencil_button.style.marginRight = '3px';
        this.pencil_button.id = id + "pencilButton";
		this.pencil_button.onclick = ()=>{
			this.change_tool('pencil');
		};
		
		this.eraser_button = document.createElement("input");
		this.eraser_button.type = 'image';
		this.eraser_button.src = '..\\assets\\drawnote\\eraser_unselected.png';
		this.eraser_button.style.verticalAlign = 'middle';
		this.eraser_button.style.marginRight = '3px';
        this.eraser_button.id = id + "eraserButton";
		this.eraser_button.onclick = ()=>{
			this.change_tool('eraser');
		};
		
		this.line_button = document.createElement("input");
		this.line_button.type = 'image';
		this.line_button.src = '..\\assets\\drawnote\\line_unselected.png';
		this.line_button.style.verticalAlign = 'middle';
		this.line_button.style.marginRight = '3px';
        this.line_button.id = id + "lineButton";
		this.line_button.onclick = ()=>{
			this.change_tool('line');
		};
		
		this.rectangle_button = document.createElement("input");
		this.rectangle_button.type = 'image';
		this.rectangle_button.src = '..\\assets\\drawnote\\rectangle_unselected.png';
		this.rectangle_button.style.verticalAlign = 'middle';
		this.rectangle_button.style.marginRight = '3px';
        this.rectangle_button.id = id + "rectangleButton";
		this.rectangle_button.onclick = ()=>{
			this.change_tool('rectangle');
		};
		
		this.circle_button = document.createElement("input");
		this.circle_button.type = 'image';
		this.circle_button.src = '..\\assets\\drawnote\\circle_unselected.png';
		this.circle_button.style.verticalAlign = 'middle';
		this.circle_button.style.marginRight = '3px';
        this.circle_button.id = id + "circleButton";
		this.circle_button.onclick = ()=>{
			this.change_tool('circle');
		};
		
		this.min_button = document.createElement("input");
		this.min_button.type = 'image';
		this.min_button.src = '..\\assets\\drawnote\\min.png';
		this.min_button.style.verticalAlign = 'middle';
		this.min_button.style.marginRight = '1px';
        this.min_button.id = id + "minButton";
		this.min_button.onclick = ()=>{
			if (this.radius > 1)
			{
				this.radius--;
				this.radius_text.innerHTML = this.radius;
			}
		};
		
		this.radius_text = document.createElement("div");
		this.radius_text.style.verticalAlign = 'middle';
		this.radius_text.style.textAlign = 'center';
		this.radius_text.style.marginRight = '1px';
		this.radius_text.style.width = '18px';
		this.radius_text.style.display = 'inline-block';
		this.radius_text.innerHTML = this.radius;
        this.radius_text.id = id + "radiusText";
		
		this.plus_button = document.createElement("input");
		this.plus_button.type = 'image';
		this.plus_button.src = '..\\assets\\drawnote\\plus.png';
		this.plus_button.style.verticalAlign = 'middle';
		this.plus_button.style.marginRight = '3px';
        this.plus_button.id = id + "plusButton";
		this.plus_button.onclick = ()=>
		{
				this.radius++;
				this.radius_text.innerHTML = this.radius;
		};
		
		this.widget_body.appendChild(this.canvas);
		this.button_container.appendChild(this.color_button);
		this.button_container.appendChild(this.pencil_button);
		this.button_container.appendChild(this.eraser_button);
		this.button_container.appendChild(this.line_button);
		this.button_container.appendChild(this.rectangle_button);
		this.button_container.appendChild(this.circle_button);
		this.button_container.appendChild(this.min_button);
		this.button_container.appendChild(this.radius_text);
		this.button_container.appendChild(this.plus_button);
		this.widget_body.appendChild(this.button_container);
	}
	
	change_tool(new_tool)
	{
		document.getElementById(this.id + this.tool + "Button").src = '..\\assets\\drawnote\\' + this.tool + '_unselected.png';
		this.tool = new_tool;
		document.getElementById(this.id + this.tool + "Button").src = '..\\assets\\drawnote\\' + this.tool + '_selected.png';
	}
	
	drawEllipse(centerX, centerY, width, height) {
		this.ctx.beginPath();

		this.ctx.moveTo(centerX, centerY - height/2); // A1

		this.ctx.bezierCurveTo(
		centerX + width/2, centerY - height/2, // C1
		centerX + width/2, centerY + height/2, // C2
		centerX, centerY + height/2); // A2

		this.ctx.bezierCurveTo(
		centerX - width/2, centerY + height/2, // C3
		centerX - width/2, centerY - height/2, // C4
		centerX, centerY - height/2); // A1

		this.ctx.closePath();	
	}
	
	resized()
	{
		super.resized()
		this.image_resize_buffer = this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
		this.canvas.setAttribute('width', this.widget_body.clientWidth);
		if (this.widget_body.clientHeight - this.button_container.clientHeight > 0)
		{
			this.canvas.setAttribute('height', this.widget_body.clientHeight - this.button_container.clientHeight);
		}
		else
		{
			this.canvas.setAttribute('height', 1);
		}
		this.ctx.fillStyle = '#ffffff';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.putImageData(this.image_resize_buffer,0,0);
	}
	
	get_settings(object) 
	{
        return JSON.parse(JSON.stringify({"color": object.color,"tool": object.tool,"radius": object.radius,"ImageURL": object.canvas.toDataURL()}));
    }

    set_settings(object, config) 
	{
        let img = new Image;
		img.onload = ()=>
		{
			this.canvas.setAttribute('width', img.width);
			this.canvas.setAttribute('height', img.height);
			object.ctx.drawImage(img,0,0);
		};
		img.src = config["ImageURL"];
		window.setTimeout(()=>
		{
			object.change_tool(config["tool"]);
			object.color = config["color"];
			object.color_button.style.backgroundColor = object.color;
			object.radius = config["radius"];
			object.radius_text.innerHTML = object.radius;
		}, 100);
    }
	
	make_new_widget(name, id, width, height, startingXpos, startingYpos, allowChanges)
    {
        return new widget_drawnote(name, id, width, height, startingXpos, startingYpos, allowChanges);
    }
}