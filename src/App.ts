import {ConfigKey, getConfig} from "./util/Config"; // Unfortunately must be the first import
import {Client} from "discord.js";
import {registerListeners} from "./listeners/RegisterListeners";
import {registerCommands} from "./commands/CommandUtil";
import Log from "./util/Log";
import AuthenticatorService from "./services/Authenticator";

const main = async () => {
    try {
        await AuthenticatorService.init();
        const client = new Client();
        const withCommands = await registerCommands(client);
        const withListeners = await registerListeners(withCommands);
        return withListeners.login(String(getConfig(ConfigKey.botToken)));
    } catch (err) {
        Log.error("Failed start Blues:", err);
    }
};

main();
