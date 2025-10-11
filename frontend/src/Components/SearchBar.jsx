import { useState } from "react";
 

import { useNavigate } from 'react-router-dom';

function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/search?q=${query}`);
  };

  return (
    <>
      <input 
        type="text" 
        name="q" 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What do you want to find?"/>
      <button onClick={handleSearch}>
        Search
      </button>
    </>
  );
}

export default SearchBar; 