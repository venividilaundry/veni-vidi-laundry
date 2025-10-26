import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Veni Vidi Laundry
        </Link>
        
        <ul className="navbar-menu">
          {isAuthenticated ? (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/book-subscription">Subscriptions</Link></li>
              <li><Link to="/book-alacarte">A La Carte</Link></li>
              <li><Link to="/my-orders">My Orders</Link></li>
              {user?.isAdmin && (
                <li><Link to="/admin">Admin</Link></li>
              )}
              <li>
                <button onClick={logout} className="btn btn-outline">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
