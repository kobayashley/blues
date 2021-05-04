import {Playlist, SearchResult, Song, Source} from "../Types";
import {getPlatformAdapter} from "../adapters/platforms/PlatformAdapterFactory";
import Log from "../util/Log";

const createPlaylist = async (songs: Song[], source: Source): Promise<Playlist> => {
    const platformAdapter = getPlatformAdapter(source);
    const playlistName = "TODO"; // TODO
    const playlistLink = await platformAdapter.createPlaylist(playlistName);
    for (const song of songs) {
        if (song.source === source) {
            await platformAdapter.addToPlaylist(playlistLink, song.link);
        } else {
            const searchResults = await platformAdapter.search(song.name);
            const matchingSearchResult = selectBestSearchResult(song, searchResults);
            if (matchingSearchResult) {
                await platformAdapter.addToPlaylist(playlistLink, matchingSearchResult.link);
            }
        }
    }
    return {name: playlistName, link: playlistLink, source: source};
};

const selectBestSearchResult = (originalSong: Song, songLinks: SearchResult[]): SearchResult => {
    // TODO implement stub
    Log.info(originalSong, songLinks[0]);
    return songLinks[0];
};

export default {createPlaylist};
