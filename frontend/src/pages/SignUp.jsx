import { useNavigate } from "react-router-dom";
import { useState } from "react";
export default function SignUp({onSignUp}) {
    const [formData, setFormData] = useState({ username: "", password: "", phoneNum: "", email: "", address: ""});
    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }    
    const navigate = useNavigate(); 

    async function handleSignUp(e) {
        e.preventDefault(); 
        const res = await fetch("http://localhost:5000/sign-up", {
            credentials: "include",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok && data.user) {
            onSignUp(data.user);
            navigate("login"); 
        } else {
            alert(data.message || "Sign up failed");
        }
    }
    return (
    <>
    <form method="POST" onSubmit={handleSignUp}>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" value={formData.username} placeholder="username" type="text" maxLength={255} onChange={handleChange}  required/>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" value={formData.password} type="password" minLength={8} maxLength={255} onChange={handleChange} required/>
        <label htmlFor="phoneNum">Phone Number</label>
        <input id="phoneNum" name="phoneNum" value={formData.phoneNum} type="text" maxLength={255} onChange={handleChange} required/>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" value={formData.email} type="email"  maxLength={255} onChange={handleChange} required/>
        <label htmlFor="address">Address</label>
        <input id="address" name="address" value={formData.address} type="text" maxLength={255} onChange={handleChange} required/>
        <button type="submit">Sign Up</button>
    </form>
    <p>Or Login</p>
    <button onClick={() => navigate('/login')}>Log in</button>
    </>
    )
}

