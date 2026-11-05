import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavoriteApi } from '../redux/userReducer';
import { ACCESS_TOKEN } from '../services/config';
import { GOOGLE_SHOE_IMAGES, resolveGoogleProductImage } from '../utils/productImages';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productsFavorite } = useSelector((state) => state.userReducer);

  const isLiked = productsFavorite?.some((fav) => Number(fav.id) === Number(product.id));
  const imgUrl = resolveGoogleProductImage(product);

  const handleToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      alert('Vui lòng đăng nhập để thêm sản phẩm yêu thích!');
      navigate('/login');
      return;
    }
    dispatch(toggleFavoriteApi({ productId: product.id, isLiked }));
  };

  return (
    <div className="product-card">
      <div className="product-card-top">
        <button
          type="button"
          className={`favorite-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleToggleLike}
          aria-label="Toggle favorite"
        >
          <i className={isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
        </button>
        <Link to={`/detail/${product.id}`} className="product-img-wrap">
          <img
            src={imgUrl}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = GOOGLE_SHOE_IMAGES[0];
            }}
          />
        </Link>
        <div className="product-info">
          <h3 className="product-title">
            <Link to={`/detail/${product.id}`}>{product.name}</Link>
          </h3>
          <p className="product-short-desc">
            {product.shortDescription || 'short description'}
          </p>
        </div>
      </div>
      <div className="product-card-bottom">
        <Link to={`/detail/${product.id}`} className="btn-buy-now">
          Buy now
        </Link>
        <span className="product-price">{product.price}$</span>
      </div>
    </div>
  );
}
