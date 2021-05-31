import {Listener} from "../Listener";
import {Client, GuildMember, VoiceState} from "discord.js";
import SettingsController from "../../controllers/SettingsController";
import {MemeOption} from "../../Types";
import {getDatabaseAdapter} from "../../adapters/database/DatabaseAdapter";
import Log from "../../util/Log";

const database = getDatabaseAdapter();

const deafenedListener: Listener<"voiceStateUpdate"> = {
    name: "deafenedListener",
    event: "voiceStateUpdate",
    procedure: (client: Client) => async (oldVoiceState: VoiceState, newVoiceState: VoiceState) => {
        if (newVoiceState.channel) {
            const guild = newVoiceState.guild.id;
            const {option, channel} = await SettingsController.getMeme(guild);
            const bot = await SettingsController.getBot(guild);
            if (shouldMakeFunOf(bot, oldVoiceState, newVoiceState) && option === MemeOption.ON) {
                await makeFunOf(client, newVoiceState, channel);
            }
        }
    },
};

const shouldMakeFunOf = (botID: string, oldVoiceState: VoiceState, newVoiceState: VoiceState): boolean =>
    newVoiceState.member.id !== botID && oldVoiceState.selfDeaf === false &&
    newVoiceState.selfDeaf === true && newVoiceState.channel.members.has(botID);

const makeFunOf = async (client: Client, voiceState: VoiceState, alertsChannelID: string): Promise<void> => {
    const deafened = voiceState.member;
    Log.info(`deafenedListener::makeFunOf(${deafened.id}) - Begin`);
    const alertsChannel = await client.channels.fetch(alertsChannelID);
    if (alertsChannel.isText()) {
        const currentSong = await database.getLatestSong(voiceState.guild.id);
        if ((currentSong.time + currentSong.length) > Date.now()) {
            const members = await voiceState.guild.members.fetch();
            const requester = members.find((member) => member.user.tag === currentSong.requester);
            let message;
            if (requester) {
                if (requester.id === deafened.id) {
                    Log.debug("The requester is the same person who deafened");
                    message = `lmao ${deafened.user.toString()} you don't wanna hear this song but you think we do???`;
                } else {
                    Log.debug("The requester is not the person who deafened");
                    message = `lmao ${deafened.user.toString()} doesn't wanna hear your song ${requester.toString()}!`;
                }

            } else {
                Log.debug("The requester could not be found");
                message = `lmao ${deafened.user.toString()} what's wrong with the music???`;
            }
            await alertsChannel.send(message);
        } else {
            Log.info("No song is currently playing");
        }
    } else {
        Log.error("The alert channel is not a text channel");
    }
};

module.exports = deafenedListener;
