const fs = require('fs');
const path = require('path');
const logger = require('../support/logger');
const express = require('express');
const router = express.Router();

const configDir = path.join(process.cwd(), '/configs');
const sensorList = path.join(process.cwd(), '/sensors.json');

/* JSON format expected for each posted data
{
    "configName": "string",     // Name of the configuration, this is unique
    "data": {
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
}
*/

// Create a config file for the HyperRail
router.post('/create', (req, res) => {
    const fileName = `${req.body.configName}.json`;
    const data = req.body.data;

    const filePath = path.join(configDir, fileName);
    
    ensureDirs();
    logger.ok(`Created config: ${fileName}`);

	// Check if the config name exists
    if(fs.existsSync(filePath)) {
        const msg = logger.buildPayload(logger.level.ERROR, 'Config already exists, update instead');
        const status = 403;
        res.status(status).send(msg);
    } else {
		// If the config doesn't exist, create a new file
        fs.writeFile(filePath, JSON.stringify(data), (err) => {
            let msg, status;
            if(err) {
                logger.error(err);

                msg = logger.buildPayload(logger.level.ERROR, 'Error writing config to file');
                status = 500;
            } else {
                msg = logger.buildPayload(logger.level.OK, 'Config created');
                status = 201;
            }
            res.status(status).send(msg);
        });
    }
});

// Read a config file
router.get('/read', (req, res) => {
    const fileName = `${req.body.configName}.json`;
    const filePath = path.join(configDir, fileName);

    ensureDirs();

    if(fs.existsSync(filePath)) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            let msg, status;
            if(err) {
                logger.error(err);

                msg = logger.buildPayload(logger.level.ERROR, 'Error reading file');
                status = 500;
            } else {
                msg = JSON.parse(data);
                status = 200;
            }   
            res.status(status).send(msg);
        });
    } else {
        const msg = logger.buildPayload(logger.level.ERROR, 'Config not found');
        const status = 404;
        res.status(status).send(msg);
    }
});

// List all of the current sensors in the sensor file
router.get('/getSensors', (req, res) => {
    ensureDirs();
    fs.readFile(sensorList, 'utf8', (err, data) => {
		let msg, status;
		
		//If there was an error reading, notify the user
        if(err) {
            logger.error(err);
            msg = logger.buildPayload(logger.level.ERROR, 'Error reading file');
            status = 500;
        } else {
			//If there was no issue, send the data
            msg = JSON.parse(data);
            status = 200;
        }   
        res.status(status).send(msg);
	});
});

// List all of the current config files
router.get('/list', (req, res) => {
    ensureDirs();
    fs.readdir(configDir, 'utf8', (err, data) => {
        let msg, status;
        if(err) {
            logger.error(err);

            msg = logger.buildPayload(logger.level.ERROR, 'Error finding files');
            status = 500;
        } else {
            msg = data;
            status = 200;
        }
        res.status(status).send(msg);
    });
});

module.exports = router;

function ensureDirs() {
    if(!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
    }
}
