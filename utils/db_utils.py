from flask import flash
import logging
from pymongo.errors import ConnectionFailure


logger = logging.getLogger(__name__)


def safe_database_operation(operation, *args, **kwargs):
    try:
        return operation(*args, **kwargs)
    except ConnectionFailure:
        logger.error("Database connection lost")
        flash("Database connection error. Try again.", "danger")
    except Exception as e:
        logger.error(f"DB operation failed: {e}")
        flash("Database error. Try again.", "danger")
    return None
