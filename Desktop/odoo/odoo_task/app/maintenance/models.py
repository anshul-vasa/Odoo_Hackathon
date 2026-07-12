from datetime import datetime

from app.extensions import db

from app.maintenance.constants import (
    MAINTENANCE_STATUS_SCHEDULED,
    MAINTENANCE_TYPE_GENERAL_SERVICE,
    PRIORITY_MEDIUM,
    PAYMENT_STATUS_PENDING,
)


class Maintenance(db.Model):
    """
    Vehicle Maintenance Model
    """

    __tablename__ = "maintenance"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    maintenance_number = db.Column(
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

    maintenance_type = db.Column(
        db.String(50),
        nullable=False,
        default=MAINTENANCE_TYPE_GENERAL_SERVICE
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default=MAINTENANCE_STATUS_SCHEDULED
    )

    priority = db.Column(
        db.String(20),
        nullable=False,
        default=PRIORITY_MEDIUM
    )

    service_center = db.Column(
        db.String(150),
        nullable=False
    )

    technician_name = db.Column(
        db.String(120)
    )

    invoice_number = db.Column(
        db.String(100)
    )

    current_odometer = db.Column(
        db.Integer,
        nullable=False
    )

    next_service_odometer = db.Column(
        db.Integer
    )

    scheduled_date = db.Column(
        db.Date,
        nullable=False
    )

    start_date = db.Column(
        db.DateTime
    )

    completion_date = db.Column(
        db.DateTime
    )

    estimated_cost = db.Column(
        db.Float,
        default=0.0
    )

    labour_cost = db.Column(
        db.Float,
        default=0.0
    )

    parts_cost = db.Column(
        db.Float,
        default=0.0
    )

    total_cost = db.Column(
        db.Float,
        default=0.0
    )

    payment_status = db.Column(
        db.String(20),
        nullable=False,
        default=PAYMENT_STATUS_PENDING
    )

    next_service_date = db.Column(
        db.Date
    )

    warranty_available = db.Column(
        db.Boolean,
        default=False
    )

    vendor_name = db.Column(
        db.String(150)
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

    # ------------------------------------------------------
    # Relationships
    # ------------------------------------------------------

    vehicle = db.relationship(
        "Vehicle",
        backref="maintenance_records",
        lazy=True
    )

    # ------------------------------------------------------
    # Helper Methods
    # ------------------------------------------------------

    def calculate_total_cost(self):
        """
        Calculate total maintenance cost.
        """

        self.total_cost = (
            (self.labour_cost or 0)
            +
            (self.parts_cost or 0)
        )

        return self.total_cost

    def is_completed(self):
        return (
            self.status
            ==
            "COMPLETED"
        )

    def is_overdue(self):
        if not self.scheduled_date:
            return False

        return (
            self.scheduled_date
            <
            datetime.utcnow().date()
            and
            self.status
            not in [
                "COMPLETED",
                "CANCELLED"
            ]
        )

    def to_dict(self):

        return {

            "id": self.id,

            "maintenance_number": self.maintenance_number,

            "vehicle_id": self.vehicle_id,

            "maintenance_type": self.maintenance_type,

            "status": self.status,

            "priority": self.priority,

            "service_center": self.service_center,

            "technician_name": self.technician_name,

            "invoice_number": self.invoice_number,

            "current_odometer": self.current_odometer,

            "next_service_odometer": self.next_service_odometer,

            "scheduled_date":
                self.scheduled_date.isoformat()
                if self.scheduled_date
                else None,

            "start_date":
                self.start_date.isoformat()
                if self.start_date
                else None,

            "completion_date":
                self.completion_date.isoformat()
                if self.completion_date
                else None,

            "estimated_cost": self.estimated_cost,

            "labour_cost": self.labour_cost,

            "parts_cost": self.parts_cost,

            "total_cost": self.total_cost,

            "payment_status": self.payment_status,

            "next_service_date":
                self.next_service_date.isoformat()
                if self.next_service_date
                else None,

            "warranty_available":
                self.warranty_available,

            "vendor_name":
                self.vendor_name,

            "notes":
                self.notes,

            "created_at":
                self.created_at.isoformat(),

            "updated_at":
                self.updated_at.isoformat()
        }

    def __repr__(self):

        return (
            f"<Maintenance "
            f"{self.maintenance_number}>"
        )