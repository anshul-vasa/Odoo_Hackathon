from datetime import datetime

from app.extensions import db


class FuelLog(db.Model):
    """
    Fuel Log Model
    Stores fuel purchase records for vehicles.
    """

    __tablename__ = "fuel_logs"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    vehicle_id = db.Column(
        db.Integer,
        db.ForeignKey("vehicles.id"),
        nullable=False
    )

    trip_id = db.Column(
        db.Integer,
        db.ForeignKey("trips.id"),
        nullable=True
    )

    fuel_date = db.Column(
        db.Date,
        nullable=False
    )

    fuel_station = db.Column(
        db.String(150),
        nullable=True
    )

    liters = db.Column(
        db.Float,
        nullable=False
    )

    cost_per_liter = db.Column(
        db.Float,
        nullable=False
    )

    total_cost = db.Column(
        db.Float,
        nullable=False
    )

    odometer = db.Column(
        db.Float,
        nullable=False
    )

    payment_method = db.Column(
        db.Enum(
            "Cash",
            "Card",
            "UPI",
            "Bank Transfer",
            name="fuel_payment_method"
        ),
        default="Cash",
        nullable=False
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
        back_populates="fuel_logs"
    )

    trip = db.relationship(
        "Trip",
        backref=db.backref(
            "fuel_logs",
            lazy=True
        )
    )

    # ---------------------------------------
    # Helper Methods
    # ---------------------------------------

    @property
    def average_price(self):
        return round(self.total_cost / self.liters, 2) if self.liters else 0

    # ---------------------------------------
    # Serialization
    # ---------------------------------------

    def to_dict(self):
        return {
            "id": self.id,
            "vehicle_id": self.vehicle_id,
            "trip_id": self.trip_id,
            "fuel_date": self.fuel_date.isoformat() if self.fuel_date else None,
            "fuel_station": self.fuel_station,
            "liters": self.liters,
            "cost_per_liter": self.cost_per_liter,
            "total_cost": self.total_cost,
            "odometer": self.odometer,
            "payment_method": self.payment_method,
            "remarks": self.remarks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    # ---------------------------------------
    # String Representation
    # ---------------------------------------

    def __repr__(self):
        return (
            f"<FuelLog "
            f"Vehicle:{self.vehicle_id} "
            f"Cost:{self.total_cost}>"
        )