class OVWidget extends base_widget {
    constructor(name, id, width, height, startingXpos, startingYpos, allowChanges = false) {
        if (name == null) {
            super();
            return;
        }
            super(name, id, width, height, startingXpos, startingYpos, allowChanges);
            this.id = id;
            //alle stations die worden laten zien
            this.stations = [];
            this.updateList(this);
            let object = this;
            this.updates = setInterval(this.updateFunction, 30000, this);
            this.delete_button = document.createElement("button");
            this.delete_button.className = "menuButton";
            this.delete_button.id = id + "deleteButton";
            this.delete_button.innerHTML = "Verwijder Station";
            this.delete_button.addEventListener('click', () => { this.dropdown.style.display = "none"; });
            this.delete_button.onclick = () => {
                if (!this.deleteMode) {
                    this.delete_button.innerHTML = "Cancel";
                    this.deleteMode = true;
                    this.updateList(this);
                    this.greyState = true;
                    this.timerDelete = setInterval(function () {
                        for (let i = 0; i < object.stations.length; i++) {
                            if (object.greyState) {
                                object.arrDivs[i].divsList[0].className = "verwijderStation";
                            }
                            else {
                                object.arrDivs[i].divsList[0].className = "stationNaam";
                            }
                        }
                        object.greyState = !object.greyState;
                    }, 500);
                }
                else {
                    this.deleteMode = false;
                    this.greyState = true;
                    this.delete_button.innerHTML = "Verwijder Station";
                    clearInterval(this.timerDelete);
                    this.updateList(object);
                }
            };
            this.dropdown.appendChild(this.delete_button);
            this.add_button = document.createElement("button");
            this.add_button.className = "menuButton";
            this.add_button.id = id + "addButton";
            this.add_button.innerHTML = "Voeg Station Toe";
            this.add_button.addEventListener('click', () => { this.dropdown.style.display = "none"; });
            this.add_button.onclick = () => {
                if (!this.addMode) {
                    this.greyState = true;
                    this.addMode = true;
                    this.add_button.innerHTML = "Cancel";
                    this.addStation(this);
                }
                else {
                    this.greyState = true
                    this.addMode = false;
                    this.add_button.innerHTML = "Voeg Station Toe";
                    clearInterval(this.timerAdd);
                    this.updateList(object);
                }

            };
            this.dropdown.appendChild(this.add_button);
    }

    /*functie die de hele lijst van stations opnieuw maakt als er een verandering is*/
    updateList(object) {
        object.widget_body.innerHTML = "";
        if (object.deleteMode) object.arrDivs = new Array(object.stations.length + 1);
        else object.arrDivs = new Array(object.stations.length);
        for (let i = 0; i < object.stations.length; i++) {
            //maakt alle divs aan voor de stations
            object.arrDivs[i] = {};
            object.arrDivs[i].list = false;
            object.arrDivs[i].div = document.createElement("div");
            object.arrDivs[i].div.className = "ovtest";
            object.arrDivs[i].div.id = "div" + object.id + i;
            object.arrDivs[i].station = object.stations[i].station;
            object.arrDivs[i].type = object.stations[i].id;
            object.arrDivs[i].divsList = new Array(11);
            for (let j = 0; j < 11; j++) {
                object.arrDivs[i].divsList[j] = document.createElement("div");
                object.arrDivs[i].divsList[j].id = "divList" + object.id+j;
                if (j == 0) {
                    object.arrDivs[i].divsList[j].className = "stationNaam"
                }
                else {
                    object.arrDivs[i].divsList[j].className = "stationtest";
                }
                object.arrDivs[i].div.appendChild(object.arrDivs[i].divsList[j]);
                if (j >= 1) {
                    let currentDiv = object.arrDivs[i].divsList[j];
                    currentDiv.innerHTML = "."
                    currentDiv.style.display = "none";
                    $("#div" + object.id+i).find("#divList" +object.id+ j).fadeOut(function () {
                        currentDiv.style.display = "block";
                    });
                }
            }
            object.widget_body.appendChild(object.arrDivs[i].div);
            let objectDiv = object.arrDivs[i];
            //als er op een station wordt geklikt, zal hij de 9/10 volgende vertrek tijden laten zien
            object.arrDivs[i].div.onclick = function () {
                if (object.deleteMode) {
                    object.stations.splice(i, 1);
                    object.delete_button.innerHTML = "Verwijder Station";
                    object.deleteMode = false;
                    object.greyState = true;
                    clearInterval(object.timerDelete);
                    object.updateList(object);
                }
                else {
                    objectDiv.list = !objectDiv.list;
                    object.updateFunction(object)
                    //alert(objectDiv.list);
                    if (objectDiv.list) {
                        object.slideToList(object, objectDiv);
                    }
                    else {
                        object.slideBackToNormal(object, objectDiv);
                    }
                    setTimeout(function () {
                        object.setVisibility(objectDiv, object);
                        object.updateFunction(object);
                    }, 500);
                };
            }
        }
        if (object.deleteMode) {
            object.arrDivs[object.stations.length] = document.createElement("div");
            object.arrDivs[object.stations.length].innerHTML = "Druk op een station om hem te verwijderen uit de lijst";
            console.log(object.arrDivs[object.stations.length]);
            object.widget_body.appendChild(object.arrDivs[object.stations.length]);
        }
        object.updateAllDivs(this);
    }

    //functie die ervoor zorgt dat er een station kan worden ingetikt en dan kan worden toegevoegd
    addStation(object, err = null) {
        object.widget_body.innerHTML = "Voer hier een station in of deel van een station.<br>";
        object.textField = document.createElement("input");
        object.textField.value = "";
        object.widget_body.appendChild(object.textField);
        $("#" + object.id + " > div.body > input").mlKeyboard({
            layout: 'en_US',
            close_speed: 10
        });
        object.searchButton = document.createElement("button");
        object.searchButton.innerHTML = "Zoek";
        object.searchButton.onclick = () => {
            if (object.textField.value.includes("&")) {
                object.addStation(object, "De '&' toets mag niet gebruikt worden");
            }
            else if (object.textField.value.startsWith(" ")) {
                object.addStation(object, "De station mag niet met een spatie beginnen")
            }
            else if (object.textField.value.includes(",")) {
                object.addStation(object, "De station mag geen komma bevatten")
            }
            else if (object.textField.value.includes('"')) {
                object.addStation(object, "De station mag geen aanhalingsteken bevatten")
            }
            else if (object.textField.value.includes("'")) {
                object.addStation(object, "De station mag geen apostrof bevatten")
            }
            else if (object.textField.value.includes("/") || object.textField.value.includes("\\")) {
                object.addStation(object, "De station mag geen schuine streep bevatten")
            }
            else {
                if (object.textField.value == "") {
                    console.log("empty");
                    object.greyState = true
                    object.addMode = false;
                    object.add_button.innerHTML = "Voeg Station Toe";
                    clearInterval(object.timerAdd);
                    object.updateList(object);
                }
                else {
                    console.log("allowed");
                    let apiCall = 'https://api.9292.nl/0.1/locations?lang=nl-NL&type=stop&type=station&q=' + object.textField.value;
                    console.log(apiCall);
                    fetch(apiCall).then(function (response) {
                        return response.json();

                    }).then(function (json) {
                        object.listStationsForAdding(object, json);
                    });
                    //object.showListOfRequestStations(object);
                    /*ctx.prev_weatherloc = ctx.weatherloc;
                     // als de input leeg is blijft weatherloc hetzelfde
                     ctx.weatherloc = (ctx.text_field.value!="")?ctx.text_field.value:ctx.weatherloc;
                     // call update weather weer en zet een interval voor elke 30 seconde
                     this.update_weather(this);
                     this.weather_interval = setInterval(()=>(this.update_weather(this)), 30000);*/
                }
                object.updateList(object);
            }
        }
        object.widget_body.appendChild(object.searchButton);
        if (err != "") {
            object.error_message = document.createElement("div");
            object.error_message.style.color = "red";
            object.error_message.innerHTML = err;
            object.widget_body.appendChild(object.error_message);
        }
    }
    //functie die de lijst van stations die kunnen worden toegevoegd laat zien
    listStationsForAdding(object, json) {
        object.widget_body.innerHTML = "";
        console.log(json);
        let typeDestination;
        object.addingDivs = new Array(json.locations.length + 1);
        for (let i = 0; i < json.locations.length; i++) {
            let station = json.locations[i];
            object.addingDivs[i] = document.createElement("div");
            object.addingDivs[i].className = "stationNaam";
            if (station.stopType == null) object.addingDivs[i].innerHTML = station.type + " " + station.name;
            else object.addingDivs[i].innerHTML = station.stopType + " " + station.name;
            object.addingDivs[i].onclick = () => {
                if (station.stopType == "station" || station.type == "station") typeDestination = "trein";
                else if (station.stopType = "Bus-/tramhalte") typeDestination = "tram-bus";
                else if (station.stopType = "Metrostation") typeDestination = "metro";
                else if (station.stopType = "Bushalte") typeDestination = "bus";
                object.stations.push({ station: station.id, id: station.type });
                console.log(object.stations);
                object.greyState = true
                object.addMode = false;
                object.add_button.innerHTML = "Voeg Station Toe";
                clearInterval(object.timerAdd);
                object.updateList(object);
            }
            object.widget_body.appendChild(object.addingDivs[i]);
        }
        object.addingDivs[json.locations.length] = document.createElement("div");
        object.addingDivs[json.locations.length].innerHTML = "Druk op een station om hem toe te voegen aan de lijst";
        object.widget_body.appendChild(object.addingDivs[json.locations.length]);
        object.timerAdd = setInterval(function () {
            for (let i = 0; i < json.locations.length; i++) {
                if (object.greyState) {
                    object.addingDivs[i].className = "addStation";
                }
                else {
                    object.addingDivs[i].className = "stationNaam";
                }
            }
            object.greyState = !object.greyState;
        }, 500);
    }

    //update functie om te kijken in welke staat de widget staat
    updateFunction(object) {
        if (!object.checkListMode(object)) {
            object.updateAllDivs(object);
        }
        else {
            object.listDepartures(object);
        }
        object.time = 0;
    }

    //laat de lijst zien van vertrek tijden van een station
    listDepartures(object) {
        //find enabled list element
        let enabledElement;
        for (let i = 0; i < object.arrDivs.length; i++) {
            if (object.arrDivs[i].list) {
                enabledElement = object.arrDivs[i];
            }
        }
        let currentTime = new Date();
        let hours = currentTime.getHours();
        let minutes = currentTime.getMinutes();
        object.getOVInfo(object, enabledElement.station, enabledElement, hours, minutes, enabledElement.type, true);

    }
    //set de visibility van een element
    setVisibility(element, object) {
        if (element.list) //hide the rest
        {
            for (let i = 0; i < object.arrDivs.length; i++) {
                if (object.arrDivs[i] != element) {
                    object.arrDivs[i].div.style.display = 'none';
                }
            }
        }
        else //show the rest
        {
            for (let i = 0; i < object.arrDivs.length; i++) {
                object.arrDivs[i].div.style.display = 'block';
            }
        }
    }
    //kijkt in welke modes de widget staat
    checkListMode(object) {
        for (let i = 0; i < object.arrDivs.length; i++) {
            if (object.arrDivs[i].list) {
                return true;
            }
        }
        return false;
    }

    //update de ov informatie via de gekregen json file van 9292
    update(object, json, objectDiv, hours, minutes, id, list) {
        let nameOfStation = json.location.name;
        let departures = json.tabs[0].departures;
        for (let i = 0; i < json.tabs.length; i++) {
            if (json.tabs[i].id == id) {
                departures = json.tabs[i].departures;
            }
        }
        let stationJson;
        for(let i = 0;i<object.stations.length;i++){
            if(object.stations[i].station == json.location.id){
                stationJson = object.stations[i];
            }
        }
        departures = departures.slice(0, 10);
        let divText = nameOfStation + "&emsp;";
        if (!list) {
            let index = 9;
            for (let i = 0; i < 10; i++) {
                let timeLeave = departures[i].time;
                let hoursLeave = parseInt(timeLeave.slice(0, 2));
                let minutesLeave = parseInt(timeLeave.slice(3, 5)) + hoursLeave * 60;
                minutesLeave = minutesLeave - (hours * 60 + minutes) - stationJson.time;
                if (minutesLeave > 0) {
                    index = i;
                    break;
                }
            }
            if (departures[index].service == null) {
                divText += "richting";
            }
            else {
                divText += departures[index].service;
            }
            divText += " " + departures[index].destinationName;
            let timeLeave = departures[index].time;
            let hoursLeave = parseInt(timeLeave.slice(0, 2));
            let minutesLeave = parseInt(timeLeave.slice(3, 5)) + hoursLeave * 60;
            minutesLeave = minutesLeave - (hours * 60 + minutes);
            divText += " vertrekt over " + minutesLeave + " min";
            if(stationJson['time'] != null) {
                divText+=" "+stationJson.time+" looptijd";
            }
            objectDiv.divsList[0].innerHTML = divText;
        }
        else {
            divText += "<br>";
            objectDiv.divsList[0].innerHTML = divText;
            for (let i = 1; i < 10; i++) {
                let divText = "";
                let divList = objectDiv.divsList[i];
                let departure = departures[i - 1];
                if (departure.service == null) {
                    divText += "richting";
                }
                else {
                    divText += departure.service;
                }
                divText += " " + departure.destinationName;
                let timeLeave = departure.time;
                let hoursLeave = parseInt(timeLeave.slice(0, 2));
                let minutesLeave = parseInt(timeLeave.slice(3, 5)) + hoursLeave * 60;
                minutesLeave = minutesLeave - (hours * 60 + minutes);
                if (minutesLeave < 0) {
                    minutesLeave = 0;
                }
                divText += " vertrekt over " + minutesLeave + " min<br>";
                divList.innerHTML = divText;
            }
        }
    }

    //krijgt de ov informatie van 9292 via een api call
    getOVInfo(object, station, objectDiv, hours, minutes, id, list) {
        let updateFunctionOV = this.update;
        let apiCall = 'https://api.9292.nl/0.1/locations/' + station + '/departure-times?lang=nl-NL'
        fetch(apiCall).then(function (response) {
            return response.json();

        }).then(function (json) {
            updateFunctionOV(object, json, objectDiv, hours, minutes, id, list);
        });
    }

    //update all divs met de juiste ov informatie
    updateAllDivs(object) {
        let currentTime = new Date();
        let hours = currentTime.getHours();
        let minutes = currentTime.getMinutes();
        for (let i = 0; i < object.arrDivs.length; i++) {
            object.getOVInfo(object, object.arrDivs[i].station, object.arrDivs[i], hours, minutes, object.arrDivs[i].type, false);
        }
    }

    //animatie met jquery
    slideToList(object, divObject) {
        let indexDiv = object.arrDivs.indexOf(divObject);
        for (let i = indexDiv - 1; i >= 0; i--) {
            $("#div" + object.id+i).slideUp(250);
        }
        for (let i = indexDiv + 1; i < object.arrDivs.length; i++) {
            $("#div" + object.id+i).slideUp(250);
        }
        setTimeout(function () {
            for (let i = 1; i < 10; i++) {
                $("#div" + object.id+indexDiv).find("#divList" +object.id+ i).fadeIn(500);
            }
        }, 250);
    }
    //animatie met jquery
    slideBackToNormal(object, divObject) {
        let indexDiv = object.arrDivs.indexOf(divObject);
        for (let i = 1; i < 10; i++) {
            $("#div" + object.id+indexDiv).find("#divList" +object.id+ i).fadeOut(250, function () {
                divObject.divsList[i].innerHTML = "";
            });
        }
        setTimeout(function () {
            for (let i = indexDiv - 1; i >= 0; i--) {
                $("#div" + object.id+i).slideDown(250);
            }
            for (let i = indexDiv + 1; i < object.arrDivs.length; i++) {
                $("#div" + object.id+i).slideDown(250);
            }
        }, 250);
    }

    get_settings(object) {
        console.log(JSON.stringify(object.stations));
        return JSON.parse(JSON.stringify(object.stations));
    }

    set_settings(object, config) {
        console.log(JSON.stringify(config));
        object.stations = JSON.parse(JSON.stringify(config));
        console.log(object.stations);
        object.updateList(object);
    }

    make_new_widget(name, id, width, height, startingXpos, startingYpos, allowChanges)
    {
        return new OVWidget(name, id, width, height, startingXpos, startingYpos, allowChanges);
    }

    clear()
    {
        clearInterval(this.updates);
        clearInterval(this.timerDelete);
        clearInterval(this.timerAdd);
    }
}
