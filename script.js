const API_URL = "http://127.0.0.1:8000/analyze";

let analysisData = null;

async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a CSV file");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    analysisData = data.analysis;

    drawGraph(data.graph, data.analysis.suspicious_accounts);
    showRings(data.analysis.fraud_rings);

    document.getElementById("downloadBtn").style.display = "inline";
  } catch (error) {
    alert("Error connecting to backend");
  }
}

function drawGraph(graph, suspiciousAccounts) {
  const suspiciousIds = suspiciousAccounts.map(a => a.account_id);

  const elements = [];

  graph.nodes.forEach(n => {
    elements.push({
      data: { id: n.id },
      classes: suspiciousIds.includes(n.id) ? "suspicious" : ""
    });
  });

  graph.edges.forEach(e => {
    elements.push({
      data: { source: e.source, target: e.target }
    });
  });

  cytoscape({
    container: document.getElementById("graph"),
    elements: elements,

    style: [
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
    ],

    layout: { name: "cose" }
  });
}

function showRings(rings) {
  if (!rings.length) return;

  const table = document.getElementById("ringsTable");
  const tbody = table.querySelector("tbody");

  tbody.innerHTML = "";

  rings.forEach(r => {
    const row = `
      <tr>
        <td>${r.ring_id}</td>
        <td>${r.pattern_type}</td>
        <td>${r.member_accounts.length}</td>
        <td>${r.risk_score}</td>
        <td>${r.member_accounts.join(", ")}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });

  document.getElementById("ringTitle").style.display = "block";
  table.style.display = "table";
}

function downloadJSON() {
  const blob = new Blob(
    [JSON.stringify(analysisData, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "fraud_detection.json";
  a.click();
}
