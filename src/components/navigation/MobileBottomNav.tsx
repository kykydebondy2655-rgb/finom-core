import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Wallet, 
  Calendar,
  Users, 
  Phone, 
  Settings,
  UserCheck,
  FolderOpen,
  BarChart3,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const MobileBottomNav: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Don't render on desktop or if not authenticated
  if (!isMobile || !isAuthenticated) return null;

  // Determine nav items based on user role
  const getNavItems = (): NavItem[] => {
    const role = user?.role;

    if (role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Accueil', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/clients', label: 'Clients', icon: <Users size={20} /> },
        { path: '/admin/loans', label: 'Dossiers', icon: <FolderOpen size={20} /> },
        { path: '/admin/agents', label: 'Agents', icon: <UserCheck size={20} /> },
        { path: '/admin/analytics', label: 'Stats', icon: <BarChart3 size={20} /> },
      ];
    }

    if (role === 'agent') {
      return [
        { path: '/agent/dashboard', label: 'Accueil', icon: <LayoutDashboard size={20} /> },
        { path: '/agent/clients', label: 'Clients', icon: <Users size={20} /> },
        { path: '/agent/callbacks', label: 'Rappels', icon: <Phone size={20} /> },
        { path: '/profile', label: 'Profil', icon: <User size={20} /> },
      ];
    }

    // Client role (default)
    return [
      { path: '/dashboard', label: 'Accueil', icon: <LayoutDashboard size={20} /> },
      { path: '/loans', label: 'Prêts', icon: <FileText size={20} /> },
      { path: '/banking', label: 'Compte', icon: <Wallet size={20} /> },
      { path: '/appointments', label: 'RDV', icon: <Calendar size={20} /> },
      { path: '/profile', label: 'Profil', icon: <User size={20} /> },
    ];
  };

  const navItems = getNavItems();

  // Check if we're on a dashboard or protected route
  const isDashboardRoute = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/agent') ||
                          location.pathname.startsWith('/loans') ||
                          location.pathname.startsWith('/banking') ||
                          location.pathname.startsWith('/appointments') ||
                          location.pathname.startsWith('/profile');

  if (!isDashboardRoute) return null;

  return (
    <motion.nav 
      className="mobile-bottom-nav"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
                        (item.path !== '/dashboard' && 
                         item.path !== '/agent/dashboard' && 
                         item.path !== '/admin/dashboard' && 
                         location.pathname.startsWith(item.path));
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">
              {item.icon}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
            {isActive && (
              <motion.div 
                className="bottom-nav-indicator"
                layoutId="bottomNavIndicator"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </NavLink>
        );
      })}
    </motion.nav>
  );
};

export default MobileBottomNav;
