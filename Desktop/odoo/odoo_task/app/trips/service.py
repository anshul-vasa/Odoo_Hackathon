from datetime import datetime

from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db

from app.trips.models import Trip
from app.trips.validators import validate_trip

from app.drivers.models import Driver
from app.vehicles.models import Vehicle

from app.drivers.constants import (
    DRIVER_STATUS_AVAILABLE,
    DRIVER_STATUS_ON_TRIP,
)

from app.vehicles.constants import (
    VEHICLE_STATUS_ACTIVE,
    VEHICLE_STATUS_ON_TRIP,
)

from app.trips.constants import (
    TRIP_STATUS_SCHEDULED,
    TRIP_STATUS_STARTED,
    TRIP_STATUS_IN_PROGRESS,
    TRIP_STATUS_COMPLETED,
    TRIP_STATUS_CANCELLED,
)


def _get_trip_or_raise(trip_id):
    """
    Fetch trip by ID.

    Raises:
        ValueError: If trip does not exist.
    """

    trip = Trip.query.get(trip_id)

    if not trip:
        raise ValueError("Trip not found.")

    return trip


def create_trip(data):
    """
    Create a new trip.
    """

    validation = validate_trip(data)

    if not validation["valid"]:
        raise ValueError(validation["message"])

    vehicle = Vehicle.query.get(data["vehicle_id"])
    driver = Driver.query.get(data["driver_id"])

    trip = Trip(
        trip_number=data["trip_number"],
        vehicle_id=data["vehicle_id"],
        driver_id=data["driver_id"],
        source=data["source"],
        destination=data["destination"],
        trip_type=data.get("trip_type"),
        priority=data.get("priority"),
        status=TRIP_STATUS_SCHEDULED,
        scheduled_start=data["scheduled_start"],
        scheduled_end=data["scheduled_end"],
        start_odometer=data.get("start_odometer"),
        cargo_description=data.get("cargo_description"),
        notes=data.get("notes"),
    )

    try:

        db.session.add(trip)

        vehicle.status = VEHICLE_STATUS_ON_TRIP
        driver.status = DRIVER_STATUS_ON_TRIP

        db.session.commit()

        return trip

    except SQLAlchemyError:

        db.session.rollback()

        raise


def get_all_trips():
    """
    Return all trips.
    """

    return (
        Trip.query
        .order_by(
            Trip.created_at.desc()
        )
        .all()
    )


def get_trip_by_id(trip_id):
    """
    Return trip by ID.
    """

    return Trip.query.get(trip_id)

    def update_trip(
    trip_id,
    data
):trip = _get_trip_or_raise(trip_id)

    if trip.status != TRIP_STATUS_SCHEDULED:
        raise ValueError(
            "Only scheduled trips can be updated."
        )

    allowed_fields = [
        "source",
        "destination",
        "trip_type",
        "priority",
        "scheduled_start",
        "scheduled_end",
        "cargo_description",
        "notes",
        "start_odometer",
    ]

    try:

        for field in allowed_fields:

            if field in data:
                setattr(
                    trip,
                    field,
                    data[field]
                )

        db.session.commit()

        return trip

    except SQLAlchemyError:

        db.session.rollback()

        raise



def start_trip(trip_id):
    """
    Start a scheduled trip.
    """

    trip = _get_trip_or_raise(
        trip_id
    )

    if trip.status != TRIP_STATUS_SCHEDULED:
        raise ValueError(
            "Only scheduled trips can be started."
        )

    try:

        trip.status = TRIP_STATUS_STARTED

        trip.actual_start = datetime.utcnow()

        db.session.commit()

        return trip

    except SQLAlchemyError:

        db.session.rollback()

        raise



def mark_trip_in_progress(trip_id):
    """
    Move trip to IN_PROGRESS.
    """

    trip = _get_trip_or_raise(
        trip_id
    )

    if trip.status != TRIP_STATUS_STARTED:
        raise ValueError(
            "Trip must be started first."
        )

    try:

        trip.status = TRIP_STATUS_IN_PROGRESS

        db.session.commit()

        return trip

    except SQLAlchemyError:

        db.session.rollback()

        raise



def complete_trip(
    trip_id,
    end_odometer
):
    """
    Complete a trip.

    Automatically:
    - Calculates distance
    - Releases vehicle
    - Releases driver
    """

    trip = _get_trip_or_raise(
        trip_id
    )

    if trip.status not in [
        TRIP_STATUS_STARTED,
        TRIP_STATUS_IN_PROGRESS,
    ]:
        raise ValueError(
            "Trip cannot be completed."
        )

    vehicle = Vehicle.query.get(
        trip.vehicle_id
    )

    driver = Driver.query.get(
        trip.driver_id
    )

    try:

        trip.status = TRIP_STATUS_COMPLETED

        trip.actual_end = datetime.utcnow()

        trip.end_odometer = end_odometer

        if (
            trip.start_odometer is not None
            and end_odometer is not None
        ):

            trip.distance = (
                end_odometer
                - trip.start_odometer
            )

        vehicle.status = (
            VEHICLE_STATUS_ACTIVE
        )

        driver.status = (
            DRIVER_STATUS_AVAILABLE
        )

        db.session.commit()

        return trip

    except SQLAlchemyError:

        db.session.rollback()

        raise
    def cancel_trip(
    trip_id,
    reason=None
):trip = _get_trip_or_raise(
        trip_id
    )

    if trip.status != TRIP_STATUS_SCHEDULED:
        raise ValueError(
            "Only scheduled trips can be cancelled."
        )

    vehicle = Vehicle.query.get(
        trip.vehicle_id
    )

    driver = Driver.query.get(
        trip.driver_id
    )

    try:

        trip.status = TRIP_STATUS_CANCELLED

        if reason:
            trip.notes = (
                f"{trip.notes or ''}\n"
                f"Cancellation Reason: {reason}"
            )

        vehicle.status = (
            VEHICLE_STATUS_ACTIVE
        )

        driver.status = (
            DRIVER_STATUS_AVAILABLE
        )

        db.session.commit()

        return trip

    except SQLAlchemyError:

        db.session.rollback()

        raise


def delete_trip(trip_id):
    """
    Permanently delete a trip.

    Recommended only if the trip
    has never started.
    """

    trip = _get_trip_or_raise(
        trip_id
    )

    if trip.status != TRIP_STATUS_SCHEDULED:
        raise ValueError(
            "Only scheduled trips can be deleted."
        )

    try:

        db.session.delete(trip)

        db.session.commit()

        return True

    except SQLAlchemyError:

        db.session.rollback()

        raise


def get_active_trips():
    """
    Return all active trips.
    """

    return Trip.query.filter(
        Trip.status.in_([
            TRIP_STATUS_SCHEDULED,
            TRIP_STATUS_STARTED,
            TRIP_STATUS_IN_PROGRESS,
        ])
    ).all()


def get_completed_trips():
    """
    Return completed trips.
    """

    return Trip.query.filter_by(
        status=TRIP_STATUS_COMPLETED
    ).all()


def search_trips(keyword):
    """
    Search trips by:

    - Trip Number
    - Source
    - Destination
    """

    return Trip.query.filter(
        db.or_(
            Trip.trip_number.ilike(
                f"%{keyword}%"
            ),
            Trip.source.ilike(
                f"%{keyword}%"
            ),
            Trip.destination.ilike(
                f"%{keyword}%"
            ),
        )
    ).all()


def get_driver_trips(driver_id):
    """
    Return trips of a driver.
    """

    return Trip.query.filter_by(
        driver_id=driver_id
    ).order_by(
        Trip.created_at.desc()
    ).all()


def get_vehicle_trips(vehicle_id):
    """
    Return trips of a vehicle.
    """

    return Trip.query.filter_by(
        vehicle_id=vehicle_id
    ).order_by(
        Trip.created_at.desc()
    ).all()


def get_trip_statistics():
    """
    Return dashboard statistics.
    """

    return {
        "total_trips": Trip.query.count(),

        "active_trips":
            Trip.query.filter(
                Trip.status.in_([
                    TRIP_STATUS_SCHEDULED,
                    TRIP_STATUS_STARTED,
                    TRIP_STATUS_IN_PROGRESS,
                ])
            ).count(),

        "completed_trips":
            Trip.query.filter_by(
                status=TRIP_STATUS_COMPLETED
            ).count(),

        "cancelled_trips":
            Trip.query.filter_by(
                status=TRIP_STATUS_CANCELLED
            ).count(),
    }