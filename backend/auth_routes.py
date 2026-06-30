from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db
import psycopg2.extras
import psycopg2

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
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
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
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({'message': 'Logged in successfully'}), 200