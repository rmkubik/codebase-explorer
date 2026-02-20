import { useState, useCallback, SetStateAction, Dispatch } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { CustomNode } from "./CustomNode";
import { ExplorerNode } from "./node";
import { ExplorerEdge } from "./edge";

const nodeTypes = {
  customNode: CustomNode,
};

export function Graph({
  nodes,
  setNodes,
  edges,
  setEdges,
}: {
  nodes: ExplorerNode[];
  setNodes: Dispatch<SetStateAction<ExplorerNode[]>>;
  edges: ExplorerEdge[];
  setEdges: Dispatch<SetStateAction<ExplorerEdge[]>>;
}) {
  const onNodesChange = useCallback(
    (changes: NodeChange<ExplorerNode>[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (
      changes: EdgeChange<{
        id: string;
        source: string;
        target: string;
      }>[],
    ) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <button onClick={() => setNodes([])}>Clear</button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      />
    </div>
  );
}
