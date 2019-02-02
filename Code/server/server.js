const express = require('express');
const app = express();
const port = process.env.SERVER_PORT || 3000;
const db = require('./src/db');
const logger = require('./src/logger');

// Define routes and middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/runs', require('./src/routes/runs'));
app.use('/configs', require('./src/routes/configs'));

app.get('/status', (req, res) => {
    // TODO: return status of every bot
    res.send(`Server is good`);
});

// Cleanup endpoint, don't keep in final product
app.delete('/purge', (req, res) => {
    const client = db.get();
    client.dropMeasurement(req.query.measurement)
        .then(() => {
            res.send('It has been done');
        })
        .catch((err) => logger.log(logger.level.ERROR, err));
});

db.connect()
    .then((db_info) => {
        logger.log(logger.level.OK, `Database started at ${db_info}`);
        app.listen(port, () => {
            logger.log(logger.level.OK, `Server started at localhost:${port}`);
        });           
    })
    .catch((err) => {
        logger.log(logger.level.ERROR, "Error connecting to database");
        logger.log(logger.level.ERROR, err.message);
        logger.log(logger.level.ERROR, err.stack);
        process.exit(1);
    });
