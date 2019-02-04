const Influx = require('influx');

const db_url = process.env.DB_URL || 'localhost';
const db_port = process.env.DB_PORT || '8086';
const db_name = process.env.DB_NAME || 'HyperRailDB';

let client = null;

/* Quick Tips:
 * Measurements == Table
 * Fields,Tags == Columns
 * 
 * At least one field must be set
 * Tags are indexed and therefore more performant
 * Treat tags as metadata
 */

// Specify the schema for the following measurments
const metadata = {
    host: db_url,
    port: db_port,
    database: db_name,
    schema: [
        { 
            measurement: 'run',
            fields: {
                value: Influx.FieldType.STRING,
            },
            tags: ['bot', 'type', 'name']
        }
    ]
};

exports.connect = () => {
    return new Promise((resolve, reject) => {
        if(client == null) {
            client = new Influx.InfluxDB(metadata);
            client.createDatabase(db_name)
                .then(() => resolve(`${db_url}:${db_port}`))
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
