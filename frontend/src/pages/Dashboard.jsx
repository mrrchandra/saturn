import { useEffect, useState } from 'react';
import axios from 'axios';
import StatsCard from '../components/StatsCard';
import { motion } from 'framer-motion';
import { Activity, Terminal, ArrowUpRight, Search, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
    const [stats, setStats] = useState([]);
    const [activity, setActivity] = useState([]);
    const [growthData, setGrowthData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activityRes, growthRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/stats`),
                    axios.get(`${API_BASE_URL}/api/recent-activity`),
                    axios.get(`${API_BASE_URL}/api/analytics/users-registered`)
                ]);

                setStats(statsRes.data.data);
                setActivity(activityRes.data.data);

                // Process logs for chart
                const processed = growthRes.data.data.reduce((acc, reg) => {
                    const date = new Date(reg.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
                    const existing = acc.find(item => item.name === date);
                    if (existing) {
                        existing.users += 1;
                    } else {
                        acc.push({ name: date, users: 1 });
                    }
                    return acc;
                }, []);
                setGrowthData(processed.slice(-7));
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6 pb-10 min-h-full bg-dark-bg text-white font-sans">
            {/* Header / Command Bar */}
            <div className="flex items-center justify-between py-4 border-b border-dark-border mb-6">
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-neon-green" />
                        System Overview
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-text group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Execute command..."
                            className="bg-dark-panel border border-dark-border rounded px-3 py-1.5 pl-9 text-xs font-mono text-white focus:outline-none focus:border-neon-green/50 w-64 transition-all placeholder:text-muted-text"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-text font-mono border border-dark-border px-1 rounded">⌘K</div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-dark-panel border border-dark-border animate-pulse rounded" />)
                ) : stats.map((stat, index) => (
                    <motion.div
                        key={stat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <StatsCard stat={stat} />
                    </motion.div>
                ))}
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-dark-panel border border-dark-border p-5 rounded">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-neon-green" />
                            Network Traffic
                        </h2>
                        <div className="flex gap-2">
                            <button className="px-2 py-1 text-[10px] font-mono bg-white/5 text-white border border-dark-border rounded hover:bg-white/10">7D</button>
                            <button className="px-2 py-1 text-[10px] font-mono bg-transparent text-muted-text border border-transparent hover:text-white">30D</button>
                        </div>
                    </div>

                    <div className="h-[300px] w-full border border-dark-border bg-dark-bg/30 rounded relative overflow-hidden">
                        {/* Grid Effect Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center text-xs font-mono text-muted-text">INITIALIZING VISUALIZER...</div>
                        ) : growthData.length === 0 ? (
                            <div className="h-full w-full flex items-center justify-center text-xs font-mono text-muted-text">NO DATA STREAM</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.4} />
                                    <XAxis dataKey="name" stroke="#555" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#555" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '4px', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                                        itemStyle={{ color: '#22C55E' }}
                                        cursor={{ stroke: '#22C55E', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area type="monotone" dataKey="users" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-dark-panel border border-dark-border p-5 rounded flex flex-col">
                    <h2 className="text-sm font-semibold text-white mb-5 flex items-center justify-between">
                        <span>Recent Logs</span>
                        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-1 space-y-0.5 custom-scrollbar">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-10 bg-white/5 rounded animate-pulse mb-2" />)
                        ) : activity.length === 0 ? (
                            <div className="text-center py-10 text-xs font-mono text-muted-text">NO LOGS AVAILABLE</div>
                        ) : activity.map((item) => (
                            <div key={item.id} className="group flex items-center justify-between p-2.5 hover:bg-white/5 rounded border border-transparent hover:border-dark-border transition-all">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white font-mono group-hover:text-neon-green transition-colors">
                                        {item.user.split('@')[0]}
                                    </span>
                                    <span className="text-[10px] text-muted-text font-mono truncate max-w-[120px]">
                                        {item.action}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                    {item.time}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button className="mt-4 w-full py-2 text-xs font-mono text-muted-text border border-dashed border-dark-border rounded hover:text-white hover:border-white/20 transition-all">
                        View System Audit -
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
