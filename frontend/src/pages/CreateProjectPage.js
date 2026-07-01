import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLogo, HeaderBackground } from '../components/Icons';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config';
import "./CreateProjectPage.css";

const DROPDOWN_FIELDS = [
  { key: 'reason',     label: 'Reason' },
  { key: 'type',       label: 'Type' },
  { key: 'division',   label: 'Division' },
  { key: 'category',   label: 'Category' },
  { key: 'priority',   label: 'Priority' },
  { key: 'department', label: 'Department' },
  { key: 'location',   label: 'Location' },
];

// Every field on this form is required. Listing them here (name + the
// 7 dropdowns + both dates) means the "is anything missing" check is one
// loop instead of nine separate if-statements that are easy to forget
// to update later if a field gets added or renamed.
const REQUIRED_FIELDS = [
  { key: 'name',       label: 'Project theme' },
  ...DROPDOWN_FIELDS,
  { key: 'start_date', label: 'Start date' },
  { key: 'end_date',   label: 'End date' },
];

function CreateProjectPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    reason: '',
    type: '',
    division: '',
    category: '',
    priority: '',
    department: '',
    location: '',
    start_date: '',
    end_date: '',
  });

  const [options, setOptions] = useState({});
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/dropdown-options`)
      .then((res) => res.json())
      .then((data) => setOptions(data))
      .catch(() => setError('Could not load dropdown options. Is the server running?'))
      .finally(() => setOptionsLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError('');

    for (const { key, label } of REQUIRED_FIELDS) {
      if (!form[key] || !form[key].trim()) {
        setError(`${label} is required`);
        return;
      }
    }

    if (form.start_date > form.end_date) {
      setError('End date cannot be before start date');
      return;
    }

    setSaving(true);

    fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.error || 'Failed to save project');
        } else {
          navigate('/projects');
        }
      })
      .catch(() => setError('Failed to connect to server.'))
      .finally(() => setSaving(false));
  };

  const handleSidebarNavigate = (page) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'projects') navigate('/projects');
    else if (page === 'create') navigate('/create');
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="with-sidebar">
      <Sidebar activePage={null} onNavigate={handleSidebarNavigate} onLogout={handleLogout} />

      <div className="container-fluid main-bg p-0 position-relative">
        <div className="page-band">
          <HeaderBackground className="band-graphic" />

          <div className="band-header d-flex align-items-center">
            <button type="button" className="back-btn" onClick={() => navigate('/projects')}>
              <span aria-hidden="true">&#8249;</span>
            </button>
            <h5 className="m-0 fw-bold text-white">Create Project</h5>
          </div>
          <div className="band-logo">
            <AppLogo />
          </div>
        </div>

        <div className="page-content">
          <form onSubmit={handleSave}>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
              <input
                name="name"
                type="text"
                placeholder="Enter Project Theme *"
                className="form-control theme-input"
                value={form.name}
                onChange={handleChange}
                required
              />
              <button type="submit" className="btn save-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Project'}
              </button>
            </div>

            {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
            {optionsLoading && (
              <div className="text-muted small mb-3">Loading options...</div>
            )}

            <div className="row gx-4 gy-3">
              {DROPDOWN_FIELDS.slice(0, 3).map(({ key, label }) => (
                <div className="col-12 col-md-4" key={key}>
                  <label className="form-label text-muted small mb-1">{label} *</label>
                  <select
                    name={key}
                    className="form-select"
                    value={form[key]}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select {label.toLowerCase()}</option>
                    {(options[key] || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}

              {DROPDOWN_FIELDS.slice(3, 6).map(({ key, label }) => (
                <div className="col-12 col-md-4" key={key}>
                  <label className="form-label text-muted small mb-1">{label} *</label>
                  <select
                    name={key}
                    className="form-select"
                    value={form[key]}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select {label.toLowerCase()}</option>
                    {(options[key] || []).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="col-12 col-md-4">
                <label className="form-label text-muted small mb-1">Start Date as per Project Plan *</label>
                <input
                  name="start_date"
                  type="date"
                  className="form-control"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label text-muted small mb-1">End Date as per Project Plan *</label>
                <input
                  name="end_date"
                  type="date"
                  className="form-control"
                  value={form.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label text-muted small mb-1">{DROPDOWN_FIELDS[6].label} *</label>
                <select
                  name="location"
                  className="form-select"
                  value={form.location}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select location</option>
                  {(options.location || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 text-muted small">
              Status: <span className="fw-bold text-dark">Registered</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProjectPage;