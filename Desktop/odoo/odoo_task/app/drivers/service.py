from app.extensions import db

from app.drivers.models import Driver
from app.drivers.validators import (
    validate_driver,
    validate_driver_update
)


def create_driver(data):
    """
    Create a new driver.
    """

    validation = validate_driver(data)

    if not validation["valid"]:
        raise ValueError(
            validation["message"]
        )


    driver = Driver(
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        phone_number=data.get("phone_number"),
        email=data.get("email"),

        date_of_birth=data.get(
            "date_of_birth"
        ),

        address=data.get("address"),
        city=data.get("city"),
        state=data.get("state"),

        license_number=data.get(
            "license_number"
        ),

        license_type=data.get(
            "license_type"
        ),

        license_issue_date=data.get(
            "license_issue_date"
        ),

        license_expiry_date=data.get(
            "license_expiry_date"
        ),

        joining_date=data.get(
            "joining_date"
        ),

        experience_years=data.get(
            "experience_years",
            0
        ),

        emergency_contact_name=data.get(
            "emergency_contact_name"
        ),

        emergency_contact_number=data.get(
            "emergency_contact_number"
        ),

        blood_group=data.get(
            "blood_group"
        ),

        notes=data.get(
            "notes"
        )
    )


    db.session.add(driver)
    db.session.commit()

    return driver



def get_all_drivers():
    """
    Get all drivers.
    """

    return Driver.query.order_by(
        Driver.created_at.desc()
    ).all()



def get_driver_by_id(driver_id):
    """
    Get driver by ID.
    """

    return Driver.query.get(
        driver_id
    )



def update_driver(
    driver_id,
    data
):
    """
    Update driver details.
    """

    driver = get_driver_by_id(
        driver_id
    )

    if not driver:
        return None


    validation = validate_driver_update(
        data
    )

    if not validation["valid"]:
        raise ValueError(
            validation["message"]
        )


    for key, value in data.items():

        if hasattr(
            driver,
            key
        ):
            setattr(
                driver,
                key,
                value
            )


    db.session.commit()

    return driver



def update_driver_status(
    driver_id,
    status
):
    """
    Update only driver status.
    """

    driver = get_driver_by_id(
        driver_id
    )

    if not driver:
        return None


    driver.status = status

    db.session.commit()

    return driver



def delete_driver(driver_id):
    """
    Soft delete driver.

    Instead of deleting permanently,
    mark driver as inactive.
    """

    driver = get_driver_by_id(
        driver_id
    )

    if not driver:
        return False


    driver.status = "INACTIVE"

    db.session.commit()

    return True



def get_available_drivers():
    """
    Get drivers available for trips.
    """

    return Driver.query.filter_by(
        status="AVAILABLE"
    ).all()



def search_drivers(keyword):
    """
    Search drivers by name,
    phone or license.
    """

    return Driver.query.filter(
        db.or_(
            Driver.first_name.ilike(
                f"%{keyword}%"
            ),

            Driver.last_name.ilike(
                f"%{keyword}%"
            ),

            Driver.phone_number.ilike(
                f"%{keyword}%"
            ),

            Driver.license_number.ilike(
                f"%{keyword}%"
            )
        )
    ).all()