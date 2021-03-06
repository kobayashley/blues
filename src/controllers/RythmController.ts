import {Message, MessageEmbed} from "discord.js";
import Log from "../util/Log";
import {PruneOption, Song, Source} from "../Types";
import SettingsController from "./SettingsController";
import {getGuild} from "../util/Util";
import {getDatabaseAdapter} from "../adapters/database/DatabaseAdapter";

const NOW_PLAYING_TITLE = "Now Playing 🎵";
const SKIPPED_MESSAGE = "⏩ ***Skipped*** 👍";
const ANNOUNCEMENTS_OFF = "<:x2:814990341052432435> **I will no longer announce new songs**";
const ANNOUNCEMENTS_ON = "✅ **I will now announce new songs**";
const ADDED_TO_QUEUE_AUTHOR = "Added to queue";
const DISCONNECTED_MESSAGE = "📭 **Successfully disconnected**";

const database = getDatabaseAdapter();

const isRythmEvent = async (message: Message): Promise<boolean> => {
    const bot = await SettingsController.getBot(getGuild(message));
    return message.author.bot && message.author.id === bot;
};

const errorHandler = (error: unknown) =>
    Log.error("Error handling event:", error);

const handleEvent = async (message: Message): Promise<void> => {
    if (isNowPlayingAnnouncement(message)) {
        await handleNowPlayingEvent(message);
    } else if (isSongSkippedAnnouncement(message) || isSuccessfullyDisconnectedAnnouncement(message)) {
        await handleSongSkippedEvent(message);
    } else if (isAnnouncementsOnAnnouncement(message)) {
        await message.react("💆‍♀️").catch(errorHandler);
    } else if (isAnnouncementsOffAnnouncement(message)) {
        await message.channel
            .send("⚠ **Turning off announcements will prevent me from saving songs!**")
            .catch(errorHandler);
    } else if (isSongQueuedAnnouncement(message)) {
        await handleSongQueuedEvent(message);
    } else {
        Log.debug(`Unhandled event - ${message.content}`);
    }
};

const handleNowPlayingEvent = async (message: Message): Promise<void> => {
    const song: Song = parseSong(message);
    const guild = getGuild(message);
    await database.addSong(guild, song).catch(errorHandler);
    await handlePruning(message, guild, `**Now Playing** [${song.name}](${song.link})`);
};

const handleSongSkippedEvent = async (message: Message): Promise<void> => {
    const guild = getGuild(message);
    const song = await database.getLatestSong(guild);
    if (song && !songStartedLongAgo(song)) {
        await database.skipSong(guild, song).catch(errorHandler);
    }
};

const handleSongQueuedEvent = async (message: Message): Promise<void> => {
    const embed = message.embeds.find((embed) => embed.author?.name === ADDED_TO_QUEUE_AUTHOR);
    const markdownLink = embed.description.replace(/(^\*\*)|(\*\*$)/g, "");
    const position = embed.fields.find((field) => field.name === "Position in queue")?.value ?? '?';
    const timeLeft = embed.fields.find((field) => field.name === "Estimated time until playing")?.value ?? '?';
    const description = `**Queued** ${markdownLink} at position ${position}. Plays in ${timeLeft}.`;
    await handlePruning(message, getGuild(message), description);
};

const handlePruning = async (message: Message, guild: string, embedDescription: string): Promise<void> => {
    const prune = await SettingsController.getPrune(guild);
    if (prune !== PruneOption.OFF) {
        try {
            Log.info("Deleting Rythm announcement");
            await message.delete();
            if (prune === PruneOption.REPLACE) {
                const embed = new MessageEmbed().setDescription(embedDescription);
                await message.channel.send(embed);
            }
        } catch (err) {
            Log.error("Could not delete Rythm announcement");
            await message.channel.send("Warning: pruning has been enabled, yet Blues lacks the permissions to do so");
        }
    }
};

/**
 * if the song just started in the last few seconds, we count the skip
 * if the song started long ago, we don't count the skip
 *   (because there could have been silence at the end of the video)
 * LongAgo should mean either we've been listening to the song for more than 30 seconds
 *     or we're half way through the song
 * @param song
 */
const songStartedLongAgo = (song: Song): boolean => {
    const now = Date.now();
    const start = song.time ?? now;
    const length = song.length;
    if ((now - start) >= 30000) {
        Log.debug( `${song.name} started over 30 seconds`);
        return true;
    } else if (now > start + (length / 2)) {
        Log.debug(`${song.name} has played over halfway through`);
        return true;
    }
    Log.debug(`${song.name} just started!!`);
    return false;
};

const parseSong = (message: Message): Song => {
    const nowPlayingEmbed = message.embeds.find((embed: MessageEmbed) => embed.title === NOW_PLAYING_TITLE);
    const description = nowPlayingEmbed.description;
    const lines = description.split("\n");

    const {link, name} = parseNameAndLink(lines[0]);
    const length = parseLength(lines[2]);
    const requester = parseRequester(lines[4]);
    const source = parseSource(link);

    return {link, source, name, requester, length, skipped: false};
};

// "[Name of the Song](https://www.youtube.com/watch?v=link)"
const parseNameAndLink = (markdown: string): {name: string, link: string} => {
    Log.debug(`Parsing name and link from: "${markdown}"`);
    const separator = "](";
    const link = markdown.slice(markdown.lastIndexOf(separator) + separator.length, -1);
    const name = markdown.slice(1, markdown.lastIndexOf(separator));
    Log.debug(`found ${name} at ${link}`);
    return {name, link};
};

// "`Length:` 4:20" | "`Length:` 4:20:00"
const parseLength = (markdown: string): number => {
    const time = markdown.replace("`Length:` ", "");
    const timeSegments = time.split(":");
    const seconds = timeSegments[timeSegments.length - 1] ?? "0";
    const minutes = timeSegments[timeSegments.length - 2] ?? "0";
    const hours = timeSegments[timeSegments.length - 3] ?? "0";
    Log.debug(`Hours: "${hours}", Minutes: "${minutes}", Seconds: "${seconds}"`);
    return toMilliseconds(Number(hours), Number(minutes), Number(seconds));
};

const toMilliseconds = (hours: number, minutes: number, seconds: number): number => {
    const hoursMS = hours * 60 * 60 * 1000;
    const minutesMS = minutes * 60 * 1000;
    const secondsMS = seconds * 1000;
    return hoursMS + minutesMS + secondsMS;
};

// "`Requested by:` user#1234" | "`Requested by:` nickname (user#1234)"
const parseRequester = (markdown: string): string => {
    const inputName = markdown.replace("`Requested by:` ", "");
    let name;
    if (!inputName.endsWith(")")) {
        name = inputName;
    } else {
        const parenIndex = inputName.lastIndexOf("(");
        name = inputName.slice(parenIndex + 1, -1);
    }
    Log.debug(`parseRequester name: ${name}`);
    return name;
};

// "https://www.youtube.com/watch?v=link"
const parseSource = (link: string): Source => {
    const sources = Object.values(Source);
    const maybeSource = sources.find((source) =>
        link.includes(source));
    const source = maybeSource ?? Source.UNKNOWN;
    Log.debug(`source: ${source}`);
    return source;
};

const createContentAnnouncementChecker = (content: string): (message: Message) => boolean =>
    (message: Message): boolean => message.content === content;
const isSongSkippedAnnouncement = createContentAnnouncementChecker(SKIPPED_MESSAGE);
const isAnnouncementsOnAnnouncement = createContentAnnouncementChecker(ANNOUNCEMENTS_ON);
const isAnnouncementsOffAnnouncement = createContentAnnouncementChecker(ANNOUNCEMENTS_OFF);
const isSuccessfullyDisconnectedAnnouncement = createContentAnnouncementChecker(DISCONNECTED_MESSAGE);
const isNowPlayingAnnouncement = (message: Message): boolean =>
    !!message.embeds.find((embed: MessageEmbed) => embed.title === NOW_PLAYING_TITLE);
const isSongQueuedAnnouncement = (message: Message): boolean =>
    !!message.embeds.find((embed: MessageEmbed) => embed.author?.name === ADDED_TO_QUEUE_AUTHOR);

export default {isRythmEvent, handleEvent};
