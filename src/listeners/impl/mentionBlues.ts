import {Listener} from "../Listener";
import {Client, Message} from "discord.js";
import PrefixController from "../../controllers/SettingsController";
import Log from "../../util/Log";

const mentionBot: Listener<"message"> = {
    name: "mentionBot",
    event: "message",
    procedure: (client: Client) => async (message: Message) => {
        if (message.author.bot === false && message.mentions.has(client.user.id)) {
            Log.info(`${message.author.username} mentioned the bot`);
            const prefix = await PrefixController.getPrefix();
            return message.channel.send(`Did someone mention me? Try \`${prefix}help\` instead!`);
        }
    },
};

module.exports = mentionBot;
