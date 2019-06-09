import { Db, MongoClient, MongoError,  } from "mongodb";
import { mongo, Mongoose } from "mongoose";
import credentials from './credentials';

let db: Db;
const createDbConnection = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(`${credentials.mongo.development.connectionString}`, { useNewUrlParser: true }, (err: MongoError, dbClient: MongoClient) => {
            if (err) {
                reject();
            }
            db = dbClient.db('flats-db');
            console.log('Connected to DB!', db.collections);
            resolve();
        })
    })
}

const getDb = (): Db => {
    if (!db) {
        createDbConnection();
        setTimeout(() => {
            if (!db) {
                throw new Error('DB is not connected!');
            }
        },2000);
    }
    return db;
}

export default {
    createDbConnection,
    getDb
}