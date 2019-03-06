const express = require('express');
const app = express();
const port = process.env.SERVER_PORT || 3000;
const db = require('./src/support/db');
const logger = require('./src/support/logger');

// Define routes and middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/', express.static('public/html'));
app.use('/runs', require('./src/routes/runs'));
app.use('/configs', require('./src/routes/configs'));
app.use('/bots', require('./src/routes/bots'));

// Cleanup endpoint, don't keep in final product
app.delete('/purge', (req, res) => {
    const client = db.get();
    client.dropMeasurement(req.query.measurement) // Test
        .then(() => {
            res.send('It has been done');
        })
        .catch((err) => logger.log(logger.level.ERROR, err));
});

db.connect()
    .then((dbInfo) => {
        logger.ok(`Database started at ${dbInfo}`);
        app.listen(port, () => {
            logger.ok(`Server started at localhost:${port}`);
        });           
    })
    .catch((err) => {
        logger.error("Error connecting to database");
        logger.error(err.message);
        logger.error(err.stack);
        process.exit(1);
    });
