
from flask import Blueprint, jsonify, request

from app import db
from app.recovery.recovery_service import (
    perform_recovery,
    get_recovery_history
)

recovery_bp = Blueprint(
    "recovery",
    __name__,
    url_prefix="/api/recovery"
)


@recovery_bp.route("/execute/<int:node_id>", methods=["POST"])
def execute_recovery(node_id):
    try:
        result = perform_recovery(node_id)

        if result.get("status") == "error":
            return jsonify(result), 400

        return jsonify(result), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@recovery_bp.route("/history", methods=["GET"])
def recovery_history():
    return jsonify({
        "status": "success",
        "count": len(get_recovery_history()),
        "recoveries": get_recovery_history()
    }), 200
