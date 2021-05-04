import {PlatformAdapter} from "../PlatformAdapter";
import {SearchResult} from "../../../Types";
import {google, youtube_v3} from "googleapis";
import Log from "../../../util/Log";
import moment from "moment";

const youtube = google.youtube("v3");

const search = async (query: string): Promise<SearchResult[]> => {
    Log.debug("YouTubeAdapter::search(..) - Begin");
    const search = await youtube.search.list({
        part: ["id"],
        type: ["video"],
        q: query,
    });
    const results = search?.data?.items ?? [];
    const ids = results.map((item: youtube_v3.Schema$SearchResult): string => item.id.videoId);
    const videoList = await youtube.videos.list({
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
};

const createPlaylist = async (name: string): Promise<string> => {
    const response = await youtube.playlists.insert({
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
    return `https://youtube.com/playlist?list=${response.data.id}`;
};

const addToPlaylist = async (playlistLink: string, songLink: string): Promise<void> => {
    await youtube.playlistItems.insert({
        part: [
            "snippet"
        ],
        requestBody: {
            snippet: {
                playlistId: playlistLink.replace("https://youtube.com/playlist?list=", ""),
                resourceId: {
                    kind: "youtube#video",
                    videoId: songLink.replace("https://www.youtube.com/watch?v=", ""),
                }
            }
        }
    });
};

const YouTubeAdapter: PlatformAdapter = {
    addToPlaylist,
    createPlaylist,
    search,
};

export default YouTubeAdapter;
