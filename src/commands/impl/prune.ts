import {CommandBinder} from "../Command";
import {Client, Message} from "discord.js";
import {getGuild, isPruneOption} from "../../util/Util";
import SettingsController from "../../controllers/SettingsController";
import Log from "../../util/Log";
import {PruneOption} from "../../Types";

const prune: CommandBinder = (client: Client) => ({
    name: "prune",
    description: "Turn on automatic song announcement deletion",
    usage: `prune <setting = ${PruneOption.ON} | ${PruneOption.OFF} | ${PruneOption.REPLACE}>`,
    procedure: async (message: Message, args: string[]) => {
        const [arg] = args;
        if (!isPruneOption(arg)) {
            // Tell the user the proper usage
            return message.channel.send(`Prune must be set to '${PruneOption.ON}', '${PruneOption.OFF}', or '${PruneOption.REPLACE}'`);
        } else if (arg === PruneOption.ON || arg === PruneOption.REPLACE) {
            Log.info("Attempting to enable message pruning");
            const clientMember = message.guild?.member(client.user);
            const manageMessages = clientMember?.hasPermission("MANAGE_MESSAGES");
            if (!manageMessages) {
                Log.info("Blues lacking permissions to enable message pruning");
                return message.channel.send("Blues lacks the permissions to prune announcement messages");
            }
        }
        await SettingsController.setPrune(getGuild(message), arg);
        return message.channel.send(`Prune set to \`${arg}\``);
    },
});

export default prune;
