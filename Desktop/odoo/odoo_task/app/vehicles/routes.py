from flask import Blueprint, request, jsonify

from app.vehicles.service import (
    create_vehicle,
    get_all_vehicles,
    get_vehicle_by_id,
    update_vehicle,
    delete_vehicle
)

from app.vehicles.schemas import vehicle_schema, vehicles_schema


vehicles_bp = Blueprint(
    "vehicles",
    __name__,
    url_prefix="/api/vehicles"
)


@vehicles_bp.route("", methods=["POST"])
def add_vehicle():
    """
    Create a new vehicle.
    """

    data = request.get_json()

    vehicle = create_vehicle(data)

    return jsonify({
        "success": True,
        "message": "Vehicle created successfully",
        "data": vehicle.to_dict()
    }), 201



@vehicles_bp.route("", methods=["GET"])
def list_vehicles():
    """
    Get all vehicles.
    """

    vehicles = get_all_vehicles()

    return jsonify({
        "success": True,
        "count": len(vehicles),
        "data": [
            vehicle.to_dict()
            for vehicle in vehicles
        ]
    }), 200



@vehicles_bp.route("/<int:vehicle_id>", methods=["GET"])
def get_vehicle(vehicle_id):
    """
    Get vehicle by ID.
    """

    vehicle = get_vehicle_by_id(vehicle_id)

    if not vehicle:
        return jsonify({
            "success": False,
            "message": "Vehicle not found"
        }), 404


    return jsonify({
        "success": True,
        "data": vehicle.to_dict()
    }), 200



@vehicles_bp.route("/<int:vehicle_id>", methods=["PUT"])
def edit_vehicle(vehicle_id):
    """
    Update vehicle details.
    """

    data = request.get_json()

    vehicle = update_vehicle(
        vehicle_id,
        data
    )

    if not vehicle:
        return jsonify({
            "success": False,
            "message": "Vehicle not found"
        }), 404


    return jsonify({
        "success": True,
        "message": "Vehicle updated successfully",
        "data": vehicle.to_dict()
    }), 200



@vehicles_bp.route("/<int:vehicle_id>", methods=["DELETE"])
def remove_vehicle(vehicle_id):
    """
    Delete vehicle.
    """

    deleted = delete_vehicle(vehicle_id)


    if not deleted:
        return jsonify({
            "success": False,
            "message": "Vehicle not found"
        }), 404


    return jsonify({
        "success": True,
        "message": "Vehicle deleted successfully"
    }), 200