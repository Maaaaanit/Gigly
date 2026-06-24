import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, Menu, X, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

const PublicNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const dashboardLink = user ? `/${user.role}/dashboard` : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const profileMenu = [
    { label: 'Dashboard', href: dashboardLink, icon: User },
    { label: 'Profile', href: `/${user?.role}/profile`, icon: Settings },
    { label: 'Logout', onClick: handleLogout, icon: LogOut },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-8 justify-between">
          <Link to="/" className="flex items-center flex-shrink-0">
            <span className="text-2xl font-extrabold text-primary-600 tracking-tight">Gigly</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 justify-center flex-1">
            <Link to="/browse" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Find Talent</Link>
            <Link to="/jobs" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Find Jobs</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                  <ChevronDown size={14} className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg">
                    {profileMenu.map(({ label, href, onClick, icon: Icon }) => (
                      <div key={label}>
                        {onClick ? (
                          <button onClick={onClick} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl">
                            <Icon size={16} />
                            {label}
                          </button>
                        ) : (
                          <Link to={href} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl">
                            <Icon size={16} />
                            {label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                <Link to="/register"><Button size="sm">Get Started</Button></Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link to="/browse" className="block text-sm font-medium text-gray-600 py-2">Find Talent</Link>
          <Link to="/jobs" className="block text-sm font-medium text-gray-600 py-2">Find Jobs</Link>
          {user ? (
            <>
              <Link to={dashboardLink} className="block text-sm font-semibold text-primary-600 py-2">Dashboard</Link>
              <Link to={`/${user.role}/profile`} className="block text-sm font-medium text-gray-600 py-2">Profile</Link>
              <button onClick={handleLogout} className="w-full text-left block text-sm font-medium text-red-600 py-2">Logout</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1"><Button variant="secondary" className="w-full" size="sm">Log in</Button></Link>
              <Link to="/register" className="flex-1"><Button className="w-full" size="sm">Get Started</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
