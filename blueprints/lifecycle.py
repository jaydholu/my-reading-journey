from flask import Blueprint, session, flash
from bson.objectid import ObjectId
from bson.errors import InvalidId
from extensions import mongo
from utils.db_utils import safe_database_operation
from config import Config


lifecycle_bp = Blueprint("lifecycle", __name__)
con = Config()


@lifecycle_bp.after_app_request
def add_header(response):
    """Prevent browser caching issues"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@lifecycle_bp.before_app_request
def check_user_session():
    if "user_id" in session and mongo.users is not None:
        try:
            user = safe_database_operation(mongo.users.find_one, {"_id": ObjectId(session["user_id"])})
            if not user:
                session.clear()
                flash("Session invalid. Please log in again.", "warning")
        except (InvalidId, Exception):
            session.clear()


@lifecycle_bp.app_context_processor
def inject_user():
    current_user = None
    if "user_id" in session and mongo.users is not None:
        try:
            current_user = safe_database_operation(mongo.users.find_one, {"_id": ObjectId(session["user_id"])})
        except (InvalidId, Exception):
            current_user = None
    return dict(
        current_user=current_user,
        default_cover_url=con.DEFAULT_COVER_IMAGE_URL
    )
    