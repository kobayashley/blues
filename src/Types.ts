export enum Source {
    YOUTUBE = "youtube",
    SOUNDCLOUD = "soundcloud",
    TWITCH = "twitch",
    VIMEO = "vimeo",
    BANDCAMP = "bandcamp",
    SPOTIFY = "spotify",
    UNKNOWN = "unknown",
}

export interface Song {
    link: string;
    source: Source; // this is redundant. may wish to remove
    name: string;
    requester: string;
    length: number; // approximate length in ms
    skipped: boolean;
    time?: number; // time it was played
}

export interface Playlist {
    name: string;
    link: string;
}

export interface SearchResult {
    name: string; // sometimes artistName - songName
    link: string;
    length: number;
}

export enum Setting {
    PREFIX = "prefix",
    MUTE = "mute",
    WARNING_CHANNEL = "warningChannel",
}

export interface UserConfig<T> {
    setting: Setting;
    value: T;
}

export enum MuteOption {
    ON = "on",
    OFF = "off",
    WARN = "warn",
}
