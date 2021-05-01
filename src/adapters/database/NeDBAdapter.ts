import Datastore from "nedb";
import {DatabaseAdapter} from "./DatabaseAdapter";
import {UserConfig, Setting, Song} from "../../Types";
import Log from "../../util/Log";

enum Collection {
    SONGS = "songs",
    SETTINGS = "settings",
}

interface DBConfig<T> extends UserConfig<T> {
    _id: string;
}

interface DBSong extends Song {
    _id: string;
}

const collections: Map<Collection, Datastore> = new Map();

const getCollection = (collection: Collection): Datastore => {
    if (!collections.has(collection)) {
        const dataStore = new Datastore({filename: `./${collection}.db`, autoload: true});
        collections.set(collection, dataStore);
    }
    return collections.get(collection);
};

const promisifyNeDB = <T>(fn: (...args: [...any[], (e, r: T) => void]) => void): (...args: any[]) => Promise<T> =>
    (...args: any[]) => new Promise((resolve, reject) => {
        const callback = (err, result) => {
            if (err) {
                return reject(err);
            } else{
                return resolve(result);
            }
        };
        fn(...args, callback);
    });

const addSong = (song: Song): Promise<void> => {
    Log.info(`Saving ${song.name} song to the db`);
    const time = Date.now();
    const songCollection = getCollection(Collection.SONGS);
    return promisifyNeDB<void>(songCollection.insert.bind(songCollection))({...song, time});
};

const getLatestSong = async (): Promise<Song> => {
    Log.debug("Getting latest song from the db");
    const cursor = getCollection(Collection.SONGS).find({}).sort({time: -1}).limit(1);
    const documents = await promisifyNeDB<DBSong[]>(cursor.exec.bind(cursor))();

    if (!documents) {
        throw new Error("No latest song exists");
    }
    const [dbSong] = documents;
    delete dbSong._id; // So no one can get a hold of it!
    return dbSong;
};

const skipSong = (song: Song): Promise<void> => {
    Log.debug(`Skipping ${song.name} in the db`);
    const songCollection = getCollection(Collection.SONGS);
    return promisifyNeDB<void>(songCollection.update.bind(songCollection))(song, {$set: {skipped: true}}, {});
};

const getSongsBetween = async (from: number, until: number): Promise<Song[]> => {
    const query = {$and:[{time: {$gt: from}}, {time: {$lt: until}}]};
    const cursor = getCollection(Collection.SONGS).find(query).sort({time: 1});
    const documents = await promisifyNeDB<DBSong[]>(cursor.exec.bind(cursor))();
    documents.forEach((document) => delete document._id);
    Log.debug(`Retrieved ${documents.length} songs`);
    return documents;
};

const getSetting = async <T>(setting: Setting): Promise<T> => {
    const prefixCollection = getCollection(Collection.SETTINGS);
    const query = {setting};
    const document = await promisifyNeDB<DBConfig<T>>(prefixCollection.findOne.bind(prefixCollection))(query);
    Log.debug(`Retrieved ${setting}:`, document);
    return document?.value ?? null;
};

const setSetting = async <T>(setting: Setting, value: T): Promise<void> => {
    Log.debug(`Setting ${setting}:`, value);
    const config = {setting, value};
    const prefixCollection = getCollection(Collection.SETTINGS);
    return promisifyNeDB<void>(prefixCollection.update.bind(prefixCollection))({}, config, {upsert: true});
};

export const NeDBAdapter: DatabaseAdapter = {
    getSetting,
    setSetting,
    addSong,
    getSongsBetween,
    getLatestSong,
    skipSong,
};
