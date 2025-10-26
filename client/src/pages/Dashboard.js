import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionsAPI, ordersAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subsResponse, ordersResponse] = await Promise.all([
        subscriptionsAPI.getMySubscriptions(),
        ordersAPI.getMyOrders()
      ]);
      
      setSubscriptions(subsResponse.data);
      setRecentOrders(ordersResponse.data.slice(0, 5)); // Get 5 most recent
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  return (
    <div className="container">
      <h1 style={{marginBottom: '2rem'}}>Welcome back, {user?.firstName}!</h1>

      <div className="cards-grid">
        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
            <Link to="/book-subscription" className="btn btn-primary">
              Subscribe to a Plan
            </Link>
            <Link to="/book-alacarte" className="btn btn-secondary">
              Book A La Carte
            </Link>
            <Link to="/my-orders" className="btn btn-outline">
              View All Orders
            </Link>
          </div>
        </div>

        <div className="card">
          <h3>Your Statistics</h3>
          <div style={{marginTop: '1rem'}}>
            <p><strong>Active Subscriptions:</strong> {activeSubscriptions.length}</p>
            <p><strong>Total Orders:</strong> {recentOrders.length}</p>
            <p><strong>Account Status:</strong> <span className="status-badge status-active">Active</span></p>
          </div>
        </div>
      </div>

      {activeSubscriptions.length > 0 && (
        <section className="section">
          <h2 className="section-title">Active Subscriptions</h2>
          <div className="cards-grid">
            {activeSubscriptions.map((sub) => (
              <div key={sub.id} className="card">
                <h3>
                  {sub.subscription_type === 'laundry' ? 'Laundry Subscription' : 'Shirts & Trousers'}
                </h3>
                <p><strong>Plan:</strong> {sub.description}</p>
                <p><strong>Frequency:</strong> {sub.frequency}</p>
                <p className="price-small">£{sub.price}/{sub.frequency === 'weekly' ? 'week' : 'fortnight'}</p>
                {sub.next_pickup_date && (
                  <p><strong>Next Pickup:</strong> {new Date(sub.next_pickup_date).toLocaleDateString()}</p>
                )}
                <span className="status-badge status-active">{sub.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {recentOrders.length > 0 && (
        <section className="section">
          <h2 className="section-title">Recent Orders</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Pickup Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.order_type}</td>
                    <td>£{order.total_price}</td>
                    <td>{new Date(order.pickup_date).toLocaleDateString()}</td>
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
          <Link to="/my-orders" className="btn btn-outline" style={{marginTop: '1rem'}}>
            View All Orders
          </Link>
        </section>
      )}

      {activeSubscriptions.length === 0 && recentOrders.length === 0 && (
        <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
          <h3>Get Started!</h3>
          <p>You haven't made any bookings yet. Choose a service to get started:</p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem'}}>
            <Link to="/book-subscription" className="btn btn-primary">
              Subscribe
            </Link>
            <Link to="/book-alacarte" className="btn btn-secondary">
              Book A La Carte
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
