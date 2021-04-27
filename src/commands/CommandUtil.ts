import {Command} from "./Command";
import {Message} from "discord.js";
import PrefixController from "../controllers/PrefixController";
import {batchImport} from "../util/Util";

const commands: Map<string, Command> = new Map();

const registerCommands = async (): Promise<void> => {
    const importedFiles = await batchImport(`${__dirname}/impl`);
    importedFiles.forEach((importedFile) => {
        const command: Command = importedFile;
        // If both a TS _and_ a JS file are present, one will just overwrite the other
        commands.set(command.name, command);
    });
};

const getCommand = (command: string): Command => {
    return commands.get(command);
};

const getAllCommands = (): Command[] => {
    return Array.from(commands.values());
};

const isCommandFormatted = async (message: Message): Promise<boolean> => {
    // is from a person and is prefixed
    const prefix = await PrefixController.getPrefix();
    return message.author.bot === false && message.content.trim().startsWith(prefix);
};

const parseCommandAndArgs = async (message: Message): Promise<{command: string, args: string[]}> => {
    const prefix = await PrefixController.getPrefix();
    const contentWithoutPrefix = message.content.replace(prefix, "");
    const trimmedContent = contentWithoutPrefix.trim();
    const tokens = trimmedContent.split(" ").filter((s) => !!s);
    const command = tokens[0] ?? "";
    const args = tokens.slice(1);
    return {command, args};
};

export {
    registerCommands,
    getCommand,
    getAllCommands,
    isCommandFormatted,
    parseCommandAndArgs
};
