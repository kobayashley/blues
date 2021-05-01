import {Listener} from "../Listener";
import {Client, TextChannel, VoiceState} from "discord.js";
import {ConfigKey, getConfig} from "../../util/Config";
import Log from "../../util/Log";
import SettingsController from "../../controllers/SettingsController";
import {MuteOption} from "../../Types";

const BOT_ID = String(getConfig(ConfigKey.rythmId));

const voiceListener: Listener<"voiceStateUpdate"> = {
    event: "voiceStateUpdate",
    procedure: (client: Client) => async (oldVoiceState: VoiceState, newVoiceState: VoiceState) => {
        const mute = await SettingsController.getMute();
        if (newVoiceState.channel) {
            if (newVoiceState.id === BOT_ID) {
                const futureMutes = newVoiceState.channel.members
                    .filter((member) => member.id !== BOT_ID)
                    .map((member) => strategies[mute](client, member.voice));
                return Promise.all(futureMutes);
            } else if (!newVoiceState.mute) {
                if (newVoiceState.channel.members.has(BOT_ID)) {
                    await strategies[mute](client, newVoiceState);
                }
            }
        }
    },
};

type MuteStrategy = (client: Client, voiceState: VoiceState, message?: string) => void;

const performMute = async (client: Client, voiceState: VoiceState): Promise<void> => {
    try {
        await voiceState.setMute(true);
    } catch (err) {
        Log.error("Couldn't mute:", voiceState.member.displayName);
        await performWarn(client, voiceState, ", I'm not able to mute you!");
    }
};

const performWarn = async (client: Client, voiceState: VoiceState, message = ", you're not muted!"): Promise<void> => {
    const warningChannelID = await SettingsController.getWarningChannel();
    const warningChannel = await client.channels.fetch(warningChannelID);
    if (warningChannel.isText()) {
        await warningChannel.send(`${voiceState.member.user.toString()}${message}`);
    }
};

const performNothing = (_: Client, voiceState: VoiceState) => Log.debug(`Not muting ${voiceState.member.displayName}`);

const strategies: {[strategy: string]: MuteStrategy} = {
    [MuteOption.ON]: performMute,
    [MuteOption.WARN]: performWarn,
    [MuteOption.OFF]: performNothing,
};

module.exports = voiceListener;
