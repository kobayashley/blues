import {Playlist, Setting, Song, Source} from "../../Types";
import {NeDBAdapter} from "./impl/NeDBAdapter";

export interface DatabaseAdapter {
    // settings
    getSetting<T>(guild: string, setting: Setting): Promise<T>;
    setSetting<T>(guild: string, setting: Setting, value: T): Promise<void>;

    // songs
    addSong(guild: string, song: Song): Promise<void>;
    getLatestSong(guild: string): Promise<Song>;
    skipSong(guild: string, song: Song): Promise<void>;
    getSongsBetween(guild: string, from: number, until: number): Promise<Song[]>;

    // playlist
    addPlaylist(guild: string, playlist: Playlist): Promise<void>;
    listPlaylists(guild: string): Promise<Playlist[]>;

    // auth
    getRefreshToken(source: Source): Promise<string>;
    setRefreshToken(source: Source, refresh: string): Promise<void>;
}

export const getDatabaseAdapter = (): DatabaseAdapter => NeDBAdapter;
