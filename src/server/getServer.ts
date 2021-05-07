import express from "express";
import exphbs from "express-handlebars";
import {Express} from "express-serve-static-core";
import * as helpers from "./HandlebarsHelpers";

const getServer = (): Express => {
    const server = express();
    server.engine("hbs", exphbs({helpers, extname: ".hbs"}));
    server.set('view engine', 'hbs');
    return server;
};

export {getServer};
