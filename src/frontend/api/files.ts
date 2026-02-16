import { API_BASE_URL } from "./config";
import { fetchJson } from "./fetchJson";

export class ExplorerFile {
  constructor(public path: string) {}
}

export const files = {
  async list(filePath: string): Promise<ExplorerFile[] | Error> {
    const url = new URL(API_BASE_URL + "/files/list");
    url.searchParams.set("filePath", filePath);

    const result = await fetchJson(url.toString());

    if (result.status === "error") return result.error;
    if (typeof result.data !== "object" || !Array.isArray(result.data))
      return new Error("Invalid result data format");

    return result.data.map((path) => new ExplorerFile(path));
  },
};
