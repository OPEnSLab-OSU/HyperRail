const axios = require('axios');
const express = require('express');
const router = express.Router();
const logger = require('../support/logger');
const monitor = require('../support/monitor');

// Endpoint for bot to connect to network
/* 
{
    name: "string",         // Name/ID of the bot
}
*/
router.post('/connect', (req, res) => {
    const name = req.body.name;
    monitor.add(name);
});


// Trigger a run based on a config. 
/* 
{
    name: "string",         // Name of the run
    bot: "string",          // ID of the bot to run
    config: {               // Standard config with run details

    },
    schedule: {             
        duration: number,   // Duration to run the test
        startTime: number,  // When to trigger the run
        run-count: number   // Amount of times to run this 
    }
}
*/
router.post('/execute', (req, res) => {
    const config = req.body.config;
    const schedule = req.body.schedule;


});

router.get('/status', (req, res) => {
    const msg = logger.buildPayload(logger.level.OK, 'Everything good');
    const status = 200;
    res.status(status).send(msg);
});

module.exports = router;