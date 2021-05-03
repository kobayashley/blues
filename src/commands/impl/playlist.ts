import {CommandBinder} from "../Command";
import {Message, MessageEmbed} from "discord.js";
import {NeDBAdapter} from "../../adapters/database/NeDBAdapter";
import PlaylistController from "../../controllers/PlaylistController";
import {getGuild} from "../../util/Util";

// TODO future: <source (opt) = 'youtube' | 'spotify'> <startTime (opt)> <endTime (opt)> <name (opt)>
const playlist: CommandBinder = () => ({
    name: "playlist",
    description: "Creates a YouTube playlist from music played by Rythm",
    usage: "playlist",
    procedure: async (message: Message) => {
        const now = Date.now();
        const dayStart = new Date(now).setHours(0, 0, 0);
        const songs = await NeDBAdapter.getSongsBetween(getGuild(message), dayStart, now);
        const playlist = await PlaylistController.createPlaylist(songs);
        await  NeDBAdapter.addPlaylist(getGuild(message), playlist);
        const {name, link} = playlist;
        const embed = createPlaylistEmbed(name, link);
        return message.channel.send(embed);
    },
});

const createPlaylistEmbed = (name: string, link: string): MessageEmbed =>
    new MessageEmbed()
        .setTitle(name)
        .setURL(link)
        .setDescription("Playlist created successfully");

export default playlist;