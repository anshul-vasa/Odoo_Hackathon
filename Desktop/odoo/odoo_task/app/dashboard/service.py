from sqlalchemy import func

from app.extensions import db
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.trip import Trip
from app.models.maintenance import Maintenance
from app.models.fuel_log import FuelLog
from app.models.expense import Expense


class DashboardService:

    @staticmethod
    def get_dashboard_summary():

        # ----------------------------
        # Vehicle KPIs
        # ----------------------------

        total_vehicles = Vehicle.query.count()

        active_vehicles = Vehicle.query.filter(
            Vehicle.status == "On Trip"
        ).count()

        available_vehicles = Vehicle.query.filter(
            Vehicle.status == "Available"
        ).count()

        vehicles_in_shop = Vehicle.query.filter(
            Vehicle.status == "In Shop"
        ).count()

        retired_vehicles = Vehicle.query.filter(
            Vehicle.status == "Retired"
        ).count()

        # ----------------------------
        # Driver KPIs
        # ----------------------------

        total_drivers = Driver.query.count()

        drivers_on_duty = Driver.query.filter(
            Driver.status == "On Trip"
        ).count()

        drivers_available = Driver.query.filter(
            Driver.status == "Available"
        ).count()

        drivers_off_duty = Driver.query.filter(
            Driver.status == "Off Duty"
        ).count()

        suspended_drivers = Driver.query.filter(
            Driver.status == "Suspended"
        ).count()

        # ----------------------------
        # Trip KPIs
        # ----------------------------

        active_trips = Trip.query.filter(
            Trip.status == "Dispatched"
        ).count()

        pending_trips = Trip.query.filter(
            Trip.status == "Draft"
        ).count()

        completed_trips = Trip.query.filter(
            Trip.status == "Completed"
        ).count()

        cancelled_trips = Trip.query.filter(
            Trip.status == "Cancelled"
        ).count()

        # ----------------------------
        # Maintenance
        # ----------------------------

        active_maintenance = Maintenance.query.filter(
            Maintenance.status.in_(["Pending", "In Progress"])
        ).count()

        completed_maintenance = Maintenance.query.filter(
            Maintenance.status == "Completed"
        ).count()

        # ----------------------------
        # Fuel Cost
        # ----------------------------

        total_fuel_cost = db.session.query(
            func.coalesce(func.sum(FuelLog.total_cost), 0)
        ).scalar()

        # ----------------------------
        # Maintenance Cost
        # ----------------------------

        total_maintenance_cost = db.session.query(
            func.coalesce(func.sum(Maintenance.cost), 0)
        ).scalar()

        # ----------------------------
        # Other Expenses
        # ----------------------------

        total_other_expenses = db.session.query(
            func.coalesce(func.sum(Expense.amount), 0)
        ).scalar()

        # ----------------------------
        # Operational Cost
        # ----------------------------

        total_operational_cost = (
            total_fuel_cost
            + total_maintenance_cost
            + total_other_expenses
        )

        # ----------------------------
        # Fleet Utilization
        # ----------------------------

        if total_vehicles == 0:
            fleet_utilization = 0
        else:
            fleet_utilization = round(
                (active_vehicles / total_vehicles) * 100,
                2
            )

        # ----------------------------
        # Response
        # ----------------------------

        return {

            "vehicles": {
                "total": total_vehicles,
                "active": active_vehicles,
                "available": available_vehicles,
                "in_shop": vehicles_in_shop,
                "retired": retired_vehicles
            },

            "drivers": {
                "total": total_drivers,
                "on_duty": drivers_on_duty,
                "available": drivers_available,
                "off_duty": drivers_off_duty,
                "suspended": suspended_drivers
            },

            "trips": {
                "active": active_trips,
                "pending": pending_trips,
                "completed": completed_trips,
                "cancelled": cancelled_trips
            },

            "maintenance": {
                "active": active_maintenance,
                "completed": completed_maintenance
            },

            "expenses": {
                "fuel_cost": float(total_fuel_cost),
                "maintenance_cost": float(total_maintenance_cost),
                "other_expenses": float(total_other_expenses),
                "operational_cost": float(total_operational_cost)
            },

            "fleet_utilization": fleet_utilization
        }