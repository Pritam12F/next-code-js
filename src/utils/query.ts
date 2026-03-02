import { getAllFiles, getFileTreeJSON, getRelevantFilesWithData } from "./file";

export const generateFirstUserQuery = (q: string) => `<input>
  <userMessage>
    ${q}
  </userMessage>
</input>`;

export const generateUserQuery = (
  q: string,
  codeChunk: string[],
  fileTree: string,
) => {
  let result = "<input>";

  if (q.length) {
    result += `
  <userMessage>
    ${q}
  </userMessage>
    `;
  }

  if (Array.isArray(codeChunk) && codeChunk.length) {
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
  }

  if (fileTree.length) {
    result += `
  <fileTree>
    ${fileTree}
  </fileTree>
    `;
  }

  result += "</input>";

  return result;
};

export function generateFullQuery(projectName: string, userQuery = "") {
  const allFiles = getAllFiles(projectName);
  const relevantFilesWithContent = getRelevantFilesWithData(
    allFiles,
    projectName,
  );

  const fileTree = getFileTreeJSON(allFiles);
  const payload = generateUserQuery(
    userQuery,
    relevantFilesWithContent,
    fileTree,
  );

  return payload;
}
