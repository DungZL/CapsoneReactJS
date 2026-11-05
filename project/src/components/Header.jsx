import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutAction } from '../redux/userReducer';
import { ACCESS_TOKEN } from '../services/config';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { carts, userLogin } = useSelector((state) => state.userReducer);

  const totalQuantity = carts.reduce((sum, item) => sum + item.quantity, 0);
  const isLoggedIn = Boolean(userLogin && localStorage.getItem(ACCESS_TOKEN));

  const handleCartClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Vui lòng đăng nhập để truy cập trang giỏ hàng!');
      navigate('/login');
      return;
    }
    navigate('/carts');
  };

  const handleLogout = (e) => {
    e.preventDefault();
    dispatch(logoutAction());
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="container header-top-inner">
          <NavLink to="/" className="brand-logo">
            <span className="logo-cyber">CYBERSOFT</span>
          </NavLink>
          <div className="header-actions">
            <NavLink to="/search" className="header-link search-link">
              <i className="fa-solid fa-magnifying-glass"></i> Search
            </NavLink>
            <a href="/carts" onClick={handleCartClick} className="header-link cart-link">
              <i className="fa-solid fa-cart-shopping"></i> ({totalQuantity})
            </a>
            {isLoggedIn ? (
              <>
                <NavLink to="/profile" className="header-link">
                  Profile
                </NavLink>
                <a href="#logout" onClick={handleLogout} className="header-link">
                  Logout
                </a>
              </>
            ) : (
              <>
                <NavLink to="/login" className="header-link">
                  Login
                </NavLink>
                <NavLink to="/register" className="header-link">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
      <nav className="header-nav">
        <div className="container header-nav-inner">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Home
          </NavLink>
          <NavLink to="/search?category=MEN" className="nav-item">
            Men
          </NavLink>
          <NavLink to="/search?category=WOMEN" className="nav-item">
            Woman
          </NavLink>
          <NavLink to="/search?category=NIKE" className="nav-item">
            Kid
          </NavLink>
          <NavLink to="/search?category=ADIDAS" className="nav-item">
            Sport
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
