import { useState, useRef } from 'react';
import { PageHead, Card, Button, Icon } from '../components/UIComponents';
import { DATASET_STATS } from '../data/syntheticData';
import { predictBatchCSV } from '../services/api';

const VALIDATION_CHECKS = [
  ['Maximum batch limit', 'Up to 30,000 records'],
  ['Required 18 features', 'All model columns verified'],
  ['Platform validation', 'Netflix, Amazon Prime Video, JioHotstar'],
  ['Churn state validation', 'Values strictly 0 or 1'],
  ['Lifetime tenure validation', 'Non-negative values >= 0'],
  ['Output CSV export', 'Appends Predicted_CLV to output'],
];

const WORKFLOW_STEPS = ['Upload CSV', 'Validate Schema', 'Predict CLV', 'View & Download CSV'];

export default function Dataset() {
  const [status, setStatus] = useState('idle'); // idle | uploading | done | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [downloadBlob, setDownloadBlob] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setStatus('error');
      setErrorMessage('Selected file must be a .csv format.');
      return;
    }

    setFileName(file.name);
    setStatus('uploading');
    setErrorMessage(null);

    try {
      const blob = await predictBatchCSV(file);
      setDownloadBlob(blob);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Batch prediction failed.');
    }
  };

  const handleDownload = () => {
    if (!downloadBlob) return;
    const url = window.URL.createObjectURL(downloadBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predicted_${fileName || 'batch.csv'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <>
      <PageHead
        title="Dataset batch predictions"
        subtitle="Upload synthetic CSV data and run batch CLV predictions via FastAPI backend."
      />

      <div className="dataset-kpis">
        <Card>
          <Icon name="database" />
          <span>Full Portfolio Dataset</span>
          <strong>{DATASET_STATS.total.toLocaleString('en-IN')}</strong>
          <small>records</small>
        </Card>
        <Card>
          <Icon name="database" />
          <span>Training Split</span>
          <strong>{DATASET_STATS.training.toLocaleString('en-IN')}</strong>
          <small>Streaming_Train_12000.csv</small>
        </Card>
        <Card>
          <Icon name="database" />
          <span>Testing Split</span>
          <strong>{DATASET_STATS.testing.toLocaleString('en-IN')}</strong>
          <small>Streaming_Test_3000.csv</small>
        </Card>
      </div>

      <Card className="workflow-card">
        <div className="card-head">
          <div>
            <h3>FastAPI Batch Prediction Workflow</h3>
            <p>Processes up to 30,000 customer records per CSV batch upload</p>
          </div>
        </div>
        <div className="workflow">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step} className={status === 'done' || (status === 'uploading' && i <= 1) || (status === 'idle' && i === 0) ? 'active' : ''}>
              <span>{status === 'done' ? <Icon name="check" size={15} /> : i + 1}</span>
              <b>{step}</b>
              {i < 3 && <Icon name="chevron" />}
            </div>
          ))}
        </div>
      </Card>

      <div className="two-col upload-layout">
        <Card className={`upload-card ${status}`}>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div className="upload-icon">
            <Icon name={status === 'done' ? 'check' : 'upload'} size={28} />
          </div>
          <h3>{status === 'done' ? 'Batch Prediction Completed' : 'Upload CSV for Batch CLV Prediction'}</h3>
          <p>
            {status === 'done'
              ? `${fileName} processed successfully via Random Forest model.`
              : 'Select a CSV file containing the 18 required features to run batch prediction.'}
          </p>

          {status === 'uploading' && (
            <div className="progress">
              <i />
              <span>Sending CSV to FastAPI backend & running pipeline inference…</span>
            </div>
          )}

          {status === 'error' && (
            <div style={{ color: 'var(--error, #ef4444)', margin: '1rem 0', fontSize: '0.875rem' }}>
              ⚠ {errorMessage}
            </div>
          )}

          {status === 'done' ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <Button icon="spark" onClick={handleDownload}>
                Download Predicted CSV
              </Button>
              <Button variant="secondary" onClick={() => { setStatus('idle'); setDownloadBlob(null); }}>
                Upload Another CSV
              </Button>
            </div>
          ) : (
            <Button icon="upload" disabled={status === 'uploading'} onClick={() => fileInputRef.current?.click()}>
              {status === 'uploading' ? 'Processing CSV…' : 'Choose CSV File'}
            </Button>
          )}
          <small style={{ marginTop: 12 }}>Supported format: CSV · Maximum limit: 30,000 rows</small>
        </Card>

        <Card className="validation-card">
          <div className="card-head">
            <div>
              <h3>Backend Batch Validation Rules</h3>
              <p>Checks enforced by FastAPI before pipeline execution</p>
            </div>
            {status === 'done' && <span className="status green">Batch Inferred</span>}
          </div>
          {VALIDATION_CHECKS.map(([label, detail]) => (
            <div className="validation-row" key={label}>
              <span className={status === 'done' ? 'valid' : ''}>
                {status === 'done' ? <Icon name="check" size={14} /> : <i />}
              </span>
              <div><b>{label}</b><small>{detail}</small></div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
