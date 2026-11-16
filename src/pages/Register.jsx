import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signupApi } from '../redux/userReducer';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    gender: true,
  });

  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{9,11}$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được bỏ trống';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!formData.password) {
      newErrors.password = 'Password không được bỏ trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password tối thiểu 6 ký tự';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Password confirm không được bỏ trống';
    } else if (formData.passwordConfirm !== formData.password) {
      newErrors.passwordConfirm = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name không được bỏ trống';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone không được bỏ trống';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone phải là số từ 9 - 11 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      email: formData.email.trim(),
      password: formData.password,
      name: formData.name.trim(),
      gender: Boolean(formData.gender),
      phone: formData.phone.trim(),
    };

    const resultAction = await dispatch(signupApi(payload));
    if (signupApi.fulfilled.match(resultAction)) {
      alert('Đăng ký tài khoản thành công!');
      navigate('/login');
    } else {
      alert(resultAction.payload || 'Đăng ký thất bại!');
    }
  };

  return (
    <div className="register-page container">
      <h1 className="page-title">Register</h1>
      <hr className="page-divider" />

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="register-grid">
          <div className="register-col">
            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                placeholder="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="input-with-icon">
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="password"
                  value={formData.password}
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

            <div className="form-group">
              <label htmlFor="reg-passwordConfirm">Password confirm</label>
              <div className="input-with-icon">
                <input
                  id="reg-passwordConfirm"
                  type={showConfirmPass ? 'text' : 'password'}
                  name="passwordConfirm"
                  placeholder="password confirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  aria-label="Toggle confirm password visibility"
                >
                  <i className={`fa-regular ${showConfirmPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.passwordConfirm && (
                <span className="error-text">{errors.passwordConfirm}</span>
              )}
            </div>
          </div>

          <div className="register-col">
            <div className="form-group">
              <label htmlFor="reg-name">Name</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                placeholder="name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone">Phone</label>
              <input
                id="reg-phone"
                type="text"
                name="phone"
                placeholder="phone"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group gender-group">
              <span className="gender-label">Gender</span>
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  checked={formData.gender === true}
                  onChange={() => setFormData((prev) => ({ ...prev, gender: true }))}
                />
                <span className="radio-custom"></span>
                <span className="radio-text">Male</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  checked={formData.gender === false}
                  onChange={() => setFormData((prev) => ({ ...prev, gender: false }))}
                />
                <span className="radio-custom"></span>
                <span className="radio-text">Female</span>
              </label>
            </div>

            <div className="register-submit-wrap">
              <button type="submit" className="btn-submit-purple">
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
