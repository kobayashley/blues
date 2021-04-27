import {Listener} from "../Listener";
import Log from "../../util/Log";
import {Client, Message} from "discord.js";
import {getCommand, isCommandFormatted, parseCommandAndArgs} from "../../commands/CommandUtil";
import SongController from "../../controllers/SongController";
import PrefixController from "../../controllers/PrefixController";

const messageListener: Listener<"message"> = {
    event: "message",
    procedure: (client: Client) => async (message: Message) => {
        Log.debug(`Message from ${message.author.username}: ${message.content}`);
        if (SongController.isAnnouncementFormatted(message)) {
            Log.debug("Announcement from Rythm detected");
            try {
                await SongController.saveEvent(message);
            } catch (err) {
                Log.error("Problem saving event:", err);
            }
        } else if (await isCommandFormatted(message)) {
            const {command, args} = await parseCommandAndArgs(message);
            Log.info(`Issuing command "${command}" with arguments:`, args);
            getCommand(command)?.procedure(message, args);
        } else if (message.mentions.has(client.user.id)) {
            const prefix = await PrefixController.getPrefix();
            return message.channel.send(`Did someone mention me? Try \`${prefix}help\` instead!`);
        }
    },
};

module.exports = messageListener;
