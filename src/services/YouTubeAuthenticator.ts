import {OAuth2Client} from "google-auth-library";
import {ConfigKey, getConfig} from "../util/Config";
import {getDatabaseAdapter} from "../adapters/database/DatabaseAdapter";
import Log from "../util/Log";
import {google} from "googleapis";
import {Source} from "../Types";

const database = getDatabaseAdapter();

const init = async (): Promise<void> => {
    Log.info("Starting YouTube Authenticator Service");

    const auth = new OAuth2Client({
        clientId: String(getConfig(ConfigKey.googleClientId)),
        clientSecret: String(getConfig(ConfigKey.googleSecretKey)),
        redirectUri: String(getConfig(ConfigKey.googleOauthCallback)),
    });

    auth.setCredentials({
        refresh_token: await database.getRefreshToken(Source.YOUTUBE),
    });

    auth.on("tokens", (tokens) => {
        if (tokens.refresh_token) {
            Log.info("Saving a new YouTube refresh token!");
            return database.setRefreshToken(Source.YOUTUBE, tokens.refresh_token);
        }
    });

    google.options({auth});
};

export default {init};
