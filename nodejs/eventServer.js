const linkToUploads = "http://34.90.97.175/uploads/";
const express = require('express');
const urlTool = require('image-data-uri');
const request = require('request');
const fs = require('fs');
let events = null;
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
const port = 80;

get_events_from_json();

//krijgt de events van de json
function get_events_from_json() {
    let data = fs.readFileSync('events.json', 'utf-8');
    events = JSON.parse(data);
}
//set de json naar de nieuwe events
function set_events_from_json(new_events) {
    fs.writeFile('events.json', JSON.stringify(new_events), function(err) {
        if(err) throw err;
    });
}

app.use(express.static('site'));
app.use('/css', express.static(__dirname + '/site/css'));
app.use('/js', express.static(__dirname + '/site/js'));
app.use('/uploads', express.static(__dirname + '/uploads'));

//krijgt de events
app.get('/get_events', function(request, response){
    //console.log(request);
    response.send(JSON.stringify(events));
});

//upload de events
app.post('/upload', function(request, response){
    console.log(request.body);
    response.send("thanks");
    events = request.body
    set_events_from_json(events);
});

app.post('/layoutSave', function(request, response){
    console.log(request.body);
    response.send();
});

//uploadt een plaatje
app.post('/uploadPicture', function(request, response){
    let image = request.body.image;
    while(true) {
        let id = makeid(6);
        let path = "./uploads/"+id+".png";
        if(!fs.existsSync(path))
        {
            urlTool.outputFile(image, path).then(res=>{
                response.send(linkToUploads+id+".png");
            });
            break;
        }
    }
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

//maakt een random id aan
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }