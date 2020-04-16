const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
var MongoClient = require("mongodb").MongoClient;
const conn = require("./config/deployement-config").conn;

let db, dbo;

console.log("Connection URI : " + conn.uri);

MongoClient.connect(conn.uri, (err, db_) => {
    if (err) throw err;
    console.log("Database connected!");
    db = db_;
    dbo = db.db("carspoll");
    dbo.createCollection("pollution_data", (err, res) => {
        if (err) throw err;
        console.log("Collection - pollution_data");
    });
});

app.get("/", (req, res) => res.send("Hello world"));

app.get("/getdata", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const result = {
        status: "SUCCESS",
        data: {
            co2_content: 100,
        },
    };
    res.send(JSON.stringify(result));
});

app.listen(port, () => console.log("Started on port: " + port));
