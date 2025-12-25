import { useState } from 'react';

function AuthTester({ apiUrl, apiKey, logResult }) {
    const [func, setFunc] = useState('auth.login');
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password123');
    const [response, setResponse] = useState(null);

    const testFunction = async () => {
        let endpoint = '';
        let body = {};

        switch (func) {
            case 'auth.login':
                endpoint = '/api/auth/login';
                body = { email, password };
                break;
            case 'auth.register':
                endpoint = '/api/auth/register';
                body = { email, password, site_name: 'Test Client' };
                break;
            case 'auth.logout':
                endpoint = '/api/auth/logout';
                body = {};
                break;
            case 'auth.forgot-password':
                endpoint = '/api/auth/forgot-password';
                body = { email };
                break;
            default:
                setResponse({ error: 'Function not implemented' });
                return;
        }

        try {
            const res = await fetch(apiUrl + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            setResponse({ success: res.ok, data });
            logResult(func, res.ok, data);
        } catch (error) {
            const errorData = { error: error.message };
            setResponse({ success: false, data: errorData });
            logResult(func, false, errorData);
        }
    };

    return (
        <div className="section">
            <h2>🔐 Auth Functions</h2>

            <div className="form-group">
                <label>Function</label>
                <select value={func} onChange={(e) => setFunc(e.target.value)}>
                    <option value="auth.login">auth.login</option>
                    <option value="auth.register">auth.register</option>
                    <option value="auth.logout">auth.logout</option>
                    <option value="auth.refresh">auth.refresh</option>
                    <option value="auth.forgot-password">auth.forgot-password</option>
                    <option value="auth.reset-password">auth.reset-password</option>
                </select>
            </div>

            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button onClick={testFunction}>→ Test Function</button>
            <button className="secondary" onClick={() => setResponse(null)}>Clear</button>

            {response && (
                <div className="response">
                    <pre className={response.success ? 'success' : 'error'}>
                        {JSON.stringify(response.data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

export default AuthTester;
