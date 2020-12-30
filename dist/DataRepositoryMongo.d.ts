import { BulkUpdateOne, IDataRepository, IQueryResult, IQuerySingleResult, IRepositoryResult } from '@telar/core/data/IDataRepository';
import { IBaseOperators, IOperators } from '@telar/core/data/IOperators';
import { IMongoClient } from './IMongoClient';
export declare class DataRepositoryMongo implements IDataRepository {
    private client;
    /**
     * Repository operators
     */
    _operators: IOperators;
    get operators(): IOperators;
    /**
     * Constructor
     * @param _client Mongo client
     */
    private constructor();
    /**
     * Create a new data repository for mongoDB
     * @param _client MongoDB client
     */
    static NewDataRepositoryMongo(_client: IMongoClient): DataRepositoryMongo;
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
    createIndex(collectionName: string, indexes: {
        name: string;
        key: {
            [field: string]: unknown;
        };
    }[]): Promise<Error | null>;
    /**
     * Inserts a single document into MongoDB
     * @param collectionName Collection name
     * @param data Document to insert
     */
    save<T>(collectionName: string, data: T): Promise<IRepositoryResult>;
    /**
     * Inserts an array of documents into MongoDB
     * @param collectionName Collection name
     * @param data Documents to save
     */
    saveMany<T>(collectionName: string, data: T[]): Promise<IRepositoryResult>;
    /**
     * Creates a cursor for a query that can be used to iterate over results from MongoDB
     * @param collectionName Collection name
     * @param filter The cursor query object
     * @param limit Sets the limit of documents returned in the query
     * @param skip Set to skip N documents ahead in your query (useful for pagination)
     * @param sort Set to sort the documents coming back from the query. Array of indexes, [['a', 1]] etc
     */
    find<T>(collectionName: string, filter: IBaseOperators, limit?: number, skip?: number, sort?: {
        [key: string]: number;
    }): IQueryResult<T>;
    /**
     * Fetches the first document that matches the query
     * @param collectionName Collection name
     * @param filter The cursor query object
     */
    findOne<T>(collectionName: string, filter: IBaseOperators): Promise<IQuerySingleResult<T>>;
    /**
     * Update a single document in a collection
     * @param collectionName Collection name
     * @param filter The cursor query object
     * @param data The update operations to be applied to the document
     * @param opts Optional settings
     */
    update(collectionName: string, filter: IBaseOperators, data: IBaseOperators, opts?: Record<string, unknown>): Promise<IRepositoryResult>;
    /**
     * Update multiple documents in a collection
     * @param collectionName Collection name
     * @param filter The cursor query object
     * @param data TThe update operations to be applied to the documents
     * @param opts Optional settings
     */
    updateMany(collectionName: string, filter: IBaseOperators, data: IBaseOperators, opts?: Record<string, unknown>): Promise<IRepositoryResult>;
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
    bulkUpdateOne(collectionName: string, bulkData: BulkUpdateOne[]): Promise<IRepositoryResult>;
    /**
     * Delete one/many document/s from a collection
     * @param collectionName Collection name
     * @param filter The Filter used to select the document/s to remove
     * @param justOne Remove only one document
     */
    delete(collectionName: string, filter: IBaseOperators, justOne: boolean): Promise<IRepositoryResult>;
}
