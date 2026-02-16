import klaw from "klaw";

export async function listFiles(filePath: string): Promise<string[]> {
  return await new Promise((resolve, reject) => {
    const paths: string[] = [];

    klaw(filePath)
      .on("data", (item) => paths.push(item.path))
      .on("error", (error) => reject(error))
      .on("end", () => {
        resolve(paths);
      });
  });
}
