import {Message, MessageEmbed} from "discord.js";
import {ConfigKey, getConfig} from "../util/Config";
import Log from "../util/Log";
import {NeDBAdapter} from "../adapters/database/NeDBAdapter";
import {Song, Source} from "../Types";
import marked from "marked";

const NOW_PLAYING_TITLE = "Now Playing 🎵";
const SKIPPED_MESSAGE = "⏩ ***Skipped*** 👍";
const ANNOUNCEMENTS_OFF = "<:x2:814990341052432435> **I will no longer announce new songs**";
const ANNOUNCEMENTS_ON = "✅ **I will now announce new songs**";
const BOT_ID = getConfig(ConfigKey.rythmId);

const isRythmEvent = (message: Message): boolean => {
    return message.author.bot && message.author.id === BOT_ID;
};

const errorHandler = (error: unknown) =>
    Log.error("Error handling event:", error);

const handleEvent = async (message: Message): Promise<void> => {
    if (isNowPlayingAnnouncement(message)) {
        const song: Song = parseSong(message);
        await NeDBAdapter.addSong(song).catch(errorHandler);
    } else if (isSongSkippedAnnouncement(message)) {
        const song = await NeDBAdapter.getLatestSong();
        if (song && !songStartedLongAgo(song)) {
            await NeDBAdapter.skipSong(song).catch(errorHandler);
        }
    } else if (isAnnouncementsOnAnnouncement(message)) {
        await message.react("💆‍♀️").catch(errorHandler);
    } else if (isAnnouncementsOffAnnouncement(message)) {
        await message.channel
            .send("⚠ **Turning off announcements will prevent me from saving songs!**")
            .catch(errorHandler);
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
    } else if (now > start + (length/2)) {
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
    const tokens = marked.lexer(markdown);
    const paragraph: any = tokens[0];
    const link = paragraph.tokens[0].href;
    const name = paragraph.tokens[0].text;
    Log.debug(`found ${name} at ${link}`);
    return {name, link};
};

// "`Length:` 4:20" | "`Length:` 4:20:00"
const parseLength = (markdown: string): number => {
    Log.info(markdown);
    const time = markdown.replace("`Length:` ", "");
    const timeSegments = time.split(":");
    const seconds = timeSegments[timeSegments.length - 1] ?? "0";
    const minutes = timeSegments[timeSegments.length - 2] ?? "0";
    const hours = timeSegments[timeSegments.length - 3] ?? "0";
    Log.debug(`hours: "${hours}", minutes: "${minutes}", seconds: "${seconds}"`);
    return toMilliseconds(Number(hours), Number(minutes), Number(seconds));
};

const toMilliseconds = (hours: number, minutes: number, seconds: number): number => {
    const hoursMS = hours*60*60*1000;
    const minutesMS = minutes*60*1000;
    const secondsMS = seconds*1000;
    return hoursMS + minutesMS + secondsMS;
};

// "`Requested by:` user#1234" | "`Requested by:` nickname (us (er#1234)"
const parseRequester = (markdown: string): string => {
    const inputName = markdown.replace("`Requested by:` ", "");
    let name;
    if (!inputName.endsWith(")")) {
        name = inputName;
    } else {
        const parenIndex = inputName.lastIndexOf("(");
        name = inputName.slice(parenIndex+1, -1);
    }
    Log.debug(`pareRequester name: ${name}`);
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
const isNowPlayingAnnouncement = (message: Message): boolean =>
    !!message.embeds.find((embed: MessageEmbed) => embed.title === NOW_PLAYING_TITLE);

export default {isRythmEvent, handleEvent};
