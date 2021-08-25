class node_connector {
    constructor(screenObject) {
        this.screenObject = screenObject;
        let object = this;
        //voegt op alle knoppen functies toe
        window.addEventListener("mousedown", function () {
            if (object.loggedIn) object.resetTimer(object);
        });
        window.addEventListener("touchstart", function () {
            if (object.loggedIn) object.resetTimer(object);
        });
        this.loginButton = document.createElement("button");
        this.loginButton.className = "loginButton";
        this.loginButton.addEventListener('click', () => {
            this.logoutFunction(this);
        });
        this.waitForLogin(this);
        this.loginButton.style.display = "none";
    }

    //kijkt of de accountID een admin is met een api call
    checkAdmin(accountID, newConfig) {
        var request = new XMLHttpRequest();
        request.open('POST', 'http://localhost/isAdmin', true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        newConfig = JSON.parse(newConfig);
        console.log("first",newConfig);
        for (var key in default_config) {
            /*if (key == "screen") newConfig[key] = default_config[key];
            else */if (key != "screen" && (newConfig[key] == null || newConfig[key].widgets == null || newConfig[key].widgets[0] == null || !newConfig[key].widgets[0].enabled)) {
                newConfig[key] = default_config[key];
                newConfig[key].widgets[0].enabled = false;
            }
        }
        console.log("last",newConfig);
        let object = this;
        newConfig.screen.hasChanged = true;
        let config = { id: accountID, config: newConfig };
        let sendConfig = JSON.stringify(config);
        request.onload = function () {
            if(this.response == "true"){
                console.log("dsfdsgfdgfhfghfl'ghgjghjgh");
                object.screenObject.updateConfig();
            }
        };
        request.send(sendConfig);
    }

    //update de default config met een api call
    updateDefaultConfig(config) {
        var request = new XMLHttpRequest();
        request.open('POST', 'http://localhost/updateDefaultConfig', true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.onload = function () {
            console.log(this.response);
        };
        request.send(JSON.stringify(config));
    }
    //krijgt de config van een account met een api call
    getConfigFromAccount(accountID, object) {
        try {
            var request = new XMLHttpRequest();
            request.open('GET', 'http://localhost/getConfigFromID?ID=' + accountID, true);
            request.onload = function () {
                let info = JSON.parse(this.response);
                object.screenObject.login(object.accountID, info.config, object.screenObject, info.admin);
                object.loginButton.style.display = "inline-block";
            };
            request.send();
        }
        catch (err) {
            console.log("cannot request config");
        }
    }
    //set de config van een account met een api call
    setConfigForAccount(accountID, newConfig) {
        this.checkAdmin(accountID, newConfig);
        newConfig = JSON.parse(newConfig);
        let config = { id: accountID, config: newConfig };
        let sendConfig = JSON.stringify(config);
        console.log(newConfig);
        var request = new XMLHttpRequest();
        request.open('POST', 'http://localhost/setConfigForID', true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.onload = function () {
            console.log(this.response);
        };
        request.send(sendConfig);
    }
    //zal een api call sturen naar de node server om een kaart toe te voegen
    /*addCardFunction(object) {
        try {
            var request = new XMLHttpRequest()
            request.open('GET', 'http://localhost/addCard', true);
            request.onload = function () {
            };
            console.log("sending request");
            request.send();
        }
        catch (err) {
            object.logoutButton.style.visibility = "hidden";
            object.responseDiv.style.visibility = "hidden";
            object.loginDiv.innerHTML = "ERROR: Cannot send request!";
        }
    }*/
    //zal een api call sturen naar de node server om uit te loggen
    logoutFunction(object) {
        console.log("logged out function");
        try {
            var request = new XMLHttpRequest()
            request.open('GET', 'http://localhost/logout', true);
            request.onload = function () {
                object.screenObject.logout(object.accountID, object);
                object.loggedIn = false;
                object.accountID = null;
                object.waitForLogin(object);
                clearTimeout(object.timeOut);
                clearInterval(object.interval);
                object.interval = null;
                object.loginButton.style.display = "none";
            };
            console.log("sending request");
            request.send();
        }
        catch (err) {
            object.timeOut = setTimeout(function () {
                object.logoutFunction(object);
                clearTimeout(object.timeOut);
            }, 30000);
        }
    }
    //zal een api call sturen naar de node server om te wachten op een inlog
    waitForLogin(object) {
        try {
            var request = new XMLHttpRequest()
            request.open('GET', 'http://localhost/waitForLogin', true);
            request.onload = function () {
                object.loggedIn = true;
                object.timeLeft = 30;
                object.loginButton.innerHTML = object.timeLeft;
                object.accountID = this.response
                object.interval = setInterval(function () {
                    object.timeLeft--;
                    object.loginButton.innerHTML = object.timeLeft;
                }, 1000);
                object.getConfigFromAccount(object.accountID, object);
                object.resetTimer(object);
            };
            request.send();
        }
        catch (err) {
            setTimeout(function () {
                object.waitForLogin(object);
            }, 1000);
        }
    }
    resetTimer(object) {
        object.timeLeft = 30;
        object.loginButton.innerHTML = object.timeLeft;
        clearTimeout(object.timeOut);
        object.timeOut = null;
        object.timeOut = setTimeout(function () {
            object.logoutFunction(object);
            clearTimeout(object.timeOut);
        }, 30000);
    }
}
