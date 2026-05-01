import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    // state to hold form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'visitor'
    });
    // state to hold error message
    const [error, setError] = useState('');
    // hook to navigate after successful signup
    const navigate = useNavigate();
    const link = "http://localhost:3000"

    // function to handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // making post request to backend to register user
            const response = await axios.post(`${link}/api/user/sign-in`, formData);
            if (response.data.message === "Email Alreay Exist!") {
                setError(response.data.message);
            } else {
                navigate('/login');
            }
        } catch {
            setError('An error occurred during signup');
        }
    };

    return (
        <div className="auth-container">
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                <input name="phone" placeholder="Phone" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                <select name="role" onChange={handleChange}>
                    <option value="visitor">Visitor</option>
                    <option value="employee">Employee</option>
                    <option value="security">Security</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit">Signup</button>
            </form>
            {error && <p className="error">{error}</p>}
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
};

export default Signup;
