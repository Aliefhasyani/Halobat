import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      navigate('/admin/users');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-centered-container">
      {/* Background Ovals */}
      <div className="bg-oval bg-oval-1"></div>
      <div className="bg-oval bg-oval-2"></div>
      <div className="bg-oval bg-oval-3"></div>
      <div className="bg-oval bg-oval-4"></div>

      {/* Login Form Card */}
      <div className="centered-form-card">
        <h2 className="form-title">Masuk</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="halobatweb@gmail.com"
              required
              className="input-field"
            />
          </div>

          <div className="input-group">
            <div className="label-with-link">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="link-small">
                Lupa Password ?
              </Link>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan Password Anda"
                required
                className="input-field"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <p className="form-footer">
          Tidak punya akun? <Link to="/register" className="footer-link">Daftar</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;