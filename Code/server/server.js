const bcrypt    = require('bcrypt');
const express   = require('express');
const app       = express();
const port      = process.env.PORT || 3000;
const mongo = require('mongodb').MongoClient

let db, collection;

// Requests choose their handler in the order they are defined
app.use(express.json());
app.use(express.static('public'));

/* Expects:
    {
        username: <username>,
        password: <password>
    }
*/
app.post('/createUser', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if(username == null || password == null) {
        res.status(400).send('Invalid payload');
        return;
    } 

    const exists = await searchDatabase(username);
    if(!exists) {
        const hash = await bcrypt.hash(password, 10);
        await createUser(username, hash);
        res.status(201).send('Created');
    } else {
        res.status(400).send('User Already exists');
    }
});

app.post('/login', async (req, res) =>{
    const username = req.body.username;
    const password = req.body.password;
    if(!searchDatabase(username)) {

    }
    res.send('TODO');
});

app.get('/status', (req, res) => {
    // will return status of every bot
    res.send(`Server is good`);
});

app.get('/listUser', async (req, res)=> {
    let query = {};
    if(req.query.user != null){
        query = {username: req.query.user};
    }
    const data = await collection.find(query).toArray();
    res.json(data);
});

// Start database connection
mongo.connect('mongodb://localhost:27017/hyperrail', {useNewUrlParser: true})
    .then((client) => {
        db = client.db('users');
        collection = db.collection('users')
        
        // Start API server
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    })
    .catch((err) => console.error(err));
 
/******************
 * Helper functions
 ******************/
async function searchDatabase(username) {
    const query = {username: username}
    const res = await collection.findOne(query);
    if(res == null) {
        return false;
    }
    return true;
}

// Add user to database
async function createUser(username, password) {
    const obj = {username: username, password: password};
    const res = await collection.insertOne(obj);
}