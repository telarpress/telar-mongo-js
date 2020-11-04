// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { v4 as uuidv4 } from 'uuid';
import { IDataRepository } from '../../data/IDataRepository';
import { IOperators } from '../../data/IOperators';
import { DataRepositoryMongo, IMongoClient, MongoClient } from '../../data/mongodb';
import { envDBPass } from '../../env';

interface Post {
    _id: string;
    name: string;
    body: string;
    isTest: boolean;
    createdDate: number;
    ownerUserId: string;
}

describe('MongoDB', () => {
    let mongoClient: IMongoClient;
    let repository: IDataRepository;

    const collectionName = 'unit_test_posts';
    const dbUsername = 'telar';
    const dbPassword = envDBPass();
    if (!dbPassword) {
        throw Error(
            `Database password is not valid! 
            Please set database password vie [export DB_PASS=password] in terminal.`,
        );
    }
    const dbName = 'telar';
    const url = `mongodb+srv://${dbUsername}:%s@cluster0.l6ojz.mongodb.net/${dbName}?retryWrites=true&w=majority`;

    const postListMock = [
        {
            _id: uuidv4(),
            name: 'Hossein repository 1',
            body: 'This is a post body from repository!',
            isTest: true,
            createdDate: 1576290570271,
            ownerUserId: 'ffd35c15-1a7f-45b1-960c-d95d08f07c3f',
        },
        {
            _id: uuidv4(),
            name: 'Hossein repository 2',
            body: 'This is a post body from repository!',
            isTest: true,
            createdDate: 1576290570272,
            ownerUserId: 'ffd35c15-1a7f-45b1-960c-d95d08f07c3f',
        },
        {
            _id: uuidv4(),
            name: 'Hossein repository 3',
            body: 'This is a post body from repository!',
            isTest: true,
            createdDate: 1576290570273,
            ownerUserId: 'ffd35c15-1a7f-45b1-960c-d95d08f07c3f',
        },
        {
            _id: uuidv4(),
            name: 'Hossein repository 4',
            body: 'This is a post body from repository!',
            isTest: true,
            createdDate: 1576290570274,
            ownerUserId: 'ffd35c15-1a7f-45b1-960c-d95d08f07c3f',
        },
        {
            _id: uuidv4(),
            name: 'Hossein repository 5',
            body: 'This is a post body from repository!',
            isTest: true,
            createdDate: 1576290570275,
            ownerUserId: 'ffd35c15-1a7f-45b1-960c-d95d08f07c3f',
        },
    ];
    beforeAll(async () => {
        jest.setTimeout(20000);
        mongoClient = await MongoClient.NewMongoClient(dbPassword, url, dbName);
        repository = DataRepositoryMongo.NewDataRepositoryMongo(mongoClient);
        const db = mongoClient.getDb();

        await db.createCollection(collectionName);
    });

    afterAll(async () => {
        const collection = mongoClient.getCollection(collectionName);
        await collection.drop();

        await mongoClient.close();
    });

    it('[Mongo Client] should insert a doc into collection', async () => {
        const posts = mongoClient.getCollection(collectionName);

        const postId = uuidv4();
        const mockPost = {
            _id: postId,
            name: 'Hossein client',
            body: 'This is a post body from client!',
            isTest: true,
            createdDate: 1576290570278,
            ownerUserId: '7ed4f195-4e02-4cd0-8652-2398bcb2fbbc',
        };
        await posts.insertOne(mockPost as Record<string, unknown>);

        const insertedPost = await posts.findOne({ _id: postId });
        expect(insertedPost).toEqual(mockPost);
    });

    it('[Mongo Repository] should create index for doc', async () => {
        const posts = mongoClient.getCollection(collectionName);

        await repository.createIndex(collectionName, [
            { name: 'objectId', key: { objectId: 1 } },
            { name: 'body', key: { body: 'text' } },
        ]);
        const exist = await posts.indexExists(['body', 'objectId']);
        expect(exist).toEqual(true);
    });
    it('[Mongo Repository] should insert a doc into collection', async () => {
        const postId = uuidv4();
        const mockPost = {
            _id: postId,
            name: 'Hossein repository',
            body: 'This is a post body from repository!',
            isTest: true,
            createdDate: 1576290570279,
            ownerUserId: '422cac77-4243-481a-9cc8-049650afc994',
        };
        await repository.save<Post>(collectionName, mockPost);

        const foundPost = await repository.findOne<Post>(collectionName, repository.operators.plain({ _id: postId }));
        if (foundPost.error()) {
            throw foundPost.error();
        }
        if (foundPost.noResult()) {
            throw Error('No post founded!');
        }
        const [savedPost, err] = foundPost.decode();
        if (err) {
            throw err;
        }
        expect(savedPost).toEqual(mockPost);
    });
    it('[Mongo Repository] should insert many docs into collection', async () => {
        const savedPostListResult = await repository.saveMany<Post>(collectionName, postListMock);
        expect(savedPostListResult.result).toEqual(5);
    });
    it('[Mongo Repository] should return list of docs in collection', async () => {
        const postListResult = repository.find<Post>(collectionName, repository.operators.plain({ isTest: true }));
        if (postListResult.error()) {
            throw postListResult.error();
        }
        const postList: Post[] = [];
        while (await postListResult.next()) {
            const [post, err] = postListResult.decode();
            if (err) {
                throw err;
            }
            if (!post) {
                throw Error('Post can not be null!');
            }
            postList.push(post);
        }
        await postListResult.close();
        expect(postList.length).toEqual(7);
    });
    it('[Mongo Repository] should return list of docs with query using filter', async () => {
        const filter: IOperators = repository.operators.search('repository!');
        filter.in('ownerUserId', ['ffd35c15-1a7f-45b1-960c-d95d08f07c3f']);
        const postListResult = repository.find<Post>(collectionName, filter);
        if (postListResult.error()) {
            throw postListResult.error();
        }
        const postList: Post[] = [];
        while (await postListResult.next()) {
            const [post, err] = postListResult.decode();
            if (err) {
                throw err;
            }
            if (!post) {
                throw Error('Post can not be null!');
            }
            postList.push(post);
        }
        await postListResult.close();
        expect(postList.length).toEqual(5);
    });
    it('[Mongo Repository] should return list of docs with query using pagination and sort', async () => {
        const numberOfItems = 3;
        const page = 2;
        const sortMap: Record<string, number> = {};
        sortMap['createdDate'] = -1;
        const skip = numberOfItems * (page - 1);
        const limit = numberOfItems;
        const filter: IOperators = repository.operators.search('repository!');
        filter.in('ownerUserId', ['ffd35c15-1a7f-45b1-960c-d95d08f07c3f']);
        const postListResult = repository.find<Post>(collectionName, filter, limit, skip, sortMap);
        if (postListResult.error()) {
            throw postListResult.error();
        }
        const postList: Post[] = [];
        while (await postListResult.next()) {
            const [post, err] = postListResult.decode();
            if (err) {
                throw err;
            }
            if (!post) {
                throw Error('Post can not be null!');
            }
            postList.push(post);
        }
        await postListResult.close();
        expect(postList[1]._id).toEqual(postListMock[0]._id);
    });
    it('[Mongo Repository] should update a doc into collection', async () => {
        const filter: IOperators = repository.operators.plain({ _id: postListMock[0]._id });
        const updateResult = await repository.update(
            collectionName,
            filter,
            repository.operators.set({ name: 'Amir' }),
        );

        if (updateResult.error) {
            throw updateResult.error;
        }
        const findPostResult = await repository.findOne<Post>(
            collectionName,
            repository.operators.plain({ _id: postListMock[0]._id }),
        );
        const [post, err] = findPostResult.decode();
        if (err) {
            throw err;
        }
        if (!post) {
            throw Error('Post can not be null');
        }
        expect(post.name).toEqual('Amir');
    });
    it('[Mongo Repository] should update many docs in collection', async () => {
        const filter: IOperators = repository.operators.plain({ ownerUserId: 'ffd35c15-1a7f-45b1-960c-d95d08f07c3f' });
        const data = { name: 'Ali' };

        const updatePostResult = await repository.updateMany(collectionName, filter, repository.operators.set(data));
        if (updatePostResult.error) {
            throw updatePostResult.error;
        }
        expect(updatePostResult.result).toEqual(5);
    });
    it('[Mongo Repository] should update bulks docs into collection', async () => {
        const updatePostResult = await repository.bulkUpdateOne(collectionName, [
            {
                filter: repository.operators.plain({ _id: postListMock[0]._id }),
                data: repository.operators.set({ name: 'Reza' }),
                upsert: true,
            },
            {
                filter: repository.operators.plain({ _id: postListMock[1]._id }),
                data: repository.operators.set({ body: 'Bulk update test!' }),
                upsert: true,
            },
        ]);
        if (updatePostResult.error) {
            throw updatePostResult.error;
        }
        const postListResult = await repository.find<Post>(
            collectionName,
            repository.operators.or([{ _id: postListMock[0]._id }, { _id: postListMock[1]._id }]),
        );
        let posts: { [key: string]: Post } = {};
        while (await postListResult.next()) {
            const [post, err] = postListResult.decode();
            if (err) {
                throw err;
            }
            if (!post) {
                throw Error('Post can not be null!');
            }
            posts = { ...posts, [post._id]: post };
        }
        await postListResult.close();
        expect(posts[postListMock[0]._id].name).toEqual('Reza');
        expect(posts[postListMock[1]._id].body).toEqual('Bulk update test!');
    });
    it('[Mongo Repository] should delete a doc in collection', async () => {
        const filter: IOperators = repository.operators.plain({ _id: postListMock[0]._id });

        const deletePostResult = await repository.delete(collectionName, filter, true);
        if (deletePostResult.error) {
            throw deletePostResult.error;
        }
        const foundPost = await repository.findOne<Post>(
            collectionName,
            repository.operators.plain({
                _id: postListMock[0]._id,
            }),
        );
        if (foundPost.error()) {
            throw foundPost.error();
        }
        expect(foundPost.noResult()).toEqual(true);
    });
    it('[Mongo Repository] should delete many docs in collection', async () => {
        const filter: IOperators = repository.operators.plain({ isTest: true });

        const deletePostsResult = await repository.delete(collectionName, filter, false);
        if (deletePostsResult.error) {
            throw deletePostsResult.error;
        }
        const postListResult = repository.find<Post>(collectionName, filter);
        if (postListResult.error()) {
            throw postListResult.error();
        }
        const postList: Post[] = [];
        while (await postListResult.next()) {
            const [post, err] = postListResult.decode();
            if (err) {
                throw err;
            }
            if (!post) {
                throw Error('Post can not be null!');
            }
            postList.push(post);
        }
        await postListResult.close();
        expect(postList.length).toEqual(0);
    });
});
