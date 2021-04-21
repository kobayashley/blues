import {Listener} from "../Listener";
import Log from "../../util/Log";
import {Message} from "discord.js";

export const messageListener: Listener<"message"> = (message: Message) => {
    Log.info(`Got the message: ${message.content}`);
    // assert that the message is from Rythm
    // assert that this is an announcement
    // add the song to the db
};
