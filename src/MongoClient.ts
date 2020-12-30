// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as mongo from 'mongodb';
import MongoHeartbeat from 'mongo-heartbeat';
import { IMongoClient } from './IMongoClient';

export class MongoClient implements IMongoClient {
    private client: mongo.MongoClient;
    private dbName: string;
    private constructor(_client: mongo.MongoClient, _dbName: string) {
        this.client = _client;
        this.dbName = _dbName;
    }

    /**
     * Create a new mongoDB client
     */
    static async NewMongoClient(mongoURI: string, dbName: string): Promise<MongoClient> {
        const newClinet = new mongo.MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        const client = await newClinet.connect();

        const mongoClient: MongoClient = new MongoClient(client, dbName);
        return mongoClient;
    }

    /**
     * Close the db and its underlying connections
     */
    async close(): Promise<void> {
        if (!this.client) {
            throw new Error('MongoDB client is nil, be sure you have invoked NewClient() function already!');
        }
        await this.client.close();
    }

    /**
     * Fetch a specific collection (containing the actual collection information)
     * @param collectionName Collection name
     */
    getCollection<T>(collectionName: string): mongo.Collection<T> {
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
    getDb(): mongo.Db {
        if (!this.client) {
            throw new Error('MongoDB client is nil, be sure you have invoked NewClient() function already!');
        }
        const database = this.client.db(this.dbName);
        return database;
    }

    /**
     * Ping db connection
     */
    ping(): unknown {
        if (!this.client) {
            throw new Error('MongoDB client is nil, be sure you have invoked NewClient() function already!');
        }

        const database = this.client.db(this.dbName);
        const hb = MongoHeartbeat(database, {
            interval: 5000, // defaults to 5000 ms,
            timeout: 10000, // defaults to 10000 ms
            tolerance: 2, // defaults to 1 attempt
        });
        return hb;
    }
}
