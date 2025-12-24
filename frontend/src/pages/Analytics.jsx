import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart3, Activity, ShieldCheck, UserPlus, Filter, Search, Terminal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Analytics = () => {
    const [authAttempts, setAuthAttempts] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('All');
    const [loading, setLoading] = useState(true);
    const [processedChartData, setProcessedChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [authRes, regRes, projRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/analytics/auth-attempts'),
                    axios.get('http://localhost:5000/api/analytics/users-registered'),
                    axios.get('http://localhost:5000/api/integrations')
                ]);
                setAuthAttempts(authRes.data.data);
                setRegistrations(regRes.data.data);
                setProjects(projRes.data.data);

                processData(authRes.data.data, regRes.data.data, 'All');
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const processData = (auth, reg, projectFilter) => {
        const dataMap = {};

        const filteredAuth = projectFilter === 'All' ? auth : auth.filter(l => l.site_name === projectFilter);
        const filteredReg = projectFilter === 'All' ? reg : reg.filter(l => l.site_name === projectFilter);

        filteredAuth.forEach(log => {
            const date = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dataMap[date]) dataMap[date] = { name: date, attempts: 0, regs: 0 };
            dataMap[date].attempts += 1;
        });

        filteredReg.forEach(log => {
            const date = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dataMap[date]) dataMap[date] = { name: date, attempts: 0, regs: 0 };
            dataMap[date].regs += 1;
        });

        setProcessedChartData(Object.values(dataMap).slice(-7));
    };

    const handleProjectChange = (val) => {
        setSelectedProject(val);
        processData(authAttempts, registrations, val);
    };

    const filteredLogs = selectedProject === 'All'
        ? authAttempts
        : authAttempts.filter(l => l.site_name === selectedProject);

    return (
        <div className="space-y-6 pb-12 font-mono">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-dark-border pb-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neon-green" />
                    <h1 className="text-xl font-bold text-white tracking-tight">System Telemetry</h1>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-text uppercase">Scope:</span>
                    <div className="relative group">
                        <select
                            value={selectedProject}
                            onChange={(e) => handleProjectChange(e.target.value)}
                            className="appearance-none bg-dark-panel border border-dark-border text-white text-xs font-bold uppercase tracking-wider pl-3 pr-8 py-1.5 rounded focus:outline-none focus:border-neon-green cursor-pointer"
                        >
                            <option value="All">GLOBAL_OVERVIEW</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.name}>{p.name.toUpperCase().replace(/\s+/g, '_')}</option>
                            ))}
                        </select>
                        <Filter className="w-3 h-3 text-neon-green absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Auth Attempts Chart */}
                <div className="bg-dark-panel p-5 rounded border border-dark-border">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-neon-green" />
                            Auth Request Volume
                        </h2>
                    </div>
                    <div className="h-[250px] w-full border border-dark-border bg-dark-bg/50 rounded relative">
                        {/* Grid Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-text">LOADING...</div>
                        ) : processedChartData.length === 0 ? (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-text">NO DATA</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={processedChartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.4} />
                                    <XAxis dataKey="name" stroke="#555" fontSize={10} fontFamily="JetBrains Mono" axisLine={false} tickLine={false} dy={10} />
                                    <YAxis stroke="#555" fontSize={10} fontFamily="JetBrains Mono" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#FFFFFF', opacity: 0.05 }}
                                        contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '4px', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                                        itemStyle={{ color: '#22C55E' }}
                                    />
                                    <Bar dataKey="attempts" radius={[2, 2, 0, 0]} barSize={30}>
                                        {processedChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#22C55E' : '#15803d'} fillOpacity={0.8} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Registrations Chart */}
                <div className="bg-dark-panel p-5 rounded border border-dark-border">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-neon-green" />
                            Node Onboarding
                        </h2>
                    </div>
                    <div className="h-[250px] w-full border border-dark-border bg-dark-bg/50 rounded relative">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-text">LOADING...</div>
                        ) : processedChartData.length === 0 ? (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-text">NO DATA</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={processedChartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.4} />
                                    <XAxis dataKey="name" stroke="#555" fontSize={10} fontFamily="JetBrains Mono" axisLine={false} tickLine={false} dy={10} />
                                    <YAxis stroke="#555" fontSize={10} fontFamily="JetBrains Mono" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#FFFFFF', opacity: 0.05 }}
                                        contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '4px', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                                        itemStyle={{ color: '#22C55E' }}
                                    />
                                    <Bar dataKey="regs" fill="#22C55E" radius={[2, 2, 0, 0]} barSize={30} fillOpacity={0.6} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* List of raw events */}
            <div className="bg-dark-panel p-5 rounded border border-dark-border flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-2">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-neon-green" />
                        Raw Event Stream
                    </h2>
                    <span className="text-[10px] font-mono text-neon-green bg-neon-green/10 px-2 py-0.5 rounded border border-neon-green/20">LIVE</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-2">
                    {loading ? (
                        <div className="text-center py-10 text-xs text-muted-text">INITIALIZING STREAM...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-text gap-2">
                            <Search className="w-6 h-6 opacity-20" />
                            <span className="text-[10px]">NO_MATCHING_RECORDS</span>
                        </div>
                    ) : filteredLogs.slice(0, 50).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-2 rounded bg-dark-bg/50 border border-transparent hover:border-dark-border hover:bg-white/5 transition-all group">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-neon-green w-[80px]">{log.site_name || 'SYSTEM'}</span>
                                <span className="text-xs text-white">AUTH_SUCCESS</span>
                            </div>
                            <span className="text-[10px] text-muted-text">{new Date(log.timestamp).toISOString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
