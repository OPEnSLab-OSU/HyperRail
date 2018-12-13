const mongo = require('mongodb').MongoClient;

let state = {
    db: null
}

exports.connect = (url) => {
    if (state.db) {
        console.log('Using existing database connection');
        return new Promise((resolve, reject) => {});
    }
  
    return mongo.connect(url, {useNewUrlParser: true})
        .then((client) => {
            state.db = client.db('users');
            
            // Set some properties
            state.db.collection('users').createIndex({username: 1}, {unique: true});
            console.log('Database connection established');
        })
        .catch((err) => console.error(err));
}

exports.get = function() {
    return state.db;
}

exports.close = (next) => {
    if (state.db) {
        state.db.close((result) => {
            state.db = null;
            next(result);
        });
    }
}
