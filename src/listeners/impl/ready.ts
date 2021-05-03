import {Listener} from "../Listener";
import Log from "../../util/Log";

const ready: Listener<"ready"> = {
    event: "ready",
    procedure: () => () => {
        Log.info("Blues started");
    },
};

module.exports = ready;
