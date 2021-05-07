import express from "express";
import {Express} from "express-serve-static-core";
import {headers} from "./headers";
import {logging} from "./logging";

const registerMiddlewares = (app: Express): Express => {
    app.use(headers);
    app.use(logging);
    app.use("/public", express.static('public'));
    return app;
};

export {registerMiddlewares};
