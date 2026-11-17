import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getProductsApi,
  getProductPagingApi,
  getRecommendedByFavoriteApi,
} from '../redux/productReducer';
import { getProductFavoriteApi } from '../redux/userReducer';
import { ACCESS_TOKEN } from '../services/config';
import { resolveImage, handleImageError } from '../utils/productImages';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 9;

export default function Index() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { arrProduct, paging, pagingLoading, recommended } = useSelector(
    (state) => state.productReducer
  );
  const { productsFavorite, userLogin } = useSelector((state) => state.userReducer);
  const [currentSlide, setCurrentSlide] = useState(0);

  const pageIndex = Math.max(1, Number(searchParams.get('page')) || 1);
  const isLoggedIn = Boolean(userLogin && localStorage.getItem(ACCESS_TOKEN));

  useEffect(() => {
    dispatch(getProductsApi(''));
    if (localStorage.getItem(ACCESS_TOKEN)) {
      dispatch(getProductFavoriteApi());
    }
  }, [dispatch]);

  // Hidden feature: product pagination via the getpaging API
  useEffect(() => {
    dispatch(getProductPagingApi({ pageIndex, pageSize: PAGE_SIZE }));
  }, [pageIndex, dispatch]);

  // Hidden feature: products from the favorite category
  useEffect(() => {
    if (isLoggedIn && productsFavorite.length) {
      dispatch(getRecommendedByFavoriteApi(productsFavorite));
    }
  }, [isLoggedIn, productsFavorite, dispatch]);

  const carouselItems = arrProduct.slice(0, 4);
  const activeBanner = carouselItems[currentSlide];
  const totalPages = Math.ceil((paging.totalRow || 0) / PAGE_SIZE);

  const handlePrev = () => {
    if (!carouselItems.length) return;
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!carouselItems.length) return;
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };

  const handlePageChange = (page) => {
    setSearchParams(page === 1 ? {} : { page: String(page) });
    document.getElementById('product-feature')?.scrollIntoView({ behavior: 'smooth' });
  };

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
                src={resolveImage(activeBanner, activeBanner.id)}
                alt={activeBanner.name || 'Shoe product'}
                onError={handleImageError}
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
                aria-current={idx === currentSlide ? 'true' : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recommendations by favorite category (only when logged in and has favorites) */}
      {isLoggedIn && productsFavorite.length > 0 && recommended.items.length > 0 && (
        <section className="product-feature-section">
          <div className="section-heading-banner">
            <h2>Recommended for you</h2>
          </div>
          <div className="container">
            <p className="section-note">
              Because you like products in the <strong>{recommended.category?.name}</strong> category
            </p>
            <div className="product-grid">
              {recommended.items.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Feature Section */}
      <section className="product-feature-section" id="product-feature">
        <div className="section-heading-banner">
          <h2>Product Feature</h2>
        </div>
        <div className="container">
          {pagingLoading && !paging.items.length ? (
            <div className="loading-state">Loading products...</div>
          ) : (
            <div className={`product-grid ${pagingLoading ? 'is-loading' : ''}`}>
              {paging.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <Pagination current={pageIndex} total={totalPages} onChange={handlePageChange} />
        </div>
      </section>
    </div>
  );
}
