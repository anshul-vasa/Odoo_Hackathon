from datetime import datetime

from app.extensions import db


class Driver(db.Model):
    """
    Driver model for transport operations.
    """

    __tablename__ = "drivers"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    # Personal Information
    first_name = db.Column(
        db.String(50),
        nullable=False
    )

    last_name = db.Column(
        db.String(50),
        nullable=True
    )

    phone_number = db.Column(
        db.String(15),
        unique=True,
        nullable=False,
        index=True
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=True
    )

    date_of_birth = db.Column(
        db.Date,
        nullable=True
    )


    # Address Information
    address = db.Column(
        db.Text,
        nullable=True
    )

    city = db.Column(
        db.String(50),
        nullable=True
    )

    state = db.Column(
        db.String(50),
        nullable=True
    )


    # Driving License Information
    license_number = db.Column(
        db.String(50),
        unique=True,
        nullable=False,
        index=True
    )

    license_type = db.Column(
        db.String(50),
        nullable=False
    )

    license_issue_date = db.Column(
        db.Date,
        nullable=True
    )

    license_expiry_date = db.Column(
        db.Date,
        nullable=False
    )


    # Employment Information
    joining_date = db.Column(
        db.Date,
        nullable=True
    )

    experience_years = db.Column(
        db.Integer,
        default=0
    )


    # Driver Status
    status = db.Column(
        db.String(30),
        nullable=False,
        default="AVAILABLE"
    )


    # Emergency Contact
    emergency_contact_name = db.Column(
        db.String(100),
        nullable=True
    )

    emergency_contact_number = db.Column(
        db.String(15),
        nullable=True
    )


    # Additional Information
    blood_group = db.Column(
        db.String(10),
        nullable=True
    )

    notes = db.Column(
        db.Text,
        nullable=True
    )


    # Audit Fields
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


    def full_name(self):
        """
        Return driver's full name.
        """

        return f"{self.first_name} {self.last_name or ''}".strip()


    def to_dict(self):
        """
        Convert driver object into JSON format.
        """

        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": self.full_name(),
            "phone_number": self.phone_number,
            "email": self.email,
            "date_of_birth": (
                self.date_of_birth.isoformat()
                if self.date_of_birth
                else None
            ),
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "license_number": self.license_number,
            "license_type": self.license_type,
            "license_issue_date": (
                self.license_issue_date.isoformat()
                if self.license_issue_date
                else None
            ),
            "license_expiry_date": (
                self.license_expiry_date.isoformat()
                if self.license_expiry_date
                else None
            ),
            "joining_date": (
                self.joining_date.isoformat()
                if self.joining_date
                else None
            ),
            "experience_years": self.experience_years,
            "status": self.status,
            "emergency_contact_name": self.emergency_contact_name,
            "emergency_contact_number": self.emergency_contact_number,
            "blood_group": self.blood_group,
            "notes": self.notes,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "updated_at": (
                self.updated_at.isoformat()
                if self.updated_at
                else None
            )
        }


    def __repr__(self):
        return f"<Driver {self.license_number}>"