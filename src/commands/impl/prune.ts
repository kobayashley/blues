import {CommandBinder} from "../Command";
import {Message} from "discord.js";
import {isPruneOption} from "../../util/Util";
import SettingsController from "../../controllers/SettingsController";

const prune: CommandBinder = () => ({
    name: "prune",
    description: "Turn on automatic song announcement deletion",
    usage: "mute <setting = off | on>",
    procedure: async (message: Message, args: string[]) => {
        const [arg] = args;
        if (isPruneOption(arg)) {
            // TODO assert that you have the permissions to delete bot messages
            await SettingsController.setPrune(arg);
            return message.channel.send(`Prune set to \`${arg}\``);
        } else {
            // Tell the user the proper usage
            return message.channel.send("Prune must be set to 'on' or 'off'");
        }
    },
});

export default prune;
