
from app import db
from app.models.storage_node import StorageNode
from app.models.node_metrics import NodeMetrics
from app.models.fault import Fault


THRESHOLDS = {
    "cpu_usage": {
        "warning": 80,
        "critical": 95
    },
    "memory_usage": {
        "warning": 80,
        "critical": 95
    },
    "disk_utilization": {
        "warning": 80,
        "critical": 90
    },
    "latency_ms": {
        "warning": 50,
        "critical": 100
    }
}


def detect_node_faults(node, metric):
    detected_faults = []

    checks = [
        ("cpu_usage", metric.cpu_usage, "CPU utilization"),
        ("memory_usage", metric.memory_usage, "Memory utilization"),
        ("disk_utilization", metric.disk_utilization, "Disk utilization"),
        ("latency_ms", metric.latency_ms, "Storage latency")
    ]

    for fault_type, value, description in checks:
        limits = THRESHOLDS[fault_type]

        if value >= limits["critical"]:
            severity = "Critical"
            threshold = limits["critical"]

        elif value >= limits["warning"]:
            severity = "Warning"
            threshold = limits["warning"]

        else:
            continue

        existing_fault = Fault.query.filter_by(
            node_id=node.id,
            fault_type=fault_type,
            status="Open"
        ).first()

        if existing_fault:
            existing_fault.severity = severity
            existing_fault.detected_value = value
            existing_fault.threshold_value = threshold
            existing_fault.description = (
                f"{description} exceeded the {severity} threshold."
            )
            fault = existing_fault

        else:
            fault = Fault(
                node_id=node.id,
                fault_type=fault_type,
                description=(
                    f"{description} exceeded the {severity} threshold."
                ),
                severity=severity,
                status="Open",
                detected_value=value,
                threshold_value=threshold
            )

            db.session.add(fault)

        detected_faults.append(fault)

    return detected_faults


def run_fault_detection():
    nodes = StorageNode.query.all()
    results = []

    for node in nodes:
        latest_metric = (
            NodeMetrics.query
            .filter_by(node_id=node.id)
            .order_by(NodeMetrics.recorded_at.desc())
            .first()
        )

        if not latest_metric:
            continue

        faults = detect_node_faults(node, latest_metric)

        results.append({
            "node_id": node.id,
            "node_name": node.node_name,
            "detected_faults": len(faults),
            "faults": [
                {
                    "fault_type": fault.fault_type,
                    "severity": fault.severity,
                    "detected_value": fault.detected_value,
                    "threshold_value": fault.threshold_value
                }
                for fault in faults
            ]
        })

    db.session.commit()

    return results
