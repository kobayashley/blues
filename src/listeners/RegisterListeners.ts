import {Client, ClientEvents} from "discord.js";
import {Listener, Procedure} from "./Listener";
import {batchImport} from "../util/Util";

const registerListeners = async (client: Client): Promise<Client> => {
    const importedFiles = await batchImport(`${__dirname}/impl`);
    // Use a map to enforce no duplicates
    const eventListeners = new Map(importedFiles.map(toEntry));
    eventListeners.forEach((listener) => {
        client.on(listener.event, listener.procedure(client));
    });
    return client;
};

const toEntry = <T extends keyof ClientEvents>(importedFile): [string, Listener<T>] => {
    const listener: Listener<T> = importedFile;
    // If both a TS _and_ a JS file are present, one will just overwrite the other
    return [listener.name, listener];
};

export {registerListeners};
