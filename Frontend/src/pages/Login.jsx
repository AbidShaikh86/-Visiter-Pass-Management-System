import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    // states for email, password and error message
    const [email, setEmail] = useState('');
    // state to hold password input
    const [password, setPassword] = useState('');
    // state to hold error message
    const [error, setError] = useState('');
    // getting login function from context
    const { login } = useContext(AuthContext);
    // hook to navigate  
    const navigate = useNavigate();
    // backend link
    const link = 'http://localhost:3000'

    // function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        // resetting error message
        setError('');
        try {
            // making post request to backend to log in user
            const response = await axios.post(`${link}/api/user/log-in`, { email, password });
            // if login is successful, storing token and user info, then navigating to dashboard
            if (response.data.token) {
                // storing token in localStorage for authentication
                localStorage.setItem('token', response.data.token);
                // calling login function from context to update user state
                login(response.data.user);
                navigate('/');
            } else {
                setError(response.data.message || 'Login failed');
            }
        } catch {
            setError('An error occurred during login');
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Login</button>
            </form>
            {error && <p className="error">{error}</p>}
            <p>Don't have an account? <Link to="/signup">Signup</Link></p>
        </div>
    );
};

export default Login;
