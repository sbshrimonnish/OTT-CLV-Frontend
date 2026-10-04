import { useState, useEffect, useCallback } from 'react';
import { PageHead, Card, Kpi, Icon, FormInput, Button } from '../components/UIComponents';
import { ChartCard } from '../components/ChartCard';
import { CustomerForecastLineChart } from '../components/AnalyticsCharts';
import { fetchCustomerById, fetchCustomers, predictCLV } from '../services/api';
import { formatINR } from '../utils/formatters';

export default function CustomerAnalysis() {
  const [query, setQuery] = useState('CUST_1');
  const [sampleList, setSampleList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers(0, 5)
      .then(res => {
        if (res && res.customers) {
          setSampleList(res.customers.map(c => c.customer_id));
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = useCallback((idToSearch) => {
    const targetId = idToSearch || query;
    if (!targetId) return;
    setLoading(true);
    setError(null);
    setCustomer(null);
    setPrediction(null);

    fetchCustomerById(targetId)
      .then(async (data) => {
        if (!data) {
          setError(`Customer ID "${targetId}" not found in database.`);
          return;
        }
        setCustomer(data);

        // Run prediction
        try {
          const pred = await predictCLV({
            customerId: data.customer_id,
            ageGroup: data.age_group,
            location: data.location,
            platform: data.platform,
            plan: data.plan,
            billingCycle: data.billing_cycle,
            fee: data.monthly_fee,
            movies: data.movies_watched,
            watch: data.watch_hours,
            login: data.login_days,
            lastActive: data.last_active_days,
            renewals: data.renewals,
            upgrades: data.upgrades,
            downgrades: data.downgrades,
            paymentFailures: data.payment_failures,
            discount: data.discount,
            supportTickets: data.support_tickets,
            churn: data.churn,
            lifetimeMonths: data.lifetime_months,
          });
          setPrediction(pred);
        } catch (err) {
          console.warn("Prediction fetch error:", err);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => {
    let ignore = false;
    fetchCustomerById('CUST_1')
      .then(async (data) => {
        if (ignore) return;
        if (data) {
          setCustomer(data);
          try {
            const pred = await predictCLV({
              customerId: data.customer_id,
              ageGroup: data.age_group,
              location: data.location,
              platform: data.platform,
              plan: data.plan,
              billingCycle: data.billing_cycle,
              fee: data.monthly_fee,
              movies: data.movies_watched,
              watch: data.watch_hours,
              login: data.login_days,
              lastActive: data.last_active_days,
              renewals: data.renewals,
              upgrades: data.upgrades,
              downgrades: data.downgrades,
              paymentFailures: data.payment_failures,
              discount: data.discount,
              supportTickets: data.support_tickets,
              churn: data.churn,
              lifetimeMonths: data.lifetime_months,
            });
            if (!ignore) setPrediction(pred);
          } catch (err) {
            console.warn(err);
          }
        }
      })
      .catch(() => {});

    return () => { ignore = true; };
  }, []);

  const forecastData = customer && prediction ? [
    { period: 'Current', forecast: customer.clv },
    { period: '3M', forecast: Math.round(prediction.predicted6mCLV * 0.5) },
    { period: '6M', forecast: Math.round(prediction.predicted6mCLV) },
    { period: '12M', forecast: Math.round(prediction.predicted12mCLV) },
  ] : undefined;

  return (
    <>
      <PageHead
        title="Customer Analysis"
        subtitle="Lookup a customer profile and retrieve real ML lifetime predictions."
      />

      <Card className="lookup">
        <label>
          <span>Customer ID Lookup</span>
          <div className="search-large">
            <Icon name="search" />
            <FormInput
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g. CUST_1, CUST_10, CUST_E3C733E6"
            />
            <Button onClick={() => handleSearch(query)}>Find customer</Button>
          </div>
        </label>
        <p>Try sample customer IDs from database:{' '}
          <button onClick={() => { setQuery('CUST_1'); handleSearch('CUST_1'); }}>CUST_1</button>{', '}
          <button onClick={() => { setQuery('CUST_10'); handleSearch('CUST_10'); }}>CUST_10</button>
          {sampleList.length > 0 && sampleList.slice(0, 3).map(id => (
            <span key={id}>
              {', '}
              <button onClick={() => { setQuery(id); handleSearch(id); }}>{id}</button>
            </span>
          ))}
        </p>
      </Card>

      {loading && <div style={{ padding: '2rem', opacity: 0.6 }}>Querying customer profile & running model inference…</div>}

      {error && (
        <Card style={{ borderColor: 'var(--error, #ef4444)', padding: '1.5rem', margin: '1rem 0' }}>
          <div style={{ color: 'var(--error, #ef4444)', fontWeight: 600 }}>Customer Search Result</div>
          <p style={{ marginTop: 8 }}>{error}</p>
        </Card>
      )}

      {!loading && !error && customer && (
        <>
          <div className="profile-strip">
            <div className="avatar large">{customer.platform.substring(0, 2).toUpperCase()}</div>
            <div>
              <span className="eyebrow">CUSTOMER PROFILE</span>
              <h2>{customer.customer_id}</h2>
              <p>{customer.platform} · {customer.plan} plan · {customer.billing_cycle} billing</p>
            </div>
            <span className={`status ${customer.churn === 0 ? 'green' : 'amber'}`}>
              {customer.churn === 0 ? 'Active Customer' : 'Churned Customer'}
            </span>
            <div className="profile-meta">
              <span>Monthly fee <b>{formatINR(customer.monthly_fee)}</b></span>
              <span>Tenure <b>{customer.lifetime_months} months</b></span>
            </div>
          </div>

          <div className="value-cards">
            <Kpi label="Observed CLV" value={formatINR(customer.clv)} meta="Historical database record" icon="chart" tone="blue" />
            <Kpi label="Predicted CLV" value={prediction ? formatINR(prediction.predictedCLV) : "Calculating…"} meta="Random Forest pipeline" icon="spark" tone="indigo" />
            <Kpi label="Forecast Next 6M" value={prediction?.predicted6mCLV ? formatINR(prediction.predicted6mCLV) : "N/A"} meta="Future 6M Model" icon="spark" tone="teal" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginTop: 20 }}>
            <ChartCard
              title="Customer Value Forecast Trend"
              subtitle="Value progression projection (Current → 3M → 6M → 12M)"
              style={{ height: 360 }}
            >
              <CustomerForecastLineChart data={forecastData} />
            </ChartCard>

            <Card className="details-card">
              <div className="card-head">
                <div><h3>Customer Signals</h3><p>Raw features fed into Random Forest model</p></div>
              </div>
              <div className="detail-grid">
                <div><span>Age Group</span><b>{customer.age_group}</b></div>
                <div><span>Location</span><b>{customer.location}</b></div>
                <div><span>Watch Hours</span><b>{customer.watch_hours} hrs</b></div>
                <div><span>Movies Watched</span><b>{customer.movies_watched}</b></div>
                <div><span>Login Days</span><b>{customer.login_days} / 30</b></div>
                <div><span>Last Active</span><b>{customer.last_active_days} days ago</b></div>
                <div><span>Renewals</span><b>{customer.renewals}</b></div>
                <div><span>Upgrades</span><b>{customer.upgrades}</b></div>
                <div><span>Downgrades</span><b>{customer.downgrades}</b></div>
                <div><span>Payment Failures</span><b>{customer.payment_failures}</b></div>
                <div><span>Discount Applied</span><b>{customer.discount}%</b></div>
                <div><span>Support Tickets</span><b>{customer.support_tickets}</b></div>
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
