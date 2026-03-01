export const extractTags = (content: string) => {
  const stepStart = content.search("<step>");
  const stepEnd = content.search("</step>");

  const stepContent = content.substring(stepStart + 6, stepEnd);

  const regexpTag = new RegExp(
    /<(command|info|fileCreate|fileEdit|question)(?:\s+path="([^"]*)")?>([\s\S]*?)<\/\1>/g,
  );

  const extractedTags = stepContent.matchAll(regexpTag).map((t) => t[0].trim());

  return extractedTags;
};
