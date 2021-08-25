var default_config = {
    "screen":
    {
        "backgroundColor": "ffffff",
        "font": "Arial",
        "fontsize": "100%",
        "backgroundImage": "url()",
        "backgroundStyle": "Rek",
        "positionWidgetShow": {
            "x": 892,
            "y": 493
        }
    },
    
    "OVWidget": {
        "allowMultiple": true,
        "widgets": [{
            "enabled": false,
            "name": "Openbaar vervoer informatie",
            "allowChanges": true,
            "width": 500,
            "height": 400,
            "startingXpos": 50,
            "startingYpos": 50,
            "zIndex": "1",
            "topBarColor": "df013a",
            "bodyColor": "f1f1f1",
            "settings": [{ station: "rotterdam/bus-tramhalte-beurs", id: "tram-bus", time: 5}, { station: "rotterdam/metrostation-blaak", id: "metro", time:10 }, { station: "rotterdam/metrostation-beurs", id: "metro", time:5 }]
        }]
    },

    "hetweer": {
        "allowMultiple": true,
        "widgets": [{
            "enabled": true,
            "name": "Het weer",
            "allowChanges": true,
            "width": 200,
            "height": 300,
            "startingXpos": 600,
            "startingYpos": 50,
            "zIndex": "2",
            "topBarColor": "df013a",
            "bodyColor": "f1f1f1",
            "settings": { "weatherloc": "rotterdam" }
        }]
    },

    "klok": {
        "allowMultiple": true,
        "widgets": [{
            "enabled": true,
            "name": "Analoge klok",
            "allowChanges": true,
            "width": 200,
            "height": 260,
            "startingXpos": 600,
            "startingYpos": 400,
            "zIndex": "4",
            "topBarColor": "df013a",
            "bodyColor": "f1f1f1",
            "settings": {}
        }]
    },
    "drawnote": {
        "allowMultiple": true,
        "widgets": [{
            "enabled": true,
            "name": "Teken Kladblok",
            "allowChanges": true,
            "width": 240,
            "height": 365,
            "startingXpos": 850,
            "startingYpos": 460,
            "zIndex": "5",
            "topBarColor": "df013a",
            "bodyColor": "f1f1f1",
            "settings": { "color": "#000000", "tool": "pencil", "radius": 2, "ImageURL": "data:image/png;base64,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" }
        }]
    },
    "classrooms": {
        "allowMultiple": true,
        "widgets": [{
            "enabled": false,
            "name": "Vrije lokalen",
            "allowChanges": true,
            "width": 500,
            "height": 390,
            "startingXpos": 50,
            "startingYpos": 460,
            "zIndex": "6",
            "topBarColor": "df013a",
            "bodyColor": "f1f1f1",
            "settings": {}
        }]
    },
    "memes": {
        "allowMultiple": false,
        "widgets": [{
            "enabled": true,
            "name": "Memes",
            "allowChanges": true,
            "width": 500,
            "height": 450,
            "startingXpos": 50,
            "startingYpos": 10,
            "zIndex": "7",
            "topBarColor": "df013a",
            "bodyColor": "f1f1f1",
            "settings": {}
        }]
    },
    "shadowwall": {
        "allowMultiple": false,
        "widgets": [{
            "enabled": true,
            "name": "Shadow wall",
            "allowChanges": true,
            "width": 320,
            "height": 280,
            "startingXpos": 200,
            "startingYpos": 200,
            "zIndex": "8",
            "topBarColor": "df013a",
            "bodyColor": "f1f1f1",
            "settings": {}
        }]
    },
    "events": {
        "allowMultiple": false,
        "widgets": [{
            "enabled": true,
            "name": "evenementen",
            "allowChanges": true,
            "width": 400,
            "height": 400,
            "startingXpos": 400,
            "startingYpos": 400,
            "zIndex": "9",
            "topBarColor": "df013a",
            "bodyColor": "f1f1f1",
            "settings": {}
        }]
    }
};