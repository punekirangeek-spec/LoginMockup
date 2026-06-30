# LoginMockup

Online project management app — login, create project, project listing, and dashboard pages.

## Project structure

```
LoginMockup/
├── backend/      Flask API
└── frontend/     React app (Create React App)
```

## Backend setup

1. Go into the backend folder:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install flask flask-cors psycopg2-binary python-dotenv werkzeug --break-system-packages
   ```

3. Create a `.env` file in `backend/` with your Postgres connection details (this file is not committed to git).

4. Run the server:
   ```
   python app.py
   ```
   Runs on `http://127.0.0.1:5000`. On first run it creates the required tables and seeds default dropdown values automatically.

## Frontend setup

1. Go into the frontend folder:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the app:
   ```
   npm start
   ```
   Runs on `http://localhost:3000`.

Both the backend and frontend need to be running at the same time for the app to work.

## Pages

- `/` — Login
- `/dashboard` — Dashboard (stat cards + department-wise chart)
- `/projects` — Project listing (search, pagination, Start/Close/Cancel)
- `/create` — Create project form

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/register` | Create a user account |
| POST | `/login` | Log in |
| GET | `/dropdown-options` | Get dropdown values for the create project form |
| POST | `/projects` | Create a project |
| GET | `/projects` | List projects (paginated, searchable by name) |
| PATCH | `/projects/<id>/status` | Update a project's status |
| GET | `/dashboard-stats` | Get dashboard stat cards + department chart data |

Full request/response details are in `API_Documentation.docx`.

## Notes

- Passwords are hashed with werkzeug, not stored in plain text.
- Dropdown options (Reason, Type, Division, etc.) are stored in the database, not hardcoded in the frontend.
- All fields on the create project form are required, and end date cannot be before start date.
