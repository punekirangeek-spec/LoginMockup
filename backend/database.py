import psycopg2
import psycopg2.extras
import os
from dotenv import load_dotenv

load_dotenv()

def get_db():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        port=os.getenv('DB_PORT'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD')
    )
    conn.autocommit = False
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute('''CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL)''')

    cur.execute('''CREATE TABLE IF NOT EXISTS dropdown_options (
            id SERIAL PRIMARY KEY,
            field_name TEXT NOT NULL,
            value TEXT NOT NULL,
            display_order INTEGER NOT NULL DEFAULT 0,
            UNIQUE (field_name, value))''')

    cur.execute('''CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            reason TEXT,
            type TEXT,
            division TEXT,
            category TEXT,
            priority TEXT,
            department TEXT,
            location TEXT,
            start_date DATE,
            end_date DATE,
            status TEXT NOT NULL DEFAULT 'Registered',
            created_at TIMESTAMP NOT NULL DEFAULT NOW())''')

    conn.commit()
    cur.close()
    conn.close()


def seed_dropdown_options():
    defaults = {
        'reason':     ['For Business', 'Dealership', 'Transport'],
        'type':       ['Internal', 'External', 'Vendor'],
        'division':   ['Filters', 'Compressor', 'Pumps', 'Glass', 'Water Heater'],
        'category':   ['Quality A', 'Quality B', 'Quality C', 'Quality D'],
        'priority':   ['High', 'Medium', 'Low'],
        'department': ['Strategy', 'Finance', 'Quality', 'Maintenance', 'Stores', 'HR'],
        'location':   ['Pune', 'Mumbai', 'Delhi'],
    }

    conn = get_db()
    cur = conn.cursor()
    for field_name, values in defaults.items():
        for order, value in enumerate(values):
            cur.execute(
                '''INSERT INTO dropdown_options (field_name, value, display_order)
                   VALUES (%s, %s, %s)
                   ON CONFLICT (field_name, value) DO NOTHING''',
                (field_name, value, order)
            )
    conn.commit()
    cur.close()
    conn.close()