import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useStore } from "@/contexts/StoreContext";
import { motion } from "framer-motion";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useStore();

  if (cart.length === 0) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="font-heading text-2xl mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary inline-block">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <h1 className="font-heading text-3xl md:text-4xl font-semibold mb-8">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, i) => (
              <motion.div
                key={`${item.product.id}-${item.size}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 p-4 border border-border"
              >
                <Link to={`/product/${item.product.id}`} className="w-24 h-32 flex-shrink-0 bg-accent overflow-hidden">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${item.product.id}`} className="font-medium text-sm hover:text-secondary transition-colors">{item.product.name}</Link>
                    <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="p-2"><Minus size={12} /></button>
                      <span className="px-3 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="p-2"><Plus size={12} /></button>
                    </div>
                    <span className="font-semibold text-sm">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.product.id, item.size)} className="text-muted-foreground hover:text-destructive self-start">
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-accent p-6 h-fit">
            <h3 className="font-heading text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-secondary">Free</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
            <button className="btn-primary w-full mt-6 text-center">Proceed to Checkout</button>
            <button onClick={clearCart} className="w-full text-center text-xs text-muted-foreground mt-3 hover:text-destructive transition-colors">
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
