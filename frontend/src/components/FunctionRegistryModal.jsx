import { useState, useEffect } from 'react';
import { X, Search, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import axios from 'axios';

function FunctionRegistryModal({ project, isOpen, onClose }) {
    const [functions, setFunctions] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [toggling, setToggling] = useState(null);

    useEffect(() => {
        if (isOpen && project) {
            fetchFunctions();
        }
    }, [isOpen, project?.id]);

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const fetchFunctions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/projects/${project.id}/functions`);
            setFunctions(res.data.data || []);
        } catch (error) {
            console.error('Error fetching functions:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFunction = async (functionId, currentStatus) => {
        setToggling(functionId);
        try {
            await axios.patch(
                `http://localhost:5000/api/admin/projects/${project.id}/functions/${functionId}`,
                { is_enabled: !currentStatus }
            );
            await fetchFunctions();
        } catch (error) {
            console.error('Error toggling function:', error);
            alert(`Failed to toggle function: ${error.response?.data?.message || error.message}`);
        } finally {
            setToggling(null);
        }
    };

    if (!isOpen || !project) return null;

    // Filter functions by search
    const filteredFunctions = functions.filter(f =>
        f.function_name.toLowerCase().includes(search.toLowerCase()) ||
        f.domain.toLowerCase().includes(search.toLowerCase()) ||
        f.description?.toLowerCase().includes(search.toLowerCase())
    );

    // Group by domain
    const grouped = filteredFunctions.reduce((acc, func) => {
        if (!acc[func.domain]) acc[func.domain] = [];
        acc[func.domain].push(func);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-dark-panel border border-dark-border w-full max-w-2xl rounded-lg shadow-2xl relative z-10 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-border">
                    <div>
                        <h2 className="text-lg font-bold text-white font-mono">Manage Functions</h2>
                        <p className="text-xs text-muted-text mt-1">{project.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-text hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-dark-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                        <input
                            type="text"
                            placeholder="Search functions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-dark-bg border border-dark-border rounded pl-10 pr-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-neon-green transition-colors"
                        />
                    </div>
                </div>

                {/* Function List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-neon-green animate-spin" />
                        </div>
                    ) : filteredFunctions.length === 0 ? (
                        <div className="text-center text-muted-text py-12">
                            {search ? 'No functions match your search' : 'No functions found'}
                        </div>
                    ) : (
                        Object.entries(grouped).map(([domain, funcs]) => (
                            <div key={domain} className="space-y-2">
                                <div className="text-xs font-bold text-neon-green uppercase tracking-wider font-mono">
                                    {domain}
                                </div>
                                <div className="space-y-1">
                                    {funcs.map(func => (
                                        <div
                                            key={func.id}
                                            className="flex items-center justify-between p-3 bg-dark-bg border border-dark-border rounded hover:border-white/20 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-white font-mono">{func.function_name}</div>
                                                {func.description && (
                                                    <div className="text-xs text-muted-text mt-1 truncate">{func.description}</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => toggleFunction(func.id, func.is_enabled)}
                                                disabled={toggling === func.id}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase transition-all ml-4 ${func.is_enabled
                                                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20'
                                                    : 'bg-coral-red/10 text-coral-red border border-coral-red/30 hover:bg-coral-red/20'
                                                    } ${toggling === func.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {toggling === func.id ? (
                                                    <>
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        ...
                                                    </>
                                                ) : func.is_enabled ? (
                                                    <>
                                                        <ToggleRight className="w-4 h-4" />
                                                        Enabled
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="w-4 h-4" />
                                                        Disabled
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-dark-border flex justify-between items-center">
                    <div className="text-xs text-muted-text font-mono">
                        {filteredFunctions.length} function{filteredFunctions.length !== 1 ? 's' : ''}
                        {search && ` (filtered from ${functions.length})`}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-dark-bg border border-dark-border rounded text-xs font-bold uppercase text-white hover:border-white/40 transition-colors font-mono"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FunctionRegistryModal;
