const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./src/db');

// Define routes and middle-ware
app.use(express.json());
app.use(express.static('public'));
app.use('/user', require('./src/routes/user'));
app.use('/runs', require('./src/routes/runs'));

app.get('/status', (req, res) => {
    // TODO: return status of every bot
    res.send(`Server is good`);
});

db.connect('mongodb://localhost:27017/hyperrail')
    .then(() =>{
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });   
    })
    .catch((err) => console.error(err));
