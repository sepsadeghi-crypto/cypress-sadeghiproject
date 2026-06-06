import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import client from '../api/client';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [cartId, setCartId] = useState(() => localStorage.getItem('cartId'));
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async (id) => {
    if (!id) return;
    try {
      const { data } = await client.get(`/carts/${id}`);
      setCart(data);
    } catch (err) {
      if (err.response?.status === 404) {
        localStorage.removeItem('cartId');
        setCartId(null);
        setCart(null);
      }
    }
  }, []);

  useEffect(() => {
    if (cartId) fetchCart(cartId);
  }, [cartId, fetchCart]);

  const ensureCart = useCallback(async () => {
    if (cartId) return cartId;
    const { data } = await client.post('/carts');
    localStorage.setItem('cartId', data.id);
    setCartId(data.id);
    setCart(data);
    return data.id;
  }, [cartId]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    try {
      const id = await ensureCart();
      const { data } = await client.post(`/carts/${id}`, { product_id: productId, quantity });
      setCart(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, [ensureCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!cartId) return;
    const { data } = await client.put(`/carts/${cartId}/product/quantity`, { product_id: productId, quantity });
    setCart(data);
  }, [cartId]);

  const removeFromCart = useCallback(async (productId) => {
    if (!cartId) return;
    const { data } = await client.delete(`/carts/${cartId}/product/${productId}`);
    setCart(data);
  }, [cartId]);

  const clearCart = useCallback(async () => {
    if (!cartId) return;
    try {
      await client.delete(`/carts/${cartId}`);
    } catch (_) {}
    localStorage.removeItem('cartId');
    setCartId(null);
    setCart(null);
  }, [cartId]);

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartId, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
