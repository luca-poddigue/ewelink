const ewelink = require('ewelink-api');
const http = require('http');

const connection = new ewelink({
    email: process.env.EWELINK_EMAIL,
    password: process.env.EWELINK_PASSWORD,
    region: 'eu'
});
const secondsOn = 2;
const secondsOff = 2;
const deviceId = '1000b5e49d';

const server = http.createServer(requestListener);
server.listen(9000);


var nextStep;

function requestListener(req, res) {
    if (req.url === '/start') {
        nextStep != null && clearTimeout(nextStep)
        setDevicePowerState('on', true)
        res.writeHead(200);
    } else if (req.url === '/stop') {
        nextStep != null && clearTimeout(nextStep)
        setDevicePowerState('off', false)
        res.writeHead(200);
    } else {
        res.writeHead(400);
    }
    res.end();
}

async function setDevicePowerState(powerState, loop) {
    console.log(await connection.setDevicePowerState(deviceId, powerState))
    if (loop) {
        if (powerState === 'on') {
            nextStep = setTimeout(() => setDevicePowerState('off', true), secondsOn*1000)
        } else {
            nextStep = setTimeout(() => setDevicePowerState('on', true), secondsOff*1000)
        }
    }
}
// nebulizzatore: 1000e247dd