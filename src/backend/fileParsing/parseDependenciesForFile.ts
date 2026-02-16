import { exec } from "child_process";

export async function parseDependenciesForFile(
  filePath: string,
): Promise<string> {
  return new Promise((resolve, reject) =>
    exec(
      `ts_dependency_graph --max_depth 1 --start ${filePath}`,
      (error, stdout, stderr) => {
        resolve(stdout);
        reject(stderr);
        if (error !== null) {
          reject(`exec error: ${error}`);
        }
      },
    ),
  );
}
