const express = require("express");
const app = express();
const cors = require("cors");
var MongoClient = require("mongodb");
const bodyParser = require("body-parser");

const conn = require("./config/deployement-config").conn;

const port = process.env.PORT || 5000;

const self_uri = process.env.SELF_URI || "http://localhost:5000/";

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

app.use(
    cors({
        origin: "*",
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET"],
    })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

function getCollection(deviceId) {
    return "pollution_data_" + deviceId;
}

app.get("/", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ status: "INVALID" }));
});

app.get("/getdata", (req, res) => {
    var status = "FAILED";
    res.setHeader("Content-Type", "application/json");

    let request;
    if (req.query.deviceId) {
        request = req.query;
    } else if (req.params.deviceId) {
        request = req.params;
    } else if (req.body.deviceId) {
        request = req.body;
    } else {
        res.send({
            status: "INVALID",
        });
        return;
    }

    console.log(request);

    const deviceId = request.deviceId;
    const startTime = new Date(request.startTime).toISOString();
    const endTime = new Date(request.endTime).toISOString();

    console.log(`${startTime} - ${endTime}`);

    const query = {
        startTime: { $lte: endTime },
        endTime: { $gte: startTime },
    };

    const collectionName = getCollection(deviceId);

    console.log("Querying collection " + collectionName);

    let journeyData;

    dbo.collection(collectionName)
        .find(query, { sort: { startTime: 1 } })
        .toArray((err, dbRes) => {
            if (err) {
                res.send({
                    status: "FAILED",
                    err: "UNEXPECTED",
                });
            }
            journeyData = dbRes;

            if (journeyData) status = "SUCCESS";
            const result = {
                status: status,
                journeyData: journeyData,
            };

            res.setHeader("Content-Type", "application/json");
            res.send(result);
        });
});

app.post("/recorddata", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const deviceId = req.body.deviceId;
    const journeyData = req.body.journeyData;
    const collectionName = getCollection(deviceId);

    console.log("Device: " + deviceId + " | Data : " + journeyData);

    if (!collectionName) {
        dbo.createCollection(collectionName);
    }
    dbo.collection(collectionName).insertOne(journeyData, (err, dbRes) => {
        if (err) {
            res.send({
                status: "FAILED",
            });
            return;
        }
        console.log("Joruney Data inserted");
        res.send({
            status: "SUCCESS",
        });
    });
});

app.listen(port, () => console.log("Started on port: " + port));
