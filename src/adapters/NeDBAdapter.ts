import Datastore from "nedb";
import {DatabaseAdapter} from "./DatabaseAdapter";
import {Song} from "../Types";
import Log from "../util/Log";

const songCollection = new Datastore({filename: './songs.db', autoload: true});
const prefixCollection = new Datastore({filename: './prefix.db', autoload: true});

interface DBSong extends Song {
    _id: string;
}

const promisifyNeDB = <T>(fn: (...args: any[]) => void): (...args: any[]) => Promise<T> => (...args: any[]) =>
    new Promise((resolve, reject) => {
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
    Log.debug(`Saving ${song.name} song to the db`);
    const time = Date.now();
    return promisifyNeDB<void>(songCollection.insert.bind(songCollection))({...song, time});
};

const getLatestSong = async (): Promise<Song> => {
    Log.debug(`Getting latest song to the db`);
    const cursor = songCollection.find({}).sort({time: -1}).limit(1);
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
    return promisifyNeDB<void>(songCollection.update.bind(songCollection))(song, {$set: {skipped: true}}, {});
};

const getSongsBetween = async (from: number, until: number): Promise<Song[]> => {
    const query = {$and:[{time: {$gt: from}}, {time: {$lt: until}}]};
    const cursor = songCollection.find(query).sort({time: 1});
    const documents = await promisifyNeDB<DBSong[]>(cursor.exec.bind(cursor))();
    documents.forEach((document) => delete document._id);
    Log.debug(`Retrieved ${documents.length} songs`);
    return documents;
};

const getPrefix = async (): Promise<string> => {
    const document = await promisifyNeDB<{prefix: string}>(prefixCollection.findOne.bind(prefixCollection))({});
    Log.debug("Retrieved prefix:", document);
    return document?.prefix ?? null;
};

const setPrefix = async (prefix: string): Promise<void> => {
    Log.debug("Setting prefix:", prefix);
    return promisifyNeDB<void>(prefixCollection.update.bind(prefixCollection))({}, {prefix}, {upsert: true});
};

export const NeDBAdapter: DatabaseAdapter = {
    getPrefix,
    setPrefix,
    addSong,
    getSongsBetween,
    getLatestSong,
    skipSong,
};
