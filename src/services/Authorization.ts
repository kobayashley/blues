import {OAuth2Client} from "google-auth-library";
import {ConfigKey, getConfig} from "../util/Config";
import {PlaylistOptions} from "../controllers/PlaylistController";
import {Source} from "../Types";
import SpotifyWebApi from "spotify-web-api-node";

const getYouTubeAuth = (): OAuth2Client =>
    new OAuth2Client({
        clientId: String(getConfig(ConfigKey.googleClientId)),
        clientSecret: String(getConfig(ConfigKey.googleSecretKey)),
        redirectUri: String(getConfig(ConfigKey.googleOAuthCallback)),
    });

const getYouTubeAuthURL = (options: PlaylistOptions): string => {
    const auth = getYouTubeAuth();
    return auth.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/youtube',
        state: JSON.stringify(options),
    });
};

const getSpotifyAuth = (): SpotifyWebApi =>
    new SpotifyWebApi({
        clientId: String(getConfig(ConfigKey.spotifyClientId)),
        clientSecret: String(getConfig(ConfigKey.spotifySecretKey)),
        redirectUri: String(getConfig(ConfigKey.spotifyOAuthCallback)),
    });

const getSpotifyAuthURL = (options: PlaylistOptions): string => {
    const auth = getSpotifyAuth();
    const scope = ["playlist-modify-private"];
    // Spotify state can't take the '#' key so we must remove it and join it later
    const state = JSON.stringify({...options, requester: options.requester.split("#")});
    return auth.createAuthorizeURL(scope, state);
};

const getAuthURL = (options: PlaylistOptions): string =>
    options.source === Source.YOUTUBE ? getYouTubeAuthURL(options) : getSpotifyAuthURL(options);

export {getYouTubeAuth, getSpotifyAuth, getAuthURL};
