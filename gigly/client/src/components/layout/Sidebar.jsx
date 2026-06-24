import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/helpers';
import Avatar from '../ui/Avatar';
import {
  LayoutDashboard, Briefcase, Users, FileText, Clock, Receipt,
  MessageSquare, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  Search, Star, TrendingUp, CreditCard, Shield, Zap, Mail,
} from 'lucide-react';

const NAV = {
  freelancer: [
    { label: 'Dashboard', href: '/freelancer/dashboard', icon: LayoutDashboard },
    { label: 'Find Jobs', href: '/jobs', icon: Search },
    { label: 'My Proposals', href: '/freelancer/proposals', icon: FileText },
    { label: 'Contracts', href: '/freelancer/contracts', icon: Briefcase },
    { label: 'Timesheets', href: '/freelancer/timesheets', icon: Clock },
    { label: 'Invoices', href: '/freelancer/invoices', icon: Receipt },
    { label: 'Profile', href: '/freelancer/profile', icon: Star },
  ],
  client: [
    { label: 'Dashboard', href: '/client/dashboard', icon: LayoutDashboard },
    { label: 'Find Talent', href: '/browse', icon: Users },
    { label: 'My Jobs', href: '/client/jobs', icon: Briefcase },
    { label: 'Contracts', href: '/client/contracts', icon: FileText },
    { label: 'Invoices & Pay', href: '/client/invoices', icon: CreditCard },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { label: 'Contracts', href: '/admin/contracts', icon: FileText },
    { label: 'Disputes', href: '/admin/disputes', icon: Shield },
    { label: 'Contact Messages', href: '/admin/messages', icon: Mail },
  ],
};

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV[user?.role] || [];

  return (
    <aside className={cn('h-screen flex flex-col bg-white border-r border-gray-200 fixed left-0 top-0 z-40 transition-all duration-300', collapsed ? 'w-[72px]' : 'w-64')}>
      {/* Logo */}
      <div className="h-16 flex items-center px-3 border-b border-gray-100 gap-3 flex-shrink-0">
        <NavLink to="/" title="Back to home" className="flex items-center">
          {!collapsed && <span className="text-xl font-extrabold text-primary-600 tracking-tight">Gigly</span>}
          {collapsed && <span className="text-lg font-extrabold text-primary-600">G</span>}
        </NavLink>
        <button onClick={onToggle} className="ml-auto text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
        {navItems.map(({ label, href, icon: Icon }) => (
          <NavLink key={href} to={href}
            className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
              isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        <div className="border-t border-gray-100 pt-2 mt-2 space-y-0.5">
          <NavLink to="/messages" className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all', isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')} title={collapsed ? 'Messages' : undefined}>
            <MessageSquare size={18} className="flex-shrink-0" />
            {!collapsed && <span>Messages</span>}
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all', isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')} title={collapsed ? 'Notifications' : undefined}>
            <Bell size={18} className="flex-shrink-0" />
            {!collapsed && <span>Notifications</span>}
          </NavLink>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-3 flex-shrink-0">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar src={user?.avatar} name={user?.name} size="sm" className="flex-shrink-0" />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
        {collapsed && (
          <button onClick={() => { logout(); navigate('/login'); }} className="mt-2 w-full flex justify-center p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
