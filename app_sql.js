var mysql = require("mysql");

var con = mysql.createConnection({
    host: "environmentaldashboard.org",
    port: 3306,
    user: "augustus",
    password: "Diftyb18",
    database: "TimDB",
    charsetc: "utf8"
});

con.connect(function(err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Sql Connection Established.');
});

exports.get_meters = function(callback) {
    val = con.query('SELECT * FROM meters', function(err, results) {
        if (err) throw err;
        var meters = JSON.parse(JSON.stringify(results));
        if (callback) callback(meters);
    });
};

exports.get_buildings = function(callback) {
    con.query('SELECT * FROM buildings', function(err, results) {
        if (err) throw err;
        var buildings = JSON.parse(JSON.stringify(results));
        if (callback) callback(buildings);
    });
};

exports.get_orbs = function(callback) {
    con.query('SELECT * FROM orbs', function(err, results) {
        if (err) throw err;
        var orbs = JSON.parse(JSON.stringify(results));
        if (callback) callback(orbs);
    });
};

exports.get_settings = function(callback){
    con.query('SELECT * FROM lifx_settings', function(err, results) {
            if (err) throw err;
            var settings = JSON.parse(JSON.stringify(results));
            if (callback) callback(settings);
    });
};

exports.set_settings = function(settings,callback){
    var sql = 'UPDATE lifx_settings SET orbs=?, buildings=?, floors=?, token=? WHERE name=?';
    var inserts = [settings[0].orbs, settings[1].buildings, settings[2].floors, settings[3].token, settings[4].name];
    sql = mysql.format(sql, inserts);
    con.query(sql, function(err, results) {
            if (err) throw err;
            var settings = JSON.parse(JSON.stringify(results));
            if (callback) callback(settings);
    });
};

// UPDATE customers
// SET first_name = 'Judy'
// WHERE customer_id = 8000;
exports.get_data = function(start, end, res, meter, callback) {
    con.query('SELECT id FROM meters WHERE url=?', meter, function(err, results) {
        if (err) throw err;
        var id = JSON.parse(JSON.stringify(results))[0].id;
        var sql = 'SELECT value,recorded FROM meter_data WHERE meter_id = ? AND resolution = ? AND recorded > ? AND recorded < ? ORDER BY recorded ASC';
        var inserts = [id, res, start, end];
        sql = mysql.format(sql, inserts);
        con.query(sql, function(err, results) {
            if (err) throw err;
            var data = JSON.parse(JSON.stringify(results));
            if (callback) callback(data);
        });
    });
};

exports.get_current = function(url,callback){
    con.query('SELECT current FROM meters WHERE url=?', url, function(err, results) {
        if (err) throw err;
        var current = JSON.parse(JSON.stringify(results))[0].current;
        if (callback) callback(current);
    });
};

exports.add_orb = function(name, meter_one, meter_two, callback) {
    var sql = 'INSERT into orbs (name, meter_one, meter_two) VALUES (?, ?, ?)';
    var inserts = [name,meter_one,meter_two];
    sql = mysql.format(sql, inserts);
    con.query(sql, function(err, results) {
        if (err) throw err;
        var ret = JSON.parse(JSON.stringify(results));
        if (callback) callback(ret);
    });
};

exports.delete_orb = function(name, callback) {
    con.query('DELETE FROM orbs WHERE name=?', name, function(err, results) {
        if (err) throw err;
        var ret = JSON.parse(JSON.stringify(results));
        if (callback) callback(ret);
    });
};
