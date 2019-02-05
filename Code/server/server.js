const express = require('express');
const app = express();
const port = process.env.SERVER_PORT || 3000;
const db = require('./src/support/db');
const logger = require('./src/support/logger');

// Define routes and middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/runs', require('./src/routes/runs'));
app.use('/configs', require('./src/routes/configs'));
app.use('/bots', require('./src/routes/bots'));

// Redirects base url to home page
app.get('/', (req, res) => {
	res.redirect('/html/index.html');
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
    .then((dbInfo) => {
        logger.log(logger.level.OK, `Database started at ${dbInfo}`);
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
