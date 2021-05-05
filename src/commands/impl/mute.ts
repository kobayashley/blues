import {CommandBinder} from "../Command";
import {Channel, Message} from "discord.js";
import SettingsController from "../../controllers/SettingsController";
import {MuteConfig, MuteOption} from "../../Types";
import {getGuild, isMuteOption} from "../../util/Util";

const mute: CommandBinder = () => ({
    name: "mute",
    description: "Turn on automatic muting when in voice with Rythm",
    usage: `mute <setting = ${MuteOption.OFF} | ${MuteOption.WARN} | ${MuteOption.ON}> <channel>?`,
    procedure: async (message: Message, args: string[]) => {
        const [arg] = args;
        if (isMuteOption(arg)) {
            let channel: Channel;
            if (arg !== MuteOption.OFF) {
                // We need to get the correct channel to put warning into
                if (message.mentions.channels.size === 1) {
                    channel = message.mentions.channels.first();
                } else {
                    channel = message.channel;
                }
            }
            await saveConfiguration(getGuild(message), arg, channel?.id ?? "");
            const channelMessage = channel ? `; Warnings will be sent to ${channel.toString()}` : "";
            return message.channel.send(`Mute is now \`${arg}\`${channelMessage}`);
        } else {
            // Tell the user the proper usage
            return message.channel.send(`Mute must be set to '${MuteOption.ON}', '${MuteOption.OFF}', or '${MuteOption.WARN}'`);
        }
    },
});

const saveConfiguration = async (guild: string, option: MuteOption, channel: string): Promise<void> => {
    const config: MuteConfig = {option, channel};
    await SettingsController.setMute(guild, config);
};

export default mute;
