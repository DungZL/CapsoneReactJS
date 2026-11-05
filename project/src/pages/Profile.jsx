import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import {
  getProfileApi,
  updateProfileApi,
  getProductFavoriteApi,
} from '../redux/userReducer';
import { ACCESS_TOKEN } from '../services/config';
import { GOOGLE_SHOE_IMAGES, resolveGoogleProductImage } from '../utils/productImages';
import ProductCard from '../components/ProductCard';

export default function Profile() {
  const dispatch = useDispatch();
  const { userLogin, userProfile, productsFavorite } = useSelector(
    (state) => state.userReducer
  );

  const [activeTab, setActiveTab] = useState('orders');
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

  const ordersHistory = userProfile?.ordersHistory || [];

  return (
    <div className="profile-page">
      <div className="section-heading-banner profile-banner">
        <h2>Profile</h2>
      </div>

      <div className="container">
        <div className="profile-top-section">
          <div className="profile-avatar-col">
            <img
              src={userProfile?.avatar || 'https://i.pravatar.cc/225'}
              alt={userProfile?.name || 'User Avatar'}
              className="profile-avatar"
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

              <button type="submit" className="btn-submit-purple">
                Update
              </button>
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
              ordersHistory.map((order) => (
                <div key={order.id} className="order-block">
                  <p className="order-date-note">
                    + Orders have been placed on {order.date}
                  </p>
                  <div className="table-responsive">
                    <table className="carts-table order-table">
                      <thead>
                        <tr>
                          <th>id</th>
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
                                src={resolveGoogleProductImage(detail)}
                                alt={detail.name}
                                className="table-product-img"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = GOOGLE_SHOE_IMAGES[0];
                                }}
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
              ))
            )}
          </div>
        ) : (
          <div className="favourite-list-section">
            {productsFavorite.length === 0 ? (
              <p className="empty-text">Chưa có sản phẩm yêu thích.</p>
            ) : (
              <div className="product-grid">
                {productsFavorite.map((fav) => (
                  <ProductCard
                    key={fav.id}
                    product={{
                      ...fav,
                      price: fav.price || 85,
                      shortDescription: fav.shortDescription || '',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
