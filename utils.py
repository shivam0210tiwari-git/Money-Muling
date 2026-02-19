def within_72_hours(group):
    if len(group) < 2:
        return False
    diff = group["timestamp"].max() - group["timestamp"].min()
    return diff.total_seconds() <= 259200
