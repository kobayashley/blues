import {Source} from "../../Types";
import {PlatformAdapter} from "./PlatformAdapter";
import YouTubeAdapter from "./impl/YouTubeAdapter";
import SpotifyAdapter from "./impl/SpotifyAdapter";

export const getPlatformAdapter = (platformSource: Source): PlatformAdapter => {
    const adapter = {
        [Source.YOUTUBE]: YouTubeAdapter,
        [Source.SPOTIFY]: SpotifyAdapter,
    }[platformSource];
    if (!adapter) {
        throw new Error("Unsupported Platform source");
    } else {
        return adapter;
    }
};
