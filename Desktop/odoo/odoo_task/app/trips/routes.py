from flask import Blueprint, jsonify, request

from app.trips.schemas import (
    trip_create_schema,
    trip_update_schema,
    trip_response_schema,
    trips_response_schema
)

from app.trips.service import (
    create_trip,
    get_all_trips,
    get_trip_by_id,
    update_trip,
    start_trip,
    mark_trip_in_progress,
    complete_trip,
    cancel_trip,
    delete_trip,
    get_active_trips,
    get_completed_trips,
    search_trips,
    get_driver_trips,
    get_vehicle_trips,
    get_trip_statistics
)


trips_bp = Blueprint(
    "trips",
    __name__,
    url_prefix="/api/trips"
)


# ==========================================================
# Create Trip
# ==========================================================

@trips_bp.route(
    "",
    methods=["POST"]
)
def add_trip():

    json_data = request.get_json()

    errors = trip_create_schema.validate(
        json_data
    )

    if errors:
        return jsonify(errors), 400

    try:

        trip = create_trip(
            json_data
        )

        return jsonify({
            "success": True,
            "message": "Trip created successfully.",
            "data": trip_response_schema.dump(
                trip
            )
        }), 201

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


# ==========================================================
# Get All Trips
# ==========================================================

@trips_bp.route(
    "",
    methods=["GET"]
)
def list_trips():

    trips = get_all_trips()

    return jsonify({
        "success": True,
        "count": len(trips),
        "data": trips_response_schema.dump(
            trips
        )
    })


# ==========================================================
# Get Trip
# ==========================================================

@trips_bp.route(
    "/<int:trip_id>",
    methods=["GET"]
)
def fetch_trip(trip_id):

    trip = get_trip_by_id(
        trip_id
    )

    if not trip:

        return jsonify({
            "success": False,
            "message": "Trip not found."
        }), 404

    return jsonify({
        "success": True,
        "data": trip_response_schema.dump(
            trip
        )
    })


# ==========================================================
# Update Trip
# ==========================================================

@trips_bp.route(
    "/<int:trip_id>",
    methods=["PUT"]
)
def edit_trip(trip_id):

    json_data = request.get_json()

    errors = trip_update_schema.validate(
        json_data
    )

    if errors:
        return jsonify(errors), 400

    try:

        trip = update_trip(
            trip_id,
            json_data
        )

        return jsonify({
            "success": True,
            "message": "Trip updated successfully.",
            "data": trip_response_schema.dump(
                trip
            )
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


# ==========================================================
# Start Trip
# ==========================================================

@trips_bp.route(
    "/<int:trip_id>/start",
    methods=["PATCH"]
)
def start_trip_api(trip_id):

    try:

        trip = start_trip(
            trip_id
        )

        return jsonify({
            "success": True,
            "message": "Trip started.",
            "data": trip_response_schema.dump(
                trip
            )
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


# ==========================================================
# Mark In Progress
# ==========================================================

@trips_bp.route(
    "/<int:trip_id>/progress",
    methods=["PATCH"]
)
def progress_trip_api(trip_id):

    try:

        trip = mark_trip_in_progress(
            trip_id
        )

        return jsonify({
            "success": True,
            "message": "Trip is now in progress.",
            "data": trip_response_schema.dump(
                trip
            )
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


# ==========================================================
# Complete Trip
# ==========================================================

@trips_bp.route(
    "/<int:trip_id>/complete",
    methods=["PATCH"]
)
def complete_trip_api(trip_id):

    json_data = request.get_json()

    end_odometer = json_data.get(
        "end_odometer"
    )

    try:

        trip = complete_trip(
            trip_id,
            end_odometer
        )

        return jsonify({
            "success": True,
            "message": "Trip completed.",
            "data": trip_response_schema.dump(
                trip
            )
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


# ==========================================================
# Cancel Trip
# ==========================================================

@trips_bp.route(
    "/<int:trip_id>/cancel",
    methods=["PATCH"]
)
def cancel_trip_api(trip_id):

    json_data = request.get_json() or {}

    try:

        trip = cancel_trip(
            trip_id,
            json_data.get("reason")
        )

        return jsonify({
            "success": True,
            "message": "Trip cancelled.",
            "data": trip_response_schema.dump(
                trip
            )
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


# ==========================================================
# Delete Trip
# ==========================================================

@trips_bp.route(
    "/<int:trip_id>",
    methods=["DELETE"]
)
def remove_trip(trip_id):

    try:

        delete_trip(
            trip_id
        )

        return jsonify({
            "success": True,
            "message": "Trip deleted successfully."
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


# ==========================================================
# Active Trips
# ==========================================================

@trips_bp.route(
    "/active",
    methods=["GET"]
)
def active_trips():

    trips = get_active_trips()

    return jsonify({
        "success": True,
        "count": len(trips),
        "data": trips_response_schema.dump(
            trips
        )
    })


# ==========================================================
# Completed Trips
# ==========================================================

@trips_bp.route(
    "/completed",
    methods=["GET"]
)
def completed_trips():

    trips = get_completed_trips()

    return jsonify({
        "success": True,
        "count": len(trips),
        "data": trips_response_schema.dump(
            trips
        )
    })


# ==========================================================
# Search Trips
# ==========================================================

@trips_bp.route(
    "/search",
    methods=["GET"]
)
def search_trip_api():

    keyword = request.args.get(
        "keyword",
        ""
    )

    trips = search_trips(
        keyword
    )

    return jsonify({
        "success": True,
        "count": len(trips),
        "data": trips_response_schema.dump(
            trips
        )
    })


# ==========================================================
# Driver Trip History
# ==========================================================

@trips_bp.route(
    "/driver/<int:driver_id>",
    methods=["GET"]
)
def driver_history(driver_id):

    trips = get_driver_trips(
        driver_id
    )

    return jsonify({
        "success": True,
        "count": len(trips),
        "data": trips_response_schema.dump(
            trips
        )
    })


# ==========================================================
# Vehicle Trip History
# ==========================================================

@trips_bp.route(
    "/vehicle/<int:vehicle_id>",
    methods=["GET"]
)
def vehicle_history(vehicle_id):

    trips = get_vehicle_trips(
        vehicle_id
    )

    return jsonify({
        "success": True,
        "count": len(trips),
        "data": trips_response_schema.dump(
            trips
        )
    })


# ==========================================================
# Trip Statistics
# ==========================================================

@trips_bp.route(
    "/statistics",
    methods=["GET"]
)
def statistics():

    return jsonify({
        "success": True,
        "data": get_trip_statistics()
    })