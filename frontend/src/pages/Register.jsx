import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, Command } from 'lucide-react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register, login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(null, email, password);
        if (res.success) {
            await login(email, password);
            navigate('/');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 font-mono">
                    <div className="flex items-center gap-2 text-neon-green mb-2">
                        <Terminal className="w-5 h-5" />
                        <span className="font-bold">SaturnOS Initializer v2.4</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Create Admin Node</h1>
                    <p className="text-muted-text text-xs mt-1">Initialize new master control unit.</p>
                </div>

                {error && (
                    <div className="bg-coral-red/10 border border-coral-red text-coral-red text-xs font-mono p-3 rounded mb-6 flex items-center gap-2">
                        <span>[ERROR]</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-muted-text uppercase tracking-wider block">Admin Idenitifier</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-dark-panel border border-dark-border rounded px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-neon-green transition-all"
                            placeholder="admin@saturn.io"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-muted-text uppercase tracking-wider block">Secure Passkey</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-panel border border-dark-border rounded px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-neon-green transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button className="w-full py-2.5 bg-white text-dark-bg text-xs font-mono font-bold uppercase tracking-wider rounded border border-white hover:bg-neon-green hover:border-neon-green transition-all mt-6 flex items-center justify-center gap-2 group">
                        <Command className="w-3 h-3" />
                        Execute Setup
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-dark-border pt-4">
                    <p className="text-[10px] font-mono text-muted-text">
                        Node already initialized? <Link to="/login" className="text-neon-green hover:underline">Access Terminal</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
