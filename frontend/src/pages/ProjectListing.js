import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '../components/Icons';
import { HeaderBackground } from '../components/BackgroundSVGs';
import Sidebar from '../components/Sidebar';
import { API_BASE_URL } from '../config';
import './ProjectListing.css';

const STATUS_CLASS = {
  Registered: 'status-registered',
  Running: 'status-running',
  Closed: 'status-closed',
  Cancelled: 'status-cancelled',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ProjectListing() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // tracks which row's button was just clicked, so only that row shows a
  // "Updating..." state instead of disabling the whole table
  const [updatingId, setUpdatingId] = useState(null);

  const fetchProjects = useCallback((targetPage, searchTerm) => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({ page: targetPage });
    if (searchTerm) params.set('search', searchTerm);

    fetch(`${API_BASE_URL}/projects?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
        setTotalPages(data.total_pages || 1);
      })
      .catch(() => setError('Failed to connect to the server. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProjects(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Debounce search: wait 400ms after the user stops typing before
  // re-querying, so every keystroke doesn't fire a network request.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchProjects(1, search);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleStatusChange = (projectId, newStatus) => {
    setUpdatingId(projectId);

    fetch(`${API_BASE_URL}/projects/${projectId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.error || 'Failed to update status');
          return;
        }
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
        );
      })
      .catch(() => setError('Failed to connect to the server. Please try again.'))
      .finally(() => setUpdatingId(null));
  };

  const handleSidebarNavigate = (page) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'projects') navigate('/projects');
    else if (page === 'create') navigate('/create');
  };

  const handleLogout = () => navigate('/');

  const goToPage = (n) => {
    if (n < 1 || n > totalPages) return;
    setPage(n);
  };

  return (
    <div className="with-sidebar">
      <Sidebar activePage="projects" onNavigate={handleSidebarNavigate} onLogout={handleLogout} />

      <div className="listing-page">
        <div className="listing-band">
          <HeaderBackground className="listing-band-graphic" />
          <div className="listing-band-header">
            <button type="button" className="back-btn" onClick={() => navigate('/dashboard')}>
              <span aria-hidden="true">&#8249;</span>
            </button>
            <h5 className="m-0 fw-bold text-white">Project Listing</h5>
          </div>
          <div className="listing-band-logo">
            <AppLogo />
          </div>
        </div>

        <div className="listing-content">
          <div className="listing-search-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by project name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          <div className="table-scroll">
            <table className="listing-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Reason</th>
                  <th>Type</th>
                  <th>Division</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Dept.</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={10} className="empty-state">Loading projects...</td>
                  </tr>
                )}

                {!loading && projects.length === 0 && (
                  <tr>
                    <td colSpan={10} className="empty-state">
                      {search ? 'No projects match your search.' : 'No projects yet — create one to get started.'}
                    </td>
                  </tr>
                )}

                {!loading && projects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="project-name">{p.name}</div>
                      <div className="project-dates">
                        {formatDate(p.start_date)} to {formatDate(p.end_date)}
                      </div>
                    </td>
                    <td>{p.reason || '—'}</td>
                    <td>{p.type || '—'}</td>
                    <td>{p.division || '—'}</td>
                    <td>{p.category || '—'}</td>
                    <td>{p.priority || '—'}</td>
                    <td>{p.department || '—'}</td>
                    <td>{p.location || '—'}</td>
                    <td>
                      <span className={`status-badge ${STATUS_CLASS[p.status] || ''}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          type="button"
                          className="btn-action btn-start"
                          disabled={updatingId === p.id}
                          onClick={() => handleStatusChange(p.id, 'Running')}
                        >
                          Start
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-close-action"
                          disabled={updatingId === p.id}
                          onClick={() => handleStatusChange(p.id, 'Closed')}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-cancel"
                          disabled={updatingId === p.id}
                          onClick={() => handleStatusChange(p.id, 'Cancelled')}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/*
            Mobile card view: same `projects` data, completely different
            markup. A <table> can't reflow into a vertical layout no
            matter what CSS you throw at it -- rows and cells are
            fundamentally a grid. Rendering real stacked cards here (and
            hiding this block on desktop via CSS) is what removes the
            need to scroll sideways on a phone.
          */}
          <div className="listing-cards">
            {loading && <div className="empty-state">Loading projects...</div>}

            {!loading && projects.length === 0 && (
              <div className="empty-state">
                {search ? 'No projects match your search.' : 'No projects yet — create one to get started.'}
              </div>
            )}

            {!loading && projects.map((p) => (
              <div className="project-card" key={p.id}>
                <div className="project-card-header">
                  <div className="project-name">{p.name}</div>
                  <span className={`status-badge ${STATUS_CLASS[p.status] || ''}`}>
                    {p.status}
                  </span>
                </div>

                <div className="project-dates">
                  {formatDate(p.start_date)} to {formatDate(p.end_date)}
                </div>

                <div className="project-card-details">
                  <div>Reason: <strong>{p.reason || '—'}</strong></div>
                  <div>
                    Type: <strong>{p.type || '—'}</strong>
                    <span className="detail-dot">•</span>
                    Category: <strong>{p.category || '—'}</strong>
                  </div>
                  <div>
                    Div: <strong>{p.division || '—'}</strong>
                    <span className="detail-dot">•</span>
                    Dept: <strong>{p.department || '—'}</strong>
                  </div>
                  <div>Location: <strong>{p.location || '—'}</strong></div>
                  <div>Priority: <strong>{p.priority || '—'}</strong></div>
                </div>

                <div className="action-btns">
                  <button
                    type="button"
                    className="btn-action btn-start"
                    disabled={updatingId === p.id}
                    onClick={() => handleStatusChange(p.id, 'Running')}
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    className="btn-action btn-close-action"
                    disabled={updatingId === p.id}
                    onClick={() => handleStatusChange(p.id, 'Closed')}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn-action btn-cancel"
                    disabled={updatingId === p.id}
                    onClick={() => handleStatusChange(p.id, 'Cancelled')}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button type="button" onClick={() => goToPage(1)} disabled={page === 1}>&laquo;</button>
              <button type="button" onClick={() => goToPage(page - 1)} disabled={page === 1}>&lsaquo;</button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .map((n, idx, arr) => (
                  <React.Fragment key={n}>
                    {idx > 0 && arr[idx - 1] !== n - 1 && <span className="pagination-ellipsis">...</span>}
                    <button
                      type="button"
                      className={n === page ? 'active' : ''}
                      onClick={() => goToPage(n)}
                    >
                      {n}
                    </button>
                  </React.Fragment>
                ))}

              <button type="button" onClick={() => goToPage(page + 1)} disabled={page === totalPages}>&rsaquo;</button>
              <button type="button" onClick={() => goToPage(totalPages)} disabled={page === totalPages}>&raquo;</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectListing;