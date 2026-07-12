from flask import Blueprint

# Dashboard Blueprint
dashboard_bp = Blueprint(
    "dashboard",
    __name__,
    url_prefix="/api/dashboard"
)

# Import routes after blueprint creation
from app.dashboard import routes