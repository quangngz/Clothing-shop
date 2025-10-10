import { useEffect, useState } from "react";

export function Cart() {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/cart")
        .then(res => res.json())
        .then(data => setCart(data.products));
    }, []);
    
    return (
        <>
        <div> 
            {(cart.length > 0) ? cart.map(product => cartCard(produc)) : <p>Your cart is empty.</p>}
        </div>
        </>
    );
}

function cartCard(product) {
    return (
    <div>
        <h2>{product.name}</h2>
        <p>Brand: {product.brand}</p>
        <p>Category: {product.categoryName}</p>
        <p>Price: {product.price}</p>
    </div>
    )
}