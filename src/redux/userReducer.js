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

// Each cart row = 1 product + 1 size
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
      return rejectWithValue(messageOf(error, 'Registration failed!'));
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
      return rejectWithValue(messageOf(error, 'Incorrect email or password!'));
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
      return rejectWithValue(messageOf(error, 'Facebook login failed!'));
    }
  }
);

// POST /api/Users/getProfile (Profile)
// The spec says getProfileV2, but the server returns 404 for it; swagger only lists getProfile.
export const getProfileApi = createAsyncThunk(
  'user/getProfileApi',
  async (_, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/getProfile');
      return result.data.content;
    } catch (error) {
      return rejectWithValue(messageOf(error, 'Could not load profile information!'));
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
      return rejectWithValue(messageOf(error, 'Failed to update profile!'));
    }
  }
);

// POST /api/Users/changePassword { newPassword } (Hidden feature: change password)
export const changePasswordApi = createAsyncThunk(
  'user/changePasswordApi',
  async (newPassword, { rejectWithValue }) => {
    try {
      const result = await http.post('/Users/changePassword', { newPassword });
      return result.data.content;
    } catch (error) {
      return rejectWithValue(messageOf(error, 'Failed to change password!'));
    }
  }
);

// POST /api/Users/uploadavatar (multipart/form-data) (Hidden feature: change avatar)
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
      return rejectWithValue(messageOf(error, 'Failed to change avatar!'));
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
      return rejectWithValue(messageOf(error, 'Failed to place order!'));
    }
  }
);

// Each account has its own cart in localStorage: "carts_<email>"
const cartStorageKey = (email) =>
  email ? `${CART_STORAGE}_${String(email).trim().toLowerCase()}` : null;

// Old carts (before sizes existed) have no key -> add one
const loadCarts = (email) => {
  const storageKey = cartStorageKey(email);
  if (!storageKey) return [];
  return getStoredJson(storageKey, []).map((item) => ({
    ...item,
    key: item.key || cartKeyOf(item.id, item.size),
  }));
};

const writeCarts = (email, carts) => {
  const storageKey = cartStorageKey(email);
  if (storageKey) localStorage.setItem(storageKey, JSON.stringify(carts));
};

// Merge cart rows of the same product + size (used when the account email is learned late)
const mergeCarts = (base, extra) => {
  const merged = base.map((item) => ({ ...item }));
  extra.forEach((item) => {
    const existing = merged.find((row) => row.key === item.key);
    if (existing) existing.quantity += item.quantity;
    else merged.push({ ...item });
  });
  return merged;
};

// The old shared "carts" key belonged to nobody in particular:
// hand it to the user currently logged in (if they have no cart yet), then remove it.
const migrateLegacyCart = (userLogin) => {
  try {
    const legacy = getStoredJson(CART_STORAGE, null);
    if (!Array.isArray(legacy)) return;
    const storageKey = cartStorageKey(userLogin?.email);
    if (storageKey && localStorage.getItem(storageKey) === null) {
      localStorage.setItem(storageKey, JSON.stringify(legacy));
    }
    localStorage.removeItem(CART_STORAGE);
  } catch {
    // localStorage unavailable -> nothing to migrate
  }
};

const storedLogin = getStoredJson(USER_LOGIN, null);
migrateLegacyCart(storedLogin);

const initialState = {
  userLogin: storedLogin,
  userProfile: null,
  productsFavorite: [],
  carts: loadCarts(storedLogin?.email),
  loading: false,
  error: null,
};

const saveCarts = (state) => {
  writeCarts(state.userLogin?.email, state.carts);
};

// After login: show only the cart that belongs to this account
const setLoggedInUser = (state, userLogin) => {
  state.userLogin = userLogin;
  state.carts = loadCarts(userLogin?.email);
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
      // The cart stays saved under the account's key; just hide it from the next user
      state.carts = [];
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
      saveCarts(state);
    },
    changeCartQuantityAction: (state, action) => {
      const { key, delta } = action.payload;
      const item = findCartItem(state, key);
      if (item && item.quantity + delta >= 1) {
        item.quantity += delta;
        saveCarts(state);
      }
    },
    deleteCartItemAction: (state, action) => {
      state.carts = state.carts.filter((item) => item.key !== action.payload);
      saveCarts(state);
    },
    toggleCheckCartItemAction: (state, action) => {
      const item = findCartItem(state, action.payload);
      if (item) {
        item.checked = !item.checked;
        saveCarts(state);
      }
    },
    toggleCheckAllCartAction: (state, action) => {
      state.carts.forEach((item) => {
        item.checked = action.payload;
      });
      saveCarts(state);
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
        setLoggedInUser(state, action.payload);
      })
      .addCase(signinApi.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(facebookLoginApi.fulfilled, (state, action) => {
        state.loading = false;
        setLoggedInUser(state, action.payload);
      })
      .addCase(getProfileApi.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfileApi.fulfilled, (state, action) => {
        state.loading = false;
        const profile = action.payload;
        state.userProfile = profile;
        if (profile?.email && state.userLogin) {
          const previousKey = cartStorageKey(state.userLogin.email);
          state.userLogin = { ...state.userLogin, email: profile.email };
          localStorage.setItem(USER_LOGIN, JSON.stringify(state.userLogin));
          // Login response had no email (e.g. Facebook): load this account's cart now,
          // keeping anything added before the email was known
          if (previousKey !== cartStorageKey(profile.email)) {
            const unsaved = previousKey ? [] : state.carts;
            state.carts = mergeCarts(loadCarts(profile.email), unsaved);
            saveCarts(state);
          }
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
        saveCarts(state);
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
