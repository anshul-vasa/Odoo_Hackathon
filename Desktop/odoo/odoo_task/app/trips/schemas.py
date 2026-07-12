from marshmallow import Schema, fields, validate

from app.trips.constants import (
    TRIP_STATUSES,
    TRIP_TYPES,
    TRIP_PRIORITIES
)


class TripCreateSchema(Schema):
    """
    Schema for creating a trip.
    """

    trip_number = fields.Str(
        required=True,
        validate=validate.Length(
            min=3,
            max=30
        )
    )

    vehicle_id = fields.Int(
        required=True
    )

    driver_id = fields.Int(
        required=True
    )

    source = fields.Str(
        required=True,
        validate=validate.Length(
            min=2,
            max=150
        )
    )

    destination = fields.Str(
        required=True,
        validate=validate.Length(
            min=2,
            max=150
        )
    )

    trip_type = fields.Str(
        load_default="ONE_WAY",
        validate=validate.OneOf(
            TRIP_TYPES
        )
    )

    priority = fields.Str(
        load_default="MEDIUM",
        validate=validate.OneOf(
            TRIP_PRIORITIES
        )
    )

    scheduled_start = fields.DateTime(
        required=True
    )

    scheduled_end = fields.DateTime(
        required=True
    )

    start_odometer = fields.Int(
        allow_none=True
    )

    cargo_description = fields.Str(
        allow_none=True
    )

    notes = fields.Str(
        allow_none=True
    )


class TripUpdateSchema(Schema):
    """
    Schema for updating trip.
    """

    source = fields.Str()

    destination = fields.Str()

    vehicle_id = fields.Int()

    driver_id = fields.Int()

    trip_type = fields.Str(
        validate=validate.OneOf(
            TRIP_TYPES
        )
    )

    priority = fields.Str(
        validate=validate.OneOf(
            TRIP_PRIORITIES
        )
    )

    status = fields.Str(
        validate=validate.OneOf(
            TRIP_STATUSES
        )
    )

    scheduled_start = fields.DateTime()

    scheduled_end = fields.DateTime()

    actual_start = fields.DateTime()

    actual_end = fields.DateTime()

    start_odometer = fields.Int()

    end_odometer = fields.Int()

    distance = fields.Float()

    cargo_description = fields.Str()

    notes = fields.Str()


class TripResponseSchema(Schema):
    """
    Schema for trip response.
    """

    id = fields.Int()

    trip_number = fields.Str()

    vehicle_id = fields.Int()

    driver_id = fields.Int()

    source = fields.Str()

    destination = fields.Str()

    trip_type = fields.Str()

    priority = fields.Str()

    status = fields.Str()

    scheduled_start = fields.DateTime()

    scheduled_end = fields.DateTime()

    actual_start = fields.DateTime(
        allow_none=True
    )

    actual_end = fields.DateTime(
        allow_none=True
    )

    start_odometer = fields.Int(
        allow_none=True
    )

    end_odometer = fields.Int(
        allow_none=True
    )

    distance = fields.Float()

    cargo_description = fields.Str(
        allow_none=True
    )

    notes = fields.Str(
        allow_none=True
    )

    created_at = fields.DateTime()

    updated_at = fields.DateTime()


# ==========================================================
# Schema Instances
# ==========================================================

trip_create_schema = TripCreateSchema()

trip_update_schema = TripUpdateSchema()

trip_response_schema = TripResponseSchema()

trips_response_schema = TripResponseSchema(
    many=True
)