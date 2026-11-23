
from flask import Flask, app
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

db = SQLAlchemy()
socketio = SocketIO()


def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object("config.Config")

    # Initialize extensions
    db.init_app(app)
    CORS(app)

    socketio.init_app(
        app,
        cors_allowed_origins="*",
        async_mode="threading"
    )

    # Register API routes

    from app.routes.node_routes import node_bp
    app.register_blueprint(node_bp)

    from app.routes.monitoring_routes import monitoring_bp
    app.register_blueprint(monitoring_bp)

    from app.routes.fault_routes import fault_bp
    app.register_blueprint(fault_bp)

    from app.routes.prediction_routes import prediction_bp
    app.register_blueprint(prediction_bp)

    from app.routes.recovery_routes import recovery_bp
    app.register_blueprint(recovery_bp)

    # Backend health check
    @app.route("/api/health")
    def health():
        return {
            "status": "success",
            "message": "SAN Guardian backend is running"
        }

    # Register database models and create tables
    # Register database models and create tables
    with app.app_context():
        from app.models import (
            StorageNode,
            NodeMetrics,
            Fault,
            Prediction,
            Recovery
        )
        db.create_all()

    return app
