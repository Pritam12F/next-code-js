import path from "path";
import type { GeminiMessages } from "../types";
import fs from "fs";
import { getAllFiles, getFileTreeJSON } from "../utils/file";
import { generateUserQuery } from "../utils/query";
import { extractProject } from "../utils/extract-tag";

export const handleFileCreate = (element: string, messages: GeminiMessages) => {
  const fileContent = element
    .substring(element.search(">") + 1, element.search("</fileCreate>"))
    .trim();
  const filePath = element.match(/path="([^"]*)"/)?.[1]!;
  const dirPath = path.dirname(filePath);

  fs.mkdirSync(dirPath, { recursive: true });

  const writeStream = fs.createWriteStream(filePath, {
    encoding: "utf8",
  });

  writeStream.write(fileContent, (err) => {
    console.log(err?.message);
  });

  messages.push({
    role: "user",
    parts: [{ text: `File ${filePath} was created successfully.` }],
  });
};

export const handleFileEdit = (element: string, messages: GeminiMessages) => {
  const content = element
    .substring(element.search(">") + 1, element.search("</fileEdit>"))
    .trim();
  const filePath = element.match(/path="([^"]*)"/)?.[1]!;
  const searchCode = content.substring(
    content.search("<search>") + 7,
    content.search("</search>"),
  );

  const newCode = content.substring(
    content.search("<replace>") + 9,
    content.search("</replace"),
  );

  const fileContent = fs.readFileSync(filePath, "utf8");

  const editedCode = fileContent.replace(searchCode, newCode);

  const writeStream = fs.createWriteStream(filePath, {
    encoding: "utf8",
  });

  writeStream.write(editedCode, (err) => {
    console.log(err?.message);
  });

  messages.push({
    role: "user",
    parts: [{ text: `File ${filePath} was edited successfully.` }],
  });
};

export const handleFileDelete = (element: string, messages: GeminiMessages) => {
  const filePath = element.match(/path="([^"]*)"/)?.[1]!;

  fs.unlinkSync(filePath);

  messages.push({
    role: "user",
    parts: [{ text: `File ${filePath} was deleted successfully.` }],
  });
};

export const handleReadFile = (element: string, messages: GeminiMessages) => {
  const filePath = element.match(/path="([^"]*)"/)?.[1]!;
  const projectName = extractProject(messages);

  const fileContent = fs.readFileSync(filePath, {
    encoding: "utf8",
  });

  const allFiles = getAllFiles(projectName);
  const fileTree = getFileTreeJSON(allFiles);
  const payload = generateUserQuery(
    "",
    [`<file path="${filePath}">${fileContent}</file>`],
    fileTree,
  );

  messages.push({ role: "user", parts: [{ text: payload }] });
};
