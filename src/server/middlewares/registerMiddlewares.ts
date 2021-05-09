import express from "express";
import {Express} from "express-serve-static-core";
import {headers} from "./headers";
import {logging} from "./logging";
import {ConfigKey, getConfig} from "../../util/Config";

const prefix = getConfig(ConfigKey.pathPrefix);

const registerMiddlewares = (app: Express): Express => {
    app.use(headers);
    app.use(logging);
    app.use(prefix + "/public", express.static('public'));
    return app;
};

export {registerMiddlewares};
