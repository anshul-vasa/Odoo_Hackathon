from marshmallow import Schema, fields, validate, validates, ValidationError


# -----------------------------
# Register Schema
# -----------------------------
class RegisterSchema(Schema):
    first_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=50)
    )

    last_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=50)
    )

    email = fields.Email(required=True)

    password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=50)
    )

    confirm_password = fields.Str(required=True)

    role = fields.Str(
        required=True,
        validate=validate.OneOf([
            "Admin",
            "Fleet Manager",
            "Dispatcher",
            "Safety Officer",
            "Financial Analyst"
        ])
    )

    @validates("password")
    def validate_password(self, value, **kwargs):
        if len(value) < 8:
            raise ValidationError(
                "Password must be at least 8 characters long."
            )

    @validates("confirm_password")
    def validate_confirm_password(self, value, **kwargs):
        pass

    def validate(self, data, **kwargs):
        errors = super().validate(data, **kwargs)

        if data.get("password") != data.get("confirm_password"):
            errors.setdefault(
                "confirm_password",
                []
            ).append("Passwords do not match.")

        return errors


# -----------------------------
# Login Schema
# -----------------------------
class LoginSchema(Schema):
    email = fields.Email(required=True)

    password = fields.Str(
        required=True,
        validate=validate.Length(min=8)
    )


# -----------------------------
# Change Password Schema
# -----------------------------
class ChangePasswordSchema(Schema):
    old_password = fields.Str(required=True)

    new_password = fields.Str(
        required=True,
        validate=validate.Length(min=8, max=50)
    )

    confirm_password = fields.Str(required=True)

    def validate(self, data, **kwargs):
        errors = super().validate(data, **kwargs)

        if data.get("new_password") != data.get("confirm_password"):
            errors.setdefault(
                "confirm_password",
                []
            ).append("Passwords do not match.")

        return errors