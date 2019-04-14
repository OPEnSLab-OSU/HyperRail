const axios = require('axios');
const express = require('express');
const router = express.Router();
const logger = require('../support/logger');
const ip = require('../support/ip');

const botAddress = process.env.BOT_IP_ADDRESS || '192.168.1.1';

// Passed in from application
/*
{
	runName: string,
    botName: string,
    option: integer,
	railLength: float(m) (not used by bot),
	spoolRadius: float(mm) (not used by bot),
	velocity: float (mm/s) (not used by bot),
    intervalFlag: integer,
    intervalDistance: float(m) (not used by bot),
    stops: integer,
    luxActivated: integer,
    co2Activated: integer,
    particleActivated: integer,
    humidityActivated: integer,
    temperatureActivated: integer,
    timeInterval: integer,
}
*/

// Trigger a run based on a config. 
/* 
{
    runName: string,
    botName: string,
    ipAddress: [integer], (Not in Config, already added)
    option: integer,
    totalSteps: integer, (Not in Config, need calculation)
    delayTime: integer, (Not in Config, need calculation)
    intervalFlag: integer,
    intervalSteps: integer, (Not in Config, need calculation)
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
	
	/*
	Config missing total steps, delaytime, intervalSteps
	CALCULATIONS TAKEN FROM THE PROCESSING CODE
	
	Delay time = ((60)/(RPM * steps_per_revolution ) * pow(10, 6))/2;
	steps_per_revolution = 6180
	RPM = (velocity * 60) / (2 * 3.1415926535 * spoolRadius(mm))
	
	Total Steps = (steps_per_revolution * path_length (mm)) / (2 * 3.1415926535 * spoolRadius)
	Interval Steps = (steps_per_revolution * interval_length (mm)) / (2 * 3.1415926535 * spoolRadius) 
	*/
	let steps_per_revolution = 6180;
	let RPM = (config.velocity * 60) / (2 * 3.1415926535 * config.spoolRadius);
	let delayTime = (60 / (RPM * steps_per_revolution) * Math.pow(10, 6)) / 2;
	
	let totalSteps = (steps_per_revolution * (config.railLength * 1000)) / (2 * 3.1415926535 * config.spoolRadius);
	let intervalSteps = (steps_per_revolution * (config.intervalDistance * 1000)) / (2 * 3.1415926535 * config.spoolRadius);
	
	config.delayTime = parseInt(delayTime);
	config.totalSteps = parseInt(totalSteps);
	config.intervalSteps = parseInt(intervalSteps);
	
	logger.ok("Sent to hardware:\n" + JSON.stringify(config));
	
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
                if(botRes.data.Status === "Received") {
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