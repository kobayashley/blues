import {CommandBinder} from "../Command";
import {Message, MessageEmbed} from "discord.js";
import PlaylistController from "../../controllers/PlaylistController";
import {getGuild} from "../../util/Util";
import {getDatabaseAdapter} from "../../adapters/database/DatabaseAdapter";
import Log from "../../util/Log";

const database = getDatabaseAdapter();

// TODO future: <source (opt) = 'youtube' | 'spotify'> <startTime (opt)> <endTime (opt)> <name (opt)>
const playlist: CommandBinder = () => ({
    name: "playlist",
    description: "Creates a YouTube playlist from music played by Rythm",
    usage: "playlist",
    procedure: async (message: Message) => {
        const now = Date.now();
        const dayStart = new Date(now).setHours(0, 0, 0);
        try {
            await message.channel.send("Creating a new playlist...");
            const songs = await database.getSongsBetween(getGuild(message), dayStart, now);
            const playlist = await PlaylistController.createPlaylist(songs);
            await  database.addPlaylist(getGuild(message), playlist);
            const {name, link} = playlist;
            const embed = createPlaylistEmbed(name, link);
            return message.channel.send(embed);
        } catch (err) {
            Log.error("Failed to create a playlist", err);
            return message.channel.send("Failed to create this playlist.");
        }

    },
});

const createPlaylistEmbed = (name: string, link: string): MessageEmbed =>
    new MessageEmbed()
        .setTitle(name)
        .setURL(link)
        .setDescription("Playlist created successfully");

export default playlist;
