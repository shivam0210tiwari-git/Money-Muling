def calculate_scores(patterns, rings, df):
    scores = []

    ring_lookup = {}
    for ring in rings:
        for acc in ring["member_accounts"]:
            ring_lookup[acc] = ring["ring_id"]

    for account, pats in patterns.items():
        score = 0

        if any("cycle" in p for p in pats):
            score += 40
        if "smurfing" in pats:
            score += 25
        if "layering" in pats:
            score += 20
        if len(pats) > 1:
            score += 15

        score = min(100, score)

        scores.append({
            "account_id": account,
            "suspicion_score": float(score),
            "detected_patterns": pats,
            "ring_id": ring_lookup.get(account, "N/A")
        })

    scores.sort(key=lambda x: x["suspicion_score"], reverse=True)
    return scores
