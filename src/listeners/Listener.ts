import {Client, ClientEvents} from "discord.js";

export type Procedure<T extends keyof ClientEvents> = (client: Client) => (...args: ClientEvents[T]) => void

export interface Listener<T extends keyof ClientEvents> {
    name: string;
    event: T;
    procedure: Procedure<T>;
}
