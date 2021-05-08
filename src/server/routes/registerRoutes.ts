import {Express, Request, Response} from "express-serve-static-core";
import {ConfigKey, getConfig} from "../../util/Config";
import {Client} from "discord.js";
import {makeYouTubePlaylist, readGoogleParams} from "./handleGoogleOAuth";
import {makeSpotifyPlaylist, readSpotifyParams} from "./handleSpotifyOAuth";
import {handleOAuth} from "./handleOAuth";

const prefix = getConfig(ConfigKey.pathPrefix);

const registerRoutes = (server: Express, client: Client): Express => {
    server.get(prefix + getPath(ConfigKey.googleOAuthCallback), handleOAuth(client, readGoogleParams, makeYouTubePlaylist));
    server.get(prefix + getPath(ConfigKey.spotifyOAuthCallback), handleOAuth(client, readSpotifyParams, makeSpotifyPlaylist));
    server.get(prefix + "/", home);
    return server;
};

const getPath = (key: ConfigKey): string =>
    new URL(String(getConfig(key))).pathname;

const home = (req: Request, res: Response): void => res.render("home", {title: "home", prefix});

export {registerRoutes};
