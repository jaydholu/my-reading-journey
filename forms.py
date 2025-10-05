from wtforms import StringField, EmailField, PasswordField, TextAreaField, FileField, DecimalField, DateField, SubmitField, ValidationError
from wtforms.validators import DataRequired, Email, EqualTo, Length, NumberRange, Optional, Regexp
from flask_wtf.file import FileAllowed, FileRequired, FileSize
from flask_wtf import FlaskForm
from decimal import Decimal
from datetime import date
import re


class SafeDataRequired(DataRequired):
    """Custom DataRequired validator that strips whitespace"""
    def __call__(self, form, field):
        if hasattr(field.data, 'strip'):
            field.data = field.data.strip()
        if not field.data:
            raise ValidationError(self.message or f"{field.label.text} is required.")


class ISBNValidator:
    """Custom ISBN validator"""
    def __init__(self, message=None):
        self.message = message

    def __call__(self, form, field):
        if not field.data:
            return  # Allow empty ISBN
        
        # Remove any hyphens, spaces, or other non-alphanumeric characters
        isbn = re.sub(r'[^0-9X]', '', field.data.upper())
        
        # Check if it's ISBN-10 or ISBN-13
        if len(isbn) == 10:
            # ISBN-10 validation
            if not self.validate_isbn10(isbn):
                raise ValidationError(self.message or "Invalid ISBN-10 format.")
        elif len(isbn) == 13:
            # ISBN-13 validation
            if not self.validate_isbn13(isbn):
                raise ValidationError(self.message or "Invalid ISBN-13 format.")
        else:
            raise ValidationError(self.message or "ISBN must be 10 or 13 characters long.")

    def validate_isbn10(self, isbn):
        """Validate ISBN-10 format"""
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

    def validate_isbn13(self, isbn):
        """Validate ISBN-13 format"""
        try:
            check_sum = 0
            for i, char in enumerate(isbn[:-1]):
                multiplier = 1 if i % 2 == 0 else 3
                check_sum += int(char) * multiplier
            
            check_digit = int(isbn[-1])
            return (check_sum + check_digit) % 10 == 0
        except (ValueError, IndexError):
            return False
        

class DateRangeValidator:
    """Validator to ensure reading_finished is not before reading_started"""
    def __init__(self, start_field, message=None):
        self.start_field = start_field
        self.message = message

    def __call__(self, form, field):
        start_date = getattr(form, self.start_field).data
        end_date = field.data
        
        if start_date and end_date and end_date < start_date:
            raise ValidationError(
                self.message or "Finish date cannot be before start date."
            )
            

class NoFutureDateValidator:
    """Validator to ensure dates are not in the future"""
    def __init__(self, message=None):
        self.message = message

    def __call__(self, form, field):
        if field.data and field.data > date.today():
            raise ValidationError(
                self.message or f"{field.label.text} cannot be in the future."
            )
            

class StrongPasswordValidator:
    """Validator for strong passwords"""
    def __init__(self, message=None):
        self.message = message

    def __call__(self, form, field):
        password = field.data
        if not password:
            return
        
        errors = []
        
        if len(password) < 8:
            errors.append("at least 8 characters")
        if not re.search(r'[A-Z]', password):
            errors.append("an uppercase letter")
        if not re.search(r'[a-z]', password):
            errors.append("a lowercase letter")
        if not re.search(r'\d', password):
            errors.append("a number")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("a special character")
        
        if errors:
            raise ValidationError(
                self.message or f"Password must contain {', '.join(errors)}."
            )
            

class SignUp(FlaskForm):
    name = StringField(
        label='Name', 
        validators=[
            SafeDataRequired(message="Name is required!"),
            Length(2, 50, message="Name must be between 2 and 50 characters.")
        ],
        # render_kw={"placeholder": "Your full name"}
    )
    
    userid = StringField(
        label='User ID', 
        validators=[
            SafeDataRequired(message="User ID is required!"), 
            Length(2, 20, message="User ID must be between 2 and 20 characters."),
            Regexp(
                r'^[a-zA-Z0-9_]+$', 
                message="User ID can only contain letters, numbers, and underscores."
            )
        ],
        # render_kw={"placeholder": "Unique identifier"}
    )
    
    email = EmailField(
        label='Email', 
        validators=[
            SafeDataRequired(message="Email is required!"), 
            Email(message="Please enter a valid email address."),
            Length(max=120, message="Email address is too long.")
        ],
        # render_kw={"placeholder": "your.email@example.com"}
    )
    
    password = PasswordField(
        label='Password', 
        validators=[
            SafeDataRequired(message="Password is required!"),
            StrongPasswordValidator()
        ],
        # render_kw={"placeholder": "Strong password"}
    )
    
    confirm_password = PasswordField(
        label='Confirm Password', 
        validators=[
            SafeDataRequired(message="Please confirm your password!"),
            EqualTo('password', message="Passwords must match!")
        ],
        # render_kw={"placeholder": "Confirm password"}
    )
    
    submit = SubmitField(label='Create Account')
    

class Login(FlaskForm):
    email = EmailField(
        label='Email',
        validators=[
            Optional(),
            Email(message="Please enter a valid email address.")
        ],
        # render_kw={"placeholder": "your.email@example.com"}
    )
    
    userid = StringField(
        label='User ID',
        validators=[Optional()],
        # render_kw={"placeholder": "your_user_id"}
    )
    
    password = PasswordField(
        label='Password', 
        validators=[
            SafeDataRequired(message="Password is required!"), 
            Length(8, 30, message="Password must be between 8 and 30 characters.")
        ],
        # render_kw={"placeholder": "Your password"}
    )
    
    submit = SubmitField(label='Sign In')

    def validate(self, extra_validators=None):
        """Custom validation to ensure either email or userid is provided"""
        if not super().validate():
            return False
        
        # Strip whitespace from fields
        if self.email.data:
            self.email.data = self.email.data.strip().lower()
        if self.userid.data:
            self.userid.data = self.userid.data.strip()
            
        if not self.email.data and not self.userid.data:
            self.email.errors.append("Please enter either email or user ID.")
            self.userid.errors.append("Please enter either email or user ID.")
            return False
        
        return True


class Book(FlaskForm):
    title = StringField(
        label='Title', 
        validators=[
            SafeDataRequired(message="Book title is required!"),
            Length(1, 200, message="Title must be between 1 and 200 characters.")
        ],
        # render_kw={"placeholder": "Enter book title"}
    )
    
    author = StringField(
        label='Author',
        validators=[
            Optional(),
            Length(max=100, message="Author name cannot exceed 100 characters.")
        ],
        # render_kw={"placeholder": "Author name"}
    )
    
    isbn = StringField(
        label='ISBN', 
        validators=[
            Optional(),
            ISBNValidator(message="Please enter a valid ISBN-10 or ISBN-13.")
        ],
        # render_kw={"placeholder": "ISBN-10 or ISBN-13"}
    )
    
    genre = StringField(
        label='Genre',
        validators=[
            Optional(),
            Length(max=50, message="Genre cannot exceed 50 characters.")
        ],
        # render_kw={"placeholder": "Fiction, Non-fiction, Mystery, etc."}
    )
    
    rating = DecimalField(
        label='Rating', 
        places=1, 
        validators=[
            Optional(), 
            NumberRange(min=0, max=5, message="Rating must be between 0 and 5.")
        ], 
        default=Decimal('0.0'),
        # render_kw={"step": "0.1", "min": "0", "max": "5", "placeholder": "0.0"}
    )
    
    description = TextAreaField(
        label='Description',
        validators=[
            Optional(),
            Length(max=2000, message="Description cannot exceed 2000 characters.")
        ],
        # render_kw={"placeholder": "Your thoughts, review, or summary...", "rows": 4}
    )
    
    cover_image = FileField(
        label='Upload Book Cover', 
        validators=[
            Optional(), 
            FileAllowed(['jpg', 'jpeg', 'png', 'gif', 'webp'], 'Only image files are allowed!'),
            FileSize(max_size=10*1024*1024, message="File size cannot exceed 10MB.")
        ]
    )
    
    reading_started = DateField(
        label='Date Started', 
        validators=[
            Optional(),
            NoFutureDateValidator(message="Start date cannot be in the future.")
        ],
        # render_kw={"placeholder": "YYYY-MM-DD"}
    )
    
    reading_finished = DateField(
        label='Date Finished', 
        validators=[
            Optional(),
            NoFutureDateValidator(message="Finish date cannot be in the future."),
            DateRangeValidator('reading_started')
        ],
        # render_kw={"placeholder": "YYYY-MM-DD"}
    )
    
    submit = SubmitField('Save Book')
    

class DeleteBook(FlaskForm):
    pass


class Data(FlaskForm):
    json_file = FileField(
        'Choose JSON File', 
        validators=[
            FileRequired(message="Please select a JSON file to upload."),
            FileAllowed(['json'], 'Only JSON files are allowed!'),
            FileSize(max_size=50*1024*1024, message="File size cannot exceed 50MB.")
        ]
    )
    submit = SubmitField('Upload Books')
    

class RequestReset(FlaskForm):
    email = EmailField(
        label='Email', 
        validators=[
            SafeDataRequired(message="Email is required!"), 
            Email(message="Please enter a valid email address."),
            Length(max=120, message="Email address is too long.")
        ],
        # render_kw={"placeholder": "your.email@example.com"}
    )
    submit = SubmitField(label='Send Reset Link')
    

class ResetPassword(FlaskForm):
    password = PasswordField(
        label='New Password', 
        validators=[
            SafeDataRequired(message="New password is required!"),
            StrongPasswordValidator()
        ],
        # render_kw={"placeholder": "Enter new password"}
    )
    
    confirm_password = PasswordField(
        label='Confirm Password', 
        validators=[
            SafeDataRequired(message="Please confirm your new password!"),
            EqualTo('password', message="Passwords must match!")
        ],
        # render_kw={"placeholder": "Confirm new password"}
    )
    
    submit = SubmitField(label='Reset Password')
    

class ResendVerification(FlaskForm):
    email = EmailField(
        'Email', 
        validators=[
            SafeDataRequired(message="Email is required!"), 
            Email(message="Please enter a valid email address."),
            Length(max=120, message="Email address is too long.")
        ],
        # render_kw={"placeholder": "your.email@example.com"}
    )
    submit = SubmitField('Resend Verification Email')
    

class EditProfile(FlaskForm):
    name = StringField(
        label='Name', 
        validators=[
            SafeDataRequired(message="Name is required!"),
            Length(2, 50, message="Name must be between 2 and 50 characters.")
        ],
        # render_kw={"placeholder": "Your full name"}
    )
    
    userid = StringField(
        label='User ID', 
        validators=[
            SafeDataRequired(message="User ID is required!"), 
            Length(2, 20, message="User ID must be between 2 and 20 characters."),
            Regexp(
                r'^[a-zA-Z0-9_]+$',
                message="User ID can only contain letters, numbers, and underscores."
            )
        ],
        # render_kw={"placeholder": "Unique identifier"}
    )
    
    email = EmailField(
        label='Email', 
        validators=[
            SafeDataRequired(message="Email is required!"), 
            Email(message="Please enter a valid email address."),
            Length(max=120, message="Email address is too long.")
        ],
        # render_kw={"placeholder": "your.email@example.com"}
    )
    
    password = PasswordField(
        label='New Password', 
        validators=[
            Optional(),
            StrongPasswordValidator()
        ],
        # render_kw={"placeholder": "Leave blank to keep current password"}
    )
    
    confirm_password = PasswordField(
        label='Confirm Password', 
        validators=[
            Optional(),
            EqualTo('password', message="Passwords must match!")
        ],
        # render_kw={"placeholder": "Confirm new password"}
    )
    
    submit = SubmitField(label='Update Profile')

    def validate_password(self, field):
        """Custom validation for password field"""
        if self.password.data and not self.confirm_password.data:
            raise ValidationError("Please confirm your new password.")
        
    def validate_confirm_password(self, field):
        """Custom validation for confirm password field"""
        if self.confirm_password.data and not self.password.data:
            raise ValidationError("Please enter a new password first.")
        