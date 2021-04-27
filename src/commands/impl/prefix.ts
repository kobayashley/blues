import {Command} from "../Command";
import {Message} from "discord.js";
import PrefixController from "../../controllers/PrefixController";

const prefix: Command = {
    name: "prefix",
    description: "Updates the prefix for commands",
    usage: "prefix <newPrefix>",
    procedure: async (message: Message, args: string[]) => {
        const [arg] = args;
        let reply;
        if (arg) {
            try {
                await PrefixController.updatePrefix(arg);
                reply = `Prefix has been updated to \`${arg}\``;
            } catch (err) {
                reply = err.message;
            }
        } else {
            reply = "New prefix required";
        }
        return message.channel.send(reply);
    },
};

module.exports = prefix;
