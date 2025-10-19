from flask import Blueprint, request, session, render_template, redirect, url_for, flash
from werkzeug.security import generate_password_hash
from colorama import init, Fore
from datetime import datetime
from bson.objectid import ObjectId
from bson.errors import InvalidId

from forms import EditProfile, Data
from extensions import mongo
from utils.db_utils import safe_database_operation


init(autoreset=True)
user_bp = Blueprint("user", __name__)


@user_bp.route("/settings", methods=["GET", "POST"])
def settings():
    if not session.get('user_id'):
        flash("You must be logged in to edit your profile.", "warning")
        return redirect(url_for('auth.login'))

    if mongo.users is None:
        flash("Database unavailable. Please try again later.", "danger")
        return redirect(url_for('main.home'))

    try:
        user_oid = ObjectId(session.get('user_id'))
        user = safe_database_operation(mongo.users.find_one, {'_id': user_oid})
    except (InvalidId, Exception):
        user = None

    if not user:
        flash("User not found. Please log in again.", "danger")
        session.clear()
        return redirect(url_for('auth.login'))

    form = EditProfile()
    if form.validate_on_submit():
        try:
            email_changed = form.email.data.lower() != user['email']
            userid_changed = form.userid.data != user['userid']
            if email_changed:
                existing_email = safe_database_operation(mongo.users.find_one, {'email': form.email.data.lower(), '_id': {'$ne': user_oid}})
                if existing_email:
                    flash('This Email Address is already taken. Please choose another one.', 'danger')
                    return render_template('settings.html', title='Settings - My Reading Journey', form=form, json_form=Data())
            if userid_changed:
                existing_userid = safe_database_operation(mongo.users.find_one, {'userid': form.userid.data, '_id': {'$ne': user_oid}})
                if existing_userid:
                    flash('This User ID is already taken. Please choose another one.', 'danger')
                    return render_template('settings.html', title='Settings - My Reading Journey', form=form, json_form=Data())

            update_data = {
                'name': form.name.data.strip(), 'userid': form.userid.data.strip(),
                'email': form.email.data.strip().lower(), 'updated_at': datetime.now(datetime.timezone.utc)
            }
            if form.password.data:
                update_data['password'] = generate_password_hash(form.password.data)

            result = safe_database_operation(mongo.users.update_one, {'_id': user_oid}, {'$set': update_data})
            if result and result.modified_count > 0:
                flash("Profile updated successfully!", "success")
                print(Fore.GREEN + f"Profile updated for user: {user['email']}")
                return redirect(url_for('main.home'))
            else:
                flash("No changes were made.", "info")
                return redirect(url_for('user.settings'))
        except Exception as e:
            print(Fore.RED + f"Error updating profile for user {session.get('user_id')}: {e}")
            flash("An error occurred while updating your profile. Please try again.", "danger")

    if request.method == 'GET':
        form.name.data = user['name']
        form.userid.data = user['userid']
        form.email.data = user['email']

    return render_template('settings.html', title='Settings - My Reading Journey', form=form, json_form=Data())


@user_bp.route("/delete_account", methods=["POST"])
def delete_account():
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.login'))

    if not mongo.users or not mongo.books:
        flash("Database unavailable. Please try again later.", "danger")
        return redirect(url_for('main.home'))

    try:
        user_oid = ObjectId(user_id)
        safe_database_operation(mongo.books.delete_many, {'user_id': user_oid})
        result = safe_database_operation(mongo.users.delete_one, {'_id': user_oid})
        if result:
            session.clear()
            flash("Your account and all associated data have been permanently deleted.", "success")
            print(Fore.CYAN + f"Account deleted for user: {user_id}")
        else:
            flash("Failed to delete account. Please try again.", "danger")
    except Exception as e:
        print(Fore.RED + f"Error deleting account for user {user_id}: {e}")
        flash("An error occurred while deleting your account. Please try again.", "danger")
    return redirect(url_for('main.home'))
