import {Message} from "discord.js";

export interface Command {
    name: string;
    description: string;
    usage: string;
    procedure: (message: Message, args: string[]) => void;
}
