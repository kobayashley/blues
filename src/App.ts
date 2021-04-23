import {ConfigKey, getConfig} from "./util/Config"; // Unfortunately must be the first import
import {Client} from "discord.js";
import {registerListeners} from "./listeners/RegisterListeners";
import {registerCommands} from "./commands/CommandUtil";

const main = async () => {
    const client = new Client();
    await registerCommands();
    const registeredClient = await registerListeners(client);
    return registeredClient.login(String(getConfig(ConfigKey.botToken)));
};

main();
