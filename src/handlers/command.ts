import { execSync } from "child_process";
import type { GeminiMessages } from "../types";
import { generateFullQuery } from "../utils/query";
import { extractProject } from "../utils/extract-tag";

export const handleCommand = (element: string, messages: GeminiMessages) => {
  const command = element
    .substring(element.search("<command>") + 9, element.search("</command>"))
    .trim();

  execSync(command);

  if (command.includes("shadcn@latest init -d")) {
    const projectName = extractProject(messages);

    const payload = generateFullQuery(projectName);

    messages.push({
      role: "user",
      parts: [{ text: payload }],
    });
  } else {
    messages.push({
      role: "user",
      parts: [{ text: `Command ${command} was run successfully.` }],
    });
  }
};

export const handleCommandWithPath = (
  element: string,
  messages: GeminiMessages,
) => {
  const command = element.substring(
    element.search(">") + 1,
    element.search("</command>"),
  );

  const path = element.match(/path="([^"]*)"/)?.[1]!;

  execSync(`cd ./${path} && ${command}`);

  if (command.includes("shadcn@latest init -d")) {
    const projectName = extractProject(messages);

    const payload = generateFullQuery(projectName);

    messages.push({
      role: "user",
      parts: [{ text: payload }],
    });
  } else {
    messages.push({
      role: "user",
      parts: [{ text: `Command ${command} was run successfully.` }],
    });
  }
};
