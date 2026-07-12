from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db


class Role(db.Model):
    """
    Role model for role-based access control.
    """

    __tablename__ = "roles"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    description = db.Column(
        db.String(255),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )


    users = db.relationship(
        "User",
        back_populates="role"
    )


    def __repr__(self):
        return f"<Role {self.name}>"



class User(db.Model):
    """
    User model for authentication.
    """

    __tablename__ = "users"


    id = db.Column(
        db.Integer,
        primary_key=True
    )


    username = db.Column(
        db.String(80),
        unique=True,
        nullable=False,
        index=True
    )


    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False,
        index=True
    )


    password_hash = db.Column(
        db.String(255),
        nullable=False
    )


    role_id = db.Column(
        db.Integer,
        db.ForeignKey("roles.id"),
        nullable=False
    )


    is_active = db.Column(
        db.Boolean,
        default=True,
        nullable=False
    )


    last_login = db.Column(
        db.DateTime,
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


    role = db.relationship(
        "Role",
        back_populates="users"
    )


    def set_password(self, password):
        """
        Generate hashed password.
        """

        self.password_hash = generate_password_hash(
            password
        )


    def check_password(self, password):
        """
        Verify user password.
        """

        return check_password_hash(
            self.password_hash,
            password
        )


    def to_dict(self):
        """
        Convert user object to JSON.
        """

        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": (
                self.role.name
                if self.role
                else None
            ),
            "is_active": self.is_active,
            "last_login": (
                self.last_login.isoformat()
                if self.last_login
                else None
            ),
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }


    def __repr__(self):
        return f"<User {self.username}>"