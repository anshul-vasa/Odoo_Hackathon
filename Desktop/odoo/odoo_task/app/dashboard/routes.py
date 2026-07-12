from flask import jsonify
from flask_jwt_extended import jwt_required

from app.dashboard import dashboard_bp
from app.dashboard.service import DashboardService
from app.auth.permissions import role_required


# ----------------------------------------------------
# Dashboard Summary
# ----------------------------------------------------
@dashboard_bp.route("/summary", methods=["GET"])
@jwt_required()
@role_required(
    "Admin",
    "Fleet Manager",
    "Financial Analyst"
)
def dashboard_summary():

    data = DashboardService.get_dashboard_summary()

    return jsonify({
        "success": True,
        "message": "Dashboard summary fetched successfully.",
        "data": data
    }), 200


# ----------------------------------------------------
# Fleet Utilization
# ----------------------------------------------------
@dashboard_bp.route("/fleet-utilization", methods=["GET"])
@jwt_required()
@role_required(
    "Admin",
    "Fleet Manager",
    "Financial Analyst"
)
def fleet_utilization():

    data = DashboardService.get_dashboard_summary()

    return jsonify({
        "success": True,
        "fleet_utilization": data["fleet_utilization"]
    }), 200


# ----------------------------------------------------
# Vehicle Statistics
# ----------------------------------------------------
@dashboard_bp.route("/vehicle-status", methods=["GET"])
@jwt_required()
@role_required(
    "Admin",
    "Fleet Manager"
)
def vehicle_status():

    data = DashboardService.get_dashboard_summary()

    return jsonify({
        "success": True,
        "vehicles": data["vehicles"]
    }), 200


# ----------------------------------------------------
# Driver Statistics
# ----------------------------------------------------
@dashboard_bp.route("/driver-status", methods=["GET"])
@jwt_required()
@role_required(
    "Admin",
    "Fleet Manager"
)
def driver_status():

    data = DashboardService.get_dashboard_summary()

    return jsonify({
        "success": True,
        "drivers": data["drivers"]
    }), 200


# ----------------------------------------------------
# Trip Statistics
# ----------------------------------------------------
@dashboard_bp.route("/trip-summary", methods=["GET"])
@jwt_required()
@role_required(
    "Admin",
    "Fleet Manager",
    "Dispatcher"
)
def trip_summary():

    data = DashboardService.get_dashboard_summary()

    return jsonify({
        "success": True,
        "trips": data["trips"]
    }), 200


# ----------------------------------------------------
# Maintenance Statistics
# ----------------------------------------------------
@dashboard_bp.route("/maintenance-summary", methods=["GET"])
@jwt_required()
@role_required(
    "Admin",
    "Fleet Manager"
)
def maintenance_summary():

    data = DashboardService.get_dashboard_summary()

    return jsonify({
        "success": True,
        "maintenance": data["maintenance"]
    }), 200


# ----------------------------------------------------
# Expense Statistics
# ----------------------------------------------------
@dashboard_bp.route("/expense-summary", methods=["GET"])
@jwt_required()
@role_required(
    "Admin",
    "Financial Analyst"
)
def expense_summary():

    data = DashboardService.get_dashboard_summary()

    return jsonify({
        "success": True,
        "expenses": data["expenses"]
    }), 200