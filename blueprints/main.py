from flask import Blueprint, session, render_template, redirect, url_for, flash
import logging
from bson.objectid import ObjectId
from bson.errors import InvalidId
from extensions import mongo
from utils.db_utils import safe_database_operation
from forms import Data


logger = logging.getLogger(__name__)
main_bp = Blueprint("main", __name__)


@main_bp.route("/")
@main_bp.route("/home")
def home():
    if not session.get('user_id'):
        flash("Please log in to view your Library.", "warning")
        return redirect(url_for('auth.login'))

    if mongo.users is None or mongo.books is None:
        flash("Database unavailable. Please try again later.", "danger")
        return render_template("index.html", title="Home - My Reading Journey", books=[], json_form=Data())

    try:
        user_id = ObjectId(session['user_id'])
        books = safe_database_operation(
            lambda: list(mongo.books.find({'user_id': user_id}).sort('reading_started', 1))
        ) or []

    except (InvalidId, Exception) as e:
        logger.error(f"Error fetching books for user {session.get('user_id')}: {e}")
        books = []
        flash("Error loading your books. Please try refreshing the page.", "warning")

    return render_template("index.html", title="Home - My Reading Journey", books=books, json_form=Data())


@main_bp.route("/about")
def about():
    return render_template('about.html', title='About - My Reading Journey', json_form=Data())


@main_bp.route("/developer")
def developer():
    return render_template('developer.html', title='Developer - My Reading Journey', json_form=Data())