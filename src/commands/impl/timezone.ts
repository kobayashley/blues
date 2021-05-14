import {CommandBinder} from "../Command";
import {Message} from "discord.js";
import {searchTimezone} from "../../util/DateUtil";
import {getGuild} from "../../util/Util";
import SettingsController from "../../controllers/SettingsController";
import {TimezoneOption} from "../../Types";

const MAX_SEARCH_RESULTS = 300;

const timezone: CommandBinder = () => ({
    name: "timezone",
    description: "Searches for the moment timezone string",
    usage: "timezone <server>? <timezone>",
    procedure: async (message: Message, args: string[]) => {
        const {query, forGuild} = parseArgs(args);
        const guild = getGuild(message);
        const user = forGuild ? null : message.author.id;
        let reply;
        if (query) {
            const searchResults = searchTimezone(query);
            if (searchResults.length === 0) {
                reply = `There were no timezones matching \`${query}\`. Please try another.`;
            } else if (searchResults.length === 1) {
                const [selectedTimezone] = searchResults;
                await SettingsController.setTimezone(guild, user, selectedTimezone);
                reply = `Timezone set to \`${selectedTimezone}\`.`;
            } else if (searchResults.length > MAX_SEARCH_RESULTS) {
                reply = "Too many timezones matched that query. Please be more specific.";
            } else {
                reply = "**Please select one of the following timezones:**\n" +
                    searchResults.slice(-MAX_SEARCH_RESULTS).join("\n");
            }
        } else {
            reply = "Query required";
        }
        return message.channel.send(reply);
    },
});

const parseArgs = (args) => {
    if (args[0]?.toLowerCase() === TimezoneOption.SERVER) {
        return {query: args[1], forGuild: true};
    } else {
        return {query: args[0], forGuild: false};
    }
};

export default timezone;
