import { createRoot } from "react-dom/client";
import React, { useState } from "react";
import { ExplorerFile, files } from "./api/files";

const App = () => {
  const [fileList, setFileList] = useState<ExplorerFile[]>([]);
  const [depsMap, setDepsMap] = useState<Record<string, ExplorerFile[]>>({});

  console.log(depsMap);

  return (
    <>
      <button
        onClick={async () => {
          const fileList = await files.list(
            "/Users/ryankubik/git/obsidian-parser/src",
          );

          if (fileList instanceof Error) {
            console.error(fileList);
            return;
          }

          setFileList(fileList);
        }}
      >
        fetch
      </button>
      <ul>
        {fileList
          .filter((file) => !file.isDirectory())
          .map((file) => (
            <li key={file.path}>
              <span>
                {file.path} -{" "}
                <button
                  onClick={async () => {
                    const deps = await files.getDependencies(file.path);

                    if (deps instanceof Error) {
                      console.error(deps);
                      return;
                    }

                    console.log(deps);

                    setDepsMap((prevMap) => {
                      return {
                        ...prevMap,
                        [file.path]: deps,
                      };
                    });
                  }}
                >
                  get deps
                </button>
              </span>
              <ul>
                {depsMap[file.path]?.map((depFile) => (
                  <li key={file.path + depFile.path}>{depFile.path}</li>
                ))}
              </ul>
            </li>
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
