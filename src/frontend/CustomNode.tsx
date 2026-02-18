import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { useHover } from "@uidotdev/usehooks";

// data is the custom data created for this type of node
// in the nodeTypes config?
// i think its really just an arbitrary thing you can
// throw in there
export const CustomNode = memo(({ data, isConnectable }) => {
  const [ref, hovering] = useHover();

  return (
    <div
      ref={ref}
      style={{
        border: "1px solid black",
        padding: "4px 8px",
        borderRadius: "4px",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <div>{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
      {hovering && <ActionBar onExpandDeps={() => data.onExpandDeps(data)} />}
    </div>
  );
});

function ActionBar({ onExpandDeps }: { onExpandDeps: () => void }) {
  return (
    <div style={{ position: "absolute" }}>
      <button onClick={onExpandDeps}>👁️</button>
    </div>
  );
}
