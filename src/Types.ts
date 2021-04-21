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
