import {CommandBinder} from "../Command";
import {Channel, Message} from "discord.js";
import SettingsController from "../../controllers/SettingsController";
import {MemeConfig, MemeOption} from "../../Types";
import {getGuild, isMemeOption} from "../../util/Util";
import {getMentionedChannel} from "../CommandUtil";

const meme: CommandBinder = () => ({
    name: "meme",
    description: "Turn on meme mode",
    usage: `meme <setting = ${MemeOption.OFF} | ${MemeOption.ON}> <channel>?`,
    procedure: async (message: Message, args: string[]) => {
        const [arg] = args;
        if (isMemeOption(arg)) {
            let channel: Channel;
            if (arg !== MemeOption.OFF) {
                // We need to get the correct channel to put warning into
                channel = getMentionedChannel(message);
            }
            await saveConfiguration(getGuild(message), arg, channel?.id ?? "");
            const channelMessage = channel ? `; Memes will be sent to ${channel.toString()}` : "";
            return message.channel.send(`Meme mode is now \`${arg}\`${channelMessage}`);
        } else {
            // Tell the user the proper usage
            return message.channel.send(`Meme mode must be set to \`${MemeOption.ON}\` or \`${MemeOption.OFF}\``);
        }
    },
});

const saveConfiguration = async (guild: string, option: MemeOption, channel: string): Promise<void> => {
    const config: MemeConfig = {option, channel};
    await SettingsController.setMeme(guild, config);
};

export default meme;
