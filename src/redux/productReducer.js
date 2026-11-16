import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { http } from '../services/config';

const errorOf = (error) => error.response?.data?.message || error.message;

// GET /api/Product (Index & Search)
export const getProductsApi = createAsyncThunk(
  'product/getProductsApi',
  async (keyword = '', { rejectWithValue }) => {
    try {
      const url = keyword
        ? `/Product?keyword=${encodeURIComponent(keyword)}`
        : '/Product';
      const result = await http.get(url);
      return result.data.content;
    } catch (error) {
      return rejectWithValue(errorOf(error));
    }
  }
);

// GET /api/Product/getpaging?pageIndex=&pageSize=&keywords= (Tính năng ẩn: phân trang sản phẩm)
export const getProductPagingApi = createAsyncThunk(
  'product/getProductPagingApi',
  async ({ pageIndex = 1, pageSize = 9, keywords = '' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ pageIndex, pageSize });
      if (keywords) params.set('keywords', keywords);
      const result = await http.get(`/Product/getpaging?${params.toString()}`);
      return result.data.content; // { items, pageIndex, pageSize, totalRow, keywords }
    } catch (error) {
      return rejectWithValue(errorOf(error));
    }
  }
);

// GET /api/Product/getbyid?id={id} (Detail)
export const getProductByIdApi = createAsyncThunk(
  'product/getProductByIdApi',
  async (id, { rejectWithValue }) => {
    try {
      const result = await http.get(`/Product/getbyid?id=${id}`);
      return result.data.content;
    } catch (error) {
      return rejectWithValue(errorOf(error));
    }
  }
);

// GET /api/Product/getAllCategory (Search *)
export const getAllCategoryApi = createAsyncThunk(
  'product/getAllCategoryApi',
  async (_, { rejectWithValue }) => {
    try {
      const result = await http.get('/Product/getAllCategory');
      return result.data.content;
    } catch (error) {
      return rejectWithValue(errorOf(error));
    }
  }
);

// GET /api/Product/getProductByCategory?categoryId={categoryId} (Search *)
export const getProductByCategoryApi = createAsyncThunk(
  'product/getProductByCategoryApi',
  async (categoryId, { rejectWithValue }) => {
    try {
      const url = categoryId
        ? `/Product/getProductByCategory?categoryId=${encodeURIComponent(categoryId)}`
        : '/Product';
      const result = await http.get(url);
      return result.data.content;
    } catch (error) {
      return rejectWithValue(errorOf(error));
    }
  }
);

const parseList = (value) => {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Tính năng ẩn: lấy sản phẩm theo danh mục yêu thích.
 * Dựa vào danh sách sản phẩm đã like -> tìm danh mục xuất hiện nhiều nhất
 * (qua productList của getAllCategory) -> gọi getProductByCategory cho danh mục đó.
 */
export const getRecommendedByFavoriteApi = createAsyncThunk(
  'product/getRecommendedByFavoriteApi',
  async (favoriteProducts, { rejectWithValue }) => {
    try {
      const favoriteIds = new Set((favoriteProducts || []).map((p) => Number(p.id)));
      if (favoriteIds.size === 0) return { category: null, items: [] };

      const categoryResult = await http.get('/Product/getAllCategory');
      const categories = categoryResult.data.content || [];

      let best = null;
      categories.forEach((cat) => {
        const productIds = parseList(cat.productList).map(Number);
        const score = productIds.filter((id) => favoriteIds.has(id)).length;
        if (score > 0 && (!best || score > best.score)) {
          best = { id: cat.id, name: cat.category, score };
        }
      });
      if (!best) return { category: null, items: [] };

      const result = await http.get(
        `/Product/getProductByCategory?categoryId=${encodeURIComponent(best.id)}`
      );
      const items = (result.data.content || []).filter((p) => !favoriteIds.has(Number(p.id)));
      return { category: best, items };
    } catch (error) {
      return rejectWithValue(errorOf(error));
    }
  }
);

const initialState = {
  arrProduct: [],
  searchProducts: [],
  productDetail: null,
  categories: [],
  paging: { items: [], pageIndex: 1, pageSize: 9, totalRow: 0 },
  pagingLoading: false,
  recommended: { category: null, items: [] },
  loading: false,
  error: null,
};

const productReducer = createSlice({
  name: 'productReducer',
  initialState,
  reducers: {
    setSearchProducts: (state, action) => {
      state.searchProducts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProductsApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsApi.fulfilled, (state, action) => {
        state.loading = false;
        state.arrProduct = action.payload;
        state.searchProducts = action.payload;
      })
      .addCase(getProductsApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProductPagingApi.pending, (state) => {
        state.pagingLoading = true;
      })
      .addCase(getProductPagingApi.fulfilled, (state, action) => {
        state.pagingLoading = false;
        state.paging = action.payload;
      })
      .addCase(getProductPagingApi.rejected, (state, action) => {
        state.pagingLoading = false;
        state.error = action.payload;
      })
      .addCase(getProductByIdApi.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.productDetail = null;
      })
      .addCase(getProductByIdApi.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetail = action.payload;
      })
      .addCase(getProductByIdApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllCategoryApi.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(getProductByCategoryApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductByCategoryApi.fulfilled, (state, action) => {
        state.loading = false;
        state.searchProducts = action.payload;
      })
      .addCase(getProductByCategoryApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getRecommendedByFavoriteApi.fulfilled, (state, action) => {
        state.recommended = action.payload;
      });
  },
});

export const { setSearchProducts } = productReducer.actions;
export default productReducer.reducer;
