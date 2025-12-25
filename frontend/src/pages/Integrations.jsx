import { useEffect, useState } from 'react';
import axios from 'axios';
import { Zap, Link as LinkIcon, Plus, Code2, Copy, Check, ShieldAlert, X, Trash2, Terminal, Server, Settings, Globe, AlertCircle } from 'lucide-react';
import FunctionRegistryModal from '../components/FunctionRegistryModal';
import OriginManagementModal from '../components/OriginManagementModal';

const Integrations = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showFunctionModal, setShowFunctionModal] = useState(false);
    const [showOriginModal, setShowOriginModal] = useState(false);

    const fetchProjects = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/integrations');
            // FIX: Access res.data.data
            setProjects(res.data.data || []);
        } catch (error) {
            console.error("Error fetching projects:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setProjects([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleAddProject = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/integrations', { name: newProjectName });
            setNewProjectName('');
            setShowModal(false);
            fetchProjects();
        } catch (error) {
            alert(error.response?.data?.error || "Error adding project");
        }
    };

    const toggleMaintenance = async (id, currentStatus) => {
        try {
            await axios.patch(`http://localhost:5000/api/integrations/${id}/maintenance`, { is_maintenance: !currentStatus });
            fetchProjects();
        } catch (error) {
            console.error("Error toggling maintenance:", error);
        }
    };

    const deleteProject = async (id) => {
        if (!window.confirm("CONFIRM_DELETION: This action is irreversible.")) return;
        try {
            await axios.delete(`http://localhost:5000/api/integrations/${id}`);
            fetchProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const copyKey = (key, id) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex flex-col min-h-[60vh] space-y-6 pb-12 font-mono">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
                <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-neon-green" />
                    <h1 className="text-xl font-bold text-white tracking-tight">Active Nodes</h1>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-green text-dark-bg text-xs font-bold uppercase tracking-wider rounded hover:bg-white hover:text-dark-bg transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Initialize Node
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Active Projects List */}
                    {loading ? (
                        [1, 2].map(i => <div key={i} className="h-24 bg-dark-panel border border-dark-border rounded animate-pulse" />)
                    ) : projects.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4 border border-dashed border-dark-border rounded bg-dark-panel">
                            <LinkIcon className="w-8 h-8 text-muted-text opacity-50" />
                            <p className="text-muted-text font-bold uppercase tracking-widest text-xs">NO_NODES_DETECTED</p>
                        </div>
                    ) : projects.map(proj => (
                        <div key={proj.id} className="bg-dark-panel p-6 rounded border border-dark-border hover:border-white/20 transition-all group relative overflow-hidden">
                            {proj.is_maintenance && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-coral-red text-[10px] font-bold uppercase tracking-wider rounded-bl text-white flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" />
                                    MAINTENANCE_MODE
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded bg-dark-bg border border-dark-border flex items-center justify-center text-neon-green shrink-0">
                                        <Zap className="w-6 h-6 fill-current" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-white tracking-tight">{proj.name}</h3>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${proj.is_maintenance
                                                ? 'bg-coral-red/10 border-coral-red/30 text-coral-red'
                                                : 'bg-neon-green/10 border-neon-green/30 text-neon-green'
                                                } font-mono font-bold uppercase`}>
                                                {proj.is_maintenance ? 'Offline' : 'Online'}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-muted-text font-mono uppercase">API Key:</span>
                                                <code className="text-[10px] text-white font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                                    {proj.api_key.substring(0, 12)}...
                                                </code>
                                                <button
                                                    onClick={() => copyKey(proj.api_key, proj.id)}
                                                    className="text-muted-text hover:text-white transition-colors"
                                                >
                                                    {copiedId === proj.id ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleMaintenance(proj.id, proj.is_maintenance)}
                                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${proj.is_maintenance
                                            ? 'bg-coral-red text-white border-coral-red hover:bg-transparent hover:text-coral-red'
                                            : 'bg-transparent border-dark-border text-muted-text hover:border-coral-red hover:text-coral-red'
                                            }`}
                                        title={proj.is_maintenance ? "Disable Maintenance" : "Enable Maintenance"}
                                    >
                                        <AlertCircle className="w-3 h-3" />
                                        {proj.is_maintenance ? "Go Online" : "Go Offline"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedProject(proj);
                                            setShowFunctionModal(true);
                                        }}
                                        className="px-3 py-1.5 bg-transparent border border-dark-border rounded text-[10px] font-bold uppercase text-muted-text hover:border-neon-green hover:text-neon-green transition-all flex items-center gap-1"
                                    >
                                        <Settings className="w-3 h-3" />
                                        Functions
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedProject(proj);
                                            setShowOriginModal(true);
                                        }}
                                        className="px-3 py-1.5 bg-transparent border border-dark-border rounded text-[10px] font-bold uppercase text-muted-text hover:border-neon-green hover:text-neon-green transition-all flex items-center gap-1"
                                    >
                                        <Globe className="w-3 h-3" />
                                        CORS
                                    </button>
                                    <button
                                        onClick={() => deleteProject(proj.id)}
                                        className="p-1.5 bg-transparent rounded border border-transparent text-muted-text hover:text-coral-red hover:border-coral-red/30 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    {/* Plug-in Guide */}
                    <div className="bg-dark-panel p-6 rounded border border-dark-border overflow-hidden relative">
                        <div className="flex items-center gap-2 mb-4">
                            <Terminal className="w-4 h-4 text-neon-green" />
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Interface Guide</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-dark-bg border border-dark-border rounded p-3">
                                <p className="text-[10px] font-bold text-muted-text uppercase mb-1">Base Endpoint</p>
                                <code className="text-neon-green font-mono text-xs block">http://localhost:5000/api/v1</code>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="p-3 bg-dark-bg border border-dark-border rounded">
                                    <p className="text-[10px] font-bold text-muted-text uppercase mb-1">Authentication</p>
                                    <code className="text-[10px] text-white font-mono break-all">X-Saturn-Key: [API_KEY]</code>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ecosystem Stats */}
                    <div className="bg-dark-panel p-6 rounded border border-dark-border">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-dark-border pb-2">Cluster Status</h3>
                        <div className="space-y-2">
                            {[
                                { name: 'CPU Load', status: 'OPTIMAL', val: '12%' },
                                { name: 'Disk I/O', status: 'OPTIMAL', val: '45MB/s' },
                                { name: 'Memory', status: 'STABLE', val: '1.2GB' },
                            ].map((sys, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs font-mono">
                                    <span className="text-muted-text">{sys.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white">{sys.val}</span>
                                        <span className={`text-[10px] px-1 rounded ${sys.status === 'OPTIMAL' ? 'text-neon-green bg-neon-green/10' : 'text-blue-400 bg-blue-400/10'}`}>{sys.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="bg-dark-panel border border-dark-border w-full max-w-sm rounded p-6 relative z-10 shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-neon-green" />
                                    New Node
                                </h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-muted-text hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleAddProject} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-mono font-bold text-muted-text uppercase tracking-wider mb-2 block">Project Identifier</label>
                                <input
                                    type="text"
                                    autoFocus
                                    required
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="my-app-01"
                                    className="w-full bg-dark-bg border border-dark-border rounded px-4 py-2 text-white font-mono focus:outline-none focus:border-neon-green transition-all"
                                />
                            </div>
                            <button className="w-full py-2 bg-white text-dark-bg text-xs font-bold font-mono uppercase tracking-wider rounded border border-white hover:bg-neon-green hover:border-neon-green transition-all">
                                Deploy Instance
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Function Registry Modal */}
            <FunctionRegistryModal
                project={selectedProject}
                isOpen={showFunctionModal}
                onClose={() => setShowFunctionModal(false)}
            />
            {/* Origin Management Modal */}
            <OriginManagementModal
                project={selectedProject}
                isOpen={showOriginModal}
                onClose={() => {
                    setShowOriginModal(false);
                    fetchProjects(); // Refresh to get updated origins in proj structure
                }}
            />
        </div>
    );
};

export default Integrations;
