import {Request, Response} from "express-serve-static-core";
import {getDatabaseAdapter} from "../../adapters/database/DatabaseAdapter";
import {Client} from "discord.js";
import {AuthorizationState} from "../../services/Authorization";
import PlaylistController, {PlaylistOptions} from "../../controllers/PlaylistController";
import Log from "../../util/Log";
import {ConfigKey, getConfig} from "../../util/Config";
import {PlatformController} from "../../controllers/platforms/PlatformController";

const database = getDatabaseAdapter();
const prefix = getConfig(ConfigKey.pathPrefix);

const handleOAuth = (client: Client, readParams: ReadParams, makePlaylist: MakePlatformController) => async (req: Request, res: Response): Promise<void> => {
    try {
        const {options, clientToken} = readParams(req);
        if (await database.hasToken(options.token)) {
            const platform = await makePlaylist(options, clientToken);
            res.render("playlist", {...options, title: "playlist", prefix});
            return new PlaylistController(platform).sendPlaylist(client, options);
        } else {
            throw new Error("Token is not valid");
        }
    } catch (err) {
        Log.error("Problem handling OAuth", err);
        res.render("error", {prefix});
    }
};

export type ReadParams = (req: Request) => {options: AuthorizationState, clientToken: string};
export type MakePlatformController = (options: PlaylistOptions, clientToken: string) => Promise<PlatformController>;

export {handleOAuth};
