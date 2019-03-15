const axios = require('axios');
const express = require('express');
const router = express.Router();
const logger = require('../support/logger');
const ip = require('../support/ip');

const bot_ip = process.env.BOT_IP_ADDRESS || '192.168.1.1';

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

router.post('/execute', (req, res) => {
    let config = req.body.config;
    const address = ip.address();
    if(!address) {
        logger.error('IP Address for the host could not be found');
        const status = 500;
        const msg = logger.buildPayload(loggerl.level.OK, 'Could not find host IP Address programmatically');
        res.status(status).send(msg);
    } else {
        config.ipAddress = address;

        axios.post(`${bot_ip}/execute`, config)
            .then((bot_res) => {
                logger.ok(bot_res);
                const status = 200;
                
                res.status(status).send(bot_res);
            })
            .catch((err) => {
                const str = 'Error uploading config to bot';
                logger.error(str);
                logger.error(err);
                const status = 500;
                const msg = logger.buildPayload(logger.level.OK, str);

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