import fs from "fs";
import {MuteOption} from "../Types";

const batchImport = (directory: string): Promise<any[]> => {
    const files = fs.readdirSync(directory)
        .filter((name) => name.match(/\.[tj]s$/));
    const futureImportedFiles = files
        .map((file) => import(`${directory}/${file}`));
    return Promise.all(futureImportedFiles);
};

const isMuteOption = (maybeMuteOption: any): maybeMuteOption is MuteOption =>
    Object.values(MuteOption).includes(maybeMuteOption);

export {batchImport, isMuteOption};
