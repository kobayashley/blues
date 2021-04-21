import {ConfigKey, getConfig} from "./util/Config"; // Unfortunately must be the first import
import {Client} from "discord.js";
import {registerListeners} from "./listeners/RegisterListeners";

const client = new Client();
const registeredClient = registerListeners(client);
const botToken = String(getConfig(ConfigKey.botToken));
// this promise resolves with token of the account used?
// see: https://discord.js.org/#/docs/main/master/class/Client?scrollTo=login
registeredClient.login(botToken);
