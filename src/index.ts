import dotenv from "dotenv";
import { getInput } from "./input";
import { SYSTEM_PROMPT } from "./prompts/system";
import { GoogleGenAI } from "@google/genai";
import type { GeminiMessages } from "./types";
import { generateFirstUserQuery } from "./utils/query";
import { extractTags } from "./utils/extract-tag";
import { handleCommand, handleCommandWithPath } from "./handlers/command";
import {
  handleFileCreate,
  handleFileDelete,
  handleFileEdit,
  handleReadFile,
} from "./handlers/file";

dotenv.config();

const ai = new GoogleGenAI({});

async function main(query: string) {
  const firstQuery = generateFirstUserQuery(query);
  const messages: GeminiMessages = [];

  while (true) {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      history: messages,
      config: { systemInstruction: SYSTEM_PROMPT },
    });

    const res = await chat.sendMessage({
      message: firstQuery,
    });

    if (messages.length === 0) {
      messages.push({ role: "user", parts: [{ text: firstQuery }] });
    }

    if (res.text) {
      const content = res.text.trim();

      if (content.includes("<done />")) break;

      messages.push({ role: "model", parts: [{ text: content }] });

      const tags = extractTags(content);

      tags.forEach(async (element) => {
        if (element.startsWith("<info>")) {
          console.log(
            element.substring(
              element.search("<info>") + 6,
              element.search("</info>"),
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
            element.search("<question>") + 10,
            element.search("</question"),
          );

          const answer = await getInput(question);

          messages.push({
            role: "user",
            parts: [
              { text: `User answered: '${answer}' to question: '${question}'` },
            ],
          });
        } else if (element.startsWith("<readFile")) {
          handleReadFile(element, messages);
        }
      });

      // const stepMatch = content.match(/number=\{(\d+)\}\s+label=\{([^}]*)\}/)!;
      messages.push({
        role: "user",
        parts: [{ text: `Step was completed successfully` }],
      });
    }
  }

  return;
}

getInput().then(async (res) => {
  await main(res);
});
