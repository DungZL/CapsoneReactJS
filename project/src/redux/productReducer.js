import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { http } from '../services/config';
import {
  normalizeProductListWithGoogleImage,
  normalizeProductWithGoogleImage,
} from '../utils/productImages';

// GET /api/Product (Index & Search)
export const getProductsApi = createAsyncThunk(
  'product/getProductsApi',
  async (keyword = '', { rejectWithValue }) => {
    try {
      const url = keyword
        ? `/Product?keyword=${encodeURIComponent(keyword)}`
        : '/Product';
      const result = await http.get(url);
      return normalizeProductListWithGoogleImage(result.data.content);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// GET /api/Product/getbyid?id={id} (Detail)
export const getProductByIdApi = createAsyncThunk(
  'product/getProductByIdApi',
  async (id, { rejectWithValue }) => {
    try {
      const result = await http.get(`/Product/getbyid?id=${id}`);
      return normalizeProductWithGoogleImage(result.data.content);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// GET /api/Product/getProductByCategory?categoryId={categoryId} (Search *)
export const getProductByCategoryApi = createAsyncThunk(
  'product/getProductByCategoryApi',
  async (categoryId, { rejectWithValue }) => {
    try {
      if (!categoryId) {
        const result = await http.get('/Product');
        return normalizeProductListWithGoogleImage(result.data.content);
      }
      const result = await http.get(
        `/Product/getProductByCategory?categoryId=${encodeURIComponent(categoryId)}`
      );
      return normalizeProductListWithGoogleImage(result.data.content);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  arrProduct: [],
  searchProducts: [],
  productDetail: null,
  categories: [],
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
      .addCase(getProductByIdApi.pending, (state) => {
        state.loading = true;
        state.error = null;
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
      });
  },
});

export const { setSearchProducts } = productReducer.actions;
export default productReducer.reducer;
