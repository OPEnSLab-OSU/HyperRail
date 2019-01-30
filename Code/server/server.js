const express = require('express');
const app = express();
const port = process.env.SERVER_PORT || 3000;
const db = require('./src/db');

// Define routes and middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/runs', require('./src/routes/runs'));
app.use('/configs', require('./src/routes/configs'))

app.get('/status', (req, res) => {
    // TODO: return status of every bot
    res.send(`Server is good`);
});

app.delete('/purge', (req, res) => {
    const client = db.get();
    client.dropMeasurement(req.query.measurement)
        .then(() => {
            res.send('It has been done');
        })
        .catch((err) => console.error(err));
});

db.connect()
    .then((db_info) => {
        console.log(`Database started at ${db_info}`)
        app.listen(port, () => {
            console.log(`Server started at localhost:${port}`);
        });           
    })
    .catch((err) => {
        console.error("Cannot connect to database");
        console.error(err.message);
        console.error(err.stack);
        process.exit(1);
    });
