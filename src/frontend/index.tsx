import { createRoot } from "react-dom/client";
import React, { useCallback, useEffect, useState } from "react";
import { ExplorerFile, files } from "./api/files";
import { Graph } from "./Graph";
import { FileExplorer } from "./FileExplorer";
import { Edge, Node, useEdgesState } from "@xyflow/react";
import { ExplorerNode, ExplorerNodeData } from "./node";
import { BASE_PATH } from "./config";
import { ExplorerEdge } from "./edge";
import { remove } from "./array";

import * as d3 from "d3";

const App = () => {
  const [fileList, setFileList] = useState<ExplorerFile[]>([]);
  const [depsMap, setDepsMap] = useState<Record<string, ExplorerFile[]>>({});
  const [nodes, setNodes] = useState<ExplorerNode[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ExplorerEdge>([]);

  /**
   * This is just ChatGPT. Idk how this works
   * specifically.
   *
   * I need to rework how I'm setting this all
   * up so that nodes can be gravity applied
   * on creation and not need an extra click.
   */
  const spreadNodes = useCallback(() => {
    const simNodes = nodes.map((n) => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      node: n,
    }));

    const simEdges = edges.map((e) => ({
      source: e.source,
      target: e.target,
    }));

    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3
          .forceLink(simEdges)
          .id((d) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-30))
      .force("center", d3.forceCenter(25, 25))
      .stop();

    // Run simulation manually
    for (let i = 0; i < 300; i++) simulation.tick();

    // Update node positions
    setNodes((prevNodes) =>
      simNodes.map((simNode) => ({
        ...simNode.node,
        position: { x: simNode.x, y: simNode.y },
      })),
    );
  }, [nodes]);

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
      <button onClick={spreadNodes}>spread</button>
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
