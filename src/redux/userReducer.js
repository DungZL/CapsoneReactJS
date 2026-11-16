import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { http, ACCESS_TOKEN, USER_LOGIN, CART_STORAGE } from '../services/config';
import { resolveImage } from '../utils/productImages';

const getStoredJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const messageOf = (error, fallback) => error.response?.data?.message || fallback;

// Mỗi dòng giỏ hàng = 1 sản phẩm + 1 size
export const cartKeyOf = (id, size) => (size ? `${id}_${size}` : String(id));

const saveLogin = (content) => {
  localStorage.setItem(ACCESS_TOKEN, content.accessToken);
  localStorage.setItem(USER_LOGIN, JSON.stringify(content));
};

// POST /api/Users/signup (Register)
export const signupApi = createAsyncThunk(
  'user/signupApi',
  async (userRegister, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/signup', userRegister);
      return result.data.content;
    } catch (error) {
      return rejectWithValue(messageOf(error, 'Đăng ký thất bại!'));
    }
  }
);

// POST /api/Users/signin (Login)
export const signinApi = createAsyncThunk(
  'user/signinApi',
  async (userLogin, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/signin', userLogin);
      saveLogin(result.data.content);
      return result.data.content;
    } catch (error) {
      return rejectWithValue(messageOf(error, 'Email hoặc mật khẩu không đúng!'));
    }
  }
);

// POST /api/Users/facebooklogin (Login Facebook)
export const facebookLoginApi = createAsyncThunk(
  'user/facebookLoginApi',
  async (facebookToken, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/facebooklogin', { facebookToken });
      saveLogin(result.data.content);
      return result.data.content;
    } catch (error) {
      return rejectWithValue(messageOf(error, 'Đăng nhập Facebook thất bại!'));
    }
  }
);

// POST /api/Users/getProfile (Profile)
// Đề ghi getProfileV2 nhưng server hiện trả 404 cho endpoint đó, swagger chỉ còn getProfile.
export const getProfileApi = createAsyncThunk(
  'user/getProfileApi',
  async (_, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/getProfile');
      return result.data.content;
    } catch (error) {
      return rejectWithValue(messageOf(error, 'Không thể tải thông tin cá nhân!'));
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
      return rejectWithValue(messageOf(error, 'Cập nhật thông tin thất bại!'));
    }
  }
);

// POST /api/Users/changePassword { newPassword } (Tính năng ẩn: đổi mật khẩu)
export const changePasswordApi = createAsyncThunk(
  'user/changePasswordApi',
  async (newPassword, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/changePassword', { newPassword });
      return result.data.content;
    } catch (error) {
      return rejectWithValue(messageOf(error, 'Đổi mật khẩu thất bại!'));
    }
  }
);

// POST /api/Users/uploadavatar (multipart/form-data) (Tính năng ẩn: đổi avatar)
export const uploadAvatarApi = createAsyncThunk(
  'user/uploadAvatarApi',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await http.post('/Users/uploadavatar', formData);
      await dispatch(getProfileApi());
      return result.data.content;
    } catch (error) {
      return rejectWithValue(messageOf(error, 'Đổi avatar thất bại!'));
    }
  }
);

// GET /api/Users/getproductfavorite (Index * & Profile)
export const getProductFavoriteApi = createAsyncThunk(
  'user/getProductFavoriteApi',
  async (_, { rejectWithValue }) => {
    try {
      if (!localStorage.getItem(ACCESS_TOKEN)) return { productsFavorite: [] };
      const result = await http.get('/Users/getproductfavorite');
      return result.data.content;
    } catch (error) {
      return rejectWithValue(messageOf(error, error.message));
    }
  }
);

// GET /api/Users/like & /api/Users/unlike
export const toggleFavoriteApi = createAsyncThunk(
  'user/toggleFavoriteApi',
  async ({ productId, isLiked }, { dispatch, rejectWithValue }) => {
    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      await http.get(`/Users/${endpoint}?productId=${productId}`);
      await dispatch(getProductFavoriteApi());
      return { productId, isLiked: !isLiked };
    } catch (error) {
      return rejectWithValue(messageOf(error, error.message));
    }
  }
);

// POST /api/Users/order (Carts)
// arg: { payload: { orderDetail, email }, keys: [cartKey...] }
export const submitOrderApi = createAsyncThunk(
  'user/submitOrderApi',
  async ({ payload }, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/order', payload);
      return result.data.content;
    } catch (error) {
      return rejectWithValue(messageOf(error, 'Đặt hàng thất bại!'));
    }
  }
);

// Giỏ hàng cũ (trước khi có size) chưa có key -> bổ sung
const loadCarts = () =>
  getStoredJson(CART_STORAGE, []).map((item) => ({
    ...item,
    key: item.key || cartKeyOf(item.id, item.size),
  }));

const initialState = {
  userLogin: getStoredJson(USER_LOGIN, null),
  userProfile: null,
  productsFavorite: [],
  carts: loadCarts(),
  loading: false,
  error: null,
};

const saveCarts = (carts) => {
  localStorage.setItem(CART_STORAGE, JSON.stringify(carts));
};

const findCartItem = (state, key) => state.carts.find((item) => item.key === key);

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
      const { product, quantity, size } = action.payload;
      const key = cartKeyOf(product.id, size);
      const existing = findCartItem(state, key);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.carts.push({
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          image: resolveImage(product, product.id),
          size: size ?? null,
          quantity,
          checked: true,
        });
      }
      saveCarts(state.carts);
    },
    changeCartQuantityAction: (state, action) => {
      const { key, delta } = action.payload;
      const item = findCartItem(state, key);
      if (item && item.quantity + delta >= 1) {
        item.quantity += delta;
        saveCarts(state.carts);
      }
    },
    deleteCartItemAction: (state, action) => {
      state.carts = state.carts.filter((item) => item.key !== action.payload);
      saveCarts(state.carts);
    },
    toggleCheckCartItemAction: (state, action) => {
      const item = findCartItem(state, action.payload);
      if (item) {
        item.checked = !item.checked;
        saveCarts(state.carts);
      }
    },
    toggleCheckAllCartAction: (state, action) => {
      state.carts.forEach((item) => {
        item.checked = action.payload;
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
        state.productsFavorite = action.payload?.productsFavorite || [];
      })
      .addCase(submitOrderApi.fulfilled, (state, action) => {
        const orderedKeys = action.meta.arg.keys;
        state.carts = state.carts.filter((item) => !orderedKeys.includes(item.key));
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
