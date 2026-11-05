import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProductsApi } from '../redux/productReducer';
import { getProductFavoriteApi } from '../redux/userReducer';
import { ACCESS_TOKEN } from '../services/config';
import { GOOGLE_SHOE_IMAGES, resolveGoogleProductImage } from '../utils/productImages';
import ProductCard from '../components/ProductCard';

export default function Index() {
  const dispatch = useDispatch();
  const { arrProduct, loading } = useSelector((state) => state.productReducer);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    dispatch(getProductsApi(''));
    if (localStorage.getItem(ACCESS_TOKEN)) {
      dispatch(getProductFavoriteApi());
    }
  }, [dispatch]);

  const carouselItems = arrProduct.slice(0, 4);

  const handlePrev = () => {
    if (!carouselItems.length) return;
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!carouselItems.length) return;
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };

  const activeBanner = carouselItems[currentSlide];

  return (
    <div className="index-page">
      {/* Carousel Banner */}
      {activeBanner && (
        <section className="hero-carousel">
          <button
            type="button"
            className="carousel-arrow arrow-left"
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div className="container carousel-inner">
            <div className="carousel-image">
              <img
                src={resolveGoogleProductImage(activeBanner)}
                alt={activeBanner.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = GOOGLE_SHOE_IMAGES[0];
                }}
              />
            </div>
            <div className="carousel-info">
              <h1 className="carousel-title">{activeBanner.name}</h1>
              <p className="carousel-desc">
                {activeBanner.shortDescription || activeBanner.description}
              </p>
              <Link to={`/detail/${activeBanner.id}`} className="btn-carousel-buy">
                Buy now
              </Link>
            </div>
          </div>
          <button
            type="button"
            className="carousel-arrow arrow-right"
            onClick={handleNext}
            aria-label="Next slide"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
          <div className="carousel-dots">
            {carouselItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                className={`dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Product Feature Section */}
      <section className="product-feature-section">
        <div className="section-heading-banner">
          <h2>Product Feature</h2>
        </div>
        <div className="container">
          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : (
            <div className="product-grid">
              {arrProduct.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
