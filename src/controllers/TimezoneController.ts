import {getCurrentTimezone} from "../util/DateUtil";
import {getDatabaseAdapter} from "../adapters/database/DatabaseAdapter";


type UserID = string;
type Timezone = string;
type GuildID = string;

const timezoneCache = new Map<UserID | GuildID, Timezone>();
const database = getDatabaseAdapter();

const defaultTimezone = getCurrentTimezone();

const getTimezone = async (id: string): Promise<string> => {
    const maybeTimezone = timezoneCache.get(id) ?? await database.getTimezone(id);
    timezoneCache.set(id, maybeTimezone ?? null);
    return timezoneCache.get(id);
};

const setTimezone = async (id: string, timezone: Timezone): Promise<void> => {
    await database.setTimezone(id, timezone);
    timezoneCache.set(id, timezone);
};

const clearTimezone = async (id: string): Promise<void> => {
    await database.clearTimezone(id);
    timezoneCache.set(id, null);
};

export default {getTimezone, setTimezone, clearTimezone, defaultTimezone};
