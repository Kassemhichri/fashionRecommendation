import sqlite3
import os
import hashlib
import uuid

class User:
    def __init__(self, id, username, email, password, registration_date=None):
        self.id = id
        self.username = username
        self.email = email
        self.password = password
        self.registration_date = registration_date
    
    @staticmethod
    def hash_password(password):
        """Hash a password for storing."""
        salt = uuid.uuid4().hex
        return hashlib.sha256(salt.encode() + password.encode()).hexdigest() + ':' + salt
    
    @staticmethod
    def verify_password(hashed_password, user_password):
        """Verify a stored password against one provided by user"""
        password, salt = hashed_password.split(':')
        return password == hashlib.sha256(salt.encode() + user_password.encode()).hexdigest()
    
    @staticmethod
    def create_user(username, email, password):
        """Create a new user in the database"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        hashed_password = User.hash_password(password)
        
        try:
            cursor.execute(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                (username, email, hashed_password)
            )
            user_id = cursor.lastrowid
            conn.commit()
            
            # Fetch the created user
            cursor.execute(
                "SELECT id, username, email, password, registration_date FROM users WHERE id = ?",
                (user_id,)
            )
            user_data = cursor.fetchone()
            return User(*user_data)
        except sqlite3.IntegrityError as e:
            conn.rollback()
            if "UNIQUE constraint failed: users.username" in str(e):
                raise ValueError("Username already exists")
            elif "UNIQUE constraint failed: users.email" in str(e):
                raise ValueError("Email already exists")
            else:
                raise
        finally:
            conn.close()
    
    @staticmethod
    def get_by_id(user_id):
        """Retrieve a user by ID"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, username, email, password, registration_date FROM users WHERE id = ?",
            (user_id,)
        )
        user_data = cursor.fetchone()
        conn.close()
        
        if user_data:
            return User(*user_data)
        return None
    
    @staticmethod
    def get_by_username(username):
        """Retrieve a user by username"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, username, email, password, registration_date FROM users WHERE username = ?",
            (username,)
        )
        user_data = cursor.fetchone()
        conn.close()
        
        if user_data:
            return User(*user_data)
        return None
    
    @staticmethod
    def get_by_email(email):
        """Retrieve a user by email"""
        db_path = os.path.join(os.path.dirname(__file__), '../../data/fashionfinder.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, username, email, password, registration_date FROM users WHERE email = ?",
            (email,)
        )
        user_data = cursor.fetchone()
        conn.close()
        
        if user_data:
            return User(*user_data)
        return None
    
    def to_dict(self, include_password=False):
        """Convert user object to dictionary"""
        user_dict = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'registrationDate': self.registration_date
        }
        if include_password:
            user_dict['password'] = self.password
        return user_dict
