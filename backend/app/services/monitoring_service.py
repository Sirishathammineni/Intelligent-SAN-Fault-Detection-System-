
import random
from datetime import datetime, timezone

from app import db
from app.models.storage_node import StorageNode
from app.models.node_metrics import NodeMetrics


def generate_node_metrics(node):
    """Generate simulated performance metrics for one SAN node."""

    cpu = round(random.uniform(20, 85), 2)
    memory = round(random.uniform(25, 80), 2)

    # Simulated storage usage
    if node.total_capacity_gb > 0:
        disk = round(
            (node.used_capacity_gb / node.total_capacity_gb) * 100,
            2
        )
    else:
        disk = 0

    # Simulated I/O performance
    read_iops = random.randint(500, 5000)
    write_iops = random.randint(300, 4000)

    latency = round(random.uniform(2, 120), 2)

    throughput = round(
        random.uniform(50, 900), 2
    )

    # Determine node health
    if disk >= 90 or latency >= 100 or cpu >= 95:
        health = "Critical"
    elif disk >= 80 or latency >= 50 or cpu >= 80:
        health = "Warning"
    else:
        health = "Healthy"

    # Update current node metrics
    node.cpu_usage = cpu
    node.memory_usage = memory
    node.read_iops = read_iops
    node.write_iops = write_iops
    node.latency_ms = latency
    node.health_status = health
    node.last_heartbeat = datetime.now(timezone.utc)

    metric = NodeMetrics(
        node_id=node.id,
        cpu_usage=cpu,
        memory_usage=memory,
        disk_utilization=disk,
        read_iops=read_iops,
        write_iops=write_iops,
        latency_ms=latency,
        throughput_mbps=throughput,
        health_status=health
    )

    db.session.add(metric)

    return metric


def collect_all_metrics():
    """Collect metrics from all online SAN nodes."""

    nodes = StorageNode.query.filter_by(
        connection_status="Online"
    ).all()

    results = []

    for node in nodes:
        metric = generate_node_metrics(node)

        results.append({
            "node_id": node.id,
            "node_name": node.node_name,
            "cpu_usage": metric.cpu_usage,
            "memory_usage": metric.memory_usage,
            "disk_utilization": metric.disk_utilization,
            "read_iops": metric.read_iops,
            "write_iops": metric.write_iops,
            "latency_ms": metric.latency_ms,
            "throughput_mbps": metric.throughput_mbps,
            "health_status": metric.health_status
        })

    db.session.commit()

    return results
