
from flask import Blueprint, jsonify
from app import db
from app.models.fault import Fault
from app.services.fault_detection_service import run_fault_detection

fault_bp = Blueprint("fault", __name__, url_prefix="/api/faults")


@fault_bp.route("/detect", methods=["POST"])
def detect_faults():
    try:
        results = run_fault_detection()

        return jsonify({
            "status": "success",
            "message": "Fault detection completed successfully",
            "nodes_checked": len(results),
            "results": results
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@fault_bp.route("/", methods=["GET"])
def get_faults():
    faults = (
        Fault.query
        .order_by(Fault.detected_at.desc())
        .all()
    )

    return jsonify({
        "status": "success",
        "count": len(faults),
        "faults": [fault.to_dict() for fault in faults]
    }), 200


@fault_bp.route("/summary", methods=["GET"])
def fault_summary():
    open_faults = Fault.query.filter_by(status="Open").all()

    return jsonify({
        "status": "success",
        "total_open_faults": len(open_faults),
        "critical_faults": sum(
            1 for f in open_faults if f.severity == "Critical"
        ),
        "warning_faults": sum(
            1 for f in open_faults if f.severity == "Warning"
        )
    }), 200
