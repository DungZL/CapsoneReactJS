import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import {
  getProfileApi,
  updateProfileApi,
  getProductFavoriteApi,
  uploadAvatarApi,
} from '../redux/userReducer';
import { ACCESS_TOKEN } from '../services/config';
import { resolveImage, handleImageError } from '../utils/productImages';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const ORDERS_PER_PAGE = 2;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const DEFAULT_AVATAR = 'https://i.pravatar.cc/225';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
};

export default function Profile() {
  const dispatch = useDispatch();
  const { userLogin, userProfile, productsFavorite } = useSelector(
    (state) => state.userReducer
  );

  const [activeTab, setActiveTab] = useState('orders');
  const [orderPage, setOrderPage] = useState(1);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
    gender: true,
  });

  const token = localStorage.getItem(ACCESS_TOKEN);
  const isAuthenticated = Boolean(userLogin && token);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getProfileApi());
      dispatch(getProductFavoriteApi());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        email: userProfile.email || '',
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        password: userProfile.password || '',
        gender: userProfile.gender !== undefined ? Boolean(userProfile.gender) : true,
      });
    }
  }, [userProfile]);

  // Giải phóng URL tạm của ảnh preview
  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview]
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      email: formData.email.trim(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      gender: Boolean(formData.gender),
    };

    const resultAction = await dispatch(updateProfileApi(payload));
    if (updateProfileApi.fulfilled.match(resultAction)) {
      alert('Cập nhật thông tin thành công!');
    } else {
      alert(resultAction.payload || 'Cập nhật thất bại!');
    }
  };

  // Tính năng ẩn: đổi avatar
  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh!');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      alert('Ảnh tối đa 2MB!');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    const resultAction = await dispatch(uploadAvatarApi(file));
    setUploading(false);
    if (uploadAvatarApi.fulfilled.match(resultAction)) {
      setAvatarPreview(null);
      alert('Đổi avatar thành công!');
    } else {
      setAvatarPreview(null);
      alert(resultAction.payload || 'Đổi avatar thất bại!');
    }
  };

  const ordersHistory = userProfile?.ordersHistory || [];
  const totalOrderPages = Math.ceil(ordersHistory.length / ORDERS_PER_PAGE);
  const safeOrderPage = Math.min(orderPage, Math.max(totalOrderPages, 1));
  const visibleOrders = ordersHistory.slice(
    (safeOrderPage - 1) * ORDERS_PER_PAGE,
    safeOrderPage * ORDERS_PER_PAGE
  );

  return (
    <div className="profile-page">
      <div className="section-heading-banner profile-banner">
        <h2>Profile</h2>
      </div>

      <div className="container">
        <div className="profile-top-section">
          <div className="profile-avatar-col">
            <button
              type="button"
              className={`avatar-upload ${uploading ? 'uploading' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Đổi avatar"
            >
              <img
                src={avatarPreview || userProfile?.avatar || DEFAULT_AVATAR}
                alt={userProfile?.name || 'User Avatar'}
                className="profile-avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
              <span className="avatar-overlay">
                <i className="fa-solid fa-camera"></i>
                {uploading ? 'Đang tải...' : 'Đổi avatar'}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarSelect}
            />
          </div>

          <form className="profile-form" onSubmit={handleUpdate}>
            <div className="profile-form-grid">
              <div className="form-group">
                <label htmlFor="prof-email">Email</label>
                <input
                  id="prof-email"
                  type="email"
                  name="email"
                  placeholder="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="prof-name">Name</label>
                <input
                  id="prof-name"
                  type="text"
                  name="name"
                  placeholder="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prof-phone">Phone</label>
                <input
                  id="prof-phone"
                  type="text"
                  name="phone"
                  placeholder="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prof-password">Password</label>
                <input
                  id="prof-password"
                  type="password"
                  name="password"
                  placeholder="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="profile-bottom-controls">
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

              <div className="profile-buttons">
                <Link to="/change-password" className="btn-outline-purple">
                  Change password
                </Link>
                <button type="submit" className="btn-submit-purple">
                  Update
                </button>
              </div>
            </div>
          </form>
        </div>

        <hr className="page-divider" />

        <div className="profile-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Order history
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'favourite' ? 'active' : ''}`}
            onClick={() => setActiveTab('favourite')}
          >
            Favourite
          </button>
        </div>

        {activeTab === 'orders' ? (
          <div className="order-history-list">
            {ordersHistory.length === 0 ? (
              <p className="empty-text">Chưa có lịch sử đặt hàng.</p>
            ) : (
              <>
                {visibleOrders.map((order) => (
                  <div key={order.id} className="order-block">
                    <p className="order-date-note">
                      + Orders have been placed on {formatDate(order.date)}
                    </p>
                    <div className="table-responsive">
                      <table className="carts-table order-table">
                        <thead>
                          <tr>
                            <th>order id</th>
                            <th>img</th>
                            <th>name</th>
                            <th>price</th>
                            <th>quantity</th>
                            <th>total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.orderDetail?.map((detail, idx) => (
                            <tr key={`${order.id}-${idx}`}>
                              <td>{order.id}</td>
                              <td>
                                <img
                                  src={resolveImage(detail, idx)}
                                  alt={detail.name}
                                  className="table-product-img"
                                  onError={handleImageError}
                                />
                              </td>
                              <td>{detail.name}</td>
                              <td>{detail.price}</td>
                              <td>
                                <span className="qty-display">{detail.quantity || 1}</span>
                              </td>
                              <td>{detail.price * (detail.quantity || 1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                <Pagination
                  current={safeOrderPage}
                  total={totalOrderPages}
                  onChange={setOrderPage}
                />
              </>
            )}
          </div>
        ) : (
          <div className="favourite-list-section">
            {productsFavorite.length === 0 ? (
              <p className="empty-text">Chưa có sản phẩm yêu thích.</p>
            ) : (
              <div className="product-grid">
                {productsFavorite.map((fav) => (
                  <ProductCard key={fav.id} product={fav} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
