import {Request, Response} from "express-serve-static-core";
import Log from "../util/Log";
import {Client} from "discord.js";
import {ConfigKey, getConfig} from "../util/Config";
import PlaylistController, {PlaylistOptions} from "../controllers/PlaylistController";
import {YouTubeController} from "../controllers/platforms/impl/YouTubeController";
import {getYouTubeAuth} from "../services/Authorization";

const handleGoogleOAuth = (client: Client) => async (req: Request, res: Response): Promise<void> => {
    Log.info("Completing Google OAuth and Starting Playlist creation");
    const {searchParams} = new URL(req.url, String(getConfig(ConfigKey.googleOAuthCallback)));
    const clientToken = searchParams.get("code");
    const options: PlaylistOptions = JSON.parse(searchParams.get("state"));
    const auth = getYouTubeAuth();
    const {tokens} = await auth.getToken(clientToken);
    auth.setCredentials(tokens);
    Log.info("Acquired Google token. Creating a playlist");
    res.send("Success! You may close this tab.");
    return new PlaylistController(new YouTubeController(auth)).sendPlaylist(client, options);
};

export {handleGoogleOAuth};
