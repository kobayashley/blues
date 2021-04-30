import {SearchResult} from "../../Types";

export interface PlatformAdapter {
    search(query: string): Promise<SearchResult[]>;
    createPlaylist(name: string): Promise<string>;
    addToPlaylist(playlistLink: string, songLink: string): Promise<void>;
}
