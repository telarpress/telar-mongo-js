"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataRepositoryMongo = void 0;
const OperatorsMongo_1 = require("./OperatorsMongo");
class DataSingleResult {
    constructor(result, err) {
        this.result = result;
        this.err = err;
    }
    // Decode single data result decoding
    decode() {
        return [this.result, null];
    }
    // Decode single data result decoding
    noResult() {
        if (!this.err && !this.result) {
            return true;
        }
        return false;
    }
    // Error single data result error
    error() {
        return this.err;
    }
}
class DataResult {
    constructor(result, err) {
        this.currentDoc = null;
        (this.result = result), (this.err = err);
    }
    // Next data result iterator
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.result) {
                return false;
            }
            const hasNext = yield this.result.hasNext();
            if (!hasNext) {
                return false;
            }
            this.currentDoc = yield this.result.next();
            return this.currentDoc != null;
        });
    }
    // Close close cursor
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.result) {
                return;
            }
            yield this.result.close();
        });
    }
    // Decode multi data result decoding
    decode() {
        return [this.currentDoc, null];
    }
    // Error data result error
    error() {
        return this.err;
    }
}
class DataRepositoryMongo {
    /**
     * Constructor
     * @param _client Mongo client
     */
    constructor(_client) {
        this.client = _client;
        this._operators = new OperatorsMongo_1.OperatorsMongo();
    }
    get operators() {
        this._operators = new OperatorsMongo_1.OperatorsMongo();
        return this._operators;
    }
    /**
     * Create a new data repository for mongoDB
     * @param _client MongoDB client
     */
    static NewDataRepositoryMongo(_client) {
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
    createIndex(collectionName, indexes) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.client.getCollection(collectionName);
            try {
                yield collection.createIndexes(indexes);
                return null;
            }
            catch (error) {
                return error;
            }
        });
    }
    /**
     * Inserts a single document into MongoDB
     * @param collectionName Collection name
     * @param data Document to insert
     */
    save(collectionName, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.client.getCollection(collectionName);
            try {
                const result = yield collection.insertOne(data);
                return {
                    result: result.insertedCount,
                    error: null,
                };
            }
            catch (error) {
                return {
                    result: null,
                    error,
                };
            }
        });
    }
    /**
     * Inserts an array of documents into MongoDB
     * @param collectionName Collection name
     * @param data Documents to save
     */
    saveMany(collectionName, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.client.getCollection(collectionName);
            const insterOptions = { ordered: false };
            try {
                const result = yield collection.insertMany(data, insterOptions);
                return {
                    result: result.insertedCount,
                    error: null,
                };
            }
            catch (error) {
                return {
                    result: null,
                    error,
                };
            }
        });
    }
    /**
     * Creates a cursor for a query that can be used to iterate over results from MongoDB
     * @param collectionName Collection name
     * @param filter The cursor query object
     * @param limit Sets the limit of documents returned in the query
     * @param skip Set to skip N documents ahead in your query (useful for pagination)
     * @param sort Set to sort the documents coming back from the query. Array of indexes, [['a', 1]] etc
     */
    find(collectionName, filter, limit, skip, sort) {
        const collection = this.client.getCollection(collectionName);
        let findOptions = {};
        if (sort && Object.keys(sort).length > 0) {
            findOptions = Object.assign(Object.assign({}, findOptions), { sort });
        }
        if (skip && skip > 0) {
            findOptions = Object.assign(Object.assign({}, findOptions), { skip });
        }
        if (limit && limit > 0) {
            findOptions = Object.assign(Object.assign({}, findOptions), { limit });
        }
        try {
            const result = collection.find(filter.getOperation(), findOptions);
            return new DataResult(result, null);
        }
        catch (error) {
            return new DataResult(null, error);
        }
    }
    /**
     * Fetches the first document that matches the query
     * @param collectionName Collection name
     * @param filter The cursor query object
     */
    findOne(collectionName, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.client.getCollection(collectionName);
            try {
                const resultDoc = yield collection.findOne(filter.getOperation());
                return new DataSingleResult(resultDoc, null);
            }
            catch (error) {
                return new DataSingleResult(null, error);
            }
        });
    }
    /**
     * Update a single document in a collection
     * @param collectionName Collection name
     * @param filter The cursor query object
     * @param data The update operations to be applied to the document
     * @param opts Optional settings
     */
    update(collectionName, filter, data, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.client.getCollection(collectionName);
            try {
                const result = yield collection.updateOne(filter.getOperation(), data.getOperation(), opts);
                return {
                    result,
                    error: null,
                };
            }
            catch (error) {
                return {
                    result: null,
                    error,
                };
            }
        });
    }
    /**
     * Update multiple documents in a collection
     * @param collectionName Collection name
     * @param filter The cursor query object
     * @param data TThe update operations to be applied to the documents
     * @param opts Optional settings
     */
    updateMany(collectionName, filter, data, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.client.getCollection(collectionName);
            try {
                const result = yield collection.updateMany(filter.getOperation(), data.getOperation(), opts);
                return {
                    result: result.modifiedCount,
                    error: null,
                };
            }
            catch (error) {
                return {
                    result: null,
                    error,
                };
            }
        });
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
    bulkUpdateOne(collectionName, bulkData) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.client.getCollection(collectionName);
            const bulkOptions = { ordered: false };
            const operations = [];
            for (let bullIndex = 0; bullIndex < bulkData.length; bullIndex += 1) {
                const operation = bulkData[bullIndex];
                // { updateOne: { filter: {a:2}, update: {$set: {a:2}}, upsert:true } }
                operations.push({
                    updateOne: {
                        filter: operation.filter.getOperation(),
                        update: operation.data.getOperation(),
                    },
                });
            }
            try {
                const result = yield collection.bulkWrite(operations, bulkOptions);
                return {
                    result,
                    error: null,
                };
            }
            catch (error) {
                return {
                    result: null,
                    error,
                };
            }
        });
    }
    /**
     * Delete one/many document/s from a collection
     * @param collectionName Collection name
     * @param filter The Filter used to select the document/s to remove
     * @param justOne Remove only one document
     */
    delete(collectionName, filter, justOne) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.client.getCollection(collectionName);
            try {
                let result = null;
                if (justOne) {
                    result = collection.deleteOne(filter.getOperation());
                }
                result = collection.deleteMany(filter.getOperation());
                return {
                    result,
                    error: null,
                };
            }
            catch (error) {
                return {
                    result: null,
                    error,
                };
            }
        });
    }
}
exports.DataRepositoryMongo = DataRepositoryMongo;
