// Checkout.jsx
import React, { useContext, useState } from 'react';
import { ShopContext } from '../../Context/ShopContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Checkout = () => {
  const { getTotalCartAmount, all_product, cartItems } = useContext(ShopContext);
  const navigate = useNavigate(); // Inisialisasi useNavigate
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Kirim data ke backend untuk membuat transaksi dan mendapatkan token
      const response = await fetch('http://localhost:4000/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('auth-token'), // Pastikan autentikasi
        },
        body: JSON.stringify({ cartItems, totalAmount: getTotalCartAmount() }),
      });
      const data = await response.json();

      if (data.token) {
        // Mengarahkan ke Midtrans untuk pembayaran
        window.snap.pay(data.token, {
          onSuccess: function (result) {
            alert('Payment Success');
            navigate('/'); // Redirect ke halaman utama setelah sukses
          },
          onPending: function (result) {
            alert('Waiting for Payment');
          },
          onError: function (result) {
            alert('Payment Error');
          },
          onClose: function () {
            alert('Payment Dialog Closed');
          },
        });
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      <div>
        <h3>Order Summary</h3>
        <ul>
          {Object.keys(cartItems).map(id => {
            const product = all_product.find(p => p.id === Number(id));
            if (cartItems[id] > 0 && product) {
              return (
                <li key={id}>
                  {product.name} x {cartItems[id]} = Rp{product.new_price * cartItems[id]}
                </li>
              );
            }
            return null;
          })}
        </ul>
        <h3>Total Amount: Rp{getTotalCartAmount()}</h3>
      </div>
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Processing Payment...' : 'Proceed to Payment'}
      </button>
    </div>
  );
};

export default Checkout;
