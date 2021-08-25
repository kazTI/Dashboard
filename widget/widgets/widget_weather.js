class widget_weather extends base_widget
{
	update_weather(ctx)
	{
		fetch("http://api.openweathermap.org/data/2.5/weather?q=" + ctx.weatherloc + ",nl&units=metric&lang=nl&APPID=d4bb91e55e1ee01da58c8da2b5316bcf")
			.then(response=> {
				return response.json();
			})
			.then(data=> {
				// als de response een error code 404 heeft dan is de locatie niet geldig
				if (data["cod"] == "404")
				{
					ctx.open_settings(ctx, "De ingevoerde locatie kon niet gevonden worden");
				}
				else
				{
					// de icon URL voor de icon. deze icons zitten in de assets\weather_icons map
					let icon_url = "..\\assets\\weather_icons\\" + data["weather"][0]["icon"] + ".svg";
					// HTML code voor de icon
					let icon = "<div style='width: 100%; text-align: center;'><img src='" + icon_url + "' style='width: 250px; margin: -50px; pointer-events: none;'></img></div>";
					// HTML code voor de weer descriptie onder de icon
					let weather_description = "<div style='width: 100%; text-align: center;'>" + data["weather"][0]["description"] + "</div>";
					// HTML code voor de temperatuur laten zien
					let temp = "<div style='font-size: 350%; width: 100%; text-align: center; padding-left: 8px'>" + (data["main"]["temp"]).toFixed(0) + "<sup style='font-size: 40%;'>\xB0C</sup></div>"
					// widget body leeg maken en daarna alle onderdelen erin doen
					ctx.widget_body.innerHTML = "";
					// HTML code voor de weer locatie
					ctx.widget_body.innerHTML += "<div style='font-size: 70%; width: 100%; text-align: right; margin-bottom: -8px;'>" + ctx.weatherloc + "</div>";
					ctx.widget_body.innerHTML += icon;
					ctx.widget_body.innerHTML += weather_description;
					ctx.widget_body.innerHTML += temp;
				}
			});
	}
	
	open_settings(ctx, err)
	{
		// stop de update weather tijdelijk
		clearInterval(ctx.weather_interval);
		// als er een error is met de ingevoerde locatie moet de locatie niet naar de locatie met een error gaan
		if (err != "")
		{
			ctx.weatherloc = ctx.prev_weatherloc;
		}
		ctx.widget_body.innerHTML = "Voer uw locatie in<br><br>";
		
		// maak de text field aan om de locatie in te vullen
		ctx.text_field = document.createElement("input");
		ctx.text_field.value = "";
		ctx.text_field.placeholder = ctx.weatherloc;
		//ctx.text_field.addEventListener("keypress", (ev)=>{console.log(ev);if (ev == 13){this.update_weather(this);}});
		ctx.widget_body.appendChild(ctx.text_field);
		// bind een keyboard aan de input field
		$("#" + ctx.widget.id + " > div.body > input").mlKeyboard({
			layout: 'en_US',
			close_speed: 10
		});
		ctx.widget_body.appendChild(document.createElement("br"));
		ctx.widget_body.appendChild(document.createElement("br"));
		
		// maak de oplaan knop aan
		ctx.settings_save = document.createElement("button");
		ctx.settings_save.innerHTML = "Opslaan";
		// event voor wanneer er op de knop gedrukt wordt
		ctx.settings_save.onclick = ()=>{
			//check voor foute input
			if (ctx.text_field.value.includes("&"))
			{
				ctx.open_settings(ctx, "De '&' toets mag niet gebruikt worden");
			}
			else if (ctx.text_field.value.startsWith(" "))
			{
				ctx.open_settings(ctx, "De locatie mag niet met een spatie beginnen")
			}
			else if (ctx.text_field.value.includes(","))
			{
				ctx.open_settings(ctx, "De locatie mag geen komma bevatten")
			}
			else
			{
				ctx.prev_weatherloc = ctx.weatherloc;
				// als de input leeg is blijft weatherloc hetzelfde
				ctx.weatherloc = (ctx.text_field.value!="")?ctx.text_field.value:ctx.weatherloc;
				// call update weather weer en zet een interval voor elke 30 seconde
				this.update_weather(this);
				this.weather_interval = setInterval(()=>(this.update_weather(this)), 30000);
			}
			
		}
		ctx.widget_body.appendChild(ctx.settings_save);
		
		// laat error message zien als die is meegegeven
		if (err != "")
		{
			ctx.error_message = document.createElement("div");
			ctx.error_message.style.color = "red";
			ctx.error_message.innerHTML = err;
			ctx.widget_body.appendChild(ctx.error_message);
		}
	}

	constructor(name, id, width, height, startingXpos, startingYpos, allowChanges=false)
	{	
		if (name == null) {
            super();
            return;
        }
		super(name, id, width, height, startingXpos, startingYpos, allowChanges);
		this.widget_body.innerHTML = "laden...";
		this.prev_weatherloc = "Rotterdam";
		this.weatherloc = "Rotterdam";
		this.update_weather(this);
		this.weather_interval = setInterval(()=>(this.update_weather(this)), 30000);
		
		this.settings_button.onclick = ()=>{this.open_settings(this, "")};
	}
	make_new_widget(name, id, width, height, startingXpos, startingYpos, allowChanges)
    {
        return new widget_weather(name, id, width, height, startingXpos, startingYpos, allowChanges);
	}
	
	set_settings(object, config)
	{
		object.weatherloc = config.weatherloc;
		object.update_weather(object);
	}

	get_settings(object)
	{
		return {"weatherloc": object.weatherloc}
	}
}