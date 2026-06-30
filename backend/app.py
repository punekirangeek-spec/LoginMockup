from flask import Flask
from flask_cors import CORS
from database import init_db, seed_dropdown_options
from auth_routes import auth_api
from project_routes import project_api

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_api)
app.register_blueprint(project_api)

init_db()
seed_dropdown_options()

if __name__ == '__main__':
    app.run(debug=True)