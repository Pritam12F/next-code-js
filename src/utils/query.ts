export const generateFirstUserQuery = (q: string) => `<input>
  <userMessage>
    ${q}
  </userMessage>
</input>`;

export const generateUserQuery = (
  q: string,
  codeChunk: string,
  fileTree: Array<Record<string, string>>,
) => {
  let result = "<input>";

  if (q.length) {
    result += `
  <userMessage>
    ${q}
  </userMessage>
    `;
  }

  if (codeChunk.length) {
    result += `
  <codeChunk>
    ${codeChunk}
  </codeChunk>
    `;
  }

  if (fileTree.length) {
    result += `
  <fileTree>
    ${JSON.stringify(fileTree)}
  </fileTree>
    `;
  }

  result += "</input>";

  return result;
};
