import {CommandBinder} from "../Command";
import {Message} from "discord.js";
import SettingsController from "../../controllers/SettingsController";
import {getGuild} from "../../util/Util";

const prefix: CommandBinder = () => ({
    name: "prefix",
    description: "Updates the prefix for commands",
    usage: "prefix <newPrefix>",
    procedure: async (message: Message, args: string[]) => {
        const [arg] = args;
        let reply;
        if (arg) {
            try {
                await SettingsController.setPrefix(getGuild(message), arg);
                reply = `Prefix has been updated to \`${arg}\``;
            } catch (err) {
                reply = err.message;
            }
        } else {
            reply = "New prefix required";
        }
        return message.channel.send(reply);
    },
});

export default prefix;
