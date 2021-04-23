import {Listener} from "../Listener";
import Log from "../../util/Log";
import {Message} from "discord.js";
import {getCommand, isCommandFormatted, parseArguments, parseCommand} from "../../commands/CommandUtil";

export const messageListener: Listener<"message"> = (message: Message) => {
    Log.info(`Got the message: ${message.content}`);

    // if message is from Rythm
    // eslint-disable-next-line no-constant-condition
    if (false) {
        // - assert that this is an announcement
        // - add the song to the db
        // else if message is from a user and starts with the prefix
    } else if (isCommandFormatted(message)) {
        const command = parseCommand(message);
        const args = parseArguments(message);
        Log.info(`Issuing command "${command}" with arguments:`, args);
        getCommand(command)?.procedure(message, args);
    }
};
