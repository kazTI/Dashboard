class widget_clock extends base_widget
{
	constructor(name, id, width, height, startingXpos, startingYpos, allowChanges=false)
	{	
		if (name == null) {
            super();
            return;
        }
		super(name, id, width, height, startingXpos, startingYpos, allowChanges);

		//console.log("new clock")

		this.textHeight = 15;

		var size = width*0.95*0.5;
		if((height - 30)*0.95*0.5 < size) {
			size = ((height - 30) - this.textHeight)*0.95*0.5;
		}
		this.createElements(size);

		this.analog_clock.style.marginLeft = (((width - 5)/2) - size) + "px";
		this.analog_clock.style.marginTop = (((height - 35 - this.textHeight)/2) - size) + "px";
		window.setTimeout(()=>
		{
			var size = this.widget_body.clientWidth*0.95*0.5;
			if(this.widget_body.clientHeight*0.95*0.5 < size) {
				size = (this.widget_body.clientHeight - this.textHeight)*0.95*0.5;
			}

			this.widget_body.innerHTML = "";
			this.createElements(size);
		}, 100);
	}

	createElements(size)
	{
		this.analog_clock = document.createElement("canvas");
		this.analog_clock.id = this.widget.id + "clock";
		this.analog_clock.className = "CoolClock::"+ parseInt(size);

		this.analog_clock.style.position = "static";
		this.analog_clock.style.marginLeft = ((this.widget_body.clientWidth/2) - size) + "px";
		this.analog_clock.style.marginTop = (((this.widget_body.clientHeight - this.textHeight)/2) - size) + "px";

		this.date = document.createElement("div");
		this.date.innerHTML = new Date().toJSON().slice(0,10);
		
		this.date.style.position = "static";
		if (this.widget_body.clientWidth > this.widget_body.clientHeight) {
			this.date.style.top = parseInt(this.analog_clock.style.top) + "px";
		} else {
			this.date.style.top = parseInt(this.analog_clock.style.top) + "px";
		}
		

		this.date.style.width = "100%";
		this.date.style.textAlign = "center";
		this.widget_body.appendChild(this.analog_clock);
		this.widget_body.appendChild(this.date);

		CoolClock.findAndCreateClocks();
	}

	resized()
	{
		super.resized()

		var size = this.widget_body.clientWidth*0.95*0.5;
		if(this.widget_body.clientHeight*0.95*0.5 < size) {
			size = (this.widget_body.clientHeight - this.textHeight)*0.95*0.5;
		}

		this.widget_body.innerHTML = "";
		this.createElements(size);
	}
	make_new_widget(name, id, width, height, startingXpos, startingYpos, allowChanges)
    {
        return new widget_clock(name, id, width, height, startingXpos, startingYpos, allowChanges);
    }
}