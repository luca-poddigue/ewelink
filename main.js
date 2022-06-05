const ewelink = require('ewelink-api');
const http = require('http');
const url = require('url');
const axios = require('axios');

const connection = new ewelink({
    email: process.env.EWELINK_EMAIL,
    password: process.env.EWELINK_PASSWORD,
    region: 'eu'
});
const defaultSecondsOn = 60;
const defaultSecondsOff = 60;
const deviceId = process.env.DEVICE_ID || '1000e247dd';
const deviceChannel = process.env.DEVICE_CHANNEL || 4;

const server = http.createServer(requestListener);
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});


var nextStep;

function requestListener(req, res) {
    if (process.env.PASSWORD !== req.headers.password) {
        res.writeHead(401);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    if (req.method === 'POST') {
        if (parsedUrl.pathname === '/start') {
            nextStep != null && clearTimeout(nextStep)
            const secondsOn = Number(parsedUrl.query.on_seconds || defaultSecondsOn);
            const secondsOff = Number(parsedUrl.query.off_seconds || defaultSecondsOff);
            setDevicePowerState('on', secondsOff !== 0, secondsOn, secondsOff)
            res.writeHead(200);
        } else if (parsedUrl.pathname === '/stop') {
            nextStep != null && clearTimeout(nextStep)
            setDevicePowerState('off', false)
            res.writeHead(200);
        } else {
            res.writeHead(400);
        }
    } else if (req.method === 'GET') {
        if (parsedUrl.pathname === '/status') {
            res.writeHead(200);
        } else {
            res.writeHead(400);
        }
    } else {
        res.writeHead(405);
    }
    res.end();
}

async function setDevicePowerState(powerState, loop, secondsOn, secondsOff) {
    console.log(await connection.setDevicePowerState(deviceId, powerState, deviceChannel))
    if (loop) {
        sendKeepAliveRequest();
        if (powerState === 'on') {
            nextStep = setTimeout(() => setDevicePowerState('off', true, secondsOn, secondsOff), secondsOn * 1000)
        } else {
            nextStep = setTimeout(() => setDevicePowerState('on', true, secondsOn, secondsOff), secondsOff * 1000)
        }
    }
}

function sendKeepAliveRequest() {
    const url = (process.env.PUBLIC_URL || (`http://localhost:${PORT}`) )+ '/status';
    const config = {
        headers: {
            'password': process.env.PASSWORD
        }
    }
    axios
        .get(url, config)
        .then(res => {
            console.log(`Keep-alive status: ${res.status}`);
        })
        .catch(error => {
            console.error(`Keep-alive error: ${error}`);
        });
}