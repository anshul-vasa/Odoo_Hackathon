from datetime import date

from app.maintenance.constants import (
    ACTIVE_MAINTENANCE_STATUSES,
    MAINTENANCE_STATUSES,
)
from app.maintenance.models import Maintenance
from app.trips.constants import ACTIVE_TRIP_STATUSES
from app.trips.models import Trip
from app.vehicles.constants import (
    VEHICLE_STATUS_ACTIVE,
    VEHICLE_STATUS_MAINTENANCE,
)
from app.vehicles.models import Vehicle


def validate_vehicle(vehicle_id):
    """
    Validate vehicle and maintenance eligibility.
    """

    vehicle = Vehicle.query.get(vehicle_id)

    if not vehicle:
        return {
            "valid": False,
            "message": "Vehicle not found."
        }

    if vehicle.status == VEHICLE_STATUS_MAINTENANCE:
        return {
            "valid": False,
            "message": "Vehicle is already under maintenance."
        }

    active_trip = Trip.query.filter(
        Trip.vehicle_id == vehicle_id,
        Trip.status.in_(ACTIVE_TRIP_STATUSES)
    ).first()

    if active_trip:
        return {
            "valid": False,
            "message": (
                "Vehicle is currently assigned "
                "to an active trip."
            )
        }

    active_maintenance = Maintenance.query.filter(
        Maintenance.vehicle_id == vehicle_id,
        Maintenance.status.in_(
            ACTIVE_MAINTENANCE_STATUSES
        )
    ).first()

    if active_maintenance:
        return {
            "valid": False,
            "message": (
                "An active maintenance record "
                "already exists."
            )
        }

    return {
        "valid": True,
        "vehicle": vehicle
    }


def validate_dates(
    scheduled_date,
    next_service_date=None
):
    """
    Validate maintenance dates.
    """

    if scheduled_date < date.today():
        return {
            "valid": False,
            "message": (
                "Scheduled date cannot "
                "be in the past."
            )
        }

    if (
        next_service_date
        and
        next_service_date <= scheduled_date
    ):
        return {
            "valid": False,
            "message": (
                "Next service date must be "
                "after scheduled date."
            )
        }

    return {
        "valid": True
    }


def validate_odometer(
    current_odometer,
    next_service_odometer=None
):
    """
    Validate odometer values.
    """

    if current_odometer < 0:

        return {
            "valid": False,
            "message": (
                "Current odometer "
                "cannot be negative."
            )
        }

    if (
        next_service_odometer
        and
        next_service_odometer <= current_odometer
    ):

        return {
            "valid": False,
            "message": (
                "Next service odometer "
                "must be greater than "
                "current odometer."
            )
        }

    return {
        "valid": True
    }


def validate_costs(
    labour_cost,
    parts_cost,
    estimated_cost
):
    """
    Validate cost values.
    """

    values = [
        labour_cost,
        parts_cost,
        estimated_cost
    ]

    for value in values:

        if value is not None and value < 0:

            return {
                "valid": False,
                "message": (
                    "Cost cannot be negative."
                )
            }

    return {
        "valid": True
    }


def validate_status(status):
    """
    Validate maintenance status.
    """

    return status in MAINTENANCE_STATUSES


def validate_maintenance(data):
    """
    Complete maintenance validation.
    """

    vehicle_validation = validate_vehicle(
        data["vehicle_id"]
    )

    if not vehicle_validation["valid"]:
        return vehicle_validation


    date_validation = validate_dates(
        data["scheduled_date"],
        data.get("next_service_date")
    )

    if not date_validation["valid"]:
        return date_validation


    odo_validation = validate_odometer(
        data["current_odometer"],
        data.get("next_service_odometer")
    )

    if not odo_validation["valid"]:
        return odo_validation


    cost_validation = validate_costs(
        data.get("labour_cost", 0),
        data.get("parts_cost", 0),
        data.get("estimated_cost", 0)
    )

    if not cost_validation["valid"]:
        return cost_validation


    return {
        "valid": True
    }


def validate_maintenance_update(data):
    """
    Validate maintenance update.
    """

    if "status" in data:

        if not validate_status(
            data["status"]
        ):

            return {
                "valid": False,
                "message": (
                    "Invalid maintenance status."
                )
            }

    if (
        "current_odometer" in data
        and
        "next_service_odometer" in data
    ):

        odo_validation = validate_odometer(
            data["current_odometer"],
            data["next_service_odometer"]
        )

        if not odo_validation["valid"]:
            return odo_validation

    return {
        "valid": True
    }