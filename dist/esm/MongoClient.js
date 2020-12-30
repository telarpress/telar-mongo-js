// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as mongo from 'mongodb';
import MongoHeartbeat from 'mongo-heartbeat';
export class MongoClient {
    constructor(_client, _dbName) {
        this.client = _client;
        this.dbName = _dbName;
    }
    /**
     * Create a new mongoDB client
     */
    static NewMongoClient(mongoPassword, mongoDBHost, dbName) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = String(mongoDBHost).replace('%s', String(mongoPassword));
            const newClinet = new mongo.MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
            const client = yield newClinet.connect();
            const mongoClient = new MongoClient(client, dbName);
            return mongoClient;
        });
    }
    /**
     * Close the db and its underlying connections
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                throw new Error('MongoDB client is nil, be sure you have invoked NewClient() function already!');
            }
            yield this.client.close();
        });
    }
    /**
     * Fetch a specific collection (containing the actual collection information)
     * @param collectionName Collection name
     */
    getCollection(collectionName) {
        if (!this.client) {
            throw new Error('MongoDB client is nil, be sure you have invoked NewClient() function already!');
        }
        const database = this.getDb();
        const collection = database.collection(collectionName);
        return collection;
    }
    /**
     * Create a new Db instance
     */
    getDb() {
        if (!this.client) {
            throw new Error('MongoDB client is nil, be sure you have invoked NewClient() function already!');
        }
        const database = this.client.db(this.dbName);
        return database;
    }
    /**
     * Ping db connection
     */
    ping() {
        if (!this.client) {
            throw new Error('MongoDB client is nil, be sure you have invoked NewClient() function already!');
        }
        const database = this.client.db(this.dbName);
        const hb = MongoHeartbeat(database, {
            interval: 5000,
            timeout: 10000,
            tolerance: 2,
        });
        return hb;
    }
}
