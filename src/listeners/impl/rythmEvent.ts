import {Listener} from "../Listener";
import Log from "../../util/Log";
import {Message} from "discord.js";
import RythmController from "../../controllers/RythmController";

const rythmEvent: Listener<"message"> = {
    name: "rythmEvent",
    event: "message",
    procedure: () => async (message: Message) => {
        if (await RythmController.isRythmEvent(message)) {
            Log.debug("Announcement from Rythm detected");
            return RythmController.handleEvent(message);
        }
    },
};

module.exports = rythmEvent;
