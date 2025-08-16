import React, { useState } from 'react';
import PasswordAuth from './components/PasswordAuth';
import ContentEditor from './components/ContentEditor';
import './admin.css';

const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <PasswordAuth onAuth={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Content Admin Panel</h1>
        <button 
          className="admin-logout-btn"
          onClick={() => setIsAuthenticated(false)}
        >
          Logout
        </button>
      </div>
      <ContentEditor />
    </div>
  );
};

export default AdminPanel;