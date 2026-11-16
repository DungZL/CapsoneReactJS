import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductByIdApi } from '../redux/productReducer';
import { addToCartAction, getProductFavoriteApi } from '../redux/userReducer';
import { ACCESS_TOKEN } from '../services/config';
import { resolveImage, handleImageError } from '../utils/productImages';
import ProductCard from '../components/ProductCard';

export default function Detail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productDetail, loading } = useSelector((state) => state.productReducer);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    dispatch(getProductByIdApi(id));
    if (localStorage.getItem(ACCESS_TOKEN)) {
      dispatch(getProductFavoriteApi());
    }
  }, [id, dispatch]);

  useEffect(() => {
    setSelectedSize(productDetail?.size?.length ? productDetail.size[0] : null);
  }, [productDetail]);

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!productDetail) return;
    if (!localStorage.getItem(ACCESS_TOKEN)) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      navigate('/login');
      return;
    }
    dispatch(
      addToCartAction({
        product: productDetail,
        quantity,
        size: selectedSize,
      })
    );
    alert(`Đã thêm ${quantity} x ${productDetail.name}${selectedSize ? ` (size ${selectedSize})` : ''} vào giỏ hàng!`);
  };

  if (loading && !productDetail) {
    return <div className="container loading-state">Loading product detail...</div>;
  }

  if (!productDetail) {
    return <div className="container loading-state">Product not found.</div>;
  }

  return (
    <div className="detail-page">
      <section className="container detail-top">
        <div className="detail-image-box">
          <img
            src={resolveImage(productDetail, productDetail.id)}
            alt={productDetail.name}
            onError={handleImageError}
          />
        </div>
        <div className="detail-info-box">
          <h1 className="detail-title">{productDetail.name}</h1>
          <p className="detail-description">{productDetail.description}</p>

          <div className="detail-size-section">
            <h4 className="available-size-title">Available size</h4>
            <div className="size-list">
              {productDetail.size?.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  className={`size-btn ${selectedSize === sz ? 'active' : ''}`}
                  onClick={() => setSelectedSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="detail-price">{productDetail.price}$</div>

          <div className="detail-quantity-controls">
            <button type="button" className="qty-btn" onClick={handleIncrease}>
              +
            </button>
            <span className="qty-value">{quantity}</span>
            <button type="button" className="qty-btn" onClick={handleDecrease}>
              -
            </button>
          </div>

          <button type="button" className="btn-add-to-cart" onClick={handleAddToCart}>
            Add to cart
          </button>
        </div>
      </section>

      <section className="container related-products-section">
        <h2 className="related-heading">- Related Product -</h2>
        <div className="product-grid">
          {productDetail.relatedProducts?.map((relItem) => (
            <ProductCard key={relItem.id} product={relItem} />
          ))}
        </div>
      </section>
    </div>
  );
}
