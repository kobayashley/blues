import {PlatformAdapter} from "../PlatformAdapter";
import {SearchResult} from "../../../Types";

// TODO
const YouTubeAdapter: PlatformAdapter = {
    addToPlaylist(playlistLink: string, songLink: string): Promise<void> {
        return Promise.resolve();
    }, createPlaylist(name: string): Promise<string> {
        return Promise.resolve("https://www.youtube.com/watch?v=rKUJG5TdAl8");
    }, search(query: string): Promise<SearchResult[]> {
        return Promise.resolve([
                {name: "sameolemeek_", link: "https://www.youtube.com/watch?v=rKUJG5TdAl8", length: 0},
            ]);
    }

};

export default YouTubeAdapter;
