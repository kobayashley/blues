import {Setting, Song} from "../../Types";

export interface DatabaseAdapter {
    // settings
    getSetting<T>(setting: Setting): Promise<T>;
    setSetting<T>(setting: Setting, value: T): Promise<void>;

    // songs
    addSong(song: Song): Promise<void>;
    getLatestSong(): Promise<Song>;
    skipSong(song: Song): Promise<void>;
    getSongsBetween(from: number, until: number): Promise<Song[]>;
}
