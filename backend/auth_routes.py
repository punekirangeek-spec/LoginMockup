from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db
import psycopg2.extras
import psycopg2
import logging

# __name__ here is 'auth_routes' -- so log lines from this file will
# show as: 2026-06-26 10:30:00 [auth_routes] INFO: ...
logger = logging.getLogger(__name__)

auth_api = Blueprint('auth_api', __name__)


@auth_api.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    if not data.get('password'):
        return jsonify({'error': 'Password is required'}), 400
    if '@' not in data['email'] or '.' not in data['email']:
        return jsonify({'error': 'Email format is invalid'}), 400
    if len(data['password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    hashed = generate_password_hash(data['password'])

    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            'INSERT INTO users (email, password) VALUES (%s, %s)',
            (data['email'], hashed)
        )
        conn.commit()
        logger.info(f'New user registered: {data["email"]}')
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        logger.warning(f'Registration failed — email already exists: {data["email"]}')
        return jsonify({'error': 'An account with this email already exists'}), 409
    finally:
        cur.close()
        conn.close()

    return jsonify({'message': 'Account created successfully'}), 201


@auth_api.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('email'):
        return jsonify({'error': 'Email is required'}), 400
    if not data.get('password'):
        return jsonify({'error': 'Password is required'}), 400
    if '@' not in data['email'] or '.' not in data['email']:
        return jsonify({'error': 'Email format is invalid'}), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute('SELECT * FROM users WHERE email = %s', (data['email'],))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user or not check_password_hash(user['password'], data['password']):
        # Logged as WARNING not ERROR -- a failed login is expected behaviour
        # (wrong password), not a server problem. ERROR is reserved for things
        # that shouldn't happen at all (crashes, DB failures).
        logger.warning(f'Failed login attempt for email: {data["email"]}')
        return jsonify({'error': 'Invalid email or password'}), 401

    logger.info(f'Successful login: {data["email"]}')
    return jsonify({'message': 'Logged in successfully'}), 200