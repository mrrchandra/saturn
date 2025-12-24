import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Terminal, Mail, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(''); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            if (res.data.success) {
                setStatus('success');
                setMessage('Password reset OTP sent to your email');
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Failed to send reset email');
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 font-mono">
                    <div className="flex items-center gap-2 text-neon-green mb-2">
                        <Terminal className="w-5 h-5" />
                        <span className="font-bold">saturn@platform:~$ passwd --reset</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Password Recovery</h1>
                    <p className="text-muted-text text-xs mt-1">Request password reset token</p>
                </div>

                {status === 'success' ? (
                    <div className="bg-neon-green/10 border border-neon-green p-6 rounded font-mono">
                        <div className="flex items-center gap-2 text-neon-green mb-4">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-bold">[SUCCESS]</span>
                        </div>
                        <p className="text-sm text-white mb-4">{message}</p>
                        <Link
                            to="/reset-password"
                            state={{ email }}
                            className="inline-block px-4 py-2 bg-neon-green text-dark-bg text-xs font-bold uppercase tracking-wider rounded hover:bg-white transition-all"
                        >
                            Enter OTP →
                        </Link>
                    </div>
                ) : (
                    <>
                        {status === 'error' && (
                            <div className="bg-coral-red/10 border border-coral-red text-coral-red text-xs font-mono p-3 rounded mb-6 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                <span>[ERROR] {message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-muted-text uppercase tracking-wider block flex items-center gap-2">
                                    <Mail className="w-3 h-3" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-dark-panel border border-dark-border rounded px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-neon-green transition-all"
                                    placeholder="user@saturn.io"
                                    disabled={status === 'loading'}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-2.5 bg-white text-dark-bg text-xs font-mono font-bold uppercase tracking-wider rounded border border-white hover:bg-neon-green hover:border-neon-green transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? '⟳ Sending...' : '→ Send Reset Code'}
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-dark-border pt-4">
                            <p className="text-[10px] font-mono text-muted-text">
                                Remember password? <Link to="/login" className="text-neon-green hover:underline">Return to Login</Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
