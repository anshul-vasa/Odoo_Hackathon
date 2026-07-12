"""
Flask Extensions

Initialize all third-party Flask extensions here.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_cors import CORS

# ----------------------------------------
# Database
# ----------------------------------------

db = SQLAlchemy()

# ----------------------------------------
# Database Migration
# ----------------------------------------

migrate = Migrate()

# ----------------------------------------
# JWT Authentication
# ----------------------------------------

jwt = JWTManager()

# ----------------------------------------
# Marshmallow
# ----------------------------------------

ma = Marshmallow()

# ----------------------------------------
# CORS
# ----------------------------------------

cors = CORS()


def init_extensions(app):
    """
    Initialize all Flask extensions
    """

    db.init_app(app)

    migrate.init_app(
        app,
        db
    )

    jwt.init_app(app)

    ma.init_app(app)

    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": "*"
            }
        }
    )

    return app