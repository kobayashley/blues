import {ConfigKey, getConfig} from "../util/Config";
import {MuteConfig, MuteOption, PruneOption, Setting} from "../Types";
import {getDatabaseAdapter} from "../adapters/database/DatabaseAdapter";
import TimezoneController from "./TimezoneController";

const DEFAULT_PREFIX = String(getConfig(ConfigKey.defaultPrefix));
const ILLEGAL_PREFIXES = ["/", "@", "#"];

const DEFAULT_MUTE = {channel:"", option: MuteOption.OFF};

const DEFAULT_PRUNE = PruneOption.OFF;

const DEFAULT_BOT = String(getConfig(ConfigKey.defaultRythmId));

type Guild = string;
type Cache = Map<Setting, any>
const settingCache = new Map<Guild, Cache>();

const database = getDatabaseAdapter();

const get = <T>(guild: Guild, setting: Setting): T => {
    return settingCache.get(guild)?.get(setting);
};

const set = <T>(guild: Guild, setting: Setting, value: T): void => {
    if (!settingCache.has(guild)) {
        settingCache.set(guild, new Map<Setting, any>());
    }
    settingCache.get(guild).set(setting, value);
};

const assert = (scrutinee: boolean, reason: string) => {
    if (!scrutinee) {
        throw new Error(reason);
    }
};

const getSetting = async <T>(guild: string, setting: Setting, defaultSetting: T): Promise<T> => {
    const maybeSetting = settingCache.get(setting) ?? await database.getSetting(guild, setting);
    set(guild, setting, maybeSetting ?? defaultSetting);
    return get(guild, setting);
};

const setSetting = async <T>(guild: string, setting: Setting, newValue: T): Promise<void> => {
    await database.setSetting(guild, setting, newValue);
    set(guild, setting, newValue);
};

const getPrefix = (guild: string): Promise<string> => getSetting(guild, Setting.PREFIX, DEFAULT_PREFIX);
const setPrefix = (guild: string, newPrefix: string): Promise<void> => {
    assert(newPrefix.length === 1, "Prefix must be of length 1");
    assert(!!newPrefix, "Prefix must not be whitespace");
    assert(!/[a-zA-Z0-9]/.test(newPrefix), "Prefix should not be alphanumeric");
    assert(!ILLEGAL_PREFIXES.includes(newPrefix), `"${newPrefix}" is not a legal prefix`);
    return setSetting(guild, Setting.PREFIX, newPrefix);
};

const getMute = (guild: string): Promise<MuteConfig> => getSetting(guild, Setting.MUTE, DEFAULT_MUTE);
const setMute = (guild: string, newOption: MuteConfig): Promise<void> => setSetting(guild, Setting.MUTE, newOption);

const getPrune = (guild: string): Promise<string> => getSetting(guild, Setting.PRUNE, DEFAULT_PRUNE);
const setPrune = (guild: string, prune: PruneOption): Promise<void> => setSetting(guild, Setting.PRUNE, prune);

const getBot = (guild: string): Promise<string> => getSetting(guild, Setting.BOT, DEFAULT_BOT);
const setBot = (guild: string, bot: string): Promise<void> => setSetting(guild, Setting.BOT, bot);

const getTimezone = async (guild: string, user: string): Promise<string> => {
    return await TimezoneController.getTimezone(user) ??
        await TimezoneController.getTimezone(guild) ??
        TimezoneController.defaultTimezone;
};
const setTimezone = (guild: string, user: string | null, timezone: string): Promise<void> => {
    const id = user ?? guild;
    return TimezoneController.setTimezone(id, timezone);
};

const clearTimezone = (guild: string, user: string): Promise<void> => {
    const id = user ?? guild;
    return TimezoneController.clearTimezone(id);
};

export default {
    setPrefix,
    getPrefix,
    setMute,
    getMute,
    getPrune,
    setPrune,
    getBot,
    setBot,
    getTimezone,
    setTimezone,
    clearTimezone,
};
