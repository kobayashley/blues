import {CommandBinder} from "../Command";
import {Message} from "discord.js";
import SettingsController from "../../controllers/SettingsController";
import {getGuild} from "../../util/Util";

const rythm: CommandBinder = () => ({
    name: "rythm",
    description: "Binds Blues to the mentioned Rythm bot",
    usage: "rythm <bot>",
    procedure: async (message: Message) => {
        if (message.mentions.members.size !== 1) {
            return message.channel.send("Please specify one Rythm bot");
        }
        const bot = message.mentions.members.first();
        if (bot.user.bot === false) {
            return message.channel.send("Rythm bot should be a bot");
        }
        if (!bot.user.username.includes("Rythm")) {
            await message.channel.send('Setting the bot to be one without "Rythm" in its username.' +
                ' Are you sure this is a Rythm bot?');
        }
        await SettingsController.setBot(getGuild(message), bot.id);
        return message.channel.send(`Blues bound to ${bot.user.toString()}`);
    },
});

export default rythm;
