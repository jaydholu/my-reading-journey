from flask import Flask
from dotenv import load_dotenv
load_dotenv('.env')

from blueprints import auth_bp, user_bp, books_bp, main_bp, errors_bp, lifecycle_bp
from config import Config
from extensions import mail, csrf, init_db, init_cloudinary, init_serializer


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Init extensions
    mail.init_app(app)
    csrf.init_app(app)
    init_db(app)
    init_cloudinary(app)
    init_serializer(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(books_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(errors_bp)
    app.register_blueprint(lifecycle_bp)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
    