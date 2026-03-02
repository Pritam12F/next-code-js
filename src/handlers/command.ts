import { execSync } from "child_process";
import type { GemmaMessages } from "../types";
import { generateFullQuery } from "../utils/query";
import { extractProject } from "../utils/extract-tag";

export const handleCommand = (element: string, messages: GemmaMessages) => {
  const command = element
    .substring(element.indexOf("<command>") + "<command>".length, element.indexOf("</command>"))
    .trim();

  execSync(command);

  if (command.includes("shadcn@latest init -d")) {
    const projectName = extractProject(messages);

    const payload = generateFullQuery(projectName);

    messages.push({
      role: "user",
      content: payload,
    });
  } else {
    messages.push({
      role: "user",
      content: `${command} was run successfully`,
    });
  }
};

export const handleCommandWithPath = (
  element: string,
  messages: GemmaMessages,
) => {
  const command = element.substring(
    element.indexOf(">") + ">".length,
    element.indexOf("</command>"),
  );

  const path = element.match(/path="([^"]*)"/)?.[1]!;

  execSync(`cd ./${path} && ${command}`);

  if (command.includes("shadcn@latest init -d")) {
    const projectName = extractProject(messages);

    const payload = generateFullQuery(projectName);

    messages.push({
      role: "user",
      content: payload,
    });
  } else {
    messages.push({
      role: "user",
      content: `${command} was run successfully`,
    });
  }
};
