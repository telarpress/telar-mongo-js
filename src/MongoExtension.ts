import { IDataRepository } from '@telar/core/data/IDataRepository';
import { CoreMetaTypes } from '@telar/core/CoreMetaTypes';
import { IServiceCollection } from '@telar/core/IServiceCollection';
import { DataRepositoryMongo } from './DataRepositoryMongo';
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
    const repoMongo = DataRepositoryMongo.NewDataRepositoryMongo(mongoClient);
    this.bind<IMongoClient>(MongoClientType).toConstantValue(mongoClient);
    this.bind<IDataRepository>(CoreMetaTypes.DataRepository).toConstantValue(repoMongo);
    return this;
};
