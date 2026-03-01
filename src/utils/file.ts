import fs from "fs";
import path from "path";
import { ignoreFiles, ignoreFolders } from "../constants/ignore";

// Make sure rootPath is the absolute path of the project root directory

export const getAllFiles = (rootPath: string) => {
  const allFiles = fs
    .readdirSync(rootPath, {
      encoding: "utf8",
      recursive: true,
    })
    .filter((p) => {
      let includeFlag = true;

      ignoreFolders.forEach((folder) => {
        if (p.startsWith(folder)) {
          includeFlag = false;
        }
      });

      return includeFlag;
    })
    .filter((r) => {
      let includeFlag = true;

      ignoreFiles.forEach((file) => {
        if (r === file) {
          includeFlag = false;
        }
      });

      return includeFlag;
    })
    .filter((x) => x.includes("."));

  return allFiles;
};

export const getFileTree = (files: string[]) => {
  return files.map((file) => ({
    path: file,
    type: "file",
  }));
};

export const getRelevantFiles = async (files: string[]) => {
  const content = await Promise.all(
    files.map(async (file) => {
      const fileContent = fs.readFileSync(path.resolve(file), "utf8");

      return `<file path="${file}">${fileContent}</file>`;
    }),
  );

  return content;
};
