import {Command, CommandBinder} from "../Command";
import {Client, DMChannel, Message, NewsChannel, TextChannel} from "discord.js";
import SettingsController from "../../controllers/SettingsController";
import {MuteConfig, MuteOption} from "../../Types";
import Log from "../../util/Log";
import {getGuild, isMuteOption} from "../../util/Util";

const mute: CommandBinder = (client: Client) => ({
    name: "mute",
    description: "Turn on automatic muting when in voice with Rythm",
    usage: `mute <setting = ${MuteOption.OFF} | ${MuteOption.WARN} | ${MuteOption.ON}>`,
    procedure: async (message: Message, args: string[]) => {
        const [arg] = args;
        if (isMuteOption(arg)) {
            if (arg === MuteOption.OFF) {
                // We're done!
                await saveConfiguration(getGuild(message), MuteOption.OFF, "");
                return message.channel.send("Mute is now disabled");
            } else {
                // We need to get the correct channel to put warning into
                getChannelReply(client, message, arg);
                return message.channel.send("Which channel would you like warning messages to go to?");
            }
        } else {
            // Tell the user the proper usage
            return message.channel.send(`Mute must be set to '${MuteOption.ON}', '${MuteOption.OFF}', or '${MuteOption.WARN}'`);
        }
    },
});

const getChannelReply = (client: Client, oldMessage: Message, mute: MuteOption) => {
    const listener = async (newMessage: Message) => {
        if (oldMessage.author.id !== newMessage.author.id) {
            Log.debug("Mute setting reply from wrong user");
            return;
        }
        if (oldMessage.channel.id !== newMessage.channel.id) {
            Log.debug("Mute setting reply from wrong channel");
            return;
        }
        if (newMessage.mentions.channels.size !== 1) {
            Log.debug("Mute setting reply from wrong format");
            return;
        }
        clearTimeout(timeout);
        client.off("message", listener);
        const channel = newMessage.mentions.channels.first();
        Log.info(`Setting mute warnings at level ${mute} to go to ${channel.toString()}`);
        await saveConfiguration(getGuild(newMessage), mute, channel.id);
        return oldMessage.channel.send(`Mute: ${mute}. Warnings will be sent to ${channel.toString()}`);
    };
    const timeout = setTimeout(cancelMuteConfiguration(client, listener, oldMessage.channel), 15000);
    client.on("message", listener);
};

const saveConfiguration = async (guild: string, option: MuteOption, channel: string): Promise<void> => {
    const config: MuteConfig = {option, channel};
    await SettingsController.setMute(guild, config);
};

const cancelMuteConfiguration = (client, listener, channel) =>
    () => {
        client.off("message", listener);
        return channel.send("Aborting mute configuration due to inactivity");
    };

export default mute;
