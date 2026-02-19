import React from "react";
import CytoscapeComponent from "react-cytoscapejs";

function GraphView({ graph, suspicious }) {
  if (!graph) return null;

  const suspiciousIds = suspicious.map(a => a.account_id);

  const elements = [
    ...graph.nodes.map(node => ({
      data: { id: node.id },
      classes: suspiciousIds.includes(node.id) ? "suspicious" : ""
    })),
    ...graph.edges.map(edge => ({
      data: {
        source: edge.source,
        target: edge.target
      }
    }))
  ];

  const stylesheet = [
    {
      selector: "node",
      style: {
        label: "data(id)",
        "background-color": "#3498db",
        color: "#000",
        "text-valign": "center",
        "text-halign": "center"
      }
    },
    {
      selector: ".suspicious",
      style: {
        "background-color": "red",
        width: 25,
        height: 25,
        "border-width": 3,
        "border-color": "#000"
      }
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#ccc",
        "target-arrow-shape": "triangle",
        "target-arrow-color": "#ccc",
        "curve-style": "bezier"
      }
    }
  ];

  return (
    <div style={{ height: "500px", border: "1px solid #ccc" }}>
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        layout={{ name: "cose" }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default GraphView;
