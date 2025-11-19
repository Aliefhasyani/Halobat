import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { userAPI, drugAPI, roleAPI, brandAPI, manufacturerAPI, diagnosesAPI } from '../../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrugs: 0,
    totalBrands: 0,
    totalManufacturers: 0,
    totalRoles: 0,
    totalDiagnoses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [usersRes, drugsRes, rolesRes, brandsRes, manufacturersRes, diagnosesRes] = await Promise.all([
          userAPI.getAll().catch(() => ({ data: { data: [] } })),
          drugAPI.getAll().catch(() => ({ data: { data: [] } })),
          roleAPI.getAll().catch(() => ({ data: { data: [] } })),
          brandAPI.getAll().catch(() => ({ data: { data: [] } })),
          manufacturerAPI.getAll().catch(() => ({ data: { data: [] } })),
          diagnosesAPI.getAll().catch(() => ({ data: { data: [] } })),
        ]);

        setStats({
          totalUsers: usersRes.data?.data?.length || 0,
          totalDrugs: drugsRes.data?.data?.length || 0,
          totalRoles: rolesRes.data?.data?.length || 0,
          totalBrands: brandsRes.data?.data?.length || 0,
          totalManufacturers: manufacturersRes.data?.data?.length || 0,
          totalDiagnoses: diagnosesRes.data?.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: '#2e7d32',
      bgColor: '#e8f5e9',
      link: '/admin/users',
    },
    {
      title: 'Total Drugs',
      value: stats.totalDrugs,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M10.5 13.5L15.5 8.5M15.5 8.5L17.5 6.5C18.88 5.12 18.88 2.88 17.5 1.5C16.12 0.12 13.88 0.12 12.5 1.5L10.5 3.5" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: '#1976d2',
      bgColor: '#e3f2fd',
      link: '/admin/drugs',
    },
    {
      title: 'Total Brands',
      value: stats.totalBrands,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2"/>
          <circle cx="7" cy="7" r="1" fill="currentColor"/>
        </svg>
      ),
      color: '#f57c00',
      bgColor: '#fff3e0',
      link: '/admin/brands',
    },
    {
      title: 'Total Manufacturers',
      value: stats.totalManufacturers,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M2 20h20M3 20V9l5 3V7l5 3V4l5 3v13" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: '#7c4dff',
      bgColor: '#f3e5f5',
      link: '/admin/manufacturers',
    },
    {
      title: 'Total Roles',
      value: stats.totalRoles,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: '#00acc1',
      bgColor: '#e0f7fa',
      link: '/admin/roles',
    },
    {
      title: 'Total Diagnoses',
      value: stats.totalDiagnoses,
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: '#e91e63',
      bgColor: '#fce4ec',
      link: '/admin/diagnoses',
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome back, {user?.full_name || 'Admin'}!</h1>
          <p className="welcome-subtitle">Here's what's happening with your pharmacy management system today.</p>
        </div>
        <div className="welcome-date">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card" onClick={() => window.location.href = card.link}>
            <div className="stat-icon" style={{ background: card.bgColor, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <h3 className="stat-title">{card.title}</h3>
              <p className="stat-value">{card.value}</p>
            </div>
            <div className="stat-arrow" style={{ color: card.color }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => window.location.href = '/admin/users'}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Add New User</span>
          </button>

          <button className="action-btn" onClick={() => window.location.href = '/admin/drugs'}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M10.5 13.5L15.5 8.5M15.5 8.5L17.5 6.5C18.88 5.12 18.88 2.88 17.5 1.5C16.12 0.12 13.88 0.12 12.5 1.5L10.5 3.5" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Add New Drug</span>
          </button>

          <button className="action-btn" onClick={() => window.location.href = '/admin/brands'}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="7" cy="7" r="1" fill="currentColor"/>
            </svg>
            <span>Add New Brand</span>
          </button>

          <button className="action-btn" onClick={() => window.location.href = '/admin/roles'}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Manage Roles</span>
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="system-info">
        <h2 className="section-title">System Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Current User:</span>
            <span className="info-value">{user?.full_name || 'Admin'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Role:</span>
            <span className="info-value">{user?.role?.name || user?.role || 'Administrator'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Login:</span>
            <span className="info-value">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;