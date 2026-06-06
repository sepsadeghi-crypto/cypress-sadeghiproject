import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const categories = [
    { name: 'Hand Tools', slug: 'hand-tools', id: 'cat-1' },
    { name: 'Power Tools', slug: 'power-tools', id: 'cat-6' },
    { name: 'Storage', slug: 'storage', id: 'cat-11' },
    { name: 'Measuring & Layout', slug: 'measuring-layout', id: 'cat-14' },
  ];

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg" data-id="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0" data-id="nav-logo">
            <svg className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xl font-bold tracking-tight">Toolshop</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1" data-id="nav-categories">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/?category_id=${cat.id}`}
                className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                data-id={`nav-category-${cat.slug}`}
              >
                {cat.name}
              </Link>
            ))}
            <Link to="/?is_rental=true" className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors" data-id="nav-rentals">
              Rentals
            </Link>
          </nav>

          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <form onSubmit={handleSearch} className="w-full" data-id="search-form">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools..."
                  className="w-full pl-4 pr-10 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  data-id="search-input"
                  data-testid="search-query"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" data-id="search-btn">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/checkout" className="relative p-2 text-gray-300 hover:text-white transition-colors" data-id="nav-cart" data-testid="nav-cart">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold" data-id="cart-count">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef} data-id="user-menu-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
                  data-id="user-menu-toggle"
                  data-testid="nav-user-menu"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-semibold" data-id="user-avatar">
                    {user?.first_name?.[0]?.toUpperCase()}
                  </div>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200" data-id="user-dropdown">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      <div className="font-medium text-gray-900" data-id="user-full-name">{user?.first_name} {user?.last_name}</div>
                      <div className="truncate" data-id="user-email">{user?.email}</div>
                    </div>
                    {isAdmin ? (
                      <>
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="nav-admin" data-testid="nav-admin">Admin Dashboard</Link>
                        <Link to="/admin/products" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="nav-admin-products">Manage Products</Link>
                        <Link to="/admin/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="nav-admin-orders">Manage Orders</Link>
                      </>
                    ) : (
                      <>
                        <Link to="/account/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="nav-account-profile" data-testid="nav-profile">My Profile</Link>
                        <Link to="/account/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="nav-account-orders" data-testid="nav-orders">My Orders</Link>
                        <Link to="/account/favorites" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="nav-account-favorites">Favorites</Link>
                        <Link to="/account/messages" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-id="nav-account-messages">Messages</Link>
                      </>
                    )}
                    <div className="border-t mt-1">
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" data-id="btn-logout" data-testid="nav-logout">
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2" data-id="nav-auth">
                <Link to="/auth/login" className="text-sm text-gray-300 hover:text-white transition-colors" data-id="nav-sign-in" data-testid="nav-login">Sign in</Link>
                <Link to="/auth/register" className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-md transition-colors" data-id="nav-register" data-testid="nav-register">Register</Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
              data-id="mobile-menu-toggle"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-3 border-t border-gray-700" data-id="mobile-menu">
            <form onSubmit={handleSearch} className="mt-3 mb-2" data-id="mobile-search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400"
                data-id="mobile-search-input"
              />
            </form>
            {categories.map(cat => (
              <Link key={cat.id} to={`/?category_id=${cat.id}`} onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-300 hover:text-white"
                data-id={`mobile-nav-category-${cat.slug}`}>
                {cat.name}
              </Link>
            ))}
            <Link to="/?is_rental=true" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-300 hover:text-white" data-id="mobile-nav-rentals">Rentals</Link>
          </div>
        )}
      </div>
    </header>
  );
}
