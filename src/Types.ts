enum Source {
    YOUTUBE,
    SOUNDCLOUD,
    TWITCH,
    VIMEO,
    BANDCAMP,
    SPOTIFY, // for completeness. shouldn't appear in any songs
}

interface Song {
    link: string; // primary key
    source: Source; // this is redundant. may wish to remove
    name: string;
    skipped: string;
}
