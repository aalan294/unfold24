import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const { isConnected, connectWallet, disconnectWallet, account, isBuilder, isBuyer } = useWeb3();
  const [showRegisterDropdown, setShowRegisterDropdown] = useState(false);

  useEffect(() => {
  
    if (isConnected) {
      alert("Wallet Connected Successfully...");
    }
  }, [isConnected]);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Crypt Estate</Link>
      </div>
      <div className="navbar-links">
        {isConnected ? (
          <>
            {/* Show Browse Properties for Buyers */}
            {isBuyer && (
              <Link 
                to="/properties" 
                className={location.pathname === '/properties' ? 'active' : ''}
              >
                Browse Properties
              </Link>
            )}

            {/* Show List Property for Builders */}
            {isBuilder && (
              <Link 
                to="/add-property"
                className={location.pathname === '/add-property' ? 'active' : ''}
              >
                List Property
              </Link>
            )}

            {/* Display wallet address and logout button */}
            <div className="account-section">
              <span className="wallet-address">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </span>
              <button onClick={disconnectWallet} className="login-button">
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="auth-buttons">
            {/* Register Dropdown */}
            <div className="register-dropdown">
              <button 
                className="register-button"
                onMouseEnter={() => setShowRegisterDropdown(true)}
                onMouseLeave={() => setShowRegisterDropdown(false)}
              >
                Register
                {showRegisterDropdown && (
                  <div className="dropdown-menu">
                    <Link to="/register/builder" className="dropdown-item">Builder</Link>
                    <Link to="/register/buyer" className="dropdown-item">Buyer</Link>
                  </div>
                )}
              </button>
            </div>

            {/* Login Button */}
            <button onClick={connectWallet} className="login-button">
              Login with Wallet
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
