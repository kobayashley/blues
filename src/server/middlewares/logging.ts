import {Request, Response, NextFunction} from "express-serve-static-core";
import Log from "../../util/Log";

const logging = (req: Request, res: Response, next: NextFunction): void => {
    const start: number = Date.now();
    res.on("finish", () => {
        const tookMs = Date.now() - start;
        Log.info(res.statusCode, req.path, req.method, ':', `${tookMs}ms`);
    });
    next();
};

export {logging};
