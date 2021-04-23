import {Message} from "discord.js";

export interface Command {
    name: string;
    description: string;
    usage: string;
    procedure: (message: Message, args) => void;
}

export type Argument = string | boolean | number
export type Arguments = {[key: string]: Argument | Argument[]};
