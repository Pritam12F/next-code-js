import readline from "readline/promises";

export const getPrompt = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return rl.question("What would you like to build?");
};
