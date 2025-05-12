import React from 'react';
import Home from '../components/Home';
import MemberCreate from '../components/MemberCreate';
import LoginPage from '../components/LoginPage';
import ProductList from '../components/ProductList';
import OrderPage from '../components/OrderPage';
import MyPage from '../components/MyPage';
import ProductCreate from '../components/ProductCreate';
import PrivateRouter from './PrivateRouter';
import { Route, Routes } from 'react-router-dom';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/member/create' element={<MemberCreate />} />
      <Route path='/login' element={<LoginPage />} />
      <Route
        path='/order/cart'
        element={<PrivateRouter element={<OrderPage />} />}
      />
      <Route path='/mypage' element={<PrivateRouter element={<MyPage />} />} />
      <Route
        path='/product/manage'
        element={
          <PrivateRouter element={<ProductList />} requiredRole='ADMIN' />
        }
      />
      <Route
        path='/product/create'
        element={
          <PrivateRouter element={<ProductCreate />} requiredRole='ADMIN' />
        }
      />
      <Route
        path='/order/manage'
        element={
          <PrivateRouter element={<ProductList />} requiredRole='ADMIN' />
        }
      />
      <Route
        path='/member/manage'
        element={
          <PrivateRouter element={<ProductList />} requiredRole='ADMIN' />
        }
      />
    </Routes>
  );
};

export default AppRouter;
