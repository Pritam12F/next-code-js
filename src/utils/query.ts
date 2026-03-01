export const generateFirstUserQuery = (q: string) => `<input>
  <userMessage>
    ${q}
  </userMessage>
</input>`;

export const generateUserQuery = (
  q: string,
  codeChunk: string[] | string,
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

  if (codeChunk && Array.isArray(codeChunk)) {
    let chunk = "";

    codeChunk.forEach((c) => {
      const newChunk = chunk.concat(c);
      chunk = newChunk;
    });

    result += `
    <codeChunk>
      ${chunk}
    </codeChunk>
      `;
  } else if (codeChunk && typeof codeChunk === "string" && codeChunk.length) {
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
