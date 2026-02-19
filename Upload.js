import React, { useState } from "react";
import { analyzeCSV } from "./api";

function Upload({ setData }) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const res = await analyzeCSV(file);
      setData(res.data);
    } catch (err) {
      alert("Upload failed");
    }
    setLoading(false);
  };

  return (
    <div className="upload">
      <input type="file" accept=".csv" onChange={handleFile} />
      {loading && <p>Processing...</p>}
    </div>
  );
}

export default Upload;
