// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as mongo from 'mongodb';

export interface IMongoClient {
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
