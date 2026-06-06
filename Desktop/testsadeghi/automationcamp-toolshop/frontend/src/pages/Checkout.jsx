import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const STEPS = ['Cart', 'Address', 'Payment', 'Confirm'];

export default function Checkout() {
  const { cart, cartId, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const [address, setAddress] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    address: user?.street || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || 'US',
    postal_code: user?.postal_code || '',
  });

  const [payment, setPayment] = useState({ method: 'credit_card', details: {} });
  const [updatingProductId, setUpdatingProductId] = useState(null);

  const items = cart?.items || [];

  const handleQuantityChange = async (productId, newQuantity, maxStock) => {
    const quantity = Math.max(1, Math.min(newQuantity, maxStock ?? newQuantity));
    setUpdatingProductId(productId);
    setError('');
    try {
      await updateQuantity(productId, quantity);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdatingProductId(productId);
    setError('');
    try {
      await removeFromCart(productId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setUpdatingProductId(null);
    }
  };
  const subtotal = cart?.subtotal || 0;

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.first_name || !address.last_name || !address.email || !address.address || !address.city || !address.country) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await client.post('/payment/check', { payment_method: payment.method, payment_details: payment.details });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        cart_id: cartId,
        billing_first_name: address.first_name,
        billing_last_name: address.last_name,
        billing_email: address.email,
        billing_address: address.address,
        billing_city: address.city,
        billing_state: address.state,
        billing_country: address.country,
        billing_postal_code: address.postal_code,
        payment_method: payment.method,
        payment_details: payment.details,
      };
      const endpoint = isAuthenticated ? '/invoices' : '/invoices/guest';
      const { data } = await client.post(endpoint, payload);
      setOrder(data);
      await clearCart();
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step < 4) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center" data-id="cart-empty">
        <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-2" data-id="empty-cart-title">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products before checking out.</p>
        <Link to="/" className="btn-primary" data-id="btn-continue-shopping">Continue Shopping</Link>
      </div>
    );
  }

  if (step === 4 && order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center" data-id="order-success-page">
        <div className="card p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="success-icon">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2" data-id="order-success-title" data-testid="order-success">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-1">Order number: <span className="font-semibold text-gray-900" data-id="order-invoice-number" data-testid="invoice-number">{order.invoice_number}</span></p>
          <p className="text-gray-600 mb-6">Total: <span className="font-bold text-primary-600" data-id="order-total">${order.total?.toFixed(2)}</span></p>
          <p className="text-sm text-gray-500 mb-6" data-id="order-confirmation-email">A confirmation email has been sent to {order.billing_email}.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAuthenticated && <Link to="/account/orders" className="btn-secondary" data-id="btn-view-orders">View My Orders</Link>}
            <Link to="/" className="btn-primary" data-id="btn-continue-shopping-after-order">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="page-checkout">
      <h1 className="text-2xl font-bold text-gray-900 mb-6" data-id="checkout-title">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8" data-id="checkout-steps">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none" data-id={`checkout-step-${i}`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
              i < step ? 'bg-green-600 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`} data-id={`step-indicator-${i}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:block ${i <= step ? 'text-gray-900' : 'text-gray-400'}`} data-id={`step-label-${s.toLowerCase()}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-4 ${i < step ? 'bg-green-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700" data-id="checkout-error" data-testid="checkout-error">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Cart */}
          {step === 0 && (
            <div className="card p-6" data-id="cart-step">
              <h2 className="text-lg font-semibold mb-4" data-id="cart-step-title">Cart Items</h2>
              <div className="space-y-4" data-id="cart-items-list">
                {items.map(item => {
                  const isUpdating = updatingProductId === item.product_id;
                  const maxStock = item.product?.stock ?? item.quantity;
                  return (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-b-0" data-id="cart-item" data-testid="cart-item">
                    <img src={item.product?.image || 'https://placehold.co/80x60/e5e7eb/6b7280?text=Tool'}
                      alt={item.product?.name} className="w-16 h-12 object-cover rounded" onError={(e) => { e.target.src = 'https://placehold.co/80x60/e5e7eb/6b7280?text=Tool'; }}
                      data-id="cart-item-image" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" data-id="cart-item-name">{item.product?.name}</p>
                      <div className="flex items-center border border-gray-300 rounded-md mt-1 w-fit" data-id="cart-quantity-selector">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1, maxStock)}
                          disabled={isUpdating || item.quantity <= 1}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-50 rounded-l-md disabled:opacity-50"
                          data-id="btn-cart-qty-decrease"
                          data-testid="cart-qty-decrease"
                        >−</button>
                        <span className="px-3 py-1 text-sm font-medium border-x border-gray-300" data-id="cart-item-qty" data-testid="cart-quantity">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1, maxStock)}
                          disabled={isUpdating || item.quantity >= maxStock}
                          className="px-2 py-1 text-gray-600 hover:bg-gray-50 rounded-r-md disabled:opacity-50"
                          data-id="btn-cart-qty-increase"
                          data-testid="cart-qty-increase"
                        >+</button>
                      </div>
                    </div>
                    <p className="font-semibold text-primary-600 shrink-0" data-id="cart-item-total">${item.line_total?.toFixed(2)}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.product_id)}
                      disabled={isUpdating}
                      className="text-gray-400 hover:text-red-600 text-xl leading-none disabled:opacity-50 shrink-0"
                      title="Remove item"
                      aria-label="Remove item"
                      data-id="btn-remove-cart-item"
                      data-testid="cart-remove"
                    >×</button>
                  </div>
                  );
                })}
              </div>
              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700" data-id="guest-notice">
                  <Link to="/auth/login" className="font-medium hover:underline" data-id="link-sign-in-checkout">Sign in</Link> to save your order history, or continue as guest.
                </div>
              )}
              <button onClick={() => setStep(1)} className="mt-6 btn-primary w-full" data-id="btn-proceed-to-address" data-testid="proceed-to-address">
                Proceed to Address
              </button>
            </div>
          )}

          {/* Step 1: Address */}
          {step === 1 && (
            <form onSubmit={handleAddressSubmit} className="card p-6" data-id="address-step">
              <h2 className="text-lg font-semibold mb-4" data-id="address-step-title">Billing Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input className="input-field" value={address.first_name} onChange={e => setAddress({...address, first_name: e.target.value})} required data-id="input-billing-first-name" data-testid="billing-first-name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input className="input-field" value={address.last_name} onChange={e => setAddress({...address, last_name: e.target.value})} required data-id="input-billing-last-name" data-testid="billing-last-name" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" className="input-field" value={address.email} onChange={e => setAddress({...address, email: e.target.value})} required data-id="input-billing-email" data-testid="billing-email" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input className="input-field" value={address.address} onChange={e => setAddress({...address, address: e.target.value})} required data-id="input-billing-address" data-testid="billing-address" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input className="input-field" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} required data-id="input-billing-city" data-testid="billing-city" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                  <input className="input-field" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} data-id="input-billing-state" data-testid="billing-state" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <input className="input-field" value={address.country} onChange={e => setAddress({...address, country: e.target.value})} required data-id="input-billing-country" data-testid="billing-country" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input className="input-field" value={address.postal_code} onChange={e => setAddress({...address, postal_code: e.target.value})} data-id="input-billing-postal-code" data-testid="billing-postal-code" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(0)} className="btn-secondary" data-id="btn-back-to-cart">Back</button>
                <button type="submit" className="btn-primary flex-1" data-id="btn-proceed-to-payment" data-testid="proceed-to-payment">Proceed to Payment</button>
              </div>
            </form>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="card p-6" data-id="payment-step">
              <h2 className="text-lg font-semibold mb-4" data-id="payment-step-title">Payment Method</h2>
              <div className="space-y-3 mb-4" data-id="payment-methods">
                {[
                  { value: 'credit_card', label: 'Credit Card' },
                  { value: 'bank_transfer', label: 'Bank Transfer' },
                  { value: 'gift_card', label: 'Gift Card' },
                  { value: 'buy_now_pay_later', label: 'Buy Now Pay Later' },
                  { value: 'cash_on_delivery', label: 'Cash on Delivery' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors" data-id={`payment-option-${opt.value}`}>
                    <input type="radio" name="payment_method" value={opt.value} checked={payment.method === opt.value} onChange={() => setPayment({ method: opt.value, details: {} })} className="text-primary-600" data-id={`radio-${opt.value}`} data-testid={`payment-${opt.value}`} />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>

              {payment.method === 'credit_card' && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-md" data-id="credit-card-fields">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input className="input-field" placeholder="1234 5678 9012 3456" maxLength={19} value={payment.details.card_number || ''} onChange={e => setPayment({...payment, details: {...payment.details, card_number: e.target.value.replace(/\s/g, '')}})} data-id="input-card-number" data-testid="card-number" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                      <input className="input-field" placeholder="12/26" maxLength={5} value={payment.details.expiry || ''} onChange={e => setPayment({...payment, details: {...payment.details, expiry: e.target.value}})} data-id="input-card-expiry" data-testid="card-expiry" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input className="input-field" placeholder="123" maxLength={4} value={payment.details.cvv || ''} onChange={e => setPayment({...payment, details: {...payment.details, cvv: e.target.value}})} data-id="input-card-cvv" data-testid="card-cvv" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Holder Name</label>
                    <input className="input-field" placeholder="Jane Doe" value={payment.details.holder_name || ''} onChange={e => setPayment({...payment, details: {...payment.details, holder_name: e.target.value}})} data-id="input-card-holder" data-testid="card-holder" />
                  </div>
                </div>
              )}

              {payment.method === 'bank_transfer' && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-md" data-id="bank-transfer-fields">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input className="input-field" value={payment.details.bank_name || ''} onChange={e => setPayment({...payment, details: {...payment.details, bank_name: e.target.value}})} data-id="input-bank-name" data-testid="bank-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                    <input className="input-field" value={payment.details.account_name || ''} onChange={e => setPayment({...payment, details: {...payment.details, account_name: e.target.value}})} data-id="input-account-name" data-testid="account-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input className="input-field" value={payment.details.account_number || ''} onChange={e => setPayment({...payment, details: {...payment.details, account_number: e.target.value}})} data-id="input-account-number" data-testid="account-number" />
                  </div>
                </div>
              )}

              {payment.method === 'gift_card' && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-md" data-id="gift-card-fields">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gift Card Number</label>
                    <input className="input-field" value={payment.details.gift_card_number || ''} onChange={e => setPayment({...payment, details: {...payment.details, gift_card_number: e.target.value}})} data-id="input-gift-card-number" data-testid="gift-card-number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validation Code</label>
                    <input className="input-field" value={payment.details.validation_code || ''} onChange={e => setPayment({...payment, details: {...payment.details, validation_code: e.target.value}})} data-id="input-gift-card-code" data-testid="gift-card-code" />
                  </div>
                </div>
              )}

              {payment.method === 'buy_now_pay_later' && (
                <div className="p-4 bg-gray-50 rounded-md" data-id="bnpl-fields">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Installments</label>
                  <select className="input-field" value={payment.details.monthly_installments || ''} onChange={e => setPayment({...payment, details: {...payment.details, monthly_installments: parseInt(e.target.value)}})} data-id="select-installments" data-testid="installments">
                    <option value="">Select installments</option>
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary" data-id="btn-back-to-address">Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1" data-id="btn-proceed-to-confirm" data-testid="proceed-to-confirm">
                  {loading ? 'Validating...' : 'Review Order'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="card p-6" data-id="confirm-step">
              <h2 className="text-lg font-semibold mb-4" data-id="confirm-step-title">Review Your Order</h2>
              <div className="space-y-2 text-sm mb-4" data-id="order-summary-details">
                <div className="flex justify-between"><span className="text-gray-600">Name:</span><span data-id="confirm-name">{address.first_name} {address.last_name}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Email:</span><span data-id="confirm-email">{address.email}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Address:</span><span data-id="confirm-address">{address.address}, {address.city}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Payment:</span><span className="capitalize" data-id="confirm-payment">{payment.method.replace(/_/g, ' ')}</span></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="btn-secondary" data-id="btn-back-to-payment">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1" data-id="btn-place-order" data-testid="place-order-btn">
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div data-id="order-summary-sidebar">
          <div className="card p-5 sticky top-24" data-id="order-summary-card">
            <h2 className="font-semibold text-gray-900 mb-4" data-id="order-summary-title">Order Summary</h2>
            <div className="space-y-2 text-sm" data-id="order-summary-items">
              {items.map(item => (
                <div key={item.id} className="flex justify-between" data-id="summary-item">
                  <span className="text-gray-600 truncate flex-1 mr-2" data-id="summary-item-name">{item.product?.name} ×{item.quantity}</span>
                  <span className="font-medium" data-id="summary-item-price">${item.line_total?.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary-600" data-id="order-total-price">${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
