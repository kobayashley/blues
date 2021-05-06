import {PlatformController} from "../PlatformController";
import SpotifyWebApi from "spotify-web-api-node";
import {SearchResult} from "../../../Types";
import Log from "../../../util/Log";

class SpotifyController implements PlatformController {
    private static readonly TRACK_LINK_REPLACEMENT = "https://open.spotify.com/track/";
    private static readonly ALBUM_LINK_REPLACEMENT = "https://open.spotify.com/album/";

    constructor(private spotify: SpotifyWebApi) {}

    public async search(query: string): Promise<SearchResult[]> {
        // TODO maybe remove special characters from the search?
        // TODO Or do one with or without special characters?
        const response = await this.spotify.search(query, ["album", "track"]);
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
            const album = (await this.spotify.getAlbum(simpleAlbum.id)).body;
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
    }

    public async createPlaylist(name: string): Promise<string> {
        const response = await this.spotify
            .createPlaylist(name, {public: false, description: "Created by Blues Bot for Discord"});
        return response.body.external_urls.spotify;
    }

    public async addToPlaylist(playlistLink: string, itemLink: string): Promise<void> {
        const playlistId = playlistLink.replace("https://open.spotify.com/playlist/", "");
        const itemId = itemLink
            .replace(SpotifyController.TRACK_LINK_REPLACEMENT, "")
            .replace(SpotifyController.ALBUM_LINK_REPLACEMENT, "");
        let tracks: string[];
        if (!itemLink.includes(SpotifyController.ALBUM_LINK_REPLACEMENT)) {
            tracks = [`spotify:track:${itemId}`];
        } else {
            const album = await this.spotify.getAlbum(itemId);
            tracks = album.body.tracks.items.map((track) => track.uri);
        }
        await this.spotify.addTracksToPlaylist(playlistId, tracks);
    }
}

export {SpotifyController};
