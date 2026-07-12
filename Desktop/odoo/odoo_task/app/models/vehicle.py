from datetime import datetime

from app.extensions import db


class Vehicle(db.Model):
    """
    Vehicle Model
    Stores all fleet vehicle information.
    """

    __tablename__ = "vehicles"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    registration_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
        index=True
    )

    vehicle_name = db.Column(
        db.String(100),
        nullable=False
    )

    vehicle_type = db.Column(
        db.String(50),
        nullable=False
    )

    maximum_load_capacity = db.Column(
        db.Float,
        nullable=False
    )

    odometer = db.Column(
        db.Float,
        default=0.0,
        nullable=False
    )

    acquisition_cost = db.Column(
        db.Float,
        nullable=False
    )

    status = db.Column(
        db.Enum(
            "Available",
            "On Trip",
            "In Shop",
            "Retired",
            name="vehicle_status"
        ),
        default="Available",
        nullable=False
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

    # ---------------------------------
    # Relationships
    # ---------------------------------

    trips = db.relationship(
        "Trip",
        back_populates="vehicle",
        lazy=True,
        cascade="all, delete-orphan"
    )

    maintenance_logs = db.relationship(
        "Maintenance",
        back_populates="vehicle",
        lazy=True,
        cascade="all, delete-orphan"
    )

    fuel_logs = db.relationship(
        "FuelLog",
        back_populates="vehicle",
        lazy=True,
        cascade="all, delete-orphan"
    )

    expenses = db.relationship(
        "Expense",
        back_populates="vehicle",
        lazy=True,
        cascade="all, delete-orphan"
    )

    # ---------------------------------
    # Helper Methods
    # ---------------------------------

    @property
    def is_available(self):
        return self.status == "Available"

    @property
    def is_on_trip(self):
        return self.status == "On Trip"

    @property
    def is_in_shop(self):
        return self.status == "In Shop"

    @property
    def is_retired(self):
        return self.status == "Retired"

    # ---------------------------------
    # Serialization
    # ---------------------------------

    def to_dict(self):
        return {
            "id": self.id,
            "registration_number": self.registration_number,
            "vehicle_name": self.vehicle_name,
            "vehicle_type": self.vehicle_type,
            "maximum_load_capacity": self.maximum_load_capacity,
            "odometer": self.odometer,
            "acquisition_cost": self.acquisition_cost,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return (
            f"<Vehicle "
            f"{self.registration_number} "
            f"({self.status})>"
        )