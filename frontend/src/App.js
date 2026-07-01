import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CreateProjectPage from './pages/CreateProjectPage';
import Dashboard from './pages/Dashboard';
import ProjectListing from './pages/ProjectListing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectListing />} />
        <Route path="/create" element={<CreateProjectPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;