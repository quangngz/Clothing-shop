import { useEffect, useState } from "react";

import './pages.css'

export default function Shop({user}) {
  const [products, setProducts] = useState([]);

  

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then(res => res.json())
      .then(data => setProducts(data.products));
  }, []);


  return (
    <>
    <h1>Welcome back, {user.username}</h1>
    <div className="products-grid">
      {Array.isArray(products) && products.length > 0 ? 
      (products.map(product => (ItemCard(product)))) : <p>Loading product...</p>}
    </div>
    </>
  );
}

/** Function to handle adding item to card**/
async function addToCart(product) {
  const response = await fetch("http://localhost:5000/cart/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({product}),
    credentials: "include"   // 🔑 important for session to work
  });
  /*
  {
  "product": {
    "productid": 42,
    "name": "Running Shoes",
    "price": 59.99,
    "stock": 12,
    "category": "Activewear"
    }
  }
  */
  const contentType = response.headers.get('content-type'); 
  if (!contentType || !contentType.includes("application/json")) {
    throw new TypeError("Oops, we haven't got JSON!");
  }
  const result = await response.json();
  if (result.success) {
    alert("Item added to cart! Cart size: " + result.cartCount);
  } else {
    alert("Something went wrong.");
  }
}


export function ItemCard (product) {
  return (
    <div key={product.productid} className="product-card">
      <h2>{product.name}</h2>
      <p><span>Brand:</span>{product.brand}</p>
      <p><span>Category:</span>{product.categoryName}</p>
      <p><span>Supplier:</span>{product.supplierName}</p>
      <p><span>Size:</span>{product.size}</p>
      <p><span>Price:</span>${product.price}</p>
      <p><span>Stock:</span>{product.stock}</p>
      <button id="add-to-cart-btn" onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </div>
  )
}

