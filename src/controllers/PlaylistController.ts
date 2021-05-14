import {Playlist, Range, SearchResult, Song, Source} from "../Types";
import Log from "../util/Log";
import {PlatformController} from "./platforms/PlatformController";
import {Client, Message, MessageEmbed} from "discord.js";
import {DatabaseAdapter, getDatabaseAdapter} from "../adapters/database/DatabaseAdapter";
import {getSongRange} from "../util/Util";
import {formatISOTime} from "../util/DateUtil";

export default class PlaylistController {
    private static readonly database: DatabaseAdapter = getDatabaseAdapter();
    constructor(private platform: PlatformController) {}

    public async sendPlaylist(client: Client, playlistOptions: PlaylistOptions): Promise<void> {
        const {guild, range, channel, source, requester, force} = playlistOptions;
        try {
            const songs = await PlaylistController.database.getSongsBetween(guild, range.start, range.end);
            const existingPlaylist = await PlaylistController.database.getPlaylist(guild, source, getSongRange(songs), requester);
            if (existingPlaylist && force === false) {
                const {name, link} = existingPlaylist;
                await PlaylistController.sendPlaylistEmbed(name, link, client, guild, channel, "Playlist already existed");
            } else {
                const playlist = await this.createNewPlaylist(songs, source, requester);
                await PlaylistController.database.addPlaylist(guild, playlist);
                const {name, link} = playlist;
                await PlaylistController.sendPlaylistEmbed(name, link, client, guild, channel, "Playlist created successfully");
            }
        } catch (err) {
            Log.error("Problem making the playlist:", err);
            await PlaylistController.sendMessage(client, guild, channel,`Problem making the playlist. It was likely trouble communicating with ${source}`);
        }
    }

    public async createNewPlaylist(songs: Song[], source: Source, requester: string): Promise<Playlist> {
        const name = PlaylistController.createName(songs);
        const playlistLink = await this.platform.createPlaylist(name);
        for (const song of songs) {
            if (song.source === source) {
                await this.platform.addToPlaylist(playlistLink, song.link);
            } else {
                const searchResults = await this.platform.search(song.name);
                const matchingSearchResult = PlaylistController.selectBestSearchResult(song, searchResults);
                if (matchingSearchResult) {
                    await this.platform.addToPlaylist(playlistLink, matchingSearchResult.link);
                }
            }
        }
        const range = getSongRange(songs);
        return {link: playlistLink, name, source, range, requester};
    }

    private static sendPlaylistEmbed(name: string, link: string, client: Client, guild: string, channel: string, description: string): Promise<Message | void> {
        return PlaylistController.sendMessage(client, guild, channel, new MessageEmbed()
            .setTitle(name)
            .setURL(link)
            .setDescription(description));
    }

    private static async sendMessage(client: Client, guild: string, channel: string, message: MessageEmbed | string): Promise<Message | void> {
        const discordServer = await client.guilds.fetch(guild);
        const discordChannel = discordServer.channels.resolve(channel);
        if (discordChannel.isText()) {
            return discordChannel.send(message);
        }
    }

    private static createName(songs: Song[]): string {
        const first = songs[0];
        const last = songs[songs.length - 1];
        const firstDate = formatISOTime(first.time);
        const lastDate = formatISOTime(last.time);
        if (firstDate === lastDate) {
            return firstDate;
        } else {
            return `${firstDate} - ${lastDate}`;
        }
    }

    private static selectBestSearchResult(originalSong: Song, songLinks: SearchResult[]): SearchResult {
        // TODO implement stub
        Log.info(originalSong, songLinks[0]);
        return songLinks[0];
    }
}

export interface PlaylistOptions {
    guild: string;
    range: Range;
    channel: string;
    source: Source;
    requester: string;
    force: boolean;
}
