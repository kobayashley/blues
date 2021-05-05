import SpotifyWebApi from "spotify-web-api-node";

let instance: SpotifyWebApi;

const get = (): SpotifyWebApi => instance;
const set = (spotify: SpotifyWebApi): void => {
    instance = spotify;
};

export default {get, set};
