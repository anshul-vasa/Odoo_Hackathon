from marshmallow import Schema, fields, validate


class RegisterSchema(Schema):
    """
    Schema for user registration.
    """

    username = fields.Str(
        required=True,
        validate=validate.Length(
            min=3,
            max=80
        )
    )

    email = fields.Email(
        required=True
    )

    password = fields.Str(
        required=True,
        validate=validate.Length(
            min=6
        ),
        load_only=True
    )

    role_id = fields.Int(
        required=True
    )



class LoginSchema(Schema):
    """
    Schema for user login.
    """

    email = fields.Email(
        required=True
    )

    password = fields.Str(
        required=True,
        load_only=True
    )



class UserSchema(Schema):
    """
    User response schema.
    """

    id = fields.Int()

    username = fields.Str()

    email = fields.Email()

    role = fields.Str(
        allow_none=True
    )

    is_active = fields.Bool()

    last_login = fields.DateTime(
        allow_none=True
    )

    created_at = fields.DateTime()



class TokenSchema(Schema):
    """
    JWT token response schema.
    """

    access_token = fields.Str(
        required=True
    )

    token_type = fields.Str(
        default="Bearer"
    )

    user = fields.Nested(
        UserSchema
    )