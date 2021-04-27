import {Command} from "../Command";
import {Message} from "discord.js";

const help: Command = {
    name: "help",
    description: "Displays list of commands",
    usage: "",
    procedure: async (message: Message) => message.channel.send("Need help?"), // TODO implement stub
};

module.exports = help;
