import { useState } from 'react';
import './App.css';
import AuthTester from './components/AuthTester';
import OTPTester from './components/OTPTester';
import Config from './components/Config';
import TestResults from './components/TestResults';

function App() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:5000');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_API_KEY || 'saturn-dashboard-key-2024');
  const [testResults, setTestResults] = useState([]);

  const logResult = (functionName, success, response) => {
    setTestResults(prev => [...prev, {
      function: functionName,
      success,
      timestamp: new Date().toISOString(),
      response
    }]);
  };

  return (
    <div className="app">
      <header>
        <h1>⚡ Saturn Platform - Phase 1 Test Client</h1>
        <p className="subtitle">Function Registry Control Plane Testing Interface</p>
      </header>

      <Config
        apiUrl={apiUrl}
        setApiUrl={setApiUrl}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />

      <div className="grid">
        <AuthTester apiUrl={apiUrl} apiKey={apiKey} logResult={logResult} />
        <OTPTester apiUrl={apiUrl} apiKey={apiKey} logResult={logResult} />
      </div>

      <div className="section">
        <h2>🧪 Function Control Tests</h2>
        <p className="help-text">
          Test enabling/disabling functions via database. Use SQL queries to toggle functions.
        </p>
        <div className="code-block">
          <pre>{`-- Disable auth.login
INSERT INTO ProjectFunctions (project_id, function_id, is_enabled)
VALUES (2, (SELECT id FROM FunctionRegistry WHERE function_name = 'auth.login'), false);

-- Enable auth.login
UPDATE ProjectFunctions SET is_enabled = true 
WHERE project_id = 2 AND function_id = (SELECT id FROM FunctionRegistry WHERE function_name = 'auth.login');

-- Check function status
SELECT fr.function_name, pf.is_enabled 
FROM FunctionRegistry fr 
LEFT JOIN ProjectFunctions pf ON fr.id = pf.function_id AND pf.project_id = 2;`}</pre>
        </div>
      </div>

      <TestResults results={testResults} />
    </div>
  );
}

export default App;
