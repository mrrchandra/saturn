import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Shield, Globe, Database, ToggleLeft, ToggleRight, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        site_name: 'Saturn Platform',
        allow_registration: true,
        maintenance_mode: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/site-settings');
                if (res.data.success && res.data.data.settings) {
                    setSettings(res.data.data.settings);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.patch('http://localhost:5000/api/admin/site-settings', settings);
            setMessage('CONFIGURATION_UPDATED');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage('SAVE_FAILED');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-xs font-mono text-muted-text p-8">UPLOADING_CONFIG...</div>;

    return (
        <div className="space-y-6 pb-12 font-mono">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
                <div className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-neon-green" />
                    <h1 className="text-xl font-bold text-white tracking-tight">System Parameters</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-green text-dark-bg text-xs font-bold uppercase tracking-wider rounded hover:bg-white hover:text-dark-bg transition-all disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'WRITING...' : 'COMMIT_CHANGES'}
                </button>
            </div>

            {message && (
                <div className={`p-3 rounded text-[10px] font-bold uppercase tracking-widest text-center border ${message.includes('UPDATED') ? 'bg-neon-green/10 text-neon-green border-neon-green/30' : 'bg-coral-red/10 text-coral-red border-coral-red/30'}`}>
                    [{message}]
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-dark-panel p-6 rounded border border-dark-border">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-dark-border pb-2">
                        <Globe className="w-4 h-4 text-neon-green" />
                        Global Scope
                    </h2>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold text-muted-text uppercase tracking-wider mb-2 block">Platform Identity</label>
                            <input
                                type="text"
                                value={settings.site_name}
                                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                className="w-full bg-dark-bg border border-dark-border rounded px-4 py-2 text-white text-xs font-mono focus:outline-none focus:border-neon-green transition-all"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-dark-bg border border-dark-border rounded">
                            <div>
                                <h3 className="text-xs font-bold text-white uppercase">New Node Registration</h3>
                                <p className="text-[10px] text-muted-text font-mono mt-1">ENABLE_PUBLIC_SIGNUP</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, allow_registration: !settings.allow_registration })}
                                className="text-neon-green hover:text-white transition-colors"
                            >
                                {settings.allow_registration ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-muted-text" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Maintenance & Security */}
                <div className="bg-dark-panel p-6 rounded border border-dark-border">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-dark-border pb-2">
                        <Shield className="w-4 h-4 text-neon-green" />
                        System Security
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-dark-bg border border-dark-border rounded">
                            <div>
                                <h3 className="text-xs font-bold text-white uppercase">Maintenance Protocol</h3>
                                <p className="text-[10px] text-muted-text font-mono mt-1">RESTRICT_ACCESS_LEVEL_0</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                                className={`transition-colors ${settings.maintenance_mode ? 'text-coral-red' : 'text-muted-text hover:text-white'}`}
                            >
                                {settings.maintenance_mode ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                            </button>
                        </div>
                        <div className="p-4 bg-dark-bg border border-dark-border rounded">
                            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2 mb-3">
                                <Database className="w-3 h-3 text-neon-green" />
                                Database Connection
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-neon-green">
                                <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                                POSTGRES_POOL_ACTIVE
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
