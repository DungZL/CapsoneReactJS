import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-col">
            <h4>GET HELP</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/search?category=NIKE">Nike</Link></li>
              <li><Link to="/search?category=ADIDAS">Adidas</Link></li>
              <li><Link to="/">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>SUPPORT</h4>
            <ul>
              <li><Link to="/">About</Link></li>
              <li><Link to="/">Contact</Link></li>
              <li><Link to="/">Help</Link></li>
              <li><Link to="/">Phone</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>REGISTER</h4>
            <ul>
              <li><Link to="/register">register</Link></li>
              <li><Link to="/login">login</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2022 Cybersoft All Rights Reserved | Design Theme by Trương Tấn Khải.</p>
        </div>
      </div>
    </footer>
  );
}
