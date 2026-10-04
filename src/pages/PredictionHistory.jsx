import { useState, useEffect } from 'react';
import { PageHead, Card, Button, Icon, FormInput } from '../components/UIComponents';
import { fetchPredictionHistory } from '../services/api';

export default function PredictionHistory() {
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = () => {
    setLoading(true);
    setError(null);
    fetchPredictionHistory(0, 100)
      .then(data => {
        setRecords(data.predictions || []);
        setTotal(data.total || 0);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    fetchPredictionHistory(0, 100)
      .then(data => {
        if (isMounted) {
          setRecords(data.predictions || []);
          setTotal(data.total || 0);
        }
      })
      .catch(err => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const filtered = records.filter(r =>
    (r.customer_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.platform || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.plan || '').toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (val) => val != null
    ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-';

  return (
    <>
      <PageHead
        title="Prediction history"
        subtitle="Real prediction logs stored in the SQLite database by FastAPI backend."
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="status green"><Icon name="check" size={14} /> FastAPI Database Logs</span>
            <Button variant="secondary" onClick={loadHistory} icon="refresh">Refresh</Button>
          </div>
        }
      />

      <Card className="table-card history">
        <div className="table-tools">
          <div className="search-box">
            <Icon name="search" />
            <FormInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customer ID, platform or plan..."
            />
          </div>
          <span style={{ opacity: 0.6, fontSize: '0.875rem' }}>
            {total} predictions stored in database
          </span>
        </div>

        {loading && (
          <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
            <Icon name="refresh" size={24} />
            <p style={{ marginTop: 8 }}>Loading prediction logs...</p>
          </div>
        )}

        {error && (
          <div style={{ padding: '2rem', color: 'var(--error, #ef4444)' }}>
            <Icon name="info" size={16} /> {error}
            <br />
            <small>Ensure backend is running at http://localhost:8000</small>
          </div>
        )}

        {!loading && !error && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Customer ID</th>
                  <th>Platform</th>
                  <th>Plan</th>
                  <th>Predicted CLV</th>
                  <th>6M Forecast</th>
                  <th>12M Forecast</th>
                  <th>Model</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>{r.created_at ? new Date(typeof r.created_at === 'string' && !r.created_at.endsWith('Z') ? r.created_at + 'Z' : r.created_at).toLocaleString('en-IN') : '-'}</td>
                    <td><b>{r.customer_id}</b></td>
                    <td>{r.platform}</td>
                    <td>{r.plan}</td>
                    <td className="accent-cell">{fmt(r.predicted_clv)}</td>
                    <td>{fmt(r.predicted_6m_clv)}</td>
                    <td>{fmt(r.predicted_12m_clv)}</td>
                    <td>{r.model_version}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="no-results" style={{ padding: '3rem', textAlign: 'center' }}>
                <Icon name="search" size={28} />
                <h3>{records.length === 0 ? 'No prediction logs stored yet' : 'No matching predictions'}</h3>
                <p>{records.length === 0
                  ? 'Go to the Predict page and run a prediction to populate database logs.'
                  : 'Try a different search term.'}
                </p>
                {search && <Button variant="secondary" onClick={() => setSearch('')}>Clear search</Button>}
                {records.length === 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Button onClick={() => window.location.href = '/predict'} icon="spark">
                      Make a prediction
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="pagination">
          <span>Showing {filtered.length} of {total} stored predictions</span>
        </div>
      </Card>
    </>
  );
}
