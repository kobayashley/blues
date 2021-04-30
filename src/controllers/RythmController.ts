import {Message, MessageEmbed} from "discord.js";
import {ConfigKey, getConfig} from "../util/Config";
import Log from "../util/Log";
import {NeDBAdapter} from "../adapters/database/NeDBAdapter";
import {Song, Source} from "../Types";

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
        if (!songStartedLongAgo(song)) {
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
    // TODO implement stub
    return true;
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
    // TODO implement stub
    return {name: "sameolemeek_", link: "https://www.youtube.com/watch?v=rKUJG5TdAl8"};
};

// "`Length:` 4:20" | "`Length:` 4:20:00"
const parseLength = (markdown: string): number => {
    Log.info(markdown);
    // TODO implement stub
    return 0;
};

// "`Requested by:` user#1234" | "`Requested by:` nickname (user#1234)"
const parseRequester = (markdown: string): string => {
    // TODO implement stub
    return "braxtonhall";
};

// "https://www.youtube.com/watch?v=link"
const parseSource = (link: string): Source => {
    // TODO implement stub
    return Source.YOUTUBE;
};

const createContentAnnouncementChecker = (content: string): (message: Message) => boolean =>
    (message: Message): boolean => message.content === content;
const isSongSkippedAnnouncement = createContentAnnouncementChecker(SKIPPED_MESSAGE);
const isAnnouncementsOnAnnouncement = createContentAnnouncementChecker(ANNOUNCEMENTS_ON);
const isAnnouncementsOffAnnouncement = createContentAnnouncementChecker(ANNOUNCEMENTS_OFF);
const isNowPlayingAnnouncement = (message: Message): boolean =>
    !!message.embeds.find((embed: MessageEmbed) => embed.title === NOW_PLAYING_TITLE);

export default {isRythmEvent, handleEvent};
