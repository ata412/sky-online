import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Products from './pages/Products';
import Promotions from './pages/Promotions';
import Vision from './pages/Vision';
import Contact from './pages/Contact';
import Activities from './pages/Activities';
import HallOfFame from './pages/HallOfFame';
import Register from './pages/Register';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import ProductDetail from './pages/ProductDetail';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <ScrollToTop />
            <Navbar />
            <CartDrawer />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/vision" element={<Vision />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/hall-of-fame" element={<HallOfFame />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/products/:id" element={<ProductDetail />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
