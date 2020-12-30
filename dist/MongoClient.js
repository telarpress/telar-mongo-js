"use strict";
// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoClient = void 0;
const mongo = __importStar(require("mongodb"));
const mongo_heartbeat_1 = __importDefault(require("mongo-heartbeat"));
class MongoClient {
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
        const hb = mongo_heartbeat_1.default(database, {
            interval: 5000,
            timeout: 10000,
            tolerance: 2,
        });
        return hb;
    }
}
exports.MongoClient = MongoClient;
