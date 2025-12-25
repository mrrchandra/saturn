function TestResults({ results }) {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    const failed = total - successful;

    return (
        <div className="section">
            <h2>📊 Test Results</h2>
            {results.length === 0 ? (
                <p className="info">No tests run yet. Use the forms above to test functions.</p>
            ) : (
                <>
                    <div className="info">Total Tests: {total}</div>
                    <div className="success">Successful: {successful}</div>
                    <div className="error">Failed: {failed}</div>
                    <hr style={{ borderColor: '#333', margin: '10px 0' }} />
                    {results.slice(-10).reverse().map((result, index) => (
                        <div key={index} className={result.success ? 'success' : 'error'}>
                            [{new Date(result.timestamp).toLocaleTimeString()}] {result.function}: {result.success ? 'SUCCESS' : 'FAILED'}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default TestResults;
