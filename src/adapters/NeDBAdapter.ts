import Datastore from "nedb";
import {DatabaseAdapter} from "./DatabaseAdapter";
import {Song} from "../Types";
import Log from "../util/Log";

const songs = new Datastore({filename: './songs.db', autoload: true});
const prefix = new Datastore({filename: './prefix.db', autoload: true});

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
    return promisifyNeDB<void>(songs.insert.bind(songs))({...song, time});
};

const getLatestSong = async (): Promise<Song> => {
    Log.debug(`Getting latest song to the db`);
    const cursor = songs.find({}).sort({time: -1}).limit(1);
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
    return promisifyNeDB<void>(songs.update.bind(songs))(song, {$set: {skipped: true}}, {});
};

export const NeDBAdapter: DatabaseAdapter = {
    getPrefix: async (): Promise<string> => {
        return "";
    },
    setPrefix: async (prefix: string): Promise<void> => {
        // do nothing
    },
    addSong,
    getSongsBetween: async (from: number, until: number): Promise<Song[]> => {
        return [];
    },
    getLatestSong,
    skipSong,
};
