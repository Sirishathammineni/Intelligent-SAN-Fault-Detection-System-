
from flask import Blueprint, jsonify, request

from app import db
from app.models.storage_node import StorageNode
from app.models.node_metrics import NodeMetrics
from app.services.monitoring_service import collect_all_metrics

monitoring_bp = Blueprint(
    "monitoring",
    __name__,
    url_prefix="/api/monitoring"
)


@monitoring_bp.route("/collect", methods=["POST"])
def collect_metrics():
    try:
        results = collect_all_metrics()

        return jsonify({
            "status": "success",
            "message": "Monitoring metrics collected",
            "count": len(results),
            "metrics": results
        }), 200

    except Exception:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Unable to collect monitoring metrics"
        }), 500


@monitoring_bp.route("/status", methods=["GET"])
def get_monitoring_status():
    nodes = StorageNode.query.all()

    return jsonify({
        "status": "success",
        "total_nodes": len(nodes),
        "healthy_nodes": sum(
            n.health_status == "Healthy" for n in nodes
        ),
        "warning_nodes": sum(
            n.health_status == "Warning" for n in nodes
        ),
        "critical_nodes": sum(
            n.health_status == "Critical" for n in nodes
        ),
        "offline_nodes": sum(
            n.connection_status != "Online" for n in nodes
        )
    }), 200


@monitoring_bp.route("/metrics", methods=["GET"])
def get_metrics():
    node_id = request.args.get("node_id", type=int)

    query = NodeMetrics.query

    if node_id is not None:
        query = query.filter_by(node_id=node_id)

    records = query.order_by(
        NodeMetrics.recorded_at.desc()
    ).limit(100).all()

    return jsonify({
        "status": "success",
        "count": len(records),
        "metrics": [
            {
                "node_id": m.node_id,
                "cpu_usage": m.cpu_usage,
                "memory_usage": m.memory_usage,
                "disk_utilization": m.disk_utilization,
                "read_iops": m.read_iops,
                "write_iops": m.write_iops,
                "latency_ms": m.latency_ms,
                "throughput_mbps": m.throughput_mbps,
                "health_status": m.health_status,
                "recorded_at": (
                    m.recorded_at.isoformat()
                    if m.recorded_at else None
                )
            }
            for m in records
        ]
    }), 200
