from flask import Blueprint

# Vehicles Blueprint
vehicles_bp = Blueprint(
    "vehicles",
    __name__,
    url_prefix="/api/vehicles"
)

# Import routes after blueprint creation
from app.vehicles import routes
