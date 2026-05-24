// src/App.jsx
import React, { useState, useEffect } from 'react';
import './index.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch metrics from the backend API
  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming the backend runs on port 3001
      const response = await fetch('http://localhost:3001/api/metrics');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setMetrics(data);
    } catch (e) {
      console.error("Error fetching metrics:", e);
      setError("Could not connect to the backend API. Is the server running on port 3001?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  // Placeholder function to simulate sending a new metric
  const recordNewMetric = async (metricName, value) => {
    try {
      await fetch('http://localhost:3001/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metricName, value }),
      });
      alert(`Successfully recorded ${metricName} = ${value}. Refreshing dashboard...`);
      fetchMetrics(); // Refresh data after successful write
    } catch (e) {
      alert("Failed to record metric. Check the console for details.");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>👑 Lord's Command Dashboard</h1>
      <p>A centralized view of critical operational metrics.</p>

      {/* Metric Input Area (for testing) */}
      <div className="card">
        <h3>📈 Record New Metric (Test)</h3>
        <input 
          type="text" 
          placeholder="Metric Name (e.g., CPU_Load)" 
          onChange={(e) => document.getElementById('metric-name').value = e.target.value} 
          id="metric-name"
          style={{ padding: '8px', marginRight: '10px', background: '#3a3a3e', border: '1px solid #444', color: '#e0e0e0' }}
        />
        <input 
          type="number" 
          placeholder="Value (e.g., 0.75)" 
          onChange={(e) => document.getElementById('metric-value').value = e.target.value} 
          id="metric-value"
          style={{ padding: '8px', marginRight: '10px', background: '#3a3a3e', border: '1px solid #444', color: '#e0e0e0' }}
        />
        <button 
          onClick={() => recordNewMetric(document.getElementById('metric-name').value, parseFloat(document.getElementById('metric-value').value))}
          style={{ padding: '8px 15px', background: '#61dafb', border: 'none', cursor: 'pointer' }}
        >
          Record Metric
        </button>
      </div>

      {/* Metric Display Area */}
      <div className="card">
        <h2>Last 10 Metrics</h2>
        {loading && <p>Loading dashboard data...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && metrics.length === 0 && !error && <p>No metrics recorded yet.</p>}
        {!loading && metrics.length > 0 && (
          <div>
            {metrics.map((metric) => (
              <div key={metric.id} className="metric-item">
                <strong>{metric.metric_name}</strong>
                <span>Value: {metric.value.toFixed(4)}</span>
                <small>({new Date(metric.recorded_at).toLocaleTimeString()})</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;