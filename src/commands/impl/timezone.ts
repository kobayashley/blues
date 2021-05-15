import {CommandBinder} from "../Command";
import {Message} from "discord.js";
import {searchTimezone} from "../../util/DateUtil";
import {getGuild} from "../../util/Util";
import SettingsController from "../../controllers/SettingsController";
import {TimezoneOption} from "../../Types";
import Log from "../../util/Log";

const MAX_SEARCH_RESULTS = 300;

const timezone: CommandBinder = () => ({
    name: "timezone",
    description: "Sets the timezone to be used in playlist creation",
    usage: "timezone <server = server>? (<clear = clear> | <timezone>)",
    procedure: async (message: Message, args: string[]) => {
        const {query, clear, forGuild} = parseArgs(args);
        const guild = getGuild(message);
        const user = forGuild ? null : message.author.id;
        const kind = forGuild ? "Server" : "User";
        let reply;
        if (query && clear) {
            Log.info("Too many arguments to adjust timezones for", kind);
            reply = "Only one of query or clear arguments should be used.";
        } else if (query) {
            Log.info("Searching for timezones to update", kind);
            const searchResults = searchTimezone(query);
            if (searchResults.length === 0) {
                reply = `There were no timezones matching \`${query}\`. Please try another.`;
            } else if (searchResults.length === 1) {
                const [selectedTimezone] = searchResults;
                await SettingsController.setTimezone(guild, user, selectedTimezone);
                reply = `${kind} timezone set to \`${selectedTimezone}\`.`;
            } else if (searchResults.length > MAX_SEARCH_RESULTS) {
                reply = "Too many timezones matched that query. Please be more specific.";
            } else {
                reply = "**Please select one of the following timezones:**\n" +
                    searchResults.join("\n");
            }
        } else if (clear) {
            Log.info("Removing any saved timezone for", kind);
            await SettingsController.clearTimezone(guild, user);
            reply = `${kind} timezone has been reset.`;
        } else {
            reply = "Query or clear argument required";
        }
        return message.channel.send(reply);
    },
});

const parseArgs = (args: string[]) => {
    let currentArgs = args;
    let forGuild = false;
    let clear = false;
    if (currentArgs[0] === TimezoneOption.SERVER) {
        forGuild = true;
        currentArgs = currentArgs.slice(1);
    }
    if (currentArgs[0] === TimezoneOption.CLEAR) {
        clear = true;
        currentArgs = currentArgs.slice(1);
    }
    const query = currentArgs.join(" ");
    return {forGuild, clear, query};
};

export default timezone;
