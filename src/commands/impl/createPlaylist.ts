import {Command} from "../Command";
import {Message, MessageEmbed} from "discord.js";
import {NeDBAdapter} from "../../adapters/database/NeDBAdapter";
import PlaylistController from "../../controllers/PlaylistController";

// TODO future: <source (opt) = 'youtube' | 'spotify'> <startTime (opt)> <endTime (opt)> <name (opt)>
const createPlaylist: Command = {
    name: "createPlaylist",
    description: "Creates a YouTube playlist from music played by Rythm",
    usage: "createPlaylist",
    procedure: async (message: Message, args: string[]) => {
        const now = Date.now();
        const dayStart = new Date(now).setHours(0, 0, 0);
        const songs = await NeDBAdapter.getSongsBetween(dayStart, now);
        const {name, link} = await PlaylistController.createPlaylist(songs);
        const embed = createPlaylistEmbed(name, link);
        return message.channel.send(embed);
    },
};

const createPlaylistEmbed = (name: string, link: string): MessageEmbed =>
    new MessageEmbed()
        .setTitle(name)
        .setURL(link)
        .setDescription("Playlist created successfully");

module.exports = createPlaylist;
