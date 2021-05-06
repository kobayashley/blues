import {Request, Response} from "express-serve-static-core";
import Log from "../util/Log";
import {Client} from "discord.js";
import {ConfigKey, getConfig} from "../util/Config";
import PlaylistController, {PlaylistOptions} from "../controllers/PlaylistController";
import {getSpotifyAuth} from "../services/Authorization";
import {SpotifyController} from "../controllers/platforms/impl/SpotifyController";

const handleSpotifyOAuth = (client: Client) => async (req: Request, res: Response): Promise<void> => {
    Log.info("Completing Spotify OAuth and Starting Playlist creation");
    const {searchParams} = new URL(req.url, String(getConfig(ConfigKey.spotifyOAuthCallback)));
    const clientToken = searchParams.get("code");
    const spotifyOptions = JSON.parse(searchParams.get("state"));
    // Spotify state can't take the '#' key so we must have removed it earlier and must join it now
    const options: PlaylistOptions = {...spotifyOptions, requester: spotifyOptions.requester.join("#")};
    const auth = getSpotifyAuth();
    const {access_token} = (await auth.authorizationCodeGrant(clientToken)).body;
    auth.setAccessToken(access_token);
    Log.info("Acquired Spotify token. Creating a playlist");
    res.send("Success! You may close this tab.");
    return new PlaylistController(new SpotifyController(auth)).sendPlaylist(client, options);
};

export {handleSpotifyOAuth};
