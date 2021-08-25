class widget_classrooms extends base_widget
{
    constructor(name, id, width, height, startingXpos, startingYpos, allowChanges=false)
    {  
        if (name == null) {
            super();
            return;
        }
        super(name, id, width, height, startingXpos, startingYpos, allowChanges);
		// alle lokalen op volgorde, opgehaald van de rooster pagina
		this.classrooms = ["EXT","H.0.405","H.1.110","H.1.112","H.1.114","H.1.204","H.1.206","H.1.306","H.1.308","H.1.312","H.1.315","H.1.318","H.1.403","H.2.111","H.2.204","H.2.306","H.2.308","H.2.312","H.2.318","H.2.403","H.3.308","H.3.312","H.4.308","H.4.318","H.5.314-C120","H.5.314-T60","Pantry","RDM","RDM:ID.1.121","RDM:ID.1.211","W.0.116","WD.00.018","WD.00.026","WD.01.003","WD.01.016","WD.01.019","WD.02.002","WD.02.016","WD.02.019","WD.03.005","WD.03.033","WD.04.002","WD.04.016","WD.04.020","WD.05.002","WD.05.005","WD.05.013","WD.05.018","WN.01.014","WN.01.022","WN.01.023","WN.02.007","WN.02.017","WN.02.022","WN.02.026","WN.03.007","WN.03.017","WN.03.022","WN.05.025"];
		// coördinaten data voor alle klaslokalen.
		this.building_classrooms = 
		{
			"WN5":
			{
				"WN.05.025": [268, 85, 230, 12, 305, 161]
			},
			"WD5":
			{
				"WD.05.018": [84, 54, 8, 8, 162, 101],
				"WD.05.013": [210, 54, 163, 8, 256, 101],
				"WD.05.005": [53, 196, 8, 131, 100, 260],
				"WD.05.002": [189, 218, 102, 175, 283, 260]
			},
			"H5":
			{
				"H.5.314-T60": [270, 220, 211, 134, 317, 315],
				"H.5.314-C120": [140, 221, 72, 132, 210, 316]
			}
		}
		// de rooster uren
        this.rooster_uren = [
            ['8:30', '9:20'],
            ['9:20', '10:10'],
            ['10:30', '11:20'],
            ['11:20', '12:10'],
            ['12:10', '13:00'],
            ['13:00', '13:50'],
            ['13:50', '14:40'],
            ['15:00', '15:50'],
            ['15:50', '16:40'],
            ['17:00', '17:50'],
            ['17:50', '18:40'],
            ['18:40', '19:30'],
            ['19:30', '20:20'],
            ['20:20', '21:10'],
            ['21:10', '22:00']
        ];
		// in this.roosters worden alle roosters opgeslagen in een 5x15 array
        this.roosters = [];
        this.promises = [];
       
        this.canvas = document.createElement("canvas");
        this.canvas.style.display = 'block';
        this.canvas.setAttribute('width', width - 10);
        this.canvas.setAttribute('height', height - 65);
		// functie om de coördinaten van het scherm te kunnen halen om makkelijk klaslokalen toe te kunnen voegen
		this.canvas.onmousedown = (e)=>
		{
			console.log('' + (e.clientX - this.canvas.getBoundingClientRect().left) + ', ' + (e.clientY - this.canvas.getBoundingClientRect().top));
		}
        this.ctx = this.canvas.getContext('2d');
		this.current_building = 'WN5';
		this.classroom_image = new Image();
		
        /*this.class_options = document.createElement('select');
        for (let classroom of this.classrooms)
        {
            let class_option = document.createElement('option');
            class_option.value = classroom;
            class_option.text = classroom;
            this.class_options.add(class_option);
        }
        this.class_options.onchange = ()=>
		{
			this.text_holder.innerHTML = this.get_classroom_availability(this.class_options.value);
		};*/
		// hier worden dynamisch de optie knoppen gemaakt.
		this.building_options = document.createElement('select');
		this.floor_options = document.createElement('select');
		
		for (let building of ['WN', 'WD', 'H'])
        {
            let building_option = document.createElement('option');
            building_option.value = building;
            building_option.text = building;
            this.building_options.add(building_option);
        }
        this.building_options.onchange = ()=>
		{
			this.current_building = this.building_options.value + this.floor_options.value;
			this.load_building(this.current_building);
		};
		
		for (let floor of ['5', '4', '3', '2', '1', '0'])
        {
            let floor_option = document.createElement('option');
            floor_option.value = floor;
            floor_option.text = floor;
            this.floor_options.add(floor_option);
        }
        this.floor_options.onchange = ()=>
		{
			this.current_building = this.building_options.value + this.floor_options.value;
			this.load_building(this.current_building);
		};
		
        this.widget_body.appendChild(this.canvas);
        this.widget_body.appendChild(this.building_options);
		this.widget_body.appendChild(this.floor_options);
        this.get_roosters();
    }
   
    get_les_uur()
    {
		// pakt het huidige lesuur
        let current_time = new Date();
        for (let i = 0; i < this.rooster_uren.length; i++)
        {
            let compare_time = new Date(current_time.getFullYear(), current_time.getMonth(), current_time.getDate(), this.rooster_uren[i][0].split(':')[0], this.rooster_uren[i][0].split(':')[1]);
            if (current_time <= compare_time)
            {
                return i-1;
            }
        }
        return 0;
    }
 
    get_school_day()
    {
		// pakt de huidige schooldag. bijvoorbeeld maandag is 0 en dinsdag is 1
        let current_day = new Date().getDay();
        if (current_day == 0 || current_day == 6)
        {
            current_day = 1;
        }
        return --current_day;
    }
 
    get_classroom_availability(classroom)
    {
		// returned of het lokaal bezet of vrij is en tot wanneer
        let classroom_code = this.classrooms.indexOf(classroom);
        let uren = this.roosters[classroom_code];
        if (uren == undefined){return;}
        if (uren[this.get_les_uur()][this.get_school_day()] == 0)
        {
            for (let i = this.get_les_uur() + 1; i < 15; i++)
            {
                if (uren[i][this.get_school_day()] == 1)
                {
                    return ['Beschikbaar tot', this.rooster_uren[i][0]];
                    break;
                }
                if (i == 14) {return ['Hele dag', 'beschikbaar'];}
            }
        }
        if (uren[this.get_les_uur()][this.get_school_day()] == 1)
        {
            for (let i = this.get_les_uur() + 1; i < 15; i++)
            {
                if (uren[i][this.get_school_day()] == 0)
                {
                    return ['Bezet tot', this.rooster_uren[i-1][1]];
                    break;
                }
                if (i == 14) {return ['Hele dag', 'bezet'];}
            }
        }
    }
   
    get_roosters()
    {
        this.promises = [];
		let week_date = new Date(new Date().getFullYear(),0,1);
		var millisecsInDay = 86400000;
		let week_number = Math.ceil((((new Date() - week_date) /millisecsInDay) + week_date.getDay()+1)/7);
        for (let i = 0; i < this.classrooms.length; i++)
        {
            let promise = fetch('http://misc.hro.nl/roosterdienst/webroosters/CMI/kw4/' + week_number + '/r/r000' + (''+(i+1)).padStart(2, '0') + '.htm')
                .then(
                (response)=> {
                    if (response.status == 200)
                    {
                        response.text().then((data)=>
                        {
                            let uren =
                            [
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0],
                                [0,0,0,0,0]
                            ];
                            let rooster_element = document.createElement( 'html' );
                            rooster_element.innerHTML = data;
                            let parsed_rooster = rooster_element.getElementsByTagName('table')[0];
                            parsed_rooster.deleteRow(0);
                            for (let i = 0; i < parsed_rooster.rows.length; i++)
                            {
                                if (parsed_rooster.rows[i].cells.length == 0)
                                {
                                    parsed_rooster.deleteRow(i--);
                                    continue;
                                }
                                parsed_rooster.rows[i].deleteCell(0);
                                let added_rows = 0;
                                for (let j = 0; j < parsed_rooster.rows[i].cells.length; j++)
                                {
                                    if (parsed_rooster.rows[i].cells[j].innerHTML != '<table><tbody><tr><td></td></tr></tbody></table>')
                                    {
                                        let iterations = parsed_rooster.rows[i].cells[j].rowSpan/2;
                                        let missing_rows = 0;
                                        for (let l = 0; l <= j; l++)
                                        {
                                            while (uren[i][l+missing_rows-added_rows] == 1)
                                            {
                                                missing_rows++;
                                            }
                                        }
                                        for (let k = 0; k < iterations; k++)
                                        {
                                            uren[i+k][j+missing_rows-added_rows] = 1;
                                        }
                                        added_rows++;
                                    }
                                }
                            }
                            this.roosters[i] = uren;
                        });            
                    }
                }
                )
                .catch(function(err) {
                console.log('Fetch Error :-S', err);
                });
            this.promises.push(promise);
        }
        Promise.all(this.promises).then(values => 
		{
            this.load_building(this.current_building);
			window.setTimeout(()=>{ this.get_roosters(); }, 600000);
        });
    }
   
    make_new_widget(name, id, width, height, startingXpos, startingYpos, allowChanges)
    {
        return new widget_classrooms(name, id, width, height, startingXpos, startingYpos, allowChanges);
    }
	
	load_building(building)
	{
		this.ctx.textAlign = "center";
		if (this.classroom_image.src != ('../assets/classrooms/' + building + '.png'))
		{
			this.classroom_image = new Image();
			this.classroom_image.src = '../assets/classrooms/' + building + '.png';
			this.classroom_image.addEventListener('load', ()=>
			{
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.ctx.drawImage(this.classroom_image, 0, 0, this.canvas.width, this.canvas.height);
				for (let classroom in this.building_classrooms[this.current_building])
				{
					let availability = this.get_classroom_availability(classroom);
					if (availability == undefined) {setTimeout(()=>{ this.load_building(building); }, 100); break;}
					let draw_x = this.building_classrooms[this.current_building][classroom][0] / 390 * this.canvas.width;
					let draw_y = this.building_classrooms[this.current_building][classroom][1] / 325 * this.canvas.height;
					this.ctx.font = "10px Arial";
					
					this.ctx.beginPath();
					//this.ctx.arc(draw_x, draw_y, 30, 0, 2 * Math.PI, false);
					this.ctx.rect((this.building_classrooms[this.current_building][classroom][2] / 390 * this.canvas.width), 
						(this.building_classrooms[this.current_building][classroom][3] / 325 * this.canvas.height), 
						((this.building_classrooms[this.current_building][classroom][4] - this.building_classrooms[this.current_building][classroom][2]) / 390 * this.canvas.width), 
						((this.building_classrooms[this.current_building][classroom][5] - this.building_classrooms[this.current_building][classroom][3]) / 325 * this.canvas.height));
					if (availability[1] == "beschikbaar" || availability[0] == "Beschikbaar tot")
					{
						this.ctx.fillStyle = '#00ff0055';
					}
					else
					{
						this.ctx.fillStyle = '#ff000055';
					}
					this.ctx.fill();
					this.ctx.fillStyle = '#000000';
					this.ctx.font = "bold 10px Arial";
					this.ctx.fillText(classroom, draw_x, draw_y - 18);
					this.ctx.font = "10px Arial";
					this.ctx.fillText(availability[0], draw_x, draw_y - 6);
					if (availability[1] == "beschikbaar" || availability[1] == "bezet")
					{
						this.ctx.font = "10px Arial";
						this.ctx.fillText(availability[1], draw_x, draw_y + 6);
					}
					else
					{
						this.ctx.font = "15px Arial";
						this.ctx.fillText(availability[1], draw_x, draw_y + 10);
					}
				}
			}, false);
		}
		else
		{
			this.classroom_image.onload();
		}
	}
   
    resized()
    {
        super.resized()
        this.canvas.setAttribute('width', this.widget_body.clientWidth);
        this.canvas.setAttribute('height', this.widget_body.clientHeight - 25);
        this.load_building(this.current_building);
    }
}