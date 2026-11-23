from datetime import datetime, timezone
from app import db


class Fault(db.Model):
    __tablename__ = "faults"

    id = db.Column(db.Integer, primary_key=True)

    node_id = db.Column(
        db.Integer,
        db.ForeignKey("storage_nodes.id"),
        nullable=False
    )

    fault_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)

    severity = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default="Open")

    detected_value = db.Column(db.Float)
    threshold_value = db.Column(db.Float)

    detected_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "node_id": self.node_id,
            "fault_type": self.fault_type,
            "description": self.description,
            "severity": self.severity,
            "status": self.status,
            "detected_value": self.detected_value,
            "threshold_value": self.threshold_value,
            "detected_at": (
                self.detected_at.isoformat()
                if self.detected_at else None
            )
        }