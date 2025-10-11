import { useEffect, useState } from "react";

export default function Cart() {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/cart", {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            console.log("Data fetches: " + JSON.stringify(data));
            console.log('data.products:', data.products);  // ✅ See the products array
            setCart(data.products || [])
        });
    }, []);
    useEffect(() => {
        console.log('Cart state updated:', cart);  // ✅ Log when cart changes
    }, [cart]);
    return (
        <>
        <div> 
            {(cart.length > 0) ? 
            cart.map(product => (
            <CartCard key={product.productid} product={product} />
            )) : (<p>Your cart is empty.</p>)
        }
        </div>
        </>
    );
}

function CartCard({product}) {
    console.log(JSON.stringify(product)); 
    return (
    <div>
        <h2>{product.name}</h2>
        <p>Brand: {product.brand}</p>
        <p>Category: {product.categoryname}</p>
        <p>Price: {product.price}</p>
    </div>
    )
}