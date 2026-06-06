import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    client.get('/favorites')
      .then(r => setFavorites(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const removeFavorite = async (favId) => {
    await client.delete(`/favorites/${favId}`);
    setFavorites(favs => favs.filter(f => f.id !== favId));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="page-favorites">
      <h1 className="text-2xl font-bold text-gray-900 mb-6" data-id="favorites-title">My Favorites</h1>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : favorites.length === 0 ? (
        <div className="card p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-gray-500 mb-4">You have no saved favorites.</p>
          <Link to="/" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="favorites-grid">
          {favorites.map(fav => (
            fav.product && (
              <div key={fav.id} className="card overflow-hidden hover:shadow-md transition-shadow" data-testid="favorite-item">
                <Link to={`/product/${fav.product.id}`}>
                  <img src={fav.product.image} alt={fav.product.name} className="w-full h-40 object-cover"
                    onError={(e) => { e.target.src = 'https://placehold.co/300x160/e5e7eb/6b7280?text=Tool'; }} />
                </Link>
                <div className="p-4">
                  <Link to={`/product/${fav.product.id}`} className="font-semibold text-gray-900 hover:text-primary-600 text-sm block mb-1">{fav.product.name}</Link>
                  <p className="text-primary-600 font-bold text-sm mb-3">${fav.product.price?.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <button onClick={() => addToCart(fav.product.id)} disabled={!fav.product.in_stock} className="flex-1 btn-primary text-xs py-1.5" data-id="btn-add-to-cart" data-testid="add-to-cart">Add to Cart</button>
                    <button onClick={() => removeFavorite(fav.id)} className="p-1.5 text-gray-400 hover:text-red-500 border border-gray-200 rounded-md" data-id="btn-remove-favorite" data-testid="remove-favorite">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
