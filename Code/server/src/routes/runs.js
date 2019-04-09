const express = require('express');
const router = express.Router();
const db = require('../support/db');
const logger = require('../support/logger');

// Table/Measure to put data in
const measure = 'run';

// Live data. Prevents having to query the database constantly
let liveData = {
    battery: null
};

function saveLiveData(data) {
    if("Vbat" in data) {
        liveData.battery = data.Vbat;
    }
}

/* JSON format expected for each posted data
{
    "botName": "string",                        // Name of the hyper rail that made this request
    "runName": "string",                        // Name of the run. User defined.
    "data": {
        "C": integer,
        "L": integer,
        "T": integer,
        "H": integer,
        "Lo": float,
        "Vbat": float,
    }
}
*/

//Creating a data entry in the runs database
router.post('/create', (req, res) => {
    const client = db.get();

    // Format data for database
    const formatData = [{
        fields: {
            value: JSON.stringify(req.body.data)
        },
        tags: {
            botName: req.body.botName,
            runName: req.body.runName
        },
        timestamp: new Date()
    }];

    // Save live data
    saveLiveData(req.body.data);

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

/* Params: Any tag defined in the db schema
   Search the database for data entries */
router.get('/search', (req, res) => {
    const client = db.get();
    let dbQuery = `SELECT * FROM ${measure} WHERE `;
	let empty = true;
	let filter = req.query.filter;

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
            // Simplify and de-stringify results
            const status = 200;
            let msg = [];
            for(let i = 0;i < result.length;i++) {
                msg.push({
                    botName: result[i].botName,
                    runName: result[i].runName,
                    timestamp: result[i].time,
                    data: JSON.parse(result[i].value)
                });
            }
            res.status(status).send(msg);
        })
        .catch((err) => {
            logger.error(err);

            const msg = logger.buildPayload(logger.level.ERROR, 'Error reading database');
            const status = 500;
            res.status(status).send(msg);
        });
});

router.get('/livedata', (req, res) => {
    res.status(200).send(liveData);
});

module.exports = router;