import React from "react";

function RingsTable({ rings }) {
  if (!rings || rings.length === 0) return null;

  return (
    <div>
      <h2>Fraud Rings Detected</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Ring ID</th>
            <th>Pattern</th>
            <th>Members</th>
            <th>Risk Score</th>
            <th>Accounts</th>
          </tr>
        </thead>
        <tbody>
          {rings.map(r => (
            <tr key={r.ring_id}>
              <td>{r.ring_id}</td>
              <td>{r.pattern_type}</td>
              <td>{r.member_accounts.length}</td>
              <td>{r.risk_score}</td>
              <td>{r.member_accounts.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RingsTable;
