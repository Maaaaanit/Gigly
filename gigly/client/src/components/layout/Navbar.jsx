import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI, messageAPI } from '../../api';
import Avatar from '../ui/Avatar';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCounts = async () => {
      try {
        const [nRes, mRes] = await Promise.all([notificationAPI.getAll(), messageAPI.getUnreadCount()]);
        setUnreadNotifications(nRes.data.data.unreadCount || 0);
        setUnreadMessages(mRes.data.data.count || 0);
      } catch {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const dashboardLink = user ? `/${user.role}/dashboard` : '/';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input placeholder="Search talent, jobs..." className="input pl-10 py-2 bg-gray-50 border-gray-200 text-sm" />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <Link to="/messages" className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <MessageSquare size={20} />
          {unreadMessages > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">{unreadMessages > 9 ? '9+' : unreadMessages}</span>}
        </Link>
        <Link to="/notifications" className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={20} />
          {unreadNotifications > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
        </Link>
        <Link to={dashboardLink} className="flex items-center gap-2.5 ml-2 pl-2 border-l border-gray-200">
          <Avatar src={user?.avatar} name={user?.name} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
