import {CommandBinder} from "../Command";
import {Message, MessageEmbed} from "discord.js";
import PlaylistController from "../../controllers/PlaylistController";
import {getGuild, isSource} from "../../util/Util";
import {getDatabaseAdapter} from "../../adapters/database/DatabaseAdapter";
import Log from "../../util/Log";
import {Source} from "../../Types";

const database = getDatabaseAdapter();

type Range = {start: number, end: number};

// TODO future: (<date> | (<startMessage> <endMessage>))?
const playlist: CommandBinder = () => ({
    name: "playlist",
    description: "Creates a YouTube playlist from music played by Rythm",
    usage: `playlist <source = ${Source.YOUTUBE} | ${Source.SPOTIFY}>?`,
    procedure: async (message: Message, args: string[]) => {
        const now = Date.now();
        const dayStart = new Date(now).setHours(0, 0, 0);
        try {
            const {source, remainingArgs} = determineSource(args);
            if (!isSupportedSource(source)) {
                return message.channel.send(`${source} is not supported`);
            }
            const start = await determineStart(message, remainingArgs, dayStart);
            const end = await determineEnd(message, remainingArgs, now);
            await createPlaylist(source, message, {start, end});
        } catch (err) {
            Log.error("Failed to create a playlist", err);
            return message.channel.send("Failed to create this playlist.");
        }
    },
});

const determineSource = (args: string[]): {source: Source, remainingArgs: string[]} => {
    if (isSource(args[0])) {
        return {source: args[0], remainingArgs: args.slice(1)};
    } else {
        return {source: Source.YOUTUBE, remainingArgs: args};
    }
};

const determineStart = async (message: Message, args: string[], defaultStart: number): Promise<number> => {
    return defaultStart;
};

const determineEnd = async (message: Message, args: string[], defaultEnd: number): Promise<number> => {
    return defaultEnd;
};

const isSupportedSource = (source: Source): boolean =>
    source === Source.YOUTUBE;

const createPlaylist = async (source: Source, message: Message, range: Range): Promise<void> => {
    await message.channel.send(`Creating a new ${source} playlist...`);
    const songs = await database.getSongsBetween(getGuild(message), range.start, range.end);
    if (songs.length > 0) {
        const playlist = await PlaylistController.createPlaylist(songs, Source.YOUTUBE);
        await  database.addPlaylist(getGuild(message), playlist);
        const {name, link} = playlist;
        const embed = createPlaylistEmbed(name, link);
        await message.channel.send(embed);
    } else {
        await message.channel.send("There are no songs to add to a playlist");
    }
};

const createPlaylistEmbed = (name: string, link: string): MessageEmbed =>
    new MessageEmbed()
        .setTitle(name)
        .setURL(link)
        .setDescription("Playlist created successfully");

export default playlist;
