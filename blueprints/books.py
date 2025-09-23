from flask import Blueprint, request, session, render_template, redirect, url_for, flash, make_response
from bson.objectid import ObjectId
from bson.errors import InvalidId
from datetime import datetime
import json
import logging
from forms import Book, Data
from extensions import mongo
from utils.cloudinary_utils import upload_to_cloudinary
from utils.db_utils import safe_database_operation


logger = logging.getLogger(__name__)
books_bp = Blueprint("books", __name__)


@books_bp.route("/add_book", methods=["GET", "POST"])
def add_book():
    if not session.get('user_id'):
        flash("Please log in to add a book.", "warning")
        return redirect(url_for('auth.login'))

    if mongo.books is None:
        flash("Database unavailable. Please try again later.", "danger")
        return redirect(url_for('main.home'))

    form = Book()
    if form.validate_on_submit():
        try:
            cover_image_url = None
            if form.cover_image.data and form.cover_image.data.filename:
                try:
                    cover_image_url, message = upload_to_cloudinary(form.cover_image.data)
                    if not cover_image_url:
                        flash(message, "danger")
                        return render_template("add_book.html", title="Add Book", form=form, json_form=Data())
                    else:
                        logger.info(f"Image uploaded successfully: {message}")
                except Exception as e:
                    logger.error(f"Unexpected error during image upload: {e}")
                    flash("Image upload failed due to an unexpected error. Book will be saved without image.", "warning")

            new_book = {
                "title": form.title.data.strip(), "author": form.author.data.strip() if form.author.data else "",
                "isbn": form.isbn.data.strip() if form.isbn.data else "", "genre": form.genre.data.strip() if form.genre.data else "",
                "rating": float(form.rating.data) if form.rating.data else 0.0,
                "description": form.description.data.strip() if form.description.data else "", "cover_image": cover_image_url,
                "reading_started": datetime.combine(form.reading_started.data, datetime.min.time()) if form.reading_started.data else None,
                "reading_finished": datetime.combine(form.reading_finished.data, datetime.min.time()) if form.reading_finished.data else None,
                "user_id": ObjectId(session.get('user_id')), "created_at": datetime.now(datetime.timezone.utc),
                "updated_at": datetime.now(datetime.timezone.utc)
            }
            result = safe_database_operation(mongo.books.insert_one, new_book)
            if result:
                flash("Book added successfully!", "success")
                logger.info(f"Book '{new_book['title']}' added by user {session.get('user_id')}")
                return redirect(url_for('main.home'))
            else:
                flash("Failed to save book. Please try again.", "danger")
        except ValueError as e:
            logger.error(f"Invalid data when adding book: {e}")
            flash("Invalid book data. Please check your inputs and try again.", "danger")
        except Exception as e:
            logger.error(f"Error adding book: {e}")
            flash("An error occurred while adding the book. Please try again.", "danger")
    return render_template("add_book.html", title="Add Book - My Reading Journey", form=form, json_form=Data())


@books_bp.route("/edit/<book_id>", methods=["GET", "POST"])
def edit_book(book_id):
    if not session.get('user_id'):
        flash("Please log in to edit books.", "warning")
        return redirect(url_for('auth.login'))

    if mongo.books is None:
        flash("Database unavailable. Please try again later.", "danger")
        return redirect(url_for('main.home'))

    try:
        book_oid = ObjectId(book_id)
    except InvalidId:
        flash("Invalid book ID.", "danger")
        return redirect(url_for('main.home'))

    book = safe_database_operation(mongo.books.find_one, {'_id': book_oid})
    if not book:
        flash("Book not found.", "danger")
        return redirect(url_for('main.home'))

    if str(book.get('user_id')) != session.get('user_id'):
        flash("You don't have permission to edit this book.", "danger")
        return redirect(url_for('main.home'))

    form = Book()
    if form.validate_on_submit():
        try:
            update_data = {
                "title": form.title.data.strip(), "author": form.author.data.strip() if form.author.data else "",
                "isbn": form.isbn.data.strip() if form.isbn.data else "", "genre": form.genre.data.strip() if form.genre.data else "",
                "rating": float(form.rating.data) if form.rating.data else 0.0,
                "description": form.description.data.strip() if form.description.data else "",
                "reading_started": datetime.combine(form.reading_started.data, datetime.min.time()) if form.reading_started.data else None,
                "reading_finished": datetime.combine(form.reading_finished.data, datetime.min.time()) if form.reading_finished.data else None,
                "updated_at": datetime.now(datetime.timezone.utc)
            }
            if form.cover_image.data and form.cover_image.data.filename:
                try:
                    cover_image_url, message = upload_to_cloudinary(form.cover_image.data)
                    if cover_image_url:
                        update_data['cover_image'] = cover_image_url
                        logger.info(f"Image updated successfully for book {book_id}")
                    else:
                        flash(message, "danger")
                        return render_template("edit_book.html", title=f'''Editing "{book["title"]}" - My Reading Journey''', form=form, book=book, json_form=Data())
                except Exception as e:
                    logger.error(f"Error updating image for book {book_id}: {e}")
                    flash("Image upload failed. Book details will be updated without new image.", "warning")

            result = safe_database_operation(mongo.books.update_one, {'_id': book_oid}, {'$set': update_data})
            if result and result.modified_count > 0:
                flash("Book updated successfully!", "success")
                logger.info(f"Book '{book['title']}' updated by user {session.get('user_id')}")
                return redirect(url_for("main.home"))
            else:
                flash("No changes were made to the book.", "info")
                return redirect(url_for("main.home"))
        except ValueError as e:
            logger.error(f"Invalid data when updating book {book_id}: {e}")
            flash("Invalid book data. Please check your inputs and try again.", "danger")
        except Exception as e:
            logger.error(f"Error updating book {book_id}: {e}")
            flash("An error occurred while updating the book. Please try again.", "danger")

    if request.method == 'GET':
        form.title.data = book.get('title')
        form.author.data = book.get('author')
        form.isbn.data = book.get('isbn')
        form.genre.data = book.get('genre')
        form.rating.data = book.get('rating')
        form.description.data = book.get('description')
        form.reading_started.data = book.get('reading_started')
        form.reading_finished.data = book.get('reading_finished')

    return render_template("edit_book.html", title=f'''Editing "{book["title"]}" - My Reading Journey''', form=form, book=book, json_form=Data())


@books_bp.route("/delete_book/<book_id>", methods=["POST"])
def delete_book(book_id):
    if not session.get('user_id'):
        flash("Please log in to delete books.", "warning")
        return redirect(url_for('auth.login'))

    if mongo.books is None:
        flash("Database unavailable. Please try again later.", "danger")
        return redirect(url_for('main.home'))

    try:
        book_oid = ObjectId(book_id)
    except InvalidId:
        flash("Invalid book ID.", "danger")
        return redirect(url_for('main.home'))

    try:
        book = safe_database_operation(mongo.books.find_one, {'_id': book_oid})
        if not book:
            flash("Book not found.", "danger")
        elif str(book.get('user_id')) != session.get('user_id'):
            flash("You don't have permission to delete this book.", "danger")
        else:
            result = safe_database_operation(mongo.books.delete_one, {'_id': book_oid})
            if result:
                flash(f"Book '{book['title']}' deleted successfully!", "success")
                logger.info(f"Book '{book['title']}' deleted by user {session.get('user_id')}")
            else:
                flash("Failed to delete book. Please try again.", "danger")
    except Exception as e:
        logger.error(f"Error deleting book {book_id}: {e}")
        flash("An error occurred while deleting the book. Please try again.", "danger")
    return redirect(url_for('main.home'))


@books_bp.route("/book/<book_id>")
def view_book(book_id):
    if not session.get('user_id'):
        flash("Please log in to view books.", "warning")
        return redirect(url_for('auth.login'))

    if mongo.books is None:
        flash("Database unavailable. Please try again later.", "danger")
        return redirect(url_for('main.home'))

    try:
        book_oid = ObjectId(book_id)
    except InvalidId:
        flash("Invalid book ID.", "danger")
        return redirect(url_for('main.home'))

    try:
        book = safe_database_operation(mongo.books.find_one, {'_id': book_oid})
        if not book:
            flash("Book not found.", "danger")
            return redirect(url_for('main.home'))

        if str(book.get('user_id')) != session.get('user_id'):
            flash("You don't have permission to view this book.", "danger")
            return redirect(url_for('main.home'))

        return render_template('book_details.html', title=f"{book['title']} - My Reading Journey", book=book, json_form=Data())
    except Exception as e:
        logger.error(f"Error viewing book {book_id}: {e}")
        flash("An error occurred while loading the book. Please try again.", "danger")
        return redirect(url_for('main.home'))


@books_bp.route("/download")
def download_books():
    if not session.get('user_id'):
        flash("Please log in to download your books.", "warning")
        return redirect(url_for('auth.login'))

    if mongo.books is None:
        flash("Database unavailable. Please try again later.", "danger")
        return redirect(url_for('main.home'))

    try:
        user_id = ObjectId(session["user_id"])
        books = safe_database_operation(lambda: list(mongo.books.find({'user_id': user_id})))
        if not books:
            flash("You have no books to download", "info")
            return redirect(url_for('main.home'))

        for book in books:
            book['_id'] = str(book['_id'])
            book['user_id'] = str(book['user_id'])
            if book.get('reading_started'): book['reading_started'] = book['reading_started'].isoformat()
            if book.get('reading_finished'): book['reading_finished'] = book['reading_finished'].isoformat()
            if book.get('created_at'): book['created_at'] = book['created_at'].isoformat()
            if book.get('updated_at'): book['updated_at'] = book['updated_at'].isoformat()

        response = make_response(json.dumps(books, indent=4))
        response.headers["Content-Disposition"] = "attachment; filename=books_backup.json"
        response.headers["Content-Type"] = "application/json"
        logger.info(f"Books exported for user {session['user_id']}: {len(books)} books")
        return response
    except Exception as e:
        logger.error(f"Error downloading books for user {session.get('user_id')}: {e}")
        flash("An error occurred while preparing your download. Please try again.", "danger")
        return redirect(url_for('main.home'))


@books_bp.route("/upload", methods=["POST"])
def upload_books():
    if not session.get('user_id'):
        flash("Please log in to upload books.", "warning")
        return redirect(url_for('auth.login'))

    if mongo.books is None:
        flash("Database unavailable. Please try again later.", "danger")
        return redirect(url_for('main.home'))

    form = Data()
    if form.validate_on_submit():
        try:
            file = form.json_file.data
            if not file or not file.filename.endswith('.json'):
                flash("Please upload a valid JSON file.", "danger")
                return redirect(url_for("main.home"))
            try:
                data = json.load(file.stream)
            except (json.JSONDecodeError, UnicodeDecodeError):
                flash("Invalid JSON format. The file could not be read.", "danger")
                return redirect(url_for("main.home"))
            if not isinstance(data, list):
                flash("JSON file must contain an array of books.", "danger")
                return redirect(url_for("main.home"))

            user_id = ObjectId(session["user_id"])
            books_to_add, errors = [], []
            for i, entry in enumerate(data):
                try:
                    if not entry.get("title"):
                        errors.append(f"Entry {i + 1}: Missing title")
                        continue
                    book_data = {
                        "title": entry.get("title", "").strip(), "author": entry.get("author", "").strip(),
                        "isbn": entry.get("isbn", "").strip(), "genre": entry.get("genre", "").strip(),
                        "rating": float(entry.get("rating", 0.0) or 0.0), "description": entry.get("description", "").strip(),
                        "cover_image": entry.get("cover_image", "").strip(), "user_id": user_id,
                        "created_at": datetime.now(datetime.timezone.utc), "updated_at": datetime.now(datetime.timezone.utc)
                    }
                    for date_field in ['reading_started', 'reading_finished']:
                        date_str = entry.get(date_field)
                        book_data[date_field] = datetime.fromisoformat(date_str.replace('Z', '+00:00')) if date_str else None
                    books_to_add.append(book_data)
                except Exception as e:
                    errors.append(f"Entry {i + 1}: {str(e)}")
                    continue

            if books_to_add:
                result = safe_database_operation(mongo.books.insert_many, books_to_add)
                if result:
                    flash(f"{len(books_to_add)} book(s) uploaded successfully!", "success")
                    logger.info(f"Books imported for user {session['user_id']}: {len(books_to_add)} books")
                    if errors: flash(f"{len(errors)} entries had errors and were skipped.", "warning")
                else:
                    flash("Failed to upload books. Please try again.", "danger")
            else:
                flash("No valid book entries found in the file.", "warning")
        except Exception as e:
            logger.error(f"Error during book upload for user {session.get('user_id')}: {e}")
            flash("An error occurred during upload. Please try again.", "danger")
    else:
        flash("File upload failed. Please try again with a valid JSON file.", "danger")
    return redirect(url_for("main.home"))
