import {Request, Response} from "express-serve-static-core";
import {getDatabaseAdapter} from "../../adapters/database/DatabaseAdapter";
import {Client} from "discord.js";
import {AuthorizationState} from "../../services/Authorization";
import {PlaylistOptions} from "../../controllers/PlaylistController";
import Log from "../../util/Log";

const database = getDatabaseAdapter();

const handleOAuth = (client: Client, readParams: ReadParams, makePlaylist: MakePlaylist) => async (req: Request, res: Response): Promise<void> => {
    try {
        const {options, clientToken} = readParams(req);
        if (await database.hasToken(options.token)) {
            await makePlaylist(res, client, options, clientToken);
        } else {
            throw new Error("Token is not valid");
        }
    } catch (err) {
        Log.error("Problem handling OAuth", err);
        res.render("error");
    }
};

export type ReadParams = (req: Request) => {options: AuthorizationState, clientToken: string};
export type MakePlaylist = (res: Response, client: Client, options: PlaylistOptions, clientToken: string) => Promise<void>;

export {handleOAuth};
