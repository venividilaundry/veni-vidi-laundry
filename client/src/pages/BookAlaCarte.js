import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

const BookAlaCarte = () => {
  const [pricingItems, setPricingItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [pickupDate, setPickupDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await ordersAPI.getPricing();
      setPricingItems(response.data);
    } catch (err) {
      setError('Failed to load pricing');
    }
  };

  const handleQuantityChange = (itemId, quantity) => {
    const qty = parseInt(quantity) || 0;
    if (qty === 0) {
      const newSelected = { ...selectedItems };
      delete newSelected[itemId];
      setSelectedItems(newSelected);
    } else {
      setSelectedItems({
        ...selectedItems,
        [itemId]: qty
      });
    }
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(selectedItems).forEach(itemId => {
      const item = pricingItems.find(p => p.id === parseInt(itemId));
      if (item) {
        total += item.price * selectedItems[itemId];
      }
    });
    return total.toFixed(2);
  };

  const getOrderItems = () => {
    return Object.keys(selectedItems).map(itemId => {
      const item = pricingItems.find(p => p.id === parseInt(itemId));
      return {
        id: parseInt(itemId),
        name: item.item_name,
        quantity: selectedItems[itemId],
        price: item.price,
        subtotal: (item.price * selectedItems[itemId]).toFixed(2)
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Object.keys(selectedItems).length === 0) {
      setError('Please select at least one item');
      return;
    }

    setLoading(true);

    try {
      await ordersAPI.create({
        orderType: 'dry_cleaning',
        items: getOrderItems(),
        totalPrice: calculateTotal(),
        pickupDate,
        specialInstructions
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-orders');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (pricingItems.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="section-title">A La Carte Dry Cleaning</h1>
      
      <div style={{maxWidth: '800px', margin: '0 auto'}}>
        <form onSubmit={handleSubmit}>
          <div className="card">
            <h3>Select Items</h3>
            <div style={{marginTop: '1.5rem'}}>
              {pricingItems.map((item) => (
                <div 
                  key={item.id} 
                  style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{flex: 1}}>
                    <strong>{item.item_name}</strong>
                    <p style={{fontSize: '0.9rem', color: 'var(--text-light)', margin: '0.25rem 0'}}>
                      {item.description}
                    </p>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <span className="price-small">£{item.price.toFixed(2)}</span>
                    <input
                      type="number"
                      min="0"
                      value={selectedItems[item.id] || 0}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      style={{width: '80px', textAlign: 'center'}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{marginTop: '2rem'}}>
            <label>Pickup Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={getMinDate()}
              required
            />
          </div>

          <div className="form-group">
            <label>Special Instructions (Optional)</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows="4"
              placeholder="Any special care instructions or notes..."
            />
          </div>

          {Object.keys(selectedItems).length > 0 && (
            <div className="card" style={{background: 'var(--bg-light)', padding: '1.5rem', marginTop: '1.5rem'}}>
              <h3>Order Summary</h3>
              <div style={{marginTop: '1rem'}}>
                {getOrderItems().map((item, index) => (
                  <div key={index} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                    <span>{item.name} x {item.quantity}</span>
                    <span>£{item.subtotal}</span>
                  </div>
                ))}
                <hr style={{margin: '1rem 0', border: 'none', borderTop: '2px solid var(--border-color)'}} />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold'}}>
                  <span>Total:</span>
                  <span className="price-small">£{calculateTotal()}</span>
                </div>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Order created successfully! Redirecting...</div>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{width: '100%', marginTop: '1.5rem'}}
            disabled={loading || Object.keys(selectedItems).length === 0}
          >
            {loading ? 'Creating Order...' : `Place Order - £${calculateTotal()}`}
          </button>
        </form>

        <div className="card" style={{marginTop: '2rem'}}>
          <h3>Delivery Information</h3>
          <p>Your items will be cleaned and returned within 48 hours of pickup.</p>
          <p style={{marginTop: '0.5rem'}}>We use premium, environmentally friendly cleaning products and processes.</p>
        </div>
      </div>
    </div>
  );
};

export default BookAlaCarte;
