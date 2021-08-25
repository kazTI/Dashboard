var temp_config = "";

var event_fired = 0;



class sidebar
{
	constructor()
	{
		this.sidebar = document.createElement("div");
		this.sidebar.id ="sidebar";

		this.button = document.createElement("button");
		this.button.id = "sidebarbutton";
		this.button.innerHTML = '<img src="../assets/settings.png" style="height:100%;width:100%;" />';
		this.button.addEventListener('click', ()=>{
			if (this.slideout.style.display == "block") {
				this.slideout.style.display = "none";
				this.sidebar.style.backgroundColor = "transparent";
				this.sidebar.style.height = "50px";
			} else {
				this.slideout.style.display = "block";
				this.sidebar.style.backgroundColor = "rgba(211, 211, 211, .4)";
				this.sidebar.style.height = "95vh";
			}
			
		});
		this.sidebar.appendChild(this.button);

		/*this.slideout = document.createElement("button");
		this.slideout.id = "sidebarslideout";
		this.slideout.style.display = "none";
		this.slideout.addEventListener('click', ()=>{
			for(let i = 0; i < container.children.length; i++) {
				if (container.children[i].className == "widget") {
					console.log(container.children[i].id + ": x,y = " + container.children[i].offsetLeft + "," + container.children[i].offsetTop + "; w,h = " + container.children[i].clientWidth + "," + container.children[i].clientHeight);
				}
			}
		});
		this.slideout.innerHTML = "<p>Dashboard settings</p>";*/

		this.slideout = document.createElement("div");
		this.slideout.id = "sidebarslideout";
		this.slideout.style.display = "none";
		
		this.color_picker = new options_button().get_button();
		this.slideout.appendChild(this.color_picker);
		this.background_image_picker = new background_image_button().get_button();
		this.slideout.appendChild(this.background_image_picker);



		
		this.sidebar.appendChild(this.slideout);
	}

	

	get_sidebar()
	{
		return this.sidebar;
	}

	add_to_sidebar(element)
	{
		this.slideout.appendChild(element);
		element.style.zIndex = 1000;
	}

	set_visibility(state){
		this.sidebar.style.display = state;
	}
}