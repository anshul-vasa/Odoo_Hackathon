from datetime import datetime

from app.extensions import db


class Maintenance(db.Model):
    """
    Maintenance Model
    Stores maintenance records for vehicles.
    """

    __tablename__ = "maintenance_logs"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    vehicle_id = db.Column(
        db.Integer,
        db.ForeignKey("vehicles.id"),
        nullable=False
    )

    maintenance_type = db.Column(
        db.String(100),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    service_center = db.Column(
        db.String(150),
        nullable=True
    )

    maintenance_date = db.Column(
        db.Date,
        nullable=False
    )

    expected_completion_date = db.Column(
        db.Date,
        nullable=True
    )

    completed_date = db.Column(
        db.Date,
        nullable=True
    )

    cost = db.Column(
        db.Float,
        default=0.0,
        nullable=False
    )

    odometer = db.Column(
        db.Float,
        nullable=True
    )

    status = db.Column(
        db.Enum(
            "Pending",
            "In Progress",
            "Completed",
            "Cancelled",
            name="maintenance_status"
        ),
        default="Pending",
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

    # ----------------------------------------
    # Relationships
    # ----------------------------------------

    vehicle = db.relationship(
        "Vehicle",
        back_populates="maintenance_logs"
    )

    # ----------------------------------------
    # Helper Properties
    # ----------------------------------------

    @property
    def is_pending(self):
        return self.status == "Pending"

    @property
    def is_in_progress(self):
        return self.status == "In Progress"

    @property
    def is_completed(self):
        return self.status == "Completed"

    @property
    def is_cancelled(self):
        return self.status == "Cancelled"

    # ----------------------------------------
    # Serialization
    # ----------------------------------------

    def to_dict(self):
        return {
            "id": self.id,
            "vehicle_id": self.vehicle_id,
            "maintenance_type": self.maintenance_type,
            "description": self.description,
            "service_center": self.service_center,
            "maintenance_date": self.maintenance_date.isoformat() if self.maintenance_date else None,
            "expected_completion_date": self.expected_completion_date.isoformat() if self.expected_completion_date else None,
            "completed_date": self.completed_date.isoformat() if self.completed_date else None,
            "cost": self.cost,
            "odometer": self.odometer,
            "status": self.status,
            "remarks": self.remarks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    # ----------------------------------------
    # String Representation
    # ----------------------------------------

    def __repr__(self):
        return (
            f"<Maintenance "
            f"{self.id} - "
            f"{self.maintenance_type} - "
            f"{self.status}>"
        )