"""
Trip module constants.

Contains:
- Trip statuses
- Trip types
- Trip priorities
"""

# ==========================================================
# Trip Statuses
# ==========================================================

TRIP_STATUS_SCHEDULED = "SCHEDULED"
TRIP_STATUS_STARTED = "STARTED"
TRIP_STATUS_IN_PROGRESS = "IN_PROGRESS"
TRIP_STATUS_COMPLETED = "COMPLETED"
TRIP_STATUS_CANCELLED = "CANCELLED"
TRIP_STATUS_DELAYED = "DELAYED"


TRIP_STATUSES = [
    TRIP_STATUS_SCHEDULED,
    TRIP_STATUS_STARTED,
    TRIP_STATUS_IN_PROGRESS,
    TRIP_STATUS_COMPLETED,
    TRIP_STATUS_CANCELLED,
    TRIP_STATUS_DELAYED,
]


# ==========================================================
# Active Trip Statuses
# ==========================================================

ACTIVE_TRIP_STATUSES = [
    TRIP_STATUS_SCHEDULED,
    TRIP_STATUS_STARTED,
    TRIP_STATUS_IN_PROGRESS,
    TRIP_STATUS_DELAYED,
]


# ==========================================================
# Closed Trip Statuses
# ==========================================================

CLOSED_TRIP_STATUSES = [
    TRIP_STATUS_COMPLETED,
    TRIP_STATUS_CANCELLED,
]


# ==========================================================
# Trip Types
# ==========================================================

TRIP_TYPE_ONE_WAY = "ONE_WAY"
TRIP_TYPE_ROUND_TRIP = "ROUND_TRIP"
TRIP_TYPE_MULTI_CITY = "MULTI_CITY"


TRIP_TYPES = [
    TRIP_TYPE_ONE_WAY,
    TRIP_TYPE_ROUND_TRIP,
    TRIP_TYPE_MULTI_CITY,
]


# ==========================================================
# Trip Priorities
# ==========================================================

TRIP_PRIORITY_LOW = "LOW"
TRIP_PRIORITY_MEDIUM = "MEDIUM"
TRIP_PRIORITY_HIGH = "HIGH"
TRIP_PRIORITY_URGENT = "URGENT"


TRIP_PRIORITIES = [
    TRIP_PRIORITY_LOW,
    TRIP_PRIORITY_MEDIUM,
    TRIP_PRIORITY_HIGH,
    TRIP_PRIORITY_URGENT,
]