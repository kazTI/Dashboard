class background_image_button
{
	constructor()
	{
		this.button_container = document.createElement("div");
		this.input_field = document.createElement("input");
		this.input_field.type = "image";
		this.input_field.src = "../assets/background_image.png"
		this.input_field.className = "optionsButton";
		this.input_field.style.display = "block";
		this.input_field.onclick = ()=>
		{
			if (this.fields_container.style.visibility == "hidden")
			{
				this.fields_container.style.visibility = "visible";
				this.fields_container.style.display = "";
			}
			else
			{
				this.fields_container.style.visibility = "hidden";
				this.fields_container.style.display = "none";
			}
		}
		this.button_container.appendChild(this.input_field);
		this.fields_container = document.createElement("div");
		this.fields_container.style.visibility = "hidden";
		this.fields_container.style.display = "none";
		this.button_container.appendChild(this.fields_container);
		this.image_style = document.createElement("select");
		for (let img_style of ['Rek', 'Herhaal', 'Standaard'])
        {
            let select_option = document.createElement('option');
            select_option.value = img_style;
            select_option.text = img_style;
            this.image_style.add(select_option);
        }
		this.image_style.onchange = ()=>
		{
			console.log("changed to " + this.image_style.value);
			if (this.image_style.value == "Rek")
			{
				document.body.style.backgroundRepeat = "no-repeat";
				document.body.style.backgroundSize = "100% 100%";
			}
			else if (this.image_style.value == "Herhaal")
			{
				document.body.style.backgroundRepeat = "repeat";
				document.body.style.backgroundSize = "";
			}
			else
			{
				document.body.style.backgroundRepeat = "no-repeat";
				document.body.style.backgroundSize = "";
			}
		}
		this.fields_container.appendChild(this.image_style);
		this.image_url = document.createElement("input");
		this.image_url.placeholder = "Image URL of Imgur ID";
		window.setTimeout(()=>{this.image_url.value = document.body.style.backgroundImage.substring(5).slice(-1000, -2);}, 1000);
		this.image_url.onblur = ()=>
		{
			if (this.image_url.value.length == 7)
			{
				document.body.style.backgroundImage = "url(https://i.imgur.com/" + this.image_url.value + ".png)";
			}
			else
			{
				document.body.style.backgroundImage = "url(" + this.image_url.value + ")";
			}
		}
		this.fields_container.appendChild(document.createElement("br"));
		this.fields_container.appendChild(this.image_url);
		window.setTimeout(()=>
		{
			$("#sidebarslideout > div:nth-child(2) > div > input").mlKeyboard({
				layout: 'en_US',
				close_speed: 10
			});
		}, 1000)
	}
	
	get_button()
	{
		return this.button_container;
	}
}