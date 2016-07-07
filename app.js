/*jshint esversion: 6 */

//-------------------Require-------------------//
var express = require("express"),
    path = require("path"),
    exphbs = require("express-handlebars"),
    mysql = require("mysql"),
    bodyParser = require('body-parser'),
    http = require('http'),
    fs = require('fs'),
    api = require("./api.js"),
    port = 3000,
    app = express();

//---------------------App---------------------//
app.listen(port, (err) => {
    if (err) return console.log('Something went wrong: ' + err);
    console.log(`Server is listening on ${port}.`);
});

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//-------------Functions and Data--------------//
var data = {
    orbs: [{
            "name": "Kahn",
            "meter_one": "Some_meter1",
            "meter_two": "Some_meter2"
        },

        {
            "name": "Barrows",
            "meter_one": "Some_meter1",
            "meter_two": "Some_meter2",
        },
    ],
    buildings: [{
            name: "Kahn",
            orb_one: "Kahn first floor",
            orb_two: "Kahn second floor"
        },

        {
            name: "Barrows",
            orb_one: "Barrows first floor",
            orb_two: "Barrows second floor"
        },
    ]
};

var settings = fs.readFileSync('./config.json');
  try {
    settings = JSON.parse(settings);
    data.settings = settings;
  }
  catch (err) {
    console.log('There has been an error parsing your JSON.');
    console.log(err);
  }

var save_orb = function(params) {
    con.query('insert into oberlin_orbs (name, meter_one, meter_two) values ("' + params.name + '", "' + params.meter_one + '", "' + params.meter_two + '")',
        function(err, results) {
            if (err) throw err;
        });
};

var save_building = function(params) {
    con.query('insert into oberlin_buildings (name, orb_one, orb_two) values ("' + params.name + '", "' + params.orb_one + '", "' + params.orb_two + '")',
        function(err, results) {
            if (err) throw err;
        });
};

var delete_orb = function(params) {
    con.query('DELETE FROM oberlin_orbs WHERE name= ?', params.delete,
        function(err, result) {
            if (err) throw err;
        });
};

var delete_building = function(params) {
    con.query('DELETE FROM oberlin_buildings WHERE name= ?', params.delete,
        function(err, result) {
            if (err) throw err;
        });
};

var save_settings = function(params){
    var set = {"orbs":false, "buildings":false, "floors":false};
    if(params.orbs !== undefined)
        set.orbs = true;
    if(params.buildings !== undefined)
        set.buildings = true;
    if(params.floors !== undefined)
        set.floors = true;
    data.settings = set;
};
//----------Routing----------//
app.get('/', (request, response) => {
    // TODO: MAKE THIS A CALLBACK
    refresh_orbs();
    response.render('home', data);
});

// TODO: SORT THIS OUT
app.post('/', (request, response) => {
    if (request.body.delete !== undefined) {
        delete_orb(request.body);
        delete_building(request.body);
    }
    if (request.body.orb_one !== undefined)
        save_building(request.body);
    if (request.body.meter_one !== undefined)
        save_orb(request.body);
    if (request.body.settings !== undefined)
        save_settings(request.body);

    con.query('SELECT * FROM oberlin_orbs', function(err, results) {
        if (err) throw err;
        var temp = JSON.stringify(results);
        data.orbs = JSON.parse(temp);
    });
    con.query('SELECT * FROM oberlin_buildings', function(err, results) {
        if (err) throw err;
        var temp = JSON.stringify(results);
        data.buildings = JSON.parse(temp);
        response.redirect('back');
    });
});

app.get('/test', (request, response) => {
    response.render('test', settings);
});
//--------------------MySQL--------------------//
var con = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "lifx_app"
});

con.connect(function(err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Connection established');
});

refresh_orbs = function() {
    con.query('SELECT * FROM oberlin_orbs', function(err, results) {
        if (err) throw err;
        var temp = JSON.stringify(results);
        data.orbs = JSON.parse(temp);
    });
};

//con.end(function(err) {});

//--------------------Other--------------------//
// args = [api.getBuildings, api.filterBuildings];
// api.getToken.apply(this, args);
