import * as dotenv from 'dotenv';
dotenv.config();
import Log from "./Log";

export enum ConfigKey {
    botToken = "botToken",
    defaultRythmId = "defaultRythmId",
    defaultPrefix = "defaultPrefix",

    googleClientId = "googleClientId",
    googleSecretKey = "googleSecretKey",
    googleOauthCallback = "googleOathCallback",

    spotifyClientId = "spotifyClientId",
    spotifySecretKey = "spotifySecretKey",
    spotifyOauthCallback = "spotifyOathCallback",
}

const config: {[key: string]: number | string | boolean} = {
    [ConfigKey.botToken]:        process.env.BOT_TOKEN,
    [ConfigKey.defaultRythmId]:  process.env.RYTHM_ID,
    [ConfigKey.defaultPrefix]:   process.env.DEFAULT_PREFIX,

    [ConfigKey.googleClientId]:      process.env.GOOGLE_CLIENT_ID,
    [ConfigKey.googleSecretKey]:     process.env.GOOGLE_CLIENT_SECRET,
    [ConfigKey.googleOauthCallback]: process.env.GOOGLE_OAUTH2_CALLBACK,

    [ConfigKey.spotifyClientId]:      process.env.SPOTIFY_CLIENT_ID,
    [ConfigKey.spotifySecretKey]:     process.env.SPOTIFY_CLIENT_SECRET,
    [ConfigKey.spotifyOauthCallback]: process.env.SPOTIFY_OAUTH2_CALLBACK,
};

export const getConfig = (key: ConfigKey): number | string | boolean => {
    if (config[key] !== null && config[key] !== undefined) {
        return config[key];
    } else {
        Log.warn(`Config Key "${key}" was not set, yet accessed.`);
        return null;
    }
};
