from flask import Blueprint, request, jsonify

from app.drivers.service import (
    create_driver,
    get_all_drivers,
    get_driver_by_id,
    update_driver,
    delete_driver,
    get_available_drivers,
    search_drivers
)


drivers_bp = Blueprint(
    "drivers",
    __name__,
    url_prefix="/api/drivers"
)


@drivers_bp.route(
    "",
    methods=["POST"]
)
def add_driver():
    """
    Create new driver.
    """

    data = request.get_json()

    try:
        driver = create_driver(
            data
        )

        return jsonify({
            "success": True,
            "message": "Driver created successfully",
            "data": driver.to_dict()
        }), 201


    except ValueError as error:

        return jsonify({
            "success": False,
            "message": str(error)
        }), 400



@drivers_bp.route(
    "",
    methods=["GET"]
)
def list_drivers():
    """
    Get all drivers.
    """

    drivers = get_all_drivers()

    return jsonify({
        "success": True,
        "count": len(drivers),
        "data": [
            driver.to_dict()
            for driver in drivers
        ]
    }), 200



@drivers_bp.route(
    "/<int:driver_id>",
    methods=["GET"]
)
def get_driver(driver_id):
    """
    Get driver by ID.
    """

    driver = get_driver_by_id(
        driver_id
    )

    if not driver:
        return jsonify({
            "success": False,
            "message": "Driver not found"
        }), 404


    return jsonify({
        "success": True,
        "data": driver.to_dict()
    }), 200



@drivers_bp.route(
    "/<int:driver_id>",
    methods=["PUT"]
)
def edit_driver(driver_id):
    """
    Update driver details.
    """

    data = request.get_json()


    try:

        driver = update_driver(
            driver_id,
            data
        )


        if not driver:
            return jsonify({
                "success": False,
                "message": "Driver not found"
            }), 404


        return jsonify({
            "success": True,
            "message": "Driver updated successfully",
            "data": driver.to_dict()
        }), 200


    except ValueError as error:

        return jsonify({
            "success": False,
            "message": str(error)
        }), 400



@drivers_bp.route(
    "/<int:driver_id>",
    methods=["DELETE"]
)
def remove_driver(driver_id):
    """
    Deactivate driver.
    """

    result = delete_driver(
        driver_id
    )


    if not result:
        return jsonify({
            "success": False,
            "message": "Driver not found"
        }), 404


    return jsonify({
        "success": True,
        "message": "Driver deactivated successfully"
    }), 200



@drivers_bp.route(
    "/available",
    methods=["GET"]
)
def available_drivers():
    """
    Get available drivers.
    """

    drivers = get_available_drivers()


    return jsonify({
        "success": True,
        "count": len(drivers),
        "data": [
            driver.to_dict()
            for driver in drivers
        ]
    }), 200



@drivers_bp.route(
    "/search",
    methods=["GET"]
)
def search_driver():

    """
    Search drivers.

    Example:
    /api/drivers/search?keyword=Raj
    """

    keyword = request.args.get(
        "keyword"
    )


    if not keyword:
        return jsonify({
            "success": False,
            "message": "Search keyword required"
        }), 400


    drivers = search_drivers(
        keyword
    )


    return jsonify({
        "success": True,
        "count": len(drivers),
        "data": [
            driver.to_dict()
            for driver in drivers
        ]
    }), 200