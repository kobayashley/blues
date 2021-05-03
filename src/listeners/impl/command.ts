import {Listener} from "../Listener";
import Log from "../../util/Log";
import {Message} from "discord.js";
import {getCommand, isCommandFormatted, parseCommandAndArgs} from "../../commands/CommandUtil";

const issueCommand: Listener<"message"> = {
    name: "issueCommand",
    event: "message",
    procedure: () => async (message: Message) => {
        if (await isCommandFormatted(message)) {
            const {command, args} = await parseCommandAndArgs(message);
            Log.info(`Issuing command "${command}" with arguments:`, args);
            return getCommand(command)?.procedure(message, args);
        }
    },
};

module.exports = issueCommand;
