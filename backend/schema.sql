-- =============================================================
-- Online Project Management — Database Schema
-- =============================================================
-- Run this script to create all tables from scratch.
-- Safe to run multiple times — CREATE TABLE IF NOT EXISTS means
-- it won't fail or overwrite if the tables already exist.
-- =============================================================


-- -------------------------------------------------------------
-- users
-- Stores login credentials. Passwords are never stored in plain
-- text — they are hashed with werkzeug before being inserted.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id       SERIAL PRIMARY KEY,
    email    TEXT   NOT NULL UNIQUE,
    password TEXT   NOT NULL
);


-- -------------------------------------------------------------
-- dropdown_options
-- Stores the selectable values for every dropdown on the Create
-- Project form. Keeping these in the database (rather than
-- hardcoding them in the frontend) means they can be updated
-- without touching any code.
--
-- field_name  : which dropdown this belongs to
--               e.g. 'reason', 'type', 'division', 'category',
--                    'priority', 'department', 'location'
-- value       : the label shown in the dropdown e.g. 'High'
-- display_order: controls the order options appear in the UI
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dropdown_options (
    id            SERIAL  PRIMARY KEY,
    field_name    TEXT    NOT NULL,
    value         TEXT    NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (field_name, value)
);


-- -------------------------------------------------------------
-- projects
-- One row per project. All dropdown fields (reason, type, etc.)
-- store the selected label as plain text rather than a foreign
-- key, so changing dropdown options later doesn't break existing
-- project records.
--
-- status is always set to 'Registered' on creation by the API
-- and can only be changed to 'Running', 'Closed', or
-- 'Cancelled' via the PATCH /projects/<id>/status endpoint.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id         SERIAL      PRIMARY KEY,
    name       TEXT        NOT NULL,
    reason     TEXT,
    type       TEXT,
    division   TEXT,
    category   TEXT,
    priority   TEXT,
    department TEXT,
    location   TEXT,
    start_date DATE,
    end_date   DATE,
    status     TEXT        NOT NULL DEFAULT 'Registered',
    created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);


-- -------------------------------------------------------------
-- Indexes
-- Added on columns that are frequently used in WHERE clauses
-- to speed up queries as the projects table grows.
-- -------------------------------------------------------------

-- Used by GET /projects?search= (ILIKE search on project name)
CREATE INDEX IF NOT EXISTS idx_projects_name
    ON projects (name);

-- Used by GET /projects (filter/sort by status on listing page)
CREATE INDEX IF NOT EXISTS idx_projects_status
    ON projects (status);

-- Used by GET /dashboard-stats (GROUP BY department)
CREATE INDEX IF NOT EXISTS idx_projects_department
    ON projects (department);