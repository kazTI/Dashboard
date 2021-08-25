let lineheight = 35;


window.oncontextmenu = () => false;





let option_bar = document.createElement("div");		//De balk onder de titel met verschillende opties
option_bar.id = "options";
container.appendChild(option_bar);



let preview_div_button = document.createElement("button");		//Deze knop is voor het laten zien van een preview van een event zoals dat op het scherm zichtbaar zal zijn
let screen_preview = document.createElement("div");
preview_div_button.id = "create_event_button";
preview_div_button.innerHTML = "Preview event";
preview_div_button.addEventListener("click", show_canvas_preview);
option_bar.appendChild(preview_div_button);

async function show_canvas_preview () {		

	for (let e = 0; e < events.length; e++) {			//Laat een preview zien van de event die op dit moment geselecteerd is,
		if (events[e].isSelected) {						//Dus ga door alle events heen tot degene die geselecteerd is.
			events[e].layout = event_preview.get_layout(events[e]);		//Update eerst de layout met de layout zoals die op dit moment op de preview staat


			let preview_width = 1200					//Dit is de breedte van de preview
			screen_preview = event_preview.preview_event(events[e].layout, preview_width);	//Deze functie geeft de div van de preview
			screen_preview.className = "screen_preview";
			screen_preview.id = "screen_preview";
			screen_preview.style.position = "fixed";
			screen_preview.style.left = "50%";			//Centreer de div op het scherm
			screen_preview.style.marginLeft = (-0.5 * preview_width) + "px";
			screen_preview.style.zIndex = 1000;
			screen_preview.style.top = "25px";
			screen_preview.backgroundColor = events[e].layout["background"];

			document.body.appendChild(screen_preview);	//Voeg toe aan de body

			let canvas = await toCanvas("screen_preview");	//Functie geeft canvas terug dat er zo uit zit als de div

			screen_preview.addEventListener("click", () => {	//Verwijder div wanneer er op geklikt wordt
				document.body.removeChild(screen_preview);
			});


			events[e].canvas = canvas;			//Set de canvas in het event object
			console.log(events[e].canvas);		//Print
		}
	}
}




let save_events_button = document.createElement("button");		//Met deze knop worden alle events zoals ze nu in de browser zijn naar de server gestuurd.
save_events_button.id = "create_event_button";
save_events_button.innerHTML = "Save all changes";
save_events_button.addEventListener("click", async () => {
	let selected_event = "";
	let new_layouts = {			//Maak alvast een JSON voor alle layouts
		"events": []
	}

	for (let e = 0; e < events.length; e++) {	//Zorg dat de event die nu zichtbaar is ook een up to date layout heeft in het object
		if (events[e].isSelected) {
			events[e].layout = event_preview.get_layout(events[e]);
		}
	}

	for (let e = 0; e < events.length; e++) {	//Zorg dat de canvas voor elk object up to date is
		events[e].selected();
		console.log("going to click button");

		await show_canvas_preview();			//Deze functie zet preview op het scherm

		let elements = document.getElementsByClassName("screen_preview");

		while(elements[0]) {		//Haal de preview weer weg na het maken van de canvas
			elements[0].parentNode.removeChild(elements[0]);
		}
	}



	//console.log("Layout")
	//console.log(new_layouts);
	//console.log("Sending")

	for (let e = 0; e < events.length; e++) {
		console.log(events[e]);
		events[e].canvas = events[e].canvas.toDataURL();	//Maak van de canvas een dataurl
		console.log(events[e].canvas);
		let id = await uploadImage(events[e].canvas);		//Stuur de canvas naar de server
		events[e].imgURL = id;
		events[e].layout.imgURL = id;
		new_layouts["events"].push(events[e].layout);		//Voeg de layout toe aan de JSON met alle layouts
	}
	send_event(new_layouts)					//Stuur de layouts


});
option_bar.appendChild(save_events_button);

function uploadImage(image) {
	return new Promise(prom => {
		let request = new XMLHttpRequest();
		request.open('POST', 'uploadPicture', true);
		request.setRequestHeader('Content-Type', 'application/json');
		let json = JSON.stringify({ "image": image });
		request.onload = function () {
			prom(this.response);
		};
		request.send(json);
	});
}

function send_event(event_json) {
	let request = new XMLHttpRequest();
	request.open('POST', 'upload', true);
	request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	request.onload = function () {
		console.log(this.response);
	};
	request.send(JSON.stringify(event_json));
}

function get_event() {

	let request = new XMLHttpRequest();
	request.open('GET', 'get_events', true);		//Haal alle events op van de server
	request.onload = function () {


		console.log("events");
		var event_layouts = JSON.parse(this.response);
		console.log(event_layouts);
		console.log(event_layouts["events"].length)



		for (let e = 0; e < event_layouts["events"].length; e++) {	//Ga alle verkregen events af
			ctr+=1;
			console.log(event_layouts["events"][e]);
			let new_event = new event(event_layouts["events"][e]["name"], ctr);
			new_event.deselected()			//Deselecteer de event, anders wordt de layout overschreven zodra een andere event geselecteerd wordt

			new_event.layout = event_layouts["events"][e];				//Set de layout en begin en eind datum
			new_event.set_end_date(event_layouts["events"][e]["endDate"]);
			new_event.set_start_date(event_layouts["events"][e]["startDate"]);


			console.log(new_event);
			add_event(new_event);		//Voeg event toe
		}

	};
	request.send();
}


let ctr = 0;

let create_event_button = document.createElement("button");	//Deze knop maakt een nieuw event
create_event_button.id = "create_event_button";
create_event_button.innerHTML = "New event";
create_event_button.addEventListener("click", () => {
	ctr += 1;
	add_event(new event("Nieuw event " + ctr.toString(), ctr));
})
option_bar.appendChild(create_event_button);


let delete_event_button = document.createElement("button");	//Deze knop verwijdert de event die op dit moment zichtbaar is op de preview
delete_event_button.id = "create_event_button";
delete_event_button.innerHTML = "Delete event";
delete_event_button.addEventListener("click", () => {
	for (let i = 0; i < events.length; i++) {
		if (events[i].isSelected) {
			events[i].get_div().outerHTML = "";
			detail_pane.innerHTML = "";
		}
	}
});
option_bar.appendChild(delete_event_button);



get_event();




let logout = document.createElement("button");
logout.innerHTML = "Logout";
logout.addEventListener("click", () => {
	alert("No logging out yet");
})
//option_bar.appendChild(logout);



let detail_pane = document.createElement("div");		//De linker kant van het scherm
detail_pane.id = "details";
container.appendChild(detail_pane);




let event_container = document.createElement("div");	//De rechter kant van het scherm
event_container.id = "event_container";
container.appendChild(event_container);




let event_top_bar = document.createElement("div");
event_top_bar.className = "event"
event_top_bar.id = "event_top_bar";
event_top_bar.style.cursor = "default";
event_container.appendChild(event_top_bar);


let event_name_top = document.createElement("div");		//De titels boven de lijst met events aan de rechterkant van het scherm
event_name_top.className = "event_name";
event_name_top.innerHTML = "Naam";
event_top_bar.appendChild(event_name_top);
event_name_top.style.width = (window.getComputedStyle(event_name_top, null).width.slice(0, -2) - getScrollbarWidth()) + "px";

let event_start_date_top = document.createElement("div");
event_start_date_top.className = "event_start_date";
event_start_date_top.innerHTML = "Begin datum";
event_top_bar.appendChild(event_start_date_top);

let event_end_date_top = document.createElement("div");
event_end_date_top.className = "event_end_date";
event_end_date_top.innerHTML = "Eind datum";
event_top_bar.appendChild(event_end_date_top);







let event_list_pane = document.createElement("div");
event_list_pane.id = "event_list";
event_container.appendChild(event_list_pane);



let events = [];
let event_preview = "";


function add_event(event) {		//Voegt een event toe aan de lijst met events en aan het scherm
	events.push(event);
	event_list_pane.appendChild(event.get_div());
}



class event {
	constructor(name, number) {
		this.isSelected = true;
		this.layout = {
			"name": name,
			"background":"rgb(255, 255, 255)"		//De standaard achtergrond is wit.
		};
		this.canvas = document.createElement("canvas");

		this.imgURL = ""		//De URL van de image zoals die op de server staag


		this.event = document.createElement("div");
		this.event.className = "event";

		this.name = this.layout["name"];
		this.name_div = document.createElement("div");
		this.name_div.className = "event_name";
		this.name_div.innerHTML = this.name;
		this.event.appendChild(this.name_div);

		this.start_date = "Geen begin datum";
		this.start_date_div = document.createElement("div");
		this.start_date_div.className = "event_start_date";
		this.start_date_div.innerHTML = "Geen begin datum";
		this.event.appendChild(this.start_date_div);

		this.end_date = "Geen eind datum";
		this.end_date_div = document.createElement("div");
		this.end_date_div.className = "event_end_date";
		this.end_date_div.innerHTML = "Geen eind datum";
		this.event.appendChild(this.end_date_div);




		this.event.addEventListener("click", () => {
			this.selected();
		});


		if (this.isSelected) {
			this.selected();
		} else {
			this.deselected();
		}
	}

	selected() {		//Als de event geselcteerd wordt

		for (let i = 0; i < events.length; i++) {
			if (events[i].isSelected) {	//Sla eerst de layout op van de op dit moment geselecteerde event.
				events[i].layout = event_preview.get_layout(events[i]);
				event_preview.preview.innerHTML = "";
			}
			events[i].deselected();			//Deselecteer alle andere events
		}
		this.isSelected = true;
		this.event.style.backgroundColor = "CadetBlue"


		set_detail_pane(this);
		event_preview.set_layout(this.layout);
	}

	deselected() {
		this.isSelected = false;
		this.event.style.backgroundColor = "LightGrey"

	}

	setCanvas(canvas) {
		this.canvas = canvas;
	}

	get_name() {
		return this.name;
	}

	set_name(name) {
		this.name = name;
		this.name_div.innerHTML = this.name;
	}

	set_start_date(newDate) {
		this.start_date = newDate;
		this.update_event();
	}

	set_end_date(newDate) {
		this.end_date = newDate;
		this.update_event();
	}

	set_days() {

	}

	get_div() {
		return this.event;
	}
	update_event() {
		this.start_date_div.innerHTML = this.start_date;
		this.end_date_div.innerHTML = this.end_date;
	}
}


function set_detail_pane(event) {		//Set deze event als degene waarvan de layout wordt aangepast
	detail_pane.innerHTML = "";

	let detail_top_bar = document.createElement("div");
	detail_top_bar.id = "detail_top_bar";
	details.appendChild(detail_top_bar);

	let detail_name = document.createElement("input");		//Balk waar de naam in staat en aangepast kan worden
	detail_name.setAttribute("type", "text");
	detail_name.style.resize = "none";
	detail_name.style.backgroundColor = "Tomato";
	detail_name.id = "detail_name";
	detail_name.value = event.name;
	detail_top_bar.appendChild(detail_name);
	detail_name.addEventListener("change", ()=>{			//Update de naam van de event zodra er wat aan veranderd wordt
  		event.set_name(detail_name.value);
	});

	let detail_delete = document.createElement("button");	//Delete het plaatje of tekstvak waar het laatst op geklikt is
	detail_delete.id = "detail_delete";
	detail_delete.innerHTML = "Delete";
	detail_delete.addEventListener("click", () => {
		event_preview.delete_focused_element();
	});
	detail_top_bar.appendChild(detail_delete);


	let date_selection = document.createElement("div");		//De div waarin de vakken voor de data staan
	date_selection.id = "date_selection"
	date_selection.style.display = "none";
	detail_top_bar.appendChild(date_selection);

	let start_date = document.createElement("div");
	let message = document.createElement("p");
	message.innerHTML = "Begin datum:";
	message.className = "message";
	start_date.appendChild(message)
	let startDate = document.createElement("INPUT");
	startDate.setAttribute("type", "text");
	startDate.className = "response";
	start_date.appendChild(startDate);
	date_selection.appendChild(start_date);

	let end_date = document.createElement("div");
	message = document.createElement("p");
	message.innerHTML = "Eind datum:";
	message.className = "message";
	end_date.appendChild(message)
	let endDate = document.createElement("INPUT");
	endDate.setAttribute("type", "text");
	endDate.className = "response";
	end_date.appendChild(endDate);
	date_selection.appendChild(end_date);

	let confirmDate = document.createElement("button");	//Controleert of de data die ingevoerd zijn in het juiste formaat zijn en set ze dan als de datum van het event
	confirmDate.className = "confirmDate";
	confirmDate.innerHTML = "set date";
	date_selection.appendChild(confirmDate);
	confirmDate.onclick = () => {
		if (startDate.value.length == 10 && endDate.value.length == 10) {
			let startDateArr = startDate.value.split('/');
			let endDateArr = endDate.value.split('/');
			console.log(startDateArr, endDateArr);
			if (startDateArr.length == 3 && endDateArr.length == 3) {
				if (startDateArr[0].length == 2 && endDateArr[0].length == 2 &&
					startDateArr[1].length == 2 && endDateArr[1].length == 2 &&
					startDateArr[2].length == 4 && endDateArr[2].length == 4) {
					let resultStart = Date.parse(startDate.value);
					let resultEnd = Date.parse(endDate.value);
					console.log(resultStart, resultEnd);
					if (resultStart != NaN && resultEnd != NaN) {
						event.set_end_date(endDate.value);
						event.set_start_date(startDate.value);
						console.log(event);
					}
				}

			}
		}
	};

	let detail_date = document.createElement("button");		//Knop die het datum menu zichtbaar maakt
	detail_date.id = "detail_date";
	detail_date.innerHTML = "Datum";
	detail_date.addEventListener("click", () => {
		if (date_selection.style.display == "none") {
			date_selection.style.display = "block";
			date_selection.style.marginLeft = detail_date.style.left;
		} else {
			date_selection.style.display = "none";
		}
	});
	detail_top_bar.appendChild(detail_date);

	let save_details = document.createElement("button");		//Deze knop wordt niet meer gebruikt
	save_details.id = "detail_save";
	save_details.innerHTML = "Save";

	let add_image = document.createElement("button");			//Laat de gebruiker een plaatje uploaden
	add_image.id = "detail_save";
	add_image.innerHTML = "Afbeelding";
	detail_top_bar.appendChild(add_image);


	let add_element = document.createElement("button");			//Laat de gebruiker tekst invoeren
	add_element.id = "detail_add";
	add_element.innerHTML = "Tekst";
	detail_top_bar.appendChild(add_element);



	let background_color_button = document.createElement("button");
	background_color_button.id = "detail_color";
	background_color_button.innerHTML = "Kleur";
	detail_pane.picker = new CP(background_color_button);		//Maak een kleur palet waar de gebruiker de achtergrond kleur van de event kan kiezen
	detail_pane.picker.set(event.layout["background"]);
	detail_pane.picker.on("change", (color) => {
		event_preview.preview.style.backgroundColor = '#' + color;
	}, 'main-change');
	detail_top_bar.appendChild(background_color_button);







	event_preview = new preview(0.5625);
	details.appendChild(event_preview.get_div());


	add_element.addEventListener("click", () => {
		event_preview.add_empty_div();
	})
	add_image.addEventListener("click", () => {
		event_preview.add_image();
	})
}


class preview {	//Maakt een preview div met de meegegeven breedte/hoogte ratio
	constructor(ratio) {		//16:9 ratio -> 9/16=0.5625
		this.preview_wrapper = document.createElement("div");
		this.preview_wrapper.id = "preview_wrapper";		//Een wrapper zodat de juist verhouding behouden kan worden.


		this.preview = document.createElement("div");
		this.preview.id = "preview_body";
		this.preview.style.backgroundColor = "rgb(255,255,255)";
		this.preview_wrapper.appendChild(this.preview);

		this.nr_of_divs = 0;



		let temp_div = document.createElement("div");
		temp_div.style.width = "95%"
		temp_div.style.height = "95%"
		details.appendChild(temp_div);
		let availableWidth = temp_div.clientWidth;
		let availableHeight = temp_div.clientHeight;

		temp_div.outerHTML = "";


		if ((availableWidth / 16) * 9 > availableHeight) {
			let scale = availableHeight / (availableWidth * ratio);


			this.preview.style.width = (availableWidth * scale) + "px";
			this.preview.style.height = (availableHeight * scale) + "px";
		} else {
			this.preview.style.width = availableWidth + "px";
			this.preview.style.height = (availableWidth * ratio) + "px";
		}



	}

	get_div() {

		return this.preview_wrapper;
	}

	add_empty_div() {		//Voegt een leeg tekstvak toe
		this.nr_of_divs += 1;
		let new_element = document.createElement("textarea");
		new_element.className = "user_created"
		new_element.id = "div" + this.nr_of_divs.toString();
		new_element.style.zIndex = this.preview.children.length + 1;
		new_element.style.width = "100px";
		new_element.style.height = "100px";
		new_element.innerHTML = "Text " + this.nr_of_divs.toString();

		new_element.style.maxWidth = "calc(" + this.preview.clientWidth + "px - " + new_element.offsetLeft + "px)";	//De maximumbreedte en hoogte zodat het vak binnen de preview blijft.
		new_element.style.maxHeight = "calc(" + this.preview.clientHeight + "px - " + new_element.offsetTop + "px)";

		new_element.style.fontSize = parseInt(this.preview.clientWidth) / lineheight + "px"

		this.add_index_listener(new_element);		//Zorg dat het formaat kan worden aangepast en dat het vak kan worden versleept
		this.add_movement_listener(new_element);


		this.preview.appendChild(new_element)
	}

	add_image() {		//Voegt een afbeelding toe
		let file_selector = document.createElement('input');
		file_selector.id = "open_file"
		file_selector.setAttribute('type', 'file');
		file_selector.click();					//Open dialoog voor uploaden bestand
		file_selector.addEventListener("change", (evt) => {
			let tgt = evt.target || window.event.srcElement,
				files = tgt.files;

			if (FileReader && files && files.length) {		//kijk of er support is

				this.nr_of_divs += 1;
				let new_image = document.createElement("img");
				new_image.style.width = "100%";
				new_image.style.height = "100%";
				new_image.style.userSelect = "none";

				let image_wrapper = document.createElement("div");
				image_wrapper.className = "user_created"
				image_wrapper.id = "div" + this.nr_of_divs.toString();
				image_wrapper.style.zIndex = this.preview.children.length + 1;

				image_wrapper.style.width = "200px";
				image_wrapper.style.resize = "horizontal";

				image_wrapper.style.maxWidth = "calc(" + this.preview.clientWidth + "px - " + image_wrapper.offsetLeft + "px)";	//De maximumbreedte en hoogte zodat het plaatje binnen de preview blijft.
				image_wrapper.style.maxHeight = "calc(" + this.preview.clientHeight + "px - " + image_wrapper.offsetTop + "px)";



				let fr = new FileReader();
				fr.onload = async function () {
					new_image.src = fr.result;
					new_image.src = await uploadImage(fr.result);
					console.log(fr.result);
				}
				fr.onloadend = function () {
					//console.log('RESULT', fr.result)			//De image data
				}
				fr.readAsDataURL(files[0]);




				this.add_index_listener(image_wrapper);
				this.add_movement_listener(image_wrapper);

				image_wrapper.appendChild(new_image);
				this.preview.appendChild(image_wrapper);
			}
		});




	}

	delete_focused_element() {		//Verdwijderd het laatst geklikte vak
		for (let i = 0; i < this.preview.children.length; i++) {
			if (this.preview.children[i].style.zIndex == this.nr_of_divs) {
				this.preview.children[i].outerHTML = "";
				this.nr_of_divs -= 1;
				return;
			}
		}
	}

	add_index_listener(element) {		//Zet vak op voorgrond als er op geklikt wordt
		let temp_preview = this.preview
		element.addEventListener("mousedown", function (mouseEvent) {


			//On pressing the top bar, make this widget's zindex highest
			for (let i = 0; i < temp_preview.children.length; i++) {		//Subtract 1 of the zIndex of all widgets with a higher zIndex than the widget
				temp_preview.children[i].style.border = "1px dotted grey";
				if (temp_preview.children[i].style.zIndex > element.style.zIndex) {
					temp_preview.children[i].style.zIndex--;
				}
			}
			element.style.zIndex = temp_preview.children.length;		//Make this widgets zIndex highest.
			element.style.border = "1px solid black";
		});
	}

	add_movement_listener(element) {		//Laat het avk bewogen worden met de rechtermuisknop. Overgenomen uit de basiswidget
		let temp_preview = this.preview

		element.addEventListener("mousedown", function (mouseEvent) {		//Listener for presses on the top bar of the widget


			if (mouseEvent.buttons == 1) {
				console.log("LMB");
				if (mouseEvent.offsetX > parseInt(element.style.width.slice(0, -2)) - 20 && mouseEvent.offsetY > parseInt(element.style.height.slice(0, -2)) - 20) {
					console.log("preventing movement when resizing")
					return;
				}
			}
			if (mouseEvent.buttons == 2) {
				console.log("RMB");


				element.startMouseX = parseInt(mouseEvent.offsetX);		//Save the current position of the mouse
				element.startMouseY = parseInt(mouseEvent.offsetY);

				temp_preview.addEventListener("mouseup", mouseUp);				//Add a listener that removes the touchmove function when click is released
				temp_preview.addEventListener("mousemove", mouseMove);			//Add a listener that handles touch movements while touch is pressed
				temp_preview.addEventListener("mouseleave", mouseLeave, true);







				function mouseMove(mouseEvent) {				//Function that moves the widget according to finger movements
					console.log("move")


					let dx = parseInt(mouseEvent.offsetX) - element.startMouseX;		//Calculate difference in x and y since last touchEvent
					let dy = parseInt(mouseEvent.offsetY) - element.startMouseY;


					element.style.left = element.offsetLeft + dx + "px";	//Set the new position of the widget as the old position + change in touch position
					element.style.top = element.offsetTop + dy + "px";

					if (element.offsetLeft < 0) {		//Don't allow the widget to be moved off of the left or upper bound of the screen.
						element.style.left = 0 + "px"			//Moving the widget off of the right or bottom edge of the screen is not a problem as the screen can then be scrolled.
					}
					if (element.offsetTop < temp_preview.offsetTop) {
						element.style.top = temp_preview.offsetTop + "px"
					}
					if (element.offsetLeft + element.clientWidth > temp_preview.clientWidth) {
						element.style.left = (temp_preview.clientWidth - element.clientWidth) + "px";
					}
					if (element.offsetTop + element.clientHeight > temp_preview.offsetTop + temp_preview.clientHeight) {
						element.style.top = ((temp_preview.offsetTop + temp_preview.clientHeight) - element.clientHeight) + "px";
					}
					element.startMouseX = parseInt(mouseEvent.offsetX);				//Update starting mouse position for the next touchEvent
					element.startMouseY = parseInt(mouseEvent.offsetY);


					element.style.maxWidth = "calc(" + temp_preview.clientWidth + "px - " + element.offsetLeft + "px)";
					element.style.maxHeight = "calc(" + (temp_preview.offsetTop + temp_preview.clientHeight) + "px - " + element.offsetTop + "px)";
				}

				function mouseUp(mouseEvent) {				//Removes the movement listener upon touchEnd and then removes itself.
					temp_preview.removeEventListener("mouseup", mouseUp);
					temp_preview.removeEventListener("mousemove", mouseMove);
					temp_preview.removeEventListener("mouseleave", mouseLeave)
				}

				function mouseLeave(mouseEvent) {
					temp_preview.removeEventListener("mouseup", mouseUp);
					temp_preview.removeEventListener("mousemove", mouseMove);
					temp_preview.removeEventListener("mouseleave", mouseLeave)
				}
			}


		});
	}

	preview_event(layout, width) {		//Geeft een div met de preview
		console.log("previewing event");
		console.log(layout);
		let ret_div = document.createElement("div");

		let div_width = width;
		let div_height = (div_width / 16) * 9;
		ret_div.style.width = div_width + "px";
		ret_div.style.height = div_height + "px";
		ret_div.style.border = "1px solid black"





		for (let key in layout) {
			if (layout.hasOwnProperty(key)) {
				if (layout[key] != "name") {
					let div_layout = layout[key];

					if (key == "background") {

						ret_div.style.backgroundColor = layout[key];
						console.log("setting preview background");

					}


					if (div_layout["type"] == "textarea") {
						let text = document.createElement("div");
						text.id = key;
						text.style.position = "absolute";
						text.style.wordWrap = "break-word";
						text.style.backgroundColor = "rgba(255, 255, 255, 0)";
						text.style.fontSize = parseInt(ret_div.style.width.replace("px", "")) / lineheight + "px"
						console.log("font size: " + text.style.fontSize)




						text.style.left = (div_layout["left"] * div_width) + "px";
						text.style.top = (div_layout["top"] * div_height) + "px";
						text.style.width = (div_layout["width"] * div_width) + "px";
						text.style.height = (div_layout["height"] * div_height) + "px";;
						text.style.zIndex = div_layout["zIndex"];
						text.innerHTML = div_layout["value"];


						ret_div.appendChild(text);
					}

					if (div_layout["type"] == "img") {


						let image = document.createElement("img");
						image.style.width = "100%";
						image.style.height = "100%";
						image.style.userSelect = "none";
						image.src = div_layout["src"];


						let image_wrapper = document.createElement("div");
						image_wrapper.style.position = "absolute";
						image_wrapper.style.backgroundColor = "rgba(255, 255, 255, 0)";
						image_wrapper.id = key;
						image_wrapper.style.left = (div_layout["left"] * div_width) + "px";
						image_wrapper.style.top = (div_layout["top"] * div_height) + "px";
						image_wrapper.style.width = (div_layout["width"] * div_width) + "px";
						image_wrapper.style.zIndex = div_layout["zIndex"];


						image_wrapper.appendChild(image)
						ret_div.appendChild(image_wrapper);


					}


				}

			}

		}

		console.log("bg: " + ret_div.style.backgroundColor);

		return ret_div;
	}



	set_layout(layout) {		//Set de layout van de event voor de preview
		console.log("set_layout")
		console.log(layout);

		for (let key in layout) {
			if (layout.hasOwnProperty(key)) {
				if (layout[key] != "") {
					let div_layout = layout[key];


					if (key == "background") {

						detail_pane.picker.set(layout[key]);

					}
					if (div_layout["type"] == "textarea") {
						let text = document.createElement("textarea");
						text.id = key;
						text.className = "user_created"




						text.style.left = (div_layout["left"] * this.preview.clientWidth) + "px";
						text.style.top = ((div_layout["top"] * this.preview.clientHeight) + this.preview.offsetTop) + "px";
						text.style.width = (div_layout["width"] * this.preview.clientWidth + 2) + "px";
						text.style.height = ((div_layout["height"] * this.preview.clientHeight + 2)) + "px";;
						text.style.zIndex = div_layout["zIndex"];
						text.value = div_layout["value"];

						text.style.fontSize = parseInt(this.preview.clientWidth) / lineheight + "px"
						console.log("font size: " + text.style.fontSize)

						this.add_index_listener(text);
						this.add_movement_listener(text);

						text.style.maxWidth = "calc(" + (this.preview.clientWidth + 2) + "px - " + text.offsetLeft + "px)";
						text.style.maxHeight = "calc(" + (this.preview.clientHeight + 2) + "px - " + text.offsetTop + "px)";

						this.preview.appendChild(text);
						this.nr_of_divs += 1;
					}

					if (div_layout["type"] == "img") {


						let image = document.createElement("img");
						image.style.width = "100%";
						image.style.height = "100%";
						image.style.userSelect = "none";
						image.src = div_layout["src"];


						let image_wrapper = document.createElement("div");
						image_wrapper.className = "user_created"
						image_wrapper.id = key;
						image_wrapper.style.left = (div_layout["left"] * this.preview.clientWidth) + "px";
						image_wrapper.style.top = ((div_layout["top"] * this.preview.clientHeight) + this.preview.offsetTop) + "px";
						image_wrapper.style.width = (div_layout["width"] * this.preview.clientWidth + 2) + "px";
						image_wrapper.style.zIndex = div_layout["zIndex"];

						image_wrapper.style.resize = "horizontal";

						this.add_index_listener(image_wrapper);
						this.add_movement_listener(image_wrapper);

						image_wrapper.style.maxWidth = "calc(" + (this.preview.clientWidth + 2) + "px - " + image_wrapper.offsetLeft + "px)";
						image_wrapper.style.maxHeight = "calc(" + (this.preview.clientHeight + 2) + "px - " + image_wrapper.offsetTop + "px)";

						image_wrapper.appendChild(image)
						this.preview.appendChild(image_wrapper);

						this.nr_of_divs += 1;

					}


				}

			}

		}
	}

	get_layout(event) {		//Vraag de nieuwe event layout van de preview
		console.log(event);
		let layout = {
			"name": event.name,
			"imgURL": event.imgURL,
			"background": this.preview.style.backgroundColor,
			"startDate": event.start_date,
			"endDate": event.end_date
		};




		for (let i = 0; i < this.preview.children.length; i++) {
			if (this.preview.children[i].nodeName == "TEXTAREA") {
				this.preview.children[i].value = this.preview.children[i].value;

				let div_layout = {
					"type": "textarea",
					"left": (this.preview.children[i].offsetLeft / this.preview.clientWidth),
					"top": ((this.preview.children[i].offsetTop - this.preview.offsetTop) / this.preview.clientHeight),
					"width": (this.preview.children[i].clientWidth / this.preview.clientWidth),
					"height": (this.preview.children[i].clientHeight / this.preview.clientHeight),
					"zIndex": this.preview.children[i].style.zIndex,
					"value": this.preview.children[i].value
				};

				layout[this.preview.children[i].id] = div_layout;

			}
			if (this.preview.children[i].nodeName == "DIV") {


				let div_layout = {
					"type": "img",
					"left": this.preview.children[i].offsetLeft / this.preview.clientWidth,
					"top": (this.preview.children[i].offsetTop - this.preview.offsetTop) / this.preview.clientHeight,
					"width": this.preview.children[i].clientWidth / this.preview.clientWidth,

					"zIndex": this.preview.children[i].style.zIndex,
					"src": this.preview.children[i].children[0].src
				};


				layout[this.preview.children[i].id] = div_layout;
			}
		}

		console.log("get_layout:")

		console.log(layout);
		return layout;
	}
}



function getScrollbarWidth() {		//Geeft de breedte van een scrollbar

	// Creating invisible container
	const outer = document.createElement('div');
	outer.style.visibility = 'hidden';
	outer.style.overflow = 'scroll'; // forcing scrollbar to appear
	outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
	document.body.appendChild(outer);

	// Creating inner element and placing it in the container
	const inner = document.createElement('div');
	outer.appendChild(inner);

	// Calculating difference between container's full width and the child width
	const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

	// Removing temporary elements from the DOM
	outer.parentNode.removeChild(outer);

	return scrollbarWidth;

}


//add_event(new event(ctr))




function toCanvas(layout) {		//Maakt een canvas van een div
	return new Promise(prom => {
		html2canvas(document.querySelector("#" + layout)).then(res => {
			prom(res);
		});
	});
}

