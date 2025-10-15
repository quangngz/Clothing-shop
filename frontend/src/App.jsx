import { useState, useEffect } from 'react'
import './App.css'
import Navbar from "./Components/Navbar.jsx"
import Shop from "./pages/Shop.jsx"
import Cart from "./pages/Cart.jsx"
import LogIn from "./pages/LogIn.jsx"
import SignUp from "./pages/SignUp.jsx"
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import SearchResults from './pages/SearchResults.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use consistent API endpoint
    fetch("http://localhost:5000/session", {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Session check failed:", error);
        setLoading(false);
      });
  }, []);

  function handleLogIn(userData) {
    console.log("User: "+ JSON.stringify(userData)); 
    setUser(userData);
  }

  function handleLogout() {
    fetch("http://localhost:5000/log-out", {
      credentials: "include",
      method: "POST"
    }).then(() => setUser(null));
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Protected routes */}
        <Route
          element={
            user ? (
              <ProtectedLayout user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<Shop user={user} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<SearchResults />} />
        </Route>

        {/* Public routes */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LogIn onLogIn={handleLogIn} />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <SignUp onSignUp={handleLogIn} />}
        />
      </Routes>
    </Router>
  );
}

function ProtectedLayout({ user, onLogout }) {
  return (
    <div>
      <Navbar onLogut={onLogout}/>
      <main>
        {/* <button onClick={onLogout}>Logout</button> */}
        <Outlet /> {/* This is where nested routes render */}
      </main>
    </div>
  );
}

function HomePage({ user, onLogout }) {
  return (
    <div>
      <Navbar />
      <main>
        {/* <h1>Welcome back, {user.username}</h1> */}
        <button onClick={onLogout}>Logout</button>
        
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </main>
    </div>
  );
}