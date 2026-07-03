from flask import Flask, jsonify
from flask_cors import CORS
from database import init_db, seed_dropdown_options
from auth_routes import auth_api
from project_routes import project_api
import logging

# Configure logging once here, at the app level. Every other file in the
# backend gets its own logger via logging.getLogger(__name__), but they all
# inherit this format and level setting automatically -- so you only need to
# configure it in one place.
#
# Format breakdown:
#   %(asctime)s   - timestamp e.g. 2026-06-26 10:30:00,123
#   %(name)s      - which file logged this e.g. auth_routes
#   %(levelname)s - INFO / WARNING / ERROR
#   %(message)s   - the actual log message
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(name)s] %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)

logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_api)
app.register_blueprint(project_api)

@app.errorhandler(404)
def not_found(e):
    logger.warning(f'404 hit: {e}')
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    logger.warning(f'405 hit: {e}')
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(e):
    logger.error(f'500 error: {e}')
    return jsonify({'error': 'An unexpected server error occurred'}), 500

init_db()
seed_dropdown_options()
logger.info('App started — tables initialised, dropdowns seeded')

if __name__ == '__main__':
    app.run(debug=True)