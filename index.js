const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
var MongoClient = require("mongodb").MongoClient;
const conn = require("./config/deployement-config").conn;

let db, dbo;

console.log("Env URI: " + process.env.MONGO_URI);
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

function getCollection(deviceID) {
    "pollution_data_" + deviceID;
}

app.use(
    cors({
        origin: "http://localhost:5000/",
    })
);

app.get("/", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ status: "INVALID" }));
});

app.get("/getdata", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const deviceID = req.deviceID;
    const startDate = new Date(req.start).toISOString;
    const endDate = new Date(req.endDate).toISOString;

    const query = {
        startTime: { $lte: endDate },
        endTime: { $gte: startDate },
    };

    const collectionName = getCollection(deviceID);

    let journeyData;

    dbo.collection(collectionName)
        .find(query)
        .toArray((err, res) => {
            if (err) {
                res.send({
                    status: "FAILED",
                    err: "UNEXPECTED",
                });
            }
            console.log("Got result " + res);
            journeyData = res;
        });

    const result = {
        status: "SUCCESS",
        journeyData: journeyData,
    };

    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(result));
});

app.get("/recorddata", (req, res) => {
    const deviceID = req.deviceID;
    const journeyData = req.journeyData;
    const collectionName = getCollection(deviceID);

    dbo.createCollection(collectionName);
    dbo.collection(collectionName).insertOne(journeyData, (err, res) => {
        if (err) throw err;
        console.log("Joruney Data inserted");
    });

    res.setHeader("Content-Type", "application/json");
    res.send({
        status: "SUCCESS",
    });
});

app.listen(port, () => console.log("Started on port: " + port));
