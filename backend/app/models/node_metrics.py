
from datetime import datetime, timezone
from app import db


class NodeMetrics(db.Model):
    __tablename__ = "node_metrics"

    id = db.Column(db.Integer, primary_key=True)

    node_id = db.Column(
        db.Integer,
        db.ForeignKey("storage_nodes.id"),
        nullable=False
    )

    cpu_usage = db.Column(db.Float, nullable=False)
    memory_usage = db.Column(db.Float, nullable=False)
    disk_utilization = db.Column(db.Float, nullable=False)

    read_iops = db.Column(db.Integer, nullable=False)
    write_iops = db.Column(db.Integer, nullable=False)

    latency_ms = db.Column(db.Float, nullable=False)
    throughput_mbps = db.Column(db.Float, nullable=False)

    health_status = db.Column(db.String(20), nullable=False)

    recorded_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
