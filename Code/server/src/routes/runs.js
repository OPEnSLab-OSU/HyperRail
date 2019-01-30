const express = require('express');
const router = express.Router();
const db = require('../db');

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

router.put('/upload', (req, res) => {
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
                bot: req.body.botName
            },
            timestamp: new Date(elem.time * 1000)
        });
    });

    // Write to database
    client.writeMeasurement(measure, formatData)
        .then(() => {
            res.status(201).send('Data uploaded');
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error uploading');
        });
});

// Param: bot
router.get('/list', async (req, res) => {
    const client = db.get();
    let dbQuery = `SELECT * FROM ${measure}`
    if(req.query.bot) {
        dbQuery = `SELECT * FROM ${measure} WHERE bot='${req.query.bot}'`
    }
    client.query(dbQuery)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error uploading');
        });
});

module.exports = router;