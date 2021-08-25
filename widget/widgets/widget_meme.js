class widget_meme extends base_widget {
    constructor(name, id, width, height, startingXpos, startingYpos, allowChanges = false) {
        if (name == null) {
            super();
            return;
        }
        super(name, id, width, height, startingXpos, startingYpos, allowChanges);
        this.id = id;

        //maakt alle divs en buttons aan en voegt ze toe aan de widget
        this.infoDivContainer = document.createElement("div");
        this.name = document.createElement("div");
        this.title = document.createElement("div");
        this.likesDislikes = document.createElement("div");

        this.name.className = "memesText";
        this.title.className = "memesText";
        this.likesDislikes.className = "memesText";
        this.infoDivContainer.style.display = "block";

        this.name.innerHTML = "Author name: ";
        this.title.innerHTML = "Title ";
        this.likesDislikes.innerHTML = "Likes/Dislikes: ";
        this.infoDivContainer.appendChild(this.title);
        this.infoDivContainer.appendChild(this.name);
        this.infoDivContainer.appendChild(this.likesDislikes);

        this.widget_body.appendChild(this.infoDivContainer);

        this.image = document.createElement("IMG");
        this.image.className = "memesImage";
        // this.image.setAttribute('width', width - 10);
        this.image.setAttribute('height', height - 85);

        this.widget_body.appendChild(this.image);

        this.random = document.createElement("button");
        this.top = document.createElement("button");
        this.discord = document.createElement("button");

        this.buttonContainer = document.createElement("div");

        this.buttonContainer.appendChild(this.top);
        this.buttonContainer.appendChild(this.random);
        this.buttonContainer.appendChild(this.discord);

        this.buttonContainer.style.display = "block";

        this.top.innerHTML = "top meme";
        this.random.innerHTML = "random meme";
        this.discord.innerHTML = "join discord";

        this.top.style.display = "inline-block";
        this.random.style.display = "inline-block";
        
        this.top.onclick = () => {
            this.update_top_post();
        };
        this.random.onclick = () => {
            this.random_post();
        };

        this.discord.onclick = () => {
            this.discord_invite();
        }
        this.widget_body.appendChild(this.buttonContainer);

        this.update_top_post();

    }
    make_new_widget(name, id, width, height, startingXpos, startingYpos, allowChanges) {
        return new widget_meme(name, id, width, height, startingXpos, startingYpos, allowChanges);
    }
    //zorgt ervoor dat de discord invite scherm op de widget te zien komt
    discord_invite(){
        let discordInvite = "https://discord.gg/3pTcUQ6";
        this.title.innerHTML = "Join the discord channel to upload your own memes!";
        this.name.innerHTML = "To join either scan the QR code or go through this link.";
        this.likesDislikes.innerHTML = "<b>"+discordInvite+"</b>";
        this.image.src = "../assets/qrcode_discord.png";
        this.updateImageSize(this);
    }

    //krijgt de top post
    update_top_post() {
        try {
            var request = new XMLHttpRequest();
            request.open('GET', 'http://localhost/discord/getTopMeme', true);
            let object = this;
            request.onload = function () {
                console.log(this.response);
                let response = JSON.parse(this.response);
                object.image.src = response.imageURL;
                object.updateImageSize(object);
                object.likesDislikes.innerHTML = "Likes/Dislikes: "+response.likes+"/"+response.dislikes;
                object.title.innerHTML = "Title: "+response.title;
                object.name.innerHTML = "Author name: "+response.authorName;
            };
            request.send();
        }
        catch (err) {
            console.log("cannot request topMeme");
        }
    }
    //krijgt een random post
    random_post() {
        try {
            var request = new XMLHttpRequest();
            request.open('GET', 'http://localhost/discord/getRandomMeme', true);
            let object = this;
            request.onload = function () {
                console.log(this.response);
                let response = JSON.parse(this.response);
                object.image.src = response.imageURL;
                object.updateImageSize(object);
                object.likesDislikes.innerHTML = "Likes/Dislikes: "+response.likes+"/"+response.dislikes;
                object.title.innerHTML = "Title: "+response.title;
                object.name.innerHTML = "Author name: "+response.authorName;
            };
            request.send();
        }
        catch (err) {
            console.log("cannot request randomMeme");
        }
    }
    //update de size van de image
    updateImageSize(selfObject) {
        var img = new Image();
        img.onload = function () {
            //console.log(this.width, this.height);
            //var imgWidth = selfObject.image.width;
            var imgWidth = this.width;
            //var imgHeight = selfObject.image.height;
            var imgHeight = this.height;
            //console.log(imgHeight, imgWidth);
            var widthRatio = selfObject.widget_body.clientWidth / imgWidth;
            var heightRatio = (selfObject.widget_body.clientHeight - 85) / imgHeight;
            //console.log(widthRatio, heightRatio);
            if (widthRatio < heightRatio) {
                //0.7777777777777778 1.1232876712328768
                selfObject.image.setAttribute('width', selfObject.widget_body.clientWidth);
                selfObject.image.setAttribute('height', imgHeight * widthRatio);
            } else {
                selfObject.image.setAttribute('width', imgWidth * heightRatio);
                selfObject.image.setAttribute('height', (selfObject.widget_body.clientHeight - 85));
            }
        };
        img.src = selfObject.image.src;
    }

    resized()
    {
        this.updateImageSize(this);
    }
}