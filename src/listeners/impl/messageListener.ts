import {Listener} from "../Listener";
import Log from "../../util/Log";
import {Client, Message} from "discord.js";
import {getCommand, isCommandFormatted, parseCommandAndArgs} from "../../commands/CommandUtil";
import RythmController from "../../controllers/RythmController";
import PrefixController from "../../controllers/SettingsController";

const messageListener: Listener<"message"> = {
    event: "message",
    procedure: (client: Client) => async (message: Message) => {
        Log.debug(`Message from ${message.author.username}: ${message.content}`);
        if (RythmController.isRythmEvent(message)) {
            Log.debug("Announcement from Rythm detected");
            return RythmController.handleEvent(message);
        } else if (await isCommandFormatted(message)) {
            const {command, args} = await parseCommandAndArgs(message);
            Log.info(`Issuing command "${command}" with arguments:`, args);
            return getCommand(command)?.procedure(message, args);
        } else if (message.mentions.has(client.user.id)) {
            const prefix = await PrefixController.getPrefix();
            return message.channel.send(`Did someone mention me? Try \`${prefix}help\` instead!`);
        }
    },
};

module.exports = messageListener;
