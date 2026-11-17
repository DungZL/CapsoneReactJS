import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { changePasswordApi } from '../redux/userReducer';
import { ACCESS_TOKEN } from '../services/config';
import { toast } from '../components/Toast';

// Hidden feature: change password on a separate screen (POST /api/Users/changePassword)
export default function ChangePassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userLogin } = useSelector((state) => state.userReducer);

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!userLogin || !localStorage.getItem(ACCESS_TOKEN)) {
    return <Navigate to="/login" replace />;
  }

  const validate = () => {
    const newErrors = {};
    if (!form.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (form.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const resultAction = await dispatch(changePasswordApi(form.newPassword));
    setSubmitting(false);
    if (changePasswordApi.fulfilled.match(resultAction)) {
      toast.success('Password changed successfully!');
      navigate('/profile');
    } else {
      toast.error(resultAction.payload || 'Failed to change password!');
    }
  };

  return (
    <div className="login-page container">
      <h1 className="page-title">Change password</h1>
      <hr className="page-divider" />

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="cp-new">New password</label>
          <div className="input-with-icon">
            <input
              id="cp-new"
              type={showPass ? 'text' : 'password'}
              name="newPassword"
              placeholder="new password"
              value={form.newPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPass(!showPass)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
              aria-pressed={showPass}
            >
              <i className={`fa-regular ${showPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
          {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="cp-confirm">Confirm new password</label>
          <input
            id="cp-confirm"
            type={showPass ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="confirm new password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <span className="error-text">{errors.confirmPassword}</span>
          )}
        </div>

        <div className="login-actions-row">
          <Link to="/profile" className="register-now-link">
            Back to profile
          </Link>
          <button type="submit" className="btn-submit-purple" disabled={submitting}>
            {submitting ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </form>
    </div>
  );
}
