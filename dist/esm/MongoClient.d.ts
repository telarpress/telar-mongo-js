import * as mongo from 'mongodb';
import { IMongoClient } from './IMongoClient';
export declare class MongoClient implements IMongoClient {
    private client;
    private dbName;
    private constructor();
    /**
     * Create a new mongoDB client
     */
    static NewMongoClient(mongoPassword: string, mongoDBHost: string, dbName: string): Promise<MongoClient>;
    /**
     * Close the db and its underlying connections
     */
    close(): Promise<void>;
    /**
     * Fetch a specific collection (containing the actual collection information)
     * @param collectionName Collection name
     */
    getCollection<T>(collectionName: string): mongo.Collection<T>;
    /**
     * Create a new Db instance
     */
    getDb(): mongo.Db;
    /**
     * Ping db connection
     */
    ping(): unknown;
}
