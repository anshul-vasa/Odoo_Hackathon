from datetime import datetime

from app.drivers.models import Driver
from app.trips.constants import (
    ACTIVE_TRIP_STATUSES,
    TRIP_STATUSES,
)
from app.trips.models import Trip
from app.vehicles.models import Vehicle


def validate_trip_dates(
    scheduled_start,
    scheduled_end
):
    """
    Validate scheduled dates.
    """

    if scheduled_start >= scheduled_end:
        return {
            "valid": False,
            "message": (
                "Scheduled end time must be "
                "greater than scheduled start time."
            )
        }

    return {
        "valid": True
    }


def validate_odometer(
    start_odometer,
    end_odometer=None
):
    """
    Validate odometer readings.
    """

    if (
        start_odometer is not None
        and start_odometer < 0
    ):
        return {
            "valid": False,
            "message": "Invalid start odometer."
        }

    if (
        end_odometer is not None
        and end_odometer < start_odometer
    ):
        return {
            "valid": False,
            "message": (
                "End odometer cannot be less "
                "than start odometer."
            )
        }

    return {
        "valid": True
    }


def validate_vehicle(vehicle_id):
    """
    Validate vehicle availability.
    """

    vehicle = Vehicle.query.get(vehicle_id)

    if not vehicle:
        return {
            "valid": False,
            "message": "Vehicle not found."
        }

    if vehicle.status != "ACTIVE":
        return {
            "valid": False,
            "message": "Vehicle is not active."
        }

    active_trip = Trip.query.filter(
        Trip.vehicle_id == vehicle_id,
        Trip.status.in_(ACTIVE_TRIP_STATUSES)
    ).first()

    if active_trip:
        return {
            "valid": False,
            "message": (
                "Vehicle already assigned "
                "to another active trip."
            )
        }

    return {
        "valid": True,
        "vehicle": vehicle
    }


def validate_driver(driver_id):
    """
    Validate driver availability.
    """

    driver = Driver.query.get(driver_id)

    if not driver:
        return {
            "valid": False,
            "message": "Driver not found."
        }

    if driver.status != "AVAILABLE":
        return {
            "valid": False,
            "message": "Driver is not available."
        }

    if (
        driver.license_expiry_date
        < datetime.utcnow().date()
    ):
        return {
            "valid": False,
            "message": (
                "Driver license has expired."
            )
        }

    active_trip = Trip.query.filter(
        Trip.driver_id == driver_id,
        Trip.status.in_(ACTIVE_TRIP_STATUSES)
    ).first()

    if active_trip:
        return {
            "valid": False,
            "message": (
                "Driver already assigned "
                "to another active trip."
            )
        }

    return {
        "valid": True,
        "driver": driver
    }


def validate_trip_status(status):
    """
    Validate trip status.
    """

    return status in TRIP_STATUSES


def validate_trip(data):
    """
    Complete trip validation.
    """

    date_validation = validate_trip_dates(
        data["scheduled_start"],
        data["scheduled_end"]
    )

    if not date_validation["valid"]:
        return date_validation


    vehicle_validation = validate_vehicle(
        data["vehicle_id"]
    )

    if not vehicle_validation["valid"]:
        return vehicle_validation


    driver_validation = validate_driver(
        data["driver_id"]
    )

    if not driver_validation["valid"]:
        return driver_validation


    odo_validation = validate_odometer(
        data.get("start_odometer")
    )

    if not odo_validation["valid"]:
        return odo_validation


    return {
        "valid": True
    }


def validate_trip_update(data):
    """
    Validate trip update request.
    """

    if "status" in data:

        if not validate_trip_status(
            data["status"]
        ):
            return {
                "valid": False,
                "message": "Invalid trip status."
            }

    if (
        "start_odometer" in data
        and "end_odometer" in data
    ):

        odo_validation = validate_odometer(
            data["start_odometer"],
            data["end_odometer"]
        )

        if not odo_validation["valid"]:
            return odo_validation

    return {
        "valid": True
    }