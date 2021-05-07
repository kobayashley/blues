import {OAuth2Client} from "google-auth-library";
import {ConfigKey, getConfig} from "../util/Config";
import {PlaylistOptions} from "../controllers/PlaylistController";
import {Source} from "../Types";
import SpotifyWebApi from "spotify-web-api-node";
import * as crypto from "crypto";
import {getDatabaseAdapter} from "../adapters/database/DatabaseAdapter";

const database = getDatabaseAdapter();

const getYouTubeAuth = (): OAuth2Client =>
    new OAuth2Client({
        clientId: String(getConfig(ConfigKey.googleClientId)),
        clientSecret: String(getConfig(ConfigKey.googleSecretKey)),
        redirectUri: String(getConfig(ConfigKey.googleOAuthCallback)),
    });

const getYouTubeAuthURL = async (options: PlaylistOptions): Promise<string> => {
    const token = createToken(options);
    await database.addToken(token);
    const auth = getYouTubeAuth();
    const state: AuthorizationState = {...options, token};
    return auth.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/youtube',
        state: JSON.stringify(state),
    });
};

const getSpotifyAuth = (): SpotifyWebApi =>
    new SpotifyWebApi({
        clientId: String(getConfig(ConfigKey.spotifyClientId)),
        clientSecret: String(getConfig(ConfigKey.spotifySecretKey)),
        redirectUri: String(getConfig(ConfigKey.spotifyOAuthCallback)),
    });

const getSpotifyAuthURL = async (options: PlaylistOptions): Promise<string> => {
    const token = createToken(options);
    await database.addToken(token);
    const auth = getSpotifyAuth();
    const scope = ["playlist-modify-private"];
    // Spotify state can't take the '#' key so we must remove it and join it later
    const state: AuthorizationState = {...options, token};
    const stateString = JSON.stringify({...state, requester: options.requester.split("#")});
    return auth.createAuthorizeURL(scope, stateString);
};

const getAuthURL = (options: PlaylistOptions): Promise<string> =>
    options.source === Source.YOUTUBE ? getYouTubeAuthURL(options) : getSpotifyAuthURL(options);

const createToken = (options: PlaylistOptions): string => {
    const key = `${options.range.start}-${options.range.end}-${Date.now()}`;
    const sha256 = crypto.createHash("sha256");
    return sha256.update(key).digest("base64");
};

export interface AuthorizationState extends PlaylistOptions {
    token: string;
}

export {getYouTubeAuth, getSpotifyAuth, getAuthURL};
