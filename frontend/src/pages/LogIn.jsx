import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function LogIn({onLogIn}) {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const navigate = useNavigate(); 
    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }    
    async function handleSignIn(e) {
        e.preventDefault(); 
        const res = await fetch("http://localhost:5000/log-in", {
            credentials: "include",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok && data.user) {
        onLogIn(data.user);
    } else {
        alert(data.message || "Login failed");
    }
}

    return (
    <>
    <h1>Fake Amazon</h1>
    <form method="POST" onSubmit={handleSignIn}>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" placeholder="username" type="text" value={formData.username} onChange={handleChange}/>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={formData.password} onChange={handleChange}/>
        <button type="submit">Log In</button>
    </form>
    <p>Don’t have an account?{" "}</p>
    <button onClick={() => navigate("/signup")}>
    Sign Up
    </button>
    </>

    )

}