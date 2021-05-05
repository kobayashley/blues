import {CommandBinder} from "../Command";
import {Client, Message, MessageEmbed} from "discord.js";
import PlaylistController from "../../controllers/PlaylistController";
import {getGuild, isSource} from "../../util/Util";
import {getDatabaseAdapter} from "../../adapters/database/DatabaseAdapter";
import Log from "../../util/Log";
import {Song, Source} from "../../Types";
import RangeDeterminer from "../../services/RangeDeterminer";

const database = getDatabaseAdapter();

const playlist: CommandBinder = (client: Client) => ({
    name: "playlist",
    description: "Creates a YouTube playlist from music played by Rythm",
    usage: `playlist <source = ${Source.YOUTUBE} | ${Source.SPOTIFY}>? (<year> <month> <day> | (<startMessage> <endMessage>?))?`,
    procedure: async (message: Message, args: string[]) => {
        const now = Date.now();
        const dayStart = new Date(now).setHours(0, 0, 0);
        try {
            const {source, remainingArgs} = determineSource(args);
            if (!isSupportedSource(source)) {
                return message.channel.send(`${source} is not supported`);
            }
            const defaultRange = {start: dayStart, end: now};
            const requestRange = await RangeDeterminer.determineRange(client, message, remainingArgs, defaultRange);
            await message.channel.send(`Creating a new ${source} playlist...`);
            const songs = await database.getSongsBetween(getGuild(message), requestRange.start, requestRange.end);
            const playlistRange = PlaylistController.getPlaylistRange(songs);
            const existingPlaylist = await database.getPlaylist(getGuild(message), source, playlistRange);
            if (existingPlaylist) {
                const {name, link} = existingPlaylist;
                await sendPlaylistEmbed(name, link, message, "Playlist already existed");
            } else {
                await createPlaylist(source, message, songs);
            }
        } catch (err) {
            return message.channel.send(`Failed to create this playlist! ${err.message}`);
        }
    },
});

const determineSource = (args: string[]): { source: Source, remainingArgs: string[] } => {
    if (isSource(args[0])) {
        return {source: args[0], remainingArgs: args.slice(1)};
    } else {
        return {source: Source.YOUTUBE, remainingArgs: args};
    }
};

const isSupportedSource = (source: Source): boolean =>
    source === Source.YOUTUBE || source === Source.SPOTIFY;

const createPlaylist = async (source: Source, message: Message, songs: Song[]): Promise<void> => {
    if (songs.length > 0) {
        try {
            const playlist = await PlaylistController.createPlaylist(songs, source, message.author.username);
            await database.addPlaylist(getGuild(message), playlist);
            const {name, link} = playlist;
            await sendPlaylistEmbed(name, link, message, "Playlist created successfully");
        } catch (err) {
            Log.error("Failed to create playlist.", err);
            throw new Error(`Issue communicating with ${source}`);
        }
    } else {
        throw new Error("There are no songs to add to a playlist");
    }
};

const sendPlaylistEmbed = (name: string, link: string, message: Message, description: string): Promise<Message> =>
    message.channel.send(new MessageEmbed()
        .setTitle(name)
        .setURL(link)
        .setDescription(description));

export default playlist;
