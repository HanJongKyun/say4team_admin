import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthContextProvider } from './context/UserContext';
import './App.css';
import { CartContextProvider } from './context/CartContext';
import AppRouter from './router/AppRouter';

const App = () => {
  return (
    <AuthContextProvider>
      <CartContextProvider>
        <div className='App'>
          <Header />
          <div className='content-wrapper'>
            <AppRouter />
          </div>
          <Footer />
        </div>
      </CartContextProvider>
    </AuthContextProvider>
  );
};

export default App;
