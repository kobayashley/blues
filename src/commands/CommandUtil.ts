import {Arguments, Command} from "./Command";
import {Message} from "discord.js";
import PrefixController from "../controllers/PrefixController";
import {batchImport} from "../util/Util";

const commands: Map<string, Command> = new Map();

const registerCommands = async (): Promise<void> => {
    const importedFiles = await batchImport(`${__dirname}/impl`);
    importedFiles.forEach((importedFile) => {
        const command: Command = importedFile.default;
        // If both a TS _and_ a JS file are present, one will just overwrite the other
        commands.set(command.name, command);
    });
};

const getCommand = (command: string): Command => {
    return commands.get(command);
};

const isCommandFormatted = async (message: Message): Promise<boolean> => {
    // is from a person and is prefixed
    const prefix = await PrefixController.getPrefix();
    const tokens = message.content.split(" ").filter((s) => !!s);
    return message.author.bot === false && tokens[0]?.startsWith(prefix);
};

const parseCommand = (message: Message): string => {
    // TODO implement stub
    return "help";
};

const parseArguments = (message: Message): Arguments => {
    // TODO implement stub
    return {};
};

export {
    registerCommands,
    getCommand,
    isCommandFormatted,
    parseArguments,
    parseCommand
};
