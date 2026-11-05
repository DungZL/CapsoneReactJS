import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  changeCartQuantityAction,
  deleteCartItemAction,
  toggleCheckCartItemAction,
  toggleCheckAllCartAction,
  submitOrderApi,
  getProfileApi,
} from '../redux/userReducer';
import { ACCESS_TOKEN } from '../services/config';
import { GOOGLE_SHOE_IMAGES, resolveGoogleProductImage } from '../utils/productImages';

export default function Carts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { carts, userLogin, userProfile } = useSelector((state) => state.userReducer);

  const token = localStorage.getItem(ACCESS_TOKEN);
  const isAuthenticated = Boolean(userLogin && token);

  useEffect(() => {
    if (isAuthenticated && !userProfile?.email && !userLogin?.email) {
      dispatch(getProfileApi());
    }
  }, [isAuthenticated, userProfile, userLogin, dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allChecked = carts.length > 0 && carts.every((item) => item.checked);

  const handleCheckAll = (e) => {
    dispatch(toggleCheckAllCartAction(e.target.checked));
  };

  const handleSubmitOrder = async () => {
    const selectedItems = carts.filter((item) => item.checked);
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng!');
      return;
    }

    const email = userLogin?.email || userProfile?.email;
    if (!email) {
      alert('Không tìm thấy thông tin email tài khoản, vui lòng đăng nhập lại!');
      return;
    }

    const payload = {
      orderDetail: selectedItems.map((item) => ({
        productId: String(item.id),
        quantity: Number(item.quantity),
      })),
      email,
    };

    const actionResult = await dispatch(submitOrderApi(payload));
    if (submitOrderApi.fulfilled.match(actionResult)) {
      alert('Đặt hàng thành công!');
      navigate('/profile');
    } else {
      alert(actionResult.payload || 'Đặt hàng thất bại!');
    }
  };

  return (
    <div className="carts-page container">
      <h1 className="page-title">Carts</h1>
      <hr className="page-divider" />

      <div className="table-responsive">
        <table className="carts-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleCheckAll}
                  aria-label="Select all"
                />
              </th>
              <th>id</th>
              <th>img</th>
              <th>name</th>
              <th>price</th>
              <th>quantity</th>
              <th>total</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {carts.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-cart-cell">
                  Giỏ hàng trống.
                </td>
              </tr>
            ) : (
              carts.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={Boolean(item.checked)}
                      onChange={() => dispatch(toggleCheckCartItemAction(item.id))}
                    />
                  </td>
                  <td>{item.id}</td>
                  <td>
                    <img
                      src={resolveGoogleProductImage(item)}
                      alt={item.name}
                      className="table-product-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = GOOGLE_SHOE_IMAGES[0];
                      }}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>{item.price}</td>
                  <td>
                    <div className="table-qty-group">
                      <button
                        type="button"
                        className="btn-qty-sm"
                        onClick={() =>
                          dispatch(changeCartQuantityAction({ id: item.id, delta: 1 }))
                        }
                      >
                        +
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        type="button"
                        className="btn-qty-sm"
                        onClick={() =>
                          dispatch(changeCartQuantityAction({ id: item.id, delta: -1 }))
                        }
                      >
                        -
                      </button>
                    </div>
                  </td>
                  <td>{item.price * item.quantity}</td>
                  <td>
                    <div className="action-btn-group">
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => navigate(`/detail/${item.id}`)}
                      >
                        EDIT
                      </button>
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => dispatch(deleteCartItemAction(item.id))}
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {carts.length > 0 && (
        <div className="carts-footer-actions">
          <button type="button" className="btn-submit-order" onClick={handleSubmitOrder}>
            SUBMIT ORDER
          </button>
        </div>
      )}
    </div>
  );
}
