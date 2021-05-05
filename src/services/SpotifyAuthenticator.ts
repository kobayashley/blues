import SpotifyWebApi from "spotify-web-api-node";
import {getDatabaseAdapter} from "../adapters/database/DatabaseAdapter";
import {Source} from "../Types";
import Spotify from "../entities/Spotify";
import {ConfigKey, getConfig} from "../util/Config";
import Log from "../util/Log";

const database = getDatabaseAdapter();

const init = async (): Promise<void> => {
    Log.info("Starting Spotify Authenticator Service");

    const spotify = new SpotifyWebApi({
        clientId: String(getConfig(ConfigKey.spotifyClientId)),
        clientSecret: String(getConfig(ConfigKey.spotifySecretKey)),
        redirectUri: String(getConfig(ConfigKey.spotifyOauthCallback)),
    });

    const refreshToken = await database.getRefreshToken(Source.SPOTIFY);
    spotify.setRefreshToken(refreshToken);

    const refresh = async () => {
        Log.info("Refreshing Spotify Token");
        const response = await spotify.refreshAccessToken();
        const {expires_in, refresh_token, access_token} = response.body;
        spotify.setAccessToken(access_token);
        if (refresh_token) {
            Log.info("Saving a new Spotify refresh token!");
            spotify.setRefreshToken(refreshToken);
            await database.setRefreshToken(Source.SPOTIFY, refresh_token);
        }
        setTimeout(refresh, (expires_in - 5 * 60) * 1000);
    };
    await refresh();
    Spotify.set(spotify);
};

export default {init};

