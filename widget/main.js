document.getElementById("myRange").style.display = "none";
document.getElementById("fontSelect").style.display = "none";
let real = true;
var allWidgetsInFile = [
    { "displayName": "OV", "name": "OVWidget", "object": new OVWidget() },
    { "displayName": "Weer", "name": "hetweer", "object": new widget_weather() },
    { "displayName": "Klok", "name": "klok", "object": new widget_clock() },
    { "displayName": "Tekenblok", "name": "drawnote", "object": new widget_drawnote() },
    { "displayName": "Lokalen", "name": "classrooms", "object": new widget_classrooms() },
    { "displayName": "Memes", "name": "memes", "object": new widget_meme() },
    { "displayName": "Shadow wall", "name": "shadowwall", "object": new widget_shadowall() },
    { "displayName": "Evenementen", "name": "events", "object": new widget_events() }
];
class Screen {
    constructor() {
        this.allowChanges = !real;
        this.node_connector = new node_connector(this);
        this.widgetConfig = default_config;
        console.log(this.widgetConfig);

        //krijgt de default config van de json
        $.getJSON("default_config.json", (default_config_file) => {
            if (isEmpty(default_config_file)) {
                this.default_config = this.widgetConfig;
            }
            else {
                this.default_config = default_config_file;
            }
            this.bar = new sidebar();
            /*
            add widget button to sidebar
            */
            //<button class="button button1" onclick="showSlider(); showDrpdwn()">T</button>
            this.fontButton = document.createElement("button");
            this.fontButton.className = "button button1";
            this.fontButton.addEventListener('click', () => {
                showSlider();
                showDrpdwn();
            });
            this.fontButton.innerHTML = "T";
            //this.bar.add_to_sidebar(this.fontButton);

            //creert de add widget button
            this.add_widget_button = document.createElement("div");
            this.add_widget_button.button = document.createElement("input");
            this.add_widget_button.dropdown = document.createElement("select");

            this.add_widget_button.appendChild(this.add_widget_button.button);
            this.add_widget_button.appendChild(this.add_widget_button.dropdown);

            this.add_widget_button.dropdown.style.visibility = "hidden";

            //on click functie die de widget creert
            this.add_widget_button.dropdown.onchange = () => {
                let selected = this.add_widget_button.dropdown.options[this.add_widget_button.dropdown.selectedIndex];
                console.log(selected);
                if (selected.value != null) {
                    let widget_config = this.default_config[selected.value].widgets[0];
                    this.create_widget(widget_config.name,
                        selected.value, widget_config.width,
                        widget_config.height,
                        widget_config.startingXpos,
                        widget_config.startingYpos,
                        widget_config.zIndex,
                        this.hexToRgb(widget_config.bodyColor),
                        widget_config.topBarColor,
                        widget_config.settings,
                        this.allowChanges);
                    this.add_all_widgets();
                    this.add_widget_button.dropdown.style.visiblity = "hidden";
                    this.showWidgetList();
                }
            };

            this.add_widget_button.button.type = "image";
            this.add_widget_button.button.src = "../assets/add_widget.png";
            this.add_widget_button.button.className = "addWidgetButton";
            this.add_widget_button.button.style.display = "block";
            this.add_widget_button.button.onclick = () => {
                this.showWidgetList();
            };

            //creert de bar om alle knoppen in te stoppen
            this.bar.add_to_sidebar(this.add_widget_button);
            container.appendChild(this.node_connector.loginButton);
            container.appendChild(this.bar.get_sidebar());
            this.allWidgets = allWidgetsInFile;
            for (let i = 0; i < this.allWidgets.length; i++) {
                let keep = this.default_config[this.allWidgets[i].name];
                if (keep == null) {
                    this.default_config[this.allWidgets[i].name] = this.widgetConfig[this.allWidgets[i].name];
                    console.log(this.default_config);
                    keep = this.default_config[this.allWidgets[i].name];
                    this.node_connector.updateDefaultConfig(this.default_config);

                }
                if (keep.keepEnabled != null && keep.keepEnabled) {
                    this.allWidgets[i].keepEnabled = true;
                }
            }
            this.loggedIn = false;
            document.addEventListener('contextmenu', event => event.preventDefault());
            this.widgets = [];
            this.loadAllKeepEnabledWidgets();
            this.options_button = new options_button();

            this.load_config(this.default_config);

            //interval om te kijken of een widget is verwijderd
            setInterval(() => {
                for (let i = 0; i < this.allWidgets.length; i++) {
                    if (this.allWidgets[i].object.check_visible()) {
                        this.allWidgets[i].object.clear();
                        this.allWidgets[i].object = this.allWidgets[i].object.make_new_widget();
                        this.allWidgets[i].enabled = false;
                    }
                }
            }, 5000);
            /*this.currentSlideWidget = null;
            this.currentSlideObject = null;
            this.random_widget();
            this.slideInterval = setInterval(() => {
                this.random_widget();
            }, 5000)*/
            if (real) this.bar.set_visibility("none");
        });
    }

    /* de dropdown die wordt gemaakt als je op de knop drukt
    hij kijkt naar de widgets die op het scherm staan en hij kijkt of 
    "allowMultiple" naar true is gezet, zodat er meerdere op het scherm kunnen worden gezet*/
    showWidgetList() {
        if (this.add_widget_button.dropdown.style.display == "none") {
            for (let i = 0; i < this.allWidgets.length; i++) {
                if (this.allWidgets[i].object.check_visible()) {
                    this.allWidgets[i].object.clear();
                    this.allWidgets[i].object = this.allWidgets[i].object.make_new_widget();
                    this.allWidgets[i].enabled = false;
                }
            }
            this.add_widget_button.dropdown.innerHTML = "";
            this.add_widget_button.dropdown.style.display = "block";
            this.add_widget_button.dropdown.style.visibility = "visible";
            let autoSelected = document.createElement("option");
            autoSelected.value = null;
            autoSelected.text = "add widget";
            this.add_widget_button.dropdown.add(autoSelected);
            autoSelected.selected = true;
            for (let i = 0; i < this.allWidgets.length; i++) {
                let currentWidget = this.allWidgets[i];
                if (!currentWidget.keepEnabled && this.widgetConfig[currentWidget.name].allowMultiple) {
                    console.log(currentWidget.name, this.widgetConfig[currentWidget.name].allowMultiple);
                    let option = document.createElement("option");
                    option.value = currentWidget.name;
                    option.text = currentWidget.displayName;
                    this.add_widget_button.dropdown.add(option);
                }
                else if (!this.widgetConfig[currentWidget.name].allowMultiple) {
                    if (currentWidget.object.widget == null || this.currentSlideObject == currentWidget.object) {
                        console.log(currentWidget.name, this.widgetConfig[currentWidget.name].allowMultiple);
                        let option = document.createElement("option");
                        option.value = currentWidget.name;
                        option.text = currentWidget.displayName;
                        this.add_widget_button.dropdown.add(option);
                    }
                }
            }

        }
        else {
            this.add_widget_button.dropdown.style.display = "none";
        }

        //console.log(this.add_widget_button.dropdown);
    }
    //laadt alle keepEnabled widgets
    loadAllKeepEnabledWidgets() {
        for (let i = 0; i < this.allWidgets.length; i++) {
            if (this.allWidgets[i].keepEnabled) {
                let widget_config_all = this.default_config[this.allWidgets[i].name];
                for (let j = 0; j < widget_config_all.widgets.length; j++) {
                    let widget_config = widget_config_all.widgets[j];
                    this.create_widget(widget_config.name,
                        this.allWidgets[i].name, widget_config.width,
                        widget_config.height,
                        widget_config.startingXpos,
                        widget_config.startingYpos,
                        widget_config.zIndex,
                        this.hexToRgb(widget_config.bodyColor),
                        widget_config.topBarColor,
                        widget_config.settings,
                        this.allowChanges);
                    this.allWidgets[i].enabled = true;
                }
            }
        }
    }
    //voegt alle widgets toe aan het scherm die in this.widgets staan
    add_all_widgets() {
        for (var i = 0; i < this.widgets.length; i++) {
            container.appendChild(this.widgets[i].get_widget());
        }
        this.widgets = [];
    }
    //de login functie die wordt aangeroepen van de node_connector.js
    login(accountID, config, object, isAdmin) {
        if (real) {
            this.bar.set_visibility("block");
            this.allowChanges = true;
        }
        object.loggedAccountID = accountID;
        object.loggedConfig = config;
        object.loggedIn = true;
        /*logged in, remove slideshow*/
        clearInterval(this.slideInterval);
        this.currentSlideObject = null;
        this.currentSlideWidget = null;
        console.log(config);
        if (config == null || config == "") {
            this.load_config(this.default_config);
        } else {
            this.load_config(JSON.parse(config));
        }
        if (isAdmin == 1) {
            /*this.slideInterval = setInterval(() => {
                this.random_widget();
            }, 5000);
            this.random_widget();*/
        }


    }
    //de logout functie die wordt aangeroepen van de node_connector.js
    logout(accountID, object) {
        if (real) {
            this.bar.set_visibility("none");
            this.allowChanges = false;
        }
        object.loggedIn = false;
        for (let i = 0; i < this.allWidgets.length; i++) {
            if (this.allWidgets[i].object.check_visible()) {
                this.allWidgets[i].object.clear();
                this.allWidgets[i].object = this.allWidgets[i].object.make_new_widget();
                this.allWidgets[i].enabled = false;
            }
        }
        var config = this.get_config();
        console.log(config, "dksdsdfdgfdgfgend");
        clearInterval(this.slideInterval);
        this.load_config(this.default_config);
        this.currentSlideObject = null;
        this.currentSlideWidget = null;
        object.setConfigForAccount(accountID, config);
        /*this.slideInterval = setInterval(() => {
            this.random_widget();
        }, 5000);
        this.random_widget();*/

    }
    //functie om de config te updaten en ook het scherm
    updateConfig() {
        console.log("update config");
        setTimeout(() => {
            $.getJSON("default_config.json", (new_config) => {
                if (new_config.screen.hasChanged) {
                    this.currentSlideObject = null;
                    this.currentSlideWidget = null;
                    for (let i = 0; i < this.allWidgets.length; i++) {
                        if (this.allWidgets[i].object.check_visible()) {
                            this.allWidgets[i].object.clear();
                            this.allWidgets[i].object = this.allWidgets[i].object.make_new_widget();
                            this.allWidgets[i].enabled = false;
                        }
                    }
                    this.default_config = new_config;
                    this.load_config(this.default_config);
                    this.random_widget();
                    new_config.screen.hasChanged = false;
                    this.node_connector.updateDefaultConfig(new_config);
                }
                else {
                    this.updateConfig();
                }
            });
        }, 100);
    }

    //maakt de config aan met alle settings van de widgets en hun properties
    get_config() {
        var config = {};
        config.screen = {
            "backgroundColor": this.options_button.get_color(),
            "font": document.getElementById("container").style.fontFamily,
            "fontsize": document.getElementById("container").style.fontSize.slice(0, -1),
            "backgroundImage": document.body.style.backgroundImage,
            "backgroundStyle": screen.bar.sidebar.children[1].children[1].children[1].children[0].value
        };
        if (this.currentSlideObject != null) {
            config.screen['positionWidgetShow'] = this.currentSlideObject.get_position();
            console.log(config.screen['positionWidgetShow'], "fdsgfdgdfhfghgfhfghfg");
        }
        for (var i = 0; i < this.allWidgets.length; i++) {
            var currentWidget = this.allWidgets[i];
            if (currentWidget.keepEnabled) { console.log("keepEnabled", currentWidget.name) }
            else if (currentWidget.enabled) {
                config[this.allWidgets[i].name] = {
                    "allowMultiple": this.widgetConfig[this.allWidgets[i].name].allowMultiple,
                    "widgets": []
                };
                currentWidget = currentWidget.object;
                let index = 0;
                while (true) {
                    try {
                    if (currentWidget == null || currentWidget.widget.id == this.currentSlideObject.widget.id) break;
                    }
                    catch(e)
                    {
                        console.log(e);
                    }
                    function componentToHex(c) {
                        var hex = c.toString(16);
                        return hex.length == 1 ? "0" + hex : hex;
                    }

                    function rgbToHex(rgb) {
                        if (rgb == "") {
                            return "";
                        }
                        rgb = rgb.split("(")[1];
                        rgb = rgb.split(")")[0];
                        rgb = rgb.split(", ");
                        return componentToHex(parseInt(rgb[0])) + componentToHex(parseInt(rgb[1])) + componentToHex(parseInt(rgb[2]));
                    }
                    var top_bar_color = document.defaultView.getComputedStyle(currentWidget.get_widget().getElementsByClassName("widgetTopBar")[0],
                        null)
                        .getPropertyValue("background-color");
                    var body_color = document.defaultView.getComputedStyle(currentWidget.get_widget(),
                        null)
                        .getPropertyValue("background-color");
                    config[this.allWidgets[i].name].widgets[index] = {
                        "enabled": true,
                        "name": currentWidget.get_widget().getElementsByClassName("widgetTopBar")[0].getElementsByClassName("widgetNameWrapper")[0].getElementsByClassName("widgetName")[0].innerHTML,
                        "width": currentWidget.get_widget().clientWidth,
                        "height": currentWidget.get_widget().clientHeight,
                        "startingXpos": currentWidget.get_widget().offsetLeft,
                        "startingYpos": currentWidget.get_widget().offsetTop,
                        "zIndex": document.defaultView.getComputedStyle(document.getElementById(currentWidget.get_widget().id), null).getPropertyValue("z-index"),
                        "topBarColor": rgbToHex(top_bar_color),
                        "bodyColor": rgbToHex(body_color),
                        "settings": currentWidget.get_settings(currentWidget),
                        "allowChanges": currentWidget.get_allow_changes()
                    };
                    index++;
                    currentWidget = currentWidget.nextWidget;
                }
            }
            else {
                config[currentWidget.name] = { "widgets": [{ "enabled": false }] };
            }
        }
        var config_string = JSON.stringify(config);
        //console.log(config, "fdsfdgfgfgf");
        return config_string;
    }
    //laadt een config en zorgt ervoor dat alle widgets worden gemaakt met de juiste properties
    load_config(config) {
        for (let i = 0; i < this.allWidgets.length; i++) {
            if (!this.allWidgets[i].keepEnabled) {
                this.allWidgets[i].object.remove_all_widgets_from_screen();
                this.allWidgets[i].object.clear_all();
                this.allWidgets[i].object = this.allWidgets[i].object.make_new_widget();
                this.allWidgets[i].enabled = false;
            }
        }
        var config_obj = config;
        var widgetKeys = getAllKeysFromDict(config_obj);
        var widget_config;
        for (let i = 0; i < widgetKeys.length; i++) {
            if (widgetKeys[i] != "screen") {
                let widget_config_all = config_obj[widgetKeys[i]];
                for (let j = 0; j < widget_config_all.widgets.length; j++) {
                    widget_config = widget_config_all.widgets[j];
                    if (widget_config.enabled && !widget_config_all.keepEnabled) {
                        this.create_widget(widget_config.name,
                            widgetKeys[i], widget_config.width,
                            widget_config.height,
                            widget_config.startingXpos,
                            widget_config.startingYpos,
                            widget_config.zIndex,
                            this.hexToRgb(widget_config.bodyColor),
                            widget_config.topBarColor,
                            widget_config.settings,
                            this.allowChanges);
                    }
                }
            }
        }
        this.add_all_widgets();

        /*
        * laadt configs voor scherm
        */
        widget_config = config_obj["screen"];
        this.options_button.set_color(widget_config.backgroundColor);
        fontChangeWithNormalArguments(widget_config.font);
        if (widget_config["backgroundImage"] != "") {
            document.body.style.backgroundImage = widget_config["backgroundImage"];
        }
        else {
            document.body.style.backgroundImage = "";
        }

        if (widget_config["backgroundStyle"] == "Rek") {
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundSize = "100% 100%";
        }
        else if (widget_config["backgroundStyle"] == "Herhaal") {
            document.body.style.backgroundRepeat = "repeat";
            document.body.style.backgroundSize = "";
        }
        else {
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundSize = "";
        }
        /*var listValue = widget_config.fontsize+"%";
            console.log(listValue,"ffdgfdgfdg");
            document.getElementById("container").style.fontSize = listValue;
            var bar_height = 30 * (parseInt(listValue.slice(0, -1)) / 100);
            var top_bars = document.getElementsByClassName("widgetTopBar");
            for (var j = 0; j < top_bars.length; j++) {
                top_bars[j].style.height = bar_height + "px";
            }
            var names = document.getElementsByClassName("widgetName");
            for (var j = 0; j < names.length; j++) {
                names[j].style.height = bar_height - 5 + "px";
            }
            var setting_buttons = document.getElementsByClassName("widgetSettings");
            for (var j = 0; j < setting_buttons.length; j++) {
                console.log(setting_buttons[j],j);
                setting_buttons[j].style.width = bar_height - 5 + "px";
                setting_buttons[j].style.height = bar_height - 5 + "px";
            }
            console.log(slider);*/
    }
    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    //de slideshow functie die ervoor zorgt dat de slideshow steeds van widget veranderd
    random_widget() {
        console.log(this.currentSlideWidget);
        let x = this.default_config.screen['positionWidgetShow'].x;
        let y = this.default_config.screen['positionWidgetShow'].y;
        if (this.currentSlideWidget != null) {
            let curWidget = this.currentSlideObject;
            console.log(curWidget);
            curWidget.dropdown.style.display = "none";		//Hide dropdown
            for (let i = 0; i < container.children.length; i++) {	//Update the zIndex of all widgets that remain
                if (container.children[i].style.zIndex > curWidget.widget.style.zIndex) {
                    container.children[i].style.zIndex--;
                }
            }
            let position = curWidget.get_position();
            x = position.x;
            y = position.y;
            curWidget.remove_widget_from_screen();
            curWidget.deleted = true;
            this.currentSlideWidget++;
            if (this.currentSlideWidget >= this.allWidgets.length) {
                this.currentSlideWidget = 0;
            }
        }
        else {
            this.currentSlideWidget = 0;
        }
        for (let i = 0; i < this.allWidgets.length; i++) {
            if (this.allWidgets[i].object.check_visible()) {
                this.allWidgets[i].object.clear();
                this.allWidgets[i].object = this.allWidgets[i].object.make_new_widget();
                this.allWidgets[i].enabled = false;
            }
        }
        let widget_config = this.default_config[this.allWidgets[this.currentSlideWidget].name].widgets[0];
        this.create_widget(widget_config.name,
            this.allWidgets[this.currentSlideWidget].name, widget_config.width,
            widget_config.height,
            x,
            y,
            widget_config.zIndex,
            this.hexToRgb(widget_config.bodyColor),
            widget_config.topBarColor,
            widget_config.settings,
            this.allowChanges);
        this.add_all_widgets();
        let curWidget = this.allWidgets[this.currentSlideWidget].object;
        while (true) {
            if (curWidget.nextWidget == null) {
                break;
            }
            else {
                curWidget = curWidget.nextWidget;
            }
        }
        this.currentSlideObject = curWidget;
    }

    //de functie die een widget maakt
    create_widget(name, id, width, height, startingXpos, startingYpos, zIndex, background, topBar, settings, allowChanges) {
        var widget = "";

        //console.log("Loading '" + name + "' with id '" + id + "' on location " + startingXpos + "," + startingYpos + " with size " + width + "x" + height + " and top bar and background colors '" + topBar + "','" + background + "'");
        let index;
        for (let i = 0; i < this.allWidgets.length; i++) {
            if (this.allWidgets[i].name == id) {
                index = i;
            }
        }
        console.log(this.allWidgets, index);
        this.allWidgets[index].enabled = true;
        if (!this.allWidgets[index].object.created) {
            this.allWidgets[index].object = this.allWidgets[index].object.make_new_widget(name, id + "0", width, height, startingXpos, startingYpos, allowChanges, this);
            widget = this.allWidgets[index].object;
        }
        else {
            widget = this.allWidgets[index].object.create_next_widget(name, id, width, height, startingXpos, startingYpos, allowChanges, this, 1);
        }
        if (widget != "") {
            widget.set_settings(widget, settings);
            this.widgets.push(widget);
            widget.get_widget().style.zIndex = zIndex;
            if (topBar != "") {
                widget.top_bar.style.backgroundColor = '#' + topBar;
                widget.menu.style.backgroundColor = '#' + topBar;
            }
            if (background != "") {
                //console.log(widget.widget.style.backgroundColor, "setting it to", background);
                widget.set_background_color(background);
                //console.log(widget.widget.style.backgroundColor);
            }
        }
    }
}
let screen = new Screen();


var slider = document.getElementById("myRange");

function fontChange(selectTag) {
    var listValue = selectTag.options[selectTag.selectedIndex].text;
    //console.log(selectTag, listValue);
    document.getElementById("container").style.fontFamily = listValue;
}

function fontChangeWithNormalArguments(font) {
    document.getElementById("container").style.fontFamily = font;
}

slider.oninput = function () {
    var listValue = this.value + "%";
    document.getElementById("container").style.fontSize = listValue;

    var bar_height = 30 * (parseInt(listValue.slice(0, -1)) / 100);
    var top_bars = document.getElementsByClassName("widgetTopBar");
    for (var i = 0; i < top_bars.length; i++) {
        top_bars[i].style.height = bar_height + "px";
    }


    var names = document.getElementsByClassName("widgetName");
    for (var i = 0; i < names.length; i++) {
        names[i].style.height = bar_height - 5 + "px";
    }
    var setting_buttons = document.getElementsByClassName("widgetSettings");
    for (var i = 0; i < setting_buttons.length; i++) {
        setting_buttons[i].style.width = bar_height - 5 + "px";
        setting_buttons[i].style.height = bar_height - 5 + "px";
    }

}

function showSlider() {
    var x = document.getElementById("myRange");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function showDrpdwn() {
    var x = document.getElementById("fontSelect");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function getAllKeysFromDict(dict) {
    var keys = [];
    for (var k in dict) keys.push(k);
    return keys;
}

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}