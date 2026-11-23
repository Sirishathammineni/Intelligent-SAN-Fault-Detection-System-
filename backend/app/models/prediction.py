
from datetime import datetime, timezone
from app import db


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)

    node_id = db.Column(
        db.Integer,
        db.ForeignKey("storage_nodes.id"),
        nullable=False
    )

    risk_score = db.Column(db.Float, nullable=False)

    risk_level = db.Column(
        db.String(20),
        nullable=False
    )

    predicted_fault = db.Column(
        db.String(100),
        nullable=False
    )

    explanation = db.Column(
        db.Text,
        nullable=False
    )

    predicted_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        return {
            "id": self.id,
            "node_id": self.node_id,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "predicted_fault": self.predicted_fault,
            "explanation": self.explanation,
            "predicted_at": (
                self.predicted_at.isoformat()
                if self.predicted_at else None
            )
        }
