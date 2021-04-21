import {Client} from "discord.js";
import {readyListener} from "./impl/readyListener";
import {messageListener} from "./impl/messageListener";

const registerListeners = (client: Client): Client => {
    client.on("ready", readyListener);
    client.on("message", messageListener);
    return client;
};

export {registerListeners};
