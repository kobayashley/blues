import {ConfigKey, getConfig} from "../src/util/Config"; // Unfortunately must be the first import
import {getDatabaseAdapter} from "../src/adapters/database/DatabaseAdapter";
import open from "open";
import express from "express";
import {Request, Response} from "express-serve-static-core";
import Log from "../src/util/Log";
import {Source} from "../src/Types";
import SpotifyWebApi from "spotify-web-api-node";

// To run this script, use `yarn authenticate-spotify`
// https://github.com/thelinmichael/spotify-web-api-node#authorization-code-flow

Log.info("Beginning Local Authentication for Spotify");

const redirectUri = String(getConfig(ConfigKey.spotifyOauthCallback));

const client = new SpotifyWebApi({
    clientId: String(getConfig(ConfigKey.spotifyClientId)),
    clientSecret: String(getConfig(ConfigKey.spotifySecretKey)),
    redirectUri,
});

const scope = ["playlist-modify-private"];
const state = "foo-bar-baz";

const authorizeUrl = client.createAuthorizeURL(scope, state);

const app = express();
app.get(new URL(redirectUri).pathname, async (req: Request, res: Response) => {
    const {searchParams} = new URL(req.url, redirectUri.toString());
    if (searchParams.get("state") === state) {
        const clientToken = searchParams.get("code");
        const {body} = await client.authorizationCodeGrant(clientToken);
        await getDatabaseAdapter().setRefreshToken(Source.SPOTIFY, body.refresh_token);
        Log.info("Acquired new refresh token. Closing server");
        res.send("Success! You may close this tab.");
        server.close(() => {
            Log.info("Server closed");
            process.exit(0);
        });
    } else {
        res.sendStatus(301);
    }
});

const server = app.listen(3000, async () => {
    Log.info("Server started and listening on 3000. Opening browser.");
    const childProcess = await open(authorizeUrl, { wait: false });
    childProcess.unref();
});
