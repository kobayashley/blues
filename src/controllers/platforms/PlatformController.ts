import {SearchResult} from "../../Types";

export interface PlatformController {
    search(query: string): Promise<SearchResult[]>;
    createPlaylist(name: string): Promise<string>;
    addToPlaylist(playlistLink: string, songLink: string): Promise<void>;
}
