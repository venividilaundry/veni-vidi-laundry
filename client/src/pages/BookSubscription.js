import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionsAPI } from '../services/api';

const BookSubscription = () => {
  const [subscriptionType, setSubscriptionType] = useState('laundry');
  const [tier, setTier] = useState(1);
  const [frequency, setFrequency] = useState('weekly');
  const [pickupDate, setPickupDate] = useState('');
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await subscriptionsAPI.getPricing();
      setPricing(response.data);
    } catch (err) {
      setError('Failed to load pricing');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await subscriptionsAPI.create({
        subscriptionType,
        tier: parseInt(tier),
        frequency,
        pickupDate
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getCurrentPrice = () => {
    if (!pricing) return 0;
    return pricing[subscriptionType]?.[frequency]?.[tier]?.price || 0;
  };

  const getCurrentDescription = () => {
    if (!pricing) return '';
    return pricing[subscriptionType]?.[frequency]?.[tier]?.description || '';
  };

  if (!pricing) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="section-title">Subscribe to Our Service</h1>
      
      <div style={{maxWidth: '600px', margin: '0 auto'}}>
        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label>Service Type</label>
            <select 
              value={subscriptionType} 
              onChange={(e) => setSubscriptionType(e.target.value)}
              required
            >
              <option value="laundry">Laundry Service</option>
              <option value="shirts_trousers">Shirts & Trousers (Wash & Press)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Plan Tier</label>
            <select 
              value={tier} 
              onChange={(e) => setTier(e.target.value)}
              required
            >
              <option value="1">
                Tier 1 - {subscriptionType === 'laundry' ? '1 bag' : '5 items'}
              </option>
              <option value="2">
                Tier 2 - {subscriptionType === 'laundry' ? '2 bags' : '10 items'}
              </option>
              <option value="3">
                Tier 3 - {subscriptionType === 'laundry' ? '3 bags' : '15 items'}
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Frequency</label>
            <select 
              value={frequency} 
              onChange={(e) => setFrequency(e.target.value)}
              required
            >
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
            </select>
          </div>

          <div className="form-group">
            <label>First Pickup Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={getMinDate()}
              required
            />
          </div>

          <div className="card" style={{background: 'var(--bg-light)', padding: '1.5rem', marginTop: '1.5rem'}}>
            <h3>Subscription Summary</h3>
            <p><strong>Service:</strong> {subscriptionType === 'laundry' ? 'Laundry' : 'Shirts & Trousers'}</p>
            <p><strong>Details:</strong> {getCurrentDescription()}</p>
            <p><strong>Frequency:</strong> {frequency}</p>
            <p className="price">£{getCurrentPrice()}<span style={{fontSize: '1rem', fontWeight: 'normal'}}>/{frequency === 'weekly' ? 'week' : 'fortnight'}</span></p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Subscription created successfully! Redirecting...</div>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{width: '100%', marginTop: '1.5rem'}}
            disabled={loading}
          >
            {loading ? 'Creating Subscription...' : 'Subscribe Now'}
          </button>
        </form>

        <div className="card" style={{marginTop: '2rem'}}>
          <h3>Subscription Benefits</h3>
          <ul style={{marginTop: '1rem', paddingLeft: '1.5rem'}}>
            <li>Flexible pickup schedules</li>
            <li>Save up to 20% compared to a la carte pricing</li>
            <li>Priority processing</li>
            <li>Cancel anytime from your dashboard</li>
            <li>Environmentally friendly cleaning products</li>
            <li>Same-day pickup available (before 10am)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookSubscription;
