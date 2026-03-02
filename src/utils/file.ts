import fs from "fs";
import path from "path";
import { ignoreFiles, ignoreFolders } from "../constants/ignore";
import process from "process";

export const getAllFiles = (projectName: string) => {
  const dirPath = path.resolve(process.cwd(), projectName);

  const allFiles = fs
    .readdirSync(dirPath, {
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

export const getFileTreeJSON = (files: string[]) => {
  return JSON.stringify(
    files.map((file) => ({
      path: file,
      type: "file",
    })),
  );
};

export const getRelevantFilesWithData = (
  files: string[],
  projectName: string,
) => {
  const content = files
    .filter((f) => f.endsWith(".tsx"))
    .map((file) => {
      const fileContent = fs.readFileSync(
        path.join(".", projectName, file),
        "utf8",
      );

      return `<file path="${path.join(".", projectName, file)}">${fileContent}</file>`;
    });

  return content;
};
