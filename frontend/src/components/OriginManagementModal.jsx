import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Globe, Loader2, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

function OriginManagementModal({ project, isOpen, onClose }) {
    const [origins, setOrigins] = useState([]);
    const [newOrigin, setNewOrigin] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && project) {
            setOrigins(project.config?.allowed_origins || []);
        }
    }, [isOpen, project]);

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

    const handleAddOrigin = (e) => {
        e.preventDefault();
        if (!newOrigin) return;

        // Basic URL validation or normalization
        let formatted = newOrigin.trim().toLowerCase();
        if (formatted && !formatted.startsWith('http')) {
            formatted = `https://${formatted}`;
        }

        if (!origins.includes(formatted)) {
            setOrigins([...origins, formatted]);
        }
        setNewOrigin('');
    };

    const removeOrigin = (target) => {
        setOrigins(origins.filter(o => o !== target));
    };

    const saveOrigins = async () => {
        setSaving(true);
        try {
            await axios.put(`http://localhost:5000/api/admin/projects/${project.id}/origins`, {
                origins
            });
            // Update local state if needed or show success
            onClose();
        } catch (error) {
            console.error('Error saving origins:', error);
            alert(`Failed to save origins: ${error.response?.data?.message || error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !project) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-dark-panel border border-dark-border w-full max-w-lg rounded-lg shadow-2xl relative z-10 max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-neon-green/10 border border-neon-green/20 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-neon-green" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white font-mono">CORS Management</h2>
                            <p className="text-xs text-muted-text mt-1">Whitelisted origins for {project.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-text hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Add Origin Form */}
                <div className="p-6 border-b border-dark-border bg-dark-bg/50">
                    <form onSubmit={handleAddOrigin} className="flex gap-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                            <input
                                type="text"
                                placeholder="https://app.example.com"
                                value={newOrigin}
                                onChange={(e) => setNewOrigin(e.target.value)}
                                className="w-full bg-dark-bg border border-dark-border rounded pl-10 pr-4 py-2 text-white text-sm font-mono focus:outline-none focus:border-neon-green transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-neon-green text-dark-bg text-xs font-bold uppercase rounded hover:bg-opacity-90 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </form>
                    <p className="text-[10px] text-muted-text mt-2 italic">* Origins must include protocol (e.g. http:// or https://)</p>
                </div>

                {/* Origins List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {origins.length === 0 ? (
                        <div className="text-center py-8">
                            <Globe className="w-8 h-8 text-dark-border mx-auto mb-2" />
                            <p className="text-sm text-muted-text">No whitelisted origins yet.</p>
                        </div>
                    ) : (
                        origins.map((origin) => (
                            <div
                                key={origin}
                                className="flex items-center justify-between p-3 bg-dark-bg border border-dark-border rounded group hover:border-neon-green/30 transition-all"
                            >
                                <span className="text-sm text-white font-mono">{origin}</span>
                                <button
                                    onClick={() => removeOrigin(origin)}
                                    className="p-1.5 text-muted-text hover:text-coral-red opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-dark-border flex justify-between items-center bg-dark-bg/50">
                    <div className="text-xs text-muted-text font-mono">
                        {origins.length} whitelist entries
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-transparent border border-dark-border rounded text-xs font-bold uppercase text-white hover:border-white/40 transition-colors font-mono"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveOrigins}
                            disabled={saving}
                            className="px-6 py-2 bg-neon-green text-dark-bg text-xs font-bold uppercase rounded hover:shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Implementation'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OriginManagementModal;
