class options_button
{
	constructor()
	{
		this.input_field = document.createElement("input");
		this.input_field.type = "image";
		this.input_field.src = "../assets/palette.png"
		this.input_field.className = "optionsButton";
		this.input_field.style.display = "block";
		let object = this;
		let picker = new CP(this.input_field);
		picker.set([0, 0, 1]);

		picker.on("change", function(color) {
			//this.source.value = 'kleur: #' + color;
			object.color = color;
			document.body.style.backgroundColor = '#' + color;
		}, 'main-change');

		var colors = ['012', '123', '234', '345', '456', '567', '678', '789', '89a', '9ab'], box;

		for (var i = 0, len = colors.length; i < len; ++i) {
			box = document.createElement('span');
			box.className = 'color-picker-box';
			box.title = '#' + colors[i];
			box.style.backgroundColor = '#' + colors[i];
			box.addEventListener("click", function(e) {
				picker.set(this.title);
				picker.fire("change", [this.title.slice(1)], 'main-change');
				e.stopPropagation();
			}, false);
			picker.self.firstChild.appendChild(box);
		}
	}

	get_color()
	{
		return this.color;
	}
	
	set_color(color)
	{
		this.color = color;
		document.body.style.backgroundColor = '#' + color;
	}
	
	get_button()
	{
		return this.input_field;
	}
}