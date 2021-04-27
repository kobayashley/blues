import {Client, ClientEvents} from "discord.js";
import {Listener, Procedure} from "./Listener";
import {batchImport} from "../util/Util";

const registerListeners = async (client: Client): Promise<Client> => {
    const importedFiles = await batchImport(`${__dirname}/impl`);
    // Use a map to enforce no duplicates
    const eventListeners = new Map(importedFiles.map(toEntry));
    eventListeners.forEach((procedure, event) => {
        client.on(event, procedure(client));
    });
    return client;
};

const toEntry = <T extends keyof ClientEvents>(importedFile): [T, Procedure<T>] => {
    const listener: Listener<T> = importedFile;
    // If both a TS _and_ a JS file are present, one will just overwrite the other
    return [listener.event, listener.procedure];
};

export {registerListeners};
