import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-col">
            <h2>GET HELP</h2>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/search?category=NIKE">Nike</Link></li>
              <li><Link to="/search?category=ADIDAS">Adidas</Link></li>
              <li>Contact</li>
            </ul>
          </div>
          <div className="footer-col">
            <h2>SUPPORT</h2>
            <ul>
              <li>About</li>
              <li>Contact</li>
              <li>Help</li>
              <li>Phone</li>
            </ul>
          </div>
          <div className="footer-col">
            <h2>REGISTER</h2>
            <ul>
              <li><Link to="/register">register</Link></li>
              <li><Link to="/login">login</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2022 Cybersoft All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
