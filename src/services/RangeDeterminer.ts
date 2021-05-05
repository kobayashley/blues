import {Client, Message} from "discord.js";
import moment from "moment";
import Log from "../util/Log";
import {Range} from "../Types";

const DISCORD_PREFIX = "https://discord.com/channels/";

const determineRange = async (client: Client, message: Message, args: string[], defaultRange: Range): Promise<Range> => {
    try {
        const futureStart = determineStart(client, message, args, defaultRange.start);
        const futureEnd = determineEnd(client, message, args, defaultRange.end);
        const [start, end] = await Promise.all([futureStart, futureEnd]);
        return {start, end};
    } catch (err) {
        Log.error("Error determining range:", err);
        throw new Error("I could not get the time range right. Do I have permission to view messages?");
    }
};

const determineStart = async (client:Client, message: Message, args: string[], defaultStart: number): Promise<number> => {
    if (message.reference) {
        // if it's a reply --> use that time
        Log.debug("Determining start based on a reference");
        const {guildID, channelID, messageID} = message.reference;
        return getMessageTimestampFromIDs(client, guildID, channelID, messageID);
    } else if (args[0]?.startsWith(DISCORD_PREFIX)) {
        // if it contains a discord link --> use that time
        Log.debug("Determining start based on a link");
        return getMessageTimestampFromLink(client, args[0]);
    } else {
        // join the remainder of arguments and try moment on them
        Log.debug("Determining start based on date string");
        return getTimeFromDateString(args.join(" "), "start") ?? defaultStart;
    }
};

const determineEnd = async (client: Client, message: Message, args: string[], defaultEnd: number): Promise<number> => {
    if (message.reference && args[0]?.startsWith(DISCORD_PREFIX)) {
        // if it's a reply && contains discord link --> use discord link
        Log.debug("Determining end based on first link");
        return getMessageTimestampFromLink(client, args[0]);
    } else if (args[0]?.startsWith(DISCORD_PREFIX) && args[1]?.startsWith(DISCORD_PREFIX)) {
        // if contains two discord links --> use second discord link
        Log.debug("Determining end based on second link");
        return getMessageTimestampFromLink(client, args[1]);
    } else {
        // join the remainder of arguments and try moment on them
        Log.debug("Determining end based on date string");
        return getTimeFromDateString(args.join(" "), "end") ?? defaultEnd;
    }
};

const getTimeFromDateString = (dateString: string, when: "start" | "end"): number => {
    try {
        const date = moment(dateString, "YYYY MM DD");
        if (date.isValid()) {
            // success --> moment end of day
            return date[`${when}Of`]("day").valueOf();
        }
    } catch (err) {
        Log.error("Error caught parsing date with moment", err);
    }
    return null;
};

const getMessageTimestampFromLink = (client: Client, link: string): Promise<number> => {
    const discordPath = link.replace(DISCORD_PREFIX, "");
    const [guild, channel, message] = discordPath.split("/");
    return getMessageTimestampFromIDs(client, guild, channel, message);
};

const getMessageTimestampFromIDs = async (client: Client, guildId: string, channelId: string, messageId: string): Promise<number> => {
    try {
        Log.debug("Guild", guildId, "channel", channelId, "message", messageId);
        const guild = await client.guilds.fetch(guildId);
        const channel = guild.channels.resolve(channelId);
        if (channel.isText()) {
            const message = await channel.messages.fetch(messageId);
            return message.createdTimestamp;
        }
    } catch (err) {
        Log.error("Could not get timestamp from discord message IDs", err);
        throw new Error("Could not get end time from linked Messages");
    }
};

export default {determineRange};
