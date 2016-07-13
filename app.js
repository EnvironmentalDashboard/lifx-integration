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
    buildings: ["Kahn", "Barrows"]
};

var settings = fs.readFileSync('./config.json');
try {
    settings = JSON.parse(settings);
    data.settings = settings;
} catch (err) {
    console.log('There has been an error parsing your JSON.');
    console.log(err);
}

var save_orb = function(params, response) {
    data.orbs.push(params);
    con.query('insert into oberlin_orbs (name, meter_one, meter_two) values ("' + params.name + '", "' + params.meter_one + '", "' + params.meter_two + '")',
        function(err, results) {
            if (err) throw err;
            response.redirect('back');
        });
};

var delete_orb = function(params, response) {
    for (var i = 0; i < data.orbs.length; i++) {
        if (data.orbs[i].name === params.delete) {
            data.orbs.splice(i, 1);
        }
    }
    con.query('DELETE FROM oberlin_orbs WHERE name= ?', params.delete,
        function(err, result) {
            if (err) throw err;
        });
};

var building_picked = function(params, response) {


};


var save_settings = function(params) {
    var set = {
        "orbs": false,
        "buildings": false,
        "floors": false
    };
    if (params.orbs !== undefined)
        set.orbs = true;
    if (params.buildings !== undefined)
        set.buildings = true;
    if (params.floors !== undefined)
        set.floors = true;
    data.settings = set;
};
//----------Routing----------//
app.get('/', (request, response) => {
    response.render('home', data);
});

app.post('/', (request, response) => {
});

app.post('/save_orb', (request, response) => {
    save_orb(request.body, response);
});

app.post('/delete_orb', (request, response) => {
    delete_orb(request.body, response);
});

app.post('/building_picked', (request, response) => {
    building_picked(request.body, response);
});

app.get('/test', (request, response) => {
    response.render('test');
});

app.get('/auth', function (req, res) {
    var querystring = require("querystring");
    var result = querystring.stringify({client_id: "b1fa18a42a9b5fb0a27cb525d3283066aebf86284e6b08640faccafc133336f0",scope: "remote_control:all",state:"3(#0/!~",response_type:"code"});
    console.log(result);
    res.redirect("https://cloud.lifx.com/oauth/authorize?"+result);
});

// app.get('/redirect', function (req, res) {
//   var code = req.query.code;
//   console.log(code);
//   oauth2.authCode.getToken({
//     code: code,
//     redirect_uri: 'http://environmentalorb.org/redirect'
//   }, saveToken);
//
//   function saveToken(error, result) {
//     if (error) { console.log('Access Token Error', error.message); }
//     token = oauth2.accessToken.create(result);
//   }
// });

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

con.query('SELECT * FROM oberlin_orbs', function(err, results) {
    if (err) throw err;
    var temp = JSON.stringify(results);
    data.orbs = JSON.parse(temp);
});
con.query('SELECT * FROM oberlin_meters', function(err, results) {
    if (err) throw err;
    var temp = JSON.stringify(results);
    data.meters = JSON.parse(temp);
});
con.query('SELECT name FROM oberlin_buildings', function(err, results) {
    if (err) throw err;
    var temp = JSON.stringify(results);
    data.buildings = JSON.parse(temp);
});
refresh_orbs = function() {
    con.query('SELECT * FROM oberlin_orbs', function(err, results) {
        if (err) throw err;
        var temp = JSON.stringify(results);
        data.orbs = JSON.parse(temp);
    });
};
//--------------------OAuth--------------------//

client_id = 'b1fa18a42a9b5fb0a27cb525d3283066aebf86284e6b08640faccafc133336f0';
client_secret = '45daebf2070721410815e0b2e054d16c195bac1c1cdfa5e2ad438d3b35888af5';
authorize_url = 'https://cloud.lifx.com/oauth/authorize?client_id=b1fa18a42a9b5fb0a27cb525d3283066aebf86284e6b08640faccafc133336f0&scope=remote_control:all&state=3(#0/!~&response_type=code';
token_url = 'https://cloud.lifx.com/oauth/token';
required_scope = 'remote_control:all';

var oauth2 = require('simple-oauth2')({
  clientID: client_id,
  clientSecret: client_secret,
  site: 'https://cloud.lifx.com/',
  tokenPath: '/oauth/token',
  authorizationPath: '/oauth/authorize'
});

var authorization_uri = oauth2.authCode.authorizeURL({
  redirect_uri: 'http://environmentalorb.org/redirect',
  scope: required_scope,
  state: '3(#0/!~'
});

//con.end(function(err) {});

//--------------------Other--------------------//
// args = [api.getBuildings, api.filterBuildings];
// api.getToken.apply(this, args);
