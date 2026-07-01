from flask import Flask, jsonify
from flask_cors import CORS
from database import init_db, seed_dropdown_options
from auth_routes import auth_api
from project_routes import project_api

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_api)
app.register_blueprint(project_api)

# Without these handlers, Flask returns raw HTML error pages when something
# goes wrong. The React frontend expects JSON from every response -- if it
# receives HTML instead, res.json() throws a parse error and the real error
# message is lost. These handlers make sure every error, expected or not,
# comes back as a consistent JSON object.

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'An unexpected server error occurred'}), 500

init_db()
seed_dropdown_options()

if __name__ == '__main__':
    app.run(debug=True)