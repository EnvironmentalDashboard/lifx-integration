/*jshint esversion: 6 */

var sql = require("./app_sql.js");

//In unix (seconds)
var minute = 60;
var hour = minute * 60;
var day = hour * 24;

exports.get_color = function(url,water,callback) {
    var date = new Date();
    var now  = date.getTime();//Gets the date
    var hour = date.getHours();//Gets current hour
    now = Math.round(date.getTime() / 1000);//Converts to unix
    var last_week = now - (day * 7);//Last week in unix
    sql.get_current(url, function(data) {
        var current = data;
        sql.get_data(last_week, now, 'hour', url, function(data) {
            var past = data;
            past = past.filter(n => {
                return n.value !== null;
            });
            past = past.filter(n => {
                return (new Date(n.recorded*1000).getHours() == hour);
            });
            var filtered = past.map(n => {
                return n.value;
            });
            filtered.push(current);
            filtered = filtered.sort();
            index = filtered.indexOf(current);
            relative_value = ((index + 1) / past.length) * 100;
            if (callback) callback(pick_color(relative_value,water));
        });
    });
};

pick_color = function(relative_value, water) {
    if (!water) {
        if (relative_value <= 20) {
            color = "hue:120 saturation:0.6 brightness:1.0";
        }
        if (relative_value >= 20) {
            color = "hue:83 saturation:1.0 brightness:1.0";
        }
        if (relative_value >= 40) {
            color = "hue:60 saturation:1.0 brightness:1.0";
        }
        if (relative_value >= 60) {
            color = "hue:38 saturation:1.0 brightness:1.0";
        }
        if (relative_value >= 80) {
            color = "hue:0 saturation:1.0 brightness:1.0";
        }
    } else {
        if (relative_value  <= 20) {
            color = "hue:180 saturation:1.0 brightness:1.0";
        }
        if (relative_value >= 20) {
            color = "hue:210 saturation:0.14 brightness:1.0";
        }
        if (relative_value >= 40) {
            color = "hue:300 saturation:1.0 brightness:1.0";
        }
        if (relative_value >= 60) {
            color = "hue:287 saturation:0.81 brightness:1.0";
        }
        if (relative_value >= 80) {
            color = "hue:350 saturation:1.0 brightness:1.0";
        }
    }
    return color;
};
