import React, { useState } from "react";
import Upload from "./Upload";
import GraphView from "./GraphView";
import RingsTable from "./RingsTable";
import "./styles.css";

function App() {
  const [data, setData] = useState(null);

  const downloadJSON = () => {
    const blob = new Blob(
      [JSON.stringify(data.analysis, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "fraud_detection.json";
    a.click();
  };

  return (
    <div className="container">
      <h1>Money Muling Detection Engine</h1>

      <Upload setData={setData} />

      {data && (
        <>
          <button onClick={downloadJSON}>Download JSON</button>

          <GraphView
            graph={data.graph}
            suspicious={data.analysis.suspicious_accounts}
          />

          <RingsTable rings={data.analysis.fraud_rings} />
        </>
      )}
    </div>
  );
}

export default App;
