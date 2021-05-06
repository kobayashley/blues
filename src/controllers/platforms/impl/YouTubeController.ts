import {google, youtube_v3} from "googleapis";
import {SearchResult} from "../../../Types";
import Log from "../../../util/Log";
import moment from "moment";
import {OAuth2Client} from "google-auth-library";
import {PlatformController} from "../PlatformController";

class YouTubeController implements PlatformController {
    private static readonly VIDEO_LINK_REPLACEMENT = "https://www.youtube.com/watch?v=";
    private static readonly PLAYLIST_LINK_REPLACEMENT = "https://youtube.com/playlist?list=";

    private static readonly youtube = google.youtube("v3");

    constructor(private auth: OAuth2Client) {}

    public async search(query: string): Promise<SearchResult[]> {
        Log.debug("YouTubeAdapter::search(..) - Begin");
        const search = await YouTubeController.youtube.search.list({
            auth: this.auth,
            part: ["id"],
            type: ["video"],
            q: query,
        });
        const results = search?.data?.items ?? [];
        const ids = results.map((item: youtube_v3.Schema$SearchResult): string => item.id.videoId);
        const videoList = await YouTubeController.youtube.videos.list({
            auth: this.auth,
            id: ids,
            part: ["contentDetails", "snippet"],
        });
        const videos = videoList?.data?.items ?? [];
        Log.info(`YouTubeAdapter::search found ${videos.length} results for "${query}"`);
        return videos.map((video: youtube_v3.Schema$Video): SearchResult => {
            const {snippet, contentDetails} = video;
            const link = `https://www.youtube.com/watch?v=${video.id}`;
            const name = snippet.title;
            const length = moment.duration(contentDetails.duration).asMilliseconds();
            return {link, name, length};
        });
    }

    public async createPlaylist(name: string): Promise<string> {
        const response = await YouTubeController.youtube.playlists.insert({
            auth: this.auth,
            part: [
                "snippet",
                "status"
            ],
            requestBody: {
                snippet: {
                    title: name,
                    description: "Created by Blues Bot for Discord",
                },
                status: {
                    privacyStatus: "unlisted"
                }
            }
        });
        return `${YouTubeController.PLAYLIST_LINK_REPLACEMENT}${response.data.id}`;
    }

    public async addToPlaylist(playlistLink: string, songLink: string): Promise<void> {
        await YouTubeController.youtube.playlistItems.insert({
            auth: this.auth,
            part: [
                "snippet"
            ],
            requestBody: {
                snippet: {
                    playlistId: playlistLink.replace(YouTubeController.PLAYLIST_LINK_REPLACEMENT, ""),
                    resourceId: {
                        kind: "youtube#video",
                        videoId: songLink.replace(YouTubeController.VIDEO_LINK_REPLACEMENT, ""),
                    }
                }
            }
        });
    }
}

export {YouTubeController};
