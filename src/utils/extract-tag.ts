import type { GeminiMessages } from "../types";

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

export const extractProject = (messages: GeminiMessages) => {
  const step = messages.filter((m) =>
    m.parts[0]?.text.startsWith("<step number={2}"),
  )[0]?.parts[0]?.text!;

  const match = step.match(/<command>([\s\S]*?)<\/command>/);

  const projectName = match?.[0]?.trim().split(" ")[3]!;

  return projectName.trim();
};
