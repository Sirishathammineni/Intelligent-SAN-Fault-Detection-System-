
from datetime import datetime, timezone
from app import db


class StorageNode(db.Model):
    __tablename__ = "storage_nodes"

    id = db.Column(db.Integer, primary_key=True)

    node_name = db.Column(
        db.String(100), unique=True, nullable=False
    )

    ip_address = db.Column(
        db.String(45), nullable=False
    )

    total_capacity_gb = db.Column(
        db.Float, nullable=False
    )

    used_capacity_gb = db.Column(
        db.Float, default=0.0, nullable=False
    )

    read_iops = db.Column(db.Integer, default=0)
    write_iops = db.Column(db.Integer, default=0)

    latency_ms = db.Column(db.Float, default=0.0)

    cpu_usage = db.Column(db.Float, default=0.0)
    memory_usage = db.Column(db.Float, default=0.0)

    health_status = db.Column(
        db.String(20), default="Healthy"
    )

    connection_status = db.Column(
        db.String(20), default="Online"
    )

    last_heartbeat = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    @property
    def available_capacity_gb(self):
        return max(
            0.0,
            self.total_capacity_gb - self.used_capacity_gb
        )

    def to_dict(self):
        return {
            "id": self.id,
            "node_name": self.node_name,
            "ip_address": self.ip_address,
            "total_capacity_gb": self.total_capacity_gb,
            "used_capacity_gb": self.used_capacity_gb,
            "available_capacity_gb": self.available_capacity_gb,
            "read_iops": self.read_iops,
            "write_iops": self.write_iops,
            "latency_ms": self.latency_ms,
            "cpu_usage": self.cpu_usage,
            "memory_usage": self.memory_usage,
            "health_status": self.health_status,
            "connection_status": self.connection_status,
            "last_heartbeat": (
                self.last_heartbeat.isoformat()
                if self.last_heartbeat else None
            )
        }

    def __repr__(self):
        return f"<StorageNode {self.node_name}>"
