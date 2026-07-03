from flask import Blueprint, request, jsonify
from database import get_db
import psycopg2.extras
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

project_api = Blueprint('project_api', __name__)

# Fields that must come from the dropdown_options table -- anything else
# submitted is ignored rather than trusted, since these drive both the
# DB write and (eventually) the listing/filter UI.
ALLOWED_DROPDOWN_FIELDS = [
    'reason', 'type', 'division', 'category',
    'priority', 'department', 'location'
]


@project_api.route('/dropdown-options', methods=['GET'])
def get_dropdown_options():
    """
    Returns all dropdown values grouped by field, e.g.:
      { "reason": ["For Business", "Dealership", "Transport"], "type": [...], ... }
    One call populates every <select> on the Create Project page.
    """
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        '''SELECT field_name, value FROM dropdown_options
           ORDER BY field_name, display_order'''
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    options = {field: [] for field in ALLOWED_DROPDOWN_FIELDS}
    for row in rows:
        options.setdefault(row['field_name'], []).append(row['value'])

    return jsonify(options), 200


@project_api.route('/projects', methods=['POST'])
def create_project():
    data = request.get_json() or {}

    # All 10 fields are required. Listed here once, by (key, label), so
    # the check is one loop instead of nine near-identical if-statements
    # -- and so the frontend and backend rules stay easy to compare and
    # keep in sync if a field is ever added or renamed.
    required_fields = [
        ('name', 'Project name'),
        ('reason', 'Reason'),
        ('type', 'Type'),
        ('division', 'Division'),
        ('category', 'Category'),
        ('priority', 'Priority'),
        ('department', 'Department'),
        ('location', 'Location'),
        ('start_date', 'Start date'),
        ('end_date', 'End date'),
    ]

    for key, label in required_fields:
        value = data.get(key)
        if not value or not str(value).strip():
            return jsonify({'error': f'{label} is required'}), 400

    name = data['name'].strip()
    start_date = data['start_date']
    end_date = data['end_date']

    for label, value in [('Start date', start_date), ('End date', end_date)]:
        try:
            datetime.strptime(value, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': f'{label} must be in YYYY-MM-DD format'}), 400

    if start_date > end_date:
        return jsonify({'error': 'End date cannot be before start date'}), 400

    # Pull only whitelisted dropdown fields out of the payload -- anything
    # else the client sent is silently dropped, not written to the DB.
    field_values = {
        field: data.get(field) for field in ALLOWED_DROPDOWN_FIELDS
    }

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            '''INSERT INTO projects
               (name, reason, type, division, category, priority,
                department, location, start_date, end_date, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Registered')
               RETURNING *''',
            (
                name,
                field_values['reason'],
                field_values['type'],
                field_values['division'],
                field_values['category'],
                field_values['priority'],
                field_values['department'],
                field_values['location'],
                start_date,
                end_date,
            )
        )
        new_project = cur.fetchone()
        conn.commit()
        logger.info(f'Project created: id={new_project["id"]} name="{name}"')
    except Exception as e:
        conn.rollback()
        logger.error(f'Failed to create project "{name}": {e}')
        return jsonify({'error': 'Failed to save project'}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify(new_project), 201


# Buttons in the UI always send one of these three -- anything else gets
# rejected so a stray/garbled request can't write an arbitrary status
# string into the database.
VALID_STATUSES = ['Running', 'Closed', 'Cancelled']

PAGE_SIZE = 10


@project_api.route('/projects', methods=['GET'])
def list_projects():
    """
    Paginated, optionally search-filtered (by name) project listing.
    Query params: ?page=1&search=line
    Returns: { projects: [...], total: N, page: 1, page_size: 10, total_pages: N }
    """
    try:
        page = int(request.args.get('page', 1))
    except ValueError:
        page = 1
    page = max(page, 1)

    search = (request.args.get('search') or '').strip()
    offset = (page - 1) * PAGE_SIZE

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    if search:
        # ILIKE = case-insensitive LIKE in Postgres. Wrapping with %...%
        # matches the search term anywhere in the name, not just the start.
        like_pattern = f'%{search}%'
        cur.execute(
            'SELECT COUNT(*) AS count FROM projects WHERE name ILIKE %s',
            (like_pattern,)
        )
        total = cur.fetchone()['count']

        cur.execute(
            '''SELECT * FROM projects WHERE name ILIKE %s
               ORDER BY created_at DESC
               LIMIT %s OFFSET %s''',
            (like_pattern, PAGE_SIZE, offset)
        )
    else:
        cur.execute('SELECT COUNT(*) AS count FROM projects')
        total = cur.fetchone()['count']

        cur.execute(
            '''SELECT * FROM projects
               ORDER BY created_at DESC
               LIMIT %s OFFSET %s''',
            (PAGE_SIZE, offset)
        )

    projects = cur.fetchall()
    cur.close()
    conn.close()

    total_pages = max((total + PAGE_SIZE - 1) // PAGE_SIZE, 1)

    return jsonify({
        'projects': projects,
        'total': total,
        'page': page,
        'page_size': PAGE_SIZE,
        'total_pages': total_pages,
    }), 200


@project_api.route('/projects/<int:project_id>/status', methods=['PATCH'])
def update_project_status(project_id):
    data = request.get_json() or {}
    new_status = data.get('status')

    if new_status not in VALID_STATUSES:
        return jsonify({
            'error': f'Status must be one of: {", ".join(VALID_STATUSES)}'
        }), 400

    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        'UPDATE projects SET status = %s WHERE id = %s RETURNING *',
        (new_status, project_id)
    )
    updated = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not updated:
        logger.warning(f'Status update failed — project not found: id={project_id}')
        return jsonify({'error': 'Project not found'}), 404

    logger.info(f'Project status updated: id={project_id} status="{new_status}"')
    return jsonify(updated), 200


@project_api.route('/dashboard-stats', methods=['GET'])
def dashboard_stats():
    """
    Returns everything the Dashboard page needs in one call:
      - the 5 top stat cards (total, closed, running, closure_delay, cancelled)
      - a department-wise breakdown of total vs closed projects, for the bar chart
    """
    conn = get_db()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("SELECT COUNT(*) AS count FROM projects")
    total = cur.fetchone()['count']

    cur.execute("SELECT COUNT(*) AS count FROM projects WHERE status = 'Closed'")
    closed = cur.fetchone()['count']

    cur.execute("SELECT COUNT(*) AS count FROM projects WHERE status = 'Running'")
    running = cur.fetchone()['count']

    cur.execute("SELECT COUNT(*) AS count FROM projects WHERE status = 'Cancelled'")
    cancelled = cur.fetchone()['count']

    # "Delayed" = past its end_date but not yet Closed or Cancelled --
    # i.e. it should have wrapped up by now but is still open.
    cur.execute(
        """SELECT COUNT(*) AS count FROM projects
           WHERE end_date < CURRENT_DATE
           AND status NOT IN ('Closed', 'Cancelled')"""
    )
    closure_delay = cur.fetchone()['count']

    # Department-wise total vs closed, for the bar chart. Projects with no
    # department set are grouped under "Unassigned" rather than silently
    # dropped, so the totals on this chart always add up to the real total.
    cur.execute(
        """SELECT
             COALESCE(department, 'Unassigned') AS department,
             COUNT(*) AS total,
             COUNT(*) FILTER (WHERE status = 'Closed') AS closed
           FROM projects
           GROUP BY COALESCE(department, 'Unassigned')
           ORDER BY total DESC"""
    )
    department_rows = cur.fetchall()

    cur.close()
    conn.close()

    department_breakdown = [
        {
            'department': row['department'],
            'total': row['total'],
            'closed': row['closed'],
        }
        for row in department_rows
    ]

    return jsonify({
        'total_projects': total,
        'closed': closed,
        'running': running,
        'closure_delay': closure_delay,
        'cancelled': cancelled,
        'department_breakdown': department_breakdown,
    }), 200