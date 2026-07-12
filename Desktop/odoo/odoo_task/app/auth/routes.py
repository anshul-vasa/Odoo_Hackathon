# app/auth/routes.py

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.auth import auth_bp
from app.auth.service import (
    register_user,
    login_user,
    get_user_profile,
    change_password
)

from app.auth.schemas import (
    RegisterSchema,
    LoginSchema,
    ChangePasswordSchema
)

register_schema = RegisterSchema()
login_schema = LoginSchema()
change_password_schema = ChangePasswordSchema()


# ---------------------------------------
# Register
# ---------------------------------------
@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    errors = register_schema.validate(data)

    if errors:
        return jsonify({
            "success": False,
            "errors": errors
        }), 400

    response = register_user(data)

    return jsonify(response), response["status_code"]


# ---------------------------------------
# Login
# ---------------------------------------
@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    errors = login_schema.validate(data)

    if errors:
        return jsonify({
            "success": False,
            "errors": errors
        }), 400

    response = login_user(data)

    return jsonify(response), response["status_code"]


# ---------------------------------------
# User Profile
# ---------------------------------------
@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    user_id = get_jwt_identity()

    response = get_user_profile(user_id)

    return jsonify(response), response["status_code"]


# ---------------------------------------
# Change Password
# ---------------------------------------
@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def update_password():

    data = request.get_json()

    errors = change_password_schema.validate(data)

    if errors:
        return jsonify({
            "success": False,
            "errors": errors
        }), 400

    user_id = get_jwt_identity()

    response = change_password(user_id, data)

    return jsonify(response), response["status_code"]