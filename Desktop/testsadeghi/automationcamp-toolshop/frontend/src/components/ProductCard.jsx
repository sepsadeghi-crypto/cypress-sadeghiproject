import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function ProductCard({ product, showFavoriteBtn = true }) {
  const { addToCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const [added, setAdded] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      if (isFav) {
        setIsFav(false);
      } else {
        await client.post('/favorites', { product_id: product.id });
        setIsFav(true);
      }
    } catch (_) {}
  };

  const co2Colors = { A: 'text-green-600 bg-green-100', B: 'text-green-500 bg-green-50', C: 'text-yellow-600 bg-yellow-100', D: 'text-orange-600 bg-orange-100', E: 'text-red-500 bg-red-100', F: 'text-red-700 bg-red-100', G: 'text-red-900 bg-red-200' };

  return (
    <Link to={`/product/${product.id}`} className="group block" data-id="product-card" data-testid="product-card">
      <div className="card overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="relative overflow-hidden bg-gray-100 aspect-[4/3]">
          <img
            src={product.image || `https://placehold.co/300x200/e5e7eb/6b7280?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = `https://placehold.co/300x200/e5e7eb/6b7280?text=Tool`; }}
            data-id="product-image"
            data-testid="product-image"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_rental && (
              <span className="badge bg-blue-600 text-white text-xs" data-id="badge-rental">Rental</span>
            )}
            {product.is_eco_friendly && (
              <span className="badge bg-green-600 text-white text-xs" data-id="badge-eco">Eco</span>
            )}
            {!product.in_stock && (
              <span className="badge bg-red-600 text-white text-xs" data-id="badge-out-of-stock">Out of Stock</span>
            )}
          </div>
          {showFavoriteBtn && isAuthenticated && (
            <button
              onClick={handleFavorite}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
              data-id="btn-favorite"
              data-testid="favorite-btn"
            >
              <svg className={`h-4 w-4 ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}`} viewBox="0 0 24 24" stroke="currentColor" fill={isFav ? 'currentColor' : 'none'}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            {product.category && (
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1" data-id="product-category" data-testid="product-category">{product.category.name}</p>
            )}
            <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-primary-600 transition-colors mb-1 line-clamp-2" data-id="product-name" data-testid="product-name">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-xs text-gray-500 mb-2" data-id="product-brand" data-testid="product-brand">{product.brand.name}</p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary-600" data-id="product-price" data-testid="product-price">${product.price?.toFixed(2)}</span>
              {product.co2_rating && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${co2Colors[product.co2_rating] || 'text-gray-600 bg-gray-100'}`} data-id="product-co2-rating">
                  CO₂ {product.co2_rating}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock || loading}
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
              data-id="btn-add-to-cart"
              data-testid="add-to-cart-btn"
            >
              {added ? (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Added
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
