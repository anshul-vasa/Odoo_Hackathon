from datetime import datetime

from app.extensions import db


class Expense(db.Model):
    """
    Expense Model
    Stores all operational expenses related to vehicles.
    """

    __tablename__ = "expenses"

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

    expense_type = db.Column(
        db.Enum(
            "Fuel",
            "Maintenance",
            "Toll",
            "Parking",
            "Permit",
            "Insurance",
            "Repair",
            "Other",
            name="expense_type"
        ),
        nullable=False
    )

    amount = db.Column(
        db.Float,
        nullable=False
    )

    expense_date = db.Column(
        db.Date,
        nullable=False
    )

    vendor = db.Column(
        db.String(150),
        nullable=True
    )

    payment_method = db.Column(
        db.Enum(
            "Cash",
            "Card",
            "UPI",
            "Bank Transfer",
            name="expense_payment_method"
        ),
        default="Cash",
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    receipt_number = db.Column(
        db.String(100),
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
        back_populates="expenses"
    )

    trip = db.relationship(
        "Trip",
        backref=db.backref(
            "expenses",
            lazy=True
        )
    )

    # ---------------------------------------
    # Serialization
    # ---------------------------------------

    def to_dict(self):
        return {
            "id": self.id,
            "vehicle_id": self.vehicle_id,
            "trip_id": self.trip_id,
            "expense_type": self.expense_type,
            "amount": self.amount,
            "expense_date": self.expense_date.isoformat() if self.expense_date else None,
            "vendor": self.vendor,
            "payment_method": self.payment_method,
            "description": self.description,
            "receipt_number": self.receipt_number,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    # ---------------------------------------
    # String Representation
    # ---------------------------------------

    def __repr__(self):
        return (
            f"<Expense "
            f"{self.expense_type} "
            f"₹{self.amount}>"
        )