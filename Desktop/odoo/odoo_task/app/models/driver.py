from datetime import datetime, date

from app.extensions import db


class Driver(db.Model):
    """
    Driver Model
    Stores driver information for trip assignment and compliance.
    """

    __tablename__ = "drivers"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    license_number = db.Column(
        db.String(100),
        unique=True,
        nullable=False,
        index=True
    )

    license_category = db.Column(
        db.String(50),
        nullable=False
    )

    license_expiry_date = db.Column(
        db.Date,
        nullable=False
    )

    contact_number = db.Column(
        db.String(20),
        nullable=False
    )

    safety_score = db.Column(
        db.Float,
        default=100.0,
        nullable=False
    )

    status = db.Column(
        db.Enum(
            "Available",
            "On Trip",
            "Off Duty",
            "Suspended",
            name="driver_status"
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

    # -----------------------------------
    # Relationships
    # -----------------------------------

    trips = db.relationship(
        "Trip",
        back_populates="driver",
        lazy=True,
        cascade="all, delete-orphan"
    )

    # -----------------------------------
    # Helper Properties
    # -----------------------------------

    @property
    def is_license_valid(self):
        return self.license_expiry_date >= date.today()

    @property
    def is_available(self):
        return self.status == "Available"

    @property
    def is_on_trip(self):
        return self.status == "On Trip"

    @property
    def is_off_duty(self):
        return self.status == "Off Duty"

    @property
    def is_suspended(self):
        return self.status == "Suspended"

    # -----------------------------------
    # Serialization
    # -----------------------------------

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "license_number": self.license_number,
            "license_category": self.license_category,
            "license_expiry_date": self.license_expiry_date.isoformat(),
            "contact_number": self.contact_number,
            "safety_score": self.safety_score,
            "status": self.status,
            "license_valid": self.is_license_valid,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    # -----------------------------------
    # String Representation
    # -----------------------------------

    def __repr__(self):
        return (
            f"<Driver "
            f"{self.name} "
            f"({self.license_number})>"
        )