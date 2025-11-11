import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: 2,
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

    if (formData.password !== formData.password_confirmation) {
      setError('Password tidak cocok!');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter!');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-split-container">
      {/* Left Side - Green with Pink/Purple Gradient */}
      <div className="split-left">
        {/* Decorative Ovals */}
        <div className="oval-shape oval-1"></div>
        <div className="oval-shape oval-2"></div>
        <div className="oval-shape oval-3"></div>
      </div>

      {/* Right Side - White Form */}
      <div className="split-right">
        <div className="form-wrapper">
          <h2 className="form-title">Buat Akun</h2>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="input-group">
              <label htmlFor="full_name">Nama Lengkap</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap Anda"
                required
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan username Anda"
                required
                className="input-field"
              />
            </div>

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
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan Password (Min. 8 Karakter)"
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

            <div className="input-group">
              <label htmlFor="password_confirmation">Konfirmasi Password</label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Ulangi password Anda"
                required
                className="input-field"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="form-footer">
            Sudah punya akun? <Link to="/login" className="footer-link">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;