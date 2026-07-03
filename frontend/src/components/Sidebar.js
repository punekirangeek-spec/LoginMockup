import React from 'react';
import { DashboardIcon, ProjectListIcon, PlusIcon, LogoutIcon } from './NavIcons';
import './Sidebar.css';

/**
 * activePage: 'dashboard' | 'projects' | null
 * onNavigate(page): called with 'dashboard' | 'projects' | 'create'
 * onLogout(): called when the logout icon is clicked
 */
function Sidebar({ activePage, onNavigate, onLogout }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-top">
        <button
          type="button"
          className="sidebar-icon-btn"
          aria-label="Dashboard"
          aria-current={activePage === 'dashboard' ? 'page' : undefined}
          onClick={() => onNavigate && onNavigate('dashboard')}
        >
          <DashboardIcon active={activePage === 'dashboard'} />
        </button>

        <button
          type="button"
          className="sidebar-icon-btn"
          aria-label="Project listing"
          aria-current={activePage === 'projects' ? 'page' : undefined}
          onClick={() => onNavigate && onNavigate('projects')}
        >
          <ProjectListIcon active={activePage === 'projects'} />
        </button>

        <div className="sidebar-divider" />

        <button
          type="button"
          className="sidebar-icon-btn"
          aria-label="Create project"
          onClick={() => onNavigate && onNavigate('create')}
        >
          <PlusIcon />
        </button>
      </div>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-icon-btn"
          aria-label="Log out"
          onClick={() => onLogout && onLogout()}
        >
          <LogoutIcon />
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;