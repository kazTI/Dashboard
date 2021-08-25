

class base_widget {
	/*
	 *	name			The name to be displayed on the top bar of the widget.
	 *	id				The html/css-id that will be used to identify members of this widget.
	 *					Id's of all widgets must be unique for the dashboard to function correctly.
	 *	width, height	The starting width and height of the widget
	 *	startingX,Ypos	The starting x and y position of the widget. Top left corner is 0,0
	 *	allowChanges	Optional parameter that defaults to false.
	 *					If true, a user can move and resize a widget and can see the button for settings.
	 */
	constructor(name, id, width, height, startingXpos, startingYpos, allowChanges = false) {
		if (name != null) {
			//Settings
			let touchscreen = false;		//Set this to true if using a touchscreen
			this.touchscreen = touchscreen;
			let minWidth = 150;				//Minimum width for all widgets
			let minHeight = 60;			//Minimum height for all widget

			let touchstart = "touchstart";	//Default to using touch events for eventlisteners
			let touchmove = "touchmove";
			let touchend = "touchend";
			if (!touchscreen) {				//If not using a touchscreen, switch to mouseEvents for eventlisteners
				touchstart = "mousedown";
				touchmove = "mousemove";
				touchend = "mouseup";
			}

			if (width < minWidth) {			//Check if minimum width is exceeded
				width = minWidth;
			}
			if (height < minHeight) {		//Check if minimum height is exceeded
				height = minHeight;
			}

			//Create the outermost div of the widget. This div IS the widget.
			this.widget = document.createElement("div");
			this.widget.className = "widget";
			this.widget.id = id;
			this.widget.style.width = width + "px ";
			this.widget.style.height = height + "px ";
			this.widget.style.position = "absolute";
			this.widget.style.left = startingXpos + "px";
			this.widget.style.top = startingYpos + "px";
			this.widget.style.zIndex = container.children.length + 1;	//Always place a new widget on top (highest zIndex)
			this.deleted = false;
			this.allowChanges = allowChanges;
			this.nextWidget = null;
			this.prevWidget = null;
			this.created = true;


			//Create the div for the red top bar of the widget
			this.top_bar = document.createElement("div");
			this.top_bar.className = "widgetTopBar";

			//A wrapper around the div for the name of the widget. Allows for easier positioning of the name div
			this.name_wrapper = document.createElement("p");
			this.name_wrapper.className = "widgetNameWrapper";

			//Create the paragraph element that contains the name of the widget
			this.widget_name = document.createElement("p");
			this.widget_name.className = "widgetName";
			this.widget_name.innerHTML = name;
			this.widget_name.widget = this.widget;


			//Create icon/button for settings
			this.menu = document.createElement("button");
			this.menu.className = "widgetSettings";
			this.menu.innerHTML = '<img src="../assets/settings.png" style="height:100%;width:100%;" />';	//Use image in the button
			this.menu.addEventListener('click', function () {			//On clicking the button, show the dropdown menu of this widget
				var elem = document.getElementById(id + "dropdown");	//Get the div that is this widget's dropdown menu
				if (elem == null) {		//Do nothing if menu doesn't exist.
					return;
				}
				if (elem.style.display === 'none') {				//Toggle display
					elem.style.display = "inline-block";
				} else {
					elem.style.display = "none";
				}
			});

			if (allowChanges) {		//Add the settnigs button if changes are allowed
				this.top_bar.appendChild(this.menu);
				this.widget_name.addEventListener(touchstart, function (touchEvent) {		//Listener for presses on the top bar of the widget
					if (touchscreen) {		//Use the first finger touch as click if using a touchscreen
						touchEvent = touchEvent.touches[0];
					}


					//On pressing the top bar, make this widget's zindex highest
					for (let i = 0; i < container.children.length; i++) {		//Subtract 1 of the zIndex of all widgets with a higher zIndex than the widget
						if (container.children[i].style.zIndex > this.widget.style.zIndex) {
							container.children[i].style.zIndex--;
						}
					}
					this.widget.style.zIndex = container.children.length;		//Make this widgets zIndex highest.


					this.startMouseX = parseInt(touchEvent.clientX);		//Save the current position of the mouse
					this.startMouseY = parseInt(touchEvent.clientY);

					window.addEventListener(touchend, mouseUp);				//Add a listener that removes the touchmove function when click is released
					window.addEventListener(touchmove, mouseMove);			//Add a listener that handles touch movements while touch is pressed

					let temp = this;							//Create temporary variable to get over the scope change of the word 'this' in the function mouseMove.

					function mouseMove(touchEvent) {				//Function that moves the widget according to finger movements
						if (touchscreen) {						//Use the first finger touch as click if using a touchscreen
							touchEvent = touchEvent.touches[0];
						}

						var dx = parseInt(touchEvent.clientX) - temp.startMouseX;		//Calculate difference in x and y since last touchEvent
						var dy = parseInt(touchEvent.clientY) - temp.startMouseY;
						temp.widget.style.left = temp.widget.offsetLeft + dx + "px";	//Set the new position of the widget as the old position + change in touch position
						temp.widget.style.top = temp.widget.offsetTop + dy + "px";
						if (temp.widget.offsetLeft < 0) {		//Don't allow the widget to be moved off of the left or upper bound of the screen.
							temp.widget.style.left = 0			//Moving the widget off of the right or bottom edge of the screen is not a problem as the screen can then be scrolled.
						}
						if (temp.widget.offsetTop < 0) {
							temp.widget.style.top = 0
						}
						temp.startMouseX = parseInt(touchEvent.clientX);				//Update starting mouse position for the next touchEvent
						temp.startMouseY = parseInt(touchEvent.clientY);
					}

					function mouseUp(touchEvent) {				//Removes the movement listener upon touchEnd and then removes itself.
						window.removeEventListener(touchend, mouseUp);
						window.removeEventListener(touchmove, mouseMove);
					}
				});



			}
			this.name_wrapper.appendChild(this.widget_name)
			this.top_bar.appendChild(this.name_wrapper)


			//Create the div that contains the buttons in the dropdown settings menu
			this.dropdown = document.createElement("div");
			this.dropdown.className = "dropdown";
			this.dropdown.id = id + "dropdown";
			this.dropdown.style.display = "none";		//Make invisible by default
			this.top_bar.appendChild(this.dropdown)


			//Create button that allows for changing the widget's size
			this.resizing = false;					//Make default not in resizing mode
			this.size_button = document.createElement("button");
			this.size_button.className = "menuButton";
			this.size_button.id = id + "sizeButton";
			this.size_button.innerHTML = "Formaat wijzigen";
			this.size_button.addEventListener('click', () => {
				let temp = this;		//Create temporary variable that allows for handling the change of scope of 'this' in the multiple functions below
				let click_width = 30;	//The amount of pixels that a press may be outside of the border of the widget to still register as clicking ON the border
				//A value of 30 means clicks 30 pixels outside the widget will still move the widget borders


				temp.dropdown.style.display = "none";	//Make the dropdown menu invisible again

				function stopResizing() {				//Function that removes border and listeners for resizing
					temp.resizing = false;
					temp.widget.style.outline = "none";

					temp.resized();

					window.removeEventListener(touchstart, mouseDown);
					window.removeEventListener(touchstart, mouseDown);
					removeListeners();
				}
				function startResizing() {				//Function that adds border and listeners for resizing
					temp.resizing = true;
					temp.widget.style.outline = "5px green solid";
					window.addEventListener(touchstart, mouseDown, { once: true });
				}


				function touchMoveRight(touchEvent) {	//Function to be called if the right border was pressed. Changes only the widget's right border.
					if (touchscreen) {					//Use the first finger touch as click if using a touchscreen
						touchEvent = touchEvent.touches[0];
					}


					var dx = parseInt(touchEvent.clientX) - temp.start_right;		//Calculate the change in finger position

					temp.widget.style.width = temp.widget.clientWidth + dx + "px";	//Add the change in finger position to the border position
					if (temp.widget.clientWidth < minWidth) {						//Check if the widget is still bigger than the minimum size
						temp.widget.style.width = minWidth + "px";
					}
					temp.resized();

					temp.start_right = parseInt(touchEvent.clientX);				//Update the finger starting position for the next touchEvent
				}
				function touchMoveBottom(touchEvent) {	//Function to be called if the bottom border was pressed. Changes only the widget's bottom border.
					if (touchscreen) {					//Use the first finger touch as click if using a touchscreen
						touchEvent = touchEvent.touches[0];
					}


					var dy = parseInt(touchEvent.clientY) - temp.start_bottom;		//Calculate the change in finger position

					temp.widget.style.height = temp.widget.clientHeight + dy + "px";//Add the change in finger position to the border position
					if (temp.widget.clientHeight < minHeight) {						//Check if the widget is still bigger than the minimum size
						temp.widget.style.height = minHeight + "px";
					}
					temp.resized();

					temp.start_bottom = parseInt(touchEvent.clientY);				//Update the finger starting position for the next touchEvent
				}
				function touchMoveLeft(touchEvent) {	//Function to be called if the left border was pressed. Changes only the widget's left border.
					if (touchscreen) {				//Use the first finger touch as click if using a touchscreen
						touchEvent = touchEvent.touches[0];
					}


					var dx = parseInt(touchEvent.clientX) - temp.start_left;		//Calculate the change in finger position

					temp.widget.style.left = temp.widget.offsetLeft + dx + "px";	//Update the position of the widget to offset the chagne in width
					temp.widget.style.width = temp.widget.clientWidth - dx + "px";	//Update the width of the widget

					if (temp.widget.clientWidth < minWidth) {						//Check if the widget is still bigger than the minimum size
						temp.widget.style.left = temp.widget.offsetLeft - dx + "px";
						temp.widget.style.width = minWidth + "px";
					}
					if (temp.widget.offsetLeft < 0) {								//Check if the widget is not past the leeft screen edge
						temp.widget.style.left = 0
						temp.widget.style.width = temp.widget.clientWidth + dx + "px";
					}
					temp.resized();

					temp.start_left = parseInt(touchEvent.clientX);					//Update the finger starting position for the next touchEvent
				}
				function touchMoveTop(touchEvent) {	//Function to be called if the top border was pressed. Changes only the widget's top border.
					if (touchscreen) {				//Use the first finger touch as click if using a touchscreen
						touchEvent = touchEvent.touches[0];
					}


					var dy = parseInt(touchEvent.clientY) - temp.start_top;		//Calculate the change in finger position

					temp.widget.style.top = temp.widget.offsetTop + dy + "px";	//Update the position of the widget to offset the chagne in height
					temp.widget.style.height = temp.widget.clientHeight - dy + "px";	//Update the height of the widget

					if (temp.widget.clientHeight < minHeight) {						//Check if the widget is still bigger than the minimum size
						temp.widget.style.top = temp.widget.offsetTop - dy + "px";
						temp.widget.style.height = minHeight + "px";
					}
					if (temp.widget.offsetTop < 0) {								//Check if the widget is not past the upper screen edge
						temp.widget.style.top = 0
						temp.widget.style.height = temp.widget.clientHeight + dy + "px";
					}
					temp.resized();

					temp.start_top = parseInt(touchEvent.clientY);					//Update the finger starting position for the next touchEvent
				}


				function touchEnd(touchEvent) {			//Function that gets rid of all listeners for changing the widget's size, then adds a new listener for finger presses on a border
					removeListeners();
					window.addEventListener(touchstart, mouseDown, { once: true });
				}

				function removeListeners() {
					window.removeEventListener(touchmove, touchMoveRight);
					window.removeEventListener(touchmove, touchMoveBottom);
					window.removeEventListener(touchmove, touchMoveLeft);
					window.removeEventListener(touchmove, touchMoveTop);
					window.removeEventListener(touchend, touchEnd);
				}


				function mouseDown(touchEvent) {			//Adds the correct touchmove listeners when a border is pressed
					if (touchscreen) {		//Use the first finger touch as click if using a touchscreen
						touchEvent = touchEvent.touches[0];
					}

					let borderPressed = false;

					if (temp.widget.offsetLeft + temp.widget.clientWidth < touchEvent.clientX		//CHeck if press is on right border
						&&
						touchEvent.clientX < temp.widget.offsetLeft + temp.widget.clientWidth + click_width
						&&
						temp.widget.offsetTop - click_width < touchEvent.clientY
						&&
						touchEvent.clientY < temp.widget.offsetTop + temp.widget.clientHeight + click_width) {

						temp.start_right = parseInt(touchEvent.clientX);		//Add listeners
						window.addEventListener(touchmove, touchMoveRight);
						window.addEventListener(touchend, touchEnd);
						borderPressed = true;
					}
					if (temp.widget.offsetTop + temp.widget.clientHeight < touchEvent.clientY	//Check if press is on bottom border
						&&
						touchEvent.clientY < temp.widget.offsetTop + temp.widget.clientHeight + click_width
						&&
						temp.widget.offsetLeft - click_width < touchEvent.clientX
						&&
						touchEvent.clientX < temp.widget.offsetLeft + temp.widget.clientWidth + click_width) {

						temp.start_bottom = parseInt(touchEvent.clientY);		//Add listeners
						window.addEventListener(touchmove, touchMoveBottom);
						window.addEventListener(touchend, touchEnd);
						borderPressed = true;
					}
					if (temp.widget.offsetLeft - click_width < touchEvent.clientX				//Check if press is on left border
						&&
						touchEvent.clientX < temp.widget.offsetLeft
						&&
						temp.widget.offsetTop - click_width < touchEvent.clientY
						&&
						touchEvent.clientY < temp.widget.offsetTop + temp.widget.clientHeight + click_width) {

						temp.start_left = parseInt(touchEvent.clientX);			//Add listeners
						window.addEventListener(touchmove, touchMoveLeft);
						window.addEventListener(touchend, touchEnd);
						borderPressed = true;
					}
					if (temp.widget.offsetTop - click_width < touchEvent.clientY	//Check if press is on bottom border
						&&
						touchEvent.clientY < temp.widget.offsetTop
						&&
						temp.widget.offsetLeft - click_width < touchEvent.clientX
						&&
						touchEvent.clientX < temp.widget.offsetLeft + temp.widget.clientWidth + click_width) {

						temp.start_top = parseInt(touchEvent.clientY);		//Add listeners
						window.addEventListener(touchmove, touchMoveTop);
						window.addEventListener(touchend, touchEnd);
						borderPressed = true;
					}

					if (!borderPressed) {		//Stop resing if no border was pressed.
						stopResizing();
					}

				}


				if (temp.resizing) {	//If button is pressed, toggle resizing
					stopResizing();
				} else {
					startResizing();
				}

			});
			this.dropdown.appendChild(this.size_button);

			//Create button for widget settings. Starting listener only hides dropdown again, other functionality must be implemented by derived classes
			this.settings_button = document.createElement("button");
			this.settings_button.className = "menuButton";
			this.settings_button.id = id + "settingsButton";
			this.settings_button.innerHTML = "Instellingen";
			this.settings_button.addEventListener('click', () => {
				this.dropdown.style.display = "none";
			});
			this.dropdown.appendChild(this.settings_button);

			//Create button for selecting the widget background color
			this.background_color_button = document.createElement("button");
			this.background_color_button.className = "menuButton";
			this.background_color_button.id = id + "backgroundColorButton";
			this.background_color_button.innerHTML = "Widget achtergrond";
			this.picker = new CP(this.background_color_button);
			this.picker.set([0, 0, 0.945]);
			this.picker.on("change", (color) => {
				this.widget.style.backgroundColor = '#' + color;
			}, 'main-change');
			this.dropdown.appendChild(this.background_color_button);

			//Create button for selecting the widget top bar color
			this.topbar_background_color_button = document.createElement("button");
			this.topbar_background_color_button.className = "menuButton";
			this.topbar_background_color_button.id = id + "topbarbackgroundColorButton";
			this.topbar_background_color_button.innerHTML = "Top bar achtergrond";
			this.toppicker = new CP(this.topbar_background_color_button);
			this.toppicker.set([345, 99.6, 87.5]);
			this.toppicker.on("change", (color) => {
				this.top_bar.style.backgroundColor = '#' + color;
				this.menu.style.backgroundColor = '#' + color;
			}, 'main-change');
			this.dropdown.appendChild(this.topbar_background_color_button);

			//Create button for removing the widget
			this.remove_button = document.createElement("button");
			this.remove_button.className = "menuButton";
			this.remove_button.id = id + "removeButton";
			this.remove_button.innerHTML = "Widget verwijderen";
			this.remove_button.widget = this.widget;
			this.remove_button.addEventListener('click', () => {
				this.dropdown.style.display = "none";		//Hide dropdown
				for (let i = 0; i < container.children.length; i++) {	//Update the zIndex of all widgets that remain
					if (container.children[i].style.zIndex > this.widget.style.zIndex) {
						container.children[i].style.zIndex--;
					}
				}
				//this.widget.outerHTML = "";				//Setting outer html to nothing is the same as removing the widget
				this.remove_widget_from_screen();
				this.deleted = true;
			});
			this.dropdown.appendChild(this.remove_button);



			//Create the body of the widget. In the base widget it is empty. Contents must be added by derived classes.
			this.widget_body = document.createElement("div");
			this.widget_body.className = "body";

			// Add top bar and body content to the container
			this.widget.appendChild(this.top_bar);
			this.widget.appendChild(this.widget_body);
		}
		else this.created = false;
	}

	get_settings(object) {
		return;
	}

	set_settings(object, config) {
		return;
	}

	resized() {
		//called when the widget is resized
		return;
	}

	get_widget()	//Returns the actual widget element
	{
		return this.widget;
	}
	make_new_widget(name, id, width, height, startingXpos, startingYpos, allowChanges = false) {
		return;
	}
	create_next_widget(name, id, width, height, startingXpos, startingYpos, allowChanges = false, object, index) {
		if(this.nextWidget == null) {
			this.nextWidget = this.make_new_widget(name, id+index, width, height, startingXpos, startingYpos, allowChanges, object);
			this.nextWidget.prevWidget = this;
			return this.nextWidget;
		}
		else {
			index++;
			return this.nextWidget.create_next_widget(name, id, width, height, startingXpos, startingYpos, allowChanges, object, index);
		}
	}
	set_next_widget(widget)
	{
		this.nextWidget = widget;
	}
	remove_all_widgets_from_screen()
	{
		if(this.nextWidget != null)
		{
			this.nextWidget.remove_all_widgets_from_screen();
		}
		if(this.widget != null)
		{
			this.widget.parentNode.removeChild(this.widget);
		}
	}
	remove_widget_from_screen()
	{
		if(this.nextWidget != null) this.nextWidget.prevWidget = this.prevWidget;
		if(this.prevWidget != null) this.prevWidget.nextWidget = this.nextWidget;
		this.nextWidget = null;
		this.prevWidget = null;
		this.clear();
		if(this.widget != null)
		{
			this.widget.parentNode.removeChild(this.widget);
		}
	}
	check_visible()
	{
		return this.deleted;
	}
	clear_all()
	{
		if(this.nextWidget != null)
		{
			this.nextWidget.clear_all();
		}
		this.clear();
	}
	clear()
	{
		//removes all unwanted timers and requests
		return;
	}

	get_allow_changes()
	{
		return this.allowChanges;
	}

	set_background_color(newColor)
	{
		//this.widget.style.backgroundColor = '#' + newColor;
		this.picker.set([newColor.r,newColor.g,newColor.b]);
	}

	get_position()
	{
		let x = this.widget.style.left;
		let y = this.widget.style.top;
		x = parseInt(x.slice(0,-2))
		y = parseInt(y.slice(0,-2))
		return {"x":x, "y":y};
	}
}

