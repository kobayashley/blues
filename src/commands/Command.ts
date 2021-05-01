import {Client, Message} from "discord.js";

export type CommandBinder = (client: Client) => Command;

export interface Command {
    name: string;
    description: string;
    usage: string;
    procedure: (message: Message, args: string[]) => void;
}
