import Log from "../../util/Log";
import {ConfigKey, getConfig} from "../../util/Config";
import {AuthorizationState, getSpotifyAuth} from "../../services/Authorization";
import {SpotifyController} from "../../controllers/platforms/impl/SpotifyController";
import {MakePlatformController, ReadParams} from "./handleOAuth";

const readSpotifyParams: ReadParams = (req) => {
    Log.info("Completing Spotify OAuth and Starting Playlist creation");
    const {searchParams} = new URL(req.url, String(getConfig(ConfigKey.spotifyOAuthCallback)));
    const clientToken = searchParams.get("code");
    const spotifyOptions = JSON.parse(searchParams.get("state"));
    // Spotify state can't take the '#' key so we must have removed it earlier and must join it now
    const options: AuthorizationState = {...spotifyOptions, requester: spotifyOptions.requester.join("#")};
    return {options, clientToken};
};

const makeSpotifyController: MakePlatformController = async (options, clientToken) => {
    const auth = getSpotifyAuth();
    const {access_token} = (await auth.authorizationCodeGrant(clientToken)).body;
    auth.setAccessToken(access_token);
    Log.info("Acquired Spotify token. Creating a playlist");
    return new SpotifyController(auth);
};

export {readSpotifyParams, makeSpotifyController};
