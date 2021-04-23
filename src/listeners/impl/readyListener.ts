import {Listener} from "../Listener";
import Log from "../../util/Log";

export const readyListener: Listener<"ready"> = () => {
    Log.info("Blues started");
};
