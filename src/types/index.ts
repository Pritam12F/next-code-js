export type GeminiMessages = {
  role: "user" | "model";
  parts: { text: string }[];
}[];
