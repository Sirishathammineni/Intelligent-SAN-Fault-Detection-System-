
from app import db
from app.models.storage_node import StorageNode
from app.models.node_metrics import NodeMetrics
from app.models.prediction import Prediction


def calculate_risk_score(metrics):
    if not metrics:
        return 0, "Insufficient historical data"

    latest = metrics[0]

    # Normalize individual metrics to a 0-100 scale
    cpu_score = latest.cpu_usage
    memory_score = latest.memory_usage
    disk_score = latest.disk_utilization

    latency_score = min(
        (latest.latency_ms / 100) * 100, 100
    )

    # Analyze recent latency trend
    trend_score = 0

    if len(metrics) >= 2:
        previous = metrics[1]

        if latest.latency_ms > previous.latency_ms:
            trend_score = min(
                (latest.latency_ms - previous.latency_ms) * 2,
                100
            )

    # Weighted risk calculation
    risk_score = (
        cpu_score * 0.25 +
        memory_score * 0.20 +
        disk_score * 0.25 +
        latency_score * 0.20 +
        trend_score * 0.10
    )

    risk_score = round(min(max(risk_score, 0), 100), 2)

    explanation = (
        f"CPU: {cpu_score}%, "
        f"Memory: {memory_score}%, "
        f"Disk: {disk_score}%, "
        f"Latency: {latest.latency_ms} ms, "
        f"Latency trend score: {trend_score}"
    )

    return risk_score, explanation


def predict_node_risk(node):
    metrics = (
        NodeMetrics.query
        .filter_by(node_id=node.id)
        .order_by(NodeMetrics.recorded_at.desc())
        .limit(10)
        .all()
    )

    if not metrics:
        return None

    risk_score, explanation = calculate_risk_score(metrics)

    if risk_score >= 60:
        risk_level = "High"
        predicted_fault = "Potential SAN performance failure"

    elif risk_score >= 30:
        risk_level = "Medium"
        predicted_fault = "Potential SAN performance degradation"

    else:
        risk_level = "Low"
        predicted_fault = "No significant performance risk detected"

    prediction = Prediction(
        node_id=node.id,
        risk_score=risk_score,
        risk_level=risk_level,
        predicted_fault=predicted_fault,
        explanation=explanation
    )

    db.session.add(prediction)

    return prediction


def run_predictions():
    nodes = StorageNode.query.all()
    results = []

    for node in nodes:
        prediction = predict_node_risk(node)

        if prediction:
            results.append({
                "node_id": node.id,
                "node_name": node.node_name,
                "risk_score": prediction.risk_score,
                "risk_level": prediction.risk_level,
                "predicted_fault": prediction.predicted_fault,
                "explanation": prediction.explanation
            })

    db.session.commit()

    return results
