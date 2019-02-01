const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const express = require('express');
const router = express.Router();

const configDir = path.join(process.cwd(), '/configs');


/* JSON format expected for each posted data
{
    "configName": "string",     // Name of the configuration, this is unique
    "data": {}                  // Unknown, needs discussion. Will probably be stored raw.
}
*/
router.post('/create', (req, res) => {
    const fileName = req.body.configName + '.json';
    const data = req.body.data;

    const filePath = path.join(configDir, fileName);

    if(fs.existsSync(filePath)) {
        const msg = logger.buildPayload(logger.level.ERROR, 'Config already exists, update instead');
        const status = 403;
        res.status(status).send(msg);
    } else {
        fs.writeFile(filePath, JSON.stringify(data), (err) => {
            let msg, status;
            if(err) {
                logger.log(logger.level.ERROR, err);

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

router.get('/read', (req, res) => {
    const fileName = req.query.configName + '.json';
    const filePath = path.join(configDir, fileName);

    if(fs.existsSync(filePath)) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            let msg, status;
            if(err) {
                logger.log(logger.level.ERROR, err);

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

router.get('/list', (req, res) => {
    fs.readdir(configDir, 'utf8', (err, data) => {
        let msg, status;
        if(err) {
            logger.log(logger.level.ERROR, err);

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

