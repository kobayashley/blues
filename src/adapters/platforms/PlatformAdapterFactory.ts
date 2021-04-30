import {Source} from "../../Types";
import {PlatformAdapter} from "./PlatformAdapter";
import YouTubeAdapter from "./impl/YouTubeAdapter";

export const getPlatformAdapter = (platformSource: Source): PlatformAdapter => {
    const adapter = {
        [Source.YOUTUBE]: YouTubeAdapter,
    }[platformSource];
    if (!adapter) {
        throw new Error("Unsupported Platform source");
    } else {
        return adapter;
    }
};
