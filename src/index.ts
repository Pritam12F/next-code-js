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
      model: "glm-5:cloud",
      messages: messages,
    });

    const content = response.message.content.trim();

    messages.push({ role: "assistant", content });

    const tags = extractTags(content);

    await Promise.all(
      tags.map(async (element) => {
        if (element.startsWith("<info>")) {
          console.log(
            element.substring(
              element.indexOf("<info>") + "<info>".length,
              element.indexOf("</info>"),
            ),
          );
        } else if (element.startsWith("<command>")) {
          try {
            handleCommand(element, messages);
          } catch (error) {
            console.error(error);
          }
        } else if (element.startsWith("<command path=")) {
          try {
            handleCommandWithPath(element, messages);
          } catch (error) {
            console.error(error);
          }
        } else if (element.startsWith("<fileCreate")) {
          try {
            handleFileCreate(element, messages);
          } catch (error) {
            console.error(error);
          }
        } else if (element.startsWith("<fileEdit")) {
          try {
            handleFileEdit(element, messages);
          } catch (err) {
            console.error(err);
          }
        } else if (element.startsWith("<fileDelete")) {
          try {
            handleFileDelete(element, messages);
          } catch (error) {
            console.error(error);
          }
        } else if (element.startsWith("<question>")) {
          try {
            const question = element.substring(
              element.indexOf("<question>") + "<question>".length,
              element.indexOf("</question>"),
            );

            const answer = await getInput(question);

            messages.push({
              role: "user",
              content: `User answered: '${answer}' to question: '${question}'`,
            });
          } catch (error) {
            console.error(error);
          }
        } else if (element.startsWith("<readFile")) {
          try {
            handleReadFile(element, messages);
          } catch (error) {
            console.error(error);
          }
        }
      }),
    );

    if (content.endsWith("<done />")) break;

    messages.push({
      role: "user",
      content: `Step was called and action was completed`,
    });
  }

  return;
}

getInput().then((res) => main(res).then(() => process.exit(0)));
