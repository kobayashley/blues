import {Song} from "../Types";

export interface DatabaseAdapter {
    // prefix
    getPrefix(): Promise<string>;
    setPrefix(prefix: string): Promise<void>;

    // songs
    addSong(song: Song): Promise<void>;
    getLatestSong(): Promise<Song>;
    skipSong(song: Song): Promise<void>;
    getSongsBetween(from: number, until: number): Promise<Song[]>;
}
