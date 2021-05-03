import fs from "fs";
import {MuteOption, PruneOption} from "../Types";

const batchImport = (directory: string): Promise<any[]> => {
    const files = fs.readdirSync(directory)
        .filter((name) => name.match(/\.[tj]s$/));
    const futureImportedFiles = files
        .map((file) => import(`${directory}/${file}`));
    return Promise.all(futureImportedFiles);
};

const isMuteOption = (maybeMuteOption: any): maybeMuteOption is MuteOption =>
    Object.values(MuteOption).includes(maybeMuteOption);

const isPruneOption = (maybePruneOption: any): maybePruneOption is PruneOption =>
    Object.values(PruneOption).includes(maybePruneOption);

export {batchImport, isMuteOption, isPruneOption};
