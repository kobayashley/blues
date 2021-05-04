import {Listener} from "../Listener";
import {Client, VoiceState} from "discord.js";
import Log from "../../util/Log";
import SettingsController from "../../controllers/SettingsController";
import {MuteOption} from "../../Types";

const voiceStateUpdate: Listener<"voiceStateUpdate"> = {
    name: "voiceStateUpdate",
    event: "voiceStateUpdate",
    procedure: (client: Client) => async (_: VoiceState, newVoiceState: VoiceState) => {
        if (newVoiceState.channel) {
            const guild = newVoiceState.guild.id;
            const {option} = await SettingsController.getMute(guild);
            const bot = await SettingsController.getBot(guild);
            if (newVoiceState.id === bot) {
                const futureMutes = newVoiceState.channel.members
                    .filter((member) => member.id !== bot && member.voice.mute === false)
                    .map((member) => strategies[option](client, member.voice));
                return Promise.all(futureMutes);
            } else if (!newVoiceState.mute) {
                if (newVoiceState.channel.members.has(bot)) {
                    await strategies[option](client, newVoiceState);
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
    const {channel} = await SettingsController.getMute(voiceState.guild.id);
    const warningChannel = await client.channels.fetch(channel);
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

module.exports = voiceStateUpdate;
