
from datetime import datetime, timezone

from app import db
from app.models.storage_node import StorageNode
from app.models.recovery import Recovery


def find_healthy_target(source_node, transfer_size):
    nodes = StorageNode.query.filter(
        StorageNode.id != source_node.id,
        StorageNode.connection_status == "Online",
        StorageNode.health_status == "Healthy"
    ).all()

    # Only select nodes with sufficient free capacity
    suitable_nodes = [
        node for node in nodes
        if node.available_capacity_gb >= transfer_size
    ]

    if not suitable_nodes:
        return None

    return max(
        suitable_nodes,
        key=lambda node: node.available_capacity_gb
    )


def perform_recovery(source_node_id):

    source_node = db.session.get(
        StorageNode, source_node_id
    )

    if not source_node:
        return {
            "status": "error",
            "message": "Source storage node not found"
        }

    # Prevent recovery of an offline node
    if source_node.connection_status != "Online":
        return {
            "status": "error",
            "message": "Source node is already offline"
        }

    # Prevent duplicate active recovery
    active_recovery = Recovery.query.filter(
        Recovery.source_node_id == source_node_id,
        Recovery.status.in_(["Pending", "In Progress"])
    ).first()

    if active_recovery:
        return {
            "status": "error",
            "message": "An active recovery already exists"
        }

    transfer_size = source_node.used_capacity_gb

    # Find a suitable healthy destination
    target_node = find_healthy_target(
        source_node, transfer_size
    )

    if not target_node:
        return {
            "status": "error",
            "message": "No healthy target has sufficient capacity"
        }

    recovery = Recovery(
        source_node_id=source_node.id,
        target_node_id=target_node.id,
        recovery_type="Simulated Failover",
        description=(
            f"Workload redistribution from "
            f"{source_node.node_name} to {target_node.node_name}"
        ),
        status="In Progress",
        workload_transferred_gb=0
    )

    try:
        db.session.add(recovery)
        db.session.flush()

        # Simulate workload redistribution
        target_node.used_capacity_gb += transfer_size
        source_node.used_capacity_gb = 0

        # Mark source node offline
        source_node.connection_status = "Offline"
        source_node.health_status = "Critical"

        recovery.workload_transferred_gb = transfer_size
        recovery.status = "Completed"
        recovery.completed_at = datetime.now(timezone.utc)

        db.session.commit()

        return {
            "status": "success",
            "message": "Simulated recovery completed successfully",
            "recovery": recovery.to_dict(),
            "source_node": source_node.node_name,
            "target_node": target_node.node_name
        }

    except Exception as error:
        db.session.rollback()

        # Record the failed recovery attempt
        try:
            failed_recovery = Recovery(
                source_node_id=source_node_id,
                target_node_id=target_node.id,
                recovery_type="Simulated Failover",
                description=f"Recovery failed: {str(error)}",
                status="Failed",
                workload_transferred_gb=0
            )

            db.session.add(failed_recovery)
            db.session.commit()

        except Exception:
            db.session.rollback()

        return {
            "status": "error",
            "message": "Recovery failed and changes were rolled back"
        }


def get_recovery_history():

    recoveries = (
        Recovery.query
        .order_by(Recovery.started_at.desc())
        .all()
    )

    return [
        recovery.to_dict()
        for recovery in recoveries
    ]
