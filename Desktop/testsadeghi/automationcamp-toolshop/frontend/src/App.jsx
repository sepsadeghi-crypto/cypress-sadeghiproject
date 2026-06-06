import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/ProtectedRoute';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

import Profile from './pages/account/Profile';
import Orders from './pages/account/Orders';
import OrderDetail from './pages/account/OrderDetail';
import Favorites from './pages/account/Favorites';
import Messages from './pages/account/Messages';
import MessageDetail from './pages/account/MessageDetail';

import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminProductForm from './pages/admin/ProductForm';
import AdminCategories from './pages/admin/Categories';
import AdminCategoryForm from './pages/admin/CategoryForm';
import AdminBrands from './pages/admin/Brands';
import AdminBrandForm from './pages/admin/BrandForm';
import AdminOrders from './pages/admin/Orders';
import AdminOrderDetail from './pages/admin/OrderDetail';
import AdminUsers from './pages/admin/Users';
import AdminUserForm from './pages/admin/UserForm';
import AdminMessages from './pages/admin/Messages';
import AdminMessageDetail from './pages/admin/MessageDetail';
import AdminReports from './pages/admin/Reports';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />

            <Route path="/auth/login" element={<Layout><GuestRoute><Login /></GuestRoute></Layout>} />
            <Route path="/auth/register" element={<Layout><GuestRoute><Register /></GuestRoute></Layout>} />
            <Route path="/auth/forgot-password" element={<Layout><ForgotPassword /></Layout>} />

            <Route path="/account/profile" element={<Layout><ProtectedRoute><Profile /></ProtectedRoute></Layout>} />
            <Route path="/account/orders" element={<Layout><ProtectedRoute><Orders /></ProtectedRoute></Layout>} />
            <Route path="/account/orders/:id" element={<Layout><ProtectedRoute><OrderDetail /></ProtectedRoute></Layout>} />
            <Route path="/account/favorites" element={<Layout><ProtectedRoute><Favorites /></ProtectedRoute></Layout>} />
            <Route path="/account/messages" element={<Layout><ProtectedRoute><Messages /></ProtectedRoute></Layout>} />
            <Route path="/account/messages/:id" element={<Layout><ProtectedRoute><MessageDetail /></ProtectedRoute></Layout>} />

            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/products/add" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/categories/add" element={<AdminRoute><AdminCategoryForm /></AdminRoute>} />
            <Route path="/admin/categories/edit/:id" element={<AdminRoute><AdminCategoryForm /></AdminRoute>} />
            <Route path="/admin/brands" element={<AdminRoute><AdminBrands /></AdminRoute>} />
            <Route path="/admin/brands/add" element={<AdminRoute><AdminBrandForm /></AdminRoute>} />
            <Route path="/admin/brands/edit/:id" element={<AdminRoute><AdminBrandForm /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetail /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/users/add" element={<AdminRoute><AdminUserForm /></AdminRoute>} />
            <Route path="/admin/users/edit/:id" element={<AdminRoute><AdminUserForm /></AdminRoute>} />
            <Route path="/admin/messages" element={<AdminRoute><AdminMessages /></AdminRoute>} />
            <Route path="/admin/messages/:id" element={<AdminRoute><AdminMessageDetail /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
