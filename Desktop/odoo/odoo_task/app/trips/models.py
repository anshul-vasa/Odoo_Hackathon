from datetime import datetime

from app.extensions import db
from app.trips.constants import (
    TRIP_STATUS_SCHEDULED,
    TRIP_PRIORITY_MEDIUM,
    TRIP_TYPE_ONE_WAY
)


class Trip(db.Model):
    """
    Trip model.
    """

    __tablename__ = "trips"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    trip_number = db.Column(
        db.String(30),
        unique=True,
        nullable=False,
        index=True
    )

    vehicle_id = db.Column(
        db.Integer,
        db.ForeignKey("vehicles.id"),
        nullable=False,
        index=True
    )

    driver_id = db.Column(
        db.Integer,
        db.ForeignKey("drivers.id"),
        nullable=False,
        index=True
    )

    source = db.Column(
        db.String(150),
        nullable=False
    )

    destination = db.Column(
        db.String(150),
        nullable=False
    )

    trip_type = db.Column(
        db.String(30),
        nullable=False,
        default=TRIP_TYPE_ONE_WAY
    )

    priority = db.Column(
        db.String(20),
        nullable=False,
        default=TRIP_PRIORITY_MEDIUM
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default=TRIP_STATUS_SCHEDULED
    )

    scheduled_start = db.Column(
        db.DateTime,
        nullable=False
    )

    scheduled_end = db.Column(
        db.DateTime,
        nullable=False
    )

    actual_start = db.Column(
        db.DateTime
    )

    actual_end = db.Column(
        db.DateTime
    )

    start_odometer = db.Column(
        db.Integer
    )

    end_odometer = db.Column(
        db.Integer
    )

    distance = db.Column(
        db.Float,
        default=0
    )

    cargo_description = db.Column(
        db.Text
    )

    notes = db.Column(
        db.Text
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    def to_dict(self):
        return {
            "id": self.id,
            "trip_number": self.trip_number,
            "vehicle_id": self.vehicle_id,
            "driver_id": self.driver_id,
            "source": self.source,
            "destination": self.destination,
            "trip_type": self.trip_type,
            "priority": self.priority,
            "status": self.status,
            "scheduled_start": self.scheduled_start.isoformat() if self.scheduled_start else None,
            "scheduled_end": self.scheduled_end.isoformat() if self.scheduled_end else None,
            "actual_start": self.actual_start.isoformat() if self.actual_start else None,
            "actual_end": self.actual_end.isoformat() if self.actual_end else None,
            "start_odometer": self.start_odometer,
            "end_odometer": self.end_odometer,
            "distance": self.distance,
            "cargo_description": self.cargo_description,
            "notes": self.notes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    def __repr__(self):
        return f"<Trip {self.trip_number}>"