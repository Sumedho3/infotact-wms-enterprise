import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from './AuthContext'; // 👈 UPDATED: Import the global auth engine hook

const Login = () => {
    const { loginService } = useAuth(); // 👈 UPDATED: Grab the login action from our global engine
    
    // Define component state hooks to manage user inputs and UI alerts
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle the form submission event
    const handleLoginSubmit = async (e) => {
        e.preventDefault(); // Prevents standard browser page reload on submit
        setError('');
        setLoading(true);

        try {
            // Post data to your Spring Boot login controller endpoint
            const response = await axiosClient.post('/api/auth/login', {
                username: username,
                password: password
            });

            // Extract token from response payload
            const jwtToken = response.data.token;

            if (jwtToken) {
                // 👈 UPDATED: Instead of using raw localStorage here, we pass it to our global engine!
                loginService(jwtToken, username); 
                alert('Login processed via global Auth Service!');
            }
        } catch (err) {
            // Handle bad credentials (401) or network failures gracefully
            if (err.response && err.response.status === 401) {
                setError('Invalid username or password. Please try again.');
            } else {
                setError('Unable to connect to the authentication server.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Render the UI form
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>WMS Enterprise Login</h2>
                
                {error && <div style={styles.errorAlert}>{error}</div>}

                <form onSubmit={handleLoginSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            required 
                            placeholder="Enter username"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required 
                            placeholder="Enter password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={loading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Embedded styling configuration object
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontFamily: 'Arial, sans-serif' },
    card: { width: '360px', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: '#fff' },
    title: { textAlign: 'center', marginBottom: '24px', color: '#333' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '6px', fontSize: '14px', color: '#666', fontWeight: 'bold' },
    input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px' },
    button: { width: '100%', padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
    buttonDisabled: { background: '#cccccc', cursor: 'not-allowed' },
    errorAlert: { padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f5c6cb', textAlign: 'center' }
};

export default Login;