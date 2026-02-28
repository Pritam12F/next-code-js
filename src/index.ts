import dotenv from "dotenv";
import OpenAI from "openai";
import { getPrompt } from "./input.js";

dotenv.config();

const client = new OpenAI();

async function main(query: string) {}

getPrompt().then(async (res) => {
  await main(res);
});
