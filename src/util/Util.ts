import fs from "fs";

const batchImport = (directory: string): Promise<any[]> => {
    const files = fs.readdirSync(directory)
        .filter((name) => name.match(/\.[tj]s$/));
    const futureImportedFiles = files
        .map((file) => import(`${directory}/${file}`));
    return Promise.all(futureImportedFiles);
};

export {batchImport};
