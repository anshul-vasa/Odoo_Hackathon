from marshmallow import Schema, fields, validate, validates, ValidationError


# ---------------------------------------
# Create Vehicle Schema
# ---------------------------------------

class CreateVehicleSchema(Schema):

    registration_number = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=50)
    )

    vehicle_name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100)
    )

    vehicle_type = fields.Str(
        required=True,
        validate=validate.OneOf([
            "Truck",
            "Mini Truck",
            "Van",
            "Pickup",
            "Trailer",
            "Container"
        ])
    )

    maximum_load_capacity = fields.Float(
        required=True
    )

    odometer = fields.Float(
        required=True
    )

    acquisition_cost = fields.Float(
        required=True
    )

    status = fields.Str(
        load_default="Available",
        validate=validate.OneOf([
            "Available",
            "On Trip",
            "In Shop",
            "Retired"
        ])
    )

    @validates("maximum_load_capacity")
    def validate_capacity(self, value, **kwargs):
        if value <= 0:
            raise ValidationError(
                "Maximum load capacity must be greater than 0."
            )

    @validates("odometer")
    def validate_odometer(self, value, **kwargs):
        if value < 0:
            raise ValidationError(
                "Odometer cannot be negative."
            )

    @validates("acquisition_cost")
    def validate_cost(self, value, **kwargs):
        if value <= 0:
            raise ValidationError(
                "Acquisition cost must be greater than 0."
            )


# ---------------------------------------
# Update Vehicle Schema
# ---------------------------------------

class UpdateVehicleSchema(Schema):

    vehicle_name = fields.Str(
        validate=validate.Length(min=2, max=100)
    )

    vehicle_type = fields.Str(
        validate=validate.OneOf([
            "Truck",
            "Mini Truck",
            "Van",
            "Pickup",
            "Trailer",
            "Container"
        ])
    )

    maximum_load_capacity = fields.Float()

    odometer = fields.Float()

    acquisition_cost = fields.Float()

    status = fields.Str(
        validate=validate.OneOf([
            "Available",
            "On Trip",
            "In Shop",
            "Retired"
        ])
    )

    @validates("maximum_load_capacity")
    def validate_capacity(self, value, **kwargs):
        if value <= 0:
            raise ValidationError(
                "Maximum load capacity must be greater than 0."
            )

    @validates("odometer")
    def validate_odometer(self, value, **kwargs):
        if value < 0:
            raise ValidationError(
                "Odometer cannot be negative."
            )

    @validates("acquisition_cost")
    def validate_cost(self, value, **kwargs):
        if value <= 0:
            raise ValidationError(
                "Acquisition cost must be greater than 0."
            )


# ---------------------------------------
# Update Vehicle Status Schema
# ---------------------------------------

class UpdateVehicleStatusSchema(Schema):

    status = fields.Str(
        required=True,
        validate=validate.OneOf([
            "Available",
            "On Trip",
            "In Shop",
            "Retired"
        ])
    )