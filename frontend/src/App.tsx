import React, { useState } from "react";

export default function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/detect', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert('Failed to contact backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        <div className="card mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">🔍 Phishing Detection System</h1>
          <p className="text-sm text-gray-500 mt-1">Enter a URL to analyze. Uses heuristics + WHOIS/DNS enrichment + external APIs.</p>

          <div className="flex mt-4 gap-3">
            <input
              className="flex-1 p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="https://example.com/login"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              onClick={check}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        </div>

        {result && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{result.finalVerdict}</h2>
                <p className="text-sm text-gray-500">{result.url}</p>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">Score: {result.score}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="p-3 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">External API Checks</h3>
                <div className="text-sm text-gray-600">
                  <div><strong>Google Safe Browsing:</strong> {result.apiVerdict?.googleSafeBrowsing === true ? "⚠️ Malicious" : (result.apiVerdict?.googleSafeBrowsing === false ? "✅ Clean" : "N/A")}</div>
                  <div><strong>URLhaus:</strong> {result.apiVerdict?.urlhaus === true ? "⚠️ Malicious" : (result.apiVerdict?.urlhaus === false ? "✅ Clean" : "N/A")}</div>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Rule Checks</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {Object.keys(result.rules || {}).map((k) => (
                    <li key={k}>
                      <span className={result.rules[k] ? 'text-red-600' : 'text-green-600'}>
                        {result.rules[k] ? '✖' : '✔'}
                      </span>{' '}
                      <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">WHOIS</h3>
                <div className="text-sm text-gray-600">
                  <div><strong>Registrar:</strong> {result.whois?.registrar}</div>
                  <div><strong>Creation Date:</strong> {result.whois?.creationDate}</div>
                  <div><strong>Is New Domain:</strong> {result.whois?.isNewDomain ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">DNS</h3>
                <div className="text-sm text-gray-600">
                  <div><strong>Has Records:</strong> {result.dns?.hasRecords ? 'Yes' : 'No'}</div>
                  <div><strong>Records:</strong> {result.dns?.records ? result.dns.records.join(', ') : '—'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-6 text-center text-sm text-gray-500">
          Developed by Bargavi B
        </footer>
      </div>
    </div>
  );
}
