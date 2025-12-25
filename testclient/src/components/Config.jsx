import { useState, useEffect } from 'react';

function Config({ apiUrl, setApiUrl, apiKey, setApiKey }) {
    const [projectStatus, setProjectStatus] = useState('Checking...');
    const [statusClass, setStatusClass] = useState('info');

    useEffect(() => {
        checkProjectStatus();
    }, [apiUrl, apiKey]);

    const checkProjectStatus = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({ email: 'test@test.com', password: 'test' })
            });

            if (response.status === 401) {
                const data = await response.json();
                if (data.message.includes('Invalid API key')) {
                    setProjectStatus('Invalid API Key');
                    setStatusClass('error');
                } else {
                    setProjectStatus('Connected to Saturn Platform');
                    setStatusClass('success');
                }
            } else {
                setProjectStatus('Connected to Saturn Platform');
                setStatusClass('success');
            }
        } catch (error) {
            setProjectStatus('Cannot connect to API');
            setStatusClass('error');
        }
    };

    return (
        <div className="section">
            <h2>🔧 Configuration</h2>
            <div className="form-group">
                <label>API Base URL</label>
                <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>API Key (x-api-key header)</label>
                <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Project Status</label>
                <div className={statusClass}>
                    <span className={`status-indicator status-${statusClass === 'success' ? 'online' : 'offline'}`}></span>
                    {projectStatus}
                </div>
            </div>
        </div>
    );
}

export default Config;
