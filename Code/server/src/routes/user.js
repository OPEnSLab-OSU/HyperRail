const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/list', async (req, res) => {
    const collection = db.get().collection('users');
    let query = {};
    if(req.query.user != null) {
        query = {username: req.query.user};
    }
    const data = await collection.find(query).toArray();
    res.json(data);
});

/* Expects:
    {
        username: <username>,
        password: <password>
    }
*/
router.put('/create', async (req, res) => {
    const collection = db.get().collection('users');
    const username = req.body.username;
    const password = req.body.password;
    
    if(username == null || password == null) {
        res.status(400).send('Invalid payload');
        return;
    } 

    const hashPass = await bcrypt.hash(password, 10);
    const obj = {
        username: username, 
        password: hashPass
    };

    collection.insertOne(obj)
    .then((result) => {
        res.status(201).send('Created');
    })
    .catch((err) => {
        res.status(400).send('User already exists');
    });
});

router.delete('/delete', async (req, res) => {
    const collection = db.get().collection('users');
    const username = req.body.username;
    if(username == null) {
        res.status(400).send('Invalid payload');
        return;
    } 

    const obj = {
        username: username
    };

    collection.deleteOne(obj)    
    .then((result) => {
        if(result.deletedCount == 0) {
            res.status(409).send('User not found');
        } else {
            res.send('User deleted successfully');
        }
    })
    .catch((err) => console.error(err));
});

router.get('/purge', async (req, res) => {
    const collection = db.get().collection('users');
    const result = collection.deleteMany();
    res.send(result);
});

router.post('/login', async (req, res) =>{
    const collection = db.get().collection('users');
    const username = req.body.username;
    const password = req.body.password;
    if(!searchDatabase(collection, username)) {

    }
    res.status(501).send('TODO');
});

module.exports = router;