import { NavLink } from 'react-router-dom';
import { Home, Users, HardHat } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', label: '工地看板', icon: Home },
    { to: '/workers', label: '工人统计', icon: Users },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#1e3a5f] to-[#0f1f3a] text-white shadow-xl flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">装修管家</h1>
            <p className="text-xs text-blue-200/70">工地进度管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                  : 'text-blue-100/80 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-blue-200/60 mb-1">今天日期</p>
          <p className="text-sm font-medium">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
