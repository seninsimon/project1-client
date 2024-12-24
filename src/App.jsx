import { useState } from 'react';
import './App.css';
import { Route, Routes, useLocation } from "react-router-dom";
import Signup from './pages/Signup';
import Login from './pages/Login';
import Otp from './pages/Otp';
import Zenztore from './pages/Zenztore';
import ProductDetails from './pages/ProductDetails';
import Scroll from './components/Scroll';
import ZenztoreFooter from './components/ZenztoreFooter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserLayout from './components/UserLayout';
import Profile from './pages/Profile';
import ManageAddress from './pages/ManageAddress';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import Chekout from './pages/Chekout';
import Thankyou from './pages/Thankyou';
import CategoryPage from './pages/CategoryPage';
import Four04 from './Four04';

function App() {
  const location = useLocation(); // Get the current location

  // Define valid paths where the footer should be displayed
  const pathsWithFooter = [
    '/',
    '/signup',
    '/login',
    '/verifyotp',
    '/zenztore',
    '/product/:id',
    '/cart',
    '/checkout',
    '/ordersuccessfull',
    '/category/:categoryname',
    '/user/:id/profile',
    '/user/:id/address',
    '/user/:id/orders'
  ];

  // Check if the current location matches any valid path
  const isFooterVisible = pathsWithFooter.some((path) =>
    location.pathname.match(path.replace(/:[^/]+/g, '[^/]+'))
  );

  return (
    <>
      <ToastContainer />
      <Scroll />
      <Routes>
        <Route path='/' element={<Zenztore />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/verifyotp' element={<Otp />} />
        <Route path='/zenztore' element={<Zenztore />} />
        <Route path='/product/:id' element={<ProductDetails />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Chekout />} />
        <Route path='/ordersuccessfull' element={<Thankyou />} />
        <Route path="/category/:categoryname" element={<CategoryPage />} />
        <Route path='/user/:id' element={<UserLayout />}>
          <Route path="profile" element={<Profile />} />
          <Route path="address" element={<ManageAddress />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        {/* Catch-all Route for invalid URLs */}
        {/* <Route path="*" element={<Four04/>} /> */}

        
      </Routes>

      {/* Display the footer only on valid paths */}
      {isFooterVisible && <ZenztoreFooter />}
    </>
  );
}

export default App;
