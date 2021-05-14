import {CommandBinder} from "../Command";
import {Client, Message, MessageEmbed} from "discord.js";
import {PlaylistOptions} from "../../controllers/PlaylistController";
import {determineRange, getDayStartFromTime, getNow} from "../../util/DateUtil";
import {getGuild, isSource} from "../../util/Util";
import {getDatabaseAdapter} from "../../adapters/database/DatabaseAdapter";
import {Song, Source} from "../../Types";
import {getAuthURL} from "../../services/Authorization";
import {Range} from "../../Types";

const database = getDatabaseAdapter();

const FORCE_FLAG = "force";

const playlist: CommandBinder = (client: Client) => ({
    name: "playlist",
    description: "Creates a playlist from music played by Rythm",
    usage: `playlist <source = ${Source.YOUTUBE} | ${Source.SPOTIFY}>? (<year> <month> <day> | (<startMessage> <endMessage>?))? <force = force>?`,
    procedure: async (message: Message, starterArgs: string[]) => {
        const now = getNow();
        const dayStart = getDayStartFromTime(now);
        try {
            const {source, args, force} = parseArgs(starterArgs);
            if (!isSupportedSource(source)) {
                return message.channel.send(`${source} is not supported`);
            }
            const defaultRange = {start: dayStart, end: now};
            const requestRange = await determineRange(client, message, args, defaultRange);
            const songs = await database.getSongsBetween(getGuild(message), requestRange.start, requestRange.end);
            if (songs.length > 0) {
                await sendAuthLink(source, message, songs, requestRange, force);
            } else {
                throw new Error("There are no songs to add to a playlist");
            }
        } catch (err) {
            return message.channel.send(`Failed to create this playlist! ${err.message}`);
        }
    },
});

const parseArgs = (args: string[]): {source: Source, args: string[], force: boolean} => {
    let source;
    let force;
    if (isSource(args[0])) {
        source = args[0];
        args = args.slice(1);
    } else {
        source = Source.YOUTUBE;
    }
    if (args[args.length - 1] === FORCE_FLAG) {
        force = true;
        args.pop();
    } else {
        force = false;
    }
    return {source, force, args};
};

const isSupportedSource = (source: Source): boolean =>
    source === Source.YOUTUBE || source === Source.SPOTIFY;

const sendAuthLink = async (source: Source, message: Message, songs: Song[], range: Range, force: boolean): Promise<void> => {
    const options: PlaylistOptions = {
        channel: message.channel.id,
        guild: message.guild.id,
        requester: message.author.tag,
        force,
        range,
        source,
    };
    const authorizeUrl = await getAuthURL(options);
    const embed = new MessageEmbed()
        .setTitle(`Click here to login to ${source}`)
        .setURL(authorizeUrl);
    const authLinkMessage = await message.channel.send(embed);
    setTimeout(() => authLinkMessage.delete(), 60000);
};

export default playlist;
