import {ConfigKey, getConfig} from "../src/util/Config"; // Unfortunately must be the first import
import {getDatabaseAdapter} from "../src/adapters/database/DatabaseAdapter";
import {OAuth2Client} from "google-auth-library";
import open from "open";
import express from "express";
import {Request, Response} from "express-serve-static-core";
import Log from "../src/util/Log";

// To run this script, use `yarn bin authenticate.ts`
// Adapted from https://github.com/googleapis/nodejs-local-auth
// In future may wish to use that package instead

Log.info("Beginning Local Authentication for Google");

const redirectUri = String(getConfig(ConfigKey.googleOauthCallback));

const client = new OAuth2Client({
    clientId: String(getConfig(ConfigKey.googleClientId)),
    clientSecret: String(getConfig(ConfigKey.googleSecretKey)),
    redirectUri,
});

const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/youtube',
});

const app = express();
app.get(new URL(redirectUri).pathname, async (req: Request, res: Response) => {
    const {searchParams} = new URL(req.url, redirectUri.toString());
    const clientToken = searchParams.get("code");
    const {tokens} = await client.getToken(clientToken);
    await getDatabaseAdapter().setRefreshToken(tokens.refresh_token);
    Log.info("Acquired new refresh token. Closing server");
    res.send("Success! You may close this tab.");
    server.close();
    process.exit(0);
});

const server = app.listen(3000, async () => {
    Log.info("Server started and listening on 3000. Opening browser.");
    const childProcess = await open(authorizeUrl, { wait: false });
    childProcess.unref();
});
