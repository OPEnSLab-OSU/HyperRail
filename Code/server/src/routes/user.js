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
router.post('/create', async (req, res) => {
    const collection = db.get().collection('users');
    const username = req.body.username;
    const password = req.body.password;
    if(username == null || password == null) {
        res.status(400).send('Invalid payload');
        return;
    } 
    const hash = await bcrypt.hash(password, 10);
    createUser(collection, username, hash)
    .then((result) => {
        res.status(201).send('Created');
    })
    .catch((err) => {
        res.status(400).send('User already exists');
    });
});

router.post('/delete', async (req, res) => {
    const collection = db.get().collection('users');
    const username = req.body.username;
    if(username == null) {
        res.status(400).send('Invalid payload');
        return;
    } 
    deleteUser(collection, username)
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
    const result = await purgeDatabase(collection);
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

/******************
 * Helper functions
 ******************/
async function createUser(collection, username, password) {
    const obj = {username: username, password: password};
    return collection.insertOne(obj);
}

async function deleteUser(collection, username) {
    const obj = {username: username};
    return collection.deleteOne(obj);
}

async function purgeDatabase(collection) {
    return collection.deleteMany();
}