import { useState } from 'react';

function OTPTester({ apiUrl, apiKey, logResult }) {
    const [func, setFunc] = useState('otp.send');
    const [email, setEmail] = useState('test@example.com');
    const [otp, setOtp] = useState('123456');
    const [response, setResponse] = useState(null);

    const testFunction = async () => {
        let endpoint = '';
        let body = {};

        switch (func) {
            case 'otp.send':
                endpoint = '/api/otp/send';
                body = { email };
                break;
            case 'otp.verify':
                endpoint = '/api/otp/verify';
                body = { email, otp };
                break;
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
            <h2>📧 OTP Functions</h2>

            <div className="form-group">
                <label>Function</label>
                <select value={func} onChange={(e) => setFunc(e.target.value)}>
                    <option value="otp.send">otp.send</option>
                    <option value="otp.verify">otp.verify</option>
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
                <label>OTP Code (for verify)</label>
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
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

export default OTPTester;
