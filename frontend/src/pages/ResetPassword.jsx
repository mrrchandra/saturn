import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Terminal, Key, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState(''); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });

            if (res.data.success) {
                setStatus('success');
                setMessage('Password reset successful');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 font-mono">
                    <div className="flex items-center gap-2 text-neon-green mb-2">
                        <Terminal className="w-5 h-5" />
                        <span className="font-bold">saturn@platform:~$ passwd --confirm</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
                    <p className="text-muted-text text-xs mt-1">Enter OTP and new password</p>
                </div>

                {status === 'success' ? (
                    <div className="bg-neon-green/10 border border-neon-green p-6 rounded font-mono text-center">
                        <CheckCircle className="w-12 h-12 text-neon-green mx-auto mb-4" />
                        <p className="text-sm text-white mb-2">[SUCCESS] {message}</p>
                        <p className="text-xs text-muted-text">Redirecting to login...</p>
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
                                <label className="text-[10px] font-mono text-muted-text uppercase tracking-wider block">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-dark-panel border border-dark-border rounded px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-neon-green transition-all"
                                    placeholder="user@saturn.io"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-muted-text uppercase tracking-wider block flex items-center gap-2">
                                    <Key className="w-3 h-3" />
                                    OTP Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="w-full bg-dark-panel border border-dark-border rounded px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-neon-green transition-all tracking-widest text-center"
                                    placeholder="000000"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-muted-text uppercase tracking-wider block flex items-center gap-2">
                                    <Lock className="w-3 h-3" />
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={6}
                                    className="w-full bg-dark-panel border border-dark-border rounded px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-neon-green transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-muted-text uppercase tracking-wider block flex items-center gap-2">
                                    <Lock className="w-3 h-3" />
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={6}
                                    className="w-full bg-dark-panel border border-dark-border rounded px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-neon-green transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-2.5 bg-white text-dark-bg text-xs font-mono font-bold uppercase tracking-wider rounded border border-white hover:bg-neon-green hover:border-neon-green transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? '⟳ Resetting...' : '→ Reset Password'}
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-dark-border pt-4">
                            <p className="text-[10px] font-mono text-muted-text">
                                <Link to="/forgot-password" className="text-neon-green hover:underline">Resend OTP</Link> | <Link to="/login" className="text-neon-green hover:underline">Back to Login</Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
