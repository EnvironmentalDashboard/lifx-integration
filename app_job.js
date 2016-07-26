/*jshint esversion: 6 */

var app = require("./app.js"),
    color = require("./app_colors"),
    request = require('request');

setInterval(function() {
    app.data.orbs.forEach(orb => {
        console.log("Starting Outer Loop");
        //TODO: Figure out water vs elec color
        color.get_color(orb.meter_one, true, ret => {
            var color_one = ret;
            color.get_color(orb.meter_two, false, ret => {
                var color_two = ret;

                run_orb = setInterval(timer.apply(color_one, color_two), 5 * 1000);
            });
        });
    });
}, 10 * 1000);

timer = function(color_one, color_two) {
    console.log("Starting Inner Loop");
    var color = color_one;
    var token = app.data.settings[0].token;
    options = {
        url: 'https://api.lifx.com/v1/lights/all/effects/breathe',
        headers : {
            "Authorization": "Bearer " + token
        },
        form: {
            "period": 2,
            "cycles": 100,
            "color": color,
        }
    };
    request.post(options, function(error, response, body) {
        if (error) console.log(error);
        else {
            var temp = color_one;
            color_one = color_two;
            color_two = temp;
            console.log(response.statusCode, body);
        }
    });
};
