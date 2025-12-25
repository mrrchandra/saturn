import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';

function ProjectFunctions({ project }) {
    const [functions, setFunctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (expanded) {
            fetchFunctions();
        }
    }, [expanded, project.id]);

    const fetchFunctions = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/projects/${project.id}/functions`);
            setFunctions(res.data.data);
        } catch (error) {
            console.error('Error fetching functions:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFunction = async (functionId, currentStatus) => {
        try {
            await axios.patch(
                `http://localhost:5000/api/admin/projects/${project.id}/functions/${functionId}`,
                { is_enabled: !currentStatus }
            );
            fetchFunctions(); // Refresh
        } catch (error) {
            console.error('Error toggling function:', error);
        }
    };

    // Group functions by domain
    const groupedFunctions = functions.reduce((acc, func) => {
        if (!acc[func.domain]) acc[func.domain] = [];
        acc[func.domain].push(func);
        return acc;
    }, {});

    return (
        <div className="mt-4 border-t border-dark-border pt-4">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-xs font-mono text-muted-text hover:text-white transition-colors"
            >
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="uppercase tracking-wider">Function Registry ({functions.length})</span>
            </button>

            {expanded && (
                <div className="mt-4 space-y-3">
                    {loading ? (
                        <div className="text-xs text-muted-text">Loading functions...</div>
                    ) : (
                        Object.entries(groupedFunctions).map(([domain, funcs]) => (
                            <div key={domain} className="bg-dark-bg border border-dark-border rounded p-3">
                                <div className="text-[10px] font-bold text-neon-green uppercase tracking-wider mb-2">
                                    {domain}
                                </div>
                                <div className="space-y-2">
                                    {funcs.map(func => (
                                        <div key={func.id} className="flex items-center justify-between text-xs">
                                            <div className="flex-1">
                                                <div className="text-white font-mono">{func.function_name}</div>
                                                {func.description && (
                                                    <div className="text-[10px] text-muted-text mt-0.5">{func.description}</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => toggleFunction(func.id, func.is_enabled)}
                                                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${func.is_enabled
                                                        ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                                                        : 'bg-coral-red/10 text-coral-red border border-coral-red/30'
                                                    }`}
                                            >
                                                {func.is_enabled ? (
                                                    <>
                                                        <ToggleRight className="w-3 h-3" />
                                                        Enabled
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="w-3 h-3" />
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
            )}
        </div>
    );
}

export default ProjectFunctions;
