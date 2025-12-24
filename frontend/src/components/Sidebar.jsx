import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, User as UserIcon, Activity, LogOut, Terminal, Layers, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/' },
        { icon: Activity, label: 'System Logs', path: '/analytics' },
        { icon: UserIcon, label: 'User Index', path: '/users' },
        { icon: Layers, label: 'Nodes', path: '/integrations' },
        { icon: Terminal, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Config', path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-dark-panel border-r border-dark-border flex flex-col shrink-0">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-dark-border gap-3">
                <Command className="w-5 h-5 text-neon-green" />
                <span className="font-bold text-white tracking-tight uppercase text-sm">SaturnOS</span>
                <span className="ml-auto text-[10px] font-mono text-muted-text bg-white/5 px-2 py-0.5 rounded">v2.4</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm font-medium ${isActive
                                ? 'bg-white/5 text-neon-green border-l-2 border-neon-green'
                                : 'text-muted-text hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                            }`
                        }
                    >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-dark-border bg-dark-bg/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-dark-border">
                        <span className="text-xs font-mono font-bold text-neon-green">
                            {user?.email?.charAt(0).toUpperCase() || 'A'}
                        </span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold text-white truncate">{user?.email || 'admin@local'}</span>
                        <span className="text-[10px] font-mono text-muted-text flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-green px-0.5" />
                            ONLINE
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded border border-dark-border bg-dark-bg text-muted-text text-xs font-mono hover:bg-coral-red/10 hover:text-coral-red hover:border-coral-red/20 transition-all"
                >
                    <LogOut className="w-3 h-3" />
                    DISCONNECT
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
