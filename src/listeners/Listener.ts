import {ClientEvents} from "discord.js";

export type Listener<T extends keyof ClientEvents> = (...args: ClientEvents[T]) => void;
