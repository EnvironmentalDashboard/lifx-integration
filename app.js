/*jshint esversion: 6 */

//-------------------Require-------------------//
var express = require("express"),
    path = require("path"),
    exphbs = require("express-handlebars"),
    bodyParser = require('body-parser'),
    http = require('http'),
    https = require('https'),
    rest = require('restler'),
    needle = require('needle'),
    sql = require('./app_sql.js'),
    colors = require('./app_colors.js'),
    http_request = require('request'),
    querystring = require("querystring"),
    job = require('./app_job.js'),
    fs = require('fs'),
    api = require("./api.js"),
    port = 3000;

//---------------------App---------------------//
app = express();

var ssl_options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

https.createServer(ssl_options, app, function(req, res) {}).listen(443);
http.createServer(app, function(req, res) {}).listen(80);

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
exports.data = {};
sql.get_meters(meters => {
    exports.data.meters = meters;
});
sql.get_buildings(buildings => {
    exports.data.buildings = buildings;
});
sql.get_orbs(orbs => {
    exports.data.orbs = orbs;
});
sql.get_settings(settings => {
    exports.data.settings = settings;
});

var building_picked = function(params, response) {};

app.get('/', (request, response) => {
    sql.get_orbs(orbs => {
        exports.data.orbs = orbs;
    });
    sql.get_meters(meters => {
        exports.data.meters = meters;
    });
    sql.get_buildings(buildings => {
        exports.data.buildings = buildings;
    });
    sql.get_settings(settings => {
        exports.data.settings = settings;
    });
    response.render('home', exports.data);
});

app.post('/save_orb', (request, response) => {
    sql.add_orb(request.body.name, request.body.meter_one, request.body.meter_two);
    response.redirect('/');
});

app.post('/delete_orb', (request, response) => {
    sql.delete_orb(request.body.delete);
    response.redirect('/');
});

// app.post('/building_picked', (request, response) => {
//     building_picked(request.body, response);
// });

app.get('/test', (request, response) => {
    sql.get_meters(function() {
        console.log(sql.data.meters);
    });
});

app.get('/redirect', (request, response) => {
    var code = request.query.code;
    var state = request.query.state;
    var params = {
        client_id: 'b1fa18a42a9b5fb0a27cb525d3283066aebf86284e6b08640faccafc133336f0',
        client_secret: '45daebf2070721410815e0b2e054d16c195bac1c1cdfa5e2ad438d3b35888af5',
        code: code,
        grant_type: 'authorization_code'
    };

    //TODO: Stop using needle
    needle.post('https://cloud.lifx.com/oauth/token', params, function(err, resp) {
        //TODO: Make this maintain settings
        sql.set_settings([{orbs:1},{buildings:0},{floors:0},{token:resp.body.access_token},{name:'oberlin'}], ret => {
            sql.get_settings(settings => {
                exports.data.settings = settings;
            });
        });
    });
    response.redirect('/');
});

app.get('/auth', function(req, res) {
    var query = querystring.stringify({
        client_id: "b1fa18a42a9b5fb0a27cb525d3283066aebf86284e6b08640faccafc133336f0",
        scope: "remote_control:all",
        state: "3(#0/!~",
        response_type: "code"
    });
    res.redirect("https://cloud.lifx.com/oauth/authorize?" + query);
});
