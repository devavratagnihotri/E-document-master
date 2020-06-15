const express = require('express');
const app = express();
var mysql = require('mysql');

const {tname} = require('../routes/users/')

app.use(express.static('../views'))

app.post('/upload', (req, res) => {
    const{Type , file} = req.body;
    
    var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "document"
    });

    var table = tname;
    var type = Type;
    var blob = new Blob([file]);

    con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "INSERT INTO "+ table +" (type, doc) VALUES ( "+ type +" , " + blob +" )";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        });
    });

    con.end(function(err) {
        if (err) {
          return console.log('error:' + err.message);
        }
        console.log('Close the database connection.');
    });

    res.end();

})