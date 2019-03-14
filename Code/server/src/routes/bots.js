const axios = require('axios');
const express = require('express');
const router = express.Router();
const logger = require('../support/logger');
const ip = require('../support/ip');

// Trigger a run based on a config. 
/* 
{
    ipAddres: [integer],
    option: integer,
    totalSteps: integer,
    delayTime: integer,
    intervalFlag: integer,
    intervalSteps: integer,
    stops: integer,
    luxActivated: integer,
    co2Activated: integer,
    particleActivated: integer,
    humidityActivated: integer,
    temperatureActivated: integer,
    timeInterval: integer,
}
*/
router.get('/connect', (req, res) => {
    logger.ok('Bot connected');
    res.send();
});

router.post('/execute', (req, res) => {
    let msg = req.body.config;
    const address = ip.address();
    if(address) {
        logger.error('IP Address for the host could not be found');
        return;
    }
    msg.ipAddress = address;
    const status = 200;

    res.status(status).send(msg);
});

router.get('/status', (req, res) => {
    const msg = logger.buildPayload(logger.level.OK, 'Everything good');
    const status = 200;
    res.status(status).send(msg);
});

module.exports = router;