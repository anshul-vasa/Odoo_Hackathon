from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.vehicle import Vehicle

# from app.vehicles.validators import (
#     registration_number_exists,
# )
from app.vehicles.validators import (
    registration_number_exists,
    can_delete_vehicle,
    validate_vehicle_status
)

class VehicleService:
    """
    Business Logic for Vehicle Module
    """

    # -------------------------------------------------
    # Create Vehicle
    # -------------------------------------------------

    @staticmethod
    def create_vehicle(data):

        try:

            if registration_number_exists(
                data["registration_number"]
            ):
                return {
                    "success": False,
                    "message": "Vehicle with this registration number already exists."
                }, 409

            vehicle = Vehicle(
                registration_number=data["registration_number"],
                vehicle_name=data["vehicle_name"],
                vehicle_type=data["vehicle_type"],
                maximum_load_capacity=data["maximum_load_capacity"],
                odometer=data["odometer"],
                acquisition_cost=data["acquisition_cost"],
                status=data.get("status", "Available")
            )

            db.session.add(vehicle)
            db.session.commit()

            return {
                "success": True,
                "message": "Vehicle created successfully.",
                "data": vehicle.to_dict()
            }, 201

        except SQLAlchemyError as e:

            db.session.rollback()

            return {
                "success": False,
                "message": str(e)
            }, 500

        except Exception as e:

            db.session.rollback()

            return {
                "success": False,
                "message": str(e)
            }, 500

    # -------------------------------------------------
    # Get All Vehicles
    # -------------------------------------------------

    @staticmethod
    def get_all_vehicles(
        page=1,
        per_page=10,
        search=None
    ):

        try:

            query = Vehicle.query

            if search:

                search = f"%{search}%"

                query = query.filter(
                    db.or_(
                        Vehicle.registration_number.ilike(search),
                        Vehicle.vehicle_name.ilike(search),
                        Vehicle.vehicle_type.ilike(search)
                    )
                )

            pagination = query.order_by(
                Vehicle.id.desc()
            ).paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )

            vehicles = [
                vehicle.to_dict()
                for vehicle in pagination.items
            ]

            return {
                "success": True,
                "message": "Vehicles fetched successfully.",
                "data": vehicles,
                "pagination": {
                    "page": pagination.page,
                    "per_page": pagination.per_page,
                    "total_records": pagination.total,
                    "total_pages": pagination.pages,
                    "has_next": pagination.has_next,
                    "has_prev": pagination.has_prev
                }
            }, 200

        except Exception as e:

            return {
                "success": False,
                "message": str(e)
            }, 500
            

    # -------------------------------------------------
    # Get Vehicle By ID
    # -------------------------------------------------

    @staticmethod
    def get_vehicle_by_id(vehicle_id):

        try:

            vehicle = Vehicle.query.get(vehicle_id)

            if not vehicle:
                return {
                    "success": False,
                    "message": "Vehicle not found."
                }, 404

            return {
                "success": True,
                "message": "Vehicle fetched successfully.",
                "data": vehicle.to_dict()
            }, 200

        except Exception as e:

            return {
                "success": False,
                "message": str(e)
            }, 500

    # -------------------------------------------------
    # Update Vehicle
    # -------------------------------------------------

    @staticmethod
    def update_vehicle(vehicle_id, data):

        try:

            vehicle = Vehicle.query.get(vehicle_id)

            if not vehicle:
                return {
                    "success": False,
                    "message": "Vehicle not found."
                }, 404

            # Check duplicate registration number
            if (
                "registration_number" in data and
                data["registration_number"] != vehicle.registration_number
            ):

                if registration_number_exists(
                    data["registration_number"],
                    vehicle.id
                ):
                    return {
                        "success": False,
                        "message": "Registration number already exists."
                    }, 409

                vehicle.registration_number = data["registration_number"]

            # Update fields
            if "vehicle_name" in data:
                vehicle.vehicle_name = data["vehicle_name"]

            if "vehicle_type" in data:
                vehicle.vehicle_type = data["vehicle_type"]

            if "maximum_load_capacity" in data:
                vehicle.maximum_load_capacity = data["maximum_load_capacity"]

            if "odometer" in data:
                vehicle.odometer = data["odometer"]

            if "acquisition_cost" in data:
                vehicle.acquisition_cost = data["acquisition_cost"]

            if "status" in data:
                vehicle.status = data["status"]

            db.session.commit()

            return {
                "success": True,
                "message": "Vehicle updated successfully.",
                "data": vehicle.to_dict()
            }, 200

        except SQLAlchemyError as e:

            db.session.rollback()

            return {
                "success": False,
                "message": str(e)
            }, 500

        except Exception as e:

            db.session.rollback()

            return {
                "success": False,
                "message": str(e)
            }, 500


    # -------------------------------------------------
    # Delete Vehicle
    # -------------------------------------------------

    @staticmethod
    def delete_vehicle(vehicle_id):

        try:

            vehicle = Vehicle.query.get(vehicle_id)

            if not vehicle:
                return {
                    "success": False,
                    "message": "Vehicle not found."
                }, 404

            if not can_delete_vehicle(vehicle_id):
                return {
                    "success": False,
                    "message": "Vehicle cannot be deleted because it has active trips."
                }, 400

            db.session.delete(vehicle)
            db.session.commit()

            return {
                "success": True,
                "message": "Vehicle deleted successfully."
            }, 200

        except SQLAlchemyError as e:

            db.session.rollback()

            return {
                "success": False,
                "message": str(e)
            }, 500

        except Exception as e:

            db.session.rollback()

            return {
                "success": False,
                "message": str(e)
            }, 500

    # -------------------------------------------------
    # Update Vehicle Status
    # -------------------------------------------------

    @staticmethod
    def update_vehicle_status(vehicle_id, status):

        try:

            vehicle = Vehicle.query.get(vehicle_id)

            if not vehicle:
                return {
                    "success": False,
                    "message": "Vehicle not found."
                }, 404

            if not validate_vehicle_status(
                vehicle.status,
                status
            ):
                return {
                    "success": False,
                    "message": f"Invalid status transition from '{vehicle.status}' to '{status}'."
                }, 400

            vehicle.status = status

            db.session.commit()

            return {
                "success": True,
                "message": "Vehicle status updated successfully.",
                "data": vehicle.to_dict()
            }, 200

        except SQLAlchemyError as e:

            db.session.rollback()

            return {
                "success": False,
                "message": str(e)
            }, 500

        except Exception as e:

            db.session.rollback()

            return {
                "success": False,
                "message": str(e)
            }, 500

    # -------------------------------------------------
    # Get Available Vehicles
    # -------------------------------------------------

    @staticmethod
    def get_available_vehicles():

        try:

            vehicles = Vehicle.query.filter_by(
                status="Available"
            ).order_by(
                Vehicle.vehicle_name.asc()
            ).all()

            return {
                "success": True,
                "message": "Available vehicles fetched successfully.",
                "count": len(vehicles),
                "data": [
                    vehicle.to_dict()
                    for vehicle in vehicles
                ]
            }, 200

        except Exception as e:

            return {
                "success": False,
                "message": str(e)
            }, 500