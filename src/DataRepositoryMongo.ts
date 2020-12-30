// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {
    BulkUpdateOne,
    IDataRepository,
    IQueryResult,
    IQuerySingleResult,
    IRepositoryResult,
} from '@telar/core/data/IDataRepository';
import { IBaseOperators, IOperators } from '@telar/core/data/IOperators';
import * as mongo from 'mongodb';
import { IMongoClient } from './IMongoClient';
import { OperatorsMongo } from './OperatorsMongo';

class DataSingleResult<T> implements IQuerySingleResult<T> {
    private result: T | null;
    private err: Error | null;

    constructor(result: T | null, err: Error | null) {
        this.result = result;
        this.err = err;
    }

    // Decode single data result decoding
    decode(): [T | null, Error | null] {
        return [this.result, null];
    }

    // Decode single data result decoding
    noResult(): boolean {
        if (!this.err && !this.result) {
            return true;
        }
        return false;
    }

    // Error single data result error
    error(): Error | null {
        return this.err;
    }
}

class DataResult<T> implements IQueryResult<T> {
    private result: mongo.Cursor<T> | null;
    private currentDoc: T | null = null;
    private err: Error | null;
    constructor(result: mongo.Cursor<T> | null, err: Error | null) {
        (this.result = result), (this.err = err);
    }

    // Next data result iterator
    async next(): Promise<boolean> {
        if (!this.result) {
            return false;
        }
        const hasNext = await this.result.hasNext();
        if (!hasNext) {
            return false;
        }
        this.currentDoc = await this.result.next();
        return this.currentDoc != null;
    }

    // Close close cursor
    async close(): Promise<void> {
        if (!this.result) {
            return;
        }
        await this.result.close();
    }

    // Decode multi data result decoding
    decode(): [T | null, Error | null] {
        return [this.currentDoc, null];
    }

    // Error data result error
    error(): Error | null {
        return this.err;
    }
}

export class DataRepositoryMongo implements IDataRepository {
    private client: IMongoClient;
    /**
     * Repository operators
     */
    public _operators: IOperators;
    get operators(): IOperators {
        this._operators = new OperatorsMongo();
        return this._operators;
    }
    /**
     * Constructor
     * @param _client Mongo client
     */
    private constructor(_client: IMongoClient) {
        this.client = _client;
        this._operators = new OperatorsMongo();
    }
    /**
     * Create a new data repository for mongoDB
     * @param _client MongoDB client
     */
    static NewDataRepositoryMongo(_client: IMongoClient): DataRepositoryMongo {
        return new DataRepositoryMongo(_client);
    }

    /**
     * Creates multiple indexes in the collection, this method is only supported for
MongoDB 2.6 or higher.
     * @param {*} collectionName Collection name
     * @param {*} indexes Collection indexes
     * @example createIndex("MyCollection",
        [
            {name: 'field1', key: {field1: 1}},
            {name: 'field2_field3', key: {field2: 1, field3: 1}}
        ]
        )
    */
    async createIndex(
        collectionName: string,
        indexes: { name: string; key: { [field: string]: unknown } }[],
    ): Promise<Error | null> {
        const collection = this.client.getCollection(collectionName);
        try {
            await collection.createIndexes(indexes);
            return null;
        } catch (error) {
            return error;
        }
    }

    /**
     * Inserts a single document into MongoDB
     * @param collectionName Collection name
     * @param data Document to insert
     */
    async save<T>(collectionName: string, data: T): Promise<IRepositoryResult> {
        const collection = this.client.getCollection(collectionName);
        try {
            const result = await collection.insertOne(<T>data);
            return {
                result: result.insertedCount,
                error: null,
            };
        } catch (error) {
            return {
                result: null,
                error,
            };
        }
    }

    /**
     * Inserts an array of documents into MongoDB
     * @param collectionName Collection name
     * @param data Documents to save
     */
    async saveMany<T>(collectionName: string, data: T[]): Promise<IRepositoryResult> {
        const collection = this.client.getCollection(collectionName);
        const insterOptions = { ordered: false };
        try {
            const result = await collection.insertMany(data, insterOptions);
            return {
                result: result.insertedCount,
                error: null,
            };
        } catch (error) {
            return {
                result: null,
                error,
            };
        }
    }

    /**
     * Creates a cursor for a query that can be used to iterate over results from MongoDB
     * @param collectionName Collection name
     * @param filter The cursor query object
     * @param limit Sets the limit of documents returned in the query
     * @param skip Set to skip N documents ahead in your query (useful for pagination)
     * @param sort Set to sort the documents coming back from the query. Array of indexes, [['a', 1]] etc
     */
    find<T>(
        collectionName: string,
        filter: IBaseOperators,
        limit?: number,
        skip?: number,
        sort?: { [key: string]: number },
    ): IQueryResult<T> {
        const collection = this.client.getCollection(collectionName);
        let findOptions = {};
        if (sort && Object.keys(sort).length > 0) {
            findOptions = { ...findOptions, sort };
        }
        if (skip && skip > 0) {
            findOptions = { ...findOptions, skip };
        }
        if (limit && limit > 0) {
            findOptions = { ...findOptions, limit };
        }
        try {
            const result = collection.find<T>(filter.getOperation<Record<string, unknown>>(), findOptions);

            return new DataResult<T>(result, null);
        } catch (error) {
            return new DataResult<T>(null, error);
        }
    }

    /**
     * Fetches the first document that matches the query
     * @param collectionName Collection name
     * @param filter The cursor query object
     */
    async findOne<T>(collectionName: string, filter: IBaseOperators): Promise<IQuerySingleResult<T>> {
        const collection = this.client.getCollection(collectionName);

        try {
            const resultDoc = await collection.findOne(filter.getOperation<Record<string, unknown>>());
            return new DataSingleResult<T>(resultDoc as T, null);
        } catch (error) {
            return new DataSingleResult<T>(null, error);
        }
    }

    /**
     * Update a single document in a collection
     * @param collectionName Collection name
     * @param filter The cursor query object
     * @param data The update operations to be applied to the document
     * @param opts Optional settings
     */
    async update(
        collectionName: string,
        filter: IBaseOperators,
        data: IBaseOperators,
        opts?: Record<string, unknown>,
    ): Promise<IRepositoryResult> {
        const collection = this.client.getCollection(collectionName);

        try {
            const result = await collection.updateOne(
                filter.getOperation<Record<string, unknown>>(),
                data.getOperation<Record<string, unknown>>(),
                opts,
            );
            return {
                result,
                error: null,
            };
        } catch (error) {
            return {
                result: null,
                error,
            };
        }
    }

    /**
     * Update multiple documents in a collection
     * @param collectionName Collection name
     * @param filter The cursor query object
     * @param data TThe update operations to be applied to the documents
     * @param opts Optional settings
     */
    async updateMany(
        collectionName: string,
        filter: IBaseOperators,
        data: IBaseOperators,
        opts?: Record<string, unknown>,
    ): Promise<IRepositoryResult> {
        const collection = this.client.getCollection(collectionName);
        try {
            const result = await collection.updateMany(
                filter.getOperation<Record<string, unknown>>(),
                data.getOperation<Record<string, unknown>>(),
                opts,
            );
            return {
                result: result.modifiedCount,
                error: null,
            };
        } catch (error) {
            return {
                result: null,
                error,
            };
        }
    }

    /**
     * Perform a bulkWrite update operation without a fluent API
     * @param collectionName Collection name
     * @param bulkData Bulk update operations to perform
     * @example repository.bulkUpdateOne('testCollection',
     * [
     * { filter: {_id: '12345'}, update: {$set: {a:2}}, upsert:true }},
     * { filter: {_id: '32452'}, update: {$set: {a:2}}, upsert:true } }
     * ] )
     */
    async bulkUpdateOne(collectionName: string, bulkData: BulkUpdateOne[]): Promise<IRepositoryResult> {
        const collection = this.client.getCollection(collectionName);
        const bulkOptions = { ordered: false };
        const operations: mongo.BulkWriteOperation<unknown>[] = [];
        for (let bullIndex = 0; bullIndex < bulkData.length; bullIndex += 1) {
            const operation = bulkData[bullIndex];
            // { updateOne: { filter: {a:2}, update: {$set: {a:2}}, upsert:true } }
            operations.push({
                updateOne: {
                    filter: operation.filter.getOperation<Record<string, unknown>>(),
                    update: operation.data.getOperation<Record<string, unknown>>(),
                },
            });
        }
        try {
            const result = await collection.bulkWrite(operations, bulkOptions);
            return {
                result,
                error: null,
            };
        } catch (error) {
            return {
                result: null,
                error,
            };
        }
    }

    /**
     * Delete one/many document/s from a collection
     * @param collectionName Collection name
     * @param filter The Filter used to select the document/s to remove
     * @param justOne Remove only one document
     */
    async delete(collectionName: string, filter: IBaseOperators, justOne: boolean): Promise<IRepositoryResult> {
        const collection = this.client.getCollection(collectionName);

        try {
            let result = null;
            if (justOne) {
                result = collection.deleteOne(filter.getOperation<Record<string, unknown>>());
            }
            result = collection.deleteMany(filter.getOperation<Record<string, unknown>>());
            return {
                result,
                error: null,
            };
        } catch (error) {
            return {
                result: null,
                error,
            };
        }
    }
}
