import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from 'lucide-react';
import "./pages.css";

export default function Cart() {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/cart", {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            console.log("Data fetched: " + JSON.stringify(data));
            console.log('data.products:', data.products);
            setCart(data.products || []);
        });
    }, []);

    const calculateOrderTotal = () => {
        return cart.reduce((total, product) => total + (product.price * product.itemcount), 0).toFixed(2);
    };

    const updateCartItem = (productId, newCount) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.productid === productId
                    ? { ...item, itemcount: newCount }
                    : item
            )
        );
    };

    const removeCartItem = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.productid !== productId));
    };

    return (
        <div className="cart-container">
            {cart.length > 0 ? (
                <>
                    <div className="cart-list">
                        {cart.map(product => (
                            <CartCard
                                key={product.productid}
                                product={product}
                                onUpdateCount={updateCartItem}
                                onDelete={removeCartItem}
                            />
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <div className="order-summary-row">
                            <h3 className="order-summary-title">Order Total</h3>
                            <p className="order-summary-total">${calculateOrderTotal()}</p>
                        </div>
                    </div>
                </>
            ) : (
                <div className="cart-empty">
                    <p>Your cart is empty.</p>
                </div>
            )}
        </div>
    );
}

function CartCard({ product, onUpdateCount, onDelete }) {
    const handleDecrement = () => {
        console.log("handle decrement");
        // if (product.itemcount > 1) {
        //     const newCount = product.itemcount - 1;
        //     onUpdateCount(product.productid, newCount);
        // }
    };

    const handleIncrement = () => {
        console.log("handle increment");
        // const newCount = product.itemcount + 1;
        // onUpdateCount(product.productid, newCount);
    };

    const handleDelete = () => {
        console.log("handle delete");
        // onDelete(product.productid);
    };

    const itemTotal = (product.price * product.itemcount).toFixed(2);

    return (
        <div className="cart-card">
            <div className="cart-card-content">
                {/* Product Info */}
                <div className="cart-product-info">
                    <div>
                        <p className="label">Product</p>
                        <p className="value bold">{product.name}</p>
                    </div>
                    <div>
                        <p className="label">Brand</p>
                        <p className="value">{product.brand}</p>
                    </div>
                    <div>
                        <p className="label">Category</p>
                        <p className="value">{product.categoryname}</p>
                    </div>
                    <div>
                        <p className="label">Unit Price</p>
                        <p className="value">${product.price}</p>
                    </div>
                </div>

                {/* Quantity Controls */}
                <div className="cart-controls">
                    <div className="quantity-control">
                        <button onClick={handleDecrement} className="btn-decrement" aria-label="Decrease quantity">
                            <Minus className="icon" />
                        </button>
                        <span className="quantity-display">{product.itemcount}</span>
                        <button onClick={handleIncrement} className="btn-increment" aria-label="Increase quantity">
                            <Plus className="icon" />
                        </button>
                    </div>

                    {/* Item Total */}
                    <div className="cart-item-total">
                        <p className="label">Total</p>
                        <p className="value total">${itemTotal}</p>
                    </div>

                    {/* Delete Button */}
                    <button onClick={handleDelete} className="btn-delete" aria-label="Delete item">
                        <Trash2 className="icon" />
                    </button>
                </div>
            </div>
        </div>
    );
}
