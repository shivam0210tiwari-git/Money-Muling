import networkx as nx
import pandas as pd
from collections import defaultdict
try:
    from .scoring import calculate_scores
    from .utils import within_72_hours
except ImportError:
    from scoring import calculate_scores
    from utils import within_72_hours

def build_graph(df):
    G = nx.DiGraph()

    for _, row in df.iterrows():
        G.add_edge(
            row["sender_id"],
            row["receiver_id"],
            amount=row["amount"],
            timestamp=row["timestamp"],
        )
    return G


# ---------- CYCLE DETECTION ----------
def detect_cycles(G):
    rings = []
    for cycle in nx.simple_cycles(G):
        if 3 <= len(cycle) <= 5:
            rings.append(cycle)
    return rings


# ---------- SMURFING DETECTION ----------
def detect_smurfing(df):
    suspicious = set()

    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.dropna(subset=["timestamp"])

    # fan-in
    for receiver, group in df.groupby("receiver_id"):
        if len(group["sender_id"].unique()) >= 10:
            if within_72_hours(group):
                suspicious.add(receiver)

    # fan-out
    for sender, group in df.groupby("sender_id"):
        if len(group["receiver_id"].unique()) >= 10:
            if within_72_hours(group):
                suspicious.add(sender)

    return list(suspicious)


# ---------- SHELL LAYERING ----------
def detect_shell_chains(G):
    chains = []
    nodes = list(G.nodes())

    for start in nodes:
        for end in nodes:
            if start != end:
                for path in nx.all_simple_paths(G, start, end, cutoff=4):
                    if len(path) >= 4:
                        mid_nodes = path[1:-1]
                        if all(2 <= G.degree(n) <= 3 for n in mid_nodes):
                            chains.append(path)

    return chains


# ---------- MAIN DETECTION ----------
def run_detection(df):
    G = build_graph(df)

    cycles = detect_cycles(G)
    smurfing_accounts = detect_smurfing(df)
    shell_chains = detect_shell_chains(G)

    rings = []
    suspicious_patterns = defaultdict(list)

    ring_count = 1

    # process cycles
    for cycle in cycles:
        ring_id = f"RING_{ring_count:03d}"
        rings.append({
            "ring_id": ring_id,
            "member_accounts": cycle,
            "pattern_type": "cycle",
            "risk_score": 90.0
        })
        for acc in cycle:
            suspicious_patterns[acc].append("cycle_length_" + str(len(cycle)))
        ring_count += 1

    # process shell chains
    for chain in shell_chains:
        ring_id = f"RING_{ring_count:03d}"
        rings.append({
            "ring_id": ring_id,
            "member_accounts": chain,
            "pattern_type": "layering",
            "risk_score": 85.0
        })
        for acc in chain:
            suspicious_patterns[acc].append("layering")
        ring_count += 1

    # process smurfing
    for acc in smurfing_accounts:
        suspicious_patterns[acc].append("smurfing")

    suspicious_accounts = calculate_scores(suspicious_patterns, rings, df)

    graph_data = {
        "nodes": [{"id": n} for n in G.nodes()],
        "edges": [{"source": u, "target": v} for u, v in G.edges()],
    }

    summary = {
        "total_accounts_analyzed": len(G.nodes()),
        "suspicious_accounts_flagged": len(suspicious_accounts),
        "fraud_rings_detected": len(rings),
        "processing_time_seconds": 0
    }

    result = {
        "suspicious_accounts": suspicious_accounts,
        "fraud_rings": rings,
        "summary": summary
    }

    return result, graph_data
