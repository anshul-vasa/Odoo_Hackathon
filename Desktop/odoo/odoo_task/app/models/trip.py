from datetime import datetime

from app.extensions import db


class Trip(db.Model):
    """
    Trip Model
    """

    __tablename__ = "trips"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    trip_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
        index=True
    )

    source = db.Column(
        db.String(255),
        nullable=False
    )

    destination = db.Column(
        db.String(255),
        nullable=False
    )

    vehicle_id = db.Column(
        db.Integer,
        db.ForeignKey("vehicles.id"),
        nullable=False
    )

    driver_id = db.Column(
        db.Integer,
        db.ForeignKey("drivers.id"),
        nullable=False
    )

    cargo_weight = db.Column(
        db.Float,
        nullable=False
    )

    planned_distance = db.Column(
        db.Float,
        nullable=False
    )

    actual_distance = db.Column(
        db.Float,
        nullable=True
    )

    start_odometer = db.Column(
        db.Float,
        nullable=True
    )

    end_odometer = db.Column(
        db.Float,
        nullable=True
    )

    fuel_consumed = db.Column(
        db.Float,
        nullable=True
    )

    revenue = db.Column(
        db.Float,
        default=0.0
    )

    status = db.Column(
        db.Enum(
            "Draft",
            "Dispatched",
            "Completed",
            "Cancelled",
            name="trip_status"
        ),
        default="Draft",
        nullable=False
    )

    dispatch_time = db.Column(
        db.DateTime,
        nullable=True
    )

    completion_time = db.Column(
        db.DateTime,
        nullable=True
    )

    remarks = db.Column(
        db.Text,
        nullable=True
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

    # ---------------------------------------
    # Relationships
    # ---------------------------------------

    vehicle = db.relationship(
        "Vehicle",
        back_populates="trips"
    )

    driver = db.relationship(
        "Driver",
        back_populates="trips"
    )

    # ---------------------------------------
    # Helper Properties
    # ---------------------------------------

    @property
    def is_draft(self):
        return self.status == "Draft"

    @property
    def is_dispatched(self):
        return self.status == "Dispatched"

    @property
    def is_completed(self):
        return self.status == "Completed"

    @property
    def is_cancelled(self):
        return self.status == "Cancelled"

    # ---------------------------------------
    # Serialization
    # ---------------------------------------

    def to_dict(self):
        return {
            "id": self.id,
            "trip_number": self.trip_number,
            "source": self.source,
            "destination": self.destination,
            "vehicle_id": self.vehicle_id,
            "driver_id": self.driver_id,
            "cargo_weight": self.cargo_weight,
            "planned_distance": self.planned_distance,
            "actual_distance": self.actual_distance,
            "start_odometer": self.start_odometer,
            "end_odometer": self.end_odometer,
            "fuel_consumed": self.fuel_consumed,
            "revenue": self.revenue,
            "status": self.status,
            "dispatch_time": self.dispatch_time.isoformat() if self.dispatch_time else None,
            "completion_time": self.completion_time.isoformat() if self.completion_time else None,
            "remarks": self.remarks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    # ---------------------------------------
    # String Representation
    # ---------------------------------------

    def __repr__(self):
        return (
            f"<Trip {self.trip_number} - {self.status}>"
        )