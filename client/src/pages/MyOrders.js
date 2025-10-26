import React, { useState, useEffect } from 'react';
import { ordersAPI, subscriptionsAPI } from '../services/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersResponse, subsResponse] = await Promise.all([
        ordersAPI.getMyOrders(),
        subscriptionsAPI.getMySubscriptions()
      ]);
      
      setOrders(ordersResponse.data);
      setSubscriptions(subsResponse.data);
    } catch (err) {
      setError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }

    try {
      await subscriptionsAPI.cancel(id);
      fetchData(); // Refresh data
    } catch (err) {
      alert('Failed to cancel subscription');
    }
  };

  if (loading) {
    return <div className="loading">Loading your orders...</div>;
  }

  return (
    <div className="container">
      <h1 className="section-title">My Orders & Subscriptions</h1>

      {error && <div className="error-message">{error}</div>}

      <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center'}}>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('orders')}
        >
          A La Carte Orders
        </button>
        <button 
          className={`btn ${activeTab === 'subscriptions' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Subscriptions
        </button>
      </div>

      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
              <h3>No Orders Yet</h3>
              <p>You haven't placed any a la carte orders yet.</p>
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Pickup Date</th>
                    <th>Delivery Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        {Array.isArray(order.items) && order.items.map((item, idx) => (
                          <div key={idx} style={{fontSize: '0.9rem'}}>
                            {item.name} x {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td>£{order.total_price}</td>
                      <td>{new Date(order.pickup_date).toLocaleDateString()}</td>
                      <td>
                        {order.delivery_date 
                          ? new Date(order.delivery_date).toLocaleDateString() 
                          : '-'
                        }
                      </td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div>
          {subscriptions.length === 0 ? (
            <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
              <h3>No Subscriptions</h3>
              <p>You don't have any active subscriptions.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="card">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                    <div>
                      <h3>
                        {sub.subscription_type === 'laundry' 
                          ? 'Laundry Subscription' 
                          : 'Shirts & Trousers'
                        }
                      </h3>
                    </div>
                    <span className={`status-badge status-${sub.status}`}>
                      {sub.status}
                    </span>
                  </div>
                  
                  <div style={{marginTop: '1rem'}}>
                    <p><strong>Plan:</strong> {sub.description}</p>
                    <p><strong>Frequency:</strong> {sub.frequency}</p>
                    <p className="price-small">
                      £{sub.price}/{sub.frequency === 'weekly' ? 'week' : 'fortnight'}
                    </p>
                    {sub.next_pickup_date && (
                      <p><strong>Next Pickup:</strong> {new Date(sub.next_pickup_date).toLocaleDateString()}</p>
                    )}
                    <p style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>
                      Created: {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {sub.status === 'active' && (
                    <button 
                      onClick={() => handleCancelSubscription(sub.id)}
                      className="btn btn-outline"
                      style={{marginTop: '1rem', width: '100%', color: 'var(--error-color)', borderColor: 'var(--error-color)'}}
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
