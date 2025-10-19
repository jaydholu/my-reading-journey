from flask import Blueprint, session, render_template, redirect, url_for, flash
from flask_mail import Message
from markupsafe import Markup
from werkzeug.security import check_password_hash, generate_password_hash
from extensions import mail, mongo, s
from forms import SignUp, Login, ResendVerification, RequestReset, ResetPassword, Data
from utils.email_utils import send_verification_email
from utils.db_utils import safe_database_operation
from utils.token_utils import TokenManager
from datetime import datetime
from colorama import init, Fore


init(autoreset=True)
auth_bp = Blueprint("auth", __name__)


# ------------------ Signup ------------------
@auth_bp.route("/sign_up", methods=["GET", "POST"])
def sign_up():
    if 'user_id' in session:
        return redirect(url_for('main.home'))

    if mongo.users is None:
        flash("Registration unavailable. Please try again later.", "danger")
        return redirect(url_for('auth.login'))

    form = SignUp()
    if form.validate_on_submit():
        try:
            hashed_password = generate_password_hash(form.password.data)

            existing_email = safe_database_operation(mongo.users.find_one, {"email": form.email.data.lower()})
            existing_userid = safe_database_operation(mongo.users.find_one, {"userid": form.userid.data})

            if existing_email:
                flash("Email already taken. Please choose another.", "danger")
            elif existing_userid:
                flash("User ID already taken. Please choose another.", "danger")
            else:
                new_user = {
                    "name": form.name.data.strip(),
                    "userid": form.userid.data.strip(),
                    "email": form.email.data.strip().lower(),
                    "password": hashed_password,
                    "theme": "light",
                    "is_verified": False,
                    "created_at": datetime.utcnow()
                }

                if send_verification_email(new_user):
                    result = safe_database_operation(mongo.users.insert_one, new_user)
                    if result:
                        flash("Account created successfully! Please check your email to verify your account.", "success")
                        print(Fore.CYAN + f"New user registered: {new_user['email']}")
                        return redirect(url_for('main.home'))
                    else:
                        flash("Failed to create account. Please try again.", "danger")
                else:
                    flash("Failed to send verification email. Please contact support.", "danger")
                    
        except Exception as e:
            print(Fore.RED + f"Error during user registration: {e}")
            flash("An error occurred during registration. Please try again.", "danger")

    return render_template("sign_up.html", title='Sign Up - My Reading Journey', form=form, json_form=Data())


# ------------------ Login ------------------
@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    form = Login()
    if form.validate_on_submit():
        try:
            user = None
            if form.email.data:
                user = safe_database_operation(mongo.users.find_one, {"email": form.email.data.lower()})
            elif form.userid.data:
                user = safe_database_operation(mongo.users.find_one, {"userid": form.userid.data})

            if user and check_password_hash(user["password"], form.password.data):
                if not user.get('is_verified'):
                    message = Markup(
                        f"Your account is not verified. <a href='{url_for('auth.resend_verification')}' class='auth-link'>Resend verification email?</a>"
                    )
                    flash(message, 'warning')
                    return redirect(url_for('auth.login'))

                session['user_id'] = str(user["_id"])
                session.permanent = True
                flash(f"Welcome {user['name']}", "success")
                print(Fore.GREEN + f"User logged in: {user['email']}")
                return redirect(url_for('main.home'))
            else:
                flash("Invalid credentials. Please check your details and try again.", "danger")

        except Exception as e:
            print(Fore.RED + f"Error during login: {e}")
            flash("An error occurred during login. Please try again.", "danger")

    return render_template("login.html", title='Login - My Reading Journey', form=form, json_form=Data())


# ------------------ Logout ------------------
@auth_bp.route("/logout")
def logout():
    if 'user_id' in session:
        print(Fore.GREEN + f"User logged out: {session['user_id']}")
    session.clear()
    flash("You have been logged out successfully!", "success")
    return redirect(url_for('auth.login'))


# ------------------ Verify Email ------------------
@auth_bp.route("/verify_email/<token>")
def verify_email(token):
    email = TokenManager.verify_token(token, salt="email-confirm-salt", max_age=1800)  # 30 mins expiry
    if not email:
        flash('The confirmation link is invalid or has expired.', 'danger')
        return redirect(url_for('auth.login'))

    user = safe_database_operation(mongo.users.find_one, {"email": email})
    if not user:
        flash('User not found.', 'danger')
        return redirect(url_for('auth.login'))

    if user.get('is_verified'):
        flash('Account already verified. Please log in.', 'info')
    else:
        result = safe_database_operation(
            mongo.users.update_one,
            {'_id': user['_id']},
            {'$set': {'is_verified': True}}
        )
        if result:
            flash('Your account has been verified! You can now log in.', 'success')
        else:
            flash('Verification failed. Please try again.', 'danger')

    return redirect(url_for('auth.login'))


# ------------------ Resend Verification ------------------
@auth_bp.route("/resend_verification", methods=["GET", "POST"])
def resend_verification():
    if 'user_id' in session:
        return redirect(url_for('main.home'))

    form = ResendVerification()
    if form.validate_on_submit():
        try:
            user = safe_database_operation(mongo.users.find_one, {"email": form.email.data.lower()})
            if user:
                if user.get('is_verified'):
                    flash('This account has already been verified. Please log in.', 'info')
                else:
                    send_verification_email(user)
                    flash('A new verification email has been sent. Please check your inbox.', 'success')
            else:
                flash('If an account with that email exists, a new verification email has been sent.', 'success')
            return redirect(url_for('auth.login'))
        except Exception as e:
            print(Fore.RED + f"Error during resend verification: {e}")
            flash("An error occurred. Please try again.", "danger")

    return render_template('resend_verification.html', title='Resend Verification - My Reading Journey', form=form, json_form=Data())


# ------------------ Forgot Password ------------------
@auth_bp.route("/forgot_password", methods=["GET", "POST"])
def forgot_password():
    form = RequestReset()
    if form.validate_on_submit():
        try:
            user = safe_database_operation(mongo.users.find_one, {"email": form.email.data.lower()})
            if user:
                token = TokenManager.generate_token(user['email'], salt="password-reset-salt")
                reset_url = url_for('auth.reset_password', token=token, _external=True)

                msg = Message(
                    "Password Reset Request - My Reading Journey",
                    recipients=[user['email']]
                )
                msg.body = f"To reset your password, visit the following link:\n{reset_url}\n\nIf you did not make this request, ignore this email."

                mail.send(msg)
                print(Fore.CYAN + f"Password reset email sent to {user['email']}")

            flash(f"If an account with {form.email.data} exists, a password reset link has been sent.", "info")
            return redirect(url_for('auth.login'))

        except Exception as e:
            print(Fore.RED + f"Error during password reset request: {e}")
            flash("An error occurred. Please try again.", "danger")

    return render_template('forgot_password.html', title='Forgot Password - My Reading Journey', form=form, json_form=Data())


# ------------------ Reset Password ------------------
@auth_bp.route("/reset_password/<token>", methods=["GET", "POST"])
def reset_password(token):
    email = TokenManager.verify_token(token, salt="password-reset-salt", max_age=1800)  # 30 mins expiry
    if not email:
        flash('The password reset link is invalid or has expired.', 'warning')
        return redirect(url_for('auth.forgot_password'))

    user = safe_database_operation(mongo.users.find_one, {"email": email})
    if not user:
        flash('User not found.', 'danger')
        return redirect(url_for('auth.login'))

    form = ResetPassword()
    if form.validate_on_submit():
        try:
            hashed_password = generate_password_hash(form.password.data)
            result = safe_database_operation(
                mongo.users.update_one,
                {'_id': user['_id']},
                {'$set': {'password': hashed_password, 'updated_at': datetime.utcnow()}}
            )

            if result:
                flash('Your password has been updated! You can now log in.', 'success')
                print(Fore.GREEN + f"Password reset successful for user: {email}")
                return redirect(url_for('auth.login'))
            else:
                flash('Failed to update password. Please try again.', 'danger')

        except Exception as e:
            print(Fore.RED + f"Error during password reset for user {email}: {e}")
            flash("An error occurred. Please try again.", "danger")

    return render_template('reset_password.html', title='Reset Password - My Reading Journey', form=form, json_form=Data())
