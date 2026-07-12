from marshmallow import Schema, fields, validate


class DriverCreateSchema(Schema):
    """
    Schema for creating a new driver.
    """

    first_name = fields.Str(
        required=True,
        validate=validate.Length(
            min=2,
            max=50
        )
    )

    last_name = fields.Str(
        allow_none=True,
        validate=validate.Length(
            max=50
        )
    )

    phone_number = fields.Str(
        required=True,
        validate=validate.Length(
            min=10,
            max=15
        )
    )

    email = fields.Email(
        allow_none=True
    )

    date_of_birth = fields.Date(
        allow_none=True
    )


    # Address
    address = fields.Str(
        allow_none=True
    )

    city = fields.Str(
        allow_none=True
    )

    state = fields.Str(
        allow_none=True
    )


    # License Details
    license_number = fields.Str(
        required=True
    )

    license_type = fields.Str(
        required=True
    )

    license_issue_date = fields.Date(
        allow_none=True
    )

    license_expiry_date = fields.Date(
        required=True
    )


    # Employment
    joining_date = fields.Date(
        allow_none=True
    )

    experience_years = fields.Int(
        load_default=0
    )


    # Emergency Details
    emergency_contact_name = fields.Str(
        allow_none=True
    )

    emergency_contact_number = fields.Str(
        allow_none=True
    )


    blood_group = fields.Str(
        allow_none=True
    )

    notes = fields.Str(
        allow_none=True
    )



class DriverUpdateSchema(Schema):
    """
    Schema for updating driver information.
    """

    first_name = fields.Str()

    last_name = fields.Str()

    phone_number = fields.Str()

    email = fields.Email()


    address = fields.Str()

    city = fields.Str()

    state = fields.Str()


    license_number = fields.Str()

    license_type = fields.Str()

    license_expiry_date = fields.Date()


    experience_years = fields.Int()

    status = fields.Str()



class DriverResponseSchema(Schema):
    """
    Schema for driver response.
    """

    id = fields.Int()

    first_name = fields.Str()

    last_name = fields.Str()

    phone_number = fields.Str()

    email = fields.Email(
        allow_none=True
    )

    date_of_birth = fields.Date(
        allow_none=True
    )


    address = fields.Str(
        allow_none=True
    )

    city = fields.Str(
        allow_none=True
    )

    state = fields.Str(
        allow_none=True
    )


    license_number = fields.Str()

    license_type = fields.Str()

    license_issue_date = fields.Date(
        allow_none=True
    )

    license_expiry_date = fields.Date()


    joining_date = fields.Date(
        allow_none=True
    )

    experience_years = fields.Int()


    status = fields.Str()


    emergency_contact_name = fields.Str(
        allow_none=True
    )

    emergency_contact_number = fields.Str(
        allow_none=True
    )


    blood_group = fields.Str(
        allow_none=True
    )

    notes = fields.Str(
        allow_none=True
    )


    created_at = fields.DateTime()

    updated_at = fields.DateTime()



# Schema instances

driver_create_schema = DriverCreateSchema()

driver_update_schema = DriverUpdateSchema()

driver_response_schema = DriverResponseSchema()

drivers_response_schema = DriverResponseSchema(
    many=True
)