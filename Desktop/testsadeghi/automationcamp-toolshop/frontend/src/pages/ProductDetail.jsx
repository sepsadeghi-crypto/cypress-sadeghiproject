import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const CO2_COLORS = { A: 'bg-green-600', B: 'bg-green-500', C: 'bg-yellow-500', D: 'bg-orange-500', E: 'bg-red-500', F: 'bg-red-700', G: 'bg-red-900' };

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedMsg, setAddedMsg] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    Promise.all([
      client.get(`/products/${id}`),
      client.get(`/products/${id}/related`),
    ]).then(([prod, rel]) => {
      setProduct(prod.data);
      setRelated(rel.data);
    }).catch(() => {
      navigate('/');
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = async () => {
    await addToCart(id, quantity);
    setAddedMsg('Added to cart!');
    setTimeout(() => setAddedMsg(''), 3000);
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    setFavLoading(true);
    try {
      if (isFav) {
        setIsFav(false);
      } else {
        await client.post('/favorites', { product_id: id });
        setIsFav(true);
      }
    } catch (_) {}
    setFavLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8" data-id="page-product-detail-loading">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-lg aspect-square" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="page-product-detail">
      <nav className="flex items-center text-sm text-gray-500 mb-6 flex-wrap gap-1" data-id="breadcrumb">
        <Link to="/" className="hover:text-gray-700" data-id="breadcrumb-home">Home</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/?category_id=${product.category.id}`} className="hover:text-gray-700" data-id="breadcrumb-category">{product.category.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900" data-id="breadcrumb-product">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        <div data-id="product-image-container">
          <div className="rounded-xl overflow-hidden bg-gray-100 shadow-sm">
            <img
              src={product.image || `https://placehold.co/600x450/e5e7eb/6b7280?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              className="w-full object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/600x450/e5e7eb/6b7280?text=Tool'; }}
              data-id="product-image"
              data-testid="product-detail-image"
            />
          </div>
        </div>

        <div className="flex flex-col" data-id="product-info">
          <div className="flex items-start justify-between gap-4">
            <div>
              {product.category && (
                <Link to={`/?category_id=${product.category.id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium" data-id="product-category-link">
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1" data-id="product-name" data-testid="product-name">{product.name}</h1>
              {product.brand && (
                <Link to={`/?brand_id=${product.brand.id}`} className="text-sm text-gray-500 hover:text-gray-700" data-id="product-brand" data-testid="product-brand">
                  by {product.brand.name}
                </Link>
              )}
            </div>
            <button
              onClick={handleFavorite}
              disabled={favLoading}
              className="flex-shrink-0 p-2 rounded-full border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
              data-id="btn-toggle-favorite"
              data-testid="favorite-btn"
            >
              <svg className={`h-6 w-6 ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}`} viewBox="0 0 24 24" stroke="currentColor" fill={isFav ? 'currentColor' : 'none'}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <span className="text-3xl font-bold text-primary-600" data-id="product-price" data-testid="product-price">${product.price?.toFixed(2)}</span>
            {product.co2_rating && (
              <div className="flex items-center gap-1.5" data-id="product-co2-container">
                <span className="text-xs text-gray-500">CO₂ Rating:</span>
                <span className={`${CO2_COLORS[product.co2_rating]} text-white text-sm font-bold px-2 py-0.5 rounded`} data-id="product-co2-rating">{product.co2_rating}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3" data-id="product-badges">
            {product.in_stock ? (
              <span className="badge-green" data-id="stock-status" data-testid="stock-status">In Stock ({product.stock} available)</span>
            ) : (
              <span className="badge-red" data-id="stock-status" data-testid="stock-status">Out of Stock</span>
            )}
            {product.is_rental && <span className="badge-blue" data-id="badge-rental">Available for Rental</span>}
            {product.is_eco_friendly && (
              <span className="badge bg-green-100 text-green-700 flex items-center gap-1" data-id="badge-eco">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                Eco Friendly
              </span>
            )}
          </div>

          <p className="text-gray-600 mt-4 leading-relaxed text-sm" data-id="product-description" data-testid="product-description">{product.description}</p>

          {product.in_stock && (
            <div className="mt-6 flex items-center gap-3" data-id="add-to-cart-section">
              <div className="flex items-center border border-gray-300 rounded-md" data-id="quantity-selector">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-l-md" data-id="btn-qty-decrease" data-testid="qty-decrease">−</button>
                <span className="px-4 py-2 text-sm font-medium border-x border-gray-300" data-id="quantity-value" data-testid="quantity">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-r-md" data-id="btn-qty-increase" data-testid="qty-increase">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5"
                data-id="btn-add-to-cart"
                data-testid="add-to-cart-btn"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
            </div>
          )}
          {addedMsg && <p className="mt-2 text-sm text-green-600 font-medium" data-id="add-to-cart-msg" data-testid="add-cart-msg">{addedMsg}</p>}

          {product.specs && product.specs.length > 0 && (
            <div className="mt-8 border-t pt-6" data-id="specs-section">
              <h3 className="font-semibold text-gray-900 mb-3" data-id="specs-title">Specifications</h3>
              <table className="w-full text-sm" data-id="specs-table" data-testid="product-specs">
                <tbody className="divide-y divide-gray-100">
                  {product.specs.map((spec, i) => (
                    <tr key={i} data-id={`spec-row-${i}`}>
                      <td className="py-2 text-gray-500 font-medium w-1/2" data-id="spec-name">{spec.name}</td>
                      <td className="py-2 text-gray-900" data-id="spec-value">{spec.value}{spec.unit ? ` ${spec.unit}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div data-id="related-products-section">
          <h2 className="text-xl font-bold text-gray-900 mb-4" data-id="related-title">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-id="related-products-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
