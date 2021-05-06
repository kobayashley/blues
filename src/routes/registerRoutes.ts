import {Express} from "express-serve-static-core";
import {ConfigKey, getConfig} from "../util/Config";
import {Client} from "discord.js";
import {handleGoogleOAuth} from "./handleGoogleOAuth";
import {handleSpotifyOAuth} from "./handleSpotifyOAuth";

const registerRoutes = (server: Express, client: Client): Express => {
    server.get(getPath(ConfigKey.googleOAuthCallback), handleGoogleOAuth(client));
    server.get(getPath(ConfigKey.spotifyOAuthCallback), handleSpotifyOAuth(client));
    return server;
};

const getPath = (key: ConfigKey): string =>
    new URL(String(getConfig(key))).pathname;

export {registerRoutes};
