import readline from "readline/promises";

export const getInput = async (
  query = "What would you like to build? 🛠️\n",
) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return rl.question(query);
};
