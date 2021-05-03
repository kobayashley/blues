import {Playlist, SearchResult, Song, Source} from "../Types";
import {getPlatformAdapter} from "../adapters/platforms/PlatformAdapterFactory";

const createPlaylist = async (songs: Song[]): Promise<Playlist> => {
    const platformAdapter = getPlatformAdapter(Source.YOUTUBE);
    const playlistName = "TODO"; // TODO
    const playlistLink = await platformAdapter.createPlaylist(playlistName);
    for (const song of songs) {
        if (song.source === Source.YOUTUBE) {
            await platformAdapter.addToPlaylist(playlistLink, song.link);
        } else {
            const searchResults = await platformAdapter.search(song.name);
            const matchingSearchResult = selectBestSearchResult(song, searchResults);
            if (matchingSearchResult) {
                await platformAdapter.addToPlaylist(playlistLink, matchingSearchResult.link);
            }
        }
    }
    return {name: playlistName, link: playlistLink, source: Source.YOUTUBE};
};

const selectBestSearchResult = (originalSong: Song, songLinks: SearchResult[]): SearchResult => {
    // TODO implement stub
    return songLinks[0];
};

export default {createPlaylist};
