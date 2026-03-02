import type { GemmaMessages } from "../types";

export const extractTags = (content: string) => {
  const stepStart = content.search("<step>");
  const stepEnd = content.search("</step>");

  const stepContent = content.substring(stepStart + 6, stepEnd);

  const regexpTag = new RegExp(
    /<(command|info|fileCreate|fileEdit|question|readFile)(?:\s+path="([^"]*)")?>([\s\S]*?)<\/\1>/g,
  );

  const extractedTags = stepContent.matchAll(regexpTag).map((t) => t[0].trim());

  return extractedTags;
};

export const extractProject = (messages: GemmaMessages) => {
  const step = messages.filter(
    (m) => m.role === "assistant" && m.content.startsWith("<step"),
  )[0]!.content;

  const match = step.match(/<command[^>]*>([\s\S]*?)<\/command>/);

  const projectName = match?.[1]?.trim().split(" ")[3]!;

  return projectName;
};
