from flask import flash
from colorama import init, Fore
from pymongo.errors import ConnectionFailure

init(autoreset=True)


def safe_database_operation(operation, *args, **kwargs):
    try:
        return operation(*args, **kwargs)
    except ConnectionFailure:
        print(Fore.RED + f"Database connection lost")
        flash("Database connection error. Try again.", "danger")
    except Exception as e:
        print(Fore.RED + f"DB operation failed: {e}")
        flash("Database error. Try again.", "danger")
    return None
