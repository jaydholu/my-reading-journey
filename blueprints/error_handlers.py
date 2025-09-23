from flask import Blueprint, request, render_template, redirect, url_for, flash
from werkzeug.exceptions import RequestEntityTooLarge


errors_bp = Blueprint("errors", __name__)


@errors_bp.app_errorhandler(413)
@errors_bp.app_errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    flash("File too large. Please upload a smaller image (max 16MB).", "danger")
    return redirect(request.referrer or url_for("main.home"))


@errors_bp.app_errorhandler(500)
def handle_internal_error(e):
    flash("An internal error occurred. Please try again later.", "danger")
    return redirect(url_for("main.home"))


@errors_bp.app_errorhandler(404)
def handle_not_found(e):
    return render_template("404.html"), 404
