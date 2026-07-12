from app.models.vehicle import Vehicle
from app.models.trip import Trip


def registration_number_exists(registration_number, exclude_vehicle_id=None):
    """
    Check if a registration number already exists.
    """

    query = Vehicle.query.filter_by(
        registration_number=registration_number
    )

    if exclude_vehicle_id:
        query = query.filter(
            Vehicle.id != exclude_vehicle_id
        )

    return query.first() is not None


def vehicle_exists(vehicle_id):
    """
    Return vehicle object if exists.
    """

    return Vehicle.query.get(vehicle_id)


def can_delete_vehicle(vehicle_id):
    """
    A vehicle cannot be deleted if it has an active trip.
    """

    active_trip = Trip.query.filter(
        Trip.vehicle_id == vehicle_id,
        Trip.status.in_(["Draft", "Dispatched"])
    ).first()

    return active_trip is None


def validate_vehicle_status(current_status, new_status):
    """
    Validate allowed vehicle status transitions.
    """

    allowed_transitions = {

        "Available": [
            "On Trip",
            "In Shop",
            "Retired"
        ],

        "On Trip": [
            "Available"
        ],

        "In Shop": [
            "Available",
            "Retired"
        ],

        "Retired": []
    }

    return new_status in allowed_transitions.get(
        current_status,
        []
    )


def can_assign_trip(vehicle):
    """
    Vehicle can be assigned only if available.
    """

    return vehicle.status == "Available"


def can_start_maintenance(vehicle):
    """
    Maintenance can start only when vehicle
    is not on a trip.
    """

    return vehicle.status == "Available"


def can_complete_maintenance(vehicle):
    """
    Maintenance can be completed only if vehicle
    is currently in the workshop.
    """

    return vehicle.status == "In Shop"


def validate_odometer(current_odometer, new_odometer):
    """
    Odometer should never decrease.
    """

    return new_odometer >= current_odometer


def validate_load_capacity(capacity):
    """
    Vehicle load capacity must be positive.
    """

    return capacity > 0


def validate_acquisition_cost(cost):
    """
    Vehicle acquisition cost must be positive.
    """

    return cost > 0