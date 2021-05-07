import * as dotenv from 'dotenv';
dotenv.config();
import Log from "./Log";

export enum ConfigKey {
    botToken = "botToken",
    defaultRythmId = "defaultRythmId",
    defaultPrefix = "defaultPrefix",

    port = "port",

    googleClientId = "googleClientId",
    googleSecretKey = "googleSecretKey",
    googleOAuthCallback = "googleOathCallback",

    spotifyClientId = "spotifyClientId",
    spotifySecretKey = "spotifySecretKey",
    spotifyOAuthCallback = "spotifyOathCallback",

    tokenLifeTime = "tokenLifeTime",
}

const config: {[key: string]: number | string | boolean} = {
    [ConfigKey.botToken]:        process.env.BOT_TOKEN,
    [ConfigKey.defaultRythmId]:  process.env.RYTHM_ID,
    [ConfigKey.defaultPrefix]:   process.env.DEFAULT_PREFIX,

    [ConfigKey.port]:              Number(process.env.PORT),

    [ConfigKey.googleClientId]:      process.env.GOOGLE_CLIENT_ID,
    [ConfigKey.googleSecretKey]:     process.env.GOOGLE_CLIENT_SECRET,
    [ConfigKey.googleOAuthCallback]: process.env.GOOGLE_OAUTH2_CALLBACK,

    [ConfigKey.spotifyClientId]:      process.env.SPOTIFY_CLIENT_ID,
    [ConfigKey.spotifySecretKey]:     process.env.SPOTIFY_CLIENT_SECRET,
    [ConfigKey.spotifyOAuthCallback]: process.env.SPOTIFY_OAUTH2_CALLBACK,

    [ConfigKey.tokenLifeTime]: 5 * 60, // 5 minutes
};

export const getConfig = (key: ConfigKey): number | string | boolean => {
    if (config[key] !== null && config[key] !== undefined) {
        return config[key];
    } else {
        Log.warn(`Config Key "${key}" was not set, yet accessed.`);
        return null;
    }
};
