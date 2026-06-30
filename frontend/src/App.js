import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import CreateProjectPage from './CreateProjectPage';
import Dashboard from './Dashboard';
import ProjectListing from './ProjectListing';

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