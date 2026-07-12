from flask import Blueprint

# Authentication Blueprint
auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)

# Import routes after blueprint creation
from app.auth import routes