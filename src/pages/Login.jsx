import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signinApi, facebookLoginApi } from '../redux/userReducer';

const FB_APP_ID = '599753691700080';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (window.FB) return;
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      });
    };

    const scriptId = 'facebook-jssdk';
    if (!document.getElementById(scriptId)) {
      const js = document.createElement('script');
      js.id = scriptId;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      document.body.appendChild(js);
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!credentials.email.trim()) {
      newErrors.email = 'Email không được bỏ trống';
    } else if (!emailRegex.test(credentials.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!credentials.password) {
      newErrors.password = 'Password không được bỏ trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const resultAction = await dispatch(
      signinApi({
        email: credentials.email.trim(),
        password: credentials.password,
      })
    );

    if (signinApi.fulfilled.match(resultAction)) {
      navigate('/profile');
    } else {
      alert(resultAction.payload || 'Đăng nhập thất bại!');
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      alert('Facebook SDK đang tải hoặc bị chặn bởi trình duyệt.');
      return;
    }

    window.FB.login(
      async (response) => {
        if (response?.authResponse?.accessToken) {
          const resultAction = await dispatch(
            facebookLoginApi(response.authResponse.accessToken)
          );
          if (facebookLoginApi.fulfilled.match(resultAction)) {
            navigate('/profile');
          } else {
            alert(resultAction.payload || 'Đăng nhập Facebook thất bại!');
          }
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  return (
    <div className="login-page container">
      <h1 className="page-title">Login</h1>
      <hr className="page-divider" />

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="email"
            value={credentials.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <div className="input-with-icon">
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              name="password"
              placeholder="password"
              value={credentials.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPass(!showPass)}
              aria-label="Toggle password visibility"
            >
              <i className={`fa-regular ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>

        <div className="login-actions-row">
          <Link to="/register" className="register-now-link">
            Register now ?
          </Link>
          <button type="submit" className="btn-submit-purple">
            LOGIN
          </button>
        </div>

        <button
          type="button"
          className="btn-facebook-login"
          onClick={handleFacebookLogin}
        >
          <i className="fa-brands fa-facebook"></i>
          <span>Continue with Facebook</span>
        </button>
      </form>
    </div>
  );
}
