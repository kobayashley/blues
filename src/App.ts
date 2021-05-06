import {ConfigKey, getConfig} from "./util/Config"; // Unfortunately must be the first import
import {Client} from "discord.js";
import {registerListeners} from "./listeners/RegisterListeners";
import {registerCommands} from "./commands/CommandUtil";
import Log from "./util/Log";
import express from "express";
import {registerRoutes} from "./server/routes/registerRoutes";
import {registerMiddlewares} from "./server/middlewares/registerMiddlewares";
import {getServer} from "./server/getServer";

const main = async () => {
    try {
        const client = await startDiscord();
        startServer(client);
    } catch (err) {
        Log.error("Failed start Blues:", err);
    }
};

const startDiscord = async (): Promise<Client> => {
    const client = new Client();
    const withCommands = await registerCommands(client);
    const withListeners = await registerListeners(withCommands);
    await withListeners.login(String(getConfig(ConfigKey.botToken)));
    return client;
};

const startServer = (client: Client) => {
    const port = getConfig(ConfigKey.port);
    const server = getServer();
    const withMiddlewares = registerMiddlewares(server);
    const withRoutes = registerRoutes(withMiddlewares, client);
    withRoutes.listen(port, () => Log.info(`Server started on port ${port}`));
};

main();
