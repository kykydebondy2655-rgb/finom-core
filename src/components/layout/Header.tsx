import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/finom/Button';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const publicLinks = [
    { path: '/', label: 'Accueil' },
    { path: '/rates', label: 'Taux' },
    { path: '/how-it-works', label: 'Fonctionnement' },
    { path: '/simulator', label: 'Simulateur' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' },
  ];

  const clientLinks = [
    { path: '/dashboard', label: 'Tableau de bord' },
    { path: '/loans', label: 'Mes prêts' },
    { path: '/banking', label: 'Compte' },
  ];

  const agentLinks = [
    { path: '/agent/dashboard', label: 'Tableau de bord' },
    { path: '/agent/clients', label: 'Mes clients' },
    { path: '/agent/callbacks', label: 'Rappels' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Tableau de bord' },
    { path: '/admin/clients', label: 'Clients' },
    { path: '/admin/loans', label: 'Dossiers' },
    { path: '/admin/agents', label: 'Agents' },
  ];

  const getNavLinks = () => {
    if (!isAuthenticated) return publicLinks;
    switch (user?.role) {
      case 'admin': return adminLinks;
      case 'agent': return agentLinks;
      default: return clientLinks;
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="header">
      <div className="header-container">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="logo">
          <span className="logo-text">FINOM</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="header-actions">
          {isAuthenticated && <NotificationBell />}
          {isAuthenticated ? (
            <div className="user-menu-wrapper">
              <button 
                className="user-menu-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">
                  {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                </div>
                <span className="user-name">{user?.firstName || 'Utilisateur'}</span>
                <ChevronDown size={16} />
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <User size={16} />
                    Mon profil
                  </Link>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Connexion
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Créer un compte
              </Button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {!isAuthenticated && (
            <div className="mobile-actions">
              <Button variant="secondary" size="md" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                Connexion
              </Button>
              <Button variant="primary" size="md" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                Créer un compte
              </Button>
            </div>
          )}

          {isAuthenticated && (
            <div className="mobile-actions">
              <Link 
                to="/profile" 
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={18} />
                Mon profil
              </Link>
              <button className="mobile-logout" onClick={handleLogout}>
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--color-primary);
          letter-spacing: -0.03em;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: color 0.2s;
          font-size: 0.95rem;
        }

        .nav-link:hover,
        .nav-link.active {
          color: var(--color-primary);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-menu-wrapper {
          position: relative;
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          border-radius: var(--radius-full);
          transition: background 0.2s;
        }

        .user-menu-trigger:hover {
          background: var(--color-surface-hover);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-name {
          font-weight: 500;
          color: var(--color-text);
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: white;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          min-width: 180px;
          overflow: hidden;
          border: 1px solid var(--color-border);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          width: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--color-text);
          transition: background 0.15s;
          text-decoration: none;
        }

        .dropdown-item:hover {
          background: var(--color-surface-hover);
        }

        .dropdown-item.logout {
          color: var(--color-danger);
          border-top: 1px solid var(--color-border);
        }

        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          padding: 0.5rem;
          color: var(--color-text);
          cursor: pointer;
        }

        .mobile-menu {
          display: none;
          background: white;
          border-top: 1px solid var(--color-border);
          padding: 1rem 1.5rem 1.5rem;
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          color: var(--color-text-secondary);
          transition: all 0.2s;
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          background: var(--color-surface-hover);
          color: var(--color-primary);
        }

        .mobile-actions {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mobile-logout {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          color: var(--color-danger);
          background: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          font-size: 1rem;
        }

        @media (max-width: 1024px) {
          .desktop-nav {
            display: none;
          }

          .header-actions > button:not(.mobile-menu-toggle) {
            display: none;
          }

          .user-menu-wrapper {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .mobile-menu {
            display: block;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
