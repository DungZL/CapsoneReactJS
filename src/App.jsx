import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomeTemplate from './templates/HomeTemplate';
import Index from './pages/Index';
import Detail from './pages/Detail';
import Carts from './pages/Carts';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Search from './pages/Search';
import ChangePassword from './pages/ChangePassword';
// The Leaflet map page is heavy -> load it on demand
const Stores = lazy(() => import('./pages/Stores'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeTemplate />}>
          <Route index element={<Index />} />
          <Route path="index" element={<Index />} />
          <Route path="detail">
            <Route path=":id" element={<Detail />} />
          </Route>
          <Route path="carts" element={<Carts />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="profile" element={<Profile />} />
          <Route path="search" element={<Search />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route
            path="stores"
            element={
              <Suspense fallback={<div className="container loading-state">Loading map...</div>}>
                <Stores />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
