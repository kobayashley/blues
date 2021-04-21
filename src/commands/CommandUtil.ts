import {Arguments, Command} from "./Command";
import * as fs from "fs";
import {Message} from "discord.js";
import {getPrefix} from "../services/PrefixController";

const commands: Map<string, Command> = new Map();

const commandFileList = fs.readdirSync(`${__dirname}/impl`)
    .filter((name) => name.match(/\.[tj]s$/));

for (const file of commandFileList) {
    import(`${__dirname}/impl/${file}`).then((importedFile) => {
        const command: Command = importedFile.default;
        // If both a TS _and_ a JS file are present, one will just overwrite the other
        commands.set(command.name, command);
    });
}

const getCommand = (command: string): Command => {
    return commands.get(command);
};

const isCommandFormatted = async (message: Message): Promise<boolean> => {
    // is from a person and is prefixed
    const prefix = await getPrefix();
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
    getCommand,
    isCommandFormatted,
    parseArguments,
    parseCommand
};
