import { Db, MongoError } from 'mongodb';
import credentials from './credentials';
import mongoose, { Connection, Collection } from 'mongoose';

let db: Db;

function createDbConnection(): Promise<any> {
    return new Promise((resolve, reject) => {
        mongoose.connect('mongodb://admin:admin123@ds135107.mlab.com:35107/flats-db', { useNewUrlParser: true }).then(
            () => {
                console.log('Connected to DB!');
                resolve();
            },
            err => { 
                console.log('Cannot connect to DB!', err.message);
                reject(err);
            }
        )
    });
}

function getDb(): Db {
    return mongoose.connection.db;
}

function getConnection(): Connection {
    return mongoose.connection;
}

export default {
    createDbConnection,
    getConnection,
    getDb
}