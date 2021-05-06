import {ConfigKey, getConfig} from "./util/Config"; // Unfortunately must be the first import
import {Client} from "discord.js";
import {registerListeners} from "./listeners/RegisterListeners";
import {registerCommands} from "./commands/CommandUtil";
import Log from "./util/Log";
import express from "express";
import {registerRoutes} from "./routes/registerRoutes";

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
    const server = registerRoutes(express(), client);
    server.use(express.static('public'));
    server.listen(port, () => Log.info(`Server started on port ${port}`));
};

main();
