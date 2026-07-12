from datetime import date

from app.drivers.models import Driver


VALID_DRIVER_STATUSES = [
    "AVAILABLE",
    "ASSIGNED",
    "ON_TRIP",
    "INACTIVE",
    "SUSPENDED"
]


VALID_LICENSE_TYPES = [
    "LMV",
    "HMV",
    "TRANSPORT",
    "COMMERCIAL",
    "MCWG"
]


def validate_phone_number(phone_number):
    """
    Validate Indian phone number format.
    """

    if not phone_number:
        return False

    if len(phone_number) != 10:
        return False

    if not phone_number.isdigit():
        return False

    return True



def validate_license_type(license_type):
    """
    Validate commercial license type.
    """

    return license_type in VALID_LICENSE_TYPES



def validate_driver_status(status):
    """
    Validate driver status.
    """

    return status in VALID_DRIVER_STATUSES



def validate_age(date_of_birth):
    """
    Driver should be at least 18 years old.
    """

    if not date_of_birth:
        return True

    today = date.today()

    age = (
        today.year
        - date_of_birth.year
        - (
            (today.month, today.day)
            <
            (date_of_birth.month, date_of_birth.day)
        )
    )

    return age >= 18



def validate_license_expiry(expiry_date):
    """
    License should not be expired.
    """

    if not expiry_date:
        return False

    return expiry_date >= date.today()



def check_duplicate_driver(
    phone_number=None,
    license_number=None,
    email=None
):
    """
    Check duplicate driver records.
    """

    if phone_number:
        driver = Driver.query.filter_by(
            phone_number=phone_number
        ).first()

        if driver:
            return {
                "valid": False,
                "message": "Phone number already registered"
            }


    if license_number:
        driver = Driver.query.filter_by(
            license_number=license_number
        ).first()

        if driver:
            return {
                "valid": False,
                "message": "License number already registered"
            }


    if email:
        driver = Driver.query.filter_by(
            email=email
        ).first()

        if driver:
            return {
                "valid": False,
                "message": "Email already registered"
            }


    return {
        "valid": True
    }



def validate_driver(data):
    """
    Complete driver validation.
    """

    phone_number = data.get(
        "phone_number"
    )

    license_number = data.get(
        "license_number"
    )

    license_type = data.get(
        "license_type"
    )

    license_expiry_date = data.get(
        "license_expiry_date"
    )

    date_of_birth = data.get(
        "date_of_birth"
    )


    if not validate_phone_number(
        phone_number
    ):
        return {
            "valid": False,
            "message": "Invalid Indian phone number"
        }


    if not validate_license_type(
        license_type
    ):
        return {
            "valid": False,
            "message": "Invalid license type"
        }


    if not validate_license_expiry(
        license_expiry_date
    ):
        return {
            "valid": False,
            "message": "Driving license has expired"
        }


    if not validate_age(
        date_of_birth
    ):
        return {
            "valid": False,
            "message": "Driver must be at least 18 years old"
        }


    duplicate_check = check_duplicate_driver(
        phone_number=phone_number,
        license_number=license_number,
        email=data.get("email")
    )


    if not duplicate_check["valid"]:
        return duplicate_check


    return {
        "valid": True
    }



def validate_driver_update(data):
    """
    Validate driver updates.
    """

    if "status" in data:

        if not validate_driver_status(
            data["status"]
        ):
            return {
                "valid": False,
                "message": "Invalid driver status"
            }


    if "phone_number" in data:

        if not validate_phone_number(
            data["phone_number"]
        ):
            return {
                "valid": False,
                "message": "Invalid phone number"
            }


    return {
        "valid": True
    }