import os

from flask import Flask

from app.config import config
from app.extensions import init_extensions

# Blueprints
from app.auth import auth_bp
from app.dashboard import dashboard_bp

from app.vehicles.routes import vehicles_bp
app.register_blueprint(vehicles_bp)

# (These imports will work after you create these modules)
# from app.vehicles import vehicles_bp
# from app.drivers import drivers_bp
# from app.trips import trips_bp
# from app.maintenance import maintenance_bp
# from app.fuel import fuel_bp
# from app.expenses import expenses_bp


def create_app(config_name="default"):
    """
    Application Factory
    """

    app = Flask(__name__)

    # -----------------------------
    # Load Configuration
    # -----------------------------
    app.config.from_object(
        config[config_name]
    )

    # -----------------------------
    # Ensure Upload Folder Exists
    # -----------------------------
    os.makedirs(
        app.config["UPLOAD_FOLDER"],
        exist_ok=True
    )

    # -----------------------------
    # Initialize Extensions
    # -----------------------------
    init_extensions(app)

    # -----------------------------
    # Register Blueprints
    # -----------------------------
    app.register_blueprint(auth_bp)

    app.register_blueprint(dashboard_bp)

    # Register these after creating them

    app.register_blueprint(vehicles_bp)

    # app.register_blueprint(drivers_bp)

    # app.register_blueprint(trips_bp)

    # app.register_blueprint(maintenance_bp)

    # app.register_blueprint(fuel_bp)

    # app.register_blueprint(expenses_bp)

    # -----------------------------
    # Health Check
    # -----------------------------
    @app.route("/")
    def home():
        return {
            "success": True,
            "application": "TransitOps",
            "version": app.config["APP_VERSION"],
            "message": "TransitOps API is running successfully."
        }, 200

    @app.route("/health")
    def health():
        return {
            "status": "Healthy"
        }, 200

    return app