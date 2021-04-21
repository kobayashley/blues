import {Listener} from "../Listener";
import Log from "../../util/Log";
import {Message} from "discord.js";
import {getCommand, isCommandFormatted, parseArguments, parseCommand} from "../../commands/CommandUtil";
import {isAnnouncementFormatted, saveEvent} from "../../services/SongStorage";

export const messageListener: Listener<"message"> = async (message: Message) => {
    Log.debug(`Message from ${message.author.username}: ${message.content}`);
    if (isAnnouncementFormatted(message)) {
        Log.debug("Announcement from Rythm detected");
        try {
            await saveEvent(message);
        } catch (err) {
            Log.error("Problem saving event:", err);
        }
    } else if (isCommandFormatted(message)) {
        const command = parseCommand(message);
        const args = parseArguments(message);
        Log.info(`Issuing command "${command}" with arguments:`, args);
        getCommand(command)?.procedure(message, args);
    }
};
