import { useState } from "react";
import "./components.css"
 

import { useNavigate } from 'react-router-dom';

function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/search?q=${query}`);
  };

  return (
    <>
    <div className="search-bar">
      <input 
        type="text" 
        name="q" 
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
        placeholder="Find?"/>
      <button onClick={handleSearch} className="search-button">
        Search
      </button>
    </div>
    </>
  );
}

export default SearchBar; 