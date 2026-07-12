from marshmallow import Schema, fields, validate

from app.maintenance.constants import (
    MAINTENANCE_STATUSES,
    MAINTENANCE_TYPES,
    MAINTENANCE_PRIORITIES,
    PAYMENT_STATUSES
)


class MaintenanceCreateSchema(Schema):
    """
    Schema for creating maintenance.
    """

    maintenance_number = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=30)
    )

    vehicle_id = fields.Int(
        required=True
    )

    maintenance_type = fields.Str(
        required=True,
        validate=validate.OneOf(
            MAINTENANCE_TYPES
        )
    )

    priority = fields.Str(
        load_default="MEDIUM",
        validate=validate.OneOf(
            MAINTENANCE_PRIORITIES
        )
    )

    service_center = fields.Str(
        required=True,
        validate=validate.Length(max=150)
    )

    technician_name = fields.Str()

    invoice_number = fields.Str()

    current_odometer = fields.Int(
        required=True
    )

    next_service_odometer = fields.Int()

    scheduled_date = fields.Date(
        required=True
    )

    estimated_cost = fields.Float(
        load_default=0.0
    )

    labour_cost = fields.Float(
        load_default=0.0
    )

    parts_cost = fields.Float(
        load_default=0.0
    )

    payment_status = fields.Str(
        load_default="PENDING",
        validate=validate.OneOf(
            PAYMENT_STATUSES
        )
    )

    next_service_date = fields.Date()

    warranty_available = fields.Bool(
        load_default=False
    )

    vendor_name = fields.Str()

    notes = fields.Str()


class MaintenanceUpdateSchema(Schema):
    """
    Schema for updating maintenance.
    """

    maintenance_type = fields.Str(
        validate=validate.OneOf(
            MAINTENANCE_TYPES
        )
    )

    status = fields.Str(
        validate=validate.OneOf(
            MAINTENANCE_STATUSES
        )
    )

    priority = fields.Str(
        validate=validate.OneOf(
            MAINTENANCE_PRIORITIES
        )
    )

    service_center = fields.Str()

    technician_name = fields.Str()

    invoice_number = fields.Str()

    current_odometer = fields.Int()

    next_service_odometer = fields.Int()

    scheduled_date = fields.Date()

    start_date = fields.DateTime()

    completion_date = fields.DateTime()

    estimated_cost = fields.Float()

    labour_cost = fields.Float()

    parts_cost = fields.Float()

    total_cost = fields.Float()

    payment_status = fields.Str(
        validate=validate.OneOf(
            PAYMENT_STATUSES
        )
    )

    next_service_date = fields.Date()

    warranty_available = fields.Bool()

    vendor_name = fields.Str()

    notes = fields.Str()


class MaintenanceResponseSchema(Schema):
    """
    Maintenance response schema.
    """

    id = fields.Int()

    maintenance_number = fields.Str()

    vehicle_id = fields.Int()

    maintenance_type = fields.Str()

    status = fields.Str()

    priority = fields.Str()

    service_center = fields.Str()

    technician_name = fields.Str()

    invoice_number = fields.Str()

    current_odometer = fields.Int()

    next_service_odometer = fields.Int()

    scheduled_date = fields.Date()

    start_date = fields.DateTime(
        allow_none=True
    )

    completion_date = fields.DateTime(
        allow_none=True
    )

    estimated_cost = fields.Float()

    labour_cost = fields.Float()

    parts_cost = fields.Float()

    total_cost = fields.Float()

    payment_status = fields.Str()

    next_service_date = fields.Date(
        allow_none=True
    )

    warranty_available = fields.Bool()

    vendor_name = fields.Str()

    notes = fields.Str(
        allow_none=True
    )

    created_at = fields.DateTime()

    updated_at = fields.DateTime()


# ======================================================
# Schema Instances
# ======================================================

maintenance_create_schema = MaintenanceCreateSchema()

maintenance_update_schema = MaintenanceUpdateSchema()

maintenance_response_schema = MaintenanceResponseSchema()

maintenance_list_schema = MaintenanceResponseSchema(
    many=True
)