import {ConfigKey, getConfig} from "../util/Config";
import {NeDBAdapter} from "../adapters/NeDBAdapter";

const DEFAULT_PREFIX = String(getConfig(ConfigKey.defaultPrefix));
const ILLEGAL_PREFIXES = ["/", "@"];

let prefixCache;

const assert = (scrutinee: boolean, reason: string) => {
    if (!scrutinee) {
        throw new Error(reason);
    }
};

const updatePrefix = async (newPrefix: string): Promise<void> => {
    assert(newPrefix.length === 1, "Prefix must be of length 1");
    assert(!!newPrefix, "Prefix must not be whitespace");
    assert(!/[a-zA-Z0-9]/.test(newPrefix), "Prefix should not be alphanumeric");
    assert(!ILLEGAL_PREFIXES.includes(newPrefix), `"${newPrefix}" is not a legal prefix`);
    await NeDBAdapter.setPrefix(newPrefix);
    prefixCache = newPrefix;
};

const getPrefix = async (): Promise<string> => {
    const maybePrefix = prefixCache ?? await NeDBAdapter.getPrefix();
    prefixCache = maybePrefix ?? DEFAULT_PREFIX;
    return prefixCache;
};

export default {updatePrefix, getPrefix};
