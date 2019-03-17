const express = require('express');
const router = express.Router();
const db = require('../support/db');
const logger = require('../support/logger');

// Table/Measure to put data in
const measure = 'run';  

/* JSON format expected for each posted data
{
    "botName": "string",                        // Name of the hyper rail that made this request
    "runName": "string",                        // Name of the run. User defined.
    "data": { some data }
}
*/

//Creating a data entry in the runs database
router.post('/create', (req, res) => {
    const client = db.get();
    const formatData = [{
        fields: {
            value: req.body.data,
        },
        tags: {
            botName: req.body.botName,
            runName: req.body.runName
        },
        timestamp: new Date(elem.time * 1000)
    }];

    // Write to database
    client.writeMeasurement(measure, formatData)
        .then(() => {
            const msg = logger.buildPayload(logger.level.OK, 'Data uploaded');
            const status = 201;
            res.status(status).send(msg);
        })
        .catch((err) => {
            logger.error(err);

            const msg = logger.buildPayload(logger.level.ERROR, 'Error uploading');
            const status = 500;
            res.status(status).send(msg);
        });
});

// Params: Any tag defined in the db schema
// Search the database for data entries
router.get('/search', (req, res) => {
    const client = db.get();
    let dbQuery = `SELECT * FROM ${measure} WHERE `;
	let empty = true;
	let filter = req.query['filter'];

	// Build query from parameters (if parameters exist)
	for(let key in req.query) {
		if(req.query[key] != '' && key != 'filter') {
			empty = false;
			if(filter == '1')	//Match filter
				dbQuery += `"${key}" = '${req.query[key]}' AND `;
			else				//Contains filter, equivalent to a LIKE query
				dbQuery += `"${key}" =~ /${req.query[key]}/ AND `;
		}
	}
	// Trim extra ' AND ' or ' WHERE ' at end of string if parameters exist or not
	if(!empty) {
		dbQuery = dbQuery.substring(0, dbQuery.length - 5);
    } else {
        dbQuery = dbQuery.substring(0, dbQuery.length - 7);
    }
	
    // Run query
    client.query(dbQuery)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            logger.error(err);

            const msg = logger.buildPayload(logger.level.ERROR, 'Error reading database');
            const status = 500;
            res.status(status).send(msg);
        });
});

module.exports = router;