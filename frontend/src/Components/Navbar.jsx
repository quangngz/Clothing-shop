import SearchBar from "./SearchBar"

import "./components.css"

function Navbar({onLogut}) {
  return (
    <nav className="navbar">
      <h1 className="navbar-title">Fake Amazon</h1>
      <div className="navbar-search">
        <SearchBar />
      </div>
      <div className="navbar-links">
        <a className="navbar-link" href="/">Home</a>
        <a className="navbar-link" href="/cart">My Cart</a>
        <a className="navbar-link" href="/sign-up">Sign Up</a>
        <button onClick={onLogut}>Log Out</button>
      </div>
    </nav>
  );
}
export default Navbar; 