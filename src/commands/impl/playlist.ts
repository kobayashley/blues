import {CommandBinder} from "../Command";
import {Client, Message, MessageEmbed} from "discord.js";
import PlaylistController from "../../controllers/PlaylistController";
import {getGuild, isSource} from "../../util/Util";
import {getDatabaseAdapter} from "../../adapters/database/DatabaseAdapter";
import Log from "../../util/Log";
import {Range, Source} from "../../Types";
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
            const range = await RangeDeterminer.determineRange(client, message, remainingArgs, defaultRange);
            const existingPlaylist = await database.getPlaylist(getGuild(message), source, range);
            if (existingPlaylist) {
                const {name, link} = existingPlaylist;
                await sendPlaylistEmbed(name, link, message, "Playlist already existed");
            } else {
                await createPlaylist(source, message, range);
            }
        } catch (err) {
            Log.error("Failed to create a playlist", err);
            return message.channel.send("Failed to create this playlist. If you included links, do I have permission to view them?");
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
    source === Source.YOUTUBE;

const createPlaylist = async (source: Source, message: Message, range: Range): Promise<void> => {
    await message.channel.send(`Creating a new ${source} playlist...`);
    const songs = await database.getSongsBetween(getGuild(message), range.start, range.end);
    if (songs.length > 0) {
        const playlist = await PlaylistController.createPlaylist(songs, Source.YOUTUBE);
        await database.addPlaylist(getGuild(message), playlist);
        const {name, link} = playlist;
        await sendPlaylistEmbed(name, link, message, "Playlist created successfully");
    } else {
        await message.channel.send("There are no songs to add to a playlist");
    }
};

const sendPlaylistEmbed = (name: string, link: string, message: Message, description: string): Promise<Message> =>
    message.channel.send(new MessageEmbed()
        .setTitle(name)
        .setURL(link)
        .setDescription(description));

export default playlist;
