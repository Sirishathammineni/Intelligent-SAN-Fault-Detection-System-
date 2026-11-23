
from flask import Blueprint, request, jsonify
from app import db
from app.models.storage_node import StorageNode

node_bp = Blueprint("nodes", __name__, url_prefix="/api/nodes")


# GET: Retrieve all storage nodes
@node_bp.route("/", methods=["GET"])
def get_nodes():
    nodes = StorageNode.query.all()

    return jsonify({
        "status": "success",
        "count": len(nodes),
        "nodes": [node.to_dict() for node in nodes]
    }), 200


# POST: Create a new storage node
@node_bp.route("/", methods=["POST"])
def create_node():
    data = request.get_json(silent=True) or {}

    required_fields = [
        "node_name",
        "ip_address",
        "total_capacity_gb"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "status": "error",
                "message": f"{field} is required"
            }), 400

    try:
        capacity = float(data["total_capacity_gb"])

        if capacity <= 0:
            raise ValueError()

    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Capacity must be a positive number"
        }), 400

    if StorageNode.query.filter_by(
        node_name=data["node_name"]
    ).first():
        return jsonify({
            "status": "error",
            "message": "Node name already exists"
        }), 409

    node = StorageNode(
        node_name=data["node_name"],
        ip_address=data["ip_address"],
        total_capacity_gb=capacity
    )

    db.session.add(node)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Storage node created successfully",
        "node": node.to_dict()
    }), 201


# GET: Retrieve a particular storage node
@node_bp.route("/<int:node_id>", methods=["GET"])
def get_node(node_id):
    node = db.session.get(StorageNode, node_id)

    if not node:
        return jsonify({
            "status": "error",
            "message": "Storage node not found"
        }), 404

    return jsonify({
        "status": "success",
        "node": node.to_dict()
    }), 200


# PUT: Update storage node details
@node_bp.route("/<int:node_id>", methods=["PUT"])
def update_node(node_id):
    node = db.session.get(StorageNode, node_id)

    if not node:
        return jsonify({
            "status": "error",
            "message": "Storage node not found"
        }), 404

    data = request.get_json(silent=True) or {}

    if "ip_address" in data:
        node.ip_address = data["ip_address"]

    if "total_capacity_gb" in data:
        try:
            capacity = float(data["total_capacity_gb"])

            if capacity <= 0 or capacity < node.used_capacity_gb:
                raise ValueError()

            node.total_capacity_gb = capacity

        except (ValueError, TypeError):
            db.session.rollback()
            return jsonify({
                "status": "error",
                "message": "Invalid capacity. It must be positive and cannot be less than used capacity."
            }), 400

    # Update used storage capacity
    if "used_capacity_gb" in data:
        try:
            used_capacity = float(data["used_capacity_gb"])

            if (
                used_capacity < 0
                or used_capacity > node.total_capacity_gb
            ):
                raise ValueError()

            node.used_capacity_gb = used_capacity

        except (ValueError, TypeError):
            db.session.rollback()
            return jsonify({
                "status": "error",
                "message": "Used capacity must be between 0 and total capacity."
            }), 400

    # Update connection status
    if "connection_status" in data:
        if data["connection_status"] not in ["Online", "Offline"]:
            return jsonify({
                "status": "error",
                "message": "Invalid connection status"
            }), 400

        node.connection_status = data["connection_status"]

    # Update health status
    if "health_status" in data:
        if data["health_status"] not in [
            "Healthy", "Warning", "Critical"
        ]:
            return jsonify({
                "status": "error",
                "message": "Invalid health status"
            }), 400

        node.health_status = data["health_status"]

    try:
        db.session.commit()

    except Exception:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Unable to update storage node"
        }), 500

    return jsonify({
        "status": "success",
        "message": "Storage node updated successfully",
        "node": node.to_dict()
    }), 200


# DELETE: Delete a storage node
@node_bp.route("/<int:node_id>", methods=["DELETE"])
def delete_node(node_id):
    node = db.session.get(StorageNode, node_id)

    if not node:
        return jsonify({
            "status": "error",
            "message": "Storage node not found"
        }), 404

    db.session.delete(node)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Storage node deleted successfully"
    }), 200
