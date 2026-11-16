import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import _ from 'lodash';
import {
  getProductsApi,
  getAllCategoryApi,
  getProductByCategoryApi,
  setSearchProducts,
} from '../redux/productReducer';
import { getProductFavoriteApi } from '../redux/userReducer';
import { ACCESS_TOKEN } from '../services/config';
import ProductCard from '../components/ProductCard';

export default function Search() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchProducts, categories, loading } = useSelector(
    (state) => state.productReducer
  );

  const initialKeyword = searchParams.get('keyword') || '';
  const initialCategory = searchParams.get('category') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOrder, setSortOrder] = useState('');

  useEffect(() => {
    dispatch(getAllCategoryApi());
    if (localStorage.getItem(ACCESS_TOKEN)) {
      dispatch(getProductFavoriteApi());
    }
  }, [dispatch]);

  useEffect(() => {
    const kw = searchParams.get('keyword') || '';
    const cat = searchParams.get('category') || '';
    setKeyword(kw);
    setSelectedCategory(cat);

    if (cat) {
      dispatch(getProductByCategoryApi(cat));
    } else {
      dispatch(getProductsApi(kw));
    }
  }, [searchParams, dispatch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSelectedCategory('');
    setSortOrder('');
    setSearchParams(keyword.trim() ? { keyword: keyword.trim() } : {});
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setKeyword('');
    setSortOrder('');
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const handleSortPrice = (order) => {
    setSortOrder(order);
    if (!order) return;
    const sorted = _.orderBy(
      searchProducts,
      ['price'],
      [order === 'decrease' ? 'desc' : 'asc']
    );
    dispatch(setSearchProducts(sorted));
  };

  return (
    <div className="search-page">
      <div className="container search-top-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <div className="search-input-group">
            <label htmlFor="search-keyword">Search</label>
            <div className="search-controls-row">
              <input
                id="search-keyword"
                type="text"
                placeholder="product name ..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button type="submit" className="btn-submit-purple">
                SEARCH
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="section-heading-banner">
        <h2>Search result</h2>
      </div>

      <div className="container search-results-body">
        <div className="search-filters-row">
          <div className="filter-box">
            <label htmlFor="price-sort-select">Price</label>
            <div className="price-sort-controls">
              <select
                id="price-sort-select"
                className="filter-select"
                value={sortOrder}
                onChange={(e) => handleSortPrice(e.target.value)}
              >
                <option value="">-- Select price sort --</option>
                <option value="decrease">decrease</option>
                <option value="ascending">ascending</option>
              </select>
              <button
                type="button"
                className={`sort-quick-btn ${sortOrder === 'ascending' ? 'active' : ''}`}
                onClick={() => handleSortPrice('ascending')}
              >
                ascending
              </button>
            </div>
          </div>

          <div className="filter-box">
            <label htmlFor="category-select">Category</label>
            <select
              id="category-select"
              className="filter-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Searching products...</div>
        ) : searchProducts.length === 0 ? (
          <p className="empty-text">Không tìm thấy sản phẩm phù hợp.</p>
        ) : (
          <div className="product-grid">
            {searchProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
