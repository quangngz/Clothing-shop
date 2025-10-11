import { useState, useEffect } from "react";

import { useSearchParams } from "react-router-dom";
import {ItemCard} from "./Shop"
export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/search?q=${query}`, {
        credentials: "include"
    })
      .then(res => res.json())
      .then(data => setResults(data));
  }, [query]);

  return (
    <div className="products-grid">
      {results.length > 0 ? (
        results.map(product => <ItemCard key={product.id} {...product} />)
      ) : (
        <p>No products found for "{query}"</p>
      )}
    </div>
  );
}
