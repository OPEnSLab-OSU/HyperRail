const Influx = require('influx');

const dbUrl = process.env.DB_URL || 'localhost';
const dbPort = process.env.DB_PORT || '8086';
const dbName = process.env.DB_NAME || 'HyperRailDB';

let client = null;

/* Quick Tips:
 * Measurements == Table
 * Fields,Tags == Columns
 * 
 * At least one field must be set
 * Tags are indexed and therefore more performant
 * Treat tags as metadata, used for queries
 */

// Specify the schema for the following measurments
const metadata = {
    host: dbUrl,
    port: dbPort,
    database: dbName,
    schema: [
        { 
            measurement: 'run',
            fields: {
                value: Influx.FieldType.STRING,
            },
            tags: ['botName', 'runName']
        }
    ]
};

exports.connect = () => {
    return new Promise((resolve, reject) => {
        if(client == null) {
            client = new Influx.InfluxDB(metadata);
            client.createDatabase(dbName)
                .then(() => resolve(`${dbUrl}:${dbPort}`))
                .catch((err) => reject(err));
        } else {
            reject('DB connection already established');
        }
    });
};

exports.get = () => {
    if(client == null) {
        throw "Database connection has not been established yet. Use 'db.connect()' to do so.";
    }
    return client;
};
