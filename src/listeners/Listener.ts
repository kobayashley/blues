import {ClientEvents} from "discord.js";

export interface Listener<T extends keyof ClientEvents> {
    event: T;
    procedure: (...args: ClientEvents[T]) => void;
}
