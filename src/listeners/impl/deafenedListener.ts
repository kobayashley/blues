import {Listener} from "../Listener";
import {Client, GuildMember, VoiceState} from "discord.js";
import SettingsController from "../../controllers/SettingsController";
import {MemeOption} from "../../Types";
import {getDatabaseAdapter} from "../../adapters/database/DatabaseAdapter";

const database = getDatabaseAdapter();

const deafenedListener: Listener<"voiceStateUpdate"> = {
    name: "deafenedListener",
    event: "voiceStateUpdate",
    procedure: (client: Client) => async (_: VoiceState, newVoiceState: VoiceState) => {
        if (newVoiceState.channel) {
            const guild = newVoiceState.guild.id;
            const {option, channel} = await SettingsController.getMeme(guild);
            const bot = await SettingsController.getBot(guild);
            if (shouldMakeFunOf(bot, newVoiceState.member) && option === MemeOption.ON) {
                await makeFunOf(client, newVoiceState, channel);
            }
        }
    },
};

const shouldMakeFunOf = (botID: string, member: GuildMember): boolean =>
    member.id !== botID && member.voice.selfDeaf === true && member.voice.channel.members.has(botID);

const makeFunOf = async (client: Client, voiceState: VoiceState, alertsChannelID: string): Promise<void> => {
    const deafened =  voiceState.member;
    const alertsChannel = await client.channels.fetch(alertsChannelID);
    if (alertsChannel.isText()) {
        const currentSong = await database.getLatestSong(voiceState.guild.id);
        if ((currentSong.time + currentSong.length) > Date.now()) {
            const requester = voiceState.guild.member(currentSong.requester);
            if (requester) {
                let message;
                if (requester.id === deafened.id) {
                    message = `lmao ${deafened.user.toString()} you don't wanna hear this song but you this we do???`;
                } else {
                    message = `lmao ${deafened.user.toString()} doesn't wanna hear your song ${requester.toString()}!`;
                }
                await alertsChannel.send(message);
            }
        }
    }
};

module.exports = deafenedListener;
