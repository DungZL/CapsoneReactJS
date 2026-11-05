import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { http, ACCESS_TOKEN, USER_LOGIN, CART_STORAGE } from '../services/config';
import {
  normalizeProductListWithGoogleImage,
  resolveGoogleProductImage,
} from '../utils/productImages';

const getStoredJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

// POST /api/Users/signup (Register)
export const signupApi = createAsyncThunk(
  'user/signupApi',
  async (userRegister, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/signup', userRegister);
      return result.data.content;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại!');
    }
  }
);

// POST /api/Users/signin (Login)
export const signinApi = createAsyncThunk(
  'user/signinApi',
  async (userLogin, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/signin', userLogin);
      const content = result.data.content;
      localStorage.setItem(ACCESS_TOKEN, content.accessToken);
      localStorage.setItem(USER_LOGIN, JSON.stringify(content));
      return content;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Email hoặc mật khẩu không đúng!');
    }
  }
);

// POST /api/Users/facebooklogin (Login Facebook)
export const facebookLoginApi = createAsyncThunk(
  'user/facebookLoginApi',
  async (facebookToken, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/facebooklogin', { facebookToken });
      const content = result.data.content;
      localStorage.setItem(ACCESS_TOKEN, content.accessToken);
      localStorage.setItem(USER_LOGIN, JSON.stringify(content));
      return content;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập Facebook thất bại!');
    }
  }
);

// POST /api/Users/getProfile (Profile)
export const getProfileApi = createAsyncThunk(
  'user/getProfileApi',
  async (_, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/getProfile');
      return result.data.content;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải thông tin cá nhân!');
    }
  }
);

// POST /api/Users/updateProfile (Profile)
export const updateProfileApi = createAsyncThunk(
  'user/updateProfileApi',
  async (profileData, { dispatch, rejectWithValue }) => {
    try {
      const result = await http.post('/Users/updateProfile', profileData);
      await dispatch(getProfileApi());
      return result.data.content;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cập nhật thông tin thất bại!');
    }
  }
);

// GET /api/Users/getproductfavorite (Index * & Profile)
export const getProductFavoriteApi = createAsyncThunk(
  'user/getProductFavoriteApi',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) return { productsFavorite: [] };
      const result = await http.get('/Users/getproductfavorite');
      return result.data.content;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// GET /api/Users/like & /api/Users/unlike
export const toggleFavoriteApi = createAsyncThunk(
  'user/toggleFavoriteApi',
  async ({ productId, isLiked }, { dispatch, rejectWithValue }) => {
    try {
      const endpoint = isLiked
        ? `/Users/unlike?productId=${productId}`
        : `/Users/like?productId=${productId}`;
      await http.get(endpoint);
      await dispatch(getProductFavoriteApi());
      return { productId, isLiked: !isLiked };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// POST /api/Users/order (Carts)
export const submitOrderApi = createAsyncThunk(
  'user/submitOrderApi',
  async (orderPayload, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/order', orderPayload);
      return result.data.content;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đặt hàng thất bại!');
    }
  }
);

const initialState = {
  userLogin: getStoredJson(USER_LOGIN, null),
  userProfile: null,
  productsFavorite: [],
  carts: getStoredJson(CART_STORAGE, []),
  loading: false,
  error: null,
};

const saveCarts = (carts) => {
  localStorage.setItem(CART_STORAGE, JSON.stringify(carts));
};

const userReducer = createSlice({
  name: 'userReducer',
  initialState,
  reducers: {
    logoutAction: (state) => {
      state.userLogin = null;
      state.userProfile = null;
      state.productsFavorite = [];
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(USER_LOGIN);
    },
    addToCartAction: (state, action) => {
      const { product, quantity } = action.payload;
      const index = state.carts.findIndex((item) => item.id === product.id);
      if (index !== -1) {
        state.carts[index].quantity += quantity;
        state.carts[index].image = resolveGoogleProductImage(product);
      } else {
        state.carts.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: resolveGoogleProductImage(product),
          quantity: quantity,
          checked: true,
        });
      }
      saveCarts(state.carts);
    },
    changeCartQuantityAction: (state, action) => {
      const { id, delta } = action.payload;
      const index = state.carts.findIndex((item) => item.id === id);
      if (index !== -1) {
        const nextQty = state.carts[index].quantity + delta;
        if (nextQty >= 1) {
          state.carts[index].quantity = nextQty;
        }
      }
      saveCarts(state.carts);
    },
    deleteCartItemAction: (state, action) => {
      const id = action.payload;
      state.carts = state.carts.filter((item) => item.id !== id);
      saveCarts(state.carts);
    },
    toggleCheckCartItemAction: (state, action) => {
      const id = action.payload;
      const index = state.carts.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.carts[index].checked = !state.carts[index].checked;
      }
      saveCarts(state.carts);
    },
    toggleCheckAllCartAction: (state, action) => {
      const checked = action.payload;
      state.carts.forEach((item) => {
        item.checked = checked;
      });
      saveCarts(state.carts);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signinApi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signinApi.fulfilled, (state, action) => {
        state.loading = false;
        state.userLogin = action.payload;
      })
      .addCase(signinApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(facebookLoginApi.fulfilled, (state, action) => {
        state.loading = false;
        state.userLogin = action.payload;
      })
      .addCase(getProfileApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfileApi.fulfilled, (state, action) => {
        state.loading = false;
        const profile = action.payload;
        if (profile && Array.isArray(profile.ordersHistory)) {
          profile.ordersHistory = profile.ordersHistory.map((order) => ({
            ...order,
            orderDetail: Array.isArray(order.orderDetail)
              ? order.orderDetail.map((item) => ({
                  ...item,
                  image: resolveGoogleProductImage(item),
                }))
              : [],
          }));
        }
        state.userProfile = profile;
        if (profile?.email && state.userLogin) {
          state.userLogin = { ...state.userLogin, email: profile.email };
          localStorage.setItem(USER_LOGIN, JSON.stringify(state.userLogin));
        }
      })
      .addCase(getProfileApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProductFavoriteApi.fulfilled, (state, action) => {
        state.productsFavorite = normalizeProductListWithGoogleImage(
          action.payload?.productsFavorite || []
        );
      })
      .addCase(submitOrderApi.fulfilled, (state, action) => {
        const orderedIds = action.meta.arg.orderDetail.map((d) => Number(d.productId));
        state.carts = state.carts.filter((item) => !orderedIds.includes(Number(item.id)));
        saveCarts(state.carts);
      });
  },
});

export const {
  logoutAction,
  addToCartAction,
  changeCartQuantityAction,
  deleteCartItemAction,
  toggleCheckCartItemAction,
  toggleCheckAllCartAction,
} = userReducer.actions;

export default userReducer.reducer;
