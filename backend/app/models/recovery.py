
from datetime import datetime, timezone
from app import db


class Recovery(db.Model):
    __tablename__ = "recoveries"

    id = db.Column(db.Integer, primary_key=True)

    source_node_id = db.Column(
        db.Integer,
        db.ForeignKey("storage_nodes.id"),
        nullable=False
    )

    target_node_id = db.Column(
        db.Integer,
        db.ForeignKey("storage_nodes.id"),
        nullable=True
    )

    recovery_type = db.Column(
        db.String(100),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=False
    )

    status = db.Column(
        db.String(30),
        default="Pending",
        nullable=False
    )

    workload_transferred_gb = db.Column(
        db.Float,
        default=0.0
    )

    started_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    completed_at = db.Column(
        db.DateTime,
        nullable=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "source_node_id": self.source_node_id,
            "target_node_id": self.target_node_id,
            "recovery_type": self.recovery_type,
            "description": self.description,
            "status": self.status,
            "workload_transferred_gb": self.workload_transferred_gb,
            "started_at": (
                self.started_at.isoformat()
                if self.started_at else None
            ),
            "completed_at": (
                self.completed_at.isoformat()
                if self.completed_at else None
            )
        }
