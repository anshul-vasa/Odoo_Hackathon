from datetime import datetime

from app.extensions import db


class Vehicle(db.Model):
    """
    Vehicle model for fleet management.
    """

    __tablename__ = "vehicles"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    vehicle_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
        index=True
    )

    vehicle_type = db.Column(
        db.String(50),
        nullable=False
    )

    manufacturer = db.Column(
        db.String(100),
        nullable=True
    )

    model_name = db.Column(
        db.String(100),
        nullable=True
    )

    manufacturing_year = db.Column(
        db.Integer,
        nullable=True
    )

    color = db.Column(
        db.String(50),
        nullable=True
    )

    fuel_type = db.Column(
        db.String(50),
        nullable=False
    )

    registration_date = db.Column(
        db.Date,
        nullable=True
    )

    insurance_expiry = db.Column(
        db.Date,
        nullable=True
    )

    fitness_expiry = db.Column(
        db.Date,
        nullable=True
    )

    # status = db.Column(
    #     db.String(30),
    #     nullable=False,
    #     default="ACTIVE"
    # )
    from app.vehicles.constants import (
    VEHICLE_STATUS_ACTIVE
)

    status = db.Column(
    db.String(30),
    nullable=False,
    default=VEHICLE_STATUS_ACTIVE
)

    current_odometer = db.Column(
        db.Float,
        default=0
    )

    capacity = db.Column(
        db.Integer,
        nullable=True
    )

    notes = db.Column(
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


    def __repr__(self):
        return f"<Vehicle {self.vehicle_number}>"


    def to_dict(self):
        """
        Convert vehicle object into JSON format.
        """

        return {
            "id": self.id,
            "vehicle_number": self.vehicle_number,
            "vehicle_type": self.vehicle_type,
            "manufacturer": self.manufacturer,
            "model_name": self.model_name,
            "manufacturing_year": self.manufacturing_year,
            "color": self.color,
            "fuel_type": self.fuel_type,
            "registration_date": (
                self.registration_date.isoformat()
                if self.registration_date
                else None
            ),
            "insurance_expiry": (
                self.insurance_expiry.isoformat()
                if self.insurance_expiry
                else None
            ),
            "fitness_expiry": (
                self.fitness_expiry.isoformat()
                if self.fitness_expiry
                else None
            ),
            "status": self.status,
            "current_odometer": self.current_odometer,
            "capacity": self.capacity,
            "notes": self.notes,
            "created_at": self.created_at.isoformat()
            if self.created_at
            else None,
            "updated_at": self.updated_at.isoformat()
            if self.updated_at
            else None,
        }