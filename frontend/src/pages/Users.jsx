import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Search, MoreVertical, Trash2, Edit, Terminal, UserMinus, Shield } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/admin/users`);
                // FIX: Access res.data.data
                setUsers(res.data.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const deleteUser = async (id) => {
        if (!window.confirm('EXECUTE_DELETION: This user record will be permanently purged.')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/admin/user/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            alert('Failed to delete user');
        }
    };


    return (
        <div className="space-y-6 pb-12 font-mono">
            <div className="flex items-center justify-between border-b border-dark-border pb-4">
                <div className="flex items-center gap-2">
                    <UsersIcon className="w-5 h-5 text-neon-green" />
                    <h1 className="text-xl font-bold text-white tracking-tight">User Index</h1>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-text group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Query database..."
                        className="bg-dark-panel border border-dark-border rounded py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-neon-green w-64 transition-all"
                    />
                </div>
            </div>

            <div className="bg-dark-panel rounded border border-dark-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-dark-border">
                            <th className="px-6 py-3 text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Principal ID</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Scope</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono">Timestamp</th>
                            <th className="px-6 py-3 text-[10px] font-bold text-muted-text uppercase tracking-wider font-mono text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-12 text-center text-xs text-muted-text font-mono">QUERYING_RECORDS...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-12 text-center text-xs text-muted-text font-mono">NO_MATCHING_ENTRIES</td></tr>
                        ) : users.map((user, idx) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="hover:bg-white/5 transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-dark-bg border border-dark-border flex items-center justify-center text-neon-green font-bold text-xs">
                                            {user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white tracking-tight">{user.email}</p>
                                            <p className="text-[10px] text-muted-text font-mono">UUID: {user.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[10px] font-mono text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                        {user.site_name || 'UNDEFINED'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-muted-text font-mono">{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1.5 rounded border border-transparent hover:border-dark-border hover:bg-dark-bg text-muted-text hover:text-white transition-all">
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            className="p-1.5 rounded border border-transparent hover:border-coral-red/30 hover:bg-coral-red/10 text-muted-text hover:text-coral-red transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center text-[10px] text-muted-text font-mono border-t border-dark-border pt-4">
                <span>Total Records: {users.length}</span>
                <span>DB_SHARD_01</span>
            </div>
        </div>
    );
};

export default Users;
