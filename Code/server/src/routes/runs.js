const express = require('express');
const router = express.Router();
const db = require('../db');

/* JSON format expected for each posted data
{
    "botName": "string"                         // Name of the hyper rail that made this request
    "config": {                                 // HyperRail configuration for this run
        "railLength": "length",                 // Length of rail
        "duration": "hh.mm.ss"                  // Time the run took
    },
    "data": [                            
        {
            "type": "sensor_type",              // Each sensor get's it's own array of values
            "time": "yyyy.mm.dd-hh.mm.ss",      // Time the sample was taken
            "value": "value"                    // Value receieved from sensor
        }
    ]
}
*/

router.put('/upload', async (req, res) => {
    const collection = db.get().collection('runs');
    
    const obj = {
        'botName': req.body.botName,
        'runName': req.body.runName || Date.now(),
        'data': req.body.data
    }

    collection.insertOne(obj)
    .then((result) => {
        res.status(401).send('HyperRail run submitted');
    })
    .catch((err) => console.error(err));
});

router.get('/getBotRuns', async (req, res) => {
    const collection = db.get().collection('runs');
    const id = req.query.id;
    
    const query = {
       'runId': {$regex: id}
    }

    const result = await collection.find(query).toArray();
    res.json(result);
});

module.exports = router;

/* 
 * Helper Functions 
 */


/* Returns: 
{
    hyperRailId: [
        'runName': '21312353243124',
        'runs': [
            {
                "type": "thermometer",
                "time": "2019.01.24-12.22.05",
                "value": "39F"
            }
        ]
    ],
}
*/
// MAY NOT BE NEEDED
function sortById(data) {
    let result = {}
    for(let i = 0; i < data.length; i++) {
        let botName = data[i]['botName']

        if(!(botName in result)) {
            result[botName] = [];
        } 

        let obj = {
            'runName': data[i]['runName'],
            'runs': data[i]['data']
        }

        result[botName].push(obj);
    }
    return result;
}