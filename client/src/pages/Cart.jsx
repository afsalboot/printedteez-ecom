import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCart,
  updateQty,
  removeItem,
  clearCart,
} from "../redux/slices/cartSlice";
import { useNavigate } from "react-router";
import { Minus, Plus, Trash2, ShoppingCart, X, CreditCard } from "lucide-react";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartState = useSelector((state) => state.cart) || {};
  const { items = [], loading, error } = cartState;

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const totalAmount = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((sum, item) => {
      const price = item.price || 0;
      const qty = item.qty || 1;
      return sum + price * qty;
    }, 0);
  }, [items]);

  const handleIncrease = (item) => {
    const newQty = (item.qty || 1) + 1;
    dispatch(updateQty({ itemId: item._id, qty: newQty }));
  };

  const handleDecrease = (item) => {
    const newQty = (item.qty || 1) - 1;
    if (newQty <= 0) {
      // you already have remove by itemId now, right?
      dispatch(removeItem(item._id));
    } else {
      dispatch(updateQty({ itemId: item._id, qty: newQty }));
    }
  };

  const handleRemove = (item) => {
    if (!item._id) return;
    dispatch(removeItem(item._id));
  };

  if (loading) return <div className="p-6 text-center">Loading cart...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!items.length)
    return <div className="p-6 text-center">Your cart is empty 🛒</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <ShoppingCart className="w-6 h-6" />
        Your Cart
      </h1>

      <div className="space-y-4">
        {items.map((item) => {
          const product = item.productId || {};
          const price = item.price || 0;
          const qty = item.qty || 1;

          const imgSrc =
            item.image || product.images?.[0] || "/placeholder.png";
          const name = product.title || item.title || "Product";

          return (
            <div
              key={item._id}
              className="flex flex-col md:flex-row items-center justify-between gap-4 border rounded-lg p-4"
            >
              {/* LEFT (Clickable) */}
              <div
                className="flex items-center gap-4 w-full md:w-auto cursor-pointer hover:bg-gray-50 rounded-md transition"
                onClick={() => {
                  if (!product._id) return;
                  navigate(`/product/${product._id}`);
                }}
              >
                <img
                  src={imgSrc}
                  alt={name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <h2 className="font-semibold text-base leading-snug truncate max-w-[200px]">
                    {name}
                  </h2>
                  {item.size && (
                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                  )}
                  <p className="text-sm text-gray-600">Price: ₹{price}</p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                {/* Quantity Box */}
                <div className="flex items-center border rounded overflow-hidden">
                  <button
                    onClick={() => handleDecrease(item)}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="px-4 py-2 border-x">{qty}</span>

                  <button
                    onClick={() => handleIncrease(item)}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtotal + Remove */}
                <div className="text-right">
                  <p className="font-semibold">₹{price * qty}</p>
                  <button
                    onClick={() => handleRemove(item)}
                    className="text-xs text-red-500 mt-1 flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-lg font-semibold">Total: ₹{totalAmount}</div>

        <div className="flex gap-3">
          <button
            onClick={() => dispatch(clearCart())}
            className="px-4 py-2 border rounded-md flex items-center gap-1 cursor-pointer hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
            Clear Cart
          </button>
          <button
            onClick={() => navigate("/checkout")}
            className="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2 cursor-pointer hover:bg-gray-800 text-sm"
          >
            <CreditCard className="w-4 h-4" />
            Checkout
          </button>
          ;
        </div>
      </div>
    </div>
  );
};

export default Cart;
