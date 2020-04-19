function random(low, high) {
    return Math.floor(randomFloat(low, high));
}

function randomFloat(low, high) {
    return Math.random() * (high - low) + low;
}

function getPaddedRandom(low, high, padding) {
    return random(low, high).toString().padStart(padding, "0");
}

function padNumber(num, padding) {
    return num.toString().padStart(padding, "0");
}

function postRandomData() {
    const https = require("https");

    const month = getPaddedRandom(1, 12, 2);
    const day = getPaddedRandom(1, 30, 2);
    var startHour = random(0, 20);
    var endHour = random(startHour, 24);
    startHour = padNumber(startHour, 2);
    endHour = padNumber(endHour, 2);
    const startTime = new Date(
        `2019-${month}-${day}T${startHour}:00:00Z`
    ).toISOString();
    const endTime = new Date(
        `2019-${month}-${day}T${endHour}:00:00Z`
    ).toISOString();

    const data = JSON.stringify({
        deviceId: "testid",
        journeyData: {
            startTime: startTime,
            endTime: endTime,
            startLocationLat: randomFloat(-90, 90),
            startLocationLon: randomFloat(-180, 180),
            endLocationLat: random(-90, 90),
            endLocationLon: random(-180, 180),
            emissionAvg: random(100, 900),
            emissionTotal: random(10, 1000),
            maxSpeed: random(10, 120),
            speed: random(10, 120),
            engineTempMax: random(80, 200),
            engineTempMin: random(20, 80),
            engineTemp: random(20, 200),
            exhaustTemp: random(80, 120),
            ambientTemp: random(10, 50),
        },
    });

    console.log(data);

    const options = {
        hostname: "https://carspoll.azurewebsites.net/",
        port: 443,
        path: "/recorddata",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
        },
    };

    const req = https.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on("data", (d) => {
            process.stdout.write(d);
        });
    });

    req.on("error", (error) => {
        console.error(error);
    });

    req.write(data);
    req.end();
}

postRandomData();
