import path from "path";
import type { GemmaMessages } from "../types";
import fs from "fs";
import { getAllFiles, getFileTreeJSON } from "../utils/file";
import { generateUserQuery } from "../utils/query";
import { extractProject } from "../utils/extract-tag";

export const handleFileCreate = (element: string, messages: GemmaMessages) => {
  const fileContent = element
    .substring(
      element.indexOf(">") + ">".length,
      element.indexOf("</fileCreate>"),
    )
    .trim();

  const filePath = element.match(/path="([^"]*)"/)?.[1]!;
  const dirPath = path.dirname(filePath);
  fs.mkdirSync(dirPath, { recursive: true });

  fs.writeFileSync(filePath, fileContent, "utf8");

  messages.push({
    role: "user",
    content: `File ${filePath} was created successfully.`,
  });
};

export const handleFileEdit = (element: string, messages: GemmaMessages) => {
  const content = element
    .substring(
      element.indexOf(">") + ">".length,
      element.indexOf("</fileEdit>"),
    )
    .trim();

  const filePath = element.match(/path="([^"]*)"/)?.[1]!;

  const searchCode = content
    .substring(
      content.indexOf("<search>") + "<search>".length,
      content.indexOf("</search>"),
    )
    .trim();

  const newCode = content
    .substring(
      content.indexOf("<replace>") + "<replace>".length,
      content.indexOf("</replace>"),
    )
    .trim();

  const fileContent = fs.readFileSync(filePath, "utf8");

  const editedCode = fileContent.replace(searchCode, newCode);

  fs.writeFileSync(filePath, editedCode, "utf8");

  messages.push({
    role: "user",
    content: `File ${filePath} was edited successfully.`,
  });
};

export const handleFileDelete = (element: string, messages: GemmaMessages) => {
  const filePath = element.match(/path="([^"]*)"/)?.[1]!;

  fs.unlinkSync(filePath);

  messages.push({
    role: "user",
    content: `File ${filePath} was deleted successfully.`,
  });
};

export const handleReadFile = (element: string, messages: GemmaMessages) => {
  const filePath = element.match(/path="([^"]*)"/)?.[1]!;
  const projectName = extractProject(messages);

  const fileContent = fs.readFileSync(filePath, "utf8");

  const allFiles = getAllFiles(projectName);
  const fileTree = getFileTreeJSON(allFiles);
  const payload = generateUserQuery(
    "",
    [`<file path="${filePath}">${fileContent}</file>`],
    fileTree,
  );

  messages.push({ role: "user", content: payload });
};
