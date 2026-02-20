import { Node } from "@xyflow/react";
import { ExplorerFile } from "./api/files";

export type ExplorerNodeData = {
  label: string;
  id: string;
  file: ExplorerFile;
  onExpandDeps: (data: ExplorerNodeData) => void;
  onDeleteNode: ({ file }: { file: ExplorerFile }) => void;
};
export type ExplorerNode = Node<ExplorerNodeData>;
