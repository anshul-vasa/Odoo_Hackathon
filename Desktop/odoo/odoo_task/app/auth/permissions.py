from functools import wraps

from flask import jsonify

from flask_jwt_extended import (
    verify_jwt_in_request,
    get_jwt_identity
)

from app.models.user import User


def role_required(*allowed_roles):
    """
    Role-Based Access Control (RBAC) Decorator

    Example:
        @jwt_required()
        @role_required("Admin")

        @jwt_required()
        @role_required("Admin", "Fleet Manager")
    """

    def decorator(func):

        @wraps(func)
        def wrapper(*args, **kwargs):

            # Verify JWT Token
            verify_jwt_in_request()

            # Logged-in User ID
            user_id = get_jwt_identity()

            # Fetch User
            user = User.query.get(user_id)

            if not user:
                return jsonify({
                    "success": False,
                    "message": "User not found."
                }), 404

            # User Role
            user_role = user.role.name

            # Check Permission
            if user_role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "message": "You are not authorized to access this resource."
                }), 403

            return func(*args, **kwargs)

        return wrapper

    return decorator