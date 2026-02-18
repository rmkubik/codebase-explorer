import { ExplorerFile, files } from "./api/files";
import { BASE_PATH } from "./config";

export function FileExplorer({
  fileList,
  setFileList,
  setDepsMap,
  depsMap,
  addNode,
}: {
  fileList: ExplorerFile[];
  setFileList: (file: ExplorerFile[]) => void;
  setDepsMap: (
    setterFn: (
      map: Record<string, ExplorerFile[]>,
    ) => Record<string, ExplorerFile[]>,
  ) => void;
  depsMap: Record<string, ExplorerFile[]>;
  addNode: ({ file }: { file: ExplorerFile }) => void;
}) {
  return (
    <div>
      <button
        onClick={async () => {
          const fileList = await files.list(BASE_PATH);

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
                {file.getPathRelativeTo(BASE_PATH)} -{" "}
                <button
                  onClick={async () => {
                    const deps = await files.getDependencies(file.path);

                    if (deps instanceof Error) {
                      console.error(deps);
                      return;
                    }

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
                <button onClick={() => addNode({ file })}>add to graph</button>
              </span>
              <ul>
                {depsMap[file.path]?.map((depFile) => (
                  <li key={file.path + depFile.path}>{depFile.path}</li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </div>
  );
}
