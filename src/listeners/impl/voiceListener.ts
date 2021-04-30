import {Listener} from "../Listener";
import {VoiceState} from "discord.js";
import {ConfigKey, getConfig} from "../../util/Config";
import Log from "../../util/Log";

const BOT_ID = String(getConfig(ConfigKey.rythmId));

const voiceListener: Listener<"voiceStateUpdate"> = {
    event: "voiceStateUpdate",
    procedure: () => async (oldVoiceState: VoiceState, newVoiceState: VoiceState) => {
        try {
            if (newVoiceState.channel) {
                if (newVoiceState.id === BOT_ID) {
                    const futureMutes = newVoiceState.channel.members
                        .filter((member) => member.id !== BOT_ID)
                        .map((member) =>
                            member.voice.setMute(true)
                                .catch(() => Log.error("Couldn't mute:", member.displayName)));
                    return Promise.all(futureMutes);
                } else if (!newVoiceState.mute) {
                    if (newVoiceState.channel.members.has(BOT_ID)) {
                        await newVoiceState.setMute(true);
                    }
                }
            }
        } catch (err) {
            Log.error("Failed to handle voice update:", newVoiceState.member.displayName);
        }
    },
};

module.exports = voiceListener;
