import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [postcode, setPostcode] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handlePostcodeCheck = async (e) => {
    e.preventDefault();
    setChecking(true);
    setCheckResult(null);

    try {
      const response = await authAPI.checkPostcode(postcode);
      setCheckResult(response.data);
    } catch (error) {
      setCheckResult({ 
        inServiceArea: false, 
        message: 'Error checking postcode. Please try again.' 
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <section className="hero">
        <h1>Premium Laundry & Dry Cleaning</h1>
        <p>Convenient pickup and delivery across South West London</p>
        <div className="hero-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/book-subscription" className="btn btn-primary">
                Subscribe Now
              </Link>
              <Link to="/book-alacarte" className="btn btn-outline" style={{color: 'white', borderColor: 'white'}}>
                Book A La Carte
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline" style={{color: 'white', borderColor: 'white'}}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="container">
        {/* Postcode Checker */}
        <section className="section">
          <h2 className="section-title">Check If We Service Your Area</h2>
          <form onSubmit={handlePostcodeCheck} style={{maxWidth: '500px', margin: '0 auto'}}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter your postcode (e.g., SW1A 1AA)"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={checking} style={{width: '100%'}}>
              {checking ? 'Checking...' : 'Check Postcode'}
            </button>
          </form>
          
          {checkResult && (
            <div className={checkResult.inServiceArea ? 'success-message' : 'error-message'} 
                 style={{maxWidth: '500px', margin: '1rem auto'}}>
              {checkResult.inServiceArea ? (
                <>
                  <p><strong>Great news!</strong> We service {checkResult.areaName}.</p>
                  {!isAuthenticated && (
                    <Link to="/register" className="btn btn-primary" style={{marginTop: '1rem'}}>
                      Sign Up Now
                    </Link>
                  )}
                </>
              ) : (
                <p>{checkResult.message}</p>
              )}
            </div>
          )}
        </section>

        {/* Services */}
        <section className="section">
          <h2 className="section-title">Our Services</h2>
          <div className="cards-grid">
            <div className="card">
              <h3>Laundry Subscription</h3>
              <p>Weekly or fortnightly laundry service with flexible bag options. From just £14.99.</p>
              <Link to={isAuthenticated ? "/book-subscription" : "/register"} className="btn btn-primary">
                Subscribe
              </Link>
            </div>
            
            <div className="card">
              <h3>Shirts & Trousers Subscription</h3>
              <p>Professional washing and pressing service. Perfect for busy professionals. From £11.99.</p>
              <Link to={isAuthenticated ? "/book-subscription" : "/register"} className="btn btn-primary">
                Subscribe
              </Link>
            </div>
            
            <div className="card">
              <h3>A La Carte Dry Cleaning</h3>
              <p>On-demand dry cleaning for suits, dresses, coats, and more. Pay per item.</p>
              <Link to={isAuthenticated ? "/book-alacarte" : "/register"} className="btn btn-primary">
                Book Now
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section">
          <h2 className="section-title">How It Works</h2>
          <div className="cards-grid">
            <div className="card">
              <h3>1. Book Online</h3>
              <p>Choose your service and schedule a pickup time that works for you.</p>
            </div>
            
            <div className="card">
              <h3>2. We Collect</h3>
              <p>Our team picks up your laundry from your doorstep at the scheduled time.</p>
            </div>
            
            <div className="card">
              <h3>3. We Clean</h3>
              <p>Professional cleaning and pressing using premium products and techniques.</p>
            </div>
            
            <div className="card">
              <h3>4. We Deliver</h3>
              <p>Your fresh, clean laundry is delivered back to you within 48 hours.</p>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="section">
          <h2 className="section-title">Service Areas</h2>
          <div className="card" style={{maxWidth: '600px', margin: '0 auto', textAlign: 'center'}}>
            <p>We proudly serve the following areas:</p>
            <ul style={{listStyle: 'none', marginTop: '1rem'}}>
              <li>✓ South West London (SW postcodes)</li>
              <li>✓ Central London (WC, EC postcodes)</li>
              <li>✓ West London (W postcodes)</li>
              <li>✓ Heathrow & Surrounding Areas</li>
              <li>✓ Staines (TW postcodes)</li>
              <li>✓ Weybridge (KT13, KT15)</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
