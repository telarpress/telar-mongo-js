import { IServiceCollection } from '@telar/core/IServiceCollection';
import { IMongoClient } from './IMongoClient';
import { MongoClient } from './MongoClient';
import { MongoConfig } from './MongoConfig';
import { MongoClientType } from './MongoTypes';
declare module '@telar/core/IServiceCollection' {
    /**
     * Constains extensions for configuring routing
     */
    export interface IServiceCollection {
        /**
         * Add mongodb
         */
        addMongo(config: MongoConfig): Promise<IServiceCollection>;
    }
}

IServiceCollection.prototype.addMongo = async function (config: MongoConfig) {
    const mongoClient = await MongoClient.NewMongoClient(config.uri, config.db);
    this.bind<IMongoClient>(MongoClientType).toConstantValue(mongoClient);
    return this;
};
