const fs = require('fs');
const path = require('path');
const logger = require('../support/logger');
const express = require('express');
const router = express.Router();

const configDir = path.join(process.cwd(), '/configs');

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

// Edit a config file for the HyperRail
router.post('/edit', (req, res) => {
    const newFileName = `${req.body.configName}.json`;
    const filePath = path.join(configDir, newFileName);
	
	const oldFileName = `${req.body.oldConfigName}.json`;
    const oldFilePath = path.join(configDir, oldFileName);
	
	const data = req.body.data;
    
	ensureDirs();

	// Check if the config name exists
    if(fs.existsSync(filePath)) {
        const msg = logger.buildPayload(logger.level.ERROR, 'Config already exists');
        const status = 403;
        res.status(status).send(msg);
    } else {
		let msg1, msg2, status;
		// Remove the old config file
		logger.ok(`Removed config: ${oldFileName}`);
		fs.unlink(oldFilePath, (err) => {
			if(err) {
				logger.error(err);
				
				msg1 = logger.buildPayload(logger.level.ERROR, 'Error removing old config file\n');
			} else {
				msg1 = logger.buildPayload(logger.level.OK, 'Config removed\n');
			}
		});
		// If the config doesn't exist, create a new file
		logger.ok(`Created config: ${newFileName}`);
        fs.writeFile(filePath, JSON.stringify(data), (err) => {
            if(err) {
                logger.error(err);

                msg2 = logger.buildPayload(logger.level.ERROR, 'Error writing config to file');
                status = 500;
            } else {
                msg2 = logger.buildPayload(logger.level.OK, 'Config created');
                status = 201;
            }
            res.status(status).send([msg1, msg2]);
        });
    }
});

// Read a config file
router.post('/read', (req, res) => {
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
