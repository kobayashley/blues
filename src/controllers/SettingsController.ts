import {ConfigKey, getConfig} from "../util/Config";
import {NeDBAdapter} from "../adapters/database/NeDBAdapter";
import {MuteConfig, MuteOption, PruneOption, Setting} from "../Types";
import {isMuteConfig, isPruneOption} from "../util/Util";

const DEFAULT_PREFIX = String(getConfig(ConfigKey.defaultPrefix));
const ILLEGAL_PREFIXES = ["/", "@", "#"];

const DEFAULT_MUTE = {channel:"", option: MuteOption.OFF};

const DEFAULT_PRUNE = PruneOption.OFF;

const settingCache = new Map<Setting, any>();

const assert = (scrutinee: boolean, reason: string) => {
    if (!scrutinee) {
        throw new Error(reason);
    }
};

const getSetting = async <T>(setting: Setting, defaultSetting: T): Promise<T> => {
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

const getMute = (): Promise<MuteConfig> => getSetting(Setting.MUTE, DEFAULT_MUTE);
const setMute = (newOption: MuteConfig): Promise<void> => {
    assert(isMuteConfig(newOption), `Mute must be set to '${MuteOption.ON}', '${MuteOption.OFF}', or '${MuteOption.WARN}'`);
    return setSetting(Setting.MUTE, newOption);
};

const getPrune = (): Promise<string> => getSetting(Setting.PRUNE, DEFAULT_PRUNE);
const setPrune = (prune: string): Promise<void> => {
    assert(isPruneOption(prune), `Prune must be set to '${PruneOption.ON}' or '${PruneOption.OFF}'`);
    return setSetting(Setting.PRUNE, prune);
};

export default {
    setPrefix,
    getPrefix,
    setMute,
    getMute,
    getPrune,
    setPrune,
};
