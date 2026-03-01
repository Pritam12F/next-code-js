export const generateFirstUserQuery = (q: string) => `<input>
                                                        <userMessage>
                                                           ${q}
                                                        </userMessage>
                                                      </input>`;

export const generateUserQuery = (
  q: string,
  codeChunk: string,
  fileTree: Record<string, any>,
) => `<input>
         <userMessage>
            ${q}
         </userMessage>
         <codeChunk>
            ${codeChunk}
         </codeChunk>
         <fileTree>
            ${JSON.stringify(fileTree)}
         </fileTree>
      </input>`;
