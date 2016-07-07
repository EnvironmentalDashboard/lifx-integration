//Login info and the likes
client_id = 'vtmF5VoO-CmrB?eQHBoMNNAvAU!faAwl2O98!2Ua';
client_secret = 'q!gywR70Vm0TUX6=8mdFiQE3eSVb=qzUh=n2NAr2U4.E6Uu165xwP3JPZWOm-_8WXwj9wfGGC8LK@25Pa8Pc_sj@XvNc3Q4A4wNzsRNDGpDMV7w@yVn-JNnL!YZ33T5.';
grant_type = 'password';
username = 'smeyer@oberlin.edu';
password = 'ironsail1';
meter_url = 'https://api.buildingos.com/meters/';
token_url = 'https://api.buildingos.com/o/token/';
refresh_url = 'https://api.buildingos.com/o/refresh/';
building_url = 'https://api.buildingos.com/buildings/';

//Data we want in other places
exports.token = null;
exports.buildings = null;
exports.buildings_names = null;

//Imports
var request = require("request"),
    http = require("http");

//All functions are exported so they can be used anywhere
exports.getToken = function(callback, second_callback) {
    var url = token_url + "?client_id=" + client_id + "&client_secret=" + client_secret + "&username=" + username + "&password=" + password + "&grant_type=" + grant_type;
    request.post(url, function(error, response, body) {
        exports.token = JSON.parse(body).access_token;
        if (callback && second_callback) callback(second_callback);
        else if (callback) callback();
    });
};

exports.getBuildings = function(callback) {
    var options = {
        url: building_url + '?per_page=100',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + exports.token
        }
    };
    request(options, function(error, response, body) {
        var json = JSON.parse(body);
        var list = [];
        for (var i = 0; i < json.total_count; i++) {
            try {
                obj = {
                    name: json.data[i].name,
                    meters: json.data[i].meters
                };
            } catch (e) {}
            list.push(obj);
        }
        exports.buildings = list;
        if (callback) callback();
    });
};

exports.filterBuildings = function(callback) {
    var list = [];
    for (var i = 0; i < exports.buildings.length; i++) {
        list.push(exports.buildings[i].name);
    }
    exports.buildings_names = list;
    if (callback) callback();
};

// args = [getBuildings,filterBuildings];
// getToken.apply(this,args);

// function makeCall(start, end, point, res) {
//     //Gets token
//     var token = Meteor.call("getToken");
//
//     //Checks to see if any params are null
//     start = typeof start !== 'undefined' ? start : "";
//     end = typeof end !== 'undefined' ? end : "";
//     point = typeof point !== 'undefined' ? point : "";
//     res = typeof res !== 'undefined' ? res : "";
//
//     //Generate Url
//     var parameters = [];
//     var qs = [];
//     if (start != 0) {
//         parameters["start"] = start;
//     }
//     if (end != 0) {
//         parameters["end"] = end;
//
//     }
//     if (res != 0) {
//         parameters["resolution"] = res;
//
//     }
//     for (var d in parameters)
//         qs.push(encodeURIComponent(d) + "=" + encodeURIComponent(parameters[d]));
//     var url = meter_url + point + '/data?' + qs.join("&");
//
//     //Make the call
//     var results = HTTP.get(url, {
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + token
//         }
//     });
//
//     //Organize the data - Create a 2-D array where index 0 is the array holding the values
//     //and where index 1 is the array holding the dates. Jank, but plays nicer with c3.
//     var values = [];
//     values[0] = 'value';
//     for (var i = 1; i < results.data['data'].length; i++) {
//         values[i] = results.data['data'][i]['value'];
//     }
//     var date = [];
//     date[0] = 'date';
//     for (var i = 1; i < results.data['data'].length; i++) {
//         date[i] = results.data['data'][i]['localtime'].slice(0, 19);
//     }
//     both = [date, values];
//     return both;
// }
