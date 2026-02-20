import { createRoot } from "react-dom/client";
import React, { useState } from "react";
import { ExplorerFile, files } from "./api/files";
import { Graph } from "./Graph";
import { FileExplorer } from "./FileExplorer";
import { Node } from "@xyflow/react";
import { ExplorerNode, ExplorerNodeData } from "./node";
import { BASE_PATH } from "./config";

// const { clientX, clientY } =
//           'changedTouches' in event ? event.changedTouches[0] : event;
//         const newNode = {
//           id,
//           position: screenToFlowPosition({
//             x: clientX,
//             y: clientY,
//           }),
//           data: { label: `Node ${id}` },
//           origin: [0.5, 0.0],
//         };

//         setNodes((nds) => nds.concat(newNode));

// const initialNodes = [
//   { id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
//   { id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
// ];

const App = () => {
  const [fileList, setFileList] = useState<ExplorerFile[]>([]);
  const [depsMap, setDepsMap] = useState<Record<string, ExplorerFile[]>>({});
  const [nodes, setNodes] = useState<ExplorerNode[]>([]);

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
          deps?.forEach((file) => {
            addNode({ file });
          });
        },
        file,
      },
      origin: [0.5, 0],
    };
    setNodes((prevNodes) => prevNodes.concat(node));
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
        <Graph nodes={nodes} setNodes={setNodes} />
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
