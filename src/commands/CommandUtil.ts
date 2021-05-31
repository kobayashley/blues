import {Command, CommandBinder} from "./Command";
import {Channel, Client, Message} from "discord.js";
import PrefixController from "../controllers/SettingsController";
import {batchImport, getGuild} from "../util/Util";

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
    // the meme command is meant to be hidden. see https://github.com/kobayashley/blues/issues/89
    return Array.from(commands.values())
        .filter((command) => command.name !== "meme");
};

const isCommandFormatted = async (message: Message): Promise<boolean> => {
    // is from a person and is prefixed and is from a guild
    const prefix = await PrefixController.getPrefix(getGuild(message));
    return message.guild && message.author.bot === false && message.content.trim().startsWith(prefix);
};

const parseCommandAndArgs = async (message: Message): Promise<{command: string, args: string[]}> => {
    const prefix = await PrefixController.getPrefix(getGuild(message));
    const contentWithoutPrefix = message.content.replace(prefix, "");
    const trimmedContent = contentWithoutPrefix.trim();
    const tokens = trimmedContent.split(" ").filter((s) => !!s);
    const command = tokens[0] ?? "";
    const args = tokens.slice(1);
    return {command, args};
};

const getMentionedChannel = (message: Message): Channel => {
    if (message.mentions.channels.size === 1) {
        return message.mentions.channels.first();
    } else {
        return message.channel;
    }
};

export {
    registerCommands,
    getCommand,
    getAllCommands,
    isCommandFormatted,
    parseCommandAndArgs,
    getMentionedChannel,
};
