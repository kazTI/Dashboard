class widget_shadowall extends base_widget {
    constructor(name, id, width, height, startingXpos, startingYpos, allowChanges = false) {
        if (name == null) {
            super();
            return;
        }
        super(name, id, width, height, startingXpos, startingYpos, allowChanges);
        this.id = id;
        this.board = 2;
        
        //maakt alle divs en buttons en voegt ze toe aan de widget
        this.buttonOn = document.createElement('button');
        this.buttonOff = document.createElement('button');
        this.disco = document.createElement('button');

        this.buttonOn.innerHTML = 'on';
        this.buttonOff.innerHTML = 'off';
        this.disco.innerHTML = 'disco';

        this.buttonOn.onclick = () => {
            this.state_shadowwall('On');
        };
        this.buttonOff.onclick = () => {
            this.state_shadowwall('Off');
        };
        this.disco.onclick = () => {
            this.line = 0;
            this.discoInterval = setInterval(()=>{
                this.line_shadowwall(this.line,this.board);
                this.line++;
                if(this.line >= 11)
                {
                    this.line = 0;
                }
            },100);
            this.discoTimer = setTimeout(()=>{
                clearInterval(this.discoInterval);
                console.log("disco off");
            },10000);
        };
        this.board_button = document.createElement('button');
        this.board_button.innerHTML = 'Wall: ' + this.board;
		this.buttonOn.style.marginRight = "4px";
        this.buttonOff.style.marginRight = "4px";
        this.disco.style.marginRight = "4px";
		this.board_button.style.marginBottom = "4px";
		this.board_button.onclick = () => 
		{
			if (this.board == 1)
			{
				this.board = 2;
			}
			else
			{
				this.board = 1;
			}
			this.board_button.innerHTML = "Wall: " + this.board;
        }

        this.widget_body.appendChild(this.buttonOn);
        this.widget_body.appendChild(this.buttonOff);
        //this.widget_body.appendChild(this.disco);
        this.widget_body.appendChild(this.board_button);
		this.widget_body.appendChild(document.createElement('br'));
		for (let i = 0; i < 11; i++)
		{
			let wall_line = document.createElement('button');
			wall_line.innerHTML = i;
			wall_line.onclick = () => 
			{
				this.line_shadowwall(i, this.board);
			}
			wall_line.style.height = '150px';
			wall_line.style.width = '25px';
			wall_line.style.marginRight = '1px';
			this.widget_body.appendChild(wall_line);
		}
    }
    make_new_widget(name, id, width, height, startingXpos, startingYpos, allowChanges) {
        return new widget_shadowall(name, id, width, height, startingXpos, startingYpos, allowChanges);
    }

    //stuurt naar de node server of de wall aan of uit moet
    state_shadowwall(state){
        let request = new XMLHttpRequest();
        request.open('GET', 'http://localhost/turnShadow'+state, true);
        request.onload = function () {
            console.log(this.response);
        };
        request.send();
    }
    //stuurt naar de node server welke lijn aan moet van welk bord
	line_shadowwall(line, board)
	{
        let request = new XMLHttpRequest();
        request.open('GET', 'http://localhost/setLine?line='+line+'&board='+board, true);
        request.onload = function () {
            console.log(this.response);
        };
        request.send();
    }
}