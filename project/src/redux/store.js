import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productReducer';
import userReducer from './userReducer';

export const store = configureStore({
  reducer: {
    productReducer,
    userReducer,
  },
});
