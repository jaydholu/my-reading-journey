from flask_mail import Mail
from flask_wtf.csrf import CSRFProtect
from itsdangerous import URLSafeTimedSerializer
from pymongo import MongoClient
from colorama import init, Fore
import cloudinary
import cloudinary.api


# Initialize colorama for colored console output
init(autoreset=True)


# --- Extension Objects ---
mail = Mail()
csrf = CSRFProtect()
s = None


# --- Database Wrapper Class ---
class MongoWrapper:
    """A wrapper to hold MongoDB connection details."""
    def __init__(self):
        self.client = None
        self.db = None
        self.users = None
        self.books = None

mongo = MongoWrapper()


# --- Initialization Functions ---
def init_db(app):
    """Initializes the MongoDB connection and populates the mongo object."""
    try:
        mongo.client = MongoClient(app.config["MONGO_URI"], serverSelectionTimeoutMS=5000)
        mongo.client.admin.command("ping")
        mongo.db = mongo.client.myreadingjourney
        mongo.users = mongo.db.users
        mongo.books = mongo.db.books
        mongo.users.create_index("email", unique=True)
        mongo.users.create_index("userid", unique=True)
        print(Fore.GREEN + "Connected to MongoDB")
    except Exception as e:
        print(Fore.RED + f"MongoDB connection failed: {e}")
        raise e


def init_cloudinary(app):
    """Initializes the Cloudinary configuration."""
    try:
        cloudinary.config(
            cloud_name=app.config["CLOUDINARY_CLOUD_NAME"],
            api_key=app.config["CLOUDINARY_API_KEY"],
            api_secret=app.config["CLOUDINARY_API_SECRET"],
            secure=True
        )
        cloudinary.api.ping()
        print(Fore.GREEN + "Connected to Cloudinary")
    except Exception as e:
        print(Fore.RED + f"Cloudinary config failed: {e}")


def init_serializer(app):
    """Initializes the URLSafeTimedSerializer."""
    app.extensions['itsdangerous'] = URLSafeTimedSerializer(app.config['SECRET_KEY'])

