import {Express, Request, Response} from "express-serve-static-core";
import {ConfigKey, getConfig} from "../../util/Config";
import {Client} from "discord.js";
import {makeYouTubeController, readGoogleParams} from "./handleGoogleOAuth";
import {makeSpotifyController, readSpotifyParams} from "./handleSpotifyOAuth";
import {handleOAuth} from "./handleOAuth";

const prefix = getConfig(ConfigKey.pathPrefix);

const registerRoutes = (server: Express, client: Client): Express => {
    server.get(getPath(ConfigKey.googleOAuthCallback), handleOAuth(client, readGoogleParams, makeYouTubeController));
    server.get(getPath(ConfigKey.spotifyOAuthCallback), handleOAuth(client, readSpotifyParams, makeSpotifyController));
    server.get(prefix + "/", home);
    return server;
};

const getPath = (key: ConfigKey): string =>
    new URL(String(getConfig(key))).pathname;

const home = (req: Request, res: Response): void =>
    res.render("home", {title: "home", prefix});

export {registerRoutes};
