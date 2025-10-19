from itsdangerous import BadSignature, SignatureExpired
from colorama import init, Fore
from flask import current_app

init(autoreset=True)


class TokenManager:
    @staticmethod
    def generate_token(data, salt, expires_in=None):
        """
        Create a signed token.
        :param data: Data to encode (e.g., email).
        :param salt: Salt string for uniqueness.
        :param expires_in: Expiry in seconds (optional).
        """
        s = current_app.extensions['itsdangerous']
        return s.dumps(data, salt=salt)

    @staticmethod
    def verify_token(token, salt, max_age=None):
        """
        Verify a signed token.
        :param token: Token string to check.
        :param salt: Salt string used when generating.
        :param max_age: Expiry time in seconds.
        :return: Decoded data (e.g., email) or None if invalid/expired.
        """
        try:
            s = current_app.extensions['itsdangerous']
            return s.loads(token, salt=salt, max_age=max_age)
        except SignatureExpired:
            print(Fore.YELLOW + "Token expired")
            return None
        except BadSignature:
            print(Fore.YELLOW + "Invalid token")
            return None
        