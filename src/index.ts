import "dotenv/config";
import { getInput } from "./input";
import { SYSTEM_PROMPT } from "./prompts/system";
import ollama from "ollama";
import type { GemmaMessages } from "./types";
import { generateFirstUserQuery } from "./utils/query";
import { extractTags } from "./utils/extract-tag";
import { handleCommand, handleCommandWithPath } from "./handlers/command";
import {
  handleFileCreate,
  handleFileDelete,
  handleFileEdit,
  handleReadFile,
} from "./handlers/file";

async function main(query: string) {
  const firstQuery = generateFirstUserQuery(query);
  const messages: GemmaMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: firstQuery },
  ];

  while (true) {
    const response = await ollama.chat({
      model: "minimax-m2.5:cloud",
      messages: messages,
    });

    const content = response.message.content.trim();

    messages.push({ role: "assistant", content });

    if (content.includes("<done />")) break;

    const tags = extractTags(content);

    tags.forEach(async (element) => {
      if (element.startsWith("<info>")) {
        console.log(
          element.substring(
            element.indexOf("<info>") + "<info>".length,
            element.indexOf("</info>"),
          ),
        );
      } else if (element.startsWith("<command>")) {
        handleCommand(element, messages);
      } else if (element.startsWith("<command path=")) {
        handleCommandWithPath(element, messages);
      } else if (element.startsWith("<fileCreate")) {
        handleFileCreate(element, messages);
      } else if (element.startsWith("<fileEdit")) {
        handleFileEdit(element, messages);
      } else if (element.startsWith("<fileDelete")) {
        handleFileDelete(element, messages);
      } else if (element.startsWith("<question>")) {
        const question = element.substring(
          element.indexOf("<question>") + "<question>".length,
          element.indexOf("</question>"),
        );

        const answer = await getInput(question);

        messages.push({
          role: "user",
          content: `User answered: '${answer}' to question: '${question}'`,
        });
      } else if (element.startsWith("<readFile")) {
        handleReadFile(element, messages);
      }
    });

    const stepMatch = content.match(/number=\{(\d+)\}\s+label="([^"]*)"/)!;

    messages.push({
      role: "user",
      content: `Step was called and action was completed`,
    });
  }

  return;
}

getInput().then(async (res) => {
  await main(res);
});
