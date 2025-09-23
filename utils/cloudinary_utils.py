import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
from requests.exceptions import RequestException, Timeout, ConnectionError
import logging, os


logger = logging.getLogger(__name__)


def validate_image_file(file):
    if not file: return False, "No file provided"
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > 10 * 1024 * 1024:
        return False, "File too large (max 10MB)"
    if not file.filename: return False, "Invalid filename"
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in {'png','jpg','jpeg','gif','webp'}:
        return False, "Invalid file type"
    return True, "Valid file"


def upload_to_cloudinary(file, folder="book_covers"):
    try:
        valid, msg = validate_image_file(file)
        if not valid: return None, msg
        upload_result = cloudinary.uploader.upload(
            file, folder=folder,
            fetch_format="auto", quality="auto:good",
            transformation=[{'width': 400, 'height': 600, 'crop': 'fill'}],
            timeout=60
        )
        return upload_result['secure_url'], "Uploaded"
    except (CloudinaryError, ConnectionError, Timeout, RequestException) as e:
        logger.error(f"Upload failed: {e}")
        return None, str(e)
