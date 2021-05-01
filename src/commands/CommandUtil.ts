import {Command, CommandBinder} from "./Command";
import {Client, Message} from "discord.js";
import PrefixController from "../controllers/SettingsController";
import {batchImport} from "../util/Util";

const commands: Map<string, Command> = new Map();

const registerCommands = async (client: Client): Promise<Client> => {
    const importedFiles = await batchImport(`${__dirname}/impl`);
    importedFiles.forEach((importedFile) => {
        const binder: CommandBinder = importedFile.default;
        // If both a TS _and_ a JS file are present, one will just overwrite the other
        const command = binder(client);
        commands.set(command.name, command);
    });
    return client;
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
