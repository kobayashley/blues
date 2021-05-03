import {ConfigKey, getConfig} from "../util/Config";
import {NeDBAdapter} from "../adapters/database/NeDBAdapter";
import {MuteOption, PruneOption, Setting} from "../Types";
import {isMuteOption, isPruneOption} from "../util/Util";

const DEFAULT_PREFIX = String(getConfig(ConfigKey.defaultPrefix));
const ILLEGAL_PREFIXES = ["/", "@", "#"];

const DEFAULT_MUTE = MuteOption.OFF;

const settingCache = new Map<Setting, any>();

const assert = (scrutinee: boolean, reason: string) => {
    if (!scrutinee) {
        throw new Error(reason);
    }
};

const getSetting = async <T>(setting: Setting, defaultSetting: T): Promise<string> => {
    const maybeSetting = settingCache.get(setting) ?? await NeDBAdapter.getSetting(setting);
    settingCache.set(setting, maybeSetting ?? defaultSetting);
    return settingCache.get(setting);
};

const setSetting = async <T>(setting: Setting, newValue: T): Promise<void> => {
    await NeDBAdapter.setSetting(setting, newValue);
    settingCache.set(setting, newValue);
};

const getPrefix = (): Promise<string> => getSetting(Setting.PREFIX, DEFAULT_PREFIX);
const setPrefix = (newPrefix: string): Promise<void> => {
    assert(newPrefix.length === 1, "Prefix must be of length 1");
    assert(!!newPrefix, "Prefix must not be whitespace");
    assert(!/[a-zA-Z0-9]/.test(newPrefix), "Prefix should not be alphanumeric");
    assert(!ILLEGAL_PREFIXES.includes(newPrefix), `"${newPrefix}" is not a legal prefix`);
    return setSetting(Setting.PREFIX, newPrefix);
};

const getMute = (): Promise<string> => getSetting(Setting.MUTE, DEFAULT_MUTE);
const setMute = (newOption: string): Promise<void> => {
    assert(isMuteOption(newOption), "Mute must be set to 'on', 'off', or 'warn'");
    return setSetting(Setting.MUTE, newOption);
};

const getWarningChannel = (): Promise<string> => getSetting(Setting.WARNING_CHANNEL, "");
const setWarningChannel = (channel: string): Promise<void> => setSetting(Setting.WARNING_CHANNEL, channel);

const getPrune = (): Promise<string> => getSetting(Setting.PRUNE, PruneOption.OFF);
const setPrune = (prune: string): Promise<void> => {
    assert(isPruneOption(prune), "Prune must be set to 'on' or 'off'");
    return setSetting(Setting.PRUNE, prune);
};

export default {
    setPrefix,
    getPrefix,
    setMute,
    getMute,
    setWarningChannel,
    getWarningChannel,
    getPrune,
    setPrune,
};
