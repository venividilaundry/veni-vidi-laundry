import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes, subsRes, customersRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getOrders(),
        adminAPI.getSubscriptions(),
        adminAPI.getCustomers()
      ]);
      
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setSubscriptions(subsRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      fetchData(); // Refresh data
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="container">
      <h1 className="section-title">Admin Dashboard</h1>

      <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap'}}>
        <button 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`btn ${activeTab === 'subscriptions' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Subscriptions
        </button>
        <button 
          className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div>
          <div className="cards-grid">
            <div className="card" style={{textAlign: 'center'}}>
              <h2 style={{color: 'var(--primary-color)', fontSize: '3rem', margin: '0'}}>{stats.totalOrders}</h2>
              <p style={{fontSize: '1.2rem', marginTop: '0.5rem'}}>Total Orders</p>
            </div>
            <div className="card" style={{textAlign: 'center'}}>
              <h2 style={{color: 'var(--success-color)', fontSize: '3rem', margin: '0'}}>{stats.activeSubscriptions}</h2>
              <p style={{fontSize: '1.2rem', marginTop: '0.5rem'}}>Active Subscriptions</p>
            </div>
            <div className="card" style={{textAlign: 'center'}}>
              <h2 style={{color: 'var(--secondary-color)', fontSize: '3rem', margin: '0'}}>{stats.totalCustomers}</h2>
              <p style={{fontSize: '1.2rem', marginTop: '0.5rem'}}>Total Customers</p>
            </div>
            <div className="card" style={{textAlign: 'center'}}>
              <h2 style={{color: 'var(--warning-color)', fontSize: '3rem', margin: '0'}}>{stats.pendingOrders}</h2>
              <p style={{fontSize: '1.2rem', marginTop: '0.5rem'}}>Pending Orders</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h2 style={{marginBottom: '1rem'}}>All Orders</h2>
          {orders.length === 0 ? (
            <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
              <p>No orders yet.</p>
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Pickup</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.first_name} {order.last_name}</td>
                      <td>
                        {order.email}<br />
                        {order.phone}
                      </td>
                      <td>
                        {order.address}<br />
                        {order.postcode}
                      </td>
                      <td style={{fontSize: '0.85rem'}}>
                        {Array.isArray(order.items) && order.items.map((item, idx) => (
                          <div key={idx}>{item.name} x{item.quantity}</div>
                        ))}
                      </td>
                      <td>£{order.total_price}</td>
                      <td>{new Date(order.pickup_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          style={{padding: '0.3rem'}}
                        >
                          <option value="pending">Pending</option>
                          <option value="picked_up">Picked Up</option>
                          <option value="processing">Processing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
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
          <h2 style={{marginBottom: '1rem'}}>All Subscriptions</h2>
          {subscriptions.length === 0 ? (
            <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
              <p>No subscriptions yet.</p>
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Address</th>
                    <th>Type</th>
                    <th>Tier</th>
                    <th>Frequency</th>
                    <th>Next Pickup</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td>#{sub.id}</td>
                      <td>{sub.first_name} {sub.last_name}</td>
                      <td>
                        {sub.email}<br />
                        {sub.phone}
                      </td>
                      <td>
                        {sub.address}<br />
                        {sub.postcode}
                      </td>
                      <td>{sub.subscription_type === 'laundry' ? 'Laundry' : 'Shirts & Trousers'}</td>
                      <td>Tier {sub.tier}</td>
                      <td>{sub.frequency}</td>
                      <td>
                        {sub.next_pickup_date 
                          ? new Date(sub.next_pickup_date).toLocaleDateString()
                          : '-'
                        }
                      </td>
                      <td>
                        <span className={`status-badge status-${sub.status}`}>
                          {sub.status}
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

      {activeTab === 'customers' && (
        <div>
          <h2 style={{marginBottom: '1rem'}}>All Customers</h2>
          {customers.length === 0 ? (
            <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
              <p>No customers yet.</p>
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Postcode</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>#{customer.id}</td>
                      <td>{customer.first_name} {customer.last_name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone || '-'}</td>
                      <td>{customer.address}</td>
                      <td>{customer.postcode}</td>
                      <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
