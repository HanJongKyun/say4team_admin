import React from 'react';
import Home from '../components/Home';
import MemberCreate from '../components/MemberCreate';
import LoginPage from '../components/LoginPage';
import ProductList from '../components/ProductList';
import MyPage from '../components/MyPage';
import ProductCreate from '../components/ProductCreate';
import PrivateRouter from './PrivateRouter';
import { Route, Routes } from 'react-router-dom';
import ProductDetail from '../components/ProductDetail';
import ProductUpdate from '../components/ProductUpdate';
import MemberList from '../components/MemberList';
import OrderList from '../components/OrderList';
import CategoryList from '../components/CategoryList';

const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/member/create' element={<MemberCreate />} />
      <Route path='/login' element={<LoginPage />} />
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
        path='/product/edit/:id'
        element={
          <PrivateRouter element={<ProductUpdate />} requiredRole='ADMIN' />
        }
      />
      <Route
        path='/product/detail/:id'
        element={
          <PrivateRouter element={<ProductDetail />} requiredRole='ADMIN' />
        }
      />
      <Route
        path='/order/manage'
        element={<PrivateRouter element={<OrderList />} requiredRole='ADMIN' />}
      />
      <Route
        path='/member/manage'
        element={
          <PrivateRouter element={<MemberList />} requiredRole='ADMIN' />
        }
      />
      <Route
        path='/category/manage'
        element={
          <PrivateRouter element={<CategoryList />} requiredRole='ADMIN' />
        }
      />
      <Route
        path='/category/create'
        element={
          <PrivateRouter element={<ProductCreate />} requiredRole='ADMIN' />
        }
      />
      <Route
        path='/category/edit/:id'
        element={
          <PrivateRouter element={<ProductUpdate />} requiredRole='ADMIN' />
        }
      />
    </Routes>
  );
};

export default AppRouter;
