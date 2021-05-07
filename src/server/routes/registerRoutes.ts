import {Express, Request, Response} from "express-serve-static-core";
import {ConfigKey, getConfig} from "../../util/Config";
import {Client} from "discord.js";
import {readGoogleParams, makeYouTubePlaylist} from "./handleGoogleOAuth";
import {readSpotifyParams, makeSpotifyPlaylist} from "./handleSpotifyOAuth";
import {handleOAuth} from "./handleOAuth";

const registerRoutes = (server: Express, client: Client): Express => {
    server.get(getPath(ConfigKey.googleOAuthCallback), handleOAuth(client, readGoogleParams, makeYouTubePlaylist));
    server.get(getPath(ConfigKey.spotifyOAuthCallback), handleOAuth(client, readSpotifyParams, makeSpotifyPlaylist));
    server.get("/", home);
    return server;
};

const getPath = (key: ConfigKey): string =>
    new URL(String(getConfig(key))).pathname;

const home = (req: Request, res: Response): void => res.render("home", {title: "home"});

export {registerRoutes};
