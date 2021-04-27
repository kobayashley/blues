import {Listener} from "../Listener";
import Log from "../../util/Log";

const readyListener: Listener<"ready"> = {
    event: "ready",
    procedure:() => {
        Log.info("Blues started");
    },
};

module.exports = readyListener;
