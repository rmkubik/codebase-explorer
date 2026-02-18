import z from "zod";
import { API_BASE_URL } from "./config";
import { fetchJson } from "./fetchJson";
import { fromDot } from "ts-graphviz";

/**
 * AI generated, seems like it works well enough for now
 */
function relativePath(from: string, to: string) {
  const fromParts = from.split("/").filter(Boolean);
  const toParts = to.split("/").filter(Boolean);

  while (fromParts.length && toParts.length && fromParts[0] === toParts[0]) {
    fromParts.shift();
    toParts.shift();
  }

  return "../".repeat(fromParts.length) + toParts.join("/");
}

export class ExplorerFile {
  constructor(public path: string) {}

  isDirectory() {
    // Good enough proxy for now, I think
    return !this.path.includes(".");
  }

  getPathRelativeTo(basePath: string) {
    return relativePath(basePath, this.path);
  }
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
  async getDependencies(filePath: string): Promise<ExplorerFile[] | Error> {
    const url = new URL(API_BASE_URL + "/files/get-deps");
    url.searchParams.set("filePath", filePath);

    const result = await fetchJson(url.toString());

    if (result.status === "error") return result.error;

    if (typeof result.data !== "object")
      return new Error("Invalid result data format");

    const schema = z.object({
      deps: z.string(),
    });
    const schemaResult = schema.safeParse(result.data);
    if (!schemaResult.success)
      return new Error("Failed to parse schema: " + schemaResult.error);

    const deps = fromDot(schemaResult.data.deps);

    return (
      deps
        .getSubgraph("Rel1")
        ?.edges.map((edge) => {
          const toTarget = edge.targets[1];
          // If to target is a subgroup, it will be an array
          // I don't think we will have this in our generation,
          // but it is a valid dot construct.
          if (Array.isArray(toTarget)) return undefined;
          return new ExplorerFile(toTarget.id);
        })
        // filter out undefined files
        .filter((file) => !!file) ?? []
    );
  },
};
