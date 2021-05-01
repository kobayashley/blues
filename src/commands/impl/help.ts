import {Command, CommandBinder} from "../Command";
import {Message, MessageEmbed} from "discord.js";
import {getAllCommands, getCommand} from "../CommandUtil";
import PrefixController from "../../controllers/SettingsController";

const help: CommandBinder = () => ({
    name: "help",
    description: "Displays list of commands",
    usage: "help <commandName (opt)>",
    procedure: async (message: Message, args: string[]) => {
        const [arg] = args;
        const prefix = await PrefixController.getPrefix();
        let reply;
        if (arg) {
            reply = displayCommandUsage(message, prefix, arg);
        } else {
            reply = displayAllCommands(message, prefix);
        }
        return message.channel.send(reply);
    },
});

const displayCommandUsage = (message: Message, prefix: string, commandName: string) => {
    const command = getCommand(commandName);
    if (command) {
        return new MessageEmbed()
            .setTitle(`\`${prefix}${commandName}\``)
            .setDescription(command.description)
            .addField("Usage", `\`${prefix}${command.usage}\``);
    } else {
        return `No such command: "${commandName}"`;
    }
};

const displayAllCommands = (message: Message, prefix: string) => {
    const commands: Command[] = getAllCommands();
    return new MessageEmbed()
        .setTitle("Commands")
        .addFields(...commands.map(toHelpLine(prefix)))
        .addField('\u200B', `Use \`${prefix}help <commandName>\` for usage`);
};

const toHelpLine = (prefix: string) => (command: Command): {name: string, value: string, inline: true} => {
    return {name: `\`${prefix}${command.name}\``, value: command.description, inline: true};
};

export default help;
