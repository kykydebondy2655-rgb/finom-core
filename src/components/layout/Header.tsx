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

    </header>
  );
};

export default Header;
