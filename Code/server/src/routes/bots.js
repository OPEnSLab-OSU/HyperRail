const axios = require('axios');
const express = require('express');
const router = express.Router();
const logger = require('../support/logger');
const ip = require('../support/ip');

const botAddress = process.env.BOT_IP_ADDRESS || '192.168.1.1';

// Trigger a run based on a config. 
/* 
{
    runName: string,
    botName: string,
    ipAddress: [integer],
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

router.post('/execute', (req, res) => {
    let config = req.body;
    const address = ip.address();
    if(!address) {
        logger.error('IP Address for the host could not be found');
        const status = 500;
        const msg = logger.buildPayload(logger.level.ERROR, 'Could not find host IP Address programmatically');
        res.status(status).send(msg);
    } else {
        config.ipAddress = address;
        axios.post(`http://${botAddress}/execute`, config)
            .then((botRes) => {
                const str = 'Config uploaded to bot, executing...';
                logger.ok(str);
                let status, msg;
                if(botRes.data.status === "Recieved") {
                    status = 200;
                    msg = logger.buildPayload(logger.level.OK, str);
                } else {
                    status = 500;
                    msg = logger.buildPayload(logger.level.ERROR, 'Connected to bot, but upload failed');
                }
                res.status(status).send(msg);
            })
            .catch((err) => {
                const str = 'Error uploading config to bot';
                logger.error(`${str}: ${err}`);
                const status = 500;
                const msg = logger.buildPayload(logger.level.ERROR, str);

                res.status(status).send(msg);
            });
    } 
});

router.get('/status', (req, res) => {
    const msg = logger.buildPayload(logger.level.OK, 'Everything good');
    const status = 200;
    res.status(status).send(msg);
});

module.exports = router;