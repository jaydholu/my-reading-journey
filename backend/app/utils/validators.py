from datetime import datetime
import re


def validate_isbn(isbn: str) -> bool:
    """
    Validate ISBN-10 or ISBN-13
    """
    if not isbn:
        return True  # ISBN is optional
    
    # Remove hyphens and spaces
    isbn = re.sub(r'[^0-9X]', '', isbn.upper())
    
    if len(isbn) == 10:
        return _validate_isbn10(isbn)
    elif len(isbn) == 13:
        return _validate_isbn13(isbn)
    else:
        return False


def _validate_isbn10(isbn: str) -> bool:
    """Validate ISBN-10"""
    try:
        check_sum = 0
        for i, char in enumerate(isbn[:-1]):
            check_sum += int(char) * (10 - i)
        
        check_digit = isbn[-1]
        if check_digit == 'X':
            check_digit = 10
        else:
            check_digit = int(check_digit)
        
        return (check_sum + check_digit) % 11 == 0
    except (ValueError, IndexError):
        return False


def _validate_isbn13(isbn: str) -> bool:
    """Validate ISBN-13"""
    try:
        check_sum = 0
        for i, char in enumerate(isbn[:-1]):
            multiplier = 1 if i % 2 == 0 else 3
            check_sum += int(char) * multiplier
        
        check_digit = int(isbn[-1])
        return (check_sum + check_digit) % 10 == 0
    except (ValueError, IndexError):
        return False


def validate_date_range(start: datetime | None, end: datetime | None) -> bool:
    """
    Validate that end date is after start date
    """
    if start and end:
        return end >= start
    return True


def validate_future_date(date: datetime | None) -> bool:
    """
    Validate that date is not in the future
    """
    if date:
        return date <= datetime.now()
    return True


def validate_age(birthdate: datetime | None, min_age: int = 5, max_age: int = 120) -> bool:
    """
    Validate age based on birthdate
    """
    if not birthdate:
        return True
    
    today = datetime.now()
    age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
    
    return min_age <= age <= max_age
