import { exec } from "child_process";

export async function parseDependenciesForFile(
  basePath: string,
  filePath: string,
): Promise<string> {
  return new Promise((resolve, reject) =>
    exec(
      `ts_dependency_graph --max_depth 1 --start ${filePath} --base_path ${basePath}`,
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
