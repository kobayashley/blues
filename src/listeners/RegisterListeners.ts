import {Client, ClientEvents} from "discord.js";
import {Listener} from "./Listener";
import {batchImport} from "../util/Util";

const registerListeners = async (client: Client): Promise<Client> => {
    const importedFiles = await batchImport(`${__dirname}/impl`);
    importedFiles.forEach((importedFile) => {
        const listener: Listener<keyof ClientEvents> = importedFile.default;
        // If both a TS _and_ a JS file are present, one will just overwrite the other
        client.on(listener.event, listener.procedure);
    });
    return client;
};

export {registerListeners};
