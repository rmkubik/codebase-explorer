import { createRoot } from "react-dom/client";
import React, { useState } from "react";
import { ExplorerFile, files } from "./api/files";

const App = () => {
  const [fileList, setFileList] = useState<ExplorerFile[]>([]);

  return (
    <>
      <button
        onClick={async () => {
          const result = await files.list(
            "/Users/ryankubik/git/codebase-explorer/src",
          );

          if (result instanceof Error) {
            console.error(result);
            return;
          }

          setFileList(result);
        }}
      >
        fetch
      </button>
      <ul>
        {fileList.map((file) => (
          <li key={file.path}>{file.path}</li>
        ))}
      </ul>
    </>
  );
};

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container missing in index.html");
}
const root = createRoot(container);
root.render(<App />);
