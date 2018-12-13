const mongo = require('mongodb').MongoClient;

let state = {
    status: "offline",
    db: null
}

exports.connect = (url) => {
    if (state.status == "online") {
        console.log('Using existing database connection');
        return new Promise((resolve, reject) => {});
    }
  
    return mongo.connect(url, {useNewUrlParser: true})
        .then((client) => {
            state.db = client.db('main');
                    
            // Set some properties
            state.db.collection('users').createIndex({username: 1}, {unique: true});

            state.status = "online";
            console.log('Database connection established');
        })
        .catch((err) => console.error(err));
}

exports.get = () => {
    if(!state.db) {
        throw `DB ERROR: Database connection does not exist`;
    }
    return state.db;
}

exports.close = async () => {
    if (state.status == "online") {
        await state.db.close((result) => {
            state.db = null;
        });
    }
}
