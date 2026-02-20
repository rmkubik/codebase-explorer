import { createRoot } from "react-dom/client";
import React, { useState } from "react";
import { ExplorerFile, files } from "./api/files";
import { Graph } from "./Graph";
import { FileExplorer } from "./FileExplorer";
import { Edge, Node, useEdgesState } from "@xyflow/react";
import { ExplorerNode, ExplorerNodeData } from "./node";
import { BASE_PATH } from "./config";
import { ExplorerEdge } from "./edge";
import { remove } from "./array";

const App = () => {
  const [fileList, setFileList] = useState<ExplorerFile[]>([]);
  const [depsMap, setDepsMap] = useState<Record<string, ExplorerFile[]>>({});
  const [nodes, setNodes] = useState<ExplorerNode[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ExplorerEdge>([]);

  const getDepsForNode = async (file: ExplorerFile) => {
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

    return deps;
  };

  function addNode({ file }: { file: ExplorerFile }) {
    const nodeId = crypto.randomUUID();
    const node: ExplorerNode = {
      id: nodeId,
      type: "customNode",
      position: { x: 0, y: 0 },
      data: {
        label: file.isAbsolutePath()
          ? file.getPathRelativeTo(BASE_PATH)
          : file.path,
        // Not sure if I need to manually id into
        // data so that CustomNode can access it or not
        id: nodeId,
        onExpandDeps: async (data: ExplorerNodeData) => {
          const deps = await getDepsForNode(data.file);
          deps?.forEach((depFile) => {
            const depNode = addNode({ file: depFile });
            addEdge({ from: node, to: depNode });
          });
        },
        onDeleteNode: ({ file }: { file: ExplorerFile }) => {
          setNodes((prevNodes) => {
            const fileIndex = prevNodes.findIndex(
              (node) => node.data.file.path === file.path,
            );
            return remove(prevNodes, fileIndex);
          });
        },
        file,
      },
      origin: [0.5, 0],
    };
    setNodes((prevNodes) => prevNodes.concat(node));
    return node;
  }

  function addEdge({ from, to }: { from: ExplorerNode; to: ExplorerNode }) {
    const edgeId = crypto.randomUUID();
    const edge: ExplorerEdge = {
      id: edgeId,
      source: from.id,
      target: to.id,
    };
    setEdges((prevEdges) => prevEdges.concat(edge));
    return edge;
  }

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ width: "20vw" }}>
        <FileExplorer
          fileList={fileList}
          setFileList={setFileList}
          depsMap={depsMap}
          setDepsMap={setDepsMap}
          addNode={addNode}
        />
      </div>
      <div style={{ flex: 1, height: "100vh" }}>
        <Graph
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
        />
      </div>
    </div>
  );
};

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container missing in index.html");
}
const root = createRoot(container);
root.render(<App />);
