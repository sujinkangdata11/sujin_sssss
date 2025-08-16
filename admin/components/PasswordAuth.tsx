import React, { useState } from 'react';

interface PasswordAuthProps {
  onAuth: () => void;
}

const PasswordAuth: React.FC<PasswordAuthProps> = ({ onAuth }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'sujin0209') {
      onAuth();
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div className="admin-auth">
      <div className="admin-auth-card">
        <h2>Admin Access</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="admin-password-input"
          />
          <button type="submit" className="admin-auth-btn">
            Login
          </button>
          {error && <div className="admin-error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default PasswordAuth;