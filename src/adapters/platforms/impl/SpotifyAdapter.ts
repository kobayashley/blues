import {PlatformAdapter} from "../PlatformAdapter";
import {SearchResult} from "../../../Types";
import Spotify from "../../../entities/Spotify";
import Log from "../../../util/Log";

const TRACK_LINK_REPLACEMENT = "https://open.spotify.com/track/";
const ALBUM_LINK_REPLACEMENT = "https://open.spotify.com/album/";

const search = async (query: string): Promise<SearchResult[]> => {
    const spotify = Spotify.get();
    const response = await spotify.search(query, ["album", "track"]);
    const tracks: SpotifyApi.TrackObjectFull[] = response.body?.tracks?.items ?? [];
    const albums: SpotifyApi.AlbumObjectSimplified[] = response.body?.albums?.items ?? [];

    const trackSearchResults = tracks.map((track): SearchResult => {
        const artists = track.artists.map((artist) => artist.name);
        const name = `${artists.join(" ")} - ${track.name}`;
        const link = track.external_urls.spotify;
        const length = track.duration_ms;
        return {name, link, length};
    });
    const futureAlbumSearchResults = albums.map(async (simpleAlbum): Promise<SearchResult> => {
        const album = (await spotify.getAlbum(simpleAlbum.id)).body;
        const artists = album.artists.map((artist) => artist.name);
        const name = `${artists.join(" ")} - ${album.name}`;
        const link = album.external_urls.spotify;
        const length = album.tracks.items.reduce((acc, track) => acc + track.duration_ms, 0);
        return {name, length, link};
    });
    const albumSearchResults = await Promise.all(futureAlbumSearchResults);
    const results = trackSearchResults.concat(albumSearchResults);
    Log.info(`SpotifyAdapter::search found ${results.length} results for "${query}"`);
    return results;
};

const createPlaylist = async (name: string): Promise<string> => {
    const spotify = Spotify.get();
    const response = await spotify
        .createPlaylist(name, {public: false, description: "Created by Blues Bot for Discord"});
    return response.body.external_urls.spotify;
};

const addToPlaylist = async (playlistLink: string, itemLink: string): Promise<void> => {
    const spotify = Spotify.get();
    const playlistId = playlistLink.replace("https://open.spotify.com/playlist/", "");
    const itemId = itemLink
        .replace(TRACK_LINK_REPLACEMENT, "")
        .replace(ALBUM_LINK_REPLACEMENT, "");
    let tracks: string[];
    if (!itemLink.includes(ALBUM_LINK_REPLACEMENT)) {
        tracks = [`spotify:track:${itemId}`];
    } else {
        const album = await spotify.getAlbum(itemId);
        tracks = album.body.tracks.items.map((track) => track.uri);
    }
    await spotify.addTracksToPlaylist(playlistId, tracks);
};

const SpotifyAdapter: PlatformAdapter = {
    addToPlaylist,
    createPlaylist,
    search,
};

export default SpotifyAdapter;
