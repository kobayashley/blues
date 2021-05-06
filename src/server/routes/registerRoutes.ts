import {Express, Request, Response} from "express-serve-static-core";
import {ConfigKey, getConfig} from "../../util/Config";
import {Client} from "discord.js";
import {handleGoogleOAuth} from "./handleGoogleOAuth";
import {handleSpotifyOAuth} from "./handleSpotifyOAuth";

const registerRoutes = (server: Express, client: Client): Express => {
    server.get(getPath(ConfigKey.googleOAuthCallback), handleGoogleOAuth(client));
    server.get(getPath(ConfigKey.spotifyOAuthCallback), handleSpotifyOAuth(client));
    server.get("/", home);
    return server;
};

const getPath = (key: ConfigKey): string =>
    new URL(String(getConfig(key))).pathname;

const home = (req: Request, res: Response): void => res.render("home", {title: "home"});

export {registerRoutes};
