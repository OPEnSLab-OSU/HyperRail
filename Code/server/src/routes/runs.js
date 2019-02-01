const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../logger');

// Table to put data in
const measure = 'run';  

/* JSON format expected for each posted data
{
    "botName": "string",                        // Name of the hyper rail that made this request
    "data": [                            
        {
            "type": "sensor type",              // Each sensor get's it's own array of values
            "time": "unix timestamp",           // Time the sample was taken. Format is UNIX timestamp in seconds
            "value": "value"                    // Value receieved from sensor
        }
    ]
}
*/

router.post('/create', (req, res) => {
    const client = db.get();
    const data = req.body.data;
    let formatData = [];

    // Format given data to InfluxDB format
    data.forEach((elem) => {
        formatData.push({
            fields: {
                value: elem.value,
            },
            tags: {
                type: elem.type,
                bot: req.body.botName,
                name: req.body.runName
            },
            timestamp: new Date(elem.time * 1000)
        });
    });

    // Write to database
    client.writeMeasurement(measure, formatData)
        .then(() => {
            const msg = logger.buildPayload(logger.level.OK, 'Data uploaded');
            const status = 201;
            res.status(status).send(msg);
        })
        .catch((err) => {
            logger.log(logger.level.ERROR, err);

            const msg = logger.buildPayload(logger.level.ERROR, 'Error uploading');
            const status = 500;
            res.status(status).send(msg);
        });
});

// Param: bot=<bot name>
router.get('/read', (req, res) => {
    const client = db.get();
    let dbQuery = `SELECT * FROM ${measure}`;
    if(req.query.bot) {
        dbQuery = `SELECT * FROM ${measure} WHERE bot='${req.query.bot}'`;
    }
    client.query(dbQuery)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            logger.log(logger.level.ERROR, err);

            const msg = logger.buildPayload(logger.level.ERROR, 'Error uploading');
            const status = 500;
            res.status(status).send(msg);
        });
});

module.exports = router;