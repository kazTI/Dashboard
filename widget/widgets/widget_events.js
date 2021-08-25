class widget_events extends base_widget {
	constructor(name, id, width, height, startingXpos, startingYpos, allowChanges = false) {
		if (name == null) {
			super();
			return;
		}
		super(name, id, width, height, startingXpos, startingYpos, allowChanges);
		this.host = "http://34.90.97.175";
		//maakt de event plaatje aan
		this.event_image = document.createElement("IMG");
		this.event_image.className = "eventImage";
		this.widget_body.appendChild(this.event_image);
		this.get_new_events = setInterval(() => {
			this.get_events(this);
		}, 600000);
		this.change_events = setInterval(()=> {
			this.current_event++;
			if(this.current_event >= this.events.length) {
				this.current_event = 0;
			}
			this.change_event();
		}, 20000)
		this.events = {};
		this.get_events_first(this);
		this.current_event = 0;

	}
	start() {
		this.change_event();
	}

	//functie om het event te veranderen
	change_event() {
		this.event_image.src = this.events[this.current_event]["imgURL"];
		this.updateImageSize()
		console.log(this.event_image.src);
	}

	//eerste keer dat de get_events functie wordt aangeroepen
	get_events_first(ctx) {
		let request = new XMLHttpRequest();
		request.open('GET', this.host+'/get_events', true);
		request.onload = function () {
			console.log(this.response);
			ctx.events = JSON.parse(this.response).events;
			console.log(ctx.events);
			ctx.start();
		};
		request.send();
	}
	//krijgt alle events van de server
	get_events(ctx) {
		let request = new XMLHttpRequest();
		request.open('GET', this.host+'/get_events', true);
		request.onload = function () {
			console.log(this.response);
			ctx.events = JSON.parse(this.response).events;
			console.log(ctx.events);
		};
		request.send();
	}


	clear() {
		clearInterval(this.change_events);
		clearInterval(this.get_new_events);
	}
	make_new_widget(name, id, width, height, startingXpos, startingYpos, allowChanges) {
		return new widget_events(name, id, width, height, startingXpos, startingYpos, allowChanges);
	}
	//update de image size om scaling te laten werken
	updateImageSize() {

        var imgWidth = this.event_image.naturalWidth;
		var imgHeight = this.event_image.naturalHeight;
		var widthRatio = this.widget_body.clientWidth / imgWidth;
		var heightRatio = (this.widget_body.clientHeight) / imgHeight;


		if (widthRatio < heightRatio) {
            this.event_image.setAttribute('width', this.widget_body.clientWidth);
            this.event_image.setAttribute('height', imgHeight * widthRatio);
        } else {
            this.event_image.setAttribute('width', imgWidth * heightRatio);
            this.event_image.setAttribute('height', (this.widget_body.clientHeight));
        }
    }

    resized()
    {
        this.updateImageSize();
    }
}