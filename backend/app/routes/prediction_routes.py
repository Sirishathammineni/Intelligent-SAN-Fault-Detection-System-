
from flask import Blueprint, jsonify
from app import db
from app.models.prediction import Prediction
from app.services.prediction_service import run_predictions

prediction_bp = Blueprint(
    "prediction",
    __name__,
    url_prefix="/api/predictions"
)


@prediction_bp.route("/run", methods=["POST"])
def run_prediction_api():
    try:
        results = run_predictions()

        return jsonify({
            "status": "success",
            "message": "Risk prediction completed successfully",
            "nodes_analyzed": len(results),
            "predictions": results
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@prediction_bp.route("/", methods=["GET"])
def get_predictions():
    predictions = (
        Prediction.query
        .order_by(Prediction.predicted_at.desc())
        .all()
    )

    return jsonify({
        "status": "success",
        "count": len(predictions),
        "predictions": [
            prediction.to_dict()
            for prediction in predictions
        ]
    }), 200


@prediction_bp.route("/summary", methods=["GET"])
def prediction_summary():
    predictions = (
        Prediction.query
        .order_by(Prediction.predicted_at.desc())
        .all()
    )

    latest_by_node = {}

    for prediction in predictions:
        if prediction.node_id not in latest_by_node:
            latest_by_node[prediction.node_id] = prediction

    latest = list(latest_by_node.values())

    return jsonify({
        "status": "success",
        "nodes_analyzed": len(latest),
        "high_risk": sum(
            1 for p in latest if p.risk_level == "High"
        ),
        "medium_risk": sum(
            1 for p in latest if p.risk_level == "Medium"
        ),
        "low_risk": sum(
            1 for p in latest if p.risk_level == "Low"
        )
    }), 200
