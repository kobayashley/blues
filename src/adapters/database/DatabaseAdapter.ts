import {Playlist, Setting, Song} from "../../Types";

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
    listsPlaylists(guild: string): Promise<Playlist[]>;
}
