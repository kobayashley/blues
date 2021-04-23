interface DatabaseAdapter {
    // prefix
    getPrefix(): string;
    setPrefix(prefix: string): void;

    // songs
    addSong(song: Song): void;
    skipLatestSong(): void;
    getSongsBetween(from: number, until: number): Song[];
}
