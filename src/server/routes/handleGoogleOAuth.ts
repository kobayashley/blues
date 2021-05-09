import Log from "../../util/Log";
import {ConfigKey, getConfig} from "../../util/Config";
import {YouTubeController} from "../../controllers/platforms/impl/YouTubeController";
import {AuthorizationState, getYouTubeAuth} from "../../services/Authorization";
import {MakePlatformController, ReadParams} from "./handleOAuth";

const readGoogleParams: ReadParams = (req) => {
    Log.info("Completing Google OAuth and Starting Playlist creation");
    const {searchParams} = new URL(req.url, String(getConfig(ConfigKey.googleOAuthCallback)));
    const clientToken = searchParams.get("code");
    const stateString = searchParams.get("state");
    const options: AuthorizationState = JSON.parse(stateString);
    return {options, clientToken};
};

const makeYouTubeController: MakePlatformController = async (options, clientToken) => {
    const auth = getYouTubeAuth();
    const {tokens} = await auth.getToken(clientToken);
    auth.setCredentials(tokens);
    Log.info("Acquired Google token. Creating a playlist");
    return new YouTubeController(auth);
};

export {readGoogleParams, makeYouTubeController};
