import { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Camera, Save, User as UserIcon, Terminal } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);


    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', user.id);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/pfp`, formData);
            if (res.data.success) {
                setMessage('AVATAR_UPDATE_SUCCESS');
                updateUser({ ...user, avatar_url: res.data.data.avatar_url });
            }
        } catch (err) {
            console.error(err);
            setMessage('UPLOAD_FAILED: ' + err.message);
        } finally {
            setUploading(false);
            setFile(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-dark-border">
                <Terminal className="w-5 h-5 text-neon-green" />
                <h1 className="text-xl font-bold text-white tracking-tight">User Configuration</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ID Card Section */}
                <div className="bg-dark-panel border border-dark-border p-6 rounded flex flex-col items-center text-center group">
                    <div className="relative cursor-pointer" onClick={() => fileInputRef.current.click()}>
                        <div className="w-32 h-32 rounded bg-dark-bg border border-dark-border overflow-hidden ring-1 ring-white/10 group-hover:ring-neon-green transition-all">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-text font-mono text-[10px] gap-2">
                                    <UserIcon className="w-8 h-8 opacity-50" />
                                    <span>NO_IMAGE</span>
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />

                    <div className="mt-4 w-full">
                        <div className="text-lg font-bold text-white font-mono">{user.username || user.email.split('@')[0]}</div>
                        <div className="inline-flex items-center px-2 py-0.5 mt-2 text-[10px] font-mono text-neon-green bg-neon-green/10 border border-neon-green/20 rounded">
                            ROLE::{user.role.toUpperCase()}
                        </div>
                    </div>

                    {file && (
                        <div className="mt-6 w-full animate-fade-in border-t border-dark-border pt-4">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full py-2 bg-white text-dark-bg text-xs font-mono font-bold uppercase tracking-wider rounded border border-white hover:bg-neon-green hover:border-neon-green transition-all disabled:opacity-50"
                            >
                                {uploading ? 'UPLOADING...' : 'COMMIT_CHANGES'}
                            </button>
                        </div>
                    )}

                    {message && <p className="mt-4 text-neon-green font-mono text-[10px]">{message}</p>}
                </div>

                {/* Details Section */}
                <div className="md:col-span-2 space-y-4">
                    <div className="bg-dark-panel border border-dark-border rounded p-6">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-dark-border pb-2">Identity Params</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-muted-text uppercase">Primary Email</label>
                                <div className="p-2.5 bg-dark-bg border border-dark-border rounded text-sm text-white font-mono">{user.email}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-muted-text uppercase">UUID</label>
                                <div className="p-2.5 bg-dark-bg border border-dark-border rounded text-xs text-muted-text font-mono truncate">{user.id}</div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-muted-text uppercase">Access Level</label>
                                <div className="p-2.5 bg-dark-bg border border-dark-border rounded text-sm text-white font-mono">ROOT_ADMIN</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-dark-panel border border-dark-border rounded p-6 opacity-60 pointer-events-none">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-dark-border pb-2 flex justify-between">
                            <span>Security Keys</span>
                            <span className="text-[10px] text-neon-green">ENCRYPTED</span>
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-text">
                            <div className="h-2 w-2 bg-neon-green rounded-full"></div>
                            2FA Status: DISABLED
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
