import dotenv from "dotenv";
import { getInput } from "./input";
import { SYSTEM_PROMPT } from "./prompts/system";
import { GoogleGenAI } from "@google/genai";
import type { GeminiMessages } from "./types";
import { generateFirstUserQuery } from "./utils/query";
import { extractTags } from "./utils/extract-tag";
import { execSync } from "child_process";
import fs from "fs";

dotenv.config();

const ai = new GoogleGenAI({});

async function main(query: string) {
  const firstQuery = generateFirstUserQuery(query);
  const messages: GeminiMessages = [];

  while (true) {
    if (messages.length === 0) {
      messages.push({ role: "user", content: firstQuery });
    }

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      history: messages,
      config: { systemInstruction: SYSTEM_PROMPT },
    });

    const res = await chat.sendMessage({
      message: firstQuery,
    });

    if (res.text) {
      const content = res.text.trim();

      if (content === "<done />") break;

      console.log(content);

      messages.push({ role: "assistant", content });

      const tabs = extractTags(content);

      tabs.forEach(async (element) => {
        if (element.startsWith("<info>")) {
          console.log(
            element.substring(
              element.search("<info>") + 6,
              element.search("</info>"),
            ),
          );
        } else if (element.startsWith("<command>")) {
          const command = element
            .substring(
              element.search("<command>") + 9,
              element.search("</command>"),
            )
            .trim();

          execSync(command);

          messages.push({
            role: "user",
            content: `Command ${command} was run successfully.`,
          });
        } else if (element.startsWith("<command path=")) {
          const command = element.substring(
            element.search(">") + 1,
            element.search("</command>"),
          );

          const path = element.match(/path="([^"]*)"/)?.[1]!;

          execSync(`cd ./${path} && ${command}`);

          messages.push({
            role: "user",
            content: `Command ${command} was run successfully.`,
          });
        } else if (element.startsWith("<fileCreate")) {
          const fileContent = element
            .substring(element.search(">") + 1, element.search("</fileCreate>"))
            .trim();
          const filePath = element.match(/path="([^"]*)"/)?.[1]!;
          const dirPath = filePath.slice(0, filePath.lastIndexOf("/"));

          fs.mkdirSync(dirPath, { recursive: true });

          const writeStream = fs.createWriteStream(`./${filePath}`, {
            encoding: "utf8",
          });

          writeStream.write(fileContent, (err) => {
            console.log(err?.message);
          });

          messages.push({
            role: "user",
            content: `File ${filePath} was created successfully.`,
          });
        } else if (element.startsWith("<fileEdit")) {
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

          const readStream = fs.createReadStream(`./${filePath}`, {
            encoding: "utf8",
          });

          const fileContent: string = readStream.read();

          const editedCode = fileContent.replace(searchCode, newCode);

          const writeStream = fs.createWriteStream(`./${filePath}`, {
            encoding: "utf8",
          });

          writeStream.write(editedCode, (err) => {
            console.log(err?.message);
          });

          messages.push({
            role: "user",
            content: `File ${filePath} was edited successfully.`,
          });
        } else if (element.startsWith("<fileDelete")) {
          const filePath = element.match(/path="([^"]*)"/)?.[1]!;

          fs.unlinkSync(`./${filePath}`);

          messages.push({
            role: "user",
            content: `File ${filePath} was deleted successfully.`,
          });
        } else if (element.startsWith("<question>")) {
          const question = element.substring(
            element.search("<question>") + 10,
            element.search("</question"),
          );

          const anwser = await getInput(question);

          messages.push({
            role: "user",
            content: `User answered: '${anwser} to question: '${question}'`,
          });
        } else if (element.startsWith("<readFile")) {
          const filePath = element.match(/path="([^"]*)"/)?.[1]!;

          const readStream = fs.createReadStream(`./${filePath}`, {
            encoding: "utf8",
          });

          const fileContent: string = readStream.read();
        }
      });

      // const stepMatch = content.match(/number=\{(\d+)\}\s+label=\{([^}]*)\}/)!;
      messages.push({
        role: "user",
        content: `Step was completed successfully`,
      });
    }
  }

  return;
}

getInput().then(async (res) => {
  await main(res);
});
